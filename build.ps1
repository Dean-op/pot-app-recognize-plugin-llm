$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$distDir = Join-Path $projectRoot "dist"
$pluginId = (Get-Content (Join-Path $projectRoot "info.json") -Raw | ConvertFrom-Json).id
$archivePath = Join-Path $distDir "$pluginId.potext"

New-Item -ItemType Directory -Path $distDir -Force | Out-Null
Remove-Item -LiteralPath $archivePath -Force -ErrorAction SilentlyContinue

$files = @("main.js", "info.json", "icon.svg")
Push-Location $projectRoot
try {
    Compress-Archive -Path $files -DestinationPath $archivePath -Force
}
finally {
    Pop-Location
}

Write-Host "Built: $archivePath"
