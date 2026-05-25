(() => {
  'use strict';
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Progressive enhancement flag: CSS only hides content for reveal when this
  // class is present. If JS fails to load, content stays fully visible.
  document.documentElement.classList.add('js');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // FAILSAFE: never leave content invisible. After load (or 2.5s max), force
  // every reveal element visible even if its IntersectionObserver never fired.
  const revealAllFailsafe = () => {
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
    document.body.classList.add('hero-ready');
  };
  window.addEventListener('load', () => setTimeout(revealAllFailsafe, 2500), { once: true });
  setTimeout(revealAllFailsafe, 4000);
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const root = document.documentElement;

  /* ---------- Footer year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav + scroll progress ---------- */
  const nav = $('#nav');
  const progress = $('#progress');
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-solid', y > 70);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Section "in-view" (heading underline + word reveals) ---------- */
  const sections = $$('.section');
  if ('IntersectionObserver' in window) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); sio.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    sections.forEach((s) => sio.observe(s));
  } else {
    sections.forEach((s) => s.classList.add('in-view'));
  }

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.nav__links a');
  const byHash = new Map(navLinks.map((a) => [a.getAttribute('href'), a]));
  if ('IntersectionObserver' in window) {
    const aio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const link = byHash.get('#' + e.target.id);
        if (!link) return;
        if (e.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    ['porque', 'productos', 'especies', 'certificaciones', 'contacto'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) aio.observe(el);
    });
  }

  /* ---------- Mobile nav toggle ---------- */
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

  /* ---------- Scroll-reveal (IO) with stagger ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => {
      if (el.closest('.hero')) return; // hero handled by the entrance timeline
      const parent = el.parentElement;
      const idx = parent ? Array.from(parent.children).indexOf(el) : 0;
      el.style.transitionDelay = `${Math.min(idx * 80, 420)}ms`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Generic visibility flag for badge shimmer etc. ---------- */
  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); vio.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    $$('.trust__item').forEach((el) => vio.observe(el));
  } else {
    $$('.trust__item').forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Catalog expand/collapse ---------- */
  $$('.sp__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const list = document.getElementById(btn.getAttribute('aria-controls'));
      if (!list) return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) {
        list.hidden = true;
      } else {
        list.hidden = false;
        if (!prefersReduced) list.style.animation = 'slideIn .35s ease forwards';
      }
    });
  });
  if (!document.getElementById('sp-keyframes')) {
    const style = document.createElement('style');
    style.id = 'sp-keyframes';
    style.textContent = '@keyframes slideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}';
    document.head.appendChild(style);
  }

  /* ---------- Bento tap/click reveal ---------- */
  $$('.bento__card').forEach((card) => {
    card.addEventListener('click', () => {
      const open = card.classList.toggle('is-open');
      card.setAttribute('aria-pressed', String(open));
    });
  });

  /* ---------- Contact form → mailto rodolfo.camino@bluecoastsac.com ---------- */
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
      window.location.href =
        `mailto:${CONTACT_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      msg.textContent = '✓ Abriendo tu correo para enviar el mensaje a Blue Coast…';
      msg.className = 'form__msg is-ok';
      setTimeout(() => form.reset(), 1200);
    });
  }

  /* ---------- Smooth anchor scroll with nav offset ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          const top = el.getBoundingClientRect().top + window.scrollY - 76;
          window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
        }
      }
    });
  });

  /* ======================================================================
     HERO entrance timeline
     ====================================================================== */
  const fireHero = () => document.body.classList.add('hero-ready');
  if (document.readyState === 'complete') {
    requestAnimationFrame(fireHero);
  } else {
    window.addEventListener('load', () => requestAnimationFrame(fireHero), { once: true });
    setTimeout(fireHero, 600);
  }

  /* ======================================================================
     KINETIC HERO TYPE — weight/translate shift on scroll
     ====================================================================== */
  const heroTitle = $('[data-kinetic]');
  const heroLines = $$('.hero__line');
  const hero = $('.hero');
  if (heroTitle && heroLines.length && !prefersReduced) {
    let kraf = 0;
    const onKinetic = () => {
      kraf = 0;
      const h = hero ? hero.offsetHeight : window.innerHeight;
      const p = Math.min(1, Math.max(0, window.scrollY / (h * 0.9))); // 0..1 through hero
      heroLines.forEach((line, i) => {
        const dir = i === 0 ? -1 : 1;
        line.style.transform = `translateX(${(p * 36 * dir).toFixed(1)}px)`;
        line.style.opacity = String(1 - p * 0.5);
      });
    };
    document.addEventListener('scroll', () => {
      if (!kraf && window.scrollY < (hero ? hero.offsetHeight : window.innerHeight)) {
        kraf = requestAnimationFrame(onKinetic);
      }
    }, { passive: true });
  }

  /* ======================================================================
     HERO mouse parallax — light layers + floating marks
     ====================================================================== */
  const glow = $('.hero__glow');
  const rays = $('.hero__rays');
  const caustics = $('.hero__caustics');
  const markFar = $('.hero__mark--far');
  const markNear = $('.hero__mark--near');
  if (hero && finePointer && !prefersReduced) {
    let praf = 0;
    hero.addEventListener('mousemove', (e) => {
      if (praf) return;
      praf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        if (rays) rays.style.transform = `translate3d(${dx * 28}px, ${dy * 14}px, 0)`;
        if (glow) glow.style.transform = `translate3d(${dx * 20}px, ${dy * 12}px, 0)`;
        if (caustics) caustics.style.transform = `translate3d(${dx * -16}px, ${dy * -10}px, 0)`;
        if (markNear) markNear.style.transform = `translate3d(${dx * 34}px, ${dy * 22}px, 0)`;
        if (markFar) markFar.style.transform = `translate3d(${dx * -18}px, ${dy * -12}px, 0)`;
        praf = 0;
      });
    });
    hero.addEventListener('mouseleave', () => {
      [rays, glow, caustics, markNear, markFar].forEach((el) => { if (el) el.style.transform = ''; });
    });
  }

  /* ======================================================================
     MAGNETIC primary buttons
     ====================================================================== */
  if (finePointer && !prefersReduced) {
    $$('.btn--primary').forEach((btn) => {
      const STRENGTH = 0.28, MAX = 10;
      let mraf = 0;
      btn.addEventListener('pointermove', (e) => {
        if (mraf) return;
        mraf = requestAnimationFrame(() => {
          const r = btn.getBoundingClientRect();
          let dx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
          let dy = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
          dx = Math.max(-MAX, Math.min(MAX, dx));
          dy = Math.max(-MAX, Math.min(MAX, dy));
          btn.style.setProperty('--mx', dx.toFixed(1) + 'px');
          btn.style.setProperty('--my', dy.toFixed(1) + 'px');
          mraf = 0;
        });
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }

  /* ======================================================================
     POINTER-TRACKED card glow (paint-only --px/--py)
     ====================================================================== */
  if (finePointer && !prefersReduced) {
    $$('.sp, .tcard, .trust__item, .pcard').forEach((card) => {
      let graf = 0;
      card.addEventListener('pointermove', (e) => {
        if (graf) return;
        graf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
          card.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
          graf = 0;
        });
      });
    });
  }

  /* ======================================================================
     3D tilt on product spec cards
     ====================================================================== */
  if (finePointer && !prefersReduced) {
    $$('.pcard').forEach((card) => {
      const MAXTILT = 5;
      let traf = 0;
      card.addEventListener('pointerenter', () => card.classList.add('is-tilting'));
      card.addEventListener('pointermove', (e) => {
        if (traf) return;
        traf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const cx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          const cy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          card.style.setProperty('--ry', (Math.max(-1, Math.min(1, cx)) * MAXTILT).toFixed(2) + 'deg');
          card.style.setProperty('--rx', (Math.max(-1, Math.min(1, cy)) * -MAXTILT).toFixed(2) + 'deg');
          traf = 0;
        });
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ======================================================================
     SPLIT-TEXT word reveals on section H2s
     ====================================================================== */
  const splitWords = (el) => {
    if (!el || el.dataset.split === '1') return;
    const fullText = el.textContent;
    if (!fullText || !fullText.trim()) return;
    el.setAttribute('aria-label', fullText.trim());
    const wiRef = { n: 0 };
    const wrapWords = (node, sink) => {
      node.textContent.split(/(\s+)/).forEach((tok) => {
        if (tok === '') return;
        if (tok.trim() === '') { sink.appendChild(document.createTextNode(tok)); return; }
        const span = document.createElement('span');
        span.className = 'word';
        span.setAttribute('aria-hidden', 'true');
        span.style.setProperty('--wi', String(wiRef.n++));
        span.textContent = tok;
        sink.appendChild(span);
      });
    };
    const frag = document.createDocumentFragment();
    Array.from(el.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        wrapWords(child, frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        child.classList.add('word');
        child.setAttribute('aria-hidden', 'true');
        child.style.setProperty('--wi', String(wiRef.n++));
        frag.appendChild(child);
      } else {
        frag.appendChild(child.cloneNode(true));
      }
    });
    el.textContent = '';
    el.appendChild(frag);
    el.classList.add('split-ready');
    el.dataset.split = '1';
  };
  if (!prefersReduced) {
    $$('.section__head h2').forEach(splitWords);
    setTimeout(() => { $$('.word').forEach((w) => { w.style.willChange = 'auto'; }); }, 4500);
  }

  /* ======================================================================
     Scroll-driven fallbacks for browsers without animation-timeline: view()
     ====================================================================== */
  const supportsView = 'CSS' in window && CSS.supports && CSS.supports('animation-timeline: view()');
  if (!supportsView && !prefersReduced && 'IntersectionObserver' in window) {
    // mark grids/cards visible via .reveal-style so they don't stay hidden
    const fio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); fio.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    $$('.bento__card, .pcard, .sp, .tcard').forEach((el) => {
      el.classList.add('reveal');
      fio.observe(el);
    });
  }

  /* ======================================================================
     ONE-TIME load intro
     ====================================================================== */
  const intro = $('#intro');
  if (intro && !prefersReduced) {
    let cleaned = false;
    const finish = () => {
      if (cleaned) return;
      cleaned = true;
      intro.classList.add('is-done');
      if (intro.parentNode) intro.parentNode.removeChild(intro);
    };
    requestAnimationFrame(() => intro.classList.add('intro-play'));
    const introTimer = setTimeout(finish, 1300);
    const skip = () => { clearTimeout(introTimer); finish(); };
    window.addEventListener('wheel', skip, { once: true, passive: true });
    window.addEventListener('touchstart', skip, { once: true, passive: true });
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });
  } else if (intro) {
    intro.classList.add('is-done');
    if (intro.parentNode) intro.parentNode.removeChild(intro);
  }
})();
