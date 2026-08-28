param(
    [ValidateSet('Refresh', 'SetMarker', 'ClearMarker')]
    [string]$Action = 'Refresh',
    [switch]$SimulateFailure
)

$ErrorActionPreference = 'Stop'

$script:sensorVersion = '3.1.0'
$script:mutexName = 'Local\MIDAS_CodexUsageSensor_v3'
$script:mutexWaitMilliseconds = 70000
$script:process = $null
$script:oldInputEncoding = $null
$script:statePath = Join-Path $PSScriptRoot 'UsageState.json'
$script:invariant = [System.Globalization.CultureInfo]::InvariantCulture

function Get-PropertyValue {
    param(
        $Object,
        [Parameter(Mandatory = $true)][string]$Name,
        $Default = $null
    )

    if ($null -ne $Object) {
        $property = $Object.PSObject.Properties[$Name]
        if ($property) {
            return $property.Value
        }
    }
    return $Default
}

function Set-PropertyValue {
    param(
        [Parameter(Mandatory = $true)]$Object,
        [Parameter(Mandatory = $true)][string]$Name,
        $Value
    )

    $property = $Object.PSObject.Properties[$Name]
    if ($property) {
        $property.Value = $Value
    }
    else {
        $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value
    }
}

function New-UsageBucket {
    return [pscustomobject]@{
        available = $false
        windowDurationMins = $null
        remaining = $null
        used = $null
        resetAtEpoch = $null
    }
}

function New-UsageState {
    return [pscustomobject]@{
        schemaVersion = 3
        sensorVersion = $script:sensorVersion
        lastSuccessAt = $null
        lastAttemptAt = $null
        fiveHour = New-UsageBucket
        weekly = New-UsageBucket
        resetCredits = '--'
        resetCreditExpiresAtEpoch = $null
        plan = '--'
        status = 'WAIT'
        weeklyLastChange = '--'
        weeklyMarker = $null
        creditDetail = 'No reset-credit details available'
        detail = 'Waiting for the first successful check'
    }
}

function Convert-ToUsageBucket {
    param($Source)

    $bucket = New-UsageBucket
    if (-not $Source) {
        return $bucket
    }

    foreach ($name in @('available', 'windowDurationMins', 'remaining', 'used', 'resetAtEpoch')) {
        $property = $Source.PSObject.Properties[$name]
        if ($property) {
            Set-PropertyValue -Object $bucket -Name $name -Value $property.Value
        }
    }
    return $bucket
}

function Convert-ToCurrentState {
    param($Source)

    $state = New-UsageState
    if (-not $Source) {
        return $state
    }

    foreach ($name in @(
        'lastSuccessAt', 'lastAttemptAt', 'resetCredits',
        'resetCreditExpiresAtEpoch', 'plan', 'status',
        'weeklyLastChange', 'weeklyMarker', 'creditDetail', 'detail'
    )) {
        $property = $Source.PSObject.Properties[$name]
        if ($property) {
            Set-PropertyValue -Object $state -Name $name -Value $property.Value
        }
    }

    $schemaVersion = [int](Get-PropertyValue -Object $Source -Name 'schemaVersion' -Default 0)
    if ($schemaVersion -ge 3) {
        $state.fiveHour = Convert-ToUsageBucket (Get-PropertyValue -Object $Source -Name 'fiveHour')
        $state.weekly = Convert-ToUsageBucket (Get-PropertyValue -Object $Source -Name 'weekly')
        return $state
    }

    # Schema v2 stored only the weekly window in flat fields.
    if (-not [string]::IsNullOrWhiteSpace([string](Get-PropertyValue -Object $Source -Name 'lastSuccessAt'))) {
        $state.weekly = [pscustomobject]@{
            available = $true
            windowDurationMins = 10080
            remaining = Get-PropertyValue -Object $Source -Name 'remaining'
            used = Get-PropertyValue -Object $Source -Name 'used'
            resetAtEpoch = Get-PropertyValue -Object $Source -Name 'resetAtEpoch'
        }
    }
    Set-PropertyValue -Object $state -Name 'weeklyLastChange' -Value (Get-PropertyValue -Object $Source -Name 'lastChange' -Default '--')
    Set-PropertyValue -Object $state -Name 'weeklyMarker' -Value (Get-PropertyValue -Object $Source -Name 'marker')
    return $state
}

