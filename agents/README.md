# Agents

Subagentes personalizados en formato Markdown con frontmatter YAML.

## Formato

```markdown
---
name: nombre-del-agente
description: Cuándo usar este agente. Sé específico.
tools: Read, Grep, Glob, Bash
model: sonnet
---

Prompt del sistema del agente. Define rol, objetivos y restricciones.
```

Coloca cada agente en su propio archivo `.md` dentro de esta carpeta.
