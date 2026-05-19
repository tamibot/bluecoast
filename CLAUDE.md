# Bluecoast — Documento de Handoff para IA

> **Última actualización**: 2026-05-19 · commit `26618b6` en `main`
> Lee este documento de principio a fin antes de tocar el proyecto.
> Si haces cambios estructurales, **actualízalo** al final de tu sesión.

---

## 1. Resumen ejecutivo

Sitio web de marketing estático para **Blue Coast S.A.C.**, una empresa peruana
exportadora de productos hidrobiológicos (perico, pota, pulpo, calamar y otros
peces del Pacífico peruano).

- **Stack**: HTML/CSS/JS plano. Sin frameworks, sin build step.
- **Repo**: https://github.com/tamibot/bluecoast (**PRIVADO**)
- **Deploy primario**: Railway (Staticfile provider, puerto 8080)
- **Deploy secundario**: GitHub Pages — **CAÍDO** porque al volver el repo
  privado en plan free de GitHub se desactiva Pages. Si lo necesitas:
  re-abrir a público, hacer upgrade a Pro, o usar dominio propio.
- **Tono del cliente**: minimalista, fiel al original Lovable, **azul-only**,
  **sin tipografías cursivas/serif italics**.

---

## 2. Datos reales de la empresa

| Campo | Valor |
|---|---|
| Razón social | Blue Coast S.A.C. |
| Gerente General | Francisco Javier Camino Calle |
| Email | javier.camino@bluecoastsac.com |
| Teléfonos | +51 73 312291 · +51 994 076 286 |
| Dirección | Calle Bolívar Nº 244, Sullana — Piura, Perú |
| Industria | Productos hidrobiológicos premium para exportación |
| Sitio original que se replicó | https://bluecoast-seafood-solutions.lovable.app/ |

---

## 3. Estructura del proyecto

```
bluecoast/
├── site/                     # ★ El sitio público (lo que se sirve)
│   ├── index.html
│   ├── .nojekyll             # impide procesamiento Jekyll en Pages
│   └── assets/
│       ├── css/style.css     # ~1100 líneas, palette ocean-blue
│       ├── js/main.js        # vanilla JS con IntersectionObserver
│       └── images/
│           ├── hero-sunset.jpg          # foto del atardecer
│           ├── process-*.jpg            # 3 fotos del proceso
│           ├── real-perico-porciones.jpg# 1174×1126 (~cuadrado)
│           ├── real-perico-filetes.jpg  # 1024×1536 (PORTRAIT 2:3) ⚠️
│           ├── real-pota-anillas.png    # 225×225 cuadrado
│           ├── logo.svg, logo-mark.svg
│           └── favicon.svg
├── agents/                   # placeholders para subagentes
├── skills/                   # placeholders para skills
├── llm/                      # models.yaml (config modelos)
├── credentials/              # solo .env.example y README (.env en .gitignore)
├── knowledge/                # base de conocimiento (vacío)
├── outputs/                  # resultados generados
├── originaldata/             # fuente intacta — NO TOCAR
├── .github/workflows/
│   └── deploy-pages.yml      # CI/CD a GitHub Pages
├── .claude/settings.json     # permisos pre-autorizados de Claude Code
├── Staticfile                # `root: site` para Railway/Railpack
├── CLAUDE.md                 # ESTE ARCHIVO
├── README.md
└── .gitignore
```

### Archivos fuente de referencia (NO en el repo, en Downloads del usuario)

| Archivo | Propósito |
|---|---|
| `~/Downloads/FOTOS.docx` | Fotos originales de producto (extraídas a `site/assets/images/`) |
| `~/Downloads/PRODUCTOS BLUE COAST.xlsx` | Catálogo completo de 9 especies con ~50 presentaciones |
| `~/Downloads/WhatsApp Image 2026-04-20 at 16.25.35 (2).jpeg` | Foto actualizada de Porciones (la usada en producción) |
| `~/Downloads/WhatsApp Image 2026-04-20 at 16.25.35 (3).jpeg` | Foto actualizada de Filetes (la usada en producción) |

---

## 4. Identidad visual

### Paleta (definida en `:root` de `style.css`)