function Read-UsageState {
    if (-not (Test-Path -LiteralPath $script:statePath)) {
        return New-UsageState
    }

    try {
        $source = Get-Content -Raw -LiteralPath $script:statePath -Encoding UTF8 | ConvertFrom-Json
        return Convert-ToCurrentState -Source $source
    }
    catch {
        return New-UsageState
    }
}

function Save-UsageState {
    param([Parameter(Mandatory = $true)]$State)

    $temporaryPath = '{0}.{1}.tmp' -f $script:statePath, $PID
    try {
        $json = $State | ConvertTo-Json -Depth 12
        [System.IO.File]::WriteAllText($temporaryPath, $json, (New-Object System.Text.UTF8Encoding($false)))
        if (Test-Path -LiteralPath $script:statePath) {
            try {
                [System.IO.File]::Replace($temporaryPath, $script:statePath, $null)
            }
            catch {
                Move-Item -LiteralPath $temporaryPath -Destination $script:statePath -Force
            }
        }
        else {
            Move-Item -LiteralPath $temporaryPath -Destination $script:statePath
        }
    }
    finally {
        if (Test-Path -LiteralPath $temporaryPath) {
            Remove-Item -LiteralPath $temporaryPath -Force -ErrorAction SilentlyContinue
        }
    }
}

function Sanitize-Field {
    param($Value)

    $text = [regex]::Replace([string]$Value, '[\r\n|]+', ' ').Trim()
    if ($text.Length -gt 400) {
        $text = $text.Substring(0, 400)
    }
    return $text
}

function Format-Number {
    param($Value)

    if ($null -eq $Value) {
        return '--'
    }
    return ([double]$Value).ToString('0.#', $script:invariant)
}

function Format-SignedDelta {
    param([double]$Value)

    if ([Math]::Abs($Value) -lt 0.05) {
        return '0 pp'
    }
    if ($Value -gt 0) {
        return ('+{0} pp' -f (Format-Number $Value))
    }
    return ('{0} pp' -f (Format-Number $Value))
}

function Format-Countdown {
    param([Parameter(Mandatory = $true)][TimeSpan]$Remaining)

    if ($Remaining.TotalSeconds -le 0) {
        return 'now'
    }
    if ($Remaining.Days -gt 0) {
        return ('{0}d {1:00}h' -f $Remaining.Days, $Remaining.Hours)
    }
    if ($Remaining.Hours -gt 0) {
        return ('{0}h {1:00}m' -f $Remaining.Hours, $Remaining.Minutes)
    }
    return ('{0}m' -f [Math]::Max(1, $Remaining.Minutes))
}

function Find-CodexExecutable {
    $command = Get-Command codex.exe -ErrorAction SilentlyContinue
    if ($command -and $command.Source -and (Test-Path -LiteralPath $command.Source)) {
        return $command.Source
    }

    $patterns = @(
        (Join-Path $env:LOCALAPPDATA 'OpenAI\Codex\bin\*\codex.exe'),
        (Join-Path $env:USERPROFILE '.vscode\extensions\openai.chatgpt-*\bin\windows-x86_64\codex.exe'),
        (Join-Path $env:USERPROFILE '.vscode-insiders\extensions\openai.chatgpt-*\bin\windows-x86_64\codex.exe'),
        (Join-Path $env:USERPROFILE '.cursor\extensions\openai.chatgpt-*\bin\windows-x86_64\codex.exe')
    )

    $candidate = Get-ChildItem -Path $patterns -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTimeUtc -Descending |
        Select-Object -First 1
    if ($candidate) {
        return $candidate.FullName
    }
    throw 'codex.exe was not found. Install or sign in to the Codex CLI / IDE extension.'
}

