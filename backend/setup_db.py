"""
Unified setup script for database creation, column migrations, role seeding, and admin user creation.
Run once: python setup_db.py
"""
import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Set backend directory in system path
sys.path.insert(0, os.path.dirname(__file__))

from models import Base, UserModel, RoleModel
from auth import hash_password
from db_config import DATABASE_URL


print(f"Connecting to database: {DATABASE_URL}...")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def run_setup():
    # 1. Create tables if they do not exist
    print("Step 1: Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables verified/created.")

    # 2. Run schema migrations/updates
    print("\nStep 2: Running column and constraint migrations...")
    with engine.connect() as conn:
        # Alter users table columns
        conn.execute(text("ALTER TABLE users ALTER COLUMN role DROP NOT NULL"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(100)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active'"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id)"))
        
        # Alter project_details table columns
        conn.execute(text("ALTER TABLE project_details ADD COLUMN IF NOT EXISTS drive_folder_id VARCHAR(255)"))
        
        # Alter document_entries table columns
        conn.execute(text("ALTER TABLE document_entries ADD COLUMN IF NOT EXISTS req_id INTEGER"))
        
        # Backfill req_id for document_entries
        conn.execute(text("""
            WITH numbered AS (
                SELECT id, document_id,
                       ROW_NUMBER() OVER (PARTITION BY document_id ORDER BY id) as rn
                FROM document_entries
            )
            UPDATE document_entries e
            SET req_id = n.rn
            FROM numbered n
            WHERE e.id = n.id AND (e.req_id IS NULL OR e.req_id = 0);
        """))
        
        conn.commit()
    print("[OK] Schema updates and column migrations applied successfully.")

    # 3. Seed default roles
    print("\nStep 3: Seeding default user roles...")
    DEFAULT_ROLES = [
        ("Admin",              "admin",   None),
        ("Editor / Author",    "editor",  None),
        ("Reviewer",           "viewer",  None),
        ("Reviewer - Approver","viewer",  None),
        ("No Access",          "no_access", None),
    ]
    
    db = SessionLocal()
    try:
        # Seed default roles
        for name, permission_level, permissions in DEFAULT_ROLES:
            existing_role = db.query(RoleModel).filter_by(name=name).first()
            if existing_role:
                print(f"[SKIP] Role already exists: '{name}' (id={existing_role.id})")
            else:
                new_role = RoleModel(
                    name=name,
                    permission_level=permission_level,
                    permissions=permissions
                )
                db.add(new_role)
                db.commit()
                print(f"[OK]   Created role: '{name}' (permission_level={permission_level})")

        # 4. Create admin user
        print("\nStep 4: Creating initial admin user...")
        admin_role = db.query(RoleModel).filter_by(name="Admin").first()
        if not admin_role:
            print("[ERROR] Admin role not found. Cannot create admin user.")
            return

        admin_user = db.query(UserModel).filter_by(username="admin").first()
        if admin_user:
            # Update existing admin
            if not admin_user.role_id:
                admin_user.role_id = admin_role.id
                db.commit()
                print("[OK] Admin user updated with Admin role!")
            else:
                print("[OK] Admin user already exists with Admin role assigned.")
        else:
            # Create new admin user
            admin_password = "admin@123"
            new_admin = UserModel(
                first_name="Admin",
                last_name="Admin",
                username="admin",
                email="admin@example.com",
                password_hash=hash_password(admin_password),
                role_id=admin_role.id,
                status="Active"
            )
            db.add(new_admin)
            db.commit()
            print("[OK] Admin user created successfully!")
            print(f"   Username: admin")
            print(f"   Email: admin@example.com")
            print(f"   Password: {admin_password}")
            print("\n[WARNING] Change the password after first login!")

    except Exception as e:
        print(f"[ERROR] Database setup failed: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_setup()
    print("\n[SUCCESS] Database setup, migrations, and seeding completed successfully.")
