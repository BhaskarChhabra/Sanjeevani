# app.py
import os
import time
import subprocess
from datetime import datetime
from pprint import pprint
from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from apscheduler.schedulers.background import BackgroundScheduler
from utils.data_fetch import fetch_data
from utils.preprocess import preprocess

app = Flask(__name__)
MODEL_PATH = "models/dose_predictor_lstm.h5"
SEQUENCE_LENGTH = 7
EXTRA_REMINDER_THRESHOLD = 0.5

# -------------------------
def load_lstm_model():
    if os.path.exists(MODEL_PATH):
        try:
            m = load_model(MODEL_PATH)
            print(f"✅ Model loaded from {MODEL_PATH}")
            return m
        except Exception as e:
            print("❌ Error loading model:", e)
            return None
    else:
        print("⚠️ Model file not found at", MODEL_PATH)
        return None

model = load_lstm_model()

# -------------------------
def retrain_and_reload():
    print("🧠 Starting retrain job...")
    try:
        subprocess.run(["python3", "train_lstm.py"], check=True)
        time.sleep(1)
        global model
        model = load_lstm_model()
        print("✅ Retrain + reload finished.")
    except Exception as e:
        print("❌ Retrain failed:", e)

scheduler = BackgroundScheduler()
scheduler.add_job(retrain_and_reload, 'interval', minutes=30, next_run_time=datetime.now())
scheduler.start()

# -------------------------
def hour_norm_from_hour(h): return float(h) / 23.0
def day_norm_from_dt(dt): return float(dt.dayofweek)/6.0

@app.route("/predict", methods=["POST"])
def predict_reminder():
    try:
        data = request.get_json(force=True)
        user_id = data.get("userId")
        medicine_name = data.get("medicineName", "").strip().lower()
        slot = data.get("slot")

        if not user_id or not medicine_name or not slot:
            return jsonify({"error": "Missing input"}), 400

        raw_data = fetch_data()
        if not raw_data:
            return jsonify({"error": "No data in DB"}), 404

        df = preprocess(raw_data)
        df["scheduledTime"] = pd.to_datetime(df["scheduledTime"])
        df_user_med = df[(df["user"]==user_id)&(df["medicine_name"]==medicine_name)].copy()
        if df_user_med.empty:
            return jsonify({"error": "No dose history found for this user and medicine"}), 404

        if "slot" not in df_user_med.columns:
            df_user_med["slot"] = df_user_med["scheduledTime"].dt.strftime("%H:%M")

        requested_time = datetime.strptime(slot, "%H:%M").time()
        df_user_med["slot_time"] = pd.to_datetime(df_user_med["slot"], format="%H:%M").dt.time
        df_user_med["time_diff_min"] = df_user_med["slot_time"].apply(
            lambda t: abs((datetime.combine(datetime.today(), t) - datetime.combine(datetime.today(), requested_time)).total_seconds()/60.0)
        )

        nearest_idx = df_user_med["time_diff_min"].idxmin()
        nearest_slot_time = df_user_med.loc[nearest_idx, "slot_time"]
        sel = df_user_med[df_user_med["slot_time"]==nearest_slot_time].sort_values("scheduledTime")
        seq_status = sel["status_encoded"].astype(int).tolist()[-SEQUENCE_LENGTH:]
        scheduled_series = sel["scheduledTime"].dt
        seq_hours = scheduled_series.hour.tolist()[-SEQUENCE_LENGTH:]
        seq_days = scheduled_series.dayofweek.tolist()[-SEQUENCE_LENGTH:]

        pad_len = SEQUENCE_LENGTH - len(seq_status)
        requested_hour = requested_time.hour
        if pad_len>0:
            seq_status = [1]*pad_len + seq_status
            seq_hours = [requested_hour]*pad_len + seq_hours
            seq_days = [0]*pad_len + seq_days

        seq_hour_norm = [hour_norm_from_hour(h) for h in seq_hours]
        seq_day_norm = [day_norm_from_dt(pd.Timestamp.now()) for d in seq_days]

        seq_features = [[s, hn, float(dn)] for s, hn, dn in zip(seq_status, seq_hour_norm, seq_days)]
        X_input = np.array([seq_features], dtype=np.float32)

        global model
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        pred = model.predict(X_input, verbose=0)[0][0]
        miss_probability = 1.0 - float(pred)
        extra_reminder = (pred < EXTRA_REMINDER_THRESHOLD)

        return jsonify({
            "userId": user_id,
            "medicineName": medicine_name,
            "requested_slot": slot,
            "nearest_slot_used": nearest_slot_time.strftime("%H:%M"),
            "sequence_status": seq_status,
            "sequence_hour_norm": seq_hour_norm,
            "sequence_day_norm": seq_days,
            "predicted_prob_taken": float(pred),
            "predicted_prob_missed": miss_probability,
            "extra_reminder": bool(extra_reminder)
        })

    except Exception as e:
        print("❌ Exception in /predict:", e)
        return jsonify({"error": str(e)}), 500

import atexit
atexit.register(lambda: scheduler.shutdown(wait=False))

if __name__=="__main__":
    print("Starting Flask app on port 5020")
    app.run(host="127.0.0.1", port=5020, debug=True)