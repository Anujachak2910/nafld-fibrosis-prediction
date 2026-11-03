# Product Requirements Document: NAFLD Fibrosis Prediction

**Status:** Draft  
**Version:** 1.0  
**Prepared:** 2 November 2026  
**Project type:** Research and learning project; not a diagnostic device

## 1. Product summary

Build a reproducible machine-learning workflow that explores whether routine clinical and lab data can support non-invasive risk estimation of significant liver fibrosis (stage F2 or higher) in patients with non-alcoholic fatty liver disease (NAFLD). The primary model is a Random Forest classifier. Compare it with logistic regression and the established FIB-4 score to understand whether the model adds useful discrimination and operating-point performance. XGBoost is an optional comparator, time permitting.

The project uses the supplied `data/NAFLD.xlsx` dataset: 605 patients and 62 columns. The population contains steatosis grades 1–3 only; there are no healthy controls. The primary target has 219 positives (36.2%). Results are exploratory and intended for coursework/research, not clinical decisions.

## 2. Problem and goals

This project explores whether routine clinical and lab data can support non-invasive risk estimation of significant fibrosis. The current dataset is small and retrospective, so the deliverable is an evaluated research prototype, not a clinically deployable screening product.

### Clinical motivation

Significant fibrosis (F≥2) is a meaningful research threshold because fibrosis severity can relate to prognosis and may inform monitoring and treatment decisions. Estimating risk from routinely collected information could help researchers explore ways to identify patients who may merit closer assessment. Liver biopsy provides tissue-based information, but it is invasive, costly, and subject to sampling variability because a small tissue sample may not represent the whole liver. This project will examine whether routine variables can support risk estimation without making a clinical diagnosis. Age, AST, ALT, platelet count, albumin, diabetes status, and BMI are candidate variables that may carry useful signal; these are hypotheses to evaluate, not established findings for this project. The dataset and evaluation design limit what can be concluded, so results should be interpreted as exploratory and should not guide individual care.

### Goals

- Establish a reproducible, leakage-controlled Random Forest baseline for significant fibrosis (F≥2).
- Compare model performance with logistic regression and FIB-4 using patient-level held-out evaluation. XGBoost is an optional comparator, time permitting.
- Select an operating threshold using training data only and report sensitivity, specificity, predictive values, and uncertainty alongside ROC-AUC and PR-AUC.
- Document data limitations, model limitations, feature contributions, subgroup results, and reproducible run instructions.
- Treat advanced fibrosis (F≥3) and the three-class grouping (F0–1 / F2 / F3–4) as optional stretch analyses after the primary F≥2 objective is complete.

### Non-goals

- Diagnosis, treatment recommendations, or autonomous clinical decisions.
- Claims of generalization to other hospitals, populations, or current clinical practice.
- Fatty-liver detection or healthy-versus-disease classification; this dataset has no healthy controls.
- Using biopsy results, FIB-4, patient identifiers, or derived target flags as model inputs.
- Clinical deployment, prospective validation, or regulatory clearance within this project.

## 3. Users and use context

- **Student/research team:** run the pipeline, review model metrics, and prepare a report and presentation.
- **Reviewer/instructor:** inspect data decisions, validation design, reproducibility, limitations, and conclusions.
- **Future researcher:** reproduce the experiment from the repository and adapt it after obtaining an appropriately licensed, independent cohort.

The intended output is a research report and saved model artifacts for reproducibility. Any demonstration interface must prominently state that predictions are experimental and must not guide care.

## 4. Data and target requirements

### Source and known structure

- Workbook: `data/NAFLD.xlsx`; `Sheet1` contains the 605 records; `Sheet2` and `Sheet3` are empty.
- 62 columns: patient identifier, candidate clinical inputs, biopsy outcomes, and derived flags.
- Primary target: binary significant fibrosis, F≥2; 219/605 positive.
- Optional stretch targets: advanced fibrosis F≥3 (108/605) and fibrosis group F0–1 / F2 / F3–4 (386 / 111 / 108).
- Preserve the source column spellings in raw data; map them to stable internal names only in the data-loading/feature-mapping layer.

### Data acceptance and controls

