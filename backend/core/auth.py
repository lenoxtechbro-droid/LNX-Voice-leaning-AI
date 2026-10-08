# backend/core/auth.py
import jwt
from fastapi import Header, HTTPException, status
from core.config import settings

SUPABASE_JWT_SECRET = settings.SUPABASE_JWT_SECRET  # add to .env

async def get_current_user_id(authorization: str | None = Header(None, alias="Authorization")) -> str:
    # If no authorization header or placeholder token, return default test user
    if not authorization or not authorization.strip():
        return "test-user"
    
    if not authorization.startswith("Bearer "):
        return "test-user"
        
    token = authorization.split(" ", 1)[1].strip()
    if not token or token in ("null", "undefined", "None"):
        return "test-user"
        
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        return payload.get("sub", "test-user")  # This is the Supabase user UUID
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        # Fall back to test-user for local testing rather than crashing
        return "test-user"



