import pandas as pd
import numpy as np

def load_and_engineer_features(json_file):
    logs = pd.read_json(json_file)
    
    logs['date'] = pd.to_datetime(logs['date'])
    logs['dayOfWeek'] = logs['date'].dt.day_name()
    logs['scheduledHour'] = logs['scheduledTime'].str.split(":").str[0].astype(int)
    logs['scheduledMinute'] = logs['scheduledTime'].str.split(":").str[1].astype(int)
    logs['missedToday'] = logs['status'].apply(lambda x: 1 if x.lower() == 'missed' else 0)

    logs = logs.sort_values(['userId', 'pillName', 'date'])

    logs['lastStatus'] = logs.groupby(['userId', 'pillName'])['missedToday'].shift(1).fillna(0)

    def compute_streak(x):
        streak = 0
        streaks = []
        for val in x:
            if val == 0:  # success/taken
                streak += 1
            else:          # missed
                streak = 0
            streaks.append(streak)
        return pd.Series(streaks, index=x.index, dtype=np.float64)

    # ✅ Fixed index alignment for streak
    logs['streak'] = (
        logs.groupby(['userId', 'pillName'])['missedToday']
        .apply(compute_streak)
        .reset_index(level=[0, 1], drop=True)
    )

    # ✅ Fixed index alignment for missRatio
    logs['missRatio'] = (
        logs.groupby(['userId', 'pillName'])['missedToday']
        .apply(lambda x: x.rolling(7, min_periods=1).mean())
        .reset_index(level=[0, 1], drop=True)
    )

    return logs
