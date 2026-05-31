import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Droplets, Leaf, MapPin, Ruler, Sprout, User } from 'lucide-react';
import {
  api,
  ApiError,
  readAccessToken,
  type Activity,
  type Crop,
  type WeatherSnapshot,
} from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { MiniMap } from '@/components/dashboard/charts/MiniMap';
import { FarmTabs } from './FarmTabs';

const STATUS_PILL: Record<
  'pending' | 'approved' | 'rejected',
  { kind: 'pending' | 'approved' | 'rejected'; label: string }
> = {
  pending: { kind: 'pending', label: 'Approval pending' },
  approved: { kind: 'approved', label: 'Approved' },
  rejected: { kind: 'rejected', label: 'Rejected' },
};

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = (await readAccessToken())!;

  let farm;
  try {
    farm = await api.getFarm(token, id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [farmer, weather, crops, activities] = await Promise.all([
    api.getFarmer(token, farm.farmerId).catch(() => null),
    api.weatherForFarm(token, id).catch((): WeatherSnapshot | null => null),
    api
      .listCrops(token, { farmId: id })
      .then((r) => r.data)
      .catch((): Crop[] => []),
    api
      .listActivities(token, { farmId: id, pageSize: 20 })
      .then((r) => r.data)
      .catch((): Activity[] => []),
  ]);

  const farmerName = farmer
    ? [farmer.firstName, farmer.lastName].filter(Boolean).join(' ').trim() || farmer.farmerId
    : '—';
  const pill = STATUS_PILL[farm.approvalStatus];
  const lat = farm.location?.coordinates?.[1];
  const lng = farm.location?.coordinates?.[0];
  const centroid =
    Number.isFinite(lat) && Number.isFinite(lng)
      ? `${lat!.toFixed(4)}°, ${lng!.toFixed(4)}°`
      : '—';
  const primaryCrop = crops[0]?.cropName ?? '—';

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-2 text-sm text-fg-muted">
        <Link href="/farms" className="hover:text-primary">
          &larr; Farms
        </Link>
      </div>

      <PageHeader
        title={farm.farmName}
        sub={`${farm.farmId} · ${farm.address?.district ?? '—'} · ${farmerName}`}
        actions={<StatusPill kind={pill.kind}>{pill.label}</StatusPill>}
      />

      <div className="grid items-start gap-5 lg:[grid-template-columns:360px_1fr]">
        {/* left panel */}
        <div className="self-start overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm">
          <div className="h-44">
            <MiniMap />
          </div>
          <div className="border-b border-border p-5">
            <h2 className="font-display text-[18px] font-bold text-fg">{farm.farmName}</h2>
            <p className="mt-1 font-mono text-[12.5px] text-fg-subtle">{farm.farmId}</p>
          </div>

          <div className="flex flex-col gap-3.5 border-b border-border p-5">
            <InfoRow
              icon={<Ruler size={15} />}
              label="Area"
              value={`${(farm.farmArea ?? 0).toFixed(2)} ac`}
            />
            <InfoRow
              icon={<Sprout size={15} />}
              label="Growing area"
              value={`${(farm.growingArea ?? 0).toFixed(2)} ac`}
            />
            <InfoRow icon={<Leaf size={15} />} label="Practice" value={farm.organicStage ?? '—'} />
            <InfoRow icon={<Droplets size={15} />} label="Crop" value={primaryCrop} />
            <InfoRow
              icon={<User size={15} />}
              label="Farmer"
              value={
                farmer ? (
                  <Link href={`/farmers/${farmer._id}`} className="text-primary hover:underline">
                    {farmerName}
                  </Link>
                ) : (
                  '—'
                )
              }
            />
            <InfoRow
              icon={<MapPin size={15} />}
              label="Village"
              value={farm.address?.village ?? '—'}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 p-5">
            <Stat label="Crops" value={String(crops.length)} />
            <Stat label="Activities" value={String(activities.length)} />
            <Stat label="Centroid" value={centroid} mono />
          </div>
        </div>

        {/* right tabs */}
        <FarmTabs
          crops={crops}
          activities={activities}
          weather={weather}
          soil={undefined}
        />
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-[13px] text-fg-muted">
        <span className="text-fg-subtle">{icon}</span>
        {label}
      </span>
      <span className="truncate text-[13.5px] font-semibold text-fg">{value}</span>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-fg-subtle">
        {label}
      </div>
      <div
        className={`mt-1 truncate font-bold text-fg ${
          mono ? 'font-mono text-[12.5px]' : 'font-display text-lg'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
