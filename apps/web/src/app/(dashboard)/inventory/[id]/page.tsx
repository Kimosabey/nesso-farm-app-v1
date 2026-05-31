import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, ExternalLink } from 'lucide-react';
import { api, readAccessToken, type InventoryBatch } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { TraceQr, traceCodeFromBatch } from '@/components/dashboard/TraceQr';

const LOCALE = 'en';

function pillKind(status: InventoryBatch['status']) {
  switch (status) {
    case 'AVAILABLE':
      return 'active' as const;
    case 'PROCESSING':
      return 'processing' as const;
    case 'SOLD':
      return 'approved' as const;
    default:
      return 'pending' as const;
  }
}

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = (await readAccessToken())!;

  // No by-id endpoint — resolve from the inventory list (by _id or batchId).
  const page = await api.listInventory(token, { pageSize: 200 }).catch(() => null);
  const batch =
    page?.data.find((b) => b._id === id || b.batchId === id) ?? null;

  if (!batch) notFound();

  const code = traceCodeFromBatch(batch.batchId);
  const tracePath = `/${LOCALE}/t/${code}`;
  const history = [...(batch.stageHistory ?? [])].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-8">
      <div className="mb-2 text-sm text-fg-muted">
        <Link href="/inventory" className="hover:text-primary">
          ← Inventory
        </Link>
      </div>

      <PageHeader
        title={batch.batchId}
        sub={[batch.productName, batch.grade, `${batch.quantity} ${batch.unit}`]
          .filter(Boolean)
          .join(' · ')}
        actions={
          <>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3.5 text-sm font-medium text-fg shadow-sm transition hover:bg-bg-muted"
              title="Stub — wire to label-PDF service"
            >
              <Download size={16} /> Download QR
            </button>
            <Link
              href={tracePath}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
            >
              View public trace <ExternalLink size={15} />
            </Link>
          </>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* QR + stats */}
        <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm">
          <div className="grid place-items-center pb-5 pt-2">
            <div className="rounded-2xl bg-white p-3.5 shadow-sm">
              <TraceQr code={code} size={168} />
            </div>
            <Link
              href={tracePath}
              className="mt-3.5 font-mono text-[13px] font-semibold text-primary hover:underline"
            >
              nesso.in{tracePath}
            </Link>
          </div>
          <dl className="flex flex-col gap-3 border-t border-border pt-5">
            <Stat label="Product" value={batch.productName} />
            {batch.variant ? <Stat label="Variant" value={batch.variant} /> : null}
            {batch.grade ? <Stat label="Grade" value={batch.grade} /> : null}
            <Stat label="Quantity" value={`${batch.quantity} ${batch.unit}`} />
            <Stat label="Type" value={batch.type} />
            <Stat label="Supplier" value={batch.supplier ?? '—'} />
            <Stat label="Warehouse" value={batch.warehouseName ?? '—'} />
            <Stat label="Incoming" value={fmtDate(batch.incomingDate)} />
            {batch.expiryDate ? <Stat label="Expiry" value={fmtDate(batch.expiryDate)} /> : null}
            <div>
              <dt className="text-[11.5px] font-semibold uppercase tracking-wider text-fg-subtle">
                Status
              </dt>
              <dd className="mt-1.5">
                <StatusPill kind={pillKind(batch.status)}>{batch.currentStage}</StatusPill>
              </dd>
            </div>
          </dl>
        </div>

        {/* Stage history */}
        <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm">
          <h2 className="mb-5 font-display text-base font-bold text-fg">Stage history</h2>
          {history.length === 0 ? (
            <p className="text-sm text-fg-muted">No stage movements recorded yet.</p>
          ) : (
            <ol className="relative ml-2 border-l border-border">
              {history.map((step, i) => {
                const last = i === history.length - 1;
                return (
                  <li key={`${step.stage}-${step.at}-${i}`} className="relative pb-6 pl-6 last:pb-0">
                    <span
                      className={`absolute -left-[6.5px] top-1 size-3 rounded-full border-2 ${
                        last
                          ? 'border-primary bg-primary'
                          : 'border-border-strong bg-bg-elevated'
                      }`}
                    />
                    <div className="text-sm font-semibold text-fg">{step.stage}</div>
                    {step.notes ? (
                      <div className="mt-0.5 text-sm text-fg-muted">{step.notes}</div>
                    ) : null}
                    <div className="mt-1 flex flex-wrap gap-x-3 font-mono text-xs text-fg-subtle">
                      <span>{fmtDateTime(step.at)}</span>
                      {step.by ? <span>· {step.by}</span> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[11.5px] font-semibold uppercase tracking-wider text-fg-subtle">
        {label}
      </dt>
      <dd className="truncate text-sm font-medium text-fg">{value}</dd>
    </div>
  );
}

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

function fmtDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}
