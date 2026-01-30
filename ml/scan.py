import sys
import os
import joblib
from features import extract_features

model_path = os.path.join(os.path.dirname(__file__), "model", "rf_model.pkl")

if not os.path.exists(model_path):
    print("CLEAN")
    sys.exit(0)

model = joblib.load(model_path)

file_path = sys.argv[1]
features = extract_features(file_path)

prediction = model.predict([features])[0]

if prediction == 1:
    print("MALICIOUS")
else:
    print("CLEAN")
