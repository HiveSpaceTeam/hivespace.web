# HiveSpace Web Monorepo

Frontend monorepo for HiveSpace web applications. This repository uses `pnpm`
workspaces and Turbo to develop and build multiple Vue 3 applications alongside
a shared UI package.

## Workspaces

| Path | Package | Purpose | Default Port |
| --- | --- | --- | --- |
| `apps/admin` | `@hivespace/admin` | Platform admin dashboard | `5173` |
| `apps/seller` | `@hivespace/seller` | Seller-facing dashboard | `5174` |
| `apps/buyer` | `@hivespace/buyer` | Customer-facing buyer storefront | `5175` |
| `packages/shared` | `@hivespace/shared` | Shared UI, features, and app utilities | - |
| `packages/demo` | `@hivespace/demo` | Dev-only demo pages used by apps in development | - |
| `packages/eslint-config` | `@hivespace/eslint-config` | Shared lint rules | - |
| `packages/tsconfig` | `@hivespace/tsconfig` | Shared TypeScript config | - |
| `packages/vite-config` | `@hivespace/vite-config` | Shared Vite config | - |

## Prerequisites

- Node.js `>=20.0.0`
- `pnpm >=9.0.0`

The repo declares `pnpm@9.15.4` in `packageManager`, so using that version is the safest default.

## Getting Started

1. Install dependencies from the repo root:

```bash
pnpm install
```

2. Create local `.env` files for the apps you want to run:
   - `apps/admin/.env`
   - `apps/seller/.env`
   - `apps/buyer/.env`

3. Start the app you need:

```bash
pnpm dev:admin
pnpm dev:seller
pnpm dev:buyer
```

Or run all configured dev tasks together:

```bash
pnpm dev
```

## Environment Setup

There is no shared `.env.example` at the root today. Create an app-local `.env` file in each app you want to run and provide the required values.

### Required variables

```env
VITE_APP_CLIENT_ID=your-oidc-client-id
VITE_GATEWAY_BASE_URL=https://localhost:7001
VITE_APP_REDIRECT_URI=http://localhost:{PORT}/callback/login
VITE_APP_POST_LOGOUT_REDIRECT_URI=http://localhost:{PORT}/callback/logout
VITE_APP_SCOPE=openid profile email offline_access
VITE_APP_ENVIRONMENT=development
VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEBUG=true
```

Replace `{PORT}` with the app's default dev port:
- admin: `5173`
- seller: `5174`
- buyer: `5175`

Notes:
- `apps/admin`, `apps/seller`, and `apps/buyer` already include `.env.development`
  files you can use as references.
- Gateway URL resolution in app config falls back in this order: `VITE_GATEWAY_BASE_URL` -> `VITE_API_BASE_URL` -> `VITE_API_URL`.
- If the identity provider or gateway requires additional values in your environment, keep them app-local and do not commit secrets.

Buyer-specific note:
- `apps/buyer/.env.development` uses broader default scopes such as catalog,
  order, and notification access in addition to OIDC basics. Use that file as
  the source of truth when setting up the buyer app locally.

## Common Commands

Run these from the repo root unless noted otherwise.

```bash
pnpm dev              # Run all workspace dev tasks
pnpm dev:admin        # Run admin only
pnpm dev:seller       # Run seller only
pnpm dev:buyer        # Run buyer only
pnpm build            # Build all workspaces through Turbo
pnpm build:shared     # Build shared package only
pnpm type-check       # Type-check all workspaces
pnpm lint             # Lint all workspaces
pnpm format           # Format all workspaces
```

Per-app commands from `apps/admin`, `apps/seller`, or `apps/buyer`:

```bash
pnpm dev
pnpm build
pnpm build-only
pnpm type-check
pnpm lint
pnpm format
```

Shared package commands from `packages/shared`:

```bash
pnpm dev
pnpm build
pnpm type-check
```

## How The Repo Is Organized

- Apps are isolated workspaces under `apps/`.
- Shared code lives in `packages/shared`.
- Apps may depend on `@hivespace/shared`, but must not import from each other.
- Turbo orchestrates root tasks and caches build outputs.

All apps follow the same general source layout:

```text
src/
|- components/
|- pages/
|- stores/
|- services/
|- types/
|- composables/
|- router/
|- i18n/
`- config/
```

## Development Conventions

- Use shared exports from `@hivespace/shared` before creating app-local equivalents.
- Keep HTTP calls in `services`, state ownership in Pinia `stores`, and page orchestration in `pages`.
- Use `<script setup lang="ts">` for Vue components.
- Use Tailwind utility classes for styling.
- Put all user-facing strings through i18n.

For detailed repo rules, read [AGENTS.md](./AGENTS.md).

## Verification Expectations

After changing an app, run verification from that app directory:

```bash
pnpm lint
pnpm type-check
```

For shared-package-only changes, run verification from `packages/shared`:

```bash
pnpm type-check
```

## Where To Go Next

- [apps/admin/README.md](./apps/admin/README.md)
- [apps/seller/README.md](./apps/seller/README.md)
- [packages/shared/README.md](./packages/shared/README.md)
- [AGENTS.md](./AGENTS.md)
