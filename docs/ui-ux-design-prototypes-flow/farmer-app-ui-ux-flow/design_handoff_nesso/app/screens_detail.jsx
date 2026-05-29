/* ============================================================
   Nesso · Mobile B3 — Farmer Profile, Farm Details
   Exports → window: FarmerProfileScreen, FarmDetailsScreen
   ============================================================ */
const { useState: useD1 } = React;

function MiniMapM({ h = 180 }) {
  return (
    <div style={{ position: 'relative', height: h, background: 'radial-gradient(120% 90% at 30% 20%, #3a5e3e, #21331f)', overflow: 'hidden' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.35 }}><defs><pattern id="fm" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(20)"><path d="M0 10H40M0 26H40" stroke="#5b8a5f" strokeWidth="5" opacity="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#fm)" /></svg>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <polygon points="34,26 60,18 70,44 54,62 30,52" fill="rgba(241,212,18,0.18)" stroke="#F1D412" strokeWidth="0.6" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2.5 }} />
        {[[34,26],[60,18],[70,44],[54,62],[30,52]].map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="1.4" fill="#fff" vectorEffect="non-scaling-stroke" style={{ r: 4 }} />)}
      </svg>
    </div>
  );
}

function FarmerProfileScreen({ onBack, onNav, onToast }) {
  const [tab, setTab] = useD1('Farms');
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Lakshmi Gowda" sub="FRM-2841 · Channarayapatna" onBack={onBack} right={<button onClick={() => onToast('Calling farmer…', 'sync')} style={{ border: 'none', background: 'var(--primary-50)', color: 'var(--primary)', borderRadius: '50%', width: 36, height: 36, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon name="phone" size={17} /></button>} />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-elevated)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 16 }}>
          <Avatar name="Lakshmi Gowda" size={58} />
          <div style={{ flex: 1 }}>
            <div className="display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)' }}>Lakshmi Gowda</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 1 }}>Belur FPO · joined Mar 2026</div>
            <div style={{ marginTop: 7 }}><StatusChip kind="pending">KYC in review</StatusChip></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12 }}>
          {[['Farms', '3'], ['Area', '4.2 ha'], ['Activities', '38']].map(([l, v]) => (
            <div key={l} style={{ background: 'var(--bg-elevated)', borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: '13px 10px', textAlign: 'center' }}>
              <div className="display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>{v}</div><div style={{ fontSize: 11.5, color: 'var(--fg-muted)' }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ margin: '18px -16px 14px' }}><MTabs items={['Farms', 'Produce', 'Financial', 'Inventory']} value={tab} onChange={setTab} /></div>

        {tab === 'Farms' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['North Plot', 'Tuberose', '1.2 ha'], ['Roadside field', 'Jasmine', '1.6 ha'], ['Lower terrace', 'Marigold', '1.4 ha']].map(([n, c, a], i) => (
              <button key={n} onClick={() => onNav('farmDetails')} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 12, cursor: 'pointer', textAlign: 'left' }}>
                <PolyThumb seed={i} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{n}</div><div style={{ display: 'flex', gap: 6, marginTop: 6 }}><span style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary-d)', background: 'var(--secondary-bg)', padding: '2px 8px', borderRadius: 999 }}>{c}</span><span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: 999 }}>{a}</span></div></div>
                <Icon name="chevR" size={18} color="var(--fg-subtle)" />
              </button>
            ))}
          </div>
        ) : tab === 'Financial' ? (
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            {[['Bank', 'HDFC ••32'], ['IFSC', 'HDFC0001234'], ['Total paid', '₹18,400'], ['Pending', '₹2,100']].map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px', borderTop: i ? '1px solid var(--border)' : 'none' }}><span style={{ fontSize: 13.5, color: 'var(--fg-muted)' }}>{k}</span><span className="mono" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{v}</span></div>
            ))}
          </div>
        ) : tab === 'Produce' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Tuberose', '320 kg', 'Grade A'], ['Jasmine', '180 kg', 'Grade A'], ['Marigold', '540 kg', 'Grade B']].map(([c, q, g], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 14 }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--secondary-bg)', color: 'var(--secondary-d)', display: 'grid', placeItems: 'center' }}><Icon name="wheat" size={19} /></span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>{c}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{g}</div></div>
                <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>{q}</span>
              </div>
            ))}
          </div>
        ) : tab === 'Inventory' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Neem oil', '4 L'], ['Vermicompost', '120 kg'], ['Drip lateral', '340 m'], ['Gunny bags', '60 pc']].map(([n, q], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 14 }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Icon name="box" size={19} /></span>
                <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>{n}</div>
                <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>{q}</span>
              </div>
            ))}
          </div>
        ) : <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fg-muted)', fontSize: 14 }}>No {tab.toLowerCase()} records yet.</div>}
      </div>
      <div style={{ padding: '12px 16px 36px', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 10 }}>
        <Btn kind="outline" size="lg" full icon="x" onClick={() => onToast('Registration rejected', 'error')}>Reject</Btn>
        <Btn kind="primary" size="lg" full icon="checkc" onClick={() => { onBack(); onToast('Farmer approved ✓', 'success'); }}>Approve</Btn>
      </div>
    </div>
  );
}

