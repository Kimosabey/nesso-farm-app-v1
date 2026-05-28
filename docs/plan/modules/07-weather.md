# Module · Weather

## Purpose
Current conditions and 7-day forecast per farm; advisories that turn into pre-harvest records when actionable (rain alert, frost risk, spray window).

## Surfaces
Mobile (Dashboard widget + `WeatherAlerts`), Web (Farm detail tab).

## Integration
- **Open-Meteo** (free, no key) via backend proxy `/geo/weather?lat&lng`
- Backend caches per (lat,lng) rounded to 4 decimals for 60 minutes
- Per-farm: uses `farms.location.latitude/longitude`; falls back to `address.pincode → centroid` if missing
- Optional: IMD/Skymet integration post-GA

## APIs
| Method | Path |
|---|---|
| GET | `/geo/weather?lat&lng` → `{current, daily[7], hourly[48]}` |
| GET | `/farms/:id/weather` → enriched per-farm payload + advisories |
| GET | `/notifications?kind=weather` → past weather alerts for user |

## Backend processing
- A BullMQ daily job (`weather:advisories`) iterates active farms, fetches forecasts, and emits advisories:
  - Heavy rain in next 48h → pre-harvest `WeatherAlert` + push to assigned officer
  - Frost risk (min temp < 4°C for non-cold-tolerant crops) → push
  - Spray window (no rain 24h + wind < 10 km/h) → in-app suggestion
- Advisory cards are written to `preHarvest` collection so they show in the same report

## Screens

### Mobile — Dashboard widget
- Compact card: today's temp + icon + 24h precipitation chance + "3-day outlook" link
- Tap → `WeatherAlerts.tsx`

### Mobile — `WeatherAlerts.tsx`
- Daily forecast cards (7 days) with icon + min/max + precipitation
- Hourly graph (12h) using `react-native-svg-charts`
- Activity tips inline ("Avoid spraying tomorrow — 8mm rain expected")
- Pull-to-refresh; offline shows last cached snapshot with timestamp

### Web — Farm detail "Weather" tab
- Same 7-day view + 14-day climatology comparison
- Map overlay: precipitation tiles (Open-Meteo radar) on the farm map

## UX & a11y
- Weather icons have text labels (not icon-only)
- Reduced-motion: hourly chart entrance animation skipped

## Validation
- Coordinate sanity: lat ∈ [-90,90], lng ∈ [-180,180]
- Backend rejects requests > 2 hops outside India bbox (configurable) in production to limit cost

## Caching
- Redis key: `weather:{lat4}:{lng4}`, TTL 60 min
- Stale cache served (with `X-Cache-Stale: true`) if Open-Meteo is down

## Edge cases
- Farm without coordinates: fall back to pincode centroid; show "Approximate" badge
- Open-Meteo rate limit: serve stale + alert on-call

## Acceptance criteria
- AC1: A farm's weather widget paints in ≤ 800 ms on a warm cache.
- AC2: A heavy-rain advisory fires a push within 5 minutes of the daily job.
- AC3: Hourly chart renders for the next 12 hours and is keyboard-navigable on web.
