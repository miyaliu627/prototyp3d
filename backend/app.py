from flask import Flask, request, jsonify
from flask_cors import CORS
from enum import Enum
import os
from prototyper import Prototyper
from debugger import debug_with_scrapybara
import scrapybara

app = Flask(__name__)
CORS(app)

prototyper = None

class MessageTypes(Enum):
    NEW_TICKET = "new_ticket"
    TICKET_COMPLETED = "ticket_completed"
    ERROR = "error"
    DEBUG = "debug"
    ITERATE = "iterate"
    COMPLETED = "completed"

@app.route('/prototype/create', methods=['POST'])
def prototype():
    global prototyper
    try:
        scrapybara_client = scrapybara.Scrapybara()
        scrapybara_instance = scrapybara_client.start_ubuntu(timeout_hours=0.2)

        data = request.get_json()
        user_prompt = data.get("user_prompt")
        project_name = data.get("project_name")
        
        if not user_prompt:
            return jsonify({"error": "Missing 'user_prompt' in request"}), 400
            
        prototyper = Prototyper(user_prompt, scrapybara_client, scrapybara_instance, name=project_name)
        
        prototyper.setup_repo()
        prototyper.repo_summary = "a 3D interactive scene using Three.js, featuring a large green ground plane, a sky-blue background, and a perspective camera positioned at human eye level. Users can navigate using WASD and arrow keys for movement and OrbitControls for mouse-based rotation. The scene includes ambient and directional lighting to enhance realism. "
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

            failure = debug_with_scrapybara(prototyper.repo_path, ticket.description, prototyper.scrapybara_client, prototyper.scrapybara_instance)
            if failure:
                ticket_responses.append({
                    "ticket": f"Completed ticket: {ticket.description}",
                    "internal_dialogue": response,
                    "debug": failure
                })
            else:
                ticket_responses.append({
                    "ticket": f"Completed ticket: {ticket.description}",
                    "internal_dialogue": response,
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
