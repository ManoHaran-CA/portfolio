/* ═══════════════════════════════════════════════════════
   MANOHARAN CA — PORTFOLIO JAVASCRIPT
   Animations, Scroll effects, Canvas Particles, Nav
═══════════════════════════════════════════════════════ */

'use strict';

// ── CANVAS PARTICLE / GRID BACKGROUND ───────────────────
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], dots = [];
  const PARTICLE_COUNT = 55;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random(),
      pulse: Math.random() * Math.PI * 2
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.035)';
    ctx.lineWidth = 0.5;
    const step = 64;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function drawParticles(t) {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      const alpha = (Math.sin(p.pulse) * 0.3 + 0.5) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
      ctx.fill();

      // Connect nearby particles
      particles.forEach(q => {
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.04 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
  }

  let raf;
  function loop(t) {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawParticles(t);
    raf = requestAnimationFrame(loop);
  }

  init();
  loop(0);
  window.addEventListener('resize', () => { init(); });
})();


// ── NAV: SCROLL EFFECT + ACTIVE LINK ────────────────────
(function initNav() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const allLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');
  const backToTop = document.getElementById('backToTop');

  // Hamburger toggle
  hamburger && hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  // Close on link click (mobile)
  navLinks && navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger && hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  function onScroll() {
    const scrollY = window.scrollY;

    // Navbar style
    navbar.classList.toggle('scrolled', scrollY > 30);

    // Back to top
    backToTop && backToTop.classList.toggle('visible', scrollY > 400);

    // Active nav link
    let current = '';
    sections.forEach(sec => {
      if (scrollY + 100 >= sec.offsetTop) current = sec.id;
    });
    allLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Back to top button
  backToTop && backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


// ── SCROLL REVEAL (IntersectionObserver) ─────────────────
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();


// ── HERO STAT CARDS STAGGER ──────────────────────────────
(function initStatCards() {
  const cards = document.querySelectorAll('.stat-card');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cards.forEach((card, i) => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 120);
        });
        io.disconnect();
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const parent = document.querySelector('.stat-cards');
  if (parent) io.observe(parent);
})();


// ── TIMELINE ANIMATED LINE ───────────────────────────────
(function initTimeline() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const pseudo = document.createElement('style');
  pseudo.textContent = `
    .timeline::before {
      transform-origin: top center;
      transform: scaleY(0);
      transition: transform 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .timeline.animate::before { transform: scaleY(1); }
  `;
  document.head.appendChild(pseudo);

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        timeline.classList.add('animate');
        io.disconnect();
      }
    });
  }, { threshold: 0.2 });
  io.observe(timeline);
})();


// ── SKILL TILE STAGGER ───────────────────────────────────
(function initSkillStagger() {
  const tiles = document.querySelectorAll('.skill-tile');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tiles.forEach((tile, i) => {
          setTimeout(() => {
            tile.style.opacity = '1';
            tile.style.transform = 'translateY(0) scale(1)';
          }, i * 60);
        });
        io.disconnect();
      }
    });
  }, { threshold: 0.1 });

  tiles.forEach(tile => {
    tile.style.opacity = '0';
    tile.style.transform = 'translateY(20px) scale(0.95)';
    tile.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  });

  const grid = document.querySelector('.skills-grid');
  if (grid) io.observe(grid);
})();


// ── PROJECT CARD HOVER GLOW ──────────────────────────────
(function initProjectCards() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
    });
  });
})();


// ── TYPEWRITER EFFECT (hero subtitle) ───────────────────
(function initTypewriter() {
  const roles = [
    'Social Media Manager',
    'Prompt Engineering',
    'Digital Marketing & Analytics',
    'Data Analytics Expert',
    'AI Creative Producer'
  ];
  const el = document.querySelector('.hero-subtitle');
  if (!el) return;

  let rIdx = 0, cIdx = 0, deleting = false;

  function type() {
    const role = roles[rIdx];
    if (!deleting) {
      cIdx++;
      el.textContent = role.slice(0, cIdx) + ' | Digital Professional';
      if (cIdx === role.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      cIdx--;
      el.textContent = role.slice(0, cIdx) + ' | Digital Professional';
      if (cIdx === 0) {
        deleting = false;
        rIdx = (rIdx + 1) % roles.length;
      }
    }
    setTimeout(type, deleting ? 40 : 75);
  }

  // Delay start until visible
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setTimeout(type, 1500);
      io.disconnect();
    }
  }, { threshold: 0.5 });
  io.observe(el);
})();


// ── GREETING TYPEWRITER ANIMATION ────────────────────────
(function initGreetingTypewriter() {
  const greetings = [
    'HELLO, I AM',
    'WELCOME, I\'M',
    'HI THERE, I\'M'
  ];
  const el = document.getElementById('greeting-text');
  if (!el) return;

  let gIdx = 0, cIdx = greetings[0].length, deleting = true;

  function typeGreeting() {
    const text = greetings[gIdx];
    if (!deleting) {
      cIdx++;
      el.textContent = text.slice(0, cIdx);
      if (cIdx === text.length) {
        deleting = true;
        setTimeout(typeGreeting, 2500);
        return;
      }
    } else {
      cIdx--;
      el.textContent = text.slice(0, cIdx);
      if (cIdx === 0) {
        deleting = false;
        gIdx = (gIdx + 1) % greetings.length;
      }
    }
    setTimeout(typeGreeting, deleting ? 45 : 85);
  }

  setTimeout(typeGreeting, 3000);
})();


// ── COUNTER ANIMATION (stat numbers) ────────────────────
(function initCounters() {
  const el = document.querySelector('#stat-card-1 .stat-num');
  if (!el) return;

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      let n = 0;
      const target = 4;
      const interval = setInterval(() => {
        n++;
        el.textContent = n + '+';
        if (n >= target) clearInterval(interval);
      }, 200);
      io.disconnect();
    }
  }, { threshold: 0.5 });
  io.observe(el);
})();


// ── CURSOR GLOW ──────────────────────────────────────────
(function initCursorGlow() {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed; pointer-events:none; z-index:9999;
    width:350px; height:350px;
    border-radius:50%;
    background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
    transform:translate(-50%,-50%);
    transition: left 0.15s ease, top 0.15s ease;
  `;
  document.body.appendChild(glow);

  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
})();


// ── SMOOTH ANCHOR NAVIGATION ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ── FEATURE CARD MAGNETIC HOVER ──────────────────────────
(function initMagnetic() {
  document.querySelectorAll('.feature-card, .stat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.08;
      const dy = (e.clientY - cy) * 0.08;
      card.style.transform = `translateY(-5px) rotate3d(${-dy}, ${dx}, 0, 6deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


// ── PAGE LOAD ANIMATION ──────────────────────────────────
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });

  // Hero reveal
  const heroLeft = document.getElementById('hero-left');
  const heroRight = document.getElementById('hero-right');
  if (heroLeft) {
    heroLeft.style.opacity = '0';
    heroLeft.style.transform = 'translateX(-40px)';
    heroLeft.style.transition = 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s';
    setTimeout(() => {
      heroLeft.style.opacity = '1';
      heroLeft.style.transform = 'translateX(0)';
    }, 100);
  }
  if (heroRight) {
    heroRight.style.opacity = '0';
    heroRight.style.transform = 'translateX(40px)';
    heroRight.style.transition = 'opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s';
    setTimeout(() => {
      heroRight.style.opacity = '1';
      heroRight.style.transform = 'translateX(0)';
    }, 100);
  }
});
