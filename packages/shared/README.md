# `@hivespace/shared`

Shared Vue package for HiveSpace apps. It contains reusable UI components, composables, feature modules, and app utilities consumed by workspace apps in this monorepo.

For monorepo setup, shared prerequisites, and root commands, start with the [root README](../../README.md).

## Local Development

Run these from `packages/shared`:

```bash
pnpm dev
pnpm build
pnpm type-check
```

Or from the repo root:

```bash
pnpm build:shared
```

`pnpm dev` runs `vite build --watch`, which is useful while iterating on changes consumed by the apps.

## Release Guide

This package is published through the GitHub workflows in this repository.

### Workflow Triggers

Publish workflow in `.github/workflows/publish-new-version.yml` triggers on:

- manual dispatch
- pushed tags matching `v*.*.*`

Version automation workflow in `.github/workflows/auto-bump-and-tag.yml` triggers on:

- push to `master`

What this means:

- opening a PR does not publish
- merging to `master` triggers auto bump and auto tag
- the pushed tag triggers publish
- publish happens from the tag event, not directly from the merge

## Release Prerequisites

- You can push branches and tags to the repository.
- Repository secrets include `NPM_TOKEN`.
- Repository secrets include `RELEASE_PAT` for `.github/workflows/auto-bump-and-tag.yml`.
- You are authenticated locally for git operations.

## Recommended Release Flow

1. Create a release branch:

```bash
git checkout -b release/vX.Y.Z
```

2. Validate locally:

```bash
pnpm install
pnpm --filter @hivespace/shared type-check
pnpm --filter @hivespace/shared build
npm publish --dry-run
```

3. Commit and push:

```bash
git add .
git commit -m "feat/fix/chore: your changes"
git push -u origin release/vX.Y.Z
```

4. Open a PR to `master` and merge after approval.

5. After merge, automation will:

- bump patch version in the package manifest
- commit the version bump to `master`
- create and push a matching `vX.Y.Z` tag
- trigger the publish workflow from that tag

The auto bump workflow skips its own release-bump commits by commit-message guard, avoiding recursion without `[skip ci]`.

Tag-based publish validates that:

- `package.json` version matches the tag version without the `v`
- the version is not already published on npm

## Troubleshooting

### `npm run patch` fails

Expected in this repo because there is no `patch` script. Use:

```bash
npm version patch --no-git-tag-version
```

### Publish workflow fails with version mismatch

Ensure these match:

- tag: `v1.2.3`
- `package.json` version: `1.2.3`

### Publish fails because version already exists

Bump to a new version and run the flow again.

### Auto bump cannot push to `master`

If branch protection blocks workflow pushes, allow the GitHub Actions bot to push or keep using a PAT-based workflow.

### Auto bump runs but publish does not trigger

If the auto bump uses `GITHUB_TOKEN`, downstream workflows may not trigger. Use `RELEASE_PAT` for the push that creates the tag.
