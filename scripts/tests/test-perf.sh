#!/usr/bin/env bash
# ====================================================================
#  W-FOREX-BOT · Performance Tests
#  Measures response times, throughput, and identifies slow endpoints.
#  Usage: ./scripts/tests/test-perf.sh [BASE_URL]
# ====================================================================

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
PASSED=0
FAILED=0
SLOW_THRESHOLD=500  # ms — requests slower than this are flagged

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   W-FOREX-BOT · Performance Tests        ║"
echo "╚══════════════════════════════════════════╝"
echo "Target: $BASE_URL"
echo "Slow threshold: ${SLOW_THRESHOLD}ms"
echo ""

# ---- Single request timing ----
measure() {
  local url="$1" label="$2" expected_max="${3:-$SLOW_THRESHOLD}"

  RESULT=$(curl -s -o /dev/null -w "%{http_code} %{time_total} %{time_connect} %{time_starttransfer}" \
    "$BASE_URL$url" 2>/dev/null || echo "000 0 0 0")

  HTTP_CODE=$(echo "$RESULT" | awk '{print $1}')
  TOTAL_MS=$(echo "$RESULT" | awk '{printf "%.0f", $2 * 1000}')
  CONNECT_MS=$(echo "$RESULT" | awk '{printf "%.0f", $3 * 1000}')
  TTFB_MS=$(echo "$RESULT" | awk '{printf "%.0f", $4 * 1000}')

  if [ "$HTTP_CODE" = "000" ]; then
    red "  ✗ $label — connection failed"
    FAILED=$((FAILED + 1))
    return
  fi

  if [ "$TOTAL_MS" -le "$expected_max" ]; then
    green "  ✓ $label — ${TOTAL_MS}ms (TTFB: ${TTFB_MS}ms)"
    PASSED=$((PASSED + 1))
  else
    yellow "  ⚠️  $label — ${TOTAL_MS}ms SLOW (threshold: ${expected_max}ms)"
    PASSED=$((PASSED + 1))
  fi
}

echo "⏱️  Response Times (single request)"
echo "─────────────────────────────────"
measure "/health" "GET /health" 100
measure "/health/ready" "GET /health/ready" 300
measure "/" "GET /" 100
measure "/api/subscriptions/plans" "GET /api/subscriptions/plans" 300
echo ""

# ---- Sequential load test ----
echo "🔥 Load Test (20 sequential requests)"
echo "─────────────────────────────────"

TOTAL_TIME=0
MIN_TIME=999999
MAX_TIME=0
SUCCESS=0

for i in $(seq 1 20); do
  TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/health" 2>/dev/null || echo "0")
  TIME_MS=$(echo "$TIME" | awk '{printf "%.0f", $1 * 1000}')

  if [ "$TIME_MS" -gt 0 ]; then
    SUCCESS=$((SUCCESS + 1))
    TOTAL_TIME=$((TOTAL_TIME + TIME_MS))
    if [ "$TIME_MS" -lt "$MIN_TIME" ]; then MIN_TIME=$TIME_MS; fi
    if [ "$TIME_MS" -gt "$MAX_TIME" ]; then MAX_TIME=$TIME_MS; fi
  fi
done

if [ "$SUCCESS" -gt 0 ]; then
  AVG_TIME=$((TOTAL_TIME / SUCCESS))
  echo "  Requests:    $SUCCESS/20 successful"
  echo "  Min:         ${MIN_TIME}ms"
  echo "  Max:         ${MAX_TIME}ms"
  echo "  Avg:         ${AVG_TIME}ms"

  if [ "$AVG_TIME" -le 100 ]; then
    green "  ✓ Excellent avg response time (${AVG_TIME}ms)"
  elif [ "$AVG_TIME" -le 300 ]; then
    green "  ✓ Good avg response time (${AVG_TIME}ms)"
  else
    yellow "  ⚠️  Avg response time above 300ms — investigate"
  fi
  PASSED=$((PASSED + 1))
else
  red "  ✗ All requests failed"
  FAILED=$((FAILED + 1))
fi
echo ""

# ---- Concurrent load test ----
echo "🚀 Concurrent Load Test (10 parallel requests × 3 rounds)"
echo "─────────────────────────────────"

for round in 1 2 3; do
  PARALLEL_SUCCESS=0
  for i in $(seq 1 10); do
    curl -s -o /dev/null "$BASE_URL/health" 2>/dev/null && PARALLEL_SUCCESS=$((PARALLEL_SUCCESS + 1)) &
  done
  wait
  if [ "$PARALLEL_SUCCESS" -eq 10 ]; then
    green "  Round $round: 10/10 succeeded"
    PASSED=$((PASSED + 1))
  else
    red "  Round $round: $PARALLEL_SUCCESS/10 succeeded"
    FAILED=$((FAILED + 1))
  fi
done
echo ""

# ---- Large payload test ----
echo "📦 Payload Handling"
echo "─────────────────────────────────"

# Test that compressed response is smaller
UNCOMPRESSED_SIZE=$(curl -s -H "Accept-Encoding: identity" "$BASE_URL/api/subscriptions/plans" 2>/dev/null | wc -c | tr -d ' ')
COMPRESSED_SIZE=$(curl -s -H "Accept-Encoding: gzip" "$BASE_URL/api/subscriptions/plans" 2>/dev/null | wc -c | tr -d ' ')

if [ "$COMPRESSED_SIZE" -lt "$UNCOMPRESSED_SIZE" ]; then
  RATIO=$(python3 -c "print(f'{(1 - $COMPRESSED_SIZE/$UNCOMPRESSED_SIZE)*100:.0f}%')" 2>/dev/null || echo "?")
  green "  ✓ Gzip compression active (${UNCOMPRESSED_SIZE}B → ${COMPRESSED_SIZE}B, ${RATIO} saved)"
  PASSED=$((PASSED + 1))
else
  warn_msg="  ⚠️  Gzip may not be active (${UNCOMPRESSED_SIZE}B vs ${COMPRESSED_SIZE}B)"
  yellow "$warn_msg"
fi
echo ""

# ---- Summary ----
echo "═══════════════════════════════════════════"
if [ "$FAILED" -eq 0 ]; then
  green "✅ PERFORMANCE OK — $PASSED checks passed"
else
  red "❌ ISSUES — $PASSED passed, $FAILED failed"
fi
echo ""

exit $FAILED
