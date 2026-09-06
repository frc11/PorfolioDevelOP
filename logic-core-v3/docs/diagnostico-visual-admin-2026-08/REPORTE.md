# Corrida de experiencia — el lado de Franco

**Qué es esto.** El primer juego de capturas del panel del ADMIN tal como está hoy, con un
[MANIFIESTO](MANIFIESTO.md) generado por la propia corrida: cada fila trae el estado leído de
la base al disparar, las dimensiones leídas del IHDR del archivo, el md5, y el texto de la
pantalla transcripto desde el DOM.

**Esta corrida no opina.** Produce imágenes y declara qué fotografió. Jerarquía, densidad,
aglomeración y copy los decide Franco mirando. Tampoco concluye si algo está bien o mal.

---

## Terreno

| | |
|---|---|
| Base pedida | `cbfaa27f14121a294b7ad72565ab361072ecb166` |
| Base real de la rama | `88b5d325` — **la rama avanzó un commit** (ver abajo) |
| Base usada | `cbfaa27f` exacto, en worktree detached propio |
| Worktree | `C:/tmp/wt-corrida-admin` — **propio**, `node_modules` por junction |
| Build | producción, `E2E_DIST_DIR=.next-corrida-admin`, **exit 0** (5,4 min) |
| Puerto | `127.0.0.1:3022` — propio; no 3000/3001/3003/3004/3005/3006/3013 ni el 3021 de la corrida del setter |
| Procesos | nada escuchaba en 3000-3100 al empezar; no se mató ningún proceso ajeno |
| Login | JWT minteado client-side, **leído de `tests/helpers/setter-auth.ts`**, no inventado |

### La discrepancia de hash, y por qué no frené

`leados/v1-integracion` está en `88b5d325`, no en `cbfaa27f`. Antes de frenar lo verifiqué:

- `cbfaa27f` **es ancestro directo** de `88b5d325` (`git merge-base --is-ancestor` → sí).
- El delta es **un solo commit**: `docs(diagnostico): las primeras 47 capturas del panel del setter`.
- Toca 4 archivos, **todos bajo `docs/`** — cero `src/`, cero tests, cero configuración.

Es el commit de cierre de la corrida hermana, sin pushear. El código de producto es idéntico.
Aun así **el worktree se creó sobre `cbfaa27f` exacto**, para que el manifiesto declare
literalmente la base pedida.

### Chequeos de Fase 0

Árbol limpio · 2 stashes · 13 worktrees censados · nada escuchando en 3000-3100.
`f1`, `f2`, `f3`, `main`, los stashes y los worktrees ajenos quedaron intactos.

---

## Paso 1 — la línea base de datos

Censo antes → seeds → limpieza de huérfanas → censo después. **Los dos censos son idénticos**:
los seeds son convergentes y no había nada que limpiar.

| | antes | después |
|---|---|---|
| Leads total / del setter QA / sin asignar | 111 / 76 / 7 | **111 / 76 / 7** |
| Novedades del setter QA: total / sin leer / huérfanas | 3 / 3 / 0 | **3 / 3 / 0** |
| Dossiers en la cola de Franco (`EN_REVISION`) | 13 | **13** |
| Fixtures QA-W / QA-M | 13 / 4 | **13 / 4** |
| Escalamientos vivos ("me trabé") | 1 | **1** |

La limpieza de novedades huérfanas (`leadId = null`) corrió y fue **no-op**: 0 antes → 0
borradas → 0 después. La corrida del setter ya las había limpiado.

**La cola de Franco no estaba vacía: tenía 13 demos esperando**, de 29 h a 1 693 h (70 días)
de antigüedad. No hizo falta sembrar nada para fotografiarla con carga real.

---

## Paso 2 — la matriz

Censo del filesystem: **34 rutas UI** bajo `/admin`, todas en el route group
`src/app/(protected)/admin/**` (no existe `src/app/admin/`), más 8 `route.ts` bajo
`src/app/api/admin/**`. El gate es único y vive en `admin/layout.tsx:41-48`: sin sesión →
`/login`; rol ≠ `SUPER_ADMIN` → `/dashboard`. No hay `middleware.ts`.

