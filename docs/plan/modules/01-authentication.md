# Module · Authentication

## Purpose
Verify identity of staff, agents, and farmers. Issue and rotate JWTs. Enforce session, device registration, offline-cached login.

## Surfaces
Mobile (OTP-first), Web (password + optional OTP), Backend (`auth` module).

## Data
- `users` (staff/admin) — `phone` unique, `passwordHash` bcrypt(12)
- `farmers` — can log in via OTP using `mobileNumber`
- `devices` — push tokens + last-seen metadata
- Redis — OTP store (`otp:<sessionId>` → `{phoneHash, attempts}`, TTL 5min), refresh-token allowlist
- `auditLogs` — every `login.*` event

## APIs
| Method | Path |
|---|---|
| POST | `/auth/otp/send` `{phone}` → `{sessionId, expiresAt}` |
| POST | `/auth/otp/verify` `{sessionId, otp, firebaseIdToken}` → `{accessToken, refreshToken, user}` |
| POST | `/auth/password` `{username, password}` → tokens |
| POST | `/auth/refresh` `{refreshToken}` → rotated tokens |
| POST | `/auth/logout` → blacklist refresh + revoke device |
| GET  | `/auth/me` → current user with permissions |
| POST | `/auth/forgot` `{phone}` → OTP-driven password reset |

## Tokens
- **Access:** RS256, 15 min, claims per `08-roles-permissions.md`
- **Refresh:** opaque, 30 days, stored in Redis with `tokenId`; rotated on every use; jti reuse → all-session revoke
- Mobile: tokens kept in MMKV with `encryptionKey`; cleared on logout
- Web: HttpOnly Secure SameSite=Lax cookie

## Screens

### Mobile
- `Login` — phone input (10 digits, `inputmode="numeric"`, prefix `+91` non-editable label)
- `OtpVerify` — 6-digit code input with paste support, resend after 30s, max 3 attempts
- `Splash` — token check + initial sync probe

### Web
- `/login` — username + password card with glassmorphic background animation
- `/forgot` — phone → OTP → new password (validated against complexity rules)
- `/2fa` (optional, post-GA) — TOTP

## UX & a11y
- OTP input announces "OTP sent to ending 1234". Resend button has visible cooldown.
- WCAG 2.2 SC 3.3.8 met: paste enabled, no character recognition tests, password manager autofill supported.
- Reduced-motion: backdrop animation disables; static gradient.
- Error messages name the issue ("Code expired — resend it"), not generic "Invalid input."

## Validation
- Phone `/^[6-9]\d{9}$/`
- OTP `/^\d{6}$/`
- Password: min 10 chars, one upper, one lower, one digit, one symbol; rejected if found in HaveIBeenPwned k-anon top 100k

## Rate limits
- `/auth/otp/send` 3/min/phone, 30/day/phone
- `/auth/password` 5/min/IP, 20/hour/IP
- `/auth/refresh` 20/min/token

## Offline cache
- Last-known user + permissions cached locally so the app shell renders without a network round-trip after launch
- If token expired & offline, banner: "Offline · log in again when you're back online"

## Edge cases
- Phone reused across `users` and `farmers`: precedence is `users` first (staff wins).
- Refresh-token reuse (replay): triggers all-session logout for that user.
- Firebase OTP verified but server-side phone hash doesn't match Firebase phone: 401 with `phone_mismatch`.

## Acceptance criteria
- AC1: Staff logs in with password on web and lands on dashboard within one redirect.
- AC2: Field officer completes phone+OTP on mobile in ≤ 30 s with good signal.
- AC3: Tokens rotate transparently; user sees no logout during a 4-hour session.
- AC4: Logout revokes the refresh token; same token cannot be replayed.
- AC5: Brute-forcing OTP on the same phone is blocked after 5 attempts for 15 min.
- AC6: Sentry breadcrumbs contain no plaintext OTP or password.
