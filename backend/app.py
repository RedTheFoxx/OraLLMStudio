from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API key from environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY not found in environment variables")

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        
        # Extract data from request
        messages = data.get('messages', [])
        system_prompt = data.get('systemPrompt', "You are a helpful assistant.")
        temperature = data.get('temperature', 0.2)
        
        # Prepare messages for OpenRouter API
        formatted_messages = []
        
        # Add system message if provided
        if system_prompt:
            formatted_messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        # Add conversation messages
        for message in messages:
            formatted_messages.append({
                "role": message["role"],
                "content": message["content"]
            })
        
        # Prepare request payload
        payload = {
            "model": "deepseek/deepseek-chat:free",
            "messages": formatted_messages,
            "temperature": temperature,
            "stream": False
        }
        
        # Set headers
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://orange-llm-studio.com"  # Replace with your actual domain
        }
        
        # Make request to OpenRouter API
        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=payload
        )
        
        # Check if request was successful
        response.raise_for_status()
        
        # Parse response
        result = response.json()
        
        # Extract assistant's message
        assistant_message = result["choices"][0]["message"]["content"]
        
        return jsonify({
            "message": assistant_message,
            "model": result.get("model", "deepseek/deepseek-chat:free")
        })
    
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"API request failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Backend is running"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 