Tres rutas existen pero **ningún `href` del repo apunta a ellas**: `/admin/fg2-lab`,
`/admin/settings/alerts`, `/admin/settings/reports`. Se entra solo tecleando la URL.

---

---

## Paso 3 — qué se capturó

**45 capturas** en el Paso 3 (el techo era 45) y **7 más** en el Paso 3.5: **52 en total**,
**0 fallos**. Los tres chequeos obligatorios del manifiesto dan **0 colisiones de md5**,
**0 capturas capadas por el fold** y **32/34 rutas UI del admin cubiertas**.

Los dos huecos de cobertura, declarados:

| ruta | por qué |
|---|---|
| `/admin/clients/[clientId]/chatbot` | no tiene UI: es un `permanentRedirect` legacy a `/admin/chatbots/{id}` |
| `/admin/projects/[projectId]/hours` | recortada para no pasar el techo de 45 (es la de menor prioridad de la lista) |

### La trampa del fold era la misma, y mordió

El shell del admin es `fixed inset-0` (`AdminLayoutClient.tsx:30`) con el scroller en el
`<main class="absolute inset-0 overflow-y-auto">` interno (`:99`) — idéntico al del setter.
No se usó `fullPage` en ninguna toma: se midió el alto real del contenido y se agrandó el
viewport hasta que el contenedor deja de scrollear.

**La primera pasada salió capada y hubo que rehacerla.** Solo estaba expandiendo las cuatro
superficies marcadas como densas; las otras 37 se dispararon a 1440×900 sobre contenidos de
hasta 10 259 px. Se corrigió para que **toda** toma se expanda, y se dejó la doble captura
(`-fold` + `-full`) únicamente donde importa juzgar qué entra sin scrollear.

### Lo que el fold deja afuera

Medido en el DOM al disparar, con 756 px de alto visible en el `<main>`:

| superficie | contenido | entra sin scrollear |
|---|---|---|
| Evaluaciones de un setter (`/admin/leados/setter/[id]`) | 10 259 px | **7 %** |
| **Cola de revisión** (`/admin/leados`) | **8 662 px** | **9 %** |
| Centro de control (`/admin/settings`) | 3 913 px | 19 % |
| Board de proyectos (`/admin/projects`) | 2 865 px | 26 % |
| Dashboard raíz (`/admin`) | 2 417 px | 31 % |

La corrida no opina sobre esto. Lo mide y lo declara.

### La cola vacía no se pudo fotografiar

Era un ítem obligatorio y quedó como **hueco declarado**: la cola tenía 13 demos y vaciarla
habrían sido 13 mutaciones, contra la regla de no sembrar. El texto exacto del estado vacío,
transcripto del código (`admin/leados/page.tsx:201-205`), es:

> No hay demos esperando revisión. Cuando el setter mande una a revisión, aparece acá.

### El dossier no tiene una "página completa" canónica

Ocho capturas de `/admin/leados/[leadId]` no convergen, y la causa es de diseño, no del método:
la columna del preview es `xl:sticky` con `xl:h-[calc(100vh-12.5rem)]` (`page.tsx:218`) y el
`<iframe>` es `h-[60vh] xl:h-full` (`:240`). Cada píxel de viewport que se agrega **se lo lleva
el preview**, así que el faltante (193–228 px) es constante. Está tabulado en el manifiesto.

---

## Paso 3.5 — los dos lados de una misma acción

Antes de apretar nada se verificó por lectura de código que aprobar y rechazar **no disparan
nada hacia afuera** (pregunta 4). Los dos pares se ejecutaron sobre el fixture `QA-W En
Revision`, re-sembrando entre medio, porque el seed es convergente y lo devuelve a `EN_REVISION`.

### PAR 1 · rechazar — la costura entera, por primera vez

`PAR-1-rechazar-admin-antes` → `-admin-despues` → `-setter`.

Funciona de punta a punta y quedó fotografiado: lo que Franco tipeó en el modal aparece
**literal** en el panel del setter, bajo el callout *"Guía de retrabajo — lo que Franco pidió
corregir"*, como `Qué: El hero no comunica el servicio` / `Dónde: Hero, título principal`.
Del lado del admin aparece un panel nuevo, *"Rechazos previos (1)"*.

