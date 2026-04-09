from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from scraper import (
    fetch_youtube_comments, 
    fetch_twitter_data, 
    fetch_instagram_data
)
from engine import analyze_sentiment

app = FastAPI()

# --- THE CORS FIX ---
# This allows your React Frontend (port 3000) to talk to this Python Backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "SentiMetrics Backend is Online"}

@app.get("/analyze")
async def analyze(query: str, platform: str):
    print(f"--- Incoming Request: Query='{query}', Platform='{platform}' ---")
    
    # 1. Fetch Data from Scraper
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

    # 2. Run AI Sentiment Analysis
    print(f"Analyzing {len(raw_data)} comments...")
    analysis, word_cloud = analyze_sentiment(raw_data)
    
    print("Analysis complete. Sending data to Frontend.")
    return {
        "analysis": analysis,
        "word_cloud": word_cloud,
        "metadata": metadata
    }

if __name__ == "__main__":
    # Runs the server on localhost:8000
    uvicorn.run(app, host="127.0.0.1", port=8000)