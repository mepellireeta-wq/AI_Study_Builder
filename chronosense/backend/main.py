import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="ChronoSense Backend API",
    description="Adaptive Study-Load Balancer API for predicting Time-to-Mastery & practice sheet grading.",
    version="1.0.0"
)

# Enable CORS for Frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Client Initialization (Optional fallback if env vars not set yet)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase_client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Warning: Supabase client initialization failed: {e}")


# ==========================================
# Pydantic Schemas
# ==========================================
class TopicBase(BaseModel):
    name: str = Field(..., example="Data Structures")
    target_hours: float = Field(..., gt=0, example=10.0)
    confidence: int = Field(..., ge=1, le=10, example=6, description="Student self-confidence rating (1-10)")

class TopicCreate(TopicBase):
    pass

class TopicResponse(TopicBase):
    id: int

class PredictTTMRequest(BaseModel):
    topic_id: Optional[int] = Field(None, example=1)
    topic_name: str = Field(..., example="Machine Learning")
    target_hours: float = Field(..., gt=0, example=15.0)
    confidence: int = Field(..., ge=1, le=10, example=4)
    past_quiz_scores: List[float] = Field(default=[], example=[75.0, 60.0, 85.0])
    past_time_spent_hours: List[float] = Field(default=[], example=[12.0, 18.0, 14.0])

class PredictTTMResponse(BaseModel):
    topic_name: str
    target_hours: float
    predicted_ttm_hours: float
    bias_category: str  # "underestimating", "accurate", "overestimating"
    recommendation: str


# In-memory storage fallback for local dev when DB is not yet attached
MOCK_TOPICS = [
    {"id": 1, "name": "Data Structures", "target_hours": 10.0, "confidence": 6},
    {"id": 2, "name": "Machine Learning", "target_hours": 15.0, "confidence": 4},
    {"id": 3, "name": "Operating Systems", "target_hours": 8.0, "confidence": 8}
]


# ==========================================
# API Endpoints
# ==========================================

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "status": "ChronoSense Backend Active",
        "version": "1.0.0",
        "supabase_connected": supabase_client is not None
    }


@app.get("/topics", response_model=List[TopicResponse])
def get_topics():
    """Fetch all study topics."""
    if supabase_client:
        try:
            res = supabase_client.table("topics").select("*").execute()
            if res.data:
                return res.data
        except Exception as e:
            print(f"Database query error, falling back to mock data: {e}")
            
    return MOCK_TOPICS


@app.post("/topics", response_model=TopicResponse)
def create_topic(topic: TopicCreate):
    """Create a new study topic."""
    if supabase_client:
        try:
            res = supabase_client.table("topics").insert(topic.dict()).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            print(f"Failed to insert into Supabase: {e}")

    new_id = len(MOCK_TOPICS) + 1
    new_topic = {"id": new_id, **topic.dict()}
    MOCK_TOPICS.append(new_topic)
    return new_topic


@app.post("/predict-ttm", response_model=PredictTTMResponse)
def predict_time_to_mastery(data: PredictTTMRequest):
    """
    ML/Algorithmic predictor for Time-To-Mastery (TTM).
    Learns from past quiz performance & confidence ratings to estimate realistic study hours required.
    """
    # Calculate performance baseline
    if data.past_quiz_scores:
        avg_score = sum(data.past_quiz_scores) / len(data.past_quiz_scores)
    else:
        avg_score = 70.0  # Default baseline assumption

    # Calculate actual vs estimated historical ratio
    if data.past_time_spent_hours:
        avg_time_spent = sum(data.past_time_spent_hours) / len(data.past_time_spent_hours)
    else:
        avg_time_spent = data.target_hours

    # 1. Performance adjustment multiplier (Lower score -> Needs more time)
    score_multiplier = 1.0 + max(0.0, (100.0 - avg_score) / 100.0 * 0.5)

    # 2. Student self-confidence adjustment (1=very low, 10=very high)
    # Students with low confidence (1-4) often under-prepare or need extra review time
    confidence_multiplier = 1.0 + (5 - data.confidence) * 0.04

    # Calculate predicted TTM
    predicted_hours = round(data.target_hours * score_multiplier * confidence_multiplier, 2)

    # Determine student bias
    if predicted_hours > data.target_hours * 1.15:
        bias_category = "underestimating"
        recommendation = f"You tend to underestimate '{data.topic_name}'. Consider allocating {predicted_hours} hrs instead of {data.target_hours} hrs to avoid burnout."
    elif predicted_hours < data.target_hours * 0.85:
        bias_category = "overestimating"
        recommendation = f"You are overestimating target hours for '{data.topic_name}'. You can likely master this in ~{predicted_hours} hrs."
    else:
        bias_category = "accurate"
        recommendation = f"Your target estimate of {data.target_hours} hrs is realistic and aligned with your mastery pace."

    return PredictTTMResponse(
        topic_name=data.topic_name,
        target_hours=data.target_hours,
        predicted_ttm_hours=predicted_hours,
        bias_category=bias_category,
        recommendation=recommendation
    )


@app.post("/grade-sheet")
async def grade_sheet(
    topic_id: Optional[int] = Form(1),
    file: UploadFile = File(...)
):
    """
    CV auto-grading endpoint. Accepts handwritten notes or practice sheet images
    and returns score feedback.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image format (JPEG/PNG).")

    # Read image metadata
    contents = await file.read()
    file_size_kb = round(len(contents) / 1024, 2)

    # Mock grading processing (CV module integration placeholder)
    graded_score = 88.5
    feedback_notes = "Great problem-solving steps shown in Section 2. Minor calculation error in Q4."

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size_kb": file_size_kb,
        "topic_id": topic_id,
        "graded_score": graded_score,
        "status": "graded",
        "feedback": feedback_notes
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
