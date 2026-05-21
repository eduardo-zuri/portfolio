/* ============================================
   PROGRESS BARS → DOT MATRIX
   Builds skill dot indicators from data-progress
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_DOTS = 10;
  const skills = document.querySelectorAll('.skill[data-progress]');

  skills.forEach((skill) => {
    const dotsContainer = skill.querySelector('.skill__dots');
    if (!dotsContainer) return;

    const progress = parseInt(skill.getAttribute('data-progress'), 10);
    const filled = Math.round((progress / 100) * TOTAL_DOTS);

    dotsContainer.innerHTML = '';
    for (let i = 0; i < TOTAL_DOTS; i++) {
      const dot = document.createElement('span');
      dot.className = 'skill__dot' + (i < filled ? ' skill__dot--filled' : '');
      dot.style.setProperty('--dot-delay', `${i * 40}ms`);
      dotsContainer.appendChild(dot);
    }
  });
});
