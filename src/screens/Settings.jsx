import React, { useState } from 'react';
import { saveSettings } from '../utils/storage.js';
import { EnvironmentSelector } from '../components/Environment.jsx';

function Section({ title, children, delay=0 }) {
  return (
    <div style={{ marginBottom:'28px', animation:`fadeInUp 0.5s var(--ease-out) ${delay}ms both` }}>
      <h3 style={{ fontSize:'11px', fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:'14px' }}>{title}</h3>
      <div style={{ background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, description, children, last }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', padding:'16px 18px', borderBottom: last?'none':'1px solid var(--border-subtle)' }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'14px', color:'var(--text-primary)', fontWeight:300 }}>{label}</div>
        {description && <div style={{ fontSize:'11px', color:'var(--text-tertiary)', marginTop:'2px' }}>{description}</div>}
      </div>
      <div style={{ flexShrink:0 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width:'44px', height:'24px', borderRadius:'var(--radius-full)', border:'1px solid', borderColor: value?'var(--accent)':'var(--border-default)', background: value?'var(--accent-dim)':'var(--bg-elevated)', cursor:'pointer', position:'relative', transition:'all 0.25s var(--ease-out)', padding:0 }}>
      <div style={{ position:'absolute', top:'3px', left: value?'calc(100% - 20px)':'3px', width:'16px', height:'16px', borderRadius:'50%', background: value?'var(--accent)':'var(--border-strong)', transition:'left 0.25s var(--ease-spring)', boxShadow: value?'0 0 8px var(--accent-glow)':'none' }} />
    </button>
  );
}

function Stepper({ value, onChange, min=1, max=120, step=1, unit='min' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
      <button onClick={() => onChange(Math.max(min, value-step))} style={{ width:'28px', height:'28px', borderRadius:'50%', border:'1px solid var(--border-default)', background:'var(--bg-elevated)', color:'var(--text-secondary)', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
      <span style={{ fontFamily:'DM Mono,monospace', fontSize:'14px', fontWeight:300, color:'var(--text-primary)', minWidth:'52px', textAlign:'center' }}>{value}{unit}</span>
      <button onClick={() => onChange(Math.min(max, value+step))} style={{ width:'28px', height:'28px', borderRadius:'50%', border:'1px solid var(--border-default)', background:'var(--bg-elevated)', color:'var(--text-secondary)', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
    </div>
  );
}

function Segmented({ value, options, onChange }) {
  return (
    <div style={{ display:'flex', background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-sm)', padding:'3px', gap:'2px' }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{ padding:'6px 12px', borderRadius:'6px', border:'none', background: value===o.value?'var(--accent-dim)':'transparent', color: value===o.value?'var(--accent)':'var(--text-secondary)', fontSize:'12px', fontWeight: value===o.value?500:300, cursor:'pointer', transition:'all 0.2s' }}>{o.label}</button>
      ))}
    </div>
  );
}

export default function Settings({ settings, onSettingsChange, onBack, onClearData }) {
  const [local, setLocal] = useState(settings);
  const [clearConfirm, setClearConfirm] = useState(false);

  const update = (key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    saveSettings(next);
    onSettingsChange(next);
  };

  const requestNotif = async () => {
    if ('Notification' in window) {
      const p = await Notification.requestPermission();
      if (p === 'granted') update('notifications', true);
    }
  };

  return (
    <div style={{ maxWidth:'600px', margin:'0 auto', padding:'32px 24px' }}>
      <button onClick={onBack} style={{ color:'var(--text-secondary)', fontSize:'13px', background:'none', border:'none', cursor:'pointer', padding:'8px 0', marginBottom:'20px', display:'block' }}>← Back</button>
      <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'36px', fontWeight:400, color:'var(--text-primary)', marginBottom:'36px' }}>Settings</h1>

      <Section title="Timer" delay={0}>
        <Row label="Focus Duration">
          <Stepper value={local.focusDuration} onChange={(v) => update('focusDuration', v)} min={1} max={120} />
        </Row>
        <Row label="Short Break">
          <Stepper value={local.breakDuration} onChange={(v) => update('breakDuration', v)} min={1} max={30} />
        </Row>
        <Row label="Long Break">
          <Stepper value={local.longBreakDuration} onChange={(v) => update('longBreakDuration', v)} min={5} max={60} />
        </Row>
        <Row label="Sessions Before Long Break" last>
          <Stepper value={local.sessionsBeforeLongBreak} onChange={(v) => update('sessionsBeforeLongBreak', v)} min={2} max={8} unit="×" />
        </Row>
      </Section>

      <Section title="Appearance" delay={50}>
        <Row label="Theme">
          <Segmented value={local.theme} options={[{label:'🌙 Dark',value:'dark'},{label:'☀ Light',value:'light'},{label:'Auto',value:'dynamic'}]} onChange={(v) => update('theme', v)} />
        </Row>
        <Row label="Mode" description="Changes accent color" last>
          <Segmented value={local.mode} options={[{label:'Work',value:'work'},{label:'Study',value:'study'},{label:'Relax',value:'relax'},{label:'Custom',value:'custom'}]} onChange={(v) => update('mode', v)} />
        </Row>
      </Section>

      <Section title="Ambient Environment" delay={100}>
        <div style={{ padding:'16px 18px' }}>
          <p style={{ fontSize:'12px', color:'var(--text-tertiary)', marginBottom:'14px' }}>Choose your background environment</p>
          <EnvironmentSelector current={local.environment} onChange={(v) => update('environment', v)} />
          <div style={{ marginTop:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'8px' }}>
              <span style={{ color:'var(--text-secondary)' }}>Ambient Volume</span>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:'12px', color:'var(--text-tertiary)' }}>{Math.round(local.ambientVolume*100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={local.ambientVolume} onChange={(e) => update('ambientVolume', Number(e.target.value))} style={{ width:'100%' }} />
          </div>
        </div>
      </Section>

      <Section title="Automation" delay={150}>
        <Row label="Auto-start Breaks" description="Begin break automatically after session">
          <Toggle value={local.autoStartBreak} onChange={(v) => update('autoStartBreak', v)} />
        </Row>
        <Row label="Auto-start Focus" description="Begin session automatically after break" last>
          <Toggle value={local.autoStartFocus} onChange={(v) => update('autoStartFocus', v)} />
        </Row>
      </Section>

      <Section title="Notifications" delay={200}>
        <Row label="Browser Notifications">
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            {Notification?.permission !== 'granted' && (
              <button onClick={requestNotif} style={{ padding:'6px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-default)', background:'var(--bg-elevated)', color:'var(--text-secondary)', fontSize:'11px', cursor:'pointer' }}>Enable</button>
            )}
            <Toggle value={local.notifications} onChange={(v) => update('notifications', v)} />
          </div>
        </Row>
        <Row label="Sound Alerts" last>
          <Toggle value={local.soundAlerts} onChange={(v) => update('soundAlerts', v)} />
        </Row>
      </Section>

      <Section title="Data" delay={250}>
        <div style={{ padding:'16px 18px' }}>
          {!clearConfirm ? (
            <button onClick={() => setClearConfirm(true)} style={{ padding:'10px 18px', borderRadius:'var(--radius-sm)', border:'1px solid var(--danger-dim)', background:'transparent', color:'var(--danger)', fontSize:'13px', cursor:'pointer' }}>Clear All Data</button>
          ) : (
            <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
              <span style={{ fontSize:'13px', color:'var(--text-secondary)' }}>This is irreversible. Are you sure?</span>
              <button onClick={() => { onClearData(); setClearConfirm(false); }} style={{ padding:'8px 14px', borderRadius:'var(--radius-sm)', border:'1px solid var(--danger)', background:'var(--danger-dim)', color:'var(--danger)', fontSize:'12px', cursor:'pointer' }}>Confirm</button>
              <button onClick={() => setClearConfirm(false)} style={{ padding:'8px 14px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-default)', background:'transparent', color:'var(--text-secondary)', fontSize:'12px', cursor:'pointer' }}>Cancel</button>
            </div>
          )}
        </div>
      </Section>

      <p style={{ textAlign:'center', fontSize:'11px', color:'var(--text-tertiary)', marginTop:'32px', fontFamily:'DM Mono,monospace' }}>Zenith v1.0.0 · Deep Focus PWA</p>
    </div>
  );
}
