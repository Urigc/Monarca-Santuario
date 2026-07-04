from fastapi import APIRouter
from app.database import get_supabase

router = APIRouter(prefix="/api/v2/siniestros", tags=["Siniestros e Incendios"])


@router.get("")
def listar_siniestros():
    """Capa 7: Siniestros e Incendios — polígonos de áreas devastadas."""
    supabase = get_supabase()
    return supabase.table("siniestros_incendios").select("*").execute().data


@router.get("/brechas-cortafuego")
def listar_brechas():
    """Capa 7: Líneas de brechas cortafuego activas mantenidas por ejidatarios."""
    supabase = get_supabase()
    return (
        supabase.table("brechas_cortafuego")
        .select("*")
        .eq("activa", True)
        .execute()
        .data
    )


@router.get("/auditoria-forestal")
def auditoria_forestal_comunitaria():
    """
    Capa 6: Auditoría Forestal Comunitaria.
    Reutiliza reportes_comunitarios filtrando por los tipos relevantes
    de tala clandestina / basura (decisión documentada en 03_migracion_v2.1.sql).
    """
    supabase = get_supabase()
    return (
        supabase.table("reportes_comunitarios")
        .select("*")
        .in_("tipo_suceso", ["Avistamiento tala", "Basura", "Plaga descortezador"])
        .execute()
        .data
    )
