"""Core baseline estimators."""
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from .config import SEED
from .features import build_preprocessor


def baseline_models():
    return {
        "LogisticRegression": Pipeline([
            ("preprocess", build_preprocessor()),
            ("model", LogisticRegression(max_iter=3000, class_weight="balanced", random_state=SEED)),
        ]),
        "RandomForest": Pipeline([
            ("preprocess", build_preprocessor()),
            ("model", RandomForestClassifier(
                n_estimators=500,
                min_samples_leaf=5,
                class_weight="balanced",
                random_state=SEED,
                n_jobs=-1,
            )),
        ]),
    }
