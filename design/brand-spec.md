# HiveSpace brand spec

Source: `E:\Project\HivespaceProject\hivespace.design-ui\README.md`, `colors_and_type.css`, `components.css`, `ui_kit_admin.html`, `ui_kit_seller.html`, `ui_kit_storefront.html`

## Tokens

```css
:root {
  --bg:      oklch(98.46% 0.0017 247.84);
  --surface: oklch(100.00% 0.0000 89.88);
  --fg:      oklch(20.99% 0.0341 263.44);
  --muted:   oklch(54.44% 0.0350 265.11);
  --border:  oklch(92.71% 0.0075 260.73);
  --accent:  oklch(56.80% 0.2369 270.00);
}
```

## Font stacks

- Display: `'Montserrat', 'Inter', 'Roboto', 'Noto Sans Vietnamese', 'Segoe UI', system-ui, -apple-system, sans-serif`
- Body: `'Montserrat', 'Inter', 'Roboto', 'Noto Sans Vietnamese', 'Segoe UI', system-ui, -apple-system, sans-serif`
- Mono: `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace`

## Layout posture

- Use indigo `--accent` as the single interactive hue for buttons, links, focus rings, selected tabs, and active nav states.
- Keep the shell light and border-first: gray-50 app background, white cards and sidebars, 1px gray-200 dividers, shadows reserved for overlays only.
- Preserve the shared admin and seller structure: left sidebar, sticky top bar, breadcrumbed page head, card sections, dense but readable controls at 36-44px tall.
- Hold radii to the existing system: 8px for controls, 10-12px for cards, full pills for badges, avatars, and icon buttons.
- Use gradients sparingly and only for brand moments such as the layered hex logo or seller promo surfaces; core workflows stay flat and operational.

## Working system

Warm-neutral light shell, Montserrat-led interface typography, white bordered surfaces, and a single indigo interactive accent at `oklch(56.80% 0.2369 270.00)`.
