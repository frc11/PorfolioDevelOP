# AUDITORÍA READ-ONLY — LeadOS (`logic-core-v3`) vs Brief de Visión v2

**Fecha:** 2026-07-02 · **Vara normativa:** Brief de Visión v2 (02/07/2026, embebido en la instrucción; no existe copia en el repo — verificado por búsqueda) · **Método:** estático puro, sin ejecutar nada, sin tocar la base. Toda evidencia fue verificada línea por línea en una segunda pasada adversarial independiente del hallazgo original.

---

## 1. Resumen ejecutivo

**Veredicto del gating de aislamiento: GATEA — con perímetro acotado.** Los tests de aislamiento ejercitan el mecanismo real (ownership 100% de capa aplicación; no hay RLS en Postgres) con identidad de sesión real (mismo JWT/secreto/cookie que producción) y asserts por contenido que fallarían ante una fuga de lectura o ante una regresión del chokepoint compartido de ownership; el perímetro: la denegación de **mutación cruzada** solo está testeada en 2 de ~19 funciones de escritura del setter — el resto se sostiene por consistencia de patrón verificada por lectura, no por tests (detalle en §3 de este informe; hallazgo A-13).

**Top 10 de hallazgos por severidad:**

| ID | Sev | Sección | Título |
|----|-----|---------|--------|
| A-03 | 4 | §3 | El wizard es una página larga con todos los pasos montados — la divergencia estructural central, con auto-scroll, duplicación del rechazo y fachada de pasos futuros como síntomas |
| A-07 | 4 | §5/§8 | El veredicto del setter comparte la palabra "caliente" y el copy/onboarding lo enseñan como habilitante de la demo — el motor lo blinda, la capa de experiencia lo contradice |
| A-05 | 3 | §4 | Fijar un lead lo saca del foco: el modo dirección puede declarar "no hay nada para trabajar" con trabajo real pendiente |
| A-06 | 3 | §4 | NovedadesPanel expone una segunda cola de leads navegables en paralelo al foco |
| A-08 | 3 | §5 | No hay cierre duro al tercer toque sin respuesta: el setter puede registrar "no respondió" indefinidamente |
| A-09 | 3 | §5 | El archivo no categoriza la causa de caída y los archivados no suman a ninguna señal de progreso |
| A-10 | 3 | §7 | El checklist de Construcción y los prompts lead-agnósticos viven desconectados dentro del mismo paso |
| A-13 | 3 | FG | Cobertura de aislamiento de mutación cruzada: 2 de ~19 funciones de escritura tienen test con dos actores |
| A-14 | 3 | FG | El teléfono del prospecto se captura en el alta y no vuelve a mostrarse nunca en el panel del setter |
| A-15 | 3 | FG | `BriefStep` puede mostrar el formulario de un stage ya avanzado (estado local sin resincronizar, multi-pestaña) |

Lectura general: el motor cumple el brief (la §6 completa y la §9 completa salieron **sin divergencias**, incluida la línea inviolable del envío del link, re-validada server-side y con invariante ejecutable). La brecha está donde el brief la anticipaba — el modelo de interacción (§3) — más dos familias que el brief no anticipó: fugas de nomenclatura/jerga en el copy que el setter lee, y datos capturados que no se re-sirven. Las cuatro decisiones fijadas del §8 **cumplen** (con una redundancia menor de UI).

---

## 2. Mapa mínimo del repo (Fase 0)

- **Flujo del setter:** `logic-core-v3/src/app/(protected)/setter/` — `page.tsx` (home "modo dirección": foco → onboarding → novedades → cartera colapsada → métricas), `leads/[leadId]/` (wizard de página larga: `lead-wizard.tsx` monta 9 steps + `PasoActualBanner` + `DossierStepper`), `nuevo/` (alta individual) y `nuevo/importar/` (CSV), `_actions/` (7 módulos de server actions con Zod).
- **Dominio:** `logic-core-v3/src/lib/leados/` — `flow.ts` (gates y clasificación), `dossier.ts` (transiciones, único camino de mutación de stage), `ownership.ts` + `isolation.ts` (enforcement de aislamiento), `guidance-content.ts`/`flow-content.ts`/`copy-blocks.ts` (contenido), `prompts-disenio.ts` (munición), ~15 `*.invariant.ts` (invariantes ejecutables puras).
- **Identidad:** NextAuth JWT (`src/auth.ts`), `requireSetter()` en `src/lib/auth-guards.ts`; route-guard en `src/proxy.ts` (sin condicionales por entorno).
- **Tests:** `tests/setter/` (e2e browser contra build prod: 00-surfaces…07-admin-assign-caliente; `02-isolation` es la suite canónica), `tests/leados/` (specs Node contra DB real, sin browser), invariantes vía `npm run check:invariants`; helpers en `tests/helpers/` (`setter-auth.ts` mintea la cookie de sesión real); configs `playwright.setter.config.ts` / `playwright.leados.config.ts`; DB por `DATABASE_URL` de `.env.local` (no se abrió; solo se citan nombres de variables).

---

## 3. Veredicto del gating de aislamiento (Fase 1)

### 3.1 Mecanismo real

**No hay RLS**: grep por `POLICY` / `ROW LEVEL` / `pg_policy` sobre las 75 migraciones de `prisma/migrations/` → cero resultados. El aislamiento es **100% capa de aplicación**:

- **Identidad:** `src/auth.ts:271-282` (callback `session()` copia `token.sub` → `session.user.id` + rol) y `src/lib/auth-guards.ts:13-21` — `requireSetter()` exige `role === 'SETTER'` y devuelve el id de sesión; es el único punto de entrada de identidad a las server actions. El callback `jwt` (`src/auth.ts:231-257`) re-deriva rol/estado desde la DB en cada request.
- **Ownership:** `src/lib/leados/isolation.ts:21-26` (`ownedLeadWhere` → `{ id, assignedToId: userId }`), `:29-31` (`ownedListWhere`), `:75-94` (`ownedLeadCreateData` fuerza `assignedToId: userId`, `caliente: false` server-side — anti-IDOR de escritura). `ownership.ts:24-31` los envuelve (`getOwnedLead` vía `findFirst`).
- **Server actions:** las 7 familias (`dossier`, `foco`, `cartera`, `prospecto`, `prospecto-bulk`, `outreach`, `agenda`) llaman `requireSetter()` primero y re-validan ownership antes de leer/mutar (p.ej. `dossier.actions.ts` — `const userId = await requireSetter()` en las líneas 86, 114, 185, 221, 250, 283, 310, 341, 371, 413). Única excepción documentada: `nombresEnSistema()` (`prospecto-bulk.actions.ts:143-146`) expone un bit de existencia global de `businessName` para dedup de importación — acotada y comentada.
- **Página del lead:** `leads/[leadId]/page.tsx:51-59` — `getOwnedLead` y `notFound()` sin distinguir "no existe" de "no es tuyo" (anti-leak de existencia).
- **Modelo:** `prisma/schema.prisma:839-855` — `assignedToId String?` FK simple e indexado, sin partición ni política a nivel DB. **Consecuencia:** un bypass de estos helpers no tiene red de contención en el motor de base.

### 3.2 Diseño de los tests

