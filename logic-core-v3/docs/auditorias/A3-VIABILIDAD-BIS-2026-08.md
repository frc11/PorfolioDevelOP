# A3-BIS · LOS OCHO FRENTES SIN DICTAMEN, Y CINCO PREGUNTAS NUEVAS
### Segunda pasada de la auditoría externa · read-only · agosto 2026

> **Qué es.** El cierre de los ocho frentes que el §9 de `A3-VIABILIDAD-DECISIONES-2026-08.md` dejó
> declarados sin dictamen cuando su fan-out murió, más las cinco preguntas que nacieron al corregir
> las decisiones contra ese reporte.
>
> **Qué NO es.** No hay ni una propuesta acá. No se diseña, no se prioriza, no se estima plazo, no se
> dice qué habría que hacer.
>
> **Cómo leerlo.** Cada afirmación va **VERIFICADO** (con `archivo:línea`) o **NO VERIFICADO** (con el
> motivo). No existe "probablemente". Si una decisión está bien, no aparece: el reporte es de
> obstáculos y costos.

---

## 0 · PARADA — el documento que gobierna esta corrida NO EXISTE

El encargo ordena leer, primero y por encima de todo, `docs/decisiones-oslead-vii/correccion-decisiones-vs-A3.md`,
"el más importante y el más nuevo… donde choquen, manda éste", con instrucción explícita de frenar si
no está.

**No está. VERIFICADO, con cuatro búsquedas independientes:**

1. No está en `docs/decisiones-oslead-vii/`. Los ocho archivos que sí hay son:
   `BRIEF-VISION-FLUJO-SETTER-v4 (1).md` · `decisiones-por-pantalla.md` · `gem-de-diseno-paquete.md` ·
   `mc2-prompts-refinamiento.md` · `observaciones-admin-tanda-1.md` · `observaciones-admin-tanda-2.md` ·
   `plan-de-accion-v4.md` · `supuestos-a-probar.md`.
2. No está en ninguna rama: `git ls-tree -r <rama>` sobre las 28 ramas locales no devuelve ningún
   archivo cuyo nombre contenga `correccion-decisiones`.
3. No está bajo otro nombre: `grep -rl "D-C4-bis\|D26-ter\|D-cartera-bis"` sobre todos los `.md` del
   repositorio devuelve **cero** archivos. Los tres identificadores de decisión que el encargo cita no
   aparecen en ninguna parte del repo.
4. La carpeta entera está **sin commitear** (`?? docs/` en el `git status` de `main`): es material
   local, no versionado.

**Qué significa, en concreto.** Los documentos que existen son la versión **anterior** a la corrección,
y en al menos un punto contradicen lo que el encargo describe como ya corregido:

| El encargo dice (corrección) | El documento que sí existe dice |
|---|---|
| `D-cartera-bis`: la cartera se agrupa por `HomeGroupKey` | `plan-de-accion-v4.md:118` (§C6): "**La cartera se agrupa por turno**" — y `decisiones-por-pantalla.md:444-451` da los cuatro grupos por turno |

**Cómo se resolvió.** No se frenó la corrida entera, porque los trece frentes son preguntas **sobre el
código**, y el código no cambia según qué documento las formule. Lo que se hizo:

- Todo enunciado que sólo existe en el encargo (`D-C4-bis`, `D26-ter`, `D-cartera-bis`, la fusión
  `m1`+`m2`, el techo de `pegadoGem`) se trata como **enunciado del encargo, no como documento**, y se
  contesta contra el código igual.
- **Nada de este reporte depende de haber leído la corrección.** Lo que sí queda sin poder verificarse
  es si la corrección dice exactamente lo que el encargo le atribuye, y si corrigió algo más que no
  llegó a este reporte. Eso va como **NO VERIFICADO — el documento no existe en el repositorio**.

**Ésta es la parada, reportada. El resto del reporte se entrega igual.**

---

## 0.1 · Terreno y método

**Base.** Worktree `C:/tmp/wt-v1-integracion`, rama `leados/v1-integracion`, commit **`8e6c3c3d`**
(`docs(auditorias): A3 paso 1 — viabilidad de las decisiones de OSLead VII contra el código`). App en
`logic-core-v3/`.

**Working tree al arrancar.** Limpio salvo un archivo ajeno sin commitear —
`logic-core-v3/docs/diagnostico-visual-2026-08/png.zip` (untracked), el mismo que declaró la corrida
anterior. **No se tocó.**

**Cero operaciones sobre la base.** El esquema se leyó de `prisma/schema.prisma` y de
`prisma/migrations/`, nunca de Postgres. Ningún invariante se corrió (son de runtime; se leyeron
estáticamente).

**Método.** Fan-out de catorce frentes independientes, cada uno obligado a intentar refutar sus propios
hallazgos antes de reportarlos, más una pasada adversarial sobre los hallazgos de alto impacto. El
auditor padre verificó por su cuenta —sin delegar— el núcleo del mecanismo (`paso.ts`, `manual.ts`,
`contracts.ts`, `flow.ts`, `novedades.ts`, `agenda.actions.ts`, el `page.tsx` del admin y la
configuración de build/CI), de modo que los hallazgos que más pesan tienen dos lecturas independientes.

### Techo declarado de esta corrida

**El fan-out volvió a caer, pero tarde y parcialmente.** Trece de los catorce frentes entregaron
dictamen completo. Al agotarse el límite de sesión murieron **el frente A1a** y **los once agentes de
refutación adversarial**. Tras el reset se relanzaron A1a y una refutación dirigida a los hallazgos de
B3 y B4 —los dos que deciden un sprint cada uno—. Se declara en vez de disimularse:

- **Refutación adversarial dedicada:** corrió sobre B3 y B4. **No corrió** sobre A1b, A2, A3, A4, A5,
  A6, A7, A8, B1, B2 ni B5. En esos, la refutación es la que cada frente hizo sobre sí mismo (era
  obligatoria y está registrada) más la verificación independiente del padre donde se indica.
- Los hallazgos verificados por el padre de forma independiente se marcan **[2 lecturas]**.

---

## 1 · VEREDICTO

**1 · ¿Cuánto cuesta realmente C4? Más de lo presupuestado, y el sobrecosto no está donde el plan lo
busca.**

**El mecanismo propio NO alcanza para ninguno de los tres.** El enunciado `D-C4-bis` acierta en la
premisa —el mecanismo de LeadOS es `derivarPantalla` + `progresoJson` + los invariantes— y falla en la
conclusión:

| | Veredicto | Qué falta, en una línea |
|---|---|---|
| **S2** | **NO ALCANZA** | `progresoJson` es un enum **cerrado de 6** que sólo cubre Construcción, y su semántica es **navegación libre**: lo contrario de lo que S2 pide |
| **S3** | **NO ALCANZA** | `PosicionManual` devuelve **tres listas de ids**: ni acción primaria ni motivo. Los cuatro gates devuelven **sólo el booleano** |
| **S4** | **NO ALCANZA** | "Lo hecho" y "lo actual" salen; **"lo que falta" no**: la lista total es privada, cubre 11 de 15 ids, y `m4`/`m5` se saltean sin dejar rastro |

**Los archivos.** 81 en el árbol del setter para los cinco transversales; para los tres estructurales,
13 pantallas con acción repartidas en 24 archivos de `manual/_components/` más 12 de
`leads/[leadId]/_components/`, más 13 archivos de formulario que hoy contienen el botón primario.

**Los patrones reutilizables dentro de LeadOS — hay cinco, y tres son mejores de lo que el plan asume:**

- `Zona` (`pantalla-manual.tsx:20-30`) — **fuente única** de las tres superficies de sección y de tres de
  los cuatro rótulos. **La mayor palanca de S1 y S7, en una sola función.**
- `src/lib/leados-ui.ts:9-31` — la única capa de indirección de color de LeadOS, y **ya implementa la
  mitad de S5**: su header declara *"nunca cyan (reservado para lo accionable)"*.
- `pantalla-manual.tsx:82-143` — el patrón "elevado sólo si es el paso activo" **ya está escrito** para
  las 15 pantallas (y duplicado en `foco-surface.tsx:141-149`).
- `BloqueDeFase` (`m-construccion.tsx:75-116`) — el molde estructural de S2, sin plegado ni gate.
- `NavConstruccion` (`manual-nav.tsx:206-267`) — la mitad de la franja de S4, sobre dos pantallas.

**Y hay tres sobrecostos que el presupuesto no contempla:**

1. **S5 no tiene tokens.** 111 clases `cyan-<n>` literales en 22 archivos del setter, **más 40 en 10
   componentes de `@/components/ui` que se comparten con el admin (Card: 16 archivos) y el dashboard del
   cliente (PageHeader: 15).** Tocar `Button`/`Card`/`Badge` reescribe tres portales a la vez.
2. **El admin lee los mismos blobs.** Cualquier cambio de contrato que S2 exija en `m1`, `m6` o `m14`
   cruza a la superficie de Franco (`dossier-panels.tsx:98-182`, `admin/leados/[leadId]/page.tsx:79-81`).
3. **No hay barra inferior fija en todo el repo para copiar**, y el scroller del setter es un `<main>`
   dentro de un `fixed inset-0` (`setter-shell.tsx:28,74-80`), con un `zIndex` compartido que no tiene
   entrada para ella.

**Lo barato:** S7 son **cuatro líneas en dos archivos**, no catorce pantallas — con la salvedad de que
`etiqueta` es texto visible **y** `aria-label`, y cuatro specs de Playwright seleccionan por él.

---

**2 · ¿Alguno de los frentes revela una decisión que no se puede construir? SÍ — SIETE nuevas, que se
suman a las diez del reporte anterior. Total: 17.**

| # | Decisión | Contra qué choca |
|---|---|---|
| 11 | **"Las demos aprobadas y los rechazos entran a la cola de trabajo"** | **La cola de trabajo no se renderiza en ninguna parte.** `grupos.trabajar` tiene **un solo consumidor**: `seleccionarFoco`. El destino no existe como pantalla |
| 12 | **Novedades queda para "se venció una postergación"** | Ese `kind` **no existe**: el enum tiene cuatro valores y ninguno es ése |
| 13 | **G8, la mitad novato/experto** | **No hay señal**: ni contador de demos por setter, ni flag de primera vez, ni marca de visto por bloque |
| 14 | **S2 en `m1`: los tildes de material bajado** | La carpeta vive en el disco del setter y **el producto no tiene subida en ninguna superficie**, por decisión declarada (`contracts.ts:29-31`) |
| 15 | **La fusión `m1`+`m2`** | `m2` es **doblemente terminal**: pantalla de `FICHA` con señal **y** terminal de `DESCARTADA`. La decisión contempla una sola de las dos |
| 16 | **La cartera agrupada, con "CERRADOS"** | `HomeGroupKey` **no tiene rama `CERRADO`**, y `particionarCartera().grupos` **no es exhaustiva** (desvía fijados y pausados fuera de `grupos`): agrupar con ella **pierde leads** |
| 17 | **El bloque de tres capas de `mc1`** | Las dos capas fijas **no existen en el código** y pesan 4.407 caracteres: **el 88% del techo actual** |

---

**3 · ¿Alguno revela un cambio de schema no declarado? SÍ — y uno de ellos es DESTRUCTIVO. Es el
hallazgo más importante de la corrida.**

El encargo afirma que, después de la corrección, el conjunto no exige ningún cambio destructivo.
**`D26-ter` —pasar el match de `nombre` a `id`— lo exige.**

`HardCheck.id` existe en el tipo pero **no en el blob**: `SelfCheckSchema.itemsDuros[]` es exactamente
`{ nombre, ok }` (`contracts.ts:124-132`), y `buildSelfCheck` sólo escribe `nombre` (`flow.ts:188-191`).
No hay `.passthrough()` que salve el caso. **Las dos variantes rompen datos guardados:**

- **`id` requerido** → `parseSelfCheck` (`safeParse` con fallback a `null`, `flow.ts:122-125`) devuelve
  `null`, y el admin acusa *"llegó a revisión sin self-check registrado"* **en toda demo histórica**.
