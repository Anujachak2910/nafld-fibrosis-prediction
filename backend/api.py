"""FastAPI inference and metrics service for NAFLD Fibrosis Prediction research model.
Wraps the fitted research model bundle in outputs/final/research_model_bundle.joblib.
Does not alter or retrain the model.
"""

import json
import math
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure repo src/ is importable for scikit-learn transformers
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

app = FastAPI(
    title="NAFLD Fibrosis Prediction API",
    description="Research model service for estimating significant fibrosis risk (F >= 2) in NAFLD patients.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BUNDLE_PATH = ROOT / "outputs" / "final" / "research_model_bundle.joblib"
BASELINE_METRICS_PATH = ROOT / "outputs" / "baseline-v1" / "metrics.json"
PHASE2_OOF_PATH = ROOT / "outputs" / "phase2-v1" / "nested_oof_comparison.json"
PHASE3_PATH = ROOT / "outputs" / "phase3-v1" / "phase3_analysis.json"
STRETCH_PATH = ROOT / "outputs" / "stretch-v1" / "stretch_metrics.json"
FINAL_REPORT_PATH = ROOT / "outputs" / "final" / "final_report.md"

# Load model bundle
if not BUNDLE_PATH.exists():
    raise RuntimeError(f"Model bundle not found at {BUNDLE_PATH}")

bundle = joblib.load(BUNDLE_PATH)
pipeline = bundle["pipeline"]
FEATURES: List[str] = bundle["features"]
THRESHOLD: float = float(bundle["threshold"])
INTENDED_USE: str = bundle.get("intended_use", "Research and learning only; not a diagnostic tool.")

# Feature Metadata derived from training dataset & data contract
FEATURE_METADATA = [
    # Demographics
    {
        "id": "Age",
        "name": "Age",
        "group": "Demographics",
        "type": "numeric",
        "unit": "years",
        "min": 18.0,
        "max": 71.0,
        "default": 47.0,
        "description": "Patient age in years.",
    },
    {
        "id": "Gender (Female=1, Male=2)",
        "name": "Gender",
        "group": "Demographics",
        "type": "categorical",
        "unit": "Coded",
        "options": [
            {"value": 1, "label": "Female (1)"},
            {"value": 2, "label": "Male (2)"},
        ],
        "default": 2,
        "description": "Biological sex coded as Female=1, Male=2.",
    },
    {
        "id": "Smoking Status (Never Smoked=1, Left Smoking=2, Smoking=3)",
        "name": "Smoking Status",
        "group": "Demographics",
        "type": "categorical",
        "unit": "Coded",
        "options": [
            {"value": 1, "label": "Never Smoked (1)"},
            {"value": 2, "label": "Left Smoking (2)"},
            {"value": 3, "label": "Active Smoker (3)"},
        ],
        "default": 2,
        "description": "Smoking history coded into 3 distinct categories.",
    },
    # Body Measures
    {
        "id": "Body Mass Index",
        "name": "Body Mass Index (BMI)",
        "group": "Body Measures",
        "type": "numeric",
        "unit": "kg/m²",
        "min": 18.3,
        "max": 56.0,
        "default": 31.2,
        "description": "Calculated body mass index (weight / height²).",
    },
    {
        "id": "Waist Circumference",
        "name": "Waist Circumference",
        "group": "Body Measures",
        "type": "numeric",
        "unit": "cm",
        "min": 63.0,
        "max": 155.0,
        "default": 108.0,
        "description": "Waist circumference measured at natural waistline.",
    },
    {
        "id": "Hip Circumference",
        "name": "Hip Circumference",
        "group": "Body Measures",
        "type": "numeric",
        "unit": "cm",
        "min": 70.0,
        "max": 147.0,
        "default": 104.0,
        "description": "Hip circumference at widest point.",
    },
    {
        "id": "Systolic Blood Pressure",
        "name": "Systolic Blood Pressure",
        "group": "Body Measures",
        "type": "numeric",
        "unit": "mmHg",
        "min": 90.0,
        "max": 190.0,
        "default": 121.0,
        "description": "Resting systolic arterial pressure.",
    },
    {
        "id": "Diastolic Blood Pressure",
        "name": "Diastolic Blood Pressure",
        "group": "Body Measures",
        "type": "numeric",
        "unit": "mmHg",
        "min": 51.0,
        "max": 120.0,
        "default": 80.0,
        "description": "Resting diastolic arterial pressure.",
    },
    # Comorbidities
    {
        "id": "Diyabetes Mellitus (No=0, Yes=1)",
        "name": "Diabetes Mellitus",
        "group": "Comorbidities",
        "type": "categorical",
        "unit": "Coded",
        "options": [
            {"value": 0, "label": "No (0)"},
            {"value": 1, "label": "Yes (1)"},
        ],
        "default": 0,
        "description": "Clinical diagnosis of diabetes mellitus (source spelling preserved).",
    },
    {
        "id": "Hypertension (No=0, Yes=1)",
        "name": "Hypertension",
        "group": "Comorbidities",
        "type": "categorical",
        "unit": "Coded",
        "options": [
            {"value": 0, "label": "No (0)"},
            {"value": 1, "label": "Yes (1)"},
        ],
        "default": 0,
        "description": "Clinical diagnosis of essential hypertension.",
    },
    {
        "id": "Hyperlipidemia (No=0, Yes=1)",
        "name": "Hyperlipidemia",
        "group": "Comorbidities",
        "type": "categorical",
        "unit": "Coded",
        "options": [
            {"value": 0, "label": "No (0)"},
            {"value": 1, "label": "Yes (1)"},
        ],
        "default": 1,
        "description": "Elevated lipids or lipid-lowering medication history.",
    },
    {
        "id": "Metabolic syndrome (No=0, Yes=1)",
        "name": "Metabolic Syndrome",
        "group": "Comorbidities",
        "type": "categorical",
        "unit": "Coded",
        "options": [
            {"value": 0, "label": "No (0)"},
            {"value": 1, "label": "Yes (1)"},
        ],
        "default": 1,
        "description": "Presence of diagnostic metabolic syndrome criteria.",
    },
    # Blood Tests - Liver Enzymes
    {
        "id": "AST",
        "name": "AST (Aspartate Aminotransferase)",
        "group": "Blood Tests: Liver Enzymes",
        "type": "numeric",
        "unit": "U/L",
        "min": 11.0,
        "max": 302.0,
        "default": 42.0,
        "description": "Serum aspartate aminotransferase. Also required for FIB-4.",
    },
    {
        "id": "ALT",
        "name": "ALT (Alanine Aminotransferase)",
        "group": "Blood Tests: Liver Enzymes",
        "type": "numeric",
        "unit": "U/L",
        "min": 12.0,
        "max": 343.0,
        "default": 66.0,
        "description": "Serum alanine aminotransferase. Also required for FIB-4.",
    },
    {
        "id": "ALP",
        "name": "ALP (Alkaline Phosphatase)",
        "group": "Blood Tests: Liver Enzymes",
        "type": "numeric",
        "unit": "U/L",
        "min": 25.0,
        "max": 625.0,
        "default": 89.5,
        "description": "Serum alkaline phosphatase.",
    },
    {
        "id": "GGT",
        "name": "GGT (Gamma-Glutamyl Transferase)",
        "group": "Blood Tests: Liver Enzymes",
        "type": "numeric",
        "unit": "U/L",
        "min": 9.0,
        "max": 559.0,
        "default": 49.0,
        "description": "Serum gamma-glutamyl transferase.",
    },
    {
        "id": "LDH",
        "name": "LDH (Lactate Dehydrogenase)",
        "group": "Blood Tests: Liver Enzymes",
        "type": "numeric",
        "unit": "U/L",
        "min": 19.0,
        "max": 969.0,
        "default": 216.0,
        "description": "Serum lactate dehydrogenase.",
    },
    # Blood Tests - Bilirubin & Proteins
    {
        "id": "Total Bilirubin",
        "name": "Total Bilirubin",
        "group": "Blood Tests: Bilirubin & Proteins",
        "type": "numeric",
        "unit": "mg/dL",
        "min": 0.05,
        "max": 7.60,
        "default": 0.655,
        "description": "Serum total bilirubin concentration.",
    },
    {
        "id": "Direct Bilirubin",
        "name": "Direct Bilirubin",
        "group": "Blood Tests: Bilirubin & Proteins",
        "type": "numeric",
        "unit": "mg/dL",
        "min": 0.01,
        "max": 1.83,
        "default": 0.170,
        "description": "Conjugated (direct) bilirubin.",
    },
    {
        "id": "Total Protein",
        "name": "Total Protein",
        "group": "Blood Tests: Bilirubin & Proteins",
        "type": "numeric",
        "unit": "g/dL",
        "min": 6.40,
        "max": 9.14,
        "default": 7.80,
        "description": "Total serum protein concentration.",
    },
    {
        "id": "Albumin",
        "name": "Albumin",
        "group": "Blood Tests: Bilirubin & Proteins",
        "type": "numeric",
        "unit": "g/dL",
        "min": 3.40,
        "max": 5.90,
        "default": 4.70,
        "description": "Serum albumin concentration.",
    },
    # Blood Tests - Lipids
    {
        "id": "Total Cholesterol",
        "name": "Total Cholesterol",
        "group": "Blood Tests: Lipid Panel",
        "type": "numeric",
        "unit": "mg/dL",
        "min": 74.0,
        "max": 419.0,
        "default": 211.0,
        "description": "Serum total cholesterol.",
    },
    {
        "id": "Triglycerides",
        "name": "Triglycerides",
        "group": "Blood Tests: Lipid Panel",
        "type": "numeric",
        "unit": "mg/dL",
        "min": 37.0,
        "max": 1107.0,
        "default": 164.5,
        "description": "Serum triglycerides concentration.",
    },
    {
        "id": "HDL",
        "name": "HDL Cholesterol",
        "group": "Blood Tests: Lipid Panel",
        "type": "numeric",
        "unit": "mg/dL",
        "min": 18.0,
        "max": 96.0,
        "default": 44.0,
        "description": "High-density lipoprotein cholesterol.",
    },
    {
        "id": "LDL",
        "name": "LDL Cholesterol",
        "group": "Blood Tests: Lipid Panel",
        "type": "numeric",
        "unit": "mg/dL",
        "min": 28.0,
        "max": 400.0,
        "default": 134.0,
        "description": "Low-density lipoprotein cholesterol.",
    },
    # Blood Tests - Hematology
    {
        "id": "Leukocyte",
        "name": "Leukocyte Count (WBC)",
        "group": "Blood Tests: Hematology",
        "type": "numeric",
        "unit": "cells/mcL",
        "min": 2400.0,
        "max": 14900.0,
        "default": 7000.0,
        "description": "Total white blood cell count.",
    },
    {
        "id": "Hemoglobin",
        "name": "Hemoglobin",
        "group": "Blood Tests: Hematology",
        "type": "numeric",
        "unit": "g/dL",
        "min": 7.10,
        "max": 18.90,
        "default": 14.40,
        "description": "Whole blood hemoglobin concentration.",
    },
    {
        "id": "Trombosit",
        "name": "Platelet Count (Trombosit)",
        "group": "Blood Tests: Hematology",
        "type": "numeric",
        "unit": "10³/mcL",
        "min": 77.0,
        "max": 543.0,
        "default": 240.0,
        "description": "Platelet count (source spelling Trombosit). Also required for FIB-4.",
    },
    {
        "id": "Mean Corpuscular Volume",
        "name": "Mean Corpuscular Volume (MCV)",
        "group": "Blood Tests: Hematology",
        "type": "numeric",
        "unit": "fL",
        "min": 13.1,
        "max": 100.7,
        "default": 86.0,
        "description": "Average volume of red blood cells.",
    },
    {
        "id": "Mean Platelet Volume",
        "name": "Mean Platelet Volume (MPV)",
        "group": "Blood Tests: Hematology",
        "type": "numeric",
        "unit": "fL",
        "min": 5.62,
        "max": 18.0,
        "default": 8.60,
        "description": "Average volume of platelets.",
    },
    # Blood Tests - Glycemic & Iron
    {
        "id": "Ferritin",
        "name": "Serum Ferritin",
        "group": "Blood Tests: Glycemic & Iron",
        "type": "numeric",
        "unit": "ng/mL",
        "min": 3.8,
        "max": 821.2,
        "default": 91.1,
        "description": "Serum ferritin storage protein.",
    },
    {
        "id": "Glucose",
        "name": "Fasting Blood Glucose",
        "group": "Blood Tests: Glycemic & Iron",
        "type": "numeric",
        "unit": "mg/dL",
        "min": 66.0,
        "max": 307.0,
        "default": 100.0,
        "description": "Fasting serum glucose level.",
    },
    {
        "id": "Hemoglobin - A1C",
        "name": "Hemoglobin A1c (HbA1c)",
        "group": "Blood Tests: Glycemic & Iron",
        "type": "numeric",
        "unit": "%",
        "min": 3.52,
        "max": 11.10,
        "default": 5.80,
        "description": "Glycated hemoglobin percentage.",
    },
]

FEATURE_MAP = {f["id"]: f for f in FEATURE_METADATA}


class PredictionRequest(BaseModel):
    # Dynamic dictionary matching the 33 approved feature names
    features: Dict[str, Optional[float]] = Field(
        ...,
        description="Dictionary mapping each of the 33 approved feature names to a numerical value. Missing values may be null.",
    )


def compute_fib4(age: Optional[float], ast: Optional[float], alt: Optional[float], platelets: Optional[float]) -> Optional[Dict[str, Any]]:
    """Compute clinical benchmark FIB-4 score if all 4 inputs are present and valid."""
    if age is None or ast is None or alt is None or platelets is None:
        return None
    try:
        age_v = float(age)
        ast_v = float(ast)
        alt_v = float(alt)
        plt_v = float(platelets)
        if alt_v <= 0 or plt_v <= 0:
            return None
        val = (age_v * ast_v) / (plt_v * math.sqrt(alt_v))
        if math.isinf(val) or math.isnan(val):
            return None
        
        # Clinical risk cutoffs for FIB-4:
        # < 1.30: Low risk (rule-out)
        # 1.30 to 2.67: Indeterminate zone
        # > 2.67: High risk (rule-in)
        if val < 1.30:
            band = "Low Risk (Rule-Out)"
            interpretation = "Below standard 1.3 cutoff: low probability of advanced/significant fibrosis."
        elif val <= 2.67:
            band = "Indeterminate"
            interpretation = "Between 1.3 and 2.67: indeterminate risk, standard guidance suggests second-line test."
        else:
            band = "High Risk (Rule-In)"
            interpretation = "Above 2.67 cutoff: elevated risk, high probability of fibrosis."

        return {
            "score": round(val, 2),
            "cutoff_low": 1.30,
            "cutoff_high": 2.67,
            "risk_band": band,
            "interpretation": interpretation,
        }
    except Exception:
        return None


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": pipeline is not None,
        "feature_count": len(FEATURES),
        "threshold": THRESHOLD,
        "intended_use": INTENDED_USE,
    }


