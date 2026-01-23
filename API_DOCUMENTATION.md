# 📡 SABER API Documentation

## Complete API Reference for Frontend Implementation

---

## 🔐 Authentication

All endpoints (except OAuth callbacks) require JWT authentication.

**Header:**
```
Authorization: Bearer <jwt_token>
```

---

## 💬 Messaging & Matches API

### Get All Matches
```http
GET /matches
```

**Description:** Get all matches for the current user (works for both candidates and recruiters)

**Response:**
```json
{
  "matches": [
    {
      "id": "match-uuid",
      "candidate_id": "user-uuid",
      "job_id": "job-uuid",
      "reveal_status": true,
      "explainability_json": {
        "score": 0.95,
        "reason": "Strong technical alignment..."
      },
      "created_at": "2024-01-23T10:00:00Z",
      "candidate": {
        "name": "John Doe",
        "photo_url": "https://...",
        "intent_text": "Looking for backend roles",
        "skills": [...]
      },
      "job": {
        "problem_statement": "Build scalable microservices",
        "company": {
          "name": "TechCorp"
        }
      },
      "messages": [
        {
          "id": "msg-uuid",
          "content": "Hi, interested in this role",
          "sender_id": "user-uuid",
          "created_at": "2024-01-23T10:05:00Z"
        }
      ]
    }
  ]
}
```

### Send Message
```http
POST /matches/messages
```

**Body:**
```json
{
  "match_id": "match-uuid",
  "content": "Your message here"
}
```

**Response:**
```json
{
  "id": "msg-uuid",
  "match_id": "match-uuid",
  "sender_id": "user-uuid",
  "content": "Your message here",
  "created_at": "2024-01-23T10:05:00Z"
}
```

**Notes:**
- Both candidates and recruiters can send messages
- System verifies you're a participant in the match
- Messages are ordered by `created_at`

---

## 🔖 Bookmarks API (Candidate)

### Get All Bookmarks
```http
GET /candidates/bookmarks
```

**Description:** Get all jobs bookmarked by the current user

**Response:**
```json
{
  "bookmarks": [
    {
      "id": "bookmark-uuid",
      "user_id": "user-uuid",
      "job_id": "job-uuid",
      "notes": "Interesting backend role",
      "created_at": "2024-01-23T09:00:00Z",
      "job": {
        "id": "job-uuid",
        "problem_statement": "Build scalable APIs",
        "expectations": "5+ years experience",
        "skills_required": ["Node.js", "PostgreSQL"],
        "constraints_json": {
          "location": "Remote",
          "salary_range": [100000, 150000]
        },
        "company": {
          "name": "TechCorp",
          "website": "https://techcorp.com"
        }
      }
    }
  ]
}
```

### Create/Update Bookmark
```http
POST /candidates/bookmarks
```

**Body:**
```json
{
  "job_id": "job-uuid",
  "notes": "Optional notes about why you bookmarked this"
}
```

**Response:**
```json
{
  "bookmark": {
    "id": "bookmark-uuid",
    "user_id": "user-uuid",
    "job_id": "job-uuid",
    "notes": "Optional notes...",
    "created_at": "2024-01-23T09:00:00Z",
    "job": {...}
  },
  "message": "Job bookmarked successfully"
}
```

**Notes:**
- If bookmark already exists, updates the notes
- Bookmarking doesn't notify the company
- Use this to save jobs for later review

### Delete Bookmark
```http
DELETE /candidates/bookmarks/:job_id
```

**Response:**
```json
{
  "success": true,
  "message": "Bookmark removed"
}
```

---

## 📝 Applications API (Candidate)

### Get All Applications
```http
GET /candidates/applications?status=pending
```

**Query Parameters:**
- `status` (optional): Filter by status
  - `pending` - Just submitted
  - `reviewing` - Under review
  - `interview` - Interview scheduled
  - `accepted` - Offer extended
  - `rejected` - Not selected
  - `withdrawn` - Candidate withdrew

