<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# UI Libraries & Component Modernization Plan

**Top-ranked, actively-maintained open-source libraries to adopt/replace,
mapped to where they upgrade Nesso — with a migration order.**

</div>

---

## Guiding rule
Adopt a library only when it removes hand-rolled code OR adds polish we'd
otherwise re-invent. Everything below is MIT/Apache, Expo/Next compatible,
and widely used (high GitHub stars + weekly downloads).

---

## WEB (Next.js dashboard + portal)

### Already in (keep, use more)
| Lib | Use today | Expand to |
|---|---|---|
| **tailwindcss** | styling | design-token plugin (done) |
| **@tanstack/react-table** | Farmers/Farms/Crops tables | virtualize big tables (+`@tanstack/react-virtual`) |
| **recharts** | dashboard charts | tooltips, draw-in animation, sparklines |
| **lucide-react** | icons | consistent 1.5-2px stroke everywhere |
| **framer-motion** | landing/portal | list `AnimatePresence`, `layoutId` nav indicator, reveal-on-scroll |
| **cmdk** | ⌘K palette | (done) |
| **sonner** | — (installed, unused) | **adopt as the toast standard** (replace any alert) |
| **next-themes** | dark/light | (done) |

### Recommended ADDITIONS (web)
| Lib | Why | Replaces |
|---|---|---|
| **shadcn/ui** (Radix + Tailwind, copy-in) | Production-grade Dialog, DropdownMenu, Tabs, Tooltip, Select, Switch, Popover, Toast — accessible, themable via our tokens | hand-rolled dropdowns/tabs/dialogs; biggest consistency win |
| **@radix-ui/react-*** (already partially) | a11y primitives under shadcn | ad-hoc menus |
| **@tanstack/react-virtual** | virtualize 200+ row tables | manual pagination only |
| **react-hook-form** + **zod** (zod already in) | typed, validated forms with inline errors + dirty/submit states | the barebones `/new` forms |
| **vaul** | mobile-web bottom sheets / drawers | none |
| **embla-carousel-react** | any image/step carousels | none |

**Biggest web win:** adopt **shadcn/ui** for Dialog/DropdownMenu/Tabs/Select/
Switch/Tooltip/Toast — instantly upgrades every form, menu, and the
account/theme/notification controls to accessible, animated, token-themed
components, and standardizes interaction polish (focus rings, hover, press).

---

## MOBILE (Expo / React Native)

### Already in (keep)
reanimated, gesture-handler, safe-area-context, svg, lucide-react-native,
expo-blur, expo-haptics, nativewind, expo-image, our ThemeProvider + i18n +
ToastProvider.

### Recommended ADDITIONS (mobile)
| Lib | Why | Replaces |
|---|---|---|
| **moti** | declarative enter/exit/press animations in 1 line (wraps reanimated) | hand-written Animated boilerplate |
| **lottie-react-native** | vector hero moments: splash bloom, approve/GRN success ticks, empty-state illustrations, weather glyphs | static SVG / no animation |
| **@gorhom/bottom-sheet** | proper spring sheets w/ backdrop + gestures | ad-hoc `Modal` (Inventory move, pickers) |
| **react-native-maps** (installed) | real polygon editor / farm maps | text-input fallback in AddFarm |
| **@shopify/flash-list** | high-perf lists (recycling) | `FlatList` on long lists |
| **react-native-keyboard-controller** | smooth keyboard avoidance everywhere | per-screen KeyboardAvoidingView quirks |
| **react-native-confetti-cannon** | celebrate (farmer approved, batch shipped) | none |
| **@react-native-community/datetimepicker** | native date pickers | YYYY-MM-DD text inputs in AddCrop/AddActivity |

**Biggest mobile wins:** **moti** (cheap, pervasive micro-animations) +
**lottie-react-native** (a few premium moments) + **@gorhom/bottom-sheet**
(replace the Modal sheets) + **flash-list** (scroll perf on long lists).

---

## Shared / design-system

| Lib | Why |
|---|---|
| **class-variance-authority (cva)** (web has it) | variant-driven component styling (button/badge/chip variants) — formalize the design system |
| **tailwind-merge** (web has it) | safe class merging in shadcn components |
| Token pipeline: **style-dictionary** (optional) | generate Tailwind + NativeWind + RN theme from the single `design-system.tokens.json` so web + mobile never drift |

---

## Component replacement map (what becomes what)

| Hand-rolled today | Replace with |
|---|---|
| Web account/theme dropdown (custom click-outside) | shadcn **DropdownMenu** |
| Web tabs (Farmer profile, Farm detail) | shadcn **Tabs** |
| Web confirm/alert | shadcn **AlertDialog** + **sonner** toast |
| Web form fields (/new) | **react-hook-form** + shadcn **Form/Input/Select/Switch** |
| Web switches in Settings | shadcn **Switch** |
| Mobile `Modal` sheets | **@gorhom/bottom-sheet** |
| Mobile `Alert.alert` notifications | **ToastProvider** (done) |
| Mobile long `FlatList` | **@shopify/flash-list** |
| Mobile date text inputs | **datetimepicker** |
| Mobile hand `Animated` | **moti** |
| Static SVG splash/empties | **lottie-react-native** |

---

## Migration order (low-risk → high-value)

1. **Web sonner toasts** (installed) — standardize feedback. (S)
2. **Web shadcn/ui core** — DropdownMenu, Tabs, Select, Switch, Tooltip, AlertDialog, Form. Re-skin existing usages. (M, biggest consistency win)
3. **Web react-hook-form + zod** on the 3 `/new` forms — sectioned, validated. (M)
4. **Mobile moti** — global press-scale + staggered list entrances. (S)
5. **Mobile @gorhom/bottom-sheet** — Inventory move + pickers. (S-M)
6. **Mobile lottie** — splash + success ticks + empty states (5-6 files). (M)
7. **Mobile flash-list** — swap on Farmers/Farms/Activities/Inventory. (S)
8. **Mobile datetimepicker** — AddCrop/AddActivity. (S)
9. **Token pipeline (style-dictionary)** — optional, prevents web/mobile drift. (M)

Each step is independent and reversible. Pair with the per-screen
polish punch list (audit) + `ANIMATION_UX_PLAN.md` + `PERFORMANCE.md`.

---

## Net effect
- **Web** goes from "token-correct but plain" → fully accessible, animated, consistent component system (shadcn) with validated forms.
- **Mobile** gains pervasive micro-animation (moti), premium moments (lottie), proper sheets, and faster lists — closing the "feels basic" gap.
- One token source → web + mobile stay visually identical forever.
