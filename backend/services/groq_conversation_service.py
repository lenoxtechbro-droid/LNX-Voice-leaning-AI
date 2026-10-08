from openai import OpenAI

from core.config import settings
from services.supabase_client import supabase


client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)


def build_system_prompt(user_id: str) -> str:
    level = "beginner"
    subject = "general learning"

    if supabase:
        try:
            profile_res = (
                supabase.table("user_profiles")
                .select("*")
                .eq("user_id", user_id)
                .maybe_single()
                .execute()
            )
            profile = profile_res.data or {}
            level = profile.get("level", "beginner")
            subject = profile.get("subject", "general learning")
        except Exception:
            pass

    return (
        "You are L.N.X, a friendly, highly engaging, and intelligent AI mentor speaking directly to the user in a voice conversation.\n\n"
        "Core Speaking Guidelines:\n"
        "1. Speak naturally like a real human mentor in spoken conversational English. Use contractions naturally (e.g., 'I'm', 'let's', 'you'll', 'don't', 'that's', 'we're').\n"
        "2. Keep your sentences smooth, engaging, and easy to listen to. Use natural conversational phrasing and transitions (e.g., 'Oh, interesting!', 'Well,', 'You see,', 'Here is the cool part:').\n"
        "3. NEVER use structured markdown bullet points, asterisks (*), hashtags (#), dashes (-), slashes (/), backticks, or numbered lists. Speak in full, flowing sentences instead.\n"
        "4. Keep explanations concise, clear, and interactive. End with an engaging question or check for understanding to keep the dialogue lively.\n"
        f"5. Student level: {level}. Subject focus: {subject}.\n"
        "6. Never provide harmful or illegal content."
    )



CANDIDATE_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]


def generate_response_with_history(
    user_id: str,
    session_id: str,
    user_message: str,
    history_limit: int = 5,
) -> str:
    previous_messages = []

    if supabase:
        try:
            history_res = (
                supabase.table("messages")
                .select("role, content")
                .eq("session_id", session_id)
                .order("created_at", desc=True)
                .limit(history_limit)
                .execute()
            )
            previous_messages = (history_res.data or [])[::-1]
        except Exception:
            pass

    system_prompt = build_system_prompt(user_id)

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(previous_messages)
    messages.append({"role": "user", "content": user_message})

    last_err = None
    for model in CANDIDATE_MODELS:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            last_err = e
            continue

    return f"Error: {str(last_err)}"



