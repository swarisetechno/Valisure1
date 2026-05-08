"""
Pydantic schemas for audit trail request/response models.
Ensures data validation and serialization for audit events.
"""

from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime
from uuid import UUID


class AuditPayloadChanges(BaseModel):
    """Captures before/after state changes"""
    old_values: Optional[Dict[str, Any]] = Field(None, description="State before the action (NULL for CREATE)")
    new_values: Optional[Dict[str, Any]] = Field(None, description="State after the action (NULL for DELETE)")


class AuditPayloadMetadata(BaseModel):
    """Optional metadata attached to audit event"""
    http_method: Optional[str] = None
    http_status_code: Optional[int] = None
    request_path: Optional[str] = None
    user_agent: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = {}


class AuditPayload(BaseModel):
    """
    Complete audit payload structure (21 CFR Part 11 compliant).
    Enforces strict JSON schema for audit trail immutability verification.
    """
    status: str = Field(..., description="'success' or 'error'")
    changes: AuditPayloadChanges
    metadata: Optional[AuditPayloadMetadata] = None

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "changes": {
                    "old_values": None,
                    "new_values": {"filename": "doc.docx", "current_stage": 0}
                },
                "metadata": {
                    "http_method": "POST",
                    "http_status_code": 200,
                    "request_path": "/create",
                    "user_agent": "Mozilla/5.0..."
                }
            }
        }


class AuditLogCreateRequest(BaseModel):
    """
    Request schema for creating audit log entries.
    Used by Celery tasks to write to database.
    """
    actor_id: str
    action: str
    resource_type: str
    resource_id: str
    payload: AuditPayload
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    correlation_id: Optional[str] = None
    ip_address: Optional[str] = None
    actor_role: Optional[str] = None
    reason_for_change: Optional[str] = None
    e_signature_id: Optional[str] = None


class AuditLogResponse(BaseModel):
    """
    Response schema for retrieving audit log entries.
    Sent to clients when querying audit trail.
    """
    id: UUID
    timestamp: datetime
    correlation_id: Optional[str]
    session_id: Optional[str]
    actor_id: str
    actor_role: Optional[str]
    ip_address: Optional[str]
    action: str
    resource_type: str
    resource_id: str
    reason_for_change: Optional[str]
    e_signature_id: Optional[str]
    payload: Dict[str, Any]

    class Config:
        from_attributes = True  # Allow ORM model to dict conversion


class AuditLogQueryRequest(BaseModel):
    """
    Request schema for querying audit logs (compliance/forensics).
    """
    actor_id: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    action: Optional[str] = None
    correlation_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = Field(100, le=1000, ge=1)
    offset: int = Field(0, ge=0)
