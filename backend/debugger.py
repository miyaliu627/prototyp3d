
import openai
import requests
from scrapybara import Scrapybara

import os
from dotenv import load_dotenv
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


load_dotenv()

SCRAPYBARA_API_KEY: str = os.getenv("SCRAPYBARA_API_KEY")  # type: ignore

scarpybara_client = Scrapybara(api_key=SCRAPYBARA_API_KEY)



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
        html_code = html_match.group(1).strip() if html_match else ""

        # Extract JS code between ***JS STARTS*** and ***JS ENDS***
        js_match = re.search(r'\*\*\*JS STARTS\*\*\*\s*(.*?)\s*\*\*\*JS ENDS\*\*\*', response_text, re.DOTALL)
        js_code = js_match.group(1).strip() if js_match else ""

        # Extract CSS code between ***CSS STARTS*** and ***CSS ENDS***
        css_match = re.search(r'\*\*\*CSS STARTS\*\*\*\s*(.*?)\s*\*\*\*CSS ENDS\*\*\*', response_text, re.DOTALL)
        css_code = css_match.group(1).strip() if css_match else ""

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

def debug_with_scrapy(html_path, js_path, css_path, ticket_description, instance, max_iterations = 2):

    # debug lol
    iterations = 0

    while iterations < max_iterations:
        try:
            with open(html_path, "r", encoding="utf-8") as file:
                html_code = file.read()
            with open(js_path, "r", encoding="utf-8") as file:
                js_code = file.read()
            with open(css_path, "r", encoding="utf-8") as file:
                css_code = file.read()
        except FileNotFoundError:
            print("Error: The file was not found.")
            return
        except Exception as e:
            print(f"Error reading file: {e}")
            return
        

        instance_paths = [("htmlFile.html",html_code), ("jsFile.js",js_code), ("cssFile.css", css_code)]
        for instance_path,code in instance_paths:
            instance.file.write(
                    path = instance_path,
                    content=code
                )
        #find files and run server
        path = instance.bash(command="find ~ -type f -name \"htmlFile.html\"")
        print(path)
        directory = os.path.dirname(path["output"])
        instance.bash(command=f'cd {directory}')

        # print(instance.bash(command = 'ls')["output"])
        # instance.bash(command="python3 -m http.server 8000")

        # server_url = "http://localhost:8000/htmlFile.html"
    


        try:
            response = scarpybara_client.act(
                model= Anthropic(),
                tools=[
                    BashTool(instance),
                    ComputerTool(instance),
                    EditTool(instance),
                ],
                system=UBUNTU_SYSTEM_PROMPT,
                prompt=f'an app contained by htmlFile.html, jsFile.js, and cssFile.css are in the directory {directory}. Please run this app. This is an app that should fulfill these requirements: {ticket_description} \n Please validate that the required features are existent and functional. For example, test if the required movement mechanics or desired objects are present in the scene. Report back with a rating from 1 to 10 of how well the rendered scene represents the requirements. Report any errors and requirements that the scene does not fulfill',
                on_step=lambda step: print(step.text),
            )
        except Exception as e:
            logging.error(f"ReSPONSE ERROR: {e}")


        logging.info(response.text)
        logging.info("Tested successfully using Scrapybara.")

        html_code, js_code, css_code= get_fix_suggestions(html_code, js_code, css_code, response.text)
        if html_code or js_code or css_code:
            update_code(html_path, html_code, js_path, js_code, css_path, css_code)
        else:
            logging.error("No fix suggestions received from image debug loop.")
        
        iterations+=1


    

# takes in html file path, javascript file path, css file path
def full_debug_loop(html_path: str, js_path: str, css_path: str, original_prompt: str, client: openai.Client) -> None:
    """Runs both code and image debugging loops."""

    try:
        try:
            instance = scarpybara_client.start_ubuntu(timeout_hours=1)
        except:
            logging.error(f"Scrapybara instance failed to start: {e}")
        
        logging.info("Starting full debug loop.")
        debug_with_scrapy(html_path, js_path, css_path, original_prompt,instance)
        logging.info("Full debug loop completed.")
        instance.stop()
    except Exception as e:
        logging.error(f"error in debug loop: {e}")


    
    


# if __name__ == "__main__":
#     html_file = "prototype.html"
#     original_prompt = "A futuristic cityscape with neon lights and a hovering car."
#     full_debug_loop(html_file, original_prompt)
