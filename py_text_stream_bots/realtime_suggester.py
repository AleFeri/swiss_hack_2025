import os
import json
import time
from pydantic import BaseModel, ValidationError
from openai import OpenAI


class ProductID(BaseModel):
    product_id: int
    reasoning: str


class ResponseFormat(BaseModel):
    product_ids: list[ProductID]


class RealTimeSuggester:
    user_data = ""
    product_data = ""
    model = "gpt-4o-mini"

    PRODUCT_SUGGESTION_FILE = "product_suggestions.txt"

    def __init__(self, user_data = None, product_data = None, model="gpt-4o-mini"):
        self.user_data = self.read_from_file("user_data.txt") if not user_data else user_data
        self.product_data = self.read_from_file("product_data.txt") if not product_data else product_data
        self.model = model
        self.open_ai_client = OpenAI(api_key=os.getenv(
            "OPENAI_API_KEY",
            "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"
        ))

    def read_from_file(self, file_path: str):
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read()
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            return None

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
            response = self.open_ai_client.beta.chat.completions.parse(
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

            suggestions = ResponseFormat.model_validate_json(raw_text)
            return suggestions
        except Exception as e:
            print(f"Error during LLM request: {e}")
            return None

    def get_product_suggestions(self, conversation):
        if not self.user_data or not self.product_data or not conversation:
            return None

        suggestions = self.generate_product_suggestions(self.user_data, conversation, self.product_data)

        if suggestions and suggestions.product_ids:
            suggestions_json = json.dumps(suggestions.model_dump(), indent=2)
            return suggestions_json
        return None

if __name__ == "__main__":
    bot = RealTimeSuggester()
    try:
        while True:
            convo = bot.read_from_file("output.txt")
            suggested_products = bot.get_product_suggestions(convo)
            if suggested_products:
                print("Suggested products:", suggested_products)
            else:
                print("No product suggestions generated.")
            time.sleep(10)
    except Exception:
        print("Something went wrong")
