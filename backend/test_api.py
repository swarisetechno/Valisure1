import sys
sys.path.append('.')
import requests

# Login
resp = requests.post('http://localhost:8000/db/login', json={"username_or_email": "user1", "password": "Admin@123"})
if resp.status_code != 200:
    print(f"Login failed: {resp.status_code} {resp.text}")
    sys.exit(1)

token = resp.json()['access_token']
print(f"Login OK, token obtained")

# Get audit logs
logs_resp = requests.get('http://localhost:8000/audit/logs?limit=3', headers={"Authorization": f"Bearer {token}"})
if logs_resp.status_code != 200:
    print(f"Audit logs failed: {logs_resp.status_code} {logs_resp.text}")
    sys.exit(1)

data = logs_resp.json()
print(f"\nTotal logs: {data['total']}")
for log in data['logs']:
    print(f"  [{log['timestamp']}] actor_id={log['actor_id']} actor_name={log.get('actor_name')} action={log['action']}")
