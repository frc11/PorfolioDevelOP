# PROBE — las seis pantallas de Construcción (previo a P6)

**Fecha:** 2026-08-04 · **Rama:** `redesign/home` · **HEAD:** `df62c74`
**Naturaleza:** read-only. Cero código, cero tests, cero configuración tocados. El único archivo escrito es este.

Cada afirmación va marcada **VISTO** (leído en el archivo, con cita `archivo:línea`) o **INFERIDO** (deducción a partir de lo visto, sin ejecución).

---

## Fase 0 — Terreno

### `git status --porcelain`

```
 M logic-core-v3/.gitignore
 M logic-core-v3/docs/bitacora-beta-3.md
 M logic-core-v3/next.config.ts
 M logic-core-v3/package.json
 M logic-core-v3/playwright.setter.config.ts
 M logic-core-v3/tsconfig.json
```

Seis archivos modificados, **ninguno del recorrido del setter**. No se tocó nada de esto.

**VISTO** — el WIP no es del frente del sitio público como anticipaba el encargo: es **el microsprint de aislamiento de la suite del setter, sin commitear**. `package.json` suma `start:setter` (`E2E_DIST_DIR=.next-setter`, puerto 3003); `playwright.setter.config.ts` repunta el `webServer` de `start:qa`→`start:setter`, cambia el puerto default 3001→3003 y pone `reuseExistingServer: false`; `tsconfig.json` incluye `.next-setter/types/**`; `next.config.ts` suma el `distDir` condicional. `bitacora-beta-3.md` trae +76 líneas. (`git diff logic-core-v3/package.json logic-core-v3/playwright.setter.config.ts`)

**Consecuencia para P6:** el microsprint de la suite **existe pero no está en el historial** — vive solo en el working tree de este checkout. Si P6 arranca en un worktree dedicado, arranca **sin** el aislamiento de `.next-setter/` y `test:setter` vuelve a pelear el directorio `.next/` con cualquier `next dev` vivo.

### `git log --oneline -10`

```
df62c74 fix(design-system): calibración del piso móvil, acentos, CTA e índice
b7aca28 chore(impeccable): instala el detector y fija el baseline pre-rediseño
d8f970a fix(home): revela la capa 3D del hero con red de seguridad
9029b03 feat(setter): P5-A la ficha recibe el material para construir la demo
5d844bb feat(setter): P4 fusiona las dos pantallas de evaluacion en una
9a18efb refactor(home): purga del intro, el 3D y la navegacion vieja
3fd3d1d chore: ignora .netlify y los worktrees anidados
0e4c9b0 feat(home): hero tipografico del sistema nuevo
c216079 fix(setter): perfil conservador del canal de Instagram y ajustes de copy
b9bed7c fix(nav): repara anclas rotas del chatbot y del menú mobile
```

- **P4** → `5d844bb`. **Presente.**
- **P5-A** → `9029b03`. **Presente.**
- **Microsprint de la suite** → **NO está commiteado** (ver arriba). Anotado, no frena el probe.

### `git worktree list`

```
C:/Users/franc/Desktop/PorfolioDevelOP                                           df62c74 [redesign/home]
C:/Users/franc/Desktop/PorfolioDevelOP/.claude/worktrees/funny-williams-001d41   6254428 (detached HEAD)
C:/Users/franc/Desktop/PorfolioDevelOP/.claude/worktrees/priceless-nobel-ed8d02  06be833 [claude/priceless-nobel-ed8d02]
C:/Users/franc/Desktop/PorfolioDevelOP/.claude/worktrees/sad-burnell-2f5e2d      05be083 [claude/sad-burnell-2f5e2d]
C:/Users/franc/Desktop/wt-auditoria-clean                                        49fec9b [chore/auditoria-clean]
C:/Users/franc/Desktop/wt-auditoria-maestra                                      5ff538d [chore/auditoria-maestra]
C:/Users/franc/Desktop/wt-auditoria-seguridad                                    707bfe2 [chore/auditoria-seguridad]
C:/Users/franc/Desktop/wt-gs-aislamiento                                         403280b [chore/gs-aislamiento]
```

Ocho worktrees. `redesign/home` sólo puede vivir en el principal (las otras copias están en ramas distintas) — mismo terreno que frenó a P4.

---

## A · Las seis pantallas, una por una

### El hallazgo que ordena toda esta sección

**VISTO** — las seis pantallas **no son seis componentes: son un componente parametrizado por `faseId`**. `m-construccion.tsx:13-28` lo dice explícito: *«Un solo módulo parametrizado por `faseId`»*. El árbol de condicionales de la página tiene **una sola rama** para las seis (`[paso]/page.tsx:215` — `: faseConstruccion ?`), y esa rama pasa `faseId` a los tres slots.

Lo único que varía entre las seis son **cuatro campos de datos** de `SHELL_CONSTRUCCION` (`flow-content.ts:50-111`) más el mapeo de prompts de `FASE_PROMPTS` (`prompts-disenio.ts:178-181`). Todo lo demás —contexto, controles, registro, escalamiento, navegación, badge— es **literalmente el mismo JSX**.

### Tabla comparativa

| | **m7 · Estructura** | **m8 · Personalización** | **m9 · Assets** | **m10 · CTA** | **m11 · Calidad** | **m12 · Mobile** |
|---|---|---|---|---|---|---|
| **Nombre que ve el setter** (h2) | «Estructura» | «Personalización con datos del negocio» | «Assets reales» | «CTA de WhatsApp» | «Calidad y motion» | «Mobile» |
| **Chip corto** (nav) | Estructura | Personalización | Assets | CTA | Calidad | Mobile |
| **Indicador** | Construcción — paso 1 de 6 | paso 2 de 6 | paso 3 de 6 | paso 4 de 6 | paso 5 de 6 | paso 6 de 6 |
| **Qué le pide** (bajada) | «Generá el esqueleto de la demo en Claude Design a partir del brief.» | «Reemplazá todo texto genérico por la realidad del negocio.» | «Logo y fotos del negocio, no placeholders. Este sub-paso no se saltea.» | «El botón de contacto es el corazón comercial de la demo.» | «El pulido que separa una demo creíble de una plantilla.» | «La mayoría de los dueños la van a abrir desde el celular.» |
| **Munición — items propios** (3 c/u) | «Copiá el bloque del brief (está acá abajo) y pegalo en Claude Design como primer mensaje.» · «Pedile una landing de una sola página con las secciones del brief, en ese orden.» · «No agregues secciones que el brief no pide — el brief es el plano.» | «Nombre, rubro y zona reales en el hero y el pie.» · «Usá frases de las reseñas reales como prueba social (las tenés en la ficha).» · «Horarios, dirección y servicios tal como los publica el negocio.» | «Bajá el logo y 3–5 fotos del Instagram o Google Maps del negocio.» · «Insertalas donde Claude Design puso imágenes genéricas o de stock.» · «Si el negocio no tiene logo, usá el nombre tipografiado — nunca un logo inventado.» | «Botón de WhatsApp con el número real del negocio (formato wa.me/549...).» · «Mensaje pre-cargado simple: "Hola! Vi la página y quiero hacer una consulta".» · «Probá el link: tiene que abrir el chat correcto.» | «Máximo 2–3 colores, tomados de la marca del negocio.» · «Espaciados consistentes y jerarquía clara (un solo título grande por sección).» · «Animaciones sutiles si Claude Design las ofrece — nada que maree.» | «Achicá la ventana al ancho de un celular (o usá la vista mobile de Claude Design).» · «Nada cortado, nada desbordado, textos legibles sin hacer zoom.» · «El botón de WhatsApp tiene que quedar alcanzable con el pulgar.» |
| **Munición — prompts copiables** | — | — | — | — | **2:** «Pulí la estética» + «Mejorá el motion y los estados» | **1:** «Adaptá a mobile» |
| **Munición — resto** (idéntico en las 6) | Badge «Guía preliminar — en validación» + `ToolGuide claudeDesign` (hoy **«Link pendiente»**, `url: null`) | ídem | ídem | ídem | ídem | ídem |
| **Contexto** (idéntico en las 6) | `CopyBlock` «Bloque para Claude Design» — brief + materiales reales, re-servido entero | ídem | ídem | ídem | ídem | ídem |
| **Controles propios** | **Ninguno.** Sólo el tilde compartido. | ídem | ídem | ídem | ídem | ídem |
| **Controles compartidos** (los 3, en las 6) | Tilde `FaseAutoReporte` · CTA «Arrancar construcción» (solo si `stage === 'BRIEF'`) · `EscalamientoConstruccion` «Me trabé» (solo si `stage === 'CONSTRUCCION'`) | ídem | ídem | ídem | ídem | ídem |
| **Qué escribe, y dónde** | El tilde → `guardarProgreso(leadId, {completadas})` → `dossier.progresoJson.completadas` (array de `FaseId`) | ídem con `'personalizacion'` | ídem `'assets'` | ídem `'cta'` | ídem `'calidad'` | ídem `'mobile'` |
| **Qué la marca completada** | **El tilde del setter, nada más.** `completadasDe` marca la pantalla si su `FaseId` está en `progreso.completadas` | ídem | ídem | ídem | ídem | ídem |