- **Identidad real:** `tests/helpers/setter-auth.ts:33-64` mintea el JWT con `encode()` de `next-auth/jwt`, el mismo `AUTH_SECRET` y el mismo nombre de cookie (`__Secure-authjs.session-token`, línea 22-23) que lee el server de producción (`next start` vía `npm run start:qa`). No es un bypass de lógica: el callback `session()` real corre en cada request. Los actores son usuarios reales de la tabla `User` con rol `SETTER` (A = `setter-qa@develop.test`; B = un segundo setter creado por `createSetter`). `/api/qa/login` existe con guard triple (`route.ts:49-73`: flag `QA_ALLOW_LOCALHOST`, host localhost, bloqueo en hosting) pero los tests del setter **no** lo usan — mintean directo con el mismo primitivo (documentado en `setter-auth.ts:8-18`).
- **Camino:** tres niveles. (1) HTTP real → cookie → page/server component → `requireSetter()` → `getOwnedLead` (`02-isolation.spec.ts`, `07-admin-assign-caliente.spec.ts`); (2) funciones de dominio reales contra la DB real, con `userId` explícito, salteando a propósito el wrapper `requireSetter()`/Zod (documentado en `06-claim-atomico.spec.ts:78-82`); (3) invariantes puras sin DB (`*.invariant.ts` — prueban la composición del `where`, no la denegación contra la base).
- **Asserts por contenido, no por status:** `02-isolation.spec.ts:63-71` documenta explícitamente que la page `force-dynamic` flushea 200 OK antes de que `notFound()` corte el stream, y por eso el assert es `toHaveCount(0)` sobre el texto del negocio ajeno. C3 (`:95-109`) verifica que la nota privada de A no la hereda B tras reasignación real.
- **Mutación cruzada real (donde existe):** `progreso-construccion.spec.ts:141-169` — el setter B intenta escribir y leer el dossier de A: retorno `null` en ambos **y** re-lectura desde A confirmando que el intento hostil no dejó rastro. `alta-import.spec.ts:69-96` — payload con `assignedToId: setterB` y `caliente: true` inyectados: la fila real queda asignada a A, `caliente` en `false`, y `getOwnedLead(id, setterB)` → `null`. `07-admin-assign-caliente.spec.ts` G1 (`:62-126`): reasignación por la acción real del admin vía UI, verificando que A pierde acceso (por contenido) y B lo gana.
- **Entorno:** misma DB (`DATABASE_URL` de `.env.local`, Neon dev; en CI, comentario declara DB dedicada — `playwright.leados.config.ts:18-20`), build de producción, rol no privilegiado. El route-guard (`src/proxy.ts`) no tiene condicionales por `NODE_ENV`/flags QA que debiliten el enforcement en test ni en prod (verificado por el escéptico 3).

### 3.3 Veredicto

**GATEA — con perímetro acotado.** Confirmado por 2 de 3 verificadores adversariales independientes; el tercero no encontró falsedad en los tests (ninguna cita tergiversada, ningún assert que pasaría ante una fuga real de lo que dice probar) pero acotó el alcance, y ese perímetro se adopta como parte del veredicto:

- **Lo que el verde garantiza:** lectura cruzada denegada por el camino HTTP completo (page + contenido); regresiones del chokepoint compartido (`ownedLeadWhere`/`getOwnedLead`/`ownedLeadCreateData`) detectadas — esas funciones se ejercitan con dos actores contra la DB real; anti-IDOR de creación; pérdida/ganancia de acceso ante reasignación real.
- **Lo que el verde NO garantiza (hallazgo A-13):** una fuga introducida en el **wrapper individual** de una server action (una action nueva que olvide `requireSetter()`, o una función `saveOwned*` puntual que deje de filtrar) en la superficie sin test cruzado: 9 de las 10 actions de `dossier.actions.ts` (todas salvo `guardarProgreso`), toda `outreach.actions.ts`, `agenda.actions.ts`, `foco.actions.ts` y `cartera.actions.ts` no tienen ningún test con actor B intentando tocar un lead de A (evidencia: `selfcheck-anti-bypass.spec.ts:37-43`, `envio-demo-rechazo.spec.ts:31-37`, `06-claim-atomico.spec.ts:34-42` — un solo `setterId` en cada suite; `agenda.actions` sin referencia en ningún spec). El código de esas actions fue leído una por una y el patrón `requireSetter()` + helper owned es uniforme — pero eso es verificación por lectura, no un gate automatizado.
- **No es FALSO VERDE** porque los tests que existen sí prueban lo que dicen probar y fallarían ante las fugas que cubren. No es DUDOSO porque el análisis estático alcanzó para delimitar exactamente qué gatea y qué no.
- **Prueba dinámica que cerraría el perímetro** (pendiente, no se corrió — regla de no-ejecución): con sesión real de B, POST/submit real contra las server actions de `dossier`/`outreach`/`agenda`/`cartera`/`foco` pasando el `leadId` de A; assert de error + fila de A intacta en DB. Es extensión de tests, no cambio de motor.

---

## 4. Hallazgos por sección del brief (Fase 2)

Formato: `ID · severidad · sección · título`, con evidencia, divergencia, fix propuesto y confianza. Síntomas de una misma causa raíz agrupados en un solo hallazgo.

### §2 — Guiada por estructura, no por texto

El patrón dominante del wizard **cumple**: microcopia de una línea (`hint`/`intro`), guía extendida en colapsables opcionales (`TeachPanel`/`ToolGuide`/`EjemploIdeal`, `<details>` que nunca se auto-abren), gates con 1-2 oraciones accionables. Dos desvíos:

**A-01 · sev 2 · §2 · La tarjeta "Cómo funciona tu día" es la sección "cómo usar esto" que el brief nombra como síntoma**
- **Evidencia:** `logic-core-v3/src/app/(protected)/setter/_components/onboarding-hint.tsx:101-103` (`<h2>… Cómo funciona tu día`), `:54-75` (4 tarjetas de 2-3 oraciones explicando el flujo invertido en prosa), `:118-130` (párrafo explicando botones que ya tienen labels+iconos autoexplicativos).
- **Divergencia:** el brief marca "la sección 'cómo usar esto'" como estructura fallida; esto es exactamente eso — un manual en prosa que adelanta lo que el flujo ya comunica estructuralmente cuando el setter llega a cada pantalla. Ser descartable (localStorage) atenúa, no elimina.
- **Fix:** comunicar frío/caliente y foco/parquear/saltar en el momento real de uso (primer-uso guiado del propio `FocoSurface`, micro-hints por primera aparición) en vez de un bloque introductorio único.
- **Confianza:** media — el brief no dice explícitamente si un onboarding único-y-descartable está exento de la regla.

**A-02 · sev 2 · §2 · Párrafo fijo no colapsable en Construcción describe en prosa el comportamiento que el checklist ya muestra**
- **Evidencia:** `construccion-step.tsx:331-336` (párrafo de 3 oraciones explicando el realce/sub-pasos/destildado del checklist); `checklist-construccion.tsx:21-35` (el componente ya comunica eso por diseño: fase actual con marco cyan + única con sub-pasos abiertos).
- **Divergencia:** texto que explica "cómo se comporta visualmente" el widget de al lado — el caso puntual que distingue a este párrafo de las intros de fase legítimas del resto del wizard (la afirmación original de que era "la única muleta del wizard" fue corregida en verificación: todos los steps tienen intro, pero son intros de fase, no manuales de widget).
- **Fix:** reducir a una línea (p.ej. solo la advertencia de secuencia preliminar); el checklist se explica solo.
- **Confianza:** alta.

