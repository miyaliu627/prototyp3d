import json
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
from enum import Enum
import os
try:
    from .prototyper import Prototyper
    from .debugger import debug_with_scrapybara
except:
    from prototyper import Prototyper
    from debugger import debug_with_scrapybara
    
import scrapybara

load_dotenv(dotenv_path="../.env")

BACKEND_URL = os.getenv("NGROK_BACKEND", "http://localhost:5001")  # ✅ Use correct env var
print(f"Using BACKEND_URL: {BACKEND_URL}")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SCRAPYBARA_API_KEY = os.getenv("SCRAPYBARA_API_KEY")

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})
prototyper = None
progress_messages = []

class MessageTypes(Enum):
    SETTING_UP = "setting_up"
    NEW_TICKET = "new_ticket"
    TICKET_COMPLETED = "ticket_completed"
    ERROR = "error"
    DEBUG = "debug"
    ITERATE = "iterate"
    COMPLETED = "completed"

@app.route('/prototype/create', methods=['POST'])
def prototype():
    global prototyper
    global progress_messages
    try:
        scrapybara_client = scrapybara.Scrapybara()
        scrapybara_instance = scrapybara_client.start_ubuntu(timeout_hours=0.2)

        data = request.get_json()
        user_prompt = data.get("user_prompt")
        project_name = data.get("project_name")
        
        if not user_prompt:
            return jsonify({"error": "Missing 'user_prompt' in request"}), 400
            
        progress_messages.clear()

        prototyper = Prototyper(user_prompt, scrapybara_client, scrapybara_instance, name=project_name)
        
        progress_messages.append({
            "type": MessageTypes.SETTING_UP.value,
            "message": "I am setting up the repository..."
        })
        prototyper.setup_repo()
        progress_messages.append({
            "type": MessageTypes.SETTING_UP.value,
            "message": "I have finished setting up the initial repository!"
        })
        prototyper.repo_summary = "a 3D interactive scene using Three.js, featuring a large green ground plane, a sky-blue background, and a perspective camera positioned at human eye level. Users can navigate using WASD and arrow keys for movement and OrbitControls for mouse-based rotation. The scene includes ambient and directional lighting to enhance realism. "
        
        progress_messages.append({
            "type": MessageTypes.SETTING_UP.value,
            "message": "I am creating the tickets for this project..."
        })
        prototyper.create_tickets()
        progress_messages.append({
            "type": MessageTypes.SETTING_UP.value,
            "message": f"I have created {len(prototyper.tickets)} tickets for this project."
        })
        
        # Store all ticket data
        ticket_responses = []
        
        for ticket in prototyper.tickets:
            # send initial data for the ticket to frontend
            progress_messages.append({
                "type": MessageTypes.NEW_TICKET.value,
                "message": f"Working on ticket: {ticket.description}"
            })
            
            response = ticket.complete(prototyper.repo_path, prototyper.repo_summary)

            failure = debug_with_scrapybara(prototyper.repo_path, ticket.description, prototyper.scrapybara_client, prototyper.scrapybara_instance)
            if failure:
                progress_messages.append({
                    "type": MessageTypes.DEBUG.value,
                    "message": f"Unable to debug output for {ticket.description}... aborting process right now",
                })
                raise Exception("Debugging failed")
            else:
                ticket_responses.append({
                    "ticket": f"Completed ticket: {ticket.description}",
                    "internal_dialogue": response,
                })
                progress_messages.append({
                    "type": MessageTypes.TICKET_COMPLETED.value,
                    "message": f"Finished ticket: {ticket.description}",
                    "details": response
                })
        
        progress_messages.append({
            "type": MessageTypes.COMPLETED.value,
            "message": "All tickets completed!"
        })

        if os.path.exists(prototyper.repo_path):
            return jsonify({
                "success": "Created repo",
                "repo_path": prototyper.repo_path,
                "ticket_responses": ticket_responses
            }), 200
        else:
            return jsonify({"error": "Generated repository not found"}), 500
            
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    

@app.route('/prototype/iterate', methods=['POST'])
def iterate():
    global prototyper
    try:
        data = request.get_json()
        user_prompt = data.get("user_prompt")
        
        if not user_prompt:
            return jsonify({"error": "Missing 'user_prompt' in request"}), 400
        
        prototyper.summarize_repo()
        prototyper.create_tickets()
        
        # Store all ticket data
        ticket_responses = []
        
        for ticket in prototyper.tickets:
            # send initial data for the ticket to frontend
            initial_data = {
                "type": MessageTypes.NEW_TICKET.value,
                "message": f"I am working on completing the following ticket: {ticket.description}",
            }
            
            response = ticket.complete(prototyper.repo_path, prototyper.repo_summary)
            
            final_data = {
                "type": MessageTypes.TICKET_COMPLETED.value,
                "message": response
            }
            
            ticket_responses.append({
                "ticket": f"Completed ticket: {ticket.description}",
                "internal_dialogue": response,
            })
        
        if os.path.exists(prototyper.repo_path):
            return jsonify({
                "success": "Updated repo",
                "repo_path": prototyper.repo_path,
                "ticket_responses": ticket_responses
            }), 200
        else:
            return jsonify({"error": "Generated repository not found"}), 500
            
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route('/prototype/progress', methods=['GET'])
def prototype_progress():
    def event_stream():
        last_index = 0
        while True:
            while last_index < len(progress_messages):
                msg = progress_messages[last_index]
                last_index += 1

                yield f"data: {json.dumps(msg)}\n\n"
                print(f"[INFO] yield {last_index-1}th progress message: {msg}")
            import time
            time.sleep(0.5)

    return Response(stream_with_context(event_stream()), mimetype='text/event-stream')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
