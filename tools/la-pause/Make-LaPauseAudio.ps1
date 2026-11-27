# La Pause voices: makes every French clip (and the English invitation) with ElevenLabs, voice ERYN.
# Run from the SayBon root:  powershell -ExecutionPolicy Bypass -File tools\la-pause\Make-LaPauseAudio.ps1
# - Asks for your ElevenLabs API key (typed hidden). The key is never saved or written anywhere.
# - Finds the voice BY NAME (default ERYN). If it is not found it stops; it never uses another voice.
# - Model defaults to eleven_v4. If ElevenLabs rejects it the script stops and tells you; it never switches model quietly.
# - Safe to run again: it only makes clips that are missing. If credits run out, top up and run it again.
param(
  [string]$VoiceName = "ERYN",
  [string]$VoiceId = "",
  [string]$Model = "eleven_v4",
  [string]$Root = (Get-Location).Path,
  [switch]$CheckOnly
)
$ErrorActionPreference = "Stop"
$clipsFile = Join-Path $Root "tools\la-pause\clips.json"
if (-not (Test-Path $clipsFile)) { Write-Host "clips.json not found. Run: node tools\la-pause\make-manifest.js" -ForegroundColor Yellow; exit 2 }
$clips = Get-Content $clipsFile -Raw -Encoding UTF8 | ConvertFrom-Json

function Out-Path($p) { return (Join-Path $Root ("public" + ($p -replace "/", "\"))) }
$missing = @($clips | Where-Object { -not ((Test-Path (Out-Path $_.path)) -and ((Get-Item (Out-Path $_.path)).Length -gt 1000)) })
Write-Host ("Clips needed: " + $clips.Count + "   already made: " + ($clips.Count - $missing.Count) + "   missing: " + $missing.Count)
if ($missing.Count -eq 0) { Write-Host "All La Pause audio is present." -ForegroundColor Green; exit 0 }
if ($CheckOnly) { $missing | Select-Object -First 20 | ForEach-Object { Write-Host ("  missing " + $_.path) }; exit 1 }

$sec = Read-Host "Paste your ElevenLabs API key (hidden)" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
try { $key = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
if (-not $key) { Write-Host "No key entered." -ForegroundColor Yellow; exit 2 }
$h = @{ "xi-api-key" = $key }

function Get-ErrBody($ex) { try { $sr = New-Object System.IO.StreamReader($ex.Response.GetResponseStream()); return $sr.ReadToEnd() } catch { return "" } }

# voice: by ID if you gave one, otherwise looked up by name
$vid = $VoiceId
if (-not $vid) {
  try { $r = Invoke-RestMethod -Uri ("https://api.elevenlabs.io/v2/voices?search=" + [uri]::EscapeDataString($VoiceName) + "&page_size=100") -Headers $h }
  catch { Write-Host ("Could not read your voices: " + $_.Exception.Message) -ForegroundColor Yellow; exit 2 }
  $exact = @($r.voices | Where-Object { $_.name -ieq $VoiceName })
  if ($exact.Count -eq 0) { $exact = @($r.voices | Where-Object { $_.name -match ("^" + [regex]::Escape($VoiceName) + "\b") }) }
  if ($exact.Count -eq 0) { Write-Host ("No voice named " + $VoiceName + " in your ElevenLabs account. Nothing was made. (Add it to My Voices, or pass -VoiceId.)") -ForegroundColor Yellow; exit 2 }
  if ($exact.Count -gt 1) { Write-Host ("More than one voice matches " + $VoiceName + ":") -ForegroundColor Yellow; $exact | ForEach-Object { Write-Host ("  " + $_.name + "  " + $_.voice_id) }; Write-Host "Run again with -VoiceId <id>."; exit 2 }
  $vid = $exact[0].voice_id; Write-Host ("Voice: " + $exact[0].name + " (" + $vid + ")   Model: " + $Model)
} else { Write-Host ("Voice ID: " + $vid + "   Model: " + $Model) }

$made = 0
foreach ($c in $missing) {
  $file = Out-Path $c.path
  New-Item -ItemType Directory -Force -Path (Split-Path $file -Parent) | Out-Null
  $ok = $false
  for ($try = 0; $try -lt 6 -and -not $ok; $try++) {
    $body = @{ text = $c.text; model_id = $Model; voice_settings = @{ stability = 0.5; similarity_boost = 0.75 } } | ConvertTo-Json -Depth 4
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    try {
      Invoke-WebRequest -Method Post -Uri ("https://api.elevenlabs.io/v1/text-to-speech/" + $vid + "?output_format=mp3_44100_128") -Headers $h `
        -ContentType "application/json; charset=utf-8" -Body $bytes -OutFile $file -UseBasicParsing | Out-Null
      $ok = $true; $made++
      if ($made % 20 -eq 0) { Write-Host ("  made " + $made + " of " + $missing.Count + "...") }
    } catch {
      $code = 0; try { $code = [int]$_.Exception.Response.StatusCode } catch {}
      $eb = Get-ErrBody $_.Exception
      if (Test-Path $file) { Remove-Item $file -Force -ErrorAction SilentlyContinue }
      if ($code -eq 429 -or $code -ge 500) { Start-Sleep -Seconds (3 + 3 * $try); continue }
      if ($code -eq 401 -and $eb -match "quota") { Write-Host "ElevenLabs credits ran out. Top up and run this again; it carries on where it stopped." -ForegroundColor Yellow; exit 3 }
      if ($code -eq 402 -or $eb -match "quota_exceeded") { Write-Host "ElevenLabs credits ran out. Top up and run this again; it carries on where it stopped." -ForegroundColor Yellow; exit 3 }
      if ($code -eq 401) { Write-Host "ElevenLabs refused the key." -ForegroundColor Yellow; exit 2 }
      Write-Host ("Clip failed (" + $code + ") '" + $c.text + "': " + $eb) -ForegroundColor Yellow
      Write-Host ("Stopped. Nothing was switched to another model or voice. Model used: " + $Model) -ForegroundColor Yellow
      exit 2
    }
  }
  if (-not $ok) { Write-Host ("Gave up on '" + $c.text + "' after several tries. Run again later.") -ForegroundColor Yellow; exit 2 }
}
Write-Host ("Done. Made " + $made + " clips.") -ForegroundColor Green
exit 0
