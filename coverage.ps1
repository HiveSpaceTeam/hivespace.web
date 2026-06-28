<#
.SYNOPSIS
    Run policy-scoped Jest coverage for the HiveSpace web monorepo and generate a summary.

.PARAMETER Workspace
    Optional. Scope coverage to one workspace: admin, seller, buyer, or shared.

.EXAMPLE
    .\coverage.ps1
    .\coverage.ps1 -Workspace buyer
#>
param(
    [ValidateSet('admin', 'seller', 'buyer', 'shared')]
    [string]$Workspace = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = $PSScriptRoot
$reportRoot = Join-Path $repoRoot 'coverage-report'
$runId = Get-Date -Format 'yyyyMMdd-HHmmss'
$runRoot = Join-Path $reportRoot "run-$runId"
$policyTargetLinePct = 80

function Get-CoveragePolicy {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WorkspaceName
    )

    switch ($WorkspaceName) {
        'shared' {
            return @(
                'src/features/**/*.ts',
                'src/features/**/*.vue',
                'src/composables/**/*.ts',
                'src/test-utils/**/*.ts',
                '!**/index.ts',
                '!src/assets/**',
                '!src/components/**',
                '!src/features/**/*.service.ts',
                '!src/features/**/*.types.ts',
                '!src/icons/**',
                '!src/i18n/**',
                '!src/pages/**',
                '!src/stores/**',
                '!src/styles/**',
                '!src/types/**',
                '!src/utils/**'
            )
        }
        default {
            return @(
                'src/pages/**/*.ts',
                'src/pages/**/*.vue',
                'src/stores/**/*.ts',
                'src/composables/**/*.ts',
                'src/router/**/*.ts',
                '!**/index.ts',
                '!src/assets/**',
                '!src/components/**',
                '!src/config/**',
                '!src/i18n/**',
                '!src/services/**',
                '!src/test/**',
                '!src/types/**',
                '!src/pages/DemoWrapperPage.vue',
                '!src/pages/IconsPage.vue'
            )
        }
    }
}

function Resolve-ReportPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WorkspaceReportDir
    )

    $directIndex = Join-Path $WorkspaceReportDir 'index.html'
    if (Test-Path $directIndex) {
        return $directIndex
    }

    $lcovIndex = Join-Path $WorkspaceReportDir 'lcov-report\index.html'
    if (Test-Path $lcovIndex) {
        return $lcovIndex
    }

    return $directIndex
}

$workspaceMap = [ordered]@{
    admin = @{
        Label = '@hivespace/admin'
        Path = Join-Path $repoRoot 'apps/admin'
        Config = 'jest.config.cjs'
    }
    seller = @{
        Label = '@hivespace/seller'
        Path = Join-Path $repoRoot 'apps/seller'
        Config = 'jest.config.cjs'
    }
    buyer = @{
        Label = '@hivespace/buyer'
        Path = Join-Path $repoRoot 'apps/buyer'
        Config = 'jest.config.cjs'
    }
    shared = @{
        Label = '@hivespace/shared'
        Path = Join-Path $repoRoot 'packages/shared'
        Config = 'jest.config.cjs'
    }
}

if (-not (Test-Path $reportRoot)) {
    New-Item -ItemType Directory -Path $reportRoot -Force | Out-Null
}
New-Item -ItemType Directory -Path $runRoot -Force | Out-Null

$selectedWorkspaces = if ($Workspace) {
    ,$Workspace
} else {
    @($workspaceMap.Keys)
}

Write-Host ''
$workspaceCount = @($selectedWorkspaces).Count
Write-Host "Running coverage for $workspaceCount workspace(s):"
foreach ($workspaceName in $selectedWorkspaces) {
    Write-Host "  $workspaceName"
}
Write-Host ''

$results = @()
$failed = @()

