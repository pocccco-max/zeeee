import React, { useState, useMemo } from 'react';
import { buildHeatmapData, getTotalStats } from '../utils/storage.js';

function Heatmap({ onCellClick }) {
  const [hovered, setHovered] = useState(null);
  // No deps needed — recomputes on every render of Stats (lightweight, correct)
  const data = useMemo(() => buildHeatmapData(26), [Math.floor(Date.now() / 60000)]);
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const opacity = count => count === 0 ? 0 : 0.15 + (count / maxCount) * 0.85;

  const weeks = useMemo(() => {
    const r = [];
    for (let i = 0; i < data.length; i += 7) r.push(data.slice(i, i + 7));
    return r;
  }, [data]);

  const monthLabels = useMemo(() => {
    const months = [];
    weeks.forEach((week, wi) => {
      if (!week[0]) return;
      const label = new Date(week[0].date).toLocaleString('default', { month: 'short' });
      if (!months.length || months[months.length-1].label !== label)
        months.push({ label, weekIdx: wi });
    });
    return months;
  }, [weeks]);

  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div>
      <div style={{ display:'flex', paddingLeft:'28px', marginBottom:'6px', position:'relative', height:'16px' }}>
        {monthLabels.map((m, i) => (
          <span key={i} style={{ position:'absolute', left:`${28 + m.weekIdx * 13}px`, fontSize:'9px', color:'var(--text-tertiary)', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'DM Mono,monospace' }}>{m.label}</span>
        ))}
      </div>
      <div style={{ display:'flex', gap:'4px', alignItems:'flex-start' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'3px', paddingTop:'1px' }}>
          {DAY_LABELS.map((d, i) => (
            <div key={d} style={{ height:'11px', fontSize:'8px', color:'var(--text-tertiary)', display: i%2===1?'flex':'none', alignItems:'center', width:'22px', fontFamily:'DM Mono,monospace', letterSpacing:'0.02em' }}>{d}</div>
          ))}
        </div>
        <div style={{ display:'flex', gap:'3px', overflowX:'auto' }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
              {week.map((cell, di) => {
                const isHov = hovered?.date === cell.date;
                return (
                  <div key={cell.date}
                    onClick={() => cell.count > 0 && onCellClick?.(cell)}
                    onMouseEnter={() => setHovered(cell)}
                    onMouseLeave={() => setHovered(null)}
                    title={`${cell.date}: ${cell.count} session${cell.count!==1?'s':''}`}
                    style={{ width:'11px', height:'11px', borderRadius:'3px', cursor: cell.count>0?'pointer':'default', transition:'all 0.15s', transform: isHov?'scale(1.4)':'scale(1)', border: isHov?`1px solid var(--accent)`:'1px solid transparent', background: cell.count===0 ? 'rgba(255,255,255,0.05)' : `hsla(var(--accent-h),var(--accent-s),var(--accent-l),${opacity(cell.count)})`, animation:`heatmap-cell 0.3s var(--ease-spring) ${(wi*7+di)*4}ms both`, boxShadow: isHov && cell.count>0 ? '0 0 8px var(--accent-glow)' : 'none' }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'5px', justifyContent:'flex-end', marginTop:'10px' }}>
        <span style={{ fontSize:'9px', color:'var(--text-tertiary)', fontFamily:'DM Mono,monospace', letterSpacing:'0.05em' }}>LESS</span>
        {[0,0.18,0.45,0.72,1].map((o, i) => (
          <div key={i} style={{ width:'11px', height:'11px', borderRadius:'3px', background: o===0?'rgba(255,255,255,0.05)':`hsla(var(--accent-h),var(--accent-s),var(--accent-l),${o})` }} />
        ))}
        <span style={{ fontSize:'9px', color:'var(--text-tertiary)', fontFamily:'DM Mono,monospace', letterSpacing:'0.05em' }}>MORE</span>
      </div>
      {hovered?.count > 0 && (
        <div style={{ marginTop:'12px', padding:'10px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-sm)', fontSize:'12px', color:'var(--text-secondary)', animation:'fadeIn 0.15s ease', fontFamily:'DM Mono,monospace' }}>
          <span style={{ color:'var(--text-primary)' }}>{hovered.date}</span>
          <span style={{ opacity:0.5 }}> · </span>{hovered.count} session{hovered.count!==1?'s':''}<span style={{ opacity:0.5 }}> · </span>{hovered.minutes}min
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label, icon, delay=0, accent=false }) {
  return (
    <div style={{ flex:'1 1 120px', padding:'22px 16px 18px', background: accent ? 'linear-gradient(135deg, var(--accent-dim), rgba(255,255,255,0.02))' : 'rgba(255,255,255,0.03)', border:`1px solid ${accent?'var(--accent)':'var(--border-subtle)'}`, borderRadius:'var(--radius-lg)', textAlign:'center', animation:`fadeInUp 0.5s var(--ease-out) ${delay}ms both`, transition:'all 0.2s', cursor:'default', position:'relative', overflow:'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=accent?'0 8px 30px var(--accent-glow)':'0 8px 20px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
      <div style={{ fontSize:'18px', marginBottom:'10px', opacity: accent ? 1 : 0.7 }}>{icon}</div>
      <div style={{ fontFamily:'DM Mono,monospace', fontSize:'clamp(22px,4vw,30px)', fontWeight:300, color: accent ? 'var(--accent)' : 'var(--text-primary)', marginBottom:'6px', lineHeight:1, letterSpacing:'-0.02em' }}>{value}</div>
      <div style={{ fontSize:'10px', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.12em', fontFamily:'DM Mono,monospace' }}>{label}</div>
    </div>
  );
}

const MODE_META = {
  work:   { icon:'⚡', color:'var(--accent)',  label:'Work'   },
  study:  { icon:'📖', color:'#82a8c4',        label:'Study'  },
  relax:  { icon:'🌿', color:'#a8c482',        label:'Relax'  },
  custom: { icon:'✦',  color:'#c482c4',        label:'Custom' },
};

export default function Stats({ streak, onBack }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const stats = useMemo(() => getTotalStats(), []);
  const totalSess = stats.totalSessions || 1;

  return (
    <div style={{ maxWidth:'700px', margin:'0 auto', padding:'32px 24px 64px', animation:'fadeInUp 0.5s var(--ease-out) both' }}>

      {/* Back */}
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:'8px', color:'var(--text-tertiary)', fontSize:'11px', background:'none', border:'none', cursor:'pointer', padding:'6px 0', marginBottom:'40px', fontFamily:'DM Mono,monospace', letterSpacing:'0.08em', textTransform:'uppercase', transition:'color 0.2s' }}
        onMouseEnter={e=>e.currentTarget.style.color='var(--text-primary)'}
        onMouseLeave={e=>e.currentTarget.style.color='var(--text-tertiary)'}>
        ← Back
      </button>

      {/* Header */}
      <div style={{ marginBottom:'36px' }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(36px,6vw,52px)', fontWeight:400, color:'var(--text-primary)', marginBottom:'6px', lineHeight:1.1 }}>Your Progress</h1>
        <p style={{ fontSize:'13px', color:'var(--text-tertiary)', fontFamily:'DM Mono,monospace', letterSpacing:'0.06em' }}>All time · {stats.totalSessions} sessions recorded</p>
      </div>

      {/* Streak hero */}
      <div style={{ position:'relative', padding:'28px 28px 24px', background:'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', border:'1px solid var(--accent)', borderRadius:'var(--radius-lg)', marginBottom:'24px', display:'flex', alignItems:'center', gap:'24px', animation:'fadeInScale 0.5s var(--ease-spring) both', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 20% 50%, var(--accent-glow), transparent 60%)', pointerEvents:'none' }} />
        <div style={{ fontSize:'48px', animation:'float 3s ease-in-out infinite', position:'relative' }}>🔥</div>
        <div style={{ position:'relative', flex:1 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'4px' }}>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:'clamp(32px,6vw,44px)', fontWeight:300, color:'var(--accent)', lineHeight:1 }}>{streak.current}</span>
            <span style={{ fontSize:'14px', color:'var(--text-secondary)', fontFamily:'DM Mono,monospace' }}>day streak</span>
          </div>
          <div style={{ fontSize:'12px', color:'var(--text-tertiary)', fontFamily:'DM Mono,monospace', letterSpacing:'0.06em' }}>
            Longest: {streak.longest} days · Keep it going
          </div>
        </div>
        {streak.current >= 3 && (
          <div style={{ display:'flex', gap:'3px', alignSelf:'flex-start', paddingTop:'4px' }}>
            {Array.from({length: Math.min(streak.current, 7)}).map((_,i) => (
              <div key={i} style={{ width:'4px', height: `${14 + i*4}px`, background:'var(--accent)', borderRadius:'2px', opacity: 0.3 + i*0.1, animation:`fadeInUp 0.4s var(--ease-out) ${i*60}ms both` }} />
            ))}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'24px', flexWrap:'wrap' }}>
        <StatCard value={stats.totalSessions}    label="Sessions"    icon="🎯" delay={50}  accent />
        <StatCard value={`${stats.totalHours}h`} label="Total Focus" icon="⏱" delay={100} />
        <StatCard value={stats.today}            label="Today"       icon="📅" delay={150} />
        <StatCard value={streak.longest}         label="Best Streak" icon="🏆" delay={200} />
      </div>

      {/* Mode breakdown */}
      {Object.keys(stats.byMode).length > 0 && (
        <div style={{ padding:'24px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', marginBottom:'24px', animation:'fadeInUp 0.6s var(--ease-out) 0.25s both' }}>
          <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'20px', fontWeight:400, marginBottom:'20px', color:'var(--text-primary)' }}>Focus by Mode</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {Object.entries(stats.byMode).sort((a,b)=>b[1]-a[1]).map(([mode, count]) => {
              const pct = Math.round((count / totalSess) * 100);
              const meta = MODE_META[mode] || { icon:'●', color:'var(--accent)', label: mode };
              return (
                <div key={mode}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontSize:'14px' }}>{meta.icon}</span>
                      <span style={{ fontSize:'13px', color:'var(--text-primary)', textTransform:'capitalize', fontWeight:400 }}>{meta.label}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <span style={{ fontSize:'11px', color:'var(--text-tertiary)', fontFamily:'DM Mono,monospace' }}>{count} sessions</span>
                      <span style={{ fontSize:'12px', color: meta.color, fontFamily:'DM Mono,monospace', fontWeight:500, minWidth:'34px', textAlign:'right' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background: meta.color, borderRadius:'2px', transition:'width 1.2s var(--ease-out)', boxShadow:`0 0 8px ${meta.color}44` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div style={{ padding:'24px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', marginBottom:'20px', animation:'fadeInUp 0.6s var(--ease-out) 0.3s both', overflowX:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'20px' }}>
          <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'20px', fontWeight:400, color:'var(--text-primary)' }}>Activity</h3>
          <span style={{ fontSize:'10px', color:'var(--text-tertiary)', fontFamily:'DM Mono,monospace', letterSpacing:'0.08em' }}>LAST 26 WEEKS</span>
        </div>
        <Heatmap onCellClick={setSelectedCell} />
      </div>

      {/* Selected day panel */}
      {selectedCell && (
        <div style={{ padding:'20px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border-default)', borderRadius:'var(--radius-md)', marginBottom:'20px', animation:'fadeInScale 0.3s var(--ease-spring) both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <div>
              <h4 style={{ fontSize:'14px', color:'var(--text-primary)', fontWeight:500, marginBottom:'2px' }}>{selectedCell.date}</h4>
              <p style={{ fontSize:'11px', color:'var(--text-tertiary)', fontFamily:'DM Mono,monospace' }}>{selectedCell.count} session{selectedCell.count!==1?'s':''} · {selectedCell.minutes}min total</p>
            </div>
            <button onClick={() => setSelectedCell(null)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid var(--border-subtle)', color:'var(--text-tertiary)', cursor:'pointer', width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px' }}>✕</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {selectedCell.sessions.map((s, i) => (
              <div key={i} style={{ padding:'11px 14px', background:'rgba(255,255,255,0.04)', borderRadius:'var(--radius-sm)', display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:`2px solid ${MODE_META[s.mode]?.color || 'var(--accent)'}` }}>
                <div>
                  <div style={{ fontSize:'13px', color:'var(--text-primary)', marginBottom:'2px' }}>{s.intent || 'Focus Session'}</div>
                  <div style={{ fontSize:'10px', color:'var(--text-tertiary)', fontFamily:'DM Mono,monospace', letterSpacing:'0.04em' }}>
                    {(MODE_META[s.mode]?.icon || '●')} {s.mode} · {new Date(s.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                  </div>
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'14px', color: MODE_META[s.mode]?.color || 'var(--accent)', fontWeight:500 }}>{s.duration}m</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
