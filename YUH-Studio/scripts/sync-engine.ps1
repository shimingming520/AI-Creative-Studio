$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $projectRoot "engine-source"
$targetRoot = Join-Path $projectRoot "bundled-resources\engine"

if (!(Test-Path -LiteralPath $sourceRoot)) {
  throw "engine-source 不存在: $sourceRoot"
}
if (!(Test-Path -LiteralPath $targetRoot)) {
  New-Item -ItemType Directory -Path $targetRoot -Force | Out-Null
}

robocopy $sourceRoot $targetRoot /E /COPY:DAT /DCOPY:DAT /R:1 /W:1 /NFL /NDL /NP | Out-Host
$code = $LASTEXITCODE
if ($code -gt 7) {
  throw "同步引擎源文件失败，robocopy exit code=$code"
}

$prunedPaths = @(
  (Join-Path $targetRoot "ComfyUI")
)
foreach ($path in $prunedPaths) {
  if (Test-Path -LiteralPath $path) {
    Remove-Item -LiteralPath $path -Recurse -Force
  }
}
exit 0
