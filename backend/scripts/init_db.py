"""
BAFS Database Table Initializer
Creates all database tables defined in app.models using SQLAlchemy metadata.
"""
import asyncio
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import get_settings
from app.core.database import Base, engine
import app.models  # Ensure all models are registered with Base.metadata


async def init_tables():
    settings = get_settings()
    print("=" * 60)
    print(" BAFS Database Initialization")
    print("=" * 60)
    print(f"Connecting to: {settings.database_url.split('@')[-1] if '@' in settings.database_url else settings.database_url}")
    
    try:
        async with engine.begin() as conn:
            # Enable PostgreSQL extensions if supported
            try:
                from sqlalchemy import text
                await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto";'))
                await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pg_trgm";'))
            except Exception as ext_err:
                print(f"[Note] Extension creation note: {ext_err}")
                
            print("Creating database tables...")
            await conn.run_sync(Base.metadata.create_all)
            print("[SUCCESS] All database tables successfully verified/created!")
    except Exception as exc:
        print(f"\n[ERROR] Could not connect to database or create tables:\n{exc}")
        print("\nTroubleshooting:")
        print(" 1. Ensure PostgreSQL service is running.")
        print(" 2. Verify POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB in .env.")
        print(" 3. If running locally, DATABASE_URL should use localhost:5432.")
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(init_tables())
