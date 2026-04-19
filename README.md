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
