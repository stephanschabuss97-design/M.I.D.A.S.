[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$parent = [IO.Path]::GetFullPath(
    'C:\Users\steph\Projekte\Backup\Old\ARGUS-PILOT'
).TrimEnd('\')
$root = [IO.Path]::GetFullPath(
    'C:\Users\steph\Projekte\Backup\Old\ARGUS-PILOT\.w7-rollback-w7-retirement-candidate-20260920'
).TrimEnd('\')
$expectedRoot = $parent + '\.w7-rollback-w7-retirement-candidate-20260920'
$expectedManifestHash = '6770c2a59a9466f8e6a32e946df935e7e387998dfd541329eb9e543369df559b'

if (-not $root.StartsWith(($parent + '\'), [StringComparison]::OrdinalIgnoreCase)) {
    throw "ROLLBACK_ROOT_OUTSIDE_BOUNDARY: $root"
}
if ($root -ne $expectedRoot) {
    throw "ROLLBACK_ROOT_UNEXPECTED: $root"
}
$receiptPath = Join-Path $root 'rollback-staging-receipt.json'
if (-not (Test-Path -LiteralPath $receiptPath -PathType Leaf)) {
    throw 'ROLLBACK_RECEIPT_MISSING'
}
$receipt = Get-Content -Raw -LiteralPath $receiptPath -Encoding UTF8 |
    ConvertFrom-Json
if ([string]$receipt.candidateManifestSha256 -ne $expectedManifestHash) {
    throw 'ROLLBACK_RECEIPT_DRIFT'
}
if (-not [bool]$receipt.exactCopiesValidated) {
    throw 'ROLLBACK_STAGING_NOT_VALIDATED'
}

Remove-Item -LiteralPath $root -Recurse -Force
if (Test-Path -LiteralPath $root) {
    throw 'ROLLBACK_STAGING_DELETE_FAILED'
}

[pscustomobject][ordered]@{
    removed = $true
    root = $root
    candidateManifestSha256 = [string]$receipt.candidateManifestSha256
    exactCopiesValidated = [bool]$receipt.exactCopiesValidated
} | ConvertTo-Json -Compress
