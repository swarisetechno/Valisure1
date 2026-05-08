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
Write-Host "- Pool: solo (Windows compatible)"
Write-Host ""

# Set PYTHONPATH to ensure modules are found
$env:PYTHONPATH = Get-Location

celery -A celery_config worker --loglevel=info --pool=solo
