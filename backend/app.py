from pathlib import Path
import json
import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE = Path(__file__).resolve().parent
MODEL_DIR = BASE / 'model'

bundle = joblib.load(MODEL_DIR / 'linear_regression_model.joblib')
model = bundle['model']
feature_columns = bundle['feature_columns']
features = bundle['features']
cat_cols = bundle['categorical_columns']
num_cols = bundle['numeric_columns']
medians = bundle['medians']
options = json.loads((MODEL_DIR / 'options.json').read_text(encoding='utf-8'))
metrics = json.loads((MODEL_DIR / 'metrics.json').read_text(encoding='utf-8'))

app = Flask(__name__)
CORS(app)

@app.get('/api/health')
def health():
    return jsonify({'status': 'ok', 'model': 'Linear Regression'})

@app.get('/api/options')
def get_options():
    return jsonify(options)

@app.get('/api/metrics')
def get_metrics():
    return jsonify(metrics)

@app.post('/api/predict')
def predict():
    data = request.get_json(silent=True) or {}
    missing = [f for f in features if f not in data or data[f] in (None, '')]
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    try:
        row = {f: data[f] for f in features}
        for col in cat_cols:
            row[col] = str(row[col])
        for col in num_cols:
            row[col] = float(row[col])

        # Replace clearly invalid numeric values using training medians.
        if row['year'] < 1990 or row['year'] > 2025:
            row['year'] = medians['year']
        if row['engineSize'] <= 0:
            row['engineSize'] = medians['engineSize']

        frame = pd.DataFrame([row])
        frame = pd.get_dummies(frame, columns=cat_cols, dtype=int)
        frame = frame.reindex(columns=feature_columns, fill_value=0)
        prediction = float(model.predict(frame)[0])
        prediction = max(0, prediction)

        return jsonify({
            'predicted_price': round(prediction, 2),
            'currency': 'GBP',
            'model': 'Linear Regression',
            'r2': metrics['r2']
        })
    except (TypeError, ValueError) as exc:
        return jsonify({'error': f'Please enter valid numeric values. {exc}'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
