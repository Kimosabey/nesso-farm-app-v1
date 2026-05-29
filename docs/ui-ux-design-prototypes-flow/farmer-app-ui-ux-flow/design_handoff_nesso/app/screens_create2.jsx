/* ============================================================
   Nesso · Create flows pt.2 — Add Activity (+ input picker), Accept GRN
   Exports → window: AddActivityScreen, AcceptGrnScreen
   ============================================================ */
const { useState: useState2, useEffect: useEffect2 } = React;

const ACT_TYPES = [
  { k: 'Spraying', ic: 'drop' }, { k: 'Fertilizer', ic: 'wheat' }, { k: 'Irrigation', ic: 'cloud' },
  { k: 'Weeding', ic: 'leaf' }, { k: 'Harvest', ic: 'wheat' }, { k: 'Scouting', ic: 'search' },
];

const CATALOG = {
  Chemical: [
    { n: 'Mancozeb 75% WP', u: 'kg', rate: 320, hint: 'Fungicide' },
    { n: 'Imidacloprid 17.8%', u: 'ml', rate: 4, hint: 'Insecticide' },
    { n: 'Chlorpyriphos 20%', u: 'ml', rate: 2, hint: 'Insecticide' },
    { n: 'Carbendazim 50% WP', u: 'g', rate: 1, hint: 'Fungicide' },
    { n: 'Urea 46% N', u: 'kg', rate: 12, hint: 'Nitrogen' },
  ],
  Organic: [
    { n: 'Neem oil', u: 'L', rate: 480, hint: 'Bio-pesticide' },
    { n: 'Vermicompost', u: 'kg', rate: 14, hint: 'Soil amendment' },
    { n: 'Jeevamrutha', u: 'L', rate: 8, hint: 'Bio-stimulant' },
    { n: 'Panchagavya', u: 'L', rate: 60, hint: 'Foliar' },
  ],
  Inventory: [
    { n: 'Drip lateral 16mm', u: 'm', rate: 18, hint: 'Stock' },
    { n: 'Mulch film', u: 'm', rate: 9, hint: 'Stock' },
    { n: 'Gunny bags', u: 'pc', rate: 22, hint: 'Stock' },
  ],
  Other: [
    { n: 'Labour — spraying', u: 'hr', rate: 90, hint: 'Wage' },
    { n: 'Tractor hire', u: 'hr', rate: 650, hint: 'Machinery' },
    { n: 'Transport', u: 'trip', rate: 400, hint: 'Logistics' },
  ],
};

function InputPicker({ open, onClose, onAdd }) {
  const [tab, setTab] = useState2('Chemical');
  const [q, setQ] = useState2('');
  const items = CATALOG[tab].filter(i => i.n.toLowerCase().includes(q.toLowerCase()));
  return (
    <BottomSheet open={open} onClose={onClose} title="Add input" maxH={0.9}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 46, padding: '0 14px', borderRadius: 13, background: 'var(--bg-muted)' }}>
          <Icon name="search" size={18} color="var(--fg-subtle)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search 180+ inputs…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--fg)', fontFamily: 'Inter' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6, overflowX: 'auto' }}>
        {Object.keys(CATALOG).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ whiteSpace: 'nowrap', padding: '7px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter',
            border: tab === t ? 'none' : '1.5px solid var(--border)', background: tab === t ? 'var(--primary)' : 'var(--bg-elevated)', color: tab === t ? 'var(--on-primary)' : 'var(--fg-muted)' }}>{t}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map(it => (
          <button key={it.n} onClick={() => { onAdd({ ...it, qty: 1 }); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 4px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="drop" size={18} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>{it.n}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{it.hint} · ₹{it.rate}/{it.u}</div>
            </div>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="plus" size={17} stroke={2.6} /></span>
          </button>
        ))}
        {!items.length && <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--fg-subtle)', fontSize: 14 }}>No inputs match "{q}".</div>}
      </div>
    </BottomSheet>
  );
}

