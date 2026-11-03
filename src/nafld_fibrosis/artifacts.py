"""Artifact serialization and report rendering."""
import json
from pathlib import Path

import joblib


def write_json(path, value):
    Path(path).write_text(json.dumps(value, indent=2, allow_nan=False), encoding="utf-8")


def save_pipeline(path, fitted_pipeline):
    joblib.dump(fitted_pipeline, path)


def write_report(path, results):
    lines = [
        "# Baseline model report",
        "",
        "> Research only; not a diagnostic tool. Do not use these results to guide care.",
        "",
        "## Protocol",
        "",
        f"- Primary target: significant fibrosis F>=2; development CV: {results['protocol']['cv_folds']}-fold x {results['protocol']['cv_repeats']} repeats.",
        f"- Holdout: stratified {results['protocol']['train_fraction']:.0%}/{results['protocol']['test_fraction']:.0%}; seed {results['protocol']['seed']}.",
        "- Split stratification preserves both target and extended-panel mix; the panel indicator is not a predictor.",
        "- Model operating point: default probability threshold 0.50 (threshold selection is deferred to a later phase).",
        "",
        "## Development cross-validation",
        "",
        "| Model | ROC-AUC mean +/- SD | PR-AUC mean +/- SD | Balanced accuracy mean +/- SD | Train ROC-AUC mean |",
        "|---|---:|---:|---:|---:|",
    ]
    for name, metrics in results["cross_validation"].items():
        lines.append(
            f"| {name} | {metrics['roc_auc']['mean']:.3f} +/- {metrics['roc_auc']['std']:.3f} | "
            f"{metrics['pr_auc']['mean']:.3f} +/- {metrics['pr_auc']['std']:.3f} | "
            f"{metrics['balanced_accuracy']['mean']:.3f} +/- {metrics['balanced_accuracy']['std']:.3f} | "
            f"{metrics['train_roc_auc']['mean']:.3f} |"
        )
    lines.extend([
        "",
        "## One-time holdout evaluation",
        "",
        "| Method | N | Positives | ROC-AUC | PR-AUC | Sensitivity | Specificity | PPV | NPV |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
    ])
    for name, metrics in results["holdout"].items():
        lines.append(
            f"| {name} | {metrics['n']} | {metrics['positives']} | {metrics['roc_auc']:.3f} | "
            f"{metrics['pr_auc']:.3f} | {metrics['sensitivity']:.3f} | {metrics['specificity']:.3f} | "
            f"{metrics['ppv']:.3f} | {metrics['npv']:.3f} |"
        )
    lines.extend([
        "",
        "## Interpretation limits",
        "",
        "This is a single small retrospective cohort. The holdout results are exploratory and have no external validation. "
        "The default 0.50 threshold is a baseline reference; sensitivity-oriented threshold selection is deferred. "
        "No clinical use is intended.",
        "",
    ])
    Path(path).write_text("\n".join(lines), encoding="utf-8")
