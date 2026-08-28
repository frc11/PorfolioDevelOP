# BACHES RE-VERIFICADOS — sobre el producto podado

**Qué es esto.** La re-verificación de [`BACHES-CORRIDA-EXPERIENCIA.md`](BACHES-CORRIDA-EXPERIENCIA.md)
sobre el árbol reconciliado. No es un chequeo: **la corrida midió el producto sin podar, entero**.

**Cuándo.** 12 de agosto de 2026.
**Contra qué.** `main` = `05ae1a87` (reconciliado en la Fase A), build de producción aislado en un
worktree propio (`C:/Users/franc/Desktop/wt-f0-p11`), `E2E_DIST_DIR=.next-setter`, puerto **3006**,
`AUTH_URL` alineado al puerto. Ningún servidor ajeno tocado.
**Datos.** Seeds `v1-qa-wizard-states.ts` (13 estados del wizard) + `qa-manual-m5-m16.ts` (4 estados
de seguimiento/agenda), todos owned por `setter-qa`, contra la branch Neon **dev**.

---

## 1 · Fase A — el diagnóstico de ramas y qué se reconcilió

### Lo que pasaba

| Rama | Commit | Relación | Qué tenía |
|---|---|---|---|
| `main` (local) | `4dadd274` | 0 adelante / **56 atrás** de `origin/main` | **ninguno** de los diez bloques |
| `origin/main` | `55b967af` | — | 4 bloques (P1, canal, P4, P5-A) |
| `redesign/home` | `0f6fee58` | **34 adelante / 30 atrás** — divergida | 10 bloques, **17 commits sin copia** |
| `stash@{0}` | `507afe2d` | fuera de toda rama | **P11 entero** |

`main` estaba **contenido** en `origin/main` (avance directo, sin conflicto). `redesign/home` y
`origin/main` sí divergieron, pero **en archivos distintos**: setter/home de un lado,
`src/modules/chatbot/` del otro.

**El hallazgo que reencuadra todo:** el reporte de la corrida declara `4dadd274`, y ese commit
**no tiene ni uno solo de los diez bloques**. La corrida no midió "el producto con parte de la poda":
midió el producto **sin podar**. El propio reporte lo había detectado sin poder explicarlo — anotó que
"la pantalla de evaluación fusionada no existe: son dos" y que las de construcción "son seis".

### Qué se hizo

1. **Paso 0 — P11 rescatado del stash.** `git stash apply` (nunca `pop`: el stash original sigue
   intacto) sobre una rama nueva `leados/p11-turno` anclada en su base real `0f6fee58`, en un worktree
   aislado. Entraron los 15 archivos tracked **y los dos del tercer padre** (`turno.ts`,
   `turno.invariant.ts`) sin los cuales el sprint no compila; verificado por hash contra
   `stash@{0}^3` (`b15145fb`, `28413d04`). Commit `513f38b4`.
2. **Otra sesión se movió en paralelo.** Mientras corría el diagnóstico, otra sesión commiteó la
   corrida (`daed0270`) y mergeó `origin/main` (`8b60c176`), y **pusheó**. Auditado: `55b967af →
   8b60c176` suma la bitácora (+103), el doc de baches (+1210) y `.gitignore` (+2) — **borra cero
   líneas**. También pusheó `redesign/home`.
3. **Reconciliación.** `f0/reconciliacion` desde `origin/main`, merge de `redesign/home`
   (`dc2be42a`) y de `leados/p11-turno` (`05ae1a87`).
4. **Un solo conflicto, y no era código:** `docs/bitacora-beta-3.md`. `.gitignore`, `next.config.ts`
   y `package.json` automergearon limpio. **Cero conflictos en código de producto, cero en tests.**
   Resuelto por concatenación cronológica (11 secciones de la poda del 3/8 al 10/8 → P11 del 10/8 →
   la corrida del 11/8), con verificación mecánica de que no se perdió texto:

   | Chequeo | Resultado |
   |---|---|
   | conteo de líneas = base + lado A + lado B | 2394+1391+103 = **3888** ✓ · 3785+154+103 = **4042** ✓ |
   | el tramo común es idéntico a la base | ✓ |
   | cada tramo nuevo es idéntico a lo que sumó su lado | ✓ |
   | ninguna línea de `origin/main` falta (multiset) | ✓ |
   | ninguna línea de `redesign/home` / P11 falta (multiset) | ✓ |
   | no aparecen líneas que no estén en ningún lado | ✓ |
   | secciones `##`: 68 base + 1 + 11 + 1 = **81** | ✓ |
   | marcadores de conflicto sobrevivientes | **0** |

