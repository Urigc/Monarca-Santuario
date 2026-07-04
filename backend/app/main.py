import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.jobs.cron_ingesta import iniciar_scheduler
from app.routers import reportes, analitica, votaciones, microclima, avistamientos, siniestros

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = iniciar_scheduler()
    yield
    scheduler.shutdown()


app = FastAPI(
    title="Santuario Digital Temascaltepec API",
    description="Plataforma de Inteligencia Territorial Comunitaria — Piedra Herrada",
    version="2.0.0",
    lifespan=lifespan,
)

allowed_origins = [
    "https://mariposamonarca.netlify.app",  
    "http://localhost:5173",  
    "http://localhost:3000", 
]

if hasattr(settings, 'FRONTEND_ORIGIN') and settings.FRONTEND_ORIGIN:
    allowed_origins.append(settings.FRONTEND_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reportes.router)
app.include_router(analitica.router)
app.include_router(votaciones.router)
app.include_router(microclima.router)
app.include_router(avistamientos.router)
app.include_router(siniestros.router)


@app.get("/")
def raiz():
    return {
        "proyecto": "Santuario Digital Temascaltepec V2.0",
        "estado": "operativo",
        "endpoints_criticos": [
            "POST /api/v2/reportes/sync",
            "GET /api/v2/analitica/insights",
            "POST /api/v2/reportes/{id_reporte}/votar",
        ],
    }


@app.get("/health")
def health():
    return {"status": "ok"}
