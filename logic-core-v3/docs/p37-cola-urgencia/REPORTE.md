# P37 · La cola por urgencia, y la cartera que se puede medir

2026-09-12. Rama `p25/rafaga-tildes`, HEAD `4f8c00a2` (sin commitear, igual que P29–P36).
Base: **branch Neon de desarrollo**, endpoint `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`
— el único host en `.env` y `.env.local`, y el que exige cada script de este sprint antes de conectar.

Instrumentos (todos leen la base por las funciones del producto, ninguno re-deriva un criterio):

| Script | Qué hace |
|---|---|
| `scripts/p37-censo-siembra.mts` | Conteo por categoría × setter, y accionables de `setter-qa` por categoría. Solo lectura. |
| `scripts/p37-medir-cola.mts` | Cola del producto (`particionarCartera`) contra cola por urgencia (`filtrarYOrdenarCartera`), niveles, fijados, arranque. Solo lectura. |
| `scripts/p37-capturas.mts` | Opera el panel a 1440 y 390: capturas + lectura del DOM de «Tu cola de hoy». |
| `scripts/p37-comparar-mediciones.mjs` | Diff celda por celda de las dos mediciones fijas contra su baseline. |
| `scripts/dev/siembra-categorias.mts` | Los criterios de categoría (compartidos por censo y limpieza). |
| `scripts/dev/limpiar-siembra-corridas.mts` | La limpieza: ensayo por defecto, guarda de edad, respaldo obligatorio, `--restaurar`. |

---

## 1 · La línea

`flow.ts` `ordenFoco`: `pin || trabajoTier || ordenUrgencia` → **`pin || ordenUrgencia`**. Es exactamente el
comparador de `filtrarYOrdenarCartera(…, 'urgencia')`, la cartera. `trabajoTier` sigue vivo como rótulo
(`motivoOrden`). Comentarios que describían el orden viejo actualizados en `flow.ts`, `foco.ts`, `cola.ts` y
`home-sections.tsx` (solo comentarios).

| Qué tenía que quedar verdadero | Medido |
|---|---|
| Los fijados siguen primero | Filas 1 y 2, en la cartera sucia y en la limpia |
| El nivel más cercano al cierre llega a la cola | `QA-W Aprobada Gate Abierto`: fila 97 → **4** (sucia) · 33 → **4** (limpia) |
| Salen exactamente los dos medidos | Sucia: `SMOKE-SETTER B4 Brief` y `B5 Construccion`, los mismos de P36. Limpia: `M0-GAL 12-m6-brief-abierto` y `DEMO Web · Noir Dining` (B4/B5 eran siembra y ya no existen). En los dos casos: dos, los dos de `CONSTRUIR`, ninguno más |
| 4 de 6 niveles llegan | Sí. No llegan `EVALUAR` (fila **13**) y `CONTACTO_SIN_DEMO` (fila **16**), cartera limpia |
| Identidad cola = cartera | `IDENTIDAD … (los 42): SÍ` con el código nuevo; `NO` con el viejo |

---

## 2 · El censo de siembra

### 2.1 · Categorías, con criterio objetivo

| Categoría | Criterio (patrón sobre `businessName`) | Filas | En `setter-qa` | Accionables `setter-qa` |
|---|---|---|---|---|
| `CORRIDA_AUTOMATICA` | `/\d{13}/` — el `Date.now()` que ponen las suites | 154 | 151 (+3 en un usuario de prueba huérfano) | **137** |
| `QA_CURADA` | `/^QA-/` | 26 | 26 | 12 |
| `GALERIA_M0` | `/^M0-GAL /` | 40 | 36 (+4 en los setters `m0-gal-*`) | 27 |
| `CORRIDA_MANUAL` | `/^CORRIDA\d* /` | 4 | 4 | 1 |
| `DEMO_WEB` | `/^DEMO Web · /` | 6 | 6 | 2 |
| `SIN_PREFIJO` | ninguno de los anteriores | 29 | 1 | 0 |
| **total** | | **259** | **224** | **179** |

### 2.2 · Qué usa cada suite

