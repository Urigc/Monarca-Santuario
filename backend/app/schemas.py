from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, confloat


# ---------------------------------------------------------------------------
# 3.1 Sincronización masiva de reportes offline (POST /api/v2/reportes/sync)
# ---------------------------------------------------------------------------
class ReporteComunitarioIn(BaseModel):
    id_sector: Optional[int] = None
    usuario_rol: str = "Poblador Anónimo"
    tipo_suceso: str
    descripcion: str
    latitud: confloat(ge=-90, le=90)
    longitud: confloat(ge=-180, le=180)
    fecha_creacion: Optional[datetime] = None


class ReporteComunitarioOut(ReporteComunitarioIn):
    id_reporte: int
    estado_validacion: str


# ---------------------------------------------------------------------------
# 3.2 Motor de conclusiones (GET /api/v2/analitica/insights)
# ---------------------------------------------------------------------------
class InsightOut(BaseModel):
    id_conclusion: int
    sector: str
    metrica_correlacionada: Optional[str]
    narrativa_insights: str
    nivel_urgencia: str
    fecha_generacion: date


# ---------------------------------------------------------------------------
# 3.3 Votación cruzada ejidal (POST /api/v2/reportes/{id}/votar)
# ---------------------------------------------------------------------------
class VotoEjidalIn(BaseModel):
    validador_credencial: str = Field(..., min_length=3)
    voto_positivo: bool
    comentario_revision: Optional[str] = None


class VotoEjidalOut(BaseModel):
    id_validacion: int
    id_reporte: int
    estado_actual_reporte: str