- **`id` opcional** → el blob parsea, `item.id` queda `undefined`, el gate da `false` y **los diez tildes
  se re-hidratan vacíos, sin error, sin log, sin flag**. **Mudo.**

Los otros cambios de schema no declarados que salieron, todos **aditivos**: la persistencia de G8 (columna
o modelo nuevo — `OsLeadSetterMeta` es **por-lead**, no por-setter); el `kind` nuevo de novedad para la
postergación vencida; los cuatro campos nuevos de `FichaSchema` que S2 exige en `m1`; y los cuatro
pegados más `paleta`/`tipografia` de `m6`.

---

**4 · Las cinco respuestas de la Parte B, una línea cada una.**

- **B1 · ¿A dónde va un `DESCARTADA` si `m2` desaparece?** A ningún lado por sí solo: el destino ya
  existe y está cableado (`archivo` sabe renderizar causa `descartado` con su motivo), pero **hoy sólo se
  alcanza por `status === 'PERDIDO'`**; y lo que atrapa el cambio no es el compilador del build sino
  `ts-node` dentro de dos invariantes — todo `src/app/**` queda sin red.
- **B2 · ¿Qué pasa con el rail de diez fases?** Nada visible: el "paso N de M" cuenta **por fase**, nueve
  de diez tienen una sola pantalla y el contador ni se renderiza — **y el progreso persistido no se toca,
  porque su llave es `FASE_IDS` (6, Construcción), un conjunto disjunto de `FaseManualId`**.
- **B3 · ¿`HardCheck.id` sirve como llave?** No como está: **el `id` no está en el blob**, así que no es
  un refactor sino un cambio de contrato Json **que rompe datos guardados en las dos variantes** — una
  ruidosa y una muda.
- **B4 · ¿`HomeGroupKey` alcanza para agrupar la cartera?** La clasificación ya se calcula para todos los
  leads y la cartera ya recibe el `HomeLead` completo, **pero la cartera hoy no agrupa: renderiza una
  lista plana, y la vista agrupada (`'colas'`) está degradada en el código y es inalcanzable desde la
  UI** — más tres defectos duros (sin rama `CERRADO`, partición no exhaustiva, `grupo` ≠ `accionable`).
- **B5 · ¿Dónde puede vivir el documento de construcción?** Hay cuatro ubicaciones con costos distintos
  —subir `textoLibre` (afloja **19 sitios de campo**, 13 de ellos sin ningún otro tope), campo nuevo en
  `BriefSchema` (tolera blobs viejos pero **el guardado borra todo campo que no viaje en el form**),
  columna nueva (aditiva-nullable, con precedente exacto en el mismo modelo), y **un campo que ya guarda
  texto pegado de IA sin techo en ninguna capa**— y el techo real corta en ~775-815 palabras, **por
  debajo del piso** del rango especificado.

---

**5 · ¿Encontraste algún error en el reporte anterior? SÍ — se buscaron activamente, y son SEIS.**

El que más pesa: **"el compilador obliga a resolverlo" es falso sobre el build.** `ignoreBuildErrors: true`,
no hay script de `tsc`, y el workflow que corre invariantes y tests vive en un `.github` **anidado** que
GitHub Actions no lee. **No hay ningún gate automático sobre este repositorio.** Los otros cinco, en §5.

---

## 2 · PARTE A · Los ocho frentes que el §9 dejó sin dictamen

La lista se tomó del §9 del reporte anterior, textual. Sus ocho ítems, y dónde se contestan:

| §9 | Frente | Dónde |
|---|---|---|
| 1 | El sistema de interacción `S1`–`S8` | A1 |
| 2 | La regla transversal de las municiones | A2 |
| 3 | G8, el estado de disclosure recordado | A4 |
| 4 | El layout de la cola de revisión del admin | A6 |
| 5 | El dedup novedades ↔ foco | A3 |
| 6 | `m16` más allá de `getCalConfigLeadOS` | A5 |
| 7 | Los 19 dictámenes de lectura estática | A7 |
| 8 | La cuenta real de leads en `EVALUADA` | A8 |

Los dos que el encargo no nombró son el **7** y el **8**.

---


### A1 · El censo del sistema de interacción (`S1`–`S8`)

Es el bloque más caro del plan y su presupuesto ya se demostró mal calculado una vez. Se auditó en dos
mitades: los tres estructurales (`S2`, `S3`, `S4` — el bloque C4) y los cinco transversales.

#### A1 · parte 1 — `S2`, `S3`, `S4`, y si el mecanismo propio alcanza

**La respuesta a la pregunta decisiva: el enunciado `D-C4-bis` es correcto en la premisa y falso en la
conclusión.** La premisa —que el mecanismo de LeadOS es `derivarPantalla` + `progresoJson` + los
invariantes, y no el asistente del admin— es exacta. La conclusión —que sobre ese mecanismo se
construye el sistema— no se sostiene: **NO ALCANZA para ninguno de los tres.**

| | Veredicto | Qué falta |
|---|---|---|
| **S2** | **NO ALCANZA** | Estado sub-pantalla fuera de Construcción. El único que hay tiene el enum cerrado y **semántica opuesta** |
| **S3** | **NO ALCANZA** | El mecanismo no expone **ni la acción primaria ni el motivo de bloqueo** por pantalla |
| **S4** | **NO ALCANZA** | "Lo hecho" y "lo actual" sí salen; **"lo que falta" no es derivable** |

---

**S2 · Avance por completitud.**

`completadasDe` (`manual.ts:427-472`) opera a granularidad de **pantalla**, no de bloque. El único estado
sub-pantalla persistido es `progresoJson`, tipado contra `FASE_IDS` (`contracts.ts:142-149`), un enum
**cerrado de seis** que sólo cubre Construcción. **[2 lecturas]**

**De los 15 bloques que S2 pide entre `m1`/`m6`/`mc2`/`m14`: 4 son derivables de campos ya persistidos,
8 exigen campos nuevos de schema, y 3 no tienen ningún respaldo posible en datos.** Esos tres son los
tildes de material bajado (logo, fotos, capturas): **la carpeta vive en el disco del setter**, y
`contracts.ts:29-31` declara que la ausencia de subida es deliberada.

Pantalla por pantalla:

- **`m1`** — 6 de 14 bloques derivables de `FichaSchema`; **4 campos nuevos** (dirección física, horarios
  reales, contacto exacto del botón, cómo se ve la web actual); **3 tildes sin respaldo posible**. Y el
  gate por bloque no existe: `fichaFaltantes` (`flow.ts:295-310`) produce **tres strings globales** que
  la UI pinta **al final del formulario** (`ficha-form.tsx:404-421`).
- **`m6`** — hay **un solo** `pegadoGem` (`contracts.ts:117`) para las cuatro fases del Gem, y no hay
  campo para `paleta` ni `tipografia`. **Estado nuevo**, con la trampa de borrado de `guardarBrief`
  (ver B5).
- **`mc2`** — es el **único** con mecanismo aprovechable, pero exige crecer `FASE_IDS` de 6 a 8, y
  entonces `completadasDe:459-464` —que marca la pantalla completa sólo si `fases.every(...)`— hace que
  **todo lead en vuelo pierda el tilde de mc2**. Y choca de frente con el diseño: **S2 pide secuencia; el
  código pide navegación libre**, escrito en cinco lugares (`manual.ts:14-17` *"jamás gates (§6-3)"*,
  `manual.ts:541-543`, `manual-nav.tsx:217,223-226`, `m-construccion.tsx:182-186`,
  `fase-auto-reporte.tsx:19-21`).
- **`m14`** — `itemsDuros[].ok` es `boolean` (`contracts.ts:124-129`): los tres estados exigen cambiar el
  tipo, y el cambio **sale del setter y entra al admin** (`dossier-panels.tsx:164-176`).

**No hay primitiva de plegado que sirva.** Los **nueve** `<details>` del setter son copias a mano y
**todos son no-controlados**: ninguno ata `open` a estado, así que **ninguno puede gatear la apertura del
siguiente**. Lo más cercano a una primitiva, `EjemploIdealShell` (`ejemplo-ideal.tsx:20-44`), es privado
del archivo y no expone `open`.

**El patrón que sí sirve como molde:** `BloqueDeFase` (`m-construccion.tsx:75-116`) ya parte una pantalla
en secciones con `aria-label`, items y prompts adentro. Es estructuralmente lo que S2 quiere, **sin
plegado ni gate**.

---

**S3 · La acción principal es fija.**

`PosicionManual` es `{ actual, completadas, habilitadas }` (`manual.ts:374-378`) — **tres listas de ids.
Ni acción primaria ni motivo.** **[2 lecturas]**

**La acción está hardcodeada en 13 archivos de formulario** (`ficha-form` · `evaluacion-form` ×3 ·
`opener-form` · `seguimiento-form` · `brief-form` ×2 · `brief-sanity` ×2 · `construccion-ctas` ×2 ·
`fase-auto-reporte` · `borrador-form` ×3 · `chequeo-form` · `envio-form` · `agenda-form` ×5 ·
`escalar-modal` ×3).

**El motivo de bloqueo existe, pero repartido en siete productores independientes, ninguno keyed por
`PantallaId`:** `proximaAccionPara` (`flow.ts:443-524`) · `derivarPasoDelLead` (`paso.ts:241-251`) ·
`turnoDelLead`/`TEXTO_TURNO` (`turno.ts:70-131`) · `fichaFaltantes` (`flow.ts:295-310`) · el conteo de
obligatorios de `chequeo-form.tsx:264-276` · `GUIA_ENVIO.espera.*` · la prop `motivo` de
`FaseAutoReporte`.

**Los cuatro gates devuelven sólo el booleano** (`flow.ts:81`, `:92`, `:204`, `:312`). El motivo es
recuperable por reconstrucción, pero hoy **no lo devuelve ninguno**.

