import openai
import json
import re

client = openai.Client()


def chatcompletion(user_prompt, system_prompt=""):
    try:
        response = client.chat.completions.create(
            model="o3-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        message_content = response.choices[0].message.content

        json_match = re.search(r"\{.*\}", message_content, re.DOTALL)
        if not json_match:
            print("Error: No valid JSON found in response.")
            return {}

        message_content = json_match.group(0)
        if "'" in message_content and '"' not in message_content:
            message_content = message_content.replace("'", '"')

        return json.loads(message_content)

    except openai.RateLimitError as e:
        print(f"RateLimitError: {e}")
    except json.JSONDecodeError:
        return {}
    except Exception as e:
        print(f"Error: {e}")
        return {}
    return {}


def chatcompletion_stream(user_prompt, system_prompt=""):
    try:
        response = client.chat.completions.create(
            model="o3-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            stream=True,
        )

        accumulated_response = ""

        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                accumulated_response += chunk.choices[0].delta.content

        return accumulated_response.strip()

    except openai.RateLimitError as e:
        print(f"RateLimitError: {e}")
    except Exception as e:
        print(f"Error: {e}")
