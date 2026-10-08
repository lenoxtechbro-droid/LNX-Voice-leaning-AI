from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from core.auth import get_current_user_id
from services.groq_conversation_service import generate_response_with_history
from services.supabase_client import supabase


router = APIRouter()


class ConversationRequest(BaseModel):
    session_id: str
    message: str


class ConversationResponse(BaseModel):
    reply: str


@router.post("/chat/conversation", response_model=ConversationResponse)
async def chat_with_history(
    payload: ConversationRequest,
    user_id: str = Depends(get_current_user_id),
):
    if supabase:
        try:
            supabase.table("messages").insert(
                {
                    "session_id": payload.session_id,
                    "user_id": user_id,
                    "role": "user",
                    "content": payload.message,
                }
            ).execute()
        except Exception as e:
            print(f"Notice: Supabase message insert skipped/failed: {e}")

    try:
        reply = generate_response_with_history(
            user_id=user_id,
            session_id=payload.session_id,
            user_message=payload.message,
        )
    except Exception as e:
        print(f"Error in groq_conversation_service: {e}")
        from services.groq_service import generate_response
        reply = generate_response(payload.message)

    if supabase:
        try:
            supabase.table("messages").insert(
                {
                    "session_id": payload.session_id,
                    "user_id": user_id,
                    "role": "assistant",
                    "content": reply,
                }
            ).execute()
        except Exception as e:
            print(f"Notice: Supabase assistant message insert skipped/failed: {e}")

    return ConversationResponse(reply=reply)


