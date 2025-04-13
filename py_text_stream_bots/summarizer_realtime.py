import time
import os
from transformers import pipeline

def summarize_text(text, summarizer):
    """
    Generate a summary for the provided text using the summarizer pipeline.
    Adjust max_length and min_length as needed.
    """
    summary = summarizer(text, max_length=130, min_length=30, do_sample=False)
    return summary[0]['summary_text']

def monitor_stream_for_deadtime_summary(stream_file, summary_file, polling_interval=1, dead_time_threshold=3):
    """
    Monitors the stream file continuously. When no new text is appended for at least
    dead_time_threshold seconds (a "dead time"), the entire text is summarized and the summary
    is written to summary_file (overwriting previous content if the summary has changed).

    :param stream_file: File path of the continuously updated transcript.
    :param summary_file: File path to write the current summary.
    :param polling_interval: Seconds between file modification checks.
    :param dead_time_threshold: Seconds of inactivity (no file modification) triggering summarization.
    """
    # Initialize the summarizer – ensure your environment has a proper DL framework installed.
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

    last_summary = None

    print("Starting real-time summarizer with dead time detection. Press Ctrl+C to exit.")

    while True:
        if os.path.exists(stream_file):
            # Get the last modification time of the stream file.
            file_mod_time = os.path.getmtime(stream_file)
            current_time = time.time()

            # Read the full transcript text.
            with open(stream_file, 'r', encoding="utf-8") as f:
                full_text = f.read()

            # Check if we are in a "dead time" (no new text for at least dead_time_threshold seconds)
            if full_text.strip() and (current_time - file_mod_time) >= dead_time_threshold:
                try:
                    overall_summary = summarize_text(full_text, summarizer)
                except Exception as e:
                    overall_summary = f"Error summarizing: {str(e)}"

                # Update the summary file only if the summary has changed.
                if overall_summary != last_summary:
                    last_summary = overall_summary
                    with open(summary_file, 'w', encoding="utf-8") as sf:
                        sf.write(overall_summary)
                    print("Summary updated:")
                    print(overall_summary)
        else:
            print(f"Waiting for stream file '{stream_file}' to exist...")

        time.sleep(polling_interval)

if __name__ == "__main__":
    stream_file = "output.txt"     # The file updated by the transcription simulation
    summary_file = "summary.txt"   # The file where the summary is written
    try:
        monitor_stream_for_deadtime_summary(stream_file, summary_file,
                                            polling_interval=1, dead_time_threshold=1)
    except KeyboardInterrupt:
        print("Real-time summarizer stopped.")
