"""Package the tuned development model and final research report."""
import hashlib
import json
import sys
from importlib.metadata import version
from pathlib import Path

import joblib

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
OUT = ROOT / "outputs" / "final"
BASE = ROOT / "outputs" / "baseline-v1"
PHASE2 = ROOT / "outputs" / "phase2-v1"
PHASE3 = ROOT / "outputs" / "phase3-v1"
STRETCH = ROOT / "outputs" / "stretch-v1"


def main():
    baseline = json.loads((BASE / "metrics.json").read_text(encoding="utf-8"))
    tuning = json.loads((PHASE2 / "tuning_summary.json").read_text(encoding="utf-8"))
    nested = json.loads((PHASE3 / "phase3_analysis.json").read_text(encoding="utf-8"))
    stretch = json.loads((STRETCH / "stretch_metrics.json").read_text(encoding="utf-8"))
    pipeline = joblib.load(PHASE2 / "tuned_random_forest_pipeline.joblib")
    from nafld_fibrosis.config import FEATURES, SEED

    threshold_data = nested["threshold_selection"]
    package_versions = baseline["package_versions"]
    bundle = {
        "pipeline": pipeline,
        "features": FEATURES,
        "threshold": threshold_data["threshold"],
        "threshold_target_sensitivity": nested["protocol"]["threshold_target_sensitivity"],
        "threshold_source": "nested repeated development OOF predictions; exploratory only",
        "random_seed": SEED,
        "best_parameters": tuning["search"]["best_params"],
        "training_partition_size": tuning["n_development"],
        "package_versions": package_versions,
        "intended_use": "Research and learning only; not a diagnostic tool and not for care decisions.",
    }
    OUT.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, OUT / "research_model_bundle.joblib")

    report = [
        "# NAFLD Fibrosis Prediction: research model report",
        "",
        "> **Research and learning project only. This model is not a diagnostic tool and must not guide care.**",
        "",
        "## Objective",
        "",
        "Explore whether routine clinical and lab data can support non-invasive risk estimation of significant fibrosis (F>=2) in patients with NAFLD. The dataset contains 605 records and 62 columns, with 219 positive primary labels. The approved model input set contains 33 predictors. Biopsy-derived fields, patient identifiers, derived target flags, FIB-4, and 15 informatively missing extended laboratory columns are excluded from model inputs.",
        "",
        "## Evaluation design",
        "",
        "- Development partition: stratified 80/20 split with seed 42; stratification preserves the F>=2 target and extended-panel mix.",
        "- Model development: repeated stratified 5-fold CV (3 repeats); the tuned RF search used 8 configurations.",
        "- Nested development estimate: outer 5-fold CV repeated 3 times, with an 8-configuration RF search using 3-fold inner CV; OOF predictions were averaged per patient.",
        "- The original holdout was viewed during the initial baseline phase. Its values below are exploratory only; this report does not claim an independent final holdout result.",
        "- All learned preprocessing is contained in the pipeline. The panel indicator is used only for stratification/subgroup review, never as a predictor.",
        "",
        "## Results",
        "",
        "| Model / estimate | ROC-AUC | PR-AUC | Notes |",
        "|---|---:|---:|---|",
        f"| Logistic regression development CV | {baseline['cross_validation']['LogisticRegression']['roc_auc']['mean']:.3f} +/- {baseline['cross_validation']['LogisticRegression']['roc_auc']['std']:.3f} | {baseline['cross_validation']['LogisticRegression']['pr_auc']['mean']:.3f} +/- {baseline['cross_validation']['LogisticRegression']['pr_auc']['std']:.3f} | Mean +/- SD across 15 folds |",
        f"| Random Forest baseline development CV | {baseline['cross_validation']['RandomForest']['roc_auc']['mean']:.3f} +/- {baseline['cross_validation']['RandomForest']['roc_auc']['std']:.3f} | {baseline['cross_validation']['RandomForest']['pr_auc']['mean']:.3f} +/- {baseline['cross_validation']['RandomForest']['pr_auc']['std']:.3f} | Large train/CV gap; train ROC-AUC {baseline['cross_validation']['RandomForest']['train_roc_auc']['mean']:.3f} |",
        f"| Tuned Random Forest nested development OOF | {nested['nested_oof']['random_forest_roc_auc']:.3f} | {nested['nested_oof']['random_forest_pr_auc']:.3f} | Internal estimate; no external validation |",
        f"| FIB-4 on same nested development patients | {nested['nested_oof']['fib4_roc_auc']:.3f} | {nested['nested_oof']['fib4_pr_auc']:.3f} | RF - FIB-4 AUC difference {nested['nested_oof']['auc_difference_rf_minus_fib4']:+.3f} (95% paired bootstrap CI {nested['nested_oof']['paired_auc_difference_95ci'][0]:+.3f}, {nested['nested_oof']['paired_auc_difference_95ci'][1]:+.3f}) |",
        f"| Baseline Random Forest exploratory holdout | {baseline['holdout']['RandomForest']['roc_auc']:.3f} | {baseline['holdout']['RandomForest']['pr_auc']:.3f} | Exposed before tuning; not a final estimate |",
        f"| Baseline FIB-4 exploratory holdout | {baseline['holdout']['FIB-4 (1.3 cutoff)']['roc_auc']:.3f} | {baseline['holdout']['FIB-4 (1.3 cutoff)']['pr_auc']:.3f} | Same exploratory holdout patients |",
        "",
        f"The proposed sensitivity-oriented threshold was {threshold_data['threshold']:.4f}. On the same OOF scores used to select it, sensitivity was {threshold_data['oof_sensitivity']:.3f} and specificity was {threshold_data['oof_specificity']:.3f}. These operating-point values are descriptive, not unbiased validation results.",
        "",
        "The tuned search selected `" + str(tuning["search"]["best_params"]) + "`. It showed no material improvement over the pre-specified RF baseline in development CV. The nested OOF AUC comparison favors RF over FIB-4 in this cohort, but cannot establish clinical utility or external generalization.",
        "",
        "## Explainability and subgroup review",
        "",
        "Permutation importance was calculated on outer validation folds. Age and diabetes status ranked highest, followed by GGT, platelet count, HbA1c, and AST. These associations are descriptive, not causal; correlated predictors can share importance. Subgroup metrics and denominators are in `outputs/phase3-v1/phase3_report.md`; estimates, especially for smaller groups, are inconclusive and do not establish fairness.",
        "",
        "## Optional stretch analyses",
        "",
        "These secondary targets do not change the primary F>=2 objective. They use the same development partition and repeated 5-fold x 3 repeats CV; the previous holdout is not used.",
        "",
        f"- Advanced fibrosis F>=3 (development counts {stretch['targets']['advanced_fibrosis_F_ge_3']['class_counts']}): RF ROC-AUC {stretch['targets']['advanced_fibrosis_F_ge_3']['models']['RandomForest']['roc_auc']['mean']:.3f} +/- {stretch['targets']['advanced_fibrosis_F_ge_3']['models']['RandomForest']['roc_auc']['std']:.3f}; PR-AUC {stretch['targets']['advanced_fibrosis_F_ge_3']['models']['RandomForest']['pr_auc']['mean']:.3f} +/- {stretch['targets']['advanced_fibrosis_F_ge_3']['models']['RandomForest']['pr_auc']['std']:.3f}. FIB-4 ROC-AUC on the same development patients: {stretch['targets']['advanced_fibrosis_F_ge_3']['fib4_comparator']['roc_auc']:.3f}.",
        f"- Three-class fibrosis group (development counts {stretch['targets']['fibrosis_group_F0_1_F2_F3_4']['class_counts']}): RF balanced accuracy {stretch['targets']['fibrosis_group_F0_1_F2_F3_4']['models']['RandomForest']['balanced_accuracy']['mean']:.3f} +/- {stretch['targets']['fibrosis_group_F0_1_F2_F3_4']['models']['RandomForest']['balanced_accuracy']['std']:.3f}; macro-F1 {stretch['targets']['fibrosis_group_F0_1_F2_F3_4']['models']['RandomForest']['f1_macro']['mean']:.3f} +/- {stretch['targets']['fibrosis_group_F0_1_F2_F3_4']['models']['RandomForest']['f1_macro']['std']:.3f}; one-vs-rest ROC-AUC {stretch['targets']['fibrosis_group_F0_1_F2_F3_4']['models']['RandomForest']['roc_auc_ovr']['mean']:.3f} +/- {stretch['targets']['fibrosis_group_F0_1_F2_F3_4']['models']['RandomForest']['roc_auc_ovr']['std']:.3f}.",
        "- Logistic-regression comparison and full metrics are in `outputs/stretch-v1/stretch_report.md`. These exploratory estimates do not have independent validation.",
        "",
        "## Limitations and provenance",
        "",
        "This is a small retrospective single-source cohort without external validation. Selective testing affects the missingness pattern, labels are biopsy-derived, and subgroup estimates are unstable. The dataset source and licence are not yet verified. The Kaggle URL supplied during Phase 0 points to a different `nafld2.csv` longitudinal measurements table, not this workbook. Do not redistribute the workbook until its provenance and licence are established.",
        "",
        "## Artifacts",
        "",
        "- `outputs/final/research_model_bundle.joblib`: fitted RF pipeline, ordered feature list, threshold, configuration, and intended-use label.",
        "- `outputs/baseline-v1/`: baseline metrics, report, manifest, and fitted baseline RF pipeline.",
        "- `outputs/phase2-v1/`: tuning search and nested development comparison.",
        "- `outputs/phase3-v1/`: threshold, permutation importance, and subgroup analysis.",
        "- `outputs/stretch-v1/`: optional F>=3 and three-class development CV.",
        "- `requirements-lock.txt`: resolved core environment; optional XGBoost and SHAP are not needed for this bundle.",
        "",
        "## Use restriction",
        "",
        "This is a research artifact for reproducibility and education. It is not a diagnostic tool, must not be used for patient care, and has not been externally or prospectively validated.",
        "",
    ]
    (OUT / "final_report.md").write_text("\n".join(report), encoding="utf-8")
    manifest = {
        "dataset_sha256": baseline["dataset"]["sha256"],
        "dataset_rows": baseline["dataset"]["n_rows"],
        "feature_count": len(FEATURES),
        "training_partition_size": tuning["n_development"],
        "random_seed": SEED,
        "model_parameters": tuning["search"]["best_params"],
        "threshold": threshold_data["threshold"],
        "package_versions": package_versions,
        "provenance_status": "unverified; do not redistribute data",
        "artifacts": ["research_model_bundle.joblib", "final_report.md", "stretch-v1/stretch_report.md"],
    }
    (OUT / "final_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Packaged research model and report under {OUT}")


if __name__ == "__main__":
    main()