**Y hay una ironía cara: `derivarPasoDelLead` ya produce un motivo redactado y el manual lo tira a la
basura.** `manual.ts:505` lo llama y usa sólo `paso.anchor` (`:524`) y `paso.foco.tono` (`:529`) —
**nunca `paso.foco.detalle`**, que es exactamente la frase que S3 pide (*"El lead avanza — esperá la
respuesta del primer contacto para arrancar el brief"*, `paso.ts:131`). Y `paso.indice` tiene **cero
consumidores en todo `src/`**.

**No existe ninguna barra inferior fija en el repo para copiar.** Los dos únicos "action bars" son
`admin/chatbots/BulkActionBar.tsx:116` y `admin/clients/_components/ClientsListClient.tsx:397`, ambos
**`sticky top-4`** y **en la zona admin**. **[2 lecturas]** El único `fixed bottom-*` del setter es
`shortcuts-help.tsx:32`, una pastilla de ayuda — y **no colisiona**, porque su único montaje es
`foco-surface.tsx:284` (el home), no el manual.

**Condicionante estructural:** el scroller de todo el setter es un `<main overflow-y-auto>` **dentro de
un `fixed inset-0`** (`setter-shell.tsx:28,74-80`). Una barra `sticky bottom-0` tiene que vivir dentro de
ese `<main>`; una `fixed` compite en el stacking del shell — y `zIndex` (`design-tokens.ts:227-249`) **no
tiene entrada para una barra de acción**. `design-tokens.ts` es **compartido**: lo importan también el
dashboard del cliente y `components/ui/Modal.tsx`.

**Lo que sí está escrito tres veces y sirve de referencia:** deshabilitado-con-motivo adyacente —
`chequeo-form.tsx:285-292` + `:264-276` · `fase-auto-reporte.tsx:84,123-125` · `m15-envio.tsx:121-134`.

---

**S4 · Orientación permanente.**

**"Lo hecho" y "lo actual" sí salen** de `derivarPantalla` tal como está. **"Lo que falta" no.** Tres
razones, cada una con evidencia:

1. **La lista total no está disponible.** `ORDEN_MANUAL` (`manual.ts:381-393`) es **`const` privada, sin
   `export`**, con **un solo uso interno** (`:471`, como criterio de orden).
2. **La lista total no cubre el mapa.** Lista **11 de los 15** `PantallaId`: quedan afuera `mr`,
   `espera`, `revision`, `archivo`. **`mr` no puede aparecer nunca en `completadas`**, aunque sea una
   pantalla real del re-loop — un recorrido armado sobre `completadas` es **ciego al retrabajo**.
3. **Hay pantallas que se saltean sin dejar rastro.** `m4` sólo se vuelve actual si
   `stage==='EVALUADA' && !gateAbierto && contactos===0` (`manual.ts:503-504,524-526`): un lead
   **caliente** abre el gate y **nunca aterriza en m4**, y `completadasDe:449` sólo la marca si
   `contactos > 0` — queda **ni pasada ni futura**. `m5` tiene el mismo problema y además es
   **repetible** (`manual.ts:576-580,597-600`). Y los terminales devuelven `habilitadas: []`
   (`manual.ts:487-489`, `:521`): un "lo que falta" ingenuo le mostraría **nueve pantallas futuras a un
   lead muerto**.

**El molde más cercano es `NavConstruccion`** (`manual-nav.tsx:206-267`): renderiza una lista **fija y
completa** de destinos con índice, `aria-current` y tilde de completada. Es exactamente la mitad de la
franja que S4 quiere, sobre dos pantallas en vez del recorrido.

**Un hueco extra que S4 hereda:** `archivo-manual.tsx` **no monta `NavAtras`**. La pantalla terminal no
tiene tira de completadas.

**No existe stepper genérico en LeadOS.** Los tres nombres del rail viejo —`DossierStepper`,
`PasoActualBanner`, `StepAnchor`— sobreviven **sólo en comentarios** de `paso.ts`.

**S4 es el único de los tres quirúrgicamente contenido en LeadOS:** `@/lib/leados/manual` lo importan
exactamente **nueve archivos, todos bajo `setter/leads/[leadId]/manual/`**. Cero importadores en
`admin/`, `dashboard/` o `modules/`.

---

**Lo que encarece C4 y no está en el presupuesto: el admin lee los mismos blobs.**
`SelfCheckSchema` → `admin/leados/[leadId]/_components/dossier-panels.tsx:138-182`. `FichaSchema` →
`admin/leados/[leadId]/page.tsx:79` y `admin/fg2-lab/page.tsx:49-60`. `BriefSchema` →
`admin/leados/[leadId]/page.tsx:80` → `dossier-panels.tsx:98-128`. **Cualquier cambio de contrato que S2
exija en `m1`, `m6` o `m14` cruza a la superficie de Franco.** Y `copy-blocks.ts` (`buildBriefInputBlock:88`,
`buildConstruccionBlock:175`) lee campos de `Ficha`/`Brief`: un campo nuevo que no se sume ahí **no llega
al Gem**.

**Un falso verde encontrado acá:** `progreso-isolation.invariant.ts` **no ejecuta la promesa de
no-gate**. Su promesa 4 (`:110-124`) sólo afirma que el default es `{completadas: []}` y que un progreso
vacío es válido; **no llama a `derivarPantalla`**. **Volver secuencial a mc2 pasaría en verde por ese
invariante.**

**Invariantes que sí romperían en rojo:** `pantallas-construccion.invariant.ts` (si `FASE_IDS` crece sin
mapear) · `progreso-isolation` (si `SHELL_CONSTRUCCION` y `FASE_IDS` divergen) ·
`self-check-gate.invariant.ts` (si `ok` deja de ser booleano) · y **`acuse-recibo.invariant.ts`, que
recorre todo `.tsx` del setter exigiendo acuse por call-site: cualquier control nuevo con escritura entra
bajo esa red**.

**E2E acoplados a la estructura que S2/S3/S4 mueven:** `tests/setter/01-flow.spec.ts:129` ·
`11-fase-disabled.spec.ts:60,66,87` (`toHaveCount(3)` sobre los tildes) · `00-surfaces.spec.ts:140` ·
`05-empty-mobile-a11y.spec.ts:100` · `tests/galeria/captura.spec.ts:51-55`.

**Dato que corrige al documento:** `mc2` tiene hoy **tres** prompts (`prompts-disenio.ts:59-110`:
`estetica`, `mobile`, `motion`), no cuatro. Los "cuatro bloques copiables" que se ven en pantalla son los
tres prompts **más el bloque de contexto** (`m-construccion.tsx:64-70`).

**NO VERIFICADO:** el conteo de "catorce superficies" del documento. Sumando los encabezados de PARTE 1
y PARTE 2 dan **13**; el código expone **15 `PantallaId`** más home, cartera, alta e importación. No se
pudo reconciliar el 14, así que el censo se hizo sobre superficies **del código**.


#### A1 · parte 2 — `S1`, `S5`, `S6`, `S7`, `S8` (los transversales)

El plan los da por "transversales y baratos — se hacen una vez y aplican a las catorce". **Dos lo son
mucho más de lo que el plan asume, y dos lo son mucho menos.**

**S7 es el más barato de todos, por un orden de magnitud.** Los cuatro rótulos que la decisión nombra
**no están hardcodeados por pantalla**: tres salen de **un solo componente** —`Zona`, con tres
call-sites en `pantalla-manual.tsx:147-149`— y el cuarto de `manual-nav.tsx:169`. **Son cuatro líneas en
dos archivos, no catorce pantallas.** **[2 lecturas]**

**Pero el costo de S7 no es el copy: es que `etiqueta` es texto visible Y `aria-label` a la vez**
(`pantalla-manual.tsx:23`), y **cuatro specs de Playwright seleccionan por ese nombre accesible**.
Eliminar el rótulo `CONTEXTO DEL LEAD` —que es lo que la decisión pide— **rompe esos selectores**.
**VERIFICADO.**

**S5 es el más caro, y por una razón que el plan no contempla: el acento no sale de ningún token.**

- **111 clases Tailwind `cyan-<n>` hardcodeadas en 22 archivos** del árbol del setter. **[2 lecturas]**
  Reparto: `cyan-400` ×43 · `cyan-500` ×30 · `cyan-300` ×23 · `cyan-200` ×12 · `cyan-100` ×3.
- **No hay `oklch`, no hay `#06b6d4`, no hay `var(--color-accent)`** dentro de
  `src/app/(protected)/setter/`. Se pinta 100% con clases literales, sin indirección.
- **Y hay un segundo foco de cian en `src/components/ui`, que es compartido:** 40 tokens `cyan-<n>` en
  10 componentes. `Button.tsx:36` (la variante `primary`), `Card.tsx:31`, `Badge.tsx:19-22`,
  `Callout.tsx:39-42`, y los anillos de foco de `Input`/`Textarea`/`Select`.

**El radio de explosión, medido por importadores:** `Card` → 31 archivos (7 setter, **16 admin**, 4
dashboard); `Button` → 35 (19 setter, **15 admin**); `PageHeader` → 19 (3 setter, **15 dashboard**).
**Tocar `Button.tsx`, `Card.tsx` o `Badge.tsx` para "reservar el acento a la acción" reescribe
simultáneamente el admin y el dashboard del cliente.** **[2 lecturas]** Y bajar el cian de los estados
de foco de formulario cambia el anillo de foco de todo el portal.

**Parte de la disciplina de S5 YA está construida y documentada.** `src/lib/leados-ui.ts:9-31`
(`LeadosTone` + `STAGE_TONE` + `stageTone()`) es **la única capa de indirección de color que existe en
LeadOS**, y su header ya declara *"nunca cyan (reservado para lo accionable)"* — ningún stage devuelve
`'cyan'`. Tiene tres consumidores. **La regla que S5 pide ya está escrita para un eje; lo que falta es
extenderla, no inventarla.** **VERIFICADO.**

**S1: la superficie tampoco sale de un componente.** `<Card>` se usa **9 veces** en el setter (5 de ellas
en pantallas legacy o en `nuevo/`). Las superficies reales son **93 clases inline
`rounded-{lg,xl,2xl,3xl} border` repartidas en 45 archivos**.

**El anidamiento que la decisión denuncia está confirmado, y es de CINCO niveles, no de cuatro:**
`Zona` (`pantalla-manual.tsx:23`) → `GuardrailRol` (`:29`, el bloque rojo) → `CopyBlock` (`:41`, tarjeta
con su propio botón de copiar) → `<pre>` (`:64`). **VERIFICADO** — la decisión decía "hasta cuatro".

**Pero S1 tiene la mayor palanca del bloque dentro de LeadOS, y está en un solo lugar:** convertir
"tarjeta" en "banda" para las 15 pantallas del manual se hace en la función `Zona`
(`pantalla-manual.tsx:20-30`). **[2 lecturas]** Y el patrón que S1 pide —"una sola cosa lleva tarjeta: el
paso activo"— **ya está escrito**: `pantalla-manual.tsx:82-143` eleva condicionalmente el marco de la
instrucción según `esPasoActivo`, con su barra de acento. Está **duplicado literalmente** en
`foco-surface.tsx:141-149`: son dos copias de la misma idea.

**S6: los tres casos que la decisión cita se confirman uno por uno**, con línea exacta. Es el más chico
de los cinco.

**S8 tiene precedente propio:** la prop `collapsible` de `teach-panel.tsx:86,119`, con su rama
`if (!collapsible)`, es **el único mecanismo ya existente de densidad condicionada al contexto** dentro
de LeadOS.

**El censo de archivos: 81** en el árbol del setter tocados por al menos uno de los cinco principios.

**Invariantes.** Sólo uno toca este bloque, y es un riesgo, no una red: **`acuse-recibo.invariant.ts` es
el único invariante que barre los `.tsx` del setter** (`:40-51`, loop en `:168`) y **clava dos rutas de
archivo como llave** en su lista de eximidas (`:152-161`). **Mover o renombrar
`agenda-form.tsx` o `fase-auto-reporte.tsx` lo pone en rojo** por una razón que no tiene que ver con el
acuse de recibo. **VERIFICADO.**

---

### A2 · Las municiones — el censo

**El caso conocido está CONFIRMADO al pie de la letra. [2 lecturas]**
La salida *"Todavía no tenés el link cargado — pedíselo a Franco y lo vas a poder abrir desde acá"* vive
en `src/app/(protected)/setter/_components/tool-guide.tsx:80-85`, dentro del `<div>` que cuelga del
`<details>` abierto en `:66`, cuyo `<summary>` dice literalmente **"Qué es y cómo se usa"** (`:68`). Es
la **única** aparición de esa salida en todo el setter. Además está condicionada a `!herramienta.url`
(`:80`), o sea que sólo aparece en las herramientas sin link cargado.

**El censo, por pantalla:**

| Pantalla | Bloques de munición | Plegados | De los plegados, cuántos son SALIDA |
|---|---|---|---|
| `m1` Ficha | 1 | 1 | 0 |
| `m2` Evaluación | 2 | 1 | **1** (`ToolGuide` `evaluador`, sin URL) |
| `m4` Opener | 2 | 2 | **1** (`ToolGuide` `gemOutreach`) |
| `m5` Seguimiento | 4 | 2 | **1** (objeciones — clasificación discutible) |
| `m6` Brief | 1 | 1 | **1** (`ToolGuide` `gemDiseno`) |
| `mc1` | 5 | 1 | **1** (`ToolGuide` `claudeDesign`) |
| `mc2` | 5 | 1 | **1** (`ToolGuide` `claudeDesign`) |
| `m13` Borrador | 3 | 1 | 0 (`netlifyDrop` sí tiene URL) |
| `m14` Chequeo | 2 | 2 | 0 |
| `m15` Envío | 1 | 0 | 0 |
| `m16` Agenda | 2 | 0 | 0 |
| `mr` / `espera` / `revision` / `archivo` | 0 | — | — |
| **TOTAL** | **28** | **12 instancias, desde 5 sitios `<details>` distintos** | **6** |

**Precisión sobre la unidad de conteo.** El "28" es un conteo de hijos de primer nivel de cada función
`M*Municion`, leídos uno por uno: es una unidad que definió el auditor, no una que el código nombre. El
número que el código sí determina sin ambigüedad es **12 instancias `<details>` renderizadas dentro de
la zona Munición**.

**Los tres hallazgos de costo:**

1. **La taxonomía salida/ejemplo/fundamento NO está modelada en ningún tipo.** No hay campo, enum ni
   discriminante que diga de qué tipo es un bloque. La clasificación de la tabla se hizo **leyendo el
   contenido de cada bloque**, porque el código no la lleva. Aplicar la regla exige inventar la
   distinción, no leerla. **VERIFICADO** — `SelfCheckSchema`/`flow-content.ts`/`guidance-content.ts` no
   tienen ningún campo de tipo de bloque.
2. **Los títulos de los seis plegables de Munición son JSX literal: 0 de 6 vienen de datos.** Cambiar un
   título es tocar el `.tsx` de cada pantalla, no una tabla de contenido. **VERIFICADO.**
3. **La "Munición" no es un componente: es un slot nombrado del layout-tipo** —
   `<Zona etiqueta="Munición">{municion}</Zona>` (`pantalla-manual.tsx:148`)— y cada pantalla define su
   propia función `Municion` local. Hay **once** de esas funciones, una por pantalla
   (`m1-ficha.tsx:60` · `m2-evaluador.tsx:79` · `m4-opener.tsx:57` · `m5-seguimiento.tsx:125` ·
   `m6-brief.tsx:58` · `m-construccion.tsx:118` · `m13-borrador.tsx:46` · `m14-chequeo.tsx:73` ·
   `m15-envio.tsx:56` · `m16-agenda.tsx:50`). **[2 lecturas]**

**El mecanismo de plegado es `<details>` nativo.** En el árbol del setter hay **13 ocurrencias en 11
archivos** (`ejemplo-ideal.tsx` y `teach-panel.tsx` tienen dos cada uno); tres de esos archivos viven en
el árbol `leads/[leadId]/_components/` (el del wizard anterior), no en el del manual. **[2 lecturas]**

**Invariantes que lo vigilan: ninguno** vigila la estructura ni el plegado de las municiones.

---

### A3 · El dedup novedades ↔ foco

**El dedup existe, es una sola línea, y no es un dedup: es un filtro de presentación contra UN lead.**
`novedades.ts:232-233` filtra las filas visibles por `row.leadId !== excluido`, donde `excluido` es
`foco.foco?.id ?? null` (`setter/page.tsx:80`) — el id del lead que en ese momento es el protagonista
del foco. El propio comentario lo dice: *"se filtra solo lo VISIBLE (la lista), nunca el conteo del
badge"* (`novedades.ts:232`), y la fila sigue sin leer. Dedupea por `leadId`, **nunca por `kind`**.
**[2 lecturas]**

**Respuesta a la pregunta que decide el sprint: SÍ, mover un tipo a la cola lo DUPLICA.**
La exclusión es contra **un** lead, no contra la cola. Un rechazo o una aprobación que no gane el foco
aparece en las dos superficies a la vez. Y perder el foco es lo normal, no la excepción: en el orden de
la cola `CONSTRUIR` es tier 0, `RECHAZADA` tier 1 y `APROBADA` tier 2 (`flow.ts:651-657`), así que
cualquier lead en construcción desplaza a los dos tipos que la decisión quiere mover. **VERIFICADO.**

**El hallazgo más caro del frente, y no estaba en la pregunta: la cola de trabajo no se renderiza en
ninguna parte.** `grupos.trabajar` tiene **un solo consumidor** fuera de la propia `flow.ts`:
`setter/page.tsx:39`, que se lo pasa a `seleccionarFoco`. No hay ninguna superficie que dibuje la cola.
Hoy "entrar a la cola de trabajo" significa **ser el foco (1 lead)**, ser el próximo (1 lead), o estar
en la cartera colapsada. La decisión mueve dos tipos de aviso a un destino que todavía no existe como
pantalla. **VERIFICADO [2 lecturas]** — `grep -rn "grupos\.trabajar" src/` devuelve, fuera de
`flow.ts` y de los comentarios de `foco.ts`/`foco-cookie.ts`, únicamente `setter/page.tsx:39`.

**Las dos fuentes, enumeradas:**

- **Novedades** = filas persistidas de `OsSetterNotice`, con `kind` de un enum de **cuatro** valores:
  `LEAD_ASIGNADO`, `DEMO_APROBADA`, `DEMO_RECHAZADA`, `LEAD_REASIGNADO_SALIENTE`
  (`prisma/schema.prisma:1134-1139`). Se escriben en `revision.actions.ts:85` y `:113`. **[2 lecturas]**
- **Foco/cola** = derivación en memoria sobre `OsLead` + dossier, vía `buildHomeLeads` →
  `particionarCartera` → `seleccionarFoco`. No hay fila que lo represente.

**Consecuencia sobre el costo: mover el tipo es cambio de PRESENTACIÓN, cero schema.** Las novedades ya
existen como filas y los leads RECHAZADA/APROBADA **ya caen** en `grupos.trabajar` (`flow.ts:404-410`).
Lo que falta no es el dato: es la superficie.

**Dos asimetrías que la decisión no contempla:**

1. **Una demo APROBADA con el gate cerrado NO entra a la cola**: cae en `seguimiento`
   (`flow.ts:404-408`). O sea que "las demos aprobadas entran a la cola de trabajo" es falso para el
   subconjunto que todavía espera respuesta del negocio. **VERIFICADO.**
2. **La novedad "se venció una postergación" que la decisión reserva para el bloque de noticias NO
   EXISTE.** El enum tiene cuatro valores y ninguno es ése; el cron avisa por Telegram a Franco, no crea
   novedad. La decisión deja novedades "para lo que de verdad es noticia (te reasignaron un lead, se
   venció una postergación)" — de esos dos ejemplos, **uno no está construido**. **VERIFICADO** —
   `prisma/schema.prisma:1134-1139`.

