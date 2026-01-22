# Admin API Documentation

## Overview

The Admin API provides system-level management tools for administrators. These endpoints are designed for monitoring system performance and managing security credentials.

**Files:**
- `src/controllers/admin.controller.ts` - Business logic for administrative operations
- `src/routes/admin.routes.ts` - Route definitions for administration

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [API Endpoints](#api-endpoints)
3. [Security Considerations](#security-considerations)
4. [Logging & Auditing](#logging--auditing)

---

## Authentication & Authorization

All admin endpoints require:
- **JWT Authentication**: Valid JWT token in `Authorization` header
- **Role-Based Access**: User must have `admin` role
- **Middleware Chain**: `authenticateJWT` → `requireRole(['admin'])`

### Example Request Header
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## API Endpoints

### 1. Get System Metrics

**Endpoint:** `GET /api/admin/metrics`

**Description:** Provides an overview of the platform's performance metrics, including swipe activities, matches, and active participant counts.

**Response:**
```typescript
{
  overview: {
    total_swipes: number;      // Total number of swipes in the system
    total_matches: number;     // Total number of successful matches
    match_rate: string;        // Success rate percentage (e.g., "15.54%")
    active_jobs: number;       // Count of currently active job postings
    active_candidates: number; // Total number of candidate users
  },
  timestamp: string;           // ISO timestamp of the metrics report
}
```

**Status Codes:**
- `200 OK` - Metrics retrieved successfully
- `401 Unauthorized` - Missing or invalid JWT
- `403 Forbidden` - User does not have administrative privileges

**Example:**
```bash
curl -X GET https://api.saber.com/api/admin/metrics \
  -H "Authorization: Bearer <admin_token>"
```

---

### 2. Rotate AI Keys

**Endpoint:** `POST /api/admin/ai/keys`

**Description:** Generates a new internal API key for the AI/Cron services. This key is used for system-to-system communication.

**Important Notice:** The key is returned in the response **once**. It is not stored in plain text and cannot be retrieved again.

**Response:**
```typescript
{
  status: 'success',
  message: string;             // Guidance on key storage
  new_key: string;             // The generated API key (e.g., "ai_sk_...")
  generated_at: string;        // ISO timestamp
  note: string;                // Operational instructions
}
```

**Security Mechanism:**
1. Generates a random UUID-based key with prefix `ai_sk_`.
2. Hashes the key using SHA-256.
3. Persists the hash in the database.
4. Returns the raw key to the admin.

**Status Codes:**
- `200 OK` - Key successfully rotated
- `401 Unauthorized` - Missing or invalid JWT
- `403 Forbidden` - User does not have administrative privileges

**Example:**
```bash
curl -X POST https://api.saber.com/api/admin/ai/keys \
  -H "Authorization: Bearer <admin_token>"
```

---

## Security Considerations

1. **One-Time Key View**: The `rotateAIKeys` response contains the only instance of the secret key. System administrators must store this immediately in a secure vault (e.g., AWS Secrets Manager, Vercel Secrets).
2. **Key Hashing**: All internal API keys are stored as SHA-256 hashes. Even if the database is compromised, the actual keys remain secure.
3. **Role Enforcement**: The `requireRole(['admin'])` middleware prevents recruiters or candidates from accessing these system-wide metrics or rotating security keys.

---

## Logging & Auditing

The system automatically logs administrative actions for security audits:

- **Key Generation**: Logged as a `WARN` event with the ID of the administrator who performed the action.
- **Errors**: System errors during admin operations are captured by the global error handler and logged via the integrated logger.

---

**Last Updated:** 2026-01-22  
**API Version:** 1.0  
**Maintainer:** SABER Infrastructure Team
