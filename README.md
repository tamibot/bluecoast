# Bluecoast

Proyecto de orquestación de agentes Claude con skills, LLMs, conocimiento y datos.

## Estructura

```
.
├── agents/         # Definiciones de subagentes (*.md con frontmatter YAML)
├── skills/         # Skills personalizadas (carpetas con SKILL.md)
├── llm/            # Configuración de modelos, prompts base, plantillas
├── credentials/    # API keys y secretos (NO se commitea, ver .env.example)
├── knowledge/      # Base de conocimiento, docs, referencias
├── outputs/        # Resultados generados por los agentes
├── originaldata/   # Datos fuente sin procesar
└── .claude/        # Configuración de Claude Code (settings.json, etc.)
```

## Setup

1. Copia `credentials/.env.example` a `credentials/.env` y completa tus claves.
2. Los permisos de Claude Code ya están preconfigurados en [.claude/settings.json](.claude/settings.json) para minimizar prompts de autorización.
3. Los archivos sensibles están ignorados por git (ver [.gitignore](.gitignore)).

## Uso

Abre este directorio con Claude Code y las herramientas de Bash, edición, búsqueda y red estarán pre-autorizadas.

## Sitio público

El sitio de marketing está en [`site/`](site/) (HTML + CSS + JS estáticos — sin build):

- [site/index.html](site/index.html) — página principal
- [site/assets/css/style.css](site/assets/css/style.css) — estilos
- [site/assets/js/main.js](site/assets/js/main.js) — interacciones, reveals, contadores
- [site/assets/images/](site/assets/images/) — fotos de productos y proceso

### Preview local

```bash
cd site && python3 -m http.server 8787
# http://127.0.0.1:8787/
```

### Deploy a GitHub Pages

El workflow [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) publica `site/` en cada push a `main`.

**Pasos la primera vez**:

1. Crea el repo en GitHub y haz push: `git remote add origin <url> && git push -u origin main`
2. En GitHub → **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. El próximo push al `main` disparará el deploy automáticamente.
4. La URL resultante será `https://<usuario>.github.io/<repo>/`.
