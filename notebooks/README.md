# Notebooks

| File | Purpose | Owner |
|---|---|---|
| `setup_cell.py` | The shared setup cell. Paste it into the first cell of every notebook and run it first | all |
| `01_eda.ipynb` | Steps 1 to 6: data inspection, targets, leakage, missingness, feature ranking, FIB-4 benchmark | EDA |
| `02_modeling.ipynb` | Step 7 onward: loads trained model bundle, runs probability estimation, evaluates sensitivity threshold & FIB-4 | modeling |
| `research_model_bundle.joblib` | Trained research model bundle (Tuned RF pipeline, 33 features, threshold 0.4158) | modeling |
| `models/` | Folder containing `research_model_bundle.joblib` and `tuned_random_forest_pipeline.joblib` | modeling |

Tips:

- Use **Runtime > Restart and run all** before saving, so the stored outputs match the code.
- Work in your own notebook file to avoid merge conflicts, since notebooks are hard to merge.
- Do not store keys or tokens in any cell.

