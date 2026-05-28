# 09 — Design System

Shared across web dashboard, QR portal, and mobile. Implemented as `packages/design-system` exporting:
- Tailwind preset (`tailwind-preset.js`) — single source of truth for tokens
- NativeWind config for mobile (consumes the same preset)
- Headless / styled primitives (`<Button>`, `<Input>`, `<Card>`, `<Badge>`, `<Avatar>`, `<DataTable>`, `<Toast>`, `<Modal>`, `<Sheet>`, `<Dialog>`, `<Skeleton>`, `<EmptyState>`)
- Icon set wrappers (lucide-react on web, Ionicons on mobile)
- Motion presets (Framer Motion on web, Reanimated 3 on mobile) with reduced-motion gating

> Companion doc: `13-ux-accessibility.md` — UX principles, WCAG 2.2 checklist, motion safety, internationalization layout rules. Read both together.

---

## 1. Brand palette (validated)

Source of truth: `../palette.txt` (Coolors export). All other color references derive from these.

| Token | Hex | Name | Role |
|---|---|---|---|
| `--color-primary` | `#0D783C` | **Turf Green** | Primary brand (CTAs, active states, focus rings) |
| `--color-primary-2` | `#207647` | **Turf Green 2** | Primary hover / gradient stop |
| `--color-accent` | `#F1D412` | **Golden Glow** | Accent (highlights, badges, harvest CTAs) |
| `--color-secondary` | `#518E6D` | **Jungle Teal** | Secondary (chips, secondary buttons, charts series 2) |
| `--color-surface-light` | `#FAFDFA` | **Porcelain** | Light theme background |
| `--color-on-primary` | `#FFFFFF` | **White** | Text/icons on primary |

### Derived steps

Generated in Tailwind preset as a 50-950 scale per base color (using `oklch()` mixing for perceptual uniformity). Examples:

```
primary:   50 #EAF6EE  100 #C9E8D3  300 #5DB683  500 #0D783C  600 #0A6232  700 #084E28  900 #032816
secondary: 50 #EEF5F1  100 #D3E5DB  300 #7FB496  500 #518E6D  700 #345C47  900 #1B2F24
accent:    50 #FFFCEB  100 #FDF4B3  300 #F8E353  500 #F1D412  700 #B69D08  900 #5A4E04
```

### Semantic colors (per theme)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FAFDFA` (Porcelain) | `#0A1410` | App background |
| `--bg-elevated` | `#FFFFFF` | `#101C16` | Cards, sheets |
| `--bg-muted` | `#F1F5F2` | `#162720` | Subtle fills, table stripes |
| `--fg` | `#0F1A14` | `#FAFDFA` | Primary text |
| `--fg-muted` | `#4A5A52` | `#A8B7AE` | Secondary text |
| `--fg-subtle` | `#7A8A82` | `#7A8A82` | Tertiary text, placeholders |
| `--border` | `#DDE6E0` | `#1F2D26` | Hairline dividers |
| `--border-strong` | `#BFCFC6` | `#2E3F37` | Input borders, table dividers |
| `--ring` | `#0D783C` | `#5DB683` | Focus ring |
| `--success` | `#0D783C` | `#5DB683` | Done / Completed |
| `--warning` | `#B69D08` | `#F8E353` | Planned / In progress |
| `--danger` | `#B42318` | `#FF6B5B` | Overdue / Destructive |
| `--info` | `#0E7490` | `#67E8F9` | Info / Neutral status |
| `--accent` | `#F1D412` | `#F8E353` | Highlights, harvest CTA |
| `--glass-bg` | `rgba(255,255,255,0.6)` | `rgba(16,28,22,0.55)` | Glassmorphism surface |
| `--glass-border` | `rgba(13,120,60,0.18)` | `rgba(93,182,131,0.22)` | Glass edge |

All semantic pairs are validated against **WCAG 2.2 AA** at 4.5:1 for body text and 3:1 for large text and non-text UI components. See `13-ux-accessibility.md` for the audited contrast table.

### Status palette (charts, badges)

Cycle for categorical charts:
1. `#0D783C` (primary)
2. `#518E6D` (secondary)
3. `#F1D412` (accent)
4. `#0E7490` (info)
5. `#B42318` (danger)
6. `#9333EA` (extra — purple)

Never use red/green as the *only* differentiator (color-blind safety) — always pair with shape, icon, or label.

