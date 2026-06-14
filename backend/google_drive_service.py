"""
google_drive_service.py
-----------------------
Wrapper around the Google Drive API for ValiSure.

Flow:
  1. When a project is created → create_project_folder(project_name)
     Creates:  ValiSure_Projects/<project_name>/   on Drive
     Returns:  folder ID (stored in DB)

  2. When a document is opened/created → copy_template_to_project(template_name, project_folder_id)
     Finds:    ValiSure_Templates/<template_name>.docx  on Drive
     Copies:   into  ValiSure_Projects/<project_name>/<template_name>.docx  on Drive
     Returns:  the new Drive file ID
"""

import os
from dotenv import load_dotenv

load_dotenv()

SCOPES              = ["https://www.googleapis.com/auth/drive"]
TOKEN_FILE          = os.path.join(os.path.dirname(__file__), os.getenv("GDRIVE_TOKEN_FILE", "token.json"))
CLIENT_SECRET_FILE  = os.path.join(os.path.dirname(__file__), os.getenv("GDRIVE_CLIENT_SECRET_FILE", "client_secret.json"))
TEMPLATES_FOLDER_ID = os.getenv("GDRIVE_TEMPLATES_FOLDER_ID", "")
PROJECTS_FOLDER_ID  = os.getenv("GDRIVE_PROJECTS_FOLDER_ID", "")


def get_drive_service():
    """
    Return an authenticated Google Drive v3 service.
    Uses the saved token.json; auto-refreshes if expired.
    """
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("[Drive] Refreshing expired token...")
            creds.refresh(Request())
            with open(TOKEN_FILE, "w") as f:
                f.write(creds.to_json())
        else:
            raise RuntimeError(
                "Google Drive not authorized. Run setup_google_drive.py first."
            )

    return build("drive", "v3", credentials=creds)


def create_project_folder(project_name: str):
    """
    Create a folder named <project_name> inside ValiSure_Projects on Drive.
    Idempotent — returns existing folder ID if already exists.
    Returns: folder ID string, or None on error.
    """
    if not PROJECTS_FOLDER_ID:
        print("[Drive] GDRIVE_PROJECTS_FOLDER_ID not set — skipping.")
        return None
    try:
        service = get_drive_service()
        safe_name = project_name.replace("'", "\\'")

        # Check if already exists
        query = (
            f"name='{safe_name}' and "
            f"'{PROJECTS_FOLDER_ID}' in parents and "
            f"mimeType='application/vnd.google-apps.folder' and trashed=false"
        )
        existing = service.files().list(q=query, fields="files(id, name)").execute().get("files", [])
        if existing:
            print(f"[Drive] Project folder already exists: '{project_name}' → {existing[0]['id']}")
            return existing[0]["id"]

        # Create new folder
        meta = {
            "name": project_name,
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [PROJECTS_FOLDER_ID],
        }
        folder = service.files().create(body=meta, fields="id").execute()
        fid = folder.get("id")
        print(f"[Drive] ✓ Created project folder '{project_name}' → {fid}")
        return fid

    except Exception as exc:
        print(f"[Drive] ERROR creating project folder '{project_name}': {exc}")
        return None


def get_project_folder_id_by_name(project_name: str):
    """Find an existing project folder inside ValiSure_Projects by name."""
    if not PROJECTS_FOLDER_ID:
        return None
    try:
        service = get_drive_service()
        safe_name = project_name.replace("'", "\\'")
        query = (
            f"name='{safe_name}' and "
            f"'{PROJECTS_FOLDER_ID}' in parents and "
            f"mimeType='application/vnd.google-apps.folder' and trashed=false"
        )
        files = service.files().list(q=query, fields="files(id, name)").execute().get("files", [])
        return files[0]["id"] if files else None
    except Exception as exc:
        print(f"[Drive] ERROR finding project folder '{project_name}': {exc}")
        return None


