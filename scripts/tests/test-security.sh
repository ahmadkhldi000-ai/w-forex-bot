#!/usr/bin/env bash
# ====================================================================
#  W-FOREX-BOT · Security Tests
#  Tests security headers, CORS, rate limiting, auth, input validation.
#  Usage: ./scripts/tests/test-security.sh [BASE_URL]
# ====================================================================

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
PASSED=0
FAILED=0
WARNINGS=0

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

pass() { green "  ✓ $1"; PASSED=$((PASSED + 1)); }
fail() { red "  ✗ $1"; FAILED=$((FAILED + 1)); }
warn() { yellow "  ⚠️  $1"; WARNINGS=$((WARNINGS + 1)); }

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   W-FOREX-BOT · Security Tests           ║"
echo "╚══════════════════════════════════════════╝"
echo "Target: $BASE_URL"
echo ""

# ---- Security Headers (Helmet) ----
echo "🛡️  Security Headers"
echo "─────────────────────────────────"

HEADERS=$(curl -s -I "$BASE_URL/health" 2>/dev/null)

if echo "$HEADERS" | grep -qi "x-frame-options"; then
  pass "X-Frame-Options header present (clickjacking protection)"
else
  fail "Missing X-Frame-Options header"
fi

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
  pass "X-Content-Type-Options header present"
else
  fail "Missing X-Content-Type-Options header"
fi

if echo "$HEADERS" | grep -qi "strict-transport-security"; then
  pass "Strict-Transport-Security header present (HSTS)"
else
  warn "HSTS header not present (expected in dev / configure on load balancer for prod)"
fi

if echo "$HEADERS" | grep -qi "x-powered-by"; then
  fail "X-Powered-By header leaked (should be hidden)"
else
  pass "X-Powered-By hidden"
fi
echo ""

# ---- CORS ----
echo "🌐 CORS Configuration"
echo "─────────────────────────────────"

# Test OPTIONS preflight
CORS_CHECK=$(curl -s -I -X OPTIONS "$BASE_URL/api/auth/login" \
  -H "Origin: http://evil-site.com" \
  -H "Access-Control-Request-Method: POST" 2>/dev/null)

if echo "$CORS_CHECK" | grep -qi "access-control-allow-origin"; then
  ALLOWED_ORIGIN=$(echo "$CORS_CHECK" | grep -i "access-control-allow-origin" | tr -d '\r' | awk '{print $2}')
  if echo "$ALLOWED_ORIGIN" | grep -q "evil-site"; then
    fail "CORS allows arbitrary origin: $ALLOWED_ORIGIN"
  else
    pass "CORS restricted origin (got: $ALLOWED_ORIGIN)"
  fi
else
  pass "CORS rejects unknown origin (no Access-Control-Allow-Origin header)"
fi
echo ""

# ---- Authentication ----
echo "🔐 Authentication"
echo "─────────────────────────────────"

# Protected route without token
NO_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/subscriptions/me")
if [ "$NO_TOKEN" = "401" ] || [ "$NO_TOKEN" = "403" ]; then
  pass "Protected route rejects unauthenticated request (HTTP $NO_TOKEN)"
else
  fail "Protected route accessible without auth (HTTP $NO_TOKEN)"
fi

# Invalid token format
BAD_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer invalid.token.here" \
  "$BASE_URL/api/subscriptions/me")
if [ "$BAD_TOKEN" = "401" ] || [ "$BAD_TOKEN" = "403" ]; then
  pass "Invalid JWT rejected (HTTP $BAD_TOKEN)"
else
  fail "Invalid JWT accepted (HTTP $BAD_TOKEN)"
fi

# SQL injection attempt in login
SQLI=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wforexbot.com OR 1=1--","password":"x"}')
if [ "$SQLI" = "400" ] || [ "$SQLI" = "401" ]; then
  pass "SQL injection attempt rejected (HTTP $SQLI)"
else
  fail "SQL injection not properly handled (HTTP $SQLI)"
fi
echo ""

# ---- Input Validation ----
echo "📝 Input Validation"
echo "─────────────────────────────────"

# XSS attempt in registration
XSS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>@test.com","password":"validpassword123"}')
if [ "$XSS" = "400" ]; then
  pass "XSS payload rejected (HTTP $XSS)"
else
  fail "XSS payload accepted (HTTP $XSS)"
fi

# Oversized payload
BIG_BODY=$(python3 -c "print('{\"data\":\"' + 'A'*100000 + '\"}')")
BIG_RES=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "$BIG_BODY")
if [ "$BIG_RES" = "413" ] || [ "$BIG_RES" = "400" ]; then
  pass "Oversized payload rejected (HTTP $BIG_RES)"
else
  warn "Large payload accepted (HTTP $BIG_RES) — consider tighter body size limit"
fi
echo ""

# ---- Rate Limiting ----
echo "⏱️  Rate Limiting"
echo "─────────────────────────────────"

echo "  Sending 20 rapid requests to /api/auth/login..."
RATE_LIMITED=0
for i in $(seq 1 20); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"rate@test.com","password":"wrong"}' 2>/dev/null)
  if [ "$CODE" = "429" ]; then
    RATE_LIMITED=1
    break
  fi
done

if [ "$RATE_LIMITED" = "1" ]; then
  pass "Rate limiting active (429 after $i requests)"
else
  warn "No rate limiting detected on login — ensure it's enabled in production"
fi
echo ""

# ---- Summary ----
echo "═══════════════════════════════════════════"
if [ "$FAILED" -eq 0 ]; then
  green "✅ SECURITY CHECK PASSED — $PASSED passed, $WARNINGS warnings"
else
  red "❌ SECURITY ISSUES — $PASSED passed, $FAILED failed, $WARNINGS warnings"
fi
echo ""

exit $FAILED
