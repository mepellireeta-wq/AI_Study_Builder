import numpy as np
import pandas as pd
import os

os.makedirs('data', exist_ok=True)

print("--- Day 1: Generating 1,000 Synthetic Student Study Logs ---")
np.random.seed(42)
n_samples = 1000

user_est = np.random.uniform(1.0, 15.0, n_samples).round(2)
difficulty = np.random.randint(1, 6, n_samples)          # 5 difficulty levels (1 to 5)
quiz_score = np.random.uniform(0.0, 100.0, n_samples).round(2) # Quiz score 0-100%
confidence = np.random.randint(1, 6, n_samples)          # Confidence 1 to 5 scale

# PDF Formula: PTTM = User_Est * (1.0 + 0.15*Difficulty - 0.004*Quiz_Score + 0.08*(6-Confidence))
noise = np.random.normal(0, 0.05 * user_est, n_samples)
pttm = user_est * (1.0 + 0.15 * difficulty - 0.004 * quiz_score + 0.08 * (6 - confidence)) + noise
pttm = np.maximum(pttm, 0.5).round(2)

# Estimation Error Ratio: EER = Actual Time Taken / User Estimated Time
eer = (pttm / user_est).round(2)

df = pd.DataFrame({
    'user_est': user_est,
    'difficulty': difficulty,
    'quiz_score': quiz_score,
    'confidence': confidence,
    'pttm': pttm,
    'eer': eer
})

# Save to data/synthetic_study_data.csv and synthetic_dataset.csv
df.to_csv('data/synthetic_study_data.csv', index=False)
df.to_csv('synthetic_dataset.csv', index=False)
print(f"[SUCCESS] Generated {n_samples} study logs!")
print("Saved to data/synthetic_study_data.csv & synthetic_dataset.csv")