function FarmDetailsScreen({ onBack, onNav, onToast }) {
  const [tab, setTab] = useD1('Crops');
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="North Plot" sub="FARM-118 · 1.2 ha" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 100 }}>
        <MiniMapM h={200} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, padding: 16 }}>
          {[['Area', '1.2 ha'], ['Vertices', '6'], ['Centroid', '13.16°N, 75.86°E'], ['Soil', 'Red loam']].map(([k, v]) => (
            <div key={k}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div><div className={k === 'Centroid' ? 'mono' : 'display'} style={{ fontSize: k === 'Centroid' ? 13 : 17, fontWeight: 700, color: 'var(--fg)', marginTop: 3 }}>{v}</div></div>
          ))}
        </div>
        <div style={{ margin: '6px 0 14px' }}><MTabs items={['Crops', 'Activities', 'Weather', 'Certificates', 'Soil']} value={tab} onChange={setTab} /></div>
        <div style={{ padding: '0 16px' }}>
          {tab === 'Crops' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Tuberose', 'Single · sown 12 Mar', 'Flowering'], ['Marigold', 'African · sown 02 Apr', 'Vegetative']].map(([c, d, st]) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 14 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Icon name="leaf" size={20} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{c}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{d}</div></div>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--secondary-d)', background: 'var(--secondary-bg)', padding: '3px 9px', borderRadius: 999 }}>{st}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 'Activities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['drop', 'Spraying', '₹640 · today'], ['cloud', 'Irrigation', 'yesterday'], ['wheat', 'Fertilizer', '₹240 · 24 May'], ['leaf', 'Weeding', '₹360 · 21 May']].map(([ic, t, m], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 13 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Icon name={ic} size={19} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>{t}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{m}</div></div>
                  <StatusChip kind="approved">Done</StatusChip>
                </div>
              ))}
            </div>
          )}
          {tab === 'Weather' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, background: 'linear-gradient(135deg, var(--secondary), var(--primary))', color: '#fff' }}>
                <Icon name="cloud" size={36} color="#fff" stroke={1.6} />
                <div style={{ flex: 1 }}><div className="display" style={{ fontSize: 30, fontWeight: 700 }}>27°</div><div style={{ fontSize: 12.5, opacity: 0.9 }}>Spraying window till 4 PM</div></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>{[['Mon', 28], ['Tue', 31], ['Wed', 28], ['Thu', 25]].map(([d, t]) => <div key={d} style={{ flex: 1, textAlign: 'center', padding: '11px 4px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}><div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{d}</div><Icon name="cloud" size={17} color="var(--secondary-d)" style={{ margin: '6px auto' }} /><div className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{t}°</div></div>)}</div>
            </div>
          )}
          {tab === 'Certificates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['India Organic', 'Valid till Mar 2027', 'approved'], ['GAP checklist', 'Valid till Jan 2027', 'approved'], ['Residue test', 'Renewal due', 'pending']].map(([n, d, st]) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 14 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Icon name="shield" size={19} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>{n}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{d}</div></div>
                  <StatusChip kind={st}>{st === 'approved' ? 'Active' : 'Renew'}</StatusChip>
                </div>
              ))}
            </div>
          )}
          {tab === 'Soil' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Type', 'Red loam'], ['pH', '6.8'], ['Organic carbon', '0.62%'], ['Nitrogen', 'Medium'], ['Phosphorus', 'High'], ['Last tested', '14 Apr']].map(([k, v]) => (
                <div key={k} style={{ padding: 13, borderRadius: 13, background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}><div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase' }}>{k}</div><div className="display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)', marginTop: 3 }}>{v}</div></div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px 36px', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid var(--glass-border)' }}>
        <Btn kind="primary" size="lg" full icon="plus" onClick={() => onNav('addCrop')}>Add crop</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { FarmerProfileScreen, FarmDetailsScreen, MiniMapM });
