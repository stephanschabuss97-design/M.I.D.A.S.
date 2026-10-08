param(
    [string]$ProjectRoot=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    [string]$ExpectedInstallRoot
)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
$originalPath=$env:PATH
try {
    $bindingPath=Join-Path $ProjectRoot '.kasrkin\binding.json'
    $binding=Get-Content -Raw -Encoding UTF8 -LiteralPath $bindingPath|ConvertFrom-Json
    $activation=Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $ProjectRoot '.kasrkin\activation.json')|ConvertFrom-Json
    if($activation.activationVersion -cnotin @('codex-tools-kasrkin-activation/2','midas-kasrkin-activation/2','hestia-kasrkin-activation/2','codex-tools-kasrkin-activation/3','midas-kasrkin-activation/3','hestia-kasrkin-activation/3') -or $activation.paidCredits.ownerAuthorization -cne 'NOT_GRANTED'){throw 'KASRKIN_COMMAND_K0_CONTRACT'}
    $selection=Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $ProjectRoot '.kasrkin\command.json')|ConvertFrom-Json
    if($binding.releaseId -cnotmatch '^kasrkin-[a-f0-9]{16}$' -or $binding.receiptSha256 -cnotmatch '^[a-f0-9]{64}$'){throw 'KASRKIN_COMMAND_K0_BINDING_FORMAT'}
    if([string]::IsNullOrWhiteSpace($ExpectedInstallRoot)){
        if(-not [IO.Path]::IsPathRooted($selection.bootstrap.path)){throw 'KASRKIN_COMMAND_K0_BOOTSTRAP_SELECTION_DRIFT'}
        $ExpectedInstallRoot=[IO.Path]::GetFullPath((Join-Path (Split-Path -Parent $selection.bootstrap.path) '..\..\..\..'))
    }
    $receiptPath=Join-Path $ExpectedInstallRoot ('receipts\'+$binding.releaseId+'.json')
    if((Get-FileHash -Algorithm SHA256 -LiteralPath $receiptPath).Hash.ToLowerInvariant() -cne $binding.receiptSha256){throw 'KASRKIN_COMMAND_K0_RECEIPT_DRIFT'}
    $receipt=Get-Content -Raw -Encoding UTF8 -LiteralPath $receiptPath|ConvertFrom-Json
    $expectedBootstrap=Join-Path $ExpectedInstallRoot ('releases\'+$binding.releaseId+'\tools\kasrkin\Set-KasrkinCommandContext.ps1')
    $record=@($receipt.installedFiles|Where-Object path -ceq 'tools/kasrkin/Set-KasrkinCommandContext.ps1')
    if($record.Count -ne 1 -or [IO.Path]::GetFullPath($selection.bootstrap.path) -ne [IO.Path]::GetFullPath($expectedBootstrap) -or $selection.bootstrap.sha256 -cne $record[0].sha256){throw 'KASRKIN_COMMAND_K0_BOOTSTRAP_SELECTION_DRIFT'}
    # The copied proof is itself one of the activation-bound artifacts.
    $proofRole=if($activation.consumer -ceq 'codex-tools'){'CODEX_TOOLS_ACTIVATION_PROOF'}else{[string]$activation.consumer+'_ACTIVATION_PROOF'}
    $self=@($activation.consultationArtifacts|Where-Object role -ceq $proofRole)
    if($self.Count -ne 1 -or [IO.Path]::GetFullPath((Join-Path $ProjectRoot $self[0].path)) -ne [IO.Path]::GetFullPath($PSCommandPath) -or
       (Get-FileHash -Algorithm SHA256 -LiteralPath $PSCommandPath).Hash.ToLowerInvariant() -cne $self[0].sha256){throw 'KASRKIN_COMMAND_K0_SELF_BINDING'}
    if(-not [IO.Path]::IsPathRooted($selection.bootstrap.path) -or
       (Get-FileHash -Algorithm SHA256 -LiteralPath $selection.bootstrap.path).Hash.ToLowerInvariant() -cne $selection.bootstrap.sha256){throw 'KASRKIN_COMMAND_K0_BOOTSTRAP_DRIFT'}
    Push-Location -LiteralPath $ProjectRoot
    try {
        $contextLines=@(& $expectedBootstrap -ProjectRoot $ProjectRoot)
        $context=($contextLines -join "`n")|ConvertFrom-Json
        $versionLines=@(& kasrkin version)
        if($LASTEXITCODE -ne 0){throw 'KASRKIN_COMMAND_K0_VERSION_FAILED'}
        $version=($versionLines -join "`n")|ConvertFrom-Json
    } finally {Pop-Location}
    if(-not $context.ok -or $version.releaseId -cne $binding.releaseId -or $version.releaseFingerprint -cne $binding.releaseFingerprint){throw 'KASRKIN_COMMAND_K0_VERSION_DRIFT'}
    [pscustomobject]@{suite=($activation.consumer+'-KASRKIN-COMMAND-K0');passed=$true;releaseId=$version.releaseId;bindingSha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $bindingPath).Hash.ToLowerInvariant();consultationArtifacts=@($activation.consultationArtifacts).Count;ownerAuthorization='NOT_GRANTED';processContextRestored=$true}|ConvertTo-Json -Compress
}
finally {$env:PATH=$originalPath}
