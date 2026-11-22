# Makes the 3 teacher intros (relaxed, steady, intensive) for French for Professionals with ElevenLabs (voice: Eryn).
# Needs $env:ELEVENLABS_API_KEY in this PowerShell window. Safe to run again: it only makes missing files.
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$key = $env:ELEVENLABS_API_KEY
if (-not $key) { Write-Host "ELEVENLABS_API_KEY is not set in this window." -ForegroundColor Yellow; return $false }
$h = @{ "xi-api-key" = $key }
$dir = Join-Path $root "public\professional"
$out = Join-Path $dir "audio"
New-Item -ItemType Directory -Force -Path $out | Out-Null
$texts = Get-Content (Join-Path $dir "intro-texts.json") -Raw -Encoding UTF8 | ConvertFrom-Json
try {
  $r = Invoke-RestMethod -Uri "https://api.elevenlabs.io/v2/voices?search=Eryn&page_size=50" -Headers $h
  $voice = $r.voices | Where-Object { $_.name -like "Eryn*" } | Select-Object -First 1
} catch { Write-Host ("Could not read your voices: " + $_.Exception.Message) -ForegroundColor Yellow; return $false }
if (-not $voice) { Write-Host "No voice named Eryn in your ElevenLabs account." -ForegroundColor Yellow; return $false }
Write-Host ("Voice: " + $voice.name)
$models = @("eleven_v4", "eleven_v3", "eleven_multilingual_v2"); $mi = 0; $made = 0
foreach ($k in @("relaxed", "steady", "intensive")) {
  $file = Join-Path $out ("intro-" + $k + ".mp3")
  if ((Test-Path $file) -and ((Get-Item $file).Length -gt 1000)) { Write-Host ("Already there: " + $k); continue }
  $text = $texts.$k
  while ($true) {
    try {
      $body = @{ text = $text; model_id = $models[$mi]; voice_settings = @{ stability = 0.5; similarity_boost = 0.75 } } | ConvertTo-Json -Depth 4
      Invoke-WebRequest -Method Post -Uri ("https://api.elevenlabs.io/v1/text-to-speech/" + $voice.voice_id + "?output_format=mp3_44100_128") -Headers ($h + @{ "Content-Type" = "application/json; charset=utf-8" }) -Body ([Text.Encoding]::UTF8.GetBytes($body)) -OutFile $file | Out-Null
      $made++; Write-Host ("Made: " + $k + " (" + $models[$mi] + ")"); break
    } catch {
      $code = 0; try { $code = [int]$_.Exception.Response.StatusCode } catch {}
      if (Test-Path $file) { Remove-Item $file -Force }
      if (($code -eq 400 -or $code -eq 404 -or $code -eq 422) -and $mi -lt ($models.Count - 1) -and $made -eq 0) { $mi++; Write-Host ("Switching model to " + $models[$mi]); continue }
      Write-Host ("Stopped at " + $k + " (error " + $code + "). If your credits ran out, top up and run it again.") -ForegroundColor Yellow; return $false
    }
  }
}
Write-Host ("Done. Made " + $made + " of 3.") -ForegroundColor Green
explorer.exe /select,(Join-Path $out "intro-steady.mp3")
