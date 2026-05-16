# HiveSpace Design System — Skill Guide

When making a HiveSpace mock (storefront, seller center, admin portal, or marketing surface), follow these rules. This file is the machine-readable contract that goes with `README.md`.

## Setup

Every HiveSpace mock starts with:

```html
<link rel="stylesheet" href="colors_and_type.css">
<link rel="stylesheet" href="components.css">
```

This gives you: CSS variables for the full palette, Montserrat + Inter loaded from Google Fonts, base body styles, and class-based ports of Button / Badge / Input / Card / Table / Checkbox / Radio / Toggle / Alert / Tabs / Pagination / Breadcrumb / Sidebar item.

## Tokens you MUST use

| What | Token | Value | Use for |
|---|---|---|---|
| Primary | `--brand-500` | `#465FFF` | buttons, links, focus, selected states |
| Primary hover | `--brand-600` | `#3641F5` | button:hover |
| Brand gradient | `#465FFF → #B44197` | linear 90deg | hero moments, logo outer |
| Inner gradient | `#7D49F9 → #45B7FE` | linear 90deg | logo inner hex, illustrations |
| Body bg | `--gray-50` | `#F9FAFB` | page background |
| Card bg | `#FFFFFF` | | cards, table, modal |
| Card border | `--gray-200` | `#E4E7EC` | every card, every row separator |
| Text primary | `--gray-900` | `#101828` | headings, important copy |
| Text secondary | `--gray-700` | `#344054` | labels, nav items |
| Text muted | `--gray-500` | `#667085` | help text, timestamps, placeholder |
| Input border | `--gray-300` | `#D0D5DD` | input, select, textarea |
| Focus ring | `--shadow-focus-ring` | `0 0 0 4px rgba(70,95,255,0.12)` | all focus states |

Status: `--success-500 #12B76A`, `--warning-500 #F79009`, `--error-500 #F04438`, `--info-500 #0BA5EC`. Backgrounds use the matching `-50` step.

## Typography

- Family: **Montserrat** (400/500/600/700). Inter is loaded as a fallback — never pick it intentionally.
- Headings: 600 weight, `letter-spacing: -0.01em`.
- Display (>30px): 700 weight, `letter-spacing: -0.02em`.
- Body: 14px / 20px line-height by default; 16px on marketing copy.
- Use the `.hs-title-*` and `.hs-text-*` utility classes if you want the exact app scale.

## Radii

| Context | Value | Class |
|---|---|---|
| Buttons, inputs, selects | 8px | `rounded-lg` / inline `border-radius:8px` |
| Cards, modals, sections | 12px | `rounded-xl` |
| Pills, badges, avatars, icon-buttons | 9999px | `rounded-full` |
| Section containers (hero, marketing) | 16–24px | larger is ok for marketing, never for app chrome |

## Components — quick reference

### Buttons
```html
<button class="hs-btn hs-btn-primary">Save</button>
<button class="hs-btn hs-btn-primary-outline">Save</button>
<button class="hs-btn hs-btn-outline">Cancel</button>
<button class="hs-btn hs-btn-danger">Delete</button>
<button class="hs-btn sm hs-btn-primary">Small</button>
<button class="hs-btn hs-btn-icon hs-btn-outline"><svg…/></button>
```
Variants: `primary`, `primary-outline`, `outline`, `ghost`, `secondary`, `danger`, `success`, `warning`. Sizes: default (h-11), `.sm` (h-9).

### Badges
```html
<span class="hs-badge hs-badge-success">Paid</span>
<span class="hs-badge sm hs-badge-warning">● Pending</span>
<span class="hs-badge hs-badge-solid hs-badge-primary">Featured</span>
```
Colors: `primary`, `success`, `warning`, `error`, `info`, `light`, `dark`. Add `.hs-badge-solid` for filled.

### Inputs
```html
<label class="hs-label hs-label-required">Email</label>
<input class="hs-input" type="email">
<div class="hs-error-text">Required.</div>
```
Always 44px tall. Add `.hs-input-error` for the red state. Use `<select class="hs-select">` and `<textarea class="hs-textarea">` — same look.

