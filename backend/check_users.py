import sys
sys.path.insert(0, 'c:\\Users\\Prabhu\\Downloads\\Valisure\\backend')
import os
os.chdir('c:\\Users\\Prabhu\\Downloads\\Valisure\\backend')
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
user = os.getenv('DB_USER')
password = os.getenv('DB_PASS')
host = os.getenv('DB_HOST')
port = os.getenv('DB_PORT')
name = os.getenv('DB_NAME')
url = f"postgresql+psycopg://{user}:{password}@{host}:{port}/{name}"
engine = create_engine(url)
S = sessionmaker(bind=engine)
db = S()
from models import UserModel
users = db.query(UserModel).all()
for u in users:
    print(f"id={u.id} username={u.username} email={u.email} has_pw={bool(u.password_hash)}")
db.close()
