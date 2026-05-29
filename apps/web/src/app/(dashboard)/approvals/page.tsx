import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';
import { ApprovalActions } from './ApprovalActions';

export default async function ApprovalsPage() {
  const token = (await readAccessToken())!;
  const result = await api.listFarmers(token, {
    approvalStatus: 'pending',
    page: 1,
    pageSize: 100,
  });

  return (
    <section className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Approvals</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {result.total} {result.total === 1 ? 'farmer' : 'farmers'} awaiting review
          </p>
        </div>
      </div>

      {result.data.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-bg-elevated p-12 text-center">
          <p className="text-fg-muted">No pending approvals. Nice work.</p>
          <Link
            href="/farmers"
            className="mt-4 inline-flex h-9 items-center rounded-md border border-border-strong px-4 text-sm text-fg hover:bg-bg-muted"
          >
            See all farmers
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {result.data.map((f) => (
            <li
              key={f._id}
              className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/farmers/${f._id}`}
                    className="font-display text-xl text-fg hover:text-primary"
                  >
                    {f.firstName} {f.lastName ?? ''}
                  </Link>
                  <p className="mt-1 font-mono text-xs text-fg-subtle">
                    {f.farmerId} · {f.mobileNumber}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-fg-muted">
                    {f.address?.village ? <Chip>{f.address.village}</Chip> : null}
                    {f.address?.district ? <Chip>{f.address.district}</Chip> : null}
                    {f.address?.state ? <Chip>{f.address.state}</Chip> : null}
                    {f.isFlowerAgent ? (
                      <Chip tone="accent">Flower agent</Chip>
                    ) : (
                      <Chip>{f.groupAssociation.replace('_', ' ')}</Chip>
                    )}
                    {f.productionPractice ? <Chip>{f.productionPractice}</Chip> : null}
                  </div>
                  {f.selectedCrops && f.selectedCrops.length > 0 ? (
                    <p className="mt-2 text-xs text-fg-muted">
                      Crops: <span className="text-fg">{f.selectedCrops.join(', ')}</span>
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-fg-subtle">
                    Registered {timeAgo(f.createdAt)}
                  </p>
                </div>
                <div className="shrink-0">
                  <ApprovalActions farmerId={f._id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: 'accent' }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 ${
        tone === 'accent'
          ? 'border-accent/40 bg-accent/10 text-fg'
          : 'border-border-strong bg-bg-muted'
      }`}
    >
      {children}
    </span>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return `${d} d ago`;
}
