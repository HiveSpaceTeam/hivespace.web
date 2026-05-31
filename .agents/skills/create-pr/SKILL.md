---
name: "create-pr"
description: "Create a pull request for hivespace.web. Use when the user asks to create a PR, open a pull request, submit changes, push and PR, ship a branch, or finish a frontend change with a PR."
---

# /create-pr - Verify, Commit, Push, and Open a PR

Use this command from the hivespace.web repo root after implementation is complete.

## Workflow

1. Read local guidance:
   - `AGENTS.md`
   - `CLAUDE.md`

2. Inspect branch and changed scope:

```bash
rtk git branch --show-current
rtk git status --short
rtk git diff --name-only HEAD
```

- If already on a non-`master` branch, keep using it.
- If on `master`, create a feature branch after deriving or asking for a name.
- Prefer branch names such as `feature/<short-description>`, `bugfix/<short-description>`, or `frontend-<scope>-<description>`.

3. Verify affected workspaces only:

- For changes under `apps/admin/`, run from `apps/admin`: `rtk pnpm lint` and `rtk pnpm type-check`.
- For changes under `apps/seller/`, run from `apps/seller`: `rtk pnpm lint` and `rtk pnpm type-check`.
- For changes under `apps/buyer/`, run from `apps/buyer`: `rtk pnpm lint` and `rtk pnpm type-check`.
- For changes under `packages/shared/`, run from `packages/shared`: `rtk pnpm build`.
- For broad package, lockfile, or config changes, run the smallest root-level command that proves the affected surface.

Treat documented admin/seller baseline failures as baseline only. Fix all newly introduced errors before continuing. Because app lint scripts use `eslint . --fix`, inspect the diff after lint.

4. Audit changed scope:

- Run `gitnexus_detect_changes({ scope: "all", repo: "hivespace.web" })`.
- Report the risk level and any unexpected affected flows before committing.
- If the worktree includes unrelated user changes, identify the intended files and do not stage unrelated files.

5. Stage and commit:

```bash
rtk git status --short
rtk git add <intended-files...>
rtk git diff --cached --name-only
rtk git log --oneline -5
rtk git commit -m "<type>: <summary>"
```

Use the repo's existing conventional style, for example `feat:`, `fix:`, `refactor:`, or `chore:`. Commit messages should explain the change, not the file list.

6. Rebase on latest `master`:

```bash
rtk git fetch origin
rtk git rebase origin/master
```

If conflicts occur, stop and report the conflicted files. Do not resolve conflicts silently.

7. Push the branch:

```bash
rtk git push -u origin HEAD
```

8. Refresh the GitNexus index after commit/push:

- Check `.gitnexus/meta.json`.
- If `stats.embeddings > 0`, run `rtk npx gitnexus analyze --embeddings`.
- Otherwise run `rtk npx gitnexus analyze`.

9. Create the PR:

```bash
rtk gh pr create --title "<concise title>" --body "<summary and test plan>" --base master --head <branch>
```

Use a PR body with:

```text
## Summary
- <main change>
- <secondary change>

## Test plan
- [x] <verification command>
- [x] <verification command>
```

Use `--draft` only if the user explicitly asks for a draft PR.

10. Hand off:

- Report the PR link.
- Tell the user to run `/review` in a new session if they want a fresh post-PR review.

## Safety Rules

- Prefix shell commands with `rtk`.
- Do not stage unrelated dirty-worktree changes.
- Do not run microservice-only steps such as `scripts/sync-config.sh`.
- Do not treat known baseline failures as introduced failures.
