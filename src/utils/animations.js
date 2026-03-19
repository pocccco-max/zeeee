/**
 * animations.js — Canvas ambient renderers, easing helpers, confetti, ripple.
 */

export const rand      = (a,b) => Math.random()*(b-a)+a;
export const randInt   = (a,b) => Math.floor(rand(a,b+1));
export const randChoice= (arr) => arr[randInt(0,arr.length-1)];

/* ── Rain ─────────────────────────────────────────────────────── */
export function createRainRenderer() {
  const drops = []; let lw=0,lh=0;
  const init = (w,h) => { drops.length=0; for(let i=0;i<120;i++) drops.push({x:rand(0,w),y:rand(-h,h),len:rand(15,60),speed:rand(8,20),op:rand(.1,.45),wd:rand(.5,1.5)}); };
  return (ctx,canvas) => {
    const {width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(8,8,20,0)'); g.addColorStop(1,'rgba(12,18,32,.35)');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    drops.forEach(d=>{ ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(d.x-d.len*.15,d.y+d.len); ctx.strokeStyle=`rgba(140,180,220,${d.op})`; ctx.lineWidth=d.wd; ctx.stroke(); d.y+=d.speed; if(d.y>h+60){d.y=rand(-100,-10);d.x=rand(0,w);} });
  };
}

/* ── Café ─────────────────────────────────────────────────────── */
export function createCafeRenderer() {
  const pts=[]; let lw=0,lh=0;
  const init=(w,h)=>{ pts.length=0; for(let i=0;i<40;i++) pts.push({x:rand(0,w),y:rand(0,h),r:rand(.5,2.5),vx:rand(-.15,.15),vy:rand(-.3,-.08),op:rand(.05,.2),life:rand(0,1)}); };
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    [[w*.2,h*.3,180],[w*.7,h*.15,120],[w*.5,h*.7,200]].forEach(([bx,by,br])=>{ const g=ctx.createRadialGradient(bx,by,0,bx,by,br); g.addColorStop(0,'rgba(255,200,120,.06)'); g.addColorStop(1,'rgba(255,200,120,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); });
    pts.forEach(p=>{ p.x+=p.vx+Math.sin(time*.001+p.life*10)*.05; p.y+=p.vy; p.life+=.003; const a=p.op*Math.sin(p.life*Math.PI); if(a>0){ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,220,160,${a})`;ctx.fill();} if(p.y<-10||p.life>=1){p.y=h+10;p.x=rand(0,w);p.life=0;} });
  };
}

/* ── Forest ───────────────────────────────────────────────────── */
export function createForestRenderer() {
  const leaves=[]; let lw=0,lh=0;
  const init=(w,h)=>{ leaves.length=0; for(let i=0;i<35;i++) leaves.push({x:rand(0,w),y:rand(-50,h),size:rand(4,12),vx:rand(-.5,.5),vy:rand(.3,1.2),rot:rand(0,Math.PI*2),rs:rand(-.02,.02),op:rand(.1,.35),hue:randInt(100,145)}); };
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    const g=ctx.createRadialGradient(w*.5,0,0,w*.5,0,h*.9); g.addColorStop(0,'rgba(120,180,80,.08)'); g.addColorStop(1,'rgba(30,60,20,.25)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    leaves.forEach(l=>{ l.x+=l.vx+Math.sin(time*.0008+l.y*.01)*.3; l.y+=l.vy; l.rot+=l.rs; ctx.save(); ctx.translate(l.x,l.y); ctx.rotate(l.rot); ctx.globalAlpha=l.op; ctx.fillStyle=`hsl(${l.hue},60%,38%)`; ctx.beginPath(); ctx.ellipse(0,0,l.size,l.size*.5,0,0,Math.PI*2); ctx.fill(); ctx.restore(); if(l.y>h+30){l.y=-30;l.x=rand(0,w);} });
  };
}

/* ── Night ────────────────────────────────────────────────────── */
export function createNightRenderer() {
  const stars=[]; let lw=0,lh=0;
  const init=(w,h)=>{ stars.length=0; for(let i=0;i<180;i++) stars.push({x:rand(0,w),y:rand(0,h*.75),r:rand(.3,2.2),base:rand(.2,.9),ts:rand(.5,2.5),to:rand(0,Math.PI*2)}); };
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    const sky=ctx.createLinearGradient(0,0,0,h); sky.addColorStop(0,'rgba(5,5,20,.6)'); sky.addColorStop(1,'rgba(8,12,40,.2)'); ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
    const mg=ctx.createRadialGradient(w*.78,h*.12,0,w*.78,h*.12,120); mg.addColorStop(0,'rgba(220,220,255,.12)'); mg.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=mg; ctx.fillRect(0,0,w,h);
    const t=time*.001;
    stars.forEach(s=>{ const f=s.base*(.6+.4*Math.sin(t*s.ts+s.to)); ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`rgba(240,240,255,${f})`; ctx.fill(); });
  };
}

/* ── Minimal ──────────────────────────────────────────────────── */
export function createMinimalRenderer() {
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    ctx.clearRect(0,0,w,h);
    const p=time*.00025;
    [[w*.3,h*.4,w*.35,220],[w*.7,h*.6,w*.3,260]].forEach(([x,y,r,hue],i)=>{ const pulse=1+.06*Math.sin(p+i*Math.PI); const g=ctx.createRadialGradient(x,y,0,x,y,r*pulse); g.addColorStop(0,`hsla(${hue},40%,50%,.07)`); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); });
  };
}

/* ── Ocean ────────────────────────────────────────────────────── */
export function createOceanRenderer() {
  const bubbles=[]; let lw=0,lh=0;
  const init=(w,h)=>{ bubbles.length=0; for(let i=0;i<50;i++) bubbles.push({x:rand(0,w),y:rand(0,h),r:rand(1,5),vy:rand(-.4,-.12),vx:rand(-.08,.08),op:rand(.04,.18),wobble:rand(0,Math.PI*2),ws:rand(.01,.03)}); };
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(0,40,80,.18)'); g.addColorStop(1,'rgba(0,80,120,.06)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    // Slow horizontal wave bands
    for(let i=0;i<3;i++){
      const y=h*(.25+i*.25)+Math.sin(time*.0004+i*2.1)*18;
      const wg=ctx.createLinearGradient(0,y-30,0,y+30); wg.addColorStop(0,'rgba(40,160,200,0)'); wg.addColorStop(.5,`rgba(40,160,200,${.04-i*.008})`); wg.addColorStop(1,'rgba(40,160,200,0)');
      ctx.fillStyle=wg; ctx.fillRect(0,y-30,w,60);
    }
    bubbles.forEach(b=>{ b.x+=b.vx+Math.sin(time*.0006+b.wobble)*0.3; b.y+=b.vy; b.wobble+=b.ws; if(b.y<-10){b.y=h+10;b.x=rand(0,w);} ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.strokeStyle=`rgba(100,200,240,${b.op})`; ctx.lineWidth=.8; ctx.stroke(); });
  };
}

/* ── Snow ─────────────────────────────────────────────────────── */
export function createSnowRenderer() {
  const flakes=[]; let lw=0,lh=0;
  const init=(w,h)=>{ flakes.length=0; for(let i=0;i<90;i++) flakes.push({x:rand(0,w),y:rand(-h,h),r:rand(.8,3.5),vx:rand(-.3,.3),vy:rand(.3,1.1),op:rand(.1,.5),drift:rand(0,Math.PI*2),ds:rand(.005,.015)}); };
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(160,180,220,.08)'); g.addColorStop(1,'rgba(80,100,160,.04)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    flakes.forEach(f=>{ f.drift+=f.ds; f.x+=f.vx+Math.sin(f.drift)*.4; f.y+=f.vy; if(f.y>h+10){f.y=-10;f.x=rand(0,w);} ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fillStyle=`rgba(220,235,255,${f.op})`; ctx.fill(); });
  };
}

/* ── Aurora ───────────────────────────────────────────────────── */
export function createAuroraRenderer() {
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    ctx.clearRect(0,0,w,h);
    const t=time*.0003;
    const bands=[
      {y:.15,amp:60,freq:.8,hue:160,sat:70,alpha:.09},
      {y:.28,amp:80,freq:.6,hue:180,sat:80,alpha:.07},
      {y:.42,amp:55,freq:1.1,hue:200,sat:65,alpha:.06},
      {y:.20,amp:45,freq:.5,hue:140,sat:75,alpha:.05},
    ];
    bands.forEach((b,bi)=>{
      const path=new Path2D();
      const baseY=h*b.y;
      path.moveTo(0,h);
      for(let x=0;x<=w;x+=6){
        const wave=Math.sin(x*.004*b.freq+t+bi*1.3)*b.amp + Math.sin(x*.002*b.freq+t*.7+bi)*b.amp*.4;
        path.lineTo(x,baseY+wave);
      }
      path.lineTo(w,h); path.closePath();
      const g=ctx.createLinearGradient(0,baseY-b.amp,0,baseY+b.amp*2);
      g.addColorStop(0,`hsla(${b.hue},${b.sat}%,65%,0)`);
      g.addColorStop(.4,`hsla(${b.hue},${b.sat}%,65%,${b.alpha})`);
      g.addColorStop(1,`hsla(${b.hue},${b.sat}%,65%,0)`);
      ctx.fillStyle=g; ctx.fill(path);
    });
    // Stars
    const seed=12345;
    for(let i=0;i<60;i++){
      const sx=((seed*i*1.618)%1)*w, sy=((seed*i*2.718)%1)*h*.6;
      const flicker=.3+.4*Math.sin(t*3+i*0.7);
      const sr = (((seed*(i+1)*3.14159)%0.9)+0.3);  // fixed per-star radius, no rand() in loop
      ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fillStyle=`rgba(220,240,255,${flicker*.5})`; ctx.fill();
    }
  };
}

/* ── Fireplace ────────────────────────────────────────────────── */
export function createFireplaceRenderer() {
  const particles=[]; let lw=0,lh=0;
  const init=(w,h)=>{ particles.length=0; for(let i=0;i<80;i++) particles.push(newParticle(w,h,true)); };
  const newParticle=(w,h,scatter=false)=>({ x:w*.5+rand(-40,40), y:scatter?rand(h*.4,h):h*.72, vx:rand(-.5,.5), vy:rand(-2.5,-1), life:0, maxLife:rand(60,130), r:rand(4,14), hue:rand(10,38) });
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    // Warm floor glow
    const g=ctx.createRadialGradient(w*.5,h,0,w*.5,h,w*.5); g.addColorStop(0,'rgba(200,100,20,.10)'); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    particles.forEach((p,i)=>{
      p.life++; p.x+=p.vx+Math.sin(time*.003+i)*.15; p.y+=p.vy; p.vy*=.985; p.vx*=.97;
      const prog=p.life/p.maxLife;
      const alpha=(1-prog)*0.22;
      const rad=p.r*(1-prog*.6);
      const hue=p.hue+prog*20; // shifts orange→yellow as rises
      if(rad>0&&alpha>0){ ctx.beginPath(); ctx.arc(p.x,p.y,rad,0,Math.PI*2); const fg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rad); fg.addColorStop(0,`hsla(${hue+20},100%,80%,${alpha*1.4})`); fg.addColorStop(1,`hsla(${hue},90%,45%,0)`); ctx.fillStyle=fg; ctx.fill(); }
      if(p.life>=p.maxLife) particles[i]=newParticle(w,h);
    });
  };
}

/* ── Thunderstorm ─────────────────────────────────────────────── */
export function createThunderstormRenderer() {
  const drops=[]; let lw=0,lh=0;
  let lightning={active:false,x:0,branches:[],timer:0,nextAt:rand(80,220)};
  const init=(w,h)=>{ drops.length=0; for(let i=0;i<200;i++) drops.push({x:rand(0,w),y:rand(-h,h),len:rand(20,80),speed:rand(18,32),op:rand(.2,.6),wd:rand(.6,1.8)}); };
  const makeLightning=(w,h)=>{ const x=rand(w*.2,w*.8); const branches=[]; const seg=(x1,y1,dx,depth)=>{ if(depth<1||Math.abs(dx)<2) return; const x2=x1+dx; const y2=y1+rand(h*.06,h*.12); branches.push({x1,y1,x2,y2,depth,op:depth/4}); if(Math.random()>.4) seg(x2,y2,dx*.5*(Math.random()>.5?1:-1),depth-1); seg(x2,y2,dx*.5+rand(-30,30),depth-1); }; seg(x,0,rand(-80,80),4); lightning={active:true,x,branches,timer:0,nextAt:rand(100,280)}; };
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    // Dark storm sky gradient
    const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(5,8,18,.55)'); g.addColorStop(1,'rgba(10,20,35,.2)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    // Lightning flash bg
    if(lightning.active&&lightning.timer<6){ const flash=Math.max(0,(6-lightning.timer)/6)*0.12; ctx.fillStyle=`rgba(180,200,255,${flash})`; ctx.fillRect(0,0,w,h); }
    // Rain drops — heavier & more angled than normal rain
    drops.forEach(d=>{ ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(d.x-d.len*.25,d.y+d.len); ctx.strokeStyle=`rgba(120,160,210,${d.op})`; ctx.lineWidth=d.wd; ctx.stroke(); d.y+=d.speed; d.x-=d.speed*.15; if(d.y>h+80||d.x<-80){d.y=rand(-120,-10);d.x=rand(0,w+100);} });
    // Lightning bolt
    if(lightning.active){ lightning.timer++; if(lightning.timer<12){ lightning.branches.forEach(b=>{ ctx.beginPath(); ctx.moveTo(b.x1,b.y1); ctx.lineTo(b.x2,b.y2); const fade=Math.max(0,(12-lightning.timer)/12); ctx.strokeStyle=`rgba(200,220,255,${b.op*fade})`; ctx.lineWidth=b.depth*.7; ctx.shadowColor='rgba(180,210,255,.9)'; ctx.shadowBlur=12; ctx.stroke(); ctx.shadowBlur=0; }); } else { lightning.active=false; } }
    lightning.nextAt--;
    if(lightning.nextAt<=0) makeLightning(w,h);
  };
}

/* ── Cherry Blossom ───────────────────────────────────────────── */
export function createCherryBlossomRenderer() {
  const petals=[]; let lw=0,lh=0;
  const newPetal=(w,h,scatter=false)=>({ x:rand(0,w), y:scatter?rand(-h,h):-rand(10,60), vx:rand(-.5,.5), vy:rand(.4,1.2), rot:rand(0,Math.PI*2), rs:rand(-.03,.03), sw:rand(6,14), sh:rand(4,9), op:rand(.25,.7), drift:rand(0,Math.PI*2), ds:rand(.008,.02), hue:rand(340,360) });
  const init=(w,h)=>{ petals.length=0; for(let i=0;i<55;i++) petals.push(newPetal(w,h,true)); };
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    // Soft pink sky gradient
    const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(255,220,230,.08)'); g.addColorStop(1,'rgba(255,180,200,.04)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    petals.forEach((p,i)=>{
      p.drift+=p.ds; p.x+=p.vx+Math.sin(p.drift)*0.6; p.y+=p.vy; p.rot+=p.rs;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.globalAlpha=p.op;
      // Draw a 5-petal flower shape
      for(let k=0;k<5;k++){
        ctx.save(); ctx.rotate((k/5)*Math.PI*2);
        ctx.beginPath(); ctx.ellipse(0,-p.sh*.6,p.sw*.38,p.sh*.55,0,0,Math.PI*2);
        ctx.fillStyle=`hsl(${p.hue},80%,88%)`; ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      if(p.y>h+30) { petals[i]=newPetal(w,h); }
    });
  };
}

/* ── Galaxy / Nebula ──────────────────────────────────────────── */
export function createGalaxyRenderer() {
  const stars=[]; const dust=[]; let lw=0,lh=0;
  const init=(w,h)=>{
    stars.length=0; dust.length=0;
    for(let i=0;i<220;i++) stars.push({x:rand(0,w),y:rand(0,h),r:rand(.2,2.2),base:rand(.3,1),ts:rand(.4,2),to:rand(0,Math.PI*2),hue:randInt(200,280)});
    for(let i=0;i<6;i++) dust.push({x:rand(.1,.9),y:rand(.1,.9),rx:rand(.15,.4),ry:rand(.08,.25),hue:randInt(230,310),alpha:rand(.035,.065),rot:rand(0,Math.PI)});
  };
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    const t=time*.0005;
    // Nebula dust clouds
    dust.forEach((d,i)=>{ const pulse=1+.05*Math.sin(t*.7+i); ctx.save(); ctx.translate(d.x*w,d.y*h); ctx.rotate(d.rot); const g=ctx.createRadialGradient(0,0,0,0,0,d.rx*w*pulse); g.addColorStop(0,`hsla(${d.hue},70%,60%,${d.alpha})`); g.addColorStop(.5,`hsla(${d.hue+30},60%,50%,${d.alpha*.4})`); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.scale(1,d.ry/d.rx); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,d.rx*w*pulse,0,Math.PI*2); ctx.fill(); ctx.restore(); });
    // Stars with colour tints
    stars.forEach(s=>{ const f=s.base*(.6+.4*Math.sin(t*s.ts+s.to)); ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`hsla(${s.hue},60%,95%,${f})`; ctx.fill(); });
    // Milky band
    const band=ctx.createLinearGradient(0,h*.2,w,h*.8); band.addColorStop(0,'rgba(160,140,255,0)'); band.addColorStop(.4,`rgba(160,140,255,0.035)`); band.addColorStop(.6,`rgba(200,160,255,0.045)`); band.addColorStop(1,'rgba(160,140,255,0)'); ctx.fillStyle=band; ctx.fillRect(0,0,w,h);
  };
}

/* ── Desert / Sand Dunes ──────────────────────────────────────── */
export function createDesertRenderer() {
  const motes=[]; let lw=0,lh=0;
  const init=(w,h)=>{ motes.length=0; for(let i=0;i<60;i++) motes.push({x:rand(0,w),y:rand(h*.4,h),r:rand(.5,2),vx:rand(.3,1.2),vy:rand(-.15,.15),op:rand(.06,.22),drift:rand(0,Math.PI*2),ds:rand(.01,.025)}); };
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    const t=time*.0003;
    // Warm sky glow
    const sky=ctx.createLinearGradient(0,0,0,h); sky.addColorStop(0,'rgba(180,100,20,.07)'); sky.addColorStop(.5,'rgba(200,130,40,.05)'); sky.addColorStop(1,'rgba(140,80,10,.12)'); ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
    // Dune silhouettes — 3 layered sine waves
    [[h*.72,h*.06,180,40,.5],[h*.80,h*.05,220,50,.35],[h*.88,h*.04,260,60,.2]].forEach(([baseY,amp,wl,shift,op],li)=>{
      ctx.beginPath(); ctx.moveTo(0,h);
      for(let x=0;x<=w;x+=4){ const y=baseY+Math.sin((x/wl)+t*(1+li*.3)+shift)*amp+Math.sin((x/(wl*.6))+t*.5)*amp*.4; ctx.lineTo(x,y); }
      ctx.lineTo(w,h); ctx.closePath();
      const dg=ctx.createLinearGradient(0,baseY-amp,0,h); dg.addColorStop(0,`rgba(200,150,80,${op})`); dg.addColorStop(1,`rgba(160,110,50,${op*.6})`); ctx.fillStyle=dg; ctx.fill();
    });
    // Drifting sand motes
    motes.forEach(m=>{ m.drift+=m.ds; m.x+=m.vx; m.y+=m.vy+Math.sin(m.drift)*.2; if(m.x>w+20){m.x=-10;m.y=rand(h*.4,h);} ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,Math.PI*2); ctx.fillStyle=`rgba(220,180,110,${m.op})`; ctx.fill(); });
  };
}

/* ── Underwater ───────────────────────────────────────────────── */
export function createUnderwaterRenderer() {
  const particles=[]; const rays=[]; let lw=0,lh=0;
  const init=(w,h)=>{
    particles.length=0; rays.length=0;
    for(let i=0;i<45;i++) particles.push({x:rand(0,w),y:rand(0,h),r:rand(1,4),vx:rand(-.1,.1),vy:rand(-.25,-.06),op:rand(.08,.28),wobble:rand(0,Math.PI*2),ws:rand(.015,.04),hue:rand(170,210)});
    for(let i=0;i<7;i++) rays.push({x:rand(0,w),angle:rand(-.18,.18),width:rand(30,80),speed:rand(.0003,.0007),phase:rand(0,Math.PI*2)});
  };
  return (ctx,canvas,time)=>{
    const{width:w,height:h}=canvas;
    if(w!==lw||h!==lh){init(w,h);lw=w;lh=h;}
    ctx.clearRect(0,0,w,h);
    const t=time*.001;
    // Deep ocean gradient
    const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(0,60,120,.22)'); g.addColorStop(1,'rgba(0,20,50,.1)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    // Caustic light rays from surface
    rays.forEach(r=>{ const swing=Math.sin(t*r.speed*1000+r.phase)*.15; const rx=r.x+Math.sin(t*r.speed*500)*60; ctx.save(); ctx.translate(rx,0); ctx.rotate(r.angle+swing); const rg=ctx.createLinearGradient(0,0,0,h); rg.addColorStop(0,`rgba(80,180,255,0.06)`); rg.addColorStop(.6,`rgba(60,160,220,0.03)`); rg.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=rg; ctx.beginPath(); ctx.moveTo(-r.width/2,0); ctx.lineTo(r.width/2,0); ctx.lineTo(r.width*1.5,h); ctx.lineTo(-r.width*1.5,h); ctx.closePath(); ctx.fill(); ctx.restore(); });
    // Rising bubbles
    particles.forEach((p,i)=>{ p.wobble+=p.ws; p.x+=p.vx+Math.sin(p.wobble)*.5; p.y+=p.vy; if(p.y<-10){p.y=h+10;p.x=rand(0,w);} ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.strokeStyle=`hsla(${p.hue},70%,80%,${p.op})`; ctx.lineWidth=.9; ctx.stroke(); const shine=ctx.createRadialGradient(p.x-p.r*.3,p.y-p.r*.3,0,p.x,p.y,p.r); shine.addColorStop(0,`hsla(${p.hue},80%,95%,${p.op*.5})`); shine.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=shine; ctx.fill(); });
  };
}

/* ── Registry ─────────────────────────────────────────────────── */
export const ENVIRONMENTS = {
  rain:         { label:'Rain',         icon:'🌧', create:createRainRenderer },
  snow:         { label:'Snow',         icon:'❄',  create:createSnowRenderer },
  ocean:        { label:'Ocean',        icon:'🌊', create:createOceanRenderer },
  aurora:       { label:'Aurora',       icon:'🌌', create:createAuroraRenderer },
  fireplace:    { label:'Fireplace',    icon:'🔥', create:createFireplaceRenderer },
  forest:       { label:'Forest',       icon:'🌿', create:createForestRenderer },
  cafe:         { label:'Café',         icon:'☕', create:createCafeRenderer },
  night:        { label:'Night',        icon:'🌙', create:createNightRenderer },
  thunderstorm: { label:'Thunderstorm', icon:'⛈',  create:createThunderstormRenderer },
  cherry:       { label:'Cherry',       icon:'🌸', create:createCherryBlossomRenderer },
  galaxy:       { label:'Galaxy',       icon:'🔭', create:createGalaxyRenderer },
  desert:       { label:'Desert',       icon:'🏜', create:createDesertRenderer },
  underwater:   { label:'Underwater',   icon:'🐠', create:createUnderwaterRenderer },
  minimal:      { label:'Minimal',      icon:'◎',  create:createMinimalRenderer },
};

/* ── Confetti ─────────────────────────────────────────────────── */
export function createConfettiBurst(container, count=40) {
  const colors=['#c4a882','#82c4a8','#a882c4','#c4c882','#82a8c4'];
  for(let i=0;i<count;i++){
    const el=document.createElement('div');
    el.style.cssText=`position:fixed;left:${rand(20,80)}vw;top:-20px;width:${rand(6,12)}px;height:${rand(6,12)}px;background:${randChoice(colors)};border-radius:${Math.random()>.5?'50%':'2px'};pointer-events:none;z-index:99999;animation:confetti-fall ${rand(1.5,3)}s ease-in ${rand(0,.8)}s both;`;
    container.appendChild(el);
    el.addEventListener('animationend',()=>el.remove());
  }
}

/* ── Ripple ───────────────────────────────────────────────────── */
export function createRipple(e, element) {
  if(!element) return;
  const rect=element.getBoundingClientRect();
  const size=Math.max(rect.width,rect.height)*2;
  const r=document.createElement('span');
  r.style.cssText=`position:absolute;width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;background:rgba(255,255,255,.12);border-radius:50%;pointer-events:none;animation:ripple .6s ease-out forwards;`;
  element.style.position=element.style.position||'relative';
  element.style.overflow='hidden';
  element.appendChild(r);
  r.addEventListener('animationend',()=>r.remove());
}
