"""
Migration: Add drive_folder_id column to project_details table.
Run once: python migrate_add_drive_folder_id.py
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql+psycopg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Add column only if it doesn't exist
    result = conn.execute(text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name='project_details' AND column_name='drive_folder_id'
    """))
    if not result.fetchone():
        conn.execute(text("ALTER TABLE project_details ADD COLUMN drive_folder_id VARCHAR(255)"))
        conn.commit()
        print("✓ Added drive_folder_id column to project_details table.")
    else:
        print("✓ drive_folder_id column already exists — nothing to do.")
