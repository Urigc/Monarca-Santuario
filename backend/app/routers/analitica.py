from typing import List, Optional
from fastapi import APIRouter, Query
from app.database import get_supabase
from app.schemas import InsightOut
from app.services.insights_engine import generar_insights_semanales

router = APIRouter(prefix="/api/v2/analitica", tags=["Analítica e Insights"])


@router.get("/insights", response_model=List[InsightOut])
def obtener_insights(id_sector: Optional[int] = None, limit: int = Query(10, le=100)):
    """
    3.2 Consulta del Motor de Conclusiones.
    Retorna las narrativas automatizadas que cruzan NDVI vs anomalías
    térmicas nocturnas (Módulo de Analítica Avanzada, Sección 6).
    """
    supabase = get_supabase()
    query = (
        supabase.table("conclusiones_analitica")
        .select("id_conclusion, fecha_generacion, metrica_correlacionada, "
                "narrativa_insights, nivel_urgencia, sectores_bosque(nombre_sector)")
        .order("fecha_generacion", desc=True)
        .limit(limit)
    )
    if id_sector:
        query = query.eq("id_sector", id_sector)
    result = query.execute()

    salida = []
    for fila in result.data:
        salida.append({
            "id_conclusion": fila["id_conclusion"],
            "sector": (fila.get("sectores_bosque") or {}).get("nombre_sector", "Desconocido"),
            "metrica_correlacionada": fila.get("metrica_correlacionada"),
            "narrativa_insights": fila["narrativa_insights"],
            "nivel_urgencia": fila["nivel_urgencia"],
            "fecha_generacion": fila["fecha_generacion"],
        })
    return salida


@router.post("/insights/generar", response_model=List[InsightOut])
def forzar_generacion_insights():
    """
    Dispara manualmente el pipeline heurístico semanal
    (normalmente lo ejecuta el CRON job, Sección 6).
    """
    return generar_insights_semanales()


@router.get("/muestreo-lineal")
def muestreo_lineal(id_sector: int):
    """
    Devuelve serie temporal NDVI vs Anomalías Térmicas Nocturnas para
    graficar el módulo de Analítica Avanzada y Muestreo Lineal.
    """
    supabase = get_supabase()
    ndvi = (
        supabase.table("salud_forestal_ndvi")
        .select("fecha_analisis, valor_ndvi")
        .eq("id_sector", id_sector)
        .order("fecha_analisis")
        .execute()
        .data
    )
    clima = (
        supabase.table("registros_microclima")
        .select("fecha_hora, temperatura_c")
        .eq("id_sector", id_sector)
        .order("fecha_hora")
        .execute()
        .data
    )
    return {"ndvi_serie": ndvi, "temperatura_serie": clima}
