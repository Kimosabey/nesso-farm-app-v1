import { api, readAccessToken, type Farm, type Farmer } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { CropsTable, toCropRow } from './CropsTable';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function CropsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const token = (await readAccessToken())!;

  const [result, farmsRes, farmersRes] = await Promise.all([
    api.listCrops(token, {}),
    api.listFarms(token, { pageSize: 200 }).catch(() => ({ data: [] as Farm[] })),
    api.listFarmers(token, { pageSize: 200 }).catch(() => ({ data: [] as Farmer[] })),
  ]);

  const farmById = new Map(farmsRes.data.map((f) => [f._id, f]));
  const farmerById = new Map(farmersRes.data.map((f) => [f._id, f]));
  const rows = result.data.map((c) => toCropRow(c, farmById, farmerById));

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Crops"
        sub={`${result.total.toLocaleString()} ${
          result.total === 1 ? 'crop cycle' : 'crop cycles'
        } recorded across the cluster`}
      />

      <CropsTable rows={rows} total={result.total} query={q ?? ''} />
    </section>
  );
}
