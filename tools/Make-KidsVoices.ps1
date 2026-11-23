# Records the big celebration reactions for Les Petits with the voice you name (default: Mira). About 500 characters. Run from C:\SayBon:
#   .\tools\Make-KidsVoices.ps1            (or  -Voice "Letici")
# It asks for your ElevenLabs key (typed hidden, never saved). Existing files are skipped.
param([string]$Voice = "Mira")
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$out = Join-Path $root "public\audio\feedback"
New-Item -ItemType Directory -Force $out | Out-Null
Write-Host "Paste your ElevenLabs API key and press Enter (nothing will show):" -ForegroundColor Yellow
$sec = Read-Host -AsSecureString
$key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
if (-not $key) { Write-Host "No key, nothing done." -ForegroundColor Red; return }
$h = @{ "xi-api-key" = $key.Trim() }
try { $sub = Invoke-RestMethod -Uri "https://api.elevenlabs.io/v1/user/subscription" -Headers $h; Write-Host ("Key accepted. Credits left: " + ([int]$sub.character_limit - [int]$sub.character_count)) -ForegroundColor Green } catch { Write-Host ("ElevenLabs refused this key: " + $_.Exception.Message) -ForegroundColor Red; return }
$all = (Invoke-RestMethod -Uri "https://api.elevenlabs.io/v2/voices?page_size=100" -Headers $h).voices
$v = $all | Where-Object { $_.name -like ($Voice + "*") } | Select-Object -First 1
if (-not $v) {
  Write-Host ("No voice starting with '" + $Voice + "' in this ElevenLabs account. Nothing recorded. The voices you have are:") -ForegroundColor Red
  $all | ForEach-Object { Write-Host ("  " + $_.name) }
  Write-Host "Run again with the exact name, e.g.  .\tools\Make-KidsVoices.ps1 -Voice ""Name""" -ForegroundColor Yellow
  return
}
Write-Host ("Using voice: " + $v.name) -ForegroundColor Green
$C = [ordered]@{
 "kids-k3-1" = "Wow! Amazing! Bravo, bravo, bravo!"; "kids-k3-2" = "Superrr! You did it! Tu es génial!"; "kids-k3-3" = "Yaaay! Fantastic! Trop bien!"; "kids-k3-4" = "Oh là là! Incredible! Bravo!"
 "kids-k2-1" = "Très bien! Well done, great job!"; "kids-k2-2" = "Yay! Super! Almost perfect!"; "kids-k2-3" = "Great! Bravo! Let's keep going!"; "kids-k2-4" = "Ooh, so good! Très bien!"
 "kids-k1-1" = "Good try! Bon effort! You can do it!"; "kids-k1-2" = "Nice! Let's try again, ça va aller!"; "kids-k1-3" = "Almost! Courage, you're doing great!"; "kids-k1-4" = "Ooh, so close! Encore une fois, you can do it!"
 "kids-kn-1" = "Hmm, I couldn't hear you. A little louder, please!"; "kids-kn-2" = "Oops! Say it again, a little louder!"
}
$n = 0; $chars = 0
foreach ($id in $C.Keys) {
  $f = Join-Path $out ($id + ".mp3")
  if (Test-Path $f) { continue }
  $b = @{ text = $C[$id]; model_id = "eleven_v4"; voice_settings = @{ stability = 0.4; similarity_boost = 0.75; style = 0.6 } } | ConvertTo-Json -Depth 5
  try {
    Invoke-WebRequest -Method Post -Uri ("https://api.elevenlabs.io/v1/text-to-speech/" + $v.voice_id + "?output_format=mp3_44100_128") -Headers ($h + @{ "Content-Type" = "application/json; charset=utf-8" }) -Body ([Text.Encoding]::UTF8.GetBytes($b)) -OutFile $f | Out-Null
    if ((Get-Item $f).Length -lt 1000) { Remove-Item $f -Force; throw "empty audio" }
    $n++; $chars += $C[$id].Length; Start-Sleep -Milliseconds 150
  } catch { if (Test-Path $f) { Remove-Item $f -Force }; Write-Host ("STOPPED at " + $id + ": " + $_.Exception.Message) -ForegroundColor Red; break }
}
Write-Host ("Recorded " + $n + " new clips (" + $chars + " credits) of " + $C.Count + ".") -ForegroundColor Green
explorer.exe /select,$out