---

## 2. Theme system

- **Two themes by design:** `light` (default) and `dark`. Both are first-class — every component is verified on both.
- **System theme** is the implicit third mode (`prefers-color-scheme`) — picks light/dark automatically and respects user OS changes.
- Theme is stored:
  - Web: HTTP-only cookie + `data-theme` on `<html>` (so SSR renders correctly; no flash)
  - Mobile: MMKV + `Appearance.addChangeListener` so OS toggles propagate
- All color references go through CSS variables — **never** hardcode hex in components.

### Tailwind config (excerpt)

```js
// packages/design-system/tailwind-preset.js
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elevated': 'var(--bg-elevated)',
        fg: 'var(--fg)',
        muted: 'var(--fg-muted)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          fg: 'var(--color-on-primary)',
        },
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
        ring: 'var(--ring)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
};
```

### Flash-of-unstyled-theme prevention

A tiny inline script in `<head>` reads the `theme` cookie and sets `data-theme` before React hydrates. Mobile uses Expo's `expo-splash-screen` to hold the splash until theme + i18n are resolved.

---

## 3. Typography

Per the Nesso PRD:

| Use | Font | Self-hosted? |
|---|---|---|
| Headings | **Montserrat** (500, 600, 700) | yes, via `next/font` |
| Body & UI | **Inter** (400, 500, 600) | yes, via `next/font` |
| Numerics | Inter Tabular Nums (`font-feature-settings: 'tnum'`) | – |
| Code / IDs | JetBrains Mono | yes |

Mobile uses Expo's `expo-font` to bundle Inter + Montserrat WOFF2; falls back to system stack until loaded.

Scale (matches `text-*` Tailwind utilities, line-height tuned for readability):

| Token | Size / Line | Use |
|---|---|---|
| `text-xs` | 12 / 18 | meta, captions |
| `text-sm` | 14 / 22 | secondary body |
| `text-base` | 16 / 26 | body |
| `text-lg` | 18 / 28 | lead paragraphs |
| `text-xl` | 20 / 30 | section heading |
| `text-2xl` | 24 / 34 | page heading |
| `text-3xl` | 30 / 38 | hero subheading |
| `text-4xl` | 36 / 44 | hero |
| `text-5xl` | 48 / 56 | marketing hero only |

Body text never below 14px. Buttons and inputs use `text-sm` minimum on mobile, `text-base` on web.

Letter spacing: `tracking-tight` (-0.01em) on display sizes only; normal everywhere else.

---

## 4. Spacing, radii, elevation, sizing

**Spacing scale** = Tailwind default (4px grid).
- Card inner padding: `p-4` (mobile) / `p-6` (web)
- Section gap: `gap-6`
- List row vertical padding: `py-3`
- Form field gap: `gap-4`

**Radii**

| Token | Value | Use |
|---|---|---|
| `rounded-sm` | 4px | inline chips |
| `rounded-md` | 8px | inputs, buttons (default) |
| `rounded-lg` | 12px | cards |
| `rounded-xl` | 16px | feature cards |
| `rounded-2xl` | 20px | hero cards, modals |
| `rounded-3xl` | 28px | mobile sheets |
| `rounded-full` | 9999px | avatars, FAB, pill badges |

**Elevation (shadows)** — same tokens both themes, but dark theme uses lower opacity to avoid muddy stacks:

| Token | Light | Dark |
|---|---|---|
| `shadow-xs` | 0 1px 2px rgba(0,0,0,0.04) | 0 1px 2px rgba(0,0,0,0.5) |
| `shadow-sm` | 0 2px 6px rgba(0,0,0,0.06) | 0 2px 6px rgba(0,0,0,0.55) |
| `shadow-md` | 0 6px 16px rgba(0,0,0,0.08) | 0 6px 16px rgba(0,0,0,0.6) |
| `shadow-lg` | 0 16px 32px rgba(0,0,0,0.10) | 0 16px 32px rgba(0,0,0,0.65) |
| `shadow-glow` | 0 0 0 4px rgba(13,120,60,0.18) | 0 0 0 4px rgba(93,182,131,0.28) |

**Touch targets** ≥ 44 × 44 (WCAG 2.2 SC 2.5.8 *Target Size (Minimum)*).
**Hit slop** on icon buttons (mobile) uses `hitSlop: 8` to extend tap area without inflating the visual size.

---

## 5. Iconography

