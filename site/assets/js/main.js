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
    ['proceso', 'productos', 'especies', 'testimonios', 'contacto'].forEach((id) => {
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

  // Contact form (demo; no backend)
  const form = $('#contactForm');
  const msg = $('#formMsg');
  if (form && msg) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.nombre || !data.email || !data.mensaje) {
        msg.textContent = 'Por favor completa nombre, email y mensaje.';
        msg.className = 'form__msg is-err';
        return;
      }
      msg.textContent = 'Enviando…';
      msg.className = 'form__msg';
      setTimeout(() => {
        msg.textContent = '✓ Recibimos tu propuesta. Te contactaremos pronto.';
        msg.className = 'form__msg is-ok';
        form.reset();
      }, 700);
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
