# Phase 3: threshold, explanation, and subgroup review

> Research only; not a diagnostic tool.

All results below use nested repeated development OOF predictions. The previously viewed holdout is not reused.

## Sensitivity-oriented threshold

The proposed 0.80 sensitivity target selected a probability threshold of 0.4158. The same OOF predictions gave sensitivity 0.805 and specificity 0.650. Because threshold selection and metric calculation use the same OOF predictions, these operating metrics are descriptive and not an unbiased final estimate.

## Model-agnostic feature importance

Permutation importance was computed only on outer validation folds. It is descriptive, sensitive to correlated predictors, and not causal.

| Feature | Mean ROC-AUC decrease | Fold SD |
|---|---:|---:|
| Age | 0.0413 | 0.0129 |
| Diyabetes Mellitus (No=0, Yes=1) | 0.0226 | 0.0132 |
| GGT | 0.0113 | 0.0089 |
| Trombosit | 0.0110 | 0.0129 |
| Hemoglobin - A1C | 0.0099 | 0.0102 |
| AST | 0.0093 | 0.0076 |
| Total Bilirubin | 0.0078 | 0.0042 |
| Mean Platelet Volume | 0.0064 | 0.0038 |
| Glucose | 0.0061 | 0.0131 |
| Leukocyte | 0.0050 | 0.0055 |
| Ferritin | 0.0049 | 0.0052 |
| Hip Circumference | 0.0044 | 0.0059 |
| Albumin | 0.0036 | 0.0038 |
| Total Protein | 0.0025 | 0.0037 |
| LDL | 0.0022 | 0.0055 |

## Subgroup summaries

AUC intervals are bootstrap intervals over patients. The fixed development-selected threshold is shown for descriptive sensitivity/specificity only. Small subgroups are inconclusive.

| Group | Level | N | Positives | Prevalence | ROC-AUC (95% CI) | Sensitivity | Specificity |
|---|---|---:|---:|---:|---|---:|---:|
| gender | Female | 239 | 98 | 0.410 | 0.805 (0.744, 0.864) | 0.857 | 0.553 |
| gender | Male | 244 | 76 | 0.311 | 0.769 (0.697, 0.832) | 0.737 | 0.732 |
| diabetes | No | 302 | 72 | 0.238 | 0.728 (0.657, 0.796) | 0.569 | 0.796 |
| diabetes | Yes | 181 | 102 | 0.564 | 0.738 (0.662, 0.808) | 0.971 | 0.228 |
| age_band | <50 | 266 | 67 | 0.252 | 0.752 (0.679, 0.830) | 0.657 | 0.754 |
| age_band | 50-59 | 167 | 78 | 0.467 | 0.788 (0.712, 0.852) | 0.885 | 0.517 |
| age_band | 60+ | 50 | 29 | 0.580 | 0.677 (0.518, 0.825) | 0.931 | 0.238 |
| extended_panel | No | 246 | 62 | 0.252 | 0.736 (0.665, 0.807) | 0.710 | 0.696 |
| extended_panel | Yes | 237 | 112 | 0.473 | 0.807 (0.753, 0.859) | 0.857 | 0.584 |

## Evaluation caveat

The baseline holdout was exposed before model tuning. No independent holdout estimate is claimed in this report. The nested OOF results are internal development evidence; external validation remains necessary for any stronger generalization claim.
