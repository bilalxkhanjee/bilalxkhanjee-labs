/* Entrances for the added sections */
(() => {
  const els = [...document.querySelectorAll('[data-rise]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
  const counts = new Map();
  els.forEach(el => {
    const p = el.parentElement, n = counts.get(p) || 0;
    el.style.setProperty('--d', (n * 80) + 'ms');
    counts.set(p, n + 1);
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));
})();
