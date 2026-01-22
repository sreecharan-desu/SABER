import requests
import os
import sys

# Configuration
API_URL = os.environ.get("API_BASE_URL", "http://localhost:3000")
API_KEY = os.environ.get("AI_INTERNAL_API_KEY")

if not API_KEY:
    print("CRITICAL: AI_INTERNAL_API_KEY is missing")
    sys.exit(1)

HEADERS = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def run_ai_job():
    print("🤖 Starting AI Recommendation Engine (Python)...")

    try:
        # 1. Fetch Users
        print("📥 Fetching Users...")
        users_resp = requests.get(f"{API_URL}/ai/data/users?limit=100", headers=HEADERS)
        users_resp.raise_for_status()
        users = users_resp.json().get("data", [])
        print(f"- Fetched {len(users)} users")

        # 2. Fetch Jobs
        print("📥 Fetching Jobs...")
        jobs_resp = requests.get(f"{API_URL}/ai/data/jobs?limit=100", headers=HEADERS)
        jobs_resp.raise_for_status()
        jobs = jobs_resp.json().get("data", [])
        print(f"- Fetched {len(jobs)} jobs")

        # 3. AI Logic Placeholder
        # The AI Engineer will implement the actual model/logic here.
        # For now, we mimic the update structure.
        print("🧠 Processing AI Model...")
        
        for user in users:
            # Example logic: specific users get specific signals
            # This is where the ML model would run
            
            payload = {
                "user_id": user["user_id"],
                "positive_signals": {
                    "model_version": "v1.0",
                    "inferred_skills": ["Python", "System Design"],
                    "score": 0.95
                },
                "negative_signals": {},
                "suppression_rules": {}
            }
            
            # 4. Push Updates
            print(f"- Updating recommendation for user {user['user_id']}...")
            update_resp = requests.post(
                f"{API_URL}/ai/recommendations/update", 
                json=payload, 
                headers=HEADERS
            )
            update_resp.raise_for_status()

        print("✨ AI Cycle Completed Successfully")

    except Exception as e:
        print(f"❌ AI Job Failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_ai_job()
