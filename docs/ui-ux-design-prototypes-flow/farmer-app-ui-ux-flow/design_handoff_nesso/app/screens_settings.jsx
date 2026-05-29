/* ============================================================
   Nesso · Mobile B1 — Settings hub, Language, Theme, Sync, Notifications, About
   Exports → window: SettingsScreen, LanguageScreen, ThemeScreen,
   SyncHealthScreen, NotificationsScreen, AboutScreen, MSwitch, ListRow
   ============================================================ */
const { useState: useS1 } = React;

function MSwitch({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} style={{ width: 48, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 3, background: on ? 'var(--primary)' : 'var(--border-strong)', transition: 'background .2s', flexShrink: 0 }}>
      <span style={{ display: 'block', width: 22, height: 22, borderRadius: '50%', background: '#fff', transform: on ? 'translateX(20px)' : 'translateX(0)', transition: 'transform .2s cubic-bezier(0.32,0.72,0,1)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

function ListRow({ icon, color = 'var(--primary)', label, value, onClick, right, last, danger }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '14px 16px', background: 'none', border: 'none', borderBottom: last ? 'none' : '1px solid var(--border)', cursor: onClick ? 'pointer' : 'default', textAlign: 'left' }}>
      {icon && <span style={{ width: 36, height: 36, borderRadius: 10, background: danger ? 'var(--danger-bg)' : `color-mix(in oklab, ${color} 14%, var(--bg-elevated))`, display: 'grid', placeItems: 'center', color: danger ? 'var(--danger)' : color, flexShrink: 0 }}><Icon name={icon} size={18} stroke={2} /></span>}
      <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: danger ? 'var(--danger)' : 'var(--fg)' }}>{label}</span>
      {value && <span style={{ fontSize: 14, color: 'var(--fg-muted)' }}>{value}</span>}
      {right !== undefined ? right : (onClick && <Icon name="chevR" size={18} color="var(--fg-subtle)" />)}
    </button>
  );
}

