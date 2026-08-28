param(
    [string]$InstalledScriptPath = (Join-Path $env:USERPROFILE 'Documents\Rainmeter\Skins\illustro\Tokens\GetCodexUsage.ps1'),
    [string]$CanonicalScriptPath = (Join-Path $PSScriptRoot 'GetCodexUsage.ps1'),
    [string]$StatePath = (Join-Path $env:USERPROFILE 'Documents\Rainmeter\Skins\illustro\Tokens\UsageState.json'),
    [int]$MaxAgeSeconds = 120,
    [string]$ExpectedSensorVersion = '3.1.0',
    [switch]$Refresh
)

$ErrorActionPreference = 'Stop'

function Assert-Condition {
    param(
        [Parameter(Mandatory = $true)][bool]$Condition,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Get-RequiredProperty {
    param(
        [Parameter(Mandatory = $true)]$Object,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Context
    )

    Assert-Condition ($null -ne $Object) "$Context is missing."
    $property = $Object.PSObject.Properties[$Name]
    Assert-Condition ($null -ne $property) "$Context.$Name is missing."
    return $property.Value
}

function Convert-RequiredFiniteNumber {
    param(
        $Value,
        [Parameter(Mandatory = $true)][string]$Name
    )

    $numericTypes = @(
        [System.TypeCode]::Byte,
        [System.TypeCode]::SByte,
        [System.TypeCode]::Int16,
        [System.TypeCode]::UInt16,
        [System.TypeCode]::Int32,
        [System.TypeCode]::UInt32,
        [System.TypeCode]::Int64,
        [System.TypeCode]::UInt64,
        [System.TypeCode]::Single,
        [System.TypeCode]::Double,
        [System.TypeCode]::Decimal
    )
    Assert-Condition ($null -ne $Value) "$Name is null."
    Assert-Condition ($numericTypes -contains [System.Type]::GetTypeCode($Value.GetType())) "$Name is not numeric."
    $number = [double]$Value
    Assert-Condition (-not [double]::IsNaN($number) -and -not [double]::IsInfinity($number)) "$Name is not finite."
    return $number
}

function Test-UsageBucket {
    param(
        [Parameter(Mandatory = $true)]$Bucket,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][int]$ExpectedWindowDurationMins
    )

    $available = Get-RequiredProperty $Bucket 'available' $Name
    Assert-Condition ($available -is [bool] -and $available) "$Name.available must be true."

    $window = Convert-RequiredFiniteNumber (Get-RequiredProperty $Bucket 'windowDurationMins' $Name) "$Name.windowDurationMins"
    Assert-Condition ($window -eq $ExpectedWindowDurationMins) "$Name.windowDurationMins must equal $ExpectedWindowDurationMins."

    $remaining = Convert-RequiredFiniteNumber (Get-RequiredProperty $Bucket 'remaining' $Name) "$Name.remaining"
    $used = Convert-RequiredFiniteNumber (Get-RequiredProperty $Bucket 'used' $Name) "$Name.used"
    Assert-Condition ($remaining -ge 0 -and $remaining -le 100) "$Name.remaining is outside 0..100."
    Assert-Condition ($used -ge 0 -and $used -le 100) "$Name.used is outside 0..100."
    Assert-Condition ([Math]::Abs(($remaining + $used) - 100) -le 0.01) "$Name.remaining and $Name.used do not sum to 100."

    $resetAtEpoch = Convert-RequiredFiniteNumber (Get-RequiredProperty $Bucket 'resetAtEpoch' $Name) "$Name.resetAtEpoch"
    Assert-Condition ($resetAtEpoch -gt 0 -and $resetAtEpoch -eq [Math]::Truncate($resetAtEpoch)) "$Name.resetAtEpoch must be a positive integer."

    return [pscustomobject]@{
        remaining = $remaining
        used = $used
        resetAtEpoch = [long]$resetAtEpoch
    }
}

try {
    Assert-Condition (Test-Path -LiteralPath $CanonicalScriptPath -PathType Leaf) 'Canonical sensor script is missing.'
    Assert-Condition (Test-Path -LiteralPath $InstalledScriptPath -PathType Leaf) 'Installed sensor script is missing.'
    Assert-Condition ($MaxAgeSeconds -gt 0) 'MaxAgeSeconds must be positive.'

    $canonicalHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $CanonicalScriptPath).Hash
    $installedHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $InstalledScriptPath).Hash
    Assert-Condition ($canonicalHash -eq $installedHash) 'Installed sensor does not match the canonical repository copy.'

    if ($Refresh) {
        $null = & $InstalledScriptPath -Action Refresh
        Assert-Condition $? 'Usage sensor refresh failed.'
    }

    Assert-Condition (Test-Path -LiteralPath $StatePath -PathType Leaf) 'Usage state is missing.'

    $state = Get-Content -Raw -LiteralPath $StatePath -Encoding UTF8 | ConvertFrom-Json
    $schemaVersion = Get-RequiredProperty $state 'schemaVersion' 'state'
    $sensorVersion = Get-RequiredProperty $state 'sensorVersion' 'state'
    $status = Get-RequiredProperty $state 'status' 'state'
    Assert-Condition ($schemaVersion -is [int] -and $schemaVersion -eq 3) 'state.schemaVersion must equal integer 3.'
    Assert-Condition ($sensorVersion -is [string] -and $sensorVersion -eq $ExpectedSensorVersion) "state.sensorVersion must equal $ExpectedSensorVersion."
    Assert-Condition ($status -is [string] -and $status -in @('OK', 'LOW', 'LIMIT')) 'state.status is not a successful measurement status.'

    $attemptRaw = Get-RequiredProperty $state 'lastAttemptAt' 'state'
    $successRaw = Get-RequiredProperty $state 'lastSuccessAt' 'state'
    $attempt = [DateTimeOffset]::MinValue
    $success = [DateTimeOffset]::MinValue
    Assert-Condition ([DateTimeOffset]::TryParse([string]$attemptRaw, [ref]$attempt)) 'state.lastAttemptAt is invalid.'
    Assert-Condition ([DateTimeOffset]::TryParse([string]$successRaw, [ref]$success)) 'state.lastSuccessAt is invalid.'
    Assert-Condition ($attempt -eq $success) 'Attempt and success timestamps do not identify the same measurement.'

    $ageSeconds = ([DateTimeOffset]::Now - $success).TotalSeconds
    Assert-Condition ($ageSeconds -ge 0) 'The successful measurement is in the future.'
    Assert-Condition ($ageSeconds -le $MaxAgeSeconds) "The successful measurement is older than $MaxAgeSeconds seconds."

    $fiveHour = Test-UsageBucket (Get-RequiredProperty $state 'fiveHour' 'state') 'fiveHour' 300
    $weekly = Test-UsageBucket (Get-RequiredProperty $state 'weekly' 'state') 'weekly' 10080

    [pscustomobject]@{
        valid = $true
        schemaVersion = 3
        sensorVersion = $sensorVersion
        status = $status
        measuredAt = $success.ToString('o')
        ageSeconds = [Math]::Round($ageSeconds, 1)
        fiveHourRemaining = $fiveHour.remaining
        fiveHourResetAtEpoch = $fiveHour.resetAtEpoch
        weeklyRemaining = $weekly.remaining
        weeklyResetAtEpoch = $weekly.resetAtEpoch
    } | ConvertTo-Json -Compress
}
catch {
    Write-Error ("INVALID: {0}" -f $_.Exception.Message)
    exit 1
}
