'use client';

import { useState } from 'react';
import { Activity, FileText, Leaf, MapPin, ShieldCheck, Sprout } from 'lucide-react';
import type { Farm, Farmer } from '@/lib/api';
import { StatusPill } from '@/components/dashboard/StatusPill';

const TABS = ['Farms', 'Crops', 'Activities', 'Samples', 'Documents'] as const;
type Tab = (typeof TABS)[number];

export function ProfileTabs({ farmer, farms }: { farmer: Farmer; farms: Farm[] }) {
  const [tab, setTab] = useState<Tab>('Farms');

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm">
      <div className="px-[18px] pt-1.5">
        <div className="flex gap-1 overflow-x-auto border-b border-border">
          {TABS.map((t) => {
            const on = t === tab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm transition ${
                  on
                    ? 'border-primary font-semibold text-primary'
                    : 'border-transparent font-medium text-fg-muted hover:text-fg'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5">
        {tab === 'Farms' && <FarmsTab farms={farms} />}
        {tab === 'Crops' && <CropsTab crops={farmer.selectedCrops ?? []} />}
        {tab === 'Activities' && (
          <Empty
            icon={<Activity size={26} />}
            title="No activities yet"
            body="Field operations logged for this farmer will appear here."
          />
        )}
        {tab === 'Samples' && (
          <Empty
            icon={<Sprout size={26} />}
            title="No lab samples"
            body="Quality samples submitted for this farmer will appear here."
          />
        )}
        {tab === 'Documents' && <DocumentsTab status={farmer.approvalStatus} />}
      </div>
    </div>
  );
}

function FarmsTab({ farms }: { farms: Farm[] }) {
  if (farms.length === 0) {
    return (
      <Empty
        icon={<MapPin size={26} />}
        title="No farms mapped"
        body="Mapped plots for this farmer will appear here as cards."
      />
    );
  }
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
      {farms.map((farm) => (
        <div
          key={farm._id}
          className="overflow-hidden rounded-2xl border border-border bg-bg-elevated transition hover:border-primary/40 hover:shadow-sm"
        >
          <div className="grid h-24 place-items-center bg-bg-muted text-fg-subtle">
            <MapPin size={22} />
          </div>
          <div className="p-3">
            <div className="text-sm font-semibold text-fg">{farm.farmName}</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-secondary-50 px-2 py-0.5 text-[11px] font-semibold text-secondary-700">
                {farm.organicStage}
              </span>
              <span className="rounded-full bg-bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-fg-muted">
                {farm.farmArea} ha
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CropsTab({ crops }: { crops: string[] }) {
  if (crops.length === 0) {
    return (
      <Empty
        icon={<Leaf size={26} />}
        title="No crops selected"
        body="Crops this farmer grows will appear here."
      />
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {crops.map((crop) => (
        <div
          key={crop}
          className="flex items-center gap-3.5 rounded-2xl border border-border p-3.5"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Leaf size={22} />
          </span>
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-fg">{crop}</div>
            <div className="text-[12.5px] text-fg-muted">Selected crop</div>
          </div>
          <StatusPill kind="active">Active</StatusPill>
        </div>
      ))}
    </div>
  );
}

function DocumentsTab({ status }: { status: Farmer['approvalStatus'] }) {
  const verified = status === 'approved';
  const docs: Array<[string, 'shield' | 'file' | 'check']> = [
    ['Aadhaar (front)', 'shield'],
    ['Aadhaar (back)', 'shield'],
    ['Bank passbook', 'file'],
    ['Land record', 'file'],
    ['Consent form', 'check'],
  ];
  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
      {docs.map(([name, icon]) => (
        <div key={name} className="rounded-2xl border border-border bg-bg-elevated p-3.5">
          <div className="mb-2.5 grid h-16 place-items-center rounded-lg bg-bg-muted text-fg-subtle">
            {icon === 'shield' ? (
              <ShieldCheck size={26} />
            ) : icon === 'check' ? (
              <ShieldCheck size={26} />
            ) : (
              <FileText size={26} />
            )}
          </div>
          <div className="text-[13px] font-semibold text-fg">{name}</div>
          <div className="mt-1.5">
            <StatusPill kind={verified ? 'approved' : 'pending'}>
              {verified ? 'Verified' : 'In review'}
            </StatusPill>
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="grid place-items-center px-4 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-bg-muted text-fg-subtle">
        {icon}
      </span>
      <div className="mt-3 text-sm font-semibold text-fg">{title}</div>
      <p className="mt-1 max-w-xs text-[13px] text-fg-muted">{body}</p>
    </div>
  );
}