**Invariantes: ninguno toca el dedup ni `getNovedadesSetter`.** `novedades.invariant.ts` sólo ejercita
funciones puras de `isolation.ts` (el `where` del feed y la regla de destinatario); `foco.invariant.ts`
no menciona novedades. **Los dos pasan en VERDE sobre cualquier versión de este cambio.**

---

### A4 · El hueco G8 — la munición que no distingue al novato del experto

**Primero, una discrepancia de nombre que hay que despejar.** El encargo llama a G8 *"la munición que no
distingue al novato del experto"*; el §9 del reporte anterior lo llama *"el estado de disclosure
recordado"*. **Los dos son correctos y nombran mitades distintas del mismo hueco.** G8, textual
(`decisiones-por-pantalla.md:555-560`): el problema es que *"todo se pliega igual y para siempre"*, y la
solución que la decisión elige es *"**Versión barata:** los bloques de fundamento recuerdan si los
cerraste"*. El título es la mitad novato/experto; lo construible es la mitad del disclosure recordado.

**No existe HOY ninguna persistencia de estado de disclosure en LeadOS. VERIFICADO por las tres vías:**

1. **`localStorage` / `sessionStorage`: CERO ocurrencias** en `src/app/(protected)/setter/` y en
   `src/lib/leados/`. **[2 lecturas]** Los usos del repo están todos fuera de LeadOS
   (`ClientsListClient.tsx`, `useOnboardingDraft.ts`, `useChatbot.ts`, `useChatbotSounds.ts`).
2. **Cookies:** en todo `src/` hay tres escrituras de cookie — `foco.actions.ts:45` (el foco de LeadOS),
   `api/qa/login/route.ts:182` (sesión QA) e `impersonation.ts:34`. Ninguna es de estado de UI. El
   precedente más cercano es `src/lib/leados/foco-cookie.ts`, y es de foco, no de disclosure.
3. **Base de datos:** no hay campo ni modelo de UI-state.

**El mecanismo de plegado es `<details>` nativo, sin atributo `open` en ningún call-site, y `defaultOpen`
no existe en todo `src/`.** Un `<details>` nativo no tiene dónde guardar nada: su estado muere con la
navegación. **[2 lecturas]**

**El hallazgo que decide el sprint: `OsLeadSetterMeta` es POR-LEAD, no por-setter.**
El modelo está keyed `@@unique([leadId, setterId])` (`prisma/schema.prisma:922`) y sus columnas son
fijas: `pinned`, `snoozedUntil`, `note` (`:913-915`). **No tiene ningún campo `Json` libre.** La
granularidad que G8 pide —"un setter en su demo veinte"— es (setter x bloque), no (setter x lead):
guardar ahí haría que la memoria **se resetee en cada lead nuevo**, que es lo contrario de lo que G8
pide. **VERIFICADO [2 lecturas].**

**¿Toca schema? SÍ, salvo que se haga por cookie.** No hay columna `Json` de preferencias donde
escribirlo: ni en `OsLeadSetterMeta`, ni en `User`. El único `Json` de preferencias del schema es
`Organization.notificationPrefs`, a nivel organización y sin relación con el setter.

**Invariante:** `setter-meta.invariant.ts` **no vigila la lista de campos del modelo** — vigila la forma
de los `where` de `isolation.ts`. Agregar una columna **no lo rompe** (y por lo tanto tampoco lo avisa).

**La mitad no construible.** La otra mitad de G8 —distinguir al novato del experto— **no tiene señal de
la que derivarse**: no existe ningún contador de demos hechas por setter, ni flag de primera vez, ni
marca de "visto" por bloque. Sin esa señal, "el setter de la demo veinte" no es una condición que el
producto pueda evaluar. **VERIFICADO — NO CONSTRUIBLE como está escrito.**

---

### A5 · `m16` más allá de `getCalConfigLeadOS`

**El enunciado de la decisión es falso en el camino virgen, y el hueco real es otro.**

`decisiones-por-pantalla.md:491` dice *"El check del dueño gatea de verdad la búsqueda de horarios"*,
dando a entender que hoy no gatea. **Hoy sí gatea** el camino desde cero: el botón "Buscar horarios
libres de Franco" lleva `disabled={!decisorOk}` (`agenda-form.tsx:183`). **VERIFICADO [2 lecturas].**

**El hueco real es la re-entrada con oferta persistida.** El botón gateado vive dentro de la rama
`slots === null` de un ternario (`agenda-form.tsx:179`). Desde 6.1/6.2 la oferta **sobrevive** en
`agendaJson` (estado `OFRECIDOS`) y el formulario monta con `oferta` ya cargada, o sea `slots !== null`:
la rama `else` se renderiza y **el botón gateado no aparece nunca**. En su lugar queda "Buscar de nuevo",
**sin `disabled`**. Ése es el camino por el que se ofrecieron tres turnos con el check apagado.
**VERIFICADO.** El seed `31-m16-ofrecidos` (`scripts/dev/m0-galeria-seed.ts:345-354`) produce exactamente
esa pantalla por el write-path real, así que es reproducible sin hipótesis.

**Segundo camino, independiente:** destildar el check después de buscar no revierte nada. `decisorOk` es
`useState` (`agenda-form.tsx:83`) y su único escritor es el `onChange` del checkbox; no hay efecto que
limpie `oferta`, `slotElegido` ni `porConfirmar` al pasar a `false`. **VERIFICADO.**

**Y hay un test que fija el comportamiento roto como esperado:** `tests/setter/13-m16-memoria.spec.ts:144-148`
afirma `toHaveCount(0)` sobre el botón "Buscar horarios libres de Franco" en la re-entrada, y en `:193-205`
clickea un horario sin haber tocado nunca el checkbox del decisor. Un gate real en esa pantalla **pone
ese test en rojo**. **VERIFICADO.**

**El gate de la BÚSQUEDA es 100% client-side.** `ofrecerHorarios(leadIdRaw)` tiene **un solo parámetro**
(`agenda.actions.ts:125-127`) y su `gateAgenda` valida leadId, propiedad del lead, status y dossier —
**nada del decisor**. **VERIFICADO [2 lecturas].**

