"""Project configuration and the approved leakage-safe feature policy."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "data" / "NAFLD.xlsx"
OUTPUT_PATH = ROOT / "outputs" / "baseline-v1"
SEED = 42
TEST_SIZE = 0.20
CV_FOLDS = 5
CV_REPEATS = 3

TARGET_FLAG = "Significant Fibrosis (No=0, Yes=1) (If Fibrosis 2 and above, there is Significant Fibrosis)"
FIBROSIS_STAGE = "Fibrosis"
PATIENT_ID = "Patient No."

FEATURES = [
    "Age",
    "Gender (Female=1, Male=2)",
    "Body Mass Index",
    "Waist Circumference",
    "Hip Circumference",
    "Systolic Blood Pressure",
    "Diastolic Blood Pressure",
    "Diyabetes Mellitus (No=0, Yes=1)",
    "Hypertension (No=0, Yes=1)",
    "Hyperlipidemia (No=0, Yes=1)",
    "Metabolic syndrome (No=0, Yes=1)",
    "Smoking Status (Never Smoked=1, Left Smoking=2, Smoking=3)",
    "AST", "ALT", "ALP", "GGT", "LDH", "Total Bilirubin", "Direct Bilirubin",
    "Total Protein", "Albumin", "Total Cholesterol", "Triglycerides", "HDL", "LDL",
    "Leukocyte", "Hemoglobin", "Trombosit", "Mean Corpuscular Volume",
    "Mean Platelet Volume", "Ferritin", "Glucose", "Hemoglobin - A1C",
]
BINARY_CATEGORICAL = [
    "Gender (Female=1, Male=2)",
    "Diyabetes Mellitus (No=0, Yes=1)",
    "Hypertension (No=0, Yes=1)",
    "Hyperlipidemia (No=0, Yes=1)",
    "Metabolic syndrome (No=0, Yes=1)",
]
SMOKING = "Smoking Status (Never Smoked=1, Left Smoking=2, Smoking=3)"
NUMERIC = [c for c in FEATURES if c not in BINARY_CATEGORICAL + [SMOKING]]

SPARSE_LABS = [
    "Microalbumin/Creatinine Ratio", "CK", "C Peptide", "Microalbumin Spot Urine",
    "Vitamin D", "PT", "Uric Acid", "HOMA", "Insulin",
    "Insulin resistance according to HOMA (insulin resistance = 1, no insulin resistance = 2)",
    "Ceruloplasmin", "TSH", "INR", "Creatinine", "BUN",
]
PANEL_COLUMNS = ["INR", "BUN", "Creatinine", "TSH", "Ceruloplasmin", "Insulin", "Uric Acid"]
FIB4_COLUMNS = ["Age", "AST", "Trombosit", "ALT"]
BIOPSY_AND_DERIVED = [
    "Steatosis", "Activity", "Fibrosis", "NAS score according to Kleiner",
    "NAS score>=4 and Fibrosis>=2 (If NAS score>=4 and Fibrosis>=2 = 1, If not = 0)",
    "Fibrosis status (No=0, Yes=1) (Fibrosis 1 and above, there is Fibrosis)",
    TARGET_FLAG,
    "Advanced Fibrosis (No=0, Yes=1) (If Fibrosis is 3 and above, there is Advanced Fibrosis)",
    "Cirrhosis (No=0, Yes=1) (If Fibrosis is 4, there is Cirrhosis)",
    "Diagnosis according to SAF (NASH=1, NAFL=2)",
    "Type of Disease (Mild illness=1, Severe illness=2)",
]
BANNED_INPUTS = set(BIOPSY_AND_DERIVED + [PATIENT_ID, "Height", "Weight", "FIB4", "n_panel", "in_panel", "AtRiskNASH_calc", "FibGroup"])
