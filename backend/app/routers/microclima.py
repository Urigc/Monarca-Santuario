from fastapi import APIRouter
from app.database import get_supabase

router = APIRouter(prefix="/api/v2", tags=["Microclima y Sectores"])


@router.get("/sectores")
def listar_sectores():
    """Capa 1: Delimitación Poligonal (Zonificación)."""
    supabase = get_supabase()
    return supabase.table("sectores_bosque").select("*").execute().data


@router.get("/microclima/actual")
def microclima_actual():
    """
    Capa 3: Semáforo de Riesgo Microclimático.
    Devuelve la última lectura por sector, ya clasificada en
    Verde / Naranja / Rojo según los umbrales de config.py.
    """
    supabase = get_supabase()
    registros = (
        supabase.table("registros_microclima")
        .select("*")
        .order("fecha_hora", desc=True)
        .execute()
        .data
    )
    # Se queda con la lectura más reciente por sector
    ultimos_por_sector = {}
    for r in registros:
        sid = r["id_sector"]
        if sid not in ultimos_por_sector:
            ultimos_por_sector[sid] = r
    return list(ultimos_por_sector.values())


@router.get("/ndvi/actual")
def ndvi_actual():
    """Capa 4: Superficie de Salud Forestal (Gradiente NDVI)."""
    supabase = get_supabase()
    registros = (
        supabase.table("salud_forestal_ndvi")
        .select("*")
        .order("fecha_analisis", desc=True)
        .execute()
        .data
    )
    ultimos_por_sector = {}
    for r in registros:
        sid = r["id_sector"]
        if sid not in ultimos_por_sector:
            ultimos_por_sector[sid] = r
    return list(ultimos_por_sector.values())


@router.get("/infraestructura")
def infraestructura_turistica():
    """Capa 5: Infraestructura Turística y Capacidad de Carga."""
    supabase = get_supabase()
    return supabase.table("infraestructura_turistica").select("*").execute().data


@router.get("/alertas")
def alertas_activas():
    """Capa 6/7 y disparador de Supabase Realtime en el cliente."""
    supabase = get_supabase()
    return (
        supabase.table("alertas_comunitarias")
        .select("*")
        .eq("estado", "Activa")
        .order("fecha_emision", desc=True)
        .execute()
        .data
    )