### §3 — El manual paso-por-pantalla (la divergencia principal)

**A-03 · sev 4 · §3 · El wizard es una página larga con todos los pasos montados simultáneamente — no un manual paso-por-pantalla** *(causa raíz; síntomas agrupados)*
- **Evidencia:** `lead-wizard.tsx:154-343` (un solo árbol DOM: `DossierStepper` → `PasoActualBanner` → Callout de rechazo → Ficha, Evaluación, Opener, Seguimiento, Agenda, Brief, Construcción, Draft, SelfCheck — 9 steps siempre montados); `step-anchor.tsx:42-53` (`useEffect` → `el.scrollIntoView({block:'start'})` sobre el único anchor `active`); `lead-wizard.tsx:92-111` (`anchorActivo()` decide a qué sección saltar); `construccion-step.tsx:293-296` (comentario del propio código documentando el dolor: la nota de Franco quedaba "a 2+ pantallas del aterrizaje — el setter caía sin verla").
- **Divergencia:** el brief define UNA tarea atómica por pantalla y marca explícitamente "página larga con todos los pasos montados, el activo realzado y auto-scroll" como lo que NO es la visión. El repo implementa exactamente ese patrón: el "foco" es un realce visual + scroll dentro de un documento único, no una unidad de navegación.
- **Síntomas** (todos de esta causa raíz):
  - auto-scroll con `scrollIntoView` en cada apertura del lead (`step-anchor.tsx:52`);
  - las secciones resueltas quedan expandidas y montadas en el mismo scroll (solo Ficha colapsa como step completo vía `<details>`), alejando al setter del paso activo cuanto más avanzó el dossier;
  - la nota de rechazo requirió duplicarse para ser vista (Callout del tope `lead-wizard.tsx:163-197` + `GuiaRetrabajo` en el aterrizaje — ver A-12);
  - **"el futuro NO existe" se cumple en contenido pero no en existencia:** los steps bloqueados no exponen munición/campos (cumple), pero montan su fachada completa — título real + candado + texto "Se habilita cuando…" — ocupando espacio y jerarquía visual (`opener-step.tsx:68-82`, `brief-step.tsx:145-156`, `construccion-step.tsx:247-259`); el contraejemplo correcto vive en el mismo árbol: `DossierStepper` (`dossier-stepper.tsx:9`) es el indicador abstracto que el brief pide.
- **Fix:** FUERA DE LÍMITES — requiere decisión de Franco. La subdivisión en pantallas discretas es la reestructuración central del roadmap; esta auditoría diagnostica y no deriva el mapa (regla 4). Parchear síntomas sueltos (ocultar Cards, mover callouts) sin rediseñar la navegación sería tratar el síntoma.
- **Confianza:** alta — es la divergencia que el propio brief declara conocida; verificada contra el código y contra los comentarios del propio repo que documentan sus dolores.

**A-04 · sev 2 · §3 · El link del draft no se re-sirve dentro del Self-check — el paso que lo necesita para trabajar**
- **Evidencia:** `self-check-step.tsx:21-28` (recibe `draftUrl` como prop), `:150-291` (el bloque de trabajo nunca lo renderiza; sus únicos usos son tipo, desestructuración y condición de gate en la línea 109); `draft-step.tsx:91-99` (el link vive en el Card hermano de arriba).
- **Divergencia:** "el manual recuerda por vos" — el setter marca 6 checks duros sobre la demo publicada sin tener el link a mano en la pantalla donde los marca; debe scrollear o recordarlo.
- **Fix:** mostrar el link del draft (abrir en pestaña nueva) dentro del bloque del self-check.
- **Confianza:** media — el impacto depende de cuán lejos quede el scroll; no se midió en runtime.

**Cumplimientos verificados de §3** (constancia, no brechas): el principio "el manual recuerda por vos" está bien implementado en los cruces principales — la ficha se re-sirve en opener (`opener-step.tsx:185-191`, `buildOpenerInputBlock`), brief (`brief-step.tsx:200-206`) y construcción (`construccion-step.tsx:167-183` y `:342-348`); el brief se re-sirve en construcción y en el check `fielAlBrief` del self-check (`self-check-step.tsx:190-196`); la ficha congelada queda re-legible y re-copiable (`ficha-step.tsx:122-140`) — "atrás sí se puede" cumple. El indicador "paso N de M" existe (`DossierStepper`, 5 nodos); queda anotada la asimetría rail-de-5 vs 9 componentes de step como pista de que la granularidad de "tarea atómica" no coincide con la de "stage" (insumo para el roadmap, no incumplimiento). Las excepciones al re-servido van en A-14, A-21, A-22, A-23 (fuera del guion, misma vara).

### §4 — Modo dirección y cartera

**A-05 · sev 3 · §4 · Fijar un lead lo saca del foco: el modo dirección puede quedar vacío con trabajo real pendiente**
- **Evidencia:** `flow.ts:580-590` (`} else if (lead.pinned) { fijados.push(lead)` — fuera de la cola `trabajar`); `flow.ts:563-568` (comentario del propio código: "que un fijado accionable quede FUERA del foco… es organización-de-cartera, no foco", decisión flagueada como pendiente en bitácora 2.1b); `home-en-espera.tsx:25-26` ("Fijados por el setter — quedan fuera del foco aunque sean accionables"); `page.tsx:36-38` + `:90-91` (el foco solo sale de `grupos.trabajar`; si el único accionable está fijado, el home renderiza `HomeEnEspera`).
- **Divergencia:** el brief dice que el foco pone delante SIEMPRE un lead activo; acá una acción que la UI comunica como priorización ("Fijado arriba en tu cartera", `lead-card-actions.tsx:63`) excluye al lead de ser candidato a foco, y el home puede afirmar "no hay nada para trabajar" siendo falso.
- **Fix:** tratar el pin como preferencia de ORDEN dentro de la cola accionable (llevarlo a la cima del foco), no como exclusión.
- **Confianza:** alta — el propio código documenta la tensión como decisión pendiente de Franco.

**A-06 · sev 3 · §4 · NovedadesPanel reconstituye una segunda cola de leads navegables en paralelo al foco**
- **Evidencia:** `novedades-panel.tsx:67-75` (cada aviso con `<Link href={aviso.href}>` directo al lead), `:119-147` ("Tus demos esperando a Franco" — lista TODOS los `EN_REVISION`, cada uno con su link); `novedades.ts:156-178` (`derivarDemosEnCola` sin cap), `:220-222` (el dedup solo excluye el lead que YA es el foco).
- **Divergencia:** "el setter siempre tiene exactamente un lead activo; nunca hace malabares con colas" — debajo del foco hay hasta 12 avisos + la cola completa de revisión, cada ítem navegable a un lead distinto sin pasar por el mecanismo de anclar foco.
- **Fix:** que "Abrir" ancle el lead como nuevo foco (mismo mecanismo que "Ir a trabajarlo") o limitar la superficie a un accionable resaltado, derivando el resto a la cartera secundaria.
- **Confianza:** media — con volumen real de 0-1 avisos el impacto percibido baja; no verificado en runtime.

