param(
    [string]$InstallRoot = "D:\Program_Files\SHUO Canvas"
)

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$shellRoot = Join-Path $workspaceRoot "app\.electron-shell"
$sourceExe = Join-Path $InstallRoot "SHUO Canvas.exe"
$sourceLocales = Join-Path $InstallRoot "locales"
$sourceResources = Join-Path $InstallRoot "resources"

if (-not (Test-Path -LiteralPath $sourceExe)) {
    throw "未找到已安装 Electron 主程序：$sourceExe"
}

New-Item -ItemType Directory -Path $shellRoot -Force | Out-Null

Get-ChildItem -LiteralPath $InstallRoot -File | Where-Object {
    $_.Name -ne "Uninstall SHUO Canvas.exe" -and $_.Name -ne "SHUO Canvas.exe"
} | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $shellRoot $_.Name) -Force
}

Copy-Item -LiteralPath $sourceExe -Destination (Join-Path $shellRoot "electron.exe") -Force

$localesTarget = Join-Path $shellRoot "locales"
New-Item -ItemType Directory -Path $localesTarget -Force | Out-Null
robocopy $sourceLocales $localesTarget /E /COPY:DAT /DCOPY:DAT /R:1 /W:1 /NFL /NDL /NP | Out-Null
if ($LASTEXITCODE -ge 8) {
    throw "复制 Electron locales 失败，robocopy 退出码：$LASTEXITCODE"
}

$resourcesTarget = Join-Path $shellRoot "resources"
New-Item -ItemType Directory -Path $resourcesTarget -Force | Out-Null
foreach ($name in @("default_app.asar", "app-icon.ico", "elevate.exe")) {
    $sourcePath = Join-Path $sourceResources $name
    if (Test-Path -LiteralPath $sourcePath) {
        Copy-Item -LiteralPath $sourcePath -Destination (Join-Path $resourcesTarget $name) -Force
    }
}

$versionOutput = (Get-Content -Raw -LiteralPath (Join-Path $InstallRoot "version")).Trim()
Write-Output "Electron 开发壳已准备完成：$shellRoot（Electron $versionOutput）"
