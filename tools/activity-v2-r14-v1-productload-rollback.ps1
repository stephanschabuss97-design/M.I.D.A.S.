[CmdletBinding()]
param(
  [switch]$ConfirmRollback
)

$ErrorActionPreference = 'Stop'

if (-not $ConfirmRollback) {
  throw 'The R14 V1 productload rollback requires -ConfirmRollback.'
}

$baselineCommit = '4be058b1b2e59f410ea8a6e3a4e5af9fdb86b652'
$repositoryRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$gitRoot = (& git -C $repositoryRoot rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0 -or (Resolve-Path -LiteralPath $gitRoot).Path -ne $repositoryRoot) {
  throw 'The rollback tool is not running in the MIDAS repository root.'
}

$productPaths = @(
  'index.html',
  'app/app.css',
  'assets/js/main.js',
  'app/supabase/auth/core.js',
  'app/modules/doctor-stack/charts/index.js',
  'service-worker.js'
)

foreach ($relativePath in $productPaths) {
  & git -C $repositoryRoot cat-file -e "$baselineCommit`:$relativePath"
  if ($LASTEXITCODE -ne 0) {
    throw "The rollback baseline is missing $relativePath."
  }
}

& git -C $repositoryRoot restore --source=$baselineCommit --worktree -- @productPaths
if ($LASTEXITCODE -ne 0) {
  throw 'The explicit R14 product path restore failed.'
}

$workerPath = Join-Path $repositoryRoot 'service-worker.js'
$workerSource = [IO.File]::ReadAllText($workerPath)
$versionNeedle = "const CACHE_VERSION = 'v13';"
if ([regex]::Matches($workerSource, [regex]::Escape($versionNeedle)).Count -ne 1) {
  throw 'The restored service worker does not contain the exact v13 baseline token.'
}
$workerSource = $workerSource.Replace($versionNeedle, "const CACHE_VERSION = 'v15';")

$assetNeedle = "  toUrl('assets/js/ui-tabs.js'),"
$v1Asset = "  toUrl('app/modules/vitals-stack/activity/index.js'),"
if ([regex]::Matches($workerSource, [regex]::Escape($assetNeedle)).Count -ne 1 -or
    $workerSource.Contains($v1Asset)) {
  throw 'The restored service worker cannot be extended with the exact V1 product asset.'
}
$workerSource = $workerSource.Replace($assetNeedle, "$assetNeedle`r`n$v1Asset")
[IO.File]::WriteAllText($workerPath, $workerSource, [Text.UTF8Encoding]::new($false))

$postimage = [IO.File]::ReadAllText($workerPath)
if (-not $postimage.Contains("const CACHE_VERSION = 'v15';") -or
    -not $postimage.Contains($v1Asset) -or
    $postimage.Contains("activity/v2/activity-product-controller.js")) {
  throw 'The V15 V1 productload postimage validation failed.'
}

Write-Output 'R14_V1_PRODUCTLOAD_ROLLBACK_V15_READY'
