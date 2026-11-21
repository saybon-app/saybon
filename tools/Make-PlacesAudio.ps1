# Makes the teacher voice (Eryn) for the Talkletics places (kitchen, living room, bedroom, bathroom, house street, bakery) with ElevenLabs.
# Needs $env:ELEVENLABS_API_KEY in this PowerShell window. Safe to run again: it only makes missing clips,
# and it stops by itself if your credits run out (run it again after a top-up and it carries on).
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$key = $env:ELEVENLABS_API_KEY
if (-not $key) { Write-Host "ELEVENLABS_API_KEY is not set in this window." -ForegroundColor Yellow; return $false }

$free = [math]::Round((Get-PSDrive C).Free / 1GB, 1)
Write-Host "Free space on C: $free GB"
if ($free -lt 1) { Write-Host "Less than 1 GB free. Free some space first." -ForegroundColor Yellow; return $false }

$h = @{ "xi-api-key" = $key }
$placesDir = Join-Path $root "public\assets\talkletics\places"
$configs = Get-ChildItem $placesDir -Directory | ForEach-Object { Join-Path $_.FullName "config.json" } | Where-Object { Test-Path $_ }

$first = Get-Content $configs[0] -Raw -Encoding UTF8 | ConvertFrom-Json
$voice = $null
try {
  $r = Invoke-RestMethod -Uri ("https://api.elevenlabs.io/v2/voices?search=" + [uri]::EscapeDataString($first.voice) + "&page_size=50") -Headers $h
  $voice = $r.voices | Where-Object { $_.name -like ($first.voice + "*") } | Select-Object -First 1
} catch {
  Write-Host ("Could not read your voices: " + $_.Exception.Message) -ForegroundColor Yellow; return $false
}
if (-not $voice) { Write-Host ("No voice named " + $first.voice + " in your ElevenLabs account.") -ForegroundColor Yellow; return $false }
Write-Host ("Voice: " + $voice.name)

$models = @("eleven_v4", "eleven_v3", "eleven_multilingual_v2")
$mi = 0
$made = 0; $skipped = 0; $total = 0

function Get-ErrBody($ex) {
  try { $sr = New-Object System.IO.StreamReader($ex.Response.GetResponseStream()); return $sr.ReadToEnd() } catch { return "" }
}

foreach ($cfgPath in $configs) {
  $content = Get-Content $cfgPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $outDir = Join-Path (Split-Path $cfgPath -Parent) "audio"
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  Write-Host ("Place: " + $content.slug)
  $clips = New-Object System.Collections.ArrayList
  foreach ($x in $content.extras) { [void]$clips.Add(@($x.id, $x.text)) }
  foreach ($s in $content.sections) {
    [void]$clips.Add(@($s.introId, $s.intro))
    foreach ($i in $s.items) { [void]$clips.Add(@($i.id, $i.fr)) }
  }
  foreach ($c in $clips) {
    $total++
    $id = $c[0]; $text = $c[1]
    $file = Join-Path $outDir ($id + ".mp3")
    if ((Test-Path $file) -and ((Get-Item $file).Length -gt 1000)) { $skipped++; continue }
    $ok = $false
    for ($try = 0; $try -lt 6 -and -not $ok; $try++) {
      $body = @{ text = $text; model_id = $models[$mi]; voice_settings = @{ stability = 0.5; similarity_boost = 0.75 } } | ConvertTo-Json -Depth 4
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
      try {
        Invoke-WebRequest -Method Post -Uri ("https://api.elevenlabs.io/v1/text-to-speech/" + $voice.voice_id + "?output_format=mp3_44100_128") `
          -Headers $h -ContentType "application/json; charset=utf-8" -Body $bytes -OutFile $file -UseBasicParsing | Out-Null
        $ok = $true; $made++
        if ($made % 10 -eq 0) { Write-Host ("  made " + $made + " clips...") }
      } catch {
        $code = 0; try { $code = [int]$_.Exception.Response.StatusCode } catch {}
        $eb = Get-ErrBody $_.Exception
        if (Test-Path $file) { Remove-Item $file -Force -ErrorAction SilentlyContinue }
        if ($code -eq 401 -and $eb -match "quota") { Write-Host "Your ElevenLabs credits ran out. Top up and run this again: it carries on where it stopped." -ForegroundColor Yellow; return $false }
        if ($code -eq 401) { Write-Host "ElevenLabs refused the key. Set it again in this window." -ForegroundColor Yellow; return $false }
        if ($code -eq 402 -or $eb -match "quota_exceeded") { Write-Host "Your ElevenLabs credits ran out. Top up and run this again: it carries on where it stopped." -ForegroundColor Yellow; return $false }
        if ($code -eq 429) { Start-Sleep -Seconds (4 + 3 * $try); continue }
        if (($code -eq 400 -or $code -eq 404 -or $code -eq 422) -and $mi -lt ($models.Count - 1) -and $made -eq 0) { $mi++; Write-Host ("Switching model to " + $models[$mi]); continue }
        Write-Host ("Clip " + $id + " failed (" + $code + "): " + $eb) -ForegroundColor Yellow; return $false
      }
    }
    if (-not $ok) { Write-Host ("Clip " + $id + " did not work after several tries.") -ForegroundColor Yellow; return $false }
  }
}
Write-Host ("Done. Model " + $models[$mi] + ". Made " + $made + ", already there " + $skipped + ", total " + $total + ".") -ForegroundColor Green
return $true
