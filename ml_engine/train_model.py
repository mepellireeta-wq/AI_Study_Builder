import numpy as np
import pandas as pd
import joblib
from xgboost import XGBRegressor
import os

os.makedirs('data', exist_ok=True)
os.makedirs('models', exist_ok=True)

if not os.path.exists('synthetic_dataset.csv'):
    import generate_data

df = pd.read_csv('synthetic_dataset.csv')

print("Training XGBoost Regressor model...")
X = df[['target_hours', 'confidence', 'quiz_score']]
y = df['actual_ttm']

model = XGBRegressor(n_estimators=100, learning_rate=0.08, max_depth=4, random_state=42)
model.fit(X, y)

# Save serialized model
joblib.dump(model, 'ttm_model.pkl')
joblib.dump(model, 'models/ttm_model.pkl')

print("[SUCCESS] Trained model saved to ttm_model.pkl & models/ttm_model.pkl!")
