"""Phase 2: tune RF on development CV and compare development OOF scores."""
import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.model_selection import StratifiedKFold, cross_val_predict, train_test_split

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from nafld_fibrosis.config import CV_FOLDS, CV_REPEATS, DATA_PATH, OUTPUT_PATH, SEED, TEST_SIZE
from nafld_fibrosis.data import load_dataset
from nafld_fibrosis.models import baseline_models
from nafld_fibrosis.tuning import paired_auc_bootstrap, tune_random_forest

OUT = ROOT / "outputs" / "phase2-v1"


def main():
    data = load_dataset(DATA_PATH)
    X, y, strata = data["X"], data["y"], data["strata"]
    X_train, _, y_train, _, strata_train, _ = train_test_split(
        X, y, strata, test_size=TEST_SIZE, stratify=strata, random_state=SEED,
    )

    OUT.mkdir(parents=True, exist_ok=True)
    search, candidates = tune_random_forest(X_train, y_train, strata_train)
    candidates[["rank_test_score", "mean_test_score", "std_test_score", "mean_train_score", "params"]].to_csv(
        OUT / "tuning_candidates.csv", index=False,
    )

    models = baseline_models()
    models["TunedRandomForest"] = search.best_estimator_
    oof_splitter = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=SEED)
    oof_splits = list(oof_splitter.split(X_train, strata_train))
    comparison = {}
    fib4 = data["fib4"].loc[X_train.index].to_numpy(dtype=float)
    for name, estimator in models.items():
        scores = cross_val_predict(
            clone(estimator), X_train, y_train,
            cv=oof_splits, method="predict_proba", n_jobs=1,
        )[:, 1]
        valid = np.isfinite(scores) & np.isfinite(fib4)
        from sklearn.metrics import average_precision_score, roc_auc_score
        comparison[name] = {
            "oof_roc_auc": float(roc_auc_score(y_train.to_numpy()[valid], scores[valid])),
            "oof_pr_auc": float(average_precision_score(y_train.to_numpy()[valid], scores[valid])),
            "oof_auc_difference_vs_fib4": float(
                roc_auc_score(y_train.to_numpy()[valid], scores[valid])
                - roc_auc_score(y_train.to_numpy()[valid], fib4[valid])
            ),
            "paired_auc_difference_95ci": paired_auc_bootstrap(
                y_train.to_numpy()[valid], scores[valid], fib4[valid], seed=SEED,
            ),
            "n_compared": int(valid.sum()),
        }
    from sklearn.metrics import average_precision_score, roc_auc_score
    valid_fib4 = np.isfinite(fib4)
    comparison["FIB4"] = {
        "oof_roc_auc": float(roc_auc_score(y_train.to_numpy()[valid_fib4], fib4[valid_fib4])),
        "oof_pr_auc": float(average_precision_score(y_train.to_numpy()[valid_fib4], fib4[valid_fib4])),
        "n_compared": int(valid_fib4.sum()),
    }

    result = {
        "scope": "development data only; the previously viewed holdout is not used",
        "protocol": {"seed": SEED, "folds": CV_FOLDS, "repeats": CV_REPEATS, "oof_folds": CV_FOLDS},
        "n_development": int(len(X_train)),
        "development_positives": int(y_train.sum()),
        "search": {
            "candidates": int(len(candidates)),
            "best_params": search.best_params_,
            "best_mean_cv_roc_auc": float(search.best_score_),
            "best_cv_std": float(candidates.loc[candidates["rank_test_score"] == 1, "std_test_score"].iloc[0]),
        },
        "development_oof_comparison": comparison,
        "note": "The original baseline holdout was exposed before tuning and is exploratory only; do not report it as a final estimate.",
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "tuning_summary.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    joblib.dump(search.best_estimator_, OUT / "tuned_random_forest_pipeline.joblib")
    report = [
        "# Phase 2: development-only model tuning",
        "",
        "> Research only; not a diagnostic tool.",
        "",
        "The previously viewed baseline holdout is excluded from tuning and from final claims. The results below use only development data.",
        "",
        f"- Randomized search: {len(candidates)} RF configurations; {CV_FOLDS}-fold CV repeated {CV_REPEATS} times; seed {SEED}.",
        f"- Best CV ROC-AUC: {search.best_score_:.3f} +/- {result['search']['best_cv_std']:.3f}.",
        f"- Best parameters: `{search.best_params_}`.",
        "- OOF comparisons use one 5-fold split on development data; FIB-4 differences use paired bootstrap intervals.",
        "- Threshold selection remains for Phase 3.",
        "",
        "| Model | OOF ROC-AUC | OOF PR-AUC | AUC difference vs FIB-4 (95% paired bootstrap CI) |",
        "|---|---:|---:|---:|",
    ]
    for name in ["LogisticRegression", "RandomForest", "TunedRandomForest"]:
        item = comparison[name]
        lo, hi = item["paired_auc_difference_95ci"]
        report.append(
            f"| {name} | {item['oof_roc_auc']:.3f} | {item['oof_pr_auc']:.3f} | "
            f"{item['oof_auc_difference_vs_fib4']:+.3f} [{lo:+.3f}, {hi:+.3f}] |"
        )
    item = comparison["FIB4"]
    report.append(f"| FIB-4 | {item['oof_roc_auc']:.3f} | {item['oof_pr_auc']:.3f} | reference |")
    report += [
        "",
        "This is model development evidence from one small cohort, not an independent validation estimate. The paired interval is descriptive and should not be treated as proof of clinical utility.",
        "",
    ]
    (OUT / "phase2_report.md").write_text("\n".join(report), encoding="utf-8")
    print(json.dumps(result, indent=2))
    print(f"Artifacts written to {OUT}")


if __name__ == "__main__":
    main()


