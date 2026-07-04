from typing import List
from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.schemas import ReporteComunitarioIn, ReporteComunitarioOut

router = APIRouter(prefix="/api/v2/reportes", tags=["Reportes Comunitarios"])


@router.post("/sync", response_model=List[ReporteComunitarioOut], status_code=201)
def sync_reportes(reportes: List[ReporteComunitarioIn]):
    """
    3.1 Sincronización masiva de reportes offline.
    Recibe el lote acumulado en IndexedDB del dispositivo móvil y lo
    inserta en Supabase con estado_validacion = 'Pendiente' por defecto,
    respetando la Gobernanza de la Voz del Santuario (Sección 6).
    """
    if not reportes:
        raise HTTPException(400, "El lote de reportes está vacío.")

    supabase = get_supabase()
    payload = [r.model_dump(exclude_none=True) for r in reportes]
    result = supabase.table("reportes_comunitarios").insert(payload).execute()

    if not result.data:
        raise HTTPException(502, "No se pudo insertar el lote en Supabase.")
    return result.data


@router.get("", response_model=List[ReporteComunitarioOut])
def listar_reportes(estado: str | None = None, id_sector: int | None = None):
    """Lista reportes comunitarios, opcionalmente filtrados por estado o sector."""
    supabase = get_supabase()
    query = supabase.table("reportes_comunitarios").select("*")
    if estado:
        query = query.eq("estado_validacion", estado)
    if id_sector:
        query = query.eq("id_sector", id_sector)
    result = query.order("fecha_creacion", desc=True).execute()
    return result.data
