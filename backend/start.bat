@echo off
echo Starting Orange LLM Studio Backend...

REM Run setup script to copy .env file
python setup.py

REM Start the server
python server.py 