```css
/* Ocean blues — la marca */
--ocean-900: #002d55  /* texto "BLUE COAST" del logo, acentos profundos */
--ocean-700: #0b5b95
--ocean-500: #1978b8
--ocean-400: #2c8cbf
--ocean-300: #5ab6d1
--ocean-200: #7bcce0

/* Foam (espuma) */
--foam:   #e7f4f9
--foam-2: #f3f9fc

/* Neutros */
--paper:   #ffffff
--paper-2: #faf8f3
--ink-900: #1a2334
--slate:   #6b7280
```

⛔️ **PROHIBIDO usar paleta naranja/coral/terracota en el chrome del UI.** El
único naranja del sitio es la foto del atardecer del hero, que es real.
El usuario rechazó explícitamente dos veces tonos cálidos en botones/acentos.

### Tipografía

- **Inter** (Google Fonts, pesos 200–900). Es lo único que se carga.
- ⛔️ **Nada de Playfair Display, serifs italics, fuentes cursivas.** El
  usuario rechazó esto explícitamente. El título del hero usa **Inter 300
  (thin)** con gradiente blanco→cyan para "Hidrobiológicos", **NO** italic
  serif.

### Logo (SVG)

4 ondas apiladas con gradientes de cyan claro → navy profundo, replicando
el logo corporativo real. Definido inline en `index.html` (nav + footer)
y también como archivos sueltos en `assets/images/logo*.svg`. Las 4 ondas
tienen una animación `bwBob` (sube/baja escalonada cada 3.4s) que acelera
en hover.

---

## 5. Catálogo (del xlsx)

| # | Especie | Nombre científico | Presentaciones |
|---|---|---|---|
| 1 | **Perico** (Mahi-mahi) | *Coryphaena hippurus* | 13 |
| 2 | **Pota** (Calamar gigante) | *Dosidicus gigas* | 13 |
| 3 | **Pulpo** | *Octopus mimus* | 2 |
| 4 | **Calamar** | *Loligo gahi* | 3 |
| 5 | **Cherela** (Cachema) | *Cynoscion phoxocephalus* | 4 |
| 6 | **Pejerrey** | *Odontesthes regia regia* | 3 |
| 7 | **Bonito** | *Sarda chiliensis chiliensis* | 3 |
| 8 | **Jurel** | *Trachurus murphyi* | 3 |
| 9 | **Caballa** | *Scomber japonicus* | 2 |

Detalle completo de cada presentación en las `<ul class="sp__list">` del HTML.

### Productos destacados (con foto)

- **Porciones de Perico** — **CONGELADAS** (no frescas)
- **Filetes de Perico** — **FRESCOS o CONGELADOS** (las dos opciones)
- **Anillas de Pota** — **CONGELADAS** (no frescas)

---

## 6. Estructura de secciones del sitio

```
1. <header class="nav">          # Sticky, gana fondo sólido al scrollear
2. <section class="hero">        # Foto sunset + 4 ondas SVG animadas + 7 burbujas
3. <section class="stats">       # 4 KPIs con contadores animados
4. <section id="proceso">        # 3 pasos con foto + número badge
5. <section id="productos">      # 3 cards de producto con metadata
6. <section id="especies">       # Catálogo expandible 9 especies
7. <section id="testimonios">    # 3 quotes + CTA
8. <section class="trust">       # 6 badges de certificación
9. <section id="contacto">       # Info card + formulario
10. <footer>                     # 3 cols + bottom strip
11. <a class="fab">              # FAB flotante (solo móvil)
```

---

## 7. Animaciones implementadas

| Elemento | Tipo de animación |
|---|---|
| Body | Scroll progress bar (3px) en el top |
| Nav | Entrance fade+slide al cargar, fondo sólido al scrollear |
| Nav links | Subrayado animado en hover, `is-active` con persistente |
| Nav (debajo) | Franja de 14px con 3 ondas naranjas — **deprecada, ahora ocean** |
| Logo | Cada onda bobs up/down con stagger, glow en hover |
| Hero | Slow zoom 26s + parallax de mouse (±20px) |
| Hero waves | 4 capas SVG en loop sin costura (8s/11s/16s/22s) |
| Hero bubbles | 7 burbujas con radial-gradient subiendo (5–10s, varied delays) |
| Section headings | Subrayado de 56px que crece al entrar en viewport |
| Stat numbers | Count-up con easing cúbico (rAF) |
| Product/process imgs | Reveal cinemático (solo process tiene scale inicial) |
| Cards (product/sp/trust) | Lift on hover (-6px) con sombra |
| Primary button | Glow respiratorio (ctaBreathe 3.4s) + shine sweep en hover |
| FAB | Bob up-down 2.8s en móvil |
| Section heads | Fade+translateY cuando `.section.in-view` |
| Reveal cards | Stagger por índice (.08–.40s) en IntersectionObserver |

