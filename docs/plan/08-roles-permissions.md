# 08 — Roles & Permissions

## Role catalog

Imported from FoodSign's `/admin/settings/options` and extended.

| Code | Label | Primary surface |
|---|---|---|
| `admin` | Admin | Web |
| `orgMD` | (ORG) MD | Web |
| `orgNESSO` | (ORG) NESSO | Web |
| `orgTechSupport` | (ORG) Tech Support | Web |
| `orgAgent` | (ORG) Agent | Mobile + Web |
| `orgFieldOfficer` | (ORG) Field Officer | Mobile |
| `orgFieldAssistant` | (ORG) Field Assistant | Mobile |
| `orgFarmer` | (ORG) Farmer | Mobile |
| `orgFPO`, `orgFPO1` | (ORG) FPO / FPO1 | Web |
| `orgSouhardha` | (ORG) Souhardha | Web |
| `fpo` | FPO | Web |
| `flowerAgent` | Flower Agent | Mobile + Web |
| `fieldOfficer` | Field Officer | Mobile |
| `farmer` | Farmer | Mobile |
| `procurementManager` | Procurement Manager | Web + Mobile |
| `processor` | Processor | Web + Mobile |
| `qualityAuditor` | Quality / Auditor | Web |

## Permission matrix (resource × action × role)

`C`=create, `R`=read, `U`=update, `D`=delete (soft), `A`=approve, `X`=execute (status transition / export / generate)

| Resource | admin / orgMD | orgFieldOfficer / fieldOfficer | flowerAgent | fpo / orgFPO | procurementManager / processor | qualityAuditor | farmer |
|---|---|---|---|---|---|---|---|
| users | CRUD | — | — | — | — | — | — |
| farmers | CRUDA | CRU (own scope) | RU (own cluster) | R (own FPO) | R | R | R (self) |
| farmer approval | A | — | — | A (own cluster) | — | — | — |
| farms | CRUD | CRU (own scope) | RU | R | R | R | R (self) |
| crops | CRUD | CRU | RU | R | R | R | R (self) |
| activities | CRUD | CRU | RU | R | R | R | CR (self, limited types) |
| pre-harvest | CRUD | CRU | RU | R | R | R | R (self) |
| samples | CRUD | CR | CR | — | — | CRUDA | — |
| audits | CRUD | — | — | — | — | CRUDA | — |
| procurement | CRUDA | — | — | — | CRUDA | R | R (self) |
| warehouses | CRUD | R | — | — | R | R | — |
| inventory | CRUDX | — | — | — | CRUX | R | — |
| qr generate | X | — | — | — | X | — | — |
| reports | RX | R (own scope) | R (own cluster) | R (own FPO) | R | R | — |
| settings catalogs | CRUD | R | R | R | R | R | R |

**Scope** modifiers:
- "own scope" = farmers/farms where `managedBy = currentUser.userId`
- "own cluster" = farmers where `flowerAgentId = currentUser.flowerAgentId`
- "own FPO" = farmers where `fpoId = currentUser.fpoId`
- "self" = the row where `farmerId = currentUser.farmerId` (farmer login)

## JWT claims

```json
{
  "sub": "<userId>",
  "role": "orgFieldOfficer",
  "participantType": "Field Officer",
  "fpoId": "...",
  "flowerAgentId": "...",
  "farmerId": "...",
  "permissions": ["farmer:create","farmer:read",...],
  "iss": "nesso",
  "aud": "nesso-api",
  "exp": 1700000000
}
```

`permissions` is the flattened permission array computed from role + scope at login time. Saves the backend from rebuilding it on every request.

## Backend enforcement

### `@Roles(...roles)` decorator

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'orgMD')
@Get('users')
listUsers() { ... }
```

### `@Permission('farmer:approve')` decorator

For finer-grained checks. The `RolesGuard` accepts whichever set the route declares.

### Scope filtering

For "own scope" / "own cluster" resources, the service layer adds a Mongo filter automatically:

```ts
buildScopeFilter(user) {
  if (user.role === 'admin') return {};
  if (user.role === 'flowerAgent') return { flowerAgentId: user.flowerAgentId };
  if (user.role === 'fpo') return { fpoId: user.fpoId };
  if (user.role.startsWith('orgField')) return { managedBy: user.userId };
  if (user.role === 'farmer') return { _id: user.farmerId };
  return { _id: null };  // deny by default
}
```

Every list endpoint composes its `req.query` filter with `buildScopeFilter(req.user)`.

### Audit logging

Every write goes through `AuditLogInterceptor`, which captures `{actorId, actorRole, action, resource, before, after, ip, at}`. Indexed by resource for forensic queries.

## Frontend enforcement

- Web: `useCurrentRole()` + `<RequireRole>` wrapper to hide UI affordances.
- Mobile: navigation reads role from `authStore` and omits unsupported screens from the tab/drawer.

This is **defense in depth**: the server is the source of truth. Hidden buttons can be inspected and clicked anyway, so the backend always re-verifies.

## Special cases

- **Approval workflow:** A `pending` farmer's `managedBy` field must equal the approver's userId or fall under their hierarchy. Approvals by users without scope return 403.
- **Cross-org reads:** Forbidden by default. Admin/orgMD/orgNESSO can read across organizations; everyone else is bounded.
- **Public QR portal:** Anonymous. The backend exposes only `/api/v1/public/trace/:code` to unauthenticated requests, with rate limiting.

## Bootstrap admin

Seeded at first deploy via a Nest seed script:

```
phone: 9066666481
role:  admin
password: <env BOOTSTRAP_ADMIN_PASSWORD>
```

The hardcoded fallback that FoodSign shipped (`Admin@2026` / `12345678`) is **removed**. Bootstrapping is one-time via env, and the admin must change the password on first login.

## Future: SCIM / SSO

Out of scope for v1 but the JWT claim shape leaves room for `idp: 'azuread'` and `groups: [...]` so we can wire SAML/OIDC later without rewriting the guard.
