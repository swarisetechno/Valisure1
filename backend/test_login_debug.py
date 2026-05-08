import requests
import json

def test_login():
    url = "http://localhost:8000/db/login"
    payload = {
        "username_or_email": "admin", # or a known user
        "password": "password"
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_login()
