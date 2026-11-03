# Data

**File:** `NAFLD.xlsx`
**Dataset:** Kaggle, "Non-alcohol fatty liver disease (NAFLD)"

- Source URL: **Unverified.** The Kaggle URL supplied for Phase 0 (`https://www.kaggle.com/datasets/utkarshx27/non-alcohol-fatty-liver-disease?select=nafld2.csv`) points to `nafld2.csv`, which is documented as a separate longitudinal lab-measurement table and does not match this 605-row, 62-column workbook. Do not cite it as the source of `NAFLD.xlsx` without confirming provenance.
- Licence: `[TO FILL: verify the licence for the actual source of NAFLD.xlsx]`
- Authors / citation: `[TO FILL: verify the authors and citation for the actual source of NAFLD.xlsx]`

The file must not be redistributed or republished until the actual source and licence are verified. If you reuse this repository, check the applicable licence and cite the original authors.

## Contents

- 605 patients, 62 columns, biopsy-confirmed NAFLD (no healthy controls).
- Only `Sheet1` contains data. `Sheet2` and `Sheet3` are empty.
- Column 0 is `Patient No.` (an ID). Columns 1 to 50 are inputs (demographics, body measures, laboratory values, comorbidities). Columns 51 to 61 are liver biopsy results and derived flags, which must never be used as model inputs.
- Coding: gender Female = 1, Male = 2; most yes/no columns No = 0, Yes = 1.
- Original column spellings (for example `Diyabetes Mellitus`, `Trombosit`) are kept as in the source file.

## Loading

The notebooks read the file directly from this repository:

```
https://raw.githubusercontent.com/shrfr/nafld-fibrosis-prediction/main/data/NAFLD.xlsx
```

(or from `data/NAFLD.xlsx` when the repository is cloned).

