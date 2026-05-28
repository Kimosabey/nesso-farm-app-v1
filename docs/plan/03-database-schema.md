# 03 — Database Schema

MongoDB 7. Collection names use the `nesso_` prefix to avoid clashes with legacy FoodSign collections during migration.

**Conventions**
- Every doc has `_id: ObjectId`, `createdAt: Date`, `updatedAt: Date`, `createdBy: ObjectId` (User), `updatedBy: ObjectId`, `isDeleted: boolean` (default false).
- Foreign keys store both `ObjectId` reference and a denormalized human-readable name (e.g. `farmerId` + `farmerName`) for read-heavy list endpoints.
- All collections support **soft delete with cascades**: deleting a farmer soft-deletes their farms, crops, activities, samples, audits, procurements.
- All `*_imageUrl` and `*_docUrl` fields store **S3 object keys**, never base64. Pre-signed URLs are generated on read by the backend.

---

## ER (textual)

```
USER ─┐ (auth)
       │
FARMER 1─* FARM 1─* CROP 1─* ACTIVITY
   │                       1─* PRE_HARVEST
   ├─* SAMPLE
   ├─* AUDIT
   ├─* PROCUREMENT ─* INVENTORY (batch)
   ├─* LOCATION (GPS waypoints)
   └─* NOTIFICATION
WAREHOUSE (master) ← inventory
QR_CODE 1─1 INVENTORY (batch-level)
AUDIT_LOG (admin actions)
DEVICE (push tokens, mobile session)
```

---

## Collections

