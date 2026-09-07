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

$restoredProductPaths = @(
  'index.html',
  'app/app.css',
  'assets/js/main.js',
  'app/supabase/index.js',
  'app/supabase/auth/index.js',
  'app/supabase/auth/core.js',
  'app/modules/doctor-stack/charts/index.js',
  'service-worker.js'
)
$supabaseModulePaths = @(
  'app/supabase/index.js',
  'app/supabase/core/state.js',
  'app/supabase/core/client.js',
  'app/supabase/core/http.js',
  'app/supabase/auth/index.js',
  'app/supabase/auth/core.js',
  'app/supabase/auth/ui.js',
  'app/supabase/auth/guard.js',
  'app/supabase/realtime/index.js',
  'app/supabase/api/intake.js',
  'app/supabase/api/vitals.js',
  'app/supabase/api/notes.js',
  'app/supabase/api/select.js',
  'app/supabase/api/push.js',
  'app/supabase/api/system-comments.js',
  'app/supabase/api/trendpilot.js',
  'app/supabase/api/reports.js',
  'assets/js/boot-auth.js'
)
$productPaths = @($restoredProductPaths + $supabaseModulePaths) | Select-Object -Unique

foreach ($relativePath in $productPaths) {
  & git -C $repositoryRoot cat-file -e "$baselineCommit`:$relativePath"
  if ($LASTEXITCODE -ne 0) {
    throw "The rollback baseline is missing $relativePath."
  }
  & git -C $repositoryRoot diff --quiet -- $relativePath
  if ($LASTEXITCODE -ne 0) {
    throw "The rollback product path has an uncommitted change: $relativePath."
  }
}

& git -C $repositoryRoot restore --source=$baselineCommit --worktree -- @restoredProductPaths
if ($LASTEXITCODE -ne 0) {
  throw 'The explicit R14 product path restore failed.'
}

$workerPath = Join-Path $repositoryRoot 'service-worker.js'
$workerSource = [IO.File]::ReadAllText($workerPath)
$versionNeedle = "const CACHE_VERSION = 'v13';"
if ([regex]::Matches($workerSource, [regex]::Escape($versionNeedle)).Count -ne 1) {
  throw 'The restored service worker does not contain the exact v13 baseline token.'
}
$workerSource = $workerSource.Replace($versionNeedle, "const CACHE_VERSION = 'v21';")

$assetNeedle = "  toUrl('assets/js/ui-tabs.js'),"
$v1Asset = "  toUrl('app/modules/vitals-stack/activity/index.js'),"
if ([regex]::Matches($workerSource, [regex]::Escape($assetNeedle)).Count -ne 1 -or
    $workerSource.Contains($v1Asset)) {
  throw 'The restored service worker cannot be extended with the exact V1 product asset.'
}
$workerSource = $workerSource.Replace($assetNeedle, "$assetNeedle`r`n$v1Asset")

function Replace-Exactly {
  param(
    [Parameter(Mandatory)] [string] $Source,
    [Parameter(Mandatory)] [string] $Needle,
    [Parameter(Mandatory)] [string] $Replacement,
    [Parameter(Mandatory)] [string] $Label
  )
  if ([regex]::Matches($Source, [regex]::Escape($Needle)).Count -ne 1) {
    throw "The rollback source does not contain exactly one $Label token."
  }
  return $Source.Replace($Needle, $Replacement)
}

function Set-ReleaseModuleVersion {
  param(
    [Parameter(Mandatory)] [string] $RelativePath,
    [Parameter(Mandatory)] [string] $Version
  )
  $path = Join-Path $repositoryRoot $RelativePath
  $source = [IO.File]::ReadAllText($path)
  $pattern = '(?<prefix>\bfrom\s+["''])(?<path>\.{1,2}/[^"'']+\.js)(?:\?v=\d+)?(?<suffix>["''])'
  $source = [regex]::Replace($source, $pattern, {
    param($match)
    return $match.Groups['prefix'].Value + $match.Groups['path'].Value +
      "?v=$Version" + $match.Groups['suffix'].Value
  })
  $unversioned = '(?<prefix>\bfrom\s+["''])(?<path>\.{1,2}/[^"'']+\.js)(?<suffix>["''])'
  if ([regex]::IsMatch($source, $unversioned)) {
    throw "The rollback module graph still contains an unversioned import in $RelativePath."
  }
  [IO.File]::WriteAllText($path, $source, [Text.UTF8Encoding]::new($false))
}

$indexPath = Join-Path $repositoryRoot 'index.html'
$indexSource = [IO.File]::ReadAllText($indexPath)
$indexSource = Replace-Exactly $indexSource 'href="app/app.css"' 'href="app/app.css?v=21"' 'app stylesheet'
$indexSource = Replace-Exactly $indexSource 'src="app/modules/vitals-stack/activity/index.js"' 'src="app/modules/vitals-stack/activity/index.js?v=21"' 'V1 Activity script'
$indexSource = Replace-Exactly $indexSource 'src="app/supabase/index.js"' 'src="app/supabase/index.js?v=21"' 'Supabase module'
$indexSource = Replace-Exactly $indexSource 'src="assets/js/boot-auth.js"' 'src="assets/js/boot-auth.js?v=21"' 'Supabase auth boot module'
$indexSource = Replace-Exactly $indexSource 'src="app/modules/doctor-stack/charts/index.js"' 'src="app/modules/doctor-stack/charts/index.js?v=21"' 'Doctor chart module'
$indexSource = Replace-Exactly $indexSource 'src="assets/js/main.js"' 'src="assets/js/main.js?v=21"' 'main script'
$indexNewline = if ($indexSource.Contains("`r`n")) { "`r`n" } else { "`n" }
$indexSource = $indexSource.TrimEnd([char[]]("`r`n")) + $indexNewline
[IO.File]::WriteAllText($indexPath, $indexSource, [Text.UTF8Encoding]::new($false))

