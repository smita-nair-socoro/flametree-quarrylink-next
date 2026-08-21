# ============================================================================
# E2E Test Runner for Flametree QuarryLink (Windows PowerShell version)
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
#   .\tests\e2e\run-e2e-docker.ps1              # Build + run + teardown
#   .\tests\e2e\run-e2e-docker.ps1 -NoBuild     # Skip build
#   .\tests\e2e\run-e2e-docker.ps1 -Keep        # Keep container running
# ============================================================================

param(
  [switch]$NoBuild = $false,
  [switch]$Keep = $false
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
$ContainerName = "quarrylink-e2e"
$ImageName = "quarrylink-e2e"
$ReportDir = Join-Path $ProjectRoot "playwright-report"
$ResultsDir = Join-Path $ProjectRoot "test-results"
$E2EEnvFile = Join-Path $ProjectRoot ".env.e2e"

$StartTime = Get-Date

function Log($msg) { Write-Host "[E2E] $msg" -ForegroundColor Blue }
function Ok($msg)  { Write-Host "[E2E] $msg" -ForegroundColor Green }
function Warn($msg){ Write-Host "[E2E] $msg" -ForegroundColor Yellow }
function Fail($msg){ Write-Host "[E2E] $msg" -ForegroundColor Red }

# ---------------------------------------------------------------------------
# Step 1: Load environment
# ---------------------------------------------------------------------------
Log "Loading E2E environment..."

if (Test-Path $E2EEnvFile) {
  Warn "Loading env from $E2EEnvFile"
  Get-Content $E2EEnvFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
      $key = $matches[1].Trim()
      $val = $matches[2].Trim().Trim('"').Trim("'")
      Set-Item -Path "Env:$key" -Value $val
    }
  }
} else {
  Warn "No .env.e2e file found. Using shell environment variables."
}

# Validate required env vars
$RequiredVars = @("E2E_AUTH_SECRET", "E2E_DATABASE_URL", "E2E_DIRECT_URL", "E2E_DOWNSTREAM_URL")
foreach ($var in $RequiredVars) {
  $val = [Environment]::GetEnvironmentVariable($var)
  if (-not $val) {
    Fail "Missing required env var: $var"
    Fail "Create a .env.e2e file or set it in your shell."
    exit 1
  }
}
Ok "Environment validated"

# ---------------------------------------------------------------------------
# Step 2: Build Docker image
# ---------------------------------------------------------------------------
if (-not $NoBuild) {
  Log "Building Docker image $ImageName..."
  docker build -t $ImageName $ProjectRoot
  if ($LASTEXITCODE -ne 0) { Fail "Docker build failed"; exit 1 }
  Ok "Docker image built"
} else {
  Warn "Skipping Docker build (-NoBuild flag)"
}

# ---------------------------------------------------------------------------
# Step 3: Start container
# ---------------------------------------------------------------------------
Log "Starting container $ContainerName..."

docker rm -f $ContainerName 2>$null

$envVars = @(
  "-e", "AUTH_SECRET=$env:E2E_AUTH_SECRET",
  "-e", "DATABASE_URL=$env:E2E_DATABASE_URL",
  "-e", "DIRECT_URL=$env:E2E_DIRECT_URL",
  "-e", "DOWNSTREAM_QUARRYLINK_SERVICE_URL=$env:E2E_DOWNSTREAM_URL",
  "-e", "TENANT_FUSION_SERVICE_URL=$env:E2E_TENANT_FUSION_URL",
  "-e", "CLOUDFRONT_PUBLIC_URL=$env:E2E_CLOUDFRONT_URL",
  "-e", "AWS_S3_TENANT_ASSETS_BUCKET=$env:E2E_S3_BUCKET",
  "-e", "RESEND_API_KEY=$env:E2E_RESEND_API_KEY",
  "-e", "EMAIL_FROM=$env:E2E_EMAIL_FROM",
  "-e", "NODE_ENV=production"
)

$dockerArgs = @("run", "-d", "--name", $ContainerName, "-p", "3000:3000") + $envVars + @($ImageName)
docker @dockerArgs
if ($LASTEXITCODE -ne 0) { Fail "Container failed to start"; exit 1 }
Ok "Container started"

