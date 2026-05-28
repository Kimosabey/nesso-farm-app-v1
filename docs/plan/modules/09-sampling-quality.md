# Module · Sampling & Quality

## Purpose
Manage the sample-to-lab pipeline that backs quality and certification decisions.

## Surfaces
Mobile (`SampleBoard.tsx`), Web (`/samples`).

## Data
- `samples` collection
- `popCatalog` referenced for guidance

## APIs
| Method | Path |
|---|---|
| GET | `/samples?status&crop&variety&association` |
| GET | `/samples/crops` (distinct list) |
| GET | `/samples/varieties` (distinct list) |
| POST/PATCH | `/samples[/:id]` |
| DELETE | `/samples/:id` |

## Status machine
```
Queue → Sent → Received → Tested → (Approved | Rejected)
```
Transitions only forward; admin override allowed with reason captured in audit log.

## Screens

### Mobile — `SampleBoard.tsx`
- Tabs: Queue / Sent
- Add sample modal: pick farmer → crop → variety → season; auto-generates `sampleCode NES-S-YYYY-NNNNN`
- Action button "Send to lab" sets status & date

### Web — `/samples`
- Table with status, code, farmer, crop, variety, sent date, tested date, result
- Filters; bulk transition
- Per-row drawer with full timeline + audit log

## UX
- Status chip uses both color and icon
- Code is a tappable copyable chip

## Validation
- `crop`, `variety` required
- `sampleCode` unique server-side (auto generated, retried on collision)

## Edge cases
- Rejected samples can spawn a re-sample workflow (creates a new linked record)
- Test results may be a free-form JSON `result` payload (lab integration varies)

## Acceptance criteria
- AC1: A sample created on mobile in the Queue appears on web in ≤ 5 s.
- AC2: Status transitions are atomic and audit-logged.
- AC3: Sample code is unique across a 5-year window in load test (1M samples).
