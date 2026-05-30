import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone } from 'lucide-react';
import { api, ApiError, readAccessToken, type Farm } from '@/lib/api';
import { Avatar } from '@/components/dashboard/Avatar';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { ApprovalActions } from '../../approvals/ApprovalActions';
import { ProfileTabs } from './ProfileTabs';

const STATUS_PILL: Record<
  'pending' | 'approved' | 'rejected',
  { kind: 'pending' | 'approved' | 'rejected'; label: string }
> = {
  pending: { kind: 'pending', label: 'KYC in review' },
  approved: { kind: 'approved', label: 'KYC verified' },
  rejected: { kind: 'rejected', label: 'KYC failed' },
};

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

  let farms: Farm[] = [];
  try {
    const fr = await api.listFarms(token, { farmerId: f._id, pageSize: 50 });
    farms = fr.data;
  } catch {
    farms = [];
  }

  const name = [f.firstName, f.lastName].filter(Boolean).join(' ').trim() || f.farmerId;
  const pill = STATUS_PILL[f.approvalStatus];
  const association = f.isFlowerAgent ? 'Flower agent' : f.groupAssociation.replace('_', ' ');
  const totalArea = farms.reduce((sum, farm) => sum + (farm.farmArea ?? 0), 0);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-2 text-sm text-fg-muted">
        <Link href="/farmers" className="hover:text-primary">
          ← Farmers
        </Link>
      </div>

      <div className="grid items-start gap-5 lg:[grid-template-columns:360px_1fr]">
        {/* left profile panel */}
        <div className="self-start rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm">
          <div className="flex flex-col items-center border-b border-border pb-[18px] text-center">
            <Avatar name={name} size={76} />
            <h2 className="mt-3 font-display text-[19px] font-bold text-fg">{name}</h2>
            <p className="mt-1 font-mono text-[12.5px] text-fg-subtle">{f.farmerId}</p>
            <div className="mt-2">
              <StatusPill kind={pill.kind}>{pill.label}</StatusPill>
            </div>
            <div className="mt-2">
              <span className="inline-flex rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs font-semibold text-secondary-700">
                {association}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 border-b border-border py-[18px]">
            <ContactRow icon={<Phone size={15} />} label="Mobile" value={f.mobileNumber} />
            <ContactRow
              icon={<MapPin size={15} />}
              label="Village"
              value={f.address?.village ?? '—'}
            />
            <ContactRow
              icon={<MapPin size={15} />}
              label="District"
              value={f.address?.district ?? '—'}
            />
            <ContactRow
              icon={<MapPin size={15} />}
              label="Pincode"
              value={f.address?.pincode ?? '—'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-[18px]">
            <Stat label="Farms" value={String(farms.length)} />
            <Stat label="Total area" value={`${totalArea.toFixed(1)} ha`} />
            <Stat label="Active crops" value={String(f.selectedCrops?.length ?? 0)} />
            <Stat label="Practice" value={f.productionPractice ?? '—'} />
          </div>

          {f.approvalStatus === 'pending' ? (
            <div className="mt-[18px] border-t border-border pt-[18px]">
              <p className="mb-3 text-[13px] font-medium text-warning">Awaiting KYC approval</p>
              <ApprovalActions farmerId={f._id} />
            </div>
          ) : f.approvalStatus === 'rejected' && f.rejectionReason ? (
            <div className="mt-[18px] rounded-xl border border-danger/30 bg-danger/10 p-3">
              <p className="text-[13px] font-medium text-danger">Rejected</p>
              <p className="mt-1 text-[13px] text-fg-muted">{f.rejectionReason}</p>
            </div>
          ) : null}
        </div>

        {/* right tabs */}
        <ProfileTabs farmer={f} farms={farms} />
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-fg-subtle">
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-bold text-fg">{value}</div>
    </div>
  );
}
