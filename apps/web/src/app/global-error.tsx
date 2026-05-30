'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'system-ui, sans-serif',
          background: '#0a1410',
          color: '#e6f0ea',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
        <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
          Our team has been notified. Please try again.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.6rem 1.2rem',
            background: '#0D783C',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
