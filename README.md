# VibeTrack.AI

VibeTrack.AI is a social sentiment analytics dashboard built with a React frontend and a FastAPI backend. It collects social media comments from YouTube, Twitter/X, and Instagram, then performs sentiment analysis and keyword extraction to help you understand audience reactions.

## Features

- Analyze sentiment on YouTube videos, Twitter/X threads, and Instagram posts
- Fetch comment data, tweet replies, or Instagram post comments automatically
- Display sentiment gauge, top keywords, word cloud, and metadata
- Clean, responsive React dashboard using Tailwind CSS and Recharts
- Backend API powered by FastAPI with CORS support for local development

## Tech Stack

- Frontend: React, Create React App, Tailwind CSS, Recharts, lucide-react
- Backend: Python, FastAPI, Uvicorn, google-api-python-client, Tweepy, Apify Client
- Data: YouTube Data API, Twitter API, Apify Instagram Scraper actor

## Repository Structure

- `backend/`
  - `main.py` - FastAPI app and analyze endpoint
  - `scraper.py` - social media data fetchers for YouTube, Twitter/X, Instagram
  - `engine.py` - sentiment analysis and word cloud logic
  - `requirements.txt` - Python dependencies
- `frontend/`
  - `src/` - React application source code
  - `package.json` - frontend dependencies and scripts
  - `public/` - static HTML and manifest assets
- `.gitignore` - ignored files and folders for git
- `README.md` - project documentation

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+ (or compatible)
- Git

## Backend Setup

1. Open a terminal and navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:

   Windows PowerShell:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   Windows Command Prompt:
   ```cmd
   .\venv\Scripts\activate.bat
   ```

4. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file in `backend/` with the required keys:

   ```text
   YOUTUBE_API_KEY=your_youtube_api_key
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   APIFY_API_TOKEN=your_apify_api_token
   ```

6. Start the backend API:

   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

## Frontend Setup

1. From the project root, open a terminal and navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install npm dependencies:

   ```bash
   npm install
   ```

3. Start the React development server:

   ```bash
   npm start
   ```

4. Open the app in your browser at:

   ```text
   http://localhost:3000
   ```

## Running the App

- The frontend expects the backend to run on `http://127.0.0.1:8000`
- Use the dashboard input to enter a search query or social media URL
- Choose the platform: `YouTube`, `Twitter`, or `Instagram`
- Click analyze and review the generated sentiment results and metadata

## Build for Production

From `frontend/`:

```bash
npm run build
```

## Environment Variables

The backend requires the following environment variables:

- `YOUTUBE_API_KEY` - Google YouTube Data API key
- `TWITTER_BEARER_TOKEN` - Twitter/X API bearer token
- `APIFY_API_TOKEN` - Apify API token for Instagram scraping

> Do not commit your `.env` file or any secret values to Git.

## Notes

- The backend currently allows all origins via CORS for local development.
- If using Twitter/X, ensure your access tier supports tweet and replies queries.
- Instagram scraping uses an Apify actor and may require an active Apify account.

## Render Deployment

This repository includes `render.yaml` for Render deployment automation.

- Backend service: runs from `backend/` using Python and Uvicorn.
- Frontend service: builds from `frontend/` and publishes `build/` as a static site.
- Render will use `$PORT` to launch the backend automatically.

Make sure to configure these environment variables in Render:

- `YOUTUBE_API_KEY`
- `TWITTER_BEARER_TOKEN`
- `APIFY_API_TOKEN`

## GitHub Repository

This repository is configured as a normal Git project with the frontend stored as tracked files, not as a nested submodule.

## License

Add your preferred license here if needed.
