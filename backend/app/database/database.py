from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config.settings import settings
from app.core.logging import logger

db_url = settings.DATABASE_URL

# Fallback engine initialization
try:
    if db_url.startswith("postgresql"):
        engine = create_engine(db_url, pool_pre_ping=True)
    else:
        connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
        engine = create_engine(db_url, connect_args=connect_args, echo=settings.DEBUG)
except Exception as e:
    logger.warning(f"Could not connect to PostgreSQL ({e}). Falling back to local SQLite database.")
    fallback_url = "sqlite:///./pharmapilot.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False}, echo=settings.DEBUG)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency helper to yield a database session and close it afterwards.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database tables.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning(f"PostgreSQL initialization failed: {e}. Re-trying with SQLite fallback...")
        fallback_engine = create_engine("sqlite:///./pharmapilot.db", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=fallback_engine)
        logger.info("SQLite fallback database tables initialized successfully.")
