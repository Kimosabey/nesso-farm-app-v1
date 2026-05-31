import Link from 'next/link';
import { Leaf, Sprout, TriangleAlert, Wheat } from 'lucide-react';
import { api, readAccessToken } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { MiniStat } from '@/components/dashboard/MiniStat';
import { Avatar } from '@/components/dashboard/Avatar';
import { ExportButtons } from './ExportButtons';

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
      <PageHeader
        title="Pre-harvest"
        sub={`Crop tracking & activity readiness · generated in ${result.ms}ms`}
        actions={<ExportButtons />}
      />

      {/* filters */}
      <form
        action="/reports"
        method="get"
        className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-bg-elevated p-4 shadow-sm"
      >
        <label className="block">
          <span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wider text-fg-subtle">
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

        <label className="inline-flex items-center gap-2 text-sm text-fg">
          <input
            type="checkbox"
            name="includeFlowerAgents"
            defaultChecked={sp.includeFlowerAgents !== 'false'}
            value=""
            className="size-4 rounded border-border-strong text-primary focus:ring-ring"
          />
          Include flower agents
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-fg">
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
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Run
        </button>
        {sp.approvalStatus || sp.includeMissingFarm ? (
          <Link
            href="/reports"
            className="inline-flex h-9 items-center rounded-md border border-border-strong px-3 text-sm text-fg transition hover:bg-bg-muted"
          >
            Reset
          </Link>
        ) : null}
      </form>

      {/* stat tiles */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat
          label="Crops tracked"
          value={result.totals.crops}
          tone="primary"
          icon={<Leaf size={18} />}
        />
        <MiniStat
          label="Farms"
          value={result.totals.farms}
          tone="info"
          icon={<Sprout size={18} />}
        />
        <MiniStat
          label="In scope"
          value={result.totals.farmersInScope}
          tone="muted"
          icon={<Wheat size={18} />}
        />
        <MiniStat
          label="No farm yet"
          value={result.totals.farmersMissingFarm}
          tone="warning"
          icon={<TriangleAlert size={18} />}
        />
      </div>

      {/* row data */}
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-bg-muted">
                {['Farmer', 'District', 'Farm', 'Crop', 'Pending', 'Done', 'Overdue', 'Readiness'].map(
                  (h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-3.5 py-3 text-left text-[11.5px] font-bold uppercase tracking-[0.04em] text-fg-subtle"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {result.rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-fg-muted">
                    No rows match these filters.
                  </td>
                </tr>
              ) : (
                result.rows.map((r, idx) => {
                  const roll = r.activityRollup;
                  const readiness =
                    roll.total > 0 ? Math.round((roll.completed / roll.total) * 100) : 0;
                  return (
                    <tr
                      key={`${r.farmer.id}-${idx}`}
                      className="border-b border-border transition hover:bg-bg-muted/50"
                    >
                      <td className="px-3.5 py-3 align-middle">
                        <Link href={`/farmers/${r.farmer.id}`} className="flex items-center gap-3">
                          <Avatar name={r.farmer.name || r.farmer.farmerId} size={32} />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-fg">
                              {r.farmer.name || r.farmer.farmerId}
                            </div>
                            <div className="font-mono text-[11px] text-fg-subtle">
                              {r.farmer.farmerId}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3.5 py-3 align-middle text-[13.5px] text-fg-muted">
                        {r.farmer.district ?? '—'}
                      </td>
                      <td className="px-3.5 py-3 align-middle text-[13.5px] text-fg-muted">
                        {r.farm?.name ?? '—'}
                      </td>
                      <td className="px-3.5 py-3 align-middle">
                        {r.crop ? (
                          <span className="inline-flex rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs font-semibold text-secondary-700">
                            {r.crop.name}
                          </span>
                        ) : (
                          <span className="text-sm text-fg-subtle">—</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 align-middle font-mono text-[13.5px] text-warning">
                        {roll.pending}
                      </td>
                      <td className="px-3.5 py-3 align-middle font-mono text-[13.5px] text-success">
                        {roll.completed}
                      </td>
                      <td className="px-3.5 py-3 align-middle font-mono text-[13.5px] text-danger">
                        {roll.overdue}
                      </td>
                      <td className="px-3.5 py-3 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${readiness}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11.5px] text-fg-muted">{readiness}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border px-[18px] py-3.5 text-[13px] text-fg-muted">
          Snapshot generated {new Date(result.generatedAt).toLocaleString()} ·{' '}
          <b className="text-fg">{result.rows.length}</b> rows
        </div>
      </div>
    </section>
  );
}
