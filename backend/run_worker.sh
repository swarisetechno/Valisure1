#!/bin/bash
# Celery worker startup script for ValiSure audit trail (macOS/Linux)

set -e

echo "=========================================="
echo "ValiSure Audit Trail - Celery Worker"
echo "=========================================="

# Activate virtual environment
source venv/bin/activate

# Set PYTHONPATH to ensure modules are found
export PYTHONPATH=$(pwd)

echo "Starting Celery worker..."
echo "- Broker: redis://localhost:6379/0"
echo "- Concurrency: 4 workers (Unix/Linux only)"
echo ""

export PYTHONPATH=$(pwd)

celery -A celery_config worker --loglevel=info --concurrency=4
