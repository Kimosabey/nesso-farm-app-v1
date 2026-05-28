# Module · Warehouse

## Purpose
Master data for storage / processing facilities used by inventory batches.

## Surfaces
Web (`/warehouses` under Settings), Mobile (read-only picker in GRN).

## Data
- `warehouses` collection
- 2dsphere index on `location`

## APIs
| Method | Path |
|---|---|
| GET | `/warehouses` |
| POST/PATCH | `/warehouses[/:id]` |
| DELETE | `/warehouses/:id` (soft) |

## Screens

### Web — `/warehouses`
- Card grid + map view toggle
- Form: warehouseName, type (Storage / FoodProcessing), capacity, totalArea, ownership (Own/Leased), incorporationDate, primary contact (name/phone/email), certification (status, agency), full address with lat/lng (geocode helper button)
- Bulk-import CSV

### Mobile
- Used as a picker in `AcceptGRN.tsx` and InventoryDashboard; no edit surface

## UX
- Map view uses react-leaflet with marker clusters
- Certification badge with icon

## Validation
- Capacity ≥ 0
- TotalArea ≥ 0
- Coordinates within India bbox (configurable)

## Edge cases
- A soft-deleted warehouse remains referenced by historical batches; the read endpoint marks them `(archived)` in the picker
- Geocoding fallback: if user enters address but no coords, backend reverse-geocodes via Nominatim

## Acceptance criteria
- AC1: Adding a warehouse with full details creates it and shows it on the map within one refresh.
- AC2: Bulk CSV import handles 100 rows in ≤ 5 s and reports per-row errors.
- AC3: Soft-deleted warehouses are excluded from the GRN picker.
