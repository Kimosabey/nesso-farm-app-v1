'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
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

  const farmsForFarmer = useMemo(() => farms.filter((f) => f.farmerId === farmerId), [farms, farmerId]);
  const cropsForFarm = useMemo(() => crops.filter((c) => c.farmId === farmId), [crops, farmId]);
  const filteredInputs = useMemo(() => {
    const q = inputSearch.trim().toLowerCase();
    if (!q) return inputs.slice(0, 12);
    return inputs
      .filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [inputs, inputSearch]);

  const totalCost = useMemo(
    () => picked.reduce((sum, i) => sum + (i.quantity ?? 0) * (i.cost ?? 0), 0),
    [picked],
  );

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
    <form action={formAction} className="space-y-6">
      {/* Hidden inputs that carry actual values */}
      <input type="hidden" name="farmerId" value={farmerId} />
      <input type="hidden" name="farmId" value={farmId} />
      <input type="hidden" name="cropId" value={cropId} />
      <input type="hidden" name="inputsJson" value={JSON.stringify(picked)} />

      <Section title="Where & when">
        <Grid>
          <Field label="Farmer *">
            <select
              value={farmerId}
              onChange={(e) => {
                setFarmerId(e.target.value);
                setFarmId('');
                setCropId('');
              }}
              className="input"
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
            label="Farm *"
            hint={
              farmerId && farmsForFarmer.length === 0
                ? 'This farmer has no farms yet — register one first.'
                : undefined
            }
          >
            <select
              value={farmId}
              onChange={(e) => {
                setFarmId(e.target.value);
                setCropId('');
              }}
              className="input"
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

          <Field label="Crop (optional)">
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="input"
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

          <Field label="Completed on">
            <input
              type="date"
              name="completedDate"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="input"
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Activity">
        <Field label="Type *">
          <select
            name="activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="input"
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Notes">
          <textarea
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional — anything worth recording"
            className="input min-h-[88px] py-2 leading-relaxed"
          />
        </Field>
      </Section>

      <Section
        title="Inputs"
        description="Search the catalog and add what was used. Quantity × cost rolls up automatically."
      >
        <input
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
          placeholder="Search urea, neem, mancozeb, labor…"
          className="input mb-3"
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
                    onChange={(e) =>
                      updatePicked(idx, { quantity: Number(e.target.value) || 0 })
                    }
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

      {state.error ? (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <SubmitButton disabled={!farmerId || !farmId} />
      </div>

      <style>{`.input { display:block; height:44px; width:100%; border-radius:8px; border:1px solid rgb(var(--border-strong)); background:rgb(var(--bg-elevated)); padding:0 12px; font-size:16px; color:rgb(var(--fg)); outline:none; transition:border-color 150ms ease, box-shadow 150ms ease; }
.input:disabled { opacity: 0.55; cursor: not-allowed; }
.input:focus { border-color:rgb(var(--ring)); box-shadow:0 0 0 3px rgb(var(--ring) / 0.30); }
textarea.input { height: auto; }`}</style>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
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
    <fieldset className="rounded-2xl border border-border bg-bg-elevated p-6 shadow-sm">
      <legend className="px-2 font-display text-lg text-fg">{title}</legend>
      {description ? <p className="mb-4 text-sm text-fg-muted">{description}</p> : null}
      {children}
    </fieldset>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-fg-subtle">{hint}</span> : null}
    </label>
  );
}
