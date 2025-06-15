# fake_job_api.py
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load("fake_job_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

@app.route("/predict-fake-job", methods=["POST"])
def predict():
    data = request.json
    text = data.get("title", "") + " " + data.get("description", "")
    vec = vectorizer.transform([text])
    prediction = model.predict(vec)[0]
    prob = model.predict_proba(vec)[0].tolist()
    return jsonify({"is_fake": bool(prediction), "confidence": round(max(prob), 2)})

if __name__ == "__main__":
    app.run(debug=True)
