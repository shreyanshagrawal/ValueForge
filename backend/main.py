from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import Base, engine, SessionLocal
import models.models # to ensure models are registered
from routers import health, reference, scans, whitespace
from data.seed_data import seed_database
from services.failure_cases_seed import seed_failure_cases
from services.failure_embeddings import generate_and_store_failure_embeddings

Base.metadata.create_all(bind=engine)

# Seed data on startup
db = SessionLocal()
try:
    seed_database()
    seed_failure_cases(db)
    generate_and_store_failure_embeddings(db)
finally:
    db.close()

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging

app = FastAPI(title="ValueForge API")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": str(exc)}
    )

origins = [
    "http://localhost:5173",
    # NOTE: CORS is currently scoped to Vite's local dev server. 
    # Must be updated with production domains before deployment.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(reference.router, prefix="/api/v1/reference", tags=["Reference"])
app.include_router(scans.router, prefix="/api/v1/scans", tags=["Scans"])
app.include_router(whitespace.router, prefix="/api/v1/scans", tags=["Whitespace"])
