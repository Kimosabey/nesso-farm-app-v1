# 05 — Mobile App (Expo TS)

## Project layout

```
apps/mobile/
├── app.json
├── eas.json
├── google-services.json        # FCM + Phone Auth
├── App.tsx
├── src/
│   ├── api/                    # axios + endpoint mapping + auth interceptor
│   ├── components/             # cross-screen UI
│   │   ├── ui/                 # Button, Input, Card, Toast, Modal
│   │   ├── map/                # WebViewMap, PolygonEditor
│   │   ├── form/               # FormField, ImagePicker, DatePicker
│   │   └── feedback/           # ErrorBoundary, LoadingState, EmptyState
│   ├── screens/                # one folder per screen
│   ├── navigation/
│   │   ├── RootNavigator.tsx   # Stack
│   │   ├── MainTabs.tsx        # Bottom tabs + center FAB
│   │   └── linking.ts          # deep link config (scheme: nesso://)
│   ├── stores/                 # Zustand slices
│   │   ├── authStore.ts
│   │   ├── networkStore.ts
│   │   ├── syncStore.ts
│   │   └── preferencesStore.ts
│   ├── queries/                # TanStack Query hooks per resource
│   ├── db/                     # Expo SQLite schema + migrations + outbox helpers
│   ├── sync/                   # SyncManager (NetInfo + outbox drain)
│   ├── i18n/                   # i18next setup, 12 translation JSONs
│   ├── theme/                  # Nesso brand tokens (Tailwind preset)
│   ├── utils/                  # validators (Aadhaar/PAN/IFSC/etc.), date helpers
│   ├── firebase/               # phoneAuth wrappers
│   └── config/                 # env, constants, feature flags
├── assets/
└── android/, ios/              # native, generated
```

## Navigation

**Root Stack** (decided by `authStore.token`):
- `SplashLoading`
- `Login` (phone + OTP)
- `MainApp` (bottom tabs)

