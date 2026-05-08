import sys
sys.path.append('.')
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()
db_url = f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
engine = create_engine(db_url)
Session = sessionmaker(bind=engine)
db = Session()

from models import AuditLogModel

logs = db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).limit(10).all()
print("Latest Audit Logs:")
print("-" * 50)
for log in logs:
    print(f"[{log.timestamp}] {log.actor_id} -> {log.action} on {log.resource_type}:{log.resource_id}")
    print(f"Payload: {log.payload}")
    print("-" * 50)
