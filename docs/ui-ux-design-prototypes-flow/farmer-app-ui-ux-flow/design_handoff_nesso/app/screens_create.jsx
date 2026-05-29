/* ============================================================
   Nesso · Create flows pt.1 — shared helpers, Register, Add Farm
   Exports → window: PushHeader, Seg, Check, FormSection, PhotoTile,
   RegisterFarmerScreen, AddFarmScreen
   ============================================================ */
const { useState: useStateC, useRef: useRefC } = React;

/* ---------------- shared create-flow primitives ---------------- */
function PushHeader({ title, sub, onBack, right }) {
  return (
    <div style={{ paddingTop: 50, padding: '50px 16px 14px', display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--glass-bg)', backdropFilter: 'blur(16px) saturate(1.4)', WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
      borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 10 }}>
      <button onClick={onBack} aria-label="Back" style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--fg)', flexShrink: 0 }}><Icon name="arrowL" size={20} /></button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Seg({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', background: 'var(--bg-muted)', borderRadius: 12, padding: 3, gap: 3 }}>
      {options.map(o => {
        const on = value === o;
        return <button key={o} onClick={() => onChange(o)} style={{ flex: 1, padding: '9px 4px', borderRadius: 9, border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, fontFamily: 'Inter', whiteSpace: 'nowrap',
          background: on ? 'var(--bg-elevated)' : 'transparent', color: on ? 'var(--primary)' : 'var(--fg-muted)',
          boxShadow: on ? 'var(--shadow-sm)' : 'none', transition: 'all .18s' }}>{o}</button>;
      })}
    </div>
  );
}

function Check({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, width: '100%' }}>
      <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 1, display: 'grid', placeItems: 'center',
        background: checked ? 'var(--primary)' : 'var(--bg-elevated)', boxShadow: checked ? 'none' : 'inset 0 0 0 1.5px var(--border-strong)', transition: 'all .15s' }}>
        {checked && <Icon name="check" size={15} color="var(--on-primary)" stroke={3} />}
      </span>
      <span style={{ fontSize: 13.5, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{label}</span>
    </button>
  );
}

