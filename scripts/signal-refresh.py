import requests
import os
import sys
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")

if not API_KEY or not BASE_URL:
    print("Error: API_KEY or BASE_URL not set in environment.")
    sys.exit(1)

def trigger_refresh():
    url = f"{BASE_URL}/ai/refresh-signals"
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    print(f"Triggering global signal refresh at {url}...")
    try:
        response = requests.post(url, headers=headers)
        if response.status_code == 202:
            print("Successfully initiated refresh cycle.")
            print("Response:", response.json())
        else:
            print(f"Failed to trigger refresh. Status: {response.status_code}")
            print("Error Details:", response.text)
            sys.exit(1)
    except Exception as e:
        print(f"Error during request: {e}")
        sys.exit(1)

if __name__ == "__main__":
    trigger_refresh()
