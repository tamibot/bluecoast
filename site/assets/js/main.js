(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // --- Footer year ---
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Sticky nav + scroll progress + FAB visibility ---
  const nav = $('#nav');
  const progress = $('#progress');
  const fab = $('.fab');
  const hero = $('.hero');
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-solid', y > 60);
    if (progress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
      progress.style.width = `${pct}%`;
    }
    if (fab && hero) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      fab.classList.toggle('is-visible', y > heroBottom - 200);
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile nav toggle ---
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

  // --- Hero: word-by-word title reveal ---
  const heroTitle = $('.hero__title');
  if (heroTitle && !heroTitle.dataset.split) {
    heroTitle.dataset.split = '1';
    heroTitle.classList.add('word-reveal');
    // Walk text nodes; wrap each word in <span class="word">
    const wrapWords = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) {
            frag.appendChild(document.createTextNode(p));
          } else {
            const s = document.createElement('span');
            s.className = 'word';
            s.textContent = p;
            frag.appendChild(s);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrapWords);
      }
    };
    wrapWords(heroTitle);
    // Stagger reveal
    const words = $$('.word', heroTitle);
    words.forEach((w, i) => {
      w.style.transitionDelay = `${200 + i * 70}ms`;
      requestAnimationFrame(() => w.classList.add('is-visible'));
    });
  }

  // --- Scroll-reveal ---
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
      el.style.transitionDelay = `${Math.min(idx * 90, 500)}ms`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // --- Counter animation for hero stats ---
  const counters = $$('[data-count]');
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
      const suffix = c.dataset.suffix || '';
      c.textContent = c.dataset.count + suffix;
    });
  }

  // --- Hero parallax + spotlight ---
  const heroImg = $('.hero__media img');
  const heroFloats = $$('.hero__float');
  if (heroImg && !prefersReduced) {
    let ticking = false;
    const parallax = () => {
      const y = Math.min(window.scrollY, 800);
      heroImg.style.transform = `translate3d(0, ${y * 0.2}px, 0) scale(1.1)`;
      heroFloats.forEach((f, i) => {
        f.style.transform = `translate3d(${y * (i === 0 ? -0.08 : 0.05)}px, ${y * 0.15}px, 0)`;
      });
      ticking = false;
    };
    document.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
  }
  if (hero && hasHover && !prefersReduced) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      hero.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  }

  // --- Species cards: expand/collapse ---
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
        list.style.animation = 'slideIn .35s ease forwards';
      }
    });
  });

  // Inject slide-in keyframes
  if (!document.getElementById('sp-keyframes')) {
    const style = document.createElement('style');
    style.id = 'sp-keyframes';
    style.textContent = `@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}`;
    document.head.appendChild(style);
  }

  // --- 3D tilt on feature / about cards ---
  if (hasHover && !prefersReduced) {
    const tiltTargets = $$('.feature, .vcard');
    tiltTargets.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  // --- Magnetic buttons (desktop) ---
  if (hasHover && !prefersReduced) {
    $$('.btn--primary, .btn--outline, .fab').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18 - 2}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // --- Contact form (demo; no backend) ---
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

  // --- Smooth scroll offset for fixed nav ---
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
