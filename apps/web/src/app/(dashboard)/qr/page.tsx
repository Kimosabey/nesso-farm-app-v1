import { api, readAccessToken } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { QrGenerator, type BatchOption } from './QrGenerator';

export const metadata = {
  title: 'QR generator',
};

export default async function QrPage() {
  const token = (await readAccessToken())!;

  const page = await api.listInventory(token, { pageSize: 100 }).catch(() => null);

  const batches: BatchOption[] = (page?.data ?? []).map((b) => ({
    id: b._id,
    batchId: b.batchId,
    label: `${b.batchId} · ${b.productName}${b.grade ? ` · ${b.grade}` : ''}`,
  }));

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-8">
      <PageHeader title="QR generator" sub="Create trace labels for batches" />
      <QrGenerator batches={batches} />
    </section>
  );
}
