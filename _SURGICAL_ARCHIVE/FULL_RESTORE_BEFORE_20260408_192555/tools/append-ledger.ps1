param(
  [Parameter(Mandatory=$true)][string]$FilePath,
  [Parameter(Mandatory=$true)][string]$Summary
)

if (!(Test-Path $FilePath)) {
  Write-Host "File not found: $FilePath" -ForegroundColor Red
  exit 1
}

$ledger = ".\docs\ASSISTANT_FILE_LEDGER.md"
if (!(Test-Path $ledger)) {
  Write-Host "Ledger not found. Create .\docs\ASSISTANT_FILE_LEDGER.md first." -ForegroundColor Red
  exit 1
}

$hash = (Get-FileHash $FilePath -Algorithm SHA256).Hash
$time = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$entry = @"
## $time
**File:** `$FilePath`  
**SHA256:** `$hash`  
**Summary:** $Summary

---
"@

Add-Content -Path $ledger -Value $entry -Encoding UTF8
Write-Host "Logged $FilePath" -ForegroundColor Green
