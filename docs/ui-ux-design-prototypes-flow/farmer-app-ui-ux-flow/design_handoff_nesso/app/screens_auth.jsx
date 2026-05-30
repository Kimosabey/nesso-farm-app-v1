/* ============================================================
   Nesso · Auth screens — Splash, Login, OTP
   Exports → window: SplashScreen, LoginScreen, OtpScreen
   ============================================================ */
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

/* logo coin that paints in (petals stagger + drop swell) */
function LogoBloom({ size = 116, play = true }) {
  return (
    <div className={play ? 'bloom' : ''} style={{ width: size, height: size, borderRadius: '50%', background: '#fff',
      display: 'grid', placeItems: 'center', boxShadow: '0 18px 50px -10px rgba(0,0,0,0.4)', position: 'relative' }}>
      <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 100 100" fill="none">
        <g>
          <circle className="petal p1" cx="50" cy="26" r="15" fill="#0D783C"/>
          <circle className="petal p2" cx="28" cy="46" r="15" fill="#0D783C"/>
          <circle className="petal p3" cx="72" cy="46" r="15" fill="#207647"/>
          <circle className="petal p4" cx="40" cy="58" r="14" fill="#207647"/>
          <circle className="petal p5" cx="60" cy="58" r="14" fill="#0D783C"/>
        </g>
        <path className="drop" d="M50 48 C59 60 59 74 50 82 C41 74 41 60 50 48 Z" fill="#F1D412"/>
      </svg>
    </div>
  );
}

