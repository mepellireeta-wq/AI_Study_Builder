import os
import joblib
import pandas as pd
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

os.makedirs('data', exist_ok=True)
os.makedirs('models', exist_ok=True)

# Generate data if not exists
dataset_path = 'data/synthetic_study_data.csv' if os.path.exists('data/synthetic_study_data.csv') else 'synthetic_dataset.csv'
if not os.path.exists(dataset_path):
    import generate_data

print("--- Day 2: Training XGBoost Regressor Model ---")
df = pd.read_csv(dataset_path)

X = df[['user_est', 'difficulty', 'quiz_score', 'confidence']]
y = df['pttm']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# PDF Specification: XGBoostRegressor(n_estimators=100, max_depth=5)
model = XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=42)
model.fit(X_train, y_train)

# Evaluation
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred) ** 0.5
r2 = r2_score(y_test, y_pred)

print(f"Model Training Metrics:")
print(f"  - MAE:  {mae:.4f} hrs")
print(f"  - RMSE: {rmse:.4f} hrs")
print(f"  - R²:   {r2:.4f}")

# Export trained model
joblib.dump(model, 'ttm_model.pkl')
joblib.dump(model, 'models/ttm_model.pkl')

print("[SUCCESS] Model exported to ttm_model.pkl & models/ttm_model.pkl!")
