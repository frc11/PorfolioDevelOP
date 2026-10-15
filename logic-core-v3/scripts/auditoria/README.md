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
| `validar.mjs` | Valida los entregables: campos obligatorios de cada hallazgo, IDs únicos, `Nodo(s)`, referencias cruzadas, sin valores de secret, tope de 300 KB por archivo de `_crudo/` | stdout, exit 1 con errores |
| `crudo-partes.mjs` | Módulo: lee y escribe JSON de `_crudo/` partidos en piezas de menos de 300 KB (`_crudo/<nombre>/parte-N.json`), por el campo que se indique (`items`, `hallazgos`); lo usan lo planeado extraído, el registro de hallazgos y las revisiones de ciclo | módulo |
| `hallazgos-md.mjs` | Del registro único `_crudo/hallazgos.json` (y `funcionalidades.json`) genera `03-MEJORAS.md`, `02-PENDIENTE.md` y la sección de hallazgos de `09-PARA-FRANCO.md` | 03, 02, 09 |
| `inventario.mjs` | Datos para `01-INVENTARIO.md` (rutas, entradas, env vars, tests, dependencias) | `_crudo/inventario.json` |
| `inventario-superficial.mjs` | Pase superficial de DOC y PUB | `_crudo/inventario-superficial.json` |
| `eslint-resumen.mjs` | Resumen del baseline de eslint sin código fuente | `_crudo/eslint-resumen.md` |
| `poda.mjs` + `poda-md.mjs` | Triage de poda con señales (depcruise, `git grep` con resolución de imports, rutas sin link, marcadores, ramas, enums) y su documento; suma los candidatos de F2 agrupados por archivo y ciclo, con el alcance (archivo, exports, código o fusión) que fija la curaduría del padre en `_crudo/poda-f2-curado.json` | `_crudo/poda-candidatos.json`, `10-PODA.md` |
| `censo-diseno.mjs` | F3.1: censo de diseño de las páginas internas y su cierre de archivos (grafo de depcruise): colores literales y arbitrarios frente a tokens, paleta por familia, tipografías, tamaños arbitrarios, radios, sombras, estilos inline y vidrio; control positivo con una muestra sintética | `_crudo/censo-diseno.json` |
| `planeado-md.mjs` | Genera `12-PLANEADO.md` desde lo extraído y los cruces por dominio; conserva los `PLAN-NNN` | `12-PLANEADO.md` |
| `atlas/nodos.mjs` | Contrato de IDs del Atlas y mapeo ruta → nodo. Portable: sin imports de `src/` | módulo |

## De esta corrida

| Script | Qué hace |
|---|---|
| `f2-args.mjs` | Arma los argumentos de un ciclo de F2 por dominio: archivos del lote, previas que los citan, ítems `PLAN` repartidos (uno por lote), alertas del dominio (con ID `[Dx-An]`), patrones de los dominios anteriores, las DML del drift (D6) y el registro de cambios que corresponde; `--cazadores --lente` arma los tramos de los ciclos 2 y 3. Desde D3 (DEC-53, DEC-55) suma `acotado`, `flujos_cerrados` (una línea por flujo de los otros dominios, desde `_crudo/flujos.json`) y `higiene`; `--sin-acotar` y `--sin-higiene` los apagan |
| `f2-construir.mjs` + `f2-lectores.plantilla.js` / `f2-cazadores.plantilla.js` | Construyen el script del workflow de un ciclo en `_crudo/ciclos/<ciclo>.workflow.js` (registro exacto de lo que recibió cada agente). Las ramas nuevas de la plantilla de lectores (traza acotada al lote, flujos ya trazados, `higiene_ui`) dependen de esas banderas: sin ellas el prompt y el schema son los de antes (control: D5-c1 reconstruido con la plantilla vieja da byte a byte el script que corrió, y con la nueva, los mismos 18 prompts y opciones) |
| `f2-procesar.mjs` | Guarda el crudo de cada lote en `_crudo/ciclos/` y arma la revisión con las decisiones iniciales de DEC-37 (leer, leer-refutada, muestrear, aceptar); desde D3 junta los `higiene_ui` de todos los lotes en un único hallazgo «Higiene de UI — Dx» (DEU BAJA, PROBABLE, sin verificación individual, DEC-55) |
| `tokens-workflow.mjs` | Tokens y lecturas por agente de un run (transcripciones locales `agent-*.jsonl` del directorio del workflow, con el estado del journal): procesados, sin caché leída, salida, contexto final, `Read` dentro y fuera del lote y otras herramientas; con `--args` da tokens por kLOC del lote. Es la medida de antes/después de DEC-53 | — (solo consola o `--json`) |
| `f2-decidir.mjs` | Aplica las decisiones del padre (`_crudo/ciclos/<ciclo>-decisiones.json`: aceptar, descartar o fusionar, casos de prueba, campos corregidos; `confianza_padre` para una ALTA leída con un eslabón de runtime, `relacionados_tmp` para relacionar hallazgos del mismo ciclo y `destino` para corregir el hallazgo registrado que recibe una fusión) |
| `f2-escribir.mjs` | Vuelca un ciclo revisado: IDs globales, registro de hallazgos, fusiones (y la corrección del destino, con su valor anterior en `origen.cambios`), relaciones dentro del ciclo, VH en 08, cruces de lo planeado, acumulados, ledger, y regenera 03/02/09 y 12 |
| `planeado-extraer.mjs` | Un solo uso: junta la salida de los agentes de extracción de F1.12 (journal del workflow) en `_crudo/planeado-extraido/` |

## Reglas

- Ningún script imprime ni guarda valores de credenciales: solo `ruta:línea` y tipo.
- Tope de 300 KB por archivo de `_crudo/` (PROMPT §5): lo regenerable y descartable queda local (`_crudo/depcruise.json`, 2,5 MB); lo que hace falta para regenerar entregables se parte con `crudo-partes.mjs`. `validar.mjs` lo controla.
- `docs/_insumos/` (insumos de Drive) nunca se commitea.
