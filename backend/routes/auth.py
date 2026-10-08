from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional

from core.auth import get_current_user_id
from services.supabase_client import supabase
from core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup(request: SignupRequest):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    try:
        result = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
        })
        if result.user:
            return {"user": result.user, "session": result.session}
        else:
            raise HTTPException(status_code=400, detail=result.error.message if result.error else "Signup failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(request: LoginRequest):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    try:
        result = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
        if result.user:
            return {"user": result.user, "session": result.session}
        else:
            raise HTTPException(status_code=401, detail=result.error.message if result.error else "Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/logout")
async def logout(user_id: str = Depends(get_current_user_id)):
    # Supabase logout handled client-side by clearing token
    return {"message": "Logout successful"}

@router.get("/user")
async def get_user(user_id: str = Depends(get_current_user_id)):
    # Fetch user profile from Supabase if needed
    return {"user_id": user_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(router, host="0.0.0.0", port=8000)

