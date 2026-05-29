import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError, readAccessToken } from '@/lib/api';
import { ApprovalActions } from '../../approvals/ApprovalActions';

export default async function FarmerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = (await readAccessToken())!;

  let f;
  try {
    f = await api.getFarmer(token, id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-2 text-sm text-fg-muted">
        <Link href="/farmers" className="hover:text-primary">
          ← Farmers
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">
            {f.firstName} {f.lastName ?? ''}
          </h1>
          <p className="mt-1 font-mono text-sm text-fg-subtle">
            {f.farmerId} · {f.mobileNumber}
          </p>
        </div>
        <StatusBadge status={f.approvalStatus} />
      </div>

      {f.approvalStatus === 'pending' ? (
        <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/10 p-4">
          <p className="text-sm font-medium text-warning">Awaiting approval</p>
          <p className="mt-1 text-sm text-fg-muted">
            Review the details below, then approve or reject.
          </p>
          <div className="mt-3">
            <ApprovalActions farmerId={f._id} />
          </div>
        </div>
      ) : f.approvalStatus === 'rejected' && f.rejectionReason ? (
        <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 p-4">
          <p className="text-sm font-medium text-danger">Rejected</p>
          <p className="mt-1 text-sm text-fg-muted">{f.rejectionReason}</p>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card title="Personal">
          <Row label="Gender" value={f.gender ?? '—'} />
          <Row label="Production practice" value={f.productionPractice ?? '—'} />
          <Row label="Association" value={f.isFlowerAgent ? 'Flower agent' : f.groupAssociation} />
          <Row
            label="Public trace consent"
            value={f.publicTraceConsent ? 'Granted' : 'Not granted'}
          />
        </Card>

        <Card title="Address">
          <Row label="Village" value={f.address?.village ?? '—'} />
          <Row label="Taluka" value={f.address?.taluka ?? '—'} />
          <Row label="District" value={f.address?.district ?? '—'} />
          <Row label="State" value={f.address?.state ?? '—'} />
          <Row label="Pincode" value={f.address?.pincode ?? '—'} />
        </Card>

        <Card title="Crops">
          {f.selectedCrops && f.selectedCrops.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {f.selectedCrops.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border-strong bg-bg-muted px-2.5 py-0.5 text-xs text-fg"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-fg-muted">No crops selected</p>
          )}
        </Card>

        <Card title="Registered">
          <Row label="Created" value={new Date(f.createdAt).toLocaleString()} />
          <Row label="Last updated" value={new Date(f.updatedAt).toLocaleString()} />
          {f.approvedAt ? (
            <Row label="Decision made" value={new Date(f.approvedAt).toLocaleString()} />
          ) : null}
        </Card>
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm">
      <h2 className="text-xs uppercase tracking-wider text-fg-subtle">{title}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-fg-subtle">{label}</dt>
      <dd className="truncate text-sm text-fg">{value}</dd>
    </div>
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
    <span className={`rounded-full border px-3 py-1 text-sm font-medium ${v.cls}`}>{v.label}</span>
  );
}
