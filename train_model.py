import json
from pathlib import Path
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE = Path(__file__).resolve().parent
DATA = BASE / 'used_cars.csv'
MODEL_DIR = BASE / 'backend' / 'model'
MODEL_DIR.mkdir(parents=True, exist_ok=True)

FEATURES = ['brand','model','year','transmission','mileage','fuelType','tax','mpg','engineSize']
CAT_COLS = ['brand','model','transmission','fuelType']
NUM_COLS = ['year','mileage','tax','mpg','engineSize']

df = pd.read_csv(DATA)

# Same simple cleaning logic used in the classroom notebook.
df = df.drop_duplicates().copy()
df.loc[df['year'] > 2025, 'year'] = pd.NA
df.loc[df['year'] < 1990, 'year'] = pd.NA
df.loc[df['engineSize'] <= 0, 'engineSize'] = pd.NA
for col in NUM_COLS:
    df[col] = pd.to_numeric(df[col], errors='coerce')
    df[col] = df[col].fillna(df[col].median())

X = df[FEATURES].copy()
y = df['price'].copy()

X = pd.get_dummies(X, columns=CAT_COLS, dtype=int)
feature_columns = X.columns.tolist()

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
)

model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

metrics = {
    'mae': float(mean_absolute_error(y_test, y_pred)),
    'mse': float(mean_squared_error(y_test, y_pred)),
    'rmse': float(mean_squared_error(y_test, y_pred) ** 0.5),
    'r2': float(r2_score(y_test, y_pred)),
    'rows_after_cleaning': int(len(df)),
    'train_rows': int(len(X_train)),
    'test_rows': int(len(X_test)),
}

bundle = {
    'model': model,
    'feature_columns': feature_columns,
    'features': FEATURES,
    'categorical_columns': CAT_COLS,
    'numeric_columns': NUM_COLS,
    'medians': {c: float(df[c].median()) for c in NUM_COLS},
}
joblib.dump(bundle, MODEL_DIR / 'linear_regression_model.joblib')

options = {
    'brands': sorted(df['brand'].dropna().unique().tolist()),
    'models': sorted(df['model'].dropna().unique().tolist()),
    'transmissions': sorted(df['transmission'].dropna().unique().tolist()),
    'fuel_types': sorted(df['fuelType'].dropna().unique().tolist()),
    'ranges': {
        'year': [int(df['year'].min()), int(df['year'].max())],
        'mileage': [int(df['mileage'].min()), int(df['mileage'].max())],
        'tax': [int(df['tax'].min()), int(df['tax'].max())],
        'mpg': [float(df['mpg'].min()), float(df['mpg'].max())],
        'engineSize': [float(df['engineSize'].min()), float(df['engineSize'].max())],
    }
}
(MODEL_DIR / 'options.json').write_text(json.dumps(options, indent=2), encoding='utf-8')
(MODEL_DIR / 'metrics.json').write_text(json.dumps(metrics, indent=2), encoding='utf-8')

print(json.dumps(metrics, indent=2))
