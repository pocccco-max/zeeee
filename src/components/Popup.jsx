import React, { useEffect, useRef, useState } from 'react';
import { createConfettiBurst } from '../utils/animations.js';

/* ── Base Modal ── */
export function Modal({ isOpen, onClose, children, size='md', noDismiss=false }) {
  const [visible,  setVisible]  = useState(false);
  const [leaving,  setLeaving]  = useState(false);
  const backdropRef = useRef(null);

  useEffect(() => {
    if(isOpen)       { setLeaving(false); setVisible(true); }
    else if(visible) { setLeaving(true); const t=setTimeout(()=>setVisible(false),400); return ()=>clearTimeout(t); }
  }, [isOpen, visible]);

  useEffect(() => {
    const h = (e) => { if(e.key==='Escape' && !noDismiss) onClose?.(); };
    if(visible) document.addEventListener('keydown',h);
    return () => document.removeEventListener('keydown',h);
  }, [visible, noDismiss, onClose]);

  if(!visible) return null;
  const maxW = {sm:'360px',md:'480px',lg:'600px'}[size]||'480px';

  return (
    <div ref={backdropRef} onClick={e=>{if(!noDismiss&&e.target===backdropRef.current)onClose?.();}}
      style={{ position:'fixed', inset:0, zIndex:9990, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', background:'rgba(0,0,0,.55)', backdropFilter:leaving?'blur(0px)':'blur(12px)', WebkitBackdropFilter:leaving?'blur(0px)':'blur(12px)', animation:leaving?'fadeOut .35s var(--ease-in-out) forwards':'fadeIn .25s ease forwards' }}>
      <div style={{ width:'100%', maxWidth:maxW, background:'var(--surface-modal)', border:'1px solid var(--border-default)', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-lg)', overflow:'hidden', animation:leaving?'fadeInScale .3s var(--ease-in-out) reverse forwards':'fadeInScale .35s var(--ease-spring) both' }}>
        {children}
      </div>
    </div>
  );
}

/* ── Session Start ── */
export function SessionStartPopup({ isOpen, onClose, intent, setIntent, onStart, mode }) {
  const inputRef = useRef(null);
  useEffect(() => { if(isOpen) setTimeout(()=>inputRef.current?.focus(),200); }, [isOpen]);
  const icons = { work:'⚡', study:'📖', relax:'🌿', custom:'✦' };
  const labels= { work:'Work', study:'Study', relax:'Relax', custom:'Custom' };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ padding:'40px 36px 32px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--accent-dim)', border:'1px solid var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'22px', animation:'float 3s ease-in-out infinite' }}>
            {icons[mode]||'⚡'}
          </div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'26px', fontWeight:400, color:'var(--text-primary)', marginBottom:'6px' }}>Ready to focus?</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'13px', fontWeight:300 }}>{labels[mode]} session · Set your intention</p>
        </div>
        <div style={{ marginBottom:'28px' }}>
          <label style={{ display:'block', fontSize:'11px', fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:'8px' }}>What are you focusing on?</label>
          <input ref={inputRef} type="text" value={intent} onChange={e=>setIntent(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onStart()} placeholder="e.g. Write the intro chapter..."
            style={{ width:'100%', fontSize:'14px', fontWeight:300, padding:'12px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-default)', borderRadius:'var(--radius-sm)', color:'var(--text-primary)', outline:'none', transition:'border-color .2s,box-shadow .2s' }}
            onFocus={e=>{e.target.style.borderColor='var(--accent)';e.target.style.boxShadow='0 0 0 3px var(--accent-dim)';}}
            onBlur={e=>{e.target.style.borderColor='var(--border-default)';e.target.style.boxShadow='none';}}
          />
        </div>
        <div style={{ display:'flex', gap:'12px' }}>
          <button onClick={onClose} style={{ flex:1, padding:'13px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-default)', background:'transparent', color:'var(--text-secondary)', fontSize:'13px', cursor:'pointer', transition:'all .2s' }}
            onMouseEnter={e=>e.target.style.background='var(--bg-hover)'} onMouseLeave={e=>e.target.style.background='transparent'}>Cancel</button>
          <button onClick={onStart} style={{ flex:2, padding:'13px', borderRadius:'var(--radius-sm)', border:'1px solid var(--accent)', background:'var(--accent-dim)', color:'var(--accent)', fontSize:'14px', fontWeight:500, cursor:'pointer', transition:'all .2s', boxShadow:'0 0 20px var(--accent-glow)' }}
            onMouseEnter={e=>{e.target.style.background='var(--accent)';e.target.style.color='var(--text-inverse)';}}
            onMouseLeave={e=>{e.target.style.background='var(--accent-dim)';e.target.style.color='var(--accent)';}}>Begin Session →</button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Session Complete ── */
export function SessionCompletePopup({ isOpen, onClose, onStartBreak, onStartNew, sessionCount, duration, intent }) {
  useEffect(() => { if(isOpen) setTimeout(()=>createConfettiBurst(document.body,45),200); }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} noDismiss>
      <div style={{ padding:'44px 36px 36px', textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'20px', animation:'streak-pop .7s var(--ease-spring) both .1s', display:'inline-block' }}>🏆</div>
        <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'30px', fontWeight:400, color:'var(--text-primary)', marginBottom:'8px', animation:'fadeInUp .5s var(--ease-out) .2s both' }}>Session Complete</h2>
        {intent && <p style={{ color:'var(--accent)', fontSize:'13px', fontWeight:300, marginBottom:'4px', fontStyle:'italic', animation:'fadeInUp .5s var(--ease-out) .3s both' }}>"{intent}"</p>}
        <p style={{ color:'var(--text-secondary)', fontSize:'13px', marginBottom:'28px', animation:'fadeInUp .5s var(--ease-out) .35s both' }}>{duration} min focus · Session #{sessionCount}</p>
        <div style={{ display:'flex', gap:'1px', background:'var(--border-subtle)', borderRadius:'var(--radius-sm)', overflow:'hidden', marginBottom:'24px', animation:'fadeInUp .5s var(--ease-out) .4s both' }}>
          {[{label:'Duration',value:`${duration}m`},{label:'Session',value:`#${sessionCount}`}].map(s=>(
            <div key={s.label} style={{ flex:1, padding:'16px', background:'var(--bg-elevated)' }}>
              <div style={{ fontSize:'18px', fontFamily:'DM Mono,monospace', fontWeight:300, color:'var(--accent)', marginBottom:'4px' }}>{s.value}</div>
              <div style={{ fontSize:'11px', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px', animation:'fadeInUp .5s var(--ease-out) .5s both' }}>
          <button onClick={onStartBreak} style={{ width:'100%', padding:'13px', borderRadius:'var(--radius-sm)', border:'1px solid var(--accent)', background:'var(--accent-dim)', color:'var(--accent)', fontSize:'14px', cursor:'pointer', transition:'all .2s', boxShadow:'0 0 20px var(--accent-glow)' }}>Take a Break →</button>
          <button onClick={onStartNew}   style={{ width:'100%', padding:'13px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-default)', background:'transparent', color:'var(--text-secondary)', fontSize:'13px', cursor:'pointer', transition:'all .2s' }}>Start Another Session</button>
          <button onClick={onClose}      style={{ width:'100%', padding:'10px', background:'transparent', border:'none', color:'var(--text-tertiary)', fontSize:'12px', cursor:'pointer' }}>Done for now</button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Streak Milestone ── */
export function StreakMilestonePopup({ isOpen, onClose, streak }) {
  useEffect(() => { if(isOpen) setTimeout(()=>createConfettiBurst(document.body,60),100); }, [isOpen]);
  const msg = (n) => n>=100?'Legendary focus. Truly unstoppable.':n>=30?'A full month of consistency. Remarkable.':n>=14?'Two solid weeks. The habit is yours.':n>=7?"A full week streak! You're building momentum.":n>=3?"Three days in a row. You're on a roll!":'Consistency is building!';
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ padding:'44px 36px 36px', textAlign:'center' }}>
        <div style={{ fontSize:'56px', marginBottom:'16px', animation:'streak-pop .8s var(--ease-spring) both', display:'inline-block' }}>🔥</div>
        <div style={{ fontFamily:'DM Mono,monospace', fontSize:'52px', fontWeight:300, color:'var(--accent)', lineHeight:1, marginBottom:'8px', animation:'fadeInScale .5s var(--ease-spring) .15s both' }}>{streak}</div>
        <p style={{ fontSize:'11px', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:'16px' }}>Day Streak</p>
        <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'22px', fontWeight:400, color:'var(--text-primary)', marginBottom:'8px' }}>Milestone Reached!</h3>
        <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginBottom:'28px', lineHeight:1.5 }}>{msg(streak)}</p>
        <button onClick={onClose} style={{ padding:'12px 32px', borderRadius:'var(--radius-sm)', border:'1px solid var(--accent)', background:'var(--accent-dim)', color:'var(--accent)', fontSize:'13px', cursor:'pointer', boxShadow:'0 0 20px var(--accent-glow)' }}>Keep Going 🔥</button>
      </div>
    </Modal>
  );
}
