# Orange LLM Studio Backend

This is a simple Flask backend for the Orange LLM Studio chat interface. It connects to the OpenRouter API to use the deepseek/deepseek-chat:free model.

## Setup

1. Make sure you have Python 3.8+ installed.
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Make sure the `.env` file is in the root directory with your OpenRouter API key:

```
OPENROUTER_API_KEY=your_api_key_here
```

## Running the Server

To start the server, run:

```bash
python server.py
```

This will start the Flask server on port 5000 by default. You can change the port by setting the `PORT` environment variable.

## API Endpoints

### Health Check

```
GET /api/health
```

Returns a simple health check response to verify the server is running.

### Chat (Non-streaming)

```
POST /api/chat
```

Request body:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "systemPrompt": "You are a helpful assistant.",
  "temperature": 0.2
}
```

### Chat (Streaming)

```
POST /api/chat/stream
```

Request body is the same as the non-streaming endpoint, but the response is streamed as Server-Sent Events (SSE).

## Integration with Frontend

The frontend should make requests to these endpoints to communicate with the LLM. The streaming endpoint can be used for a more interactive experience where the response appears word by word.

## Error Handling

The API will return appropriate error messages if:
- The OpenRouter API key is missing
- The request to OpenRouter fails
- There's an issue with processing the request or response

## Security

Make sure to keep your OpenRouter API key secure and not expose it in client-side code. 