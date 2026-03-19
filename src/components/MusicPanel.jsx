import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const YT_TRACKS = [
  { name:'Lofi Hip Hop Radio',    artist:'lofi girl',        emoji:'🎵', ytId:'jfKfPfyJRdk' },
  { name:'Deep Focus Beats',      artist:'Chillhop Music',   emoji:'🎧', ytId:'7NOSDKb0HlU' },
  { name:'Ambient Study Music',   artist:'Lofi Records',     emoji:'🌊', ytId:'lTRiuFIWV54' },
  { name:'Classical Focus',       artist:'Halidon Music',    emoji:'🎼', ytId:'mPZkdNFkNps' },
  { name:'Jazz Cafe Vibes',       artist:'Jazz Cafe',        emoji:'☕', ytId:'Dx5qFachd3A' },
  { name:'Rain + Piano',          artist:'Relaxing Music',   emoji:'🌧', ytId:'lCOF9LN_Zxs' },
  { name:'Dark Academia',         artist:'Study Vibes',      emoji:'📚', ytId:'OBmmMiziTRM' },
  { name:'Forest Rain Sounds',    artist:'Nature Sounds',    emoji:'🌲', ytId:'xNN7iTA57jM' },
  { name:'Brown Noise',           artist:'Focus Aid',        emoji:'🌫', ytId:'zsOEFGkmFZw' },
  { name:'Synthwave Focus',       artist:'Lofi Girl',        emoji:'🌆', ytId:'4xDzrJKXOOY' },
  { name:'Ocean Waves',           artist:'Ambient Nature',   emoji:'🌊', ytId:'bn9F19Hi1Lk' },
  { name:'Tibetan Bowls',         artist:'Meditative Mind',  emoji:'🪬', ytId:'tMGSRCBT_lI' },
  { name:'White Noise',           artist:'Relaxing White Noise', emoji:'❄', ytId:'nMfPqeZjc2c' },
  { name:'Cozy Coffee Shop',      artist:'Cafe Ambience',    emoji:'☕', ytId:'NMshABTDZTs' },
  { name:'Fireplace Crackling',   artist:'Cozy Sounds',      emoji:'🔥', ytId:'L_LUpnjgPso' },
];

// Singleton YT API loader
let ytReady = false, ytCbs = [];
function loadYT(cb) {
  if (ytReady) { cb(); return; }
  ytCbs.push(cb);
  if (document.getElementById('yt-api')) return;
  const s = document.createElement('script');
  s.id = 'yt-api'; s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
  window.onYouTubeIframeAPIReady = () => { ytReady = true; ytCbs.forEach(f => f()); ytCbs = []; };
}

// ── Dynamic Island Mini Pill ─────────────────────────────────────────────────
function DynamicIsland({ track, playing, onTogglePlay, onOpen, ready }) {
  const [hovered, setHovered] = useState(false);

  return createPortal(
    <>
      <style>{`
        @keyframes islandBeat {
          from { transform: scaleY(0.3); opacity: 0.5; }
          to   { transform: scaleY(1);   opacity: 1; }
        }
        @keyframes islandFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.92); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1); }
        }
      `}</style>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onOpen}
        title="Open music player"
        style={{
          position: 'fixed',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          cursor: 'pointer',
          width: hovered ? '264px' : '148px',
          height: '36px',
          background: hovered ? 'rgba(10,10,20,0.97)' : 'rgba(8,8,16,0.90)',
          border: '1px solid rgba(255,255,255,0.13)',
          borderRadius: '20px',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          boxShadow: playing
            ? '0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.7), 0 0 24px var(--accent-glow)'
            : '0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.7)',
          transition: 'width 0.4s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease, box-shadow 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '8px',
          animation: 'islandFadeIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
          userSelect: 'none',
        }}
      >
        {/* Waveform / paused indicator */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '2.5px',
          height: '16px',
          width: '18px',
        }}>
          {playing
            ? [0.55, 1, 0.7, 0.9, 0.5].map((h, i) => (
                <div key={i} style={{
                  width: '2px',
                  height: `${h * 100}%`,
                  background: 'var(--accent)',
                  borderRadius: '2px',
                  animation: `islandBeat ${0.48 + i * 0.09}s ease-in-out ${i * 0.06}s infinite alternate`,
                }} />
              ))
            : <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', lineHeight: 1 }}>⏸</span>
          }
        </div>

        {/* Track name */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            lineHeight: 1.3,
          }}>
            {track.emoji} {track.name}
          </span>
          {hovered && (
            <span style={{
              fontSize: '9px',
              color: 'var(--text-tertiary)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.05em',
              marginTop: '1px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {track.artist}
            </span>
          )}
        </div>

        {/* Play/Pause button — shown on hover */}
        <div style={{
          flexShrink: 0,
          width: hovered ? '26px' : '0px',
          overflow: 'hidden',
          transition: 'width 0.25s ease',
        }}>
          <button
            onClick={e => { e.stopPropagation(); onTogglePlay(); }}
            disabled={!ready}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '1px solid var(--accent)',
              background: playing ? 'var(--accent)' : 'var(--accent-dim)',
              color: playing ? 'var(--bg-base)' : 'var(--accent)',
              fontSize: '10px',
              cursor: ready ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
              opacity: ready ? 1 : 0.5,
              flexShrink: 0,
            }}
          >
            {playing ? '⏸' : '▶'}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