### Cards
```html
<div class="hs-card">
  <div class="hs-card-header">
    <h3 class="hs-card-title">…</h3>
    <button class="hs-btn sm hs-btn-outline">Action</button>
  </div>
  <div class="hs-card-body">…</div>
</div>
```

### Tables — use for data, not for layout
```html
<table class="hs-table">
  <thead><tr><th>…</th></tr></thead>
  <tbody><tr><td>…</td></tr></tbody>
</table>
```
Rows hover gray-50. Headers are 12px uppercase gray-500. Keep cells 16px padding vertical.

### Sidebar nav item
```html
<div class="hs-sidebar-item active"><svg…/>Dashboard</div>
<div class="hs-sidebar-item"><svg…/>Orders</div>
```

## Surface rules

### Storefront (`ui_kit_storefront.html`) — Shopee-esque
- Radii are **SHARPER** here (2–4px, not the app's 8–12px). Product cards, search box, buttons in the hero use `border-radius: 2px`.
- Header: thin topbar (seller link, app, follow, lang, sign in/up) + big search row (logo + `bg-white` search with `bg-brand-500` submit button + cart icon with `brand-500` badge).
- Hero: flex split **3/4 main carousel + 1/4 two stacked side banners**, 400px tall. Main uses brand gradient with eyebrow + 44px title + CTA row + carousel dots.
- Category bar: `grid-cols-9`, each cell is a circular 64px avatar above tiny centered name, with 1px gray-100 dividers.
- Product card: `rounded-sm`, 1:1 image, `#ffd839/#ee4d2d` yellow discount tag top-right, `#d0011b` Mall / `#ee4d2d` Preferred ribbon top-left, `#00bfa5` "Miễn phí trả hàng" pill, price in `#ee4d2d` with tiny `₫` prefix, "Đã bán Nk" sold count.
- Footer: white background (not gray-900), 4 columns — Customer service / About / Payment+Logistics / Follow+App with QR.

### Seller Center (`ui_kit_seller.html`)
- 260px white sidebar with a branded **shop chip** at top (brand→pink gradient, avatar + shop name + tier).
- 68px white topbar: search (flex 1, max 480px), import CSV, notification bell, language, user chip.
- Main: breadcrumb → page title → KPI stats (4 × 16px-padded cards) → filtered table.
- Use `--warning` tones for "Low stock", `--error` for "Critical".

### Admin Portal (`ui_kit_admin.html`)
- Same shell as Seller but **no shop chip** — nav is platform-level (Accounts, Merchants, Audit, Configuration).
- KPIs use delta chips (up/down) in success/error.
- Right rail shows recent activity with colored dots.
- Tables are denser — avatar + email + role in the first cell.

## Do / Don't

✅ Always load Montserrat (`colors_and_type.css` does this for you)
✅ Use `--gray-50` body, `#fff` card, `--gray-200` border — that's the app's default elevation
✅ Render status pills as `rounded-full` with a 6px leading dot
✅ Keep icon-buttons circular (44px or 36px)
✅ Wrap ordered flows (checkout, onboarding) with numbered circular step indicators in `--brand-500`

❌ Don't introduce new primary colors — use `--brand-500` or a darker/lighter step from the brand ramp
❌ Don't use Inter as a deliberate choice — it's a fallback only
❌ Don't add drop-shadows to cards — use a 1px border instead
❌ Don't mix radii — if a card is 12px, don't give it 16px; if a button is 8px, don't give it 6px
❌ Don't use `--success-500` for branding or accents — it only means "something is OK"
❌ Don't put action buttons wider than 3 in a row — stack or drop into a menu

## Available files

- `colors_and_type.css` — tokens + Google-Fonts imports + base body styles + utility classes
- `components.css` — every component as plain CSS
- `assets/logo-light.svg`, `logo-dark.svg`, `logo-icon.svg` — official marks
- `index.html` — design-system dashboard
- `preview_*.html` — single-slice previews (brand logo, type, colors, spacing, components)
- `ui_kit_storefront.html`, `ui_kit_seller.html`, `ui_kit_admin.html` — full surface kits
- `README.md` — human-facing introduction and principles
