# Bluecoast — Guía para Claude

## Estructura
- `agents/` — subagentes personalizados
- `skills/` — skills invocables
- `llm/` — configs de modelos y prompts base
- `credentials/` — secretos (NUNCA leer ni commitear `.env`, `.key`, `.pem`)
- `knowledge/` — base de conocimiento
- `outputs/` — resultados generados
- `originaldata/` — fuente intacta; no modificar

## Reglas
- No leer ni escribir en `credentials/.env`; usa `.env.example` como referencia.
- No modificar archivos dentro de `originaldata/`.
- Commits: mensajes concisos en inglés, imperativo.
- Los permisos de Bash/Read/Write están preautorizados en `.claude/settings.json`.
