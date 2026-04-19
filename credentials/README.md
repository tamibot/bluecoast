# Credentials

**NUNCA commitees archivos reales aquí.** Solo `.env.example` y este README se versionan.

## Setup

```bash
cp credentials/.env.example credentials/.env
# Edita credentials/.env con tus claves reales
```

## Archivos ignorados por git

- `.env` — variables de entorno con secretos
- `*.key`, `*.pem` — llaves privadas
- `*.json` (excepto los explícitamente permitidos) — service accounts, tokens OAuth

Revisa `.gitignore` en la raíz para la lista completa.

## Si filtras una credencial

1. Rota la clave inmediatamente en el proveedor.
2. Purga del historial: `git filter-repo --path credentials/.env --invert-paths`
3. Fuerza push y avisa al equipo.
