from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import outlier, forecast

app = FastAPI(title="CreatorPulse ML Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(outlier.router, prefix="/predict")
app.include_router(forecast.router, prefix="/predict")

@app.get("/")
def read_root():
    return {"status": "running"}
