# backend/user_routes.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas import CreateUserRequest, UpdateUserRequest, LoginRequest, UserResponse, TokenResponse
from models import UserModel, UserProjectRoleModel
from auth import hash_password, verify_password, create_access_token
from datetime import timedelta
from typing import Callable

router = APIRouter(prefix="/db", tags=["users"])

# This will be injected by the dependency injection system
get_db: Callable = None


@router.post("/login", response_model=TokenResponse)
def login(
    req: LoginRequest,
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
        
        # Generate JWT token
        access_token_expires = timedelta(minutes=1440)  # 24 hours
        access_token = create_access_token(
            data={"sub": user.id},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(user)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/create-user", response_model=UserResponse)
def create_user(
    req: CreateUserRequest,
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
        
        # Create new user
        new_user = UserModel(
            username=req.username,
            email=req.email,
            password_hash=password_hash
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return UserResponse.from_orm(new_user)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating user")


@router.get("/list-users")
def list_users(
    db: Session = Depends(get_db)
):
    """List all users"""
    try:
        users = db.query(UserModel).all()
        return {
            "users": [
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "created_at": u.created_at.isoformat() if u.created_at else None
                }
                for u in users
            ]
        }
    except Exception as e:
        print(f"Error listing users: {str(e)}")
        raise HTTPException(status_code=500, detail="Error listing users")


@router.put("/update-user/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    req: UpdateUserRequest,
    db: Session = Depends(get_db),
):
    """Update user details, including email, password, role, and project allocations"""
    try:
        user = db.query(UserModel).filter_by(id=user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Username uniqueness check
        if req.username != user.username:
            existing = db.query(UserModel).filter_by(username=req.username).first()
            if existing:
                raise HTTPException(status_code=400, detail="Username already exists")
        user.username = req.username

        # Email update (optional) – ensure uniqueness if changed
        if req.email is not None and req.email != user.email:
            if req.email:
                existing_email = db.query(UserModel).filter_by(email=req.email).first()
                if existing_email:
                    raise HTTPException(status_code=400, detail="Email already exists")
            user.email = req.email

        # Password update – hash if provided
        if req.password:
            user.password_hash = hash_password(req.password)

        # Global role update (optional)
        if req.role_id is not None:
            user.role_id = req.role_id

        # Project allocations – replace existing allocations for this user
        if req.project_allocations is not None:
            # Remove existing allocations
            db.query(UserProjectRoleModel).filter_by(user_id=user.id).delete()
            # Add new allocations
            for alloc in req.project_allocations:
                new_alloc = UserProjectRoleModel(
                    user_id=user.id,
                    project_id=alloc.project_id,
                    role_id=alloc.role_id,
                )
                db.add(new_alloc)

        db.commit()
        db.refresh(user)
        return UserResponse.from_orm(user)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating user")


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