function Send-AppServerMessage {
    param([Parameter(Mandatory = $true)][hashtable]$Message)

    $json = $Message | ConvertTo-Json -Compress -Depth 12
    $script:process.StandardInput.WriteLine($json)
    $script:process.StandardInput.Flush()
}

function Read-AppServerResponse {
    param(
        [Parameter(Mandatory = $true)][int]$Id,
        [Parameter(Mandatory = $true)][int]$TimeoutMilliseconds
    )

    $deadline = [DateTime]::UtcNow.AddMilliseconds($TimeoutMilliseconds)
    while ([DateTime]::UtcNow -lt $deadline) {
        $remainingMilliseconds = [int][Math]::Max(1, ($deadline - [DateTime]::UtcNow).TotalMilliseconds)
        $readTask = $script:process.StandardOutput.ReadLineAsync()
        if (-not $readTask.Wait($remainingMilliseconds)) {
            throw "Codex app-server timed out waiting for response $Id."
        }

        $line = $readTask.Result
        if ($null -eq $line) {
            throw 'Codex app-server closed its output unexpectedly.'
        }

        try {
            $message = $line | ConvertFrom-Json -ErrorAction Stop
        }
        catch {
            continue
        }

        if ($message.PSObject.Properties['id'] -and [int]$message.id -eq $Id) {
            if ($message.error) {
                throw [string]$message.error.message
            }
            return $message.result
        }
    }
    throw "Codex app-server timed out waiting for response $Id."
}

function Get-CodexBucket {
    param([Parameter(Mandatory = $true)]$Result)

    if ($Result.rateLimitsByLimitId) {
        $codex = $Result.rateLimitsByLimitId.PSObject.Properties['codex']
        if ($codex) {
            return $codex.Value
        }
    }
    if ($Result.rateLimits) {
        return $Result.rateLimits
    }
    throw 'The Codex service returned no rate-limit bucket.'
}

function Get-WindowByDuration {
    param(
        [Parameter(Mandatory = $true)]$Bucket,
        [Parameter(Mandatory = $true)][int]$WindowDurationMins
    )

    foreach ($name in @('primary', 'secondary')) {
        $window = Get-PropertyValue -Object $Bucket -Name $name
        if ($window -and [int](Get-PropertyValue -Object $window -Name 'windowDurationMins' -Default 0) -eq $WindowDurationMins) {
            return $window
        }
    }
    return $null
}

function Convert-WindowToBucket {
    param(
        $Window,
        [Parameter(Mandatory = $true)][int]$ExpectedDurationMins
    )

    if (-not $Window) {
        return New-UsageBucket
    }

    $used = [Math]::Max(0, [Math]::Min(100, [double]$Window.usedPercent))
    return [pscustomobject]@{
        available = $true
        windowDurationMins = $ExpectedDurationMins
        remaining = [Math]::Max(0, [Math]::Min(100, 100 - $used))
        used = $used
        resetAtEpoch = [long]$Window.resetsAt
    }
}

