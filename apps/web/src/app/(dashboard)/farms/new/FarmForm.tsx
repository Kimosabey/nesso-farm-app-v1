'use client';

import { useActionState, useMemo, useState } from 'react';
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

const INPUT =
  'block h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-[15px] text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30';

const PIN_RE = /^\d{6}$/;

export function FarmForm({ farmers }: { farmers: Farmer[] }) {
  const [state, formAction] = useActionState(createFarmAction, initial);

  const [farmerId, setFarmerId] = useState(farmers[0]?._id ?? '');
  const [farmName, setFarmName] = useState('');
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 12.2958,
    lng: 76.6394,
  });
  const [polygon, setPolygon] = useState<Array<{ lat: number; lng: number }>>([]);
  const [computedAcres, setComputedAcres] = useState(0);
  const [farmAreaInput, setFarmAreaInput] = useState('1.0');
  const [pincode, setPincode] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!farmerId) e.farmerId = 'Select a farmer.';
    if (!farmName.trim()) e.farmName = 'Farm name is required.';
    const area = Number(farmAreaInput);
    if (!Number.isFinite(area) || area <= 0) e.farmArea = 'Area must be greater than 0 acres.';
    if (pincode.trim() && !PIN_RE.test(pincode.trim())) e.pincode = 'Pincode must be 6 digits.';
    return e;
  }, [farmerId, farmName, farmAreaInput, pincode]);

  const valid = Object.keys(errors).length === 0;
  const show = (k: string) => (touched[k] ? errors[k] : undefined);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="farmerId" value={farmerId} />
      <input type="hidden" name="latitude" value={center.lat} />
      <input type="hidden" name="longitude" value={center.lng} />
      <input type="hidden" name="polygonPoints" value={JSON.stringify(polygon)} />

      <Section title="Identity" description="Who owns the farm and how to identify it">
        <Grid>
          <Field label="Farmer" required htmlFor="farmerId" error={show('farmerId')}>
            <select
              id="farmerId"
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              onBlur={blur('farmerId')}
              required
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
          <Field label="Farm name" required htmlFor="farmName" error={show('farmName')}>
            <input
              id="farmName"
              name="farmName"
              type="text"
              required
              placeholder="e.g. Hosakote Plot 1"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              onBlur={blur('farmName')}
              className={INPUT}
            />
          </Field>
          <Field label="Survey number" htmlFor="surveyNumber">
            <input id="surveyNumber" name="surveyNumber" type="text" className={INPUT} />
          </Field>
        </Grid>
      </Section>

      <Section
        title="Location"
        description="Click the map to drop the GPS pin; Shift+click to add polygon vertices"
      >
        <PolygonMap
          onCenterChange={setCenter}
          onPolygonChange={setPolygon}
          onAreaChange={(a) => {
            setComputedAcres(a);
            if (a > 0) setFarmAreaInput(a.toFixed(2));
          }}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Latitude" htmlFor="latitudeDisplay" hint="Auto-set from the map pin">
            <input
              id="latitudeDisplay"
              type="text"
              readOnly
              value={center.lat.toFixed(5)}
              className={`${INPUT} text-fg-muted`}
            />
          </Field>
          <Field label="Longitude" htmlFor="longitudeDisplay" hint="Auto-set from the map pin">
            <input
              id="longitudeDisplay"
              type="text"
              readOnly
              value={center.lng.toFixed(5)}
              className={`${INPUT} text-fg-muted`}
            />
          </Field>
          <Field label="Village" htmlFor="village">
            <input id="village" name="village" type="text" className={INPUT} />
          </Field>
          <Field label="District" htmlFor="district">
            <input id="district" name="district" type="text" className={INPUT} />
          </Field>
          <Field label="State" htmlFor="state">
            <input id="state" name="state" type="text" defaultValue="Karnataka" className={INPUT} />
          </Field>
          <Field label="Pincode" htmlFor="pincode" hint="6 digits" error={show('pincode')}>
            <input
              id="pincode"
              name="pincode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              onBlur={blur('pincode')}
              className={INPUT}
            />
          </Field>
        </div>
      </Section>

      <Section title="Practice" description="Area and cultivation details">
        <Grid>
          <Field
            label="Area (acres)"
            required
            htmlFor="farmArea"
            error={show('farmArea')}
            hint={
              computedAcres > 0
                ? `Auto-filled from polygon (${computedAcres.toFixed(2)} ac)`
                : 'Or Shift+click on the map to draw a polygon and auto-fill'
            }
          >
            <input
              id="farmArea"
              name="farmArea"
              type="number"
              min="0"
              step="0.01"
              required
              value={farmAreaInput}
              onChange={(e) => setFarmAreaInput(e.target.value)}
              onBlur={blur('farmArea')}
              className={INPUT}
            />
          </Field>
          <Field label="Growing area (acres)" htmlFor="growingArea">
            <input
              id="growingArea"
              name="growingArea"
              type="number"
              min="0"
              step="0.01"
              className={INPUT}
            />
          </Field>
          <Field label="Organic stage" htmlFor="organicStage">
            <select
              id="organicStage"
              name="organicStage"
              defaultValue="Conventional"
              className={INPUT}
            >
              <option value="Conventional">Conventional</option>
              <option value="InTransition">In transition</option>
              <option value="Certified">Certified organic</option>
            </select>
          </Field>
        </Grid>
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
          href="/farms"
          className="inline-flex h-11 items-center rounded-md border border-border-strong px-4 text-sm text-fg transition hover:bg-bg-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
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
  htmlFor: string;
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

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Saving…' : 'Register farm'}
    </button>
  );
}
