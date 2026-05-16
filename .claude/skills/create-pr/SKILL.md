---
name: create-pr
description: "Use when the user asks to create a PR, submit changes, open a pull request, push and PR their work, or ship a feature branch. Trigger this skill whenever the user says anything like 'create a PR', 'open a pull request', 'submit my changes', 'push and PR', 'ship this', or 'PR this'. Also trigger when the user finishes a feature and asks what to do next — this skill handles the full lint → branch → commit → push → reindex → PR flow for the hivespace.web repo."
---

# /create-pr — Lint, Branch, Commit, Push, Reindex, and Open a PR

This skill handles the full workflow from finishing a feature to opening a pull request in the hivespace.web monorepo.

**Flow:** lint/type-check → branch → detect changes → commit → rebase → push → gitnexus analyze → gh pr create → tell user to run /review in a new session

---

## Step 1 — Verify lint and type-check pass

Determine which apps have changed files and run checks only for those:

```bash
git diff --name-only HEAD
```

For each app with changes, run the corresponding check:

```bash
# Apps with changes under apps/admin/
cd apps/admin && pnpm lint && pnpm type-check

# Apps with changes under apps/seller/
cd apps/seller && pnpm lint && pnpm type-check

# Apps with changes under apps/buyer/
cd apps/buyer && pnpm lint && pnpm type-check

# Changes under packages/shared/
cd packages/shared && pnpm build
```

**Known baseline failures — not blockers:**
- `apps/admin` and `apps/seller`: ~11 pre-existing type-check errors and ~15 lint errors in demo files
- These are documented in CLAUDE.md under `Verification`

If you find errors **not** in the baseline, stop here and report them to the user. Do not continue until they are fixed.

---

## Step 2 — Determine the branch

Check the current branch:

```bash
git branch --show-current
```

- If already on a feature/bugfix branch (not `master`), use it — no need to create a new one.
- If on `master`, ask the user for a branch name or derive one from the change context.

**Branch naming convention** for this repo:
- `feature/<short-description>` — new features (e.g. `feature/buyer-coupon-cart`)
- `bugfix/<short-description>` — bug fixes (e.g. `bugfix/sidebar-collapse`)
- `frontend-<scope>-<description>` — frontend-scoped work (e.g. `frontend-page-i18n-cleanup`)

Create and switch to the new branch if needed:

```bash
git checkout -b feature/<branch-name>
```

---

## Step 3 — Check what changed

Run `gitnexus_detect_changes()` to get a clear picture of what symbols and execution flows were affected. Report this to the user so they know what scope is going into the commit.

Then run `git status` to see the full file list.

---

## Step 4 — Stage and commit

Stage all changed files and commit in one step:

```bash
git add <files...>
```

Write a commit message that explains **why** the change exists, not just what files changed. Look at recent commit messages for style:

```bash
git log --oneline -5
```

Commit:

```bash
git commit -m "$(cat <<'EOF'
<summary of change>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Step 5 — Pull latest from master before pushing

Fetch and rebase to avoid push conflicts:

```bash
git fetch origin
git rebase origin/master
```

If the rebase has conflicts, resolve them with the user before continuing.

---

## Step 6 — Push the branch

```bash
git push -u origin HEAD
```

---

## Step 7 — Refresh the GitNexus index

The index must reflect the committed changes before the PR is opened, so that `/review` in the next session sees fresh symbol data.

Check whether embeddings exist to preserve them:

```bash
npx gitnexus analyze
```

---

## Step 8 — Open the PR

Create the PR with a summary body:

```bash
gh pr create --title "<concise title>" --body "$(cat <<'EOF'
## Summary
- <bullet 1>
- <bullet 2>

## Test plan
- [ ] Run pnpm lint + pnpm type-check in affected apps
- [ ] Verify feature works end-to-end in the browser

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Use `--draft` only if the user explicitly asked for a draft PR.

---

## Step 9 — Hand off to review

After the PR link is printed, tell the user:

> "PR is open. To review: **start a new Claude Code session** in this repository and run `/review` — it will inspect all changes on this branch and surface any issues before merging."

---

## Quick reference — what each step guards against

| Step | Why it matters |
|------|----------------|
| lint + type-check | Catches introduced errors before they reach the PR |
| `gitnexus_detect_changes` | Confirms the diff scope matches intent |
| `npx gitnexus analyze` | Ensures `/review` in the new session sees fresh symbol data |
| new session + `/review` | Clean context for an unbiased review of all branch changes |
