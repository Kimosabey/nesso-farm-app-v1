import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';
import type { Activity } from '@/lib/api';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function ActivitiesPage({ searchParams }: PageProps) {
  const { status, page } = await searchParams;
  const token = (await readAccessToken())!;

  const [result, stats] = await Promise.all([
    api.listActivities(token, {
      status,
      page: page ? Number(page) : 1,
      pageSize: 50,
    }),
    api.getActivityStats(token),
  ]);

  // Group by completedDate (fallback to scheduledOn, fallback to enteredDate)
  const grouped = groupByDay(result.data);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Activities</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {result.total} {result.total === 1 ? 'activity' : 'activities'} on record
          </p>
        </div>
        <Link
          href="/activities/new"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
        >
          + Log activity
        </Link>
      </div>

      {/* Stats strip */}
      <dl className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Pending', value: stats.Pending ?? 0, key: 'pending', tone: 'warning' },
          { label: 'Completed', value: stats.Completed ?? 0, key: 'completed', tone: 'success' },
          { label: 'Overdue', value: stats.Overdue ?? 0, key: 'overdue', tone: 'danger' },
          { label: 'Cancelled', value: stats.Cancelled ?? 0, key: 'cancelled', tone: 'muted' },
        ].map((s) => (
          <Link
            key={s.key}
            href={`/activities?status=${capitalize(s.key)}`}
            className={`rounded-2xl border bg-bg-elevated p-4 shadow-sm transition hover:border-primary/50 ${
              status?.toLowerCase() === s.key ? 'border-primary' : 'border-border'
            }`}
          >
            <dt className="text-xs uppercase tracking-wider text-fg-subtle">{s.label}</dt>
            <dd
              className={`mt-1 font-display text-3xl tabular-nums ${
                s.tone === 'warning'
                  ? 'text-warning'
                  : s.tone === 'success'
                    ? 'text-success'
                    : s.tone === 'danger'
                      ? 'text-danger'
                      : 'text-fg-muted'
              }`}
            >
              {s.value}
            </dd>
          </Link>
        ))}
      </dl>

      {status ? (
        <div className="mt-4">
          <Link
            href="/activities"
            className="inline-flex h-8 items-center rounded-md border border-border-strong px-3 text-xs text-fg hover:bg-bg-muted"
          >
            Clear filter ({status})
          </Link>
        </div>
      ) : null}

      {/* Timeline grouped by date */}
      {grouped.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-bg-elevated p-12 text-center">
          <p className="text-fg-muted">
            {status ? `No ${status.toLowerCase()} activities yet.` : 'No activities logged yet.'}
          </p>
          <Link
            href="/activities/new"
            className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-700"
          >
            Log the first one
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {grouped.map((group) => (
            <div key={group.day} className="rounded-2xl border border-border bg-bg-elevated">
              <div className="border-b border-border px-5 py-3">
                <h2 className="font-display text-sm uppercase tracking-wider text-fg-subtle">
                  {group.label}
                </h2>
              </div>
              <ul className="divide-y divide-border">
                {group.items.map((a) => (
                  <li key={a._id} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-fg">{a.activity}</span>
                        <StatusBadge status={a.status} />
                      </div>
                      {a.notes ? (
                        <p className="mt-1 text-sm text-fg-muted">{a.notes}</p>
                      ) : null}
                      {a.inputs.length > 0 ? (
                        <p className="mt-1 text-xs text-fg-subtle">
                          {a.inputs.map((i) => `${i.name} ${i.quantity}${i.unit ?? ''}`).join(' · ')}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right text-sm">
                      {a.totalCost > 0 ? (
                        <p className="font-mono tabular-nums text-fg">₹ {a.totalCost.toFixed(0)}</p>
                      ) : null}
                      <p className="text-xs text-fg-subtle">
                        {a.completedDate
                          ? `Done ${new Date(a.completedDate).toLocaleDateString()}`
                          : a.scheduledOn
                            ? `Due ${new Date(a.scheduledOn).toLocaleDateString()}`
                            : null}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function groupByDay(items: Activity[]): Array<{ day: string; label: string; items: Activity[] }> {
  const map = new Map<string, Activity[]>();
  for (const a of items) {
    const d = a.completedDate ?? a.scheduledOn ?? a.enteredDate;
    const key = new Date(d).toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, items]) => ({
      day,
      label: humanizeDay(day),
      items,
    }));
}

function humanizeDay(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date();
  const ymd = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  if (ymd(d) === ymd(today)) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (ymd(d) === ymd(yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function StatusBadge({ status }: { status: 'Pending' | 'Completed' | 'Overdue' | 'Cancelled' }) {
  const map = {
    Pending: 'bg-warning/10 text-warning border-warning/30',
    Completed: 'bg-success/10 text-success border-success/30',
    Overdue: 'bg-danger/10 text-danger border-danger/30',
    Cancelled: 'bg-fg-muted/10 text-fg-muted border-border-strong',
  } as const;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}
