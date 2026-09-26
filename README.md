# Used Car Price Prediction

A complete full-stack machine learning project that predicts used car prices using a Linear Regression model trained on 99,187 real-world records. Designed with a beginner-friendly academic presentation format.

## Architecture

- **Frontend:** React, Vite, plain CSS (responsive, dark theme, interactive ML visualizer).
- **Backend:** Flask API (Python) serving a scikit-learn `LinearRegression` model.
- **Model Accuracy:** R² = 0.8653 | MAE = £2,244.69 | RMSE = £3,637.67

## 🚀 Live Demo (Vercel)

If deployed on Vercel, you can access the frontend and the prediction API endpoints seamlessly.
The frontend uses Vite for fast local development and is built statically for production, while the Flask API acts as a Serverless Function on Vercel.

## 🛠️ Run Locally

### 1. Start the Flask Backend

```bash
cd backend
python -m venv .venv

# Activate environment:
# On Windows: .venv\Scripts\activate
# On macOS/Linux: source .venv/bin/activate

pip install -r requirements.txt
python app.py
```
> The API will be available at `http://localhost:5000`

### 2. Start the React Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
> The UI will be available at `http://localhost:5173`

## 🧠 Retrain the Model

To retrain the model locally (e.g., if you update `used_cars.csv`):

```bash
# From the project root
python train_model.py
```

## 📦 Deployment on Vercel

This project is configured out-of-the-box for Vercel deployment using the included `vercel.json` file.
Simply import this GitHub repository into Vercel and it will automatically:
1. Build the React frontend using `npm run build` in the `frontend/` directory.
2. Expose the Flask API from the `backend/` directory as serverless functions.
3. Route `/api/*` traffic perfectly to your Flask backend.
