from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import Base, engine
import models.models # to ensure models are registered
from routers import health, reference
from data.seed_data import seed_database

Base.metadata.create_all(bind=engine)

# Seed database with initial data
seed_database()

app = FastAPI(title="ValueForge API")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(reference.router, prefix="/api/v1", tags=["Reference"])