1. Load the local workbook; fail clearly if the file, expected sheet, required columns, or target is missing.
2. Validate row count, unique patient IDs, allowed target values, and agreement between target flags and raw fibrosis stage before modeling.
3. Drop the patient ID and all biopsy-derived columns, fibrosis stages, and derived flags from predictors. Derive the target from the raw stage or use the verified target flag, then remove every target/helper column from `X`.
4. Exclude FIB-4 from predictor features; calculate/use it only as a comparator. Also exclude the 15 extended laboratory columns identified by EDA as informatively missing (availability was associated with disease severity). Do not add missingness indicators for those excluded columns.
5. Keep the EDA-approved 33 predictors. Validate their types and missingness before fitting. Fit any imputation or transformation only on training folds through the pipeline.
6. Do not oversample or resample before splitting. If class weighting is evaluated, treat it as a model hyperparameter and report its effect.
7. Keep licensing and original dataset attribution in `data/README.md` accurate before redistribution or publication; current source, author, and licence placeholders need completion.

## 5. Functional requirements

### FR-1: Reproducible ingestion and preprocessing

Provide a single entry point that loads the workbook, validates schema/labels, selects the approved predictors, and returns features, target, and a compact data-quality summary. Preprocessing must be fitted within cross-validation and training data only. Use a `ColumnTransformer` when numeric and categorical handling differ; document the explicit feature types and transformations.

### FR-2: Leakage-safe evaluation

Create a fixed, stratified holdout split before model selection, with a recorded random seed. Given only 605 records, also use repeated stratified cross-validation on the development portion for model comparison/tuning. Use 5-fold cross-validation repeated 3 times as the proposed default. All preprocessing and feature selection must live inside the estimator pipeline. Never use holdout outcomes for tuning, threshold selection, feature selection, or explanation choices.

### FR-3: Random Forest primary model

Train a scikit-learn `RandomForestClassifier` in a preprocessing pipeline. Establish a sensible default baseline, then tune a deliberately small search space (for example `n_estimators`, `max_features`, `min_samples_leaf`, `max_depth`, and `class_weight`) with stratified cross-validation. Prefer regularization and stable performance over maximizing a single score on this small cohort. Preserve the untuned baseline result.

### FR-4: Comparators

Train logistic regression using the same split, folds, features, and reporting protocol as the primary model. Calculate FIB-4 independently as a clinical benchmark and report its stated formula, required variables, and cutoff(s). Do not mix FIB-4 into model inputs. XGBoost may be added as an optional comparator, time permitting, using the same evaluation protocol where feasible.

### FR-5: Metrics and operating point

Report ROC-AUC and PR-AUC with confidence intervals where feasible, plus confusion matrix, sensitivity, specificity, PPV, NPV, and balanced accuracy at a prespecified or training-selected threshold. Select thresholds using out-of-fold development predictions and a stated criterion (for example, sensitivity-oriented); freeze the threshold before evaluating the holdout. Show prevalence and the number of positive cases because predictive values depend on prevalence. Avoid claiming statistical superiority from overlapping or underpowered comparisons.

### FR-6: Explainability and subgroup review

Use permutation importance on held-out data or development cross-validation summaries as the primary model-agnostic feature importance. SHAP is optional, time permitting, and only if its runtime and explanation assumptions are documented; explanations are descriptive, not causal. Predefine feasible demographic/clinical subgroups (such as sex and age bands) and report sample counts, positive counts, and metrics with uncertainty. Mark small or unstable subgroup estimates as inconclusive; do not assert fairness from this dataset alone.

### FR-7: Artifacts and reporting

Save the fitted pipeline, model configuration, random seed, package versions, split indices or equivalent reproducibility metadata, metrics, plots, and a concise run manifest under a versioned output directory. Avoid storing direct identifiers in derived artifacts. Provide a report focused on the primary F≥2 objective, containing methods, results, limitations, and intended-use statement. Include optional stretch analyses only if completed.

## 6. Recommended technology stack and its use

