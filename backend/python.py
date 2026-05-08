from fastapi import FastAPI, HTTPException, Depends, Header
from docx import Document
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# SQLAlchemy
from sqlalchemy import (
    create_engine, Column, Integer, String, Text,
    ForeignKey, DateTime, func, UniqueConstraint, desc
)
from sqlalchemy.orm import sessionmaker, Session, joinedload
from models import Base, UserModel, DocumentModel, DocumentEntryModel, ChangeLogModel, RoleModel, AuditLogModel
from datetime import datetime
from schemas import (
    CreateRequest, AddUnderRequest, AddEndRequest, AddEntry,
    UpdateEntryByHeading, StageUpdateRequest, CreateHeadingRequest,
    UpdateHeadingContentRequest, GenerateHeadingContentRequest, UpdateHeadingStatusRequest,
    CreateProjectRequest
)
from user_routes_new import create_user_router
from role_routes import create_role_router
from auth import decode_token
from models import ProjectModel, UserProjectRoleModel


# -------------------- ENV --------------------
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = (
    f"postgresql+psycopg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# -------------------- APP --------------------
app = FastAPI()
BASE_PATH = r"C:\Users\Prabhu\Downloads\docs"


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:8080", "http://127.0.0.1:8080",
        "http://localhost:5173", "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# ============ AUDIT TRAIL MIDDLEWARE (21 CFR Part 11) ============
# Import and register audit middleware for compliance logging
# This captures and queues all audit events to Redis for async processing
try:
    from audit_middleware import AuditMiddleware
    app.add_middleware(
        AuditMiddleware,
        exclude_paths=[
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc"
        ]
    )
    print("[OK] Audit middleware registered successfully")
except ImportError as e:
    print(f"[WARNING] Audit middleware not available: {str(e)}")
except Exception as e:
    print(f"[ERROR] Error registering audit middleware: {str(e)}")

# -------------------- DB ENGINE --------------------
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base.metadata.create_all(bind=engine)

# -------------------- DB DEPENDENCY --------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> UserModel:
    """
    Get current user from JWT token in Authorization header
    """
    from auth import decode_token
    
    if not authorization:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid auth scheme")
    except (ValueError, IndexError):
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    # Decode JWT token
    payload = decode_token(token)
    if not payload:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    username = payload.get("username")
    
    if not user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = db.query(UserModel).options(
        joinedload(UserModel.role)
    ).filter(UserModel.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="User not found")
        
    return user

from typing import Optional

def get_active_project_id(x_project_id: str = Header(None)) -> Optional[int]:
    """Helper to get project ID from header"""
    if not x_project_id or x_project_id == "null":
        return None
    try:
        return int(x_project_id)
    except:
        return None

# -------------------- WORD CONTROLLER --------------------
class Controller:
    def __init__(self, file_path):
        self.file_path = file_path
        if os.path.exists(file_path):
            self.doc = Document(file_path)
        else:
            self.doc = Document()
            self.create_template()
            self.save()

    def create_template(self):
        import os
        base_name = os.path.basename(self.file_path)
        title_text = os.path.splitext(base_name)[0]
        
        # Add centered title
        title = self.doc.add_paragraph(title_text, style="Heading 1")
        title.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
        
        # Spacing before content
        self.doc.add_paragraph()

    def addunder(self, heading_text, new_text):
        import re
        heading_index = None

        def normalize(s: str) -> str:
            return re.sub(r'\s+', ' ', (s or "").strip().lower())

        target = normalize(heading_text)
        alt_target = normalize(f"sample {heading_text}")

        # Strip leading section number (e.g. "8.0 USER REQUIREMENTS" -> "user requirements")
        # because Word auto-numbers headings — the number is NOT in the paragraph text
        stripped_target = re.sub(r'^\d+(\.\d+)*\s+', '', target).strip()

        print(f"[DEBUG addunder] Looking for heading: '{target}' (stripped: '{stripped_target}') in doc with {len(self.doc.paragraphs)} paragraphs")

        # Find the heading — try exact match first, then stripped match on Heading styles
        for i, para in enumerate(self.doc.paragraphs):
            txt = normalize(para.text)
            is_heading = para.style.name.startswith("Heading")

            if txt == target or txt == alt_target:
                heading_index = i
                print(f"[DEBUG addunder] Exact match at paragraph {i}: '{para.text}'")
                break

            # Match the text WITHOUT section number against Heading-styled paragraphs
            if stripped_target and txt == stripped_target and is_heading:
                heading_index = i
                print(f"[DEBUG addunder] Stripped match at paragraph {i}: '{para.text}'")
                break

            # Fuzzy: para text CONTAINS the stripped target and is a heading
            if stripped_target and stripped_target in txt and is_heading:
                heading_index = i
                print(f"[DEBUG addunder] Contains match at paragraph {i}: '{para.text}'")
                break

        # If heading not found, log all headings and return False
        if heading_index is None:
            print(f"[DEBUG addunder] Heading NOT found. All Heading paragraphs:")
            for i, para in enumerate(self.doc.paragraphs):
                if para.style.name.startswith("Heading"):
                    print(f"  [{i}] style='{para.style.name}' text='{para.text}'")
            return False

        # Find the last paragraph under this heading (before next heading)
        insert_index = heading_index + 1
        for i in range(heading_index + 1, len(self.doc.paragraphs)):
            para = self.doc.paragraphs[i]
            if para.style.name.startswith("Heading"):
                break
            insert_index = i + 1

        # Insert new paragraph after the last content under this heading
        new_para = self.doc.add_paragraph("")
        if insert_index - 1 < 0:
            self.doc.paragraphs[0]._element.addprevious(new_para._element)
        else:
            self.doc.paragraphs[insert_index - 1]._element.addnext(new_para._element)
        new_para.add_run(new_text)
        self.save()
        print(f"[DEBUG addunder] Successfully inserted text under heading at paragraph {heading_index}")
        return True

    def addunder_heading_top(self, heading_text, title_text, desc_text):
        """Insert bold title + description RIGHT after the heading (before the table).
        Walks body XML directly to avoid table-cell paragraph confusion."""
        import re
        from docx.oxml.ns import qn

        def normalize(s):
            return re.sub(r'\s+', ' ', (s or '').strip().lower())

        target = normalize(heading_text)
        stripped_target = re.sub(r'^\d+(\.\d+)*\s+', '', target).strip()

        body = self.doc.element.body

        # ── Step 1: Find heading element as direct body child ─────────────
        heading_body_elem = None
        for child in body:
            tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
            if tag != 'p':
                continue
            # Get paragraph text from w:t elements
            para_text = normalize(' '.join(
                t.text for t in child.iter(qn('w:t')) if t.text
            ))
            # Check if it has a heading style
            pStyle = child.find('.//' + qn('w:pStyle'))
            is_heading = False
            if pStyle is not None:
                sv = pStyle.get(qn('w:val'), '')
                is_heading = 'Heading' in sv or 'heading' in sv

            if is_heading and (
                para_text == target or
                (stripped_target and stripped_target == para_text) or
                (stripped_target and stripped_target in para_text)
            ):
                heading_body_elem = child
                print(f"[addunder_heading_top] Found heading: '{para_text}'")
                break

        if heading_body_elem is None:
            print(f"[addunder_heading_top] Heading '{heading_text}' not found in body")
            return False

        # ── Step 2: Walk forward to find last CONTENT paragraph before the table ──
        # Skip blank/empty paragraphs (those are template spacing lines)
        after_heading = False
        last_before_table = heading_body_elem

        for child in body:
            if child is heading_body_elem:
                after_heading = True
                continue
            if not after_heading:
                continue
            tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
            if tag == 'tbl':
                break  # stop at table
            elif tag == 'p':
                pStyle = child.find('.//' + qn('w:pStyle'))
                if pStyle is not None:
                    sv = pStyle.get(qn('w:val'), '')
                    if 'Heading' in sv or 'heading' in sv:
                        break  # stop at next heading
                # Only track paragraphs that have actual text content
                # (skip blank template spacing paragraphs)
                para_text = ''.join(t.text for t in child.iter(qn('w:t')) if t.text).strip()
                if para_text:
                    last_before_table = child

        print(f"[addunder_heading_top] Inserting after element tag='{last_before_table.tag}'")

        # ── Step 3: Create paragraphs with correct indentation ───────────
        from copy import deepcopy
        from docx.oxml import OxmlElement
        from docx.shared import Inches, Pt

        # Get the heading's indentation to match alignment
        heading_pPr = heading_body_elem.find(qn('w:pPr'))
        heading_ind = None
        if heading_pPr is not None:
            heading_ind = heading_pPr.find(qn('w:ind'))

        def apply_indent(para, extra_left_twips=0):
            """Apply heading indent + optional extra to a paragraph."""
            pPr = para._element.find(qn('w:pPr'))
            if pPr is None:
                pPr = OxmlElement('w:pPr')
                para._element.insert(0, pPr)
            # Remove existing indent
            existing = pPr.find(qn('w:ind'))
            if existing is not None:
                pPr.remove(existing)
            # Build new indent from heading values
            ind_elem = OxmlElement('w:ind')
            base_left = 0
            if heading_ind is not None:
                try:
                    base_left = int(heading_ind.get(qn('w:left'), 0) or 0)
                except (ValueError, TypeError):
                    base_left = 0
            ind_elem.set(qn('w:left'), str(base_left + extra_left_twips))
            pPr.append(ind_elem)

        # Para 1: bold title — same indent as heading, font size 12
        title_para = self.doc.add_paragraph()
        run_title = title_para.add_run(title_text)
        run_title.bold = True
        run_title.font.size = Pt(12)
        apply_indent(title_para, extra_left_twips=0)

        # Para 2: description — heading indent + 360 twips (0.25 inch) more, font size 12
        desc_para = self.doc.add_paragraph()
        run_desc = desc_para.add_run(desc_text)
        run_desc.bold = False
        run_desc.font.size = Pt(12)
        apply_indent(desc_para, extra_left_twips=360)

        # Insert: desc first then title (addnext reverses order)
        last_before_table.addnext(desc_para._element)
        last_before_table.addnext(title_para._element)
        # Result: heading → title_para → desc_para → (blank lines) → table

        self.save()
        print(f"[addunder_heading_top] Inserted '{title_text}' under heading (before table)")
        return True





    def addunder_table(self, heading_text, urs_id, description, gxp="", gxp_reference="", gxp_risk=""):
        """Find the table under the given heading and add a new row with the URS data."""
        import re
        from docx.oxml.ns import qn
        from copy import deepcopy

        def normalize(s):
            return re.sub(r'\s+', ' ', (s or '').strip().lower())

        def unique_cells(row):
            """Return only unique cell objects (handles merged cells).
            Uses XML element identity — python-docx creates new wrapper
            objects each call, so id(cell) is always unique even for merges."""
            seen = set()
            result = []
            for cell in row.cells:
                elem_id = id(cell._element)  # compare underlying XML element
                if elem_id not in seen:
                    seen.add(elem_id)
                    result.append(cell)
            return result

        def set_cell_text(cell, text):
            """Clear a cell and set its text, preserving paragraph structure."""
            for para in cell.paragraphs:
                for run in para.runs:
                    run.text = ''
            if cell.paragraphs:
                p = cell.paragraphs[0]
                if p.runs:
                    p.runs[0].text = text or ''
                else:
                    p.add_run(text or '')
            else:
                cell.add_paragraph(text or '')

        target = normalize(heading_text)
        stripped_target = re.sub(r'^\d+(\.\d+)*\s+', '', target).strip()

        # Find heading paragraph
        heading_index = None
        for i, para in enumerate(self.doc.paragraphs):
            txt = normalize(para.text)
            is_heading = para.style.name.startswith('Heading')
            if txt == target or (stripped_target and txt == stripped_target and is_heading):
                heading_index = i
                break
            if stripped_target and stripped_target in txt and is_heading:
                heading_index = i
                break

        if heading_index is None:
            print(f"[addunder_table] Heading '{heading_text}' not found")
            return False

        # Find the first table after the heading element
        heading_elem = self.doc.paragraphs[heading_index]._element
        body = self.doc.element.body
        found_heading = False
        target_table = None
        for child in body:
            if child == heading_elem:
                found_heading = True
                continue
            if found_heading:
                tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                if tag == 'tbl':
                    for tbl in self.doc.tables:
                        if tbl._element == child:
                            target_table = tbl
                            break
                    break
                elif tag == 'p':
                    para_style = child.find('.//' + qn('w:pStyle'))
                    if para_style is not None:
                        style_val = para_style.get(qn('w:val'), '')
                        if 'Heading' in style_val or 'heading' in style_val:
                            break

        if target_table is None:
            print(f"[addunder_table] No table found under heading")
            return False

        # ── Find the first available row (placeholder OR empty) ─────────────
        # "available" = has <<..>> placeholder text  OR  all data cells are empty
        # Previous failed attempts may have cleared placeholder text leaving empty rows.
        placeholder_row_obj = None
        placeholder_ucells  = None
        desc_col_in_row     = None

        # First pass: find structure from ANY data row (even the last one)
        # to know desc_col before we check emptiness
        # We do a 2-pass approach:
        # Pass 1 — find desc_col from the first row that has a placeholder
        for row in target_table.rows[1:]:
            ucells = unique_cells(row)
            print(f"[addunder_table] Scanning row ({len(ucells)} unique): {[c.text.strip()[:15] for c in ucells]}")
            for j, cell in enumerate(ucells):
                txt = cell.text.strip()
                if '<<' in txt and '>>' in txt:
                    desc_col_in_row = j
                    print(f"[addunder_table] Detected desc_col={j} from placeholder text")
                    break
            if desc_col_in_row is not None:
                break

        # If no placeholder row left, infer desc_col from first data row structure
        if desc_col_in_row is None:
            first_data_ucells = unique_cells(target_table.rows[1]) if len(target_table.rows) > 1 else []
            desc_col_in_row = 1 if len(first_data_ucells) > 1 else 0
            print(f"[addunder_table] No placeholder found; defaulting desc_col={desc_col_in_row}")

        # Pass 2 — find the first row where URS ID cell AND desc cell are both empty
        for row in target_table.rows[1:]:
            ucells = unique_cells(row)
            if len(ucells) <= desc_col_in_row:
                continue
            urs_id_txt = ucells[0].text.strip()
            desc_txt   = ucells[desc_col_in_row].text.strip()
            has_placeholder = ('<<' in desc_txt and '>>' in desc_txt) or ('<<' in urs_id_txt and '>>' in urs_id_txt)
            is_empty        = (urs_id_txt == '' and desc_txt == '')
            if has_placeholder or is_empty:
                placeholder_row_obj = row
                placeholder_ucells  = ucells
                print(f"[addunder_table] Found available row: placeholder={has_placeholder} empty={is_empty}")
                break

        if placeholder_row_obj is None:
            print(f"[addunder_table] No available row found — adding new row")
            placeholder_ucells = unique_cells(target_table.rows[-1])


        n = len(placeholder_ucells)
        urs_id_col   = 0
        desc_col     = desc_col_in_row if desc_col_in_row is not None else 1
        gxp_col      = desc_col + 1 if desc_col + 1 < n else None
        gxp_ref_col  = desc_col + 2 if desc_col + 2 < n else None
        gxp_risk_col = desc_col + 3 if desc_col + 3 < n else None

        print(f"[addunder_table] Column map (from data row, n={n}): "
              f"URS_ID={urs_id_col} DESC={desc_col} GXP={gxp_col} REF={gxp_ref_col} RISK={gxp_risk_col}")

        def write_row(ucells_list):
            set_cell_text(ucells_list[urs_id_col], urs_id or '')
            set_cell_text(ucells_list[desc_col],   description or '')
            if gxp_col is not None:
                set_cell_text(ucells_list[gxp_col], gxp or '')
            if gxp_ref_col is not None:
                set_cell_text(ucells_list[gxp_ref_col], gxp_reference or '')
            if gxp_risk_col is not None:
                set_cell_text(ucells_list[gxp_risk_col], gxp_risk or '')

        if placeholder_row_obj is not None:
            write_row(placeholder_ucells)
            print(f"[addunder_table] Filled placeholder row → URS ID: {urs_id}")
        else:
            # Add a new row by cloning the last data row
            last_row = target_table.rows[-1]
            new_row_elem = deepcopy(last_row._element)
            target_table._element.append(new_row_elem)
            new_ucells = unique_cells(target_table.rows[-1])
            for cell in new_ucells:
                set_cell_text(cell, '')
            write_row(new_ucells)
            print(f"[addunder_table] Added new row → URS ID: {urs_id}")


        self.save()
        return True

    def adding(self, text):
        self.doc.add_paragraph(text)
        self.save()

    def save(self):
        self.doc.save(self.file_path)

# -------------------- HELPERS --------------------
def get_user_file_path(user: UserModel, filename: str, project_id: int = None):
    user_dir = os.path.join(BASE_PATH, str(user.id))
    os.makedirs(user_dir, exist_ok=True)

    if project_id:
        if filename.endswith(".docx"):
            base = filename[:-5]
            filename = f"{base}_project_{project_id}.docx"
        else:
            filename = f"{filename}_project_{project_id}.docx"
    else:
        filename = filename if filename.endswith(".docx") else filename + ".docx"

    full_path = os.path.join(user_dir, filename)
    print(f"[DEBUG] Document path: {full_path}")
    return full_path

def get_or_create_document(db: Session, user: UserModel, filename: str, project_id: int) -> DocumentModel:
    doc = db.query(DocumentModel).filter_by(
        user_id=user.id, filename=filename, project_id=project_id
    ).first()

    if not doc:
        doc = DocumentModel(filename=filename, user_id=user.id, username=user.username, project_id=project_id)
        db.add(doc)
        db.commit()
        db.refresh(doc)

    return doc

def add_entry_db(db: Session, document_id: int, heading: str, content: str):
    entry = DocumentEntryModel(
        document_id=document_id,
        heading_text=heading,
        content_text=content
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry.id

# -------------------- ROUTES --------------------
@app.post("/create")
def create_file(
    req: CreateRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    project_id: int = Depends(get_active_project_id)
):
    if not project_id:
        raise HTTPException(400, "Project context required")
        
    try:
        import shutil
        path = get_user_file_path(current_user, req.filename, project_id)
        is_new = not os.path.exists(path)
        
        debug_log = f"Creating: {req.filename}\nPath: {path}\nIs New: {is_new}\n"
        
        if is_new:
            template_filename = req.filename if req.filename.endswith(".docx") else req.filename + ".docx"
            
            # Match any URS document to the master template (regardless of exact wording)
            filename_upper = template_filename.upper()
            if "URS" in filename_upper and ("USER REQ" in filename_upper or "USER REQUEST" in filename_upper):
                template_filename = "URS - User Requirements Specification.docx"
                debug_log += f"Mapped to URS template: {template_filename}\n"
                
            template_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "templates", template_filename))
            debug_log += f"Template Path: {template_path}\nTemplate Exists: {os.path.exists(template_path)}\n"
            
            if os.path.exists(template_path):
                shutil.copy(template_path, path)
                debug_log += "Copied template!\n"
            else:
                debug_log += "Did not copy template because it doesn't exist.\n"
        
        with open(os.path.join(BASE_PATH, "debug.txt"), "a") as f:
            f.write(debug_log + "\n")
                
        Controller(path)
        doc = get_or_create_document(db, current_user, req.filename, project_id)
        
        # If this is a new document, add Sample Requirement 1 to database
        if is_new:
            add_entry_db(db, doc.id, "Sample Requirement 1", "")
            doc.current_stage = 1
            db.commit()
        
        return {"message": "Document created/opened"}
    except Exception as e:
        print(f"Error creating document: {str(e)}")
        raise HTTPException(500, f"Error creating document: {str(e)}")

