import { Bell, CheckCheck, CloudRain, AlertCircle, RefreshCw } from 'lucide-react';
import { api, readAccessToken, type NotificationItem } from '@/lib/api';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { markAllReadAction } from './actions';

export default async function NotificationsPage() {
  const token = (await readAccessToken())!;
  const inbox = await api.listNotifications(token, { pageSize: 100 });

  return (
    <section className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Notifications</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {inbox.total} total · <span className="text-warning">{inbox.unread} unread</span>
          </p>
        </div>
        {inbox.unread > 0 ? (
          <form action={markAllReadAction}>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border-strong bg-bg-elevated px-4 text-sm text-fg transition hover:bg-bg-muted"
            >
              <CheckCheck className="size-4" aria-hidden />
              Mark all as read
            </button>
          </form>
        ) : null}
      </div>

      <ul className="mt-6 space-y-3">
        {inbox.data.length === 0 ? (
          <li className="rounded-2xl border border-border bg-bg-elevated shadow-sm">
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              hint="Approvals, weather alerts, and activity reminders will appear here as they arrive."
            />
          </li>
        ) : (
          inbox.data.map((n) => <NotificationRow key={n._id} n={n} />)
        )}
      </ul>
    </section>
  );
}

function NotificationRow({ n }: { n: NotificationItem }) {
  const Icon = iconFor(n.kind);
  const unread = n.status !== 'read';
  return (
    <li
      className={`rounded-2xl border bg-bg-elevated p-4 shadow-sm transition ${
        unread ? 'border-primary/30' : 'border-border'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
            unread ? 'bg-primary/15 text-primary' : 'bg-bg-muted text-fg-muted'
          }`}
        >
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className={`text-sm ${unread ? 'font-medium text-fg' : 'text-fg'}`}>{n.title}</p>
            <span className="text-xs text-fg-subtle whitespace-nowrap">
              {timeAgo(n.createdAt)}
            </span>
          </div>
          {n.body ? <p className="mt-1 text-sm text-fg-muted">{n.body}</p> : null}
          <p className="mt-1 text-[10px] uppercase tracking-wider text-fg-subtle">
            {n.kind} · {n.channel}
          </p>
        </div>
        {unread ? (
          <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
        ) : null}
      </div>
    </li>
  );
}

function iconFor(kind: NotificationItem['kind']) {
  switch (kind) {
    case 'weather':
      return CloudRain;
    case 'activityReminder':
      return Bell;
    case 'approval':
      return CheckCheck;
    case 'sync':
      return RefreshCw;
    case 'system':
    default:
      return AlertCircle;
  }
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
