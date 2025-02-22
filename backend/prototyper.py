import shutil
try:
    from .llm import chatcompletion
    from .ticket import Ticket
    from .debugger import debug_with_scrapybara
except:
    from llm import chatcompletion
    from ticket import Ticket
    from debugger import debug_with_scrapybara
    
import scrapybara
import openai
import os
import uuid


class Prototyper:
    def __init__(self, user_prompt, scrapybara_client, instance, name=None):
        self.name = name or str(uuid.uuid4())
        self.user_prompt = user_prompt
        self.tickets = []
        self.repo_summary = None
        self.repo_path = os.path.join("../frontend/static/product")
        self.llm_client = openai.Client()
        self.scrapybara_client = scrapybara_client
        self.scrapybara_instance = instance


    def setup_repo(self):
        template_path = "../frontend/static/template"

        if not os.path.exists(template_path):
            raise Exception(f"Template folder '{template_path}' not found. Aborting.")

        try:
            destination = "../frontend/static/product"
            if os.path.exists(destination):
                shutil.rmtree(destination)
            shutil.copytree(template_path, self.repo_path)
            print(f"[SUCCESS] Created repository at '{self.repo_path}' from template.")

        except Exception as e:
            raise Exception(f"Failed to create repository: {e}")

    def create_tickets(self):
        prompt = f"""You are an experienced software project manager and technical lead, specializing in breaking down complex user requirements into 5 detailed, structured Jira tickets based on the instructions below. Your expertise includes defining clear, actionable, modular tasks.

    ***USER INPUT STARTS***
    {self.user_prompt}
    ***USER INPUT ENDS***

    ***CODEBASE SUMMARY STARTS***
    {self.repo_summary}
    ***CODEBASE SUMMARY ENDS***

    ***INSTRUCTION STARTS***
    From the current codebase, transform the user's natural language description of a virtual environment into a set of well-scoped Jira-style tickets to create a web-renderable 3d prototype. Each ticket must be actionable, detailed, and structured for clear execution. The number of tickets should be dependent on the complexity of the user goal.

    First, analyze the provided description to break it down into individual tasks or features.

    Then, generate a set of subsequent jira tickets. Each ticket should include:
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
        print(f"[INFO] Created {len(tickets)} tickets.")
        self.tickets = tickets[:5] #first 5 tickets only for now

    def summarize_repo(self):
        repo_code = []

        for root, _, files in os.walk(self.repo_path):
            for file in files:
                file_path = os.path.join(root, file)

                if not file.endswith((".py", ".js", ".ts", ".java", ".cpp", ".cs", ".html", ".css")):
                    continue
                
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        code_content = f.read()

                    formatted_code = f"""
    File: {file_path}
    Content:
    -----------
    {code_content}
    -----------
    """
                    repo_code.append(formatted_code)

                except Exception as e:
                    print(f"Error reading {file_path}: {e}")

        code_snippets = "\n".join(repo_code)

        prompt = f"""
    You are an expert software engineer specializing in analyzing and summarizing code.
    Your task is to analyze the given codebase and provide a concise summary of its functionality.

    ***CODE STARTS***
    {code_snippets}
    ***CODE ENDS***

    ###Instructions STARTS###
    - Provide a structured summary that explains the purpose and functionality of the codebase.
    - Return your response in the following JSON format:

    ```json
    {{
        "summary": "<Concise code summary here>"
    }}
    ###Instructions ENDS###
    """

        response = chatcompletion(prompt)
        if not response or "summary" not in response:
            print("Error: No summary was generated.")
            return ""
        
        self.repo_summary = response["summary"]

