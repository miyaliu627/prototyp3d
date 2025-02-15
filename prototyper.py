from llm import chatcompletion
from ticket import Ticket
# from debug_loop import full_debug_loop
import openai


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

client = openai.Client()
# pyramid_ticket = Ticket(
#     "'Create 3D model of The Great Pyramid of Giza'",
#     "Develop a detailed 3D model of The Great Pyramid of Giza to be integrated into the Three.js environment. The model should accurately depict the pyramid's structure, textures, and scale in relation to the ground plane.",
# )
simple_ticket = Ticket(
    "'Create trees",
    "Add green trees to the Three.js environment",
)

simple_ticket.complete(
    "/Users/mimiyaya/Documents/github/prototyp3d/template.html",
    "/Users/mimiyaya/Documents/github/prototyp3d/pyramid.html"
)
# full_debug_loop(
#     "/Users/mimiyaya/Documents/github/treehacks2025/prototyp3d/template.html",
#     ticket.description, client,
# )
