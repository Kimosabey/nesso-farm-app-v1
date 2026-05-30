import { api, readAccessToken } from '@/lib/api';

export default async function WarehousesPage() {
  const token = (await readAccessToken())!;
  const result = await api.listWarehouses(token, { pageSize: 100 });

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Warehouses</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {result.total} {result.total === 1 ? 'warehouse' : 'warehouses'} registered
          </p>
        </div>
      </div>

      {result.data.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-bg-elevated p-12 text-center">
          <p className="text-fg-muted">No warehouses yet. Add them via the API for now.</p>
          <code className="mt-3 inline-block font-mono text-xs text-fg-subtle">
            POST /api/v1/warehouses
          </code>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.data.map((w) => (
            <div
              key={w._id}
              className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg text-fg">{w.warehouseName}</h2>
                <span className="rounded-full border border-border-strong bg-bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-fg-subtle">
                  {w.type === 'FoodProcessing' ? 'Processing' : 'Storage'}
                </span>
              </div>
              <p className="mt-1 text-xs text-fg-subtle">
                {w.ownership} · {w.certificationStatus}
                {w.certifyingAgency ? ` · ${w.certifyingAgency}` : ''}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <dt className="text-fg-subtle">Capacity</dt>
                <dd className="text-right font-mono tabular-nums text-fg">{w.capacity}</dd>
                <dt className="text-fg-subtle">Area</dt>
                <dd className="text-right font-mono tabular-nums text-fg">{w.totalArea}</dd>
              </dl>
              {w.address?.city || w.address?.district || w.address?.state ? (
                <p className="mt-3 text-xs text-fg-muted">
                  {[w.address?.city, w.address?.district, w.address?.state]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              ) : null}
              {w.primaryContact?.name ? (
                <p className="mt-2 text-xs text-fg-muted">
                  {w.primaryContact.name}
                  {w.primaryContact.mobileNumber ? ` · ${w.primaryContact.mobileNumber}` : ''}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