**Bottom tabs (5 + center FAB):**
1. Dashboard
2. Farmers (list)
3. **+ Register Farmer** — center floating FAB (60×60, brand green, +3px white border)
4. Verify (approvals queue for the field officer's hierarchy)
5. Farms

**Pushed stack screens** (one tap from elsewhere):
SelectAssociations, SelectLanguage, FarmerProfile, FarmDetails, AddNewFarm, AddNewCrop, AddActivity, Activities, PreHarvest, HarvestBoard, WeatherAlerts, SampleBoard, Audit, Procurement, PostHarvestDashboard, Batches, AcceptGRN, InventoryDashboard, Location, OfflineMap, Settings, About.

**Deep links**
- `nesso://farmer/:id`
- `nesso://farm/:id`
- `nesso://batch/:batchId`
- `nesso://trace/:qrCode` (opens read-only batch trace)

## State management

| Concern | Tool | Notes |
|---|---|---|
| Auth (tokens, user) | Zustand `authStore` + MMKV | Tokens persisted encrypted via MMKV's `encryptionKey`. |
| Server state | TanStack Query | Persisted via `@tanstack/query-async-storage-persister` over MMKV. |
| Network status | Zustand `networkStore` | Set by NetInfo listener. |
| Sync progress | Zustand `syncStore` | Outbox size, last sync timestamp, errors. |
| Preferences (lang, theme) | Zustand `preferencesStore` + MMKV | |

## Offline strategy

See `modules/17-offline-sync.md` for the full design. Mobile-specific essentials:

1. **All reads** go through SQLite first (`SELECT ... FROM farmers_cache WHERE ...`).
2. After render, TanStack Query refetches from the API; on success the cache table is replaced.
3. **All writes** are `INSERT INTO mutation_outbox` first, then optimistically applied to the cache table. `SyncManager` drains the outbox.
4. Each row in `mutation_outbox` carries `(id, endpoint, method, payload, clientRequestId, retries, lastError, status)`.
5. Outbox drains on:
   - NetInfo `isConnected = true` transition
   - App foreground (`AppState` change to `active`)
   - 60s tick when foregrounded
   - Manual "Sync now" button in Settings

## Screens inventory

| # | Screen | Role | Key features |
|---|---|---|---|
| 1 | SplashLoading | all | Boot, prefetch user + counts |
| 2 | Login | all | Phone → OTP via Firebase; backend verifies ID token |
| 3 | SelectLanguage | all | 12-language picker, persists `@app_language` |
| 4 | SelectAssociations | officer | Multi-select FPO/Flower-Agent scope |
| 5 | Dashboard | officer/farmer | KPIs, weather widget, year filter, jump links |
| 6 | FarmerList | officer | Search, swipe-actions, infinite scroll, cached |
| 7 | FarmerProfile | officer | Tabs: FARM / FACILITIES / PRODUCE / FINANCIAL / INVENTORY / AGREEMENTS / TOKENS |
| 8 | RegisterFarmer | officer | Full form: personal + ID + bank + address |
| 9 | VerifyFarmer | officer | Pending approvals queue |
| 10 | FarmList | officer | Search + filters |
| 11 | FarmDetails | officer | Tabs: Crops / Activities / Weather / Certificates / Soil / Crop History |
| 12 | AddNewFarm | officer | Map polygon registration |
| 13 | AddNewCrop | officer | Crop form + calendar pickers |
| 14 | AddActivity | officer | 10 activity types + 180-item input picker + cost composition |
| 15 | Activities | officer | PENDING / APPROVED tabs, calendar view, filters |
| 16 | PreHarvest | officer | Report / Activities / Crop History tabs |
| 17 | HarvestBoard | officer/farmer | TODAY / TOMORROW / PLANNED groupings |
| 18 | WeatherAlerts | all | Open-Meteo forecast + activity tips |
| 19 | SampleBoard | officer/quality | Queue → Sent pipeline |
| 20 | Audit | officer/auditor | PENDING / APPROVED tabs |
| 21 | Procurement | procurement | List + filters |
| 22 | PostHarvestDashboard | procurement | Hub → Batches & Inventory |
| 23 | Batches | procurement | ORDER / BATCH view, filters, QR scan FAB |
| 24 | AcceptGRN | procurement | Camera scanner (QR/EAN13/EAN8/PDF417/Aztec/DataMatrix) + manual fallback |
| 25 | InventoryDashboard | procurement | SELL / TRANSFER / PROCESS actions |
| 26 | Location | officer | Manual location picker |
| 27 | OfflineMap | officer | Pre-download tiles for an area |
| 28 | Settings | all | Language, sync, profile, logout |
| 29 | About | all | App version, support links |

## Theme

NativeWind preset extends shared `packages/design-system/tailwind-preset.js`. See `09-design-system.md`. Brand color **`#147A44`** (Nesso primary).

## Permissions & native config (`app.json`)

- `scheme`: `nesso`
- `bundleIdentifier` / `package`: `app.nesso.farmer`
- iOS plist:
  - `NSLocationWhenInUseUsageDescription`
  - `NSCameraUsageDescription`
  - `NSPhotoLibraryUsageDescription`
- Android permissions:
  - `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
  - `CAMERA`
  - `INTERNET`, `ACCESS_NETWORK_STATE`
  - `POST_NOTIFICATIONS` (Android 13+)
- Expo plugins: `expo-router` (if adopted), `expo-splash-screen`, `expo-localization`, `expo-camera`, `expo-location`, `expo-notifications`, `@react-native-firebase/app`, `@react-native-firebase/auth`.

## Build pipeline

- **EAS Build** profiles in `eas.json`:
  - `development` — internal dev client
  - `preview` — APK for QA
  - `production` — Play/App Store builds
- `EXPO_PUBLIC_API_URL` injected per profile
- `EXPO_PUBLIC_SENTRY_DSN` set per env
- Pre-build hook: `pnpm typecheck && pnpm test`

## Error handling

- Root `ErrorBoundary` wraps `App.tsx`; sends to Sentry and shows a "Reload" button.
- Network errors surface via animated `Toast` (4s, bottom-anchored).
- Form errors render inline via `react-hook-form`.
- All TanStack Query mutations get an `onError` handler that toasts and rolls back the optimistic SQLite update.

## Telemetry

- Sentry for crashes
- Custom `analytics.track(event, props)` helper writes to an internal analytics endpoint when online, queues locally when offline
- Key events: `farmer.registered`, `farm.mapped`, `activity.logged`, `grn.accepted`, `sync.completed`, `sync.failed`
