from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

app = FastAPI()

class SalesData(BaseModel):
    data: list


# =============================
# Revenue Prediction
# =============================
@app.post("/predict")
def predict_sales(payload: SalesData):
    try:
        if not payload.data:
            return {"next_7_days_prediction": []}

        df = pd.DataFrame(payload.data)

        if "_id" not in df.columns:
            return {"error": "Invalid data format"}

        df["date"] = df["_id"].apply(
            lambda x: f"{x['year']}-{x['month']:02d}-{x['day']:02d}"
        )

        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")
        df["day_index"] = np.arange(len(df))

        X = df[["day_index"]]
        y = df["dailyRevenue"]

        model = LinearRegression()
        model.fit(X, y)

        future_days = np.arange(len(df), len(df) + 7).reshape(-1, 1)
        predictions = model.predict(future_days)

        return {
            "next_7_days_prediction": predictions.tolist()
        }

    except Exception as e:
        return {"error": str(e)}


# =============================
# Product Demand Prediction
# =============================
@app.post("/predict-product")
def predict_product_demand(payload: SalesData):
    try:
        if not payload.data:
            return {"next_7_days_demand": []}

        df = pd.DataFrame(payload.data)

        if "_id" not in df.columns:
            return {"error": "Invalid data format"}

        df["date"] = df["_id"].apply(
            lambda x: f"{x['year']}-{x['month']:02d}-{x['day']:02d}"
        )

        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")
        df["day_index"] = np.arange(len(df))

        X = df[["day_index"]]
        y = df["quantitySold"]

        model = LinearRegression()
        model.fit(X, y)

        future_days = np.arange(len(df), len(df) + 7).reshape(-1, 1)
        predictions = model.predict(future_days)

        return {
            "next_7_days_demand": predictions.tolist()
        }

    except Exception as e:
        return {"error": str(e)}