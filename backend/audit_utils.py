"""
Audit payload formatting and data redaction utilities.
Ensures compliance with 21 CFR Part 11 by sanitizing sensitive data.
"""

from typing import Any, Dict, Optional, Tuple
from copy import deepcopy
from datetime import datetime
from audit_constants import REDACT_FIELDS
from audit_schemas import AuditPayload, AuditPayloadChanges, AuditPayloadMetadata


def redact_sensitive_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively redact sensitive fields from request/response payloads.
    
    Protects Active Directory credentials, API keys, passwords from audit logs.
    Required by 21 CFR Part 11 - audit logs must not contain security credentials.
    
    Args:
        data: Dictionary potentially containing sensitive fields
        
    Returns:
        Dictionary with sensitive fields replaced with "***REDACTED***"
    """
    if not isinstance(data, dict):
        return data
    
    redacted = deepcopy(data)
    
    for key, value in redacted.items():
        # Check if key contains sensitive field names (case-insensitive)
        if any(sensitive in key.lower() for sensitive in REDACT_FIELDS):
            redacted[key] = "***REDACTED***"
        # Recursively redact nested dictionaries
        elif isinstance(value, dict):
            redacted[key] = redact_sensitive_data(value)
        # Recursively redact lists of dictionaries
        elif isinstance(value, list):
            redacted[key] = [
                redact_sensitive_data(item) if isinstance(item, dict) else item
                for item in value
            ]
    
    return redacted


def extract_changes(
    old_state: Optional[Dict[str, Any]],
    new_state: Optional[Dict[str, Any]]
) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Extract meaningful changes between old and new state.
    Redacts sensitive data from both states.
    
    Args:
        old_state: State before the action (None for CREATE)
        new_state: State after the action (None for DELETE)
        
    Returns:
        Tuple of (redacted_old_values, redacted_new_values)
    """
    redacted_old = redact_sensitive_data(old_state) if old_state else None
    redacted_new = redact_sensitive_data(new_state) if new_state else None
    
    return redacted_old, redacted_new


def build_audit_payload(
    status: str,
    old_values: Optional[Dict[str, Any]],
    new_values: Optional[Dict[str, Any]],
    http_method: Optional[str] = None,
    http_status_code: Optional[int] = None,
    request_path: Optional[str] = None,
    user_agent: Optional[str] = None,
    custom_metadata: Optional[Dict[str, Any]] = None
) -> AuditPayload:
    """
    Build compliance-compliant audit payload with strict structure.
    
    Enforces the exact JSON structure required by 21 CFR Part 11:
    {
        "status": "success|error",
        "changes": {
            "old_values": {...},  # Null if CREATE
            "new_values": {...}   # Null if DELETE
        },
        "metadata": {...}
    }
    
    Args:
        status: 'success' or 'error'
        old_values: Previous state (None for CREATE)
        new_values: New state (None for DELETE)
        http_method: HTTP method (POST, GET, etc.)
        http_status_code: HTTP response status
        request_path: API endpoint path
        user_agent: Client user agent string
        custom_metadata: Additional metadata fields
        
    Returns:
        AuditPayload object (validated by Pydantic)
    """
    # Redact sensitive data
    redacted_old, redacted_new = extract_changes(old_values, new_values)
    
    # Build changes section
    changes = AuditPayloadChanges(
        old_values=redacted_old,
        new_values=redacted_new
    )
    
    # Build metadata section
    metadata_dict = {
        "http_method": http_method,
        "http_status_code": http_status_code,
        "request_path": request_path,
        "user_agent": user_agent,
        "custom_fields": custom_metadata or {}
    }
    metadata = AuditPayloadMetadata(**metadata_dict)
    
    # Build and validate complete payload
    payload = AuditPayload(
        status=status,
        changes=changes,
        metadata=metadata
    )
    
    return payload


def extract_request_body(request_data: Any) -> Optional[Dict[str, Any]]:
    """
    Extract JSON body from request.
    Handles both dict and complex objects.
    
    Args:
        request_data: Raw request data
        
    Returns:
        Dictionary of request data or None
    """
    if isinstance(request_data, dict):
        return request_data
    elif hasattr(request_data, 'dict'):
        return request_data.dict()
    elif isinstance(request_data, str):
        try:
            import json
            return json.loads(request_data)
        except:
            return {"raw": request_data}
    return None


def extract_response_body(response_data: Any) -> Optional[Dict[str, Any]]:
    """
    Extract JSON body from response.
    Handles both dict and complex FastAPI responses.
    
    Args:
        response_data: Raw response data
        
    Returns:
        Dictionary of response data or None
    """
    if isinstance(response_data, dict):
        return response_data
    elif hasattr(response_data, 'body'):
        try:
            import json
            return json.loads(response_data.body)
        except:
            return None
    return None


def generate_correlation_id() -> str:
    """
    Generate a correlation ID for bulk operations.
    Used to tie multiple audit events together (e.g., batch imports).
    
    Returns:
        UUID-based correlation ID string
    """
    from uuid import uuid4
    return str(uuid4())


def get_ip_address_from_request(request) -> Optional[str]:
    """
    Extract client IP address from FastAPI request.
    Handles X-Forwarded-For headers (proxy/load balancer).
    
    Args:
        request: FastAPI Request object
        
    Returns:
        IP address string (IPv4 or IPv6) or None
    """
    try:
        # Check for X-Forwarded-For header (load balancer/proxy)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        # Fall back to direct connection
        if request.client:
            return request.client.host
    except:
        pass
    
    return None


def mask_pii(value: str) -> str:
    """
    Mask personally identifiable information in log field values.
    E.g., email, phone number, SSN.
    
    Args:
        value: String value potentially containing PII
        
    Returns:
        Masked value
    """
    if not isinstance(value, str):
        return value
    
    # Email: user****@domain.com
    if "@" in value and len(value) > 5:
        parts = value.split("@")
        if len(parts) == 2:
            local = parts[0]
            domain = parts[1]
            masked_local = local[0] + "*" * len(local[1:-1]) + local[-1] if len(local) > 2 else "*" * len(local)
            return f"{masked_local}@{domain}"
    
    # Phone: ***-***-**99
    if len(value) >= 10 and value.replace("-", "").isdigit():
        return "***-***-**" + value[-2:]
    
    return value
