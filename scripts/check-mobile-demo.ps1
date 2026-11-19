<#
.SYNOPSIS
    ZYVO Mobile Demo Environment Diagnostic Check
.DESCRIPTION
    Validates that the ZYVO local application is ready for mobile evaluation:
    verifies local port accessibility, HTTP response codes, API health,
    and reports secure context (HTTPS) readiness for browser microphone APIs.
.PARAMETER Port
    Port number to evaluate (default: 3000).
#>

[CmdletBinding()]
param(
    [int]$Port = 3000
)

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   ZYVO MOBILE DEMO READINESS DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

$results = @{
    PortOpen = $false
    HttpOk = $false
    ApiHealthy = $false
    CloudflaredInstalled = $false
}

# 1. Check Port Availability
Write-Host "[1/4] Checking TCP port $Port on localhost..." -NoNewline
$portTest = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
if ($portTest.TcpTestSucceeded) {
    Write-Host " [PASS]" -ForegroundColor Green
    $results.PortOpen = $true
} else {
    Write-Host " [OFFLINE]" -ForegroundColor Red
    Write-Host "      Notice: Local server is not currently listening on port $Port." -ForegroundColor Gray
}

# 2. Check HTTP Root Endpoint
Write-Host "[2/4] Testing HTTP Root Page (http://localhost:$Port)..." -NoNewline
if ($results.PortOpen) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port" -Method GET -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host " [PASS (200 OK)]" -ForegroundColor Green
            $results.HttpOk = $true
        } else {
            Write-Host " [WARN (HTTP $($response.StatusCode))]" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " [FAILED: $($_.Exception.Message)]" -ForegroundColor Red
    }
} else {
    Write-Host " [SKIPPED - Server Offline]" -ForegroundColor Gray
}

# 3. Check Modules & Workspaces Health API
Write-Host "[3/4] Testing Core API Endpoint (/api/modules)..." -NoNewline
if ($results.PortOpen) {
    try {
        $apiRes = Invoke-RestMethod -Uri "http://localhost:$Port/api/modules" -Method GET -TimeoutSec 5
        if ($apiRes.modules -and $apiRes.modules.Count -eq 5) {
            Write-Host " [PASS (All 5 Modules Registered)]" -ForegroundColor Green
            $results.ApiHealthy = $true
        } else {
            Write-Host " [WARN: Unexpected payload]" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " [FAILED: $($_.Exception.Message)]" -ForegroundColor Red
    }
} else {
    Write-Host " [SKIPPED - Server Offline]" -ForegroundColor Gray
}

# 4. Check HTTPS Secure Context Utility (cloudflared)
Write-Host "[4/4] Checking cloudflared for mobile HTTPS context..." -NoNewline
$cf = Get-Command cloudflared -ErrorAction SilentlyContinue
if ($cf) {
    Write-Host " [INSTALLED]" -ForegroundColor Green
    $results.CloudflaredInstalled = $true
} else {
    Write-Host " [NOT INSTALLED]" -ForegroundColor Yellow
    Write-Host "      Notice: Remote mobile devices require HTTPS for browser microphone access." -ForegroundColor Gray
    Write-Host "      Run .\scripts\start-mobile-demo.ps1 for instructions to enable free Quick Tunnel." -ForegroundColor Gray
}

Write-Host ""
Write-Host "----------------------------------------------------" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC SUMMARY:" -ForegroundColor Cyan
Write-Host "  - Local Port $Port:          $($results.PortOpen)"
Write-Host "  - Web Interface Ready:     $($results.HttpOk)"
Write-Host "  - All 5 Vertical APIs:     $($results.ApiHealthy)"
Write-Host "  - Mobile HTTPS Tunneling:  $($results.CloudflaredInstalled)"
Write-Host "----------------------------------------------------" -ForegroundColor Cyan

if ($results.PortOpen -and $results.HttpOk -and $results.ApiHealthy) {
    Write-Host "RESULT: ZYVO local environment is fully operational for desktop and local mobile testing." -ForegroundColor Green
} else {
    Write-Host "RESULT: Run 'npm run dev' inside 'zyvo' before launching mobile evaluation." -ForegroundColor Yellow
}
