param(
    [string]$InstalledRuntime = "D:\Program_Files\SHUO Canvas\resources\runtime",
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$runtimeTarget = Join-Path $workspaceRoot "app\.electron-runtime\runtime"
$runtimeParent = Split-Path -Parent $runtimeTarget
$backendExe = Join-Path $InstalledRuntime "backend\aicanvas-backend.exe"

if ($Force -and -not (Test-Path -LiteralPath $backendExe)) {
    throw "未找到已安装原生后端：$backendExe"
}

if (Test-Path -LiteralPath $runtimeTarget) {
    $runtimeItem = Get-Item -LiteralPath $runtimeTarget -Force
    if (Test-Path -LiteralPath (Join-Path $runtimeTarget "backend\aicanvas-backend.exe")) {
        if (-not $Force) {
            Write-Output "本地运行时已存在：$runtimeTarget"
            exit 0
        }
    }
    if ($Force) {
        Remove-Item -LiteralPath $runtimeTarget -Recurse -Force
    } elseif ($runtimeItem.LinkType -or ($runtimeItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
        Remove-Item -LiteralPath $runtimeTarget -Force
    } elseif (Test-Path -LiteralPath (Join-Path $runtimeTarget "backend\aicanvas-backend.exe")) {
        Write-Output "本地运行时已存在：$runtimeTarget"
        exit 0
    }
}

if (-not (Test-Path -LiteralPath $backendExe)) {
    throw "未找到已安装原生后端：$backendExe"
}

New-Item -ItemType Directory -Path $runtimeParent -Force | Out-Null
New-Item -ItemType Directory -Path $runtimeTarget -Force | Out-Null

robocopy $InstalledRuntime $runtimeTarget /E /COPY:DAT /DCOPY:DAT /R:1 /W:1 /NFL /NDL /NP | Out-Null
if ($LASTEXITCODE -ge 8) {
    throw "复制运行时失败，robocopy 退出码：$LASTEXITCODE"
}

if (-not (Test-Path -LiteralPath (Join-Path $runtimeTarget "backend\aicanvas-backend.exe"))) {
    throw "本地运行时准备失败：$runtimeTarget"
}

Write-Output "本地运行时已准备完成：$runtimeTarget"
