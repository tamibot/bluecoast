(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // year
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // sticky nav
  const nav = $('#nav');
  addEventListener('scroll', () => { if (nav) nav.classList.toggle('is-solid', scrollY > 40); }, { passive: true });
  if (nav && scrollY > 40) nav.classList.add('is-solid');

  // mobile menu
  const burger = $('#burger'), links = $('.nav__links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', e => { if (e.target.tagName === 'A') { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
  }

  // active nav link
  const map = new Map($$('.nav__links a').map(a => [a.getAttribute('href'), a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      const l = map.get('#' + e.target.id); if (!l) return;
      if (e.isIntersecting) { $$('.nav__links a').forEach(x => x.classList.remove('is-active')); l.classList.add('is-active'); }
    }), { rootMargin: '-45% 0px -50% 0px' });
    ['nosotros', 'productos', 'catalogo', 'certificaciones', 'contacto'].forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  // reveal on scroll. Anything already in view on load reveals immediately
  // (no blank above-the-fold); the rest animate in as they enter; a short
  // failsafe guarantees nothing ever stays hidden.
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const inView = (el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
    reveals.forEach((el) => {
      const p = el.parentElement, idx = p ? [...p.children].indexOf(el) : 0;
      el.style.transitionDelay = Math.min(idx * 70, 350) + 'ms';
    });
    // immediate pass: reveal what's already on screen
    reveals.forEach((el) => { if (inView(el)) el.classList.add('in'); });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });
    // failsafe: never leave anything hidden
    const revealAll = () => reveals.forEach(el => el.classList.add('in'));
    addEventListener('load', () => setTimeout(revealAll, 1500), { once: true });
    setTimeout(revealAll, 2600);
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // catalog accordion
  $$('.cat__head').forEach(btn => {
    const panel = btn.nextElementSibling;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.style.maxHeight = open ? '0' : panel.scrollHeight + 'px';
    });
  });

  // contact form → mailto rodolfo
  const TO = 'rodolfo.camino@bluecoastsac.com';
  const form = $('#contactForm'), msg = $('#formMsg');
  if (form && msg) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form).entries());
      if (!d.nombre || !d.email || !d.mensaje) { msg.textContent = 'Completa nombre, email y mensaje.'; msg.className = 'form__msg err'; return; }
      const subject = `Consulta web — ${d.nombre}${d.empresa ? ' (' + d.empresa + ')' : ''}`;
      const body = `Nombre: ${d.nombre}\nEmpresa: ${d.empresa || '-'}\nEmail: ${d.email}\nTeléfono: ${d.telefono || '-'}\nProducto: ${d.producto || '-'}\n\nMensaje:\n${d.mensaje}\n`;
      location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      msg.textContent = '✓ Abriendo tu correo para enviar a Blue Coast…'; msg.className = 'form__msg ok';
      setTimeout(() => form.reset(), 1200);
    });
  }

  // smooth anchor scroll
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const el = document.querySelector(id); if (!el) return;
    e.preventDefault();
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: reduce ? 'auto' : 'smooth' });
  }));
})();
