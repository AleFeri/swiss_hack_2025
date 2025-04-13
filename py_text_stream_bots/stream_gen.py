import time
import re

def parse_timestamp(line):
    """
    Parse a timestamp at the beginning of a line in HH:MM:SS format.
    Returns the time in seconds since 00:00:00, or None if no timestamp is found.
    """
    # Match a pattern like "00:00:05" at the beginning of the line.
    match = re.match(r'^(\d{2}):(\d{2}):(\d{2})', line)
    if match:
        hours, minutes, seconds = map(int, match.groups())
        return hours * 3600 + minutes * 60 + seconds
    return None

def simulate_stream(input_file, output_file, scale_factor=1.0):
    """
    Reads from input_file and writes lines to output_file with a simulated delay.

    :param input_file: Path to the transcript file.
    :param output_file: Path to the file where output will be written ("streamed").
    :param scale_factor: Multiplier for delays. Use a value less than 1 to speed up simulation.
    """
    with open(input_file, 'r') as fin, open(output_file, 'w') as fout:
        prev_timestamp = None
        for line in fin:
            # Extract current timestamp if present
            current_timestamp = parse_timestamp(line)

            # If both previous and current timestamps exist, compute the delay
            if prev_timestamp is not None and current_timestamp is not None:
                delay = (current_timestamp - prev_timestamp) * scale_factor
                if delay > 0:
                    time.sleep(delay)

            # Write the current line to the output file and flush immediately to simulate stream writing.
            fout.write(line)
            fout.flush()

            # For debugging or live feedback, you could also print the line.
            print(line, end='')

            # Update previous timestamp if a valid one was found; otherwise, maintain the last valid value.
            if current_timestamp is not None:
                prev_timestamp = current_timestamp

if __name__ == "__main__":
    # You can change the file paths and scale factor as needed.
    # Example: using scale_factor=0.1 will make the waiting time 10 times faster than the original delay.
    simulate_stream('input.txt', 'output.txt', scale_factor=0.1)
