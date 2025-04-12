import time
import os
from textblob import TextBlob

def analyze_sentiment(text):
    """
    Analyze sentiment using TextBlob.
    Returns 'POSITIVE' if the sentiment polarity is >= 0, otherwise 'NEGATIVE'.
    """
    blob = TextBlob(text)
    # The polarity score is between -1 (very negative) and 1 (very positive)
    polarity = blob.sentiment.polarity
    return 'POSITIVE' if polarity >= 0 else 'NEGATIVE'

def monitor_stream(stream_file, sentiment_file, polling_interval=1):
    """
    Continuously monitors the stream_file for new text, applies sentiment analysis,
    and writes the overall sentiment to sentiment_file whenever it changes.

    :param stream_file: Path to the file being updated by the "stream" process.
    :param sentiment_file: Path to the file where the current sentiment is stored.
    :param polling_interval: Number of seconds between file polls.
    """
    last_position = 0
    current_sentiment = None

    print("Starting stream monitor using TextBlob for sentiment analysis. Press Ctrl+C to exit.")

    while True:
        if os.path.exists(stream_file):
            with open(stream_file, 'r', encoding="utf-8") as f:
                # Move to the last read position
                f.seek(last_position)
                new_content = f.read()
                last_position = f.tell()  # Update the file pointer
        else:
            new_content = ""

        if new_content.strip():
            overall_sentiment = analyze_sentiment(new_content)

            # Only update the sentiment file if the sentiment has changed.
            if overall_sentiment != current_sentiment:
                current_sentiment = overall_sentiment
                with open(sentiment_file, 'w', encoding="utf-8") as sf:
                    sf.write(current_sentiment)
                print(f"Sentiment changed to: {current_sentiment}")

        time.sleep(polling_interval)

if __name__ == "__main__":
    stream_file = "output.txt"     # This file is updated by your streaming script
    sentiment_file = "sentiment.txt"

    try:
        monitor_stream(stream_file, sentiment_file, polling_interval=1)
    except KeyboardInterrupt:
        print("Monitoring stopped.")
