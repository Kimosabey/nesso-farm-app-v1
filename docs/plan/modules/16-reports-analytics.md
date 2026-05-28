# Module · Reports & Analytics

## Purpose
Operational KPIs, scoped lists with joins, and exports for stakeholders.

## Surfaces
Web (`/`, `/reports`, `/pre-harvest`), backend `reports` module.

## Data
Joins across `farmers`, `farms`, `crops`, `activities`, `preHarvest`, `procurements`, `inventory`.

## Endpoints
| Method | Path | Returns |
|---|---|---|
| GET | `/stats/dashboard` | KPIs + chart-ready aggregates |
| GET | `/reports/pre-harvest?…` | row-level join with activity rollup |
| GET | `/reports/farmer-summary?farmerId&from&to` | per-farmer fact sheet |
| GET | `/reports/procurement?from&to&association&status` | procurement value by association/crop |
| POST | `/reports/export` `{kind, filters, format}` | queue export → `{jobId}` |
| GET | `/reports/export/:jobId` | status + download URL when ready |

## `/stats/dashboard` response

```json
{
  "totalFarmers": 12345,
  "totalFarms": 23456,
  "totalCrops": 34567,
  "recent": [/* last 5 farmer registrations */],
  "activityProgress": {"overdue": 12, "completed": 340, "planned": 200, "cancelled": 4},
  "practices": {"organic": 4321, "conventional": 8024},
  "groups": {"flowerAgent": 2000, "other": 10345},
  "monthlyTrends": [{"month":"2026-04","registrations":234,"activities":1200}]
}
```

## Pre-harvest report

`GET /reports/pre-harvest?approvalStatus=approved&status=Pending&growthStage=Flowering&includeMissingFarm=false&includeFlowerAgents=true&onlyPreHarvest=true`

Returns:
```json
{
  "generatedAt": "...",
  "ms": 312,
  "filters": { ... },
  "totals": {
    "farmersAll": 12000,
    "farmersInScope": 4523,
    "farmersMissingFarm": 89,
    "farms": 6700,
    "crops": 9800,
    "preHarvestRecords": 14200
  },
  "rows": [
    {
      "farmer": { "id":"...", "name":"...", "association":"..." },
      "farm": { "id":"...", "name":"...", "areaAcres": 1.2 },
      "crop": { "id":"...", "name":"Tuberose", "variety":"Hybrid" },
      "preHarvest": { "growthStage":"Flowering", "status":"Pending" },
      "activityRollup": {
        "pending": 3, "completed": 7, "overdue": 1, "total": 11,
        "lastDate": "2026-05-20"
      }
    }
  ]
}
```

## Exports
- POST `/reports/export` queues a BullMQ `reports:export` job
- Worker writes XLSX/CSV to S3 and emails the link (also returned via polling)
- Large reports (> 50k rows) chunked into multiple files

## Dashboard charts (web)

| Chart | Source | Notes |
|---|---|---|
| ActivityProgressDonut | `activityProgress` | Overdue / Completed / Planned / Cancelled |
| PracticesPie | `practices` | Organic vs Conventional |
| FarmerGroupsPie | `groups` | Flower Agent vs Other |
| MonthlyTrendsLine | `monthlyTrends` | Registrations + activities by month |
| ProcurementValueBar | `/reports/procurement` | Top 10 associations |

## UX
- Filter builder uses URL params (sharable)
- Export button shows real-time job status; on completion a toast + auto-download
- Tables virtualize beyond 200 rows

## Performance
- Pre-harvest aggregation backed by Mongo aggregation pipeline with index hints; target p95 < 1.5 s for 10k farmers
- Materialized rollups for `farmer.counts.*` updated by activity write hooks (denorm to avoid heavy joins at read time)

## Permissions
- Read: per scope filter (`08-roles-permissions.md`)
- Exports: same scope; the queued job stamps the requesting user

## Edge cases
- Exporting > 100k rows: backend rejects with 413 and suggests narrower filters
- Concurrent exports limited to 3 per user

## Acceptance criteria
- AC1: Dashboard KPI cards paint with cached data in < 500 ms; refresh fetches in background.
- AC2: Pre-harvest report with 10k row scope returns p95 < 1.5 s.
- AC3: XLSX export with 25k rows completes in ≤ 60 s.
- AC4: Filter changes reflect in URL and survive a page refresh.
