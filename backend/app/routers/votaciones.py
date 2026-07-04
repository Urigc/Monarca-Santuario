from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.schemas import VotoEjidalIn, VotoEjidalOut

router = APIRouter(prefix="/api/v2/reportes", tags=["Validación Cruzada Ejidal"])

# Umbral simple de consenso: con 2 votos positivos netos se marca 'Verificado',
# con 2 votos negativos netos se marca 'Falso'. Ajustable según la asamblea.
UMBRAL_CONSENSO = 2


@router.post("/{id_reporte}/votar", response_model=VotoEjidalOut, status_code=201)
def votar_reporte(id_reporte: int, voto: VotoEjidalIn):
    """
    3.3 Sistema de Votación Cruzada Ejidal.
    Registra el voto de un miembro del comité y recalcula el estado del
    reporte para blindar contra el Vandalismo de Datos (Sección 3).
    """
    supabase = get_supabase()

    reporte = (
        supabase.table("reportes_comunitarios")
        .select("id_reporte, estado_validacion")
        .eq("id_reporte", id_reporte)
        .execute()
    )
    if not reporte.data:
        raise HTTPException(404, "Reporte no encontrado.")

    try:
        insercion = (
            supabase.table("validaciones_ejidales")
            .insert({
                "id_reporte": id_reporte,
                "validador_credencial": voto.validador_credencial,
                "voto_positivo": voto.voto_positivo,
                "comentario_revision": voto.comentario_revision,
            })
            .execute()
        )
    except Exception as exc:
        # UNIQUE(id_reporte, validador_credencial) impide doble voto
        raise HTTPException(409, f"Este validador ya emitió un voto para este reporte. ({exc})")

    votos = (
        supabase.table("validaciones_ejidales")
        .select("voto_positivo")
        .eq("id_reporte", id_reporte)
        .execute()
        .data
    )
    positivos = sum(1 for v in votos if v["voto_positivo"])
    negativos = sum(1 for v in votos if not v["voto_positivo"])

    nuevo_estado = "Pendiente"
    if positivos - negativos >= UMBRAL_CONSENSO:
        nuevo_estado = "Verificado"
    elif negativos - positivos >= UMBRAL_CONSENSO:
        nuevo_estado = "Falso"

    if nuevo_estado != "Pendiente":
        supabase.table("reportes_comunitarios").update(
            {"estado_validacion": nuevo_estado}
        ).eq("id_reporte", id_reporte).execute()

    return {
        "id_validacion": insercion.data[0]["id_validacion"],
        "id_reporte": id_reporte,
        "estado_actual_reporte": nuevo_estado,
    }