| Suite | Crea leads | Los borra | Lee siembra ajena por nombre | Deja filas al terminar |
|---|---|---|---|---|
| `test:setter` | sí, todos con `createLead` → `SMOKE-SETTER <x> <13 dígitos>` (`tests/helpers/setter-db.ts:269-271`) | sí, por id exacto en `afterAll` de los 34 specs (`setter-db.ts:364-378`) | **no**. Depende del usuario `setter-qa` y de `admin@develop.com` (`setter-db.ts:144-155`, `setter-auth.ts:27-28`) | **0** (259 → 259, medido) |
| `test:leados` | sí, en setters propios `smoke-setter-<label>-<ts>` | sí, por id exacto | **no** | **0** (259 → 259) |
| `test:helpers` | no — `page.setContent`, sin base | — | no | **0** |

Las mediciones fijas leen `QA_CURADA` por nombre: `capturar-franja.ts:115-120` (tabla fija `:165-180`) y
`medir-pliegue-manual.ts:477-557` (primer `QA-W` por estado derivado). La galería lee `GALERIA_M0` por nombre
exacto (`tests/galeria/captura.spec.ts:122-130`). **Por eso esas tres categorías no se tocan.**

### 2.3 · De dónde salieron los 154 (ninguna suite terminada los deja)

| n | Origen | Mecanismo |
|---|---|---|
| 51 | `tests/perf/_casos.ts:136`, caso `alta` | **Fuga por diseño**: el lead lo crea el formulario y el caso nunca lo registra en el tracker. 3 por corrida de `test:perf`, aunque termine bien |
| 50 | `tests/perf/_casos.ts` resto de casos P28 | corridas matadas antes del `afterAll` |
| 38 | `scripts/qa-corridas/medir-rafaga-progreso.ts:331-333` | teardown fuera de `finally`: un error lo saltea |
| 8 | `tests/setter/01-flow.spec.ts` (B1–B8, 2026-07-22) | corrida matada |
| 4 | `tests/setter/18-quinta-superficie.spec.ts` (Q5, 2026-08-27) | corrida matada |
| 3 | usuario `smoke-setter-EXP-1786459764476@develop.test` (2026-08-11) | corrida matada; el usuario también quedó |

### 2.4 · Leads reales

**Cero en la cartera de `setter-qa`**, que es una persona de QA: sus 73 leads restantes son semillas curadas.
En toda la base, lo más parecido a un lead real son los 29 `SIN_PREFIJO`: 21 del seed de agency-os con nombres
realistas asignados a `franco@develop.com` (15) y `valentino@develop.com` (6), 7 sin asignar (conversiones de
chatbot de prueba: `Juan Pérez`, `Playwright Test`, tres `Café de la Esquina`…) y 1 en `setter-qa`
(`Gimnasio Nova Fit`, no accionable). Ninguno es comercial: es una base de desarrollo.

---

## 3 · El borrado

### 3.1 · Primero se probó el respaldo

Borrado con respaldo A (154 leads · 103 dossiers · 37 actividades · 0 demos · 0 metas · 1 aviso · 0 proyectos)
→ restauración de A (259 de vuelta, **la cola medida lead por lead idéntica** a la de antes) → borrado con
respaldo B. **A y B idénticos columna por columna, timestamps incluidos.** La ida y vuelta es fiel.

### 3.2 · Intento 1 — cayó una suite, se restauró

Código viejo, cartera limpia: `test:leados` 41/41 · `test:helpers` 28/28 · **`test:setter` 193/194**.

Cayó `tests/setter/28-veredicto-y-ciclo.spec.ts:238` (N6). Discriminador, con el mismo build:

| Cartera | N6 |
|---|---|
| limpia | rojo 2/2 (corrida completa + aislado) |
| **restaurada** | verde |

Causa: el lead del test (`CONSTRUCCION` + `RESPONDIO`, recién creado) entraba en la fila 5 de la cola con el
orden viejo; la cola deduplica sus avisos fuera de Novedades, y el `.first()` de `:249` agarraba el aviso de
**otro** lead (`QA-W Ficha Incompleta`). Con los 151 de siembra delante, su lead quedaba fuera de la cola.
**N6 pasaba gracias a la basura.** Se restauró la categoría completa (respaldo B) y se declara.

