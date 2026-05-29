import Link from 'next/link';

export default function PortalHomePage() {
  return (
    <main className="brand-aurora flex min-h-dvh items-center justify-center px-6 py-24">
      <div className="glass w-full max-w-xl rounded-3xl p-10 text-center shadow-lg">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border-strong/40 bg-bg-elevated/60 px-3 py-1 text-xs font-medium text-fg-muted backdrop-blur">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          Verified by Nesso
        </div>
        <h1 className="font-display text-4xl tracking-tight text-fg md:text-5xl">
          Scan a Nesso QR
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-fg-muted">
          Open the camera on your phone and scan any Nesso batch QR. You'll see the farmer, the
          farm, the crop, and every stage of the journey.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/en/t/SAMPLE12"
            className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
          >
            See a sample trace
          </Link>
        </div>
      </div>
    </main>
  );
}
