# ValiSure - Traceability & Document Management System

A professional document generation and traceability platform with AI-enhanced requirement specification and 21 CFR Part 11 compliant audit trailing.

## 🚀 How to Run the Project

### 1. Prerequisites

- **Frontend**: Node.js (v18+) & npm
- **Backend**: Python (3.9+)
- **Database**: PostgreSQL

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Setup environment variables in a `.env` file:
   ```env
   DB_HOST=
   DB_PORT=
   DB_USER=
   DB_PASS=
   DB_NAME=
   SECRET_KEY=your_secret_key
   REDIS_URL=redis://localhost:6379/0  # Optional for audit queue
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the database setup script to create/migrate tables and seed default roles and users:
   ```bash
   python setup_db.py
   ```
5. Start the server:
   ```bash
   uvicorn python:app --reload --port 8000
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠 Features Implemented

- **CSV/CSA Methodology Support**: Automatic deliverable mapping based on project type.
- **AI Requirement Enhancement**: Generate professional "The system shall..." requirements from simple notes.
- **Live Document Generation**: Automatic creation and modification of `.docx` files.
- **Audit Trail**: Full compliance logging for every user action.

---

## 📤 How to Push to Git

Follow these steps to save and push your changes to your repository:

1. **Check for changes**:

   ```bash
   git status
   ```

2. **Stage your changes**:

   ```bash
   git add .
   ```

3. **Commit your changes**:

   ```bash
   git commit -m "Update: Fixed sidebar persistence and refined URS document generation logic"
   ```

4. **Verify remote**:

   ```bash
   git remote -v
   ```

5. **Push to repository**:
   ```bash
   git push origin main
   ```
   _(Replace `main` with your branch name if different)_