@app.get("/feature-schema")
def get_feature_schema():
    """Return schema, units, ranges, and cohort medians for all 33 predictors."""
    return {
        "count": len(FEATURE_METADATA),
        "threshold": THRESHOLD,
        "intended_use": INTENDED_USE,
        "features": FEATURE_METADATA,
    }


@app.get("/metrics")
def get_metrics():
    """Return verbatim research metrics directly from repo outputs."""
    baseline = {}
    if BASELINE_METRICS_PATH.exists():
        baseline = json.loads(BASELINE_METRICS_PATH.read_text(encoding="utf-8"))

    phase2_oof = {}
    if PHASE2_OOF_PATH.exists():
        phase2_oof = json.loads(PHASE2_OOF_PATH.read_text(encoding="utf-8"))

    phase3 = {}
    if PHASE3_PATH.exists():
        phase3 = json.loads(PHASE3_PATH.read_text(encoding="utf-8"))

    stretch = {}
    if STRETCH_PATH.exists():
        stretch = json.loads(STRETCH_PATH.read_text(encoding="utf-8"))

    return {
        "baseline": baseline,
        "nested_oof_comparison": phase2_oof,
        "phase3_analysis": phase3,
        "stretch_experiments": stretch,
        "intended_use": INTENDED_USE,
    }


