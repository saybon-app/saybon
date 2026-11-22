# Records ONLY the 70 teacher intros (one per profession and level) with ElevenLabs, voice Eryn.
# Run from the project folder:  .\tools\Make-ProIntros.ps1
# It asks for your ElevenLabs key (typed hidden, kept only in this window, never saved).
# It records A0 for all ten professions first, then A1, and so on. It never remakes a file that exists.
# When your credits run out it stops cleanly. Run it again later and it carries on.
param([int]$MaxChars = 0)   # optional cap, e.g. -MaxChars 10000 stops before spending more than that
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$pro = Join-Path $root "public\professional"
$scn = Join-Path $pro "scenario"
Write-Host "Paste your ElevenLabs API key and press Enter (nothing will show):" -ForegroundColor Yellow
$sec = Read-Host -AsSecureString
$key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
if (-not $key) { Write-Host "No key, nothing done." -ForegroundColor Red; return }
$h = @{ "xi-api-key" = $key.Trim() }
try {
  $sub = Invoke-RestMethod -Uri "https://api.elevenlabs.io/v1/user/subscription" -Headers $h
  $left = [int]$sub.character_limit - [int]$sub.character_count
  Write-Host ("Key accepted. Credits left: " + $left) -ForegroundColor Green
} catch { Write-Host ("ElevenLabs refused this key: " + $_.Exception.Message) -ForegroundColor Red; return }
$manifest = Get-Content (Join-Path $scn "manifest.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$intros = @($manifest.lines | Where-Object { $_.id -like "intro-*" })
$order = @("a0","a1","a2","b1","b2","c1","c2")
$intros = $intros | Sort-Object { [array]::IndexOf($order, [string]$_.tier) }
Write-Host ("Intros in total: " + $intros.Count)
$r = Invoke-RestMethod -Uri "https://api.elevenlabs.io/v2/voices?search=Eryn&page_size=50" -Headers $h
$voice = $r.voices | Where-Object { $_.name -like "Eryn*" } | Select-Object -First 1
if (-not $voice) { Write-Host "No voice named Eryn in this ElevenLabs account." -ForegroundColor Yellow; return }
$audioDir = Join-Path $pro "audio"; New-Item -ItemType Directory -Force -Path $audioDir | Out-Null
$made = 0; $had = 0; $chars = 0; $stopped = $false
foreach ($ln in $intros) {
  $file = Join-Path $pro ($ln.file -replace "/", "\")
  if ((Test-Path $file) -and ((Get-Item $file).Length -gt 1000)) { $had++; continue }
  if ($MaxChars -gt 0 -and ($chars + $ln.text.Length) -gt $MaxChars) { Write-Host ("Reached your cap of " + $MaxChars + " characters.") -ForegroundColor Yellow; $stopped = $true; break }
  $tries = 0
  while ($true) {
    try {
      $body = @{ text = $ln.text; model_id = "eleven_v3"; voice_settings = @{ stability = 0.5; similarity_boost = 0.75 } } | ConvertTo-Json -Depth 4
      Invoke-WebRequest -Method Post -Uri ("https://api.elevenlabs.io/v1/text-to-speech/" + $voice.voice_id + "?output_format=mp3_44100_128") -Headers ($h + @{ "Content-Type" = "application/json; charset=utf-8" }) -Body ([Text.Encoding]::UTF8.GetBytes($body)) -OutFile $file | Out-Null
      if ((Get-Item $file).Length -lt 1000) { Remove-Item $file -Force; throw "empty audio" }
      $made++; $chars += $ln.text.Length
      Write-Host ("Done " + $ln.id + "  (" + $made + " made, " + $chars + " characters used)")
      Start-Sleep -Milliseconds 150
      break
    } catch {
      $code = 0; $msg = ""
      try { $code = [int]$_.Exception.Response.StatusCode; $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $msg = $sr.ReadToEnd() } catch {}
      if (Test-Path $file) { Remove-Item $file -Force }
      if (($code -ge 500 -or $code -eq 0) -and $tries -lt 2) { $tries++; Start-Sleep -Seconds 3; continue }
      if ($code -eq 401 -or $code -eq 402 -or $code -eq 429 -or $msg -match "quota|credit|limit") {
        Write-Host ("STOPPED: credits finished (or key refused). Error " + $code + ". Run this again when you have credits.") -ForegroundColor Red
      } else { Write-Host ("STOPPED at " + $ln.id + ": error " + $code + " " + $msg) -ForegroundColor Red }
      $stopped = $true; break
    }
  }
  if ($stopped) { break }
}
$have = @($intros | Where-Object { $f = Join-Path $pro ($_.file -replace "/", "\"); (Test-Path $f) -and ((Get-Item $f).Length -gt 1000) }).Count
Write-Host ""
Write-Host ("New this run: " + $made + " (" + $chars + " characters). Intros recorded in total: " + $have + " of " + $intros.Count) -ForegroundColor Green
if ($stopped) { Write-Host "Not finished. Run it again when credits are added. Deploy to publish what is recorded." -ForegroundColor Yellow }
explorer.exe /select,$audioDir