### 3.3 · Intento 2 — con el código final, verde

Con el cambio de orden aplicado, el lead de N6 cae detrás de todos los `RESPONDIO` más viejos (fila ≥ 13) y
deja de depender de la siembra. Protocolo completo otra vez: conteo 259 → borrado con respaldo C (**idéntico a
A**) → 105.

| | antes | después |
|---|---|---|
| `CORRIDA_AUTOMATICA` | 154 | **0** |
| `QA_CURADA` | 26 | 26 |
| `GALERIA_M0` | 40 | 40 |
| `CORRIDA_MANUAL` | 4 | 4 |
| `DEMO_WEB` | 6 | 6 |
| `SIN_PREFIJO` | 29 | 29 |
| **OsLead** | **259** | **105** |
| cartera `setter-qa` | 224 | **73** |
| accionables `setter-qa` | 179 | **42** |

Después: `test:leados` **43/43** · `test:helpers` **28/28** · `test:setter` **194/194** · la base sigue en 105.

**Revisión de código y reverificación.** La revisión (sin CRITICAL/HIGH) marcó dos cosas en la herramienta: el
`JSON.parse` sin tipo que alimentaba la restauración y una re-lectura del respaldo que verificaba 2 de 6
colecciones. Corregidas (`leerRespaldo` exige las seis colecciones; la re-lectura compara las seis). Como cambió
el camino de restaurar, se volvió a probar: restaurar C (259) → borrar con respaldo D (105) → **D idéntico a A**
y **las mismas 105 ids** que antes. Como fue otro borrado, las tres suites otra vez: **43/43 · 28/28 · 194/194**.

