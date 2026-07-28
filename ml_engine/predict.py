import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = 'ttm_model.pkl' if os.path.exists('ttm_model.pkl') else 'models/ttm_model.pkl'

class TTMPredictor:
    def __init__(self, model_path=MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}. Run train.py first.")
        self.model = joblib.load(model_path)
    
    def predict(self, user_est: float, difficulty: int, quiz_score: float, confidence: int):
        """
        Inference module for Time-To-Mastery (TTM) and Pacing Error Ratio (EER).
        Formula: EER = Actual Time Taken (Predicted TTM) / User Estimated Time
        - EER > 1.2: Severe Underestimation (Burnout Risk)
        - EER < 0.8: Overestimation (Procrastination Risk)
        - 0.8 <= EER <= 1.2: Balanced Pacing
        """
        input_df = pd.DataFrame([{
            'user_est': float(user_est),
            'difficulty': int(difficulty),
            'quiz_score': float(quiz_score),
            'confidence': int(confidence)
        }])
        
        predicted_ttm = float(self.model.predict(input_df)[0])
        predicted_ttm = max(0.5, round(predicted_ttm, 2))
        
        eer = round(predicted_ttm / max(user_est, 0.1), 2)
        
        if eer > 1.2:
            risk_level = "Burnout Risk (Severe Underestimation)"
            status_code = "BURNOUT_RISK"
            recommendation = (
                f"You estimated {user_est}h, but predicted TTM is {predicted_ttm}h (EER: {eer}). "
                f"High risk of rushing & burnout! Split study into smaller 45-minute blocks."
            )
        elif eer < 0.8:
            risk_level = "Procrastination Risk (Overestimation)"
            status_code = "PROCRASTINATION_RISK"
            recommendation = (
                f"You estimated {user_est}h, but predicted TTM is only {predicted_ttm}h (EER: {eer}). "
                f"Topic is easier than expected! Start now to overcome initial inertia."
            )
        else:
            risk_level = "Balanced Pacing"
            status_code = "BALANCED"
            recommendation = (
                f"Great estimate! Your estimate ({user_est}h) matches realistic mastery time ({predicted_ttm}h)."
            )
            
        return {
            "user_est": user_est,
            "difficulty": difficulty,
            "quiz_score": quiz_score,
            "confidence": confidence,
            "predicted_ttm": predicted_ttm,
            "eer": eer,
            "status_code": status_code,
            "risk_level": risk_level,
            "recommendation": recommendation
        }

# Day 3: FastAPI Web Server for Member 2 Integration
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field
    from contextlib import asynccontextmanager

    predictor = None

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        global predictor
        predictor = TTMPredictor()
        yield

    app = FastAPI(
        title="ChronoSense ML Pacing Engine API",
        description="Member 3: TTM Prediction & Pacing Variance Analytics API",
        version="1.0.0",
        lifespan=lifespan
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class TTMRequest(BaseModel):
        user_est: float = Field(..., description="User estimated study time in hours", json_schema_extra={"example": 5.0})
        difficulty: int = Field(..., ge=1, le=5, description="Topic difficulty 1-5 scale", json_schema_extra={"example": 3})
        quiz_score: float = Field(..., ge=0, le=100, description="Past quiz percentage score 0-100%", json_schema_extra={"example": 75.0})
        confidence: int = Field(..., ge=1, le=5, description="Self confidence score 1-5 scale", json_schema_extra={"example": 3})

    @app.get("/")
    def root():
        return {"status": "online", "module": "Member 3: ML Analytics Engine", "version": "1.0.0"}

    @app.post("/api/predict-ttm")
    def predict_ttm(req: TTMRequest):
        if predictor is None:
            p = TTMPredictor()
            return p.predict(req.user_est, req.difficulty, req.quiz_score, req.confidence)
        return predictor.predict(req.user_est, req.difficulty, req.quiz_score, req.confidence)

except ImportError:
    pass

if __name__ == "__main__":
    p = TTMPredictor()
    sample = p.predict(user_est=5.0, difficulty=4, quiz_score=70.0, confidence=2)
    print("--- Day 3 Inference Test Result ---")
    print(sample)
