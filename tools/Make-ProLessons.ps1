# Records lesson one for every field and level with ElevenLabs: the intro, the scene-setting, the conversation, the drills.
#   .\tools\Make-ProLessons.ps1 -Test        records ONE intro and a short lesson sample in a test folder, so you can listen first
#   .\tools\Make-ProLessons.ps1              records everything: A0 for all ten fields first, then A1, and so on
# It asks for your ElevenLabs key (typed hidden, never saved). It stops cleanly when credits run out; run it again later and it carries on.
param([switch]$Test, [string]$OtherVoice = "", [int]$MaxChars = 0, [string]$UpTo = "c2", [string]$Model = "eleven_v4")
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$pro = Join-Path $root "public\professional"
$scn = Join-Path $pro "scenario"
$doneFile = Join-Path $PSScriptRoot "ProAudio.done.txt"
Write-Host "Paste your ElevenLabs API key and press Enter (nothing will show):" -ForegroundColor Yellow
$sec = Read-Host -AsSecureString
$key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
if (-not $key) { Write-Host "No key, nothing done." -ForegroundColor Red; return }
$h = @{ "xi-api-key" = $key.Trim() }
try {
  $sub = Invoke-RestMethod -Uri "https://api.elevenlabs.io/v1/user/subscription" -Headers $h
  Write-Host ("Key accepted. Credits left: " + ([int]$sub.character_limit - [int]$sub.character_count)) -ForegroundColor Green
} catch { Write-Host ("ElevenLabs refused this key: " + $_.Exception.Message) -ForegroundColor Red; return }
$data = Get-Content (Join-Path $scn "units.json") -Raw -Encoding UTF8 | ConvertFrom-Json
# voices
$all = (Invoke-RestMethod -Uri "https://api.elevenlabs.io/v2/voices?page_size=100" -Headers $h).voices
$teacher = (Invoke-RestMethod -Uri "https://api.elevenlabs.io/v2/voices?search=Eryn&page_size=50" -Headers $h).voices | Where-Object { $_.name -like "Eryn*" } | Select-Object -First 1
if (-not $teacher) { Write-Host "No voice named Eryn in this ElevenLabs account." -ForegroundColor Red; return }
if ($OtherVoice) { $other = $all | Where-Object { $_.name -like ($OtherVoice + "*") } | Select-Object -First 1 }
else { $other = $all | Where-Object { $_.name -notlike "Eryn*" -and $_.labels.gender -eq "male" } | Select-Object -First 1
       if (-not $other) { $other = $all | Where-Object { $_.name -notlike "Eryn*" } | Select-Object -First 1 } }
