import os
import joblib
import pandas as pd

MODEL_PATH = 'ttm_model.pkl' if os.path.exists('ttm_model.pkl') else 'models/ttm_model.pkl'

def recommend_study_time(subject, difficulty, user_estimated_hours=5, confidence=5, quiz_score=75):
    """
    ML-Driven Study Time Recommender (ChronoSense Member 3 ML Engine)
    - Maps subject difficulty (High/Medium/Low) to parameter values if not specified.
    - Uses trained XGBoost Regressor model to predict realistic Time-To-Mastery (TTM).
    """
    difficulty_map = {
        "High": 5,
        "Medium": 3,
        "Low": 1
    }

    diff_val = difficulty_map.get(difficulty, 3)

    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            input_df = pd.DataFrame([{
                'target_hours': float(user_estimated_hours),
                'confidence': int(confidence),
                'quiz_score': float(quiz_score)
            }])
            predicted_ttm = float(model.predict(input_df)[0])
            predicted_ttm = max(0.5, round(predicted_ttm, 1))
            return f"{predicted_ttm} Hours (ML Predicted)"
        except Exception:
            pass

    # Fallback heuristic
    if difficulty == "High":
        return "3 Hours"
    elif difficulty == "Medium":
        return "2 Hours"
    else:
        return "1 Hour"

if __name__ == "__main__":
    print(f"Subject DBMS (High Difficulty): {recommend_study_time('DBMS', 'High')}")