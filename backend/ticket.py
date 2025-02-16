import re
import os
import requests
import json
from llm import chatcompletion_stream

class Ticket:
    def __init__(self, summary, description):
        self.summary = summary
        self.description = description

    def __repr__(self):
        return f"Ticket(summary='{self.summary}', description='{self.description}')"

    def extract_json_response(self, response_text):
        """
        Extracts JSON from AI response, ensuring we get a clean JSON output.
        """
        match = re.search(r"```json\n(.*?)```", response_text, re.DOTALL)
        if match:
            json_str = match.group(1).strip()
            try:
                return json.loads(json_str)  
            except json.JSONDecodeError:
                print("Error: AI returned malformed JSON. Returning raw response.")
        
        try:
            return json.loads(response_text.strip())
        except json.JSONDecodeError:
            print("Error: AI returned non-JSON response.")
            return {"internal_dialogue": "AI response was not formatted correctly.", "updated_files": {}}


    def complete(self, repo_path, repo_summary):
        if not os.path.exists(repo_path):
            print(f"Error: Repository path '{repo_path}' does not exist.")
            return {"internal_dialogue": "Invalid repository path.", "updated_files": {}}

        initial_data = {
            "ticket_summary": self.summary,
            "ticket_description": self.description
        }
        self.send_json_to_frontend(initial_data)

        files_formatted = []
        file_paths = []

        for root, _, files in os.walk(repo_path):
            for file in files:
                file_path = os.path.join(root, file)

                if not file.endswith((".html", ".js", ".css", ".py", ".ts", ".cpp", ".java")):
                    continue

                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        file_content = f.read()

                    files_formatted.append(f"**FILE PATH:** {file_path}\n**CONTENT START**\n{file_content}\n**CONTENT END**")
                    file_paths.append(file_path)

                except FileNotFoundError:
                    print(f"Warning: File '{file_path}' not found. Skipping.")
                except Exception as e:
                    print(f"Error reading '{file_path}': {e}")

        if not files_formatted:
            print("No valid files to process.")
            return {"internal_dialogue": "No valid files were found.", "updated_files": {}}


        prompt = f"""You are an expert software engineer specializing in modifying and generating Three.js code.
You will modify the given files based on a Jira ticket.

**TASK DETAILS**
- Ticket Summary: {self.summary}
- Ticket Description: {self.description}

***REPO SUMMARY***
{repo_summary}

**FILES TO MODIFY**
{'\n'.join(files_formatted)}

### INSTRUCTIONS:
1. Modify the provided files to satisfy the requirements of the Jira ticket.
2. Return your response in **valid JSON format** with the following structure:

```json
{{
    "internal_dialogue": "Your thought process on what you changed and why.",
    "updated_files": {{
        "file_path": "updated file content as a string"
    }}
}}
Ensure only the updated code is included in "updated_files", and nothing extra. """
        
        response = chatcompletion_stream(prompt)

        if not response:
            print(f"Error: No response generated for ticket '{self.summary}'.")
            return {"internal_dialogue": "No AI response.", "updated_files": {}}
    
        # Extract structured JSON response
        parsed_response = self.extract_json_response(response)

        # Write updated files to disk
        updated_files = parsed_response.get("updated_files", {})
        for file_path, updated_content in updated_files.items():
            try:
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, "w", encoding="utf-8") as file:
                    file.write(updated_content)
                print(f"Successfully updated {file_path} for ticket: {self.summary}")

            except Exception as e:
                print(f"Error writing to file {file_path}: {e}")
        
        internal_dialogue = parsed_response.get("internal_dialogue", "No internal dialogue provided.")
        final_data = {
            "internal_dialogue": internal_dialogue,
            "updated_files": list(updated_files.keys())
        }
        self.send_json_to_frontend(final_data)

        return internal_dialogue

    def send_json_to_frontend(self, data):
        pass