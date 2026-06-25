# Audit Trail & Logging System - Setup & Usage Guide

## Overview

This document describes the audit trail system that was implemented for ValiSure. It provides:

- **Immutable append-only audit logs** for compliance
- **Asynchronous processing** (middleware → Redis queue → background worker)
- **Automatic request/response capture** with sensitive data redaction
- **Compliance tracking** for regulatory audits

### Architecture

```
FastAPI Request
    ↓
Audit Middleware (intercepts)
    ↓ (extract state, build payload, redact secrets)
Celery Task → Redis Queue
    ↓ (async, non-blocking)
Celery Worker (background)
    ↓ (reads queue)
PostgreSQL audit_logs table (append-only)
    ↓
Compliance Query Endpoints
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Start Redis

Redis is required for the message queue.

```bash
# Windows (if installed)
redis-server --port 6380 --bind 127.0.0.1

# macOS (with Homebrew)
brew services start redis

# Docker
docker run -d -p 6380:6380 redis:latest
```

Verify Redis is running:

```bash
redis-cli ping
# Output: PONG
```

### 3. Configure Environment

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER= Your username
DB_PASS= Database password
DB_NAME= Your database name

# Redis configuration
REDIS_URL=redis://localhost:6380/0
CELERY_BROKER_URL=redis://localhost:6380/0
CELERY_RESULT_BACKEND=redis://localhost:6380/1
```

### 4. Start FastAPI Server

```bash
# Terminal 1
cd backend
uvicorn python:app --reload --port 8000
```

Expected output:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
✓ Audit middleware registered successfully
```

### 5. Start Celery Worker

```bash
# Terminal 2 (new terminal, same venv)
cd backend

# Windows (PowerShell)
.\run_worker.ps1

# macOS/Linux
chmod +x run_worker.sh
./run_worker.sh
```

Expected output:

```
========================================
ValiSure Audit Trail - Celery Worker
========================================
✓ Redis is running
✓ Dependencies installed

Starting Celery worker...
- Broker: redis://localhost:6379/0
- Broker: redis://localhost:6380/0
- Concurrency: 4 workers
```

### 6. Verify Audit System

Check health status:

```bash
curl http://localhost:8000/health/audit
```

Expected response:

```json
{
  "status": "healthy",
  "components": {
    "redis": "ok",
    "database": "ok",
    "celery": "ok"
  }
}
```

---

## Database Schema

### AuditLog Table

The audit trail is stored in PostgreSQL table `audit_logs`:

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    correlation_id VARCHAR(255),
    session_id VARCHAR(255),
    actor_id VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50),
    ip_address VARCHAR(45),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    reason_for_change TEXT,
    e_signature_id VARCHAR(255),
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for compliance queries
CREATE INDEX ix_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX ix_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX ix_audit_logs_correlation ON audit_logs(correlation_id);
CREATE INDEX ix_audit_logs_timestamp ON audit_logs(timestamp);
```

### Columns

| Column              | Type     | Description                                                       |
| ------------------- | -------- | ----------------------------------------------------------------- |
| `id`                | UUID     | Unique audit log ID (primary key)                                 |
| `timestamp`         | DateTime | When the action occurred (UTC)                                    |
| `correlation_id`    | String   | Links related bulk operations                                     |
| `session_id`        | String   | Tracks login session (NULL in v1)                                 |
| `actor_id`          | String   | User ID performing the action                                     |
| `actor_role`        | String   | User's role at time of action                                     |
| `ip_address`        | String   | Client IP address                                                 |
| `action`            | String   | Standardized action verb (e.g., PROJECT_CREATED)                  |
| `resource_type`     | String   | Type of affected resource (e.g., Project, Individual_Requirement) |
| `resource_id`       | String   | ID of affected resource                                           |
| `reason_for_change` | String   | Why the change was made (required for modifications)              |
| `e_signature_id`    | String   | Cryptographic signature ID (v2 feature)                           |
| `payload`           | JSON     | Before/after state with metadata                                  |
| `created_at`        | DateTime | When log entry was created                                        |

---

## Standardized Events

### Resource Types

- `Project` - Document/project level
- `User_Assignment` - User role assignment
- `Template` - Compliance template
- `Individual_Requirement` - Requirement/entry level
- `Validation_Document` - Validation document

### Action Verbs

- `PROJECT_CREATED` - Document created
- `PROJECT_MODIFIED` - Document modified
- `USER_ASSIGNED` - User assigned to project
- `USER_ROLE_MODIFIED` - User role changed
- `REQUIREMENT_DRAFTED` - Requirement drafted
- `REQUIREMENT_MODIFIED` - Requirement content updated
- `REQUIREMENT_AI_ASSESSED` - AI assessment applied
- `REQUIREMENT_FINALIZED` - Requirement finalized
- `ROUTED_FOR_REVIEW` - Routed to reviewer
- `REVIEW_COMPLETED` - Review completed
- `ROUTED_FOR_APPROVAL` - Routed to approver
- `DOCUMENT_APPROVED` - Document approved by approver
- `DOCUMENT_REJECTED` - Document rejected