@app.post("/add-under")
def add_under(
    req: AddUnderRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    project_id: int = Depends(get_active_project_id)
):
    import shutil
    path = get_user_file_path(current_user, req.filename, project_id)
    print(f"[add-under] Project Context: {project_id} | User: {current_user.username} | File: {req.filename}")

    # ── Detect Word lock file: Word creates ~$<filename> when a doc is open ──
    lock_filename = "~$" + os.path.basename(path)
    lock_path = os.path.join(os.path.dirname(path), lock_filename)
    if os.path.exists(lock_path):
        print(f"[add-under] LOCKED: Word lock file found at {lock_path}")
        raise HTTPException(423, "FILE_LOCKED: The Word document is currently open. Please close it and try again.")

    ctrl = Controller(path)
    
    # Auto-repair: if doc has very few paragraphs it means template wasn't copied.
    if len(ctrl.doc.paragraphs) < 5:
        print(f"[add-under] Doc has only {len(ctrl.doc.paragraphs)} paragraphs — looks like template was missed. Re-copying...")
        template_filename = req.filename if req.filename.endswith(".docx") else req.filename + ".docx"
        filename_upper = template_filename.upper()
        if "URS" in filename_upper and ("USER REQ" in filename_upper or "USER REQUEST" in filename_upper):
            template_filename = "URS - User Requirements Specification.docx"
        template_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "templates", template_filename))
        if os.path.exists(template_path):
            shutil.copy(template_path, path)
            print(f"[add-under] Template re-copied from {template_path}")
            ctrl = Controller(path)
        else:
            print(f"[add-under] WARNING: Template not found at {template_path}")

    try:
        # Try table insertion first if URS-specific fields are provided
        inserted = False
        if req.urs_id:
            inserted = ctrl.addunder_table(
                req.heading_text,
                urs_id=req.urs_id,
                description=req.new_text,
                gxp=req.gxp or "",
                gxp_reference=req.gxp_reference or "",
                gxp_risk=req.gxp_risk or ""
            )
            if inserted:
                print(f"[add-under] Inserted into table row for URS ID: {req.urs_id}")
                # ALSO add bold title + description RIGHT under the heading (before the table)
                title_text = req.urs_title or req.urs_id or ''
                ctrl.addunder_heading_top(req.heading_text, title_text, req.new_text)
                print(f"[add-under] Added bold title+desc under heading (before table)")

        # Fallback: plain text insert only (no table fields provided)
        if not inserted:
            if not ctrl.addunder(req.heading_text, req.new_text):
                raise HTTPException(404, f"Heading '{req.heading_text}' not found in document")

    except HTTPException:
        raise  # re-raise 404 etc as-is
    except PermissionError:
        print(f"[add-under] PermissionError: file is locked by Word")
        raise HTTPException(423, "FILE_LOCKED: The Word document is currently open. Please close it and try again.")
    except Exception as e:
        print(f"[add-under] Unexpected error during insertion: {e}")
        raise HTTPException(500, f"Error inserting into document: {str(e)}")

    if not project_id:
        raise HTTPException(400, "Project context required")

    doc = get_or_create_document(db, current_user, req.filename, project_id)
    entry_id = add_entry_db(db, doc.id, req.heading_text, req.new_text)
    return {"message": "Added under heading", "entry_id": entry_id}



