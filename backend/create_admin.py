"""
Script to create initial admin user and Admin role
Run this once to set up the admin account with Admin role
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from models import UserModel, RoleModel, Base
from auth import hash_password
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql+psycopg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def create_admin():
    """Create admin role and admin user"""
    db = SessionLocal()
    
    try:
        # Step 1: Create or get Admin role
        admin_role = db.query(RoleModel).filter_by(name="Admin").first()
        if not admin_role:
            admin_role = RoleModel(
                name="Admin",
                permission_level="admin",
                permissions=None
            )
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)
            print("[OK] Admin role created!")
        else:
            print("[OK] Admin role already exists!")

        # Step 2: Create or update admin user
        admin = db.query(UserModel).filter_by(username="admin").first()
        if admin:
            # Update existing admin to have admin role
            if not admin.role_id:
                admin.role_id = admin_role.id
                db.commit()
                print("[OK] Admin user updated with Admin role!")
            else:
                print("[OK] Admin user already exists with role assigned!")
            print(f"   Username: admin")
            print(f"   Email: {admin.email}")
        else:
            # Create admin user
            admin_password = "admin@123"  # Change this to something secure!
            admin_user = UserModel(
                username="admin",
                email="admin@example.com",
                password_hash=hash_password(admin_password),
                role_id=admin_role.id
            )
            db.add(admin_user)
            db.commit()
            
            print("[OK] Admin user created successfully!")
            print(f"   Username: admin")
            print(f"   Email: admin@example.com")
            print(f"   Password: {admin_password}")
            print("\n[WARNING] Change the password after first login!")

        # assign Admin role only to the primary 'admin' user (already handled or logic removed)
        pass
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
