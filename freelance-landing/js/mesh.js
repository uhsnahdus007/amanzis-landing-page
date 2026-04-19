/* ============================================================
   MESH BACKGROUND
   Interactive canvas particle network.
   Call initMesh('mesh-canvas') to start.
   ============================================================ */

function initMesh(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  /* --- Tuneable constants --- */
  const PARTICLE_COUNT     = 90;
  const CONNECTION_DIST    = 140;   // px — max line-drawing distance
  const MOUSE_RADIUS       = 160;   // px — repulsion field radius
  const REPEL_STRENGTH     = 1.1;   // force multiplier on mouse push
  const MAX_SPEED          = 1.6;   // px/frame cap
  const BASE_SPEED         = 0.35;  // initial drift speed
  const DAMPING            = 0.982; // velocity bleed-off per frame

  /* Particle color (RGBA components for perf) */
  const P_R = 59, P_G = 130, P_B = 246; // --blue-glow base

  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let rafId;

  /* ---- Resize ---- */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ---- Spawn particles ---- */
  function spawnParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: Math.cos(angle) * BASE_SPEED * (0.5 + Math.random()),
        vy: Math.sin(angle) * BASE_SPEED * (0.5 + Math.random()),
        r:  1 + Math.random() * 1.4,
        opacity: 0.4 + Math.random() * 0.45,
      });
    }
  }

  /* ---- Main draw loop ---- */
  function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const len = particles.length;

    for (let i = 0; i < len; i++) {
      const p = particles[i];

      /* Mouse repulsion */
      const mdx  = p.x - mouse.x;
      const mdy  = p.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < MOUSE_RADIUS && mdist > 0.5) {
        const force = ((MOUSE_RADIUS - mdist) / MOUSE_RADIUS) * REPEL_STRENGTH;
        p.vx += (mdx / mdist) * force * 0.06;
        p.vy += (mdy / mdist) * force * 0.06;
      }

      /* Damping */
      p.vx *= DAMPING;
      p.vy *= DAMPING;

      /* Speed cap */
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > MAX_SPEED) {
        const inv = MAX_SPEED / spd;
        p.vx *= inv;
        p.vy *= inv;
      }

      /* Drift: nudge back toward base speed when almost stopped */
      if (spd < 0.05) {
        const angle = Math.random() * Math.PI * 2;
        p.vx += Math.cos(angle) * 0.02;
        p.vy += Math.sin(angle) * 0.02;
      }

      p.x += p.vx;
      p.y += p.vy;

      /* Soft-bounce off edges */
      if (p.x < 0)             { p.x = 0;             p.vx = Math.abs(p.vx); }
      if (p.x > canvas.width)  { p.x = canvas.width;  p.vx = -Math.abs(p.vx); }
      if (p.y < 0)             { p.y = 0;             p.vy = Math.abs(p.vy); }
      if (p.y > canvas.height) { p.y = canvas.height; p.vy = -Math.abs(p.vy); }
    }

    /* Draw connections (O(n²) — fine for ≤ 120 particles) */
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.35;
          ctx.strokeStyle = `rgba(${P_R},${P_G},${P_B},${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    /* Draw particle dots */
    for (let i = 0; i < len; i++) {
      const p = particles[i];
      ctx.fillStyle = `rgba(${P_R},${P_G},${P_B},${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(drawFrame);
  }

  /* ---- Init ---- */
  resize();
  spawnParticles();
  drawFrame();

  /* ---- Event listeners ---- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(rafId);
      resize();
      spawnParticles();
      drawFrame();
    }, 120);
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  /* Touch support for mobile hover-like effect */
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    mouse.x = t.clientX;
    mouse.y = t.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('touchend', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
}
