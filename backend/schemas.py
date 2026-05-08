# backend/schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CreateRequest(BaseModel):
    filename: str


class AddUnderRequest(BaseModel):
    filename: str
    heading_text: str
    new_text: str
    # Optional table row fields for URS table insertion
    urs_id: Optional[str] = None
    urs_title: Optional[str] = None   # human-readable title for plain text
    gxp: Optional[str] = None
    gxp_reference: Optional[str] = None
    gxp_risk: Optional[str] = None


class AddEndRequest(BaseModel):
    filename: str
    text: str
    heading: Optional[str] = None


class AddEntry(BaseModel):
    filename: str
    heading_text: str
    content_text: str


class UpdateEntryByHeading(BaseModel):
    filename: str
    heading_text: str
    new_text: str


class StageUpdateRequest(BaseModel):
    filename: str
    stage: int
    content: str


class CreateHeadingRequest(BaseModel):
    filename: str


class UpdateHeadingContentRequest(BaseModel):
    filename: str
    heading_id: int
    content: str


class GenerateHeadingContentRequest(BaseModel):
    filename: str
    heading_id: int


class UpdateHeadingStatusRequest(BaseModel):
    heading_id: int
    status: str


class ProjectAllocation(BaseModel):
    project_id: int
    role_id: int

class CreateUserRequest(BaseModel):
    username: str
    email: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = "Active"
    role_id: Optional[int] = None
    project_allocations: Optional[List[ProjectAllocation]] = None

class TeamMemberAllocation(BaseModel):
    user_id: int
    role_id: int

class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None
    change_number: Optional[str] = None
    system_application_name: Optional[str] = None
    methodologies: Optional[dict] = None
    gamp_categories: Optional[dict] = None
    regulations: Optional[dict] = None
    csv_deliverables: Optional[dict] = None
    csa_deliverables: Optional[dict] = None
    team_members: Optional[List[TeamMemberAllocation]] = None



class UpdateUserRequest(BaseModel):
    username: str
    email: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None
    role_id: Optional[int] = None
    project_allocations: Optional[List[ProjectAllocation]] = None

class LoginRequest(BaseModel):
    username_or_email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    role: Optional[dict] = None
    class Config:
        orm_mode = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# -------------------- ROLE SCHEMAS --------------------
class CreateRoleRequest(BaseModel):
    name: str
    permission_level: str  # "admin", "viewer", "editor", "no_access"
    permissions: Optional[dict] = None  # For editor-level granular permissions


class RoleResponse(BaseModel):
    id: int
    name: str
    permission_level: str
    permissions: Optional[dict] = None
    created_at: Optional[datetime] = None
    class Config:
        orm_mode = True
