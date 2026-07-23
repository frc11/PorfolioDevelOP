# MAPA DEL SISTEMA — LeadOS / Panel del Setter

> **Para quién es.** Para alguien que va a tocar esto por primera vez. Explica cómo funciona **hoy**
> (2026-07-23, HEAD `6a88cbe`) a nivel sistema: el motor y sus garantías, la derivación de pantallas,
> las capas de datos, y dónde están las líneas rojas y por qué.
>
> **Cómo está escrito.** Desde el código. Cada afirmación estructural cita `archivo:línea`. Lo que se
> **infirió** (de la bitácora, de las auditorías o por lectura sin ejecución) está marcado **[INFERIDO]**.
> Esta corrida fue read-only: **no se ejecutó nada** — ni `build`, ni suites, ni invariantes. Los verdes
> mencionados son los que la bitácora reporta.
>
> Documentos hermanos: [`LECCIONES-LEADOS.md`](LECCIONES-LEADOS.md) (cómo se trabajó) ·
> [`PROPUESTA-CIMIENTO.md`](PROPUESTA-CIMIENTO.md) (qué cambiar del método).

---

## 0. Qué es esto en dos párrafos

LeadOS es el panel donde un **setter** (vendedor, sin experiencia técnica ni con IA) trabaja leads de
punta a punta: carga un negocio, arma su ficha, lo evalúa con una IA externa ("el Evaluador"), le manda
el primer mensaje (**opener, sin link**), y **sólo si el negocio responde** produce una demo:
brief → construcción guiada en 6 fases → borrador publicado → chequeo final → revisión de Franco →
envío del link → reunión agendada por Cal.com. **Franco** (el admin, `SUPER_ADMIN`) revisa cada demo,
aprueba o rechaza, marca los leads "calientes" y decide los cierres.

Eso se llama **flujo invertido**: el link de la demo no viaja nunca antes de que (a) Franco apruebe y
(b) el negocio haya respondido o esté marcado caliente. Es la regla central del producto y está
enforzada en el servidor, no en la UI.

Desde el corte del Sprint 5.6 (`75b9d7f`), la experiencia del setter es **el manual paso-por-pantalla**:
16 pantallas (`m1`…`m16`) + reentrada de rechazo (`mr`) + 3 estados (`espera`, `revision`, `archivo`).
El wizard de página larga que existía antes **fue retirado** (16 archivos, −3.192 líneas); la ruta vieja
`/setter/leads/[leadId]` es hoy un redirect al manual.

---

## 1. Las cuatro capas