Respaldos (fuera del repo): `C:\tmp\p37-siembra\respaldo-{A,B,C,D}\`. Restaurar:
`npx tsx scripts/dev/limpiar-siembra-corridas.mts --restaurar=<archivo>`.

### 3.4 · El mecanismo para que no vuelva

**Hecho:** `scripts/dev/limpiar-siembra-corridas.mts` — manual, ensayo por defecto, solo `CORRIDA_AUTOMATICA`,
guarda de 120 min (una corrida en curso en otro worktree comparte la base), respaldo obligatorio y verificado
antes de borrar, aborta si un lead tiene `Project`.

**Propuesto, no hecho (toca suites y configs):**

1. `tests/perf/_casos.ts:136` — el caso `alta` tiene que registrar en el tracker el id que aparece en la URL
   destino. Es la única fuga de una corrida que termina bien (1/3 de los 154).
2. `scripts/qa-corridas/medir-rafaga-progreso.ts:331-333` — teardown dentro de `finally`.
3. Crash-safety: un `globalSetup` en `playwright.setter.config.ts` y `playwright.perf.config.ts` que corra la
   limpieza con la guarda de edad. Cubre las corridas matadas (70 de los 154).
4. `28-veredicto-y-ciclo` N6 sigue dependiendo de la composición de la cartera (necesita ≥ 3 `RESPONDIO` más
   viejos para que su lead no entre a la cola). Un setter propio, como hacen 26 y 27, lo independiza.

---

## 4 · La cola, antes y después, con la cartera limpia

Medida con el código real de cada momento y operada en el panel (capturas `antes-*` y `despues-*`).

| # | ANTES (nivel primero) | DESPUÉS (urgencia) |
|---|---|---|
| 1 | QA-W Evaluada Gate Abierto · **fijado** | QA-W Evaluada Gate Abierto · **fijado** |
| 2 | QA-W Brief · **fijado** | QA-W Brief · **fijado** |
| 3 | QA-W Construccion · construila | QA-W Construccion · construila |
| 4 | M0-GAL 12-m6-brief-abierto · construila | **QA-W Aprobada Gate Abierto · la demo está lista para mandar** |
| 5 | DEMO Web · Noir Dining · construila | **QA-W Rechazada · te toca a vos** |
| | 2 de 6 niveles · pie «Quedan 37 más» | **4 de 6** · pie «Quedan 37 más» |

Por nivel (cartera limpia):

| Nivel | n | Primera fila ANTES | Primera fila DESPUÉS |
|---|---|---|---|
| fijado | 2 | 1 ✓ | 1 ✓ |
| `CONSTRUIR` | 16 | 3 ✓ | 3 ✓ |
| `ESPERA_TU_ACCION` | 14 | 19 ✗ | 5 ✓ |
| `CONTACTAR_CON_DEMO` | 3 | 33 ✗ | 4 ✓ |
| `EVALUAR` | 4 | 36 ✗ | **13 ✗** |
| `CONTACTO_SIN_DEMO` | 3 | 40 ✗ | **16 ✗** |

**Un lead con la demo aprobada:** antes, fuera de la cola y fuera de Novedades (sin aviso); se llegaba por la
cartera. Después, **fila 4** de la cola, a 1440 y a 390.

**Un setter sin trabajo** (`m0-gal-nada-para-trabajar`): no se dibuja la cola; ve «No hay nada para trabajar
ahora mismo», el desglose «1 esperando a Franco» y «¿Querés adelantar? Cargá un prospecto nuevo». Igual antes y
después.

---

## 5 · Los dos niveles de arranque

`EVALUAR` y `CONTACTO_SIN_DEMO` son los de empezar un lead. **Por construcción**, con la urgencia un lead nuevo y
frío entra al **fondo**: `urgenciaTier` vale 2 para todo lo que no respondió ni es caliente, y a igualdad manda la
antigüedad ascendente (`flow.ts:672-681`). Solo sube si el negocio responde o Franco lo marca caliente.

Medido con dos cortes, y drenando la cola como cola (el de arriba se hace y sale; cota optimista: no modela
reentradas ni leads nuevos):

| Corte | Accionables | `EVALUAR` aparece | `SIN_DEMO` aparece |
|---|---|---|---|
| Cartera sucia (hoy hasta este sprint) | 179 | tras despachar **32** | tras **35** |
| Cartera limpia (llena de trabajo en curso) | 42 | tras despachar **8** | tras **11** |
| Cartera vacía | 0 | un lead nuevo es la fila 1 | ídem |

**Respuesta:** **hoy no seca el embudo de esta cartera** —los 7 leads de arranque que ya existen son viejos,
están intercalados por antigüedad entre los fríos y aparecen tras despachar 8 y 11—, pero **sí es un problema
estructural**, y aparece justo cuando la cartera está sana: mientras haya cinco o más leads en curso más viejos,
un lead recién cargado y frío no aparece en la cola (hoy sería la fila 43 de 43). El setter lo arranca solo si
entra por «Cargá un prospecto nuevo» o por la cartera, no desde la cola. Cuando la cartera se vacía, se resuelve
solo. No se arregló.

---

## 6 · El número real de accionables, y el tope

**42.** Era 179. Y sigue sin ser de un setter real: 12 semillas QA, 27 de la galería, 2 demos de catálogo,
1 corrida manual. Es el número que existe para que cada pantalla tenga un lead, no un ritmo de trabajo.

**Propuesta: dejar el tope en 5.** Con la urgencia, la fila 6 es otro `CONSTRUIR` (`M0-GAL 12`) y las 7–8 repiten
niveles que ya están; para que lleguen los dos de arranque haría falta **tope 16** — el 38 % de la cartera, una
segunda cartera, lo contrario de lo que `cola.ts:29-37` dice que es la cola. El tope no es la palanca de los
niveles de arranque: si se quiere que lleguen, es otra decisión (por ejemplo, una fila reservada para «empezar
uno»). Con datos de un setter real, esto se vuelve a mirar.

---

## 7 · Los tests, demostrados fallando

| Prueba | Sabotaje | Resultado |
|---|---|---|
| `particion.invariant.ts` (reescrito, ver §8) | `trabajoTier` de vuelta en `ordenFoco` | rojo en «el orden de la cola es la urgencia…», `actual` = orden de P8. Los tres bloques nuevos, probados aparte: los **3 rojos** (la demo cae en la fila 13) |
| `tests/leados/cola-urgencia.spec.ts` P37-1 | ídem | rojo en «la demo aprobada … entra en la cola de 5»; P37-2 sigue verde |
| `tests/leados/cola-urgencia.spec.ts` P37-2 | `ownedListWhere` sin filtro de setter | rojo **en el aserto de aislamiento**: «la cola visible de A no contiene el lead de B (si entrara, estaría en la **fila 2**, adentro del tope de 5)». No por el tope |
| `18-quinta-superficie` 1a (acotado, ver §8) | `proximaAccion` de un aprobado **sin** link vuelve a invitar a mandarlo (build aparte) | rojo en el aserto de la tarjeta («Le toca a Franco — …» no está en *esa* tarjeta). Límite: cae en el aserto positivo que precede a los de ausencia; los de ausencia acotados no llegaron a ejecutarse bajo este sabotaje |

Todo sabotaje revertido con edición explícita y verificado por `git diff`. El build saboteado de `.next-perf`
se borró para no dejar una trampa (`start:perf` lo reconstruye).

---

## 8 · Lo que se cambió en pruebas existentes, y por qué no es aflojar

**`particion.invariant.ts`.** Se sacaron dos aserciones que fijaban la decisión que Franco revirtió: el orden
completo de P8 (construir → espera → con demo → evaluar → sin demo) y P8.a (la demo fría le gana al caliente sin
evaluar). En su lugar: el orden por urgencia con fixtures cuya clase lo contradice, la identidad cola = cartera
sobre un barrido de 56 leads, el nivel escaso que no queda enterrado, y el caliente que sube **sin** que se le
sugiera construir. Siguen intactos: el pin (A-05, P8.d), la restricción del premortem (P8.b), el gate (P8.c) y
que ningún accionable quede sin rótulo (P8.e, ahora sobre más leads).

**`18-quinta-superficie.spec.ts` 1a.** Los asertos de ausencia medían la **página**. Pasaban porque ningún
aprobado con link llegaba nunca a la cola — el defecto de P36 metido como precondición; el 1b del mismo archivo
afirma que ese texto sí debe verse para un aprobado con link. Con el cambio, la fila 4 de la cola lo dice con
razón y 1a se puso rojo sobre un lead que no es el suyo. Ahora miden **la tarjeta del lead sin link** (nombre
exacto con stamp), con un control positivo previo de que la tarjeta es única y visible.

---

## 9 · Las dos mediciones fijas

| | Fase 0 | Cierre (código nuevo, cartera limpia) |
|---|---|---|
| franja | 28 filas · 224/224 celdas iguales a P36 | 28 filas · **224/224** |
| pliegue | 28 filas · 1062/1062 celdas iguales a P36 | 28 filas · **1062/1062** |

(El comparador aplana objetos anidados, por eso cuenta más celdas que las 196/672 que declaró P36 con otra
cuenta; lo que importa es cero diferencias, incluidos `lead` y `url`.)

---

## 10 · Anotado, no hecho

- **El rótulo ya no explica la posición.** `motivoOrden` nombra la clase de trabajo; desde P37 no decide el
  lugar, así que la fila 3 dice «construila» arriba de una que dice «la demo está lista para mandar». La cartera
  ya tenía esta divergencia. El doc de `ItemCola.motivo` (`cola.ts:44`) todavía dice «por qué ocupa ese lugar».
- **Usuarios de prueba huérfanos** (`smoke-setter-EXP-1786459764476@develop.test` y posibles otros): la limpieza
  borra leads, no usuarios.
- `03-cabina` (`:103-121`) también depende de la composición de la cartera de `setter-qa` (flagueado por el censo).
- Verificación visual con el subagente `visual-qa` no despachada: sus herramientas de preview no están en esta
  sesión. La verificación se hizo con Playwright contra el build de producción, capturas en esta carpeta.