function AddActivityScreen({ onBack, onToast }) {
  const [type, setType] = useState2('Spraying');
  const [inputs, setInputs] = useState2([{ n: 'Mancozeb 75% WP', u: 'kg', rate: 320, qty: 2 }]);
  const [picker, setPicker] = useState2(false);
  const total = inputs.reduce((s, i) => s + i.rate * i.qty, 0);
  const setQty = (idx, d) => setInputs(arr => arr.map((it, i) => i === idx ? { ...it, qty: Math.max(1, it.qty + d) } : it));
  const remove = (idx) => setInputs(arr => arr.filter((_, i) => i !== idx));

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Add activity" sub="Belur Estate · today" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 0' }}>
        {/* type */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-muted)', marginBottom: 10 }}>Activity type</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
            {ACT_TYPES.map(a => {
              const on = type === a.k;
              return <button key={a.k} onClick={() => setType(a.k)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '13px 4px', borderRadius: 14, cursor: 'pointer', fontFamily: 'Inter',
                border: on ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: on ? 'var(--primary-50)' : 'var(--bg-elevated)' }}>
                <Icon name={a.ic} size={22} color={on ? 'var(--primary)' : 'var(--fg-muted)'} stroke={on ? 2.1 : 1.7} />
                <span style={{ fontSize: 12, fontWeight: 600, color: on ? 'var(--primary)' : 'var(--fg-muted)' }}>{a.k}</span>
              </button>;
            })}
          </div>
        </div>

        {/* date + farm row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, height: 50, padding: '0 14px', borderRadius: 13, background: 'var(--bg-elevated)', border: '1.5px solid var(--border-strong)', cursor: 'pointer', color: 'var(--fg)' }}>
            <Icon name="cal" size={18} color="var(--primary)" /><span style={{ fontSize: 14, fontWeight: 500 }}>29 May 2026</span>
          </button>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, height: 50, padding: '0 14px', borderRadius: 13, background: 'var(--bg-elevated)', border: '1.5px solid var(--border-strong)', cursor: 'pointer', color: 'var(--fg)' }}>
            <Icon name="map" size={18} color="var(--primary)" /><span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Belur Estate</span><Icon name="chevR" size={16} color="var(--fg-subtle)" style={{ marginLeft: 'auto', transform: 'rotate(90deg)' }} />
          </button>
        </div>

        {/* inputs */}
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
            <h3 className="display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>Inputs used</h3>
            <button onClick={() => setPicker(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--primary-50)', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 13, fontFamily: 'Inter', padding: '7px 12px', borderRadius: 999, cursor: 'pointer' }}><Icon name="plus" size={15} stroke={2.6} /> Add</button>
          </div>
          {inputs.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{it.n}</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--fg-muted)' }}>₹{it.rate}/{it.u} · ₹{(it.rate * it.qty).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setQty(i, -1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid var(--border-strong)', background: 'var(--bg-elevated)', cursor: 'pointer', color: 'var(--fg)', display: 'grid', placeItems: 'center', fontSize: 18, lineHeight: 1 }}>−</button>
                <span className="mono" style={{ minWidth: 38, textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{it.qty} {it.u}</span>
                <button onClick={() => setQty(i, 1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid var(--border-strong)', background: 'var(--bg-elevated)', cursor: 'pointer', color: 'var(--fg)', display: 'grid', placeItems: 'center', fontSize: 16, lineHeight: 1 }}>+</button>
                <button onClick={() => remove(i)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--fg-subtle)', display: 'grid', placeItems: 'center' }}><Icon name="x" size={16} /></button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)' }}>Total cost</span>
            <span className="display mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
          </div>
        </div>

        {/* notes + photo + geo */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
          <PhotoTile label="Add photo" />
          <button style={{ flex: 1, aspectRatio: '1.3', borderRadius: 14, border: '1.5px solid var(--border-strong)', background: 'var(--bg-elevated)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer', color: 'var(--fg-muted)' }}>
            <Icon name="pin" size={24} color="var(--secondary-d)" />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Geotag</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-subtle)' }}>13.16°N 75.86°E</span>
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 16px 36px', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid var(--glass-border)' }}>
        <Btn kind="primary" size="lg" full icon="check" onClick={() => { onBack(); onToast(`${type} logged · ₹${total.toLocaleString()}`, 'success'); }}>Log activity</Btn>
      </div>

      <InputPicker open={picker} onClose={() => setPicker(false)} onAdd={(it) => setInputs(arr => [...arr, it])} />
    </div>
  );
}

