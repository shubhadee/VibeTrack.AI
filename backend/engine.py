from collections import Counter
import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

# Use a lightweight sentiment analyzer for Render deployment.
# VADER avoids the large Torch/Transformers model and reduces memory usage.

def analyze_sentiment(texts):
    results = []
    all_words = []

    for text in texts:
        clean_text = re.sub(r'<[^>]+>', '', text)
        sentiment_scores = analyzer.polarity_scores(clean_text[:512])
        compound = sentiment_scores['compound']
        label = 'POSITIVE' if compound >= 0.05 else 'NEGATIVE' if compound <= -0.05 else 'NEUTRAL'

        results.append({
            'text': clean_text[:100],
            'sentiment': label,
            'score': compound
        })
        all_words.extend(clean_text.lower().split())

    word_counts = Counter([w for w in all_words if len(w) > 4]).most_common(10)
    word_cloud = [{'text': k, 'size': v * 5} for k, v in word_counts]

    return results, word_cloud