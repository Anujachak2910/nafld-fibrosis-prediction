#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "========================================="
echo "  NAFLD Fibrosis Research Model - Render Build"
echo "========================================="

echo "[1/2] Installing Python dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements-render.txt

echo "[2/2] Checking Frontend Assets..."
if command -v npm >/dev/null 2>&1; then
    echo "npm detected: building fresh frontend assets..."
    cd frontend
    npm install
    npm run build
    cd ..
else
    echo "npm not detected in Python native runtime: using committed pre-built frontend/dist assets."
fi

if [ ! -f "frontend/dist/index.html" ]; then
    echo "ERROR: frontend/dist/index.html not found!"
    exit 1
fi

echo "========================================="
echo "  Build successful! Ready for startup."
echo "========================================="
