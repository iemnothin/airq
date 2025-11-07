"""
ml.py - Machine learning and forecasting utilities for AirQ backend
"""
from prophet import Prophet
from prophet.make_holidays import make_holidays_df
from prophet.diagnostics import cross_validation
from sklearn.metrics import mean_absolute_percentage_error
import pandas as pd

model_cache = {}

# Example: get_or_train_model, get_prediction_for_date, build_forecast_df

def get_or_train_model(train_df, column, years=[2022, 2023, 2024, 2025, 2026]):
    if column not in model_cache:
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            holidays=make_holidays_df(year_list=years, country="ID"),
        )
        model.add_seasonality(name="monthly", period=30.5, fourier_order=5)
        data = train_df[["Waktu", column]].rename(columns={"Waktu": "ds", column: "y"})
        model.fit(data)
        model_cache[column] = model
    return model_cache[column]

def get_prediction_for_date(model, date_obj, train_df, test_end, horizon=180):
    last_train_date = train_df["Waktu"].max().date()
    days_ahead = (test_end - last_train_date).days
    forecast = model.predict(model.make_future_dataframe(periods=max(days_ahead, horizon)))
    forecast["ds"] = pd.to_datetime(forecast["ds"]).dt.date
    return forecast[forecast["ds"] == date_obj]

def build_forecast_df(df, column, days_ahead=7):
    model = get_or_train_model(df, column)
    forecast = model.predict(model.make_future_dataframe(periods=90))
    forecast["ds"] = pd.to_datetime(forecast["ds"]).dt.date
    forecast = forecast[forecast["ds"] >= pd.Timestamp.now().date()].head(days_ahead)
    return forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]
