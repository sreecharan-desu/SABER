# 🚀 SABER API - Quick Reference Card

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

## Quick Start

### 1. Get Test Tokens
```bash
ts-node scripts/generate-test-tokens.ts
```

### 2. Test Health
```bash
curl http://localhost:3000/health
```

---

## 📱 Candidate Endpoints

### Update Intent
```bash
POST /intent
{
  "intent_text": "Looking for backend roles",
  "why_text": "I love distributed systems"
}
```

### Update Constraints
```bash
POST /constraints
{
  "preferred_salary": 120000,
  "preferred_locations": ["SF", "NYC"],
  "remote_only": true
}
```

### Get Job Feed
```bash
GET /jobs/feed
→ Returns: { jobs: [...] }
```

### Swipe on Job
```bash
POST /swipe
{
  "job_id": "uuid",
  "direction": "right" | "left"
}
```

---

## 💼 Recruiter Endpoints

### Create Company
```bash
POST /company
{
  "name": "My Startup",
  "website": "https://mystartup.com"
}
```

### Create Job
```bash
POST /job
{
  "company_id": "uuid",
  "problem_statement": "...",
  "expectations": "...",
  "non_negotiables": "...",
  "deal_breakers": "...",
  "skills_required": ["Go", "K8s"],
  "constraints_json": {
    "salary_range": [100000, 180000],
    "experience_years": 5,
    "location": "SF"
  }
}
```

### Get Candidate Feed
```bash
GET /recruiter/feed
→ Returns: { candidates: [...] }
```

### Swipe on Candidate
```bash
POST /recruiter/swipe
{
  "job_id": "uuid",
  "target_user_id": "uuid",
  "direction": "right" | "left"
}
```

---

## 💬 Shared Endpoints

### Get Matches
```bash
GET /matches
→ Returns: { matches: [...] }
```

### Send Message
```bash
POST /messages
{
  "match_id": "uuid",
  "content": "Hi! Interested in this role"
}
```

---

## 🤖 AI Endpoints

**Requires:** `X-API-KEY: <AI_KEY>` header

```bash
GET /ai/data/users
GET /ai/data/jobs
GET /ai/data/swipes
GET /ai/data/matches

POST /ai/recommendations/update
{
  "user_id": "uuid",
  "positive_signals": {...},
  "negative_signals": {...},
  "suppression_rules": {...}
}
```

---

## ⚠️ Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 429 | Rate Limited (10 right swipes/day) |
| 500 | Server Error |

---

## 🎯 Common Patterns

### Making Authenticated Request
```javascript
const response = await fetch('http://localhost:3000/jobs/feed', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Handling Errors
```javascript
if (!response.ok) {
  const error = await response.json();
  console.error(error.error);
}
```

### Storing Token
```javascript
localStorage.setItem('token', jwtToken);
```

---

## 📊 Response Formats

### Job Feed
```json
{
  "jobs": [
    {
      "id": "uuid",
      "problem_statement": "...",
      "expectations": "...",
      "skills_required": ["React", "Node.js"],
      "constraints": {
        "location": "SF",
        "salary_range": [80000, 150000],
        "experience_years": 5
      }
    }
  ]
}
```

### Match
```json
{
  "matches": [
    {
      "id": "uuid",
      "candidate_id": "uuid",
      "job_id": "uuid",
      "reveal_status": true,
      "explainability_json": {
        "reason": "Strong skill overlap",
        "score": 0.92
      },
      "job": { "company": {...}, ... },
      "candidate": { "name": "...", "skills": [...] },
      "messages": [...]
    }
  ]
}
```

---

## 🔧 Testing Commands

### Run All Tests
```bash
./scripts/test-all-endpoints.sh
```

### Test Single Endpoint
```bash
curl -X GET http://localhost:3000/jobs/feed \
  -H "Authorization: Bearer $CANDIDATE_TOKEN"
```

---

## 💡 Tips

1. **Token Expiration:** Tokens expire in 7 days
2. **Daily Limits:** 10 right swipes per day per user
3. **Privacy:** Company names hidden until match
4. **Matching:** Both parties must swipe right
5. **AI Feed:** Jobs ranked by skill overlap

---

**Full Documentation:** See `COMPLETE_API_TEST_REPORT.md`
