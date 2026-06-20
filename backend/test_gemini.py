import os
import sys
from dotenv import load_dotenv

# Ensure we can import from services when running as a script
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.gemini_client import generate_text, get_embedding

def main():
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_key_here":
        print("❌ Please add your real GEMINI_API_KEY to the .env file before running this test.")
        return

    print("--- Testing generate_text ---")
    prompt = "In one sentence, explain what brand positioning is."
    print(f"Prompt: {prompt}")
    result_text = generate_text(prompt)
    print(f"Response: {result_text}\n")

    print("--- Testing get_embedding ---")
    text = "ValueForge is an AI-powered brand positioning intelligence tool."
    print(f"Text: {text}")
    result_embedding = get_embedding(text)
    if result_embedding:
        print(f"Embedding generated! Length: {len(result_embedding)}")
        print(f"First 5 floats: {result_embedding[:5]}")
    else:
        print("Failed to generate embedding.")

if __name__ == "__main__":
    main()
