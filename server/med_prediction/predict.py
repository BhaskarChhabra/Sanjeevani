import pandas as pd
import joblib
from feature_engineering import load_and_engineer_features

# Load trained model
model = joblib.load("server/med_prediction/med_miss_predictor.pkl")

# Load today's data (or full logs)
logs = load_and_engineer_features("server/med_prediction/med_logs.json")

# Example: predict probabilities
logs_encoded = pd.get_dummies(logs, columns=['pillName','dayOfWeek'], drop_first=True)

# Align columns with training data
trained_cols = model.feature_names_in_
for col in trained_cols:
    if col not in logs_encoded.columns:
        logs_encoded[col] = 0
logs_encoded = logs_encoded[trained_cols]

logs['missProbability'] = model.predict_proba(logs_encoded)[:,1]

# Show high-risk doses
high_risk = logs[logs['missProbability'] > 0.5]
print(high_risk[['userId','pillName','scheduledTime','date','missProbability']])