5. **Los once bloques, verificados presentes** en `05ae1a87`: P1 y canal (`c2160792`), P4
   (`5d844bb6`), P5-A (`9029b03c`), P5-B/P7/P8 (`fafd7963`), colapso 1 y 2 (`742f7565`, `42c6edc9`),
   P9 (`f06df31e`), P11 (`513f38b4`).
6. **Gates:** `npx tsc --noEmit` **exit 0, cero errores** (la línea base en `main` tenía 4, todos de
   `.next/` generado apuntando a `src/app/styleguide` que no existía en esa rama — desaparecieron al
   volver la pantalla). `npm run check:invariants` **19/19, exit 0** (17 antes; suma `pantallas` y
   `turno`).
7. **Push**, en orden: `redesign/home` (ya estaba) → `leados/p11-turno` (rama nueva) →
   `HEAD:main` (`8b60c176..05ae1a87`). `main` local avanzado por fast-forward.

**Nada perdido.** Verificado commit a commit: `origin/main`, `redesign/home`,
`origin/redesign/home` y `leados/p11-turno` tienen **0 commits** fuera de la rama reconciliada.

---

## 2 · La tabla de baches

**Criterio.** Todo se afirma contra el **DOM renderizado** o contra la **base**, nunca contra el HTML
crudo: el payload RSC contiene datos que la pantalla no muestra, y un `grep` sobre él da falsos
positivos (me pasó con el motivo del rechazo y con el filtro "Rechazadas" — los dos "aparecían" en el
HTML y no existen en pantalla).

### Verificados

| ID | Bache | Estado | Evidencia |
|---|---|---|---|
| **B-B1** | Postergación un día antes | **VIVO** | 2/2 — ver §3 |
| **B-B3** | El contador de DMs sube al registrar cualquier cosa | **VIVO** | 0→1→2 postergando — ver §3 |
| **B-C7** | "Pausar en tu cartera" no hace nada | **REFUTADO** | Falso positivo de la corrida — ver §3 |
| **B-A1** | "Reabrir construcción" borra el motivo del rechazo | **VIVO** (mecánica corregida) | El dato **sobrevive** en `dossier.rechazos`; **0 de 8 pantallas** lo muestran tras reabrir |
| **B-A2** | Reabre en la fase equivocada (mr → m7) | **CAMBIÓ** | Ahora reabre y aterriza en **m14**, no en m7. m7 ya no existe |
| **B-P2** | El puntero "dónde estoy y a dónde voy" miente | **RESUELTO** | 26 combinaciones lead×pantalla: "Ir a tu paso actual" apunta al paso real en todas (mr, mc1, m6, revision, m15). m3 y m5 ya no existen como los describía |
| **B-P3** | Las acciones no se acusan donde hiciste el clic | **PARCIAL** | Ver §4, patrón 1 |
| **B-A4** | El chequeo final se nombra y no se linkea | **VIVO donde importa** | Con el lead en CONSTRUCCIÓN, m13 y m14 lo nombran y **ningún** `<a>` apunta a m14. El link aparece recién en EN_REVISION/APROBADA, cuando ya no hace falta |
| **B-A7** | El historial dice "sin movimientos" con un rechazo encima | **VIVO** | "Ver historial del lead — sin movimientos" en mc1, con `rechazos` poblado |
| **B-A8** | Nadie te avisa que te rechazaron la demo | **VIVO** | 8 filtros de cartera, ninguno es "Rechazadas" |
| **B-A9** | Novedades dice 76, muestra 12, sin "ver más" | **VIVO** | contador 76 · 12 `<li>` · sin "ver más" |
| **B-B2** | Postergar no acusa recibo | **RESUELTO** | Anuncia *"Postergado — el panel lo retoma en la fecha que marcaste."* y el botón se deshabilita |
| **B-C1** | La nota privada es un campo mudo | **VIVO** | `<textarea>` sin `id`, sin `aria-label`, sin `aria-labelledby`, sin `<label>` envolvente. **Nombre accesible: `null`** |
| **B-C6** | Los checks llegan sueltos y sin agrupar | **VIVO** | 14 switches, **0** con `aria-describedby`, **0** `fieldset`/`legend`/`role=group` |
| **B-C11** | El panel de atajos no recibe el foco | **PARCIAL** | Tiene `aria-expanded`; sigue sin `aria-controls` |
| **B-P6** | Tres números y solo dos explicados | **CAMBIÓ** | Ahora son **dos** ("1 de 46 para trabajar", "Ver toda la cartera 76"); "N activos de M" ya no está |
| **B-P7** | Dos botones al pie del chequeo | **RESUELTO** por P7 | Ya no hay "Guardar el chequeo" — queda solo "Enviar a revisión" (el chequeo autoguarda) |
| **B-D10** | Contraste por debajo de AA | **VIVO en desktop** | **46 de 103** textos visibles de `/setter` incumplen AA. Peor: **1,97:1** a 10px. Ver §5 |
| **B-D11** | m4 y m5 redirigen sin decir nada | **CAMBIÓ** | Ya no caen en m6: un paso inexistente o no alcanzado **redirige al paso actual** (`mzz` → `mc1`), y sigue sin decir nada |
| — | Las seis pantallas de construcción | **CAMBIÓ** (P6-B) | m7–m12 no existen. Solo `mc1` "Construí la demo en Claude Design" y `mc2` "Refiná la demo antes de publicarla" |
| — | La pantalla del brief (m6) | **CAMBIÓ** (P5-B) | Ya no hay "Guardar" ni campos que la ficha ya tiene: dos botones de juicio sobre el brief generado. La pantalla se actualiza en el lugar al elegir |
| — | "Saltar" en el foco | **VIVO** | Commitea (tras recargar el foco cambió) pero **no anuncia**; el botón queda deshabilitado |
| — | Las herramientas sin dirección | **NO VERIFICABLE** | 4 de 5 muestran "pendiente" (Chat de evaluación, Gem de diseño, Claude Design, Gem de outreach). Falta que Franco cargue las URLs |

