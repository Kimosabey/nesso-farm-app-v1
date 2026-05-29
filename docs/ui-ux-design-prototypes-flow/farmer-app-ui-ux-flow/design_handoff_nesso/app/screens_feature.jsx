/* ============================================================
   Nesso · Mobile B2 — Weather, Harvest Board, Activities, Pre-harvest, Add Crop
   Exports → window: WeatherScreen, HarvestBoardScreen, ActivitiesListScreen,
   PreHarvestScreen, AddCropScreen, MTabs
   ============================================================ */
const { useState: useF1 } = React;

function MTabs({ items, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '0 16px', overflowX: 'auto' }}>
      {items.map(t => {
        const on = value === t;
        return <button key={t} onClick={() => onChange(t)} style={{ whiteSpace: 'nowrap', padding: '8px 15px', borderRadius: 999, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: 'Inter',
          border: on ? 'none' : '1.5px solid var(--border)', background: on ? 'var(--primary)' : 'var(--bg-elevated)', color: on ? 'var(--on-primary)' : 'var(--fg-muted)' }}>{t}</button>;
      })}
    </div>
  );
}

function WeatherScreen({ onBack }) {
  const hours = [['Now', 27, 'cloud'], ['1PM', 28, 'sun'], ['2PM', 29, 'sun'], ['3PM', 28, 'cloud'], ['4PM', 26, 'cloud'], ['5PM', 24, 'drop']];
  const days = [['Today', 'cloud', 29, 21], ['Thu', 'sun', 31, 22], ['Fri', 'cloud', 28, 20], ['Sat', 'drop', 25, 19], ['Sun', 'drop', 24, 19], ['Mon', 'sun', 30, 21], ['Tue', 'cloud', 28, 20]];
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Weather" sub="Hassan, Karnataka" onBack={onBack} right={<span className="mono" style={{ fontSize: 11, color: 'var(--fg-subtle)', paddingRight: 6 }}>5 min ago</span>} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))', color: '#fff', borderRadius: 22, padding: 22, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(241,212,18,0.25)', filter: 'blur(24px)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div><div className="display" style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>27°</div><div style={{ fontSize: 15, opacity: 0.92, marginTop: 6 }}>Partly cloudy · feels 29°</div></div>
            <Icon name="cloud" size={56} color="#fff" stroke={1.5} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, position: 'relative' }}>
            {hours.map(([h, t, ic]) => <div key={h} style={{ textAlign: 'center' }}><div style={{ fontSize: 11, opacity: 0.85 }}>{h}</div><Icon name={ic} size={20} color="#fff" stroke={1.8} style={{ margin: '6px auto' }} /><div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{t}°</div></div>)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, background: 'var(--primary-50)', borderRadius: 14, padding: 14, marginTop: 14 }}>
          <Icon name="check" size={18} color="var(--primary)" stroke={2.4} style={{ marginTop: 1 }} />
          <div><div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--primary)' }}>Good window for spraying till 4 PM</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>Low wind, no rain. Avoid after 5 PM — light showers likely.</div></div>
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-subtle)', textTransform: 'uppercase', padding: '20px 4px 10px' }}>7-day forecast</div>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          {days.map(([d, ic, hi, lo], i) => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderTop: i ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', width: 56 }}>{d}</span>
              <Icon name={ic} size={22} color={ic === 'drop' ? '#0E7490' : ic === 'sun' ? '#B6850A' : 'var(--fg-muted)'} />
              <div style={{ flex: 1 }} />
              <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{hi}°</span>
              <span className="mono" style={{ fontSize: 14, color: 'var(--fg-subtle)' }}>{lo}°</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HarvestBoardScreen({ onBack, onToast }) {
  const groups = [
    { g: 'Today', items: [{ n: 'North Plot', f: 'Lakshmi Gowda', c: 'Tuberose', kg: 320, dist: '2.4 km' }, { n: 'Rao Garden', f: 'Geetha Rao', c: 'Jasmine', kg: 180, dist: '5.1 km' }] },
    { g: 'Tomorrow', items: [{ n: 'Belur Estate', f: 'Anjali Hegde', c: 'Marigold', kg: 540, dist: '8.0 km' }] },
    { g: 'Planned', items: [{ n: 'East field', f: 'Prakash Naik', c: 'Marigold', kg: 420, dist: '3.7 km' }] },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Harvest board" sub="Plans grouped by date" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px 24px' }}>
        {groups.map(grp => (
          <div key={grp.g} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px 10px' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{grp.g}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-50)', padding: '1px 8px', borderRadius: 999 }}>{grp.items.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {grp.items.map((it, i) => (
                <div key={i} style={{ background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 15 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="wheat" size={22} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{it.n}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{it.f} · {it.c}</div></div>
                    <div style={{ textAlign: 'right' }}><div className="display mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)' }}>{it.kg}kg</div><div style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>expected</div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 13 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--fg-muted)', fontWeight: 500 }}><Icon name="pin" size={14} color="var(--secondary-d)" /> {it.dist} away</span>
                    <div style={{ flex: 1 }} />
                    <Btn kind="soft" size="sm" icon="map" onClick={() => onToast('Opening directions', 'sync')}>Navigate</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitiesListScreen({ onBack }) {
  const [tab, setTab] = useF1('Pending');
  const acts = [
    { type: 'Spraying', farm: 'North Plot', cost: 640, date: 'Today', st: 'pending' },
    { type: 'Irrigation', farm: 'Rao Garden', cost: 0, date: 'Today', st: 'pending' },
    { type: 'Fertilizer', farm: 'North Plot', cost: 240, date: 'Yesterday', st: 'approved' },
    { type: 'Weeding', farm: 'Belur Estate', cost: 360, date: '24 May', st: 'approved' },
  ];
  const list = acts.filter(a => tab === 'Pending' ? a.st === 'pending' : a.st === 'approved');
  const ic = { Spraying: 'drop', Irrigation: 'cloud', Fertilizer: 'wheat', Weeding: 'leaf' };
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Activities" onBack={onBack} right={<button style={{ border: 'none', background: 'transparent', color: 'var(--primary)', display: 'grid', placeItems: 'center', cursor: 'pointer', paddingRight: 6 }}><Icon name="cal" size={20} /></button>} />
      <div style={{ padding: '12px 0 12px' }}><MTabs items={['Pending', 'Approved']} value={tab} onChange={setTab} /></div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 14 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={ic[a.type]} size={20} /></span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{a.type}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{a.farm} · {a.date}{a.cost ? ` · ₹${a.cost}` : ''}</div></div>
            <StatusChip kind={a.st}>{a.st[0].toUpperCase() + a.st.slice(1)}</StatusChip>
          </div>
        ))}
        {!list.length && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fg-muted)', fontSize: 14 }}>No {tab.toLowerCase()} activities.</div>}
      </div>
    </div>
  );
}

function PreHarvestScreen({ onBack, onToast }) {
  const [tab, setTab] = useF1('Report');
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Pre-harvest" onBack={onBack} right={<button onClick={() => onToast('New pre-harvest record', 'sync')} style={{ border: 'none', background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 999, width: 34, height: 34, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon name="plus" size={18} stroke={2.4} /></button>} />
      <div style={{ padding: '12px 0 14px' }}><MTabs items={['Report', 'Activities', 'Crop history']} value={tab} onChange={setTab} /></div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px' }}>
        {tab === 'Report' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Crops tracked', '376'], ['Avg. days to harvest', '54'], ['Records this week', '28'], ['Forecast yield', '12.4 t']].map(([l, v]) => (
                <div key={l} style={{ background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 16 }}>
                  <div className="display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--fg)' }}>{v}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            {[['Tuberose · North Plot', 'Flowering · harvest in 8 days', 'pending'], ['Marigold · Belur Estate', 'Budding · harvest in 22 days', 'approved'], ['Jasmine · Rao Garden', 'Flowering · harvest in 5 days', 'pending']].map(([t, s, st], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 14 }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--secondary-bg)', color: 'var(--secondary-d)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="leaf" size={20} /></span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>{t}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{s}</div></div>
                <StatusChip kind={st}>{st === 'pending' ? 'Due soon' : 'On track'}</StatusChip>
              </div>
            ))}
          </div>
        )}
        {tab === 'Activities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['drop', 'Spraying · North Plot', 'Tuberose · ₹640'], ['cloud', 'Irrigation · Rao Garden', 'Jasmine · drip 2h'], ['wheat', 'Fertilizer · North Plot', 'Urea · ₹240']].map(([ic, t, m], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 13 }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Icon name={ic} size={19} /></span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{t}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{m}</div></div>
              </div>
            ))}
          </div>
        )}
        {tab === 'Crop history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Tuberose', '2025–26', '320 kg', 'Harvested'], ['Marigold', '2025', '480 kg', 'Harvested'], ['Jasmine', '2024–25', '210 kg', 'Harvested']].map(([c, s, y, st], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 14 }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--secondary-bg)', color: 'var(--secondary-d)', display: 'grid', placeItems: 'center' }}><Icon name="leaf" size={19} /></span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>{c}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{s} season</div></div>
                <div style={{ textAlign: 'right' }}><div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>{y}</div><div style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{st}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddCropScreen({ onBack, onToast }) {
  const [crop, setCrop] = useF1('Tuberose');
  const [type, setType] = useF1('Single');
  const [unit, setUnit] = useF1('ha');
  const [multi, setMulti] = useF1(true);
  const [pop, setPop] = useF1(true);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Add crop" sub="North Plot · Lakshmi Gowda" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 0' }}>
        <FormSection n="1" title="Crop">
          <div>
            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-muted)', marginBottom: 8 }}>Crop</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Tuberose', 'Jasmine', 'Marigold', 'Rose', 'Davana'].map(c => {
                const on = crop === c;
                return <button key={c} onClick={() => setCrop(c)} style={{ padding: '9px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter', border: on ? 'none' : '1.5px solid var(--border-strong)', background: on ? 'var(--primary)' : 'var(--bg-elevated)', color: on ? 'var(--on-primary)' : 'var(--fg-muted)' }}>{c}</button>;
              })}
            </div>
          </div>
          <Field label="Variety" value="" onChange={() => {}} placeholder="e.g. Single / Double" />
          <div><span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-muted)', marginBottom: 8 }}>Type</span><Seg options={['Single', 'Double']} value={type} onChange={setType} /></div>
        </FormSection>
        <FormSection n="2" title="Area & dates">
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}><Field label="Area" value="1.2" onChange={() => {}} mono /></div>
            <div style={{ width: 130 }}><span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-muted)', marginBottom: 8 }}>Unit</span><Seg options={['ha', 'acre']} value={unit} onChange={setUnit} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, height: 54, padding: '0 14px', borderRadius: 14, background: 'var(--bg-elevated)', boxShadow: 'inset 0 0 0 1.5px var(--border-strong)', cursor: 'pointer', color: 'var(--fg)' }}><Icon name="cal" size={18} color="var(--primary)" /><div style={{ textAlign: 'left' }}><div style={{ fontSize: 10.5, color: 'var(--fg-subtle)', fontWeight: 600 }}>SOWN</div><div style={{ fontSize: 13.5, fontWeight: 500 }}>12 Mar 2026</div></div></button>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, height: 54, padding: '0 14px', borderRadius: 14, background: 'var(--bg-elevated)', boxShadow: 'inset 0 0 0 1.5px var(--border-strong)', cursor: 'pointer', color: 'var(--fg)' }}><Icon name="cal" size={18} color="var(--primary)" /><div style={{ textAlign: 'left' }}><div style={{ fontSize: 10.5, color: 'var(--fg-subtle)', fontWeight: 600 }}>EXP. HARVEST</div><div style={{ fontSize: 13.5, fontWeight: 500 }}>05 Jun 2026</div></div></button>
          </div>
        </FormSection>
        <FormSection n="3" title="Options">
          <ListRow icon="wheat" color="var(--secondary-d)" label="Multi-harvest crop" right={<MSwitch on={multi} onChange={setMulti} />} />
          <ListRow icon="leaf" label="Seed Package of Practices" right={<MSwitch on={pop} onChange={setPop} />} last />
        </FormSection>
      </div>
      <div style={{ padding: '12px 16px 36px', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid var(--glass-border)' }}>
        <Btn kind="primary" size="lg" full icon="check" onClick={() => { onBack(); onToast(`${crop} added to North Plot`, 'success'); }}>Save crop</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { MTabs, WeatherScreen, HarvestBoardScreen, ActivitiesListScreen, PreHarvestScreen, AddCropScreen });
