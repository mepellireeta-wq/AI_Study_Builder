import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

# Add ml_engine directory to python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ml_engine'))

try:
    from predict import TTMPredictor
    predictor = TTMPredictor()
except Exception as e:
    predictor = None
    print(f"Warning: ML Engine predictor not initialized: {e}")

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({
        "Project": "AI Study Builder (ChronoSense)",
        "Module": "Member 2 Backend API",
        "Status": "Running Successfully",
        "ML_Engine_Status": "Active" if predictor else "Offline"
    })

@app.route("/api/predict-ttm", methods=["POST"])
def predict_ttm():
    if not predictor:
        return jsonify({"error": "ML Engine model not loaded. Run train.py first."}), 500
    
    data = request.get_json() or {}
    user_est = float(data.get("user_est", 5.0))
    difficulty = int(data.get("difficulty", 3))
    quiz_score = float(data.get("quiz_score", 75.0))
    confidence = int(data.get("confidence", 3))
    
    res = predictor.predict(user_est, difficulty, quiz_score, confidence)
    return jsonify(res)

@app.route("/study-plan", methods=["GET", "POST"])
def study_plan():
    topics = [
        {"name": "Maths", "user_est": 3.0, "difficulty": 4, "quiz_score": 60, "confidence": 2},
        {"name": "DBMS", "user_est": 2.0, "difficulty": 3, "quiz_score": 85, "confidence": 4},
        {"name": "Python", "user_est": 2.5, "difficulty": 2, "quiz_score": 90, "confidence": 5}
    ]
    
    if request.is_json and request.get_json():
        req_topics = request.get_json().get("topics")
        if req_topics:
            topics = req_topics

    plan = []
    total_est = 0
    total_predicted = 0

    for t in topics:
        if predictor:
            pred = predictor.predict(
                user_est=float(t.get("user_est", 2.0)),
                difficulty=int(t.get("difficulty", 3)),
                quiz_score=float(t.get("quiz_score", 75.0)),
                confidence=int(t.get("confidence", 3))
            )
            plan.append({
                "topic": t["name"],
                "user_estimated_hours": pred["user_est"],
                "ml_predicted_ttm_hours": pred["predicted_ttm"],
                "eer_ratio": pred["eer"],
                "risk_level": pred["risk_level"],
                "recommendation": pred["recommendation"]
            })
            total_est += pred["user_est"]
            total_predicted += pred["predicted_ttm"]
        else:
            plan.append({
                "topic": t["name"],
                "user_estimated_hours": t.get("user_est", 2.0),
                "ml_predicted_ttm_hours": t.get("user_est", 2.0),
                "eer_ratio": 1.0,
                "risk_level": "Balanced Pacing",
                "recommendation": "Maintain study cadence."
            })

    return jsonify({
        "project": "AI Study Builder (ChronoSense)",
        "total_user_estimated_hours": round(total_est, 2),
        "total_ml_predicted_ttm_hours": round(total_predicted, 2),
        "schedule": plan
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)