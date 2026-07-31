$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$distDir = Join-Path $projectRoot "dist"
$infoPath = Join-Path $projectRoot "info.json"
$info = Get-Content $infoPath -Raw | ConvertFrom-Json
$pluginId = $info.id
$requiredFiles = @("main.js", "info.json", "icon.svg")

if ([string]::IsNullOrWhiteSpace($pluginId)) {
    throw "info.json must define a plugin id"
}

foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $file))) {
        throw "Required plugin file not found: $file"
    }
}

$archivePath = Join-Path $distDir "$pluginId.potext"

New-Item -ItemType Directory -Path $distDir -Force | Out-Null
Remove-Item -LiteralPath $archivePath -Force -ErrorAction SilentlyContinue

Push-Location $projectRoot
try {
    Compress-Archive -Path $requiredFiles -DestinationPath $archivePath -Force
}
finally {
    Pop-Location
}

Write-Host "Built: $archivePath"
