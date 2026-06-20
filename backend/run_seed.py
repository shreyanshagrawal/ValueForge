from db import Base, engine, SessionLocal
import models.models
from data.seed_data import seed_database
from services.failure_cases_seed import seed_failure_cases
from services.failure_embeddings import generate_and_store_failure_embeddings

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed_database()
    seed_failure_cases(db)
    generate_and_store_failure_embeddings(db)
finally:
    db.close()
