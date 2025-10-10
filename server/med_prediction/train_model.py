import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import joblib
from feature_engineering import load_and_engineer_features
from imblearn.over_sampling import SMOTE

# Step 1: Load data and compute engineered features
print("🔹 Loading and processing data...")
logs = load_and_engineer_features("server/med_prediction/med_logs.json")

# Step 2: One-hot encode categorical columns
logs_encoded = pd.get_dummies(logs, columns=['pillName', 'dayOfWeek'], drop_first=True)

# Step 3: Prepare features (X) and target (y)
X = logs_encoded.drop(columns=['userId', 'status', 'scheduledTime', 'date', 'missedToday'])
y = logs_encoded['missedToday']

print("\n🔹 Label distribution before split:")
print(y.value_counts())

# Step 4: Safe split handling for small or imbalanced datasets
label_counts = y.value_counts()
if len(label_counts) < 2 or label_counts.min() < 2:
    print("\n⚠️ Warning: Dataset too small or highly imbalanced — using random split (no stratify).")
    stratify_option = None
else:
    stratify_option = y

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=stratify_option
)

# Step 5: Handle class imbalance (if needed)
if y_train.value_counts().min() / y_train.value_counts().max() < 0.3:
    print("\n⚖️ Applying SMOTE oversampling to balance training data...")
    smote = SMOTE(random_state=42)
    X_train, y_train = smote.fit_resample(X_train, y_train)
    print("✅ After SMOTE balancing:")
    print(y_train.value_counts())

# Step 6: Train RandomForest model
print("\n🚀 Training model...")
clf = RandomForestClassifier(n_estimators=200, random_state=42)
clf.fit(X_train, y_train)

# Step 7: Evaluate model
y_pred = clf.predict(X_test)

if len(set(y_test)) > 1:
    y_proba = clf.predict_proba(X_test)[:, 1]
    roc_auc = roc_auc_score(y_test, y_proba)
else:
    y_proba = None
    roc_auc = "N/A (only one class present in test set)"

print("\n📊 Model Evaluation:")
print(classification_report(y_test, y_pred, zero_division=0))
print(f"ROC-AUC: {roc_auc}")

# Step 8: Save trained model
joblib.dump(clf, "server/med_prediction/med_miss_predictor.pkl")
print("\n✅ Model saved successfully at server/med_prediction/med_miss_predictor.pkl")
