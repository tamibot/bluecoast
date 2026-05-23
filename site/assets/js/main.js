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

  // Section "in-view" class for heading underline + section__head reveal.
  // Include .trust (certifications) which uses its own class, not .section.
  const sections = $$('.section, .trust');
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
          window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
        }
      }
    });
  });

  /* ======================================================================
     v8 MOTION SYSTEM
     ====================================================================== */
  const root = document.documentElement;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* --- 1. Hero entrance timeline ---
     Fire the choreographed sequence once the page is painted. The CSS owns the
     staggered delays; we just flip the switch (and bail gracefully if reduced
     motion — the elements are forced visible by the reduced-motion guard). */
  const fireHero = () => document.body.classList.add('hero-ready');
  if (document.readyState === 'complete') {
    requestAnimationFrame(fireHero);
  } else {
    window.addEventListener('load', () => requestAnimationFrame(fireHero), { once: true });
    // Safety net so the hero never stays hidden if `load` is delayed.
    setTimeout(fireHero, 600);
  }

  /* --- 2. Scroll velocity → reactive wave dividers ---
     Track signed scroll velocity (px/frame, smoothed) and push each divider's
     crest horizontally. Pure transform via a registered custom property, so it
     runs on the compositor. Eases back to rest when scrolling stops. */
  const dividerPaths = $$('.divider svg > path');
  dividerPaths.forEach((p) => p.parentElement.parentElement.setAttribute('data-react', ''));
  if (dividerPaths.length && !prefersReduced) {
    let lastY = window.scrollY;
    let vel = 0;          // smoothed velocity
    let velRaf = 0;
    const MAXSHIFT = 26;  // px crest push at high speed

    const sampleVel = () => {
      const y = window.scrollY;
      const raw = y - lastY;
      lastY = y;
      // exponential smoothing toward the raw delta, decay toward 0 when idle
      vel += (raw - vel) * 0.18;
      root.style.setProperty('--scroll-vel', vel.toFixed(2));
      root.style.setProperty('--scroll-dir', vel >= 0 ? '1' : '-1');
      const shift = Math.max(-MAXSHIFT, Math.min(MAXSHIFT, vel * 1.6));
      // alternate direction per divider so adjacent crests feel woven
      dividerPaths.forEach((p, i) => {
        const s = (i % 2 === 0 ? shift : -shift);
        p.style.setProperty('--wave-shift', s.toFixed(1) + 'px');
      });
      // keep sampling while there's residual motion, then idle
      if (Math.abs(vel) > 0.05) {
        velRaf = requestAnimationFrame(sampleVel);
      } else {
        vel = 0;
        dividerPaths.forEach((p) => p.style.setProperty('--wave-shift', '0px'));
        velRaf = 0;
      }
    };
    document.addEventListener('scroll', () => {
      if (!velRaf) velRaf = requestAnimationFrame(sampleVel);
    }, { passive: true });
  }

  /* --- 3. Lightweight inertia/smooth scrolling (desktop, fine pointer only) ---
     Wheel-driven lerp that eases the page toward a target offset for a fluid,
     high-end feel. Deliberately conservative: disabled on touch, on reduced
     motion, and whenever the mobile nav menu is open. Native keyboard / anchor
     / scrollbar behaviour is preserved (we only intercept wheel deltas and let
     the loop converge, then yield). */
  const canSmooth = finePointer && !prefersReduced &&
                    typeof window.requestAnimationFrame === 'function';
  if (canSmooth) {
    let target = window.scrollY;
    let current = window.scrollY;
    let running = false;
    let raf = 0;
    const EASE = 0.12;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const loop = () => {
      const diff = target - current;
      if (Math.abs(diff) < 0.4) {
        current = target;
        window.scrollTo(0, current);
        running = false;
        raf = 0;
        return;
      }
      current += diff * EASE;
      window.scrollTo(0, current);
      raf = requestAnimationFrame(loop);
    };

    const onWheel = (e) => {
      // Respect menus, modifier zoom, and horizontal intent.
      if (e.ctrlKey || e.metaKey) return;
      const menuOpen = links && links.classList.contains('is-open');
      if (menuOpen) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      // line-mode wheels report small deltas; scale them up.
      const unit = e.deltaMode === 1 ? 32 : (e.deltaMode === 2 ? window.innerHeight : 1);
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * unit));
      if (!running) {
        running = true;
        current = window.scrollY;
        raf = requestAnimationFrame(loop);
      }
    };

    // Keep target in sync when the user scrolls by other means (keys, bar,
    // anchor jumps, touchpad momentum we didn't drive) so we never fight them.
    const resync = () => { if (!running) { target = window.scrollY; current = target; } };

    root.classList.add('smooth-scroll');
    window.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('scroll', resync, { passive: true });
    window.addEventListener('resize', () => {
      target = Math.max(0, Math.min(maxScroll(), target));
    }, { passive: true });
    // Cancel the lerp the instant a touch starts (hybrid laptops).
    window.addEventListener('touchstart', () => {
      if (raf) cancelAnimationFrame(raf);
      running = false; raf = 0;
    }, { passive: true });
  }

  /* --- 4. Magnetic primary buttons (fine pointer only) ---
     The button drifts a few px toward the cursor, then snaps back. Transform
     is composed in CSS via --mx/--my so it layers with the hover lift. */
  if (finePointer && !prefersReduced) {
    $$('.btn--primary').forEach((btn) => {
      const STRENGTH = 0.28; // fraction of offset from center
      const MAX = 10;        // px clamp
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

  /* --- 5. Pointer-tracked card glow (fine pointer only) ---
     Writes --px/--py (percent) so the CSS radial highlight follows the cursor.
     Paint-only; cards already define the gradient + transition. */
  if (finePointer && !prefersReduced) {
    const glowCards = $$('.sp, .tcard, .trust__item, .pcard');
    glowCards.forEach((card) => {
      let graf = 0;
      card.addEventListener('pointermove', (e) => {
        if (graf) return;
        graf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * 100;
          const py = ((e.clientY - r.top) / r.height) * 100;
          card.style.setProperty('--px', px.toFixed(1) + '%');
          card.style.setProperty('--py', py.toFixed(1) + '%');
          graf = 0;
        });
      });
    });
  }

  /* ======================================================================
     v9 MOTION — richer reveals & interactions (builds on v8)
     ====================================================================== */

  /* --- 6. Per-word split-text reveals (hero title + section H2s) ---
     We wrap each word in <span class="word" style="--wi:n"> while preserving
     the original text node order, so screen readers still read the full phrase
     (the wrapper keeps the same characters; we mark the H2 as aria-label too
     for safety). Skipped entirely under reduced motion. */
  const splitWords = (el) => {
    if (!el || el.dataset.split === '1') return;
    const fullText = el.textContent;
    if (!fullText || !fullText.trim()) return;
    el.setAttribute('aria-label', fullText.trim());

    // Structure-preserving split: walk top-level child nodes. Text nodes are
    // tokenised into per-word .word spans; element children (e.g. styled <em>)
    // are kept intact and become a single animated .word unit, so visible text,
    // markup and styling are unchanged — only motion is added.
    const wiRef = { n: 0 };
    const wrapWords = (node, sink) => {
      const tokens = node.textContent.split(/(\s+)/);
      tokens.forEach((tok) => {
        if (tok === '') return;
        if (tok.trim() === '') {
          sink.appendChild(document.createTextNode(tok));
          return;
        }
        const span = document.createElement('span');
        span.className = 'word';
        span.setAttribute('aria-hidden', 'true'); // aria-label on parent reads it
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
        // Preserve the element (and its styling); animate it as one word.
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
    // Section/trust H2s get per-word reveals. (The hero title words keep their
    // existing whole-phrase entrance: "Hidrobiológicos" carries a gradient
    // text-fill that a per-letter/word split would break, and each line is a
    // single word anyway, so splitting adds no stagger there.)
    $$('.section__head h2, .trust .section__head h2').forEach(splitWords);
    // Clear will-change after the longest reveal could have finished, so we
    // don't keep compositor layers around forever.
    setTimeout(() => {
      $$('.word').forEach((w) => { w.style.willChange = 'auto'; });
    }, 4000);
  }

  /* --- 7. Divider draw-in fallback (only where view() is unsupported) ---
     Native browsers handle this via animation-timeline in CSS. */
  const supportsViewTimeline =
    'CSS' in window && CSS.supports && CSS.supports('animation-timeline: view()');
  if (!prefersReduced && !supportsViewTimeline && 'IntersectionObserver' in window) {
    const dio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('draw-in');
          dio.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    $$('.divider').forEach((d) => dio.observe(d));
  }

  /* --- 8. 3D tilt on product spec cards (fine pointer only) ---
     Pointer position maps to a small rotateX/rotateY. Clamped, rAF-throttled,
     transform-only. Combines with the existing --px/--py glow (set above). */
  if (finePointer && !prefersReduced) {
    $$('.pcard').forEach((card) => {
      const MAXTILT = 6; // degrees
      let traf = 0;
      card.addEventListener('pointerenter', () => card.classList.add('is-tilting'));
      card.addEventListener('pointermove', (e) => {
        if (traf) return;
        traf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const cx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);  // -1..1
          const cy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2); // -1..1
          const ry = Math.max(-1, Math.min(1, cx)) * MAXTILT;
          const rx = Math.max(-1, Math.min(1, cy)) * -MAXTILT;
          card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
          card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
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
})();