**Todas respetan `prefers-reduced-motion: reduce`** vía un selector
universal que mata animaciones y transiciones.

---

## 8. Estrategia de caché y versionado

```html
<meta http-equiv="Cache-Control" content="no-cache, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<link rel="stylesheet" href="assets/css/style.css?v=20260421d">
<script src="assets/js/main.js?v=20260421d" defer></script>
```

- **HTML**: nunca cachea — siempre revalida con el servidor.
- **CSS/JS**: query string `?v=YYYYMMDD[a-z]`. **BUMPEAR LA VERSIÓN** cada
  vez que modifiques esos archivos para forzar fetch fresco.
- Versión actual: `v=20260421d`

---

## 9. Deploy

### Railway (primario)
- Detecta el `Staticfile` en la raíz (`root: site`) → sirve `site/` con Caddy
- Puerto interno: 8080
- Cada push a `main` redespliega automáticamente

### GitHub Pages (caído desde repo privado)
- Workflow: `.github/workflows/deploy-pages.yml`
- Sube `./site` como artifact y deploya
- **Está roto** porque GitHub Pages free no soporta repos privados
- Para reactivar: `gh repo edit tamibot/bluecoast --visibility public --accept-visibility-change-consequences`

### Permisos preconfigurados de Claude (`.claude/settings.json`)
- `defaultMode: acceptEdits` — no pide confirmación para Read/Write/Edit
- Bash, WebFetch, WebSearch permitidos
- **Deny explícito**: `sudo`, `rm -rf /`, force push, lectura de credenciales reales

---

## 10. Lecciones aprendidas (decisiones del usuario)

### Preferencias fuertes del usuario
1. **Estética**: fiel al original Lovable (minimalista, editorial pero limpio)
2. **Paleta**: **AZUL OCÉANO PURO**, nada de naranja/coral/sunset en el chrome
3. **Tipografía**: **SOLO Inter**. Nada de Playfair Display, nada de italics serif
4. **Animaciones**: cuanto más mejor, pero coherentes y en azul
5. **Móvil**: tiene que verse "realmente bien" en teléfono (probó iPhone)
6. **Caché**: el usuario se quejó varias veces de ver versión vieja → por eso
   `Cache-Control: no-cache` en el meta y cache-bust en cada asset

### Bugs corregidos importantes
- **Filetes de perico portrait (2:3) recortado**: el container era `aspect-ratio: 1/1` con `padding: 2rem` + `overflow: hidden` + `scale(1.08)` inicial → clipping. Solución: `aspect-ratio: 4/5`, sin scale inicial, `max-width/max-height` con `width:auto`, padding 1.2rem.
- **Tipos en HTML**: "hidro-biológicos" → "hidrobiológicos", "frescos y congelados" → "frescos o congelados", "Conservas de anchoveta" (placeholder absurdo, no vendemos anchoveta) → lista real.
- **OG image relativa**: rompía en WhatsApp/LinkedIn → URL absoluta.
- **Pages cache 10min**: agregué `Cache-Control: no-cache` meta.

### Trampas técnicas que evitar
- `transform: scale()` sobre `<img>` con `object-fit: contain` + `overflow: hidden` **recorta los portraits**. Usar solo en imágenes con `object-fit: cover` (process photos).
- GitHub Pages free no soporta repos privados. Si haces el repo privado, Pages se cae instantáneamente (404).
- Railway Railpack necesita un archivo `Staticfile` con `root: site` en la raíz del repo (no en `site/`). Sin él, el deploy falla con "could not determine how to build".
- SVG waves animation: necesita patrón duplicado dentro del viewBox para que `translateX(-50%)` haga loop sin costura. ViewBox 2880×160 con la onda repetida dos veces.

---

## 11. SEO y meta tags

