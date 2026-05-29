import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    association?: string;
  }>;
}

export default async function FarmersPage({ searchParams }: PageProps) {
  const { page, q, status, association } = await searchParams;
  const token = (await readAccessToken())!;

  const result = await api.listFarmers(token, {
    page: page ? Number(page) : 1,
    pageSize: 25,
    q,
    approvalStatus: status,
    association,
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Farmers</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {result.total} {result.total === 1 ? 'farmer' : 'farmers'} registered
          </p>
        </div>
        <Link
          href="/farmers/new"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
        >
          + Add farmer
        </Link>
      </div>

      {/* Filters */}
      <form
        action="/farmers"
        method="get"
        className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-bg-elevated p-3"
      >
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search name, phone, or NES-F-…"
          className="h-9 flex-1 min-w-[200px] rounded-md border border-border-strong bg-bg px-3 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="h-9 rounded-md border border-border-strong bg-bg px-3 text-sm text-fg"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          name="association"
          defaultValue={association ?? ''}
          className="h-9 rounded-md border border-border-strong bg-bg px-3 text-sm text-fg"
        >
          <option value="">All associations</option>
          <option value="INDEPENDENT">Independent</option>
          <option value="FLOWER_AGENT">Flower agent</option>
          <option value="FPO">FPO</option>
          <option value="flowerAgent">Flower agents only</option>
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-fg hover:bg-primary-700"
        >
          Filter
        </button>
        {q || status || association ? (
          <Link
            href="/farmers"
            className="h-9 inline-flex items-center rounded-md border border-border-strong px-3 text-sm text-fg hover:bg-bg-muted"
          >
            Reset
          </Link>
        ) : null}
      </form>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-bg-elevated">
        {result.data.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-fg-muted">No farmers match these filters.</p>
            <Link
              href="/farmers/new"
              className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-700"
            >
              Register a farmer
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg-muted/50 text-left text-xs uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="px-4 py-3">Farmer ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="hidden px-4 py-3 md:table-cell">District</th>
                <th className="hidden px-4 py-3 lg:table-cell">Association</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.data.map((f) => (
                <tr key={f._id} className="transition hover:bg-bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs text-fg-subtle">
                    <Link href={`/farmers/${f._id}`} className="hover:text-primary">
                      {f.farmerId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-fg">
                    <Link href={`/farmers/${f._id}`} className="hover:text-primary">
                      {f.firstName} {f.lastName ?? ''}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-fg-muted">{f.mobileNumber}</td>
                  <td className="hidden px-4 py-3 text-fg-muted md:table-cell">
                    {f.address?.district ?? '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-fg-muted lg:table-cell">
                    {f.isFlowerAgent ? 'Flower agent' : f.groupAssociation.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={f.approvalStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {result.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-fg-muted">
          <span>
            Page {result.page} of {result.totalPages}
          </span>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Link
                href={buildQs({ page: result.page - 1, q, status, association })}
                className="h-9 rounded-md border border-border-strong px-3 text-sm hover:bg-bg-muted"
              >
                Previous
              </Link>
            ) : null}
            {result.page < result.totalPages ? (
              <Link
                href={buildQs({ page: result.page + 1, q, status, association })}
                className="h-9 rounded-md border border-border-strong px-3 text-sm hover:bg-bg-muted"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function buildQs(p: { page: number; q?: string; status?: string; association?: string }): string {
  const qs = new URLSearchParams();
  qs.set('page', String(p.page));
  if (p.q) qs.set('q', p.q);
  if (p.status) qs.set('status', p.status);
  if (p.association) qs.set('association', p.association);
  return `/farmers?${qs.toString()}`;
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
