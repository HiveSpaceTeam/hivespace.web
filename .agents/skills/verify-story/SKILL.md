---
name: "verify-story"
description: "Audit current frontend changes against a planned HiveSpace feature's task definitions without editing files."
---

Audit whether the current frontend repo changes cover the selected HiveSpace feature tasks. This command is verification-only: do not edit files, stage files, commit, format, or implement missing work.

Step 1 - Load context
- Read local `AGENTS.md` and `CLAUDE.md` if present.
- Read `../hivespace.spec/.specify/memory/constitution.md`, especially frontend principles.
- Identify the feature from the user request. If not provided, read `../hivespace.spec/.specify/feature.json`; if still unclear, ask for the feature name.
- Read `../hivespace.spec/specs/[feature-name]/spec.md`, `plan.md`, `tasks.md`, and `tasks/frontend.md`.
- Read only the frontend-owned entries from `tasks/verification.md` that apply to the selected frontend story or task group.
- Read `tasks/config.md` only when the feature contains explicit frontend-owned config work that applies to the selected frontend story or task group.
- Read `../hivespace.spec/shared/api-catalog.md` for endpoint ownership and route expectations.
- Identify any `tasks/verification.md` item with a detail bullet that starts
  with `User-owned E2E:` and treat it as explicit user-run validation outside
  this command's executable scope.

Step 2 - Inspect current changes
- Run `git status --short` and `git diff --name-only` to identify changed, deleted, and untracked files.
- Use `git diff` and targeted searches to compare implementation behavior against each relevant frontend task's exact acceptance text.
- Use GitNexus `detect_changes({ scope: "all" })` when available and report the risk level and unexpected affected flows.
- Identify affected app surfaces: `apps/admin`, `apps/seller`, `apps/buyer`, and/or `packages/shared`.
- Treat untracked source files as part of the implementation surface, but call out temporary files, generated artifacts, logs, or unrelated config churn.

Step 3 - Verify task coverage
- Produce a table for every relevant frontend task from `tasks/frontend.md`, plus only explicitly applicable frontend-owned verification/config tasks, with status `Covered`, `Partial`, `Missing`, or `Not Applicable`.
- Mark `User-owned E2E` tasks as `User-owned` or `Pending user` rather than
  `Missing` when implementation is otherwise complete.
- Include concrete evidence for every `Covered` or `Partial` status: file path, component/service/store/type/route/i18n key, search result, diff evidence, or verification command.
- Do not mark a task `Covered` only because an expected file exists; verify behavior, constraints, forbidden behavior, and acceptance criteria.
- Verify that each planned frontend scenario has a matching test or clearly
  explain the missing coverage.
- Confirm shared-first reuse was checked before app-local code was added.
- Confirm HTTP calls stay in services, state stays in Pinia stores, and apps import shared runtime only from `@hivespace/shared`.
- Confirm user-facing text uses i18n and English/Vietnamese locale files stay structurally aligned.
- Check app routes, auth guards, layouts, stale imports, stale filenames, stale translation roots, and old auth/token-storage references when relevant.

Step 4 - Run verification commands
- Run the smallest meaningful frontend checks for affected packages/apps:
  - `pnpm build` in `packages/shared` when shared runtime changed.
  - `pnpm lint` and `pnpm type-check` in affected apps when app code changed.
  - A targeted root command only when changes span several workspaces and local baselines are understood.
- Run `.\coverage.ps1 -Workspace <admin|seller|buyer|shared>` for each affected
  measured scope when runtime-owned code changed.
- Treat documented baseline failures as baseline only; report any newly introduced errors from changed files.
- If a command cannot run because of dependency, environment, or baseline issues, report the exact blocker and whether the failure appears related to changed files.
- Do not run commands that intentionally mutate tracked files, such as auto-fix format/lint commands.

Step 5 - Report
- Start with the overall judgment: `Ready`, `Not ready`, or `Blocked`.
- If only `User-owned E2E` tasks remain, the overall judgment may still be
  `Ready`, but the pending user validation must be called out explicitly.
- List critical gaps first, with task IDs and file references.
- Include the task coverage table.
- Include verification commands and results, including baseline/new-error distinction.
- Call out any affected measured scope that is below 80% policy-scoped line
  coverage and identify where additional tests are needed.
- List unrelated or suspicious changed files separately from the expected frontend story files and selected frontend task scope.
- If gaps remain, recommend running `/start-story` or manual fixes for the specific missing task IDs, then rerun `/verify-story`.
