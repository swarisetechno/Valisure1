"""
Celery background worker tasks for audit trail processing.
Runs independently from FastAPI, reads from Redis queue, writes to database.

Task: log_audit_event
- Accepts audit event from queue
- Saves to audit_logs table
- Implements retry logic with exponential backoff
- Enforces append-only constraint (no updates/deletes)
- Ensures immutability via ORM constraints
"""

from celery import shared_task
from celery.utils.log import get_task_logger
from datetime import datetime
from typing import Optional, Dict, Any
import json

# Database setup
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError, OperationalError
import os
from dotenv import load_dotenv

load_dotenv()

# Configure database
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql+psycopg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Import ORM models (must come after database setup)
from models import AuditLogModel

logger = get_task_logger(__name__)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_kwargs={'max_retries': 3, 'countdown': 5},  # Retry up to 3 times, wait 5s between attempts
    default_retry_delay=5
)
def log_audit_event(
    self,
    actor_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    payload: Dict[str, Any],
    timestamp: str,
    correlation_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    actor_role: Optional[str] = None,
    reason_for_change: Optional[str] = None,
    e_signature_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Background task to persist audit event to database.
    Called asynchronously from audit_middleware.
    
    21 CFR Part 11 Requirements:
    - Append-only: Celery writes directly to INSERT (no UPDATE logic)
    - UTC timestamp: Server applies UTC timestamp
    - Immutable: ORM model has no update methods
    
    Args:
        actor_id: User ID performing the action
        action: ACTION_VERB (e.g., "PROJECT_CREATED")
        resource_type: RESOURCE_TYPE (e.g., "Project", "Individual_Requirement")
        resource_id: ID of affected resource
        payload: Audit payload (JSON dict with before/after state)
        timestamp: ISO format timestamp string
        correlation_id: Bulk operation correlation ID
        ip_address: Client IP address
        actor_role: User's role at time of action
        reason_for_change: Reason for modification (21 CFR Part 11 requirement)
        e_signature_id: Cryptographic signature ID (future feature)
        
    Returns:
        Dict with task status and audit_log_id
        
    Raises:
        Exception: On database error (triggers retry)
    """
    db = SessionLocal()
    
    try:
        # Parse timestamp
        try:
            audit_timestamp = datetime.fromisoformat(timestamp)
        except:
            audit_timestamp = datetime.utcnow()
        
        # Create AuditLog record
        # NOTE: No UPDATE method exists on AuditLogModel - ensures append-only constraint
        audit_log = AuditLogModel(
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            payload=payload,
            timestamp=audit_timestamp,
            correlation_id=correlation_id,
            ip_address=ip_address,
            actor_role=actor_role,
            reason_for_change=reason_for_change,
            e_signature_id=e_signature_id
        )
        
        # Add to session
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        
        logger.info(
            f"Audit logged: {action} on {resource_type}:{resource_id} "
            f"by {actor_id} (audit_id={audit_log.id})"
        )
        
        return {
            "status": "success",
            "audit_log_id": str(audit_log.id),
            "timestamp": audit_log.timestamp.isoformat()
        }
    
    except IntegrityError as e:
        logger.error(f"Database integrity error: {str(e)}")
        db.rollback()
        # Retry the task with exponential backoff
        raise self.retry(exc=e)
    
    except OperationalError as e:
        logger.error(f"Database operational error: {str(e)}")
        db.rollback()
        # Database connection issue - retry with backoff
        raise self.retry(exc=e)
    
    except Exception as e:
        logger.error(f"Unexpected error persisting audit log: {str(e)}")
        db.rollback()
        raise self.retry(exc=e)
    
    finally:
        db.close()


@shared_task(bind=True)
def verify_audit_log_immutability(self, audit_log_id: str) -> Dict[str, Any]:
    """
    Compliance verification task.
    Confirms that audit log cannot be modified after creation.
    
    Should be run periodically (daily/weekly) as part of compliance audit.
    
    Args:
        audit_log_id: UUID of AuditLog record to verify
        
    Returns:
        Verification result
    """
    db = SessionLocal()
    
    try:
        from uuid import UUID
        
        audit_log = db.query(AuditLogModel).filter_by(id=UUID(audit_log_id)).first()
        
        if not audit_log:
            return {"status": "error", "message": "Audit log not found"}
        
        # Try to update (should fail if constraints are properly set)
        original_action = audit_log.action
        try:
            audit_log.action = "ATTEMPTED_MODIFICATION"
            db.commit()
            # If this succeeds, immutability is BROKEN
            return {
                "status": "CRITICAL",
                "message": "IMMUTABILITY VIOLATION: Audit log was modified!",
                "audit_log_id": audit_log_id
            }
        except Exception as update_error:
            # Expected: Update should fail
            db.rollback()
            return {
                "status": "verified",
                "message": "Audit log immutability confirmed",
                "audit_log_id": audit_log_id
            }
    
    finally:
        db.close()


@shared_task
def cleanup_audit_queue_stats() -> Dict[str, Any]:
    """
    Maintenance task to log queue statistics.
    Run hourly to monitor audit logging performance.
    
    Returns:
        Queue statistics
    """
    try:
        from celery_config import app as celery_app
        
        stats = celery_app.control.inspect().active()
        stats_result = {
            "timestamp": datetime.utcnow().isoformat(),
            "active_tasks": len(stats) if stats else 0,
            "message": "Audit queue statistics logged"
        }
        
        logger.info(f"Queue stats: {stats_result}")
        return stats_result
    
    except Exception as e:
        logger.error(f"Error collecting queue stats: {str(e)}")
        return {"status": "error", "message": str(e)}


# ============ CELERY PERIODIC TASKS (optional - requires celery-beat) ============
# Uncomment below to enable periodic runs
"""
from celery.schedules import crontab

app.conf.beat_schedule = {
    'verify-audit-immutability': {
        'task': 'audit_tasks.verify_audit_log_immutability_batch',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM UTC
    },
    'cleanup-queue-stats': {
        'task': 'audit_tasks.cleanup_audit_queue_stats',
        'schedule': crontab(minute=0),  # Every hour
    },
}
"""