**Evidencia:** títulos/bajadas/items → `flow-content.ts:50-111` vía `shellDe()` en `manual.ts:130-136` y el spread `...shellDe('estructura')` en `manual.ts:180-221`. Chips cortos → `manual.ts:185,192,199,206,213,220`. Indicador → `indicadorDeFase` (`manual.ts:308-317`) sobre `FASES_MANUAL.construccion.pantallas = PANTALLAS_CONSTRUCCION` (`manual.ts:297`). Contexto → `m-construccion.tsx:32-57` (`buildConstruccionBlock`, `copy-blocks.ts:175`). Munición → `m-construccion.tsx:61-101`. Prompts por fase → `prompts-disenio.ts:178-181` + `promptsParaFase` (`:190-196`). Badge → `badge-provisorio.tsx`. Link pendiente → `herramientas.ts:87` (`url: null // TODO: URL`) renderizado por `tool-guide.tsx:24-31`. Controles → `m-construccion.tsx:111-158`. Tilde → `fase-auto-reporte.tsx:62-76`. Marca de completada → `manual.ts:442-444`.

### Copy del tilde (el mismo texto en las seis)

**VISTO** (`fase-auto-reporte.tsx:116-121`):
- Sin marcar: **«Marcá esta fase cuando la termines»**
- Marcada: **«Fase marcada como hecha»**
- Bajada, cuando se puede guardar: **«Es auto-reporte: tildar no bloquea nada ni te hace avanzar — hacé las fases en el orden que te sirva. El único chequeo que gatea es el final.»**
- Bajada, cuando NO se puede (stage `BRIEF`): **«Primero arrancá la construcción — el botón está arriba.»** (`m-construccion.tsx:146`)

### Copy del CTA de arranque (las seis, solo en `BRIEF`)

**VISTO** (`m-construccion.tsx:132-135`): **«El brief está listo — arrancá la construcción para habilitar el registro del borrador. Tildar fases no la arranca sola.»**

### Copy de la nav de fases (las seis + `mr`)

**VISTO** (`manual-nav.tsx:216-222`): **«Construcción — navegación libre»** / **«Las seis fases son auto-reporte: entrá y salí en el orden que te sirva — ninguna bloquea a otra.»**

---

## B · Qué comparten y qué no

### Estructuralmente iguales, cambia sólo el texto

**VISTO — las seis. Sin excepción.** Ninguna tiene componente propio, formulario propio, campo propio ni estado propio. Comparten:

1. **El mismo contexto**, byte por byte: `ConstruccionContexto` no recibe `faseId`, sólo `lead/brief/ficha` (`m-construccion.tsx:32-40`). El bloque de Claude Design es **idéntico en las seis** — el propio comentario lo llama *«re-servido en CADA fase»* (`:30-31`).
2. **El mismo registro**: `ConstruccionRegistro` recibe `faseId` sólo para pasárselo al tilde (`m-construccion.tsx:140-147`). El CTA de arranque y el escalamiento no lo miran.
3. **El mismo camino de escritura**: una sola action, `guardarProgreso`, un solo blob, `progresoJson`.
4. **La misma nav**: `NavConstruccion` renderiza las seis en todas las seis (`pantalla-manual.tsx:166-168`).
5. **El mismo badge** «Guía preliminar — en validación» y el mismo `ToolGuide claudeDesign` en «Link pendiente».
6. **La misma marca de completada**: el tilde. No hay ninguna derivada de un dato del negocio.

**INFERIDO** — desde el punto de vista del código, hoy **ya hay una sola pantalla de Construcción**, instanciada seis veces con distinto texto. La explosión en seis es una decisión de **contenido y ruteo** (`PANTALLAS_CONSTRUCCION`), no de arquitectura de UI.

### Qué tiene algo propio que se perdería

Sólo dos cosas, y ninguna es un control:

| Qué | Dónde vive | ¿Se pierde al fundir? |
|---|---|---|
| **Los 18 items** (3 × 6) | `SHELL_CONSTRUCCION[].items` | No necesariamente — es un array de strings, se re-agrupa (ver §C). |
| **El mapeo prompt↔fase** | `FASE_PROMPTS = { calidad: ['estetica','motion'], mobile: ['mobile'] }` (`prompts-disenio.ts:178-181`) | **Sí, tal como está.** El mapeo es la razón de existir del sprint 5.3 (cerró el hallazgo A-10: *«el checklist y los prompts viven desconectados dentro del mismo paso»*, `:161-163`). Fundir las seis sin cuidado **reintroduce A-10**: los tres prompts vuelven a listarse juntos, desanclados de lo que resuelven. Ver §C. |

### La que no es realmente un paso de construcción

**VISTO — dos candidatas, con lecturas distintas:**

**1. `m9 · Assets reales` — es recolección, no construcción.** Su primer item es *«Bajá el logo y 3–5 fotos del Instagram o Google Maps del negocio»* (`flow-content.ts:76`): eso ocurre **antes** de abrir Claude Design, no durante. Y **P5-A ya lo movió**: la ficha ahora tiene `materiales.imagenesUrl` — *«de dónde bajar el logo y las fotos reales»* (`contracts.ts:77`) — y ese campo **ya entra al bloque de Claude Design en primer lugar** (`copy-blocks.ts:183-193`, comentario: *«La dirección de las imágenes va PRIMERA porque es la respuesta directa al título de la sección»*). El brief v3 confirma la dirección: la recolección de material es la **Etapa 2**, previa a construir (`BRIEF-VISION-FLUJO-SETTER-v3.md:52-62`). **m9 quedó a medio migrar por P5-A.**

**2. `m11 · Calidad` y `m12 · Mobile` — son refinamiento, no construcción.** Son las **únicas dos que tienen prompt**, y los tres prompts que tienen se auto-describen como refinamiento: *«Prompts ESTANDARIZADOS y LEAD-AGNÓSTICOS que el setter copia a Claude Design para REFINAR una demo ya construida»* (`prompts-disenio.ts:4-6`). El brief v3 las nombra como una capa aparte: *«Prompts prefijados de refinamiento, que son munición de la herramienta»* (`:66`). **INFERIDO:** esto no es inercia — es la línea de corte natural, y cae exactamente donde está el mapeo `FASE_PROMPTS`.

**3. Inercia pura:** el badge «Guía preliminar — en validación» aparece **seis veces en el mismo recorrido**. El comentario que lo justifica dice *«PROVISORIO: refinar tras el test de Claude Design (registro v0.4)»* (`flow-content.ts:42`). **INFERIDO:** repetir la misma advertencia seis veces la vuelve invisible.

### Contenido muerto que nadie mira