# ---------------------------------------------------------------------------
# Step 4: Wait for app to be healthy
# ---------------------------------------------------------------------------
Log "Waiting for app to be ready..."

$MaxWait = 60
$Waited = 0
$Ready = $false
while ($Waited -lt $MaxWait) {
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:3000/login" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($resp.StatusCode -eq 200 -or $resp.StatusCode -eq 302) {
      $Ready = $true
      Ok "App is ready (waited ${Waited}s)"
      break
    }
  } catch {}
  Start-Sleep -Seconds 2
  $Waited += 2
  Write-Host -NoNewline "."
}

Write-Host ""

if (-not $Ready) {
  Fail "App did not become ready within ${MaxWait}s"
  docker logs $ContainerName --tail 50
  exit 1
}

# ---------------------------------------------------------------------------
# Step 5: Run Playwright tests
# ---------------------------------------------------------------------------
Log "Running E2E tests against http://localhost:3000..."

$env:E2E_BASE_URL = "http://localhost:3000"

Set-Location $ProjectRoot

npx playwright install chromium 2>$null

npx playwright test --reporter=html,json,list --output="$ResultsDir\output"
$TestExit = $LASTEXITCODE

# ---------------------------------------------------------------------------
# Step 6: Print text report
# ---------------------------------------------------------------------------
Log "Generating text report..."

$JsonReport = Join-Path $ResultsDir "results.json"
if (Test-Path $JsonReport) {
  node -e "
    const fs = require('fs');
    const report = JSON.parse(fs.readFileSync('$JsonReport'.replace(/\\\\/g, '/'), 'utf8'));
    const suites = {};
    for (const suite of report.suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          for (const result of test.results || []) {
            const sn = suite.title || 'Unknown';
            const sp = spec.title || 'Unknown';
            if (!suites[sn]) suites[sn] = [];
            suites[sn].push({ name: sp, status: result.status, duration: result.duration || 0 });
          }
        }
      }
    }
    let p=0,f=0,s=0,fl=0;
    for (const [suite, tests] of Object.entries(suites)) {
      console.log(''); console.log('  ' + suite); console.log('  ' + '-'.repeat(suite.length));
      for (const t of tests) {
        const icon = t.status==='passed'?'v':t.status==='failed'?'X':t.status==='skipped'?'o':'?';
        const color = t.status==='passed'?'\x1b[32m':t.status==='failed'?'\x1b[31m':'\x1b[33m';
        console.log('  '+color+icon+'\x1b[0m '+t.name+' ('+(t.duration/1000).toFixed(1)+'s)');
        if(t.status==='passed')p++;else if(t.status==='failed')f++;else if(t.status==='skipped')s++;else fl++;
      }
    }
    console.log(''); console.log('================================================================');
    console.log('  Total: '+(p+f+s+fl)+' | Passed: '+p+' | Failed: '+f+' | Skipped: '+s+' | Flaky: '+fl);
    console.log('================================================================');
  " 2>$null
} else {
  Warn "No JSON report found"
}

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------
if ($Keep) {
  Warn "Keeping container $ContainerName running (-Keep flag)"
} else {
  Log "Tearing down container $ContainerName..."
  docker rm -f $ContainerName 2>$null
  Ok "Container removed"
  if (-not $NoBuild) {
    docker rmi $ImageName 2>$null
  }
}

$EndTime = Get-Date
$Duration = ($EndTime - $StartTime).TotalSeconds

Write-Host ""
Write-Host "================================================================"
if ($TestExit -eq 0) { Ok "  Status: PASSED" } else { Fail "  Status: FAILED (exit code: $TestExit)" }
Write-Host "  Duration: $([math]::Round($Duration))s"
Write-Host "  HTML Report: $ReportDir\index.html"
Write-Host "  JSON Report: $ResultsDir\results.json"
Write-Host ""
Write-Host "  Open report:  npm run e2e:report"
Write-Host "================================================================"

exit $TestExit
