'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createFarmerAction, type CreateFarmerState } from './actions';

const initial: CreateFarmerState = { error: null };

const INPUT =
  'block h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-[15px] text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30';

const MOBILE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;

export function FarmerForm() {
  const [state, formAction] = useActionState(createFarmerAction, initial);

  // Controlled values for required/format validation.
  const [firstName, setFirstName] = useState('');
  const [mobile, setMobile] = useState('');
  const [pincode, setPincode] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required.';
    if (!mobile.trim()) e.mobileNumber = 'Mobile number is required.';
    else if (!MOBILE_RE.test(mobile.trim())) e.mobileNumber = 'Enter a valid 10-digit number (starts 6–9).';
    if (pincode.trim() && !PIN_RE.test(pincode.trim())) e.pincode = 'Pincode must be 6 digits.';
    return e;
  }, [firstName, mobile, pincode]);

  const valid = Object.keys(errors).length === 0;
  const show = (k: string) => (touched[k] ? errors[k] : undefined) ?? state.fieldErrors?.[k];
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  return (
    <form action={formAction} className="space-y-5">
      <Section title="Personal" description="Required identification fields">
        <Grid>
          <Field label="First name" required htmlFor="firstName" error={show('firstName')}>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={blur('firstName')}
              className={INPUT}
            />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              className={INPUT}
            />
          </Field>
          <Field label="Gender" htmlFor="gender">
            <select id="gender" name="gender" defaultValue="" className={INPUT}>
              <option value="">—</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field
            label="Mobile number"
            required
            htmlFor="mobileNumber"
            hint="10 digits, starts 6–9"
            error={show('mobileNumber')}
          >
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              required
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              onBlur={blur('mobileNumber')}
              className={INPUT}
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Address">
        <Grid>
          <Field label="State" htmlFor="state">
            <input id="state" name="state" type="text" defaultValue="Karnataka" className={INPUT} />
          </Field>
          <Field label="District" htmlFor="district">
            <input id="district" name="district" type="text" className={INPUT} />
          </Field>
          <Field label="Village" htmlFor="village">
            <input id="village" name="village" type="text" className={INPUT} />
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
        </Grid>
      </Section>

      <Section title="Group" description="How the farmer is organized and what they grow">
        <Grid>
          <Field label="Association" htmlFor="groupAssociation">
            <select
              id="groupAssociation"
              name="groupAssociation"
              defaultValue="INDEPENDENT"
              className={INPUT}
            >
              <option value="INDEPENDENT">Independent</option>
              <option value="FLOWER_AGENT">Flower agent</option>
              <option value="FPO">FPO</option>
            </select>
          </Field>
          <Field label="Production practice" htmlFor="productionPractice">
            <select
              id="productionPractice"
              name="productionPractice"
              defaultValue="Conventional"
              className={INPUT}
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
              className={INPUT}
            />
          </Field>
          <Field label="" htmlFor="isFlowerAgent">
            <label className="flex h-11 items-center gap-2 text-sm text-fg">
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
          href="/farmers"
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
      {pending ? 'Saving…' : 'Register farmer'}
    </button>
  );
}
