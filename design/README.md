# HiveSpace Design System

A reusable set of tokens, components, and layouts extracted from the HiveSpace SaaS suite. Designed to make producing on-brand mocks fast and consistent — drop in `colors_and_type.css`, reuse the components, and ship.

## What HiveSpace is

HiveSpace is a **multi-tenant e-commerce platform** built as three coordinated surfaces, all sharing the `@hivespace/shared` UI library:

| Surface | Audience | Role |
|---|---|---|
| **Storefront** (`hivespace.storefront`) | Shoppers | Public-facing buying experience — browse, search, cart, checkout, profile |
| **Seller Center** (`hivespace.sellercenter`) | Merchants | Back-office for sellers — products, inventory, orders, promotions |
| **Admin Portal** (`hivespace.adminportal`) | System operators | Platform administration — accounts, permissions, configuration, audits |

The admin and seller surfaces share an identical layout skeleton (sidebar + top-bar + breadcrumbed card-based page) but differ in navigation, palette emphasis, and density. The storefront is a fully separate customer-facing surface with its own layout language (headered marketing pages, product grids, checkout flow).

## Brand in two lines

- **Logo mark:** a layered hex — inner hex filled with a purple→cyan gradient (`#7D49F9 → #45B7FE`), outer hex outlined with a brand→magenta gradient (`#465FFF → #B44197`). The wordmark is set in gray-900 (light theme) or white (dark).
- **Primary color:** `--brand-500 #465fff` (indigo). Everything interactive — buttons, links, focus rings, selected states — lives in this hue.

## Files in this system

```
/colors_and_type.css   ← drop-in tokens + base typography. Import first.
/assets/               ← official logo SVGs (light, dark, icon-only)
/index.html            ← this preview; opens the design system dashboard
/ui_kit_*.html         ← per-surface UI kits showing real components in context
/preview_*.html        ← small cards used by the Design System tab
/SKILL.md              ← machine-readable rules for using this system
README.md              ← you are here
```

## Principles (read before designing)

1. **Use the token palette, not vibes.** The app ships Tailwind classes backed by the exact hex values in `colors_and_type.css`. If a new color feels necessary, use OKLCH derived from `--brand-500` rather than inventing a new primary.
2. **Montserrat is the voice.** All three surfaces use Montserrat as primary (Inter is loaded as fallback on the storefront). Never swap to Inter as a stylistic choice — only as a platform fallback.
3. **Radii are disciplined.** `rounded-lg` (8px) for form controls and buttons. `rounded-xl` (12px) for cards. `rounded-full` for pills, badges, icon buttons, and avatars. That's it.
4. **Cards have a border, not a shadow.** `hivespace.ui-shared` renders its `ComponentCard` with `border border-gray-200 bg-white`. The shadow tokens exist but are reserved for modals, dropdowns, and toasts.
5. **Density matches the audience.** Admin + Seller pages use `h-11` inputs and `px-5 py-3` buttons. Storefront uses the same components but breathes more — larger hero type, wider gutters, richer product imagery.
6. **Status colors are semantic.** `success/warning/error/info` never get used for branding. Don't reach for `--success-500` to make something feel fresh.
7. **Dark mode is a first-class theme.** Every token has a dark counterpart (`--surface-card-dark`, `--text-primary-dark`). Design for both or explicitly pick one up front.

## Quick start

```html
<link rel="stylesheet" href="colors_and_type.css">
<button class="hs-btn hs-btn-primary">Save changes</button>
```

See the component kits for full patterns.
