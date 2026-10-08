from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from core.auth import get_current_user_id
from services.supabase_client import supabase


router = APIRouter()


class StartSessionRequest(BaseModel):
    title: str | None = None


class StartSessionResponse(BaseModel):
    session_id: str


@router.post("/sessions/start", response_model=StartSessionResponse)
async def start_session(
    payload: StartSessionRequest,
    user_id: str = Depends(get_current_user_id),
):
    session_id = str(uuid4())

    if supabase:
        try:
            supabase.table("sessions").insert(
                {
                    "id": session_id,
                    "user_id": user_id,
                    "title": payload.title or "New session",
                }
            ).execute()
        except Exception as e:
            print(f"Notice: Supabase sessions insert skipped/failed: {e}")

    return StartSessionResponse(session_id=session_id)