### PAR 2 · aprobar — el par pedido no era ejecutable

El pedido era *"aprobar una demo **sin** cargar el link permanente"*. **No se puede.**
`AprobarRevisionSchema` (`revision.schemas.ts:22-25`) exige `finalUrl` como URL `https://`
válida, y se valida dos veces: en el cliente (`decision-bar.tsx:129-133`) y en el servidor
(`revision.actions.ts:73-76`). No hay camino del admin que produzca ese estado.

El estado **sí existe** en el modelo — `turnoDelLead` devuelve `'franco'` cuando
`APROBADA && finalUrl === null` (`turno.ts:80`), y la primitiva `transitionDossier` lo acepta
como opcional "para no romper tooling pre-B5" (`dossier.ts:76-78`). Solo es inalcanzable desde
la UI.

Así que se ejecutó el camino real (aprobar **con** link) y se fotografió aparte el fixture que
ya está en aprobada-sin-link, para poder comparar los dos lados del setter:

| captura | lo que ve el setter |
|---|---|
| `PAR-2-aprobar-setter` (con link) | el link, «Copiar bloque», «Ya la envié — registrar» — el gate de envío abre |
| `PAR-2-aprobar-setter-sin-link` | «Seguí la cadencia — registrá un toque», «Ir a tu paso actual» |

**El mensaje que se esperaba —"Franco aprobó pero todavía no cargó su link permanente"— no
existe.** En el fixture sin link el setter ve la cadencia, no la espera por Franco. (Salvedad:
ese fixture es además `PROSPECTO`, así que hay dos razones de gate superpuestas y esta corrida
no puede separarlas mirando una foto.)

---

## Las seis preguntas

### 1 · ¿Existe alguna superficie de admin donde se puedan cargar las cuatro URLs de herramientas?

**No.** Y no es un olvido: el propio archivo declara que la edición es por código.

`src/lib/leados/herramientas.ts` tiene **cinco** herramientas, no cuatro. Cuatro están en
`null` con un `TODO` que dice "pedir a Franco"; una sola tiene URL real:

| id | nombre | url | línea |
|---|---|---|---|
| `evaluador` | Chat de evaluación (Sonnet) | `null` — TODO | `:63` |
| `gemDiseno` | Gem de diseño | `null` — TODO | `:78` |
| `claudeDesign` | Claude Design | `null` — TODO | `:92` |
| `netlifyDrop` | Netlify Drop | `https://app.netlify.com/drop` | `:105` |
| `gemOutreach` | Gem de outreach | `null` — TODO | `:118` |

Evidencia de que no hay pantalla:

- `grep -rni "herramienta" "src/app/(protected)/admin"` → **0 resultados**. Ningún archivo del
  árbol admin menciona la palabra.
- No existe modelo Prisma que las guarde. `AgencySettings` (`schema.prisma:821-839`) es el
  único singleton de config editable por admin y sus campos son `agencyName`, `contactEmail`,
  `contactWhatsapp`, `websiteUrl`, `alertWebhookUrl`, flags de alerta, `osWeeklyDemoTarget`,
  `osTelegramBotToken`, `osTelegramChatId`. Nada de herramientas.
- Los únicos consumidores son del lado setter (`tools-rail.tsx`, `tool-guide.tsx` y los pasos
  del manual). No leen `process.env` como override: si `url` es `null`, renderizan "pendiente".
- La cabecera del archivo (`herramientas.ts:8-11`) lo dice explícito: *Franco corrige una
  descripción o carga un link nuevo editando SOLO este archivo*.

Cambiar una URL hoy = editar el `.ts` y redeploy. La captura `15-settings-*` muestra el único
centro de configuración que existe, para que se vea que el hueco es real.

### 2 · ¿Y los campos de Cal.com?

**No existe superficie de carga. Cero escrituras en todo el repo.** Ni server action, ni API
route, ni form, ni seed, ni script. Los campos solo se pueden poblar con SQL directo.

- Definidos en `schema.prisma:376-377` (`calComUsername`, `calComEmbedUrl`), creados por
  `prisma/migrations/20260505000536_add_cal_com_fields/migration.sql`.
