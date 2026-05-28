# Module · Farm Mapping

## Purpose
Capture the physical location and boundary of a farmer's plot. Polygon drawing with GPS, area calculation, satellite preview.

## Surfaces
Mobile (primary capture), Web (review + thumbnail + interactive map).

## Data
- `farms` collection — `location` (point), `polygonPoints` (array), `mapScreenshotUrl` (S3)
- 2dsphere index on `location` for nearby queries

## APIs
| Method | Path |
|---|---|
| POST | `/farms` |
| GET | `/farms?farmerId&flowerAgentId&status` |
| GET | `/farms/:id` |
| PATCH | `/farms/:id` |
| DELETE | `/farms/:id` (soft) |
| GET | `/farms/nearby?lat&lng&radiusKm` |

## Screens

### Mobile — `AddNewFarm.tsx`
- Full-screen Leaflet (WebView) with two layers: Standard (OSM) / Satellite (Esri tile, attribution shown)
- **"Locate Me"** FAB → `expo-location` foreground; accuracy badge
- **Polygon mode**: tap to drop vertices; undo / clear / close-polygon buttons
- Auto **area calculation** (Haversine spherical-excess) in acres + hectares
- Side panel form (slide-up sheet):
  - farmName, surveyNumber
  - organicStage, previousPractice
  - waterSource (Borewell/River/Canal/Rain), soilType, ownership (Own/Lease/Share), fieldType (Open/Greenhouse/Shade-net)
  - farmArea (auto), growingArea
  - crop year pills (2024/2025/2026)
- On save: takes a snapshot of the visible map (Leaflet → PNG via `leaflet-image` shim), uploads to S3, stores key as `mapScreenshotUrl`

### Mobile — `FarmDetails.tsx`
- Top: polygon thumbnail (live Leaflet) + lat/lng + area
- Tabs: Crops / Activities / Weather / Certificates / Soil / Crop History

### Web — `/farms` and `/farms/[id]`
- List + interactive map (react-leaflet) with marker clustering
- Detail: full-width interactive map with polygon overlay; sidebar with metadata; edit modal

## UX & a11y
- WCAG 2.5.7: polygon vertex drag has a tap-to-add alternative (each tap adds a vertex; long-press a vertex opens edit/delete menu).
- Keyboard alt on web: arrow keys nudge selected vertex 1m; Delete removes; Enter closes polygon.
- Color-blind safe markers (shape + color).
- Reduced motion: vertex "pop" animation disabled.

## Permissions
- `ACCESS_FINE_LOCATION` + `ACCESS_COARSE_LOCATION` (Android)
- `NSLocationWhenInUseUsageDescription` (iOS)
- Requested *just-in-time* at "Locate Me" press, not at app launch

## Validation
- Polygon must have ≥ 3 vertices to save
- `farmArea` between 0.1 and 1000 acres (warn outside)
- `growingArea` ≤ `farmArea`
- Coordinates stored as `{lat: -90..90, lng: -180..180}`; 6 decimals max

## Offline
- All form input + polygon stored locally; map screenshot generation defers to first online moment
- `POST /farms` queued via outbox

## Performance
- Cap polygon vertices at 200 (warning at 100). Most farms fit in 20-50.
- Map tiles cached in WebView storage; pre-warm last 5 farms when online.

## Edge cases
- GPS accuracy worse than 30 m → show warning chip "Move to open area for better signal"
- User loses GPS mid-draw → keep what's captured; rely on pinch+pan
- Saving with offline imagery: snapshot generated when online, retroactively backfilled

## Acceptance criteria
- AC1: A 5-vertex polygon for a typical 1-acre plot is drawable in ≤ 60 s.
- AC2: Area calculation accurate within ±2% of a known reference plot.
- AC3: Map screenshot uploads to S3 and renders on the web detail page within 5 s of save.
- AC4: Polygon thumbnails render in farm list cards without layout shift (fixed 60×60).
- AC5: Drag alternative (tap-to-add) is fully usable without a single drag gesture.