**Cumplimiento verificado de §4:** los postergados vencidos vuelven solos al foco por reloj request-time (`flow.ts:367-371`, `home.ts:46-49`; el cron solo notifica — comentario en `flow.ts:368`), protegido por invariante ejecutable (`flow.invariant.ts`). La puerta lateral existe (abrir desde cartera funciona igual; el manual del lead es el mismo). El punto de entrada de carga es persistente: botón "Cargar prospecto" al tope del rail en toda la zona `/setter` (`setter-nav.tsx:56-69`, sprint B6.3).

### §5 — Frío/caliente, cadencia, archivado

**A-07 · sev 4 · §5 (y espíritu del §8) · El veredicto del setter comparte la palabra "caliente" y el copy lo enseña como habilitante de la demo** *(causa raíz única: nomenclatura del score en la capa de experiencia; agrupa lo encontrado por dos lentes independientes)*
- **Evidencia:** `evaluacion-step.tsx:19-23` (`VEREDICTO_LABELS = { … CALIENTE: 'Caliente' }`), `:283` (opción del form), `:69-75` (badge del veredicto con el mismo tono ámbar + ícono `Flame` que el badge del caliente real de Franco); `guidance-content.ts:347` (hint: "4–5 **marca el lead como caliente**"), `:374` ("4–5 es caliente (y deja producir la demo sin esperar respuesta)"); `onboarding-hint.tsx:56-58` ("Ese puntaje **decide** si el lead es frío… o caliente") y `:71-73` ("un lead que el Evaluador marca 4 o 5 **te habilita** a construir la demo preventiva").
- **Divergencia:** el brief exige que el veredicto del setter se nombre como prioridad, NO comparta la palabra "caliente" y que lo que destraba la demo se nombre por su causa real. El **motor cumple** — `flow.ts:79-101` (`gateBriefAbierto`/`gateEnvioDemo`) ignora el score y depende solo de `OsLead.caliente` (Franco) o `leadRespondio`; `revision.ts:34-39` y `contracts.ts:42-46` lo documentan; el score alto solo dispara una notificación informativa (`dossier.actions.ts:158-160`, `notify.ts:157`: "si lo querés caliente, marcalo vos"). Pero la capa que el setter LEE le enseña lo contrario — una descripción objetivamente falsa del gate real, desde el primer contacto con la herramienta. El contraste interno lo confirma: `guidance-content.ts:441` (brief-step) usa el patrón correcto ("…o si Franco lo marca caliente").
- **Fix:** renombrar el veredicto visible a un término de prioridad ("Prioritario"/"Prometedor"), quitar llama y tono ámbar compartidos con el badge real, y reescribir hint/onboarding: el 4-5 es señal para que Franco lo priorice; la frase habilitante se ancla siempre a "si Franco lo marca caliente". Solo copy/labels/badge — no toca gates.
- **Confianza:** alta.

**A-08 · sev 3 · §5 · Sin cierre duro al tercer toque sin respuesta**
- **Evidencia:** `src/lib/follow-up.ts:3-13` (`calculateNextFollowUp` devuelve `null` desde el 4º — la cadencia +2/+2/+3 relativa al toque anterior **cumple**); `flow.ts:227-237` (`cadenciaInfo.agotada`); `seguimiento-step.tsx:240-244` (con cadencia agotada solo aparece un texto ámbar informativo: "si no respondió, el lead se enfría solo"), `:316-343` + `:375-382` (el formulario "Registrá lo que pasó" sigue ofreciendo "No respondió" sin límite; el botón nunca se deshabilita por agotamiento); `outreach.actions.ts:144-195` (`registrarResultado` acepta SIN_RESPUESTA sin tope); `os-commercial.ts:17-18` (el cierre a PERDIDO es movida aparte, exclusiva del admin).
- **Divergencia:** el brief pide "cierre duro al tercer toque"; el repo solo informa con texto — exactamente lo que el §2 prohíbe como sustituto de estructura. El setter puede tocar indefinidamente y el cierre depende de que Franco lo marque desde `/admin`.
- **Fix:** al agotarse la cadencia, cambiar la estructura de la pantalla (dejar de ofrecer "No respondió" como opción viable, o encausarla a un cierre/archivado desde la perspectiva del setter). La parte de decidir si el cierre a PERDIDO se automatiza es **FUERA DE LÍMITES — requiere decisión de Franco** (toca el motor comercial compartido con admin); el cambio de affordance en la pantalla del setter no lo es.
- **Confianza:** alta.

**A-09 · sev 3 · §5 · El archivo no categoriza la causa de caída y no suma a la sensación de progreso**
- **Evidencia:** `flow.ts:353` y `:364` (PERDIDO y DESCARTADA colapsan en un único grupo `archivo`, "sin ruido"); `cartera-toolbar.tsx:26` (único filtro: "Descartados y perdidos"); `progreso.ts:27-38` (`ProgresoSemana` cuenta solo contactos/demos/reuniones — ningún archivado suma); `mis-numeros.ts:55-56` (`activos` excluye PERDIDO; no existe contador de "trabajado y cerrado").
- **Divergencia:** el brief pide archivados "categorizados" que "suman a la sensación de progreso". El motivo de descarte existe en el dato (`contracts.ts:52`, `dossier.ts:193-205` lo exige en la transición) pero nunca se expone como categoría; y el copy de evaluación ya reconoce que "el descarte honesto es trabajo bien hecho" sin que ningún número lo refleje.
- **Fix:** exponer la causa real de la caída como agrupación/filtro (dato ya persistido) y sumar los archivados recientes como métrica de "Tu semana" ("N leads bien filtrados/cerrados"). Presentación/agregación pura.
- **Confianza:** alta.

**Cumplimiento verificado de §5:** la cadencia es correctamente **relativa** al toque anterior (no fechas absolutas desde el inicio) — `calculateNextFollowUp` se evalúa al registrar cada resultado. La separación motor-side frío/caliente es disciplinada en todos los gates reales. (La fase PRE no se audita — extensión nueva, regla 6.)

### §6 — Puertas y checklists: **sin divergencias encontradas**

Verificado contra las cuatro figuras, con cobertura completa de `dossier.ts` (transiciones + gates), `flow.ts`, `progreso.ts`, `escalamiento.ts`, `ficha-calidad.ts` (explícitamente advisory), los steps del wizard y `dossier-gates.spec.ts`:
- **El checklist de progreso NO gatea** — verificable en tres capas independientes: `ProgresoSchema` sin restricción de orden (`contracts.ts`), `checklist-construccion.tsx` tildable en cualquier orden (el "una a la vez" es realce visual derivado, no restricción de escritura), y ni `enviarARevision` (`dossier.actions.ts:367-399`) ni el gate del self-check leen `progresoJson` — `saveOwnedProgreso` está documentado como NO-gate (`dossier.ts:373-403`).
- **Ningún gate es callejón sin salida** — ficha (`fichaFaltantes`, `flow.ts:279-294`, mensajes concretos), brief bloqueado con `StepLink` a la acción real, opener con hard-block de link explicado, self-check con "Quedan N obligatorios en rojo" + puente a prompt donde existe.
- **Ninguna espera está gateada** — EN_REVISION y los tramos de gate cerrado se presentan con tono "espera" sin checklist que cumplir.
- **La línea inviolable está enforced server-side:** `outreach.actions.ts:210-247` re-valida `gateEnvioDemo` (APROBADA ∧ finalUrl ∧ (respondió ∨ caliente de Franco)) antes del claim atómico; fijado por invariante ejecutable (`gate-envio-demo.invariant.ts`) y test contra DB real. El re-loop resetea el GATE (self-check) preservando el CHECKLIST (progreso) y el draft (`escalamiento.ts` `RELOOP_RESET`, `reloop-selfcheck-reset.invariant.ts`) — exactamente la distinción figura-1 vs figura-3 del brief.

