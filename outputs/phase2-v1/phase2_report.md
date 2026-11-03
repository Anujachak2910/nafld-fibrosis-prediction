# Phase 2: development-only model tuning

> Research only; not a diagnostic tool.

The previously viewed baseline holdout is excluded from tuning and from final claims. The results below use only development data.

- Randomized search: 8 RF configurations; 5-fold CV repeated 3 times; seed 42.
- Best CV ROC-AUC: 0.788 +/- 0.056.
- Best parameters: `{'model__n_estimators': 300, 'model__min_samples_leaf': 5, 'model__max_features': 'sqrt', 'model__max_depth': None, 'model__class_weight': 'balanced'}`.
- OOF comparisons use one 5-fold split on development data; FIB-4 differences use paired bootstrap intervals.
- Threshold selection remains for Phase 3.

| Model | OOF ROC-AUC | OOF PR-AUC | AUC difference vs FIB-4 (95% paired bootstrap CI) |
|---|---:|---:|---:|
| LogisticRegression | 0.732 | 0.594 | +0.041 [-0.012, +0.094] |
| RandomForest | 0.796 | 0.699 | +0.105 [+0.056, +0.156] |
| TunedRandomForest (non-nested; selection-biased, exclude from inference) | 0.796 | 0.698 | +0.105 [+0.057, +0.157] |
| FIB-4 | 0.691 | 0.569 | reference |

This is model development evidence from one small cohort, not an independent validation estimate. The paired interval is descriptive and should not be treated as proof of clinical utility.

## Nested repeated out-of-fold estimate for the tuning workflow

The tuned RF estimate uses nested repeated cross-validation: outer 5-fold CV repeated 3 times; inside each outer training partition, an 8-configuration RF search uses 3-fold CV. Each patient receives three outer-fold predictions, averaged before scoring. The previously viewed holdout is not used.

- Tuned RF nested OOF ROC-AUC: 0.789; PR-AUC: 0.687.
- Development FIB-4 ROC-AUC on the same patients: 0.691; PR-AUC: 0.569.
- Paired ROC-AUC difference (RF - FIB-4): +0.099 (95% paired bootstrap interval [+0.049, +0.148]).
- The earlier non-nested tuned OOF line is retained only for traceability and is explicitly excluded from inference.
