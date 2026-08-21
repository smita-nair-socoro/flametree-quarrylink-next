# ============================================================
#  run-e2e.ps1 — Run all Playwright E2E tests
#
#  Usage:
#    .\run-e2e.ps1              Run all tests (staging by default)
#    .\run-e2e.ps1 -Local       Run against http://localhost:3000
#    .\run-e2e.ps1 -Docker      Spin up Docker, test, tear down
#    .\run-e2e.ps1 -Report      Open the HTML report
#    .\run-e2e.ps1 -List        List all tests without running
#    .\run-e2e.ps1 -Help        Show help
# ============================================================

param(
  [switch]$Local = $false,
  [switch]$Docker = $false,
  [switch]$Report = $false,
  [switch]$List = $false,
  [switch]$Help = $false
)

$ErrorActionPreference = "Stop"

if ($Help) {
  Write-Host @"
run-e2e.ps1 — Run all Playwright E2E tests

Usage:
  .\run-e2e.ps1              Run all tests (staging by default)
  .\run-e2e.ps1 -Local       Run against http://localhost:3000
  .\run-e2e.ps1 -Docker      Spin up Docker, test, tear down
  .\run-e2e.ps1 -Report      Open the HTML report
  .\run-e2e.ps1 -List        List all tests without running
  .\run-e2e.ps1 -Help        Show this help
"@
  exit 0
}

if ($Report) {
  Write-Host "[E2E] Opening HTML report..." -ForegroundColor Blue
  npx playwright show-report
  exit 0
}

if ($List) {
  Write-Host "[E2E] Listing all tests..." -ForegroundColor Blue
  npx playwright test --list
  exit 0
}

if ($Docker) {
  Write-Host "[E2E] Running via Docker (build, test, teardown)" -ForegroundColor Blue
  & "$PSScriptRoot\tests\e2e\run-e2e-docker.ps1"
  exit $LASTEXITCODE
}

if ($Local) {
  $env:E2E_BASE_URL = "http://localhost:3000"
  Write-Host "[E2E] Running against local instance: http://localhost:3000" -ForegroundColor Blue
} else {
  Write-Host "[E2E] Running all tests against staging..." -ForegroundColor Blue
  Write-Host "[E2E] Use -Local for localhost or -Docker for Docker" -ForegroundColor Yellow
}

Write-Host ""
npx playwright test --reporter=list
$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "[E2E] Done. Run: .\run-e2e.ps1 -Report  to view the HTML report." -ForegroundColor Blue
exit $exitCode
