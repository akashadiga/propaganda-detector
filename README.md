# Propaganda News Detector

A full-stack machine learning web application that classifies news text as **Propaganda** or **non-Propaganda**. The backend is a Flask REST API powered by a PassiveAggressiveClassifier with TF-IDF vectorization. The frontend is a modern Angular 21 single-page app styled with Tailwind CSS.

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
| Frontend | Angular 21, Tailwind CSS 3, Inter font |
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
│   └── home.html                   # Legacy Flask-rendered UI (Bootstrap 3)
│
├── static/                         # Legacy static assets (Bootstrap 3, jQuery)
│
└── frontend/                       # NEW: Angular 21 frontend
    ├── src/
    │   ├── app/
    │   │   ├── app.ts              # Root component — holds state (result)
    │   │   ├── app.html            # Root template
    │   │   ├── app.config.ts       # Providers: HttpClient
    │   │   ├── components/
    │   │   │   ├── navbar/         # Top navigation bar
    │   │   │   ├── predictor/      # Input form + char counter + buttons
    │   │   │   └── result/         # Result cards + verdict badge
    │   │   └── services/
    │   │       └── prediction.service.ts  # HTTP calls to Flask API
    │   ├── index.html
    │   └── styles.css              # Tailwind base + global styles
    ├── proxy.conf.json             # Forwards /api/* → Flask :5000
    ├── tailwind.config.js
    └── angular.json
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

### 7. Angular Frontend Migration

**What:** Replaced the Bootstrap 3 / jQuery frontend with a modern Angular 21 single-page app styled with Tailwind CSS. The Flask backend is unchanged; the Angular app communicates with it via a REST API.

**Why:** The old frontend was a generic portfolio template with 1,473 lines of CSS (mostly dead code), 15 unused JavaScript libraries, no loading state, results below a 600px dead hero image, and no character counter. The new frontend is purpose-built for this tool.

**Components built:**

| Component | File | Purpose |
|-----------|------|---------|
| `NavbarComponent` | `components/navbar/` | Clean top bar — logo + GitHub link, no auth stubs |
| `PredictorComponent` | `components/predictor/` | Textarea with live char counter, Generate + Analyze buttons, spinner during API call |
| `ResultComponent` | `components/result/` | Verdict banner (RED = Propaganda, GREEN = non-Propaganda) + 2-panel detail cards |
| `PredictionService` | `services/prediction.service.ts` | `HttpClient` calls to `/api/predict` (POST) and `/api/random` (GET) |

**New Flask API endpoints added (`app.py`):**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | POST | Accepts `{ "text": "..." }` JSON body, returns prediction |
| `/api/random` | GET | Returns random sample as JSON |

**CORS** enabled on `/api/*` for `localhost:4200` via `flask-cors`.

**Angular proxy** (`proxy.conf.json`) forwards all `/api/*` calls from the Angular dev server to Flask at `:5000` — no hardcoded URLs in Angular code.

**Color theme — bright & simple:**

| Role | Color |
|------|-------|
| Background | White `#FFFFFF` |
| Primary (buttons) | Sky blue `#0EA5E9` |
| Propaganda verdict | Bright red `#EF4444` |
| Non-Propaganda verdict | Bright green `#22C55E` |
| Text | Near-black `#0F172A` |

---

## How to Run Locally

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher + npm
- Angular CLI (`npm install -g @angular/cli`)
- Git

---

### Backend (Flask)

```bash
# 1. Clone the repository
git clone https://github.com/akashadiga/propaganda-detector.git
cd propaganda-detector

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Download NLTK stopwords (one-time)
python -c "import nltk; nltk.download('stopwords')"

# 5. Start Flask
python app.py
```

Flask runs at **http://localhost:5000**.

---

### Frontend (Angular)

```bash
# In a second terminal — from the repo root
cd frontend

# 1. Install Node dependencies (one-time)
npm install

# 2. Start the Angular dev server
npm start
```

Angular runs at **http://localhost:4200**.
The dev server automatically proxies all `/api/*` requests to Flask at `:5000`.

---

### Running Both Together

Open two terminals side by side:

| Terminal 1 | Terminal 2 |
|------------|------------|
| `python app.py` (from repo root) | `npm start` (from `frontend/`) |
| Runs on `:5000` | Runs on `:4200` |

Then open **http://localhost:4200** in your browser.

### Notes

- `model2.pkl` and `tfidfvect2.pkl` must be present in the project root — they are committed to the repo.
- `Dataset/` (training data) is not included in the repo due to file size. The app runs fine without it; it is only needed to retrain the model.
- `node_modules/` is excluded from git — always run `npm install` after cloning.

---

## API Reference

### Angular Frontend API (primary)

#### `POST /api/predict`
Accepts text, returns prediction. Used by the Angular frontend.

**Request body:**
```json
{ "text": "paste your news article here" }
```

**Response:**
```json
{
  "original": "paste your news article here",
  "preprocessed": "past news articl",
  "prediction": "Propaganda"
}
```

#### `GET /api/random`
Returns a random news sample from the dataset.

**Response:**
```json
{
  "title": "Article headline...",
  "text": "Full article text...",
  "label": "0"
}
```

---

### Legacy Flask UI (kept for backwards compatibility)

#### `GET /` / `POST /`
The original server-rendered Bootstrap 3 UI. Still functional.

#### `GET /predict/<original_text>`
Legacy URL-path prediction endpoint. Use `/api/predict` POST instead for long text.

#### `GET /random`
Legacy random sample endpoint. Equivalent to `/api/random`.

---

## Known Limitations & Recommendations

### Fixed in Angular Migration

| Issue | Status |
|-------|--------|
| No loading state during prediction | Fixed — spinner on Analyze button |
| No character counter | Fixed — live `chars: 0 / 10000` counter |
| Results below 600px dead hero image | Fixed — result appears directly below input |
| Identical button color for both verdicts | Fixed — RED for Propaganda, GREEN for non-Propaganda |
| `/predict/<text>` URL-path breaks on long input | Fixed — new `/api/predict` uses POST with JSON body |
| `random_dataset.csv` read on every click | Fixed — loaded once at startup in `app.py` |
| 15 unused JS libraries in frontend | Fixed — Angular + Tailwind only |

### Remaining Active Issues

| Issue | Location | Impact |
|-------|----------|--------|
| `SECRET_KEY` is hardcoded | `app.py:11` | Security risk — move to `.env` |
| `output = {}` is a class-level dict | `prediction_model.py:19` | Data bleed under concurrent requests |
| `PassiveAggressiveClassifier` deprecated | scikit-learn 1.8 | Will be removed in scikit-learn 1.10 |

### Recommended Next Steps

1. **Move `SECRET_KEY` to environment variable** — use `python-dotenv` and a `.env` file.
2. **Fix class-level dict bug** — move `output = {}` into `__init__` as `self.output = {}`.
3. **Add confidence scores** — `model.predict_proba()` would make results more informative; show a percentage alongside the verdict.
4. **Add prediction history** — store results in the Angular component so users can compare multiple predictions.
5. **Write tests** — no tests exist. Unit tests for `preprocess()`, integration tests for `/api/predict`.
6. **Retrain the model** — current `.pkl` files were saved with scikit-learn 0.22.2 and carry version warnings. The Jupyter notebook contains the full training pipeline.
7. **Accept URL input** — scrape article text from a URL so users don't need to copy-paste.
