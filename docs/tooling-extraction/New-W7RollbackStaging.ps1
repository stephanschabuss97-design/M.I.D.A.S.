[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$candidatePath = Join-Path $PSScriptRoot 'w7-retirement-candidate-manifest.json'
$candidate = Get-Content -Raw -LiteralPath $candidatePath -Encoding UTF8 |
    ConvertFrom-Json
$rollbackRoot = [IO.Path]::GetFullPath(
    'C:\Users\steph\Projekte\Backup\Old\ARGUS-PILOT\.w7-rollback-w7-retirement-candidate-20260920'
).TrimEnd('\')
$allowedParent = [IO.Path]::GetFullPath(
    'C:\Users\steph\Projekte\Backup\Old\ARGUS-PILOT'
).TrimEnd('\')
$utf8 = New-Object Text.UTF8Encoding($false)

if (-not $rollbackRoot.StartsWith(($allowedParent + '\'), [StringComparison]::OrdinalIgnoreCase)) {
    throw "ROLLBACK_ROOT_OUTSIDE_BOUNDARY: $rollbackRoot"
}
if (Test-Path -LiteralPath $rollbackRoot) {
    throw "ROLLBACK_ROOT_EXISTS: $rollbackRoot"
}

function Get-Hash([string]$Path) {
    (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

function Get-SafeChild([string]$Root, [string]$Relative) {
    $path = [IO.Path]::GetFullPath((Join-Path $Root $Relative.Replace('/', '\')))
    if (-not $path.StartsWith(($Root + '\'), [StringComparison]::OrdinalIgnoreCase)) {
        throw "ROLLBACK_PATH_ESCAPE: $Relative"
    }
    $path
}

try {
    $null = New-Item -ItemType Directory -Path $rollbackRoot
    $candidateBackupRoot = Join-Path $rollbackRoot 'candidates'
    $referenceBackupRoot = Join-Path $rollbackRoot 'references'
    $null = New-Item -ItemType Directory -Path $candidateBackupRoot
    $null = New-Item -ItemType Directory -Path $referenceBackupRoot

    foreach ($entry in @($candidate.retirementCandidates)) {
        $sourceRoot = [IO.Path]::GetFullPath([string]$entry.path).TrimEnd('\')
        if (-not (Test-Path -LiteralPath $sourceRoot)) {
            throw "CANDIDATE_MISSING: $($entry.candidateId)"
        }
        $sourceItem = Get-Item -Force -LiteralPath $sourceRoot
        $allItems = @($sourceItem)
        if ($sourceItem.PSIsContainer) {
            $allItems += @(Get-ChildItem -Force -Recurse -LiteralPath $sourceRoot)
        }
        if (@($allItems | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) {
            throw "CANDIDATE_REPARSE_POINT: $($entry.candidateId)"
        }

        $actualFiles = if ($sourceItem.PSIsContainer) {
            @(Get-ChildItem -Force -Recurse -File -LiteralPath $sourceRoot)
        }
        else {
            @($sourceItem)
        }
        if (@($actualFiles).Count -ne [int]$entry.fileCount) {
            throw "CANDIDATE_FILE_COUNT_DRIFT: $($entry.candidateId)"
        }

        $backup = Join-Path $candidateBackupRoot ([string]$entry.candidateId)
        $null = New-Item -ItemType Directory -Path $backup
        foreach ($empty in @($entry.emptyDirectories)) {
            $emptyPath = Get-SafeChild $backup ([string]$empty)
            $null = New-Item -ItemType Directory -Path $emptyPath -Force
        }
        foreach ($file in @($entry.files)) {
            $sourcePath = if ([string]$entry.kind -eq 'DIRECTORY') {
                Get-SafeChild $sourceRoot ([string]$file.path)
            }
            else {
                $sourceRoot
            }
            if (
                -not (Test-Path -LiteralPath $sourcePath -PathType Leaf) -or
                (Get-Item -LiteralPath $sourcePath).Length -ne [long]$file.bytes -or
                (Get-Hash $sourcePath) -ne [string]$file.sha256
            ) {
                throw "CANDIDATE_FILE_DRIFT: $($entry.candidateId):$($file.path)"
            }
            $backupPath = Get-SafeChild $backup ([string]$file.path)
            $backupParent = [IO.Path]::GetDirectoryName($backupPath)
            if (-not (Test-Path -LiteralPath $backupParent)) {
                $null = New-Item -ItemType Directory -Path $backupParent -Force
            }
            [IO.File]::Copy($sourcePath, $backupPath, $false)
            if (
                (Get-Item -LiteralPath $backupPath).Length -ne [long]$file.bytes -or
                (Get-Hash $backupPath) -ne [string]$file.sha256
            ) {
                throw "ROLLBACK_COPY_DRIFT: $($entry.candidateId):$($file.path)"
            }
        }
    }

    foreach ($preimage in @($candidate.referencePreimages)) {
        $source = [IO.Path]::GetFullPath((Join-Path ([string]$preimage.root) ([string]$preimage.path)))
        if (
            -not (Test-Path -LiteralPath $source -PathType Leaf) -or
            (Get-Item -LiteralPath $source).Length -ne [long]$preimage.bytes -or
            (Get-Hash $source) -ne [string]$preimage.sha256
        ) {
            throw "REFERENCE_PREIMAGE_DRIFT: $source"
        }
        $rootLabel = if ([string]$preimage.root -eq 'C:\Users\steph\Projekte\M.I.D.A.S') {
            'MIDAS'
        }
        elseif ([string]$preimage.root -eq 'C:\Users\steph\Projekte\H.E.S.T.I.A') {
            'HESTIA'
        }
        else {
            throw "REFERENCE_ROOT_UNKNOWN: $($preimage.root)"
        }
        $backup = Get-SafeChild (Join-Path $referenceBackupRoot $rootLabel) ([string]$preimage.path)
        $backupParent = [IO.Path]::GetDirectoryName($backup)
        if (-not (Test-Path -LiteralPath $backupParent)) {
            $null = New-Item -ItemType Directory -Path $backupParent -Force
        }
        [IO.File]::Copy($source, $backup, $false)
    }

    $receipt = [pscustomobject][ordered]@{
        schemaVersion = 1
        createdAt = [DateTimeOffset]::Now.ToString('o')
        candidateManifestSha256 = Get-Hash $candidatePath
        rollbackRoot = $rollbackRoot
        candidateCount = @($candidate.retirementCandidates).Count
        referencePreimageCount = @($candidate.referencePreimages).Count
        exactCopiesValidated = $true
    }
    [IO.File]::WriteAllText(
        (Join-Path $rollbackRoot 'rollback-staging-receipt.json'),
        (($receipt | ConvertTo-Json -Depth 5) + "`n"),
        $utf8
    )
    $receipt | ConvertTo-Json -Compress
}
catch {
    if (Test-Path -LiteralPath $rollbackRoot) {
        $resolved = [IO.Path]::GetFullPath($rollbackRoot).TrimEnd('\')
        if ($resolved.StartsWith(($allowedParent + '\'), [StringComparison]::OrdinalIgnoreCase)) {
            Remove-Item -LiteralPath $resolved -Recurse -Force
        }
    }
    throw
}