**VISTO** — `GUIA_CONSTRUCCION` (`guidance-content.ts:525-563`, 39 líneas: título, intro, dos bloques «por qué», dos ejemplos «así sí / así no») está registrada en `GUIA_PASOS.construccion` (`:993`) pero **ninguna de las seis pantallas la renderiza**. El único consumidor es `TeachPanel` (`teach-panel.tsx:91`), y sus tres call-sites son `m14-chequeo.tsx:76` (`id="selfCheck"`), `m5-seguimiento.tsx:183` (`id="objeciones"`) — **ninguno pide `"construccion"`**. Contenido escrito, mantenido, y nunca visto por un setter.

---

## C · La propuesta de agrupación — **el producto del probe**

### La respuesta corta

**Dos es el número correcto, pero el corte no cae 4+2 como el orden de las fases sugiere. Cae 3+3, y hay que mover un item.**

### El criterio, y por qué éste y no otro

El criterio **no** es «las cuatro primeras vs las dos últimas» (que sería el corte perezoso, por orden del array). El criterio es: **¿esto se hace mirando el brief, o mirando la demo ya construida?**

Ese criterio no lo estoy inventando: **ya está codificado en el repo**, en dos lugares independientes que coinciden:

- `FASE_PROMPTS` (`prompts-disenio.ts:178-181`) reparte prompts sólo a `calidad` y `mobile`. Y el comentario de al lado explica exactamente por qué las otras cuatro no tienen: *«o son estructurales, o necesitan datos del negocio (no lead-agnósticas)»* (`:167-169`).
- `PROMPTS_DISENIO` se define como la capa que actúa *«sobre una demo ya construida»* (`:4-6`), en oposición explícita a `copy-blocks.ts`, que es *«la capa de datos»* que lleva el negocio (`:15-18`).

Es decir: **el repo ya tiene la frontera construcción/refinamiento dibujada.** La propuesta no traza una línea nueva, **hace visible la que ya existe**.

### La agrupación

#### **Pantalla 1 — Construir** (absorbe m7, m8, m9)

> Título propuesto: **«Construí la demo en Claude Design»**

**Por qué estas tres:** las tres se hacen con el brief y los materiales del negocio a la vista, contra una demo que todavía no existe o recién nace. Las tres son **lead-específicas** — su contenido depende de *este* negocio. Ninguna tiene prompt lead-agnóstico, y la razón es la misma para las tres (`prompts-disenio.ts:167-169`).

**Por qué m9 va acá y no en refinamiento** aunque su primer item sea recolección: porque los otros dos items (*«Insertalas donde Claude Design puso imágenes genéricas»*, *«Si el negocio no tiene logo, usá el nombre tipografiado»*) **sí son construcción**, y la instrucción de bajar el material ya está cubierta por la ficha desde P5-A. Ver «qué se mueve» abajo.

#### **Pantalla 2 — Refinar** (absorbe m10, m11, m12)

> Título propuesto: **«Refiná la demo antes de publicarla»**

**Por qué estas tres:** las tres se hacen **con la demo ya en pantalla**, verificando y puliendo. `m11` y `m12` es evidente (son las dueñas de los tres prompts de refinamiento). **`m10 · CTA` es el caso que hay que justificar**, y se justifica solo: sus tres items son **verificación de algo ya construido**, no construcción — *«Probá el link: tiene que abrir el chat correcto»* (`flow-content.ts:88`) sólo tiene sentido con un botón que ya existe. Y el chequeo final ya trata al CTA como algo a **verificar**, no a construir: el hard-check `linksWhatsapp` dice *«Tocá cada link y el botón de WhatsApp: tiene que abrir el chat correcto»* (`flow-content.ts:152`) — **el mismo texto**. `m10` es un pre-chequeo disfrazado de fase de construcción.

**El corte 4+2 sería el error.** Poner `cta` en construcción por su posición en el array (índice 3 de 6) agrupa una verificación con dos generaciones, y deja «refinamiento» con sólo dos fases — que es justo el par que ya está codificado como refinamiento en `FASE_PROMPTS`, o sea: no aportaría nada nuevo, sólo renombraría lo que ya está.

### Qué pasa con la munición de cada una

**No se concatena, se re-agrupa con subtítulos.** El volumen no es el problema (9 items por pantalla, no 18); la pérdida de anclaje sí lo sería.

| Munición | Qué le pasa | Por qué |
|---|---|---|
| **Contexto (bloque de Claude Design)** | **Se sirve una vez por pantalla**, no seis. | Hoy es idéntico en las seis (`m-construccion.tsx:30-31`) — es literalmente la misma llamada a `buildConstruccionBlock`. De seis renders a dos: **cero pérdida, cuatro repeticiones menos**. |
| **Los 18 items** | Se agrupan **9+9, conservando el subtítulo de la fase de origen** (Estructura / Personalización / Assets · CTA / Calidad / Mobile). | Sin subtítulo, nueve bullets sueltos son una lista sin jerarquía — y el brief v3 exige lo contrario: *«Que entienda qué está haciendo. Cada prompt y cada paso dicen para qué sirven»* (`:151`). Los subtítulos ya existen como dato (`ShellFase.titulo`): no hay copy nuevo que escribir. |
| **Los 3 prompts** | **Van los tres a «Refinar»**, cada uno **debajo de su subtítulo** (estética+motion bajo «Calidad», mobile bajo «Mobile»). | Esto es lo que **preserva A-10**. Listarlos juntos al pie de la pantalla es exactamente lo que 5.3 vino a arreglar (`prompts-disenio.ts:161-163`). El subtítulo es el ancla que reemplaza a la pantalla. |
| **`ToolGuide claudeDesign`** | **Una vez por pantalla** (o una sola vez, en «Construir»). | Hoy se repite seis veces y las seis muestran **«Link pendiente»** (`herramientas.ts:87`, `url: null`). Seis avisos idénticos de un link que no existe. |
| **Badge «Guía preliminar»** | **Una por pantalla, o ninguna.** | De 6 a 2 (o a 0). Es una advertencia sobre el shell, no sobre la fase. |
| **`GUIA_CONSTRUCCION`** | **Decisión pendiente de Franco: renderizarla o borrarla.** | Hoy es contenido muerto (§B). P6 es el momento de resolverlo — no es scope creep, es la pantalla que la tendría que haber mostrado. |

### Qué se mueve, y adónde

**Un item, uno solo:** el primero de `assets` — *«Bajá el logo y 3–5 fotos del Instagram o Google Maps del negocio»* (`flow-content.ts:76`).

**INFERIDO:** P5-A lo dejó duplicado. El campo `materiales.imagenesUrl` de la ficha es *«de dónde bajar el logo y las fotos reales»* (`contracts.ts:77`) y ya viaja primero en el bloque de Claude Design (`copy-blocks.ts:186`). Pedirle al setter que baje las fotos **en la pantalla de construcción**, cuando la ficha ya guardó dónde están, es pedirle dos veces lo mismo en dos momentos distintos — exactamente lo que P5-A se propuso evitar (`contracts.ts:65-68`: *«el material que la construcción necesita tener junto antes de arrancar… no puede estar repartido en dos momentos del flujo»*).

**No es requisito de P6.** Si se deja, la fusión funciona igual. Queda anotado.

### Cómo se marca el avance dentro de la pantalla nueva

Acá hay una decisión real, con tres opciones y una recomendación.

**El problema:** hoy hay 6 tildes, uno por pantalla, y cada uno escribe un `FaseId` en `progresoJson.completadas`. Con 2 pantallas, ¿cuántos tildes hay?

| Opción | Qué implica | Veredicto |
|---|---|---|
| **(a) 2 tildes** — uno por pantalla, cada uno marca 3 `FaseId` de una | El blob sigue guardando 6 ids, pero pasan a moverse de a tres. Se pierde la granularidad del dato. | **Descartada.** Rompe el reversible: destildar «Construir» borraría tres fases de un saque, y el usuario no ve qué borró. |
| **(b) 6 tildes** — los seis, agrupados 3+3 dentro de cada pantalla | Cada tilde sigue siendo 1↔1 con su `FaseId`. `progresoJson` no cambia de forma ni de semántica. Un `<ul>` de tres tildes por pantalla. | **Recomendada.** Es la opción que **no toca nada de lo persistido**: la escritura, el schema, el invariante y el spec durable siguen válidos sin ajustar una línea. |
| **(c) 0 tildes** — se elimina el auto-reporte | Es lo que el brief v3 pide a futuro: *«El tilde de auto-reporte por fase — sin fases, no hay qué tildar»* (`:143`). | **Correcta como destino, prematura como P6.** Sacar el tilde implica sacar `progresoJson` del recorrido, y con eso se cae la derivación de `actual` (§F) y el invariante de aislamiento. Es otro bloque. |