**Response:**
```json
{
  "applications": [
    {
      "id": "app-uuid",
      "user_id": "user-uuid",
      "job_id": "job-uuid",
      "status": "reviewing",
      "cover_note": "I'm excited about this opportunity...",
      "created_at": "2024-01-23T08:00:00Z",
      "updated_at": "2024-01-23T09:00:00Z",
      "job": {
        "id": "job-uuid",
        "problem_statement": "Build scalable APIs",
        "company": {
          "name": "TechCorp",
          "email": "hiring@techcorp.com"
        }
      }
    }
  ]
}
```

### Submit Application
```http
POST /candidates/applications
```

**Body:**
```json
{
  "job_id": "job-uuid",
  "cover_note": "Optional cover letter or note to the company"
}
```

**Response:**
```json
{
  "application": {
    "id": "app-uuid",
    "user_id": "user-uuid",
    "job_id": "job-uuid",
    "status": "pending",
    "cover_note": "Optional cover letter...",
    "created_at": "2024-01-23T08:00:00Z",
    "updated_at": "2024-01-23T08:00:00Z",
    "job": {...}
  },
  "message": "Application submitted successfully"
}
```

**Email Notification:**
- If company has email configured, they receive:
  - Candidate name and email
  - Job title
  - Cover note
  - Application ID
  - Link to view full profile

**Error Responses:**
```json
// Job not found
{ "error": "Job not found" }

// Job inactive
{ "error": "This job is no longer active" }

// Already applied
{ "error": "You have already applied to this job" }
```

### Withdraw Application
```http
DELETE /candidates/applications/:application_id
```

**Response:**
```json
{
  "success": true,
  "message": "Application withdrawn"
}
```

**Notes:**
- Can only withdraw if status is `pending`, `reviewing`, or `interview`
- Cannot withdraw `accepted` or `rejected` applications

---

## 👔 Recruiter: Manage Applications

### Get Applications for a Job
```http
GET /candidates/jobs/:job_id/applications?status=pending
```

**Query Parameters:**
- `status` (optional): Filter by status

**Response:**
```json
{
  "applications": [
    {
      "id": "app-uuid",
      "user_id": "user-uuid",
      "job_id": "job-uuid",
      "status": "pending",
      "cover_note": "I'm excited...",
      "created_at": "2024-01-23T08:00:00Z",
      "updated_at": "2024-01-23T08:00:00Z",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "photo_url": "https://...",
        "intent_text": "Looking for backend roles",
        "skills": [
          {
            "name": "Node.js",
            "source": "github",
            "confidence_score": 0.95
          }
        ]
      }
    }
  ]
}
```

**Authorization:**
- Must be the recruiter who owns the job's company

### Update Application Status
```http
PUT /candidates/applications/:application_id/status
```

**Body:**
```json
{
  "status": "interview"
}
```

**Valid Statuses:**
- `pending`
- `reviewing`
- `interview`
- `accepted`
- `rejected`

**Response:**
```json
{
  "application": {
    "id": "app-uuid",
    "status": "interview",
    "updated_at": "2024-01-23T10:00:00Z",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "job": {...}
  },
  "message": "Application status updated"
}
```

**Authorization:**
- Must be the recruiter who owns the job's company

---

## 🎯 Frontend Implementation Guide

### React/TypeScript Example