// ── Main MusicPanel ──────────────────────────────────────────────────────────
export default function MusicPanel({ isOpen, onClose, onOpenRequest }) {
  const [track,    setTrack]   = useState(YT_TRACKS[0]);
  const [playing,  setPlaying] = useState(false);
  const [ready,    setReady]   = useState(false);
  const [volume,   setVolume]  = useState(80);
  const [muted,    setMuted]   = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [inited,   setInited]  = useState(false);

  const panelRef    = useRef(null);
  const player      = useRef(null);
  const trackRef    = useRef(track);
  const doSwitchRef = useRef(null);
  const volumeRef   = useRef(80);
  trackRef.current = track;
  volumeRef.current = volume;

  // Persistent off-screen container so YT player NEVER gets removed from DOM
  const container = useRef(null);
  useEffect(() => {
    const div = document.createElement('div');
    div.id = 'yt-persistent-root';
    div.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px;left:-9999px;overflow:hidden;';
    document.body.appendChild(div);
    container.current = div;
    return () => { document.body.removeChild(div); };
  }, []);

  // Init YT player once on first open
  useEffect(() => {
    if (!isOpen || inited) return;
    setInited(true);
    loadYT(() => {
      const el = document.createElement('div');
      container.current?.appendChild(el);
      player.current = new window.YT.Player(el, {
        height: '1', width: '1',
        videoId: trackRef.current.ytId,
        playerVars: { autoplay:0, controls:0, disablekb:1, fs:0, iv_load_policy:3, modestbranding:1, rel:0, playsinline:1 },
        events: {
          onReady: e => { e.target.setVolume(volumeRef.current); setReady(true); },
          onStateChange: e => setPlaying(e.data === window.YT.PlayerState.PLAYING),
          onError: () => {
            const i = YT_TRACKS.findIndex(t => t.ytId === trackRef.current.ytId);
            doSwitchRef.current?.(YT_TRACKS[(i + 1) % YT_TRACKS.length]);
          },
        },
      });
    });
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => () => { player.current?.destroy(); player.current = null; }, []);

  // Click-outside close
  useEffect(() => {
    const h = e => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.(); };
    if (isOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen, onClose]);

  const doSwitch = useCallback((t) => {
    setTrack(t);
    player.current?.loadVideoById?.(t.ytId);
    setPlaying(true);
  }, []);
  doSwitchRef.current = doSwitch;

  const togglePlay = useCallback(() => {
    if (!ready) return;
    playing ? player.current.pauseVideo() : player.current.playVideo();
  }, [ready, playing]);

  const handleVol = useCallback(v => {
    setVolume(v);
    player.current?.setVolume(v);
    if (v > 0 && muted) { setMuted(false); player.current?.unMute(); }
  }, [muted]);

  const toggleMute = useCallback(() => {
    if (!player.current) return;
    if (muted) { player.current.unMute(); player.current.setVolume(volume); setMuted(false); }
    else { player.current.mute(); setMuted(true); }
  }, [muted, volume]);

  const nav = useCallback(d => {
    const i = YT_TRACKS.findIndex(t => t.ytId === track.ytId);
    doSwitch(YT_TRACKS[(i + d + YT_TRACKS.length) % YT_TRACKS.length]);
  }, [track, doSwitch]);

  // Show island when music is playing AND panel is closed
  const showIsland = playing && !isOpen;

  return (
    <>
      {showIsland && (
        <DynamicIsland
          track={track}
          playing={playing}
          onTogglePlay={togglePlay}
          onOpen={() => onOpenRequest?.()}
          ready={ready}
        />
      )}

      {isOpen && (
        <div ref={panelRef} style={{
          position:'fixed', bottom:'calc(var(--nav-height, 56px) + 16px)', right:'16px',
          width:'min(340px, calc(100vw - 32px))',
          maxHeight:'min(580px, calc(100vh - var(--nav-height, 56px) - 32px))',
          background:'var(--surface-modal)', border:'1px solid var(--border-default)',
          borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-lg)',
          backdropFilter:'var(--blur-lg)', WebkitBackdropFilter:'var(--blur-lg)',
          zIndex:8000, animation:'slideInBottom 0.35s var(--ease-spring) both',
          overflow:'hidden', display:'flex', flexDirection:'column',
        }}>

          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px 11px',borderBottom:'1px solid var(--border-subtle)',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
              <span style={{fontSize:'13px',color:'#ff0000'}}>▶</span>
              <span style={{fontSize:'11px',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-secondary)'}}>YouTube Music</span>
              {playing && <span style={{fontSize:'9px',color:'var(--success)',opacity:.85}}>● LIVE</span>}
            </div>
            <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
              <button onClick={()=>setExpanded(x=>!x)} title={expanded?'Hide video':'Show video'}
                style={{background:'none',border:'none',color:'var(--text-tertiary)',cursor:'pointer',fontSize:'13px',padding:'2px 5px',borderRadius:'4px'}}>
                {expanded?'⊟':'⊞'}
              </button>
              <button onClick={onClose} style={{width:'24px',height:'24px',borderRadius:'50%',border:'1px solid var(--border-subtle)',background:'var(--bg-elevated)',color:'var(--text-tertiary)',fontSize:'11px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
          </div>

          {/* Expanded video hint */}
          <div style={{flexShrink:0,overflow:'hidden',background:'#000',height:expanded?'60px':'0px',transition:'height 0.3s ease'}}>
            {expanded && (
              <div style={{width:'100%',height:'60px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:'10px',color:'rgba(255,255,255,0.25)',fontFamily:'DM Mono,monospace',letterSpacing:'0.06em'}}>
                  🎧 audio playing in background
                </span>
              </div>
            )}
          </div>

          {/* Track info */}
          <div style={{padding:'14px 16px 0',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
              <span style={{fontSize:'22px'}}>{track.emoji}</span>
              <div style={{flex:1,overflow:'hidden'}}>
                <div style={{fontSize:'13px',fontWeight:500,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{track.name}</div>
                <div style={{fontSize:'11px',color:'var(--text-tertiary)',marginTop:'2px'}}>{track.artist}</div>
              </div>
              <a href={`https://www.youtube.com/watch?v=${track.ytId}`} target="_blank" rel="noopener noreferrer"
                title="Open in YouTube"
                style={{color:'#ff0000',fontSize:'15px',textDecoration:'none',opacity:.65,transition:'opacity .15s'}}
                onMouseEnter={e=>e.currentTarget.style.opacity=1}
                onMouseLeave={e=>e.currentTarget.style.opacity=.65}>↗</a>
            </div>

            {/* Controls */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'20px',marginBottom:'14px'}}>
              <button onClick={()=>nav(-1)} style={{background:'none',border:'none',color:'var(--text-secondary)',cursor:'pointer',fontSize:'18px'}}>⏮</button>
              <button onClick={togglePlay} disabled={!ready}
                style={{width:'46px',height:'46px',borderRadius:'50%',border:'1.5px solid var(--accent)',background:playing?'var(--accent)':'var(--accent-dim)',color:playing?'var(--bg-base)':'var(--accent)',fontSize:'16px',cursor:ready?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',boxShadow:'0 0 20px var(--accent-glow)',opacity:ready?1:.55}}>
                {!ready?'⏳':playing?'⏸':'▶'}
              </button>
              <button onClick={()=>nav(1)} style={{background:'none',border:'none',color:'var(--text-secondary)',cursor:'pointer',fontSize:'18px'}}>⏭</button>
            </div>

            {/* Volume */}
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
              <button onClick={toggleMute} style={{background:'none',border:'none',cursor:'pointer',fontSize:'13px',color:'var(--text-tertiary)',width:'20px',padding:0}}>
                {muted||volume===0?'🔇':volume<40?'🔈':'🔊'}
              </button>
              <input type="range" min="0" max="100" step="1" value={muted?0:volume}
                onChange={e=>handleVol(Number(e.target.value))} style={{flex:1}} />
              <span style={{fontSize:'10px',color:'var(--text-tertiary)',fontFamily:'DM Mono,monospace',width:'26px',textAlign:'right'}}>{muted?0:volume}</span>
            </div>
          </div>

          {/* Station list */}
          <div style={{padding:'0 16px 16px',overflowY:'auto',flex:1,minHeight:0}}>
            <p style={{fontSize:'10px',color:'var(--text-tertiary)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'8px'}}>Stations</p>
            <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
              {YT_TRACKS.map(t => {
                const active = t.ytId === track.ytId;
                return (
                  <button key={t.ytId} onClick={()=>doSwitch(t)}
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',borderRadius:'var(--radius-sm)',border:`1px solid ${active?'var(--accent)':'transparent'}`,background:active?'var(--accent-dim)':'var(--bg-elevated)',cursor:'pointer',transition:'all 0.15s',textAlign:'left',width:'100%'}}
                    onMouseEnter={e=>{if(!active)e.currentTarget.style.background='var(--bg-hover)';}}
                    onMouseLeave={e=>{if(!active)e.currentTarget.style.background='var(--bg-elevated)';}}>
                    <span style={{fontSize:'16px'}}>{t.emoji}</span>
                    <div style={{flex:1,overflow:'hidden'}}>
                      <div style={{fontSize:'12px',fontWeight:active?500:400,color:active?'var(--accent)':'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</div>
                      <div style={{fontSize:'10px',color:'var(--text-tertiary)'}}>{t.artist}</div>
                    </div>
                    {active && playing && (
                      <div style={{display:'flex',gap:'2px',alignItems:'flex-end',height:'14px'}}>
                        {[.5,1,.7,.9].map((h,i)=>(
                          <div key={i} style={{width:'2px',height:`${h*100}%`,background:'var(--accent)',borderRadius:'1px',animation:`breathe ${.5+i*.1}s ease-in-out ${i*.07}s infinite alternate`}} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