if (-not $other) { Write-Host "No second voice found. Add one in ElevenLabs, then run again." -ForegroundColor Red; return }
Write-Host ("Model: " + $Model)
Write-Host ("Teacher: " + $teacher.name + "    Other person: " + $other.name + "   (to use another voice: -OtherVoice ""Name"")")
$script:noLang = $false; $script:stop = $false; $script:chars = 0
function Speak($text, $voiceId, $model, $speed, $lang, $outFile) {
  for ($try = 0; $try -lt 3; $try++) {
    $vs = @{ stability = 0.5; similarity_boost = 0.75 }
    if ($model -eq "eleven_multilingual_v2" -and $speed) { $vs.speed = [double]$speed }
    $b = @{ text = $text; model_id = $model; voice_settings = $vs }
    if ($model -ne "eleven_multilingual_v2" -and $lang -and -not $script:noLang) { $b.language_code = $lang }
    $json = $b | ConvertTo-Json -Depth 5
    try {
      Invoke-WebRequest -Method Post -Uri ("https://api.elevenlabs.io/v1/text-to-speech/" + $voiceId + "?output_format=mp3_44100_128") -Headers ($h + @{ "Content-Type" = "application/json; charset=utf-8" }) -Body ([Text.Encoding]::UTF8.GetBytes($json)) -OutFile $outFile | Out-Null
      if ((Get-Item $outFile).Length -lt 1000) { Remove-Item $outFile -Force; throw "empty audio" }
      $script:chars += $text.Length
      Start-Sleep -Milliseconds 150
      return $true
    } catch {
      $code = 0; $msg = ""
      try { $code = [int]$_.Exception.Response.StatusCode; $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $msg = $sr.ReadToEnd() } catch {}
      if (Test-Path $outFile) { Remove-Item $outFile -Force }
      if (($code -eq 400 -or $code -eq 422) -and $msg -match "language_code" -and -not $script:noLang) { $script:noLang = $true; Write-Host "(this model ignores language_code, continuing without it)"; continue }
      if ($code -eq 401 -or $code -eq 402 -or $code -eq 429 -or $msg -match "quota|credit|limit") { Write-Host ("STOPPED: credits finished (or key refused), error " + $code + ". Run again when you have credits.") -ForegroundColor Red; $script:stop = $true; return $false }
      if (($code -ge 500 -or $code -eq 0) -and $try -lt 2) { Start-Sleep -Seconds 3; continue }
      Write-Host ("STOPPED: error " + $code + " " + $msg) -ForegroundColor Red; $script:stop = $true; return $false
    }
  }
  return $false
}
function Speak-Intro($u, $outFile) {
  $parts = @(); $i = 0
  foreach ($sg in $u.intro.segments) {
    $tmp = $outFile + ".part" + $i; $i++
    $lang = if ($sg.fr) { "fr" } else { "en" }
    if (-not (Speak $sg.t $teacher.voice_id $Model $null $lang $tmp)) { foreach ($p in $parts) { Remove-Item $p -Force -ErrorAction SilentlyContinue }; return $false }
    $parts += $tmp
  }
  $ms = New-Object IO.MemoryStream
  foreach ($p in $parts) { $by = [IO.File]::ReadAllBytes($p); $ms.Write($by, 0, $by.Length); Remove-Item $p -Force }
  [IO.File]::WriteAllBytes($outFile, $ms.ToArray()); return $true
}
function Speak-Line($ln, $outFile) {
  if ($ln.lang -eq "en") { return (Speak $ln.text $teacher.voice_id $Model $null "en" $outFile) }
  $vid = if ($ln.role -eq "c") { $other.voice_id } else { $teacher.voice_id }
  if ($Model -eq "eleven_multilingual_v2") { return (Speak $ln.text $vid $Model $ln.speed "fr" $outFile) }
  # newer models have no speed setting, so the teaching pace is asked for with a delivery tag
  $tag = ""; if ($ln.speed -and $ln.speed -le 0.75) { $tag = "[speaking very slowly and clearly] " } elseif ($ln.speed -and $ln.speed -le 0.82) { $tag = "[speaking slowly and clearly] " } elseif ($ln.speed -and $ln.speed -le 0.9) { $tag = "[speaking a little slowly] " }
  return (Speak ($tag + $ln.text) $vid $Model $null "fr" $outFile)
}
# ---------- test mode ----------
if ($Test) {
  $dir = Join-Path $pro "audio-test"; New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $u = $data.units | Where-Object { $_.key -eq "business-A0" } | Select-Object -First 1
  Write-Host "Recording the test: intro, scene-setting and the first lines of the conversation (about 1,000 credits)..."
  [void](Speak-Intro $u (Join-Path $dir "1-intro.mp3"))
  $n = 2
  foreach ($ln in ($u.lines | Select-Object -First 4)) { if ($script:stop) { break }; [void](Speak-Line $ln (Join-Path $dir ($n.ToString() + "-" + $ln.role + "-" + $ln.lang + ".mp3"))); $n++ }
  if (-not $script:stop) { [void](Speak-Line ($data.shared | Where-Object { $_.lang -eq "en" } | Select-Object -Last 1) (Join-Path $dir "9-praise.mp3")) }
  Write-Host ("Test done (" + $script:chars + " credits). Listen to the files in order: 1 intro, 2 scene-setting, 3 to 5 the conversation (the other voice is in 3 and 5), 9 a praise line.") -ForegroundColor Green
  Write-Host "Nothing on the site was changed. Tell me what to adjust, or say it sounds right and run the full recording."
  explorer.exe /select,(Join-Path $dir "1-intro.mp3"); return
}
# ---------- full recording ----------
$done = @{}; if (Test-Path $doneFile) { Get-Content $doneFile | ForEach-Object { if ($_) { $done[$_] = 1 } } }
$audioDir = Join-Path $scn "audio"; New-Item -ItemType Directory -Force -Path $audioDir | Out-Null
$order = @("a0","a1","a2","b1","b2","c1","c2"); $limit = [array]::IndexOf($order, $UpTo.ToLower()); if ($limit -lt 0) { $limit = 6 }
$made = 0
function Mark($id) { Add-Content -Path $doneFile -Value $id; $done[$id] = 1 }
Write-Host "Shared lines (cues, praise, short phrases)..."
foreach ($ln in $data.shared) {
  if ($script:stop) { break }
  if ($done.ContainsKey($ln.id)) { continue }
  if ($MaxChars -gt 0 -and ($script:chars + $ln.text.Length) -gt $MaxChars) { $script:stop = $true; Write-Host "Reached your cap." -ForegroundColor Yellow; break }
  if (Speak-Line $ln (Join-Path $audioDir ($ln.id + ".mp3"))) { Mark $ln.id; $made++ }
}
foreach ($u in $data.units) {
  if ($script:stop) { break }
  if ([array]::IndexOf($order, $u.lv) -gt $limit) { continue }
  $todo = @($u.lines | Where-Object { -not $done.ContainsKey($_.id) })
  $needIntro = -not $done.ContainsKey($u.intro.id)
  if (-not $needIntro -and $todo.Count -eq 0) { continue }
  $cost = ($todo | ForEach-Object { $_.text.Length } | Measure-Object -Sum).Sum + $(if ($needIntro) { $u.intro.text.Length } else { 0 })
  if ($MaxChars -gt 0 -and ($script:chars + $cost) -gt $MaxChars) { Write-Host ("Reached your cap before " + $u.key) -ForegroundColor Yellow; break }
  Write-Host ("== " + $u.key + "  (" + $cost + " characters)")
  if ($needIntro) { if (Speak-Intro $u (Join-Path $pro ($u.intro.file -replace "/", "\"))) { Mark $u.intro.id; $made++ } else { break } }
  foreach ($ln in $todo) {
    if ($script:stop) { break }
    if (Speak-Line $ln (Join-Path $audioDir ($ln.id + ".mp3"))) { Mark $ln.id; $made++ }
  }
}
$left = ($data.units | Where-Object { [array]::IndexOf($order, $_.lv) -le $limit } | Where-Object { -not $done.ContainsKey($_.intro.id) -or (@($_.lines | Where-Object { -not $done.ContainsKey($_.id) }).Count -gt 0) }).Count
Write-Host ""
Write-Host ("Recorded " + $made + " files this run (" + $script:chars + " characters). Lessons still to record: " + $left + " of 70.") -ForegroundColor Green
if ($left -gt 0) { Write-Host "Not finished. Run it again when credits are added. Deploy to publish what is recorded." -ForegroundColor Yellow }
explorer.exe /select,$audioDir