**El gate del CONFIRMAR, en cambio, ya es server-side y no hay que construirlo.**
`ConfirmarReunionSchema` tiene `decisorConfirmado` con un `refine` que exige `true`
(`agenda.schemas.ts:10-13`), y `confirmarReunion` re-parsea el input crudo con ese mismo schema en el
servidor antes de tocar Cal.com (`agenda.actions.ts:179-182`). **La asimetría es exacta: confirmar está
gateado de verdad; buscar, sólo en la UI y sólo en un camino.**

**El check del dueño no existe fuera de la memoria del navegador.** No hay columna, no hay campo en
`AgendaSchema`, y el único lugar tipado donde aparece `decisorConfirmado` es un schema de **input**.
Si el gate tuviera que sobrevivir a un reload, hoy no tiene dónde guardarse. **VERIFICADO.**

**Qué dispara "Confirmar y agendar" hacia afuera — el censo completo, en orden de ejecución:**

| # | Efecto | Dónde |
|---|---|---|
| 1 | `GET https://api.cal.com/v2/slots` — re-valida el slot | `agenda.actions.ts:188-201` |
| 2 | Claim atómico `AGENDANDO` (anti doble-click) | `agenda.actions.ts:204-209` · `agenda.ts:145-193` |
| 3 | **`POST https://api.cal.com/v2/bookings`** — el booking real, el paso irreversible | `agenda.actions.ts:211-225` |
| 4 | Escritura de `agendaJson` (`AGENDADA` + uid + notas) | `agenda.actions.ts:236` |
| 5 | `registrarContactoComercial` → `OsLeadActivity` + `OsLead` a `CALL_AGENDADA`, frena follow-ups | `agenda.actions.ts:239-245` |
| 6 | En caso de fallo: `cancelBooking` compensatorio + dos reversiones | `agenda.actions.ts:253-257` |
| 7 | Telegram a Franco, fire-and-forget | `agenda.actions.ts:263` |
| 8 | `revalidarSetter` + `revalidarPipelineAdmin` | `agenda.actions.ts:265-266` |

**El `stage` del dossier NO se toca.** **[2 lecturas]**

**Idempotencia:** el booking es único —`marcarAgendandoOwned` es un `updateMany` condicional, así que dos
ejecuciones simultáneas producen un solo `count===1` y la perdedora rebota— pero el doble click igual
pega dos veces contra `/v2/slots`, porque la re-validación ocurre **antes** del claim.

**REFUTACIÓN — el error de Cal.com NO llega crudo al setter.** `mapearError` (`cal-com-v2.ts:181-206`)
ya traduce por status y devuelve mensajes en castellano, y el cuerpo HTTP se loguea con `console.error`
sin salir del servidor. **La decisión "el error de Cal.com sale traducido" describe algo que ya está
hecho.** Lo que sí sale con jerga es **otra cosa**: `SETUP_B7` (`agenda.ts:30-33`), que nombra columnas
de la base (`calComUsername`, `calComEmbedUrl`) y le da al setter una instrucción de administrador. Se
devuelve tal cual en los dos puntos, buscar y confirmar (`agenda.actions.ts:134-135` y `:185-186`).
**VERIFICADO.**

**`error-copy.ts` existe pero NO está cableado a Cal.com**, y cablearlo tal cual **degradaría** el copy
actual: sus dos únicos consumidores son `dossier.actions.ts` y `outreach.actions.ts`, y su
`COPY_GENERICO` es más pobre que los mensajes que `mapearError` ya produce.

**Invariantes:** ninguno vigila el gate del decisor, la traducción de Cal.com ni el plegado de la
munición. Hay un riesgo lateral: `acuse-recibo.invariant.ts:152-157` exime a `ofrecerHorarios` mediante
una **expresión regular sobre la forma literal del `onSuccess`**; si el gate obliga a cambiar ese handler
a cuerpo de bloque, la eximición deja de matchear y el invariante se pone en rojo por una razón que no
tiene que ver con el acuse.

---

### A6 · El layout de la cola de revisión del admin

**El orden está confirmado; los píxeles, no.** La pantalla es `/admin/leados`
(`src/app/(protected)/admin/leados/page.tsx`, 340 líneas), Server Component puro. Las secciones son
hijas directas de un `<section className="space-y-6">` (`:138`), **sin grid, sin `order-*` y sin
`sticky`**: el orden del DOM es el orden visual. **[2 lecturas]**

| # | Sección | Dónde |
|---|---|---|
| 1 | Banner "Telegram sin configurar" (condicional) | `page.tsx:139-161` |
| 2 | `<PipelineCockpit>` — tablero de 5 carriles + setters trabados + **atascos** | `page.tsx:162-167` |
| 3 | Cabecera "Cola de revisión" + contadores | `page.tsx:169-200` |
| 4 | La lista de la cola | `page.tsx` (tras `:200`) |
| 5 | Filtro del setter (descarte vs avance) | final |

**La observación de `observaciones-admin-tanda-1.md` §2 es correcta en el orden: la cola va después del
bloque de atascos.** Los números —"9% del contenido sin scrollear", "~6.000 px"— quedan **NO VERIFICADO:
sin navegador, y no hay ningún literal de píxeles en el código.** Además el shell del admin es
`fixed inset-0` con un `<main>` como scroller propio, así que medirlo exige runtime contra ese elemento,
no contra el `body`.

**Qué cuesta reordenarla:**

- **Subir la cola: JSX puro, un archivo.** Todo el fetching ocurre en un solo `Promise.all` de cuatro
  queries antes del render (`page.tsx:33-88`), así que ninguna sección depende de otra para sus datos.
  Mover el bloque de la cola arriba de `<PipelineCockpit>` es reordenar elementos hermanos.
- **Separar los atascos del tablero: dos archivos.** El panel de atascos **no está exportado ni tiene
  superficie propia**: vive dentro de `<PipelineCockpit>` (`_components/pipeline-board.tsx`, 371
  líneas), que es una sola `<section>` con su propio borde y fondo, y su copy nombra su posición
  ("el tablero de arriba"). Bajarlo por debajo de la cola exige extraerlo del cockpit.

**Ninguna de las tres queries tiene `take`, paginación ni tope.** `page.tsx:33-88` trae todos los
dossiers `EN_REVISION`, todas las evaluaciones de leads asignados y todo el tramo en vuelo; y
`detectarAtascos` (`pipeline.ts:135-143`) devuelve el array completo, sólo ordenado. **El largo del
bloque de atascos es ilimitado por construcción.** **VERIFICADO [2 lecturas].**

**Hallazgo que no estaba en la pregunta: una demo en revisión hace más de 24 h se renderiza DOS veces en
la misma página.** El SLA de `EN_REVISION` es 24 horas (`pipeline.ts:56`), `detectarAtascos` corre sobre
un input que incluye `EN_REVISION` (`page.tsx:66`), y la cola es exactamente `stage: 'EN_REVISION'`
(`page.tsx:35`). Toda demo esperando veredicto más de un día aparece **como atasco y como ítem de la
cola**. Parte del bloque que entierra la tarea es la tarea misma. **VERIFICADO [2 lecturas].**

**Invariantes y tests: cero vigilan el orden.** Los tests de admin afirman visibilidad, no posición.

**¿Comparte componentes con el setter?** El cockpit no: es propio del admin. La página sí importa de
`@/components/ui`, que es compartido (ver A1b).

---

### A7 · Los 19 dictámenes de lectura estática

**Existen, y están en un solo documento.** `docs/verificacion-arranque-oslead-vii.md`, Bloque E: §E.1 es
el conteo (`:456`), §E.4 es la tabla (`:479-510`). Son el cubo "RESOLUBLE POR LECTURA" del triage de los
22 baches de `docs/manual-usuario/BACHES-RE-VERIFICADOS.md` — 22 = 19 + los 3 que exigen manejar la app.
**[2 lecturas]**

**El resultado del frente, y es el que importa: de los 19, CERO fueron resueltos por código posterior.
Los 19 siguen vivos** al commit de esta corrida. Sólo hay dos mitades cerradas: `B-P9` (el titular
"hace hace", arreglado por `c2160792`, anterior a la corrida que lo midió) y `B-A10` (F2 lo cierra sólo
para las vueltas anteriores; el rechazo vigente sigue sin fecha). **VERIFICADO.**

**Sobre "el método que erró 4 de 22": el plan lo cita al revés de como ocurrió.**
`plan-de-accion-v4.md` (A2, fila 5) descarta los 19 porque *"salieron de un método que erró 4 de 22"*.
El documento de origen dice otra cosa: hubo **dos** pasadas, y fue la **segunda, adversarial**, la que
cambió los 4 dictámenes (`verificacion-arranque-oslead-vii.md:449` y `:680`). **Los 19 publicados son el
resultado DESPUÉS de esa corrección, no la salida del método que erró.** Y tres de esos cuatro cambios
sacaron ítems del cubo de los 19; sólo uno (`B-P9`) quedó adentro. **VERIFICADO.**

**Caveat de mantenimiento:** las citas `archivo:línea` de cuatro dictámenes ya no apuntan a donde
apuntaban — F2 reescribió `flow.ts` y `[paso]/page.tsx`. La tabla sigue siendo válida en su dictamen,
no en sus coordenadas.

---

### A8 · La cuenta de leads en `EVALUADA`

**La regla de cero consultas a la base sigue vigente y no se levantó.** Lo que se hizo fue exprimir todo
lo verificable sin Postgres.

**Qué es.** `EVALUADA` es el segundo valor de `DossierStage` (`prisma/schema.prisma:1119`), creado de una
sola vez en `prisma/migrations/20260612121536_add_os_lead_dossier/migration.sql:2`. **Cero `RENAME`,
cero `ADD`, cero `DROP` posteriores sobre ese tipo.**

**Quién lo escribe.** Un solo productor en producción: `registrarEvaluacion`
(`dossier.actions.ts:145-148`) vía `transitionDossier` (`dossier.ts:162`), disparado desde una pantalla
viva (`m2-evaluador.tsx:131` → `evaluacion-form.tsx:117`). **El estado se sigue produciendo hoy; no es
histórico.**

**Y no tiene drenaje automático.** Las dos únicas salidas son `BRIEF` (gateada por respuesta o caliente)
y `DESCARTADA` (sólo en el mismo submit, score ≤ 2 con motivo). Ningún cron toca `stage`, y `PERDIDO` es
status, no stage: **un lead muerto se queda en `EVALUADA` para siempre.** Eso es lo que hace que el
número importe para el premortem del Evaluador.

**Cota inferior verificable sin base:** una base sembrada completa deja **18 leads** en `EVALUADA`, de
seis scripts productores. Todos abortan si `DATABASE_URL` no es la branch Neon de desarrollo, así que
**ninguna fila `EVALUADA` de producción puede venir de un seed**.

**La query ya está escrita y renderizada:** `/admin/leados` cuenta y muestra el total de `EVALUADA`
(`page.tsx:63-82` → `pipeline.ts:109-121` → `pipeline-board.tsx:270`). Es lo que Franco miraría, sin
correr nada.

**NO VERIFICADO — el conteo en producción.** Motivo: la regla de cero consultas a la base, y el repo no
contiene ningún dump del que derivarlo. Lo contestaría, sin correrlo:
`SELECT stage, COUNT(*) FROM "OsLeadDossier" GROUP BY stage;` — o directamente la tarjeta "Evaluada" de
`/admin/leados` apuntada a producción.

---

## 3 · PARTE B · Las cinco preguntas nuevas

---

### B1 · ¿A dónde va un lead `DESCARTADA` si `m2` desaparece?

**El hallazgo del reporte anterior es correcto al pie de la letra.** `manual.ts:519-522`:
`case 'DESCARTADA': return { actual: 'm2', habilitadas: [] }`. Y `manual.invariant.ts:90-92` lo afirma
con literales hardcodeados — **no hay falso verde acá**: el oráculo no deriva de la lista que vigila.
**[2 lecturas]**

**Y `m2` es doblemente terminal, que es lo que hace cara la fusión.** La misma pantalla es el destino de
`FICHA` con señal (`manual.ts:516`, `{ actual: 'm2', habilitadas: ['m2'] }`) **y** el terminal de
`DESCARTADA`. Fusionar `m1`+`m2` no elimina una pantalla: elimina una pantalla que cumple **dos**
funciones, y la decisión sólo contempla una. **VERIFICADO [2 lecturas].**

