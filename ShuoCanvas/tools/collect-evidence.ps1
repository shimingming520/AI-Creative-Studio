param(
    [string]$InstallerPath = "F:\Users\shi\Downloads\SHUO-Canvas-windows-0.7.9.exe",
    [string]$InstallRoot = "D:\Program_Files\SHUO Canvas"
)

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$evidenceRoot = Join-Path $workspaceRoot "evidence"
$installedAppRoot = Join-Path $InstallRoot "resources\app"
$runtimeRoot = Join-Path $InstallRoot "resources\runtime"
$utf8Bom = New-Object System.Text.UTF8Encoding($true)

New-Item -ItemType Directory -Path $evidenceRoot -Force | Out-Null

function Write-Utf8BomText {
    param([string]$Path, [string]$Text)
    [System.IO.File]::WriteAllText($Path, $Text, $utf8Bom)
}

function Get-ManifestRows {
    param(
        [string]$Root,
        [string[]]$ExcludedFragments = @()
    )

    Get-ChildItem -LiteralPath $Root -Recurse -File -ErrorAction Stop |
        Where-Object {
            $fullName = $_.FullName
            -not ($ExcludedFragments | Where-Object { $fullName.Contains($_) })
        } |
        ForEach-Object {
            [PSCustomObject]@{
                RelativePath = $_.FullName.Substring($Root.Length + 1)
                Length = $_.Length
                SHA256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
            }
        } |
        Sort-Object RelativePath
}

$installer = Get-Item -LiteralPath $InstallerPath
$executable = Get-Item -LiteralPath (Join-Path $InstallRoot "SHUO Canvas.exe")
$releaseInfo = [ordered]@{
    release = "v0.7.9"
    releaseCommit = (git -C $workspaceRoot rev-parse HEAD).Trim()
    installerPath = $installer.FullName
    installerLength = $installer.Length
    installerSHA256 = (Get-FileHash -LiteralPath $installer.FullName -Algorithm SHA256).Hash
    installedExecutablePath = $executable.FullName
    installedExecutableLength = $executable.Length
    installedExecutableSHA256 = (Get-FileHash -LiteralPath $executable.FullName -Algorithm SHA256).Hash
    installedProductVersion = $executable.VersionInfo.ProductVersion
    electron = "43.4.0"
    node = "24.18.1"
    chrome = "150.0.7871.224"
    recoveredAt = (Get-Date).ToString("o")
}

$recoveredBuildPath = Join-Path $workspaceRoot "dist\win-unpacked\SHUO Canvas Recovered.exe"
if (Test-Path -LiteralPath $recoveredBuildPath) {
    $recoveredBuild = Get-Item -LiteralPath $recoveredBuildPath
    $releaseInfo.recoveredBuildPath = $recoveredBuild.FullName
    $releaseInfo.recoveredBuildLength = $recoveredBuild.Length
    $releaseInfo.recoveredBuildSHA256 = (Get-FileHash -LiteralPath $recoveredBuild.FullName -Algorithm SHA256).Hash
}

Write-Utf8BomText -Path (Join-Path $evidenceRoot "release-info.json") -Text (($releaseInfo | ConvertTo-Json -Depth 4) + "`n")

$installedAppRows = Get-ManifestRows -Root $installedAppRoot -ExcludedFragments @("\node_modules\")
Write-Utf8BomText -Path (Join-Path $evidenceRoot "installed-app-manifest.csv") -Text (($installedAppRows | ConvertTo-Csv -NoTypeInformation) -join "`r`n")

$runtimeRows = Get-ManifestRows -Root $runtimeRoot
Write-Utf8BomText -Path (Join-Path $evidenceRoot "runtime-manifest.csv") -Text (($runtimeRows | ConvertTo-Csv -NoTypeInformation) -join "`r`n")

$recoveredRows = Get-ManifestRows -Root (Join-Path $workspaceRoot "app") -ExcludedFragments @("\node_modules\", "\.electron-runtime\", "\.electron-shell\", "\.electron-dev-app\")
Write-Utf8BomText -Path (Join-Path $evidenceRoot "recovered-app-manifest.csv") -Text (($recoveredRows | ConvertTo-Csv -NoTypeInformation) -join "`r`n")

$buildRoot = Join-Path $workspaceRoot "dist\win-unpacked"
if (Test-Path -LiteralPath $buildRoot) {
    $buildRows = Get-ManifestRows -Root $buildRoot
    Write-Utf8BomText -Path (Join-Path $evidenceRoot "build-manifest.csv") -Text (($buildRows | ConvertTo-Csv -NoTypeInformation) -join "`r`n")
}

Write-Output "证据清单已写入：$evidenceRoot"
