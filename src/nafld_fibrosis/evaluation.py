"""Cross-validation summaries and final holdout metrics."""
import numpy as np
from sklearn.metrics import (
    accuracy_score, average_precision_score, balanced_accuracy_score,
    confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score,
)
from sklearn.model_selection import RepeatedStratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline

from .config import CV_FOLDS, CV_REPEATS, SEED
from .features import build_preprocessor

SCORING = {"roc_auc": "roc_auc", "pr_auc": "average_precision", "balanced_accuracy": "balanced_accuracy"}


def cross_validation_summary(estimator, X, y, strata):
    splitter = RepeatedStratifiedKFold(n_splits=CV_FOLDS, n_repeats=CV_REPEATS, random_state=SEED)
    splits = list(splitter.split(X, strata))
    result = cross_validate(
        estimator, X, y, cv=splits, scoring=SCORING,
        return_train_score=True, n_jobs=1, error_score="raise",
    )
    summary = {}
    for key in SCORING:
        values = result[f"test_{key}"]
        summary[key] = {"mean": float(np.mean(values)), "std": float(np.std(values, ddof=1))}
    summary["train_roc_auc"] = {
        "mean": float(np.mean(result["train_roc_auc"])),
        "std": float(np.std(result["train_roc_auc"], ddof=1)),
    }
    summary["folds"] = CV_FOLDS
    summary["repeats"] = CV_REPEATS
    return summary


def binary_metrics(y_true, scores, threshold=0.5):
    y_true = np.asarray(y_true, dtype=int)
    scores = np.asarray(scores, dtype=float)
    valid = np.isfinite(scores)
    y_true, scores = y_true[valid], scores[valid]
    predicted = (scores >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, predicted, labels=[0, 1]).ravel()
    return {
        "n": int(len(y_true)),
        "positives": int(y_true.sum()),
        "prevalence": float(y_true.mean()),
        "threshold": float(threshold),
        "roc_auc": float(roc_auc_score(y_true, scores)),
        "pr_auc": float(average_precision_score(y_true, scores)),
        "sensitivity": float(recall_score(y_true, predicted, zero_division=0)),
        "specificity": float(tn / (tn + fp)) if tn + fp else float("nan"),
        "ppv": float(precision_score(y_true, predicted, zero_division=0)),
        "npv": float(tn / (tn + fn)) if tn + fn else float("nan"),
        "balanced_accuracy": float(balanced_accuracy_score(y_true, predicted)),
        "accuracy": float(accuracy_score(y_true, predicted)),
        "f1": float(f1_score(y_true, predicted, zero_division=0)),
        "confusion_matrix": [[int(tn), int(fp)], [int(fn), int(tp)]],
    }


def fit_and_evaluate_holdout(estimator, X_train, y_train, X_test, y_test):
    fitted = estimator.fit(X_train, y_train)
    probabilities = fitted.predict_proba(X_test)[:, 1]
    return fitted, binary_metrics(y_test, probabilities, threshold=0.5)
