import os
import time
import json
from pydantic import BaseModel, ValidationError
from openai import OpenAI
from itertools import product

# Initialize the OpenAI client.
client = OpenAI(api_key=os.getenv(
    "OPENAI_API_KEY",
    "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"
))

class ProductID(BaseModel):
    product_id: int
    reasoning: str

class ResponseFormat(BaseModel):
    product_ids: list[ProductID]

class PollingBot:
    semaphore = False
    polling_interval = 10 # seconds between process execution.

    def process(self):
        pass

    def start(self):
        try:
            while self.semaphore:
                self.process()
                time.sleep(self.polling_interval)
        except KeyboardInterrupt:
            self.semaphore = False
            print("Product suggestion bot stopped.")

    def stop(self):
        self.semaphore = False

class RealTimeSuggester(PollingBot):
    stream_file = "output.txt"
    user_data = ""
    product_data = ""
    model = "gpt-4o-mini"

    PRODUCT_SUGGESTION_FILE = "product_suggestions.txt"

    def __init__(self, stream_file_source, user_data, product_data, model="gpt-4o-mini"):
        self.stream_file = stream_file_source
        self.user_data = user_data
        self.product_data = product_data
        self.model = model

    def load_file_contents(self, file_path):
        """Utility to load file contents if the file exists."""
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding="utf-8") as f:
                return f.read()
        return ""

    def generate_product_suggestions(self, user_info, conversation, product_data):
        """
        Constructs a prompt merging user info, conversation, and product data.
        Calls the LLM to produce a JSON string that conforms to the ResponseFormat model.
        """
        prompt = f"""
            You are an expert financial advisor assistant.
            A client with the following profile is well known to the bank:
            ---
            {user_info}
            ---
            During a recent conversation, the following transcript was generated:
            ---
            {conversation}
            ---
            The bank offers the following products (with their IDs) to clients:

            Product Data:
            {product_data}

            Based on the client information and the realtime conversation, please provide a top list of up to 3 product suggestions.
            Return your response as a JSON object matching this schema:
            {{
            "product_ids": [
                {{
                    "product_id": <number>,
                    "reasoning": "<brief explanation for suggesting this product>"
                }}
            ]
            }}

            If no product is relevant, return "None" (without quotes).
            Only output the JSON object (or the word None), with no additional text.
        """
        try:
            response = client.beta.chat.completions.parse(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert financial advisor assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                n=1,
                response_format=ResponseFormat
            )
            raw_text = response.choices[0].message.content.strip()

            if raw_text.strip().lower() == "none":
                return None

            # Use model_validate_json for Pydantic V2
            suggestions = ResponseFormat.model_validate_json(raw_text)
            return suggestions
        except Exception as e:
            print(f"Error during LLM request: {e}")
            return None

    def update_product_suggestions(self):
        conversation = self.load_file_contents(self.stream_file)

        if not self.user_data:
            print("User data is missing. Please ensure the file exists.")
            return
        if not conversation:
            print("No conversation transcript yet.")
            return
        if not self.product_data:
            print("Product data is missing. Please provide a representation of your products.")
            return

        suggestions = self.generate_product_suggestions(self.user_data, conversation, self.product_data)

        if suggestions and suggestions.product_ids:
            # Use json.dumps with model_dump() for pretty-printed output.
            suggestions_json = json.dumps(suggestions.model_dump(), indent=2)
            with open(PRODUCT_SUGGESTION_FILE, 'w', encoding="utf-8") as f:
                f.write(suggestions_json)
            print(f"Updated product suggestions: {suggestions_json}")
        else:
            print("No suggestions returned.")

    def process(self):
        self.update_product_suggestions()
