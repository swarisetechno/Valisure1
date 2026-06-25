from sqlalchemy import (
    create_engine, Column, Integer, String, Text,
    ForeignKey, DateTime, func, UniqueConstraint, UUID, JSON, Index
)
from sqlalchemy.orm import declarative_base, relationship
from uuid import uuid4

Base = declarative_base()


class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    documents = relationship(
        "DocumentModel",
        back_populates="project",
        cascade="all, delete"
    )
    user_roles = relationship(
        "UserProjectRoleModel",
        back_populates="project",
        cascade="all, delete"
    )
    details = relationship(
        "ProjectDetailsModel",
        back_populates="project",
        uselist=False,
        cascade="all, delete-orphan"
    )


class ProjectDetailsModel(Base):
    __tablename__ = "project_details"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    change_number = Column(String(100), nullable=True)
    system_application_name = Column(String(200), nullable=True)

    # Google Drive integration
    drive_folder_id = Column(String(255), nullable=True)  # ID of the project folder in ValiSure_Projects

    # Complex config objects
    methodologies = Column(JSON, nullable=True)
    gamp_categories = Column(JSON, nullable=True)
    regulations = Column(JSON, nullable=True)
    csv_deliverables = Column(JSON, nullable=True)
    csa_deliverables = Column(JSON, nullable=True)

    project = relationship("ProjectModel", back_populates="details")


class RoleModel(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    permission_level = Column(String(20), nullable=False)  # "admin", "viewer", "editor", "no_access"
    permissions = Column(Text, nullable=True)  # JSON string for editor-level granular permissions
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserProjectRoleModel(Base):
    """Junction table linking Users, Projects, and Roles"""
    __tablename__ = "user_project_roles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("UserModel", back_populates="project_roles")
    project = relationship("ProjectModel", back_populates="user_roles")
    role = relationship("RoleModel")


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    title = Column(String(100), nullable=True)
    status = Column(String(50), default="Active")
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Legacy 'role' VARCHAR column (now nullable) – kept for DB compatibility.
    # The app uses role_id (FK to roles table) for role management.
    # Mapped as 'role_label' to avoid name collision with the role relationship.
    role_label = Column("role", String(50), nullable=True)

    # The global role_id can be used as a super-admin flag if needed, 
    # but primarily we'll use per-project roles.
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    role = relationship("RoleModel")
    documents = relationship(
        "DocumentModel",
        back_populates="user",
        cascade="all, delete"
    )
    project_roles = relationship(
        "UserProjectRoleModel",
        back_populates="user",
        cascade="all, delete"
    )


class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    username = Column(String(100))
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    current_stage = Column(Integer, default=0)

    user = relationship("UserModel", back_populates="documents")
    project = relationship("ProjectModel", back_populates="documents")
    entries = relationship(
        "DocumentEntryModel",
        back_populates="document",
        cascade="all, delete"
    )
    change_logs = relationship(
        "ChangeLogModel",
        back_populates="document",
        cascade="all, delete"
    )

    __table_args__ = (
        UniqueConstraint("project_id", "filename", name="uq_project_filename"),
    )


class DocumentEntryModel(Base):
    __tablename__ = "document_entries"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    req_id = Column(Integer, nullable=True)  # Sequential per document: 1, 2, 3...
    heading_text = Column(Text, nullable=False)
    content_text = Column(Text, nullable=False)
    status = Column(String(20), default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("DocumentModel", back_populates="entries")


class ChangeLogModel(Base):
    __tablename__ = "change_logs"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    username = Column(String(100))
    change_type = Column(String(50))
    content = Column(Text)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("DocumentModel", back_populates="change_logs")


# ============ AUDIT LOG MODEL (21 CFR Part 11 Compliance) ============
class AuditLogModel(Base):
    """
    Immutable append-only audit trail for compliance.
    Stores all resource modifications with before/after state, actor info, and cryptographic context.
    
    21 CFR Part 11 ┬º11.10(c) Requirements:
    - Append-only: No UPDATE or DELETE operations allowed
    - Retroactive changes: All modifications captured with timestamp and actor
    - Field-level tracking: Captures which fields changed and old/new values
    """
    __tablename__ = "audit_logs"

    # Primary key (UUID for distributed system compatibility)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)
    
    # Timestamp (UTC, server-generated for immutability)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Correlation tracking (for bulk operations and traceability)
    correlation_id = Column(String(255), nullable=True, index=True)
    
    # Session tracking (nullable for v1 per design - future: login session tracking)
    session_id = Column(String(255), nullable=True)
    
    # Actor information (who performed the action)
    actor_id = Column(String(100), nullable=False, index=True)  # User ID (from UserModel)
    actor_role = Column(String(50), nullable=True)  # Role at time of action
    
    # Request context
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    
    # Event information (standardized per audit_constants.py)
    action = Column(String(100), nullable=False)  # ACTION_VERB (e.g., "PROJECT_CREATED")
    resource_type = Column(String(50), nullable=False)  # RESOURCE_TYPE (e.g., "Project", "Individual_Requirement")
    resource_id = Column(String(255), nullable=False, index=True)  # ID of affected resource
    
    # 21 CFR Part 11 fields
    reason_for_change = Column(Text, nullable=True)  # Mandatory for modifications
    e_signature_id = Column(String(255), nullable=True)  # Link to cryptographic signature (v2 feature)
    
    # Payload (JSON: before/after state with metadata)
    payload = Column(JSON, nullable=False)  # Enforced structure via audit_schemas.AuditPayload
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ---- INDEXES FOR COMPLIANCE QUERIES ----
    __table_args__ = (
        Index('ix_audit_logs_resource', 'resource_type', 'resource_id'),  # Find all changes to a resource
        Index('ix_audit_logs_actor', 'actor_id'),  # Find all actions by a user
        Index('ix_audit_logs_correlation', 'correlation_id'),  # Find related bulk operations
        Index('ix_audit_logs_timestamp', 'timestamp'),  # Time-range queries for audits
    )

    def __repr__(self):
        return (f"<AuditLogModel(id={self.id}, action={self.action}, "
                f"actor={self.actor_id}, resource={self.resource_type}:{self.resource_id})>")