**Recomendación: (b).** Y no es una elección estética — es la única que hace que la respuesta a §D sea limpia. Con (b), `progresoJson` no se entera de que las pantallas se fusionaron.

**Detalle de presentación con (b):** el indicador «Construcción — paso N de M» pasa de **«paso 3 de 6»** a **«paso 1 de 2»**, automáticamente (`indicadorDeFase` cuenta `FASES_MANUAL.construccion.pantallas`, `manual.ts:308-317`). No hay nada que ajustar ahí.

### Qué se pierde en la fusión

Honestamente, cuatro cosas — y una es real:

1. **El foco de una tarea por pantalla.** Hoy un setter abre m9 y ve **una** cosa que hacer. Con la fusión ve tres. **Es la pérdida real**, y no la disimulo. Contrapeso: el brief v3 pone la fluidez por encima de todo — *«Hacer clickear de más es el peor pecado posible… Cada clic que no aporta información es un clic que sobra»* (`:147`). Cuatro navegaciones menos por demo, contra tres bullets más por pantalla.
2. **El anclaje prompt↔fase**, *si* la fusión se hace concatenando. **Es evitable** con los subtítulos (arriba). Si se pierde, se reintroduce A-10 — un hallazgo que ya costó un sprint arreglar.
3. **Los deep-links `m7…m12`.** Un bookmark viejo, un link en una novedad, una fila de la galería. **VISTO:** el mecanismo de rescate ya existe y está probado — `esPantallaId(paso)` devuelve `false` para un id retirado y la página redirige a la actual (`[paso]/page.tsx:58`), y `manual.ts:38-41` documenta ese caso exacto usando el `m3` de P4 como precedente. **Se pierde el destino, no el usuario.**
4. **Seis estados de la galería.** Ver §H. Es documentación, se re-fotografía.

**Lo que NO se pierde:** el checklist persistido, el escalamiento, el CTA de arranque, el bloque de contexto, los tres prompts, la navegación libre entre fases (§6-3), el gate del chequeo final. Ninguno de esos vive en la pantalla.

### ¿Dos es el número correcto?

**Sí, con una salvedad y una advertencia.**

**La salvedad:** dos es correcto *si el corte es 3+3*. Si se hace 4+2 por orden del array, el resultado es una pantalla de «refinamiento» que es exactamente `FASE_PROMPTS` con otro nombre, y una de «construcción» que mezcla generar con verificar. En ese caso serían dos pantallas nominales, no dos pantallas conceptuales.

**La advertencia — y esta importa más:** el brief v3 no dice «dos pantallas». Dice que las seis fases **desaparecen como pantallas** y que su contenido *«pasa a ser el checklist de verificación (§5) y los prompts prefijados de refinamiento»* (`:142`). Es decir: el destino declarado es **cero pantallas de fase**, con el contenido reabsorbido por el chequeo final y por la librería de prompts.

**INFERIDO:** «dos» es un **paso intermedio hacia cero**, no el destino. Eso está bien —es la forma barata y reversible de llegar—, pero conviene nombrarlo así, porque cambia dos decisiones de P6:

- No invertir en copy nuevo para las dos pantallas si va a vivir seis semanas.
- Elegir la opción **(b)** de tildes, que es la que deja `progresoJson` intacto y por lo tanto la que **no encarece el paso siguiente** (cero → hay que retirar el blob).

---

## D · La lista de fases — la restricción dura

### ¿La relación pantalla↔fase es uno a uno? ¿Dónde vive?

**VISTO — sí, 1:1, y vive en 19 líneas de `manual.ts`:**

```ts
// manual.ts:105-112
export const PANTALLAS_CONSTRUCCION = ['m7','m8','m9','m10','m11','m12']
  as const satisfies readonly PantallaId[]

// manual.ts:115-117
export function pantallaDeFaseConstruccion(fase: FaseId): PantallaId {
  return PANTALLAS_CONSTRUCCION[FASE_IDS.indexOf(fase)]
}

// manual.ts:120-123
export function faseDePantallaConstruccion(id: PantallaId): FaseId | null {
  const index = (PANTALLAS_CONSTRUCCION as readonly PantallaId[]).indexOf(id)
  return index === -1 ? null : FASE_IDS[index]
}
```

El acoplamiento es **posicional**: el contrato *«en el MISMO orden que `FASE_IDS`»* (`manual.ts:104`) es un comentario, no un tipo. Nada lo verifica.

**VISTO** — `FASE_IDS` vive en `contracts.ts:142-149` y es la llave de `progresoJson` (`ProgresoSchema`, `:161-165`), persistido en `prisma/schema.prisma:1001`.

### Si las pantallas colapsan, ¿qué pasa con esa correspondencia?

Pasa a ser **N:1** (tres fases por pantalla). Las dos funciones dejan de poder ser índice-paralelas:

- `faseDePantallaConstruccion` (pantalla→fase) **deja de tener sentido como función**: una pantalla nueva contiene tres fases, no una. Su único call-site (`[paso]/page.tsx:67`) la usa para saber *qué `faseId` pasarle a los slots* — con la fusión, los slots necesitan un **array** de fases.
- `pantallaDeFaseConstruccion` (fase→pantalla) **sigue teniendo sentido**, pero deja de ser un índice: pasa a ser un mapa explícito `{estructura→'mA', personalizacion→'mA', assets→'mA', cta→'mB', calidad→'mB', mobile→'mB'}`.

### ¿Se puede colapsar las pantallas dejando la lista de fases intacta?

# **SÍ.**

**Evidencia — cuatro hechos VISTOS:**

1. **`FASE_IDS` no depende de `PANTALLAS_CONSTRUCCION`.** La dependencia va en un solo sentido: `manual.ts` importa `FASE_IDS` de `contracts.ts` (`manual.ts:23`); `contracts.ts` **no importa nada de `manual.ts`**. La lista de fases no sabe que existen pantallas.

2. **Lo persistido es `FaseId`, nunca `PantallaId`.** `progresoJson` guarda `completadas: z.array(z.enum(FASE_IDS))` (`contracts.ts:162`); la escritura es `saveOwnedProgreso`, y su payload es literalmente `{ progresoJson }` (`dossier.ts:397`). **Cero `PantallaId` en `prisma/`** — verificado por grep; el único campo de posición del schema, `faseActual` (`contracts.ts:163`), **no lo escribe nadie** (grep: sólo aparece en el schema y en el invariante).

3. **La posición de pantalla se deriva, no se guarda.** `manual.ts:7-10` lo promete y el código lo cumple: `derivarPantalla` recalcula todo desde stage + blobs + checklist en cada request. El único `PantallaId` que cruza una frontera es el `[paso]` de la URL, y hay guardia para ids desconocidos (`[paso]/page.tsx:58`).

4. **El precedente ya corrió.** P4 retiró `m3` del registro sin migrar un solo lead (`bitacora-beta-3.md:2145-2154`) y sin tocar `FASE_IDS`.

### ⚠️ Pero el sí tiene una condición, y el compilador NO la va a señalar

**Este es el hallazgo más importante del probe.**

El encargo anticipaba que colapsar las pantallas rompería el build y que eso «sería bueno» porque el compilador señalaría qué tocar. **No va a pasar.** Verificado:

**VISTO** — `pantallaDeFaseConstruccion` indexa una tupla con un `number`:

```ts
return PANTALLAS_CONSTRUCCION[FASE_IDS.indexOf(fase)]   // manual.ts:116
```

