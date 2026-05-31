<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Expo SDK 52 → 54 Upgrade Notes

**What changed, why, and how to roll back if needed.**

</div>

---

## TL;DR

- Bumped Expo from `~52.0.7` → `~54.0.35`
- React 18.3 → 19.1, React Native 0.76.5 → 0.81.5
- Reanimated 3.16 → 4.1 (now requires `react-native-worklets` — done)
- All `expo-*` packages bumped via `npx expo install --fix`
- Sentry RN downgraded `^8.13` → `~7.2` (Expo SDK 54's recommended version)
- Removed the metro `overrides` block from `pnpm-workspace.yaml` —
  Node-22 strict-exports conflict no longer applies under SDK 54
- Removed `react-native-reanimated/plugin` from `babel.config.js` —
  `babel-preset-expo` now handles the worklets transform automatically
- Removed `expo-router` (we use react-navigation, never used router)
- TypeScript 5.3 → 5.9, `@types/react` 18.3 → 19.1

All four apps still typecheck clean. Metro starts under SDK 54
without errors.

---

## Why we upgraded

Phone-side Expo Go auto-updated past SDK 54. SDK 52 builds refused to
load with the "Project is incompatible with this version of Expo Go"
screen. Options were: (a) sideload the SDK 52 Expo Go APK, (b) upgrade
the project. We picked (b) for durability — standard Expo Go works
forever after this.

---

## Source-level changes required

**None.** All app code under `apps/mobile/src/` compiled clean against
React 19 + RN 0.81 without edits. The React 19 changes that affect us
(`useId`, `use`, server components) aren't in our mobile surface.

---

## Things that **didn't** auto-fix and why we left them

| Thing | Why it stayed |
|---|---|
| `@react-native-firebase/{app,auth}` `^24.0.0` | Already supports RN 0.78+; SDK 54 doesn't request a specific version |
| `@react-navigation/*` `^7.x` | Stable across RN 0.76–0.81 |
| `nativewind` `^4.1.23` | Compatible with reanimated 4 + RN 0.81; v4.2 not yet released |
| `react-native-mmkv` `^3.1.0` | Compatible with RN 0.81 |
| `react-native-worklets` `0.5.1` | Now the canonical version (downgraded from 0.9 — Expo manages this) |

---

## Files changed

```
apps/mobile/package.json          # all deps bumped per `expo install --fix`
apps/mobile/app.config.js         # added @sentry/react-native/expo plugin with org/project
apps/mobile/babel.config.js       # removed react-native-reanimated/plugin line
apps/mobile/metro.config.js       # removed `unstable_enablePackageExports = false`
pnpm-workspace.yaml               # removed metro `overrides:` block
```

---

## How to verify the upgrade locally

```powershell
cd D:\Harshan\farmer-app\nesso-farm-app-v1

# clean install (overrides + lockfile both changed)
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml -ErrorAction SilentlyContinue
pnpm install

# typecheck — should be 0 errors per app
pnpm --filter @nesso/api    exec tsc --noEmit -p .
pnpm --filter @nesso/web    exec tsc --noEmit -p .
pnpm --filter @nesso/portal exec tsc --noEmit -p .
pnpm --filter @nesso/mobile exec tsc --noEmit -p .

# start Metro — should boot without TerminalReporter / worklets errors
cd apps\mobile
pnpm start
```

On the phone:
1. Install the **current** Expo Go from the Play Store (the SDK 54 one
   that was previously showing the incompatibility screen)
2. Scan the Metro QR code
3. App should load to the Splash screen

---

## Rollback plan (if something breaks after merge)

Restore the SDK 52 baseline with:

```powershell
git revert <upgrade-commit-sha>
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml
pnpm install
```

Then re-add the metro override + `react-native-reanimated/plugin` per
the pre-revert state (or grab them from the commit before the upgrade).

---

## Known follow-ups (not blockers)

- **Sentry plugin warning** about `auth_token`: only fires during EAS
  builds when you want sourcemap upload. Set `SENTRY_AUTH_TOKEN` in
  `.env` when you do your first dev/prod build.
- **expo-av deprecation**: SDK 55 removes it. We don't use it, so
  nothing to migrate. Listed here for completeness.
- **New Architecture**: enabled in `app.config.js`. SDK 55 makes it
  mandatory, so we're ahead of the curve.
- **React Compiler**: SDK 54 enables it by default in *new* templates
  (RC status). We didn't opt in. Worth revisiting after RC → stable.
