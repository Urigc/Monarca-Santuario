from fastapi import APIRouter
from app.database import get_supabase

router = APIRouter(prefix="/api/v2/avistamientos", tags=["Avistamientos Monarca"])


@router.get("")
def listar_avistamientos(dias: int = 30):
    """
    Capa 2: Mapa de Calor de Avistamientos.
    Los datos ya fueron pre-filtrados por el CRON (Sección 3) para
    conservar únicamente registros iNaturalist con
    Quality Grade = 'Research', más los reportes ciudadanos verificados.
    """
    supabase = get_supabase()
    return (
        supabase.table("avistamientos_monarca")
        .select("*")
        .order("fecha_observacion", desc=True)
        .limit(500)
        .execute()
        .data
    )
