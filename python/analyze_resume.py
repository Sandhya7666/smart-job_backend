# import sys
# import json
# import io
# from textblob import TextBlob


# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# def analyze_resume(resume_text):
#     blob = TextBlob(resume_text)

#     spelling_mistakes = []
#     for word in blob.words:
#         if word.lower() != word.correct().lower():
#             spelling_mistakes.append(
#                 {"word": word, "suggestion": word.correct()})

#     is_good = "experience" in resume_text.lower() or "projects" in resume_text.lower()
#     common_errors = []

#     if len(resume_text.split()) < 100:
#         common_errors.append("Resume is too short.")
#     if "objective" not in resume_text.lower():
#         common_errors.append("Missing career objective section.")
#     if "skills" not in resume_text.lower():
#         common_errors.append("Missing skills section.")

#     improvements = []
#     if spelling_mistakes:
#         improvements.append("Fix spelling mistakes.")
#     if "linkedin" not in resume_text.lower():
#         improvements.append("Add LinkedIn profile.")
#     if "github" not in resume_text.lower() and "portfolio" not in resume_text.lower():
#         improvements.append("Add project portfolio or GitHub.")

#     summary = {
#         "word_count": len(resume_text.split()),
#         "spelling_errors": spelling_mistakes,
#         "is_good": is_good,
#         "common_issues": common_errors,
#         "suggestions": improvements
#     }

#     return summary


# if __name__ == "__main__":
#     payload = json.load(sys.stdin)
#     resume = payload.get("resume", "")
#     result = analyze_resume(resume)
#     print(json.dumps(result))


import sys
import json
import spacy

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Example skill keywords database (expandable)
SKILL_KEYWORDS = [
    "Python", "JavaScript", "SQL", "React", "Node.js", "Machine Learning", "Data Analysis",
    "Project Management", "Communication", "Teamwork", "Git", "Cloud", "Docker", "Kubernetes"
]

# Match lowercased versions
SKILL_KEYWORDS = [skill.lower() for skill in SKILL_KEYWORDS]


def extract_skills(text):
    doc = nlp(text)
    found_skills = set()

    for token in doc:
        if token.text.lower() in SKILL_KEYWORDS:
            found_skills.add(token.text)

    return list(found_skills)


def analyze_resume(text):

    def clean_text(text):
        return text.encode("utf-8", "ignore").decode("utf-8")

    cleaned_text = clean_text(text)
    doc = nlp(cleaned_text)
    words = [token.text for token in doc if not token.is_punct]
    word_count = len(words)

    # Basic quality checks
    missing_sections = []
    if "objective" not in text.lower():
        missing_sections.append("Missing career objective section.")
    if "skills" not in text.lower():
        missing_sections.append("Missing skills section.")
    if "linkedin" not in text.lower():
        missing_sections.append("Add LinkedIn profile.")
    if "github" not in text.lower() and "portfolio" not in text.lower():
        missing_sections.append("Add project portfolio or GitHub link.")

    found_skills = extract_skills(text)
    missing_skills = list(set(SKILL_KEYWORDS) - set([skill.lower() for skill in found_skills]))

    return {
        "word_count": word_count,
        "found_skills": found_skills,
        "missing_skills_suggestions": missing_skills,
        "common_issues": missing_sections,
        "is_good": len(found_skills) >= 5 and len(missing_sections) <= 1,
    }


if __name__ == "__main__":
    payload = json.load(sys.stdin)
    resume = payload.get("resume", "")
    result = analyze_resume(resume)
    print(json.dumps(result))

