import httpx
from app.config import settings

TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
STATS_URL = "https://sh.dataspace.copernicus.eu/api/v1/statistics"


async def _obtener_token() -> str:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": settings.COPERNICUS_CLIENT_ID,
                "client_secret": settings.COPERNICUS_CLIENT_SECRET,
            },
        )
        resp.raise_for_status()
        return resp.json()["access_token"]


async def obtener_ndvi_sector(bbox: list[float], fecha_desde: str, fecha_hasta: str,
                               ultimo_valor_valido: float | None = None):
    """
    Consulta el índice NDVI vía Sentinel Hub Statistics API para un sector.

    Mitigación (Sección 3): si la cobertura de nubes del pase satelital
    (revisita cada 5 días) supera UMBRAL_NUBOSIDAD_MAX_PORCENTAJE, se
    descarta la imagen y se retorna el último valor histórico válido en
    su lugar, evitando propagar errores de cálculo NDVI a la Capa 4.
    """
    token = await _obtener_token()
    evalscript = """
    //VERSION=3
    function setup() {
      return { input: ["B04", "B08", "dataMask"], output: { bands: 1 } };
    }
    function evaluatePixel(s) {
      let ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
      return [ndvi];
    }
    """
    payload = {
        "input": {
            "bounds": {"bbox": bbox},
            "data": [{
                "type": "sentinel-2-l2a",
                "dataFilter": {"maxCloudCoverage": settings.UMBRAL_NUBOSIDAD_MAX_PORCENTAJE},
            }],
        },
        "aggregation": {
            "timeRange": {"from": f"{fecha_desde}T00:00:00Z", "to": f"{fecha_hasta}T23:59:59Z"},
            "aggregationInterval": {"of": "P1D"},
            "evalscript": evalscript,
        },
    }
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(STATS_URL, json=payload, headers=headers)

    if resp.status_code != 200:
        # Nubosidad excesiva o fallo del servicio -> retención del último valor válido
        return {
            "valor_ndvi": ultimo_valor_valido,
            "alerta_deforestacion": False,
            "descartado_por_nubes": True,
        }

    data = resp.json()
    intervalos = data.get("data", [])
    if not intervalos:
        return {
            "valor_ndvi": ultimo_valor_valido,
            "alerta_deforestacion": False,
            "descartado_por_nubes": True,
        }

    valores = [
        i["outputs"]["default"]["bands"]["B0"]["stats"]["mean"]
        for i in intervalos
        if "outputs" in i
    ]
    if not valores:
        return {
            "valor_ndvi": ultimo_valor_valido,
            "alerta_deforestacion": False,
            "descartado_por_nubes": True,
        }

    promedio = sum(valores) / len(valores)
    alerta = (
        ultimo_valor_valido is not None
        and (ultimo_valor_valido - promedio) / abs(ultimo_valor_valido) > 0.08
    )  # caída súbita > 8% -> posible tala/plaga (ver Motor de Conclusiones)

    return {"valor_ndvi": round(promedio, 2), "alerta_deforestacion": alerta, "descartado_por_nubes": False}
