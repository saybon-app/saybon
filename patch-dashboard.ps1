# Adds the snow + panning-background files to the LIVE dashboard page without replacing it.
# Safe to run more than once.
$f = 'C:\SayBon\public\dashboard\index.html'
$h = [System.IO.File]::ReadAllText($f)
$css = '<link rel="stylesheet" href="/css/dashboard-bg-pan.css?v=1" />'
$js  = '<script src="/dashboard/snow.js?v=1"></script>'
if ($h -notmatch 'dashboard-bg-pan\.css') { $h = $h -replace '</head>', ("  $css`r`n</head>") }
if ($h -notmatch 'dashboard/snow\.js')    { $h = $h -replace '</body>', ("$js`r`n</body>") }
[System.IO.File]::WriteAllText($f, $h, (New-Object System.Text.UTF8Encoding($false)))
Write-Host 'Dashboard patched.' -ForegroundColor Green
