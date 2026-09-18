# P36 · Fase 1 — Qué se está perdiendo la cola

Medido el 2026-09-12 contra la cartera de `setter-qa@develop.test`
(`cmq9zt64w00009f54psdq8wc8`), rama Neon dev.

El instrumento no re-deriva el criterio: lee el tier a través de `motivoOrden`
(`flow.ts:611`), que es la traducción 1:1 del `trabajoTier` real — su `switch` es
exhaustivo sobre `TrabajoTier`. Re-escribir el tier en el script habría medido
una copia y no el producto.

---

## 1 · Qué tiers existen y con qué criterio

`TRABAJO_TIER` — `flow.ts:725-731`. `trabajoTier()` — `flow.ts:739-757`; el orden
de los `if` **es** la prioridad, el primero que matchea gana:

| Tier | Constante | Condición (literal del código) |
|---|---|---|
| 0 | `CONSTRUIR` | `stage === 'BRIEF' \|\| stage === 'CONSTRUCCION'`; o `stage === 'EVALUADA' && gateAbierto` |
| 1 | `ESPERA_TU_ACCION` | `stage === 'RECHAZADA'`; o `followUpVencido \|\| postergadoVencido` |
| 2 | `CONTACTAR_CON_DEMO` | `stage === 'APROBADA'` |
| 3 | `EVALUAR` | `stage === null \|\| stage === 'FICHA'` |
| 4 | `CONTACTO_SIN_DEMO` | resto (`EVALUADA` con el gate cerrado) |

Por encima de los cinco hay un sexto nivel: el **pin**. `ordenFoco`
(`flow.ts:770-776`) es `Number(b.pinned) - Number(a.pinned) || trabajoTier(a) -
trabajoTier(b) || ordenUrgencia(a,b)`. Es un **orden total estricto**.

El corte: `TOPE_COLA = 5` — `cola.ts:38`.

---

## 2 · Qué entra y qué no, con la cartera real

Cartera hoy: **224 leads** (eran 172 cuando se anotó el hallazgo; la serie
histórica del mismo setter es 76 → 78 → 84 → 172 → 224).

| | |
|---|---|
| `grupos.trabajar` | **179** — los 179 con `accionable === true` |
| cola visible | **5** |
| **ocultos** | **174** |

Confirmado operando `/setter`: el chip dice `179 para trabajar` y el pie
`Quedan 174 más para trabajar, en tu cartera.`

Composición de `trabajar` por tier:

| Tier | n |
|---|---|
| PIN | 2 |
| 0 CONSTRUIR | 75 |
| 1 ESPERA_TU_ACCION | 19 |
| 2 CONTACTAR_CON_DEMO | 5 |
| 3 EVALUAR | 68 |
| 4 CONTACTO_SIN_DEMO | 10 |

La cola de hoy: 2 PIN + 3 CONSTRUIR. No llega a ningún otro tier.

---

## 3 · Cuáles de los que quedan afuera exigen acción, y cuáles son los más caros

Los 174 que quedan afuera son **todos** accionables — `accionable === true` para
los 179 de `trabajar`, sin excepción. No hay ninguno que esté ahí "de relleno".

Los más caros son los que ya tienen demo aprobada por Franco (`stage ===
'APROBADA'`): la demo existe, los treinta minutos ya se gastaron. Son **7**, y
**ninguno** entra a la cola:

| Lead | Tier | Clase |
|---|---|---|
| `QA-W Aprobada Gate Abierto` | 2 | A) demo lista con link, **sin mandar** |
| `SMOKE-SETTER B7 Aprobar` | 2 | A |
| `M0-GAL 27-m15-envio-abierto` | 2 | A |
| `SMOKE-SETTER Q5 Taller Con Link` | 2 | A |
| `QA-B6 Gimnasio Atlas` | 2 | A (entra por `caliente`, status `VIO_VIDEO`) |
| `M0-GAL 33-m5-post-envio` | 1 | B) demo **mandada**, toque vencido |
| `SMOKE-SETTER Q5 Postergado M5` | 1 | B |

---

## 4 · Cuántos accionables hay — y por qué el número no sirve para decidir el tope

**179.** Pero **165 de los 179 son artefactos de suites** (`SMOKE-SETTER`,
`M0-GAL`, `CORRIDA`): semillas que las corridas de test dejaron en la cartera de
QA y nadie limpió. El número no mide el ritmo de nadie.

