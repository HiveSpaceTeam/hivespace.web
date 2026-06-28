# HiveSpace Frontend Testing Guide

## Co-location rule

Test files live next to the source files they exercise:

```
src/stores/cart.ts           →  src/stores/cart.store.test.ts
src/pages/Cart/CartPage.vue  →  src/pages/Cart/CartPage.test.ts
```

Never use a top-level `__tests__/` folder. Jest discovers co-located test files through the `src/**/*.test.ts` pattern in each workspace config.

The frontend test stack is:
- `Jest` as the test runner
- `jsdom` as the browser-like test environment
- `@testing-library/vue` for rendered Vue page/component tests
- `@pinia/testing` or plain `pinia` for store-focused tests
- native Jest coverage reports, with policy scoping enforced by `coverage.ps1`

---

## Coverage policy

Coverage is measured against **runtime-owned frontend code**, not every file under `src/`.

- The `0008` spec defines **which journeys and capabilities must be protected**.
- The coverage policy defines **which frontend code counts toward the percentage**.
- The repo target is **80% overall policy-scoped frontend line coverage**.
- Raw all-`src` coverage is diagnostic only and must not be treated as the enforcement number.

### Included by default

- `apps/*/src/pages/**`
- `apps/*/src/stores/**`
- `apps/*/src/composables/**`
- `apps/*/src/router/**` when it owns route guards or auth/access behavior
- `packages/shared/src/features/**` — only `create*Store.ts` store factories; `*.service.ts` and `*.types.ts` are excluded
- `packages/shared/src/composables/**`
- `packages/shared/src/test-utils/**`

### Excluded by default

- `assets`, `styles`, and `i18n`
- `types` and barrel exports such as `index.ts`
- `apps/*/src/services/**` when they are thin transport wrappers only
- `apps/*/src/config/**` when they are environment/constants only
- `packages/shared/src/features/**/*.service.ts` and `packages/shared/src/features/**/*.types.ts`
- demo/sample surfaces
- `DemoWrapperPage.vue` and `IconsPage.vue` — demo/dev-only pages with no business logic
- broad presentational UI folders with little or no business logic
- shared visual primitives such as `packages/shared/src/components/common/**`
- shared layout/icon shells unless they own meaningful branching or runtime behavior
- `packages/shared/src/utils/**` unless a utility owns important runtime logic
- app-local `components/**` unless a component becomes logic-heavy enough to justify explicit promotion into coverage scope

### Promotion rule

If an excluded folder starts owning meaningful branching, async behavior, validation, permissions, orchestration, or stateful logic, either:

1. Move that logic into an included runtime surface, or
2. Explicitly add that folder to the coverage policy and its tests in the same change

Use the coverage script as the source of truth for the enforced include/exclude set.

---

## Store tests vs view tests

### Store tests (`@pinia/testing` or plain `pinia`)

- No component rendering, no DOM — fast and isolated.
- Create a Pinia instance with `createPinia()` and `setActivePinia()`.
- Mock the service layer with `jest.mock('@/services/...')`.
- Assert on store state properties after calling store actions.

```typescript
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from './cart.store'
import { cartService } from '@/services/cart.service'

jest.mock('@/services/cart.service', () => ({
  cartService: { addCartItem: jest.fn() },
}))

beforeEach(() => { setActivePinia(createPinia()) })

it('should call addCartItem and update the store when item is added', async () => {
  jest.mocked(cartService.addCartItem).mockResolvedValue({ cartItemId: 'item-002' })
  const store = useCartStore()
  await store.addItem({ productId: 1, skuId: 10, quantity: 1 })
  expect(cartService.addCartItem).toHaveBeenCalled()
})
```

**Use store tests when:** verifying action logic, state transitions, service call arguments, or loading/error state management.

### View tests (`@testing-library/vue`)

- Mount the component with plugins (pinia, router, i18n) wired up.
- Stub HTTP calls via `jest.mock('@/services/...')` before rendering.
- Assert on rendered output using `screen.findByText`, `screen.getByRole`, etc.
- Mock complex layout components (`AppShell`, `PageBreadcrumb`) to isolate the page under test.

