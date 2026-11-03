# Phase 0: Scope and reproducibility decisions

**Status:** Scope, predictor policy, and local core environment confirmed; dataset provenance/licence remains open.  
**Project:** NAFLD Fibrosis Prediction  
**Primary objective:** Explore whether routine clinical and lab data can support non-invasive risk estimation of significant fibrosis (F≥2). Research only; not a diagnostic tool.

## Confirmed scope

- Primary task: binary significant fibrosis (F≥2), currently reported as 219 positives among 605 records (36.2%).
- Core comparison: Random Forest, logistic regression, and FIB-4. XGBoost, SHAP, a Streamlit demo, F≥3, and three-class fibrosis are optional / time permitting.
- No healthy-control classification. Do not use patient IDs, biopsy outcomes/stages, derived target/helper flags, or FIB-4 as model predictors.
- Exclude the 15 extended lab fields listed below because missingness reflects selected testing/workup and is associated with severity. Do not create missingness indicators for these fields.
- Preserve original raw column spellings. Keep all learned preprocessing inside the CV/model pipeline.

## Proposed evaluation protocol

| Decision | Phase 0 default |
|---|---|
| Primary target | Significant fibrosis F≥2 |
| Holdout | 80/20 stratified split, performed once before model selection |
| Development resampling | Stratified 5-fold CV repeated 3 times, only within the 80% development partition |
| Random seed | 42 for splitting, estimators, and search where supported |
| Threshold | Sensitivity-oriented threshold selected from development out-of-fold predictions; freeze before holdout evaluation; report the 0.5 threshold as a reference |
| Primary model | scikit-learn Random Forest pipeline |
| Core comparators | Logistic regression and FIB-4 calculated independently; do not include FIB-4 in model inputs |
| Optional comparator | XGBoost, only if time permits, using the same protocol |
| Primary metrics | ROC-AUC, PR-AUC, sensitivity, specificity, PPV, NPV, balanced accuracy, confusion matrix, prevalence and class counts; confidence intervals where feasible |
| Explanation | Permutation importance on holdout or development CV summaries; SHAP optional / time permitting |

## Data inventory from the current repository

- Workbook is `data/NAFLD.xlsx`, with 605 records and 62 columns on `Sheet1`; `Sheet2` and `Sheet3` are empty per `data/README.md`.
- The EDA notebook reports 219/605 positive labels for F≥2, and validates the raw stage-derived flags.
- The EDA notebook’s sparse-column output identifies these 15 exclusions:

  1. `Microalbumin/Creatinine Ratio`
  2. `CK`
  3. `C Peptide`
  4. `Microalbumin Spot Urine`
  5. `Vitamin D`
  6. `PT`
  7. `Uric Acid`
  8. `HOMA`
  9. `Insulin`
  10. `Insulin resistance according to HOMA (insulin resistance = 1, no insulin resistance = 2)`
  11. `Ceruloplasmin`
  12. `TSH`
  13. `INR`
  14. `Creatinine`
  15. `BUN`

- The EDA notebook reports 35 retained predictors (29 numeric and 6 coded) after excluding those 15 fields. The PRD and README state 33 predictors. `notebooks/setup_cell.py` resolves the difference: it removes `Height` and `Weight` from the 35 EDA-retained columns, leaving the documented 33-input policy.
- The 6 coded columns reported by EDA are `Gender (Female=1, Male=2)`, `Diyabetes Mellitus (No=0, Yes=1)`, `Hypertension (No=0, Yes=1)`, `Hyperlipidemia (No=0, Yes=1)`, `Metabolic syndrome (No=0, Yes=1)`, and `Smoking Status (Never Smoked=1, Left Smoking=2, Smoking=3)`.
- `data/README.md` has unresolved source, licence, and citation fields. The URL supplied by the project owner selects `nafld2.csv`; CRAN documents that table as 400,123 × 4 longitudinal lab measurements, which does not match this 605 × 62 biopsy-labeled workbook. This Kaggle URL is therefore not accepted as the workbook source without further provenance confirmation.

## Environment and repository setup decisions

- Local runtime: Python 3.14.5. The PRD stack recommendation and local setup now use this exact available interpreter version.
- Proposed source layout is the one in `docs/PRD.md` (`src/nafld_fibrosis/`, `notebooks/`, and `tests/`). Reusable pipeline code belongs in small modules; notebooks should call those modules.
- Core direct dependencies are pinned in `requirements.txt`; optional XGBoost and SHAP pins are in `requirements-optional.txt`; the complete resolved core environment is in `requirements-lock.txt`. `.venv/` is ignored by Git.
- The `py.exe` launcher could not start, but the direct Python launcher is available. A project `.venv` was created with Python 3.14.5, all pinned core dependencies installed, and imports plus workbook loading succeeded.

## Phase 0 exit checklist

- [x] Primary F≥2 objective and research-only intended use recorded.
- [x] Core model comparison and optional stretch components defined.
- [x] Proposed 80/20 split, 5-fold × 3 repeats CV, sensitivity-oriented OOF threshold, and seed 42 recorded.
- [x] Workbook shape and 15 sparse lab exclusions cross-checked against the EDA notebook outputs.
- [x] Reconcile PRD/README count of 33 predictors with EDA count of 35: the setup cell explicitly removes `Height` and `Weight`; exact 33-column allowlist is now documented in Appendix A.
- [x] Pin core direct dependencies, record resolved versions, create `.venv`, install packages, and confirm imports and workbook loading on Python 3.14.5.
- [ ] Verify original dataset URL, authorship/citation, and licence; fill `data/README.md` before data redistribution or publication.

## Decisions requiring project-owner input

1. Provide or confirm the actual source of the 605-row `NAFLD.xlsx` workbook (dataset URL, authors, source publication, or the source from which it was reformatted). The supplied Kaggle URL selects a different `nafld2.csv` table and cannot be used as its citation without evidence linking the workbook to that source.