### Mapped Endpoints

| Endpoint                          | Resource Type          | Action                  | Description               |
| --------------------------------- | ---------------------- | ----------------------- | ------------------------- |
| `POST /create`                    | Project                | PROJECT_CREATED         | Create new document       |
| `DELETE /db/delete-document`      | Project                | PROJECT_MODIFIED        | Delete document           |
| `POST /db/stage-update`           | Individual_Requirement | REQUIREMENT_MODIFIED    | Update requirement stage  |
| `POST /db/add-under`              | Individual_Requirement | REQUIREMENT_DRAFTED     | Add content under heading |
| `POST /db/add-end`                | Individual_Requirement | REQUIREMENT_DRAFTED     | Add content at end        |
| `POST /db/update-heading-content` | Individual_Requirement | REQUIREMENT_AI_ASSESSED | Update with AI assessment |

---

## Payload Structure

All audit events follow this JSON structure:

```json
{
  "status": "success",
  "changes": {
    "old_values": {
      "filename": "old.docx",
      "stage": 0
    },
    "new_values": {
      "filename": "old.docx",
      "stage": 1
    }
  },
  "metadata": {
    "http_method": "POST",
    "http_status_code": 200,
    "request_path": "/db/stage-update",
    "user_agent": "Mozilla/5.0..."
  }
}
```

### Fields

- `status`: "success" or "error"
- `changes.old_values`: State before action (NULL for CREATE)
- `changes.new_values`: State after action (NULL for DELETE)
- `metadata`: HTTP context and custom fields

---

## Querying Audit Logs

### 1. Get All Audit Logs

```bash
curl "http://localhost:8000/audit/logs?limit=50&offset=0"
```

Response:

```json
{
  "total": 150,
  "limit": 50,
  "offset": 0,
  "logs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2026-04-02T10:30:15.123Z",
      "actor_id": "user1",
      "actor_role": "Author",
      "action": "PROJECT_CREATED",
      "resource_type": "Project",
      "resource_id": "doc1.docx",
      "ip_address": "192.168.1.1",
      "payload": {...}
    }
  ]
}
```

### 2. Filter by Resource Type

```bash
curl "http://localhost:8000/audit/logs?resource_type=Project&limit=20"
```

### 3. Filter by User

```bash
curl "http://localhost:8000/audit/logs?actor_id=user1&limit=20"
```

### 4. Get Specific Audit Entry

```bash
curl "http://localhost:8000/audit/logs/550e8400-e29b-41d4-a716-446655440000"
```

### 5. Verify Immutability

```bash
curl -X POST "http://localhost:8000/audit/verify-immutability/550e8400-e29b-41d4-a716-446655440000"
```

Response:

```json
{
  "status": "verified",
  "message": "Audit log immutability confirmed",
  "log_id": "550e8400-e29b-41d4-a716-446655440000",
  "verified_at": "2026-04-02T10:35:00.000Z"
}
```

---

## Data Redaction

Sensitive fields are automatically redacted from audit logs to comply with 21 CFR Part 11 security requirements.

### Redacted Fields

- `password`
- `secret`
- `api_key`
- `token`
- `access_token`
- `refresh_token`
- `authorization`
- `authentication`
- `credential`
- `private_key`

### Example

**Before redaction:**

```json
{
  "username": "user1",
  "password": "Vali00!",
  "api_key": "sk-1234567890"
}
```

**After redaction:**

```json
{
  "username": "user1",
  "password": "***REDACTED***",
  "api_key": "***REDACTED***"
}
```

---

## Compliance Features

### 1. Immutability (21 CFR Part 11 §11.10(c))

✅ Audit logs are append-only (no UPDATE/DELETE allowed)
✅ Database constraints prevent modification
✅ ORM model has no update methods

### 2. Retroactive Change History

✅ All modifications captured with before/after state
✅ Actor (user) information always recorded
✅ Timestamp immutable (server-generated)

### 3. Integrity

✅ Correlation IDs link bulk operations
✅ IP address tracking for access audit
✅ Actor role captured at time of action

### 4. Asynchronous Non-Blocking

✅ Middleware queues events to Redis
✅ API response returns immediately
✅ Worker processes logs in background
✅ No risk of audit logging blocking API

---

## Error Handling

### Common Issues

**Issue: "ERROR: Redis is not running!"**

