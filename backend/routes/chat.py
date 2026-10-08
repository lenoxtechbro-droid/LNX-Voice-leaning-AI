from fastapi import APIRouter
from models.chat_models import ChatRequest
from services.groq_service import generate_response

router = APIRouter()

@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    reply = generate_response(request.message)
    return {"reply": reply}
