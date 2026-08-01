$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$distDir = Join-Path $projectRoot "dist"
$infoPath = Join-Path $projectRoot "info.json"
$requiredFiles = @("main.js", "info.json", "icon.svg", "LICENSE")

foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $file))) {
        throw "Required plugin file not found: $file"
    }
}

$pluginInfo = Get-Content $infoPath -Raw | ConvertFrom-Json
if ([string]::IsNullOrWhiteSpace($pluginInfo.id)) {
    throw "info.json must define a plugin id"
}

$archivePath = Join-Path $distDir "$($pluginInfo.id).potext"
$obsoleteArchivePath = Join-Path $distDir "plugin.com.dean-op.llm_ocr_custom.potext"

New-Item -ItemType Directory -Path $distDir -Force | Out-Null
Remove-Item -LiteralPath $archivePath -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $obsoleteArchivePath -Force -ErrorAction SilentlyContinue

Push-Location $projectRoot
try {
    Compress-Archive -Path $requiredFiles -DestinationPath $archivePath -Force
}
finally {
    Pop-Location
}

Write-Host "Built: $archivePath"
