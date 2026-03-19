import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ENVIRONMENTS } from '../utils/animations.js';

export default function Environment({ envKey='rain' }) {
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const prevEnvRef = useRef(null);
  const [fading, setFading] = useState(false);

  const startLoop = useCallback((renderer) => {
    cancelAnimationFrame(rafRef.current);
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const loop = (time) => {
      if(canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width  = canvas.offsetWidth  || window.innerWidth;
        canvas.height = canvas.offsetHeight || window.innerHeight;
      }
      if(canvas.width > 0 && canvas.height > 0) renderer(ctx, canvas, time);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    const env = ENVIRONMENTS[envKey] || ENVIRONMENTS.rain;
    prevEnvRef.current = envKey;
    startLoop(env.create());
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  useEffect(() => {
    if(prevEnvRef.current === null || prevEnvRef.current === envKey) return;
    prevEnvRef.current = envKey;
    setFading(true);
    const t = setTimeout(() => {
      startLoop((ENVIRONMENTS[envKey]||ENVIRONMENTS.rain).create());
      setFading(false);
    }, 550);
    return () => clearTimeout(t);
  }, [envKey, startLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas || !window.ResizeObserver) return;
    const ro = new ResizeObserver(() => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; });
    ro.observe(canvas); return () => ro.disconnect();
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" style={{ position:'fixed', inset:0, width:'100%', height:'100%', zIndex:0, opacity:fading?0:.65, transition:'opacity .55s ease', pointerEvents:'none' }}/>
      <div aria-hidden="true" style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', background:'radial-gradient(ellipse at center,transparent 30%,var(--bg-base) 100%)', opacity:.72 }}/>
    </>
  );
}

export function EnvironmentSelector({ current, onChange }) {
  return (
    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center' }}>
      {Object.entries(ENVIRONMENTS).map(([key,env]) => {
        const active = key===current;
        return (
          <button key={key} onClick={()=>onChange(key)} title={env.label}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'var(--radius-sm)', border:active?'1px solid var(--accent)':'1px solid var(--border-subtle)', background:active?'var(--accent-dim)':'var(--bg-elevated)', color:active?'var(--accent)':'var(--text-secondary)', fontSize:'12px', fontWeight:active?500:300, cursor:'pointer', transition:'all .2s var(--ease-out)' }}
            onMouseEnter={e=>{if(!active){e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.borderColor='var(--border-default)';}}}
            onMouseLeave={e=>{if(!active){e.currentTarget.style.background='var(--bg-elevated)';e.currentTarget.style.borderColor='var(--border-subtle)';}}}
          >
            <span>{env.icon}</span><span>{env.label}</span>
          </button>
        );
      })}
    </div>
  );
}