function Get-CreditSummary {
    param(
        $ResetCredits,
        [DateTimeOffset]$Now = [DateTimeOffset]::Now
    )

    if (-not $ResetCredits) {
        return [pscustomobject]@{
            Count = '--'
            ExpiresAtEpoch = $null
            Detail = 'Reset-credit data not provided'
        }
    }

    $availableCount = Get-PropertyValue -Object $ResetCredits -Name 'availableCount' -Default '--'
    if ($availableCount -ne '--') {
        $availableCount = [string][int]$availableCount
    }
    if ($availableCount -eq '0') {
        return [pscustomobject]@{
            Count = '0'
            ExpiresAtEpoch = $null
            Detail = 'No reset credits available'
        }
    }

    $eligible = @()
    $credits = @(Get-PropertyValue -Object $ResetCredits -Name 'credits' -Default @())
    foreach ($credit in $credits) {
        if (-not $credit) {
            continue
        }
        $status = [string](Get-PropertyValue -Object $credit -Name 'status' -Default '')
        $expiresAt = Get-PropertyValue -Object $credit -Name 'expiresAt'
        if ($status -eq 'available' -and $null -ne $expiresAt -and [long]$expiresAt -gt $Now.ToUnixTimeSeconds()) {
            $eligible += $credit
        }
    }

    $earliest = $eligible |
        Sort-Object { [long](Get-PropertyValue -Object $_ -Name 'expiresAt') } |
        Select-Object -First 1
    if (-not $earliest) {
        return [pscustomobject]@{
            Count = $availableCount
            ExpiresAtEpoch = $null
            Detail = "$availableCount reset credit(s) available; expiry not supplied"
        }
    }

    $expiresAtEpoch = [long](Get-PropertyValue -Object $earliest -Name 'expiresAt')
    $expiresAt = [DateTimeOffset]::FromUnixTimeSeconds($expiresAtEpoch).ToLocalTime()
    $title = [string](Get-PropertyValue -Object $earliest -Name 'title' -Default 'Rate-limit reset')
    $status = [string](Get-PropertyValue -Object $earliest -Name 'status' -Default 'available')
    $description = [string](Get-PropertyValue -Object $earliest -Name 'description' -Default '')
    $detail = '{0} reset credit(s); {1} ({2}), expires {3}' -f $availableCount, $title, $status, $expiresAt.ToString('dd.MM.yyyy HH:mm')
    if (-not [string]::IsNullOrWhiteSpace($description)) {
        $detail = '{0} - {1}' -f $detail, $description
    }

    return [pscustomobject]@{
        Count = $availableCount
        ExpiresAtEpoch = $expiresAtEpoch
        Detail = $detail
    }
}

function Get-UsageStatus {
    param(
        [Parameter(Mandatory = $true)]$FiveHour,
        [Parameter(Mandatory = $true)]$Weekly,
        $RateLimitReachedType
    )

    $available = @($FiveHour, $Weekly) | Where-Object { [bool]$_.available }
    if ($available.Count -eq 0) {
        throw 'Neither the expected 300-minute nor 10080-minute window was returned.'
    }
    if ($RateLimitReachedType -or ($available | Where-Object { [double]$_.remaining -le 0 })) {
        return 'LIMIT'
    }
    if ($available | Where-Object { [double]$_.remaining -le 10 }) {
        return 'LOW'
    }
    if (-not [bool]$FiveHour.available -or -not [bool]$Weekly.available) {
        return 'PARTIAL'
    }
    return 'OK'
}

