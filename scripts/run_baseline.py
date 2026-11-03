"""Run the Phase 1 Random Forest and logistic-regression baseline."""
import hashlib
import json
import sys
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from sklearn.model_selection import train_test_split

from nafld_fibrosis.artifacts import save_pipeline, write_json, write_report
from nafld_fibrosis.config import CV_FOLDS, CV_REPEATS, DATA_PATH, OUTPUT_PATH, SEED, TEST_SIZE
from nafld_fibrosis.data import load_dataset
from nafld_fibrosis.evaluation import binary_metrics, cross_validation_summary, fit_and_evaluate_holdout
from nafld_fibrosis.models import baseline_models


def package_versions():
    names = ["numpy", "pandas", "scipy", "scikit-learn", "openpyxl", "matplotlib", "seaborn"]
    versions = {}
    for name in names:
        try:
            versions[name] = version(name)
        except PackageNotFoundError:
            versions[name] = "not installed"
    return versions


def sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    data = load_dataset(DATA_PATH)
    X, y, strata = data["X"], data["y"], data["strata"]
    X_train, X_test, y_train, y_test, strata_train, _ = train_test_split(
        X, y, strata, test_size=TEST_SIZE, stratify=strata, random_state=SEED,
    )

    crossval = {}
    holdout = {}
    fitted = {}
    for name, estimator in baseline_models().items():
        crossval[name] = cross_validation_summary(estimator, X_train, y_train, strata_train)
        fitted[name], holdout[name] = fit_and_evaluate_holdout(
            estimator, X_train, y_train, X_test, y_test,
        )

    test_fib4 = data["fib4"].loc[X_test.index]
    holdout["FIB-4 (1.3 cutoff)"] = binary_metrics(
        y_test, test_fib4, threshold=1.3,
    )
    results = {
        "protocol": {
            "seed": SEED,
            "test_fraction": TEST_SIZE,
            "train_fraction": 1 - TEST_SIZE,
            "cv_folds": CV_FOLDS,
            "cv_repeats": CV_REPEATS,
            "threshold": 0.5,
            "stratification": "target plus extended-panel indicator; indicator excluded from model features",
        },
        "dataset": {
            "file": "data/NAFLD.xlsx",
            "sha256": sha256(DATA_PATH),
            "n_rows": int(len(X)),
            "n_features": int(X.shape[1]),
            "positive_count": int(y.sum()),
            "positive_prevalence": float(y.mean()),
        },
        "package_versions": package_versions(),
        "cross_validation": crossval,
        "holdout": holdout,
    }
    OUTPUT_PATH.mkdir(parents=True, exist_ok=True)
    write_json(OUTPUT_PATH / "metrics.json", results)
    write_json(OUTPUT_PATH / "run_manifest.json", {
        "protocol": results["protocol"],
        "dataset": results["dataset"],
        "package_versions": results["package_versions"],
        "artifacts": ["metrics.json", "run_manifest.json", "baseline_report.md", "random_forest_pipeline.joblib"],
    })
    save_pipeline(OUTPUT_PATH / "random_forest_pipeline.joblib", fitted["RandomForest"])
    write_report(OUTPUT_PATH / "baseline_report.md", results)
    print(json.dumps({"cross_validation": crossval, "holdout": holdout}, indent=2))
    print(f"Artifacts written to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
