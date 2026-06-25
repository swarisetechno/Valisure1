import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sqlalchemy import create_engine, text
from db_config import DATABASE_URL
engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    print("=== ROLES ===")
    for r in conn.execute(text("SELECT id, name, permission_level FROM roles ORDER BY id")).fetchall():
        print(dict(r._mapping))
    print("\n=== USERS TABLE COLUMNS ===")
    q = "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
    for r in conn.execute(text(q)).fetchall():
        print(dict(r._mapping))