```typescript
import { render, screen } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import CartPage from './CartPage.vue'

const router = createRouter({ history: createMemoryHistory(), routes: [...] })
render(CartPage, { global: { plugins: [createPinia(), router, i18n] } })
expect(await screen.findByText('Honey Jar')).toBeTruthy()
```

**Use view tests when:** verifying rendered output, user interactions (click, input), or conditional display based on store state.

---

## Shared test-utils reference

Import from `@hivespace/shared/test-utils` in any app test file:

| Export | Description | When to use |
|--------|-------------|-------------|
| `createFakeAuthUser(overrides?)` | Returns a typed `AppUser` with configurable role and storeId | Seed auth state in store or router guard tests |
| `createFakeAuthState(role)` | Returns a Pinia-compatible auth store state object | Seed a Pinia store snapshot with a specific role |
| `createMockAxios()` | Returns an axios instance with a stub adapter | Replace the real axios instance in service-level tests |
| `stubApiResponse(instance, method, path, data, status?)` | Queues a response for the matched method+path | Set up per-test API responses in `beforeEach` |
| `createFakeSignalRHub()` | Returns a fake hub with `invocations[]` and `emit()` | Test realtime notification handling without a real connection |
| `createFakePresignResponse(overrides?)` | Returns `{ url, uploadRef }` for media upload tests | Stub the presign step of media upload flows |
| `createTestI18n(messages?)` | Returns a vue-i18n instance pre-loaded with shared English keys | Resolve i18n keys in assertions without a full i18n setup |

---

## TDD workflow

Follow a bottom-up loop that mirrors the feature implementation order:

1. **Write store test (Red)** — define the expected action, assertion, and failure.
2. **Implement store action (Green)** — write the minimum store code to pass the test.
3. **Write view test (Red)** — define the expected rendered output.
4. **Wire up component (Green)** — connect the component to the store and service.

This keeps each layer independently testable before the next layer is built.

After implementation, run coverage for the affected workspace or `shared`. If
policy-scoped line coverage is below 80%, add tests for the missing store,
page, composable, router, or shared feature behavior and rerun coverage before
closing the story.

---

## Naming conventions

All test types use `should …` — a plain English sentence that reads naturally as a behavioral statement.

### Store tests

```
should increment cart count when item is added
should update line total when quantity changes
should load orders from the API
should redirect to login when user is unauthenticated
```

### View tests

```
should render cart items from the store
should render empty state when cart has no items
should call create endpoint with correct payload on form submit
should render order confirmation message on success status
```

---

## i18n assertion rule

**Never assert on hardcoded display strings.** Use `createTestI18n` to resolve keys at test time so assertions stay valid when translations change.

```typescript
import { createTestI18n } from '@hivespace/shared/test-utils'

const i18n = createTestI18n()
const label = i18n.global.t('storefront.cart.checkout')

expect(screen.getByRole('button', { name: new RegExp(label) })).toBeTruthy()
```

---

## Worked example: cart add item

### Store test (Red → Green)

```typescript
// stores/cart.store.test.ts
it('should increment selected count when item is added', async () => {
  jest.mocked(cartService.addCartItem).mockResolvedValue({ cartItemId: 'item-002' })
  jest.mocked(cartService.getSelectedItemsCount).mockResolvedValue({ count: 3 })
  const store = useCartStore()

  await store.addItem({ productId: 1, skuId: 10, quantity: 1 })

  expect(store.selectedCount).toBe(3)
})
```

Implement `useCartStore.addItem()` to call `cartService.addCartItem` and refresh the count.

### View test (Red → Green)

```typescript
// pages/Cart/CartPage.test.ts
it('should render the correct subtotal after quantity change', async () => {
  jest.mocked(cartService.getCartSummary)
    .mockResolvedValueOnce(cartSummary(1))
    .mockResolvedValueOnce(cartSummary(2))

  await renderCart()
  await fireEvent.click((await screen.findAllByLabelText('increase'))[0]!)

  await waitFor(() => expect(screen.getAllByText(/200.000/).length).toBeGreaterThan(0))
})
```

Wire `CartPage.vue` to read from `useCartStore` and re-render on quantity change.
