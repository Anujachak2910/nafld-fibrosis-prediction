"""Optional development-only F>=3 and three-class stretch experiments."""
import json
import sys
from pathlib import Path

import numpy as np
from sklearn.metrics import average_precision_score, roc_auc_score
from sklearn.model_selection import RepeatedStratifiedKFold, train_test_split, cross_validate

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
OUT = ROOT / "outputs" / "stretch-v1"

from nafld_fibrosis.config import CV_FOLDS, CV_REPEATS, DATA_PATH, SEED, TEST_SIZE
from nafld_fibrosis.data import load_dataset
from nafld_fibrosis.models import baseline_models


def summarize_scores(cv_result, scoring):
    summary = {}
    for metric in scoring:
        values = cv_result[f"test_{metric}"]
        summary[metric] = {"mean": float(np.mean(values)), "std": float(np.std(values, ddof=1))}
    return summary


def main():
    data = load_dataset(DATA_PATH)
    X, y_primary, strata_primary = data["X"], data["y"], data["strata"]
    X_dev, _, _, _, _, _ = train_test_split(
        X, y_primary, strata_primary, test_size=TEST_SIZE,
        stratify=strata_primary, random_state=SEED,
    )
    frame = data["frame"].loc[X_dev.index]
    panel = data["in_panel"].loc[X_dev.index]
    fibrosis = frame["Fibrosis"].astype(int)
    targets = {
        "advanced_fibrosis_F_ge_3": (fibrosis >= 3).astype(int),
        "fibrosis_group_F0_1_F2_F3_4": np.select(
            [fibrosis <= 1, fibrosis == 2], [0, 1], default=2,
        ).astype(int),
    }
    models = baseline_models()
    results = {
        "scope": "optional stretch analyses; development partition only; previous holdout not used",
        "protocol": {"seed": SEED, "folds": CV_FOLDS, "repeats": CV_REPEATS, "n_development": int(len(X_dev))},
        "targets": {},
    }
    for name, target in targets.items():
        target = np.asarray(target)
        strat = target.astype(str) + "_" + panel.astype(str).to_numpy()
        splitter = RepeatedStratifiedKFold(
            n_splits=CV_FOLDS, n_repeats=CV_REPEATS, random_state=SEED,
        )
        splits = list(splitter.split(X_dev, strat))
        is_multiclass = len(np.unique(target)) > 2
        scoring = (
            {"balanced_accuracy": "balanced_accuracy", "f1_macro": "f1_macro", "roc_auc_ovr": "roc_auc_ovr"}
            if is_multiclass else
            {"roc_auc": "roc_auc", "pr_auc": "average_precision", "balanced_accuracy": "balanced_accuracy"}
        )
        model_results = {}
        for model_name, estimator in models.items():
            cv_result = cross_validate(
                estimator, X_dev, target, cv=splits, scoring=scoring,
                return_train_score=True, n_jobs=1, error_score="raise",
            )
            model_results[model_name] = summarize_scores(cv_result, list(scoring))
        target_result = {
            "class_counts": {str(k): int(v) for k, v in zip(*np.unique(target, return_counts=True))},
            "models": model_results,
        }
        if not is_multiclass:
            fib4 = data["fib4"].loc[X_dev.index].to_numpy(dtype=float)
            valid = np.isfinite(fib4)
            target_result["fib4_comparator"] = {
                "n": int(valid.sum()),
                "roc_auc": float(roc_auc_score(target[valid], fib4[valid])),
                "pr_auc": float(average_precision_score(target[valid], fib4[valid])),
            }
        else:
            target_result["reference"] = "FIB-4 is not a three-class classifier; majority-class balanced accuracy is 1/3."
        results["targets"][name] = target_result

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "stretch_metrics.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    report = [
        "# Optional stretch experiments",
        "",
        "> Research only; not a diagnostic tool. These analyses use the development partition only; the previously viewed holdout is not used.",
        "",
        f"Repeated stratified {CV_FOLDS}-fold CV x {CV_REPEATS} repeats; seed {SEED}.",
        "",
    ]
    for target_name, target_result in results["targets"].items():
        report.extend([f"## {target_name}", "", f"Class counts: `{target_result['class_counts']}`", ""])
        if "fib4_comparator" in target_result:
            fib = target_result["fib4_comparator"]
            report.append(f"FIB-4 comparator on the same development patients (n={fib['n']}): ROC-AUC {fib['roc_auc']:.3f}; PR-AUC {fib['pr_auc']:.3f}.")
            report.append("")
        for model_name, model_metrics in target_result["models"].items():
            report.append(f"### {model_name}")
            report.append("")
            for metric, value in model_metrics.items():
                report.append(f"- {metric}: {value['mean']:.3f} +/- {value['std']:.3f}")
            report.append("")
    report += ["These are optional exploratory analyses on one small cohort. They are not independent validation results; the 3-class results should be interpreted using class counts and macro/balanced metrics.", ""]
    (OUT / "stretch_report.md").write_text("\n".join(report), encoding="utf-8")
    print(json.dumps(results, indent=2))
    print(f"Artifacts written to {OUT}")


if __name__ == "__main__":
    main()
