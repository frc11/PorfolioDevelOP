# Corrida M1 v3 — FRENADA en Fase 0 (terreno)

**Fecha:** 2026-08-10 · **Rama:** `redesign/home` · **HEAD:** `f9a20b26`

No se escribió ni una línea de manual. La Fase 0 tiene tres condiciones de freno
y **dos fallaron**. Este documento es el registro del terreno para que la próxima
corrida no tenga que volver a derivarlo.

---

## Veredicto

| Chequeo de Fase 0 | Resultado |
|---|---|
| 1 · Borrados preparados ajenos en el índice | **PASA** — 20 archivos modificados, ninguno en el índice, cero borrados |
| 2 · Los ocho commits de la poda | **FALLA** — faltan dos (P5-B y P9) |
| 3 · La galería regenerada sobre el producto podado | **FALLA** — la galería es del 2026-07-27, anterior a toda la poda |

Cualquiera de las dos alcanzaba para frenar. La segunda además **no se puede
remediar dentro de esta corrida** sin violar su propia restricción de diff.

---

## Falla 1 · Faltan dos commits de la poda

La bitácora (`docs/bitacora-beta-3.md`) tiene ocho entradas de sprint de poda más
el PROBE de terreno. Contra el log:

| Bloque | Entrada en bitácora | Commit |
|---|---|---|
| PROBE terreno | L2006 | `7bc0a826` |
| P1 — seis correcciones de copy | L2072 | `c2160792` |
| P4 — las dos pantallas de evaluación son una | L2119 | `5d844bb6` |
| P5-A — la ficha recibe el material | L2267 | `9029b03c` |
| P5-B — el brief deja de pedir lo que la ficha ya tiene | L2933 | **ninguno** |
| P6-B — las seis de Construcción son dos | L2474 | `742f7565` + `42c6edc9` |
| P7 — el chequeo deja de perder trabajo | L3038 | `fafd7963` (agrupado) |
| P8 — el foco prioriza CONSTRUIR | L2795 | `fafd7963` (agrupado) |
| P9 — una sola lengua, último barrido | L3177 | **ninguno** |

**P5-B y P9 están cerrados en la bitácora pero viven sólo como modificaciones sin
commitear** en el árbol de trabajo (los 20 archivos de `git status`). P7 y P8 sí
están, agrupados dentro de `fafd7963` junto con P6-B — eso es contabilidad, no
bloqueo.

Consecuencia para el manual: el producto que hay que documentar **no existe en
ningún commit**. Existe en el árbol de trabajo, mezclado con WIP de otra sesión.
Un manual escrito hoy no tendría un árbol reproducible al que apuntar.

---

## Falla 2 · La galería es anterior a la poda

Los 41 `.png` de `docs/manual-usuario/galeria/png/` están fechados **2026-07-27
18:49–18:51**. La poda arrancó el 2026-07-31 y terminó el 2026-08-07. No hay
commit de galería regenerada: los únicos commits de galería del repo son de
**2026-07-23** (`9efe7087`, `e18c6392`, `5c3c1327`, `d3f540db`, corrida M0).

Los nombres de archivo delatan qué producto retratan: `15-m7-estructura`,
`16-m8-personalizacion`, `17-m9-assets`, `18-m10-cta`, `19-m11-calidad`,
`20-m12-mobile-fases-hechas` — las **seis pantallas de Construcción que P6-B
colapsó en dos**.

Pantallas del registro hoy (`src/lib/leados/manual.ts`, árbol de trabajo):

```
m1 · m2 · m4 · m5 · m6 · mc1 · mc2 · m13 · m14 · m15 · m16 · mr · espera · revision · archivo
```

Siete de los `paso` que la galería fotografía (`m7`…`m12`, y `m3` ya fusionado en
`m2` por P4) **ya no están en ese registro**.

Justo lo que la corrida tenía que cubrir con más cuidado es lo que la galería no
puede mostrar: las dos pantallas de construcción nuevas, la evaluación fusionada,
el chequeo con sus dos grupos, el foco nuevo. Para todo eso la galería no tiene
**ninguna** foto válida, y las que tiene retratan pantallas retiradas.

---

## Por qué no se regeneró acá

Regenerar la galería exige tocar `tests/` y `scripts/`, que esta corrida tiene
prohibido modificar («NO TOQUES código de producto, tests ni configuración»).

El propio sprint P6-B dejó la advertencia escrita en el corredor de captura
(`tests/galeria/captura.spec.ts:79-89`), y explica el modo de falla exacto:

> ⚠️ OBSOLETOS DESDE P6-B — NO REGENERAR ASÍ. […] estos siete `paso` ya no
> existen y la guardia del server los redirige a la pantalla actual, así que una
> corrida de la galería fotografiaría siete veces la misma pantalla con nombres
> que mienten.

