/* ============================================================
   Nesso · Web — public marketing Landing page (pre-auth)
   Exports → window: LandingPage
   ============================================================ */
function LandingPage({ theme, onToggleTheme, onSignIn }) {
  const feats = [
    ['pin', 'Map every farm', 'GPS-mapped boundaries and farmer KYC, captured on the ground — offline-first.'],
    ['activity', 'Log every activity', 'Spraying, irrigation, harvest — timestamped, geotagged, photo-backed.'],
    ['shield', 'Prove every claim', 'Tamper-evident batch QRs open a public farm-to-fork trace for buyers.'],
  ];
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="aurora-bg" aria-hidden="true"><i></i></div>
      {/* top bar */}
      <header style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 12, padding: '18px clamp(16px,5vw,56px)' }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-sm)' }}><img src="assets/nesso-logo.jpeg" alt="Nesso" style={{ width: 26, height: 26 }} /></span>
        <span className="display" style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.04em' }}>NESSO</span>
        <nav className="hide-sm" style={{ marginLeft: 24, display: 'flex', gap: 6 }}>
          {['Platform', 'Traceability', 'Pricing', 'About'].map(n => <a key={n} href="#" onClick={e => e.preventDefault()} style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-muted)', padding: '8px 12px', borderRadius: 9, textDecoration: 'none' }}>{n}</a>)}
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onToggleTheme} aria-label="Theme" style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--fg)', display: 'grid', placeItems: 'center' }}><WIcon name={theme === 'dark' ? 'sun' : 'moon'} size={18} /></button>
          <WBtn kind="primary" onClick={onSignIn}>Sign in</WBtn>
        </div>
      </header>

      {/* hero */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 1000, margin: '0 auto', padding: 'clamp(36px,7vw,86px) clamp(16px,5vw,32px) clamp(24px,4vw,48px)', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'JetBrains Mono', fontSize: 12.5, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--primary)' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }}></span>Farm-to-fork traceability</span>
        <h1 className="display" style={{ fontSize: 'clamp(36px,6.5vw,68px)', fontWeight: 700, margin: '18px auto 0', maxWidth: '15ch', letterSpacing: '-0.025em', lineHeight: 1.05 }}>The operating system for <span style={{ background: 'linear-gradient(100deg,var(--primary),var(--secondary) 55%,var(--primary-2))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>verified farming</span>.</h1>
        <p style={{ fontSize: 'clamp(16px,2vw,19px)', color: 'var(--fg-muted)', maxWidth: '56ch', margin: '20px auto 0' }}>Nesso digitises the whole horticulture chain — register farmers, map farms, log every field activity, and prove provenance with a public QR trace. Built for FPOs, agribusinesses and their field teams.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 30, flexWrap: 'wrap' }}>
          <WBtn kind="primary" size="lg" iconR="arrowUR" onClick={onSignIn}>Sign in to dashboard</WBtn>
          <WBtn kind="outline" size="lg" icon="qr" onClick={onSignIn}>Book a demo</WBtn>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 30 }}>
          {[['12,480', 'Farmers'], ['942', 'Farms mapped'], ['100%', 'Cold-chain tracked'], ['12', 'Languages']].map(([v, l]) => (
            <div key={l} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 20px', boxShadow: 'var(--shadow-sm)' }}><div className="display" style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>{v}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{l}</div></div>
          ))}
        </div>
      </section>

      {/* product preview window */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 980, margin: '0 auto', padding: '0 clamp(16px,5vw,32px)' }}>
        <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', background: 'var(--bg-elevated)' }}>
          <div style={{ height: 38, background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px' }}>
            {['#FF6058', '#FFBD2E', '#28CA42'].map(c => <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.85 }}></span>)}
            <span className="mono" style={{ marginLeft: 12, fontSize: 11.5, color: 'var(--fg-subtle)' }}>app.nesso.in/dashboard</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: 18 }}>
            {[['Farmers', '1,284', 'var(--primary)'], ['Farms', '942', 'var(--secondary-d)'], ['Active crops', '376', '#0E7490'], ['Pending', '23', 'var(--warning)']].map(([l, v, c]) => (
              <div key={l} style={{ background: 'var(--bg-muted)', borderRadius: 12, padding: 14 }}><span style={{ width: 30, height: 30, borderRadius: 9, background: `color-mix(in oklab, ${c} 16%, var(--bg-elevated))`, color: c, display: 'grid', placeItems: 'center' }}><WIcon name="grid" size={16} /></span><div className="display" style={{ fontSize: 24, fontWeight: 700, marginTop: 10, letterSpacing: '-0.02em' }}>{v}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* features */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 1000, margin: '0 auto', padding: 'clamp(40px,6vw,72px) clamp(16px,5vw,32px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
          {feats.map(([ic, t, d]) => (
            <div key={t} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 18, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center', marginBottom: 16 }}><WIcon name={ic} size={24} /></span>
              <h3 className="display" style={{ fontSize: 18, fontWeight: 700 }}>{t}</h3>
              <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 7 }}>{d}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <h2 className="display" style={{ fontSize: 'clamp(22px,3.4vw,30px)', fontWeight: 700 }}>Ready to trace your harvest?</h2>
          <p style={{ fontSize: 15, color: 'var(--fg-muted)', marginTop: 8 }}>Field officers use the mobile app with OTP. Staff &amp; admins sign in here.</p>
          <div style={{ marginTop: 20 }}><WBtn kind="primary" size="lg" iconR="arrowUR" onClick={onSignIn}>Sign in to dashboard</WBtn></div>
        </div>
      </section>

      <footer style={{ position: 'relative', zIndex: 2, borderTop: '1px solid var(--border)', padding: '28px', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 12.5 }}>Nesso · NR Group — farm-to-fork traceability · © 2026</footer>
    </div>
  );
}
Object.assign(window, { LandingPage });
