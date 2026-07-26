import numpy as np
import pandas as pd
import os

os.makedirs('data', exist_ok=True)

print("Generating 1,000 synthetic student study records...")
np.random.seed(42)
n_samples = 1000

target_hours = np.random.randint(2, 20, n_samples)
confidence = np.random.randint(1, 11, n_samples)
quiz_score = np.random.randint(40, 101, n_samples)
difficulty = np.random.randint(1, 6, n_samples)

# Ground truth Actual Time-To-Mastery formula (PTTM)
actual_ttm = np.round(target_hours * (1.5 - (confidence * 0.04) - (quiz_score * 0.004) + (difficulty * 0.05)), 2)
actual_ttm = np.maximum(actual_ttm, 0.5)

df = pd.DataFrame({
    'target_hours': target_hours,
    'confidence': confidence,
    'quiz_score': quiz_score,
    'difficulty': difficulty,
    'actual_ttm': actual_ttm
})

# Save synthetic dataset
df.to_csv('synthetic_dataset.csv', index=False)
df.to_csv('data/synthetic_study_data.csv', index=False)
print("[SUCCESS] Dataset saved to synthetic_dataset.csv & data/synthetic_study_data.csv")