`FASE_IDS.indexOf(fase)` devuelve `number`. Indexar una tupla readonly con `number` da **la unión de los tipos de sus elementos**, que siempre es asignable a `PantallaId`. **VISTO** — `tsconfig.json` **no tiene `noUncheckedIndexedAccess`** (`strict: true` no lo incluye). Por lo tanto:

> Si `PANTALLAS_CONSTRUCCION` pasa de 6 a 2 entradas y `FASE_IDS` queda en 6, **`tsc` compila en verde** y `pantallaDeFaseConstruccion('assets')` devuelve **`undefined`** en runtime, tipado como `PantallaId`.

**INFERIDO — la cadena de consecuencias, trazada línea por línea:**

1. `completadasDe` hace `done.add(pantallaDeFaseConstruccion(fase))` (`manual.ts:443`) → mete `undefined` en el `Set`. Se filtra solo (`ORDEN_MANUAL.filter`, `:456`), así que las fases 3-6 **dejan de marcarse como completadas en silencio**.
2. `posicionDe` hace `actual = pantallaDeFaseConstruccion(primeraFase)` (`manual.ts:538-539`) → **`actual = undefined`**.
3. `derivarPantalla` chequea `habilitadas.includes(actual)` → false; lo empuja a `habilitadas` (`:611`).
4. La página redirige a `rutaManual(leadId, undefined)` = `/setter/leads/{id}/manual/undefined` (`[paso]/page.tsx:57-58`).
5. `esPantallaId('undefined')` → false → **redirige al mismo destino** → **loop de redirects**.

Un lead con la fase 3, 4, 5 o 6 sin tildar quedaría inaccesible con `ERR_TOO_MANY_REDIRECTS`, sin un solo error de tipos.

**Esto tiene precedente exacto en este mismo repo.** El PROBE de terreno registró el mismo patrón: *«FASE_IDS se vacía en silencio todo-o-nada»*. Y P4 lo nombró como la condición que habría frenado el sprint: *«De haber estado guardado, era el mismo patrón que vacía progreso en silencio y el sprint se frenaba»* (`bitacora-beta-3.md:2154`).

**Traducción operativa para P6:**

- La respuesta a D es **SÍ** — pero el sí **no** significa «cambiá el array y el compilador te guía».
- Significa: **`pantallaDeFaseConstruccion` y `faseDePantallaConstruccion` hay que reescribirlas a mano, como mapa explícito, en el mismo commit que achica `PANTALLAS_CONSTRUCCION`.** Son 19 líneas en un solo archivo (`manual.ts:105-123`) y sus call-sites están todos localizados (grep completo: 6 sitios, 5 en `manual.ts` + 1 en `[paso]/page.tsx:67` + `PANTALLAS_CONSTRUCCION` en `manual-nav.tsx:224`).
- **Recomendación barata que sí daría red:** en el mismo commit, tipar el mapa como `Record<FaseId, PantallaId>`. Ahí sí, agregar o quitar un `FaseId` **rompe el build**, que es la garantía que hoy no existe — ni antes ni después de P6.

### Lo que sí verifica hoy la relación (y lo que no)

**VISTO** — `progreso-isolation.invariant.ts:122-138` verifica que los ids de `SHELL_CONSTRUCCION` sean **exactamente `FASE_IDS`** (mismo tamaño, únicos, mismo set). Eso protege `contracts.ts ↔ flow-content.ts`.

**VISTO** — **ningún invariante verifica `PANTALLAS_CONSTRUCCION` contra `FASE_IDS`.** El eslabón pantalla↔fase, que es el que P6 va a mover, es el único de la cadena sin red. Confirmado por lectura de los 16 invariantes registrados en `package.json:19`; P4 ya lo había buscado y llegado a lo mismo: *«No existe ningún invariante que assertee la cantidad de pantallas del registro — se buscó explícitamente y no está»* (`bitacora-beta-3.md:2178-2180`).

---

## E · La reentrada

### ¿Cómo funciona hoy? ¿A dónde lo manda?

**VISTO** — la pantalla es `mr`, tipo `'reentrada'`, fase `'construccion'` (`manual.ts:254-261`):

- Título: **«Aplicá las correcciones de Franco»**
- Bajada: **«La nota del rechazo al frente — checklist y borrador quedan como estaban; el chequeo final se resetea.»**
- Chip corto: «Correcciones»

**Derivación** (`manual.ts:547-551`):

```ts
case 'RECHAZADA':
  return { actual: 'mr', habilitadas: ['mr', ...PANTALLAS_CONSTRUCCION] }
```

**A dónde lo manda:** a `mr` como aterrizaje, y desde ahí **a las seis fases**, todas habilitadas de una. El acceso es por el rail `NavConstruccion`, que se renderiza en `mr` porque su `fase === 'construccion'` (`pantalla-manual.tsx:71,166`).

**Sus slots** (`[paso]/page.tsx:237-262`) son **dos, no tres**:
- `contexto`: el **mismo** `ConstruccionContexto` de las seis (el bloque de Claude Design re-servido);
- `captura`: el botón **«Reabrir construcción»** (`ReabrirConstruccion`, action `reabrirConstruccion`, `construccion-ctas.tsx:39-54`) más el texto *«Reabrí la construcción para rehacer lo que Franco marcó (lo tenés arriba). Después volvés a publicar el borrador y a pasar el chequeo final antes de reenviar — el historial de rechazos se conserva.»*
- `municion`: **vacío** — `Zona` no renderiza nada sin hijos (`pantalla-manual.tsx:21`).

Y como `encabezado`, la nota de Franco vía `GuiaRetrabajo`, antes de la instrucción (`[paso]/page.tsx:121-130`).

### ¿Qué le pasa cuando las seis sean dos?

**INFERIDO — casi nada, y es la parte más barata del bloque.** `mr` toca las seis por **una sola línea**: el spread `...PANTALLAS_CONSTRUCCION` en `manual.ts:551`. Si el array pasa a dos, ese spread devuelve dos, y `NavConstruccion` (`manual-nav.tsx:224`) renderiza dos chips en vez de seis. **Cero cambios en `mr` misma.**

Con una excepción de copy: el subtítulo de la nav dice **«Las seis fases son auto-reporte»** (`manual-nav.tsx:220-222`), literal. Ese texto miente el día que sean dos pantallas — y es el tipo de cosa que P1 y P3.1 ya vinieron a corregir.

**Lo que sí hay que decidir:** `mr` tiene su `municion` vacía y comparte contexto con las fases. Con dos pantallas de construcción, la pregunta razonable es si `mr` sigue justificando ser pantalla propia o se vuelve el `encabezado` de la pantalla «Refinar». **No lo resuelvo acá** — está fuera del mapeo pedido, y `mr` tiene algo que las fases no tienen: la nota de Franco al frente y la transición `RECHAZADA→CONSTRUCCION`, sin la cual *«el chequeo final queda futuro para siempre»* (`construccion-ctas.tsx:17-18`). Queda anotado.

### ¿Conserva el progreso o lo reinicia?

**VISTO — lo conserva, y está probado con invariante ejecutable.**

`reloop-selfcheck-reset.invariant.ts:67-77` fija que `RELOOP_RESET` toca **exclusivamente** `selfCheckJson` (→ `Prisma.DbNull`) y **no menciona** `progresoJson`, `draftUrl` ni `stage`. La ausencia de la clave es la garantía: lo que no se menciona, `updateMany` no lo toca.

Confirmado end-to-end en `tests/leados/progreso-construccion.spec.ts:30` (*«sobrevive el re-loop RECHAZADA→CONSTRUCCION»*) y anunciado al setter en la propia pantalla: *«Checklist y borrador quedaron como estaban»* (`[paso]/page.tsx:126-128`).

**Lo único que se resetea es el chequeo final** (self-check), a propósito: *«un setter reenviaría con los 6 hard-checks en verde de la vuelta anterior, sin corregir nada»* (`reloop-selfcheck-reset.invariant.ts:10-11`). Y `manual.ts:406-411` deja `RECHAZADA` fuera de `STAGES_POST_CHEQUEO` para que `m14` vuelva a ser futuro.

