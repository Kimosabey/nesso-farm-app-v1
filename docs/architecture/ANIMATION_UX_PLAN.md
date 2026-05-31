<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Animation, Micro-interaction & Modern UX Plan

**Goal: make Nesso feel alive and premium — buttery micro-animations,
tasteful Lottie moments, a modern toast/feedback system — without
hurting performance. Per-screen, prioritized, with the exact libraries.**

</div>

---

## Libraries (all open-source, Expo-compatible)

| Need | Library | Notes |
|---|---|---|
| Declarative animations / transitions | **moti** (wraps Reanimated 4) | One-liner enter/exit/press; tiny API |
| Low-level / gesture-driven | **react-native-reanimated** (have it) | Already installed; powers moti |
| Vector Lottie animations | **lottie-react-native** | Splash bloom, empty states, success ticks, weather |
| Gestures | **react-native-gesture-handler** (have it) | Swipe-to-approve, pull, sheets |
| Haptics | **expo-haptics** (have it) | Tap/success/error feedback |
| Toasts (modern) | **custom ToastProvider** (built — see below) OR `burnt`/`sonner-native` | Themed, animated, queue |
| Skeleton loaders | **moti/skeleton** | Shimmer placeholders while loading |
| Blur / glass | **expo-blur** (have it) | Glass tab bar, sheets, modals |
| Bottom sheets | **@gorhom/bottom-sheet** | Replace ad-hoc Modals (Inventory move, pickers) |
| Confetti/celebrate | **react-native-confetti-cannon** | Farmer approved / batch shipped moments |

**Web/Portal** already use **framer-motion** — extend with: `motion` layout
animations, `AnimatePresence` for route/list transitions, scroll-linked
(portal already does), `useInView` reveal-on-scroll for landing/feature cards.

---

## Global motion principles

