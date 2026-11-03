#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "========================================="
echo "  NAFLD Fibrosis Research Model - Render Build"
echo "========================================="

echo "[1/3] Upgrading pip and installing Python dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements-render.txt

echo "[2/3] Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "[3/3] Verifying trained research model bundle exists..."
if [ -f "outputs/final/research_model_bundle.joblib" ]; then
    echo " Model bundle found in outputs/final/"
elif [ -f "notebooks/research_model_bundle.joblib" ]; then
    echo " Model bundle found in notebooks/; copying to outputs/final/"
    mkdir -p outputs/final
    cp notebooks/research_model_bundle.joblib outputs/final/
else
    echo "⚠️ Warning: research_model_bundle.joblib not found. Generating bundle..."
    python scripts/package_research_model.py || true
fi

echo "========================================="
echo "  Build successful! Ready for startup."
echo "========================================="
