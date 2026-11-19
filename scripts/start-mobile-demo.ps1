<#
.SYNOPSIS
    ZYVO Mobile HTTPS Demo Starter Script (Cloudflare Quick Tunnel)
.DESCRIPTION
    Safely initiates a temporary Cloudflare Quick Tunnel to provide an HTTPS secure context
    for remote mobile device microphone testing without purchasing domains or paid cloud resources.
.PARAMETER Port
    Local port where ZYVO is running (defaults to 3000).
.PARAMETER StartTunnel
    Mandatory explicit switch to confirm tunnel launch. Never starts without this switch.
#>

[CmdletBinding()]
param(
    [int]$Port = 3000,
    [switch]$StartTunnel
)

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   ZYVO MOBILE HTTPS DEMO TUNNEL CONTROLLER" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Confirm local application is running
Write-Host "[1/3] Checking local ZYVO application server on port $Port..." -ForegroundColor Yellow
$connection = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue

if (-not $connection.TcpTestSucceeded) {
    Write-Host "ERROR: Local ZYVO server is not running on http://localhost:$Port." -ForegroundColor Red
    Write-Host "Start the application first using: npm run dev (or npm run start)" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Local server is active and responding on port $Port." -ForegroundColor Green

# 2. Check cloudflared prerequisite
Write-Host "`n[2/3] Checking Cloudflare Quick Tunnel utility (cloudflared)..." -ForegroundColor Yellow
$cloudflaredCmd = Get-Command cloudflared -ErrorAction SilentlyContinue

if (-not $cloudflaredCmd) {
    Write-Host "PREREQUISITE NOTICE: 'cloudflared' was not found in system PATH." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To enable secure HTTPS tunneling for remote mobile devices:" -ForegroundColor White
    Write-Host "  1. Download cloudflared for Windows from official GitHub releases:" -ForegroundColor Gray
    Write-Host "     https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Cyan
    Write-Host "  2. Place 'cloudflared.exe' in your PATH or in C:\Windows\System32" -ForegroundColor Gray
    Write-Host "  3. Re-run this script with the -StartTunnel switch:" -ForegroundColor Gray
    Write-Host "     .\scripts\start-mobile-demo.ps1 -StartTunnel" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: Quick Tunnels are 100% free and require zero account or credit card registration." -ForegroundColor Gray
    exit 0
}
Write-Host "✓ cloudflared executable found at: $($cloudflaredCmd.Source)" -ForegroundColor Green

# 3. Guard against accidental public tunnel initiation
Write-Host "`n[3/3] Evaluating launch authorization..." -ForegroundColor Yellow
if (-not $StartTunnel) {
    Write-Host "Tunnel initiation skipped because -StartTunnel switch was not provided." -ForegroundColor Yellow
    Write-Host "To launch the temporary tunnel, execute:" -ForegroundColor White
    Write-Host "  .\scripts\start-mobile-demo.ps1 -StartTunnel" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ZYVO Security Policy: Public tunnels are NEVER initiated automatically." -ForegroundColor Gray
    exit 0
}

Write-Host "Starting temporary Cloudflare Quick Tunnel for http://localhost:$Port..." -ForegroundColor Green
Write-Host "Press Ctrl+C at any time to terminate the tunnel immediately." -ForegroundColor Gray
Write-Host ""

try {
    # Launch cloudflared tunnel
    & cloudflared tunnel --url "http://localhost:$Port"
} catch {
    Write-Host "Tunnel stopped: $_" -ForegroundColor Yellow
} finally {
    Write-Host "`nTunnel closed safely. Local application remains protected." -ForegroundColor Green
}
