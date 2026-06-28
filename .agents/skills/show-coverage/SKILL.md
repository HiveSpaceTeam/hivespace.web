---
name: show-coverage
description: "Run frontend test coverage for hivespace.web. Use when the user wants to run coverage, check test coverage, see coverage percentages, generate the coverage report, or display frontend workspace coverage for admin, seller, buyer, or shared."
---

# /show-coverage

Run the policy-scoped frontend coverage script and display the results inline.
Treat 80% policy-scoped line coverage as the current target for each affected
workspace or shared scope.

Steps:
1. Read local `AGENTS.md` and `CLAUDE.md`.
2. Read `TESTING.md` for the frontend coverage policy and include/exclude rules.
3. Run `rtk powershell -File .\coverage.ps1` from the repo root.
   - If the user specified one workspace, run `rtk powershell -File .\coverage.ps1 -Workspace <admin|seller|buyer|shared>`.
4. Read `coverage-report/Summary.txt` and display the **policy-scoped** coverage percentages inline.
5. Tell the user the native Jest HTML reports are generated per workspace under `coverage-report/run-<timestamp>/<workspace>/index.html`.
   - If one workspace was requested, mention that the script opens that report automatically.
6. If any workspace tests failed, list them.
