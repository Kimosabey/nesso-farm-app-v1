'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function SentryDebugPage() {
  const [last, setLast] = useState<string | null>(null);

  function throwClient() {
    throw new Error(`Sentry portal client throw — ${new Date().toISOString()}`);
  }

  function captureMessage() {
    const id = Sentry.captureMessage(`Sentry portal message — ${new Date().toISOString()}`, 'info');
    setLast(`captureMessage → eventId ${id ?? '(no DSN?)'}`);
  }

  async function throwServer() {
    const res = await fetch('/debug/sentry/server-error');
    setLast(`server route returned ${res.status}`);
  }

  return (
    <main style={{ padding: '2rem', maxWidth: 640, margin: '0 auto', color: '#e6f0ea' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sentry debug · portal</h1>
      <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
        Each button fires one event. Check the <code>nesso-portal</code> project in Sentry.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={captureMessage} style={btn('#0D783C')}>
          captureMessage (info)
        </button>
        <button onClick={throwClient} style={btn('#a14e1e')}>
          throw on client
        </button>
        <button onClick={throwServer} style={btn('#a11e1e')}>
          throw on server
        </button>
      </div>
      {last ? <pre style={{ marginTop: '1.5rem', opacity: 0.8 }}>{last}</pre> : null}
    </main>
  );
}

function btn(bg: string): React.CSSProperties {
  return {
    padding: '0.6rem 1rem',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  };
}
