import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <main className="brand-aurora flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="glass w-full max-w-md rounded-3xl p-8 shadow-lg md:p-10">
        <h1 className="font-display text-3xl tracking-tight text-fg">Welcome back</h1>
        <p className="mt-2 text-sm text-fg-muted">Sign in to continue to Nesso</p>
        <LoginForm />
      </div>
    </main>
  );
}
