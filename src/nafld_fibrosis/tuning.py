"""Compact Random Forest search confined to the development partition."""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import RandomizedSearchCV, RepeatedStratifiedKFold
from sklearn.pipeline import Pipeline

from .config import CV_FOLDS, CV_REPEATS, SEED
from .features import build_preprocessor


def tune_random_forest(X_train, y_train, strata_train):
    pipeline = Pipeline([
        ("preprocess", build_preprocessor()),
        ("model", RandomForestClassifier(random_state=SEED, n_jobs=-1)),
    ])
    param_distributions = {
        "model__n_estimators": [300, 500],
        "model__max_features": ["sqrt", 0.7],
        "model__min_samples_leaf": [5, 10, 15],
        "model__max_depth": [None, 4, 6],
        "model__class_weight": ["balanced", None],
    }
    splitter = RepeatedStratifiedKFold(
        n_splits=CV_FOLDS, n_repeats=CV_REPEATS, random_state=SEED,
    )
    splits = list(splitter.split(X_train, strata_train))
    search = RandomizedSearchCV(
        estimator=pipeline,
        param_distributions=param_distributions,
        n_iter=8,
        scoring="roc_auc",
        cv=splits,
        refit=True,
        random_state=SEED,
        n_jobs=1,
        return_train_score=True,
        error_score="raise",
    )
    search.fit(X_train, y_train)
    candidates = pd.DataFrame(search.cv_results_).sort_values("rank_test_score")
    return search, candidates


def paired_auc_bootstrap(y_true, first, second, n_boot=2000, seed=SEED):
    """Percentile CI for paired AUC difference using development OOF scores."""
    from sklearn.metrics import roc_auc_score

    y_true = np.asarray(y_true, dtype=int)
    first = np.asarray(first, dtype=float)
    second = np.asarray(second, dtype=float)
    valid = np.isfinite(first) & np.isfinite(second)
    y_true, first, second = y_true[valid], first[valid], second[valid]
    rng = np.random.default_rng(seed)
    diffs = []
    for _ in range(n_boot):
        sample = rng.integers(0, len(y_true), len(y_true))
        if np.unique(y_true[sample]).size == 2:
            diffs.append(
                roc_auc_score(y_true[sample], first[sample])
                - roc_auc_score(y_true[sample], second[sample])
            )
    return [float(x) for x in np.percentile(diffs, [2.5, 97.5])]
