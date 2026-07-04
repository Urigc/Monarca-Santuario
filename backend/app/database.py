from supabase import create_client, Client
from app.config import settings


def get_supabase() -> Client:
    """
    Cliente único de Supabase.
    Todas las lecturas de usuarios finales pasan por aquí -> datos ya
    ingeridos localmente por el CRON, nunca directo a las APIs externas
    (Sección 3: Mapeador Proxy Intermedio).
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise RuntimeError(
            "SUPABASE_URL / SUPABASE_SERVICE_KEY no configurados. "
            "Copia .env.example a .env y completa tus credenciales."
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
