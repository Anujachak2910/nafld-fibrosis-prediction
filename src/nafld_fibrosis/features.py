"""Training-fold-fitted preprocessing for the approved 33-predictor set."""
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from .config import BINARY_CATEGORICAL, NUMERIC, SMOKING


def build_preprocessor():
    numeric = Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
    ])
    binary = SimpleImputer(strategy="most_frequent")
    smoking = Pipeline([
        ("impute", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    return ColumnTransformer(
        [
            ("numeric", numeric, NUMERIC),
            ("binary", binary, BINARY_CATEGORICAL),
            ("smoking", smoking, [SMOKING]),
        ],
        sparse_threshold=0,
        verbose_feature_names_out=True,
    )