- **Lecturas en LeadOS**: `src/lib/leados/agenda.ts:44,45,62,63`.
- **Lecturas en el módulo cliente `agenda-inteligente`**: `dashboard/modules/agenda-inteligente/page.tsx:325,347,348` — también solo lee.
- **Escrituras**: ninguna, en ningún lado.

Confirmado además contra la base en el censo del Paso 1: **las 16 organizaciones tienen
`calComUsername`, `calComEmbedUrl` y `calComApiKey` en `NULL`**.

Dato del acoplamiento que el prompt anticipaba: `agenda.ts:44` busca **globalmente** cualquier
`Organization` con `calComUsername != null`, y `agenda.ts:55` lanza *"Config Cal.com ambigua"*
si hay más de una. El campo es compartido entre LeadOS y el módulo cliente: cargarlo en una org
cliente rompería LeadOS.

### 3 · ¿Qué campos escribe el formulario de rechazo, y hay lugar para una referencia a un punto del chequeo?

Escribe **tres campos, todos obligatorios**, y **`donde` es texto libre** — no hay ninguna
referencia estructurada a un punto del chequeo.

`RechazarRevisionSchema` (`admin/leados/_actions/revision.schemas.ts:35-47`):

| campo | tipo | máx | label en la UI |
|---|---|---|---|
| `motivo` | string libre | 280 | "Qué está mal (corto)" |
| `donde` | **string libre** | 280 | "Dónde (sección / elemento)" — placeholder `Hero, título principal` |
| `arreglo` | string libre | 2000 | "Arreglo concreto (qué hacer)" |

No van a columnas propias: `transitionDossier` los appendea al blob JSON
`OsLeadDossier.rechazos` (`dossier.ts:220-238`, `schema.prisma:1003`), con contrato
`RechazoSchema = { fecha, motivo, detalle?, donde?, arreglo? }` (`contracts.ts:169-177`), donde
`donde` está tipado con el mismo helper `textoLibre` que la prosa de la ficha.

**Sobre la marca del check falsamente verde — la infraestructura existe y el rechazo no la usa.**
Los hard-checks tienen `id` (`flow-content.ts:171`), el gate los mapea por id
(`flow.ts:184-206`), hay un `HARD_CHECK_PROMPT: Record<string, PromptDisenioId>`
(`prompts-disenio.ts:139`) y hasta un campo `checkId: string` en `guidance-content.ts:117-121`
descrito como "que casa con HARD_CHECKS/SOFT_CHECKS". **El formulario de rechazo no toca nada
de eso.** No hay forma estructurada de decir "el hard-check X estaba en verde y era mentira":
solo prosa en `donde`.

Lo que el setter recibe: (a) una novedad in-app con copy fijo —"Franco pidió cambios" /
"la demo volvió con correcciones. Reabrí la construcción y rehacé"— que **no incluye
motivo/donde/arreglo** (`novedades.ts:62-66`); y (b) la guía de retrabajo completa
(`setter/leads/[leadId]/_components/guia-retrabajo.tsx`), que sí renderiza *Qué / Dónde /
Arreglo* y guarda las vueltas anteriores en un `<details>`. Es la captura `PAR-1-rechazar-setter`.

### 4 · ¿Aprobar o rechazar dispara algo hacia afuera?

**No. Ninguna de las dos.** Por eso me permití apretarlas en el Paso 3.5.

Cadena completa de `aprobarRevision` (`revision.actions.ts:67-92`) y `rechazarRevision`
(`:94-120`): `requireSuperAdmin()` (solo lee sesión) → Zod → `transitionDossier` (dos queries
Prisma) → `avisarDecisionAlSetter` (un `prisma.osSetterNotice.create`) → cuatro
`revalidatePath()`. Nada más.

Por qué es afirmable y no una suposición:

- La superficie de imports de la action es cerrada (`revision.actions.ts:14-20`): no importa
  `sendTelegram`, `resend`, `nodemailer`, ni `fetch`.