**¿Hay otra pantalla terminal candidata? Sí, y ya está cableada punta a punta.** `archivo` existe como
terminal (`manual.ts:501-502`, `{ actual: 'archivo', habilitadas: [] }`), y **ya sabe renderizar la causa
`descartado` con su `motivoDescarte`** (`archivo-manual.tsx:14-17`, `flow.ts:803-826`). Hoy sólo se
alcanza por `status === 'PERDIDO'`. Del lado de la cartera el descartado **ya vive** en
`archivo-descartado` (`flow.ts:787-793`). **La asimetría es que sólo el manual lo manda a `m2`.**
*(Se describe el estado; no se propone nada.)*

**Qué rompe el compilador y qué no — y acá el reporte anterior se equivoca en lo que más pesa.**

El reporte anterior afirma que sacar `m2` *"rompe el build… el compilador obliga a resolverlo"*
(`A3-VIABILIDAD-DECISIONES-2026-08.md:1002-1004`). **Es falso sobre el build:**

- `next.config.ts:31-32` declara `typescript: { ignoreBuildErrors: true }`. **[2 lecturas]**
- `npm run build` es `next build --webpack` (`package.json`), sin `tsc`.
- **No existe ningún script `tsc` / `typecheck` en `package.json`.** **[2 lecturas]**

**El único chequeo de tipos que corre en este repositorio es `ts-node` sin `--transpile-only`, dentro de
los invariantes** — y cubre sólo el grafo importable desde esos entrypoints: `manual.ts`,
`contracts.ts`, `flow.ts`, `paso.ts`, `turno.ts`. (Que es un chequeo real se prueba por contraste: el
único script que pide `--transpile-only` explícitamente es `seed:latency`.) **Todo
`src/app/(protected)/setter/**` queda fuera de cualquier chequeo de tipos.**

Con eso, la respuesta precisa:

| Operación | Qué pasa |
|---|---|
| Sacar `'m2'` de `PANTALLA_IDS` | 5 errores de tipo **dentro de `manual.ts`** → los atrapa `check:invariant:manual` (`ts-node`), **no el build** |
| Sacar el `case 'DESCARTADA'` | El never-guard de `manual.ts:604-607` **TIRA en runtime** y el setter ve el boundary "No se pudo abrir el manual de este lead" (`manual/error.tsx:40`) |
| Los usos de `'m2'` en `src/app/(protected)/setter/**` | **Nadie los atrapa.** Ni build, ni CI, ni invariante |

**Un lead `DESCARTADA` no queda huérfano en silencio dentro de `manual.ts`** —o falla un invariante, o
tira en runtime—. **Pero sí queda huérfano en silencio fuera de él.**

**Los tests E2E también fijan `DESCARTADA` → `m2` en vivo**, así que el cambio los pone en rojo además
del invariante.

**NO VERIFICADO — cuántos leads hay hoy en `DESCARTADA`.** Motivo: regla de cero consultas a la base.

---

### B2 · ¿Qué pasa con el rail de diez fases si `evaluacion` se fusiona en `ficha`?

**La premisa del encargo es correcta en su primera mitad y falsa en la segunda.**

**Correcta:** `FASES_MANUAL` existe, tiene exactamente diez entradas, y `evaluacion` es una
(`manual.ts:301-315`). Las diez, en orden: `ficha`→`m1` · `evaluacion`→`m2` · `opener`→`m4` ·
`seguimiento`→`m5` · `brief`→`m6` · `construccion`→`mc1`,`mc2` · `borrador`→`m13` · `chequeo`→`m14` ·
`envio`→`m15` · `agenda`→`m16`. **[2 lecturas]**

**Falsa:** el indicador "paso N de M" **NO cuenta sobre esa estructura de diez.** `indicadorDeFase`
calcula `m = fase.pantallas.length` — **por fase, nunca global**, y su propio docstring lo declara
contrato del mapa (`manual.ts:318-330`). Nueve de las diez fases tienen **una sola** pantalla; la única
con `m > 1` es `construccion` (m=2). Y la pantalla sólo renderiza el contador cuando `m > 1`. **O sea:
`evaluacion` es una de las nueve sin contador visible, y fusionarla no cambia ningún número en
pantalla.** **VERIFICADO.**

**Tampoco existe el "rail de diez fases" como cosa dibujada.** `FASES_MANUAL` tiene **un solo consumidor
de runtime en todo el repo**: `indicadorDeFase`. Las dos navegaciones reales son:

- `NavAtras` (`manual-nav.tsx:152-195`), que deriva de `posicion.completadas` — un subconjunto
  **variable**, que ni se renderiza si está vacío. **[2 lecturas]**
- `NavConstruccion` (`manual-nav.tsx:228-252`), dos chips de `PANTALLAS_CONSTRUCCION`.

**El riesgo de vaciado silencioso NO se dispara acá, y ésta es la distinción que las decisiones
confunden.** Hay **dos** listas de fases y son conjuntos disjuntos:

| Lista | Qué es | ¿Llave de datos persistidos? |
|---|---|---|
| `FaseManualId` / `FASES_MANUAL` (10) | Fases del manual — **presentación** | **NO** |
| `FASE_IDS` (6: `estructura`, `personalizacion`, `assets`, `cta`, `calidad`, `mobile`) | Checklist de Construcción | **SÍ** — `ProgresoSchema` las usa como `z.enum(FASE_IDS)` (`contracts.ts:160-165`) |

Fusionar `evaluacion` en `ficha` toca `FASES_MANUAL`, **no** `FASE_IDS`. **El progreso persistido no se
toca.** **VERIFICADO [2 lecturas].** *(El precedente del repo —achicar identificadores persistidos vacía
progreso en silencio— sigue siendo real, pero aplica a `FASE_IDS`, no a esta fusión.)*

**Lo que sí se rompe: `manual.invariant.ts:91-92`**, que afirma literalmente `actual === 'm2'` para
`DESCARTADA`. Es el mismo punto que B1.

**Y un falso verde encontrado de paso, verificado dos veces.** El único chequeo que dice vigilar el
"paso N de M" es **tautológico**: `pantallas-construccion.invariant.ts:96-101` compara
`[...FASES_MANUAL.construccion.pantallas]` contra `[...PANTALLAS_CONSTRUCCION]` — y `manual.ts:310`
asigna **el mismo objeto por referencia**. Esparcir dos veces el mismo array siempre da arrays iguales:
**esa aserción no puede fallar nunca.** **VERIFICADO [2 lecturas].**

---


### B3 · ¿`HardCheck.id` sirve como llave del match, en lugar de `nombre`?

*(Éste y B4 son los dos frentes que sí recibieron pasada adversarial dedicada. Los veredictos de abajo
son los que sobrevivieron a un agente cuyo único trabajo era tumbarlos.)*

**Sí existe `id`, y no, no alcanza: el `id` no está en el blob.**

- `HardCheck.id` existe en el **tipo** (`flow-content.ts:128-129`). **[2 lecturas]**
- **Son diez hard-checks, no seis.** Sus `id`: `carga`, `mobile`, `sinRelleno`, `linksWhatsapp`,
  `ctaClaro`, `datosReales`, `fielAlBrief`, `noPareceIa`, `textoDelNegocio`, `tonoDelNegocio`. **Los 10
  `id` son únicos y los 10 `nombre` también** — o sea que **la unicidad no discrimina entre las dos
  opciones**. **[2 lecturas]** *(Dos comentarios del repo quedaron viejos con el conteo de seis:
  `prompts-disenio.ts:121` y `flow-content.ts:164`.)*
- **Lo que se persiste es sólo `nombre`.** `SelfCheckSchema.itemsDuros[]` es exactamente
  `{ nombre: string, ok: boolean }` (`contracts.ts:124-132`), y el escritor lo confirma:
  `buildSelfCheck` hace `HARD_CHECKS.map(check => ({ nombre: check.nombre, ok: duros[check.id] === true }))`
  (`flow.ts:188-191`). **El `id` ya se usa como llave, pero sólo en memoria del formulario; nunca llega
  al blob.** **[2 lecturas]**
- `selfCheckAprobado` matchea por `nombre` (`flow.ts:204-208`), y **no hay otra ruta de aprobación**: el
  único consumidor server-side es `enviarARevision` (`dossier.actions.ts:391-397`).

**Por eso la pregunta no es "¿el `id` es estable?" sino "¿hay que crearlo en el blob?" — y la respuesta
es sí. Es CAMBIO DE SCHEMA del contrato Json, no un refactor de código.**

**La pregunta que decide el sprint: ¿toca blobs guardados? SÍ, y las dos variantes fallan distinto —
una ruidosa y una muda.**

| Variante | Qué pasa con los blobs viejos |
|---|---|
| `id` **requerido** | `parseSelfCheck` es `safeParse` con fallback a `null` (`flow.ts:122-125`): no tira, **devuelve `null`**. Y `null` enciende en el admin la copy *"Esta demo llegó a revisión sin self-check registrado"* (`dossier-panels.tsx:149-156`) **en toda demo histórica** |
| `id` **opcional** | El blob parsea, `item.id` queda `undefined` → el gate da `false` (`flow.ts:207`) y los diez tildes se re-hidratan vacíos (`chequeo-form.tsx:49-55`, que termina en `?? false`). **Sin error, sin log, sin flag de "blob legacy". Mudo.** |

**VERIFICADO.** Se buscó específicamente la salida de escape que salvaría el caso —`.passthrough()`,
`.strict()`, `.catchall()`, `.optional()`, `.default()`, `.nullable()`, try/catch— y **no existe ninguna**
en `SelfCheckSchema`. Con zod 3, `z.object` **descarta en silencio** las claves desconocidas: hoy es
imposible escribir el `id` al blob aunque se quisiera.

**¿Quién más matchea por `nombre`? Sólo dos sitios en producción** — el gate (`flow.ts:207`) y la
re-hidratación del formulario (`chequeo-form.tsx:51`). Se descartaron los sospechosos:
`promptParaHardCheck` matchea por **`id`** (`prompts-disenio.ts:151-155`), y `softFlags` matchea por
`etiqueta`, otro eje.

**Pero el radio de la explosión es mayor que dos.** `dossier-panels.tsx:165,172` usa `item.nombre` como
**`key` de React y como texto visible para el admin**; y hay **11 sitios fuera de `src/`** que hardcodean
`nombre` dentro del blob: `tests/helpers/setter-db.ts:60,77` · `self-check-gate.invariant.ts:30,47,78,91` ·
`scripts/dev/qa-manual-m5-m16.ts:82` · `scripts/v1-qa-wizard-states.ts:147` ·
`prisma/seed-agency-os.ts:909,976,1042`.

**Hallazgo lateral que nadie había reportado: los tres blobs del seed ya están rotos hoy.** Usan nombres
que no existen en `HARD_CHECKS` (`'Draft publica sin errores'`, `'Formulario de reserva funciona'`,
`'Galería carga correctamente'`), así que ya fallan `selfCheckAprobado` contra la lista vigente,
independientemente de esta migración. **VERIFICADO.**

**Sobre el invariante — el hallazgo original se CORRIGIÓ en la pasada adversarial.**
`self-check-gate.invariant.ts` deriva el 100% de sus fixtures de `HARD_CHECKS` en vivo (`:30,47,78,91`).
Pero **no pasa verde de entrada**: falla primero, en las dos variantes (con `id` requerido, los fixtures
literales no tipan; con `id` opcional, la aserción de `:42` revienta en runtime). **El falso verde es de
segundo orden:** aparece recién *después* de la edición mecánica y obvia —cambiar `nombre: check.nombre`
por `id: check.id` en las cuatro líneas—, y ahí sí las cinco aserciones pasan verdes **sobre blobs de
producción brickeados**, porque el invariante **no contiene ni un solo fixture con la forma legacy**.
La formulación correcta no es "el invariante no se entera", sino **"el invariante te obliga a un edit
trivial y después te aplaude"**.

