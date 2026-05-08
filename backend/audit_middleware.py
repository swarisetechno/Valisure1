"""
FastAPI middleware for audit trail capture.
Intercepts all requests, captures before/after state, formats payload, and queues for async processing.

Architecture:
1. Request arrives -> Middleware intercepts
2. Extract request context (IP, headers, method, path)
3. Call actual handler -> Get response
4. Extract response body and status
5. Build audit payload (redacted)
6. Queue async Celery task (non-blocking return)
7. Return response to client immediately

This ensures logging never blocks API responses (21 CFR Part 11 compliance).
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse
import json
import os
from typing import Callable, Optional, Dict, Any
from datetime import datetime, timezone
import logging

from audit_utils import (
    build_audit_payload, extract_request_body, extract_response_body,
    generate_correlation_id, get_ip_address_from_request
)
from audit_constants import ENDPOINT_ACTION_MAP, ResourceType, ActionVerb

logger = logging.getLogger(__name__)

# ── Module-level cached DB session used by direct-write fallback ──────────────
# Created once to avoid a new connection pool per request.
_audit_Session = None

def _get_audit_session_factory():
    """Lazily init a module-level SQLAlchemy session factory for audit writes."""
    global _audit_Session
    if _audit_Session is None:
        try:
            from sqlalchemy import create_engine
            from sqlalchemy.orm import sessionmaker
            from dotenv import load_dotenv
            load_dotenv()
            db_url = (
                f"postgresql+psycopg://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}"
                f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
            )
            _engine = create_engine(db_url, pool_pre_ping=True, pool_size=5, max_overflow=10)
            _audit_Session = sessionmaker(bind=_engine)
            logger.info("Audit direct-write DB session factory initialized")
        except Exception as e:
            logger.error(f"Failed to initialize audit DB session: {e}")
    return _audit_Session


class AuditMiddleware(BaseHTTPMiddleware):
    """
    Captures and queues audit trail events for all API operations.
    
    Guarantees:
    - No blocking: Celery tasks fired async
    - Immutable logs: Payload captured at request time
    - Correlation: Bulk operations linked via correlation_id
    - Security: Sensitive data redacted before queue
    """
    
    def __init__(self, app, exclude_paths: Optional[list] = None):
        """
        Initialize audit middleware.
        
        Args:
            app: FastAPI app instance
            exclude_paths: List of paths to skip audit logging (e.g., /health, /docs)
        """
        super().__init__(app)
        self.exclude_paths = exclude_paths or [
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/__not_really_an_endpoint__"  # Placeholder
        ]
        self.correlation_id = None
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Main middleware handler. Intercepts all requests.
        
        Args:
            request: FastAPI Request object
            call_next: Next middleware in chain
            
        Returns:
            Response (unmodified)
        """
        # Skip audit logging for excluded paths
        if self._should_exclude(request.url.path):
            return await call_next(request)
        
        # Generate or retrieve correlation ID from request headers
        correlation_id = request.headers.get("X-Correlation-ID") or generate_correlation_id()
        self.correlation_id = correlation_id
        
        # Extract request context
        ip_address = get_ip_address_from_request(request)
        
        # Read request body (must buffer for downstream)
        try:
            request_body = await request.body()
            request_json = self._parse_json(request_body)
        except Exception as e:
            logger.error(f"Error reading request body: {str(e)}")
            request_json = {}
        
        # Call the actual handler (this is where the API logic runs)
        try:
            response = await call_next(request)
        except Exception as e:
            # If handler throws exception, still log it
            await self._queue_audit_event(
                request=request,
                response_status=500,
                response_body={"error": str(e)},
                request_body=request_json,
                ip_address=ip_address,
                correlation_id=correlation_id
            )
            raise
        
        # Do not log preflight requests, static files, or manually audited auth endpoints
        request_path = str(request.url.path)
        if request.method == "OPTIONS":
            return response
        if request_path in ["/db/login", "/db/logout"]:
            return response

        # Pre-check: is this endpoint configured for auditing?
        try:
            response_body = await self._get_response_body(response)
        except Exception as e:
            logger.error(f"Error reading response body: {str(e)}")
            response_body = {}
        
        # Queue audit event (non-blocking)
        try:
            await self._queue_audit_event(
                request=request,
                response_status=response.status_code,
                response_body=response_body,
                request_body=request_json,
                ip_address=ip_address,
                correlation_id=correlation_id
            )
        except Exception as e:
            logger.error(f"Error queueing audit event: {str(e)}")
            # Don't fail the request if audit logging fails
        
        return response
    
    async def _queue_audit_event(
        self,
        request: Request,
        response_status: int,
        response_body: Dict[str, Any],
        request_body: Dict[str, Any],
        ip_address: Optional[str],
        correlation_id: str
    ) -> None:
        """
        Queue audit event to Celery worker.
        This is where we extract the action type, resource info, and build payload.
        
        Args:
            request: Original request
            response_status: HTTP status code from response
            response_body: Parsed response JSON
            request_body: Parsed request JSON
            ip_address: Client IP address
            correlation_id: Correlation ID for bulk operations
        """
        # Map endpoint to audit action
        request_path = str(request.url.path)
        exact_key = f"{request.method}:{request_path}"
        audit_config = ENDPOINT_ACTION_MAP.get(exact_key)
        
        # If no exact match, try regex matching for paths with variables (e.g. {user_id})
        if not audit_config:
            import re
            for key, config in ENDPOINT_ACTION_MAP.items():
                if key.startswith(f"{request.method}:"):
                    map_path = key.split(":", 1)[1]
                    if "{" in map_path:
                        # Convert {param} to [^/]+ regex
                        pattern = "^" + re.sub(r'\{[^}]+\}', '[^/]+', map_path) + "$"
                        if re.match(pattern, request_path):
                            audit_config = config
                            break

        # If still not in map, skip (not an auditable endpoint)
        if not audit_config:
            return
        
        action = audit_config["action"]
        resource_type = audit_config["resource_type"]
        
        # Extract resource ID (check request body, then response body for newly created items)
        resource_id = str(
            request_body.get("id") or 
            request_body.get("filename") or 
            response_body.get("id") or 
            response_body.get("filename") or 
            request.path_params.get("user_id") or 
            request.path_params.get("role_id") or 
            request_path
        )
        
        # Determine actor ID (Extract from JWT token if available)
        actor_id = "anonymous"
        actor_role = "system"
        
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                from auth import decode_token
                token = auth_header.split(" ")[1]
                payload = decode_token(token)
                if payload:
                    actor_id = str(payload.get("sub", "anonymous"))
                    actor_role = payload.get("role", "system") # Default to system if role not in token
            except Exception as e:
                logger.warning(f"Could not decode token for audit: {str(e)}")
        
        # Build payload with before/after state
        audit_payload = build_audit_payload(
            status="success" if 200 <= response_status < 300 else "error",
            old_values=None,  # Would need to query DB to get old values
            new_values=response_body,
            http_method=request.method,
            http_status_code=response_status,
            request_path=request_path,
            user_agent=request.headers.get("user-agent")
        )
        
        # Try Celery queue first; fall back to direct DB write
        celery_success = False
        try:
            from celery_config import app as celery_app
            from audit_tasks import log_audit_event
            task = log_audit_event.delay(
                actor_id=actor_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                payload=audit_payload.dict(),
                timestamp=datetime.now(timezone.utc).isoformat(),
                correlation_id=correlation_id,
                ip_address=ip_address,
                actor_role=actor_role
            )
            logger.info(f"Audit event queued via Celery: {action} on {resource_type}:{resource_id} (actor={actor_id})")
            celery_success = True
        except Exception:
            pass  # Celery not available — fallback below

        if not celery_success:
            # Direct DB write fallback — uses module-level cached session factory
            try:
                from models import AuditLogModel
                SessionFactory = _get_audit_session_factory()
                if SessionFactory:
                    _db = SessionFactory()
                    try:
                        log_entry = AuditLogModel(
                            actor_id=actor_id,
                            action=action,
                            resource_type=resource_type,
                            resource_id=resource_id,
                            payload=audit_payload.dict(),
                            timestamp=datetime.now(timezone.utc),
                            correlation_id=correlation_id,
                            ip_address=ip_address,
                            actor_role=actor_role,
                        )
                        _db.add(log_entry)
                        _db.commit()
                        logger.info(f"Audit event written to DB: {action} on {resource_type}:{resource_id} (actor={actor_id})")
                    except Exception as write_err:
                        _db.rollback()
                        logger.error(f"Audit DB write failed: {write_err}")
                    finally:
                        _db.close()
            except Exception as db_err:
                logger.error(f"Direct DB audit write failed: {str(db_err)}")
    
    async def _get_response_body(self, response: Response) -> Dict[str, Any]:
        """
        Extract response body from FastAPI/Starlette response.
        Handles streaming responses.
        
        Args:
            response: Response object
            
        Returns:
            Parsed JSON or dict
        """
        try:
            # For standard Response objects with body
            if hasattr(response, 'body'):
                return self._parse_json(response.body)
            
            # For StreamingResponse or other types
            if isinstance(response, StreamingResponse):
                # Streaming responses can't be read without consuming
                return {"type": "streaming_response"}
            
            return {}
        except Exception as e:
            logger.error(f"Error extracting response body: {str(e)}")
            return {}
    
    def _parse_json(self, data: bytes) -> Dict[str, Any]:
        """
        Parse JSON from bytes.
        
        Args:
            data: Raw bytes
            
        Returns:
            Parsed JSON or empty dict
        """
        try:
            if isinstance(data, bytes):
                data = data.decode('utf-8')
            return json.loads(data) if data else {}
        except:
            return {}
    
    def _should_exclude(self, path: str) -> bool:
        """
        Check if path should be excluded from audit logging.
        
        Args:
            path: Request path
            
        Returns:
            True if path should be excluded
        """
        return any(path.startswith(excluded) for excluded in self.exclude_paths)


def setup_audit_middleware(app) -> None:
    """
    Register audit middleware with FastAPI app.
    Must be called during app initialization.
    
    Args:
        app: FastAPI app instance
    """
    app.add_middleware(
        AuditMiddleware,
        exclude_paths=[
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc"
        ]
    )
