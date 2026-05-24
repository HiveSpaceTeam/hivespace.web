Run this verification checklist after completing a frontend story. Check every applicable item and fix failures before marking the story done.

Context:
- Read local `AGENTS.md` and `CLAUDE.md` if present.
- Read the feature `spec.md`, `plan.md`, `tasks.md`, and `tasks/frontend.md` under `../hivespace.spec/specs/[feature-name]/`.
- Read relevant `tasks/config.md` and `tasks/verification.md` entries when they apply to the completed story.

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
- Run the affected app's lint and type-check commands.
- Treat documented baseline failures as baseline only; fix all newly introduced errors.
- Search for stale imports, filenames, route paths, and i18n roots after structural changes.

Report:
- List files created and modified.
- List verification commands and results.
- If more stories remain, show the next frontend story/task group from `tasks/frontend.md`, using `tasks.md` for dependency order.
- Remind the user to run `/wrap-up` in `hivespace.spec` when the full feature is shipped.
