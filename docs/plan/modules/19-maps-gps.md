# Module · Maps & GPS

## Purpose
Map rendering, GPS capture, polygon authoring, and offline tile caching across mobile and web.

## Surfaces
Mobile (`AddNewFarm`, `Location`, `OfflineMap`, weather radar overlay), Web (Farm list/detail, Warehouse list).

## Tech
- **Tiles:** OpenStreetMap (OSM) for standard + Esri World Imagery for satellite (attribution preserved). No Google Maps billing.
- **Web:** `react-leaflet`
- **Mobile:** Leaflet inside `react-native-webview` (proven pattern from FoodSign; avoids `react-native-maps` Expo Go crashes)
- **Geocode (forward/reverse):** Nominatim (OSM), proxied through backend with caching
- **Offline tiles:** Mobile pre-downloads a region's tiles into local Filesystem (Expo FileSystem) and serves them to the WebView via a custom URL scheme

## APIs
| Method | Path |
|---|---|
| GET | `/geo/reverse?lat&lng` |
| GET | `/geo/forward?q` |
| GET | `/geo/tiles/{z}/{x}/{y}.png` (optional proxy if direct OSM hits become problematic) |

Caching:
- Reverse geocode: Redis 7 days
- Forward geocode: 7 days
- Tile proxy (if used): 30 days, S3-backed

## Permissions

### Mobile
- Foreground only via `expo-location`
- Just-in-time prompt at first "Locate Me" press, not at app launch
- Permission denied → manual lat/lng entry fallback in `Location.tsx`

### Web
- HTTPS-only origin (geolocation API requires it)
- `navigator.geolocation.getCurrentPosition` with a clear inline explanation

## Polygon editor (mobile)
- Tap-to-add vertex (primary interaction; satisfies WCAG 2.5.7)
- Long-press a vertex → context menu (Insert before / Delete)
- Pinch + pan via Leaflet
- Undo / Clear / Close-polygon controls
- Live area readout in acres + hectares (Haversine spherical-excess)

## Polygon editor (web)
- Mouse: click to add, drag to move vertex, double-click to close
- Keyboard alt: arrow keys nudge selected vertex by 1m; Enter closes; Delete removes
- Shapes saved as `[{lat, lng}]` with same Haversine area calc on both sides for parity

## Offline tile bundles
- `OfflineMap.tsx` lets the officer pre-download tiles for a bounding box at zoom levels 10–17 (capped at ~50 MB per region)
- Tiles stored under `FileSystem.documentDirectory + 'tiles/{regionId}/...'`
- WebView intercepts tile requests via a custom URL scheme handler and serves from disk
- Regions are versioned; user can purge a region in Settings

## UX & a11y
- Map controls (zoom, layer toggle) keyboard-accessible on web
- Mobile maps have a "Help" overlay first-time explaining tap-to-add
- High-contrast vertex markers (filled circle + outline)
- Reduced motion: polygon vertex animation collapses to instant

## Performance
- Tile cache (web): browser HTTP cache + service worker if installed
- Polygon vertex limit: 200 (warn at 100)
- Marker clustering on web above 100 points (`leaflet.markercluster`)

## Edge cases
- GPS spoofed / impossible jump (> 200 m in < 1 s) → ignore the sample, keep last good
- Map screenshot generation fails (WebView headless render fails) → retry on next sync; cache without screenshot for now
- User on a slow tile network → show a loading skeleton over the map instead of a half-rendered grid

## Acceptance criteria
- AC1: Cold map open on mobile loads tiles within 3 s on 4G.
- AC2: Polygon area on 1-acre test plot accurate within ±2%.
- AC3: Offline region (50 MB) usable end-to-end without network for the cached extent.
- AC4: Web polygon editor is fully usable via keyboard alone.
- AC5: Marker clustering keeps web farm list interactive at 10,000 markers.
