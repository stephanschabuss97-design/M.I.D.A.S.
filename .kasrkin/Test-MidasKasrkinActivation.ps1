$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$activationPath = Join-Path $PSScriptRoot 'activation.json'

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

function Resolve-ActivationPath {
    param([string]$Path)
    if ([IO.Path]::IsPathRooted($Path)) { return $Path }
    return Join-Path $projectRoot $Path.Replace('/', '\')
}

$activation = Get-Content -Raw -LiteralPath $activationPath -Encoding UTF8 |
    ConvertFrom-Json
Assert-True ($activation.activationVersion -eq 'midas-kasrkin-activation/1') 'ACTIVATION_VERSION'
Assert-True ($activation.consumer -eq 'MIDAS') 'ACTIVATION_CONSUMER'
Assert-True ($activation.authority.decisionSemanticsOwner -eq 'KASRKIN') 'ACTIVATION_TOOL_OWNER'
Assert-True ($activation.authority.projectExecutionOwner -eq 'MIDAS') 'ACTIVATION_PROJECT_OWNER'

$bindingPath = Resolve-ActivationPath ([string]$activation.binding.path)
Assert-True (Test-Path -LiteralPath $bindingPath -PathType Leaf) 'ACTIVATION_BINDING_MISSING'
$bindingHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $bindingPath).Hash.ToLowerInvariant()
Assert-True ($bindingHash -eq [string]$activation.binding.sha256) 'ACTIVATION_BINDING_DRIFT'
$binding = Get-Content -Raw -LiteralPath $bindingPath -Encoding UTF8 | ConvertFrom-Json
foreach ($name in @('releaseId', 'releaseFingerprint', 'payloadDigest', 'receiptSha256')) {
    Assert-True ([string]$binding.$name -eq [string]$activation.binding.$name) "ACTIVATION_BINDING_VALUE_DRIFT:$name"
}

$roles = @($activation.consultationArtifacts.role)
Assert-True (@($roles | Sort-Object -Unique).Count -eq $roles.Count) 'ACTIVATION_DUPLICATE_ROLE'
foreach ($artifact in @($activation.consultationArtifacts)) {
    $path = Resolve-ActivationPath ([string]$artifact.path)
    Assert-True (Test-Path -LiteralPath $path -PathType Leaf) "ACTIVATION_ARTIFACT_MISSING:$($artifact.role)"
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash.ToLowerInvariant()
    Assert-True ($hash -eq [string]$artifact.sha256) "ACTIVATION_ARTIFACT_DRIFT:$($artifact.role)"
}

Assert-True (-not [bool]$activation.legacyRollback.active) 'ACTIVATION_LEGACY_STILL_ACTIVE'
Assert-True ([string]$activation.legacyRollback.status -eq 'RETIRED_W7') 'ACTIVATION_LEGACY_NOT_RETIRED'
$legacyRoot = Resolve-ActivationPath ([string]$activation.legacyRollback.sourceRoot)
Assert-True (-not (Test-Path -LiteralPath $legacyRoot)) 'ACTIVATION_LEGACY_SOURCE_PRESENT'
foreach ($successor in @($activation.legacyRollback.successors)) {
    $successorPath = Resolve-ActivationPath ([string]$successor.path)
    Assert-True (Test-Path -LiteralPath $successorPath) "ACTIVATION_SUCCESSOR_MISSING:$($successor.role)"
}

Assert-True (-not [bool]$activation.constraints.policyChanged) 'ACTIVATION_POLICY_CHANGED'
Assert-True (-not [bool]$activation.constraints.runtimeStateMoved) 'ACTIVATION_RUNTIME_MOVED'
Assert-True (-not [bool]$activation.constraints.additionalUsageWriter) 'ACTIVATION_SECOND_WRITER'
Assert-True (-not [bool]$activation.constraints.hestiaChanged) 'ACTIVATION_HESTIA_CHANGED'

$foreignCwd = Join-Path $projectRoot 'docs'
Push-Location $foreignCwd
try {
    $versionOutput = & kasrkin version
    Assert-True ($LASTEXITCODE -eq 0) 'ACTIVATION_VERSION_COMMAND_FAILED'
    $version = $versionOutput | ConvertFrom-Json
    Assert-True ($version.releaseId -eq $binding.releaseId) 'ACTIVATION_RELEASE_ID_DRIFT'
    Assert-True ($version.releaseFingerprint -eq $binding.releaseFingerprint) 'ACTIVATION_RELEASE_FINGERPRINT_DRIFT'

    $validationOutput = & kasrkin validate
    Assert-True ($LASTEXITCODE -eq 0) 'ACTIVATION_VALIDATOR_FAILED'
    $validation = $validationOutput | ConvertFrom-Json
    Assert-True ([bool]$validation.valid) 'ACTIVATION_VALIDATOR_INVALID'
}
finally {
    Pop-Location
}

[pscustomobject][ordered]@{
    suite = 'MIDAS-KASRKIN-W6M-ACTIVATION'
    passed = $true
    releaseId = $version.releaseId
    releaseFingerprint = $version.releaseFingerprint
    consultationArtifacts = @($activation.consultationArtifacts).Count
    foreignCwd = $foreignCwd
    validatorStatus = $validation.status
    legacyRollbackActive = [bool]$activation.legacyRollback.active
    legacyRollbackStatus = [string]$activation.legacyRollback.status
} | ConvertTo-Json -Compress
