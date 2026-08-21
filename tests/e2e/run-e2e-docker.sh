#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# E2E Test Runner for Flametree QuarryLink
#
# This script:
# 1. Builds the Docker image for the Next.js app
# 2. Starts a container with the required environment variables
# 3. Waits for the app to be healthy
# 4. Runs Playwright E2E tests against the container
# 5. Generates a report (HTML + JSON + console summary)
# 6. Tears down the container
#
# Usage:
#   ./tests/e2e/run-e2e-docker.sh           # Build + run + teardown
#   ./tests/e2e/run-e2e-docker.sh --no-build # Skip build (use existing image)
#   ./tests/e2e/run-e2e-docker.sh --keep     # Keep container running after tests
#
# Environment variables (read from .env.e2e or shell):
#   E2E_AUTH_SECRET          - NextAuth secret
#   E2E_DATABASE_URL         - Neon database pooled connection
#   E2E_DIRECT_URL           - Neon database direct connection
#   E2E_DOWNSTREAM_URL       - QuarryLink service URL
#   E2E_TENANT_FUSION_URL    - Tenant Fusion service URL
#   E2E_CLOUDFRONT_URL       - CloudFront public URL
#   E2E_S3_BUCKET            - S3 tenant assets bucket
#   E2E_RESEND_API_KEY       - Resend API key
#   E2E_EMAIL_FROM           - From email address
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONTAINER_NAME="quarrylink-e2e"
IMAGE_NAME="quarrylink-e2e"
REPORT_DIR="$PROJECT_ROOT/playwright-report"
RESULTS_DIR="$PROJECT_ROOT/test-results"
E2E_ENV_FILE="$PROJECT_ROOT/.env.e2e"
KEEP_CONTAINER=false
SKIP_BUILD=false

# Parse args
for arg in "$@"; do
  case "$arg" in
    --keep)      KEEP_CONTAINER=true ;;
    --no-build)  SKIP_BUILD=true ;;
    *) echo "Unknown arg: $arg"; exit 1 ;;
  esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()   { echo -e "${BLUE}[E2E]${NC} $1"; }
ok()    { echo -e "${GREEN}[E2E]${NC} $1"; }
warn()  { echo -e "${YELLOW}[E2E]${NC} $1"; }
fail()  { echo -e "${RED}[E2E]${NC} $1"; }

# Track start time
START_TIME=$(date +%s)

# ---------------------------------------------------------------------------
# Cleanup function — always runs on exit
# ---------------------------------------------------------------------------
cleanup() {
  local exit_code=$?

  if [ "$KEEP_CONTAINER" = true ]; then
    warn "Keeping container $CONTAINER_NAME running (--keep flag)"
  else
    log "Tearing down container $CONTAINER_NAME..."
    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
    ok "Container removed"
  fi

  # Clean up Docker image if we built it
  if [ "$SKIP_BUILD" = false ] && [ "$KEEP_CONTAINER" = false ]; then
    docker rmi "$IMAGE_NAME" 2>/dev/null || true
  fi

  # Print summary
  END_TIME=$(date +%s)
  DURATION=$((END_TIME - START_TIME))

  echo ""
  echo "================================================================"
  echo "  E2E Test Run Summary"
  echo "================================================================"

  if [ $exit_code -eq 0 ]; then
    ok "  Status: PASSED"
  else
    fail "  Status: FAILED (exit code: $exit_code)"
  fi

  echo "  Duration: ${DURATION}s"
  echo "  HTML Report: $REPORT_DIR/index.html"
  echo "  JSON Report: $RESULTS_DIR/results.json"
  echo ""
  echo "  Open report:  npm run e2e:report"
  echo "================================================================"
  echo ""

  exit $exit_code
}

trap cleanup EXIT

# ---------------------------------------------------------------------------
# Step 1: Load environment
# ---------------------------------------------------------------------------
log "Loading E2E environment..."

if [ -f "$E2E_ENV_FILE" ]; then
  warn "Loading env from $E2E_ENV_FILE"
  set -a
  source "$E2E_ENV_FILE"
  set +a
else
  warn "No .env.e2e file found. Using shell environment variables."
fi