### §7 — Los prompts prefijados

**A-10 · sev 3 · §7 · El checklist de Construcción y los prompts lead-agnósticos viven desconectados dentro del mismo paso**
- **Evidencia:** `flow-content.ts:91-100` (fase `calidad`: "Máximo 2–3 colores… animaciones sutiles") y `:101-110` (fase `mobile`) describen literalmente lo que resuelven los prompts `estetica`/`motion`/`mobile` de `prompts-disenio.ts:59-108`; `checklist-construccion.tsx:1-9` (no importa `prompts-disenio` — verificado por grep: solo lo consumen `construccion-step` y `self-check-step`); `construccion-step.tsx:352,354` (`<ChecklistConstruccion …/>` y `<PromptsDisenio />` como bloques separados y secuenciales — los 3 prompts listados genéricamente al final del paso).
- **Divergencia:** "el prompt experto ya cargado, listo para copiar y pegar" donde se usa — los prompts SÍ están en el paso (con `CopyBlock` de un click y fallback sin Clipboard API) pero NO en la fase del checklist que los necesita: el setter debe asociar por su cuenta qué prompt corresponde a la fase realzada como actual.
- **Fix:** enganchar fase→prompt (calidad→estetica+motion, mobile→mobile) y renderizar el prompt dentro del bloque expandido de la fase actual — el patrón de mapeo editable ya existe y funciona en el propio repo (`HARD_CHECK_PROMPT` + `promptParaHardCheck`, consumido en `self-check-step.tsx:176`).
- **Confianza:** alta.

**A-11 · sev 1 · §7 · Constancia: el puente check-duro→prompt cubre 1/6, y es la cobertura honesta**
- **Evidencia:** `flow-content.ts:130-166` (6 hard checks), `prompts-disenio.ts:139-141` (`HARD_CHECK_PROMPT = { mobile: 'mobile' }`), `:119-129` (comentario: "PARCIAL A PROPÓSITO… `linksWhatsapp` → candidato a un futuro prompt si Franco lo suma"); `self-check-step.tsx:176` + `:210-218` (el check fallado ofrece su prompt donde existe).
- **Divergencia:** ninguna estructural — el único hard-check resoluble por prompt lead-agnóstico existente está puenteado; los otros 5 son funcionales o lead-specific (que correctamente no tienen prompt, verificado también para las fases estructura/personalización/assets/CTA). Ampliar la librería es curado de contenido = pendiente §12 (exclusión). Se deja constancia para que el roadmap no "arregle" esto forzando mapeos erróneos.
- **Fix:** ninguno requerido ahora; si se quiere >1/6, el camino natural es sumar prompts nuevos a la librería (decisión de Franco).
- **Confianza:** alta.

### §8 — Las cuatro decisiones fijadas (ley)

**Las cuatro cumplen.** Verificación una por una:
- **(a) Carga/CSV — CUMPLE:** plantilla descargable con ejemplo, columnas explicadas, errores en criollo fila por fila y dedup contra cartera propia + existencia global (`importar-prospectos-form.tsx` completo, `prospecto-import.ts`, `prospecto-bulk.actions.ts:143-146`); punto de entrada persistente en el rail (`setter-nav.tsx:56-69`). Nits de copy ("CSV" crudo en dos líneas) en A-18.
- **(b) Re-loop de rechazo — CUMPLE:** la nota de Franco está a la vista donde el setter aterriza (auto-scroll ancla en Construcción y `GuiaRetrabajo` con motivo/dónde/arreglo se monta ahí — `construccion-step.tsx:293-297`); checklist de fases y draft preservados y self-check reseteado server-side (`escalamiento.ts` `RELOOP_RESET` acotado por `esReloopRechazo`, invariante `reloop-selfcheck-reset.invariant.ts`, test en `dossier-gates.spec.ts`). Queda A-12 (redundancia).
- **(c) Paso activo → ACCIÓN — CUMPLE:** `describirFoco` (`paso-actual-banner.tsx`, exhaustivo por stage con never-guard) y `anchorActivo` + `openerPendiente` (`lead-wizard.tsx:144`) apuntan al opener cuando está pendiente de mandar y a la nota de Franco al reabrir un rechazado — no a pasos bloqueados río abajo (corregido en sprint B6.1; verificado contra el código actual).
- **(d) Home enseña sin tapar — CUMPLE:** `page.tsx:68-118` — la rama de acción (foco/vacío/en-espera) se monta antes que `OnboardingHint` (reordenado en B6.5); la pedagogía acompaña sin empujar el CTA fuera de la vista inicial (orden DOM verificado; percepción en viewport queda para la pasada visual humana).

**A-12 · sev 2 · §8(b)/§2 · El Callout de rechazo del tope quedó duplicado con la GuiaRetrabajo del aterrizaje**
- **Evidencia:** `lead-wizard.tsx:163-197` (Callout "Franco pidió correcciones" al tope, sin StepAnchor — fuera del punto donde el scroll aterriza) y `construccion-step.tsx:98-123` + `:297`/`:329` (la `GuiaRetrabajo` que sí cumple la ley, con el mismo objeto `Rechazo` en estructura casi idéntica).
- **Divergencia:** la ley del §8(b) se cumple, pero la misma información vive dos veces con dos estilos — redundancia de estructura del tipo que el §2 pide evitar (el propio comentario B6.1 documenta que el tope quedó huérfano tras la corrección).
- **Fix:** dejar la `GuiaRetrabajo` como única fuente y reducir el tope a una señal breve (el `PasoActualBanner` ya dice "Aplicá las correcciones de Franco").
- **Confianza:** alta (orden DOM y comentarios del código; sin medición en píxeles).

### §9 — Autonomía y rol de Franco: **sin divergencias encontradas**

Verificado por grep dirigido de "Franco"/"Valentino"/"escalar"/"WhatsApp" en toda la superficie del setter + lectura de `escalamiento.ts`, `notify.ts`, `revision.ts` y los steps: el escalamiento ("¿Algo no sale como la guía dice?") existe **solo** en Construcción (`construccion-step.tsx:32,372,377`; el backend lo restringe a ese stage — `escalamiento.ts:93-95`) como excepción opcional, no como camino por paso. Las notificaciones a Franco son fire-and-forget e informativas (nunca bloquean; `notify.ts`). La única espera de Franco operativa en la producción de la demo es la revisión (EN_REVISION, presentada como espera, no gate); "la cierra Franco" en CALL_AGENDADA es el traspaso comercial natural post-wizard, no una traba. La agenda consulta horarios reales por Cal.com API sin intervención manual de Franco. La carga propia nunca depende de asignación.

---

## 5. Hallazgos fuera del guion (Fase 3)

