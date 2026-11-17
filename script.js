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


// ── NAV: SCROLL EFFECT + ACTIVE LINK + CENTERED SECTION SCROLL ──
let activeClickLockId = null;
let activeClickLockTimer = null;

function setActiveNavById(id) {
  if (!id) return;
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + id);
  });
}

function scrollSectionToCenter(section) {
  if (!section) return;

  // Ensure reveal elements inside the target section are visible immediately
  section.querySelectorAll('.reveal-up').forEach(el => el.classList.add('visible'));

  activeClickLockId = section.id;
  setActiveNavById(section.id);
  if (activeClickLockTimer) clearTimeout(activeClickLockTimer);
  activeClickLockTimer = setTimeout(() => {
    activeClickLockId = null;
  }, 900);

  if (section.id === 'hero') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const navbar = document.getElementById('navbar');
  const navContainer = navbar ? navbar.querySelector('.nav-container') : null;
  const navBottom = navContainer ? navContainer.getBoundingClientRect().bottom : 66;
  const viewportH = window.innerHeight;
  const availH = viewportH - navBottom;

  const content = section.querySelector('.container, .hero-container') || section;
  const contentTop = section.offsetTop + (content !== section ? content.offsetTop : 0);
  const contentH = content.offsetHeight;

  // Center the section content within the visible screen area below the floating navbar,
  // while keeping the top of the section below the navbar on smaller screens.
  const centeredTop = navBottom + (availH - contentH) / 2;
  const desiredTopInViewport = Math.max(navBottom + 14, centeredTop);

  const targetScrollY = Math.max(0, contentTop - desiredTopInViewport);
  window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
}

