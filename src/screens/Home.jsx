import React, { useState, useCallback, useEffect, useRef } from 'react';
import Timer from '../components/Timer.jsx';
import Controls from '../components/Controls.jsx';
import { SessionStartPopup, SessionCompletePopup, StreakMilestonePopup } from '../components/Popup.jsx';
import { useTimer, TIMER_STATES } from '../hooks/useTimer.js';
import { useToast } from '../components/Toast.jsx';
import { addSession, getTotalStats } from '../utils/storage.js';

const MODES = [
  { id:'work',   label:'Work',   icon:'⚡', desc:'Deep work',    color:'var(--accent)' },
  { id:'study',  label:'Study',  icon:'📖', desc:'Learning',     color:'#82a8c4' },
  { id:'relax',  label:'Relax',  icon:'🌿', desc:'Wind down',    color:'#a8c482' },
  { id:'custom', label:'Custom', icon:'✦',  desc:'Your rules',   color:'#c482c4' },
];

export default function Home({ settings, onSettingsChange, streak, onSessionComplete, onNavigate }) {
  const toast = useToast();
  const [activeMode,        setActiveMode]        = useState(settings.mode || 'work');
  const [intent,            setIntent]            = useState('');
  const [showStart,         setShowStart]         = useState(false);
  const [showComplete,      setShowComplete]      = useState(false);
  const [showMilestone,     setShowMilestone]     = useState(false);
  const [milestoneStreak,   setMilestoneStreak]   = useState(0);
  const [completedDuration, setCompletedDuration] = useState(25);
  const sessionStartRef = useRef(null);
  const startRef        = useRef(null);
  const settingsRef     = useRef(settings);
  settingsRef.current   = settings;

  const intentRef = useRef(intent);
  intentRef.current = intent;
  const activeModeRef = useRef(activeMode);
  activeModeRef.current = activeMode;

  const handleTimerComplete = useCallback((type, count) => {
    const s = settingsRef.current;
    const currentIntent = intentRef.current;
    const currentMode = activeModeRef.current;
    if (type === 'focus') {
      const elapsed = sessionStartRef.current
        ? Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000))
        : s.focusDuration;
      addSession({ mode: currentMode, duration: elapsed, intent: currentIntent, completed: true });
      setCompletedDuration(elapsed);
      const { milestone } = onSessionComplete();
      if (s.notifications && Notification?.permission === 'granted') {
        new Notification('Zenith — Session Complete! 🎉', {
          body: currentIntent ? `"${currentIntent}" done. Great work!` : 'Your focus session is complete!',
          icon: '/icons/icon-192.png',
        });
      }
      if (s.soundAlerts) playSound();
      if (milestone) { setMilestoneStreak(milestone); setTimeout(() => setShowMilestone(true), 600); }
      else setShowComplete(true);
      toast.success(`Session #${count} complete! +${elapsed}min focused`, { duration: 4000 });
    } else {
      toast.info('Break complete — ready to focus again', { duration: 3000 });
      if (s.autoStartFocus) setTimeout(() => { startRef.current?.(); }, 1500);
    }
  }, [onSessionComplete, toast]);

  const { timerState, displayTime, progress, sessionCount, isBreak, start, pause, resume, reset, skipBreak } = useTimer({
    focusDuration: settings.focusDuration, breakDuration: settings.breakDuration,
    longBreakDuration: settings.longBreakDuration, sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
    onComplete: handleTimerComplete,
  });
  startRef.current = start;

  const handleDirectStart = useCallback(() => {
    setShowStart(false);
    sessionStartRef.current = Date.now();
    start();
    toast.accent(intent ? `Focusing: "${intent}"` : `${activeMode.charAt(0).toUpperCase() + activeMode.slice(1)} session started`);
  }, [start, intent, activeMode, toast]);

  const handleModeChange = (id) => {
    setActiveMode(id);
    onSettingsChange({ ...settings, mode: id });
    document.documentElement.setAttribute('data-mode', id);
  };

  useEffect(() => { document.documentElement.setAttribute('data-mode', activeMode); }, [activeMode]);

  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const note = (freq, when, dur) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = 'sine';
        gain.gain.setValueAtTime(0, when);
        gain.gain.linearRampToValueAtTime(0.2, when + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
        osc.start(when); osc.stop(when + dur);
      };
      const t = ctx.currentTime;
      note(523, t, 0.4); note(659, t+0.15, 0.4); note(784, t+0.3, 0.6);
    } catch(_) {}
  };

  const isRunning    = timerState === TIMER_STATES.RUNNING;
  const isBreakState = timerState === TIMER_STATES.BREAK;
  const activeModeDef = MODES.find(m => m.id === activeMode);
  const todayStats    = getTotalStats();
  const todayMinutes  = todayStats.today > 0 ? todayStats.totalMinutes : 0; // rough; use session-accurate below
  // Accurate today minutes: sum from real storage for today
  const todayFocusMin = sessionCount > 0 ? sessionCount * settings.focusDuration : 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - var(--nav-height))', padding:'24px 24px 40px', gap:'0', position:'relative', zIndex:2 }}>

      {/* ── Mode selector ── */}
      {!isRunning && !isBreakState && (
        <div style={{ marginBottom:'40px', animation:'fadeInDown 0.6s var(--ease-out) both' }}>
          <div style={{ display:'flex', gap:'6px', padding:'5px', background:'rgba(255,255,255,0.04)', borderRadius:'var(--radius-full)', border:'1px solid var(--border-subtle)', backdropFilter:'blur(12px)' }}>
            {MODES.map(m => {
              const active = activeMode === m.id;
              return (
                <button key={m.id} onClick={() => handleModeChange(m.id)}
                  style={{ position:'relative', display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', borderRadius:'var(--radius-full)', border:'none', background: active ? 'rgba(255,255,255,0.09)' : 'transparent', color: active ? 'var(--text-primary)' : 'var(--text-tertiary)', fontSize:'12px', fontWeight: active ? 500 : 400, cursor:'pointer', transition:'all 0.25s var(--ease-out)', letterSpacing:'0.02em' }}>
                  {active && (
                    <div style={{ position:'absolute', inset:0, borderRadius:'var(--radius-full)', border:`1px solid ${m.color}`, opacity:0.5, pointerEvents:'none' }} />
                  )}
                  <span style={{ fontSize:'14px', lineHeight:1 }}>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Timer ── */}
      <div style={{ animation:'fadeInScale 0.7s var(--ease-spring) 0.1s both', marginBottom:'32px' }}>
        <Timer
          displayTime={displayTime} progress={progress}
          timerState={timerState} isBreak={isBreak}
          sessionCount={sessionCount} intent={isRunning ? intent : ''}
        />
      </div>

      {/* ── Controls ── */}
      <div style={{ marginBottom:'40px' }}>
        <Controls
          timerState={timerState}
          onStart={() => setShowStart(true)}
          onStartBreak={start}
          onPause={pause} onResume={resume} onReset={reset} onSkipBreak={skipBreak}
        />
      </div>

      {/* ── Productivity Panel ── */}
      {!isRunning && !isBreakState && (
        <div style={{ width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', gap:'10px', animation:'fadeInUp 0.6s var(--ease-out) 0.3s both' }}>

          {/* Intent card */}
          <button onClick={() => setShowStart(true)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', cursor:'pointer', textAlign:'left', transition:'all 0.25s', backdropFilter:'blur(10px)', position:'relative', overflow:'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='var(--border-subtle)'; }}>
            {intent && (
              <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px', background:'var(--accent)', borderRadius:'3px 0 0 3px', opacity:0.7 }} />
            )}
            <span style={{ fontSize:'15px', opacity: intent ? 0.9 : 0.35, flexShrink:0 }}>✦</span>
            <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'17px', fontStyle: intent ? 'italic' : 'normal', fontWeight: intent ? 400 : 300, color: intent ? 'var(--text-primary)' : 'var(--text-tertiary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
              {intent ? `"${intent}"` : 'What are you focusing on today?'}
            </span>
            <span style={{ fontSize:'9px', opacity:0.35, flexShrink:0, fontFamily:'DM Mono,monospace', letterSpacing:'0.12em' }}>SET</span>
          </button>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>

            {/* Sessions today */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px', padding:'12px 8px', background:'rgba(255,255,255,0.025)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-md)', backdropFilter:'blur(8px)' }}>
              <div style={{ display:'flex', gap:'2px', alignItems:'flex-end', height:'16px', marginBottom:'2px' }}>
                {sessionCount === 0
                  ? [.3,.5,.4,.6,.35].map((h,i)=>(
                      <div key={i} style={{ width:'3px', height:`${h*100}%`, background:'var(--border-default)', borderRadius:'2px' }} />
                    ))
                  : Array.from({length: Math.min(sessionCount, 5)}).map((_,i)=>(
                      <div key={i} style={{ width:'3px', height:`${(0.4+(i/5)*0.6)*100}%`, background:'var(--accent)', borderRadius:'2px', opacity:0.6+i*.08, animation:`fadeIn .4s var(--ease-spring) ${i*.06}s both` }} />
                    ))
                }
                {sessionCount > 5 && <span style={{ fontSize:'8px', color:'var(--accent)', fontFamily:'DM Mono,monospace', alignSelf:'flex-end' }}>+{sessionCount-5}</span>}
              </div>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:'16px', fontWeight:300, color: sessionCount > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)', lineHeight:1 }}>{sessionCount}</span>
              <span style={{ fontSize:'9px', color:'var(--text-tertiary)', letterSpacing:'0.08em', textTransform:'uppercase' }}>sessions</span>
            </div>

            {/* Focus time today */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px', padding:'12px 8px', background:'rgba(255,255,255,0.025)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-md)', backdropFilter:'blur(8px)' }}>
              <span style={{ fontSize:'14px', opacity:0.5, marginBottom:'2px' }}>⏱</span>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:'16px', fontWeight:300, color: sessionCount > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)', lineHeight:1 }}>
                {sessionCount > 0 ? `${sessionCount * settings.focusDuration}` : '0'}
              </span>
              <span style={{ fontSize:'9px', color:'var(--text-tertiary)', letterSpacing:'0.08em', textTransform:'uppercase' }}>min today</span>
            </div>

            {/* Streak */}
            <button onClick={() => onNavigate('stats')}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px', padding:'12px 8px', background: streak.current > 0 ? 'rgba(255,165,0,0.05)' : 'rgba(255,255,255,0.025)', border:`1px solid ${streak.current > 0 ? 'rgba(255,165,0,0.18)' : 'var(--border-subtle)'}`, borderRadius:'var(--radius-md)', backdropFilter:'blur(8px)', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,165,0,0.09)'; e.currentTarget.style.borderColor='rgba(255,165,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = streak.current > 0 ? 'rgba(255,165,0,0.05)' : 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = streak.current > 0 ? 'rgba(255,165,0,0.18)' : 'var(--border-subtle)'; }}>
              <span style={{ fontSize:'14px', marginBottom:'2px' }}>{streak.current > 0 ? '🔥' : '○'}</span>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:'16px', fontWeight:300, color: streak.current > 0 ? '#e0a855' : 'var(--text-tertiary)', lineHeight:1 }}>{streak.current}</span>
              <span style={{ fontSize:'9px', color:'var(--text-tertiary)', letterSpacing:'0.08em', textTransform:'uppercase' }}>day streak</span>
            </button>
          </div>

          {/* Footer pill */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 6px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)', opacity:0.5 }} />
              <span style={{ fontSize:'10px', color:'var(--text-tertiary)', fontFamily:'DM Mono,monospace', letterSpacing:'0.08em' }}>
                {activeModeDef?.icon} {activeModeDef?.desc?.toUpperCase()} · {settings.focusDuration}MIN
              </span>
            </div>
            {sessionCount > 0 && sessionCount % settings.sessionsBeforeLongBreak === 0 && (
              <span style={{ fontSize:'9px', color:'var(--warning)', fontFamily:'DM Mono,monospace', letterSpacing:'0.06em', opacity:0.8 }}>
                LONG BREAK NEXT
              </span>
            )}
            {sessionCount > 0 && sessionCount % settings.sessionsBeforeLongBreak !== 0 && (
              <span style={{ fontSize:'9px', color:'var(--text-tertiary)', fontFamily:'DM Mono,monospace', letterSpacing:'0.06em' }}>
                {settings.sessionsBeforeLongBreak - (sessionCount % settings.sessionsBeforeLongBreak)} until long break
              </span>
            )}
          </div>
        </div>
      )}

      {/* Popups */}
      <SessionStartPopup isOpen={showStart} onClose={() => setShowStart(false)} intent={intent} setIntent={setIntent} onStart={handleDirectStart} mode={activeMode} />
      <SessionCompletePopup isOpen={showComplete} onClose={() => setShowComplete(false)} onStartBreak={() => { setShowComplete(false); setShowMilestone(false); if(settings.autoStartBreak) start(); }} onStartNew={() => { setShowComplete(false); setShowMilestone(false); setShowStart(true); }} sessionCount={sessionCount} duration={completedDuration} intent={intent} />
      <StreakMilestonePopup isOpen={showMilestone} onClose={() => { setShowMilestone(false); setShowComplete(true); }} streak={milestoneStreak} />
    </div>
  );
}
