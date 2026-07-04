import httpx
from app.config import settings

TAXON_MARIPOSA_MONARCA = 48662  # Danaus plexippus en iNaturalist


async def obtener_avistamientos_validados(radio_km: int = 15):
    """
    Consulta iNaturalist restringida a Piedra Herrada.
    Mitigación de Vandalismo de Datos (Sección 3): sólo se aceptan
    observaciones con quality_grade == 'research'.
    """
    params = {
        "taxon_id": TAXON_MARIPOSA_MONARCA,
        "lat": settings.SANTUARIO_LAT,
        "lng": settings.SANTUARIO_LNG,
        "radius": radio_km,
        "quality_grade": "research",  # filtro estricto anti-vandalismo
        "per_page": 100,
        "order_by": "observed_on",
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(f"{settings.INATURALIST_BASE_URL}/observations", params=params)
        resp.raise_for_status()
        data = resp.json()

    resultados = []
    for obs in data.get("results", []):
        if obs.get("quality_grade") != "research":
            continue  # doble verificación defensiva
        geojson = obs.get("geojson") or {}
        coords = geojson.get("coordinates")
        if not coords:
            continue
        resultados.append({
            "fecha_observacion": obs.get("observed_on"),
            "latitud": coords[1],
            "longitud": coords[0],
            "conteo_estimado_clusters": 1,
            "fuente_origen": "iNaturalist",
            "observaciones": obs.get("description") or "Importado automáticamente vía CRON",
        })
    return resultados
