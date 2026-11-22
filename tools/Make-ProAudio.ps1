# Makes ALL the audio for French for Professionals with ElevenLabs: the teacher intros and every scenario line.
# Run it from the project folder:  .\tools\Make-ProAudio.ps1
# It makes the lessons level by level, A0 first. If your credits run out it stops, tells you, and writes down
# which lessons are complete. Add credits, run it again, and it carries on where it stopped (it never remakes a file).
# Option: -UpTo A2 records only up to that level (A0 A1 A2 B1 B2 C1 C2).
param([string]$UpTo = "C2")
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$pro = Join-Path $root "public\professional"
$scn = Join-Path $pro "scenario"
$key = $env:ELEVENLABS_API_KEY
if (-not $key) {
  Write-Host "Paste your ElevenLabs key here (it stays on this computer, nothing is shown):" -ForegroundColor Yellow
  $sec = Read-Host -AsSecureString
  $key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}
if (-not $key) { Write-Host "No key, nothing done." -ForegroundColor Red; return }
$h = @{ "xi-api-key" = $key }
$manifest = Get-Content (Join-Path $scn "manifest.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$lessons = Get-Content (Join-Path $scn "lessons.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$order = @("00 cues", "a0", "a1", "a2", "b1", "b2", "c1", "c2")
$limit = [array]::IndexOf($order, $UpTo.ToLower()); if ($limit -lt 0) { $limit = 7 }
function Find-Voice($name) {
  $r = Invoke-RestMethod -Uri ("https://api.elevenlabs.io/v2/voices?search=" + [uri]::EscapeDataString($name) + "&page_size=50") -Headers $h
  return ($r.voices | Where-Object { $_.name -like ($name + "*") } | Select-Object -First 1)
}
try { $voice = Find-Voice "Eryn" } catch { Write-Host ("ElevenLabs refused the voice lookup: " + $_.Exception.Message) -ForegroundColor Red; return }
if (-not $voice) { Write-Host "No voice named Eryn in this ElevenLabs account." -ForegroundColor Yellow; return }
$cvoice = $voice
if ($env:ELEVENLABS_CLIENT_VOICE) { try { $cv = Find-Voice $env:ELEVENLABS_CLIENT_VOICE; if ($cv) { $cvoice = $cv } } catch {} }
Write-Host ("Teacher voice: " + $voice.name + "   Other-person voice: " + $cvoice.name)
$audioDir = Join-Path $scn "audio"; New-Item -ItemType Directory -Force -Path $audioDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $pro "audio") | Out-Null
$models = @("eleven_v3", "eleven_multilingual_v2"); $mi = 0; $made = 0; $had = 0; $stopped = $false; $chars = 0
foreach ($ln in $manifest.lines) {
  if ($stopped) { break }
  $ti = [array]::IndexOf($order, [string]$ln.tier); if ($ti -gt $limit) { continue }
  if ($ln.file) { $file = Join-Path $pro ($ln.file -replace "/", "\") } else { $file = Join-Path $audioDir ($ln.id + ".mp3") }
  if ((Test-Path $file) -and ((Get-Item $file).Length -gt 1000)) { $had++; continue }
  $vid = if ($ln.role -eq "c") { $cvoice.voice_id } else { $voice.voice_id }
  $tries = 0
  while ($true) {
    try {
      $body = @{ text = $ln.text; model_id = $models[$mi]; voice_settings = @{ stability = 0.5; similarity_boost = 0.75 } } | ConvertTo-Json -Depth 4
      Invoke-WebRequest -Method Post -Uri ("https://api.elevenlabs.io/v1/text-to-speech/" + $vid + "?output_format=mp3_44100_128") -Headers ($h + @{ "Content-Type" = "application/json; charset=utf-8" }) -Body ([Text.Encoding]::UTF8.GetBytes($body)) -OutFile $file | Out-Null
      $made++; $chars += $ln.text.Length
      if ($made % 25 -eq 0) { Write-Host ("Made " + $made + " files so far (level " + $ln.tier + ")") }
      Start-Sleep -Milliseconds 120
      break
    } catch {
      $code = 0; $msg = ""
      try { $code = [int]$_.Exception.Response.StatusCode; $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $msg = $sr.ReadToEnd() } catch {}
      if (Test-Path $file) { Remove-Item $file -Force }
      if (($code -eq 400 -or $code -eq 404 -or $code -eq 422) -and $mi -lt ($models.Count - 1) -and $made -eq 0 -and $msg -notmatch "quota|credit") { $mi++; Write-Host ("Switching model to " + $models[$mi]); continue }
      if ($code -ge 500 -and $tries -lt 2) { $tries++; Start-Sleep -Seconds 3; continue }
      if ($code -eq 401 -or $code -eq 402 -or $code -eq 429 -or $msg -match "quota|credit|limit") {
        Write-Host ("STOPPED: ElevenLabs says your credits are finished (or the key is refused). Error " + $code + ". Add credits, then run this again.") -ForegroundColor Red
      } else { Write-Host ("STOPPED at level " + $ln.tier + ": error " + $code + " " + $msg) -ForegroundColor Red }
      $stopped = $true; break
    }
  }
}
# write down which lessons are now complete, so the app only opens lessons that really have all their audio
$ready = New-Object System.Collections.ArrayList
foreach ($p in $lessons.PSObject.Properties) {
  $ok = $true
  foreach ($id in $p.Value) {
    $f = Join-Path $audioDir ($id + ".mp3")
    if (-not ((Test-Path $f) -and ((Get-Item $f).Length -gt 1000))) { $ok = $false; break }
  }
  if ($ok) { [void]$ready.Add($p.Name) }
}
$json = (@{ lessons = $ready } | ConvertTo-Json -Compress)
[IO.File]::WriteAllText((Join-Path $scn "ready.json"), $json, (New-Object Text.UTF8Encoding($false)))
Write-Host ""
Write-Host ("Made " + $made + " new files (" + $chars + " characters), already there " + $had + ".") -ForegroundColor Green
Write-Host ("Lessons complete and ready to open: " + $ready.Count + " of " + @($lessons.PSObject.Properties).Count) -ForegroundColor Green
if ($stopped) { Write-Host "Not finished. Add credits and run it again. Then deploy to publish what is ready." -ForegroundColor Yellow }
explorer.exe /select,$scn