function Update-StateFromResult {
    param(
        [Parameter(Mandatory = $true)]$State,
        [Parameter(Mandatory = $true)]$Result,
        [DateTimeOffset]$Now = [DateTimeOffset]::Now
    )

    $bucket = Get-CodexBucket -Result $Result
    $fiveHour = Convert-WindowToBucket -Window (Get-WindowByDuration -Bucket $bucket -WindowDurationMins 300) -ExpectedDurationMins 300
    $weekly = Convert-WindowToBucket -Window (Get-WindowByDuration -Bucket $bucket -WindowDurationMins 10080) -ExpectedDurationMins 10080
    $status = Get-UsageStatus -FiveHour $fiveHour -Weekly $weekly -RateLimitReachedType (Get-PropertyValue -Object $bucket -Name 'rateLimitReachedType')

    $oldWeekly = Convert-ToUsageBucket (Get-PropertyValue -Object $State -Name 'weekly')
    $weeklyLastChange = '--'
    $weeklyReset = $false
    if ([bool]$oldWeekly.available -and [bool]$weekly.available) {
        $oldReset = [long](Get-PropertyValue -Object $oldWeekly -Name 'resetAtEpoch' -Default 0)
        $newReset = [long](Get-PropertyValue -Object $weekly -Name 'resetAtEpoch' -Default 0)
        $weeklyReset = $oldReset -gt 0 -and $newReset -gt ($oldReset + 60)
        if ($weeklyReset) {
            $weeklyLastChange = 'RESET'
        }
        else {
            $weeklyLastChange = Format-SignedDelta ([double]$weekly.remaining - [double]$oldWeekly.remaining)
        }
    }

    $weeklyMarker = Get-PropertyValue -Object $State -Name 'weeklyMarker'
    if ($weeklyMarker) {
        $markerReset = [long](Get-PropertyValue -Object $weeklyMarker -Name 'resetAtEpoch' -Default -1)
        if (-not [bool]$weekly.available -or $markerReset -ne [long]$weekly.resetAtEpoch) {
            $weeklyMarker = $null
        }
    }

    $creditSummary = Get-CreditSummary -ResetCredits $Result.rateLimitResetCredits -Now $Now
    $plan = [string](Get-PropertyValue -Object $bucket -Name 'planType' -Default '')
    if ([string]::IsNullOrWhiteSpace($plan) -and $Result.rateLimits) {
        $plan = [string](Get-PropertyValue -Object $Result.rateLimits -Name 'planType' -Default '')
    }
    if ([string]::IsNullOrWhiteSpace($plan)) {
        $plan = '--'
    }

    $missing = @()
    if (-not [bool]$fiveHour.available) { $missing += '5h (300m)' }
    if (-not [bool]$weekly.available) { $missing += 'Weekly (10080m)' }
    $detail = 'Live via local Codex login'
    if ($missing.Count -gt 0) {
        $detail = '{0}; unavailable: {1}' -f $detail, ($missing -join ', ')
    }
    elseif ($weeklyReset) {
        $detail = '{0}; weekly reset detected' -f $detail
    }

    Set-PropertyValue -Object $State -Name 'schemaVersion' -Value 3
    Set-PropertyValue -Object $State -Name 'lastSuccessAt' -Value $Now.ToString('o')
    Set-PropertyValue -Object $State -Name 'fiveHour' -Value $fiveHour
    Set-PropertyValue -Object $State -Name 'weekly' -Value $weekly
    Set-PropertyValue -Object $State -Name 'resetCredits' -Value $creditSummary.Count
    Set-PropertyValue -Object $State -Name 'resetCreditExpiresAtEpoch' -Value $creditSummary.ExpiresAtEpoch
    Set-PropertyValue -Object $State -Name 'plan' -Value $plan
    Set-PropertyValue -Object $State -Name 'status' -Value $status
    Set-PropertyValue -Object $State -Name 'weeklyLastChange' -Value $weeklyLastChange
    Set-PropertyValue -Object $State -Name 'weeklyMarker' -Value $weeklyMarker
    Set-PropertyValue -Object $State -Name 'creditDetail' -Value $creditSummary.Detail
    Set-PropertyValue -Object $State -Name 'detail' -Value $detail
    return $State
}

function Get-BucketPresentation {
    param(
        [Parameter(Mandatory = $true)]$Bucket,
        [DateTimeOffset]$Now = [DateTimeOffset]::Now
    )

    if (-not [bool](Get-PropertyValue -Object $Bucket -Name 'available' -Default $false)) {
        return [pscustomobject]@{ Remaining = '--'; Used = '--'; ResetIn = '--'; ResetAt = '--' }
    }

    $resetAtEpoch = [long](Get-PropertyValue -Object $Bucket -Name 'resetAtEpoch' -Default 0)
    $resetAt = [DateTimeOffset]::FromUnixTimeSeconds($resetAtEpoch).ToLocalTime()
    return [pscustomobject]@{
        Remaining = Format-Number (Get-PropertyValue -Object $Bucket -Name 'remaining')
        Used = Format-Number (Get-PropertyValue -Object $Bucket -Name 'used')
        ResetIn = Format-Countdown ($resetAt - $Now)
        ResetAt = $resetAt.ToString('dd.MM.yyyy HH:mm')
    }
}

