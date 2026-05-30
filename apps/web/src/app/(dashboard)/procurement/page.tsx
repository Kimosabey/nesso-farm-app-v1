import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';
import {
  StatusBadge,
  toneForPayStatus,
  toneForProcStatus,
} from '@/components/dashboard/Badges';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function ProcurementPage({ searchParams }: PageProps) {
  const { status, page } = await searchParams;
  const token = (await readAccessToken())!;
  const [result, stats] = await Promise.all([
    api.listProcurement(token, {
      status,
      page: page ? Number(page) : 1,
      pageSize: 50,
    }),
    api.getProcurementStats(token),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Procurement</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {stats.total} {stats.total === 1 ? 'order' : 'orders'} on record
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Total orders" value={stats.total} />
        <Tile label="Pending" value={stats.pending} tone="warning" />
        <Tile label="Completed" value={stats.completed} tone="success" />
        <Tile
          label="Total value (₹)"
          value={Math.round(stats.totalValue).toLocaleString('en-IN')}
          mono
        />
      </dl>

      <div className="mt-6 flex gap-2 text-sm">
        {[
          { k: '', l: 'All' },
          { k: 'Pending', l: 'Pending' },
          { k: 'Completed', l: 'Completed' },
          { k: 'Cancelled', l: 'Cancelled' },
        ].map((f) => (
          <Link
            key={f.k || 'all'}
            href={f.k ? `/procurement?status=${f.k}` : '/procurement'}
            className={`h-8 inline-flex items-center rounded-md border px-3 ${
              (status ?? '') === f.k
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border-strong text-fg hover:bg-bg-muted'
            }`}
          >
            {f.l}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-bg-elevated">
        {result.data.length === 0 ? (
          <div className="px-5 py-12 text-center text-fg-muted">
            {status ? `No ${status.toLowerCase()} procurements.` : 'No procurement orders yet.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg-muted/50 text-left text-xs uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Crop</th>
                <th className="hidden px-4 py-3 md:table-cell">Farmer</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.data.map((p) => (
                <tr key={p._id} className="transition hover:bg-bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs text-fg-subtle">{p.procurementId}</td>
                  <td className="px-4 py-3 font-medium text-fg">
                    {p.crop}
                    {p.variety ? <span className="text-fg-subtle"> · {p.variety}</span> : null}
                  </td>
                  <td className="hidden px-4 py-3 text-fg-muted md:table-cell">
                    {p.farmerName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {p.quantity} {p.unit}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-fg">
                    ₹ {Math.round(p.totalAmount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={p.status} tone={toneForProcStatus(p.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={p.paymentStatus} tone={toneForPayStatus(p.paymentStatus)} />
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

function Tile({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: number | string;
  tone?: 'success' | 'warning' | 'danger' | 'muted';
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm">
      <dt className="text-xs uppercase tracking-wider text-fg-subtle">{label}</dt>
      <dd
        className={`mt-1 font-display text-3xl tabular-nums ${
          tone === 'warning'
            ? 'text-warning'
            : tone === 'success'
              ? 'text-success'
              : tone === 'danger'
                ? 'text-danger'
                : 'text-fg'
        } ${mono ? 'font-mono text-2xl' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}
