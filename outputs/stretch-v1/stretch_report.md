# Optional stretch experiments

> Research only; not a diagnostic tool. These analyses use the development partition only; the previously viewed holdout is not used.

Repeated stratified 5-fold CV x 3 repeats; seed 42.

## advanced_fibrosis_F_ge_3

Class counts: `{'0': 395, '1': 89}`

FIB-4 comparator on the same development patients (n=483): ROC-AUC 0.767; PR-AUC 0.479.

### LogisticRegression

- roc_auc: 0.786 +/- 0.050
- pr_auc: 0.495 +/- 0.100
- balanced_accuracy: 0.714 +/- 0.042

### RandomForest

- roc_auc: 0.818 +/- 0.045
- pr_auc: 0.578 +/- 0.091
- balanced_accuracy: 0.706 +/- 0.064

## fibrosis_group_F0_1_F2_F3_4

Class counts: `{'0': 309, '1': 86, '2': 89}`

### LogisticRegression

- balanced_accuracy: 0.484 +/- 0.040
- f1_macro: 0.466 +/- 0.034
- roc_auc_ovr: 0.676 +/- 0.034

### RandomForest

- balanced_accuracy: 0.560 +/- 0.037
- f1_macro: 0.551 +/- 0.040
- roc_auc_ovr: 0.755 +/- 0.033

These are optional exploratory analyses on one small cohort. They are not independent validation results; the 3-class results should be interpreted using class counts and macro/balanced metrics.
