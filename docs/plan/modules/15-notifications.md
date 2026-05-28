# Module · Notifications

## Purpose
Deliver push (FCM), in-app, and (later) SMS notifications for activity reminders, weather alerts, approvals, sync issues, and system messages.

## Surfaces
Backend `notifications` module + BullMQ workers, Mobile (in-app inbox + push), Web (bell + drawer).

## Data
- `notifications` collection (per recipient)
- `devices` collection (Expo push tokens)

## APIs
| Method | Path |
|---|---|
| GET | `/notifications` (inbox for current user, paginated) |
| PATCH | `/notifications/:id/read` |
| PATCH | `/notifications/read-all` |
| POST | `/notifications/register-device` `{expoPushToken, platform, appVersion}` |
| DELETE | `/notifications/devices/:tokenHash` |

## Kinds
- `activityReminder` — scheduled day-of POP activity due
- `weather` — heavy rain, frost, spray window
- `approval` — farmer/sample/audit needs review
- `sync` — outbox stuck, push to retry
- `system` — maintenance, version upgrade

## Delivery channels
| Channel | Use |
|---|---|
| `push` | FCM via Expo push tokens |
| `inApp` | Bell + drawer on web; inbox screen on mobile |
| `sms` | Reserved for critical (post-GA via MSG91) |

## Schedule pipeline
- BullMQ queues:
  - `notifications:dispatch` — enqueued per-user with payload + channel
  - `notifications:schedule` — cron job populates upcoming activity reminders 24h ahead
  - `weather:advisories` — produces weather kind events
- Workers handle dedup (`Notification-Idempotency-Key`) and channel-specific delivery

## UX

### Mobile inbox
- List of notifications, unread bolded, type icon
- Tap → deep link (e.g. `nesso://farmer/:id` for approval)
- Pull-to-refresh; offline view from local SQLite mirror

### Mobile push
- Notification taps wake the app and navigate via deep-link channel
- iOS/Android badge count synced to `unread` count

### Web bell
- `/notifications` drawer with grouping by kind
- Real-time-ish: TanStack Query polls every 30s; future: SSE/WebSocket

## Permissions
- Anyone can read their own inbox
- Admin can broadcast `system` kinds (gated by `admin` role)

## Validation
- `expoPushToken` matches Expo token regex
- `body` ≤ 240 chars (FCM safe)
- `data` ≤ 2 KB

## Edge cases
- Token rotation: device sends new token on app launch; backend dedupes by `(userId, tokenHash)`
- Notification permission denied: in-app inbox still works; push silently skipped; banner in Settings asks for permission
- Failure to deliver after 3 retries: marked `failed`, surfaced in Settings → Notifications health

## Acceptance criteria
- AC1: An admin approving a farmer triggers a push to the onboarding officer in ≤ 30 s online.
- AC2: Weather advisory fires within 5 minutes of the daily job for affected farms.
- AC3: Marking all as read on web reflects on mobile within 30 s (poll cycle).
- AC4: Push tap deep-links to the right entity 100% of the time across both platforms.