**INFERIDO — consecuencia para P6:** como el progreso preservado son `FaseId` y no `PantallaId`, **la fusión no afecta la preservación en absoluto**. Un lead rechazado con `['estructura','personalizacion']` tildadas sigue teniendo esas dos fases tildadas, ahora agrupadas bajo la pantalla «Construir». Con la opción **(b)** de §C, el setter ve exactamente los mismos dos tildes en verde.

---

## F · La derivación de posición

### ¿Qué funciones calculan qué pantallas están completadas y cuál es la actual?

**VISTO — dos funciones puras, ambas en `manual.ts`, más el orquestador:**

| Función | Línea | Qué calcula | Qué toca de Construcción |
|---|---|---|---|
| `completadasDe(input)` | `manual.ts:418-457` | El set de pantallas hechas | **`:442-444`** — `for (const fase of input.progreso.completadas) done.add(pantallaDeFaseConstruccion(fase))` |
| `posicionDe(input)` | `manual.ts:474-595` | `{actual, habilitadas}` por stage | **`:525-546`** (`BRIEF`/`CONSTRUCCION`) y **`:547-551`** (`RECHAZADA`) |
| `derivarPantalla(input)` | `manual.ts:602-613` | Compone las dos + la invariante de accesibilidad | — |

El cuerpo de la rama `BRIEF`/`CONSTRUCCION` (`manual.ts:531-545`):

```ts
const enConstruccion = stage === 'CONSTRUCCION'
const habilitadas: PantallaId[] = [...PANTALLAS_CONSTRUCCION]
if (enConstruccion && !input.draftUrl) habilitadas.push('m13')
if (enConstruccion && input.draftUrl) habilitadas.push('m14')
const primeraFase = FASE_IDS.find((fase) => !input.progreso.completadas.includes(fase))
const actual: PantallaId = primeraFase
  ? pantallaDeFaseConstruccion(primeraFase)
  : enConstruccion ? (input.draftUrl ? 'm14' : 'm13') : PANTALLAS_CONSTRUCCION[0]
```

**Los tres puntos que P6 toca son exactamente:** `:443`, `:539` y `:544`. Los tres pasan por `pantallaDeFaseConstruccion` o por `PANTALLAS_CONSTRUCCION[0]`.

### ¿Son exhaustivas con guarda de nunca?

**VISTO — sí, pero la guarda NO cubre lo que P6 va a mover.** Hay que ser preciso acá, porque la diferencia decide si P6 tiene red o no.

`posicionDe` cierra con (`manual.ts:589-593`):

```ts
default: {
  const _exhaustivo: never = stage
  throw new Error(`derivarPantalla: stage no contemplado: ${String(_exhaustivo)}`)
}
```

**Qué protege:** el `switch` es sobre **`DossierStage`**. Un stage nuevo en el enum de Prisma no compila hasta contemplarse. Documentado en `manual.ts:471-472`: *«Exhaustivo por stage: un stage nuevo rompe el build hasta contemplarse acá»*.

**Qué NO protege:** el `never`-guard **no sabe nada de `FaseId` ni de `PantallaId`**. No hay ningún `switch` exhaustivo sobre las fases ni sobre las pantallas de construcción.

> **La respuesta honesta al «si lo son, el compilador va a señalar todo lo que hay que cambiar — eso es bueno»: el compilador NO va a señalar nada.** La guarda de nunca es sobre stages, y P6 no toca ningún stage. Ver §D para la cadena de fallo silencioso completa.

**Lo que sí queda protegido sin esfuerzo:** `PANTALLAS`, `FASES_MANUAL` y `PANTALLA_IDS` sí están tipados como `Record<PantallaId, …>` / union derivado del array (`manual.ts:65,138,288`). Retirar `'m8'` de `PANTALLA_IDS` **sí rompe el build** en `PANTALLAS` (falta/sobra la clave) y en cualquier literal `'m8'` del código. **VISTO** — sólo hay dos fuera de `manual.ts`, ambos en tests: `tests/galeria/captura.spec.ts:79-85` y `tests/setter/11-fase-disabled.spec.ts:51,69`.

**INFERIDO — el reparto de riesgo, que es lo que importa para planificar P6:**

| Qué se cambia | ¿Rompe el build? | Riesgo |
|---|---|---|
| Retirar ids de `PANTALLA_IDS` / `PANTALLAS` | **Sí** | Bajo — el compilador guía |
| Achicar `PANTALLAS_CONSTRUCCION` | **No** | **Alto** — falla en runtime, en silencio |
| Cambiar el `switch` por stage | **Sí** | Bajo — never-guard |

### ¿Hay algún lugar donde el id de pantalla de construcción quede guardado en la base?

**VISTO — no. Verificado por tres vías independientes:**

1. **Grep sobre `prisma/`**: cero apariciones de `PantallaId`, `PANTALLA`, `m7`…`m12` como valor.
2. **El campo de posición del schema no lo escribe nadie**: `ProgresoSchema.faseActual` (`contracts.ts:163`) existe, pero grep de `faseActual` sobre `src/`, `tests/`, `scripts/`, `prisma/` devuelve **sólo** su declaración y tres usos en `progreso-isolation.invariant.ts` (fixtures). **Ningún writer.** El escritor real, `saveOwnedProgreso`, guarda lo que le pasa `FaseAutoReporte`, y ese payload es `{ completadas: siguiente }` — sin `faseActual` (`fase-auto-reporte.tsx:69`).
3. **El único blob con ids es `progresoJson`, y guarda `FaseId`**, validado contra `FASE_IDS` por zod (`contracts.ts:162`) y por invariante (`progreso-isolation.invariant.ts:85-88`: *«una fase inventada NO parsea»*).

**Y los consumidores de ese blob son todos del manual** (grep de `progresoJson|parseProgreso|\.completadas`): `_data.ts:159` (lectura), `[paso]/page.tsx:230` (prop), `fase-auto-reporte.tsx:65` (escritura), `manual.ts:442,536` (derivación), `manual-nav.tsx` + `pantalla-manual.tsx` (presentación). **El admin no lee el checklist de construcción.** Fundir las pantallas no tiene superficie fuera del recorrido del setter.

> **Confirmado para este tramo en particular:** la posición se deriva y no se guarda. Lo persistido es el **checklist de fases**, no la pantalla.

---

## G · El árbol de condicionales

### ¿Cuántas ramas son de las seis de construcción?

**VISTO — una. Una sola.**

El árbol vive en `[paso]/page.tsx:143-355` y tiene **11 ramas + un `{}` final**:

| # | Rama | Línea | Cubre |
|---|---|---|---|
| 1 | `pantalla.id === 'm1'` | `:144` | 1 pantalla |
| 2 | `pantalla.id === 'm2'` | `:157` | 1 |
| 3 | `pantalla.id === 'm4'` | `:175` | 1 |
| 4 | `pantalla.id === 'm6'` | `:195` | 1 |
| **5** | **`faseConstruccion`** | **`:215`** | **6 pantallas (m7–m12)** |
| 6 | `pantalla.id === 'mr'` | `:237` | 1 |
| 7 | `pantalla.id === 'm13'` | `:263` | 1 |
| 8 | `pantalla.id === 'm14'` | `:275` | 1 |
| 9 | `pantalla.id === 'm15'` | `:291` | 1 |
| 10 | `pantalla.id === 'm5'` | `:307` | 1 |
| 11 | `pantalla.id === 'm16'` | `:334` | 1 |
| — | `: {}` | `:355` | fallback |

Las seis pantallas de construcción **ya están colapsadas en el árbol**. La rama 5 no pregunta por `m7`…`m12`: pregunta si `faseDePantallaConstruccion(pantalla.id)` devolvió una fase, y pasa esa fase a los tres slots (`:224,229`).

### ¿Colapsarlas simplifica el archivo o sólo lo acorta?

**Ninguna de las dos: no lo toca.**

