import re
import os
from llm import chatcompletion_stream

class Ticket:
    def __init__(self, summary, description):
        self.summary = summary
        self.description = description

    def __repr__(self):
        return f"Ticket(summary='{self.summary}', description='{self.description}')"

    def extract_code(self, response_text):
        """
        Extracts the actual HTML/JS code from the response, removing extra explanations.
        """
        # Try to extract code inside triple backticks (```html ... ```)
        match = re.search(
            r"```(?:html|javascript)?\n(.*?)```", response_text, re.DOTALL
        )
        if match:
            return match.group(1).strip() 

        match = re.search(r"<!DOCTYPE html>.*", response_text, re.DOTALL)
        if match:
            return match.group(0).strip()

        return response_text.strip()

    def complete(self, old_file_path, new_file_path):
        try:
            with open(old_file_path, "r", encoding="utf-8") as file:
                code = file.read()
        except FileNotFoundError:
            print(f"Error: The file '{old_file_path}' was not found.")
            return
        except Exception as e:
            print(f"Error reading file: {e}")
            return

        prompt = f"""You are an expert software engineer specializing in modifying and generating Three.js code. Your task is to implement the following Jira ticket by modifying or adding code to the given HTML/JavaScript:

**CURRENT CODEBASE START**
{code}
**CURRENT CODEBASE END**

**JIRA TICKET START**
{self.description}
**JIRA TICKET END**

**TASK INSTRUCTION START**
Implement the ticket by modifying or adding code to the current codebase. Return as a single HTML/JavaScript file.
"""
        response = chatcompletion_stream(prompt, old_file_path)

        if not response:
            print(f"Error: No code generated for ticket '{self.summary}'.")
            return

        extracted_code = self.extract_code(response)

        try:
            os.makedirs(os.path.dirname(new_file_path), exist_ok=True)

            with open(new_file_path, "w", encoding="utf-8") as file:
                file.write(extracted_code)
            print(f"Successfully updated {new_file_path} for ticket: {self.summary}")
        except Exception as e:
            print(f"Error writing to file: {e}")
