# Module · Procurement

## Purpose
Record purchase of farm produce from a farmer: crop, variety, quantity, price, payment status. Generates the upstream record that GRN-accepts into inventory.

## Surfaces
Mobile (`Procurement.tsx`), Web (`/procurement`).

## Data
- `procurements` collection
- `paymentRecords[]` embedded (multiple partial payments allowed)
- `linkedBatchId` set on GRN acceptance

## APIs
| Method | Path |
|---|---|
| GET | `/procurement?status&from&to&association` |
| GET | `/procurement/stats` → `{total, pending, completed, totalValue}` |
| POST/PATCH/DELETE | `/procurement[/:id]` |
| POST | `/procurement/:id/payment` → append a `paymentRecords` entry |

## Status × Payment matrix
- `status` ∈ {Pending, Completed, Cancelled}
- `paymentStatus` ∈ {Unpaid, Partial, Paid}
- `paymentStatus` is derived from `paymentRecords` sum vs `totalAmount`; server recomputes on each payment append

## Screens

### Mobile — `Procurement.tsx`
- List with filter chips (Pending / Completed / Cancelled)
- Tap → detail with payment breakdown
- "Record payment" sheet captures amount, method (Cash / Bank / UPI / Other), reference no, date

### Web — `/procurement`
- KPI cards using `/procurement/stats`
- Table with bulk actions (cancel, mark completed)
- Detail drawer with the same payment recorder

## UX
- `totalAmount` auto-computed as `quantity * pricePerUnit`; field is read-only with a recompute button if quantity/price changes
- Partial payment shows a progress bar (paid / total)

## Validation
- `quantity > 0`, `pricePerUnit > 0`
- `procurementDate` ≤ today
- Payment sum cannot exceed `totalAmount * 1.1` (10% overpayment tolerance with warning)

## Edge cases
- Cancelled procurement cannot transition forward; new record required for reopen
- Linked inventory batch: cancelling a procurement that already produced a batch requires admin override + audit reason

## Acceptance criteria
- AC1: Stats card values reconcile with the filtered list totals.
- AC2: Recording a partial payment updates `paymentStatus` immediately without a manual transition.
- AC3: A cancelled procurement is excluded from `totalValue` in stats.
