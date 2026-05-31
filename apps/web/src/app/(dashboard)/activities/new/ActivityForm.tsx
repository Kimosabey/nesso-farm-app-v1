'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';
import { createActivityAction, type CreateActivityState } from './actions';
import type { ActivityInput, Crop, Farm, Farmer, InputCatalogItem } from '@/lib/api';

const ACTIVITY_TYPES = [
  'Land Preparation',
  'Sowing/Planting',
  'Irrigation',
  'Fertilization',
  'Pesticide',
  'Weeding',
  'Pruning',
  'Inspection',
  'Harvest',
  'Other',
];

const initial: CreateActivityState = { error: null };

const INPUT =
  'block h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-[15px] text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-55';

export function ActivityForm({
  farmers,
  farms,
  crops,
  inputs,
}: {
  farmers: Farmer[];
  farms: Farm[];
  crops: Crop[];
  inputs: InputCatalogItem[];
}) {
  const [state, formAction] = useActionState(createActivityAction, initial);

  const [farmerId, setFarmerId] = useState<string>(farmers[0]?._id ?? '');
  const [farmId, setFarmId] = useState<string>('');
  const [cropId, setCropId] = useState<string>('');
  const [activity, setActivity] = useState<string>(ACTIVITY_TYPES[0]);
  const [completedDate, setCompletedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState<string>('');
  const [picked, setPicked] = useState<ActivityInput[]>([]);
  const [inputSearch, setInputSearch] = useState<string>('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const farmsForFarmer = useMemo(
    () => farms.filter((f) => f.farmerId === farmerId),
    [farms, farmerId],
  );
  const cropsForFarm = useMemo(() => crops.filter((c) => c.farmId === farmId), [crops, farmId]);
  const filteredInputs = useMemo(() => {
    const q = inputSearch.trim().toLowerCase();
    if (!q) return inputs.slice(0, 12);
    return inputs
      .filter((i) => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q))
      .slice(0, 20);
  }, [inputs, inputSearch]);

  const totalCost = useMemo(
    () => picked.reduce((sum, i) => sum + (i.quantity ?? 0) * (i.cost ?? 0), 0),
    [picked],
  );

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!farmerId) e.farmerId = 'Select a farmer.';
    if (!farmId) e.farmId = 'Select a farm.';
    if (!activity.trim()) e.activity = 'Select an activity type.';
    return e;
  }, [farmerId, farmId, activity]);

  const valid = Object.keys(errors).length === 0;
  const show = (k: string) => (touched[k] ? errors[k] : undefined);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  function addInput(item: InputCatalogItem) {
    if (picked.some((p) => p.itemId === item.code)) return;
    setPicked([
      ...picked,
      {
        kind: item.kind,
        itemId: item.code,
        name: item.name,
        quantity: 1,
        unit: item.unit,
        cost: item.defaultCost,
      },
    ]);
  }

  function updatePicked(idx: number, patch: Partial<ActivityInput>) {
    setPicked(picked.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function removePicked(idx: number) {
    setPicked(picked.filter((_, i) => i !== idx));
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden inputs that carry actual values */}
      <input type="hidden" name="farmerId" value={farmerId} />
      <input type="hidden" name="farmId" value={farmId} />
      <input type="hidden" name="cropId" value={cropId} />
      <input type="hidden" name="inputsJson" value={JSON.stringify(picked)} />

      <Section title="Activity" description="What was done, on which farm, and when">
        <Grid>
          <Field label="Farmer" required htmlFor="farmerId" error={show('farmerId')}>
            <select
              id="farmerId"
              value={farmerId}
              onChange={(e) => {
                setFarmerId(e.target.value);
                setFarmId('');
                setCropId('');
              }}
              onBlur={blur('farmerId')}
              className={INPUT}
            >
              <option value="">— select —</option>
              {farmers.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.firstName} {f.lastName ?? ''} · {f.farmerId}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Farm"
            required
            htmlFor="farmId"
            error={show('farmId')}
            hint={
              farmerId && farmsForFarmer.length === 0
                ? 'This farmer has no farms yet — register one first.'
                : undefined
            }
          >
            <select
              id="farmId"
              value={farmId}
              onChange={(e) => {
                setFarmId(e.target.value);
                setCropId('');
              }}
              onBlur={blur('farmId')}
              className={INPUT}
              disabled={!farmerId || farmsForFarmer.length === 0}
            >
              <option value="">— select —</option>
              {farmsForFarmer.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.farmName} · {f.farmId} ({f.farmArea} ac)
                </option>
              ))}
            </select>
          </Field>

          <Field label="Type" required htmlFor="activity" error={show('activity')}>
            <select
              id="activity"
              name="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              onBlur={blur('activity')}
              className={INPUT}
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Crop" htmlFor="cropId" hint="Optional">
            <select
              id="cropId"
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className={INPUT}
              disabled={!farmId || cropsForFarm.length === 0}
            >
              <option value="">— none —</option>
              {cropsForFarm.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.cropName} {c.cropVariety ? `· ${c.cropVariety}` : ''}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Completed on" htmlFor="completedDate">
            <input
              id="completedDate"
              type="date"
              name="completedDate"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className={INPUT}
            />
          </Field>
        </Grid>
      </Section>

      <Section
        title="Inputs"
        description="Search the catalog and add what was used. Quantity × cost rolls up automatically."
      >
        <input
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
          placeholder="Search urea, neem, mancozeb, labor…"
          className={`${INPUT} mb-3`}
          aria-label="Search input catalog"
        />

        <div className="grid gap-2 sm:grid-cols-2">
          {filteredInputs.map((i) => {
            const used = picked.some((p) => p.itemId === i.code);
            return (
              <button
                key={i._id}
                type="button"
                onClick={() => addInput(i)}
                disabled={used}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                  used
                    ? 'border-border-strong bg-bg-muted/50 text-fg-subtle'
                    : 'border-border bg-bg-elevated hover:border-primary hover:bg-primary/5'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-fg">{i.name}</span>
                  <span className="text-xs text-fg-subtle">
                    {i.kind} · ₹{i.defaultCost}/{i.unit}
                  </span>
                </span>
                {used ? (
                  <span className="text-xs text-fg-muted">added</span>
                ) : (
                  <Plus className="size-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>

        {picked.length > 0 ? (
          <div className="mt-5 rounded-lg border border-border bg-bg-muted/30 p-3">
            <h3 className="mb-2 text-xs uppercase tracking-wider text-fg-subtle">
              Selected ({picked.length})
            </h3>
            <ul className="space-y-2">
              {picked.map((p, idx) => (
                <li
                  key={p.itemId ?? idx}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 py-2"
                >
                  <span className="flex-1 min-w-0 truncate text-sm font-medium text-fg">
                    {p.name}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={p.quantity}
                    onChange={(e) => updatePicked(idx, { quantity: Number(e.target.value) || 0 })}
                    className="h-9 w-20 rounded-md border border-border-strong bg-bg px-2 text-sm text-fg"
                    aria-label={`Quantity of ${p.name}`}
                  />
                  <span className="text-xs text-fg-subtle">{p.unit}</span>
                  <span className="text-xs text-fg-subtle">@</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={p.cost ?? 0}
                    onChange={(e) => updatePicked(idx, { cost: Number(e.target.value) || 0 })}
                    className="h-9 w-20 rounded-md border border-border-strong bg-bg px-2 text-sm text-fg"
                    aria-label={`Cost per ${p.unit} of ${p.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => removePicked(idx)}
                    aria-label={`Remove ${p.name}`}
                    className="rounded-md p-1.5 text-fg-muted hover:bg-danger/10 hover:text-danger"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-right text-sm">
              <span className="text-fg-subtle">Total cost: </span>
              <span className="font-display tabular-nums text-fg">₹ {totalCost.toFixed(0)}</span>
            </p>
          </div>
        ) : null}
      </Section>

      <Section title="Notes" description="Anything worth recording about this activity">
        <Field label="Notes" htmlFor="notes">
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional — anything worth recording"
            className="block w-full rounded-md border border-border-strong bg-bg-elevated px-3 py-2 text-[15px] leading-relaxed text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30 min-h-[88px]"
          />
        </Field>
      </Section>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <SubmitButton disabled={!valid} />
        <Link
          href="/activities"
          className="inline-flex h-11 items-center rounded-md border border-border-strong px-4 text-sm text-fg transition hover:bg-bg-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Logging…' : 'Log activity'}
    </button>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-bg-elevated p-5 shadow-sm">
      <div className="border-b border-border pb-3">
        <h2 className="text-[15px] font-semibold text-fg">{title}</h2>
        {description ? <p className="mt-0.5 text-[13px] text-fg-muted">{description}</p> : null}
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  required,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      {label ? (
        <span className="mb-1.5 block text-sm font-semibold text-fg">
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </span>
      ) : null}
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-danger" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-fg-subtle">{hint}</span>
      ) : null}
    </label>
  );
}
