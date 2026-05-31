<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Testing Plan — All Roles, All UIs & OTP

**Every role, which UI to test it in, the exact login, and the OTP flow.**

</div>

---

## 0 · Prerequisites (one-time per session)

```powershell
# Infra (Docker) + local Mongo already running. Start the 4 dev pieces:
cd D:\Harshan\farmer-app\nesso-farm-app-v1
pnpm --filter @nesso/api seed:all      # builds + seeds admin, catalog, 18 role users, demo data
pnpm --filter @nesso/api dev           # API → :4000
pnpm --filter @nesso/web dev           # Web → :3001
pnpm --filter @nesso/portal dev        # Portal → :3002
cd apps\mobile && pnpm start -c        # Metro → scan in Expo Go
```

Health check: `curl http://localhost:4000/api/v1/health` → `{"status":"ok"}`.

---

## 1 · The 18 role logins (shared password `Nesso!Demo!2026`)

| # | Role | Phone | Primary UI |
|---|---|---|---|
| 1 | admin | 9000000001 | Web |
| 2 | orgMD | 9000000002 | Web |
| 3 | orgNESSO | 9000000003 | Web |
| 4 | orgTechSupport | 9000000004 | Web |
| 5 | orgFieldOfficer | 9000000005 | Mobile |
| 6 | orgFieldAssistant | 9000000006 | Mobile |
| 7 | orgAgent | 9000000007 | Mobile |
| 8 | fieldOfficer | 9000000008 | Mobile |
| 9 | flowerAgent | 9000000009 | Mobile |
| 10 | fpo | 9000000010 | Web |
| 11 | orgFPO | 9000000011 | Web |
| 12 | orgFPO1 | 9000000012 | Web |
| 13 | orgSouhardha | 9000000013 | Web |
| 14 | farmer | 9000000014 | Mobile |
| 15 | orgFarmer | 9000000015 | Mobile |
| 16 | procurementManager | 9000000016 | Web |
| 17 | processor | 9000000017 | Web |
| 18 | qualityAuditor | 9000000018 | Web |

Plus the **bootstrap admin**: `9066666481` / `Nesso!Admin!2026` (also Web).

> Web login form is prefilled with the bootstrap admin in dev. To test another
> role, clear the fields and type that role's phone + `Nesso!Demo!2026`.

---

## 2 · UI → role map (which UI serves whom)

| UI | URL | Roles it's built for |
|---|---|---|
| **Web Dashboard** | http://localhost:3001 | admin, orgMD, orgNESSO, orgTechSupport, fpo/orgFPO/orgFPO1, orgSouhardha, procurementManager, processor, qualityAuditor |
| **Mobile App** | Expo Go (Metro QR) | fieldOfficer, orgFieldOfficer, orgFieldAssistant, orgAgent, flowerAgent, farmer, orgFarmer |
| **QR Portal** | http://localhost:3002 | Public — no login (consumers/auditors scanning a box) |

> Today any logged-in user can see the web shell; the API enforces what each
> role can MODIFY. Per-role UI gating in the web nav is a follow-up.

---

## 3 · Web Dashboard — test script (per role)

For each Web role above:
1. Open http://localhost:3001/login → enter phone + `Nesso!Demo!2026` → **Sign in**
2. Land on **Dashboard** — KPIs show live counts (farmers/farms/crops/pending), charts render, recent feed populated.
3. **Farmers** → table loads 12 seeded farmers; search + filter chips work; click a row → **Farmer Profile** (tabs: Farms/Crops/Activities/Samples/Documents).
4. **Approvals** → 3 pending farmers in the split view; select one → KYC detail → **Approve/Reject** (admin/officer roles) → toast + row updates.
5. **Farms / Crops / Activities** → tables populated; Activities has Calendar/List toggle.
6. **Quality** (Samples + Audits), **Procurement**, **Warehouses**, **Inventory** → tables + mini-stats; Inventory row → batch detail (stage timeline + QR).
7. **Reports** → pre-harvest stat tiles + table.
8. **QR generator** (`/qr`) → pick a batch → QR preview + public trace link.
9. **Settings** → Users/Catalogs/Preferences (toggle theme here)/Audit log/Org.
10. **Topbar**: ⌘K palette, 🌙/☀️ theme toggle, bell → notifications, account menu → **Log out** → back to /login.

**Role-specific focus:**
- **procurementManager** → spend time on Procurement + Inventory.
- **qualityAuditor** → Quality (Samples/Audits) approve/reject.
- **fpo/orgFPO** → Farmers + Approvals (their cluster).
- **admin/orgMD** → everything, esp. Reports + Settings.

---

## 4 · Mobile App — test script (per field role)

Field roles (fieldOfficer, flowerAgent, farmer, etc.):
1. Expo Go → scan Metro QR → **Login**.
2. Password mode (Expo Go): enter the role phone + `Nesso!Demo!2026` → **Sign in**.
   - (To test OTP instead, you need the dev build — see §6.)