#### 1. API Client Setup
```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### 2. Bookmarks Hook
```typescript
// hooks/useBookmarks.ts
import { useState, useEffect } from 'react';
import api from '../lib/api';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/candidates/bookmarks');
      setBookmarks(data.bookmarks);
    } catch (err) {
      console.error('Failed to fetch bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (jobId: string, notes?: string) => {
    try {
      const { data } = await api.post('/candidates/bookmarks', {
        job_id: jobId,
        notes
      });
      await fetchBookmarks(); // Refresh list
      return data;
    } catch (err) {
      console.error('Failed to bookmark', err);
      throw err;
    }
  };

  const removeBookmark = async (jobId: string) => {
    try {
      await api.delete(`/candidates/bookmarks/${jobId}`);
      await fetchBookmarks(); // Refresh list
    } catch (err) {
      console.error('Failed to remove bookmark', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return { bookmarks, loading, addBookmark, removeBookmark, refetch: fetchBookmarks };
};
```

#### 3. Applications Hook
```typescript
// hooks/useApplications.ts
import { useState, useEffect } from 'react';
import api from '../lib/api';

export const useApplications = (status?: string) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const { data } = await api.get('/candidates/applications', { params });
      setApplications(data.applications);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (jobId: string, coverNote?: string) => {
    try {
      const { data } = await api.post('/candidates/applications', {
        job_id: jobId,
        cover_note: coverNote
      });
      await fetchApplications(); // Refresh list
      return data;
    } catch (err) {
      console.error('Failed to submit application', err);
      throw err;
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    try {
      await api.delete(`/candidates/applications/${applicationId}`);
      await fetchApplications(); // Refresh list
    } catch (err) {
      console.error('Failed to withdraw application', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [status]);

  return { applications, loading, submitApplication, withdrawApplication, refetch: fetchApplications };
};
```

#### 4. Messaging Hook
```typescript
// hooks/useMessages.ts
import { useState, useEffect } from 'react';
import api from '../lib/api';

export const useMessages = (matchId: string) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string) => {
    try {
      const { data } = await api.post('/matches/messages', {
        match_id: matchId,
        content
      });
      setMessages(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to send message', err);
      throw err;
    }
  };

  return { messages, loading, sendMessage };
};
```

#### 5. Component Examples

**Bookmark Button:**
```tsx
const BookmarkButton = ({ jobId }: { jobId: string }) => {
  const { addBookmark, removeBookmark } = useBookmarks();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleToggle = async () => {
    if (isBookmarked) {
      await removeBookmark(jobId);
    } else {
      await addBookmark(jobId);
    }
    setIsBookmarked(!isBookmarked);
  };

  return (
    <button onClick={handleToggle}>
      {isBookmarked ? '🔖 Bookmarked' : '📑 Bookmark'}
    </button>
  );
};
```

**Application Form:**
```tsx
const ApplicationForm = ({ jobId }: { jobId: string }) => {
  const { submitApplication } = useApplications();
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitApplication(jobId, coverNote);
      alert('Application submitted!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={coverNote}
        onChange={(e) => setCoverNote(e.target.value)}
        placeholder="Why are you interested in this role?"
      />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Apply Now'}
      </button>
    </form>
  );
};
```

---

## 📊 Status Flow Diagram

```
Application Lifecycle:
┌─────────┐
│ pending │ ──┐
└─────────┘   │
              ▼
         ┌───────────┐
         │ reviewing │ ──┐
         └───────────┘   │
                         ▼
                    ┌───────────┐
                    │ interview │ ──┬──▶ ┌──────────┐
                    └───────────┘   │    │ accepted │
                                    │    └──────────┘
                                    │
                                    └──▶ ┌──────────┐
                                         │ rejected │
                                         └──────────┘

Candidate can withdraw at any stage before accepted/rejected
```

---

## 🔔 Email Notifications

### Match Notification (Existing)
**Trigger:** When a mutual match is created  
**Recipient:** Candidate  
**Contains:**
- Company name
- Job problem statement
- Link to view match

### Application Notification (New)
**Trigger:** When candidate submits application  
**Recipient:** Company (if email configured)  
**Contains:**
- Candidate name and email
- Job title
- Cover note
- Application ID
- Link to dashboard

---

## 🚀 Quick Start Checklist

- [ ] Run `npx prisma migrate dev` to create new tables
- [ ] Configure company emails in database
- [ ] Implement bookmark UI in job listings
- [ ] Add "Apply" button to job details
- [ ] Create applications dashboard for candidates
- [ ] Build recruiter application management view
- [ ] Test email notifications
- [ ] Add status badges to application list

---

## 📝 Notes

- **Bookmarks** are private and don't notify anyone
- **Applications** trigger email if company has email configured
- **Messages** work for both candidates and recruiters in matches
- All endpoints require authentication
- Recruiters can only manage applications for their own jobs
- Candidates can only withdraw applications before final decision

---

**Last Updated:** January 23, 2026  
**API Version:** 1.2.0