| Technology | How it is used | Rationale / boundary |
|---|---|---|
| Python 3.14.5 (local pinned runtime) | Main language for data validation, modeling, analysis, and report generation | The local runtime is pinned for this project environment; use the matching lock file for reproducibility |
| pandas | Read Excel, validate columns, transform tabular data, produce summary tables | Keep raw data handling separate from model fitting |
| openpyxl | Excel engine for reading `NAFLD.xlsx` | Workbook I/O only; it is not a modeling layer |
| NumPy and SciPy | Numeric operations, statistical utilities, confidence intervals | Keep statistical calculations explicit and reproducible |
| scikit-learn | Pipelines, `ColumnTransformer`, splitters, `RandomForestClassifier`, logistic regression, metrics, cross-validation, parameter search, permutation importance, serialization | Core modeling framework; encapsulate all learned preprocessing in pipelines |
| XGBoost | Optional / time permitting: secondary boosted-tree comparator | Pin version and use the same evaluation protocol; not the primary model |
| SHAP | Optional / time permitting: secondary explanation of fitted models | Use after model evaluation; not for feature selection on holdout data |
| Matplotlib / Seaborn | ROC/PR curves, calibration and metric plots, confusion matrices, subgroup visuals | Generate figures from saved predictions and metrics |
| Jupyter Notebook | EDA and exploratory presentation of results | Keep exploratory work in notebooks; move reusable modeling logic to importable modules |
| pytest | Unit tests for target construction, feature exclusion, schema validation, and split/pipeline behavior | Run in CI or before release; keep tests deterministic and small |
| Git + GitHub | Version control, review, issues, releases, and reproducible project history | Never commit secrets or unlicensed/private data; verify dataset redistribution rights |
| `requirements.txt` or `pyproject.toml` + lock file | Declare and pin direct/transitive dependencies and Python version | Replace unpinned dependencies for repeatable installs; retain only packages actually used |
| Streamlit demo | Optional / time permitting: local demonstration UI to enter permitted variables and inspect a research prediction | Only after validated pipeline/report; no clinical advice, deployment, or default public hosting |

The project pins core dependencies in `requirements.txt` and records resolved transitive versions in `requirements-lock.txt`; optional XGBoost and SHAP versions are listed separately in `requirements-optional.txt`. The lock was generated in the local Python 3.14.5 environment. Avoid adding a database, cloud service, or deep-learning stack for this static, small tabular dataset.

## 7. SOLID-aligned software design

Keep the first implementation modular but proportionate to a student research project. Prefer plain functions and small modules over class hierarchies. Use classes only where they reduce complexity. Keep clear boundaries between data, modeling, evaluation, and presentation.

- **Single Responsibility:** keep data loading/validation, feature selection/preprocessing, model fitting, evaluation, and artifact/report writing in separate functions or small modules, each with one reason to change.
- **Open/Closed:** use configuration or a small estimator registry to add a comparator without rewriting the evaluation workflow. Keep target definitions and metric bundles declarative where useful.
- **Liskov Substitution:** model pipelines should provide compatible `fit`/`predict`/`predict_proba` behavior (or a documented adapter) so the common evaluator can assess them consistently. Fail early if a selected estimator lacks probability outputs required for AUC/threshold metrics.
- **Interface Segregation:** keep function inputs and outputs narrow: data loading, prediction, evaluation, and artifact writing should remain separate. Do not make notebook/report code depend on all model internals.
- **Dependency Inversion:** keep orchestration code dependent on configuration and simple function contracts; keep infrastructure details (Excel reader, filesystem, plotting) at the edges. Prefer direct function composition over needless abstractions.

Suggested layout:

```text
src/nafld_fibrosis/
  config.py             # seeds, feature/target policy, metric configuration
  data.py               # workbook loading and schema/label validation
  features.py           # approved inputs and preprocessing builder
  models.py             # RF baseline/tuning and comparator factories
  evaluation.py         # split, CV, metrics, threshold, subgroup summaries
  explainability.py     # permutation importance and optional SHAP
  artifacts.py          # versioned outputs, metadata, plots and reports
notebooks/
  01_eda.ipynb
  02_modeling.ipynb     # thin calls into src; exploration and presentation
tests/
  test_data.py
  test_features.py
  test_evaluation.py
```

## 8. Quality, privacy, and safety requirements

