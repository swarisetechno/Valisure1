"""
Audit trail constants and standardized event dictionary.
Enforces 21 CFR Part 11 compliance with standardized resource types and action verbs.
"""

from enum import Enum

# -------------------- RESOURCE TYPES --------------------
class ResourceType(str, Enum):
    """Standardized resource types affected by audit events"""
    PROJECT = "Project"
    USER_ASSIGNMENT = "User_Assignment"
    TEMPLATE = "Template"
    INDIVIDUAL_REQUIREMENT = "Individual_Requirement"
    VALIDATION_DOCUMENT = "Validation_Document"


# -------------------- ACTION VERBS --------------------
class ActionVerb(str, Enum):
    """Standardized event verbs for compliance audit trails"""
    PROJECT_CREATED = "PROJECT_CREATED"
    PROJECT_MODIFIED = "PROJECT_MODIFIED"
    USER_ASSIGNED = "USER_ASSIGNED"
    USER_ROLE_MODIFIED = "USER_ROLE_MODIFIED"
    REQUIREMENT_DRAFTED = "REQUIREMENT_DRAFTED"
    REQUIREMENT_AI_ASSESSED = "REQUIREMENT_AI_ASSESSED"
    REQUIREMENT_FINALIZED = "REQUIREMENT_FINALIZED"
    REQUIREMENT_MODIFIED = "REQUIREMENT_MODIFIED"
    ROUTED_FOR_REVIEW = "ROUTED_FOR_REVIEW"
    REVIEW_COMPLETED = "REVIEW_COMPLETED"
    ROUTED_FOR_APPROVAL = "ROUTED_FOR_APPROVAL"
    DOCUMENT_APPROVED = "DOCUMENT_APPROVED"
    DOCUMENT_REJECTED = "DOCUMENT_REJECTED"
    # User management
    USER_LOGGED_IN = "USER_LOGGED_IN"
    USER_LOGGED_OUT = "USER_LOGGED_OUT"
    USER_CREATED = "USER_CREATED"
    USER_MODIFIED = "USER_MODIFIED"
    USER_DELETED = "USER_DELETED"
    USER_LIST_ACCESSED = "USER_LIST_ACCESSED"
    
    # Role management
    ROLE_CREATED = "ROLE_CREATED"
    ROLE_MODIFIED = "ROLE_MODIFIED"
    ROLE_DELETED = "ROLE_DELETED"
    ROLE_LIST_ACCESSED = "ROLE_LIST_ACCESSED"

    # Audit & System metadata
    DASHBOARD_ACCESSED = "DASHBOARD_ACCESSED"
    PROJECT_LIST_ACCESSED = "PROJECT_LIST_ACCESSED"
    DOCUMENT_INFO_ACCESSED = "DOCUMENT_INFO_ACCESSED"
    DOCUMENT_SEARCHED = "DOCUMENT_SEARCHED"
    DOCUMENT_HEADINGS_ACCESSED = "DOCUMENT_HEADINGS_ACCESSED"
    HEADING_CONTENT_ACCESSED = "HEADING_CONTENT_ACCESSED"
    AUDIT_LOGS_ACCESSED = "AUDIT_LOGS_ACCESSED"
    AUDIT_LOG_DETAIL_ACCESSED = "AUDIT_LOG_DETAIL_ACCESSED"
    AUDIT_VERIFICATION_PERFORMED = "AUDIT_VERIFICATION_PERFORMED"


