import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from scraper import (
    fetch_youtube_comments,
    fetch_twitter_data,
    fetch_instagram_data
)
from engine import analyze_sentiment

app = FastAPI()

# --- THE CORS FIX ---
# This allows cross-origin requests for the frontend or other clients.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

build_dir = Path(__file__).resolve().parent.parent / "frontend" / "build"
if build_dir.exists():
    app.mount("/", StaticFiles(directory=str(build_dir), html=True), name="frontend")

@app.get("/api/status")
def status():
    return {"status": "SentiMetrics Backend is Online"}

@app.get("/analyze")
async def analyze(query: str, platform: str):
    print(f"--- Incoming Request: Query='{query}', Platform='{platform}' ---")

    metadata = None
    if platform.lower() == "youtube":
        fetched = fetch_youtube_comments(query)
    elif platform.lower() == "twitter":
        fetched = fetch_twitter_data(query)
    elif platform.lower() == "instagram":
        fetched = fetch_instagram_data(query)
    else:
        fetched = []

    if isinstance(fetched, dict):
        raw_data = fetched.get("comments", [])
        metadata = fetched.get("metadata", None)
    else:
        raw_data = fetched

    if not raw_data:
        print("No data found for this query.")
        return {"analysis": [], "word_cloud": [], "metadata": None}

    print(f"Analyzing {len(raw_data)} comments...")
    analysis, word_cloud = analyze_sentiment(raw_data)

    print("Analysis complete. Sending data to Frontend.")
    return {
        "analysis": analysis,
        "word_cloud": word_cloud,
        "metadata": metadata
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))