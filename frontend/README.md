# ValiSure - Alignment & Portability Updates 🚀

This is a summary of the layout, data flow, database configuration, and file structure cleanups performed to align the application, resolve local machine-specific configs, and prepare the repository for sharing/pushing.

## 🎨 1. Frontend Refinement & Bug Fixes
- **Dashboard Layout Alignment**: Updated the **Author Dashboard** welcome banner, sidebar navigation, user selection, pagination footers, and table columns to match the styling and architecture of the **Admin Dashboard** exactly.
- **Corrupt Unicode Icons Replaced**: Replaced broken pagination arrows and view symbols with clean, standard SVG icons from `lucide-react` (`ChevronLeft`, `ChevronRight`, `Eye`).
- **Date Rendering Bug Fixed**: Resolved the project table "Created on - " blank date bug by aligning frontend payload date mappings with the backend SQL `created_at` timestamp.

## 💾 2. Unified Database Setup & Migrations
- **Single Script Database Setup**: Introduced `backend/setup_db.py` to handle all database setups. Running `python setup_db.py` once now automatically:
  1. Creates all tables (`Base.metadata.create_all`).
  2. Applies column migrations (e.g. `role_id`, `drive_folder_id`, `req_id` sequence, and user fields like `phone`, `department`, `title`, `status`, `last_login`).
  3. Seeds default user roles (`Admin`, `Editor / Author`, etc.).
  4. Generates/links the initial `admin` account (default password: `admin@123`).
- **Centralized Database Configuration**: Created `backend/db_config.py` to serve as a single source of truth for the database connection string. All backend modules (FastAPI application, Celery task queue, direct-write audit middlewares) now import their database engines directly from this file. It is configured to run using environment variables from `.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`).

## ⚙️ 3. Portability & Local Setup Cleanups
- **Configurable Directories**: Replaced the hardcoded document storage path `BASE_PATH` in `python.py` (which pointed to a local machine user folder `C:\Users\Prabhu\...`) with a configurable environment variable `DOCS_PATH`, defaulting to a relative local directory `./docs`.
- **Obsolete Files Removed**: Cleaned up the repository by deleting older, redundant migration scripts, ad-hoc diagnostic scripts (like `check_doc_headings.py`, `check_users.py`, `test_logs.py`), and temporary log files containing hardcoded developer machine configurations.
- **Clean File Names**: Deleted legacy `user_routes.py` and renamed the active audit-trail compliant `user_routes_new.py` to `user_routes.py` for standard naming consistency.

## 🧹 4. Git configuration
- **Clean Commits**: Added rules to the root `.gitignore` to prevent compiled Python byte caches (`__pycache__/`, `*.pyc`), test runs, and other local environment build configurations from polluting the staging area.