/* ---------------- Accept GRN — camera scanner ---------------- */
function AcceptGrnScreen({ onBack, onToast }) {
  const [flash, setFlash] = useState2(false);
  const [scanned, setScanned] = useState2(false);
  const formats = ['QR', 'EAN-13', 'PDF417', 'Aztec', 'DataMatrix'];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f0c', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* faux camera feed */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 40%, #1c2620 0%, #0c120e 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.12, background: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 4px)' }} />
      </div>
      {/* dim mask with cut-out look via border */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,12,8,0.55)' }} />

      {/* top bar */}
      <div style={{ position: 'relative', zIndex: 5, paddingTop: 50, padding: '50px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} aria-label="Back" style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}><Icon name="arrowL" size={20} /></button>
        <div style={{ flex: 1 }}><div className="display" style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Scan GRN</div></div>
        <button onClick={() => setFlash(f => !f)} aria-label="Flash" style={{ width: 42, height: 42, borderRadius: '50%', background: flash ? '#F1D412' : 'rgba(255,255,255,0.14)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', color: flash ? '#0F1A14' : '#fff', flexShrink: 0 }}><Icon name="sun" size={19} /></button>
      </div>

      {/* reticle */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <div onClick={() => { if (!scanned) setScanned(true); }} style={{ position: 'relative', width: 236, height: 236, cursor: 'pointer' }}
          className={scanned ? 'scan-ok' : ''}>
          {/* corner brackets */}
          {[['tl', { top: 0, left: 0 }], ['tr', { top: 0, right: 0 }], ['bl', { bottom: 0, left: 0 }], ['br', { bottom: 0, right: 0 }]].map(([k, pos]) => (
            <span key={k} style={{ position: 'absolute', width: 40, height: 40, ...pos,
              borderTop: k[0] === 't' ? `4px solid ${scanned ? '#5DB683' : '#F1D412'}` : 'none',
              borderBottom: k[0] === 'b' ? `4px solid ${scanned ? '#5DB683' : '#F1D412'}` : 'none',
              borderLeft: k[1] === 'l' ? `4px solid ${scanned ? '#5DB683' : '#F1D412'}` : 'none',
              borderRight: k[1] === 'r' ? `4px solid ${scanned ? '#5DB683' : '#F1D412'}` : 'none',
              borderTopLeftRadius: k === 'tl' ? 16 : 0, borderTopRightRadius: k === 'tr' ? 16 : 0,
              borderBottomLeftRadius: k === 'bl' ? 16 : 0, borderBottomRightRadius: k === 'br' ? 16 : 0,
              transition: 'border-color .3s' }} />
          ))}
          {/* scan line */}
          {!scanned && <div className="scan-line" style={{ position: 'absolute', left: 14, right: 14, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, transparent, #F1D412, transparent)', boxShadow: '0 0 12px #F1D412' }} />}
          {scanned && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><span style={{ width: 64, height: 64, borderRadius: '50%', background: '#5DB683', display: 'grid', placeItems: 'center' }}><Icon name="check" size={36} color="#06140c" stroke={3} /></span></div>}
        </div>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>{scanned ? 'Code detected' : 'Align the QR or barcode inside the frame'}</div>
          {!scanned && <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>(tap the frame to simulate a scan)</div>}
        </div>
        {/* format chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', maxWidth: 300 }}>
          {formats.map(f => <span key={f} className="mono" style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.12)', padding: '5px 10px', borderRadius: 999 }}>{f}</span>)}
        </div>
      </div>

      {/* manual entry */}
      <div style={{ position: 'relative', zIndex: 5, padding: '0 16px 38px' }}>
        <button style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600, fontSize: 14.5, fontFamily: 'Inter', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <Icon name="edit" size={18} /> Enter code manually
        </button>
      </div>

      {/* confirm sheet */}
      <BottomSheet open={scanned} onClose={() => setScanned(false)} title="Confirm GRN">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0 16px' }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="scan" size={22} /></span>
          <div>
            <div className="mono" style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>BATCH-TBR-0291</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>Detected via QR · just now</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-muted)', borderRadius: 14, overflow: 'hidden', marginBottom: 18 }}>
          {[['Crop', 'Tuberose · Grade A'], ['Quantity', '320 kg'], ['Supplier', 'Belur FPO'], ['Farm', 'Belur Estate · FARM-117']].map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderTop: i ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{k}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{v}</span>
            </div>
          ))}
        </div>
        <Btn kind="primary" size="lg" full icon="checkc" onClick={() => { setScanned(false); onBack(); onToast('GRN accepted · 320 kg in', 'success'); }}>Accept GRN</Btn>
      </BottomSheet>
    </div>
  );
}

Object.assign(window, { AddActivityScreen, AcceptGrnScreen, InputPicker });
