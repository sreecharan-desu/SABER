# Recruiter API Documentation

## Overview

The Recruiter API provides endpoints for recruiters to manage companies, create job postings, view candidate feeds, and swipe on candidates. This module implements the recruiter-side functionality of the SABER job matching platform.

**Files:**

- `src/controllers/recruiter.controller.ts` - Business logic for recruiter operations
- `src/routes/recruiter.routes.ts` - Route definitions and middleware configuration

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Business Logic](#business-logic)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Authentication & Authorization

All recruiter endpoints require:

- **JWT Authentication**: Valid JWT token in `Authorization` header
- **Role-Based Access**: User must have `recruiter` role
- **Middleware Chain**: `authenticateJWT` → `requireRole(['recruiter'])`

### Example Request Header

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## API Endpoints

### 1. Create Company

**Endpoint:** `POST /recruiters/company`

**Description:** Creates a new company profile associated with the authenticated recruiter.

**Request Body:**

```typescript
{
  name: string;        // Required: Company name
  website?: string;    // Optional: Company website URL
}
```

**Response:**

```typescript
{
  company: {
    id: string;
    company_id: string;
    name: string;
    website: string | null;
    recruiter_id: string;
    created_at: Date;
    updated_at: Date;
  },
  user: {
    id: string;
    role: string;
    name: string;
    email: string;
    photo_url: string | null;
    intent_text: string | null;
    why_text: string | null;
    constraints_json: object | null;
    onboarding: boolean;
    company_id: string;  // Now populated with the newly created company
    oauth_accounts: Array<{
      id: string;
      provider: string;
    }>;
  }
}
```

**Status Codes:**

- `200 OK` - Company created successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid JWT
- `403 Forbidden` - User is not a recruiter

---

### 2. Create Job Posting

**Endpoint:** `POST /recruiters/job`

**Description:** Creates a new job posting for a company owned by the recruiter. Includes automatic validation of company ownership and cache invalidation.

**Request Body:**

```typescript
{
  company_id: string;              // Required: Company ID (must be owned by recruiter)
  problem_statement: string;       // Required: Job description/problem to solve
  expectations: string;            // Required: What the company expects
  non_negotiables: string;         // Required: Must-have requirements
  deal_breakers: string;           // Required: Automatic disqualifiers
  skills_required: string[];       // Required: Array of required skills
  constraints_json: {              // Required: Job constraints (location, salary, etc.)
    [key: string]: any;
  };
}
```

**Response:**

```typescript
{
  id: string;
  company_id: string;
  problem_statement: string;
  expectations: string;
  non_negotiables: string;
  deal_breakers: string;
  skills_required: string[];
  constraints_json: Record<string, any>;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

---

### 3. Get Recruiter Feed

**Endpoint:** `GET /recruiters/feed`

**Description:** Returns a feed of candidates who match the recruiter's active job postings and haven't been swiped yet.

**Matching Logic:**

1. Fetches all active jobs for companies owned by the recruiter.
2. Retrieves all candidates with role `candidate`.
3. Filters out candidates already swiped for each job.
4. Applies hard constraint matching.

**Response:**

```typescript
{
  candidates: Array<{
    candidate_id: string;
    intent_text: string;
    skills: Array<{
      id: string;
      name: string;
      proficiency: string;
    }>;
    relevant_job_id: string;
  }>;
}
```

---

### 4. Recruiter Swipe

**Endpoint:** `POST /recruiters/swipe`

**Description:** Records a recruiter's swipe (left/right) on a candidate for a specific job. Creates a match if mutual interest exists.

**Rate Limiting:** Subject to swipe rate limiter.

**Request Body:**

```typescript
{
  job_id: string;
  target_user_id: string;
  direction: "left" | "right";
}
```

**Response:**

```typescript
{
  success: true;
}
```

---

### 5. Get My Jobs

**Endpoint:** `GET /recruiters/jobs`

**Description:** Retrieves all job postings created by the companies owned by the recruiter.

---

### 6. Update Job

**Endpoint:** `PUT /recruiters/job/:id`

**Description:** Updates an existing job posting. Verifies ownership before applying changes.

---

### 7. Delete Job

**Endpoint:** `DELETE /recruiters/job/:id`

**Description:** Deletes a job posting and all associated data (swipes, matches, messages).

---

### 8. Get Signals of Interest

**Endpoint:** `GET /recruiters/signals`

**Description:** Returns a list of candidates who have expressed interest (swiped right) on the recruiter's jobs but haven't been swiped back yet.

---

### 9. Update Company Images

**Endpoint:** `PUT /recruiters/company/images`

**Description:** Uploads logo or cover images for the recruiter's company using multipart/form-data.

---

## Data Models

### Company Schema

Validates company creation input.

### Job Schema

Validates job posting creation, including required fields and JSON constraints.

---

## Business Logic

### Constraint Matching

The platform uses a hard constraint matching system where a candidate's constraints must be satisfied by the job's parameters for them to appear in the recruiter's feed.

### Match Creation

Matches are created asynchronously within a database transaction when a mutual "right" swipe is detected between a recruiter (for a specific job) and a candidate.

---

**Last Updated:** 2026-01-22  
**API Version:** 1.0  
**Maintainer:** SABER Development Team
