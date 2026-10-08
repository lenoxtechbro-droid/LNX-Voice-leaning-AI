from supabase import create_client, Client

from core.config import settings


def get_supabase_client() -> Client | None:
    """Create Supabase client if credentials are available, otherwise return None."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


supabase = get_supabase_client()

