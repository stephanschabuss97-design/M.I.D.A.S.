[CmdletBinding()]
param(
  [switch]$ConfirmCutover
)

$ErrorActionPreference = 'Stop'

if (-not $ConfirmCutover) {
  throw 'The R14 V2 productload cutover requires -ConfirmCutover.'
}

$sourceCommit = '0fa44e29536a604256638057d4e54a9e593b8bab'
$repositoryRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$gitRoot = (& git -C $repositoryRoot rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0 -or (Resolve-Path -LiteralPath $gitRoot).Path -ne $repositoryRoot) {
  throw 'The cutover tool is not running in the MIDAS repository root.'
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
$preparedSourceHashes = @{
  'app/supabase/api/intake.js' = '420b8bc3e1fc8bdca5db5929db102500c3c2ce4e82bfe3dfb9052ba3c158d36a'
}

foreach ($relativePath in $productPaths) {
  & git -C $repositoryRoot cat-file -e "$sourceCommit`:$relativePath"
  if ($LASTEXITCODE -ne 0) {
    throw "The cutover source is missing $relativePath."
  }
  & git -C $repositoryRoot diff --quiet -- $relativePath
  if ($LASTEXITCODE -ne 0) {
    if (-not $preparedSourceHashes.ContainsKey($relativePath)) {
      throw "The cutover product path has an uncommitted change: $relativePath."
    }
    $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $repositoryRoot $relativePath)).Hash.ToLowerInvariant()
    if ($actualHash -ne $preparedSourceHashes[$relativePath]) {
      throw "The cutover prepared source fingerprint does not match: $relativePath."
    }
  }
}

& git -C $repositoryRoot restore --source=$sourceCommit --worktree -- @restoredProductPaths
if ($LASTEXITCODE -ne 0) {
  throw 'The explicit R14 V2 product path restore failed.'
}

function Replace-Exactly {
  param(
    [Parameter(Mandatory)] [string] $Source,
    [Parameter(Mandatory)] [string] $Needle,
    [Parameter(Mandatory)] [string] $Replacement,
    [Parameter(Mandatory)] [string] $Label
  )
  if ([regex]::Matches($Source, [regex]::Escape($Needle)).Count -ne 1) {
    throw "The cutover source does not contain exactly one $Label token."
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
    throw "The cutover module graph still contains an unversioned import in $RelativePath."
  }
  [IO.File]::WriteAllText($path, $source, [Text.UTF8Encoding]::new($false))
}

$captureScripts = @(
  'app/modules/vitals-stack/activity/v2/semantics.js',
  'app/modules/vitals-stack/activity/v2/semantics-v2.js',
  'app/modules/vitals-stack/activity/v2/session-draft.js',
  'app/modules/vitals-stack/activity/v2/session-recovery.js',
  'app/modules/vitals-stack/activity/v2/session-commit.js',
  'app/modules/vitals-stack/activity/v2/session-canonicalization.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export.js',
  'app/modules/vitals-stack/activity/v2/data-access.js',
  'app/modules/vitals-stack/activity/v2/session-shell.js',
  'app/modules/vitals-stack/activity/v2/session-correction.js',
  'app/modules/vitals-stack/activity/v2/session-history.js',
  'app/modules/vitals-stack/activity/v2/session-history-shell.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-controller.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-shell.js',
  'app/modules/vitals-stack/activity/v2/activity-product-controller.js'
)
$captureStyles = @(
  'app/modules/vitals-stack/activity/v2/session-shell.css',
  'app/modules/vitals-stack/activity/v2/session-history-shell.css',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-shell.css',
  'app/modules/vitals-stack/activity/v2/activity-product-controller.css'
)

$indexPath = Join-Path $repositoryRoot 'index.html'
$indexSource = [IO.File]::ReadAllText($indexPath)
$nestedHosts = @"
            <div id="activityV2ProductHost"></div>
            <div id="activityV2SessionHost"></div>
            <div id="activityV2HistoryHost" hidden></div>
            <div id="activityV2ExportHost" hidden></div>
"@
$productHost = '            <div id="activityV2ProductHost"></div>'
$indexSource = Replace-Exactly $indexSource $nestedHosts $productHost 'nested Activity V2 host'
$overlayHosts = @"
  </main>
  <div id="activityV2SessionHost"></div>
  <div id="activityV2HistoryHost" hidden></div>
  <div id="activityV2ExportHost" hidden></div>