foreach ($relativePath in $supabaseModulePaths) {
  Set-ReleaseModuleVersion $relativePath '21'
}

$mainPath = Join-Path $repositoryRoot 'assets/js/main.js'
$mainSource = [IO.File]::ReadAllText($mainPath)
$mainNewline = if ($mainSource.Contains("`r`n")) { "`r`n" } else { "`n" }
$mainSource = $mainSource.TrimEnd([char[]]("`r`n")) + $mainNewline
[IO.File]::WriteAllText($mainPath, $mainSource, [Text.UTF8Encoding]::new($false))

foreach ($relativePath in @(
  'app/app.css',
  'app/modules/vitals-stack/activity/index.js',
  'app/supabase/index.js',
  'assets/js/main.js'
)) {
  $workerSource = Replace-Exactly $workerSource "toUrl('$relativePath')" "toUrl('${relativePath}?v=21')" "worker asset $relativePath"
}
$workerNewline = if ($workerSource.Contains("`r`n")) { "`r`n" } else { "`n" }
$chartAsset = "  toUrl('app/modules/doctor-stack/charts/index.js?v=21'),"
$mainAsset = "  toUrl('assets/js/main.js?v=21'),"
if ($workerSource.Contains($chartAsset)) {
  throw 'The rollback source already contains the V21 Doctor chart worker asset.'
}
$workerSource = Replace-Exactly $workerSource $mainAsset "$chartAsset$workerNewline$mainAsset" 'Doctor chart worker asset anchor'
$supabaseWorkerAssets = ($supabaseModulePaths |
  Where-Object { $_ -ne 'assets/js/boot-auth.js' } |
  ForEach-Object { "  toUrl('$($_)?v=21')," }) -join $workerNewline
$supabaseRootAsset = "  toUrl('app/supabase/index.js?v=21'),"
$workerSource = Replace-Exactly $workerSource $supabaseRootAsset $supabaseWorkerAssets 'complete Supabase ESM worker graph'
$workerSource = Replace-Exactly $workerSource "  toUrl('assets/js/boot-auth.js')," "  toUrl('assets/js/boot-auth.js?v=21')," 'Supabase auth boot worker asset'
$fallbackNeedle = @"
const getNavigateFallbackResponse = async (request) => {
  const direct = await caches.match(request);
  if (direct) return direct;
  const shellIndex = await caches.match(toUrl('index.html'));
  if (shellIndex) return shellIndex;
  const shellRoot = await caches.match(toUrl('./'));
  if (shellRoot) return shellRoot;
  return caches.match(toUrl('offline.html'));
};
"@
$fallbackReplacement = @"
const getNavigateFallbackResponse = async (request) => {
  const shell = await caches.open(SHELL_CACHE);
  const direct = await shell.match(request);
  if (direct) return direct;
  const shellIndex = await shell.match(toUrl('index.html'));
  if (shellIndex) return shellIndex;
  const shellRoot = await shell.match(toUrl('./'));
  if (shellRoot) return shellRoot;
  return shell.match(toUrl('offline.html'));
};
const getCurrentAssetResponse = async (request) => {
  const shell = await caches.open(SHELL_CACHE);
  const shellResponse = await shell.match(request);
  if (shellResponse) return shellResponse;
  const runtime = await caches.open(RUNTIME_CACHE);
  return runtime.match(request);
};
"@
$workerSource = Replace-Exactly $workerSource $fallbackNeedle $fallbackReplacement 'current-release cache lookup'
$workerSource = Replace-Exactly $workerSource '      caches.match(request).then((cached) => {' '      getCurrentAssetResponse(request).then((cached) => {' 'static asset cache lookup'
$workerSource = Replace-Exactly $workerSource 'test(request.url);' 'test(new URL(request.url).pathname);' 'query-safe static asset classification'
[IO.File]::WriteAllText($workerPath, $workerSource, [Text.UTF8Encoding]::new($false))

$postimage = [IO.File]::ReadAllText($workerPath)
if (-not $postimage.Contains("const CACHE_VERSION = 'v21';") -or
    -not $postimage.Contains("app/modules/vitals-stack/activity/index.js?v=21") -or
    -not $postimage.Contains("app/modules/doctor-stack/charts/index.js?v=21") -or
    -not $postimage.Contains("app/supabase/api/reports.js?v=21") -or
    -not $postimage.Contains("assets/js/boot-auth.js?v=21") -or
    $postimage.Contains("activity/v2/activity-product-controller.js")) {
  throw 'The V21 V1 productload postimage validation failed.'
}

Write-Output 'R14_V1_PRODUCTLOAD_ROLLBACK_V21_READY'