**A-13 · sev 3 · aislamiento/tests · La denegación de mutación cruzada solo está testeada en 2 de ~19 funciones de escritura del setter**
- **Evidencia:** con dos actores reales solo `progreso-construccion.spec.ts:141-169` (`saveOwnedProgreso`/`getOwnedDossier`) y `alta-import.spec.ts:69-96` (creación anti-IDOR); en cambio `selfcheck-anti-bypass.spec.ts:37-43`, `envio-demo-rechazo.spec.ts:31-37` y `06-claim-atomico.spec.ts:34-42` usan un único `setterId`, y `agenda.actions.ts`/`foco.actions.ts`/`cartera.actions.ts` (p.ej. `guardarNota`, `cartera.actions.ts:117-137`) no aparecen en ninguna suite.
- **Divergencia:** sin RLS de respaldo, cada `saveOwned*`/wrapper es un punto único de enforcement; hoy una regresión en uno de los no cubiertos no haría fallar nada. No es falso verde (lo cubierto, cubre) — es perímetro.
- **Fix:** extender la batería con el patrón ya probado de `progreso-construccion.spec.ts` (actor B contra lead de A, assert de `null` + fila intacta) a `dossier`/`outreach`/`agenda`/`foco`/`cartera`, más un caso de action completa por HTTP con sesión de B. Es agregar tests — no toca el motor.
- **Confianza:** alta.

**A-14 · sev 3 · §3 (re-servido) · El teléfono del prospecto se captura en el alta y nunca vuelve a mostrarse**
- **Evidencia:** `nuevo-prospecto-form.tsx:14`, `:136-137` (se captura); `prospecto.schemas.ts:46`; `leads/[leadId]/page.tsx:87-102` (el objeto `lead` de `WizardData` incluye `email` y `notes` pero omite `phone`), `:151` (el header tampoco). Grep: `phone` no se renderiza en ningún componente del setter; `AgendaStep` no lo usa.
- **Divergencia:** dato de contacto directo capturado e invisible después — el setter que necesita llamar/WhatsApp debe salir de la herramienta.
- **Fix:** sumar `phone` a `WizardData.lead` y mostrarlo en el header junto a contacto/email (y donde se agenda/sigue).
- **Confianza:** alta.

**A-15 · sev 3 · §6/§8(c) · `BriefStep`: el interruptor local `editando` no se resincroniza si el stage avanza desde otra pestaña**
- **Evidencia:** `brief-step.tsx:83` (`useState(false)`), `:183` (`mostrarFormulario = stage === 'EVALUADA' || editando`), `:340-350` (lo enciende); sin `useEffect`/`key` que lo resetee al cambiar `stage` (verificado). El server está protegido: `dossier.ts:459-461` y `:467-469` (guard optimista, error "recargá").
- **Divergencia:** en multi-pestaña la pantalla puede mostrar el formulario de un paso ya superado mientras el banner del mismo render dice Construcción — incoherencia visual, no pérdida de datos ni bypass.
- **Fix:** derivar el modo edición del `stage` (reset por `useEffect` o `key` por stage). Cliente puro.
- **Confianza:** media — escenario multi-pestaña, no reproducido en runtime.

**A-16 · sev 3 · deuda estructural · Patrón submit/validación copy-pasteado en los steps (encarece el rediseño paso-por-pantalla)**
- **Evidencia:** mapeo `ZodError→FormErrors` idéntico 3 veces (`evaluacion-step.tsx:148-152` y `:192-196`, `brief-step.tsx:120-124`); ciclo `startTransition → action → toast → router.refresh()` en al menos 7 instancias de 5 archivos (`evaluacion-step.tsx:162-178`, `brief-step.tsx:129-141`, `construccion-step.tsx:235-243`, `agenda-step.tsx:159-167` y `:184-200`, `seguimiento-step.tsx:167-179` y `:183-195`); grep sin resultados para un hook común, pese al precedente de `use-autosave.ts`/`use-unsaved-guard.ts`.
- **Divergencia/riesgo:** cada pantalla nueva del rediseño repetirá a mano el mismo boilerplate; la deuda escala linealmente con el número de pantallas que el roadmap va a crear.
- **Fix:** extraer un hook compartido (`useStepAction`: parseo Zod→errores por campo, transición, toasts, refresh) antes de partir el wizard.
- **Confianza:** alta.

**A-17 · sev 2 · §1 (usuario no técnico) · Jerga técnica sistemática: "draft", "self-check", "URL" como nombres oficiales de piezas centrales**
- **Evidencia:** `draft-step.tsx:43` (toast "Draft guardado — ahora pasá el self-check"); `self-check-step.tsx:98` (título "Self-check", repetido en 114/133/153); `guidance-content.ts:580-581` (label "URL del draft"); `paso-actual-banner.tsx:98` ("Publicá el draft y pasá el self-check…" — la frase más visible del wizard); patrón repetido en `construccion-step.tsx:300` y múltiples líneas de `lead-wizard.tsx`.
- **Fix:** renombrar consistentemente (Borrador/demo publicada; Chequeo final) en `guidance-content.ts` como fuente única + los títulos hardcodeados, propagando a toasts y banner.
- **Confianza:** alta.

**A-18 · sev 2 · §8(a) (copy) · "CSV" crudo en el subtítulo y el selector de la pantalla de import**
- **Evidencia:** `nuevo/importar/page.tsx:22` (h1 correcto: "Importar una lista") vs `:23` ("Subí un CSV…") y `importar-prospectos-form.tsx:137` ("Elegí un archivo CSV"). El resto de la pantalla (plantilla, columnas, errores fila-por-fila) sí sostiene el criollo.
- **Fix:** "Subí el archivo con la lista" / "Elegí el archivo de la lista" (el `accept=".csv"` técnico queda intacto).
- **Confianza:** alta.

**A-19 · sev 2 · copy · "follow-up" y "pipeline" rompen el vocabulario ya castellanizado ("toque") dentro del mismo componente**
- **Evidencia:** `seguimiento-step.tsx:72` ("frena el follow-up"), `:92` ("próximo follow-up" en el toast, mientras `:237`/`:262` y `opener-step.tsx:146` dicen "próximo toque"), `:99` ("Franco lo ve en el pipeline").
- **Fix:** "toque" y "panel/seguimiento" en esas 3 líneas.
- **Confianza:** alta.

**A-20 · sev 2 · copy · lead/prospecto/negocio conviven dentro de la misma pantalla o tarjeta**
- **Evidencia:** `nuevo-prospecto-form.tsx:94` ("Prospecto cargado…") vs `:120-123` (el aviso de duplicado de la misma pantalla: "Ya tenés un **lead** con ese nombre"); `paso-actual-banner.tsx:50` ("Completá los datos del **lead**" bajo el título "Cargá la ficha del **negocio**"), `:139` ("**Lead** descartado").
- **Fix:** una sola palabra por pantalla/tarjeta ("negocio" es la más humana y ya domina los títulos).
- **Confianza:** alta.

**A-21 · sev 2 · §3 (re-servido) · `senalesOperativas`/`otros` no viajan al bloque de Construcción; `referenciasFicha` es un campo muerto del contrato**
- **Evidencia:** `contracts.ts:36-37` (se capturan en la ficha); `copy-blocks.ts:178-181` (`buildConstruccionBlock` re-sirve solo `resenas`/`contenidoReal`; aquellos solo viajan al Evaluador vía `buildFichaCopyBlock:65-66`); `contracts.ts:73` (`referenciasFicha` declarado en `BriefSchema`) sin ninguna otra aparición en el repo (ni en `BriefFormState` — `brief-step.tsx:35-42` — ni en `BriefInputSchema` — `dossier.schemas.ts:49-58`).
- **Fix:** evaluar sumar señales operativas al bloque de Construcción (horarios/delivery son material de demo); retirar `referenciasFicha` del contrato si no tiene uso previsto.
- **Confianza:** media (que `senalesOperativas` sea exclusivo del Evaluador podría ser intencional).

