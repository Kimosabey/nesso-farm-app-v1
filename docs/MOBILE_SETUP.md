<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Mobile / Expo Setup

**Log in, link the project to your `harshimos-team` Expo account, start the dev server, and get the app onto your phone.**

</div>

---

## You do NOT need `npx create-expo-app`

`apps/mobile/` already exists — full Expo SDK 52 + TypeScript + NativeWind + React Navigation + Splash/Login/Home screens. Running `create-expo-app` again would *replace* it.

Use it only if you ever need to start a *new* Expo project somewhere else.

---

## 1 · CLI install (one-time)

> **TL;DR — on Windows, use npm for `eas-cli`. Use pnpm for everything inside the repo.**

### Why npm for global CLIs

Expo CLI is bundled in the project (no global install needed — we use `npx expo` / `pnpm --filter`). The only global tool you need is `eas-cli`. On Windows, the **npm global bin is already in your PATH** by default; **pnpm's global bin is not**.

### Recommended (works first try)

```powershell
npm install --global eas-cli

# Verify
eas --version       # should print eas-cli/20.x or newer
```

You'll see a flurry of `npm warn deprecated …` lines about transitive deps (uuid@8, glob@10, xmldom, lodash.get). **Those are inside `eas-cli`, not your code — ignore them.**

### Optional — make pnpm globals work too

If you want `pnpm add -g <anything>` to also work in the future, run **once**:

```powershell
pnpm setup
# Output: "Setup complete. Open a new terminal to start using pnpm."

# Close PowerShell. Open a fresh window.
pnpm add -g <some-other-cli>    # now works
```

This permanently adds `%PNPM_HOME%\bin` to your user PATH.

### Rule of thumb (used everywhere in this repo)

```
Inside the repo →  pnpm install · pnpm dev · pnpm --filter @nesso/mobile start
Global tools    →  npm install --global <cli>
```

`pnpm install` at the repo root is the only safe install — npm at the root would break workspace resolution.

---

## 2 · Log into your Expo account

```powershell
eas login
# Email: (your email)
# Password: (your Expo password)
```

`eas whoami` should now print your username. If you're part of an org, also:

```powershell
# Make sure we use the harshimos-team org as the default
eas account:set harshimos-team
```

Or browse https://expo.dev/accounts/harshimos-team to confirm the org is visible.

---

## 3 · Link our app to your Expo account

We pre-populated `apps/mobile/app.json` with a placeholder:

```json
"extra": {
  "eas": {
    "projectId": "REPLACE_AFTER_EAS_INIT"
  }
}
```

Run `eas init` to replace it with a real project ID owned by your account:

```powershell
cd d:\Harshan\farmer-app\nesso-farm-app-v1\apps\mobile

eas init --non-interactive --id auto
# OR interactively (let it create a new project under harshimos-team):
eas init
```

When prompted:

| Question | Answer |
|---|---|
| "Which account?" | `harshimos-team` |
| "Slug?" | `nesso` (or accept whatever it suggests) |
| "Bundle identifier?" | `ai.graylinx.nesso.farmer` (already set in app.json) |

This rewrites `app.json` so `extra.eas.projectId` is a real UUID. **Commit that change.**

After this, the project is visible at:
**https://expo.dev/accounts/harshimos-team/projects/nesso**

---

## 4 · Start the dev server

From the **repo root** (recommended in a monorepo):

```powershell
pnpm --filter @nesso/mobile start
```

Or, equivalently, from `apps/mobile/`:

```powershell
npx expo start
```

You'll see:
- A QR code in the terminal
- A small interactive menu: press `a` for Android emulator, `i` for iOS simulator (Mac only), `w` for web

---

## 5 · Get the app on your phone

### 5a · Expo Go (early phases — works now)

1. Install **Expo Go** on your phone (Play Store / App Store)
2. Open Expo Go → tap **"Scan QR code"**
3. Point at the QR code in the terminal
4. App downloads and opens — you should see the Nesso splash → "Hello Nesso" home

> **Important:** Expo Go won't work once we add Firebase Phone Auth (Phase 1.5+) or MMKV — they need native code. We then switch to a **dev client** (see §6).

### 5b · Android emulator

In Android Studio, create an AVD (Pixel 7, API 34). Start it. Then in the Expo terminal, press `a` — the app installs into the emulator automatically.

### 5c · Real Android phone over USB

1. Enable Developer Options + USB debugging on phone
2. Plug in via USB; accept the RSA fingerprint
3. Verify: `adb devices` should list your device
4. In the Expo terminal, press `a` — it installs onto the phone

### 5d · API URL when running on a real device

