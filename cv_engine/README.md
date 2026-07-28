# 👁️ ChronoSense Computer Vision (CV) Engine (Module 4)

**Handwritten Practice Sheet Auto-Grading & Performance Extractor**  
*Scans handwritten student test sheets and practice notes using Gemini Vision AI (with EasyOCR offline fallback) to grade performance and feed weak topics back into the ChronoSense study load balancer.*

---

## 🛠️ Technology Stack & Architecture

- **Vision AI Engine**: Google Gemini Vision AI (`gemini-2.5-flash` / `gemini-1.5-flash`)
- **Offline OCR Fallback**: `easyocr` + `Pillow (PIL)`
- **Framework API**: FastAPI (`app.py`) & Standalone CLI (`grader.py`)
- **Environment**: Python 3.11+ with `python-dotenv`

---

## 📋 Features & Functionality

1. **AI Auto-Grading**: Analyzes uploaded handwritten study sheets and returns an estimated score (0 - 100%).
2. **Topic Mastery Extraction**: Identifies `topics_mastered` (topics demonstrated well in answers) and `topics_needing_review` (mistakes or weak areas).
3. **Constructive AI Feedback**: Generates 2-sentence actionable feedback for the student.
4. **Resilient Fallback**: Automatically switches to local `EasyOCR` text extraction if API keys or internet connection are unavailable.

---

## 📄 Output Schema Example

```json
{
  "score": 88,
  "topics_mastered": [
    "Array Manipulations",
    "Time Complexity Analysis"
  ],
  "topics_needing_review": [
    "Binary Search Tree Balancing"
  ],
  "feedback": "Great problem-solving steps shown in Section 2. Review BST node rotation edge cases before the next practice test."
}
```

---

## 💻 Setup & Execution Guide

### 1. Navigate to `cv_engine` directory
```bash
cd cv_engine
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure `.env` File
Create a `.env` file inside `cv_engine/`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Run CLI Auto-Grader Test
```bash
python grader.py sample_test.png
```

### 5. Run Standalone CV API Server
```bash
python -m uvicorn app:app --port 8002 --reload
```

Interactive API docs will be available at: **`http://127.0.0.1:8002/docs`**

---

## 🔗 Integration with Backend API (Module 2)

The CV Engine is integrated into the central ChronoSense Backend (`backend/main.py`) via the **`POST /grade-sheet`** endpoint. When a student uploads a practice sheet through the UI, the backend invokes `cv_engine.grader` and logs the evaluation results into Supabase `graded_sheets`.
