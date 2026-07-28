import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

os.makedirs('pitch_assets', exist_ok=True)

dataset_path = 'data/synthetic_study_data.csv' if os.path.exists('data/synthetic_study_data.csv') else 'synthetic_dataset.csv'
if not os.path.exists(dataset_path):
    import generate_data
if not os.path.exists('ttm_model.pkl'):
    import train

print("--- Day 4: Edge Case Calibration & Pitch Deck Graph Generation ---")
df = pd.read_csv(dataset_path)
model = joblib.load('ttm_model.pkl')

# 1. Edge Case Calibration Tests
from predict import TTMPredictor
predictor = TTMPredictor()

edge_cases = [
    {"desc": "Edge Case 1: 0% Quiz Score, 100% Confidence (Overconfident)", "user_est": 5.0, "difficulty": 5, "quiz_score": 0.0, "confidence": 5},
    {"desc": "Edge Case 2: 100% Quiz Score, Low Confidence (Imposter Syndrome)", "user_est": 5.0, "difficulty": 1, "quiz_score": 100.0, "confidence": 1},
    {"desc": "Edge Case 3: High Difficulty, Low Score, Low Confidence", "user_est": 10.0, "difficulty": 5, "quiz_score": 20.0, "confidence": 1}
]

print("\nRunning Edge Case Calibration Tests:")
for ec in edge_cases:
    res = predictor.predict(ec["user_est"], ec["difficulty"], ec["quiz_score"], ec["confidence"])
    print(f"  {ec['desc']}:")
    print(f"    -> Predicted TTM: {res['predicted_ttm']}h | EER: {res['eer']} | Risk: {res['risk_level']}")

# 2. Pitch Deck Charts
X = df[['user_est', 'difficulty', 'quiz_score', 'confidence']]
df['predicted_ttm'] = model.predict(X)
df['eer'] = df['predicted_ttm'] / df['user_est']

# Graph 1: Feature Importance
plt.figure(figsize=(8, 5))
importance = model.feature_importances_
features = ['User Estimated Hours', 'Subject Difficulty', 'Quiz Score (%)', 'Confidence Level']
plt.barh(features, importance, color=['#4F46E5', '#06B6D4', '#10B981', '#F59E0B'])
plt.title('XGBoost Feature Importance - TTM Predictor', fontsize=14, fontweight='bold', pad=12)
plt.xlabel('Relative Importance')
plt.grid(axis='x', linestyle='--', alpha=0.5)
plt.tight_layout()
plt.savefig('pitch_assets/feature_importance.png', dpi=300)
plt.close()

# Graph 2: Actual vs Predicted TTM Scatter Plot
plt.figure(figsize=(8, 5))
plt.scatter(df['pttm'], df['predicted_ttm'], alpha=0.6, color='#6366F1', edgecolors='none', s=30)
plt.plot([0, 25], [0, 25], '--', color='#EF4444', linewidth=2, label='Perfect 1:1 Match Line')
plt.title('Actual vs Predicted Time-To-Mastery (TTM)', fontsize=14, fontweight='bold', pad=12)
plt.xlabel('Actual TTM (Hours)')
plt.ylabel('Predicted TTM (Hours)')
plt.legend()
plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
plt.savefig('pitch_assets/actual_vs_predicted_ttm.png', dpi=300)
plt.close()

# Graph 3: EER Risk Distribution
plt.figure(figsize=(8, 5))
burnout = (df['eer'] > 1.2).sum()
procrastination = (df['eer'] < 0.8).sum()
balanced = len(df) - burnout - procrastination

categories = ['Procrastination Risk\n(EER < 0.8)', 'Balanced Pacing\n(0.8 <= EER <= 1.2)', 'Burnout Risk\n(EER > 1.2)']
counts = [procrastination, balanced, burnout]
colors = ['#F59E0B', '#10B981', '#EF4444']

bars = plt.bar(categories, counts, color=colors, width=0.55)
for bar in bars:
    yval = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2.0, yval + 10, f"{yval} logs", ha='center', va='bottom', fontweight='bold')

plt.title('Student Pacing Error Ratio (EER) Risk Breakdown', fontsize=14, fontweight='bold', pad=12)
plt.ylabel('Number of Study Logs')
plt.ylim(0, max(counts) + 100)
plt.grid(axis='y', linestyle='--', alpha=0.5)
plt.tight_layout()
plt.savefig('pitch_assets/eer_risk_distribution.png', dpi=300)
plt.close()

print("\n[SUCCESS] Day 4 Calibration complete! Pitch graphs generated in pitch_assets/:")
print("  - pitch_assets/feature_importance.png")
print("  - pitch_assets/actual_vs_predicted_ttm.png")
print("  - pitch_assets/eer_risk_distribution.png")
