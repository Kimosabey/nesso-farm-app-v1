import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { PortalHeader, PortalFooter } from '@/components/PortalChrome';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How Nesso handles personal and farm data — DPDP-aligned privacy policy.',
};

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <PortalHeader locale={locale} />

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-fg-muted transition hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to home
        </Link>

        <span className="mt-6 inline-flex items-center rounded-full bg-secondary-50 px-3 py-1 text-[12.5px] font-semibold text-secondary-700">
          Privacy
        </span>
        <h1 className="mt-4 font-display text-[clamp(28px,5vw,42px)] font-bold leading-[1.12] tracking-[-0.02em]">
          Privacy &amp; data
        </h1>
        <p className="mt-3 font-mono text-[12.5px] text-fg-subtle">Last updated 29 May 2026</p>

        <section className="mt-8 space-y-2">
          <h2 className="font-display text-[18px] font-semibold text-fg">What this page shows</h2>
          <p className="leading-relaxed text-fg-muted">
            A public trace shows the crop, grade, farm location, growing practices, and the
            farmer&apos;s display name &amp; association — only with the farmer&apos;s consent.
            Personal identifiers (full phone, Aadhaar, bank details) are never shown publicly.
          </p>
        </section>

        <section className="mt-7 space-y-2">
          <h2 className="font-display text-[18px] font-semibold text-fg">Farmer consent</h2>
          <p className="leading-relaxed text-fg-muted">
            Farmers opt in during registration and can withdraw consent at any time, which removes
            their name and profile from public traces while preserving the verification record for
            buyers.
          </p>
        </section>

        <section className="mt-7 space-y-2">
          <h2 className="font-display text-[18px] font-semibold text-fg">What we collect</h2>
          <ul className="ml-5 list-disc space-y-1.5 leading-relaxed text-fg-muted">
            <li>Farm boundaries and crop records (operational)</li>
            <li>Activity logs with geotags and photos (verification)</li>
            <li>Quality and procurement records (commercial)</li>
          </ul>
        </section>

        <section className="mt-7 space-y-2">
          <h2 className="font-display text-[18px] font-semibold text-fg">How we use it</h2>
          <p className="leading-relaxed text-fg-muted">
            Data is used to operate the traceability platform, prove provenance to buyers, and give
            FPOs a view of their cluster. We do not sell personal data or use it for advertising.
          </p>
        </section>

        <section className="mt-7 space-y-2">
          <h2 className="font-display text-[18px] font-semibold text-fg">Your rights</h2>
          <p className="leading-relaxed text-fg-muted">
            Under India&apos;s DPDP Act you may request access, correction, or erasure of your data.
            Contact{' '}
            <a
              href="mailto:privacy@nesso.in"
              className="font-semibold text-primary transition hover:underline"
            >
              privacy@nesso.in
            </a>
            .
          </p>
        </section>

        <section className="mt-7 space-y-2">
          <h2 className="font-display text-[18px] font-semibold text-fg">Cookies</h2>
          <p className="leading-relaxed text-fg-muted">
            This portal stores only your theme preference locally. No tracking or advertising
            cookies are used.
          </p>
        </section>

        <section className="mt-7 space-y-2">
          <h2 className="font-display text-[18px] font-semibold text-fg">Contact</h2>
          <p className="leading-relaxed text-fg-muted">
            Questions about this policy or your data? Reach the Nesso data team at{' '}
            <a
              href="mailto:privacy@nesso.in"
              className="font-semibold text-primary transition hover:underline"
            >
              privacy@nesso.in
            </a>
            . Nesso is operated by NR Group.
          </p>
        </section>
      </main>

      <PortalFooter locale={locale} />
    </div>
  );
}
