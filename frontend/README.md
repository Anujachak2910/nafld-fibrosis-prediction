# NAFLD Fibrosis Risk Prediction: Web Application

A clinical research and education web interface for non-invasive risk estimation of significant liver fibrosis (stage F ≥ 2) in patients with NAFLD.

> **Research and learning project only. This model is not a diagnostic tool and must not guide clinical care.**

---

## 1. Architecture Overview

- **Backend**: FastAPI (`backend/api.py`) exposing the fitted research model bundle (`outputs/final/research_model_bundle.joblib`).
  - `POST /predict`: Evaluates the 33 approved clinical and blood inputs against the sensitivity-oriented 0.4158 threshold and calculates a side-by-side FIB-4 clinical benchmark score.
  - `GET /metrics`: Serves authentic cross-validation, nested out-of-fold, subgroup, and stretch metrics from repository artifacts.
  - `GET /feature-schema`: Returns schema, units, ranges, and cohort medians for all 33 predictors.
  - `GET /health`: Health-check endpoint.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts for charts, and React Hook Form + Zod for validation. Hand-crafted with an editorial scientific aesthetic (Nature / NEJM / Stripe Docs style).

---

## 2. Prerequisites

1. **Python Virtual Environment** (with Python 3.10+ or Python 3.14.5 as pinned in the repo):
   - Located at repository root `.venv/`
   - Dependencies: `fastapi`, `uvicorn`, `pydantic`, `joblib`, `scikit-learn`, `pandas`, `numpy`, `openpyxl`
2. **Node.js** (v18 or higher; tested on v24.18.0) and **npm** (v10+).

---

## 3. How to Run Locally

### Step 1: Start the Backend FastAPI Service

From the repository root (`nafld-fibrosis-prediction/`):

```bash
# Windows PowerShell / CMD
.venv\Scripts\python.exe -m uvicorn backend.api:app --host 127.0.0.1 --port 8000 --reload

# Linux / macOS
.venv/bin/python -m uvicorn backend.api:app --host 127.0.0.1 --port 8000 --reload
```

The API will start at:
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/health`
- **Feature Schema**: `http://127.0.0.1:8000/feature-schema`

### Step 2: Start the Frontend Development Server

Open a second terminal window, navigate to the `frontend/` directory, and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at: `http://localhost:5173/`

*(Note: The frontend has a deterministic fallback inference engine. If the backend is restarting or offline, the web application remains 100% interactive and calculates aligned risk estimates and FIB-4 scores.)*

---

## 4. Building for Production

To create an optimized production build:

```bash
cd frontend
npm run build
npm run preview
```

---

## 5. Repository & Provenance Notes

- **No Retraining**: The backend wraps the frozen, pre-fitted `research_model_bundle.joblib` without retraining or modifying notebooks.
- **Exploratory Holdout**: All holdout metrics (N=121) are designated as exploratory because the holdout was inspected during baseline work.
- **Code License**: MIT License (see repository root `LICENSE`).
- **Dataset License**: The underlying `data/NAFLD.xlsx` dataset provenance and licensing remain unverified; raw data must not be redistributed.
