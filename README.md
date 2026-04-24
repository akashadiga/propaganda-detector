# Propaganda News Detector

A Flask-based machine learning web application that classifies news text as **Propaganda** or **non-Propaganda** using a trained PassiveAggressiveClassifier with TF-IDF vectorization.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Folder Structure](#architecture--folder-structure)
3. [Initial Analysis](#initial-analysis)
4. [Changes & Improvements Made](#changes--improvements-made)
5. [How to Run Locally](#how-to-run-locally)
6. [API Reference](#api-reference)
7. [Known Limitations & Recommendations](#known-limitations--recommendations)

---

## Project Overview

Users paste a news article (or generate a random one from the built-in dataset) and the app returns a verdict — **Propaganda** or **non-Propaganda** — along with the preprocessed form of the text that was fed to the model.

### Key Technologies

| Layer | Technology |
|-------|-----------|
| Backend framework | Python 3.14, Flask 3.1.3 |
| ML model | scikit-learn 1.8.0 — PassiveAggressiveClassifier |
| NLP preprocessing | NLTK 3.9.4 (stopwords, Porter stemmer), TF-IDF vectorization |
| Data handling | pandas 3.0.2 |
| Model persistence | joblib 1.5.3 |
| Forms & validation | Flask-WTF 1.3.0, WTForms 3.2.1 |
| Frontend | Bootstrap 3, jQuery, Animate.css, Owl Carousel |
| Production server | Gunicorn 23.0.0 (Heroku Procfile included) |

### Main Entry Point

`app.py` — starts the Flask development server and defines all routes.

---

## Architecture & Folder Structure

```
C:\Propaganda\
│
├── app.py                          # Flask app — routes and request handling
├── prediction_model.py             # ML pipeline: preprocessing → vectorize → predict
├── forms.py                        # WTForms form definition and validators
│
├── model2.pkl                      # Trained PassiveAggressiveClassifier (active)
├── tfidfvect2.pkl                  # Fitted TF-IDF vectorizer (active, patched)
│
├── random_dataset.csv              # ~59,000 news samples for random generation
├── propaganda News Prediction.ipynb  # Jupyter notebook — model training process
│
├── requirements.txt                # Python dependencies (pinned versions)
├── nltk.txt                        # NLTK corpora requirements (stopwords)
├── Procfile                        # Heroku deployment config
├── .gitignore                      # Git exclusions
│
├── templates/
│   └── home.html                   # Single-page UI (Bootstrap, Jinja2 templating)
│
└── static/
    ├── css/                        # Bootstrap, Animate.css, custom styles
    ├── js/                         # jQuery, flexslider, owl carousel, main.js
    ├── images/                     # Background images, loader gif
    ├── fonts/                      # Bootstrap glyphicons, Flaticon, IcoMoon
    └── sass/                       # SASS source files for Bootstrap theme
```

### Request Flow

```
User submits text (POST /)
        │
        ▼
OriginalTextForm validates (min 20, max 10000 chars)
        │
        ▼
PredictionModel.preprocess()
  - Strip non-alpha characters
  - Lowercase
  - Tokenize
  - Remove English stopwords
  - Apply Porter stemming
        │
        ▼
tfidfvect2.transform()  →  sparse vector
        │
        ▼
model2.predict()  →  0 (Propaganda) or 1 (non-Propaganda)
        │
        ▼
Render home.html with original text, preprocessed text, prediction
```

---

## Initial Analysis

### Codebase Exploration

The codebase was explored by reading all Python source files, the HTML template, `requirements.txt`, `nltk.txt`, `Procfile`, and inspecting the project directory structure and file sizes.

### Dependencies Identified

The original `requirements.txt` specified versions from 2019–2020 (e.g. Flask 1.1.1, scikit-learn 0.23.1) with invalid trailing dashes on several lines. These were incompatible with Python 3.14. All packages were updated to current stable versions.

### Existing Features Understood

| Feature | Location | Description |
|---------|----------|-------------|
| Text input form | `forms.py`, `home.html` | Textarea with min/max length validation |
| Generate random text | `app.py:17–22` | Loads a random row from `random_dataset.csv` |
| Predict button | `app.py:24–27` | Triggers full ML pipeline, renders results |
| 3-panel result display | `home.html:164–214` | Shows original text, preprocessed text, verdict |
| REST predict endpoint | `app.py:32–36` | `GET/POST /predict/<text>` returns JSON |
| Random sample API | `app.py:39–43` | `GET /random` returns title, text, label as JSON |
| Navigation bar | `home.html:52–70` | Logo + Home link; Sign Up and Login are stubs only |

---

## Changes & Improvements Made

### 1. Fixed `requirements.txt`

**What:** Rewrote the file with valid syntax and updated version pins.

**Why:** Original file had trailing dashes on dependency lines (e.g. `Flask==1.1.1 -----`) making it invalid for `pip install`. All pinned versions were 5+ years old and incompatible with Python 3.14.

**Before:**
```
Flask==1.1.1 -----
scikit_learn==0.23.1-----
pandas==0.25.1-----
```

**After:**
```
Flask==3.1.3
scikit-learn==1.8.0
pandas==3.0.2
```

---

### 2. Created Python Virtual Environment

**What:** Created `venv/` inside the project root using `python -m venv venv`.

**Why:** Isolates project dependencies from the system Python installation.

**Command:**
```bash
python -m venv venv
venv/Scripts/pip install flask flask-wtf wtforms pandas scikit-learn nltk joblib
```

---

### 3. Downloaded NLTK Stopwords Corpus

**What:** Downloaded the `stopwords` corpus to the system NLTK data directory.

**Why:** `prediction_model.py` calls `stopwords.words('english')` at prediction time. Without the corpus downloaded, the app crashes on first prediction.

**Command:**
```bash
venv/Scripts/python -c "import nltk; nltk.download('stopwords')"
```

---

### 4. Patched `tfidfvect2.pkl` for scikit-learn 1.8 Compatibility

**What:** Loaded the pickle, added an `idf_` attribute to the internal `TfidfTransformer`, and resaved the file. A backup was saved as `tfidfvect2.pkl.bak` (excluded from git).

**Why:** The vectorizer was serialized with scikit-learn 0.22.2. In that version, the fitted state was stored in `_idf_diag` (a diagonal sparse matrix). In scikit-learn 1.8, `check_is_fitted()` looks for attributes ending with `_` that don't start with `__`. Since `_idf_diag` does not end with `_`, the check failed and every prediction raised `NotFittedError`.

**Fix applied:**
```python
import joblib
v = joblib.load('tfidfvect2.pkl')
v._tfidf.idf_ = v._tfidf._idf_diag.diagonal()
joblib.dump(v, 'tfidfvect2.pkl')
```

---

### 5. Created `.gitignore`

**What:** Created `.gitignore` at the project root.

**Why:** The project had no `.gitignore`. Without it, the 344 MB `venv/`, 111 MB `Dataset/`, 73 MB `tfidfvect.pkl` (old unused model), and generated backup files would have been committed to the repository.

**Excluded:**
- `venv/` — virtual environment (344 MB)
- `Dataset/` — training CSVs (Fake.csv 60 MB, True.csv 52 MB — exceed GitHub's 50 MB recommendation)
- `model.pkl`, `tfidfvect.pkl` — old unused model artifacts
- `*.bak` — backup files generated during the pickle patch
- `__pycache__/`, `*.pyc`, `.env`, `nltk_data/`

---

### 6. Initialized Git Repository and Pushed to GitHub

**What:** Ran `git init`, staged all appropriate files, made the initial commit, added the remote, and pushed to `main`.

**Repository:** https://github.com/akashadiga/propaganda-detector

**Commit summary:** 134 files — all source code, templates, static assets, and active model artifacts (`model2.pkl`, `tfidfvect2.pkl`).

---

## How to Run Locally

### Prerequisites

- Python 3.10 or higher
- Git

### Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/akashadiga/propaganda-detector.git
cd propaganda-detector

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Download NLTK stopwords (one-time)
python -c "import nltk; nltk.download('stopwords')"

# 5. Start the development server
python app.py
```

The app will be available at **http://127.0.0.1:5000**.

### Notes

- `model2.pkl` and `tfidfvect2.pkl` must be present in the project root — they are committed to the repo.
- `Dataset/` (training data) is not included in the repo due to file size. The app runs fine without it; it is only needed to retrain the model.

---

## API Reference

### `GET /`
Renders the home page with the prediction form.

### `POST /`
Submits text for prediction. Returns the same page with results rendered.

**Form fields:**
- `original_text` — news text (min 20, max 10,000 characters)
- `predict` — submit button to trigger prediction
- `generate` — button to populate the form with a random sample

### `GET /predict/<original_text>`
Runs prediction on URL-encoded text. Returns JSON.

**Response:**
```json
{
  "original": "...",
  "preprocessed": "...",
  "prediction": "Propaganda"
}
```

### `GET /random`
Returns a random row from `random_dataset.csv` as JSON.

**Response:**
```json
{
  "title": "...",
  "text": "...",
  "label": "0"
}
```

---

## Known Limitations & Recommendations

### Active Issues

| Issue | Location | Impact |
|-------|----------|--------|
| `SECRET_KEY` is hardcoded | `app.py:10` | Security risk on a public repo — move to `.env` |
| `output = {}` is a class-level dict | `prediction_model.py:19` | Shared across all instances; causes data bleed under concurrent requests |
| `random_dataset.csv` read on every button click | `app.py:18` | Unnecessary disk I/O — load once at startup |
| `/predict/<text>` passes text in the URL path | `app.py:32` | Breaks on long inputs and special characters — should be a POST with JSON body |
| Inconsistent length check | `app.py:25` checks `> 10`, form validates `min=20` | Minor inconsistency |
| `PassiveAggressiveClassifier` deprecated | scikit-learn 1.8 warning | Will be removed in scikit-learn 1.10 — model needs retraining with `SGDClassifier` |

### Recommended Next Steps

1. **Move `SECRET_KEY` to environment variable** — use `python-dotenv` and a `.env` file.
2. **Fix class-level dict bug** — move `output = {}` into `__init__` as `self.output = {}`.
3. **Add confidence scores** — `model.predict_proba()` is available and would make results more informative.
4. **Implement Sign Up / Login** — the navbar buttons exist but have no backing routes or logic.
5. **Add prediction history** — store results per session using Flask's `session` object.
6. **Add a loading indicator** — the page freezes while the model runs; a spinner would improve UX.
7. **Add a character counter** to the textarea so users know how close they are to the 10,000-character limit.
8. **Write tests** — no tests exist. At minimum, unit tests for `preprocess()` and integration tests for the `/predict` route.
9. **Retrain the model** — current `.pkl` files were saved with scikit-learn 0.22.2 and carry version warnings. Retraining with the current stack eliminates the compatibility debt. The Jupyter notebook (`propaganda News Prediction.ipynb`) contains the full training pipeline.
10. **Accept URL input** — scrape article text from a URL so users don't need to copy-paste.