def copy_template_to_project(template_name: str, project_folder_id: str):
    """
    Find <template_name>.docx in ValiSure_Templates and copy it to
    the project Drive folder.  Skips if already present (idempotent).

    Returns: Drive file ID of the copy, or None if template not found / error.
    """
    if not TEMPLATES_FOLDER_ID or not project_folder_id:
        print("[Drive] Missing folder IDs — skipping template copy.")
        return None
    try:
        service = get_drive_service()

        doc_filename = template_name if template_name.endswith(".docx") else f"{template_name}.docx"
        safe_fname = doc_filename.replace("'", "\\'")

        # 1. Find master template in ValiSure_Templates
        tmpl_q = (
            f"name='{safe_fname}' and "
            f"'{TEMPLATES_FOLDER_ID}' in parents and trashed=false"
        )
        tmpl_files = service.files().list(q=tmpl_q, fields="files(id, name)").execute().get("files", [])

        if not tmpl_files:
            print(f"[Drive] Template '{doc_filename}' NOT found in ValiSure_Templates — skipping.")
            return None

        template_file_id = tmpl_files[0]["id"]

        # 2. Check if already copied to project folder
        proj_q = (
            f"name='{safe_fname}' and "
            f"'{project_folder_id}' in parents and trashed=false"
        )
        proj_files = service.files().list(q=proj_q, fields="files(id, name)").execute().get("files", [])
        if proj_files:
            print(f"[Drive] '{doc_filename}' already in project folder → {proj_files[0]['id']}")
            return proj_files[0]["id"]

        # 3. Copy master template → project folder
        copied = service.files().copy(
            fileId=template_file_id,
            body={"name": doc_filename, "parents": [project_folder_id]},
            fields="id",
        ).execute()
        new_id = copied.get("id")
        print(f"[Drive] ✓ Copied '{doc_filename}' to project folder → {new_id}")
        return new_id

    except Exception as exc:
        print(f"[Drive] ERROR copying template '{template_name}': {exc}")
        return None


def sync_document_to_drive(local_file_path: str, doc_filename: str, project_folder_id: str):
    """
    Upload the updated local .docx file back to Drive, replacing the existing
    copy in the project folder.  This is called after every requirement add/edit
    so the Drive file always reflects the latest local state.

    Args:
        local_file_path:    Absolute path to the local .docx file.
        doc_filename:       Filename as stored in Drive (e.g. "URS - User Requirements Specification.docx")
        project_folder_id:  Drive folder ID of the project.

    Returns: True on success, False on error.
    """
    if not project_folder_id or not os.path.exists(local_file_path):
        print(f"[Drive] sync_document_to_drive: missing folder ID or local file — skipping.")
        return False
    try:
        from googleapiclient.http import MediaFileUpload
        service = get_drive_service()

        doc_fn = doc_filename if doc_filename.endswith(".docx") else f"{doc_filename}.docx"
        safe_fname = doc_fn.replace("'", "\\'")

        # Find the existing file in the project folder
        query = (
            f"name='{safe_fname}' and "
            f"'{project_folder_id}' in parents and trashed=false"
        )
        existing = service.files().list(q=query, fields="files(id, name)").execute().get("files", [])

        media = MediaFileUpload(
            local_file_path,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            resumable=False,
        )

        if existing:
            # Update the existing file content
            file_id = existing[0]["id"]
            service.files().update(fileId=file_id, media_body=media).execute()
            print(f"[Drive] ✓ Synced '{doc_fn}' to Drive (updated) → {file_id}")
        else:
            # File doesn't exist yet — create it in the project folder
            meta = {"name": doc_fn, "parents": [project_folder_id]}
            new_file = service.files().create(body=meta, media_body=media, fields="id").execute()
            print(f"[Drive] ✓ Synced '{doc_fn}' to Drive (created) → {new_file.get('id')}")

        return True

    except Exception as exc:
        print(f"[Drive] ERROR syncing '{doc_filename}' to Drive: {exc}")
        return False

