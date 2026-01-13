"""
PDF to JSON Converter for Quiz Bank

This utility script extracts multiple-choice questions from a specific PDF format
and converts them into a JSON structure compatible with the Quiz Bank application.

Requirements:
    - pdfplumber library (`pip install pdfplumber`)
    - Source PDF file (default configured as "5.WBT MCQ bank.pdf")

Usage:
    Ensure the PDF file is in the same directory or update the `file_path` variable.
    Run the script: `python pdf_to_json_converter.py`
    The output will be saved to `extracted_questions.json`.
"""

import pdfplumber
import re
import json

def extract_questions_from_pdf(pdf_path):
    questions_data = []

    # State variables
    current_id = 1
    current_topic = "General" # Default topic if none is found immediately
    question_buffer = []
    options_buffer = {} # Dictionary to map 'a', 'b', 'c', 'd' to text
    current_option_key = None

    # Regex patterns
    # Matches "Topic: Brief history..."
    topic_pattern = re.compile(r'^Topic:\s*(.+)', re.IGNORECASE)
    # Matches "a) Option text" or "a. Option text"
    option_pattern = re.compile(r'^([a-d])[\)\.]\s*(.+)')
    # Matches "Answer: b) Text" or "Answer: b"
    answer_pattern = re.compile(r'^Answer:\s*([a-d])[\)\.]?\s*(.*)', re.IGNORECASE)
    # Matches simple page numbers or noise to ignore
    ignore_pattern = re.compile(r'^\s*([0-9]+|Page [0-9]+)\s*$', re.IGNORECASE)

    try:
        with pdfplumber.open(pdf_path) as pdf:
            # combine all pages into one text stream
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"

        lines = full_text.split('\n')

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Skip page numbers/noise
            if ignore_pattern.match(line):
                continue

            # 1. Check for Topic
            topic_match = topic_pattern.match(line)
            if topic_match:
                current_topic = topic_match.group(1).strip()
                continue

            # 2. Check for Answer
            # (We check answer before options because it marks the end of a question block)
            answer_match = answer_pattern.match(line)
            if answer_match:
                ans_char = answer_match.group(1).lower()
                ans_text_raw = answer_match.group(2).strip()

                # Determine the final answer text
                # Ideally, we look up the option text from our buffer using the answer character (a, b, c, d)
                final_answer_text = options_buffer.get(ans_char, ans_text_raw)

                # If the Answer line itself contained text (e.g. "Answer: b) 1970s"),
                # we can use that if the buffer lookup failed or is empty.
                if not final_answer_text and ans_text_raw:
                    final_answer_text = ans_text_raw

                # Construct the final object
                # Convert options dict values to a list in order [a, b, c, d]
                options_list = [options_buffer.get(k, "") for k in sorted(options_buffer.keys())]

                q_obj = {
                    "id": current_id,
                    "topic": current_topic,
                    "question": " ".join(question_buffer).strip(),
                    "options": options_list,
                    "answer": final_answer_text
                }

                # Only add if we actually have a question and options
                if q_obj["question"] and q_obj["options"]:
                    questions_data.append(q_obj)
                    current_id += 1

                # Reset buffers for the next question
                question_buffer = []
                options_buffer = {}
                current_option_key = None
                continue

            # 3. Check for Options (a), b), c), d))
            option_match = option_pattern.match(line)
            if option_match:
                opt_char = option_match.group(1).lower()
                opt_text = option_match.group(2).strip()

                options_buffer[opt_char] = opt_text
                current_option_key = opt_char
                continue

            # 4. Handle multiline content
            # If we are currently parsing an option, append text to that option
            if current_option_key:
                options_buffer[current_option_key] += " " + line
            else:
                # Otherwise, it's part of the question body
                question_buffer.append(line)

    except Exception as e:
        print(f"Error reading PDF: {e}")
        return []

    return questions_data

# --- Execution ---
file_path = "5.WBT MCQ bank.pdf" # Make sure this matches your file name
extracted_data = extract_questions_from_pdf(file_path)

# Print result as formatted JSON to console
print(json.dumps(extracted_data, indent=2))

# Optionally save to a file
with open("extracted_questions.json", "w", encoding="utf-8") as f:
    json.dump(extracted_data, f, indent=2)

print(f"\nSuccessfully extracted {len(extracted_data)} questions.")
