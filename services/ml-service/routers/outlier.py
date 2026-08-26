from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np

router = APIRouter()
class VideoData(BaseModel):
    videoId: str; title: str; views: int; subscribers: int; daysSinceUpload: int
class OutlierRequest(BaseModel):
    videos: list[VideoData]
class OutlierResponse(BaseModel):
    videoId: str; title: str; viralityScore: int; isOutlier: bool

@router.post("/outlier", response_model=list[OutlierResponse])
def detect_outliers(request: OutlierRequest):
    if not request.videos: return []
    velocities = np.array([v.views / max(v.daysSinceUpload, 1) for v in request.videos])
    q1, q3 = np.percentile(velocities, [25, 75])
    upper_bound = q3 + 1.5 * (q3 - q1)
    max_v = np.max(velocities) if np.max(velocities) > 0 else 1
    results = []
    for i, v in enumerate(request.videos):
        vel = velocities[i]
        ratio = v.views / max(v.subscribers, 1)
        score = int(min((vel / max_v) * 50 + min((ratio / 10) * 50, 50), 100))
        results.append(OutlierResponse(videoId=v.videoId, title=v.title, viralityScore=score, isOutlier=vel > upper_bound))
    return sorted(results, key=lambda x: x.viralityScore, reverse=True)
