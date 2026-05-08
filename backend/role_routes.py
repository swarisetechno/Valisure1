# backend/role_routes.py
import json
from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from schemas import CreateRoleRequest, RoleResponse
from models import RoleModel, UserModel
from auth import decode_token


def create_role_router(get_db):
    """Factory function to create role router with database dependency"""
    router = APIRouter(prefix="/db", tags=["roles"])

    def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> UserModel:
        """Get current user from JWT token"""
        if not authorization:
            raise HTTPException(status_code=401, detail="Not authenticated")
        try:
            scheme, token = authorization.split()
            if scheme.lower() != "bearer":
                raise ValueError("Invalid auth scheme")
        except (ValueError, IndexError):
            raise HTTPException(status_code=401, detail="Invalid authorization header")

        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = db.query(UserModel).filter_by(id=user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    def require_admin(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
        """Check if current user has admin role"""
        if not current_user.role_id:
            raise HTTPException(status_code=403, detail="Access denied: No role assigned")
        role = db.query(RoleModel).filter_by(id=current_user.role_id).first()
        if not role or role.permission_level != "admin":
            # Check if editor has create_role permission
            if role and role.permission_level == "editor" and role.permissions:
                try:
                    perms = json.loads(role.permissions) if isinstance(role.permissions, str) else role.permissions
                    if perms.get("create_role"):
                        return current_user
                except:
                    pass
            raise HTTPException(status_code=403, detail="Access denied: Admin role required")
        return current_user

    @router.post("/create-role")
    def create_role(
        req: CreateRoleRequest,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(require_admin)
    ):
        """Create a new role"""
        try:
            if not req.name.strip():
                raise HTTPException(status_code=400, detail="Role name is required")

            # Validate permission_level
            valid_levels = ["admin", "viewer", "editor", "no_access"]
            if req.permission_level not in valid_levels:
                raise HTTPException(status_code=400, detail=f"Permission level must be one of: {', '.join(valid_levels)}")

            # Check if role name already exists
            existing = db.query(RoleModel).filter_by(name=req.name).first()
            if existing:
                raise HTTPException(status_code=400, detail="Role name already exists")

            # Convert permissions dict to JSON string
            permissions_json = None
            if req.permissions:
                permissions_json = json.dumps(req.permissions)

            new_role = RoleModel(
                name=req.name,
                permission_level=req.permission_level,
                permissions=permissions_json
            )
            db.add(new_role)
            db.commit()
            db.refresh(new_role)

            # Parse permissions back for response
            perms = None
            if new_role.permissions:
                try:
                    perms = json.loads(new_role.permissions)
                except:
                    perms = None

            return {
                "id": new_role.id,
                "name": new_role.name,
                "permission_level": new_role.permission_level,
                "permissions": perms,
                "created_at": new_role.created_at.isoformat() if new_role.created_at else None,
                "message": f"Role '{new_role.name}' created successfully"
            }
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            print(f"Error creating role: {str(e)}")
            raise HTTPException(status_code=500, detail="Error creating role")

    @router.get("/list-roles")
    def list_roles(
        db: Session = Depends(get_db)
    ):
        """List all roles"""
        try:
            roles = db.query(RoleModel).all()
            result = []
            for r in roles:
                perms = None
                if r.permissions:
                    try:
                        perms = json.loads(r.permissions)
                    except:
                        perms = None
                result.append({
                    "id": r.id,
                    "name": r.name,
                    "permission_level": r.permission_level,
                    "permissions": perms,
                    "created_at": r.created_at.isoformat() if r.created_at else None
                })
            return {"roles": result}
        except Exception as e:
            print(f"Error listing roles: {str(e)}")
            raise HTTPException(status_code=500, detail="Error listing roles")

    @router.delete("/delete-role/{role_id}")
    def delete_role(
        role_id: int,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(require_admin)
    ):
        """Delete a role"""
        try:
            role = db.query(RoleModel).filter_by(id=role_id).first()
            if not role:
                raise HTTPException(status_code=404, detail="Role not found")

            # Don't allow deleting the Admin role
            if role.permission_level == "admin" and role.name.lower() == "admin":
                raise HTTPException(status_code=400, detail="Cannot delete the default Admin role")

            # Check if any users are assigned this role
            users_with_role = db.query(UserModel).filter_by(role_id=role_id).count()
            if users_with_role > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot delete role: {users_with_role} user(s) are assigned this role"
                )

            db.delete(role)
            db.commit()

            return {"message": f"Role '{role.name}' deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            print(f"Error deleting role: {str(e)}")
            raise HTTPException(status_code=500, detail="Error deleting role")

    @router.put("/update-role/{role_id}")
    def update_role(
        role_id: int,
        req: CreateRoleRequest,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(require_admin)
    ):
        """Update an existing role's permissions"""
        try:
            role = db.query(RoleModel).filter_by(id=role_id).first()
            if not role:
                raise HTTPException(status_code=404, detail="Role not found")

            # Don't allow editing the default Admin role's permission level
            if role.permission_level == "admin" and role.name.lower() == "admin":
                if req.permission_level != "admin":
                    raise HTTPException(status_code=400, detail="Cannot change default Admin role's permission level")

            # Update fields
            if req.name and req.name.strip():
                # Check name uniqueness (exclude current role)
                existing = db.query(RoleModel).filter(
                    RoleModel.name == req.name,
                    RoleModel.id != role_id
                ).first()
                if existing:
                    raise HTTPException(status_code=400, detail="Role name already exists")
                role.name = req.name.strip()

            if req.permission_level:
                valid_levels = ["admin", "viewer", "editor", "no_access"]
                if req.permission_level not in valid_levels:
                    raise HTTPException(status_code=400, detail=f"Invalid permission level")
                role.permission_level = req.permission_level

            # Update permissions
            if req.permissions is not None:
                role.permissions = json.dumps(req.permissions)
            elif req.permission_level != "editor":
                role.permissions = None

            db.commit()
            db.refresh(role)

            perms = None
            if role.permissions:
                try:
                    perms = json.loads(role.permissions)
                except:
                    perms = None

            return {
                "id": role.id,
                "name": role.name,
                "permission_level": role.permission_level,
                "permissions": perms,
                "created_at": role.created_at.isoformat() if role.created_at else None,
                "message": f"Role '{role.name}' updated successfully"
            }
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            print(f"Error updating role: {str(e)}")
            raise HTTPException(status_code=500, detail="Error updating role")

    return router
