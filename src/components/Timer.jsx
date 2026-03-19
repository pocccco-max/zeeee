import React, { useEffect, useRef, useCallback } from 'react';
import { TIMER_STATES } from '../hooks/useTimer.js';

const SIZE = 280, SW = 3;
const R    = (SIZE - SW*2)/2 - 8;
const CIRC = 2 * Math.PI * R;

export default function Timer({ displayTime, progress, timerState, isBreak, sessionCount, intent }) {
  const ringRef   = useRef(null);
  const prevRef   = useRef(0);
  const rafRef    = useRef(null);

  const animateRing = useCallback((target) => {
    cancelAnimationFrame(rafRef.current);
    const start0 = prevRef.current;
    const diff   = target - start0;
    if(Math.abs(diff) < .0001) return;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min((now-t0)/800, 1);
      const eased = 1 - Math.pow(1-t, 3);
      const cur = start0 + diff*eased;
      prevRef.current = cur;
      if(ringRef.current) ringRef.current.style.strokeDashoffset = CIRC*(1-cur);
      if(t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => { animateRing(progress); }, [progress, animateRing]);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const isRunning  = timerState === TIMER_STATES.RUNNING;
  const isPaused   = timerState === TIMER_STATES.PAUSED;
  const isIdle     = timerState === TIMER_STATES.IDLE;
  const isComplete = timerState === TIMER_STATES.COMPLETE;
  const isBreakS   = timerState === TIMER_STATES.BREAK;

  const ringColor   = (isBreak||isBreakS) ? 'var(--success)' : isComplete ? 'var(--accent-hover)' : 'var(--accent)';
  const statusLabel = isBreakS ? 'Break Time' : isComplete ? 'Complete!' : isPaused ? 'Paused' : isRunning ? 'Focusing' : 'Ready';

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'24px', userSelect:'none' }}>
      <div style={{ position:'relative', width:SIZE, height:SIZE }}>
        {isRunning && (
          <div style={{ position:'absolute', inset:'-20px', borderRadius:'50%', background:'radial-gradient(circle,var(--accent-glow) 0%,transparent 70%)', animation:'pulse-glow 3s ease-in-out infinite', pointerEvents:'none' }} />
        )}
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} style={{ transform:'rotate(-90deg)' }}>
          <defs>
            <filter id="tglow"><feGaussianBlur stdDeviation="3" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
          </defs>
          <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="var(--border-subtle)" strokeWidth={SW}/>
          <circle cx={SIZE/2} cy={SIZE/2} r={R-12} fill="none" stroke="var(--border-subtle)" strokeWidth={1} strokeDasharray="4 8" opacity={.4}/>
          <circle ref={ringRef} cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={ringColor} strokeWidth={SW+1} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={CIRC}
            style={{ transition: isIdle?'stroke-dashoffset .5s ease,stroke .5s ease':'stroke .5s ease', filter:isRunning?'url(#tglow)':'none' }}
          />
          {isRunning && progress>.01 && (
            <circle
              cx={SIZE/2 + R*Math.cos(2*Math.PI*progress - Math.PI/2)}
              cy={SIZE/2 + R*Math.sin(2*Math.PI*progress - Math.PI/2)}
              r={4} fill={ringColor} style={{ filter:'url(#tglow)' }}
            />
          )}
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:'clamp(38px,7vw,52px)', fontWeight:300, color:'var(--text-primary)', letterSpacing:'-.02em', lineHeight:1, animation:isRunning?'timer-tick 1s ease-in-out infinite':'none' }}>
            {displayTime}
          </div>
          <div style={{ fontSize:'10px', letterSpacing:'.18em', textTransform:'uppercase', color:isRunning?'var(--accent)':'var(--text-tertiary)', fontWeight:400, transition:'color .4s ease' }}>
            {statusLabel}
          </div>
          {sessionCount > 0 && (
            <div style={{ display:'flex', gap:'4px', marginTop:'4px' }}>
              {Array.from({ length:Math.min(sessionCount,8) }).map((_,i) => (
                <div key={i} style={{ width:'4px', height:'4px', borderRadius:'50%', background:'var(--accent)', opacity:.7, animation:`fadeIn .3s var(--ease-spring) ${i*.05}s both` }}/>
              ))}
            </div>
          )}
        </div>
      </div>
      {intent && (
        <div style={{ maxWidth:'340px', textAlign:'center', animation:'fadeInUp .5s var(--ease-out) both' }}>
          <p style={{
            fontFamily:'Cormorant Garamond,serif',
            fontSize:'22px',
            fontStyle:'italic',
            fontWeight:400,
            color:'var(--text-primary)',
            lineHeight:1.4,
            letterSpacing:'0.01em',
            textShadow:'0 0 24px var(--accent-glow)',
            margin:0,
          }}>"{intent}"</p>
        </div>
      )}
    </div>
  );
}
