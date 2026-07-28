# 🚀 ChronoSense Backend API (Module 2)

**Adaptive Study-Load Balancer API for Students**  
*Learns from student quiz & practice sheet performance to predict realistic Time-To-Mastery (TTM) per topic, preventing burnout and procrastination.*

---

## 🛠️ Technology Stack & Architecture

- **Framework**: FastAPI (Python 3.11+)
- **Database**: Supabase PostgreSQL (Cloud Database)
- **ML Engine Bridge**: Scikit-Learn / XGBoost TTM Pacing Model (`ml_engine/predict.py`)
- **CV Engine Bridge**: Gemini Vision AI / EasyOCR Handwritten Sheet Grader (`cv_engine/grader.py`)
- **Web Server**: Uvicorn ASGI Server
- **Authentication & Secrets**: `python-dotenv`

---

## 📋 API Endpoints Reference

### 1. Health Check
- `GET /`: Returns API health status, version, and connection status for Supabase, ML Engine, and CV Engine.

### 2. Topic Management (Supabase CRUD)
- `GET /topics`: Fetch all study topics from Supabase.
- `POST /topics`: Add a new study topic with target hours & student self-confidence rating (1-10).
- `PUT /topics/{topic_id}`: Update topic parameters (e.g. target hours, confidence).
- `DELETE /topics/{topic_id}`: Delete a topic from Supabase.

### 3. Performance Tracking
- `POST /quiz-results`: Record student quiz scores and actual study time spent per topic.
- `GET /topics/{topic_id}/history`: Retrieve past performance logs for a specific topic.

### 4. Adaptive Time-To-Mastery (TTM) Predictor
- `POST /predict-ttm`: Evaluates target hours, self-confidence rating, and past quiz performance to predict realistic mastery time.
  - Returns: `predicted_ttm_hours`, `eer` (Estimation Error Ratio), `status_code` (`BURNOUT_RISK`, `PROCRASTINATION_RISK`, `BALANCED`), and `recommendation`.

### 5. CV Practice Sheet Auto-Grader
- `POST /grade-sheet`: Upload handwritten test/practice sheet image (`multipart/form-data`). Runs CV/OCR auto-grading and logs feedback to Supabase.

### 6. Analytics Dashboard (Frontend Bridge)
- `GET /analytics/dashboard`: Returns aggregated student pacing profile, total target hours vs predicted hours, average quiz score, and recent activity log.

---

## 💻 Local Setup & Execution Guide

### 1. Navigate to backend directory
```bash
cd chronosense/backend
```

### 2. Activate Virtual Environment
```powershell
.\venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure `.env` File
Create a `.env` file inside `chronosense/backend/`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### 5. Start Uvicorn Server
```bash
python -m uvicorn main:app --port 8001 --reload
```

### 6. Access Interactive API Docs
Open your browser to: **`http://127.0.0.1:8001/docs`**

---

## 🗄️ Database Schema (`schema.sql`)

The database uses 4 Supabase PostgreSQL tables:
1. `topics`: `id`, `name`, `target_hours`, `confidence`, `created_at`
2. `quiz_results`: `id`, `topic_id`, `score`, `time_spent_hours`, `created_at`
3. `ttm_predictions`: `id`, `topic_id`, `target_hours`, `predicted_hours`, `bias_category`, `created_at`
4. `graded_sheets`: `id`, `topic_id`, `image_url`, `graded_score`, `feedback`, `created_at`

---

## 👥 Author & Module Role
- **Developer**: Gowthami
- **Module**: Module 2 - Backend Developer (FastAPI + Supabase)
- **Project**: ChronoSense Adaptive Study-Load Balancer
