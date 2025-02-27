from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import os
import requests
import json
from dotenv import load_dotenv
from utils import prepare_messages_with_documents

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
        document_paths = data.get('documents', [])
        
        # Prepare messages for OpenRouter API, including documents if provided
        if document_paths:
            formatted_messages = prepare_messages_with_documents(messages, system_prompt, document_paths)
        else:
            formatted_messages = [{"role": "system", "content": system_prompt}] + messages
        
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

@app.route('/api/chat/stream', methods=['POST'])
def stream_chat():
    try:
        data = request.json
        
        # Extract data from request
        messages = data.get('messages', [])
        system_prompt = data.get('systemPrompt', "You are a helpful assistant.")
        temperature = data.get('temperature', 0.2)
        document_paths = data.get('documents', [])
        
        # Prepare messages for OpenRouter API, including documents if provided
        if document_paths:
            formatted_messages = prepare_messages_with_documents(messages, system_prompt, document_paths)
        else:
            formatted_messages = [{"role": "system", "content": system_prompt}] + messages
        
        # Prepare request payload
        payload = {
            "model": "deepseek/deepseek-chat:free",
            "messages": formatted_messages,
            "temperature": temperature,
            "stream": True
        }
        
        # Set headers
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://orange-llm-studio.com"  # Replace with your actual domain
        }
        
        def generate():
            # Make request to OpenRouter API with streaming
            with requests.post(
                OPENROUTER_API_URL,
                headers=headers,
                json=payload,
                stream=True
            ) as response:
                response.raise_for_status()
                
                for line in response.iter_lines():
                    if line:
                        line_text = line.decode('utf-8')
                        
                        # Skip the "data: " prefix if present
                        if line_text.startswith('data: '):
                            line_text = line_text[6:]
                        
                        # Skip empty lines or "[DONE]" message
                        if line_text == '' or line_text == '[DONE]':
                            continue
                        
                        try:
                            chunk = json.loads(line_text)
                            
                            # Extract delta content if available
                            if 'choices' in chunk and len(chunk['choices']) > 0:
                                delta = chunk['choices'][0].get('delta', {})
                                content = delta.get('content', '')
                                
                                if content:
                                    yield f"data: {json.dumps({'content': content})}\n\n"
                        except json.JSONDecodeError:
                            continue
                
                # Signal the end of the stream
                yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
        
        return Response(stream_with_context(generate()), content_type='text/event-stream')
    
    except Exception as e:
        return Response(f"data: {json.dumps({'error': str(e)})}\n\n", content_type='text/event-stream')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Backend is running"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 