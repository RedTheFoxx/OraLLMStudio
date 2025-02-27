import os
import json
from typing import List, Dict, Any

def extract_text_from_file(file_path: str) -> str:
    """
    Extract text content from a file based on its extension.
    Currently supports: .txt, .md, .json
    
    Args:
        file_path: Path to the file
        
    Returns:
        Extracted text content
    """
    if not os.path.exists(file_path):
        return f"File not found: {file_path}"
    
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    
    try:
        if ext in ['.txt', '.md']:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        elif ext == '.json':
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return json.dumps(data, indent=2)
        else:
            return f"Unsupported file type: {ext}"
    except Exception as e:
        return f"Error reading file: {str(e)}"

def format_documents_for_context(documents: List[str], max_tokens: int = 4000) -> str:
    """
    Format a list of document contents into a single context string,
    respecting a maximum token limit.
    
    Args:
        documents: List of document contents
        max_tokens: Approximate maximum number of tokens to include
        
    Returns:
        Formatted context string
    """
    # Simple approximation: 1 token ≈ 4 characters
    char_limit = max_tokens * 4
    
    result = []
    current_length = 0
    
    for i, doc in enumerate(documents):
        doc_header = f"\n--- DOCUMENT {i+1} ---\n"
        doc_content = f"{doc_header}{doc}"
        doc_length = len(doc_content)
        
        if current_length + doc_length <= char_limit:
            result.append(doc_content)
            current_length += doc_length
        else:
            # If the document is too large, truncate it
            available_chars = char_limit - current_length - len(doc_header)
            if available_chars > 100:  # Only include if we can add a meaningful chunk
                truncated_doc = doc[:available_chars] + "... [TRUNCATED]"
                result.append(f"{doc_header}{truncated_doc}")
            break
    
    return "\n".join(result)

def prepare_messages_with_documents(
    messages: List[Dict[str, str]], 
    system_prompt: str, 
    document_paths: List[str]
) -> List[Dict[str, str]]:
    """
    Prepare messages for the LLM, including document contents as context.
    
    Args:
        messages: List of message dictionaries with 'role' and 'content'
        system_prompt: System prompt to use
        document_paths: List of paths to documents to include
        
    Returns:
        List of messages with document context added
    """
    formatted_messages = []
    
    # Extract text from documents
    document_contents = []
    for path in document_paths:
        content = extract_text_from_file(path)
        if not content.startswith("Error") and not content.startswith("File not found"):
            document_contents.append(content)
    
    # Format document context
    if document_contents:
        document_context = format_documents_for_context(document_contents)
        context_message = (
            f"The following documents are provided for reference:\n\n{document_context}\n\n"
            "Please use this information to inform your responses when relevant."
        )
        
        # Add system message with documents
        formatted_messages.append({
            "role": "system",
            "content": f"{system_prompt}\n\n{context_message}"
        })
    else:
        # Add system message without documents
        formatted_messages.append({
            "role": "system",
            "content": system_prompt
        })
    
    # Add conversation messages
    formatted_messages.extend(messages)
    
    return formatted_messages 