function SplashScreen({ onDone }) {
  const [play, setPlay] = useStateA(false);
  useEffectA(() => {
    setPlay(true);
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div onClick={onDone} style={{ position: 'absolute', inset: 0, cursor: 'pointer',
      background: 'radial-gradient(130% 100% at 50% 18%, var(--primary-2) 0%, var(--primary) 55%, #06401f 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* soft aurora */}
      <div style={{ position: 'absolute', width: 360, height: 360, top: '8%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(241,212,18,0.22), transparent 65%)', filter: 'blur(30px)' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LogoBloom play={play} />
        <div className="splash-word" style={{ marginTop: 30, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 38,
          letterSpacing: '0.16em', color: '#fff' }}>NESSO</div>
        <div className="splash-word2" style={{ marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.78)', fontWeight: 500, letterSpacing: '0.02em' }}>Farm to fork, verified</div>
      </div>
      <div className="splash-word2" style={{ position: 'absolute', bottom: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.25)', borderTopColor: '#F1D412', animation: 'spin 0.9s linear infinite' }} />
        <span className="mono" style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em' }}>v1.0 · Nesso</span>
      </div>
    </div>
  );
}

function LangChip({ onToggle }) {
  return (
    <button onClick={onToggle} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 13px',
      borderRadius: 999, background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', cursor: 'pointer',
      color: 'var(--fg)', fontSize: 13, fontWeight: 600, fontFamily: 'Inter' }}>
      <span style={{ fontSize: 15 }}>🌐</span> EN <Icon name="chevR" size={14} color="var(--fg-subtle)" style={{ transform: 'rotate(90deg)' }} />
    </button>
  );
}

function ThemeToggle({ theme, onToggle, floating }) {
  return (
    <button onClick={onToggle} aria-label="Toggle theme" style={{ width: 40, height: 40, borderRadius: '50%',
      background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', cursor: 'pointer', color: 'var(--fg)',
      display: 'grid', placeItems: 'center', ...(floating || {}) }}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
    </button>
  );
}

function LoginScreen({ onNext, theme, onToggleTheme }) {
  const [phone, setPhone] = useStateA('');
  const valid = /^[6-9]\d{9}$/.test(phone);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 58, paddingLeft: 26, paddingRight: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <LangChip onToggle={() => {}} />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      {/* hero */}
      <div style={{ padding: '26px 26px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-md)', marginBottom: 26 }}>
          <img src="assets/nesso-logo.jpeg" alt="Nesso" style={{ width: 42, height: 42 }} />
        </div>
        <h1 className="display" style={{ fontSize: 34, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Welcome to<br/>Nesso</h1>
        <p style={{ fontSize: 16, color: 'var(--fg-muted)', marginTop: 14, lineHeight: 1.5, maxWidth: '30ch' }}>Log in with your mobile number. We'll send a one-time code to verify it's you.</p>

        <div style={{ marginTop: 36 }}>
          <Field label="Mobile number" prefix="+91" value={phone}
            onChange={v => setPhone(v.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210" mono hint="Standard SMS rates may apply." required />
        </div>
      </div>

      {/* sticky bottom CTA (thumb zone) */}
      <div style={{ padding: '16px 26px 40px', background: 'linear-gradient(0deg, var(--bg) 70%, transparent)' }}>
        <Btn kind="primary" size="lg" full disabled={!valid} icon="arrowR" onClick={() => onNext(phone)}>
          Send OTP
        </Btn>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg-subtle)', marginTop: 16, lineHeight: 1.5 }}>
          By continuing you agree to Nesso's <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms</span> & <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

function OtpScreen({ phone, onBack, onVerify, theme }) {
  const [code, setCode] = useStateA(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useStateA(30);
  const refs = useRefA([]);
  useEffectA(() => { const t = setInterval(() => setCooldown(c => c > 0 ? c - 1 : 0), 1000); return () => clearInterval(t); }, []);
  const set = (i, v) => {
    v = v.replace(/\D/g, '').slice(-1);
    const nx = [...code]; nx[i] = v; setCode(nx);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const onKey = (i, e) => { if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus(); };
  const full = code.every(c => c !== '');
  const masked = phone ? '+91 ••••• ' + phone.slice(-3) : '+91 ••••• •••';
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 58, paddingLeft: 18, paddingRight: 26 }}>
        <button onClick={onBack} style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--fg)' }}><Icon name="arrowL" size={20} /></button>
      </div>
      <div style={{ padding: '24px 26px 0', flex: 1 }}>
        <h1 className="display" style={{ fontSize: 30, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>Verify your number</h1>
        <p style={{ fontSize: 15.5, color: 'var(--fg-muted)', marginTop: 12, lineHeight: 1.5 }}>Enter the 6-digit code sent to<br/><b className="mono" style={{ color: 'var(--fg)', fontWeight: 600 }}>{masked}</b></p>

        <div style={{ display: 'flex', gap: 9, marginTop: 34 }}>
          {code.map((c, i) => (
            <input key={i} ref={el => refs.current[i] = el} value={c} inputMode="numeric"
              onChange={e => set(i, e.target.value)} onKeyDown={e => onKey(i, e)}
              className="mono"
              style={{ width: '100%', aspectRatio: '1', textAlign: 'center', fontSize: 24, fontWeight: 600,
                borderRadius: 14, border: 'none', outline: 'none', color: 'var(--fg)', background: 'var(--bg-elevated)',
                boxShadow: c ? '0 0 0 2px var(--ring)' : 'inset 0 0 0 1.5px var(--border-strong)', transition: 'box-shadow .15s' }} />
          ))}
        </div>

        <div style={{ marginTop: 24, fontSize: 14, color: 'var(--fg-muted)' }}>
          {cooldown > 0
            ? <span>Resend code in <b className="mono" style={{ color: 'var(--fg)' }}>0:{String(cooldown).padStart(2, '0')}</b></span>
            : <button onClick={() => setCooldown(30)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter' }}>Resend code</button>}
        </div>
      </div>
      <div style={{ padding: '16px 26px 40px' }}>
        <Btn kind="primary" size="lg" full disabled={!full} icon="checkc" onClick={onVerify}>Verify &amp; continue</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { SplashScreen, LoginScreen, OtpScreen, ThemeToggle, LangChip });
