# train_fake_job_model.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

df = pd.read_csv("fake_job_postings.csv")
df = df.dropna(subset=["description", "title"])
df["text"] = df["title"] + " " + df["description"]
y = df["fraudulent"]
X = df["text"]

vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
X_vec = vectorizer.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2)
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Save model & vectorizer
joblib.dump(model, "fake_job_model.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")
