import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';
import { StatusBadge } from '@/components/dashboard/Badges';

export default async function FarmsPage() {
  const token = (await readAccessToken())!;
  const [farms, farmers] = await Promise.all([
    api.listFarms(token, { pageSize: 100 }),
    api.listFarmers(token, { pageSize: 200 }),
  ]);

  const farmerById = new Map(farmers.data.map((f) => [f._id, f]));

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Farms</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {farms.total} {farms.total === 1 ? 'farm' : 'farms'} registered
          </p>
        </div>
        <Link
          href="/farms/new"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
        >
          + Add farm
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-bg-elevated">
        {farms.data.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-fg-muted">No farms registered yet.</p>
            <Link
              href="/farms/new"
              className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-700"
            >
              Register the first farm
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg-muted/50 text-left text-xs uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="px-4 py-3">Farm ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="hidden px-4 py-3 md:table-cell">Farmer</th>
                <th className="px-4 py-3 text-right">Area (ac)</th>
                <th className="hidden px-4 py-3 md:table-cell">Practice</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {farms.data.map((f) => {
                const farmer = farmerById.get(f.farmerId);
                return (
                  <tr key={f._id} className="transition hover:bg-bg-muted/40">
                    <td className="px-4 py-3 font-mono text-xs text-fg-subtle">{f.farmId}</td>
                    <td className="px-4 py-3 font-medium text-fg">{f.farmName}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {farmer ? (
                        <Link
                          href={`/farmers/${farmer._id}`}
                          className="text-fg-muted hover:text-primary"
                        >
                          {farmer.firstName} {farmer.lastName ?? ''}
                        </Link>
                      ) : (
                        <span className="text-fg-subtle">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {f.farmArea.toFixed(1)}
                    </td>
                    <td className="hidden px-4 py-3 text-fg-muted md:table-cell">
                      {f.organicStage}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={f.approvalStatus}
                        tone={
                          f.approvalStatus === 'approved'
                            ? 'success'
                            : f.approvalStatus === 'rejected'
                              ? 'danger'
                              : 'pending'
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