- **Web:** `lucide-react` — outline 1.5px stroke, sized to text (16/20/24).
- **Mobile:** Ionicons via `@expo/vector-icons` for parity with FoodSign.
- Shared `<Icon name="…">` wrapper maps semantic names to platform implementations so consumers don't import the library directly.
- Icons get `aria-hidden="true"` when paired with a text label; otherwise an `aria-label`.

---

## 6. Components contract

Each primitive ships web (`*.tsx`) and mobile (`*.native.tsx`) implementations with identical props.

| Component | Web | Mobile |
|---|---|---|
| Button (variants: primary/secondary/ghost/outline/destructive; sizes: sm/md/lg/icon) | shadcn Button | NativeWind `Pressable` |
| Input | shadcn Input | NativeWind `TextInput` |
| Card | div + Tailwind | View + NativeWind |
| Modal / Dialog | Radix Dialog | RN `Modal` |
| Sheet (bottom) | Vaul | `@gorhom/bottom-sheet` |
| Toast | sonner | custom Reanimated slide |
| Tooltip | Radix Tooltip | `react-native-tooltip-2` (long press) |
| Badge | shadcn Badge | View + Text |
| Avatar | shadcn Avatar | Image + initials fallback |
| Tabs | Radix Tabs | `@react-navigation/material-top-tabs` |
| Accordion | Radix Accordion | RN `LayoutAnimation` |
| Skeleton | Tailwind + `animate-pulse` | RN + Reanimated shimmer |
| Date picker | react-day-picker | `@react-native-community/datetimepicker` |
| Combobox / Command | cmdk | custom modal list |
| Select | Radix Select | RN `ActionSheetIOS` / custom modal |
| Slider | Radix Slider | RN community Slider |
| Switch | Radix Switch | RN Switch |
| Progress | Radix Progress | `react-native-progress` |
| Tag input | custom | custom |

All states implemented: `default / hover / focus-visible / active / disabled / loading / error / readonly`.

---

## 7. Motion & animation

Modern, restrained, **purposeful** — never decorative-only. Every animation honors `prefers-reduced-motion` (web) and `AccessibilityInfo.isReduceMotionEnabled()` (mobile) — when enabled, durations collapse to 0 and transforms become opacity-only.

### Libraries

| Surface | Library | Why |
|---|---|---|
| Web | **Framer Motion** | Industry standard, declarative variants, layout animations. |
| Web (page transitions) | Next.js `loading.tsx` + Framer `AnimatePresence` | Smooth route changes without flash. |
| Mobile | **react-native-reanimated v3** + **react-native-gesture-handler** | 60fps on UI thread. |
| Mobile lists | `@shopify/flash-list` | Smooth virtualized scroll. |
| Mobile shared element | `react-native-shared-element` (Reanimated v3 compatible) | Polished detail transitions. |
| Web charts entrance | Recharts built-in + Framer Motion overlay | – |
| Lottie (rare) | `lottie-react-native` / `lottie-react` | Splash mascot only, < 80 KB JSON. |

### Duration & easing tokens

| Token | Value | Use |
|---|---|---|
| `motion-fast` | 120ms · cubic-bezier(0.4, 0, 0.2, 1) | Hover, focus |
| `motion-base` | 200ms · cubic-bezier(0.4, 0, 0.2, 1) | Most transitions |
| `motion-slow` | 320ms · cubic-bezier(0.32, 0.72, 0, 1) (spring-y) | Sheet/modal entries, layout |
| `motion-spring` | spring(stiffness: 320, damping: 30) | Reanimated draggable, FAB |
| `motion-stagger` | 40ms | List item entrance stagger |

### Patterns

1. **Page transitions (web):** 200ms cross-fade + 8px y-slide on Server Component swap.
2. **Modals / sheets:** 320ms spring scale-up from 0.96 to 1 + fade-in. Backdrop fades in 200ms.
3. **List entrance:** items stagger in (40ms each, opacity 0→1, y +6→0). Capped at 8 items animated; rest snap.
4. **Pull-to-refresh (mobile):** Reanimated-driven elastic scale of the brand spinner.
5. **Skeleton shimmer:** linear-gradient sweep over `--bg-muted`, 1400ms loop.
6. **Toast:** slide-in from bottom-center (mobile) / bottom-right (web), bounce damping, auto-dismiss progress bar across the bottom edge.
7. **FAB press:** scale 0.96, 80ms; haptic `Haptics.ImpactFeedbackStyle.Light` on iOS.
8. **Number transitions** (KPI cards): tween over 600ms using `react-spring`-style hooks.
9. **Map polygon draw:** vertices fade-pop in (120ms each, scale 0.6→1).

