/**
 * FoodyVilla — script.js
 * Features: Navbar scroll, mobile menu, search toggle,
 *           scroll reveal, counter animation, menu filter,
 *           live search, form validation, back-to-top
 */

'use strict';

/* ═══════════════════════════════════════
   1. NAVBAR — scroll style + active link
═══════════════════════════════════════ */
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('navLinks');
const navLinkEls  = navLinks.querySelectorAll('.nav-link');
const backToTop   = document.getElementById('backToTop');

// Scroll-based navbar styling & back-to-top visibility
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Navbar glass effect
  navbar.classList.toggle('scrolled', scrollY > 60);

  // Back to top
  backToTop.classList.toggle('show', scrollY > 500);

  // Active nav link based on section in view
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(sec => {
    const top    = sec.offsetTop - 100;
    const bottom = top + sec.offsetHeight;
    const link   = navLinks.querySelector(`a[href="#${sec.id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < bottom);
    }
  });
}, { passive: true });

/* ═══════════════════════════════════════
   2. HAMBURGER MENU
═══════════════════════════════════════ */
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on link click
navLinkEls.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }
});

/* ═══════════════════════════════════════
   3. NAV SEARCH TOGGLE
═══════════════════════════════════════ */
const searchToggle  = document.getElementById('searchToggle');
const searchWrapper = document.getElementById('searchWrapper');
const navSearchInput = document.getElementById('navSearchInput');

searchToggle.addEventListener('click', () => {
  const isOpen = searchWrapper.classList.toggle('open');
  if (isOpen) {
    navSearchInput.focus();
  } else {
    navSearchInput.value = '';
  }
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && searchWrapper.classList.contains('open')) {
    searchWrapper.classList.remove('open');
    navSearchInput.value = '';
  }
});

// Pressing Enter in nav search scrolls to #menu and filters
navSearchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const query = navSearchInput.value.trim();
    if (query) {
      const menuSearch = document.getElementById('menuSearch');
      menuSearch.value = query;
      filterCards(query, 'all');
      document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
      searchWrapper.classList.remove('open');
      navSearchInput.value = '';
    }
  }
});

/* ═══════════════════════════════════════
   4. SMOOTH SCROLL for anchor links
═══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ═══════════════════════════════════════
   5. SCROLL REVEAL (IntersectionObserver)
═══════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

// Stagger reveal-cards
let cardDelay = 0;
document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});
document.querySelectorAll('.reveal-card').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.1}s`;
  revealObserver.observe(el);
});

/* ═══════════════════════════════════════
   6. COUNTER ANIMATION
═══════════════════════════════════════ */
const counters = document.querySelectorAll('.stat-num');
let countersStarted = false;

function animateCounters() {
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target, 10);
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current);
      }
    }, 16);
  });
}

const statsObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    animateCounters();
  }
}, { threshold: 0.5 });

const statsStrip = document.querySelector('.stats-strip');
if (statsStrip) statsObserver.observe(statsStrip);

/* ═══════════════════════════════════════
   7. MENU FILTER + LIVE SEARCH
═══════════════════════════════════════ */
const menuSearch  = document.getElementById('menuSearch');
const filterTabs  = document.querySelectorAll('.filter-tab');
const menuGrid    = document.getElementById('menuGrid');
const noResults   = document.getElementById('noResults');
let activeCategory = 'all';

function filterCards(query, cat) {
  const cards = menuGrid.querySelectorAll('.food-card');
  let visibleCount = 0;
  const q = query.toLowerCase().trim();

  cards.forEach(card => {
    const name    = (card.dataset.name  || '').toLowerCase();
    const catData = (card.dataset.cat   || '').toLowerCase();
    const desc    = (card.querySelector('p')?.textContent || '').toLowerCase();

    const matchesCat   = cat === 'all' || catData === cat;
    const matchesQuery = !q || name.includes(q) || desc.includes(q) || catData.includes(q);

    if (matchesCat && matchesQuery) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}

menuSearch.addEventListener('input', () => {
  filterCards(menuSearch.value, activeCategory);
});

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeCategory = tab.dataset.cat;
    filterCards(menuSearch.value, activeCategory);
  });
});

/* ═══════════════════════════════════════
   8. CONTACT FORM VALIDATION
═══════════════════════════════════════ */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setError(inputId, errId, msg) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  if (msg) {
    input.classList.add('error');
    err.textContent = msg;
    return false;
  } else {
    input.classList.remove('error');
    err.textContent = '';
    return true;
  }
}

contactForm.addEventListener('submit', e => {
  e.preventDefault();
  formSuccess.style.display = 'none';

  const name    = document.getElementById('fname').value.trim();
  const email   = document.getElementById('femail').value.trim();
  const message = document.getElementById('fmsg').value.trim();

  const nameOk  = setError('fname',  'nameErr',  name.length < 2 ? 'Please enter your full name.' : '');
  const emailOk = setError('femail', 'emailErr', !validateEmail(email) ? 'Please enter a valid email address.' : '');
  const msgOk   = setError('fmsg',   'msgErr',   message.length < 10 ? 'Your message must be at least 10 characters.' : '');

  if (nameOk && emailOk && msgOk) {
    // Simulate submission (GitHub Pages has no backend)
    const btn = contactForm.querySelector('button[type="submit"]');
    const origText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      contactForm.reset();
      formSuccess.style.display = 'block';
      btn.textContent = origText;
      btn.disabled = false;

      // Hide success after 6 seconds
      setTimeout(() => formSuccess.style.display = 'none', 6000);
    }, 1200);
  }
});

// Inline validation on blur
['fname', 'femail', 'fmsg'].forEach(id => {
  document.getElementById(id)?.addEventListener('blur', () => {
    const val = document.getElementById(id).value.trim();
    const errMap = {
      fname:  ['nameErr',  val.length < 2 ? 'Please enter your full name.' : ''],
      femail: ['emailErr', !validateEmail(val) ? 'Please enter a valid email address.' : ''],
      fmsg:   ['msgErr',   val.length < 10 && val.length > 0 ? 'Message too short.' : ''],
    };
    const [errId, msg] = errMap[id];
    setError(id, errId, msg);
  });
});

/* ═══════════════════════════════════════
   9. BACK TO TOP
═══════════════════════════════════════ */
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ═══════════════════════════════════════
   10. PAGE LOAD — trigger first reveal
═══════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  // Force hero animations on load
  const heroRevealEls = document.querySelectorAll('.hero .reveal-up');
  heroRevealEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 150 + i * 120);
  });
});
