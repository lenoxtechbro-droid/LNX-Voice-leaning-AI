import os
from pydantic_settings import BaseSettings, SettingsConfigDict

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, ".env")

class Settings(BaseSettings):
    GROQ_API_KEY: str
    ELEVENLABS_API_KEY: str | None = None
    SUPABASE_URL: str | None = None
    SUPABASE_SERVICE_KEY: str | None = None
    SUPABASE_JWT_SECRET: str | None = None

    model_config = SettingsConfigDict(
        env_file=(env_path, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Backwards-compatible export for existing imports
GROQ_API_KEY = settings.GROQ_API_KEY


