from flask import Flask, request, jsonify, send_file
import os
from prototyper import Prototyper
# from debug_tool import full_debug_loop

app = Flask(__name__)

prototyper = None

@app.route('/prototype', methods=['POST'])
def prototype():
    global prototyper
    try:
        data = request.get_json()
        user_prompt = data.get("user_prompt")
        project_name = data.get("project_name")

        if not user_prompt:
            return jsonify({"error": "Missing 'user_prompt' in request"}), 400

        if prototyper is None:
            prototyper = Prototyper(user_prompt, name=project_name)
        
        prototyper.setup_repo()
        prototyper.summarize_repo()
        prototyper.create_tickets()

        for ticket in prototyper.tickets:
            response = ticket.complete(prototyper.repo_path, prototyper.repo_summary)
            print(f"[INFO] internal dialogue: {response}")
            # Run debug loop on the file
            # full_debug_loop(prototyper.file_path, ticket.description)

        if os.path.exists(prototyper.repo_path):
            return jsonify({
                "success": "Updated repo",
                "repo_path": prototyper.repo_path  # Return the repo path to the client
            }), 200
        else:
            return jsonify({"error": "Generated repository not found"}), 500

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