Es decir: correr `npm run galeria` hoy no produce una galería vieja — produce una
galería **falsa**, con siete archivos que dicen `m7`…`m12` y muestran otra cosa.
Peor que no tenerla.

El mismo comentario dice qué falta y dónde:

- retirar los siete estados obsoletos de `tests/galeria/captura.spec.ts:90-96`
- re-setear el sembrador — `scripts/dev/m0-galeria-seed.ts:180-202`
- renumerar la galería (21→…) y el índice — `docs/manual-usuario/galeria/INDICE.md:106-112` + la fila mobile `:162`
- cobertura esperada después: **cuatro estados** (mc1 · mc2 · el tilde deshabilitado en BRIEF · uno mobile)

A eso hay que sumarle los estados nuevos que P5-B, P7, P8 y P9 introdujeron y que
nadie enumeró todavía (el chequeo con dos grupos, el foco que prioriza construir,
la reentrada tras rechazo). Definir esa lista es trabajo de bloque **M0**, no de
M1: es decidir cuáles son los estados del producto nuevo.

---

## Resto del terreno (queda relevado, no hace falta repetirlo)

**Accesos externos — 4 de 5 siguen pendientes.** En
`src/lib/leados/herramientas.ts`, cuatro herramientas tienen `url: null` con
`// TODO: URL … (pedir a Franco)`:

| Herramienta | Acceso |
|---|---|
| Chat de evaluación (Sonnet) | **pendiente** (`:63`) |
| Gem de diseño | **pendiente** (`:78`) |
| Claude Design | **pendiente** (`:90`) |
| Gem de outreach | **pendiente** (`:117`) |
| Netlify Drop | cargado — `https://app.netlify.com/drop` (`:105`) |

El propio archivo documenta la conducta: sin URL cargada «la UI muestra el acceso
como "pendiente" en vez de un link roto». Cuando la corrida se retome, cuatro de
las cinco herramientas se escriben como acceso pendiente, y esto es la primera
entrada del registro de hallazgos.

**Procesos ajenos.** Ningún servidor de desarrollo vivo: nada escuchando en
3000-3009 ni 3100. Dos procesos `node` de la sesión, sin puertos. No se tocó
ninguno.

**WIP ajeno en el árbol.** 20 archivos modificados sin commitear (P5-B + P9 + la
bitácora). No se tocaron. Este documento es el único archivo agregado.

---

## Qué destraba la corrida

En orden. Los dos primeros son de Franco o de un sprint que pueda tocar código:

1. **Commitear P5-B y P9.** El producto a documentar tiene que existir en un
   commit, no en un árbol de trabajo compartido con otra sesión.
2. **Bloque M0-bis — regenerar la galería.** Enumerar los estados del producto
   podado, retirar los siete obsoletos, re-setear el sembrador, renumerar el
   índice, correr `npm run galeria`. Es lo que P6-B difirió explícitamente
   «después de la poda».
3. **Cargar las cuatro URLs** o confirmar que siguen pendientes — cambia cómo se
   escribe cada pantalla que las usa, no si se escribe.

Con (1) y (2) hechos, la corrida M1 v3 arranca sin cambios: la Fase 0 pasa y la
regla de oro vuelve a tener sus tres fuentes disponibles.

---

## Addendum — la galería se está regenerando ahora mismo

Durante esta corrida, entre el primer `git status` y el último, aparecieron **tres
archivos modificados que no toqué**:

```
 M logic-core-v3/.gitignore
 M logic-core-v3/package.json
 M logic-core-v3/playwright.galeria.config.ts
```

En `package.json` el cambio es un script nuevo:

```
"start:galeria": "cross-env E2E_DIST_DIR=.next-galeria npm run build && cross-env E2E_DIST_DIR=.next-galeria QA_ALLOW_LOCALHOST=1 next start -p 3004"
```

Es el mismo patrón de aislamiento que `start:setter` (directorio de build propio,
puerto propio) aplicado a la galería. Otra sesión está construyendo el carril
aislado de la galería en paralelo — es decir, el punto 2 de «qué destraba la
corrida» ya está en marcha.

Esto refuerza el freno en vez de contradecirlo: escribir el manual ahora no sólo
sería escribir sobre capturas viejas, sería además competir con una regeneración
en curso. La corrida M1 v3 se retoma cuando esa regeneración cierre.

---

## Nota de método

La regla de oro admite tres fuentes: lo navegado en vivo, la captura de la
galería, y el copy literal del código. Se podría argumentar que con la fuente 1
alcanzaba para escribir igual.

No alcanza, por dos razones. La plantilla fija de cada pantalla exige «captura +
qué es cada cosa» — sin galería válida, la mitad de cada sección queda sin
respaldo. Y la Parte B valida la poda contra lo que se ve; validarla contra un
árbol de trabajo sin commitear, que otra sesión está editando en paralelo,
produce un veredicto que no es reproducible mañana.

Escribir igual habría sido cumplir la forma del encargo y romper su fondo.
