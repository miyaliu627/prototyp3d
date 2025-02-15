from llm import chatcompletion, chatcompletion_stream
import re
from debug_loop import full_debug_loop
import openai


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

    def complete(self, file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                code = file.read()
        except FileNotFoundError:
            print(f"Error: The file '{file_path}' was not found.")
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
        response = chatcompletion_stream(prompt, file_path)

        if not response:
            print(f"Error: No code generated for ticket '{self.summary}'.")
            return

        extracted_code = self.extract_code(response)

        try:
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(extracted_code)
            print(f"Successfully updated {file_path} for ticket: {self.summary}")
        except Exception as e:
            print(f"Error writing to file: {e}")


class Prototyper:
    def __init__(self, user_prompt):
        self.user_prompt = user_prompt
        self.tickets = []
        self.name = "3D Prototype"
        self.start_code_summary = "a 3D interactive scene using Three.js, featuring a large green ground plane, a sky-blue background, and a perspective camera positioned at human eye level. Users can navigate using WASD and arrow keys for movement and OrbitControls for mouse-based rotation. The scene includes ambient and directional lighting to enhance realism. "
        self.code_path = "./template.html"
        self.llm_client = openai.Client()

    def create_tickets(self):
        prompt = f"""You are an experienced software project manager and technical lead, specializing in breaking down complex user requirements into detailed, structured Jira tickets based on the instructions below. Your expertise includes defining clear, actionable, modular tasks.

    ***USER INPUT STARTS***
    {self.user_prompt}
    ***USER INPUT ENDS***

    ***STARTER CODE SUMMARY STARTS***
    {self.start_code_summary}
    ***STARTER CODE SUMMARY ENDS***

    ***INSTRUCTION STARTS***
    From the starter code, transform the user's natural language description of a virtual environment into a set of well-defined Jira-style tickets to create a web-renderable 3d prototype. Each ticket must be actionable, detailed, and structured for clear execution.

    First, analyze the provided description to break it down into individual tasks or features.

    Then, generate the subsequent jira tickets. Each ticket should include:
        - Summary: A concise title summarizing the task.
        - Description: A detailed explanation of what needs to be done.

    Return the tickets in structured JSON format following the template below.

    {{
    "project": "<Project Name>",
    "tickets": [
        {{
        "summary": "<Concise task title>",
        "description": "<Detailed explanation of the task, including objectives and scope>"
        }}
    ]
    }}
    ***TASK ENDS***"""
        response = chatcompletion(prompt)

        if not response or "tickets" not in response:
            print("Error: No tickets were generated.")
            return []

        tickets = [
            Ticket(ticket["summary"], ticket["description"])
            for ticket in response["tickets"]
        ]
        self.tickets = tickets


### ==================== TEST ==================== ###
# prototyper = Prototyper("Create an explorable 3D environment for my history class where you can walk through beautifully recreated ancient sites: The Great Pyramid of Giza, The Colosseum of Rome, The Great Wall of China, and Machu Picchu. When you click on the sites, it should show a description.")
# print(prototyper.create_tickets())

# client = openai.Client()
# ticket = Ticket(
#     "'Create 3D model of The Great Pyramid of Giza'",
#     "Develop a detailed 3D model of The Great Pyramid of Giza to be integrated into the Three.js environment. The model should accurately depict the pyramid's structure, textures, and scale in relation to the ground plane.",
# )
# ticket.complete(
#     "/Users/mimiyaya/Documents/github/treehacks2025/prototyp3d/template.html"
# )
# full_debug_loop(
#     "/Users/mimiyaya/Documents/github/treehacks2025/prototyp3d/template.html",
#     ticket.description, client,
# )
