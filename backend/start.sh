#!/bin/bash
echo "Starting Orange LLM Studio Backend..."

# Run setup script to copy .env file
python setup.py

# Start the server
python server.py 