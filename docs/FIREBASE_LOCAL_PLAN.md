<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Firebase — Fix Plan for Local Testing, Dev & Local Build

</div>

---

## Current state (verified 2026-05-31)

| Piece | State |
|---|---|
| Backend `firebase-admin` | ✅ working — service account loaded, `/auth/otp/verify` validates tokens (401 on bad, would issue JWTs on valid) |
| Backend service account | ✅ present at `apps/api/keys/firebase-service-account.json` (gitignored) |
| Mobile `@react-native-firebase/{app,auth}` | ⚠️ parked in `package.json` → `_disabledDependencies` |
| `apps/mobile/google-services.json` | ❌ not present |
| Expo Go login | ✅ works via **password** (Firebase guarded out, no crash) |
| Dev-build OTP | ❌ blocked until the two items above are restored |

**Why it's disabled:** EAS Gradle builds failed at autolinking because the
native Firebase modules require `google-services.json`, which wasn't on
disk. We parked the deps so builds + Expo Go work. `app.config.js` already
guards the Firebase plugin behind `existsSync(google-services.json)`, so it
auto-activates the moment the file is added.

---

## The three testing modes

| Mode | Login that works | Firebase OTP? | Needs |
|---|---|---|---|
| **Expo Go** (today) | Password (prefilled admin) | ❌ no | nothing — works now |
| **Local dev build** (Android Studio) | Password **+ OTP** | ✅ yes | google-services.json + re-enable deps + `expo run:android` |
| **EAS cloud build** | Password **+ OTP** | ✅ yes | google-services.json + re-enable deps + `eas build` |

Expo Go can NEVER run native Firebase — that's a platform limit, not a bug.
OTP testing always requires a dev/prod build.

---

## Fix steps (do in order)

### Step 0 — Firebase console (one-time, ~5 min)
1. Open https://console.firebase.google.com/project/nesso-farm
2. **Rotate the service-account key** (it was read into a chat once):
   Project settings → Service accounts → *Generate new private key* →
   replace `apps/api/keys/firebase-service-account.json`. Restart the API.
3. **Register the Android app** with package **`app.nesso.farmer`**:
   Project settings → Your apps → Add app → Android →
   package `app.nesso.farmer` → register → **download `google-services.json`**.
4. Save it to `apps/mobile/google-services.json` (gitignored — stays local).
5. Confirm **Phone** sign-in provider is enabled + your test numbers are listed
   (Authentication → Sign-in method → Phone → "Phone numbers for testing").

### Step 1 — re-enable the native deps (code, ~2 min)
In `apps/mobile/package.json`, move these two lines from
`_disabledDependencies` back into `dependencies`:
```json
"@react-native-firebase/app": "^24.0.0",
"@react-native-firebase/auth": "^24.0.0",
```
Then from the repo root:
```powershell
pnpm install
```
`app.config.js` will now include the Firebase plugins automatically
(because `google-services.json` exists).

### Step 2a — LOCAL build (you have Android Studio — fastest)
```powershell
cd apps\mobile
npx expo run:android      # compiles natively, installs on connected device/emulator (~5-10 min first time)
```
Prereqs already set up earlier: `ANDROID_HOME=C:\Android\Sdk`, adb on PATH,
phone in USB-debugging OR an emulator running. After install:
```powershell
pnpm start --dev-client
```
Open the **Nesso dev client** (not Expo Go) → Login → OTP toggle → real SMS
to your Firebase test number → verify → dashboard.

### Step 2b — EAS CLOUD build (no local Android toolchain)
```powershell
cd apps\mobile
eas build --profile development --platform android
```
~15-20 min, install the APK, then `pnpm start --dev-client`.

### Step 3 — verify OTP end to end
1. Dev-client app → Login → tap **"Use phone OTP instead"**
2. Enter a Firebase **test number** → Send OTP
3. Enter the static test code you set in console → Verify
4. Backend `/auth/otp/verify` exchanges the Firebase token for a Nesso JWT →
   lands on dashboard. (Backend is already confirmed working.)

---

## Rollback / keep-disabled

If a build breaks again, re-park the two deps in `_disabledDependencies`,
`pnpm install`, and Expo Go password login keeps working. The runtime guard
in `apps/mobile/src/firebase/auth.ts` (`isPhoneOtpAvailable()` +
Expo-Go detection) means the app never crashes whether Firebase is present
or not.

---

## Sentry — no action needed

All 4 apps wired and the API path is verified live (event accepted, HTTP
200). Only optional production item: set `SENTRY_AUTH_TOKEN` for source-map
upload on prod builds (Phase 6). See [SENTRY_SETUP.md](./SENTRY_SETUP.md).
