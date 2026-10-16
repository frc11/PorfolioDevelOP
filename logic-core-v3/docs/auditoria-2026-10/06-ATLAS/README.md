# Atlas de develOP — la puerta de entrada

> El mapa del sistema como datos (`atlas.json` + `atlas.curado.json`), con vistas `.md` que se generan desde ellos. Base: `origin/main` @ `57c421bc`. Se cerró en F6 con el backlog: cada ficha de módulo muestra sus tarjetas abiertas de `07-BACKLOG.md`, y los hallazgos apuntan a nodos reales (los ids que citaban y no existían se resuelven con `alias.json`).

## Quiero…

| Quiero… | Andá a |
|---|---|
| entender el sistema en cinco minutos | [arquitectura.md](arquitectura.md) |
| saber si una ruta exige sesión, qué rol y si filtra por organización | [rutas.md](rutas.md) |
| ver una tabla, sus relaciones y quién la lee o la escribe | [datos.md](datos.md) |
| saber qué se rompe si toco un módulo | [dependencias.md](dependencias.md) y la ficha del módulo |
| arrancar a trabajar en una pantalla o herramienta | la ficha en [modulos/](modulos/) (sección «Por dónde empezar») · índice abajo |
| saber qué ramas tienen trabajo sin mergear | [ramas.md](ramas.md) |
| saber qué está roto o pendiente en un módulo | su ficha (hallazgos vinculados), y `02-PENDIENTE.md` / `03-MEJORAS.md` |
| saber si puedo tocar un archivo congelado o de Franco | [../11-CONGELADOS.md](../11-CONGELADOS.md) y [../09-PARA-FRANCO.md](../09-PARA-FRANCO.md) |
| saber qué credencial vence y cómo se renueva | `01-INVENTARIO.md` §6.1 |
| decidir qué entra en la 1.0 | `atlas.curado.json` (`alcance`; la auditoría solo propuso `alcance_propuesto`) |
| regenerar todo esto después de un merge | [regenerar.md](regenerar.md) |

## Quiero hacer… → tarjeta del backlog

Cada tarjeta de [`../07-BACKLOG.md`](../07-BACKLOG.md) está lista para convertirse en el prompt de un sprint (objetivo, archivos, zona, tamaño, modelo y criterio de aceptación). Las que comparten worktree conviene hacerlas juntas.

| Quiero… | Tarjetas |
|---|---|
| que el chatbot vuelva a responder y que una caída se vea | B-01 (credencial de Vertex) → B-13 (caída visible) · B-121 (credencial parseada una vez) |
| frenar el abuso del chat público (cupo y gasto de IA) | B-07 · B-06 (IP confiable) · B-120 |
| cerrar el acceso: rate limit, sesiones y redirecciones | B-08 · B-06 · B-26 · B-25 · B-09 y B-27 (`auth.ts`: decisión FROZEN + Franco) |
| proteger `/admin` y dejar rastro de lo sensible | B-10 · B-28 · B-29 · B-30 |
| que ningún cliente vea datos de otro | B-11 · B-15 · B-19 · B-33 (frontera de aislamiento con lint en CI) |
| sacar credenciales de la base y del repo | B-12 (cifrado en reposo) · B-03 (contraseñas de prueba) · B-92 |
| que lo programado corra: backup y crons | B-02 · B-14 · B-50 |
| saber qué credencial vence y que Sentry reciba | B-01 · B-05 · B-54 |
| arreglar Email Marketing | B-17 · B-18 · B-65 |
| destrabar los módulos premium (tienda, agenda, reputación, reseñas) | B-20 · B-21 · B-22 · B-19 · B-55 (integraciones en la ficha del cliente) |
| llevar el portal del cliente a L3 | B-57 (errores útiles) · B-56 y B-116 (números honestos) · B-24, B-41, B-113 (soporte y mensajes) · B-118 · B-154 |
| llevar el chatbot a L3 | B-47 (plan como fuente de cupo y modelo) · B-48 · B-49 · B-51 · B-52 · B-59 · B-62 · B-63 |
| llevar el admin a L3 | B-58 · B-70 · B-71 · B-72 · B-73 · B-74 · B-75 · B-128 a B-133 |
| trabajar en LeadOS o el setter (zona de Franco) | empezar por B-31 (decidir la rama p25) · B-32 · B-79 a B-87 · B-134 a B-143 |
| podar código, scripts, ramas y docs | B-164 a B-170 · B-171 (docs) · B-188 (después del merge de `rediseno/home`) |
| soltar congelados con la política protegido/libre | B-89 → B-101 a B-104, B-109, B-158, B-161 · B-105 (migración aditiva del schema) |
| llevar el diseño de `rediseno/home` al portal | B-175 (decisiones) → B-176 · B-177 · B-178 → B-182 a B-186 |
| que las reglas de CLAUDE.md se cumplan solas y el Atlas no se desactualice | B-172 · B-173 · B-174 · B-88 (CI que corre de verdad) |
| construir una idea nueva | B-192 a B-204 (las IDEA de `05-IDEAS.md`) |

## Los datos

| Archivo | Qué es | Quién lo escribe |
|---|---|---|
| `atlas.schema.json` | El contrato (schemaVersion 1) | a mano |
| `atlas.json` | Nodos (áreas, herramientas, funcionalidades, libs, modelos, integraciones, ramas, docs) y aristas (contiene, importa, usa-modelo, llama-api, dispara, depende) | `generar.mjs` |
| `atlas.curado.json` | Madurez, veredicto, alcance y decisiones por nodo | personas (nunca un generador) |
| `funcionalidades.json` | Las 445 funcionalidades, la unidad de madurez | personas (sembrado por la auditoría) |
| `zonas.json` | Congelados y zona de Franco | personas |
| `entradas.json` | Auth, rol, tenant y validación de cada entrada, con evidencia | personas (sembrado por la auditoría) |
| `hallazgos.json` | Los hallazgos de 02/03/04/05, con sus nodos resueltos | `validar.mjs --emitir` |
| `backlog.json` | Las tarjetas de `07-BACKLOG.md` (bloque, tamaño, nodos, hallazgos, estado) | `backlog.mjs` |
| `alias.json` | Ids de nodo que citan los hallazgos o las personas y no son nodos, con el nodo real al que apuntan | personas (nunca un generador) |
| `historial.jsonl` | Una línea por corrida del generador: la curva de progreso | `generar.mjs` |

**Métrica de progreso** (la calcula un visor futuro; acá quedan los datos):
1. **Avance 1.0** = funcionalidades con `alcance: 1.0` y madurez ≥ L3, sobre las que tienen `alcance: 1.0`.
2. **Trabajo restante** = suma de tamaños de las tarjetas abiertas de nodos 1.0.
3. **Barrera** = cero CRÍTICA o ALTA abiertas en nodos 1.0.

## Módulos

El índice con dueño, madurez calculada, hallazgos y alcance propuesto está en [_indice-modulos.md](_indice-modulos.md). La madurez de una herramienta se calcula desde sus funcionalidades, nunca se carga a mano.
