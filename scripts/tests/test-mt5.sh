#!/usr/bin/env bash
# ====================================================================
#  W-FOREX-BOT · MT5 Connection Tests
#  Verifies MT5 bridge connectivity, account management, and live data.
#  Usage: ./scripts/tests/test-mt5.sh [BASE_URL] [ADMIN_TOKEN]
# ====================================================================

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
TOKEN="${2:-}"
PASSED=0
FAILED=0

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }

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

AUTH_HEADER=""
if [ -n "$TOKEN" ]; then
  AUTH_HEADER="Authorization: Bearer $TOKEN"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║    W-FOREX-BOT · MT5 Connection Tests    ║"
echo "╚══════════════════════════════════════════╝"
echo "Target: $BASE_URL"
if [ -z "$TOKEN" ]; then
  echo "⚠️  No admin token provided — running auth-protected tests will be skipped"
fi
echo ""

# ---- MT5 Socket bridge health ----
echo "🔌 MT5 Bridge Connectivity"
echo "─────────────────────────────────"

# Check server is up
SERVER_UP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
assert_status "200" "$SERVER_UP" "Server reachable"

# Check WebSocket upgrade capability
WS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Upgrade: websocket" \
  -H "Connection: Upgrade" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  -H "Sec-WebSocket-Version: 13" \
  "$BASE_URL/socket.io/?EIO=4&transport=polling")
# Should not be 404 — socket.io endpoint exists
if [ "$WS_CHECK" != "404" ]; then
  green "  ✓ Socket.io endpoint exists (HTTP $WS_CHECK)"
  PASSED=$((PASSED + 1))
else
  red "  ✗ Socket.io endpoint not found"
  FAILED=$((FAILED + 1))
fi
echo ""

if [ -z "$TOKEN" ]; then
  echo "⏭️  Skipping authenticated MT5 tests (no token)"
  echo ""
  echo "═══════════════════════════════════════════"
  if [ "$FAILED" -eq 0 ]; then
    green "✅ ALL PASSED — $PASSED tests"
  else
    red "❌ FAILED — $PASSED passed, $FAILED failed"
  fi
  exit $FAILED
fi

# ---- MT5 Account Management (requires admin) ----
echo "📊 MT5 Account Management"
echo "─────────────────────────────────"

# List accounts
ACCOUNTS_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "$AUTH_HEADER" \
  "$BASE_URL/api/management/mt5/accounts")
assert_status "200" "$ACCOUNTS_CODE" "GET /management/mt5/accounts"

# Check accounts response shape
ACCOUNTS_BODY=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/management/mt5/accounts")
if echo "$ACCOUNTS_BODY" | grep -q "\"success\""; then
  green "  ✓ Accounts list returns valid response"
  PASSED=$((PASSED + 1))
else
  red "  ✗ Accounts list response malformed"
  FAILED=$((FAILED + 1))
fi

# Check for single-active constraint (only 1 isActive: true)
ACTIVE_COUNT=$(echo "$ACCOUNTS_BODY" | grep -o '"isActive":true' | wc -l | tr -d ' ')
if [ "$ACTIVE_COUNT" -le 1 ]; then
  green "  ✓ Single active constraint — $ACTIVE_COUNT active account(s)"
  PASSED=$((PASSED + 1))
else
  red "  ✗ VIOLATION — $ACTIVE_COUNT active accounts (should be ≤ 1)"
  FAILED=$((FAILED + 1))
fi

# Check for single-master constraint (only 1 isMaster: true)
MASTER_COUNT=$(echo "$ACCOUNTS_BODY" | grep -o '"isMaster":true' | wc -l | tr -d ' ')
if [ "$MASTER_COUNT" -le 1 ]; then
  green "  ✓ Single master constraint — $MASTER_COUNT master account(s)"
  PASSED=$((PASSED + 1))
else
  red "  ✗ VIOLATION — $MASTER_COUNT master accounts (should be ≤ 1)"
  FAILED=$((FAILED + 1))
fi
echo ""

# ---- Performance data ----
echo "📈 Live Data / Performance"
echo "─────────────────────────────────"

PERF_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "$AUTH_HEADER" \
  "$BASE_URL/api/management/mt5/performance")
assert_status "200" "$PERF_CODE" "GET /management/mt5/performance"
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