Ya configurado en `<head>`:
- canonical → `https://tamibot.github.io/bluecoast/` (actualizar si cambia dominio)
- robots: index, follow
- keywords: todas las especies + nombres científicos
- Open Graph completo (url, locale es_PE, site_name, image absoluta con dims)
- Twitter Card large image
- theme-color: `#002d55` (navy de marca)
- viewport: `viewport-fit=cover` para notch iPhone
- preload + fetchpriority=high para la foto del hero (LCP)

---

## 12. Workflow para retomar el proyecto

### Si tienes que hacer un cambio visual
1. Edita `site/assets/css/style.css`
2. **Bumpea cache-bust** en `index.html`: `?v=20260421d` → `?v=20260519a` (o lo que sea)
3. `git add -A && git commit -m "..." && git push origin main`
4. Railway redeploya automáticamente

### Si tienes que añadir contenido del catálogo
- Fuente: `~/Downloads/PRODUCTOS BLUE COAST.xlsx`
- Estructura ya parseada en este doc y en el HTML
- Cada especie es un `<article class="sp reveal">` con header, count, button, ul.

### Si tienes que añadir/cambiar una foto de producto
- Las fotos van en `site/assets/images/`
- Considera la aspect ratio: si es portrait, **NO uses `object-fit: cover`**
- El container `.product__img` ya es `aspect-ratio: 4/5` que va bien con portrait y cuadrado

### Si el usuario te pide volver Pages al aire
```bash
gh repo edit tamibot/bluecoast --visibility public --accept-visibility-change-consequences
gh api -X POST repos/tamibot/bluecoast/pages -f "build_type=workflow"
gh workflow run deploy-pages.yml --repo tamibot/bluecoast --ref main
```

### Si el usuario pide credenciales reales en el repo
- Ya es privado, técnicamente posible
- Pero **mejor práctica**: usar variables de entorno en Railway (Settings → Variables), no commitear secretos a git
- Actualizar `credentials/.env` solo si el usuario manda valores explícitos
- Verificar que `credentials/.env` siga en `.gitignore` (lo está)

---

## 13. Estado actual y siguiente paso

### Lo que funciona ✓
- Sitio sirviéndose en Railway
- 9 especies con todas sus presentaciones
- 3 productos destacados con fotos reales
- Animaciones: progress bar, count-up, parallax, ondas, burbujas, reveal staggered
- Mobile: breakpoints 520-960 (2-col), <520 (1-col), <420 (tight)
- Datos de contacto reales
- Logo SVG corporativo animado

### Lo que NO funciona ✗
- GitHub Pages (404 desde que se hizo privado)

### Cosas que el usuario podría pedir en el futuro
- Reactivar Pages → ver sección 12
- Conectar formulario a un backend real (ej: Formspree, n8n webhook)
- Añadir Google Maps embed en contacto (Sullana – Piura)
- Versión en inglés / multi-idioma
- Más fotos de las otras 7 especies sin foto
- Logo del cliente con texto incluido (el del email del cliente)

---

## 14. Comandos útiles

```bash
# Preview local
cd site && python3 -m http.server 8787

# Ver deploys
gh run list --repo tamibot/bluecoast --limit 5

# Ver estado del repo
gh repo view tamibot/bluecoast --json visibility,isPrivate,homepageUrl

# Forzar redeploy
gh workflow run deploy-pages.yml --repo tamibot/bluecoast --ref main

# Cambiar a público (reactivar Pages)
gh repo edit tamibot/bluecoast --visibility public --accept-visibility-change-consequences

# Buscar typos en el HTML
grep -E 'hidro-biológicos|anchoveta' site/index.html
```

---

## 15. Reglas del proyecto (vigentes)

- ⛔️ **No** leer ni escribir en `credentials/.env`. Usar `.env.example` como referencia.
- ⛔️ **No** modificar archivos dentro de `originaldata/`.
- ✏️ Commits: mensajes concisos en inglés, modo imperativo.
- ✏️ Los permisos de Bash/Read/Write están preautorizados en `.claude/settings.json`.
- ✏️ Cada cambio en CSS/JS requiere bump del `?v=` en `index.html`.
- ✏️ **Mantener este CLAUDE.md actualizado** cuando hagas cambios estructurales.