function FormSection({ n, title, desc, children }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 18, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: desc ? 4 : 16 }}>
        {n && <span className="mono" style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{n}</span>}
        <h3 className="display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>{title}</h3>
      </div>
      {desc && <p style={{ fontSize: 12.5, color: 'var(--fg-subtle)', margin: '0 0 16px 36px' }}>{desc}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

function PhotoTile({ label, icon = 'camera' }) {
  return (
    <button style={{ flex: 1, aspectRatio: '1.3', borderRadius: 14, border: '1.5px dashed var(--border-strong)', background: 'var(--bg-muted)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer', color: 'var(--fg-muted)' }}>
      <Icon name={icon} size={24} color="var(--primary)" />
      <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

/* ---------------- Register Farmer (full sticky form) ---------------- */
function RegisterFarmerScreen({ onBack, onToast }) {
  const [name, setName] = useStateC('');
  const [gender, setGender] = useStateC('Female');
  const [phone, setPhone] = useStateC('');
  const [assoc, setAssoc] = useStateC('FPO');
  const [crops, setCrops] = useStateC(['Tuberose']);
  const [consent, setConsent] = useStateC(false);
  const allCrops = ['Tuberose', 'Jasmine', 'Marigold', 'Rose', 'Davana'];
  const toggleCrop = (c) => setCrops(cs => cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Register farmer" sub="Step 1 of 4 · Personal" onBack={onBack}
        right={<span className="mono" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, paddingRight: 6 }}>Draft</span>} />
      {/* progress */}
      <div style={{ display: 'flex', gap: 5, padding: '12px 16px 0' }}>
        {[1, 0, 0, 0].map((a, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: a ? 'var(--primary)' : 'var(--border-strong)' }} />)}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 0' }}>
        <FormSection n="1" title="Personal details">
          <Field label="Full name" value={name} onChange={setName} placeholder="e.g. Lakshmi Gowda" required />
          <div>
            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-muted)', marginBottom: 8 }}>Gender</span>
            <Seg options={['Female', 'Male', 'Other']} value={gender} onChange={setGender} />
          </div>
          <Field label="Mobile number" prefix="+91" value={phone} onChange={v => setPhone(v.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" mono required />
        </FormSection>

        <FormSection n="2" title="ID proof" desc="Aadhaar / Voter ID — photo of both sides">
          <Seg options={['Aadhaar', 'Voter ID', 'PAN']} value="Aadhaar" onChange={() => {}} />
          <Field label="Aadhaar number" value="" onChange={() => {}} placeholder="0000 0000 0000" mono />
          <div style={{ display: 'flex', gap: 12 }}>
            <PhotoTile label="Front" />
            <PhotoTile label="Back" />
          </div>
        </FormSection>

        <FormSection n="3" title="Bank account" desc="For procurement payments">
          <Field label="Account number" value="" onChange={() => {}} placeholder="0000 0000 0000" mono />
          <Field label="IFSC code" value="" onChange={() => {}} placeholder="HDFC0001234" mono hint="Format: ABCD0123456" />
        </FormSection>

        <FormSection n="4" title="Crop preferences">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {allCrops.map(c => {
              const on = crops.includes(c);
              return <button key={c} onClick={() => toggleCrop(c)} style={{ padding: '9px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                border: on ? 'none' : '1.5px solid var(--border-strong)', background: on ? 'var(--primary)' : 'var(--bg-elevated)', color: on ? 'var(--on-primary)' : 'var(--fg-muted)' }}>
                {on && <Icon name="check" size={14} stroke={3} />}{c}</button>;
            })}
          </div>
        </FormSection>

        <div style={{ padding: '4px 4px 16px' }}>
          <Check checked={consent} onChange={setConsent} label="Farmer consents to Nesso storing their KYC and farm data for traceability, per the Privacy Policy." />
        </div>
      </div>

      {/* sticky save */}
      <div style={{ padding: '12px 16px 36px', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid var(--glass-border)' }}>
        <Btn kind="primary" size="lg" full icon="check" disabled={!name || phone.length !== 10 || !consent}
          onClick={() => { onBack(); onToast('Farmer saved · syncing KYC', 'sync'); }}>Save farmer</Btn>
      </div>
    </div>
  );
}

/* ---------------- Add Farm (interactive polygon editor) ---------------- */
function AddFarmScreen({ onBack, onToast }) {
  const [verts, setVerts] = useStateC([]);
  const [layer, setLayer] = useStateC('Satellite');
  const mapRef = useRefC(null);

  const addVert = (e) => {
    const r = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setVerts(v => [...v, { x, y, id: Date.now() }]);
  };
  const undo = () => setVerts(v => v.slice(0, -1));
  const clear = () => setVerts([]);

  // shoelace area in % units → scaled to hectares (tuned)
  let area = 0;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i], b = verts[(i + 1) % verts.length];
    area += a.x * b.y - b.x * a.y;
  }
  area = Math.abs(area / 2);
  const ha = (area * 0.022).toFixed(2);
  const poly = verts.map(v => `${v.x},${v.y}`).join(' ');

  const sat = layer === 'Satellite';
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0b1410', display: 'flex', flexDirection: 'column' }}>
      {/* map */}
      <div ref={mapRef} onClick={addVert} style={{ position: 'absolute', inset: 0, cursor: 'crosshair', overflow: 'hidden',
        background: sat
          ? 'radial-gradient(120% 90% at 30% 20%, #3a5e3e 0%, #2c4a30 40%, #21331f 100%)'
          : 'linear-gradient(135deg, #e7efe8, #d7e4d9)' }}>
        {/* texture */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: sat ? 0.35 : 0.5 }}>
          <defs><pattern id="fld" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
            <rect width="46" height="46" fill="none"/><path d="M0 12H46M0 30H46" stroke={sat ? '#5b8a5f' : '#9bbf9f'} strokeWidth="6" opacity="0.4"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#fld)" />
        </svg>
        {/* polygon overlay (SVG in % viewBox) */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {verts.length >= 2 && <polygon points={poly} fill={sat ? 'rgba(241,212,18,0.18)' : 'rgba(13,120,60,0.16)'} stroke={sat ? '#F1D412' : '#0D783C'} strokeWidth="0.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2.5 }} />}
        </svg>
        {/* vertices (absolute, so they stay round) */}
        {verts.map((v, i) => (
          <div key={v.id} className="vert-pop" style={{ position: 'absolute', left: v.x + '%', top: v.y + '%', transform: 'translate(-50%,-50%)',
            width: 16, height: 16, borderRadius: '50%', background: sat ? '#F1D412' : '#0D783C', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} />
        ))}
        {/* center crosshair hint when empty */}
        {!verts.length && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center', color: sat ? '#fff' : '#0F1A14' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px dashed currentColor', display: 'grid', placeItems: 'center', margin: '0 auto 12px', opacity: 0.8 }}><Icon name="plus" size={26} /></div>
              <div style={{ fontSize: 14, fontWeight: 600, maxWidth: 200, opacity: 0.9 }}>Tap to drop the corners of the farm boundary</div>
            </div>
          </div>
        )}
      </div>

      {/* top bar */}
      <div style={{ position: 'relative', zIndex: 5, paddingTop: 50, padding: '50px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} aria-label="Back" style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#0F1A14', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}><Icon name="arrowL" size={20} /></button>
        <div style={{ flex: 1 }} />
        <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 11, padding: 3, display: 'flex', gap: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
          {['Standard', 'Satellite'].map(l => (
            <button key={l} onClick={() => setLayer(l)} style={{ padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter',
              background: layer === l ? '#0D783C' : 'transparent', color: layer === l ? '#fff' : '#3C6B51' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* edit controls (floating right) */}
      <div style={{ position: 'absolute', right: 16, top: 150, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={(e) => { e.stopPropagation(); undo(); }} disabled={!verts.length} style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.94)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#0F1A14', boxShadow: '0 2px 10px rgba(0,0,0,0.25)', opacity: verts.length ? 1 : 0.5 }}><Icon name="arrowL" size={20} /></button>
        <button onClick={(e) => { e.stopPropagation(); clear(); }} disabled={!verts.length} style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.94)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#B42318', boxShadow: '0 2px 10px rgba(0,0,0,0.25)', opacity: verts.length ? 1 : 0.5 }}><Icon name="x" size={20} /></button>
      </div>

      {/* bottom side-sheet */}
      <div style={{ position: 'relative', zIndex: 5, marginTop: 'auto', background: 'var(--bg-elevated)', borderRadius: '24px 24px 0 0', padding: '18px 18px 34px', boxShadow: '0 -12px 30px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600 }}>FARM AREA</div>
            <div className="display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>{ha} <span style={{ fontSize: 16, color: 'var(--fg-muted)' }}>ha</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600 }}>VERTICES</div>
            <div className="display mono" style={{ fontSize: 28, fontWeight: 700, color: verts.length >= 3 ? 'var(--primary)' : 'var(--fg-subtle)' }}>{verts.length}</div>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', justifyContent: 'center', padding: '11px', borderRadius: 12, border: '1.5px solid var(--border-strong)', background: 'var(--bg-elevated)', color: 'var(--primary)', fontWeight: 600, fontSize: 14, fontFamily: 'Inter', cursor: 'pointer', marginBottom: 12 }}>
          <Icon name="pin" size={18} /> Use my current location
        </button>
        <Btn kind="primary" size="lg" full icon={verts.length >= 3 ? 'check' : undefined} disabled={verts.length < 3}
          onClick={() => { onBack(); onToast(`Farm mapped · ${ha} ha`, 'success'); }}>
          {verts.length < 3 ? `Add ${3 - verts.length} more corner${3 - verts.length > 1 ? 's' : ''}` : 'Save farm boundary'}
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, { PushHeader, Seg, Check, FormSection, PhotoTile, RegisterFarmerScreen, AddFarmScreen });