### Pendientes de re-verificar

No alcancé a manejarlos en la aplicación y **no los clasifico de memoria**. Todos son no-celular:

`B-P1/B-C2` (error de Zod crudo en m13) · `B-A6` (m13 congelada tras rechazo) · `B-A5` ("el botón está
arriba") · `B-A3` (checklist vacío) · `B-A10` (rechazo sin fecha) · `B-A11` (mr copiar bloque sin
destino) · `B-B4/B-B10` · `B-B5` (fecha de postergación no viaja) · `B-B6` (postergado vencido vs
futuro) · `B-B7` (vocabulario pausar/postergar) · `B-B8` (m5 manda al Gem sin la aclaración de m4) ·
`B-B9` (toques restantes) · `B-B11` (esperas del negocio) · `B-C3/C4/C5` (selects) · `B-C8` (chips de
fases) · `B-C9` ("Enviar a revisión" apagado sin explicar — el seed lo deja habilitado; hace falta el
estado con el gate cerrado) · `B-C10` (grupo de m5) · `B-C12` ("Copiar bloque" sin live region) ·
`B-P4` (nav "Cartera" → "Tu día"; hoy es un `<button>`, no un `<a>`) · `B-P5` · `B-P8` ·
`B-P9/A12/B12`.

---

## 3 · Los tres bugs de datos

### 1 · La postergación se guarda un día antes — **VIVO**

Reproducido **dos de dos**, con dos fechas distintas:

| Elegí | Se guardó (`reactivateAt`) | La pantalla dice |
|---|---|---|
| **25/8/2026** | `2026-08-25T00:00:00.000Z` | "Postergado — se retoma el **24/8**" |
| **1/9/2026** | — | "Postergado — se retoma el **31/8**" |

**Causa, probada de punta a punta.** El `<input type="date">` manda `'2026-08-25'`. El schema hace
`z.coerce.date()` → `new Date('2026-08-25')`, y por especificación de ECMAScript una fecha ISO **sin
hora se parsea como UTC** → medianoche UTC. Después `formatFechaCorta`
([`flow.ts:245`](../../src/lib/leados/flow.ts)) la formatea en `America/Argentina/Buenos_Aires`
(UTC−3) → el día anterior. Verificado aislado en Node: `new Date('2026-08-25')` formateado en ese huso
da **`24/8`**.

**No es sólo la etiqueta.** El instante guardado es 21:00 del día anterior en hora argentina, así que
el panel **reactiva el lead un día antes de verdad**, no sólo lo muestra mal.

