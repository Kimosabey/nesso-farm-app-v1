# 13 — UX, UI & Accessibility (WCAG 2.2 AA)

This is the rulebook every screen ships against. Pairs with `09-design-system.md` (tokens) and the per-module screen specs.

---

## 1. UX principles (validated)

The 10 we hold ourselves to, drawn from Nielsen's heuristics, Refactoring UI, the Material 3 guidelines, Apple HIG, and field research patterns specific to rural farmer apps.

1. **Visibility of system status.** Every action shows a state within 100ms: optimistic UI update, skeleton, or progress. Offline indicator is always visible when offline.
2. **Match between system and the real world.** Use farmer language ("Add Farm", "Mark Harvested") not engineering language. Date pickers default to today. Numbers in local digit script when locale demands it.
3. **User control and freedom.** Every destructive action is undoable (toast with "Undo" for 5s) or confirms inline. No modal nags.
4. **Consistency and standards.** Same icon = same action across screens. Primary CTA always bottom-right (web) / bottom-center sticky (mobile). Forms never reorder fields between create and edit.
5. **Error prevention.** Inline validation as the user leaves a field (`onBlur`), not on submit. Required fields marked with `*` and `aria-required`. Smart defaults (current GPS, today's date, last-used crop).
6. **Recognition rather than recall.** Recently used inputs/crops surface at the top of pickers. Farmer's own farm map preview shown when picking which farm to log against.
7. **Flexibility and efficiency of use.** Keyboard shortcuts on web (`g f` → Farmers, `n` → new). Mobile swipe-to-act on list rows. Bulk select on tables.
8. **Aesthetic and minimalist design.** One primary action per screen. Cards have at most three CTAs. White space is content.
9. **Help users recognize, diagnose, and recover from errors.** Error messages name the field, explain the rule, suggest the fix. Never just "Invalid input."
10. **Help and documentation.** Inline `<HelpTip>` tooltips on every non-obvious field. Empty states link to the relevant docs.

---

## 2. Cognitive & UX research patterns for this audience

Field officers use phones in glare, gloves, and unstable connectivity. Farmers may be low-literacy. The plan accounts for it:

- **Glanceability:** primary information (next harvest, pending approvals) readable at arm's length in sun — high contrast cards, ≥ 18px body for KPIs.
- **Thumb-zone CTAs:** primary actions in the bottom third of the mobile screen.
- **Voice and image hints:** image-led inputs for ID type pickers (Aadhaar card photo instead of just the word). Optional voice-input on text fields via `expo-speech-recognition`.
- **Progress over completion:** multi-step forms show step counters and let the user save partial drafts. Drafts persist offline.
- **Forgiveness:** undo for 5 seconds on every soft delete. Trash bin (admin only) for 30-day recovery.

---

## 3. WCAG 2.2 AA conformance

Every screen, every theme, every locale. AAA where it's cheap.

### 3.1 Perceivable

- **1.4.3 Contrast (Minimum, AA):** Body text ≥ 4.5:1; large text (≥ 18px regular or 14px bold) ≥ 3:1; UI components and graphical objects ≥ 3:1.
- **1.4.11 Non-text Contrast (AA):** focus rings, input borders, icon-only buttons all ≥ 3:1 against their adjacent background.
- **1.4.12 Text Spacing (AA):** line-height ≥ 1.5× font-size; paragraph spacing ≥ 2×; letter-spacing ≥ 0.12×; word-spacing ≥ 0.16× — verified by overriding via user stylesheet.
- **1.4.13 Content on Hover or Focus (AA):** tooltips dismissible (ESC), hoverable, and persistent until dismissed.
- **1.3.1 Info and Relationships:** semantic landmarks (`header/nav/main/aside/footer`), `<label for>` on every input, table `<caption>` + `<th scope>`.
- **1.3.5 Identify Input Purpose:** `autocomplete` on name/phone/email/address fields.

### 3.2 Operable

- **2.1.1 Keyboard:** every interactive element reachable and operable with keyboard. Custom controls implement Radix-equivalent keyboard semantics.
- **2.1.2 No Keyboard Trap:** modals trap focus *inside* themselves only; ESC closes; focus returns to the trigger.
- **2.4.3 Focus Order:** DOM order = logical reading order; tab order matches.
- **2.4.7 Focus Visible (AA):** 2px ring in `--ring` with 2px offset (3:1 vs background). Never removed.
- **2.4.11 Focus Not Obscured (Minimum, 2.2 AA):** sticky headers/footers never cover the focused element — we add `scroll-padding-top/bottom` matching their heights.
- **2.4.12 Focus Not Obscured (Enhanced, 2.2 AAA):** target where feasible.
- **2.5.3 Label in Name:** the visible label is part of the accessible name (matters for voice control: "tap Save").
- **2.5.7 Dragging Movements (2.2 AA):** every drag (polygon vertex, slider, sortable column) also has a tap/keyboard alternative.
- **2.5.8 Target Size (Minimum, 2.2 AA):** minimum 24×24 CSS px target, with 24px clearance — we use 44×44 as the team standard.
- **2.3.1 Three Flashes:** no element flashes more than 3 times/sec. No strobe animations.
- **2.3.3 Animation from Interactions (AAA target):** every animation respects `prefers-reduced-motion`.

### 3.3 Understandable

- **3.1.1 Language of Page:** `<html lang>` set; client renders correct lang attribute when locale switches.
- **3.2.6 Consistent Help (2.2 A):** the help affordance (chat / docs) is in the same place on every page (topbar right on web; bottom drawer item on mobile).
- **3.3.1 Error Identification:** errors marked `aria-invalid`, linked via `aria-describedby` to the message.
- **3.3.2 Labels or Instructions:** every input has a visible persistent label.
- **3.3.3 Error Suggestion:** when machine-checkable, suggest fixes ("IFSC must look like ABCD0123456").
- **3.3.7 Redundant Entry (2.2 A):** never ask the user to re-enter data already captured this session — pre-fill from prior steps.
- **3.3.8 Accessible Authentication (Minimum, 2.2 AA):** OTP login meets this; we **do not** require copying CAPTCHA characters. Password login allows paste and password-manager autofill. We don't require cognitive function tests.
- **3.3.9 Accessible Authentication (Enhanced, 2.2 AAA):** target — no cognitive test even as an option.

### 3.4 Robust

- **4.1.2 Name, Role, Value:** all custom controls expose proper ARIA roles via Radix / Reach primitives we wrap.
- **4.1.3 Status Messages (AA):** toasts, save-success banners, loading indicators use `role="status"` / `aria-live="polite"`; errors use `role="alert"`.

### Audited contrast table (Light theme)

| Foreground | Background | Ratio | Pass |
|---|---|---|---|
| `#0F1A14` (fg) | `#FAFDFA` (bg) | 16.4 : 1 | AAA |
| `#4A5A52` (fg-muted) | `#FAFDFA` (bg) | 7.0 : 1 | AAA |
| `#FFFFFF` | `#0D783C` (primary) | 5.6 : 1 | AA Large+Normal |
| `#0F1A14` | `#F1D412` (accent) | 11.2 : 1 | AAA |
| `#0D783C` (link) | `#FAFDFA` | 5.4 : 1 | AA |
| `#B42318` (danger) | `#FAFDFA` | 5.3 : 1 | AA |
| `#0D783C` ring | `#FAFDFA` | 5.4 : 1 | AA (non-text) |
| `--border-strong` `#BFCFC6` | `#FAFDFA` | 1.4 : 1 | (decorative — must not encode info alone) |

### Audited contrast table (Dark theme)

| Foreground | Background | Ratio | Pass |
|---|---|---|---|
| `#FAFDFA` (fg) | `#0A1410` (bg) | 16.7 : 1 | AAA |
| `#A8B7AE` (fg-muted) | `#0A1410` (bg) | 7.6 : 1 | AAA |
| `#5DB683` (primary on dark) | `#0A1410` | 6.7 : 1 | AAA |
| `#F8E353` (accent) | `#0A1410` | 12.1 : 1 | AAA |
| `#FAFDFA` | `#0D783C` | 5.6 : 1 | AA Large+Normal |
| `#FF6B5B` (danger) | `#0A1410` | 5.8 : 1 | AA |
| `#5DB683` ring | `#0A1410` | 6.7 : 1 | AAA (non-text) |

All ratios re-verified in CI via `pa11y-ci` (web) and an Axe rule pack in unit tests.

---

## 4. Motion safety

- All non-essential animations gated by `prefers-reduced-motion: reduce` (web) or `AccessibilityInfo.isReduceMotionEnabled()` (mobile).
- When reduced motion is on: durations → 0ms, transforms become opacity-only; auto-playing background animations stop and become static.
- No parallax. No autoplay video. No vestibular triggers (zoom, slide-on-scroll).
- Loading shimmers run at 1400ms (slow enough to avoid distraction); reduced motion swaps shimmer for a static neutral skeleton.

---

## 5. Color usage rules

- **Never use color alone** to convey meaning. Status badges have an icon and a text label.
- Charts always include a legend with patterns or shapes; categorical color sequences are tested under Daltonize for protanopia and deuteranopia.
- Form errors combine: red border + danger icon + textual message under the field.
- Selected states combine: filled background + check icon + accessible name change.

---

## 6. Internationalization layout rules

- All strings keyed; never concatenate fragments to form sentences (use ICU `{var}` interpolation).
- Plural forms via i18next `plural`.
- Text expansion: layouts tested with strings 40% longer than English (German, Tamil tend to expand); flexible widths, `truncate` only on non-critical metadata.
- Numbers, dates, currencies formatted via `Intl.*` (web) / `expo-localization` (mobile).
- RTL-ready (no fixed `left/right`, prefer `start/end` logical properties).

---

## 7. Forms

- Single-column, labeled-above, ≥ 44px touch targets, persistent labels.
- Show validation status inline as soon as the field loses focus AND has been touched.
- Required-field indicator: `*` after the label + `aria-required="true"`.
- Submit button: enabled even when invalid, but on click the first invalid field receives focus and announces (don't gray-out — users get stuck).
- Multi-step: show step count, allow backward navigation, persist drafts to local storage.
- Numbers, phones, ID fields use `inputmode` and `enterkeyhint` for the right mobile keyboard.

---

## 8. Tables (web)

- Sticky header, scroll body, virtualization at ≥ 100 rows.
- Sort/filter state in URL — copy-pasteable.
- Empty state inside the table with a clear next action.
- Bulk-select with keyboard (Shift+arrow), accessible announcements of selection count.
- Column visibility toggles persist per-user (server pref).
- Mobile breakpoint: tables collapse to stacked cards.

---

## 9. Navigation patterns

- Web: Sidebar (icons + labels) + top breadcrumb on detail pages. Active route's highlight has 3:1 contrast border.
- Mobile: bottom tabs + push stack. Back gesture supported. Deep links resolve to specific entities.

---

## 10. Performance budgets (UX-affecting)

| Surface | LCP | INP | CLS |
|---|---|---|---|
| QR portal `/t/[code]` | < 1.5s | < 100ms | < 0.05 |
| Web dashboard `/` | < 2.5s | < 150ms | < 0.10 |
| Web table pages | < 2.5s | < 200ms | < 0.10 |
| Mobile cold start | < 3.0s | – | – |

If any budget regresses by >10%, the PR is blocked.

---

## 11. Validation pipeline (UI/UX guardrails in CI)

1. **Type & lint:** `pnpm typecheck && pnpm lint` (eslint-plugin-jsx-a11y on web).
2. **A11y unit:** Vitest + `jest-axe` on every shared component.
3. **A11y e2e:** Playwright + `@axe-core/playwright` on every page in the dashboard sweep.
4. **A11y mobile:** Detox + `react-native-accessibility-engine` on critical screens.
5. **Visual regression:** Chromatic (web) + Storybook screenshots (mobile via Storybook for RN).
6. **Performance:** Lighthouse CI on dashboard + portal, budgets enforced.
7. **Color/contrast diff:** When a token changes, a script re-runs the contrast matrix and fails if any pair drops below AA.
8. **Reduced-motion tests:** snapshot critical animations under `prefers-reduced-motion: reduce` to confirm collapse to opacity-only.

---

## 12. Modern UI library inventory (one source per concern)

| Need | Library | Notes |
|---|---|---|
| Web headless primitives | **Radix UI** | Underpins shadcn/ui |
| Web styled primitives | **shadcn/ui** | Copy-in, no runtime lock-in |
| Web motion | **Framer Motion** | – |
| Web tables | **TanStack Table v8** | – |
| Web forms | **react-hook-form** + **Zod** | – |
| Web charts | **Recharts** | – |
| Web sheets | **Vaul** | Bottom sheet for modals |
| Web command palette | **cmdk** | – |
| Web carousel (rare) | **embla-carousel** | – |
| Web date | **react-day-picker** | – |
| Web maps | **react-leaflet** | – |
| Web rich text (notes) | **TipTap** | If activity notes need formatting |
| Web file upload | **react-dropzone** + S3 pre-signed | – |
| Web toasts | **sonner** | – |
| Web auth UI | shadcn forms | – |
| Web theme switch | next-themes / our own | – |
| Web icons | **lucide-react** | – |
| Web a11y testing | **@axe-core/playwright**, **jest-axe** | – |
| Mobile UI | **NativeWind** | Tailwind for RN |
| Mobile motion | **react-native-reanimated 3** + **react-native-gesture-handler** | – |
| Mobile bottom sheet | **@gorhom/bottom-sheet** | – |
| Mobile lists | **@shopify/flash-list** | – |
| Mobile forms | **react-hook-form** + Zod | – |
| Mobile charts | **react-native-svg-charts** or **victory-native** | Pick one in week 1 |
| Mobile maps | **Leaflet in react-native-webview** | – |
| Mobile date | **@react-native-community/datetimepicker** | – |
| Mobile push | **expo-notifications** | – |
| Mobile splash | **expo-splash-screen** + **lottie-react-native** | – |
| Mobile haptics | **expo-haptics** | – |
| Mobile a11y | RN built-ins + **react-native-accessibility-engine** | – |

Anything not on this list needs a written justification before adoption.
