from flask import Flask, request, jsonify, send_file
import os
from prototyper import Prototyper  # Assuming Prototyper is defined in prototyper.py
# from debug_tool import full_debug_loop  # Assuming this function is in debug_tool.py

app = Flask(__name__)

prototyper = None

@app.route('/prototype', methods=['POST'])
def prototype():
    global prototyper
    try:
        data = request.get_json()
        user_prompt = data.get("user_prompt")

        if not user_prompt:
            return jsonify({"error": "Missing 'user_prompt' in request"}), 400

        if prototyper is None:
            prototyper = Prototyper(user_prompt)
        
        prototyper.summarize_repo()
        prototyper.create_tickets()

        for ticket in prototyper.tickets:
            response = ticket.complete(prototyper.repo_path)
            print(f"[INFO] internal dialogue: {response}")
            # Run debug loop on the file
            # full_debug_loop(prototyper.file_path, ticket.description)

        if os.path.exists(prototyper.code_path):
            return jsonify({"success": "Updated repo"}), 200
        else:
            return jsonify({"error": "Generated file not found"}), 500

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
