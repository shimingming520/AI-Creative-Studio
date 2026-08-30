$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$toolRoot = Join-Path $workspaceRoot ".tools\webcrack"

New-Item -ItemType Directory -Path $toolRoot -Force | Out-Null
npm install --prefix $toolRoot --no-save --ignore-scripts webcrack@2.16.0
Write-Output "去混淆工具已安装：$toolRoot"
