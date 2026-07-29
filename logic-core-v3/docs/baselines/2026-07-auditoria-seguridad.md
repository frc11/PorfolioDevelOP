# Auditoría de seguridad dedicada — logic-core-v3

**Commit auditado:** `49fec9bd54c88913bca5459b45c2f582d4eb8c6f` (`origin/main`, 2026-07-24)
**Rama de la auditoría:** `chore/auditoria-seguridad` (worktree `C:\Users\franc\Desktop\wt-auditoria-seguridad`)
**Fecha de la corrida:** 2026-07-29
**Tipo:** defensiva, read-only sobre `src/`. Cero exploits, cero PoC armados, cero pruebas contra producción.
**Resultado:** 75 hallazgos — **3 ALTO · 38 MEDIO · 34 BAJO · 0 CRÍTICO**. 97 hallazgos ya conocidos quedaron fuera por la regla de no-duplicación.

---

## 1. Tres correcciones a las premisas del encargo

Las tres cambian el alcance de lo que pediste y las verifiqué antes de abrir ninguna lente.

**1.1 — El motor 360dialog SÍ está en el árbol auditado.** El encargo lo daba por ausente de `main`. En `49fec9b` existe `src/modules/motor/` (adaptadores WhatsApp inbound y outbound) y el webhook **público** `src/app/api/motor/webhook/[channelToken]/route.ts`. Lo audité en S4 y S6 en lugar de excluirlo: dejar fuera un endpoint público no autenticado por una premisa vencida habría sido un hueco, no una economía. Los hallazgos que lo tocan van marcados con alcance `motor-en-main`.

**1.2 — `main` local y `origin/main` divergieron.** `main` local tiene 50 commits sin pushear (carril LeadOS/manual) y `origin/main` tiene 5 que `main` no tiene (carril chatbot: ONF-1, FIX-ORIGIN, deadline del stream). Merge-base: `62994be`. Audité `origin/main` como pediste. El delta local toca **solo** el carril del setter — `_actions` del setter, `lib/leados/*`, y el refactor del cron-secret — mientras que el perímetro público (chatbot, auth, admin, dashboard) es idéntico en ambas puntas. Consecuencia práctica: los números de línea de los hallazgos de S2c pueden correrse unas pocas líneas contra tu `main` local; los del resto del reporte no.

**1.3 — La golden suite GS.1 no existe en la rama auditada.** `grep -rn "@isolation"` sobre todo el árbol devuelve **cero**. Los 8 tests viven en `chore/gs-aislamiento` (`403280b`), sin mergear: `git merge-base --is-ancestor chore/gs-aislamiento origin/main` da falso. La sección "qué cubre y qué no la golden suite" (§7) dice, en consecuencia, que hoy no cubre nada de lo que está desplegado.

---

## 2. Método

**Paso 0 — ingesta y ledger.** Leí completos los 4 reportes previos (~540 KB): la auditoría maestra (`chore/auditoria-maestra@5ff538d`), la CLEAN (sin commitear en `wt-auditoria-clean`), `docs/auditoria-seguridad-2026-05.md` + `docs/auditoria-total-pre-deploy.md`, y `docs/auditorias/AUDITORIA-CIERRE-2026-07.md` + `AUDITORIA-VS-BRIEF-2026-07.md`. De ahí salió un **ledger de 217 hallazgos de seguridad ya documentados**, repartido en slices por lente para que ninguna lente re-reportara lo conocido. Un quinto pase reconstruyó qué se arregló y dónde quedó cada arreglo.

**Lentes.** 8 lentes (S2 partida en tres por volumen: admin / dashboard / setter+censo) corridas en paralelo por agentes independientes, cada una con su slice del ledger y la obligación de marcar cada hallazgo como `NUEVO` / `CAMBIÓ DE ESTADO` / `CONFIRMADO-SIN-TEST`.

**Refutación adversarial.** Cada lente tenía un segundo agente con la instrucción de *refutar*, no de confirmar. **5 de 10 verificadores completaron** (S2b, S4, S5, S6, S8). Los otros 5 (S1, S2a, S2c, S3, S7) murieron por límite de sesión, y un reintento posterior murió igual. Eso es una limitación real de esta corrida y está marcada hallazgo por hallazgo: **32 de los 75 no tienen pasada de refutación independiente**. De esos 32 verifiqué yo mismo, de primera mano, los que sostienen las conclusiones más pesadas (S1-01, S3-01, S3-02, S7-01, S7-03, S7-05, y la adjudicación de S8-01); están anotados como *Adjudicación del auditor*.

La refutación no fue decorativa: **1 hallazgo refutado** (S5-03, la compensación de cupo — el disparador que proponía resultó inalcanzable porque el `streamText` no recibe `abortSignal`) y **9 severidades corregidas hacia abajo**.

**Lo que no se hizo, a propósito:** no se ejecutó el dev server, no se tocó ninguna base de datos, no se probó nada contra producción, y no se escribió ningún exploit. `git status -s` sobre el worktree no muestra cambios en `src/`.

---

## 3. Resumen ejecutivo

### 3.1 Los 3 ALTO

**S4-01 — el escape de origen `develop.com.ar` anula la allowlist de dominios de TODOS los bots.** `src/lib/security/validate-origin.ts:69-75` devuelve `allowed: true` en cuanto el header `Origin` es `https://develop.com.ar`, y ese `return` está **antes** del chequeo de `allowedDomains` (`:78-85`). Cualquiera que sepa el slug de un bot —enumerable desde `/health` y `/config`, ambos públicos— puede conversar con el bot de cualquier organización mandando ese header: consume su cupo mensual, gasta Vertex a cuenta de develOP, obtiene las respuestas construidas con la KB completa de ese tenant (info del negocio, servicios, precios, políticas) y puede inyectar leads en su CRM. Sin autenticación. Confirmado por el verificador, que buscó activamente el contra-argumento y no lo encontró.

**S1-01 — el lockout del login es evadible con un header, y el limiter durable que ya existe nunca se aplicó al login.** `src/app/login/actions.ts:20` usa un `Map` en memoria de módulo y `:53` toma el elemento **más a la izquierda** de `x-forwarded-for` — el que manda el cliente. Cada valor distinto cae en un bucket nuevo, así que el tope de 5 intentos / 5 minutos nunca se alcanza. No hay captcha, ni lockout por cuenta, ni delay progresivo: verifiqué que `auth-rate-limit.ts:11-18` no tiene ningún scope de login. El reemplazo durable (tabla `rate_limit` en Neon, UPSERT atómico) ya existe y lo usan forgot, reset, chatbot, contacto y el motor. El comentario de `login/actions.ts:10` que dice "en producción multi-instancia reemplazar por Redis" quedó obsoleto: el reemplazo se hizo, y a este archivo no llegó. Verificado por mí.

**S7-01 — retención indefinida de PII.** El único purgado cableado del sistema es `chatbot_events` a 30 días. Las transcripciones completas (`ChatMessage.content`), los leads con nombre/email/teléfono (`ChatbotLead`) y **todo el motor de WhatsApp** —número en claro en `ContactIdentity` y cuerpo íntegro de cada mensaje en `MotorMessage.body`— crecen sin cota y sin borrado. Verifiqué por mi cuenta que el grep de `deleteMany`/`delete` sobre esos modelos devuelve solo un borrado puntual de admin, un invariante de test, el cleanup de evals y dos borrados operativos del flujo de chat: ninguna política de retención. Bajo Ley 25.326 esto es exposición regulatoria, y además agranda el radio de daño de cualquier otro incidente.

### 3.2 El multiplicador: el repositorio es público

`gh repo view` sobre `frc11/PorfolioDevelOP` devuelve `"visibility":"PUBLIC"`. Eso no es un hallazgo aislado, es el contexto que le sube el precio a varios otros:

- **S8-06** — el repo publica 16 documentos de auditoría que enumeran, con `archivo:línea`, cada debilidad abierta de la aplicación. Es un mapa curado y priorizado, gratis para cualquiera. *Este reporte, si se pushea, se suma a esa pila.*
- **S8-01** — la key `GOOGLE_GENERATIVE_AI_API_KEY` sigue en el historial (blob `f9d11ed`, commit `3953558`, alcanzable desde `origin/main`). **Corrección importante:** el runbook `docs/audits/2026-05-bfg-leak-cleanup.md:19` deja constancia de que confirmaste que esa key ya estaba deshabilitada antes del descubrimiento, y el formato coincide con lo que medí (36 caracteres, formato UUID). **No es una credencial viva y no hay rotación de emergencia que hacer.** Queda confirmarlo en GCP y decidir la purga.
- **S7-03** — `ipHash` cae a un salt literal escrito en el código si falta `CHATBOT_IP_HASH_SALT`, y en producción solo loguea un warning y sigue. Con el repo público, ese salt es de dominio público: la propiedad de no-reversibilidad que el propio módulo declara ("GDPR-friendly") se cae si la variable no está seteada en Netlify. No puedo verificar desde el repo si lo está.
- **S8-07** — los 20 archivos basura de la raíz están todos trackeados. Verifiqué que **no contienen credenciales**: solo rutas absolutas con tu usuario de Windows (75 ocurrencias en `.eslint_output.txt`, 23 en `audit.txt`). Fuga de información menor, no de secretos.

### 3.3 El positivo que vale la pena decir

**No encontré ninguna escalada vertical de privilegio.** El patrón que el encargo pedía buscar —"una server action de admin cuyo único guard sea la página que la usa"— **no existe en este repo**. Las 116 acciones del perímetro admin llevan su propio guard de rol, salvo las 2 ya documentadas (`preflightChecks`, SEC-02). Eso importa más de lo que parece, porque el middleware **no** protege server actions: una action se resuelve por su ID en el manifiesto, no por la URL a la que se postea, así que un POST fuera del matcher de `proxy.ts` ejecutaría igual. Lo único que lo para es el `requireSuperAdmin()` de adentro, y está. Lo mismo del lado API: las 8 rutas `/api/admin/**` autorizan por su cuenta, que es obligatorio porque el matcher no cubre `/api/*`.

Sobre los "tres dialectos de soy super-admin" que reportó CLEAN: **son seis, y ninguno es más débil en la decisión de autorización**. Los seis comparan `session.user.role === 'SUPER_ADMIN'` contra la misma fuente (`auth()`, memoizado con `React.cache`). Ninguno lee el rol de un header, un body, un param ni una cookie. Las divergencias son de contrato (uno exige además `session.user.id`, otro no), no de fuerza.

También cerré un ítem del ledger que estaba abierto por arrastre: **el state de OAuth de Google Business y Tiendanube sí está firmado con HMAC-SHA256** y se verifica con `timingSafeEqual` antes de tocar la base (S6-06). SEC-AUTH-01, SEC-AUTH-02, SEC-AUTH-06 y F3 pueden marcarse cerrados.

### 3.4 Los 5 fixes de mayor retorno

| # | Fix | Qué cierra | Esfuerzo | ¿Decisión tuya? |
|---|---|---|---|---|
| 1 | **Pasar el repositorio a privado** | S8-06 entero, el residual de S8-01, S8-07, y le quita alcance público al salt de S7-03 | 1 checkbox | **Sí** — ¿el repo tiene que ser público como portfolio de la agencia? |
| 2 | **Acotar el escape de `develop.com.ar`** al bot propio, moviéndolo después de resolver el bot (`validate-origin.ts:69-75`) | S4-01 (ALTO) | ~5 líneas | Definir la lista exacta a sembrar en `allowedDomains` |
| 3 | **Migrar el login al limiter durable** + un único helper de IP confiable que no lea el elemento left-most | S1-01 (ALTO) y de paso el mismo defecto en forgot/reset | ~1 sprint chico | Confirmar el header de IP no falsificable de Netlify |
| 4 | **Mergear `chore/gs-aislamiento` y `chore/security-quick-wins`** | GS.1 (8 tests `@isolation`), el borrado de `/api/test-sentry`, y la frontera ESLint sobre los ~20 modelos del portal | El trabajo ya está hecho y probado: es un merge | Orden de merge, y si la regla del portal entra como `warn` o `error` |
| 5 | **Un cron de retención**, hermano del `cleanup-old-events` que ya existe | S7-01 (ALTO) y la exposición Ley 25.326 | ~1 sprint chico | **Sí** — el TTL por tipo de dato, y si vence en borrado o en anonimización |

El #4 es el de mejor relación esfuerzo/retorno de toda la lista: **no requiere escribir código nuevo**. Son dos ramas terminadas que nunca se mergearon, y una de ellas contiene el fix de un endpoint público de debug que sigue vivo en lo desplegado.

---

## 4. Estado de lo desplegado vs. lo arreglado

Tres cosas están arregladas en ramas que **no** están en `origin/main`, así que siguen abiertas en lo que corre:

| arreglo | dónde vive | estado en `origin/main` |
|---|---|---|
| Borrado de `/api/test-sentry` (GET público sin auth ni gate de entorno que lanza una excepción) | `chore/security-quick-wins` @ `1b63945` | **sigue existiendo** — lo verifiqué leyendo el archivo |
| Frontera de aislamiento extendida a los ~20 modelos del portal + inventario de **222 call-sites** en 90 archivos | `chore/security-quick-wins` @ `fa5ed47` | **no está** — ni siquiera existe la regla ESLint que los avisa |
| Golden suite GS.1 (8 tests `@isolation`) | `chore/gs-aislamiento` @ `403280b` | **no está** — cero tests `@isolation` en el árbol |

Un cuarto dato del mismo tipo: `origin/main` arrastra un **error de tipos real** —`export function getProvidedCronSecret` en `src/app/api/cron/cleanup-old-events/route.ts:28`, que Next 16 prohíbe en un `route.ts`— y el build pasa igual porque `next.config.ts:11` tiene `ignoreBuildErrors: true`. Corrí `npm run build` sobre la rama auditada: termina en **exit 0**. El verde no significa nada mientras esa opción esté activa. (De paso, el build avisa que la clave `eslint` de `next.config.ts` ya no está soportada en Next 16: `ignoreDuringBuilds` es hoy una opción muerta.)


---

## 5. Matriz rol × superficie (entregable de S2)

Convención de las tablas: `OK` = permitido · `DEN` = denegado · **SIN GUARD** = sin ninguna verificación.
Las tablas salen del censo función-por-función de las tres sub-lentes de S2.


### 5.1 — Admin (lente S2a)

MÉTODO. Read-only sobre `C:\Users\franc\Desktop\wt-auditoria-seguridad\logic-core-v3`, rama chore/auditoria-seguridad @ 49fec9b (confirmado con `git log --oneline -3`). Cero escrituras en src/. El único artefacto que produje es un script de censo en `C:\tmp\s2a\scan.mjs` (fuera del repo) que, para cada archivo con `'use server'`, parte el archivo por exports de nivel superior y marca los que no contienen ninguna llamada a guard. Pasos: (1) censo de las 37 rutas `route.ts` y de los 90 archivos `'use server'` de src/; (2) lectura íntegra de proxy.ts, auth.ts, auth.config.ts, auth-guards.ts, los dos requireSuperAdmin, admin/layout.tsx, assert-ownership.ts, preview.ts, impersonation.ts; (3) censo función-por-función de las 116 acciones exportadas del perímetro admin; (4) verificación de que ningún guard se invoca sin `await`; (5) verificación de call-sites de las funciones de datos cross-org sin guard; (6) barrido de invariantes y tests buscando cobertura de rol.

COBERTURA ALCANZADA. 33 páginas bajo /admin, 8 rutas /api/admin, 24 archivos `'use server'` bajo /admin (68 acciones) y 18 archivos `'use server'` de admin fuera de esa carpeta (48 acciones): 116 acciones revisadas una por una. Más los 4 archivos de `src/modules/chatbot/server/admin/integrations/**` y el índice del módulo.

EL POSITIVO CENTRAL, QUE ES EL TITULAR DE ESTA LENTE. **No encontré ninguna escalada vertical.** El patrón que la consigna pedía buscar — "una action de admin cuyo único guard sea la página que la usa" — NO EXISTE en este repo: las 116 acciones del perímetro admin llevan su propio guard de rol, salvo las 2 ya documentadas (preflightChecks, SEC-02) y 2 que son org-scoped a propósito. Esto importa más de lo que parece, porque el middleware NO es un guard de actions: una server action se resuelve por su ID en el manifiesto, no por la URL a la que se postea, así que un POST a `/` (fuera del matcher de proxy.ts) ejecutaría igual la action de admin. Lo único que la para es el `requireSuperAdmin()` de adentro. Está. Lo mismo del lado API: las 8 rutas `/api/admin/**` autorizan por su cuenta, que es obligatorio porque el matcher del middleware no cubre `/api/*`. `src/lib/actions/projects.ts:19-31` documenta explícitamente el fix histórico ("las actions de este archivo eran trust-the-layout… agregamos guard local en cada action"): esa lección ya se aplicó y se sostuvo.

LOS TRES DIALECTOS DE "SOY SUPER-ADMIN" (respuesta directa a la consigna). Son SEIS, no tres, y **ninguno es más débil en la decisión de autorización**: los seis comparan `session.user.role === 'SUPER_ADMIN'` contra la misma fuente (`auth()` de auth.ts, memoizado con React.cache). Ninguno lee el rol de un header, un body, un param o una cookie — lo verifiqué con grep. Ninguno se invoca sin `await`. Las divergencias son de contrato: (1) `lib/auth-guards.ts:6` exige ADEMÁS `session.user.id` → es el más estricto; (2) `modules/chatbot/server/admin/requireSuperAdmin.ts:10-16` no lo exige y sus callers auditan con `user.id ?? 'unknown'` (bulk-actions.ts:30) → el más laxo, pero sólo en trazabilidad; (3) 34 comparaciones inline; (4) una homónima privada en `lib/actions/settings.ts:20`; (5) `ensureAdmin()` booleano en `lib/actions/leads.ts:14`; (6) `ensureSuperAdminOrErrorString()` en `lib/actions/projects.ts:24`. Efecto secundario menor: `demo-chat/[slug]/route.ts:24` y `test-prompt/route.ts:20` dejan escapar el throw del guard → 500 en vez de 403 (deniega igual, sólo ensucia el contrato de error).

GUARDS DE PRESENTACIÓN. No encontré ninguno haciéndose pasar por guard de servidor. Los componentes de UI (ImpersonateButton, BulkActionBar, DecisionBar) se limitan a invocar actions que autorizan del lado servidor. El caso más cercano es `admin/fg2-lab/page.tsx`, que no está linkeada en el sidebar "a propósito, se entra por URL" — pero eso no es un guard y la página está cubierta por layout + middleware igual que las demás.

---

## TABLA COMPLETA — superficie / tipo / guard / archivo:linea / rol por rol

Convención: `OK` = permitido · `DEN` = denegado · `**SIN GUARD**` = sin ninguna verificación. La columna CLIENT es teórica en todas las filas: ningún código asigna ni consulta ese valor del enum (ver S2a-05). Donde el guard es el middleware, la línea es `proxy.ts:148`; donde es el layout, `admin/layout.tsx:47`.

### Bloque 1 — Rutas `/api/admin/**` (el middleware NO las cubre: matcher proxy.ts:171-173 sin `/api/*`)

| superficie | tipo | guard que tiene | archivo:linea del guard | SUPER_ADMIN | ORG_MEMBER | CLIENT | SETTER |
|---|---|---|---|---|---|---|---|
| POST /api/admin/alerts/trigger-detector | route | inline role, 403 | alerts/trigger-detector/route.ts:7 | OK | DEN | DEN | DEN |
| POST /api/admin/chatbot/demo-chat/[slug] | route | requireSuperAdmin (módulo chatbot), throw→500 | chatbot/demo-chat/[slug]/route.ts:24 | OK | DEN | DEN | DEN |
| GET /api/admin/chatbot/events | route | inline role, 401 | chatbot/events/route.ts:9 | OK | DEN | DEN | DEN |
| POST /api/admin/chatbot/insights/generate | route | inline role, 401 | chatbot/insights/generate/route.ts:8 | OK | DEN | DEN | DEN |
| POST /api/admin/chatbot/test-prompt | route | requireSuperAdmin (módulo chatbot), throw→500 | chatbot/test-prompt/route.ts:20 | OK | DEN | DEN | DEN |
| POST /api/admin/clients/[organizationId]/send-executive-report | route | requireSuperAdmin (auth-guards) + rate-limit + audit | clients/[organizationId]/send-executive-report/route.ts:14, :35, :62 | OK | DEN | DEN | DEN |
| POST /api/admin/reports/send-now | route | inline role, 403 | reports/send-now/route.ts:7 | OK | DEN | DEN | DEN |
| POST /api/admin/users/[userId]/resend-credentials | route | inline role, 403 + rate-limit + audit (NO valida rol del target → S2a-06) | users/[userId]/resend-credentials/route.ts:17, :25 | OK | DEN | DEN | DEN |

### Bloque 2 — Páginas `/admin/**` (33). Guard base para todas: `proxy.ts:148` + `admin/layout.tsx:47`

| superficie | tipo | guard que tiene | archivo:linea del guard | SUPER_ADMIN | ORG_MEMBER | CLIENT | SETTER |
|---|---|---|---|---|---|---|---|
| /admin/audit-log | page | propio (inline role) + layout + proxy | audit-log/page.tsx:9 | OK | DEN | DEN | DEN |
| /admin/chatbots | page | propio + layout + proxy | chatbots/page.tsx:15 | OK | DEN | DEN | DEN |
| /admin/chatbots/new | page | propio + layout + proxy | chatbots/new/page.tsx:12 | OK | DEN | DEN | DEN |
| /admin/chatbots/[botId] | page | propio + layout + proxy | chatbots/[botId]/page.tsx:29 | OK | DEN | DEN | DEN |
| /admin/clients | page | propio + layout + proxy | clients/page.tsx:92 | OK | DEN | DEN | DEN |
| /admin/clients/[clientId] | page | propio + layout + proxy | clients/[clientId]/page.tsx:29 | OK | DEN | DEN | DEN |
| /admin/clients/[clientId]/edit | page | propio + layout + proxy | clients/[clientId]/edit/page.tsx:12 | OK | DEN | DEN | DEN |
| /admin/clients/[clientId]/chatbot/[[...tab]] | page | propio + layout + proxy | clients/[clientId]/chatbot/[[...tab]]/page.tsx:21 | OK | DEN | DEN | DEN |
| /admin/settings/alerts | page | propio + layout + proxy | settings/alerts/page.tsx:8 | OK | DEN | DEN | DEN |
| /admin/settings/reports | page | propio + layout + proxy | settings/reports/page.tsx:8 | OK | DEN | DEN | DEN |
| /admin/projects/[projectId]/hours | page | propio (requireSuperAdmin) + layout + proxy | projects/[projectId]/hours/page.tsx:28 | OK | DEN | DEN | DEN |
| /admin/projects/[projectId] | page | propio SOLO-AUTH + `callerCanAccessOrg` (scopea por org, no por rol) + layout + proxy | projects/[projectId]/page.tsx:98, :165 · layout.tsx:159 | OK | DEN | DEN | DEN |
| /admin (home) | page | layout + proxy | admin/layout.tsx:47 · proxy.ts:148 | OK | DEN | DEN | DEN |
| /admin/alerts | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/announcements | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/chatbot/activity | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/chatbot/health | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/clients/new | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/fg2-lab (no linkeada, se entra por URL) | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/leados | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/leados/[leadId] | page | layout + proxy (lee leadId de URL) | ídem | OK | DEN | DEN | DEN |
| /admin/leados/setter/[setterId] | page | layout + proxy (lee setterId de URL → nombre+email del setter + todas sus evaluaciones) | ídem · comentario en :27 | OK | DEN | DEN | DEN |
| /admin/leads | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/leads/[leadId] | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/messages | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/messages/[orgId] | page | layout + proxy (lee orgId de URL) | ídem | OK | DEN | DEN | DEN |
| /admin/projects | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/projects/[projectId]/payments | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/projects/[projectId]/tasks | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/referrals | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/settings | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/team | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/tickets | page | layout + proxy | ídem | OK | DEN | DEN | DEN |
| /admin/tickets/[ticketId] | page | layout + proxy | ídem | OK | DEN | DEN | DEN |

### Bloque 3 — Server actions bajo `/admin/**` (24 archivos, 68 acciones). El middleware NO las protege (una action se resuelve por ID, no por URL): el guard es el de adentro

| superficie | tipo | guard que tiene | archivo:linea del guard | SUPER_ADMIN | ORG_MEMBER | CLIENT | SETTER |
|---|---|---|---|---|---|---|---|
| announcements.actions (2: create, delete) | action | requireSuperAdmin | announcements/_actions/announcements.actions.ts:18, :66 | OK | DEN | DEN | DEN |
| chatbots/bulk-actions (4: pause, activate, exportLeads, delete) | action | inline role | chatbots/bulk-actions.ts:20, :66, :112, :165 | OK | DEN | DEN | DEN |
| chatbots/new/actions (1: createBot) | action | inline role | chatbots/new/actions.ts:43 | OK | DEN | DEN | DEN |
| chatbots/[botId]/actions (2: toggleActive, delete) | action | inline role | chatbots/[botId]/actions.ts:30, :114 | OK | DEN | DEN | DEN |
| chatbots/[botId]/transcript-action (1) | action | inline role | chatbots/[botId]/transcript-action.ts:27 | OK | DEN | DEN | DEN |
| chatbots/_actions/convert-chatbot-lead (1) | action | requireSuperAdmin | chatbots/_actions/convert-chatbot-lead.actions.ts:21 | OK | DEN | DEN | DEN |
| clients/_actions/client.actions (2: start/stopImpersonation) | action | delega en lib/actions/impersonation (guard con redirect) | clients/_actions/client.actions.ts:8-13 → impersonation.ts:13 | OK | DEN | DEN | DEN |
| clients/_actions/plan.actions (3: assignPlan, set/clearBillingOverride) | action | requireSuperAdmin | clients/_actions/plan.actions.ts:88, :248, :324 | OK | DEN | DEN | DEN |
| leados/_actions/revision.actions (2: aprobar, rechazar) | action | requireSuperAdmin | leados/_actions/revision.actions.ts:71, :98 | OK | DEN | DEN | DEN |
| leads/_actions/activity.actions (1) | action | requireSuperAdmin | leads/_actions/activity.actions.ts:13 | OK | DEN | DEN | DEN |
| leads/_actions/demo.actions (2) | action | requireSuperAdmin | leads/_actions/demo.actions.ts:15, :35 | OK | DEN | DEN | DEN |
| leads/_actions/inbound.actions (2) | action | requireSuperAdmin | leads/_actions/inbound.actions.ts:55, :123 | OK | DEN | DEN | DEN |
| leads/_actions/lead.actions (7, incl. assignLeadSetter que valida `setter.role === 'SETTER'`) | action | requireSuperAdmin | lead.actions.ts:56, :76, :99, :132, :234, :253, :281 · check de target en :155 | OK | DEN | DEN | DEN |
| leads/_actions/module-demand.actions (1) | action | requireSuperAdmin (sin Zod — ya documentado) | leads/_actions/module-demand.actions.ts:25 | OK | DEN | DEN | DEN |
| leads/_actions/reunion.actions (2) | action | requireSuperAdmin | leads/_actions/reunion.actions.ts:47, :68 | OK | DEN | DEN | DEN |
| messages/_actions/message.actions (4) | action | requireSuperAdmin | messages/_actions/message.actions.ts:44, :141, :173, :210 | OK | DEN | DEN | DEN |
| projects/_actions/maintenance.actions (3) | action | requireSuperAdmin | maintenance.actions.ts:35, :64, :94 | OK | DEN | DEN | DEN |
| projects/_actions/milestone.actions (2) | action | requireSuperAdmin | milestone.actions.ts:23, :53 | OK | DEN | DEN | DEN |
| projects/_actions/project.actions (7) | action | requireSuperAdmin | project.actions.ts:595, :645, :726, :784, :837, :934, :1024 | OK | DEN | DEN | DEN |
| referrals/_actions/referrals.admin.actions (2) | action | requireSuperAdmin (sin Zod — ya documentado) | referrals.admin.actions.ts:15, :38 | OK | DEN | DEN | DEN |
| settings/_actions/settings.actions (4) | action | requireSuperAdmin | settings.actions.ts:88, :142, :180, :217 | OK | DEN | DEN | DEN |
| team/_actions/task.actions (6) | action | requireSuperAdmin | task.actions.ts:157, :199, :233, :268, :325, :381 | OK | DEN | DEN | DEN |
| team/_actions/time-entry.actions (5) | action | requireSuperAdmin | time-entry.actions.ts:140, :199, :247, :274, :318 | OK | DEN | DEN | DEN |
| tickets/_actions/ticket.actions (2) | action | requireSuperAdmin | ticket.actions.ts:52, :134 | OK | DEN | DEN | DEN |

### Bloque 4 — Actions "de admin" fuera de `/admin/**` (18 archivos, 48 acciones)

| superficie | tipo | guard que tiene | archivo:linea del guard | SUPER_ADMIN | ORG_MEMBER | CLIENT | SETTER |
|---|---|---|---|---|---|---|---|
| chatbot/server/admin/archiveClient (2) | action | requireSuperAdmin (módulo) | archiveClient.ts:17, :55 | OK | DEN | DEN | DEN |
| chatbot/server/admin/createClientOnly (1) | action | requireSuperAdmin | createClientOnly.ts:48 | OK | DEN | DEN | DEN |
| chatbot/server/admin/createClientWithBot (1) | action | requireSuperAdmin | createClientWithBot.ts:96 | OK | DEN | DEN | DEN |
| chatbot/server/admin/hardDeleteClient (2) | action | requireSuperAdmin | hardDeleteClient.ts:110, :126 | OK | DEN | DEN | DEN |
| chatbot/server/admin/manageAlerts (3) | action | requireSuperAdmin | manageAlerts.ts:10, :32, :77 | OK | DEN | DEN | DEN |
| chatbot/server/admin/saveBotConfig (1) | action | requireSuperAdmin | saveBotConfig.ts:78 | OK | DEN | DEN | DEN |
| chatbot/server/admin/saveBotConfigByOrgSlug (1) | action | requireSuperAdmin | saveBotConfigByOrgSlug.ts:71 | OK | DEN | DEN | DEN |
| chatbot/server/admin/saveKnowledgeBase (1) | action | requireSuperAdmin | saveKnowledgeBase.ts:24 | OK | DEN | DEN | DEN |
| chatbot/server/admin/saveKnowledgeBaseByOrgSlug (1) | action | requireSuperAdmin | saveKnowledgeBaseByOrgSlug.ts:24 | OK | DEN | DEN | DEN |
| chatbot/server/admin/sendTestNotification (1) | action | requireSuperAdmin | sendTestNotification.ts:17 | OK | DEN | DEN | DEN |
| chatbot/server/admin/updateClient (1) | action | requireSuperAdmin | updateClient.ts:29 | OK | DEN | DEN | DEN |
| chatbot/server/admin/updateClientInternalNotes (1) | action | requireSuperAdmin | updateClientInternalNotes.ts:20 | OK | DEN | DEN | DEN |
| chatbot/server/admin/integrations/{retryCrmSync, saveCrmIntegration, testCrmConnection} (3) | action | requireSuperAdmin | retryCrmSync.ts:24 · saveCrmIntegration.ts:30 · testCrmConnection.ts:22 | OK | DEN | DEN | DEN |
| **chatbot/server/admin/preflightChecks (2: runPreflightChecks, canActivate)** | action | **NINGUNO** (ya documentado SEC-02) | preflightChecks.ts:13 y :170 — sin guard | OK | **SIN GUARD** | **SIN GUARD** | **SIN GUARD** (y sin sesión también) |
| chatbot/server/admin/saveClientSettings (1) | action | delega en updateBotAppearance: auth() + resolveOrgId (org-scope, NO rol) | saveClientSettings.ts:34 → updateBotAppearance.ts:56, :61 | OK sólo impersonando | OK (por diseño: es del dashboard cliente) | DEN | DEN (resolveOrgId → null) |
| chatbot/server/admin/updateLeadStatus (1) | action | getClientChatbotSession + forOrg (org-scope, NO rol) | updateLeadStatus.ts:18, :23 | DEN (sin membership) | OK (por diseño) | DEN | DEN |
| lib/bulk-actions (2: bulkPauseBots, bulkExportLeads) | action | requireSuperAdmin (módulo chatbot) | bulk-actions.ts:9, :47 | OK | DEN | DEN | DEN |
| actions/admin/onboarding-tasks (2) | action | inline role | onboarding-tasks.ts:10, :52 | OK | DEN | DEN | DEN |
| lib/actions/impersonation (2) | action | inline role + redirect | impersonation.ts:13 | OK | DEN | DEN | DEN |
| lib/actions/invitations (1: inviteClientAction) | action | inline role | invitations.ts:48 | OK | DEN | DEN | DEN |
| lib/actions/clients (2: create, updateClientAction) | action | requireSuperAdmin | clients.ts:81, :155 | OK | DEN | DEN | DEN |
| lib/actions/projects (7) | action | requireSuperAdmin / ensureSuperAdminOrErrorString | projects.ts:26, :39, :74, :109, :126, :159, :178, :214 | OK | DEN | DEN | DEN |
| lib/actions/services (3) | action | requireSuperAdmin | services.ts:28, :60, :81 | OK | DEN | DEN | DEN |
| lib/actions/leads (2) | action | ensureAdmin() booleano | leads.ts:23, :49 | OK | DEN | DEN | DEN |
| lib/actions/messages (4: 2 admin + markMessagesAsRead que delega + sendClientMessage) | action | inline role en las admin; org-scope en la de cliente | messages.ts:21, :78, :110 (delega), :118 | OK | DEN en las admin | DEN | DEN |
| lib/actions/settings (7 — MÓDULO MUERTO, 0 importadores; contiene el único alta de SUPER_ADMIN) | action | requireSuperAdmin local | settings.ts:20, :51, :104, :153, :241, :277, :313 | OK | DEN | DEN | DEN |
| lib/tickets/actions (4, compartida admin/cliente) | action | rama por rol: admin salta el anti-IDOR, cliente pasa por assertTicketBelongsToOrg | tickets/actions.ts:124, :130, :187 | OK | OK acotado a su org | DEN | DEN (resolveOrgId → null) |

---

LO QUE QUEDÓ SIN MIRAR EN ESTA LENTE. (1) El contenido de negocio de cada action de admin — miré el guard de rol, no la lógica (p. ej. no auditar si `assignLeadSetter` puede romper una invariante del motor). (2) El scoping por ORGANIZACIÓN dentro de las actions admin: es la lente de multi-tenant, y la maestra ya la cubrió; acá sólo dejé constancia de que `callerCanAccessOrg` es un no-op para SUPER_ADMIN por diseño (assert-ownership.ts:85). (3) La superficie /dashboard/** y /setter/**: la toqué sólo donde se cruza con admin (tickets compartidos, os-commercial, email-marketing) y no la audité — `dashboard/modules/email-marketing/_actions.ts:71,:128,:174` gatean por `resolveOrgId()` (org) y no por rol ni por plan dentro de la action: eso es material de la lente de dashboard, lo dejo señalado sin desarrollar. (4) Validación Zod de cada action de admin (ya inventariada como SEC-INV-zod-gaps). (5) Rate-limiting de las actions de admin: sólo dos rutas lo tienen (send-executive-report, resend-credentials); el resto no, pero con precondición SUPER_ADMIN no lo considero hallazgo de esta lente.

### 5.2 — Dashboard de cliente (lente S2b)

MÉTODO. Read-only estricto sobre C:\\Users\\franc\\Desktop\\wt-auditoria-seguridad\\logic-core-v3, rama chore/auditoria-seguridad @ 49fec9b (confirmado con git log). Cero escrituras en src/. Solo Read/Grep/Glob y comandos de lectura (git log, grep, find, cat). No se levantó servidor, no se corrió build, no se tocó la DB, no se abrió .env*.

COBERTURA ALCANZADA. Leí completos: src/proxy.ts, src/auth.ts, src/lib/preview.ts, los 7 archivos de src/app/(protected)/dashboard/**/_actions/*, los 17 archivos de src/lib/actions/*, los 6 de src/actions/*, src/app/bienvenida/_actions/complete-onboarding.ts, src/lib/tickets/actions.ts, src/components/dashboard/modules/motor-resenas/_actions.ts, src/modules/chatbot/server/dashboard/updateBotAppearance.ts, src/modules/chatbot/server/admin/getClientSession.ts, y las 9 rutas del recorte (leads/export, leads/recent, reports/client-monthly, reports/monthly, email/optout/[contactId], email/unsubscribe-executive, track, version, dev/email-preview/executive-weekly). Además: src/lib/email/unsubscribe-token.ts, src/lib/integrations/brevo.ts, src/lib/modules/check-activation.ts, src/lib/security/org-scope.ts, src/lib/rate-limit/presets.ts, el layout de /dashboard, el layout de /dashboard/chatbot, el layout del módulo email-marketing, y prisma/schema.prisma (enum Role, User, ClientAsset). Censos por comando: asignaciones de rol (40 sitios), lecturas de session.user.organizationId (30 ocurrencias / 13 archivos), referencias a passwordResetRequired (29), call sites de checkRateLimit (12), páginas de /dashboard sin resolución de sesión (3, las tres son redirects puros), importadores de cada módulo de actions.

RESPUESTA A LA PREGUNTA CENTRAL — ¿DÓNDE QUEDA CLIENT? Verificado por censo: CLIENT existe en prisma/schema.prisma:15 y en la unión de src/auth.config.ts:4, y NO SE ASIGNA EN NINGÚN LADO — ni en src/, ni en los dos seeds, ni en scripts/. Los seis sitios que crean usuarios fijan ORG_MEMBER duro; los setters solo nacen de seeds/scripts. Es un rol fantasma (detalle en S2b-03). Su rechazo NO es uniforme: proxy.ts:154 y el redirect de dashboard/layout.tsx:90-92 lo expulsan de las páginas por guard explícito, pero las ~13 server actions que leen session.user.organizationId y toda la superficie que cuelga de getClientChatbotSession lo admitirían con solo tener una fila OrgMember, porque nunca miran el rol (S2b-02). O sea: hoy queda encerrado afuera, pero por ausencia de datos en dos de los tres caminos, no por candado.

DOS CONSTANCIAS POSITIVAS QUE VALE PRESERVAR. (1) F7 del checklist heredado ('link de unsubscribe sin HMAC') está CERRADO y verificado: los dos endpoints firman con HMAC namespaced por scope y comparan con timingSafeEqual, la verificación es previa a tocar la DB (anti-enumeración) y el opt-out usa updateMany para ser idempotente y no revelar existencia — src/lib/email/unsubscribe-token.ts:26-51 y :85-109, optout/route.ts:77, unsubscribe-executive/route.ts:62. Queda cubierto además por src/lib/security/idor-tokens.invariant.ts, que SÍ está cableado en check:invariants. (2) El patrón anti-IDOR de motor-resenas (resolveScopedOrgId + isModuleActive dentro de cada action, src/lib/security/org-scope.ts:20-27) es la referencia correcta del repo; es exactamente lo que le falta a email-marketing.

TABLA — superficie | tipo | guard | archivo:línea | SUPER_ADMIN | ORG_MEMBER | CLIENT | SETTER

Leyenda: PASA = el guard lo deja operar · NO = rechazado por guard explícito · NO(datos) = rechazado solo porque hoy no tiene fila OrgMember, no por guard · IMP = pasa únicamente con impersonation activa.

| superficie | tipo | guard | archivo:línea | SUPER_ADMIN | ORG_MEMBER | CLIENT | SETTER |
|---|---|---|---|---|---|---|---|
| /dashboard/** (navegación) | proxy | role !== ORG_MEMBER → redirect, salvo admin impersonando | src/proxy.ts:154 | IMP | PASA | NO | NO |
| /dashboard/** (layout) | layout RSC | resolveOrgId() null → redirect | dashboard/layout.tsx:90-92 | IMP | PASA | NO | NO |
| /api/* (todo el namespace) | proxy | fuera del matcher | src/proxy.ts:172 | PASA | PASA | PASA | PASA |
| cambio de password forzado | proxy | passwordResetRequired → /cambiar-password, solo en rutas del matcher | src/proxy.ts:84-90,172 | n/a | solo páginas | solo páginas | solo páginas |
| GET /api/dashboard/chatbot/leads/export (CSV de PII) | route | getClientChatbotSession() — membresía, ciego al rol | export/route.ts:84-87 | NO(datos) | PASA | NO(datos) | NO(datos) |
| GET /api/dashboard/leads/recent | route | auth() + resolveOrgId() | recent/route.ts:11-19 | IMP | PASA | NO | NO |
| GET /api/reports/client-monthly | route | resolveOrgId() + planAllows('insight') | client-monthly/route.ts:25-33 | IMP | PASA | NO | NO |
| GET /api/reports/monthly | route | auth() + rama por rol; admin exige organizationId; cliente exige match con la sesión | monthly/route.ts:22-51 | PASA (org explícita) | PASA (su org) | NO(sin org) | NO(sin org) |
| GET /api/email/optout/[contactId] | route pública | HMAC por contactId (timingSafeEqual) | optout/route.ts:77 | público | público | público | público |
| GET+POST /api/email/unsubscribe-executive | route pública | HMAC por orgId (timingSafeEqual) | unsubscribe-executive/route.ts:62 | público | público | público | público |
| POST /api/track | route | auth(); admin puede mandar organizationId del body | track/route.ts:11-27 | PASA (org libre) | PASA (su org) | NO(sin org) | NO(sin org) |
| GET /api/version | route pública | ninguno (devuelve NODE_ENV) | version/route.ts:3-8 | público | público | público | público |
| GET /api/dev/email-preview/executive-weekly | route | NODE_ENV === 'production' → 404 | dev/email-preview/.../route.ts:107-109 | dev only | dev only | dev only | dev only |
| saveAverageTicket | action | resolveOrgId() + Zod | dashboard/_actions/business-profile.actions.ts:25-31 | IMP | PASA | NO | NO |
| saveExecutiveReportPrefs | action | resolveOrgId() + Zod | dashboard/_actions/executive-report-prefs.actions.ts:23-29 | IMP | PASA | NO | NO |
| regenerateBriefAction | action | auth() + resolveOrgId() + Zod | dashboard/_actions/regenerate-brief.ts:10-17 | IMP | PASA | NO | NO |
| markClientMessagesRead | action | resolveOrgId() (sin input) | dashboard/messages/_actions/mark-read.ts:12-13 | IMP | PASA | NO | NO |
| getClientConversationTranscriptAction | action | getClientChatbotSession() + Zod | chatbot/conversations/transcript-action.ts:34-42 | NO(datos) | PASA | NO(datos) | NO(datos) |
| importContactsAction / createCampaignAction / sendCampaignAction | action | resolveOrgId() SOLO — sin gate de módulo, sin Zod, sin rate-limit | email-marketing/_actions.ts:17-28,71,128,174 | IMP | PASA (S2b-01) | NO | NO |
| generateDraft / replyAction (motor-resenas) | action | resolveOrgId + resolveScopedOrgId + isModuleActive | motor-resenas/_actions.ts:20-24,55-59 | IMP | PASA si módulo activo | NO | NO |
| updateBotAppearance | action | auth() + resolveOrgId() + Zod + forOrg | chatbot/server/dashboard/updateBotAppearance.ts:55-77 | IMP | PASA | NO | NO |
| updateLeadStatus (chatbot) | action | getClientChatbotSession() + Zod + forOrg | chatbot/server/admin/updateLeadStatus.ts:17-34 | NO(datos) | PASA | NO(datos) | NO(datos) |
| updateProfileAction / updateContactAction / updateNotificationPrefsAction / requestAccountDeletionAction | action | session.user.organizationId (ciego al rol, ignora impersonation) | src/lib/actions/profile.ts:28-32,80-83,107-111,151-153 | NO(datos) | PASA | NO(datos) | NO(datos) |
| updatePasswordAction | action | session.user.id + Zod + bcrypt + sessionVersion++ | src/lib/actions/profile.ts:191-192,230 | PASA | PASA | PASA | PASA |
| markNotificationReadAction / markAllNotificationsReadAction / getMyNotificationsAction | action | session.user.organizationId + Zod + where org-scoped | src/lib/actions/notifications.ts:20-30,47-50,74-77 | NO(datos) | PASA | NO(datos) | NO(datos) |
| markAnnouncementsSeenAction | action | session.user.organizationId + userId; where espeja la visibilidad | src/lib/actions/announcements.ts:18-24,29-37 | NO(datos) | PASA | NO(datos) | NO(datos) |
| generateMyReferralCodeAction | action | session.user.organizationId | src/lib/actions/referrals.ts:13-17 | NO(datos) | PASA | NO(datos) | NO(datos) |
| requestUpsellAction | action | session.user.organizationId + userId + Zod + dedup | src/lib/actions/upsell.ts:14-25 | NO(datos) | PASA | NO(datos) | NO(datos) |
| listAvailableLocations / setActiveLocation (GBP) | action | session.user.organizationId + Zod | src/lib/actions/gbp-connection.ts:18-20,39-46 | NO(datos) | PASA | NO(datos) | NO(datos) |
| sendClientMessageAction | action | session.user.organizationId + userId + Zod | src/lib/actions/messages.ts:118-124 | NO(datos) | PASA | NO(datos) | NO(datos) |
| sendMessageAction / markAdminMessagesAsReadAction / markMessagesAsReadAction | action | role === SUPER_ADMIN + Zod | src/lib/actions/messages.ts:21,78,108-112 | PASA | NO | NO | NO |
| approveTaskAction / rejectTaskAction | action | auth + session.user.organizationId + Zod + task.project.organizationId === org + estado PENDING | src/actions/dashboard-actions.ts:14-18,35-41,102-106,123-129 | NO(datos) | PASA | NO(datos) | NO(datos) |
| markNotificationAsRead | action | auth + session.user.organizationId + comparación de org | src/actions/dashboard-actions.ts:189-205 | NO(datos) | PASA | NO(datos) | NO(datos) |
| requestTaskApproval / approveTask / rejectTask (HUÉRFANAS) | action | auth + session.user.organizationId + org de la task; sin Zod | src/actions/task-approvals.ts:7-18,37-50,85-102 | NO(datos) | PASA si se importa (S2b-06) | NO(datos) | NO(datos) |
| upsertBusinessMetrics (HUÉRFANA) | action | role === SUPER_ADMIN | src/actions/metrics-actions.ts:18-21 | PASA si se importa | NO | NO | NO |
| saveOnboardingProfile | action | resolveOrgId() + Zod | src/actions/onboarding-actions.ts:42-55 | IMP | PASA | NO | NO |
| completeOnboardingAction (src/actions, sin caller) | action | resolveOrgId(); guarda credenciales en claro | src/actions/onboarding-actions.ts:81-84,110-132 | IMP | PASA (S2b-05) | NO | NO |
| completeOnboardingAction (bienvenida/_actions) | action | auth() + resolveOrgId() + Zod | bienvenida/_actions/complete-onboarding.ts:18-31 | IMP | PASA | NO | NO |
| createTicketAction | action | auth + resolveOrgId + Zod | src/lib/tickets/actions.ts:49-61 | IMP | PASA | NO | NO |
| replyToTicketAction | action | auth + rama por rol; cliente pasa por assertTicketBelongsToOrg | src/lib/tickets/actions.ts:117-137 | PASA (como admin) | PASA (su ticket) | NO | NO |
| updateTicketStatusAction | action | requireSuperAdmin | src/lib/tickets/actions.ts:179+ | PASA | NO | NO | NO |
| createTaskForClientAction / createClientAssetAction | action | role === SUPER_ADMIN (+ assertProjectBelongsToOrg) | src/actions/agency-actions.ts:19-35,98-101 | PASA | NO | NO | NO |
| clients / projects / services / settings / invitations / leads (admin) | action | requireSuperAdmin o role === SUPER_ADMIN | clients.ts:81,155 · projects.ts:26,109,159,178,214 · services.ts:28,60,81 · settings.ts:51,104,153,241,277,313 · invitations.ts:48 · leads.ts:14-17,23,49 | PASA | NO | NO | NO |

LO QUE QUEDÓ SIN MIRAR EN ESTE RECORTE. (1) No entré a las páginas de /dashboard/plan, /dashboard/services, /dashboard/referidos, /dashboard/project ni /dashboard/resultados/* archivo por archivo: verifiqué por censo que todas resuelven sesión (las 3 excepciones son redirects puros) y que las únicas con parámetro dinámico —chatbot/leads/[id], soporte/[ticketId], email-marketing/campaigns/[id]/send— filtran por org en la misma query o delegan en una action ya auditada. (2) No auditué el contenido de los componentes cliente (solo la frontera server). (3) El motor 360dialog está en el árbol pero fuera de este recorte: solo lo toqué para constatar que es el único otro consumidor de secret-box (relevante para S2b-05). (4) La superficie /admin y /setter quedó fuera salvo donde comparte write-path con el cliente (tickets, tasks, messages). (5) No corrí npm run build, npx tsc, la suite de tests ni check:invariants — todo lo que digo sobre cobertura de tests sale de grep, no de una corrida.

### 5.3 — Setter y censo del patrón P0-6 (lente S2c)

METODO. Read-only sobre el worktree chore/auditoria-seguridad @49fec9b. Cero ediciones en src/. Cero ejecucion de servidor, migraciones o DB. Instrumentos: lectura directa, Grep, y tres scripts de censo escritos en el scratchpad (no en el repo) que parsean los archivos y extraen, por funcion exportada, la firma, el cuerpo hasta el siguiente export, los guards presentes y las llamadas Prisma. Todo resultado del script fue verificado a mano en los casos que decidian un hallazgo (los clasificados NONE y los sin-scope se leyeron completos, uno por uno).

COBERTURA ALCANZADA. 90 archivos con la directiva 'use server' en linea 1 → 200 funciones exportadas censadas (el listado de 111 archivos que devuelve un grep ingenuo de "use server" incluye 21 que solo lo NOMBRAN en un comentario; los descarte comparando head -3). 37 route.ts bajo src/app/api. Ademas: el arbol completo de src/app/(protected)/setter/**, src/lib/leados/** (44 archivos), src/app/(protected)/admin/leados/**, api/cron/os-follow-up, src/auth.ts, src/auth.config.ts, src/proxy.ts, src/lib/auth-guards.ts, src/lib/preview.ts, src/lib/isolation/, y el motor (src/modules/motor/** + api/motor/webhook/[channelToken]) con alcance "motor-en-main".

RESULTADO CENTRAL DEL TRABAJO B. Entre las 200 server actions y las 37 rutas API, la unica instancia VERDADERA del patron P0-6 —recibe un id del cliente y opera sin validar pertenencia— es runPreflightChecks, que ya esta en el ledger (SEC-02). No encontre ninguna instancia nueva. El valor de esta corrida no esta ahi sino en tres cosas que el censo si destapo: el dialecto de organizationId ciego al rol (S4-01), la forma habilitante del patron viva en la capa de escritura de LeadOS (S4-02), y el escape hatch cross-org sin control efectivo (S4-03).

═══════════════════════════════════════════════
TABLA DE ROL DEL SETTER (Trabajo A)
═══════════════════════════════════════════════

¿Un SETTER lee o muta leads que no le fueron asignados? NO por ningun camino que exista hoy.
El helper de ownership es getOwnedLead(leadId, userId) en src/lib/leados/ownership.ts:24-31, que compone `{ id: leadId, assignedToId: userId }` en la MISMA query via ownedLeadWhere (src/lib/leados/isolation.ts:21-26). Las 24 actions del setter llaman requireSetter(); las 19 que reciben un leadId pasan por ese chokepoint antes de operar. Verificacion linea por linea:

| Action | archivo:linea | auth | ownership antes de operar |
|---|---|---|---|
| guardarFicha | dossier.actions.ts:81 | requireSetter :86 | saveOwnedFicha (dossier.ts:271 → getOwnedDossier) |
| registrarEvaluacion | dossier.actions.ts:109 | :114 | getOwnedLead :124 + getOwnedDossier :127 |
| guardarBrief | dossier.actions.ts:180 | :185 | getOwnedDossier :195 + saveOwnedBrief :199 |
| iniciarConstruccion | dossier.actions.ts:217 | :221 | getOwnedDossier :226 |
| reabrirConstruccion | dossier.actions.ts:246 | :250 | getOwnedDossier :255 |
| guardarProgreso | dossier.actions.ts:278 | :283 | saveOwnedProgreso :291 |
| guardarDraftUrl | dossier.actions.ts:305 | :310 | saveOwnedDraftUrl :320 |
| guardarSelfCheck | dossier.actions.ts:336 | :341 | saveOwnedSelfCheck :350 |
| enviarARevision | dossier.actions.ts:367 | :371 | getOwnedDossier :376 |
| escalarConstruccion | dossier.actions.ts:408 | :413 | marcarEscaladoOwned :426 |
| registrarOpener | outreach.actions.ts:85 | :90 | getOwnedLead :100 + getOwnedDossier :106 + listOwnedLeadActivities :114 |
| registrarResultado | outreach.actions.ts:144 | :149 | getOwnedLead :159 + listOwnedLeadActivities :162 |
| enviarDemoAprobada | outreach.actions.ts:205 | :209 | getOwnedLead :214 + getOwnedDossier :217 + marcarDemoEnviadaOwned :232 |
| ofrecerHorarios | agenda.actions.ts:112 | :116 | gateAgenda :86 (getOwnedLead) + :98 (getOwnedDossier) |
| confirmarReunion | agenda.actions.ts:148 | :153 | gateAgenda + marcarAgendandoOwned/guardarAgendaOwned (agenda.ts:139,204) |
| fijarLead / pausarLead / reanudarLead / guardarNota | cartera.actions.ts:50,74,101,117 | resolverLeadPropio :41 | resolverLeadPropio :44 (getOwnedLead) + upsertSetterMeta keyed (leadId,setterId) |
| anclarFoco | foco.actions.ts:35 | :37 | getOwnedLead :41 antes de escribir la cookie |
| soltarFoco | foco.actions.ts:53 | :55 | n/a (borra cookie) |
| marcarNovedadesVistas | novedades.actions.ts:15 | :19 | updateMany por ownSetterNoticeWhere(userId) (novedades.ts:272) |
| cargarProspecto | prospecto.actions.ts:21 | :25 | ownedLeadCreateData fuerza assignedToId de sesion |
| importarProspectos | prospecto-bulk.actions.ts:36 | :40 | construirAltasLote → ownedLeadCreateData por fila |

Lecturas: las paginas tambien guardan. setter/page.tsx:28 requireSetter + listOwnedLeads (ownedListWhere). nuevo/page.tsx:18+22-23 requireSetter + ownedListWhere. nuevo/importar/page.tsx:16 requireSetter. El manual entra por cargarManualDelLead (manual/_data.ts:123-133): requireSetter → getOwnedLead → null → notFound() en [paso]/page.tsx:54. La unica query Prisma directa de todo el arbol del setter es setter/nuevo/page.tsx:22, y lleva ownedListWhere. Ninguna lectura del setter escapa al filtro. Nota heredada: notFound() en esa ruta devuelve 200 por streaming — el aislamiento se afirma por CONTENIDO, no por status.

¿Un SETTER alcanza superficies de admin o de dashboard? NO por las rutas que revise, y el proxy no es lo que lo impide.
- /api/*: las 8 rutas bajo api/admin chequean rol explicitamente en su propio handler (alerts/trigger-detector:6-9, reports/send-now:6-9, users/[userId]/resend-credentials:17-20, chatbot/events:8-11, chatbot/insights/generate:7-10, chatbot/demo-chat/[slug] y chatbot/test-prompt via requireSuperAdmin, clients/[organizationId]/send-executive-report via requireSuperAdmin). Las de cliente cuelgan de resolveOrgId (que devuelve null para SETTER) o de getClientChatbotSession (que resuelve por OrgMember, inexistente para un setter). Las 8 de cron van por CRON_SECRET.
- Server actions de admin: las 60 que censé llaman requireSuperAdmin o comparan role==='SUPER_ADMIN'. requireSetter y requireSuperAdmin son mutuamente excluyentes (src/lib/auth-guards.ts:6 y :16), asi que un token de SETTER rebota en ambas.
- La revision de Franco (admin/leados/_actions/revision.actions.ts): aprobarRevision :71 y rechazarRevision :98 exigen requireSuperAdmin() como PRIMERA sentencia, antes de parsear el input. Es el unico lugar del repo que expone EN_REVISION→APROBADA/RECHAZADA. Ninguna superficie del setter la alcanza.
- La grieta real no es de rol sino de dialecto: las superficies de cliente que NO usan resolveOrgId (S4-01) aceptarian a un setter que arrastre una OrgMember.

¿Un ORG_MEMBER o CLIENT alcanza superficies del setter? NO. requireSetter (auth-guards.ts:13-21) exige role==='SETTER' estricto; el layout de /setter lo repite (setter/layout.tsx:32-33). Dato colateral verificado: el rol CLIENT no se usa en ninguna parte de src/ fuera de la union de tipos (auth.config.ts:4) — un usuario con ese rol quedaria fuera de /dashboard por el proxy (:154) y sin org por resolveOrgId (:19). Es rol muerto, y esa combinacion (sin uso + presente en el enum) es parte de por que S4-01 pasa desapercibido.

═══════════════════════════════════════════════
CENSO COMPLETO P0-6 — 200 server actions
═══════════════════════════════════════════════
Columnas: archivo:linea | funcion | id que recibe | rol exigido | scoping en la operacion.
Rutas abreviadas: (p)/ = src/app/(protected)/, resto relativo a src/.
Leyenda de rol: SUPER_ADMIN = requireSuperAdmin o role==='SUPER_ADMIN' · SETTER = requireSetter · CLIENT-ORG = getClientChatbotSession · ORG-SESSION = resolveOrgId o session.user.organizationId · ANY-SESSION = solo auth() · NONE = ningun guard en el cuerpo propio.
Leyenda de scoping: "scope" = la operacion lleva discriminante (organizationId / assignedToId / setterId / userId, o helper de pertenencia) · "-" = la operacion no lleva discriminante (aceptable cuando el rol exigido es SUPER_ADMIN, que opera cross-org por diseño; se marca igual para que la cobertura real sea visible).
CORRECCIONES AL PARSER (verificadas a mano): las 4 de cartera.actions.ts figuran NONE porque su requireSetter vive en el helper resolverLeadPropio:41 — SI guardan. client.actions.ts:8/:12, messages.ts:108 y saveClientSettings.ts:34 figuran NONE porque son wrappers de una linea que delegan en una funcion guardada (impersonation.ts:11/:50, markAdminMessagesAsReadAction:74, updateBotAppearance:55). El unico NONE real con acceso a datos es preflightChecks.ts:13.

actions/admin/onboarding-tasks.ts:8 | updateTaskStatus | taskId | SUPER_ADMIN | scope
actions/admin/onboarding-tasks.ts:50 | updateTaskNotes | taskId | SUPER_ADMIN | scope
actions/agency-actions.ts:14 | createTaskForClientAction | projectId,organizationId | SUPER_ADMIN | scope (assertProjectBelongsToOrg :29)
actions/agency-actions.ts:94 | createClientAssetAction | organizationId | SUPER_ADMIN | scope
actions/auth-actions.ts:5 | signOutAction | - | NONE | - (solo signOut)
actions/dashboard-actions.ts:12 | approveTaskAction | taskId | ORG-SESSION(ciego) | scope :35
actions/dashboard-actions.ts:97 | rejectTaskAction | taskId | ORG-SESSION(ciego) | scope :123
actions/dashboard-actions.ts:188 | markNotificationAsRead | notificationId | ORG-SESSION(ciego) | scope :203
actions/metrics-actions.ts:9 | upsertBusinessMetrics | organizationId | SUPER_ADMIN | scope
actions/onboarding-actions.ts:38 | saveOnboardingProfile | formData | ORG-SESSION(resolveOrgId) | scope
actions/onboarding-actions.ts:79 | completeOnboardingAction | - | ORG-SESSION(resolveOrgId) | scope
actions/task-approvals.ts:7 | requestTaskApproval | taskId | ORG-SESSION(ciego) | scope :16
actions/task-approvals.ts:37 | approveTask | taskId | ORG-SESSION(ciego) | scope :48
actions/task-approvals.ts:85 | rejectTask | taskId | ORG-SESSION(ciego) | scope :100
(p)/admin/announcements/_actions/announcements.actions.ts:14 | createAnnouncementAction | input | SUPER_ADMIN | scope
(p)/admin/announcements/_actions/announcements.actions.ts:64 | deleteAnnouncementAction | id | SUPER_ADMIN | -
(p)/admin/chatbots/[botId]/actions.ts:25 | toggleBotActiveAction | botId | SUPER_ADMIN | scope
(p)/admin/chatbots/[botId]/actions.ts:110 | deleteBotAction | botId | SUPER_ADMIN | scope
(p)/admin/chatbots/[botId]/transcript-action.ts:23 | getConversationTranscriptAction | conversationId | SUPER_ADMIN | scope
(p)/admin/chatbots/_actions/convert-chatbot-lead.actions.ts:17 | convertChatbotLeadToOsLead | chatbotLeadId | SUPER_ADMIN | -
(p)/admin/chatbots/bulk-actions.ts:18 | bulkPauseBotsAction | botIds | SUPER_ADMIN | scope
(p)/admin/chatbots/bulk-actions.ts:64 | bulkActivateBotsAction | botIds | SUPER_ADMIN | scope
(p)/admin/chatbots/bulk-actions.ts:110 | exportLeadsBulkAction | botIds | SUPER_ADMIN | scope
(p)/admin/chatbots/bulk-actions.ts:163 | bulkDeleteBotsAction | botIds | SUPER_ADMIN | scope
(p)/admin/chatbots/new/actions.ts:39 | createBotAction | input | SUPER_ADMIN | scope
(p)/admin/clients/_actions/client.actions.ts:8 | startImpersonationAction | organizationId | wrapper→SUPER_ADMIN | scope
(p)/admin/clients/_actions/client.actions.ts:12 | stopImpersonationAction | - | wrapper→ANY-SESSION | -
(p)/admin/clients/_actions/plan.actions.ts:84 | assignPlanToOrg | input(orgId,planId) | SUPER_ADMIN | scope
(p)/admin/clients/_actions/plan.actions.ts:244 | setBillingOverride | input | SUPER_ADMIN | scope
(p)/admin/clients/_actions/plan.actions.ts:320 | clearBillingOverride | input | SUPER_ADMIN | scope
(p)/admin/leados/_actions/revision.actions.ts:67 | aprobarRevision | inputRaw(leadId) | SUPER_ADMIN :71 | - (admin cross-org por diseño)
(p)/admin/leados/_actions/revision.actions.ts:94 | rechazarRevision | inputRaw(leadId) | SUPER_ADMIN :98 | -
(p)/admin/leads/_actions/activity.actions.ts:9 | createActivity | input(leadId) | SUPER_ADMIN | scope
(p)/admin/leads/_actions/demo.actions.ts:11 | createDemo | input(leadId) | SUPER_ADMIN | -
(p)/admin/leads/_actions/demo.actions.ts:31 | markDemoViewed | input(demoId) | SUPER_ADMIN | -
(p)/admin/leads/_actions/inbound.actions.ts:39 | listInboundLeads | rangeInput | SUPER_ADMIN | scope
(p)/admin/leads/_actions/inbound.actions.ts:119 | convertInboundToLead | contactSubmissionId | SUPER_ADMIN | -
(p)/admin/leads/_actions/lead.actions.ts:52 | createLead | input | SUPER_ADMIN :56 | -
(p)/admin/leads/_actions/lead.actions.ts:72 | updateLead | input(leadId) | SUPER_ADMIN :76 | -
(p)/admin/leads/_actions/lead.actions.ts:95 | updateLeadStatus | input(leadId) | SUPER_ADMIN :99 | scope
(p)/admin/leads/_actions/lead.actions.ts:128 | assignLeadSetter | input(leadId,setterId) | SUPER_ADMIN :132 | scope (valida role==='SETTER' del destino :152-156)
(p)/admin/leads/_actions/lead.actions.ts:230 | deleteLead | leadId | SUPER_ADMIN :234 | -
(p)/admin/leads/_actions/lead.actions.ts:249 | listLeads | - | SUPER_ADMIN :253 | -
(p)/admin/leads/_actions/lead.actions.ts:275 | getLeadById | id | SUPER_ADMIN :281 | -
(p)/admin/leads/_actions/module-demand.actions.ts:23 | listModuleDemand | - | SUPER_ADMIN | scope
(p)/admin/leads/_actions/reunion.actions.ts:43 | marcarReunionRealizada | input(leadId) | SUPER_ADMIN | -
(p)/admin/leads/_actions/reunion.actions.ts:64 | registrarResultadoReunion | input(leadId) | SUPER_ADMIN | -
(p)/admin/messages/_actions/message.actions.ts:25 | listConversations | - | SUPER_ADMIN | scope
(p)/admin/messages/_actions/message.actions.ts:126 | getConversation | organizationId | SUPER_ADMIN | scope
(p)/admin/messages/_actions/message.actions.ts:168 | sendMessage | organizationId | SUPER_ADMIN | scope
(p)/admin/messages/_actions/message.actions.ts:206 | markAsRead | organizationId | SUPER_ADMIN | scope
(p)/admin/projects/_actions/maintenance.actions.ts:31 | createMaintenancePayment | input(projectId) | SUPER_ADMIN | scope
(p)/admin/projects/_actions/maintenance.actions.ts:60 | markMaintenancePaid | paymentId | SUPER_ADMIN | scope
(p)/admin/projects/_actions/maintenance.actions.ts:90 | generatePendingMaintenance | projectId | SUPER_ADMIN | scope
(p)/admin/projects/_actions/milestone.actions.ts:19 | markMilestonePaid | milestoneId | SUPER_ADMIN | scope
(p)/admin/projects/_actions/milestone.actions.ts:49 | unmarkMilestonePaid | milestoneId | SUPER_ADMIN | scope
(p)/admin/projects/_actions/project.actions.ts:593 | createProject | input | SUPER_ADMIN | scope
(p)/admin/projects/_actions/project.actions.ts:643 | updateProject | input(projectId) | SUPER_ADMIN | scope
(p)/admin/projects/_actions/project.actions.ts:722 | updateProjectStatus | input(projectId) | SUPER_ADMIN | scope
(p)/admin/projects/_actions/project.actions.ts:782 | deleteProject | input(projectId) | SUPER_ADMIN | scope
(p)/admin/projects/_actions/project.actions.ts:833 | convertLeadToProject | input(leadId) | SUPER_ADMIN | scope
(p)/admin/projects/_actions/project.actions.ts:926 | listProjects | - | SUPER_ADMIN | -
(p)/admin/projects/_actions/project.actions.ts:1020 | getProjectById | id | SUPER_ADMIN | -
(p)/admin/referrals/_actions/referrals.admin.actions.ts:13 | markReferralConvertedAction | id | SUPER_ADMIN | -
(p)/admin/referrals/_actions/referrals.admin.actions.ts:36 | markReferralRewardedAction | id | SUPER_ADMIN | -
(p)/admin/settings/_actions/settings.actions.ts:58 | getSettings | - | SUPER_ADMIN | -
(p)/admin/settings/_actions/settings.actions.ts:127 | updateSettings | - | SUPER_ADMIN | -
(p)/admin/settings/_actions/settings.actions.ts:175 | updateModulePricing | moduleId | SUPER_ADMIN | -
(p)/admin/settings/_actions/settings.actions.ts:207 | listTeamMembers | - | SUPER_ADMIN | -
(p)/admin/team/_actions/task.actions.ts:155 | createTask | input(projectId) | SUPER_ADMIN | scope
(p)/admin/team/_actions/task.actions.ts:197 | updateTask | input(taskId) | SUPER_ADMIN | scope
(p)/admin/team/_actions/task.actions.ts:231 | deleteTask | taskId | SUPER_ADMIN | scope
(p)/admin/team/_actions/task.actions.ts:264 | reorderTasks | input | SUPER_ADMIN | scope
(p)/admin/team/_actions/task.actions.ts:321 | listTasksByProject | projectId | SUPER_ADMIN | scope
(p)/admin/team/_actions/task.actions.ts:377 | listTasksByUser | userId | SUPER_ADMIN | scope
(p)/admin/team/_actions/time-entry.actions.ts:136 | createTimeEntry | input(taskId) | SUPER_ADMIN | scope
(p)/admin/team/_actions/time-entry.actions.ts:195 | updateTimeEntry | input(entryId) | SUPER_ADMIN | -
(p)/admin/team/_actions/time-entry.actions.ts:243 | deleteTimeEntry | entryId | SUPER_ADMIN | -
(p)/admin/team/_actions/time-entry.actions.ts:270 | listTimeEntriesByProject | projectId | SUPER_ADMIN | -
(p)/admin/team/_actions/time-entry.actions.ts:310 | listTimeEntriesByUser | userId | SUPER_ADMIN | scope
(p)/admin/tickets/_actions/ticket.actions.ts:28 | listTickets | - | SUPER_ADMIN | scope
(p)/admin/tickets/_actions/ticket.actions.ts:100 | getTicketById | id | SUPER_ADMIN | scope
(p)/dashboard/_actions/business-profile.actions.ts:22 | saveAverageTicket | input | ORG-SESSION(resolveOrgId :25) | scope
(p)/dashboard/_actions/executive-report-prefs.actions.ts:20 | saveExecutiveReportPrefs | input | ORG-SESSION(resolveOrgId :23) | scope
(p)/dashboard/_actions/regenerate-brief.ts:9 | regenerateBriefAction | - | ORG-SESSION(resolveOrgId :16) | scope
(p)/dashboard/chatbot/conversations/transcript-action.ts:31 | getClientConversationTranscriptAction | conversationId | CLIENT-ORG :34 | scope (getConversationMessagesForOrg con org de sesion :44-48)
(p)/dashboard/messages/_actions/mark-read.ts:11 | markClientMessagesRead | - | ORG-SESSION(resolveOrgId :12) | scope
(p)/dashboard/modules/email-marketing/_actions.ts:71 | importContactsAction | formData | ORG-SESSION(getOrgWithBrevo→resolveOrgId :18) | scope
(p)/dashboard/modules/email-marketing/_actions.ts:128 | createCampaignAction | formData | ORG-SESSION | scope
(p)/dashboard/modules/email-marketing/_actions.ts:174 | sendCampaignAction | campaignId | ORG-SESSION | scope (findFirst {id, organizationId} :177-179)
(p)/setter/_actions/agenda.actions.ts:112 | ofrecerHorarios | leadIdRaw | SETTER :116 | scope (gateAgenda)
(p)/setter/_actions/agenda.actions.ts:148 | confirmarReunion | leadIdRaw,inputRaw | SETTER :153 | scope (gateAgenda + *Owned)
(p)/setter/_actions/cartera.actions.ts:50 | fijarLead | leadIdRaw,pinnedRaw | SETTER (:41 helper) | scope
(p)/setter/_actions/cartera.actions.ts:74 | pausarLead | leadIdRaw,hastaRaw | SETTER (:41) | scope
(p)/setter/_actions/cartera.actions.ts:101 | reanudarLead | leadIdRaw | SETTER (:41) | scope
(p)/setter/_actions/cartera.actions.ts:117 | guardarNota | leadIdRaw,notaRaw | SETTER (:41) | scope
(p)/setter/_actions/dossier.actions.ts:81 | guardarFicha | leadIdRaw,inputRaw | SETTER :86 | scope
(p)/setter/_actions/dossier.actions.ts:109 | registrarEvaluacion | leadIdRaw,inputRaw | SETTER :114 | scope
(p)/setter/_actions/dossier.actions.ts:180 | guardarBrief | leadIdRaw,inputRaw | SETTER :185 | scope
(p)/setter/_actions/dossier.actions.ts:217 | iniciarConstruccion | leadIdRaw | SETTER :221 | scope
(p)/setter/_actions/dossier.actions.ts:246 | reabrirConstruccion | leadIdRaw | SETTER :250 | scope
(p)/setter/_actions/dossier.actions.ts:278 | guardarProgreso | leadIdRaw,inputRaw | SETTER :283 | scope
(p)/setter/_actions/dossier.actions.ts:305 | guardarDraftUrl | leadIdRaw,inputRaw | SETTER :310 | scope
(p)/setter/_actions/dossier.actions.ts:336 | guardarSelfCheck | leadIdRaw,inputRaw | SETTER :341 | scope
(p)/setter/_actions/dossier.actions.ts:367 | enviarARevision | leadIdRaw | SETTER :371 | scope
(p)/setter/_actions/dossier.actions.ts:408 | escalarConstruccion | leadIdRaw,inputRaw | SETTER :413 | scope
(p)/setter/_actions/foco.actions.ts:35 | anclarFoco | leadIdRaw | SETTER :37 | scope
(p)/setter/_actions/foco.actions.ts:53 | soltarFoco | - | SETTER :55 | -
(p)/setter/_actions/novedades.actions.ts:15 | marcarNovedadesVistasAction | - | SETTER :19 | scope
(p)/setter/_actions/outreach.actions.ts:85 | registrarOpener | leadIdRaw,inputRaw | SETTER :90 | scope
(p)/setter/_actions/outreach.actions.ts:144 | registrarResultado | leadIdRaw,inputRaw | SETTER :149 | scope
(p)/setter/_actions/outreach.actions.ts:205 | enviarDemoAprobada | leadIdRaw | SETTER :209 | scope
(p)/setter/_actions/prospecto-bulk.actions.ts:36 | importarProspectos | formData(csv) | SETTER :40 | scope
(p)/setter/_actions/prospecto.actions.ts:21 | cargarProspecto | input | SETTER :25 | scope
app/accept-invite/actions.ts:15 | acceptInviteAction | formData(token) | NONE (publico) | scope (passwordResetToken.findUnique + expiracion/usedAt)
app/bienvenida/_actions/complete-onboarding.ts:17 | completeOnboardingAction | input | ORG-SESSION | scope
app/cambiar-password/actions.ts:21 | cambiarPasswordAction | input | ANY-SESSION | scope (userId de sesion)
app/forgot-password/actions.ts:24 | forgotPasswordAction | formData(email) | NONE (publico) | scope
app/login/actions.ts:61 | loginAction | formData | NONE (publico) | -
app/login/actions.ts:135 | magicLinkAction | formData | NONE (publico) | -
app/login/actions.ts:162 | googleSignInAction | - | NONE (publico) | -
app/reset-password/actions.ts:14 | resetPasswordAction | formData(token) | NONE (publico) | scope (token)
components/dashboard/modules/motor-resenas/_actions.ts:11 | generateDraft | organizationId | ORG-SESSION | scope (resolveScopedOrgId :20 — el orgId del cliente debe coincidir con el de sesion)
components/dashboard/modules/motor-resenas/_actions.ts:48 | replyAction | organizationId | ORG-SESSION | scope (resolveScopedOrgId :55)
lib/actions/announcements.ts:17 | markAnnouncementsSeenAction | - | ORG-SESSION(ciego :20) | scope
lib/actions/clients.ts:72 | createClientAction | formData | SUPER_ADMIN :81 | scope
lib/actions/clients.ts:149 | updateClientAction | formData(orgId) | SUPER_ADMIN | scope
lib/actions/contact.ts:16 | contactFormAction | formData | NONE (publico, form de contacto) | -
lib/actions/contact.ts:100 | submitContactForm | formData | NONE (wrapper del anterior) | -
lib/actions/contact.ts:110 | markLeadAsRead | id | SUPER_ADMIN | -
lib/actions/gbp-connection.ts:17 | listAvailableLocations | - | ORG-SESSION(ciego :19) | scope
lib/actions/gbp-connection.ts:36 | setActiveLocation | locationId | ORG-SESSION(ciego :40) | scope
lib/actions/impersonation.ts:11 | startImpersonationAction | orgId | SUPER_ADMIN :13 | scope
lib/actions/impersonation.ts:50 | stopImpersonationAction | - | ANY-SESSION | scope
lib/actions/invitations.ts:43 | inviteClientAction | formData | SUPER_ADMIN :48 | scope
lib/actions/leads.ts:19 | updateLeadStatusAction | input.id | SUPER_ADMIN (ensureAdmin :23) | -
lib/actions/leads.ts:45 | updateLeadNotesAction | input.id | SUPER_ADMIN (ensureAdmin :49) | -
lib/actions/messages.ts:16 | sendMessageAction | formData(orgId) | SUPER_ADMIN :21 | scope
lib/actions/messages.ts:74 | markAdminMessagesAsReadAction | organizationId | SUPER_ADMIN :78 | scope
lib/actions/messages.ts:108 | markMessagesAsReadAction | organizationId | wrapper→SUPER_ADMIN | scope
lib/actions/messages.ts:114 | sendClientMessageAction | formData | ORG-SESSION(ciego :119) | scope
lib/actions/notifications.ts:19 | markNotificationReadAction | id | ORG-SESSION(ciego :21) | scope :34
lib/actions/notifications.ts:46 | markAllNotificationsReadAction | - | ORG-SESSION(ciego :48) | scope
lib/actions/notifications.ts:73 | getMyNotificationsAction | - | ORG-SESSION(ciego :75) | scope
lib/actions/profile.ts:24 | updateProfileAction | formData | ORG-SESSION(ciego :29) | scope
lib/actions/profile.ts:76 | updateContactAction | formData | ORG-SESSION(ciego :81) | scope
lib/actions/profile.ts:103 | updateNotificationPrefsAction | formData | ORG-SESSION(ciego :108) | scope
lib/actions/profile.ts:150 | requestAccountDeletionAction | - | ORG-SESSION(ciego :152) | scope
lib/actions/profile.ts:187 | updatePasswordAction | formData | ANY-SESSION | scope (userId de sesion)
lib/actions/projects.ts:35 | createProjectAction | formData(orgId) | SUPER_ADMIN :39 | scope
lib/actions/projects.ts:70 | updateProjectAction | formData(projectId) | SUPER_ADMIN :74 | scope
lib/actions/projects.ts:108 | deleteProjectAction | formData(projectId) | SUPER_ADMIN :109 | -
lib/actions/projects.ts:122 | createTaskAction | formData(projectId) | SUPER_ADMIN :126 | -
lib/actions/projects.ts:158 | updateTaskStatusAction | formData(taskId) | SUPER_ADMIN :159 | -
lib/actions/projects.ts:177 | sendTaskForApprovalAction | formData(taskId) | SUPER_ADMIN :178 | scope
lib/actions/projects.ts:213 | deleteTaskAction | formData(taskId) | SUPER_ADMIN :214 | -
lib/actions/referrals.ts:12 | generateMyReferralCodeAction | - | ORG-SESSION(ciego :14) | scope
lib/actions/services.ts:21 | createServiceAction | formData(orgId) | SUPER_ADMIN | scope
lib/actions/services.ts:58 | updateServiceStatusAction | formData(serviceId) | SUPER_ADMIN | scope
lib/actions/services.ts:78 | deleteServiceAction | formData(serviceId) | SUPER_ADMIN | scope
lib/actions/settings.ts:39 | saveAgencySettingsAction | input | SUPER_ADMIN | - (singleton de agencia)
lib/actions/settings.ts:97 | updateModulePricingAction | input(moduleId) | SUPER_ADMIN | -
lib/actions/settings.ts:148 | inviteTeamMemberAction | input(email) | SUPER_ADMIN :152 | scope
lib/actions/settings.ts:239 | testN8nConnectionAction | - | SUPER_ADMIN | -
lib/actions/settings.ts:275 | verifyGooglePermissionsAction | - | SUPER_ADMIN | -
lib/actions/settings.ts:309 | testWebhookAction | - | SUPER_ADMIN | -
lib/actions/upsell.ts:10 | requestUpsellAction | moduleSlug | ORG-SESSION(ciego :16) | scope
lib/audit-log-queries.ts:16 | listAuditLog | filtros | SUPER_ADMIN :21 | scope
lib/audit-log-queries.ts:53 | getAuditLogStats | - | SUPER_ADMIN :54 | -
lib/bulk-actions.ts:8 | bulkPauseBots | orgIds | SUPER_ADMIN :9 | scope
lib/bulk-actions.ts:46 | bulkExportLeads | orgIds | SUPER_ADMIN :47 | scope
lib/tickets/actions.ts:38 | createTicketAction | - | ORG-SESSION(resolveOrgId :50) | scope
lib/tickets/actions.ts:110 | replyToTicketAction | ticketId | SUPER_ADMIN o ORG-SESSION | scope (assertTicketBelongsToOrg :130 en el camino cliente)
lib/tickets/actions.ts:179 | updateTicketStatusAction | ticketId | SUPER_ADMIN :187 | -
lib/tickets/actions.ts:202 | resolveTicketClientAction | ticketId | ORG-SESSION(resolveOrgId :206) | scope (update where {id, organizationId} :212)
modules/chatbot/server/admin/archiveClient.ts:16 | archiveClient | input(orgId) | SUPER_ADMIN :17 | scope
modules/chatbot/server/admin/archiveClient.ts:54 | unarchiveClient | input(orgId) | SUPER_ADMIN :55 | scope
modules/chatbot/server/admin/createClientOnly.ts:47 | createClientOnly | input | SUPER_ADMIN :48 | scope
modules/chatbot/server/admin/createClientWithBot.ts:95 | createClientWithBot | input | SUPER_ADMIN :96 | scope
modules/chatbot/server/admin/hardDeleteClient.ts:107 | getClientDeletionSummary | input(orgId) | SUPER_ADMIN :110 | scope
modules/chatbot/server/admin/hardDeleteClient.ts:125 | hardDeleteClient | input(orgId) | SUPER_ADMIN :126 | scope
modules/chatbot/server/admin/integrations/retryCrmSync.ts:23 | retryCrmSync | input(orgId,leadId) | SUPER_ADMIN :24 | scope (forOrg :53)
modules/chatbot/server/admin/integrations/saveCrmIntegration.ts:29 | saveCrmIntegration | input(orgId) | SUPER_ADMIN :30 | scope (forOrg :80)
modules/chatbot/server/admin/integrations/testCrmConnection.ts:21 | testCrmConnection | input(orgId) | SUPER_ADMIN :22 | scope (forOrg :51)
modules/chatbot/server/admin/manageAlerts.ts:9 | listAlerts | filtros | SUPER_ADMIN :10 | -
modules/chatbot/server/admin/manageAlerts.ts:30 | acknowledgeAlert | alertId | SUPER_ADMIN :32 | scope
modules/chatbot/server/admin/manageAlerts.ts:75 | resolveAlert | alertId | SUPER_ADMIN :77 | scope
modules/chatbot/server/admin/preflightChecks.ts:13 | runPreflightChecks | botId | NONE | -  ← UNICA instancia verdadera de P0-6 (= SEC-02 del ledger)
modules/chatbot/server/admin/preflightChecks.ts:170 | canActivate | checks | NONE | - (funcion pura, sin DB)
modules/chatbot/server/admin/saveBotConfig.ts:77 | saveBotConfig | input(botId) | SUPER_ADMIN :78 | scope
modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts:68 | saveBotConfigByOrgSlug | orgSlug | SUPER_ADMIN :71 | scope
modules/chatbot/server/admin/saveClientSettings.ts:34 | saveClientSettings | input | wrapper→ORG-SESSION | scope (updateBotAppearance :61 resolveOrgId)
modules/chatbot/server/admin/saveKnowledgeBase.ts:23 | saveKnowledgeBase | input(botId) | SUPER_ADMIN :24 | scope (forOrg :44)
modules/chatbot/server/admin/saveKnowledgeBaseByOrgSlug.ts:21 | saveKnowledgeBaseByOrgSlug | orgSlug | SUPER_ADMIN :24 | scope
modules/chatbot/server/admin/sendTestNotification.ts:16 | sendTestNotification | input | SUPER_ADMIN :17 | scope
modules/chatbot/server/admin/updateClient.ts:28 | updateClient | input(orgId) | SUPER_ADMIN :29 | scope
modules/chatbot/server/admin/updateClientInternalNotes.ts:17 | updateClientInternalNotes | input(orgId) | SUPER_ADMIN :20 | scope
modules/chatbot/server/admin/updateLeadStatus.ts:17 | updateLeadStatus | input(leadId) | CLIENT-ORG :18 | scope (leadBelongsToOrg :32)
modules/chatbot/server/dashboard/updateBotAppearance.ts:55 | updateBotAppearance | input | ORG-SESSION(resolveOrgId :61) | scope (forOrg :75)
modules/chatbot/server/insights/manageInsight.ts:15 | actOnInsight | input(insightId) | CLIENT-ORG :16 | scope (:30 compara organizationId)

═══════════════════════════════════════════════
CENSO P0-6 — 37 rutas API
═══════════════════════════════════════════════
api/admin/alerts/trigger-detector | POST | - | role==='SUPER_ADMIN' :6-9 | n/a
api/admin/chatbot/demo-chat/[slug] | POST | slug | requireSuperAdmin | n/a
api/admin/chatbot/events | GET | slug,since | role==='SUPER_ADMIN' :8-11 | bot→organizationId :19-23
api/admin/chatbot/insights/generate | POST | botSlug | role==='SUPER_ADMIN' :7-10 | bot→organizationId :22-24
api/admin/chatbot/test-prompt | POST | - | requireSuperAdmin | n/a
api/admin/clients/[organizationId]/send-executive-report | POST | organizationId | requireSuperAdmin | scope
api/admin/reports/send-now | POST | - | role==='SUPER_ADMIN' :6-9 | n/a
api/admin/users/[userId]/resend-credentials | POST | userId | role==='SUPER_ADMIN' :17-20 + rate-limit :25-30 + Zod :43 | admin cross-org por diseño
api/auth/[...nextauth] | - | - | NextAuth | n/a
api/auth/google-business/callback | GET | code,state | auth() + org de sesion | scope
api/auth/google-business/start | GET | orgId | role==='SUPER_ADMIN' :6-9 | admin
api/auth/tiendanube/callback | GET | code,state | auth() + org de sesion | scope
api/auth/tiendanube/start | GET | - | auth() | scope
api/chatbot/[slug]/chat | POST | slug | PUBLICO — validateOrigin + checkRateLimit | organizationId derivado del slug
api/chatbot/[slug]/config | GET | slug | PUBLICO — validateOrigin | derivado del slug
api/chatbot/[slug]/health | GET | slug | PUBLICO sin origin-check (ya en ledger, lente S4) | derivado
api/chatbot/[slug]/smoke | POST | slug | PUBLICO (ya en ledger SEC-01) | derivado
api/cron/{alerts,cleanup-old-events,detect-bot-issues,generate-insights,os-follow-up,regenerate-briefs,send-executive-reports,send-weekly-reports} | GET | - | CRON_SECRET (os-follow-up :154-159) | n/a
api/dashboard/chatbot/leads/export | GET | filtros | getClientChatbotSession | listLeadsForDashboard(session.organization.id)
api/dashboard/leads/recent | GET | - | auth() + resolveOrgId | scope
api/dev/email-preview/executive-weekly | GET | - | sin guard (ruta de dev) | n/a — fuera de mi lente, adyacente a CLEAN-H-TESTROUTE
api/email/optout/[contactId] | GET | contactId + token | HMAC verificado ANTES de tocar la DB :77 | updateMany idempotente :91-94, cero leak de existencia
api/email/unsubscribe-executive | GET/POST | org + token | HMAC :62 | scope
api/motor/webhook/[channelToken] | POST | channelToken | Bearer por canal (auth.ts:47-61, fail-closed sin secret) + rate-limit por hash del token ANTES de la DB :30-38 | resolveChannelByToken :22-37 → forOrg(organizationId)
api/qa/login | POST | - | triple-guard (ya en ledger) | scope
api/reports/client-monthly | GET | - (sin parametro de org por diseño) | resolveOrgId :26 | scope
api/reports/monthly | GET | organizationId,month | auth() + comparacion contra la org de sesion :45-51 | scope, pero sobre el dialecto ciego (ver S4-01)
api/test-sentry | GET | - | PUBLICO (ya en ledger SEC-11/OBS-09) | n/a
api/track | POST | organizationId (solo admin) | auth() :12-14 | ya en ledger SEC-AUTH-05
api/version | GET | - | publico, sin datos | n/a

LO QUE QUEDO SIN MIRAR. (1) El contenido de los componentes client del setter (_components/*.tsx): los recorri para mapear que props reciben, no los audite como superficie — no ejecutan logica de autorizacion, la piden al server. (2) La superficie del widget publico y del LLM: es la lente S4/S5, la toque solo para clasificar las rutas en la tabla de arriba. (3) El interior del motor mas alla de auth/resolucion de canal (window.ts, sendMessage, identity): confirme que no expone server actions y que su frontera es Bearer + forOrg; el aislamiento fino del motor es materia de la lente S3. (4) Las 8 rutas de cron mas alla de verificar que el guard CRON_SECRET esta presente — la comparacion no-constant-time y el fail-open ya estan en el ledger (SEC-03, SEC-09). (5) prisma/ y scripts/, fuera de alcance salvo para probar la ausencia de rutas de creacion de setters.

---

## 6. Aislamiento multi-tenant: censo y delta (lente S3)

MÉTODO. Lectura estática read-only sobre el worktree chore/auditoria-seguridad @49fec9b, más tres verificaciones ejecutables: (1) un censo con script propio (Node, fuera del repo) que recorre src/ buscando llamadas Prisma sobre los modelos con eje de organización y mide si el bloque de argumentos lleva discriminante; (2) un probe de jose corrido con las dependencias del repo para decidir empíricamente si el verificador de impersonation es vulnerable a confusión de algoritmo; (3) arqueología de git (merge-base, branch --contains, log --all --grep) que resultó ser lo más productivo de la corrida. Cero escrituras: `git status --porcelain` al cierre muestra sólo `logic-core-v3/package-lock.json` modificado, con marca de tiempo 2026-07-29 01:25, anterior al inicio de esta sesión (viene del npm install del armado del worktree).

CENSO (punto 1 del encargo). 349 call-sites de Prisma sobre modelos con eje de organización. 214 llevan `organizationId` o `organization:` explícito en los argumentos; 135 no. Clasificación:
· seguro-por-construcción — 18 modelos (7 del motor + 11 del chatbot) detrás de src/lib/isolation. El helper es sólido y lo verifiqué línea por línea: el where del caller se compone con AND y nunca reemplaza el scope (scoped-model.ts:261-266); un organizationId ajeno de primer nivel lanza en vez de devolver vacío (:274-283); `cursor` está prohibido a propósito porque resuelve el ancla por unique global (:291-298); update/delete llevan guard atómico `{id, organizationId}` en modelos con columna propia y una sola sentencia updateMany/deleteMany con el scope en el mismo where en los relacionales (:198-248); el create fija el dueño desde el scope y rechaza un valor ajeno (:324-332); el re-keying del id está prohibido (:319-323); y hay un solo upsert genérico ausente a propósito, con tres upsert especializados sobre claves compuestas por org (registry.ts:467, :512, :567). Las tres mutaciones en SQL crudo de QuotaUsage llevan el guard de organización EMBEBIDO en el propio UPDATE (EXISTS sobre chatbot_bot_config, registry.ts:612-624, :650-662, :677-689), no sólo en el pre-check. No encontré forma de sortearlo por la API pública.
· seguro-por-disciplina — los ~20 modelos del portal (ver S3-03). Where manual + tres helpers, cero tests.
· débil — NINGUNO vivo. Los candidatos que revisé uno por uno resultaron correctos: markNotificationAsRead compara `notif.organizationId !== session.user.organizationId` antes de escribir (dashboard-actions.ts:199-210); sendCampaignAction hace findFirst con la org antes de los dos update por id (email-marketing/_actions.ts:177-214); replyToTicketAction llama a assertTicketBelongsToOrg en la rama no-admin (tickets/actions.ts:126-137); getClientConversationTranscriptAction deriva el orgId de la sesión y no del parámetro (transcript-action.ts:44-48); updateLeadStatus usa forOrg + una segunda verificación de pertenencia (updateLeadStatus.ts:23-33).

RUTAS DE ESCRITURA (punto 2). No encontré ninguna creación de recurso que tome el organizationId de un parámetro controlable por un usuario no-SUPER_ADMIN. Los cinco sitios donde el org llega por input están todos precedidos por un chequeo de rol SUPER_ADMIN (messages.ts:21 antes de :51; message.actions.ts; admin/chatbots/new/actions.ts) o por un cruce contra la sesión (/api/reports/monthly/route.ts:38-51: el admin puede pasar orgId, cualquier otro rol lo recibe rechazado si no coincide con el suyo). resolveScopedOrgId (security/org-scope.ts:20-27) implementa esa decisión de forma pura y está cubierto por idor-tokens.invariant.ts, que SÍ corre en CI.

IMPERSONATION (punto 3) — lo que está BIEN, verificado, para que no se toque: el token está atado al admin emisor (`payload.adminId !== session.user.id → null`, impersonation.ts:68) y exige rol SUPER_ADMIN vivo (:56), así que una cookie robada por sí sola no sirve; el TTL es de 30 minutos y se chequea tanto en el JWT como en el maxAge de la cookie; la expiración a mitad de una operación falla cerrado (resolveOrgId devuelve null → el layout del dashboard redirige a /admin/clients, layout.tsx:90-92); getImpersonationSession llama antes a auth(), así que el chequeo de sessionVersion que invalida sesiones tras un reset de password mata también la impersonation; y encadenar impersonation no es escalada (la sesión JWT sigue siendo la del admin, sólo se pisa la cookie de destino). Sobre confusión de algoritmo: jwtVerify se llama SIN allowlist de algoritmos (impersonation.ts:33), pero lo probé y NO es explotable — con una clave simétrica Uint8Array, jose rechaza tanto `alg:none` como RS256 con un TypeError de tipo de clave; lo único aceptado sin allowlist es HS384/HS512, que igual exigen el secreto. Lo dejo acá como no-hallazgo verificado en vez de emitirlo como ítem de checklist. Lo que sí está roto es el ciclo de vida: S3-04.

OBJETOS COMPARTIDOS ENTRE ORGS (punto 4). Ninguno permite que una org modifique lo que otra lee. PanelAnnouncement es el único modelo con audiencia cruzada por diseño (audience ALL vs ORG); su feed filtra correctamente con `{ OR: [{audience:'ALL'}, {audience:'ORG', organizationId}] }` en los dos consumidores (get-announcements-for-org.ts:37-45 y announcements.ts:29-37), y el "marcar visto" espeja ese mismo where antes de crear filas, así que un cliente no puede sembrar un visto sobre una novedad segmentada a otra org; sólo SUPER_ADMIN crea o borra novedades. El catálogo PremiumModule y la tabla Plan son de sólo lectura para los tenants: la activación escribe en OrganizationModule con la org de la sesión (upsell.ts:16 y :57-71) y el precio se congela como snapshot desde el catálogo (premium-modules.ts:114-132). AgencySettings es un singleton de la agencia, sin superficie de escritura para clientes. Las plantillas de KB viven en KnowledgeBase, que está en el helper con scope relacional vía botConfig.

CACHE (punto 5) — cierra el hueco #6 que CLEAN dejó declarado sin verificar. Revisé las 24 apariciones de unstable_cache, los 23 revalidateTag y los caches en memoria a nivel de módulo. TODAS las claves de datos por-organización incluyen el discriminante en keyParts: dashboard-org-meta/unread-messages/hot-leads-count/active-modules (dashboard/layout.tsx:25, :36, :48, :60), health-score, week-results, attention-items, traffic-insights, seo-insights, cal-summary, tiendanube-summary, gbp-metrics, chatbot-usage y chatbot-leads. La clave que CLEAN señaló como "compartida a propósito" (dashboard-hot-leads-count entre el layout y la tab de chatbot, chatbot/layout.tsx:12-18) está verificada: comparte la clave con el MISMO orgId dentro de keyParts, es el mismo tenant, es correcto. Las claves sin org (admin-alerts-count, admin-revision-resumen, admin-clients, admin-leads) son listados globales de superficie SUPER_ADMIN-only — ya en el ledger. Caches en memoria a nivel de módulo, que en un lambda persisten entre requests de tenants distintos: planCache está tecleado por orgId (get-plan-for-org.ts:21, :69, :120); botCache por slug (resolver.ts:10); el cache de proveedores LLM guarda adaptadores sin estado por nombre de proveedor, sin material por tenant (factory.ts:14 y el comentario de :7-12, verificado contra los constructores); configCache corre en el navegador y va por slug. Los revalidateTag por-org llevan el orgId en el tag (mark-read.ts:20, updateLeadStatus.ts:88, captureLead.ts:417). Resultado: CERO cache-keys que crucen organizaciones. Es el punto más limpio de esta lente.

DELTA DE COBERTURA (punto 6) — el entregable pedido. Aclaración de premisa: la golden suite GS.1 con tag @isolation NO EXISTE en el árbol auditado (grep repo-wide = 0 resultados); vive sin mergear en chore/gs-aislamiento @403280b. La tabla mide contra lo que SÍ está en 49fec9b.

| superficie | ¿cubierta hoy? | por qué importa |
|---|---|---|
| Helper forOrg — 11 modelos del chatbot | SÍ, tests/integration/chatbot-isolation.spec.ts, 8 casos (a-h) | pero NO corre en ningún job de CI |
| Helper forOrg — 7 modelos del motor | SÍ, tests/integration/motor-isolation.spec.ts, 8 casos (a-h) | ídem; incluye la defensa en profundidad de la FK compuesta |
| Panel del setter por camino HTTP | SÍ, tests/setter/02-isolation.spec.ts (C1-C4) + 16 invariantes de leados | test:setter tampoco está en CI; A-13 sigue abierto |
| Opt-out de email por contacto | SÍ, tests/e2e/20-idor-optout.spec.ts (5 casos) | única ruta pública con test de IDOR |
| resolveScopedOrgId (decisión pura) | SÍ, idor-tokens.invariant.ts, y SÍ corre en CI | cubre la función, ningún caller |
| **resolveOrgId (sesión→org, con impersonation)** | **NO** | es el discriminante real de 48 call-sites |
| **Impersonation: binding, TTL, expiración, logout, cookie forjada** | **NO** | acceso total a un tenant desde una cuenta admin (lo cubre 403280b sin mergear) |
| **Los ~20 modelos del portal con organizationId** | **NO, ni un test cruzado** | la superficie con más server actions del repo, con PII y facturación |
| **assertTicketBelongsToOrg / assertProjectBelongsToOrg / callerCanAccessOrg** | **NO** | son los tres únicos guards del portal |
| **Rutas HTTP públicas del chatbot (/chat, /config, /health, /smoke)** | **NO** (sólo el helper por debajo) | entrada pública no autenticada, mayor superficie de ataque |
| **Webhook del motor /api/motor/webhook/[channelToken]** | **NO** | resolución de tenant por token opaco pre-auth |
| **Cache-keys por organización** | **NO hay test** | verificado a mano en esta corrida: hoy todas correctas, nada impide que la próxima no lo sea |
| **Namespaces @unique globales (Conversation.sessionId, MotorMessage.providerMessageId)** | **NO** | S3-02 |
| **Rutas con orgId por parámetro (/api/reports/monthly, /api/track, /api/admin/clients/[organizationId]/*)** | **NO** (403 de reports/monthly y mutación de track están en 403280b, sin mergear) | el parámetro de org lo controla el cliente |
| **Escape unsafeGlobalQuery (51 usos de producción)** | **NO hay techo ni allowlist** | SEC-02 ya demostró que la clase se materializa |

LECTURA DE CONJUNTO. El diseño de aislamiento de este repo es mejor que su enforcement. Donde hay helper, el helper es serio y no le encontré agujero por lectura. Los problemas están en el borde: un namespace único global que se coló al schema (S3-02), tres formas distintas de responder "de qué org es este request" (S3-05), un ciclo de impersonation que no cierra (S3-04), y sobre todo dos ramas terminadas —la golden suite con su test de impersonation y la frontera del portal con su inventario de 222 call-sites— que resuelven la mitad de esta lista y nunca se mergearon (S3-01). Para una agencia de dos personas, el movimiento de mayor retorno de esta auditoría no es escribir código: es mergear 403280b y fa5ed47 y cablear test:isolation y test:integration a CI.

---

# Hallazgos por lente


---

## S1 — Autenticación y ciclo de vida de sesión

> **Pasada de refutación adversarial:** **no** — el verificador murió por límite de sesión. Los hallazgos marcados *sin verificar* los sostiene una sola lectura, salvo los que verifiqué yo y están anotados como tales.

### [S1-01] El lockout del login es evadible con un header y ademas crece sin cota: el limiter durable existe y el login nunca migro

| | |
|---|---|
| **Severidad** | ALTO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Sin auth. Solo requiere emitir requests HTTP con un header x-forwarded-for propio. |

**Impacto.** (a) Que se logra: intentos de password ilimitados contra /login, el unico endpoint de credenciales del producto — el tope de 5/5min es el UNICO control anti-fuerza-bruta que existe (no hay captcha, no hay lockout por cuenta, no hay delay progresivo: verificado por ausencia en login/actions.ts y por la lista de scopes de auth-rate-limit.ts:11-18, que no incluye ningun scope de login). (b) A quien: a cualquiera en internet, sin autenticacion. (c) Precondiciones: ninguna mas que poder mandar un header HTTP. Efecto secundario: el Map de modulo nunca poda las entradas con count<5 (solo checkBlocked borra, y solo si hubo bloqueo), asi que cada valor distinto de x-forwarded-for deja una entrada permanente en la lambda caliente. QUE CAMBIO vs el ledger: SEC-05/SEC-RATELIMIT-01 lo reportaron como 'limiter in-memory poroso en serverless, reemplazar por Redis'. Hoy el reemplazo YA EXISTE en el repo y es durable (tabla Neon con UPSERT atomico), lo usan forgot/reset/chatbot/contacto/motor, y el login quedo afuera. El comentario 'En produccion multi-instancia reemplazar por Redis' de login/actions.ts:10 esta obsoleto. Ademas el ledger nunca cito el vector del header: no es solo 'poroso por N lambdas' (multiplicador N), es evadible al 100% desde una sola conexion.

**Mecanismo.** getClientIP() toma el elemento MAS A LA IZQUIERDA de x-forwarded-for (login/actions.ts:53). En una cadena de proxies ese primer elemento es el valor que trajo el cliente; el edge appendea el IP real al final. Como la key del limiter es exactamente esa cadena, cada request puede caer en un bucket distinto y el contador de 5 intentos nunca llega al tope. El mismo patron left-most esta en getClientIpHash (src/lib/security/auth-rate-limit.ts:39), que es la key de forgotPasswordPerIp y resetPasswordPerIp — ahi el dano es menor porque forgotPasswordPerEmail (3/hora, keyeado por email) no es spoofeable, y el token de reset es de 256 bits. El costo por intento es alto (bcryptjs cost 10-12 es JS puro) asi que el throughput real es bajo, pero no hay techo.

**Evidencia.**

- `src/app/login/actions.ts:50-57`
  > async function getClientIP(): Promise<string> { const hdrs = await headers(); return ( hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? hdrs.get('x-real-ip') ?? 'unknown' ) }
- `src/app/login/actions.ts:20`
  > const rateLimitMap = new Map<string, RateEntry>()   // scope de modulo, sin cota de tamano ni TTL; solo checkBlocked() borra, y solo si hubo blockedUntil
- `src/app/login/actions.ts:9-10`
  > // Proteccion basica para un unico proceso (Netlify Functions / Node.js). // En produccion multi-instancia reemplazar por Redis.
- `src/lib/rate-limit/limiter.ts:21-26`
  > // Rate limit compartido entre lambdas via tabla Neon (B14.1). ... Reemplaza el limiter in-memory por proceso que era evadible rotando lambdas.
- `src/lib/security/auth-rate-limit.ts:11-18`
  > type AuthRateLimitScope = Extract<keyof typeof RATE_LIMIT_PRESETS, 'forgotPasswordPerIp' | 'forgotPasswordPerEmail' | 'resetPasswordPerIp' | 'resendCredentialsPerAdmin' | 'sendExecutiveReportNowPerAdmin'>   // no existe scope de login ni de magic link
- `src/lib/security/auth-rate-limit.ts:39`
  > const fwd = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()   // mismo left-most en el camino de forgot/reset
- `comando: grep -rn 'loginPerIp\|loginPerEmail' src/`
  > sin resultados — no existe preset de login en src/lib/rate-limit/presets.ts

**Fix.** Dos piezas. (1) Fuente unica de IP confiable: reemplazar getClientIP() de login/actions.ts y el cuerpo de getClientIpHash() por un helper compartido que NO lea el left-most. En Netlify usar el header que pone la plataforma y no es reescribible por el cliente (x-nf-client-connection-ip); si se quiere seguir soportando x-forwarded-for, tomar el elemento desde la DERECHA descontando exactamente la cantidad de proxies propios, nunca el [0]. (2) Migrar el login al limiter durable: agregar dos presets a src/lib/rate-limit/presets.ts (loginPerIp y loginPerEmail — el segundo cierra el caso de un atacante que igual logre variar la IP), sumarlos al Extract de AuthRateLimitScope en auth-rate-limit.ts:11-18, y borrar el Map de login/actions.ts:12-48 entero. Mismo tratamiento para magicLinkAction, que hoy no tiene ningun limite.

**Criterio de aceptación.** (1) Un test que llame a loginAction con credenciales invalidas 6 veces variando x-forwarded-for en cada llamada debe recibir el mensaje de bloqueo en la 6a, no 'Email o contrasena incorrectos'. (2) grep -n 'x-forwarded-for' src/ devuelve como maximo un archivo (el helper compartido). (3) grep -n 'new Map' src/app/login/actions.ts devuelve 0 resultados. (4) 'loginPerIp' figura en presets.ts y en el Extract de AuthRateLimitScope.

**Necesita decisión de Franco.** Confirmar cual es el header de IP no falsificable del plan de Netlify contratado (x-nf-client-connection-ip) — es lo unico que no se puede verificar desde el repo. Tambien decidir si el bloqueo por email (no solo por IP) es aceptable operativamente: habilita un DoS dirigido contra una cuenta concreta.

**Adjudicación del auditor.** Verificado por el padre leyendo src/app/login/actions.ts:20 (Map de modulo) y :53 (x-forwarded-for left-most). El limiter durable de src/lib/rate-limit/limiter.ts existe y el login nunca migro.

### [S1-02] Borrar un usuario no mata su sesion: el JWT sigue valido hasta 8h y el unico dato que lo detectaria (userExists) se calcula y se tira

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | El operador borra la fila User a mano (unica via de baja disponible). El ex-usuario conserva su cookie. |

**Impacto.** (a) Que se logra: una identidad revocada conserva una sesion autenticada hasta 8 horas. El dano concreto esta acotado porque, al no encontrar el usuario, getUserAccessState devuelve role='ORG_MEMBER' y organizationId=undefined, y practicamente todas las superficies re-derivan la org desde DB — con lo cual el token degrada a 'autenticado sin org' y las rutas de dashboard/admin/setter lo rebotan. Lo que queda vivo es el bit isAuthenticated y session.user.id contra cualquier handler que solo chequee session?.user. (b) A quien: al ex-usuario (empleado dado de baja, cliente cortado). (c) Precondiciones: haber tenido sesion activa antes de la baja. NO es ALTO porque no hay escalada de privilegio (el default es el rol MENOS privilegiado) ni acceso a datos de org. Es MEDIO y no BAJO porque el producto NO TIENE NINGUNA otra primitiva de revocacion: no hay flag de activo/desactivado en User, no existe ninguna ruta de borrado de usuario en src/, y no hay 'cerrar sesion en todos los dispositivos'. La unica baja posible es un DELETE manual en la DB — exactamente el caso que falla.

**Mecanismo.** getUserAccessState() usa optional-chaining sobre dbUser en todos los campos, asi que un usuario inexistente devuelve un estado 'valido' con defaults en vez de una senal de baja: role cae a 'ORG_MEMBER' y sessionVersion queda undefined. El callback jwt condiciona la invalidacion a que accessState.sessionVersion !== undefined; con el usuario borrado esa condicion es falsa y el bloque que devuelve null (matar la sesion) nunca se alcanza. El propio helper YA calcula userExists: Boolean(dbUser) — el bit exacto que resolveria el caso — y ningun consumidor lo lee.

**Evidencia.**

- `src/auth.ts:44-52`
  > const role = dbUser?.role ?? ('ORG_MEMBER' as Role) ... const passwordResetRequired = dbUser?.passwordResetRequired ?? false; const sessionVersion = dbUser?.sessionVersion
- `src/auth.ts:61`
  > userExists: Boolean(dbUser),
- `comando: grep -rn "userExists" src/`
  > src/auth.ts:61:    userExists: Boolean(dbUser),   — unica ocurrencia en todo src/: cero consumidores
- `src/auth.ts:215-223`
  > if ( trigger !== 'signIn' && trigger !== 'update' && typeof token.sessionVersion === 'number' && accessState.sessionVersion !== undefined && token.sessionVersion !== accessState.sessionVersion ) { return null }
- `src/auth.ts:79-83`
  > session: { strategy: 'jwt', maxAge: 8 * 60 * 60, updateAge: 60 * 60 }
- `prisma/schema.prisma:286-303`
  > model User { id ... passwordResetRequired Boolean @default(false); sessionVersion Int @default(1); ... }  — no existe campo isActive/disabled/deletedAt/bannedAt
- `comando: grep -rn "user.delete|prisma.user.delete|deleteUser" src/`
  > sin resultados — no hay ninguna ruta de baja de usuario en la aplicacion

**Fix.** En src/auth.ts, hacer que la ausencia del usuario sea un estado explicito y no un default: en el callback jwt, antes del chequeo de sessionVersion, agregar `if (!accessState.userExists) return null` (con el mismo skip de trigger 'signIn' que ya existe, para no romper el alta). Complementariamente, agregar a prisma/schema.prisma un campo `disabledAt DateTime?` en User, incluirlo en el select de getUserAccessState (src/auth.ts:22-39) y tratarlo igual que la inexistencia — asi la baja deja de requerir un DELETE manual y queda una via de revocacion soportada por la app.

**Criterio de aceptación.** Test de integracion: mintear una sesion valida para un usuario seed, borrar la fila User, y verificar que la siguiente request a una ruta protegida (por ejemplo GET /api/dashboard/leads/recent) devuelve 401 y no 200-con-lista-vacia. Un segundo test con `disabledAt` seteado debe dar el mismo 401. Ademas: grep 'userExists' en src/ debe devolver al menos 2 ocurrencias (definicion + uso).

**Necesita decisión de Franco.** Decidir si la baja de usuario se modela como borrado fisico o como soft-delete (disabledAt). Afecta a las relaciones con onDelete Cascade ya declaradas (Session, Account, PasswordResetToken) y a la trazabilidad de OsLeadActivity/logAdminAction, que hoy referencian userId.

### [S1-03] El login filtra existencia de cuenta por timing: bcryptjs solo corre si el usuario existe, y la mitigacion que el repo ya usa en forgot-password no se aplico aca

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sin auth. |

**Impacto.** (a) Que se logra: confirmar si una direccion de email tiene cuenta en la plataforma, sin conocer la contrasena. Con el multi-tenant del producto eso equivale a mapear que empresas son clientes de develOP y quienes son sus usuarios — insumo directo para phishing dirigido y para el credential stuffing del hallazgo S1-01. No da acceso. (b) A quien: a cualquiera, sin autenticacion. (c) Precondiciones: ninguna; y como el limiter del login es evadible (S1-01), la enumeracion no tiene techo practico. Se queda en MEDIO y no ALTO porque no expone datos ni permite ninguna accion.

**Mecanismo.** En el provider Credentials, si el usuario no existe (o existe sin password, caso OAuth-only) el flujo retorna antes de llegar a bcrypt.compare. Si existe con password, corre una comparacion bcrypt sobre el hash almacenado. La dependencia es bcryptjs ^3.0.3 — implementacion en JavaScript puro, sensiblemente mas lenta que la nativa — y los hashes se generan con cost 10 y 12 segun el camino, con lo cual la rama 'existe' tarda ordenes de magnitud mas que la rama 'no existe'. La diferencia es estable y no requiere promediar mucho. El repo demuestra que conoce la tecnica de mitigacion: forgot-password precomputa un DUMMY_HASH justamente para igualar el costo. Nota sobre esa mitigacion: tampoco cierra del todo su propio caso, porque en la rama 'usuario existe' forgot-password no hace ningun bcrypt — hace un transaction + una llamada HTTP a Brevo — asi que el perfil temporal que iguala (80ms de bcrypt) no es el que realmente corre del otro lado.

**Evidencia.**

- `src/auth.ts:152`
  > if (!user?.password) return null
- `src/auth.ts:157`
  > const isValid = await bcrypt.compare(String(credentials.password), user.password)
- `src/app/forgot-password/actions.ts:20-22`
  > // Hash dummy precomputado para igualar el costo cuando el usuario NO existe. // Mitiga timing attack: bcrypt.compare contra un hash con el mismo cost (10). const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8/8DqWlqaA5jE0n6Z9Vp.NwcAk7Bru'
- `src/app/forgot-password/actions.ts:67-70`
  > if (!user) { await bcrypt.compare(email, DUMMY_HASH); return { type: 'success', message: ANTI_ENUM_MESSAGE } }
- `src/app/forgot-password/actions.ts:96`
  > const result = await sendTransactionalEmail({ ... })   // la rama 'usuario existe' gasta una llamada HTTP a Brevo, no un bcrypt
- `comando: node -e "console.log(require('./package.json').dependencies.bcryptjs)"`
  > ^3.0.3   (bcryptjs = implementacion JS pura; no hay dependencia 'bcrypt' nativa)
- `src/app/reset-password/actions.ts:66 y src/app/cambiar-password/actions.ts:49`
  > bcrypt.hash(password, 12) / bcrypt.hash(input.newPassword, 10)   — los hashes reales van de cost 10 a 12

**Fix.** Aplicar en src/auth.ts (provider Credentials) la misma tecnica que ya vive en forgot-password/actions.ts:20-22: extraer el DUMMY_HASH a un modulo compartido (por ejemplo src/lib/security/timing.ts) y, en la rama `if (!user?.password)`, ejecutar `await bcrypt.compare(String(credentials.password), DUMMY_HASH)` antes del `return null`. El dummy debe tener el MISMO cost que los hashes reales; como hoy conviven cost 10 y 12, unificar primero el cost de hasheo en un solo valor (ver S1-09) y derivar el dummy de ese valor, no hardcodear 10.

**Criterio de aceptación.** Un test que mida el tiempo de authorize() para un email inexistente y para un email existente con password incorrecta: la diferencia de medianas sobre 20 corridas debe quedar por debajo del 20% del tiempo del caso 'existe'. Ademas, el DUMMY_HASH debe aparecer en un unico archivo (grep de la constante = 1 definicion + N imports).

### [S1-04] El login responde distinto para una cuenta existente-sin-verificar, y ese chequeo corre ANTES de validar la contrasena

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sin auth. Basta un POST al formulario de login con un email y una contrasena cualquiera de 8-128 caracteres. |

**Impacto.** (a) Que se logra: distinguir 'esta cuenta existe y no verifico el email' de 'no existe / password mal', mandando cualquier contrasena. No hace falta conocer ninguna credencial porque el throw ocurre antes del bcrypt.compare. (b) A quien: a cualquiera, sin autenticacion. (c) Precondiciones: ninguna. El universo afectado es acotado — solo cuentas con emailVerified null, es decir invitaciones no aceptadas y altas pendientes — pero justamente esas son las cuentas mas atractivas (todavia no tienen password fijada, ver S1-06). MEDIO: no da acceso, pero es un oraculo binario limpio y gratuito, independiente del de timing (S1-03) y no cubierto por el mensaje anti-enumeracion que el repo si aplica en forgot-password.

**Mecanismo.** authorize() lanza un Error('EMAIL_NOT_VERIFIED') cuando encuentra el usuario y emailVerified es null — y lo lanza en la linea anterior al bcrypt.compare, con lo cual la respuesta no depende de la contrasena enviada. Auth.js no clasifica un throw arbitrario de authorize como CredentialsSignin, asi que loginAction cae en la rama `default` del switch en lugar de la rama que devuelve el mensaje generico 'Email o contrasena incorrectos'. El string exacto que llega al usuario depende de como Auth.js envuelve el error en error.cause (el codigo espera cause.message; Auth.js anida el error original un nivel mas adentro), pero en cualquiera de los dos desenlaces la respuesta es distinguible de la del caso generico. Contraste dentro del mismo repo: forgot-password devuelve un unico ANTI_ENUM_MESSAGE identico para existe / no existe / rate-limited.

**Evidencia.**

- `src/auth.ts:152-157`
  > if (!user?.password) return null
        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED')
        }

        const isValid = await bcrypt.compare(String(credentials.password), user.password)
- `src/app/login/actions.ts:113-123`
  > if (error instanceof AuthError) { recordFailedAttempt(ip); switch (error.type) { case 'CredentialsSignin': return 'Email o contrasena incorrectos.'; default: if ((error.cause as { message?: string })?.message === 'EMAIL_NOT_VERIFIED') { return 'Por favor verifica tu email antes de ingresar.' } return 'Ocurrio un error inesperado. Intenta de nuevo.' } }
- `src/app/forgot-password/actions.ts:17-18`
  > const ANTI_ENUM_MESSAGE = 'Si la cuenta existe, te mandamos un mail con instrucciones en los proximos minutos.'   — el estandar anti-enumeracion que el login no sigue

**Fix.** En src/auth.ts, mover el chequeo de emailVerified DESPUES del bcrypt.compare (asi el oraculo exige conocer la contrasena correcta) y dejar de senalizarlo por excepcion: devolver null igual que el resto de los fallos. Si el producto necesita guiar al usuario legitimo, hacerlo por un canal que no sea la respuesta del login — por ejemplo reenviar automaticamente el mail de verificacion y mostrar siempre el mismo mensaje generico. Consecuencia en login/actions.ts:118-122: la rama 'EMAIL_NOT_VERIFIED' se borra.

**Criterio de aceptación.** Test de integracion sobre loginAction con tres entradas — (a) email inexistente, (b) email existente verificado con password incorrecta, (c) email existente sin verificar con password incorrecta — que afirme que las tres devuelven exactamente el mismo string.

**Necesita decisión de Franco.** Decidir el reemplazo de UX para el usuario legitimo que no verifico su email (hoy el mensaje diferencial cumple esa funcion). Opcion sugerida: reenvio automatico del mail de verificacion, con el mismo mensaje generico en pantalla.

### [S1-05] passwordResetRequired solo se enforcea en proxy.ts, y su matcher no cubre /api/*: con una password temporal se exportan los leads sin pasar por el cambio forzado

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Tener credenciales validas de un usuario con passwordResetRequired=true (tipicamente la password temporal recien emitida por /api/admin/users/[userId]/resend-credentials). |

**Impacto.** (a) Que se logra: saltear el cambio de contrasena obligatorio y llegar a los endpoints de datos del portal, incluido GET /api/dashboard/chatbot/leads/export, que devuelve el CSV de leads de la organizacion — PII de prospectos (nombre, email, telefono), que es exactamente lo que la Ley 25.326 cubre. El acceso queda ademas sin la huella esperada: el usuario legitimo sigue viendo su cuenta en estado 'tenes que cambiar la password'. (b) A quien: a quien tenga credenciales validas en estado passwordResetRequired — el escenario que importa es el interceptor del mail de credenciales temporales (resend-credentials), que es justamente el flujo pensado para cuentas comprometidas. (c) Precondiciones: poseer credenciales validas. Por eso es MEDIO y no ALTO: no es un bypass de autenticacion, es un bypass de defensa en profundidad sobre una cuenta ya comprometida.

**Mecanismo.** El unico punto del sistema que lee passwordResetRequired para bloquear es el proxy (ex middleware). El proxy se ejecuta unicamente sobre los 6 patrones del matcher — /admin, /dashboard, /setter, /login, /bienvenida, /cambiar-password — que no incluyen /api. Ningun route handler ni server action vuelve a mirar la bandera: los handlers de datos del portal se conforman con que exista sesion y con resolver la org. Como los Server Actions si postean contra la URL de la pagina (cubierta por el matcher), el hueco es especifico de los route handlers bajo /api. Rastro de la migracion a Next 16: ALWAYS_ALLOWED todavia lista '/api/auth/', '/api/' y '/logout' — las tres entradas son inalcanzables, porque el matcher no incluye /api y /logout no existe como ruta en src/app. Son constantes muertas que dan la falsa impresion de que el proxy tiene algo que decir sobre /api.

**Evidencia.**

- `src/proxy.ts:84-90`
  > if ( isAuthenticated && passwordResetRequired && !ALWAYS_ALLOWED.some(p => pathname.startsWith(p)) ) { return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, nextUrl)) }
- `src/proxy.ts:171-173`
  > export const config = { matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password'] }
- `src/proxy.ts:68`
  > const ALWAYS_ALLOWED = [CHANGE_PASSWORD_PATH, '/api/auth/', '/logout', '/api/']   — las 3 ultimas entradas son inalcanzables con ese matcher
- `comando: find src/app -path '*logout*' -o -name 'logout*'`
  > sin resultados — /logout no existe como ruta
- `comando: grep -rn "passwordResetRequired" src/ (28 ocurrencias)`
  > el unico lector que BLOQUEA es src/proxy.ts:86; ningun archivo bajo src/app/api/ lo lee (los hits en api/ son escrituras: resend-credentials/route.ts:68 y qa/login/route.ts:165)
- `src/app/api/dashboard/leads/recent/route.ts:11-14`
  > const session = await auth(); if (!session?.user) { return NextResponse.json({ leads: [] }, { status: 401 }) }   — unico gate de identidad
- `src/app/api/dashboard/chatbot/leads/export/route.ts:17-31`
  > comentario 'Seguridad critica: - Auth obligatorio (getClientChatbotSession). 401 si no. - Multi-tenant ...' — el inventario de guardas de la propia ruta no contempla passwordResetRequired

**Fix.** Dos partes. (1) Mover el enforcement al chokepoint de identidad en vez de dejarlo en el borde: agregar a src/lib/auth-guards.ts un `requireFreshSession()` que haga auth() y rechace con 403 si session.user.passwordResetRequired, y usarlo en los route handlers de datos del portal (empezando por api/dashboard/chatbot/leads/export y api/dashboard/leads/recent, y por los dos de api/reports/). (2) Limpiar el residuo de la migracion: borrar '/api/auth/', '/api/' y '/logout' de ALWAYS_ALLOWED (src/proxy.ts:68) o, si se decide extender el matcher a /api, dejarlas y agregar el patron correspondiente — pero no las dos cosas a medias, que es el estado actual.

**Criterio de aceptación.** Test de integracion: mintear una sesion de cliente con passwordResetRequired=true y hacer GET /api/dashboard/chatbot/leads/export → debe devolver 403, no 200 con el CSV. Y `grep -n "'/api/'" src/proxy.ts` debe devolver 0 resultados (o el matcher debe incluir un patron /api).

**Necesita decisión de Franco.** Definir el alcance: si el bloqueo aplica a TODAS las rutas /api autenticadas o solo a las que devuelven datos de negocio. Bloquear indiscriminadamente puede romper el propio flujo de cambio de password si alguna pieza de esa pantalla pega a /api.

### [S1-06] El token de reset se guarda en claro y su tabla la comparten dos endpoints de canje con guardas asimetricas: /accept-invite no tiene rate-limit, no sube sessionVersion y no audita

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Para el token en claro: acceso de lectura a la base o a un backup. Para el canje asimetrico: poseer un token valido de un usuario cuyo campo password sea null. |

**Impacto.** (a) Que se logra: dos cosas distintas. Primero, PasswordResetToken.token se persiste en texto plano: cualquier lectura de la base (backup, dump, replica, acceso de soporte al panel de Neon) entrega tokens canjeables durante su ventana de 45 minutos — toma de cuenta directa, sin password. Segundo, el mismo token emitido por forgot-password se puede canjear en /accept-invite, que corre con menos guardas que /reset-password: sin rate-limit, sin incremento de sessionVersion (las sesiones previas sobreviven al cambio de password) y sin logAdminAction (el cambio no queda en la auditoria). (b) A quien: para lo primero, a quien tenga lectura sobre la DB; para lo segundo, a quien tenga el token. (c) Precondiciones: el canje por /accept-invite solo funciona sobre usuarios con password null — cuentas invitadas sin aceptar y cuentas creadas por Google OAuth. Eso acota bastante el universo, por eso MEDIO y no ALTO.

**Mecanismo.** forgot-password genera el token con randomBytes(32) (256 bits, entropia adecuada) pero lo escribe tal cual en la columna token, que es @unique — o sea indexada y buscable, sin hash de por medio. Los otros secretos del repo si tienen tratamiento (los secretos de canal del motor van cifrados con AES-256-GCM, el state de OAuth va firmado con HMAC): el token de reset es la excepcion. Sobre la asimetria: /reset-password y /accept-invite hacen el mismo findUnique contra passwordResetToken, pero /reset-password abre con applyAuthRateLimit(resetPasswordPerIp), cierra con sessionVersion:{increment:1} y deja logAdminAction; /accept-invite no hace ninguna de las tres. El unico discriminador que /accept-invite aplica es `record.user.password !== null`, que no distingue el origen del token (invitacion vs recuperacion) — solo el estado de la cuenta.

**Evidencia.**

- `prisma/schema.prisma:317-328`
  > model PasswordResetToken { id String @id @default(cuid()); token String @unique; userId String; expiresAt DateTime; usedAt DateTime?; ... }   — el token se almacena tal cual, sin columna de hash
- `src/app/forgot-password/actions.ts:73,80-83`
  > const token = crypto.randomBytes(32).toString('hex') ... prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } })
- `src/app/reset-password/actions.ts:19-26`
  > const ipLimit = await applyAuthRateLimit({ scope: 'resetPasswordPerIp', identifier: ipHash })   — la unica guarda anti-abuso del canje
- `src/app/reset-password/actions.ts:76 y :87-96`
  > sessionVersion: { increment: 1 }  ...  await logAdminAction({ ... actionType: 'PASSWORD_CHANGED', ... })
- `src/app/accept-invite/actions.ts:36-39`
  > const record = await prisma.passwordResetToken.findUnique({ where: { token }, include: { user: { select: { id: true, password: true, email: true } } } })   — misma tabla, sin applyAuthRateLimit previo
- `src/app/accept-invite/actions.ts:67-79`
  > prisma.user.update({ ... data: { password: hashedPassword, emailVerified: new Date() } })   — sin sessionVersion: { increment: 1 } y sin logAdminAction
- `src/app/accept-invite/actions.ts:58-63`
  > if (record.user.password !== null) { return { type: 'error', message: 'Este enlace no corresponde a una invitacion valida.' } }   — unico discriminador; no separa token-de-invitacion de token-de-recuperacion

**Fix.** (1) Guardar el token hasheado: en prisma/schema.prisma renombrar la columna a tokenHash y persistir sha256(token) (basta SHA-256, no bcrypt: el token ya tiene 256 bits de entropia). En forgot-password/actions.ts:73-83 escribir el hash y mandar el token en claro solo por email; en reset-password/actions.ts:45 y accept-invite/actions.ts:36 buscar por el hash del token recibido. (2) Cerrar la asimetria: agregar un campo `purpose` (INVITE | RESET) a la tabla y que cada endpoint solo acepte el suyo. (3) Alinear accept-invite con reset-password: applyAuthRateLimit con un scope nuevo acceptInvitePerIp, sessionVersion:{increment:1} en el update, y logAdminAction.

**Criterio de aceptación.** (1) Tras pedir un reset, `SELECT token FROM "PasswordResetToken"` (o el campo equivalente) no debe contener el valor que viaja en el link del email. (2) Test: un token emitido por forgotPasswordAction pasado a acceptInviteAction devuelve error de token invalido. (3) Test: acceptInviteAction invocada 11 veces desde la misma IP devuelve el error de rate-limit en la 11a.

**Necesita decisión de Franco.** Confirmar si hay tokens vivos en la base de produccion antes de migrar la columna (el hasheo invalida los pendientes). Con 45 minutos de TTL alcanza con hacer la migracion en una ventana tranquila.

### [S1-07] El magic link confirma existencia de cuenta por respuesta diferencial: el callback signIn devuelve false para el usuario inexistente y eso llega al formulario

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | CONFIRMADO_SIN_TEST |
| **Precondiciones** | Sin auth. Un POST al formulario de magic link del /login. |

**Impacto.** (a) Que se logra: un oraculo binario de existencia de cuenta, mas limpio que el de timing (S1-03) porque la diferencia es un string, no una medicion. (b) A quien: cualquiera, sin autenticacion. (c) Precondiciones: ninguna, y sin ningun techo — magicLinkAction es el unico camino de auth que no pasa por ningun limiter (ni el in-memory del login ni el durable de forgot/reset). ESTADO vs LEDGER: SEC-04 ya nombra 'account enumeration' como consecuencia de la falta de rate-limit; lo que agrego y cambia el fix es el MECANISMO — el oraculo no lo causa el volumen, lo causa que el callback signIn devuelve false. Ponerle rate-limit (que es lo que propone SEC-04) reduce el caudal y no cierra la fuga: un atacante con una lista corta de emails objetivo la resuelve igual. Cero tests lo cubren.

**Mecanismo.** El callback signIn intercepta el caso email.verificationRequest, resuelve el usuario por email normalizado y devuelve Boolean(existingUser). Cuando devuelve false, Auth.js aborta con un AuthError y magicLinkAction cae en el catch y responde 'No se pudo generar el Magic Link. Intenta de nuevo.'; cuando el usuario existe, el flujo sigue y la action responde el literal 'SUCCESS'. Las dos respuestas son distinguibles por el cliente. Como no hay rate-limit en ninguna de las dos ramas, la consulta se puede repetir sin costo. Nota: el chequeo se hace ANTES de mandar el mail, asi que la rama negativa ni siquiera gasta credito de Brevo — lo que la vuelve mas barata de explotar, no menos.

**Evidencia.**

- `src/auth.ts:174-186`
  > async signIn({ user, email }) { if (email?.verificationRequest) { const requestedEmail = user?.email?.trim().toLowerCase(); if (!requestedEmail) { return false } const existingUser = await prisma.user.findUnique({ where: { email: requestedEmail }, select: { id: true } }); return Boolean(existingUser) }
- `src/app/login/actions.ts:145-157`
  > try { await signIn('resend', { email, redirectTo: '/dashboard', redirect: false }); return 'SUCCESS' } catch (error) { if (error instanceof AuthError) { return 'No se pudo generar el Magic Link. Intenta de nuevo.' } throw error }
- `src/lib/security/auth-rate-limit.ts:11-18`
  > AuthRateLimitScope no incluye ningun scope de magic link — magicLinkAction no llama a applyAuthRateLimit (verificado: el archivo login/actions.ts no importa auth-rate-limit)
- `src/app/forgot-password/actions.ts:44-57`
  > contraste en el mismo repo: forgot-password aplica DOS scopes (forgotPasswordPerIp y forgotPasswordPerEmail) y devuelve el mismo mensaje de exito incluso cuando el rate-limit corta

**Fix.** En src/app/login/actions.ts, hacer que magicLinkAction responda SIEMPRE el mismo string (el equivalente al ANTI_ENUM_MESSAGE de forgot-password/actions.ts:17-18), tanto en el camino feliz como en el catch de AuthError — el error real se loguea server-side, no se devuelve. Y sumar los dos limiters que forgot-password ya tiene: agregar presets magicLinkPerIp y magicLinkPerEmail a src/lib/rate-limit/presets.ts, incluirlos en el Extract de AuthRateLimitScope (auth-rate-limit.ts:11-18) y aplicarlos al inicio de magicLinkAction, devolviendo el mismo mensaje cuando cortan.

**Criterio de aceptación.** Test de integracion sobre magicLinkAction con un email seedeado y un email inexistente: ambas invocaciones devuelven exactamente el mismo string. Segundo test: la 6a invocacion desde la misma IP devuelve tambien ese mismo string (el corte no se distingue).

### [S1-08] generateTempPassword: sesgo de modulo, ~33 bits de entropia y estructura publica fija, para una credencial que se manda por email

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Conocer el email del objetivo y que exista una password temporal vigente sin cambiar. |

**Impacto.** (a) Que se logra: reducir el espacio de busqueda de la contrasena temporal que da acceso completo a la cuenta. La estructura es fija y publica (4 letras + 2 digitos + 2 simbolos, con alfabetos recortados), lo que deja ~33 bits antes del sesgo; el sesgo de modulo achica un poco mas la distribucion efectiva. (b) A quien: a quien conozca el email del objetivo. (c) Precondiciones: que el admin haya disparado resend-credentials o que sea una cuenta recien creada, y que la victima aun no haya hecho el cambio forzado. BAJO y no MEDIO porque, incluso con el lockout del login evadible (S1-01), un espacio de 2^33 con bcryptjs por intento no es atacable online en una ventana realista. El valor de arreglarlo es que es una linea de codigo y elimina la clase entera.

**Mecanismo.** randomFromString mapea cada byte aleatorio con `b % str.length`. Como 256 no es multiplo de la longitud de dos de los tres alfabetos (LETTERS tiene 47 caracteres, SPECIALS tiene 7), los primeros caracteres de esos alfabetos salen con mas frecuencia que los ultimos — la distribucion no es uniforme. NUMBERS, con 8 caracteres, es el unico sin sesgo. Aparte del sesgo, la composicion esta fijada en el codigo: siempre 4+2+2 en ese orden, con alfabetos que ademas excluyen caracteres confusos. La contrasena resultante viaja en claro en el cuerpo del email de bienvenida.

**Evidencia.**

- `src/lib/security/generate-temp-password.ts:8-13`
  > function randomFromString(str: string, length: number): string { const bytes = randomBytes(length); return Array.from(bytes).map((b) => str[b % str.length]).join('') }
- `src/lib/security/generate-temp-password.ts:4-6`
  > const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'  (47 chars, 256 % 47 = 21 -> sesgado) / const NUMBERS = '23456789'  (8, sin sesgo) / const SPECIALS = '!@#$%&*'  (7, 256 % 7 = 4 -> sesgado)
- `src/lib/security/generate-temp-password.ts:15-21`
  > return ( randomFromString(LETTERS, 4) + randomFromString(NUMBERS, 2) + randomFromString(SPECIALS, 2) )   — estructura fija de 8 caracteres
- `src/app/api/admin/users/[userId]/resend-credentials/route.ts:61-62,77-83`
  > const tempPassword = generateTempPassword() ... welcomeClientEmail({ ..., tempPassword, loginUrl })   — la credencial viaja en claro por email

**Fix.** En src/lib/security/generate-temp-password.ts reemplazar el mapeo por modulo por rechazo de muestras (descartar los bytes >= floor(256/len)*len y volver a pedir) o directamente por crypto.randomInt(0, len), que ya lo hace bien y esta en el core de Node. Y subir el largo: pasar de 4+2+2 a al menos 6+3+3 (unos 55 bits) o generar 16 caracteres de un alfabeto unico — la password se copia y pega desde un email, no se tipea de memoria, asi que el costo de UX es nulo.

**Criterio de aceptación.** Test estadistico: generar 100.000 passwords y verificar que la frecuencia de cada caracter de LETTERS no se desvia mas de 3 sigma de la uniforme. Y que generateTempPassword().length >= 12.

### [S1-09] La politica de contrasena mas debil corre en el camino de recuperacion, y el cost de bcrypt esta partido en 10 y 12 segun por donde entres

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ninguna — es el flujo normal de recuperacion o de aceptacion de invitacion. |

**Impacto.** (a) Que se logra: fijar una contrasena que el producto rechazaria en su propia pantalla de 'Mi Cuenta' — 'aaaaaaaa' pasa por reset-password y por accept-invite, y no pasa por cambiar-password. Ademas, segun por que camino se fije, el hash queda con cost 10 o con cost 12: un mismo usuario puede terminar con un hash mas barato de atacar offline solo por haber usado la pantalla de cambio en vez del link de recuperacion. (b) A quien: afecta a todos los usuarios que pasen por recuperacion o invitacion. (c) Precondiciones: ninguna, es el comportamiento normal del producto. BAJO porque no habilita ningun ataque por si solo; es una inconsistencia que degrada la postura justo en el camino de mayor riesgo. Es el patron 'dos listas que divergieron' aplicado a la politica de password: hay cuatro definiciones y ninguna es la fuente unica.

**Mecanismo.** Existen cuatro definiciones independientes de 'contrasena valida': ResetPasswordSchema (min 8, max 128, sin complejidad), la validacion inline de acceptInviteAction (min 8, max 128, sin Zod), UpdatePasswordSchema (min 8 + mayuscula + digito) y CambiarPasswordSchema (min 8 + mayuscula + digito, duplicado a mano del anterior). Las dos primeras son las que gobiernan los caminos donde el usuario NO tiene sesion valida — recuperacion e invitacion. En paralelo, el factor de costo de bcrypt esta hardcodeado en cuatro call sites con dos valores distintos: 12 en reset-password y accept-invite, 10 en cambiar-password y resend-credentials.

**Evidencia.**

- `src/lib/actions/schemas.ts:94-97`
  > password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres.').max(128, 'Contrasena demasiado larga.'),   — ResetPasswordSchema, sin regex de complejidad
- `src/app/accept-invite/actions.ts:26-31`
  > if (!password || password.length < 8) { ... } if (password.length > 128) { ... }   — validacion inline, ni siquiera Zod
- `src/lib/actions/schemas.ts:25-29`
  > newPassword: z.string().min(8, ...).regex(/[A-Z]/, ...).regex(/[0-9]/, ...)   — UpdatePasswordSchema, la politica estricta
- `src/app/cambiar-password/actions.ts:12-19`
  > const CambiarPasswordSchema = z.object({ ... newPassword: z.string().min(8,...).regex(/[A-Z]/,...).regex(/[0-9]/,...) })   con el comentario ':9-11 espejo de UpdatePasswordSchema de Mi Cuenta ... quedan sincronizados' — sincronizados a mano, no por construccion
- `src/app/reset-password/actions.ts:66 · src/app/accept-invite/actions.ts:65 · src/app/cambiar-password/actions.ts:49 · src/app/api/admin/users/[userId]/resend-credentials/route.ts:62`
  > bcrypt.hash(password, 12) / bcrypt.hash(password, 12) / bcrypt.hash(input.newPassword, 10) / bcrypt.hash(tempPassword, 10)

**Fix.** Exportar desde src/lib/actions/schemas.ts un unico `passwordSchema` (el estricto: min 8 + mayuscula + digito, max 128) y consumirlo desde ResetPasswordSchema (schemas.ts:94-97), desde acceptInviteAction (reemplazando la validacion inline de accept-invite/actions.ts:26-34) y desde CambiarPasswordSchema (borrando el duplicado de cambiar-password/actions.ts:12-19). En paralelo, exportar una constante BCRYPT_COST desde src/lib/security/ y usarla en los cuatro call sites de bcrypt.hash — un solo valor, elegido a conciencia (12 es el que ya usan dos de los cuatro).

**Criterio de aceptación.** (1) `grep -rn 'bcrypt.hash(' src/ | grep -v BCRYPT_COST` devuelve 0 resultados. (2) `grep -rn "regex(/\[A-Z\]/" src/` devuelve una sola definicion. (3) Test: resetPasswordAction con password 'aaaaaaaa' devuelve error de validacion, no exito.

**Necesita decisión de Franco.** Elegir el cost unico de bcrypt. Subir todo a 12 duplica el tiempo de login (bcryptjs es JS puro) y ese tiempo corre dentro de una lambda con timeout — conviene medirlo antes de fijarlo.

### [S1-10] /api/qa/login: el 403 dice cual de las tres guardas fallo, y la tercera solo conoce Netlify y Vercel

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Sin auth. Un GET/POST/DELETE a /api/qa/login. |

**Impacto.** (a) Que se logra: dos cosas menores. Primero, un sondeo anonimo a la ruta en produccion devuelve el motivo del rechazo, o sea revela el estado de la variable de entorno QA_ALLOW_LOCALHOST — un atacante sabe si la primera de las tres cerraduras esta abierta y si vale la pena insistir con las otras dos. Segundo, la guarda de hosting reconoce exactamente dos proveedores; en cualquier otro destino de deploy (contenedor propio, Render, Fly, un preview local expuesto) esa tercera cerradura no aplica y la proteccion queda reducida a las otras dos. (b) A quien: a cualquiera, sin autenticacion. (c) Precondiciones: ninguna para el sondeo. BAJO: en el deploy actual (Netlify) las tres guardas se cumplen y la ruta responde 403; no verifique ningun camino que las supere. ESTADO vs LEDGER: el ledger declara el triple-guard CERRADO y 'hermetico'. Sigue cerrado — lo que agrego es que las guardas hablan de mas y que la tercera esta atada a dos proveedores concretos, cosa que ninguna auditoria previa registro.

**Mecanismo.** tripleGuardCheck devuelve un objeto con un campo reason por cada cerradura y los tres handlers lo serializan tal cual en el cuerpo del 403. Como las guardas se evaluan en orden, el reason que sale identifica la primera que fallo: en un deploy sano la respuesta es siempre la que corresponde al flag de entorno, lo que confirma al observador externo que la variable no esta puesta (y, por contraposicion, delataria el dia que si lo estuviera). La tercera guarda compara contra process.env.NETLIFY y process.env.VERCEL_ENV: son las dos unicas plataformas que se detectan, y ambas por variables que solo esas plataformas inyectan. Detalle menor sin consecuencia: en la segunda guarda, host.split(':')[0] sobre un literal IPv6 con puerto ('[::1]:3000') devuelve '[', asi que la rama que compara contra '[::1]' es inalcanzable en ese caso — falla cerrada, no abierta.

**Evidencia.**

- `src/app/api/qa/login/route.ts:50-70`
  > if (process.env.QA_ALLOW_LOCALHOST !== '1') { return { allowed: false, reason: 'qa_flag_off' } } ... if (!isLocalhost) { return { allowed: false, reason: 'host_not_localhost' } } if (process.env.NETLIFY === 'true') { return { allowed: false, reason: 'hosted_netlify' } } if (process.env.VERCEL_ENV === 'production') { return { allowed: false, reason: 'hosted_vercel_prod' } }
- `src/app/api/qa/login/route.ts:87 (y :200, :217)`
  > return NextResponse.json({ error: 'forbidden', reason: guard.reason }, { status: 403 })   — el motivo se devuelve al cliente en los tres handlers
- `src/app/api/qa/login/route.ts:20-23`
  > comentario del propio archivo: 'The route code remains in the prod bundle (same build serves npm start and npm run start:qa), so the guards are the only thing standing between this endpoint and a full auth bypass — keep them.'
- `src/app/api/qa/login/route.ts:54-60`
  > const hostname = host.split(':')[0]?.toLowerCase() ?? ''  ... hostname === '[::1]'   — inalcanzable con puerto; falla cerrada
- `src/app/api/qa/login/route.ts:151-167`
  > const sessionToken = await encode({ secret, salt: cookieName, ... token: { sub: user.id, ..., role: user.role, ..., passwordResetRequired: false } })   — el token QA no lleva sessionVersion, con lo cual queda fuera del chequeo de invalidacion de src/auth.ts:218

**Fix.** (1) En los tres handlers de src/app/api/qa/login/route.ts, devolver el body sin el campo reason (o con un reason generico) y loguear el motivo real server-side con console.warn — el subagente de QA no necesita el detalle en el body para funcionar, lo lee del log. (2) Invertir la tercera guarda para que sea allowlist en vez de denylist: en lugar de bloquear si NETLIFY o VERCEL_ENV, permitir solo si process.env.NODE_ENV !== 'production' O si una variable explicita de QA lo habilita — asi un destino de deploy no previsto falla cerrado en vez de abierto.

**Criterio de aceptación.** curl -s -X POST http://<host>/api/qa/login -d '{"persona":"super-admin"}' contra un build de produccion devuelve 403 y el JSON no contiene ninguna de las cadenas 'qa_flag_off', 'host_not_localhost', 'hosted_netlify', 'hosted_vercel_prod'. Y la suite de QA local sigue autenticando (test:setter verde).

**Necesita decisión de Franco.** Confirmar que ningun script de QA parsea el campo reason del 403 para decidir su comportamiento antes de sacarlo del body.

#### Ya documentado en auditorías previas — no se re-reporta (12)

- [SEC-AUTH-03] El mecanismo sessionVersion existe y funciona para los tres caminos de cambio de password (reset-password/actions.ts:76, cambiar-password/actions.ts:59, resend-credentials/route.ts:71) + chequeo en auth.ts:215-223 — sin test, tal como lo declara el ledger; el hueco del usuario borrado lo desarrollo aparte en S1-02.
- [SEC-MISC-02] Cookies de NextAuth con config explicita desde fuente unica: verificado httpOnly + sameSite lax + secure por NODE_ENV en src/lib/auth-cookies.ts:25-30, consumido por src/auth.ts:89-94 y src/auth.config.ts:17-22. Cerrado, sin cambios.
- [SEC-AUTH-01 / SEC-AUTH-02 / SEC-AUTH-06] Los dos callbacks OAuth validan sesion + SUPER_ADMIN y verifican el state firmado ANTES de canjear el code (google-business/callback/route.ts:14-33, tiendanube/callback/route.ts:29-49). Cerrado, sin cambios.
- [CLEAN-REF-OAUTHSTATE] El fallback OAUTH_STATE_SECRET -> AUTH_SECRET sigue siendo deliberado y tira si faltan ambas (oauth-state.ts:26-36); TTL 10 min (:24); firma HMAC-SHA256 comparada con timingSafeEqual (:91). Sin cambios.
- [QA-BYPASS / BRIEF-QA-LOGIN] El triple-guard de /api/qa/login sigue presente y en el mismo orden (qa/login/route.ts:49-73). Lo que agrego sobre la fuga del motivo y el alcance de la tercera guarda va en S1-10.
- [BRIEF-PROXY-GUARD] proxy.ts no tiene ninguna condicional por NODE_ENV ni flag de QA que debilite el enforcement — reconfirmado leyendo el archivo completo. requireSetter()/requireSuperAdmin() siguen siendo el unico punto de entrada de identidad a las server actions (auth-guards.ts:3-21).
- [CLEAN-2.1-EMAIL] La escritura de User.email sin normalizar sigue viva en el camino de invitacion (invitations.ts:52 hace .trim() sin toLowerCase) contra la lectura normalizada de auth.ts:143. Identico a lo documentado.
- [CLEAN-1.1-APPURL] El link de reset arma su base con NEXT_PUBLIC_APP_URL ?? NEXTAUTH_URL ?? 'http://localhost:3000' (forgot-password/actions.ts:86-87) y el de credenciales con NEXT_PUBLIC_APP_URL ?? 'https://develop.com.ar' (resend-credentials/route.ts:76) — dos fallbacks distintos, ya inventariado. Aclaro para la pregunta 3 del encargo: NINGUNO sale del header Host, asi que NO hay host-header injection en el link de reset.
- [CLEAN-1.1-FROM] El mail de reset sale por brevo-service y su remitente sigue con el fallback a un Gmail personal; el catch no rompe el flujo (forgot-password/actions.ts:104-106 solo hace console.error). Identico.
- [RESIL-05] El envio del magic link sigue sin timeout (auth.ts:101-120 hace await sendTransactionalEmail sin AbortSignal). Identico.
- [SEC-05 / SEC-RATELIMIT-01] La parte 'el limiter del login es in-memory y poroso en serverless' esta documentada; lo que desarrollo en S1-01 es el cambio de estado (ya existe el limiter durable y el login no migro) mas el vector del header, que el ledger no cubre.
- [SEC-04] La parte 'magicLinkAction sin rate-limit' esta documentada; lo que desarrollo en S1-07 es el mecanismo del oraculo (respuesta diferencial del callback signIn), que cambia el fix.


---

## S2a — Autorización por rol: superficie ADMIN

> **Pasada de refutación adversarial:** **no** — el verificador murió por límite de sesión. Los hallazgos marcados *sin verificar* los sostiene una sola lectura, salvo los que verifiqué yo y están anotados como tales.

### [S2a-01] El rol más privilegiado no tiene ciclo de vida en la app: el único provisioning de SUPER_ADMIN vive en un módulo sin ningún importador, y no existe ninguna action de revocación/baja

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ninguna para el estado de hecho. El impacto aparece cuando hay que revocar un SUPER_ADMIN (salida del equipo, cuenta comprometida, invitación mal tipeada). |

**Impacto.** (a) No expone ningún dato ni habilita ninguna acción a un atacante: es un control AUSENTE, no una puerta abierta. Lo que falta es la capacidad de dar de baja al rol que lee la PII de TODOS los tenants (leads, transcripciones, notas internas, tokens de integración). (b) A quién afecta: a develOP como responsable de tratamiento — ante una salida, un traspaso o una cuenta comprometida, la única palanca es escribir a mano en la DB de prod (Neon); `listTeamMembers` muestra la lista de SUPER_ADMIN sin ofrecer ninguna acción sobre ella. (c) Precondiciones: ninguna del lado del atacante; el gap se materializa cuando hace falta revocar. No lo subo a ALTO porque no hay acción alcanzable ni dato expuesto hoy; no lo bajo a BAJO porque el control faltante es el offboarding del rol con acceso cross-tenant total y hay PII bajo Ley 25.326 de por medio.

**Mecanismo.** `inviteTeamMemberAction` es la ÚNICA función en src/ que crea un usuario con `role: 'SUPER_ADMIN'`. Vive en `src/lib/actions/settings.ts`, un módulo que NINGÚN archivo importa (verificado por grep sobre las dos formas de import) — es el duplicado legacy de `admin/settings/_actions/settings.actions.ts`, que sí está vivo pero NO tiene función de invitación. Consecuencia 1: no hay forma de crear un segundo super-admin desde la app. Consecuencia 2 (la de seguridad): tampoco hay ninguna action de borrado, desactivación o degradación de rol — `listTeamMembers` (settings.actions.ts:207) es read-only. El único mecanismo de invalidación de sesión que existe (`sessionVersion++`) sólo se dispara desde `/api/admin/users/[userId]/resend-credentials`, que resetea la contraseña y la manda por mail al propio usuario: sirve para expulsar, no para revocar. Además, si el módulo muerto se re-cablea, arrastra un defecto de diseño: crea el User con rol SUPER_ADMIN ANTES de cualquier prueba de control del buzón (settings.ts:172-178), y el token de 7 días no es el gate real — la ruta de magic link aprueba el login por mera EXISTENCIA del usuario (auth.ts:181-185) y no exige `emailVerified`, a diferencia del camino de credenciales que sí lo exige (auth.ts:153-155). Un mail mal tipeado dejaría entonces una cuenta SUPER_ADMIN reclamable de forma indefinida y sin manera de borrarla desde la app.

**Evidencia.**

- `src/lib/actions/settings.ts:148-178`
  > export async function inviteTeamMemberAction(input: { email: string; name?: string }) { … const user = await prisma.user.create({ data: { email, name, role: 'SUPER_ADMIN' } })
- `grep -rn "lib/actions/settings\|from './settings'" src --include=*.ts --include=*.tsx (excluyendo el propio archivo)`
  > (salida vacía) — el módulo no tiene ningún importador
- `src/app/(protected)/admin/settings/_actions/settings.actions.ts:207-220`
  > export async function listTeamMembers() { … const members = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' }, … select: { id: true, name: true, email: true } })
- `grep -rn "user.delete|deleteUser|removeTeamMember|revokeInvite" src`
  > sólo aparecen passwordResetToken.deleteMany en forgot-password/actions.ts:77 e invitations.ts:98 — ninguna baja de usuario ni cambio de rol
- `src/auth.ts:181-185`
  > const existingUser = await prisma.user.findUnique({ where: { email: requestedEmail }, select: { id: true } }); return Boolean(existingUser)  // rama email.verificationRequest: aprueba por existencia, sin exigir emailVerified
- `src/auth.ts:153-155`
  > if (!user.emailVerified) { throw new Error('EMAIL_NOT_VERIFIED') }  // el camino de credenciales SÍ lo exige — asimetría con magic link

**Fix.** Tres piezas chicas, todas dentro de `src/app/(protected)/admin/settings/_actions/settings.actions.ts` (el archivo vivo). (1) Agregar `revokeTeamMemberAction(userId)`: `requireSuperAdmin()`, Zod cuid, rechazar si `userId === session.user.id` (no auto-baja) y si es el último SUPER_ADMIN; en transacción `role: 'ORG_MEMBER'` + `sessionVersion: { increment: 1 }` + `password: null`, y `logAdminAction` con actionType existente. La degradación de rol corta el acceso en el próximo `auth()` porque `getUserAccessState` relee el rol de la DB en cada request (auth.ts:209-231). (2) Exponerla en la tabla de `listTeamMembers` con diálogo de confirmación (regla de acciones destructivas del CLAUDE.md). (3) Borrar `src/lib/actions/settings.ts` entero (módulo muerto, 0 importadores) — si en algún momento se quiere invitación de admin, reimplementarla en el archivo vivo creando el User con `role: 'ORG_MEMBER'` y promoviéndolo a SUPER_ADMIN recién en `acceptInviteAction`, cuando el token demuestra control del buzón.

**Criterio de aceptación.** 1) `grep -rn "role: 'SUPER_ADMIN'" src/lib src/app --include=*.ts` no devuelve ninguna escritura de rol fuera de la nueva action de revocación. 2) Con dos usuarios SUPER_ADMIN sembrados en la DB de dev: invocar `revokeTeamMemberAction(idDelOtro)` como admin A → el usuario B, con su cookie de sesión previa, recibe redirect a /dashboard en `GET /admin` y `Unauthorized` en cualquier action admin. 3) `revokeTeamMemberAction` sobre uno mismo y sobre el último admin devuelve error sin escribir. 4) `src/lib/actions/settings.ts` ya no existe y `npx tsc --noEmit` sigue en cero errores.

**Necesita decisión de Franco.** Sí: Franco define la política de baja — ¿degradar a ORG_MEMBER (deja el historial de audit-log atado al usuario) o borrado duro? Y si quiere reactivar la invitación de admin en la app o dejar la alta como operación manual de DB (con 2 personas puede ser la respuesta correcta).

### [S2a-02] El único test automatizado de autorización de la API admin se auto-saltea siempre: apunta a /api/admin/clients, ruta que no existe en el árbol

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ninguna (defecto de cobertura de tests, no superficie atacable). |

**Impacto.** (a) No expone ningún dato: las 8 rutas reales de /api/admin sí tienen guard (las verifiqué una por una). Lo que se pierde es la SEÑAL: el suite reporta 'API admin requiere auth' en verde sin haber tocado ninguna ruta admin. (b) A quién afecta: al equipo — es falsa cobertura sobre la única superficie admin que el middleware NO cubre (proxy.ts:171-173 no matchea /api/*), justo donde un guard borrado en un refactor pasaría sin ruido. (c) Precondiciones: ninguna; es un defecto de la batería, no de la app.

**Mecanismo.** `tests/e2e/19-security.spec.ts` hace `request.get('/api/admin/clients')` y a continuación `test.skip(response.status() === 404, 'Admin clients API endpoint is not implemented')`. Bajo `src/app/api/admin/clients/` sólo existe `[organizationId]/send-executive-report/route.ts` — no hay `route.ts` en el segmento `clients`, así que Next devuelve 404 y el `test.skip` se dispara SIEMPRE. El assert `expect([401,403,307]).toContain(status)` nunca se ejecuta. Sumado a esto: el suite no tiene ningún caso de escalada vertical autenticada (11-client-login.spec.ts:14-20 sólo prueba ORG_MEMBER → /admin como PÁGINA; no hay ningún test de SETTER → /admin, ni ninguno que invoque una server action de admin con sesión de rol menor, que es el vector real porque una action se resuelve por ID y no por URL).

**Evidencia.**

- `tests/e2e/19-security.spec.ts:21-24`
  > const response = await request.get('/api/admin/clients', { timeout: 20000 })
    test.skip(response.status() === 404, 'Admin clients API endpoint is not implemented')
    expect([401, 403, 307]).toContain(response.status())
- `find src/app/api/admin -name route.ts`
  > 8 rutas: alerts/trigger-detector, chatbot/demo-chat/[slug], chatbot/events, chatbot/insights/generate, chatbot/test-prompt, clients/[organizationId]/send-executive-report, reports/send-now, users/[userId]/resend-credentials — ninguna es clients/route.ts
- `src/proxy.ts:171-173`
  > matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password']  // /api/* fuera del matcher
- `tests/e2e/11-client-login.spec.ts:14-20`
  > test('cliente NO puede acceder a admin', …) — único test cross-rol, y sólo sobre la página /admin

**Fix.** En `tests/e2e/19-security.spec.ts`: reemplazar la ruta fantasma por una real y borrar el `test.skip`. Concretamente `request.post('/api/admin/reports/send-now')` sin cookies → esperar 403 (es lo que devuelve el guard en route.ts:7-9). Agregar dos casos autenticados usando el helper que ya existe (`tests/helpers/setter-auth.ts` mintea la cookie con rol arbitrario): sesión SETTER y sesión ORG_MEMBER contra la misma ruta → 403. Y un tercer caso que es el que falta de verdad: POST de una server action de admin desde una URL fuera de /admin (p. ej. `/`) con sesión SETTER, afirmando que la respuesta NO contiene el payload de éxito — eso prueba que el guard es la action y no el middleware.

**Criterio de aceptación.** `npx playwright test tests/e2e/19-security.spec.ts` reporta 0 skipped en el bloque de API admin, y si se comenta el bloque `if (!session?.user || session.user.role !== 'SUPER_ADMIN')` de `src/app/api/admin/reports/send-now/route.ts` el test pasa a ROJO.

### [S2a-03] No existe invariante ni test que exija guard de rol en las server actions de admin: 112 de 116 lo tienen por disciplina manual, escrita en 6 dialectos distintos

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Ninguna hoy. El riesgo es de regresión: una action de admin nueva sin `requireSuperAdmin()` sería invocable por cualquier rol (o sin sesión) posteando su action-id a cualquier URL, porque el matcher del middleware sólo protege rutas de página. |

**Impacto.** (a) El estado HOY es correcto — no encontré ninguna action de admin sin guard más allá de la ya documentada (SEC-02/preflightChecks). No hay dato expuesto ni acción alcanzable. Lo que reporto es la ausencia del candado: el único enforcement es que cada autor se acuerde. (b) A quién afecta: a la próxima action de admin que se escriba. (c) Precondiciones: una regresión futura. Por eso BAJO y no MEDIO: severidad por impacto real, y el impacto real hoy es cero.

**Mecanismo.** CLEAN-1.2-SUPERADMIN reportó 'tres dialectos vivos de soy super-admin' SIN evidencia archivo:linea (sólo el conteo) y remitió el ángulo de seguridad a la maestra. Lo cerré: hay SEIS dialectos, todos comparan el mismo valor contra la misma fuente (`session.user.role` de `auth()`), así que NINGUNO es más débil en la decisión de autorización. Las divergencias reales son de contrato, no de fuerza: (1) `lib/auth-guards.ts:6` exige además `session.user.id` y devuelve el userId — es el ESTRICTAMENTE MÁS FUERTE; (2) `modules/chatbot/server/admin/requireSuperAdmin.ts:10-16` no exige el id y devuelve `session.user`, y sus callers auditan con `user.id ?? 'unknown'` (bulk-actions.ts:30, archiveClient, hardDeleteClient) — una acción destructiva cross-tenant podría quedar registrada sin autor; (3) 34 comparaciones inline `session.user.role !== 'SUPER_ADMIN'`; (4) una función PRIVADA homónima `requireSuperAdmin` en `lib/actions/settings.ts:20` que sombrea el nombre compartido; (5) `ensureAdmin()` booleano en `lib/actions/leads.ts:14`; (6) `ensureSuperAdminOrErrorString()` en `lib/actions/projects.ts:24`, que se traga el throw. Verifiqué que NINGUNA de las 6 formas se invoca sin `await` (el fallo clásico: un Promise siempre es truthy). Y verifiqué el hueco: `grep -rln 'SUPER_ADMIN|requireSuperAdmin' --include=*.invariant.ts src` devuelve CERO — de los 56 invariantes del repo, ninguno habla de rol.

**Evidencia.**

- `src/lib/auth-guards.ts:3-11`
  > export async function requireSuperAdmin(): Promise<string> { const session = await auth(); if (session?.user?.role !== 'SUPER_ADMIN' || !session.user.id) { throw new Error('Unauthorized') } return session.user.id }
- `src/modules/chatbot/server/admin/requireSuperAdmin.ts:7-18`
  > if (!session?.user) throw new Error('UNAUTHORIZED: no active session'); if (session.user.role !== 'SUPER_ADMIN') throw new Error('FORBIDDEN: SUPER_ADMIN role required'); return session.user   // no exige user.id
- `src/lib/bulk-actions.ts:9,30`
  > const user = await requireSuperAdmin() … userId: user.id ?? 'unknown'   // atribución del audit-log de un bulk pause cross-org
- `src/lib/actions/settings.ts:20-28`
  > async function requireSuperAdmin() { … throw new Error('No autorizado.') }   // función privada homónima del helper compartido
- `src/lib/actions/leads.ts:14-17 y src/lib/actions/projects.ts:24-31`
  > async function ensureAdmin() { return session?.user?.role === 'SUPER_ADMIN' }  /  async function ensureSuperAdminOrErrorString(): Promise<string|null> { try { await requireSuperAdmin(); return null } catch { return 'No autorizado.' } }
- `grep -rln "SUPER_ADMIN|requireSuperAdmin" --include=*.invariant.ts src`
  > (salida vacía) — ninguno de los 56 archivos *.invariant.ts menciona rol
- `censo propio: 116 acciones exportadas en el perímetro admin (68 bajo src/app/(protected)/admin + 48 fuera)`
  > 112 con guard SUPER_ADMIN explícito · 2 org-scoped por diseño (saveClientSettings, updateLeadStatus) · 2 sin guard alguno (preflightChecks.ts:13 y :170, ya documentado como SEC-02)
- `grep de invocaciones de guard sin await`
  > 0 resultados — las 6 formas siempre se llaman con await

**Fix.** Crear `src/lib/auth/admin-guards.invariant.ts` (mismo patrón que los 56 existentes, ejecutable con tsx) que: (1) enumere por FS todos los archivos con `'use server'` bajo `src/app/(protected)/admin/**`, `src/modules/chatbot/server/admin/**`, `src/actions/admin/**`, `src/lib/bulk-actions.ts` y `src/lib/actions/{projects,clients,services,impersonation,invitations,messages,leads}.ts`; (2) para cada `export async function`, exija que el cuerpo contenga una llamada `await` a uno de los guards permitidos; (3) mantenga una allow-list EXPLÍCITA y comentada de las excepciones conocidas (`saveClientSettings` y `updateLeadStatus`, que son org-scoped a propósito; `preflightChecks` mientras SEC-02 siga abierto), de modo que agregar una excepción nueva sea un cambio visible en el diff. Cablearlo en el agregado `check:invariants` de package.json:18. Aparte, y como higiene separada: migrar los 6 dialectos al helper de `lib/auth-guards.ts` (el más fuerte) — pero eso es refactor, no el candado.

**Criterio de aceptación.** `npm run check:invariants` incluye el nuevo invariante y sale en verde sobre el árbol actual; si a `src/app/(protected)/admin/leads/_actions/lead.actions.ts` se le comenta el `await requireSuperAdmin()` de `deleteLead`, el comando sale en ROJO nombrando archivo y función.

### [S2a-04] 21 de 33 páginas de /admin no tienen guard propio: delegan el chequeo de rol en admin/layout.tsx, capa que Next.js documenta como no confiable para auth

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Requiere que falle el middleware (edición del matcher de proxy.ts:171-173, o mover la página fuera del árbol de admin/layout.tsx). Con el código actual, ningún rol menor llega. |

**Impacto.** (a) No hay hoy ningún camino de escalada: `proxy.ts:148` corta a todo rol distinto de SUPER_ADMIN en cualquier request bajo /admin/:path*, incluidas las de payload RSC, y el layout vuelve a chequear con el rol FRESCO de DB. Son dos guards independientes. Lo reporto porque la capa de página es desigual (12 páginas se defienden solas, 21 no) y dos de las que no lo hacen leen un ID arbitrario de la URL y devuelven PII de terceros. (b) A quién: a ningún atacante hoy; el impacto aparece si se edita el matcher del middleware o si una página futura se mueve fuera del layout. (c) Precondiciones: fallo de una de las dos capas. No lo subo: severidad por impacto real, y el impacto real hoy es cero.

**Mecanismo.** `src/app/(protected)/admin/layout.tsx:47-49` es el único chequeo de rol para 21 páginas: /admin, alerts, announcements, chatbot/activity, chatbot/health, clients/new, fg2-lab, leados, leados/[leadId], leados/setter/[setterId], leads, leads/[leadId], messages, messages/[orgId], projects, projects/[projectId]/payments, projects/[projectId]/tasks, referrals, settings, team, tickets, tickets/[ticketId]. La documentación de Next.js sobre autenticación es explícita en que un layout no es la frontera correcta porque no se re-renderiza en cada navegación; acá el hueco lo tapa el middleware, no el layout. Dos de esas páginas son las que más pesan: `admin/leados/setter/[setterId]/page.tsx` toma el setterId de la URL sin validar y devuelve nombre + email del setter y TODAS sus evaluaciones (su propio comentario en :27 dice 'Admin-only por el layout'), y `admin/messages/[orgId]` abre la conversación de una organización arbitraria. Nota de contraste, a favor del código: `admin/projects/[projectId]/page.tsx:98-101` sí tiene guard propio pero es de AUTENTICACIÓN, no de rol — y compensa con `callerCanAccessOrg(session.user, project.organizationId)` en :165, que scopea a la org a cualquier rol que no sea SUPER_ADMIN. Ése es el patrón que las 21 deberían seguir.

**Evidencia.**

- `src/app/(protected)/admin/layout.tsx:41-49`
  > const session = await auth(); if (!session?.user) { redirect('/login') } if (session.user.role !== 'SUPER_ADMIN') { redirect('/dashboard') }
- `src/proxy.ts:148-152`
  > if (isAdminRoute && role !== ADMIN_ROLE) { return NextResponse.redirect(new URL(onboardingCompleted ? DASHBOARD_PATH : ONBOARDING_PATH, nextUrl)) }
- `src/app/(protected)/admin/leados/setter/[setterId]/page.tsx:27,29-51`
  > * setter. Admin-only por el layout (SUPER_ADMIN); read-only … prisma.user.findUnique({ where: { id: setterId }, select: { name: true, email: true } }) … prisma.osLeadDossier.findMany({ where: { lead: { assignedToId: setterId } } … })
- `censo propio de las 33 page.tsx bajo src/app/(protected)/admin`
  > 12 con guard de rol propio (audit-log:8, chatbots:14, chatbots/new:11, chatbots/[botId]:28, clients:91, clients/[clientId]:28, clients/[clientId]/edit:11, clients/[clientId]/chatbot:20, settings/alerts:7, settings/reports:7, projects/[projectId]/hours:28, projects/[projectId]:98 solo-auth+callerCanAccessOrg) · 21 sin guard propio

**Fix.** No migrar las 21 a mano (ruido alto, beneficio bajo). Dos piezas: (1) extraer un helper `requireSuperAdminPage()` en `src/lib/auth-guards.ts` que haga `auth()` + `redirect('/dashboard')` si el rol no es SUPER_ADMIN, y aplicarlo SOLO a las páginas que toman un identificador de la URL y devuelven datos de terceros — `admin/leados/setter/[setterId]`, `admin/leados/[leadId]`, `admin/leads/[leadId]`, `admin/messages/[orgId]`, `admin/tickets/[ticketId]`, `admin/projects/[projectId]/tasks`, `admin/projects/[projectId]/payments`; (2) para el resto, dejar constancia en el propio `admin/layout.tsx` de que el layout NO es el guard primario (lo es el middleware) y sumar al invariante de S2a-03 una regla hermana: toda `page.tsx` bajo /admin con segmento dinámico `[...]` debe llamar al helper.

**Criterio de aceptación.** Un usuario con sesión SETTER que hace `GET /admin/leados/setter/<id>` con el middleware deshabilitado en local (comentando el matcher) recibe redirect a /dashboard y el body no contiene el email del setter. Hoy, con esa misma prueba, la respuesta la corta el layout — el criterio es que la corte también la página.

### [S2a-05] Role.CLIENT es un valor de primera clase del enum sin ninguna rama en el middleware ni en los guards: un usuario con ese rol queda en bucle de redirección /dashboard ↔ /login

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Un usuario con `User.role = 'CLIENT'` en la DB. Ningún código de src/ produce ese estado hoy; sí lo permite el enum de Prisma y el tipo `Role` de auth.config.ts. |

**Impacto.** (a) No hay dato expuesto ni acción lograda: todos los guards de admin están escritos como `!== 'SUPER_ADMIN'`, así que CLIENT queda DENEGADO en admin — falla cerrado, que es la dirección correcta. Lo que se pierde es disponibilidad: el usuario no puede usar ninguna zona. (b) A quién: a cualquier usuario al que se le asigne ese rol (hoy nadie: verifiqué que ningún código lo escribe ni lo lee). (c) Precondiciones: que alguien setee `role = 'CLIENT'` — por edición manual de la DB, por un seed, o por una feature futura que asuma que el enum está cableado.

**Mecanismo.** El enum `Role` de Prisma declara cuatro valores y `src/auth.config.ts:4` los repite en el tipo del middleware, pero `proxy.ts` sólo tiene constantes para tres (`ADMIN_ROLE`, `USER_ROLE = 'ORG_MEMBER'`, `SETTER_ROLE`). Para un usuario CLIENT: en /dashboard, `proxy.ts:154` evalúa `role !== USER_ROLE` como verdadero y redirige a `/login`; en /login, `proxy.ts:134-145` ve una sesión autenticada, el callbackUrl viene vacío (el redirect anterior construye `new URL(LOGIN_PATH, nextUrl)`, que descarta el query), el rol no es ADMIN, y devuelve a `/dashboard` si `onboardingCompleted` — que `auth.ts:47-50` calcula como verdadero para cualquier usuario con org completa, sin mirar el rol. Bucle cerrado. Si la org no completó onboarding aterriza en /bienvenida y ahí se queda (proxy.ts:158-166 no tiene rama para CLIENT y cae en `next()`). El mismo agujero está en `dashboard/layout.tsx:91`, que manda a `/login` a todo lo que no sea SUPER_ADMIN sin org.

**Evidencia.**

- `prisma/schema.prisma:12-17`
  > enum Role { SUPER_ADMIN  ORG_MEMBER  CLIENT  SETTER }
- `src/auth.config.ts:4`
  > type Role = 'SUPER_ADMIN' | 'ORG_MEMBER' | 'CLIENT' | 'SETTER'
- `src/proxy.ts:13-15`
  > const ADMIN_ROLE = 'SUPER_ADMIN'
const USER_ROLE = 'ORG_MEMBER'
const SETTER_ROLE = 'SETTER'   // no hay constante ni rama para CLIENT
- `src/proxy.ts:154-156`
  > if (isDashboardRoute && role !== USER_ROLE && !(role === ADMIN_ROLE && isImpersonating)) { return NextResponse.redirect(new URL(role === ADMIN_ROLE ? ADMIN_PATH : LOGIN_PATH, nextUrl)) }
- `src/proxy.ts:143-145`
  > return NextResponse.redirect(new URL(onboardingCompleted ? DASHBOARD_PATH : ONBOARDING_PATH, nextUrl))   // desde /login devuelve a /dashboard → cierra el bucle
- `grep -rn "'CLIENT'|Role.CLIENT" src`
  > sólo 2 hits, ambos ajenos al rol: un VisibilityFilter de proyectos en admin/projects/_components/projects-filters.ts:19 y el type de auth.config.ts:4 — ningún guard consulta el valor

**Fix.** Decidir y ejecutar una de dos, en `prisma/schema.prisma` + `src/auth.config.ts:4`: (a) si CLIENT es residuo histórico, sacarlo del enum con una migración aditiva-segura (verificar antes con un SELECT read-only que no haya filas con ese valor) y del type; (b) si se planea usarlo, darle rama explícita en `proxy.ts` junto a ORG_MEMBER (`const DASHBOARD_ROLES = ['ORG_MEMBER','CLIENT']` y cambiar :154 por `!DASHBOARD_ROLES.includes(role)`). En cualquiera de los dos casos, cerrar el bucle: el redirect de :143-145 debe mandar a `/login?error=unauthorized` con `signOut` en vez de a una zona a la que el rol no puede entrar, para que un rol no contemplado en el futuro termine en una pantalla y no en ERR_TOO_MANY_REDIRECTS.

**Criterio de aceptación.** Con un usuario de prueba en la DB de dev seteado a `role='CLIENT'` y una org con onboarding completo: `GET /dashboard` termina en una página con status 200 (login con mensaje) en vez de encadenar redirects. Si se elige la opción (a), el enum de schema.prisma tiene 3 valores y `npx tsc --noEmit` sigue en cero.

**Necesita decisión de Franco.** Sí: Franco define si CLIENT se elimina del modelo o se cablea. Es una decisión de producto (¿va a existir un rol de cliente distinto de ORG_MEMBER?), y toca el schema.

### [S2a-06] /api/admin/users/[userId]/resend-credentials no valida el rol del usuario target: un SUPER_ADMIN puede resetear la contraseña e invalidar la sesión de otro SUPER_ADMIN o de un SETTER

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sesión SUPER_ADMIN válida (el guard de la ruta se cumple). No alcanzable por ORG_MEMBER, CLIENT ni SETTER. |

**Impacto.** (a) Qué se logra: expulsar de la plataforma a cualquier otro usuario (la contraseña se pisa y `sessionVersion++` mata los JWT vivos) y hacer que le llegue una contraseña temporal a SU buzón — no al del atacante, así que no es toma de cuenta, es denegación de servicio dirigida más ruido. (b) A quién: a otro SUPER_ADMIN o a un SETTER. (c) Precondiciones: HAY QUE SER YA SUPER_ADMIN. Por la regla de severidad por impacto real, un hallazgo que exige el rol máximo no puede pasar de BAJO: es integridad intra-admin en una agencia de dos personas, no una escalada.

**Mecanismo.** La ruta valida el rol del LLAMADOR (route.ts:17) y el shape del `userId` (:40), pero nunca consulta el rol del usuario TARGET: hace `prisma.user.findUnique({ where: { id: userId } })` sin filtro y escribe `password`, `passwordResetRequired: true` y `sessionVersion: { increment: 1 }` sobre quien sea. La semántica de la ruta es 'reenviar credenciales a un cliente' — lo delata el template que usa, `welcomeClientEmail`, que para un SETTER (sin org membership) renderiza `organizationName: 'tu cuenta'`. El audit-log queda (:93-105), así que la acción es trazable; lo que falta es la restricción. Colateral relacionado con S2a-01: ésta es hoy la única palanca de la app que invalida sesiones de otro usuario, y sirve para expulsar pero no para revocar el rol.

**Evidencia.**

- `src/app/api/admin/users/[userId]/resend-credentials/route.ts:16-19`
  > const session = await auth(); if (!session?.user || session.user.role !== 'SUPER_ADMIN') { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }   // valida al llamador, no al target
- `src/app/api/admin/users/[userId]/resend-credentials/route.ts:46-54`
  > const user = await prisma.user.findUnique({ where: { id: userId }, include: { orgMemberships: { … take: 1 } } })   // sin filtro por role ni por pertenencia a org
- `src/app/api/admin/users/[userId]/resend-credentials/route.ts:64-73`
  > await prisma.user.update({ where: { id: userId }, data: { password: passwordHash, passwordResetRequired: true, sessionVersion: { increment: 1 } } })
- `src/app/api/admin/users/[userId]/resend-credentials/route.ts:75-83`
  > const orgName = user.orgMemberships[0]?.organization.companyName ?? 'tu cuenta'  … welcomeClientEmail({ … })   // template de bienvenida de CLIENTE aplicado a cualquier rol

**Fix.** En `src/app/api/admin/users/[userId]/resend-credentials/route.ts`, después del `findUnique` y antes del `update`, agregar el guard de target: `if (user.role !== 'ORG_MEMBER' || user.orgMemberships.length === 0) return NextResponse.json({ error: 'Solo se pueden reenviar credenciales a usuarios de una organización cliente' }, { status: 400 })` — hay que sumar `role: true` al select/include. Si en algún momento hace falta resetear a un SETTER, que sea una ruta aparte con su propio template y su propia entrada de audit-log; el reseteo de otro SUPER_ADMIN no debería existir (para eso está la action de revocación de S2a-01).

**Criterio de aceptación.** Con sesión SUPER_ADMIN, `POST /api/admin/users/<id-de-otro-super-admin>/resend-credentials` devuelve 400 y `SELECT sessionVersion FROM "User" WHERE id = <id>` no cambia; el mismo POST contra un ORG_MEMBER sigue devolviendo 200.

#### Ya documentado en auditorías previas — no se re-reporta (6)

- [SEC-02] runPreflightChecks(botId) sin ningún guard — verificado idéntico en 49fec9b: src/modules/chatbot/server/admin/preflightChecks.ts:1 ('use server'), :13 findUnique por botId arbitrario vía unsafeGlobalQuery, :118 número de WhatsApp de la org; su único call-site es un client component (admin/chatbots/[botId]/BotDetailClient.tsx:140), o sea action-id invocable desde cualquier URL sin sesión. Sin cambios; ningún test ni invariante lo cubre.
- [SEC-AUTH-08 / SEC-18] startImpersonationAction sin Zod en el orgId — idéntico: src/lib/actions/impersonation.ts:11-24 recibe `orgId: string` crudo y va directo a findUnique; el guard de rol (:13) sí está.
- [SEC-10] Fallback de secret hardcodeado en impersonation — idéntico: src/lib/impersonation.ts:14-22, `?? 'develOP-dev-impersonation-secret'` como cuarto fallback de getSecret().
- [SEC-AUTH-04] Sin middleware.ts global / defensa en profundidad — el estado sigue el declarado por la maestra (CERRADO-VERIFICADO parcial): proxy.ts:104-108 y :117-156 con matcher :171-173 que no cubre /api/*. Mi hallazgo S2a-04 es la capa distinta (páginas), no éste.
- [SEC-INV-zod-gaps] Server actions de admin sin Zod (admin/leads/_actions/module-demand.actions.ts, admin/referrals/_actions/referrals.admin.actions.ts) — verificadas sin schema; ambas con requireSuperAdmin() presente.
- [CLEAN-1.2-SUPERADMIN] Los tres dialectos de 'soy super-admin' + 34 comparaciones de rol a mano — re-medido y confirmado el conteo de 34; el desarrollo (mapa archivo:linea, veredicto de cuál es más débil y candado propuesto) va en S2a-03 como CAMBIO_DE_ESTADO, no acá.


---

## S2b — Autorización por rol: DASHBOARD de cliente y API de datos

> **Pasada de refutación adversarial:** sí, agente independiente.

### [S2b-01] Las 3 server actions del módulo premium Email Marketing no verifican la contratación del módulo: el gate vive solo en el layout, y el envío usa la cuenta Brevo compartida de la agencia con remitente y HTML del input

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Cuenta ORG_MEMBER autenticada con una organización (no requiere tener el módulo activo, ni rol admin, ni impersonation) |

**Impacto.** (a) Qué se logra: importar contactos arbitrarios a la org, crear una campaña con name/subject/fromName/fromEmail/htmlContent totalmente controlados por el input (cero Zod, cero longitud máxima) y dispararla por `POST /emailCampaigns/{id}/sendNow` contra la ÚNICA BREVO_API_KEY de la agencia. (b) A quién: a cualquier ORG_MEMBER autenticado — es decir, a cualquier cliente de la agencia, incluido uno que NO contrató el módulo (US$80/mes). (c) Precondiciones: solo sesión válida de cliente; no hace falta rol admin, ni impersonation, ni conocer ids ajenos (la lista de destinatarios se puebla con el CSV del propio atacante). El daño no es cross-tenant (todo queda scopeado a su org) sino sobre el ACTIVO COMPARTIDO: reputación de envío, cuota y dominio de la cuenta Brevo de develOP, más el bypass del módulo pago. No lo subo más porque exige cuenta válida y porque el spoof de remitente puede rebotar si Brevo exige sender verificado (no verificable desde el repo).

**Mecanismo.** El módulo tiene DOS capas y solo una autoriza. `layout.tsx:20-21` resuelve la org y llama `isModuleActive(organizationId, 'email-marketing')`, redirigiendo a /dashboard si no está activo — pero eso es un redirect de RENDER, ejecutado cuando se pinta una página. Las tres server actions exportadas del mismo módulo (`importContactsAction`, `createCampaignAction`, `sendCampaignAction`) comparten un único preámbulo, `getOrgWithBrevo()`, que hace exclusivamente `resolveOrgId()` + lookup de la org: no vuelve a consultar `isModuleActive` en ningún punto de su camino de ejecución. El contra-ejemplo está en el repo: el otro módulo premium, motor-resenas, sí repite el gate dentro de cada action. Además el cuerpo de `createCampaignAction` no valida nada con Zod (lee 5 campos crudos del FormData) y ninguno de los tres tiene entrada en RATE_LIMIT_PRESETS, mientras que operaciones de email mucho menos potentes del panel admin (`sendExecutiveReportNowPerAdmin`, `testNotificationPerAdmin`, `resendCredentialsPerAdmin`) sí tienen preset propio.

**Evidencia.**

- `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:17-28`
  > async function getOrgWithBrevo() { const organizationId = await resolveOrgId(); if (!organizationId) redirect('/login'); const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true, companyName: true, brevoListId: true } }); if (!org) redirect('/login'); return org }
- `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:71,128,174`
  > export async function importContactsAction(formData: FormData) { const org = await getOrgWithBrevo() … } / export async function createCampaignAction(formData: FormData) { const org = await getOrgWithBrevo() … } / export async function sendCampaignAction(campaignId: string) { const org = await getOrgWithBrevo() … }  — ninguna vuelve a llamar isModuleActive
- `src/app/(protected)/dashboard/modules/email-marketing/layout.tsx:20-21`
  > const isActive = await isModuleActive(organizationId, 'email-marketing')
  if (!isActive) redirect('/dashboard')
- `src/components/dashboard/modules/motor-resenas/_actions.ts:23-24 y 58-59`
  > const isActive = await isModuleActive(organizationId, 'motor-resenas')
  if (!isActive) return { ok: false as const, error: 'Módulo no activo' }   // el mismo chequeo, DENTRO de cada action — patrón correcto del repo
- `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:131-137`
  > const name = (formData.get('name') as string | null)?.trim() … const fromEmail = (formData.get('fromEmail') as string | null)?.trim() … if (!name || !subject || !fromName || !fromEmail || !htmlContent) { return { error: 'Todos los campos son requeridos.' } }   // única validación: no-vacío
- `src/lib/integrations/brevo.ts:76`
  > sender: { name: params.fromName, email: params.fromEmail },   // remitente proveniente del input del cliente, firmado con la api-key única de process.env.BREVO_API_KEY (brevo.ts:4)
- `src/lib/rate-limit/presets.ts:8-70`
  > RATE_LIMIT_PRESETS … sendExecutiveReportNowPerAdmin / testNotificationPerAdmin / resendCredentialsPerAdmin … — no existe ningún preset para import/create/send de campañas

**Fix.** Extraer el gate a una función y llamarla dentro de `getOrgWithBrevo()` en src/app/(protected)/dashboard/modules/email-marketing/_actions.ts: tras resolver `organizationId`, `if (!(await isModuleActive(organizationId, EMAIL_MARKETING_SLUG))) return/redirect`, copiando literalmente el patrón de motor-resenas/_actions.ts:23-24. En el mismo pase: (1) usar la constante de slug compartida para no repetir el desalineamiento ya documentado del catálogo; (2) meter un `z.object` en `createCampaignAction` con `subject`/`name` acotados, `fromEmail: z.string().email()` y `htmlContent` con tope de longitud; (3) fijar el remitente server-side a un dominio propio de develOP (o a una allow-list por org) en vez de aceptarlo del FormData; (4) agregar dos presets a RATE_LIMIT_PRESETS (`emailCampaignSendPerOrg`, `emailContactImportPerOrg`) y llamarlos desde las actions, siguiendo el precedente de `crmRetryPerOrg`.

**Criterio de aceptación.** Con una org cuyo OrganizationModule para el módulo de email marketing NO está en status ACTIVE, invocar cada una de las tres actions devuelve el error de módulo inactivo y NO produce ninguna llamada saliente a api.brevo.com ni ninguna fila nueva en EmailContact/EmailCampaign. Además: un `fromEmail` fuera del dominio permitido es rechazado por el schema antes de tocar Brevo, y la sexta invocación consecutiva de sendCampaignAction dentro de la ventana devuelve el error de rate-limit. Cubrir con un invariante ejecutable hermano de src/lib/security/idor-tokens.invariant.ts, cableado en el agregado check:invariants.

**Necesita decisión de Franco.** Sí — dos decisiones: (a) qué remitente(s) se permiten por org (dominio fijo de develOP vs. allow-list verificada por cliente), porque eso define si el módulo puede seguir ofreciendo white-label; (b) el tope de envíos por org y por ventana, que es una decisión comercial además de técnica.

**Qué encontró el verificador.** Abrí las 7 citas y todas son reales y literales. `getOrgWithBrevo()` en src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:17-28 hace solo resolveOrgId + findUnique; leí el archivo COMPLETO (219 líneas) y `isModuleActive` no aparece ni una vez — las tres actions (:71, :128, :174) comparten ese preámbulo y nada más. El gate vive solo en layout.tsx:20-21, que es render-path. El contra-ejemplo es exacto: motor-resenas/_actions.ts:23-24 y :58-59 repiten el gate dentro de la action (y además usan resolveScopedOrgId). createCampaignAction:131-139 lee 5 campos crudos del FormData con única validación no-vacío; brevo.ts:2-7 arma el header con la única `process.env.BREVO_API_KEY` y :76 pasa `sender:{name,email}` del input. Leí presets.ts completo (líneas 8-75): existen sendExecutiveReportNowPerAdmin, resendCredentialsPerAdmin, testNotificationPerAdmin, crmRetryPerOrg, contactFormPerIp — ninguno para email-marketing. Busqué guards aguas arriba y NO los hay: el proxy no cubre server actions posteadas a rutas fuera del matcher, y la action corre antes del render del layout. No refutado.

**Corrección aplicada.** La severidad ALTO está inflada por dos motivos que verifiqué. (1) REACHABILITY: `grep -rn email-marketing` muestra que el catálogo declara slug 'email-marketing-pro' (premium-modules.ts:38) y el gate/sidebar consultan 'email-marketing' (layout.tsx:20, SidebarNav.tsx:78) — el mismo bug CLEAN-1.1-SLUG que ya está en el ledger. Consecuencia: isModuleActive devuelve false SIEMPRE, el layout redirige a TODOS y el ítem de sidebar no se pinta nunca, así que NO existe UI renderizada del módulo. Alcanzar las actions exige fabricar un POST con header Next-Action y el action-id sacado del chunk estático de la ruta — sigue siendo alcanzable, pero no es 'un cliente cualquiera hace click'. (2) El bypass del módulo pago que describe es sobre un gate que hoy deniega también a quien SÍ pagó. Además el 'spoof de remitente' depende de la verificación de sender de Brevo, que no es verificable desde el repo (el propio hallazgo lo admite). Lo que queda sólido y justifica MEDIO: tres mutaciones + una llamada saliente a la cuenta Brevo compartida de la agencia, sin gate de módulo, sin Zod y sin rate-limit, alcanzables por cualquier ORG_MEMBER. No hay cruce entre organizaciones: sendCampaignAction:177-181 filtra por organizationId y exige status DRAFT, e importContactsAction:86-87 upsertea con clave compuesta (organizationId,email). Sobre estado_vs_ledger: el hueco de gate a nivel action es NUEVO, pero la superficie ya figura en el ledger como CLEAN-1.1-SLUG — conviene reportarlo cruzado, no como hallazgo aislado.

### [S2b-04] El cambio de contraseña obligatorio es un gate solo de navegación: no cubre /api/* ni el camino de ejecución de ninguna server action, y todo cliente nuevo nace en ese estado

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Credenciales válidas de un usuario con passwordResetRequired = true (estado inicial de todo cliente creado desde el panel) |

**Impacto.** (a) Qué se logra: conservar acceso completo de lectura y escritura a los datos de la organización — incluido el export CSV de PII de leads y los PDF de informes — sin haber cambiado nunca la contraseña temporal que la agencia envió por email. (b) A quién: a quien tenga esas credenciales temporales, que viajan por correo y suelen ser el material más débil del ciclo de vida de la cuenta. (c) Precondiciones: credenciales válidas de una cuenta en estado passwordResetRequired. No es un bypass de autenticación: es la anulación del control compensatorio que existe justamente porque esas credenciales son débiles/compartidas. Lo relevante para la severidad es que NO es un estado de borde: las tres rutas de creación de clientes lo fijan en true, así que toda cuenta recién creada vive ahí hasta el primer cambio.

**Mecanismo.** El enforcement de `passwordResetRequired` existe en un solo lugar del repo: el bloque de proxy.ts que redirige a /cambiar-password. Ese bloque solo corre sobre los paths del `matcher` del proxy, que enumera /admin, /dashboard, /setter, /login, /bienvenida y /cambiar-password — /api/* no está. (La lista ALWAYS_ALLOWED incluye además '/api/' de forma explícita, es decir que la intención de exceptuar /api es deliberada, aunque el matcher ya lo excluía.) El censo del flag muestra que ninguna route handler y ninguna server action lo consulta: aparece en auth.ts (para poblar el token), en la propia pantalla de cambio, en el reset y en los tres sitios de creación que lo ponen en true, y en ningún guard de datos. Como consecuencia, una sesión emitida a una cuenta en estado forzado es una sesión plenamente funcional contra la capa de datos: solo se le niega la navegación HTML.

**Evidencia.**

- `src/proxy.ts:84-90`
  > if (
    isAuthenticated &&
    passwordResetRequired &&
    !ALWAYS_ALLOWED.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, nextUrl))
  }
- `src/proxy.ts:172`
  > matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password']   // /api/* fuera del matcher: el bloque de arriba nunca corre para las rutas de datos
- `src/proxy.ts:68`
  > const ALWAYS_ALLOWED = [CHANGE_PASSWORD_PATH, '/api/auth/', '/logout', '/api/']
- `comando: grep -rn "passwordResetRequired" src --include=*.ts --include=*.tsx`
  > 29 ocurrencias: auth.ts (token), auth.config.ts (sesión), types/next-auth.d.ts, cambiar-password/*, reset-password/actions.ts, profile.ts:239, qa/login, y los 3 sitios que lo ponen en true. Cero ocurrencias dentro de src/app/api/**/route.ts (salvo el que lo escribe) y cero dentro de cualquier función 'use server' de datos.
- `src/modules/chatbot/server/admin/createClientOnly.ts:94 · src/modules/chatbot/server/admin/createClientWithBot.ts:144 · src/lib/onboarding/core.ts:96`
  > passwordResetRequired: true,   // estado inicial de todo cliente creado desde el panel
- `src/app/api/dashboard/chatbot/leads/export/route.ts:84-87`
  > const session = await getClientChatbotSession()
  if (!session) { return new Response('Unauthorized', { status: 401 }) }   // no consulta passwordResetRequired

**Fix.** Mover el enforcement al chokepoint de sesión en vez de al de navegación: dentro del `requireClientOrgId()` propuesto en S2b-02 (y en el equivalente del lado admin/setter), rechazar cuando `session.user.passwordResetRequired === true`, devolviendo el mismo error genérico que el resto de los rechazos. Complementarlo con un guard en las route handlers de datos de /api/dashboard/* y /api/reports/* (un helper compartido `requireFreshCredentials(session)`), y dejar el redirect del proxy como está — es la capa de UX, no la de autorización.

**Criterio de aceptación.** Con una sesión válida de un usuario cuyo passwordResetRequired es true: GET /api/dashboard/chatbot/leads/export, GET /api/dashboard/leads/recent, GET /api/reports/client-monthly y GET /api/reports/monthly devuelven 401/403 sin cuerpo de datos; tras completar el cambio de contraseña, las mismas requests devuelven 200. Test de integración con las dos sesiones.

**Qué encontró el verificador.** Leí proxy.ts:60-115 completo. ALWAYS_ALLOWED está en :68 e incluye '/api/' literal; el bloque de forzado está en :83-90 (el hallazgo dice 84-90, off-by-one benigno) y el matcher en :172 confirma que /api/* nunca entra. Corrí yo el censo de `passwordResetRequired` sobre src: 28 ocurrencias en 15 archivos — auth.ts (token/authorize), auth.config.ts:37, next-auth.d.ts, cambiar-password/actions.ts, reset-password/actions.ts:73, profile.ts:239, qa/login, proxy.ts:75/:86, y los tres sitios que lo ponen en true (createClientOnly.ts:94, createClientWithBot.ts:144, onboarding/core.ts:96, más resend-credentials/route.ts:68 que lo re-arma). Cero lecturas dentro de un route handler de datos y cero dentro de una función de datos 'use server'. Busqué activamente un guard aguas arriba en el camino /api y no existe: export/route.ts:83-87 solo llama getClientChatbotSession. El estado inicial forzado en toda alta de cliente también es real.

**Corrección aplicada.** Una pata del mecanismo está sobre-declarada. El hallazgo afirma que el gate 'no cubre el camino de ejecución de NINGUNA server action'. Eso es falso para el caso normal: una server action se postea contra la ruta de la página que la monta, y /dashboard/:path*, /admin/:path* y /setter/:path* SÍ están en el matcher (proxy.ts:172) — el middleware corre ANTES del route handler, devuelve el redirect de :89 y la action nunca se ejecuta. El bypass por action solo aplica si el atacante postea el action-id contra una ruta fuera del matcher (p. ej. '/'), lo cual no pude cerrar por lectura de código y bajaría a PLAUSIBLE por sí solo. Lo que SÍ queda verificado y sostiene MEDIO es la pata /api: GET /api/dashboard/chatbot/leads/export (CSV de PII de leads, cap 10.000) y GET /api/dashboard/leads/recent son plenamente funcionales con una sesión en estado passwordResetRequired. El criterio de aceptación propuesto es correcto tal cual está.

### [S2b-02] Dos predicados divergentes de "el caller es un cliente del dashboard": resolveOrgId() (consciente del rol y de la impersonation) contra session.user.organizationId / getClientChatbotSession() (ciegos al rol, derivados solo de OrgMember) — y la superficie de PII del chatbot cuelga del segundo

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Poseer una fila OrgMember para la organización objetivo, cualquiera sea el User.role. No requiere ser ORG_MEMBER ni pasar por proxy.ts. |

**Impacto.** (a) Qué se expone: por el predicado ciego pasa toda la superficie de datos del chatbot — listado y detalle de leads con nombre/email/teléfono/mensaje, transcripciones completas de conversación, export CSV masivo (cap 10.000) y la mutación de estado del lead. (b) A quién: a cualquier principal que tenga UNA fila OrgMember, sin importar su `User.role`. (c) Precondiciones: hoy ese conjunto coincide exactamente con los ORG_MEMBER, porque en el seed ni el SUPER_ADMIN ni los SETTER reciben OrgMember — o sea que hoy falla cerrado por AUSENCIA DE DATOS, no por un guard. No es CRÍTICO porque no hay principal vivo que lo cruce; no es BAJO porque el gate de rol que el producto cree tener (proxy.ts:154) no gobierna esta superficie y basta una fila de membresía mal creada para que un SETTER o un futuro CLIENT lea PII de una org completa. Es además la razón por la que la impersonation no llega a esta superficie.

**Mecanismo.** El repo tiene dos raíces de sesión distintas para el mismo concepto. `resolveOrgId()` es explícitamente role-aware: devuelve la org solo si el rol es ORG_MEMBER, o si es SUPER_ADMIN Y hay cookie de impersonation; para CLIENT y SETTER devuelve null. `getClientChatbotSession()` y las ~13 actions que leen `session.user.organizationId` no miran el rol en absoluto: la org sale del primer OrgMember del usuario (en el caso de la sesión, poblada en auth.ts:42-45 por getUserAccessState, que tampoco filtra por rol). El resultado es que dentro del MISMO namespace /api/dashboard conviven las dos políticas: /api/dashboard/leads/recent usa auth()+resolveOrgId (role-aware) y /api/dashboard/chatbot/leads/export usa getClientChatbotSession (role-blind), y ninguna de las dos está cubierta por proxy.ts, cuyo matcher no incluye /api. La divergencia tiene además un segundo filo, ya visible hoy: durante una impersonation, `resolveOrgId()` devuelve la org impersonada mientras `session.user.organizationId` devuelve la del propio admin — si a un SUPER_ADMIN se le crea alguna vez una membresía, la pantalla mostraría los datos del cliente impersonado y las actions role-blind escribirían sobre la org del admin. El propio código documenta el efecto como si fuera una propiedad deseada.

**Evidencia.**

- `src/lib/preview.ts:6-20`
  > export const resolveOrgId = cache(async (): Promise<string | null> => { … if (role === 'ORG_MEMBER') return session?.user?.organizationId ?? null; if (role === 'SUPER_ADMIN') { const impersonation = await getImpersonationSession(); return impersonation?.orgId ?? null } return null })
- `src/modules/chatbot/server/admin/getClientSession.ts:5-27`
  > export const getClientChatbotSession = cache(async () => { const session = await auth(); if (!session?.user?.id) return null; const member = await unsafeGlobalQuery('AUTH-RESOLUTION: user→org via OrgMember …', (c) => c.orgMember.findFirst({ where: { userId: session.user.id }, … })); if (!member?.organization?.botConfig) return null; return { user: session.user, organization: member.organization, bot: member.organization.botConfig } })   // ningún chequeo de session.user.role
- `src/app/api/dashboard/chatbot/leads/export/route.ts:84-87`
  > const session = await getClientChatbotSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }   // único gate del export CSV de PII de leads
- `src/app/api/dashboard/leads/recent/route.ts:10-19`
  > const session = await auth(); if (!session?.user) { return NextResponse.json({ leads: [] }, { status: 401 }) } const orgId = await resolveOrgId()   // el MISMO namespace /api/dashboard, con el predicado role-aware
- `src/proxy.ts:154,172`
  > if (isDashboardRoute && role !== USER_ROLE && !(role === ADMIN_ROLE && isImpersonating)) { … }  ·  matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password']   // /api/* nunca entra al proxy
- `src/auth.ts:42-46`
  > const membership = dbUser?.orgMemberships[0]  … const organizationId = membership?.organizationId   // la org de la sesión se deriva de la membresía sin consultar el rol
- `src/lib/actions/gbp-connection.ts:15`
  > * SUPER_ADMIN no tiene organizationId → no puede usarlo; es self-service del dueño.   // el código documenta que el predicado ciego depende de que el admin NO tenga membresía
- `comando: grep -rln "session?.user?.organizationId|session.user.organizationId" src`
  > src/actions/dashboard-actions.ts · src/actions/task-approvals.ts · src/app/api/track/route.ts · src/lib/actions/announcements.ts · src/lib/actions/gbp-connection.ts · src/lib/actions/messages.ts · src/lib/actions/notifications.ts · src/lib/actions/profile.ts · src/lib/actions/referrals.ts · src/lib/actions/upsell.ts (+ auth.ts/auth.config.ts/preview.ts que lo definen) — 30 ocurrencias

**Fix.** Unificar en un solo chokepoint. Agregar a src/lib/preview.ts un `requireClientOrgId()` que devuelva `{ organizationId, userId }` o null aplicando la política única (rol ORG_MEMBER, o SUPER_ADMIN con impersonation activa) y migrar a él: (a) `getClientChatbotSession()` en src/modules/chatbot/server/admin/getClientSession.ts — que además resolvería el hueco de impersonation en todo /dashboard/chatbot; (b) los 10 archivos de actions que hoy leen `session.user.organizationId` a mano. Dejar `session.user.organizationId` como dato de presentación, nunca como decisión de autorización, y agregar un guard de lint (mismo mecanismo que el guard de aislamiento ya existente) que prohíba leerlo fuera de src/auth.ts y src/lib/preview.ts.

**Criterio de aceptación.** (1) Un usuario cuyo User.role no sea ORG_MEMBER pero que tenga una fila OrgMember recibe 401 en GET /api/dashboard/chatbot/leads/export y no obtiene datos de las páginas de /dashboard/chatbot. (2) Un SUPER_ADMIN con impersonation activa sobre la org X sí obtiene el export de X (hoy da 401), y las actions de perfil/notificaciones/referidos escriben sobre X y no sobre la org propia del admin. (3) `grep -rn "session.user.organizationId" src --include=*.ts` fuera de auth.ts/auth.config.ts/preview.ts devuelve 0. Cubrir 1 y 2 con un test de integración por rol.

**Necesita decisión de Franco.** Sí — decidir si la impersonation DEBE alcanzar la superficie del chatbot (hoy no llega, fail-closed). Es una decisión de producto sobre el alcance del "modo soporte", y determina si el fix de getClientChatbotSession amplía o restringe.

**Qué encontró el verificador.** Verifiqué las 8 citas una por una y todas son textuales. src/lib/preview.ts:6-20 es exactamente el predicado role-aware (ORG_MEMBER → org de sesión; SUPER_ADMIN → solo con impersonation; :19 `return null` para todo lo demás). src/modules/chatbot/server/admin/getClientSession.ts:5-34 leído completo: NO hay ninguna lectura de session.user.role, la org sale de orgMember.findFirst dentro de unsafeGlobalQuery. export/route.ts:83-87 es el único gate del CSV de leads. leads/recent/route.ts:10-19 usa el predicado role-aware en el MISMO namespace. proxy.ts:154 y el matcher :172 confirmados (leí el bloque 60-180): /api no está en el matcher. auth.ts:42-46 deriva organizationId de orgMemberships[0] sin mirar rol. Mi grep dio 13 archivos / 32 ocurrencias (el hallazgo dijo 30, diferencia menor, mismo set de archivos). La divergencia de predicados es real.

**Corrección aplicada.** MEDIO está por encima de lo que la evidencia sostiene. Fui a buscar el contra-argumento y lo encontré en los datos: censé TODOS los sitios que crean OrgMember (clients.ts:130, invitations.ts:89, onboarding/core.ts:101, createClientOnly.ts:99, createClientWithBot.ts:149) y los cinco crean el User con `role: Role.ORG_MEMBER` en la misma transacción — no existe ningún camino de código que produzca un OrgMember para un SUPER_ADMIN, CLIENT o SETTER. Y prisma/seed.ts:136-139 lo documenta como decisión explícita: 'LeadOS B1 — setter de prueba. SIN OrgMember a propósito: el setter opera fuera del modelo multi-tenant'. O sea: no es una ausencia accidental de datos, es una invariante de diseño escrita. Hoy el conjunto de principals que cruzan el predicado ciego es exactamente {ORG_MEMBER}, idéntico al del predicado role-aware: cero datos expuestos, cero acciones logradas, cero principal vivo que lo atraviese. Lo que queda es deuda de defensa-en-profundidad real (el gate es por forma de los datos, no por guard) más el segundo filo de la impersonation, que falla CERRADO (un SUPER_ADMIN no tiene organizationId → las actions role-blind abortan). Eso es BAJO por impacto, aunque el fix propuesto (chokepoint único) sigue siendo el correcto.

### [S2b-03] El rol CLIENT es un valor fantasma: existe en el enum de Prisma y en la unión de tipos, no se asigna en ningún punto del código, y las superficies que lo rechazan lo hacen por dos caminos distintos — uno de ellos por ausencia de datos, no por guard

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Que un usuario reciba User.role = CLIENT (por script, seed, migración o edición manual de la DB) y tenga una fila OrgMember |

**Impacto.** (a) Qué habilita: no hay hoy ningún dato expuesto — es una celda vacía de la matriz. El riesgo es de contrato: `Role.CLIENT` es un valor legal del enum, un `prisma.user.update({ data: { role: 'CLIENT' } })` o un seed futuro lo produce sin error, y el sistema quedaría partido en dos — expulsado de las páginas de /dashboard (proxy.ts:154 y el redirect del layout), pero admitido por las ~13 server actions role-blind y por toda la superficie /api que cuelga de OrgMember (ver S2b-02), que es donde vive la PII. (b) A quién: a quien reciba ese rol. (c) Precondiciones: que alguien lo asigne. Lo dejo en MEDIO y no en BAJO porque el rol NO está muerto en el esquema (es asignable y persistible) y porque la única razón por la que hoy no hay una escalada es que nadie lo usó, no que algo lo impida.

**Mecanismo.** El enum de Prisma declara cuatro roles y el tipo de auth.config declara la misma unión; el censo de asignaciones muestra que solo se escriben tres (SUPER_ADMIN, ORG_MEMBER, SETTER): las tres rutas de creación de clientes fijan ORG_MEMBER duro, el provider Google fija ORG_MEMBER, y los setters se crean solo desde seeds/scripts. CLIENT no aparece como valor asignado en src/, prisma/ ni scripts/. Del lado del enforcement, el rechazo no es uniforme: proxy.ts:154 lo rechaza EXPLÍCITAMENTE por el `role !== USER_ROLE`, y el layout del dashboard lo rechaza por consecuencia (resolveOrgId devuelve null en su rama final y el layout redirige) — ambos correctos. Pero las actions de src/lib/actions/* y src/actions/* y la raíz getClientChatbotSession no consultan el rol en ningún punto, así que su rechazo depende exclusivamente de que ningún usuario CLIENT tenga membresía. El valor fantasma también hace que la matriz de roles sea inauditable: no existe ningún test ni invariante que enumere los 4 roles contra las superficies.

**Evidencia.**

- `prisma/schema.prisma:12-17`
  > enum Role {
  SUPER_ADMIN
  ORG_MEMBER
  CLIENT
  SETTER
}
- `src/auth.config.ts:4`
  > type Role = 'SUPER_ADMIN' | 'ORG_MEMBER' | 'CLIENT' | 'SETTER'
- `comando: grep -rn "role: *Role\.|role: *'SUPER_ADMIN'|role: *'ORG_MEMBER'|role: *'SETTER'|role: *'CLIENT'" src prisma/seed.ts prisma/seed-agency-os.ts scripts`
  > 40 sitios de asignación/consulta; los de escritura son src/auth.ts:129 (ORG_MEMBER), src/lib/actions/clients.ts:119 (ORG_MEMBER), src/lib/actions/invitations.ts:79 (ORG_MEMBER), src/lib/onboarding/core.ts:94 (ORG_MEMBER), createClientOnly.ts:92 y createClientWithBot.ts:142 (ORG_MEMBER), prisma/seed.ts:87/94 (SUPER_ADMIN), :104/111/124/131 (ORG_MEMBER), :155/163 (SETTER). Cero escrituras de CLIENT.
- `src/proxy.ts:154`
  > if (isDashboardRoute && role !== USER_ROLE && !(role === ADMIN_ROLE && isImpersonating)) { return NextResponse.redirect(new URL(role === ADMIN_ROLE ? ADMIN_PATH : LOGIN_PATH, nextUrl)) }   // USER_ROLE = 'ORG_MEMBER' (proxy.ts:14): CLIENT es rechazado explícitamente
- `src/app/(protected)/dashboard/layout.tsx:90-92`
  > if (!organizationId) {
    redirect(session?.user?.role === 'SUPER_ADMIN' ? '/admin/clients' : '/login')
  }   // segundo cinturón para CLIENT, vía la rama final de resolveOrgId
- `src/lib/preview.ts:19`
  > return null   // rama final: cualquier rol que no sea ORG_MEMBER ni SUPER_ADMIN — incluye CLIENT y SETTER

**Fix.** Elegir una de dos y ejecutarla completa. (A) Si CLIENT no es un rol del producto: borrarlo de `enum Role` en prisma/schema.prisma con una migración (previa verificación de que no hay filas con ese valor) y de la unión en src/auth.config.ts:4 — así el compilador y la DB impiden que reaparezca. (B) Si se piensa usar más adelante: dejarlo, pero cerrar el hueco con el fix de S2b-02 (predicado único role-aware) y agregar un invariante ejecutable que, para cada uno de los 4 valores del enum, afirme el veredicto esperado en cada superficie (páginas, actions, /api), de modo que agregar un rol nuevo rompa el check en vez de abrir una puerta.

**Criterio de aceptación.** Opción A: `grep -rn "CLIENT" prisma/schema.prisma src/auth.config.ts` no devuelve el valor de rol, y `npx prisma migrate status` queda limpio tras la migración. Opción B: existe un archivo *.invariant.ts cableado en check:invariants que recorre los 4 roles y falla si alguna superficie de datos del dashboard acepta un rol distinto de ORG_MEMBER (o SUPER_ADMIN impersonando).

**Necesita decisión de Franco.** Sí — Franco tiene que decidir si CLIENT es un rol previsto del producto (por ejemplo, un usuario de solo-lectura de una org) o un residuo de diseño. La auditoría no puede decidirlo: no hay ningún artefacto en el repo que lo describa.

**Qué encontró el verificador.** Verifiqué los hechos: prisma/schema.prisma:12-17 declara los 4 valores incluido CLIENT; src/auth.config.ts:4 replica la unión. Corrí el grep yo mismo sobre src, prisma y scripts: las únicas apariciones de la cadena 'CLIENT' fuera de esos dos archivos son projects-filters.ts:19,23,219, que es un VisibilityFilter de proyectos ('ALL'|'CLIENT'|'INTERNAL') y no tiene nada que ver con Role. Cero asignaciones de Role.CLIENT en todo el árbol. Confirmé también los dos rechazos: proxy.ts:14 define USER_ROLE='ORG_MEMBER' y :154 rechaza explícitamente, y dashboard/layout.tsx:90-92 redirige vía la rama final de preview.ts:19.

**Corrección aplicada.** MEDIO no se sostiene contra el criterio de impacto real del encargo. El propio hallazgo admite que 'no hay hoy ningún dato expuesto — es una celda vacía de la matriz'. La precondición que declara ('que alguien lo asigne por script, seed, migración o edición manual de la DB') implica capacidad de escritura directa sobre la base de producción; un actor con esa capacidad no necesita un rol fantasma para leer PII, la lee de la tabla. No hay input alcanzable desde ninguna superficie HTTP que produzca role=CLIENT. Es un defecto de contrato/higiene de esquema legítimo (y el fix A —borrarlo del enum y de la unión— es correcto y barato), pero como hallazgo de seguridad su severidad honesta es BAJO. Nota adicional: el candado tipo que propone la opción B es parcialmente ficción hoy, porque el ledger ya registra que next.config.ts tiene ignoreBuildErrors/ignoreDuringBuilds y nada typechequea el repo en CI.

### [S2b-05] completeOnboardingAction guarda credenciales de dominio/hosting y de redes sociales EN CLARO en ClientAsset.description, escribiendo el literal url: 'ENCRIPTADO_EN_TEXTO' que afirma un cifrado que no ocurre

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Cualquier ORG_MEMBER autenticado (escribe solo sobre su propia org). Hoy sin superficie de UI que lo dispare. |

**Impacto.** (a) Qué dato: credenciales de acceso a infraestructura de TERCEROS — panel de dominio/hosting y cuentas de redes sociales de cada cliente — persistidas en texto plano en una columna Text de Postgres, sin cifrado, y por lo tanto presentes también en cualquier backup, dump o export de la DB. (b) A quién queda expuesto: a todo el que llegue a la fila — el panel admin, cualquier operador con acceso a Neon, y cualquier copia de la base; el aislamiento entre orgs sí se respeta (la org sale de resolveOrgId). (c) Precondiciones: que el flujo se ejecute. Hoy la action no tiene ningún caller de UI (el wizard importa solo `saveOnboardingProfile` del mismo archivo), así que no hay credenciales acumuladas por esta vía — por eso MEDIO y no ALTO. Pero el módulo SÍ está en el grafo de módulos por ese import, y el mismo modelo ClientAsset es el que usa la bóveda del admin, que tampoco cifra. El agravante que sube esto por encima de BAJO es el literal 'ENCRIPTADO_EN_TEXTO': un futuro lector del código o del panel concluye que el dato está protegido cuando no lo está.

**Mecanismo.** El bloque de credenciales del onboarding crea dos filas ClientAsset poniendo el secreto crudo en `description` y una cadena constante en `url`. El modelo ClientAsset declara `description String? @db.Text` sin ningún tratamiento. El repo tiene dos primitivas de cifrado reversible funcionando (AES-256-GCM), pero ninguna se usa acá: `src/modules/chatbot/server/crm/encryptSecret.ts` la usa saveCrmIntegration para el secreto del webhook CRM, y `src/lib/crypto/secret-box.ts` la usa el motor para la API key del canal. Es decir: el patrón correcto existe, está probado en el mismo árbol, y este camino no lo adopta. La cadena 'ENCRIPTADO_EN_TEXTO' aparece exactamente dos veces en todo src/, ambas en este bloque.

**Evidencia.**

- `src/actions/onboarding-actions.ts:110-132`
  > if (data.domainCredentials) { await tx.clientAsset.create({ data: { organizationId, name: 'Credenciales de Dominio/Hosting', url: 'ENCRIPTADO_EN_TEXTO', type: 'ACCESS', description: data.domainCredentials } }) } … if (data.socialCredentials) { … url: 'ENCRIPTADO_EN_TEXTO', … description: data.socialCredentials … }
- `prisma/schema.prisma:734-747`
  > model ClientAsset {
  id          String    @id @default(cuid())
  name        String
  url         String
  type        AssetType @default(OTHER)
  description String?   @db.Text   // sin cifrado, sin marca de secreto
- `comando: grep -rn "encryptSecret|secret-box" src --include=*.ts`
  > solo src/lib/crypto/secret-box.ts, src/modules/chatbot/server/crm/encryptSecret.ts, saveCrmIntegration.ts:113 (`const enc = encryptSecret(data.secret)`), postToN8n.ts y src/modules/motor/services/sendMessage.ts:22 — ninguna referencia desde onboarding ni desde la bóveda de ClientAsset
- `comando: grep -rn "actions/onboarding-actions" src`
  > src/components/onboarding/OnboardingWizard.tsx:6: import { saveOnboardingProfile } from '@/actions/onboarding-actions'   // único importador: trae la OTRA export del archivo; completeOnboardingAction no tiene caller
- `src/actions/onboarding-actions.ts:79-86`
  > export async function completeOnboardingAction(data: OnboardingData) { const session = await auth(); const organizationId = await resolveOrgId(); if (!organizationId) { return { success: false, error: 'No autorizado' } }   // el aislamiento por org sí está; lo que falta es el tratamiento del secreto

**Fix.** Decidir primero si el producto debe custodiar credenciales de terceros. Si NO: borrar el bloque 110-132 de src/actions/onboarding-actions.ts y los campos domainCredentials/socialCredentials de la interfaz OnboardingData (líneas 32-33), y reemplazarlos por una instrucción de compartirlas por un canal efímero fuera del panel. Si SÍ: cifrar con la primitiva que ya existe — `createSecretBox` de src/lib/crypto/secret-box.ts, con su propia env key — persistiendo el ciphertext/iv/authTag en columnas nuevas del modelo (no en `description`), marcando la fila con un campo booleano de secreto, y eliminando la cadena 'ENCRIPTADO_EN_TEXTO' en los dos sitios donde miente. En cualquiera de los dos caminos, revisar también createClientAssetAction (src/actions/agency-actions.ts:94), que escribe el mismo modelo desde el panel admin.

**Criterio de aceptación.** `grep -rn "ENCRIPTADO_EN_TEXTO" src` devuelve 0. Y, si se toma el camino de custodiar: un SELECT sobre la tabla client_asset de una fila creada por el flujo no devuelve ningún secreto legible, y existe un test que cifra y descifra ida y vuelta con la env key dedicada, al estilo del que ya cubre encryptSecret.

**Necesita decisión de Franco.** Sí — decisión de producto y de exposición legal: ¿develOP quiere ser custodio de credenciales de hosting y redes de sus clientes? Bajo Ley 25.326 eso agrega una categoría de dato a proteger y una obligación de resguardo; la alternativa (no guardarlas) elimina el riesgo de raíz.

**Qué encontró el verificador.** Las citas son exactas hasta el número de línea. Verifiqué en src/actions/onboarding-actions.ts: :110 `if (data.domainCredentials)`, :115 y :127 `url: 'ENCRIPTADO_EN_TEXTO'`, :117 y :129 `description: data.domainCredentials/socialCredentials`, y :32-33 los campos de OnboardingData. `grep -rn ENCRIPTADO_EN_TEXTO src` devuelve exactamente 2 hits, ambos en ese archivo. prisma/schema.prisma:734-747 confirma `description String? @db.Text` sin tratamiento. El grep de importadores da un único resultado — OnboardingWizard.tsx:6 importa saveOnboardingProfile, la OTRA export — así que completeOnboardingAction no tiene caller de UI, tal como declara. El aislamiento por org sí está (:80-84, resolveOrgId). También verifiqué la alternativa que menciona: createClientAssetAction en agency-actions.ts:94-111 exige role SUPER_ADMIN y no es un camino de credenciales específico.

**Corrección aplicada.** MEDIO está un escalón alto. Lo que verifiqué recorta el impacto a casi nada hoy: sin caller de UI no hay ninguna credencial acumulada por esta vía, y cuando la action se invoca a mano el escritor solo puede plantar texto en su PROPIA organización (organizationId sale de resolveOrgId, no del input) — es auto-infligido, no una fuga. El agravante real es de otra clase: el literal 'ENCRIPTADO_EN_TEXTO' documenta una protección inexistente y es una mina para el próximo que cablee el wizard. Matizo un punto del mecanismo a favor del hallazgo: el archivo SÍ está en el grafo de módulos (por el import de saveOnboardingProfile), así que Next emite action-id para completeOnboardingAction y el endpoint existe aunque no haya botón — eso es correcto tal como lo describe, y es lo que impide bajarlo a mera higiene de código muerto. La decisión humana que plantea (¿custodiar credenciales de terceros?) es la parte de más valor del hallazgo.

### [S2b-06] Dos módulos de server actions huérfanos (task-approvals.ts y metrics-actions.ts) duplican caminos ya resueltos con guards MÁS DÉBILES: sin Zod, sin tope en el texto libre, y permitiendo al cliente una transición de estado que el camino vivo reserva a SUPER_ADMIN

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Que algún archivo del árbol importe estos módulos (hoy ninguno lo hace) más una sesión ORG_MEMBER de la org dueña de la task |

**Impacto.** (a) Qué se lograría: poner una Task de la propia org en PENDING_APPROVAL sin ser admin, y persistir un `rejectionReason` sin límite de longitud que además se interpola en el título/mensaje de una Notification que lee el equipo. (b) A quién: a un ORG_MEMBER de la propia org — no hay cruce entre organizaciones, el chequeo `task.project.organizationId !== session.user.organizationId` está presente en las tres funciones. (c) Precondiciones: además de la sesión, que el módulo sea alcanzable — y hoy ningún archivo lo importa, así que no forma parte del grafo de la app. Por eso BAJO y no MEDIO: el impacto actual es cero y el daño potencial es acotado a la propia org. Lo reporto porque es una mina: un solo import lo re-arma, y quien lo importe razonablemente asumirá que la versión con menos ceremonia es la buena.

**Mecanismo.** src/actions/task-approvals.ts implementa aprobar/rechazar/pedir-aprobación de tasks, y src/actions/dashboard-actions.ts implementa lo mismo con más candados: Zod (TaskApprovalSchema / TaskRejectionSchema), chequeo de `approvalStatus`, transacción y notificación. El par huérfano valida `reason` solo con un trim no-vacío, sin tope de longitud, y lo concatena en el texto de la notificación. La asimetría más notoria es `requestTaskApproval`: mueve la task a PENDING_APPROVAL exigiendo únicamente pertenencia a la org del caller, mientras que la única vía viva de esa transición, `sendTaskForApprovalAction` en src/lib/actions/projects.ts, empieza con `await requireSuperAdmin()`. O sea, el módulo huérfano contiene una versión del mismo cambio de estado con el gate de rol quitado. metrics-actions.ts está en la misma situación (sin importadores) aunque su guard sí es SUPER_ADMIN.

**Evidencia.**

- `comando: grep -rn "actions/task-approvals" src --include=*.ts --include=*.tsx (excluyendo el propio archivo)`
  > (sin resultados) — idem para "actions/metrics-actions"
- `src/actions/task-approvals.ts:7-25`
  > export async function requestTaskApproval(taskId: string) { const session = await auth(); if (!session?.user?.organizationId) throw new Error('Unauthorized') … await prisma.task.update({ where: { id: taskId }, data: { approvalStatus: 'PENDING_APPROVAL' } })
- `src/lib/actions/projects.ts:177-178`
  > export async function sendTaskForApprovalAction(formData: FormData): Promise<void> {
  await requireSuperAdmin()   // la MISMA transición, en el camino vivo, exige super-admin
- `src/actions/task-approvals.ts:85-93`
  > export async function rejectTask(taskId: string, reason: string) { … if (!reason || reason.trim() === '') { throw new Error('Reason is required') }   // única validación: no-vacío; sin tope de longitud
- `src/actions/dashboard-actions.ts:108-111`
  > const parsed = TaskRejectionSchema.safeParse({ taskId, reason })
  if (!parsed.success) { return { success: false, error: parsed.error.issues[0]?.message } }   // el camino vivo sí valida con Zod

**Fix.** Borrar src/actions/task-approvals.ts y src/actions/metrics-actions.ts. Ambos están cubiertos: las tres funciones de task-approvals por approveTaskAction/rejectTaskAction de src/actions/dashboard-actions.ts más sendTaskForApprovalAction de src/lib/actions/projects.ts; upsertBusinessMetrics por el panel admin si alguna vez se necesita (hoy no lo llama nadie). Si se prefiere no borrar todavía, agregarlos a la lista de dead code del pase de limpieza pendiente, pero con nota explícita de que son 'use server' y no simple código muerto de librería.

**Criterio de aceptación.** Los dos archivos no existen y `npx tsc --noEmit` sigue en cero errores; `npx knip` no reporta referencias colgadas. Como regla duradera: agregar al pipeline de limpieza un chequeo que falle si un archivo con la directiva 'use server' no tiene ningún importador.

**Qué encontró el verificador.** Corrí el grep de importadores sobre src, tests y scripts para 'task-approvals' y 'metrics-actions': cero resultados, ni siquiera en tests. Leí src/actions/task-approvals.ts entero (136 líneas): requestTaskApproval:7-25 efectivamente solo exige `session.user.organizationId` y pertenencia (`task.project.organizationId !== session.user.organizationId`, :16), y rejectTask:85-93 valida `reason` con trim no-vacío sin tope. Verifiqué la asimetría central en el camino vivo: src/lib/actions/projects.ts:177-178 arranca `sendTaskForApprovalAction` con `await requireSuperAdmin()`. Y dashboard-actions.ts:107-111 sí usa TaskRejectionSchema.safeParse. La asimetría de rol es real.

**Corrección aplicada.** Dos correcciones al texto, ninguna fatal. (1) El contraste está exagerado: el hallazgo presenta el módulo huérfano como si le faltaran 'chequeo de approvalStatus, transacción y notificación' frente al vivo — falso, los tiene los tres (task-approvals.ts:52-54 y :104-106 chequean PENDING_APPROVAL, :56-77 y :108-130 usan $transaction y crean Notification). La única asimetría real es requestTaskApproval sin requireSuperAdmin, más la ausencia de Zod y de tope de longitud en `reason`. (2) A favor de bajar aún más el riesgo actual: con CERO importadores el archivo no entra al grafo de módulos, así que Next no emite action-id y hoy no existe endpoint alguno — a diferencia de onboarding-actions.ts (S2b-05), que sí está en el grafo. Es decir, el impacto presente es literalmente nulo y el hallazgo es de higiene/mina latente. BAJO es la severidad correcta y el fix (borrar ambos archivos + chequeo de 'use server' sin importador en el pipeline de limpieza) es el adecuado.

### [S2b-07] /api/track: escritura ilimitada de filas PageView por cualquier usuario autenticado, con `url` sin validación de forma ni de longitud y sin rate-limit ni preset

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Cualquier sesión autenticada (session.user.id presente) |

**Impacto.** (a) Qué se logra: inflar la tabla PageView de la propia organización con filas arbitrarias y strings de longitud no acotada, ensuciando las métricas que alimentan el panel y los informes PDF mensuales del cliente, y consumiendo almacenamiento de Neon. (b) A quién afecta: a los datos de la propia org (el organizationId se deriva de la sesión para ORG_MEMBER) y al costo/salud de la base compartida. (c) Precondiciones: cualquier sesión autenticada. No hay cruce de tenants por esta vía en el camino del cliente. BAJO porque no expone datos ni permite acciones sobre otra org; lo reporto porque es el único endpoint de escritura del recorte sin ninguna cota, en un repo que sí tiene una tabla de rate-limit atómica y presets para superficies mucho menos escribibles.

**Mecanismo.** El handler autentica, deriva la org y hace `prisma.pageView.create` con `url: String(data?.url ?? '')`. `url` no pasa por Zod, no se chequea que sea una URL ni que sea un path del propio sitio, y no tiene tope de longitud; `duration` se coacciona con Number(). No hay llamada a checkRateLimit ni entrada en RATE_LIMIT_PRESETS para esta superficie, a diferencia del formulario de contacto público (contactFormPerIp) o de los botones del CRM del dashboard (crmRetryPerOrg / crmTestPerOrg). El endpoint tampoco está cubierto por el proxy, cuyo matcher excluye /api.

**Evidencia.**

- `src/app/api/track/route.ts:20-39`
  > const url = String(data?.url ?? '')
    const duration = data?.duration
    … if (!organizationId || !url) { … }
    await prisma.pageView.create({ data: { organizationId, url, duration: typeof duration === 'number' ? duration : Number(duration) || null } })
- `src/lib/rate-limit/presets.ts:8-70`
  > RATE_LIMIT_PRESETS = { … contactFormPerIp: { limit: 5, windowMs: 15 * 60_000 } … crmRetryPerOrg: { limit: 10, windowMs: 60_000 } … }   // no hay preset de tracking
- `comando: grep -rn "checkRateLimit" src --include=*.ts`
  > 12 call sites: chat route, motor webhook, contact.ts, client-notifications, auth-rate-limit, retryCrmSync, testCrmConnection, sendTestNotification, handleChatRequest — /api/track no está entre ellos

**Fix.** En src/app/api/track/route.ts: (1) parsear el body con un `z.object({ url: z.string().max(2048), duration: z.number().int().nonnegative().max(86_400).optional() })` y rechazar con 400; (2) restringir `url` a un path relativo del propio sitio (empieza con '/', no empieza con '//') reusando la misma comprobación que ya existe en proxy.ts:18-20 para callbackUrl; (3) agregar `trackPerUser` a RATE_LIMIT_PRESETS y llamarlo con clave por userId, siguiendo el precedente de crmRetryPerOrg.

**Criterio de aceptación.** POST /api/track con un `url` de 100 KB, con un `url` absoluto a un dominio ajeno, o con `duration` no numérico devuelve 400 y no crea fila. Superado el límite del preset, el mismo POST devuelve el error de rate-limit. Cero filas PageView nuevas en los tres casos.

**Qué encontró el verificador.** Leí src/app/api/track/route.ts completo (46 líneas). :20 `const url = String(data?.url ?? '')` sin Zod, sin validación de forma ni tope; :29 solo exige no-vacío; :33-39 el create con `duration` coaccionado por Number(). El gate es únicamente `session?.user?.id` (:11-14). Confirmé en presets.ts (leí las 75 líneas) que no hay ningún preset de tracking, y grepeé checkRateLimit: los call sites son chat/motor/contact/client-notifications/auth-rate-limit/retryCrmSync/testCrmConnection/sendTestNotification — /api/track no está. El matcher del proxy (:172) confirma que la ruta no pasa por el guard. Busqué un guard aguas arriba (wrapper, helper) y no existe: el handler es autocontenido.

**Corrección aplicada.** Severidad BAJO correcta y bien justificada: para ORG_MEMBER la org sale de la sesión (:27), no del body, así que no hay cruce de tenants por esta vía. Una corrección de encuadre, no de fondo: estado_vs_ledger 'NUEVO' es discutible — el ledger ya tiene SEC-AUTH-05 sobre ESTE MISMO endpoint ('/api/track POST acepta organizationId arbitrario para SUPER_ADMIN sin validar existencia', slice S3), que el propio código reconoce en el comentario :16-18 y ejerce en :22-27. El defecto que reporta S2b-07 (escritura sin cota, `url` sin validar, sin rate-limit) es distinto del ya documentado, pero conviene reportarlo como defecto nuevo sobre superficie ya inventariada, no como superficie nueva.

### [S2b-08] Las dos bajas de suscripción mutan estado por GET sin paso de confirmación: un prefetch o un escáner de seguridad de correo dispara la baja sin intención del destinatario

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Que el email llegue a un buzón cuyo gateway/cliente siga los enlaces del mensaje (comportamiento habitual de escáneres corporativos y de algunos proxies de correo) |

**Impacto.** (a) Qué se logra: dar de baja a un contacto de una campaña, o a una organización del reporte ejecutivo semanal, sin acción deliberada del usuario. (b) A quién: al destinatario del email, cuyo gateway corporativo, antivirus de correo o proxy de imágenes recorre los links del mensaje. (c) Precondiciones: ninguna del lado del atacante — no hace falta atacante en absoluto; el disparo es accidental y de terceros legítimos. El impacto es una pérdida de canal de comunicación, reversible desde el panel en el caso del reporte ejecutivo. BAJO: no hay exposición de datos y la operación es idempotente. Marcado CAMBIO_DE_ESTADO porque el hallazgo heredado sobre estos links (F7, 'link de unsubscribe sin HMAC') está CERRADO — ambos endpoints ahora firman y verifican con HMAC y timingSafeEqual —; lo que queda vivo es el método HTTP, que es un residuo distinto.

**Mecanismo.** `/api/email/optout/[contactId]` expone solo GET y, tras verificar el token, ejecuta el updateMany que marca `optedOut: true`. `/api/email/unsubscribe-executive` expone GET y POST contra el mismo handler, y el GET también escribe (`executiveReportOptOut: true`). El comentario del segundo endpoint cita correctamente RFC 8058 como motivo del POST, pero deja el GET escribiendo igual, y el primero directamente no tiene POST. En ambos casos no hay pantalla intermedia de confirmación: la primera request que llega con token válido ya consuma la baja. El token no expira ni se revoca (es un HMAC determinístico del id) y en el caso del opt-out por contacto viaja además persistido como atributo del contacto en Brevo, así que la capacidad de disparar la baja es permanente.

**Evidencia.**

- `src/app/api/email/optout/[contactId]/route.ts:69,91-94`
  > export async function GET(req: Request, { params }: …) { … await prisma.emailContact.updateMany({ where: { id: contactId }, data: { optedOut: true, optedOutAt: new Date() } })   // mutación en el propio GET, sin confirmación
- `src/app/api/email/unsubscribe-executive/route.ts:74-78,103-111`
  > await prisma.organization.update({ where: { id: orgId }, data: { executiveReportOptOut: true } }) … export async function GET(request: Request) { return handle(request) } … export async function POST(request: Request) { return handle(request) }
- `src/lib/email/unsubscribe-token.ts:97-109`
  > export function verifyEmailContactOptOutToken(contactId: string, token: string): boolean { … return timingSafeEqual(Buffer.from(expected), Buffer.from(token)) }   // el HMAC (cierre de F7) está bien hecho; sin expiración ni revocación
- `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:113-116`
  > attributes: { CONTACT_ID: contact.id, OPTOUT_TOKEN: signEmailContactOptOutToken(contact.id) }   // el token queda persistido en Brevo como atributo del contacto

**Fix.** Convertir ambos GET en una página de confirmación de un click: el GET renderiza el HTML que ya existe pero con un formulario que hace POST al mismo endpoint, y solo el POST escribe. Mantener el POST directo sin confirmación para el caso RFC 8058 del header List-Unsubscribe-Post (que Gmail/Apple Mail envían con `List-Unsubscribe=One-Click` en el body), distinguiéndolo por ese campo. Es un cambio acotado a los dos route.ts, sin tocar el módulo de tokens.

**Criterio de aceptación.** GET a cualquiera de las dos URLs con token válido devuelve 200 con la página de confirmación y NO cambia optedOut / executiveReportOptOut en la DB; el POST del formulario (o el POST one-click con el campo RFC 8058) sí lo cambia. Verificable con dos requests y un SELECT sobre la fila.

**Qué encontró el verificador.** Verifiqué ambos handlers. En src/app/api/email/optout/[contactId]/route.ts el GET está en :69 y el updateMany que escribe optedOut en :91-94, dentro del propio GET y sin pantalla intermedia. En src/app/api/email/unsubscribe-executive/route.ts el update de executiveReportOptOut está en :75-78 dentro de `handle`, y :103-111 exporta GET y POST contra el mismo handler. También verifiqué el CIERRE que sostiene el CAMBIO_DE_ESTADO: unsubscribe-token.ts:97-108 hace verify con signEmailContactOptOutToken + comparación de longitud + timingSafeEqual, y el chequeo es previo a tocar la DB (comentario :92-95 y código :77-87 del route) — F7 del checklist heredado está efectivamente cerrado. El token es un HMAC determinístico del id, sin expiración, y _actions.ts:113-116 lo persiste como atributo OPTOUT_TOKEN en Brevo, tal como afirma.

**Corrección aplicada.** BAJO es correcto, y el encuadre CAMBIO_DE_ESTADO está bien fundado (lo que queda vivo no es el HMAC, es el verbo). Un matiz que no lo refuta pero baja el peso: el patrón GET-que-da-de-baja es práctica de industria en links de email (por eso mismo existe RFC 8058, que el código cita correctamente en :107-109), y el propio handler de optout es idempotente y no revela existencia del contacto (updateMany deliberado, :89-90). El daño es pérdida de canal, reversible en el caso ejecutivo. El fix propuesto (GET renderiza formulario, POST escribe, manteniendo el POST one-click de RFC 8058) es correcto y acotado a los dos route.ts.

### [S2b-09] sendCampaignAction devuelve al cliente el texto crudo de la respuesta de error de la API de Brevo

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sesión ORG_MEMBER y una respuesta no-ok de la API de Brevo |

**Impacto.** (a) Qué se expone: el status y el cuerpo literal de la respuesta de api.brevo.com, que puede incluir códigos internos, nombres de recursos, límites de la cuenta o motivos de rechazo del remitente. (b) A quién: al cliente autenticado que dispara la campaña. (c) Precondiciones: sesión de cliente y una llamada a Brevo que falle — trivial de provocar. No expone credenciales (la api-key va en header y no se refleja), por eso BAJO. Lo reporto porque contradice una regla no negociable escrita del propio repo ('Never expose internal error messages or stack traces to the client') y porque es exactamente la clase de fuga que convierte un integrador de terceros en un oráculo de configuración.

**Mecanismo.** El wrapper de integración construye el mensaje de error concatenando el status y el body completo de la respuesta de Brevo, y la action lo devuelve tal cual en el campo `error` de su resultado, que la UI muestra. No hay mapeo a un mensaje genérico ni logging separado del detalle: el detalle va al cliente y no al servidor.

**Evidencia.**

- `src/lib/integrations/brevo.ts:81-83`
  > if (!res.ok) {
      return { ok: false, error: `Brevo error: ${res.status} ${await res.text()}` }
    }
- `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:197-203`
  > if (!brevoResult.ok) { await prisma.emailCampaign.update({ where: { id: campaignId }, data: { status: 'FAILED' } }); return { error: brevoResult.error } }   // el texto de Brevo llega crudo al cliente
- `CLAUDE.md (raíz del repo, sección Non-negotiable rules)`
  > Never expose internal error messages or stack traces to the client.

**Fix.** En src/lib/integrations/brevo.ts, separar el detalle del mensaje: loggear el body completo server-side (console.error con el status y el texto, como ya hace ensureBrevoList en la línea 20) y devolver un código de error estable de la union propia del módulo. En _actions.ts:202, mapear ese código al copy en español que corresponda, con un default genérico. Aplicar el mismo criterio a las demás funciones del archivo que devuelven `err.message` crudo.

**Criterio de aceptación.** Forzando un fallo de la llamada a Brevo, el objeto devuelto por sendCampaignAction no contiene la subcadena 'Brevo error:' ni ningún fragmento del body de la respuesta remota, y el detalle completo sí aparece en los logs del servidor.

**Qué encontró el verificador.** Cita literal verificada: src/lib/integrations/brevo.ts:80-83 devuelve `error: \`Brevo error: ${res.status} ${await res.text()}\`` — el body remoto entero en el mensaje (el hallazgo dice 81-83, off-by-one benigno). Y src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:197-203 lo devuelve tal cual al cliente en `{ error: brevoResult.error }`. Contrasté con el patrón correcto del mismo archivo: ensureBrevoList:20 sí hace console.error del body y devuelve null, sin filtrarlo. Verifiqué también la regla citada: existe textual en C:\Users\franc\Desktop\wt-auditoria-seguridad\CLAUDE.md:24 ('Never expose internal error messages or stack traces to the client'). Busqué un mapeo a mensaje genérico aguas abajo en la UI y no lo hay.

**Corrección aplicada.** BAJO correcto: la api-key va en header (brevo.ts:2-7) y no se refleja en la respuesta, así que no hay fuga de credencial. Dos matices de encuadre. (1) La alcanzabilidad real está atada a S2b-01: hoy no hay UI del módulo (slug divergente), así que provocar el fallo exige el mismo POST fabricado. (2) estado_vs_ledger: el ledger ya tiene CLEAN-2.1-CATCH ('63 catch devuelven el .message crudo al cliente', slice S7) y C-10 ('DossierTransitionError llega crudo al cliente'), que son la misma CLASE de defecto. Este sitio concreto —body de una API de terceros, no un Error interno— no figura, así que es un sitio nuevo dentro de una clase ya documentada; conviene reportarlo así para no inflar el conteo.

#### Ya documentado en auditorías previas — no se re-reporta (8)

- [CLEAN-1.1-SLUG] Vigente sin cambios: el catálogo escribe slug 'email-marketing-pro' (src/lib/data/premium-modules.ts:38) y el gate consulta 'email-marketing' (dashboard/modules/email-marketing/layout.tsx:20) → isModuleActive devuelve false siempre; verificado hoy, ninguna de las dos líneas cambió.
- [SEC-AUTH-05] Vigente sin cambios: /api/track POST acepta organizationId arbitrario del body cuando el rol es SUPER_ADMIN, sin validar existencia (src/app/api/track/route.ts:22-27).
- [SEC-AUTH-04] Vigente sin cambios en lo que toca a este recorte: el route-guard existe y gatea por rol (src/proxy.ts:148,154) pero su matcher (src/proxy.ts:172) no cubre /api/*, tal como el ledger declara 'por diseño'.
- [SEC-INV-zod-gaps] Vigente sin cambios: dashboard/messages/_actions/mark-read.ts no valida input (no recibe ninguno) y las tres actions de email-marketing siguen sin Zod (_actions.ts:71,128,174).
- [CLEAN-2.2-WANORM] Vigente sin cambios: updateContactAction escribe Organization.whatsapp con un trim crudo, sin pasar por el normalizador compartido y sin tope de longitud (src/lib/actions/profile.ts:87-92).
- [§3.5 leads/recent] Sigue CERRADO: el guard auth() con 401 está en su lugar (src/app/api/dashboard/leads/recent/route.ts:11-13).
- [CLEAN-2.1-CATCH] Vigente sin cambios en este recorte: los catch de las actions del dashboard devuelven mensajes fijos o pasan por toErrorMessage (src/lib/actions/profile.ts:72,99,146), salvo el caso de Brevo que reporto aparte como S2b-09.
- [O-13 / C-14] Vigente sin cambios: getMyNotificationsAction y el export de leads sí tienen tope (200 y 10.000), pero no hay paginación — mismo patrón ya inventariado de consultas acotadas por constante y no por página.


---

## S2c — Autorización por rol: SETTER + censo del patrón P0-6

> **Pasada de refutación adversarial:** **no** — el verificador murió por límite de sesión. Los hallazgos marcados *sin verificar* los sostiene una sola lectura, salvo los que verifiqué yo y están anotados como tales.

### [S4-01] Dos dialectos de "cual es mi organizacion": resolveOrgId() filtra por rol, session.user.organizationId no — 19 server actions y 2 rutas API corren sobre el dialecto ciego al rol

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sesion valida de un usuario con rol SETTER (o CLIENT) que ademas tenga una fila OrgMember. Hoy solo alcanzable por edicion manual de la DB — que es exactamente como se crean los setters, porque no hay UI para darlos de alta. |

**Impacto.** (a) Que se logra: lectura y escritura completas del panel de cliente sobre UNA organizacion (notificaciones, perfil/contacto de la org, preferencias de notificacion, mensajes al admin, aprobacion/rechazo de tareas, codigo de referido, pedido de upsell, ubicacion activa de Google Business, PDF del informe mensual, PageView). (b) A quien: a un usuario cuyo rol NO es ORG_MEMBER (SETTER o CLIENT) pero que arrastra una fila OrgMember. (c) Precondicion: ese estado de datos. Verifique que NINGUNA ruta de la app lo produce (los 5 sitios que crean OrgMember rechazan un email existente) y que NO existe ninguna ruta de la app que cree un SETTER — los setters solo nacen de seed/DB a mano. No es cross-tenant (alcanza una sola org, la de su propia membership), por eso no es ALTO; es una frontera de privilegio que se rompe en silencio y que el proxy nunca ve, por eso no es BAJO.

**Mecanismo.** La app tiene dos formas de responder "a que organizacion pertenece el caller". `resolveOrgId()` (src/lib/preview.ts:6-20) es consciente del rol: devuelve la org solo si el rol es ORG_MEMBER, o la org impersonada si es SUPER_ADMIN, y `return null` para todo lo demas — SETTER y CLIENT incluidos. El otro dialecto lee `session.user.organizationId` directo. Ese campo se llena en src/auth.ts:42-45 tomando `orgMemberships[0]` SIN mirar el rol, se copia al token en src/auth.ts:226 y a la sesion en src/auth.config.ts:33, tambien sin condicion de rol. Resultado: las superficies del primer dialecto niegan a un SETTER; las del segundo lo aceptan como si fuera el duenio de esa org. El proxy no cubre la diferencia: los server actions son POST que no atraviesan el matcher (src/proxy.ts:171-173), asi que la rama SETTER del proxy (src/proxy.ts:117-122) que redirige /dashboard nunca se ejecuta para una invocacion directa de action.

**Evidencia.**

- `src/lib/preview.ts:6-20`
  > export const resolveOrgId = cache(async (): Promise<string | null> => { const session = await auth(); const role = session?.user?.role; if (role === 'ORG_MEMBER') { return session?.user?.organizationId ?? null } if (role === 'SUPER_ADMIN') { ... } return null })
- `src/auth.ts:42-45`
  > const membership = dbUser?.orgMemberships[0］ / const role = dbUser?.role ?? ('ORG_MEMBER' as Role) / const organizationId = membership?.organizationId   ← el organizationId se deriva de la membership sin consultar el rol
- `src/auth.ts:226`
  > token.organizationId = accessState.organizationId
- `src/auth.config.ts:33`
  > session.user.organizationId = token.organizationId as string | undefined
- `src/lib/actions/notifications.ts:21`
  > const organizationId = session?.user?.organizationId   (idem :48 y :75 — markNotificationReadAction / markAllNotificationsReadAction / getMyNotificationsAction)
- `src/lib/actions/profile.ts:29`
  > const organizationId = session?.user?.organizationId   (idem :81, :108, :152 — updateProfileAction / updateContactAction / updateNotificationPrefsAction / requestAccountDeletionAction)
- `src/actions/task-approvals.ts:9`
  > if (!session?.user?.organizationId) throw new Error('Unauthorized')   (idem :39 y :87 — requestTaskApproval / approveTask / rejectTask)
- `src/actions/dashboard-actions.ts:14`
  > if (!session?.user?.id || !session.user.organizationId) {   (idem :106 y :190 — approveTaskAction / rejectTaskAction / markNotificationAsRead)
- `src/lib/actions/messages.ts:119`
  > const organizationId = session?.user?.organizationId   (sendClientMessageAction)
- `src/lib/actions/gbp-connection.ts:19`
  > const organizationId = session?.user?.organizationId   (idem :40 — listAvailableLocations / setActiveLocation)
- `src/lib/actions/announcements.ts:20`
  > const organizationId = session?.user?.organizationId
- `src/lib/actions/referrals.ts:14`
  > const organizationId = session?.user?.organizationId
- `src/lib/actions/upsell.ts:16`
  > const organizationId = session?.user?.organizationId
- `src/app/api/reports/monthly/route.ts:27,45-51`
  > const { role, organizationId: sessionOrganizationId } = session.user  ...  } else { if (!sessionOrganizationId) return 403; ... organizationId = sessionOrganizationId }   ← la rama no-admin no mira si el rol es ORG_MEMBER
- `src/app/api/track/route.ts:26-27`
  > session.user.role === 'SUPER_ADMIN' ? bodyOrgId ?? session.user.organizationId ?? null : session.user.organizationId ?? null
- `comando: grep -rn "orgMember.create" src/`
  > 5 sitios en la app: lib/actions/clients.ts:130, lib/actions/invitations.ts:89, lib/onboarding/core.ts:101, modules/chatbot/server/admin/createClientOnly.ts:99, createClientWithBot.ts:149 — los 5 abortan antes si `user.findUnique({where:{email}})` devuelve algo (clients.ts:103-105, invitations.ts:67-70, core.ts:69-73, createClientOnly.ts:60-65, createClientWithBot.ts:110)
- `comando: grep -rn "SETTER" src/ scripts/ prisma/*.ts | grep -i role`
  > Ninguna asignacion de role: 'SETTER' en src/. Solo prisma/seed.ts:155 y :163 (Role.SETTER) y scripts de verificacion/QA. Confirmado: no hay ruta de la app para crear un setter.

**Fix.** Unificar el dialecto: borrar todo `session.user.organizationId` de codigo de negocio y llamar `resolveOrgId()` (src/lib/preview.ts) en los 19 actions y 2 rutas listados arriba. Refuerzo barato en el mismo commit: en src/auth.ts:45, derivar el organizationId solo cuando el rol lo justifica — `const organizationId = role === 'ORG_MEMBER' ? membership?.organizationId : undefined` — asi el campo de sesion deja de ser una via alternativa aunque un call site nuevo lo lea. Y un guard de ESLint no-restricted-syntax que prohiba `session.user.organizationId` fuera de src/auth.ts, src/auth.config.ts y src/lib/preview.ts (mismo patron de ignores que ya usa el repo en eslint.config.mjs para el chatbot).

**Criterio de aceptación.** 1) `grep -rn "user\.organizationId\|user?.organizationId" src/ --include=*.ts --include=*.tsx` devuelve solo src/auth.ts, src/auth.config.ts, src/lib/preview.ts y src/types/next-auth.d.ts. 2) Con un usuario de rol SETTER al que se le inserta a mano una fila OrgMember en la DB de dev, invocar markNotificationReadAction / updateContactAction / approveTaskAction / GET /api/reports/monthly devuelve 'No autorizado' / 403 en los cuatro casos (hoy devuelven exito). 3) `npm run lint` falla si se agrega un `session.user.organizationId` nuevo fuera de los 3 archivos permitidos.

### [S4-02] La cadena de ownership del setter y la ESCRITURA estan desacopladas: 8 funciones del dominio LeadOS mutan por `leadId` pelado, sin discriminante de duenio en la firma ni en el where

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ninguna para el estado actual (todos los call sites guardan). Para materializarse: una edicion futura que omita el preambulo de ownership, o un call site nuevo. |

**Impacto.** (a) Que se logra HOY: nada — los 14 call sites del setter validan pertenencia antes. Lo que se pierde es el candado: estas funciones aceptan cualquier leadId y no hay tipo, test ni invariante que note su ausencia. (b) A quien afectaria: un setter contra leads de otro setter (transiciones de stage, contactos comerciales, postergaciones, demos, agenda). (c) Precondicion para que se vuelva explotable: que un solo `const lead = await getOwnedLead(...)` / `getOwnedDossier(...)` se caiga en un refactor, o que un call site nuevo las llame sin el preambulo. Es exactamente la forma que produjo las 4 instancias historicas de P0-6, por eso MEDIO y no BAJO; no es ALTO porque hoy no hay ningun camino abierto.

**Mecanismo.** El dominio LeadOS tiene dos familias de escritura. La familia `saveOwned*` (src/lib/leados/dossier.ts:271,299,327,352,384,412,434,452) recibe `(leadId, userId)` y deriva el dossier de `getOwnedLead` adentro — no se puede llamar mal, la firma obliga. La otra familia recibe solo `leadId` y muta directo; la pertenencia vive en una sentencia ANTERIOR y SEPARADA del caller. Como el guard esta en otra linea y no en la firma ni en el `where`, borrarlo no rompe tipos ni tests: la escritura sigue compilando y sigue funcionando, ahora sobre cualquier lead. Es la condicion habilitante del patron P0-6 sobreviviendo en la capa de escritura, no en la de actions.

**Evidencia.**

- `src/lib/leados/dossier.ts:134,246-247`
  > export async function transitionDossier( ... )  ...  const updated = await prisma.osLeadDossier.updateMany({ where: { leadId, stage: from },   ← unica puerta de cambio de stage; recibe leadId pelado, sin userId
- `src/lib/os-commercial.ts:47,71-72,79-80,89-90`
  > export async function registrarContactoComercial( ... )  ...  await prisma.osLead.update({ where: { id: input.leadId },   ← mueve LeadStatus y nextFollowUpAt por id crudo
- `src/lib/os-commercial.ts:115,146-147`
  > export async function crearDemoComercial( ... )  ...  await prisma.osLead.update({ where: { id: demo.leadId },
- `src/lib/os-commercial.ts:162,166-167`
  > export async function postergarLead( ... )  ...  await prisma.osLead.update({ where: { id: leadId },
- `src/lib/leados/notify.ts:128,165-166`
  > export async function notificarEvaluacionScoreAlto(leadId: string): Promise<void>  ...  await prisma.osLeadDossier.update({ where: { leadId },   ← una funcion llamada 'notificar' que ESCRIBE en el dossier por leadId crudo
- `src/lib/leados/agenda.ts:228,233-234`
  > export async function marcarReunionRealizadaAdmin(leadId: string): Promise<boolean>  ...  updateMany({ where: { leadId, agendaJson: { path: ['estado'], equals: 'AGENDADA' } }
- `src/lib/leados/agenda.ts:245,257-258`
  > export async function guardarResultadoReunionAdmin( leadId, tipo, nota )  ...  updateMany({ where: { leadId, agendaJson: ... }
- `src/lib/leados/assignment-trail.ts:42,45`
  > export async function registrarReasignacion( ... )  ...  await prisma.osLeadActivity.create({
- `src/app/(protected)/setter/_actions/dossier.actions.ts:124-131,139-142`
  > const lead = await getOwnedLead(leadId.data, userId) / if (!lead) return fail(...) / const dossier = await getOwnedDossier(leadId.data, userId) / ... / await transitionDossier(leadId.data, { to: 'EVALUADA', ... })   ← el guard y la escritura son sentencias distintas; borrar las 4 primeras lineas deja la transicion abierta
- `src/app/(protected)/setter/_actions/outreach.actions.ts:159-160,176-186`
  > const lead = await getOwnedLead(leadId.data, userId) / if (!lead) return fail('Lead no encontrado') ... await registrarContactoComercial({ leadId: leadId.data, ... }) ... await postergarLead(leadId.data, reactivateAt)
- `src/lib/leados/dossier.ts:271-291`
  > export async function saveOwnedFicha( leadId, userId, ficha )  { const dossier = await getOwnedDossier(leadId, userId); if (!dossier) return null; ... }   ← el CONTRASTE: aca la firma obliga al userId y el guard esta adentro

**Fix.** Cerrar la firma en las 4 funciones que hoy son alcanzables desde el setter: `transitionDossier(leadId, userId, transicion)`, `registrarContactoComercial({..., ownerId})`, `postergarLead(leadId, userId, reactivateAt)`, `crearDemoComercial({..., ownerId})`, y que cada una resuelva la pertenencia adentro con `getOwnedLead`/`getOwnedDossier` (mismo patron que la familia saveOwned* de src/lib/leados/dossier.ts:271). Para los call sites de admin, un parametro explicito y greppable (`{ actor: 'admin' }` o funciones hermanas `*Admin`, como ya hacen agenda.ts:228 y :245) en vez de la ausencia silenciosa de userId. Las dos funciones `*Admin` de agenda.ts y `registrarReasignacion` quedan como estan pero se documentan como admin-only en el mismo commit. Complemento barato: sumar a src/lib/leados/ un `*.invariant.ts` que falle si alguna de esas funciones aparece llamada desde `src/app/(protected)/setter/**` sin un `getOwned*` en el mismo cuerpo.

**Criterio de aceptación.** 1) `transitionDossier`, `registrarContactoComercial`, `postergarLead` y `crearDemoComercial` no compilan si se las llama sin identidad del actor (tsc falla). 2) Un test que llame `transitionDossier(leadDeA, userB, {to:'EVALUADA'})` obtiene null/throw y el stage del lead de A no cambia. 3) `npm run check:invariants` incluye el invariante nuevo y esta cableado en CI (hoy 40 de 56 invariantes no corren — ver CLEAN-1.1-INVARIANTES del ledger: si el invariante no entra al agregado enumerado a mano, no vale).

### [S4-03] unsafeGlobalQuery: 50 accesos cross-org en runtime cuyo unico control es un string de justificacion libre — nada verifica que el caller tenga el rol que el string afirma

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ninguna para el hallazgo de control. Para que un call site concreto filtre: que sea 'use server' o ruta API sin guard de rol — hoy pasa en 1 de 50. |

**Impacto.** (a) Que se pierde: el unico rastro auditable del repo para los accesos que deliberadamente saltean el aislamiento multi-tenant. El aislamiento es 100% de capa de aplicacion (no hay RLS — BRIEF-3.1-NO-RLS del ledger), asi que el escape hatch ES la frontera. (b) A quien afecta: al auditor y al proximo sprint, no a un atacante hoy. (c) Precondicion: ninguna para la debilidad de control; para una fuga concreta hace falta un call site sin guard — y ya hay uno (preflightChecks, ya documentado como SEC-02), cuyo string dice literalmente 'super-admin, cualquier org' en una funcion que no chequea rol. Ese es el sintoma medible de que el string no es un control. MEDIO y no ALTO porque de los 50 sitios de runtime, los que revise fuera de preflightChecks si tienen guard.

**Mecanismo.** src/lib/isolation expone `unsafeGlobalQuery(reason, fn)` como la salida explicita y greppable para lo legitimamente global; el propio modulo lo documenta asi (`grep -r unsafeGlobal src/ enumera todos los accesos cross-org del repo`). Pero `reason` es texto libre: no se compara con nada, no participa de ninguna decision, y ningun lint ni invariante ata un call site a un guard de autorizacion. El eslint del repo solo obliga al chatbot a NO importar @/lib/prisma (eslint.config.mjs:49-83) — es decir, fuerza a usar el escape hatch, no a justificarlo. La consecuencia es que la enumeracion que el repo promete ("todos los accesos cross-org") es una lista de intenciones declaradas, no de accesos autorizados: un call site puede afirmar un rol que no exige.

**Evidencia.**

- `comando: grep -rn "unsafeGlobalQuery(" src/ --include=*.ts | grep -v "^src/lib/isolation/" | wc -l`
  > 68 (18 en evals/seed/scripts dev-only, 5 son $disconnect) → 50 call sites de runtime
- `src/lib/isolation/index.ts (cabecera del modulo)`
  > Escape explicito y greppable para lo legitimamente global: unsafeGlobalQuery(reason, fn). `grep -r unsafeGlobal src/` enumera todos los accesos cross-org del repo.
- `src/modules/chatbot/server/admin/preflightChecks.ts:13-24`
  > export async function runPreflightChecks(botId: string) { ... const bot = await unsafeGlobalQuery('ADMIN: preflight — lectura del bot por id (super-admin, cualquier org)', (c) => c.botConfig.findUnique({ where: { id: botId }, include: { knowledgeBase: true, organization: true } }))   ← el string afirma super-admin; el archivo no importa ningun guard (no hay requireSuperAdmin ni auth() en las 172 lineas)
- `eslint.config.mjs:49,65,72,83`
  > "El chatbot no puede importar @/lib/prisma directamente. Usar src/lib/isolation/ (forOrg / unsafeGlobalQuery) — B0-S3."   ← la unica regla existente empuja HACIA el escape hatch; ninguna regla lo restringe
- `comando: grep -rn "unsafeGlobal" eslint.config.mjs src/**/*.invariant.ts package.json`
  > solo los 4 mensajes de eslint.config.mjs citados arriba. Cero invariantes, cero reglas que cubran el uso del escape hatch.

**Fix.** Convertir el `reason` de comentario en contrato. Minimo viable para una agencia de 2: (1) tipar el primer argumento como una union cerrada de prefijos (`'TENANT-RESOLUTION' | 'AUTH-RESOLUTION' | 'TENANT-MGMT' | 'PLATFORM-AGG' | 'ADMIN' | 'DEV-ONLY'`) mas la descripcion libre, en src/lib/isolation/index.ts; (2) para el prefijo 'ADMIN', exigir un segundo parametro con el userId del super-admin ya verificado, de modo que el tipo obligue a haber llamado el guard; (3) un `*.invariant.ts` (o un probe de ESLint no-restricted-syntax, como el que ya usa la auditoria CLEAN) que falle si un archivo con 'use server' o un route.ts usa unsafeGlobalQuery con prefijo 'ADMIN' sin importar requireSuperAdmin. Documentar los 50 sitios en un solo lugar en vez de 50 strings sueltos.

**Criterio de aceptación.** 1) `unsafeGlobalQuery('ADMIN: ...', fn)` no compila sin el identificador del admin verificado. 2) El invariante/probe corre en CI y falla contra el arbol actual senalando preflightChecks.ts:16 (prueba de que detecta el caso conocido), y pasa una vez que esa funcion tenga requireSuperAdmin. 3) `grep -rn "unsafeGlobalQuery(" src/ | grep -v "^src/lib/isolation/"` sigue enumerando todos los accesos y cada linea arranca con uno de los prefijos tipados.

### [S4-04] A-13 vigente y peor de lo declarado: CERO tests del repo invocan una server action del setter — los 19 guards de ownership del nivel action no tienen ninguna cobertura, y la suite de aislamiento solo prueba lectura

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | CONFIRMADO_SIN_TEST |
| **Precondiciones** | Ninguna hoy. El hallazgo es de cobertura: cualquier regresion en un guard de action pasa verde. |

**Impacto.** (a) Que se pierde: la prueba de que la denegacion de mutacion cruzada existe. El veredicto de gating de la auditoria de apertura (§3.3 'GATEA — con perimetro acotado') se apoya en que el chokepoint compartido esta testeado; verifique que lo testeado es la capa LIB, no las actions. (b) A quien: a un setter contra la cartera de otro setter, si alguna vez se cae un guard. (c) Precondicion: una regresion futura. No es ALTO porque hoy los 19 guards estan presentes y los verifique uno por uno leyendo el codigo; es MEDIO porque el ledger declara este perimetro como 'la unica accion que cerraria A-13' y sigue sin correrse, y porque S4-02 muestra que la capa de escritura no lo atrapa sola.

**Mecanismo.** Las specs 'durables' de LeadOS (tests/leados/*.spec.ts) y las de setter que tocan mutaciones importan la capa LIB — getOwnedLead, getOwnedDossier, saveOwned*, marcarDemoEnviadaOwned, gateEnvioDemo — y re-implementan en el test el cuerpo post-guard de la action (los propios comentarios lo dicen: 'Espejo FIEL del cuerpo post-gate', 'Espejo del nucleo post-guard'). Ningun archivo de tests/ importa un `_actions/*.actions.ts`. Eso significa que lo que esta probado cross-tenant es el chokepoint compartido (que es real y correcto), y lo que NO esta probado es el pegamento: que cada una de las 19 actions exportadas efectivamente lo llame antes de escribir. Y la unica spec de aislamiento tiene 4 casos, los 4 de lectura (cartera, 404 de lead ajeno, nota privada, novedades dirigidas) — ninguno intenta una mutacion con un leadId ajeno.

**Evidencia.**

- `comando: grep -rn "_actions/" tests/ | grep -v schemas`
  > (sin salida) — ningun test del repo importa una server action del setter ni de ningun otro modulo
- `comando: grep -c "^test(" tests/setter/02-isolation.spec.ts`
  > 4
- `tests/setter/02-isolation.spec.ts:51,80,95,111`
  > C1 · A no ve la cartera de B; abrir un lead ajeno da 404 sin leak / C2 · B (2º setter) ve SOLO lo suyo; no abre el lead de A / C3 · la nota privada de A no la hereda B al reasignar el lead / C4 · novedades dirigidas: B ve "te asignaron"; A (saliente) ve "te reasignaron" SIN link   ← los 4 son de LECTURA
- `tests/setter/06-claim-atomico.spec.ts:14,26,78`
  > import { marcarDemoEnviadaOwned, revertirDemoEnviadaOwned } from '../../src/lib/leados/dossier'  ...  'Por que in-process y no por HTTP: `enviarDemoAprobada` (la action) corre bajo...'  ...  'Espejo FIEL del cuerpo post-gate de `enviarDemoAprobada` (outreach.actions.ts)'
- `tests/leados/selfcheck-anti-bypass.spec.ts:33,61`
  > 'Espejo del nucleo post-guard de `enviarARevision` (dossier.actions.ts): mismo...' / 'Espejo del gate de `enviarARevision`: mismo orden de guardas, misma re-validacion.'
- `tests/leados/envio-demo-rechazo.spec.ts:12-14`
  > import { getOwnedDossier, marcarDemoEnviadaOwned } from '../../src/lib/leados/dossier' / import { getOwnedLead } from '../../src/lib/leados/ownership' / import { gateEnvioDemo } from '../../src/lib/leados/flow'   ← capa lib, no la action
- `src/app/(protected)/setter/_actions/ (censo propio, 19 actions exportadas)`
  > agenda:2 (ofrecerHorarios, confirmarReunion) · cartera:4 (fijarLead, pausarLead, reanudarLead, guardarNota) · dossier:10 (guardarFicha, registrarEvaluacion, guardarBrief, iniciarConstruccion, reabrirConstruccion, guardarProgreso, guardarDraftUrl, guardarSelfCheck, enviarARevision, escalarConstruccion) · foco:2 · novedades:1 · outreach:3 · prospecto:1 · prospecto-bulk:1 — verifique por lectura que las 24 llaman requireSetter() y las 19 con leadId pasan por getOwnedLead/getOwnedDossier/saveOwned*/resolverLeadPropio antes de operar

**Fix.** Una sola spec nueva, tests/setter/08-mutacion-cruzada.spec.ts, que importe DIRECTAMENTE cada una de las actions con leadId y las invoque con la sesion del setter B y un leadId del setter A, afirmando que (a) el retorno es el fail generico 'Lead no encontrado' y (b) la fila del lead de A quedo byte-identica (snapshot antes/despues de OsLead + OsLeadDossier + OsLeadActivity + OsLeadSetterMeta). Reusar el minteo dual-cookie y los helpers que ya existen en tests/helpers/setter-auth.ts y setter-db.ts. Es una tabla de 19 casos con un solo cuerpo parametrizado, no 19 tests a mano. Cablearla al mismo comando que ya corre la suite del setter para que no caiga en el pozo de los 40 invariantes que no corren.

**Criterio de aceptación.** 1) La spec falla si se comenta el `if (!lead) return fail(...)` de cualquiera de las 19 actions (probarlo con una, revertir). 2) Los 19 casos verdes con snapshot de las 4 tablas sin diff. 3) La spec corre dentro de `npm run test:setter` (o el comando de cierre estandar) y no como archivo suelto.

### [S4-05] passwordResetRequired se enforcea SOLO en el proxy: ninguna server action ni ruta API lo mira, y los server actions no atraviesan el middleware

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sesion valida de una cuenta con passwordResetRequired=true (la que crea createClientOnly o POST /api/admin/users/[userId]/resend-credentials), invocando server actions directamente en vez de navegar. |

**Impacto.** (a) Que se logra: operar la aplicacion entera (todas las server actions de su rol) sin haber rotado nunca la password temporal que el admin emitio. (b) A quien: a cualquiera que tenga esa password temporal — el usuario legitimo, o quien tenga acceso al mail donde llego en claro. (c) Precondicion: conocer la credencial temporal, es decir ya se paso el login. Por eso BAJO: no es un bypass de autenticacion, es la no-aplicacion de un control de higiene que el codigo si intenta imponer. Lo reporto porque el control existe, esta escrito, y solo cubre uno de los dos caminos de entrada.

**Mecanismo.** El unico lugar del repo que consulta passwordResetRequired para decidir es el proxy, que redirige a /cambiar-password antes de dejar entrar a cualquier ruta protegida. Pero el matcher del proxy cubre paginas (/admin, /dashboard, /setter, /login, /bienvenida, /cambiar-password) y no los POST de server action ni /api/*. Los guards que si corren en cada action — requireSuperAdmin y requireSetter — leen unicamente rol e id; resolveOrgId tampoco lo mira. Resultado: la puerta esta cerrada para quien navega y abierta para quien invoca. La rotacion forzada nunca ocurre y la password temporal, que viajo por mail, sigue siendo la credencial viva de la cuenta por tiempo indefinido.

**Evidencia.**

- `src/proxy.ts:83-90`
  > // Force password reset before allowing access to any protected route\n  if (isAuthenticated && passwordResetRequired && !ALWAYS_ALLOWED.some(p => pathname.startsWith(p))) { return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, nextUrl)) }
- `src/proxy.ts:171-173`
  > export const config = { matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password'] }   ← sin /api/*, y los POST de server action no pasan por aca
- `src/lib/auth-guards.ts:3-21`
  > export async function requireSuperAdmin(): Promise<string> { const session = await auth(); if (session?.user?.role !== 'SUPER_ADMIN' || !session.user.id) { throw new Error('Unauthorized') } return session.user.id }   (requireSetter, :13-21, es identico con 'SETTER') — ninguno consulta passwordResetRequired
- `src/lib/preview.ts:6-20`
  > resolveOrgId: mira role e impersonation; no consulta passwordResetRequired
- `src/modules/chatbot/server/admin/createClientOnly.ts:96`
  > passwordResetRequired: true,   ← la cuenta nace con el flag; la password temporal se genera en :67 y se manda por mail
- `comando: grep -rn "passwordResetRequired" src/ --include=*.ts`
  > lecturas de decision solo en src/proxy.ts:75 y :86. El resto son escrituras (createClientOnly.ts:96, cambiar-password/actions.ts, reset-password) o propagacion de sesion (auth.ts:24,51,229,237; auth.config.ts:36)

**Fix.** Sumar el chequeo al lugar por donde SI pasa todo: dentro de requireSuperAdmin y requireSetter en src/lib/auth-guards.ts, leyendo el flag de la sesion y lanzando 'PasswordResetRequired' (que los mapError existentes ya traducen a un fail generico). Para las superficies de cliente que no usan esos guards, el mismo chequeo dentro de resolveOrgId en src/lib/preview.ts (devolver null si el flag esta prendido), lo que apaga en bloque las 19+ actions del dashboard. Excepcion explicita y unica: cambiarPasswordAction (src/app/cambiar-password/actions.ts:21) y signOutAction, que deben seguir funcionando — son la salida.

**Criterio de aceptación.** Con una cuenta con passwordResetRequired=true en la DB de dev: (1) invocar cualquier server action de su rol devuelve el fail de no-autorizado; (2) cambiarPasswordAction sigue funcionando y, tras cambiar la password, las mismas actions vuelven a responder OK; (3) `grep -rn "passwordResetRequired" src/lib/auth-guards.ts src/lib/preview.ts` devuelve las lecturas nuevas.

### [S4-06] /admin/leados/setter/[setterId]: la pagina lee cualquier User por id de URL sin validar que sea un SETTER, y no tiene guard propio — depende enteramente del layout

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sesion SUPER_ADMIN. Sin sesion o con otro rol, el layout de /admin redirige antes. |

**Impacto.** (a) Que se logra: obtener name+email de cualquier usuario del sistema (clientes incluidos) escribiendo su id en la URL, mas la lista de dossiers 'asignados' a el (vacia si no es setter). (b) A quien: unicamente a SUPER_ADMIN, que ya tiene /admin/clients y listTeamMembers para ver los mismos datos — el impacto marginal es cero. (c) Precondicion: sesion SUPER_ADMIN valida. Lo reporto por el censo (es una instancia de la forma 'id del cliente → operar sin validar el tipo/pertenencia del recurso') y porque la pagina, como sus hermanas de /admin/leados, no repite el guard de rol; el repo ya declaro esa dependencia como riesgo en un fix propio (B11.2 fix F2, comentario en src/lib/actions/projects.ts:19-21).

**Mecanismo.** La pagina toma `setterId` de la ruta dinamica y hace un findUnique de User por ese id, sin filtrar por `role: 'SETTER'`. Si el id no es de un setter, la consulta igual devuelve el usuario y la pagina renderiza su nombre/email con cero evaluaciones. El unico guard de rol de la superficie /admin es el layout (src/app/(protected)/admin/layout.tsx:41-48); la pagina no lo repite, igual que sus hermanas admin/leados/page.tsx y admin/leados/[leadId]/page.tsx. En App Router el layout envuelve la pagina y su redirect aborta la respuesta, asi que el enforcement HOY es real — pero el guard vive en un archivo distinto del que hace la consulta, que es la misma fragilidad que el propio repo documento al agregar guards locales a las actions de projects.

**Evidencia.**

- `src/app/(protected)/admin/leados/setter/[setterId]/page.tsx:36-40`
  > prisma.user.findUnique({ where: { id: setterId }, select: { name: true, email: true } }),   ← sin `role: 'SETTER'` en el where
- `src/app/(protected)/admin/leados/setter/[setterId]/page.tsx:41-49`
  > prisma.osLeadDossier.findMany({ where: { lead: { assignedToId: setterId } }, ... orderBy: { updatedAt: 'desc' } })   ← sin take; el comentario :34-37 lo justifica por volumen chico
- `src/app/(protected)/admin/leados/setter/[setterId]/page.tsx:26-28`
  > * alarma "revisar criterio" ya no manda a buscar en la base. Admin-only por el layout\n * (SUPER_ADMIN); read-only, no toca metrica ni scoring.   ← la propia pagina declara que su guard es el layout
- `src/app/(protected)/admin/layout.tsx:41-48`
  > const session = await auth() ... if (session.user.role !== 'SUPER_ADMIN') { redirect('/dashboard') }   ← el guard real, en otro archivo
- `src/lib/actions/projects.ts:19-21`
  > // B11.2 fix F2: defense-in-depth. Las actions de este archivo eran trust-the-layout (`/admin/**` exige SUPER_ADMIN). Si el layout-guard se rompia en un refactor, IDOR inmediato.   ← el precedente del propio repo contra este patron

**Fix.** Dos lineas en src/app/(protected)/admin/leados/setter/[setterId]/page.tsx: (1) `await requireSuperAdmin()` al inicio del componente, como ya hacen las paginas del setter (src/app/(protected)/setter/page.tsx:28, nuevo/page.tsx:18); (2) agregar `role: 'SETTER'` al where del findUnique, para que un id que no sea de setter caiga en el `redirect('/admin/leados')` que ya existe en :55-57. Aplicar el punto (1) tambien a admin/leados/page.tsx y admin/leados/[leadId]/page.tsx, que comparten la dependencia del layout.

**Criterio de aceptación.** 1) Navegar a /admin/leados/setter/<id-de-un-usuario-cliente> con sesion SUPER_ADMIN redirige a /admin/leados en vez de renderizar su nombre y email. 2) `grep -n "requireSuperAdmin" src/app/(protected)/admin/leados/**/page.tsx` devuelve las 3 paginas. 3) La navegacion normal desde la cola (fila clickeable de un setter real) sigue funcionando.

#### Ya documentado en auditorías previas — no se re-reporta (7)

- [SEC-02] runPreflightChecks(botId) sigue sin ningun guard en src/modules/chatbot/server/admin/preflightChecks.ts:13 ('use server' + findUnique por botId arbitrario, sin auth() ni requireSuperAdmin en las 172 lineas del archivo) — identico al ledger; mi censo confirma que es la UNICA de las 200 server actions del repo con cero guard de rol y cero scoping (el detalle nuevo, que su string de unsafeGlobalQuery afirma un rol que nadie exige, va desarrollado en S4-03).
- [C-26 / BRIEF-NOMBRES-EN-SISTEMA] nombresEnSistema() en src/app/(protected)/setter/_actions/prospecto-bulk.actions.ts:143-146 trae todos los businessName del sistema sin acotar (bit de existencia global) — sin cambios, con su comentario de excepcion deliberada intacto en :124-142.
- [SEC-AUTH-04] Sin middleware global equivalente: src/proxy.ts:171-173 no cubre /api/* ni los POST de server action — sin cambios; es la premisa de S4-01 y S4-05, no un hallazgo propio de esta corrida.
- [SEC-AUTH-05] /api/track POST acepta organizationId arbitrario para SUPER_ADMIN (src/app/api/track/route.ts:26) — sin cambios.
- [C-03] registrarResultado (src/app/(protected)/setter/_actions/outreach.actions.ts:144-195) sigue sin guard de status terminal (PERDIDO) — confirmado vigente, ficha B-02 del backlog sin ejecutar.
- [BRIEF-ANTI-IDOR-CREATE] ownedLeadCreateData (src/lib/leados/isolation.ts:75-94) sigue armando el registro campo por campo y forzando assignedToId de sesion + caliente:false — verificado intacto, incluido el camino de lote (prospecto-bulk.actions.ts:104-110 via construirAltasLote).
- [BRIEF-PROXY-GUARD] La rama SETTER del proxy (src/proxy.ts:117-122) sigue sin condicionales por NODE_ENV ni flags QA — verificado intacto.


---

## S3 — Aislamiento multi-tenant en profundidad

> **Pasada de refutación adversarial:** **no** — el verificador murió por límite de sesión. Los hallazgos marcados *sin verificar* los sostiene una sola lectura, salvo los que verifiqué yo y están anotados como tales.

### [S3-01] Las dos piezas que cierran esta lente ya están construidas y NO están en la línea auditada: la golden suite GS.1 (@isolation, incluye impersonation y cookie forjada) y la frontera ESLint sobre los modelos del portal

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Ninguna — es una constatación sobre el estado del árbol auditado. El trabajo está hecho y probado (403280b declara 8/8 guards saboteados y demostrados sensibles); solo falta el merge. |

**Impacto.** (a) Qué se pierde: NO es un dato expuesto — es el enforcement. Sin GS.1 no existe ninguna prueba automatizada de que impersonation confine al tenant destino, de que una cookie de impersonation forjada se rechace, de que /api/reports/monthly devuelva 403 cross-org, ni de que callerCanAccessOrg/resolveScopedOrgId sostengan su matriz de borde (el ledger ya marcaba callerCanAccessOrg como 'hoy sin test'). Sin fa5ed47 no hay regla que avise cuando un archivo nuevo del portal consulta Prisma sin pasar por la frontera. (b) A quién: a todo el equipo — es la red que evita que una regresión de aislamiento llegue a prod sin ruido. (c) Precondiciones: ninguna, es el estado actual de la rama. No sube a ALTO porque no hay fuga demostrada hoy: el diseño manual sigue en pie y lo verifiqué a mano en esta corrida.

**Mecanismo.** `chore/auditoria-seguridad` @49fec9b (= origin/main al 2026-07-24) no tiene como ancestro ni a 403280b (GS.1, rama chore/gs-aislamiento, 2026-07-11) ni a fa5ed47 (frontera del portal, rama chore/security-quick-wins, 2026-07-21). Consecuencia verificable en el árbol: `grep -rn "@isolation"` sobre todo el repo devuelve CERO ocurrencias; no existe playwright.golden.config.ts, ni tests/golden/, ni src/lib/security/tenant-isolation.invariant.ts, ni el script npm test:isolation; eslint.config.mjs no menciona ningún modelo del portal. Además, las dos suites de aislamiento que SÍ existen en el árbol (tests/integration/chatbot-isolation.spec.ts y motor-isolation.spec.ts, 8 casos cada una) no están cableadas a ningún job: e2e.yml corre check:invariants, test:leados y test:e2e, y ni test:integration ni test:setter aparecen ahí.

**Evidencia.**

- `git merge-base --is-ancestor 403280b HEAD (desde C:\Users\franc\Desktop\wt-auditoria-seguridad)`
  > NO es ancestro de HEAD · git branch -a --contains 403280b → solo `chore/gs-aislamiento` · git log -1: 'Sat Jul 11 15:52:11 2026 | test(isolation): golden suite multi-tenant (cross-read, cross-write, impersonation, enumeración) + invariants'
- `git show --stat 403280b`
  > '8 tests Playwright: reports/monthly 403, leads/export, ticket page, enumeración, track (mutación), impersonation (scope + cookie forjada), + query-layer'; '1 invariante puro: callerCanAccessOrg + resolveScopedOrgId (matriz de borde)'; archivos: playwright.golden.config.ts, src/lib/security/tenant-isolation.invariant.ts, tests/golden/ — NINGUNO existe en 49fec9b
- `git merge-base --is-ancestor fa5ed47 HEAD`
  > NO es ancestro de HEAD · contenido en `chore/security-quick-wins` · 'fix(security): extender frontera de aislamiento a modelos del portal … 222 call-sites existentes (90 archivos) quedan como deuda migrable, volcados a security/multi-tenant-callsites-pendientes.txt'
- `grep -rn "@isolation" . --include=*.ts --include=*.json --include=*.md --include=*.mjs (excluyendo node_modules)`
  > 0 resultados en todo el repo
- `.github/workflows/e2e.yml:6-50`
  > jobs: invariants (`npm run check:invariants`), leados-integration (`npm run test:leados`), test (`npm run test:e2e`). No hay job que corra `test:integration` ni `test:setter` — las dos suites que prueban forOrg() no corren en ningún lado.

**Fix.** Mergear 403280b y fa5ed47 a main como primer paso del plan de remediación de esta auditoría, ANTES de escribir código nuevo de aislamiento. Al hacerlo: (1) sumar `test:isolation` y `test:integration` a .github/workflows/e2e.yml como jobs propios (hoy ni siquiera están en el agregado); (2) verificar que `check:invariants` incorpore tenant-isolation.invariant.ts (403280b declara que lo suma — confirmar tras el merge); (3) resolver el conflicto esperable en eslint.config.mjs entre el bloque del portal de fa5ed47 y los bloques existentes de motor/chatbot, teniendo presente el hazard de flat config ya documentado (CLEAN-4.0-HAZARD1): un segundo bloque no-restricted-syntax que solape archivos apaga en silencio el guard previo.

**Criterio de aceptación.** En main: `grep -rn "@isolation" tests/` devuelve los 8 tests; `npm run test:isolation` corre y pasa; `npm run check:invariants` incluye tenant-isolation.invariant.ts; e2e.yml tiene un job que ejecuta test:isolation y otro que ejecuta test:integration; y `npx eslint --no-config-lookup --config eslint.config.mjs` sobre un fixture que haga `prisma.ticket.findMany({where:{id}})` fuera de src/lib/isolation emite el warn del portal Y sigue emitiendo el error de `new PrismaClient` en un fixture del chatbot (prueba de que el bloque nuevo no pisó al viejo).

**Necesita decisión de Franco.** Sí: decidir el orden de merge de las dos ramas y si la regla del portal entra como `warn` (como la dejó fa5ed47, con 222 call-sites de deuda) o se sube a `error` con allowlist. Recomendación: entrar como warn tal cual está, para no bloquear el pipeline con deuda preexistente.

**Adjudicación del auditor.** Verificado por el padre: git merge-base --is-ancestor chore/gs-aislamiento origin/main da falso, y grep -rn @isolation sobre el arbol auditado devuelve cero.

### [S3-02] Conversation.sessionId es @unique GLOBAL: el namespace de sesión del widget público se comparte entre TODOS los tenants, y la colisión cae como 500 sin traducir

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sin auth. Basta poder POSTear a /api/chatbot/[slug]/chat de cualquier bot activo con un header Origin que la allowlist de ese bot acepte. El sessionId es un campo libre del body. |

**Impacto.** (a) Qué se logra: NO hay fuga de datos — verifiqué que toda lectura de Conversation por sessionId pasa por el scope relacional, así que un sessionId de otra org devuelve null, no la fila ajena. Lo que se logra es acoplamiento de DISPONIBILIDAD entre tenants: un string de sesión reclamado bajo el bot de la org A vuelve imposible crear la conversación con ese mismo string bajo el bot de la org B, y el visitante de B recibe HTTP 500 en el canal primario de conversión. Secundariamente es un oráculo de existencia global (200 vs 500 discrimina si el sessionId existe en ALGUNA org). (b) A quién: a cualquier visitante anónimo del widget de cualquier tenant. (c) Precondiciones: ninguna autenticación; solo un POST a /api/chatbot/{slug}/chat con Origin permitido (el header es forjable desde un cliente que no sea navegador) y un sessionId elegido — el schema acepta cualquier string de 1 a 200 caracteres. No sube a ALTO porque un ataque DIRIGIDO a un visitante concreto exige adivinar su UUIDv4, y no baja a BAJO porque el acoplamiento es estructural (vive en el schema, no en un call-site) y toca la superficie pública de mayor valor.

**Mecanismo.** El campo lleva `@unique` a nivel de columna (índice único global sobre chatbot_conversation.sessionId), mientras que el aislamiento del modelo es RELACIONAL (`{ botConfig: { organizationId } }`). Las dos mitades no coinciden: la LECTURA está correctamente acotada al tenant (findFirst compuesto con el scope → null para un sessionId de otra org), pero la ESCRITURA choca contra un índice que abarca todas las orgs. El resultado es que el camino `no lo encontré en mi org → lo creo` deriva en violación de unicidad. Ese error (P2002) no está contemplado en el traductor del helper de aislamiento —que sólo mapea P2025 y P2003— así que sube crudo hasta el catch externo del handler, que responde 500. Contrasta con el criterio que el propio repo aplica en el motor, donde las claves naturales llevan unique COMPUESTO por organización (ContactIdentity: organizationId+channelType+externalId; MotorMessage: organizationId+outboundIdempotencyKey), justamente para que 'el mismo dato conviva en A y en B sin colisión' — hay un test que lo afirma para el motor y otro para el email del lead del chatbot, pero ninguno para sessionId.

**Evidencia.**

- `prisma/schema.prisma:1375`
  > sessionId   String  @unique   (dentro de `model Conversation`, que arranca en :1368 y no tiene columna organizationId)
- `prisma/migrations/20260512150823_chatbot_init/migration.sql:142`
  > CREATE UNIQUE INDEX "chatbot_conversation_sessionId_key" ON "chatbot_conversation"("sessionId");
- `src/modules/chatbot/server/chat/handleChatRequest.ts:107`
  > sessionId: z.string().min(1).max(200),
- `src/modules/chatbot/server/conversation/resolver.ts:79-96`
  > const existing = await scope.conversation.findFirst({ where: { botConfigId: input.botConfigId, sessionId: input.sessionId } }) … if (existing) {…} … const conversation = await scope.conversation.create({ botConfigId: input.botConfigId, sessionId: input.sessionId, … })  — el create no captura P2002
- `src/lib/isolation/scoped-model.ts:358-375`
  > translateDbError: `if (error.code === 'P2025') …` y `if (error.code === 'P2003') …` — P2002 no está contemplado, el error de Prisma sale sin traducir
- `src/modules/chatbot/server/chat/handleChatRequest.ts:1640-1681`
  > } catch (unhandledError) { … return Response.json({ error: 'Internal server error in chatbot. Check server logs.' … }, { status: 500 })
- `prisma/schema.prisma:2092-2095, 2126, 2145 (bloque MotorMessage) y registry.ts:466-471`
  > MotorMessage: `@@unique([organizationId, outboundIdempotencyKey])` con el comentario 'el unique compuesto POR ORG es la garantía real'; ContactIdentity usa `organizationId_channelType_externalId` y el registry lo justifica: 'un upsert genérico aceptaría uniques globales … y podría pisar filas de otra org'
- `tests/integration/motor-isolation.spec.ts:231 y tests/integration/chatbot-isolation.spec.ts:233`
  > '(d) el mismo externalId convive en A y en B sin colisión (unique compuesto por org)' / '(d) el mismo email de lead convive en A y en B sin colisión' — el caso equivalente para sessionId no existe

**Fix.** Reemplazar el `@unique` de columna en Conversation.sessionId por un unique compuesto por tenant — `@@unique([botConfigId, sessionId])` — que es exactamente el par por el que ya consulta getOrCreateConversation, y que además sirve como índice de esa query. Migración aditiva: crear el índice compuesto, verificar que no haya sessionId duplicados legítimos, dropear el índice único global. En la misma pasada, agregar el mapeo de P2002 en translateDbError (scoped-model.ts) para que una violación de unicidad deje de escaparse como 500 crudo. Aplicar el mismo criterio de revisión a MotorMessage.providerMessageId (schema.prisma:2126), que es el otro @unique global alimentado por un tercero: ahí el riesgo es menor (el wamid lo genera Meta y exige credenciales de canal válidas para reclamarlo) pero la clase de defecto es idéntica.

**Criterio de aceptación.** Un test nuevo en tests/integration/chatbot-isolation.spec.ts, hermano del caso (d): sembrar dos orgs con sus bots, crear una Conversation con sessionId 'S' bajo el bot de A, y llamar a getOrCreateConversation con el MISMO sessionId 'S' bajo el bot de B → debe devolver una conversación nueva de B (isNew:true), no lanzar, y la fila de A debe quedar intacta. Complemento: en el camino HTTP, dos POST a /api/chatbot/{slugA}/chat y /api/chatbot/{slugB}/chat con idéntico sessionId devuelven ambos 200, no 500.

**Necesita decisión de Franco.** Sí, una: confirmar que ningún consumidor externo (export, n8n, reporting, o los scripts de evals que hacen `conversation.findUnique({where:{sessionId}})` en src/modules/chatbot/evals/capture.ts:96) depende de que el sessionId sea una llave global. Los evals son dev-only y namespacean sus sesiones con prefijo, así que el impacto esperado es nulo, pero la decisión de dropear un unique en producción la firma Franco.

**Adjudicación del auditor.** Verificado por el padre: prisma/schema.prisma:1375 dice literalmente `sessionId String @unique`.

### [S3-03] Los ~20 modelos del portal con organizationId están enteramente fuera del helper de aislamiento, y sus tres únicos guards no tienen un solo test cruzado

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | CONFIRMADO_SIN_TEST |
| **Precondiciones** | Para el estado actual: ninguna (es una constatación de cobertura). Para que se convierta en fuga: un solo call-site nuevo del portal que reciba un id del cliente y consulte por `{ id }` sin el organizationId — no hay linter, tipo ni test que lo detenga en la línea auditada. |

**Impacto.** (a) Qué está en juego: Ticket, Project, Message, Invoice, Subscription, Notification, ClientAsset, ClientBrandProfile, Service, OnboardingTask, OrganizationModule, EmailContact, EmailCampaign, BusinessMetric, PageView, WeeklyReportLog, ExecutiveBriefSnapshot, PanelAnnouncement, ReferralCode y OrgMember — o sea toda la data comercial y de soporte del cliente, incluidos contactos de email (PII) y facturación. (b) A quién: a cualquier ORG_MEMBER autenticado si un where se olvida en un call-site nuevo. (c) Precondiciones para daño: hoy NINGUNA fuga viva — leí ~25 de los 135 call-sites sin discriminante de org y todos caen en 'es el registro de tenants (User/Organization)', 'es superficie SUPER_ADMIN-only' o 'está guardado aguas arriba en la misma función'. La severidad viene de que el enforcement es 100% disciplina humana sobre la superficie con más server actions del repo, y de que los tres helpers que la sostienen no tienen ni un test. Se queda en MEDIO y no sube porque no hay explotación demostrada.

**Mecanismo.** El repo tiene DOS regímenes de aislamiento que no se tocan. Régimen fuerte: src/lib/isolation cubre 18 modelos (7 del motor + 11 del chatbot) con scope no-sobreescribible, guard atómico en update/delete, anti-IDOR de create, prohibición de re-parenting y rechazo de `cursor`; hay 35 archivos que lo usan y dos suites que lo prueban. Régimen débil: los ~20 modelos del portal quedan con where manual y tres helpers sueltos —assertTicketBelongsToOrg, assertProjectBelongsToOrg (re-consultan por id+org) y callerCanAccessOrg (evalúa un org ya cargado, y es no-op para SUPER_ADMIN)—. Ninguno de los tres aparece en un archivo de test o invariante del árbol. La frontera entre regímenes es exactamente la que fa5ed47 vino a marcar y que no está mergeada (ver S3-01).

**Evidencia.**

- `prisma/schema.prisma (awk por modelo sobre `organizationId String`)`
  > 30 modelos con columna organizationId. Los 18 cubiertos por el helper están listados en src/lib/isolation/index.ts:39-43 ('Cobertura: WabaChannel, ContactIdentity, MotorConversation, MotorMessage, MotorTemplate, MotorAlert (motor) + BotConfig, Conversation, ChatMessage, ChatbotLead, CrmIntegration…'). Los otros ~20 (ExecutiveBriefSnapshot :461, WeeklyReportLog :501, OrgMember :522, Service :541, Project :559, Message :600, Subscription :636, Notification :721, ClientAsset :743, ClientBrandProfile :758, Ticket :768, BusinessMetric :799, PageView :812, OnboardingTask :842, OrganizationModule :1193, EmailContact :1215, EmailCampaign :1236, PanelAnnouncement :1797, ReferralCode :1840) no aparecen en registry.ts.
- `src/lib/auth/assert-ownership.ts:32-56 y :81-89`
  > assertTicketBelongsToOrg / assertProjectBelongsToOrg / callerCanAccessOrg — los tres guards del portal. `grep -rn "callerCanAccessOrg|assertTicketBelongsToOrg|assertProjectBelongsToOrg" src/ tests/` devuelve 15 líneas, TODAS en src/, cero en tests/.
- `censo propio (script read-only sobre src/, 349 call-sites de Prisma en modelos con eje de org)`
  > 349 call-sites; 214 llevan organizationId u `organization:` en los args; 135 no. Cruce con forOrg: 35 archivos usan forOrg() contra 181 que importan @/lib/prisma directo.
- `src/lib/tickets/actions.ts:124-137 (ejemplo del régimen débil funcionando por disciplina)`
  > if (!isAdmin) { const organizationId = await resolveOrgId(); … await assertTicketBelongsToOrg(parsed.data.ticketId, organizationId) } — correcto, pero el guard depende de que alguien se acuerde de escribirlo; los updates de abajo (:188) consultan por `{ id }` solo.
- `git show --stat fa5ed47`
  > El propio equipo midió esta superficie: '222 call-sites existentes (90 archivos) quedan como deuda migrable, volcados a security/multi-tenant-callsites-pendientes.txt'

**Fix.** Dos movimientos, en este orden. (1) Mergear fa5ed47 (ver S3-01): pone la regla ESLint en `warn` sobre los ~20 modelos y deja el inventario de deuda en security/multi-tenant-callsites-pendientes.txt — costo cero de migración, cobertura inmediata para código NUEVO. (2) Escribir el test que hoy no existe para los tres guards: un invariante puro (sin DB) para callerCanAccessOrg con la matriz de borde (SUPER_ADMIN + org null → true; ORG_MEMBER + org propia → true; ORG_MEMBER + org ajena → false; ORG_MEMBER sin org → false; resourceOrgId null → false), que es exactamente lo que 403280b ya trae en src/lib/security/tenant-isolation.invariant.ts; y un spec de integración de dos actores para assertTicketBelongsToOrg/assertProjectBelongsToOrg (org A siembra, org B pide → ResourceNotOwnedError, fila de A intacta), hermano de tests/integration/chatbot-isolation.spec.ts.

**Criterio de aceptación.** (1) `npx eslint` sobre un archivo nuevo bajo src/app que haga `prisma.ticket.findMany(...)` emite el warn de frontera del portal. (2) `npm run check:invariants` incluye el invariante de callerCanAccessOrg y falla si se invierte la comparación `caller.organizationId === resourceOrgId`. (3) Un spec de integración nuevo prueba que assertTicketBelongsToOrg lanza ResourceNotOwnedError para un ticket de otra org, y falla si se le saca el `organizationId` del where.

**Necesita decisión de Franco.** Sí: si se migran los 222 call-sites del portal a un helper scoped (equivalente a forOrg para el eje del portal) o se acepta el régimen de disciplina + linter. Es una decisión de alcance de sprint, no de seguridad — el linter y los tests bajan el riesgo sin la migración.

### [S3-04] El ciclo de vida del token de impersonation no cierra: el logout no borra la cookie, el middleware gatea por mera presencia, y ninguna escritura queda marcada como hecha bajo impersonation

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ser SUPER_ADMIN con sesión válida. El riesgo es de rendición de cuentas (insider o cuenta comprometida), no de acceso no autorizado. |

**Impacto.** (a) Qué se pierde: NO es escalada de privilegios — el token está correctamente atado al admin que lo emitió, exige sesión SUPER_ADMIN viva y caduca a los 30 minutos (todo verificado). Lo que se pierde es la TRAZABILIDAD del acceso de máximo privilegio a los datos de un tercero: el par de eventos IMPERSONATION_STARTED/ENDED no acota la ventana real de acceso (un logout sin 'stop' deja la cookie viva y la impersonation se reanuda en el siguiente login del mismo admin sin generar un nuevo STARTED), y ninguna mutación hecha durante la impersonation queda etiquetada como tal —logAdminAction no tiene campo para eso—. (b) A quién: al operador, para reconstruir quién tocó los datos de qué cliente y cuándo. (c) Precondiciones: ser SUPER_ADMIN, que es la cuenta de máxima confianza — por eso no pasa de MEDIO. Pesa igual porque el producto captura PII de terceros bajo Ley 25.326 y la auditabilidad del acceso privilegiado ES el control, no un adorno.

**Mecanismo.** Tres huecos independientes en el mismo ciclo. (1) El cierre de sesión llama a signOut() y nada más; la cookie httpOnly `impersonation-token` sobrevive al logout, así que si el mismo admin vuelve a entrar dentro de la ventana de 30 minutos, resolveOrgId() devuelve de nuevo la org impersonada y /dashboard renderiza ese tenant sin que se haya emitido un segundo IMPERSONATION_STARTED — la bitácora muestra una sola apertura para dos ventanas de acceso. (2) El middleware decide `isImpersonating` por la sola PRESENCIA de la cookie, sin verificar firma, expiración ni el binding al adminId; esa señal es la que le abre /dashboard/* y /bienvenida a un SUPER_ADMIN. La verificación real (firma, adminId, expiración) vive un nivel más abajo, así que el sistema falla cerrado en los datos —resolveOrgId devuelve null y la página redirige— pero la noción de 'estoy impersonando' del middleware y la real pueden divergir. (3) El registro de auditoría no tiene dónde anotar el contexto: la interfaz de entrada de logAdminAction lleva userId/actionType/target/diff/metadata, y ninguna de las mutaciones del dashboard rellena metadata con 'esto se hizo impersonando a la org X'.

**Evidencia.**

- `src/actions/auth-actions.ts:5-7`
  > export async function signOutAction() { await signOut({ redirectTo: '/login' }) }  — no toca IMPERSONATION_COOKIE. El único jar.delete está en src/lib/actions/impersonation.ts:64, dentro de stopImpersonationAction.
- `src/proxy.ts:77`
  > const isImpersonating = Boolean(req.cookies.get(IMPERSONATION_COOKIE)?.value)  — consumido en :154 (`!(role === ADMIN_ROLE && isImpersonating)`) y :159; sin jwtVerify, sin chequeo de expiresAt, sin comparar adminId.
- `src/lib/impersonation.ts:54-80`
  > getImpersonationSession: exige `session?.user?.role === 'SUPER_ADMIN'`, verifica el token, y `if (payload.adminId !== session.user.id) return null` (:68) + `if (payload.expiresAt <= Date.now()) return null` (:72). Este SÍ es correcto — el binding y el TTL existen; el problema es que el middleware no lo usa.
- `src/lib/impersonation-constants.ts:2`
  > export const IMPERSONATION_DURATION_SECONDS = 30 * 60  — TTL de 30 min, también aplicado como maxAge de la cookie (impersonation.ts:88)
- `src/lib/actions/impersonation.ts:36-45 y :66-77`
  > logAdminAction con actionType 'IMPERSONATION_STARTED' / 'IMPERSONATION_ENDED' — los dos únicos eventos del ciclo; el ENDED sólo se emite si el admin usa stopImpersonationAction.
- `src/lib/audit-log.ts:5-14`
  > interface LogActionInput { userId; userEmail?; userName?; actionType; action; targetType; targetId; diff?; metadata? } — no hay campo de impersonation ni de org efectiva; ninguna llamada del dashboard lo suple por metadata.
- `src/lib/preview.ts:6-20`
  > resolveOrgId: para SUPER_ADMIN devuelve `impersonation?.orgId ?? null` — el discriminante de tenant de 48 call-sites depende enteramente de la cookie.

**Fix.** (1) Borrar la cookie en el logout: que signOutAction haga `(await cookies()).delete(IMPERSONATION_COOKIE)` antes del signOut, y —si se quiere el rastro completo— emita IMPERSONATION_ENDED cuando había token. (2) En proxy.ts, no derivar `isImpersonating` de la presencia del valor: como el middleware corre en edge y no puede usar getImpersonationSession (que llama a auth()+cookies() de server), la opción barata es verificar el JWT con jose ahí mismo (jwtVerify + chequeo de expiresAt + adminId contra req.auth.user.id); la alternativa sin criptografía en edge es aceptar la divergencia pero documentarla como decisión explícita en el propio archivo. (3) Agregar un campo opcional `impersonatedOrgId` a LogActionInput y al modelo de auditoría, y rellenarlo desde getImpersonationSession() dentro de logAdminAction (una sola llamada, todos los call-sites lo heredan sin tocarse).

**Criterio de aceptación.** (1) Tras `signOutAction()`, la respuesta trae un Set-Cookie que expira `impersonation-token`, y un login inmediato del mismo admin aterriza en /admin (no en /dashboard de la org previa). (2) Un request a /dashboard con una cookie `impersonation-token` de basura (no firmada) desde una sesión SUPER_ADMIN es rechazado por el middleware, no sólo por el server component. (3) Una mutación del dashboard hecha bajo impersonation deja una fila de auditoría cuyo campo impersonatedOrgId es el de la org destino; la misma mutación fuera de impersonation lo deja en null. Los tres casos están cubiertos por el test de impersonation de 403280b ('impersonation (scope + cookie forjada)') una vez mergeado — extenderlo con el caso de logout.

**Necesita decisión de Franco.** Sí: si el middleware verifica el JWT en edge (costo de latencia en cada request de /dashboard y /admin) o si se acepta y documenta que su `isImpersonating` es una señal optimista y el enforcement vive en el server component. Con dos personas operando, documentar la decisión puede ser la respuesta correcta — pero hay que tomarla, hoy está implícita.

### [S3-05] Tres dialectos vivos del discriminante de tenant (resolveOrgId · session.user.organizationId · getClientChatbotSession), con semánticas distintas frente a impersonation y ninguna prueba que los concilie

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Un usuario con role SUPER_ADMIN que además tenga una fila OrgMember. No existe hoy; lo crearía cualquier alta manual, un seed, o la feature 'develOP también usa su propio panel'. |

**Impacto.** (a) Qué pasaría: una escritura hecha desde /dashboard aterrizaría en la org equivocada — la del admin, no la del tenant que la UI está mostrando. (b) A quién: al tenant impersonado (sus datos quedan mal atribuidos) y a develOP (recibe datos de un cliente en su propia org). (c) Precondiciones: HOY NO SE PUEDE. Verifiqué que ningún camino de alta le da a un SUPER_ADMIN una fila OrgMember (los seeds crean a los admins sin membresía y las cinco altas de cliente rechazan un email ya registrado), así que `session.user.organizationId` es undefined para un admin y los 30 call-sites del dialecto A fallan cerrados con 'Sesión inválida'. Es BAJO y no MEDIO precisamente por eso: la precondición no es alcanzable en el estado actual. Lo reporto porque la precondición está a una feature de distancia (develOP dogfoodea su propio bot 'matsu' sobre la org `develop`, y basta con darle a Franco acceso al dashboard de esa org para que se cumpla).

**Mecanismo.** Coexisten tres funciones que responden a la pregunta '¿de qué organización es este request?', y no dan lo mismo. Dialecto B, resolveOrgId(): lee la sesión y, para SUPER_ADMIN, deriva la org de la cookie de impersonation — es el único consciente de la impersonation; lo usan 48 call-sites, incluido el layout del dashboard. Dialecto A, session.user.organizationId: sale del JWT, que lo tomó de la primera membresía del usuario; ignora la impersonation por completo; 30 call-sites, varios de ellos de ESCRITURA. Dialecto C, getClientChatbotSession(): re-consulta OrgMember contra la DB en cada request y tampoco conoce la impersonation; 11 call-sites, toda la sección de chatbot del dashboard más la ruta de export de leads. Con un admin impersonando, la misma pantalla puede leer por B (muestra el tenant destino) y escribir por A (apunta a la org del admin, si la tuviera). El desacople no está cubierto por ningún tipo, linter ni test: los tres son `string | null` y compilan igual.

**Evidencia.**

- `src/lib/preview.ts:6-20`
  > resolveOrgId — `if (role === 'ORG_MEMBER') return session?.user?.organizationId ?? null` / `if (role === 'SUPER_ADMIN') { const impersonation = await getImpersonationSession(); return impersonation?.orgId ?? null }`. 48 call-sites (`grep -rn "resolveOrgId()" src/`).
- `src/lib/actions/upsell.ts:16, src/actions/task-approvals.ts:72 y :125, src/lib/actions/announcements.ts:20`
  > `const organizationId = session?.user?.organizationId` y, en task-approvals, `organizationId: session.user.organizationId!` dentro de un create — dialecto A en camino de ESCRITURA. 30 call-sites en total.
- `src/modules/chatbot/server/admin/getClientSession.ts:5-27`
  > getClientChatbotSession = cache(async () => { const session = await auth(); … c.orgMember.findFirst({ where: { userId: session.user.id }, … }) }) — no consulta rol ni impersonation. 11 call-sites, entre ellos src/app/api/dashboard/chatbot/leads/export/route.ts (export CSV de leads con PII).
- `src/auth.ts:26-45`
  > orgMemberships: { … take: 1 } → `const organizationId = membership?.organizationId` — el origen del dialecto A.
- `prisma/seed.ts:82-97 y prisma/seed-agency-os.ts:345-393`
  > los usuarios SUPER_ADMIN (admin@develop.com, franco@, valentino@) se crean sin ninguna llamada a orgMember.upsert asociada → session.user.organizationId undefined para admins (verificado; es lo que hace que el dialecto A falle cerrado hoy)
- `src/lib/actions/invitations.ts:67-70 · src/modules/chatbot/server/admin/createClientOnly.ts:60-64 · createClientWithBot.ts:110-114 · src/lib/onboarding/core.ts:69-73 · src/lib/actions/clients.ts:103`
  > las cinco altas rechazan un email ya registrado ('Ya existe un usuario con ese email' / 'ya está registrado en el sistema') → un usuario = una org, no hay camino de UI que cree la segunda membresía

**Fix.** Colapsar a un solo dialecto. resolveOrgId() es el correcto (es el único consciente de impersonation): reescribir los 30 call-sites del dialecto A para que lo usen, y hacer que getClientChatbotSession derive su org de resolveOrgId() en vez de re-consultar OrgMember (así el chatbot del dashboard también funciona bajo impersonation, que hoy no funciona). Mientras la migración no ocurra, el candado barato es un invariante puro que afirme la relación entre los tres —dado (role, organizationId de sesión, payload de impersonation), los tres deben devolver el mismo valor o null—, más una regla ESLint no-restricted-syntax que marque `session.user.organizationId` fuera de src/lib/preview.ts y src/auth*.

**Criterio de aceptación.** `grep -rn "user\.organizationId" src/` no devuelve resultados fuera de src/lib/preview.ts, src/auth.ts y src/auth.config.ts; y un test de impersonation (el de 403280b, extendido) demuestra que una escritura hecha desde /dashboard bajo impersonation de la org X crea la fila con organizationId = X, no con la del admin.

**Necesita decisión de Franco.** Sí: definir si develOP va a ser cliente de sí misma en el panel (es decir, si un SUPER_ADMIN va a tener OrgMember). Si la respuesta es sí, este hallazgo pasa de latente a activo y el fix deja de ser opcional.

### [S3-06] El tenant de la sesión se elige con `take: 1` / `findFirst` sin orderBy sobre las membresías: con dos membresías, a qué organización queda atada la sesión es no determinístico

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Un User con ≥2 filas OrgMember. Hoy sólo alcanzable por escritura manual en DB, un seed, o una feature futura de 'invitar a mi equipo' / 'este contacto trabaja para dos clientes'. |

**Impacto.** (a) Qué pasaría: la sesión de un usuario con dos membresías quedaría atada a una u otra organización de forma arbitraria y potencialmente CAMBIANTE entre logins o refrescos del JWT — o sea, lectura y escritura completas sobre un tenant que el usuario no eligió, sin ningún error visible. (b) A quién: al segundo tenant. (c) Precondiciones: un usuario con dos o más filas OrgMember. Verifiqué que hoy no hay ningún camino que lo produzca (las cinco altas rechazan emails ya registrados), y el schema del portal es 1 usuario ↔ 1 org en la práctica. BAJO por eso. No lo descarto porque el schema SÍ lo permite explícitamente (el unique es por par usuario-organización, no por usuario) y el enum OrgRole con ADMIN/MEMBER/VIEWER anticipa equipos, que es justo la feature que rompería la premisa.

**Mecanismo.** Cinco lugares distintos resuelven usuario→organización tomando la PRIMERA membresía sin ordenarla. En Postgres, un SELECT con LIMIT 1 y sin ORDER BY no garantiza qué fila vuelve, y el orden puede cambiar entre ejecuciones (por un UPDATE que reubica la tupla, por un cambio de plan de ejecución, por un vacuum). El valor así elegido se guarda en el JWT y se convierte en el discriminante de aislamiento de todo el dashboard vía resolveOrgId. No hay ninguna columna que marque cuál es la membresía 'primaria' ni ningún criterio de desempate (ni joinedAt, ni role, ni un flag).

**Evidencia.**

- `src/auth.ts:26-45`
  > orgMemberships: { select: {…}, take: 1 } … const membership = dbUser?.orgMemberships[0] … const organizationId = membership?.organizationId  — sin orderBy
- `src/auth.ts:145-166`
  > orgMemberships: { select: { organizationId: true, role: true }, take: 1 } … const primaryMembership = user.orgMemberships[0] … organizationId: primaryMembership?.organizationId ?? undefined  — la variable se llama 'primary' pero nada define la primacía
- `src/modules/chatbot/server/admin/getClientSession.ts:15-24`
  > c.orgMember.findFirst({ where: { userId: session.user.id }, include: { organization: { include: { botConfig: true } } } })  — sin orderBy; es la raíz de sesión del dashboard de chatbot
- `src/app/api/qa/login/route.ts:118-142 y src/app/login/actions.ts:88-100`
  > mismo patrón `orgMemberships … take: 1` → `user.orgMemberships[0]` / `userRecord?.orgMemberships?.[0]?.organization`
- `prisma/schema.prisma:519-533`
  > model OrgMember { … @@unique([userId, organizationId]) … } — el unique es por PAR, no por userId: el schema admite N organizaciones por usuario a propósito

**Fix.** Dos capas. (1) Determinismo inmediato y barato: agregar `orderBy: [{ joinedAt: 'asc' }, { id: 'asc' }]` a los cinco sitios, para que la membresía elegida sea siempre la misma fila. Es un cambio de una línea por sitio y no altera el comportamiento con una sola membresía. (2) Explicitar el modelo: o bien un invariante/drift-check que falle si existe algún userId con más de una fila OrgMember (mientras el producto sea 1:1), o bien —si se decide soportar multi-org— un selector de organización en la UI y que el orgId viaje en la sesión sólo tras una elección explícita, nunca inferido.

**Criterio de aceptación.** Los cinco sitios llevan orderBy explícito; y una query de chequeo (`SELECT "userId", count(*) FROM "OrgMember" GROUP BY 1 HAVING count(*) > 1`) devuelve cero filas, corrida como parte de check:invariants o del script de salud de DB. Si devuelve filas, el chequeo falla y obliga a la decisión de producto.

**Necesita decisión de Franco.** Sí: ¿el producto es 1 usuario = 1 organización, o va a soportar multi-org? De la respuesta depende si el fix es un invariante que prohíbe el caso o un selector de organización en la UI.

### [S3-07] El escape cross-org unsafeGlobalQuery llegó a 51 usos en caminos de producción sin ningún techo, y la regla ESLint que prohíbe Prisma directo en chatbot/motor lo convirtió en el embudo por donde pasa todo lo no scopeado

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ninguna hoy. El daño requiere que un uso futuro del escape quede accesible desde una superficie no-SUPER_ADMIN. |

**Impacto.** (a) Qué está en juego: cada uso de unsafeGlobalQuery es, por definición, una consulta que ve TODAS las organizaciones. Revisé una muestra y las que leí son legítimas (resolución de tenant por slug o por channelToken, alta de tenants, raíz de sesión, tooling admin). El riesgo no es un uso concreto sino la ausencia de techo: nada falla si mañana hay un uso 52 en un archivo equivocado. (b) A quién: potencialmente a todos los tenants, si un uso global aterriza en una superficie de cliente. (c) Precondiciones: un error futuro de call-site. Que la clase es real ya está probado: SEC-02 (runPreflightChecks, 'use server' sin ningún guard, filtra KB y welcome de cualquier tenant) es exactamente ese error, y sigue abierto en el ledger. BAJO porque es preventivo — no encontré un uso vivo mal ubicado.

**Mecanismo.** El diseño del helper declara el escape como excepción rara y greppable, pensada para 'alta de tenants, crons cross-org, tooling admin'. Al mismo tiempo, eslint.config.mjs prohíbe importar @/lib/prisma dentro de src/modules/chatbot y src/modules/motor. La combinación produce un embudo: toda consulta legacy del chatbot que no encajaba en el scope se reescribió como unsafeGlobalQuery, porque era la única puerta disponible. Hoy hay 51 usos en caminos de producción repartidos en 31 archivos (68 contando scripts de dev y evals, en 37 archivos), y no existe ningún conteo, allowlist ni drift-check que los enumere y falle cuando aparece uno nuevo — el único control es el `reason` obligatorio, que es documentación, no enforcement. Seis de esos archivos hacen lecturas cross-org sin ningún guard de rol DENTRO de la función: dependen enteramente de que el caller sea una página bajo el layout SUPER_ADMIN.

**Evidencia.**

- `src/lib/isolation/index.ts:78-92`
  > 'Escape explícito para lo legítimamente GLOBAL (alta de tenants, crons cross-org, tooling admin). El `reason` es obligatorio también en tipos … El nombre está elegido para grep' — el único control es el string de motivo
- `grep -rn "unsafeGlobalQuery(" src/ (excluyendo isolation/index.ts, evals/, prisma/seed, update-proactive-prompts)`
  > 51 usos en 31 archivos de producción; los de mayor densidad: manageAlerts.ts (5), archiveClient.ts (4), updateClient.ts (3), createClientWithBot.ts (3), createClientOnly.ts (3). Contando todo: 68 usos en 37 archivos.
- `eslint.config.mjs:41, :65, :72, :83`
  > 'src/modules/motor no puede importar @/lib/prisma directamente. Usar src/lib/isolation/ (B0-S2)' y 'El chatbot no puede importar @/lib/prisma directamente. Usar src/lib/isolation/ (forOrg / unsafeGlobalQuery) — B0-S3' — la regla nombra el escape como salida sancionada, y no hay ninguna otra regla que lo acote
- `src/modules/chatbot/server/admin/{getActivityChartData,getLatencyHistory,listAllBots,detectBotIssues,multiTenantQueries,createBot}.ts`
  > seis archivos con usos cross-org y cero ocurrencias de requireSuperAdmin/SUPER_ADMIN/resolveOrgId/getClientChatbotSession dentro del archivo (medido con grep -c). Ninguno lleva 'use server', así que hoy sólo son alcanzables vía sus callers — que es justamente la garantía que no está automatizada.
- `src/modules/chatbot/server/admin/preflightChecks.ts:1 y :13`
  > 'use server' + `export async function runPreflightChecks(botId: string)` sin guard de rol — el SEC-02 ya documentado; es la prueba de que la clase se materializó una vez

**Fix.** Poner un techo al escape, no eliminarlo. Lo más barato: un drift-check en check:invariants que cuente los usos de unsafeGlobalQuery contra un número esperado guardado en el repo (mismo patrón que ya usa el proyecto para otros pares de listas que divergen), de modo que agregar uno nuevo obligue a subir el número a mano — un momento de fricción deliberado donde alguien revisa el motivo. Complemento: una regla ESLint que exija que todo archivo con unsafeGlobalQuery esté bajo src/modules/*/server/admin/, src/lib/isolation/ o una allowlist explícita, para que un uso en src/app/(protected)/dashboard/** no compile en silencio.

**Criterio de aceptación.** `npm run check:invariants` falla cuando se agrega un uso nuevo de unsafeGlobalQuery sin actualizar el conteo esperado, y pasa cuando se actualiza. Un fixture con unsafeGlobalQuery bajo src/app/(protected)/dashboard/ dispara el error de ESLint.

**Necesita decisión de Franco.** No para el drift-check (es mecánico). Sí, en una segunda pasada, para decidir cuáles de los 51 usos son deuda migrable a forOrg y cuáles son legítimamente globales para siempre — pero eso no bloquea poner el techo.

#### Ya documentado en auditorías previas — no se re-reporta (11)

- SEC-CACHE-02 — cache keys globales admin-clients/admin-leads/admin-alerts-count/admin-revision-resumen sin orgId: re-verificadas idénticas (admin/clients/page.tsx:20 y :31, admin/leads/page.tsx:21, admin/layout.tsx:10 y :21, admin/projects/page.tsx:7); siguen siendo listados globales SUPER_ADMIN-only, sin leak.
- SEC-CACHE-01 — botCache de resolveBotBySlug con TTL 60 s e invalidación sólo manual: idéntico en src/modules/chatbot/server/conversation/resolver.ts:10-11 y :46-48; la clave es el slug (por tenant), así que no cruza orgs.
- BRIEF-3.1-NO-RLS — cero políticas RLS en las migraciones; el aislamiento vive entero en la capa de aplicación. Sin cambios.
- A-13 — la denegación de mutación cruzada del setter sigue testeada en 2 de ~19 write-paths; tests/setter/02-isolation.spec.ts mantiene sus 4 casos (C1-C4) y no se agregaron specs cruzados.
- SEC-10 — fallback hardcodeado del secret de impersonation: idéntico en src/lib/impersonation.ts:14-22, literal 'develOP-dev-impersonation-secret' en :19.
- SEC-AUTH-08 / SEC-18 — startImpersonationAction sigue sin Zod sobre el orgId (src/lib/actions/impersonation.ts:11), mitigado por el findUnique + redirect de :17-24.
- SEC-02 — runPreflightChecks sigue siendo 'use server' sin ningún guard de rol (src/modules/chatbot/server/admin/preflightChecks.ts:1 y :13).
- CLEAN-4.1-R7 — el guard ESLint de acceso a Prisma sigue acotado a src/modules/chatbot y src/modules/motor (eslint.config.mjs:41, :65, :72, :83); nada cubre src/app ni src/lib.
- INT-02 — CrmSyncAttempt conserva organizationId denormalizado sin FK; el helper lo trata como modelo con columna propia (registry.ts:433-451) y prohíbe el re-parenting de leadId/integrationId.
- OBS-10 / DATOS-CAND-e2e-yml — .github/workflows/e2e.yml sigue dentro de logic-core-v3/ y no en la raíz del repo (la raíz sólo tiene db-backup.yml), así que ese workflow no lo ejecuta GitHub Actions. Lo cito como contexto de S3-01, no como hallazgo propio.
- F7 / IDOR de opt-out — cerrado y verificado: /api/email/optout/[contactId] y /api/email/unsubscribe-executive exigen HMAC con timingSafeEqual y scopes separados (src/lib/email/unsubscribe-token.ts), con 5 tests en tests/e2e/20-idor-optout.spec.ts.


---

## S4 — Superficie pública y validación de entrada

> **Pasada de refutación adversarial:** sí, agente independiente.

### [S4-01] El escape `origin === https://develop.com.ar` de validateOrigin se aplica a TODOS los bots y precede al check de allowedDomains: la allowlist de dominios del widget es un no-op para cualquier cliente que mande ese header

| | |
|---|---|
| **Severidad** | ALTO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sin auth. Solo hace falta conocer el slug del bot objetivo (enumerable desde /health y /config, ambos publicos) y poder setear el header Origin — cualquier cliente HTTP no-browser lo hace. |

**Impacto.** (a) Que se logra: conversar con el bot de CUALQUIER organizacion, consumiendo su cupo mensual de conversaciones y su gasto de Vertex AI, y obtener las respuestas construidas con la KB completa de ese tenant (businessInfo, servicios, precios, politicas via buildSystemPrompt). Ademas capturar/inyectar leads en el CRM de ese tenant por la tool capture_lead. (b) A quien: a cualquiera en internet, sin autenticacion. (c) Precondiciones: conocer el slug del bot — que es publicamente descubrible por /api/chatbot/[slug]/health y /api/chatbot/[slug]/config, y ademas aparece en claro en el snippet de instalacion que el cliente pega en su sitio. NO es CRITICO porque no expone datos privados de otra org (leads guardados, transcripciones ajenas, credenciales) ni permite mutar registros fuera del flujo de conversacion; el techo del dano economico lo pone plan.quota. Pero anula por completo el UNICO control de acceso que tiene la superficie de ataque primaria del producto, para los 100% de los tenants a la vez.

**Mecanismo.** validate-origin.ts:69-75 devuelve `{allowed:true}` en cuanto el Origin es exactamente `https://develop.com.ar` o `https://www.develop.com.ar`. Ese return esta ubicado ANTES del check `bot.allowedDomains.length === 0` (:78-80, la rama que el propio codigo describe como 'bloquea en prod') y antes de `originMatchesAllowed` (:83). La excepcion no esta acotada al bot de develOP: se evalua para cualquier `botSlug` que llegue por la URL. Como el header Origin es un dato de entrada y validateOrigin no lo corrobora contra ninguna prueba de posesion del dominio, cualquier cliente que lo declare pasa el gate de todos los bots. El mismo escape esta duplicado aguas abajo en handleChatRequest.ts:257-263, asi que el cap de dominios por plan (isOriginWithinPlanCap) tampoco frena nada por ese camino. Existe ademas una via de entrega nativa de navegador: /embed/[slug] (embed/[slug]/page.tsx:29-44) renderiza el bot de cualquier slug sin ningun check de origen, y next.config.ts:85-89 le pone `frame-ancestors *`, de modo que un tercero puede iframear el bot de cualquier tenant en su propio sitio y las requests salen con el Origin de develOP legitimamente puesto por el navegador. El header `frame-ancestors *` aislado ya esta en el ledger como SEC-15; lo nuevo es que combinado con el escape de origen convierte /embed en un proxy universal a los bots ajenos.

**Evidencia.**

- `src/lib/security/validate-origin.ts:69-75`
  > // Dominio de develOP siempre permitido (antes del check de allowedDomains)\n  if (\n    origin === 'https://develop.com.ar' ||\n    origin === 'https://www.develop.com.ar'\n  ) {\n    return { allowed: true, botConfigId: bot.id, organizationId: bot.organizationId }\n  }
- `src/lib/security/validate-origin.ts:77-85`
  > // Sin dominios configurados → bloquea en prod\n  if (bot.allowedDomains.length === 0) { ... }\n  // Match exacto o subdominio (delegado al matcher compartido)\n  if (originMatchesAllowed(origin, bot.allowedDomains)) {
- `src/modules/chatbot/server/chat/handleChatRequest.ts:257-263`
  > // develop.com.ar nunca cae al cap\n  if (\n    origin === 'https://develop.com.ar' ||\n    origin === 'https://www.develop.com.ar'\n  ) {\n    return true\n  }
- `src/app/embed/[slug]/page.tsx:29-37`
  > const bot = await prisma.botConfig.findUnique({ where: { slug }, select: { isActive: true } })\n  // 404 only if the bot doesn't exist.\n  if (!bot) notFound()
- `next.config.ts:85-89`
  > source: '/embed/:slug*',\n        headers: [\n          { key: 'Content-Security-Policy', value: "frame-ancestors *;" },
- `src/proxy.ts:172`
  > matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password']  // ni /api ni /embed

**Fix.** En src/lib/security/validate-origin.ts, acotar el escape de develOP al bot propio en vez de aplicarlo global: mover el bloque :69-75 DESPUES de resolver el bot y condicionarlo a que el bot sea el de develOP (comparar `bot.organizationId` contra la org de la agencia, o exigir que 'develop.com.ar' este listado en `bot.allowedDomains` como cualquier otro dominio — la opcion mas simple y sin caso especial es sembrar el dominio en allowedDomains del bot 'develop' y BORRAR el escape). Replicar el borrado en handleChatRequest.ts:257-263 (o mejor, eliminar la duplicacion moviendo la decision a un unico `isFirstPartyOrigin()` compartido, que es lo que ya propone CLEAN-1.2-ORIGIN). Para /embed: exigir en embed/[slug]/page.tsx que el Referer/Sec-Fetch-Site del embebedor matchee `bot.allowedDomains` antes de renderizar, y cambiar `frame-ancestors *` por la lista de dominios del bot (esto ultimo es la R18 ya prevista en el comentario de next.config.ts:84).

**Criterio de aceptación.** Un POST a /api/chatbot/<slug-de-un-bot-cuyos-allowedDomains-NO-incluyen-develop.com.ar>/chat con `Origin: https://develop.com.ar` devuelve 403 con `{"error":"Origin not allowed"}`, y queda un ChatbotEvent SECURITY.BLOCKED_ORIGIN en la org de ese bot. El mismo POST contra el bot de develOP sigue devolviendo 200. Cubrirlo con un invariante puro sobre validateOrigin (mockeando el findUnique) que afirme: para bot X con allowedDomains=['cliente.com'], origin='https://develop.com.ar' → allowed=false; y sumarlo al agregado `check:invariants` de package.json:18 (no como script suelto).

**Necesita decisión de Franco.** Si el bot de develOP debe seguir siendo servible desde www.develop.com.ar ademas de develop.com.ar (definir la lista exacta a sembrar en allowedDomains), y si /embed debe seguir siendo iframeable por terceros o pasa a whitelist por bot (esto ultimo es la decision R18 ya pendiente).

**Qué encontró el verificador.** Abri validate-origin.ts: el bloque de escape esta EXACTAMENTE en :69-75 y devuelve {allowed:true, botConfigId, organizationId} para cualquier bot resuelto por `botSlug`, ANTES del check `bot.allowedDomains.length === 0` (:78-80) y de `originMatchesAllowed` (:83). La cita es literal. Busque activamente el guard aguas arriba y NO existe: lei chat/route.ts completo (105 lineas) — validateOrigin en :43 es el unico gate antes de checkRateLimit (:75) y handleChatRequest (:91); proxy.ts:172 confirma que el matcher es ['/admin','/dashboard','/setter','/login','/bienvenida','/cambiar-password'] — ni /api ni /embed. La duplicacion aguas abajo esta literal en handleChatRequest.ts:257-263 y verifique que isOriginWithinPlanCap se consume en :561, o sea que el escape efectivamente saltea el cap del plan. embed/[slug]/page.tsx:29-37 y next.config.ts:85-89 (source '/embed/:slug*' + frame-ancestors *) tambien son citas literales. Verifique ademas que NO hay test ni invariante que cubra validateOrigin: `grep -rln 'validateOrigin|validate-origin|allowedDomains'` sobre tests/ y *.invariant.ts devuelve UN solo archivo, y es el de fix-origin (que no toca el escape). Contra-argumentos que probe y no prosperaron: (a) no hay condicion de entorno que apague el escape — no esta bajo NODE_ENV ni flag; (b) el tipo no impide nada (origin es `string | null` del header); (c) la ruta es alcanzable sin sesion. Severidad: la sostengo en ALTO por ser alcanzable sin auth contra el 100% de los tenants, con consumo de cupo pago ajeno (tryReserveConversation en :653 pone el techo, no el piso) e inyeccion de leads via capture_lead.

**Corrección aplicada.** Dos matices. (1) La sub-cadena de /embed como 'proxy nativo de navegador' NO la pude cerrar: depende de que el host de produccion sea literalmente develop.com.ar. La fixture del invariante usa `develop-portfolio.netlify.app` como Host (fix-origin-same-origin.invariant.ts:104-108), asi que si el deploy sirve desde el dominio Netlify, un fetch same-origin desde /embed mandaria Origin=<host-netlify> y NO matchearia el escape. El mecanismo central (setear el header desde cualquier cliente HTTP) no necesita esa sub-cadena — bajo la confianza SOLO de ese parrafo, no del hallazgo. (2) 'NUEVO' es parcialmente inexacto: las MISMAS lineas ya estan en el ledger como CLEAN-1.2-ORIGIN (validate-origin.ts:71-72 + handleChatRequest.ts:259-260), pero catalogadas como duplicacion DRY con impacto 'solo pega en el harness prod-QA local'. Lo genuinamente nuevo es la consecuencia de seguridad, no el locus. Dato para el fix que el hallazgo no menciona: tests/e2e/05-config-public.spec.ts:5 depende del escape (manda Origin: https://develop.com.ar contra el slug 'develop'), asi que sembrar el dominio en allowedDomains del bot propio es condicion para que borrar el escape no rompa la suite.

### [S4-03] Las dos capas de rate-limit del chat publico se llavean con material que el atacante controla: el `origin` de la route (variable por subdominio arbitrario) y el `sessionId` del body en el limiter interno — el fix que cerro SEC-RATELIMIT-02 reintrodujo el mismo defecto en otra dimension

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Sin auth. Conocer el slug del bot y un dominio de su allowedDomains (o usar el escape de S4-01, que elimina incluso ese requisito). |

**Impacto.** (a) Que se logra: emitir llamadas a Vertex AI muy por encima de los 30/min y 10/min nominales desde una sola IP, sin navegador. (b) A quien: le cuesta al tenant dueño del bot (su cupo mensual de conversaciones y el gasto LLM asociado) y a develOP (factura de Vertex). (c) Precondicion: conocer el slug y un dominio autorizado del bot (o directamente usar S4-01, que hace innecesario incluso eso). Es MEDIO y no ALTO porque existe un techo duro aguas abajo que el rate-limit no es el unico en poner: `tryReserveConversation(orgId, bot.id, plan.quota)` (handleChatRequest.ts:653) corta las conversaciones nuevas al cupo del plan y cae a modo degradado. O sea: el abuso agota el cupo del tenant mas rapido, pero no genera gasto ilimitado. CAMBIO_DE_ESTADO: el ledger registra SEC-RATELIMIT-02 como 'CERRADO-SIN-TEST' porque la key paso de sessionId a origin+sha256(IP); verifique que el reemplazo mantiene una dimension controlable (origin) y que la capa interna sigue usando sessionId tal cual.

**Mecanismo.** Capa 1 (route): chat/route.ts:74 arma `rateKey = chatbotPerSession:${origin}:${ipHash}`. El comentario de :70 defiende correctamente la parte de IP ('no spoofeable desde afuera'), pero la parte de origin no tiene esa propiedad: solo tiene que sobrevivir a validateOrigin, y originMatchesAllowed acepta CUALQUIER subdominio de un dominio autorizado por `originHost.endsWith('.' + clean)` (origin-matcher.ts:40). Como el matcher solo compara strings y jamas verifica que el emisor realmente este alojado ahi, la cantidad de valores de `origin` que pasan el gate es ilimitada: cada etiqueta de subdominio distinta produce una key distinta y por lo tanto un bucket nuevo de 30/min. Capa 2 (handler interno): handleChatRequest.ts:436-439 usa `chatbotPerBotSession:${slug}:${body.sessionId}`, y sessionId viene del body validado solo por forma (`z.string().min(1).max(200)`, requestBodySchema en :107) — o sea, tambien ilimitado. Las dos capas comparten el mismo defecto de diseño: la clave incluye un identificador que el solicitante elige. La unica dimension no elegible (el hash de IP) esta presente en la capa 1 pero acompañada de una que la diluye, y ausente por completo en la capa 2.

**Evidencia.**

- `src/app/api/chatbot/[slug]/chat/route.ts:71-79`
  > const ipHash = createHash('sha256').update(fwd ?? real ?? 'no-ip').digest('hex').slice(0, 24)\n  const rateKey = `chatbotPerSession:${origin ?? 'no-origin'}:${ipHash}`
- `src/lib/security/origin-matcher.ts:39-41`
  > if (originHost === clean) return true\n    if (originHost.endsWith('.' + clean)) return true
- `src/modules/chatbot/server/chat/handleChatRequest.ts:436-439`
  > const rateLimit = await checkRateLimit({\n    key: `chatbotPerBotSession:${slug}:${body.sessionId}`,\n    limit: RATE_LIMIT_PRESETS.chatbotPerBotSession.limit,
- `src/modules/chatbot/server/chat/handleChatRequest.ts:107`
  > sessionId: z.string().min(1).max(200),
- `src/lib/rate-limit/presets.ts:27-33`
  > chatbotPerSession: { limit: 30, windowMs: 60_000 },\n  chatbotPerBotSession: { limit: 10, windowMs: 60_000 },
- `src/modules/chatbot/server/chat/handleChatRequest.ts:653`
  > const reserve = await tryReserveConversation(orgId, bot.id, plan.quota)

**Fix.** En src/app/api/chatbot/[slug]/chat/route.ts:74, sacar `origin` de la clave y llavear por `slug` + ipHash: `chatbotPerSession:${slug}:${ipHash}`. El slug viene de la ruta y esta acotado al conjunto de bots existentes; el ipHash es la unica dimension no elegible por el solicitante. Si se quiere conservar granularidad por dominio embebedor, normalizar el origin al dominio REGISTRADO que matcheo (el `clean` de origin-matcher, no el host completo) — eso vuelve el espacio de claves finito e igual al tamaño de allowedDomains. En handleChatRequest.ts:436-439, cambiar la clave a `${slug}:${ipHash}` (ipHash ya esta calculado en la linea inmediatamente anterior, :435) y dejar sessionId solo como etiqueta de log. Ambas capas quedan asi con espacio de claves acotado, lo que ademas cierra la mitad del problema de S4-04.

**Criterio de aceptación.** Desde una sola IP, 31 POSTs a /api/chatbot/<slug>/chat en menos de 60s variando el header Origin entre subdominios distintos de un mismo dominio autorizado devuelven 429 a partir del 31. Idem variando `sessionId` en el body contra el limiter interno a partir del 11. Test de integracion en tests/integration que afirme que dos requests con Origin distinto pero misma IP comparten bucket.

**Necesita decisión de Franco.** Si se acepta perder la granularidad por dominio embebedor en el rate-limit (un tenant con 3 sitios pasa a compartir un solo cupo por IP visitante). Mi lectura es que si — el cupo es por visitante, no por sitio — pero es una decision de producto.

**Qué encontró el verificador.** Las cuatro citas son literales. chat/route.ts:71-74: `rateKey = chatbotPerSession:${origin ?? 'no-origin'}:${ipHash}` — el origin entra crudo en la clave. origin-matcher.ts:39-41 confirma `originHost.endsWith('.' + clean)` sin ninguna prueba de posesion del dominio, o sea espacio de subdominios infinito → un bucket de 30/min por cada etiqueta inventada. handleChatRequest.ts:436-439 sigue llaveando por `chatbotPerBotSession:${slug}:${body.sessionId}` con sessionId validado solo por forma en :107 (`z.string().min(1).max(200)`), y verifique el detalle que hace trivial el fix: `const ipHash = hashIp(clientIp)` ya esta calculado en la linea inmediatamente anterior (:435) y hoy solo se usa para logging (:444). presets.ts:27/33 confirma 30/min y 10/min, y el techo que el hallazgo invoca para NO inflar la severidad tambien lo verifique: tryReserveConversation esta en handleChatRequest.ts:653 con plan.quota. El CAMBIO_DE_ESTADO es correcto contra SEC-RATELIMIT-02 (ledger: 'CERRADO-SIN-TEST, key ahora origin + sha256(IP)'): la dimension controlable no desaparecio, se mudo de sessionId a origin, y la capa interna quedo igual (el ledger la ubicaba en :285-287, hoy vive en :436-439).

**Corrección aplicada.** Una imprecision en la cadena, no en el hallazgo: los dos vectores NO se componen como sugiere el texto de precondiciones. Si el atacante usa el escape de S4-01 (Origin: https://develop.com.ar) la clave queda FIJA en ese literal → un solo bucket de 30/min, o sea el rate-limit funciona. Para multiplicar buckets hace falta el otro camino: un bot con allowedDomains poblado y variar subdominios de un dominio autorizado (que es lo que habilita origin-matcher.ts:40). Son vectores alternativos, no acumulativos. La capa interna (sessionId) si es evadible en ambos casos, pero por si sola esta topeada aguas arriba por los 30/min de la route.

### [S4-04] La tabla rate_limit no tiene job de purga y tres endpoints publicos derivan la clave de datos que el atacante elige libremente — el peor caso es el webhook del motor, donde la clave sale del path ANTES de cualquier autenticacion: cada request con un token nuevo inserta una fila permanente y estrena un cupo de 600/min

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sin auth ni conocimiento previo para el vector del motor. Para los vectores del chat, ademas: slug + un dominio autorizado (o el escape de S4-01). |

**Impacto.** (a) Que se logra: crecimiento ilimitado de filas en la tabla rate_limit de Neon (almacenamiento facturado, nunca liberado) y una consulta de escritura a la DB por request, desde un cliente anonimo; y de paso, que el 429 del webhook nunca dispare porque cada token estrena su propio bucket. (b) A quien: a develOP (factura y salud de Neon; la DB es compartida por todos los tenants, asi que la degradacion es transversal). (c) Precondiciones: ninguna — el webhook del motor no exige nada antes del checkRateLimit; solo hay que conocer la forma de la URL /api/motor/webhook/<lo-que-sea>. Es MEDIO y no ALTO porque no expone ni muta datos de negocio (la autenticacion del webhook en si es solida: dos secretos independientes, comparacion en tiempo constante, fail-closed) y porque el volumen practico lo acota el ancho de banda del atacante y la capa de Netlify. Pero es el unico hallazgo de esta lente sin ninguna precondicion, y el daño (filas que nadie borra) es acumulativo y no se auto-repara.

**Mecanismo.** checkRateLimit hace un UPSERT que INSERTA una fila nueva por cada `key` no vista (limiter.ts:44-62). El diseño asume — y lo dice explicitamente el comentario de :28-32 y el del modelo en schema.prisma:1761-1764 — que la limpieza puede ser 'lazy' porque 'la siguiente request pisa el bucket'. Esa premisa solo vale si el espacio de claves es finito: una clave que nunca se repite jamas se pisa, y no existe job que la borre (el indice en expiresAt esta puesto justamente 'por si mas adelante hace falta purgar', schema.prisma:1764; grepeando src/, scripts/ y prisma/ no hay ningun deleteMany sobre RateLimit, y el unico cron de limpieza —cleanup-old-events— no la toca). En el webhook del motor la clave es `motorWebhookPerChannel:${sha256(channelToken).slice(0,24)}` (webhook/route.ts:32-37) y el channelToken es un segmento de la URL que el solicitante escribe. El rate-limit corre a proposito ANTES de resolver el canal (comentario de :30-31), asi que la fila se escribe incluso para tokens inventados que despues daran 401. Como bonus, cada request tambien fuerza el `resolveChannelByToken` (handle-request.ts:22), aunque ahi si hay un freno parcial: CHANNEL_TOKEN_PATTERN filtra tokens malformados antes de tocar la DB (resolve-channel.ts:25) — pero solo despues de que la fila de rate_limit ya se escribio. Los otros dos sitios con espacio de claves ilimitado son los del chat (ver S4-03).

**Evidencia.**

- `src/lib/rate-limit/limiter.ts:44-49`
  > const rows = await prisma.$queryRawUnsafe<UpsertRow[]>(`\n    INSERT INTO rate_limit (id, key, count, "windowStart", "expiresAt", "createdAt", "updatedAt")\n    VALUES ($1, $2, 1, $3, $4, $3, $3)\n    ON CONFLICT (key) DO UPDATE SET
- `src/lib/rate-limit/limiter.ts:28-32`
  > // TTL / cleanup lazy: ... No hay job de limpieza — la tabla no acumula buckets "muertos" dentro de la misma ventana porque la siguiente request los pisa.
- `prisma/schema.prisma:1761-1777`
  > // La limpieza es lazy ... El indice en expiresAt deja la puerta abierta a un job de purga futuro si hace falta.\nmodel RateLimit { id String @id @default(cuid()) key String @unique ... @@index([expiresAt]) @@map("rate_limit") }
- `src/app/api/motor/webhook/[channelToken]/route.ts:30-37`
  > // Rate limit ANTES de cualquier lectura de DB de canales.\n  const tokenHash = createHash('sha256').update(channelToken, 'utf8').digest('hex').slice(0, 24)\n  const rate = await checkRateLimit({ key: `motorWebhookPerChannel:${tokenHash}`, ...
- `src/lib/rate-limit/presets.ts:58`
  > motorWebhookPerChannel: { limit: 600, windowMs: 60_000 },
- `comando: grep -rn 'rate_limit|RateLimit' src/ scripts/ prisma/ (excluyendo checkRateLimit/PRESETS/tipos)`
  > Sin resultados de deleteMany ni de ningun job de purga. Unicos hits: limiter.ts (el UPSERT), presets.ts (comentario), schema.prisma (el modelo) y el comentario del route del motor.

**Fix.** Dos piezas independientes, ambas chicas. (1) Purga: agregar un `deleteMany({ where: { expiresAt: { lt: subDays(new Date(), 1) } } })` sobre RateLimit dentro del cron que ya existe, src/app/api/cron/cleanup-old-events/route.ts — usa el indice de expiresAt que ya esta puesto para eso, no requiere cron nuevo ni migracion. (2) Acotar el espacio de claves en el borde publico: en webhook/[channelToken]/route.ts, mover la validacion de forma del token (CHANNEL_TOKEN_PATTERN, ya exportado desde src/modules/motor/domain/channel-credentials) ARRIBA del checkRateLimit y devolver 401 sin escribir nada si no matchea; y sumar un segundo limiter por IP hasheada (preset nuevo `motorWebhookPerIp`) que si tiene espacio de claves acotado y frena el flood de tokens validos-por-forma pero inexistentes. Para el chat, el fix es el de S4-03.

**Criterio de aceptación.** (1) Tras correr el cron de limpieza, `SELECT count(*) FROM rate_limit WHERE "expiresAt" < now() - interval '1 day'` da 0. (2) 100 POSTs a /api/motor/webhook/<token-malformado-distinto-cada-vez> dejan 0 filas nuevas en rate_limit (se cortan por forma antes del limiter), y 700 POSTs con tokens bien formados pero inexistentes desde la misma IP devuelven 429 a partir del cupo por IP. Invariante puro que afirme que toda `key` pasada a checkRateLimit se compone solo de scope + valores de espacio acotado (slug, orgId, hash de IP) — sin datos de path ni de body sin normalizar.

**Necesita decisión de Franco.** El cupo del nuevo limiter por IP del webhook: 360dialog entrega desde un rango de IPs propio, asi que un cupo por IP demasiado bajo podria frenar rafagas legitimas de Meta. Franco tiene que decidir el numero (o confirmar el rango de IPs del BSP para tratarlo aparte).

**Qué encontró el verificador.** Verifique el punto que sostiene todo el hallazgo — que no hay purga — corriendo yo el grep sobre src/, scripts/, prisma/ y netlify/: los unicos hits sobre la tabla son limiter.ts:46-54 (el UPSERT), presets.ts:6 (comentario), el comentario del webhook (route.ts:31) y `model RateLimit` en prisma/schema.prisma:1765. Cero deleteMany, cero job. El comentario de limiter.ts:28-32 declara la premisa ('la siguiente request los pisa') y el de schema.prisma:1756-1764 admite que el indice en expiresAt esta 'por si mas adelante hace falta purgar' — o sea el propio codigo documenta el supuesto de espacio de claves finito que el webhook viola. En webhook/[channelToken]/route.ts:30-37 la clave sale del segmento de URL y el comentario dice explicitamente 'Rate limit ANTES de cualquier lectura de DB de canales', asi que la fila se escribe antes de cualquier auth; el 401 posterior no la borra. presets.ts:58 confirma 600/min por canal. Tambien verifique la parte que el hallazgo usa para NO inflar: resolve-channel.ts:25 corta por CHANNEL_TOKEN_PATTERN antes de tocar la DB — el freno existe, pero corre despues del limiter, tal como dice. Y limiter.ts:65-70 es fail-closed, asi que ni siquiera hay un modo degradado que evite la escritura.

**Corrección aplicada.** Ninguna correccion sustantiva. Dos precisiones de cita: el INSERT esta en limiter.ts:46-49 (la :44 es la linea del $queryRawUnsafe), y el modelo Prisma arranca en :1765 (el comentario que se cita es :1756-1764). Ambas son off-by-poco, no tergiversan nada. Sostengo MEDIO: es el unico hallazgo de la tanda con CERO precondiciones y el unico cuyo daño (filas que nadie borra en una DB compartida por todos los tenants) es acumulativo y no se auto-repara; no expone ni muta dato de negocio, por eso no sube.

### [S4-02] FIX-ORIGIN (c19e49e): el fallback Referer-vs-Host de isTrustedSameOrigin confia en dos headers que el cliente controla — en prod anula el check de allowedDomains de /config para cualquier cliente sin header Origin, y el invariante que lo acompaña consagra ese camino como correcto

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Sin auth. Cliente HTTP no-browser (que simplemente no manda Sec-Fetch-Site) + conocer el slug del bot. |

**Impacto.** (a) Que se expone: la config publica del widget de cualquier bot (botName, colores, quick replies, whatsappNumber, companyName — getPublicConfig.ts:69-80). Es informacion de baja confidencialidad: cualquier visitante del sitio autorizado ya la ve. (b) A quien: a cualquiera sin auth. (c) Precondicion: conocer el slug. Es MEDIO y no ALTO porque el dato en si es semi-publico; lo que se pierde es el control (allowedDomains deja de gobernar /config) y se gana un oraculo comodo de enumeracion de tenants por slug que alimenta S4-01. CAMBIO_DE_ESTADO respecto de SEC-AUTH-07, que el ledger declara 'CERRADO-DOCUMENTADO' con la evidencia 'no-origin solo en non-prod': eso dejo de ser cierto en prod para /config a partir de c19e49e (2026-07-18), posterior a esa auditoria.

**Mecanismo.** El commit c19e49e agrego en config/route.ts:51-59 un camino que, cuando NO hay header Origin y `isSameOriginBypassApplicable()` (prod sin flag QA), saltea validateOrigin por completo y sirve la config si `isTrustedSameOrigin(request)` da true. La señal primaria de esa funcion (Sec-Fetch-Site: same-origin) es efectivamente no-falsificable desde JS de pagina, como dice el comentario. El problema es la rama de fallback (same-origin.ts:50-57): si el header Sec-Fetch-Site esta AUSENTE — que es exactamente lo que ocurre con cualquier cliente que no sea un navegador moderno — la decision pasa a comparar `Referer` contra `Host`, dos headers que el emisor de la request escribe libremente. El comentario de la funcion justifica el fallback por 'navegadores/clientes que todavia no mandan Sec-Fetch-Site', pero la condicion no distingue 'navegador viejo' de 'cliente arbitrario': ausencia de header es ausencia de header. El resultado es que en produccion el gate de allowedDomains de /config se resuelve con dos valores que provee el propio solicitante. Agravante de proceso: el invariante que acompaña el fix afirma este camino como comportamiento deseado ('sin Sec-Fetch-Site, Referer con el MISMO host que Host → fallback confiable', linea 104), asi que un futuro endurecimiento lo rompe y parece una regresion; y ademas el invariante NO esta en el agregado que corre CI — vive como script suelto `test:fixorigin` (package.json:52) y no figura en `check:invariants` (package.json:18).

**Evidencia.**

- `src/app/api/chatbot/[slug]/config/same-origin.ts:45-58`
  > const secFetchSite = request.headers.get('sec-fetch-site')\n  if (secFetchSite === 'same-origin') return true\n  if (secFetchSite) return false\n  const referer = request.headers.get('referer')\n  const host = request.headers.get('host')\n  if (!referer || !host) return false\n  try { return new URL(referer).host === host } catch { return false }
- `src/app/api/chatbot/[slug]/config/route.ts:51-59`
  > if (!origin && isSameOriginBypassApplicable() && isTrustedSameOrigin(request)) {\n    if (!(await isBotServable(slug))) { ...403... }\n    return handleConfigRequest(slug)\n  }
- `src/app/api/chatbot/[slug]/config/__tests__/fix-origin-same-origin.invariant.ts:104`
  > check('sin Sec-Fetch-Site, Referer con el MISMO host que Host → fallback confiable', () => {
- `package.json:18`
  > "check:invariants": "npm run check:invariant && ... && npm run check:invariant:security"   // no incluye test:fixorigin
- `package.json:52`
  > "test:fixorigin": "npx tsx \"src/app/api/chatbot/[slug]/config/__tests__/fix-origin-same-origin.invariant.ts\""
- `comando: git show --stat c19e49e`
  > FIX-ORIGIN: config same-origin devuelve 200 en prod sin exigir header Origin... | Date: Sat Jul 18 22:38:00 2026 | 6 files changed, 466 insertions(+)

**Fix.** En src/app/api/chatbot/[slug]/config/same-origin.ts:50-57, borrar la rama de fallback y quedarse solo con la señal no-falsificable: `return request.headers.get('sec-fetch-site') === 'same-origin'`. Sec-Fetch-Site tiene soporte universal en los navegadores que el widget soporta desde 2020; el fallback cubre un caso que ya no existe y a cambio abre el gate a todo cliente no-browser. Actualizar el invariante: la asercion de la linea 104 pasa a esperar `false`, y el mismo archivo suma un check nuevo 'Referer y Host coincidentes NO alcanzan sin Sec-Fetch-Site'. Cablear `test:fixorigin` dentro del agregado `check:invariants` (package.json:18) para que corra en CI.

**Criterio de aceptación.** Un GET a /api/chatbot/<slug>/config sin header Origin, sin Sec-Fetch-Site y con `Referer: https://<host-del-deploy>/` devuelve 403 en produccion. El widget real embebido en develop.com.ar (que si manda Sec-Fetch-Site: same-origin) sigue devolviendo 200 — verificable con el spec ya existente tests/integration/fix-origin-same-origin-config.spec.ts. `npm run check:invariants` ejecuta el invariante de fix-origin y falla si alguien restaura el fallback.

**Qué encontró el verificador.** Cita verificada linea por linea: same-origin.ts:45-58 es literal (secFetchSite==='same-origin'→true; cualquier valor explicito→false; ausencia→compara `new URL(referer).host === host`), y route.ts:51-59 es literal (el bypass corre ANTES de validateOrigin y solo exige isBotServable). Confirme que ambos headers del fallback los escribe el emisor: no hay ninguna verificacion de Host contra un allowlist en el repo, y `isSameOriginBypassApplicable()` (same-origin.ts:26) solo exige NODE_ENV==='production' && QA_ALLOW_LOCALHOST!=='1', o sea que el camino esta ACTIVO justamente en prod. El problema de proceso tambien es real y lo verifique yo: el invariante afirma el fallback como correcto en fix-origin-same-origin.invariant.ts:104 (assert.equal(..., true)), y contando el JSON, `check:invariants` es package.json:18 y NO enumera `test:fixorigin`, que es package.json:52 — script suelto. El CAMBIO_DE_ESTADO tambien es correcto: `git show --stat c19e49e` da fecha Sat Jul 18 2026 y 466 inserciones, POSTERIOR al hash de la auditoria maestra (6254428, 2026-07-10) que declaraba SEC-AUTH-07 CERRADO-DOCUMENTADO con evidencia 'no-origin solo en non-prod'.

**Corrección aplicada.** Severidad inflada. Lei getPublicConfig.ts entero: el select devuelve botName, colores, estilos, welcomeMessage, quickReplies, proactivePrompts, whatsappNumber y organization.companyName — nada confidencial, y el propio comentario documenta que llmProvider/llmModel/monthlyQuota/tone/temperature nunca salen. Es exactamente lo que cualquier visitante anonimo del sitio del cliente ya recibe. Ademas, mientras S4-01 este abierto, este camino NO agrega capacidad alguna: `Origin: https://develop.com.ar` ya abre /config de cualquier bot por la via principal. Y la etiqueta 'oraculo comodo de enumeracion de tenants' no se sostiene: hace falta conocer el slug de antemano; es confirmacion de una adivinanza, no enumeracion. Lo que realmente se pierde es la propiedad 'allowedDomains gobierna /config' — control debilitado sin exposicion de dato → BAJO. El item de proceso (invariante que consagra el fallback + fuera de CI) es lo mas valioso del hallazgo y ese sobrevive intacto.

### [S4-05] /api/chatbot/[slug]/health es publico, sin rate-limit y sin origin-check, y su respuesta publica el inventario de infraestructura (nombres de env vars y cuales faltan), los mensajes de error crudos de Prisma y de Vertex, y el botName de cualquier organizacion por enumeracion de slug

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sin auth, sin header Origin, sin rate-limit. El slug es opcional en la practica (checkChatbotHealth tiene default 'develop'). |

**Impacto.** (a) Que se expone: la lista completa de variables de entorno criticas por nombre con un booleano de presencia (DATABASE_URL, GOOGLE_APPLICATION_CREDENTIALS, CHATBOT_GCP_PROJECT_ID, AUTH_SECRET, CHATBOT_IP_HASH_SALT...), mas strings de error sin filtrar de Prisma y del proveedor LLM, mas —por enumeracion de slug— el botName y el estado activo/pausado de cualquier tenant. Ademas cada request cuesta 2 consultas a Neon y no tiene ningun freno. (b) A quien: a cualquiera sin autenticacion. (c) Precondiciones: ninguna para la parte de env/errores (el slug tiene default 'develop'); conocer o adivinar slugs para la parte de enumeracion. NO son valores de secretos — solo nombres y presencia — por eso es MEDIO y no ALTO: es material de reconocimiento (que stack, que proyecto GCP, si el deploy esta a medio configurar), no una fuga de credenciales. El ledger tiene el endpoint anotado en un inventario como 'publico, sin origin-check' SIN severidad y sin caracterizar el payload; lo NUEVO aca es el contenido de lo que devuelve.

**Mecanismo.** health/route.ts:6-19 no llama a validateOrigin, no llama a checkRateLimit y no tiene guard de sesion: pasa el slug directo a checkChatbotHealth y serializa el resultado entero con Response.json. Ese resultado incluye `checks.env.details` (checkHealth.ts:93), que es la salida completa de checkChatbotEnv — y esa funcion construye un array con el `name`, `description`, `hint` y `present` de cada variable del catalogo ENV_VARS (envValidator.ts:26-75, :80-85), mas arrays `errors`/`warnings` cuyo texto nombra explicitamente la variable faltante (:92-98). Tambien se serializan `database.error` y `llmProvider.error`, que son `error.message` sin sanitizar del cliente Prisma y del provider de Vertex (checkHealth.ts:35 y :56) — mensajes que tipicamente incluyen host de la DB o el project id de GCP. Y `bot.botName` (:78) convierte al endpoint en un oraculo de existencia y nombre comercial cruzado entre organizaciones. Cada llamada ejecuta un `SELECT 1` (:32) y un findUnique sobre botConfig (:65-72), con `dynamic = 'force-dynamic'` y `Cache-Control: no-store` (route.ts:4, :17) — o sea, ni el cache lo amortigua.

**Evidencia.**

- `src/app/api/chatbot/[slug]/health/route.ts:6-19`
  > export async function GET(_request: Request, { params }...) {\n  const { slug } = await params\n  const health = await checkChatbotHealth(slug)\n  return Response.json(health, { status: health.ok ? 200 : 503, ... })
- `src/modules/chatbot/server/health/checkHealth.ts:89-98`
  > return { ok: allOk, timestamp: ..., checks: { env: { ok: envResult.allCriticalPresent, details: envResult }, database: dbCheck, llmProvider: llmCheck, bot: botCheck } }
- `src/modules/chatbot/server/config/envValidator.ts:80-85`
  > const vars: EnvVarStatus[] = ENV_VARS.map((v) => { const value = process.env[v.name]; const present = !!value && value.length > 0; return { ...v, present } })
- `src/modules/chatbot/server/config/envValidator.ts:26-45`
  > { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string for Neon DB', hint: 'Get it from Neon console → Connection details' }, ... { name: 'CHATBOT_GCP_PROJECT_ID', ... }
- `src/modules/chatbot/server/health/checkHealth.ts:35`
  > dbCheck = { ok: false, error: error instanceof Error ? error.message : 'unknown' }
- `src/modules/chatbot/server/health/checkHealth.ts:78`
  > botCheck = { ok: true, slug: bot.slug, botName: bot.botName, isActive: bot.isActive }

**Fix.** Partir la respuesta en dos formas segun el llamador, sin crear un endpoint nuevo: en src/app/api/chatbot/[slug]/health/route.ts, si no hay sesion SUPER_ADMIN devolver un payload minimo `{ ok: boolean, timestamp }` (que es todo lo que necesita un monitor de uptime), y servir el objeto `checks` completo solo cuando `auth()` da SUPER_ADMIN. En src/modules/chatbot/server/health/checkHealth.ts:35 y :56, reemplazar `error.message` por un codigo estable ('db_unreachable' / 'llm_provider_unavailable') y loguear el mensaje real por logger, no por la respuesta HTTP. Sumar checkRateLimit con un preset nuevo por IP hasheada — el endpoint pega 2 veces a la DB por request y hoy no tiene ningun freno.

**Criterio de aceptación.** GET /api/chatbot/develop/health sin sesion devuelve exactamente las claves `ok` y `timestamp` y ninguna otra (verificable con `Object.keys(body).sort()`). Con cookie de SUPER_ADMIN devuelve el objeto `checks` completo. Ninguna respuesta, en ningun rol, contiene la subcadena 'DATABASE_URL', 'CHATBOT_GCP_PROJECT_ID' ni el texto de un error de Prisma. Mas de N requests por minuto desde la misma IP devuelven 429.

**Necesita decisión de Franco.** Si algun monitor de uptime externo ya esta consumiendo el payload completo (el ledger registra OBS-03: 'cero monitoreo de uptime externo', lo que sugiere que no, pero conviene confirmarlo antes de recortar la respuesta).

**Qué encontró el verificador.** Todas las citas son literales y las verifique una por una: health/route.ts:6-19 no llama a validateOrigin, no llama a checkRateLimit y no tiene auth() — pasa el slug a checkChatbotHealth y serializa el objeto entero (`Response.json(health)`), con force-dynamic (:4) y no-store (:17), asi que ni el cache amortigua. checkHealth.ts:89-98 mete `details: envResult` completo; envValidator.ts:80-85 arma ese array con name/description/hint/present de las 8 entradas de ENV_VARS (:26-75), y :92-98 nombra la variable faltante en el string de error/warning. checkHealth.ts:35 y :56 devuelven `error.message` crudo de Prisma y del provider; :78 devuelve botName/isActive por slug. El default 'develop' esta en :21. Verificado tambien que pega 2 veces a la DB por request (:32 SELECT 1 y :65-72 findUnique) sin ningun freno. No encontre guard aguas arriba: proxy.ts:172 no cubre /api.

**Corrección aplicada.** Dos correcciones. (1) Severidad: MEDIO esta inflado para el impacto REAL. No se expone ni un valor de secreto — solo nombres de variables estandar y adivinables (DATABASE_URL, AUTH_SECRET) con un booleano de presencia; los `error.message` de Prisma/Vertex solo aparecen cuando el check YA esta fallando (estado excepcional, no el payload normal); y botName/isActive por slug no es cross-tenant en sentido util, porque /config lo devuelve igual y el widget lo muestra publicamente en el sitio del cliente. Queda una fuga de reconocimiento de bajo valor + un endpoint sin rate-limit que cuesta 2 queries — clasico CWE-200 de severidad baja. (2) estado_vs_ledger: 'NUEVO' es incorrecto. El ledger ya tiene SEC-INV-health con la evidencia 'api/chatbot/[slug]/health | GET | publico, sin origin-check | por slug | sin RL'. Lo unico nuevo es la caracterizacion del payload, asi que corresponde CAMBIO/ampliacion de un item existente, no NUEVO.

### [S4-06] /monitoring es un endpoint publico que no figura en el inventario de rutas: el tunnelRoute de Sentry genera un rewrite que reenvia el cuerpo de cualquier POST anonimo a o<orgid>.ingest.sentry.io, con orgid y projectid tomados del query string

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | PLAUSIBLE |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sin auth. Solo hace falta saber que la ruta existe — el valor '/monitoring' esta en el bundle cliente (lo inyecta el SDK de Sentry para que el navegador tunelice), asi que es trivialmente observable. |

**Impacto.** (a) Que se logra: usar develop.com.ar como relay anonimo hacia la ingesta de Sentry de CUALQUIER organizacion/proyecto (los parametros o y p vienen de la query), consumiendo invocaciones de function y ancho de banda de Netlify de develOP. (b) A quien: le cuesta a develOP en factura de Netlify, y expone el dominio a figurar como origen de trafico abusivo contra proyectos Sentry de terceros. (c) Precondiciones: ninguna — sin auth, sin origin-check, sin rate-limit, y fuera del matcher de proxy.ts. Es MEDIO y no ALTO porque el destino esta clavado al dominio de ingesta de Sentry por la plantilla del rewrite (no es un SSRF general: no alcanza redes internas ni hosts arbitrarios) y porque no expone ni un dato de develOP. Lo cuento igual porque el encargo pide el inventario COMPLETO de superficie alcanzable sin autenticacion, y esta ruta no esta en las 37 del listado ni en ninguna auditoria previa.

**Mecanismo.** next.config.ts:215 configura `tunnelRoute: "/monitoring"` en withSentryConfig. La libreria traduce eso a un rewrite de Next (tunnel.js:19-42 del paquete instalado) cuyo `source` es `/monitoring(/?)` con dos condiciones de query — `o` capturada como `(?<orgid>\\d*)` y `p` como `(?<projectid>\\d*)` — y cuyo `destination` es la plantilla `https://o:orgid.ingest.sentry.io/api/:projectid/envelope/?hsts=0`. Como los grupos capturados se interpolan directo en el host y en el path del destino, quien haga la request elige a que organizacion y proyecto de Sentry va el cuerpo. El patron `\\d*` acepta cadena vacia, con lo cual tambien es alcanzable el host degenerado `o.ingest.sentry.io`. El rewrite es infraestructura de Next, no un route handler: no pasa por ningun archivo de src/app/api, no aparece en el inventario de 37 rutas, y proxy.ts:172 no lo cubre (su matcher solo lista /admin, /dashboard, /setter y tres rutas de auth), asi que no hay ningun punto del codigo propio donde aplicarle un rate-limit. Es comportamiento de diseño del paquete upstream — no un bug introducido por develOP — pero la decision de habilitarlo si es local y esta sin evaluar.

**Evidencia.**

- `next.config.ts:210-216`
  > export default withSentryConfig(nextConfig, {\n  org: "develop-agency",\n  project: "logic-core-v3",\n  silent: !process.env.CI,\n  widenClientFileUpload: true,\n  tunnelRoute: "/monitoring",\n});
- `node_modules/@sentry/nextjs/build/cjs/config/withSentryConfig/tunnel.js:22-23`
  > const destination = destinationOverride || "https://o:orgid.ingest.sentry.io/api/:projectid/envelope/?hsts=0";
- `node_modules/@sentry/nextjs/build/cjs/config/withSentryConfig/tunnel.js:28-42`
  > source: `${tunnelPath}(/?)`,\n      has: [ { type: "query", key: "o", value: "(?<orgid>\\d*)" }, { type: "query", key: "p", value: "(?<projectid>\\d*)" } ],\n      destination
- `src/proxy.ts:171-173`
  > export const config = {\n  matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password'],\n}

**Fix.** Decision binaria, ninguna de las dos opciones cuesta mas de 10 minutos. Opcion A (recomendada para una agencia de 2 personas): borrar `tunnelRoute` de next.config.ts:215. El tunnel existe solo para esquivar bloqueadores de anuncios en el reporte de errores del cliente; a cambio publica un relay anonimo. Sin el, el SDK reporta directo a Sentry y se pierde la telemetria de los usuarios con adblock — costo aceptable frente a mantener un relay abierto. Opcion B (si se quiere conservar): reemplazar el rewrite por un route handler propio en src/app/api/monitoring/route.ts que (i) valide que el orgid y el projectid del envelope coinciden con los del DSN configurado y rechace cualquier otro, (ii) aplique checkRateLimit por IP hasheada con un preset nuevo, (iii) tope el tamaño del cuerpo. Documentar la ruta en el inventario de superficie publica en cualquiera de los dos casos.

**Criterio de aceptación.** Opcion A: `curl -X POST 'https://<deploy>/monitoring?o=1&p=1'` devuelve 404. Opcion B: el mismo POST con un orgid distinto del propio devuelve 403, con el propio devuelve 200, y superado el cupo devuelve 429. En ambos casos, el inventario de rutas publicas del repo lista /monitoring con su veredicto.

**Necesita decisión de Franco.** Si conservar el tunnel de Sentry (telemetria de clientes con adblock) o borrarlo. Es una decision de producto/observabilidad, no de seguridad pura.

**Qué encontró el verificador.** La configuracion y el codigo upstream los verifique yo y coinciden exactamente: next.config.ts:210-216 pasa `tunnelRoute: "/monitoring"` a withSentryConfig; en el paquete instalado (@sentry/nextjs 10.62.0) tunnel.js:22 tiene el destination literal `https://o:orgid.ingest.sentry.io/api/:projectid/envelope/?hsts=0` y :28-42 el source `${tunnelPath}(/?)` con `o` capturado como `(?<orgid>\d*)` y `p` como `(?<projectid>\d*)` — los numeros de linea citados son exactos. Cerre ademas el eslabon que el hallazgo no cito: getFinalConfigObjectUtils.js:33 llama setUpTunnelRewriteRules incondicionalmente cuando `userSentryOptions.tunnelRoute` esta seteado y `output !== 'export'` (no lo es), asi que el rewrite SI queda en la config construida. proxy.ts:171-173 confirma que el matcher no lo cubre, y no existe route handler propio (no hay src/app/monitoring ni src/app/api/monitoring). Dejo PLAUSIBLE y no CONFIRMADO por una sola razon: que Netlify materialice ese rewrite externo como proxy real desde la function es comportamiento de plataforma que NO puedo verificar por lectura, y probarlo exigiria pegarle al deploy — fuera del limite de la corrida. Todo lo que es codigo, esta confirmado.

**Corrección aplicada.** Severidad inflada a MEDIO. Por el propio razonamiento del hallazgo: el destino esta clavado al dominio de ingesta de Sentry por la plantilla (no es SSRF a hosts arbitrarios ni a red interna), no expone ni un dato de develOP, no permite ninguna accion sobre la app y no toca datos de tenants. Lo que queda es consumo de invocaciones/ancho de banda de Netlify por un tercero anonimo y reputacion del dominio — eso es BAJO bajo un criterio de impacto real. El valor del hallazgo no esta en la severidad sino en el inventario: es superficie publica que no figura en ninguna auditoria previa ni en las 37 rutas listadas, y no vive en src/ (por eso ningun censo de route handlers la ve), asi que la parte 'NUEVO' la confirmo.

#### Ya documentado en auditorías previas — no se re-reporta (11)

- [SEC-01] /api/chatbot/[slug]/smoke sigue publico, sin guard, sin validateOrigin y sin rate-limit, y dispara una llamada real a Vertex — verificado sin cambios (smoke/route.ts:16-42; git log del archivo: ultimo toque 7d9548e, anterior a todas las auditorias).
- [SEC-11 / OBS-09 / CLEAN-H-TESTROUTE] /api/test-sentry sigue siendo un GET publico de 5 lineas que lanza un Error, sin auth y sin chequeo de NODE_ENV — verificado identico (test-sentry/route.ts:3-5).
- [SEC-15] /embed/:slug* sigue con `frame-ancestors *` y la whitelist R18 sigue pendiente (next.config.ts:83-89; el comentario 'R18 will restrict to a whitelist' sigue ahi). El header aislado es lo ya documentado; su combinacion con el escape de origen es S4-01.
- [SEC-08] La CSP sigue en Content-Security-Policy-Report-Only con 'unsafe-inline' y 'unsafe-eval', nunca paso a enforcement (next.config.ts:47-61).
- [SEC-INJ-01 / SEC-13] El input del chat sigue sin normalizacion NFC ni strip de null bytes (requestBodySchema en handleChatRequest.ts:97-119 valida forma y longitud, no normaliza).
- [SEC-AUTH-07] El escape de 'sin Origin' de validateOrigin sigue acotado a non-prod (validate-origin.ts:53-59) — sin cambios ahi; lo que cambio en prod es el camino paralelo de /config, que reporto aparte como S4-02.
- [CLEAN-1.2-ORIGIN] isOriginWithinPlanCap sigue copiando 2 de los 3 escapes de validateOrigin y se le sigue escapando QA_ALLOW_LOCALHOST (handleChatRequest.ts:250-268 vs validate-origin.ts:39-51) — verificado sin cambios.
- [SEC-AUTH-05] /api/track sigue aceptando organizationId arbitrario del body cuando el caller es SUPER_ADMIN, y parsea con request.json() sin Zod (track/route.ts:20-28).
- [C-21] La importacion CSV del setter sigue con tope de 500 filas y validacion Zod fila por fila; los puntos abiertos (mojibake, conteo neto, homonimos) siguen igual (prospecto-bulk.actions.ts:53-77, prospecto-import.ts:24).
- [RESIL-07] En el formulario de contacto publico, checkRateLimit sigue fuera del try/catch (contact.ts:24-27), asi que un fallo de DB en el limiter tira crudo al form.
- [SEC-RATELIMIT-01 / P1-5] El limiter compartido por tabla ya esta en su lugar (limiter.ts) y lo usan los endpoints publicos; el residual in-memory de src/app/login/actions.ts:46 sigue sin migrar, tal como registra el ledger.


---

## S5 — LLM y chatbot

> **Pasada de refutación adversarial:** sí, agente independiente.

### [S5-01] currentPath del body entra CRUDO al system prompt (region confiable) — canal de inyeccion que el spotlighting no cubre

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sin auth. Visitante cualquiera del sitio donde esta embebido el widget (o cualquier cliente HTTP que emita el Origin autorizado). No requiere cuenta, ni rol, ni conocer el tenant mas alla del slug publico. |

**Impacto.** (a) Que se logra: control total de hasta 500 caracteres arbitrarios (newlines y caracteres de control incluidos) dentro del system prompt, en la seccion 8, es decir FUERA de las etiquetas <vmsg_…> que el modelo tiene instruido tratar como dato no confiable (sections.ts:150). El modelo no tiene ninguna regla que le diga que desconfie de ese texto. Consecuencias realistas: neutralizar las reglas anti-alucinacion de la seccion 6 (que el propio prompt declara 'INVIOLABLES' porque 'romperlas genera problemas comerciales reales'), forzar afirmaciones de precio/plazo/garantia fuera de la KB en el widget de un cliente que paga, o pedir el volcado de la KB del tenant. (b) A quien: al propio atacante en su sesion — NO persiste hacia otros visitantes (el prompt se arma con body.currentPath del request en curso, no con Conversation.currentPath) y NO cruza organizaciones (orgId sale del slug, handleChatRequest.ts:415). Por eso MEDIO y no ALTO: el radio de dano es la sesion del atacante y la KB del propio tenant. (c) Precondiciones: ninguna autenticacion. Basta emitir la request desde un origen ya autorizado del bot — cualquier visitante del sitio del cliente lo esta, porque el navegador pone el header Origin del sitio del cliente y validateOrigin lo acepta.

**Mecanismo.** El schema del body acepta `currentPath` como string libre de hasta 500 chars, sin normalizacion. El valor viaja sin tocarse hasta buildDynamicContext, que lo interpola en la linea '- Ruta del usuario: …' de la seccion 8 del system prompt. El contraste esta en el mismo archivo: los otros tres campos controlados por el visitante (referrer, utm_*) SI pasan por sanitizeAttributionField (strip de control chars + cap), y proactiveOpener SI se valida por coincidencia EXACTA contra la lista configurada por el admin antes de entrar al prompt. currentPath es el unico campo del body que llega al prompt sin ninguna de las dos defensas. El spotlighting de SEC-LLM-01 opera exclusivamente sobre el array `messages`, asi que no lo alcanza. Efecto lateral menor: el valor tambien se persiste en Conversation.currentPath y se muestra en las tablas del panel (React escapa, no hay XSS).

**Evidencia.**

- `src/modules/chatbot/server/chat/handleChatRequest.ts:108`
  > currentPath: z.string().max(500).optional(),
- `src/modules/chatbot/server/chat/handleChatRequest.ts:903`
  > currentPath: body.currentPath,
- `src/modules/chatbot/server/prompts/sections.ts:199`
  > - Ruta del usuario: ${context.currentPath ?? 'no determinada'}
- `src/modules/chatbot/server/chat/handleChatRequest.ts:109`
  > referrer: attributionField(500),   // ← este SI se sanitiza; currentPath (linea 108) no
- `src/modules/chatbot/server/chat/handleChatRequest.ts:995-999`
  > const validatedOpener = (() => { const opener = body.proactiveOpener?.trim(); if (!opener) return null; return collectProactivePrompts(bot.proactivePrompts).has(opener) ? opener : null })()
- `src/modules/chatbot/server/chat/handleChatRequest.ts:1042-1047`
  > const wrapUntrusted = (text: string): string => { const stripped = text.replace(/<\/?vmsg_[a-z0-9]*>/gi, ''); return `<${visitorTag}>\n${stripped}\n</${visitorTag}>` }  // solo se aplica a body.messages
- `grep -rn "currentPath" src/modules/chatbot/ --include=*.ts --include=*.tsx`
  > ChatbotEmbed.tsx:27 usa currentPath:'/' fijo y LogicCompanion.tsx:53 usa el pathname de Next — ningun cliente legitimo produce texto libre, pero el server acepta cualquiera

**Fix.** En src/modules/chatbot/server/chat/handleChatRequest.ts:108, reemplazar `z.string().max(500)` por una validacion de FORMA de path: regex que exija arranque en '/' y solo permita el charset de una URL path+hash (`/^\/[A-Za-z0-9\-._~!$&'()*+,;=:@%\/#?]{0,199}$/`), con `.catch(undefined)` o transform que colapse a undefined si no matchea (nunca 400: el campo es contextual, no critico — mismo criterio que sanitizeAttributionField). Alternativa mas barata y consistente con lo que ya existe: envolver el valor en el mismo spotlighting antes de meterlo al prompt, o moverlo desde la seccion 8 al bloque de contenido no confiable. Recomendado hacer las dos: forma + no confiar. Un archivo, sin migracion.

**Criterio de aceptación.** Un POST a /api/chatbot/[slug]/chat con `currentPath` que contenga newlines o un encabezado de seccion tipo '# 10. …' produce un system prompt donde la linea 'Ruta del usuario:' dice 'no determinada' (o el valor recortado a un path valido) — verificable con un test unitario sobre requestBodySchema.parse + buildSystemPrompt, sin LLM: assert de que el prompt resultante no contiene el marcador inyectado. Sumar el caso al archivo de invariantes del chat (patron de src/modules/chatbot/server/chat/__tests__/*.invariant.ts) para que quede en check:invariants.

**Qué encontró el verificador.** Abri los 3 archivos citados y las 3 citas son literales. handleChatRequest.ts:108 dice exactamente `currentPath: z.string().max(500).optional(),` mientras que la linea 109 inmediatamente debajo usa `referrer: attributionField(500)` — lei src/modules/chatbot/shared/attribution.ts:65-72 y sanitizeAttributionField SI hace strip de C0(0-31)+DEL, trim y cap, o sea el contraste que afirma el hallazgo es real. sections.ts:199 interpola `${context.currentPath ?? 'no determinada'}` dentro de la seccion 8, y la unica regla de desconfianza del prompt (sections.ts:150) habla explicitamente solo de las etiquetas <vmsg_…>, que handleChatRequest.ts:1042-1047 aplica UNICAMENTE al map de body.messages. Busque el guard aguas arriba y NO existe: grep de currentPath en src/ da 3 usos de body.currentPath (403 log de debug, 488 getOrCreateConversation, 903 el prompt) y ninguno normaliza; el route handler (src/app/api/chatbot/[slug]/chat/route.ts:36-88) solo hace validateOrigin + rate-limit, no toca el body; TypeScript no puede acotar un string. Hallazgo lateral que el auditor no menciono: el mismo valor crudo entra a chatbotDebug('request_parsed') en :403, asi que newlines tambien contaminan el log estructurado.

### [S5-02] El historial completo lo provee el cliente y los turnos con role 'assistant' estan EXPLICITAMENTE exentos del spotlighting — el servidor nunca reconstruye la conversacion desde la DB

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sin auth. Cualquier visitante del sitio del cliente (o cualquier cliente HTTP con el Origin autorizado). Solo hay que enviar el array `messages` con entradas role:'assistant' fabricadas. |

**Impacto.** (a) Que se logra: colocar texto arbitrario (hasta 29 mensajes x 4.000 chars) en el rol que el modelo trata como su propia palabra previa. Es el rol de maxima confianza despues del system: un turno falso del asistente que 'ya acordo' un precio, 'ya confirmo' una politica o 'ya acepto' un cambio de rol tiene mucho mas peso que el mismo texto en un turno user, y es exactamente el vector que el spotlighting fue puesto a tapar. (b) A quien: al propio atacante; el historial forjado NO se persiste (solo se persiste el ultimo mensaje user) — lo cual agrava la parte forense: en la DB y en el panel del cliente la conversacion se ve normal y la respuesta anomala del bot queda sin causa visible. No cruza tenants. (c) Precondiciones: ninguna autenticacion, mismo acceso que S5-01. MEDIO por el mismo motivo que S5-01: radio de dano acotado a la sesion del atacante.

**Mecanismo.** `messages` llega entero del body y es la UNICA fuente del contexto conversacional: el handler no lee ChatMessage de la DB para reconstruir historial (la unica lectura de mensajes en el camino del chat es el dedup de la cola, handleChatRequest.ts:858, y la verificacion de pertenencia de capture_lead, captureLead.ts:230 — ninguna alimenta al modelo). En el map hacia ModelMessage, todo lo que NO es 'assistant' se envuelve con el delimitador nonce; 'assistant' pasa tal cual. El comentario del codigo muestra que el caso se penso para role:'system' (se degrada a user) pero no para 'assistant'. La persistencia solo guarda el ultimo mensaje 'user', asi que el historial forjado no deja rastro. Nota: esto NO rompe el guard de pertenencia de capture_lead, que compara contra los USER persistidos en DB, no contra el body.

**Evidencia.**

- `src/modules/chatbot/server/chat/handleChatRequest.ts:97-106`
  > messages: z.array(z.object({ role: z.enum(['user','assistant','system']), content: z.string().max(MAX_MESSAGE_CHARS) })).min(1).max(MAX_MESSAGES_SHAPE).transform((msgs) => trimHistory(msgs, HISTORY_WINDOW_MESSAGES)),
- `src/modules/chatbot/server/chat/handleChatRequest.ts:1057-1060`
  > if (m.role === 'assistant') { return { role: 'assistant', content: [{ type: 'text', text: m.content }] } }
      return { role: 'user', content: [{ type: 'text', text: wrapUntrusted(m.content) }] }
- `src/modules/chatbot/server/chat/handleChatRequest.ts:1053-1056`
  > El historial del asistente (sus propios outputs) va tal cual. Todo lo demas —mensajes 'user' y, defensivamente, cualquier 'system' que un cliente intente colar— se trata como input NO confiable
- `src/modules/chatbot/server/chat/handleChatRequest.ts:834-869`
  > const lastUserMessage = [...body.messages].reverse().find((m) => m.role === 'user')  …  await scope.chatMessage.create({ conversationId, role: 'USER', content: lastUserMessage.content })  // solo el ultimo user se persiste
- `grep -rn "chatMessage.findMany|chatMessage.findFirst" src/modules/chatbot/server/`
  > solo handleChatRequest.ts:858 (dedup), :1386 (retry dedup), captureLead.ts:230 (pertenencia), admin/multiTenantQueries.ts:166 y reports/buildWeeklyReport.ts:74 — ninguna alimenta el contexto del modelo

**Fix.** Dos opciones, por costo creciente. (1) Barata y suficiente para la clase de ataque: envolver tambien los turnos 'assistant' del body en su propio delimitador nonce distinto (p.ej. <amsg_…>) y sumar una linea a la seccion 6 aclarando que lo etiquetado asi es historial reportado por el cliente, no palabra propia verificada. (2) Correcta de raiz: dejar de confiar en el historial del cliente — reconstruir los turnos anteriores desde ChatMessage de la conversacion ya resuelta (scope.chatMessage.findMany con orden y la misma ventana de trimHistory) y usar del body SOLO el ultimo mensaje 'user'. La conversacion ya esta resuelta en ese punto del handler y la ventana ya esta definida en shared/historyPolicy.ts, asi que es 1 query extra y ~20 lineas; ademas cierra el hueco forense (el contexto que vio el modelo pasa a ser exactamente el que queda en la DB). Sostenible para 2 personas.

**Criterio de aceptación.** Un POST con un turno role:'assistant' fabricado no llega al modelo como assistant: assert sobre el array de ModelMessage construido (extraer el map a una funcion pura testeable) verificando que ningun mensaje del body con role 'assistant' aparece sin envolver — o, si se toma la opcion (2), que el contexto enviado coincide mensaje a mensaje con lo persistido en ChatMessage salvo el ultimo user. Test unitario sin LLM, agregado a src/modules/chatbot/server/chat/__tests__/ para que corra en check:invariants.

**Necesita decisión de Franco.** Elegir opcion (1) o (2): la (2) cambia el contrato con el widget (el cliente deja de ser fuente de verdad del historial) y toca el camino caliente del producto — decision de Franco, no del auditor.

**Qué encontró el verificador.** Verifique el map real en handleChatRequest.ts:1052-1061: la rama `if (m.role === 'assistant') return { role: 'assistant', content: [{ type: 'text', text: m.content }] }` devuelve el contenido del BODY sin pasar por wrapUntrusted, y el comentario 1053-1056 efectivamente solo justifica el caso 'system'. Confirme la premisa fuerte (que el server no reconstruye historial) corriendo yo mismo `grep -rn "chatMessage.findMany|chatMessage.findFirst" src/modules/chatbot/server/`: devuelve 5 sitios (admin/multiTenantQueries.ts:166, handleChatRequest.ts:858 dedup, handleChatRequest.ts:1386 dedup de retry, reports/buildWeeklyReport.ts:74, captureLead.ts:230 pertenencia) y NINGUNO alimenta el array `messages` del streamText — `messages: body.messages.map(...)` es la unica fuente. Tambien verifique la persistencia asimetrica en :834-869: solo se persiste `lastUserMessage`, asi que el historial 'assistant' forjado no deja rastro. No encontre contra-argumento: no hay guard de coherencia body-vs-DB, y el schema (:100) admite role 'assistant' explicitamente. Salvedad honesta: que un turno assistant forjado pese mas en el modelo que el mismo texto en un turno user es comportamiento de modelo, INFERIDO — lo verificado es la ausencia del control.

### [S5-05] Texto generado por el modelo se interpola sin escapar en los mensajes de Telegram enviados con parse_mode 'Markdown' (inyeccion de formato/enlace en el canal interno y supresion silenciosa del aviso)

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sin auth. Visitante del widget publico. No requiere inyeccion de prompt: los campos afectados son resumenes que el modelo construye a partir de lo que el visitante escribio (nombre, resumen del tema, señales de compra). |

**Impacto.** (a) Que se logra: dos cosas. Primero, colocar marcado Markdown arbitrario —incluido un enlace clicable— dentro de un mensaje que llega al Telegram privado del equipo con la apariencia de una alerta automatica del sistema ('🟢 Nuevo lead', '🟡 Handoff WhatsApp directo'); es un vector de phishing dirigido a los dos operadores, entregado por un canal que ellos confian. Segundo, y mas probable de ocurrir incluso sin intencion: un marcador Markdown desbalanceado en cualquiera de esos campos hace que la API de Telegram rechace el envio, y sendTelegram traga el fallo devolviendo false — el aviso interno de lead/derivacion se pierde en silencio. (b) A quien: a develOP (canal interno). El lead sigue guardado en la DB y el mail al cliente va por otro camino, por eso no es ALTO. (c) Precondiciones: sin auth; alcanza con influir el texto que el modelo pone en name/topicSummary/visitorContact/purchaseSignals, que es literalmente lo que el visitante dicta.

**Mecanismo.** notifyTelegramOptional fija parseMode 'Markdown'. Las dos tools que notifican arman el texto por concatenacion de plantilla con valores producidos por el modelo (input.name, input.visitorName, input.visitorContact, input.topicSummary, input.purchaseSignals) sin ningun escape de los metacaracteres de Markdown. Telegram interpreta ese marcado: los constructores de enlace de Markdown quedan disponibles, y el parser de Telegram rechaza la peticion cuando un marcador queda sin cerrar. sendTelegram atrapa el fallo y devuelve false con un log — el flujo llamador no se entera. El unico cap existente sobre esos campos es de longitud (Zod), no de contenido; SEC-17 del ledger ya señalo la falta de strip de caracteres de control, pero el metacaracter de formato no esta cubierto por eso ni por el cap.

**Evidencia.**

- `src/lib/notifications/telegram.ts:116-118`
  > export async function notifyTelegramOptional(message: string): Promise<void> { await sendTelegram(message, { parseMode: 'Markdown' }) }
- `src/modules/chatbot/server/tools/showWhatsappHandoff.ts:138-151`
  > const tgMsg = [ `🟡 *Handoff WhatsApp directo* (sin capture_lead previo)`, `Intent: ${input.intent}`, input.visitorName ? `Nombre: ${input.visitorName}` : '', input.visitorContact ? `Contacto: ${input.visitorContact}` : '', `Resumen: ${input.topicSummary}`, … ].join('\n'); void notifyTelegramOptional(tgMsg)
- `src/modules/chatbot/server/tools/captureLead.ts:424-436`
  > const telegramMsg = [ `🟢 *Nuevo lead* — ${org.companyName}`, `Bot: ${bot.botName}`, input.name ? `Nombre: ${input.name}` : '', … ].join('\n'); void notifyTelegramOptional(telegramMsg)
- `src/lib/notifications/telegram.ts:19`
  > Contrato: NUNCA lanza. Si no hay credenciales o el envio falla, loguea y devuelve `false` — el flujo que lo llamo sigue intacto.  // el fallo de parseo queda invisible para el caller

**Fix.** Escapar en el unico sender. En src/lib/notifications/telegram.ts agregar y exportar un helper `escapeTelegramMarkdown(value: string)` que neutralice los metacaracteres del modo elegido, y aplicarlo en los dos call-sites a cada valor interpolado que no sea literal de la plantilla (captureLead.ts:424-433 y showWhatsappHandoff.ts:138-147); las etiquetas en negrita de la plantilla se mantienen porque son literales del codigo. Opcion aun mas simple y robusta: migrar estos dos avisos a parseMode 'HTML' (el default del sender) con escape de &, < y >, que es un conjunto cerrado de tres caracteres. Ademas, hacer que sendTelegram registre explicitamente el fallo de parseo como evento (hoy solo console) para que la supresion deje de ser silenciosa.

**Criterio de aceptación.** Test unitario del armado del mensaje: un nombre o resumen que contenga metacaracteres de formato o un constructor de enlace produce un payload donde esos caracteres van escapados y no queda ningun enlace clicable ni marcador sin cerrar. Y verificacion manual en el bot de Telegram de staging: el aviso llega (200 de la API) con el texto literal, no formateado.

**Qué encontró el verificador.** Verifique el sender: telegram.ts:116-118 es literal — notifyTelegramOptional fija `{ parseMode: 'Markdown' }`, y sendTelegram (:67-99) manda ese parse_mode al API y, ante `!response.ok`, hace `console.error` y `return false` (:90-93) sin propagar nada al caller; el contrato del header (:17-18) lo declara explicitamente. Lei los dos call-sites y la interpolacion es por template literal cruda: showWhatsappHandoff.ts:138-147 mete input.visitorName / input.visitorContact / input.topicSummary / input.purchaseSignals, y captureLead.ts:424-436 mete input.name y demas. Busque un escape en el camino y no existe: no hay helper de escape en src/lib/notifications/ ni ninguna transformacion entre la tool y el sender. El unico control sobre esos campos es el cap de longitud de Zod. Salvedad de confianza: lo VERIFICADO es la ausencia de escape con parse_mode Markdown; que Telegram rechace con 400 un marcador desbalanceado y que renderice [texto](url) como enlace clicable es comportamiento del API que NO pude comprobar (no se prueba contra servicios externos en esta corrida) — es conocimiento de la plataforma, no evidencia de este repo. Mantengo MEDIO pero aclarando el reparto: el desenlace probable es la perdida silenciosa del aviso interno; el phishing al operador exige ademas que el operador clickee.

### [S5-06] La respuesta del modelo se renderiza como Markdown con imagenes y enlaces habilitados por default, y el /embed solo trae CSP de frame-ancestors: canal de salida silencioso para cualquier inyeccion que si prospere

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Requiere primero conseguir que el modelo emita el marcado (via S5-01, S5-02, o contenido inyectado en la KB del tenant por quien la administra). No requiere auth en si mismo. Se renderiza en el origen de develOP (el widget se sirve dentro de un iframe apuntando a /embed/[slug]), no en el origen del cliente — lo cual acota el impacto: no es XSS en el sitio del cliente. |

**Impacto.** (a) Que se expone: el contenido que el modelo tiene en contexto — la KB completa del tenant y la transcripcion de la conversacion (PII del visitante) — puede salir hacia un host elegido por el atacante SIN que el visitante vea nada y SIN que quede rastro server-side, porque el navegador resuelve una imagen Markdown automaticamente al renderizar. Es un salto cualitativo sobre lo ya aceptado en SEC-LLM-04 (que asume que la fuga se ve en el texto de la respuesta): esta via evade la capa 4 de validacion, cuyos seis patrones buscan frases y encabezados, nunca URLs ni imagenes, y que ademas es post-hoc y no bloquea. (b) A quien: a un tercero elegido por quien logro la inyeccion. (c) Precondiciones: exige una inyeccion previa exitosa — que S5-01 y S5-02 vuelven barata. Por eso MEDIO y no ALTO: no es una brecha autonoma, es el amplificador que convierte las inyecciones documentadas en exfiltracion silenciosa. No hay XSS: react-markdown 10.1.0 escapa HTML (no hay rehype-raw en el arbol) y su defaultUrlTransform limita los protocolos a http/https/mailto/xmpp/ircs — eso sigue cerrado, tal como dice el ledger.

**Mecanismo.** Los tres puntos donde se pinta la respuesta del asistente pasan a ReactMarkdown un mapa de componentes que solo redefine p, code y strong. Los elementos img y a quedan con el renderer por default, asi que una imagen Markdown con URL https se convierte en un <img src> que el navegador solicita sola al montar, y un enlace Markdown en un <a href> sin rel ni target. La cabecera CSP que se APLICA de verdad a /embed/:slug* declara unicamente frame-ancestors: no hay default-src ni img-src ni connect-src en esa politica, y la politica global que si los declara esta en modo Report-Only. Es decir, nada en el navegador frena la peticion saliente. La capa de validacion de salida corre despues del stream y solo registra warnings.

**Evidencia.**

- `src/modules/chatbot/components/chat/ChatWindow.tsx:22-41`
  > const MARKDOWN_COMPONENTS: Components = { p: …, code: …, strong: … }   // no hay override de img ni de a
- `src/modules/chatbot/components/chat/StreamingMarkdown.tsx:148`
  > <ReactMarkdown components={components}>{body}</ReactMarkdown>
- `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:358-381`
  > <ReactMarkdown components={{ p: …, code: …, strong: … }}>{m.content}</ReactMarkdown>   // mismo mapa, mismo hueco
- `next.config.ts:85-88`
  > source: '/embed/:slug*', headers: [ { key: 'Content-Security-Policy', value: "frame-ancestors *;" }, … ]   // politica ENFORCED sin default-src/img-src
- `next.config.ts:48-53`
  > key: 'Content-Security-Policy-Report-Only',  …  "img-src 'self' data: blob: https:"   // la unica politica con img-src no se aplica
- `src/modules/chatbot/server/safety/validateOutput.ts:30-76`
  > PATTERNS: guarantee_absolute, absolute_claim_100_pct, inflated_multiplier, self_reference_generic_ai, prompt_section_leak, fabricated_timeframe, delimiter_echo   // ningun patron mira URLs ni imagenes
- `node_modules/react-markdown/lib/index.js:124,320,421-438`
  > const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i  …  const urlTransform = options.urlTransform || defaultUrlTransform   // https queda permitido por default

**Fix.** Dos candados baratos y complementarios. (1) En el mapa de componentes compartido (ChatWindow.tsx:22 y el equivalente inline de ChatbotEmbed.tsx:358) agregar `img: () => null` — el bot no tiene ningun caso de uso legitimo de imagenes en su respuesta — y un `a` propio que solo renderice el href si el host pertenece a una allowlist (el dominio del tenant + wa.me + los dominios de develOP), con rel="noopener noreferrer nofollow"; el resto se pinta como texto plano. Conviene unificar los dos mapas en un solo modulo, ya estan duplicados. (2) En next.config.ts:85-88, agregar a la politica ENFORCED de /embed/:slug* un `default-src 'self'` con `img-src 'self' data:` y `connect-src 'self'`, conservando frame-ancestors *. Es el mismo bloque de headers que ya existe.

**Criterio de aceptación.** (a) Test de render: un mensaje de asistente que contenga una imagen Markdown apuntando a un host externo no produce ningun elemento img en el DOM, y un enlace a un host fuera de la allowlist se renderiza como texto sin atributo href. (b) `curl -I https://<host>/embed/<slug>` devuelve un Content-Security-Policy que incluye img-src y connect-src ademas de frame-ancestors.

**Necesita decisión de Franco.** Definir la allowlist de hosts para los enlaces que el bot puede emitir (hoy no existe esa lista en ningun lado; el prompt en sections.ts:217 le dice al modelo que puede usar [links](url) sin acotar el dominio).

**Qué encontró el verificador.** Verifique las 6 citas y todas son reales, con un desvio menor de numeracion en next.config.ts (el bloque de /embed es 85-89, no 85-88; la key CSP esta en :87). ChatWindow.tsx:22-41 define MARKDOWN_COMPONENTS con p/code/strong y nada mas; StreamingMarkdown.tsx renderiza `<ReactMarkdown components={components}>{body}</ReactMarkdown>` con ese mapa; ChatbotEmbed.tsx repite inline el mismo mapa de 3 componentes. Confirme el default del renderer contra el paquete instalado: react-markdown 10.1.0, lib/index.js:124 `const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i`, :320 `options.urlTransform || defaultUrlTransform`, :382 aplica el transform a las url-props — o sea https pasa y no hay ninguna supresion de `img` (mi grep de 'img' en ese archivo no da ningun caso especial). Confirme las cabeceras: la unica politica con img-src/connect-src es Content-Security-Policy-Report-Only (next.config.ts:47-61, no bloquea) y la ENFORCED de /embed/:slug* es `frame-ancestors *;` a secas (:87). Y confirme que validateOutput.ts:30-76 tiene los 7 patrones citados, todos de frases/encabezados, ninguno sobre URLs o imagenes, y la funcion (:78+) solo acumula warnings. Sin contra-argumento. Dos matices honestos: (a) MEDIO esta bien puesto porque no es una brecha autonoma — exige una inyeccion previa; (b) 'NUEVO' esta algo sobrevendido: los dos componentes ya viven en el ledger por separado (SEC-LLM-05 'ReactMarkdown sin urlTransform explicito', SEC-08 'CSP nunca paso de Report-Only', SEC-15 '/embed con frame-ancestors *'); lo genuinamente nuevo es la composicion como canal de salida silencioso.

**Corrección aplicada.** Numeracion: el bloque de /embed en next.config.ts es 85-89 (key CSP en :87), no 85-88. Clasificacion: mas CAMBIO_DE_ESTADO/composicion que NUEVO — sus tres piezas ya estan en el ledger (SEC-LLM-05, SEC-08, SEC-15); el aporte es unirlas en un canal de exfiltracion.

### [S5-03] La compensacion de cupo se dispara por una condicion que controla el cliente (cortar el stream antes del primer token): el cap mensual de conversaciones deja de ser vinculante mientras el costo de Vertex se sigue incurriendo

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | REFUTADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sin auth. Requiere solamente iniciar conversaciones NUEVAS (sessionId nuevo cada vez) y cortar la conexion antes del primer chunk util, dentro del rate-limit de 30 req/min por (origen, IP). No requiere cuenta, rol, ni conocer nada del tenant mas alla del slug publico. |

**Impacto.** (a) Que se logra: llamadas al LLM sin tope efectivo. Hoy el unico limite duro de gasto por tenant es plan.quota (500/3000/5000 conversaciones/mes) x HARD_CAP_MESSAGES; si la reserva se devuelve, ese producto desaparece y el techo pasa a ser solo el rate-limit por IP+origen (30/min, in-memory y poroso en serverless — ya documentado). Cada request puede arrastrar hasta 30 mensajes x 4.000 chars de historial elegido por el atacante MAS el system prompt con la KB completa, es decir decenas de miles de tokens de INPUT facturados por turno. Agravante de contabilidad: cuando el turno muere por abort, onFinish no completa la transaccion, asi que tokensIn/costUsd tampoco se acumulan — el gasto no aparece en QuotaUsage; el unico rastro es el evento chat.quota_compensated, que se loguea a nivel 'warn' sin ningun umbral ni alerta. (b) A quien: el costo lo paga develOP (cuenta unica de Vertex), y el tenant abusado no ve consumo. (c) Precondiciones: ninguna autenticacion, desde el widget publico. ALTO —y no MEDIO— porque el dano es monetario, directo, acumulativo, invisible en el tablero de cuota, y contra una agencia de 2 personas sin umbral de gasto configurado (OBS-05 del ledger deja el umbral USD como decision pendiente).

**Mecanismo.** En una conversacion nueva el handler reserva 1 cupo de forma atomica. El compensador arma un cierre que devuelve ese cupo y BORRA la fila de Conversation. onAbort lo invoca con firstTokenDelivered = (ttfbAt !== null), y ttfbAt solo se setea cuando llega el primer text-delta o tool-call desde Vertex. La tabla de decision (shouldCompensateQuota) devuelve true para stream_abort/stream_error cuando no hubo primer token, y para empty_response cuando no hubo tool calls. O sea: el criterio de 'no se entrego valor' se mide con una señal cuyo timing es del cliente. Como ademas la fila de Conversation se borra, no queda ni el registro de que la conversacion existio, y el proximo intento vuelve a entrar como 'nueva'. El mismo mecanismo esta disponible por la via empty_response sin depender del timing, si el visitante consigue que el modelo devuelva texto vacio. No existe contador de compensaciones por org/periodo ni umbral que alerte.

**Evidencia.**

- `src/modules/chatbot/server/chat/reconcile.ts:176-193`
  > case 'stream_error': case 'stream_abort': return !input.firstTokenDelivered  …  case 'empty_response': return input.toolCallCount === 0
- `src/modules/chatbot/server/chat/handleChatRequest.ts:1146-1153`
  > onAbort: async () => { await compensateReservedQuota?.('stream_abort', { firstTokenDelivered: ttfbAt !== null, toolCallCount: 0 }) },
- `src/modules/chatbot/server/chat/handleChatRequest.ts:1073-1082`
  > onChunk: ({ chunk }) => { if (ttfbAt === null && (chunk.type === 'text-delta' || chunk.type === 'tool-call')) { ttfbAt = Date.now() } },
- `src/modules/chatbot/server/quota/checker.ts:196-212`
  > return forOrg(input.organizationId).$transaction(async (tx) => { const discarded = await tx.conversation.deleteMany({ id: input.conversationId, messages: { none: { role: 'ASSISTANT' } } }) … const release = await tx.quotaUsage.releaseConversation({...})
- `src/modules/chatbot/server/chat/handleChatRequest.ts:1428-1439`
  > await incrementQuota({... tokensIn, tokensOut, costUsd: costBreakdown.totalUsd}, tx)  // solo dentro de la tx de onFinish: un turno abortado no acumula tokens ni costo
- `src/modules/chatbot/shared/historyPolicy.ts:31,50`
  > HISTORY_WINDOW_MESSAGES = 30 · MAX_MESSAGE_CHARS = 4000  → hasta ~120 KB de input elegido por el cliente por request
- `src/lib/rate-limit/presets.ts`
  > chatbotPerSession: { limit: 30, windowMs: 60_000 }  (clave origin + IP hasheada, route.ts:70-77)
- `src/modules/chatbot/server/chat/handleChatRequest.ts:743-754`
  > chatbotLog('chat.quota_compensated', {... trigger, compensated, conversationsUsed }, 'warn')  // sin umbral ni contador acumulado

**Fix.** Tres piezas, ninguna cara. (1) Contabilizar SIEMPRE el consumo real aunque el cupo se devuelva: en el camino de abort/error, escribir tokensIn/tokensOut/costUsd conocidos a QuotaUsage (o a un contador aparte) — hoy el gasto abortado es invisible. (2) Poner techo a la compensacion: llevar un contador de compensaciones por (botConfigId, periodo) y dejar de compensar pasado un umbral razonable (p.ej. 5% del cupo del plan); superado el umbral el cupo se cobra igual. Es una columna nueva en QuotaUsage y un branch en shouldCompensateQuota (que ya es puro y testeable). (3) Alerta operativa: disparar el aviso de Telegram existente cuando la tasa de chat.quota_compensated supere el umbral, reusando notifyTelegramOptional. Archivos: reconcile.ts (decision), quota/checker.ts (contador), handleChatRequest.ts (cableado).

**Criterio de aceptación.** (a) Test unitario sobre shouldCompensateQuota: con compensacionesEnPeriodo >= umbral devuelve false para stream_abort y empty_response, aunque firstTokenDelivered sea false. (b) Verificable en la DB de dev: N ciclos de 'conversacion nueva + corte antes del primer token' dejan QuotaUsage.conversationsCount creciendo despues del umbral, y tokensIn/costUsd > 0 en TODOS los ciclos (no solo en los completados). (c) Un evento de alerta emitido al superar el umbral.

**Necesita decisión de Franco.** Elegir el umbral de compensaciones tolerado por periodo y el umbral USD mensual de gasto LLM (esto ultimo ya figura como decision pendiente #11 de la auditoria maestra / OBS-05). Tambien: si se prefiere directamente NO compensar en stream_abort (cobrar el cupo cuando el cliente corta) — es una decision de producto sobre a quien se le carga un corte de red legitimo.

**Qué encontró el verificador.** Las citas son reales pero la cadena NO cierra: el disparador que el hallazgo pone en el titulo es inalcanzable. Corri `grep -n "abortSignal|timeout:" src/modules/chatbot/server/chat/handleChatRequest.ts` → CERO resultados, y lei el bloque de argumentos del streamText (:1049-1154): model, system, messages, tools, temperature, stopWhen, experimental_transform, onStepFinish, onChunk, onError, onAbort, onFinish — sin `abortSignal` ni `timeout`. Despues fui al SDK instalado (ai@6.0.214, node_modules/ai/dist/index.js:7362-7390): `onAbort` se invoca SOLO desde la funcion local `abort()`, que tiene exactamente dos call-sites y ambos estan gateados por `abortSignal?.aborted` (`if (abortSignal?.aborted) { abort(); return }` y `if (isAbortError(error) && abortSignal?.aborted) { abort() }`). Con abortSignal undefined, `abortSignal?.aborted` es siempre falsy → `abort()` nunca corre → onAbort NUNCA dispara. El `cancel(reason)` del ReadableStream externo (:7392-7394) solo propaga a stitchableStream.cancel, no llama onAbort. Es decir: que el cliente corte la conexion no compensa nada. Reviso los otros triggers de la tabla y ninguno sustituye al abort: 'stream_error' exige que Vertex o una tool tiren (no lo controla el visitante); 'no_user_message' (:838-849) SI es 100% client-triggerable pero corre ANTES del streamText, o sea reserva+release neto cero sin una sola llamada a Vertex — no es denial-of-wallet; 'empty_response' queda como residuo especulativo (habria que lograr que el modelo devuelva texto vacio y cero tool calls). Ademas el agravante contable esta invertido: el comentario y el codigo de :1422-1439 dicen literalmente 'Tokens y cost se siguen acumulando normalmente — tambien en un turno fallback (el modelo se consumio igual; lo que se devuelve es el CUPO)', asi que en el unico camino residual (empty_response, que pasa por onFinish) tokensIn/tokensOut/costUsd SI se escriben a QuotaUsage — el gasto no es invisible. Lo que sobrevive es un hallazgo mucho mas chico y de otra clase: 'empty_response devuelve el cupo pese a que la llamada a Vertex ya se pago', sin via conocida de forzarlo.

**Corrección aplicada.** Cae el mecanismo central (corte de stream → onAbort → compensacion) y cae el agravante contable (el gasto SI se contabiliza en el camino que queda vivo). Sobrevive solo el residuo 'empty_response devuelve cupo con costo ya incurrido', sin disparador controlable verificado. El fix propuesto (contador de compensaciones + alerta) sigue siendo razonable como higiene, pero no cierra un abuso alcanzable hoy.

### [S5-04] El guard de pertenencia de datos de contacto existe en capture_lead pero NO en show_whatsapp_handoff, que tambien persiste y notifica el contacto del visitante

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Sin auth. Visitante del widget publico. No requiere inyeccion sofisticada: alcanza con dictarle al bot un contacto que no es propio, o con que el modelo alucine el campo (que es el caso que el fix de SEC-LLM-03 reconocio como real). |

**Impacto.** (a) Que se logra: que un telefono/email fabricado por el modelo —o dictado por el visitante como si fuera de un tercero— quede persistido en ChatbotEvent.metadata.visitorContact y viaje al Telegram del equipo presentado como 'Contacto' del visitante. Es exactamente la consecuencia LLM06 que SEC-LLM-03 cerro en el otro camino: contactos de terceros sin consentimiento entrando al circuito comercial. (b) A quien: al operador de develOP (Telegram) y al panel de derivaciones del tenant. Menor que capture_lead porque no crea una fila ChatbotLead ni dispara el mail al cliente ni el sync a CRM — por eso MEDIO y no ALTO. (c) Precondiciones: sin auth, desde el widget publico; solo hace falta que el modelo invoque show_whatsapp_handoff, cosa que su description lo empuja a hacer 'decididamente' ante señales de compra.

**Mecanismo.** El ledger da SEC-LLM-03 / P0-7 como CERRADO-SIN-TEST-CI, y el cierre esta efectivamente en captureLead.ts: classifyChannel valida formato Y pertenencia (el dato tiene que aparecer en algun turno USER persistido) y descarta el canal si no. showWhatsappHandoff.ts declara visitorContact y visitorName como strings libres provenientes del modelo, sin ninguna de las dos validaciones: van directo al metadata del ChatbotEvent y al mensaje de Telegram. Es una mitigacion presente en un camino y ausente en el otro sobre el mismo tipo de dato (PII de contacto del visitante). El propio archivo tiene los helpers a un import de distancia.

**Evidencia.**

- `src/modules/chatbot/server/tools/showWhatsappHandoff.ts:44-49`
  > visitorName: z.string().max(100).optional()… visitorContact: z.string().max(200).optional().describe('Telefono o email del visitante si lo dio en la conversacion…')
- `src/modules/chatbot/server/tools/showWhatsappHandoff.ts:121-131`
  > metadata: { visitorName: input.visitorName ?? null, … visitorContact: input.visitorContact ?? null, intent: input.intent, topicSummary: input.topicSummary, …
- `src/modules/chatbot/server/tools/showWhatsappHandoff.ts:138-147`
  > input.visitorContact ? `Contacto: ${input.visitorContact}` : '',   // → notifyTelegramOptional
- `src/modules/chatbot/server/tools/captureLead.ts:134-143`
  > function classifyChannel(raw, isValidFormat, appearsInVisitor): ChannelReason { if (!raw) return 'absent'; if (!isValidFormat(raw)) return 'invalid_format'; if (!appearsInVisitor(raw)) return 'not_owned'; return 'ok' }
- `src/modules/chatbot/server/tools/captureLead.ts:239-247`
  > const phoneReason = classifyChannel(rawPhone, isValidArgentinePhone, (v) => phoneAppearsInVisitorText(v, visitorMessages))  …  const phone = phoneReason === 'ok' ? rawPhone : null

**Fix.** Extraer de captureLead.ts los helpers de pertenencia (classifyChannel, phoneAppearsInVisitorText, emailAppearsInVisitorText, isValidEmailFormat, OWNERSHIP_PHONE_TAIL) a un modulo hermano — p.ej. src/modules/chatbot/server/tools/contactOwnership.ts — y consumirlo desde showWhatsappHandoffExecute: leer los USER persistidos de la conversacion (misma query que captureLead.ts:230) y si visitorContact no es 'ok', persistirlo como null y omitirlo del Telegram (la derivacion se hace igual; el contacto es un campo auxiliar). Cero cambio de schema, cero migracion, y de paso mata la duplicacion.

**Criterio de aceptación.** Un test unitario sobre el execute de show_whatsapp_handoff (con la lectura de mensajes mockeada): un visitorContact que no aparece en ningun turno USER produce metadata.visitorContact === null y un mensaje de Telegram sin la linea 'Contacto:'. Sumarlo al set de invariantes del modulo para que corra en check:invariants — hoy la unica cobertura del guard equivalente en capture_lead es scripts/regression/cases.ts, que exige LLM vivo y no corre en CI.

**Qué encontró el verificador.** Lei showWhatsappHandoff.ts entero (166 lineas): visitorName/visitorContact son `z.string().max(100|200).optional()` en :44-49, entran crudos al metadata del evento en :123-131 y al mensaje de Telegram en :138-147, sin una sola llamada de validacion. Verifique el lado que SI tiene el guard: captureLead.ts:134-143 (classifyChannel con las 3 ramas absent/invalid_format/not_owned), :161-184 (phoneAppearsInVisitorText con cola de 7 digitos, emailAppearsInVisitorText), :229-247 (lee los USER persistidos y descarta el canal si no es 'ok'). Las citas del hallazgo son correctas linea por linea. Busque contra-argumentos y no hay: showWhatsappHandoff no importa nada de captureLead, no lee ChatMessage (mi grep de chatMessage.find* no lo lista), y checkLeadStatus (:93-103) solo mira leadCaptured. CORRIJO LA SEVERIDAD hacia abajo: verifique con `grep -rn "handoff.whatsapp" src/` que el evento tiene UN solo consumidor (admin/multiTenantQueries.ts:218, tabla de derivaciones del panel) — no crea ChatbotLead, no dispara el mail al cliente, no entra al sync de CRM. El dano concreto es PII de un tercero en un log interno + una linea 'Contacto:' en el Telegram del equipo; comparado con SEC-LLM-03 (que si creaba lead + mail + CRM) el hallazgo no esta a la par, y el propio auditor apoya el MEDIO en esa comparacion.

**Corrección aplicada.** La equiparacion con SEC-LLM-03 esta sobredimensionada: aquel camino creaba lead, mail y sync CRM; este termina en ChatbotEvent.metadata con un unico lector (panel admin) y una linea de Telegram. El mecanismo (falta de guard de pertenencia) es identico y real; el impacto no.

#### Ya documentado en auditorías previas — no se re-reporta (11)

- [SEC-LLM-01] Spotlighting con nonce por request: VIGENTE tras los cambios recientes para los roles 'user' y 'system' (handleChatRequest.ts:1041-1047 + 1057-1060, regla en sections.ts:150, deteccion de eco en validateOutput.ts:71-75). Identico a lo documentado — lo nuevo son los dos canales que no pasan por ahi (S5-01 y S5-02).
- [SEC-LLM-02] PII del visitante a Google Vertex sin disclosure ni anonimizacion: sin cambios (handleChatRequest.ts:1049-1061 manda la conversacion entera; ni el widget ni /embed muestran aviso).
- [SEC-LLM-03 / P0-7] Guard de pertenencia y formato de canales en capture_lead: verificado presente e intacto (captureLead.ts:134-190 y 239-247, persiste ambos canales en :361-393). Identico a lo documentado; el desvio esta en la otra tool (S5-04).
- [SEC-LLM-04] System prompt con la KB completa del tenant en cada request: sin cambios (sections.ts:51-73 arma la seccion 3 con los 6 campos de KnowledgeBase enteros). Sigue aceptado como trade-off de producto.
- [SEC-LLM-05] ReactMarkdown sin rehype-raw: verificado cerrado-por-default contra el paquete instalado (react-markdown 10.1.0, node_modules/react-markdown/lib/index.js:124 safeProtocol y :320 defaultUrlTransform). Sin urlTransform explicito propio — nota de higiene, igual que en el ledger.
- [SEC-LLM-06 / SEC-17] prefilledMessage/topicSummary con cap de longitud pero sin strip de caracteres de control: sin cambios (showWhatsappHandoff.ts:41-62).
- [SEC-LLM-07] capture_lead sin CAPTCHA ni verificacion de email: sin cambios; la unica mitigacion sigue siendo el rate-limit (route.ts:70-84).
- [SEC-14] navigate_to_page sirve paths hardcodeados de develOP a bots de terceros: CONFIRMADO sin cambios (navigateToPage.ts:15-24, ocho rutas del sitio de develOP; prisma/seeds/sync-plans.ts:41-45 la incluye en BASE_TOOLS_4, o sea en los planes PRO y BUSINESS de cualquier tenant; el comentario 'Phase 1.5: paths come from BotConfig.allowedNavigationPaths' sigue como TODO).
- [CLEAN-1.1-QUOTA] Doble fuente de verdad de la cuota: el enforcement sigue cortando con plan.quota (handleChatRequest.ts:597 y :653) mientras BotConfig.monthlyQuota se sigue leyendo en la superficie admin. Sin cambios.
- [CLEAN-H-VOLUMEN] handleChatRequest.ts como archivo de mayor riesgo por volumen: sigue abierto y EMPEORO — 1.684 lineas medidas hoy (wc -l) contra las 1.335 del inventario. Es higiene, no seguridad, pero encarece la revision de todo lo de arriba.
- [RESIL-01] streamText sin abortSignal ni maxRetries: confirmado (grep abortSignal|maxRetries en src/modules/chatbot/ = 0 resultados; la llamada esta en handleChatRequest.ts:1049-1064). Lo que si cambio, y esta bien hecho, es que los HOOKS del stream ahora tienen techo de tiempo (reconcile.ts:97-145 + withDeadline.ts) — eso ataca el cuelgue del cierre, no el timeout del LLM.


---

## S6 — Integraciones, webhooks y SSRF

> **Pasada de refutación adversarial:** sí, agente independiente.

### [S6-01] La bóveda cifra en la lectura pero nunca en la escritura: encryptCredential no tiene un solo call-site de producción y las credenciales de hosting/dominio/redes de cada cliente se persisten en claro bajo un badge que dice "AES-256"

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Para exponer los datos: acceso de lectura a la base (backup, dump, consola Neon) o una fuga cross-tenant a nivel DB. Para constatar el defecto: ninguna — es ausencia de call-site, visible por lectura. |

**Impacto.** (a) Dato: credenciales de terceros del cliente (usuario/clave de dominio, hosting y redes sociales) tal como el propio cliente las tipeó en el onboarding, en texto plano en la columna ClientAsset.description de Neon. (b) A quién: cualquiera con lectura a la DB (dump, backup, consola de Neon, una query cruzada), más SUPER_ADMIN y los usuarios de la propia org, que las ven en claro por diseño. (c) Precondiciones: para el 'leak' hace falta acceso a la DB — no es alcanzable desde el widget público ni desde otra org por HTTP. No es CRÍTICO ni ALTO porque no hay camino de explotación remota; es MEDIO porque el control de cifrado en reposo que la UI promete literalmente NO existe, y el material es reutilizable fuera de la plataforma (con esas credenciales se entra al hosting del cliente, no a develOP).

**Mecanismo.** El sprint PD-1 (commit b06ca12, 2026-07-11 — posterior a la auditoría maestra) shippeó el helper de cifrado y los LECTORES, pero no los ESCRITORES. `encryptCredential` queda definido y testeado, y ningún módulo de src/ lo llama: los dos únicos write-paths de assets tipo ACCESS guardan `description` crudo. `resolveCredentialDisplay` fue escrito para convivir con un 'estado mixto' pre-backfill, pero como no hay escritor cifrado ni script de backfill, el estado mixto es en realidad estado único: todo en claro. La rama `isEncrypted(...)` false devuelve el valor tal cual, así que la lectura funciona igual y nada falla — el defecto es silencioso. El literal `url: 'ENCRIPTADO_EN_TEXTO'` y el badge 'AES-256' de las dos vistas refuerzan la creencia de que el control está activo.

**Evidencia.**

- `src/lib/crypto/credential-cipher.ts:73`
  > export function encryptCredential(plaintext: string): string {
- `grep -rn "encryptCredential" --include=*.ts --include=*.tsx --include=*.mjs src/ scripts/ tests/ prisma/`
  > Únicos hits fuera del propio helper: src/lib/crypto/__tests__/credential-cipher.test.ts (12 líneas). Cero call-sites de producción.
- `src/actions/onboarding-actions.ts:115`
  > url: 'ENCRIPTADO_EN_TEXTO',
- `src/actions/onboarding-actions.ts:117`
  > description: data.domainCredentials
- `src/actions/onboarding-actions.ts:129`
  > description: data.socialCredentials
- `src/actions/agency-actions.ts:103`
  > await prisma.clientAsset.create({ ... description: data.description })
- `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:85`
  > AES-256   (badge del header de la bóveda del cliente; se repite por card en :148)
- `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:131`
  > ? resolveCredentialDisplay(asset.description)
- `grep -rln "encryptCredential|isEncrypted" scripts/ prisma/`
  > sin resultados — no existe script de backfill

**Fix.** Cablear el escritor en los dos write-paths: en `src/actions/onboarding-actions.ts` (bloques de :110 y :122) y en `createClientAssetAction` de `src/actions/agency-actions.ts:94`, envolver el valor con `encryptCredential(...)` cuando `type === 'ACCESS'`, y rechazar el guardado con mensaje explícito si `isCredentialEncryptionConfigured()` es false (mismo patrón que `saveCrmIntegration.ts:65-71`, que ya lo hace bien para CRM_SECRET_KEY). Sumar un script one-shot en scripts/ que recorra ClientAsset type=ACCESS, saltee los que ya tienen prefijo `enc:v1:` y cifre el resto. Sumar `ONBOARDING_SECRET_KEY` a la lista de scripts/check-env.js (hoy no figura; solo está comentada en .env.example:245). Corregir el literal `'ENCRIPTADO_EN_TEXTO'` de :115 y :127, que además rompe el `href` de VaultTab.

**Criterio de aceptación.** Crear un asset ACCESS por el onboarding y otro por el panel admin; un SELECT sobre ClientAsset.description devuelve strings que empiezan con `enc:v1:` en ambos casos. La bóveda del cliente y VaultTab siguen mostrando el valor legible. Tras correr el backfill, `SELECT count(*) FROM "ClientAsset" WHERE type='ACCESS' AND description NOT LIKE 'enc:v1:%'` da 0. Con ONBOARDING_SECRET_KEY ausente, el guardado devuelve error visible en vez de persistir en claro.

**Necesita decisión de Franco.** Sí: si la bóveda debe seguir guardando credenciales reusables del cliente (hosting/redes) o pasar a un modelo de acceso delegado; y qué TTL de retención aplica. El cifrado tapa el agujero técnico pero no la decisión de custodiar claves de terceros.

**Qué encontró el verificador.** Verifiqué yo: `encryptCredential` está definido en src/lib/crypto/credential-cipher.ts:73 (key = ONBOARDING_SECRET_KEY, credential-cipher.ts:35) y mi propio grep sobre src/ scripts/ tests/ prisma/ devuelve como únicos hits el propio helper y src/lib/crypto/__tests__/credential-cipher.test.ts — cero call-sites de escritura. Abrí src/actions/agency-actions.ts:94-111: `createClientAssetAction` hace `prisma.clientAsset.create({ ... description: data.description })` crudo (:107). Abrí el badge: 'AES-256' está literal en src/app/(protected)/dashboard/cuenta/boveda/page.tsx:85 y otra vez por card en :148, y la lectura pasa por resolveCredentialDisplay (:131), cuya rama no-cifrada devuelve el valor tal cual (src/lib/crypto/resolve-credential.ts:23). Confirmé el commit: b06ca12 2026-07-11 'feat(crypto): cifrado de credenciales de la boveda (PD-1.1 helper + PD-1.3a lectores)' — el título mismo dice helper+lectores, sin escritores. Busqué contra-argumentos y no encontré: no hay script de backfill en scripts/, ONBOARDING_SECRET_KEY no figura en scripts/check-env.js (CRITICAL_VARS:15 / OPTIONAL_VARS:32), y no hay guard aguas arriba que cifre.

**Corrección aplicada.** El write-path de onboarding citado (src/actions/onboarding-actions.ts:110-130) está en una función MUERTA. `completeOnboardingAction` de ese archivo no tiene ningún importador: el único import de '@/actions/onboarding-actions' en todo src/ es `saveOnboardingProfile` desde src/components/onboarding/OnboardingWizard.tsx:6. El wizard vivo (src/app/bienvenida/_components/BienvenidaWizard.tsx:9) usa OTRA acción homónima, src/app/bienvenida/_actions/complete-onboarding.ts:17, que solo escribe Organization + ClientBrandProfile y NUNCA toca ClientAsset — no tiene campos de credenciales. Consecuencia: cae el marco de '(a) credenciales tal como el propio cliente las tipeó en el onboarding'. El único escritor REAL de assets ACCESS es createClientAssetAction (agency-actions.ts:94), gateado a SUPER_ADMIN (:99) vía VaultManager.tsx:25 — o sea, las credenciales las carga la agencia, no el cliente. El defecto de fondo (texto plano en ClientAsset.description bajo un badge que promete AES-256) sobrevive intacto, y el fix debe cablearse en agency-actions.ts:94; el bloque de onboarding-actions.ts es código muerto que conviene borrar, no cifrar. Caveat de Next: al ser un archivo 'use server' incluido en el grafo por saveOnboardingProfile, sus exports podrían quedar registrados como action-ids — no lo pude cerrar sin build, así que no lo cuento a favor ni en contra.

### [S6-05] Los tokens de integración por tenant (Google Business access+refresh, Tiendanube access, Cal.com API key) y el bot token de Telegram de la agencia se persisten en claro, mientras el repo tiene dos cajas AEAD funcionando y las aplica solo al CRM y al motor

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Lectura a nivel base de datos. Ninguna vía HTTP: verifiqué que ninguna de las cuatro columnas se devuelve al cliente (agenda-inteligente/page.tsx:329 solo hace `Boolean(org.calComApiKey)`; el token de Telegram se sirve enmascarado vía maskSecret en settings.actions.ts:109). |

**Impacto.** (a) Dato: `gbpRefreshToken` es un refresh token de Google de larga vida con scope de Google Business Profile del negocio del cliente; `tiendanubeAccessToken` da acceso a la API de la tienda (órdenes, carritos, productos → PII de compradores del cliente, no solo del cliente); `calComApiKey` da acceso a la agenda; `osTelegramBotToken` controla el bot de alertas de la agencia. (b) A quién: cualquiera con lectura a la DB. (c) Precondiciones: acceso de lectura a Neon (dump, backup, consola). No es ALTO porque no hay camino remoto ni cross-tenant por HTTP; es MEDIO y no BAJO porque el material tiene valor FUERA de la plataforma — con esos tokens se opera contra Google, Tiendanube y Cal.com directamente, sin pasar por develOP, y la revocación depende de terceros.

**Mecanismo.** El schema tiene DOS convenciones conviviendo. Los secretos que pasaron por un sprint de hardening usan el patrón AEAD de tres columnas: `CrmIntegration.secretEncrypted/secretIv/secretTag` (schema:1706-1709, cifrado por `encryptSecret`) y `WabaChannel.apiKeyEncrypted/apiKeyIv/apiKeyTag` (schema:2032-2034, cifrado por `createSecretBox('MOTOR_CHANNEL_SECRET_KEY')`). Los que vienen de integraciones más viejas guardan el material crudo en una sola columna `String? @db.Text` y lo leen tal cual en el hot-path del fetch. No hay diferencia de riesgo entre ambos grupos que justifique el trato distinto: es deriva histórica. Nota adicional: el bot token de Telegram viaja además interpolado en el PATH de la URL de salida (telegram.ts:79), que es el peor lugar para material secreto porque cae en logs de red y en spans de tracing.

**Evidencia.**

- `prisma/schema.prisma:358`
  > gbpAccessToken    String?   @db.Text   (y :359 gbpRefreshToken, :367 tiendanubeAccessToken, :375 calComApiKey)
- `prisma/schema.prisma:835`
  > osTelegramBotToken           String?
- `prisma/schema.prisma:1706`
  > secretEncrypted  String? @db.Text   (+ :1708 secretIv, :1709 secretTag → el patrón correcto, para CRM)
- `prisma/schema.prisma:2032`
  > apiKeyEncrypted String? @db.Text   (+ :2033 apiKeyIv, :2034 apiKeyTag → el patrón correcto, para el motor)
- `src/lib/integrations/google-business-profile.ts:69`
  > access_token: org.gbpAccessToken,   (leído crudo del select de :59-60, sin descifrado porque no hay cifrado)
- `src/lib/integrations/tiendanube.ts:58`
  > return { storeId: org.tiendanubeStoreId, accessToken: org.tiendanubeAccessToken }
- `src/lib/integrations/cal-com.ts:29`
  > return org?.calComApiKey ?? null
- `src/lib/notifications/telegram.ts:79`
  > `https://api.telegram.org/bot${credentials.botToken}/sendMessage`,
- `src/app/api/auth/google-business/callback/route.ts:52`
  > gbpAccessToken: tokens.access_token,   (persistencia en claro directa desde el callback OAuth)

**Fix.** Reusar `createSecretBox` (src/lib/crypto/secret-box.ts) — ya está diseñado exactamente para esto: una env key por dominio de secretos. Agregar el trío de columnas (`<campo>Encrypted/Iv/Tag`) para gbpAccessToken, gbpRefreshToken, tiendanubeAccessToken, calComApiKey y osTelegramBotToken, migrar los cuatro puntos de escritura (google-business/callback/route.ts:52-53, tiendanube/callback/route.ts:67, el setter de calComApiKey, settings.actions.ts:163) y los cuatro de lectura citados arriba, con backfill one-shot. Sumar la env key nueva a scripts/check-env.js (hoy CRM_SECRET_KEY, ONBOARDING_SECRET_KEY y MOTOR_CHANNEL_SECRET_KEY no figuran ahí — solo comentadas en .env.example:234/245/256). Es una agencia de 2 personas: una sola env key nueva para todo el grupo 'integraciones' es sostenible; cinco no lo son.

**Criterio de aceptación.** `SELECT "gbpRefreshToken", "tiendanubeAccessToken", "calComApiKey" FROM "Organization"` y `SELECT "osTelegramBotToken" FROM "AgencySettings"` devuelven NULL o valores no legibles como credencial. Reconectar Google Business y Tiendanube desde /admin/clients sigue funcionando de punta a punta; el panel de agenda sigue mostrando 'conectado'; una alerta de prueba de Telegram sigue llegando. Con la env key ausente, la conexión falla con error explícito en vez de persistir en claro.

**Necesita decisión de Franco.** Sí: elegir si va una env key nueva compartida para integraciones o una por integración (radio de exposición vs. cantidad de secretos a rotar), y ordenar la rotación de los tokens que ya estuvieron en claro en la DB.

**Qué encontró el verificador.** Abrí las 9 citas y todas son literales. prisma/schema.prisma:358-359 (gbpAccessToken/gbpRefreshToken String? @db.Text), :367 tiendanubeAccessToken, :375 calComApiKey, :835 osTelegramBotToken String? — una sola columna, sin trío Encrypted/Iv/Tag. Contrasté con el patrón correcto y está donde dice: schema.prisma:1706-1709 (CrmIntegration.secretEncrypted/secretIv/secretTag, con el comentario 'Secret cifrado AES-256-GCM con env CRM_SECRET_KEY') y :2032-2034 (WabaChannel.apiKeyEncrypted/Iv/Tag). Los cuatro hot-paths de lectura leen crudo: google-business-profile.ts:59-71 selecciona gbpAccessToken/gbpRefreshToken y los pasa a setCredentials sin descifrar; tiendanube.ts:54-58 devuelve accessToken tal cual; cal-com.ts:24-30 `return org?.calComApiKey ?? null`; telegram.ts:79 interpola el botToken en el PATH de la URL. La persistencia en claro desde el callback OAuth está en google-business/callback/route.ts:48-56. Busqué un descifrado envolvente o un helper intermedio y no existe: `createSecretBox` solo se instancia en sendMessage.ts:210 (motor) y `encryptSecret` es del CRM. No hay condición de entorno que lo apague.

### [S6-02] El webhook de alertas de la agencia (alertWebhookUrl) es la segunda superficie saliente configurable y no pasa por validateWebhookUrl ni exige HTTPS; testWebhookAction acepta además una URL arbitraria y devuelve el status de la respuesta al llamador

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Cuenta SUPER_ADMIN para escribir la URL o disparar el test. Para el camino de fuga en claro no hace falta atacante: alcanza con guardar una URL http://. |

**Impacto.** (a) Dato/acción: el payload de alerta lleva nombre de cliente y el detalle textual del evento (ticket, lead, churn) — `formatAlertMessage` arma `🏢 Cliente: ${event.clientName}` + `💬 ${event.detail}` (alerts.ts:64-65). Con un `http://` guardado, eso sale a internet en claro. Adicionalmente, `testWebhookAction` hace un POST a una URL que llega por parámetro y devuelve `response.status` y `statusText`, lo que convierte la superficie en un oráculo de respuesta hacia la red interna del runtime. (b) A quién: a cualquiera que controle el host destino (caso misconfiguración) o al propio SUPER_ADMIN (caso SSRF). (c) Precondiciones: ser SUPER_ADMIN. No lo inflo a ALTO justamente por eso: en una agencia de 2 personas el SSRF gateado por SUPER_ADMIN casi no es un ataque. Lo que sostiene el MEDIO es el camino SIN atacante: una URL http:// mal pegada en /admin/settings exfiltra datos de clientes en claro y nada lo impide, mientras que la superficie hermana (webhook CRM) sí lo bloquea.

**Mecanismo.** El repo tiene un validador anti-SSRF (`validateWebhookUrl`) y lo aplica en UN solo write-path: `saveCrmIntegration.ts:60`. La otra URL saliente configurable de la app, `AgencySettings.alertWebhookUrl`, tiene DOS write-paths y ninguno lo llama. El de `src/lib/actions/settings.ts:61` y `:74` guarda `input.alertWebhookUrl.trim()` sin ninguna validación. El del panel (`settings.actions.ts:154`) valida con el schema `z.string().url()` (settings.schemas.ts:25), que solo comprueba que `new URL()` no tire — acepta cualquier esquema y cualquier host, incluidos loopback e IPs privadas. Después, `alerts.ts:131` y `:163` hacen `fetch` directo sobre ese valor. Es exactamente la clase de defecto que el resto del repo ya identificó como dominante: dos listas que tenían que coincidir y divergieron.

**Evidencia.**

- `src/app/(protected)/admin/settings/_actions/settings.schemas.ts:25`
  > alertWebhookUrl: z.preprocess(emptyStringToNull, z.string().url().nullable()),
- `src/lib/actions/settings.ts:61`
  > alertWebhookUrl: input.alertWebhookUrl.trim() || null,   (idem en :74; sin validateWebhookUrl en todo el archivo)
- `src/lib/alerts.ts:131`
  > const response = await fetch(webhookUrl, {
- `src/lib/alerts.ts:163`
  > const response = await fetch(settings.alertWebhookUrl, {
- `src/lib/alerts.ts:64`
  > `🏢 Cliente: ${event.clientName}`,   (y :65 `💬 ${event.detail}`)
- `src/lib/actions/settings.ts:332`
  > const url = input?.url?.trim() || savedSettings?.alertWebhookUrl || ''
- `src/lib/actions/settings.ts:338`
  > const response = await fetch(url, { ... })   → :349 devuelve `El webhook respondió ${response.status} ${response.statusText}.`
- `src/modules/chatbot/server/admin/integrations/saveCrmIntegration.ts:60`
  > const urlCheck = validateWebhookUrl(data.webhookUrl)   ← el único uso del validador en todo el repo

**Fix.** Hacer de `validateWebhookUrl` la única puerta de salida configurable: llamarla en `src/lib/actions/settings.ts` antes del upsert (líneas 61 y 74), en `updateSettings` de `settings.actions.ts:154`, y sobre el `url` de entrada de `testWebhookAction` (settings.ts:332) antes del fetch de :338. Como red de seguridad, re-validar dentro de `alerts.ts` inmediatamente antes de los fetch de :131 y :163 (el valor viene de la DB y pudo entrar por un path viejo). Si se quiere permitir un webhook interno a propósito, que sea una allow-list explícita, no la ausencia de chequeo.

**Criterio de aceptación.** Guardar `http://ejemplo.com/hook` en /admin/settings devuelve el error del validador ('Solo se aceptan URLs HTTPS') y no persiste. Guardar `https://127.0.0.1:8443/x` devuelve 'No se pueden usar IPs privadas o de loopback' y no persiste. `testWebhookAction({url})` con cualquiera de las dos devuelve el mismo error y NO emite request (verificable porque la respuesta ya no contiene un status HTTP del destino). Una fila preexistente con http:// deja de emitirse desde alerts.ts y queda logueada como config inválida.

**Necesita decisión de Franco.** No para el fix. Sí una decisión de operación: si el webhook de alertas apunta hoy a un http:// en producción, hay que rotarlo — no lo puedo verificar desde el repo.

**Qué encontró el verificador.** Verifiqué el núcleo y sobrevive: `alertWebhookUrl` nunca pasa por validateWebhookUrl. Mi grep de `validateWebhookUrl` en todo src/ devuelve solo saveCrmIntegration.ts:10,60 y el módulo crm (index.ts:8,15,17 + la definición) — un único call-site, como dice el hallazgo. El write-path VIVO es updateSettings en src/app/(protected)/admin/settings/_actions/settings.actions.ts:127-154, que escribe `alertWebhookUrl: normalizeNullableString(parsed.alertWebhookUrl)` (:154) tras un `UpdateSettingsSchema.parse` cuyo único chequeo de URL es `z.string().url()` (settings.schemas.ts:25) — acepta http:// y hosts privados. Confirmé que ese path es el que usa la UI: settings-console.tsx:19-22 importa updateSettings desde '../_actions/settings.actions'. El fetch de salida existe y es alcanzable: alerts.ts:131 dentro de sendAgencyAlert, que sí tiene call-sites vivos (lib/actions/contact.ts, lib/actions/messages.ts, lib/tickets/actions.ts, referrals.service.ts, quota/upsellAlert.ts, entre otros), y el payload lleva `🏢 Cliente: ${event.clientName}` y `💬 ${event.detail}` (alerts.ts:64-65). Ese camino —guardar un http:// y exfiltrar en claro— es real y no tiene guard aguas arriba.

**Corrección aplicada.** Refuto la MITAD de la evidencia: el archivo src/lib/actions/settings.ts está HUÉRFANO. Busqué importadores con dos patrones ('lib/actions/settings' y 'actions/settings') sobre todo src/ y el resultado son solo los dos imports de './_actions/settings.actions' (page.tsx:3 y settings-console.tsx:22) — nada importa src/lib/actions/settings.ts. Por lo tanto `testWebhookAction` (:309), su `fetch(url)` de :338 y el eco de `${response.status} ${response.statusText}` de :349, más el upsert de :61/:74, son código muerto: no hay superficie que los invoque. Cae con ellos el argumento del 'oráculo de respuesta hacia la red interna' y el SSRF gateado por SUPER_ADMIN, que era lo que empujaba el hallazgo a MEDIO. Cae también `sendTestAgencyAlert` (alerts.ts:149-163), cuyo único importador es ese archivo huérfano (settings.ts:8) — o sea que el fetch de alerts.ts:163 tampoco es alcanzable; el vivo es solo el de :131. Lo que queda es un único camino sin atacante: un SUPER_ADMIN pega mal una URL http:// en /admin/settings y el nombre del cliente + el detalle del evento salen en claro. Eso es BAJO: precondición = rol máximo, sin adversario, daño autoinfligido y acotado al contenido de la alerta. El fix sigue valiendo, pero el punto de aplicación es settings.actions.ts:154 y, como red, alerts.ts:131 — no las líneas de settings.ts, que habría que borrar en vez de arreglar.

### [S6-08] El motor 360dialog no tiene camino de aprovisionamiento ni de rotación: generateChannelWebhookCredentials y el cifrado de la API key del canal solo se ejercitan desde los tests — nada en src/ ni en scripts/ crea o rota un WabaChannel

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ninguna para verificar la ausencia. Para que se vuelva un incidente hace falta que el motor se aprovisione en producción, o que uno de los dos secretos por canal se filtre y no haya cómo cambiarlo. |

**Impacto.** (a) Acción que se pierde: no existe forma soportada de crear un canal, ni de rotar el `webhookSecret`/`channelToken` si se filtran, ni de cargar la API key de 360dialog por la vía que la cifra. (b) A quién afecta: al operador — el día que el motor se prenda en prod, el único camino disponible es insertar filas a mano en la base, y la única pieza de código que cifraría la API key no está en ningún flujo operativo. (c) Precondiciones: ninguna para constatarlo. No es ALTO porque hoy el motor no está aprovisionado y `sendMessage` falla cerrado si la API key no está cifrada (no hay un fallback que acepte texto plano). Es MEDIO y no BAJO porque el control de rotación de una credencial que el propio código declara 'material secreto' simplemente no existe, y ese es el momento exacto —el aprovisionamiento manual— en que las claves terminan pegadas en claro.

**Mecanismo.** `generateChannelWebhookCredentials()` (channel-credentials.ts:30) genera el par channelToken + webhookSecret con 256 bits cada uno y devuelve el secret en claro 'para mostrar una vez'. Ese 'mostrar una vez' no existe: no hay server action, ni route, ni pantalla de admin, ni script que la invoque. Un grep sobre src/, scripts/, prisma/ y tests/ devuelve como únicos llamadores dos specs de integración. Lo mismo con la API key del canal: la caja `createSecretBox('MOTOR_CHANNEL_SECRET_KEY')` se instancia solo en `sendMessage.ts:210` para DESCIFRAR; el cifrado solo aparece en `tests/integration/motor-outbound.spec.ts:120`. Consecuencia de diseño: la mitad de escritura del ciclo de vida de la credencial vive únicamente en la suite de tests. Como contrapartida positiva y verificada, el consumo falla cerrado: `sendMessage.ts:113` aborta si `apiKeyEncrypted`/`Iv`/`Tag` son null, y `auth.ts:51-53` rechaza todo canal sin `webhookSecretHash`.

**Evidencia.**

- `src/modules/motor/domain/channel-credentials.ts:30`
  > export function generateChannelWebhookCredentials(): ChannelWebhookCredentials {
- `grep -rn "generateChannelWebhookCredentials|hashWebhookSecret|apiKeyEncrypted|createSecretBox" src/ scripts/ prisma/ tests/`
  > Llamadores de generateChannelWebhookCredentials: solo tests/integration/motor-health.spec.ts:90 y tests/integration/motor-inbound.spec.ts:112. Cifrado de apiKey: solo tests/integration/motor-outbound.spec.ts:120-126. Cero en src/ y cero en scripts/.
- `src/modules/motor/services/sendMessage.ts:113`
  > if (channel === null || channel.apiKeyEncrypted === null || channel.apiKeyIv === null || channel.apiKeyTag === null) {   ← fail-closed correcto en consumo
- `src/modules/motor/adapters/whatsapp/inbound/auth.ts:51`
  > if (webhookSecretHash === null || webhookSecretHash.length === 0) { return { ok: false, reason: 'not-configured' } }   ← fail-closed correcto en entrada
- `src/modules/motor/domain/channel-credentials.ts:10`
  > "el valor en claro se muestra una única vez al generarlo" — el contrato declarado; no existe la superficie que lo muestre

**Fix.** Antes de aprovisionar el primer canal en producción, agregar un único camino operativo (alcanza un script en scripts/ del estilo de los que ya existen, no hace falta pantalla): recibe orgId + phoneNumberId + API key de 360dialog, llama a `generateChannelWebhookCredentials()`, cifra la API key con `createSecretBox('MOTOR_CHANNEL_SECRET_KEY')`, escribe el WabaChannel y imprime UNA vez el channelToken y el webhookSecret para cargarlos en el BSP. El mismo script con un flag `--rotate` cubre la rotación (regenerar par, reescribir hash, reimprimir). Sumar MOTOR_CHANNEL_SECRET_KEY a scripts/check-env.js.

**Criterio de aceptación.** Correr el script contra la DB de dev crea un WabaChannel cuyo `webhookSecretHash` es un SHA-256 de 64 hex y cuyo `apiKeyEncrypted/Iv/Tag` están poblados; un POST al webhook con el Bearer impreso devuelve 200 y con otro Bearer devuelve 401. Correrlo con --rotate cambia channelToken y webhookSecretHash, y el Bearer viejo pasa a devolver 401.

**Necesita decisión de Franco.** Sí: si el aprovisionamiento vive como script de operador o como pantalla de admin. Para 2 personas el script alcanza; una pantalla suma superficie que después hay que gatear por rol.

**Qué encontró el verificador.** Reproduje el grep con mis propios términos: `generateChannelWebhookCredentials` solo aparece en su definición (src/modules/motor/domain/channel-credentials.ts:30) y en tests/integration/motor-health.spec.ts:19,90 y tests/integration/motor-inbound.spec.ts:26,112 — cero en src/ y cero en scripts/. `createSecretBox` solo en src/lib/crypto/secret-box.ts:55 (definición), sendMessage.ts:22,210 (descifrado) y tests/integration/motor-outbound.spec.ts:17,120. Amplié la búsqueda a `wabaChannel.create|upsert|update` para descartar un aprovisionamiento por otra vía: los únicos creates están en tests (motor-health.spec.ts:91, motor-inbound.spec.ts:113, motor-isolation.spec.ts:82) y los únicos updates de producción son de salud del canal (handle-health.ts:219,243), que no tocan credenciales. Verifiqué los dos fail-closed que el auditor acredita a favor del código: sendMessage.ts:113 aborta si apiKeyEncrypted/Iv/Tag son null, y verifyWebhookAuth devuelve 'not-configured' si webhookSecretHash es null o vacío (auth.ts:51-53).

**Corrección aplicada.** Bajo la severidad de MEDIO a BAJO aplicando el criterio de impacto real que pide la consigna. Hoy no se expone ningún dato ni se habilita ninguna acción: no hay canales aprovisionados (cero creates de producción), el consumo falla cerrado en ambos extremos (sendMessage.ts:113, auth.ts:51) y el hallazgo es una ausencia de camino operativo, no una debilidad alcanzable. El propio auditor lo admite ('para que se vuelva un incidente hace falta que el motor se aprovisione'). Es deuda de preparación —legítima y con ventana barata ahora— pero no compite en la misma banda que S6-01/S6-05, donde ya hay material secreto en claro en la DB.

### [S6-03] validateWebhookUrl no bloquea direcciones IPv6 mapeadas a IPv4 ([::ffff:127.0.0.1], [::ffff:169.254.169.254], [::ffff:10.0.0.5]) ni la dirección no especificada [::] — la lista negra de loopback y rangos privados es evadible en config-time, no solo por DNS rebinding

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Cuenta SUPER_ADMIN (es el único rol que llega a saveCrmIntegration). Un listener TLS en la dirección destino. |

**Impacto.** (a) Acción: pasar el guard de configuración con una URL que apunta a loopback o a rangos privados/link-local, sin necesitar DNS. (b) A quién: al SUPER_ADMIN que configura el webhook CRM — la única superficie que llama al validador. (c) Precondiciones: ser SUPER_ADMIN, y que exista un listener HTTPS en el destino (el validador sí exige https: correctamente), lo que en Netlify Functions sobre Lambda es improbable. Lo dejo en BAJO a propósito: el alcance práctico HOY es casi nulo. Su valor real es otro y es concreto: el ledger afirma que la validación de privadas/loopback/link-local/IPv6-ULA 'sí funciona correctamente en config-time', y eso es falso para esta clase; y son exactamente los predicados que un fix de DNS rebinding (resolver-y-chequear) reusaría, heredando el agujero justo cuando pase a importar.

**Mecanismo.** El validador decide sobre el string `parsed.hostname` con tres mecanismos: un Set de hostnames literales, sufijos de dominio, y cinco regex sobre notación decimal punteada IPv4. Para IPv6 hay cuatro comparaciones de prefijo (`::1`, `fe80:`, `fc`, `fd`). El parser WHATWG de `new URL()` normaliza la forma `::ffff:a.b.c.d` a su serialización hexadecimal comprimida, que no empieza con ninguno de esos prefijos ni matchea ninguna regex IPv4 — la representación cambia y la lista negra deja de reconocerla, aunque la dirección siga siendo loopback o RFC1918 y el socket la trate como tal en un host dual-stack. Verifiqué la normalización corriendo el parser real de este Node. Como contraste, las formas ofuscadas IPv4 clásicas (decimal entero, octal, short-form) SÍ quedan cubiertas, porque el mismo parser las normaliza a dotted-quad antes de que la regex las vea — o sea, el validador se apoya en la normalización del parser y esa apuesta funciona para IPv4 y falla para IPv6.

**Evidencia.**

- `node -e "for(const u of ['https://[::ffff:127.0.0.1]/x','https://[::ffff:169.254.169.254]/x','https://[::]/x','https://[::ffff:10.0.0.5]/x','https://2130706433/x','https://0177.0.0.1/x']){console.log(u, new URL(u).hostname)}"`
  > https://[::ffff:127.0.0.1]/x => hostname: [::ffff:7f00:1] · https://[::ffff:169.254.169.254]/x => [::ffff:a9fe:a9fe] · https://[::]/x => [::] · https://[::ffff:10.0.0.5]/x => [::ffff:a00:5] · https://2130706433/x => 127.0.0.1 · https://0177.0.0.1/x => 127.0.0.1
- `src/modules/chatbot/server/crm/validateWebhookUrl.ts:20`
  > const BLOCKED_HOSTNAMES: ReadonlySet<string> = new Set(['localhost','127.0.0.1','::1','0.0.0.0','metadata.google.internal','169.254.169.254'])   ← ninguna de las formas ::ffff: figura
- `src/modules/chatbot/server/crm/validateWebhookUrl.ts:36`
  > const PRIVATE_IPV4_PATTERNS: readonly RegExp[] = [ /^10\.\d{1,3}\.../, ... ]   ← regex sobre notación punteada; ::ffff:7f00:1 no matchea ninguna
- `src/modules/chatbot/server/crm/validateWebhookUrl.ts:86`
  > hostname === '::1' || hostname.startsWith('fe80:') || hostname.startsWith('fc') || hostname.startsWith('fd')   ← '::ffff:7f00:1' y '::' pasan los cuatro
- `src/modules/chatbot/server/crm/validateWebhookUrl.ts:56`
  > if (parsed.protocol !== 'https:') { return { ok: false, error: 'Solo se aceptan URLs HTTPS' } }   ← esto SÍ cierra file:, gopher:, data: y http:

**Fix.** Dejar de decidir sobre el string y decidir sobre la dirección. En validateWebhookUrl: quitar los corchetes, y si `net.isIP(hostname) !== 0`, normalizar la forma mapeada (`::ffff:x`) a su IPv4 equivalente antes de aplicar los rangos, y rechazar además `::` y `::ffff:0:0/96` entero. Agregar 100.64.0.0/10 (CGNAT) mientras se está ahí. Importante: cuando se encare el fix de DNS rebinding (SEC-SSRF-01, ya en el ledger), la resolución debe pasar por ESTE mismo predicado ya corregido — si no, la resolución AAAA devolverá direcciones en forma IPv6 y el chequeo volverá a fallar por el mismo motivo.

**Criterio de aceptación.** Un test unitario nuevo junto a validateWebhookUrl.ts afirma ok:false para 'https://[::ffff:127.0.0.1]/x', 'https://[::ffff:169.254.169.254]/x', 'https://[::ffff:10.0.0.5]/x', 'https://[::]/x' y 'https://100.64.0.1/x', y ok:true para 'https://n8n.example.com/webhook/x'. El test corre en el agregado de package.json:18.

**Qué encontró el verificador.** Corrí yo mismo el parser de este Node y reproduje la normalización: 'https://[::ffff:127.0.0.1]/x' → hostname '[::ffff:7f00:1]', '[::ffff:169.254.169.254]' → '[::ffff:a9fe:a9fe]', '[::]' → '[::]', '[::ffff:10.0.0.5]' → '[::ffff:a00:5]'; y las ofuscadas IPv4 sí se normalizan ('https://2130706433/x' → '127.0.0.1', 'https://0177.0.0.1/x' → '127.0.0.1'). Leí el validador entero: tras strippear corchetes (validateWebhookUrl.ts:62-66) el hostname resultante '::ffff:7f00:1' no está en BLOCKED_HOSTNAMES (:20-27), no matchea ninguna de las 5 regex dotted-quad (:36-42), y falla las cuatro comparaciones IPv6 de :85-90 (`=== '::1'`, startsWith 'fe80:', 'fc', 'fd') → devuelve ok:true. Confirmé también el contra-hallazgo que el auditor reconoce: el https-only de :56-58 sí cierra http:/file:/gopher:. Verifiqué la precondición: el único call-site es saveCrmIntegration.ts:60, cuya primera línea es `await requireSuperAdmin()` (:30) — BAJO es la severidad correcta.

**Corrección aplicada.** Detalle menor en la spec del fix, no en el hallazgo: el validador YA quita los corchetes (validateWebhookUrl.ts:62-66, con comentario explícito), así que 'quitar los corchetes' del fix es redundante. El bypass sobrevive DESPUÉS del stripping — lo verifiqué siguiendo el flujo con el hostname ya sin corchetes. El resto del fix (normalizar ::ffff:x a IPv4 antes de aplicar rangos, rechazar :: y ::ffff:0:0/96) es correcto.

### [S6-07] El channelToken del webhook del motor —declarado material secreto por el propio código— viaja en el path de la URL, y el scrubber de Sentry no tiene ningún patrón que lo reconozca ni cubre eventos de transaction (beforeSendTransaction no está configurado con tracesSampleRate 0.1 en prod)

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | PLAUSIBLE |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Acceso al proyecto de Sentry o a los logs de la function. Para explotarlo de verdad haría falta además el webhookSecret, que va en el header Authorization y sí queda cubierto por el denylist de keys del scrubber. |

**Impacto.** (a) Dato: uno de los dos secretos por canal (el token opaco de 256 bits de la URL) puede quedar registrado fuera del perímetro, en Sentry y en los logs de acceso de Netlify. (b) A quién: a quien tenga acceso al proyecto de Sentry o a los logs de la plataforma. (c) Precondiciones: acceso a esas consolas. Lo mantengo en BAJO y no más porque el token SOLO no autentica: el verificador exige además el Bearer por canal (auth.ts:54-61) y cruza metadata.phone_number_id contra el canal (process.ts:142) — es una degradación de defensa en profundidad, no un bypass. Lo que le da peso, y por eso no es descartable, es que se combina con S6-08: si el token se filtra, hoy no existe camino para rotarlo.

**Mecanismo.** El diseño pone el token en el path (`/api/motor/webhook/[channelToken]`) y el route lo reconoce como secreto: antes de usarlo lo hashea para armar la clave de rate-limit, con el comentario explícito 'es material secreto de URL'. Pero el path completo acompaña a cualquier evento que la ruta genere. `scrubPii` sí sanea `event.request.url`, y saneaba bien emails, JWT, tarjetas y teléfonos — ninguno de esos cuatro patrones matchea una cadena de 64 caracteres hexadecimales, así que el token pasa intacto. Segundo hueco, este verificado sin ambigüedad: la sanitización está enganchada únicamente en `beforeSend`, que el SDK invoca para ErrorEvent; `beforeSendTransaction` no aparece en ningún archivo del repo, y `tracesSampleRate` es 0.1 en producción — o sea que una fracción del tráfico se envía por un hook que nunca pasa por el scrubber. El propio archivo lo dice en su comentario de cierre. Aclaro el límite: que el SDK de Next incluya el path crudo (y no la ruta parametrizada) en el payload de transaction es lo que NO pude confirmar sin tráfico real; por eso la confianza es INFERIDO.

**Evidencia.**

- `src/app/api/motor/webhook/[channelToken]/route.ts:30`
  > // Rate limit ANTES de cualquier lectura de DB de canales. La clave hashea // el token: es material secreto de URL
- `src/lib/sentry/scrub-pii.ts:48`
  > const PATTERNS: Array<{ rx: RegExp; placeholder: string }> = [ ... ]   → los 4 patrones son email, JWT (eyJ...), tarjeta (4 grupos de 4 dígitos) y teléfono; ninguno matchea 64 hex
- `src/lib/sentry/scrub-pii.ts:135`
  > if (typeof req.url === 'string') req.url = scrubString(req.url)
- `src/lib/sentry/scrub-pii.ts:109`
  > // Tipado: el hook beforeSend del SDK recibe ErrorEvent. Si en el futuro // se quiere scrubear transactions, usar beforeSendTransaction (otro hook).
- `grep -rn "beforeSendTransaction" src/instrumentation.ts src/instrumentation-client.ts instrumentation.ts sentry.server.config.ts sentry.edge.config.ts`
  > sin resultados en ninguno de los cinco inits
- `src/instrumentation.ts:8`
  > tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,   (idem :35 para el runtime edge)

**Fix.** Dos piezas chicas. (1) Sumar a `PATTERNS` en scrub-pii.ts un patrón para tokens opacos largos —`/\b[a-f0-9]{32,}\b/gi` → '[token]'— que cubre el channelToken y de paso cualquier hash o secret hex que caiga en un string libre. (2) Enganchar `beforeSendTransaction: (event) => scrubPii(event as never)` en los inits de src/instrumentation.ts (:8 y :35) para que el 10% muestreado pase por el mismo filtro. Alternativa más fuerte si se quiere cerrarlo de raíz: mover el channelToken del path a un header propio, pero eso obliga a reconfigurar el webhook en el BSP y solo vale la pena si el motor todavía no está aprovisionado.

**Criterio de aceptación.** Un test sobre `__INTERNALS_FOR_TESTING__.scrubString` afirma que una URL con un segmento de 64 hex sale con '[token]' en lugar del valor. Y un grep por `beforeSendTransaction` en src/instrumentation.ts devuelve el hook enganchado en los dos runtimes.

**Necesita decisión de Franco.** Sí, una sola: si el channelToken se queda en el path (y se acepta el riesgo residual mitigado por el scrub) o se mueve a header antes de aprovisionar el primer canal. La ventana para decidirlo barato es ahora, mientras no hay canales en prod.

**Qué encontró el verificador.** Verifiqué todo lo verificable y sostiene, pero la cadena no cierra. Confirmado por lectura: el comentario 'es material secreto de URL' está en src/app/api/motor/webhook/[channelToken]/route.ts:30-31 y el token se hashea solo para la clave de rate-limit (:32); los 4 PATTERNS de src/lib/sentry/scrub-pii.ts:47-61 son email, JWT (ancla `\beyJ`), tarjeta (4 grupos de 4 dígitos) y teléfono (8+ dígitos) — ninguno matchea 64 hex, lo comprobé leyendo cada regex; scrubString solo se aplica a event.request.url en :135. Confirmé el segundo hueco con mi propio grep sobre src/: `beforeSendTransaction` no aparece en NINGÚN archivo (los únicos hits del término son el comentario de scrub-pii.ts:110 que reconoce la deuda). Amplié a los inits legacy de la raíz que el auditor cita y también los verifiqué: sentry.server.config.ts y sentry.edge.config.ts tienen `tracesSampleRate: 0.1` fijo y solo `beforeSend(event, hint) { return scrubPii(event, hint) }`; src/instrumentation.ts:8 y :35 y src/instrumentation-client.ts:6 usan `NODE_ENV === 'production' ? 0.1 : 0`. Queda en PLAUSIBLE por tres eslabones que no puedo cerrar sin tráfico y que se acumulan a favor de bajar la preocupación: (1) el propio auditor admite no haber confirmado que el SDK meta el path CRUDO —y no la ruta parametrizada `/api/motor/webhook/[channelToken]`— en el payload de transaction; (2) por S6-08, que verifiqué, no hay ningún WabaChannel aprovisionado, así que hoy no existe un channelToken real que pueda filtrarse; (3) el ledger trae OBS-01 ('Sentry completo pero sin evidencia de vida en prod: sin DSN todo el pipeline queda inerte'), condición de entorno que apagaría el canal entero. La pieza del fix que sí es incondicionalmente correcta y barata es enganchar beforeSendTransaction — esa no depende de ninguno de los tres eslabones.

### [S6-04] Las dos piezas de seguridad de esta lente no tienen candado: validateWebhookUrl no tiene ni un solo test, y el único invariante de autenticación de cron que existe no está enganchado al agregado que corre en CI

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CONFIRMADO_SIN_TEST |
| **Precondiciones** | Ninguna. |

**Impacto.** (a) No expone dato ni habilita acción por sí mismo — es la ausencia del mecanismo que impediría que S6-02 y S6-03 vuelvan después de arreglarse, y que el fail-open de cron ya documentado se reintroduzca en silencio. (b) A quién: al equipo, en forma de regresión no detectada. (c) Precondiciones: ninguna. BAJO por definición: es deuda de verificación, no una debilidad explotable. Lo reporto porque es el vehículo del criterio de aceptación de los otros hallazgos y porque el ítem del cron ya se pagó (el invariante está escrito) y solo falta una línea para cobrarlo.

**Mecanismo.** `validateWebhookUrl.ts` es el único control anti-SSRF del repo y su directorio no tiene carpeta `__tests__` ni archivo `.invariant.ts` — nada afirma qué bloquea. Del lado de cron, el sprint T0.2 sí escribió un invariante que cubre el caso exacto del fail-open ('sin CRON_SECRET seteada + Authorization: Bearer undefined literal → 401'), pero el script agregado `check:invariants` de package.json:18 enumera 16 invariantes a mano y ese no está en la lista; queda escrito y sin correr. Es la misma clase de defecto que el resto del repo ya tiene identificada como dominante: dos listas que tienen que coincidir y divergieron.

**Evidencia.**

- `ls src/modules/chatbot/server/crm/`
  > buildLeadPayload.ts encryptSecret.ts getEffectiveSyncStatus.ts index.ts postToN8n.ts syncLeadToCrm.ts validateWebhookUrl.ts   — sin __tests__, sin .invariant.ts
- `src/app/api/cron/cleanup-old-events/__tests__/cleanup-old-events-auth.invariant.ts:53`
  > 'sin CRON_SECRET seteada + "Authorization: Bearer undefined" literal → 401 (el caso exacto que pide el ticket: nunca autenticar contra secret vacío)'
- `package.json:18`
  > "check:invariants": "npm run check:invariant && ... && npm run check:invariant:security"   — 16 entradas, ninguna es la del cron

**Fix.** Agregar `"check:invariant:cron-auth": "npx tsx src/app/api/cron/cleanup-old-events/__tests__/cleanup-old-events-auth.invariant.ts"` a los scripts y encadenarlo en `check:invariants` (package.json:18). Crear `src/modules/chatbot/server/crm/webhook-url.invariant.ts` con los casos de S6-03 (mapeadas IPv6, `::`, CGNAT) más los que ya funcionan (https-only, decimal/octal IPv4, sufijos .local/.internal) y encadenarlo también — un invariante puro, sin DB, corre en segundos y es el candado natural para un validador que es una función pura.

**Criterio de aceptación.** `npm run check:invariants` ejecuta los dos nuevos y falla si se rompe cualquiera de sus afirmaciones (comprobable revirtiendo a mano una línea del validador y viendo el rojo).

**Qué encontró el verificador.** Verifiqué las dos mitades por separado. (1) validateWebhookUrl sin candado: `ls src/modules/chatbot/server/crm/` devuelve exactamente buildLeadPayload.ts, encryptSecret.ts, getEffectiveSyncStatus.ts, index.ts, postToN8n.ts, syncLeadToCrm.ts, validateWebhookUrl.ts — ni carpeta __tests__ ni archivo .invariant.ts. Confirmado: el único control anti-SSRF del repo no tiene nada que afirme qué bloquea, lo que es exactamente el vehículo del criterio de aceptación de S6-03. (2) El agregado: leí package.json:18 y conté los 16 `check:invariant:*` encadenados en `check:invariants`; ninguno es el del cron. El invariante existe (src/app/api/cron/cleanup-old-events/__tests__/cleanup-old-events-auth.invariant.ts).

**Corrección aplicada.** Dos correcciones a la mitad del cron. (a) El invariante SÍ está registrado como npm script: package.json:47 `"test:t02": "npx tsx src/app/api/cron/cleanup-old-events/__tests__/cleanup-old-events-auth.invariant.ts"`. El hallazgo afirma que 'queda escrito y sin correr' y su fix propone CREAR un script `check:invariant:cron-auth` que ya existe con otro nombre — lo que falta es encadenar `test:t02` al agregado, no escribirlo. (b) Más de fondo: el título dice 'no está enganchado al agregado que corre en CI', y ese agregado NO corre en CI. `npm run check:invariants` aparece únicamente en logic-core-v3/.github/workflows/e2e.yml:16, y verifiqué con `git rev-parse --show-toplevel` que la raíz del repo es C:/Users/franc/Desktop/wt-auditoria-seguridad, cuyo .github/workflows/ contiene solo db-backup.yml — el workflow está en un subdirectorio y GitHub Actions no lo levanta (ya documentado en el ledger como DATOS-CAND-e2e-yml/OBS-10). Así que enganchar el invariante al agregado no lo hace correr: primero hay que mover el workflow. Además, esta mitad del hallazgo es un caso particular de CLEAN-1.1-INVARIANTES del ledger ('40 de 56 invariantes nunca corren — CI ejecuta un agregado que enumera 16'), o sea que 'CONFIRMADO_SIN_TEST' es correcto pero el aporte nuevo real es solo la ausencia de tests de validateWebhookUrl. Mantengo BAJO.

### [S6-06] CIERRE VERIFICADO — el state de OAuth de Google Business y Tiendanube sí está firmado con HMAC y validado antes de tocar la DB: SEC-AUTH-01, SEC-AUTH-02, SEC-AUTH-06 y F3 del ledger están cerrados (residual acotado: el state es replayable dentro de su TTL de 10 min y no está atado a la sesión que lo emitió)

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Para el residual: sesión SUPER_ADMIN válida más haber observado un state legítimo dentro de su TTL de 10 minutos. El vector original ya no tiene precondiciones alcanzables. |

**Impacto.** El hallazgo original (state-swap: asociar los tokens OAuth del atacante a la org víctima cambiando el parámetro state) ya no es alcanzable — el state se firma con HMAC-SHA256 namespaceado por integración y se verifica con timingSafeEqual antes de cualquier acceso a base. Lo que reporto en BAJO es el residual, no el original: el diseño no persiste nonces consumidos, así que un state legítimo capturado puede reusarse dentro de sus 10 minutos, y el payload no ata el flujo al usuario que lo inició. (a) Acción residual: repetir un callback dentro de la ventana. (b) A quién: requiere haber observado un callback legítimo. (c) Precondiciones: los dos endpoints ya exigen sesión SUPER_ADMIN antes de mirar el state (callback:16-18), y en esta plataforma los SUPER_ADMIN son las 2 personas de la agencia — por eso el residual es BAJO y no justifica trabajo ahora. El valor de este ítem es que permite tachar 4 entradas del ledger.

**Mecanismo.** Lo que cambió respecto de lo inventariado: `src/lib/security/oauth-state.ts` firma el payload `{o: orgId, n: nonce, e: expiry}` con HMAC-SHA256 sobre `${scope}:${payload}`, el scope namespacea por integración (un state de Tiendanube no sirve para GBP), la verificación compara en tiempo constante y chequea expiry, y ambos callbacks la invocan ANTES del primer `prisma.*`. El `exchangeCodeForTokens` de SEC-AUTH-06 sigue sin recibir el state, pero el caller ya lo validó, que es lo que el ledger pedía resolver. Aclaración de fecha, para que no se lea como una regresión-y-arreglo reciente: el fix es del commit 7f21360, 2026-05-26 — anterior a la auditoría maestra (6254428, 2026-07-10). O sea que las entradas SEC-AUTH-01/02/06 y F3 del ledger son transcripción sin re-verificar del reporte de 2026-05, no estado real del árbol.

**Evidencia.**

- `src/lib/security/oauth-state.ts:38`
  > return createHmac('sha256', getSecret()).update(`${scope}:${payload}`).digest('base64url').slice(0, 32)
- `src/lib/security/oauth-state.ts:91`
  > if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) { return { valid: false, reason: 'bad_signature' } }
- `src/app/api/auth/google-business/callback/route.ts:30`
  > const stateCheck = verifyOAuthState(GBP_OAUTH_SCOPE, rawState)   — antes del primer prisma.* (:38)
- `src/app/api/auth/tiendanube/callback/route.ts:42`
  > const stateCheck = verifyOAuthState(TIENDANUBE_OAUTH_SCOPE, rawState)   — antes del primer prisma.* (:50)
- `src/lib/integrations/google-business-profile.ts:44`
  > state: signOAuthState(GBP_OAUTH_SCOPE, orgId),   (el /start ya emite firmado; idem tiendanube.ts:20)
- `src/lib/security/oauth-state.ts:20`
  > No persistimos nonces consumidos: el flow es SUPER_ADMIN-only, el TTL es corto (10 min), y el modelo de amenaza es anti state-swap, no anti-replay.   ← el residual está declarado, no es un descuido
- `git log -1 --format="%h %ad %s" --date=short 7f21360`
  > 7f21360 2026-05-26 chore: consolidate working tree backlog (B11 + B12 + B-SEC)

**Fix.** Ninguna acción de código requerida. Acción de inventario: marcar SEC-AUTH-01, SEC-AUTH-02, SEC-AUTH-06 y F3 como CERRADOS en el ledger, con la nota de que el cierre es de 2026-05-26 y que las auditorías posteriores los arrastraron sin re-verificar. Si en algún momento el flujo OAuth deja de ser SUPER_ADMIN-only, ahí sí hay que sumar consumo de nonce (una tabla chica con el nonce y su expiry, borrado por el cron de cleanup) y atar el payload al userId de la sesión emisora.

**Criterio de aceptación.** El ledger deja de listar esas 4 entradas como ABIERTO. Como candado opcional y barato: un invariante que afirme que `verifyOAuthState` rechaza un state con firma alterada, uno con scope cruzado (state de Tiendanube presentado a GBP) y uno expirado.

**Necesita decisión de Franco.** Sí, pero solo de inventario: confirmar el cierre de esas 4 entradas para que la próxima corrida no vuelva a gastar tiempo en ellas.

**Qué encontró el verificador.** Verifiqué el cierre leyendo las tres piezas completas. src/lib/security/oauth-state.ts: la firma es HMAC-SHA256 sobre `${scope}:${payload}` (:37-41), el payload lleva {o, n:randomBytes(16), e:Date.now()+STATE_TTL_MS} con TTL de 10 min (:23, :49-57), y verifyOAuthState compara con timingSafeEqual dentro de try/catch más chequeo previo de longitud (:83-95) y valida shape+expiry después. Los dos callbacks llaman al verificador ANTES de cualquier prisma.*: en google-business/callback/route.ts el `verifyOAuthState(GBP_OAUTH_SCOPE, rawState)` está en :30 con el `if (!stateCheck.valid) return redirect` en :31-34, y el primer prisma.organization.findUnique recién en :38; en tiendanube/callback/route.ts el verify está en :42 y el primer prisma en :50. Ambos exigen además sesión SUPER_ADMIN como primer guard (:15-18 y :29-31). El emisor firma de verdad: google-business-profile.ts:44 `state: signOAuthState(GBP_OAUTH_SCOPE, orgId)`. Confirmé la fecha con git: `git log -1 --date=short 7f21360` = '7f21360 2026-05-26 chore: consolidate working tree backlog (B11 + B12 + B-SEC)', y `git log -1 -- src/lib/security/oauth-state.ts` devuelve ese mismo commit — el fix es de mayo, anterior a la maestra. Y confirmé el lado del ledger: ledger-S6.md:109 (SEC-AUTH-01), :114 (SEC-AUTH-02), :124-125 (SEC-AUTH-06 'estado declarado: abierto'), :130-131 (F3 'ABIERTO → escalado a SEC-AUTH-01') — las cuatro figuran abiertas contra un árbol donde el fix ya está. El residual que reporta también es real y está declarado en el código: oauth-state.ts:19-21 dice textualmente que no se persisten nonces consumidos.

**Corrección aplicada.** Un matiz sobre la tesis de 'transcripción sin re-verificar': la maestra SÍ miró oauth-state.ts — ledger-S6.md:100 la lista entre los positivos a preservar ('oauth-state.ts:30-34 falla duro si faltan los secrets'). O sea que el ledger contiene simultáneamente el positivo del archivo nuevo y las entradas viejas sin actualizar; el defecto es de reconciliación, no de que nadie haya abierto el archivo. Dato adicional que el hallazgo no menciona y matiza el cierre: getSecret() cae a AUTH_SECRET si OAUTH_STATE_SECRET falta (oauth-state.ts:26-28) — el ledger ya lo trae como CLEAN-REF-OAUTHSTATE, 'DESINFLADO por el escéptico: el fallback es deliberado', así que no reabre nada, pero la nota de cierre debería dejarlo dicho.

#### Ya documentado en auditorías previas — no se re-reporta (10)

- SEC-SSRF-01 / SEC-06 — postToN8n no re-resuelve DNS antes del POST ni usa redirect:'manual': confirmado idéntico en validateWebhookUrl.ts:11-13 (deuda declarada) y postToN8n.ts:87-92 (fetch sin redirect manual). Sin cambios.
- SEC-03 / CLEAN-1.1-CRON — 3 de 8 rutas de cron fail-open contra el literal 'Bearer undefined': confirmado idéntico en detect-bot-issues/route.ts:8, generate-insights/route.ts:12-14 y send-weekly-reports/route.ts:8. Sin cambios.
- SEC-09 — comparación de CRON_SECRET con !== en vez de timingSafeEqual: confirmado en las 8 rutas; ninguna usa comparación en tiempo constante. Sin cambios.
- CLEAN-1.1-CRONEXPORT — getProvidedCronSecret sigue exportada desde un route.ts (cleanup-old-events/route.ts:28) y duplicada verbatim en os-follow-up:142, regenerate-briefs:7 y send-executive-reports:7; no existe helper compartido en src/lib. Sin cambios.
- CLEAN-H-CRONTRIGGER / RESIL-03 — scheduling fantasma: netlify.toml agenda 3 functions y netlify/functions/ contiene solo cleanup-old-events-cron.ts; vercel.json declara 3 crons más en un deploy que no es Vercel. Sin cambios.
- CLEAN-2.2-FETCH / RESIL-08 / RESIL-10 — fetch salientes sin timeout y sin cliente HTTP compartido: confirmado que telegram.ts:79, cal-com.ts:49, cal-com-v2.ts:168, google-business-profile.ts (4 fetch) y tiendanube.ts (5 fetch) siguen sin AbortSignal, mientras postToN8n, motor/outbound/client, alerts y settings sí lo tienen. Sin cambios.
- RESIL-11 / RESIL-12 — retry de CRM con delays fijos sin jitter (postToN8n.ts:21) y createBooking de Cal.com sin idempotency key (cal-com-v2.ts:108-148). Sin cambios.
- RESIL-02 — outbox de CrmSyncAttempt sin barrido (syncLeadToCrm.ts, fire-and-forget post-respuesta). Sin cambios.
- C-13 — el contrato de error de Cal.com sigue siendo un match por substring (cal-com-v2.ts:186-195, 'already booked' / 'no_available_users'). Sin cambios.
- C-01 — 4 de 5 herramientas externas sin URL cargada en src/lib/leados/herramientas.ts. Sin cambios (es decisión de Franco, no código).


---

## S7 — Exposición de datos, secretos y PII

> **Pasada de refutación adversarial:** **no** — el verificador murió por límite de sesión. Los hallazgos marcados *sin verificar* los sostiene una sola lectura, salvo los que verifiqué yo y están anotados como tales.

### [S7-01] Retención indefinida de PII: el único purgado cableado es chatbot_events (30 d). Transcripciones, leads y TODO el motor WhatsApp (teléfono en claro + cuerpo del mensaje) crecen sin cota ni borrado

| | |
|---|---|
| **Severidad** | ALTO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Ninguna para que la retención ocurra. Para explotar el volumen acumulado: acceso a la base o a un backup (SUPER_ADMIN, compromiso de Neon, o un artifact de backup). |

**Impacto.** (a) Dato: nombre/email/teléfono de leads (ChatbotLead), transcripción completa de cada conversación (ChatMessage.content @db.Text), y — esto es lo nuevo — el número de WhatsApp en claro de cada contacto del motor (ContactIdentity.externalId/waId) junto con el cuerpo íntegro de cada mensaje (MotorMessage.body @db.Text). (b) A quién: a nadie hoy por vía de aplicación; el impacto es de blast-radius y legal — cualquier compromiso de la DB, un dump, o un pedido ARCO/inspección bajo Ley 25.326 alcanza el histórico entero desde el día 1. (c) Precondiciones para daño directo: acceso a la DB o a un backup. No es explotable desde la app; se califica ALTO por el régimen legal aplicable (agencia argentina, PII de terceros, develOP como encargado de tratamiento) y porque el conjunto sólo crece. CAMBIO_DE_ESTADO respecto de OBS-06 (que declaraba `cleanupOldEvents` con 0 callers): hoy SÍ está cableado. Y las tablas motor_* no fueron auditadas por ninguna corrida previa (la maestra las declaró fuera de main).

**Mecanismo.** Existe exactamente un mecanismo de purga en el árbol: `cleanupOldEvents(30)` sobre la tabla de telemetría `chatbot_event`, invocado por `src/app/api/cron/cleanup-old-events/route.ts` y agendado en `netlify.toml`. Un barrido de todo `src/` por `deleteMany`/`delete` sobre los modelos que guardan PII (`chatMessage`, `conversation`, `chatbotLead`, `osLead`, `motorMessage`, `contactIdentity`) devuelve sólo borrados operativos puntuales (descarte de conversación vacía por cuota, cleanup de evals, borrado manual de un OsLead por admin) — ninguno es una política de retención por antigüedad. Es decir: la telemetría (el dato menos sensible) tiene TTL y el contenido (el dato más sensible) no. Sumado a que el módulo motor persiste el identificador telefónico sin hashear ni cifrar (a diferencia de `Conversation.ipHash`, que sí es pseudonimizado), el conjunto de datos personales retenido crece de forma monótona y sin fecha de caducidad.

**Evidencia.**

- `src/app/api/cron/cleanup-old-events/route.ts:13`
  > const RETENTION_DAYS = 30
- `src/modules/chatbot/server/logging/persistentLogger.ts:84-95`
  > export async function cleanupOldEvents(maxAgeDays: number = 30) ... c.chatbotEvent.deleteMany({ where: { createdAt: { lt: threshold } } })
- `netlify.toml:31-32`
  > [functions."cleanup-old-events-cron"]\n  schedule = "0 6 * * *"  (y netlify/functions/cleanup-old-events-cron.ts existe — a diferencia de las otras 2 functions agendadas)
- `prisma/schema.prisma:2060-2078`
  > model ContactIdentity { ... externalId String; waId String? ... }  — el número de WhatsApp, sin hash ni cifrado
- `prisma/schema.prisma:2115-2140`
  > model MotorMessage { ... body String @db.Text ... }  — cuerpo íntegro del mensaje, en claro
- `prisma/schema.prisma:1417-1435`
  > model ChatMessage { ... content ... @db.Text }  — transcripción completa, sin campo de expiración
- `grep -rnE "\.(chatMessage|conversation|chatbotLead|osLead|motorMessage|contactIdentity)\.(deleteMany|delete)\(" src/`
  > 6 resultados: lead.actions.ts:237 (borrado manual admin), get-client-monthly-report-data.invariant.ts:86 (test), evals/cleanup.ts:91-92 (evals), handleChatRequest.ts:530 y quota/checker.ts:197 (descarte de conversación vacía). Cero purgas por antigüedad.

**Fix.** Un único cron de retención, hermano del que ya existe. Crear `src/app/api/cron/data-retention/route.ts` con la misma forma de auth que `cleanup-old-events` (fail-closed si falta CRON_SECRET) más `netlify/functions/data-retention-cron.ts` y su entrada en `netlify.toml`. La lógica va en un módulo propio (`src/lib/retention/purge.ts`) con TTLs como constantes nombradas, no literales dispersos, y borrado en lotes acotados (`take`/loop) para no reventar el timeout de la function. Alcance mínimo: (1) `ChatMessage` + `Conversation` sin lead asociado; (2) `MotorMessage` y `MotorConversation`; (3) anonimización — no borrado — de `ChatbotLead` y `ContactIdentity` pasado el TTL comercial (sobrescribir name/email/phone/externalId/waId con placeholder, conservando ids y agregados para que no se rompan los reportes). El TTL concreto (12 o 24 meses) es decisión de Franco + abogado, no del código; el código debe leerlo de una constante única.

**Criterio de aceptación.** Con `RETENTION_DAYS` de prueba puesto en 0 y una fila sembrada de cada tabla, un GET autenticado a `/api/cron/data-retention` devuelve `{ok:true}` y un SELECT posterior muestra: 0 filas de ChatMessage/MotorMessage anteriores al umbral, y las filas de ChatbotLead/ContactIdentity anteriores al umbral con name/email/phone/externalId/waId ya en el placeholder (no null, no la fila borrada). Además: un invariante nuevo (mismo patrón que `cleanup-old-events-auth.invariant.ts`) que verifique que la ruta devuelve 401 antes de tocar Prisma cuando falta el secret.

**Necesita decisión de Franco.** Sí: el TTL exacto por tipo de dato (transcripción vs lead vs mensaje de WhatsApp) y si el vencimiento es borrado o anonimización. Depende del contrato con los clientes (develOP es encargado, el responsable es el cliente) y de la asesoría legal — es la misma decisión #6 que ya figura pendiente en el cierre de la auditoría maestra.

**Adjudicación del auditor.** Verificado por el padre: el grep de deleteMany/delete sobre los modelos con PII devuelve solo un borrado puntual de admin, un invariante de test, el cleanup de evals y dos borrados operativos del flujo de chat. Ninguna politica de retencion. La unica purga agendada es chatbot_events a 30 dias.

### [S7-02] /api/chatbot/[slug]/health es público y sin guard alguno: devuelve el inventario de variables de entorno de la plataforma, el mensaje crudo del error de conexión a la base, y un oráculo de existencia + nombre de bot para cualquier slug de cualquier tenant

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ninguna. Sin autenticación, sin header Origin, desde internet abierto. |

**Impacto.** (a) Dato: el censo de 8 env vars con su nombre, si están presentes o no, su descripción y el 'hint' de dónde obtenerlas (incluye DATABASE_URL, AUTH_SECRET, GOOGLE_APPLICATION_CREDENTIALS, CHATBOT_GCP_PROJECT_ID, CHATBOT_IP_HASH_SALT); el `.message` crudo de la excepción de Prisma cuando la DB no responde — que en Prisma 6 incluye host:puerto del servidor, o el usuario de la base si falla la auth; el `.message` crudo del constructor del proveedor Vertex; y el nombre comercial del bot (`botName`) de CUALQUIER slug, junto con si existe y si está activo. (b) A quién: a cualquiera en internet. (c) Precondiciones: ninguna — sin sesión, sin Origin, sin rate-limit en la ruta. NO expone valores de secretos (sólo booleanos de presencia), y por eso no es ALTO. El ledger ya registra que este endpoint es público y sin origin-check (SEC-INV-health, lente S4); lo que no está documentado en ninguna corrida previa es QUÉ divulga.

**Mecanismo.** El route handler no ejecuta ningún guard: recibe el slug y llama directo a `checkChatbotHealth(slug)`. Esa función arma cuatro bloques y los serializa enteros en la respuesta. El bloque `env` es el retorno literal de `checkChatbotEnv()`, que mapea una tabla estática de variables a `{name, present, required, description, hint}`. Los bloques `database` y `llmProvider` capturan su excepción y colocan `error.message` sin transformar en el JSON. El bloque `bot` resuelve el slug con una consulta explícitamente global (`unsafeGlobalQuery`, correcto para un health de plataforma) y distingue tres respuestas textualmente diferentes según el bot no exista, exista pausado, o exista activo — con el `botName` incluido en los dos últimos casos. Como los slugs son cortos y semánticos, esa distinción convierte al endpoint en un enumerador de la cartera de clientes de la agencia.

**Evidencia.**

- `src/app/api/chatbot/[slug]/health/route.ts:6-19`
  > export async function GET(_request, { params }) { const { slug } = await params; const health = await checkChatbotHealth(slug); return Response.json(health, ...) }  — cero llamadas a auth(), validateOrigin() o checkRateLimit()
- `src/modules/chatbot/server/health/checkHealth.ts:93`
  > env: { ok: envResult.allCriticalPresent, details: envResult },  — `details` es el objeto completo de checkChatbotEnv()
- `src/modules/chatbot/server/config/envValidator.ts:26-75`
  > const ENV_VARS = [ { name: 'DATABASE_URL', ... hint: 'Get it from Neon console → Connection details' }, { name: 'AUTH_SECRET', required: true, ... }, { name: 'CHATBOT_IP_HASH_SALT', ... hint: 'Generate with: openssl rand -hex 32' }, ... ]
- `src/modules/chatbot/server/health/checkHealth.ts:35`
  > dbCheck = { ok: false, error: error instanceof Error ? error.message : 'unknown' }
- `node_modules/@prisma/client/runtime/client.js (grep 'reach database server')`
  > case"DatabaseNotReachable":{let t=e.cause.host&&e.cause.port?`${e.cause.host}:${e.cause.port}`:e.cause.host;return`Can't reach database server${t?` at ${t}`:""}`}  — y `AuthenticationFailed` devuelve el usuario de la base
- `src/modules/chatbot/server/health/checkHealth.ts:74-78`
  > botCheck = { ok:false, error: `Bot with slug "${slug}" not found` } ... else if (!bot.isActive) botCheck = { ok:false, slug: bot.slug, botName: bot.botName, error: 'Bot is inactive' } ... else botCheck = { ok:true, slug, botName, isActive }

**Fix.** Partir el endpoint en dos. (1) Público: reducir la respuesta a `{ ok: boolean, timestamp }` y el status 200/503 — nada más; sin `checks`, sin `error`, sin `botName`, y sin distinguir 'no existe' de 'inactivo' (mismo cuerpo para ambos). (2) Detallado: mover el objeto `checks` completo a una ruta bajo el guard de SUPER_ADMIN (p. ej. `/api/admin/chatbot/health`), que ya es donde vive la página de salud del admin. En `checkHealth.ts`, reemplazar los tres `error.message` por un código estable (`'db_unreachable'`, `'llm_unavailable'`, `'bot_unavailable'`) y mandar el mensaje real a `logPersistFailure`/Sentry, nunca a la respuesta. Agregarle a la ruta pública el mismo `checkRateLimit` por IP que ya usan los otros endpoints del chatbot.

**Criterio de aceptación.** `curl -s https://<host>/api/chatbot/<slug-inexistente>/health` y `curl -s https://<host>/api/chatbot/<slug-real>/health` devuelven cuerpos byte-idénticos salvo el timestamp, y `grep -E 'DATABASE_URL|AUTH_SECRET|botName|neon\.tech'` sobre ambos da 0 ocurrencias. La ruta admin, con sesión SUPER_ADMIN, sigue devolviendo el detalle completo.

### [S7-03] hashIp cae a un salt literal escrito en el código si falta CHATBOT_IP_HASH_SALT — y el repositorio es PÚBLICO en GitHub. La variable está declarada opcional en los tres manifiestos de entorno y el health público delata si está ausente

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Que la env var CHATBOT_IP_HASH_SALT no esté configurada en el entorno de producción. Y, para revertir hashes concretos, tener los valores de ipHash (usuario CLIENT de la org vía el payload de /dashboard/chatbot/conversations, o acceso a la DB/backup). |

**Impacto.** (a) Dato: la propiedad de no-reversibilidad que el propio módulo declara ('GDPR-friendly: stores a non-reversible identifier instead of the raw IP') se cae si la variable no está seteada — con el salt conocido, un `ipHash` de 64 bits sobre un espacio de direcciones acotado es recuperable, y `Conversation.ipHash` vuelve a ser la IP del visitante, correlacionada con su transcripción y su lead. (b) A quién: a quien tenga los valores de ipHash — hoy eso incluye al usuario CLIENT de la org, porque las filas completas de Conversation viajan al browser (ver S7-09), además de cualquiera con acceso a la base o a un backup. (c) Precondiciones: que CHATBOT_IP_HASH_SALT esté vacía en Netlify — no verificable desde el repo. No es ALTO porque el atacante necesita primero los hashes, y las IPs afectadas son las de los visitantes del propio cliente. Sí es un fail-open: el código elige seguir andando con un secreto público en vez de tirar.

**Mecanismo.** `hashIp` lee la variable; si falta, imprime un warning por consola y continúa usando una constante literal declarada en la línea siguiente del mismo archivo. El resultado es `sha256(ip + '::' + saltConocido)` truncado a 16 hex. La constante está en el árbol público (`gh repo view` sobre `frc11/PorfolioDevelOP` devuelve visibility PUBLIC), así que el 'secreto' que sostiene la pseudonimización es de dominio público. El fallo se agrava por tres desalineaciones de manifiesto: `envValidator.ts` declara la variable `required: false`; `check-env.js` la pone en OPTIONAL_VARS, de modo que `npm run check-env` no falla si está vacía; y el propio `check-env.js` imprime que 'el bot va a arrancar con error', cosa que no ocurre — arranca en silencio con el salt por defecto. Además, `/api/chatbot/[slug]/health` (ver S7-02) publica `present: false` para esa variable, con lo cual el estado del fail-open es consultable desde afuera.

**Evidencia.**

- `src/modules/chatbot/server/safety/ipHash.ts:12-29`
  > const salt = process.env.CHATBOT_IP_HASH_SALT; if (!salt) { if (NODE_ENV==='production') console.warn(...) } const effectiveSalt = salt ?? 'chatbot-dev-salt-do-not-use-in-prod'; return createHash('sha256').update(`${ip}::${effectiveSalt}`)...
- `src/modules/chatbot/server/safety/ipHash.ts:6-7`
  > * GDPR-friendly: stores a non-reversible identifier instead of the raw IP.  — la afirmación que el fallback invalida
- `gh repo view --json visibility,nameWithOwner`
  > {"nameWithOwner":"frc11/PorfolioDevelOP","visibility":"PUBLIC"}
- `src/modules/chatbot/server/config/envValidator.ts:59-64`
  > { name: 'CHATBOT_IP_HASH_SALT', required: false, description: 'Secret salt for IP hashing (GDPR-safe rate limiting)', hint: 'Generate with: openssl rand -hex 32' }
- `scripts/check-env.js:38`
  > 'CHATBOT_IP_HASH_SALT',  — dentro de OPTIONAL_VARS, no de CRITICAL_VARS
- `scripts/check-env.js:139-140`
  > if (!process.env.CHATBOT_IP_HASH_SALT) { console.log('  ! NODE_ENV=production y CHATBOT_IP_HASH_SALT vacía — el bot va a arrancar con error.') }  — el bot NO arranca con error, usa el default

**Fix.** Fail-closed. En `ipHash.ts`: si `NODE_ENV === 'production'` y la variable está vacía, `throw new Error('CHATBOT_IP_HASH_SALT requerida en producción')` en vez de sustituir por la constante; conservar el fallback sólo para dev/test y renombrarlo para que sea evidente. Alinear los tres manifiestos: mover `CHATBOT_IP_HASH_SALT` a CRITICAL_VARS en `scripts/check-env.js`, poner `required: true` en `envValidator.ts:61`, y borrar el mensaje engañoso de `check-env.js:139-140`. Si la variable estuvo ausente en producción, rotarla no alcanza: los ipHash ya escritos siguen siendo reversibles, así que hay que decidir si se re-hashean o se anulan (un `UPDATE conversation SET ipHash = NULL` es aceptable — el campo es opcional y sólo alimenta detección de abuso).

**Criterio de aceptación.** Con `CHATBOT_IP_HASH_SALT` sin setear y `NODE_ENV=production`, importar/ejecutar `hashIp('1.2.3.4')` tira; con la variable seteada devuelve el hash. `npm run check-env` sale con código 1 si la variable falta. `grep -rn "chatbot-dev-salt" src/` no aparece en ninguna ruta alcanzable con NODE_ENV=production.

**Necesita decisión de Franco.** Sí, dos: (1) confirmar en el panel de Netlify si CHATBOT_IP_HASH_SALT está seteada hoy — de eso depende si esto es una debilidad latente o un dato ya comprometido; (2) si no lo estaba, decidir qué se hace con los ipHash históricos (re-hash vs anulación).

**Adjudicación del auditor.** Verificado por el padre: ipHash.ts cae al literal chatbot-dev-salt-do-not-use-in-prod y en produccion solo loguea un warning. Con el repo PUBLICO, ese salt es de dominio publico.

### [S7-04] El gate del plan sobre la clasificación de leads es sólo de presentación: el score crudo, la clasificación, las señales de scoring y la explicación viajan completos al browser en el payload RSC — y /api/dashboard/leads/recent los sirve sin ningún gate

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Cuenta autenticada de la organización (rol CLIENT u ORG_MEMBER). Ninguna escalación de privilegio. |

**Impacto.** (a) Dato: `score`, `classification`, `scoreSignals` (el detalle interno de qué subió y bajó el puntaje), `effectiveScore`, `effectiveClassification`, `decayTierLabel` y `scoreExplanation` de cada lead — más los campos operativos que el propio repo declara como no-exportables al dueño (`botConfigId`, `notificationSent`, `notificationSentAt`, `convertedToOsLeadId`). (b) A quién: al usuario autenticado de la org, incluidos los de plan STARTER a los que la feature se les vende como no incluida. No hay fuga cross-tenant: el where filtra por org correctamente. (c) Precondiciones: sesión válida de CLIENT/ORG_MEMBER, y abrir devtools o pegarle al endpoint. Es MEDIO y no ALTO porque el dato es de la propia org; lo que se rompe es el paywall y la política explícita de qué campos ve el dueño, no el aislamiento.

**Mecanismo.** En `/dashboard/chatbot/leads` la página server obtiene las filas con `listLeadsForDashboard`, que las trae completas, y las enriquece haciendo spread de la fila entera (`...lead`) junto con el scoring calculado. Ese array se pasa como prop a `ClientLeadsTable`, que es un componente `'use client'` — React serializa el objeto íntegro en el payload de flight, no sólo los campos que el componente lee. El flag `showScoring` derivado de `planAllows(plan,'leadScoring')` se usa exclusivamente en el render (`showScoring ? lead.effectiveScore : null`), y el comentario del propio código lo dice sin ambigüedad: 'Gate de PRESENTACIÓN... este flag solo decide si la UI muestra los chips o el teaser'. El mismo objeto sin proyectar se sirve además por `/api/dashboard/leads/recent`, que hace `findMany` sin `select` y devuelve `{ ...lead, effectiveScore, ..., scoreExplanation }` como JSON, esta vez sin consultar el plan siquiera. El contraste que lo vuelve inequívocamente un defecto y no una decisión: la ruta de export CSV, sobre la misma consulta, sí proyecta a mano una lista blanca de columnas y sí aplica el gate del plan, con un comentario que enumera exactamente los campos que no deben salir.

**Evidencia.**

- `src/app/(protected)/dashboard/chatbot/leads/page.tsx:65`
  > const showScoring = planAllows(plan, 'leadScoring')  // 'Gate de PRESENTACIÓN ... este flag solo decide si la UI muestra los chips o el teaser'
- `src/app/(protected)/dashboard/chatbot/leads/page.tsx:95-100`
  > return { ...lead, effectiveScore: effective.effectiveScore, effectiveClassification: ..., decayTierLabel: ..., scoreExplanation: getScoreExplanation(signals) }
- `src/app/(protected)/dashboard/chatbot/leads/page.tsx:116`
  > <ClientLeadsTable leads={leads} ... showScoring={showScoring} />
- `src/modules/chatbot/components/dashboard/ClientLeadsTable.tsx:1`
  > 'use client'  — todo lo que entra por props se serializa al browser
- `src/app/api/dashboard/leads/recent/route.ts:22-29`
  > const rawLeads = await prisma.chatbotLead.findMany({ where: {...}, orderBy: {...}, take: 50 })  — sin select
- `src/app/api/dashboard/leads/recent/route.ts:49-55`
  > return { ...lead, effectiveScore, effectiveClassification, decayTierLabel, scoreExplanation }  → NextResponse.json({ leads })  — sin getPlanForOrg ni planAllows en toda la ruta
- `src/app/api/dashboard/chatbot/leads/export/route.ts:30-32`
  > * NO se exporta:\n *  - score crudo, scoreSignals, internalNotes, botConfigId, notificationSent*.\n *  - Solo lo legible al dueño.  — la política que las otras dos superficies incumplen
- `src/lib/plan/plan-allows.ts:25-34`
  > // el scoring se sigue computando y guardando para todos los planes; este gate solo decide si se MUESTRA.

**Fix.** Introducir un proyector único y usarlo en las tres superficies. Crear `src/modules/chatbot/server/leads/toClientLeadDto.ts` que reciba la fila cruda más `{ showScoring }` y devuelva sólo los campos que el dueño puede ver, omitiendo `score`, `scoreSignals`, `botConfigId`, `notificationSent`, `notificationSentAt`, `convertedToOsLeadId`, y omitiendo además `classification`/`effectiveClassification`/`decayTierLabel`/`scoreExplanation` cuando `showScoring` es false. Reemplazar el spread de `page.tsx:76` y `:95` y el de `recent/route.ts:36` y `:49` por ese DTO, y agregar el gate de plan que hoy falta en `recent/route.ts` (mismo `getPlanForOrg` + `planAllows` que usa el export). `ClientLeadsTable` pasa a tipar su prop contra el tipo del DTO, no contra la fila de Prisma.

**Criterio de aceptación.** Con una sesión de una org en plan STARTER: (1) `curl` autenticado a `/api/dashboard/leads/recent` devuelve un JSON donde `grep -E '"score"|"scoreSignals"|"classification"|"scoreExplanation"|"botConfigId"'` da 0 ocurrencias; (2) el HTML/flight de `/dashboard/chatbot/leads` da 0 ocurrencias de `scoreSignals` y de `"score":`. Con una org en plan PRO, la clasificación sí aparece y el score crudo y scoreSignals siguen sin aparecer en ninguna de las dos.

### [S7-05] La protección anti-framing sólo cubre /admin y /dashboard: el panel del setter y todas las páginas de autenticación quedan embebibles, porque el frame-ancestors 'none' global está en modo Report-Only y no bloquea nada

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Sesión válida (SETTER, o cualquier usuario en un flujo de credenciales) + que la víctima abra una página del atacante. Sin autenticación previa del atacante. |

**Impacto.** (a) Qué se logra: un sitio de terceros puede embeber en un iframe `/setter/*` (el panel operativo completo: cartera de leads con PII, registro de resultados, envío de demo, agenda) y `/login`, `/reset-password`, `/cambiar-password`, `/accept-invite`, `/forgot-password`, y superponer una interfaz que induzca clics sobre controles reales con la sesión del usuario. (b) A quién afecta: al setter y a cualquier usuario en flujo de credenciales que sea llevado al sitio del atacante. (c) Precondiciones: sesión activa del usuario y que el usuario visite una página controlada por el atacante — es una precondición real, por eso MEDIO y no ALTO. Adyacente pero distinto de lo ya documentado: SEC-MISC-01 en la maestra registra el bloque de X-Frame-Options como el estado 'PARCIAL' resuelto, sin notar que su patrón de ruta no cubre /setter ni las pantallas de auth; SEC-08 documenta que la CSP sigue en Report-Only, pero no la consecuencia de que eso deja al `frame-ancestors 'none'` sin efecto sobre esas rutas.

**Mecanismo.** Los encabezados salen únicamente de `next.config.ts` — `netlify.toml` no define ningún bloque `[[headers]]`, no existe `public/_headers` y no existe `middleware.ts`. El bloque global aplica a `/:path*` e incluye `frame-ancestors 'none'`, pero dentro del header `Content-Security-Policy-Report-Only`: en modo report-only el navegador registra la violación y renderiza igual, así que esa directiva no protege nada. El único encabezado que sí bloquea, `X-Frame-Options: DENY`, está en un bloque cuyo `source` es `/(admin|dashboard)(.*)`, que no matchea `/setter/...` ni `/login` ni las rutas de recuperación de contraseña — todas existentes en el árbol. El resultado es una cobertura por enumeración de rutas que quedó desfasada cuando se agregó el panel del setter.

**Evidencia.**

- `next.config.ts:47-56`
  > key: 'Content-Security-Policy-Report-Only', value: [ ... "frame-ancestors 'none'", ... ]  — report-only: la directiva no bloquea
- `next.config.ts:66-71`
  > { source: '/(admin|dashboard)(.*)', headers: [ { key: 'X-Frame-Options', value: 'DENY' } ] }  — /setter y las páginas de auth no matchean
- `src/app/(protected)/setter/`
  > layout.tsx, page.tsx, leads/, nuevo/, _actions/, _components/ — el panel del setter existe y cuelga de /setter/*
- `src/app/`
  > login/, forgot-password/, reset-password/, cambiar-password/, accept-invite/, bienvenida/ — todas fuera del patrón /(admin|dashboard)
- `netlify.toml (archivo completo, 33 líneas) + ls public/_headers + ls src/middleware.ts`
  > netlify.toml no tiene ningún [[headers]]; public/_headers no existe; src/middleware.ts no existe → next.config.ts es la única fuente de encabezados

**Fix.** Dos cambios en `next.config.ts`, ambos de bajo riesgo. (1) Ampliar el `source` del bloque anti-framing para que cubra toda la superficie autenticada y de credenciales, o mejor: invertirlo — poner `X-Frame-Options: DENY` en el bloque global `/:path*` y agregar un bloque posterior para `/embed/:slug*` que lo sobrescriba (el widget es embebible por diseño y ya tiene su propia CSP enforced con `frame-ancestors *`). (2) Cuando se pase la CSP global a enforcement, `frame-ancestors 'none'` NO puede quedar en el header global: dos CSP se intersecan y la más restrictiva gana, así que rompería el widget. La forma correcta es sacar `frame-ancestors` del bloque global y declararlo por ruta: `'none'` para todo lo autenticado y `*` (o la whitelist de R18) para `/embed/*`.

**Criterio de aceptación.** `curl -sI https://<host>/setter` y `curl -sI https://<host>/login` devuelven `X-Frame-Options: DENY`; `curl -sI https://<host>/embed/<slug>` NO lo devuelve y sigue trayendo `Content-Security-Policy: frame-ancestors *`. Verificación funcional: el widget embebido en un sitio de cliente sigue cargando.

**Adjudicación del auditor.** Verificado por el padre leyendo next.config.ts: el X-Frame-Options: DENY de :67-71 aplica a /(admin|dashboard)(.*) y /setter no esta; el CSP de :48 es Report-Only, asi que su frame-ancestors 'none' no impone nada.

### [S7-06] El formulario de contacto del footer manda nombre, WhatsApp, rubro y mensaje del visitante directamente del browser al webhook de n8n, con la URL del webhook horneada en el bundle público — sin pasar por el servidor, sin validación, sin rate-limit y sin registro

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ninguna para leer la URL del bundle. Para abusarla: sólo poder hacer un POST HTTP. Requiere que NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL esté configurada en el entorno de producción. |

**Impacto.** (a) Dato y acción: la PII del visitante (nombre, teléfono de WhatsApp, rubro, mensaje libre) sale del navegador hacia un endpoint de tercero sin tocar nunca la infraestructura de develOP; y la URL del webhook, que es una capacidad portadora (quien la conoce puede POSTear), queda legible en el JS servido a todo el mundo. (b) A quién: la URL, a cualquier visitante del sitio público; la PII, al operador de n8n sin registro intermedio del lado develOP. (c) Precondiciones: ninguna. Se califica MEDIO y no ALTO porque un webhook de n8n no es una credencial de acceso a datos: el abuso es inyección de basura en el flujo de contacto y quema de ejecuciones, no lectura. Condicionado a que la variable esté efectivamente seteada en producción — si está vacía el formulario cae a WhatsApp y el problema no existe hoy.

**Mecanismo.** El handler de submit del footer lee la variable con prefijo NEXT_PUBLIC_ (que Next inlinea en el bundle del cliente en tiempo de build) y hace `fetch(webhookUrl, { method:'POST', body: JSON.stringify(form) })` desde el navegador. Con eso, tres controles desaparecen del camino: no hay parseo con Zod del payload (existe el patrón en el resto del repo, acá no aplica), no hay rate-limit (el limitador del repo vive del lado servidor), y no queda ninguna fila en la base de develOP — el lead sólo existe si n8n lo recibió. Además, el propio repo ya tiene la variante correcta: `src/lib/n8n.ts` usa `N8N_CONTACT_WEBHOOK_URL` sin prefijo público, es decir server-side, y tira si falta. Conviven las dos rutas y la pública es la que usa la home. El `.env.example` incluso advierte del riesgo en la línea de arriba de la variable, lo que sugiere que el problema es conocido y no cerrado.

**Evidencia.**

- `src/components/sections/home/Footer.tsx:81-88`
  > const webhookUrl = process.env.NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL; if (webhookUrl) { await fetch(webhookUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) }) }
- `src/components/sections/home/Footer.tsx:72-77`
  > useState<FormState>({ nombre:'', whatsapp:'', rubro:'', mensaje:'' })  — el objeto que se serializa entero al tercero
- `.env.example:203-204`
  > # NOTA: NEXT_PUBLIC_ se expone al browser. No pongas secretos acá.\n# NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL=
- `src/lib/n8n.ts:19-22`
  > const webhookUrl = process.env.N8N_CONTACT_WEBHOOK_URL ... throw new Error('N8N_CONTACT_WEBHOOK_URL no está configurada en el servidor.')  — la variante server-side ya existe
- `grep -rhoE "NEXT_PUBLIC_[A-Z0-9_]+" src/ public/ | sort | uniq -c`
  > 23 NEXT_PUBLIC_APP_URL · 19 NEXT_PUBLIC_WHATSAPP_NUMBER · 4 NEXT_PUBLIC_SENTRY_DSN · 1 NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL · 1 NEXT_PUBLIC_BUILD_TIME — el censo completo; las otras cuatro no llevan material sensible

**Fix.** Mover el envío al servidor y borrar la variable pública. Crear una server action (o reusar la del formulario de `/contact`, que ya es server-side) que valide el payload con Zod, aplique `checkRateLimit` por IP con un preset propio, persista o audite el intento, y recién entonces haga el POST a `N8N_CONTACT_WEBHOOK_URL` (sin prefijo público, con `AbortSignal.timeout`). En `Footer.tsx` reemplazar el `fetch` directo por la invocación de esa action, conservando el fallback a WhatsApp para el caso de error. Eliminar `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL` de `.env.example:204`, de `scripts/check-env.js` y del entorno de Netlify. Rotar la URL del webhook en n8n, porque la actual estuvo publicada en el bundle.

**Criterio de aceptación.** `grep -r "NEXT_PUBLIC_N8N" src/ .env.example scripts/` da 0 resultados, y un `grep -r 'n8n' .next/static/chunks/` sobre un build de producción tampoco encuentra la URL. Enviando el formulario del footer, el request sale hacia el propio origen (server action), no hacia el host de n8n — observable en la pestaña de red.

**Necesita decisión de Franco.** Sí: confirmar en Netlify si la variable está seteada hoy (define si esto es latente o activo) y coordinar con Franco la rotación de la URL del webhook en n8n.

### [S7-07] El scrub de PII hacia Sentry no cubre transacciones (beforeSendTransaction ausente con tracesSampleRate 0.1) y no redacta parámetros de query por nombre — y la app transporta tokens de reset de contraseña, de invitación y de baja en el query string

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Que se genere un evento (error o transacción muestreada) durante una navegación a una URL portadora de token. Para aprovecharlo: acceso al proyecto de Sentry. |

**Impacto.** (a) Dato: la URL completa con su query string, incluyendo el token de un solo uso de `/reset-password?token=…` y `/accept-invite?token=…`, sale hacia Sentry sin redactar por dos vías — el 10% de las transacciones de rendimiento, que nunca pasan por ningún hook de scrub, y los eventos de error, donde el scrub sí corre pero sólo aplica cuatro expresiones de valor (email, JWT, tarjeta, teléfono) que no matchean un token opaco. (b) A quién: al proyecto de Sentry (nube, fuera del país) y a quien tenga acceso a él. (c) Precondiciones: que ocurra un error o se muestree una transacción sobre una URL con token, dentro de la ventana de validez del token. Es MEDIO: el token es de un solo uso y de vida corta, y el destino es un servicio del propio equipo, pero el material es equivalente a una credencial y el destino es un tercero — lo que además pesa en la decisión pendiente de self-host vs cloud por Ley 25.326.

**Mecanismo.** Los tres `Sentry.init` del repo registran `beforeSend` con `scrubPii` y ninguno registra `beforeSendTransaction`. El propio archivo de scrub lo dice en un comentario: el hook recibe `ErrorEvent`, y para transacciones haría falta el otro hook. Como `tracesSampleRate` está en 0.1 en server, edge y client de producción, uno de cada diez requests genera un evento de transacción que lleva los datos de request (URL y query string) sin pasar por ninguna redacción. Sobre el camino de errores, que sí se scrubea, el diseño es asimétrico: para objetos estructurados hay una denylist por NOMBRE de clave que incluye 'token', pero para `request.url` y `request.query_string` sólo se aplican las cuatro regex de forma-de-valor. Un `?token=cmXXXXXXXX` no tiene forma de email ni de JWT ni de teléfono, así que atraviesa intacto. Y la app pone tokens en el query string en al menos cuatro lugares del flujo de identidad y de email.

**Evidencia.**

- `src/lib/sentry/scrub-pii.ts:109-110`
  > // Tipado: el hook beforeSend del SDK recibe ErrorEvent. Si en el futuro\n// se quiere scrubear transactions, usar beforeSendTransaction (otro hook).
- `sentry.server.config.ts:8-15`
  > Sentry.init({ dsn, tracesSampleRate: 0.1, ..., beforeSend(event, hint) { return scrubPii(event, hint) } })  — no hay beforeSendTransaction (idéntico en sentry.edge.config.ts:5-13 y src/instrumentation-client.ts:4-19)
- `src/lib/sentry/scrub-pii.ts:135-136`
  > if (typeof req.url === 'string') req.url = scrubString(req.url)\n if (typeof req.query_string === 'string') req.query_string = scrubString(req.query_string)  — scrubString sólo aplica PATTERNS
- `src/lib/sentry/scrub-pii.ts:48-62`
  > const PATTERNS = [ {email}, {jwt: /\\beyJ.../}, {cc}, {phone} ]  — ninguna matchea un cuid/hex opaco; la denylist por nombre de clave (línea 23, '^token$') sólo se aplica a objetos, no a la query string
- `src/app/forgot-password/actions.ts:88`
  > const resetUrl = `${baseUrl}/reset-password?token=${token}`
- `src/lib/actions/invitations.ts:110`
  > const inviteUrl = `${baseUrl}/accept-invite?token=${token}`
- `src/lib/email/unsubscribe-token.ts:123`
  > return `${base}/api/email/optout/${encodeURIComponent(contactId)}?token=${token}`

**Fix.** Tres cambios acotados en el módulo de scrub y sus tres call sites. (1) Agregar en `scrub-pii.ts` una función `scrubUrl(url)` que parsee la URL y reemplace por `[redacted]` el VALOR de todo parámetro cuyo nombre matchee `SENSITIVE_KEY_PATTERN` (que ya incluye `^token$`, `secret`, `access_token`), y usarla en las líneas 135-136 en lugar de `scrubString`. (2) Exportar un `scrubTransaction(event)` que aplique al menos ese mismo tratamiento a `event.request.url`, `event.request.query_string` y `event.transaction`, y registrarlo como `beforeSendTransaction` en los tres `Sentry.init`. (3) Extender el array `PATTERNS` no es la vía — el discriminador correcto es el nombre del parámetro, no la forma del valor. Complementariamente, considerar mover el token del reset de contraseña del query string al fragmento o a un POST, que lo saca del alcance de logs y referers por completo.

**Criterio de aceptación.** Un test unitario sobre `scrubPii` con un evento cuyo `request.url` sea `https://x/reset-password?token=abc123&foo=bar` devuelve `token=[redacted]` y `foo=bar` intacto. Un test equivalente sobre `scrubTransaction` con el mismo evento pasa. Y `grep -n "beforeSendTransaction" sentry.server.config.ts sentry.edge.config.ts src/instrumentation-client.ts` devuelve 3 resultados.

**Necesita decisión de Franco.** Sí, una separable: si Sentry sigue en la nube o se auto-hospeda. Este fix reduce el material que sale, pero la decisión de residencia por Ley 25.326 sigue abierta y es de Franco.

### [S7-08] El .message crudo de Prisma llega al cliente: los mensajes de nivel de conexión revelan host y puerto de Neon, el usuario de la base y nombres de columnas/constraints. El helper compartido toErrorMessage es el canal, no sólo las 49 copias inline

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | CONFIRMADO_SIN_TEST |
| **Precondiciones** | Sesión autenticada de cualquier rol (SETTER, CLIENT, ORG_MEMBER o SUPER_ADMIN) y un fallo de base o de validación de Prisma durante la acción. |

**Impacto.** (a) Dato: según qué falle, la respuesta de una server action puede contener 'Can't reach database server at <host>:<puerto>' (el endpoint de Neon), 'Authentication failed ... credentials for `<usuario>` are not valid' (el usuario de la base), 'Database `<nombre>` does not exist', 'Unique constraint failed on the fields: (`email`)' (nombres de columna), 'Foreign key constraint violated on the constraint: `<índice>`' (nombres de constraint), o — con un PrismaClientValidationError — el diagrama completo de argumentos que enumera todos los campos del modelo. (b) A quién: al usuario autenticado que dispara la acción, en un toast; alcanza a SETTER y a CLIENT, no sólo a admin. (c) Precondiciones: sesión válida de cualquier rol + que ocurra un error de base. Es MEDIO: no da acceso, da reconocimiento de infraestructura y de esquema que acorta el trabajo previo de un atacante. Se marca CONFIRMADO_SIN_TEST porque CLEAN-2.1-CATCH ya contó el fenómeno (63 devuelven el .message crudo) y sigue abierto sin candado; lo que aporto y no estaba es CUÁL de los mensajes filtra qué, y que el helper compartido también filtra — dato que cambia el fix propuesto.

**Mecanismo.** El patrón es doble. Por un lado están las copias inline `catch (error) { return fail(error instanceof Error ? error.message : '…') }` repartidas por los directorios `_actions`; llegan hasta el carril del setter, donde `marcarNovedadesVistasAction` envuelve una escritura de Prisma y devuelve el mensaje tal cual. Por otro — y esto es lo que la propuesta de remediación previa no contempla — el helper compartido `toErrorMessage` en `src/lib/action-utils.ts` hace exactamente lo mismo: si el error es un `Error`, devuelve su `.message` sin transformar, y se usa en 15 puntos de 7 archivos. La consecuencia práctica es que 'promover mapError a action-utils.ts' aterrizaría en el mismo archivo que ya es el canal de fuga. La severidad del contenido depende de la clase de error: los de conexión y autenticación de Prisma son los que llevan infraestructura, y pueden dispararse en CUALQUIER acción, no en casos exóticos — con Neon y su cold-start, un P1001/P2024 es un evento esperable, no hipotético.

**Evidencia.**

- `src/lib/action-utils.ts:19-31`
  > export function toErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string { if (error instanceof ZodError) {...} if (error instanceof Error) { return error.message } return fallback }
- `src/app/(protected)/setter/_actions/novedades.actions.ts:23-26`
  > } catch (error) { return fail(error instanceof Error ? error.message : 'No se pudieron marcar las novedades') }  — envuelve marcarNovedadesVistas(userId), que escribe en Prisma; alcanzable por rol SETTER
- `node_modules/@prisma/client/runtime/client.js (grep 'reach database server')`
  > case"DatabaseNotReachable":{let t=e.cause.host&&e.cause.port?`${e.cause.host}:${e.cause.port}`:e.cause.host;return`Can't reach database server${t?` at ${t}`:""}`}
- `node_modules/@prisma/client/runtime/client.js (grep 'Authentication failed against')`
  > case"AuthenticationFailed":return`Authentication failed against the database server, the provided database credentials for \\`${e.cause.user??"(not available)"}\\` are not valid`
- `node_modules/@prisma/client/runtime/client.js (grep 'Unique constraint failed')`
  > case"UniqueConstraintViolation":return`Unique constraint failed on the ${ro(e.cause.constraint)}` ... function ro(e){return e&&"fields"in e?`fields: (${e.fields.map(t=>`\\`${t}\\``).join(", ")})`:e&&"index"in e?`constraint: \\`${e.index}\\``:...}
- `node_modules/@prisma/client/runtime/client.js (grep 'Unknown argument')`
  > `Unknown argument \\`${e.red(t)}\\`.` ... `Did you mean \\`${e.green(i)}\\`?` ... "Available options are " — el error de validación enumera los campos del modelo
- `grep -rn "toErrorMessage(" src/ | grep -v "export function" | wc -l`
  > 15 (en 7 archivos)

**Fix.** Convertir `toErrorMessage` en la frontera de saneamiento en vez del canal de fuga. En `src/lib/action-utils.ts`: mantener el trato especial de `ZodError` (los mensajes de Zod son copy propio y son seguros), y para todo lo demás — en particular cuando el error sea una instancia de `Prisma.PrismaClientKnownRequestError`, `PrismaClientValidationError`, `PrismaClientInitializationError` o `PrismaClientUnknownRequestError` — loguear el error completo por `logger.error` y devolver ÚNICAMENTE el `fallback`. Para los errores de dominio propios que sí quieren llegar al usuario (por ejemplo `DossierTransitionError`), definir una clase base `UserFacingError` y dejar pasar sólo su `.message`. Después, reemplazar las copias inline por llamadas a ese helper — empezando por el carril del setter, que es el de menor volumen. Ese orden importa: si se migran primero las copias sin arreglar el helper, no se cierra nada.

**Criterio de aceptación.** Un test unitario que le pase a `toErrorMessage` un `PrismaClientKnownRequestError` con code P2002 y mensaje 'Unique constraint failed on the fields: (`email`)' obtiene el fallback genérico, no el mensaje original; y que le pase un `UserFacingError('Transición ilegal')` obtiene ese texto. Complementariamente, una regla `no-restricted-syntax` que prohíba `error instanceof Error ? error.message` dentro de `**/_actions/**` mide 0 violaciones tras la migración.

### [S7-09] Filas completas de Conversation viajan al browser del cliente en el payload RSC (ipHash, userAgent, referrerUrl, UTMs y el costo en USD que la conversación le cuesta a la agencia); el tipo de props declara 12 campos pero el cable lleva la fila entera

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | SIN VERIFICAR |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Cuenta autenticada de la organización (CLIENT u ORG_MEMBER). Ninguna escalación. |

**Impacto.** (a) Dato: además de los 12 campos que el componente declara y usa, viajan `ipHash`, `userAgent`, `referrerUrl`, `utmSource/Medium/Campaign`, `botConfigId` y `endedAt` — y, ya declarado en el tipo pero igual notable, `estimatedCostUsd`, `tokensIn` y `tokensOut`, que son la economía unitaria de develOP por conversación. (b) A quién: al usuario autenticado de la organización. (c) Precondiciones: sesión CLIENT/ORG_MEMBER y abrir devtools. Es BAJO y no MEDIO por una razón honesta: los identificadores de visitante son de los visitantes del propio cliente, que es el responsable del tratamiento — no es una fuga de datos ajenos. Lo que sí es real es que el margen de la agencia queda expuesto al cliente, y que el patrón (un tipo de props que sugiere una proyección que en el cable no existe) es el mismo defecto estructural que en S7-04 sí tiene consecuencia de negocio.

**Mecanismo.** `listConversationsByOrgSlug` trae las filas con `include` y sin `select`, y las devuelve haciendo spread completo (`...r`). La página server las pasa como prop a `ConversationsTable`, que es un componente `'use client'`. La interfaz `ConversationRow` enumera 12 campos, pero el tipado estructural de TypeScript no recorta nada en tiempo de ejecución: React serializa el objeto tal cual llegó de Prisma. Es un caso donde la revisión por lectura del tipo da una falsa sensación de proyección — el contrato de props describe lo que el componente LEE, no lo que el servidor MANDA. Nótese el contraste dentro del mismo repo: el `CrmIntegrationAdminCard` sí reduce `secretEncrypted` a un booleano antes de pasar la prop, y `getSettings` sí enmascara el token de Telegram — la disciplina existe, este call site se le escapó.

**Evidencia.**

- `src/modules/chatbot/server/admin/multiTenantQueries.ts:180-197`
  > scope.conversation.findMany({ where, orderBy, take: limit, include: { lead: {...}, _count: {...} } }) ... const items = rows.map((r) => ({ ...r, lead: ... }))  — sin select
- `src/app/(protected)/dashboard/chatbot/conversations/page.tsx:12-18`
  > const { items, total } = await listConversationsByOrgSlug(session.organization.slug, 100) ... <ConversationsTable conversations={items} totalCount={total} ... />
- `src/modules/chatbot/components/dashboards/ConversationsTable.tsx:1`
  > 'use client'
- `src/modules/chatbot/components/dashboards/ConversationsTable.tsx:10-24`
  > interface ConversationRow { id; sessionId; currentPath; messageCount; tokensIn; tokensOut; estimatedCostUsd; leadCaptured; startedAt; lastMessageAt; lead; _count }  — 12 campos declarados
- `prisma/schema.prisma:1368-1400`
  > model Conversation { ... sessionId; ipHash String?; userAgent String? @db.Text; referrerUrl String?; utmSource/utmMedium/utmCampaign; ... tokensIn; tokensOut; estimatedCostUsd Decimal }  — lo que realmente viaja

**Fix.** Reemplazar el `include` sin `select` de `listConversationsByOrgSlug` por un `select` explícito con exactamente los campos que declara `ConversationRow`, y quitar el spread `...r` a favor de la construcción campo por campo. Si el admin necesita `ipHash`/`userAgent` para diagnóstico de abuso, que use su propia consulta bajo el guard de SUPER_ADMIN, no la compartida con el dashboard del cliente. Decidir además si `estimatedCostUsd`/`tokensIn`/`tokensOut` deben seguir llegando al cliente: si la respuesta es no, salen del select y del tipo. Vale aplicar el mismo criterio a `listLeadsByOrgSlug` (mismo archivo, línea 33) y a `queries.ts:6-28`, que comparten el patrón aunque hoy sólo alimenten superficies de admin.

**Criterio de aceptación.** Sobre el HTML/flight servido de `/dashboard/chatbot/conversations` con una sesión de cliente, `grep -E 'ipHash|userAgent|referrerUrl|utmSource'` devuelve 0 ocurrencias. La tabla sigue renderizando las mismas columnas.

**Necesita decisión de Franco.** Sí, una comercial y menor: si el cliente puede ver el costo en USD y el consumo de tokens de sus conversaciones, o si eso es dato interno de la agencia.

#### Ya documentado en auditorías previas — no se re-reporta (12)

- SEC-MISC-01 / SEC-08 — la CSP global sigue en Content-Security-Policy-Report-Only con 'unsafe-inline' y 'unsafe-eval', y el comentario 'tighten to enforcement after 1-2 weeks' sigue intacto (next.config.ts:42-51). Idéntico a lo declarado; el corolario de framing que sí es nuevo va en S7-05.
- SEC-15 — /embed/:slug* con Content-Security-Policy: frame-ancestors *; (next.config.ts:85-89). Sin cambio, y correcto por diseño del widget embebible; la whitelist R18 sigue pendiente.
- SEC-PII-01 — cerrado y sigue cerrado: notify-message.ts usa obfuscateEmail().
- SEC-LOGGING-01 — cerrado y sigue cerrado: captureLead.ts loguea el motivo, nunca el valor.
- SEC-LLM-02 / SEC-PII-02 / SEC-PII-03 / SEC-07 — cero disclaimers de Vertex AI o de envío a n8n en src/modules/chatbot/components/ y public/widget.js. Sin cambio (el dato nuevo de residencia de datos va en notas, no como hallazgo aparte).
- SEC-10 — el fallback literal 'develOP-dev-impersonation-secret' sigue vivo en src/lib/impersonation.ts:19; IMPERSONATION_SECRET ya está en CRITICAL_VARS de check-env.js pero el código sigue sin fallar duro. Lente S3.
- PERF-05 — replaysOnErrorSampleRate: 1.0 sigue en src/instrumentation-client.ts:10. Sin cambio.
- C-10 — DossierTransitionError sigue llegando crudo al cliente (setter/_actions/dossier.actions.ts:67). Cubierto por el fix de S7-08.
- LEG-01 / LEG-03 — sin piezas legales ni canal ARCO en la app; sin analytics de terceros. Sin cambio.
- CLEAN-1.1-APPURL, CLEAN-2.2-ERRSHAPE, CLEAN-H-ASUNKNOWN, CLEAN-B1-CONSOLE — sin cambio de estado detectable en esta pasada.
- SEC-INV-health — el hecho de que /api/chatbot/[slug]/health sea público y sin origin-check sigue igual; lo que desarrollo en S7-02 es el contenido divulgado, que ninguna corrida previa inventarió.
- OBS-04 — sigue sin correlationId; conversationId sigue viajando sólo como extra de Sentry (handleChatRequest.ts:1669-1672). Sin cambio.


---

## S8 — Cadena de suministro y superficie de deploy

> **Pasada de refutación adversarial:** sí, agente independiente.

### [S8-01] El repo es PUBLICO y la purga BFG nunca se ejecuto: una API key de Google sigue alcanzable desde origin/main

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Ninguna. Acceso publico de lectura al repositorio de GitHub. |

**Impacto.** (a) Dato expuesto: el valor de GOOGLE_GENERATIVE_AI_API_KEY (43 caracteres) en texto plano dentro de un blob de git. (b) A quien: a cualquiera en internet — `gh repo view` devuelve visibility PUBLIC, y el blob es alcanzable desde origin/main, la rama por defecto. (c) Precondiciones: NINGUNA. No hace falta cuenta, ni auth, ni un fork: un `git clone` del repo publico trae el objeto. Es el unico hallazgo de esta lente con cero precondiciones. No lo marco CRITICO porque el propio runbook del repo deja constancia escrita de que Franco confirmo que la key estaba DESHABILITADA antes del descubrimiento (2026-05-21); esa mitigacion es evidencia registrada, no especulacion, pero no es verificable desde el repo.

**Mecanismo.** En el sprint de env-vars (2026-05-21) se hizo solo el arreglo superficial: `git rm --cached enviroment.env` + parche de .gitignore. Eso saca el archivo del working tree y del index, pero NO del historial — el blob sigue referenciado por los commits donde existio. El runbook docs/audits/2026-05-bfg-leak-cleanup.md documenta el paso que falta (reescritura de historial con BFG + force-push) y se marca explicitamente como 'NO ejecutar autonomamente por Claude'. Verificado hoy: nunca se ejecuto. El blob f9d11ed0bd6952840a566ac902d2c14d655acf8a existe, contiene exactamente una asignacion con valor no vacio, y `git rev-list origin/main --objects` lo cuenta 1 vez, es decir es alcanzable desde la rama por defecto del remote publico. Ademas los dos commits que lo contienen figuran en 5 ramas remotas distintas, con lo cual borrarlo solo de main no alcanza. La auditoria de 2026-05 habia declarado este punto como pendiente explicito ('escaneo profundo de secrets en git history — NO se re-verifico el historico; B0 dice que fue purgado, sin re-verificar'): esa suposicion es falsa.

**Evidencia.**

- `comando: gh repo view --json visibility,nameWithOwner`
  > {"nameWithOwner":"frc11/PorfolioDevelOP","visibility":"PUBLIC"}
- `comando: git rev-list --all --objects | grep -iE 'enviroment|environment\.env'`
  > f9d11ed0bd6952840a566ac902d2c14d655acf8a logic-core-v3/enviroment.env
- `comando: git rev-list origin/main --objects | grep -c f9d11ed0bd6952840a566ac902d2c14d655acf8a`
  > 1   (el blob es alcanzable desde la rama por defecto del remote publico)
- `comando: git cat-file -p f9d11ed0... (valores redactados por mi)`
  > GOOGLE_GENERATIVE_AI_API_KEY=<valor de 43 caracteres, no vacio>  — 1 asignacion con valor
- `comando: git log --all --oneline --find-object=f9d11ed0...`
  > c351b79 feat: Refactor VaultManager... / 3953558 paginas extras creadas...
- `comando: git branch -r --contains 3953558`
  > origin/HEAD -> origin/main, origin/b0-isolation-motor-chatbot, origin/b1-s2-bsp-outbound, origin/chore/security-quick-wins, origin/fix/home-sanidad
- `comando: git merge-base --is-ancestor 3953558 origin/main`
  > YES - ancestor of origin/main
- `docs/audits/2026-05-bfg-leak-cleanup.md:5`
  > **Estado al cierre del sprint env-vars:** archivo eliminado del working tree, `.gitignore` patcheado, **history aun contiene el secret**.

**Fix.** Dos acciones, en este orden. (1) INMEDIATA, no requiere reescribir historial: rotar/confirmar-revocada la key en Google Cloud Console. Es lo unico que elimina el riesgo real; la reescritura de historial no des-publica lo que ya se pudo clonar. (2) HIGIENE: ejecutar el runbook docs/audits/2026-05-bfg-leak-cleanup.md (BFG o `git filter-repo --invert-paths --path logic-core-v3/enviroment.env`) sobre TODAS las ramas — no solo main, porque el blob cuelga de 5 ramas remotas — y luego force-push + pedir a GitHub Support la purga de la cache de objetos, que sobrevive al force-push en repos publicos. Como candado permanente para una agencia de 2 personas: activar GitHub Secret Scanning + Push Protection en la config del repo (es gratis en repos publicos y es 1 checkbox, no infraestructura que mantener).

**Criterio de aceptación.** (1) `git rev-list --all --objects | grep -c enviroment.env` devuelve 0 en un clon FRESCO del remote (no en el worktree local). (2) La key figura como revocada/eliminada en la consola de GCP. (3) Push Protection aparece habilitado en Settings > Code security del repo.

**Necesita decisión de Franco.** Si — dos decisiones que no puedo tomar ni verificar desde el repo: (a) confirmar en GCP si la key esta efectivamente revocada, y rotarla si no; (b) autorizar el force-push que reescribe historial (rompe clones y forks existentes). Ninguna de las dos es ejecutable por un agente.

**Qué encontró el verificador.** Reproduje toda la cadena yo mismo desde C:\Users\franc\Desktop\wt-auditoria-seguridad. `gh repo view --json visibility,nameWithOwner` → {"nameWithOwner":"frc11/PorfolioDevelOP","visibility":"PUBLIC"}. `git rev-list --all --objects | grep enviroment` → blob f9d11ed0bd6952840a566ac902d2c14d655acf8a en logic-core-v3/enviroment.env. `git rev-list origin/main --objects | grep -c f9d11ed0…` → 1, o sea alcanzable desde la rama por defecto del remote publico. `git merge-base --is-ancestor 3953558 origin/main` → YES. La purga nunca corrio: docs/audits/2026-05-bfg-leak-cleanup.md:5 dice literalmente 'history aun contiene el secret'. Y verifique que la premisa contraria del ledger es falsa: ledger-S8.md:126 (SEC-SECRETS-01) afirma 'la key no esta en git history' — eso es incorrecto para este blob. Busque activamente el contra-argumento y no lo encontre: no hay .gitignore ni packfile que lo saque, el blob esta vivo y colgando ademas de 6 ramas remotas (git branch -r --contains 3953558 devuelve main, b0-isolation-motor-chatbot, b1-s2-bsp-outbound, chore/security-quick-wins, fix/home-sanidad y runtime/mejoras — el hallazgo dice 5, son 6).

**Corrección aplicada.** Dos imprecisiones en la caracterizacion del secreto, ninguna de las cuales invalida el mecanismo pero ambas cambian la severidad. (1) El valor NO tiene 43 caracteres: `git cat-file -s f9d11ed0…` da 65 bytes de blob total y el valor mide 36 caracteres. (2) No tiene forma de API key de Google: su patron de clases de caracteres es 8-4-4-4-12 hex-alfanumerico, es decir un UUID — lo mismo que ya documenta el propio runbook en docs/audits/2026-05-bfg-leak-cleanup.md:13 ('GOOGLE_GENERATIVE_AI_API_KEY=<UUID-format-key>'). Las API keys de Google Cloud son AIza… de 39 caracteres. Llamarlo 'una API key de Google de 43 caracteres' sobredimensiona lo que hay ahi. Bajo de ALTO a MEDIO por tres razones acumuladas: el valor no matchea el formato de una key activa de Google, es UN solo valor (no un .env completo), y el mismo runbook (seccion 2, punto 1) registra que la key fue confirmada deshabilitada antes del descubrimiento. Sigue siendo MEDIO y no BAJO porque las precondiciones son efectivamente cero y la confirmacion de revocacion no es verificable desde el repo. El fix propuesto (rotar/confirmar en GCP primero, historial despues) es el orden correcto.

**Adjudicación del auditor.** Adjudicacion propia: el runbook docs/audits/2026-05-bfg-leak-cleanup.md:19 deja constancia de que la key ya estaba deshabilitada ANTES del descubrimiento. No es credencial viva. Verifique yo el blob (f9d11ed, 65 bytes, valor de 36 chars = formato UUID, coincide con lo que dice el runbook) y su alcanzabilidad desde origin/main. Queda: confirmar la revocacion en GCP + decidir la purga.

### [S8-02] next-auth 5.0.0-beta.31 / @auth/core 0.41.2 pasaron de 'sin advisory activa' a 4 advisories, 2 de ellas CRITICAS y una alcanzable por el magic-link

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | PLAUSIBLE |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Sin autenticacion (formulario de login publico). Para la via del magic-link, ademas: conocer una direccion de usuario existente y que la variante homoglifa sobreviva al normalizador y matchee la fila exacta. |

**Impacto.** (a) Accion lograda: en el peor caso, recibir el magic-link de acceso de una cuenta ajena, es decir toma de cuenta del portal. (b) A quien: alcanzable desde el formulario de login publico, sin autenticacion previa. (c) Precondiciones: el atacante necesita que la direccion homoglifa que construye coincida EXACTAMENTE con una fila User.email existente tras pasar por el normalizador — el gate propio de la app (src/auth.ts:175-186) exige que el usuario ya exista. Esa precondicion es real y verificada, y es la razon por la que bajo esto de CRITICO (que es lo que dice el advisory) a ALTO. Ademas verifique que las otras dos advisories NO son alcanzables en este codigo (ver mecanismo), lo cual desinfla el titular de '2 criticas' a 'una critica con mitigacion parcial'.

**Mecanismo.** El repo tiene el proveedor de email (magic link) configurado y vivo en src/auth.ts:97, con envio real via Brevo. La cadena vulnerable esta en el arbol instalado: `defaultNormalizer` de @auth/core 0.41.2 hace `email.toLowerCase().trim()` — que NO es normalizacion Unicode — y despues valida la direccion contando separadores `@` ASCII (`trimmedEmail.split("@").length !== 2`). Un codepoint que sea equivalente-por-compatibilidad de `@` no cuenta como separador en esa validacion, con lo cual la direccion pasa el chequeo como si tuviera un solo `@`; si mas abajo en la cadena de entrega algo aplica normalizacion Unicode, la direccion efectiva de destino deja de ser la que se valido y se guardo. Ese es el mecanismo del GHSA-7rqj-j65f-68wh. Describo la clase de caracter, no armo la direccion.

LO QUE VERIFIQUE QUE **NO** APLICA, y por eso no lo reporto como riesgo:
- GHSA-8fpg-xm3f-6cx3 (critica, 'existence-based auth checks fail open' cuando el objeto auth viene poblado con un error): el patron vulnerable es chequear la existencia del objeto pelado. Revise los 66 call-sites que llaman `await auth()` directamente y NINGUNO hace un chequeo de existencia sobre el objeto crudo — todos chequean una PROPIEDAD: src/proxy.ts:75 `Boolean(session?.user)`, src/lib/auth-guards.ts:6 chequeo positivo de rol, src/modules/chatbot/server/admin/getClientSession.ts:7 `!session?.user?.id`. Los 11 `if (!session)` que existen operan sobre el retorno de getClientChatbotSession, que ya devuelve null. Esta app es fail-closed frente a esta advisory.
- GHSA-xmf8-cvqr-rfgj (high, DoS por Bearer malformado en getToken()): `getToken` de next-auth no se usa en el repo. La unica coincidencia de grep es `oauth2Client.getToken(code)` de google-auth-library, que es otra cosa.

**Evidencia.**

- `comando: npm ls next-auth @auth/core`
  > next-auth@5.0.0-beta.31 / @auth/core@0.41.2
- `scratchpad/npm-audit-prod.json (advisory 1124246)`
  > critical | Auth.js: Email normalizer validates the address before Unicode normalization, allowing a homoglyph @ bypass | GHSA-7rqj-j65f-68wh | range=>=5.0.0-beta.1 <=5.0.0-beta.31
- `node_modules/@auth/core/src/lib/actions/signin/send-token.ts (defaultNormalizer)`
  > const trimmedEmail = email.toLowerCase().trim() ... if (!local || !domain || trimmedEmail.split("@").length !== 2) { throw new Error("Invalid email address format.") }
- `src/auth.ts:97`
  > Resend({  async sendVerificationRequest({ identifier: email, url }) {  await sendTransactionalEmail({ to: { email }, ...
- `src/auth.ts:175-186 (mitigacion propia de la app)`
  > if (email?.verificationRequest) { const requestedEmail = user?.email?.trim().toLowerCase(); ... const existingUser = await prisma.user.findUnique({ where: { email: requestedEmail } }); return Boolean(existingUser) }
- `src/proxy.ts:75`
  > const isAuthenticated = Boolean(session?.user)   // property-based, no existence-based → fail-closed
- `src/modules/chatbot/server/admin/getClientSession.ts:7`
  > if (!session?.user?.id) return null
- `comando: grep -rn "getToken" src/`
  > solo src/lib/integrations/google-business-profile.ts:51 (oauth2Client.getToken de google-auth-library) → getToken de next-auth NO se usa
- `ledger-S8.md:216 (estado previo)`
  > [SEC-DEP-04] ... `next-auth@5.0.0-beta.31 sin advisory activa`  — fuente: auditoria maestra 2026-07-10

**Fix.** Subir @auth/core a >=0.41.3 y next-auth a la beta que lo arrastre (`npm i next-auth@latest @auth/prisma-adapter@latest`), luego regenerar el lockfile y verificar que `npm audit --omit=dev` no reporte mas @auth/*. ATENCION AL ORDEN, y esto es lo que hace peligroso este fix concreto en este repo: (1) `jose` — la libreria que firma los tokens de impersonation — NO esta declarada en package.json y hoy resuelve por hoisting desde @auth/core (ver S8-08), asi que este upgrade puede moverla o dejarla sin proveedor; declarar `jose` en package.json ANTES de tocar @auth/core. (2) next.config.ts:10-15 tiene ignoreBuildErrors + ignoreDuringBuilds, con lo cual una incompatibilidad de tipos introducida por el salto de beta NO rompe el build y llega a produccion en silencio; correr `npx tsc --noEmit` a mano antes de deployar (hoy pasa con cero errores, asi que cualquier error nuevo es atribuible al upgrade).

**Criterio de aceptación.** `npm ls @auth/core` devuelve >=0.41.3, `npm audit --omit=dev` no lista ningun paquete @auth/* ni next-auth, `npx tsc --noEmit` sigue en cero errores, y un login por magic link + uno por password + uno por Google siguen funcionando end-to-end.

**Necesita decisión de Franco.** Si — saltar de beta.31 a otra beta de next-auth es un cambio de dependencia de autenticacion sin garantia de estabilidad de API. Decision de Franco: hacerlo ya (recomendado, la superficie es el login publico) o esperar; y en cualquier caso decidir si se pinea la version exacta (ver S8-03 sobre el caret en un prerelease).

**Qué encontró el verificador.** Verifique las versiones con el lockfile, no con npm ls: package-lock.json da next-auth 5.0.0-beta.31 y @auth/core 0.41.2, ambos dev=false. Corri `npm audit --omit=dev --json` yo mismo y confirmo las 4 advisories de next-auth (GHSA-8fpg critical, GHSA-xmf8 high, GHSA-7rqj critical, GHSA-x445 moderate). Confirmo las dos exclusiones del auditor: getToken de next-auth no se usa (grep en src/ solo devuelve src/lib/integrations/google-business-profile.ts:51, que es oauth2Client.getToken de google-auth-library); y sobre GHSA-8fpg revise los 92 `await auth()` de src/ — ninguno chequea la existencia del objeto pelado, y los 11 `if (!session)` cuelgan todos de getClientChatbotSession (verificado en conversations/page.tsx:9, chatbot/layout.tsx:25, api/dashboard/chatbot/leads/export/route.ts:84, updateLeadStatus.ts:18), que devuelve null en src/modules/chatbot/server/admin/getClientSession.ts:7. Fail-closed, correcto.

**Corrección aplicada.** El contra-argumento que el auditor menciona pero no cierra, y que yo si cerre: la via del magic-link NO alcanza toma de cuenta en esta app. Lei node_modules/@auth/core/lib/actions/signin/send-token.js:8-32: el normalizador corre y despues sendToken llama callbacks.signIn ANTES de generar el token y de invocar sendVerificationRequest. El gate propio de la app en src/auth.ts:174-186 exige `prisma.user.findUnique({ where: { email: requestedEmail } })` sobre el string ya normalizado, y devuelve false si no hay fila. Una direccion con homoglifo nunca puede matchear exactamente la fila de un usuario real (que es ASCII), asi que la ejecucion muere en AccessDenied y no se manda ningun email. Y a la inversa: si el string SI matchea una fila real, entonces es ASCII puro y no hay divergencia posible entre lo validado y lo entregado. Es decir, el gate cierra la clase entera de GHSA-7rqj por construccion, no por casualidad. Por eso el impacto declarado ('recibir el magic-link de una cuenta ajena, toma de cuenta del portal') queda refutado y bajo de ALTO a MEDIO: lo que queda en pie es una dependencia de autenticacion desactualizada con CVEs abiertos, que hay que subir igual, pero sin camino de explotacion verificable en este codigo. Dos apuntes menores: el auditor dice 'revise los 66 call-sites', mi grep da 92; y omite del triage la 4ta advisory, GHSA-x445-f3h2-j279 (cookies de state/nonce/PKCE de OAuth no atadas al provider que las creo), que si roza esta app porque convive Google OAuth con credentials y con el provider de email — no la evalue a fondo, queda como cola suelta.

### [S8-03] next@16.2.9: se reabrio SEC-DEP-01 con 9 advisories nuevas; triage real = 4 alcanzables, 3 verificadas NO alcanzables, y el fix ya cae dentro del rango declarado

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Sin autenticacion, contra el dominio publico. |

**Impacto.** (a) Lo que se logra en lo alcanzable: enumerar endpoints internos de Server Functions sin autenticacion, y degradar el servicio via Server Actions. No hay, entre las alcanzables, lectura de datos de otro tenant ni bypass de auth. (b) A quien: no autenticado, sobre la superficie publica. (c) Precondiciones: ninguna para la enumeracion. Lo mantengo en MEDIO y no en ALTO precisamente porque las tres advisories mas graves del lote (los dos SSRF y el bypass de middleware) las verifique NO alcanzables en esta configuracion — inflarlo a ALTO seria repetir el titular del CVE en vez de auditar el codigo.

**Mecanismo.** La version instalada es 16.2.9 y las 9 advisories cubren >=16.0.0 <16.2.11.

NO ALCANZABLES (verificado en este repo):
- GHSA-6gpp-xcg3-4w24 (bypass de middleware/proxy): exige Turbopack. Los dos scripts usan webpack explicitamente (package.json:7 `next dev --webpack`, package.json:9 `next build --webpack`). Turbopack no se usa en ningun modo. Ademas src/proxy.ts existe y es el guard real de rutas, con lo cual el impacto seria alto si aplicara — pero no aplica.
- GHSA-p9j2-gv94-2wf4 (SSRF en rewrites via hostname de destino controlable): next.config.ts no define `rewrites()` en absoluto; solo `headers()` y `redirects()`, y los 21 redirects tienen destino literal, sin interpolar parametros en el host.
- GHSA-4c39-4ccg-62r3 (payload ilimitado de Server Action en Edge runtime): cero declaraciones de `runtime = 'edge'` en todo src/. Todo corre en runtime Node.

ALCANZABLES:
- GHSA-955p-x3mx-jcvp (moderate, divulgacion no autenticada de endpoints internos de Server Functions): hay 92 archivos con 'use server'. Esto no es un bypass por si solo, pero baja el costo de descubrir una action sin guard — y el ledger ya registra al menos una (SEC-02, runPreflightChecks sin ningun guard). Ese es el valor real de esta advisory aca: amplifica un hallazgo abierto de otra lente.
- GHSA-m99w-x7hq-7vfj (high, DoS via Server Actions) y GHSA-68g3-v927-f742 / GHSA-4633-3j49-mh5q (cache confusion de bodies): alcanzables por construccion en cualquier App Router con actions.
- GHSA-q8wf-6r8g-63ch (DoS del optimizador de imagenes via SVG): parcialmente contenida — `dangerouslyAllowSVG` no esta seteado en ningun lado y `images.remotePatterns` solo admite placehold.co (next.config.ts:16-23).

DATO OPERATIVO IMPORTANTE: el fix es 16.2.11, que YA satisface el rango declarado `^16.2.6` (package.json:117). O sea que esto no requiere cambiar package.json — es un `npm update next` + commit del lockfile. Lo que congela la version vulnerable es unicamente el lockfile.

**Evidencia.**

- `comando: npm ls next`
  > next@16.2.9
- `package-lock.json (node_modules/next)`
  > 16.2.9 | resolved: https://registry.npmjs.org/next/-/next-16.2.9.tgz | dev:false
- `package.json:7 y package.json:9`
  > "dev": "next dev --webpack"  /  "build": "next build --webpack"   → Turbopack no se usa
- `package.json:117`
  > "next": "^16.2.6"   → 16.2.11 (el fix) ya cae dentro del rango declarado
- `comando: grep -rn "runtime\s*=\s*['\"]edge['\"]" src/`
  > (sin resultados) → cero rutas en Edge runtime
- `comando: grep -n rewrites next.config.ts`
  > NO rewrites() in next.config.ts
- `comando: grep -rn dangerouslyAllowSVG (todo el repo, sin node_modules)`
  > (sin resultados) → no seteado
- `next.config.ts:16-23`
  > images: { remotePatterns: [ { protocol: 'https', hostname: 'placehold.co' } ] }
- `scratchpad/npm-audit-prod.json (paquete next)`
  > 9 advisories, todas range=>=16.0.0 <16.2.11 (GHSA-6gpp-xcg3-4w24, m99w-x7hq-7vfj, 89xv-2m56-2m9x, 68g3-v927-f742, 4633-3j49-mh5q, 4c39-4ccg-62r3, p9j2-gv94-2wf4, q8wf-6r8g-63ch, 955p-x3mx-jcvp)

**Fix.** `npm update next` para llevarlo a >=16.2.11 dentro del caret ya declarado, y commitear package-lock.json. No hace falta tocar package.json. Sobre postcss y sharp, que npm audit cuelga de next: verifique que postcss corre solo en build (postcss.config.mjs con @tailwindcss/postcss; cero imports de postcss en src/) sobre CSS del propio repo, no sobre entrada del atacante — el path traversal via sourceMappingURL no tiene camino de runtime aca; se resuelve solo al subir next. Para que esto no se repita: un job de CI que corra `npm audit --omit=dev --audit-level=high` (reporta, no bloquea al principio) es sostenible para una agencia de 2 personas y es la unica red que detecta la proxima ola sin que nadie mire.

**Criterio de aceptación.** `npm ls next` devuelve >=16.2.11 y `npm audit --omit=dev` deja de listar next, postcss y sharp. La app buildea con `npm run build` y /login, el widget publico y /dashboard responden.

**Necesita decisión de Franco.** No. Es un patch dentro del rango de version ya declarado.

**Qué encontró el verificador.** Es el hallazgo mejor calibrado del lote y lo verifique entero de primera mano. Corri `npm audit --omit=dev --json` y obtuve exactamente las 9 advisories de next con range >=16.0.0 <16.2.11; los titulos del propio feed de advisories respaldan las tres exclusiones sin necesidad de inferencia: GHSA-6gpp dice 'using Turbopack and single locale' (y package.json:7 y :9 usan `next dev --webpack` / `next build --webpack`), GHSA-4c39 dice 'in Edge runtime' (grep -rE "runtime\s*=\s*['\"]edge['\"]" src/ → cero resultados), GHSA-p9j2 dice 'in rewrites' (grep rewrites next.config.ts → cero; el config solo tiene headers(), redirects() e images). Ademas cerre una que el auditor menciona al pasar sin evidencia: GHSA-89xv es 'SSRF in Server Actions on custom servers' y no hay servidor custom — no existe server.js/server.ts ni ningun createServer fuera de node_modules, el deploy va por @netlify/plugin-nextjs. Confirmo tambien dangerouslyAllowSVG ausente (el unico hit es .next/required-server-files.js con valor false) y next.config.ts:16-23 con remotePatterns limitado a placehold.co. El dato operativo clave lo verifique contra el registry: `npm view next version` devuelve 16.2.12, o sea el fix cae dentro del `^16.2.6` de package.json:117 y solo lo congela el lockfile. postcss: confirmado que no se importa en src/ y que postcss.config.mjs solo carga @tailwindcss/postcss, o sea build-time sobre CSS propio.

**Corrección aplicada.** Sin correccion. La unica diferencia menor: el conteo de archivos con 'use server' me da 90 (grep -rl sobre la directiva al inicio de linea), no 92; irrelevante para el argumento.

### [S8-04] El formulario de contacto del home postea la PII del visitante desde el browser directo al webhook de n8n, con la URL del webhook inlineada en el bundle publico

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ninguna. Basta leer el JavaScript servido en la landing publica. |

**Impacto.** (a) Que se logra: leer del bundle publico la URL del webhook de automatizacion de la agencia y postearle JSON arbitrario, inyectando leads falsos en el pipeline de n8n y consumiendo la cuota de ejecuciones del plan. (b) A quien: cualquiera, sin autenticacion — la URL viaja en el JS de la landing. (c) Precondiciones: ninguna, solo abrir el sitio y leer el bundle. No lo subo a ALTO porque la URL de un webhook de n8n no es una credencial que de acceso de lectura: el impacto es envenenamiento del pipeline de entrada y consumo de cuota, no exfiltracion. Tampoco lo bajo a BAJO porque el formulario de contacto del home es un canal comercial real y el ruido entra directo al CRM.

**Mecanismo.** Por diseno de Next, toda variable con prefijo NEXT_PUBLIC_ se inlinea literalmente en el bundle del cliente en build-time. Footer.tsx lee NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL y hace el `fetch` POST desde el browser del visitante, sin pasar por el servidor de la app. Consecuencia doble: (1) la URL del webhook queda publicada en el bundle, y (2) como el POST no pasa por el backend propio, no hay Zod, ni rate-limit, ni validacion de origen, ni captcha en el camino — todo eso quedaria del lado de n8n, que no esta en este repo. El ledger tiene SEC-PII-02 pero es otra cosa: aquel es la falta de disclaimer al visitante sobre que sus datos van a n8n; este es que el endpoint es publico y posteable por terceros. Mecanismos distintos, fixes distintos.

**Evidencia.**

- `src/components/sections/home/Footer.tsx:81`
  > const webhookUrl = process.env.NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL;
- `src/components/sections/home/Footer.tsx:84-89`
  > await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
- `comando: grep -rhoE "process.env.NEXT_PUBLIC_[A-Z0-9_]+" src/ | sort -u`
  > NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_BUILD_TIME, NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL, NEXT_PUBLIC_SENTRY_DSN, NEXT_PUBLIC_WHATSAPP_NUMBER  (las otras 4 no son sensibles: URL propia, timestamp, DSN de Sentry que es publico por diseno, y el WhatsApp de la agencia)
- `.env.example:204 y scripts/check-env.js:58`
  > # NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL=   /   'NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL'   → la variable esta declarada en los dos manifiestos; no es drift, es una decision de diseno

**Fix.** Mover el POST al servidor: una Server Action (o un route handler) que reciba el formulario, lo valide con Zod, le aplique el rate-limit que ya existe en el repo, y recien ahi haga el fetch a n8n leyendo N8N_CONTACT_WEBHOOK_URL — la variable SIN prefijo NEXT_PUBLIC_, que ya esta declarada en .env.example:200 y en check-env.js:57. Es decir, la variable server-side correcta ya existe en los manifiestos; solo hay que usarla y borrar la NEXT_PUBLIC_. El fallback a wa.me que ya tiene el componente se conserva tal cual para el caso de error.

**Criterio de aceptación.** `grep -r NEXT_PUBLIC_N8N .next/static/` sobre un build de produccion no devuelve nada, y el formulario del footer sigue entregando el lead a n8n. La variable NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL queda borrada de .env.example y de check-env.js.

**Necesita decisión de Franco.** No. La variable server-side equivalente ya esta prevista en los manifiestos del repo.

**Qué encontró el verificador.** Las dos citas son literales y las verifique linea por linea: src/components/sections/home/Footer.tsx:81 es `const webhookUrl = process.env.NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL;` y :84-89 es el fetch POST con JSON.stringify(form) desde el browser. Verifique la alcanzabilidad, que el hallazgo no probaba: el componente se monta en la home publica (src/app/page.tsx:11 lo importa con dynamic + ssr:true), asi que el codigo va al bundle del cliente de la landing. Busque un guard aguas arriba y no existe: no hay proxy ni server action en el camino, el POST sale del navegador. Confirmo tambien que el inventario de NEXT_PUBLIC_* es exactamente el que dice (APP_URL, BUILD_TIME, N8N_CONTACT_WEBHOOK_URL, SENTRY_DSN, WHATSAPP_NUMBER) y que las otras cuatro no son sensibles. Y encontre un refuerzo del fix que el hallazgo no cita: la ruta server-side ya existe y ya se usa — src/lib/n8n.ts:19 lee N8N_CONTACT_WEBHOOK_URL (sin prefijo publico), con timeout de 8s, y su unico consumidor es src/lib/actions/contact.ts:5. O sea que el Footer es la duplicacion cruda de un camino que ya esta bien hecho en el servidor.

**Corrección aplicada.** Una condicion que el hallazgo no explicita y que hay que decir: la exposicion depende de que NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL este efectivamente seteada en el entorno de produccion de Netlify. En el repo esta comentada (.env.example:204) y el codigo tiene fallback a wa.me cuando la variable es falsy (Footer.tsx:97-105), asi que si en prod no esta cargada, no hay URL inlineada y el hallazgo no se materializa. Eso no es verificable desde el repo — el env de Netlify es inaccesible, limitacion que el propio ledger ya registra (ledger-S8.md:94). Mantengo MEDIO porque el defecto de diseno es real e independiente de eso, y porque el criterio de aceptacion propuesto (grep sobre .next/static de un build de prod) es justamente la forma de resolver la duda.

### [S8-06] El repositorio publico hostea 16+ documentos de auditoria que enumeran, con archivo:linea, cada vulnerabilidad abierta de la aplicacion

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Ninguna. Lectura del repositorio publico. |

**Impacto.** (a) Que se expone: un mapa curado, priorizado y con ubicacion exacta de las debilidades sin arreglar — incluyendo el inventario de 32 hallazgos SEC-* de 2026-05 y el runbook que nombra el archivo con el secret filtrado y su commit. (b) A quien: a cualquiera, sin autenticacion. (c) Precondiciones: ninguna. No es una vulnerabilidad en si — no abre por si solo ninguna puerta — pero elimina por completo la fase de reconocimiento de quien quiera explotar las que SI estan abiertas, y varias de esas (SEC-01, SEC-11, rate-limit poroso) siguen sin cerrar. MEDIO es el techo honesto: el dano es indirecto y amplificador, no directo.

**Mecanismo.** El repo es publico (verificado en S8-01) y el arbol de origin/main incluye 16 archivos bajo docs/auditoria*, docs/audits/ y docs/baselines/. Entre ellos, docs/auditoria-seguridad-2026-05.md es el inventario completo de 32 hallazgos SEC-* con evidencia archivo:linea y severidad propuesta, y docs/audits/2026-05-bfg-leak-cleanup.md documenta paso a paso el secret filtrado, el nombre exacto del archivo y el commit donde vive — es decir, publica la ruta hacia S8-01. La practica de dejar constancia escrita de las auditorias es buena y hay que conservarla; el problema es unicamente donde vive el archivo.

**Evidencia.**

- `comando: git ls-tree -r origin/main --name-only | grep -icE 'docs/(auditoria|audits|baselines)'`
  > 16
- `comando: git ls-files | grep -iE '^docs/.*(audit|segur|baseline)'`
  > docs/auditoria-seguridad-2026-05.md, docs/audits/2026-05-auditoria-profunda.md, docs/audits/2026-05-auditoria-db.md, docs/audits/2026-05-bfg-leak-cleanup.md, docs/auditorias/AUDITORIA-CIERRE-2026-07.md, docs/audit-repo-20260707.md, ... (16 en total)
- `docs/audits/2026-05-bfg-leak-cleanup.md:11-16`
  > El archivo `logic-core-v3/enviroment.env` (typo, faltaba la "n") estaba tracked en git history desde commit `3953558`. Contenia: GOOGLE_GENERATIVE_AI_API_KEY=...
- `comando: gh repo view --json visibility`
  > "visibility":"PUBLIC"

**Fix.** Decidir una de dos y ejecutarla entera. Opcion A (recomendada por costo): pasar el repositorio a privado — es 1 checkbox, resuelve tambien la mitad de S8-01 y S8-07, y este repo no es una libreria que alguien vaya a consumir. Opcion B (si el repo tiene que seguir publico por portfolio): mover docs/auditoria*, docs/audits/ y docs/baselines/ a un repo privado aparte o a un drive compartido, dejando en el repo publico solo un README que apunte ahi. Mientras se decide, lo urgente no es el documento sino cerrar lo que el documento denuncia.

**Criterio de aceptación.** O bien `gh repo view --json visibility` devuelve PRIVATE, o bien `git ls-tree -r origin/main --name-only | grep -cE 'docs/(auditoria|audits|baselines)'` devuelve 0.

**Necesita decisión de Franco.** Si — es una decision de producto, no tecnica: si el repo tiene que ser publico (portfolio de la agencia) o puede pasar a privado. Todo lo demas depende de esa respuesta.

**Qué encontró el verificador.** Verifique el conteo y el contenido. `git ls-tree -r origin/main --name-only | grep -icE 'docs/(auditoria|audits|baselines)'` devuelve 16, y la lista incluye docs/auditoria-seguridad-2026-05.md, docs/audits/2026-05-bfg-leak-cleanup.md y docs/auditorias/AUDITORIA-CIERRE-2026-07.md. Abri el doc principal y el valor de reconocimiento es real, no hipotetico: docs/auditoria-seguridad-2026-05.md:11-30 trae la tabla de 32 hallazgos por severidad y un 'Top 3 prioridades' que describe en prosa el camino de ataque de una debilidad marcada ABIERTA (SEC-AUTH-01/02: state OAuth sin HMAC → conectar la cuenta externa del atacante a la org de otro cliente), mas el checklist heredado con el veredicto abierto/cerrado de cada item. El repo es PUBLIC (verificado en S8-01). Busque si el ledger ya lo tenia: ledger-S8.md:90 registra que se uso `gh` para visibility en la lente DATOS+DR, pero no hay ningun hallazgo previo sobre la publicacion de los documentos. NUEVO, correcto.

**Corrección aplicada.** Considere deflacionarlo a BAJO con el argumento de que el codigo fuente entero ya es publico y contiene mas informacion que los documentos — pero no se sostiene: lo que agregan los docs no es informacion sobre el codigo sino el estado de remediacion (que esta ABIERTO hoy, priorizado, con el camino de explotacion redactado en castellano). Eso no se deduce leyendo el fuente. MEDIO se mantiene. Si agrego una observacion de encuadre: tanto este hallazgo como S8-01 rodean, sin nombrarlo, el hecho de fondo — el codigo fuente completo de una plataforma multi-tenant que procesa PII de terceros esta publicado. La opcion A del fix (pasar el repo a privado) es la unica que ataca eso, y por eso es la correcta.

### [S8-08] Siguen 4 dependencias fantasma sin declarar; la critica es `jose` (firma de los tokens de impersonation), que cuelga justo de @auth/core — el paquete que S8-02 obliga a subir

| | |
|---|---|
| **Severidad** | MEDIO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CONFIRMADO_SIN_TEST |
| **Precondiciones** | Ninguna desde afuera. Se materializa al reinstalar dependencias o al subir @auth/core. |

**Impacto.** (a) Que se rompe: la version de la libreria que firma y verifica los tokens de impersonation (HS256) no la decide el lockfile de este repo sino el arbol de dependencias de @auth/core. (b) A quien afecta: al mecanismo de impersonation, que es como un SUPER_ADMIN entra al contexto de un cliente. (c) Precondiciones: no es explotable por un atacante externo — es una fragilidad de la cadena, no una puerta. Por eso MEDIO y no ALTO. Lo que lo saca de BAJO es la coincidencia concreta y verificada: el fix obligatorio de S8-02 es subir @auth/core, y @auth/core es hoy el UNICO proveedor de `jose`. El arreglo de seguridad y la pieza fragil son el mismo paquete.

**Mecanismo.** Cruce los imports de paquetes externos de todo src/ contra las claves de dependencies y devDependencies de package.json. Cuatro paquetes se importan sin estar declarados y hoy resuelven solo por hoisting transitivo: jose (1 archivo), server-only (1), three-stdlib (4) y framer-motion (3). Correccion metodologica que hago explicita porque casi la reporto mal: mi primer barrido dio 3 porque el regex exigia `from`, y server-only se importa como efecto lateral puro (`import 'server-only'`); son 4, igual que en CLEAN-ANEXO-DEPS — no hubo cierre, el sprint E1.5 no corrio sobre esto. La cadena de jose es la que importa: @auth/prisma-adapter@2.11.2 → @auth/core@0.41.2 → jose@6.2.3. Si @auth/core sube a >=0.41.3 y cambia su rango de jose, o si npm decide no hoistear, el import de src/lib/impersonation.ts:3 pasa a resolver a otra version o a fallar. Y como next.config.ts:10-15 apaga el chequeo de tipos en el build, un cambio de API de jose no rompe el build: llega a produccion.

**Evidencia.**

- `comando: cruce de imports de src/ contra package.json (script propio en scratchpad/phantom.js) + verificacion manual de server-only`
  > jose ← src/lib/impersonation.ts | server-only ← src/lib/leados/foco-cookie.ts:1 | three-stdlib ← 4 archivos | framer-motion ← 3 archivos
- `comando: npm ls jose`
  > logic-core-v3@0.1.0\n`-- @auth/prisma-adapter@2.11.2\n  `-- @auth/core@0.41.2\n    `-- jose@6.2.3      (unico proveedor)
- `src/lib/impersonation.ts:3`
  > import { jwtVerify, SignJWT } from 'jose'
- `src/lib/impersonation.ts:25-30`
  > return new SignJWT(payload).setProtectedHeader({ alg: 'HS256', typ: 'JWT' })...sign(getSecret())
- `comando: npm ls three-stdlib / framer-motion`
  > three-stdlib@2.36.1 ← @react-three/drei@10.7.7 | framer-motion@12.42.0 ← motion@12.42.0
- `next.config.ts:10-15`
  > typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true }   → un cambio de API de jose no rompe el build

**Fix.** Declarar los 4 en package.json con la version que hoy resuelve (jose@^6.2.3, server-only, three-stdlib@^2.36.1, framer-motion@^12.42.0) y regenerar el lockfile. Es un cambio de 4 lineas y hay que hacerlo ANTES del upgrade de @auth/core de S8-02, no despues. Como candado, `npx knip --include unlisted` ya esta instalado en el repo (devDependency knip@6.16.1) y detecta exactamente esta clase: alcanza con agregarlo como script npm y correrlo antes de deployar.

**Criterio de aceptación.** `npx knip --include unlisted` devuelve cero imports no declarados, y tras un `rm -rf node_modules && npm ci` la app sigue buildeando y `npm ls jose` muestra jose como dependencia directa del proyecto y no colgada de @auth/core.

**Qué encontró el verificador.** Cruce yo mismo package.json contra los imports. jose, server-only, three-stdlib y framer-motion no figuran en dependencies ni devDependencies (verificado con node -e sobre package.json); si figuran motion ^12.36.0, three ^0.182.0 y @react-three/drei ^10.7.7, que son los que los hoistean. Los imports existen: src/lib/impersonation.ts:3 `import { jwtVerify, SignJWT } from 'jose'`, src/lib/leados/foco-cookie.ts:1 `import 'server-only'` (efecto lateral puro — la correccion metodologica que el auditor se hace a si mismo es correcta y la reproduje), y three-stdlib/framer-motion en varios componentes. `npm ls jose` confirma el proveedor unico: logic-core-v3 → @auth/prisma-adapter@2.11.2 → @auth/core@0.41.2 → jose@6.2.3. El acoplamiento con S8-02 es real: el paquete que hay que subir por CVE es el unico que provee la libreria que firma los tokens de impersonation (src/lib/impersonation.ts:24-29, SignJWT HS256). Confirmo tambien next.config.ts:10-15 con ignoreBuildErrors y ignoreDuringBuilds, o sea que un cambio de API de jose no rompe el build.

**Corrección aplicada.** Un matiz que atenua sin invalidar: hoy la resolucion no es azarosa, package-lock.json pinea jose@6.2.3 explicitamente, asi que un `npm ci` reproduce exactamente la misma version. El riesgo no es 'cualquier reinstall', es especificamente el upgrade de @auth/core que S8-02 vuelve obligatorio, o un `npm update` amplio. El hallazgo ya dice esto ('se materializa al reinstalar dependencias o al subir @auth/core'), asi que MEDIO se sostiene por el acoplamiento concreto y de corto plazo, no por fragilidad generica. Ademas noto, fuera del alcance de este hallazgo, que src/lib/impersonation.ts:14-19 tiene un secreto de fallback hardcodeado ('develOP-dev-impersonation-secret') si no hay IMPERSONATION_SECRET/AUTH_SECRET/NEXTAUTH_SECRET — no es lo que S8-08 reporta y no lo evalue, pero esta en la misma funcion citada como evidencia.

### [S8-05] El plugin de build de Netlify no esta pineado en ningun lado: se resuelve en cada deploy con acceso total al build y a todas las env vars de produccion

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | NUEVO |
| **Precondiciones** | Compromiso de una version publicada de @netlify/plugin-nextjs, o un cambio no anunciado en una release nueva. |

**Impacto.** (a) Que se compromete si el paquete se compromete: TODO. Un plugin de build de Netlify corre con acceso al codigo fuente, al output del build y al entorno completo del deploy, que en este repo incluye AUTH_SECRET, DATABASE_URL y todas las claves de terceros. Es la dependencia mas privilegiada del sistema. (b) A quien: al atacante que comprometiera una release de @netlify/plugin-nextjs. (c) Precondiciones: comprometer un paquete publicado por Netlify, que es un editor de primera parte con buena postura de seguridad — la probabilidad es baja. Por eso MEDIO y no ALTO: el impacto es maximo pero la precondicion es exigente. Lo que lo mantiene sobre BAJO es que hoy no hay NINGUNA barrera: ni version pineada, ni lockfile, ni revision.

**Mecanismo.** netlify.toml declara el plugin sin campo de version. El paquete no figura en package.json ni tiene una sola entrada en package-lock.json (verificado programaticamente sobre el lockfile). Netlify lo instala del registry en tiempo de build, resolviendo a la ultima version compatible en ese momento. Consecuencia: dos deploys del mismo commit pueden correr con codigo de plugin distinto, y el lockfile —que es la unica garantia de reproducibilidad que tiene el repo— no cubre la pieza con mas privilegio de toda la cadena. Es un punto ciego del modelo de confianza: el repo pinea 1092 paquetes y deja sin pinear justo el que ve los secrets.

**Evidencia.**

- `netlify.toml:9-10`
  > [[plugins]]\n  package = "@netlify/plugin-nextjs"     (sin campo de version)
- `comando: grep -rn netlify package.json`
  > NOT in package.json
- `comando: node -e sobre package-lock.json filtrando entradas que contengan 'netlify'`
  > lockfile netlify entries: NONE
- `netlify.toml:2`
  > command = "npx prisma generate && npm run build"   → el plugin envuelve este build y ve su entorno completo

**Fix.** Pinear la version en netlify.toml agregando el campo de version al bloque del plugin (`[[plugins]] package = "@netlify/plugin-nextjs"` + `version = "5.x.y"` con la version que hoy resuelve el deploy), y anotar en docs/operations/b14-deploy-checklist.md que subirla es un cambio deliberado. Es una linea de config y cero mantenimiento adicional, lo cual lo hace sostenible para una agencia de 2 personas. Antes de pinear hay que leer del log del ultimo deploy en Netlify que version esta corriendo hoy.

**Criterio de aceptación.** netlify.toml declara una version explicita para @netlify/plugin-nextjs, y dos deploys consecutivos del mismo commit reportan la misma version de plugin en el log de build.

**Necesita decisión de Franco.** Si — hay que mirar el log de deploy en el panel de Netlify para saber que version pinear. Ese dato no existe en el repo.

**Qué encontró el verificador.** Las tres verificaciones dan lo que dice. netlify.toml lineas 9-10 son `[[plugins]]` / `package = "@netlify/plugin-nextjs"` sin campo de version — lo lei con sed y no hay linea de version en el bloque. `grep -n netlify package.json` sale con exit 1 (no esta declarado). Y recorri package-lock.json programaticamente filtrando claves que contengan 'netlify': cero entradas. netlify.toml:2 confirma que el plugin envuelve `npx prisma generate && npm run build`, o sea el entorno completo del build.

**Corrección aplicada.** Bajo de MEDIO a BAJO aplicando el mismo criterio de estrictez que el hallazgo pide para los demas. La precondicion es comprometer una release publicada por Netlify — editor de primera parte — y ademas esta es la configuracion por defecto documentada por el propio Netlify: la enorme mayoria de los sitios Next en Netlify declara el plugin sin version, e incluso sin declararlo Netlify lo auto-instala. No hay evidencia de compromiso ni de comportamiento anomalo. El impacto teorico maximo no alcanza para MEDIO cuando la probabilidad es la de una supply-chain de primera parte y la configuracion es el default de la plataforma. El fix (una linea con version explicita) sigue siendo correcto y barato; es higiene, no riesgo activo. Nota practica sobre el criterio de aceptacion: pinear en netlify.toml no elimina la resolucion desde el registry en build-time, solo la hace reproducible.

### [S8-07] Los archivos basura trackeados publican el arbol interno de modulos y el usuario del sistema del desarrollador — verificado que NO contienen credenciales

| | |
|---|---|
| **Severidad** | BAJO |
| **Veredicto** | CONFIRMADO |
| **vs. ledger** | CAMBIO_DE_ESTADO |
| **Precondiciones** | Ninguna. Lectura del repositorio publico. |

**Impacto.** (a) Que se expone: el nombre de usuario del SO y la ruta local completa del proyecto (99 ocurrencias), mas un volcado de 55 KB con la ruta de cada archivo interno y su error de tipos, y 69 KB de errores de lint. NO se expone ninguna credencial: escanee los 20 archivos decodificados contra patrones de connection string, claves de API de OpenAI/Google/Brevo/Resend/GitHub/npm y bloques PEM, con cero coincidencias, y tampoco hay direcciones de email. (b) A quien: publico. (c) Precondiciones: ninguna. Es BAJO y no mas: reconocimiento de bajo grado, sin credenciales. Lo reporto separado del desorden porque el ledger lo tenia catalogado como ruido de lint y el eje que importa aca es otro — que es publico.

**Mecanismo.** Verifique con `git ls-files` cuales de los archivos denunciados estan REALMENTE trackeados: lo estan .eslint_output.txt, ts_errors.log, ts_errors.txt, ts_prune_output.txt, prisma_err.txt, audit.txt, unused_report.txt, unused_report_utf8.txt, test-chat.mjs, __dev_task.md, find_unused.js, replace_analytics.js, los 10 script*.js y 7 archivos _lane-*.md. Seis de ellos estan en UTF-16LE, razon por la cual un escaneo de secretos ingenuo con grep NO los lee (los bytes nulos intercalados rompen el match) — tuve que decodificarlos con iconv para poder auditarlos. Ese detalle importa: cualquier escaneo automatico de secrets que se monte a futuro va a tener el mismo punto ciego con estos archivos. Una vez decodificados, el contenido sensible se reduce a la ruta absoluta del proyecto del dev y al mapa de estructura interna. El aporte respecto de CLEAN-H-JUNKROOT es que aquel lo trataba como higiene de lint y proponia ignorarlos en eslint; el eje real es que estan publicados.

**Evidencia.**

- `comando: git ls-files (raiz, filtrando dirs de codigo)`
  > .eslint_output.txt, ts_errors.log, ts_errors.txt, ts_prune_output.txt, prisma_err.txt, audit.txt, unused_report.txt, unused_report_utf8.txt, test-chat.mjs, __dev_task.md, find_unused.js, replace_analytics.js, script.js, script2.js, script3.js, script_aiscene.js, script_analytics.js, script_leads.js, script_magnetic.js, script_maps.js, _lane-*.md x7
- `comando: file -b .eslint_output.txt`
  > Unicode text, UTF-16, little-endian text  (138450 bytes) — invisible a un grep de secrets sin decodificar
- `comando: grep -rhoiE 'c:.{0,2}users.{0,2}[a-z0-9_.-]+' sobre los 20 archivos decodificados`
  > 99 ocurrencias de  C:\Users\franc   (ruta completa: C:\Users\franc\Desktop\PorfolioDevelOP\logic-core-v3\...)
- `comando: grep -rEoi sobre los 20 archivos decodificados, patrones postgres://, sk-, AIza, npm_, re_, xkeysib-, ghp_, BEGIN PRIVATE KEY`
  > (sin coincidencias) → NINGUNA credencial en los archivos basura
- `comando: grep -rhoiE emails sobre los 20 archivos decodificados`
  > (sin coincidencias) → sin direcciones de email

**Fix.** `git rm` de los 27 archivos y agregarlos a .gitignore por patron (*_output.txt, ts_errors.*, unused_report*.txt, prisma_err.txt, audit.txt, script*.js, find_unused.js, replace_analytics.js, __dev_task.md, _lane-*.md, test-chat.mjs). Son artefactos de corridas one-off, ninguno es codigo de la app. No hace falta reescribir historial por estos: no contienen secretos — a diferencia de S8-01, que si lo requiere.

**Criterio de aceptación.** `git ls-files` en la raiz devuelve solo archivos de configuracion y documentacion legitimos, y .gitignore cubre los patrones para que no vuelvan.

**Qué encontró el verificador.** Reproduje la parte que importa, que es la afirmacion NEGATIVA. `git ls-files` en la raiz confirma que estan trackeados .eslint_output.txt, ts_errors.log/.txt, ts_prune_output.txt, unused_report.txt, unused_report_utf8.txt, prisma_err.txt, audit.txt, test-chat.mjs, __dev_task.md, find_unused.js, replace_analytics.js, los 9 script*.js y 8 archivos _lane-*/_CHANGELOG-lane-*. Confirmo el detalle de encoding con `file -b`: .eslint_output.txt, ts_errors.log, ts_errors.txt, unused_report.txt y prisma_err.txt son UTF-16LE (audit.txt es UTF-8 con BOM) — el punto ciego de un escaneo de secrets ingenuo es real. Decodifique los 29 archivos con iconv a un scratchpad y corri mi propio barrido con patrones de connection string de Postgres, sk-, AIza, npm_, re_, xkeysib-, ghp_ y bloques PEM: cero coincidencias. Cero direcciones de email. Solo rutas C:\Users\franc (mi conteo da 76 ocurrencias sobre mi set de archivos, el hallazgo dice 99 sobre el suyo — diferencia de set, no contradiccion). La afirmacion 'NO contienen credenciales' resiste mi verificacion independiente.

**Corrección aplicada.** Ninguna sustantiva. El encuadre CAMBIO_DE_ESTADO vs CLEAN-H-JUNKROOT (ledger-S8.md:164) es honesto: aquel lo trataba como ruido de lint y este aporta el eje de que estan publicados y la verificacion de que no hay secretos adentro. BAJO es la severidad correcta y el hallazgo no la infla.

#### Ya documentado en auditorías previas — no se re-reporta (9)

- [SEC-16 / CLEAN-H-BUILDGATE] next.config.ts:10-15 sigue con typescript.ignoreBuildErrors + eslint.ignoreDuringBuilds; estado identico al documentado (el angulo de seguridad concreto que se me pidio explicar lo desarrollo dentro de S8-02 y S8-08, donde es la causa de que un upgrade de dependencia de auth pueda llegar a prod sin chequeo de tipos).
- [CLEAN-H-CRONTRIGGER / RESIL-03] netlify.toml:25-29 sigue agendando generate-insights-cron y send-weekly-reports-cron, que no existen como functions, y vercel.json declara 3 crons en un repo desplegado en Netlify. Sin cambios.
- [CLEAN-ANEXO-UNUSEDDEPS] knip y dependency-cruiser siguen instalados sin script npm ni job de CI. Sin cambios.
- [CLEAN-1.1-ENVDRIFT] Drift entre .env.example, scripts/check-env.js y las variables realmente usadas. Sin cambios (verifique el caso NEXT_PUBLIC_N8N: NO es drift, esta en los dos manifiestos — el problema es de diseno y va como S8-04).
- [SEC-11 / OBS-09 / CLEAN-H-TESTROUTE] src/app/api/test-sentry/route.ts sigue siendo un GET publico sin guard que lanza una excepcion. Sin cambios (es lente S4).
- [SEC-01] src/app/api/chatbot/[slug]/smoke/route.ts sigue sin guard de auth, sin rate-limit y sin chequeo de NODE_ENV. Sin cambios (es lente S4).
- [QA-BYPASS] El triple guard de /api/qa/login sigue intacto y correcto: verifique las 3 patas (QA_ALLOW_LOCALHOST, host localhost, NETLIFY!=true en route.ts:65). Investigue si la pata de VERCEL_ENV:68 lo degradaba en Netlify y NO es asi — la pata de NETLIFY cubre esta plataforma. Confirmado cerrado, sin hallazgo.
- [SEC-DEP-02 protobufjs] Sigue instalado (7.6.4) con una advisory moderate nueva (DoS por bucle infinito parseando opciones .proto, GHSA-j3f2-48v5-ccww), pero los .proto que parsea vienen empaquetados con google-gax y no son entrada del atacante: sin camino de explotacion en este codigo.
- [SEC-DEP-04 dompurify] dompurify@3.4.11 (low, GHSA-c2j3-45gr-mqc4) cuelga de jspdf@4.2.1, generacion de PDF del lado del cliente. Se resuelve con el bump de jspdf; sin camino de servidor.

---

## 7. Qué cubre y qué no la golden suite (delta de cobertura)

**La respuesta corta: en la rama auditada, la golden suite no cubre nada, porque no está.**

`grep -rn "@isolation"` sobre todo el árbol de `49fec9b` devuelve cero resultados. Los 8 tests Playwright de GS.1 viven en `chore/gs-aislamiento` (`403280b`), rama que no es ancestro de `origin/main`. Lo mismo pasa con la frontera ESLint sobre los modelos del portal (`fa5ed47`, en `chore/security-quick-wins`).

Lo que **sí** existe en el árbol auditado: 56 archivos `*.invariant.ts` y las suites `tests/integration/chatbot-isolation.spec.ts` y `tests/integration/motor-isolation.spec.ts`, que cubren el régimen fuerte de aislamiento (los 18 modelos de chatbot y motor bajo `src/lib/isolation`).

El delta de cobertura, entonces, tiene dos capas:

**Capa 1 — lo que GS.1 cubriría si se mergeara, y hoy no está cubierto por nada:** confinamiento de la impersonation al tenant destino, rechazo de una cookie de impersonation forjada, `403` cross-org de `/api/reports/monthly`, y el sostén de `callerCanAccessOrg` / `resolveScopedOrgId`.

**Capa 2 — lo que queda fuera incluso con GS.1 mergeada:**

| superficie | ¿la cubriría GS.1? | por qué importa |
|---|---|---|
| Los ~20 modelos del portal con `organizationId` (Ticket, Project, Message, Invoice, Subscription, Notification, ClientAsset, Service, EmailContact, EmailCampaign, OrgMember…) | No | Están enteramente fuera del helper de aislamiento; sus tres guards no tienen un solo test cruzado (S3-03). Son 222 call-sites de acceso directo a Prisma. |
| **Mutación** cruzada vía server actions del setter | No | Cero tests del repo invocan una server action del setter: las specs importan la capa LIB y re-implementan el cuerpo post-guard. Los 19 guards de ownership a nivel action no tienen ninguna cobertura (S2c/A-13). |
| Rol × recurso (el eje de S2) | No | GS.1 prueba aislamiento por **organización**. El eje de **rol** es ortogonal y ninguna suite lo cubre. |
| `validateWebhookUrl` | No | Es el único control anti-SSRF del repo y no tiene ni un test ni un invariante (S6-04). |
| `unsafeGlobalQuery` | No | 51 usos en caminos de producción, sin techo ni drift-check (S3-07). |
| El invariante de auth de cron | Existe pero no corre | Está escrito y registrado como `test:t02`, pero no está encadenado en el agregado `check:invariants` de `package.json:18`. |

## 8. Lo que no pude verificar

Esta sección es deliberadamente larga. Nada de lo que sigue está afirmado en el reporte como hecho.

**Requiere el panel de Netlify (valores de entorno de producción).** Ninguna de estas se puede leer desde el repo, y varias son la diferencia entre "debilidad latente" y "fuga activa":
- `CHATBOT_IP_HASH_SALT` — si está ausente, los `ipHash` son reversibles con el salt público (S7-03).
- `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL` — si está seteada, la URL del webhook de n8n está inlineada en el bundle público (S7-06 / S8-04).
- `QA_ALLOW_LOCALHOST` — si estuviera activa en un deploy real, abre el escape de `validateOrigin`.
- `CRON_SECRET` — de eso depende que las rutas de cron con fail-open estén hoy abiertas o cerradas.
- `ONBOARDING_SECRET_KEY`, `CRM_SECRET_KEY`, `MOTOR_CHANNEL_SECRET_KEY`, `OAUTH_STATE_SECRET`.
- Qué versión de `@netlify/plugin-nextjs` resuelve hoy el deploy (dato necesario para ejecutar el fix de S8-05).

**Requiere la consola de Google Cloud.** Si la key `GOOGLE_GENERATIVE_AI_API_KEY` del historial está efectivamente revocada. El repo solo contiene la constancia escrita de que lo confirmaste el 2026-05-21. Y si Vertex tiene desactivado el logging de prompts/respuestas para el proyecto.

**Requiere la base de datos.** No toqué ninguna DB. Quedan sin verificar: si existe hoy algún usuario con `role='CLIENT'`; si algún `SUPER_ADMIN` o `SETTER` tiene fila `OrgMember` (precondición de S2c-01 y S3-05); si hay usuarios con ≥2 membresías (precondición de S3-06); el contenido real de `BotConfig.allowedDomains`; si hay filas `ClientAsset` type=ACCESS con credenciales reales (S6-01); si hay algún `WabaChannel` aprovisionado; el volumen acumulado de `Conversation`, `ChatMessage`, `ChatbotLead` y `motor_message` que dimensiona S7-01.

**Requiere tráfico real.** Si Netlify normaliza o reescribe `x-forwarded-for` antes de que llegue a la function — determina si el bypass del lockout de S1-01 es total o parcial. Si el edge normaliza `Sec-Fetch-Site` y `Referer` (afecta a S4-02). Si los encabezados declarados en `next.config.ts` se emiten efectivamente en producción tal cual. La magnitud real del delta de timing del login (S1-03). El comportamiento de los escáneres de correo sobre los links de baja (S2b-08).

**Requiere ejecutar la app.** Todo el veredicto es lectura estática: no corrí el dev server ni la batería Playwright. En particular, ningún `403`/`200` descrito en los criterios de aceptación fue observado en runtime.

**Fuera de alcance por decisión.** El comportamiento efectivo del modelo ante `currentPath` o un historial `assistant` forjados (S5-01, S5-02): lo verificado es que ese texto llega al prompt en la región confiable y sin envolver; el desenlace depende del modelo. Y la configuración del proyecto de Sentry (lista de campos sensibles, Enhanced Privacy), que vive en su panel y podría mitigar parte de S7-07 — o no.

**Limitación metodológica de esta corrida.** 32 de los 75 hallazgos no tienen pasada de refutación adversarial independiente, porque 5 de los 10 verificadores murieron por límite de sesión y el reintento murió igual. Verifiqué yo mismo los que sostienen las conclusiones más pesadas; el resto se apoya en una sola lectura y está marcado como *SIN VERIFICAR* en su ficha. Un hallazgo sin refutación no es un hallazgo falso, pero tampoco tiene el mismo respaldo que los 39 confirmados.

---

## 9. Tabla priorizada

| # | id | lente | severidad | veredicto | vs. ledger |
|---|---|---|---|---|---|
| 1 | S1-01 | S1 | **ALTO** | CONFIRMADO | CAMBIO_DE_ESTADO |
| 2 | S4-01 | S4 | **ALTO** | CONFIRMADO | NUEVO |
| 3 | S7-01 | S7 | **ALTO** | CONFIRMADO | CAMBIO_DE_ESTADO |
| 4 | S1-02 | S1 | **MEDIO** | SIN VERIFICAR | NUEVO |
| 5 | S1-03 | S1 | **MEDIO** | SIN VERIFICAR | NUEVO |
| 6 | S1-04 | S1 | **MEDIO** | SIN VERIFICAR | NUEVO |
| 7 | S1-05 | S1 | **MEDIO** | SIN VERIFICAR | NUEVO |
| 8 | S1-06 | S1 | **MEDIO** | SIN VERIFICAR | NUEVO |
| 9 | S1-07 | S1 | **MEDIO** | SIN VERIFICAR | CONFIRMADO_SIN_TEST |
| 10 | S2a-01 | S2a | **MEDIO** | SIN VERIFICAR | NUEVO |
| 11 | S2b-01 | S2b | **MEDIO** | CONFIRMADO | NUEVO |
| 12 | S2b-04 | S2b | **MEDIO** | CONFIRMADO | NUEVO |
| 13 | S4-01 | S2c | **MEDIO** | SIN VERIFICAR | NUEVO |
| 14 | S4-02 | S2c | **MEDIO** | SIN VERIFICAR | NUEVO |
| 15 | S4-03 | S2c | **MEDIO** | SIN VERIFICAR | NUEVO |
| 16 | S4-04 | S2c | **MEDIO** | SIN VERIFICAR | CONFIRMADO_SIN_TEST |
| 17 | S3-01 | S3 | **MEDIO** | CONFIRMADO | CAMBIO_DE_ESTADO |
| 18 | S3-02 | S3 | **MEDIO** | CONFIRMADO | NUEVO |
| 19 | S3-03 | S3 | **MEDIO** | SIN VERIFICAR | CONFIRMADO_SIN_TEST |
| 20 | S3-04 | S3 | **MEDIO** | SIN VERIFICAR | NUEVO |
| 21 | S4-03 | S4 | **MEDIO** | CONFIRMADO | CAMBIO_DE_ESTADO |
| 22 | S4-04 | S4 | **MEDIO** | CONFIRMADO | NUEVO |
| 23 | S5-01 | S5 | **MEDIO** | CONFIRMADO | NUEVO |
| 24 | S5-02 | S5 | **MEDIO** | CONFIRMADO | NUEVO |
| 25 | S5-05 | S5 | **MEDIO** | CONFIRMADO | NUEVO |
| 26 | S5-06 | S5 | **MEDIO** | CONFIRMADO | NUEVO |
| 27 | S6-01 | S6 | **MEDIO** | CONFIRMADO | NUEVO |
| 28 | S6-05 | S6 | **MEDIO** | CONFIRMADO | NUEVO |
| 29 | S7-02 | S7 | **MEDIO** | SIN VERIFICAR | NUEVO |
| 30 | S7-03 | S7 | **MEDIO** | CONFIRMADO | NUEVO |
| 31 | S7-04 | S7 | **MEDIO** | SIN VERIFICAR | NUEVO |
| 32 | S7-05 | S7 | **MEDIO** | CONFIRMADO | NUEVO |
| 33 | S7-06 | S7 | **MEDIO** | SIN VERIFICAR | NUEVO |
| 34 | S7-07 | S7 | **MEDIO** | SIN VERIFICAR | NUEVO |
| 35 | S7-08 | S7 | **MEDIO** | SIN VERIFICAR | CONFIRMADO_SIN_TEST |
| 36 | S8-01 | S8 | **MEDIO** | CONFIRMADO | CAMBIO_DE_ESTADO |
| 37 | S8-02 | S8 | **MEDIO** | PLAUSIBLE | CAMBIO_DE_ESTADO |
| 38 | S8-03 | S8 | **MEDIO** | CONFIRMADO | CAMBIO_DE_ESTADO |
| 39 | S8-04 | S8 | **MEDIO** | CONFIRMADO | NUEVO |
| 40 | S8-06 | S8 | **MEDIO** | CONFIRMADO | NUEVO |
| 41 | S8-08 | S8 | **MEDIO** | CONFIRMADO | CONFIRMADO_SIN_TEST |
| 42 | S1-08 | S1 | **BAJO** | SIN VERIFICAR | NUEVO |
| 43 | S1-09 | S1 | **BAJO** | SIN VERIFICAR | NUEVO |
| 44 | S1-10 | S1 | **BAJO** | SIN VERIFICAR | CAMBIO_DE_ESTADO |
| 45 | S2a-02 | S2a | **BAJO** | SIN VERIFICAR | NUEVO |
| 46 | S2a-03 | S2a | **BAJO** | SIN VERIFICAR | CAMBIO_DE_ESTADO |
| 47 | S2a-04 | S2a | **BAJO** | SIN VERIFICAR | NUEVO |
| 48 | S2a-05 | S2a | **BAJO** | SIN VERIFICAR | NUEVO |
| 49 | S2a-06 | S2a | **BAJO** | SIN VERIFICAR | NUEVO |
| 50 | S2b-02 | S2b | **BAJO** | CONFIRMADO | NUEVO |
| 51 | S2b-03 | S2b | **BAJO** | CONFIRMADO | NUEVO |
| 52 | S2b-05 | S2b | **BAJO** | CONFIRMADO | NUEVO |
| 53 | S2b-06 | S2b | **BAJO** | CONFIRMADO | NUEVO |
| 54 | S2b-07 | S2b | **BAJO** | CONFIRMADO | NUEVO |
| 55 | S2b-08 | S2b | **BAJO** | CONFIRMADO | CAMBIO_DE_ESTADO |
| 56 | S2b-09 | S2b | **BAJO** | CONFIRMADO | NUEVO |
| 57 | S4-05 | S2c | **BAJO** | SIN VERIFICAR | NUEVO |
| 58 | S4-06 | S2c | **BAJO** | SIN VERIFICAR | NUEVO |
| 59 | S3-05 | S3 | **BAJO** | SIN VERIFICAR | NUEVO |
| 60 | S3-06 | S3 | **BAJO** | SIN VERIFICAR | NUEVO |
| 61 | S3-07 | S3 | **BAJO** | SIN VERIFICAR | NUEVO |
| 62 | S4-02 | S4 | **BAJO** | CONFIRMADO | CAMBIO_DE_ESTADO |
| 63 | S4-05 | S4 | **BAJO** | CONFIRMADO | NUEVO |
| 64 | S4-06 | S4 | **BAJO** | PLAUSIBLE | NUEVO |
| 65 | S5-03 | S5 | **BAJO** | REFUTADO | NUEVO |
| 66 | S5-04 | S5 | **BAJO** | CONFIRMADO | CAMBIO_DE_ESTADO |
| 67 | S6-02 | S6 | **BAJO** | CONFIRMADO | NUEVO |
| 68 | S6-08 | S6 | **BAJO** | CONFIRMADO | NUEVO |
| 69 | S6-03 | S6 | **BAJO** | CONFIRMADO | CAMBIO_DE_ESTADO |
| 70 | S6-07 | S6 | **BAJO** | PLAUSIBLE | NUEVO |
| 71 | S6-04 | S6 | **BAJO** | CONFIRMADO | CONFIRMADO_SIN_TEST |
| 72 | S6-06 | S6 | **BAJO** | CONFIRMADO | CAMBIO_DE_ESTADO |
| 73 | S7-09 | S7 | **BAJO** | SIN VERIFICAR | NUEVO |
| 74 | S8-05 | S8 | **BAJO** | CONFIRMADO | NUEVO |
| 75 | S8-07 | S8 | **BAJO** | CONFIRMADO | CAMBIO_DE_ESTADO |


---

## 10. Notas de cierre

**Sobre dónde vive este documento.** El hallazgo S8-06 dice que el repositorio público ya hostea 16 documentos de auditoría que enumeran, con `archivo:línea`, cada debilidad abierta. Este reporte es el decimoséptimo. Queda commiteado en la rama `chore/auditoria-seguridad` y **no se pusheó**: mientras el repositorio siga siendo público, publicarlo entrega el mapa completo. Esa decisión es de Franco, y es la misma decisión #1 de §3.4.

**Lo que esta corrida no hizo:** cero cambios en `src/`, cero fixes, cero pruebas contra producción, cero exploits. `git status -s` sobre el worktree solo muestra `docs/`.
