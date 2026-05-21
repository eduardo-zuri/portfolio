/* ============================================
   TYPING EFFECT + MAGNETIC HOVER
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Typing effect for hero role ---
  const element = document.getElementById('typed-role');
  if (element) {
    const roles = [
      'desenvolvedor',
      'infraestrutura de TI',
      'redes & servidores',
      'python & sql',
      'ciência da computação'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeSpeed = 70;
    const deleteSpeed = 32;
    const pauseAfterType = 2200;
    const pauseAfterDelete = 320;

    function tick() {
      const currentRole = roles[roleIndex];
      if (!isDeleting) {
        element.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentRole.length) {
          isDeleting = true;
          setTimeout(tick, pauseAfterType);
          return;
        }
        setTimeout(tick, typeSpeed + Math.random() * 40);
      } else {
        element.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(tick, pauseAfterDelete);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    }

    setTimeout(tick, 800);
  }

  // --- Magnetic hover on interactive elements ---
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  // Primary button uses CSS custom-prop transform composition (works w/ hover translate)
  document.querySelectorAll('.btn--primary').forEach((el) => {
    const strength = 0.2;
    let raf;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${x * strength}px`);
        el.style.setProperty('--my', `${y * strength}px`);
      });
    });
    el.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    });
  });

  // Generic magnetic — uses direct transform on the inner content via translate
  // Applied to: contact CTA, contact links, work item titles
  function applyMagnetic(selector, strength) {
    document.querySelectorAll(selector).forEach((el) => {
      let raf;
      const orig = el.style.transform;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        el.style.transform = orig;
      });
    });
  }

  applyMagnetic('.contact__link', 0.18);

});
