from typing import List
from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.schemas import ContenidoEducativoOut, FloraOut, ProgresoIn, BadgeOut

router = APIRouter(prefix="/api/v2/educacion", tags=["Biblioteca del Bosque"])

# Reglas de desbloqueo de la Ruta de Aprendizaje Gamificada (Sección "Pilar 1").
# Sin quizzes: el progreso se mide por CONTENIDOS VISTOS, no por examen.
REGLAS_BADGES = {
    "GUARDIAN_NOVATO": {"nivel_contenido": "basico", "minimo_completado": 1},
    "PROTECTOR_EXPERTO": {"nivel_contenido": "intermedio", "minimo_completado": "todos"},
    "EMBAJADOR_MONARCA": {"nivel_contenido": "avanzado", "minimo_completado": "todos"},
}


@router.get("/contenidos", response_model=List[ContenidoEducativoOut])
def listar_contenidos(nivel: str | None = None, tipo: str | None = None):
    """Enciclopedia Multimedia Interactiva: lista contenidos por nivel/tipo."""
    supabase = get_supabase()
    query = supabase.table("contenidos_educativos").select("*")
    if nivel:
        query = query.eq("nivel", nivel)
    if tipo:
        query = query.eq("tipo", tipo)
    return query.order("orden_secuencial").execute().data


@router.get("/flora", response_model=List[FloraOut])
def listar_flora():
    """Galería de flora del santuario, base de datos para el matching de IA."""
    supabase = get_supabase()
    return supabase.table("flora_santuario").select("*").execute().data


@router.post("/progreso", status_code=201)
def registrar_progreso(progreso: ProgresoIn):
    """
    Marca un contenido como visto y evalúa si corresponde otorgar un
    nuevo badge (Ruta de Aprendizaje Gamificada, sin quizzes).
    """
    supabase = get_supabase()
    try:
        supabase.table("progreso_contenidos").insert(progreso.model_dump()).execute()
    except Exception:
        pass  # ya estaba marcado como visto (UNIQUE) -> no es un error

    nuevos_badges = _evaluar_y_otorgar_badges(supabase, progreso.usuario_identificador)
    return {"nuevos_badges": nuevos_badges}


@router.get("/badges/{usuario_identificador}", response_model=List[BadgeOut])
def listar_badges_usuario(usuario_identificador: str):
    """Catálogo completo de badges, marcando cuáles ya obtuvo el usuario."""
    supabase = get_supabase()
    catalogo = supabase.table("catalogo_badges").select("*").execute().data
    obtenidos = (
        supabase.table("user_badges")
        .select("id_badge, fecha_obtencion")
        .eq("usuario_identificador", usuario_identificador)
        .execute()
        .data
    )
    mapa_obtenidos = {o["id_badge"]: o["fecha_obtencion"] for o in obtenidos}

    return [
        {
            **b,
            "obtenido": b["id_badge"] in mapa_obtenidos,
            "fecha_obtencion": mapa_obtenidos.get(b["id_badge"]),
        }
        for b in catalogo
    ]


def _evaluar_y_otorgar_badges(supabase, usuario_identificador: str) -> List[dict]:
    """Heurística simple de gamificación sin exámenes: cuenta contenidos
    vistos por nivel y compara contra el total disponible por nivel."""
    vistos = (
        supabase.table("progreso_contenidos")
        .select("id_contenido")
        .eq("usuario_identificador", usuario_identificador)
        .execute()
        .data
    )
    ids_vistos = {v["id_contenido"] for v in vistos}
    if not ids_vistos:
        return []

    contenidos = supabase.table("contenidos_educativos").select("id_contenido, nivel").execute().data
    por_nivel = {}
    for c in contenidos:
        por_nivel.setdefault(c["nivel"], []).append(c["id_contenido"])

    ya_otorgados = {
        b["id_badge"]
        for b in supabase.table("user_badges")
        .select("id_badge")
        .eq("usuario_identificador", usuario_identificador)
        .execute()
        .data
    }
    catalogo = {b["codigo"]: b for b in supabase.table("catalogo_badges").select("*").execute().data}

    otorgados_ahora = []

    def _otorgar(codigo):
        badge = catalogo.get(codigo)
        if not badge or badge["id_badge"] in ya_otorgados:
            return
        supabase.table("user_badges").insert({
            "usuario_identificador": usuario_identificador,
            "id_badge": badge["id_badge"],
        }).execute()
        otorgados_ahora.append(badge)

    if len(ids_vistos & set(por_nivel.get("basico", []))) >= 1:
        _otorgar("GUARDIAN_NOVATO")

    intermedios = set(por_nivel.get("intermedio", []))
    if intermedios and intermedios.issubset(ids_vistos):
        _otorgar("PROTECTOR_EXPERTO")

    avanzados = set(por_nivel.get("avanzado", []))
    if avanzados and avanzados.issubset(ids_vistos):
        _otorgar("EMBAJADOR_MONARCA")

    return otorgados_ahora
