# NAFLD fibrosis prediction

Exploring whether routine clinical and laboratory data can support non-invasive risk estimation of **significant liver fibrosis (stage 2 or higher)** in patients with non-alcoholic fatty liver disease (NAFLD).

> Research and learning project. It is not a diagnostic tool.

## Why fibrosis prediction and not fatty liver detection?

The original idea was to detect fatty liver (fatty liver vs. healthy). The dataset has no healthy controls: steatosis grades are only 1, 2 and 3 (151, 246 and 208 patients), with no grade 0. Every patient already has fatty liver, so a detector cannot be trained from this data. What does vary is **fibrosis** (scarring), which is clinically the most important marker of disease severity, so the project predicts that instead.

## Data

Kaggle dataset "Non-alcohol fatty liver disease (NAFLD)": 605 patients, 62 columns (demographics, body measures, blood tests, comorbidities and liver biopsy results). Source and licence details are in [`data/README.md`](data/README.md).

## Tasks

| Experiment | Target | Type | Positives / classes |
|---|---|---|---|
| A (main) | Significant fibrosis (F >= 2) | Binary | 219 of 605 (36.2%) |
| B (optional stretch) | Advanced fibrosis (F >= 3) | Binary | 108 (17.9%) |
| C (optional stretch) | Fibrosis group F0-1 / F2 / F3-4 | 3-class | 386 / 111 / 108 |

Core comparison: Random Forest and logistic regression against **FIB-4**, the clinical benchmark. XGBoost is optional / time permitting.

## What the EDA established (notebooks/01_eda.ipynb)

- **No leakage:** all biopsy-derived columns, FIB-4 and helper columns are excluded from the inputs (33 model inputs remain).
- **Labels verified:** the provided significant and advanced fibrosis flags match the raw fibrosis stage. The provided "at-risk NASH" flag disagreed with its own definition in 269 of 605 patients (44%) and was not used.
- **Informative missingness:** 15 lab columns were ordered mostly for sicker patients (fibrosis about 25% without the extended lab panel vs. about 48% with it), so they are excluded and no missing-value indicators are used.
- **Modest univariate signal:** the best single feature (age) reaches AUC of about 0.65. Diabetes shows the largest association (fibrosis 25% vs. 55%).
- **Benchmark (FIB-4):** AUC 0.703 (95% CI 0.660 to 0.744) for significant fibrosis and 0.767 (0.718 to 0.814) for advanced fibrosis. At the usual 1.3 cutoff its sensitivity is only 0.50 and 0.66.

## Repository structure

```
nafld-fibrosis-prediction/
├── README.md
├── LICENSE
├── requirements.txt
├── .gitignore
├── data/
│   ├── NAFLD.xlsx
│   └── README.md
├── notebooks/
│   ├── README.md
│   ├── setup_cell.py          (shared setup cell)
│   ├── 01_eda.ipynb
│   └── 02_modeling.ipynb
└── docs/
    ├── README.md
    ├── eda_handover.pdf
    └── modeling_handbook.pdf
```

## How to run

1. Open `notebooks/01_eda.ipynb` in Google Colab: **File > Open notebook > GitHub**, then paste `shrfr/nafld-fibrosis-prediction`.
2. Run all cells. The data loads directly from this repository, so no Google Drive is needed.
3. For modeling, open `notebooks/02_modeling.ipynb`, run the setup cell first (`notebooks/setup_cell.py`), then follow `docs/modeling_handbook.pdf`.

Run the local baseline from the repository root: `.venv\Scripts\python.exe scripts/run_baseline.py`. For a fresh setup, use Python 3.14.5, create a virtual environment, and install with `.venv\Scripts\python.exe -m pip install -r requirements-lock.txt`.

## Deploy on Render

Deploy the interactive fullstack web application for free on [Render](https://render.com):
1. Push this repository to GitHub: `git push origin main`.
2. In Render Dashboard, click **New +** > **Blueprint** and connect this repository.
3. Render automatically provisions the unified service via [`render.yaml`](render.yaml).
See [`DEPLOY_RENDER.md`](DEPLOY_RENDER.md) for full step-by-step instructions.

## Status

- [x] EDA, label verification, leakage control, missing-data analysis, FIB-4 benchmark
- [x] Leakage-safe data contract, stratified train/test split, preprocessing pipeline, and initial RF/logistic-regression baseline compared with FIB-4
- [x] Compact RF tuning and development-only CV comparison against logistic regression and FIB-4
- [x] Nested OOF sensitivity-oriented threshold, permutation importance, and subgroup summaries (SHAP optional / time permitting)
- [x] Optional F>=3 and three-class experiments (development CV only)
- [x] Research model bundle and consolidated report packaged
- [x] Phase 4 presentation completed; optional local demo remains time permitting

Initial baseline metrics and the fitted Random Forest pipeline are in `outputs/baseline-v1/`. The holdout was exposed during baseline work, so those holdout metrics are exploratory and not a final validation estimate. Phase 2 development-only tuning and nested OOF comparisons are in `outputs/phase2-v1/`; the tuned RF showed no material gain over the pre-specified RF baseline. Threshold and subgroup results are descriptive because the threshold is evaluated on development OOF data; no independent final validation estimate is claimed. The consolidated report, research model bundle, and editable Phase 4 presentation are in `outputs/final/`. Dataset source/licence verification and an independent external validation remain open.

## Team

1. Shreya Bhattacharjee (2306353)
2. Anuja Chakraborty(2306375)
3. Ayushi Gupta (2328161)
4. Aryan Utsav(2306335)
5. Aakrishya(2306247)
6. Raghuvansh(2306391)

## Licence

Code: MIT (see `LICENSE`). The dataset keeps its original licence, see `data/README.md`.









