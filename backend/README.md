# ValiSure - Regulatory Compliance & AI Validation Engine

This directory contains the backend services that power ValiSure's GxP regulatory assessment, dynamic AI prompt building, and compliant document generation under **US FDA 21 CFR Part 11** and **EU GMP Annex 11**.

---

## 🏛️ GxP & FDA Regulatory Coverage

### 1. Active Regulations in ValiSure (6 Core Standards)
ValiSure dynamically adapts its requirement specifications, risk metrics, and testing approaches to match 6 core international Life Science regulations and the GAMP 5 classification system:

| Regulation | Domain / UI Label | Scope & Application Area |
|:---|:---|:---|
| **21 CFR Part 11** | Electronic Records & Signatures | Electronic Records & Electronic Signatures |
| **21 CFR Part 820** | Medical Device Quality System | Quality System Regulation (Medical Devices) |
| **EU GMP Annex 11** | Computerised Systems (Europe) | Computerised Systems in GxP environments |
| **ISO 13485** | Medical Device QMS (International) | Medical Device Quality Management Systems |
| **21 CFR Part 210** | cGMP Manufacturing General | cGMP in Manufacturing of Drugs |
| **21 CFR Part 211** | cGMP Finished Pharmaceuticals | cGMP for Finished Pharmaceuticals |

### 2. Active Regulation Clause Cheat Sheets
These reference maps are used by the AI engine to map specific user requirement capabilities to exact regulatory clauses:

#### 📂 21 CFR Part 11 (Electronic Records & Signatures)
* **21 CFR 11.10(a)**: System Validation & Accuracy
* **21 CFR 11.10(b)**: Accurate/Complete Copies of Records
* **21 CFR 11.10(c)**: Record Protection & Retention
* **21 CFR 11.10(d)**: Limit System Access (Authentication/Login)
* **21 CFR 11.10(e)**: Audit Trails (Computer-generated, Time-stamped)
* **21 CFR 11.10(f)**: Operational / Workflow Checks
* **21 CFR 11.10(g)**: Authority / Privilege / Role Checks
* **21 CFR 11.10(h)**: Device Checks (Hardware Source Input Verification)
* **21 CFR 11.50**: Signature Manifestations (Name, Date/Time, Meaning)
* **21 CFR 11.70**: Signature / Record Linking (Manifestation bound to record)
* **21 CFR 11.100**: Electronic Signature General Requirements
* **21 CFR 11.200**: Signature Components & Controls
* **21 CFR 11.300**: Identification Codes / Passwords (Security controls)

#### 📂 21 CFR Part 820 (Medical Device Quality System Regulation)
* **§820.30**: Design Controls (Design Validation/Verification)
* **§820.40**: Document Controls (Approval, Review, Change Tracking)
* **§820.50**: Purchasing / Supplier Controls
* **§820.70**: Production & Process Controls (Automation/Software Validation)
* **§820.100**: Corrective & Preventive Action (CAPA)
* **§820.180**: Records / General Requirements
* **§820.184**: Device History Records (DHR)
* **§820.200**: Servicing (Service records & procedures)

#### 📂 EU GMP Annex 11 (Computerised Systems)
* **Clause 1**: Risk Management (Applicable throughout system lifecycle)
* **Clause 2**: Personnel / Training (Roles, access privileges)
* **Clause 3-4**: Suppliers & Service Providers (Audits, SLA controls)
* **Clause 4**: Validation (Life cycle documentation & GAMP approach)
* **Clause 7**: Data Storage & Backup (Accuracy, integrity, restore checks)
* **Clause 8**: Printouts / Human Readable Copies
* **Clause 9**: Audit Trails (Log of creation, modification, deletion)
* **Clause 10**: Change & Configuration Management
* **Clause 11**: Periodic Evaluation (Validation status reviews)
* **Clause 12.1-12.2**: Electronic Signatures (Linking & manifestations)
* **Clause 13**: Incident Management (Logging and devations tracking)
* **Clause 16**: Business Continuity / Disaster Recovery

#### 📂 ISO 13485 (Medical Device QMS)
* **§4.2.3**: Control of Documents (QMS documents control)
* **§4.2.4**: Control of Records (Legibility, retention, retrieve controls)
* **§6.4**: Work Environment & Contamination Control
* **§7.1**: Product Realization Planning (Risk management integration)
* **§7.2**: Customer-Related Processes (Requirement review)
* **§7.3**: Design & Development (Design transfer & validation)
* **§8.2**: Measurement, Monitoring & Analysis (Feedback loops)
* **§8.3**: Control of Nonconforming Product
* **§8.5.2**: Corrective Action (Root-cause remediation)
* **§8.5.3**: Preventive Action (Prevent potential nonconformities)

---

### 3. Other Official FDA / US Regulations (Not Yet in ValiSure)
These standards exist in the industry but are outside ValiSure's current active database configurations:

| Regulation | What It Covers | Relevance |
|:---|:---|:---|
| **21 CFR Part 58** | Good Laboratory Practice (GLP) | Labs that run animal/toxicity studies for drug approvals |
| **21 CFR Part 312** | Investigational New Drug Application (IND) | Clinical trial systems — data tracking of investigational drugs |
| **21 CFR Part 314** | New Drug Application (NDA) | Submission systems for drug market approval data |
| **21 CFR Part 600–680** | Biological Products | Biotech and biopharma manufacturing systems (vaccines, blood, tissues) |
| **21 CFR Part 803** | Medical Device Reporting (MDR) | Adverse event/complaint tracking systems |
| **21 CFR Part 4** | Combination Products Regulation | Systems handling drug + device combinations |
| **HIPAA** | Health Insurance Portability & Accountability Act | Patient data privacy in healthcare IT systems |

