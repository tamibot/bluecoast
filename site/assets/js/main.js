(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Footer year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky nav + scroll progress bar
  const nav = $('#nav');
  const progress = $('#progress');
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-solid', y > 80);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Section "in-view" class for heading underline + section__head reveal
  const sections = $$('.section');
  if ('IntersectionObserver' in window) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          sio.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    sections.forEach((s) => sio.observe(s));
  } else {
    sections.forEach((s) => s.classList.add('in-view'));
  }

  // Active nav link based on current section in view
  const navLinks = $$('.nav__links a');
  const byHash = new Map(navLinks.map((a) => [a.getAttribute('href'), a]));
  if ('IntersectionObserver' in window) {
    const aio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const id = '#' + e.target.id;
        const link = byHash.get(id);
        if (!link) return;
        if (e.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    ['porque', 'productos', 'especies', 'certificaciones', 'contacto'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) aio.observe(el);
    });
  }

  // Mobile nav toggle
  const toggle = $('#navToggle');
  const links = $('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll-reveal
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => {
      const parent = el.parentElement;
      const idx = parent ? Array.from(parent.children).indexOf(el) : 0;
      el.style.transitionDelay = `${Math.min(idx * 80, 400)}ms`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Species cards: expand/collapse
  $$('.sp__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('aria-controls');
      const list = document.getElementById(targetId);
      if (!list) return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) {
        list.hidden = true;
      } else {
        list.hidden = false;
        list.style.animation = 'slideIn .3s ease forwards';
      }
    });
  });

  if (!document.getElementById('sp-keyframes')) {
    const style = document.createElement('style');
    style.id = 'sp-keyframes';
    style.textContent = `@keyframes slideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`;
    document.head.appendChild(style);
  }

  // Why-us interactive flip cards (click/tap toggles; hover also flips on desktop)
  $$('.why__card').forEach((card) => {
    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(flipped));
    });
  });

  // Contact form → composes an email addressed to rodolfo.camino@bluecoastsac.com
  const CONTACT_TO = 'rodolfo.camino@bluecoastsac.com';
  const form = $('#contactForm');
  const msg = $('#formMsg');
  if (form && msg) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form).entries());
      if (!d.nombre || !d.email || !d.mensaje) {
        msg.textContent = 'Por favor completa nombre, email y mensaje.';
        msg.className = 'form__msg is-err';
        return;
      }
      const subject = `Consulta web — ${d.nombre}${d.empresa ? ' (' + d.empresa + ')' : ''}`;
      const body =
        `Nombre: ${d.nombre}\n` +
        `Empresa: ${d.empresa || '-'}\n` +
        `Email: ${d.email}\n` +
        `Teléfono: ${d.telefono || '-'}\n` +
        `Producto de interés: ${d.producto || '-'}\n\n` +
        `Mensaje:\n${d.mensaje}\n`;
      const mailto = `mailto:${CONTACT_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      msg.textContent = '✓ Abriendo tu correo para enviar el mensaje a Blue Coast…';
      msg.className = 'form__msg is-ok';
      setTimeout(() => form.reset(), 1200);
    });
  }

  // Animated counters on stats
  const counters = $$('[data-count]');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (counters.length && 'IntersectionObserver' in window && !prefersReduced) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => {
      c.textContent = c.dataset.count + (c.dataset.suffix || '');
    });
  }

  // Subtle mouse-parallax on hero
  const hero = $('.hero');
  const heroImg = $('.hero__media img');
  if (hero && heroImg && window.matchMedia('(hover:hover) and (pointer:fine)').matches && !prefersReduced) {
    let raf = 0;
    hero.addEventListener('mousemove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        heroImg.style.transform = `scale(1.1) translate3d(${dx * -20}px, ${dy * -14}px, 0)`;
        raf = 0;
      });
    });
    hero.addEventListener('mouseleave', () => {
      heroImg.style.transform = '';
    });
  }

  // Smooth scroll offset for fixed nav
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          const top = el.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });
})();
