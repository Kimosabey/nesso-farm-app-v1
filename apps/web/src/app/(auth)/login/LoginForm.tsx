'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from './actions';

const initial: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-fg">Phone or email</span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          inputMode="tel"
          className="h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          placeholder="9066666481"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-fg">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </label>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="pt-2 text-xs text-fg-subtle">
        Try the seeded admin: <code className="font-mono">9066666481</code> /{' '}
        <code className="font-mono">Nesso!Admin!2026</code>
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-md bg-primary text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60"
      aria-busy={pending}
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}
