r"""
Run this ONCE to authorize ValiSure to access your personal Google Drive.
It will open a browser window asking you to log in with your Google account.
After you approve, it saves a 'token.json' file - that's the credential file the app uses going forward.

Usage:
    cd backend
    python setup_google_drive.py
"""
import os
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# The scopes we need - full Drive access to read/write files and folders
SCOPES = ['https://www.googleapis.com/auth/drive']

CLIENT_SECRET_FILE = os.path.join(os.path.dirname(__file__), 'client_secret.json')
TOKEN_FILE = os.path.join(os.path.dirname(__file__), 'token.json')


def get_drive_service():
    """Get authenticated Google Drive service."""
    creds = None

    # Load existing token if available
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    # If no valid credentials, do the OAuth flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired token...")
            creds.refresh(Request())
        else:
            if not os.path.exists(CLIENT_SECRET_FILE):
                print(f"\n❌ ERROR: client_secret.json not found at:\n   {CLIENT_SECRET_FILE}")
                print("\nPlease follow these steps:")
                print("1. Go to https://console.cloud.google.com")
                print("2. Enable Google Drive API")
                print("3. Create OAuth 2.0 credentials (Desktop App)")
                print("4. Download and rename to client_secret.json")
                print("5. Place it in:", os.path.dirname(__file__))
                return None

            print("Opening browser for Google OAuth authorization...")
            print("Please log in with your Google account and approve access.\n")
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the token for future use
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
        print(f"✓ Token saved to: {TOKEN_FILE}")

    return build('drive', 'v3', credentials=creds)


def test_connection():
    """Test the Drive connection and show your Drive info."""
    print("=" * 50)
    print("ValiSure - Google Drive Setup")
    print("=" * 50)

    service = get_drive_service()
    if not service:
        return False

    try:
        # Get info about the connected account
        about = service.about().get(fields="user,storageQuota").execute()
        user = about.get('user', {})
        quota = about.get('storageQuota', {})

        print("\n✅ Successfully connected to Google Drive!")
        print(f"   Account: {user.get('displayName')} ({user.get('emailAddress')})")

        used = int(quota.get('usage', 0))
        total = int(quota.get('limit', 0))
        if total > 0:
            used_gb = used / (1024**3)
            total_gb = total / (1024**3)
            print(f"   Storage: {used_gb:.2f} GB used of {total_gb:.2f} GB")
        else:
            print(f"   Storage: {used / (1024**3):.2f} GB used (unlimited)")

        # List top-level folders to confirm access
        print("\n   Top-level folders in your Drive:")
        results = service.files().list(
            q="mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false",
            fields="files(id, name)",
            pageSize=10
        ).execute()
        folders = results.get('files', [])
        if folders:
            for folder in folders:
                print(f"   📁 {folder['name']} (id: {folder['id']})")
        else:
            print("   (No folders found at root level - that's okay)")

        print("\n" + "=" * 50)
        print("NEXT STEP: Create these two folders in your Google Drive:")
        print("  1. 'ValiSure_Templates' - where you store master .docx templates")
        print("  2. 'ValiSure_Projects'  - where project folders will be auto-created")
        print("\nThen copy the folder IDs from the URL when you open them in Drive.")
        print("Example URL: https://drive.google.com/drive/folders/1aBcDeFgHiJkLmN")
        print("                                                       ^^^ This is the folder ID")
        print("\nAdd them to your .env file as:")
        print("  GDRIVE_TEMPLATES_FOLDER_ID=<your_templates_folder_id>")
        print("  GDRIVE_PROJECTS_FOLDER_ID=<your_projects_folder_id>")
        print("=" * 50)

        return True

    except Exception as e:
        print(f"\n❌ Connection test failed: {e}")
        return False


if __name__ == "__main__":
    test_connection()
