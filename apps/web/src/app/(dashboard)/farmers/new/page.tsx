import Link from 'next/link';
import { FarmerForm } from './FarmerForm';

export default function NewFarmerPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-2 text-sm text-fg-muted">
        <Link href="/farmers" className="hover:text-primary">
          ← Farmers
        </Link>
      </div>
      <h1 className="font-display text-3xl tracking-tight text-fg">Register a farmer</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Phase 2 v0 — KYC photos &amp; bank details come next iteration. The record will be created
        as <span className="font-medium text-fg">pending</span> and appear in Approvals.
      </p>

      <div className="mt-8">
        <FarmerForm />
      </div>
    </section>
  );
}
