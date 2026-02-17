Write-Host ""
Write-Host "Building SayBon Registration Backend"
Write-Host ""


New-Item -ItemType Directory -Force -Path src/storage/cv
New-Item -ItemType Directory -Force -Path src/storage/cert
New-Item -ItemType Directory -Force -Path src/storage/id

New-Item -ItemType Directory -Force -Path src/database


Set-Content -Path src/database/translators.json -Value "[]"



Write-Host ""
Write-Host "Folders Created"
Write-Host ""