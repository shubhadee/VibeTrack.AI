from transformers import pipeline
from collections import Counter
import re

# This loads the actual AI model (DistilBERT)
# The first time you run this, it will download about 260MB of data.
classifier = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

def analyze_sentiment(texts):
    results = []
    all_words = []
    
    for text in texts:
        # 1. Clean the text (Remove HTML tags from YouTube)
        clean_text = re.sub(r'<[^>]+>', '', text)
        
        # 2. Get AI Prediction
        # We limit text to 512 characters because that's the AI's limit
        prediction = classifier(clean_text[:512])[0]
        
        results.append({
            "text": clean_text[:100], 
            "sentiment": prediction['label'],
            "score": prediction['score']
        })
        
        # 3. Collect words for the Word Cloud
        all_words.extend(clean_text.lower().split())
    
    # 4. Find the most common words (filtering out short words like 'the', 'is')
    word_counts = Counter([w for w in all_words if len(w) > 4]).most_common(10)
    word_cloud = [{"text": k, "size": v * 5} for k, v in word_counts]
    
    return results, word_cloud