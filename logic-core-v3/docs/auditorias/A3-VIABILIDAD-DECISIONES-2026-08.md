# A3 · VIABILIDAD DE LAS DECISIONES DE OSLead VII CONTRA EL CÓDIGO
### Paso 1 de la auditoría externa · read-only · agosto 2026

> **Qué es.** La respuesta a lo único que la capa de planificación no puede saber: qué de lo decidido
> no se puede construir sobre este código, qué cuesta más de lo que las decisiones asumen, y qué ya
> está construido y nadie lo sabe.
>
> **Qué NO es.** No hay ni una propuesta acá. No se diseña, no se prioriza, no se estima plazo, no se
> dice qué habría que hacer. Eso es el paso 2 y no se corrió en esta sesión.
>
> **Cómo leerlo.** Cada afirmación va marcada **VERIFICADO** (con `archivo:línea`) o **NO VERIFICADO**
> (con el motivo). No existe "probablemente". Si una decisión está bien, no aparece: el reporte es de
> obstáculos y costos.

---

## 0 · Terreno y método

**Base.** Rama `leados/v1-integracion`, commit **`58a383f7`** (`docs(diagnostico): las primeras 52
capturas del lado de Franco`). Worktree `C:/tmp/wt-v1-integracion`, app en `logic-core-v3/`.

**Working tree al arrancar.** Limpio salvo un archivo ajeno sin commitear:
`logic-core-v3/docs/diagnostico-visual-2026-08/png.zip` (untracked). **No se tocó.**

**Invariantes.** `npm run check:invariants` corre 22 chequeos. **Los 22 dan VERDE hoy.** Ninguno toca
la base (se verificó que ningún `*.invariant.ts` importa Prisma). Sus nombres, en orden de corrida:

`assignment-trail` · `setter-meta` · `escalamiento` · `novedades` · `mis-numeros` · `timeline` ·
`foco` · `particion` · `flow` · `alta-propia` · `prospecto-import` · `gate-envio-demo` ·
`self-check-gate` · `progreso-isolation` · `reloop-selfcheck-reset` · `manual` ·
`pantallas-construccion` · `turno` · `postergacion` · `contador-dms` · `acuse-recibo` ·
`idor-tokens (security)`

**Cero operaciones sobre la base.** El esquema se leyó de `prisma/schema.prisma` y de
`prisma/migrations/`, nunca de Postgres.

### Techo declarado de esta corrida

El plan preveía paralelizar por ejes (`ultracode`). **El fan-out se lanzó y murió entero**: los nueve
agentes cayeron a la vez con `session limit`. La auditoría se rehízo en una sola pasada secuencial.
Eso cambia la cobertura, y el techo se declara en vez de disimularse:

**Cubierto con evidencia**: el chequeo final y el self-check · el brief, `mc1`/`mc2` y el progreso
persistido · la ficha y su gate · el premortem del Evaluador · el ángulo wow y los tres mensajes ·
`turno.ts` · el asistente de alta de cliente · el audit log, las alertas y el reporte semanal · el
aislamiento · el mapa invariante↔decisión · los precedentes de migración de enums.

**NO cubierto, y por lo tanto sin dictamen** (§9): el censo de archivos del sistema de interacción
`S1`–`S8` · el conteo de plegables de la regla de municiones · el layout de la cola de revisión del
admin · el dedup novedades↔foco · la persistencia de estado de disclosure (G8) · el detalle de
`m16`/Cal.com más allá de `getCalConfigLeadOS` · los 19 dictámenes de lectura estática.

---

## 1 · VEREDICTO

**1 · ¿Cuántas decisiones no se pueden construir como están escritas? — DIEZ.**

| # | Decisión | Contra qué choca |
|---|---|---|
| 1 | **El tercer estado del chequeo** (`m14`) | `SelfCheck.itemsDuros[].ok` es `z.boolean()`. Cambiar el tipo hace que **todo blob guardado deje de parsear** |
| 2 | **El encabezado etiquetado que el producto lee** (`m6`→`m13`/`m14`) | `BriefSchema` no tiene `ANGULO`/`TONO`/`PALETA`/`TIPOGRAFIA`, y **no existe ningún parser de texto pegado en el repo** |
| 3 | **`mc1` a un tilde y `mc2` a cinco** | Cambia `FASE_IDS`, que es la **llave del progreso persistido**. Borrado silencioso todo-o-nada |
| 4 | **La cartera agrupada por turno en cuatro grupos** | `turno.ts` tiene **tres** turnos y mete los terminales dentro de `franco`. El cuarto grupo (`CERRADOS`) no existe |
| 5 | **El campo libre de "La primera mirada"** | `SelfCheckSchema` es un `z.object` cerrado de dos claves. No hay dónde |
| 6 | **El check falsamente verde en el rechazo** (G4) | `RechazoSchema` no tiene `checkId`. La infraestructura que los documentos dan por existente **es otra cosa** (§8·A) |
| 7 | **Las alertas de LeadOS** | `BotAlert.botConfigId` es **FK requerida a `BotConfig`**. Una alerta de setter no tiene bot |
| 8 | **El reporte semanal para el setter** (G6) | `WeeklyReportLog` está clavado a `organizationId` con FK requerida. Un setter es un `User` |
| 9 | **"Al final de la lista"** (el corte de los diez minutos) | No hay campo ni mecanismo de despriorización. Ni en `OsLead`, ni en `OsLeadSetterMeta`, ni en `DossierStage` |
| 10 | **El historial que registre el trabajo** (C3) | `OsLeadActivity` tiene dos escritores y su filtro comercial es **negativo**: un canal nuevo cuenta como contacto y rompe el opener y la cadencia |

**2 · ¿Cuántos cambios de schema implica el conjunto? — CATORCE: siete aditivos y siete destructivos.**
El detalle está en §3. Los siete destructivos son la parte que decide Franco.

**3 · ¿Alguna decisión toca el aislamiento por setter? — NO, ninguna lo relaja directamente.**
Dos lo tocarían de rebote si se construyeran sobre los modelos que existen: el reporte semanal y las
alertas agregan **por organización**, no por setter, y una lectura agregada que cruza setters es una
fuga aunque la consulta original filtre bien. El mecanismo de aislamiento
(`ownedLeadWhere` / `ownedListWhere`, `isolation.ts:26-36`) está intacto y ninguna decisión auditada
lo modifica.

**4 · ¿Cuál es el bloque más caro y por qué? — C4, el esqueleto de interacción.**
Y es más caro que lo presupuestado, porque el presupuesto se apoya en una afirmación falsa. Los
documentos dicen que *"el componente de pasos, la barra de progreso y el autoguardado ya viven en el
repo"* y que *"no hay que inventarlo, hay que extenderlo"*. Contra el código: **lo reutilizable son 32
líneas** (`ProgressBar.tsx`). El "componente de pasos" es un despacho JSX de cinco ramas fijas sin una
sola prop, y el "autoguardado" es un borrador de `localStorage` con **una clave global hardcodeada**,
tipado al alta de cliente, que no toca ni el servidor ni la base. Detalle en §5·A.

**5 · ¿Cuántas decisiones ya estaban construidas? — DIEZ.** Entre ellas la marca de caliente **con su
gate ya cableado**, `soltarFoco` (construido, cero llamadores), el audit log genérico, y —la más
importante para el premortem— **`EVALUADA` ya no tiene pantalla propia**: `m2` es la pantalla del
stage `FICHA`. Lista en §6.

**6 · ¿Sacar el Evaluador es reversible? — Depende de cuál de las dos cosas se saque, y las
decisiones no distinguen entre ellas.**

- **Sacar la pantalla `m2`**: **SÍ, reversible**. Es código, y está protegido por el compilador: los
  `switch` de `paso.ts` y `manual.ts` son exhaustivos por stage y no compilan hasta contemplar el
  cambio. Un revert lo deshace.
- **Sacar el valor `EVALUADA` del enum `DossierStage`**: **NO, sin recrear el tipo.** Postgres no
  tiene `ALTER TYPE … DROP VALUE`. En las migraciones del repo hay **diecinueve `ADD VALUE` y un
  `RENAME VALUE`; cero borrados de valor**. Los únicos `DROP TYPE` son de tipos enteros ya sin filas.
  El camino de vuelta exige restaurar datos, y el estado del backup queda **NO VERIFICADO** desde el
  código.

---

## 2 · P1 · Lo que no se puede construir sobre este código

### 1.1 · El tercer estado del chequeo final vacía el self-check de toda demo histórica

**HALLAZGO.** El self-check no vive en una columna booleana: vive en `OsLeadDossier.selfCheckJson`
(`Json?`) con un contrato cerrado donde cada ítem es `{ nombre: string, ok: boolean }`. El paso de
`ok` booleano a un estado de tres valores es un cambio de contrato dentro del Json, no una migración
de Postgres — pero **todo blob ya guardado deja de parsear**, y el parse es tolerante: devuelve `null`
sin error y sin registro. La consecuencia visible cae en el admin: `SelfCheckPanel` tiene una rama
`exigible` que, con el self-check en `null` y el lead en `EN_REVISION`/`APROBADA`, muestra
*"Esta demo llegó a revisión sin self-check registrado. El flujo normal no lo permite — revisala con
más cuidado antes de aprobar."* Es decir: **el día que se despliega el tercer estado, el panel de
Franco acusa a todas las demos históricas de haber llegado sin chequeo.**

**EVIDENCIA**
- `src/lib/leados/contracts.ts:124-133`
  ```ts
  export const SelfCheckSchema = z.object({
    itemsDuros: z.array(
      z.object({
        nombre: z.string().trim().min(1),
        ok: z.boolean(),
      }),
    ),
    softFlags: z.array(z.string().trim().min(1)),
  })
  ```
- `src/lib/leados/flow.ts:122-126` — el parse tolerante:
  ```ts
  export function parseSelfCheck(json: unknown): SelfCheck | null {
    const parsed = SelfCheckSchema.safeParse(json)
    return parsed.success ? parsed.data : null
  }
  ```
- `src/app/(protected)/admin/leados/[leadId]/_components/dossier-panels.tsx:149-158` — la rama que se
  enciende con `null`:
  ```tsx
  {!selfCheck ? (
    exigible ? (
      <Callout tone="danger" icon={AlertTriangle}
        title="Esta demo llegó a revisión sin self-check registrado.">
        El flujo normal no lo permite — revisala con más cuidado antes de aprobar.
      </Callout>
  ```
- `src/app/(protected)/admin/leados/[leadId]/page.tsx:81` — `const selfCheck = parseSelfCheck(dossier.selfCheckJson)`
- `src/lib/leados/dossier.ts:362` — el camino de escritura sí es estricto: `SelfCheckSchema.parse(selfCheck)`

