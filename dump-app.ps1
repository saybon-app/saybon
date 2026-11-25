$root = 'C:\SayBon'
$out  = Join-Path $root 'SayBon_dump.txt'
$skipDirs = '\node_modules\','\.git\','\.firebase\','\dumps\'
$exts = '.html','.htm','.css','.js','.mjs','.cjs','.json','.md','.txt','.yml','.yaml','.xml','.svg','.rules','.ps1','.bat','.sh'
$incNames = '.gitignore','.firebaserc'
$skipNames = 'package-lock.json','SayBon_dump.txt'
$maxBytes = 1MB

$files = @(Get-ChildItem -Path $root -Recurse -File -Force | Where-Object {
  $p = $_.FullName.Substring($root.Length).ToLower()
  $ok = $true
  foreach ($d in $skipDirs) { if ($p.Contains($d)) { $ok = $false } }
  $ok -and (($exts -contains $_.Extension.ToLower()) -or ($incNames -contains $_.Name)) `
      -and ($skipNames -notcontains $_.Name) `
      -and ($_.Name -notmatch '^\.env|serviceaccount|secret|private')
} | Sort-Object FullName)

$enc = New-Object System.Text.UTF8Encoding($false)
$sw  = New-Object System.IO.StreamWriter($out, $false, $enc)
$sw.WriteLine("SayBon app dump | " + (Get-Date -Format 'yyyy-MM-dd HH:mm') + " | " + $files.Count + " files")
$git = git -C $root log -1 --format='%h %s' 2>$null
if ($git) { $sw.WriteLine("git: $git") }
$sw.WriteLine()
$sw.WriteLine("FILE LIST")
foreach ($f in $files) { $sw.WriteLine("  " + $f.FullName.Substring($root.Length)) }
$sw.WriteLine()

foreach ($f in $files) {
  $sw.WriteLine("=== " + $f.FullName.Substring($root.Length) + " ===")
  if ($f.Length -gt $maxBytes) { $sw.WriteLine("[skipped: " + [math]::Round($f.Length/1KB) + " KB]") }
  else { $sw.WriteLine([System.IO.File]::ReadAllText($f.FullName)) }
  $sw.WriteLine()
}
$sw.Close()
Write-Host ("Done: " + $files.Count + " files -> " + $out) -ForegroundColor Green