function Format-UsageOutput {
    param(
        [Parameter(Mandatory = $true)]$State,
        [DateTimeOffset]$Now = [DateTimeOffset]::Now
    )

    $five = Get-BucketPresentation -Bucket (Convert-ToUsageBucket $State.fiveHour) -Now $Now
    $week = Get-BucketPresentation -Bucket (Convert-ToUsageBucket $State.weekly) -Now $Now
    $checked = '--'
    if (-not [string]::IsNullOrWhiteSpace([string]$State.lastSuccessAt)) {
        $checked = [DateTimeOffset]::Parse([string]$State.lastSuccessAt).ToLocalTime().ToString('HH:mm')
    }

    $creditExpiryIn = '--'
    $creditExpiryAt = '--'
    $expiryEpoch = Get-PropertyValue -Object $State -Name 'resetCreditExpiresAtEpoch'
    if ($null -ne $expiryEpoch -and [long]$expiryEpoch -gt 0) {
        $expiry = [DateTimeOffset]::FromUnixTimeSeconds([long]$expiryEpoch).ToLocalTime()
        $creditExpiryIn = Format-Countdown ($expiry - $Now)
        $creditExpiryAt = $expiry.ToString('dd.MM.yyyy HH:mm')
    }
    $creditCount = [string](Get-PropertyValue -Object $State -Name 'resetCredits' -Default '--')
    $creditDisplay = $creditCount
    if ($creditCount -notin @('--', '0') -and $creditExpiryIn -ne '--') {
        $creditDisplay = '{0} ({1})' -f $creditCount, $creditExpiryIn
    }

    $markerChange = '--'
    $markerAt = '--'
    $marker = Get-PropertyValue -Object $State -Name 'weeklyMarker'
    if ($marker -and [bool]$State.weekly.available -and [long]$marker.resetAtEpoch -eq [long]$State.weekly.resetAtEpoch) {
        $markerChange = Format-SignedDelta ([double]$State.weekly.remaining - [double]$marker.remaining)
        if ($marker.setAt) {
            $markerAt = [DateTimeOffset]::Parse([string]$marker.setAt).ToLocalTime().ToString('dd.MM HH:mm')
        }
    }

    # Stable 20-field presentation contract consumed by Tokens.ini.
    $fields = @(
        $State.status,              # 1
        $five.Remaining,            # 2
        $five.Used,                 # 3
        $five.ResetIn,              # 4
        $five.ResetAt,              # 5
        $week.Remaining,            # 6
        $week.Used,                 # 7
        $week.ResetIn,              # 8
        $week.ResetAt,              # 9
        $creditDisplay,             # 10
        $creditCount,               # 11
        $creditExpiryIn,            # 12
        $creditExpiryAt,            # 13
        $checked,                    # 14
        $State.plan,                 # 15
        $State.weeklyLastChange,     # 16
        $markerChange,               # 17
        $markerAt,                   # 18
        $State.creditDetail,         # 19
        $State.detail                # 20
    )
    return (($fields | ForEach-Object { Sanitize-Field $_ }) -join '|')
}