**REFUTACIÓN INTENTADA.** Busqué un backfill, una migración de blobs o una rama de compatibilidad que
aceptara las dos formas: `grep -rn "selfCheckJson|SelfCheckSchema" src/` devuelve **seis** puntos de
uso y ninguno tolera dos shapes. Busqué si el schema es abierto (`.passthrough()`, `z.record`,
`.catchall`) — es un `z.object` estricto de dos claves. Busqué si `parseSelfCheck` tiene fallback a
un default como su hermano `parseProgreso` — no lo tiene: `parseProgreso` devuelve
`{ completadas: [] }` (`flow.ts:134-135`), `parseSelfCheck` devuelve `null`. Y verifiqué que la rama
`exigible` es alcanzable de verdad: `page.tsx:81` la alimenta con el dossier real.

**DECISIÓN QUE TOCA.** `decisiones-por-pantalla.md` → `m14` → "Tres estados por punto, no dos".
`plan-de-accion-v4.md` §2·C7 y §3 (ya marcada como premortem obligatorio).

**COSTO.** Archivos: 4 (`contracts.ts`, `flow.ts`, `flow-content.ts`, `chequeo-form.tsx`) más el panel
del admin · **schema SÍ** (contrato de blob, destructivo de datos) · invariante: `self-check-gate`
existe pero **da falso verde** (§4·B) · patrón existente: **no** — no hay ningún precedente de
migración de blob en el repo.

---

### 1.2 · El encabezado etiquetado: el producto hoy no lee texto pegado en ningún lado

**HALLAZGO.** La decisión dice que el documento de la fase 4 arranca con `ANGULO:` `SECCIONES:` `CTA:`
`TONO:` `PALETA:` `TIPOGRAFIA:` y que **el producto lee ese encabezado** para mostrar *"El brief
pedía: Hero · Qué ofrecen…"* en `m13` y `m14`. Contra el código: `BriefSchema` tiene siete campos y
**ninguno** es tono, paleta, tipografía ni ángulo (`concepto` es lo más cercano). El texto crudo del
Gem se guarda entero en `pegadoGem`, que es `textoLibre` con techo de 5.000 caracteres, y **nadie lo
parsea**: viaja tal cual al bloque de construcción. No hay en el repo ninguna función que extraiga
campos de un texto pegado.

**EVIDENCIA**
- `src/lib/leados/contracts.ts:107-115`
  ```ts
  export const BriefSchema = z.object({
    titulo: z.string().trim().min(1),
    concepto: textoLibre,
    secciones: z.array(z.string().trim().min(1)),
    notasMarca: textoLibre,
    cta: textoLibre,
    referenciasFicha: textoLibre,
    pegadoGem: textoLibre, // B3: respuesta cruda del Gem de diseño, tal como la pegó el setter
  })
  ```
- `src/lib/leados/contracts.ts:22-28` — el techo de `textoLibre` es 5.000 caracteres
  (`const TEXTO_LIBRE_MAX = 5000`).
- `src/lib/leados/copy-blocks.ts:241` — `pegadoGem` se re-sirve entero, sin tocar:
  `seccion('BRIEF COMPLETO DEL GEM DE DISEÑO', brief.pegadoGem)`

**REFUTACIÓN INTENTADA.** Busqué un parser con varios nombres antes de aceptar el "no existe":
`grep -rn "ANGULO|SECCIONES:|parseEncabezado|parseBloque|extraerCampos" src/lib/leados/` — nada.
Busqué si `m13`/`m14` ya muestran algo del brief que pudiera venir de ahí: el único consumo
estructurado es `brief.secciones` (array, cargado a mano campo por campo) y `brief.concepto`. Busqué
si el techo de 5.000 caracteres invalidaría el documento definitivo: 1.200 palabras rondan los 7.000
caracteres **y ahí sí falla**, lo que es un segundo hallazgo del mismo campo (ver §3, delta 15).

**DECISIÓN QUE TOCA.** `decisiones-por-pantalla.md` → `m6` → punto 3 "El encabezado etiquetado mata la
doble transcripción". `gem-de-diseno-paquete.md` §4·P3.

**COSTO.** Archivos: `contracts.ts` + el formulario de `m6` + los dos consumidores (`m13`, `m14`) ·
**schema SÍ** (aditivo si son campos nuevos; el parseo del texto es código) · invariante: **NINGUNO —
hueco** · patrón existente: **hay que inventarlo**.

---

### 1.3 · `mc1` a un tilde y `mc2` a cinco cambia la llave del progreso persistido

**HALLAZGO.** Las fases de construcción son seis y sus ids son la llave del progreso guardado. El
código lo dice con todas las letras y se cuidó para que **reagrupar pantallas** fuera seguro
*justamente porque la lista de fases no se toca*. La decisión sí la toca: `mc1` pasa de tres fases a
un tilde y `mc2` de tres a cinco. Los ids nuevos (texto, estética, motion, celular, verificación) no
son los actuales (`cta`, `calidad`, `mobile`). Y `ProgresoSchema` valida `completadas` contra un
`z.enum(FASE_IDS)`: un `progresoJson` guardado con ids viejos **no parsea**, y el parse **no falla: se
vacía**. Todo o nada, sin error, sin registro, sin backfill.

**EVIDENCIA**
- `src/lib/leados/contracts.ts:136-146`
  ```
  * IDs ESTABLES de las fases de la Construcción — la llave del progreso
  * persistido. id-keyed a propósito (NO índices): reordenar o reetiquetar
  * `SHELL_CONSTRUCCION` (flow-content.ts) NO corrompe un progreso ya guardado.
  export const FASE_IDS = ['estructura','personalizacion','assets','cta','calidad','mobile'] as const
  ```
- `src/lib/leados/contracts.ts:157` — `completadas: z.array(z.enum(FASE_IDS)).default([])`
- `src/lib/leados/flow.ts:133-136` — el vaciado silencioso:
  ```ts
  export function parseProgreso(json: unknown): Progreso {
    const parsed = ProgresoSchema.safeParse(json)
    return parsed.success ? parsed.data : { completadas: [] }
  ```
- `src/lib/leados/manual.ts:129-131` — la salvedad que el código se dio, y que esta decisión no cumple:
  ```
  * N:1 a propósito: varias fases pueden compartir pantalla (P6-B agrupó las seis
  * fases en dos pantallas). La lista de fases (`FASE_IDS`, llave del progreso
  * persistido) NO se toca al reagrupar: sólo cambian los valores de esta tabla.
  ```
- `src/lib/leados/manual.ts:132-141` — el reparto actual: `mc1` = estructura·personalizacion·assets,
  `mc2` = cta·calidad·mobile.

**REFUTACIÓN INTENTADA.** Probé que la decisión pudiera implementarse sin tocar `FASE_IDS`: `mc1` a
"un tilde" es compatible con conservar las tres fases, porque `completadasDe` **ya** marca una pantalla
completa sólo cuando todas sus fases lo están (`manual.ts:453-459`) — ahí la decisión sería puramente
de presentación y costo cero de datos. Pero `mc2` a **cinco** tildes no tiene esa salida: cinco es
mayor que las tres fases que existen, así que la lista crece sí o sí; y los cinco prompts nuevos no
mapean sobre `cta`/`calidad`, que quedarían huérfanos. **Las decisiones no declaran cuál de los dos
caminos es**, y sólo uno de los dos es destructivo. Busqué también un backfill o versionado de
`progresoJson` (`grep -rn "progresoJson" src/`, `ls prisma/migrations | grep progreso`): existe
`20260630000000_add_dossier_progreso`, que **agrega la columna** y no migra nada.

**DECISIÓN QUE TOCA.** `decisiones-por-pantalla.md` → `mc1` → "Un tilde, no tres" y → `mc2` → "Cinco
fases, cinco tildes". `mc2-prompts-refinamiento.md`, "Lo que cambia en la pantalla".

**COSTO.** Archivos: `contracts.ts`, `manual.ts`, `flow-content.ts`, los dos invariantes,
`fase-auto-reporte.tsx`, `m-construccion.tsx` · **schema SÍ** (contrato de blob; **destructivo** en el
camino de `mc2`) · invariantes: `pantallas-construccion` y `progreso-isolation` **dan falso verde**
(§4·A) · patrón existente: **no**.

---

### 1.4 · `turno.ts` tiene tres turnos y mete los terminales adentro de "Franco"

**HALLAZGO.** La decisión de la cartera dice que el turno *"es un concepto que el producto ya tiene y
no usa acá"* y pide **cuatro** grupos: `TE TOCA A VOS` / `LE TOCA AL NEGOCIO` / `LE TOCA A FRANCO` /
`CERRADOS`. El tipo `Turno` tiene **tres** valores y no hay ninguno terminal. Peor: los terminales
están deliberadamente absorbidos por `franco` — un lead `DESCARTADA` y un lead con status de cierre
devuelven `'franco'`. Agrupar la cartera por `turnoDelLead` tal cual pondría los negocios cerrados
bajo *"Le toca a Franco — está de este lado y va a salir"*, que es exactamente lo contrario de lo que
pasó.

**EVIDENCIA**
- `src/lib/leados/turno.ts:33` — `export type Turno = 'negocio' | 'franco' | 'setter'`
- `src/lib/leados/turno.ts:70-86` — la derivación, con los terminales cayendo en `franco`:
  ```ts
  if (STATUS_DE_FRANCO.includes(input.status)) return 'franco'
  if (input.stage === 'DESCARTADA') return 'franco'
  if (input.stage === 'EN_REVISION') return 'franco'
  ...
  if (input.accionPendiente) return 'setter'
  return 'negocio'
  ```
- `src/lib/leados/turno.ts:107-126` — `TEXTO_TURNO.franco.detalle`: *"Está de este lado y va a salir:
  es cuestión de tiempo, no de suerte."*
- **La cartera ya tiene su propia partición, y es otra**: `src/lib/leados/flow.ts:318` —
  `export type HomeGroupKey = 'trabajar' | 'revision' | 'seguimiento' | 'agendadas' | 'archivo'`
  (cinco grupos, con `archivo` como el terminal real).

**REFUTACIÓN INTENTADA.** Busqué un cuarto turno con otro nombre (`grep -n "cerrado|terminal|CERRAD"
src/lib/leados/turno.ts`) — no hay. Busqué si `turnoDelLead` ya se usa en la cartera:
`grep -rn "turnoDelLead" src/` da cuatro llamadores —`setter/page.tsx:60`,
`manual/[paso]/page.tsx:125`, `m15-envio.tsx:110`, `flow.ts:439`— y **ninguno agrupa una lista**: los
cuatro derivan el rótulo de **un** lead. Dos de ellos además pasan `accionPendiente: false` fijo
(`flow.ts:439`, `m15-envio.tsx:110`), así que en esos call-sites el turno `setter` es inalcanzable por
construcción. `turno.invariant.ts` recorre 432 combinaciones y afirma exactamente tres turnos.

**DECISIÓN QUE TOCA.** `decisiones-por-pantalla.md` → PARTE 2 → "La cartera". `brief` §9 #10.

