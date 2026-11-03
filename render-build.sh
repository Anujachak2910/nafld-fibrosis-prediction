#!/usr/bin/env bash
# Render build script for NAFLD Fibrosis Risk Estimation
set -o errexit

echo "========================================="
echo "  NAFLD Fibrosis Research Model - Render Build"
echo "========================================="

echo "Installing Python production dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements-render.txt

echo "Verifying pre-built frontend assets..."
if [ ! -f "frontend/dist/index.html" ]; then
    echo "ERROR: frontend/dist/index.html not found!"
    exit 1
fi

echo "========================================="
echo "  Build successful! Ready for startup."
echo "========================================="
