import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = 'ttm_model.pkl' if os.path.exists('ttm_model.pkl') else 'models/ttm_model.pkl'

class TTMPredictor:
    def __init__(self, model_path=MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}. Run train_model.py first.")
        self.model = joblib.load(model_path)
    
    def predict(self, target_hours: float, confidence: int, quiz_score: float):
        """
        Predicts Time-To-Mastery (TTM) in hours and evaluates Estimation Error Ratio (EER).
        EER = Actual Predicted TTM / Target Hours
        - EER > 1.2: Burnout Risk (severe underestimation)
        - EER < 0.8: Procrastination Risk (overestimation)
        - 0.8 <= EER <= 1.2: Balanced Pacing
        """
        input_data = pd.DataFrame([{
            'target_hours': float(target_hours),
            'confidence': int(confidence),
            'quiz_score': float(quiz_score)
        }])
        
        predicted_ttm = float(self.model.predict(input_data)[0])
        predicted_ttm = max(0.5, round(predicted_ttm, 2))
        
        eer = round(predicted_ttm / max(target_hours, 0.1), 2)
        
        if eer > 1.2:
            risk_level = "Burnout Risk (Underestimating Time)"
            status_code = "BURNOUT_RISK"
            recommendation = (
                f"Estimated {target_hours}h, but predicted TTM is {predicted_ttm}h (EER: {eer}). "
                f"High risk of rushing & burnout! Split study into smaller sessions."
            )
        elif eer < 0.8:
            risk_level = "Procrastination Risk (Overestimating Effort)"
            status_code = "PROCRASTINATION_RISK"
            recommendation = (
                f"Estimated {target_hours}h, but predicted TTM is only {predicted_ttm}h (EER: {eer}). "
                f"Topic is easier than expected! Start now to overcome initial inertia."
            )
        else:
            risk_level = "Balanced Pacing"
            status_code = "BALANCED"
            recommendation = (
                f"Great estimate! Your estimate ({target_hours}h) matches realistic mastery time ({predicted_ttm}h)."
            )
            
        return {
            "target_hours": target_hours,
            "confidence": confidence,
            "quiz_score": quiz_score,
            "predicted_ttm_hours": predicted_ttm,
            "eer": eer,
            "status_code": status_code,
            "risk_level": risk_level,
            "recommendation": recommendation
        }

# FastAPI App for Member 2 integration
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field

    app = FastAPI(
        title="ChronoSense ML Pacing Engine API",
        description="Member 3: TTM Prediction & Pacing Variance Analytics API",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class TTMRequest(BaseModel):
        target_hours: float = Field(..., example=10.0, description="User estimated study time in hours")
        confidence: int = Field(..., ge=1, le=10, example=5, description="Self confidence score 1-10")
        quiz_score: float = Field(..., ge=0, le=100, example=75.0, description="Past quiz percentage score 0-100")

    predictor = None

    @app.on_event("startup")
    def load_model():
        global predictor
        predictor = TTMPredictor()

    @app.get("/")
    def root():
        return {"status": "online", "module": "Member 3: ML Analytics Engine", "version": "1.0.0"}

    @app.post("/api/predict-ttm")
    def predict_ttm(req: TTMRequest):
        return predictor.predict(req.target_hours, req.confidence, req.quiz_score)

except ImportError:
    pass

if __name__ == "__main__":
    p = TTMPredictor()
    sample = p.predict(target_hours=10, confidence=5, quiz_score=75)
    print("Inference Test Result:", sample)
