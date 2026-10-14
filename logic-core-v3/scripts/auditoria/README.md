# scripts/auditoria — herramientas de la auditoría de renovación 2026-10

Scripts de Node sin dependencias nuevas (solo `node:*` y `git`). Todos son de **solo lectura sobre la app**: leen el repo (casi siempre `origin/main` por `git ls-tree`, `git show` o `git grep`) y escriben únicamente en `docs/auditoria-2026-10/`. Se corren desde `logic-core-v3/`. Ninguno toca la base de datos.

## Permanentes (sirven para repetir la auditoría o alimentar el Atlas)

| Script | Qué hace | Salida |
|---|---|---|
| `cobertura.mjs` | Ledger de cobertura: clasifica cada archivo de la base en dominio y profundidad; `--marcar <estado> --ciclo <id> --lista <archivo> [--nota]` actualiza filas; sin argumentos imprime el resumen por dominio | `_cobertura.csv` |
| `lotes.mjs` | Parte los archivos profundos pendientes de cada dominio en lotes de ≤ 6.500 LOC, sin partir carpetas de flujo y salteando los `PODA-ALTA` | `_crudo/lotes.json` |
| `drift.mjs` | Drift entre `prisma/schema.prisma` y las migraciones, sin base de datos (control positivo incluido) | stdout |
| `ramas.mjs` | Inventario de ramas y worktrees contra `origin/main` (mergeada, viva, dormida, abandonada) | `_crudo/ramas.json` |
| `secrets-historial.mjs` | Barrido de credenciales en todo el historial de git (22 patrones, control positivo con muestras sintéticas); nunca imprime valores | `_crudo/secrets-historial.json` |
| `secrets-salida.mjs` | Los mismos 22 patrones sobre lo que escribe la corrida (`docs/auditoria-2026-10/`, `scripts/auditoria/`); `--control` es el control positivo. Se corre antes de cada commit | stdout, exit 1 si encuentra |
| `validar.mjs` | Valida los entregables: campos obligatorios de cada hallazgo, IDs únicos, `Nodo(s)`, referencias cruzadas, sin valores de secret | stdout, exit 1 con errores |
| `inventario.mjs` | Datos para `01-INVENTARIO.md` (rutas, entradas, env vars, tests, dependencias) | `_crudo/inventario.json` |
| `inventario-superficial.mjs` | Pase superficial de DOC y PUB | `_crudo/inventario-superficial.json` |
| `eslint-resumen.mjs` | Resumen del baseline de eslint sin código fuente | `_crudo/eslint-resumen.md` |
| `poda.mjs` + `poda-md.mjs` | Triage de poda con señales (depcruise, `git grep` con resolución de imports, rutas sin link, marcadores, ramas, enums) y su documento | `_crudo/poda-candidatos.json`, `10-PODA.md` |
| `planeado-md.mjs` | Genera `12-PLANEADO.md` desde lo extraído y los cruces por dominio; conserva los `PLAN-NNN` | `12-PLANEADO.md` |
| `atlas/nodos.mjs` | Contrato de IDs del Atlas y mapeo ruta → nodo. Portable: sin imports de `src/` | módulo |

## De esta corrida

| Script | Qué hace |
|---|---|
| `f2-args.mjs` | Arma los argumentos de un ciclo de F2 por dominio: archivos del lote, previas que los citan, ítems `PLAN` repartidos (uno por lote), alertas del dominio y el registro de cambios que corresponde |
| `planeado-extraer.mjs` | Un solo uso: junta la salida de los agentes de extracción de F1.12 (journal del workflow) en `_crudo/planeado-extraido.json` |

## Reglas

- Ningún script imprime ni guarda valores de credenciales: solo `ruta:línea` y tipo.
- Lo grande o regenerable queda local y no se commitea (`_crudo/depcruise.json`, 2,5 MB).
- `docs/_insumos/` (insumos de Drive) nunca se commitea.