**Contraste útil:** el pausar de la cartera hace lo correcto — "1 semana" desde el 12/8 guardó
`2026-08-20T02:59:59.000Z`, o sea el **19/8 a las 23:59:59 hora argentina**. Fin del día local, no
medianoche UTC. La forma correcta ya existe en el producto.

### 2 · El contador de mensajes sube sin mandar nada — **VIVO**

Medido en pantalla: **`hoy 0 / 10 DMs` → postergar → `1 / 10` → postergar otro lead → `2 / 10`**. Cero
mensajes enviados.

**Causa.** `contarDmsHoy` ([`outreach.ts:60`](../../src/lib/leados/outreach.ts)) cuenta **toda**
`OsLeadActivity` con `channel: 'INSTAGRAM_DM'` creada hoy por ese setter, sin mirar el `result`.
Postergar escribe una actividad con `result: POSTERGADO` en ese canal, y por eso suma. El contador
cuenta **registros en el canal**, no **mensajes enviados**.

### 3 · El botón de pausar no hace nada — **REFUTADO**

**No es un bug.** "Pausar en tu cartera" no es una acción: es un **disclosure** que abre un panel
abajo de la tarjeta ("Sacarlo de tu vista hasta…" + atajos *3 días / 1 semana / 2 semanas* + campo de
fecha + botón "Pausar"). Verificado: el panel abre, el commit **persiste**
(`snoozedUntil: 2026-08-20T02:59:59.000Z`) y **anuncia** en la live region *"Pausado — vuelve a tu
cartera el 19/8."*

La corrida midió label, `disabled` y `aria-live` — las señales correctas para un botón de acción — y
nunca miró si se abría un panel. Y el componente
([`lead-card-actions.tsx`](../../src/app/(protected)/setter/_components/lead-card-actions.tsx)) es
**byte a byte idéntico** entre `4dadd274` y `05ae1a87`: se comportaba igual durante la corrida.

**Dos residuos reales, más chicos:**
- El disclosure **no tiene `aria-expanded`** (sí lo tienen "Ver toda la cartera" y el panel de
  atajos). Quien no ve la pantalla no se entera de que se abrió algo.
- Las tres acciones de la tarjeta comparten un solo `isPending`: mientras una está en vuelo, las otras
  dos quedan `disabled` sin explicar por qué.

---

## 4 · Los patrones, re-contados

| # | Patrón | Antes | Ahora | Estado |
|---|---|---|---|---|
| 1 | No hay acuse de recibo estándar | 10 casos | **≥3 verificados vivos, ≥4 resueltos** | **baja de prioridad** |
| 2 | El puntero de "dónde estoy y a dónde voy" miente | 8 casos | **1 verificado vivo** (el link al chequeo final) | **casi cerrado** |
| 3 | El dato que necesitás vive en una sola pantalla | 7 casos | **3 verificados vivos** (motivo del rechazo, historial, rechazo fuera del panel) | **sigue siendo patrón** |
| 4 | Mensajes de sistema crudos | 2 casos | **0 verificados** (ninguno de los dos re-probado) | pendiente |
| 5 | Vocabulario que cambia entre pantallas | 4 grupos | **pendiente**; P9 barrió esta zona | pendiente |
| 6 | Lo que decide más pesa menos | 4 casos | **1 vivo no-celular** (14 switches sin agrupar); los otros 3 eran de celular | **diferido casi entero** |

### El patrón 1, en detalle — y dónde está el modelo

**Confirmado: el patrón correcto existe, y ahora está en más de un lugar.**

| Acción | ¿Anuncia? | Qué dice |
|---|---|---|
| **"Fijar arriba"** (cartera) | ✅ | *"Fijado arriba en tu cartera."* + se deshabilita al instante |
| **Pausar** (cartera) | ✅ | *"Pausado — vuelve a tu cartera el 19/8."* |
| **Postergar** (m5) | ✅ | *"Postergado — el panel lo retoma en la fecha que marcaste."* |
| **Reabrir construcción** (mr) | ✅ | *"Construcción reabierta — guiate por el rechazo."* |
| **Elegir el juicio del brief** (m6) | ❌ anuncio, ✅ pantalla | Sin live region, pero **la pantalla se rehace en el lugar**: desaparecen los botones y aparece "Ir a tu paso actual" |
| **"Saltar"** (foco) | ❌ | Sin anuncio. El botón se deshabilita y **queda** deshabilitado |