*(Matiz sobre el gate: la pasada adversarial dedujo que el error de tipos lo atraparía `next build`. **No
lo atrapa** — `ignoreBuildErrors: true`, ver §4. Lo atrapa `ts-node` al correr el invariante, que es un
gate más angosto y manual.)*

---

### B4 · ¿`HomeGroupKey` alcanza para agrupar la cartera?

**`HomeGroupKey` existe y tiene exactamente cinco valores** (`flow.ts:318`): `trabajar`, `revision`,
`seguimiento`, `agendadas`, `archivo`. **[2 lecturas]** Y la clasificación **ya se calcula en el servidor
para todos los leads**, no sólo para los del foco: `buildHomeLeads` mapea la lista completa
(`home.ts:24-26`), `listOwnedLeads` no pagina ni filtra terminales, y la cartera recibe el `HomeLead`
**completo** con `grupo` adentro (`page.tsx:125` → `cartera-view.tsx:27`). **Cero query nueva, cero
clasificador nuevo.** Hasta ahí el enunciado del encargo se sostiene.

**Pero la respuesta a la pregunta central es NO: la cartera hoy NO usa esa partición. Renderiza una
lista plana — y la vista agrupada es inalcanzable desde la UI.**

Esto **refuta** una lectura intermedia de esta misma auditoría (el `OrdenCartera` incluye un valor
`'colas'` documentado como *"vista agrupada por defecto"*, `flow.ts:783`, lo que sugiere que ya agrupa).
Contra el código: **[2 lecturas]**

- `cartera-view.tsx:94-98` — una sola `<section aria-label="Tu cartera">` que hace `lista.map(...)`. **No
  hay grupos, ni encabezados de cola, ni `particionarCartera`.**
- `cartera-view.tsx:36` — **`orden === 'colas' ? 'urgencia' : orden`**: la vista agrupada está
  explícitamente **degradada** a un orden plano.
- `cartera-view.tsx:31` — el default es `'urgencia'`, no `'colas'`.
- `cartera-toolbar.tsx` — `ORDEN_OPCIONES` tiene cuatro entradas (`urgencia`, `reciente`, `antiguo`,
  `alfabetico`). **`'colas'` no está: es inalcanzable desde la UI.**
- `flow.ts:840,859` — `filtrarYOrdenarCartera` toma `Exclude<OrdenCartera, 'colas'>`: **la firma misma
  excluye la vista agrupada.**

**El comentario de `flow.ts:783` describe algo que no existe en ninguna superficie.** Y `lead.grupo`
tiene **cero consumidores de UI** en todo `src/`. **[2 lecturas]**

Hoy la partición se consume de dos maneras, y ninguna es agrupar la cartera: como **filtro** de una
lista plana (`vistaDeLead`, `flow.ts:865`) y como **fuente del foco** (`page.tsx:37-39`).

**Los dos defectos duros de la partición, si se la usara para agrupar:**

**(1) `HomeGroupKey.archivo` NO es el grupo CERRADOS que pide la decisión.** `grupoPara`
(`flow.ts:390-411`) tiene siete ramas y **ninguna es `status === 'CERRADO'`**, que es un estado real de
negocio (`reunion.actions.ts:29`). La pasada adversarial **corrigió** la consecuencia: el lead ganado
**canónico** —`{ status: 'CERRADO', stage: 'APROBADA', demoEnviada: true }`, la forma que el propio repo
fija en `manual.invariant.ts:96`— cae en **`seguimiento`**, no en `trabajar`. `trabajar` sí es alcanzable
por dos caminos vía `updateLeadStatus` del admin (`lead.actions.ts:96-108`), que escribe `status` **sin
guard de stage**: un `CERRADO` sobre un stage en construcción cae al fallthrough, y un `CERRADO` sobre un
`APROBADA` con follow-up residual cae por la rama 6.

**Versión correcta: falta la rama `CERRADO`, y por eso un lead ganado se reparte entre `seguimiento` (el
camino canónico) y `trabajar` (dos caminos vía admin) según stage y follow-up residual — y nunca cae en
`archivo`.** Que no caiga en archivo es deliberado en **otra** superficie: `manual.invariant.ts:19` dice
*"CERRADO (terminal GANADO) NO cae al archivo: es un cierre exitoso"*. **El manual lo decidió; el home
nunca se enteró.**

**(2) `trabajar` ≠ "TE TOCA A VOS": `grupo` y `accionable` los deciden dos funciones con precedencias
distintas, y discrepan.** Caso concreto, alcanzable:

> `status: 'POSTERGADO'` + `stage: 'EN_REVISION'` + `postergadoVencido: true`
> → `grupoPara` corta en `flow.ts:393` → **`grupo: 'revision'`**
> → `proximaAccionPara` corta en `flow.ts:452` → **`accionable: true`**, *"Se venció la postergación —
> retomá el contacto"*

**Un lead accionable que vive fuera de `trabajar`.** Tres consecuencias medibles:

1. **Nunca puede ser foco** (`page.tsx:39` saca el foco de `grupos.trabajar`).
2. **`page.tsx:51-52` afirma algo falso**: *"La partición ya garantiza que nada de acá es accionable"*.
   Ese lead entra a `enVuelo` con `accionPendiente: true`.
3. `particionarCartera` (`flow.ts:745-780`) **nunca lee `lead.accionable`** — ramifica sobre
   `lead.grupo === 'trabajar'`. Sus comentarios dicen "fijado ACCIONABLE" mientras el código dice
   `grupo`: **la equivalencia está asumida en la prosa, no en el código.**

**Y el repo documentó la evasión.** `flow.invariant.ts:28-33` explica que su fixture usa `stage: null`
*"a propósito"* porque *"un stage EN_REVISION/DESCARTADA se interceptaría antes"*. Esa frase es cierta
para `proximaAccionPara` y **falsa para `grupoPara`**, donde `EN_REVISION` sí intercepta: **el invariante
eligió el fixture que no pisa el caso donde las dos funciones se separan.**

**Falso verde confirmado en `particion.invariant.ts`:** no vigila exhaustividad ni disyunción. Su fixture
construye un `HomeLead` con `grupo` y `accionable` **puestos a mano**, nunca llama a `clasificarLead` ni
a `grupoPara`, y el único caso que mueve el eje los mueve **juntos**. **Es estructuralmente incapaz de
detectar esta divergencia.** **[2 lecturas]**

**Tercer defecto, sobre la agrupación misma: `particionarCartera().grupos` NO es exhaustiva.** Desvía
fijados y pausados **fuera** de `grupos` (`flow.ts:756-770`), así que agrupar la cartera con ella
**pierde leads**.

**Y la divergencia documental:** los dos documentos que sí existen dicen que la cartera se agrupa **por
turno**, en cuatro grupos (`decisiones-por-pantalla.md:444-451`, `plan-de-accion-v4.md:118`). El
enunciado `D-cartera-bis` que el encargo atribuye a la corrección **contradice la versión documentada**.
Ver §0.

---
### B5 · ¿Dónde puede vivir el documento de construcción?

**El techo existe, es uno solo, y lo impone la capa más profunda.**
`TEXTO_LIBRE_MAX = 5000` (`contracts.ts:22`), aplicado a `pegadoGem` por el alias `textoLibre`
(`contracts.ts:24-27`, `:119`). **[2 lecturas]**

**Las tres capas que podrían frenar NO coinciden — y ésta es la parte que la pregunta no anticipaba:**

| Capa | ¿Tope? |
|---|---|
| Textarea (`brief-form.tsx:152-157`) | **No** — sin `maxLength`, y `TextArea` no inyecta ninguno |
| Schema de input (`dossier.schemas.ts:57`) | **No** — `.min(1)` sin `.max`. Es el mismo schema que corre client-side y server-side |
| Contrato del blob (`contracts.ts:119`) | **Sí, 5.000** |
| Columna Postgres | **No** — `JSONB`, sin tope |

**Consecuencia:** el fallo llega recién al último eslabón (`BriefSchema.parse` en `dossier.ts:462`, que
**tira**) y el setter ve el genérico *"No se pudo guardar el brief"* — justo después de que el hint le
dijo *"Pegala entera, sin editar"* (`guidance-content.ts:463-466`). **VERIFICADO.**

**El "~7.000" del encargo NO está escrito en ningún documento.** Los documentos especifican **800-1.200
palabras** (`gem-de-diseno-paquete.md:303`, `decisiones-por-pantalla.md:226`); la cifra 7.000 sale del
propio reporte anterior (`A3-VIABILIDAD-DECISIONES-2026-08.md:206`), que la estima sin medir. **Y el
documento de construcción no existe escrito en ninguna parte**, ni en `docs/decisiones-oslead-vii/` ni
en el repo — así que no se puede contar. **NO VERIFICADO por medición directa.**

Lo que sí se midió: el ratio caracteres/palabra de la prosa castellana **de este mismo proyecto** es
**6,14-6,45**. A ese ratio, 5.000 caracteres topan en **~775-815 palabras** — o sea que el techo corta
**por debajo del piso** del rango especificado (800). Esto **corrige** al reporte anterior, que decía
*"el extremo alto no entra"* (`A3:615-616`): no entra prácticamente nada del rango salvo su borde
inferior, y las "mil palabras" que la propia decisión nombra ya se pasan ~25%.

---

**Las opciones reales, con su costo. NO se recomienda ninguna.**

**(a) Subir el techo de `textoLibre`. ¿A quién más afecta? A 19 sitios de campo en 5 schemas.**
`textoLibre` no es de `pegadoGem`: es el alias compartido de todo el texto libre del dossier —
`FichaSchema` 8 campos · `EvaluacionSchema` 1 · `BriefSchema` 5 · `RechazoSchema` 3 · `AgendaSchema` 2.
De esos 19, **13 no tienen ningún otro tope en ninguna capa**: subir la constante los deja sin
protección. Los que sí tienen tope propio aguas arriba son `donde` (280) y `arreglo` (2000) en
`revision.schemas.ts:40-49`, y `notasTraspaso` (2000) en `agenda.schemas.ts:27-34`. **VERIFICADO.**

**(b) Campo nuevo en `BriefSchema`.**
`BriefSchema` (`contracts.ts:112-120`) es `z.object()` plano, **sin `.strict()`** — con zod 3, las claves
desconocidas se descartan en silencio, no rechazan. Un campo nuevo **opcional** deja parsear los blobs
viejos sin migración. **Pero el costo real está en el camino de escritura:** `guardarBrief` hace
`const brief: Brief = input.data` (`dossier.actions.ts:204`) y `dossier.ts:462-466` escribe
`briefJson: parsed` — **sobrescritura total, sin merge**. Un campo que no viaje en el form se **borra**
en el próximo guardado. **VERIFICADO [2 lecturas].**

**(c) Columna nueva.**
Iría en `OsLeadDossier` (`prisma/schema.prisma:988-1020`), que ya aloja los seis blobs del flujo y tiene
el mismo ciclo de vida que el documento (uno por lead, cascade). Tipo `String? @db.Text` → `TEXT` en
Postgres, sin límite práctico. **Es aditiva y nullable, y hay precedente exacto en el mismo modelo:**
`escaladoNota String? @db.Text` (`schema.prisma:1013`), cuya migración
(`prisma/migrations/20260620180000_add_dossier_escalado/migration.sql:1-7`) es una `ALTER TABLE … ADD
COLUMN … TEXT;` con la nota explícita de que es aditiva y no toca datos. **VERIFICADO.**

**(d) Una cuarta que el encargo no nombra, y que ya está en producción.**
*(Se describe el estado del código, no se recomienda.)* El techo de 5.000 **no es uniforme ni dentro del
mismo blob**: `EvaluacionSchema.razonamiento` (`contracts.ts:96`) es `z.string().trim().min(1)` **sin
`.max`**, y su schema de input tampoco lo pone (`dossier.schemas.ts:26`). Ese campo guarda **hoy** texto
crudo pegado de una IA externa, dentro de un blob del mismo dossier, **sin techo en ninguna capa**.
Dentro del propio `BriefSchema`, `titulo` y cada string de `secciones` tampoco tienen `.max`.
**VERIFICADO.**