- **Reproducibility:** use fixed random seeds for splits, estimators, and search; use seed 42 as the proposed default; save environment and configuration; use deterministic preprocessing where supported.
- **Validation integrity:** preprocessing is inside CV; holdout is used once for final evaluation; no test-driven tuning.
- **Data minimization:** do not use patient number as a feature; do not reproduce IDs in charts, logs, or exported predictions.
- **Interpretation:** report confidence intervals and sample counts; distinguish discrimination from calibration and clinical utility. If calibration is assessed, fit calibration only within development CV and report it separately.
- **Scope labeling:** every report/demo says “research only; not a diagnostic tool.” Predictions must not be presented as a diagnosis.
- **Data governance:** cite the dataset and confirm its licence before redistributing the workbook or publishing derived data.
- **Robustness:** document input schema, missing-value behavior, class imbalance, cohort selection, label limitations, and likely domain shift.

## 9. Acceptance criteria

The project is ready for its primary research release when:

1. A fresh environment can install the pinned dependencies and run the documented pipeline from repository root.
2. The data loader validates the workbook and target counts; the primary target reproduces 219/605 positives.
3. Automated checks prove identifiers, all biopsy-derived fields, target/helper flags, FIB-4, and the 15 excluded lab columns cannot enter `X`.
4. A stratified 80/20 split and development-only 5-fold cross-validation repeated 3 times are reproducible with seed 42; preprocessing is fitted inside the pipeline.
5. The Random Forest baseline and tuned candidate are compared against logistic regression and FIB-4 under the agreed protocol. XGBoost is optional / time permitting.
6. Threshold selection uses development out-of-fold predictions only; the untouched holdout report includes required metrics and uncertainty/sample counts.
7. Artifacts include model/config/version metadata, predictions without identifiers, plots, and a reproducible report.
8. Limitations, non-diagnostic intended use, and verified dataset attribution/licensing are included in the README/report.
9. The team reviews and signs off on results, subgroup caveats, and final presentation.

## 10. Phased plan and timeline

The plan is organized by phase rather than calendar duration. Phases may overlap where owners are available; no fixed external deadline was supplied.

| Phase | Work and deliverables | Exit criteria |
|---|---|---|
| 0. Scope and reproducibility setup | Confirm target and exclusions; complete dataset citation/licence; define Python environment, repository layout, random seed (default 42), 80/20 stratified split, 5-fold × 3 repeats CV, and metric/threshold plan. | Reviewed protocol and clean environment; data rights documented. |
| 1. Data contract and baseline | Implement loader/schema checks and feature policy; add basic automated tests; create stratified holdout; fit baseline RF pipeline and logistic regression. | Validated 605-row cohort and target; no leakage; baseline results reproducible. |
| 2. Model comparison and tuning | Use repeated stratified CV on development set; tune compact RF search; calculate FIB-4; compare metrics and uncertainty. Add XGBoost only if time permits. | Frozen model-selection rationale and saved development predictions. |
| 3. Threshold, explanation, subgroup review | Choose a sensitivity-oriented threshold from out-of-fold development predictions; perform one final holdout evaluation; calculate permutation importance; optionally run SHAP, time permitting; perform predefined subgroup summaries; review limitations. | Final holdout report complete; no tuning after holdout exposure. |
| 4. Optional stretch targets and packaging | If capacity permits after the primary F≥2 work is complete, run F≥3 and 3-class experiments with explicitly adapted metrics; finalize artifacts, docs, reproducibility instructions, primary report, and presentation; optional local demo only if time permits. | Primary acceptance criteria met; any completed stretch outputs reviewed and versioned. |

### Team ownership proposal

- **Data and validation owner:** data contract, label checks, feature exclusions, and tests.
- **Modeling owner:** baseline, cross-validation, tuning, comparators, and saved pipeline.
- **Evaluation owner:** threshold, metrics, confidence intervals, subgroup and explanation review.
- **Integration/report owner:** environment, artifact structure, documentation, report, and presentation.
- Team members may pair-review critical leakage and evaluation decisions. Assign named owners during Phase 0.

