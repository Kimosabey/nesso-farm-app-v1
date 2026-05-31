import { Box, Plus } from 'lucide-react';
import { api, readAccessToken, type InventoryBatch } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';

export default async function WarehousesPage() {
  const token = (await readAccessToken())!;

  const [result, inventory] = await Promise.all([
    api.listWarehouses(token, { pageSize: 100 }),
    api.listInventory(token, { pageSize: 200 }).catch(() => ({ data: [] as InventoryBatch[] })),
  ]);

  // Aggregate live stock per warehouse from inventory batches.
  const stockByWarehouse = new Map<string, number>();
  for (const b of inventory.data) {
    if (b.status === 'SOLD' || b.status === 'TRANSFERRED') continue;
    for (const key of [b.warehouseId, b.warehouseName]) {
      if (key) stockByWarehouse.set(key, (stockByWarehouse.get(key) ?? 0) + (b.quantity ?? 0));
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Warehouses"
        sub={`${result.total.toLocaleString()} ${
          result.total === 1 ? 'facility' : 'facilities'
        } · storage & processing`}
        actions={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} /> Add warehouse
          </button>
        }
      />

      {result.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-bg-elevated p-12 text-center shadow-sm">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-bg-muted text-fg-subtle">
            <Box size={24} />
          </span>
          <p className="text-sm font-medium text-fg">No warehouses registered yet</p>
          <p className="mt-1 text-[13px] text-fg-muted">
            Add a storage or processing facility to start tracking capacity.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.data.map((w) => {
            const stock =
              stockByWarehouse.get(w._id) ?? stockByWarehouse.get(w.warehouseName) ?? 0;
            const pct = w.capacity > 0 ? Math.min(100, Math.round((stock / w.capacity) * 100)) : 0;
            const high = pct > 75;
            const location = [w.address?.city, w.address?.district, w.address?.state]
              .filter(Boolean)
              .join(' · ');
            return (
              <div
                key={w._id}
                className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary-50 text-secondary-700">
                    <Box size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-[17px] font-bold text-fg">
                      {w.warehouseName}
                    </h3>
                    <div className="truncate text-[12.5px] text-fg-muted">
                      {w.ownership} · {w.certificationStatus}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs font-semibold text-secondary-700">
                    {w.type === 'FoodProcessing' ? 'Processing' : 'Storage'}
                  </span>
                </div>

                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-fg-muted">Capacity used</span>
                  <span className={`font-semibold ${high ? 'text-warning' : 'text-fg'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bg-muted">
                  <div
                    className={`h-full rounded-full ${high ? 'bg-warning' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border pt-4 text-sm">
                  <dt className="text-fg-subtle">Current stock</dt>
                  <dd className="text-right font-mono tabular-nums text-fg">
                    {stock.toLocaleString('en-IN')}
                  </dd>
                  <dt className="text-fg-subtle">Capacity</dt>
                  <dd className="text-right font-mono tabular-nums text-fg">
                    {w.capacity.toLocaleString('en-IN')}
                  </dd>
                  <dt className="text-fg-subtle">Area</dt>
                  <dd className="text-right font-mono tabular-nums text-fg">
                    {w.totalArea.toLocaleString('en-IN')}
                  </dd>
                </dl>

                {location ? (
                  <p className="mt-3 truncate text-[12.5px] text-fg-muted">{location}</p>
                ) : null}
                {w.primaryContact?.name ? (
                  <p className="mt-1 truncate text-[12.5px] text-fg-subtle">
                    {w.primaryContact.name}
                    {w.primaryContact.mobileNumber ? ` · ${w.primaryContact.mobileNumber}` : ''}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
