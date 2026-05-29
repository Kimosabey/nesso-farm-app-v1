'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createFarmerAction, type CreateFarmerState } from './actions';

const initial: CreateFarmerState = { error: null };

export function FarmerForm() {
  const [state, formAction] = useActionState(createFarmerAction, initial);

  return (
    <form action={formAction} className="space-y-8">
      <Section title="Personal" description="Required identification fields">
        <Grid>
          <Field label="First name *" htmlFor="firstName" error={state.fieldErrors?.firstName}>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              className="input"
            />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              className="input"
            />
          </Field>
          <Field
            label="Mobile number *"
            htmlFor="mobileNumber"
            hint="10 digits, starts 6-9"
            error={state.fieldErrors?.mobileNumber}
          >
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              required
              inputMode="numeric"
              autoComplete="tel"
              pattern="^[6-9]\d{9}$"
              className="input"
            />
          </Field>
          <Field label="Gender" htmlFor="gender">
            <select id="gender" name="gender" defaultValue="" className="input">
              <option value="">—</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>
        </Grid>
      </Section>

      <Section title="Association" description="How the farmer is organized">
        <Grid>
          <Field label="Group" htmlFor="groupAssociation">
            <select
              id="groupAssociation"
              name="groupAssociation"
              defaultValue="INDEPENDENT"
              className="input"
            >
              <option value="INDEPENDENT">Independent</option>
              <option value="FLOWER_AGENT">Flower agent</option>
              <option value="FPO">FPO</option>
            </select>
          </Field>
          <Field label="" htmlFor="isFlowerAgent">
            <label className="mt-7 inline-flex items-center gap-2 text-sm text-fg">
              <input
                id="isFlowerAgent"
                name="isFlowerAgent"
                type="checkbox"
                className="size-4 rounded border-border-strong text-primary focus:ring-ring"
              />
              This farmer is themselves a flower agent
            </label>
          </Field>
        </Grid>
      </Section>

      <Section title="Address">
        <Grid>
          <Field label="Village" htmlFor="village">
            <input id="village" name="village" type="text" className="input" />
          </Field>
          <Field label="District" htmlFor="district">
            <input id="district" name="district" type="text" className="input" />
          </Field>
          <Field label="State" htmlFor="state">
            <input id="state" name="state" type="text" className="input" defaultValue="Karnataka" />
          </Field>
          <Field label="Pincode" htmlFor="pincode" error={state.fieldErrors?.pincode}>
            <input
              id="pincode"
              name="pincode"
              type="text"
              inputMode="numeric"
              pattern="^\d{6}$"
              maxLength={6}
              className="input"
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Crops & practice">
        <Grid>
          <Field label="Production practice" htmlFor="productionPractice">
            <select
              id="productionPractice"
              name="productionPractice"
              defaultValue="Conventional"
              className="input"
            >
              <option value="Conventional">Conventional</option>
              <option value="Organic">Organic</option>
              <option value="NaturalFarming">Natural farming</option>
              <option value="GAPCertified">GAP certified</option>
            </select>
          </Field>
          <Field label="Crops" htmlFor="selectedCrops" hint="Comma-separated">
            <input
              id="selectedCrops"
              name="selectedCrops"
              type="text"
              placeholder="Tuberose, Jasmine"
              className="input"
            />
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
        <SubmitButton />
        <Link
          href="/farmers"
          className="h-11 inline-flex items-center rounded-md border border-border-strong px-4 text-sm text-fg hover:bg-bg-muted"
        >
          Cancel
        </Link>
      </div>

      <style>{`.input { display:block; height:44px; width:100%; border-radius:8px; border:1px solid rgb(var(--border-strong)); background:rgb(var(--bg-elevated)); padding:0 12px; font-size:16px; color:rgb(var(--fg)); outline:none; transition:border-color 150ms ease, box-shadow 150ms ease; }
.input:focus { border-color:rgb(var(--ring)); box-shadow:0 0 0 3px rgb(var(--ring) / 0.30); }`}</style>
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
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      {label ? <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span> : null}
      {children}
      {hint && !error ? <span className="mt-1 block text-xs text-fg-subtle">{hint}</span> : null}
      {error ? (
        <span className="mt-1 block text-xs text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Register farmer'}
    </button>
  );
}