- **Durations**: micro 120–180ms, standard 240–320ms, emphasized 380–500ms.
- **Easing**: `cubic-bezier(0.32, 0.72, 0, 1)` (the spec's signature curve) for entrances; spring (damping 14–18) for playful elements (FAB, count-ups).
- **Press feedback**: every Pressable scales to 0.96–0.97 + optional light haptic.
- **Respect `prefers-reduced-motion`** / a11y "Reduce motion": collapse to 1ms. (Spec + theme.css already honor this on web.)
- **60fps rule**: only animate `transform` + `opacity` (native-driver); never animate layout/`width`/`height` in hot paths.

---

## Per-screen plan — MOBILE

### Auth
- **Splash** — already animated (petal bloom + ring). Upgrade: replace hand-SVG with a **Lottie** seed-to-bloom (1.6s) + logo settle. Reduced-motion → static lockup.
- **Login** — logo `moti` fade+scale-in; fields stagger up (40ms each); button press-scale + success haptic; error shake (translateX keyframe) on failure.
- **OTP** — boxes pop-in on focus (scale 0.9→1 spring); on all-6-filled, auto-verify with a Lottie checkmark; error → shake + haptic error.

### Core
- **Dashboard** — KPI count-ups already; add: cards stagger-in on mount (moti, 60ms delay each); weather card subtle parallax on scroll; FAB pulse already; pull-to-refresh → custom Lottie spinner. Sync chip: animated dot pulse when syncing.
- **Farmers / Farms / lists** — `moti` list-item fade+slide-in (staggered, capped at first ~8); swipe row → quick actions (approve/call) via gesture-handler; skeleton shimmer while loading (moti/skeleton) instead of blank.
- **Verify** — swipe-to-approve / swipe-to-reject cards (Tinder-style, gesture-handler + reanimated); on approve → confetti burst + success toast + Lottie tick.
- **Register wizard** — animated progress bar fill (spring); step transitions slide L/R (moti `AnimatePresence`); "Saved offline" → Lottie cloud-check.

### Detail / feature
- **Farm Details** — polygon "draws" on mount (SVG stroke-dashoffset); tab content cross-fade; map pin drop bounce.
- **Add Farm** — vertex drop pop animation (spec calls for it); area number counts up as you add points.
- **Add Activity** — input picker sheet → `@gorhom/bottom-sheet` (spring snap); qty steppers bounce.
- **Accept GRN** — scanner reticle sweep line (looping), success → green flash + Lottie checkmark + haptic.
- **Weather** — animated weather glyphs (Lottie: sun rays rotate, rain drops fall); temp count-up; hourly strip auto-scroll hint.
- **Harvest Board / Pre-harvest** — progress rings animate to value; cards stagger.
- **Inventory move sheet** — migrate Modal → bottom-sheet; segment switch slides.

### Settings family
- **Theme picker** — selected card morphs (layout animation); live preview swatch.
- **Sync Health** — outbox count rolls; queue rows slide out when drained.
- **Language** — selected ring springs; flag/script fade.

---

## Per-screen plan — WEB (framer-motion)

- **Landing** — aurora blobs (done); `useInView` reveal for hero + feature cards (fade-up, stagger); CTA hover lift; stat-chip count-ups.
- **App shell** — sidebar collapse already transitions; add active-nav indicator that slides between items (`layoutId`); ⌘K palette spring-in (done via cmdk).
- **Dashboard bento** — cards `AnimatePresence` fade+scale on mount; chart draw-in (recharts `isAnimationActive`); KPI count-ups (done).
- **DataTables** — row hover lift; new-row highlight flash; page-change cross-fade; skeleton rows while loading.
- **Approvals** — detail pane slide-in on select; approve → toast + row exit animation.
- **Toasts** — replace any `alert()` with `sonner` (already a dep) — themed, stacked, swipe-dismiss.

## Per-screen plan — PORTAL

- **Trace** — scroll-linked timeline fill (done); add node pop-in on inView; hero parallax; "verified" shimmer (done).
- **Landing** — aurora + reveal-on-scroll; QR card subtle float.

---

## Modern feedback system (toasts / alerts / messages)

**Problem today**: scattered `Alert.alert()` (blocking, OS-ugly) on mobile.

**Solution**: a themed **ToastProvider** (built in this repo — see
`apps/mobile/src/components/Toast.tsx`):
- Variants: `success` (green + tick), `error` (red + x), `info` (teal + i), `loading` (spinner).
- Bottom slide-up + fade, auto-dismiss 2.6s, swipe-to-dismiss, queue, haptic per variant.
- API: `const toast = useToast(); toast.success('Farmer approved')`.
- Replaces `Alert.alert` for non-blocking confirmations.
- Keep `Alert.alert` ONLY for destructive confirms (delete) where a blocking yes/no is correct — or build a themed confirm dialog.

**Web/Portal**: standardize on **sonner** (already installed) — `toast.success()`, top-right, themed via CSS vars, stacked.

**Inline messages**: form errors stay inline (red banner, already themed);
empty states get a Lottie + one-line copy + a primary action.

---

## Performance & optimization (animation-aware)

(Extends `PERFORMANCE.md`.)

| Risk | Guard |
|---|---|
| Lottie files bloat bundle | Keep each < 30KB JSON; lazy-load heavy ones; prefer 1-2 hero moments, not everywhere |
| Reanimated worklet jank | Animate transform/opacity only on UI thread; avoid JS-thread setState loops (the count-up `setInterval` → migrate to reanimated `withTiming`) |
| List re-renders | `React.memo` rows + stable keys + `getItemLayout` (in PERFORMANCE.md P0/P4) before adding entrance animations |
| Stagger on long lists | Cap entrance animation to first viewport (~8 items); rest render instantly |
| moti everywhere | Use only where it adds meaning; static where it doesn't |
| Web bundle | framer-motion is tree-shaken; `dynamic()` import chart-heavy cards (PERFORMANCE.md P2) |
| Reduced-motion | Global check disables all of the above → 1ms |

Measure with the same tools as PERFORMANCE.md (Profiler/Flipper FPS, Lighthouse TBT). Animation budget: **no interaction drops below 60fps on a mid-range Android**.

---

## Rollout order (incremental, low-risk)

1. **Toast system** (built) → replace `Alert.alert` across mobile (highest UX win, no perf risk) ✅ starting now
2. **Press-scale + haptics** on all Pressables (tiny, global polish)
3. **List skeletons + staggered entrance** (Farmers/Farms/Verify)
4. **Lottie hero moments**: splash bloom, approve success, GRN success, empty states
5. **Swipe-to-approve** on Verify (gesture-handler)
6. **Bottom sheets** (Inventory/pickers) via @gorhom/bottom-sheet
7. **Web**: sonner toasts + reveal-on-scroll + chart draw-in
8. Re-measure → lock animation budget

Each step ships independently; none blocks current functionality.
