"""
Tarea programada (Sección 3 y 8 del plano maestro).

Corre cada CRON_INTERVALO_HORAS y es la ÚNICA parte del sistema que
habla directamente con iNaturalist / OpenWeather / Copernicus. El resto
de la plataforma sólo lee de Supabase -> cero llamadas externas en
tiempo de usuario, blindaje contra rate limiting.
"""
import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings
from app.database import get_supabase
from app.services import inaturalist_client, openweather_client, copernicus_client

logger = logging.getLogger("cron_ingesta")


async def ingerir_clima():
    supabase = get_supabase()
    sectores = supabase.table("sectores_bosque").select("*").execute().data
    for sector in sectores:
        lat = (sector["lat_min"] + sector["lat_max"]) / 2
        lng = (sector["lng_min"] + sector["lng_max"]) / 2
        try:
            clima = await openweather_client.obtener_clima_actual(lat, lng)
            supabase.table("registros_microclima").insert({
                "id_sector": sector["id_sector"],
                "fecha_hora": "now()",
                **clima,
            }).execute()

            if clima["riesgo_congelacion"] == "Crítico":
                supabase.table("alertas_comunitarias").insert({
                    "titulo": f"Riesgo de Congelación - {sector['nombre_sector']}",
                    "descripcion": (
                        f"Temperatura de {clima['temperatura_c']}°C detectada. "
                        "Riesgo crítico para la colonia de mariposa monarca."
                    ),
                    "tipo_riesgo": "Helada extrema",
                }).execute()
        except Exception as exc:
            logger.warning("Fallo ingesta clima sector %s: %s", sector["id_sector"], exc)


async def ingerir_avistamientos():
    supabase = get_supabase()
    try:
        avistamientos = await inaturalist_client.obtener_avistamientos_validados()
        if avistamientos:
            supabase.table("avistamientos_monarca").insert(avistamientos).execute()
    except Exception as exc:
        logger.warning("Fallo ingesta iNaturalist: %s", exc)


async def ingerir_ndvi():
    supabase = get_supabase()
    sectores = supabase.table("sectores_bosque").select("*").execute().data
    for sector in sectores:
        ultimo = (
            supabase.table("salud_forestal_ndvi")
            .select("valor_ndvi")
            .eq("id_sector", sector["id_sector"])
            .order("fecha_analisis", desc=True)
            .limit(1)
            .execute()
            .data
        )
        ultimo_valor = ultimo[0]["valor_ndvi"] if ultimo else None
        try:
            resultado = await copernicus_client.obtener_ndvi_sector(
                bbox=[sector["lng_min"], sector["lat_min"], sector["lng_max"], sector["lat_max"]],
                fecha_desde="2026-06-26",
                fecha_hasta="2026-07-03",
                ultimo_valor_valido=ultimo_valor,
            )
            if resultado["valor_ndvi"] is not None:
                supabase.table("salud_forestal_ndvi").insert({
                    "id_sector": sector["id_sector"],
                    "fecha_analisis": "now()",
                    "valor_ndvi": resultado["valor_ndvi"],
                    "alerta_deforestacion": resultado["alerta_deforestacion"],
                }).execute()
        except Exception as exc:
            logger.warning("Fallo ingesta NDVI sector %s: %s", sector["id_sector"], exc)


async def ciclo_ingesta_completo():
    logger.info("Iniciando ciclo de ingesta CRON...")
    await asyncio.gather(ingerir_clima(), ingerir_avistamientos(), ingerir_ndvi())
    logger.info("Ciclo de ingesta CRON finalizado.")


def iniciar_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        ciclo_ingesta_completo,
        "interval",
        hours=settings.CRON_INTERVALO_HORAS,
        id="ingesta_territorial",
        next_run_time=None,  # se dispara con start(); evita doble ejecución al importar
    )
    scheduler.start()
    logger.info("Scheduler CRON iniciado: cada %sh", settings.CRON_INTERVALO_HORAS)
    return scheduler
