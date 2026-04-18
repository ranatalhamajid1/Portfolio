/* ============================================================
   MAIN JAVASCRIPT — Talha Portfolio
   Features:
   - Custom cursor
   - Scroll progress bar
   - Navbar scroll behavior
   - Mobile menu toggle
   - Theme toggle (dark/light)
   - GSAP reveal animations + ScrollTrigger
   - Skill bar animations
   - Counter/stat animations
   - Project video hover play
   - Project filter
   - Contact form AJAX submit
   - Typing text effect
============================================================ */

'use strict';

// ─── GSAP Plugin Registration ─────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ─── DOM Ready ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  initCursor();
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initThemeToggle();
  initRevealAnimations();
  initTypingEffect();
  initCounters();
  initSkillBars();
  initProjectFilter();
  initProjectVideoHover();
  initContactForm();
  initSmoothScroll();

});

// ─────────────────────────────────────────────────────────
// 1. CUSTOM CURSOR
// ─────────────────────────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (!cursor || !follower || window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Follower uses lerp for smoothness
  const tick = () => {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(tick);
  };
  tick();

  // Hover interactions
  const hoverEls = document.querySelectorAll(
    'a, button, .project-card, .service-card, .skill-card, [data-cursor-hover]'
  );
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
      follower.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
      follower.classList.remove('cursor-hover');
    });
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '0.5';
  });
}

// ─────────────────────────────────────────────────────────
// 2. SCROLL PROGRESS BAR
// ─────────────────────────────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct   = (window.scrollY / total) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}

// ─────────────────────────────────────────────────────────
// 3. NAVBAR — scroll effect
// ─────────────────────────────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link highlight
  const links = nav.querySelectorAll('.nav-link');
  const sections = [...links].map(l => {
    const target = l.getAttribute('href').replace('#', '');
    return document.getElementById(target);
  }).filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

// ─────────────────────────────────────────────────────────
// 4. MOBILE MENU
// ─────────────────────────────────────────────────────────
function initMobileMenu() {
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!hamburger || !mobileMenu) return;

  const toggle = (force) => {
    const isActive = force !== undefined ? force : !hamburger.classList.contains('active');
    hamburger.classList.toggle('active', isActive);
    mobileMenu.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => toggle());

  mobileLinks.forEach(l => l.addEventListener('click', () => toggle(false)));

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      toggle(false);
    }
  });
}

// ─────────────────────────────────────────────────────────
// 5. THEME TOGGLE (Dark / Light)
// ─────────────────────────────────────────────────────────
function initThemeToggle() {
  const btn  = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const html = document.documentElement;

  if (!btn) return;

  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('portfolio-theme', next);
  });

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
  }
}

// ─────────────────────────────────────────────────────────
// 6. GSAP REVEAL ANIMATIONS
// ─────────────────────────────────────────────────────────
function initRevealAnimations() {
  // Stagger children inside grids
  const staggerContainers = [
    '.hero-stats',
    '.skills-grid',
    '.projects-grid',
    '.services-grid',
    '.results-grid',
    '.contact-links',
  ];

  staggerContainers.forEach(selector => {
    const container = document.querySelector(selector);
    if (!container) return;

    const children = container.querySelectorAll('.reveal, .stat-item, .result-card, .service-card, .skill-card, .project-card, .contact-link');
    if (!children.length) return;

    gsap.from(children, {
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      onComplete: () => {
        children.forEach(c => {
          c.classList.add('revealed');
          c.style.opacity = '';
          c.style.transform = '';
        });
      }
    });
  });

  // Generic .reveal elements using IntersectionObserver (fallback / extra)
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        setTimeout(() => {
          el.classList.add('revealed');
        }, parseFloat(delay) * 1000);
        io.unobserve(el);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  reveals.forEach(el => io.observe(el));
}

// ─────────────────────────────────────────────────────────
// 7. TYPING EFFECT
// ─────────────────────────────────────────────────────────
function initTypingEffect() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const strings = [
    'Full Stack Developer',
    'Cybersecurity Enthusiast',
    'E-Commerce Strategist',
    'Video Editor & Creator',
    'Founder of NexaGrowth',
  ];

  let strIdx   = 0;
  let charIdx  = 0;
  let deleting = false;
  let pause    = false;

  const TYPING_SPEED  = 65;
  const ERASING_SPEED = 35;
  const PAUSE_MS      = 1800;

  const type = () => {
    if (pause) return;

    const current = strings[strIdx];

    if (!deleting) {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;

      if (charIdx === current.length) {
        pause = true;
        setTimeout(() => {
          pause    = false;
          deleting = true;
          setTimeout(type, ERASING_SPEED);
        }, PAUSE_MS);
        return;
      }
    } else {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;

      if (charIdx === 0) {
        deleting = false;
        strIdx   = (strIdx + 1) % strings.length;
      }
    }

    setTimeout(type, deleting ? ERASING_SPEED : TYPING_SPEED);
  };

  setTimeout(type, 800);
}

// ─────────────────────────────────────────────────────────
// 8. ANIMATED COUNTERS
// ─────────────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-target]');

  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const isDecimal = !Number.isInteger(target);
    let startTime = null;

    const update = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const value = ease * target;

      el.textContent = isDecimal
        ? value.toFixed(1) + suffix
        : Math.round(value) + suffix;

      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
}

// ─────────────────────────────────────────────────────────
// 9. SKILL BAR ANIMATIONS
// ─────────────────────────────────────────────────────────
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width') || '0';
        bar.style.width = width + '%';
        io.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => io.observe(b));
}

// ─────────────────────────────────────────────────────────
// 10. PROJECT FILTER
// ─────────────────────────────────────────────────────────
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card[data-category]');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.classList.remove('hidden');
          gsap.fromTo(card,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
          );
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// ─────────────────────────────────────────────────────────
// 11. PROJECT VIDEO HOVER PLAY
// ─────────────────────────────────────────────────────────
function initProjectVideoHover() {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    const video = card.querySelector('.project-video');
    if (!video) return;

    // Set initial state
    video.pause();

    card.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}

// ─────────────────────────────────────────────────────────
// 12. CONTACT FORM (AJAX)
// ─────────────────────────────────────────────────────────
function initContactForm() {
  // Let FormSubmit handle it naturally based on index.html
}

// ─────────────────────────────────────────────────────────
// 13. SMOOTH SCROLL for anchor links
// ─────────────────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = 64;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