- `dossier.ts` y `novedades.ts` (las hojas del árbol) no tienen ninguna llamada de red; los
  únicos hits de "telegram/webhook/notificar" en `novedades.ts` son comentarios.
- `src/lib/prisma.ts` son 8 líneas: no hay `$use` ni `$extends` que cuelgue side-effects.
- `grep -rn "to: 'APROBADA'|to: 'RECHAZADA'" src` → solo `revision.actions.ts`. No hay API
  route paralela.
- Decisión documentada en `novedades.ts:23-26`: no se manda Telegram por handoffs que Franco
  mismo ejecuta, porque `sendTelegram` resuelve a un solo chat, el suyo.

**La asimetría es intencional y vale anotarla**: la acción del *setter* `escalarConstruccion`
**sí** sale hacia afuera (`dossier.actions.ts:438` → `notify.ts:67` → `telegram.ts:78`
`fetch('https://api.telegram.org/...')`). Las de Franco no. Por eso no toqué el escalamiento.

Salvedades honestas: si una action lanza una excepción no manejada, Sentry emite telemetría; y
la DB es Neon, o sea remota. Ninguna de las dos es un efecto de negocio hacia un tercero.

### 5 · ¿Dónde llega "Me trabé — avisar a Franco"?

A **dos columnas del dossier** y a **un bloque de una sola pantalla de admin**. Y sí sale hacia
afuera, por Telegram.

- El botón (`setter/leads/[leadId]/_components/escalar-modal.tsx:77`) persiste primero y
  notifica después, deliberadamente (`dossier.actions.ts:431-432`), para que el registro
  sobreviva si Telegram falla.
- **Aterriza en `OsLeadDossier.escaladoAt` + `escaladoNota`** (`schema.prisma:1012-1013`). No
  hay tabla de escalamientos. Vive en el dossier y no en el meta privado del setter para que
  sobreviva a una reasignación (`escalamiento.ts:9-12`).
- **Es un slot único, no un historial**: re-escalar pisa la nota, y **cualquier** cambio de
  stage lo borra (`ESCALADO_RESET`, `escalamiento.ts:47`, aplicado en `dossier.ts:163`).
- **La superficie de admin que lo muestra existe**: `/admin/leados`, bloque *"Setters trabados
  — N pidieron ayuda"* (`pipeline-board.tsx:140-195`), con la nota entre comillas truncada a
  dos líneas y "Escaló hace X". Está en las capturas `01-leados-cola-*`: al capturar había
  **1 escalamiento vivo**.
- **El detalle del lead no lo muestra.** `/admin/leados/[leadId]` no tiene panel de
  escalamiento: el aviso solo vive en el panorama.

### 6 · ¿Alguna vista del admin muestra datos de más de un setter o de más de una organización sin scope?

**Sí, la mayoría** — y para el grueso es el diseño esperado, porque el único rol que entra es
`SUPER_ADMIN`. Describo el alcance sin calificarlo.

`OsLead` y `OsLeadDossier` **no tienen columna `organizationId`**: el aislamiento del módulo es
exclusivamente `assignedToId`, y los helpers de `isolation.ts` son para el código del setter —
**ninguna lectura del admin los usa**.

Vistas que devuelven datos de todos los setters, sin filtro:

| ruta | query | alcance |
|---|---|---|
| `/admin/leados` | `osLeadDossier.findMany({ where: { stage: 'EN_REVISION' } })` | todos los setters |
| `/admin/leados` | `findMany({ where: { lead: { assignedToId: { not: null } } } })` | todos |
| `/admin/leados/[leadId]` | `findUnique({ where: { leadId } })` | cualquier lead por id, sin comprobar dueño |
| `/admin/leads` | `osLead.findMany({})` — **sin `where`**, cache 60 s | los 111 leads |
| `/admin/leads/[leadId]` | `user.findMany({ where: { role: 'SETTER' } })` | los 6 setters (roster del selector) |
| `/admin/fg2-lab` | `findMany({ take: 200 })` — **sin `where`** | todos — y es **ruta huérfana** |
| sidebar | `findMany({ where: { stage: 'EN_REVISION' } })` | todos (badge) |

`/admin/leados/setter/[setterId]` es la única scopeada a un setter, y el scope viene del
**parámetro de URL**, no de la sesión.

