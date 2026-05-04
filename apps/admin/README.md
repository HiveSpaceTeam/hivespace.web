# HiveSpace Admin

Admin application for platform operations inside the HiveSpace web monorepo.

For repo setup, shared prerequisites, and environment bootstrapping, start with the [root README](../../README.md).

## Purpose

`@hivespace/admin` is the internal dashboard used by admins and system admins. It is a Vue 3 SPA built on shared monorepo infrastructure and shared UI exports from `@hivespace/shared`.

Default local URL: `http://localhost:5173`

## App Commands

Run these from `apps/admin`:

```bash
pnpm dev
pnpm build
pnpm build-only
pnpm preview
pnpm type-check
pnpm lint
pnpm format
```

From the repo root, you can also run:

```bash
pnpm dev:admin
```

## Environment Notes

Create `apps/admin/.env` for local overrides. `apps/admin/.env.development` is already in the repo and can be used as a reference.

Common required values:

```env
VITE_APP_CLIENT_ID=your-oidc-client-id
VITE_GATEWAY_BASE_URL=https://localhost:7001
VITE_APP_REDIRECT_URI=http://localhost:5173/callback/login
VITE_APP_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/callback/logout
VITE_APP_SCOPE=openid profile email offline_access
VITE_APP_ENVIRONMENT=development
VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEBUG=true
```

In admin, versioned API routes should be built with `buildApiUrl(path)` from `@/config`.

## Auth Behavior

The admin router only allows admin and system-admin users through protected routes:

1. `meta.allowAnonymous: true` skips auth.
2. Unauthenticated users are redirected to OIDC login.
3. Authenticated users without admin/system-admin roles are logged out.
4. Admin/system-admin users continue.

## Development Notes

- Reuse shared components, composables, icons, and feature modules from `@hivespace/shared` before creating app-local code.
- Keep HTTP calls in `src/services`, state in Pinia stores under `src/stores`, and page orchestration in `src/pages`.
- Use `useAppStore` from `@hivespace/shared` directly rather than re-exporting it locally.
- All user-facing strings must use i18n keys.

## Verification

Run from `apps/admin` after your change:

```bash
pnpm lint
pnpm type-check
```

Known baseline issues exist in this app. Do not treat pre-existing demo-file lint errors or the known `type-check` failures as regressions unless your change touched them.
