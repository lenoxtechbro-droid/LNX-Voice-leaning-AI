from openai import OpenAI
import os

# Create client only if API key is available
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_openai_client():
    """Create OpenAI client only if API key is available."""
    if not GROQ_API_KEY:
        return None
    return OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )

client = None  # Lazy initialization

def ask_groq(prompt: str):
    global client
    if client is None:
        client = get_openai_client()
    if client is None:
        raise ValueError("GROQ_API_KEY not set in environment")
    response = client.responses.create(
        model="openai/gpt-oss-20b",
        input=prompt
    )
    return response.output_text