Sin artefactos: **28 leads, 12 accionables, 7 ocultos.**

→ Anotado, fuera de scope: la cartera de QA acumula semillas de cada corrida.
Es higiene de la DB de QA, no de este sprint.

---

## 5 · ¿El lead del hallazgo aparece en algún lado del panel?

`QA-W Aprobada Gate Abierto` — `RESPONDIO` + `APROBADA` + `finalUrl` + sin enviar,
`accionable = true`, `proximaAccion = "Demo aprobada — mandá el link al negocio"`:

| Superficie | ¿Aparece? |
|---|---|
| Foco | **No** |
| Cola (5 filas) | **No** — posición 97 de 179 |
| Novedades / avisos | **No** — 0 filas en `OsSetterNotice` para ese lead |
| Contadores | Solo agregado: es uno de los `174` del pie |
| DOM renderizado del panel | **0 nodos** |

El único match del nombre en la página era el payload RSC dentro de un
`<script>` — no DOM real. El lead no está renderizado en ninguna parte del panel.

---

## 6 · ¿Es el único? No — cuatro de los seis niveles son inalcanzables

Acumulado por posición (cartera completa):

| Nivel | n | Primera fila que ocuparía | ¿Llega? |
|---|---|---|---|
| PIN | 2 | 1 | ✓ |
| 0 CONSTRUIR | 75 | 3 | ✓ |
| 1 ESPERA_TU_ACCION | 19 | 78 | ✗ |
| 2 CONTACTAR_CON_DEMO | 5 | 97 | ✗ |
| 3 EVALUAR | 68 | 102 | ✗ |
| 4 CONTACTO_SIN_DEMO | 10 | 170 | ✗ |

### El control: ¿es el volumen, o es el mecanismo?

Misma medición sobre la cartera **sin artefactos de suites** — 28 leads, 12
accionables, apenas 7 ocultos:

| | fila 1 | 2 | 3 | 4 | 5 | Tiers inalcanzables |
|---|---|---|---|---|---|---|
| sin artefactos | PIN | PIN | T0 | T1 | T1 | **T2 (2), T3 (1), T4 (1)** |

**El lead del hallazgo sigue afuera.** Con doce accionables y siete ocultos, tres
niveles enteros siguen sin llegar. El defecto no es del volumen.

---

## La causa

`ordenFoco` es un **orden total estricto** y la cola corta duro en 5. Con eso, el
primer nivel que tenga cinco o más leads consume la cola entera y todo lo que
está debajo se vuelve inalcanzable — no improbable: **inalcanzable**.

Y el nivel que está arriba es el más poblado del embudo por naturaleza. Censo
sobre todos los dossiers del sistema:

| | n |
|---|---|
| `BRIEF` + `CONSTRUCCION` → tier CONSTRUIR | **67** |
| `APROBADA` + `finalUrl` + sin enviar → tier CONTACTAR_CON_DEMO | **6** |
| ratio | **11,2 ×** |

El embudo se angosta hacia la reunión: muchos construyendo, pocos listos para
mandar. **Se puso arriba el tier abundante.** Un tier abundante en la cima
monopoliza siempre; uno escaso se agota en una o dos filas y deja lugar.

---

## Addendum · Las dos superficies discrepan, y la secundaria acierta

Medido en la app sobre el mismo lead, `QA-W Aprobada Gate Abierto`:

| Superficie | Criterio de orden | Posición |
|---|---|---|
| **Cola** (la principal) | `ordenFoco` → `trabajoTier` (`flow.ts:772`) | **97 de 179** → no entra |
| **Cartera** (la secundaria, plegada) | `filtrarYOrdenarCartera` → `ordenUrgencia` (`flow.ts:1042`, default `'urgencia'` en `cartera-view.tsx:45`) | **9 de 187** |

`ordenUrgencia` (`flow.ts:688-690`) es respondió → caliente → antigüedad. Como el
lead respondió, la cartera lo pone noveno. La cola lo manda al puesto 97 porque
`trabajoTier` domina y `ordenUrgencia` quedó reducido a desempate **dentro** del
tier (`flow.ts:770-776`).

El criterio que prioriza al que respondió **ya existe en el producto** y sigue
funcionando en la cartera. La cola lo degradó a tercer nivel de comparación, y
con eso enterró exactamente al lead que el negocio ya está esperando.

Llegar: **1 clic** («Ver toda la cartera») + **1,6 pantallas** de scroll.