foreach ($workspaceName in $selectedWorkspaces) {
    $workspaceConfig = $workspaceMap[$workspaceName]
    $workspaceReportDir = Join-Path $runRoot $workspaceName
    $coveragePolicy = Get-CoveragePolicy -WorkspaceName $workspaceName

    Write-Host ">> $workspaceName ($($workspaceConfig.Label))"

    New-Item -ItemType Directory -Path $workspaceReportDir -Force | Out-Null

    Push-Location $workspaceConfig.Path
    try {
        $testArgs = @(
            'exec'
            'jest'
            '--config'
            $workspaceConfig.Config
            '--runInBand'
            '--coverage'
            '--coverageDirectory'
            $workspaceReportDir
            '--coverageProvider=v8'
            '--coverageReporters=html'
            '--coverageReporters=json-summary'
            '--coverageReporters=text-summary'
        )
        foreach ($pattern in $coveragePolicy) {
            $testArgs += @('--collectCoverageFrom', $pattern)
        }
        & pnpm @testArgs

        if ($LASTEXITCODE -ne 0) {
            $failed += $workspaceName
            continue
        }

        $summaryPath = Join-Path $workspaceReportDir 'coverage-summary.json'
        if (-not (Test-Path $summaryPath)) {
            $failed += $workspaceName
            Write-Warning "Coverage summary not found for '$workspaceName'."
            continue
        }

        $summary = Get-Content -Raw $summaryPath | ConvertFrom-Json
        $results += [pscustomobject]@{
            Workspace = $workspaceName
            Label = $workspaceConfig.Label
            LinesCovered = [int]$summary.total.lines.covered
            LinesTotal = [int]$summary.total.lines.total
            LinesPct = [double]$summary.total.lines.pct
            BranchesCovered = [int]$summary.total.branches.covered
            BranchesTotal = [int]$summary.total.branches.total
            BranchesPct = [double]$summary.total.branches.pct
            FunctionsCovered = [int]$summary.total.functions.covered
            FunctionsTotal = [int]$summary.total.functions.total
            FunctionsPct = [double]$summary.total.functions.pct
            ReportPath = Resolve-ReportPath -WorkspaceReportDir $workspaceReportDir
        }
    } finally {
        Pop-Location
    }
}

if ($results.Count -eq 0) {
    throw 'No coverage summaries were generated.'
}

$lineCovered = ($results | Measure-Object -Property LinesCovered -Sum).Sum
$lineTotal = ($results | Measure-Object -Property LinesTotal -Sum).Sum
$branchCovered = ($results | Measure-Object -Property BranchesCovered -Sum).Sum
$branchTotal = ($results | Measure-Object -Property BranchesTotal -Sum).Sum
$functionCovered = ($results | Measure-Object -Property FunctionsCovered -Sum).Sum
$functionTotal = ($results | Measure-Object -Property FunctionsTotal -Sum).Sum

$overallLinePct = if ($lineTotal -gt 0) { [math]::Round(($lineCovered / $lineTotal) * 100, 2) } else { 0 }
$overallBranchPct = if ($branchTotal -gt 0) { [math]::Round(($branchCovered / $branchTotal) * 100, 2) } else { 0 }
$overallFunctionPct = if ($functionTotal -gt 0) { [math]::Round(($functionCovered / $functionTotal) * 100, 2) } else { 0 }