**A-22 · sev 2 · §3 (re-servido) · La ficha no se re-muestra en el paso de Evaluación**
- **Evidencia:** `evaluacion-step.tsx:9-10` + `:105` — el único uso de `ficha` es el gate `fichaFaltantes(ficha)`; en las 364 líneas no hay render de su contenido. El setter transcribe el veredicto del Evaluador sin la ficha a la vista (vive colapsada en `FichaStep`, otra sección del scroll).
- **Fix:** resumen colapsable de la ficha dentro de `EvaluacionStep` (análogo a como brief-step re-muestra ficha+evaluación).
- **Confianza:** alta.

**A-23 · sev 2 · §3 (re-servido) · `escaladoNota` se re-sirve al admin pero nunca a su autor**
- **Evidencia:** `construccion-step.tsx:362-373` (banner "Ya avisaste a Franco" sin la nota; `<EscalarModal reescalar />` sin pasarla), `escalar-modal.tsx:28` (`useState('')` — siempre abre en blanco); `admin/leados/_components/pipeline-board.tsx:171-173` (el admin sí la ve). Grep: ningún componente del setter la lee.
- **Fix:** mostrar la última nota (colapsable) junto al banner y prefillear el modal de re-escalar.
- **Confianza:** alta.

**A-24 · sev 2 · §1/§3 · El razonamiento de la Evaluación no tiene autosave ni guardia de salida, a diferencia de Ficha y Brief**
- **Evidencia:** `evaluacion-step.tsx:1-17` (sin imports de `use-autosave`/`use-unsaved-guard`), `:294-300` (textarea requerido, rows=5); contraste: `ficha-step.tsx:13-14` (+uso en 79-84) y `brief-step.tsx:92-110` (autosave + `useUnsavedGuard`, con comentario que documenta el caso análogo).
- **Divergencia:** cerrar la pestaña a mitad de la transcripción pierde el texto sin `beforeunload`. Severidad ajustada de 3 a 2 en verificación: es formulario de una pasada, sin flujo de "volver después" diseñado — riesgo real pero acotado.
- **Fix:** aplicar al menos `useUnsavedGuard` (hook ya existente).
- **Confianza:** alta.

**A-25 · sev 2 · §6 (consistencia de gates en UI) · El botón de registrar el opener no explica el deshabilitado por mensaje corto**
- **Evidencia:** `opener-step.tsx:128` (`listoParaCopiar = largo >= 10 && !tieneLink`) vs `:230-237` (el botón solo se deshabilita por `tieneLink` — con texto de 3 caracteres es clickeable y el error de Zod aparece post-click); `outreach.schemas.ts:34-37` (min(10) server-side). Contraste con el patrón del resto: `self-check-step.tsx:265` ("Quedan N obligatorios en rojo"), `seguimiento-step.tsx:371-378`.
- **Fix:** deshabilitar también por `largo < 10` con el motivo al lado, alineando con el patrón ya establecido.
- **Confianza:** alta.

**A-26 · sev 2 · deuda estructural · Los steps son mini-máquinas de renderizado de 300-427 líneas con ramas por stage cosidas en un archivo**
- **Evidencia:** líneas verificadas: `seguimiento-step.tsx` 427, `construccion-step.tsx` 394, `brief-step.tsx` 368, `agenda-step.tsx` 367, `evaluacion-step.tsx` 363, `ficha-step.tsx` 318; `construccion-step.tsx:247/262/286/317` (4 ramas `if (stage === …)` + fallback en 385) y `:52-217` (5 funciones auxiliares locales sin extraer: `BadgeProvisorio`, `UrgenciaBanner`, `GuiaRetrabajo`, `MaterialesNegocio`, `PromptsDisenio`). La lógica de negocio real sí vive fuera (flow.ts/actions) — la deuda es de empaquetado.
- **Riesgo:** cada rama por stage es candidata directa a pantalla propia en el rediseño; extraer helpers primero abarata el corte.
- **Fix:** al partir el wizard, extraer los auxiliares a archivos hermanos antes de mover las ramas.
- **Confianza:** alta.

**A-27 · sev 1 · consistencia · `/setter/nuevo` y `/setter/nuevo/importar` sin `error.tsx` propio**
- **Evidencia:** solo existen boundaries en `/setter` (`error.tsx:42-49`, copy "cargando el panel") y `leads/[leadId]` (copy propio); Glob confirma ausencia en `nuevo/`. No es callejón sin salida (Reintentar + Sentry heredados).
- **Fix:** paridad opcional con el patrón de `leads/[leadId]/error.tsx`, con copy que aclare si el texto tipeado se conserva.
- **Confianza:** media (la pérdida del form al remontar es inferencia de arquitectura Next, no observada).

**A-28 · sev 1 · copy · "Link inválido — pegá la URL completa" mezcla dos anglicismos en el único mensaje técnico de sus schemas**
- **Evidencia:** `prospecto.schemas.ts:27` vs el criollo llano de sus vecinos (`dossier.schemas.ts:19`, `outreach.schemas.ts`, `agenda.schemas.ts`).
- **Fix:** "Ese link no parece válido — pegalo completo, empezando con https://".
- **Confianza:** media.

**A-29 · sev 1 · deuda estructural · Dos derivaciones reales del "paso del stage" (`pasoActual` y `describirFoco`), solo una con never-guard**
- **Evidencia:** `dossier-stepper.tsx:17-34` (`pasoActual`, sin never-guard explícito — aunque el tipo de retorno `number` fuerza exhaustividad en build); `paso-actual-banner.tsx:37-149` (`describirFoco`, switch independiente con never-guard en 142-147). Ajustado en verificación: `anchorActivo` (`lead-wizard.tsx:92-111`) **delega** en `pasoActual` (línea 98) — no es una tercera derivación, solo una capa de traducción con 2 intercepciones.
- **Fix:** insumo para el rediseño — una única `derivarPasoDelLead(stage, gateAbierto, openerPendiente)` que alimente stepper, anchor y banner.
- **Confianza:** alta.

**A-30 · sev 1 · deuda estructural · Asimetría de props entre steps (CopyBlockLead completo vs campos sueltos) — explicada, no accidental**
- **Evidencia:** `construccion-step.tsx:36`, `brief-step.tsx:24-25`, `seguimiento-step.tsx:40` reciben `lead: CopyBlockLead` porque los 7 builders de `copy-blocks.ts` lo piden como primer parámetro (verificado); `evaluacion`/`agenda`/`self-check` reciben primitivos. Ajustado en verificación: es acoplamiento correcto al consumidor (los builders), no al lead crudo.
- **Fix:** al partir el wizard, mover el armado del bloque copiable fuera del componente visual si se quiere interfaz mínima por pantalla.
- **Confianza:** alta.

