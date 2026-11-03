"""Phase 3 analysis using nested repeated out-of-fold RF predictions."""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.metrics import (
    average_precision_score, balanced_accuracy_score, confusion_matrix,
    precision_score, recall_score, roc_auc_score, roc_curve,
)
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

OUT = ROOT / "outputs" / "phase3-v1"
PARAMS = {
    "model__n_estimators": [300, 500],
    "model__max_features": ["sqrt", 0.7],
    "model__min_samples_leaf": [5, 10, 15],
    "model__max_depth": [None, 4, 6],
    "model__class_weight": ["balanced", None],
}
TARGET_SENSITIVITY = 0.80


def choose_threshold(y_true, scores, target_sensitivity=TARGET_SENSITIVITY):
    fpr, tpr, thresholds = roc_curve(y_true, scores)
    eligible = np.flatnonzero(tpr >= target_sensitivity)
    if not len(eligible):
        raise ValueError("No threshold reaches the target sensitivity.")
    i = int(eligible[0])  # largest threshold that reaches the target sensitivity
    return float(thresholds[i]), float(tpr[i]), float(1 - fpr[i])


def operating_metrics(y_true, scores, threshold):
    predicted = (np.asarray(scores) >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, predicted, labels=[0, 1]).ravel()
    return {
        "n": int(len(y_true)), "positives": int(np.sum(y_true)),
        "prevalence": float(np.mean(y_true)), "threshold": float(threshold),
        "sensitivity": float(tp / (tp + fn)) if tp + fn else None,
        "specificity": float(tn / (tn + fp)) if tn + fp else None,
        "ppv": float(precision_score(y_true, predicted, zero_division=0)),
        "npv": float(tn / (tn + fn)) if tn + fn else None,
        "balanced_accuracy": float(balanced_accuracy_score(y_true, predicted)),
        "confusion_matrix": [[int(tn), int(fp)], [int(fn), int(tp)]],
    }


def auc_bootstrap_ci(y, scores, n_boot=1000, seed=SEED):
    y, scores = np.asarray(y, dtype=int), np.asarray(scores, dtype=float)
    rng = np.random.default_rng(seed)
    values = []
    for _ in range(n_boot):
        idx = rng.integers(0, len(y), len(y))
        if np.unique(y[idx]).size == 2:
            values.append(roc_auc_score(y[idx], scores[idx]))
    return [float(v) for v in np.percentile(values, [2.5, 97.5])]