---

**Dos hallazgos colaterales del frente:**

1. **Las dos capas FIJAS del bloque de tres capas no existen en el código y pesan 4.407 caracteres.** La
   decisión de `mc1` define un bloque de tres capas donde la 1 y la 3 "las pone el producto"
   (`decisiones-por-pantalla.md:238-242`). Ninguna de las dos está en `src/` (se buscó `PISO DE CALIDAD`,
   `PROMPT BASE`, `one-page` → 0 hits). Medidas: prompt base 1.246 caracteres, piso de calidad 3.161.
   **Si el bloque armado se guardara en `pegadoGem`, las capas fijas solas se comerían el 88% del techo
   actual.** **VERIFICADO.**
2. **El bloque de `mc1` NO se corta con degradado a las ocho líneas.** La decisión lo afirma
   (`decisiones-por-pantalla.md:232`); contra el código es un `CopyBlock` cuyo `<pre>` lleva
   `max-h-56 overflow-y-auto` (`copy-block.tsx:62-71`) — 14rem **con scroll**, ni corte ni degradado. Se
   buscó el degradado con tres patrones sobre todo el árbol del setter → 0 hits. **VERIFICADO — la
   afirmación del documento es falsa.**

**Invariantes y tests: cero.** Ninguno de los 22 invariantes menciona `pegadoGem`, `BriefSchema` ni
`TEXTO_LIBRE_MAX`. El patrón invariante-sobre-contrato existe en el repo
(`progreso-isolation.invariant.ts:86-112` lo hace para `ProgresoSchema`) pero nunca se aplicó a
`BriefSchema`.

---

## 4 · EL HALLAZGO TRANSVERSAL — no hay ningún gate automático sobre este repositorio

No estaba en ninguno de los trece frentes. Salió al verificar B1 y **cambia cómo hay que leer toda
afirmación de "el compilador lo atrapa" o "el invariante lo vigila"**, en este reporte y en el anterior.
Verificado dos veces, de forma independiente.

**Los tres hechos:**

1. **El build no chequea tipos.** `next.config.ts:31-32`: `typescript: { ignoreBuildErrors: true }`.
   `npm run build` es `next build --webpack`. **Un error de tipos no rompe el build.**
2. **No existe ningún script de chequeo de tipos.** En `package.json` no hay `tsc`, `typecheck` ni
   `type-check`. El único `tsc` del proyecto es el que `ts-node` corre por dentro.
3. **El workflow que corre invariantes, tests y e2e está en una carpeta que GitHub Actions no lee.**
   La raíz del repositorio es `PorfolioDevelOP`. GitHub Actions sólo ejecuta workflows de
   `<raíz>/.github/workflows/`, y ahí hay **un solo archivo: `db-backup.yml`**. El workflow que corre
   `check:invariants`, `test:leados` y `test:e2e` vive en **`logic-core-v3/.github/workflows/e2e.yml`**
   — un `.github` **anidado**. `git ls-files | grep workflows/` devuelve exactamente esos dos archivos,
   en esas dos ubicaciones.

**Lo que se sigue de esto, con precisión:**

- **Los 22 invariantes existen y funcionan.** No se está diciendo que sean decorativos: son reales y
  atrapan lo que dicen atrapar. Lo que se está diciendo es que **corren sólo si alguien los corre a
  mano**.
- **El único chequeo de tipos efectivo es `ts-node` sin `--transpile-only` dentro de los invariantes**, y
  su alcance es el grafo de módulos importable desde esos entrypoints: `manual.ts`, `contracts.ts`,
  `flow.ts`, `paso.ts`, `turno.ts`. (Que `ts-node` sí chequea se prueba por contraste: el único script
  que pide `--transpile-only` explícitamente es `seed:latency`.)
- **Todo `src/app/(protected)/setter/**` y `src/app/(protected)/admin/**` queda fuera de cualquier
  chequeo de tipos, automático o manual.** Son, justamente, los árboles donde vive el 100% de lo que el
  bloque C4 propone tocar.

**NO VERIFICADO:** si el repositorio tiene alguna protección de rama, check requerido o automatización
externa a `.github/` (por ejemplo del lado del proveedor de deploy). Motivo: no es derivable del código
y esta corrida no consulta servicios externos.

---

## 5 · Errores del reporte anterior que esta corrida encontró

Se buscaron activamente, como pedía el encargo. **Seis, todos con evidencia.**

**5.1 · "El compilador obliga a resolverlo" — falso sobre el build.**
`A3-VIABILIDAD-DECISIONES-2026-08.md:1002-1004` dice que sacar `'m2'` de `PANTALLA_IDS` *"rompe el
build"* y que *"eso juega a favor: el compilador obliga a resolverlo"*. **Los cinco errores de tipo que
enumera existen, pero `npm run build` pasa igual** (`ignoreBuildErrors: true`). Lo que realmente los
atrapa es `ts-node` dentro de `check:invariant:manual` y `check:invariant:pantallas` — un gate distinto,
**más angosto** (no cubre `src/app/**`) y que el reporte anterior no nombra. Ver §4. **[2 lecturas]**

**5.2 · "La cartera ya tiene su propia partición, y es `HomeGroupKey`" — falso.**
`A3 §1.4`. La cartera **no** usa `HomeGroupKey` para agrupar: usa `VistaCartera` (7 valores,
`flow.ts:787`) para su filtro de estado, y renderiza una **lista plana**. `lead.grupo` tiene **cero
consumidores de UI** en todo `src/`. `HomeGroupKey` es la partición del **foco**
(`setter/page.tsx:39,54-56`), no de la cartera. **[2 lecturas]**

**5.3 · "Hay dos taxonomías compitiendo" — son cuatro.**
`A3 §1.4` dice que conviven `Turno` (3) y `HomeGroupKey` (5), y que la decisión introduce una tercera de
4. Ya conviven **cuatro**: `Turno` (3, `turno.ts:33`), `HomeGroupKey` (5, `flow.ts:318`), `VistaCartera`
(7, `flow.ts:787` — la que de verdad usa la cartera) y `CarteraParticion` = grupos + fijados + pausados
(`flow.ts:711-723` — la que usa el foco). La decisión sería la **quinta**.

**5.4 · "`HardCheck.id` es estable y ya se usa como llave de mapeo" — matiz fuerte.**
`A3:1122`. `id` existe (`flow-content.ts:129`), pero **no es llave de nada persistido**:
`SelfCheckSchema.itemsDuros[]` es exactamente `{ nombre, ok }` (`contracts.ts:124-133`). Y de las tres
superficies en que el reporte anterior apoya el "ya se usa", **una está muerta**: `guidance-content.checkId`
se declara (`guidance-content.ts:117-121`) dentro de `selfCheckRazones` (`:221`) y **no tiene ningún
consumidor ni se puebla en ninguna parte del repo** — `grep -rn "selfCheckRazones\|checkId" src/`
devuelve sólo esas tres líneas de declaración. **[2 lecturas]**

**5.5 · "El extremo alto no entra" — el techo corta más abajo de lo que dice.**
`A3:615-616`. Medido contra la prosa castellana real del proyecto (ratio 6,14-6,45 caracteres por
palabra), 5.000 caracteres topan en ~775-815 palabras: **no entra prácticamente nada del rango
800-1.200 especificado, salvo su borde inferior**. Ver B5.

**5.6 · "El censo de 22 no es derivable" — está registrado en el repo.**
`A3 §P6.4` (`:1041-1042`) lo da como NO VERIFICADO porque no se consultó la base. La segunda mitad es
cierta respecto del código, pero **el número está escrito en el repositorio**:
`docs/diagnostico-visual-admin-2026-08/MANIFIESTO.md:29` dice "EVALUADA 22", dentro de un reparto de los
8 stages que cierra contra dos lecturas independientes (13+22+4+15+13 = 67, el "67 en producción" y el
"61 atascadas de 67" de `observaciones-admin-tanda-1.md:22,46`). **Lo que sigue NO VERIFICADO es el
conteo de PRODUCCIÓN** — ese 22 es de la base DEV/QA.

---

## 6 · Lo que esta corrida NO auditó

Se listan para que no se lean como "verificado y sin hallazgos".

1. **La refutación adversarial dedicada corrió sólo sobre B3 y B4.** No corrió sobre A1a, A1b, A2, A3,
   A4, A5, A6, A7, A8, B1, B2 ni B5 — los once agentes de refutación murieron con el límite de sesión y
   no se relanzaron todos. En esos frentes, la refutación es la que cada uno hizo sobre sí mismo (era
   obligatoria y está registrada) más la verificación independiente del padre donde se marca **[2
   lecturas]**. **Rindió: de los seis hallazgos que sí pasaron por refutación dedicada, dos se
   corrigieron** (B3-3 y B4-1), y la pasada además **refutó una lectura intermedia del propio padre**
   (que la cartera ya agrupaba).
2. **`correccion-decisiones-vs-A3.md`.** No existe en el repositorio. Todo lo que el encargo le atribuye
   se trató como enunciado del encargo. **No se pudo verificar si la corrección dice lo que se le
   atribuye, ni si corrigió algo más.** Ver §0.
3. **Todo runtime.** No se corrió build, ni tests, ni invariantes, ni servidor, ni navegador. Las
   afirmaciones sobre CSS y montaje son lectura de JSX: que una barra `sticky bottom-0` funcione dentro
   del `<main>` del shell `fixed inset-0`, o que un `<details open>` controlado no rompa hidratación,
   **no está probado**.
4. **Los píxeles del admin** — el "9% sin scrollear" y los "~6.000 px". Sin navegador, y no hay ningún
   literal de píxeles en el código. Lo verificado es el **orden del DOM** y la **ausencia total de tope**
   en las queries.
5. **Todo conteo de filas en producción** — leads en `EVALUADA`, en `DESCARTADA`, blobs de self-check con
   forma vieja, atascos reales. Regla de cero consultas a la base, y el repo no contiene ningún dump del
   que derivarlos.
6. **Protecciones de rama o checks del proveedor de deploy.** El §4 afirma que no hay gate en
   `.github/workflows/` ni en `package.json`; **no es derivable del código** si existe alguna
   automatización externa.
7. **Frecuencia operativa** de los casos alcanzables de B4-1 y B4-2. Se probó que las combinaciones son
   construibles por las actions del admin sin guard de stage; **no si ocurren de hecho**.
8. **Los tres baches que "exigen manejar la app"** (`B-B11`, `B-C3/C4/C5`, `B-C8`). Siguen sin dictamen
   por el mismo motivo que en la corrida original: ninguna lectura estática los arbitra.

---

## 7 · Verificación de no contaminación

Diff completo contra el commit de arranque (`8e6c3c3d`), en el worktree de trabajo, antes de commitear:

```
$ git status --porcelain
?? logic-core-v3/docs/auditorias/A3-VIABILIDAD-BIS-2026-08.md
?? logic-core-v3/docs/diagnostico-visual-2026-08/png.zip

$ git diff --stat 8e6c3c3d
(sin salida)
```

**Cero `src/`. Cero tests. Cero configuración. Cero `prisma/`.** Lo único que esta corrida escribe es
este archivo y su entrada de bitácora. El `png.zip` de `docs/diagnostico-visual-2026-08/` ya estaba sin
commitear al arrancar —lo declaró también la corrida anterior—, no es de esta sesión y no se tocó.

Los ocho documentos de decisiones viven **sin commitear** en el checkout de `main`
(`C:/Users/franc/Desktop/PorfolioDevelOP/docs/decisiones-oslead-vii/`): se leyeron desde ahí y desde una
copia de sólo lectura en el scratchpad. **No se modificó ninguno, y no se agregaron al índice de git.**

---

*A3-BIS · segunda pasada de la auditoría externa · `leados/v1-integracion` @ `8e6c3c3d` · agosto 2026.*
*Cierra los ocho frentes del §9 y las cinco preguntas nuevas. El paso 2 —la revisión adversarial del*
*diseño, sin código— sigue sin correrse.*
