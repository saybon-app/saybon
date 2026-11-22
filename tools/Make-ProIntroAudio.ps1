# Makes the teacher intros for French for Professionals (every level x relaxed / steady / intensive) with ElevenLabs, voice Eryn.
# Needs $env:ELEVENLABS_API_KEY in this PowerShell window. Safe to run again: it only makes missing files.
# If your credits run out it stops cleanly and tells you. Top up, then run it again and it carries on.
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
} catch { Write-Host ("ElevenLabs refused the voice lookup: " + $_.Exception.Message) -ForegroundColor Red; return $false }
if (-not $voice) { Write-Host "No voice named Eryn in your ElevenLabs account." -ForegroundColor Yellow; return $false }
Write-Host ("Voice: " + $voice.name)
$models = @("eleven_v4", "eleven_v3", "eleven_multilingual_v2"); $mi = 0; $made = 0; $had = 0; $stopped = $false
foreach ($lv in @("A0", "A1", "A2", "B1", "B2", "C1")) {
  foreach ($k in @("relaxed", "steady", "intensive")) {
    if ($stopped) { break }
    $file = Join-Path $out ("intro-" + $lv + "-" + $k + ".mp3")
    if ((Test-Path $file) -and ((Get-Item $file).Length -gt 1000)) { $had++; continue }
    $text = $texts.$lv.$k
    while ($true) {
      try {
        $body = @{ text = $text; model_id = $models[$mi]; voice_settings = @{ stability = 0.5; similarity_boost = 0.75 } } | ConvertTo-Json -Depth 4
        Invoke-WebRequest -Method Post -Uri ("https://api.elevenlabs.io/v1/text-to-speech/" + $voice.voice_id + "?output_format=mp3_44100_128") -Headers ($h + @{ "Content-Type" = "application/json; charset=utf-8" }) -Body ([Text.Encoding]::UTF8.GetBytes($body)) -OutFile $file | Out-Null
        $made++; Write-Host ("Made: " + $lv + " " + $k); break
      } catch {
        $code = 0; $msg = ""
        try { $code = [int]$_.Exception.Response.StatusCode; $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $msg = $sr.ReadToEnd() } catch {}
        if (Test-Path $file) { Remove-Item $file -Force }
        if (($code -eq 400 -or $code -eq 404 -or $code -eq 422) -and $mi -lt ($models.Count - 1) -and $made -eq 0) { $mi++; Write-Host ("Switching model to " + $models[$mi]); continue }
        if ($code -eq 401 -or $code -eq 402 -or $code -eq 429 -or $msg -match "quota|credit|limit") {
          Write-Host ("STOPPED: ElevenLabs says your credits are finished (or the key is refused). Error " + $code + ". Top up, then run this again.") -ForegroundColor Red
        } else { Write-Host ("STOPPED at " + $lv + " " + $k + ": error " + $code + " " + $msg) -ForegroundColor Red }
        $stopped = $true; break
      }
    }
  }
}
Write-Host ("Made " + $made + " new, already there " + $had + ", of 18.") -ForegroundColor Green
explorer.exe /select,$out
