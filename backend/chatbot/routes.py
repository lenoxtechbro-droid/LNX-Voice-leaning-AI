from fastapi import APIRouter
from chatbot.schemas import ChatRequest
from chatbot.service import generate_response

router = APIRouter()

@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    reply = generate_response(request.message)
    return {"reply": reply}
