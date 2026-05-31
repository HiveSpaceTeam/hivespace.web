---
name: refresh-master
description: "Refresh the hivespace.web master branch while preserving local work. Use when the user asks to refresh master, stash changes and pull latest, update master, checkout master and pull, or pull latest code and reapply local changes."
---

# /refresh-master - Stash Work, Update Master, Reapply Work

Use this skill from the hivespace.web repo root when the user wants to update `master` without losing local changes.

## Workflow

1. Inspect the current state:

```bash
rtk git branch --show-current
rtk git status --short
```

2. If there are local changes, create a new stash that includes untracked files:

```bash
rtk git stash push -u -m "refresh-master: <UTC_TIMESTAMP>"
```

Generate `<UTC_TIMESTAMP>` in `yyyyMMddTHHmmssZ` format. If there are no local changes, skip this step and remember that this workflow did not create a stash.

3. Switch to `master`:

```bash
rtk git checkout master
```

4. Pull latest without creating a merge commit:

```bash
rtk git pull --ff-only
```

If this fails, stop and report that `master` needs manual reconciliation. Do not merge or rebase unless the user asks.

5. If this workflow created a stash, reapply only that stash:

```bash
rtk git stash pop 'stash@{0}'
```

If stash pop causes conflicts, stop and report conflicted files from `rtk git status --short`. Do not resolve conflicts automatically.

6. Report final state:

```bash
rtk git branch --show-current
rtk git status --short
```

## Safety Rules

- Prefix shell commands with `rtk`.
- Only pop a stash created during this workflow.
- Never pop an older pre-existing stash when this workflow did not create one.
- Use `git stash push -u` so untracked files are preserved.
- Use `git pull --ff-only` to avoid accidental merge commits.
