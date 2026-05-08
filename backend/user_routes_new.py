# backend/user_routes.py
import json
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from schemas import CreateUserRequest, UpdateUserRequest, LoginRequest, UserResponse, TokenResponse
from models import UserModel, RoleModel, UserProjectRoleModel, ProjectModel, AuditLogModel
from auth import hash_password, verify_password, create_access_token
from datetime import timedelta, datetime, timezone


def _write_audit(db: Session, actor_id: str, action: str, resource_id: str,
                 actor_role: str, ip_address: str, payload: dict):
    """Write a single audit log entry directly to DB (sync, non-blocking)."""
    try:
        entry = AuditLogModel(
            actor_id=actor_id,
            action=action,
            resource_type="User_Assignment",
            resource_id=resource_id,
            payload=payload,
            timestamp=datetime.now(timezone.utc),
            ip_address=ip_address,
            actor_role=actor_role,
        )
        db.add(entry)
        db.commit()
    except Exception as audit_err:
        print(f"[WARN] Audit write failed: {audit_err}")

def create_user_router(get_db):
    """Factory function to create user router with database dependency"""
    router = APIRouter(prefix="/db", tags=["users"])

    @router.post("/login")
    def login(
        req: LoginRequest,
        request: Request,
        db: Session = Depends(get_db)
    ):
        """Login with email/username and password"""
        try:
            # Find user by email or username
            user = db.query(UserModel).filter(
                (UserModel.email == req.username_or_email) |
                (UserModel.username == req.username_or_email)
            ).first()

            if not user:
                raise HTTPException(status_code=401, detail="Invalid credentials")

            # Verify password
            if not user.password_hash or not verify_password(req.password, user.password_hash):
                raise HTTPException(status_code=401, detail="Invalid credentials")

            # ── Update last_login timestamp ─────────────────────────────────
            user.last_login = datetime.now(timezone.utc)
            db.commit()
            db.refresh(user)

            # Generate JWT token
            access_token_expires = timedelta(minutes=1440)  # 24 hours
            access_token = create_access_token(
                data={"sub": user.id},
                expires_delta=access_token_expires
            )

            # Build role info
            role_info = None
            actor_role_name = "user"
            if user.role_id and user.role:
                perms = None
                if user.role.permissions:
                    try:
                        perms = json.loads(user.role.permissions) if isinstance(user.role.permissions, str) else user.role.permissions
                    except:
                        perms = None
                actor_role_name = user.role.name
                role_info = {
                    "id": user.role.id,
                    "name": user.role.name,
                    "permission_level": user.role.permission_level,
                    "permissions": perms
                }

            # Build project allocations
            project_allocations = []
            for upr in user.project_roles:
                project_allocations.append({
                    "project_id": upr.project_id,
                    "project_name": upr.project.name if upr.project else "Unknown",
                    "role_id": upr.role_id,
                    "role_name": upr.role.name if upr.role else "Unknown"
                })

            user_response = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": user.phone,
                "department": user.department,
                "title": user.title,
                "status": user.status,
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "role": role_info,
                "project_allocations": project_allocations
            }

            # ── Write audit log directly (middleware sees anonymous on login) ─
            try:
                ip_addr = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
                audit_entry = AuditLogModel(
                    actor_id=str(user.id),
                    action="USER_LOGGED_IN",
                    resource_type="User_Assignment",
                    resource_id=str(user.id),
                    payload={"username": user.username, "email": user.email, "status": "success"},
                    timestamp=datetime.now(timezone.utc),
                    ip_address=ip_addr,
                    actor_role=actor_role_name,
                )
                db.add(audit_entry)
                db.commit()
            except Exception as audit_err:
                print(f"[WARN] Login audit write failed: {audit_err}")

            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": user_response
            }
        except HTTPException:
            raise
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Login error: {str(e)}")
            raise HTTPException(status_code=500, detail="Login failed")

    @router.post("/logout")
    def logout():
        """
        Logout endpoint purely for tracking the audit trail.
        Actual token destruction happens client-side.
        """
        return {"message": "Successfully logged out"}

    @router.post("/create-user")
    def create_user(
        req: CreateUserRequest,
        request: Request,
        db: Session = Depends(get_db)
    ):
        """Create a new user"""
        try:
            if not req.username.strip():
                raise HTTPException(status_code=400, detail="Username is required")
            
            # Check if username exists
            existing = db.query(UserModel).filter_by(username=req.username).first()
            if existing:
                raise HTTPException(status_code=400, detail="Username already exists")
            
            # Check if email exists (if provided)
            if req.email:
                existing_email = db.query(UserModel).filter_by(email=req.email).first()
                if existing_email:
                    raise HTTPException(status_code=400, detail="Email already exists")
            
            # Hash password if provided
            password_hash = None
            if req.password:
                password_hash = hash_password(req.password)
            
            # Validate role_id if provided
            if req.role_id:
                role = db.query(RoleModel).filter_by(id=req.role_id).first()
                if not role:
                    raise HTTPException(status_code=400, detail="Invalid role ID")

            # Create new user
            new_user = UserModel(
                username=req.username,
                email=req.email,
                password_hash=password_hash,
                role_id=req.role_id,
                phone=req.phone,
                department=req.department,
                title=req.title,
                status=req.status or "Active"
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            # Create project allocations if provided
            if req.project_allocations:
                for alloc in req.project_allocations:
                    # Validate role and project
                    if not db.query(ProjectModel).filter_by(id=alloc.project_id).first():
                        continue
                    if not db.query(RoleModel).filter_by(id=alloc.role_id).first():
                        continue
                    
                    mapping = UserProjectRoleModel(
                        user_id=new_user.id,
                        project_id=alloc.project_id,
                        role_id=alloc.role_id
                    )
                    db.add(mapping)
                db.commit()
                db.refresh(new_user)

            # Build role info for response
            role_info = None
            if new_user.role_id and new_user.role:
                perms = None
                if new_user.role.permissions:
                    try:
                        perms = json.loads(new_user.role.permissions) if isinstance(new_user.role.permissions, str) else new_user.role.permissions
                    except:
                        perms = None
                role_info = {
                    "id": new_user.role.id,
                    "name": new_user.role.name,
                    "permission_level": new_user.role.permission_level,
                    "permissions": perms
                }

            # ── Write audit log for USER_CREATED ──────────────────────────────
            try:
                ip_addr = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
                # Resolve caller identity from JWT if available
                _actor_id = "admin"
                auth_hdr = request.headers.get("Authorization", "")
                if auth_hdr.startswith("Bearer "):
                    try:
                        from auth import decode_token as _dt
                        _tok = auth_hdr.split(" ")[1]
                        _pl = _dt(_tok)
                        if _pl:
                            _actor_id = str(_pl.get("sub", "admin"))
                    except Exception:
                        pass
                _write_audit(
                    db=db,
                    actor_id=_actor_id,
                    action="USER_CREATED",
                    resource_id=str(new_user.id),
                    actor_role="admin",
                    ip_address=ip_addr,
                    payload={
                        "status": "success",
                        "new_user_id": new_user.id,
                        "username": new_user.username,
                        "email": new_user.email,
                        "department": new_user.department,
                        "title": new_user.title,
                        "status_value": new_user.status,
                    }
                )
            except Exception as audit_err:
                print(f"[WARN] create-user audit write failed: {audit_err}")

            return {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "phone": new_user.phone,
                "department": new_user.department,
                "title": new_user.title,
                "status": new_user.status,
                "last_login": new_user.last_login,
                "created_at": new_user.created_at,
                "role": role_info,
                "project_allocations": [
                    {
                        "project_id": a.project_id,
                        "project_name": a.project.name if a.project else "Unknown",
                        "role_id": a.role_id,
                        "role_name": a.role.name if a.role else "Unknown"
                    } for a in new_user.project_roles
                ]
            }
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            import traceback
            traceback.print_exc()
            print(f"Error creating user: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")


    @router.get("/list-users")
    def list_users(
        db: Session = Depends(get_db)
    ):
        """List all users"""
        try:
            users = db.query(UserModel).all()
            result = []
            for u in users:
                role_info = None
                if u.role_id and u.role:
                    perms = None
                    if u.role.permissions:
                        try:
                            perms = json.loads(u.role.permissions) if isinstance(u.role.permissions, str) else u.role.permissions
                        except:
                            perms = None
                    role_info = {
                        "id": u.role.id,
                        "name": u.role.name,
                        "permission_level": u.role.permission_level,
                        "permissions": perms
                    }
                result.append({
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "phone": u.phone,
                    "department": u.department,
                    "title": u.title,
                    "status": u.status,
                    "last_login": u.last_login.isoformat() if hasattr(u, "last_login") and u.last_login else None,
                    "created_at": u.created_at.isoformat() if u.created_at else None,
                    "role": role_info,
                    "role_id": u.role_id,
                    "project_allocations": [
                        {
                            "project_id": a.project_id, 
                            "project_name": a.project.name if a.project else "Unknown",
                            "role_id": a.role_id,
                            "role_name": a.role.name if a.role else "Unknown"
                        } for a in u.project_roles
                    ]
                })
            return {"users": result}
        except Exception as e:
            print(f"Error listing users: {str(e)}")
            raise HTTPException(status_code=500, detail="Error listing users")


    @router.put("/update-user/{user_id}")
    def update_user(
        user_id: int,
        req: UpdateUserRequest,
        request: Request,
        db: Session = Depends(get_db)
    ):
        """Update user details"""
        try:
            user = db.query(UserModel).filter_by(id=user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Check if new username already exists
            if req.username != user.username:
                existing = db.query(UserModel).filter_by(username=req.username).first()
                if existing:
                    raise HTTPException(status_code=400, detail="Username already exists")
            user.username = req.username
            
            # Check if new email already exists
            if req.email is not None and req.email != user.email:
                if req.email:
                    existing_email = db.query(UserModel).filter_by(email=req.email).first()
                    if existing_email:
                        raise HTTPException(status_code=400, detail="Email already exists")
                user.email = req.email

            # Password update – hash if provided
            if req.password:
                user.password_hash = hash_password(req.password)

            # Global role update
            if req.role_id is not None:
                user.role_id = req.role_id

            if req.phone is not None:
                user.phone = req.phone
            
            if req.department is not None:
                user.department = req.department
            
            if req.title is not None:
                user.title = req.title
                
            if req.status is not None:
                user.status = req.status
            
            # Update project allocations if provided
            if req.project_allocations is not None:
                # Clear existing
                db.query(UserProjectRoleModel).filter_by(user_id=user.id).delete()
                
                # Add new
                for alloc in req.project_allocations:
                    # Validate
                    if not db.query(ProjectModel).filter_by(id=alloc.project_id).first():
                        continue
                    if not db.query(RoleModel).filter_by(id=alloc.role_id).first():
                        continue
                        
                    mapping = UserProjectRoleModel(
                        user_id=user.id,
                        project_id=alloc.project_id,
                        role_id=alloc.role_id
                    )
                    db.add(mapping)

            db.commit()
            db.refresh(user)

            # ── Write audit log for USER_MODIFIED ─────────────────────────────
            try:
                ip_addr = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
                # Resolve caller from JWT
                _actor_id = str(user_id)
                _auth_hdr = request.headers.get("Authorization", "")
                if _auth_hdr.startswith("Bearer "):
                    try:
                        from auth import decode_token as _dt2
                        _tok2 = _auth_hdr.split(" ")[1]
                        _pl2 = _dt2(_tok2)
                        if _pl2:
                            _actor_id = str(_pl2.get("sub", user_id))
                    except Exception:
                        pass
                _write_audit(
                    db=db,
                    actor_id=_actor_id,
                    action="USER_MODIFIED",
                    resource_id=str(user.id),
                    actor_role="admin",
                    ip_address=ip_addr,
                    payload={
                        "status": "success",
                        "updated_fields": {
                            "username": req.username,
                            "email": req.email,
                            "phone": req.phone,
                            "department": req.department,
                            "title": req.title,
                            "status": req.status,
                            "role_id": req.role_id,
                            "project_allocations_updated": req.project_allocations is not None,
                        }
                    }
                )
            except Exception as audit_err:
                print(f"[WARN] update-user audit write failed: {audit_err}")

            # Build role info for response
            role_info = None
            if user.role_id and user.role:
                perms = None
                if user.role.permissions:
                    try:
                        perms = json.loads(user.role.permissions) if isinstance(user.role.permissions, str) else user.role.permissions
                    except:
                        perms = None
                role_info = {
                    "id": user.role.id,
                    "name": user.role.name,
                    "permission_level": user.role.permission_level,
                    "permissions": perms
                }

            return {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": user.phone,
                "department": user.department,
                "title": user.title,
                "status": user.status,
                "last_login": user.last_login,
                "created_at": user.created_at,
                "role": role_info,
                "project_allocations": [
                    {
                        "project_id": a.project_id, 
                        "project_name": a.project.name if a.project else "Unknown",
                        "role_id": a.role_id,
                        "role_name": a.role.name if a.role else "Unknown"
                    } for a in user.project_roles
                ]
            }
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            import traceback
            traceback.print_exc()
            print(f"Error updating user: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")


    @router.delete("/delete-user/{user_id}")
    def delete_user(
        user_id: int,
        db: Session = Depends(get_db)
    ):
        """Delete a user"""
        try:
            user = db.query(UserModel).filter_by(id=user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            db.delete(user)
            db.commit()
            
            return {"message": f"User {user.username} deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            print(f"Error deleting user: {str(e)}")
            raise HTTPException(status_code=500, detail="Error deleting user")

    return router