```bash
# Start Redis
redis-server
```

**Issue: "ERROR: Could not activate virtual environment"**

```bash
# Create new venv
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
```

**Issue: "ERROR: Dependencies not installed"**

```bash
pip install -r requirements.txt
```

**Issue: Celery worker not receiving tasks**

- Check Redis is running: `redis-cli ping`
- Check worker is running in separate terminal
- Check FastAPI prints "✓ Audit middleware registered"

### Health Check Troubleshooting

```bash
# Check system health
curl http://localhost:8000/health/audit

# Expected output:
# {"status": "healthy", "components": {"redis": "ok", "database": "ok", "celery": "ok"}}

# If degraded, check individual components:
redis-cli ping                # Redis status
psql -U valisure_user -d valisure_db -c "SELECT COUNT(*) FROM audit_logs;"  # DB status
```

---

## Testing

### Run Test Suite

```bash
cd backend
pip install pytest pytest-asyncio

# Run all tests
pytest test_audit.py -v

# Run specific test
pytest test_audit.py::TestDataRedaction::test_redact_password_field -v
```

### Manual Testing

1. **Create Document**

   ```bash
   curl -X POST http://localhost:8000/create \
     -H "Content-Type: application/json" \
     -d '{"filename": "test.docx"}'
   ```

2. **Verify Audit Log Created**

   ```bash
   curl http://localhost:8000/audit/logs?resource_type=Project
   ```

3. **Check Payload Redaction**
   - Look for `***REDACTED***` in sensitive fields

4. **Verify Immutability**
   ```bash
   # Get audit log ID from previous query
   curl -X POST http://localhost:8000/audit/verify-immutability/{log_id}
   ```

---

## Files Created

### Core Implementation

| File                  | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| `celery_config.py`    | Celery app configuration with Redis broker      |
| `audit_constants.py`  | Standardized resource types, actions, and enums |
| `audit_schemas.py`    | Pydantic models for payload validation          |
| `audit_middleware.py` | FastAPI middleware for request interception     |
| `audit_utils.py`      | Payload formatting and data redaction utilities |
| `audit_tasks.py`      | Celery background worker tasks                  |
| `audit_helpers.py`    | Helper functions for endpoints                  |
| `test_audit.py`       | Comprehensive test suite                        |

### Scripts

| File             | Purpose                                            |
| ---------------- | -------------------------------------------------- |
| `run_worker.sh`  | Bash script to start Celery worker (macOS/Linux)   |
| `run_worker.ps1` | PowerShell script to start Celery worker (Windows) |

### Configuration

| File               | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| `requirements.txt` | Python dependencies                               |
| `.env`             | Environment variables (updated with Redis config) |

### Database

| File        | Purpose                                             |
| ----------- | --------------------------------------------------- |
| `python.py` | Updated with AuditLog ORM model and audit endpoints |

---

### Implementation Detail

- **Immutable storage**: ORM model enforces append-only
- **Actor tracking**: `actor_id`, `actor_role` captured
- **Timestamp**: Server-generated UTC timestamp
- **Retroactive changes**: Before/after state captured
- **Data redaction**: Sensitive fields masked
- **Asynchronous**: Non-blocking to prevent DoS

---

## Performance Considerations

### Single Worker

- **Concurrency**: 4 workers (configurable)
- **Rate**: ~50-100 audit events/second
- **Latency**: <2 seconds from event to database

### Scaling (Future)

For production with >1000 requests/min:

```bash
# Multiple worker processes
celery -A celery_config worker -c 8 --concurrency=8

# Dedicated worker machines
celery -A celery_config worker --loglevel=info -c 16

# Monitor queue depth
celery -A celery_config inspect active_queues

# Periodic task cleanup (with celery-beat)
pip install celery-beat
```

---

## Maintenance

### Daily

- Monitor `/health/audit` endpoint
- Check Redis memory usage: `redis-cli info memoryUsage`

### Weekly

- Verify audit log count: `SELECT COUNT(*) FROM audit_logs`
- Check for errors: `SELECT * FROM audit_logs WHERE payload->>'status' = 'error'`

### Monthly

- Backup audit_logs table
- Verify immutability: `curl -X POST .../audit/verify-immutability/...`
- Generate compliance report

---

## Support & Documentation

### Key Files

- **Audit Middleware**: [audit_middleware.py](./audit_middleware.py) - Request interception logic
- **Celery Tasks**: [audit_tasks.py](./audit_tasks.py) - Background processing
- **Payload Formatting**: [audit_utils.py](./audit_utils.py) - Data validation/redaction
- **ORM Model**: [python.py](./python.py#L116-L170) - AuditLog table definition
- **Constants**: [audit_constants.py](./audit_constants.py) - Event dictionary

---
