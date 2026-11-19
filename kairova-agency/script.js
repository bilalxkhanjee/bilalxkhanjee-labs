(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rec = new URLSearchParams(location.search).get('rec') === '1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ease = 'cubic-bezier(.16, 1, .3, 1)';

  /* ---------- Nav pill slides to the hovered link ---------- */
  const nav = $('.h-nav'), pill = $('.nav-pill');
  const active = $('.h-nav a.is-active');
  function moveTo(a) {
    const nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
    pill.style.width = r.width + 'px';
    pill.style.transform = `translateX(${r.left - nr.left}px)`;
    $$('.h-nav a').forEach(x => x.classList.toggle('is-on', x === a));
  }
  if (nav && active) {
    moveTo(active);
    $$('.h-nav a').forEach(a => {
      a.addEventListener('mouseenter', () => moveTo(a));
      a.addEventListener('focus', () => moveTo(a));
    });
    nav.addEventListener('mouseleave', () => moveTo(active));
    addEventListener('resize', () => moveTo(active));
    document.fonts && document.fonts.ready.then(() => moveTo(active));
  }

  /* ---------- Counters ---------- */
  function countUp(el, dur = 1400) {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now();
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf;
      if (k < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0' + suf;
    requestAnimationFrame(tick);
  }

  /* ---------- Statement: one span per word ---------- */
  const stmt = $('[data-fill]');
  const words = [];
  if (stmt) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = part;
            frag.appendChild(s); words.push(s);
          });
          n.replaceWith(frag);
        }
      });
    };
    walk(stmt);
  }
  function setFill(p) { // p: 0..1 across reading order, 3-word soft edge
    const pos = p * (words.length + 3);
    words.forEach((w, i) => w.style.setProperty('--f', Math.min(1, Math.max(0, (pos - i) / 3)).toFixed(3)));
  }

  /* ---------- Trust: counters + avatars ---------- */
  const avatars = $$('.avatars li');
  let trustDone = false;
  function playTrust() {
    if (trustDone) return; trustDone = true;
    $$('[data-trust]').forEach(el => countUp(el));
    if (reduce) return;
    avatars.forEach((li, i) => li.animate(
      [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 650, delay: i * 70, easing: 'cubic-bezier(.34, 1.56, .64, 1)', fill: 'backwards' }
    ));
  }

  /* ---------- Load sequence ---------- */
  if (!reduce) {
    $$('.h-title .ln').forEach((ln, i) => ln.animate(
      [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }],
      { duration: 1000, delay: 120 + i * 110, easing: ease, fill: 'backwards' }
    ));
    const img = $('#hero-img');
    img && img.animate(
      [{ transform: 'translateY(40px)', filter: 'blur(14px)', opacity: 0 }, { transform: 'none', filter: 'blur(0)', opacity: 1 }],
      { duration: 1300, easing: ease, fill: 'backwards' }
    );
    nav && nav.animate(
      [{ transform: 'translateY(-24px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 900, delay: 150, easing: ease, fill: 'backwards' }
    );
    $$('[data-in]').forEach((el, i) => el.animate(
      [{ transform: 'translateY(14px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 800, delay: 300 + i * 55, easing: ease, fill: 'backwards' }
    ));
    $$('.h-logos li').forEach((el, i) => el.animate(
      [{ opacity: 0 }, { opacity: 1 }], { duration: 800, delay: 700 + i * 55, fill: 'backwards' }
    ));
    const fill = $('.out-fill');
    fill && fill.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: 1600, delay: 700, easing: ease, fill: 'backwards' });
  }
  $$('.hero [data-count]').forEach(el => countUp(el));

  /* ---------- Scroll-driven parts ---------- */
  const drifters = $$('#hero-img, .h-logos, .h-plate');
  const setDrift = y => drifters.forEach(d => d.style.setProperty('--drift', y.toFixed(1) + 'px'));

  if (reduce) {
    setFill(1); playTrust();
  } else if (rec) {
    // Recorder: whole page in one frame, so the scroll parts run on time.
    const t0 = performance.now();
    let lifted = false;
    const loop = t => {
      const s = (t - t0) / 1000;
      setDrift(s * 6);
      setFill(Math.min(1, Math.max(0, (s - 1.3) / (4.2 - 1.3))));
      if (s >= 3.5) playTrust();
      if (s >= 5.3 && !lifted) { lifted = true; $('.card--aw').classList.add('is-lift'); }
      if (s < 12) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  } else {
    let ticking = false;
    const onScroll = () => {
      ticking = false;
      const y = scrollY;
      if (y < innerHeight * 1.5) setDrift(y * 0.12);
      if (stmt) {
        const r = stmt.getBoundingClientRect();
        const start = innerHeight * 0.85, end = innerHeight * 0.35;
        setFill(Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height))));
      }
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();

    const panel = $('.panel');
    if (panel) {
      const io = new IntersectionObserver(es => {
        if (es.some(e => e.isIntersecting)) { playTrust(); io.disconnect(); }
      }, { threshold: 0.25 });
      io.observe(panel);
    }
  }
})();
