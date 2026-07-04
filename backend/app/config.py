import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Configuración centralizada del backend (Sección 4 y 8 del plano maestro)."""

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    INATURALIST_BASE_URL: str = os.getenv("INATURALIST_BASE_URL", "https://api.inaturalist.org/v1")
    COPERNICUS_CLIENT_ID: str = os.getenv("COPERNICUS_CLIENT_ID", "")
    COPERNICUS_CLIENT_SECRET: str = os.getenv("COPERNICUS_CLIENT_SECRET", "")

    SANTUARIO_LAT: float = float(os.getenv("SANTUARIO_LAT", "19.1186"))
    SANTUARIO_LNG: float = float(os.getenv("SANTUARIO_LNG", "-100.0411"))

    FRONTEND_ORIGIN: str = "https://mariposamonarca.netlify.app" 

    # Umbrales del Semáforo de Riesgo Microclimático (Sección 5, Capa 3)
    UMBRAL_VERDE_MIN = 10.0
    UMBRAL_VERDE_MAX = 15.0
    UMBRAL_NARANJA_TEMP = 4.0
    UMBRAL_ROJO_TEMP = 0.0

    # Umbral de nubosidad para descarte de imágenes NDVI (Sección 3)
    UMBRAL_NUBOSIDAD_MAX_PORCENTAJE = 15

    # Frecuencia del CRON de ingesta (Sección 8)
    CRON_INTERVALO_HORAS = 6


settings = Settings()
