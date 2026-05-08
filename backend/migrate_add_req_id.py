"""
One-time migration: Add req_id column to document_entries table
and backfill existing entries with sequential IDs per document.
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "docx_manager")

conn = psycopg2.connect(
    host=DB_HOST, port=DB_PORT,
    user=DB_USER, password=DB_PASS,
    dbname=DB_NAME
)
conn.autocommit = True
cur = conn.cursor()

# 1. Add req_id column if it doesn't exist
try:
    cur.execute("ALTER TABLE document_entries ADD COLUMN req_id INTEGER;")
    print("Added req_id column to document_entries")
except psycopg2.errors.DuplicateColumn:
    conn.rollback()
    print("req_id column already exists")

# 2. Backfill existing entries with sequential req_id per document
cur.execute("""
    WITH numbered AS (
        SELECT id, document_id,
               ROW_NUMBER() OVER (PARTITION BY document_id ORDER BY id) as rn
        FROM document_entries
    )
    UPDATE document_entries e
    SET req_id = n.rn
    FROM numbered n
    WHERE e.id = n.id AND (e.req_id IS NULL OR e.req_id = 0);
""")
print(f"Backfilled req_id for {cur.rowcount} entries")

cur.close()
conn.close()
print("Migration complete!")