### Backgrounds & ambient motion

- **Hero glow:** a soft conic-gradient blur behind the primary CTA on auth & landing — pure CSS, GPU-accelerated, zero JS.
- **Aurora background** (optional, marketing & QR portal hero): animated noise + gradient via CSS only, no library. Pauses when offscreen via `IntersectionObserver`.
- **Particles / parallax:** **not used.** Avoid for performance and motion-safety reasons. Static SVG illustrations preferred.
- Mobile screens never autoplay full-screen video.

---

## 8. Splash screens

### Mobile (Expo)

- `expo-splash-screen` shows a static brand splash on cold start.
- Splash design: full-bleed `--color-primary` background; centered Nesso logo with a 1px hairline ring; a 2-second-loop **Lottie** logomark reveal (logo strokes paint in) — animation autoplays once, then frame holds until JS is ready.
- `SplashLoading.tsx` keeps the splash visible until: i18n loaded, theme resolved, token check finished, SQLite migrated, network status known.
- Falls back to a static PNG if Lottie fails.
- iOS dark/light splash variants supplied (`splash-dark.png`, `splash-light.png`).

### Web

- App shell renders an inline SVG logo + skeleton layout server-side (no spinner flash).
- Login route gets a soft animated backdrop (CSS-only gradient drift) and a glassmorphic auth card.
- QR portal uses an instant hero (SSG) — no splash, just LCP-optimized content.

---

## 9. Layout patterns

### Web grid

- Container max-widths: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
- Dashboard uses a 12-column grid on `lg+`, stacks on `md` and below.
- Sidebar: 256px expanded / 72px collapsed; persistent on `lg+`, drawer on `md` and below.
- Topbar: 64px height, sticky.
- Tables responsive: card list on `sm`, dense table on `md+`.

### Mobile

- Safe-area aware (`react-native-safe-area-context`).
- Bottom tab height 58 + bottom inset.
- Forms use single-column layout with sectioned cards.
- Bottom sheets preferred over centered modals for primary actions on phone.

### RTL

- All layouts support RTL automatically via Tailwind's `rtl:` and React Native's `I18nManager.allowRTL`.
- The current 12 languages are all LTR, but the system is ready for Arabic/Urdu later.

---

## 10. Empty / loading / error states

Three standardized components used everywhere:

- `<EmptyState icon title description action />` — uses a brand illustration (SVG, 160×120).
- `<LoadingState skeleton="list|card|chart" rows={5} />` — never a bare spinner where a shape is known.
- `<ErrorState title description onRetry />` — for failed fetches; includes Sentry "Report issue" link in dev.

---

## 11. Toasts & feedback

| Variant | Icon | Default duration |
|---|---|---|
| `success` | check-circle | 3 s |
| `error` | alert-octagon | 5 s |
| `info` | info | 3 s |
| `warning` | alert-triangle | 4 s |

Anchor: bottom-right (web, desktop), bottom-center (web, mobile breakpoint), bottom-center with safe-area inset (mobile native). All include a focusable close affordance and an `aria-live="polite"` region.

---

## 12. Chart system

Recharts (web) + react-native-svg-charts (mobile). All charts share:

- Grid `stroke="var(--border)"`, opacity 0.4
- Axes `text-xs` and `--fg-muted`
- Tooltip uses `bg-bg-elevated`, `shadow-lg`, `rounded-lg`, `text-sm`
- Animations entrance 600ms (skipped under reduced motion)
- Legend bottom-aligned with 12px gap

Standard chart wrappers exported from `design-system/charts`:
- `ActivityProgressDonut`
- `PracticesPie`
- `FarmerGroupsPie`
- `MonthlyTrendsLine`
- `ProcurementValueBar`
- `HarvestForecastArea`

---

## 13. Tokens are the contract

If a screen needs a color, radius, shadow, font size, duration, or easing that isn't in the preset — **add a token, don't hardcode**. The design-system package is the single seam for visual change; adding a token forces a 5-minute review of how it fits into both themes.

See `13-ux-accessibility.md` for the principles and WCAG 2.2 conformance checklist that bind every token decision.