3. **Dashboard** → greeting, sync chip, weather card, KPI count-ups, quick actions, recent feed.
4. **Tab bar**: Home · Farmers · [+FAB Register] · Verify · Farms.
5. **Register** (FAB) → 4-step wizard (Personal/ID/Bank/Consent) → Save → toast "saved / saved offline".
6. **Farmers** → list + search + filter chips → tap → Farmer Profile.
7. **Verify** → Pending/Approved/Rejected tabs → Approve/Reject → toast.
8. **Farms** → list w/ polygon thumbnails → tap → Farm Details (tabs + Add crop).
9. **Add Farm** (from Dashboard quick action) → polygon editor (real map in dev build; text fallback in Expo Go).
10. **Settings** (avatar top-left) → Language (switch to हिंदी/ಕನ್ನಡ → UI translates live) → Theme (Light/Dark/System) → Sync Health → About → Support (FAQ + contact) → Log out.
11. **Offline test**: turn on airplane mode → register a farmer → see "saved offline" → turn WiFi back on → watch the sync chip drain.

**Role-specific focus:**
- **fieldOfficer / orgFieldOfficer** → Register + Add Farm + Add Activity + Accept GRN.
- **flowerAgent** → Farmers + Procurement.
- **farmer / orgFarmer** → their own dashboard + activities (read-mostly).

---

## 5 · QR Portal — test script (no login)

1. Open http://localhost:3002 → landing → enter a seeded trace code in the scan card, or click "sample trace".
   - Seeded public codes (from `seed:demo`): run the demo seed and copy the 3 codes it prints, OR open `/en/t/<code>`.
2. **Trace page** → hero, "Verified by Nesso" shimmer, scroll-linked journey timeline, farmer card, farm card (animated polygon), raw-JSON link.
3. Click **farmer card** → `/en/farmer/[id]`; **farm card** → `/en/farm/[id]`.
4. Footer → **About** + **Privacy** pages.
5. **Invalid code** → `/en/t/NOPE` → branded 404.
6. Toggle dark/light (if the portal exposes it) — tokens switch.

---

## 6 · OTP feature — test plan (the real Firebase flow)

**OTP cannot run in Expo Go** (native Firebase). It needs a dev/local build.
Prereqs (both done): ✅ rotated service-account key, ✅ `google-services.json`
in `apps/mobile/`, ✅ Firebase deps re-enabled.

### Build the dev client (you have Android Studio)
```powershell
cd D:\Harshan\farmer-app\nesso-farm-app-v1\apps\mobile
npx expo run:android        # local Gradle build, installs on connected phone/emulator (~5-10 min)
```
(or cloud: `eas build --profile development --platform android`)

### Test OTP end-to-end
1. Open the **Nesso dev client** (not Expo Go) → it connects to Metro (`pnpm start --dev-client`).
2. Login → tap **"Use phone OTP instead"**.
3. Enter a **Firebase test number** you configured (Console → Authentication →
   Phone → "Phone numbers for testing"), e.g. `9000000001`.
4. Tap **Send OTP** → OTP screen (6 boxes, auto-advance, 0:30 resend).
5. Enter the **static test code** you set in the console (e.g. `123456`).
6. Tap **Verify & continue** → the device gets a Firebase ID token →
   `POST /auth/otp/verify` exchanges it for a Nesso JWT → **lands on Dashboard**.

### Pre-flight checks for OTP
- Console: **Authentication → Sign-in method → Phone = Enabled**.
- Console: at least one **test number + code** added (no real SMS needed).
- The phone number you OTP-login with must **exist as a user** in Mongo
  (the backend `/auth/otp/verify` looks up the user by phone). Use a seeded
  role phone (`90000000xx`) and add the SAME number as a Firebase test number.
- Backend already verified: it validates the token + 401s on bad ones.

### OTP troubleshooting
| Symptom | Cause | Fix |
|---|---|---|
| "needs a dev build" notice | running in Expo Go | build the dev client (§6) |
| `auth/invalid-app-credential` | google-services.json package mismatch | must be for `app.nesso.farmer` |
| 404 "no staff account" after verify | phone not in `users` | add that phone via seed / register; match it to the Firebase test number |
| No SMS on a real number | not a test number + Spark plan limits | use a configured test number + code |

---

## 7 · Quick API-level role check (no UI)

```powershell
# Confirm any role can authenticate + /me returns the right role
pwsh -c '
$r = Invoke-RestMethod -Method POST -Uri http://localhost:4000/api/v1/auth/password -ContentType application/json -Body (@{username="9000000016";password="Nesso!Demo!2026"}|ConvertTo-Json)
Write-Host "role:" $r.user.role
Invoke-RestMethod -Uri http://localhost:4000/api/v1/auth/me -Headers @{Authorization="Bearer $($r.accessToken)"} | Select role,phone
'
```

Or run the full suite: `pwsh ./scripts/smoke-test-api.ps1` (43 checks).

---

## 8 · Checklist

- [ ] All 18 role logins succeed on their primary UI
- [ ] Web: every nav page loads with seeded data, no blank/empty crashes
- [ ] Web: approve/reject → toast + data updates
- [ ] Mobile: login → dashboard → register → verify → settings, all work
- [ ] Mobile: language switch (hi/kn) + dark mode flip live
- [ ] Mobile: offline register → sync drain
- [ ] Portal: trace + farmer + farm + about + privacy + 404
- [ ] OTP: dev build → test number → verify → dashboard
- [ ] Sentry: trigger `/debug/sentry/throw` → event in dashboard
