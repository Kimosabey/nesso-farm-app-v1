# Module · Audits

## Purpose
Internal / external / compliance audits against farmer or farm records. Reviewer (`qualityAuditor`) approves or rejects with remarks.

## Surfaces
Mobile (`Audit.tsx`), Web (`/audits`).

## Data
- `audits` collection
- Linked attachments in S3

## APIs
| Method | Path |
|---|---|
| GET | `/audits?status&auditType&association` |
| POST/PATCH | `/audits[/:id]` |
| DELETE | `/audits/:id` |

## Status machine
```
Pending → (Approved | Rejected)
```
Optional re-open via admin → returns to Pending; audit log captures the path.

## Screens

### Mobile — `Audit.tsx`
- Tabs: PENDING / APPROVED / REJECTED
- Each row: farmer, association, auditType, auditDate, description
- Tap: detail with attachments, approve / reject buttons (gated by role)

### Web — `/audits`
- Table with bulk approve / reject (reason mandatory for reject)
- Filters on type, status, association, date range

## UX
- Reject opens a modal with a free-text reason and at least one tag (NonCompliance / DocumentMissing / DataMismatch / Other)
- Approved audits enable downstream certifications

## Validation
- `auditType` enum
- `auditDate` ≤ today
- `reviewedBy` set automatically to current user on transition

## Edge cases
- Auditor can't approve their own created audit (separation of duties)
- Mass-approve restricted to admin/orgMD

## Acceptance criteria
- AC1: Pending count badge on web sidebar matches `/audits?status=Pending` count.
- AC2: Reject without reason is blocked client-side and server-side.
- AC3: Bulk approve > 50 records completes in a single transaction.
