# /show-coverage - Run Policy-Scoped Frontend Coverage and Display the Report

Use this command from the `hivespace.web` repo root.

## Workflow

1. Read local guidance:
   - `AGENTS.md`
   - `CLAUDE.md`
   - `TESTING.md`

2. Run the coverage script:

```bash
rtk powershell -File .\coverage.ps1
```

- If the user specified one workspace, run:

```bash
rtk powershell -File .\coverage.ps1 -Workspace <admin|seller|buyer|shared>
```

3. Read `coverage-report/Summary.txt` and display the **policy-scoped** coverage percentages inline.

4. Tell the user the native Jest HTML reports are generated per workspace under `coverage-report/run-<timestamp>/<workspace>/index.html`.
   - If one workspace was requested, mention that the script opens that report automatically.

5. Make it clear that the reported coverage follows the policy in `TESTING.md`, not blanket all-`src` coverage.
6. If any workspace tests failed, list them.
