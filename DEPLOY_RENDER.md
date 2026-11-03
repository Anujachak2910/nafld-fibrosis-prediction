# Deploying NAFLD Fibrosis Risk Estimation on Render

This guide explains how to deploy both the **FastAPI Backend Service** and the **React Interactive Frontend** onto [Render](https://render.com) for free.

---

## Architecture Options

You can deploy the project on Render in one of two ways:

1. **Method 1: Unified All-in-One Web Service (Recommended)**
   - The FastAPI backend serves both the REST API (`/predict`, `/metrics`, `/health`) and the built React frontend application at a single URL.
   - **Advantages:** Uses only 1 free service on Render, zero CORS configuration needed, single URL for your portfolio/paper.
2. **Method 2: Dual Services (Backend Web Service + Frontend Static Site)**
   - Deploy backend as a Python Web Service and frontend as a Static Site.
   - Ideal if you want separate domains or independent deployment cadences.

---

## Method 1: Unified Web Service (1-Click Blueprint or Manual)

### Option A: Using the Render Blueprint (Easiest)

1. Push this repository to your GitHub account:
   ```bash
   git push origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository (`nafld-fibrosis-prediction`).
5. Render will automatically detect [`render.yaml`](../render.yaml) and configure:
   - **Name:** `nafld-fibrosis-app`
   - **Environment:** `Python 3`
   - **Build Command:** `bash render-build.sh`
   - **Start Command:** `uvicorn backend.api:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/health`
6. Click **Apply**.
7. Wait 2–3 minutes for the build to finish. Once done, click the generated URL (e.g., `https://nafld-fibrosis-app.onrender.com/`). Both the interactive UI and API endpoints will be live!

---

### Option B: Manual Web Service Setup on Render

If you prefer setting up the Web Service manually:

1. In Render Dashboard, click **New +** > **Web Service**.
2. Select **Build and deploy from a Git repository** and connect your repo.
3. Configure the service settings:
   - **Name:** `nafld-fibrosis-service` (or any name you choose)
   - **Region:** Any (e.g., Oregon or Frankfurt)
   - **Branch:** `main`
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     bash render-build.sh
     ```
   - **Start Command:**
     ```bash
     uvicorn backend.api:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type:** `Free`
4. Under **Advanced** > **Environment Variables**, add:
   - `PYTHON_VERSION`: `3.11.9`
   - `NODE_VERSION`: `20.12.0`
5. Click **Create Web Service**.

---

## Method 2: Dual Services (Separate Backend & Frontend)

### Step 1: Deploy Backend Web Service
1. In Render Dashboard, click **New +** > **Web Service**.
2. Connect your repo and set:
   - **Name:** `nafld-fibrosis-api`
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r requirements-render.txt
     ```
   - **Start Command:**
     ```bash
     uvicorn backend.api:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan:** `Free`
3. Click **Create Web Service** and copy your backend URL (e.g. `https://nafld-fibrosis-api.onrender.com`).

### Step 2: Deploy Frontend Static Site
1. In Render Dashboard, click **New +** > **Static Site**.
2. Connect the same repository and set:
   - **Name:** `nafld-fibrosis-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory:** `dist`
3. Under **Advanced** > **Environment Variables**, add:
   - `VITE_API_URL`: Your backend URL from Step 1 (e.g. `https://nafld-fibrosis-api.onrender.com`)
4. Click **Create Static Site**.

---

## Verifying Deployment

Once deployed, you can verify your service:

- **Frontend Application:** Open `https://<your-service-name>.onrender.com/` in your browser.
- **API Health Check:** `https://<your-service-name>.onrender.com/health` (should return `{"status": "healthy", ...}`)
- **Interactive Swagger Docs:** `https://<your-service-name>.onrender.com/docs`
- **Research Metrics:** `https://<your-service-name>.onrender.com/metrics`
- **Feature Schema:** `https://<your-service-name>.onrender.com/feature-schema`

---

## Render Free Tier Notes

- **Spin-down after inactivity:** Render Free Web Services sleep after 15 minutes of zero traffic. The first request after sleeping may take 30–50 seconds to wake up.
- **Persistent model files:** The trained model bundle (`research_model_bundle.joblib`, ~2MB) is committed directly to the Git repository, so it is loaded instantly on startup without requiring external cloud storage (S3/GCS).
