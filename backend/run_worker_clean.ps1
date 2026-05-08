# Celery worker startup script for Windows

$ErrorActionPreference = "Stop"

Write-Host "=========================================="
Write-Host "ValiSure Audit Trail - Celery Worker"
Write-Host "=========================================="
Write-Host ""

Write-Host "Activating virtual environment..."
. "venv\Scripts\Activate.ps1"

Write-Host "Starting Celery worker..."
Write-Host "- Broker: redis://localhost:6379/0"
Write-Host "- Concurrency: 4 workers"
Write-Host ""

celery -A celery_config worker --loglevel=info --concurrency=4
