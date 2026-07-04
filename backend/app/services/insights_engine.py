"""
Motor de Conclusiones Automatizadas (Sección 6 del plano maestro).

Pipeline heurístico -no un LLM- que cruza semanalmente:
  - Valor Promedio NDVI (salud forestal) por sector
  - Anomalías Térmicas Nocturnas del mismo sector
  - Dispersión de avistamientos hacia sectores vecinos

y redacta una narrativa en texto plano, lista para la asamblea ejidal.
"""
from datetime import date, timedelta
from app.database import get_supabase

UMBRAL_CAIDA_NDVI_PORCENTAJE = 8.0
UMBRAL_ANOMALIA_TERMICA_C = -2.0


def _variacion_porcentual(actual: float, previo: float) -> float:
    if previo == 0:
        return 0.0
    return round(((actual - previo) / abs(previo)) * 100, 2)


def generar_insights_semanales():
    supabase = get_supabase()
    sectores = supabase.table("sectores_bosque").select("*").execute().data
    hoy = date.today()
    hace_7d = hoy - timedelta(days=7)
    hace_14d = hoy - timedelta(days=14)

    nuevas_conclusiones = []

    for sector in sectores:
        sid = sector["id_sector"]

        ndvi_reciente = (
            supabase.table("salud_forestal_ndvi")
            .select("valor_ndvi")
            .eq("id_sector", sid)
            .gte("fecha_analisis", hace_7d.isoformat())
            .execute()
            .data
        )
        ndvi_previo = (
            supabase.table("salud_forestal_ndvi")
            .select("valor_ndvi")
            .eq("id_sector", sid)
            .gte("fecha_analisis", hace_14d.isoformat())
            .lt("fecha_analisis", hace_7d.isoformat())
            .execute()
            .data
        )
        clima_reciente = (
            supabase.table("registros_microclima")
            .select("temperatura_c")
            .eq("id_sector", sid)
            .gte("fecha_hora", hace_7d.isoformat())
            .execute()
            .data
        )

        if not ndvi_reciente or not ndvi_previo:
            continue

        prom_ndvi_actual = sum(r["valor_ndvi"] for r in ndvi_reciente) / len(ndvi_reciente)
        prom_ndvi_previo = sum(r["valor_ndvi"] for r in ndvi_previo) / len(ndvi_previo)
        variacion = _variacion_porcentual(prom_ndvi_actual, prom_ndvi_previo)

        temp_minima = min((r["temperatura_c"] for r in clima_reciente), default=None)

        if variacion <= -UMBRAL_CAIDA_NDVI_PORCENTAJE:
            urgencia = "Crítico" if variacion <= -15 else "Moderado"
            anomalia_txt = (
                f" emparejado con una anomalía térmica nocturna mínima de {temp_minima}°C"
                if temp_minima is not None and temp_minima <= UMBRAL_ANOMALIA_TERMICA_C
                else ""
            )
            narrativa = (
                f"Alerta de Desviación de Hábitat: El sector '{sector['nombre_sector']}' "
                f"presentó un descenso del {abs(variacion)}% en el índice NDVI"
                f"{anomalia_txt}. Patrón correlacionado con perturbación humana o presencia "
                f"de plaga latente. Se sugiere inspección por brigada ejidal."
            )

            registro = {
                "id_sector": sid,
                "metrica_correlacionada": "NDVI vs Caida de Temperatura",
                "narrativa_insights": narrativa,
                "nivel_urgencia": urgencia,
            }
            insercion = supabase.table("conclusiones_analitica").insert(registro).execute()
            nuevas_conclusiones.append({
                **insercion.data[0],
                "sector": sector["nombre_sector"],
            })

    return nuevas_conclusiones
