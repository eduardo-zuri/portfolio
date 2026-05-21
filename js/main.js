/* ============================================
   MAIN JS — orchestration
   Observers · nav · smooth scroll · text-reveal
   · counters · expandable work items · clipboard
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Intersection Observer for scroll animations ---
  const animatedElements = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach((el) => observer.observe(el));

  // --- Navigation scroll effect ---
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }, { passive: true });

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('is-active');
    navLinks.classList.toggle('is-open');
    document.body.style.overflow = navLinks.classList.contains('is-open') ? 'hidden' : '';
  });

  navLinks.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('is-active');
      navLinks.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // --- Text Reveal: split headings into words ---
  function splitIntoWords(el) {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.textContent = '';
    words.forEach((word, i) => {
      const wrap = document.createElement('span');
      wrap.className = 'word-wrap';
      const inner = document.createElement('span');
      inner.className = 'word';
      inner.textContent = word;
      inner.style.setProperty('--word-delay', `${i * 60}ms`);
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
  }

  const textRevealEls = document.querySelectorAll('[data-text-reveal]');
  const textRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        textRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

  textRevealEls.forEach((el) => {
    splitIntoWords(el);
    textRevealObserver.observe(el);
  });

  // --- Line Reveal ---
  function setupLineReveal(el) {
    const paragraphs = el.querySelectorAll('p');
    paragraphs.forEach((p, i) => {
      p.style.setProperty('--line-delay', `${i * 90}ms`);
    });
  }

  const lineRevealEls = document.querySelectorAll('[data-line-reveal]');
  const lineRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        lineRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  lineRevealEls.forEach((el) => {
    setupLineReveal(el);
    lineRevealObserver.observe(el);
  });

  // --- Count-up animations ---
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const duration = 1400;
    const start = performance.now();
    const startVal = 0;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = startVal + (target - startVal) * easeOutCubic(progress);
      el.textContent = Math.round(current);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }

    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll('.counter');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => countObserver.observe(el));

  // --- Marquee: clone items for seamless loop ---
  const marqueeTrack = document.querySelector('.marquee-strip__track');
  if (marqueeTrack) {
    marqueeTrack.innerHTML = marqueeTrack.innerHTML + marqueeTrack.innerHTML;
  }

  // --- Expandable work items ---
  document.querySelectorAll('.work-item').forEach((item) => {
    const header = item.querySelector('.work-item__header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.dataset.expanded === 'true';
      // Optional: collapse others (uncomment to behave like accordion)
      // document.querySelectorAll('.work-item').forEach(w => {
      //   if (w !== item) { w.dataset.expanded = 'false'; w.querySelector('.work-item__header').setAttribute('aria-expanded', 'false'); }
      // });
      item.dataset.expanded = isOpen ? 'false' : 'true';
      header.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // --- Copy to clipboard (all elements with data-copy) ---
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
      }
      btn.classList.add('is-copied');

      // Footer button: swap text temporarily
      if (btn.id === 'footer-copy-email') {
        const original = btn.textContent;
        btn.textContent = 'Email copiado ✓';
        setTimeout(() => { btn.textContent = original; btn.classList.remove('is-copied'); }, 1600);
      } else {
        setTimeout(() => btn.classList.remove('is-copied'), 1600);
      }
    });
  });

  // --- Tech card stagger on enter ---
  const techs = document.querySelectorAll('.tech');
  const techObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const i = entry.target.style.getPropertyValue('--i') || 0;
        entry.target.style.setProperty('--stagger-delay', `${i * 28}ms`);
        entry.target.classList.add('is-visible');
        techObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  techs.forEach((el) => techObserver.observe(el));

});
