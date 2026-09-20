[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$midasRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$candidatePath = Join-Path $PSScriptRoot 'w7-retirement-candidate-manifest.json'
$candidate = Get-Content -Raw -LiteralPath $candidatePath -Encoding UTF8 |
    ConvertFrom-Json

$source = [IO.Path]::GetFullPath([string]$candidate.sourceArchive.root).TrimEnd('\')
$target = [IO.Path]::GetFullPath([string]$candidate.targetArchive.root).TrimEnd('\')
$parent = [IO.Path]::GetFullPath([IO.Path]::GetDirectoryName($target)).TrimEnd('\')
$expectedParent = 'C:\Users\steph\Projekte\Backup\Old\ARGUS-PILOT'

if ($parent -ne $expectedParent) {
    throw "TARGET_PARENT_UNEXPECTED: $parent"
}
if (Test-Path -LiteralPath $target) {
    throw "TARGET_EXISTS: $target"
}
if (-not (Test-Path -LiteralPath 'C:\Users\steph\Projekte\Backup\Old' -PathType Container)) {
    throw 'TARGET_BASE_MISSING'
}
if (-not (Test-Path -LiteralPath $parent)) {
    $null = New-Item -ItemType Directory -Path $parent
}

$stage = [IO.Path]::GetFullPath((Join-Path $parent ('.w7-stage-' + [guid]::NewGuid().ToString('N'))))
$restore = [IO.Path]::GetFullPath((Join-Path $parent ('.w7-restore-' + [guid]::NewGuid().ToString('N'))))
$utf8 = New-Object Text.UTF8Encoding($false)
$published = $false

function Assert-W7Child([string]$Path) {
    $full = [IO.Path]::GetFullPath($Path).TrimEnd('\')
    if (-not $full.StartsWith(($parent + '\'), [StringComparison]::OrdinalIgnoreCase)) {
        throw "PATH_OUTSIDE_W7_PARENT: $full"
    }
    $full
}

function Get-Hash([string]$Path) {
    (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

function Get-TextHash([string]$Text) {
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        ([BitConverter]::ToString($sha.ComputeHash($utf8.GetBytes($Text)))).Replace('-', '').ToLowerInvariant()
    }
    finally {
        $sha.Dispose()
    }
}

try {
    $stage = Assert-W7Child $stage
    $null = New-Item -ItemType Directory -Path $stage
    $archiveCandidate = @(
        $candidate.retirementCandidates |
            Where-Object candidateId -eq 'former-w4-archive-root'
    )[0]

    foreach ($empty in @($archiveCandidate.emptyDirectories)) {
        $dir = [IO.Path]::GetFullPath((Join-Path $stage ([string]$empty).Replace('/', '\')))
        if (-not $dir.StartsWith(($stage + '\'), [StringComparison]::OrdinalIgnoreCase)) {
            throw "STAGE_PATH_ESCAPE: $empty"
        }
        $null = New-Item -ItemType Directory -Path $dir -Force
    }

    foreach ($file in @($archiveCandidate.files)) {
        $sourcePath = [IO.Path]::GetFullPath((Join-Path $source ([string]$file.path).Replace('/', '\')))
        $targetPath = [IO.Path]::GetFullPath((Join-Path $stage ([string]$file.path).Replace('/', '\')))
        if (-not $sourcePath.StartsWith(($source + '\'), [StringComparison]::OrdinalIgnoreCase)) {
            throw "SOURCE_PATH_ESCAPE: $($file.path)"
        }
        if (-not $targetPath.StartsWith(($stage + '\'), [StringComparison]::OrdinalIgnoreCase)) {
            throw "STAGE_PATH_ESCAPE: $($file.path)"
        }
        if (Test-Path -LiteralPath $targetPath) {
            throw "STAGE_OVERWRITE: $targetPath"
        }
        $destinationParent = [IO.Path]::GetDirectoryName($targetPath)
        if (-not (Test-Path -LiteralPath $destinationParent)) {
            $null = New-Item -ItemType Directory -Path $destinationParent -Force
        }
        [IO.File]::Copy($sourcePath, $targetPath, $false)
        if (
            (Get-Item -LiteralPath $targetPath).Length -ne [long]$file.bytes -or
            (Get-Hash $targetPath) -ne [string]$file.sha256
        ) {
            throw "STAGE_FILE_MISMATCH: $($file.path)"
        }
    }

    $stageFiles = @(Get-ChildItem -Force -Recurse -File -LiteralPath $stage)
    if ($stageFiles.Count -ne [int]$archiveCandidate.fileCount) {
        throw "STAGE_FILE_COUNT_MISMATCH: $($stageFiles.Count)"
    }
    $records = @(
        $stageFiles |
            ForEach-Object {
                $relative = $_.FullName.Substring($stage.Length + 1).Replace('\', '/')
                "$relative|$($_.Length)|$(Get-Hash $_.FullName)"
            } |
            Sort-Object
    )
    $stageDigest = Get-TextHash ([string]::Join("`n", $records))
    if ($stageDigest -ne [string]$archiveCandidate.inventoryDigest) {
        throw "STAGE_DIGEST_MISMATCH: $stageDigest"
    }

    Move-Item -LiteralPath $stage -Destination $target
    $published = $true
    $stage = $null

    Push-Location 'C:\Users\steph\Projekte'
    try {
        $proof = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File `
            (Join-Path $target 'Test-ArgusPilotArchive.ps1') -ValidateExternalReferences
        if ($LASTEXITCODE -ne 0) {
            throw "TARGET_ARCHIVE_PROOF_EXIT_$LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }

    $targetFiles = @(Get-ChildItem -Force -Recurse -File -LiteralPath $target)
    $targetRecords = @(
        $targetFiles |
            ForEach-Object {
                $relative = $_.FullName.Substring($target.Length + 1).Replace('\', '/')
                "$relative|$($_.Length)|$(Get-Hash $_.FullName)"
            } |
            Sort-Object
    )
    $targetDigest = Get-TextHash ([string]::Join("`n", $targetRecords))
    if ($targetDigest -ne [string]$archiveCandidate.inventoryDigest) {
        throw "TARGET_TREE_DIGEST_MISMATCH: $targetDigest"
    }

    $restore = Assert-W7Child $restore
    $restoreResult = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File `
        (Join-Path $target 'Restore-ArgusPilotArchive.ps1') -DestinationRoot $restore
    if ($LASTEXITCODE -ne 0) {
        throw "DISPOSABLE_RESTORE_EXIT_$LASTEXITCODE"
    }

    $archiveManifest = Get-Content -Raw -LiteralPath (Join-Path $target 'archive-manifest.json') -Encoding UTF8 |
        ConvertFrom-Json
    foreach ($file in @($archiveManifest.files)) {
        $path = [IO.Path]::GetFullPath((Join-Path $restore ([string]$file.archiveRelativePath).Replace('/', '\')))
        if (-not $path.StartsWith(($restore + '\'), [StringComparison]::OrdinalIgnoreCase)) {
            throw "RESTORE_PATH_ESCAPE: $($file.archiveRelativePath)"
        }
        if (
            -not (Test-Path -LiteralPath $path -PathType Leaf) -or
            (Get-Item -LiteralPath $path).Length -ne [long]$file.bytes -or
            (Get-Hash $path) -ne [string]$file.sha256
        ) {
            throw "RESTORE_FILE_MISMATCH: $($file.archiveRelativePath)"
        }
    }

    $restoreResolved = Assert-W7Child $restore
    if (-not (Test-Path -LiteralPath $restoreResolved -PathType Container)) {
        throw 'RESTORE_ROOT_MISSING'
    }
    Remove-Item -LiteralPath $restoreResolved -Recurse -Force
    $restore = $null

    [pscustomobject][ordered]@{
        published = $true
        target = $target
        completeTreeFiles = $targetFiles.Count
        completeTreeDigest = $targetDigest
        payloadDigest = [string]$candidate.sourceArchive.payloadDigest
        foreignCwdProof = (($proof | Out-String).Trim())
        disposableRestore = (($restoreResult | Out-String).Trim())
        disposableRestoreRemoved = $true
    } | ConvertTo-Json -Compress
}
catch {
    if ($restore -and (Test-Path -LiteralPath $restore)) {
        try {
            $restoreResolved = Assert-W7Child $restore
            Remove-Item -LiteralPath $restoreResolved -Recurse -Force
        }
        catch {}
    }
    if ($stage -and (Test-Path -LiteralPath $stage)) {
        try {
            $stageResolved = Assert-W7Child $stage
            Remove-Item -LiteralPath $stageResolved -Recurse -Force
        }
        catch {}
    }
    if ($published -and (Test-Path -LiteralPath $target)) {
        try {
            $targetResolved = Assert-W7Child $target
            Remove-Item -LiteralPath $targetResolved -Recurse -Force
        }
        catch {}
    }
    throw
}
