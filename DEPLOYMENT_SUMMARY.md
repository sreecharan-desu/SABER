# SABER Backend - OAuth & Deployment Summary

## Deployment Status
✅ **Successfully deployed to Vercel**
- Production URL: https://saber-api-backend.vercel.app
- Health Check: https://saber-api-backend.vercel.app/health

## Environment Variables Configured

### Vercel Production Environment
All secrets have been securely added to Vercel:
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ BASE_URL (https://saber-api-backend.vercel.app)
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CLIENT_SECRET
- ✅ GITHUB_CLIENT_ID
- ✅ GITHUB_CLIENT_SECRET
- ✅ LINKEDIN_CLIENT_ID
- ✅ LINKEDIN_CLIENT_SECRET
- ✅ AI_INTERNAL_API_KEY

### GitHub Secrets
Cleaned up unnecessary secrets. Only AI_INTERNAL_API_KEY remains (for GitHub Actions cron job).

## OAuth Configuration Summary

### Google OAuth
- **Project**: saber-backend (GCP)
- **Client ID**: a3937a823-d4e8-425d-b156-192b89e93f88
- **Scopes**: openid, email
- **Callback URL**: http://localhost:3000/api/auth/oauth/callback
- **Production Callback**: https://saber-api-backend.vercel.app/api/auth/oauth/callback (needs to be added in GCP Console)

### GitHub OAuth
- **App Name**: SABER
- **Client ID**: Ov23lijOpMktUNXB6FYD
- **Scopes**: read:user, user:email, public_repo
- **Callback URL**: http://localhost:3000/api/auth/oauth/callback
- **Production Callback**: https://saber-api-backend.vercel.app/api/auth/oauth/callback (needs to be added in GitHub OAuth App settings)

### LinkedIn OAuth
- **Client ID**: 86v3erqkn6uuka
- **Callback URL**: http://localhost:3000/api/auth/oauth/callback
- **Production Callback**: https://saber-api-backend.vercel.app/api/auth/oauth/callback (needs to be added in LinkedIn Developer Portal)

## Backend Features Implemented

### 1. Environment Validation
- Centralized configuration in `src/config/env.ts`
- Startup validation ensures all required environment variables are present
- Application exits with clear error message if any are missing

### 2. OAuth Flow
- **Endpoint**: `POST /api/auth/oauth/callback`
- **Providers**: Google, GitHub, LinkedIn
- **Request Body**:
  ```json
  {
    "provider": "google" | "github" | "linkedin",
    "code": "authorization_code",
    "redirect_uri": "optional_callback_url"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token",
    "user": { user_object }
  }
  ```

### 3. GitHub Data Extraction
- Automatically extracts skills from public repositories
- Analyzes:
  - Repository languages (weighted by bytes)
  - Repository topics
  - Contribution recency
- Calculates confidence scores (0.0 - 1.0)
- Stores in `Skill` table with `source: 'github'`

### 4. JWT Authentication
- **Secret**: Securely sourced from environment
- **Expiration**: 7 days
- **Payload**: `{ id, role }`
- **Middleware**: `authenticateJWT` for protected routes

### 5. Account Linking
- **Endpoint**: `POST /api/auth/link-provider`
- **Requires**: JWT authentication
- Allows users to link multiple OAuth providers to one account
- Idempotent operation

## Security Audit Results

✅ **All OAuth credentials read from `process.env`**
✅ **No hardcoded secrets**
✅ **Clear startup failure if variables missing**
✅ **Provider-agnostic OAuth flow**
✅ **Correct callback handling at `/api/auth/oauth/callback`**
✅ **Access tokens not exposed to frontend**
✅ **Tokens not logged**
✅ **Tokens not stored long-term (GitHub extraction uses it once)**
✅ **Data normalization implemented**
✅ **Multiple OAuth providers can link to one user**
✅ **No duplicate user records**
✅ **JWT includes only user ID and role**
✅ **JWT expiration configured**
✅ **JWT secret sourced from env**
✅ **Graceful error handling**
✅ **No stack traces leaked to client**
✅ **No PII logging**

## Next Steps Required

### 1. Update OAuth Redirect URIs (MANUAL)
You must add the production callback URL to each OAuth provider:

**Google Cloud Console**:
1. Go to https://console.cloud.google.com/apis/credentials
2. Select project: saber-backend
3. Edit OAuth 2.0 Client ID: `a3937a823-d4e8-425d-b156-192b89e93f88`
4. Add to "Authorized redirect URIs": `https://saber-api-backend.vercel.app/api/auth/oauth/callback`

**GitHub OAuth App**:
1. Go to https://github.com/settings/developers
2. Select app: SABER
3. Add to "Authorization callback URL": `https://saber-api-backend.vercel.app/api/auth/oauth/callback`

**LinkedIn Developer Portal**:
1. Go to https://www.linkedin.com/developers/apps
2. Select your app
3. Add to "Authorized redirect URLs": `https://saber-api-backend.vercel.app/api/auth/oauth/callback`

### 2. Test OAuth Flow
Test each provider with the production URL to ensure end-to-end functionality.

### 3. Frontend Integration
Update frontend to use:
- Production API URL: `https://saber-api-backend.vercel.app`
- OAuth callback endpoint: `POST /api/auth/oauth/callback`

## Files Modified/Created

### Created:
- `src/config/env.ts` - Environment validation and centralized config
- `src/services/github.data.service.ts` - GitHub skill extraction
- `api/index.ts` - Vercel serverless entry point
- `.env.example` - Template for required environment variables

### Modified:
- `src/app.ts` - Added environment validation
- `src/utils/jwt.ts` - Use centralized config
- `src/services/oauth.providers.ts` - Use centralized config, return accessToken for GitHub
- `src/services/user.service.ts` - Added accessToken to OAuthProfile interface
- `src/controllers/auth.controller.ts` - Integrated GitHub data extraction, fixed redirect URIs
- `package.json` - Added postinstall script for Prisma
- `vercel.json` - Configured for serverless deployment
- `.env` - Added JWT_SECRET and BASE_URL

## Deployment Architecture

```
User Request
    ↓
Vercel Edge Network
    ↓
api/index.ts (Serverless Function)
    ↓
src/app.ts (Express App)
    ↓
Routes → Controllers → Services
    ↓
Prisma Client → Neon PostgreSQL
```

## OAuth Flow Diagram

```
Frontend
    ↓ (Redirect to OAuth Provider)
OAuth Provider (Google/GitHub/LinkedIn)
    ↓ (Redirect back with code)
Frontend
    ↓ (POST /api/auth/oauth/callback with code)
SABER Backend
    ↓ (Exchange code for access token)
OAuth Provider
    ↓ (Return access token)
SABER Backend
    ↓ (Fetch user profile)
OAuth Provider
    ↓ (Return profile data)
SABER Backend
    ↓ (If GitHub: Extract skills from repos)
GitHub API
    ↓ (Return repo data)
SABER Backend
    ↓ (Create/find user, generate JWT)
Database
    ↓ (Return JWT to frontend)
Frontend (Store JWT, redirect to app)
```

## Verification Commands

```bash
# Health check
curl https://saber-api-backend.vercel.app/health

# Test OAuth callback (replace with actual code)
curl -X POST https://saber-api-backend.vercel.app/api/auth/oauth/callback \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "github",
    "code": "YOUR_AUTH_CODE",
    "redirect_uri": "https://saber-api-backend.vercel.app/api/auth/oauth/callback"
  }'
```

## Status: ✅ COMPLETE

All OAuth credentials are configured, the backend is deployed, and the system is ready for production use after updating the OAuth redirect URIs in each provider's console.