## 11. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Small, single-source cohort (605 patients) | High variance, weak external validity, unstable tuning/subgroup estimates | Keep search small, use repeated CV and uncertainty intervals, report counts, avoid broad clinical claims, seek external validation for future work |
| Informative missingness and exclusion of 15 labs | Available features may omit useful clinical signal; selection itself reflects care patterns | Preserve EDA rationale, document it, avoid missingness indicators for these fields, reassess only with a justified new protocol |
| Leakage from biopsy-derived fields or FIB-4 | Invalid inflated performance | Central feature allowlist/exclusion tests; comparator isolated from predictors; pipeline review |
| Threshold overfitting | Misleading sensitivity/specificity | Choose from development out-of-fold predictions; freeze before holdout |
| Class imbalance, particularly optional secondary targets | Poor minority-class estimates | Report PR-AUC and class counts; evaluate class weights in CV; avoid synthetic resampling unless a separately justified study is designed |
| Dataset provenance/licence placeholders | Reuse or publication may violate terms or fail citation requirements | Resolve `data/README.md` placeholders before distributing data or final publication |
| Small subgroups | Unreliable or misleading subgroup comparisons | Predefine limited checks, report denominators and uncertainty, suppress claims where support is inadequate |
| Model used as a clinical tool | Patient harm or inappropriate reliance | Research-only label; no care advice; no public clinical deployment; require external and prospective validation before any future clinical use |

## 12. Open decisions

- [ ] Confirm course submission date and whether phases need to be mapped to calendar dates. **Proposed default:** leave the plan phase-based unless the course requires calendar dates.
- [ ] Confirm split proportion. **Proposed default:** stratified 80/20 holdout split.
- [ ] Confirm cross-validation design. **Proposed default:** 5-fold stratified cross-validation repeated 3 times on the development set.
- [ ] Confirm threshold criterion. **Proposed default:** sensitivity-oriented threshold selected from development out-of-fold predictions; report alongside the 0.5 threshold.
- [ ] Confirm random seed. **Proposed default:** 42 for the split, models, and search where applicable.
- [ ] Complete the dataset source, author citation, and licence in `data/README.md`. **Proposed default:** fill these from the original dataset page and accompanying publication; do not redistribute until verified. **[TO FILL: dataset citation] [TO FILL: dataset licence]**
- [ ] Decide whether optional Streamlit demo and SHAP analysis fit available time after the core evaluation is complete. **Proposed default:** defer both unless the primary F≥2 analysis, report, and acceptance criteria are complete.

## Appendix A: Predictor list and exclusions

The approved predictor set follows `notebooks/setup_cell.py`: the 35 features retained after the EDA missingness exclusion, with `Height` and `Weight` removed. The 33 predictors comprise 27 numeric features, five binary-coded features, and one multicategory coded feature (Smoking Status). Raw workbook column spellings are retained below.

### A.1 Approved predictors

| # | Name | Type (numeric/categorical) | Short description |
|---:|---|---|---|
| 1 | `Age` | Numeric | Patient age |
| 2 | `Gender (Female=1, Male=2)` | Categorical | Coded gender |
| 3 | `Body Mass Index` | Numeric | Body mass index (BMI) |
| 4 | `Waist Circumference` | Numeric | Waist circumference |
| 5 | `Hip Circumference` | Numeric | Hip circumference |
| 6 | `Systolic Blood Pressure` | Numeric | Systolic blood pressure |
| 7 | `Diastolic Blood Pressure` | Numeric | Diastolic blood pressure |
| 8 | `Diyabetes Mellitus (No=0, Yes=1)` | Categorical | Diabetes status |
| 9 | `Hypertension (No=0, Yes=1)` | Categorical | Hypertension status |
| 10 | `Hyperlipidemia (No=0, Yes=1)` | Categorical | Hyperlipidemia status |
| 11 | `Metabolic syndrome (No=0, Yes=1)` | Categorical | Metabolic syndrome status |
| 12 | `Smoking Status (Never Smoked=1, Left Smoking=2, Smoking=3)` | Categorical | Coded smoking status |
| 13 | `AST` | Numeric | Aspartate aminotransferase |
| 14 | `ALT` | Numeric | Alanine aminotransferase |
| 15 | `ALP` | Numeric | Alkaline phosphatase |
| 16 | `GGT` | Numeric | Gamma-glutamyl transferase |
| 17 | `LDH` | Numeric | Lactate dehydrogenase |
| 18 | `Total Bilirubin` | Numeric | Total bilirubin |
| 19 | `Direct Bilirubin` | Numeric | Direct bilirubin |
| 20 | `Total Protein` | Numeric | Total serum protein |
| 21 | `Albumin` | Numeric | Serum albumin |
| 22 | `Total Cholesterol` | Numeric | Total cholesterol |
| 23 | `Triglycerides` | Numeric | Triglycerides |
| 24 | `HDL` | Numeric | High-density lipoprotein |
| 25 | `LDL` | Numeric | Low-density lipoprotein |
| 26 | `Leukocyte` | Numeric | Leukocyte count |
| 27 | `Hemoglobin` | Numeric | Hemoglobin concentration |
| 28 | `Trombosit` | Numeric | Platelet count (source spelling) |
| 29 | `Mean Corpuscular Volume` | Numeric | Mean corpuscular volume |
| 30 | `Mean Platelet Volume` | Numeric | Mean platelet volume |
| 31 | `Ferritin` | Numeric | Ferritin concentration |
| 32 | `Glucose` | Numeric | Glucose measurement |
| 33 | `Hemoglobin - A1C` | Numeric | Hemoglobin A1C |