$summaryLines = @(
    'HiveSpace Web Policy-Scoped Coverage Summary'
    ('Generated: {0}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
    ''
    ('Policy target (lines): {0}%' -f $policyTargetLinePct)
    ('Overall policy-scoped line coverage: {0}%' -f $overallLinePct)
    ('Overall policy-scoped branch coverage: {0}%' -f $overallBranchPct)
    ('Overall policy-scoped function coverage: {0}%' -f $overallFunctionPct)
    ('Overall status: {0}' -f $(if ($overallLinePct -ge $policyTargetLinePct) { 'meets target' } else { 'below target' }))
    ''
    'Per workspace (policy-scoped):'
)

foreach ($result in $results) {
    $warning = if ($result.LinesPct -lt $policyTargetLinePct) {
        "  [BELOW POLICY TARGET: $policyTargetLinePct%]"
    } else {
        ''
    }
    $summaryLines += (
        '- {0}: lines {1}% | branches {2}% | functions {3}%{4}' -f
        $result.Workspace,
        ([math]::Round($result.LinesPct, 2)),
        ([math]::Round($result.BranchesPct, 2)),
        ([math]::Round($result.FunctionsPct, 2)),
        $warning
    )
    $summaryLines += ('  HTML report: {0}' -f $result.ReportPath)
}

if ($failed.Count -gt 0) {
    $summaryLines += ''
    $summaryLines += 'Failed workspaces:'
    foreach ($workspaceName in $failed) {
        $summaryLines += "- $workspaceName"
    }
}

$summaryLines += ''
$summaryLines += 'Policy scope note: coverage includes runtime-owned frontend logic only.'
$summaryLines += 'See TESTING.md for the enforced include/exclude rules.'

$summaryPath = Join-Path $reportRoot 'Summary.txt'
$summaryLines | Set-Content -Path $summaryPath

Write-Host ''
Get-Content $summaryPath
Write-Host ''

# --- Combined HTML report ---
function Get-PctColor {
    param([double]$Pct, [int]$Target)
    if ($Pct -ge $Target)  { return '#22c55e' }  # green
    if ($Pct -ge 60)       { return '#f59e0b' }  # amber
    return '#ef4444'                              # red
}

function Get-Bar {
    param([double]$Pct, [string]$Color)
    $w = [math]::Min([math]::Round($Pct), 100)
    return "<div style='background:#e5e7eb;border-radius:4px;height:8px;width:100%;min-width:80px'><div style='background:$Color;width:$w%;height:8px;border-radius:4px'></div></div>"
}

$ts      = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$overall = if ($overallLinePct -ge $policyTargetLinePct) { 'MEETS TARGET' } else { 'BELOW TARGET' }
$overallColor = Get-PctColor -Pct $overallLinePct -Target $policyTargetLinePct

$wsRows = ''
foreach ($r in $results) {
    $lc = Get-PctColor -Pct $r.LinesPct    -Target $policyTargetLinePct
    $bc = Get-PctColor -Pct $r.BranchesPct -Target $policyTargetLinePct
    $fc = Get-PctColor -Pct $r.FunctionsPct -Target $policyTargetLinePct
    $lBar = Get-Bar -Pct $r.LinesPct    -Color $lc
    $bBar = Get-Bar -Pct $r.BranchesPct -Color $bc
    $fBar = Get-Bar -Pct $r.FunctionsPct -Color $fc
    $badge = if ($r.LinesPct -ge $policyTargetLinePct) {
        "<span style='background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600'>PASS</span>"
    } else {
        "<span style='background:#fee2e2;color:#b91c1c;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600'>BELOW</span>"
    }
    $link = $r.ReportPath -replace '\\', '/'
    $wsRows += @"
      <tr>
        <td style='padding:12px 16px;font-weight:600'>
          <a href='$link' style='color:#2563eb;text-decoration:none'>$($r.Workspace)</a><br>
          <span style='font-weight:400;font-size:12px;color:#6b7280'>$($r.Label)</span>
        </td>
        <td style='padding:12px 16px'>
          <span style='font-weight:700;color:$lc'>$([math]::Round($r.LinesPct,2))%</span>
          <div style='margin-top:4px'>$lBar</div>
          <span style='font-size:11px;color:#6b7280'>$($r.LinesCovered)/$($r.LinesTotal)</span>
        </td>
        <td style='padding:12px 16px'>
          <span style='font-weight:700;color:$bc'>$([math]::Round($r.BranchesPct,2))%</span>
          <div style='margin-top:4px'>$bBar</div>
          <span style='font-size:11px;color:#6b7280'>$($r.BranchesCovered)/$($r.BranchesTotal)</span>
        </td>
        <td style='padding:12px 16px'>
          <span style='font-weight:700;color:$fc'>$([math]::Round($r.FunctionsPct,2))%</span>
          <div style='margin-top:4px'>$fBar</div>
          <span style='font-size:11px;color:#6b7280'>$($r.FunctionsCovered)/$($r.FunctionsTotal)</span>
        </td>
        <td style='padding:12px 16px;text-align:center'>$badge</td>
      </tr>
"@
}

$failedSection = ''
if ($failed.Count -gt 0) {
    $failedItems = ($failed | ForEach-Object { "<li>$_</li>" }) -join ''
    $failedSection = "<div style='margin-top:24px;padding:16px;background:#fee2e2;border-radius:8px;color:#b91c1c'><strong>Failed workspaces:</strong><ul style='margin:8px 0 0 16px'>$failedItems</ul></div>"
}

$overallBadge = if ($overallLinePct -ge $policyTargetLinePct) {
    "<span style='background:#dcfce7;color:#15803d;padding:4px 12px;border-radius:9999px;font-size:13px;font-weight:700'>MEETS TARGET</span>"
} else {
    "<span style='background:#fee2e2;color:#b91c1c;padding:4px 12px;border-radius:9999px;font-size:13px;font-weight:700'>BELOW TARGET</span>"
}

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>HiveSpace Coverage Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; background: #f9fafb; color: #111827; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); margin-top: 24px; }
    th { background: #f3f4f6; padding: 10px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: .05em; }
    tr:not(:last-child) td { border-bottom: 1px solid #f3f4f6; }
    tr:hover td { background: #f9fafb; }
    .card { background: #fff; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.1); padding: 20px 24px; display: inline-block; min-width: 180px; margin-right: 16px; margin-top: 16px; vertical-align: top; }
    .card-label { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
    .card-value { font-size: 32px; font-weight: 800; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>HiveSpace Web Coverage</h1>
    <p style="color:#6b7280;margin:4px 0 0">Policy-scoped &mdash; $ts &mdash; Target: $policyTargetLinePct% lines</p>

    <div style="margin-top:24px">
      <div class="card">
        <div class="card-label">Lines (overall)</div>
        <div class="card-value" style="color:$overallColor">$overallLinePct%</div>
        <div style="margin-top:8px">$(Get-Bar -Pct $overallLinePct -Color $overallColor)</div>
        <div style="margin-top:6px">$overallBadge</div>
      </div>
      <div class="card">
        <div class="card-label">Branches (overall)</div>
        <div class="card-value" style="color:$(Get-PctColor -Pct $overallBranchPct -Target $policyTargetLinePct)">$overallBranchPct%</div>
        <div style="margin-top:8px">$(Get-Bar -Pct $overallBranchPct -Color (Get-PctColor -Pct $overallBranchPct -Target $policyTargetLinePct))</div>
      </div>
      <div class="card">
        <div class="card-label">Functions (overall)</div>
        <div class="card-value" style="color:$(Get-PctColor -Pct $overallFunctionPct -Target $policyTargetLinePct)">$overallFunctionPct%</div>
        <div style="margin-top:8px">$(Get-Bar -Pct $overallFunctionPct -Color (Get-PctColor -Pct $overallFunctionPct -Target $policyTargetLinePct))</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Workspace</th>
          <th>Lines</th>
          <th>Branches</th>
          <th>Functions</th>
          <th style="text-align:center">Status</th>
        </tr>
      </thead>
      <tbody>
        $wsRows
      </tbody>
    </table>

    $failedSection

    <p style="margin-top:32px;font-size:12px;color:#9ca3af">
      Policy scope: runtime-owned frontend code only (pages, stores, composables, router, shared features). See TESTING.md for include/exclude rules.
    </p>
  </div>
</body>
</html>
"@

$combinedHtmlPath = Join-Path $reportRoot 'index.html'
$html | Set-Content -Path $combinedHtmlPath -Encoding UTF8
Write-Host "Combined HTML report: $combinedHtmlPath"

if ($Workspace -and $results.Count -eq 1) {
    $reportPath = $results[0].ReportPath
    if (Test-Path $reportPath) {
        Write-Host "Opening report: $reportPath"
        Start-Process $reportPath
    }
} else {
    if (Test-Path $combinedHtmlPath) {
        Write-Host "Opening combined report: $combinedHtmlPath"
        Start-Process $combinedHtmlPath
    }
}

if ($failed.Count -gt 0) {
    Write-Host ''
    Write-Host 'Failed workspaces:' -ForegroundColor Yellow
    foreach ($workspaceName in $failed) {
        Write-Host "  $workspaceName" -ForegroundColor Yellow
    }
    exit 1
}
