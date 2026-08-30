param(
    [string]$InstalledRuntime = "D:\Program_Files\SHUO Canvas\resources\runtime",
    [switch]$Force
)

& (Join-Path $PSScriptRoot "prepare-local-runtime.ps1") -InstalledRuntime $InstalledRuntime -Force:$Force