def main():
    data = load_dataset(DATA_PATH)
    X, y, strata = data["X"], data["y"], data["strata"]
    X_train, _, y_train, _, strata_train, _ = train_test_split(
        X, y, strata, test_size=TEST_SIZE, stratify=strata, random_state=SEED,
    )
    frame = data["frame"].loc[X_train.index]
    panel = data["in_panel"].loc[X_train.index]
    model = Pipeline([
        ("preprocess", build_preprocessor()),
        ("model", RandomForestClassifier(random_state=SEED, n_jobs=-1)),
    ])
    outer = RepeatedStratifiedKFold(n_splits=CV_FOLDS, n_repeats=CV_REPEATS, random_state=SEED)
    outer_splits = list(outer.split(X_train, strata_train))
    score_sum = np.zeros(len(X_train), dtype=float)
    score_count = np.zeros(len(X_train), dtype=int)
    importances = []
    for fold_number, (train_idx, valid_idx) in enumerate(outer_splits, start=1):
        X_outer, y_outer = X_train.iloc[train_idx], y_train.iloc[train_idx]
        strata_outer = strata_train.iloc[train_idx]
        inner = StratifiedKFold(n_splits=3, shuffle=True, random_state=SEED)
        inner_splits = list(inner.split(X_outer, strata_outer))
        search = RandomizedSearchCV(
            model, PARAMS, n_iter=8, scoring="roc_auc", cv=inner_splits,
            refit=True, random_state=SEED, n_jobs=1, error_score="raise",
        )
        search.fit(X_outer, y_outer)
        X_valid = X_train.iloc[valid_idx]
        probabilities = search.best_estimator_.predict_proba(X_valid)[:, 1]
        score_sum[valid_idx] += probabilities
        score_count[valid_idx] += 1
        importance = permutation_importance(
            search.best_estimator_, X_valid, y_train.iloc[valid_idx],
            scoring="roc_auc", n_repeats=5, random_state=SEED + fold_number,
            n_jobs=1,
        )
        importances.append(importance.importances_mean)
        print(f"Completed outer fold {fold_number}/{len(outer_splits)}", flush=True)

    scores = score_sum / score_count
    y_array = y_train.to_numpy()
    fib4 = data["fib4"].loc[X_train.index].to_numpy(dtype=float)
    valid = np.isfinite(scores) & np.isfinite(fib4)
    y_valid, score_valid, fib4_valid = y_array[valid], scores[valid], fib4[valid]
    threshold, selected_sensitivity, selected_specificity = choose_threshold(y_valid, score_valid)
    rf_auc = float(roc_auc_score(y_valid, score_valid))
    fib4_auc = float(roc_auc_score(y_valid, fib4_valid))
    subgroup_specs = {
        "gender": [("Female", frame["Gender (Female=1, Male=2)"].eq(1)), ("Male", frame["Gender (Female=1, Male=2)"].eq(2))],
        "diabetes": [("No", frame["Diyabetes Mellitus (No=0, Yes=1)"].eq(0)), ("Yes", frame["Diyabetes Mellitus (No=0, Yes=1)"].eq(1))],
        "age_band": [("<50", frame["Age"].lt(50)), ("50-59", frame["Age"].between(50, 59)), ("60+", frame["Age"].ge(60))],
        "extended_panel": [("No", panel.eq(0)), ("Yes", panel.eq(1))],
    }
    subgroup_results = {}
    for group_name, levels in subgroup_specs.items():
        subgroup_results[group_name] = {}
        for level, source_mask in levels:
            mask = np.asarray(source_mask)[valid]
            gy, gs = y_valid[mask], score_valid[mask]
            item = {
                "n": int(mask.sum()),
                "positives": int(gy.sum()),
                "prevalence": float(gy.mean()) if len(gy) else None,
            }
            if len(np.unique(gy)) == 2:
                item["roc_auc"] = float(roc_auc_score(gy, gs))
                item["roc_auc_95ci"] = auc_bootstrap_ci(gy, gs, seed=SEED + len(gy))
                item.update(operating_metrics(gy, gs, threshold))
            else:
                item.update({"roc_auc": None, "roc_auc_95ci": None, "metrics_note": "Insufficient class variation."})
            subgroup_results[group_name][level] = item

    importance_array = np.asarray(importances)
    importance_summary = [
        {"feature": name, "mean_importance": float(importance_array[:, i].mean()),
         "fold_sd": float(importance_array[:, i].std(ddof=1))}
        for i, name in enumerate(X.columns)
    ]
    importance_summary.sort(key=lambda item: item["mean_importance"], reverse=True)
    result = {
        "scope": "development only; the previously viewed holdout is not used",
        "protocol": {
            "seed": SEED, "outer_folds": CV_FOLDS, "outer_repeats": CV_REPEATS,
            "inner_folds": 3, "threshold_target_sensitivity": TARGET_SENSITIVITY,
            "subgroup_metrics": "descriptive development OOF estimates; small groups are inconclusive",
        },
        "n_development": int(len(X_train)),
        "oof_scores_per_patient": {"min": int(score_count.min()), "max": int(score_count.max())},
        "nested_oof": {
            "random_forest_roc_auc": rf_auc,
            "random_forest_pr_auc": float(average_precision_score(y_valid, score_valid)),
            "fib4_roc_auc": fib4_auc,
            "fib4_pr_auc": float(average_precision_score(y_valid, fib4_valid)),
            "auc_difference_rf_minus_fib4": rf_auc - fib4_auc,
            "paired_auc_difference_95ci": paired_auc_bootstrap(y_valid, score_valid, fib4_valid, seed=SEED),
        },
        "threshold_selection": {
            "threshold": threshold,
            "oof_sensitivity": selected_sensitivity,
            "oof_specificity": selected_specificity,
            "operating_metrics": operating_metrics(y_valid, score_valid, threshold),
            "interpretation": "Selected and measured on the same nested development OOF predictions; descriptive only, not an unbiased final operating-point estimate.",
        },
        "subgroups": subgroup_results,
        "permutation_importance": importance_summary,
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "phase3_analysis.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    pd.DataFrame(importance_summary).to_csv(OUT / "permutation_importance.csv", index=False)
    report = [
        "# Phase 3: threshold, explanation, and subgroup review",
        "",
        "> Research only; not a diagnostic tool.",
        "",
        "All results below use nested repeated development OOF predictions. The previously viewed holdout is not reused.",
        "",
        "## Sensitivity-oriented threshold",
        "",
        f"The proposed 0.80 sensitivity target selected a probability threshold of {threshold:.4f}. The same OOF predictions gave sensitivity {selected_sensitivity:.3f} and specificity {selected_specificity:.3f}. Because threshold selection and metric calculation use the same OOF predictions, these operating metrics are descriptive and not an unbiased final estimate.",
        "",
        "## Model-agnostic feature importance",
        "",
        "Permutation importance was computed only on outer validation folds. It is descriptive, sensitive to correlated predictors, and not causal.",
        "",
        "| Feature | Mean ROC-AUC decrease | Fold SD |",
        "|---|---:|---:|",
    ]
    for item in importance_summary[:15]:
        report.append(f"| {item['feature']} | {item['mean_importance']:.4f} | {item['fold_sd']:.4f} |")
    report += ["", "## Subgroup summaries", "", "AUC intervals are bootstrap intervals over patients. The fixed development-selected threshold is shown for descriptive sensitivity/specificity only. Small subgroups are inconclusive.", "", "| Group | Level | N | Positives | Prevalence | ROC-AUC (95% CI) | Sensitivity | Specificity |", "|---|---|---:|---:|---:|---|---:|---:|"]
    for group_name, levels in subgroup_results.items():
        for level, item in levels.items():
            auc_text = "NA" if item.get("roc_auc") is None else f"{item['roc_auc']:.3f} ({item['roc_auc_95ci'][0]:.3f}, {item['roc_auc_95ci'][1]:.3f})"
            sens = "NA" if item.get("sensitivity") is None else f"{item['sensitivity']:.3f}"
            spec = "NA" if item.get("specificity") is None else f"{item['specificity']:.3f}"
            prev = "NA" if item.get("prevalence") is None else f"{item['prevalence']:.3f}"
            report.append(f"| {group_name} | {level} | {item['n']} | {item['positives']} | {prev} | {auc_text} | {sens} | {spec} |")
    report += ["", "## Evaluation caveat", "", "The baseline holdout was exposed before model tuning. No independent holdout estimate is claimed in this report. The nested OOF results are internal development evidence; external validation remains necessary for any stronger generalization claim.", ""]
    (OUT / "phase3_report.md").write_text("\n".join(report), encoding="utf-8")
    print(json.dumps({"threshold_selection": result["threshold_selection"], "nested_oof": result["nested_oof"], "top_importance": importance_summary[:10]}, indent=2))
    print(f"Artifacts written to {OUT}")


if __name__ == "__main__":
    main()
