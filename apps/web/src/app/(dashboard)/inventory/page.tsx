import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';
import {
  StatusBadge,
  toneForInventoryStatus,
} from '@/components/dashboard/Badges';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const { status, page } = await searchParams;
  const token = (await readAccessToken())!;
  const [result, stats] = await Promise.all([
    api.listInventory(token, {
      status,
      page: page ? Number(page) : 1,
      pageSize: 50,
    }),
    api.getInventoryStats(token),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Inventory</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {stats.total} {stats.total === 1 ? 'batch' : 'batches'} on record
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: '', l: 'Total', v: stats.total },
          { k: 'AVAILABLE', l: 'Available', v: stats.available, tone: 'success' },
          { k: 'PROCESSING', l: 'Processing', v: stats.processing, tone: 'info' },
          { k: 'SOLD', l: 'Sold', v: stats.sold, tone: 'accent' },
        ].map((t) => (
          <Link
            key={t.k || 'total'}
            href={t.k ? `/inventory?status=${t.k}` : '/inventory'}
            className={`rounded-2xl border bg-bg-elevated p-5 shadow-sm transition hover:border-primary/50 ${
              (status ?? '') === t.k ? 'border-primary' : 'border-border'
            }`}
          >
            <dt className="text-xs uppercase tracking-wider text-fg-subtle">{t.l}</dt>
            <dd
              className={`mt-1 font-display text-3xl tabular-nums ${
                t.tone === 'success'
                  ? 'text-success'
                  : t.tone === 'info'
                    ? 'text-info'
                    : t.tone === 'accent'
                      ? 'text-fg'
                      : 'text-fg'
              }`}
            >
              {t.v}
            </dd>
          </Link>
        ))}
      </dl>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-bg-elevated">
        {result.data.length === 0 ? (
          <div className="px-5 py-12 text-center text-fg-muted">
            {status ? `No ${status} batches.` : 'No inventory yet — accept a GRN to create the first batch.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg-muted/50 text-left text-xs uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="px-4 py-3">Batch #</th>
                <th className="px-4 py-3">Product</th>
                <th className="hidden px-4 py-3 md:table-cell">Warehouse</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.data.map((b) => (
                <tr key={b._id} className="transition hover:bg-bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs text-fg-subtle">{b.batchId}</td>
                  <td className="px-4 py-3 font-medium text-fg">
                    {b.productName}
                    {b.variant ? <span className="text-fg-subtle"> · {b.variant}</span> : null}
                  </td>
                  <td className="hidden px-4 py-3 text-fg-muted md:table-cell">
                    {b.warehouseName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{b.currentStage}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {b.quantity} {b.unit}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={b.status} tone={toneForInventoryStatus(b.status)} />
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
