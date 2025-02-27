/**
 * API client for communicating with the backend chat service
 */

import type { Message } from '../page';
import type { Agent } from '../AgentContext';

// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Send a chat message to the backend and get a response
 */
export async function sendChatMessage(
  messages: Message[],
  agent: Agent,
  temperature: number = 0.2,
  useStreaming: boolean = true
): Promise<{ message: string; model: string } | ReadableStream<Uint8Array>> {
  // Format messages for the API
  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  // Prepare request payload
  const payload = {
    messages: formattedMessages,
    systemPrompt: agent.systemPrompt,
    temperature,
    documents: agent.documents
  };

  // Determine endpoint based on streaming preference
  const endpoint = useStreaming ? `${API_BASE_URL}/chat/stream` : `${API_BASE_URL}/chat`;

  if (useStreaming) {
    // For streaming, return the response stream
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.body;
  } else {
    // For non-streaming, return the complete response
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  }
}

/**
 * Process a streaming response from the chat API
 * @param stream The response stream
 * @param onChunk Callback function for each chunk of text
 * @param onComplete Callback function when streaming is complete
 * @param onError Callback function for errors
 */
export async function processStreamingResponse(
  stream: ReadableStream<Uint8Array>,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete();
        break;
      }
      
      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });
      
      // Process SSE format (data: {...})
      const lines = chunk.split('\n\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            
            if (data.content === '[DONE]') {
              onComplete();
              return;
            }
            
            if (data.content) {
              onChunk(data.content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Check if the backend is healthy
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
} 