```
┌─ PRESENTACIÓN ──────────────────────────────────────────────────────────────┐
│  app/(protected)/setter/                                                    │
│    page.tsx (home: foco → novedades → cartera → números → semana)           │
│    leads/[leadId]/ → redirect                                               │
│    leads/[leadId]/manual/            page.tsx (entrada) · _data.ts          │
│    leads/[leadId]/manual/[paso]/     page.tsx (router de slots + GUARDIA)   │
│    leads/[leadId]/manual/_components/  m1..m16, mr, estados, forms locales  │
│    leads/[leadId]/_components/         forms compartidos (ficha/eval/       │
│                                        opener/brief) + timeline + modal     │
│    nuevo/ · nuevo/importar/            las dos vías de alta                 │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ props (server components) / server actions
┌─ ACTIONS (13 archivos) ────┴────────────────────────────────────────────────┐
│  setter/_actions/  dossier · outreach · agenda · cartera · foco ·           │
│                    novedades · prospecto · prospecto-bulk (+ *.schemas.ts)  │
│  Cada una: requireSetter() → Zod → ownership → motor → revalidatePath       │
└────────────────────────────┬────────────────────────────────────────────────┘
┌─ MOTOR / DOMINIO ──────────┴────────────────────────────────────────────────┐
│  lib/leados/  flow.ts (gates, partición, foco) · dossier.ts (LA puerta del  │
│               stage) · manual.ts (derivación de pantalla) · paso.ts ·       │
│               agenda.ts (claim + Cal.com) · isolation.ts · ownership.ts ·   │
│               escalamiento.ts · contracts.ts (Zod de los blobs) · revision  │
│  lib/os-commercial.ts (write comercial COMPARTIDO con admin)                │
│  + 17 *.invariant.ts ejecutables (check:invariants)                         │
└────────────────────────────┬────────────────────────────────────────────────┘
┌─ DATOS ────────────────────┴────────────────────────────────────────────────┐
│  Prisma / Neon:  OsLead (+ status, caliente, assignedToId, nextFollowUpAt,  │
│                  reactivateAt) · OsLeadDossier (stage + 6 blobs JSON) ·     │
│                  OsLeadActivity · OsDemo · OsLeadSetterMeta (pin/snooze)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Regla de dependencia:** la presentación **lee** del motor y **escribe** por actions. Ningún componente
del manual toca Prisma — la regresión final lo verificó por grep: «`manual/_components` → **0 matches**
de prisma» (`REGRESION-FINAL-2026-07.md`, vía bitácora:1174).

---

## 2. El motor y sus garantías

### 2.1 La máquina de stages — `dossier.ts`

`OsLeadDossier.stage` avanza sólo por transiciones legales, declaradas como tabla
(`dossier.ts:51-58`):

```
FICHA        → EVALUADA
EVALUADA     → DESCARTADA | BRIEF
BRIEF        → CONSTRUCCION
CONSTRUCCION → EN_REVISION
EN_REVISION  → APROBADA | RECHAZADA
RECHAZADA    → CONSTRUCCION      ← el ÚNICO loop-back
APROBADA     → (terminal)
DESCARTADA   → (terminal)
```

**`transitionDossier` es LA única puerta del stage** (`dossier.ts:134`). Lo que hace y que ningún caller
puede saltear (`dossier.ts:114-131`):

- valida contra la tabla y lanza `DossierTransitionError('Transición ilegal: X → Y')` (`:148`);
- **relee el lead adentro** (`status`, `caliente`) para aplicar el gate del brief: «Lee el lead acá
  adentro; **no confía en el caller**» (`dossier.ts:123-125`);
- exige la evaluación parseada para EVALUADA, `motivoDescarte` para DESCARTADA, y `motivo` para
  RECHAZADA (que **appendea** al historial `rechazos[]`, no lo pisa);
- aplica dos resets:
  - `ESCALADO_RESET` en **toda** transición (el «me trabé» es de la construcción vigente);
  - `RELOOP_RESET` **sólo** en `RECHAZADA→CONSTRUCCION` (`escalamiento.ts:71-79`) — limpia el
    self-check (que es un **gate**) y **preserva** `progresoJson` (checklist, auto-reporte) y `draftUrl`.

**Quién puede transicionar no se decide acá**: el setter llega por ownership (`getOwnedDossier`), el
admin por `requireSuperAdmin()` (`dossier.ts:127-130`).

### 2.2 Los cuatro gates

| Gate | Dónde | Regla | Quién lo re-valida |
|---|---|---|---|
| **Brief** (EVALUADA→BRIEF) | `flow.ts:79-81` | `leadRespondio(status) ∨ esCaliente(caliente)` | `transitionDossier` server-side + la UI lo **recibe**, no lo re-deriva |
| **Envío a revisión** (CONSTRUCCION→EN_REVISION) | `flow.ts:188` `selfCheckAprobado` + `draftUrl` | los 6 hard-blocks **vigentes** en verde | `enviarARevision` re-valida contra la DB, no contra la UI |
| **Envío del link** (la línea inviolable) | `flow.ts:90-101` `gateEnvioDemo` | `stage==='APROBADA' ∧ finalUrl ∧ gateBriefAbierto(...)` | `enviarDemoAprobada` + claim atómico `marcarDemoEnviadaOwned` |
| **Agenda** | `agenda.actions.ts:84` `gateAgenda` | `RESPONDIO` ∧ sin reunión | la action, antes de tocar Cal.com |

Dos propiedades que valen para los cuatro:

1. **Una sola copia de cada regla.** `gateEnvioDemo` **compone** `gateBriefAbierto` en vez de repetirlo
   (`flow.ts:99`) — y hay un invariante que fija exactamente esa composición
   (`gate-envio-demo.invariant.ts:7-13`), justamente para que no aparezca drift server↔UI.
2. **El servidor desconfía de la UI.** `selfCheckAprobado` valida contra `HARD_CHECKS` **vigente**, no
   contra lo que el blob afirme tener (`self-check-gate.invariant.ts:12-16`) — un payload hostil "todo
   aprobado" con ids inventados no saltea nada. `outreach.actions.ts:166` lo dice en una línea: «el
   manual ya no ofrece m5 para estos, pero **la action no confía en la UI**».

### 2.3 Aislamiento multi-tenant (ownership)

**No hay RLS: el aislamiento es 100% de capa de aplicación** — [INFERIDO de `AUDITORIA-VS-BRIEF`, citado
en bitácora:673]. La regla de oro está escrita en `ownership.ts:4-13`:

1. toda lectura de listas filtra `where: { assignedToId: userId }`;
2. **toda** server action llama `requireSetter()` **y** re-verifica el lead puntual con `getOwnedLead()`
   antes de leer o mutar — nunca se confía en un `leadId` que vino del cliente;
3. `getOwnedLead` devuelve `null` si el lead no existe **o** no es suyo — el caller trata ambos casos
   igual, para **no leakear existencia**.

Los `where` viven en un solo lugar, `isolation.ts` («si un día cambia el aislamiento, cambia acá y en un
solo lugar», `isolation.ts:7-9`): `ownedLeadWhere` (lectura puntual), `ownedListWhere` (listas),
`ownSetterMetaWhere` (el meta privado pin/snooze/nota — un lead reasignado **no** arrastra la nota del
setter anterior), y el espejo de **escritura** `ownedLeadCreateData` (`isolation.ts:75`), que arma el
registro **campo por campo, no con spread**, forzando `assignedToId` = sesión, `caliente: false` y
`source: 'Setter'`. Un `assignedToId` inyectado por el cliente **ni se lee**.

**La única excepción documentada**, y es deliberada: el dedup de la importación masiva consulta
**existencia global** de nombres para no duplicar leads a nivel equipo. Está implementada como la
excepción más angosta posible —devuelve **un bit** por nombre, jamás el dueño ni dato ajeno— y vive en
la action, **nunca** en `isolation.ts` (`prospecto-bulk.actions.ts:125`, «EXCEPCIÓN DELIBERADA y
ACOTADA al aislamiento de LECTURA»).

### 2.4 Claims atómicos (concurrencia)

Dos operaciones son irreversibles hacia afuera —enviar el link y crear un booking real en la agenda de
Franco— y las dos se arbitran con **un solo `updateMany` condicional**, sin read-para-decidir:

- **Envío de demo:** `marcarDemoEnviadaOwned` (`dossier.ts:412`) actualiza `where enviadaAt: null`. Dos
  envíos simultáneos ⇒ **un** `OsDemo`: el ganador lo crea, el perdedor se compensa solo.
- **Agenda:** `marcarAgendandoOwned` (`agenda.ts:165`) con `where: { leadId, OR: PARTIDA_RECLAMABLE }`
  (`agenda.ts:145-148`), donde reclamable = blob vacío **o** blob en estado `OFRECIDOS`. Un lead en
  `AGENDANDO` o `AGENDADA` no matchea ninguna rama: no es reclamable.

Detalle que importa al tocar esto (Sprint 6.1): el pre-read de `getOwnedDossier` da **forma** al payload
(arrastra la memoria de la oferta dentro del claim) pero **nunca decide quién gana** — si esa lectura
quedó vieja, el perdedor igual pierde en el `where`. Y la compensación (`revertirAgendandoOwned`,
`agenda.ts:206`) **restaura el estado previo al claim** en vez de vaciar el blob, para que un fallo de
Cal.com no se coma los horarios que el prospecto ya tiene en el chat.

Cobertura: `tests/setter/06-claim-atomico.spec.ts` (envío) y `12-claim-agenda.spec.ts` (agenda, sección
G, 10 casos). **Límite declarado** por el propio spec: `Promise.all` sobre la primitiva son dos
transacciones desde **un solo proceso Node** — no reproduce dos navegadores distintos (bitácora:1630).

### 2.5 El write comercial — `os-commercial.ts` (zona compartida)

`registrarContactoComercial` (`os-commercial.ts:54`) es el write que mueve `status`, `nextFollowUpAt` y
`reactivateAt` al registrar un toque. **Lo comparten el setter y el admin** (4 callers censados en el
Sprint 2.1, bitácora:1296) — por eso el método del repo lo trata como **"motor-adyacente"**: test
primero, y FRENAR si el cambio pide tocar una transición.

La cadencia de follow-up es `+2 / +2 / +3` días y **para a los 3 toques** (`follow-up.ts`
`calculateNextFollowUp`, presentado por `cadenciaInfo`, `flow.ts:227`). El Sprint 2.1 arregló acá el bug
que hacía que un lead con cadencia agotada quedara **eterno en la cola de trabajo**: la rama
SIN_RESPUESTA ahora escribe siempre `nextFollowUpAt` (valor **o null**), en vez de sólo cuando había
valor.

**El cierre a PERDIDO no se automatiza**: es decisión de Franco, por guardarraíl explícito
(`AUDITORIA-CIERRE`, §8 «Descartadas por guardarraíl»).

---

## 3. La derivación de pantallas — `manual.ts`

**La posición del setter no se persiste nunca.** Se **re-deriva en cada request** a partir del estado
real (`manual/page.tsx:11-14`). No hay campo "paso actual" en la base: no puede quedar desincronizado,
y no hay que migrar nada cuando cambia el mapa.

### 3.1 El registro

`PANTALLA_IDS` (`manual.ts:41-63`) declara 20 ids: `m1..m16` + `mr` (reentrada) + `espera`, `revision`,
`archivo` (estados). `PANTALLAS` (`:137`) les da tipo, título-instrucción y fase. `m7..m12` son las 6
fases de Construcción y toman su copy de `SHELL_CONSTRUCCION` (única fuente editable).

### 3.2 La función

`derivarPantalla(input) → { actual, completadas[], habilitadas[] }` (`manual.ts:609`). Entrada: stage,
status, caliente, ficha, draftUrl, progreso, agenda, contactos, followUpCount, followUpVencido,
finalUrl, demoEnviada (`:337-358`). **Pura y sin reloj propio** — `followUpVencido` ya viene resuelto por
el caller, así que misma entrada ⇒ misma salida.

Semántica de las tres listas (`manual.ts:369-374`):
- `actual`: dónde aterriza el setter.
- `completadas`: lo hecho — **navegable sin resetear nada** (atrás siempre libre).
- `habilitadas`: dónde puede trabajar ahora.
- Todo lo demás es **futuro**: no se renderiza, ni siquiera como fachada con candado.

**Invariante interna:** `actual` siempre es accesible (∈ completadas ∪ habilitadas). Sin eso, la guardia
del servidor entraría en **loop de redirects** — y por eso `derivarPantalla` la fuerza explícitamente
(`:614-619`).

### 3.3 Cómo deriva

`posicionDe` (`manual.ts:482`) tiene **una rama temprana antes del switch**: `status === 'PERDIDO'` →
`{ actual: 'archivo', habilitadas: [] }` (`:493`). Un negocio que Franco cerró no puede derivar a m5
pidiendo contactarlo, en ningún stage. `CERRADO` (que es **ganado**) no cae al archivo: mantiene su
aterrizaje por stage. `DESCARTADA` (terminal por **stage**) conserva su case (m3, el veredicto a la
vista) — su cyan lo apaga la presentación, no la derivación.

Después, `switch (stage)` **exhaustivo con never-guard**: un stage nuevo **rompe el build** hasta
contemplarse (`manual.ts:479-480`).

**Una sola fuente del "paso del lead".** La rama EVALUADA no re-deriva a mano: llama a
`derivarPasoDelLead` (`paso.ts`), la misma función que alimentaba el rail y el cartel del wizard, «así
el manual y el wizard NUNCA pueden desincronizarse» (`manual.ts:470-475`). La rama APROBADA **sigue
llamando a `gateEnvioDemo` directo a propósito**: exige `finalUrl`, un factor que `derivarPasoDelLead`
no recibe; leer el gate genérico ahí cambiaría el comportamiento en el borde `finalUrl=null`
(`manual.ts:475-479`). Esa costura se cerró en el Sprint 5.0 y se probó con un oráculo temporal sobre
**331.776 combinaciones**, 0 mismatches (bitácora:852).

### 3.4 La guardia es del servidor

`manual/[paso]/page.tsx:44-63`:

- lead ajeno o inexistente → `notFound()` (regla de oro de ownership);
- id de pantalla desconocido → `redirect` a la actual;
- pantalla ni habilitada ni completada (**el futuro**) → `redirect` a la actual, sin renderizarse;
- completadas → navegables, sin resetear nada.

Advertencia para tests: `notFound()` en esta ruta devuelve **status 200** (streaming), no 404 — el
aislamiento se afirma **por contenido**, no por código de estado [INFERIDO de la memoria de proyecto y
de cómo están escritos los specs de `02-isolation`].

### 3.5 Auto-reporte ≠ gate

Las 6 fases de Construcción (`m7..m12`) están **siempre habilitadas** en BRIEF/CONSTRUCCION/RECHAZADA,
navegables en cualquier orden: tildarlas es **auto-reporte**, jamás gate (§6-3 del brief;
`manual.ts:535`, `fase-auto-reporte.tsx:17`, `m-construccion.tsx:26`). `progresoJson` **nunca** se
cablea a la transición EN_REVISION — lo fija `progreso-isolation.invariant.ts`.

Lo que **sí** condiciona: `m13` (borrador) recién en CONSTRUCCION, y `m14` (chequeo) sólo con draft
publicado. Son gates **del motor**, no del checklist. Desde el Sprint 3.3, el tilde se muestra
`disabled` con motivo fuera de CONSTRUCCION — **espeja** el guard que `saveOwnedProgreso` ya aplicaba
(`dossier.ts:391-393`), no agrega uno nuevo.

---

## 4. Capa de datos

### 4.1 Modelo

- **`OsLead`** — el negocio. Campos que gobiernan el flujo: `status` (`LeadStatus`), `caliente`
  (**exclusivo de Franco**), `assignedToId` (**la frontera de aislamiento**), `nextFollowUpAt`,
  `reactivateAt`, `pinned` (vía meta), `source`.
- **`OsLeadDossier`** — el trabajo sobre ese lead: `stage` + seis blobs JSON validados por Zod
  (`contracts.ts`): `fichaJson`, `evaluacionJson`, `briefJson`, `selfCheckJson`, `progresoJson`,
  `agendaJson`, más `draftUrl`, `finalUrl`, `enviadaAt`, `escaladoAt`/`escaladoNota`, `rechazos[]`.
- **`OsLeadActivity`** — los toques. Un evento interno (`ActivityChannel.SISTEMA`, p. ej. una
  reasignación) **no es un contacto comercial**: queda en el historial pero las lecturas comerciales lo
  excluyen con `SOLO_CONTACTOS_COMERCIALES` (`isolation.ts:10-13`).
- **`OsDemo`** — la demo enviada (lo que el claim atómico protege de duplicarse).
- **`OsLeadSetterMeta`** — pin / snooze / nota, **privado por setter**.

**Los blobs se parsean con contrato, siempre.** `parseFicha`/`parseEvaluacion`/`parseBrief`/
`parseSelfCheck`/`parseProgreso`/`parseAgenda` (`flow.ts:105-153`) son tolerantes: un blob inválido da
`null` (o el default fresco), no una excepción. Las extensiones del contrato son **aditivas y
opcionales** a propósito — un blob viejo nunca deja de parsear (`contracts.ts:149`).

### 4.2 La carga de una pantalla

`cargarManualDelLead` (`manual/_data.ts:128`) es la **única** puerta de datos del manual:

```
requireSetter()  →  getOwnedLead(leadId, userId)  →  null ⇒ notFound()
                 →  Promise.all([ getOwnedDossier, listOwnedLeadActivities,
                                  contarDmsHoy, getUltimaAsignacion,
                                  listOwnedLeadTimeline ])
                 →  parseos + countFollowUps + reloj request-time
                 →  derivarPantalla(...)  →  ManualDelLead