Multi-organización sin scope: `/admin` (15 queries globales), `/admin/clients`,
`/admin/projects`, `/admin/announcements`, `/admin/referrals`, `/admin/chatbots/new`,
`/admin/settings/alerts`, `/admin/settings/reports`.

Dos observaciones factuales, sin juicio:

1. **`/admin/team` lista solo `role: SUPER_ADMIN`** (`team/page.tsx:19-26`). Los seis setters
   **no aparecen** en la pantalla de equipo. La gestión de setters, tal como está, es el
   selector de asignación en la ficha del lead — no hay una pantalla de setters.
2. **Impersonación**: existe, es **org-level** (no de setter) y sale a `/dashboard`. Entradas:
   el botón en la ficha de cliente y el layout de proyecto. Doble control de rol, cookie
   httpOnly firmada, auditada en `AdminAuditLog` (`IMPERSONATION_STARTED/ENDED`, visible en
   `/admin/audit-log`), y el proxy exige `isImpersonating` para que un SUPER_ADMIN entre a
   `/dashboard`. **No existe impersonación de setter ni "ver como setter".** El secreto de
   firma tiene una cadena de fallbacks que termina en un literal:
   `IMPERSONATION_SECRET ?? AUTH_SECRET ?? NEXTAUTH_SECRET ?? 'develOP-dev-impersonation-secret'`
   (`impersonation.ts:14-22`). Lo registro como dato; calificarlo no es de esta corrida.

**La superficie de impersonación se fotografió, no se ejecutó** (captura
`20-client-detalle-impersonacion-*`): apretarla escribe el audit log y cambia la sesión.

### Bonus — asignación e importación

- **Asignar/reasignar** un lead a un setter: `/admin/leads/[leadId]`, control
  `assign-setter-control.tsx` (select + toggle `caliente`), action `assignLeadSetter`
  (`lead.actions.ts:128-228`). Valida que el destino tenga `role: SETTER`, escribe
  `assignedToId` —"lo ÚNICO que mueve el aislamiento"—, deja rastro `SISTEMA` y emite las dos
  novedades: `LEAD_ASIGNADO` al nuevo dueño y `LEAD_REASIGNADO_SALIENTE` al anterior. Es la
  captura `14-leads-detalle-asignar`. **De ahí sale el "te reasignaron un lead" que ve el setter.**
- **Importación masiva: no existe del lado admin.** El único importador CSV es del **setter**
  (`/setter/nuevo/importar`, `requireSetter()`), y su copy lo delata: *"esa lista que te pasó
  Franco"*. Franco pasa el CSV por fuera del sistema. Los únicos CSV del admin son de
  **exportación** (clientes y chatbots).

---

## Estado de los datos al cerrar

La base vuelve a la línea base del Paso 1: después del PAR 2 se re-corrió
`scripts/v1-qa-wizard-states.ts`, que es convergente y devuelve `QA-W En Revision` a
`EN_REVISION`. El censo de cierre está al pie de esta sección en el commit.

Escrituras de esta corrida, todas declaradas: los dos seeds del Paso 1 (no-op, la base ya
estaba en su estado), la limpieza de novedades huérfanas (no-op, 0 filas), y los dos pares del
Paso 3.5 sobre un único fixture, revertidos por el seed.

**No se ejecutó**: la impersonación (escribe `AdminAuditLog` y cambia la sesión), el
escalamiento "me trabé" (hace `fetch` a la API de Telegram), ni ninguna acción sobre las otras
15 organizaciones.

## Qué queda para la verificación humana

- **Todo el juicio visual.** Esta corrida produce imágenes; no opina sobre ellas.
- El diseño del admin se decide mirando, con el mismo método que el del setter.
- Las tres decisiones que dependían de esta corrida ya tienen la evidencia que les faltaba:
  dónde marcar el check falsamente verde (hoy: en ningún lado — solo prosa en `donde`), dónde
  cargar las URLs de herramientas y Cal.com (hoy: en ningún lado), y qué forma tiene la cola
  donde Franco pasa su tiempo (hoy: 8 662 px, de los que se ven 756).
