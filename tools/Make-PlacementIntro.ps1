# Records the placement introduction (Eryn, eleven_v4). About 700 characters in total. Run it from C:\SayBon:
#   .\tools\Make-PlacementIntro.ps1
# It asks for your ElevenLabs key (typed hidden, never saved). Files that already exist are skipped, so it is safe to run twice.
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$out = Join-Path $root "public\assets\audio\placement"
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
 "intro-eryn" = @"
Hi. [chuckles] It's so great that you're taking the placement test.

...

Now, take a breath. [sighs] There's nothing to be nervous about. This is not an exam. Nobody passes, and nobody fails.

...

It's only so that we can place you in the right spot, and give you the very best start.

...

There are seven levels. Starting with ay, zero, the very beginning. Then ay, one. Ay, two. Bee, one. Bee, two. See, one. And all the way up to see, two. And there are twenty questions, at most.

...

Now, there's something I want you to understand, so that you never feel cheated.

...

Your level is not your total score. The test follows you. When you miss a question, the next ones get a little easier. When you get one right, they get a little harder.

...

So, eight right answers on easy questions tells us something different from eight right answers on hard ones. We're not counting how many you got. We're looking for the step where your answers are steady. The step where you stop slipping.

...

And if that step is ay, zero, or ay, one? That is not a low mark. [chuckles] It's simply the place where you'll feel confident, and where you'll move the fastest. Everybody starts somewhere. And you're already here.

...

Ready? Whenever you are, press begin.
"@
}
Remove-Item (Join-Path $out "intro-eryn.mp3") -Force -ErrorAction SilentlyContinue
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
