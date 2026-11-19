<#
.SYNOPSIS
    ZYVO Safe Demonstration Data Reset Utility
.DESCRIPTION
    Safely resets transactional demonstration records (orders, calendar entries, appointments,
    procurement lots, audit logs) to a clean baseline state.
    Strictly preserves database file, permanent table schemas, user accounts, and product catalogs.
.PARAMETER ConfirmDemoReset
    Mandatory explicit safety switch. The script refuses to run without this parameter.
#>

[CmdletBinding()]
param(
    [switch]$ConfirmDemoReset
)

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   ZYVO SAFE DEMONSTRATION DATA RESET UTILITY" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $ConfirmDemoReset) {
    Write-Host "SAFETY GUARD ENGAGED:" -ForegroundColor Yellow
    Write-Host "To prevent accidental data loss, this reset utility requires the -ConfirmDemoReset switch." -ForegroundColor White
    Write-Host ""
    Write-Host "Usage: .\scripts\reset-demo.ps1 -ConfirmDemoReset" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Tables that will be purged to clean baseline:" -ForegroundColor Gray
    Write-Host "  - milk_delivery_calendar (dynamic modifications)" -ForegroundColor Gray
    Write-Host "  - kirana_grocery_orders & order_items" -ForegroundColor Gray
    Write-Host "  - vegetable_orders & order_items" -ForegroundColor Gray
    Write-Host "  - clinic_appointments (reserves slot is_booked = 0)" -ForegroundColor Gray
    Write-Host "  - agri_procurement_requests, items & pickup schedules" -ForegroundColor Gray
    Write-Host "  - voice_submissions & audit_events" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Permanent tables strictly preserved:" -ForegroundColor Green
    Write-Host "  - users, workspaces, workspace_memberships" -ForegroundColor Green
    Write-Host "  - kirana_product_catalog & aliases" -ForegroundColor Green
    Write-Host "  - vegetable_produce_catalog & aliases" -ForegroundColor Green
    Write-Host "  - clinic_doctors & predefined slot schedule" -ForegroundColor Green
    Write-Host "  - agri_crop_catalog (with official PIB MSP metadata)" -ForegroundColor Green
    exit 1
}

Write-Host "[1/2] Invoking secure local purge endpoint..." -ForegroundColor Yellow

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Execute reset via standard Node.js database connection
$nodeScript = @"
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.join(process.cwd(), 'zyvo.db');
const db = new DatabaseSync(dbPath);

console.log('Purging dynamic transaction tables in foreign key order...');
db.prepare('DELETE FROM audit_events').run();
db.prepare('DELETE FROM kirana_grocery_order_items').run();
db.prepare('DELETE FROM kirana_grocery_orders').run();
db.prepare('DELETE FROM vegetable_order_items').run();
db.prepare('DELETE FROM vegetable_orders').run();
db.prepare('DELETE FROM clinic_appointments').run();
db.prepare('UPDATE clinic_appointment_slots SET is_booked = 0').run();
db.prepare('DELETE FROM agri_pickup_schedules').run();
db.prepare('DELETE FROM agri_procurement_items').run();
db.prepare('DELETE FROM agri_procurement_requests').run();
db.prepare('DELETE FROM milk_delivery_calendar').run();
db.prepare('DELETE FROM voice_submissions').run();

// Clean up synthetic audio files in storage/audio if any exist
const fs = require('node:fs');
const audioDir = path.join(process.cwd(), 'storage', 'audio');
if (fs.existsSync(audioDir)) {
  const files = fs.readdirSync(audioDir);
  for (const file of files) {
    if (file.startsWith('vsub_')) {
      try { fs.unlinkSync(path.join(audioDir, file)); } catch (e) {}
    }
  }
}

console.log('✓ Dynamic transaction data safely purged.');
console.log('✓ All clinic appointment slots released to is_booked = 0.');
console.log('✓ Core configuration, seed users, workspaces, and catalogs intact.');
"@

Push-Location $projectRoot
try {
    node -e $nodeScript
    Write-Host "`n[2/2] Reset complete!" -ForegroundColor Green
    Write-Host "ZYVO platform is in clean baseline state ready for judge demonstration." -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: Failed to reset demo data: $_" -ForegroundColor Red
} finally {
    Pop-Location
}
