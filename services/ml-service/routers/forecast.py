from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
from sklearn.linear_model import LinearRegression

router = APIRouter()
class ForecastRequest(BaseModel):
    historicalViews: list[int]; daysSinceUpload: list[int]
class ForecastResponse(BaseModel):
    forecastedViews: list[int]; trend: str

@router.post("/forecast", response_model=ForecastResponse)
def forecast_growth(request: ForecastRequest):
    if len(request.historicalViews) < 3: return ForecastResponse(forecastedViews=[0]*30, trend="insufficient_data")
    X = np.array(request.daysSinceUpload).reshape(-1, 1); y = np.array(request.historicalViews)
    model = LinearRegression(); model.fit(X, y)
    last_day = max(request.daysSinceUpload)
    future_days = np.arange(last_day + 1, last_day + 31).reshape(-1, 1)
    predictions = np.maximum(model.predict(future_days), 0).astype(int).tolist()
    slope = model.coef_[0]
    trend = "growing" if slope > 100 else "declining" if slope < -100 else "stable"
    return ForecastResponse(forecastedViews=predictions, trend=trend)
