"""
Run this script from the backend directory to list all paragraphs in a project document.
Usage: python check_doc_headings.py
"""
import os
import glob

BASE_PATH = r"C:\Users\Prabhu\Downloads\docs"

# Find all docx files for user 1
pattern = os.path.join(BASE_PATH, "1", "*.docx")
files = glob.glob(pattern)

print(f"Found {len(files)} document(s):\n")

for f in files:
    if f.startswith("~$"):
        continue
    print(f"=== {os.path.basename(f)} ===")
    try:
        from docx import Document
        doc = Document(f)
        for i, para in enumerate(doc.paragraphs):
            if para.text.strip():
                print(f"  [{i}] style='{para.style.name}' text='{para.text}'")
    except Exception as e:
        print(f"  ERROR: {e}")
    print()