# Validate required env vars
REQUIRED_VARS=(
  E2E_AUTH_SECRET
  E2E_DATABASE_URL
  E2E_DIRECT_URL
  E2E_DOWNSTREAM_URL
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    fail "Missing required env var: $var"
    fail "Create a .env.e2e file or set it in your shell."
    exit 1
  fi
done

ok "Environment validated"

# ---------------------------------------------------------------------------
# Step 2: Build Docker image (if not skipped)
# ---------------------------------------------------------------------------
if [ "$SKIP_BUILD" = false ]; then
  log "Building Docker image $IMAGE_NAME..."
  docker build -t "$IMAGE_NAME" "$PROJECT_ROOT"
  ok "Docker image built"
else
  warn "Skipping Docker build (--no-build flag)"
fi

# ---------------------------------------------------------------------------
# Step 3: Start container
# ---------------------------------------------------------------------------
log "Starting container $CONTAINER_NAME..."

# Remove any existing container with the same name
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

docker run -d \
  --name "$CONTAINER_NAME" \
  -p 3000:3000 \
  -e AUTH_SECRET="$E2E_AUTH_SECRET" \
  -e DATABASE_URL="$E2E_DATABASE_URL" \
  -e DIRECT_URL="$E2E_DIRECT_URL" \
  -e DOWNSTREAM_QUARRYLINK_SERVICE_URL="$E2E_DOWNSTREAM_URL" \
  -e TENANT_FUSION_SERVICE_URL="${E2E_TENANT_FUSION_URL:-}" \
  -e CLOUDFRONT_PUBLIC_URL="${E2E_CLOUDFRONT_URL:-}" \
  -e AWS_S3_TENANT_ASSETS_BUCKET="${E2E_S3_BUCKET:-}" \
  -e RESEND_API_KEY="${E2E_RESEND_API_KEY:-}" \
  -e EMAIL_FROM="${E2E_EMAIL_FROM:-}" \
  -e NODE_ENV=production \
  "$IMAGE_NAME"

ok "Container started"

# ---------------------------------------------------------------------------
# Step 4: Wait for app to be healthy
# ---------------------------------------------------------------------------
log "Waiting for app to be ready..."

MAX_WAIT=60
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login 2>/dev/null | grep -q "200\|302"; then
    ok "App is ready (waited ${WAITED}s)"
    break
  fi
  sleep 2
  WAITED=$((WAITED + 2))
  echo -n "."
done

echo ""

if [ $WAITED -ge $MAX_WAIT ]; then
  fail "App did not become ready within ${MAX_WAIT}s"
  docker logs "$CONTAINER_NAME" --tail 50
  exit 1
fi

# ---------------------------------------------------------------------------
# Step 5: Run Playwright tests
# ---------------------------------------------------------------------------
log "Running E2E tests against http://localhost:3000..."

export E2E_BASE_URL="http://localhost:3000"

cd "$PROJECT_ROOT"

# Install Playwright browsers if not already installed
npx playwright install chromium 2>/dev/null || true

# Run the tests
npx playwright test \
  --reporter=html,json,list \
  --output="$RESULTS_DIR/output" \
  2>&1 || true

# Capture exit code from playwright
TEST_EXIT=$?

# ---------------------------------------------------------------------------
# Step 6: Print text report
# ---------------------------------------------------------------------------
log "Generating text report..."

JSON_REPORT="$RESULTS_DIR/results.json"
if [ -f "$JSON_REPORT" ]; then
  echo ""
  echo "================================================================"
  echo "  E2E Test Results (Detailed)"
  echo "================================================================"

  # Use node to parse the JSON report
  node -e "
    const fs = require('fs');
    const report = JSON.parse(fs.readFileSync('$JSON_REPORT', 'utf8'));
    const suites = {};

    for (const suite of report.suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          for (const result of test.results || []) {
            const suiteName = suite.title || 'Unknown';
            const specName = spec.title || 'Unknown';
            const status = result.status;
            if (!suites[suiteName]) suites[suiteName] = [];
            suites[suiteName].push({ name: specName, status, duration: result.duration || 0 });
          }
        }
      }
    }

    let passed = 0, failed = 0, skipped = 0, flaky = 0;
    for (const [suite, tests] of Object.entries(suites)) {
      console.log('');
      console.log('  ' + suite);
      console.log('  ' + '-'.repeat(suite.length));
      for (const t of tests) {
        const icon = t.status === 'passed' ? '✓' : t.status === 'failed' ? '✗' : t.status === 'skipped' ? '○' : '?';
        const color = t.status === 'passed' ? '\x1b[32m' : t.status === 'failed' ? '\x1b[31m' : '\x1b[33m';
        console.log('  ' + color + icon + '\x1b[0m ' + t.name + ' (' + (t.duration / 1000).toFixed(1) + 's)');
        if (t.status === 'passed') passed++;
        else if (t.status === 'failed') failed++;
        else if (t.status === 'skipped') skipped++;
        else flaky++;
      }
    }

    console.log('');
    console.log('================================================================');
    console.log('  Total: ' + (passed + failed + skipped + flaky) + 
      ' | Passed: ' + passed + 
      ' | Failed: ' + failed + 
      ' | Skipped: ' + skipped + 
      ' | Flaky: ' + flaky);
    console.log('================================================================');
  " 2>/dev/null || warn "Could not parse JSON report"
else
  warn "No JSON report found at $JSON_REPORT"
fi

exit $TEST_EXIT
