import React, { useState, useCallback, useRef, createContext, useContext } from 'react';

const ToastContext = createContext(null);
export const useToast = () => { const c = useContext(ToastContext); if(!c) throw new Error('useToast outside ToastProvider'); return c; };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts(p => p.map(t => t.id===id ? {...t, leaving:true} : t));
    setTimeout(() => setToasts(p => p.filter(t => t.id!==id)), 380);
  }, []);

  const addToast = useCallback(({ message, type='info', duration=3500, icon }) => {
    const id = ++counter.current;
    setToasts(p => [...p, { id, message, type, icon, duration, entering:true }]);
    requestAnimationFrame(() => requestAnimationFrame(() =>
      setToasts(p => p.map(t => t.id===id ? {...t, entering:false} : t))
    ));
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const toast = {
    info:    (m,o) => addToast({message:m, type:'info',    ...o}),
    success: (m,o) => addToast({message:m, type:'success', icon:'✓', ...o}),
    warning: (m,o) => addToast({message:m, type:'warning', icon:'⚠', ...o}),
    error:   (m,o) => addToast({message:m, type:'error',   icon:'✕', ...o}),
    accent:  (m,o) => addToast({message:m, type:'accent',  ...o}),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" style={{ position:'fixed', top:'24px', right:'24px', zIndex:99998, display:'flex', flexDirection:'column', gap:'10px', pointerEvents:'none', alignItems:'flex-end' }}>
        {toasts.map(t => <ToastItem key={t.id} t={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}

const CFG = {
  info:    { border:'1px solid var(--border-default)', icon:'◈', color:'var(--text-secondary)' },
  success: { border:'1px solid rgba(117,196,146,.35)', icon:'✓', color:'var(--success)' },
  warning: { border:'1px solid rgba(224,184,117,.35)', icon:'⚠', color:'var(--warning)' },
  error:   { border:'1px solid rgba(224,117,117,.35)', icon:'✕', color:'var(--danger)' },
  accent:  { border:'1px solid var(--accent)',          icon:'◆', color:'var(--accent)' },
};

function ToastItem({ t, onDismiss }) {
  const cfg = CFG[t.type] || CFG.info;
  return (
    <div role="alert" onClick={() => onDismiss(t.id)} style={{
      pointerEvents:'all', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px',
      padding:'12px 16px', borderRadius:'var(--radius-sm)', background:'var(--surface-modal)',
      border:cfg.border, backdropFilter:'var(--blur-md)', WebkitBackdropFilter:'var(--blur-md)',
      boxShadow:'var(--shadow-md)', maxWidth:'320px', minWidth:'200px',
      position:'relative', overflow:'hidden', userSelect:'none',
      opacity: t.entering ? 0 : 1,
      animation: t.leaving ? 'toast-out .35s var(--ease-in-out) forwards' : t.entering ? 'none' : 'toast-in .35s var(--ease-out) forwards',
    }}>
      <span style={{ fontSize:'14px', color:cfg.color, flexShrink:0 }}>{t.icon || cfg.icon}</span>
      <span style={{ fontSize:'13px', fontWeight:300, color:'var(--text-primary)', lineHeight:1.45 }}>{t.message}</span>
      <div style={{ position:'absolute', bottom:0, left:0, height:'2px', background:cfg.color, opacity:.45, animationName:'toast-progress', animationDuration:`${t.duration||3500}ms`, animationTimingFunction:'linear', animationFillMode:'forwards' }} />
    </div>
  );
}
