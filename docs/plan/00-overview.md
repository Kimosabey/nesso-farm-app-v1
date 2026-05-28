# 00 — Overview

## Vision

Nesso is a **modern, offline-first farm-to-fork traceability platform** that digitally connects farmers, field agents, operations, warehouses, logistics, and consumers through real-time data and QR-powered transparency. The primary value chain is Indian horticulture / scented flowers (Tuberose, Jasmine, Marigold, Rose, Davana) with general-purpose support for vegetables, fruits, and cereals.

## What we are building (this version)

A v1 rewrite of the existing FoodSign platform onto a modern stack with the same feature surface and a cleaner architecture:

- **Mobile app** (Android + iOS) — for field officers, agents, and farmers
- **Web dashboard** — for admin, operations, procurement, warehouse, quality teams
- **Public QR portal** — for consumers, retailers, auditors
- **Backend** — NestJS + MongoDB + Redis, REST surface

## Personas

| Persona | Primary surface | Key goals |
|---|---|---|
| **Org Admin / MD (NESSO)** | Web | Approve farmers, KPIs, exports, manage users & warehouses |
| **Org Field Officer / Field Assistant** | Mobile | Onboard farmers, map fields, log activities |
| **Flower Agent / FPO** | Mobile + Web | Manage farmer clusters, approve harvest plans |
| **Farmer** | Mobile | View alerts & harvest plans, log self-reported activities |
| **Procurement Manager / Processor** | Web + Mobile | Scan batches, manage GRN and post-harvest inventory |
| **Auditor / Quality** | Web | Review samples and audits |
| **Consumer / Retailer** | QR portal | Scan a code, view farm-to-shelf timeline |

## Scope (in)

- Farmer onboarding with KYC (ID + bank) and approval workflow
- Farm registration with GPS polygon mapping
- Crop lifecycle (sowing → harvest) with multi-harvest support
- Activity logging (Package of Practices, ~180-item input catalog, costs)
- Pre-harvest planning (growth stages, weather alerts, scheduled tasks)
- Sampling, audits, certifications
- Procurement with payment tracking
- GRN scanning (QR + barcodes) and batch inventory with status transitions
- Public QR traceability timeline
- 12-language UI (en, hi, kn, bn, te, ta, ml, mr, tr, or, gu, vi)
- Offline-first mobile flows with sync queue
- Role-based access control across 15 roles
- Dashboard analytics + pre-harvest reports + exports

## Scope (out — future)

- Blockchain traceability
- IoT sensor ingestion
- ERP integrations
- Multi-tenant SaaS
- AI features (disease detection, yield prediction, chatbot) — see `12-known-gaps.md` roadmap
- Export compliance certification flows

## Success metrics

**Product**
- Active farmers onboarded
- Daily activities logged
- Pre-harvest records created
- QR scans by consumers
- Harvest → GRN → inventory conversion rate

**Technical**
- App launch < 3s
- API p95 < 500ms
- QR public page load < 2s
- Sync success rate > 99% over 7-day window
- Crash-free sessions > 99.5%

**Scale targets**
- 100K+ farmers
- 1M+ activity records
- 10K+ concurrent mobile clients during peak field hours

## Non-goals

- This is **not** a marketplace (no farmer↔consumer direct sales).
- This is **not** a financial product (no lending, no insurance underwriting).
- Payments are *recorded* (procurement payment status) but not *processed* in v1.

## Key constraints

- Field connectivity in rural India is unreliable → offline-first is mandatory, not optional.
- Many farmers are low-literacy → vernacular UI and image-heavy flows.
- Many field officers carry low-end Android devices → keep payloads small, avoid heavy JS bundles on mobile.
- Government KYC fields (Aadhaar, PAN, etc.) must be validated client-side before submission.
