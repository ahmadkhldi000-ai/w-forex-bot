#!/usr/bin/env bash
# ====================================================================
#  W-FOREX-BOT · Full Test Suite Runner
#  Runs all test categories sequentially and reports a summary.
#
#  Usage:
#    ./scripts/tests/run-all-tests.sh                    # localhost:3000
#    ./scripts/tests/run-all-tests.sh https://api.prod.com  # production
#    ./scripts/tests/run-all-tests.sh http://localhost:3000 <ADMIN_JWT>
# ====================================================================

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
ADMIN_TOKEN="${2:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOTAL_PASS=0
TOTAL_FAIL=0

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   W-FOREX-BOT · Full Test Suite              ║"
echo "║   Target: $BASE_URL"
echo "╚══════════════════════════════════════════════╝"

# ---- Run each test suite ----
SUITES=("api" "security" "mt5" "perf")
SUITE_LABELS=("API Endpoints" "Security" "MT5 Connection" "Performance")

for i in "${!SUITES[@]}"; do
  suite="${SUITES[$i]}"
  label="${SUITE_LABELS[$i]}"
  script="$SCRIPT_DIR/test-${suite}.sh"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "▶  Running $label tests..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [ "$suite" = "mt5" ] && [ -n "$ADMIN_TOKEN" ]; then
    bash "$script" "$BASE_URL" "$ADMIN_TOKEN" || true
  else
    bash "$script" "$BASE_URL" || true
  fi
done

# ---- Final Summary ----
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║            TEST SUITE COMPLETE               ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Review the output above for any ❌ failures."
echo "Individual test scripts exit with the failure count."
echo ""

if [ -z "$ADMIN_TOKEN" ]; then
  echo "💡 To run MT5 authenticated tests:"
  echo "   $0 $BASE_URL <ADMIN_JWT_TOKEN>"
  echo ""
fi

echo "Done."