@app.delete("/db/delete-entry")
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a single requirement entry from the DB"""
    entry = db.query(DocumentEntryModel).filter_by(id=entry_id).first()
    if not entry:
        raise HTTPException(404, "Entry not found")
    # Verify the entry belongs to this user's document
    doc = db.query(DocumentModel).filter_by(id=entry.document_id, user_id=current_user.id).first()
    if not doc:
        raise HTTPException(403, "Unauthorized")
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted"}

@app.post("/add-end")
def add_end(
    req: AddEndRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    project_id: int = Depends(get_active_project_id)
):
    path = get_user_file_path(current_user, req.filename, project_id)

    ctrl = Controller(path)
    if req.heading:
        ctrl.doc.add_paragraph(req.heading, style="Heading 2")
    ctrl.adding(req.text)

    if not project_id:
        raise HTTPException(400, "Project context required")

    doc = get_or_create_document(db, current_user, req.filename, project_id)
    if req.heading:
        add_entry_db(db, doc.id, req.heading, req.text)
    else:
        add_entry_db(db, doc.id, "END", req.text)
    return {"message": "Added at end"}

@app.get("/db/search")
def search_document(
    filename: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    doc = db.query(DocumentModel).filter_by(
        user_id=current_user.id, filename=filename
    ).first()

    if not doc:
        raise HTTPException(404, "Document not found")

    return {
        "filename": doc.filename,
        "entries": [
            {"heading": e.heading_text, "content": e.content_text}
            for e in doc.entries
        ]
    }

@app.delete("/db/delete-document")
def delete_document(
    filename: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    doc = db.query(DocumentModel).filter_by(
        user_id=current_user.id, filename=filename
    ).first()

    if not doc:
        raise HTTPException(404, "Document not found")

    db.delete(doc)
    db.commit()

    path = get_user_file_path(current_user, filename, doc.project_id)
    if os.path.exists(path):
        os.remove(path)

    return {"message": "Document deleted"}

@app.get("/db/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    project_id: Optional[int] = Depends(get_active_project_id)
):
    """Get all documents for current user in active project with metadata"""
    # Order documents by latest activity: latest entry created_at or document created_at
    from sqlalchemy import desc
    last_activity = func.coalesce(func.max(DocumentEntryModel.created_at), DocumentModel.created_at)

    docs_query = (
        db.query(
            DocumentModel.id,
            DocumentModel.filename,
            DocumentModel.created_at,
            DocumentModel.current_stage,
            DocumentModel.username,
            last_activity.label('last_activity')
        )
        .outerjoin(DocumentEntryModel, DocumentEntryModel.document_id == DocumentModel.id)
        .filter(DocumentModel.user_id == current_user.id)
        .filter(DocumentModel.project_id == project_id)
        .group_by(DocumentModel.id)
        .order_by(desc('last_activity'))
    )

    result = []
    for row in docs_query.all():
        created = row.created_at.isoformat() if row.created_at else None
        result.append({
            "id": row.id,
            "filename": row.filename,
            "created_at": created,
            "current_stage": row.current_stage,
            "username": row.username,
            "last_activity": row.last_activity.isoformat() if row.last_activity else created
        })

    return {"documents": result}


# -------------------- PROJECT ROUTES --------------------

@app.get("/db/projects")
def get_projects(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    from models import UserProjectRoleModel

    # Check if user has global admin permission
    is_admin = False
    if current_user.role:
        is_admin = (current_user.role.permission_level == "admin")
    elif current_user.role_id == 1:
        # Fallback for ID 1 if role object isn't joined
        is_admin = True

    if is_admin:
        # Admin gets everything
        projects = db.query(ProjectModel).options(joinedload(ProjectModel.details)).all()
    else:
        # User only gets explicitly mapped projects
        projects = (
            db.query(ProjectModel)
            .join(UserProjectRoleModel, ProjectModel.id == UserProjectRoleModel.project_id)
            .filter(UserProjectRoleModel.user_id == current_user.id)
            .options(joinedload(ProjectModel.details))
            .all()
        )
    return {
        "projects": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "details": {
                    "change_number": p.details.change_number if p.details else None,
                    "system_application_name": p.details.system_application_name if p.details else None,
                    "methodologies": p.details.methodologies if p.details else None,
                    "gamp_categories": p.details.gamp_categories if p.details else None,
                    "regulations": p.details.regulations if p.details else None,
                } if p.details else None
            } for p in projects
        ]
    }

@app.post("/db/projects")
def create_project(
    req: CreateProjectRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new project with full metadata and team assignments"""
    from models import ProjectDetailsModel

    try:
        # 1. Create main project
        new_project = ProjectModel(name=req.name, description=req.description)
        db.add(new_project)
        db.flush() # Get the new_project.id

        # 2. Add detailed project metadata (1-to-1 relationship)
        project_details = ProjectDetailsModel(
            project_id=new_project.id,
            change_number=req.change_number,
            system_application_name=req.system_application_name,
            methodologies=req.methodologies,
            gamp_categories=req.gamp_categories,
            regulations=req.regulations,
            csv_deliverables=req.csv_deliverables,
            csa_deliverables=req.csa_deliverables
        )
        db.add(project_details)

        # 3. Handle team member assignments
        if req.team_members:
            for member in req.team_members:
                assignment = UserProjectRoleModel(
                    user_id=member.user_id,
                    project_id=new_project.id,
                    role_id=member.role_id
                )
                db.add(assignment)
        
        # 4. Mandatory auto-assign creator as Admin if they aren't in the list
        already_assigned = any(m.user_id == current_user.id for m in (req.team_members or []))
        if not already_assigned:
            creator_assignment = UserProjectRoleModel(
                user_id=current_user.id,
                project_id=new_project.id,
                role_id=1 # Default Admin role
            )
            db.add(creator_assignment)

        db.commit()
        db.refresh(new_project)
        
        return {
            "message": "Project created successfully", 
            "id": new_project.id,
            "name": new_project.name
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")


@app.delete("/db/delete-project")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a project and its associations"""
    project = db.query(ProjectModel).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")
        
    # Delete associated document files from disk
    docs = db.query(DocumentModel).filter_by(project_id=project_id).all()
    for doc in docs:
        path = get_user_file_path(current_user, doc.filename, project_id)
        if os.path.exists(path):
            try:
                os.remove(path)
            except:
                pass
        
    # Explicitly delete all user-project assignments so it disappears for everyone
    try:
        from models import UserProjectRoleModel
        db.query(UserProjectRoleModel).filter_by(project_id=project_id).delete(synchronize_session=False)
    except Exception as e:
        print(f"Could not delete roles: {e}")
        
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}

@app.post("/db/stage-update")
def update_stage(
    req: StageUpdateRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Submit content for a requirement stage"""
    try:
        doc = db.query(DocumentModel).filter_by(
            user_id=current_user.id, filename=req.filename
        ).first()

        if not doc:
            raise HTTPException(404, "Document not found")

        # Get file path and add content to Word document using AddUnder logic
        path = get_user_file_path(current_user, req.filename, doc.project_id)
        ctrl = Controller(path)
        heading = f"Sample Requirement {req.stage}"
        
        # Add content under the heading in the Word document
        if not ctrl.addunder(heading, req.content):
            raise HTTPException(400, f"Heading '{heading}' not found in document")

        # Add entry to database
        add_entry_db(db, doc.id, heading, req.content)

        # Try to log the change (if table exists)
        try:
            log = ChangeLogModel(
                document_id=doc.id,
                user_id=current_user.id,
                username=current_user.username,
                change_type=f"stage_{req.stage}",
                content=req.content
            )
            db.add(log)
        except:
            pass  # Ignore if table doesn't exist

        # DO NOT increment stage here — just save content
        db.commit()

        # NOW increment stage after content is saved (will be incremented when user opens next time)
        doc.current_stage = req.stage + 1
        db.commit()

        return {"message": f"Content saved for Stage {req.stage}", "current_stage": doc.current_stage}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in stage-update: {str(e)}")
        raise HTTPException(500, f"Error: {str(e)}")

@app.get("/db/document-info")
def get_document_info(
    filename: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get document info and create heading for current stage if missing."""
    doc = db.query(DocumentModel).filter_by(
        user_id=current_user.id, filename=filename
    ).first()

    if not doc:
        raise HTTPException(404, "Document not found")

    # Open the Word document
    path = get_user_file_path(current_user, filename, doc.project_id)
    ctrl = Controller(path)
    
    # Get current stage (don't increment)
    current_stage = doc.current_stage if doc.current_stage else 1
    heading = f"Sample Requirement {current_stage}"
    
    # Check if heading exists, if not create it
    heading_exists = False
    for para in ctrl.doc.paragraphs:
        if para.text.strip().lower() == heading.lower():
            heading_exists = True
            break
    
    if not heading_exists:
        p = ctrl.doc.add_paragraph(heading, style="Heading 1")
        p.alignment = WD_PARAGRAPH_ALIGNMENT.LEFT
        ctrl.save()

    changes = []
    try:
        for log in doc.change_logs:
            changes.append({
                "type": log.change_type,
                "content": log.content,
                "changed_at": log.changed_at.isoformat() if log.changed_at else None
            })
    except:
        pass  # change_logs table might not exist

    return {
        "id": doc.id,
        "filename": doc.filename,
        "current_stage": current_stage,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "change_history": changes
    }

from sqlalchemy.orm import joinedload

@app.get("/db/search-global-by-filename")
def search_global_by_filename(
    filename: str,
    db: Session = Depends(get_db)
):
    """
    Global search: return all documents with the same filename
    across all users, along with their entries.
    """
    results = []

    # Use joinedload to fetch user and entries eagerly
    docs = db.query(DocumentModel)\
        .options(joinedload(DocumentModel.user), joinedload(DocumentModel.entries))\
        .filter(DocumentModel.filename == filename)\
        .all()

    if not docs:
        raise HTTPException(status_code=404, detail="No documents found with that filename")

    for doc in docs:
        entries = [
            {"heading": e.heading_text, "content": e.content_text}
            for e in doc.entries
        ]
        results.append({
            "user_id": doc.user_id,
            "username": doc.user.username if doc.user else None,
            "filename": doc.filename,
            "entries": entries
        })

    return {"results": results}
@app.get("/db/document-headings")
def get_document_headings(
    filename: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get all headings for a document, sorted by heading number"""
    doc = db.query(DocumentModel).filter_by(
        user_id=current_user.id, filename=filename
    ).first()

    if not doc:
        raise HTTPException(404, "Document not found")
 
    headings = []
    heading_map = {}  # Track unique headings
    
    for entry in doc.entries:
        # Skip auto-created empty headings or system entries
        if entry.heading_text and entry.heading_text != "END":
            # Use heading_text as key to avoid duplicates
            if entry.heading_text not in heading_map:
                heading_map[entry.heading_text] = {
                    "id": entry.id,
                    "req_id": entry.req_id,
                    "text": entry.heading_text,
                    "content_preview": entry.content_text[:100] if entry.content_text else "",
                    "created_at": entry.created_at.isoformat() if entry.created_at else None,
                    "created_by": doc.username,
                    "status": entry.status if entry.status else "draft"
                }

    # Sort headings by number in "Sample Requirement N"
    def extract_number(heading_text):
        import re
        match = re.search(r'\d+', heading_text)
        return int(match.group()) if match else 0
    
    sorted_headings = sorted(heading_map.values(), key=lambda h: extract_number(h["text"]))
    
    return {
        "filename": doc.filename,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "headings": sorted_headings
    }


@app.delete("/db/delete-heading")
def delete_heading(
    heading_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a specific heading entry (DB only)."""
    entry = db.query(DocumentEntryModel).filter_by(id=heading_id).first()
    if not entry:
        raise HTTPException(404, "Heading not found")

    # Verify ownership
    doc = db.query(DocumentModel).filter_by(id=entry.document_id).first()
    if not doc or doc.user_id != current_user.id:
        raise HTTPException(403, "Unauthorized")

    db.delete(entry)
    db.commit()

    return {"message": "Heading deleted"}

@app.post("/db/create-heading")
def create_heading(
    req: CreateHeadingRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Automatically create the next heading (Sample Requirement N)"""
    try:
        doc = db.query(DocumentModel).filter_by(
            user_id=current_user.id, filename=req.filename
        ).first()

        if not doc:
            raise HTTPException(404, "Document not found")

        # Get current stage and increment to get next heading number
        next_stage = (doc.current_stage or 0) + 1
        heading_text = f"Sample Requirement {next_stage}"

        # Check if heading already exists in Word document
        path = get_user_file_path(current_user, req.filename)
        ctrl = Controller(path)
        
        heading_exists = False
        for para in ctrl.doc.paragraphs:
            if para.text.strip().lower() == heading_text.lower(): 
                heading_exists = True
                break

        if not heading_exists:
            p = ctrl.doc.add_paragraph(heading_text, style="Heading 1")
            p.alignment = WD_PARAGRAPH_ALIGNMENT.LEFT
            ctrl.save()

        # Add entry to database
        entry = DocumentEntryModel(
            document_id=doc.id,
            req_id=next_stage,
            heading_text=heading_text,
            content_text=""
        )
        db.add(entry)
        
        # Update current_stage in document
        doc.current_stage = next_stage
        db.commit()
        db.refresh(entry)

        return {
            "heading_text": heading_text,
            "id": entry.id,
            "message": f"Created {heading_text}"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating heading: {str(e)}")
        raise HTTPException(500, f"Error: {str(e)}")


@app.post("/db/update-heading-status")
def update_heading_status(
    req: UpdateHeadingStatusRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Update the status of a specific heading (Approve/Reject)"""
    entry = db.query(DocumentEntryModel).filter_by(id=req.heading_id).first()
    if not entry:
        raise HTTPException(404, "Heading not found")

    # Verify ownership
    doc = db.query(DocumentModel).filter_by(id=entry.document_id).first()
    if not doc or doc.user_id != current_user.id:
        raise HTTPException(403, "Unauthorized")

    entry.status = req.status
    db.commit()
    return {"message": f"Status updated to {req.status}", "status": req.status}


@app.get("/db/heading-content")
def get_heading_content(
    filename: str,
    heading_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get content for a specific heading"""
    entry = db.query(DocumentEntryModel).filter_by(id=heading_id).first()

    if not entry:
        raise HTTPException(404, "Heading not found")

    # Verify document ownership
    doc = db.query(DocumentModel).filter_by(id=entry.document_id).first()
    if not doc or doc.user_id != current_user.id:
        raise HTTPException(403, "Unauthorized")

    # Get version history from ChangeLogModel
    logs = db.query(ChangeLogModel).filter(
        ChangeLogModel.document_id == doc.id,
        ChangeLogModel.content.isnot(None)
    ).order_by(desc(ChangeLogModel.changed_at)).all()
    
    versions = []
    for i, log in enumerate(reversed(logs)):
        versions.append({
            "id": log.id,
            "number": i + 1,
            "content": log.content,
            "generatedAt": log.changed_at.isoformat()
        })
    # reverse back for descending order
    versions.reverse()

    return {
        "id": entry.id,
        "heading_text": entry.heading_text,
        "content_text": entry.content_text,
        "status": entry.status if entry.status else "draft",
        "versions": versions
    }
def generate_content_template(heading_text: str, document_stage: int, previous_content: list) -> str:
    """
    Generate intelligent content suggestion based on:
    - Heading text (e.g., "Sample Requirement 1")
    - Document stage (workflow position)
    - Previous content (for context and patterns)
    
    Returns a template string that users can review and edit.
    """
    import re
    
    # Extract heading number
    match = re.search(r'\d+', heading_text)
    heading_number = int(match.group()) if match else 1
    
    # Determine heading type and generate template
    if heading_number == 1 or "overview" in heading_text.lower() or "introduction" in heading_text.lower():
        # First requirement - suggest overview/introduction
        template = f"""Overview and Purpose

This section outlines the primary objectives and scope of {heading_text}.

Key Objectives:
ΓÇó Objective 1: [Define main goal]
ΓÇó Objective 2: [Define secondary goal]
ΓÇó Objective 3: [Define additional goal]

Scope:
This covers [describe what is included], and excludes [describe what is out of scope].

Benefits:
ΓÇó [Primary benefit]
ΓÇó [Secondary benefit]
ΓÇó [Tertiary benefit]"""
    
    elif heading_number <= 3:
        # Requirements 2-3: Suggest functional requirements structure
        template = f"""Functional Requirements

This requirement defines the essential features and capabilities.

1. Core Functionality
   Description: [Describe the main functionality]
   Acceptance Criteria:
   - [Criterion 1]
   - [Criterion 2]
   - [Criterion 3]

2. User Interactions
   Description: [How users will interact with this feature]
   Expected Outcomes: [What users should see/achieve]

3. Integration Points
   Description: [Integration with other systems/components]
   Data Requirements: [What data is needed]

4. Performance Requirements
   Response Time: [Expected performance metric]
   Throughput: [Expected throughput/volume]"""
    
    else:
        # Later requirements: Suggest detailed specifications
        template = f"""Detailed Specification

This requirement provides detailed technical and functional specifications.

Background:
Based on previous requirements, this requirement builds upon:
[Context from earlier stages]

Detailed Requirements:

1. Technical Specifications
   ΓÇó Technology Stack: [Specify]
   ΓÇó Architecture: [Describe]
   ΓÇó Data Model: [Define]

2. Business Rules
   ΓÇó Rule 1: [Define]
   ΓÇó Rule 2: [Define]
   ΓÇó Rule 3: [Define]

3. Non-Functional Requirements
   ΓÇó Security: [Specify security requirements]
   ΓÇó Scalability: [Specify scalability needs]
   ΓÇó Availability: [Specify availability requirements]

4. Dependencies
   ΓÇó Dependency 1: [Identify]
   ΓÇó Dependency 2: [Identify]

5. Testing Strategy
   ΓÇó Unit Tests: [Approach]
   ΓÇó Integration Tests: [Approach]
   ΓÇó UAT Scenarios: [Key scenarios]"""
    
    return template

@app.post("/db/generate-heading-content")
def generate_heading_content(
    req: GenerateHeadingContentRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Generate intelligent content suggestion for a heading based on document context"""
    try:
        # Fetch the entry and document
        entry = db.query(DocumentEntryModel).filter_by(id=req.heading_id).first()
        
        if not entry:
            raise HTTPException(404, "Heading not found")
        
        # Verify document ownership
        doc = db.query(DocumentModel).filter_by(id=entry.document_id).first()
        if not doc or doc.user_id != current_user.id:
            raise HTTPException(403, "Unauthorized")
        
        # Get context from previous entries for more intelligent templates
        previous_entries = db.query(DocumentEntryModel).filter(
            DocumentEntryModel.document_id == doc.id,
            DocumentEntryModel.id < entry.id
        ).order_by(DocumentEntryModel.id.desc()).limit(3).all()
        
        previous_content = [e.content_text for e in previous_entries if e.content_text]
        
        # Generate the template
        generated_content = generate_content_template(
            heading_text=entry.heading_text,
            document_stage=doc.current_stage or 1,
            previous_content=previous_content
        )
        
        # Save to change logs for version history
        log = ChangeLogModel(
            document_id=doc.id,
            user_id=current_user.id,
            username=current_user.username,
            change_type="generation",
            content=generated_content
        )
        db.add(log)
        db.commit()
        
        return {
            "message": "Content generated successfully",
            "generated_content": generated_content
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating heading content: {str(e)}")
        raise HTTPException(500, f"Error: {str(e)}")

@app.post("/db/update-heading-content")
def update_heading_content(
    req: UpdateHeadingContentRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Update content for a specific heading"""
    try: 
        entry = db.query(DocumentEntryModel).filter_by(id=req.heading_id).first()

        if not entry:
            raise HTTPException(404, "Heading not found")

        # Verify document ownership
        doc = db.query(DocumentModel).filter_by(id=entry.document_id).first()
        if not doc or doc.user_id != current_user.id:
            raise HTTPException(403, "Unauthorized")

        # Update in database
        entry.content_text = req.content
        
        # Save to logs for version history
        log = ChangeLogModel(
            document_id=doc.id,
            user_id=current_user.id,
            username=current_user.username,
            change_type="update",
            content=req.content
        )
        db.add(log)
        
        db.commit()

        # Update in Word document
        path = get_user_file_path(current_user, req.filename)
        ctrl = Controller(path)
        ctrl.addunder(entry.heading_text, req.content) 

        return {
            "message": f"Updated {entry.heading_text}",
            "heading_text": entry.heading_text
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating heading content: {str(e)}")
        raise HTTPException(500, f"Error: {str(e)}")

# -------------------- REGISTER USER ROUTES --------------------
user_router = create_user_router(get_db)
app.include_router(user_router)

# -------------------- REGISTER ROLE ROUTES --------------------
role_router = create_role_router(get_db)
app.include_router(role_router)



# ============ AUDIT TRAIL ENDPOINTS (21 CFR Part 11 Compliance) ============

@app.get("/health/audit")
def audit_health_check():
    """
    Health check for audit trail system.
    Verifies Celery/Redis connectivity and database availability.
    """
    health_status = {
        "status": "healthy",
        "components": {}
    }
    
    # Check Redis
    try:
        try:
            import importlib
            redis_lib = importlib.import_module('redis')
        except (ImportError, ModuleNotFoundError):
            raise Exception("redis package not installed")
        from dotenv import load_dotenv
        load_dotenv()
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        r = redis_lib.from_url(redis_url)
        r.ping()
        health_status["components"]["redis"] = "ok"
    except Exception as e:
        health_status["components"]["redis"] = f"not available: {str(e)}"
        # Redis not available - degraded but not fatal (direct DB write fallback active)
    
    # Check Database
    try:
        db = SessionLocal()
        db.query(AuditLogModel).limit(1).all()
        db.close()
        health_status["components"]["database"] = "ok"
    except Exception as e:
        health_status["components"]["database"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check Celery
    try:
        from celery_config import app as celery_app
        # Try to ping the celery app
        celery_app.control.broadcast('active_instances', reply=False)
        health_status["components"]["celery"] = "ok"
    except Exception as e:
        health_status["components"]["celery"] = f"warning: {str(e)}"
    
    status_code = 200 if health_status["status"] == "healthy" else 503
    return health_status


@app.get("/audit/logs")
def get_audit_logs(
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    actor_id: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Query audit trail for compliance reporting.

    Parameters:
    - resource_type: Filter by resource type (Project, Individual_Requirement, etc.)
    - resource_id: Filter by resource ID
    - actor_id: Filter by user ID
    - action: Filter by action verb
    - limit: Maximum results (max 1000)
    - offset: Pagination offset

    Returns: List of audit log records with actor username resolved
    """
    try:
        # Build query
        query = db.query(AuditLogModel)

        if resource_type:
            query = query.filter(AuditLogModel.resource_type == resource_type)
        if resource_id:
            query = query.filter(AuditLogModel.resource_id == resource_id)
        if actor_id:
            query = query.filter(AuditLogModel.actor_id == actor_id)
        if action:
            query = query.filter(AuditLogModel.action == action)

        # Enforce limit
        limit = min(limit, 1000)

        # Get total count
        total = query.count()

        # Get paginated results
        logs = query.order_by(desc(AuditLogModel.timestamp))\
            .limit(limit).offset(offset).all()

        # Build actor username lookup map (resolve IDs → usernames)
        actor_ids = list({log.actor_id for log in logs if log.actor_id and log.actor_id != "anonymous"})
        username_map: dict = {}
        if actor_ids:
            # UserModel.id is INTEGER; actor_id is stored as string — cast before querying
            int_actor_ids = []
            for aid in actor_ids:
                try:
                    int_actor_ids.append(int(aid))
                except (ValueError, TypeError):
                    pass
            if int_actor_ids:
                users = db.query(UserModel).filter(UserModel.id.in_(int_actor_ids)).all()
                username_map = {str(u.id): (u.username or u.email or str(u.id)) for u in users}

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "logs": [
                {
                    "id": str(log.id),
                    "timestamp": (log.timestamp.isoformat() + ('Z' if log.timestamp.tzinfo is None else '')) if log.timestamp else None,
                    "actor_id": log.actor_id,
                    "actor_name": username_map.get(log.actor_id, log.actor_id),
                    "actor_role": log.actor_role,
                    "action": log.action,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "ip_address": log.ip_address,
                    "correlation_id": log.correlation_id,
                    "reason_for_change": log.reason_for_change,
                    "payload": log.payload
                }
                for log in logs
            ]
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Error: {str(e)}")



@app.get("/audit/logs/{log_id}")
def get_audit_log_detail(
    log_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Get detailed audit log entry for forensic investigation.
    
    Returns: Complete audit log record with all fields
    """
    try:
        from uuid import UUID
        
        log = db.query(AuditLogModel).filter_by(id=UUID(log_id)).first()
        
        if not log:
            raise HTTPException(404, "Audit log not found")
        
        return {
            "id": str(log.id),
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "correlation_id": log.correlation_id,
            "session_id": log.session_id,
            "actor_id": log.actor_id,
            "actor_role": log.actor_role,
            "ip_address": log.ip_address,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "reason_for_change": log.reason_for_change,
            "e_signature_id": log.e_signature_id,
            "payload": log.payload,
            "created_at": log.created_at.isoformat() if log.created_at else None
        }
    
    except Exception as e:
        print(f"Error fetching audit log detail: {str(e)}")
        raise HTTPException(500, f"Error: {str(e)}")


@app.post("/audit/verify-immutability/{log_id}")
def verify_audit_immutability(
    log_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Verify that an audit log entry is immutable (cannot be modified).
    Compliance requirement: Audit logs must be append-only per 21 CFR Part 11.
    
    Returns: Immutability verification result
    """
    try:
        from uuid import UUID
        
        log = db.query(AuditLogModel).filter_by(id=UUID(log_id)).first()
        
        if not log:
            return {"status": "error", "message": "Audit log not found"}
        
        # Try to update (should fail if immutability is enforced)
        original_timestamp = log.timestamp
        
        try:
            log.timestamp = datetime.utcnow()
            db.commit()
            # If this succeeds, immutability is BROKEN
            return {
                "status": "CRITICAL",
                "message": "IMMUTABILITY VIOLATION: Audit log can be modified!",
                "log_id": log_id
            }
        except Exception:
            # Expected: Update should fail due to constraints
            db.rollback()
            return {
                "status": "verified",
                "message": "Audit log immutability confirmed",
                "log_id": log_id,
                "verified_at": datetime.utcnow().isoformat()
            }
    
    except Exception as e:
        print(f"Error verifying immutability: {str(e)}")
        raise HTTPException(500, f"Error: {str(e)}")