**A-31 · sev 1 · escala · La cartera se renderiza completa, sin paginación ni virtualización**
- **Evidencia:** `cartera-view.tsx:95-97` (`lista.map` de todas las cards); `flow.ts:645-661` (`filtrarYOrdenarCartera` sin slice/límite). Riesgo proyectado a cientos de leads; imperceptible con volumen de piloto.
- **Fix:** no urgente; umbral de paginación/virtualización si la cartera crece sostenido.
- **Confianza:** media (sin medición de rendimiento real).

**Constancia positiva fuera del guion:** el copy de guía está correctamente centralizado (`guidance-content.ts` con 14 bloques `GUIA_*` + `copy-blocks.ts` con 7 builders; lo inline es microcopy puntual) — disciplina a preservar al partir el wizard. Fechas con TZ fija America/Argentina/Buenos_Aires (`dates-ar.ts`) sin off-by-one detectado; "hace X" con `useSyncExternalStore` sin hydration mismatch; doble-submit protegido por `loading/disabled` consistente.

---

## 6. Límites de esta auditoría

**Qué no se pudo verificar estáticamente:**
- Percepción visual real (qué queda dentro del viewport, dónde aterrizan los scrolls en 1440/390): los hallazgos de UI se sostienen por orden del DOM, lógica de scroll y comentarios del propio código, no por captura en runtime. La pasada perceptual (el "B6.6" que la bitácora ya tiene pendiente) sigue abierta.
- El comportamiento multi-pestaña de A-15 y la pérdida de formulario de A-27: inferencias de arquitectura, no reproducciones.
- Volumen real de datos en producción (impacto de A-06 y A-31 depende de él).

**Verificaciones humanas pendientes:**
1. **Links de herramientas externas (§12.3):** `herramientas.ts` es la fuente y `tools-rail.tsx:29-45` muestra badge "pendiente" para las que no tienen URL cargada — verificar que estén cargadas en producción (configuración de Franco, no brecha de diseño).
2. **Prueba dinámica del perímetro de gating (A-13):** con sesión real de un setter B, disparar las server actions de `dossier`/`outreach`/`agenda`/`cartera`/`foco` con un `leadId` de A y verificar denegación + fila intacta. Hasta entonces, el GATEA queda acotado a lo descrito en §3.3.
3. **Lectura y triage de este informe por Franco:** toda decisión sobre qué se arregla y cuándo es suya; nada de lo aquí propuesto se ejecutó.

**Nota de proceso (transparencia):** los subagentes de auditoría reportaron bloques de contexto "inyectados" durante sus corridas (instrucciones de servidores MCP e.g. computer-use, y reglas de estilo React/TypeScript/ArkTS). Se identificó el origen: son las reglas globales del harness del usuario (`~/.claude/rules/ecc/*`) y las instrucciones MCP del entorno, que el runtime inyecta a todos los agentes — contenido benigno y ajeno al encargo, que los agentes correctamente ignoraron. Ningún agente ejecutó nada ni escribió al repo: todos operaron con herramientas de solo lectura (Read/Grep/Glob).

---

## 7. Anexo — prueba de inocuidad

El árbol de trabajo **ya estaba sucio al inicio de la sesión** (trabajo previo de sprints B6.x sin commitear). Para que la prueba de inocuidad sea real se comparan los `git status` de apertura y cierre: el delta de esta auditoría debe ser exactamente (1) este informe como untracked nuevo y (2) la bitácora — que **ya figuraba modificada antes de esta sesión** — con una entrada appendeada (su estado `M` no cambia).

**Baseline (inicio de sesión, antes de cualquier acción de esta auditoría):**

```
 M logic-core-v3/docs/bitacora-beta-3.md
 M logic-core-v3/package.json
 M logic-core-v3/src/app/(protected)/setter/_components/lead-card-actions.tsx
 M logic-core-v3/src/app/(protected)/setter/_components/setter-nav.tsx
 D logic-core-v3/src/app/(protected)/setter/_components/text-area.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/agenda-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/brief-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/construccion-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/escalar-modal.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/ficha-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/lead-wizard.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/opener-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/paso-actual-banner.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/seguimiento-step.tsx
 M logic-core-v3/src/app/(protected)/setter/nuevo/nuevo-prospecto-form.tsx
 M logic-core-v3/src/app/(protected)/setter/page.tsx
 M logic-core-v3/src/components/ui/index.ts
 M logic-core-v3/src/lib/leados/dossier.ts
 M logic-core-v3/src/lib/leados/escalamiento.ts
 M logic-core-v3/tests/leados/.last-run.json
 M logic-core-v3/tests/leados/dossier-gates.spec.ts
 M logic-core-v3/tests/setter/.last-run.json
?? logic-core-v3/docs/auditoria-recorrido-completo-novato.md
?? logic-core-v3/docs/proof-screenshots/
?? logic-core-v3/playwright.qa-persona.config.ts
?? logic-core-v3/playwright.qa-walkthrough.config.ts
?? logic-core-v3/scripts/qa-corridas/
?? logic-core-v3/src/components/ui/Textarea.tsx
?? logic-core-v3/src/lib/leados/reloop-selfcheck-reset.invariant.ts
?? logic-core-v3/tests/qa-persona/
?? logic-core-v3/tests/qa-walkthrough/
```

**Final (tras las dos escrituras del Cierre)** — output real de `git status --porcelain` al cierre, pegado sin editar:

```
 M logic-core-v3/docs/bitacora-beta-3.md
 M logic-core-v3/package.json
 M logic-core-v3/src/app/(protected)/setter/_components/lead-card-actions.tsx
 M logic-core-v3/src/app/(protected)/setter/_components/setter-nav.tsx
 D logic-core-v3/src/app/(protected)/setter/_components/text-area.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/agenda-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/brief-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/construccion-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/escalar-modal.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/ficha-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/lead-wizard.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/opener-step.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/paso-actual-banner.tsx
 M logic-core-v3/src/app/(protected)/setter/leads/[leadId]/_components/seguimiento-step.tsx
 M logic-core-v3/src/app/(protected)/setter/nuevo/nuevo-prospecto-form.tsx
 M logic-core-v3/src/app/(protected)/setter/page.tsx
 M logic-core-v3/src/components/ui/index.ts
 M logic-core-v3/src/lib/leados/dossier.ts
 M logic-core-v3/src/lib/leados/escalamiento.ts
 M logic-core-v3/tests/leados/.last-run.json
 M logic-core-v3/tests/leados/dossier-gates.spec.ts
 M logic-core-v3/tests/setter/.last-run.json
?? AUDITORIA-VS-BRIEF-2026-07.md
?? logic-core-v3/docs/auditoria-recorrido-completo-novato.md
?? logic-core-v3/docs/proof-screenshots/
?? logic-core-v3/playwright.qa-persona.config.ts
?? logic-core-v3/playwright.qa-walkthrough.config.ts
?? logic-core-v3/scripts/qa-corridas/
?? logic-core-v3/src/components/ui/Textarea.tsx
?? logic-core-v3/src/lib/leados/reloop-selfcheck-reset.invariant.ts
?? logic-core-v3/tests/qa-persona/
?? logic-core-v3/tests/qa-walkthrough/
```

**Delta de la sesión:** exactamente `?? AUDITORIA-VS-BRIEF-2026-07.md` (nuevo) — la bitácora ya estaba `M` y solo recibió el append. Ningún otro archivo cambió de estado por esta auditoría.
