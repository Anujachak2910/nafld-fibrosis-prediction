# NAFLD Fibrosis Prediction: research model report

> **Research and learning project only. This model is not a diagnostic tool and must not guide care.**

## Objective

Explore whether routine clinical and lab data can support non-invasive risk estimation of significant fibrosis (F>=2) in patients with NAFLD. The dataset contains 605 records and 62 columns, with 219 positive primary labels. The approved model input set contains 33 predictors. Biopsy-derived fields, patient identifiers, derived target flags, FIB-4, and 15 informatively missing extended laboratory columns are excluded from model inputs.

## Evaluation design

- Development partition: stratified 80/20 split with seed 42; stratification preserves the F>=2 target and extended-panel mix.
- Model development: repeated stratified 5-fold CV (3 repeats); the tuned RF search used 8 configurations.
- Nested development estimate: outer 5-fold CV repeated 3 times, with an 8-configuration RF search using 3-fold inner CV; OOF predictions were averaged per patient.
- The original holdout was viewed during the initial baseline phase. Its values below are exploratory only; this report does not claim an independent final holdout result.
- All learned preprocessing is contained in the pipeline. The panel indicator is used only for stratification/subgroup review, never as a predictor.

## Results

| Model / estimate | ROC-AUC | PR-AUC | Notes |
|---|---:|---:|---|
| Logistic regression development CV | 0.734 +/- 0.051 | 0.617 +/- 0.061 | Mean +/- SD across 15 folds |
| Random Forest baseline development CV | 0.790 +/- 0.055 | 0.698 +/- 0.070 | Large train/CV gap; train ROC-AUC 0.997 |
| Tuned Random Forest nested development OOF | 0.789 | 0.687 | Internal estimate; no external validation |
| FIB-4 on same nested development patients | 0.691 | 0.569 | RF - FIB-4 AUC difference +0.099 (95% paired bootstrap CI +0.049, +0.148) |
| Baseline Random Forest exploratory holdout | 0.713 | 0.596 | Exposed before tuning; not a final estimate |
| Baseline FIB-4 exploratory holdout | 0.755 | 0.600 | Same exploratory holdout patients |

The proposed sensitivity-oriented threshold was 0.4158. On the same OOF scores used to select it, sensitivity was 0.805 and specificity was 0.650. These operating-point values are descriptive, not unbiased validation results.

The tuned search selected `{'model__n_estimators': 300, 'model__min_samples_leaf': 5, 'model__max_features': 'sqrt', 'model__max_depth': None, 'model__class_weight': 'balanced'}`. It showed no material improvement over the pre-specified RF baseline in development CV. The nested OOF AUC comparison favors RF over FIB-4 in this cohort, but cannot establish clinical utility or external generalization.

## Explainability and subgroup review

Permutation importance was calculated on outer validation folds. Age and diabetes status ranked highest, followed by GGT, platelet count, HbA1c, and AST. These associations are descriptive, not causal; correlated predictors can share importance. Subgroup metrics and denominators are in `outputs/phase3-v1/phase3_report.md`; estimates, especially for smaller groups, are inconclusive and do not establish fairness.

## Optional stretch analyses

These secondary targets do not change the primary F>=2 objective. They use the same development partition and repeated 5-fold x 3 repeats CV; the previous holdout is not used.

- Advanced fibrosis F>=3 (development counts {'0': 395, '1': 89}): RF ROC-AUC 0.818 +/- 0.045; PR-AUC 0.578 +/- 0.091. FIB-4 ROC-AUC on the same development patients: 0.767.
- Three-class fibrosis group (development counts {'0': 309, '1': 86, '2': 89}): RF balanced accuracy 0.560 +/- 0.037; macro-F1 0.551 +/- 0.040; one-vs-rest ROC-AUC 0.755 +/- 0.033.
- Logistic-regression comparison and full metrics are in `outputs/stretch-v1/stretch_report.md`. These exploratory estimates do not have independent validation.

## Limitations and provenance

This is a small retrospective single-source cohort without external validation. Selective testing affects the missingness pattern, labels are biopsy-derived, and subgroup estimates are unstable. The dataset source and licence are not yet verified. The Kaggle URL supplied during Phase 0 points to a different `nafld2.csv` longitudinal measurements table, not this workbook. Do not redistribute the workbook until its provenance and licence are established.

## Artifacts

- `outputs/final/research_model_bundle.joblib`: fitted RF pipeline, ordered feature list, threshold, configuration, and intended-use label.
- `outputs/baseline-v1/`: baseline metrics, report, manifest, and fitted baseline RF pipeline.
- `outputs/phase2-v1/`: tuning search and nested development comparison.
- `outputs/phase3-v1/`: threshold, permutation importance, and subgroup analysis.
- `outputs/stretch-v1/`: optional F>=3 and three-class development CV.
- `requirements-lock.txt`: resolved core environment; optional XGBoost and SHAP are not needed for this bundle.

## Use restriction

This is a research artifact for reproducibility and education. It is not a diagnostic tool, must not be used for patient care, and has not been externally or prospectively validated.
