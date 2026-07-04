import httpx
from app.config import settings

BASE_URL = "https://api.openweathermap.org/data/2.5/weather"


def clasificar_riesgo_congelacion(temp_c: float, humedad: int) -> str:
    """
    Capa 3 del mapa: Semáforo de Riesgo Microclimático.
    ■ Rojo: < 0°C con frentes fríos -> Crítico
    ■ Naranja: < 4°C o baja humedad -> Moderado
    ■ Verde: 10°C - 15°C -> Bajo (óptimo)
    """
    if temp_c < settings.UMBRAL_ROJO_TEMP:
        return "Crítico"
    if temp_c < settings.UMBRAL_NARANJA_TEMP or humedad < 30:
        return "Moderado"
    return "Bajo"


async def obtener_clima_actual(lat: float, lng: float):
    """
    Consulta OpenWeather para un sector puntual.
    El CRON llama esto una vez cada 6h por sector (Sección 3), nunca
    directamente desde el cliente, para respetar el rate limit gratuito
    de 60 llamadas/min.
    """
    params = {
        "lat": lat,
        "lon": lng,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
        "lang": "es",
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(BASE_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    temp_c = data["main"]["temp"]
    humedad = data["main"]["humidity"]
    precipitacion = data.get("rain", {}).get("1h", 0.0)

    return {
        "temperatura_c": temp_c,
        "humedad_relativa": humedad,
        "precipitacion_mm": precipitacion,
        "riesgo_congelacion": clasificar_riesgo_congelacion(temp_c, humedad),
        "fuente_api": "OpenWeatherAPI",
    }