**COSTO.** Archivos: `turno.ts`, `turno.invariant.ts`, `flow.ts` (`HomeGroupKey`, `particionarCartera`),
`particion.invariant.ts`, el componente de cartera · schema no · invariante: `turno` lo vigila y
**rompería en rojo** si se agrega un turno (el mapa de textos es exhaustivo), lo cual acá juega a
favor · patrón existente: **hay dos taxonomías compitiendo** (`Turno` de 3 y `HomeGroupKey` de 5); la
decisión introduce una tercera de 4.

---

### 1.5 · El campo libre de "La primera mirada" no tiene dónde vivir

**HALLAZGO.** `SelfCheckSchema` es un `z.object` cerrado con exactamente dos claves (`itemsDuros`,
`softFlags`). Un campo de texto libre —*"¿Qué es lo primero que te llamó la atención?"*— no entra sin
sumar una clave al contrato. Es aditivo y barato, pero **hoy no existe** y las decisiones lo dan por
puesto al describir la estructura final de `m14`.

**EVIDENCIA.** `src/lib/leados/contracts.ts:124-133` (citado en §2.1). No hay `.passthrough()` ni
`catchall`; un campo extra en el blob se descarta en el parse.

**REFUTACIÓN INTENTADA.** Busqué si el texto podría colgarse de `softFlags` (es
`z.array(z.string())`, así que técnicamente aceptaría una frase) — pero `softFlags` alimenta el
`Callout tone="warning" title="Flags del setter"` del admin (`dossier-panels.tsx:177-186`), donde una
frase libre aparecería como un delator. Y busqué si el dossier tiene otro blob libre disponible:
`fichaJson.otros` existe pero es de la ficha, cuatro pantallas antes.

**DECISIÓN QUE TOCA.** `decisiones-por-pantalla.md` → `m14` → "LA PRIMERA MIRADA" y "Y un campo libre".

**COSTO.** 1 archivo de contrato + el formulario · **schema SÍ, aditivo** · invariante: NINGUNO ·
patrón existente: sí (`textoLibre` de `contracts.ts:24-27`).

---

### 1.6 · El check falsamente verde: no hay `checkId` en el rechazo

**HALLAZGO.** El rechazo se persiste en `OsLeadDossier.rechazos` con cinco campos y **ninguno señala
un check**. Es el hueco G4 y es aditivo — pero la afirmación de que *"la infraestructura ya existe"*
es de otra cosa (§8·A).

**EVIDENCIA**
- `src/lib/leados/contracts.ts:167-175`
  ```ts
  export const RechazoSchema = z.object({
    fecha: z.string().datetime(),
    motivo: z.string().trim().min(1),
    detalle: textoLibre,
    donde: textoLibre,
    arreglo: textoLibre,
  })
  ```
- `src/app/(protected)/admin/leados/_actions/revision.schemas.ts:33-36` — `RechazarRevisionSchema`,
  con los tres campos del formulario obligatorios y sin lugar para un check.
- `src/lib/leados/dossier.ts:220-231` — el escritor: el historial se acumula con
  `RechazosSchema.parse(dossier.rechazos)` y se le agrega la entrada nueva.

**REFUTACIÓN INTENTADA.** Busqué el campo con otros nombres (`checkId`, `check`, `hardCheck`,
`itemFallado`, `falsoVerde`) en `contracts.ts` y en los schemas del admin — nada. Verifiqué que el
blob es extensible sin migración: `rechazos` es `Json?` y `RechazoSchema` ya creció una vez en B5
(los campos `donde` y `arreglo` son opcionales *"porque los rechazos pre-B5 solo tienen motivo"*,
`contracts.ts:171-172`), así que hay precedente exacto de crecimiento aditivo del mismo blob.

**DECISIÓN QUE TOCA.** Hueco G4 · `observaciones-admin-tanda-1.md` §4 · `brief` §9 #12.

**COSTO.** Archivos: `contracts.ts`, `revision.schemas.ts`, `revision.actions.ts`, `dossier.ts`, el
modal de rechazo, y el lado del setter que lo muestra · **schema SÍ, aditivo** (con precedente propio) ·
invariante: NINGUNO · patrón existente: **sí**, el crecimiento de `RechazoSchema` en B5.

---

### 1.7 · Las alertas de LeadOS no se pueden guardar: `BotAlert` exige un bot

**HALLAZGO.** `observaciones-admin-tanda-2.md` §2 dice: *"La maquinaria está construida y corriendo;
falta agregar los tipos."* Agregar tipos al enum es aditivo y trivial. **Guardar la alerta no**:
`BotAlert.botConfigId` es un `String` requerido con FK a `BotConfig` y `onDelete: Cascade`, y la tabla
está mapeada a `chatbot_bot_alert`. Una alerta de *"setter trabado hace 30 días"* o *"demo esperando
revisión"* no tiene `BotConfig`. No hay fila que insertar.

**EVIDENCIA**
- `prisma/schema.prisma:1621-1650`
  ```prisma
  model BotAlert {
    id String @id @default(cuid())
    botConfigId String
    botConfig   BotConfig @relation(fields: [botConfigId], references: [id], onDelete: Cascade)
    type     BotAlertType
    ...
    @@index([botConfigId, status])
    @@map("chatbot_bot_alert")
  }
  ```
- `prisma/schema.prisma:139-149` — los nueve `BotAlertType`, todos del chatbot.
- Precedente aditivo del enum: `prisma/migrations/20260520190000_add_alert_types/migration.sql:2-3`
  (`ALTER TYPE "BotAlertType" ADD VALUE IF NOT EXISTS …`).

**REFUTACIÓN INTENTADA.** Busqué si `botConfigId` es nullable o si hay un modelo de alerta genérico
paralelo (`grep -n "model .*Alert" prisma/schema.prisma`) — sólo `BotAlert`. Busqué si existe algún
`BotConfig` sintético o "de sistema" al que colgar alertas de plataforma — no aparece. Y verifiqué la
parte que **sí** es cierta de la afirmación: los tipos se agregan con un `ALTER TYPE … ADD VALUE`,
igual que las cinco veces anteriores.

