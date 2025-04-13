#!/bin/bash
# Description: This script starts stream_gen.py and realtime_suggester.py concurrently.

cd py_text_stream_bots

# Start stream_gen.py in the background
python3 stream_gen.py &

# Start realtime_suggester.py in the background
python3 realtime_suggester.py &

# Wait for both background processes to finish
wait

echo "Both scripts have terminated."
