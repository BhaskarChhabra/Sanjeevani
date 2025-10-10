# test_accuracy.py
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from utils.data_fetch import fetch_data
from utils.preprocess import preprocess

MODEL_PATH = "models/dose_predictor_lstm.h5"
SEQUENCE_LENGTH = 7  # must match train_lstm.py

# Normalize helpers
def hour_norm_from_hour(h): return float(h)/23.0
def day_norm_from_dt(dt): return float(dt.dayofweek)/6.0

# Load model
model = load_model(MODEL_PATH)
print("✅ Model loaded")

# Fetch and preprocess
raw_data = fetch_data()
if not raw_data:
    print("❌ No data fetched from DB")
    exit()

df = preprocess(raw_data)
df["scheduledTime"] = pd.to_datetime(df["scheduledTime"])

y_true = []
y_pred = []

# Loop over all user+medicine+slot groups
for (user, med, slot), group in df.groupby(["user","medicine_name","slot"]):
    group_sorted = group.sort_values("scheduledTime")
    statuses = group_sorted["status_encoded"].astype(int).tolist()
    hours = group_sorted["scheduledTime"].dt.hour.tolist()
    days = group_sorted["scheduledTime"].dt.dayofweek.tolist()

    for i in range(len(statuses) - SEQUENCE_LENGTH):
        seq_status = statuses[i:i+SEQUENCE_LENGTH]
        seq_hour_norm = [hour_norm_from_hour(h) for h in hours[i:i+SEQUENCE_LENGTH]]
        seq_day_norm = [d/6.0 for d in days[i:i+SEQUENCE_LENGTH]]
        seq_features = [[s, hn, dn] for s, hn, dn in zip(seq_status, seq_hour_norm, seq_day_norm)]
        X_input = np.array([seq_features], dtype=np.float32)
        pred_prob = model.predict(X_input, verbose=0)[0][0]
        pred_label = 1 if pred_prob >= 0.5 else 0

        y_pred.append(pred_label)
        y_true.append(statuses[i+SEQUENCE_LENGTH])

# Calculate accuracy
accuracy = np.mean(np.array(y_true) == np.array(y_pred))
print(f"🔹 Model Accuracy on historical data: {accuracy*100:.2f}%")
