import base64
import os
import logging
from typing import Optional, Callable, Tuple
from scrapybara import Scrapybara
from scrapybara.anthropic import Anthropic
from scrapybara.tools import BashTool, ComputerTool, EditTool
from scrapybara.prompts import UBUNTU_SYSTEM_PROMPT


def scrapybara_debugger(project_name, repo_path, ticket_description, client, max_iterations = 1):
    iterations = 0
    while iterations < max_iterations:
        try:
            if not os.path.exists(repo_path):
                print(f"[ERROR] Repository path '{repo_path}' does not exist.")
                return {"error": "Invalid repository path."} 
            instance = client.start_ubuntu(timeout_hours=0.2)
            print(f"[INFO] Creating project directory '{project_name}' in Scrapybara...")
            instance.bash(command=f"mkdir -p {project_name}")
            
            print(f"[INFO] Uploading files to {project_name}...")
            uploaded_files = []
            for root, _, files in os.walk(repo_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, repo_path)
                    vm_file_path = os.path.join(project_name, relative_path)

                    with open(file_path, "r", encoding="utf-8") as f:
                        file_content = f.read()

                    instance.bash(command=f"mkdir -p {os.path.dirname(vm_file_path)}")

                    instance.file.write(path=vm_file_path, content=file_content)
                    uploaded_files.append(vm_file_path)

            print(f"[INFO] Successfully uploaded {len(uploaded_files)} files to {project_name}")

            main_file = next((f for f in uploaded_files if f.endswith("index.html")), None)
            if not main_file:
                main_file = next((f for f in uploaded_files if f.endswith("main.js")), None)
            if not main_file:
                print("[ERROR] No main entry file found.")
                return {"error": "No main entry file found."}
            print(f"[INFO] Opening '{main_file}' in Scrapybara browser...")
            instance.bash(command=f'cd {project_name}')

            print("[INFO] Generating tests for the goal...")
            response = client.act(
                model= Anthropic(),
                tools=[
                    BashTool(instance),
                    ComputerTool(instance),
                    EditTool(instance),
                ],
                system=UBUNTU_SYSTEM_PROMPT,
                prompt=f'an app contained by index.html, script.js, and styling.css are in the directory {project_name}. Please run this app. This is an app that should fulfill these requirements: {ticket_description} \n Please validate that the required features are existent and functional. For example, test if the required movement mechanics or desired objects are present in the scene. Report back with a rating from 1 to 10 of how well the rendered scene represents the requirements. Report any errors and requirements that the scene does not fulfill',
                on_step=lambda step: print(step.text),
            )

            logging.info(response.text)
            logging.info("Tested successfully using Scrapybara.")
            iterations += 1
        except Exception as e:
            print(f"[ERROR] An error occurred: {e}")
            instance.stop()
            return {"error": str(e)}
    instance.stop()
    
client = Scrapybara()
scrapybara_debugger("trees", "static/trees", "Create a forest with trees", client)

instance_id = 's-627a70d2'