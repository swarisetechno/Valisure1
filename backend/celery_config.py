"""
Celery configuration for ValiSure audit trail async processing.
Uses Redis as both broker and result backend.
"""

import os
from celery import Celery
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# -------------------- CELERY APP SETUP --------------------
app = Celery('valisure_audit')

# Get configuration from environment
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1')

# Configure Celery
app.conf.update(
    # Broker and backend configuration
    broker_url=CELERY_BROKER_URL,
    result_backend=CELERY_RESULT_BACKEND,
    
    # Windows compatibility: use solo pool to avoid PermissionError with prefork
    worker_pool='solo',

    # Timezone settings (compliance requirement for 21 CFR Part 11)
    timezone='UTC',
    enable_utc=True,
    
    # Task configuration
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    
    # Retry configuration for audit tasks
    task_acks_late=True,
    worker_prefetch_multiplier=4,
    
    # Result backend expiration (keep audit task results for 24 hours)
    result_expires=86400,
)

# Register tasks by directly importing audit_tasks module
try:
    import audit_tasks
    print("[OK] Audit tasks registered successfully")
except ImportError as e:
    print(f"[WARNING] Could not import audit_tasks: {e}")

@app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery connectivity"""
    print(f'Request: {self.request!r}')
