import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';

interface PageProps {
  searchParams: Promise<{
    approvalStatus?: string;
    includeFlowerAgents?: string;
    includeMissingFarm?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const token = (await readAccessToken())!;
  const result = await api.preHarvestReport(token, {
    approvalStatus: sp.approvalStatus,
    includeFlowerAgents: sp.includeFlowerAgents !== 'false',
    includeMissingFarm: sp.includeMissingFarm === 'true',
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Reports</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Pre-harvest aggregation · generated in {result.ms}ms
          </p>
        </div>
      </div>

      <form
        action="/reports"
        method="get"
        className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-bg-elevated p-4"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-fg-subtle">
            Farmer status
          </span>
          <select
            name="approvalStatus"
            defaultValue={sp.approvalStatus ?? ''}
            className="h-9 rounded-md border border-border-strong bg-bg px-3 text-sm text-fg"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>

        <label className="mt-6 inline-flex items-center gap-2 text-sm text-fg">
          <input
            type="checkbox"
            name="includeFlowerAgents"
            defaultChecked={sp.includeFlowerAgents !== 'false'}
            value=""
            onChange={undefined}
            className="size-4 rounded border-border-strong text-primary focus:ring-ring"
          />
          Include flower agents
        </label>

        <label className="mt-6 inline-flex items-center gap-2 text-sm text-fg">
          <input
            type="checkbox"
            name="includeMissingFarm"
            defaultChecked={sp.includeMissingFarm === 'true'}
            value="true"
            className="size-4 rounded border-border-strong text-primary focus:ring-ring"
          />
          Include farmers with no farm
        </label>

        <button
          type="submit"
          className="mt-6 h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm hover:bg-primary-700"
        >
          Run
        </button>
        {sp.approvalStatus || sp.includeMissingFarm ? (
          <Link
            href="/reports"
            className="mt-6 h-9 inline-flex items-center rounded-md border border-border-strong px-3 text-sm text-fg hover:bg-bg-muted"
          >
            Reset
          </Link>
        ) : null}
      </form>

      {/* Totals */}
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { l: 'Farmers (all)', v: result.totals.farmersAll },
          { l: 'In scope', v: result.totals.farmersInScope, tone: 'primary' },
          { l: 'No farm yet', v: result.totals.farmersMissingFarm, tone: 'warning' },
          { l: 'Farms', v: result.totals.farms },
          { l: 'Crops', v: result.totals.crops },
        ].map((t) => (
          <div key={t.l} className="rounded-2xl border border-border bg-bg-elevated p-4 shadow-sm">
            <dt className="text-xs uppercase tracking-wider text-fg-subtle">{t.l}</dt>
            <dd
              className={`mt-1 font-display text-3xl tabular-nums ${
                t.tone === 'primary' ? 'text-primary' : t.tone === 'warning' ? 'text-warning' : 'text-fg'
              }`}
            >
              {t.v}
            </dd>
          </div>
        ))}
      </dl>

      {/* Row data */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-bg-elevated">
        {result.rows.length === 0 ? (
          <div className="px-5 py-12 text-center text-fg-muted">No rows match these filters.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg-muted/50 text-left text-xs uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="px-4 py-3">Farmer</th>
                <th className="hidden px-4 py-3 md:table-cell">District</th>
                <th className="hidden px-4 py-3 md:table-cell">Farm</th>
                <th className="hidden px-4 py-3 lg:table-cell">Crop</th>
                <th className="px-4 py-3 text-right">Pending</th>
                <th className="px-4 py-3 text-right">Done</th>
                <th className="px-4 py-3 text-right">Overdue</th>
                <th className="hidden px-4 py-3 text-right md:table-cell">Last</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.rows.map((r, idx) => (
                <tr key={idx} className="transition hover:bg-bg-muted/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/farmers/${r.farmer.id}`}
                      className="font-medium text-fg hover:text-primary"
                    >
                      {r.farmer.name || r.farmer.farmerId}
                    </Link>
                    <p className="font-mono text-[10px] text-fg-subtle">{r.farmer.farmerId}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-fg-muted md:table-cell">
                    {r.farmer.district ?? '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-fg-muted md:table-cell">
                    {r.farm?.name ?? '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-fg-muted lg:table-cell">
                    {r.crop?.name ?? '—'}
                    {r.crop?.variety ? (
                      <span className="text-fg-subtle"> · {r.crop.variety}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-warning">
                    {r.activityRollup.pending}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-success">
                    {r.activityRollup.completed}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-danger">
                    {r.activityRollup.overdue}
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono text-xs text-fg-subtle md:table-cell">
                    {r.activityRollup.lastDate
                      ? new Date(r.activityRollup.lastDate).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-xs text-fg-subtle">
        Snapshot generated {new Date(result.generatedAt).toLocaleString()} · CSV / XLSX export
        coming in Phase 5.x via BullMQ
      </p>
    </section>
  );
}
