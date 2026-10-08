from openai import OpenAI
from core.config import GROQ_API_KEY

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

CANDIDATE_MODELS = [
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "allam-2-7b",
]

def generate_response(message: str):
    messages = [
        {"role": "system", "content": "You are L.N.X, a friendly, engaging AI mentor speaking in a voice conversation. Speak naturally in conversational English using contractions (like I'm, let's, you'll) and smooth transitions. Never use bullet points, asterisks (*), dashes (-), slashes (/), or numbered lists. Keep responses concise, clear, and interactive."},
        {"role": "user", "content": message}
    ]
    last_err = None
    for model in CANDIDATE_MODELS:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
            )
            return response.choices[0].message.content
        except Exception as e:
            last_err = e
            continue
    return f"Error: {str(last_err)}"

