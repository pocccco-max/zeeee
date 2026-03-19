import React, { useState, useEffect, useCallback } from 'react';
import Home     from './screens/Home.jsx';
import Stats    from './screens/Stats.jsx';
import Settings from './screens/Settings.jsx';
import Environment  from './components/Environment.jsx';
import MusicPanel   from './components/MusicPanel.jsx';
import { ToastProvider, useToast } from './components/Toast.jsx';
import { getSettings, saveSettings, clearAll } from './utils/storage.js';
import { useStreak } from './hooks/useStreak.js';

function NavBtn({ onClick, active, label, icon }) {
  return (
    <button onClick={onClick} title={label} aria-label={label}
      style={{ width:'38px', height:'38px', borderRadius:'var(--radius-sm)', border: active?'1px solid var(--accent)':'1px solid transparent', background: active?'var(--accent-dim)':'transparent', color: active?'var(--accent)':'var(--text-secondary)', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s var(--ease-out)' }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text-primary)'; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; } }}>
      {icon}
    </button>
  );
}

function NavBar({ screen, onNavigate, onMusicToggle, musicOpen, onInstallClick, installable }) {
  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, height:'var(--nav-height)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', background: screen!=='home'?'var(--surface-glass)':'transparent', backdropFilter: screen!=='home'?'var(--blur-md)':'none', WebkitBackdropFilter: screen!=='home'?'var(--blur-md)':'none', borderBottom: screen!=='home'?'1px solid var(--border-subtle)':'none', transition:'all 0.4s ease' }}>
      <button onClick={() => onNavigate('home')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'baseline', gap:'6px' }}>
        <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'22px', fontWeight:400, color:'var(--accent)', letterSpacing:'0.06em' }}>Zenith</span>
        <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', fontWeight:300, color:'var(--text-tertiary)', letterSpacing:'0.1em' }}>FOCUS</span>
      </button>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <NavBtn onClick={onMusicToggle}                active={musicOpen}           label="Music"    icon="♫" />
        <NavBtn onClick={() => onNavigate('stats')}    active={screen==='stats'}    label="Stats"    icon="◈" />
        <NavBtn onClick={() => onNavigate('settings')} active={screen==='settings'} label="Settings" icon="⚙" />
        {installable && <NavBtn onClick={onInstallClick} label="Install App" icon="↓" />}
      </div>
    </nav>
  );
}

function AppInner() {
  const [screen,          setScreen]          = useState('home');
  const [settings,        setSettings]        = useState(() => getSettings());
  const [musicOpen,       setMusicOpen]       = useState(false);
  const [deferredPrompt,  setDeferredPrompt]  = useState(null);
  const toast  = useToast();
  const streak = useStreak();

  // Theme
  useEffect(() => {
    const apply = (t) => {
      if (t === 'dynamic') {
        document.documentElement.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', t);
      }
    };
    apply(settings.theme);
    if (settings.theme === 'dynamic') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const h  = (e) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', h);
      return () => mq.removeEventListener('change', h);
    }
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', settings.mode || 'work');
  }, [settings.mode]);

  // PWA install
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') toast.success('Zenith installed! Enjoy your focus sessions.');
    setDeferredPrompt(null);
  };

  const handleSettingsChange = useCallback((next) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const handleSessionComplete = useCallback(() => streak.recordSession(), [streak]);

  const handleClearData = () => {
    clearAll();
    streak.refreshStreak();
    setSettings(getSettings());
    setScreen('home');
    toast.info('All data cleared.');
  };

  return (
    <>
      <Environment envKey={settings.environment || 'rain'} />
      <div className="grain-overlay" aria-hidden="true" />
      <NavBar
        screen={screen} onNavigate={setScreen}
        onMusicToggle={() => setMusicOpen((o) => !o)} musicOpen={musicOpen}
        onInstallClick={handleInstall} installable={!!deferredPrompt}
      />
      <MusicPanel isOpen={musicOpen} onClose={() => setMusicOpen(false)} onOpenRequest={() => setMusicOpen(true)} />
      <main style={{ paddingTop:'var(--nav-height)', position:'relative', zIndex:2, minHeight:'100vh' }}>
        {screen === 'home'     && <Home settings={settings} onSettingsChange={handleSettingsChange} streak={streak} onSessionComplete={handleSessionComplete} onNavigate={setScreen} />}
        {screen === 'stats'    && <Stats streak={streak} onBack={() => setScreen('home')} />}
        {screen === 'settings' && <Settings settings={settings} onSettingsChange={handleSettingsChange} onBack={() => setScreen('home')} onClearData={handleClearData} />}
      </main>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
