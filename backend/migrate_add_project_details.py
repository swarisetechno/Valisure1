import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from models import Base, ProjectDetailsModel

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")
DB_NAME = os.getenv("DB_NAME", "valisure")

db_url = f"postgresql+psycopg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
print(f"Connecting to {db_url}...")

engine = create_engine(db_url)

# Create the new table
print("Creating project_details table...")
ProjectDetailsModel.__table__.create(bind=engine, checkfirst=True)
print("Table created successfully!")