### A.2 Excluded extended laboratory columns

These 15 columns are excluded because EDA found informative missingness: the extended lab panel was ordered more often for patients with more severe disease. Missingness indicators are not added for these columns.

| # | Excluded column |
|---:|---|
| 1 | `Microalbumin/Creatinine Ratio` |
| 2 | `CK` |
| 3 | `C Peptide` |
| 4 | `Microalbumin Spot Urine` |
| 5 | `Vitamin D` |
| 6 | `PT` |
| 7 | `Uric Acid` |
| 8 | `HOMA` |
| 9 | `Insulin` |
| 10 | `Insulin resistance according to HOMA (insulin resistance = 1, no insulin resistance = 2)` |
| 11 | `Ceruloplasmin` |
| 12 | `TSH` |
| 13 | `INR` |
| 14 | `Creatinine` |
| 15 | `BUN` |

### A.3 Excluded identifiers, biopsy-derived columns, and derived flags

These columns are excluded from model predictors to prevent identifier and target leakage. The FIB-4 value is calculated separately for the benchmark and must not be included in the model input matrix.

| Exclusion group | Column name(s) |
|---|---|
| Patient identifier | `Patient No.` |
| Biopsy-derived outcomes and fibrosis stages | `Steatosis`; `Activity`; `Fibrosis`; `NAS score according to Kleiner`; `Diagnosis according to SAF (NASH=1, NAFL=2)`; `Type of Disease (Mild illness=1, Severe illness=2)` |
| Derived target/helper flags | `NAS score>=4 and Fibrosis>=2 (If NAS score>=4 and Fibrosis>=2 = 1, If not = 0)`; `Fibrosis status (No=0, Yes=1) (Fibrosis 1 and above, there is Fibrosis)`; `Significant Fibrosis (No=0, Yes=1) (If Fibrosis 2 and above, there is Significant Fibrosis)`; `Advanced Fibrosis (No=0, Yes=1) (If Fibrosis is 3 and above, there is Advanced Fibrosis)`; `Cirrhosis (No=0, Yes=1) (If Fibrosis is 4, there is Cirrhosis)`; recomputed `AtRiskNASH_calc`; recomputed `FibGroup` |
| FIB-4 comparator value | `FIB4` (calculated; not a source workbook predictor) |
| Removed to avoid redundant anthropometric inputs | `Height`; `Weight` |

## Changelog

- Reworded the project objective and biopsy-related language to describe non-invasive risk estimation, retaining the research-only, non-diagnostic scope.
- Added a 120–180-word Clinical motivation subsection with hypotheses for potentially informative routine variables and no invented statistics or citations.
- Marked F≥3 and three-class analyses as optional stretch scope; kept the primary F≥2 objective central.
- Corrected the Section 10 phase table to three columns and removed the stray indentation before `tests/`.
- Simplified Section 7 around plain functions and small modules while retaining SOLID principles and the suggested folder layout.
- Marked SHAP, the Streamlit demo, and XGBoost as optional / time permitting; retained Random Forest, logistic regression, and FIB-4 as the core comparison.
- Converted Section 12 into a checklist with proposed defaults for the split, cross-validation, threshold, and seed.
- Added Appendix A with the 33 predictor names/types/descriptions and the 15 informatively missing lab exclusions; populated leakage exclusions from the workbook schema and EDA mapping.
- Added `[TO FILL]` placeholders for the original dataset citation and licence, which remain unverified.

**Remaining placeholders:** original dataset source URL, author citation, and licence. Confirm these from the exact source before redistribution or publication.

