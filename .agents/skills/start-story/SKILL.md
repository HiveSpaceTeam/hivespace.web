---
name: "start-story"
description: "Start implementing a frontend story from a planned HiveSpace feature."
compatibility: "HiveSpace frontend repo custom command"
---

Start implementing a frontend story from a planned HiveSpace feature.

Step 1 - Load context
- Read local `AGENTS.md` and `CLAUDE.md` if present.
- Read `../hivespace.spec/.specify/memory/constitution.md`, especially frontend principles.
- Ask the user which feature, story, and app surface to implement if not already provided.
- Read `../hivespace.spec/specs/[feature-name]/spec.md`, `plan.md`, `tasks.md`, and `tasks/frontend.md`.
- Read `tasks/verification.md` only for frontend-owned verification entries that apply to the selected frontend story.
- Read `tasks/config.md` only when the feature contains explicit frontend-owned config work for the selected story.
- Read `../hivespace.spec/shared/api-catalog.md`.

Step 2 - Confirm scope
- State the app surface: Admin, Seller, or Buyer.
- State the story and exact frontend implementation task IDs from `tasks/frontend.md` for this session, using `tasks.md` only as the high-level task index and dependency guide.
- State only frontend-owned verification task IDs from `tasks/verification.md` and only explicitly frontend-owned config task IDs when they apply.
- State API endpoints used by the story.
- State what will not be implemented in this session, explicitly excluding backend, docs/catalog, and non-frontend verification work.
- Surface ambiguity in routes, auth guards, shared component reuse, DTO shape, i18n namespace, or app ownership before editing.

Step 3 - Implement according to repo rules
- Inspect `packages/shared/src` before creating app-local components, composables, icons, services, or types.
- Follow the feature order: types -> service -> store -> components/pages -> route -> i18n.
- Keep HTTP calls in services and state in Pinia stores.
- Use shared UI primitives and `@hivespace/shared` helpers where available.
- Put all user-facing text in both English and Vietnamese i18n files.
- Keep edits scoped to the selected frontend story/task group and only the explicitly relevant frontend-owned verification or config tasks.
- Verify with app-level lint and type-check, accounting for documented baseline failures.

Step 4 - Report
- List files changed.
- Summarize verification.
- If more tasks remain, identify the next frontend story/task group from `tasks/frontend.md`, using `tasks.md` only for dependency order.
- Remind the user to run `/done-story`, then `/wrap-up` in `hivespace.spec` after the full feature ships.
