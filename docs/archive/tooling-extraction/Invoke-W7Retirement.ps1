[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$midasRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..')).TrimEnd('\')
$hestiaRoot = 'C:\Users\steph\Projekte\H.E.S.T.I.A'
$candidatePath = Join-Path $PSScriptRoot 'w7-retirement-candidate-manifest.json'
$expectedCandidateHash = '6770c2a59a9466f8e6a32e946df935e7e387998dfd541329eb9e543369df559b'
$rollbackRoot = 'C:\Users\steph\Projekte\Backup\Old\ARGUS-PILOT\.w7-rollback-w7-retirement-candidate-20260920'
$newArchive = 'C:\Users\steph\Projekte\Backup\Old\ARGUS-PILOT\v1.2-v1.6'
$candidate = Get-Content -Raw -LiteralPath $candidatePath -Encoding UTF8 |
    ConvertFrom-Json
$deleted = New-Object Collections.Generic.List[string]

function Get-Hash([string]$Path) {
    (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

function Get-SafeChild([string]$Root, [string]$Relative) {
    $rootFull = [IO.Path]::GetFullPath($Root).TrimEnd('\')
    $path = [IO.Path]::GetFullPath((Join-Path $rootFull $Relative.Replace('/', '\')))
    if (-not $path.StartsWith(($rootFull + '\'), [StringComparison]::OrdinalIgnoreCase)) {
        throw "PATH_ESCAPE: $Relative"
    }
    $path
}

function Assert-CandidateExact($Entry) {
    $root = [IO.Path]::GetFullPath([string]$Entry.path).TrimEnd('\')
    if (-not (Test-Path -LiteralPath $root)) {
        throw "CANDIDATE_MISSING: $($Entry.candidateId)"
    }
    $rootItem = Get-Item -Force -LiteralPath $root
    $all = @($rootItem)
    if ($rootItem.PSIsContainer) {
        $all += @(Get-ChildItem -Force -Recurse -LiteralPath $root)
    }
    if (@($all | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) {
        throw "CANDIDATE_REPARSE_POINT: $($Entry.candidateId)"
    }
    $actualFiles = if ($rootItem.PSIsContainer) {
        @(Get-ChildItem -Force -Recurse -File -LiteralPath $root)
    }
    else {
        @($rootItem)
    }
    if (@($actualFiles).Count -ne [int]$Entry.fileCount) {
        throw "CANDIDATE_FILE_COUNT_DRIFT: $($Entry.candidateId)"
    }
    foreach ($file in @($Entry.files)) {
        $path = if ([string]$Entry.kind -eq 'DIRECTORY') {
            Get-SafeChild $root ([string]$file.path)
        }
        else {
            $root
        }
        if (
            -not (Test-Path -LiteralPath $path -PathType Leaf) -or
            (Get-Item -LiteralPath $path).Length -ne [long]$file.bytes -or
            (Get-Hash $path) -ne [string]$file.sha256
        ) {
            throw "CANDIDATE_FILE_DRIFT: $($Entry.candidateId):$($file.path)"
        }
    }
    if ($rootItem.PSIsContainer) {
        $actualEmpty = @(
            Get-ChildItem -Force -Recurse -Directory -LiteralPath $root |
                Where-Object { @(Get-ChildItem -Force -LiteralPath $_.FullName).Count -eq 0 } |
                ForEach-Object { $_.FullName.Substring($root.Length + 1).Replace('\', '/') } |
                Sort-Object
        )
        $expectedEmpty = @($Entry.emptyDirectories | Sort-Object)
        if ([string]::Join("`n", $actualEmpty) -ne [string]::Join("`n", $expectedEmpty)) {
            throw "CANDIDATE_EMPTY_DIRECTORY_DRIFT: $($Entry.candidateId)"
        }
    }
}

function Restore-W7State {
    foreach ($entry in @($candidate.retirementCandidates)) {
        $destination = [IO.Path]::GetFullPath([string]$entry.path).TrimEnd('\')
        $backup = Join-Path (Join-Path $rollbackRoot 'candidates') ([string]$entry.candidateId)
        if (Test-Path -LiteralPath $destination) {
            continue
        }
        if ([string]$entry.kind -eq 'DIRECTORY') {
            $null = New-Item -ItemType Directory -Path $destination
            foreach ($empty in @($entry.emptyDirectories)) {
                $null = New-Item -ItemType Directory -Path (Get-SafeChild $destination ([string]$empty)) -Force
            }
            foreach ($file in @($entry.files)) {
                $source = Get-SafeChild $backup ([string]$file.path)
                $target = Get-SafeChild $destination ([string]$file.path)
                $parent = [IO.Path]::GetDirectoryName($target)
                if (-not (Test-Path -LiteralPath $parent)) {
                    $null = New-Item -ItemType Directory -Path $parent -Force
                }
                [IO.File]::Copy($source, $target, $false)
            }
        }
        else {
            $source = Get-SafeChild $backup ([string]$entry.files[0].path)
            $parent = [IO.Path]::GetDirectoryName($destination)
            if (-not (Test-Path -LiteralPath $parent)) {
                $null = New-Item -ItemType Directory -Path $parent -Force
            }
            [IO.File]::Copy($source, $destination, $false)
        }
    }

    foreach ($preimage in @($candidate.referencePreimages)) {
        $rootLabel = if ([string]$preimage.root -eq $midasRoot) {
            'MIDAS'
        }
        elseif ([string]$preimage.root -eq $hestiaRoot) {
            'HESTIA'
        }
        else {
            throw "REFERENCE_ROOT_UNKNOWN: $($preimage.root)"
        }
        $backupRoot = Join-Path (Join-Path $rollbackRoot 'references') $rootLabel
        $source = Get-SafeChild $backupRoot ([string]$preimage.path)
        $target = [IO.Path]::GetFullPath((Join-Path ([string]$preimage.root) ([string]$preimage.path)))
        $parent = [IO.Path]::GetDirectoryName($target)
        if (-not (Test-Path -LiteralPath $parent)) {
            $null = New-Item -ItemType Directory -Path $parent -Force
        }
        [IO.File]::Copy($source, $target, $true)
    }
}

if ((Get-Hash $candidatePath) -ne $expectedCandidateHash) {
    throw 'CANDIDATE_MANIFEST_DRIFT'
}
if (-not (Test-Path -LiteralPath $rollbackRoot -PathType Container)) {
    throw 'ROLLBACK_STAGING_MISSING'
}
$rollbackReceipt = Get-Content -Raw -LiteralPath (Join-Path $rollbackRoot 'rollback-staging-receipt.json') -Encoding UTF8 |
    ConvertFrom-Json
if ([string]$rollbackReceipt.candidateManifestSha256 -ne $expectedCandidateHash) {
    throw 'ROLLBACK_STAGING_MANIFEST_DRIFT'
}
if (-not (Test-Path -LiteralPath $newArchive -PathType Container)) {
    throw 'NEW_ARCHIVE_MISSING'
}

$allowList = @(
    'C:\Users\steph\Projekte\M.I.D.A.S\tools\codex-usage',
    'C:\Users\steph\Projekte\M.I.D.A.S\docs\modules\KASRKIN Module Overview.md',
    'C:\Users\steph\Projekte\M.I.D.A.S\docs\Codex Usage Guard Evolution Notes.md',
    'C:\Users\steph\Projekte\H.E.S.T.I.A\tools\codex-usage',
    'C:\Users\steph\Projekte\M.I.D.A.S\docs\modules\A.R.G.U.S. Module Overview.md',
    'C:\Users\steph\Projekte\M.I.D.A.S\docs\Codex Model Benchmark V1 Campaign.md',
    'C:\Users\steph\Projekte\M.I.D.A.S\docs\benchmark\codex-model-benchmark-v1',
    'C:\Users\steph\Projekte\argus-operator-console.html',
    'C:\Users\steph\ARGUS-RUN-STAGES',
    'C:\Users\steph\ARGUS-RUN-EVIDENCE',
    'C:\Users\steph\Archives\ARGUS-PILOT\v1.2-v1.6'
) | ForEach-Object { [IO.Path]::GetFullPath($_).TrimEnd('\') }
$manifestPaths = @($candidate.retirementCandidates | ForEach-Object {
    [IO.Path]::GetFullPath([string]$_.path).TrimEnd('\')
})
if (
    @($manifestPaths).Count -ne @($allowList).Count -or
    [string]::Join("`n", @($manifestPaths | Sort-Object)) -ne
        [string]::Join("`n", @($allowList | Sort-Object))
) {
    throw 'CANDIDATE_ALLOWLIST_MISMATCH'
}

foreach ($entry in @($candidate.retirementCandidates)) {
    Assert-CandidateExact $entry
}

foreach ($activationPath in @(
    (Join-Path $midasRoot '.kasrkin\activation.json'),
    (Join-Path $hestiaRoot '.kasrkin\activation.json')
)) {
    $activation = Get-Content -Raw -LiteralPath $activationPath -Encoding UTF8 |
        ConvertFrom-Json
    if ([string]$activation.legacyRollback.status -ne 'RETIRED_W7') {
        throw "ACTIVATION_RETIREMENT_NOT_BOUND: $activationPath"
    }
    foreach ($artifact in @($activation.consultationArtifacts)) {
        $path = if ([IO.Path]::IsPathRooted([string]$artifact.path)) {
            [string]$artifact.path
        }
        else {
            Join-Path ([IO.Path]::GetDirectoryName([IO.Path]::GetDirectoryName($activationPath))) `
                ([string]$artifact.path).Replace('/', '\')
        }
        if (
            -not (Test-Path -LiteralPath $path -PathType Leaf) -or
            (Get-Hash $path) -ne [string]$artifact.sha256
        ) {
            throw "ACTIVATION_ARTIFACT_DRIFT: $path"
        }
    }
}

$deletionOrder = @(
    'midas-legacy-kasrkin-tree',
    'midas-kasrkin-overview',
    'midas-guard-evolution-notes',
    'hestia-legacy-kasrkin-tree',
    'argus-overview',
    'argus-campaign-document',
    'argus-benchmark-root',
    'argus-console',
    'argus-stage-root',
    'argus-evidence-root',
    'former-w4-archive-root'
)

try {
    foreach ($id in $deletionOrder) {
        $entry = @($candidate.retirementCandidates | Where-Object candidateId -eq $id)[0]
        $path = [IO.Path]::GetFullPath([string]$entry.path).TrimEnd('\')
        if ($path -notin $allowList) {
            throw "DELETE_OUTSIDE_ALLOWLIST: $path"
        }
        Assert-CandidateExact $entry
        if ([string]$entry.kind -eq 'DIRECTORY') {
            Remove-Item -LiteralPath $path -Recurse -Force
        }
        else {
            Remove-Item -LiteralPath $path -Force
        }
        if (Test-Path -LiteralPath $path) {
            throw "DELETE_FAILED: $path"
        }
        $deleted.Add($id)
    }

    $midasProof = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File `
        (Join-Path $midasRoot '.kasrkin\Test-MidasKasrkinActivation.ps1')
    if ($LASTEXITCODE -ne 0) { throw "MIDAS_ACTIVATION_EXIT_$LASTEXITCODE" }

    $hestiaProof = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File `
        (Join-Path $hestiaRoot '.kasrkin\Test-HestiaKasrkinActivation.ps1')
    if ($LASTEXITCODE -ne 0) { throw "HESTIA_ACTIVATION_EXIT_$LASTEXITCODE" }

    $sourceProof = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File `
        'C:\Users\steph\Projekte\codex-tools\apps\kasrkin\tools\kasrkin\Test-KasrkinSourceCandidate.ps1'
    if ($LASTEXITCODE -ne 0) { throw "KASRKIN_SOURCE_PROOF_EXIT_$LASTEXITCODE" }

    Push-Location 'C:\Users\steph\Projekte'
    try {
        $archiveProof = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File `
            (Join-Path $newArchive 'Test-ArgusPilotArchive.ps1') -ValidateExternalReferences
        if ($LASTEXITCODE -ne 0) { throw "NEW_ARCHIVE_PROOF_EXIT_$LASTEXITCODE" }
    }
    finally {
        Pop-Location
    }

    [pscustomobject][ordered]@{
        status = 'W7_RETIREMENT_APPLIED'
        deletedCandidates = @($deleted)
        formerW4ArchiveDeletedLast = ($deleted[$deleted.Count - 1] -eq 'former-w4-archive-root')
        midasProof = (($midasProof | Out-String).Trim())
        hestiaProof = (($hestiaProof | Out-String).Trim())
        sourceProof = (($sourceProof | Out-String).Trim())
        archiveProof = (($archiveProof | Out-String).Trim())
        rollbackStagingRetained = $true
    } | ConvertTo-Json -Depth 5 -Compress
}
catch {
    Restore-W7State
    throw
}
