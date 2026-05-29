import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';

export default async function DashboardPage() {
  const token = (await readAccessToken())!;
  const [stats, recent] = await Promise.all([
    api.getFarmerStats(token),
    api.listFarmers(token, { page: 1, pageSize: 5 }),
  ]);

  const tiles: Array<{ label: string; value: number; tone: 'primary' | 'warning' | 'success' | 'muted' }> = [
    { label: 'Total farmers', value: stats.total, tone: 'primary' },
    { label: 'Pending approval', value: stats.pending, tone: 'warning' },
    { label: 'Approved', value: stats.approved, tone: 'success' },
    { label: 'Rejected', value: stats.rejected, tone: 'muted' },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Dashboard</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Live counts from your farmers collection. Add farmers from the Farmers page.
          </p>
        </div>
        <Link
          href="/farmers/new"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
        >
          Add farmer
        </Link>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm"
          >
            <dt className="text-xs uppercase tracking-wider text-fg-subtle">{t.label}</dt>
            <dd
              className={`mt-1 font-display text-4xl tabular-nums ${
                t.tone === 'primary'
                  ? 'text-fg'
                  : t.tone === 'warning'
                    ? 'text-warning'
                    : t.tone === 'success'
                      ? 'text-success'
                      : 'text-fg-muted'
              }`}
            >
              {t.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 rounded-2xl border border-border bg-bg-elevated">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-lg text-fg">Recent farmers</h2>
          <Link href="/farmers" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>
        {recent.data.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-fg-muted">No farmers yet.</p>
            <Link
              href="/farmers/new"
              className="mt-3 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-700"
            >
              Register the first one
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.data.map((f) => (
              <li key={f._id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/farmers/${f._id}`}
                    className="font-medium text-fg hover:text-primary"
                  >
                    {f.firstName} {f.lastName ?? ''}
                  </Link>
                  <p className="truncate text-xs text-fg-subtle">
                    <code className="font-mono">{f.farmerId}</code> ·{' '}
                    <code className="font-mono">{f.mobileNumber}</code>
                    {f.address?.district ? ` · ${f.address.district}` : ''}
                  </p>
                </div>
                <StatusBadge status={f.approvalStatus} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const map = {
    pending: { label: 'Pending', cls: 'bg-warning/10 text-warning border-warning/30' },
    approved: { label: 'Approved', cls: 'bg-success/10 text-success border-success/30' },
    rejected: { label: 'Rejected', cls: 'bg-danger/10 text-danger border-danger/30' },
  } as const;
  const v = map[status];
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${v.cls}`}>{v.label}</span>
  );
}
