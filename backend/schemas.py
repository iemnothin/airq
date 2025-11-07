"""
schemas.py - Pydantic models for AirQ backend
"""
from pydantic import BaseModel

class AirQuality(BaseModel):
    id: int
    waktu: str
    pm10: float
    pm25: float
    so2: float
    co: float
    o3: float
    no2: float
    hc: float
    kelembaban: float
    suhu: float
