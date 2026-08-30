$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)
$utf8Bom = New-Object System.Text.UTF8Encoding($true)
$extensions = @(
    ".cjs", ".cpp", ".css", ".cts", ".html", ".js",
    ".md", ".mjs", ".mts", ".ps1", ".py", ".svg", ".txt", ".yaml", ".yml"
)
$explicitFiles = @(
    ".editorconfig", ".gitignore", "app\package.json", "app\package-lock.json",
    "evidence\release-info.json", "evidence\deobfuscation-report.json"
)
$excludedFragments = @(
    "\.git\", "\.tools\", "\node_modules\", "\.electron-runtime\", "\.electron-shell\",
    "\dist\", "\app\vendor\", "\evidence\original-obfuscated-js\"
)
$converted = 0

$files = Get-ChildItem -LiteralPath $workspaceRoot -Recurse -File -Force | Where-Object {
    $fullName = $_.FullName
    $relativePath = $fullName.Substring($workspaceRoot.Length + 1)
    $isExcluded = $false
    foreach ($fragment in $excludedFragments) {
        if ($fullName.Contains($fragment)) {
            $isExcluded = $true
            break
        }
    }
    if ($isExcluded) {
        return $false
    }
    return $extensions -contains $_.Extension.ToLowerInvariant() -or $explicitFiles -contains $relativePath
}

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    try {
        $offset = if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { 3 } else { 0 }
        $text = $utf8Strict.GetString($bytes, $offset, $bytes.Length - $offset)
    } catch {
        Write-Warning "跳过非 UTF-8 文本：$($file.FullName)"
        continue
    }
    [System.IO.File]::WriteAllText($file.FullName, $text, $utf8Bom)
    $converted += 1
}

Write-Output "已规范为 UTF-8 with BOM：$converted 个文本文件"
