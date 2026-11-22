# Finds your scenario pictures (named like medical-a0-wide.png and medical-a0-tall.png) and puts them in the app.
# Run it from the project folder:  .\tools\Add-ProPictures.ps1
# By default it looks in your Downloads folder. Another folder: .\tools\Add-ProPictures.ps1 -Source "D:\Pictures"
param([string]$Source = (Join-Path $env:USERPROFILE "Downloads"))
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$img = Join-Path $root "public\professional\scenario\img"
New-Item -ItemType Directory -Force -Path $img | Out-Null
$groups = @("medical", "legal", "military", "police", "border", "banking", "logistics", "hospitality", "business", "education")
$levels = @("a0", "a1", "a2", "b1", "b2", "c1", "c2")
$rx = '^(' + ($groups -join '|') + ')-(' + ($levels -join '|') + ')-(wide|tall)\.(png|jpg|jpeg|webp)$'
$found = Get-ChildItem -Path $Source -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Name.ToLower() -match $rx } | Sort-Object LastWriteTime
$n = 0
foreach ($f in $found) {
  $base = [IO.Path]::GetFileNameWithoutExtension($f.Name).ToLower()
  Get-ChildItem $img -Filter ($base + ".*") -ErrorAction SilentlyContinue | Remove-Item -Force
  Copy-Item $f.FullName (Join-Path $img ($base + $f.Extension.ToLower())) -Force; $n++
}
$have = @{}
Get-ChildItem $img -File | Where-Object { $_.Name -match $rx } | ForEach-Object { $have[[IO.Path]::GetFileNameWithoutExtension($_.Name)] = 1 }
$missing = @()
foreach ($g in $groups) { foreach ($l in $levels) { foreach ($v in @("wide", "tall")) { if (-not $have.ContainsKey("$g-$l-$v")) { $missing += "$g-$l-$v" } } } }
Write-Host ("Copied " + $n + " pictures. In the app now: " + $have.Count + " of 140. Still missing: " + $missing.Count) -ForegroundColor Green
if ($missing.Count -gt 0 -and $missing.Count -lt 141) { ($missing | Select-Object -First 12) -join ", " | Write-Host; if ($missing.Count -gt 12) { Write-Host "..." } }
explorer.exe /select,$img
