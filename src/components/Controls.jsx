import React, { useRef } from 'react';
import { TIMER_STATES } from '../hooks/useTimer.js';
import { createRipple } from '../utils/animations.js';

const PlayIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72L19 12z"/></svg>;
const PauseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const ResetIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>;
const SkipIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>;

function Btn({ onClick, children, primary, disabled, label, small }) {
  const ref = useRef(null);
  const click = (e) => { if(disabled) return; createRipple(e, ref.current); onClick?.(); };
  if(primary) return (
    <button ref={ref} onClick={click} disabled={disabled} aria-label={label}
      style={{ position:'relative', width:'72px', height:'72px', borderRadius:'50%', border:'1.5px solid var(--accent)', background:'var(--accent-dim)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', cursor:disabled?'not-allowed':'pointer', opacity:disabled?.4:1, transition:'all .2s var(--ease-out)', boxShadow:'0 0 30px var(--accent-glow),var(--shadow-inset)', overflow:'hidden' }}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.background='var(--accent)';e.currentTarget.style.color='var(--bg-base)';e.currentTarget.style.boxShadow='0 0 50px var(--accent-glow)';}}}
      onMouseLeave={e=>{e.currentTarget.style.background='var(--accent-dim)';e.currentTarget.style.color='var(--accent)';e.currentTarget.style.boxShadow='0 0 30px var(--accent-glow),var(--shadow-inset)';}}
    >{children}</button>
  );
  return (
    <button ref={ref} onClick={click} disabled={disabled} aria-label={label}
      style={{ position:'relative', width:small?'40px':'48px', height:small?'40px':'48px', borderRadius:'50%', border:'1px solid var(--border-default)', background:'var(--bg-elevated)', color:'var(--text-secondary)', display:'flex', alignItems:'center', justifyContent:'center', cursor:disabled?'not-allowed':'pointer', opacity:disabled?.3:1, transition:'all .2s var(--ease-out)', overflow:'hidden' }}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.borderColor='var(--border-strong)';e.currentTarget.style.color='var(--text-primary)';}}}
      onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-elevated)';e.currentTarget.style.borderColor='var(--border-default)';e.currentTarget.style.color='var(--text-secondary)';}}
    >{children}</button>
  );
}

export default function Controls({ timerState, onStart, onStartBreak, onPause, onResume, onReset, onSkipBreak }) {
  const isIdle    = timerState === TIMER_STATES.IDLE;
  const isRunning = timerState === TIMER_STATES.RUNNING;
  const isPaused  = timerState === TIMER_STATES.PAUSED;
  const isBreakS  = timerState === TIMER_STATES.BREAK;
  const isComplete= timerState === TIMER_STATES.COMPLETE;

  const primary = () => {
    if(isIdle||isComplete) return onStart();
    if(isRunning)  return onPause();
    if(isPaused)   return onResume();
    if(isBreakS)   return (onStartBreak || onStart)();
  };

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'20px', animation:'fadeInUp .6s var(--ease-out) .2s both' }}>
      <div style={{ opacity:isIdle?0:1, pointerEvents:isIdle?'none':'auto', transition:'opacity .3s' }}>
        <Btn onClick={onReset} disabled={isIdle} label="Reset" small><ResetIcon/></Btn>
      </div>
      <Btn primary onClick={primary} label={isRunning?'Pause':isPaused?'Resume':isBreakS?'Start Break':'Start'}>
        {isRunning ? <PauseIcon/> : <PlayIcon/>}
      </Btn>
      <div style={{ opacity:isBreakS?1:0, pointerEvents:isBreakS?'auto':'none', transition:'opacity .3s' }}>
        <Btn onClick={onSkipBreak} disabled={!isBreakS} label="Skip break" small><SkipIcon/></Btn>
      </div>
    </div>
  );
}
