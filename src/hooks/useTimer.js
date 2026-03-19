/**
 * useTimer.js — Pomodoro + custom timer engine.
 * Fix: handleComplete stored in ref so tick() can call it without hoisting issues.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export const TIMER_STATES = { IDLE:'idle', RUNNING:'running', PAUSED:'paused', BREAK:'break', COMPLETE:'complete' };

export function useTimer({ focusDuration=25, breakDuration=5, longBreakDuration=15, sessionsBeforeLongBreak=4, onComplete, onTick }={}) {
  const [timerState, setTimerState] = useState(TIMER_STATES.IDLE);
  const [timeLeft,   setTimeLeft]   = useState(focusDuration*60);
  const [totalTime,  setTotalTime]  = useState(focusDuration*60);
  const [sessionCount, setSessionCount] = useState(0);
  const [isBreak,    setIsBreak]    = useState(false);

  const endTimeRef         = useRef(null);
  const stateRef           = useRef(TIMER_STATES.IDLE);
  const rafRef             = useRef(null);
  const timeLeftRef        = useRef(focusDuration*60);
  const totalTimeRef       = useRef(focusDuration*60);
  const isBreakRef         = useRef(false);
  const sessionCountRef    = useRef(0);
  const handleCompleteRef  = useRef(null);   // forward-ref fix

  const setState = useCallback((s) => { stateRef.current=s; setTimerState(s); }, []);

  const tick = useCallback(() => {
    if(stateRef.current !== TIMER_STATES.RUNNING) return;
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    timeLeftRef.current = remaining;
    setTimeLeft(remaining);
    onTick?.(remaining, totalTimeRef.current);
    if(remaining <= 0) { setState(TIMER_STATES.COMPLETE); handleCompleteRef.current?.(); return; }
    rafRef.current = requestAnimationFrame(tick);
  }, [onTick, setState]);

  const start = useCallback((override=null) => {
    const dur = override ?? (isBreakRef.current ? breakDuration : focusDuration);
    const total = dur*60;
    setTotalTime(total); setTimeLeft(total); timeLeftRef.current=total; totalTimeRef.current=total;
    endTimeRef.current = Date.now() + total*1000;
    setState(TIMER_STATES.RUNNING);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [breakDuration, focusDuration, tick, setState]);

  const resume = useCallback(() => {
    if(stateRef.current !== TIMER_STATES.PAUSED) return;
    endTimeRef.current = Date.now() + timeLeftRef.current*1000;
    setState(TIMER_STATES.RUNNING);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, setState]);

  const pause = useCallback(() => {
    if(stateRef.current !== TIMER_STATES.RUNNING) return;
    cancelAnimationFrame(rafRef.current); setState(TIMER_STATES.PAUSED);
  }, [setState]);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const total = (isBreakRef.current ? breakDuration : focusDuration)*60;
    setTimeLeft(total); setTotalTime(total); timeLeftRef.current=total; totalTimeRef.current=total; endTimeRef.current=null;
    setState(TIMER_STATES.IDLE);
  }, [breakDuration, focusDuration, setState]);

  const skipBreak = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    isBreakRef.current=false; setIsBreak(false);
    const total=focusDuration*60; setTimeLeft(total); setTotalTime(total); timeLeftRef.current=total; totalTimeRef.current=total;
    setState(TIMER_STATES.IDLE);
  }, [focusDuration, setState]);

  const handleComplete = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if(!isBreakRef.current) {
      const n = sessionCountRef.current+1; sessionCountRef.current=n; setSessionCount(n);
      onComplete?.('focus', n);
      const isLong = n % sessionsBeforeLongBreak === 0;
      const bDur   = isLong ? longBreakDuration : breakDuration;
      isBreakRef.current=true; setIsBreak(true);
      const total=bDur*60; setTimeLeft(total); setTotalTime(total); timeLeftRef.current=total; totalTimeRef.current=total;
      setState(TIMER_STATES.BREAK);
    } else {
      onComplete?.('break', sessionCountRef.current);
      isBreakRef.current=false; setIsBreak(false);
      const total=focusDuration*60; setTimeLeft(total); setTotalTime(total); timeLeftRef.current=total; totalTimeRef.current=total;
      setState(TIMER_STATES.IDLE);
    }
  }, [sessionsBeforeLongBreak, longBreakDuration, breakDuration, focusDuration, onComplete, setState]);

  // Keep ref current
  useEffect(() => { handleCompleteRef.current = handleComplete; }, [handleComplete]);

  // Page visibility — background persistence
  useEffect(() => {
    const handler = () => {
      if(document.visibilityState==='visible' && stateRef.current===TIMER_STATES.RUNNING) {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        timeLeftRef.current=remaining; setTimeLeft(remaining);
        if(remaining<=0){ setState(TIMER_STATES.COMPLETE); handleCompleteRef.current?.(); }
        else { cancelAnimationFrame(rafRef.current); rafRef.current=requestAnimationFrame(tick); }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [tick, setState]);

  // Sync on settings change (idle only)
  useEffect(() => {
    if(stateRef.current===TIMER_STATES.IDLE) {
      const total=(isBreakRef.current?breakDuration:focusDuration)*60;
      setTimeLeft(total); setTotalTime(total); timeLeftRef.current=total;
    }
  }, [focusDuration, breakDuration]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const progress    = totalTime > 0 ? 1 - timeLeft/totalTime : 0;
  const minutes     = Math.floor(timeLeft/60);
  const seconds     = timeLeft % 60;
  const displayTime = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;

  return { timerState, timeLeft, totalTime, progress, displayTime, minutes, seconds, sessionCount, isBreak, start, pause, resume, reset, skipBreak };
}