**DECISIÓN QUE TOCA.** `observaciones-admin-tanda-2.md` §2 y §8 ("Ya existe el sistema de alertas que
lo cazaría. Falta agregar los tipos").

**COSTO.** **schema SÍ**: o `botConfigId` pasa a nullable en una tabla del chatbot (con su índice
compuesto), o hace falta un modelo nuevo · toca **código compartido con el chatbot** · invariante:
NINGUNO · patrón existente: el cron y el envío sí; el modelo no.

---

### 1.8 · El reporte semanal al setter: `WeeklyReportLog` está clavado a una organización

**HALLAZGO.** Mismo patrón que las alertas. La entrega existe y corre, pero su unidad es la
**organización cliente**, no la persona. Un setter es un `User` con rol `SETTER`
(`prisma/migrations/20260611210802_add_setter_role/migration.sql:2`), no una `Organization`.

**EVIDENCIA**
- `prisma/schema.prisma:499-516`
  ```prisma
  model WeeklyReportLog {
    organizationId String
    periodKey      String
    status         WeeklyReportStatus @default(PENDING)
    recipientEmail String?
    ...
    organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
    @@unique([organizationId, periodKey])
  }
  ```
- `prisma/schema.prisma:493-497` — `ExecutiveReportFrequency` (`WEEKLY`/`BIWEEKLY`/`DISABLED`), también
  colgado de la organización.

**REFUTACIÓN INTENTADA.** Busqué si `recipientEmail` permite mandarle el reporte a cualquiera sin
tocar el modelo — permite, pero la **clave única** `[organizationId, periodKey]` significa un reporte
por organización por período: dos setters de la misma organización colisionarían, y un setter sin
organización no tiene fila. Busqué un modelo de reporte por usuario — no existe.

**DECISIÓN QUE TOCA.** `observaciones-admin-tanda-2.md` §2 y §8 (G6, "ya existe el mecanismo de
entrega").

**COSTO.** **schema SÍ** (modelo nuevo o FK nullable + cambio de clave única) · **atención al
aislamiento**: un reporte que agrega la cartera de un setter tiene que filtrar por `assignedToId` en
la generación, no sólo en la entrega · invariante: NINGUNO · patrón existente: el cron sí, el modelo no.

---

### 1.9 · "Al final de la lista" no tiene dónde escribirse

**HALLAZGO.** El corte de los diez minutos pide una salida explícita: *"no hay material acá — al final
de la lista"*, con motivo. Revisé los tres lugares donde podría persistirse un lead despriorizado y
ninguno sirve sin inventar semántica: `OsLead` tiene `nextFollowUpAt`, `reactivateAt` y `caliente`
(las tres con significado propio y consumidas por el cron y los gates); `OsLeadSetterMeta` tiene
`pinned`, `snoozedUntil` y `note` —`snoozedUntil` es la pausa personal del setter, con fecha, no una
despriorización sin fecha—; y `DossierStage` sólo tiene `DESCARTADA`, que es terminal y **exige
`motivoDescarte` y un `evaluacionJson` válido**, o sea que hoy no se puede descartar sin haber
evaluado.

**EVIDENCIA**
- `prisma/schema.prisma:862-899` (`OsLead`) y `:909-926` (`OsLeadSetterMeta`).
- `src/lib/leados/dossier.ts:194-203` — descartar exige las dos cosas:
  ```ts
  case 'DESCARTADA': {
    const motivo = input.motivoDescarte.trim()
    if (!motivo) throw new DossierTransitionError('EVALUADA→DESCARTADA requiere motivoDescarte')
    const evaluacion = EvaluacionSchema.safeParse(dossier.evaluacionJson)
    if (!evaluacion.success) throw new DossierTransitionError(
      'EVALUADA→DESCARTADA: evaluacionJson ausente o inválido — no debería pasar, EVALUADA lo exige')
  ```

**REFUTACIÓN INTENTADA.** Busqué un campo de orden o prioridad manual en la cartera
(`grep -n "sortOrder|prioridad|orden" prisma/schema.prisma` sobre los modelos Os*) — `sortOrder` existe
sólo en `OnboardingTask`. Busqué si el orden de la cartera es persistido o derivado: es derivado
(`ordenUrgencia` / `trabajoTier`, `flow.ts:646-720`), así que "al final de la lista" no es un dato que
hoy se pueda escribir en ningún lado.

**DECISIÓN QUE TOCA.** `decisiones-por-pantalla.md` → `m1` → "El corte de los diez minutos, con salida".
`brief` §4 Etapa 1.

**COSTO.** **schema SÍ, aditivo** (columna nueva) · **y cruza con el premortem**: la salida natural
—descartar— hoy depende del `evaluacionJson` que el Evaluador produce · invariante: NINGUNO.

---

### 1.10 · El historial que registre el trabajo rompe el opener y la cadencia

**HALLAZGO.** `OsLeadActivity` tiene **dos** escritores en todo el repo: el rastro de reasignación
(canal `SISTEMA`) y el contacto comercial. La decisión C3 pide que el historial anote además ficha,
brief, construcción, borrador, chequeo, envío, rechazo y reunión. El problema no es agregar filas: es
que **el filtro que separa "contacto comercial" de "evento interno" es negativo**. Dice "todo lo que
no sea `SISTEMA`". Un canal nuevo para eventos de trabajo entra automáticamente en el conteo
comercial, y ese conteo es el que decide si el opener está pendiente y en qué grupo cae el lead.
Guardar *"el setter guardó la ficha"* haría que el producto crea que el primer mensaje ya salió.

**EVIDENCIA**
- Los dos escritores: `src/lib/leados/assignment-trail.ts:45` (`prisma.osLeadActivity.create`) y
  `src/lib/os-commercial.ts:57` (`prisma.osLeadActivity.create`).
- El filtro que falla abierto — `src/lib/leados/isolation.ts:116-118`:
  ```ts
  export const SOLO_CONTACTOS_COMERCIALES: Prisma.OsLeadActivityWhereInput = {
    channel: { not: ActivityChannel.SISTEMA },
  }
  ```
- Lo que depende de ese conteo:
  - `src/lib/leados/manual.ts:504` — `const openerPendiente = stage === 'EVALUADA' && !gateAbierto && input.contactos === 0`
  - `src/lib/leados/flow.ts:519-521` — la rama de `grupoPara` que manda a `trabajar` cuando `contactos === 0`
  - `src/lib/leados/ownership.ts:60` — `_count: { select: { activities: { where: SOLO_CONTACTOS_COMERCIALES } } }`
  - `src/app/api/cron/os-follow-up/route.ts:200` — el cron del "último contacto"
- `prisma/schema.prisma:1090-1102` — `ActivityChannel` = INSTAGRAM_DM · WHATSAPP · EMAIL · LLAMADA ·
  LOOM_VIDEO · OTRO · SISTEMA. Un evento de trabajo no es un canal.

**REFUTACIÓN INTENTADA.** Verifiqué si el contador de DMs y la cadencia sufrirían lo mismo: **no**.
Los dos usan un filtro **positivo** (`SOLO_MENSAJES_ENVIADOS = { result: SIN_RESPUESTA }`,
`isolation.ts:142-144`, y `countFollowUps` en `src/lib/follow-up.ts:15`), así que un canal nuevo con
`result: null` no los mueve. El daño queda acotado a `contactos` y a los conteos comerciales — pero
`contactos` es precisamente el discriminador del opener. Busqué también si existe un modelo separado
de historial de trabajo: `OsSetterNotice` existe pero es **novedad dirigida al setter**, y su propio
comentario aclara que *"NO es un OsLeadActivity — no toca el historial comercial del lead"*
(`prisma/schema.prisma:934-937`).

**DECISIÓN QUE TOCA.** `plan-de-accion-v4.md` §2·C3, "El historial registra el trabajo, no solo el
contacto".

**COSTO.** **schema SÍ** (valores nuevos de `ActivityChannel`, aditivo — con precedente:
`20260619150000_add_activity_channel_sistema`) · **pero además obliga a convertir el filtro negativo
en positivo**, y ese cambio toca cinco lecturas · invariantes: `timeline` y `contador-dms` lo vigilan
**parcialmente** (§4·C) · patrón existente: sí, `SISTEMA` es exactamente el precedente.

---

### 1.11 · El segundo umbral reclasifica leads existentes sin migrar nada

**HALLAZGO.** El gate de la ficha es `fichaFaltantes`, y pide tres cosas: identidad, presencia digital,
y reseñas **o** contenido real. El material visual —logo, imágenes, qué vende, cómo se presenta— vive
en `ficha.materiales` y está **explícitamente excluido del gate**, por decisión documentada. El
segundo umbral ("¿alcanza para diseñar?") es exactamente sobre ese material. Meterlo al gate cambia
`fichaTieneSenal`, y `fichaTieneSenal` decide en qué pantalla aterriza un lead en `FICHA`: **todos los
leads que hoy muestran `m2` como pantalla actual y no tienen `materiales` cargados retroceden a `m1`**
en el próximo request. Sin migración, sin aviso, y sobre datos existentes.

**EVIDENCIA**
- `src/lib/leados/flow.ts:295-314` — el gate real:
  ```ts
  export function fichaFaltantes(ficha: Ficha | null | undefined): string[] {
    ...
    if (!ficha?.resenas && !ficha?.contenidoReal) {
      faltantes.push('Reseñas o contenido real: al menos uno de los dos — es la materia prima del Evaluador')
    }
    return faltantes
  }
  export function fichaTieneSenal(ficha) { return fichaFaltantes(ficha).length === 0 }
  ```
  (De paso: *"es la materia prima del Evaluador"* es copy visible para el setter, y confirma
  literalmente el diagnóstico de las decisiones sobre qué pregunta el gate de hoy.)
- `src/lib/leados/contracts.ts:70-73` — la exclusión deliberada:
  ```
  * No entra en `fichaFaltantes` a propósito: suma material, no mueve el gate de señal.
  ```
- `src/lib/leados/manual.ts:508-519` — lo que decide: sin señal → `{actual:'m1'}`; con señal → `{actual:'m2'}`.
- `src/lib/leados/ficha-calidad.ts:1-11` — y el módulo que **no** es el gate, marcado como tal:
  *"LÍMITE DURO (SENSIBLE-lite): esto NO es un gate."*

**REFUTACIÓN INTENTADA.** Busqué si hubiera un segundo gate ya escrito para material
(`grep -rn "alcanzaParaDisenar|umbral|gateDiseno" src/`) — no existe. Verifiqué que el efecto sobre
datos existentes es real y no teórico: la posición **no se guarda**, se re-deriva en cada request
(`manual.ts:369-372`, *"la posición se re-deriva, nunca se guarda"*), así que el cambio de gate se
aplica retroactivamente a toda la cartera en el instante del deploy.

**DECISIÓN QUE TOCA.** `decisiones-por-pantalla.md` → `m1` → "Dos umbrales, no uno" y "Y el gate sube
de lugar".

**COSTO.** Archivos: `flow.ts`, `manual.ts`, `contracts.ts`, el formulario de la ficha · schema:
aditivo (los campos nuevos) · **efecto retroactivo sobre datos existentes, sin migración** ·
invariante: `manual` y `flow` lo tocan pero **ninguno afirma nada sobre `materiales`** · patrón: sí.

---

## 3 · P2 · Los cambios de schema que nadie declaró

**Todo cambio de schema es decisión de Franco aunque sea aditivo.** Y en este proyecto ya pasó que
tocar un identificador persistido vació progreso guardado en silencio. Dos de los destructivos de esta
tabla son exactamente ese mecanismo, otra vez.

**Nota de vocabulario.** "Schema" acá cubre dos cosas que cuestan distinto: **columna/enum de
Postgres** (migración) y **contrato de blob Json** (migración de datos en aplicación, sin DDL). Se
distingue en cada fila porque las decisiones no lo distinguen.

| # | Delta | Decisión que lo pide | Dónde | Naturaleza |
|---|---|---|---|---|
| 1 | 4 campos de la ficha: dirección física · horarios reales · contacto exacto (`wa.me`) · cómo se ve la web actual | `m1`, "Cuatro campos nuevos" | `FichaSchema` (blob) | **Aditivo** |
| 2 | `checkId` en el rechazo | G4 | `RechazoSchema` (blob) | **Aditivo** |
| 3 | Campo libre de "la primera mirada" | `m14` | `SelfCheckSchema` (blob) | **Aditivo** |
| 4 | Marca de tiempo de apertura de la ficha | G7 | `OsLeadDossier` (columna) | **Aditivo** |
| 5 | Valores de `AuditActionType` para LeadOS | tanda-2 §2 | enum Postgres | **Aditivo** (19 precedentes) |
| 6 | Valores de `BotAlertType` para LeadOS | tanda-2 §2 | enum Postgres | **Aditivo** — pero inerte sin #12 |
| 7 | Valores de `ActivityChannel` para eventos de trabajo | C3 | enum Postgres | **Aditivo** (precedente `SISTEMA`) |
| 8 | `SelfCheck.itemsDuros[].ok: boolean` → tres estados | `m14` | `SelfCheckSchema` (blob) | **DESTRUCTIVO** — todo blob deja de parsear |
| 9 | `FASE_IDS` reemplazado (`mc1` 1 + `mc2` 5) | `mc1`/`mc2` | `contracts.ts` (blob) | **DESTRUCTIVO** — `progresoJson` se vacía |
| 10 | "Máximo tres colores" de `softFlags` a `itemsDuros` | `m14` | `SelfCheckSchema` (blob) | **DESTRUCTIVO** de forma |
| 11 | Sacar `EVALUADA` de `DossierStage` | Evaluador | enum Postgres | **DESTRUCTIVO** — sin precedente en el repo |
| 12 | `BotAlert.botConfigId` a nullable (o modelo nuevo) | tanda-2 §2 | columna del chatbot | **DESTRUCTIVO** de nulabilidad |
| 13 | Reporte semanal por setter | G6 | modelo nuevo o FK nullable + clave única | **DESTRUCTIVO** de clave |
| 14 | Sacar `titulo` de `BriefSchema` | `m6` punto 7 | `BriefSchema` (blob) | **DESTRUCTIVO** — ver abajo |

**Siete aditivos, siete destructivos.**

**Dos deltas que aparecieron auditando y no están en ninguna decisión:**

**15 · El tope de 5.000 caracteres de `textoLibre` es más chico que el documento del Gem.**
`contracts.ts:22-27` fija `TEXTO_LIBRE_MAX = 5000` y `pegadoGem` lo usa. El documento definitivo se
especifica en **800 a 1.200 palabras** (`gem-de-diseno-paquete.md` §4·P3), que en castellano ronda los
5.000 a 7.500 caracteres. **El extremo alto no entra**, y el camino de escritura es estricto
(`BriefSchema.parse` en `dossier.ts:465`): el guardado falla, no se trunca. **VERIFICADO** el tope y el
camino estricto; **NO VERIFICADO** el largo real en caracteres de un documento del Gem, porque ningún
documento del Gem existe todavía (`brief` §12: *"Los cuatro Gems no existen"*).

**16 · Sacar "Título del brief" borra datos guardados en el próximo re-guardado.**
El camino de escritura persiste el input **completo**, y el propio código deja escrita la advertencia:

- `src/app/(protected)/setter/leads/[leadId]/_components/brief-form.tsx:30-40`
  ```
  * P5-B — `notasMarca` YA NO SE PIDE ... Pero sigue en el estado y en el payload A PROPÓSITO:
  * `guardarBrief` persiste el input COMPLETO (`const brief: Brief = input.data`), así que un campo
  * que sale del payload se BORRA en el próximo re-guardado. ... Si alguien lo saca de
  * `BriefFormState`/`aPayloadBrief` "porque no se usa", el dato viejo se pierde a la primera edición
  * y nadie se entera.
  ```
- `src/app/(protected)/setter/_actions/dossier.actions.ts:204-205` — `const brief: Brief = input.data`
- Y `titulo` no es opcional: `contracts.ts:108` — `titulo: z.string().trim().min(1)`. Sacarlo del
  payload sin sacarlo del schema hace que `BriefSchema.parse` (`dossier.ts:465`) **falle en el
  guardado**, no que se borre en silencio. Sacarlo de los dos borra el dato viejo.

**Precedentes de migración de enum en el repo** (para calibrar el costo de las filas 5, 6, 7 contra la 11):
`grep -rn "ALTER TYPE" prisma/migrations/*/migration.sql` devuelve **19 `ADD VALUE`** y **1
`RENAME VALUE`** (`20260320200000_multi_tenancy_organizations/migration.sql:84`). **Cero borrados de
valor.** Los dos únicos `DROP TYPE` (`20260406040000_v2-cleanup-deprecated-models/migration.sql:4-5`)
eliminan tipos enteros que ya no tenían columna. Es decir: **agregar está trillado; sacar no se hizo
nunca acá.**

---

## 4 · P3 · Invariantes, transiciones y aislamiento

### El aislamiento

**Mecanismo, VERIFICADO** — `src/lib/leados/isolation.ts:25-36`:
```ts
export function ownedLeadWhere(leadId: string, userId: string): Prisma.OsLeadWhereInput {
  return { id: leadId, assignedToId: userId }
}
export function ownedListWhere(userId: string): Prisma.OsLeadWhereInput {
  return { assignedToId: userId }
}
```
Más `ownSetterMetaWhere` (`:108`) y `ownSetterNoticeWhere` (`:186`) para lo privado del setter. Ocho de
los 22 invariantes afirman aislamiento de alguna forma.

**Ninguna de las decisiones auditadas relaja `assignedToId`.** Las dos que lo tocarían de rebote son
la #7 (alertas) y la #8 (reporte semanal), por agregar sobre modelos cuya unidad es la organización.
Se registra como advertencia, no como hallazgo confirmado: **NO VERIFICADO** que la construcción vaya
a hacerlo mal, porque la construcción no existe.

### Los cuatro falsos verdes

Esto es lo más importante de esta sección: **cuatro invariantes seguirían en verde mientras el
producto se rompe**, porque sus aserciones están escritas contra la misma lista que la decisión
cambia. No es un defecto de los invariantes — en tres de los cuatro es una elección declarada en el
propio archivo. Pero significa que la red de seguridad **no cubre estas decisiones**.

**A · `pantallas-construccion` y `progreso-isolation` ante el cambio de `FASE_IDS`.**
Todas las aserciones comparan `FASE_IDS` contra cosas derivadas de `FASE_IDS`:
- `pantallas-construccion.invariant.ts:60` — `for (const fase of FASE_IDS)`
- `pantallas-construccion.invariant.ts:104-113` — la unión de fases de las pantallas contra `[...FASE_IDS].sort()`
- `progreso-isolation.invariant.ts:68-70` — el fixture "todo completo" es `completadas: [...FASE_IDS]`
- `progreso-isolation.invariant.ts:122-137` — *"los ids del shell son EXACTAMENTE FASE_IDS"*

Los dos únicos literales de id del archivo (`'estructura'`, en `:90` y `:98`) están dentro de
aserciones **negativas** (`!ProgresoSchema.safeParse(...).success`) que siguen siendo verdaderas pase
lo que pase. Reemplacé `FASE_IDS` por seis ids distintos y seguí las aserciones una por una: **las dos
suites pasan enteras**, y todo `progresoJson` guardado vale `{ completadas: [] }`.

**B · `self-check-gate` ante el crecimiento de `HARD_CHECKS`.** Acá está declarado en el encabezado:
- `self-check-gate.invariant.ts:14-15`
  ```
  * Los nombres/ids de los hard-checks dependen de Construcción (FG-2 puede
  * cambiarlos): por eso los fixtures se DERIVAN de `HARD_CHECKS` en vivo, sin hardcodear nombres.
  ```
- `:30` — `itemsDuros: HARD_CHECKS.map((check) => ({ nombre: check.nombre, ok: true }))`

Agregar los cuatro obligatorios nuevos y subir "tres colores" de delator a obligatorio deja el
invariante verde. Lo que cambia en silencio es otra cosa, y también está declarado en el código:
- `flow.ts:200-208`
  ```
  * Se valida contra HARD_CHECKS (no contra lo que el blob diga tener): si la
  * lista cambió después de guardado, el self-check viejo deja de aprobar y el setter lo repasa.
  export function selfCheckAprobado(selfCheck: SelfCheck | null): boolean {
    if (!selfCheck) return false
    return HARD_CHECKS.every((check) =>
      selfCheck.itemsDuros.some((item) => item.nombre === check.nombre && item.ok))
  }
  ```
  El match es **por `nombre`**, que es el texto que ve el setter. `flow-content.ts:131-135` lo dice:
  *"Renombrar uno hace que el tilde viejo deje de matchear: los seis originales quedan literales a
  propósito."* Las decisiones de `m14` renombran criterios (*"Se ve bien en el celular"*, *"Hay
  jerarquía"*, *"El botón invita"*). **Cada renombre desconecta el tilde guardado del check.**

**C · `contador-dms` y `timeline` ante el historial de trabajo (C3).** `contador-dms` afirma sobre
`result`, no sobre `channel`; `timeline` afirma que `SISTEMA` se muestra pero no cuenta. Un canal
**nuevo** para eventos de trabajo no lo nombra ninguno de los dos, y `SOLO_CONTACTOS_COMERCIALES` lo
dejaría pasar como contacto comercial (§2.10). Los dos invariantes siguen verdes.

**D · `particion` ante la salida del Evaluador.** Es el falso verde del premortem y se trata en §7·P6.5.

### Decisiones que tocan transiciones o gates y NO tiene invariante ninguno

| Decisión | Invariante que la vigila |
|---|---|
| El tercer estado del chequeo | **NINGUNO — hueco** (`self-check-gate` da falso verde) |
| El encabezado etiquetado | **NINGUNO — hueco** |
| El campo libre de la primera mirada | **NINGUNO — hueco** |
| El `checkId` del rechazo | **NINGUNO — hueco** |
| Los dos umbrales de la ficha | **NINGUNO** afirma nada sobre `materiales` |
| "Al final de la lista" | **NINGUNO — hueco** |
| El check del dueño gateando los horarios (`m16`) | **NINGUNO — hueco** |
| La rama `POSTERGADO` en la derivación | `flow` afirma la **clasificación** (vencido = accionable), no la pantalla |

---

## 5 · P4 · Lo que cuesta bastante más de lo que las decisiones asumen

### A · El asistente de alta de cliente: de las tres piezas prometidas, una sola es reutilizable

**HALLAZGO.** La afirmación que sostiene el presupuesto del bloque C4 es que *"el componente de pasos,
la barra de progreso y el autoguardado ya viven en el repo"*. Verificado pieza por pieza:

**La ruta es una cáscara de 17 líneas** que importa un componente del **módulo del chatbot**:
- `src/app/(protected)/admin/clients/new/page.tsx:1`
  ```ts
  import { OnboardingWizard } from '@/modules/chatbot/components/admin/onboarding/OnboardingWizard'
  ```

**1 · La barra de progreso: SÍ es reutilizable.** 32 líneas, tres props, cero acoplamiento.
- `src/modules/chatbot/components/admin/onboarding/ProgressBar.tsx:5-9`
  ```tsx
  interface ProgressBarProps { currentStep: number; totalSteps: number; stepNames: readonly string[] }
  ```

**2 · El "componente de pasos": NO existe como componente.** `OnboardingWizard` **no recibe una sola
prop**, tiene el estado inicial hardcodeado con 30 campos del alta de cliente, y despacha los pasos
con una cadena de cinco condicionales JSX fijos. No hay registro de pasos, ni `children`, ni slots.
- `src/modules/chatbot/components/admin/onboarding/OnboardingWizard.tsx:84` — `export function OnboardingWizard() {`
- `:54-83` — `const INITIAL_STATE: OnboardingState = { withBot: true, orgName: '', industry: 'generico', … }`
- `:15-21`, `:24-25` — `STEP_LABELS` / `WITH_BOT_STEPS` / `NO_BOT_STEPS`, literales del dominio cliente
- `:128-132` — el despacho:
  ```tsx
  {currentKey === 'company' && <Step1Company … />}
  {currentKey === 'bot' && <Step2BotIdentity … />}
  {currentKey === 'kb' && <Step3KnowledgeBase … />}
  {currentKey === 'appearance' && <Step4Appearance … />}
  {currentKey === 'review' && <Step5Review … />}
  ```
- `:150` — el "preview en vivo" es `<BotConfigPreview state={onboardingToPreview(state)} />`, atado a
  `BotPreviewState`; `onboardingToPreview` (`:31-51`) mapea estado de onboarding a config de bot.

**3 · El "autoguardado": no es el autoguardado que LeadOS necesita.** Es un borrador de `localStorage`
con **una sola clave global**, tipado al alta de cliente, que nunca toca servidor ni base:
- `src/modules/chatbot/components/admin/onboarding/useOnboardingDraft.ts:5-8`
  ```ts
  const DRAFT_KEY = 'develop:onboarding:draft'
  const DRAFT_VERSION = 1
  const MAX_DRAFT_AGE_DAYS = 7
  const DEBOUNCE_MS = 1000
  ```
- `:19` — `export function useOnboardingDraft(initialState: OnboardingState)`
- `:32`, `:69` — `localStorage.getItem(DRAFT_KEY)` / `localStorage.setItem(DRAFT_KEY, …)`

Una clave global significa que dos entidades abiertas en dos pestañas se pisan. LeadOS guarda por lead
en la base, vía server action.

**REFUTACIÓN INTENTADA.** Busqué si alguna de las piezas está exportada desde un barrel compartido
(`src/components/ui`) — no: viven las once en la carpeta del módulo chatbot. Busqué si hay una regla
de arquitectura que **prohíba** importarlas desde LeadOS: `.dependency-cruiser.cjs` sólo tiene una
regla `no-circular` en severidad `warn`, así que **el import cruzado no está bloqueado por
herramienta** — es una dependencia de LeadOS hacia el módulo del chatbot, no un muro. Y busqué el
contra-argumento más fuerte: que LeadOS no tenga nada equivalente. Lo tiene, y es más fuerte: el
manual deriva su posición del servidor (`derivarPantalla`), persiste el progreso por lead
(`progresoJson`), y está atado por dos invariantes. Es decir, **la comparación no es "inventar vs
extender": es entre dos mecanismos que ya existen**, uno de ellos client-side y de un solo uso.

**Un detalle de comportamiento que las decisiones ya notaron y que confirma el punto**: el asistente
del admin avanza con `next()`/`back()` explícitos (`OnboardingWizard.tsx:106-107`), y la decisión S2
dice *"Nunca hay un botón 'siguiente'"*. Los dos comportamientos no salen del mismo componente porque
no hay componente: hay una página.

**DECISIÓN QUE TOCA.** `observaciones-admin-tanda-2.md` §1 y §8 · `plan-de-accion-v4.md` §2·C4.

**COSTO.** Reutilizable hoy: **32 líneas** (`ProgressBar.tsx`) y, si se quiere, `DraftBanner.tsx` (1,4 kB) ·
**toca el módulo del chatbot** · schema no · invariante: NINGUNO.

### B · El ángulo wow a los tres mensajes: los tres salen de lugares distintos y ninguno recibe el brief

**HALLAZGO.** El hueco G2 se confirma, y para el toque es peor de lo que dice: no es que el mensaje no
sepa de la demo, es que **no sabe ni el nombre del negocio**. Los tres son piezas distintas:

| Mensaje | De dónde sale | Qué recibe | ¿Recibe el brief? |
|---|---|---|---|
| Opener (`m4`) | `buildOpenerInputBlock` | `lead`, `ficha`, `evaluacion` | **No** |
| Toque (`m5`) | `PLANTILLAS_FOLLOW_UP[n]` | **nada** — string estático | **No** |
| Envío (`m15`) | `buildDemoMensajeBlock` | `lead`, `finalUrl` | **No** |

**EVIDENCIA**
- `src/app/(protected)/setter/leads/[leadId]/manual/_components/m4-opener.tsx:52` —
  `texto={buildOpenerInputBlock(lead, ficha, evaluacion)}`
- `src/lib/leados/flow-content.ts:357-361` — las tres plantillas del toque, literales, sin una sola
  interpolación:
  ```ts
  export const PLANTILLAS_FOLLOW_UP: string[] = [
    'Hola! Te escribí hace un par de días — sé que el día a día del negocio no da respiro. …',
  ```
- `src/app/(protected)/setter/leads/[leadId]/manual/_components/m5-seguimiento.tsx:163-165` —
  `texto={PLANTILLAS_FOLLOW_UP[cadencia.proximoToque - 1]}`
- `src/lib/leados/copy-blocks.ts:137-145` — el envío, también literal salvo el nombre y la URL:
  ```ts
  export function buildDemoMensajeBlock(lead: CopyBlockLead, finalUrl: string): string {
    return [`Te armé algo para que veas en 30 segundos cómo podría verse ${lead.businessName} online
      — sin compromiso, decime qué te parece:`, finalUrl].join('\n\n')
  }
  ```
  (Es, palabra por palabra, el *"te armé algo para que veas cómo podría verse"* que las decisiones
  citan como el mensaje a mejorar. **VERIFICADO**.)

**REFUTACIÓN INTENTADA.** Busqué una fuente única de plantillas (`grep -n "PLANTILLA|TEMPLATE|MENSAJE"
src/lib/leados/*.ts`): hay dos familias sin relación —`PLANTILLAS_FOLLOW_UP` en `flow-content.ts` y los
`build*Block` en `copy-blocks.ts`—. Busqué si el brief llega igual por otra vía: `copy-blocks.ts` tiene
**una sola** función que recibe `Brief`, y es `buildConstruccionBlock` (`:175-177`), que alimenta a
Claude Design, no a los mensajes.

**COSTO.** Archivos a tocar para que el ángulo viaje: `copy-blocks.ts`, `flow-content.ts`,
`m4-opener.tsx`, `m5-seguimiento.tsx`, `m15-envio.tsx`, más los `_data.ts`/`page.tsx` que hoy no
cargan el brief en esas pantallas · **schema no** si se lee `briefJson` en vivo · invariante: NINGUNO ·
patrón existente: **sí** — `buildConstruccionBlock` ya recibe `Brief`.

### C · Cal.com: el riesgo declarado en el plan es real

**HALLAZGO.** `plan-de-accion-v4.md` §6 registra el riesgo *"`getCalConfigLeadOS` exige una sola
organización con `calComUsername`, compartido con el módulo cliente"*. **VERIFICADO, literal.**

**EVIDENCIA** — `src/lib/leados/agenda.ts:42-58`:
```ts
export async function getCalConfigLeadOS(): Promise<CalConfigLeadOS> {
  const orgs = await prisma.organization.findMany({
    where: { calComUsername: { not: null } }, …
  })
  if (orgs.length === 0) return { ok: false, motivo: SETUP_B7 }
  if (orgs.length > 1) {
    return { ok: false, motivo:
      `Config Cal.com ambigua: ${orgs.length} organizaciones tienen calComUsername …` +
      'limpiá las que no sean la agenda de Franco.' }
  }
```
Cargarle `calComUsername` a **cualquier** organización cliente rompe el agendado de LeadOS con el
error de ambigüedad. No es un acoplamiento teórico: es una consulta global sin filtro de dominio.

---

## 6 · P5 · Lo que ya está construido y las decisiones no lo saben

| # | Qué | Evidencia | Estado |
|---|---|---|---|
| 1 | **La marca de caliente, y su gate ya cableado** | `admin/leads/_actions/lead.actions.ts:165` la escribe; `admin/layout.tsx:25-27`, `admin/leados/page.tsx:44,116` la leen; `flow.ts:80-82` la consume en `gateBriefAbierto` | Construido y en uso |
| 2 | **`soltarFoco`** | `setter/_actions/foco.actions.ts:53-57` — existe y borra la cookie | Construido, **cero llamadores** |
| 3 | **El audit log es genérico** | `prisma/schema.prisma:1652-1677`: `targetType`/`targetId` son `String` libres, sin `organizationId`; `src/lib/audit-log.ts:17` | Sólo faltan valores de enum |
| 4 | **El control de cambiar el borrador** | `m13-borrador.tsx:77-98`: `if (stage !== 'CONSTRUCCION' && draftUrl)` devuelve link de lectura; sólo `CONSTRUCCION` devuelve `<BorradorForm>` | Existe, lo esconde un condicional |
| 5 | **El Loom ya está modelado** | `prisma/schema.prisma:972-985`: `OsDemo.loomUrl`, `OsDemo.viewedAt`; `:1072-1081`: `LeadStatus.VIO_VIDEO` | Modelo listo |
| 6 | **El admin SÍ muestra lo que el setter no tildó** | `dossier-panels.tsx:164-176` | Refuta tanda-1 §3 (§8·B) |
| 7 | **`EVALUADA` ya no tiene pantalla propia** | `manual.ts:508-540` | Refuta la premisa del premortem (§7) |
| 8 | **La ficha entera ya viaja al Gem** | `copy-blocks.ts:87-99` + `:32-84` | La dependencia de `m6` ya está satisfecha |
| 9 | **El bloque a Claude Design lleva once secciones, no dos** | `copy-blocks.ts:205-241` | Refuta el diagnóstico de `m6` (§8·C) |
| 10 | **`espera` y `revision` ya dicen cosas distintas** | `manual.ts:275-287` | Refuta parcialmente la decisión (§8·D) |

**Sobre el #1, un detalle que conviene registrar porque induce a error a quien lea el schema:** el
comentario de la columna está **desactualizado y dice lo contrario del código**.
`prisma/schema.prisma:874-878` afirma *"Hoy NADIE lo setea ni lo lee — el comportamiento sigue siendo
el del score (esCaliente, score ≥ 4) hasta admin-1b"*. `admin-1b` se hizo: hay escritor
(`lead.actions.ts:165`), hay lectores, y el gate ya sale del campo (`dossier.ts:180-190` comenta
*"admin-1d: el gate del flujo invertido sale del CAMPO `caliente` (de Franco), no del score del
setter"*). El comentario del schema es la única fuente que dice que no.

**Y sobre el gate del recorrido, que el brief §11-5 tiene como DIFERIDO:** está construido y **gatea
de verdad hoy**. `flow.ts:80-82` define `gateBriefAbierto = respondió || caliente`, y `dossier.ts:186-190`
lo aplica como guard duro de la transición a `BRIEF`, con excepción lanzada. No es una hipótesis a
probar: es el gate vigente.

---

## 7 · P6 · Premortem del Evaluador

> **Primero, la premisa.** La decisión dice: *"El veredicto pasa a registrarse en el cierre de la ficha
> (`m1`). La etapa `EVALUADA` deja de tener pantalla propia."* Contra el código: **`EVALUADA` ya no
> tiene pantalla propia.** `m2` es la pantalla del stage **`FICHA`**, y el código lo dice explícito:
>
> `src/lib/leados/manual.ts:508-519`
> ```ts
> case null:
> case 'FICHA': {
>   // La evaluación ocurre con stage=FICHA: registrar el veredicto ES la transición.
>   if (!fichaTieneSenal(input.ficha)) return { actual: 'm1', habilitadas: ['m1'] }
>   return { actual: 'm2', habilitadas: ['m2'] }
> }
> ```
> Y un lead en `EVALUADA` **nunca** aterriza en `m2`: cae en `m4`, `m6`, `m5` o `espera`
> (`manual.ts:524-540`). Fusionar `m2` dentro de `m1` es unir dos pantallas que ya viven las dos en el
> mismo stage — mucho más barato de lo que la decisión asume **para la parte de pantalla**. Todo lo
> caro está en la otra mitad: la etapa.

### P6.1 · Qué depende de la etapa `EVALUADA`

**Censo, VERIFICADO**: `grep -rn "EVALUADA" src/ prisma/ tests/ scripts/` da **199 apariciones en 48
archivos**. Lo que importa, por capa:

**Motor y transiciones**
- `dossier.ts:50-59` — **`EVALUADA` es la única salida de `FICHA`, y `DESCARTADA` sólo se alcanza desde `EVALUADA`**:
  ```ts
  const LEGAL_TRANSITIONS: Record<DossierStage, readonly DossierStage[]> = {
    FICHA: ['EVALUADA'],
    EVALUADA: ['DESCARTADA', 'BRIEF'],
    BRIEF: ['CONSTRUCCION'], …
  }
  ```
- `dossier.ts:168-177` — la transición a `EVALUADA` **exige** `EvaluacionSchema.parse(input.evaluacion)` y estampa `evaluacionJson`.
- `dossier.ts:180-190` — el gate `EVALUADA→BRIEF` (`gateBriefAbierto`), con excepción lanzada.
- `dossier.ts:194-203` — descartar **exige** `motivoDescarte` **y** un `evaluacionJson` válido.
- `dossier.ts:457-461` — `saveOwnedBrief` sólo se permite en `EVALUADA` o `BRIEF`.
- `dossier.actions.ts:210-212` — guardar el brief transiciona `EVALUADA→BRIEF`.

**Derivación de pantalla**
- `paso.ts:51-67` — `pasoActual`: `EVALUADA` y `DESCARTADA` → índice 2.
- `paso.ts:99-120` — `describirFoco` case `EVALUADA`, con la rama del opener.
- `paso.ts:14-31` — `anchorActivo`; `StepAnchorId` incluye `'evaluacion'`.
- `manual.ts:394-403` — `STAGES_POST_EVALUACION` (7 stages) marca `m1` **y** `m2` como completadas.
- `manual.ts:504` — `openerPendiente = stage === 'EVALUADA' && !gateAbierto && contactos === 0`.
- `manual.ts:524-540` — el case `EVALUADA` completo.
- `manual.ts:301-315` — `FASES_MANUAL.evaluacion = { titulo: 'Evaluación', pantallas: ['m2'] }`: **una
  de las diez fases del rail del manual**.

**Foco, cartera y métricas**
- `flow.ts:500-521` — `grupoPara`: dos ramas propias de `EVALUADA`.
- `flow.ts:499-515` — `clasificarLead`: la próxima acción de un `EVALUADA`.
- `flow.ts:667-687` — `trabajoTier`: `if (lead.stage === 'EVALUADA' && lead.gateAbierto) return CONSTRUIR`.
- `flow.ts:519-521` — en `FICHA`: *"Pasala por el Evaluador"* como próxima acción visible.
- `mis-numeros.ts:76` y `revision.ts:116-121` — la métrica **descarte vs avance** se calcula
  íntegramente sobre `evaluacionJson` (`veredicto === 'DESCARTAR'`, ventana por `evaluacion.fecha`).
- `pipeline.ts:33,53` — el tablero del admin y su SLA de atascos: `EVALUADA: 48` horas.
- `leados-ui.ts:20` — `EVALUADA: 'blue'` (color de badge).
- `error-copy.ts:38,41,44` — **tres mensajes de error traducidos** que nombran `EVALUADA`.

**Munición y bloques**
- `copy-blocks.ts:87-99` — `buildBriefInputBlock(lead, ficha, evaluacion)`: `evaluacion` **no es opcional**.
- `copy-blocks.ts:108-119` — `buildOpenerInputBlock` lo reusa entero.
- `herramientas.ts:21-26` — `HerramientaId` incluye `'evaluador'`.

**Invariantes que la nombran**: `particion` (`:130,173,193-208`), `manual` (6 hits), `turno` (`:58`),
`gate-envio-demo` (`:41`).

**Seeds, scripts y tests que la escriben o la afirman**: `prisma/seed-agency-os.ts` · nueve scripts
(`v1-qa-wizard-states.ts` 11 hits, `b2-verify-dossier.ts` 11, `dev/m0-galeria-seed.ts` 10,
`b6-qa-outreach.ts` 6, `demos-seed-review-queue.ts` 5, `b7-qa-agenda.ts` 4, `dev/qa-manual-m5-m16.ts` 4,
`b4-qa-construccion.ts` 2, `b5-qa-review-queue.ts` 1) · **once suites Playwright**
(`tests/setter/01-flow` 7 hits, `tests/leados/dossier-gates` 6, `tests/setter/10-unsaved-guard` 4,
`tests/leados/foco-no-miente` 4, `tests/setter/09-archivo-terminal` 3, `08-m5-cadencia-agotada` 3,
`07-admin-assign-caliente` 3, `04-admin` 2, `00-surfaces` 2, `03-cabina` 1,
`tests/qa-walkthrough/corrida-1` 1) · `tests/helpers/setter-db.ts`.

### P6.2 · Qué se rompe si desaparece la pantalla pero la etapa se conserva

**Un lead en `EVALUADA` NO queda huérfano** — cae en `m4`/`m6`/`m5`/`espera` y ninguna de esas
pantallas es `m2`. **Los que quedan sin superficie son otros dos, y las decisiones no los nombran:**

**1 · `DESCARTADA` se queda sin pantalla.** `manual.ts:521-523`:
```ts
case 'DESCARTADA':
  // Terminal del archivo: el manual muestra el veredicto registrado; no
  // hay pantallas por delante. Con la fusión de P4 el veredicto vive en m2.
  return { actual: 'm2', habilitadas: [] }
```
`m2` es el terminal del lead descartado, con `habilitadas: []`.

**2 · Un lead en `FICHA` con señal se queda sin `actual`.** `manual.ts:517` devuelve
`{ actual: 'm2', habilitadas: ['m2'] }` y es la **única** rama para ese estado. Y el contrato del
módulo advierte qué pasa si `actual` no es accesible — `manual.ts:370-373`:
```
* Todo lo que no esté en ninguna es futuro: no se renderiza, redirige a la
* actual. Invariante: `actual` siempre es accesible (∈ completadas ∪ habilitadas) —
* sin eso, la guardia del server entraría en loop de redirects.
```
`derivarPantalla` tiene una red (`manual.ts:620-624`: si `actual` no es accesible lo agrega a
`habilitadas`), así que el loop se evita — **pero `actual` seguiría apuntando a una pantalla que ya no
existe**, y `PantallaId` es un tipo cerrado: sacar `'m2'` de `PANTALLA_IDS` (`manual.ts:45-61`)
**rompe el build** en `posicionDe`, `completadasDe`, `ORDEN_MANUAL`, `FASES_MANUAL` y `PANTALLAS`. Eso
juega a favor: el compilador obliga a resolverlo. Lo que el compilador **no** puede decir es a dónde
tiene que ir el `DESCARTADA` ni cuál es el `actual` de un `FICHA` con señal.

**3 · Se pierde una fase del rail.** `FASES_MANUAL.evaluacion` (`manual.ts:306`) es una de diez, y el
indicador *"paso N de M"* cuenta sobre esa estructura.

### P6.3 · Qué se rompe si desaparece la etapa

**El opener se queda sin camino.** `m4` aparece **solamente** dentro del case `EVALUADA` de `posicionDe`
(`manual.ts:524-526`). Para un lead que todavía no fue contactado, `m4` no está en `completadas`
(`manual.ts:441`: `if (input.contactos > 0) done.add('m4')`) ni en `habilitadas`, y lo que no está en
ninguna de las dos *"es futuro: no se renderiza, redirige a la actual"*. **Sin `EVALUADA` no hay
manera de llegar a la pantalla del primer mensaje** — que es la Etapa 7 del brief.

**Y el bloque del opener se vacía.** `m4-opener.tsx:36-47`:
```tsx
if (!ficha || !evaluacion) {
  // Inalcanzable con la guardia del server (m4 exige EVALUADA con opener pendiente)
  return (<p …>La ficha y la evaluación tienen que estar registradas antes de armar el opener.</p>)
}
```
No crashea: **degrada a un estado vacío que le pide al setter algo que ya no existe.** Es el modo de
falla más caro, porque es silencioso.

**Hay datos guardados que la referencian.** `OsLeadDossier.evaluacionJson` es escrito por la
transición (`dossier.ts:171-176`) y leído por: la métrica descarte/avance del setter
(`mis-numeros.ts:76`), la métrica del admin y su alarma anti-rubber-stamp (`revision.ts:116-121,142`),
el guard de descarte (`dossier.ts:198-202`), el bloque del Gem de diseño (`copy-blocks.ts:87-99`) y el
del opener (`:108-119`). **Si deja de escribirse, la métrica que la decisión dice que "se espera que
suba" queda en `null` para todo lead nuevo.**

**Y el enum.** `DossierStage` es un enum de Postgres (`prisma/schema.prisma:1117-1126`). Sacarle un
valor no es `ALTER TYPE … DROP VALUE` —no existe—: hay que recrear el tipo y reescribir la columna.
Cero precedentes en el repo (§3).

### P6.4 · Qué pasa con los leads que hoy están en `EVALUADA`

**El censo de 22 del 22/8: NO VERIFICADO.** No se consultó la base, por regla de esta auditoría, y el
número no es derivable del código. Lo que sí es verificable:

- **No hay ninguna migración de datos escrita** para esos leads: `ls prisma/migrations/` no muestra
  ninguna entrada de reconciliación de `DossierStage` posterior a
  `20260612121536_add_os_lead_dossier`, que es la que crea el tipo.
- **Los fixtures los siguen produciendo**: nueve scripts de seed escriben `EVALUADA` (P6.1). Mientras
  esos scripts existan, el estado se vuelve a crear en cada línea base de QA.
- **Su camino, si la etapa se conserva y sólo se va la pantalla**: siguen funcionando — `m4`/`m6`/`m5`/
  `espera` no dependen de `m2`.
- **Su camino, si se va la etapa**: quedan con un valor de enum inexistente. En Prisma eso es un error
  de lectura de la fila, no un `null` silencioso.

### P6.5 · Qué invariante vigila esa transición, y si da falso verde

**Ninguno vigila la transición en sí.** `flow.invariant.ts` afirma sobre `POSTERGADO`;
`manual.invariant.ts` afirma sobre terminales; `turno.invariant.ts` recorre 432 combinaciones de
`status × stage × finalUrl × acción-pendiente` **incluyendo** `EVALUADA` (`:58`), pero afirma sobre
turnos, no sobre legalidad de transiciones. **No hay ningún invariante de `LEGAL_TRANSITIONS`.**

**Y el falso verde es el más grave de los cuatro.** La restricción central del premortem anterior —
*"construir nunca se sugiere para un lead sin veredicto"*— está garantizada **por la forma del grafo
de transiciones**, y el código lo dice así, con esas palabras:

`src/lib/leados/flow.ts:638-644`
```
* RESTRICCIÓN DEL PREMORTEM (la que no se negocia): construir nunca se sugiere
* para un lead sin veredicto. … Un lead sin evaluar cae SIEMPRE en EVALUAR — la única
* puerta a CONSTRUIR es un stage que solo se alcanza después del veredicto
* (BRIEF/CONSTRUCCION vienen de EVALUADA, y EVALUADA es el veredicto mismo).
* La garantía es estructural, no un `if`.
```

Y en efecto `trabajoTier` **sólo mira `stage`** — `flow.ts:666-687`:
```ts
if (lead.stage === 'BRIEF' || lead.stage === 'CONSTRUCCION') return TRABAJO_TIER.CONSTRUIR
if (lead.stage === 'EVALUADA' && lead.gateAbierto) return TRABAJO_TIER.CONSTRUIR
```
Nunca lee `evaluacionJson`. **El día que `FICHA → BRIEF` sea legal, la garantía se evapora y no hay
`if` que la atrape.** Y `particion.invariant.ts` seguiría verde: sus aserciones son sobre rótulos por
stage (`:193-205`), y **no existe ninguna aserción de la forma "un lead sin `evaluacionJson` nunca
recibe `ROTULO_CONSTRUIR`"**. El dato para escribirla ya está disponible —`HomeLeadInput.evaluacion`
existe (`flow.ts:331`)— y ningún camino de código lo usa para este gate.

Lo que **sí** rompe en rojo, y es la protección real: `particion.invariant.ts:202` tiene
`stage: 'EVALUADA'` **literal**, así que sacar el valor del enum no compila. La protección es del
compilador de tipos, no de los invariantes.

### P6.6 · El camino de reversión

**Dos operaciones distintas, con reversibilidades opuestas — y las decisiones las tratan como una sola.**

| Operación | ¿Reversible? | Por qué |
|---|---|---|
| Sacar la pantalla `m2` (y fusionar el veredicto en `m1`) | **Sí** | Es código. Los `switch` de `paso.ts:51-67` y `manual.ts:505-608` son exhaustivos y **no compilan** hasta contemplar el cambio (`manual.ts:604-607`: `const _exhaustivo: never = stage`). Un revert lo deshace |
| Dejar de escribir `evaluacionJson` | **Sí para el código, no para el hueco** | Los dossiers creados durante la ventana quedan sin veredicto; la métrica descarte/avance queda en `null` para ellos y no hay de dónde reconstruirla |
| Sacar `EVALUADA` de `DossierStage` | **No, sin restaurar datos** | Postgres no tiene `DROP VALUE`. Hay que recrear el tipo y reescribir la columna. **19 `ADD VALUE` y 0 borrados** en la historia del repo |

**Sobre el backup: NO VERIFICADO.** El plan y las auditorías previas registran *"P0 #1 = backup roto"*.
No es verificable desde el código y esta corrida no consultó infraestructura. Se deja anotado porque
la reversión de la tercera fila depende enteramente de él.

---

## 8 · Afirmaciones de los documentos que el código contradice

Esta sección existe porque el encargo lo pide explícitamente: si algo que los documentos afirman como
contexto resulta falso, se dice.

**A · "La infraestructura ya existe — `HARD_CHECKS`, `HARD_CHECK_PROMPT`, `guidance-content.checkId` —
y el formulario de rechazo no la usa. No hay que inventar el mecanismo: hay que conectarlo."**
(tanda-1 §4). **Los tres símbolos existen, pero ninguno es el mecanismo de G4.**
- `HARD_CHECKS` (`flow-content.ts:171`) es la **lista de los diez obligatorios** del setter — el
  catálogo, no un registro de fallos.
- `HARD_CHECK_PROMPT` (`prompts-disenio.ts`) mapea checks a prompts de arreglo **para el setter**.
- `guidance-content.checkId` (`guidance-content.ts:117`) *"casa con `HARD_CHECKS`/`SOFT_CHECKS`"* para
  colgar guía de un check.

Los tres van en la dirección *check → contenido de ayuda*. G4 pide la dirección inversa y persistida:
*rechazo → qué check estaba en verde*, y para eso no hay campo (§2.6). **"Conectarlo" subestima el
trabajo: falta el extremo que guarda.** Lo que sí es cierto es que los identificadores para nombrar el
check existen: `HardCheck.id` es estable y ya se usa como llave de mapeo.

**B · "El admin renderiza lo que el setter tildó y no muestra lo que dejó sin tildar."** (tanda-1 §3).
**REFUTADO.** — `dossier-panels.tsx:164-176`:
```tsx
{selfCheck.itemsDuros.map((item) => (
  <li key={item.nombre} …>
    {item.ok ? <CheckCircle2 … text-emerald-400 /> : <XCircle … text-rose-400 />}
    <span className={item.ok ? 'text-zinc-300' : 'text-rose-200'}>{item.nombre}</span>
```
Mapea **todos** los ítems y pinta los no tildados en **rojo**. La diferencia observada de seis versus
diez ítems tiene otra causa: `buildSelfCheck` (`flow.ts:186-196`) escribe el blob desde la lista
**vigente al momento de guardar**, y la lista pasó de seis a diez en el sprint P7 (`flow-content.ts:163-170`).
Los blobs de seis son **anteriores a P7**, no filtrados. La decisión de los tres estados sigue siendo
válida por sus otros motivos, pero **no arregla lo que este diagnóstico dice que arregla**.

**C · "El bloque que llegaba a Claude Design contenía solo `CONCEPTO` y `SECCIONES`."**
(decisiones → `m6`, el diagnóstico). **REFUTADO.** `buildConstruccionBlock` (`copy-blocks.ts:205-241`)
arma **once** secciones: `CONCEPTO`, `SECCIONES`, `LLAMADO A LA ACCIÓN`, `NOTAS DE MARCA`,
`RESEÑAS REALES`, `CONTENIDO Y TONO REAL`, `QUÉ VENDE Y A QUÉ PRECIO`,
`CÓMO HABLA EL NEGOCIO DE SÍ MISMO`, `SEÑALES OPERATIVAS`, `DE DÓNDE BAJAR EL LOGO Y LAS FOTOS REALES`
y `BRIEF COMPLETO DEL GEM DE DISEÑO`. **Lo que sí es cierto y es el punto que importa:** no hay
`PALETA` ni `TIPOGRAFIA` ni `TONO` como campos, así que la parte del diagnóstico que dice *"Claude
Design elegía fuente y paleta por su cuenta"* se sostiene entera.

**D · "`espera` y `revision` dicen lo mismo palabra por palabra."** (decisiones → estados terminales).
**Media.** Las **pantallas** ya dicen cosas distintas — `manual.ts:275-287`: `espera` es
*"Esperando respuesta / La pelota la tiene el negocio"*; `revision` es *"Franco está revisando tu
demo"*. Lo que sí comparte texto es la capa del **turno**: `turnoDelLead` devuelve `'franco'` tanto
para `EN_REVISION` como para `APROBADA` sin `finalUrl` (`turno.ts:74,80`), y las dos muestran el mismo
`TEXTO_TURNO.franco` (`turno.ts:117-123`). El defecto está una capa más abajo de donde la decisión lo
ubica.

**E · La dependencia de `m6`: "el bloque que `m6` le pasa al Gem tiene que incluir la ficha entera —
reseñas crudas, qué vende y a qué precio, cómo habla el negocio de sí mismo. A verificar contra el
código."** **VERIFICADO Y YA SATISFECHO.** `buildBriefInputBlock` (`copy-blocks.ts:87-99`) es
`buildFichaCopyBlock` más el bloque de evaluación, y `buildFichaCopyBlock` (`:32-84`) incluye las tres
cosas nombradas (`:75` reseñas, `:79` qué vende, `:80` cómo habla). **Con un cabo suelto que importa
para el premortem: `evaluacion` es un parámetro obligatorio de esa función.**

**F · "Aprobada sin link permanente… el schema exige `finalUrl` para aprobar, así que el admin no
puede producir este estado. A verificar."** (tanda-1 §6). **Resuelto en dos mitades:**
- **La UI del admin no puede**: `AprobarRevisionSchema.finalUrl` es requerido y con formato
  (`revision.schemas.ts:14-25`, `FinalUrlSchema` exige `https://`).
- **El motor sí puede**: `dossier.ts:213-217` no lanza si falta —
  ```ts
  data.aprobadaAt = new Date()
  const finalUrl = input.finalUrl?.trim()
  if (finalUrl) { data.finalUrl = finalUrl }
  ```
  El estado es alcanzable por cualquier otro llamador de `transitionDossier`. Y el producto **ya lo
  modela**: `turno.ts:80` — `if (input.stage === 'APROBADA' && input.finalUrl === null) return 'franco'`.
  Así que el fixture observado es producible; la puerta cerrada es la del formulario, no la del motor.

**G · El comentario de `OsLead.caliente` en el schema es falso.** Ver §6.

**H · Referencias cruzadas mal numeradas dentro de `decisiones-por-pantalla.md`.** `m4` y `m15` dicen
*"Ver el hueco G8"* / *"(G8)"* para el ángulo wow, que es **G2**; `m13` dice *"Ver hueco G4"* para
*"¿Exportaste después del último refinamiento?"*, que es **G3**. No cambia ninguna decisión; se anota
porque los sprints se derivan de esos punteros.

**I · Sobre el conteo de superficies.** Los documentos hablan de *"trece superficies"*, *"las catorce
superficies"* y *"las quince pantallas"* en distintos lugares. El código tiene **quince**:
`PANTALLA_IDS` (`manual.ts:45-61`) = `m1 m2 m4 m5 m6 mc1 mc2 m13 m14 m15 m16 mr espera revision archivo`,
de las cuales **once** están en `ORDEN_MANUAL` (`manual.ts:381-393`) y cuatro son estados o reentrada.

---

## 9 · Lo que esta corrida NO auditó

Sin dictamen, por el techo declarado en §0. Se listan para que no se lean como "verificado y sin
hallazgos":

1. **El sistema de interacción `S1`–`S8`** — no se contó cuántos archivos toca cada uno. `S3` (acción
   principal fija) y `S4` (orientación permanente) son los de mayor superficie y no se midieron.
2. **La regla transversal de las municiones** — no se hizo el censo de plegables ni se localizó la
   salida *"pedíselo a Franco"* citada en las decisiones.
3. **G8, el estado de disclosure recordado** — no se buscó si hay persistencia (cookie, `localStorage`, DB).
4. **El layout de la cola de revisión del admin** y el reordenamiento propuesto en tanda-1 §2.
5. **El dedup novedades ↔ foco** para mover aprobadas y rechazos a la cola de trabajo. Se verificó que
   son dos fuentes distintas (`OsSetterNotice` con `kind` versus la derivación de `OsLead`+dossier),
   pero no se leyó el dedup del sprint 2.2.
6. **`m16` más allá de `getCalConfigLeadOS`** — el gate del check del dueño y la traducción del error
   de Cal.com no se verificaron.
7. **Los 19 dictámenes de lectura estática** que el plan manda reemplazar con A2.
8. **La cuenta real de leads en `EVALUADA`** — regla de la auditoría: cero consultas a la base.

---

## 10 · Verificación de no contaminación

Diff completo contra el commit de arranque (`58a383f7`), en el worktree de trabajo, antes de commitear:

```
$ git status --porcelain
 M logic-core-v3/docs/bitacora-beta-3.md
?? logic-core-v3/docs/auditorias/A3-VIABILIDAD-DECISIONES-2026-08.md
?? logic-core-v3/docs/diagnostico-visual-2026-08/png.zip

$ git diff --stat 58a383f7
 logic-core-v3/docs/bitacora-beta-3.md | 78 +++++++++++++++++++++++++++++++++++
 1 file changed, 78 insertions(+)
```

**Cero `src/`. Cero `tests/`. Cero configuración. Cero `prisma/`.** Lo único que esta corrida escribe
es este archivo y su entrada de bitácora. El `png.zip` de `docs/diagnostico-visual-2026-08/` ya estaba
sin commitear al arrancar, no es de esta sesión y no se tocó.

---

*A3 · paso 1 de la auditoría externa · `leados/v1-integracion` @ `58a383f7` · agosto 2026.*
*El paso 2 —la revisión adversarial del diseño, sin código— no se corrió en esta sesión.*