// ── SECTION SCROLL BLUR & HIDE EFFECT ───────────────────
function updateSectionBlurOnScroll() {
  const sections = document.querySelectorAll('main section[id]');
  if (!sections.length) return;

  const scrollY = window.scrollY;
  const viewportH = window.innerHeight;
  const navbar = document.getElementById('navbar');
  const navContainer = navbar ? navbar.querySelector('.nav-container') : null;
  const navBottom = navContainer ? navContainer.getBoundingClientRect().bottom : 66;
  const focusY = navBottom + (viewportH - navBottom) * 0.5;
  const atTop = scrollY < 40;
  const atBottom = viewportH + scrollY >= document.documentElement.scrollHeight - 36;

  sections.forEach(section => {
    const content = section.querySelector('.container, .hero-container') || section;
    const contentH = content.offsetHeight || section.offsetHeight;
    const rectTop = section.offsetTop + (content !== section ? content.offsetTop : 0) - scrollY;
    const rectBottom = rectTop + contentH;

    const halfFocus = Math.min(contentH * 0.45, 90);

    // Previous section scrolling up & out of view
    let upProgress = 0;
    const startHideY = focusY + halfFocus;
    const hideRange = halfFocus + 145;
    if (rectBottom < startHideY) {
      upProgress = Math.max(0, Math.min(1, (startHideY - rectBottom) / hideRange));
    }

    // Next section below the current focus area
    let downProgress = 0;
    const endEnterY = focusY - halfFocus;
    const enterRange = halfFocus + 185;
    if (rectTop > endEnterY) {
      downProgress = Math.max(0, Math.min(1, (rectTop - endEnterY) / enterRange));
    }

    // Ensure Hero at very top and Contact at very bottom are crystal clear
    if (atTop && section.id === 'hero') {
      upProgress = 0;
      downProgress = 0;
    }
    if (atBottom && section.id === 'contact') {
      upProgress = 0;
      downProgress = 0;
    }

    const rawProgress = Math.max(upProgress, downProgress);
    const eased = rawProgress * rawProgress * (3 - 2 * rawProgress);

    if (eased <= 0.01) {
      section.style.filter = 'none';
      section.style.opacity = '1';
      section.style.transform = 'none';
      section.style.pointerEvents = '';
      section.style.visibility = 'visible';
    } else {
      const blurPx = (eased * 16).toFixed(1);
      const opacity = Math.max(0, 1 - eased * 1.1).toFixed(3);
      const shiftY = upProgress >= downProgress ? -eased * 26 : eased * 26;
      const scale = (1 - eased * 0.05).toFixed(3);

      section.style.filter = `blur(${blurPx}px)`;
      section.style.opacity = opacity;
      section.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0) scale(${scale})`;
      section.style.pointerEvents = Number(opacity) < 0.15 ? 'none' : '';
      section.style.visibility = Number(opacity) <= 0.02 ? 'hidden' : 'visible';
    }
  });
}

(function initNav() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
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

    // Update section blur & hide effect
    updateSectionBlurOnScroll();

    // Navbar style
    navbar.classList.toggle('scrolled', scrollY > 30);

    // Back to top
    backToTop && backToTop.classList.toggle('visible', scrollY > 400);

    if (activeClickLockId) {
      setActiveNavById(activeClickLockId);
      return;
    }

    // Active nav link based on viewport center
    if (scrollY < 80) {
      setActiveNavById('hero');
      return;
    }

    if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 24) {
      setActiveNavById('contact');
      return;
    }

    const viewportCenter = scrollY + window.innerHeight * 0.5;
    let current = 'hero';
    let minDistance = Infinity;

    sections.forEach(sec => {
      const secTop = sec.offsetTop;
      const secCenter = secTop + sec.offsetHeight * 0.5;
      const dist = Math.abs(viewportCenter - secCenter);
      if (dist < minDistance) {
        minDistance = dist;
        current = sec.id;
      }
    });

    setActiveNavById(current);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateSectionBlurOnScroll, { passive: true });
  onScroll();

  // Back to top button
  backToTop && backToTop.addEventListener('click', () => {
    scrollSectionToCenter(document.getElementById('hero'));
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
  const tiles = document.querySelectorAll('.core-skill-card, .skill-tile');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tiles.forEach((tile, i) => {
          setTimeout(() => {
            tile.style.opacity = '1';
            tile.style.transform = 'translateY(0) scale(1)';
          }, i * 70);
        });
        io.disconnect();
      }
    });
  }, { threshold: 0.1 });

  tiles.forEach(tile => {
    tile.style.opacity = '0';
    tile.style.transform = 'translateY(20px) scale(0.96)';
    tile.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  const grid = document.querySelector('.core-skills-grid, .skills-grid');
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


// ── SMOOTH ANCHOR & FIELD NAVIGATION (CENTER SECTION) ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      scrollSectionToCenter(target);
    }
  });
});

// Center the parent section when clicking any interactive card/field
document.querySelectorAll('.stat-card, .feature-card, .core-skill-card, .timeline-content, .project-card, .edu-card, .contact-card, .contact-right').forEach(field => {
  field.addEventListener('click', e => {
    if (e.target.closest('a, button')) return;
    const section = field.closest('section[id]');
    if (section) {
      scrollSectionToCenter(section);
    }
  });
});


// ── ABOUT SECTION: 3D HELIX MOTION ANIMATION ────────────
(function initAboutHelixMotion() {
  const stage = document.querySelector('#about .about-cards-grid');
  if (!stage) return;
  const cards = Array.from(stage.querySelectorAll('.feature-card'));
  const total = cards.length;
  if (!total) return;

  let currentAngle = 0;
  let targetAngle = null;
  let speed = 0.0045;
  let isHovered = false;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartAngle = 0;
  let dragMoved = false;

  stage.addEventListener('mouseenter', () => { isHovered = true; });
  stage.addEventListener('mouseleave', () => {
    isHovered = false;
    isDragging = false;
  });

  // Pointer / touch drag support
  stage.addEventListener('pointerdown', e => {
    isDragging = true;
    dragMoved = false;
    targetAngle = null;
    dragStartX = e.clientX;
    dragStartAngle = currentAngle;
  });

  window.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 4) dragMoved = true;
    currentAngle = dragStartAngle + dx * 0.0065;
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  // Click a card to smoothly bring it to the front of the helix
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (dragMoved) return;
      const cardBaseAngle = (i * 2 * Math.PI) / total;
      const desired = -cardBaseAngle;
      // Shortest angular distance
      const diff = Math.atan2(Math.sin(desired - currentAngle), Math.cos(desired - currentAngle));
      targetAngle = currentAngle + diff;
    });
  });

  function renderHelix() {
    const stageWidth = stage.clientWidth || 600;
    const isMobile = stageWidth < 460;
    const isTablet = stageWidth >= 460 && stageWidth < 680;

    const radiusX = isMobile ? Math.min(stageWidth * 0.34, 130) : isTablet ? 165 : 205;
    const radiusZ = isMobile ? 105 : isTablet ? 135 : 165;
    const pitchY = isMobile ? 36 : 44;

    if (!isDragging) {
      if (targetAngle !== null) {
        const delta = targetAngle - currentAngle;
        currentAngle += delta * 0.08;
        if (Math.abs(delta) < 0.002) {
          currentAngle = targetAngle;
          targetAngle = null;
        }
      } else {
        currentAngle -= isHovered ? speed * 0.25 : speed;
      }
    }

    cards.forEach((card, i) => {
      const theta = currentAngle + (i * 2 * Math.PI) / total;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      // 3D Helical coordinates: X around cylinder, Y diagonal pitch + back-wave offset, Z depth
      const x = sinT * radiusX;
      const z = cosT * radiusZ;
      const y = sinT * pitchY - Math.sin(theta * 2) * 20;

      // Perspective tilt matching the 3D Helix gallery look
      const rotateY = sinT * -28;

      // Normalized depth [0 = back, 1 = front]
      const depth = (cosT + 1) / 2;
      const scale = 0.76 + depth * 0.26;
      const opacity = cosT >= 0
        ? 0.84 + 0.16 * cosT
        : 0.22 + 0.38 * depth;

      card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${rotateY.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = String(Math.round(depth * 100));
      card.classList.toggle('helix-front', cosT > 0.82);
    });

    requestAnimationFrame(renderHelix);
  }

  requestAnimationFrame(renderHelix);
})();


// ── STAT CARD MAGNETIC HOVER ─────────────────────────────
(function initMagnetic() {
  document.querySelectorAll('.stat-card').forEach(card => {
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
  updateSectionBlurOnScroll();
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
