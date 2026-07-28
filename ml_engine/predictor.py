import os
import joblib
import pandas as pd

MODEL_PATH = 'ttm_model.pkl' if os.path.exists('ttm_model.pkl') else 'models/ttm_model.pkl'

def recommend_study_time(subject, difficulty, user_est=5.0, quiz_score=75.0, confidence=3):
    """
    ML-Driven Study Time Recommender (ChronoSense Member 3 ML Engine)
    - Maps subject difficulty (High/Medium/Low) to 1-5 scale if passed as string.
    - Uses trained XGBoost Regressor model to predict realistic Time-To-Mastery (TTM).
    """
    difficulty_map = {
        "High": 5,
        "Medium": 3,
        "Low": 1
    }

    if isinstance(difficulty, str):
        diff_val = difficulty_map.get(difficulty, 3)
    else:
        diff_val = int(difficulty)

    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            input_df = pd.DataFrame([{
                'user_est': float(user_est),
                'difficulty': diff_val,
                'quiz_score': float(quiz_score),
                'confidence': int(confidence)
            }])
            predicted_ttm = float(model.predict(input_df)[0])
            predicted_ttm = max(0.5, round(predicted_ttm, 1))
            return f"{predicted_ttm} Hours (ML Predicted)"
        except Exception:
            pass

    # Fallback heuristic
    if difficulty == "High" or diff_val >= 4:
        return "3.0 Hours"
    elif difficulty == "Medium" or diff_val == 3:
        return "2.0 Hours"
    else:
        return "1.0 Hour"

if __name__ == "__main__":
    print(f"Subject DBMS (High Difficulty): {recommend_study_time('DBMS', 'High')}")