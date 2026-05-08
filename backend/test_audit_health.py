import subprocess
import time
import urllib.request
import os
import signal

print("Starting Uvicorn...")
pro = subprocess.Popen(["python", "-m", "uvicorn", "python:app", "--port", "8000"], cwd=os.path.dirname(__file__))

time.sleep(4)  # Wait for server to boot

print("Checking Health Endpoint...")
try:
    req = urllib.request.Request("http://127.0.0.1:8000/health/audit")
    with urllib.request.urlopen(req) as response:
        print("Status Code:", response.getcode())
        print("Response:", response.read().decode('utf-8'))
except Exception as e:
    print("Error hitting endpoint:", e)

# Kill server gracefully-ish
pro.terminate()
try:
    pro.wait(3)
except:
    pro.kill()
print("Test completed.")
