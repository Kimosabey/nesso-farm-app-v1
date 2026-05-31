# Nesso · Testing & Smoke-Verification Plan

End-to-end test plan for the Firebase Phone-OTP path and the Sentry
observability layer that was just wired into all four apps.

Run top-to-bottom. Each step has a clear pass/fail signal.

---

## 0 · Prerequisites checklist (one-time)

Before any of the OTP or sourcemap-upload tests work, complete these in
the Firebase / Sentry consoles. Without them, the apps still boot but
the integrations no-op.

### Firebase console
- [ ] **Rotate** the service-account key that was once read into chat:
      Project settings → Service accounts → Generate new private key →
      replace `apps/api/keys/firebase-service-account.json`
- [ ] **Register Android app** with package `app.nesso.farmer`
      (renamed from `ai.graylinx.nesso.farmer`):
      Project settings → Your apps → Add app → Android →
      download `google-services.json` → save to `apps/mobile/google-services.json`
- [ ] (Optional, for iOS) Register iOS bundle `app.nesso.farmer` →
      download `GoogleService-Info.plist` → save to `apps/mobile/`
- [ ] Confirm Phone Authentication provider is **Enabled** and your
      test numbers are listed under "Phone numbers for testing"

### Sentry console
- [ ] Confirm all four projects exist under `harshimos-team`:
      `nesso-api`, `nesso-web`, `nesso-portal`, `nesso-mobile`
- [ ] (Optional, for sourcemaps) Create a User Auth Token with the
      `project:releases` + `org:read` scopes →
      `setx SENTRY_AUTH_TOKEN <token>` (Windows) and restart your terminal

---

## 1 · Sentry · API

```powershell
# terminal 1
cd apps/api
pnpm dev
```

Wait until you see `Nesso API listening on http://0.0.0.0:4000`.

Trigger one event per probe (the routes are unauthenticated):

```powershell
# sync throw → 500 with stack trace captured
curl http://localhost:4000/api/v1/debug/sentry/throw -v

# async throw → 500 captured by SentryGlobalFilter
curl http://localhost:4000/api/v1/debug/sentry/async -v

# explicit captureMessage → 200 with eventId in body
curl http://localhost:4000/api/v1/debug/sentry/message
```

**Pass:** within ~30s, three new events appear in the
`harshimos-team / nesso-api` project on sentry.io with the matching
timestamps and stack traces. Method + URL appear under "Request" tab.

**Fail to investigate:**
- Empty Sentry → check `SENTRY_DSN` is set in `apps/api/.env` and the
  API was started AFTER the .env was last edited.
- Stack trace points at `dist/*.js` not `src/*.ts` → sourcemap upload
  is not configured. Acceptable for now; only matters in production.

---

## 2 · Sentry · Web dashboard

```powershell
# terminal 2
cd apps/web
pnpm dev
```

Open <http://localhost:3001/debug/sentry> in a browser.

Click each button in turn:
1. **captureMessage (info)** → page shows `eventId <uuid>`. Should land
   in the `nesso-web` project as a "Message" level=info.
2. **throw on client** → React error boundary kicks in; Sentry catches
   the uncaught exception. Should land as an Error event with the JS
   stack trace.
3. **throw on server** → fetches `/debug/sentry/server-error`; the
   route throws → caught by Next's `onRequestError` hook (via
   `instrumentation.ts`). Should land as a server-side Error event.

**Pass:** three events in `nesso-web` within ~30s, matching the three
clicks. The Replay tab should show a 5-10s clip with the click that
triggered each event (masked text per `maskAllText: true`).

**Fail to investigate:**
- "Cannot find module @sentry/nextjs" at runtime → `pnpm install` was
  not re-run after install.
- No events but no errors either → `NEXT_PUBLIC_SENTRY_DSN` missing
  from `apps/web/.env` or dev server was started before it was set.
- 404 on /monitoring → ad-blocker stripping the tunnel route; events
  may still arrive via the default ingest URL.

---

## 3 · Sentry · QR Portal

```powershell
# terminal 3
cd apps/portal
pnpm dev
```

Open <http://localhost:3002/debug/sentry> (portal runs on 3002 by
default; if yours differs, check `apps/portal/package.json` `dev`
script). Repeat the three-button sequence from step 2.

