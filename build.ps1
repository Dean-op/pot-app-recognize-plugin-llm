using assembly System.IO.Compression
using assembly System.IO.Compression.FileSystem

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$distDir = Join-Path $projectRoot "dist"
$runtimeFiles = @("main.js", "icon.svg")

foreach ($file in $runtimeFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $file))) {
        throw "Required plugin file not found: $file"
    }
}

New-Item -ItemType Directory -Path $distDir -Force | Out-Null

function Build-PluginPackage {
    param([string]$manifestPath)

    if (-not (Test-Path -LiteralPath $manifestPath)) {
        throw "Plugin manifest not found: $manifestPath"
    }

    $pluginInfo = Get-Content $manifestPath -Raw | ConvertFrom-Json
    if ([string]::IsNullOrWhiteSpace($pluginInfo.id)) {
        throw "Plugin manifest must define an id: $manifestPath"
    }

    $archivePath = Join-Path $distDir "$($pluginInfo.id).potext"
    Remove-Item -LiteralPath $archivePath -Force -ErrorAction SilentlyContinue

    $archive = [System.IO.Compression.ZipFile]::Open(
        $archivePath,
        [System.IO.Compression.ZipArchiveMode]::Create
    )

    try {
        $entries = @(
            @{ Source = $manifestPath; Name = "info.json" },
            @{ Source = (Join-Path $projectRoot "main.js"); Name = "main.js" },
            @{ Source = (Join-Path $projectRoot "icon.svg"); Name = "icon.svg" }
        )

        foreach ($entry in $entries) {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive,
                $entry.Source,
                $entry.Name,
                [System.IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null
        }
    }
    finally {
        $archive.Dispose()
    }

    Write-Host "Built: $archivePath"
}

Build-PluginPackage (Join-Path $projectRoot "info.json")
Build-PluginPackage (Join-Path $projectRoot "custom\info.json")
