# import sys
# import json
# import spacy
# import fitz  # PyMuPDF for PDF parsing

# nlp = spacy.load("en_core_web_sm")

# SKILL_KEYWORDS = [
#     "Python", "JavaScript", "SQL", "React", "Node.js", "Machine Learning", "Data Analysis",
#     "Project Management", "Communication", "Teamwork", "Git", "Cloud", "Docker", "Kubernetes"
# ]
# SKILL_KEYWORDS = [skill.lower() for skill in SKILL_KEYWORDS]


# def clean_text(text):
#     return text.encode("utf-8", "ignore").decode("utf-8", "ignore")

# def extract_skills(text):
#     doc = nlp(text)
#     found_skills = set()
#     for token in doc:
#         if token.text.lower() in SKILL_KEYWORDS:
#             found_skills.add(token.text)
#     return list(found_skills)


# def check_ats_compliance(text):
#     issues = []
#     sections = ['education', 'experience', 'skills', 'contact']
#     if not all(section in text.lower() for section in sections):
#         issues.append("Missing common sections like Education, Experience or Skills.")

#     if any(char in text for char in ['🧠', '🚀', '✔', '★']):
#         issues.append("Contains emojis or special symbols that ATS cannot parse.")

#     if len(text.strip()) < 100:
#         issues.append("Resume seems too short or may be image-based.")

#     return {
#         "is_ats_friendly": len(issues) == 0,
#         "ats_warnings": issues
#     }


# def analyze_resume(text):
#     doc = nlp(text)
#     words = [token.text for token in doc if not token.is_punct]
#     word_count = len(words)

#     missing_sections = []
#     if "objective" not in text.lower():
#         missing_sections.append("Missing career objective section.")
#     if "skills" not in text.lower():
#         missing_sections.append("Missing skills section.")
#     if "linkedin" not in text.lower():
#         missing_sections.append("Add LinkedIn profile.")
#     if "github" not in text.lower() and "portfolio" not in text.lower():
#         missing_sections.append("Add project portfolio or GitHub link.")

#     found_skills = extract_skills(text)
#     missing_skills = list(set(SKILL_KEYWORDS) - set([s.lower() for s in found_skills]))

#     return {
#         "word_count": word_count,
#         "found_skills": found_skills,
#         "missing_skills_suggestions": missing_skills,
#         "common_issues": missing_sections,
#         "is_good": len(found_skills) >= 5 and len(missing_sections) <= 1,
#         "ats_check": check_ats_compliance(text)
#     }


# if __name__ == "__main__":
#     payload = json.load(sys.stdin)
#     resume = payload.get("resume", "")
#     result = analyze_resume(resume)
#     print(json.dumps(result))

import sys
import json
import re
import io
import sys
import spacy
from spacy.matcher import PhraseMatcher
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Expandable skill database
SKILL_KEYWORDS = [
    "Python", "JavaScript", "SQL", "React", "Node.js", "Machine Learning",
    "Data Analysis", "Project Management", "Communication", "Teamwork",
    "Git", "Cloud", "Docker", "Kubernetes"
]
SKILL_KEYWORDS = [skill.lower() for skill in SKILL_KEYWORDS]

def has_section(text, section_name):
    """Check if a resume contains a section like 'Education' or 'Experience'"""
    pattern = re.compile(rf"^\s*{section_name}\s*$", re.IGNORECASE | re.MULTILINE)
    return bool(pattern.search(text))

def extract_skills(text):
    """Extract matching skills using PhraseMatcher"""
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(skill) for skill in SKILL_KEYWORDS]
    matcher.add("SKILLS", patterns)
    
    doc = nlp(text)
    matches = matcher(doc)
    found_skills = set(doc[start:end].text for _, start, end in matches)
    
    return list(found_skills)

def check_ats_compliance(text):
    ats_warnings = []
    required_sections = ["Education", "Experience", "Skills"]

    for section in required_sections:
        if not has_section(text, section):
            ats_warnings.append(f"Missing common section: {section}")

    return {
        "is_ats_friendly": len(ats_warnings) == 0,
        "ats_warnings": ats_warnings
    }

def analyze_resume(text):
    # Clean text
    try:
        text = text.encode("utf-8", "ignore").decode("utf-8")
    except Exception:
        text = text

    doc = nlp(text)
    word_count = len([token.text for token in doc if not token.is_punct])

    # Basic checks
    common_issues = []
    if not has_section(text, "Objective"):
        common_issues.append("Missing career objective section.")
    if not has_section(text, "Skills"):
        common_issues.append("Missing skills section.")
    if "linkedin" not in text.lower():
        common_issues.append("Add LinkedIn profile.")
    if "github" not in text.lower() and "portfolio" not in text.lower():
        common_issues.append("Add project portfolio or GitHub link.")

    found_skills = extract_skills(text)
    missing_skills = list(set(SKILL_KEYWORDS) - set([skill.lower() for skill in found_skills]))

    return {
        "word_count": word_count,
        "found_skills": found_skills,
        "missing_skills_suggestions": missing_skills,
        "common_issues": common_issues,
        "is_good": len(found_skills) >= 5 and len(common_issues) <= 1,
        "ats_check": check_ats_compliance(text)
    }

if __name__ == "__main__":
    payload = json.load(sys.stdin)
    resume = payload.get("resume", "")
    result = analyze_resume(resume)
    print(json.dumps(result))

