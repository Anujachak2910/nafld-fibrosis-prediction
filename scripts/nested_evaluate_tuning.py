"""Nested repeated OOF evaluation for the tuned RF workflow."""
import json
import sys
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score, roc_auc_score
from sklearn.model_selection import (
    RandomizedSearchCV, RepeatedStratifiedKFold, StratifiedKFold, train_test_split,
)
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from nafld_fibrosis.config import CV_FOLDS, CV_REPEATS, DATA_PATH, SEED, TEST_SIZE
from nafld_fibrosis.data import load_dataset
from nafld_fibrosis.features import build_preprocessor
from nafld_fibrosis.tuning import paired_auc_bootstrap

OUT = ROOT / "outputs" / "phase2-v1"
PARAMS = {
    "model__n_estimators": [300, 500],
    "model__max_features": ["sqrt", 0.7],
    "model__min_samples_leaf": [5, 10, 15],
    "model__max_depth": [None, 4, 6],
    "model__class_weight": ["balanced", None],
}


def main():
    data = load_dataset(DATA_PATH)
    X, y, strata = data["X"], data["y"], data["strata"]
    X_train, _, y_train, _, strata_train, _ = train_test_split(
        X, y, strata, test_size=TEST_SIZE, stratify=strata, random_state=SEED,
    )
    model = Pipeline([
        ("preprocess", build_preprocessor()),
        ("model", RandomForestClassifier(random_state=SEED, n_jobs=-1)),
    ])
    outer = RepeatedStratifiedKFold(n_splits=CV_FOLDS, n_repeats=CV_REPEATS, random_state=SEED)
    outer_splits = list(outer.split(X_train, strata_train))
    score_sum = np.zeros(len(X_train), dtype=float)
    score_count = np.zeros(len(X_train), dtype=int)

    for fold_number, (train_idx, valid_idx) in enumerate(outer_splits, start=1):
        X_outer, y_outer = X_train.iloc[train_idx], y_train.iloc[train_idx]
        strata_outer = strata_train.iloc[train_idx]
        inner = StratifiedKFold(n_splits=3, shuffle=True, random_state=SEED)
        inner_splits = list(inner.split(X_outer, strata_outer))
        search = RandomizedSearchCV(
            model,
            PARAMS,
            n_iter=8,
            scoring="roc_auc",
            cv=inner_splits,
            refit=True,
            random_state=SEED,
            n_jobs=1,
            error_score="raise",
        )
        search.fit(X_outer, y_outer)
        score_sum[valid_idx] += search.best_estimator_.predict_proba(X_train.iloc[valid_idx])[:, 1]
        score_count[valid_idx] += 1
        print(f"Completed outer fold {fold_number}/{len(outer_splits)}", flush=True)

    nested_scores = score_sum / score_count
    y_array = y_train.to_numpy()
    fib4 = data["fib4"].loc[X_train.index].to_numpy(dtype=float)
    valid = np.isfinite(nested_scores) & np.isfinite(fib4)
    auc = float(roc_auc_score(y_array[valid], nested_scores[valid]))
    fib4_auc = float(roc_auc_score(y_array[valid], fib4[valid]))
    result = {
        "method": "nested repeated CV; outer 5-fold x 3 repeats, inner 3-fold search over 8 RF configurations",
        "n_development": int(len(X_train)),
        "n_compared": int(valid.sum()),
        "outer_prediction_count_min": int(score_count.min()),
        "outer_prediction_count_max": int(score_count.max()),
        "tuned_rf_oof_roc_auc": auc,
        "tuned_rf_oof_pr_auc": float(average_precision_score(y_array[valid], nested_scores[valid])),
        "fib4_development_roc_auc": fib4_auc,
        "fib4_development_pr_auc": float(average_precision_score(y_array[valid], fib4[valid])),
        "auc_difference_vs_fib4": auc - fib4_auc,
        "paired_auc_difference_95ci": paired_auc_bootstrap(
            y_array[valid], nested_scores[valid], fib4[valid], seed=SEED,
        ),
        "threshold": None,
        "threshold_note": "Threshold selection remains in Phase 3 and must use these nested out-of-fold probabilities.",
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "nested_oof_comparison.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    report_path = OUT / "phase2_report.md"
    text = report_path.read_text(encoding="utf-8")
    text = text.replace(
        "| TunedRandomForest |",
        "| TunedRandomForest (non-nested; selection-biased, exclude from inference) |",
    )
    lo, hi = result["paired_auc_difference_95ci"]
    nested = [
        "",
        "## Nested repeated out-of-fold estimate for the tuning workflow",
        "",
        "The tuned RF estimate uses nested repeated cross-validation: outer 5-fold CV repeated 3 times; inside each outer training partition, an 8-configuration RF search uses 3-fold CV. Each patient receives three outer-fold predictions, averaged before scoring. The previously viewed holdout is not used.",
        "",
        f"- Tuned RF nested OOF ROC-AUC: {auc:.3f}; PR-AUC: {result['tuned_rf_oof_pr_auc']:.3f}.",
        f"- Development FIB-4 ROC-AUC on the same patients: {fib4_auc:.3f}; PR-AUC: {result['fib4_development_pr_auc']:.3f}.",
        f"- Paired ROC-AUC difference (RF - FIB-4): {auc - fib4_auc:+.3f} (95% paired bootstrap interval [{lo:+.3f}, {hi:+.3f}]).",
        "- The earlier non-nested tuned OOF line is retained only for traceability and is explicitly excluded from inference.",
        "",
    ]
    report_path.write_text(text + "\n".join(nested), encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
