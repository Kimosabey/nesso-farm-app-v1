'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { Avatar } from '@/components/dashboard/Avatar';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { approveFarmerAction, rejectFarmerAction } from './actions';

export interface QueueItem {
  id: string;
  who: string;
  village: string;
  crop: string;
  age: string;
  risk: 'low' | 'med';
  mobile: string;
  association: string;
}

const TABS = ['Farmers', 'Activities', 'Audits'] as const;
type Tab = (typeof TABS)[number];

export function ApprovalsSplit({ items }: { items: QueueItem[] }) {
  const [tab, setTab] = useState<Tab>('Farmers');
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const list = tab === 'Farmers' ? items : [];
  const current = list.find((i) => i.id === selectedId) ?? list[0] ?? null;

  function approve() {
    if (!current) return;
    setError(null);
    startTransition(async () => {
      const r = await approveFarmerAction(current.id);
      if (!r.ok) setError(r.error ?? 'Failed');
      else setReason('');
    });
  }

  function reject() {
    if (!current) return;
    setError(null);
    startTransition(async () => {
      const r = await rejectFarmerAction(current.id, reason);
      if (!r.ok) setError(r.error ?? 'Failed');
      else setReason('');
    });
  }

  return (
    <div>
      {/* tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => {
          const on = t === tab;
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError(null);
              }}
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition ${
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

      {/* split master-detail: 1fr / 380px, collapses < 920px */}
      <div className="grid gap-4 min-[920px]:[grid-template-columns:1fr_380px]">
        {/* queue */}
        <div className="flex flex-col gap-2.5">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-border bg-bg-elevated py-16 text-center text-sm text-fg-muted">
              {tab === 'Farmers' ? 'Queue clear — nice work.' : 'Nothing awaiting review here.'}
            </div>
          ) : (
            list.map((it) => {
              const on = current?.id === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(it.id);
                    setReason('');
                    setError(null);
                  }}
                  className={`flex items-center gap-3.5 rounded-2xl p-3.5 text-left shadow-sm transition ${
                    on
                      ? 'border-[1.5px] border-primary bg-primary/10'
                      : 'border border-border bg-bg-elevated hover:border-border-strong'
                  }`}
                >
                  <Avatar name={it.who} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-fg">{it.who}</div>
                    <div className="text-[12.5px] text-fg-muted">
                      {it.village} · {it.crop}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-mono text-[11px] text-fg-subtle">{it.age}</span>
                    <span
                      className={`rounded-full px-1.5 py-px text-[10.5px] font-bold ${
                        it.risk === 'med'
                          ? 'bg-warning/15 text-warning'
                          : 'bg-secondary-50 text-secondary-700'
                      }`}
                    >
                      {it.risk === 'med' ? 'Review' : 'Low risk'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* detail */}
        {current ? (
          <div className="self-start rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm min-[920px]:sticky min-[920px]:top-4">
            <div className="flex items-center gap-3.5 border-b border-border pb-4">
              <Avatar name={current.who} size={52} />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-bold text-fg">{current.who}</h3>
                <div className="truncate font-mono text-[12.5px] text-fg-subtle">
                  {current.id.slice(-6)} · {current.village}
                </div>
              </div>
              <StatusPill kind="pending">Pending</StatusPill>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-border py-[18px]">
              <Field label="Mobile" value={current.mobile} />
              <Field label="Crop" value={current.crop} />
              <Field label="Association" value={current.association} />
              <Field label="Submitted" value={current.age} />
            </div>

            <div className="pt-[18px]">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (required to reject)"
                disabled={pending}
                className="mb-3 h-10 w-full rounded-md border border-border-strong bg-bg px-3 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={reject}
                  disabled={pending || reason.trim().length < 3}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-danger px-4 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:opacity-50"
                >
                  <X size={16} /> {pending ? 'Working…' : 'Reject'}
                </button>
                <button
                  type="button"
                  onClick={approve}
                  disabled={pending}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={16} /> {pending ? 'Working…' : 'Approve'}
                </button>
              </div>
              {error ? (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-fg-subtle">
        {label}
      </div>
      <div className="mt-1 truncate text-[14.5px] font-semibold text-fg">{value}</div>
    </div>
  );
}
