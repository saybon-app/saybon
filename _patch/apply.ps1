# Surgical patch for C:\SayBon\public\dashboard\index.html
#  1) loads /css/dashboard-bright.css last
#  2) adds the "French for Schools" card straight after "French for Professionals"
# Nothing else is touched. Safe to run twice. Original is saved as index.html.bak-bright
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$file = Join-Path $root 'public\dashboard\index.html'
if (-not (Test-Path $file)) { throw "Not found: $file  (run this from the SayBon repo after unzipping into it)" }
if (-not (Test-Path (Join-Path $root 'public\css\dashboard-bright.css'))) { throw "public\css\dashboard-bright.css is missing. Unzip into the repo root first." }

$utf8 = New-Object System.Text.UTF8Encoding($false)
$bytes = [System.IO.File]::ReadAllBytes($file)
$hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
$text = $utf8.GetString($bytes)
if ($hasBom) { $text = $text.Substring(1) }
$nl = if ($text.Contains("`r`n")) { "`r`n" } else { "`n" }
$changed = $false

# 1) stylesheet link, right after dashboard-sharp.css
if ($text -notmatch 'dashboard-bright\.css') {
  $rx = [regex]'(<link[^>]*dashboard-sharp\.css[^>]*>)'
  if (-not $rx.IsMatch($text)) { throw 'Could not find the dashboard-sharp.css <link> line.' }
  $text = $rx.Replace($text, ('$1' + $nl + '  <link rel="stylesheet" href="/css/dashboard-bright.css?v=1" />'), 1)
  $changed = $true
}

# 2) the new card, straight after the French for Professionals card
if ($text -notmatch 'card-schools') {
  $rx = [regex]'(?s)(<div class="dash-card card-professional".*?</span>\s*</div>)'
  $m = $rx.Match($text)
  if (-not $m.Success) { throw 'Could not find the French for Professionals card.' }
  $card = @(
    '',
    '      <div class="dash-card card-schools" onclick="window.location.href=''/schools/''">',
    '        <div class="emoji">&#127979;</div>',
    '        <h3>French for Schools</h3>',
    '        <span>School access only</span>',
    '      </div>'
  ) -join $nl
  $text = $text.Insert($m.Index + $m.Groups[1].Length, $nl + $card)
  $changed = $true
}

if ($changed) {
  Copy-Item $file ($file + '.bak-bright') -Force
  $out = $utf8.GetBytes($text)
  if ($hasBom) { $out = [byte[]](0xEF,0xBB,0xBF) + $out }
  [System.IO.File]::WriteAllBytes($file, $out)
  Write-Host 'Patched public\dashboard\index.html' -ForegroundColor Green
} else {
  Write-Host 'Already patched. Nothing to do.' -ForegroundColor Yellow
}