"@
$indexSource = Replace-Exactly $indexSource '  </main>' $overlayHosts 'main close'
$indexSource = Replace-Exactly $indexSource 'href="app/app.css"' 'href="app/app.css?v=22"' 'app stylesheet'
foreach ($relativePath in $captureScripts) {
  $indexSource = Replace-Exactly $indexSource "src=`"$relativePath`"" "src=`"${relativePath}?v=22`"" "script $relativePath"
}
$indexSource = Replace-Exactly $indexSource 'src="app/supabase/index.js"' 'src="app/supabase/index.js?v=22"' 'Supabase module'
$indexSource = Replace-Exactly $indexSource 'src="assets/js/boot-auth.js"' 'src="assets/js/boot-auth.js?v=22"' 'Supabase auth boot module'
$indexSource = Replace-Exactly $indexSource 'src="app/modules/doctor-stack/charts/index.js"' 'src="app/modules/doctor-stack/charts/index.js?v=22"' 'Doctor chart module'
$indexSource = Replace-Exactly $indexSource 'src="assets/js/main.js"' 'src="assets/js/main.js?v=22"' 'main script'
$indexNewline = if ($indexSource.Contains("`r`n")) { "`r`n" } else { "`n" }
$indexSource = $indexSource.TrimEnd([char[]]("`r`n")) + $indexNewline
[IO.File]::WriteAllText($indexPath, $indexSource, [Text.UTF8Encoding]::new($false))

$cssPath = Join-Path $repositoryRoot 'app/app.css'
$cssSource = [IO.File]::ReadAllText($cssPath)
foreach ($relativePath in $captureStyles) {
  $importPath = $relativePath.Replace('app/', './')
  $cssSource = Replace-Exactly $cssSource "url(`"$importPath`")" "url(`"${importPath}?v=22`")" "style $relativePath"
}
[IO.File]::WriteAllText($cssPath, $cssSource, [Text.UTF8Encoding]::new($false))

foreach ($relativePath in $supabaseModulePaths) {
  Set-ReleaseModuleVersion $relativePath '22'
}

$mainPath = Join-Path $repositoryRoot 'assets/js/main.js'
$mainSource = [IO.File]::ReadAllText($mainPath)
$newline = if ($mainSource.Contains("`r`n")) { "`r`n" } else { "`n" }
$lifecycleNeedle = "    return true;$newline  }$newline});"
$lifecycleReplacement = "    return true;$newline  },$newline  preflightSessionCommit() {$newline    if (arguments.length !== 0) {$newline      throw new Error('Activity V2 preflight does not accept payloads.');$newline    }$newline    if (!activityV2ProductController) return null;$newline    return activityV2ProductController.preflightSessionCommit();$newline  }$newline});"
$mainSource = Replace-Exactly $mainSource $lifecycleNeedle $lifecycleReplacement 'Activity V2 lifecycle'
[IO.File]::WriteAllText($mainPath, $mainSource, [Text.UTF8Encoding]::new($false))

$workerPath = Join-Path $repositoryRoot 'service-worker.js'
$workerSource = [IO.File]::ReadAllText($workerPath)
$workerSource = Replace-Exactly $workerSource "const CACHE_VERSION = 'v18';" "const CACHE_VERSION = 'v22';" 'service worker version'
foreach ($relativePath in $captureScripts + $captureStyles) {
  $workerSource = Replace-Exactly $workerSource "toUrl('$relativePath')" "toUrl('${relativePath}?v=22')" "worker asset $relativePath"
}
foreach ($relativePath in @('app/app.css', 'app/supabase/index.js', 'assets/js/main.js')) {
  $workerSource = Replace-Exactly $workerSource "toUrl('$relativePath')" "toUrl('${relativePath}?v=22')" "worker asset $relativePath"
}
$workerNewline = if ($workerSource.Contains("`r`n")) { "`r`n" } else { "`n" }
$chartAsset = "  toUrl('app/modules/doctor-stack/charts/index.js?v=22'),"
$mainAsset = "  toUrl('assets/js/main.js?v=22'),"
if ($workerSource.Contains($chartAsset)) {
  throw 'The cutover source already contains the V22 Doctor chart worker asset.'
}
$workerSource = Replace-Exactly $workerSource $mainAsset "$chartAsset$workerNewline$mainAsset" 'Doctor chart worker asset anchor'
$supabaseWorkerAssets = ($supabaseModulePaths |
  Where-Object { $_ -ne 'assets/js/boot-auth.js' } |
  ForEach-Object { "  toUrl('$($_)?v=22')," }) -join $workerNewline
$supabaseRootAsset = "  toUrl('app/supabase/index.js?v=22'),"
$workerSource = Replace-Exactly $workerSource $supabaseRootAsset $supabaseWorkerAssets 'complete Supabase ESM worker graph'
$workerSource = Replace-Exactly $workerSource "  toUrl('assets/js/boot-auth.js')," "  toUrl('assets/js/boot-auth.js?v=22')," 'Supabase auth boot worker asset'
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
if (-not $postimage.Contains("const CACHE_VERSION = 'v22';") -or
    -not $postimage.Contains("activity-product-controller.js?v=22") -or
    -not $postimage.Contains("app/supabase/api/reports.js?v=22") -or
    -not $postimage.Contains("assets/js/boot-auth.js?v=22") -or
    [IO.File]::ReadAllText($indexPath).Contains('<div id="activityV2SessionHost"></div>' + [Environment]::NewLine + '            <div id="activityV2HistoryHost"')) {
  throw 'The V22 V2 productload postimage validation failed.'
}

Write-Output 'R14_V2_PRODUCTLOAD_CUTOVER_V22_READY'
