<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso · NR Group" width="120" />

# Firebase · End-to-End Setup

**Phone OTP authentication + Cloud Messaging (push). Free Spark plan — no card required.**

</div>

---

## TL;DR — where we are right now

| Step | Status |
|---|---|
| Firebase project `nesso-farm` created (Spark plan) | ✅ |
| Phone Auth provider enabled in console | ✅ |
| Test phone numbers added | ✅ |
| Service-account JSON downloaded → `apps/api/keys/firebase-service-account.json` | ✅ (gitignored) |
| `FIREBASE_SERVICE_ACCOUNT_PATH` in `apps/api/.env` | ✅ |
| **Backend code wiring** (`firebase-admin` + `FirebaseModule` + `POST /auth/otp/verify`) | ✅ commit `685b237` |
| **Mobile code wiring** (`@react-native-firebase/{app,auth}` + `app.config.js` plugin guards + OTP toggle in LoginScreen) | ✅ commit `685b237` |
| Service-account key **rotated** (key was momentarily out of secure storage) | ⚠️ user action — do this in Firebase console |
| Android app re-registered with **new bundle ID** `app.nesso.farmer` | ⚠️ user action |
| `apps/mobile/google-services.json` (matching new bundle ID) downloaded | ⚠️ user action |
| EAS dev build (Expo Go can't run native Firebase) | ⚠️ user action: `npx eas build --profile development --platform android` |
| End-to-end OTP smoke test on a real device | ❌ untested — see [TESTING.md §5](./TESTING.md) |

**Project URL:** https://console.firebase.google.com/project/nesso-farm

**Note on graceful degradation:** the API boots fine without the service account file (only `/auth/otp/verify` returns 503 in that case). The mobile app's `app.config.js` uses `existsSync` guards so missing `google-services.json` / `GoogleService-Info.plist` no longer block `expo start` — the Firebase plugin is just not loaded.

---

## 1 · CLI install (one-time)

We use the official `firebase-tools` CLI — installs via npm (same pattern as `eas-cli`).

```powershell
npm install --global firebase-tools

firebase --version           # 14.x or newer
firebase login               # browser flow
firebase projects:list       # should list "nesso-farm"
```

Then bind the local repo to the project:

```powershell
cd d:\Harshan\farmer-app\nesso-farm-app-v1\apps\mobile
firebase use --add
# Select: nesso-farm
# Alias: default
```

This writes `apps/mobile/.firebaserc` so future `firebase` commands target the right project automatically.

---

## 2 · Console-only steps (Firebase CLI can't do these)

### 2.1 · Enable Phone Authentication

1. https://console.firebase.google.com/project/nesso-farm/authentication/providers
2. Find **Phone** → toggle **Enable** → **Save**

### 2.2 · Add test phone numbers (recommended)

Same page → scroll to **Phone numbers for testing** → **Add phone number**:

| Phone | Verification code |
|---|---|
| `+91 9066666481` | `123456` |
| `+91 9876543210` | `654321` |

Test numbers bypass the SMS gateway — unlimited OTPs to those phones during dev, no quota burned.

> **Spark plan cap:** 10 SMS / day to real (non-test) numbers. Plenty for development; add more test numbers if your team grows.

### 2.3 · Download service-account JSON

1. https://console.firebase.google.com/project/nesso-farm/settings/serviceaccounts/adminsdk
2. Click **Generate new private key** → confirm **Generate key**
3. A `nesso-farm-firebase-adminsdk-*.json` file downloads — **move and rename** to:
   ```
   apps/api/keys/firebase-service-account.json
   ```

> 🚨 **Never commit this file.** Our `.gitignore` blocks `keys/`, `*firebase-adminsdk*.json`, `*service-account*.json` — but be paranoid: never paste contents into chats, screenshots, screen-shares.

---

## 3 · Pending — re-register the Android app

When this project started, the bundle ID was `ai.graylinx.nesso.farmer`. We changed it to `app.nesso.farmer` (clean, neutral). **Firebase Android apps are keyed on package name**, so the existing registration is stale.

### 3.1 · Register the new Android app via CLI

```powershell
cd d:\Harshan\farmer-app\nesso-farm-app-v1\apps\mobile

firebase apps:create ANDROID "Nesso Mobile" --package-name app.nesso.farmer
firebase apps:list             # confirm app appears
```

### 3.2 · Download `google-services.json` (matches new bundle)

```powershell
firebase apps:sdkconfig ANDROID > google-services.json
```

> The output filename `google-services.json` is already gitignored. Confirm: `head -5 google-services.json` should show `nesso-farm` as `project_id`.

### 3.3 · (optional) Delete the old Android app

In console: https://console.firebase.google.com/project/nesso-farm/settings/general — scroll to "Your apps", find the old `ai.graylinx...` entry → settings cog → **Remove this app**.

---

## 4 · Pending — rotate the service-account key

If the service-account JSON has ever been:
- pasted into a chat
- screenshot'd
- emailed
- committed (even to a private repo)

…it's safer to **rotate**. Takes 60 seconds.

1. https://console.firebase.google.com/project/nesso-farm/settings/serviceaccounts/adminsdk
2. **Manage service account permissions** → opens Google Cloud Console
3. Find `firebase-adminsdk-…@nesso-farm.iam.gserviceaccount.com` → **Keys** tab
4. Find the existing key → **⋮ → Delete** (this immediately invalidates it everywhere)
5. **Add Key → Create new key → JSON** → downloads
6. Replace `apps/api/keys/firebase-service-account.json` with the new file (keep the filename)

The old key is now useless, no matter who saw it.

---

## 5 · Backend wiring (NestJS) — when ready

```powershell
cd apps/api
pnpm add firebase-admin
```

Files I'll create / modify:

| File | What it does |
|---|---|
| `src/firebase/firebase.module.ts` | Bootstraps `firebase-admin` with the service account at `FIREBASE_SERVICE_ACCOUNT_PATH` |
| `src/firebase/firebase.service.ts` | `verifyIdToken(idToken)` wrapper around `admin.auth().verifyIdToken()` |
| `src/auth/auth.controller.ts` | Adds `POST /auth/otp/verify { firebaseIdToken }` → verifies → looks up/creates user in `users` collection → issues our RS256 JWT pair |
| `src/auth/auth.service.ts` | `loginByFirebaseIdToken(idToken)` business logic |
| `src/app.module.ts` | Import `FirebaseModule` (global) |

The flow on the server:

```
Mobile sends:  POST /auth/otp/verify { firebaseIdToken }
              ↓
verifyIdToken (firebase-admin) — checks signature against Google's public keys
              ↓
Read phone from decoded token
              ↓
Find user by phone, or create on first sign-in
              ↓
Issue our own RS256 access + refresh tokens (same as password login)
              ↓
Return { accessToken, refreshToken, user }
```

No SMS provider, no Twilio, no rate limit on our side — Firebase Spark handles all of it.

---

## 6 · Mobile wiring (React Native / Expo) — when ready

```powershell
cd apps/mobile
pnpm add @react-native-firebase/app @react-native-firebase/auth
```

> ⚠️ **Native modules** — these will NOT run in Expo Go. After installing, the next time you start Expo Go, the app will crash on launch with "RNFB app not registered." This is expected.

### 6.1 · Update `app.json`

Add the Firebase plugins to the `plugins` array:

```json
"plugins": [
  "expo-splash-screen",
  "expo-localization",
  "expo-camera",
  "expo-location",
  "expo-font",
  "expo-notifications",
  "expo-sqlite",
  "@react-native-firebase/app",
  ["@react-native-firebase/auth", { "additionalIosNotificationServicesPluginConfig": {} }],
  ["expo-build-properties", { "ios": { "useFrameworks": "static" } }]
]
```

Also reference `google-services.json` for Android:

```json
"android": {
  "package": "app.nesso.farmer",
  "googleServicesFile": "./google-services.json",
  ...
}
```

### 6.2 · Build a dev client (one time)

```powershell
cd apps/mobile
eas build --profile development --platform android
```

EAS takes ~10–15 min on the free queue. When it finishes, you get a download link — install the APK on your phone (drag-and-drop via USB, or use the Expo Orbit app).

That APK is your "Expo Go replacement" for this project from now on.

### 6.3 · `LoginScreen` v2 — phone → OTP → verify

Replace the current password-only login with:

```
Step 1: phone input → +91 prefix label → "Send OTP" button
        → calls auth().signInWithPhoneNumber('+91...')
        → returns a `confirmation` handle (kept in component state)
Step 2: 6-digit OTP input → "Verify" button
        → calls confirmation.confirm(otp)
        → returns user.getIdToken()
        → POST /auth/otp/verify { firebaseIdToken } to our backend
        → saves our JWT pair in AsyncStorage (keychain.setSession)
        → navigates to Main tabs
```

Source files I'll create/modify:

| File | Change |
|---|---|
| `apps/mobile/src/firebase/auth.ts` | Wrappers: `sendOtp(phone)`, `verifyOtp(confirmation, code)`, `getIdToken()` |
| `apps/mobile/src/screens/LoginScreen.tsx` | Two-step UI (phone → OTP) with countdown + resend |
| `apps/mobile/src/screens/SplashScreen.tsx` | Already routes by session; no change |
| `apps/mobile/src/api/client.ts` | New helper `verifyOtp(firebaseIdToken)` |

---

## 7 · Verification — sanity check after wiring

### Backend (without mobile)

```powershell
TOKEN=$(...)   # admin token; see CONFIG.md
# In dev we'll mount a /dev/firebase-status endpoint that calls admin.app() and returns project_id
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/dev/firebase-status
# → { "ok": true, "projectId": "nesso-farm" }
```

### Mobile (dev client, on phone)

1. Open Login → enter `+91 9066666481`
2. Tap **Send OTP** → Firebase delivers `123456` (the test code we set up)
3. Enter `123456` → tap Verify
4. Land on Main tabs with admin role

If the test phone number works without an actual SMS arriving, the integration is correct.

---

## 8 · Pending checklist

### Console-only (you)
- [x] Create Firebase project `nesso-farm` (Spark plan)
- [x] Enable Phone Authentication provider
- [x] Add 2+ test phone numbers
- [ ] **Rotate the service-account key** (best practice after any exposure)
- [ ] **Re-register Android app** with `app.nesso.farmer` package name
- [ ] Download new `google-services.json` matching the new bundle
- [ ] (optional) Delete old `ai.graylinx...` Android app

### CLI (you can do these now)
- [x] `firebase login`
- [x] `firebase use --add` → nesso-farm → default alias
- [ ] `firebase apps:create ANDROID "Nesso Mobile" --package-name app.nesso.farmer`
- [ ] `firebase apps:sdkconfig ANDROID > google-services.json`

### Code (I do these after the above is done)
- [ ] `pnpm add firebase-admin` in `apps/api`
- [ ] Create `apps/api/src/firebase/` module
- [ ] Add `POST /auth/otp/verify` endpoint
- [ ] `pnpm add @react-native-firebase/app @react-native-firebase/auth` in `apps/mobile`
- [ ] Update `apps/mobile/app.json` (plugins + googleServicesFile)
- [ ] Build dev-client APK: `eas build --profile development --platform android`
- [ ] Install APK on phone (via USB or Expo Orbit)
- [ ] Rewrite `LoginScreen.tsx` for phone → OTP flow
- [ ] Verify end-to-end on a real device

### Production hardening (Phase 6)
- [ ] Configure Firebase Authorized Domains for app deep links
- [ ] Set up Cloud Messaging server key in API env (for push)
- [ ] Move test phone numbers out of production config
- [ ] Monitor Spark plan quota (auth + FCM) in Firebase Usage tab
- [ ] Upgrade to Blaze (pay-as-you-go) if SMS volume exceeds 10/day for real numbers

---

## 9 · Quick reference — useful URLs

| | URL |
|---|---|
| Project overview | https://console.firebase.google.com/project/nesso-farm |
| Authentication providers | https://console.firebase.google.com/project/nesso-farm/authentication/providers |
| Test phone numbers | https://console.firebase.google.com/project/nesso-farm/authentication/providers |
| Service accounts (Admin SDK) | https://console.firebase.google.com/project/nesso-farm/settings/serviceaccounts/adminsdk |
| Android apps | https://console.firebase.google.com/project/nesso-farm/settings/general |
| Usage / quota | https://console.firebase.google.com/project/nesso-farm/usage |
| Firebase CLI docs | https://firebase.google.com/docs/cli |
| React Native Firebase docs | https://rnfirebase.io |

---

## 10 · Troubleshooting

| Symptom | Fix |
|---|---|
| `Service account does not exist` on backend startup | `FIREBASE_SERVICE_ACCOUNT_PATH` is wrong in `apps/api/.env`, or the file isn't where it claims to be. `ls apps/api/keys/firebase-service-account.json` |
| `auth/invalid-app-credential` on phone OTP | Android `package_name` in `google-services.json` doesn't match `app.json`'s `android.package`. Re-run `firebase apps:sdkconfig ANDROID > google-services.json` |
| Test phone numbers not getting code | Phone provider not enabled. Re-check the toggle. |
| Real phone gets no SMS in dev | Spark plan cap (10/day to real numbers). Use a configured test number, or wait 24h, or upgrade to Blaze. |
| `Module @react-native-firebase/app not found` in Expo Go | Expected — those modules need a dev client. Build with `eas build --profile development --platform android` and install the APK. |
| Login flow times out at the OTP step | Network — phone can't reach the backend. Verify `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` matches your PC's LAN IP. |

---

<div align="center">

<sub>NESSO · NR Group · © 2026</sub>

</div>
