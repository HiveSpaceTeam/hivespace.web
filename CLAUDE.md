# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Sync

`AGENTS.md` and `CLAUDE.md` must stay in sync. Any change made to one file must be applied to the other file in the same update so both instruction files remain aligned.

## Behavioral Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them; don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it; don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that your changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Repository Overview

`hivespace.web` is a **pnpm monorepo** using **Turbo** for task orchestration. It bundles three production Vue 3 apps plus a shared UI library that all apps consume.

| Workspace | Package Name | Purpose | Dev Port |
|---|---|---|---|
| `apps/admin/` | `@hivespace/admin` | Platform admin dashboard | 5173 |
| `apps/seller/` | `@hivespace/seller` | Seller-facing dashboard | 5174 |
| `apps/buyer/` | `@hivespace/buyer` | Customer-facing storefront | 5175 |
| `packages/shared/` | `@hivespace/shared` | Shared component library consumed by all apps | - |
| `packages/eslint-config/` | `@hivespace/eslint-config` | Shared ESLint rules with architectural boundary enforcement | - |
| `packages/tsconfig/` | `@hivespace/tsconfig` | Shared TypeScript configurations | - |
| `packages/demo/` | `@hivespace/demo` | Dev-only demo pages (injected into admin & seller in DEV mode) | - |

> `apps/buyer/` is the active storefront app. Storefront-specific guidance below applies to buyer unless stated otherwise.

## Commands

### Root (run from monorepo root)

```bash
pnpm dev              # Start all apps concurrently
pnpm dev:admin        # Admin app only
pnpm dev:seller       # Seller app only
pnpm build            # Build all apps (Turbo-cached)
pnpm type-check       # Type-check across the monorepo
pnpm lint             # Lint all workspaces
pnpm format           # Prettier format all workspaces
```

### Per-App (run from `apps/{admin|seller|buyer}/`)

```bash
pnpm dev              # Dev server
pnpm build            # Build with type-check
pnpm build-only       # Build without type-check
pnpm type-check       # Vue-tsc validation
pnpm lint             # ESLint with auto-fix (admin & seller only)
pnpm format           # Prettier formatting (admin & seller only)
```

### Shared UI Library (`packages/shared/`)

```bash
pnpm build            # Vite library build -> dist/
pnpm dev              # Watch mode (vite build --watch)
```

**No test framework is configured** - there are no test commands.

For known lint/type-check baseline failures, see `Verification`.

## Core Rules

### Environment Setup

Create `.env` in each app root. Key variables (ports differ per app):

```env
VITE_APP_CLIENT_ID=your-oidc-client-id
VITE_GATEWAY_BASE_URL=https://localhost:7001
VITE_APP_REDIRECT_URI=http://localhost:{PORT}/callback/login
VITE_APP_POST_LOGOUT_REDIRECT_URI=http://localhost:{PORT}/callback/logout
VITE_APP_SCOPE=openid profile email offline_access   # buyer also adds: catalog order
VITE_APP_ENVIRONMENT=development
VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEBUG=true
```

Config singleton built at startup in `src/config/index.ts`. Gateway URL resolves via `VITE_GATEWAY_BASE_URL` -> `VITE_API_BASE_URL` -> `VITE_API_URL`. In admin, use `buildApiUrl(path)` from `@/config` to construct versioned API URLs - it auto-prefixes `/api/v1/`.

### Architecture

All three apps share the same `src/` layout:

```text
src/
|- components/   # Reusable UI (common/, charts/, forms/, layout/, tables/)
|- pages/        # Page-level route components
|- stores/       # Pinia stores (`[module].store.ts`)
|- services/     # api.ts (ApiService instance) + *.service.ts per domain
|- types/        # Flat {domain}.types.ts files per domain; all exported from index.ts
|- composables/  # Reusable Composition API logic
|- router/       # Vue Router + beforeEach auth guard
|- i18n/         # locales/{en,vi}/{module}.json merged in src/i18n/index.ts
`- config/       # Env config singleton
```

### Dependency Boundaries

Apps may only import from `@hivespace/shared`. Cross-app imports are forbidden and will produce a lint error.

### Reuse Shared First

Do **not** re-implement anything already exported by `@hivespace/shared`, including:
- `useAuth`, `useAppStore`, `ApiService`, `AppUser`
- `Pagination`, `Status`, `UserType`, `AuthConfig`, `AppUser` helper methods
- Layout shells: `Default`, `Maintenance`, `NotFound`, `ServerError`, `demoRoutes`
- Shared icons from `packages/shared/src/icons/`
- Shared i18n base translations

The package exports through `packages/shared/src/internal.ts` to avoid circular dependencies.

Before creating app-local code:
- Check `packages/shared/src/components/` before building any new UI component.
- Check `packages/shared/src/composables/` and existing `@hivespace/shared` exports before adding reusable logic.
- Extend shared components or icons when a new variant is needed instead of creating local duplicates.
- Keep generic concerns such as modal state, auth/session helpers, validation rules, date/time formatting, debounce/cooldown, number-input formatting, or notification wiring in shared unless behavior is app-specific.

### Shared UI Primitives

Always use `useModal` from `@hivespace/shared`. Never create a local `ref<boolean>` to control modal visibility.

```typescript
import { useModal } from '@hivespace/shared'

