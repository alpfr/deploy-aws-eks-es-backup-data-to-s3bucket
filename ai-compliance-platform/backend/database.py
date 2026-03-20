from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Grab database URL from environment or fallback to sqlite for local dev
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_compliance.db")

# Automatically switch engine kwargs if SQLite is used
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db_session():
    """ Dependency for FastAPI endpoints migrating to SQLAlchemy """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
