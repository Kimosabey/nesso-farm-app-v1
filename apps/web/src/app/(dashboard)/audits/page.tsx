import { api, readAccessToken } from '@/lib/api';
import { StatusBadge, toneForAuditStatus } from '@/components/dashboard/Badges';

export default async function AuditsPage() {
  const token = (await readAccessToken())!;
  const [result, stats] = await Promise.all([
    api.listAudits(token, { pageSize: 100 }),
    api.getAuditStats(token).catch(() => ({ Pending: 0, Approved: 0, Rejected: 0, total: 0 })),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-fg">Audits</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {stats.total} {stats.total === 1 ? 'audit' : 'audits'} on record
        </p>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { l: 'Total', v: stats.total },
          { l: 'Pending', v: stats.Pending ?? 0, tone: 'warning' },
          { l: 'Approved', v: stats.Approved ?? 0, tone: 'success' },
          { l: 'Rejected', v: stats.Rejected ?? 0, tone: 'danger' },
        ].map((t) => (
          <div
            key={t.l}
            className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm"
          >
            <dt className="text-xs uppercase tracking-wider text-fg-subtle">{t.l}</dt>
            <dd
              className={`mt-1 font-display text-3xl tabular-nums ${
                t.tone === 'warning'
                  ? 'text-warning'
                  : t.tone === 'success'
                    ? 'text-success'
                    : t.tone === 'danger'
                      ? 'text-danger'
                      : 'text-fg'
              }`}
            >
              {t.v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-bg-elevated">
        {result.data.length === 0 ? (
          <div className="px-5 py-12 text-center text-fg-muted">
            No audits yet. Create one via{' '}
            <code className="font-mono text-xs">POST /api/v1/audits</code>.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg-muted/50 text-left text-xs uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="hidden px-4 py-3 md:table-cell">Farmer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.data.map((a) => (
                <tr key={a._id} className="transition hover:bg-bg-muted/40">
                  <td className="px-4 py-3 text-fg-muted">{a.auditType}</td>
                  <td className="px-4 py-3 font-medium text-fg">{a.description}</td>
                  <td className="hidden px-4 py-3 text-fg-muted md:table-cell">
                    {a.farmerName ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={a.status} tone={toneForAuditStatus(a.status)} />
                  </td>
                  <td className="px-4 py-3 text-fg-subtle">
                    {new Date(a.auditDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