const { openModal, closeModal } = useModal()

const result = await openModal(MyModalComponent, { prop1: value1 })
```

- `ModalManager` must exist in `App.vue`; add it if missing.
- `ModalWrapper` owns the shared modal shell for `useModal()` flows.
- Components opened through `openModal()` must render content only. Do not add a second outer dialog shell, duplicate modal header, or duplicate top-right close button inside the modal component.
- Pass shared modal chrome through `openModal()` props such as `title`, `description`, and `maxWidth` instead of hardcoding them inside the modal component.
- Use `ConfirmModal` for all destructive confirmation flows.
- The component passed to `openModal()` resolves the promise with `closeModal(result)`.

Never write raw `<div class="animate-spin ...">` inline. Use shared loading components:
- Use `<Spinner />` when the rest of the page stays interactive.
- Use `<FullscreenLoader :visible="bool" :message="string" />` when the user must wait before interacting.

`Spinner` supports `size: 'sm' | 'md' | 'lg'` and defaults to `'md'`. `FullscreenLoader` takes `visible` and optional `message`, and should be placed at the template root so it teleports to `<body>`.

### Store and Service Ownership

- Pinia stores only - no prop drilling.
- Import `useAppStore` directly from `@hivespace/shared`; do not re-export it from local stores.
- Services own HTTP calls only and must import the singleton from `@/services/api`.
- Stores are the single source of truth for loading, error, and data state.
- Components and views consume store actions/state and must not call service methods directly.
- Use `storeToRefs` when destructuring stores to preserve reactivity.
- In store actions, call `useAppStore().setLoading(true/false)` via `try/finally`.
- Show toast notifications through `useAppStore().notifySuccess/notifyError/notifyInfo`.

### Shared Feature Modules

- `notification`, `media upload`, and `user settings` use shared feature modules under `packages/shared/src/features/`.
- Use store-first shared feature APIs:
  - stateful shared features expose `create[Feature]Store.ts`
  - shared HTTP adapters expose `[feature].service.ts`
  - shared contracts expose `[feature].types.ts`
  - optional helpers keep explicit names such as `useNotificationRealtime.ts`
- Keep feature folders kebab-case, for example:
  - `packages/shared/src/features/notifications/`
  - `packages/shared/src/features/media-upload/`
  - `packages/shared/src/features/user-settings/`
- `user settings` must use a dedicated `user-settings.store.ts` flow in apps. Keep `setUserSettings`, `fetchUserSettings`, `updateUserSettings`, `updateTheme`, and `updateCulture` in the shared user-settings feature, not app-local `user.store.ts`.
- Keep notification message mapping and route resolution app-local when event handling differs by app, but reuse the shared notification service, store factory, and realtime helper.
- Keep media upload entity-specific orchestration app-local when needed, but reuse the shared media-upload service/store contracts and flow.

## Implementation Workflow

For every feature implementation, follow this order:

1. **Reuse check** - inspect `@hivespace/shared` components, composables, icons, and types first.
2. **Types** - add `src/types/{module}.types.ts` and export from `src/types/index.ts`.
3. **Service** - add `src/services/{module}.service.ts` using the app's singleton `apiService`.
4. **Store** - add `src/stores/{module}.store.ts`, keep HTTP out of components, and export from `src/stores/index.ts`.
5. **Components / pages** - place reusable UI in `src/components/` and page orchestration in `src/pages/`.
6. **Route** - register route entries in `src/router/index.ts` where needed.
7. **i18n** - before adding keys, classify each new user-facing string as either `common` or module-owned. Put app-shell/reusable copy in `src/i18n/locales/{en,vi}/common.json`; put feature-owned copy in `src/i18n/locales/{en,vi}/{module}.json`; then import the affected files in `src/i18n/index.ts`.
8. **Verify** - run the required checks from `Verification` and ensure no equivalent shared helper was introduced locally.

### Feature Consistency Checklist

Apply these rules on every feature change:

- Routed views must live in `src/pages/` and use `*Page.vue` names.
- `src/pages/` is for route entry components only. Non-route UI such as modals, drawers, popups, panels, and reusable page sections belongs in `src/components/`, preferably under `src/components/{feature}/` when feature-local.
- Feature/domain translation keys must use a stable module namespace such as `accounts.*`, `auditLog.*`, `buyers.*`, or `configuration.*`.
- Shared or app-shell labels that are plain strings, especially sidebar and navigation labels, must use shared/common translation keys rather than a feature namespace root that is also an object. Use `common.*` for shell/navigation labels instead of calling keys such as `t('accounts')` once `accounts.*` is a feature namespace.
- Use `common` for app-level reusable copy: shell labels, navigation groups, header/footer labels, generic error/default screens, document titles for non-domain screens, and generic UI strings such as pagination, loading, confirmation, and session-state messages.
- Never reuse one i18n key as both a string value and an object namespace.
- Do not use container files such as `pages.json` to mix navigation/common shell copy with feature-specific page content. If a file contains shared app-shell copy, move that copy to `common`.
- When renaming a page file, feature namespace, or shared label key, update all affected imports, router entries, app-shell navigation labels, and related references in the same change.
- Before finishing a structural refactor, search for stale filenames, old i18n roots, and outdated imports so the repo does not keep partially migrated references.

### API Layer

Each app has a singleton `apiService` in `src/services/api.ts`, configured with:
- Base URL from `config.api.baseUrl`
- `ensureFreshUser` callback that runs refresh-token exchange via `src/services/refresh.service.ts` and forces logout on `invalid_grant`
- `notifyCallback` that calls `useAppStore().notifyError(...)` for HTTP error toasts with i18n-sourced messages

Never construct `ApiService` directly inside a feature service.

### Type Naming

- Domain models use plain singular names such as `Order`, `OrderItem`, `Coupon`, `User`.
- Query contracts use action-prefixed `*Query` names such as `GetUserListQuery`.
- Request contracts use action-prefixed `*Request` names such as `CreateProductRequest`.
- Response contracts use action-prefixed `*Response` names such as `GetOrderDetailResponse`.
- Reusable app models stay as plain entity names; use `*Request`, `*Query`, and `*Response` for endpoint contracts.
- Reserve `*Params` for actual route params only, not list/search filters.
- All paged responses must use `PaginationMetadata` from `@hivespace/shared`.
- Do not use `Api` suffixes in app-facing type names, and avoid `Dto` unless temporarily mirroring an unavoidable backend contract.
- Prefer explicit names over broad contracts such as `PagedResponse` or `CategoryResponse`, and avoid aliases that add no meaning.

### i18n

- Default locale: Vietnamese (`vi`); fallback: English (`en`).
- Files live in `src/i18n/locales/{en,vi}/{module}.json`.
- Shared translations merge first; local keys override them.
- New backend error codes go into `backend-errors.json`.
- All user-facing strings must go through `$t('module.key')`.
- Before adding any new translation key, explicitly classify it as `common` or module-owned and place it in the correct file in the same change.
- Keep one translation file per feature/domain and use that file's module root consistently across pages, stores, and feature-local components.
- Use feature namespaces for feature copy and `common` for app-shell or cross-feature labels.
- Put strings in `common` when they are not owned by one business domain: shell navigation, header/footer labels, generic error/default pages, reusable actions, pagination text, and session-state copy.
- Keep strings in a module file when they describe feature behavior, feature forms/tables/filters, domain statuses, feature notifications, or content that only makes sense inside one feature.
- Do not store shell/navigation/error/default/pagination/session copy inside feature files or overloaded container files such as `pages.json`.
- Do not create collisions where the same key is sometimes a string and sometimes an object namespace.

## App-Specific Rules

### Admin

- Use `buildApiUrl(path)` from `@/config` for versioned API routes; it auto-prefixes `/api/v1/`.
- Auth flow in `src/router/index.ts`:
  1. `meta.allowAnonymous: true` -> skip auth
  2. Unauthenticated -> redirect to OIDC login
  3. Authenticated but not admin/system-admin -> logout
  4. Admin/system-admin -> pass through

### Seller

- Auth flow in `src/router/index.ts`:
  1. `meta.allowAnonymous: true` -> skip auth
  2. Admins/system-admins -> logout
  3. Non-seller with unverified email -> `/verify-email`
  4. Non-seller with verified email -> `/register-seller`
  5. Verified seller -> pass through

### Buyer (Storefront)

- Apply these rules in `apps/buyer/`.
- Auth flow in `src/router/index.ts`:
  1. `meta.allowAnonymous: true` -> skip auth
  2. Unauthenticated on protected route -> redirect to OIDC login
  3. Authenticated -> pass through
- Storefront i18n key prefixes should follow `storefront.module.key` or `checkout.key`.
- `App.vue` should conditionally wrap routes in `StorefrontLayout` based on `route.meta.layout`.
- Routes with `meta.layout: 'none'` should render without the standard header/footer and use dedicated flows such as Cart or Checkout headers.

### UI Coding From Design Sources

When the user provides any design source, always apply the following workflow. This includes
pasted images, screenshots, mockups, Figma links or exports, design files, and any other design
reference link, file, or source:

1. Scan `packages/shared/src/components/` first and identify reusable shared primitives.
2. Ask before coding by listing the shared components that map to the design.
3. Prefer extending shared components over building local copies.
4. Never create a local `Button.vue`, `Modal.vue`, or similar duplicate when one already exists in `@hivespace/shared`.
5. Apply the same rule to icons by reusing or extending `packages/shared/src/icons/`.

## Code Conventions

- Components: `<script setup lang="ts">` only - no Options API.
- Styling: Tailwind CSS v4 utility classes only; use custom CSS only when no utility class applies.
- Functions: arrow functions only, except top-level declarations that require hoisting.
- Naming: PascalCase `.vue` files, kebab-case `.ts` service/util files, camelCase variables/functions.
- Types: use `import type { Foo } from '@/types'` for shared app types; keep component-local types inside the component.
- Props/emits: always type `defineProps<{ ... }>()` and `defineEmits<{ ... }>()`.
- Error handling: use `try/finally` with `useAppStore().setLoading(true/false)` in stores and display errors via `notifyError`.
- Formatting: 100-char line width, single quotes, no semicolons, 2-space indent (`.prettierrc.json`).
- TypeScript: strict mode, `noUnusedLocals`, `noUnusedParameters`.
- Temp files: delete any task-created temporary files before finishing the task.

## Verification

After completing any task in an app, always run lint and type-check for that app and fix all introduced issues before reporting done:

```bash
# From the affected app directory (apps/admin, apps/seller, or apps/buyer)
pnpm lint
pnpm type-check  # Vue-tsc validation
```

If you introduced a new helper or composable, verify before finishing that an equivalent shared composable does not already exist in `packages/shared/src/composables/`.

If you renamed files, moved components, or changed i18n namespaces, also verify before finishing that:
- router imports point to the final `*Page.vue` files
- stale filenames and old import paths are removed
- stale translation roots and outdated key prefixes are removed
- shared navigation or app-shell labels still point to valid plain-string keys
- new shell/navigation/error/default/pagination/session strings were added to `common`, not to feature files

**Known baseline failures that must not be treated as new errors** (admin & seller only):
- `type-check`: ~11 pre-existing errors from missing `@/services/user.service`, missing `quill-image-uploader` types, and TS strict violations in demo files
- `lint`: ~15 pre-existing errors in demo components
- `build` still succeeds despite the above

Fix any errors introduced by the task. Do not fix pre-existing baseline errors unless the task explicitly targets those files.

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci-pipeline.yml` inside each app):
- Triggers on PR to master, push to master, and manual dispatch
- Steps: Install -> Lint -> Build -> Upload artifacts
- Deploys to **Azure Static Web Apps** (dev on master, prod on release branches)

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **hivespace.web** (1605 symbols, 3242 relationships, 94 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/hivespace.web/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/hivespace.web/context` | Codebase overview, check index freshness |
| `gitnexus://repo/hivespace.web/clusters` | All functional areas |
| `gitnexus://repo/hivespace.web/processes` | All execution flows |
| `gitnexus://repo/hivespace.web/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