function Group({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {title && <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-subtle)', textTransform: 'uppercase', padding: '0 4px 8px' }}>{title}</div>}
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function SettingsScreen({ onBack, onNav, onToast, onLogout }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Profile & settings" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-elevated)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 16, marginBottom: 18 }}>
          <Avatar name="Ravi Teja" size={56} />
          <div style={{ flex: 1 }}>
            <div className="display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)' }}>Ravi Teja</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>+91 ••••• 4821</div>
            <div style={{ marginTop: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--secondary-d)', background: 'var(--secondary-bg)', padding: '2px 9px', borderRadius: 999 }}>Field Officer</span></div>
          </div>
          <Icon name="edit" size={19} color="var(--fg-subtle)" />
        </div>

        <Group title="Account">
          <ListRow icon="users" label="Associations" value="Belur FPO" onClick={() => onToast('Opening associations', 'sync')} />
          <ListRow icon="map" color="var(--secondary-d)" label="My cluster" value="Hassan" onClick={() => onToast('Hassan cluster', 'sync')} last />
        </Group>
        <Group title="App">
          <ListRow icon="phone" color="#0E7490" label="Language" value="English" onClick={() => onNav('language')} />
          <ListRow icon="sun" color="#B6850A" label="Theme & display" onClick={() => onNav('theme')} />
          <ListRow icon="bell" color="var(--primary)" label="Notifications" onClick={() => onNav('notifications')} />
          <ListRow icon="sync" color="var(--secondary-d)" label="Sync health" value="2 queued" onClick={() => onNav('sync')} />
          <ListRow icon="map" color="#0E7490" label="Offline maps" value="1 region" onClick={() => onToast('Offline maps', 'sync')} last />
        </Group>
        <Group title="Support">
          <ListRow icon="alert" color="var(--secondary-d)" label="Help & docs" onClick={() => onToast('Opening help', 'sync')} />
          <ListRow icon="shield" color="var(--primary)" label="About Nesso" value="v1.0" onClick={() => onNav('about')} last />
        </Group>
        <Group>
          <ListRow icon="logout" label="Log out" danger onClick={() => onLogout && onLogout()} last />
        </Group>
      </div>
    </div>
  );
}

const LANGS = [
  ['English', 'English'], ['हिन्दी', 'Hindi'], ['ಕನ್ನಡ', 'Kannada'], ['বাংলা', 'Bengali'],
  ['తెలుగు', 'Telugu'], ['தமிழ்', 'Tamil'], ['മലയാളം', 'Malayalam'], ['मराठी', 'Marathi'],
  ['ଓଡ଼ିଆ', 'Odia'], ['ગુજરાતી', 'Gujarati'], ['Türkçe', 'Turkish'], ['Tiếng Việt', 'Vietnamese'],
];
function LanguageScreen({ onBack, onToast }) {
  const [sel, setSel] = useS1('English');
  const [q, setQ] = useS1('');
  const list = LANGS.filter(l => l[1].toLowerCase().includes(q.toLowerCase()) || l[0].toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Language" sub="Choose your display language" onBack={onBack} />
      <div style={{ padding: '14px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 46, padding: '0 14px', borderRadius: 13, background: 'var(--bg-elevated)', border: '1.5px solid var(--border)' }}>
          <Icon name="search" size={18} color="var(--fg-subtle)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search languages" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--fg)', fontFamily: 'Inter' }} />
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {list.map(([native, en]) => {
            const on = sel === en;
            return (
              <button key={en} onClick={() => { setSel(en); onToast(`Language set to ${en}`, 'success'); }} style={{ textAlign: 'left', padding: '14px 15px', borderRadius: 15, cursor: 'pointer', background: 'var(--bg-elevated)', position: 'relative',
                border: on ? '2px solid var(--primary)' : '1.5px solid var(--border)' }}>
                <div className="display" style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg)' }}>{native}</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>{en}</div>
                {on && <span style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Icon name="check" size={13} color="var(--on-primary)" stroke={3} /></span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ThemeScreen({ onBack, theme, setTheme }) {
  const [rm, setRm] = useS1(false);
  const [lt, setLt] = useS1(false);
  const [hc, setHc] = useS1(false);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Theme & display" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px 24px' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-subtle)', textTransform: 'uppercase', padding: '0 4px 10px' }}>Appearance</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
          {[['light', 'Light'], ['dark', 'Dark'], ['system', 'System']].map(([k, lbl]) => {
            const on = (k === 'system' ? false : theme === k);
            const prev = k === 'dark' ? '#0A1410' : k === 'light' ? '#FAFDFA' : 'linear-gradient(105deg, #FAFDFA 50%, #0A1410 50%)';
            return (
              <button key={k} onClick={() => k !== 'system' && setTheme(k)} style={{ cursor: 'pointer', border: on ? '2px solid var(--primary)' : '1.5px solid var(--border)', borderRadius: 16, padding: 10, background: 'var(--bg-elevated)' }}>
                <div style={{ height: 64, borderRadius: 10, background: prev, border: '1px solid var(--border)', marginBottom: 9, display: 'grid', placeItems: 'center' }}>
                  <span style={{ width: 26, height: 8, borderRadius: 4, background: 'var(--primary)' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: on ? 'var(--primary)' : 'var(--fg)', textAlign: 'center' }}>{lbl}</div>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-subtle)', textTransform: 'uppercase', padding: '0 4px 8px' }}>Accessibility</div>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <ListRow icon="activity" label="Reduce motion" right={<MSwitch on={rm} onChange={setRm} />} />
          <ListRow icon="phone" color="#0E7490" label="Larger text" right={<MSwitch on={lt} onChange={setLt} />} />
          <ListRow icon="sun" color="#B6850A" label="High contrast" right={<MSwitch on={hc} onChange={setHc} />} last />
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--fg-subtle)', marginTop: 14, padding: '0 4px', lineHeight: 1.5 }}>Reduce motion collapses animations to fades. Larger text scales body copy up to 1.4× for sunlight readability.</p>
      </div>
    </div>
  );
}

function SyncHealthScreen({ onBack, onToast }) {
  const [items, setItems] = useS1([
    { t: 'Register farmer — Suresh Kumar', s: 'queued · waiting for network', k: 'pending' },
    { t: 'Add activity — Spraying', s: 'queued · 1 photo', k: 'pending' },
    { t: 'Map farm — Belur Estate', s: 'failed · retry', k: 'rejected' },
  ]);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Sync health" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))', color: '#fff', borderRadius: 20, padding: 20, marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: 13, opacity: 0.9 }}>Outbox</div><div className="display" style={{ fontSize: 38, fontWeight: 700 }}>{items.length}</div><div style={{ fontSize: 13, opacity: 0.9 }}>changes waiting to sync</div></div>
            <Icon name="sync" size={38} color="#fff" stroke={1.8} />
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 10 }}>Last synced 2 min ago · online</div>
        </div>
        <Btn kind="primary" size="lg" full icon="sync" onClick={() => { setItems(i => i.filter(x => x.k !== 'pending')); onToast('Syncing… 2 of 3 done', 'sync'); }}>Sync now</Btn>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-subtle)', textTransform: 'uppercase', padding: '22px 4px 8px' }}>Queue</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-elevated)', borderRadius: 14, border: '1px solid var(--border)', padding: 13, boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: it.k === 'rejected' ? 'var(--danger-bg)' : 'var(--warning-bg)', color: it.k === 'rejected' ? 'var(--danger)' : 'var(--warning)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={it.k === 'rejected' ? 'alert' : 'clock'} size={18} /></span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{it.t}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{it.s}</div></div>
              {it.k === 'rejected' && <button onClick={() => onToast('Retrying…', 'sync')} style={{ border: 'none', background: 'var(--primary-50)', color: 'var(--primary)', fontWeight: 600, fontSize: 12.5, fontFamily: 'Inter', padding: '6px 12px', borderRadius: 999, cursor: 'pointer' }}>Retry</button>}
            </div>
          ))}
          {!items.length && <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--fg-muted)', fontSize: 14 }}>All caught up — nothing to sync. ✓</div>}
        </div>
      </div>
    </div>
  );
}

const NOTIFS = [
  { grp: 'Today', items: [
    { ic: 'checkc', c: 'var(--primary)', t: 'KYC approved', s: 'Anjali Hegde is now verified', time: '12m', unread: true },
    { ic: 'cloud', c: '#0E7490', t: 'Weather alert', s: 'Light rain expected tomorrow — plan spraying today', time: '1h', unread: true },
    { ic: 'wheat', c: '#B6850A', t: 'Harvest due', s: 'Tuberose · North Plot · ~320 kg', time: '3h' },
  ]},
  { grp: 'Earlier', items: [
    { ic: 'sync', c: 'var(--secondary-d)', t: 'Synced 12 items', s: 'Back online after offline session', time: 'Yesterday' },
    { ic: 'alert', c: 'var(--danger)', t: 'Approval rejected', s: 'Vijay Shetty — Aadhaar mismatch', time: '2d' },
  ]},
];
function NotificationsScreen({ onBack }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Notifications" onBack={onBack} right={<button style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 600, fontSize: 13, fontFamily: 'Inter', cursor: 'pointer', paddingRight: 6 }}>Mark all read</button>} />
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 24px' }}>
        {NOTIFS.map(g => (
          <div key={g.grp} style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-subtle)', textTransform: 'uppercase', padding: '0 4px 8px' }}>{g.grp}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {g.items.map((n, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'var(--bg-elevated)', borderRadius: 14, border: '1px solid var(--border)', padding: 14, boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 11, background: `color-mix(in oklab, ${n.c} 14%, var(--bg-elevated))`, color: n.c, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={n.ic} size={19} stroke={2} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>{n.t}</div><div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 1 }}>{n.s}</div></div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}><span className="mono" style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{n.time}</span>{n.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutScreen({ onBack }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="About" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: '30px 16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 84, height: 84, borderRadius: 24, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-md)' }}><img src="assets/nesso-logo.jpeg" alt="Nesso" style={{ width: 60, height: 60 }} /></div>
        <h2 className="display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--fg)', marginTop: 18, letterSpacing: '0.04em' }}>NESSO</h2>
        <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>Farm to fork, verified</p>
        <div className="mono" style={{ fontSize: 12.5, color: 'var(--fg-subtle)', marginTop: 12 }}>v1.0.0 · build 2026.05.29 · NR Group</div>
        <div style={{ width: '100%', marginTop: 28, background: 'var(--bg-elevated)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <ListRow icon="shield" label="Privacy policy" onClick={() => {}} />
          <ListRow icon="file" color="#0E7490" label="Terms of service" onClick={() => {}} />
          <ListRow icon="phone" color="var(--secondary-d)" label="Contact support" value="help@nesso.in" onClick={() => {}} />
          <ListRow icon="activity" color="#B6850A" label="Open-source licenses" onClick={() => {}} last />
        </div>
        <p style={{ fontSize: 12, color: 'var(--fg-subtle)', marginTop: 24, textAlign: 'center' }}>© 2026 NR Group · Made for Indian horticulture</p>
      </div>
    </div>
  );
}

Object.assign(window, { MSwitch, ListRow, Group, SettingsScreen, LanguageScreen, ThemeScreen, SyncHealthScreen, NotificationsScreen, AboutScreen });
