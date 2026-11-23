# Records the teacher's spoken reactions to a score (Eryn, eleven_v4). About 700 characters in total. Run it from C:\SayBon:
#   .\tools\Make-FeedbackVoices.ps1
# It asks for your ElevenLabs key (typed hidden, never saved). Files that already exist are skipped, so it is safe to run twice.
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
$teacher = (Invoke-RestMethod -Uri "https://api.elevenlabs.io/v2/voices?search=Eryn&page_size=50" -Headers $h).voices | Where-Object { $_.name -like "Eryn*" } | Select-Object -First 1
if (-not $teacher) { Write-Host "No voice named Eryn in this ElevenLabs account." -ForegroundColor Red; return }
$C = [ordered]@{
 "en-wow-1" = "Wow! Très bien!"; "en-wow-2" = "Super! Well done!"; "en-wow-3" = "Excellent! Bravo!"; "en-wow-4" = "Wow, that was lovely!"
 "en-good-1" = "Pas mal! Not bad at all."; "en-good-2" = "Not too bad! Pas mal!"; "en-good-3" = "Good! Très bien, keep going."; "en-good-4" = "Nice one, you're getting there."
 "en-try-1" = "Good try! Encore une fois."; "en-try-2" = "Almost! Let's go again."; "en-try-3" = "Don't worry. Encore une fois!"; "en-try-4" = "Nearly there. Try once more."
 "en-none-1" = "I didn't hear you. Try again."; "en-none-2" = "Sorry, I missed that. Once more?"
 "mix-wow-1" = "Wow! Très bien!"; "mix-wow-2" = "Excellent! Well done!"; "mix-wow-3" = "Parfait! Bravo!"; "mix-wow-4" = "Super! C'était très bien."
 "mix-good-1" = "Pas mal du tout!"; "mix-good-2" = "Not bad! Continuez."; "mix-good-3" = "C'est bien! Keep going."; "mix-good-4" = "Pas mal! You're nearly there."
 "mix-try-1" = "Encore une fois!"; "mix-try-2" = "Presque! Let's try again."; "mix-try-3" = "Courage! Encore un effort."; "mix-try-4" = "Not yet, mais ça vient."
 "mix-none-1" = "Je n'ai rien entendu. Try again."; "mix-none-2" = "I didn't hear you. Encore une fois."
 "fr-wow-1" = "Wow! Très bien!"; "fr-wow-2" = "Excellent! Bravo!"; "fr-wow-3" = "Parfait! Magnifique!"; "fr-wow-4" = "Superbe, vraiment!"
 "fr-good-1" = "Pas mal du tout!"; "fr-good-2" = "Pas mal! Continuez."; "fr-good-3" = "C'est bien, ça vient!"; "fr-good-4" = "Bien. On y est presque."
 "fr-try-1" = "Encore une fois!"; "fr-try-2" = "Presque! Reprenons."; "fr-try-3" = "Courage, encore un effort!"; "fr-try-4" = "Pas encore, mais ça vient."
 "fr-none-1" = "Je n'ai rien entendu. Réessayez."; "fr-none-2" = "Je n'ai pas bien entendu. Encore une fois."
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