function Invoke-CodexRateLimitRead {
    $codexPath = Find-CodexExecutable
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = $codexPath
    $startInfo.Arguments = 'app-server --listen stdio://'
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardInput = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true

    # Windows PowerShell 5.1 otherwise writes an UTF-8 BOM to redirected stdin.
    $script:oldInputEncoding = [Console]::InputEncoding
    [Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
    $script:process = New-Object System.Diagnostics.Process
    $script:process.StartInfo = $startInfo
    if (-not $script:process.Start()) {
        throw 'Could not start codex app-server.'
    }

    [Console]::InputEncoding = $script:oldInputEncoding
    $script:oldInputEncoding = $null
    $stderrTask = $script:process.StandardError.ReadToEndAsync()

    Send-AppServerMessage @{
        method = 'initialize'
        id = 1
        params = @{
            clientInfo = @{
                name = 'rainmeter_codex_usage'
                title = 'Rainmeter Codex Usage'
                version = $script:sensorVersion
            }
        }
    }
    $null = Read-AppServerResponse -Id 1 -TimeoutMilliseconds 10000
    Send-AppServerMessage @{ method = 'initialized'; params = @{} }
    Send-AppServerMessage @{ method = 'account/rateLimits/read'; id = 2 }
    return Read-AppServerResponse -Id 2 -TimeoutMilliseconds 20000
}

function Stop-AppServer {
    if ($script:oldInputEncoding) {
        try { [Console]::InputEncoding = $script:oldInputEncoding } catch {}
        $script:oldInputEncoding = $null
    }
    if ($script:process) {
        try { $script:process.StandardInput.Close() } catch {}
        try {
            if (-not $script:process.WaitForExit(2500)) {
                $script:process.Kill()
                $script:process.WaitForExit()
            }
        }
        catch {}
        $script:process.Dispose()
        $script:process = $null
    }
}

function Invoke-Main {
    $state = Read-UsageState

    try {
        if ($Action -eq 'SetMarker') {
            if (-not [bool]$state.weekly.available) {
                Set-PropertyValue -Object $state -Name 'detail' -Value 'Roadmap marker not set: weekly data is unavailable'
            }
            else {
                Set-PropertyValue -Object $state -Name 'weeklyMarker' -Value ([pscustomobject]@{
                    remaining = [double]$state.weekly.remaining
                    resetAtEpoch = [long]$state.weekly.resetAtEpoch
                    setAt = [DateTimeOffset]::Now.ToString('o')
                })
                Set-PropertyValue -Object $state -Name 'detail' -Value 'Weekly roadmap marker set'
            }
            Save-UsageState -State $state
            Write-Output (Format-UsageOutput -State $state)
            return
        }

        if ($Action -eq 'ClearMarker') {
            Set-PropertyValue -Object $state -Name 'weeklyMarker' -Value $null
            Set-PropertyValue -Object $state -Name 'detail' -Value 'Weekly roadmap marker cleared'
            Save-UsageState -State $state
            Write-Output (Format-UsageOutput -State $state)
            return
        }

        $now = [DateTimeOffset]::Now
        Set-PropertyValue -Object $state -Name 'lastAttemptAt' -Value $now.ToString('o')
        if ($SimulateFailure) {
            throw 'Simulated connection failure'
        }

        $result = Invoke-CodexRateLimitRead
        $state = Update-StateFromResult -State $state -Result $result -Now $now
        Save-UsageState -State $state
        Write-Output (Format-UsageOutput -State $state -Now $now)
    }
    catch {
        $message = Sanitize-Field $_.Exception.Message
        if ([string]::IsNullOrWhiteSpace($message)) {
            $message = 'Unknown usage query error'
        }

        $hasGoodData = -not [string]::IsNullOrWhiteSpace([string]$state.lastSuccessAt)
        Set-PropertyValue -Object $state -Name 'status' -Value $(if ($hasGoodData) { 'STALE' } else { 'ERROR' })
        Set-PropertyValue -Object $state -Name 'detail' -Value ('Last attempt {0} failed: {1}' -f [DateTimeOffset]::Now.ToString('dd.MM HH:mm'), $message)
        Save-UsageState -State $state
        Write-Output (Format-UsageOutput -State $state)
    }
    finally {
        Stop-AppServer
    }
}

function Invoke-SerializedMain {
    $mutex = New-Object System.Threading.Mutex($false, $script:mutexName)
    $acquired = $false
    try {
        try {
            $acquired = $mutex.WaitOne($script:mutexWaitMilliseconds)
        }
        catch [System.Threading.AbandonedMutexException] {
            $acquired = $true
        }

        if (-not $acquired) {
            throw "Timed out waiting for the local Codex usage sensor lock '$($script:mutexName)'."
        }
        Invoke-Main
    }
    finally {
        if ($acquired) {
            try { $mutex.ReleaseMutex() } catch {}
        }
        $mutex.Dispose()
    }
}

if ($MyInvocation.InvocationName -ne '.') {
    Invoke-SerializedMain
}
