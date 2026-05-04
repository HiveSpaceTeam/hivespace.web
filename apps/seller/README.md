# HiveSpace Seller

Seller application for merchant-facing workflows inside the HiveSpace web monorepo.

For repo setup, shared prerequisites, and environment bootstrapping, start with the [root README](../../README.md).

## Purpose

`@hivespace/seller` is the seller dashboard used by verified sellers. It shares infrastructure and UI primitives with the rest of the monorepo through `@hivespace/shared`.

Default local URL: `http://localhost:5174`

## App Commands

Run these from `apps/seller`:

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
pnpm dev:seller
```

## Environment Notes

Create `apps/seller/.env` for local overrides. `apps/seller/.env.development` is already in the repo and can be used as a reference.

Common required values:

```env
VITE_APP_CLIENT_ID=your-oidc-client-id
VITE_GATEWAY_BASE_URL=https://localhost:7001
VITE_APP_REDIRECT_URI=http://localhost:5174/callback/login
VITE_APP_POST_LOGOUT_REDIRECT_URI=http://localhost:5174/callback/logout
VITE_APP_SCOPE=openid profile email offline_access
VITE_APP_ENVIRONMENT=development
VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEBUG=true
```

## Auth Behavior

The seller router applies role and registration gating:

1. `meta.allowAnonymous: true` skips auth.
2. Admins and system admins are logged out.
3. Non-seller users with unverified email are redirected to `/verify-email`.
4. Non-seller users with verified email are redirected to `/register-seller`.
5. Verified sellers continue.

## Development Notes

- Reuse shared components, composables, icons, and feature modules from `@hivespace/shared` before creating app-local code.
- Keep HTTP calls in `src/services`, state in Pinia stores under `src/stores`, and page orchestration in `src/pages`.
- Use `useAppStore` from `@hivespace/shared` directly rather than re-exporting it locally.
- All user-facing strings must use i18n keys.

## Verification

Run from `apps/seller` after your change:

```bash
pnpm lint
pnpm type-check
```

Known baseline issues exist in this app. Do not treat pre-existing demo-file lint errors or the known `type-check` failures as regressions unless your change touched them.
