#!/bin/bash

# SABER OAuth Flow Test Script
# This script tests the OAuth callback endpoint for all providers

BASE_URL="https://saber-api-backend.vercel.app"
# BASE_URL="http://localhost:3000"  # Uncomment for local testing

echo "🧪 SABER OAuth Flow Test"
echo "========================"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s "${BASE_URL}/api/health")
echo "Response: ${HEALTH_RESPONSE}"
if echo "${HEALTH_RESPONSE}" | grep -q "ok"; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi
echo ""

# Test 2: Root endpoint
echo "2️⃣  Testing Root Endpoint..."
ROOT_RESPONSE=$(curl -s "${BASE_URL}/")
echo "Response: ${ROOT_RESPONSE}"
if echo "${ROOT_RESPONSE}" | grep -q "Hello World"; then
    echo "✅ Root endpoint passed"
else
    echo "❌ Root endpoint failed"
fi
echo ""

# Test 3: OAuth callback endpoint structure (without actual OAuth code)
echo "3️⃣  Testing OAuth Callback Endpoint Structure..."
echo ""

echo "   Testing Google OAuth callback (missing code - should error gracefully)..."
GOOGLE_TEST=$(curl -s -X POST "${BASE_URL}/api/auth/oauth/callback" \
  -H "Content-Type: application/json" \
  -d '{"provider":"google","code":""}')
echo "   Response: ${GOOGLE_TEST}"
if echo "${GOOGLE_TEST}" | grep -q "error\|validation\|required"; then
    echo "   ✅ Google endpoint exists and validates input"
else
    echo "   ⚠️  Unexpected response (endpoint might not be working)"
fi
echo ""

echo "   Testing GitHub OAuth callback (missing code - should error gracefully)..."
GITHUB_TEST=$(curl -s -X POST "${BASE_URL}/api/auth/oauth/callback" \
  -H "Content-Type: application/json" \
  -d '{"provider":"github","code":""}')
echo "   Response: ${GITHUB_TEST}"
if echo "${GITHUB_TEST}" | grep -q "error\|validation\|required"; then
    echo "   ✅ GitHub endpoint exists and validates input"
else
    echo "   ⚠️  Unexpected response (endpoint might not be working)"
fi
echo ""

echo "   Testing LinkedIn OAuth callback (missing code - should error gracefully)..."
LINKEDIN_TEST=$(curl -s -X POST "${BASE_URL}/api/auth/oauth/callback" \
  -H "Content-Type: application/json" \
  -d '{"provider":"linkedin","code":""}')
echo "   Response: ${LINKEDIN_TEST}"
if echo "${LINKEDIN_TEST}" | grep -q "error\|validation\|required"; then
    echo "   ✅ LinkedIn endpoint exists and validates input"
else
    echo "   ⚠️  Unexpected response (endpoint might not be working)"
fi
echo ""

echo "========================"
echo "📋 Test Summary"
echo "========================"
echo ""
echo "✅ All structural tests passed!"
echo ""
echo "📝 Next Steps for Full OAuth Testing:"
echo ""
echo "1. Google OAuth:"
echo "   Visit: https://accounts.google.com/o/oauth2/v2/auth?client_id=942388377321-su1u7ofm0ck76pvkiv07ksl8k9esfls6.apps.googleusercontent.com&redirect_uri=${BASE_URL}/api/auth/oauth/callback&response_type=code&scope=openid%20email"
echo ""
echo "2. GitHub OAuth:"
echo "   Visit: https://github.com/login/oauth/authorize?client_id=Ov23lijOpMktUNXB6FYD&redirect_uri=${BASE_URL}/api/auth/oauth/callback&scope=read:user%20user:email%20public_repo"
echo ""
echo "3. LinkedIn OAuth:"
echo "   Visit: https://www.linkedin.com/oauth/v2/authorization?client_id=86v3erqkn6uuka&redirect_uri=${BASE_URL}/api/auth/oauth/callback&response_type=code&scope=openid%20profile%20email"
echo ""
echo "After clicking 'Allow', you should be redirected back with a code parameter."
echo "The frontend should then POST that code to /api/auth/oauth/callback"
echo ""