**El modelo a replicar es `ActionButton` de
[`lead-card-actions.tsx`](../../src/app/(protected)/setter/_components/lead-card-actions.tsx)**: un
`useTransition` que deshabilita el control en el acto + un `toast` que además escribe en la región
`aria-live="polite"`. Es lo que usan el pin y el pausar, y es exactamente el par de señales que le
falta a "Saltar".

**Una limitación del instrumento, declarada.** El panel del navegador **no compone frames**, así que
no hubo capturas y **no puedo afirmar la otra mitad del patrón** — "la pantalla sigue mostrando el
estado anterior". Lo que sí es fiable es el anuncio, que es client-side y no depende de frames. Donde
digo "no anuncia", está medido. Donde la corrida decía "la pantalla queda vieja", queda **no
verificable con este instrumento**.

---

## 5 · La lista de trabajo que queda, ordenada por daño

1. **B-B1 · La postergación se guarda un día antes.** Produce datos falsos y **actúa** un día antes.
   Si le dijiste al negocio "te escribo el 25", el panel te lo trae el 24. La forma correcta ya está
   en el pausar de la cartera (fin del día local).
2. **B-A1 · El motivo del rechazo no viaja.** El dato **está** en `dossier.rechazos` y sobrevive a la
   reapertura: es un arreglo de presentación, no de persistencia. Mucho más barato de lo que parecía.
3. **B-B3 · El contador de DMs miente.** Postergás diez leads a la mañana y el panel te dice que
   gastaste un tercio del cupo. Un filtro por `result` en `contarDmsHoy`.
4. **B-D10 · Contraste.** 46 de 103 textos de `/setter` por debajo de AA, el peor a 1,97:1. Es
   transversal y aplica en computadora.
5. **B-A8 + B-A7 · El rechazo no aparece donde el setter mira.** Sin filtro "Rechazadas", sin novedad,
   y el historial dice "sin movimientos" con el rechazo encima.
6. **B-A4 · El chequeo final no se linkea cuando hace falta.** Se nombra en m13 y m14 durante la
   construcción y no hay forma de llegar; el link aparece recién cuando ya no sirve.
7. **B-C1 · La nota privada sin nombre accesible.** Nombre accesible `null`. Un `id` + `label for`.
8. **B-C6 · Los 14 checks sin `aria-describedby` ni agrupar.**
9. **"Saltar" sin acuse** y **el disclosure de pausar sin `aria-expanded`** — los dos se cierran
   copiando `ActionButton`.
10. **B-A9 · Novedades 76/12 sin "ver más".**
11. Los **22 pendientes** de §2, que hay que manejar en la aplicación antes de clasificar.

---

## 6 · Lo diferido

**Todo el barrido de celular**, por decisión de Franco: el setter trabaja desde computadora. No se
verificaron ni se arreglan: `B-D1` (X del menú), `B-D2` (nav Cartera a 2.277px), `B-D3` (blancos
táctiles de los 6 obligatorios), `B-D4` (munición al 20%), `B-D5` ("Volver a tu cartera" 16px),
`B-D6` (truncado de nombres), `B-D7` (228 blancos de 28×28), `B-D8` (zoom de iOS), `B-D9` (desborde a
320px), `B-D12` (escalera de completadas).

`B-D10` (contraste) **no** se difirió: aplica en computadora y está verificado vivo.

**Dependen de configuración, no de código:** las cuatro herramientas sin URL (Chat de evaluación, Gem
de diseño, Claude Design, Gem de outreach) muestran "pendiente" en la barra lateral y en la munición.
Hasta que Franco cargue las direcciones, `B-B8` y los baches de "Link pendiente" son **no
verificables**.

---

## Lo que esta corrida movió

**Escrituras en la base** (todas en la Neon **dev**, todas revertibles re-corriendo los seeds):
dos postergaciones (`QA-M5 Toque` → 25/8, `QA-M5 Agotada` → 1/9), un pin y una pausa sobre
`QA-B3 Panadería Doña Rosa`, un pin sobre `QA-W Brief`, un "Saltar" en el foco, el juicio del brief de
`QA-W Brief` (BRIEF → CONSTRUCCIÓN) y una reapertura de construcción sobre `QA-W Rechazada`
— **este último ya restaurado** re-corriendo `v1-qa-wizard-states.ts`.

**Ninguna acción hacia afuera fue disparada.** Cero mails, cero WhatsApp, cero webhooks.

**El diff:** este archivo y la entrada de bitácora. **Cero `src/`, cero tests, cero config.**
