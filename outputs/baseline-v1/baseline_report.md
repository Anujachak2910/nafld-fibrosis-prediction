# Baseline model report

> Research only; not a diagnostic tool. Do not use these results to guide care.

## Protocol

The holdout results below were viewed during the initial baseline phase. They are exploratory only and must not be reused as a final validation estimate.

- Primary target: significant fibrosis F>=2; development CV: 5-fold x 3 repeats.
- Holdout: stratified 80%/20%; seed 42.
- Split stratification preserves both target and extended-panel mix; the panel indicator is not a predictor.
- Model operating point: default probability threshold 0.50 (threshold selection is deferred to a later phase).

## Development cross-validation

| Model | ROC-AUC mean +/- SD | PR-AUC mean +/- SD | Balanced accuracy mean +/- SD | Train ROC-AUC mean |
|---|---:|---:|---:|---:|
| LogisticRegression | 0.734 +/- 0.051 | 0.617 +/- 0.061 | 0.670 +/- 0.049 | 0.817 |
| RandomForest | 0.790 +/- 0.055 | 0.698 +/- 0.070 | 0.718 +/- 0.052 | 0.997 |

## Exploratory holdout results (baseline only; exposed before tuning)

| Method | N | Positives | ROC-AUC | PR-AUC | Sensitivity | Specificity | PPV | NPV |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| LogisticRegression | 121 | 44 | 0.715 | 0.560 | 0.568 | 0.701 | 0.521 | 0.740 |
| RandomForest | 121 | 44 | 0.713 | 0.596 | 0.545 | 0.740 | 0.545 | 0.740 |
| FIB-4 (1.3 cutoff) | 121 | 44 | 0.755 | 0.600 | 0.477 | 0.831 | 0.618 | 0.736 |

## Interpretation limits

This is a single small retrospective cohort. The holdout results are exploratory and have no external validation. The default 0.50 threshold is a baseline reference; sensitivity-oriented threshold selection is deferred. No clinical use is intended.


