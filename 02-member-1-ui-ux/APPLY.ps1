param([string]$RepoRoot = (Get-Location).Path)

$ErrorActionPreference = 'Stop'
$packageRoot = $PSScriptRoot
$config = Get-Content -LiteralPath (Join-Path $packageRoot 'PACKAGE.json') -Raw | ConvertFrom-Json
$repo = (Resolve-Path -LiteralPath $RepoRoot).Path

if (-not (Test-Path -LiteralPath (Join-Path $repo '.git'))) {
    throw 'RepoRoot không phải Git repository.'
}

$branch = git -C $repo branch --show-current
if ($branch -ne $config.expectedBranch) {
    throw "Sai branch: cần '$($config.expectedBranch)', hiện tại là '$branch'."
}

if (git -C $repo status --porcelain) {
    throw 'Working tree phải sạch trước khi áp dụng package.'
}

if ($config.baseTree -eq 'EMPTY') {
    if (git -C $repo ls-files) { throw 'Package nền chỉ áp dụng cho repository chưa có file tracked.' }
} else {
    $actualBase = git -C $repo rev-parse 'HEAD^{tree}'
    if ($actualBase -ne $config.baseTree) {
        throw "Sai checkpoint nền. Cần tree $($config.baseTree), hiện tại $actualBase."
    }
}

$payload = Join-Path $packageRoot 'payload'
Get-ChildItem -LiteralPath $payload -Recurse -File | ForEach-Object {
    $relative = $_.FullName.Substring($payload.Length).TrimStart('\')
    $destination = Join-Path $repo $relative
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
}

$deleteFile = Join-Path $packageRoot 'DELETE_PATHS.txt'
if (Test-Path -LiteralPath $deleteFile) {
    Get-Content -LiteralPath $deleteFile | Where-Object { $_.Trim() } | ForEach-Object {
        $candidate = [System.IO.Path]::GetFullPath((Join-Path $repo $_))
        $repoPrefix = $repo.TrimEnd('\') + '\'
        if (-not $candidate.StartsWith($repoPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Đường dẫn xóa nằm ngoài repository: $_"
        }
        if (Test-Path -LiteralPath $candidate) {
            Remove-Item -LiteralPath $candidate -Recurse -Force
        }
    }
}

git -C $repo add -A
$actualTarget = git -C $repo write-tree
if ($actualTarget -ne $config.targetTree) {
    throw "Payload không tạo đúng checkpoint. Cần $($config.targetTree), nhận $actualTarget."
}

Write-Host "Đã stage đúng checkpoint $($config.member). Chỉ cần commit và push." -ForegroundColor Green