```

Es **solo lectura**: el manual no escribe ni transiciona nada desde acá. Cada pantalla nueva suma
**sólo** los campos que re-sirve, espejando las reglas que ya existen (por ejemplo `fichaEditable` = la
misma regla de siempre: editable hasta que la evaluación quede registrada) — nunca inventando reglas
nuevas en la capa de datos.

### 4.3 Escrituras

Toda escritura pasa por una server action con la misma forma:
`requireSetter()` → **Zod** → ownership (`getOwnedLead`/`getOwnedDossier`) → motor → `revalidatePath`.
13 archivos de actions; `requireSetter` aparece en los 8 que mutan.

Las dos presentaciones históricas (wizard y manual) **compartían el write-path**: el manual re-presenta
las mismas actions y los mismos schemas. Por eso los forms extraídos (`ficha-form`, `evaluacion-form`,
`opener-form`, `brief-form`) viven en `leads/[leadId]/_components/` (compartidos) y los del manual
(`borrador-form`, `chequeo-form`, `envio-form`, `seguimiento-form`, `agenda-form`) en
`manual/_components/` — un solo camino de escritura por dato, dos presentaciones.

---

## 5. El home: cómo se elige el foco

`flow.ts` deriva todo el home, en tres pasos puros:

1. **`clasificarLead`** (`:508`) → `grupoPara` (`:374`) reparte en 5 colas con **precedencia declarada**
   (`flow.ts:361-373`): archivo (PERDIDO ∨ DESCARTADA) → agendadas (CALL_AGENDADA) → revisión
   (EN_REVISION) → seguimiento (POSTERGADO, EVALUADA con gate cerrado, APROBADA) → **trabajar** (el resto).
2. **`particionarCartera`** (`:608`) aplica las palancas del setter con precedencia deliberada
   (`:588-606`): el archivo manda (ni pin ni snooze lo rescatan); un fijado **accionable y vigente** entra
   a `trabajar` **en la cima**; un fijado en vuelo o fijado+pausado va a `fijados`; pausado a `pausados`.
3. **`ordenFoco`** ordena `trabajar` (pin primero, después urgencia) y **`motivoOrden`** (`:500`) da el
   rótulo honesto de por qué ese lead está arriba.

Dos garantías del home que conviene conocer antes de tocarlo:

- **El pin ordena, no excluye** (A-05, Sprint 6.1). Antes, fijar tu única accionable dejaba el home en
  "todo en espera" con un fijado esperando. Está fijado por `particion.invariant.ts` con 5 escenarios.
- **Novedades informan, no reconstituyen una cola** (A-06, Sprint 6.2). El «Abrir» de un aviso **ancla el
  foco** por el mismo mecanismo que "Ir a trabajarlo" (`anclarFoco`), y no hay ningún link en esa región
  — hay una guarda e2e que lo verifica (`00-surfaces.spec.ts`, A4: `getByRole('link')` → 0).

El **sticky** del foco (que el setter no pierda el lead que está trabajando) se respeta **sólo mientras
el lead siga en `trabajar`**: si dejó de ser accionable, `seleccionarFoco` lo ignora en silencio y el
foco recae en la cima (bitácora:1057).

---

## 6. Líneas rojas — qué no tocar y por qué

| Línea roja | Dónde | Por qué |
|---|---|---|
| **La línea inviolable del envío** | `flow.ts:90-101` + `outreach.actions.ts` + `marcarDemoEnviadaOwned` | El link no viaja antes de que Franco apruebe **y** el negocio enganche. Es la regla central del producto. Cubierta por invariante + negativo e2e + claim atómico. |
| **`transitionDossier`** | `dossier.ts:134` | Única puerta del stage. Todo lo que la evite (un `prisma.update` de `stage` directo) rompe las reglas que valida. |
| **Los `where` de ownership** | `isolation.ts` | Cambiar acá cambia el aislamiento de todo el setter. Los invariantes fijan el contrato. |
| **Los claims atómicos** | `dossier.ts:412`, `agenda.ts:165` | Sin ellos, doble click ⇒ demo duplicada o booking duplicado en la agenda real de Franco. |
| **`ESCALADO_RESET`** | `escalamiento.ts` | Corre en **cada** transición: cualquier campo agregado ahí se borra en todas. Ver la trampa documentada abajo. |
| **`caliente`** | `OsLead.caliente`, `esCaliente()` | Es el flag operativo de **Franco**. El setter no lo marca; el score del Evaluador sólo **sugiere** prioridad. |
| **El cierre a PERDIDO** | — | Decisión de Franco, nunca automatizada. |
| **`prisma migrate reset`** | — | **Prohibido** por `CLAUDE.md`. Ante drift: FRENAR y reportar. |
| **`src/components/3d/HeroArtifact.tsx`** | — | Frozen (ajeno a LeadOS, pero rige en el repo). |

### Tres trampas concretas, ya pagadas

1. **`ESCALADO_RESET` corre en cada transición.** Un pedido de backlog fue «agregar `selfCheckJson` al
   `ESCALADO_RESET`». Habría borrado el self-check también en `CONSTRUCCION→EN_REVISION`, donde el admin
   lo lee en su panel de revisión — el panel lo habría reportado como anomalía **en cada revisión
   normal**. Se resolvió con `RELOOP_RESET` acotado por `esReloopRechazo` (`escalamiento.ts:71-79`).
2. **El auto-reporte no puede volverse gate.** `progresoJson` es checklist; cablearlo a la transición
   rompe el §6-3 del brief y el invariante `progreso`.
3. **Retirar una superficie deja su vocabulario vivo.** El wizard se fue en `75b9d7f`; su numeración
   («Paso 7/9/5») sobrevivió en el copy más visible hasta el barrido de `612c4ee`, y su naming interno
   sigue hoy en `paso.ts:33` («Secciones **del wizard**…»).

---

## 7. Verificación: qué corre y qué prueba

| Comando | Qué corre | Qué prueba | Qué **no** prueba |
|---|---|---|---|
| `npm run check:invariants` | 17 invariantes puros, sin DB ni server (`package.json:18`) | Composición de gates, aislamiento, derivación, resets, partición | Nada de integración: son funciones puras |
| `npm run test:leados` | `playwright.leados.config.ts`, **sin `webServer`** — in-process contra la DB | Motor del dossier: gates, transiciones, re-loop, anti-bypass, alta/import | Nada de UI |
| `npm run test:setter` | `playwright.setter.config.ts` con `webServer: start:qa` (prod-QA :3001) | Recorrido punta a punta en browser real, aislamiento cruzado en vivo, claim, mobile, a11y | Lanes ajenos |
| `npm run build` | `next build --webpack` | Que compila y el árbol de rutas | Tipos, si `ignoreBuildErrors: true` |
| `npx prisma migrate status` | — | Que las migraciones están aplicadas | **Drift físico** — eso lo caza `migrate diff` |
| `npm run test:e2e` | batería global | Lanes dashboard/cliente/admin | Tiene rojos **pre-existentes y ajenos** al setter (login de cliente/admin), documentados desde el sprint 4.1 |

**Dos trampas del harness que ya están arregladas y conviene conocer:**
`start:qa` encadena `npm run build` desde `178c4d7` (antes servía el `.next` viejo ⇒ falso rojo), y por
eso el `webServer` de Playwright tiene `timeout: 300_000` desde `fccbeb7` (los 120s no alcanzaban con el
build adentro).

**Cierre estándar del setter** [INFERIDO de la práctica repetida en los cierres de bitácora, no de un
documento normativo]: `tsc --noEmit` → `check:invariants` → `test:leados` → `build` → `test:setter` →
`migrate status`, cada uno con su exit code leído sin pipe.

---

## 8. Lo que este mapa NO establece

- **Nada verificado en runtime.** Corrida read-only: no se corrió build, ni suites, ni invariantes.
  Los números citados (17 invariantes, 25/25 leados, 60/60 setter) son los que **la bitácora reporta**
  al cierre del sprint 6.2, no medidos acá.
- **El brief de visión** (`docs/brief-vision-flujo-setter.md`) **no existe en el repo** — las referencias
  a §4/§6-3/§8 vienen de las auditorías y los comentarios del código, que lo citan sin poder mostrarlo.
- **Volumen de producción desconocido.** No se miró la DB. El impacto de la cartera sin paginación
  (C-14) no se puede dimensionar desde acá.
- **La superficie de admin** (revisión, aprobación, asignación) se mapeó **sólo** en lo que toca al
  setter (quién pone `finalUrl`, quién marca `caliente`, quién cierra a PERDIDO). No se auditó.
- **Deudas vivas conocidas al 2026-07-23**, para que nadie las descubra como sorpresa: las 4 URLs
  pendientes de `herramientas.ts` (decisión de Franco, bloquea la ejecutabilidad real de ~11 pantallas);
  los 39 hallazgos (b) del smoke-test 7.0; el drift físico de 7 columnas del lane chatbot; el naming
  histórico del wizard en `paso.ts`; y la contradicción `setter-nav.tsx:38` ↔ `CLAUDE.md` sobre
  `triggerTransition` en la zona `/setter/*`.

---

## 9. Si vas a tocar esto, en orden

1. **Leé los comentarios de decisión de la zona antes que el backlog.** Grep de `a propósito`,
   `deliberad`, `decisión`, `precedente`, `NO se toca`, `§`. Muchas decisiones **sólo** viven ahí.
2. **Ubicá tu cambio en la capa.** Presentación / action / motor / datos. Si tu cambio "de presentación"
   te pide tocar `dossier.ts`, `flow.ts` (gates) o `isolation.ts`, **no es de presentación**: cambiá de
   protocolo (test primero, FRENAR y reportar).
3. **Censá la cobertura real de la zona**, no el número de la suite: ¿qué spec ejercita esa primitiva, y
   la ejercita o la saltea sembrando su efecto?
4. **Si no hay red y el cambio es riesgoso, escribí primero el test de caracterización** (sprint propio,
   diff cero en `src/`).
5. **Corré el cierre estándar** con los exit codes leídos sin pipe, y reportá **qué prueba y qué no**
   cada chequeo.
6. **Commiteá lo colateral en el momento**, con el ID de la ficha en el mensaje.
