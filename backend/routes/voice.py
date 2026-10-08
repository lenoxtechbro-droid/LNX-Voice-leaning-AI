from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from core.auth import get_current_user_id
from core.config import settings
from services.elevenlabs_service import text_to_speech

import httpx


router = APIRouter()


class TTSRequest(BaseModel):
    text: str
    voice_id: str


@router.post("/voice/tts")
async def tts(
    payload: TTSRequest,
    user_id: str = Depends(get_current_user_id),
):
    audio_bytes = text_to_speech(payload.text, payload.voice_id)
    if not audio_bytes:
        return StreamingResponse(
            iter([b""]),
            media_type="audio/mpeg",
            headers={"Content-Disposition": 'inline; filename="voice.mp3"'},
        )
    return StreamingResponse(
        iter([audio_bytes]),
        media_type="audio/mpeg",
        headers={"Content-Disposition": 'inline; filename="voice.mp3"'},
    )




@router.post("/voice/stt")
async def stt(
    audio: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    audio_bytes = await audio.read()
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
            files={"file": (audio.filename, audio_bytes, audio.content_type)},
            data={"model": "whisper-large-v3"},
        )
    result = response.json()
    return {"text": result.get("text", "")}