**INFERIDO** — el árbol pasa de **11 ramas a 11 ramas**. La rama 5 sigue existiendo, sólo cambia qué hay detrás de `faseConstruccion` (una fase → un array de fases). Si acaso, la propuesta de §C podría **agregar** una rama si «Construir» y «Refinar» necesitan slots distintos — o mantener 11 si se parametrizan igual, que es lo que recomiendo.

**Comparación con el precedente:** P4 sí sacó una rama (de 12 a 11) porque `m3` tenía la suya. P6 **no repite ese beneficio**. La bitácora ya lo anticipó, aunque sin este número: *«el monolito de `manual/[paso]/page.tsx` (la cadena de condicionales sigue siendo una escalera de 12 ternarios anidados; este sprint le sacó uno)»* (`bitacora-beta-3.md:2182-2184`).

> **Corrección al encuadre del encargo:** «las veinte pantallas viven en un archivo con una escalera de condicionales» es cierto, pero **las seis de construcción no contribuyen seis peldaños: contribuyen uno**. Desarmar la escalera y fundir las seis son **dos problemas independientes**. Meterlos en el mismo sprint mezcla una poda de producto con un refactor de infraestructura.

### ¿Cuánto cuesta desarmar esa escalera? — medido

**Medición VISTA:**

| Métrica | Valor | Cómo se midió |
|---|---|---|
| Líneas del archivo | **370** | `wc -l` |
| Líneas de la escalera | **213** (`:143-355`) | rango leído |
| Ramas | **11** + fallback | conteo directo, tabla arriba |
| Niveles de anidación | **11** | cada rama anida en el `:` de la anterior |
| Sangría máxima | **34 espacios** (línea 338) | `awk` sobre el rango |
| Módulos de slots importados | **11** (`m1`…`m16` + `m-construccion`) | `:19-28` |

**El costo, con fundamento:**

La escalera es **puramente mecánica**: 11 ramas × exactamente 3 slots, cada slot un componente ya extraído en su propio archivo. No hay lógica compartida entre ramas, no hay side effects, no hay orden significativo — es un **despacho por clave** escrito como ternarios anidados.

La reescritura natural es un mapa `PantallaId → (manual) => Slots`:

```ts
const SLOTS: Partial<Record<PantallaId, (m: ManualData, leadId: string) => Slots>> = { … }
const slots = SLOTS[pantalla.id]?.(manual, leadId) ?? {}
```

**Estimación: un sprint atómico chico — ~213 líneas reescritas en 1 archivo, 0 archivos nuevos, 0 componentes tocados.** El diff se ve grande y es casi todo re-indentación (11 niveles → 1), igual que el diff de P4 en este mismo archivo, que la bitácora ya tuvo que explicar: *«el árbol entero desanida un nivel — de ahí el tamaño del diff en ese archivo: es re-indentación, no lógica nueva»* (`bitacora-beta-3.md:2159-2161`).

**Tres cosas que hay que resolver, y son las que consumen el tiempo (no las 213 líneas):**

1. La rama `faseConstruccion` (`:215`) no es por-id: necesita entrada especial en el mapa, o una capa de resolución antes.
2. Las ramas `estado` y `reentrada` (`:85-115`, `:121-139`) están **arriba** de la escalera y hacen `return` temprano. No entran al mapa.
3. Cada closure necesita el tipo de `manual` (el retorno de `cargarManualDelLead`, `_data.ts`, 265 líneas) — hoy es inferido y anónimo.

**Recomendación: NO hacerlo en P6.** Es independiente, no lo destraba, y P6 le sacaría cero ramas. Como sprint propio, es barato y de bajo riesgo.

---

## H · Tests y galería

### Specs que ejercitan las seis

**VISTO — dos archivos, cuatro tests, y sólo uno de ellos las nombra:**

| Spec | Qué hace con las seis | Impacto de la fusión |
|---|---|---|
| `tests/setter/11-fase-disabled.spec.ts` | **Dos tests**, ambos con `goto(.../manual/m7)` + `expect(page).toHaveURL(/\/manual\/m7$/)` (`:51-52`, `:69-70`). Verifican B-07 (tilde `disabled` en `BRIEF`, con el motivo) y C-08 (tilde funciona en `CONSTRUCCION`). | **Rompe.** Cuatro líneas: dos `goto` + dos asserts de URL. El resto (`button[aria-pressed]`, los dos textos del tilde) sobrevive intacto si se elige la opción **(b)** de §C. Precedente idéntico: P4 ajustó *«los dos `goto` de `01-flow.spec.ts` y sus dos asserts de URL»*. |
| `tests/setter/01-flow.spec.ts` | **B5** (`:174-204`) entra por la **raíz** `/setter/leads/{id}` y busca «Arrancar construcción» + el escalamiento; **B6** (`:206+`) entra por `pantalla(leadId,'m13')`. | **No rompe.** B5 nunca nombra una pantalla de fase: entra por la raíz, que redirige a la actual (`page.tsx:23` → `manual/page.tsx:21`). Con la fusión aterriza en la pantalla «Construir» y el CTA sigue ahí. |
| `tests/leados/progreso-construccion.spec.ts` | Persistencia + re-loop + aislamiento del checklist. **Deriva sus fixtures de `FASE_IDS` en vivo** (`:36-38,66-68`) y llama la lib directa (`saveOwnedProgreso`), sin browser. | **No rompe** — no conoce `PantallaId`. Es la elección de diseño del spec la que lo salva: *«los fixtures se DERIVAN de `FASE_IDS` en vivo… NUNCA por las etiquetas internas de las fases»*. |

### ¿Algún invariante las toca?

**VISTO — de los 16 invariantes registrados (`package.json:19`), tres tocan Construcción y ninguno se rompe:**

| Invariante | Qué fija sobre las seis | Impacto |
|---|---|---|
| `progreso-isolation.invariant.ts` | Aislamiento de escritura; `stage` nunca muta; el parse rechaza shape inválido; checklist ≠ gate; y **`:122-138`: los ids de `SHELL_CONSTRUCCION` son exactamente `FASE_IDS`**. | **Ninguno** — todo es `FaseId`. Cero `PantallaId`. **Es también la restricción dura que P6 debe respetar: `SHELL_CONSTRUCCION` sigue teniendo que tener 6 entradas con esos 6 ids**, aunque se rendericen en 2 pantallas. |
| `reloop-selfcheck-reset.invariant.ts` | `RELOOP_RESET` toca sólo `selfCheckJson`; preserva `progresoJson` + `draftUrl`. | **Ninguno.** |
| `manual.invariant.ts` | Derivación por status/stage terminal (`archivo`, `m2`, `m16`, `m15`). Su línea `:72` itera `['FICHA','BRIEF','CONSTRUCCION','APROBADA',null]` pero **sólo assertea `actual === 'archivo'`** para `PERDIDO`. | **Ninguno** — la rama terminal corta antes de la derivación por stage (`manual.ts:485-487`). |

**Y el hueco, otra vez:** **ningún invariante verifica `PANTALLAS_CONSTRUCCION` contra `FASE_IDS`** ni cuenta pantallas del registro. Es el eslabón exacto que P6 mueve. Ver §D.

### ¿Cuántos estados de la galería corresponden a estas seis?

**VISTO — siete estados de 34 (~21% de la galería), más una fila mobile.**

De `tests/galeria/captura.spec.ts:79-85`:

| # | Estado | Paso | ¿Mobile? |
|---|---|---|---|
| 14 | `14-m7-tilde-deshabilitado` | m7 | |
| 15 | `15-m7-estructura` | m7 | **sí** |
| 16 | `16-m8-personalizacion` | m8 | |
| 17 | `17-m9-assets` | m9 | |
| 18 | `18-m10-cta` | m10 | |
| 19 | `19-m11-calidad` | m11 | |
| 20 | `20-m12-mobile-fases-hechas` | m12 | |

**Los siete quedan obsoletos**, y arrastran tres artefactos más:

1. **El sembrador** — `scripts/dev/m0-galeria-seed.ts:180-202`, siete llamadas a `sembrar()`, cinco con progreso incremental.
2. **El índice** — `docs/manual-usuario/galeria/INDICE.md:106-112`, siete filas con descripción propia, más la fila mobile `:162` (*«Una fase de construcción en el celular: la nav de fases cambia de forma»* — descripción que deja de aplicar cuando la nav tiene dos chips).
3. **Los PNG** — `docs/manual-usuario/galeria/png/`, siete + un mobile.

**INFERIDO — cuántos quedan después:** con la propuesta de §C, **cuatro** cubren el tramo (Construir · Refinar · el tilde deshabilitado en `BRIEF` · una mobile). Siete estados menos tres = **se retiran 4 filas netas**, y **la numeración de la galería se corre**: 21→17, 22→18, etc.

**Y hay un precedente que dice cómo NO resolverlo.** P4 dejó `03` y `04` fotografiando el **mismo estado** y conservó los nombres de archivo *«porque el índice los referencia»*, con la nota: *«colapsarlos y renumerar la galería es trabajo del bloque M0, no de P4»* (`captura.spec.ts:64-70`). **Si P6 hace lo mismo, quedan siete fotos apuntando a dos pantallas** — y la deuda de renumeración pasa de dos filas a nueve.

> **Recomendación:** o P6 renumera la galería, o la decisión de no renumerar se toma explícitamente **sabiendo que la deuda se cuadruplica**. Es exactamente el tipo de cosa que este probe existe para poner sobre la mesa antes, no después.

---

## Lo que encontré y nadie preguntó

**1. El microsprint de aislamiento de la suite no está commiteado.** Vive sólo en el working tree de este checkout (§Fase 0). Si P6 arranca en worktree dedicado, arranca sin `.next-setter/` y `test:setter` vuelve a pelear `.next/` con cualquier `next dev` vivo — el síntoma que ese microsprint documentó como *«vuelven los dos síntomas, y vuelven en silencio»* (`playwright.setter.config.ts`, comentario del diff).

**2. `GUIA_CONSTRUCCION` es contenido muerto.** 39 líneas de guía escritas, mantenidas y registradas en `GUIA_PASOS.construccion` (`guidance-content.ts:525-563,993`) que **ninguna pantalla renderiza**: los tres call-sites de `TeachPanel` piden `selfCheck` y `objeciones`, nunca `construccion`. Hay precedente exacto —P4 encontró que `GUIA_EVALUACION.intro` tampoco se renderiza (`bitacora-beta-3.md:2189-2190`)— así que **es un patrón, no un caso aislado**. Vale un barrido: ¿qué otras guías escritas no llegan a ninguna pantalla?

**3. El link de Claude Design es `null`, y se muestra seis veces.** `herramientas.ts:87` sigue con `url: null // TODO: URL — acceso a Claude Design que usa el equipo (pedir a Franco)`. La UI degrada bien (chip «Link pendiente», `tool-guide.tsx:24-31`), pero el setter ve **seis veces** el aviso de que falta el link de la herramienta central del tramo. La fusión lo baja a dos. **La deuda de fondo es de Franco, no de código** — y la memoria del proyecto ya la tiene registrada como CRÍTICA para el recorrido del novato.

**4. `faseActual` es un campo fantasma en el contrato persistido.** `ProgresoSchema.faseActual` (`contracts.ts:163`) está declarado, validado, y ejercitado por el invariante (`progreso-isolation.invariant.ts:69,94,104`) — pero **ningún código lo escribe jamás**. Es un campo de *posición* en un blob cuya doctrina explícita es que la posición no se persiste (`manual.ts:7-10`). Si P6 lo deja, seguirá pareciendo que existe una posición guardada que hay que migrar. **Candidato a retiro**, y P6 es el momento natural.

**5. El item de assets quedó duplicado por P5-A.** *«Bajá el logo y 3–5 fotos…»* (`flow-content.ts:76`) le pide al setter, durante la construcción, algo que la ficha ya capturó (`materiales.imagenesUrl`, `contracts.ts:77`) y que ya viaja **primero** en el bloque de Claude Design (`copy-blocks.ts:186`). P5-A movió el campo pero no retiró la instrucción vieja. Es exactamente lo que P5-A se propuso evitar: *«no puede estar repartido en dos momentos del flujo»* (`contracts.ts:65-68`).

**6. Existe una dependencia posicional sin verificación, y es la única de la cadena que no tiene red.** `progreso-isolation.invariant.ts` **sí** verifica `SHELL_CONSTRUCCION ↔ FASE_IDS` (`:122-138`). Nadie verifica `PANTALLAS_CONSTRUCCION ↔ FASE_IDS`. El contrato *«en el MISMO orden que `FASE_IDS`»* (`manual.ts:104`) es un comentario. Y sin `noUncheckedIndexedAccess`, romperlo no rompe el build — rompe el runtime, en silencio, con loop de redirects (§D). **Esto es cierto hoy, antes de P6**: cualquiera que reordene una de las dos listas produce el mismo fallo. P6 no lo introduce; P6 es la primera vez que alguien va a pisar ese cable a propósito.

**7. El indicador «paso N de M» se re-calibra solo, y eso es una buena noticia poco obvia.** `indicadorDeFase` cuenta `FASES_MANUAL[fase].pantallas.length` (`manual.ts:308-317`), y para construcción eso es `PANTALLAS_CONSTRUCCION` (`:297`). Achicar el array cambia «paso 3 de 6» → «paso 1 de 2» **sin tocar una línea de presentación**. Es una de las pocas piezas del tramo que la fusión no le cuesta nada.

**8. La nav de fases dice «las seis» en texto literal.** `manual-nav.tsx:220-222`: *«Las seis fases son auto-reporte»*. Miente el día 1 de P6. Es copy, es una línea, y es exactamente el tipo de cosa que P1 y P3.1 vinieron a corregir a mano — vale que P6 no genere el siguiente.

---

## Cierre

- **§D tiene respuesta explícita: SÍ**, con la condición de reescribir a mano las dos funciones de mapeo, porque el compilador no señala nada.
- **§C es la propuesta**, con el criterio justificado en dos capas del repo que ya lo codifican (`FASE_PROMPTS` y la ortogonalidad prompts↔copy-blocks), no declarado.
- **Ocho ítems, ocho secciones.** Las seis pantallas volcadas con su texto real citado.
- **Nada modificado fuera de este archivo. Nada pusheado.**

### Verificación del diff

El commit del probe toca **un solo archivo** (`git show --stat`):

```
docs(probe): mapa de las seis pantallas de construccion previo a P6
 logic-core-v3/docs/probe-construccion-p6.md | 606 ++++++++++++++++++++++++++++
 1 file changed, 606 insertions(+)
```

`git diff --stat` sobre el working tree **no** puede dar sólo este archivo, y hay que decir por qué: arrastra el WIP ajeno sin commitear que ya estaba en Fase 0 — **y que creció durante la corrida**. Salida al cierre:

```
 logic-core-v3/.gitignore                           |  4 ++
 logic-core-v3/docs/bitacora-beta-3.md              | 76 ++++++++++++++++++++++
 logic-core-v3/next.config.ts                       | 21 ++++++
 logic-core-v3/package.json                         |  1 +
 logic-core-v3/playwright.setter.config.ts          | 37 ++++++++---
 logic-core-v3/src/components/layout/HeroCanvas.tsx |  2 +-
 logic-core-v3/tsconfig.json                        | 19 ++++--
 7 files changed, 147 insertions(+), 13 deletions(-)
```

**`HeroCanvas.tsx` no estaba en la Fase 0** (eran seis archivos; ahora son siete). Otra sesión trabajó sobre este mismo checkout en paralelo mientras corría el probe — **mismo fenómeno que registró P4** (*«Creció durante la corrida… otra sesión trabajó sobre este mismo checkout en paralelo»*, `bitacora-beta-3.md:2129-2132`). Ninguno de esos siete archivos fue tocado por este probe: el commit `9ab85b7` lo prueba.
