#!/usr/bin/env bash
# ====================================================================
#  W-FOREX-BOT · API Endpoint Tests
#  Tests all major API endpoints for correct response codes and shapes.
#  Usage: ./scripts/tests/test-api.sh [BASE_URL]
# ====================================================================

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
PASSED=0
FAILED=0

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

assert_status() {
  local expected="$1" actual="$2" label="$3"
  if [ "$actual" = "$expected" ]; then
    green "  ✓ $label (HTTP $actual)"
    PASSED=$((PASSED + 1))
  else
    red "  ✗ $label — expected HTTP $expected, got $actual"
    FAILED=$((FAILED + 1))
  fi
}

assert_json_field() {
  local body="$1" field="$2" label="$3"
  if echo "$body" | grep -q "\"$field\""; then
    green "  ✓ $label — has '$field'"
    PASSED=$((PASSED + 1))
  else
    red "  ✗ $label — missing '$field'"
    FAILED=$((FAILED + 1))
  fi
}

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     W-FOREX-BOT · API Endpoint Tests     ║"
echo "╚══════════════════════════════════════════╝"
echo "Target: $BASE_URL"
echo ""

# ---- Health checks ----
echo "📋 Health Checks"
echo "─────────────────────────────────"

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
assert_status "200" "$HEALTH" "GET /health"

HEALTH_BODY=$(curl -s "$BASE_URL/health")
assert_json_field "$HEALTH_BODY" "status" "GET /health body"

READY=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health/ready")
assert_status "200" "$READY" "GET /health/ready"

ROOT=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
assert_status "200" "$ROOT" "GET / (root info)"
echo ""

# ---- Auth endpoints ----
echo "🔐 Auth Endpoints"
echo "─────────────────────────────────"

# Login with invalid credentials → should fail
BAD_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@test.com","password":"wrongpass"}')
assert_status "401" "$BAD_LOGIN" "POST /api/auth/login (invalid creds → 401)"

# Login with missing fields → validation error
BAD_BODY=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{}')
assert_status "400" "$BAD_BODY" "POST /api/auth/login (empty body → 400)"

# Register with invalid email → validation error
BAD_REG=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail","password":"short"}')
assert_status "400" "$BAD_REG" "POST /api/auth/register (invalid email → 400)"
echo ""

# ---- Subscriptions ----
echo "💳 Subscriptions"
echo "─────────────────────────────────"

PLANS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/subscriptions/plans")
assert_status "200" "$PLANS" "GET /api/subscriptions/plans"

PLANS_BODY=$(curl -s "$BASE_URL/api/subscriptions/plans")
assert_json_field "$PLANS_BODY" "success" "GET /plans response shape"

# Invoices without auth → 401
NO_AUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/subscriptions/invoices")
assert_status "401" "$NO_AUTH" "GET /invoices without auth → 401"
echo ""

# ---- Admin ----
echo "👑 Admin Endpoints"
echo "─────────────────────────────────"

# Admin without auth → 401
ADMIN_NOAUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/management/overview")
assert_status "401" "$ADMIN_NOAUTH" "GET /management/overview without auth → 401"

# Admin login with invalid creds
ADMIN_BAD=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@admin.com","password":"wrong"}')
assert_status "401" "$ADMIN_BAD" "POST /admin/auth/login (invalid → 401)"
echo ""

# ---- MT5 ----
echo "📈 MT5 Endpoints"
echo "─────────────────────────────────"

# MT5 accounts without auth → 401
MT5_NOAUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/management/mt5/accounts")
assert_status "401" "$MT5_NOAUTH" "GET /management/mt5/accounts without auth → 401"
echo ""

# ---- Payments ----
echo "💰 Payments"
echo "─────────────────────────────────"

# Payments without auth → 401
PAY_NOAUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/payments")
assert_status "401" "$PAY_NOAUTH" "GET /payments without auth → 401"
echo ""

# ---- 404 ----
echo "🔍 404 Handling"
echo "─────────────────────────────────"

NOT_FOUND=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/nonexistent")
assert_status "404" "$NOT_FOUND" "GET /api/nonexistent → 404"
echo ""

# ---- Summary ----
echo "═══════════════════════════════════════════"
if [ "$FAILED" -eq 0 ]; then
  green "✅ ALL PASSED — $PASSED/$PASSED tests"
else
  red "❌ FAILED — $PASSED passed, $FAILED failed"
fi
echo ""

exit $FAILED
