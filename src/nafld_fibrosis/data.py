"""Workbook loading, validation, target construction, and comparator calculation."""
import numpy as np
import pandas as pd

from .config import (
    BANNED_INPUTS, FEATURES, FIBROSIS_STAGE, FIB4_COLUMNS, PANEL_COLUMNS,
    PATIENT_ID, SPARSE_LABS, TARGET_FLAG,
)


def load_dataset(path):
    """Load the workbook and return validated inputs, target, strata, and FIB-4."""
    frame = pd.read_excel(path, sheet_name="Sheet1")
    if frame.shape != (605, 62):
        raise ValueError(f"Expected 605 rows x 62 columns, found {frame.shape}.")

    required = set(FEATURES + SPARSE_LABS + PANEL_COLUMNS + [
        PATIENT_ID, FIBROSIS_STAGE, TARGET_FLAG, "Height", "Weight",
        "Advanced Fibrosis (No=0, Yes=1) (If Fibrosis is 3 and above, there is Advanced Fibrosis)",
    ])
    missing = sorted(required.difference(frame.columns))
    if missing:
        raise ValueError(f"Workbook is missing required columns: {missing}")
    if frame[PATIENT_ID].isna().any() or frame[PATIENT_ID].duplicated().any():
        raise ValueError("Patient identifiers must be present and unique.")

    stage = pd.to_numeric(frame[FIBROSIS_STAGE], errors="coerce")
    if stage.isna().any() or not stage.isin([0, 1, 2, 3, 4]).all():
        raise ValueError("Fibrosis stage must contain only values 0 through 4.")
    y = (stage >= 2).astype("int8").rename("significant_fibrosis")
    supplied_target = pd.to_numeric(frame[TARGET_FLAG], errors="coerce")
    if supplied_target.isna().any() or not supplied_target.isin([0, 1]).all():
        raise ValueError("The supplied significant-fibrosis flag must be binary.")
    if not np.array_equal(y.to_numpy(), supplied_target.to_numpy()):
        raise ValueError("The supplied target flag disagrees with fibrosis stage.")
    if int(y.sum()) != 219:
        raise ValueError(f"Expected 219 F>=2 cases, found {int(y.sum())}.")

    # The EDA found three BMI values inconsistent with height and weight; its approved
    # cleaning rule recomputes BMI, while Height and Weight themselves stay excluded.
    frame = frame.copy()
    frame["Body Mass Index"] = (frame["Weight"] / (frame["Height"] / 100) ** 2).round(1)

    X = frame.loc[:, FEATURES].copy()
    banned_present = set(X.columns).intersection(BANNED_INPUTS)
    if banned_present:
        raise ValueError(f"Leakage or excluded columns entered the feature matrix: {sorted(banned_present)}")
    if len(X.columns) != 33 or len(set(X.columns)) != 33:
        raise ValueError(f"Expected 33 unique predictors, found {len(X.columns)}.")

    panel_count = frame[PANEL_COLUMNS].notna().sum(axis=1)
    in_panel = (panel_count >= 5).astype("int8")
    strata = y.astype(str) + "_" + in_panel.astype(str)
    fib4 = frame[FIB4_COLUMNS[0]] * frame[FIB4_COLUMNS[1]] / (
        frame[FIB4_COLUMNS[2]] * np.sqrt(frame[FIB4_COLUMNS[3]])
    )
    fib4 = fib4.replace([np.inf, -np.inf], np.nan).rename("fib4")

    return {
        "frame": frame,
        "X": X,
        "y": y,
        "strata": strata,
        "in_panel": in_panel,
        "fib4": fib4,
    }
