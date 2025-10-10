import pandas as pd

def preprocess(data):
    df = pd.DataFrame(data)

    # Extract HH:MM from scheduledTime
    df["slot"] = pd.to_datetime(df["scheduledTime"]).dt.strftime("%H:%M")

    # Encode status
    df["status_encoded"] = df["status"].map({"Taken": 1, "Missed": 0})

    return df[["user", "medicine_name", "slot", "status_encoded", "scheduledTime"]]