### 4. International Standards (Not Yet in ValiSure)
Globally recognized guidelines that are highly relevant to computerized system validation (CSV):

| Standard | What It Covers | Relevance |
|:---|:---|:---|
| **ICH Q9** | Quality Risk Management | Risk-based approach to validation decisions |
| **ICH Q10** | Pharmaceutical Quality System | Lifecycle approach to pharma quality systems |
| **ICH E6 (R2/R3)** | Good Clinical Practice (GCP) | Clinical trial data management systems |
| **ICH Q8** | Pharmaceutical Development | Development stage system validation |
| **EudraLex Volume 4** | EU GMP Full Guidelines | Parent of Annex 11 — all EU pharma manufacturing systems |
| **PIC/S PI 011** | Good Practices for Computerised Systems | Widely used guide in Australia, Canada, Singapore |
| **ISO 27001** | Information Security Management | Data security and cybersecurity for regulated systems |

### 5. Regulatory Scope Summary

| Category | Count | In ValiSure? |
|:---|:---:|:---:|
| Core US FDA regulations (Part 11, 210, 211, 820) | 4 | ✅ Yes |
| Medical device specific (803, 4) | 2 | ❌ No |
| Clinical trial specific (312, 314, ICH E6) | 3 | ❌ No |
| GLP/Lab specific (58) | 1 | ❌ No |
| EU/International (Annex 11, ISO 13485) | 2 | ✅ Yes |
| Other International (ICH Q9, Q10, PIC/S, ISO 27001) | 4 | ❌ No |

*Note: For ValiSure's core scope (pharmaceutical and medical device computer system validation), the 6 regulations already configured cover the most commonly required regulatory frameworks. The missing ones are specific to other project stages (e.g. preclinical lab studies, clinical trials, safety reporting).*

---

## 🛠️ Features Implemented

### 1. Context-Aware AI Prompt Builder (GxP Core)
Instead of a static template, the AI requirement refinement endpoint dynamically queries the active project config at runtime and structures the prompt using:
- **Active Regulation Cheat Sheets**: Injects detailed clause maps depending on which regulations are active.
- **CSA vs. CSV Methodology Switcher**:
  - **CSV (Computer System Validation)**: Outputs Risk Levels as `Risk - 1/2/3` and Testing Approaches as `Scripted / Unscripted / Ad-hoc`.
  - **CSA (Computer Software Assurance)**: Outputs Risk Levels as `Critical / Non-Critical` and Testing Approaches as `Scripted / Exploratory`.
- **GAMP 5 Category Risk Calibration**: Injects GAMP 5 Categories (Category 1, 3, 4, 5) context to help the LLM calibrate requirement risk levels.
- **Multi-Regulation Combining**: Combines references when multiple regulations apply (e.g., `21 CFR 11.10(e) / EU Annex 11 Clause 9`).
- **Non-GxP Standardization**: Automatically flags requirements unrelated to electronic records or GxP processes as `gxp_yes_no: "No"` with `gxp_reference: "N/A"`.

### 2. Document Template Setup & Initialization
- **Working Files**: Copies pristine master templates from `backend/templates/` to the flat `backend/docs/` folder (no user ID folders or project suffixes).
- **Placeholder Replacement**: Scans the copied document to replace all occurrences of `<<Software Name and version>>` with the project's actual application name.
- **Revision History Population**: Automatically populates the Revision History table (Table 3) with the current date, the author's name, and title.
- **Table Insertion**: Inserts refined URS requirements directly into the target requirements table (Table 6) under `8.0 USER REQUIREMENTS`.

### 3. Database Schema Migrations
- Added `documents.project_id` and unique constraint `uq_project_filename`.
- Added `document_entries.status` to track requirements lifecycle.

---

## 🔮 Future Compliance Roadmap (What's Left to Add)

To further enhance the platform's enterprise and GxP compliance capabilities, the following features are planned for future development:

### 1. Software Validation Applicability Wizard (MQR-ENG4004-02)
- **Interactive Assessment**: Build a step-by-step Q&A wizard in the UI mapping to the official *Software Validation Applicability & CFR Part 11 Assessment* sheet.
- **Auto-Requirement Generation**: Any assessment question marked as **"Yes"** will automatically generate and inject the corresponding Part 11/GxP requirement into the URS document table.

### 2. Audit Trail Cryptographic Immutability (21 CFR §11.10(e))
- **File Hashing**: Automatically generate a SHA-256 checksum of the URS `.docx` file immediately after every edit.
- **Chain of Custody Logs**: Save the document hashes in the audit logs table, ensuring that any manual modification of the file outside of ValiSure is flagged as a validation breach.

### 3. Electronic Signature Manifestations (21 CFR Part 11 Subpart C)
- **Signature Linking**: Embed a dynamic digital signature block at the end of the URS document.
- **Manifestation Details**: Populate approval details (signer's full name, date/time stamp, and signature meaning) in both the database and the Word document when a user finalizes a file.
