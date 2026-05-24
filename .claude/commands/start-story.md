Start implementing a frontend story from a planned HiveSpace feature.

Step 1 - Load context
- Read local `AGENTS.md` and `CLAUDE.md` if present.
- Read `../hivespace.spec/.specify/memory/constitution.md`, especially frontend principles.
- Ask the user which feature, story, and app surface to implement if not already provided.
- Read `../hivespace.spec/specs/[feature-name]/spec.md`, `plan.md`, `tasks.md`, and `tasks/frontend.md`.
- Read relevant `../hivespace.spec/specs/[feature-name]/tasks/config.md` and `tasks/verification.md` entries when they apply to the selected frontend story.
- Read `../hivespace.spec/shared/api-catalog.md`.

Step 2 - Confirm scope
- State the app surface: Admin, Seller, or Buyer.
- State the story and exact frontend implementation tasks from `tasks/frontend.md` for this session, using `tasks.md` as the high-level task index.
- State any relevant config and verification task IDs from the detailed task files.
- State API endpoints used by the story.
- State what will not be implemented in this session.
- Surface ambiguity in routes, auth guards, shared component reuse, DTO shape, i18n namespace, or app ownership before editing.

Step 3 - Implement according to repo rules
- Inspect `packages/shared/src` before creating app-local components, composables, icons, services, or types.
- Follow the feature order: types -> service -> store -> components/pages -> route -> i18n.
- Keep HTTP calls in services and state in Pinia stores.
- Use shared UI primitives and `@hivespace/shared` helpers where available.
- Put all user-facing text in both English and Vietnamese i18n files.
- Keep edits scoped to the selected frontend story/task group and any explicitly relevant config or verification tasks.
- Verify with app-level lint and type-check, accounting for documented baseline failures.

Step 4 - Report
- List files changed.
- Summarize verification.
- If more tasks remain, identify the next frontend story/task group from `tasks/frontend.md`.
- Remind the user to run `/done-story`, then `/wrap-up` in `hivespace.spec` after the full feature ships.
