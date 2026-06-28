#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const allowedScopes = new Set([
  'docs-only',
  'frontend:buyer',
  'frontend:seller',
  'frontend:admin',
  'shared',
  'release',
])

const appPackages = {
  buyer: '@hivespace/buyer',
  seller: '@hivespace/seller',
  admin: '@hivespace/admin',
}

const severity = [
  'fail',
  'unstable_check',
  'environment_failure',
  'missing_data',
  'accepted_risk',
  'not_applicable',
  'pass',
]

const parseScope = () => {
  const index = process.argv.indexOf('--scope')
  const value = index >= 0 ? process.argv[index + 1] : 'release'
  if (!allowedScopes.has(value)) {
    return { scope: value, error: `Unsupported scope "${value}"` }
  }
  return { scope: value }
}

const outputOf = result => [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
const coverageCommand = process.platform === 'win32' ? 'powershell' : 'pwsh'

const summarize = output => {
  const lines = output.split(/\r?\n/).filter(Boolean)
  return lines.slice(-8).join('\n') || 'Command completed without output'
}

const runCommand = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: process.platform === 'win32',
  })

  return {
    code: typeof result.status === 'number' ? result.status : 1,
    output: outputOf(result),
    error: result.error?.message,
  }
}

const runWithRerun = (command, args) => {
  const first = runCommand(command, args)
  if (first.code === 0) {
    return { status: 'pass', rerunCount: 0, summary: summarize(first.output) }
  }

  const second = runCommand(command, args)
  const firstOutput = first.error ?? first.output
  const secondOutput = second.error ?? second.output

  if (second.code === 0) {
    return {
      status: 'unstable_check',
      failureCategory: 'unstable_check',
      blockingDecision: 'merge_blocking',
      rerunCount: 1,
      summary: `Initial run failed but rerun passed:\n${summarize(firstOutput)}`,
    }
  }

  if (firstOutput !== secondOutput) {
    return {
      status: 'unstable_check',
      failureCategory: 'unstable_check',
      blockingDecision: 'merge_blocking',
      rerunCount: 1,
      summary: `Repeated run produced inconsistent output:\n${summarize(secondOutput)}`,
    }
  }

  return {
    status: 'fail',
    failureCategory: 'product_behavior',
    blockingDecision: 'merge_blocking',
    rerunCount: 1,
    summary: summarize(secondOutput),
  }
}

const createCheck = ({
  checkId,
  name,
  journey,
  audience,
  ownerSurface,
  command,
  commandArgs,
  notApplicableSummary,
}) => {
  if (!commandArgs) {
    return {
      checkId,
      name,
      journey,
      audience,
      ownerSurface,
      status: 'not_applicable',
      failureCategory: null,
      blockingDecision: 'none',
      rerunCount: 0,
      summary: notApplicableSummary,
    }
  }

  const result = runWithRerun(command, commandArgs)
  return {
    checkId,
    name,
    journey,
    audience,
    ownerSurface,
    status: result.status,
    failureCategory: result.failureCategory ?? null,
    blockingDecision: result.blockingDecision ?? 'none',
    rerunCount: result.rerunCount,
    summary: result.summary,
  }
}

const sharedCheck = commandArgs => createCheck({
  checkId: 'frontend.shared.test-utilities',
  name: 'Shared package policy-scoped coverage',
  journey: 'frontend-shared-baseline',
  audience: 'contributor',
  ownerSurface: '@hivespace/shared',
  command: coverageCommand,
  commandArgs,
  notApplicableSummary: 'Runtime frontend checks do not apply to docs-only scope',
})

const appCheck = (app, commandArgs) => createCheck({
  checkId: `frontend.${app}.critical-path`,
  name: `${appPackages[app]} - policy-scoped coverage`,
  journey: `${app}-critical-path`,
  audience: app === 'admin' ? 'admin' : app,
  ownerSurface: appPackages[app],
  command: coverageCommand,
  commandArgs,
  notApplicableSummary: 'Runtime frontend checks do not apply to docs-only scope',
})

const releaseCheck = commandArgs => createCheck({
  checkId: 'frontend.release.all-workspaces',
  name: 'Frontend release policy-scoped coverage',
  journey: 'frontend-release-readiness',
  audience: 'contributor',
  ownerSurface: 'hivespace.web',
  command: coverageCommand,
  commandArgs,
  notApplicableSummary: 'Release checks do not apply to docs-only scope',
})

const resultFor = checkResults => {
  const statuses = checkResults.map(check => check.status)
  return severity.find(status => statuses.includes(status)) ?? 'pass'
}

const startedAtMs = Date.now()
const startedAt = new Date(startedAtMs).toISOString()
const { scope, error } = parseScope()

const checkResults = []
if (error) {
  checkResults.push({
    checkId: 'frontend.quality-gate.scope',
    name: 'Frontend quality gate scope validation',
    journey: 'quality-gate-execution',
    audience: 'contributor',
    ownerSurface: 'hivespace.web',
    status: 'fail',
    failureCategory: 'product_behavior',
    blockingDecision: 'merge_blocking',
    rerunCount: 0,
    summary: error,
  })
} else if (scope === 'docs-only') {
  checkResults.push(sharedCheck(null), appCheck('buyer', null), appCheck('seller', null), appCheck('admin', null))
} else if (scope === 'shared') {
  checkResults.push(sharedCheck(['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', '.\\coverage.ps1', '-Workspace', 'shared']))
} else if (scope.startsWith('frontend:')) {
  const app = scope.split(':')[1]
  checkResults.push(
    sharedCheck(['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', '.\\coverage.ps1', '-Workspace', 'shared']),
    appCheck(app, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', '.\\coverage.ps1', '-Workspace', app]),
  )
} else if (scope === 'release') {
  checkResults.push(releaseCheck(['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', '.\\coverage.ps1']))
}

const completedAtMs = Date.now()
const report = {
  gate: {
    scope,
    result: resultFor(checkResults),
    startedAt,
    completedAt: new Date(completedAtMs).toISOString(),
    durationSeconds: Math.round((completedAtMs - startedAtMs) / 1000),
  },
  checkResults,
  coverageGaps: [],
  acceptedRisks: [],
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
process.exit(report.gate.result === 'pass' || report.gate.result === 'not_applicable' ? 0 : 1)
