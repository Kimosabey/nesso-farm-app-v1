import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';
import { ActivityForm } from './ActivityForm';

export default async function NewActivityPage() {
  const token = (await readAccessToken())!;
  const [farmers, farms, crops, inputs] = await Promise.all([
    api.listFarmers(token, { pageSize: 200 }),
    api.listFarms(token, { pageSize: 200 }),
    api.listCrops(token, {}),
    api.listInputs(token, { limit: 200 }),
  ]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-2 text-sm text-fg-muted">
        <Link href="/activities" className="hover:text-primary">
          ← Activities
        </Link>
      </div>
      <h1 className="font-display text-3xl tracking-tight text-fg">Log activity</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Pick farmer → farm → crop, add inputs from the catalog, save. Costs are computed
        automatically from quantity × cost.
      </p>

      <div className="mt-6">
        {farms.data.length === 0 ? (
          <div className="rounded-2xl border border-warning/30 bg-warning/10 p-5 text-sm text-fg">
            <p className="font-medium text-warning">No farms registered yet.</p>
            <p className="mt-1 text-fg-muted">
              You need at least one farm before logging activities. Add one from a farmer's profile.
            </p>
            <Link
              href="/farmers"
              className="mt-3 inline-flex h-9 items-center rounded-md border border-border-strong px-3 text-sm text-fg hover:bg-bg-muted"
            >
              Go to farmers
            </Link>
          </div>
        ) : (
          <ActivityForm
            farmers={farmers.data}
            farms={farms.data}
            crops={crops.data}
            inputs={inputs}
          />
        )}
      </div>
    </section>
  );
}
