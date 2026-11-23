# Records the music-room introduction (Eryn, eleven_v4). About 700 characters in total. Run it from C:\SayBon:
#   .\tools\Make-MusicIntro.ps1
# It asks for your ElevenLabs key (typed hidden, never saved). Files that already exist are skipped, so it is safe to run twice.
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$out = Join-Path $root "public\assets\audio\music"
New-Item -ItemType Directory -Force $out | Out-Null
Write-Host "Paste your ElevenLabs API key and press Enter (nothing will show):" -ForegroundColor Yellow
$sec = Read-Host -AsSecureString
$key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
if (-not $key) { Write-Host "No key, nothing done." -ForegroundColor Red; return }
$h = @{ "xi-api-key" = $key.Trim() }
try { $sub = Invoke-RestMethod -Uri "https://api.elevenlabs.io/v1/user/subscription" -Headers $h; Write-Host ("Key accepted. Credits left: " + ([int]$sub.character_limit - [int]$sub.character_count)) -ForegroundColor Green } catch { Write-Host ("ElevenLabs refused this key: " + $_.Exception.Message) -ForegroundColor Red; return }
$teacher = (Invoke-RestMethod -Uri "https://api.elevenlabs.io/v2/voices?search=Eryn&page_size=50" -Headers $h).voices | Where-Object { $_.name -like "Eryn*" } | Select-Object -First 1
if (-not $teacher) { Write-Host "No voice named Eryn in this ElevenLabs account." -ForegroundColor Red; return }
$C = [ordered]@{
 "intro-eryn" = "Welcome to the music room. This is a language bath. We don't show English subtitles on purpose. If you stop to work out what every line means, your attention leaves the French. So just listen, hum along, and let the sounds settle in. Understanding grows by itself, with time. Now, enjoy."
}
$n = 0; $chars = 0
foreach ($id in $C.Keys) {
  $f = Join-Path $out ($id + ".mp3")
  if (Test-Path $f) { continue }
  $b = @{ text = $C[$id]; model_id = "eleven_v4"; voice_settings = @{ stability = 0.5; similarity_boost = 0.75 } } | ConvertTo-Json -Depth 5
  try {
    Invoke-WebRequest -Method Post -Uri ("https://api.elevenlabs.io/v1/text-to-speech/" + $teacher.voice_id + "?output_format=mp3_44100_128") -Headers ($h + @{ "Content-Type" = "application/json; charset=utf-8" }) -Body ([Text.Encoding]::UTF8.GetBytes($b)) -OutFile $f | Out-Null
    if ((Get-Item $f).Length -lt 1000) { Remove-Item $f -Force; throw "empty audio" }
    $n++; $chars += $C[$id].Length; Start-Sleep -Milliseconds 150
  } catch { if (Test-Path $f) { Remove-Item $f -Force }; Write-Host ("STOPPED at " + $id + ": " + $_.Exception.Message) -ForegroundColor Red; break }
}
$have = @(Get-ChildItem $out -Filter *.mp3).Count
Write-Host ("Recorded " + $n + " new clips (" + $chars + " credits). Folder now holds " + $have + " of " + $C.Count + ".") -ForegroundColor Green
explorer.exe /select,$out
