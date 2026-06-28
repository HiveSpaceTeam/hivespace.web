Run this verification checklist after completing a frontend story. Check every applicable item and fix failures before marking the story done.

Context:
- Read local `AGENTS.md` and `CLAUDE.md` if present.
- Read the feature `spec.md`, `plan.md`, `tasks.md`, and `tasks/frontend.md` under `../hivespace.spec/specs/[feature-name]/`.
- Read only frontend-owned `tasks/verification.md` entries that apply to the completed story.
- Read `tasks/config.md` only when the completed story includes explicit frontend-owned config work.
- Identify any `tasks/verification.md` item with a detail bullet that starts
  with `User-owned E2E:` and treat it as user-run validation outside this
  command's executable scope.

Frontend checks:
- Shared-first reuse was checked under `packages/shared/src`.
- New Vue components use `<script setup lang="ts">`.
- No Options API was introduced.
- API calls go through the service layer, not components or pages.
- Pinia stores own loading, error, and data state.
- Routes use lazy imports and correct auth/role metadata.
- All user-facing strings use i18n keys.
- English and Vietnamese locale files have matching key structure.
- New shell, navigation, generic, pagination, loading, and session strings are in `common`, not feature files.
- App-local code does not duplicate existing shared Button, Input, Modal, loading, auth, notification, media upload, or user settings helpers.

Verification:
- Run the affected frontend app's lint and type-check commands, plus `pnpm build` in `packages/shared` when shared runtime changed.
- Run `.\coverage.ps1 -Workspace <admin|seller|buyer|shared>` for the affected
  measured scope when runtime-owned code changed.
- Review the reported policy-scoped line coverage for the affected scope.
- If coverage is below 80%, add tests and rerun coverage before treating the
  story as complete.
- Treat documented baseline failures as baseline only; fix all newly introduced errors.
- Search for stale imports, filenames, route paths, and i18n roots after structural changes.
- Do not execute, fail, or mark complete any task marked `User-owned E2E:`; list
  it separately as pending or user-confirmed validation.

Report:
- List files created and modified.
- List verification commands and results.
- Include the affected scope coverage percentage and whether it met the 80%
  target.
- List `User-owned E2E` tasks separately as pending user validation or
  user-confirmed complete.
- If more frontend stories remain, show the next frontend story/task group from `tasks/frontend.md`, using `tasks.md` only for dependency order.
- Remind the user to run `/wrap-up` in `hivespace.spec` when the full feature is shipped.
