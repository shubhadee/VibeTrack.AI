import os
import re
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

def fetch_youtube_comments(query):
    api_key = os.getenv("YOUTUBE_API_KEY")
    
    # Force the library to use the public discovery URL to bypass credential issues
    YOUTUBE_DISCOVERY_URL = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
    
    try:
        youtube = build(
            'youtube', 
            'v3', 
            developerKey=api_key,
            discoveryServiceUrl=YOUTUBE_DISCOVERY_URL,
            static_discovery=False
        )
        
        # 1. Check if the query is a URL or a Search Term
        video_id = None
        # Regex to find the 11-character Video ID in a YouTube URL
        url_pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
        match = re.search(url_pattern, query)
        
        if match:
            video_id = match.group(1)
            print(f"URL detected. Extracting Video ID: {video_id}")
        else:
            # If it's just a topic, search for the top relevant video
            print(f"Topic detected. Searching YouTube for: {query}")
            search_res = youtube.search().list(
                q=query, 
                part='id', 
                maxResults=1, 
                type='video',
                relevanceLanguage='en'
            ).execute()
            
            items = search_res.get('items', [])
            if items:
                video_id = items[0]['id']['videoId']

        if not video_id:
            print("Could not find a valid Video ID.")
            return []

        # 2. Fetch video metadata
        metadata = None
        try:
            import datetime
            def parse_duration(d):
                import re
                match = re.search(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', d)
                if not match: return d
                h, m, s = match.groups()
                time_str = ""
                if h: time_str += f"{h}:"
                m = m or "0"
                s = s or "0"
                time_str += f"{m.zfill(2) if h else m}:{s.zfill(2)}"
                return time_str

            video_req = youtube.videos().list(part="snippet,statistics,contentDetails", id=video_id)
            video_res = video_req.execute()
            if video_res.get('items'):
                vid = video_res['items'][0]
                desc = vid['snippet']['description']
                
                # Format Date
                pub_raw = vid['snippet'].get('publishedAt', '')
                pub_date = pub_raw.split("T")[0] if pub_raw else "Unknown Date"
                
                # Reach Estimation
                views = int(vid['statistics'].get('viewCount', 0))
                likes = int(vid['statistics'].get('likeCount', 0))
                
                reach_stats = {"daily": 0, "weekly": 0, "monthly": 0, "yearly": 0}
                if pub_raw:
                    try:
                        pub_dt = datetime.datetime.strptime(pub_raw, "%Y-%m-%dT%H:%M:%SZ")
                        days_since = max(1, (datetime.datetime.utcnow() - pub_dt).days)
                        reach_stats["daily"] = int(views / days_since)
                        reach_stats["weekly"] = int((views / days_since) * 7)
                        reach_stats["monthly"] = int((views / days_since) * 30.4)
                        reach_stats["yearly"] = int((views / days_since) * 365)
                    except:
                        pass
                
                metadata = {
                    "title": vid['snippet']['title'],
                    "channel": vid['snippet']['channelTitle'],
                    "description": desc[:250] + "..." if len(desc) > 250 else desc,
                    "views": str(views),
                    "likes": str(likes),
                    "comments_count": vid['statistics'].get('commentCount', '0'),
                    "published_at": pub_date,
                    "duration": parse_duration(vid['contentDetails'].get('duration', '')),
                    "tags": vid['snippet'].get('tags', []),
                    "reach_stats": reach_stats,
                    "top_comment": "",
                    "top_comment_likes": 0
                }
        except Exception as e:
            print(f"Metadata Error: {e}")

        # 3. Fetch comments for the identified Video ID
        all_comments = []
        raw_comments_data = []
        res = youtube.commentThreads().list(
            part='snippet', 
            videoId=video_id, 
            maxResults=20, # Fetching 20 comments for a better sample
            textFormat='plainText'
        ).execute()
        
        for i, item in enumerate(res.get('items', [])):
            top_level = item['snippet']['topLevelComment']['snippet']
            comment_text = top_level['textDisplay']
            author = top_level.get('authorDisplayName', 'Anonymous')
            comment_likes = top_level.get('likeCount', 0)
            
            all_comments.append(comment_text)
            raw_comments_data.append({
                "author": author,
                "text": comment_text,
                "likes": comment_likes
            })
            
            # Save the absolute top comment details if metadata exists
            if i == 0 and metadata is not None:
                metadata["top_comment"] = comment_text
                metadata["top_comment_likes"] = comment_likes
                
        if metadata:
            metadata["top_10_comments"] = raw_comments_data[:10]
            
        return {"comments": all_comments, "metadata": metadata}

    except Exception as e:
        print(f"Scraper Error: {e}")
        return {"comments": [], "metadata": None}


def fetch_twitter_data(query):
    import tweepy
    bearer_token = os.getenv("TWITTER_BEARER_TOKEN")
    if not bearer_token:
        print("Missing Twitter Bearer Token")
        return {"comments": [], "metadata": None}
    
    try:
        client = tweepy.Client(bearer_token=bearer_token)
        comments = []
        metadata = None
        
        if "twitter.com" in query or "x.com" in query:
            # Extract status ID from URL
            # e.g., https://x.com/username/status/123456789
            status_id = query.split("/")[-1].split("?")[0]
            
            # Fetch the actual tweet to get conversation_id
            tweet_res = client.get_tweet(id=status_id, tweet_fields=["conversation_id", "public_metrics", "author_id"])
            if tweet_res.data:
                tweet = tweet_res.data
                conv_id = tweet.conversation_id
                
                # Fetch replies based on conversation ID
                replies_res = client.search_recent_tweets(
                    query=f"conversation_id:{conv_id}", 
                    max_results=20, 
                    tweet_fields=['public_metrics']
                )
                
                if replies_res.data:
                    for reply in replies_res.data:
                        comments.append(reply.text)
                else:
                    comments.append("No replies found or access tier limitation.")
                    
                metrics = tweet.public_metrics
                metadata = {
                    "likes": str(metrics.get("like_count", 0)),
                    "retweets": str(metrics.get("retweet_count", 0)),
                    "replies": str(metrics.get("reply_count", 0))
                }
        else:
            # Search recent tweets
            tweets = client.search_recent_tweets(query=query, max_results=20, tweet_fields=['public_metrics'])
            if tweets.data:
                for tweet in tweets.data:
                    comments.append(tweet.text)
            
            metadata = {
                "query": query,
                "count": str(len(tweets.data) if tweets.data else 0)
            }
        
        return {"comments": comments, "metadata": metadata}
    except Exception as e:
        print(f"Twitter Scraper Error: {e}")
        return {"comments": [], "metadata": None}

def fetch_instagram_data(query):
    from apify_client import ApifyClient
    apify_token = os.getenv("APIFY_API_TOKEN")
    if not apify_token:
        print("Missing Apify Token")
        return {"comments": [], "metadata": None}
    
    try:
        client = ApifyClient(apify_token)
        comments = []
        metadata = None
        
        run_input = {
            "directUrls": [query],
            "resultsType": "comments",
            "resultsLimit": 20
        }
        
        # Apify Instagram Scraper Actor
        run = client.actor("apify/instagram-comment-scraper").call(run_input=run_input)
        
        # Fetch data
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            comments.append(item.get("text", ""))
            
        metadata = {"url": query, "note": "Scraped via Apify"}
        return {"comments": comments, "metadata": metadata}
    except Exception as e:
        print(f"Instagram Scraper Error: {e}")
        return {"comments": [], "metadata": None}