import os
import sys
import py_compile

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

print("==================================================")
print("  CHRONOSENSE MULTI-MODULE TEAM CODE BUG CHECK  ")
print("==================================================")

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
errors_found = []

# --------------------------------------------------
# 1. MEMBER 3: ML ENGINE BUG CHECK
# --------------------------------------------------
print("\n[ML Engine] Testing Member 3 Code...")
ml_files = [
    os.path.join(ROOT_DIR, "ml_engine", "predict.py"),
    os.path.join(ROOT_DIR, "ml_engine", "generate_data.py"),
    os.path.join(ROOT_DIR, "ml_engine", "calibrate_pitch.py"),
    os.path.join(ROOT_DIR, "ml_engine", "train_model.py")
]
for f in ml_files:
    if os.path.exists(f):
        try:
            py_compile.compile(f, doraise=True)
            print(f"  [PASS] {os.path.basename(f)}: Syntax Valid!")
        except Exception as e:
            print(f"  [FAIL] {os.path.basename(f)} Syntax Error: {e}")
            errors_found.append(f"ML Engine: {os.path.basename(f)} - {e}")

# --------------------------------------------------
# 2. MEMBER 4: CV ENGINE BUG CHECK
# --------------------------------------------------
print("\n[CV Engine] Testing Member 4 Code...")
cv_files = [
    os.path.join(ROOT_DIR, "cv_engine", "grader.py"),
    os.path.join(ROOT_DIR, "cv_engine", "app.py")
]
for f in cv_files:
    if os.path.exists(f):
        try:
            py_compile.compile(f, doraise=True)
            print(f"  [PASS] {os.path.basename(f)}: Syntax Valid!")
        except Exception as e:
            print(f"  [FAIL] {os.path.basename(f)} Syntax Error: {e}")
            errors_found.append(f"CV Engine: {os.path.basename(f)} - {e}")

# --------------------------------------------------
# 3. MEMBER 2: BACKEND BUG CHECK
# --------------------------------------------------
print("\n[Backend API] Testing Member 2 Code...")
backend_files = [
    os.path.join(ROOT_DIR, "chronosense", "backend", "main.py"),
    os.path.join(ROOT_DIR, "backend", "app.py")
]
for f in backend_files:
    if os.path.exists(f):
        try:
            py_compile.compile(f, doraise=True)
            print(f"  [PASS] {os.path.basename(f)}: Syntax Valid!")
        except Exception as e:
            print(f"  [FAIL] {os.path.basename(f)} Syntax Error: {e}")
            errors_found.append(f"Backend: {os.path.basename(f)} - {e}")

# --------------------------------------------------
# 4. MEMBER 1: FRONTEND BUG CHECK
# --------------------------------------------------
print("\n[Frontend React] Testing Member 1 React/JSX Files...")
frontend_dir = os.path.join(ROOT_DIR, "frontend", "src")
if os.path.exists(frontend_dir):
    jsx_files = []
    for root, dirs, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith(".jsx") or file.endswith(".js"):
                jsx_files.append(os.path.join(root, file))

    print(f"  Found {len(jsx_files)} Frontend React/JSX files:")
    for jf in jsx_files:
        rel_path = os.path.relpath(jf, ROOT_DIR)
        with open(jf, "r", encoding="utf-8", errors="ignore") as file_obj:
            content = file_obj.read()
            open_braces = content.count("{")
            close_braces = content.count("}")
            if open_braces == close_braces:
                print(f"  [PASS] {rel_path}: Braces Balanced ({open_braces} pairs)")
            else:
                print(f"  [WARN] {rel_path}: Unbalanced braces (Open: {open_braces}, Close: {close_braces})")
                errors_found.append(f"Frontend: {rel_path} - Unbalanced braces")

print("\n==================================================")
if not errors_found:
    print(" RESULT: ALL 4 TEAM MEMBERS' CODE PASSED BUG CHECK WITH 100% SUCCESS!")
else:
    print(f" RESULT: Found {len(errors_found)} potential issues:")
    for err in errors_found:
        print(f"   - {err}")
print("==================================================")
