
from ticket import Ticket
import openai
import requests
from scrapybara import Scrapybara

import os
import logging
from scrapybara.anthropic import Anthropic
from scrapybara.tools import BashTool, ComputerTool, EditTool
from scrapybara.prompts import UBUNTU_SYSTEM_PROMPT
from playwright.sync_api import sync_playwright
import re

logging.basicConfig(
    filename="debug_loop.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
)


def get_fix_suggestions(html_code: str, js_code: str, css_code: str, error_info: str, model_name: str = "o3-mini") -> str:
    """Uses OpenAI API to suggest fixes for ESLint or image similarity issues."""
    try:
        response = openai.chat.completions.create(
            model=model_name,
            reasoning_effort='high',
            messages=[
                {
                    "role": "user",
                    "content": f"""
                    Provide debugging suggestions and code fixes for the following issue:
                    {error_info} based on the current html, js, and css.

                    ***HTML STARTS***
                    {html_code}
                    ***HTML ENDS***
                    ***JS STARTS***
                    {js_code}
                    ***JS ENDS***
                    ***CSS STARTS***
                    {css_code}
                    ***CSS ENDS***

                    Return the revised code in the following format:
                    ***HTML STARTS***
                    html code
                    ***HTML ENDS***
                    ***JS STARTS***
                    js code
                    ***JS ENDS***
                    ***CSS STARTS***
                    css code
                    ***CSS ENDS***
                    """,
                }
            ],
        )
        response_text = response.choices[0].message.content

        # Extract HTML code between ***HTML STARTS*** and ***HTML ENDS***
        html_match = re.search(r'\*\*\*HTML STARTS\*\*\*\s*(.*?)\s*\*\*\*HTML ENDS\*\*\*', response_text, re.DOTALL)
        html_code = html_match.group(1).strip() if html_match else html_code

        # Extract JS code between ***JS STARTS*** and ***JS ENDS***
        js_match = re.search(r'\*\*\*JS STARTS\*\*\*\s*(.*?)\s*\*\*\*JS ENDS\*\*\*', response_text, re.DOTALL)
        js_code = js_match.group(1).strip() if js_match else js_code

        # Extract CSS code between ***CSS STARTS*** and ***CSS ENDS***
        css_match = re.search(r'\*\*\*CSS STARTS\*\*\*\s*(.*?)\s*\*\*\*CSS ENDS\*\*\*', response_text, re.DOTALL)
        css_code = css_match.group(1).strip() if css_match else css_code

        return html_code, js_code, css_code
    except Exception as e:
        logging.error(f"OpenAI API error in get_fix_suggestions(): {e}")
        return "","",""


def update_code(html_path: str, html_code: str, js_path: str, js_code: str, css_path: str, css_code: str) -> None:
    """Writes the updated code to the HTML file."""
    try:
        with open(html_path, "w") as f:
            f.write(html_code)
        with open(js_path, "w") as f:
            f.write(js_code)
        with open(css_path, "w") as f:
            f.write(css_code)
        logging.info("Code updated successfully.")
    except Exception as e:
        logging.error(f"Failed to update code: {e}")


def rollback_to_last_version() -> None:
    """Attempts to roll back to the last working JavaScript version."""
    try:
        response = requests.get("/last-working-version")
        js_code = response.text
        exec(js_code)
        logging.info("Rolled back to the last working version.")
    except Exception as e:
        logging.error(f"Rollback failed: {e}")

def debug_with_scrapybara(repo_path, ticket_description, scrapybara_client, instance, max_iterations = 2):
    html_file = None
    js_file = None
    css_file = None

    # Walk through the directory
    for root, repo_path, files in os.walk(repo_path):
        for file_name in files:
            ext = os.path.splitext(file_name)[1].lower()
            full_path = os.path.join(root, file_name)

            if ext == ".html" and html_file is None:
                html_file = full_path
            elif ext == ".js" and js_file is None:
                js_file = full_path
            elif ext == ".css" and css_file is None:
                css_file = full_path

            if html_file and js_file and css_file:
                break
    
    iterations = 0

    while iterations < max_iterations:
        try:
            with open(html_file, "r", encoding="utf-8") as file:
                html_code = file.read()
            with open(js_file, "r", encoding="utf-8") as file:
                js_code = file.read()
            with open(css_file, "r", encoding="utf-8") as file:
                css_code = file.read()
        

            instance_paths = [("index.html",html_code), ("script.js",js_code), ("styling.css", css_code)]
            for instance_path,code in instance_paths:
                instance.file.write(
                        path = instance_path,
                        content=code
                    )
            #find files and run server
            path = instance.bash(command="find ~ -type f -name \"index.html\"")
            directory = os.path.dirname(path["output"])
            instance.bash(command=f'cd {directory}')

        
            response = scrapybara_client.act(
                model= Anthropic(),
                tools=[
                    BashTool(instance),
                    ComputerTool(instance),
                    EditTool(instance),
                ],
                system=UBUNTU_SYSTEM_PROMPT,
                prompt=f'an app contained by index.html, script.js, and styling.css are in the directory {directory}. This is an app that should fulfill these requirements: {ticket_description} \n Please run this app on a local host. Check that the features are working as requested by taking screenshots and validating that they match the description. Check that the functionality such as buttons actually work on press. Rate how closely the app aligns with the requirements based on your interactions with it from 1 to 10. Return a short summary of any missing requirements or errors and return the rating in the format ***RATING START*** x/10 ***RATING END***.',
                on_step=lambda step: print(step.text),
            )
        
            logging.info(response.text)
            logging.info("Tested successfully using Scrapybara.")

            rating = 0
            match = re.search(r'\*\*\*RATING START\*\*\*\s*(\d+)/10\s*\*\*\*RATING END\*\*\*', response.text)
            if match:
                rating = int(match.group(1))

            if rating < 7:
                html_code, js_code, css_code= get_fix_suggestions(html_code, js_code, css_code, response.text)
                update_code(html_file, html_code, js_file, js_code, css_file, css_code)
                iterations+=1  
            else:
                logging.error("No fix suggestions received from image debug loop.")
                break
        except FileNotFoundError:
            print("Error: The file was not found.")
            return
        except Exception as e:
            logging.error(f"Error reading file or responding: {e}")



# if __name__ == "__main__":
#     html_file = "prototype.html"
#     original_prompt = "A futuristic cityscape with neon lights and a hovering car."
#     full_debug_loop(html_file, original_prompt)



# client = Scrapybara()
# instance = client.start_ubuntu(timeout_hours=0.2)
# debug_with_scrapybara("static/trees", "Make the tree disappear when you click on them", client, instance)

