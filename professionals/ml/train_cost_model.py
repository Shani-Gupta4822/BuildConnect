import os
import sys
import django
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline


# Project root ko Python path mein add karo
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

sys.path.insert(0, BASE_DIR)


# Django settings
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings"
)

django.setup()


from professionals.models import ConstructionProject


# Database se past projects lo
projects = ConstructionProject.objects.all().values(
    "plot_area",
    "built_up_area",
    "floors",
    "location",
    "construction_quality",
    "actual_cost"
)


# DataFrame
df = pd.DataFrame(projects)

print("Training data:")
print(df)


# Input features
X = df[
    [
        "plot_area",
        "built_up_area",
        "floors",
        "location",
        "construction_quality"
    ]
]


# Target
y = df["actual_cost"]


# Categorical features
categorical_features = [
    "location",
    "construction_quality"
]


# Preprocessor
preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        )
    ],
    remainder="passthrough"
)


# Random Forest
model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)


# Pipeline
pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# Train model
pipeline.fit(X, y)


# Model save location
MODEL_DIR = os.path.join(
    BASE_DIR,
    "professionals",
    "ml",
    "models"
)

os.makedirs(MODEL_DIR, exist_ok=True)


MODEL_PATH = os.path.join(
    MODEL_DIR,
    "cost_model.pkl"
)


# Save model
joblib.dump(
    pipeline,
    MODEL_PATH
)


print()
print("================================")
print("ML MODEL TRAINED SUCCESSFULLY!")
print("================================")
print("Model saved at:")
print(MODEL_PATH)