**Pass:** three events in the `nesso-portal` project.

---

## 4 · Sentry · Mobile

Mobile Sentry events only flow properly from an **EAS dev build** or
production build. In Expo Go the native module is a no-op for crashes
(though `captureMessage`/`captureException` do still send JS-side).

### 4a · Expo Go check (JS path only)
```powershell
cd apps/mobile
pnpm dev
```

Scan the QR with Expo Go on your phone. On the Login screen,
**long-press the "● Nesso" pill at the top** (delay 800ms) → opens the
Debug screen.

Tap **Sentry · captureMessage** and **Sentry · captureException** →
events should land in `nesso-mobile`. The "uncaught throw" button will
crash the Expo Go JS bridge but won't reliably send the crash report.

**Pass:** at least two events (message + exception) in `nesso-mobile`.

### 4b · Dev-build check (full native path) — *optional, one-time setup*
```powershell
cd apps/mobile
npx eas build --profile development --platform android
```

Wait ~15-20 min. Install the resulting APK on your phone. Re-run the
Debug screen tests; "uncaught throw" will now produce a native crash
report with full stack trace in `nesso-mobile`.

---

## 5 · Firebase · Phone OTP end-to-end

**Cannot be tested in Expo Go.** Native phone-auth modules don't load
there. You need 4a/4b's dev build before this works.

Prerequisites:
- [ ] Step 0 Firebase items all checked
- [ ] Dev build APK installed on phone
- [ ] At least one user in Mongo with the test phone number, e.g.:
      ```
      cd apps/api
      pnpm seed:admin   # creates 9066666481 / Nesso!Admin!2026
      ```
- [ ] API running and reachable from the phone
      (set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to your PC's
      LAN IP, e.g. `http://192.168.1.42:4000/api/v1`)

### Test sequence
1. Open the app → Login screen → tap the **OTP** toggle.
2. Enter `9066666481` (or whichever test number you added in the
   Firebase console).
3. Tap **Send OTP**.
   - For Firebase test numbers: no real SMS sent, accepts the
     hard-coded code you set in console (e.g. `123456`).
   - For real numbers: an SMS arrives within ~10s.
4. Enter the 6-digit code → tap **Verify & continue**.
5. Should land on the Main dashboard.

**Pass:** the navigation lands on Main and `/auth/me` works
afterwards (any authenticated screen loads).

**Fail to investigate:**
- "Phone OTP requires a dev build" notice → you're in Expo Go, build
  one first.
- 503 from `/auth/otp/verify` → `apps/api/keys/firebase-service-account.json`
  missing or unreadable. Check API logs for the warning at boot.
- 404 from `/auth/otp/verify` with `No staff account exists` → phone
  isn't in `users` collection. Add it via `pnpm seed:admin` or admin UI.
- "auth/invalid-app-credential" → `google-services.json` is for the
  old package name. Re-download for `app.nesso.farmer`.

---

## 6 · Cleanup — remove debug routes before production

The `/debug/sentry/*` routes are intentionally unauthenticated to make
testing easy. Before shipping:

- API: delete `apps/api/src/debug/` and remove `DebugModule` from
  `app.module.ts`
- Web: delete `apps/web/src/app/debug/`
- Portal: delete `apps/portal/src/app/debug/`
- Mobile: remove the `Debug` screen registration in `App.tsx` and
  delete `apps/mobile/src/screens/DebugScreen.tsx` (the long-press
  trigger goes with it)

Track this with: `git grep -n "debug/sentry\|DebugScreen\|DebugModule"`

---

## Quick reference — DSN map

| App | Env var | Sentry project |
|---|---|---|
| API | `SENTRY_DSN` | `harshimos-team/nesso-api` |
| Web | `NEXT_PUBLIC_SENTRY_DSN` | `harshimos-team/nesso-web` |
| Portal | `NEXT_PUBLIC_SENTRY_DSN` | `harshimos-team/nesso-portal` |
| Mobile | `EXPO_PUBLIC_SENTRY_DSN` | `harshimos-team/nesso-mobile` |

All DSNs live in the per-app `.env` files (gitignored).