Expo Go on a real phone can't reach `localhost` on your PC — that's the phone's localhost. Update `apps/mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://<your-PC-LAN-IP>:4000/api/v1
```

Find your LAN IP: `ipconfig` → IPv4 of your active adapter (usually `192.168.x.x`).
Make sure Windows Firewall allows inbound on `:4000` (Allow an app → Node.js).

| Where you run the app | `EXPO_PUBLIC_API_URL` |
|---|---|
| Android emulator | `http://10.0.2.2:4000/api/v1` ← default in the repo |
| iOS simulator | `http://localhost:4000/api/v1` |
| Real Android / iOS phone | `http://192.168.x.x:4000/api/v1` (your PC's IP) |

Restart `pnpm --filter @nesso/mobile start` after editing `.env`.

---

## 6 · Dev client (when native modules arrive)

Phase 1.5 adds `@react-native-firebase/app` + `@react-native-firebase/auth` + `react-native-mmkv` — native modules that Expo Go cannot run.

Switch to a **dev client** (your own custom Expo Go, built for our app):

```powershell
cd d:\Harshan\farmer-app\nesso-farm-app-v1\apps\mobile

# One-time cloud build of a dev-client APK (takes ~10-15 min on EAS)
eas build --profile development --platform android
```

When it finishes, EAS gives you a link or QR. Install it on your phone (Expo Orbit makes this easy). After install:

```powershell
pnpm --filter @nesso/mobile start --dev-client
```

Scan the QR in the dev-client app (not Expo Go). Hot reload still works.

---

## 7 · Build profiles (`eas.json`)

Three profiles, in `apps/mobile/eas.json` (we'll add this file in Phase 1.5):

| Profile | Use | Output |
|---|---|---|
| `development` | Dev client w/ inspector + hot reload | APK / IPA, internally distributed |
| `preview` | QA / stakeholder builds | APK / IPA, internally distributed |
| `production` | Store submission | AAB / IPA, store-ready |

Commands:

```powershell
eas build --profile development --platform android
eas build --profile preview     --platform android   # APK for testers
eas build --profile production  --platform all        # store-ready
```

To submit to stores (Phase 6):

```powershell
eas submit --platform android   # Google Play
eas submit --platform ios       # App Store (needs Apple Developer $99/yr)
```

---

## 8 · Useful Expo / EAS commands

```powershell
# Login / account
eas login
eas whoami
eas logout

# Project
eas init                       # link a fresh app or migrate IDs
eas config                     # print resolved eas.json
eas project:info               # show project ID, slug, owner

# Builds
eas build --profile development --platform android
eas build:list                 # past builds
eas build:view <build-id>      # details + logs

# OTA updates (after `expo-updates` is installed in Phase 6)
eas update --branch preview --message "fix login spinner"

# Credentials (signing keys, push certs)
eas credentials
```

---

## 9 · Project structure refresher

```
apps/mobile/
├── app.json              # Expo config: name, slug, bundle id, permissions
├── eas.json              # (added in Phase 1.5) build profiles
├── babel.config.js       # NativeWind + Reanimated
├── metro.config.js       # monorepo-aware Metro
├── tailwind.config.js    # extends @nesso/design-system preset
├── global.css            # NativeWind base styles
├── App.tsx               # NavigationContainer + Stack
├── index.ts              # registerRootComponent entry
└── src/
    ├── api/client.ts     # fetch wrapper with in-memory token
    └── screens/
        ├── SplashScreen.tsx
        ├── LoginScreen.tsx
        └── HomeScreen.tsx
```

---

## 10 · Common gotchas

| Symptom | Fix |
|---|---|
| `Cannot find module '@nesso/design-system'` after `expo start` | Metro cache stale — `pnpm --filter @nesso/mobile start --clear` |
| QR code scans but app crashes on launch | You probably added a native module without rebuilding the dev client. Re-run `eas build --profile development` |
| `Error: getaddrinfo ENOTFOUND localhost` on real phone | API URL still points at `localhost`. Switch to your PC's LAN IP in `.env` |
| Login 401 on mobile but works on web | API has CORS allowed only for the web origin — add the phone-on-LAN origin to `CORS_ORIGINS` in `apps/api/.env`, or hit the API by IP from a browser to verify |
| `eas build` times out | EAS Free tier has limited build minutes. Wait for queue or upgrade to a paid plan |
| Push notifications don't arrive (Phase 5+) | Make sure `google-services.json` (Android) / `GoogleService-Info.plist` (iOS) is in place + you're running a **dev client**, not Expo Go |

---

## 11 · Step-by-step starter checklist

Tick these off the first time you set up:

- [ ] `eas --version` prints 16.x+
- [ ] `eas login` succeeds (or you can see https://expo.dev/accounts/harshimos-team in your browser)
- [ ] From `apps/mobile/`: `eas init` rewrites `extra.eas.projectId` in `app.json`
- [ ] Project shows up at https://expo.dev/accounts/harshimos-team/projects
- [ ] Commit the updated `app.json`
- [ ] **Make sure the API is running**: `docker compose up -d` + `pnpm --filter @nesso/api dev`
- [ ] `pnpm --filter @nesso/mobile start`
- [ ] Phone (Expo Go) or emulator (press `a`) shows the Nesso splash → login screen
- [ ] Log in with `9066666481` / `Nesso!Admin!2026` — Home screen renders with your name

---

<div align="center">

<sub>For DB connection, see <a href="DB_CONNECT.md">DB_CONNECT.md</a>. For URLs/ports, see <a href="../CONFIG.md">CONFIG.md</a>.</sub>

<br /><br />

<sub>NESSO · NR Group · © 2026</sub>

</div>
