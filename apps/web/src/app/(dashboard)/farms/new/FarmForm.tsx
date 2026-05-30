'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { createFarmAction, type CreateFarmState } from './actions';
import type { Farmer } from '@/lib/api';

const PolygonMap = dynamic(() => import('./PolygonMap'), {
  ssr: false,
  loading: () => (
    <div className="grid h-[360px] place-items-center rounded-2xl border border-border bg-bg-muted text-sm text-fg-muted">
      Loading map…
    </div>
  ),
});

const initial: CreateFarmState = { error: null };

export function FarmForm({ farmers }: { farmers: Farmer[] }) {
  const [state, formAction] = useActionState(createFarmAction, initial);

  const [farmerId, setFarmerId] = useState(farmers[0]?._id ?? '');
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 12.2958,
    lng: 76.6394,
  });
  const [polygon, setPolygon] = useState<Array<{ lat: number; lng: number }>>([]);
  const [computedAcres, setComputedAcres] = useState(0);
  const [farmAreaInput, setFarmAreaInput] = useState('1.0');

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="farmerId" value={farmerId} />
      <input type="hidden" name="latitude" value={center.lat} />
      <input type="hidden" name="longitude" value={center.lng} />
      <input type="hidden" name="polygonPoints" value={JSON.stringify(polygon)} />

      <fieldset className="rounded-2xl border border-border bg-bg-elevated p-6 shadow-sm">
        <legend className="px-2 font-display text-lg text-fg">Map</legend>
        <PolygonMap
          onCenterChange={setCenter}
          onPolygonChange={setPolygon}
          onAreaChange={(a) => {
            setComputedAcres(a);
            if (a > 0) setFarmAreaInput(a.toFixed(2));
          }}
        />
      </fieldset>

      <fieldset className="rounded-2xl border border-border bg-bg-elevated p-6 shadow-sm">
        <legend className="px-2 font-display text-lg text-fg">Farm details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">Farmer *</span>
            <select
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              required
              className="input"
            >
              <option value="">— select —</option>
              {farmers.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.firstName} {f.lastName ?? ''} · {f.farmerId}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">Farm name *</span>
            <input
              name="farmName"
              type="text"
              required
              placeholder="e.g. Hosakote Plot 1"
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">Survey number</span>
            <input name="surveyNumber" type="text" className="input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">Area (acres) *</span>
            <input
              name="farmArea"
              type="number"
              min="0"
              step="0.01"
              required
              value={farmAreaInput}
              onChange={(e) => setFarmAreaInput(e.target.value)}
              className="input"
            />
            {computedAcres > 0 ? (
              <span className="mt-1 block text-xs text-fg-subtle">
                Auto-filled from polygon ({computedAcres.toFixed(2)} ac)
              </span>
            ) : (
              <span className="mt-1 block text-xs text-fg-subtle">
                Or shift-click on the map to draw a polygon and auto-fill
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">Growing area (acres)</span>
            <input name="growingArea" type="number" min="0" step="0.01" className="input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">Organic stage</span>
            <select name="organicStage" defaultValue="Conventional" className="input">
              <option value="Conventional">Conventional</option>
              <option value="InTransition">In transition</option>
              <option value="Certified">Certified organic</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-border bg-bg-elevated p-6 shadow-sm">
        <legend className="px-2 font-display text-lg text-fg">Address</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">Village</span>
            <input name="village" type="text" className="input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">District</span>
            <input name="district" type="text" className="input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">State</span>
            <input name="state" type="text" defaultValue="Karnataka" className="input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">Pincode</span>
            <input
              name="pincode"
              type="text"
              inputMode="numeric"
              pattern="^\d{6}$"
              maxLength={6}
              className="input"
            />
          </label>
        </div>
      </fieldset>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <SubmitButton disabled={!farmerId} />
        <Link
          href="/farms"
          className="inline-flex h-11 items-center rounded-md border border-border-strong px-4 text-sm text-fg hover:bg-bg-muted"
        >
          Cancel
        </Link>
      </div>

      <style>{`.input{display:block;height:44px;width:100%;border-radius:8px;border:1px solid rgb(var(--border-strong));background:rgb(var(--bg-elevated));padding:0 12px;font-size:16px;color:rgb(var(--fg));outline:none;transition:border-color 150ms ease,box-shadow 150ms ease}.input:focus{border-color:rgb(var(--ring));box-shadow:0 0 0 3px rgb(var(--ring)/.30)}`}</style>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
      aria-busy={pending}
    >
      {pending ? 'Saving…' : 'Register farm'}
    </button>
  );
}