@app.post("/predict")
def predict_fibrosis(request: PredictionRequest):
    """Estimate probability of significant fibrosis (F >= 2) for given patient data."""
    row = {}
    validation_warnings = []

    for name in FEATURES:
        val = request.features.get(name)
        meta = FEATURE_MAP.get(name)

        if val is None or (isinstance(val, (int, float)) and math.isnan(val)):
            row[name] = np.nan
        else:
            try:
                num_val = float(val)
                # Check ranges
                if meta and "min" in meta and "max" in meta:
                    if num_val < meta["min"] or num_val > meta["max"]:
                        validation_warnings.append(
                            f"{meta['name']} value {num_val} is outside cohort range [{meta['min']}, {meta['max']}]"
                        )
                row[name] = num_val
            except (ValueError, TypeError):
                row[name] = np.nan

    df_input = pd.DataFrame([row], columns=FEATURES)

    try:
        prob = float(pipeline.predict_proba(df_input)[0, 1])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error in scikit-learn pipeline: {str(e)}")

    is_elevated = prob >= THRESHOLD
    if prob < 0.25:
        risk_band = "Low Risk"
        band_description = "Estimated risk is well below the sensitivity-selected research threshold (0.4158)."
    elif prob < THRESHOLD:
        risk_band = "Indeterminate / Moderate Risk"
        band_description = "Estimated risk is moderate but below the 0.4158 decision threshold."
    else:
        risk_band = "Elevated Risk (≥ Threshold)"
        band_description = "Estimated risk meets or exceeds the sensitivity-selected threshold (0.4158), calibrated for 80% sensitivity on development OOF."

    # Compute FIB-4 comparator
    fib4_res = compute_fib4(
        age=row.get("Age"),
        ast=row.get("AST"),
        alt=row.get("ALT"),
        platelets=row.get("Trombosit"),
    )

    return {
        "probability": round(prob, 4),
        "percentage": round(prob * 100, 1),
        "threshold": round(THRESHOLD, 4),
        "threshold_percentage": round(THRESHOLD * 100, 1),
        "is_above_threshold": is_elevated,
        "risk_band": risk_band,
        "risk_description": band_description,
        "operating_point": {
            "target_sensitivity": 0.80,
            "oof_sensitivity": 0.805,
            "oof_specificity": 0.650,
            "threshold": 0.4158,
            "basis": "Nested repeated development OOF predictions; descriptive only",
        },
        "fib4_comparison": fib4_res,
        "validation_warnings": validation_warnings,
        "intended_use": INTENDED_USE,
    }


# Mount static frontend if built (allows single-service deployment on Render / Docker)
DIST_DIR = ROOT / "frontend" / "dist"
if DIST_DIR.exists():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    if (DIST_DIR / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path in ["health", "metrics", "feature-schema", "predict", "docs", "openapi.json", "redoc"]:
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = DIST_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "name": "NAFLD Fibrosis Risk Estimation API",
            "status": "online",
            "docs": "/docs",
            "health": "/health",
            "metrics": "/metrics",
            "schema": "/feature-schema",
            "note": "Frontend dist not built. Run 'npm run build' in frontend directory to serve UI."
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api:app", host="127.0.0.1", port=8000, reload=True)
