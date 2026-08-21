#!/usr/bin/env bash
# ============================================================
#  run-e2e.sh — Run all Playwright E2E tests
#
#  Usage:
#    ./run-e2e.sh              Run all tests (staging by default)
#    ./run-e2e.sh --local      Run against http://localhost:3000
#    ./run-e2e.sh --docker     Spin up Docker, test, tear down
#    ./run-e2e.sh --report     Open the HTML report
#    ./run-e2e.sh --list       List all tests without running
# ============================================================

set -euo pipefail

case "${1:-}" in
  --local)
    export E2E_BASE_URL="http://localhost:3000"
    echo "[E2E] Running against local instance: http://localhost:3000"
    npx playwright test --reporter=list
    ;;
  --docker)
    echo "[E2E] Running via Docker (build, test, teardown)"
    bash "$(dirname "$0")/tests/e2e/run-e2e-docker.sh"
    ;;
  --report)
    echo "[E2E] Opening HTML report..."
    npx playwright show-report
    ;;
  --list)
    echo "[E2E] Listing all tests..."
    npx playwright test --list
    ;;
  *)
    echo "[E2E] Running all tests against staging..."
    echo "[E2E] Use --local for localhost or --docker for Docker"
    echo ""
    npx playwright test --reporter=list
    ;;
esac

echo ""
echo "[E2E] Done. Run './run-e2e.sh --report' to view the HTML report."