# -------------------- ENDPOINT TO AUDIT MAPPING --------------------
ENDPOINT_ACTION_MAP = {
    # Auth
    "POST:/db/login": {
        "resource_type": ResourceType.USER_ASSIGNMENT,
        "action": ActionVerb.USER_LOGGED_IN,
        "description": "User login"
    },
    "POST:/db/logout": {
        "resource_type": ResourceType.USER_ASSIGNMENT,
        "action": ActionVerb.USER_LOGGED_OUT,
        "description": "User logout"
    },
    
    # User Operations
    "POST:/db/create-user": {
        "resource_type": ResourceType.USER_ASSIGNMENT,
        "action": ActionVerb.USER_CREATED,
        "description": "User creation"
    },
    "GET:/db/list-users": {
        "resource_type": ResourceType.USER_ASSIGNMENT,
        "action": ActionVerb.USER_LIST_ACCESSED,
        "description": "List all users"
    },
    "PUT:/db/update-user/{user_id}": {
        "resource_type": ResourceType.USER_ASSIGNMENT,
        "action": ActionVerb.USER_MODIFIED,
        "description": "User modification"
    },
    "DELETE:/db/delete-user/{user_id}": {
        "resource_type": ResourceType.USER_ASSIGNMENT,
        "action": ActionVerb.USER_DELETED,
        "description": "User deletion"
    },
    
    # Role Operations
    "POST:/db/create-role": {
        "resource_type": ResourceType.USER_ASSIGNMENT,
        "action": ActionVerb.ROLE_CREATED,
        "description": "Role creation"
    },
    "GET:/db/list-roles": {
        "resource_type": ResourceType.USER_ASSIGNMENT,
        "action": ActionVerb.ROLE_LIST_ACCESSED,
        "description": "List all roles"
    },
    "PUT:/db/update-role/{role_id}": {
        "resource_type": ResourceType.USER_ASSIGNMENT,
        "action": ActionVerb.ROLE_MODIFIED,
        "description": "Role modification"
    },
    "DELETE:/db/delete-role/{role_id}": {
        "resource_type": ResourceType.USER_ASSIGNMENT,
        "action": ActionVerb.ROLE_DELETED,
        "description": "Role deletion"
    },

    # Document/Project operations
    "POST:/create": {
        "resource_type": ResourceType.PROJECT,
        "action": ActionVerb.PROJECT_CREATED,
        "description": "Document creation"
    },
    "GET:/db/projects": {
        "resource_type": ResourceType.PROJECT,
        "action": ActionVerb.PROJECT_LIST_ACCESSED,
        "description": "List all projects"
    },
    "POST:/db/projects": {
        "resource_type": ResourceType.PROJECT,
        "action": ActionVerb.PROJECT_CREATED,
        "description": "Project creation"
    },
    "DELETE:/db/delete-project": {
        "resource_type": ResourceType.PROJECT,
        "action": ActionVerb.PROJECT_MODIFIED,
        "description": "Project deletion"
    },
    "GET:/db/dashboard": {
        "resource_type": ResourceType.PROJECT,
        "action": ActionVerb.DASHBOARD_ACCESSED,
        "description": "Dashboard access"
    },
    "GET:/db/search": {
        "resource_type": ResourceType.PROJECT,
        "action": ActionVerb.DOCUMENT_SEARCHED,
        "description": "Document search"
    },
    "GET:/db/search-global-by-filename": {
        "resource_type": ResourceType.PROJECT,
        "action": ActionVerb.DOCUMENT_SEARCHED,
        "description": "Global search by filename"
    },
    "GET:/db/document-info": {
        "resource_type": ResourceType.VALIDATION_DOCUMENT,
        "action": ActionVerb.DOCUMENT_INFO_ACCESSED,
        "description": "View document metadata"
    },
    "DELETE:/db/delete-document": {
        "resource_type": ResourceType.PROJECT,
        "action": ActionVerb.PROJECT_MODIFIED,
        "description": "Document deletion"
    },
    "POST:/db/stage-update": {
        "resource_type": ResourceType.INDIVIDUAL_REQUIREMENT,
        "action": ActionVerb.REQUIREMENT_MODIFIED,
        "description": "Requirement stage update"
    },
    "GET:/db/document-headings": {
        "resource_type": ResourceType.INDIVIDUAL_REQUIREMENT,
        "action": ActionVerb.DOCUMENT_HEADINGS_ACCESSED,
        "description": "List document headings"
    },
    "POST:/db/create-heading": {
        "resource_type": ResourceType.INDIVIDUAL_REQUIREMENT,
        "action": ActionVerb.REQUIREMENT_DRAFTED,
        "description": "Create new heading"
    },
    "POST:/db/update-heading-status": {
        "resource_type": ResourceType.INDIVIDUAL_REQUIREMENT,
        "action": ActionVerb.REQUIREMENT_MODIFIED,
        "description": "Update heading status"
    },
    "DELETE:/db/delete-heading": {
        "resource_type": ResourceType.INDIVIDUAL_REQUIREMENT,
        "action": ActionVerb.REQUIREMENT_MODIFIED,
        "description": "Delete heading"
    },
    "GET:/db/heading-content": {
        "resource_type": ResourceType.INDIVIDUAL_REQUIREMENT,
        "action": ActionVerb.HEADING_CONTENT_ACCESSED,
        "description": "View heading content"
    },
    "POST:/db/update-heading-content": {
        "resource_type": ResourceType.INDIVIDUAL_REQUIREMENT,
        "action": ActionVerb.REQUIREMENT_AI_ASSESSED,
        "description": "Heading content update (AI assessment)"
    },
    "POST:/db/generate-heading-content": {
        "resource_type": ResourceType.INDIVIDUAL_REQUIREMENT,
        "action": ActionVerb.REQUIREMENT_AI_ASSESSED,
        "description": "Generate heading content via AI"
    },
    "POST:/add-under": {
        "resource_type": ResourceType.INDIVIDUAL_REQUIREMENT,
        "action": ActionVerb.REQUIREMENT_DRAFTED,
        "description": "Add content under heading"
    },
    "POST:/add-end": {
        "resource_type": ResourceType.INDIVIDUAL_REQUIREMENT,
        "action": ActionVerb.REQUIREMENT_DRAFTED,
        "description": "Add content at document end"
    },

    # Audit System Operations
    "GET:/audit/logs": {
        "resource_type": ResourceType.VALIDATION_DOCUMENT,
        "action": ActionVerb.AUDIT_LOGS_ACCESSED,
        "description": "List audit logs"
    },
    "GET:/audit/logs/{log_id}": {
        "resource_type": ResourceType.VALIDATION_DOCUMENT,
        "action": ActionVerb.AUDIT_LOG_DETAIL_ACCESSED,
        "description": "View specific audit log"
    },
    "POST:/audit/verify-immutability/{log_id}": {
        "resource_type": ResourceType.VALIDATION_DOCUMENT,
        "action": ActionVerb.AUDIT_VERIFICATION_PERFORMED,
        "description": "Perform audit log verification"
    },
}


# -------------------- ACTOR ROLES --------------------
class ActorRole(str, Enum):
    """User roles for 21 CFR Part 11 accountability"""
    ADMIN = "Admin"
    SYSTEM_ADMIN = "System Admin"
    AUTHOR = "Author"
    REVIEWER = "Reviewer"
    APPROVER = "Approver"
    VIEWER = "Viewer"


# -------------------- STATUS CONSTRAINTS --------------------
# Requirements in these statuses cannot be modified
LOCKED_REQUIREMENT_STATUSES = [
    "Assessed",
    "Review in Progress",
    "Approved"
]

# Fields that must be redacted from audit logs (sensitive data)
REDACT_FIELDS = {
    "password",
    "secret",
    "api_key",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "authentication",
    "credential",
    "private_key"
}
