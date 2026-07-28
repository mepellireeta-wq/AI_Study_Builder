import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

os.makedirs('pitch_assets', exist_ok=True)

print("Loading dataset & model for calibration & pitch graph generation...")
if not os.path.exists('synthetic_dataset.csv'):
    import generate_data
if not os.path.exists('ttm_model.pkl'):
    import train_model

df = pd.read_csv('synthetic_dataset.csv')
model = joblib.load('ttm_model.pkl')

# Calculate predictions on dataset
X = df[['target_hours', 'confidence', 'quiz_score']]
df['predicted_ttm'] = model.predict(X)
df['eer'] = df['predicted_ttm'] / df['target_hours']

# 1. Feature Importance Graph
plt.figure(figsize=(8, 5))
importance = model.feature_importances_
features = ['Target Hours', 'Confidence Score', 'Quiz Score (%)']
plt.barh(features, importance, color=['#4F46E5', '#06B6D4', '#10B981'])
plt.title('XGBoost Feature Importance - TTM Predictor', fontsize=14, fontweight='bold', pad=12)
plt.xlabel('Relative Importance')
plt.grid(axis='x', linestyle='--', alpha=0.5)
plt.tight_layout()
plt.savefig('pitch_assets/feature_importance.png', dpi=300)
plt.close()

# 2. Actual vs Predicted TTM Scatter Plot
plt.figure(figsize=(8, 5))
plt.scatter(df['actual_ttm'], df['predicted_ttm'], alpha=0.6, color='#6366F1', edgecolors='none', s=30)
plt.plot([0, 25], [0, 25], '--', color='#EF4444', linewidth=2, label='Perfect 1:1 Match Line')
plt.title('Actual vs Predicted Time-To-Mastery (TTM)', fontsize=14, fontweight='bold', pad=12)
plt.xlabel('Actual TTM (Hours)')
plt.ylabel('Predicted TTM (Hours)')
plt.legend()
plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
plt.savefig('pitch_assets/actual_vs_predicted_ttm.png', dpi=300)
plt.close()

# 3. EER Risk Distribution
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

print("[SUCCESS] Calibration complete! Generated 3 pitch graphs in pitch_assets/:")
print("  - pitch_assets/feature_importance.png")
print("  - pitch_assets/actual_vs_predicted_ttm.png")
print("  - pitch_assets/eer_risk_distribution.png")
