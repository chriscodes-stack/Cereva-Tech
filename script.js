(function(){
  // Smooth scroll for nav links
  document.querySelectorAll('.nav a').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      document.getElementById(id).scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // Canvas particle network
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const DPR = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = w * DPR;
  canvas.height = h * DPR;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(DPR, DPR);

  const config = {
    particleCount: Math.floor((w*h)/40000),
    maxDist: 160,
    baseSize: 1.2,
    colorA: [0,212,255], // cyan
    colorB: [123,92,255], // violet
  };

  let mouse = {x: w/2, y: h/2, vx:0, vy:0, active: false};
  window.addEventListener('mousemove', (e)=>{ mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener('mouseout', ()=>{ mouse.active=false; });

  function rand(min,max){ return Math.random()*(max-min)+min; }

  class Particle{
    constructor(){
      this.x = rand(0,w); this.y = rand(0,h);
      this.vx = rand(-0.35,0.35); this.vy = rand(-0.35,0.35);
      this.r = rand(config.baseSize, config.baseSize*2.6);
      this.phase = Math.random()*Math.PI*2;
    }
    step(dt){
      // slight drift and attraction to mouse when active
      if(mouse.active){
        const dx = mouse.x - this.x; const dy = mouse.y - this.y;
        const d2 = Math.sqrt(dx*dx+dy*dy) + 0.001;
        const pull = Math.min(0.002, 140/d2 * 0.0006);
        this.vx += dx * pull; this.vy += dy * pull;
      }
      // boundary
      if(this.x < -50) this.x = w+50;
      if(this.x > w+50) this.x = -50;
      if(this.y < -50) this.y = h+50;
      if(this.y > h+50) this.y = -50;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      // gentle damping
      this.vx *= 0.9997; this.vy *= 0.9997;
    }
    draw(ctx){
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r*6);
      g.addColorStop(0, 'rgba('+config.colorA.join(',')+',0.95)');
      g.addColorStop(1, 'rgba('+config.colorB.join(',')+',0.02)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  let particles = [];
  function initParticles(){
    particles = [];
    const count = Math.max(12, Math.min(140, config.particleCount));
    for(let i=0;i<count;i++) particles.push(new Particle());
  }
  initParticles();

  let last = performance.now();
  function step(now){
    const dt = Math.min(40, now-last) / 16.666;
    last = now;
    ctx.clearRect(0,0,w,h);
    // subtle gradient overlay
    const gbg = ctx.createLinearGradient(0,0,w,h);
    gbg.addColorStop(0, 'rgba(5,8,20,0.45)');
    gbg.addColorStop(1, 'rgba(8,12,28,0.55)');
    ctx.fillStyle = gbg;
    ctx.fillRect(0,0,w,h);

    // draw connections
    for(let i=0;i<particles.length;i++){
      const p = particles[i];
      p.step(dt);
      for(let j=i+1;j<particles.length;j++){
        const q = particles[j];
        const dx = p.x - q.x; const dy = p.y - q.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if(d < config.maxDist){
          const alpha = 1 - d/config.maxDist;
          ctx.strokeStyle = `rgba(${config.colorA.join(',')},${(alpha*0.12+0.02).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
        }
      }
      p.draw(ctx);
    }

    // subtle overlay of neural mesh (animated)
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // handle resize & DPR changes
  window.addEventListener('resize', ()=>{
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    config.particleCount = Math.floor((w*h)/40000);
    initParticles();
  });

  // download button pulse effect after load
  window.addEventListener('load', ()=>{
    const btn = document.getElementById('download-btn');
    if(btn) btn.animate([{boxShadow:'0 10px 30px rgba(11,13,22,0.6)'},{boxShadow:'0 22px 80px rgba(123,92,255,0.28)'}],{duration:1600,iterations:Infinity,direction:'alternate'});
  });

})();