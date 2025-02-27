import os
import shutil
import sys

def setup_backend():
    """
    Setup script for the backend:
    1. Checks if .env file exists in the root directory
    2. Copies it to the backend directory if it doesn't exist there
    """
    # Get the root directory (one level up from backend)
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Check if .env exists in root
    root_env_path = os.path.join(root_dir, '.env')
    backend_env_path = os.path.join(backend_dir, '.env')
    
    if not os.path.exists(root_env_path):
        print("Error: .env file not found in the root directory.")
        sys.exit(1)
    
    # Copy .env to backend if it doesn't exist
    if not os.path.exists(backend_env_path):
        try:
            shutil.copy2(root_env_path, backend_env_path)
            print(f"Copied .env file from {root_env_path} to {backend_env_path}")
        except Exception as e:
            print(f"Error copying .env file: {str(e)}")
            sys.exit(1)
    else:
        print(f".env file already exists in {backend_dir}")
    
    print("Backend setup complete!")

if __name__ == "__main__":
    setup_backend() 