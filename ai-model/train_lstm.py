# train_lstm.py
import os
import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from utils.data_fetch import fetch_data
from utils.preprocess import preprocess

MODEL_PATH = "models/dose_predictor_lstm.h5"
SEQUENCE_LENGTH = 7  # must match app.py

def hour_norm_from_hour(h):
    return float(h) / 23.0

def day_norm_from_dt(dt):
    return float(dt.dayofweek) / 6.0

def build_sequences(df):
    sequences = []
    labels = []

    for (user, med, slot), group in df.groupby(["user", "medicine_name", "slot"]):
        group_sorted = group.sort_values("scheduledTime")
        status_list = group_sorted["status_encoded"].astype(int).tolist()
        hours_list = group_sorted["scheduledTime"].dt.hour.tolist()
        days_list = group_sorted["scheduledTime"].dt.dayofweek.tolist()

        for i in range(len(status_list) - SEQUENCE_LENGTH):
            seq_status = status_list[i:i + SEQUENCE_LENGTH]
            seq_hour_norm = [hour_norm_from_hour(h) for h in hours_list[i:i + SEQUENCE_LENGTH]]
            seq_day_norm = [day_norm_from_dt(pd.Timestamp.now().replace(hour=0, minute=0, second=0, microsecond=0)) if idx >= len(days_list) else float(days_list[i + idx])/6.0 for idx in range(SEQUENCE_LENGTH)]
            seq_features = [[s, hn, dn] for s, hn, dn in zip(seq_status, seq_hour_norm, seq_day_norm)]
            sequences.append(seq_features)
            labels.append(status_list[i + SEQUENCE_LENGTH])

    X = np.array(sequences, dtype=np.float32)
    y = np.array(labels, dtype=np.float32)
    return X, y

def train_model():
    raw_data = fetch_data()
    if not raw_data:
        print("❌ No data fetched from DB.")
        return

    df = preprocess(raw_data)
    # ensure scheduledTime is datetime
    df["scheduledTime"] = pd.to_datetime(df["scheduledTime"])

    X, y = build_sequences(df)
    print(f"🔹 Training data shape: X={X.shape}, y={y.shape}")

    if len(X) == 0:
        print("❌ Not enough data to train.")
        return

    model = Sequential()
    model.add(LSTM(64, input_shape=(SEQUENCE_LENGTH, 3), return_sequences=False))
    model.add(Dropout(0.2))
    model.add(Dense(1, activation="sigmoid"))
    model.compile(loss="binary_crossentropy", optimizer="adam", metrics=["accuracy"])

    early_stop = EarlyStopping(monitor="loss", patience=3, restore_best_weights=True)
    model.fit(X, y, epochs=20, batch_size=16, callbacks=[early_stop], verbose=1)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    model.save(MODEL_PATH)
    print(f"✅ Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
