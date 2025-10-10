from pymongo import MongoClient
import pandas as pd
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

def fetch_data():
    client = MongoClient(MONGO_URI)
    db = client["test"]

    # Fetch doselogs and populate medication name manually
    dose_logs = list(db["doselogs"].find())

    # Fetch all medications once to map ObjectId → pillName
    meds = list(db["medications"].find())
    med_map = {str(m["_id"]): m["pillName"].lower() for m in meds}

    # Build final list
    final_data = []
    for d in dose_logs:
        med_id = str(d["medication"])
        final_data.append({
            "user": str(d["user"]),
            "medicine_name": med_map.get(med_id, ""),
            "scheduledTime": d["scheduledTime"],
            "status": d["status"]
        })

    if not final_data:
        print("⚠️ No dose data found!")
        return None

    return final_data