### `users`
Staff and admin accounts. Farmers do **not** live here (they're in `farmers`) but can log in via OTP that resolves through `farmers` instead.

| Field | Type | Notes |
|---|---|---|
| `phone` | String | **UNIQUE**, login key (10-digit Indian) |
| `email` | String | optional, unique if set |
| `passwordHash` | String | bcrypt(12); plain text never stored |
| `firstName`, `lastName` | String | |
| `role` | String enum | see `08-roles-permissions.md` |
| `participantType` | enum | ORG / FPO / Flower Agent / Field Officer / Procurement Manager / Processor |
| `participantId`, `participantName` | String | the org/FPO they belong to |
| `fpoId`, `flowerAgentId` | ObjectId (FK) | optional hierarchy |
| `preferredLanguage` | String enum | one of 12 codes |
| `status` | enum | `active` \| `inactive` |
| `activeStartDate`, `activeEndDate` | Date | |
| `address` | Embedded `{country,state,district,city,pincode,addressLine1}` | |
| `lastLoginAt` | Date | |

**Indexes:** `{ phone: 1 }` unique, `{ email: 1 }` unique sparse, `{ role: 1 }`.

---

### `farmers`
Root domain entity. The legacy `foodsign_nesso` collection.

| Field | Type | Notes |
|---|---|---|
| `farmerId` | String | **UNIQUE**, auto-assigned `NES-F-YYYY-NNNNN` |
| `firstName`, `lastName` | String | |
| `mobileNumber` | String | **UNIQUE** primary identifier; `FA-{ts}` allowed for flower-agents w/o phone |
| `gender` | enum | M/F/Other |
| `dob` | Date | |
| `email` | String | optional |
| `groupAssociation` | enum | INDEPENDENT / FLOWER_AGENT / FPO |
| `isFlowerAgent` | Boolean | sub-type flag |
| `role` | String | farmer-side role (see roles doc) |
| `address` | Embedded | `{state,district,taluka,hobli,city,village,town,pincode,line1}` |
| `idProof` | Embedded | `{type, number, imageUrl}` — type ∈ Aadhaar/Voter/PAN/Passport/DL/Ration/MNREGA/NationalID |
| `bank` | Embedded | `{accountNumber, ifsc, bankName, branchName, passbookImageUrl}` |
| `profileImageUrl` | String | S3 key |
| `totalLandHolding` | Number | acres |
| `noOfFarms` | Number | denormalized count |
| `selectedCrops` | [String] | |
| `productionPractice` | enum | Organic / Conventional / NaturalFarming / GAPCertified |
| `variety` | String | |
| `preferredLanguage` | String | |
| `approvalStatus` | enum | `pending` (default) \| `approved` \| `rejected` |
| `approvedBy`, `approvedAt`, `rejectionReason` | mixed | |
| `managedBy`, `managingEntity`, `fpoId`, `flowerAgentId`, `parentAssociationId`, `farmGroup` | hierarchy fields | |
| `counts` | Embedded | `{activitiesDone, activitiesPlanned, activitiesOverdue}` (denormalized) |

**Indexes:** `{ farmerId: 1 }` unique, `{ mobileNumber: 1 }` unique, `{ approvalStatus: 1, isDeleted: 1 }`, `{ flowerAgentId: 1 }`, `{ fpoId: 1 }`, geo index on `address.pincode` text.

---

### `farms`
| Field | Type |
|---|---|
| `farmId` | String unique, auto `NES-FM-YYYY-NNNNN` |
| `farmerId` | ObjectId (FK farmers) |
| `farmerName` | String denorm |
| `farmName`, `surveyNumber` | String |
| `farmArea`, `growingArea` | Number (acres) |
| `organicStage` | enum | Certified / InTransition / Conventional |
| `previousPractice`, `waterSource`, `soilType`, `ownership`, `fieldType` | String enums |
| `location` | Embedded | `{latitude, longitude, accuracy, altitude}` |
| `polygonPoints` | `[{lat:Number, lng:Number}]` | |
| `mapScreenshotUrl` | String | S3 key |
| `address` | Embedded | same shape as farmers.address |
| `flowerAgentId`, `flowerAgentName`, `associationName`, `associationType` | denorm |
| `status`, `farmStatus`, `approvalStatus` | enums |
| `cropSummary` | Embedded | `{cropName, cropStatus, cropYear, dimension}` for fast list rendering |
| `counts` | Embedded | activitiesDone/Planned/Overdue |

**Indexes:** `{ farmerId: 1 }`, `{ flowerAgentId: 1 }`, `{ farmId: 1 }` unique, **2dsphere** on `location` (converted to GeoJSON Point at write).

---

### `crops`
| Field | Type |
|---|---|
| `cropId` | String unique auto |
| `farmId`, `farmerId` | FK |
| `cropName` | String |
| `cropType` | enum | Main / Inter / Border |
| `cropVariety` | String |
| `unit` | enum | kg / quintal / tonne / nos |
| `acre`, `mappedAcre`, `estHarvest` | Number |
| `waterType` | enum | RAINFED / IRRIGATION |
| `method` | enum | SOWING / PLANTING |
| `practice` | enum | CONVENTIONAL / ORGANIC |
| `sowingDate`, `harvestDate` | Date |
| `multipleHarvest` | Boolean |
| `season` | enum | Kharif/Rabi/Summer/Perennial/Anytime/All |
| `counts` | Embedded | activitiesDone/Planned/Overdue |

**Indexes:** `{ farmId: 1 }`, `{ farmerId: 1 }`, `{ cropYear: -1 }`.

---

### `activities`
Activity log (Package of Practices).

| Field | Type |
|---|---|
| `farmId`, `cropId`, `farmerId` | FK + denorm names |
| `activity` | String | Watering / Spraying / Harvest / LandPrep / etc. |
| `cropAge` | String (days since sowing) |
| `scheduledOn`, `completedDate`, `enteredDate` | Date |
| `status` | enum | Pending / Completed / Overdue / Cancelled |
| `popCompliance` | String | reference to POP catalog id |
| `inputs` | `[{ kind:Chemical/Organic/Inventory/Other, itemId, name, quantity, unit, cost }]` |
| `totalCost` | Number (auto) |
| `notes` | String |
| `photos` | [String] | S3 keys |
| `geoTag` | Embedded `{lat, lng, accuracy}` |
| `clientRequestId` | String | for idempotent offline sync |

**Indexes:** `{ farmId: 1, scheduledOn: -1 }`, `{ cropId: 1 }`, `{ status: 1, scheduledOn: 1 }`, `{ clientRequestId: 1 }` unique sparse.

---

### `preHarvest`
Pre-harvest activities, growth stages, weather alerts. Separate from `activities` because it's plan-side rather than execution-side.

| Field | Type |
|---|---|
| `farmerId`, `farmId`, `cropId` | FK + denorm |
| `cropName`, `cropVariety` | denorm |
| `cropCategory` | enum | ScentedFlowers / Vegetables / Fruits / Cereals / Other |
| `activityType` | enum | FarmActivity / CropGrowth / WeatherAlert |
| `title` | String required |
| `growthStage` | enum | Germination / Vegetative / Flowering / HarvestReady / Harvested |
| `season` | enum | Kharif / Rabi / Summer / Perennial / Anytime / All |
| `status` | enum | Pending / InProgress / Completed |
| `sowingDate`, `scheduledDate`, `completedDate` | Date |
| `postedBy` | enum | farmer / admin / agent |
| `notes` | String |
| `attachments` | [String] | S3 keys |

**Indexes:** `{ farmerId: 1, status: 1 }`, `{ farmId: 1 }`, `{ growthStage: 1 }`.

---

### `samples`
| Field | Type |
|---|---|
| `sampleCode` | String **UNIQUE** auto `NES-S-YYYY-NNNNN` |
| `farmerId`, `farmerName`, `association` | denorm |
| `crop`, `variety` | String required |
| `season` | enum |
| `status` | enum | Queue / Sent / Received / Tested / Rejected |
| `sentDate`, `receivedDate`, `testedDate` | Date |
| `result` | Mixed | lab payload |
| `notes` | String |

**Indexes:** `{ sampleCode: 1 }` unique, `{ status: 1 }`, `{ farmerId: 1 }`.

---

### `audits`
| Field | Type |
|---|---|
| `farmerId`, `farmerName`, `association` | denorm |
| `auditType` | enum | Internal / External / Compliance |
| `description`, `remarks` | String |
| `status` | enum | Pending / Approved / Rejected |
| `auditDate` | Date required |
| `reviewedBy` | ObjectId (users) |
| `reviewedAt` | Date |
| `attachments` | [String] |

**Indexes:** `{ status: 1, auditDate: -1 }`, `{ farmerId: 1 }`.

---

### `procurements`
| Field | Type |
|---|---|
| `procurementId` | String unique auto |
| `farmerId`, `farmerName`, `association` | denorm |
| `crop`, `variety` | |
| `quantity`, `pricePerUnit`, `totalAmount` | Number (totalAmount auto-computed) |
| `unit` | enum | kg / quintal |
| `procurementDate` | Date required |
| `status` | enum | Pending / Completed / Cancelled |
| `paymentStatus` | enum | Unpaid / Partial / Paid |
| `paymentRecords` | `[{ amount, date, method, referenceNo }]` |
| `linkedBatchId` | String (FK inventory) |

**Indexes:** `{ status: 1, procurementDate: -1 }`, `{ farmerId: 1 }`, `{ linkedBatchId: 1 }`.

---

### `inventory`
Batch-level traceability records.

| Field | Type |
|---|---|
| `batchId` | String **UNIQUE** auto `NES-B-YYYY-NNNNN` |
| `productName`, `variant`, `grade`, `supplier` | String |
| `warehouseId` | ObjectId (FK warehouses) |
| `warehouseName` | denorm |
| `type` | enum | RawMaterial / SemiProcessed / FinishedGood |
| `currentStage` | String | e.g. Received / Cleaned / Sorted / Packed |
| `status` | enum | AVAILABLE / PROCESSING / SOLD / TRANSFERRED |
| `quantity`, `unit` | |
| `incomingDate`, `expiryDate` | Date |
| `qrCode` | String | FK qrCodes.code |
| `linkedProcurementId` | String | back-reference |
| `stageHistory` | `[{ stage, at, by, notes }]` | append-only |

**Indexes:** `{ batchId: 1 }` unique, `{ status: 1 }`, `{ warehouseId: 1 }`, `{ qrCode: 1 }`.

---

### `warehouses`
| Field | Type |
|---|---|
| `warehouseName` | String |
| `type` | enum | Storage / FoodProcessing |
| `availableFacility` | String |
| `primaryContact` | Embedded `{name, mobileNumber, email}` |
| `incorporationDate` | Date |
| `ownership` | enum | Own / Leased |
| `capacity`, `totalArea` | Number |
| `certificationStatus` | enum | Applied / Conventional / Certified |
| `certifyingAgency` | String |
| `location` | Embedded `{latitude, longitude}` + address |

**Indexes:** `{ warehouseName: 1 }`, 2dsphere on `location`.

---

### `locations`
GPS waypoints (separate from farms so a farmer can add Home / Field A / Field B).

| Field | Type |
|---|---|
| `farmerId`, `farmerName`, `association` | denorm |
| `label` | String required |
| `latitude`, `longitude`, `altitude`, `accuracy` | Number |
| `type` | enum | Farm / Home / Other |
| `addedBy` | ObjectId (users) |

**Indexes:** `{ farmerId: 1 }`, 2dsphere on location.

---

### `qrCodes`
| Field | Type |
|---|---|
| `code` | String **UNIQUE** | URL-safe slug |
| `batchId` | String FK |
| `payload` | Mixed | denormalized trace timeline snapshot (regenerated on inventory update) |
| `imageUrl` | String S3 | PNG of QR |
| `scanCount` | Number | incremented on public hit |
| `firstScannedAt`, `lastScannedAt` | Date |

**Indexes:** `{ code: 1 }` unique, `{ batchId: 1 }`.

---

### `notifications`
| Field | Type |
|---|---|
| `userId` | ObjectId (users OR farmers) |
| `kind` | enum | weather / activityReminder / approval / sync / system |
| `title`, `body` | String |
| `data` | Mixed | navigation hint |
| `status` | enum | queued / sent / delivered / read / failed |
| `channel` | enum | push / inApp / sms |
| `scheduledFor` | Date |
| `deliveredAt`, `readAt` | Date |

**Indexes:** `{ userId: 1, status: 1 }`, `{ scheduledFor: 1 }`.

---

### `devices`
Mobile push tokens and session metadata.

| Field | Type |
|---|---|
| `userId` | ObjectId (users or farmers) |
| `expoPushToken` | String |
| `platform` | enum | ios / android |
| `appVersion` | String |
| `osVersion` | String |
| `lastSeenAt` | Date |

**Indexes:** `{ userId: 1 }`, `{ expoPushToken: 1 }` unique.

---

### `auditLogs`
All admin and field-officer mutations (write path).

| Field | Type |
|---|---|
| `actorId` | ObjectId |
| `actorRole` | String |
| `action` | String | e.g. `farmer.approve`, `inventory.transfer` |
| `resource` | String | e.g. `farmer:abc123` |
| `before`, `after` | Mixed | minimal diff |
| `ip`, `userAgent` | String |
| `at` | Date |

**Indexes:** `{ resource: 1, at: -1 }`, TTL index on `at` for 365 days.

---

### `popCatalog` (Package-of-Practices catalog)
Replaces FoodSign's hard-coded POP list.

| Field | Type |
|---|---|
| `popId` | String unique |
| `crop`, `variety` | String |
| `year` | Number |
| `title` | String | e.g. "Tuberose-Hybrid POP 2022" |
| `activities` | `[{ stage, daysFromSowing, activity, recommendedInputs, notes }]` |

**Indexes:** `{ crop: 1, variety: 1, year: -1 }`.

---

### `inputCatalog`
The ~180 inputs (chemical / organic / inventory items) used by `activities.inputs`.

| Field | Type |
|---|---|
| `code` | String unique |
| `name` | String |
| `kind` | enum | Chemical / Organic / Inventory / Other |
| `unit` | String |
| `defaultCost` | Number |
| `searchTokens` | [String] | for fast in-app search |

**Indexes:** `{ kind: 1, name: 1 }`, text index on `name + searchTokens`.

---

## Migration from FoodSign

If migrating existing data, see `12-known-gaps.md` "Migration plan" section. High-level mapping:

| FoodSign | Nesso v1 |
|---|---|
| `foodsign_nesso` | `farmers` |
| `foodsign_farms` | `farms` |
| `foodsign_crops` | `crops` |
| `foodsign_activities` | `activities` |
| `foodsign_preharvest` | `preHarvest` |
| `foodsign_samples` | `samples` |
| `foodsign_audits` | `audits` |
| `foodsign_procurements` | `procurements` |
| `foodsign_warehouses` | `warehouses` |
| `foodsign_locations` | `locations` |
| `inventory` | `inventory` |
| `users` | `users` |
| _(implicit; hard-coded)_ | `popCatalog` |
| _(new)_ | `qrCodes`, `notifications`, `devices`, `auditLogs`, `inputCatalog` |

Base64 image fields require a one-time job: extract → upload to S3 → store key in new field → drop the base64 column.
