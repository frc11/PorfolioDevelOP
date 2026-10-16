# 07 — Backlog de sprints

> F6.4 (PROMPT §F6.4 y ENMIENDA-01 E12). Una tarjeta por causa raíz, lista para convertirse en el prompt de un sprint. Armado por dos agentes de solo lectura (Ahora/Próximo y Después) y revisado por un crítico por bloque (run `wf_b8f7655d-c09`, `_crudo/f6c-resultado/`) sobre el registro de 571 hallazgos, los DIS, las IDEA, la poda, los congelados, `13` y `14`; el padre controló lo mecánico (ver «Controles del padre» al final). **Nada de esto está hecho:** todas las tarjetas arrancan en `Estado: abierta`. `06-ATLAS/backlog.json` se genera desde este archivo con `node scripts/auditoria/atlas/backlog.mjs`: si cambia una tarjeta, se cambia acá y se regenera.

## Cómo leer una tarjeta

- **Bloques:** **Ahora** = toda CRÍTICA y ALTA, lo que bloquea L3 en el camino del cliente y sus prerrequisitos directos · **Próximo** = lo que lleva cada herramienta a L3 · **Después** = mejoras, diseño, ideas, poda, congelados y docs.
- **Zona:** `libre` · `ZONA-FRANCO` (decisión de Franco, coordinar antes) · `requiere decisión FROZEN` (Valentino decide antes de tocar un congelado; ver `11-CONGELADOS.md`).
- **Nivel de proceso** (E12): **S** prompt corto, sin plan · **M** plan corto · **L** ritual completo (leer scope, mapear lo existente, proponer estructura).
- **Modelo · esfuerzo · ultracode** según la tabla de E12: S mecánica → Sonnet 5.5 · medium · OFF · M con spec clara → Sonnet 5.5 · high · OFF (si falla, Opus 5.5 · medium) · L ambigua, seguridad, arquitectura o multi-área → Opus 5.5 · high · OFF (ON solo si cruza muchas áreas) · visual fino, 3D o timing → Opus 5.5 · xhigh · OFF · poda masiva o migración que cruza el repo → Opus 5.5 · high · ON.
- **Worktree:** las tarjetas con el mismo nombre conviene hacerlas juntas, en un mismo worktree.
- **Trabajo restante** (métrica de E7): S = 1, M = 3, L = 8.

## Resumen

| Bloque | Tarjetas | S / M / L | Trabajo (S=1, M=3, L=8) | Con ZONA-FRANCO o coordinación con Franco | Con decisión FROZEN |
|---|---|---|---|---|---|
| Ahora | 24 | 10 / 10 / 4 | 72 | 5 | 1 |
| Próximo | 63 | 20 / 29 / 14 | 219 | 15 | 10 |
| Después | 117 | 41 / 61 / 15 | 344 | 33 | 21 |
| **Total** | **204** | | **635** | | |

**Cobertura del registro:** CRÍTICA 2/2 y ALTA 23/23 (todas en Ahora) · MEDIA 258/258 · BAJA 288/288 · FAL 33/33. Las que no tienen tarjeta están al final, con su severidad.

### Por worktree

Solo los worktrees con dos o más tarjetas; las demás van en su propio worktree.

| Worktree | Tarjetas |
|---|---|
| ahora/credenciales | B-01, B-02, B-03, B-05 |
| ahora/auth-limites | B-06, B-08, B-23, B-25, B-26, B-77 |
| ahora/chat-runtime | B-07, B-13 |
| franco/auth | B-09, B-27 |
| ahora/admin-guardia | B-10, B-28, B-29, B-72 |
| ahora/datos-sensibles | B-11, B-12 |
| ahora/portal-inicio | B-15, B-16, B-56 |
| ahora/email-mkt | B-17, B-18, B-65 |
| ahora/integraciones | B-19, B-20, B-21, B-22, B-54, B-55 |
| ahora/portal-soporte | B-24, B-41, B-57, B-76 |
| franco/leados | B-31, B-32, B-79, B-80, B-81, B-82, B-83, B-84, B-85, B-86, B-87 |
| proximo/post-lead | B-34, B-46 |
| proximo/widget | B-35, B-36, B-52, B-53 |
| proximo/chat-runtime | B-37, B-48, B-49, B-50 |
| proximo/mi-chatbot | B-42, B-62, B-63 |
| proximo/datos | B-43, B-44, B-45 |
| proximo/plan-ia | B-47, B-51, B-64 |
| proximo/admin-errores | B-58, B-73 |
| proximo/admin-chatbots | B-59, B-60, B-61 |
| proximo/catalogo-facturacion | B-66, B-67 |
| proximo/admin-proyectos | B-70, B-71, B-74, B-75 |
| wt/mecanismos | B-88, B-173, B-174 |
| wt/docs | B-89, B-90, B-171, B-172 |
| wt/datos | B-91, B-106 |
| wt/seguridad-baja | B-92, B-94, B-95 |
| wt/protegidos-auth | B-93, B-103, B-104 |
| wt/auth-borde | B-96, B-97, B-156 |
| wt/plataforma | B-98, B-162, B-163 |
| wt/widget | B-99, B-146, B-149, B-150 |
| wt/chatbot | B-100, B-120, B-121, B-122, B-125, B-147 |
| wt/protegidos | B-101, B-102, B-108, B-109, B-110, B-161 |
| wt/protegidos-schema | B-105, B-191 |
| wt/portal-cliente | B-111, B-112, B-113, B-114, B-115, B-116, B-117, B-153, B-154, B-179 |
| wt/navegacion | B-118, B-119 |
| wt/chatbot-admin | B-123, B-124, B-126, B-127, B-148 |
| wt/admin | B-128, B-129, B-130, B-131, B-132, B-133, B-155, B-180 |
| wt/franco-leados | B-134, B-135, B-136, B-137, B-138, B-139, B-140, B-141, B-142, B-143, B-169, B-185 |
| wt/motor | B-144, B-145 |
| wt/canvas-3d | B-151, B-152 |
| wt/kit-ui | B-157, B-158 |
| wt/diseno-portal | B-159, B-160, B-175, B-176, B-177, B-178, B-182, B-183, B-184, B-186 |
| wt/poda | B-164, B-165, B-166, B-167, B-168 |
| wt/sitio-publico | B-181, B-189, B-190 |
| wt/post-merge-home | B-187, B-188 |
| wt/ideas-chatbot | B-192, B-193, B-198, B-200, B-204 |
| wt/ideas-portal | B-194, B-195, B-197, B-203 |
| wt/ideas-admin | B-196, B-199, B-201, B-202 |

## Ahora

### [B-01] Renovar la credencial de Vertex e inventariar el vencimiento de cada credencial
- Objetivo: Que el chatbot de develOP y el de todos los clientes vuelvan a responder con una key nueva de Vertex y que cada credencial externa tenga vencimiento, responsable y email de aviso conocidos. · Hallazgos que cierra: [BUG-145]
- Archivos a tocar: Fuera del repo: Google Cloud → IAM → service account del chatbot → key nueva (JSON) → GOOGLE_VERTEX_CREDENTIALS_JSON en Netlify → redeploy; en local, vertex-credentials.json por worktree (GOOGLE_APPLICATION_CREDENTIALS); pasos exactos en VH-141. En docs: la tabla de credenciales (01-INVENTARIO §6.1 y su resumen en OPERACIONES.md §5 de 14-DOCS-CONSOLIDADOS) con vencimiento o 'no vence', email que recibe el aviso del proveedor y responsable por servicio (VH-134); solo nombres de variables, nunca valores. Sumar a la tabla la fila de Google AI (`CHATBOT_GOOGLE_API_KEY`) con la constancia de que la clave publicada está revocada (SEC-001); la limpieza de los docs queda en [B-92] [F7 B24] · Archivos que NO se tocan: scripts/encode-vertex-creds.js (vuelca la credencial entera por stdout, SEC-071: no usarlo); src/modules/chatbot/server/llm/providers/google.ts y cualquier archivo de código (el parseo único de la credencial, SEC-064, va en [B-121]); no pegar la key en docs, capturas ni logs.
- Zona: libre
- Tamaño: S · Riesgo: Bajo en código, alto operativo: la key no se imprime ni se commitea y la vieja se borra recién con el bot respondiendo. La prueba escribe en la base: correrla contra una base local propia y sin emails reales, nunca contra la Neon compartida ni producción. Renovar en producción activa SEC-057: hoy la credencial vencida lo enmascara (03-MEJORAS.md, SEC-057). La key nueva se carga en Netlify producción recién con [B-07] desplegado, o en el mismo ciclo con un techo temporal de conversaciones nuevas por IP; para desarrollar [B-07] alcanza la key local o la de un deploy preview [F7 B1] · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: VH-141 en verde: el widget de develop.com.ar y el de un bot de prueba responden y /api/chatbot/[slug]/health sigue en verde; la key vieja figura borrada en Google Cloud; git status y los logs no muestran la credencial. VH-134: cada fila de la tabla de credenciales tiene vencimiento (o 'no vence'), email del aviso y responsable.
- Nodo(s): lib.chatbot.llm, h3.vis-widget-develop
- Worktree: ahora/credenciales (la renovación es operativa, fuera del repo)
- Estado: abierta

### [B-02] Cargar los secrets del backup diario y que su falla avise
- Objetivo: Que el backup diario de Neon corra en verde y que una corrida fallida llegue al canal de alertas. · Hallazgos que cierra: [BUG-171]
- Archivos a tocar: Secrets de GitHub Actions DIRECT_DATABASE_URL_PROD y BACKUP_GPG_PASSPHRASE (los carga Franco); raíz:.github/workflows/db-backup.yml (paso on-failure que avise al canal de alertas, conteos mínimos de tablas críticas en el restore-test además de _prisma_migrations, comentario corregido). · Archivos que NO se tocan: raíz:.github/workflows/ci.yml; prisma/schema.prisma; cualquier script que escriba en la base.
- Zona: libre (los secrets los carga Franco: coordinar)
- Tamaño: S · Riesgo: Medio: el workflow maneja la URL directa de producción; el aviso no debe imprimir la URL ni la passphrase. Coordinar con Franco la carga de los secrets. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: VH-160: gh secret list muestra los dos secrets; la última corrida de 'DB backup' está en verde con artifact neon-prod-backup-* y restore-test en verde; una corrida forzada con un secret inválido produce el aviso en el canal sin imprimir valores.
- Nodo(s): lib.prisma
- Worktree: ahora/credenciales
- Estado: abierta

### [B-03] Sacar las contraseñas de prueba del repo y confirmar que ninguna base las conserva
- Objetivo: Que ninguna contraseña de las cuentas de prueba siga escrita en el repo público ni sirva para entrar a una base expuesta. · Hallazgos que cierra: [SEC-002]
- Archivos a tocar: README.md:29-30, STATUS.md:258-259, docs/demo-guion.md:15-16, docs/bitacora-beta.md:15 y docs/bitacora-roadmap.md (tabla de MS-8 y :10534): reemplazar los literales por referencia a variables; tests/helpers/auth.ts:21-25 (leer de entorno, como prisma/seed.ts con requireSeedPassword). Verificación VH-002 en producción y previews. · Archivos que NO se tocan: prisma/seed.ts (ya lee de entorno); prisma/schema.prisma; no reescribir el historial de git (repo público: decisión aparte, SEC-107); SEC-003 y SEC-004 van en 'Secretos y PII fuera del árbol: docs, scripts que imprimen credenciales y backups versionados' y en 'Poda de scripts sueltos y salidas generadas commiteadas (103 ALTA + 10 MEDIA)'.
- Zona: libre
- Tamaño: S · Riesgo: Bajo en código; si VH-002 encuentra una cuenta que entra, cambiar esa contraseña antes que cualquier otro sprint. La suite e2e deja de pasar hasta cargar las variables nuevas. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: git grep de los pares email/contraseña de prueba devuelve 0 en el árbol actual; tests/helpers/auth.ts falla con un mensaje claro si faltan las variables; VH-002: ningún login con esas credenciales entra en producción ni en previews.
- Nodo(s): lib.auth, lib.prisma.seeds, lib.tests, modelo.User, h1.auth-login
- Worktree: ahora/credenciales
- Estado: abierta

### [B-04] Subir next, next-auth y @auth/core a las versiones con fix
- Objetivo: Cerrar los avisos críticos de next, next-auth y @auth/core subiendo dentro del rango ya declarado. · Hallazgos que cierra: [SEC-105]
- Archivos a tocar: package.json y package-lock.json (next 16.4.x dentro de ^16.2.6; next-auth beta.32 o superior, @auth/core 0.41.3 o superior y @auth/prisma-adapter según npm audit). · Archivos que NO se tocan: src/auth.ts y src/auth.config.ts (si la versión nueva exige cambios, frenar y avisar a Franco); la validación con Zod del email del magic link que pide SEC-105 la hace 'Rate limit real en el acceso: magic link, endpoint nativo de Credentials y cambio de contraseña' (mismo archivo); los upgrades mayores (Prisma 7, zod 4) van en 'Build y stack: memoria medida y plan de upgrades por etapas'.
- Zona: libre (coordinar con Franco: cambia el runtime de auth que usa el setter)
- Tamaño: S · Riesgo: Medio: una beta nueva de next-auth puede cambiar el comportamiento de la sesión; correr tipos, invariantes y la regresión de login antes de mergear. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: npm audit --audit-level=critical sin hallazgos en next, next-auth ni @auth/core; tsc --noEmit y los check:invariant en verde; login con contraseña, magic link, impersonación y setter funcionan en un deploy preview.
- Nodo(s): lib.plataforma.package, lib.auth, h1.auth-login, lib.proxy
- Worktree: ahora/deps
- Estado: abierta

### [B-05] Sentry que recibe en producción y sin ruta de prueba pública
- Objetivo: Que Sentry reciba eventos de producción con una DSN de runtime, que un build sin DSN no pase en silencio y que /api/test-sentry deje de ser pública. · Hallazgos que cierra: [FAL-030], [SEC-093]
- Archivos a tocar: Netlify: NEXT_PUBLIC_SENTRY_DSN con scope Builds+Functions y SENTRY_DSN de runtime; src/instrumentation.ts e src/instrumentation-client.ts (el server lee SENTRY_DSN, el navegador NEXT_PUBLIC_SENTRY_DSN); chequeo de build que falle o avise si falta la DSN en producción; decidir Replay (agregar la integración o quitar la opción); src/app/api/test-sentry/route.ts (exigir SUPER_ADMIN y NODE_ENV distinto de production; si se prefiere borrarla, se adelanta POD-363); corregir los docs que piden SENTRY_DSN para la config raíz. · Archivos que NO se tocan: instrumentation.ts raíz, sentry.server.config.ts y sentry.edge.config.ts (código muerto: su poda es POD-360 a POD-362 en 'Plataforma: configs tipadas, dependencias reales, Sentry sin duplicados y recursos propios'); src/proxy.ts; src/auth.ts; los catch de integraciones (van en 'Integraciones: distinguir error de vacío, reportar a Sentry y no cachear fallas'); ningún valor de credencial en docs ni capturas.
- Zona: libre
- Tamaño: M · Riesgo: Medio: un cambio en instrumentation puede apagar Sentry entero sin aviso; verificar con un evento real en un deploy preview antes de mergear. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-135: un evento de prueba llega a Sentry desde un deploy preview y desde producción; un build de producción sin la DSN falla o deja el aviso; en producción /api/test-sentry responde 401 o 404 a un anónimo sin generar evento.
- Nodo(s): int.sentry, h6
- Worktree: ahora/credenciales
- Estado: abierta

### [B-06] Un solo helper de IP confiable de la plataforma
- Objetivo: Que todos los límites por IP (auth, recupero, contacto y chat) usen la IP que pone Netlify y no el primer valor de X-Forwarded-For. · Hallazgos que cierra: [SEC-025]
- Archivos a tocar: src/lib/security/ (helper nuevo getClientIp: x-nf-client-connection-ip con fallback local); src/lib/security/auth-rate-limit.ts (getClientIpHash); src/app/login/actions.ts; src/app/forgot-password/actions.ts; src/app/reset-password/actions.ts; src/lib/actions/contact.ts; src/modules/chatbot/server/chat/requestSchema.ts:110 (extractor de IP del chat); invariante nuevo con XFF falsificado. · Archivos que NO se tocan: src/auth.ts (FROZEN + ZONA-FRANCO); src/proxy.ts; src/lib/rate-limit/limiter.ts (solo recibe la clave); src/lib/audit-log.ts (usar este helper para la IP de auditoría es SEC-026, en 'audit-log protegido: IP confiable, auditoría que no se pierde y organización en cada evento').
- Zona: libre
- Tamaño: S · Riesgo: Medio: si el header de Netlify no llega en algún runtime, todos los visitantes comparten clave y se bloquean entre sí; confirmar con VH-015 en un deploy preview antes de mergear. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Invariante nuevo: con X-Forwarded-For rotado y la misma IP de plataforma, el sexto pedido a forgot-password queda limitado; VH-015 en verde en un deploy preview; git grep de lecturas directas de x-forwarded-for fuera del helper = 0 (salvo audit-log.ts, que cambia en su propia tarjeta).
- Nodo(s): lib.rate-limit, lib.security, h1.auth-recupero, h6.vis-contacto
- Worktree: ahora/auth-limites
- Estado: abierta

### [B-07] Techo de gasto del chat público: IP confiable, cupo por intercambio real y abortos que cuentan
- Objetivo: Que un anónimo no pueda agotar el cupo mensual de un bot ni el gasto de Vertex: límite por IP confiable, cupo cobrado por intercambio real, abortos que cuentan y techo de salida por turno. · Hallazgos que cierra: [SEC-057], [SEC-074], [SEC-061], [BUG-091], [BUG-109], [BUG-092]
- Archivos a tocar: src/modules/chatbot/server/chat/handleChatRequest.ts (techo de conversaciones nuevas por IP/hora y por bot/hora; maxOutputTokens; AbortSignal de pared que siga el camino del watchdog; techo de llamadas LLM por conversación y por org/día; alerta cuando un bot consume su cupo a una velocidad anómala); src/app/api/chatbot/[slug]/chat/route.ts (rate limit por la IP del helper antes de validateOrigin; un evento de bloqueo agregado por origin y ventana); src/modules/chatbot/server/quota/checker.ts (gate de cupo solo en conversación nueva; cobrar al primer turno respondido); src/modules/chatbot/server/chat/reconcile.ts y persistTurn.ts (no devolver cupo en stream_abort, solo en stream_error; sumar tokens y costo del turno vacío); src/lib/rate-limit/presets.ts. · Archivos que NO se tocan: prisma/schema.prisma (si hiciera falta columna nueva: decisión FROZEN aparte); el extractor de IP de requestSchema.ts (lo cambia 'Un solo helper de IP confiable de la plataforma'); public/widget.js y el embed (la parte 3 de SEC-057, allowedDomains, va en 'Widget embebido: el host informa origen y ruta, y el servidor valida allowedDomains'); la contabilidad del watchdog en onFinish (BUG-094) va en [B-120] y [B-121]; src/lib/security/validate-origin.ts salvo el orden de llamada.
- Zona: libre
- Tamaño: L · Riesgo: Alto: es el camino caliente del chat de todos los clientes; un error deja bots sin responder o cobra de más. Probar con el bot de QA en base local (VH-065, VH-105) y medir el p95 antes y después. La parte (3) de SEC-057 queda en Próximo: no es el freno de costo porque Origin se forja fuera del navegador. · Prerrequisitos: [B-06], [B-01]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Con el preset nuevo de conversaciones nuevas por IP y por hora = N (fijado en presets.ts y anotado en el PR): en el escenario de VH-065, el pedido N+1 con un sessionId nuevo responde 429 y conversationsCount no pasa de N; en el de VH-105, tras 10 cortes con -m 1 el contador del mes sube 10 y el tope de 40 cuenta los intentos (las dos VH describen hoy el defecto: su resultado esperado se invierte); una conversación en curso sigue respondiendo cuando otra llena el cupo; streamText recibe maxOutputTokens; un turno vacío deja tokens y costo en QuotaUsage; los 403 de origen no escriben un ChatbotEvent por pedido. [F7 B4]
- Nodo(s): h3.vis-api-chatbot, h3.vis-widget-cliente, lib.security, lib.rate-limit, lib.chatbot.chat, lib.chatbot.quota, lib.chatbot.llm, modelo.QuotaUsage, modelo.Conversation, lib.chatbot.conversation, modelo.ChatbotEvent, h3.adm-chatbots
- Worktree: ahora/chat-runtime
- Estado: abierta

### [B-08] Rate limit real en el acceso: magic link, endpoint nativo de Credentials y cambio de contraseña
- Objetivo: Que pedir magic links, probar contraseñas o cambiarlas tenga un límite persistente por IP y por cuenta, sin oráculo de existencia de cuentas. · Hallazgos que cierra: [SEC-005], [SEC-007], [SEC-015], [SEC-009] (parte libre), [UX-001]
- Archivos a tocar: src/lib/rate-limit/presets.ts (magicLinkPerIp/PerEmail, loginPerIp/PerEmail, passwordChangePerUser); src/app/login/actions.ts (applyAuthRateLimit en magicLinkAction y loginAction en lugar del Map en memoria; email validado con Zod antes de signIn, como pide SEC-105; misma respuesta exista o no la cuenta, también ante AccessDenied); src/app/api/auth/[...nextauth]/route.ts (envolver handlers.POST para /signin/resend y /callback/credentials); src/app/cambiar-password/actions.ts y src/lib/actions/profile.ts (límite por userId y mismo costo de bcrypt); src/app/forgot-password/actions.ts (no esperar el envío en la respuesta); src/app/login/page.tsx (éxito del magic link con copy anti-enumeración, sin 'impreso en la consola del servidor'). · Archivos que NO se tocan: src/auth.ts (FROZEN + ZONA-FRANCO: el bcrypt dummy y el chequeo de emailVerified de SEC-009 van en 'Magic link y errores de auth en auth.ts: envío que falla, link que no gasta un escáner, Google y Sentry'); mirar la URL que devuelve signIn (BUG-008) va en 'Login y contraseñas: tope único, éxito real del magic link, destino conservado y cambio forzado con salida'; src/proxy.ts; src/lib/rate-limit/limiter.ts salvo bug.
- Zona: libre
- Tamaño: M · Riesgo: Alto: un límite mal calibrado deja afuera a clientes reales y un wrapper de handlers.POST mal hecho rompe el login de todos (incluido el setter); probar contraseña, magic link y Google antes de mergear. · Prerrequisitos: [B-06]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Seis pedidos seguidos de magic link para el mismo email, por la action y por POST /api/auth/signin/resend, no mandan el sexto mail y la respuesta es idéntica a la de un email inexistente; VH-007: los intentos fallidos por /api/auth/callback/credentials quedan limitados aunque cambie la lambda; cambiarPasswordAction y updatePasswordAction limitan por userId; VH-158: un email con '@' homoglifo se rechaza antes de signIn; la pantalla de éxito ya no menciona la consola.
- Nodo(s): h1.auth-login.magic-link, int.brevo, lib.rate-limit, lib.auth, h1.auth-login.login-password, modelo.User, h1.auth-cambio.cambio-forzado, h2.cli-cuenta.cambiar-password, h1.auth-recupero.solicitar-enlace
- Worktree: ahora/auth-limites
- Estado: abierta

### [B-09] Sesión que no se revive: sessionVersion en 'update', maxAge alineado y falla de base sin rebote
- Objetivo: Que una sesión invalidada no pueda revivirse con POST /api/auth/session, que la cookie dure lo que dice la política y que una caída de la base muestre un error en vez de un bucle de redirecciones. · Hallazgos que cierra: [SEC-006], [BUG-001], [SEC-010], [BUG-006]
- Archivos a tocar: src/auth.ts (callback jwt: comparar sessionVersion también con trigger 'update'; try/catch de getUserAccessState que marque token.error='db_unavailable' y reporte a Sentry), decisión de Valentino y Franco; zona libre: src/auth.config.ts (session.maxAge y updateAge iguales a auth.ts, constante compartida junto a auth-cookies.ts); src/proxy.ts (no rebotar /login al portal solo por la cookie); src/app/(protected)/dashboard/layout.tsx y admin/layout.tsx (sesión nula con cookie → ruta que hace signOut; db_unavailable → error.tsx con reintento); src/app/cambiar-password/actions.ts y src/app/reset-password/actions.ts (emitir el token nuevo sin saltear el chequeo). · Archivos que NO se tocan: prisma/schema.prisma; src/lib/auth-guards.ts (FROZEN-inferido); src/app/api/auth/[...nextauth]/route.ts (lo toca la tarjeta de rate limit); src/app/(protected)/setter/layout.tsx sin acuerdo con Franco.
- Zona: ZONA-FRANCO; requiere decisión FROZEN (src/auth.ts)
- Tamaño: L · Riesgo: Alto: el callback jwt corre en cada request; un error cierra todas las sesiones o deja a todos afuera, setter incluido. Requiere la prueba multi-dispositivo de PLAN-006. Depende de [B-04] para subir next-auth antes de editar el callback jwt y no probar dos veces [F7 B19] · Prerrequisitos: [B-04]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-005: tras cambiar la contraseña en el navegador A, un POST /api/auth/session desde B con la cookie vieja no devuelve sesión; VH-006: sin ERR_TOO_MANY_REDIRECTS tras invalidar en otro navegador o reenviar credenciales; VH-009: la cookie re-firmada por el proxy vence en el plazo de la política (8 h); VH-018: con la base caída el portal muestra la pantalla de error con reintento y la cookie no se borra.
- Nodo(s): h1.auth-login.sesion-jwt, h1.auth-cambio.cambio-forzado, h1.auth-recupero.restablecer-password, lib.auth, modelo.User, h1.auth-login.ruteo-por-rol, lib.proxy, h2.cli-shell, h4.adm-shell, h1.auth-cambio, lib.prisma, int.sentry
- Worktree: franco/auth
- Estado: abierta

### [B-10] Guardia SUPER_ADMIN al lado del dato en /admin (páginas, actions y rutas)
- Objetivo: Que cada página, server action y route handler del admin verifique sesión fresca y rol SUPER_ADMIN junto al dato, no solo en el layout y el proxy. · Hallazgos que cierra: [SEC-023], [SEC-065], [SEC-060], [SEC-084], [SEC-063] [F7 B23]
- Archivos a tocar: Helper nuevo requireSuperAdminPage() cacheado (auth() fresco + rol; redirect o notFound) en un archivo nuevo de src/lib/, llamado al inicio de cada page.tsx de src/app/(protected)/admin, chatbots e Inteligencia incluidas (las de admin/leados y fg2-lab solo con Franco); invariante que falle si una page de /admin no lo llama; src/modules/chatbot/server/admin/preflightChecks.ts (requireSuperAdmin + Zod en runPreflightChecks, canActivate fuera del archivo 'use server'); src/app/api/admin/chatbot/test-prompt/route.ts y demo-chat/[slug]/route.ts (401/403 JSON sin throw); src/actions/agency-actions.ts (Zod con .max, url http/https, organizationId existente y no archivada, ActionResult en vez de throw, logAdminAction). · Archivos que NO se tocan: src/lib/auth-guards.ts (FROZEN-inferido: el helper va en archivo nuevo); src/proxy.ts y src/app/(protected)/admin/layout.tsx (quedan como UX); src/app/(protected)/admin/leados/* y fg2-lab (ZONA-FRANCO, solo con Franco); src/auth.ts; VaultManager.tsx y ProjectManager.tsx (mostrar el error que ahora devuelve agency-actions va en 'Admin: errores esperados como resultado tipado, no throw'); el alcance y el stream de actividad de Inteligencia (DEU-019, BUG-078) van en [B-124], cuyo guard de página (SEC-063) queda cubierto por este helper.
- Zona: libre (admin/leados y fg2-lab coordinados con Franco)
- Tamaño: L · Riesgo: Medio: unas 34 páginas; un redirect mal puesto rompe la navegación del admin o duplica consultas. El invariante evita regresiones. · Prerrequisitos: ninguno
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-013: con un token invalidado o degradado, una navegación RSC a /admin/clients no devuelve datos; VH-073: runPreflightChecks sin sesión devuelve error; VH-092: test-prompt y demo-chat sin sesión responden 401 sin evento de Sentry; agency-actions rechaza un organizationId inexistente o archivado; el invariante nuevo pasa y falla si se quita la llamada de una page.
- Nodo(s): h4.adm-shell, h4.adm-dashboard, h4.adm-equipo, h4.adm-referidos, h4.adm-proyectos, h4.adm-leads, h4.adm-mensajes, h4.adm-novedades, h3.adm-actividad, h5.adm-revision-demos, h5.adm-fg2lab, lib.proxy, lib.auth, h3.adm-chatbots.activar-bot-preflight, lib.chatbot.admin, lib.isolation, modelo.BotConfig, h3.adm-chatbots, h3.adm-chatbots.kb-y-sandbox, int.sentry, h4.adm-clientes, h4.adm-clientes.boveda-alta-activo, h4.adm-clientes.tarea-para-aprobacion, lib.actions, modelo.ClientAsset, modelo.Task, modelo.AdminAuditLog
- Worktree: ahora/admin-guardia
- Estado: abierta

### [B-11] Mi Chatbot: select acotado y org resuelta con resolveOrgId
- Objetivo: Que /dashboard/chatbot no mande al navegador tokens, API keys ni notas internas y que resuelva la org igual que el resto del portal. · Hallazgos que cierra: [SEC-037], [BUG-022]
- Archivos a tocar: src/modules/chatbot/server/admin/getClientSession.ts (org desde resolveOrgId(); select acotado de org y bot con lo que usan las páginas); src/app/(protected)/dashboard/chatbot/page.tsx y leads/page.tsx; src/modules/chatbot/components/dashboard/ChatbotOverview.tsx (recibe botName y lo que muestra, no la fila completa); invariante que prohíba tipos Prisma completos en props de client components del chatbot y orgMember.findFirst sin orderBy como resolución de tenant. · Archivos que NO se tocan: src/lib/preview.ts (solo se consume); prisma/schema.prisma; src/lib/isolation/*; las columnas de Conversation que viajan al navegador y los tokens y costo de la tabla (SEC-069) van en 'Mi Chatbot: DTOs mínimos según el plan y caché por organización'.
- Zona: libre
- Tamaño: S · Riesgo: Bajo: cambio de lectura; cuidar que la vista previa de soporte siga mostrando el bot del cliente previsualizado. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-035: el payload RSC de /dashboard/chatbot no contiene tokens de GBP ni Tiendanube, la API key de Cal.com ni las notas internas; VH-038: en vista previa de soporte se ve el bot del cliente previsualizado; el invariante nuevo pasa y falla con un tipo Prisma completo en props.
- Nodo(s): h3.cli-chatbot, lib.chatbot.admin, modelo.Organization, modelo.BotConfig, modelo.QuotaUsage, lib.chatbot, h1.auth-impersonacion, modelo.OrgMember, lib.preview, lib.isolation
- Worktree: ahora/datos-sensibles
- Estado: abierta

### [B-12] Cifrar en reposo las credenciales de terceros y dejar de prometer seguridad inexistente en la Bóveda
- Objetivo: Que tokens OAuth de Google Business y Tiendanube, la API key de Cal.com, el token de Telegram y las credenciales de la Bóveda se guarden cifrados, y que la Bóveda solo muestre lo que es cierto. · Hallazgos que cierra: [SEC-036], [FAL-009]
- Archivos a tocar: Write-paths con src/lib/crypto/credential-cipher.ts o secret-box.ts: src/app/api/auth/google-business/callback/route.ts, callback de Tiendanube, settings de Telegram, carga de Cal.com y src/actions/agency-actions.ts (assets de la Bóveda); lectura por src/lib/crypto/resolve-credential.ts (ya tolera ambos formatos); script de backfill idempotente con dry-run (portar 9fc616c4); src/app/(protected)/dashboard/cuenta/boveda/page.tsx y src/components/dashboard/VaultRevealButton.tsx (sin sello AES-256, sin 'Registro de integridad y accesos' ni 'Monitoreo activo' hasta que existan). Los lectores de cada credencial: un helper `readCredential()` en `src/lib/crypto` que descifra si el valor está cifrado y si no lo devuelve igual, usado en `google-business-profile.ts:56-90` (y la escritura del refresh, que cifra), `tiendanube.ts:55-58`, `cal-com.ts:27-29` y `telegram.ts:41-48`; sin eso, después del backfill esos módulos mandan el texto cifrado como token [F7 B0] · Archivos que NO se tocan: prisma/schema.prisma y migraciones (el cifrado no cambia columnas); src/lib/crypto/* salvo bug; rotación de AUTH_SECRET, CRM_SECRET_KEY o MOTOR_CHANNEL_SECRET_KEY (sprint aparte); el descifrado en el render y el 'revelar' sin auditoría de la Bóveda del admin (SEC-085) van en 'audit-log protegido: IP confiable, auditoría que no se pierde y organización en cada evento'.
- Zona: libre
- Tamaño: M · Riesgo: Alto: un backfill mal hecho deja credenciales ilegibles y corta GBP, Tiendanube y Cal.com de todos los clientes; correr primero contra una copia, con dry-run y conteo de filas, y con backup verificado. · Prerrequisitos: [B-02]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-031: después del backfill, 0 credenciales en claro en Organization, AgencySettings y ClientAsset (consulta de solo lectura por el prefijo del formato cifrado); en una org de prueba GBP, Tiendanube y Cal.com siguen leyendo; una credencial nueva se guarda cifrada; la Bóveda muestra 'AES-256' solo si VH-031 da 0 credenciales en claro, y no muestra 'Registro de integridad y accesos' ni 'Monitoreo activo' hasta SEC-085 (FAL-009 es decisión de Valentino: ocultar o implementar). [F7 B18]
- Nodo(s): modelo.Organization, modelo.AgencySettings, modelo.ClientAsset, int.gbp, int.tiendanube, int.cal-com, int.telegram, h2.cli-resenas, h2.cli-tienda, h2.cli-agenda, h2.cli-cuenta, lib.crypto, h2.cli-cuenta.boveda, h4.adm-clientes, lib.actions, h2.cli-cuenta.boveda-solicitar-documento, h4.adm-clientes.boveda-alta-activo, h4.adm-clientes.boveda-carga
- Worktree: ahora/datos-sensibles
- Estado: abierta

### [B-13] Que una caída del proveedor de IA se vea: health real, evento de error y derivación al visitante
- Objetivo: Que una caída o vencimiento del proveedor de IA quede registrada, ponga el health en 'Problema', se le muestre al cliente y derive al visitante a WhatsApp, sin burbujas vacías en el sandbox y sin que el health público exponga el entorno. · Hallazgos que cierra: [BUG-063], [UX-025], [BUG-074], [SEC-059]
- Archivos a tocar: src/modules/chatbot/server/chat/handleChatRequest.ts (ChatbotEvent ERROR chat.provider_error en onError); src/modules/chatbot/server/health/checkHealth.ts y buildHealthVerdict.ts (llamada real mínima, cacheada y con techo, o tasa de errores reciente; 'Problema' si hubo fallos del proveedor y cero respuestas); src/app/api/chatbot/[slug]/health/route.ts (el público devuelve solo {ok} y tiene rate limit; el detalle queda en /admin/chatbot/health); src/instrumentation.ts (no descartar RESOURCE_EXHAUSTED, bajarle el nivel); src/modules/chatbot/hooks/useChatbot.ts y components/chat/DegradedBanner.tsx (desde la segunda falla de proveedor, variante con whatsappNumber y copy honesto); Mi Chatbot del cliente (estado 'tu bot no está respondiendo' cuando hubo fallos del proveedor y cero respuestas); src/app/api/admin/chatbot/test-prompt/route.ts y components/admin/kb/TestPromptSandbox.tsx (onError con marcador visible y el historial de la prueba). · Archivos que NO se tocan: prisma/schema.prisma; el cupo y el gasto (van en 'Techo de gasto del chat público: IP confiable, cupo por intercambio real y abortos que cuentan'); el registro único de modelos (TEC-003) va en 'El plan y un registro único de modelos como fuente de cupo, modelo y funciones de IA'; el título de la tarjeta de degradado sin número (UX-026) va en [B-149] y [B-150]; el texto del reporte semanal con cero conversaciones (UX-033) va en [B-120] y [B-121]; src/proxy.ts salvo el matcher.
- Zona: libre
- Tamaño: L · Riesgo: Medio: un health con llamada real cuesta tokens y puede dar falsas alarmas; cachearlo y ponerle techo. Comparte handleChatRequest.ts con la tarjeta de gasto: mismo worktree, después de ella. · Prerrequisitos: [B-01], [B-05], [B-07]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-066 y VH-080 (control positivo E10) con una credencial inválida en un entorno de prueba: queda un ChatbotEvent ERROR, /admin/chatbot/health dice 'Problema', el cliente ve en Mi Chatbot que su bot no responde, el visitante ve la derivación a WhatsApp desde el segundo intento y el sandbox muestra el error; VH-074 en verde; el health público devuelve solo {ok} y limita pedidos en serie; un RESOURCE_EXHAUSTED llega a Sentry con nivel bajo.
- Nodo(s): h3.adm-health, h3.vis-api-chatbot, h3.cli-chatbot, lib.chatbot.llm, int.sentry, lib.chatbot.health, lib.chatbot.chat, modelo.ChatbotEvent, h3.vis-widget-develop, h3.adm-health.latencia-p50-p95, h3.cli-chatbot.resumen, h3.vis-widget-cliente, lib.chatbot.admin, lib.chatbot.logging, h3.vis-widget-cliente.conversar, lib.chatbot.hooks, h3.adm-chatbots.probar-prompt, h3.vis-api-chatbot.health-publico, lib.security, lib.rate-limit
- Worktree: ahora/chat-runtime
- Estado: abierta

### [B-14] Crons con disparador real en Netlify (y que solo los invoque el scheduler)
- Objetivo: Que el reporte ejecutivo, el brief IA, el detector de incidencias de bots, las alertas de churn y vencimientos y el follow-up de LeadOS corran en Netlify y que nadie más pueda dispararlos. · Hallazgos que cierra: [BUG-047], [FAL-016], [FAL-026], [SEC-099], [UX-049]
- Archivos a tocar: netlify/functions/ (regenerate-briefs-cron.ts, send-executive-reports-cron.ts, detect-bot-issues-cron.ts, alerts-cron.ts y os-follow-up-cron.ts con el molde de send-weekly-reports-cron.ts); netlify.toml (schedules); las functions programadas, nuevas y existentes, chequean el header de invocación programada o pasan por la ruta con CRON_SECRET; deduplicación por org en src/app/api/cron/alerts/route.ts antes de activarlo; src/app/(protected)/admin/settings/alerts/AlertSettingsClient.tsx y settings/reports enlazadas desde /admin/settings y con la última corrida real leída de la base; AGENTS.md (textos que dan a vercel.json como fuente). El disparador de os-follow-up se activa después de [B-81] (BUG-163: el digest sin tope fallaría todos los días) y con Franco; hasta entonces la función queda sin schedule [F7 B10] · Archivos que NO se tocan: src/app/api/cron/os-follow-up/route.ts (ZONA-FRANCO: solo se agenda su disparador, coordinado con Franco); src/lib/alerts.ts (FROZEN-inferido; sus fechas en UTC, BUG-190, van en [B-110]); vercel.json (borrarlo es POD-084 en 'Plataforma: configs tipadas, dependencias reales, Sentry sin duplicados y recursos propios'); la lógica de cada cron salvo lo indicado. Al enlazar settings/alerts y settings/reports, POD-081 y POD-082 de 'Poda del admin: actions sin llamador, rutas huérfanas y catálogos copiados' dejan de aplicar.
- Zona: libre (el disparador de os-follow-up, coordinado con Franco)
- Tamaño: M · Riesgo: Medio: crons que nunca corrieron mandan mails, Telegram y llamadas a Vertex reales al activarse; probar primero en un deploy preview contra base de prueba y con dedupe. · Prerrequisitos: [B-01]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-055, VH-067 y VH-127: cada cron figura en Netlify → Functions con su schedule y una corrida registrada; VH-140: un pedido anónimo por URL a las functions programadas no ejecuta nada; las pantallas de alertas y reportes se llegan desde /admin/settings y muestran la última corrida real; los toggles de churn y vencimientos producen alertas sin duplicados por org.
- Nodo(s): int.cron.regenerate-briefs, int.cron.send-executive-reports, h2.cli-inicio.resumen-ia, h2.cli-reportes-email, h2.cli-reportes-email.reporte-semanal, int.brevo, modelo.WeeklyReportLog, lib.leados, h4.adm-leads, h5.set-dia, int.telegram, h4.adm-leads.digest-follow-ups-telegram, int.cron.detect-bot-issues, h4.adm-alertas, h3.adm-health, lib.chatbot.admin, modelo.BotAlert, h4.adm-alertas.detector-incidencias, h4.adm-alertas.deteccion-automatica, int.cron.alerts, h4.adm-config, lib.chatbot.llm, h4.adm-alertas.churn-y-vencimientos, h4.adm-config.datos-y-alertas, lib.alerts, int.cron.generate-insights, int.cron.send-weekly-reports, int.cron.cleanup-old-events, h4.adm-config.reportes-semanales
- Worktree: ahora/crons
- Estado: abierta

### [B-15] Una sola definición de lead del cliente, por organización
- Objetivo: Que Inicio, Health Score, reporte semanal, brief IA, PDF mensual y recomendaciones cuenten solo los leads de la org con una única definición de 'lead del negocio'. · Hallazgos que cierra: [SEC-048], [BUG-042]
- Archivos a tocar: src/lib/dashboard/week-results.ts, src/lib/health-score.ts, src/components/dashboard/home/WeekResultsGrid.tsx, src/lib/reports/executive-weekly/build.ts y src/lib/ai/executive-brief.ts (dejar de usar ContactSubmission; contar ChatbotLead vía forOrg(orgId) o mostrar '—'); helper único de lead del negocio (el notDq de src/lib/dashboard/home-metrics.ts) usado por src/lib/reports/client-monthly/get-client-monthly-report-data.ts, src/modules/chatbot/server/reports/buildWeeklyReport.ts, analysis/getMonthlyAnalysisForOrg.ts y las recomendaciones; invariante que falle si lib/dashboard, lib/health-score o lib/reports consultan modelos sin organizationId. · Archivos que NO se tocan: prisma/schema.prisma (atribuir ContactSubmission a una org exige organizationId: decisión FROZEN aparte); src/lib/isolation/*; src/modules/chatbot/server/scoring/dqFilter.ts (que excludeDqWhere conserve los NULL es BUG-101, en 'Leads del chatbot en el portal: intención legible, DQ sin perder NULL, copiar y exportar honestos'; los consumidores migrados usan el helper único); visitas en 0 y ventanas en milisegundos de WeekResultsGrid (BUG-051) van en [B-116].
- Zona: libre
- Tamaño: M · Riesgo: Medio: los números que ve el cliente cambian (bajan); avisar antes del próximo reporte semanal. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-051: el número de leads de cada org coincide con el count de sus ChatbotLead no descalificados del período y no cambia al enviar un formulario en /contact; PDF, semanal e Inicio dan el mismo total para el mismo período; ningún pedido de upsell de otro cliente cuenta como lead; el invariante nuevo pasa. [F7 B20]
- Nodo(s): h2.cli-inicio, h2.cli-inicio.resultados-semana, h2.cli-reportes-email, lib.chatbot.llm, modelo.ContactSubmission, h2.cli-inicio.resultados-de-la-semana, h2.cli-inicio.health-score, lib.health-score, h2.cli-inicio.resumen-ia, h2.cli-reportes-email.reporte-semanal, modelo.ExecutiveBriefSnapshot, h2.cli-resultados.informe-mensual-pdf, modelo.ChatbotLead, lib.chatbot.scoring, h2.cli-inicio.ideas-para-crecer
- Worktree: ahora/portal-inicio
- Estado: abierta

### [B-16] Onboarding /bienvenida: decidir su destino y que el cliente no pueda fijar la propiedad de GA4
- Objetivo: Decidir si /bienvenida se borra o se vuelve el primer paso real del cliente y, en ambos casos, que el cliente no pueda fijar analyticsPropertyId ni leer el GA4 de otro con la service account de develOP. · Hallazgos que cierra: [SEC-045], [BUG-035], [DEU-023]
- Archivos a tocar: src/app/bienvenida/_actions/complete-onboarding.ts (no escribir analyticsPropertyId; bloquear la re-ejecución de un onboarding completado; .max() en los campos); src/app/bienvenida/_components/Step2Conexiones.tsx (no pedir el ID de medición G-XXXX). Si se decide borrar: src/app/bienvenida/*, src/lib/onboarding/core.ts y los redirects de src/proxy.ts, src/app/login/actions.ts:101-107 y src/app/(protected)/dashboard/layout.tsx:123-129. · Archivos que NO se tocan: src/auth.ts:73 (FROZEN + ZONA-FRANCO: si el redirect de onboarding vive ahí, coordinar con Franco); src/lib/analytics.ts; la asignación de GA4 por develOP va en 'Ficha del cliente: sección Integraciones (Cal.com, GA4, Google Business, Place ID)'; el rate limit del onboarding, si sobrevive, va en 'Entradas del portal acotadas: Zod con .max(), rate limit por usuario y texto neutralizado hacia Slack'.
- Zona: libre (decisión de Valentino sobre el destino de /bienvenida)
- Tamaño: M · Riesgo: Medio: borrar /bienvenida toca redirects de login y del portal; un error deja a clientes nuevos en bucle. · Prerrequisitos: ninguno
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: La decisión queda escrita; VH-048: un cliente no puede guardar el analyticsPropertyId de otra org desde ningún formulario (la action lo ignora o ya no existe); re-ejecutar completeOnboarding con el onboarding completo no cambia nada; si se borró, git grep de /bienvenida = 0 y un alta nueva entra directo a /dashboard.
- Nodo(s): h2.cli-bienvenida, h2.cli-resultados, int.ga4, modelo.Organization, h2.cli-bienvenida.wizard-3-pasos, lib.proxy, lib.onboarding, modelo.ClientBrandProfile
- Worktree: ahora/portal-inicio
- Estado: abierta

### [B-17] Email Marketing alcanzable y seguro: slug único y actions con gate, Zod y rate limit
- Objetivo: Que un cliente que contrató Email Marketing Pro pueda entrar al módulo y que sus tres server actions verifiquen el módulo contratado, validen con Zod y tengan rate limit. · Hallazgos que cierra: [BUG-012], [SEC-044]
- Archivos a tocar: src/lib/data/premium-modules.ts (constante única slug → ruta derivada de PREMIUM_MODULES_CATALOG); src/app/(protected)/dashboard/modules/email-marketing/layout.tsx; src/components/dashboard/SidebarNav.tsx; src/app/(protected)/dashboard/modules/email-marketing/_actions.ts (isModuleActive con el slug real; Zod con .max(); fromEmail contra remitentes verificados de la org o el dominio de develOP; tope de filas y bytes del CSV; checkRateLimit por org); src/lib/rate-limit/presets.ts (preset nuevo); invariante que compare los slugs usados en isModuleActive y SidebarNav contra el catálogo. · Archivos que NO se tocan: prisma/seeds/sync-premium-modules.ts y prisma/backups/* (revisar los slugs en la base con una consulta de solo lectura; mover activaciones legacy en un script aparte con dry-run); src/lib/integrations/brevo.ts salvo lo necesario; las rutas de baja (van en 'Bajas de email que se respetan: Brevo, tenant correcto y confirmación por POST').
- Zona: libre
- Tamaño: M · Riesgo: Medio: si hay activaciones con el slug viejo, el cambio las deja afuera; consultar premium_module y organization_module antes. Evaluar subcuentas Brevo por cliente como decisión aparte. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-027: un cliente con email-marketing-pro activo entra al módulo y lo ve en el sidebar; uno sin el módulo recibe el gate también al llamar las actions; VH-043: una campaña con remitente ajeno se rechaza con mensaje claro; un CSV sobre el tope se rechaza; el invariante de slugs pasa.
- Nodo(s): h2.cli-email-mkt, h2.cli-email-mkt.acceso-al-modulo, h2.cli-servicios, lib.data, modelo.PremiumModule, modelo.OrganizationModule, h2.cli-shell, h2.cli-shell.navegacion-sidebar, lib.premium-modules, h2.cli-email-mkt.crear-y-enviar-campana, h2.cli-email-mkt.importar-contactos, int.brevo, lib.rate-limit, modelo.EmailCampaign, modelo.EmailContact
- Worktree: ahora/email-mkt
- Estado: abierta

### [B-18] Bajas de email que se respetan: Brevo, tenant correcto y confirmación por POST
- Objetivo: Que quien se da de baja de una campaña o del reporte semanal deje de recibir de verdad, solo en la org correcta, y que un escáner de enlaces no dé de baja a nadie. · Hallazgos que cierra: [BUG-021], [SEC-039], [BUG-061]
- Archivos a tocar: src/app/api/email/optout/[contactId]/route.ts y src/app/api/email/unsubscribe-executive/route.ts (GET muestra 'Confirmar baja', POST ejecuta; token firmado con organizationId y email); src/app/(protected)/dashboard/modules/email-marketing/_actions.ts (saltear optedOut en importación y envío); src/lib/integrations/brevo.ts (sacar o bloquear el contacto en la lista de la org; no guardar CONTACT_ID ni OPTOUT_TOKEN en atributos globales); src/lib/email/templates/executive-weekly.ts (List-Unsubscribe-Post). · Archivos que NO se tocan: prisma/schema.prisma (guardar fecha y origen de la baja sería decisión FROZEN aparte); src/lib/email/unsubscribe-token.ts salvo extenderlo.
- Zona: libre
- Tamaño: M · Riesgo: Medio: los links ya enviados con el formato viejo deben seguir funcionando durante una ventana; confirmar el modelo de contactos de Brevo con el caso de prueba. · Prerrequisitos: [B-17]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-036: tras darse de baja, la campaña siguiente no le llega (verificado en Brevo) y un reimport no lo vuelve a sumar; VH-037: la baja de un email presente en dos orgs solo afecta a la org del link; VH-063: un GET a los links de baja no cambia nada en la base y el POST sí.
- Nodo(s): h2.cli-email-mkt, h6.vis-optout, int.brevo, modelo.EmailContact, modelo.EmailCampaign, h2.cli-email-mkt.baja-de-contactos, h2.cli-reportes-email.reporte-semanal, h2.cli-reportes-email.preferencias-reporte, modelo.Organization, h2.cli-reportes-email
- Worktree: ahora/email-mkt
- Estado: abierta

### [B-19] Motor de reseñas: responder solo en la sucursal de la org y decidir la cuenta de Google de cada org
- Objetivo: Que el motor de reseñas solo lea y publique en la sucursal de Google asignada a la org, con la cuenta de conexión decidida, Zod y rate limit en sus actions. · Hallazgos que cierra: [SEC-051], [SEC-053]
- Archivos a tocar: src/components/dashboard/modules/motor-resenas/_actions.ts (Zod: rating 1-5, textos con .max(), reviewName con patrón accounts/{n}/locations/{n}/reviews/{id} que cuelgue de org.gbpLocationId; generateDraft relee la reseña en GBP; rate limit para el LLM; mensajes genéricos + captureException); src/lib/integrations/google-business-profile.ts (replyToReview y listReviews validan la ubicación); decisión escrita de con qué cuenta de Google se conecta cada org (VH-060): si es la de develOP, la ubicación la fija solo un SUPER_ADMIN y el cliente no lista ubicaciones. · Archivos que NO se tocan: src/lib/ai/review-reply-draft.ts (el spotlighting del texto de la reseña va en 'Texto no confiable en prompts y en la salida del modelo'); src/lib/actions/gbp-connection.ts (hoy sin importadores: no se expone al cliente; su poda es POD-059 en 'Poda del portal y de src/lib/actions: código muerto con hallazgo (decide Valentino)'); la UI del admin que fija la ubicación va en 'Ficha del cliente: sección Integraciones (Cal.com, GA4, Google Business, Place ID)'; callbacks OAuth salvo validar.
- Zona: libre
- Tamaño: M · Riesgo: Alto: publicar una respuesta en una reseña ajena es irreversible; probar solo con una sucursal de prueba. Requiere decidir antes con qué cuenta de Google se conecta cada org (VH-060). · Prerrequisitos: [B-12]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-056: replyAction con un reviewName de otra ubicación se rechaza sin llamar a Google; VH-060 respondido y la decisión escrita; un cliente no puede listar ni elegir ubicaciones que develOP no le asignó; payloads inválidos devuelven error de validación.
- Nodo(s): h2.cli-resenas, int.gbp, int.anthropic, h2.cli-resenas.responder-resenas-con-ia, lib.rate-limit, h2.cli-resenas.publicar-respuesta, h2.cli-resultados.reputacion-gbp, lib.actions, modelo.Organization
- Worktree: ahora/integraciones
- Estado: abierta

### [B-20] Tienda conectada: un camino de conexión que el cliente puede completar
- Objetivo: Que 'Conectar mi tienda' lleve a un flujo que el cliente completa solo (o a un estado 'develOP conecta tu tienda'), sin orgId en la URL. · Hallazgos que cierra: [BUG-032]
- Archivos a tocar: src/app/(protected)/dashboard/modules/tienda-conectada/_components/ConnectStoreCard.tsx; src/app/api/auth/tiendanube/start/route.ts (org tomada de la sesión, state firmado con src/lib/security/oauth-state.ts) o un ConnectingState como el del motor de reseñas; src/app/(protected)/dashboard/modules/tienda-conectada/page.tsx. · Archivos que NO se tocan: src/lib/integrations/tiendanube.ts (errores y paginación van en 'Integraciones: distinguir error de vacío, reportar a Sentry y no cachear fallas'); callback de Tiendanube salvo para validar el state.
- Zona: libre
- Tamaño: S · Riesgo: Medio: decisión de producto previa (self-service o conexión asistida); si es self-service, el callback debe validar el state contra la org de la sesión. · Prerrequisitos: [B-12]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un usuario CLIENT que toca 'Conectar mi tienda' no recibe un 401 JSON: completa el OAuth con su propia org (state firmado y validado en el callback) o ve el estado de conexión asistida; ninguna URL del flujo lleva orgId; el token guardado queda cifrado.
- Nodo(s): h2.cli-tienda.conectar-tienda, int.tiendanube
- Worktree: ahora/integraciones
- Estado: abierta

### [B-21] Agenda inteligente: migrar Cal.com a la API v2 con la key fuera de la URL
- Objetivo: Que la Agenda inteligente funcione con la API v2 de Cal.com, con la key en headers y el link de reservas visible aunque falle el resumen. · Hallazgos que cierra: [TEC-002]
- Archivos a tocar: src/lib/integrations/cal-com.ts (migrar a v2 reusando src/lib/integrations/cal-com-v2.ts: headers y cal-api-version); src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx (link de reservas siempre, estado de error útil, captureException). · Archivos que NO se tocan: src/lib/leados/agenda.ts y src/app/(protected)/setter/_actions/agenda.actions.ts (ZONA-FRANCO); cal-com-v2.ts salvo agregar funciones sin cambiar las que usa LeadOS.
- Zona: libre
- Tamaño: M · Riesgo: Medio: cal-com-v2.ts es compartido con la agenda del setter; cualquier cambio de firma la rompe. Avisar a Franco. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-046: con una org de prueba con Cal.com configurado el panel muestra turnos reales vía v2 y ninguna URL lleva la key; con la key inválida se ve un error útil y el link de reservas; los tests de agenda del setter siguen verdes.
- Nodo(s): h2.cli-agenda.panel-de-agenda, int.cal-com, modelo.Organization
- Worktree: ahora/integraciones
- Estado: abierta

### [B-22] Reputación: fechas serializables en unstable_cache
- Objetivo: Que la pantalla de Reputación no se caiga desde la segunda visita. · Hallazgos que cierra: [BUG-141]
- Archivos a tocar: src/lib/integrations/google-business-profile.ts y src/lib/integrations/pagespeed.ts (lo envuelto en unstable_cache devuelve solo tipos JSON: fechas como ISO string); src/components/dashboard/results/GBPMetricsCard.tsx (new Date() al mostrar); test que pase el resultado por JSON.parse(JSON.stringify()). · Archivos que NO se tocan: El manejo de errores y de caché de fallas de las integraciones (va en 'Integraciones: distinguir error de vacío, reportar a Sentry y no cachear fallas').
- Zona: libre
- Tamaño: S · Riesgo: Bajo. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-133: una segunda visita a Reputación dentro de la hora renderiza sin error; el test de serialización pasa.
- Nodo(s): h2.cli-resultados.reputacion-gbp, h2.cli-resultados.velocidad-sitio, int.gbp, lib.premium-modules
- Worktree: ahora/integraciones
- Estado: abierta

### [B-23] Emails normalizados en el alta de clientes
- Objetivo: Que un cliente dado de alta con mayúsculas en el email pueda entrar por contraseña y por magic link. · Hallazgos que cierra: [BUG-002]
- Archivos a tocar: src/modules/chatbot/server/admin/createClientOnly.ts:26, createClientWithBot.ts:34, src/app/(protected)/admin/chatbots/new/actions.ts:27 y src/lib/onboarding/core.ts (.trim().toLowerCase() en los schemas de alta); Step1Company.tsx:169 (wizard); script de datos con dry-run que pase a minúscula los emails existentes verificando colisiones. · Archivos que NO se tocan: src/auth.ts (FROZEN + ZONA-FRANCO); prisma/schema.prisma; nunca prisma migrate reset; el resto de la validación compartida del alta (SEC-066: avatar, máximos de KB, sandbox) va en [B-126].
- Zona: libre
- Tamaño: S · Riesgo: Bajo en código; el script de datos puede chocar con duplicados por mayúsculas: dry-run primero y resolver colisiones a mano. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un alta con 'Cliente@Mail.com' queda guardada en minúscula y ese cliente entra por contraseña y por magic link; el script en dry-run reporta las colisiones (o 0) antes de escribir.
- Nodo(s): h1.auth-login.login-password, h1.auth-login.magic-link, h4.adm-clientes, modelo.User, modelo.EmailContact, h1.auth-login, h2.cli-email-mkt
- Worktree: ahora/auth-limites
- Estado: abierta

### [B-24] Detalle de ticket en mobile: el hilo de mensajes visible
- Objetivo: Que en un teléfono el hilo de un ticket se vea y se pueda responder. · Hallazgos que cierra: [BUG-040]
- Archivos a tocar: src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx (alto fijo solo desde lg; en <lg la página fluye y Timeline y Detalles van colapsables debajo del chat); src/components/dashboard/ClientChatThread.tsx (min-h al hilo, shrink-0 donde corresponde). · Archivos que NO se tocan: src/components/dashboard/TicketReplyForm.tsx salvo layout; src/components/ui/* (FROZEN).
- Zona: libre
- Tamaño: S · Riesgo: Bajo; verificar con visual-qa en 390 px y desktop. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-050: a 390 px el hilo muestra los mensajes con alto mayor a 0 y el composer queda accesible; visual-qa desktop y mobile sin ROTO ni BUG.
- Nodo(s): h2.cli-soporte.conversacion-ticket, h2.cli-soporte
- Worktree: ahora/portal-soporte
- Estado: abierta

## Próximo

### [B-25] Recupero e invitación: regla única de contraseña, tokens hasheados de un solo uso y aviso al titular
- Objetivo: Que reset, invitación y cambio de contraseña usen la misma regla, que los tokens se guarden como hash y se consuman una sola vez y que el titular se entere de cada cambio. · Hallazgos que cierra: [SEC-012], [SEC-013], [UX-004], [FAL-002]
- Archivos a tocar: src/lib/actions/schemas.ts (passwordSchema compartido para reset, invitación, cambio y perfil); src/app/accept-invite/actions.ts y AcceptInviteForm (Zod, checkStrength); src/app/reset-password/actions.ts y ResetPasswordForm.tsx (buscar por sha256 del token; consumo con updateMany condicional; borrar los demás tokens del usuario al usar uno; link a /forgot-password en el error); src/app/forgot-password/actions.ts (guardar sha256; no invalidar los anteriores, que venzan solos a los 45 min); src/lib/email/templates/password-reset.ts y pantalla de éxito ('si pediste más de uno, usá el último'); src/app/cambiar-password/actions.ts, reset-password y src/lib/actions/profile.ts (email 'tu contraseña cambió' fire-and-forget con Sentry y sin datos sensibles). · Archivos que NO se tocan: src/auth.ts (FROZEN + ZONA-FRANCO); prisma/schema.prisma (si el hash exigiera columna nueva: decisión FROZEN); src/lib/actions/settings.ts (legacy sin importadores: su poda es POD-062 en 'Poda del portal y de src/lib/actions: código muerto con hallazgo (decide Valentino)'); el tope único de largo también en login (BUG-009) va en 'Login y contraseñas: tope único, éxito real del magic link, destino conservado y cambio forzado con salida'; src/proxy.ts.
- Zona: libre
- Tamaño: M · Riesgo: Medio: cambiar el formato del token invalida los links de reset ya enviados (vencen a los 45 min, aceptable); la invitación con token hasheado cambia también el alta de miembros del equipo. · Prerrequisitos: [B-08]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: La misma contraseña débil se rechaza en reset, invitación, cambio y Mi Cuenta; la tabla de tokens no guarda valores en claro (consulta de solo lectura); un token usado dos veces en paralelo funciona una sola vez; VH-022: pedir recupero tres veces deja usable cualquiera de los mails hasta usar uno y después ninguno; el titular recibe el aviso de cambio en los tres caminos.
- Nodo(s): h1.auth-recupero, h1.auth-recupero.restablecer-password, h1.auth-invite.aceptar-invitacion, h1.auth-cambio, h2.cli-cuenta, lib.actions, lib.rate-limit, modelo.PasswordResetToken, int.brevo
- Worktree: ahora/auth-limites
- Estado: abierta

### [B-26] callbackUrl seguro en el proxy: mismo origen o a la raíz
- Objetivo: Que ningún callbackUrl con barra invertida, tab o caracteres de control saque al usuario del dominio después del login. · Hallazgos que cierra: [SEC-011]
- Archivos a tocar: src/proxy.ts (isSafeCallbackUrl con new URL(callbackUrl, nextUrl) y url.origin igual a nextUrl.origin; rechazar barra invertida y caracteres de control); test o invariante con los casos de VH-011. · Archivos que NO se tocan: src/auth.ts; src/lib/auth-guards.ts; conservar el destino tras el login (UX-005) va en 'Login y contraseñas: tope único, éxito real del magic link, destino conservado y cambio forzado con salida'.
- Zona: libre
- Tamaño: S · Riesgo: Bajo: proxy.ts corre en todos los portales; probar login con y sin callbackUrl en admin, dashboard y setter. 'Sesión que no se revive...' también toca proxy.ts: rebasar sobre la que entre primero. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-011: un callbackUrl con barra invertida, con tab o codificado redirige a / tras entrar; un callbackUrl interno válido (/dashboard/soporte) se respeta; el test nuevo cubre los casos y pasa.
- Nodo(s): h1.auth-login.ruteo-por-rol, lib.proxy
- Worktree: ahora/auth-limites
- Estado: abierta

### [B-27] Magic link y errores de auth en auth.ts: envío que falla, link que no gasta un escáner, Google y Sentry
- Objetivo: Que el magic link falle cuando Brevo falla, que no lo consuma un escáner de correo, que 'Continuar con Google' funcione o desaparezca y que errores e inicios de sesión dejen rastro. · Hallazgos que cierra: [BUG-003], [BUG-007], [UX-002], [FAL-003], [FAL-001], [SEC-009] (parte `auth.ts`) [F7 C14]
- Archivos a tocar: src/auth.ts, decisión de Valentino y Franco: sendVerificationRequest lanza (EmailSignInError) si result.ok es false; link a una página propia de confirmación; pages.error y verifyRequest en español; logger.error hacia Sentry; events.signIn/signOut hacia la auditoría; bcrypt dummy cuando no hay usuario y chequeo de emailVerified después del bcrypt (la parte de SEC-009 que vive en auth.ts); vinculación de Google por email verificado (o quitar el provider). Zona libre: src/lib/email/brevo-service.ts (timeout y maxRetries cortos, captureException); página nueva /login/confirmar con un botón que sigue al callback; src/app/login/page.tsx (leer ?error con mensajes en español o quitar el botón de Google); src/app/login/actions.ts (Sentry para los AuthError que no sean CredentialsSignin ni el AccessDenied esperado, sin sumarlos a recordFailedAttempt). · Archivos que NO se tocan: prisma/schema.prisma (tipos LOGIN_* en AuditActionType exigen migración: decisión FROZEN aparte; alternativa sin migración); src/proxy.ts; src/app/api/auth/[...nextauth]/route.ts.
- Zona: ZONA-FRANCO; requiere decisión FROZEN (src/auth.ts)
- Tamaño: L · Riesgo: Alto: el flujo del magic link es el acceso de clientes y setter; probar con un GET previo simulando el escáner y con Brevo caído antes de mergear. · Prerrequisitos: [B-09], [B-05]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Con Brevo caído la UI del magic link muestra error; VH-021: un GET previo al link no lo consume; VH-010: el botón de Google entra o ya no existe, y /login muestra ?error en español; VH-023: un AuthError inesperado aparece en Sentry y no suma al rate limit; un login de SUPER_ADMIN deja registro de auditoría; un login con email inexistente tarda lo mismo que uno con contraseña equivocada (20 intentos medidos).
- Nodo(s): h1.auth-login.magic-link, int.brevo, int.sentry, lib.auth, h1.auth-login, modelo.VerificationToken, h1.auth-login.google-oauth, h1.auth-login.login-password, h4.adm-audit, modelo.AdminAuditLog
- Worktree: franco/auth
- Estado: abierta

### [B-28] Auditoría que no se pierde y cubre lo sensible del admin
- Objetivo: Que la auditoría del admin no se pierda en silencio, viaje en la misma transacción que el cambio y cubra precios, settings, referidos, exportes y Proyectos. · Hallazgos que cierra: [SEC-030], [SEC-086]
- Archivos a tocar: src/lib/audit-log.ts (captureException en el catch; variante que reciba el cliente de transacción), decisión de Valentino; src/lib/actions/impersonation.ts (auditar antes de emitir la cookie y abortar si falla; registrar el fin por vencimiento); src/app/reset-password/actions.ts y src/app/cambiar-password/actions.ts (auditoría dentro del $transaction); src/app/(protected)/admin/settings/_actions/settings.actions.ts, src/app/(protected)/admin/referrals/_actions/referrals.admin.actions.ts, src/lib/bulk-actions.ts y las actions de Proyectos que borran, cambian de estado o marcan pagos (logAdminAction con computeDiff, sin valores de secretos). · Archivos que NO se tocan: prisma/schema.prisma (actionType nuevos con migración: decisión FROZEN si hiciera falta); src/auth.ts; src/components/dashboard/ImpersonationTimer.tsx salvo leer el vencimiento; la IP confiable y el organizationId de cada evento (SEC-026, DEU-012) van en 'audit-log protegido: IP confiable, auditoría que no se pierde y organización en cada evento' (el captureException y la variante con transacción del helper se hacen acá y esa tarjeta no los repite); el reenvío de credenciales va en 'Reenviar credenciales solo a cuentas de cliente, con destinatario fijo y aviso a la cuenta'.
- Zona: requiere decisión FROZEN (src/lib/audit-log.ts); el resto libre
- Tamaño: M · Riesgo: Medio: auditar antes de la impersonación la bloquea si la tabla falla (falla cerrada, a propósito). · Prerrequisitos: [B-10]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un fallo forzado de logAdminAction aparece en Sentry y aborta la impersonación; una impersonación que vence sola deja IMPERSONATION_ENDED; cambiar un precio, el webhook o un referido, exportar leads y borrar un proyecto dejan AdminAuditLog sin valores secretos; el reset de contraseña y su auditoría se escriben en la misma transacción.
- Nodo(s): lib.audit-log, h1.auth-recupero, h1.auth-cambio, h1.auth-impersonacion, h4.adm-audit, modelo.AdminAuditLog, int.sentry, h4.adm-config, h4.adm-referidos.gestion-estados, h4.adm-clientes.acciones-masivas, modelo.AgencySettings, h4.adm-proyectos.borrado, h4.adm-proyectos.pagos-hitos
- Worktree: ahora/admin-guardia
- Estado: abierta

### [B-29] Reenviar credenciales solo a cuentas de cliente, con destinatario fijo y aviso a la cuenta
- Objetivo: Que 'Reenviar credenciales' no pueda resetear la contraseña de un SUPER_ADMIN o SETTER sin confirmación reforzada, elija siempre el mismo destinatario y avise a la cuenta afectada. · Hallazgos que cierra: [SEC-087]
- Archivos a tocar: src/app/api/admin/users/[userId]/resend-credentials/route.ts (solo CLIENT y ORG_MEMBER, o confirmación reforzada para SUPER_ADMIN y SETTER; orderBy determinista; plantilla según rol; aviso a la cuenta afectada; si Brevo falla, no devolver la temporal en la respuesta salvo por un canal seguro definido; logAdminAction sin la contraseña). · Archivos que NO se tocan: el miembro que muestra la ficha en OverviewTab (BUG-118) va en 'Clientes en el admin: componente partido, fallos visibles, archivados distinguibles y credenciales al miembro correcto'; src/auth.ts; el rol SETTER lo gestiona Franco.
- Zona: libre (afecta cuentas SETTER: avisar a Franco)
- Tamaño: S · Riesgo: Medio: un reset mal acotado deja afuera a un admin o al setter; probar con cuentas de prueba de cada rol en base local. · Prerrequisitos: [B-28]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-128: reenviar credenciales a un SUPER_ADMIN se rechaza o pide la confirmación reforzada; VH-132: con un miembro más antiguo que no es ADMIN, el reset va al ADMIN y siempre al mismo; la cuenta afectada recibe el aviso; con Brevo caído la respuesta no trae la contraseña temporal; queda un AdminAuditLog sin la contraseña.
- Nodo(s): h4.adm-clientes.reenviar-credenciales, h1.auth-cambio, int.brevo, modelo.User
- Worktree: ahora/admin-guardia
- Estado: abierta

### [B-30] Modo soporte: org atada a la pestaña y una política de escritura única
- Objetivo: Que lo que soporte guarda en vista previa vaya a la org que se ve en esa pestaña y que todas las actions del portal sigan la misma política de escritura en modo soporte. · Hallazgos que cierra: [SEC-029], [BUG-044]
- Archivos a tocar: src/lib/actions/impersonation.ts y src/lib/impersonation.ts (no pisar una impersonación activa; orgId renderizado firmado o token por pestaña); src/lib/preview.ts (resolveOrgId valida el orgId de la pantalla); src/lib/actions/messages.ts, notifications.ts, referrals.ts, announcements.ts, src/app/(protected)/dashboard/_actions/business-profile.actions.ts y modules/email-marketing/_actions.ts (resolveOrgId o escritura deshabilitada con aviso, como perfil/page.tsx:105-150); src/actions/dashboard-actions.ts:14, :102 y :190 (FROZEN, decisión de Valentino). · Archivos que NO se tocan: src/auth.ts; src/lib/auth-guards.ts; src/lib/audit-log.ts (lo cubre 'Auditoría que no se pierde y cubre lo sensible del admin'); el secreto propio de impersonación y la cookie al hacer logout (SEC-020) van en 'Ciclo de sesión: logout que revoca, temporales fuertes, impersonación cerrada y cambio de email avisado'.
- Zona: requiere decisión FROZEN (src/actions/dashboard-actions.ts)
- Tamaño: L · Riesgo: Alto: hay que decidir si el preview es solo lectura o escritura auditada (SEC-020); un error escribe datos en el cliente equivocado. · Prerrequisitos: [B-28]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-017: con dos clientes en dos pestañas, guardar en la de X escribe en X o se rechaza con 'cambiaste de cliente en otra pestaña'; VH-052: todas las actions del portal en modo soporte siguen la política elegida (escriben con resolveOrgId y auditoría, o rechazan con aviso).
- Nodo(s): h1.auth-impersonacion, lib.preview, h2.cli-inicio, h2.cli-email-mkt, h2.cli-soporte, h4.adm-clientes, h2.cli-mensajes, h2.cli-shell.campana-notificaciones, h2.cli-referidos, h2.cli-servicios.solicitar-modulo, lib.actions, h2.cli-mensajes.no-leidos-al-abrir, h2.cli-inicio.ideas-para-crecer
- Worktree: proximo/soporte-impersonacion
- Estado: abierta

### [B-31] LeadOS: decidir e integrar (o descartar) p25/rafaga-tildes antes de tocar LeadOS en main
- Objetivo: Que Franco decida si los sprints P25–P43 de origin/p25/rafaga-tildes entran a main y que, según la decisión, se integren o se archiven antes de cualquier otro arreglo de LeadOS. · Hallazgos que cierra: [DEU-077]
- Archivos a tocar: Rama origin/p25/rafaga-tildes (P25–P43): merge o rebase sobre main si se integra, o tag de archivo si se descarta; decisión registrada en 09-PARA-FRANCO; volver a correr los invariantes y las specs del setter (o el lote D4) sobre el resultado. · Archivos que NO se tocan: prisma/schema.prisma (si la rama trae migraciones: revisarlas con migrate status, nunca migrate reset); src/auth.ts; módulos fuera de LeadOS; el resto de las ramas (va en 'Ramas: borrar las 43 mergeadas y archivar con tag las 14 con trabajo propio').
- Zona: ZONA-FRANCO
- Tamaño: L · Riesgo: Alto: 19 sprints fuera de main; integrarlos tarde multiplica conflictos con todas las tarjetas de LeadOS. · Prerrequisitos: ninguno
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: La decisión queda escrita en 09-PARA-FRANCO; si se integra, main contiene P25–P43, tsc --noEmit, los invariantes y las specs del setter pasan y npx prisma migrate status no muestra pendientes ni drift; si se descarta, la rama queda archivada con tag.
- Nodo(s): lib.leados, h5.set-manual, h5.set-dia, h5.set-lead
- Worktree: franco/leados
- Estado: abierta

### [B-32] LeadOS: la agenda reserva en la org de develOP por un identificador explícito
- Objetivo: Que la agenda del setter reserve siempre en la cuenta de Cal.com de develOP, aunque otros clientes tengan Cal.com configurado. · Hallazgos que cierra: [BUG-038]
- Archivos a tocar: src/lib/leados/agenda.ts y src/app/(protected)/setter/_actions/agenda.actions.ts (org de develOP por flag, slug o config de LeadOS en vez de 'la única con calComUsername'). · Archivos que NO se tocan: src/lib/integrations/cal-com-v2.ts (compartido con la Agenda del cliente); src/app/(protected)/dashboard/modules/agenda-inteligente/*; prisma/schema.prisma (si el flag pidiera columna: decisión FROZEN; preferir slug o config).
- Zona: ZONA-FRANCO
- Tamaño: S · Riesgo: Medio: hoy, si se configura Cal.com en un cliente, la agenda del setter se rompe o reserva en la cuenta del cliente con datos del prospecto; va antes de 'Ficha del cliente: sección Integraciones (Cal.com, GA4, Google Business, Place ID)'. · Prerrequisitos: [B-31]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Con dos orgs con Cal.com configurado en base local, la agenda del setter ofrece horarios y reserva en la de develOP; los tests de agenda del setter siguen verdes.
- Nodo(s): lib.leados, h5.set-manual.agenda-reunion, h5.set-lead.agenda-reunion, h5.set-manual.agenda, h2.cli-agenda, h2.cli-agenda.panel-de-agenda, int.cal-com, modelo.Organization
- Worktree: franco/leados
- Estado: abierta

### [B-33] Frontera de aislamiento completa: nested writes, id vacío y regla de lint en CI
- Objetivo: Que el helper de aislamiento cubra todas las relaciones anidadas, rechace ids vacíos y sea la única puerta a los modelos aislados, con su regla de lint corriendo en CI. · Hallazgos que cierra: [SEC-035], [BUG-013], [DEU-013]
- Archivos a tocar: src/lib/isolation/registry.ts (templates y alerts en WABA_CHANNEL_NESTED; test que compare cada *_NESTED contra Prisma.dmmf); src/lib/isolation/scoped-model.ts (id string no vacío o IsolationError); migrar los 46 accesos directos a modelos aislados (src/lib/dashboard/home-metrics.ts, src/app/(protected)/dashboard/chatbot/knowledge/page.tsx y el resto) a forOrg; eslint.config.mjs (no-restricted-imports y no-restricted-syntax para consumidores de modelos del chatbot y del motor); raíz:.github/workflows/ci.yml (un paso que corra solo esa regla aunque el lint global siga apagado); tests/integration/motor-isolation.spec.ts (caso h). · Archivos que NO se tocan: prisma/schema.prisma; src/lib/prisma.ts (FROZEN); src/lib/leados/* (ZONA-FRANCO, fuera del helper por diseño); el lint completo con fronteras, build y npm audit en CI (DEU-090) van en [B-88].
- Zona: libre
- Tamaño: L · Riesgo: Medio: migrar 46 accesos puede cambiar resultados si alguno era global a propósito; esos van con unsafeGlobalQuery y su razón. · Prerrequisitos: ninguno
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: ON
- Criterio de aceptación: VH-028: un nested connect de WabaChannel hacia otro tenant falla; VH-029: update o delete con id undefined lanza IsolationError; la regla de lint corre en CI y git grep de prisma.<modelo aislado> fuera del helper = 0 salvo unsafeGlobalQuery con razón; el test del registry falla si se agrega una relación sin registrar.
- Nodo(s): lib.isolation, modelo.WabaChannel, modelo.MotorTemplate, modelo.MotorAlert, h3.vis-whatsapp, modelo.BotConfig, modelo.ChatbotLead, modelo.Conversation, modelo.CrmIntegration, lib.prisma, h2.cli-inicio, h3.cli-chatbot, h4.adm-config
- Worktree: proximo/aislamiento
- Estado: abierta

### [B-34] Webhook CRM sin SSRF
- Objetivo: Que el webhook CRM que configura el cliente no pueda apuntar a la red interna ni devolver el contenido de la respuesta. · Hallazgos que cierra: [SEC-072]
- Archivos a tocar: src/modules/chatbot/server/crm/validateWebhookUrl.ts (resolver DNS justo antes del POST; bloquear rangos privados, ::ffff:0:0/96, ::, 0.0.0.0/8 y 100.64.0.0/10); src/modules/chatbot/server/crm/postToN8n.ts (redirect: 'manual' o validar cada salto; conectar a la IP validada); src/modules/chatbot/server/admin/integrations/testCrmConnection.ts ('Probar conexión' devuelve solo ok o código). · Archivos que NO se tocan: src/modules/chatbot/server/tools/captureLead.ts (el outbox va en 'Avisos post-lead confiables y acotados: outbox, Telegram escapado y tope del lead caliente').
- Zona: libre
- Tamaño: S · Riesgo: Bajo: webhooks legítimos que redirigen dejan de andar; avisar en la UI. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-099 en un entorno de prueba: una URL que redirige a 169.254.169.254, un DNS que resuelve a 127.0.0.1 y una IPv6 mapeada se rechazan; 'Probar conexión' no devuelve el cuerpo de la respuesta.
- Nodo(s): h3.cli-chatbot, lib.chatbot.crm, int.n8n
- Worktree: proximo/post-lead
- Estado: abierta

### [B-35] Bot pausado coherente: tarjeta de WhatsApp en el widget y estado claro en Mi Chatbot
- Objetivo: Que un bot pausado se vea pausado en producción para el visitante (sin saludo ni chips que manden mensajes) y para el cliente (estado 'Pausado' con motivo y CTA en vez de la landing de venta). · Hallazgos que cierra: [BUG-108], [BUG-088], [BUG-086]
- Archivos a tocar: src/app/api/chatbot/[slug]/config/route.ts, src/lib/security/same-origin.ts y src/modules/chatbot/server/config/getPublicConfig.ts (una sola regla para el bot pausado: /config sirve la config con paused, o el widget interpreta el 403 bot_inactive; pinneada en el invariante fix-origin-same-origin); src/modules/chatbot/components/embed/ChatbotEmbed.tsx (mismo gate que ChatWindow para empty state y chips; sendMessage bloqueado con el bot pausado); src/modules/chatbot/server/admin/clientHasChatbot.ts y src/app/(protected)/dashboard/chatbot/layout.tsx (gate por existencia de BotConfig y estado 'Pausado' con motivo y CTA). · Archivos que NO se tocan: handleChatRequest.ts (el chat sigue cortando por bot_inactive); la validación de origen contra allowedDomains (va en 'Widget embebido: el host informa origen y ruta, y el servidor valida allowedDomains'); src/app/layout.tsx; src/context/* (FROZEN).
- Zona: libre
- Tamaño: M · Riesgo: Medio: same-origin.ts y getPublicConfig.ts deciden qué config es pública y hoy dos comentarios del repo se contradicen; probar en build de producción, no en dev. · Prerrequisitos: [B-11]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-107: en build de producción un bot pausado muestra la tarjeta de WhatsApp y no 'No pudimos conectar con el chat'; con el bot pausado el embed no muestra saludo ni chips y no envía mensajes; VH-088: el cliente con el bot pausado ve 'Pausado' con motivo y CTA, no la landing de venta; el invariante fix-origin-same-origin fija la regla elegida.
- Nodo(s): h3.vis-widget-cliente, h3.vis-widget-cliente.chat-embebido, h3.vis-api-chatbot, lib.security, lib.chatbot.config, h3.cli-chatbot, h3.cli-chatbot.resumen, h3.cli-chatbot.upsell-activacion, modelo.BotConfig, lib.chatbot.admin, lib.preview
- Worktree: proximo/widget
- Estado: abierta

### [B-36] Widget embebido: el host informa origen y ruta, y el servidor valida allowedDomains
- Objetivo: Que el widget de un cliente solo funcione en sus dominios (origen del host contrastado con allowedDomains y el tope del plan) y que la ruta real del visitante llegue al servidor. · Hallazgos que cierra: [SEC-068], [UX-017], [UX-022], [BUG-087]
- Archivos a tocar: public/widget.js (pasar el origen y la ruta del host en el handshake); src/modules/chatbot/components/embed/ChatbotEmbed.tsx (tomar origen y currentPath del parentUrl del handshake y reenviarlos a /config y /chat); src/lib/security/validate-origin.ts y origin-matcher.ts (contraste con allowedDomains y el tope del plan; develop.com.ar exento solo para el bot propio); next.config.ts (frame-ancestors por bot para /embed); src/modules/chatbot/components/admin/config/tabs/AdvancedTab.tsx y server/admin/saveBotConfigByOrgSlug.ts (dominios normalizados: trim, minúsculas, sin esquema ni ruta; 'X de N del plan'); textos de ClientInstallView.tsx e InstallTab.tsx alineados con el comportamiento. · Archivos que NO se tocan: src/modules/chatbot/server/chat/handleChatRequest.ts salvo leer el origen (el gasto va en 'Techo de gasto del chat público: IP confiable, cupo por intercambio real y abortos que cuentan'); aceptar el handshake solo de window.parent y no postear PII antes (SEC-070) va en 'Widget público: el visitante no recibe datos internos y el embed valida con quién habla'; el currentPath que se congela en el widget de develOP (BUG-072) va en 'Hooks y embed del chatbot: currentPath vivo, sessionId por bot, byte NUL y reglas del React Compiler'; src/app/layout.tsx; src/context/* (FROZEN).
- Zona: libre
- Tamaño: L · Riesgo: Alto: un error en la allowlist deja sin widget a todos los clientes; desplegar detrás de una bandera por bot y probar en un sitio de cliente de prueba. Origin se forja fuera del navegador: el límite real de costo sigue siendo el de la tarjeta de gasto. Completa la parte (3) de SEC-057. · Prerrequisitos: [B-07], [B-35]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-085: el widget de un cliente embebido en un dominio no autorizado no carga ni responde; VH-032: dos bots bajo el mismo origen solo responden donde su allowedDomains lo permite; VH-077: un dominio con mayúscula o espacio se guarda normalizado y la UI muestra 'X de N del plan'; un lead capturado en /servicios del sitio de prueba guarda currentPath /servicios; el texto de instalación coincide con el comportamiento.
- Nodo(s): h3.vis-widget-cliente, h3.vis-widget-cliente.chat-embebido, lib.security, lib.chatbot.llm, modelo.BotConfig, h4.adm-clientes.alta-cliente-con-bot, h3.cli-chatbot.instalacion, h3.adm-chatbots.instalacion, h3.adm-chatbots.editar-config-bot, h3.cli-chatbot.contacto-detalle, h3.cli-chatbot.conversaciones
- Worktree: proximo/widget
- Estado: abierta

### [B-37] Texto no confiable en prompts y en la salida del modelo
- Objetivo: Que el texto de visitantes, reseñas y consultas de GA4 o Search Console entre a los prompts delimitado como no confiable, que el historial no lo dicte el navegador y que la salida del modelo no cargue imágenes ni links arbitrarios. · Hallazgos que cierra: [SEC-056], [SEC-058], [SEC-076], [SEC-078]
- Archivos a tocar: Helper compartido de spotlighting (nonce + regla de contenido no confiable, como src/modules/chatbot/server/prompts/sections.ts:151) usado en src/lib/ai/review-reply-draft.ts, src/lib/ai/results-insights.ts, src/modules/chatbot/server/insights/generateInsights.ts y analysis/getMonthlyAnalysisForOrg.ts; src/modules/chatbot/server/chat/requestSchema.ts (currentPath como ruta de 200 caracteres como máximo y sin saltos); historial 'assistant' reconstruido desde ChatMessage o firmado con HMAC (persistTurn.ts, handleChatRequest.ts); src/modules/chatbot/components/chat/ChatWindow.tsx, StreamingMarkdown.tsx y embed/ChatbotEmbed.tsx (sin img del modelo; a con rel noopener noreferrer nofollow y allowlist); ReviewItem.tsx (marcar URL, email o teléfono ajenos a los datos del negocio); DiscoveriesSection.tsx y ClientMonthlyReportPdf.tsx (no mostrar insights que citen instrucciones). · Archivos que NO se tocan: prisma/schema.prisma; src/modules/chatbot/server/chat/reconcile.ts (gasto); src/lib/security/*; el largo de los mensajes 'assistant' (BUG-093) va en 'Respuestas largas del bot que no rompen la conversación'.
- Zona: libre
- Tamaño: L · Riesgo: Medio: el spotlighting puede bajar la calidad de las respuestas; correr las evals Q1.1 y Q1.2 antes y después. · Prerrequisitos: [B-07]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-064, VH-068 y VH-108: una instrucción en un mensaje de visitante, en el currentPath o en una reseña no aparece obedecida en insights, respuestas ni borradores; VH-109: el widget no pide imágenes remotas que vienen del modelo y los links salen con rel seguro; un historial 'assistant' inventado por el navegador se ignora; evals Q1 sin regresión.
- Nodo(s): h2.cli-resultados, h3.vis-widget-cliente, lib.chatbot.insights, modelo.ChatbotInsight, lib.chatbot.llm, int.cron.generate-insights, h3.vis-api-chatbot, lib.chatbot.prompts, lib.chatbot.chat, h2.cli-resenas, int.anthropic, int.gbp, int.ga4, h3.vis-widget-develop, lib.chatbot
- Worktree: proximo/chat-runtime
- Estado: abierta

### [B-38] Entradas del portal acotadas: Zod con .max(), rate limit por usuario y texto neutralizado hacia Slack
- Objetivo: Que las entradas del portal tengan tope de largo y validación Zod, que tickets, upsell, onboarding y PDF tengan rate limit, y que el texto de clientes y visitantes no inyecte formato en el canal de alertas. · Hallazgos que cierra: [SEC-016], [SEC-032], [SEC-047], [SEC-054]
- Archivos a tocar: src/lib/actions/schemas.ts (UpdateProfileSchema con .max() en name, companyName y whatsapp; Zod de whatsapp); src/lib/actions/profile.ts (mensaje fijo en los catch, sin texto de Prisma); src/lib/tickets/schemas.ts y actions.ts, src/lib/actions/upsell.ts (módulo validado contra el catálogo, no texto libre), src/app/api/reports/client-monthly/route.ts y, si /bienvenida sigue, complete-onboarding.ts (checkRateLimit por userId); src/modules/chatbot/server/prompts/sections.ts (truncar companyName en el prompt); neutralizar y truncar el texto de usuario hacia el webhook de alertas en los llamadores (tickets/actions.ts, messages.ts, upsell.ts y contact.ts); maxLength en los inputs; script de solo lectura que liste nombres fuera de rango. · Archivos que NO se tocan: src/lib/action-utils.ts (FROZEN); src/lib/alerts.ts (escapar ahí requiere decisión FROZEN; la alternativa libre es en los llamadores); los .max() del onboarding (los pone 'Onboarding /bienvenida: decidir su destino y que el cliente no pueda fijar la propiedad de GA4'); src/lib/actions/contact.ts salvo neutralizar el texto hacia la alerta (Zod, topes y rate limit del formulario van en 'Contacto público por un solo camino de servidor, también en mobile'); la deduplicación del upsell (SEC-055) va en 'Avisos internos a develOP: logger y alerts.ts libres, envíos con after(), dedupe propio y fallas a Sentry'.
- Zona: libre (escapar en src/lib/alerts.ts requiere decisión FROZEN)
- Tamaño: M · Riesgo: Bajo: topes muy bajos rechazan datos legítimos; usar los del alta del admin (100). · Prerrequisitos: [B-16]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-020: un nombre de empresa de 5000 caracteres se rechaza en el perfil; el pedido N+1 de ticket, upsell o PDF dentro de la ventana queda limitado; profile.ts nunca devuelve texto de Prisma; VH-061: un ticket urgente y un formulario público con <!channel> llegan a Slack como texto plano.
- Nodo(s): h2.cli-cuenta, lib.actions, h2.cli-bienvenida, h3.vis-api-chatbot, lib.chatbot.llm, modelo.Organization, h2.cli-soporte.crear-ticket, h2.cli-servicios.vitrina-modulos, h2.cli-resultados.informe-mensual-pdf, lib.rate-limit, lib.alerts, h2.cli-cuenta.perfil-empresa, h2.cli-servicios.solicitar-modulo, h2.cli-mensajes, h2.cli-soporte, h2.cli-mensajes.enviar-mensaje, h6.vis-contacto
- Worktree: proximo/portal-validacion
- Estado: abierta

### [B-39] Contacto público por un solo camino de servidor, también en mobile
- Objetivo: Que el formulario de contacto (página /contact y pie del home) pase por la server action con Zod, topes y rate limit, funcione en mobile con el ?ref= y sea accesible. · Hallazgos que cierra: [SEC-094], [SEC-090], [BUG-139], [BUG-132], [A11Y-024], [A11Y-025]
- Archivos a tocar: src/components/sections/home/Footer.tsx (usar submitContactForm, la action que ya usa /contact; tarjeta como button real; labels asociados; role=status/alert; retirar NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL del navegador); src/lib/actions/schemas.ts y src/lib/actions/contact.ts (.max() por campo; getClientIpHash y checkRateLimit dentro del try con mensaje útil y captureException); src/app/contact/page.tsx (formulario también en mobile o CTA que lo despliegue; ?ref= propagado; id/htmlFor, aria-invalid, role=alert). · Archivos que NO se tocan: src/lib/alerts.ts (FROZEN-inferido); la neutralización del texto hacia Slack (SEC-054) la hace 'Entradas del portal acotadas: Zod con .max(), rate limit por usuario y texto neutralizado hacia Slack'; contactFormAction y markLeadAsRead (sin llamador: POD-076 en 'Poda del portal y de src/lib/actions: código muerto con hallazgo (decide Valentino)'); src/lib/prisma.ts (FROZEN: el reintento ante cold start va en 'Conexión a Neon: directUrl, timeouts y reintento ante cold start'); Hero y CTA del home (rediseno/home); el WhatsApp del pie (BUG-144).
- Zona: libre
- Tamaño: M · Riesgo: Medio: el pie del home también vive en la rama rediseno/home; coordinar el merge. contact.ts también lo toca la tarjeta de Entradas (solo el escape): rebasar sobre la que entre primero. · Prerrequisitos: [B-06]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-139: con n8n caído el pie muestra error real y el lead queda en ContactSubmission, y la tarjeta se abre con teclado; VH-126: a 390 px /contact?ref=X permite enviar y atribuye el referido; VH-131: con la base inaccesible se ve un mensaje útil y no la página de error; un mensaje de 50 000 caracteres se rechaza; el navegador no llama a n8n.
- Nodo(s): h6.vis-contacto.formulario-pie-home, int.n8n, modelo.ContactSubmission, h6.vis-contacto.enviar-formulario, lib.actions, h2.cli-servicios, lib.rate-limit, lib.prisma, h6.vis-contacto.formulario, h6.vis-contacto.captura-referido, h2.cli-referidos, modelo.Referral
- Worktree: proximo/contacto
- Estado: abierta

### [B-40] Email transaccional: un proveedor, remitente verificado y resultado leído
- Objetivo: Que todo email transaccional salga por un solo proveedor con remitente verificado, lea el resultado y no se pierda en serverless. · Hallazgos que cierra: [BUG-037], [DEU-070], [BUG-112], [BUG-119]
- Archivos a tocar: src/lib/email/brevo-service.ts como proveedor único con un módulo de remitentes de dominio verificado; src/lib/email.ts y src/lib/email/notify-message.ts (migrar de Resend a Brevo, leer el resultado, captureException); src/lib/tickets/actions.ts; src/actions/agency-actions.ts (Promise.allSettled en los avisos de 'Acción requerida', sin fallback a localhost: fallar si falta la URL); src/app/(protected)/admin/messages/_actions/message.actions.ts y src/lib/email/admin-message-notification.ts (after() de next/server); docs/env-vars.md. · Archivos que NO se tocan: src/auth.ts (el provider de NextAuth: no tocar sin Franco); src/lib/integrations/brevo.ts (email marketing, otra tarjeta); el helper único de URL base y el escape de las plantillas (BUG-059, SEC-095) van en 'Emails: URL base única sin fallback y plantillas que escapan lo que interpolan'.
- Zona: libre
- Tamaño: M · Riesgo: Medio: cambiar de proveedor sin el dominio verificado en Brevo deja de mandar avisos; verificar el dominio antes. · Prerrequisitos: [B-05]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-049, VH-112 y VH-121: el aviso de mensaje nuevo, el de 'Acción requerida' y el de respuesta del admin llegan desde un deploy de Netlify y su falla aparece en Sentry; ningún remitente es un Gmail personal ni hay fallback a localhost en estos envíos; git grep de Resend como proveedor de envío = 0 fuera de auth.ts.
- Nodo(s): h2.cli-mensajes.aviso-por-email, h4.adm-mensajes, int.email, h4.adm-tickets, h4.adm-tickets.responder-y-avisar-por-email, int.brevo, h4.adm-clientes.tarea-para-aprobacion, h2.cli-proyecto, int.sentry, h4.adm-mensajes.responder, h2.cli-mensajes, modelo.Message
- Worktree: proximo/email-tx
- Estado: abierta

### [B-41] Notificaciones: destinatario por usuario y emisores reales
- Objetivo: Que cada usuario vea y marque solo sus notificaciones y que cada preferencia y promesa de aviso tenga un emisor real. · Hallazgos que cierra: [SEC-038], [FAL-013], [FAL-014]
- Archivos a tocar: src/app/(protected)/dashboard/layout.tsx y src/lib/actions/notifications.ts (lectura y marcado por userId de la sesión y organizationId; markNotificationReadAction es la que queda, como pide SEC-109); src/lib/actions/profile.ts y src/components/dashboard/ProfileForms.tsx (cada preferencia conectada a su emisor o fuera); src/lib/email/notify-message.ts; src/lib/tickets/actions.ts (Notification y alerta para SUPER_ADMIN en todas las prioridades y en la respuesta del cliente); src/components/dashboard/TicketReplyForm.tsx (copy); invariante: toda clave de NotificationPrefs tiene lector fuera de la UI. · Archivos que NO se tocan: src/actions/dashboard-actions.ts y src/actions/agency-actions.ts (dónde van las notificaciones del admin: decisión FROZEN; apuntar NotificationCenter a markNotificationReadAction y borrar markNotificationAsRead es SEC-109 en 'dashboard-actions libre: aprobación de entregas atómica y una sola action de notificaciones'); src/lib/alerts.ts (FROZEN-inferido).
- Zona: libre (la parte de src/actions/dashboard-actions.ts requiere decisión FROZEN)
- Tamaño: M · Riesgo: Bajo-medio: el cliente deja de ver notificaciones que hoy ve; las del equipo necesitan bandeja propia o solo email. · Prerrequisitos: [B-40]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: El cliente no ve ni puede marcar notificaciones dirigidas al SUPER_ADMIN (sin links a /admin/projects); cada toggle de preferencias cambia un envío real o ya no existe; la respuesta del cliente a un ticket de prioridad baja avisa al equipo; el invariante pasa.
- Nodo(s): h2.cli-shell, h2.cli-proyecto, h4.adm-proyectos, modelo.Notification, lib.actions, h2.cli-shell.notificaciones, h2.cli-proyecto.aprobar-o-pedir-cambios, h2.cli-shell.campana-notificaciones, h2.cli-proyecto.aprobacion-entregas, h4.adm-dashboard, h2.cli-cuenta, h2.cli-cuenta.preferencias-notificacion, modelo.Organization, h2.cli-soporte, h2.cli-soporte.responder-ticket, h4.adm-tickets, lib.alerts, modelo.Ticket
- Worktree: ahora/portal-soporte
- Estado: abierta

### [B-42] Un solo armador de CSV para leads (fórmulas neutralizadas y etiquetas legibles)
- Objetivo: Que todos los CSV de leads, del admin y del cliente, salgan del mismo helper con fórmulas neutralizadas y las etiquetas que ve el panel. · Hallazgos que cierra: [SEC-040], [BUG-071]
- Archivos a tocar: src/modules/chatbot/server/leads/csv/csvEscape.ts y buildLeadsCsv.ts (intentLabel() y categoryLabel(); borrar los mapas locales); src/lib/bulk-actions.ts (bulkExportLeads con rowToCsv y csvEscape); invariante que busque armados de CSV con join(',') fuera del helper y el caso en el invariante del CSV. · Archivos que NO se tocan: src/app/api/dashboard/chatbot/leads/export/route.ts salvo el import; la intención cruda en la UI y el toast de exportar (UX-028, UX-030) van en 'Leads del chatbot en el portal: intención legible, DQ sin perder NULL, copiar y exportar honestos'.
- Zona: libre
- Tamaño: S · Riesgo: Bajo. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: VH-040: un lead con nombre '=HYPERLINK(...)' sale neutralizado en el export masivo del admin; el CSV del cliente muestra la intención con la misma etiqueta que el panel; el invariante pasa.
- Nodo(s): h4.adm-clientes, h3.vis-widget-cliente, modelo.ChatbotLead, lib.actions, h3.adm-chatbots, h3.adm-chatbots.acciones-bulk, lib.chatbot.leads, h3.cli-chatbot
- Worktree: proximo/mi-chatbot
- Estado: abierta

### [B-43] Migraciones a producción con un mecanismo escrito y la limpieza de v2-unify
- Objetivo: Dejar escrito y funcionando un mecanismo que garantice que producción tiene todas las migraciones, verificar que no queda drift y resolver las orgs duplicadas por v2-unify. · Hallazgos que cierra: [BUG-014], [DEU-014], [BUG-019]
- Archivos a tocar: netlify.toml o raíz:.github/workflows/ci.yml (paso obligatorio de migrate status contra producción que bloquee si hay pendientes, o migrate deploy con conexión directa); docs/operations/00-entornos.md y DEPLOY.md (sacar 'Netlify lo aplica'); regla escrita para reconciliaciones (ningún DROP sin git grep de usos, migrate diff y backup); script de solo lectura con los SELECT de VH-033 y, si aparecen casos, la limpieza B0.3 (PLAN-1169) con dry-run. · Archivos que NO se tocan: prisma/migrations/* existentes (no se editan); prisma/schema.prisma; nunca prisma migrate reset (frenar y avisar ante cualquier conflicto); el resto de ci.yml (build, lint, e2e) va en [B-88].
- Zona: libre
- Tamaño: M · Riesgo: Alto: toca producción; la limpieza de orgs duplicadas solo con backup verificado, dry-run y aprobación de Valentino. · Prerrequisitos: [B-02]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-004 y VH-030: migrate status y migrate diff de solo lectura en dev y producción sin pendientes ni drift; un deploy con una migración pendiente queda bloqueado o la aplica; VH-033 ejecutado y las orgs duplicadas resueltas o documentadas; los docs ya no afirman autoaplicación.
- Nodo(s): lib.prisma, int.netlify, modelo.Organization, modelo.AgencySettings, modelo.ChatbotLead, modelo.Project, modelo.Task, h2.cli-proyecto, h4.adm-proyectos
- Worktree: proximo/datos
- Estado: abierta

### [B-44] Conexión a Neon: directUrl, timeouts y reintento ante cold start
- Objetivo: Que migraciones y seeds usen conexión directa y que login, contacto y chat aguanten el arranque en frío de Neon. · Hallazgos que cierra: [DEU-007], [BUG-020]
- Archivos a tocar: prisma/schema.prisma (directUrl = env('DIRECT_DATABASE_URL') en el datasource) y src/lib/prisma.ts (connect_timeout y pool_timeout; reintento acotado para P1001/P1017 solo en lecturas o rutas idempotentes), decisión de Valentino; .env.example; Netlify (DIRECT_DATABASE_URL). · Archivos que NO se tocan: prisma/migrations/*; nunca prisma migrate reset; src/modules/chatbot/* (el chat ya tiene su manejo).
- Zona: requiere decisión FROZEN (prisma/schema.prisma, src/lib/prisma.ts)
- Tamaño: M · Riesgo: Medio: un reintento mal acotado duplica escrituras; limitarlo a lecturas o a operaciones idempotentes. · Prerrequisitos: [B-43]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-034: tras 10 minutos de inactividad, el primer login y el primer envío de contacto funcionan; npx prisma migrate status usa la conexión directa; tsc --noEmit y build en verde.
- Nodo(s): lib.prisma, h1.auth-login, h6.vis-contacto, h3.vis-api-chatbot
- Worktree: proximo/datos
- Estado: abierta

### [B-45] Ciclo de vida del cliente: archivar corta acceso y crons, borrar no se lleva lo de la agencia
- Objetivo: Definir qué significa archivar y borrar un cliente: archivar corta acceso, bots y crons; borrar no se lleva pagos, horas ni tickets de la agencia, limpia sus usuarios y nunca toca la org de develOP. · Hallazgos que cierra: [SEC-014], [BUG-015], [BUG-138], [BUG-142], [DEU-005]
- Archivos a tocar: src/lib/preview.ts (resolveOrgId rechaza org con deletedAt con mensaje claro); src/modules/chatbot/server/admin/archiveClient.ts y hardDeleteClient.ts (rechazar la org de la agencia por slug o flag; pausar bots al archivar; contar y mostrar pagos, horas y leads; borrar o anonimizar en la misma transacción los User que solo pertenecían a esa org); src/app/(protected)/admin/clients/page.tsx y _components/ClientsListClient.tsx (excluir la org de la agencia; confirmar tipeando el nombre); helper de 'orgs activas' en src/app/api/cron/generate-insights, regenerate-briefs y send-weekly-reports. Decisiones: src/auth.ts (getUserAccessState mira deletedAt, Franco y Valentino) y prisma/schema.prisma (SetNull o snapshot en Ticket.userId, TicketMessage.userId y registros financieros, Valentino). · Archivos que NO se tocan: nunca prisma migrate reset; src/lib/leados/*; prisma/migrations existentes; las orgs archivadas en la bandeja de Mensajes (BUG-121) van en 'Mensajes y tickets: paginación, leído fuera del render, orgs archivadas y orden por actividad'.
- Zona: requiere decisión FROZEN (prisma/schema.prisma); ZONA-FRANCO para la parte de src/auth.ts
- Tamaño: L · Riesgo: Alto: borrados en cascada sobre datos financieros; VH-130 se verifica sin confirmar el borrado; backup verificado antes de cualquier prueba. · Prerrequisitos: [B-02], [B-14]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-012: un cliente archivado no entra al portal y ve un mensaje claro; los crons no procesan orgs con deletedAt; VH-130: la org develOP no aparece en Clientes y el servidor rechaza archivarla o borrarla; el resumen del hard-delete lista pagos, horas y leads; con la decisión FROZEN aplicada, borrar un User no borra tickets de otras orgs.
- Nodo(s): h1.auth-login.sesion-jwt, h4.adm-clientes, lib.auth, modelo.Organization, h2.cli-shell, h3.vis-api-chatbot, int.cron.send-weekly-reports, h4.adm-clientes.archivar-cliente, h4.adm-clientes.eliminar-cliente, modelo.Project, modelo.OsPaymentMilestone, modelo.OsMaintenancePayment, modelo.OsTimeEntry, modelo.User, modelo.OrgMember, modelo.ChatbotLead, h4.adm-clientes.eliminar-definitivo, h1.auth-login, h2.cli-cuenta, h4.adm-clientes.archivar, h3.vis-widget-develop, h4.adm-proyectos, int.cron.generate-insights, int.cron.regenerate-briefs, lib.chatbot.llm, int.brevo, modelo.Ticket, modelo.TicketMessage, h2.cli-soporte, h4.adm-tickets
- Worktree: proximo/datos
- Estado: abierta

### [B-46] Avisos post-lead confiables y acotados: outbox, Telegram escapado y tope del lead caliente
- Objetivo: Que los avisos post-lead (email al cliente, CRM, Telegram) no se pierdan en serverless, no manden datos personales al equipo sin opt-in y no se puedan disparar en serie desde el widget. · Hallazgos que cierra: [BUG-099], [BUG-100], [SEC-073], [SEC-075]
- Archivos a tocar: src/modules/chatbot/server/tools/captureLead.ts y showWhatsappHandoff.ts (outbox escrita en la misma transacción del lead + cron con reintentos, o await acotado; Telegram solo con identificadores y link al panel o con opt-in del cliente); src/lib/notifications/telegram.ts (parse_mode HTML con escape, links absolutos con NEXT_PUBLIC_APP_URL); src/modules/chatbot/server/quota/upsellAlert.ts; src/lib/client-notifications/decide.ts y notify.ts (tope por org del lead caliente y digest; caliente exige una señal comprobable en el texto del visitante); src/modules/chatbot/server/admin/integrations/retryCrmSync.ts. · Archivos que NO se tocan: prisma/schema.prisma (si el outbox pidiera tabla nueva: decisión FROZEN; alternativa con CrmSyncAttempt); src/modules/chatbot/server/crm/validateWebhookUrl.ts (otra tarjeta); la validación del contacto de show_whatsapp_handoff y el evento develop:lead (SEC-083, SEC-080) van en 'Widget público: el visitante no recibe datos internos y el embed valida con quién habla'.
- Zona: libre
- Tamaño: L · Riesgo: Medio: un outbox sin idempotencia duplica avisos; clave por lead y canal. · Prerrequisitos: [B-34], [B-14]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-101: con Brevo o n8n lentos el aviso llega igual por reintento y no se duplica; VH-102: un lead con '_*[' en el nombre llega a Telegram con link absoluto; VH-106: diez leads calientes seguidos producen a lo sumo el tope de mails por hora fijado en `client-notifications/decide.ts` (anotado en el PR) y un digest; el Telegram del equipo no recibe datos personales sin opt-in del cliente. [F7 B21]
- Nodo(s): h3.vis-api-chatbot, lib.chatbot.tools, int.brevo, int.n8n, int.telegram, h3.adm-chatbots.activar-pausar-eliminar, h3.adm-chatbots.historial-sync-crm, lib.chatbot.crm, modelo.CrmSyncAttempt, h3.adm-chatbots.integracion-crm, h3.cli-chatbot, lib.chatbot.quota, modelo.ChatbotLead, h2.cli-shell
- Worktree: proximo/post-lead
- Estado: abierta

### [B-47] El plan y un registro único de modelos como fuente de cupo, modelo y funciones de IA
- Objetivo: Que cupo, modelo, temperatura, salida máxima y funciones de IA salgan del plan del cliente y de un registro único de modelos por uso, no de campos legacy de BotConfig ni de literales repartidos. · Hallazgos que cierra: [BUG-024], [BUG-060], [BUG-110], [BUG-133], [TEC-003]
- Archivos a tocar: src/modules/chatbot/server/chat/handleChatRequest.ts (maxOutputTokens y temperatura por plan); registro único de modelos por uso (src/modules/chatbot/server/llm/providers/google.ts, src/lib/plan/fallback.ts, src/lib/ai/*) con la fecha de discontinuación de cada modelo en Vertex, y evaluar Haiku 5.5 para lib/ai; src/modules/chatbot/server/admin/detectBotIssues.ts, preflight y fichas del admin (getPlanForOrg().quota); editor de BotConfig del admin (campos legacy fuera o solo lectura con el valor del plan); src/app/(protected)/dashboard/page.tsx, src/lib/ai/executive-brief.ts, src/app/(protected)/dashboard/_actions/regenerate-brief.ts, src/app/api/cron/regenerate-briefs/route.ts y src/app/api/cron/generate-insights/route.ts (planAllows antes del LLM y del mail); src/lib/plan/plan-presentation.ts (lo que vende la vitrina); src/components/admin/managers/ChatbotManager.tsx (conversationsCount sobre monthlyQuota, sin división por cero). · Archivos que NO se tocan: prisma/schema.prisma (borrar columnas legacy de BotConfig: decisión FROZEN aparte); prisma/seeds/sync-plans.ts salvo lectura; la llamada real mínima del health (va en 'Que una caída del proveedor de IA se vea: health real, evento de error y derivación al visitante'); el pin exacto de ai@6 (TEC-004) va en [B-120] y [B-121].
- Zona: libre (decisión de producto: ¿brief e insights son de todos los planes?)
- Tamaño: L · Riesgo: Medio: si se gatea por plan, clientes Starter dejan de ver el brief; comunicarlo antes. Cambiar de modelo cambia las respuestas: correr las evals Q1. · Prerrequisitos: [B-07]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-062: con plan Starter el resumen ejecutivo no se muestra ni se regenera y el cron de insights no llama a Vertex para ese bot (o la vitrina dice que es de todos los planes); detector, preflight y ficha usan el mismo cupo que corta el chat; la ficha del cliente muestra conversaciones sobre cupo; VH-069: el modelo vigente vive en un solo registro con su fecha de discontinuación y git grep de ids de modelo literales fuera de él da 0.
- Nodo(s): h3.adm-chatbots, h4.adm-alertas, h3.vis-api-chatbot, modelo.BotConfig, modelo.Plan, lib.plan, lib.chatbot.llm, int.anthropic, h3.adm-chatbots.config-llm-y-cuota, h3.adm-chatbots.detalle-overview, lib.chatbot.chat, h2.cli-shell, h3.adm-chatbots.editar-config-bot, h4.adm-clientes.alta-cliente-con-bot, h4.adm-clientes.tab-chatbot, h2.cli-inicio.resumen-ejecutivo-ia, h2.cli-resultados.insights-ia, h2.cli-plan.vitrina-de-planes-y-upgrade, int.cron.regenerate-briefs, int.cron.generate-insights, lib.chatbot.insights, lib.chatbot.notifications, modelo.ChatbotInsight, h4.adm-clientes.resumen-chatbot, lib.chatbot.quota
- Worktree: proximo/plan-ia
- Estado: abierta

### [B-48] Aviso de cupo al dueño del bot: al 80 % y al degradarse
- Objetivo: Que el dueño del bot reciba un único email cuando su bot llega al 80 % del cupo del mes y otro cuando se degrada. · Hallazgos que cierra: [FAL-019]
- Archivos a tocar: src/lib/isolation/registry.ts (markAlert80IfFirst con UPDATE condicional sobre alert80Sent, como markDegradedIfFirst, y su caso en el invariante del helper); src/modules/chatbot/server/quota/ (triggerQuota80AlertIfFirst después de una reserva exitosa con used ≥ 0,8 × limit); src/modules/chatbot/server/quota/upsellAlert.ts (email al dueño también al degradar); src/lib/client-notifications/notify.ts (exportar resolveRecipientEmail); template 'usaste el 80 % de tus conversaciones' con link a /dashboard/plan. · Archivos que NO se tocan: prisma/schema.prisma (alert80Sent y alert80SentAt ya existen); el aviso a develOP al 80 % y el ítem en Atención hoy son de [B-193]; el email nunca entra en el camino del stream del chat.
- Zona: libre
- Tamaño: S · Riesgo: Medio: corre en el camino caliente del chat y manda emails reales a clientes; probar con el bot de QA en base local y con el envío fuera del stream (allSettled o after()). · Prerrequisitos: [B-07]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Con el bot de QA en base local, el turno que cruza el 80 % manda un solo email al leadNotificationEmail (alert80Sent queda en true y el turno siguiente no reenvía); al degradarse llega un segundo email; el invariante del helper de aislamiento cubre markAlert80IfFirst; el stream del chat no espera el envío.
- Nodo(s): h3.cli-chatbot, lib.chatbot.quota, int.brevo, modelo.QuotaUsage, lib.isolation, lib.chatbot.notifications
- Worktree: proximo/chat-runtime
- Estado: abierta

### [B-49] Respuestas largas del bot que no rompen la conversación
- Objetivo: Que una respuesta del bot de más de 4000 caracteres no deje la conversación en 400 en los turnos siguientes. · Hallazgos que cierra: [BUG-093]
- Archivos a tocar: src/modules/chatbot/server/chat/requestSchema.ts (largo validado solo en mensajes 'user'; los 'assistant' se truncan, no se rechazan); src/modules/chatbot/hooks/useChatbot.ts y shared/historyPolicy.ts (truncado en el widget con los caps canónicos); caso nuevo en el invariante del request. · Archivos que NO se tocan: reconstruir el historial 'assistant' desde la base va en 'Texto no confiable en prompts y en la salida del modelo'; maxOutputTokens lo fija 'Techo de gasto del chat público: IP confiable, cupo por intercambio real y abortos que cuentan'; prisma/schema.prisma.
- Zona: libre
- Tamaño: S · Riesgo: Bajo. · Prerrequisitos: [B-07]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: VH-100: tras una respuesta de 5000 caracteres el turno siguiente responde; un mensaje 'user' sobre el tope se sigue rechazando; el invariante del request cubre el caso.
- Nodo(s): h3.vis-api-chatbot, h3.vis-widget-cliente, lib.chatbot.chat, lib.chatbot.hooks
- Worktree: proximo/chat-runtime
- Estado: abierta

### [B-50] Techo real de Netlify medido: chat y crons largos dentro del límite
- Objetivo: Que el presupuesto del turno del chat y de los crons largos esté calibrado contra el timeout real de las funciones de Netlify. · Hallazgos que cierra: [TEC-006]
- Archivos a tocar: Medir VH-090 y VH-159 y dejar el techo documentado junto a netlify.toml; constante compartida ROUTE_MAX_DURATION_MS y HOOK_SAFETY_MARGIN_MS alineada a ese techo (src/app/api/chatbot/[slug]/chat/route.ts, src/modules/chatbot/server/chat/reconcile.ts); src/app/api/cron/send-executive-reports/route.ts y regenerate-briefs (Background Functions o lotes reanudables si superan el techo). · Archivos que NO se tocan: netlify.toml salvo declarar background functions; prisma/schema.prisma; el procesamiento por lotes del cron de insights (PERF-012) va en 'Cron de insights: costo visible y procesamiento por lotes'.
- Zona: libre
- Tamaño: M · Riesgo: Medio: depende de medir antes el techo real; un techo mal estimado corta respuestas o deja crons a medias. · Prerrequisitos: [B-07], [B-14]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-090 y VH-159 medidos y anotados junto a netlify.toml; la constante compartida refleja ese techo y la importan la ruta del chat y reconcile.ts; una corrida del reporte ejecutivo y del brief con N orgs de prueba termina dentro del techo o reanuda en la corrida siguiente.
- Nodo(s): int.netlify, h3.vis-api-chatbot, int.cron.send-executive-reports, int.cron.regenerate-briefs
- Worktree: proximo/chat-runtime
- Estado: abierta

### [B-51] System prompt fiel al rubro y a las tools habilitadas
- Objetivo: Que el system prompt describa solo las tools que el plan habilita y hable con el vocabulario del rubro del cliente, no con el de develOP o de concesionaria. · Hallazgos que cierra: [BUG-097], [UX-032]
- Archivos a tocar: src/modules/chatbot/server/prompts/sections.ts (sección 4 generada desde Object.keys(tools); solo reglas universales); src/modules/chatbot/server/verticals/packs/* (misión y regla de precios por pack); src/modules/chatbot/server/tools/offerHandoffOptions.ts y captureLead.ts (sin 'SLA <4hs'; descripciones de flags por pack). · Archivos que NO se tocan: prisma/seeds/sync-plans.ts salvo lectura; el spotlighting (va en 'Texto no confiable en prompts y en la salida del modelo').
- Zona: libre
- Tamaño: M · Riesgo: Medio: cambia el comportamiento de todos los bots; correr las evals Q1 por vertical antes y después. · Prerrequisitos: [B-47]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un bot Starter no menciona offer_handoff_options; el conteo de tools del prompt coincide con las habilitadas; un bot de restaurante no habla de vehículos ni de SLA; evals Q1.1 y Q1.2 sin regresión.
- Nodo(s): h3.vis-api-chatbot, lib.chatbot.prompts, lib.chatbot.tools, lib.chatbot.verticals
- Worktree: proximo/plan-ia
- Estado: abierta

### [B-52] Widget del cliente: su posición, color y nombre, aviso de IA con política y sin zoom en iOS
- Objetivo: Que la burbuja respete la posición, el color y el nombre que configura el cliente, que el widget avise que responde una IA con link a la política y que no haga zoom en iOS. · Hallazgos que cierra: [BUG-065], [FAL-018], [UX-027]
- Archivos a tocar: public/widget.js (leer position y accentColor de /config; title del iframe con el nombre del bot o la empresa); src/modules/chatbot/components/installation/platforms.ts; src/modules/chatbot/components/chat/ChatWindow.tsx y embed/ChatbotEmbed.tsx (aviso de IA en el empty state y en el primer mensaje con link a la política; textarea a 16 px en mobile); página de privacidad publicada (texto legal: decisión de Valentino). · Archivos que NO se tocan: src/app/layout.tsx y src/components/layout/ChatWidgetMount.tsx (peso: va en 'Peso del widget y del layout raíz'); no bloquear el zoom con maximum-scale; los avatares 3D (otra tarjeta); foco, Escape y z-index del widget (A11Y-008, UX-020) van en [B-149] y [B-150].
- Zona: libre (texto legal: decisión de Valentino)
- Tamaño: M · Riesgo: Bajo; verificar con visual-qa en 390 px y en un sitio de cliente de prueba. El texto legal lo aprueba Valentino antes de publicar. · Prerrequisitos: [B-36]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-093: en el sitio de prueba la burbuja aparece en la posición y el color configurados y el iframe se anuncia con el nombre del bot; VH-081: enfocar el input en iOS no hace zoom; el primer mensaje muestra el aviso de IA con link a una política publicada.
- Nodo(s): h3.vis-widget-cliente, h3.cli-chatbot.personalizacion, h3.adm-chatbots.editar-config-bot, modelo.BotConfig, h3.cli-chatbot, h3.vis-widget-cliente.chat-embebido, h3.cli-chatbot.instalacion, h3.vis-widget-develop, lib.chatbot.llm
- Worktree: proximo/widget
- Estado: abierta

### [B-53] Avatares del widget con red: sin WebGL o con el chunk caído, cae al monograma
- Objetivo: Que un fallo de WebGL o del chunk diferido de los avatares 3D no tumbe el widget ni la página. · Hallazgos que cierra: [BUG-081]
- Archivos a tocar: src/modules/chatbot/components/avatar/AvatarRenderer.tsx y HeavyAvatarsLazy.tsx (ErrorBoundary local que cae al Monograma con captureException; detectar WebGL antes de montar el canvas). · Archivos que NO se tocan: el fallback liviano de image/emoji y el estado por instancia de LegacyNeuroAvatar (BUG-082, BUG-083) van en 'Avatares del widget: fallback liviano, estado por instancia y LegacyNeuroAvatar limpio'; dpr y pausa fuera de viewport (PERF-009) van en 'Canvas 3D según la regla: dpr 1.5, pausa fuera de viewport y sin WebGL no montar'; src/components/3d/HeroArtifact.tsx (frozen).
- Zona: libre
- Tamaño: S · Riesgo: Bajo; verificar con WebGL deshabilitado en el navegador. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: VH-084: con WebGL deshabilitado se ve el monograma y el widget sigue respondiendo; un error forzado en el chunk del avatar aparece en Sentry y no tumba la página.
- Nodo(s): h3.vis-widget-cliente, h3.vis-widget-develop, h3.cli-chatbot, h3.adm-chatbots, int.sentry
- Worktree: proximo/widget
- Estado: abierta

### [B-54] Integraciones: distinguir error de vacío, reportar a Sentry y no cachear fallas
- Objetivo: Que GA4, Search Console, GBP, Tiendanube, PageSpeed, Cal.com y los crons distingan error de vacío, lo reporten a Sentry con su servicio, no cacheen fallas y no consulten en cada render. · Hallazgos que cierra: [BUG-033], [BUG-036], [BUG-041], [BUG-143], [FAL-029], [PERF-003]
- Archivos a tocar: Helper nuevo reportIntegrationFailure(servicio, error, contexto) con captureException, tag de servicio y flush; src/lib/analytics.ts y src/lib/searchconsole.ts (ok:false tipado sin mock cuando hay credenciales; unstable_cache por org y propiedad); src/lib/integrations/google-business-profile.ts (listReviews distingue error de vacío); src/lib/integrations/tiendanube.ts (!res.ok como error, paginación, stock null como ilimitado, carritos por fecha); src/lib/integrations/pagespeed.ts y cal-com.ts (cachear solo el ok; revalidateTag al conectar o desconectar); pantallas de Resultados, Reseñas, Tienda y PDF mensual (estado 'no pudimos actualizar' en vez de demo, CTA a develOP). · Archivos que NO se tocan: src/instrumentation.ts (la cubre 'Sentry que recibe en producción y sin ruta de prueba pública'); src/lib/integrations/cal-com-v2.ts (compartido con LeadOS); src/lib/notifications/telegram.ts salvo usar el helper; el error de Reputación distinto de 'pendiente de conexión' y la Performance API (UX-015) van en 'IDEA-003: lo que Google te trajo (llamadas, «cómo llegar» y clics), con el error distinto de «no conectado»'.
- Zona: libre
- Tamaño: L · Riesgo: Medio: hoy los datos demo tapan errores; al sacarlos, clientes sin integración ven estados vacíos: definir el copy antes. · Prerrequisitos: [B-22], [B-05], [B-21]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-137: con Tiendanube fallando una vez, la visita siguiente reintenta; VH-045: un producto sin control de stock no aparece 'Agotado'; con GA4 sin permiso se ve 'no pudimos actualizar' y un evento en Sentry con tag de servicio; Search Console y GA4 no se llaman en cada render; un error de la API de reseñas no dice 'Sin reseñas todavía'; el paso de GBP revocado de VH-134 produce un aviso.
- Nodo(s): h2.cli-tienda.resumen-de-ventas, int.tiendanube, h2.cli-resenas.responder-resenas-con-ia, int.gbp, h2.cli-resultados, int.ga4, int.search-console, int.sentry, h2.cli-resultados.informe-mensual-pdf, h2.cli-tienda.resumen-tienda, h2.cli-resultados.velocidad-sitio, h2.cli-resultados.reputacion-gbp, h2.cli-agenda, lib.premium-modules, int.brevo, int.telegram, int.cal-com, int.pagespeed, int.cron.detect-bot-issues, h2.cli-resultados.seo-search-console, h2.cli-resultados.trafico-ga4
- Worktree: ahora/integraciones
- Estado: abierta

### [B-55] Ficha del cliente: sección Integraciones (Cal.com, GA4, Google Business, Place ID)
- Objetivo: Que develOP pueda configurar desde la ficha del cliente Cal.com, la propiedad de GA4, Google Business y el Place ID, con una action validada, auditada y con credenciales cifradas. · Hallazgos que cierra: [FAL-004], [FAL-010], [FAL-011]
- Archivos a tocar: src/app/(protected)/admin/clients/[clientId]/_components/ (card o pestaña 'Integraciones' nueva); action nueva con requireSuperAdmin, Zod y logAdminAction que escriba calComUsername, calComEmbedUrl, calComApiKey (cifrada), googleMapsPlaceId, analyticsPropertyId numérico y la ubicación de GBP (gbpLocationId) según la cuenta decidida en VH-060; botón 'Conectar Google Business' sobre src/app/api/auth/google-business/start/route.ts (el state firmado ya existe); src/app/(protected)/dashboard/resultados/trafico/page.tsx (CTA cableado con requestUpsellAction o Link a Mensajes, sin renderizar result.error). Documentar el paso manual de dar acceso a la service account sobre cada propiedad. · Archivos que NO se tocan: prisma/schema.prisma (las columnas ya existen); src/app/bienvenida/* (lo decide 'Onboarding /bienvenida: decidir su destino y que el cliente no pueda fijar la propiedad de GA4'); src/lib/crypto/* (solo consumir); src/lib/leados/agenda.ts (ZONA-FRANCO).
- Zona: libre
- Tamaño: M · Riesgo: Medio: configurar Cal.com en un cliente rompe hoy la agenda del setter (BUG-038); por eso va después de la tarjeta de Franco que fija la org de develOP. · Prerrequisitos: [B-12], [B-16], [B-10], [B-19], [B-32]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Desde /admin/clients/[id] un SUPER_ADMIN carga Cal.com, GA4 y Place ID, conecta GBP y fija la ubicación, y el portal del cliente muestra Agenda, Tráfico, Reputación y el QR de reseñas sin tocar la base a mano; cada cambio deja AdminAuditLog; la API key de Cal.com queda cifrada; el CTA de Tráfico hace algo.
- Nodo(s): h2.cli-agenda, h2.cli-resenas, h4.adm-clientes, modelo.Organization, int.cal-com, h2.cli-resultados.trafico-ga4, h2.cli-bienvenida.wizard-3-pasos, int.ga4, h2.cli-resultados.reputacion-gbp, int.gbp, h4.adm-clientes.conectar-google-business, h2.cli-resenas.selector-sucursal
- Worktree: ahora/integraciones
- Estado: abierta

### [B-56] Inicio, Resultados y reporte ejecutivo sin números inventados ni de otra semana
- Objetivo: Que Inicio, Tráfico, SEO y el reporte ejecutivo muestren datos reales del período correcto y que el brief IA se lea del cache en vez de generarse en el render. · Hallazgos que cierra: [BUG-039], [BUG-048], [BUG-049], [UX-013], [PERF-004], [BUG-055]
- Archivos a tocar: src/app/(protected)/dashboard/resultados/trafico/page.tsx, seo/page.tsx y src/components/dashboard/AnalyticsMetricCard.tsx (sin tendencias literales; período anterior con segunda consulta o sin delta); src/lib/health-score.ts, src/lib/dashboard/attention.ts, src/components/dashboard/home/HealthScore.tsx y src/lib/recommendations/get-recommendations-for-org.ts (nivel de conexión derivado de columnas reales; el total no va al brief ni al email mientras diga 'calibrando'); src/lib/dashboard/home-metrics-logic.ts y su invariante (mismo tramo de la semana anterior); src/components/dashboard/OportunidadesSEO.tsx, OportunidadSEO.tsx y SeoAlertas.tsx (ubicación del perfil del negocio; CTAs ocultas con isMockData); src/app/(protected)/dashboard/page.tsx y src/lib/ai/executive-brief.ts (generar solo desde el cron y leer el cache en el render; marca del último intento fallido con backoff; registrar usage); src/lib/reports/executive-weekly/build.ts, src/lib/ai/executive-brief-input.ts y brief-history.ts (snapshot del periodKey de la semana reportada). · Archivos que NO se tocan: src/lib/dates-ar.ts (FROZEN-inferido, solo consumir); prisma/schema.prisma (dataConnections no se borra en este sprint); la reserva atómica del cupo de regeneraciones y los snapshots validados con Zod (SEC-043, DEU-031) van en 'IA del portal: fallos que no se cachean, snapshots validados y cupo atómico del brief'; visitas en 0, SEO del Health Score y 'Cuánto te generó la web' (BUG-051, BUG-053, UX-016) van en [B-116]; el cerrojo y el destinatario del reporte ejecutivo (BUG-026, BUG-057) van en 'Reporte ejecutivo semanal: un sendForOrg con cerrojo, destinatario estable y top correcto'.
- Zona: libre
- Tamaño: L · Riesgo: Medio: los números visibles cambian y el brief deja de aparecer al instante en orgs nuevas hasta la corrida del cron. · Prerrequisitos: [B-15], [B-14], [B-55]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: git grep de tendencias literales en Tráfico y SEO = 0; VH-057: con Vertex vencido, visitar el Inicio no llama al LLM; un martes el hero compara contra el mismo tramo de la semana anterior; VH-059: un reporte con snapshot viejo no sale con la etiqueta de la semana; Oportunidades SEO no dice Tucumán para un cliente de otra ciudad ni envía pedidos sobre datos de ejemplo; Health Score sale de 'calibrando' con GA4 y GBP conectados.
- Nodo(s): h2.cli-resultados, h2.cli-resultados.trafico-ga4, h2.cli-resultados.seo-search-console, h2.cli-resultados.trafico, h2.cli-resultados.seo, int.ga4, int.search-console, h2.cli-inicio.health-score, h2.cli-inicio.atencion-hoy, h2.cli-inicio.resumen-ia, modelo.Organization, lib.health-score, h2.cli-inicio.semana-en-numeros, h2.cli-inicio, h2.cli-resultados.oportunidades-seo, lib.chatbot.llm, int.anthropic, h2.cli-reportes-email.reporte-semanal, h4.adm-clientes, modelo.ExecutiveBriefSnapshot, h2.cli-reportes-email
- Worktree: ahora/portal-inicio
- Estado: abierta

### [B-57] Portal del cliente: cada action devuelve un error útil y lo reporta a Sentry
- Objetivo: Que cada action y pantalla del portal del cliente muestre un error útil, libere los botones, confirme lo destructivo y reporte a Sentry. · Hallazgos que cierra: [FAL-015], [BUG-045], [UX-010], [BUG-070], [UX-029]
- Archivos a tocar: src/components/dashboard/NewTicketModal.tsx y ResolveTicketButton.tsx (try/finally, error visible, confirmación de 'Marcar como resuelto'); src/app/(protected)/dashboard/_actions/executive-report-prefs.actions.ts y src/components/dashboard/NotificationCenter.tsx; src/app/(protected)/dashboard/resultados/seo/page.tsx (CTA en client component con useActionState) y src/lib/actions/upsell.ts (resolveOrgId); src/modules/chatbot/components/dashboard/LeadDetail.tsx, LeadStatusActions.tsx y server/admin/updateLeadStatus.ts (res.ok, textos en castellano, safeParse, captureException); BotPersonalization.tsx y server/dashboard/updateBotAppearance.ts (mínimo en el cliente, errores por campo); captureException en los catch de src/lib/tickets/actions.ts, src/lib/reports/executive-weekly/send.ts, src/lib/referrals/referrals.service.ts, src/app/api/reports/client-monthly/route.ts y src/lib/ai/executive-brief.ts, y alerta cuando un cron termina con failed > 0. · Archivos que NO se tocan: src/lib/action-utils.ts (FROZEN; toErrorMessage y los errores crudos de Brevo, Google y Anthropic, SEC-092 y SEC-046, van en 'Errores crudos a la UI: toErrorMessage solo pasa UserFacingError y el resto va a Sentry'); los catch de integraciones (van en 'Integraciones: distinguir error de vacío, reportar a Sentry y no cachear fallas'); src/components/ui/* (FROZEN).
- Zona: libre
- Tamaño: M · Riesgo: Bajo. · Prerrequisitos: [B-05]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-053: con la red cortada, crear ticket y 'Marcar como resuelto' muestran error y los botones vuelven; 'Marcar como resuelto' pide confirmación; ACTIVAR AHORA de SEO muestra 'Solicitud enviada' o el error; un cambio de estado de lead fallido no dice 'Guardado'; un error forzado en cada action aparece en Sentry.
- Nodo(s): int.sentry, h2.cli-soporte, h2.cli-reportes-email, h2.cli-referidos, h2.cli-resultados.informe-mensual-pdf, lib.actions, int.anthropic, h2.cli-inicio, h2.cli-soporte.crear-ticket, h2.cli-soporte.resolver-ticket, h2.cli-reportes-email.preferencias-reporte, h2.cli-shell.campana-notificaciones, h2.cli-resultados.seo-solicitar-activacion, h3.cli-chatbot, lib.chatbot.admin, h3.cli-chatbot.contacto-detalle, h3.cli-chatbot.acciones-rapidas-lead, h3.cli-chatbot.estado-lead, modelo.ChatbotLead, h3.cli-chatbot.personalizacion
- Worktree: ahora/portal-soporte
- Estado: abierta

### [B-58] Admin: errores esperados como resultado tipado, no throw
- Objetivo: Que las actions del admin, altas incluidas, devuelvan los errores esperados como resultado tipado que la UI muestra, sin un evento de Sentry por cada validación ni JSON crudo de Zod. · Hallazgos que cierra: [UX-040], [UX-050], [DEU-038], [UX-021], [BUG-076]
- Archivos a tocar: src/modules/chatbot/server/admin/updateClient.ts, updateClientInternalNotes.ts, archiveClient.ts y las actions de Clientes (ActionResult como plan.actions); src/modules/chatbot/server/admin/createClientWithBot.ts y createClientOnly.ts ({ ok:false, error } para email existente y validación; throw solo para lo inesperado); src/app/(protected)/admin/clients/[clientId]/edit/EditClientForm.tsx y ClientsListClient.tsx (mostrar result.error); src/app/(protected)/admin/referrals/_components/referrals-admin-table.tsx, src/components/admin/managers/ProjectManager.tsx y VaultManager.tsx (error visible, incluido el que ahora devuelve agency-actions, y router.refresh tras éxito); src/modules/chatbot/server/admin/saveKnowledgeBase.ts, saveKnowledgeBaseByOrgSlug.ts y saveBotConfigByOrgSlug.ts (una action por recurso con sanitizeErrorMessage; borrar ramas muertas del editor); BehaviorTab.tsx y BotConfigEditor.tsx (validación en el cliente con el mismo schema y mensaje legible). · Archivos que NO se tocan: src/actions/agency-actions.ts salvo leer su ActionResult (la cambia 'Guardia SUPER_ADMIN al lado del dato en /admin (páginas, actions y rutas)'); src/lib/action-utils.ts (FROZEN); el mensaje crudo de Prisma o SDK (SEC-062) va en 'Errores crudos a la UI: toErrorMessage solo pasa UserFacingError y el resto va a Sentry'; los ids inestables y los cambios fantasma del editor (BUG-079) van en [B-148].
- Zona: libre
- Tamaño: M · Riesgo: Bajo. · Prerrequisitos: [B-10]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-118: en build de producción, un email repetido en Editar datos muestra el motivo; VH-075: un alta con email repetido en build de producción muestra el motivo; VH-129: crear entregable y subir a la Bóveda muestran el error y refrescan con éxito; un error de Zod en el editor del bot se ve en el campo y no como JSON; el KnowledgeTab usa una sola action; una validación esperada no genera evento en Sentry.
- Nodo(s): h4.adm-clientes.editar-datos, h4.adm-clientes.notas-internas, h4.adm-clientes.archivar, h4.adm-clientes.eliminar, int.sentry, h4.adm-clientes.eliminar-definitivo, lib.actions, h4.adm-referidos.gestion-estados, h4.adm-clientes.crear-entregable, h4.adm-clientes.boveda-carga, h4.adm-clientes.tab-boveda, h3.adm-chatbots.editar-config-bot, h3.adm-chatbots.editar-kb, lib.chatbot.admin, h3.adm-chatbots.editar-config, h4.adm-clientes.alta-cliente-con-bot, h4.adm-clientes.alta-cliente-sin-bot, h3.adm-chatbots.alta-cliente-con-bot, h4.adm-clientes.alta-sin-bot
- Worktree: proximo/admin-errores
- Estado: abierta

### [B-59] Activación de bots solo con preflight en el servidor y KB sin plantillas sin editar
- Objetivo: Que ningún camino (alta, toggle, bulk) active un bot sin pasar el preflight en el servidor y que una KB con {{placeholders}} o secciones idénticas a la plantilla no lo pase. · Hallazgos que cierra: [BUG-073], [BUG-075]
- Archivos a tocar: src/app/(protected)/admin/chatbots/[botId]/actions.ts y bulk-actions.ts (toggleBotActiveAction y bulkActivateBotsAction corren runPreflightChecks y rechazan 'fail'); src/modules/chatbot/server/admin/preflightChecks.ts (bloquear {{...}} y secciones idénticas a la plantilla); src/modules/chatbot/components/admin/onboarding/kb-templates/* (ejemplos como guía, no contenido afirmativo; marcar en el paso 3 qué frases son de ejemplo); createClientWithBot.ts y el asistente (bot creado pausado o con el mismo preflight); ActivationModal.tsx solo lee el resultado del servidor. · Archivos que NO se tocan: prisma/schema.prisma; requireSuperAdmin y Zod en runPreflightChecks (los pone 'Guardia SUPER_ADMIN al lado del dato en /admin (páginas, actions y rutas)').
- Zona: libre
- Tamaño: M · Riesgo: Medio: bots activos hoy con placeholders quedarían bloqueados al re-activarse; listarlos antes con una consulta de solo lectura (VH-072). · Prerrequisitos: [B-10]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-072: una KB con {{placeholders}} no pasa el alta, el toggle ni el bulk, y el servidor responde con el motivo; un bot con la KB completa se activa por los tres caminos; la lista de bots activos con placeholders queda documentada antes del cambio.
- Nodo(s): h4.adm-clientes.alta-cliente-con-bot, h4.adm-clientes.plantilla-kb-industria, h3.adm-chatbots.activar-bot-preflight, lib.chatbot.prompts, modelo.KnowledgeBase, h3.adm-chatbots.crear-bot, h3.adm-chatbots.activar-pausar-eliminar, lib.onboarding, modelo.BotConfig, h3.adm-chatbots, h3.adm-chatbots.crear-bot-org-existente, h3.adm-chatbots.preflight-activacion, lib.chatbot.admin
- Worktree: proximo/admin-chatbots
- Estado: abierta

### [B-60] Alta con bot: la contraseña temporal no depende del mail de bienvenida
- Objetivo: Que el alta de cliente con bot devuelva las credenciales aunque Brevo falle o tarde, avise si el mail no salió y permita reenviarlo. · Hallazgos que cierra: [BUG-064], [BUG-077]
- Archivos a tocar: src/modules/chatbot/server/admin/createClientWithBot.ts y src/lib/onboarding/core.ts (credenciales devueltas antes del email, envío con after() o cola y emailSent hacia la UI); src/app/(protected)/admin/chatbots/new/actions.ts, CreateBotForm.tsx y Step5Review.tsx (contraseña temporal visible una sola vez para el SUPER_ADMIN que hizo el alta, aviso 'mail no enviado' y botón de reenvío). · Archivos que NO se tocan: el reenvío reusa el endpoint de 'Reenviar credenciales solo a cuentas de cliente, con destinatario fijo y aviso a la cuenta'; src/lib/email/brevo-service.ts salvo leer el resultado; prisma/schema.prisma.
- Zona: libre
- Tamaño: M · Riesgo: Medio: mostrar la temporal en pantalla es coherente con SEC-087 solo si se muestra una vez, al SUPER_ADMIN que hizo el alta, y nunca se loguea. · Prerrequisitos: [B-58], [B-29]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-096: con Brevo lento o caído la contraseña temporal aparece en pantalla al terminar el alta y el admin ve 'mail no enviado' con reenvío; con Brevo sano el mail llega y la pantalla lo confirma; la temporal no aparece en logs ni en Sentry.
- Nodo(s): h3.adm-chatbots.crear-bot, h4.adm-clientes.alta-cliente-con-bot, int.brevo, lib.onboarding
- Worktree: proximo/admin-chatbots
- Estado: abierta

### [B-61] Pack vertical asignable al crear un bot y desde el tab Avanzado
- Objetivo: Que develOP pueda asignar el pack vertical de un bot nuevo o existente, validado contra el registry. · Hallazgos que cierra: [FAL-017]
- Archivos a tocar: src/modules/chatbot/server/admin/createBot.ts y el alta con bot (campo verticalPack con Zod contra las claves del registry); src/modules/chatbot/components/admin/config/tabs/AdvancedTab.tsx y su action de guardado (selector del pack). · Archivos que NO se tocan: prisma/schema.prisma (verticalPack ya existe); el backfill de verticalPack en bots existentes es un script aparte con dry-run; el resto del editor (ids, CRM, accesibilidad) va en [B-148].
- Zona: libre
- Tamaño: S · Riesgo: Bajo: cambiar el pack cambia el prompt del bot; correr las evals Q1 del vertical tocado. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un bot nuevo creado con un pack lo guarda y el prompt usa ese pack; un valor fuera del registry se rechaza en el servidor; el tab Avanzado muestra y cambia el pack de un bot existente.
- Nodo(s): h3.adm-chatbots, lib.chatbot.verticals, modelo.BotConfig, h4.adm-clientes.alta-cliente-con-bot, h3.adm-chatbots.editar-config-bot, h3.adm-chatbots.editar-config, h3.vis-whatsapp, lib.chatbot.scoring
- Worktree: proximo/admin-chatbots
- Estado: abierta

### [B-62] Mi Chatbot: el detalle del contacto con su conversación y métricas que salen de la base
- Objetivo: Que el cliente vea la conversación de cada contacto, métricas reales del mes, un embudo que no cuente contactos deshechos y los pedidos de contacto que tomó el bot. · Hallazgos que cierra: [BUG-084], [BUG-085], [BUG-069], [BUG-098]
- Archivos a tocar: src/modules/chatbot/components/dashboard/LeadDetail.tsx (roles contra el enum ChatMessageRole o reusar TranscriptDetail); ChatbotOverview.tsx, src/app/(protected)/dashboard/chatbot/page.tsx, src/modules/chatbot/lib/business-metrics.ts y server/admin/multiTenantQueries.ts (conteo del mes sin DQ; valor estimado fuera o rotulado; latencia real o fuera); LeadStatusActions.tsx, lead-status-rules.ts y server/admin/updateLeadStatus.ts (deshacer restaura el firstContactedAt previo); server/tools/confirmContactRequest.ts (marcar el pedido en el lead y destacarlo en el email). · Archivos que NO se tocan: prisma/schema.prisma (si marcar el pedido exigiera columna: usar metadata existente o decisión FROZEN); src/lib/dashboard/home-metrics-logic.ts salvo el caso de deshacer; el bot pausado (va en 'Bot pausado coherente: tarjeta de WhatsApp en el widget y estado claro en Mi Chatbot'); src/modules/chatbot/server/scoring/dqFilter.ts (BUG-101 va en 'Leads del chatbot en el portal: intención legible, DQ sin perder NULL, copiar y exportar honestos').
- Zona: libre
- Tamaño: M · Riesgo: Bajo. · Prerrequisitos: [B-11], [B-15]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-086: el detalle del contacto muestra la conversación; VH-087: oportunidades, valor y tiempo de respuesta coinciden con una consulta de solo lectura a la base o no se muestran; deshacer el primer contacto no lo cuenta en el embudo ni en la velocidad de respuesta; un confirm_contact_request aparece marcado en el lead y destacado en el email.
- Nodo(s): h3.cli-chatbot, h3.cli-chatbot.contacto-detalle, modelo.ChatMessage, h3.cli-chatbot.resumen, modelo.ChatbotLead, modelo.QuotaUsage, lib.chatbot.lib, lib.chatbot.admin, h2.cli-inicio, h2.cli-reportes-email, lib.chatbot.leads, h3.vis-api-chatbot, lib.chatbot.tools, modelo.ChatbotEvent
- Worktree: proximo/mi-chatbot
- Estado: abierta

### [B-63] Reporte semanal del chatbot: baja que funciona, destinatario fijo, total real y envío manual sin duplicados
- Objetivo: Que el cliente pueda darse de baja del reporte semanal del chatbot, que el reporte vaya a un destinatario determinístico con el total real de leads y que 'Enviar reportes ahora' no reenvíe la misma semana. · Hallazgos que cierra: [FAL-020], [BUG-096], [BUG-135]
- Archivos a tocar: src/modules/chatbot/server/reports/sendWeeklyReports.ts y src/lib/email/templates/weekly-report.ts (opt-out por POST y List-Unsubscribe con el token de la tarjeta de bajas, leadNotificationEmail como destinatario con orderBy determinista, fallar si falta la URL; o unificar con el reporte ejecutivo); src/modules/chatbot/server/reports/buildWeeklyReport.ts (count separado de la lista de 10); src/app/(protected)/admin/settings/reports/ReportSettingsClient.tsx y src/app/api/admin/reports/send-now/route.ts (confirmación 'vas a mandar N emails', dedupe por bot y semana con WeeklyReportLog, rate limit por admin). · Archivos que NO se tocan: prisma/schema.prisma (WeeklyReportLog ya existe); src/app/api/email/unsubscribe-executive/route.ts (lo cubre 'Bajas de email que se respetan: Brevo, tenant correcto y confirmación por POST'); el helper único de URL base (BUG-059) es de 'Emails: URL base única sin fallback y plantillas que escapan lo que interpolan'; el texto que culpa al cliente con cero conversaciones (UX-033) va en [B-120] y [B-121].
- Zona: libre
- Tamaño: M · Riesgo: Medio: manda emails reales; probar con base local y una lista de prueba. · Prerrequisitos: [B-18]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: El reporte semanal trae una baja que funciona por POST y por List-Unsubscribe y, tras darse de baja, la semana siguiente no llega; con 25 leads el total dice 25 y el delta compara contra el mismo conteo; dos clics en 'Enviar reportes ahora' piden confirmación con la cantidad y no reenvían la misma semana; con dos admins en la org, el destinatario es siempre el mismo.
- Nodo(s): h3.cli-chatbot, lib.chatbot.reports, int.brevo, int.cron.send-weekly-reports, h3.cli-chatbot.reporte-semanal-email, modelo.ChatbotLead, h4.adm-config.reportes-semanales, modelo.ChatbotEvent
- Worktree: proximo/mi-chatbot
- Estado: abierta

### [B-64] Insights del chatbot: los pendientes viejos expiran y el motor no se congela
- Objetivo: Que el cron de insights expire los PENDING viejos para que el motor siga generando descubrimientos aunque nadie los aplique. · Hallazgos que cierra: [BUG-023]
- Archivos a tocar: src/app/api/cron/generate-insights/route.ts o src/modules/chatbot/server/insights/generateInsights.ts (los PENDING de más de N días pasan a IGNORED antes de contar el tope de 5); caso nuevo en el test del cron. · Archivos que NO se tocan: los botones Aplicar y Descartar en Análisis y el link del email (la otra mitad de BUG-023) van en [B-192]; src/modules/chatbot/server/insights/manageInsight.ts; el gate de plan del cron (va en 'El plan y un registro único de modelos como fuente de cupo, modelo y funciones de IA').
- Zona: libre
- Tamaño: S · Riesgo: Bajo: el cron vuelve a llamar a Vertex para bots que estaban trabados; medir el costo de una corrida. · Prerrequisitos: [B-47]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Con un bot de prueba con 5 insights PENDING de más de N días, la corrida siguiente los pasa a IGNORED y genera nuevos; los PENDING recientes no se tocan; el test del cron cubre el caso.
- Nodo(s): h3.cli-chatbot, h2.cli-resultados, int.cron.generate-insights, lib.chatbot.llm, modelo.ChatbotInsight, lib.chatbot.insights
- Worktree: proximo/plan-ia
- Estado: abierta

### [B-65] Campañas sin doble envío: estado SENDING, confirmación, edición real e importación por lotes
- Objetivo: Que una campaña no se envíe dos veces ni sin confirmación, que 'Editar' edite la misma campaña, que la importación vaya por lotes con conteo honesto y que los contactos se puedan paginar y dar de baja. · Hallazgos que cierra: [BUG-025], [BUG-029], [BUG-030], [BUG-031], [FAL-008]
- Archivos a tocar: src/app/(protected)/dashboard/modules/email-marketing/_actions.ts (DRAFT → SENDING con updateMany condicional; reintento de FAILED con brevoCampaignId; updateCampaignAction con Zod y org de la sesión; importación por lotes con contacts/import de Brevo y conteo de creados, actualizados y fallidos); campaigns/new/page.tsx (guardar siempre como borrador; enviar desde /send con confirmación y cantidad; try/catch; sin el useActionState muerto); campaigns/page.tsx (edición real o sin botón; métricas ocultas hasta tener una getCampaignStats correcta, que hoy cuenta listas como destinatarios y solo softBounces); contactos/page.tsx (paginación y búsqueda server-side; baja y borrado por contacto); src/lib/integrations/brevo.ts. · Archivos que NO se tocan: prisma/schema.prisma (SENDING y SCHEDULED ya existen); las rutas de baja (van en 'Bajas de email que se respetan: Brevo, tenant correcto y confirmación por POST'). Si se corrige y usa getCampaignStats, POD-364 de 'Plataforma: configs tipadas, dependencias reales, Sentry sin duplicados y recursos propios' deja de aplicar.
- Zona: libre
- Tamaño: L · Riesgo: Medio: envíos reales; probar con una lista de prueba en Brevo. · Prerrequisitos: [B-17], [B-18]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-039: dos clics rápidos en 'Enviar' producen un solo envío y las métricas se actualizan o no se muestran; VH-044: Enter no envía; 'Editar' abre la campaña y guarda sobre la misma; importar 5000 filas no hace 5000 llamadas en serie y el resumen distingue los fallidos; la lista de contactos pagina.
- Nodo(s): h2.cli-email-mkt, int.brevo, modelo.EmailCampaign, h2.cli-email-mkt.metricas-de-campana, h2.cli-email-mkt.crear-y-enviar-campana, h2.cli-email-mkt.importar-contactos, modelo.EmailContact, h2.cli-email-mkt.listar-contactos
- Worktree: ahora/email-mkt
- Estado: abierta

### [B-66] Precio de los módulos premium en una sola fuente, sin borrar activaciones
- Objetivo: Que el precio de cada módulo premium tenga una sola fuente, que un campo vacío no lo publique a USD 0 y que el sync del catálogo no borre activaciones de clientes. · Hallazgos que cierra: [BUG-017], [BUG-134], [BUG-016], [UX-006]
- Archivos a tocar: Decidir la fuente (DB o código). src/components/sections/modulos-opcionales/ModuloActiveCard.tsx; src/app/(protected)/admin/settings/_actions/settings.actions.ts, settings.schemas.ts y _components/settings-console.tsx (rechazar vacío en cliente y servidor, confirmar el cambio, auditar); prisma/seeds/sync-premium-modules.ts (dry-run por defecto, $transaction, DEPRECATED en vez de borrar, no tocar precios si la fuente es la DB); src/app/(protected)/dashboard/modules/motor-resenas/_components/LockedView.tsx (precio del catálogo); src/lib/data/premium-modules.ts. · Archivos que NO se tocan: prisma/schema.prisma (el enum DEPRECATED ya existe); la home del rediseño (coordinar con rediseno/home).
- Zona: libre
- Tamaño: M · Riesgo: Medio: correr el sync nuevo contra producción solo en dry-run primero. · Prerrequisitos: [B-17]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: La home pública y el portal muestran el mismo precio después de editarlo en el admin y de correr el sync; guardar un precio vacío se rechaza en cliente y servidor; el sync en dry-run lista cambios y no borra activaciones PAUSED, CANCELLED ni INACTIVE; la vista de venta de reseñas no muestra '[FALTA:precio]'.
- Nodo(s): h4.adm-config, h4.adm-config.precio-modulos, h2.cli-servicios, lib.data, modelo.PremiumModule, h4.adm-config.precios-modulos, modelo.OrganizationModule, h2.cli-resenas.vista-de-venta
- Worktree: proximo/catalogo-facturacion
- Estado: abierta

### [B-67] Facturación: decidir dónde vive y dar al admin el ciclo de cobro
- Objetivo: Decidir si la facturación es interna o externa y, según eso, darle al admin el ciclo de cobro (facturas, renovación, estado, módulos) o sacar del portal lo que depende de datos sin escritor. · Hallazgos que cierra: [FAL-006], [FAL-023], [FAL-005], [BUG-050], [BUG-010], [BUG-115], [BUG-116]
- Archivos a tocar: Si es interna: módulo Facturación en src/app/(protected)/admin/clients/[clientId] (alta de Invoice con monto del plan o override vigente, marcar pagada, renovación y estado ACTIVE/PAST_DUE/CANCELLED con auditoría); action para activar, pausar o cancelar módulos premium (src/lib/premium-modules.ts con priceLockedUsd y activatedAt); src/app/(protected)/admin/clients/_actions/plan.actions.ts y plan.schemas.ts (cancelar downgrade programado; precio de override obligatorio y confirmación si es 0 o menor al plan); BillingOverrideForm.tsx y PlanAssignmentForm.tsx/Card.tsx; src/lib/billing/get-current-plan.ts, src/app/(protected)/dashboard/cuenta/facturacion/page.tsx, src/components/dashboard/CurrentPlanCard.tsx y SubscriptionBanner.tsx (precio efectivo; renewalDate real o rótulo sin fecha). Si es externa: ocultar historial y avisos que dependen de Invoice, status y renewalDate y sacarlos del MRR. · Archivos que NO se tocan: prisma/schema.prisma (Subscription.price se borra solo por decisión FROZEN); src/lib/alerts.ts (FROZEN-inferido); src/app/(protected)/admin/page.tsx salvo el cálculo del MRR; la lectura única del plan por request (PERF-005) va en 'Plan efectivo: una lectura por request y el estado de la suscripción'.
- Zona: libre (decisión de Valentino sobre dónde vive la facturación)
- Tamaño: L · Riesgo: Alto: dinero; cada cambio de precio o estado se confirma y se audita. · Prerrequisitos: [B-66], [B-28]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: La decisión queda escrita; VH-116: el billing override con precio vacío se rechaza; VH-117: un downgrade programado se cancela desde la ficha con registro de auditoría; el portal muestra el precio efectivo y una próxima facturación que sale de renewalDate o no aparece; activar o pausar un módulo desde el admin cambia lo que ve el cliente.
- Nodo(s): h2.cli-plan, h4.adm-clientes, h4.adm-dashboard, modelo.Invoice, modelo.Subscription, lib.plan, h2.cli-cuenta.historial-de-facturas, h4.adm-clientes.facturacion, h2.cli-cuenta, h2.cli-servicios, modelo.OrganizationModule, modelo.PremiumModule, lib.actions, lib.premium-modules, lib.subscription, modelo.Plan, h4.adm-clientes.plan, h4.adm-clientes.billing-override, lib.audit-log
- Worktree: proximo/catalogo-facturacion
- Estado: abierta

### [B-68] Contactos, SLA y promesas de develOP desde una sola fuente
- Objetivo: Que WhatsApp, email, SLA y fechas que develOP le promete al cliente salgan de una sola fuente y que no queden botones sin acción. · Hallazgos que cierra: [UX-009], [BUG-054], [BUG-180], [FAL-012], [FAL-027]
- Archivos a tocar: src/lib/whatsapp.ts (getWhatsappHref como única puerta); src/lib/agency-settings.ts (leer AgencySettings con caché) o quitar esos campos de settings-console.tsx; src/modules/chatbot/components/dashboard/ChatbotUpsellLanding.tsx (precio y cupo de PLAN_PRESENTATIONS; CTA por requestUpsellAction); src/components/ia/CalculadorIA.tsx y PortalDemoCTA (getWhatsappHref); src/components/dashboard/PremiumModuleCard.tsx y ServiceDetailModal.tsx (sin 'Q3 2026' fijo); constante única de SLA para src/app/(protected)/dashboard/soporte/page.tsx, MessageThread.tsx y TicketReplyForm.tsx; src/components/dashboard/SoporteBoard.tsx (Guía, FAQ y Tips con contenido o fuera); unificar hola@ y hello@. · Archivos que NO se tocan: src/components/ui/* (FROZEN); el número de CalculadorIA lo decide una persona (whatsapp.ts:15-19 lo deja a propósito); el WhatsApp del pie del home (BUG-144) va en [B-190]; medir el SLA y escalar lo no contestado (IDEA-005) va en 'IDEA-005: SLA de soporte, con lo no contestado escalado por Telegram y marcado en la bandeja'.
- Zona: libre
- Tamaño: M · Riesgo: Bajo: acordar números y SLA con Valentino antes. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-169: los CTA de WhatsApp del portal, el upsell, CalculadorIA y PortalDemoCTA usan getWhatsappHref (git grep de 'wa.me/' fuera de src/lib/whatsapp.ts y del pie del home = 0); el upsell del chatbot no muestra precio falso ni número de relleno; un único SLA en el portal; ningún botón de Soporte sin acción; cambiar el email de la agencia en Configuración cambia el que ve el cliente, o el campo ya no existe.
- Nodo(s): h2.cli-servicios.vitrina-modulos, h2.cli-soporte, h2.cli-mensajes, h2.cli-bienvenida, h2.cli-servicios, h2.cli-mensajes.conversacion, h2.cli-plan, lib.plan, h2.cli-servicios.vitrina-de-modulos, h2.cli-resenas, lib.premium-modules, h3.cli-chatbot, h3.cli-chatbot.activacion-upsell, lib.chatbot.admin, h3.cli-chatbot.upsell-activacion, modelo.Plan, h6, lib.whatsapp, h2.cli-soporte.tablero-tickets, h4.adm-config.datos-y-alertas, modelo.AgencySettings, h6.vis-contacto.canales-directos, lib.agency-settings
- Worktree: proximo/promesas
- Estado: abierta

### [B-69] Fechas del portal y del admin en hora Argentina
- Objetivo: Que fechas y horas del portal y del admin se muestren en hora argentina y que las fechas sin hora no se corran un día. · Hallazgos que cierra: [BUG-034], [BUG-128]
- Archivos a tocar: src/app/(protected)/dashboard/page.tsx, modules/agenda-inteligente/page.tsx, soporte/[ticketId]/page.tsx, services/page.tsx y demás formateos de server components (formatDateAR, formatTimeAR, TZ_AR de src/lib/dates-ar.ts); src/app/(protected)/admin/projects/_actions/project.schemas.ts y los schemas de horas (parsear 'YYYY-MM-DD' como fecha calendario); project-card.tsx, time-entry-panel.tsx, projects-filters.ts y las fechas límite del plan y del billing override; invariante que exija timeZone en los formateos (excluye por ahora src/lib/leados y (protected)/setter). · Archivos que NO se tocan: src/lib/dates-ar.ts y src/lib/tz-ar.ts (FROZEN-inferido: solo se consumen; fundirlos, los KPIs del dashboard del admin, alerts.ts y el análisis mensual van en [B-110]); el setter (ZONA-FRANCO, va en 'Fechas del setter en día calendario argentino').
- Zona: libre
- Tamaño: M · Riesgo: Bajo: las fechas ya guardadas a medianoche UTC se leen bien si el formateo usa la zona. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-047: el saludo, la fecha del Inicio y la hora de los turnos coinciden con la hora argentina en el deploy; VH-123: la entrega estimada no se corre un día; las horas cargadas y las fechas límite del plan y del billing override muestran el día guardado; el invariante falla si se agrega un toLocale* o Intl.DateTimeFormat sin timeZone fuera de las exclusiones.
- Nodo(s): h2.cli-inicio, h2.cli-agenda.panel-de-agenda, h2.cli-cuenta, lib.dates-ar, h2.cli-soporte.conversacion-ticket, h2.cli-servicios.servicios-contratados, lib.tz-ar, h2.cli-mensajes, h2.cli-soporte, h2.cli-resultados.trafico, h1.auth-impersonacion, h2.cli-resultados, h3.cli-chatbot.conversaciones, h3.cli-chatbot.resumen, h3.cli-chatbot, h4.adm-proyectos.tablero-kanban, h4.adm-proyectos.horas, modelo.Project, modelo.OsTimeEntry, h4.adm-clientes.billing-override, h4.adm-clientes.plan, h4.adm-clientes.tab-chatbot, h4.adm-proyectos.carga-horas, h4.adm-equipo.workload
- Worktree: proximo/fechas
- Estado: abierta

### [B-70] Proyectos del admin: alta, edición y borrado coherentes
- Objetivo: Que crear, editar y borrar proyectos tenga una sola implementación validada, sin campos imposibles de vaciar, sin ocultar proyectos nuevos, sin activar servicios de más y sin consumidores de las actions legacy. · Hallazgos que cierra: [BUG-125], [BUG-129], [BUG-130], [FAL-007], [DEU-063], [DEU-067]
- Archivos a tocar: src/app/(protected)/admin/projects/_components/projects-filters.ts (startDate null visible); _actions/project.schemas.ts y project.actions.ts (null explícito para vaciar; deleteProject único; maintenanceStartDate al completar con monthlyRate; deliveredAt limpio al reabrir; Service idempotente por proyecto); [projectId]/_components/delete-project-button.tsx y _components/task-list.tsx (consumir las actions de admin/projects/_actions en lugar de src/lib/actions/projects.ts, y borrar deleteProjectAction); test del filtro con startDate null. · Archivos que NO se tocan: prisma/schema.prisma (CANCELLED en el estado de Project: decisión FROZEN, candidata a 'Migración aditiva agrupada del schema: índices, Decimal, enums y columnas pendientes'); src/actions/dashboard-actions.ts (FROZEN); src/app/(protected)/admin/leads/_actions/* (ZONA-FRANCO); borrar clients.ts, services.ts, settings.ts, leads.ts, leads-constants.ts y las exports muertas de projects.ts y contact.ts (POD-058, POD-060, POD-061, POD-062, POD-359, POD-079 y POD-076) va en 'Poda del portal y de src/lib/actions: código muerto con hallazgo (decide Valentino)'; editar y borrar horas ajenas (SEC-088) va en [B-129] y [B-130].
- Zona: libre (CANCELLED requiere decisión FROZEN)
- Tamaño: M · Riesgo: Medio: migrar consumidores puede romper imports ocultos; correr tsc y knip antes. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un proyecto recién creado sin monto ni lead aparece en el tablero con el filtro por defecto; se pueden vaciar descripción, montos y entrega; borrar desde el detalle y desde el tablero usa la misma action con Zod; completar con monthlyRate fija maintenanceStartDate y reabrir limpia deliveredAt; VH-124: cambiar el servicio no deja dos Service activos; git grep de imports a @/lib/actions/projects = 0.
- Nodo(s): h4.adm-proyectos, h4.adm-proyectos.tablero-kanban, h4.adm-proyectos.alta-edicion, modelo.Project, h2.cli-servicios, h2.cli-cuenta, modelo.Service, h2.cli-proyecto, modelo.OsMaintenancePayment, h4.adm-proyectos.mantenimiento, h4.adm-proyectos.ficha, h4.adm-proyectos.borrado, lib.actions, h4.adm-proyectos.eliminar-proyecto, lib.audit-log, h4.adm-audit, h4.adm-config, h4.adm-equipo, h4.adm-leads, h4.adm-clientes
- Worktree: proximo/admin-proyectos
- Estado: abierta

### [B-71] Pagos y entregas de proyectos con confirmación y reenvío
- Objetivo: Que los hitos de pago se creen cuando se carga el monto, que marcar pagado sea confirmado y reversible y que una entrega rechazada se pueda reenviar a aprobación. · Hallazgos que cierra: [BUG-126], [BUG-127], [UX-046], [POD-072] (se conecta, no se borra) [F7 B9]
- Archivos a tocar: src/app/(protected)/admin/projects/_actions/project.actions.ts (createDefaultMilestones si el proyecto no tiene hitos al cargar el monto); _actions/milestone.actions.ts (conectar unmarkMilestonePaid como Deshacer) y maintenance.actions.ts; src/app/(protected)/admin/projects/[projectId]/payments/page.tsx (client component con useActionState: confirmación, error, Deshacer y estado vacío); _components/task-list.tsx (control de reenvío con REJECTED: pasa a PENDING_APPROVAL y limpia rejectionReason). · Archivos que NO se tocan: src/actions/dashboard-actions.ts (FROZEN: la aprobación del cliente no cambia; su atomicidad, BUG-062, va en 'dashboard-actions libre: aprobación de entregas atómica y una sola action de notificaciones'); prisma/schema.prisma. Al conectar unmarkMilestonePaid, POD-072 de 'Poda del admin: actions sin llamador, rutas huérfanas y catálogos copiados' deja de aplicar.
- Zona: libre (si recalcular hitos no pagados al cambiar el monto: decisión de Valentino)
- Tamaño: M · Riesgo: Medio: dinero; cada marca de pago se confirma. · Prerrequisitos: [B-70]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Cargar el monto después del alta crea los hitos; 'Marcar pagado' pide confirmación, muestra error y se puede deshacer; una tarea REJECTED se reenvía y el cliente la ve pendiente de aprobación; Pagos sin hitos muestra un estado vacío con explicación.
- Nodo(s): h4.adm-proyectos.pagos-hitos, h4.adm-proyectos.alta-edicion, modelo.OsPaymentMilestone, h4.adm-proyectos.aprobacion-entregas, h2.cli-proyecto, modelo.Task, h4.adm-proyectos.mantenimiento
- Worktree: proximo/admin-proyectos
- Estado: abierta

### [B-72] Gestión del equipo interno en el admin
- Objetivo: Que el admin pueda invitar, desactivar y cambiar el rol de los miembros del equipo con auditoría, y probar el webhook de alertas. · Hallazgos que cierra: [FAL-028]
- Archivos a tocar: src/app/(protected)/admin/team/page.tsx (módulo Equipo con invitar, desactivar y cambiar rol); action nueva que reusa inviteTeamMemberAction con el token hasheado de la tarjeta de recupero e invitación; src/app/(protected)/admin/settings/_components/settings-console.tsx (botón 'Probar webhook'). · Archivos que NO se tocan: src/auth.ts; src/lib/auth-guards.ts (FROZEN-inferido); el rol SETTER (lo gestiona Franco); src/lib/actions/settings.ts (legacy sin importadores: POD-062 en 'Poda del portal y de src/lib/actions: código muerto con hallazgo (decide Valentino)').
- Zona: libre
- Tamaño: M · Riesgo: Alto: dar o quitar SUPER_ADMIN; confirmar y auditar cada cambio y no permitir quitar el último SUPER_ADMIN. · Prerrequisitos: [B-28], [B-25]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un SUPER_ADMIN invita a un miembro (token hasheado y con vencimiento), lo desactiva y le cambia el rol desde /admin/team, cada paso con AdminAuditLog; no se puede quitar el último SUPER_ADMIN; 'Probar webhook' manda un mensaje de prueba.
- Nodo(s): h4.adm-equipo, h4.adm-equipo.alta-baja-miembros, h4.adm-config, modelo.User
- Worktree: ahora/admin-guardia
- Estado: abierta

### [B-73] Alertas y tickets del admin que no esconden pendientes
- Objetivo: Que alertas y tickets pendientes nunca queden fuera de la vista por un recorte de cantidad o de fecha. · Hallazgos que cierra: [BUG-111], [UX-048]
- Archivos a tocar: src/modules/chatbot/server/admin/manageAlerts.ts (todas las PENDING y ACKNOWLEDGED o paginado por columna en el server; stats con count/aggregate; filtros en listAlerts); src/app/(protected)/admin/alerts/AlertsClient.tsx y page.tsx; src/app/(protected)/admin/tickets/_components/ticket-date-filter.tsx y ticket-list.tsx (OPEN e IN_PROGRESS siempre visibles; el período solo para resueltos; aviso de cuántos quedan fuera). · Archivos que NO se tocan: src/app/(protected)/admin/layout.tsx; reconocer que silencia, transiciones, detector y vista mobile (BUG-028, BUG-140, PERF-010, UX-037, UX-038) van en 'Alertas de bots: reconocer silencia, transiciones condicionales, detector sin N+1 y vista mobile'; Ticket.updatedAt al responder (BUG-056) va en 'Mensajes y tickets: paginación, leído fuera del render, orgs archivadas y orden por actividad'.
- Zona: libre
- Tamaño: S · Riesgo: Bajo. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Con 150 alertas en base local, una PENDING de hace tres meses aparece y los contadores coinciden con count(); un ticket OPEN sin actividad hace dos meses aparece en la bandeja por defecto y el filtro de período solo afecta a los resueltos.
- Nodo(s): h4.adm-alertas, h4.adm-alertas.triage, h4.adm-alertas.filtros-y-vista-completa, modelo.BotAlert, h4.adm-alertas.listado, h4.adm-tickets, h4.adm-tickets.bandeja, modelo.Ticket
- Worktree: proximo/admin-errores
- Estado: abierta

### [B-74] Admin: iniciar la primera conversación con un cliente
- Objetivo: Que el admin pueda abrir desde la UI la primera conversación de Mensajes con un cliente. · Hallazgos que cierra: [FAL-025]
- Archivos a tocar: src/app/(protected)/admin/messages/page.tsx (honrar ?clientId= con redirect a /admin/messages/[id] y botón 'Nueva conversación' con selector de clientes activos); src/app/(protected)/admin/messages/_actions/message.actions.ts si hace falta crear el hilo; src/app/(protected)/admin/clients/[clientId]/_components/tabs/SupportTab.tsx (link). · Archivos que NO se tocan: src/app/(protected)/admin/messages/[orgId]/page.tsx salvo lectura (ya soporta hilo vacío con composer); las orgs archivadas en la bandeja (BUG-121) van en 'Mensajes y tickets: paginación, leído fuera del render, orgs archivadas y orden por actividad'.
- Zona: libre
- Tamaño: S · Riesgo: Bajo. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Desde la ficha del cliente o desde Mensajes se abre un hilo nuevo con composer y el primer mensaje le llega al cliente; el selector solo lista clientes activos.
- Nodo(s): h4.adm-mensajes, h4.adm-mensajes.iniciar-conversacion, h4.adm-clientes, modelo.Message
- Worktree: proximo/admin-proyectos
- Estado: abierta

### [B-75] Admin usable en teléfono: kanbans responsive y barras de scroll visibles
- Objetivo: Que el admin se pueda usar en un teléfono: overview del pipeline y tablero de proyectos sin desbordes, y barras de scroll visibles en los portales. · Hallazgos que cierra: [UX-044], [UX-047], [A11Y-033]
- Archivos a tocar: src/app/(protected)/admin/leads/_components/column-overview.tsx (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 en vez del style inline); src/app/(protected)/admin/projects/_components/project-list.tsx y droppable-project-column.tsx (w-full max-w-[340px]; minmax(min(100%,320px),1fr)); src/app/globals.css (ocultar barras solo en el sitio público; barras finas en /admin, /dashboard y /setter). · Archivos que NO se tocan: src/app/(protected)/admin/leads/_actions/* (ZONA-FRANCO); componentes del sitio público; el menú mobile del admin (UX-035) va en 'Shell del admin: topbar en español, menú mobile usable, diálogos accesibles y loading propios'.
- Zona: libre
- Tamaño: S · Riesgo: Bajo; el cambio de globals.css alcanza al sitio público: verificar que el home no muestre barras nuevas. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: VH-120 y VH-125: a 390 px el overview de columna y el tablero de proyectos no desbordan; las tablas desplazables del admin y del portal muestran barra; el home público no muestra barras nuevas; visual-qa desktop y mobile sin ROTO ni BUG.
- Nodo(s): h4.adm-leads.pipeline-kanban, h4.adm-proyectos.tablero-kanban, h2.cli-shell, h4.adm-shell, lib.ui
- Worktree: proximo/admin-proyectos
- Estado: abierta

### [B-76] Modal compartido accesible y el modal de ticket migrado a él
- Objetivo: Que el Modal compartido sea un diálogo accesible (rol, Escape, foco atrapado y devuelto) y que el modal de nuevo ticket lo use, con capa y scroll correctos en pantallas bajas. · Hallazgos que cierra: [A11Y-037], [A11Y-003]
- Archivos a tocar: src/components/ui/Modal.tsx (role=dialog, aria-modal, aria-labelledby y describedby, Escape, foco inicial, trampa y retorno, cierre siempre presente), decisión de Valentino; src/components/dashboard/NewTicketModal.tsx (migrar al Modal; label con htmlFor; aria-label en el cierre; scroll interno). · Archivos que NO se tocan: src/lib/design-tokens.ts (solo se consume zIndex.modal); src/components/dashboard/VaultRequestModal.tsx salvo verificar; el resto de src/components/ui/* (lo ordena 'Kit ui/* protegido: estados accesibles, StatCard es-AR, un solo EmptyState y huérfanos fuera').
- Zona: requiere decisión FROZEN + revisión de Franco (consumidores en el setter, `11-CONGELADOS.md`)
- Tamaño: M · Riesgo: Medio: el Modal lo usan otras pantallas; recorrerlas todas con teclado. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-054 y VH-168: el modal de ticket y el de la Bóveda abren con el foco adentro, cierran con Escape, devuelven el foco, quedan por encima del sidebar y scrollean a 600 px de alto; las demás pantallas que usan Modal siguen funcionando con teclado. escalar-modal, evaluacion-form y salida-manual del setter siguen operables con teclado [F7 B7]
- Nodo(s): lib.ui, h2.cli-cuenta, h2.cli-shell, h2.cli-soporte, h5.set-manual, h2.cli-soporte.crear-ticket
- Worktree: ahora/portal-soporte
- Estado: abierta

### [B-77] Páginas de auth accesibles: h1, errores anunciados, contraste AA y visor de contraseña con teclado
- Objetivo: Que login, recupero, reset, invitación y cambio de contraseña se puedan usar con lector de pantalla y teclado. · Hallazgos que cierra: [A11Y-001]
- Archivos a tocar: src/app/login/page.tsx (h1 visible o sr-only; role=tablist y aria-selected en el selector; visor de contraseña sin tabIndex -1); bloques de error de login, forgot-password, reset-password, accept-invite y cambiar-password con role=alert; textos funcionales a zinc-400 o más. · Archivos que NO se tocan: el AuthShell compartido y la partición de /login (DEU-004) van en [B-156]; src/auth.ts; los textos de éxito del magic link (los cambia 'Rate limit real en el acceso: magic link, endpoint nativo de Credentials y cambio de contraseña').
- Zona: libre
- Tamaño: S · Riesgo: Bajo; verificar con visual-qa y con teclado en desktop y 390 px. · Prerrequisitos: [B-08]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: /login tiene un h1; un error de login, de recupero y de reset se anuncia con role=alert; el visor de contraseña y el selector de método se operan con teclado; los textos funcionales pasan AA (4,5:1 o más) medidos con axe o el inspector; visual-qa sin ROTO ni BUG.
- Nodo(s): h1.auth-login.login-password, h1.auth-recupero.solicitar-enlace, h1.auth-recupero.restablecer-password, h1.auth-invite.aceptar-invitacion
- Worktree: ahora/auth-limites
- Estado: abierta

### [B-78] Lenis solo en el sitio público y respetando reducir movimiento
- Objetivo: Que Lenis no se cree fuera del sitio público (la rueda vuelve a scrollear el panel del setter) y que respete prefers-reduced-motion. · Hallazgos que cierra: [BUG-175], [A11Y-036]
- Archivos a tocar: src/components/layout/SmoothScroll.tsx (usar isChromeFreeRoute o isPortalRoute de src/components/layout/publicRoute.ts; allowNestedScroll: true; no crear Lenis con reduce); src/components/layout/Navbar.tsx, BrandLogo y AccederButton (useReducedMotion, sin repeat infinito); src/components/canvas/DotMatrix.tsx (frame estático con reduce). · Archivos que NO se tocan: src/app/layout.tsx y src/context/* (FROZEN); src/app/(protected)/setter/* (ZONA-FRANCO: el arreglo no lo toca); el loop de rAF sin cancelar (PERF-019) va en [B-190] (mismo archivo: conviene hacerlas juntas); dpr, pausa y sin WebGL de DotMatrix (PERF-018) van en 'Canvas 3D según la regla: dpr 1.5, pausa fuera de viewport y sin WebGL no montar'; el hook de reduced motion de los portales (A11Y-040) va en 'Movimiento reducido correcto desde el primer render y una sola política en portales y widget'.
- Zona: libre
- Tamaño: S · Riesgo: Bajo; el home usa Lenis en su coreografía: verificar también en la rama rediseno/home. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: VH-164: la rueda scrollea /setter en desktop; VH-174 en verde; con 'reducir movimiento' el sitio público no crea Lenis, el chrome no anima en bucle y DotMatrix queda en un frame estático; visual-qa del home sin ROTO ni BUG.
- Nodo(s): h5.set-dia, h5.set-manual, h5.set-lead, lib.sitio-publico, h6, h1.auth-login
- Worktree: proximo/lenis
- Estado: abierta

### [B-79] Ficha y manual del setter sin pérdida de trabajo
- Objetivo: Que la ficha y el manual del setter no pierdan lo cargado: sin avances solos, sin pantallas caídas por textos largos, sin veredictos descartados y sin tildes que se pisan. · Hallazgos que cierra: [BUG-153], [BUG-155], [BUG-156], [BUG-157]
- Archivos a tocar: src/app/(protected)/setter/_components/bloques-secuenciales.tsx (ignorar la salida sin document.hasFocus; mantener montado el bloque de cierre o confirmar antes de cambiar); src/app/(protected)/setter/leads/[leadId]/_components/ficha-form.tsx y evaluacion-form.tsx (aPayload con safeParse también en el fallback; tope visible con TEXTO_LIBRE_MAX de src/lib/leados/contracts.ts); manual/_components/fase-auto-reporte.tsx y m-construccion.tsx (un dueño del blob por pantalla; guardado serializado o en el server, retomando el arreglo de P25 si entró). · Archivos que NO se tocan: src/lib/leados/contracts.ts salvo exportar el tope; prisma/schema.prisma; la guardia de salida del opener y la agenda (UX-053) y los blobs atados a ids (DEU-086) van en 'LeadOS: estado derivado del manual fiel y blobs del dossier atados a ids'; el autosave al desmontar (BUG-182) va en [B-139].
- Zona: ZONA-FRANCO
- Tamaño: M · Riesgo: Medio: cambia cómo se guarda el trabajo del setter; si p25 entró, parte del arreglo ya existe y no hay que duplicarlo. · Prerrequisitos: [B-31]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-145: cambiar de pestaña no avanza la ficha; VH-146: pegar 6000 caracteres marca el error en el campo sin tirar la pantalla; VH-147: plegar el veredicto no lo descarta (o pide confirmación); VH-148: tres tildes seguidos quedan guardados.
- Nodo(s): h5.set-manual.ficha-por-bloques, h5.set-manual.ficha-y-veredicto, lib.leados, modelo.OsLeadDossier, h5.set-manual.brief, h5.set-lead.ficha-y-veredicto, h5.set-manual, h5.set-manual.construccion
- Worktree: franco/leados
- Estado: abierta

### [B-80] LeadOS: un solo predicado de estado vivo y terminal para la cola del setter
- Objetivo: Que el setter trabaje con una sola definición de lead vivo y terminal: CERRADO se archiva, RE_SEGUIMIENTO permite re-agendar, un toque no pisa CALL_AGENDADA, un POSTERGADO retomado vuelve a la cola y las métricas no cuentan descartados. · Hallazgos que cierra: [BUG-146], [BUG-147], [BUG-160], [BUG-162], [BUG-164], [BUG-168]
- Archivos a tocar: src/lib/leados/flow.ts (ESTADOS_TERMINALES; grupoPara y derivarPantalla con una fuente única; rama faltante de APROBADA); src/lib/leados/agenda.ts (RE_SEGUIMIENTO archiva la agenda anterior); src/app/(protected)/admin/leads/_actions/reunion.actions.ts; src/lib/leados/manual.ts y m5-seguimiento.tsx (registrarResultado no baja CALL_AGENDADA); src/lib/os-commercial.ts y manual/_data.ts (POSTERGADO → status de trabajo al retomar, PLAN-866); src/lib/leados/mis-numeros.ts, revision.ts y setter-carga.ts (predicado 'lead vivo'); flow.invariant e invariante de partición. · Archivos que NO se tocan: prisma/schema.prisma; src/auth.ts; módulos fuera de LeadOS; el predicado de vencido y las fechas AR de LeadOS (DEU-079, DEU-081, BUG-151, BUG-159) van en 'LeadOS: fechas en hora argentina y un solo predicado de vencido'.
- Zona: ZONA-FRANCO
- Tamaño: L · Riesgo: Medio: cambia qué ve cada setter en su cola; Franco decide las transiciones. · Prerrequisitos: [B-31]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-142, VH-151, VH-153 y VH-155: un lead CERRADO sale de la cola; tras RE_SEGUIMIENTO se puede volver a agendar; un toque en m5 sobre CALL_AGENDADA no cambia el status; un POSTERGADO retomado vuelve a 'Para trabajar' en su fecha; Mis números y la carga del admin excluyen descartados; flow.invariant cubre los casos.
- Nodo(s): h4.adm-leads.cierre-reunion, h5.set-manual.agenda-reunion, lib.leados, modelo.OsLeadDossier, h5.set-lead.agenda-reunion, h4.adm-leads.cierre-post-reunion, h5.set-dia.cola-del-dia, h4.adm-leads.crud-y-estado, modelo.OsLead, h5.set-dia, h5.set-dia.foco-y-cola, h5.set-dia.cartera-vistas-y-filtros, h5.set-manual.derivacion-de-pantalla, h5.set-manual, h5.set-manual.registrar-resultado-toque, h4.adm-leads, h5.set-manual.postergar-y-retomar, h5.set-dia.mis-numeros, h4.adm-leads.carga-por-setter
- Worktree: franco/leados
- Estado: abierta

### [B-81] LeadOS: errores mapeados al usuario y reportados a Sentry
- Objetivo: Que las acciones de LeadOS no muestren errores internos y que sus fallas, la compensación de agenda y el digest de Telegram lleguen a Sentry. · Hallazgos que cierra: [SEC-101], [FAL-031], [BUG-149], [BUG-163]
- Archivos a tocar: src/app/(protected)/setter/_actions/novedades.actions.ts, prospecto.actions.ts y prospecto-bulk (mapError con fallback como dossier, outreach y cartera); src/app/(protected)/admin/leados/_actions/revision.actions.ts y acciones admin de leads; captureException con tag section: leados, acción y leadId en cada mapError; src/app/(protected)/setter/_actions/agenda.actions.ts (distinguir cancelación confirmada; avisar a Franco con el uid); src/app/api/cron/os-follow-up/route.ts (digest top N + 'y X más' con link a /admin/leads; Sentry). · Archivos que NO se tocan: src/lib/action-utils.ts (FROZEN: toErrorMessage; su cambio central, SEC-092, va en 'Errores crudos a la UI: toErrorMessage solo pasa UserFacingError y el resto va a Sentry'); src/lib/leados/agenda.ts salvo lo indicado.
- Zona: ZONA-FRANCO
- Tamaño: M · Riesgo: Bajo. · Prerrequisitos: [B-31], [B-05]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un error de Prisma forzado en novedades o prospecto muestra un texto genérico y aparece en Sentry con tag leados; VH-154: con 200 pendientes el digest llega; una cancelación fallida de Cal.com no se informa como cancelada.
- Nodo(s): h5.set-dia.novedades, h5.set-nuevo.alta-prospecto, h5.set-importar.importar-csv, h4.adm-leads, lib.actions, h5.set-nuevo.alta-manual, h5.set-lead, h5.set-manual, h5.adm-revision-demos, int.sentry, lib.leados, h5.set-dia.novedades-dirigidas, h5.set-lead.escalamiento-construccion, int.telegram, modelo.OsSetterNotice, h5.set-manual.agenda-reunion, int.cal-com, h4.adm-leads.digest-follow-ups-telegram
- Worktree: franco/leados
- Estado: abierta

### [B-82] Revisión de demos: métrica por evaluador, materiales visibles e iframe con sandbox
- Objetivo: Que la revisión de demos atribuya cada evaluación a quien la hizo, muestre los materiales de la ficha y embeba el borrador con sandbox. · Hallazgos que cierra: [BUG-148], [FAL-032], [SEC-100]
- Archivos a tocar: src/lib/leados/contracts.ts (userId del evaluador al pasar a EVALUADA); src/app/(protected)/admin/leados/page.tsx y setter/[setterId]/page.tsx (agrupar por evaluador; las viejas como 'sin autor'); src/app/(protected)/admin/leados/[leadId]/_components/dossier-panels.tsx (bloque 'Material del negocio' con links externos); src/app/(protected)/admin/leados/[leadId]/page.tsx (iframe con sandbox y referrerpolicy) o draftUrl restringido a *.netlify.app en src/app/(protected)/setter/_actions/dossier.schemas.ts. · Archivos que NO se tocan: prisma/schema.prisma (el evaluador va en el JSON de la evaluación; columna nueva solo con decisión FROZEN); next.config.ts salvo frame-src.
- Zona: ZONA-FRANCO
- Tamaño: M · Riesgo: Bajo. · Prerrequisitos: [B-31]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-143: el iframe del borrador tiene sandbox; la métrica descarte/avance de un setter no cambia al reasignar el lead; la revisión muestra los materiales de la ficha como links externos.
- Nodo(s): h5.adm-revision-demos.metrica-descarte, lib.leados, modelo.OsLeadDossier, h5.adm-revision-demos.cola-y-veredicto, h5.set-lead.brief-construccion-revision, lib.security
- Worktree: franco/leados
- Estado: abierta

### [B-83] Fechas del setter en día calendario argentino
- Objetivo: Que pausas, postergar y la oferta de horarios del setter usen el día calendario argentino también entre las 21 y las 24. · Hallazgos que cierra: [BUG-152]
- Archivos a tocar: Helper único de fecha calendario en hora AR (en src/lib/leados/ o, si va en src/lib/dates-ar.ts o tz-ar.ts, con decisión de Valentino); src/app/(protected)/setter/_components/foco-surface.tsx y lead-card-actions.tsx; src/app/(protected)/setter/leads/[leadId]/manual/_components/seguimiento-form.tsx; rangoOferta de src/lib/leados/agenda.ts. · Archivos que NO se tocan: src/lib/dates-ar.ts y src/lib/tz-ar.ts sin decisión FROZEN; el rango de inbound y el historial sin huso (BUG-151, BUG-159) van en 'LeadOS: fechas en hora argentina y un solo predicado de vencido' (misma causa: conviene hacerlas juntas).
- Zona: ZONA-FRANCO (si el helper va en dates-ar.ts: requiere decisión FROZEN)
- Tamaño: S · Riesgo: Bajo. · Prerrequisitos: [B-31], [B-69]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: VH-144 y VH-114: entre las 21:00 y las 23:59 ART una pausa de un día vence mañana, Postergar deja elegir mañana y la oferta de horarios incluye los de mañana; los follow-ups de hoy después de las 21 siguen siendo de hoy.
- Nodo(s): h5.set-dia.foco-ahora, h5.set-dia.palancas-de-card, modelo.OsLeadSetterMeta, h5.set-manual.postergar-y-retomar, h5.set-lead.agenda-reunion, lib.leados, int.cal-com
- Worktree: franco/leados
- Estado: abierta

### [B-84] Alta manual de prospectos con aviso de duplicado en el sistema
- Objetivo: Que el alta manual de un prospecto avise, sin revelar el dueño, si el negocio ya está en el sistema. · Hallazgos que cierra: [BUG-161]
- Archivos a tocar: src/app/(protected)/setter/_actions/prospecto.actions.ts (cotejo 'en-sistema' con nombresEnSistema, como la importación, sin revelar el dueño); src/app/(protected)/setter/nuevo/nuevo-prospecto-form.tsx y page.tsx (aviso que bloquea o pide confirmación, según Franco). · Archivos que NO se tocan: prisma/schema.prisma; src/lib/leados/ownership.ts salvo lectura; leer todos los OsLead en el cotejo (SEC-102) va en [B-137].
- Zona: ZONA-FRANCO
- Tamaño: S · Riesgo: Bajo. · Prerrequisitos: [B-31]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: VH-152: cargar a mano un negocio que ya trabaja otro setter muestra el aviso (bloquea o pide confirmación, según Franco) sin nombrar al dueño.
- Nodo(s): h5.set-nuevo, h5.set-nuevo.alta-manual, h5.set-nuevo.aviso-duplicado, modelo.OsLead, lib.leados
- Worktree: franco/leados
- Estado: abierta

### [B-85] Importación de prospectos: CSV de Excel en español
- Objetivo: Que la importación de prospectos entienda los CSV exportados de Excel en español (punto y coma y acentos) y muestre el primer nombre leído antes de importar. · Hallazgos que cierra: [UX-055]
- Archivos a tocar: src/lib/leados/prospecto-import.ts (separador coma o punto y coma detectado por el encabezado; codificación); src/app/(protected)/setter/nuevo/importar/importar-prospectos-form.tsx (vista previa del primer nombre leído; ayuda que pida 'CSV UTF-8' si no se detecta). · Archivos que NO se tocan: prisma/schema.prisma; el parser que abre comillas en medio de un campo (BUG-169) va en [B-137] (mismo archivo: conviene hacerlas juntas).
- Zona: ZONA-FRANCO
- Tamaño: S · Riesgo: Bajo. · Prerrequisitos: [B-31]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: VH-156: un CSV exportado de Excel en español entra con acentos correctos y la vista previa muestra el primer nombre bien escrito; el invariante prospecto-import suma el caso de punto y coma.
- Nodo(s): h5.set-importar, h5.set-importar.importar-csv, lib.leados
- Worktree: franco/leados
- Estado: abierta

### [B-86] LeadOS: herramientas externas del recorrido con link y sin el «Chat de evaluación»
- Objetivo: Que las herramientas externas del recorrido del setter tengan sus links y que el rail no ofrezca el 'Chat de evaluación' que el recorrido ya no usa. · Hallazgos que cierra: [FAL-033]
- Archivos a tocar: src/lib/leados/herramientas.ts (URLs cargadas por Franco, mejor en configuración editable; sacar 'evaluador' de HERRAMIENTAS_ORDEN); src/app/(protected)/setter/_components/tools-rail.tsx (mientras falte una URL, la misma salida que ToolGuide); tests/setter/16-municiones-salida.spec.ts:132. · Archivos que NO se tocan: src/lib/leados/agenda.ts (va en 'LeadOS: la agenda reserva en la org de develOP por un identificador explícito'); prisma/schema.prisma.
- Zona: ZONA-FRANCO
- Tamaño: S · Riesgo: Bajo. · Prerrequisitos: [B-31]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: El rail no ofrece links TODO ni el 'Chat de evaluación'; con una URL cargada, el rail y ToolGuide abren el mismo destino; la spec 16 actualizada pasa.
- Nodo(s): h5.set-manual.herramientas-externas, lib.leados, h5.set-lead, h5.set-manual.opener, h5.set-manual.brief, h5.set-manual.construccion, h5.set-dia, h5.set-manual.ficha-y-veredicto, h5.set-manual, h5.set-manual.guia-y-herramientas, h5.set-lead.brief-y-construccion
- Worktree: franco/leados
- Estado: abierta

### [B-87] Convertir un lead en proyecto desde la ficha del lead
- Objetivo: Que el botón 'Convertir a proyecto' de la ficha del lead funcione con el diálogo y la action que ya existen, o que desaparezca si la conversión se decide hacer desde Proyectos. · Hallazgos que cierra: [FAL-024]
- Archivos a tocar: src/app/(protected)/admin/leads/[leadId]/page.tsx (montar ConvertLeadDialog en lugar del botón deshabilitado); src/app/(protected)/admin/projects/_components/convert-lead-dialog.tsx y la action de conversión en project.actions.ts. · Archivos que NO se tocan: src/app/(protected)/admin/leads/_actions/* y src/lib/leados/*; modelos OsLead* salvo lo que ya escribe la action existente.
- Zona: ZONA-FRANCO (la conversión lee y marca OsLead: decide Franco)
- Tamaño: S · Riesgo: Bajo; decisión de producto sobre desde dónde se convierte. · Prerrequisitos: [B-31]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Desde la ficha de un lead se crea un proyecto con el diálogo existente y el lead queda vinculado; o el botón ya no existe y la decisión está escrita en 09-PARA-FRANCO.
- Nodo(s): h4.adm-leads, h4.adm-leads.convertir-a-proyecto, h4.adm-proyectos, modelo.OsLead, modelo.Project
- Worktree: franco/leados
- Estado: abierta

## Después

### [B-88] CI que corre de verdad: base de test aislada, build, lint y e2e sin efectos
- Objetivo: Que el CI corra build, lint con baseline, npm audit, los tests puros y los e2e contra una base de test aislada, sin skips que tapen regresiones ni efectos reales. · Hallazgos que cierra: [DEU-017], [DEU-090], [BUG-186], [DEU-104], [BUG-187]
- Archivos a tocar: Branch de Neon dedicada a tests y secret DATABASE_URL_TEST (nunca migrate reset); .github/workflows/ci.yml (build con el heap de Netlify; eslint de src/ con baseline congelado; npm audit --audit-level=critical; permissions: contents: read; seed de fixtures; baselines de Linux o sin el spec visual); playwright.config.ts, playwright.integration.config.ts y playwright.leados.config.ts (DATABASE_URL_TEST); tests/e2e/19-security, 40-lead-capture-e2e, 14-e2e-critical-flow y 30-onboarding-e2e-complete (sin test.skip en caminos del producto; usuarios y bots efímeros; restauración en finally); tests/integration/alerts-detector.spec.ts (sin notificaciones reales). · Archivos que NO se tocan: prisma/schema.prisma; la Neon compartida con Franco y la de producción; la regla de lint de fronteras (la agrega [B-33]).
- Zona: libre
- Tamaño: L · Riesgo: Medio: el CI queda rojo en la transición; baseline congelado para eslint. Es habilitador: 9 tarjetas de este bloque necesitan DATABASE_URL_TEST, por eso va primero. · Prerrequisitos: [B-03], [B-33]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-003: DATABASE_URL_TEST apunta a una branch de test; el job e2e pasa en CI después del build; un test de seguridad roto a propósito se ve rojo (sin skip); en una corrida de CI no sale ningún mail, Telegram ni reenvío de credenciales (log de Brevo/Telegram vacío).
- Nodo(s): lib.isolation, lib.prisma, modelo.Organization, modelo.User, h5.set-manual, modelo.OsLead, lib.tests, h4.adm-clientes.reenviar-credenciales, h4.adm-alertas.detector-incidencias
- Worktree: wt/mecanismos
- Estado: abierta

### [B-89] Política de niveles: «congelado» pasa a protegido, libre o borrar
- Objetivo: Que Valentino (y Franco en su zona) decida la política de 11-CONGELADOS y quede escrita en CLAUDE.md y en zonas.json, para destrabar los hallazgos que esperan «decisión FROZEN». · Hallazgos que cierra: [CNG-001], [CNG-002], [CNG-003], [CNG-004], [CNG-005], [CNG-006], [CNG-007], [CNG-008], [CNG-009], [CNG-010], [CNG-011], [CNG-012], [CNG-013], [CNG-014], [CNG-015], [CNG-016], [CNG-017], [CNG-018], [CNG-019], [CNG-020], [CNG-021], [CNG-022], [POD-384]
- Archivos a tocar: CLAUDE.md raíz (tabla Frozen files y cláusula de :133: 12 protegidos con la propiedad que protegen y su gate, 9 libres más los archivos del intro y del home clásico dentro de ui/*, salida «borrar» para HeroArtifact y los huérfanos de ui/*); logic-core-v3/AGENTS.md:76; 06-ATLAS/zonas.json (la clave congelados pasa a protegidos/libres); DECISIONES.md de los docs consolidados. · Archivos que NO se tocan: Los 22 archivos de la tabla (esta tarjeta no edita código); prisma/schema.prisma; src/**.
- Zona: requiere decisión FROZEN + ZONA-FRANCO (CNG-004 y CNG-005; firma de Franco por `auth.ts`, `OsLead*`, `ui/*`, `auth-guards`, `utils`, `action-utils` y `dates-ar`)
- Tamaño: S · Riesgo: Bajo en código y alto en proceso: sin el hook PreToolUse ni los gates la política queda en prosa. Franco firma por auth.ts, OsLead*, ui/* (53 importadores suyos), auth-guards, utils, action-utils y dates-ar. Es habilitador de 16 tarjetas del bloque. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: CLAUDE.md nombra los 12 protegidos con su propiedad y su gate, los libres y la salida borrar; zonas.json ya no tiene la clave `congelados` y `node scripts/auditoria/atlas/validar-atlas.mjs` pasa; la decisión figura en DECISIONES con fecha, quién la tomó y la firma de Franco para los archivos con importadores en su zona.
- Nodo(s): lib.ui, lib.auth, lib.prisma, lib.context, lib.utils, lib.action-utils, lib.audit-log, lib.tz-ar, lib.dates-ar, lib.design-tokens, lib.use-reduced-motion, lib.logger, lib.alerts, lib.hover, lib.motion-variants, lib.chromereveal, lib.use-is-client, lib.sitio-publico
- Worktree: wt/docs
- Estado: abierta

### [B-90] Docs: decidir los 37 «a decidir» de 14-DOCS-CONSOLIDADOS
- Objetivo: Que cada contradicción entre fuentes listada como «a decidir» tenga decisión y dueño, para destrabar las tarjetas que dependen de ellas sin esperar la reorganización de docs. · Hallazgos que cierra: ninguno (tarjeta de proceso)
- Archivos a tocar: 14-DOCS-CONSOLIDADOS/README.md, sección A decidir: cada uno de los 37 ítems con decisión, fecha y dueño, registrados en DECISIONES.md (incluye el 34 rol CLIENT, el 33 FG-2, los 30-31 purga del historial y visibilidad del repo, y la navegación del setter). · Archivos que NO se tocan: Código; los docs que se borran (van en [B-171]).
- Zona: libre (los ítems 8–12, 33, 35 y 36 los decide Franco)
- Tamaño: S · Riesgo: Bajo. Separada del borrado para que «Roles en el borde», [B-142] y [B-169] no esperen a mover 140 docs. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Los 37 ítems tienen decisión con fecha y dueño, o quedan «abierto» con dueño y fecha de revisión; DECISIONES.md los registra; Franco firmó los suyos.
- Nodo(s): doc.bitacora-roadmap, doc.roadmap-pendientes
- Worktree: wt/docs
- Estado: abierta

### [B-91] Seeds y scripts de datos con destino explícito: guard por hostname, dry-run, adopción por id y tsx fijado
- Objetivo: Que ningún seed o script escriba en una base sin destino explícito y dry-run, que no se apropie de datos reales y que corra con un tsx fijado. · Hallazgos que cierra: [SEC-041], [SEC-034], [DEU-016], [BUG-011], [BUG-176], [DEU-009], [DEU-020], [DEU-015], [DEU-011], [POD-286], [POD-289], [POD-290], [POD-291], [POD-293], [POD-294], [POD-295]
- Archivos a tocar: prisma/seed-guard.ts (new URL() con hostname exacto; ALLOW_PROD_SEED=<host>; comentario de :13-15), usado también por src/modules/chatbot/prisma/seed.ts, update-proactive-prompts.ts y los seeds de scripts/dev (flag de destino + dry-run con diff); prisma.config.ts (comentario); prisma/seed-agency-os.ts (org interna resuelta por slug antes del bucle; mensaje de :2453; fusionado con src/lib/agency-settings.ts) y prisma/seed.ts (búsqueda por seedId o slug; no tocar role ni password de usuarios ajenos; dominios .test); prisma/seeds/sync-plans.ts (sin la instrucción de prod; --dry-run con diff por columna; sin navigate_to_page); borrar prisma/seeds/init-data-connections.ts, prisma/migrate-os-to-unified.ts y su script migrate:os-v2; decidir backfill-vertical-pack.ts, add-contact-tool.ts y premium-modules.ts; scripts/_b14-2-cleanup-bench-prod.ts si sobrevive a la poda (chatMessage o cascade, en $transaction); package.json y lockfile (tsx fijo en devDependencies; scripts de npm para los seeds de producción; línea duplicada); tsconfig de scripts/ en el gate. · Archivos que NO se tocan: prisma/schema.prisma (el comentario falso de :399-400, parte de DEU-011, va en la migración agrupada); las migraciones aplicadas; nunca prisma migrate reset.
- Zona: libre (la parte de DEU-011 en schema.prisma requiere decisión FROZEN y va en la migración agrupada)
- Tamaño: L · Riesgo: Alto si se corre contra producción: dry-run siempre y backup verificado. Fusiona dos tarjetas con la misma causa raíz (seeds sin destino confiable). · Prerrequisitos: [B-02], [B-165]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un invariante sin base muestra que el guard rechaza una URL de prod que contiene el host permitido como substring; cada seed corrido con la DATABASE_URL de producción y sin flag aborta; `npm ls tsx` muestra una versión fija; seed-agency-os corre dos veces sobre una base limpia sin abortar ni cambiar password ni rol de usuarios que no creó; sync-plans --dry-run imprime el diff y no escribe; init-data-connections.ts y migrate-os-to-unified.ts no existen; prisma/seeds no tiene `any`; VH-165 respondido en solo lectura.
- Nodo(s): lib.prisma.seeds, lib.isolation, modelo.BotConfig, modelo.KnowledgeBase, lib.prisma, lib.scripts, lib.plataforma.package, modelo.Project, modelo.Organization, modelo.OsLead, modelo.Plan, h2.cli-plan, h3.vis-api-chatbot, modelo.ChatMessage
- Worktree: wt/datos
- Estado: abierta

### [B-92] Secretos y PII fuera del árbol: docs, scripts que imprimen credenciales y backups versionados
- Objetivo: Que ningún archivo vivo del repo público contenga la clave de Google AI, la contraseña de QA del setter, hosts de Neon ni volcados de tablas, y que quede decidido qué se hace con el historial. · Hallazgos que cierra: [SEC-001], [SEC-003], [SEC-071], [SEC-107], [POD-161], [POD-162], [POD-287], [POD-288]
- Archivos a tocar: docs/audits/2026-05-bfg-leak-cleanup.md:94 y docs/bitacora-roadmap.md:19,36,50 (sacar el valor; si [B-171] va antes, alcanza con borrarlos); docs/leados-alta-setter.md:25; scripts/b1-verify-setter-ownership.ts y b2-verify-dossier.ts (borrar o leer la contraseña del entorno); scripts/db-restore-local.sh (no imprime usuario ni contraseña); .env.example (hostname de Neon por placeholder); prisma/backups/backup.js y *.json (git rm --cached) y .gitignore. · Archivos que NO se tocan: Las contraseñas de seed de README.md y STATUS.md (SEC-002, las saca la tarjeta de Ahora); el historial de git (purga y force-push: «a decidir» 30, a mano por Valentino); encode-vertex-creds.js, set-matsu-password.ts, b7-smoke-calcom.ts y _db-cleanup-* (se borran en la poda de scripts).
- Zona: libre (b1/b2 son QA del setter: aviso a Franco)
- Tamaño: S · Riesgo: Bajo en código. El repo es público: borrar del árbol no saca los valores de la historia; hay que confirmar en Google Cloud que la clave está revocada y rotar la contraseña de QA si sigue viva. · Prerrequisitos: [B-03]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: `node scripts/auditoria/secrets-historial.mjs` sobre HEAD no reporta en archivos vivos la clave de Google AI ni contraseñas de seed o de QA; `git ls-files prisma/backups` da vacío; db-restore-local.sh no imprime credenciales; queda registrada la constancia de clave revocada y la decisión sobre purga del historial y visibilidad del repo.
- Nodo(s): lib.chatbot.llm, doc.audits-2026-05-bfg-leak-cleanup, doc.bitacora-roadmap, doc.leados-alta-setter, lib.scripts, lib.prisma, modelo.OrganizationModule
- Worktree: wt/seguridad-baja
- Estado: abierta

### [B-93] /api/qa/login atado a localhost, a un secreto por corrida y sin delatar la guarda
- Objetivo: Que /api/qa/login no entregue una sesión SUPER_ADMIN a nadie de la LAN ni revele qué guarda falló. · Hallazgos que cierra: [SEC-024], [SEC-021]
- Archivos a tocar: src/app/api/qa/login/route.ts (no confiar en Host; exigir un QA_LOGIN_TOKEN aleatorio por corrida que solo conoce el runner de visual-qa; 404 genérico sin reason en cualquier rechazo); package.json (-H 127.0.0.1 en dev:qa, start:qa, start:setter y start:galeria; evaluar dev). · Archivos que NO se tocan: src/auth.ts; el subagente visual-qa salvo pasarle el token.
- Zona: ZONA-FRANCO
- Tamaño: S · Riesgo: Bajo: visual-qa deja de loguear hasta que reciba el token. SEC-021 venía en la tarjeta de entradas de LeadOS: se movió acá porque es el mismo archivo y la misma causa. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-014: desde otra máquina de la LAN con 'Host: localhost' no se obtiene sesión; un pedido sin token o con rol inválido responde 404 con el mismo cuerpo, sin reason; visual-qa sigue logueando con el token. Franco aprobó.
- Nodo(s): h1.auth-login, lib.auth
- Worktree: wt/protegidos-auth
- Estado: abierta

### [B-94] Secretos criptográficos dedicados: HMAC con pepper, sin fallback a AUTH_SECRET y comparación en tiempo constante
- Objetivo: Que cada secreto tenga un solo uso, sin respaldos literales ni compartidos, y que las comparaciones y los descifrados no tengan atajos. · Hallazgos que cierra: [SEC-022], [SEC-096], [SEC-097], [SEC-098], [DEU-072]
- Archivos a tocar: src/lib/security/auth-rate-limit.ts (HMAC con pepper de entorno); src/lib/crypto/secret-box.ts (authTagLength, largo de iv/tag y validación de hex como credential-cipher); src/lib/email/unsubscribe-token.ts y src/lib/security/oauth-state.ts (secretos dedicados sin fallback, rotación que acepta la clave anterior); oauth-state.invariant.ts nuevo (firma, expiración, scope cruzado, payload manipulado); src/lib/cron/cron-secret.ts (timingSafeEqual) y su uso en api/cron/{alerts,regenerate-briefs,send-executive-reports}; .env.example. · Archivos que NO se tocan: src/app/api/cron/os-follow-up/route.ts (su copia del chequeo es DEU-081, tarjeta de fechas de LeadOS); src/auth.ts.
- Zona: libre
- Tamaño: S · Riesgo: Bajo-medio. Cambiar el hash del rate limit resetea los contadores vivos. Si los secretos nuevos no están en Netlify antes del deploy se rompen bajas y OAuth. Toca los mismos crons que [B-14] (SEC-099 está en Ahora, no en Próximo): va después. · Prerrequisitos: [B-14]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: En esos archivos el grep de `=== process.env.CRON_SECRET` y de fallback a AUTH_SECRET da 0; los invariantes de oauth-state y de secret-box (iv/tag inválidos rechazados) corren en check:invariants; /api/cron/alerts acepta el mismo header que los demás crons; las variables nuevas están en .env.example y cargadas en Netlify.
- Nodo(s): lib.rate-limit, lib.security, lib.crypto, int.email, h6.vis-optout, int.cron, int.cron.alerts, int.cron.regenerate-briefs, int.gbp, int.tiendanube
- Worktree: wt/seguridad-baja
- Estado: abierta

### [B-95] Ciclo de sesión: logout que revoca, temporales fuertes, impersonación cerrada y cambio de email avisado
- Objetivo: Que una sesión o una credencial deje de servir cuando el titular o develOP así lo deciden. · Hallazgos que cierra: [SEC-019], [SEC-020], [SEC-028], [SEC-033], [SEC-091], [POD-347]
- Archivos a tocar: src/lib/security/generate-temp-password.ts (16+ caracteres base64url, o link de un solo uso con vencimiento); src/app/api/admin/users/[userId]/resend-credentials/route.ts; src/lib/impersonation.ts (IMPERSONATION_SECRET obligatorio en producción, sin literal ni AUTH_SECRET); src/actions/auth-actions.ts (borrar la cookie de impersonación en signOut; subir sessionVersion); src/lib/actions/impersonation.ts y admin/clients/_actions/client.actions.ts (stopImpersonation solo con una impersonación válida del mismo admin); src/components/dashboard/ProfileForms.tsx («Cerrar sesión en todos los dispositivos»); src/modules/chatbot/server/admin/updateClient.ts (avisar al email viejo y al nuevo, subir sessionVersion, acotar userPhone). · Archivos que NO se tocan: src/auth.ts; src/proxy.ts; src/lib/preview.ts (la política de escritura del modo soporte la cierra [B-30]).
- Zona: libre
- Tamaño: M · Riesgo: Medio. Subir sessionVersion en el logout cierra todas las sesiones del usuario: decidirlo. Depende de que el bypass de sessionVersion (SEC-006) ya esté cerrado. · Prerrequisitos: [B-09], [B-30], [B-28]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Una cookie copiada antes del logout ya no autentica, o «cerrar en todos» la invalida; la temporal tiene ≥ 16 caracteres aleatorios o es un link que vence; en producción sin IMPERSONATION_SECRET el arranque falla; una sesión no SUPER_ADMIN que llama a stopImpersonationAction no escribe IMPERSONATION_ENDED; cambiar el email de login avisa a los dos emails e invalida la sesión.
- Nodo(s): h1.auth-impersonacion, h1.auth-cambio.cambio-forzado, h4.adm-clientes, h4.adm-clientes.editar-datos, modelo.User, h4.adm-audit, modelo.AdminAuditLog
- Worktree: wt/seguridad-baja
- Estado: abierta

### [B-96] Login y contraseñas: tope único, éxito real del magic link, destino conservado y cambio forzado con salida
- Objetivo: Que el login y los cambios de contraseña se comporten igual en todas las pantallas y que el usuario termine donde iba. · Hallazgos que cierra: [BUG-008], [BUG-009], [UX-005], [UX-003], [DEU-003], [POD-285]
- Archivos a tocar: src/app/login/actions.ts (éxito solo si signIn devuelve /api/auth/verify-request; callbackUrl validado con el isSafeCallbackUrl corregido por SEC-011); src/app/login/page.tsx (campo oculto callbackUrl); src/lib/actions/schemas.ts (si [B-25] y [B-26] no fijaron ya el .max del passwordSchema, un tope único de 128 caracteres o 72 bytes); src/app/cambiar-password/actions.ts, CambiarPasswordForm.tsx y page.tsx (link a /forgot-password, copy según forceChange, destino por rol); src/proxy.ts (propagar callbackUrl); links de src/lib/client-notifications/notify.ts y src/lib/tickets/actions.ts. · Archivos que NO se tocan: src/auth.ts (BUG-003 va con [B-27], en Próximo).
- Zona: libre
- Tamaño: S · Riesgo: Medio: UX-005 abre un open redirect si el callbackUrl no pasa por la validación de SEC-011; por eso va después de [B-25] y [B-26]. El limiter del login ya lo unifica la tarjeta de rate limit de Ahora. · Prerrequisitos: [B-25], [B-26], [B-27], [B-08]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Una contraseña de 129 caracteres se rechaza igual en login, reset, accept-invite, /cambiar-password y Mi Cuenta; si signIn no devuelve verify-request la UI muestra error y llega a Sentry; desde un email de lead caliente sin sesión, después del login se llega al lead; un callbackUrl externo o con barra invertida termina en el inicio del portal; /cambiar-password ofrece «olvidé mi contraseña».
- Nodo(s): h1.auth-login.magic-link, h1.auth-cambio, h2.cli-cuenta, h1.auth-login.login-password, lib.proxy, h3.cli-chatbot, h1.auth-cambio.cambio-forzado
- Worktree: wt/auth-borde
- Estado: abierta

### [B-97] Roles en el borde: rol CLIENT, OrgRole sin guard y passwordResetRequired solo en el proxy
- Objetivo: Que el rol y el OrgRole que viajan en la sesión se respeten en el servidor y no solo en el proxy. · Hallazgos que cierra: [BUG-004], [SEC-018], [SEC-017], [SEC-050], [POD-282]
- Archivos a tocar: src/proxy.ts (CLIENT tratado como ORG_MEMBER o declarado legacy; ALWAYS_ALLOWED limpio; getLegacyAdminRedirectPath borrado, :22-65, :81, :92-96); src/app/(protected)/dashboard/layout.tsx (passwordResetRequired con el dato fresco de Node); helper requireOrgRole aplicado en src/lib/actions/profile.ts, upsell.ts, components/dashboard/modules/motor-resenas/_actions.ts y src/modules/chatbot/server/dashboard/updateBotAppearance.ts; baja de cuenta con categoría propia, OrgRole ADMIN, sendAgencyAlert y dedupe (src/lib/actions/profile.ts, admin/tickets/_components/ticket-chat.tsx). · Archivos que NO se tocan: prisma/schema.prisma (el enum Role no se toca sin decisión); src/auth.ts; src/lib/preview.ts (es de [B-30]).
- Zona: libre (que el rol CLIENT siga vivo es el «a decidir» 34)
- Tamaño: M · Riesgo: Medio. Antes de habilitar miembros no-ADMIN hay que definir el modelo de permisos. Un guard nuevo puede dejar sin acceso a un ADMIN actual si los datos de OrgRole están mal: medirlo antes. · Prerrequisitos: [B-90], [B-30]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un usuario CLIENT entra a /dashboard sin bucle, o el alta ya no puede crear CLIENT y la doc lo dice; un MEMBER o VIEWER recibe 403 en las actions de cuenta y de módulos; con passwordResetRequired el portal redirige a /cambiar-password aunque el token del proxy sea viejo; la baja de cuenta solo la pide un ADMIN, avisa a develOP y no se dispara copiando el título de un ticket.
- Nodo(s): h1.auth-login.ruteo-por-rol, lib.proxy, lib.auth, h2.cli-cuenta, modelo.OrgMember, h1.auth-cambio.cambio-forzado, h2.cli-cuenta.eliminar-cuenta, h4.adm-tickets
- Worktree: wt/auth-borde
- Estado: abierta

### [B-98] Cabeceras de seguridad: CSP con destino de reportes y camino a enforce, y sin iframes ajenos
- Objetivo: Que ninguna página fuera de /embed se pueda enmarcar desde otro sitio y que la CSP global junte reportes y pase a enforce por rutas, portales primero. · Hallazgos que cierra: [SEC-106], [SEC-027]
- Archivos a tocar: next.config.ts: X-Frame-Options DENY y frame-ancestors 'none' para todo el sitio salvo /embed/* y /widget.js (va ya, no espera al enforce); report-to y report-uri hacia un endpoint propio con rate limit o el de CSP de Sentry; enforce por rutas empezando por /admin y /dashboard; nonce para sacar 'unsafe-inline' y 'unsafe-eval'; /embed con su política aparte. · Archivos que NO se tocan: src/context/* (FROZEN); src/app/layout.tsx (lo reordena [B-187]); src/proxy.ts salvo que el nonce lo exija.
- Zona: libre
- Tamaño: M · Riesgo: Alto: un enforce mal medido rompe scripts del home, del widget o de Sentry; medir una semana de reportes antes. Un frame-ancestors global mal acotado rompe el widget en los sitios de clientes. SEC-027 venía en la tarjeta de AuthShell: es el mismo archivo y el mismo mecanismo (cabeceras). · Prerrequisitos: [B-05], [B-36]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: curl -I a /login, /forgot-password, /reset-password, /bienvenida y /dashboard devuelve X-Frame-Options DENY, y a /embed/<slug> no; los reportes de CSP llegan al destino; /admin y /dashboard en enforce; el PR lista los reportes de CSP de 7 días en Report-Only previos al enforce, cada uno con su resolución; la CSP de /admin y /dashboard no contiene 'unsafe-eval'. [F7 B22]
- Nodo(s): lib.plataforma.next-config, lib.security, h2.cli-shell, h4.adm-shell, h1.auth-login, h1.auth-recupero, h1.auth-cambio, h1.auth-invite, h2.cli-bienvenida
- Worktree: wt/plataforma
- Estado: abierta

### [B-99] Widget público: el visitante no recibe datos internos y el embed valida con quién habla
- Objetivo: Que el stream y los postMessage del widget solo lleven lo que el visitante tiene que ver, y que el embed hable únicamente con su ventana padre. · Hallazgos que cierra: [SEC-082], [SEC-070], [SEC-080], [SEC-083]
- Archivos a tocar: src/modules/chatbot/server/chat/handleChatRequest.ts (TransformStream que, antes del watchdog, filtra tool-input-* y tool-output-* de las tools sin tarjeta); server/tools/captureLead.ts (devolver solo {success, alreadyCaptured}; extraer classifyChannel y los chequeos de pertenencia); server/tools/showWhatsappHandoff.ts (esos chequeos sobre visitorContact o guardar null); components/embed/ChatbotEmbed.tsx (develop:init solo si event.source === window.parent; nada a '*' antes del handshake; lead-captured solo con output.success y sin PII); hooks/useChatbot.ts; public/widget.js; documentar el contrato de develop:lead. · Archivos que NO se tocan: src/lib/isolation/*; los prompts; la validación de event.origin contra allowedDomains (SEC-068, la hace [B-36]).
- Zona: libre
- Tamaño: M · Riesgo: Medio: los clientes que escuchan develop:lead pierden campos; avisarles. Va antes del ChatShell para no refactorizar dos veces el embed. · Prerrequisitos: [B-36]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: En un stream capturado, ningún chunk de capture_lead ni de confirm_contact_request lleva leadId, clasificación, señales ni resumen; un develop:init desde otra ventana se ignora; antes del handshake no sale ningún mensaje a '*'; un capture_lead fallido no emite develop:lead; Telegram no recibe un contacto que el visitante no escribió.
- Nodo(s): h3.vis-api-chatbot, h3.vis-widget-cliente, h3.vis-widget-develop, h3.vis-widget-cliente.chat-embebido, lib.security, lib.chatbot, modelo.ChatbotLead, lib.chatbot.tools, int.telegram, modelo.ChatbotEvent
- Worktree: wt/widget
- Estado: abierta

### [B-100] Mi Chatbot: DTOs mínimos según el plan y caché por organización
- Objetivo: Que el navegador del cliente reciba solo las columnas que la pantalla usa y lo que su plan incluye, con cachés que no se reutilicen entre orgs. · Hallazgos que cierra: [SEC-069], [SEC-077], [SEC-079]
- Archivos a tocar: src/modules/chatbot/server/admin/multiTenantQueries.ts (select explícito; clave y tag por organizationId); dashboard/chatbot/conversations/page.tsx y components/dashboards/ConversationsTable.tsx (sin ipHash ni userAgent; tokens y costo ocultos si se decide); dashboard/chatbot/leads/page.tsx, components/dashboard/ClientLeadsTable.tsx y dashboard/chatbot/page.tsx (DTO sin score ni scoreSignals sin leadScoring; nunca notificationSent*, botConfigId ni convertedToOsLeadId); revalidateTag desde captureLead, updateLeadStatus y hardDeleteClient. · Archivos que NO se tocan: src/lib/isolation/registry.ts salvo lo que pida el select; src/app/api/dashboard/chatbot/leads/export/route.ts (lo rehace [B-42]: aplicar ahí el mismo DTO).
- Zona: libre
- Tamaño: M · Riesgo: Bajo-medio. SEC-037 (ALTA) toca las mismas queries en Ahora: esta va después, sobre su select. · Prerrequisitos: [B-11], [B-42]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: En una org Starter el payload RSC de Conversaciones y de Contactos no trae ipHash, userAgent, score ni scoreSignals (grep del flight); crear y borrar una org con el mismo slug no muestra leads viejos; capturar un lead invalida el resumen.
- Nodo(s): h3.cli-chatbot.conversaciones, modelo.Conversation, h3.cli-chatbot, h3.cli-chatbot.contacto-detalle, lib.chatbot, modelo.ChatbotLead
- Worktree: wt/chatbot
- Estado: abierta

### [B-101] Errores crudos a la UI: toErrorMessage solo pasa UserFacingError y el resto va a Sentry
- Objetivo: Que ningún mensaje interno de Prisma, de un SDK o de un proveedor llegue a la pantalla, arreglándolo en action-utils y en los sitios que devuelven err.message por fuera de él. · Hallazgos que cierra: [SEC-092], [SEC-062], [SEC-046]
- Archivos a tocar: src/lib/action-utils.ts (clase UserFacingError; fallback para Error y PrismaClientKnownRequestError) e invariante nuevo check:invariant:action-utils. Sitios con err.message o String(error) devuelto que ninguna otra tarjeta cubre: admin/chatbots/[botId]/{actions,transcript-action}.ts, chatbots/bulk-actions.ts, chatbots/new/actions.ts, admin/clients/_actions/plan.actions.ts, api/admin/alerts/trigger-detector/route.ts, src/lib/integrations/brevo.ts, google-business-profile.ts, dashboard/modules/email-marketing/_actions.ts y motor-resenas/_actions.ts (mensaje de producto + captureException). · Archivos que NO se tocan: src/app/(protected)/setter/_actions/* (9 importadores ZONA-FRANCO: solo se avisa; su SEC-101 es de Franco); src/lib/actions/profile.ts (SEC-016, [B-38]); las actions de Clientes (UX-040) y las del portal que ya cubre [B-57]; src/auth.ts.
- Zona: requiere decisión FROZEN + revisión de Franco (consumidores en el setter, `11-CONGELADOS.md`)
- Tamaño: M · Riesgo: Medio: cambia el texto que ven las pantallas de los 33 importadores; los throw que hoy llegan a la UI a propósito se vuelven genéricos si no se marcan como UserFacingError. Las tarjetas de Próximo de errores del portal y del admin van antes: acá solo el contrato y los sitios restantes. · Prerrequisitos: [B-89], [B-57], [B-58], [B-38]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: check:invariant:action-utils fija que ZodError devuelve issues[0].message, que Error y PrismaClientKnownRequestError devuelven el fallback, que UserFacingError devuelve su message y que fail(e, code) conserva el code; el PR lista los throw convertidos a UserFacingError; en los archivos listados el grep de err.message/error.message/String(error) devuelto da 0 y cada catch llama a Sentry.captureException; Franco fue avisado.
- Nodo(s): lib.action-utils, h4.adm-config, h4.adm-novedades.publicar, h3.adm-chatbots, h4.adm-clientes.plan, h4.adm-clientes.billing-override, h2.cli-email-mkt, h2.cli-resenas, int.brevo
- Worktree: wt/protegidos
- Estado: abierta

### [B-102] audit-log protegido: IP confiable, organización en cada evento, hard-delete atómico y Bóveda auditada
- Objetivo: Que cada fila de auditoría tenga una IP que no escribe el cliente y la org afectada, que el hard-delete y el archivado queden registrados con su tipo y que revelar una credencial se audite. · Hallazgos que cierra: [SEC-026], [DEU-012], [DEU-068], [SEC-085]
- Archivos a tocar: src/lib/audit-log.ts (IP vía getClientIp del helper de IP confiable, no XFF[0]; completar targetOrganizationId) e invariante check:invariant:audit-log; src/modules/chatbot/server/admin/hardDeleteClient.ts (auditoría dentro de la $transaction con la variante transaccional que crea [B-28]), archiveClient.ts (CLIENT_ARCHIVED/UNARCHIVED) y manageAlerts.ts; Bóveda: admin/clients/[clientId]/_components/tabs/VaultTab.tsx y src/components/dashboard/VaultRevealButton.tsx (descifrar bajo demanda con action SUPER_ADMIN que audita CREDENTIAL_REVEALED); admin/audit-log/_components/AuditLogClient.tsx (filtro por cliente). · Archivos que NO se tocan: prisma/schema.prisma (targetOrganizationId y los valores nuevos del enum van en la migración agrupada); la captura a Sentry y la falla cerrada de logAdminAction (SEC-030, Próximo).
- Zona: requiere decisión FROZEN
- Tamaño: M · Riesgo: Medio: 31 actions dependen de que logAdminAction no lance. SEC-030/SEC-086 (Próximo) tocan el mismo archivo y van antes; SEC-036 (ALTA) cifra la Bóveda en Ahora. El título anterior repetía «auditoría que no se pierde», que es de Próximo. · Prerrequisitos: [B-89], [B-105], [B-28], [B-06], [B-12]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: check:invariant:audit-log cubre computeDiff, omitAuditNoise y la IP con XFF falsificado; un fallo de auditoría dentro del hard-delete revierte el borrado (integración con DATABASE_URL_TEST); archivar escribe CLIENT_ARCHIVED; revelar una credencial escribe CREDENTIAL_REVEALED y el HTML del render no trae secretos descifrados; el audit log filtra por cliente.
- Nodo(s): lib.audit-log, h4.adm-audit, modelo.AdminAuditLog, h4.adm-audit.listado-y-filtros, h4.adm-clientes, h4.adm-clientes.tab-boveda, modelo.ClientAsset
- Worktree: wt/protegidos
- Estado: abierta

### [B-103] auth.ts protegido: callbacks a módulo puro con invariante, org primaria determinística y usuario borrado sin sesión
- Objetivo: Darle a auth.ts el test que su gate exige y cerrar la deuda BAJA que vive en él. · Hallazgos que cierra: [DEU-002], [BUG-005], [SEC-008], [POD-283]
- Archivos a tocar: src/auth.ts (callbacks :173-270 a un módulo puro; orderBy joinedAt en la membresía; jwt devuelve null si !userExists; borrar getPostLoginPath y sus constantes; trustHost solo fuera de producción); invariante check:invariant:auth-sesion con un prisma doble; src/app/login/actions.ts:88-95 y src/app/api/qa/login/route.ts:118-127 (mismo orderBy); scripts/check-env.js antes del build (AUTH_URL o NEXTAUTH_URL en producción); package.json y scripts/run-invariants.mjs:81. · Archivos que NO se tocan: prisma/schema.prisma; src/proxy.ts; src/auth.config.ts salvo lo que pida trustHost.
- Zona: requiere decisión FROZEN + ZONA-FRANCO (auth.ts y qa/login son de Franco)
- Tamaño: M · Riesgo: Alto: auth.ts decide la sesión de los tres portales. Las CRÍTICA/ALTA de auth.ts (SEC-006 en Ahora) y BUG-003/BUG-007/FAL-001/FAL-003 (Próximo) van antes, sin repetirlas acá. Los e2e de login necesitan la base de test. Franco revisa. · Prerrequisitos: [B-89], [B-88], [B-09], [B-27]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: check:invariant:auth-sesion pasa con controles positivos: membresía determinística, usuario inexistente da jwt null y un SETTER sin org pasa signIn; el grep de getPostLoginPath da 0; el build de producción falla sin AUTH_URL ni NEXTAUTH_URL; 06-admin-login, 11-client-login y tests/setter/00-surfaces.spec.ts pasan; Franco aprobó.
- Nodo(s): lib.auth, h1.auth-login.sesion-jwt, h1.auth-login.magic-link, modelo.OrgMember, int.brevo
- Worktree: wt/protegidos-auth
- Estado: abierta

### [B-104] auth-guards protegido: error tipado y variante de página que redirige
- Objetivo: Un solo contrato de autorización: las rutas responden 401/403 según el caso y las páginas redirigen a /login en vez de caer en error.tsx. · Hallazgos que cierra: [BUG-136], [DEU-083]
- Archivos a tocar: src/lib/auth-guards.ts (decisión pura session → ok | UNAUTHENTICATED | FORBIDDEN; requireSetterPage con redirect('/login'), reutilizando el requireSuperAdminPage que crea [B-10]); invariante check:invariant:auth-guards; src/app/api/admin/clients/[organizationId]/send-executive-report/route.ts; admin/tickets/[ticketId]/page.tsx; src/lib/audit-log-queries.ts. Con Franco: setter/leads/[leadId]/manual/_data.ts y setter/nuevo/page.tsx. · Archivos que NO se tocan: src/auth.ts; src/proxy.ts.
- Zona: requiere decisión FROZEN + ZONA-FRANCO (requireSetter y sus llamadores)
- Tamaño: S · Riesgo: Medio: es la autorización de todas las actions del admin y del setter; un error de tipo deja pasar o bloquea a todos. La guardia por página de /admin (SEC-023, ALTA) va en Ahora y crea el helper de página: acá no se duplica. · Prerrequisitos: [B-89], [B-10], [B-88]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: check:invariant:auth-guards cubre anónimo, ORG_MEMBER, CLIENT, SETTER y SUPER_ADMIN con y sin id; la ruta del reporte responde 401 sin sesión y 403 con rol equivocado; una sesión inválida en /setter/** o /admin/tickets/[id] redirige a /login sin pasar por error.tsx ni Sentry; tests/setter/02-isolation pasa con un caso negativo nuevo (ORG_MEMBER contra una action del setter y una del admin).
- Nodo(s): lib.auth, h4.adm-shell, h4.adm-tickets.conversacion-y-respuesta, h5.set-manual, h5.set-nuevo, h5.set-importar
- Worktree: wt/protegidos-auth
- Estado: abierta

### [B-105] Migración aditiva agrupada del schema: índices, Decimal, enums y columnas pendientes
- Objetivo: Juntar en una sola migración revisada los cambios de schema que esperan desde F2, sin reset y sin drift. · Hallazgos que cierra: [PERF-001], [DEU-008], [DEU-010], [DEU-084], [POD-203], [POD-204]
- Archivos a tocar: prisma/schema.prisma y una carpeta nueva en prisma/migrations/ generada con --create-only. Índices: Task.projectId, Notification.userId y taskId, ChatbotEvent.conversationId, más los DROP de índices cubiertos de B11.5. Tipos: Invoice, Subscription, PremiumModule y OrganizationModule a Decimal(10,2); BotConfig.industry a enum (o default 'generico'). Columnas: AdminAuditLog.targetOrganizationId opcional e indexado; unique (botConfigId, sessionId) en chatbot_conversation. Enums: AuditActionType suma CLIENT_ARCHIVED, CLIENT_UNARCHIVED y CREDENTIAL_REVEALED; valores sin uso solo si se decide. Comentarios falsos de DEU-011 en el schema. Con Franco: comentario de OsLead.caliente y onDelete de OsSetterNotice (BUG-170). · Archivos que NO se tocan: Las migraciones aplicadas; nunca `prisma migrate reset` ni `migrate dev` contra una base con drift.
- Zona: requiere decisión FROZEN + ZONA-FRANCO (OsLead* y OsSetterNotice)
- Tamaño: L · Riesgo: Alto. Float→Decimal cambia los tipos de TS en facturación; los DROP y el unique exigen revisar duplicados antes. Se aplica con el mecanismo de migraciones a producción (BUG-014, Próximo) y se prueba contra la base de test. · Prerrequisitos: [B-89], [B-43], [B-88]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: `npx prisma validate` pasa y `npx prisma migrate status` no muestra drift contra la base de test; el SQL es solo aditivo o trae plan de datos para los DROP, revisado por Valentino (y Franco por OsLead*); tsc --noEmit, check:invariants y test:leados (si se tocó OsLead*) en verde; se aplica con migrate deploy.
- Nodo(s): modelo.Task, modelo.Notification, modelo.ChatbotEvent, modelo.Invoice, modelo.Subscription, modelo.PremiumModule, modelo.BotConfig, modelo.AdminAuditLog, modelo.Conversation, modelo.OsLead, lib.prisma
- Worktree: wt/protegidos-schema
- Estado: abierta

### [B-106] Retención de datos: purga de rate_limit y tokens, y política para mensajes y formularios
- Objetivo: Purgar rate_limit y tokens vencidos, acotar las claves que elige quien llama y acordar plazos de retención para conversaciones, mensajes, leads y formularios. · Hallazgos que cierra: [SEC-031], [DEU-006]
- Archivos a tocar: src/app/api/cron/cleanup-old-events/route.ts (purgar rate_limit vencido hace más de un día y PasswordResetToken usados o vencidos); src/app/api/motor/webhook/[channelToken]/route.ts (validar el formato del token; límite por IP antes del límite por canal); comentarios de src/lib/rate-limit/limiter.ts:28-33 y api/chatbot/[slug]/chat/route.ts:76-78; política de retención escrita en OPERACIONES. · Archivos que NO se tocan: prisma/schema.prisma (el índice en expiresAt ya existe); src/lib/rate-limit/limiter.ts salvo comentarios.
- Zona: libre (plazos acordados con Franco: la Neon es compartida)
- Tamaño: M · Riesgo: Medio: borra datos; empezar por rate_limit y tokens, que no tienen valor histórico. · Prerrequisitos: [B-14], [B-06]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-019: tras la corrida no quedan filas de rate_limit vencidas hace más de un día; un token inventado en el webhook del motor no inserta fila; la política con plazos por tabla está escrita y firmada por Valentino y Franco.
- Nodo(s): lib.rate-limit, modelo.RateLimit, h3.vis-whatsapp, h3.vis-api-chatbot, h1.auth-recupero, h6.vis-contacto, modelo.Conversation, modelo.ChatMessage, modelo.ContactSubmission, modelo.PasswordResetToken, int.cron.cleanup-old-events
- Worktree: wt/datos
- Estado: abierta

### [B-107] Antes del merge de rediseno/home: la huella del layout sin auth.ts, schema ni prisma
- Objetivo: Que el test de peso del home no se ponga en rojo cada vez que se arregla auth.ts o se migra el schema. · Hallazgos que cierra: [DEU-109]
- Archivos a tocar: En la rama rediseno/home: src/components/layout/carga-diferida/contrato.ts:236-243 (CONGELADOS_DEL_LAYOUT solo con lo que monta el layout); carga-diferida/__tests__/s8-diferido.invariant.ts; src/app/v3/_lib/__tests__/s3-frontera.invariant.ts:78 (ruta corregida a 'src/auth.ts'). · Archivos que NO se tocan: main; src/auth.ts, prisma/schema.prisma y src/lib/prisma.ts.
- Zona: libre
- Tamaño: S · Riesgo: Bajo. Es urgente en el tiempo: si no va antes del merge, cada arreglo de seguridad o migración pone en rojo un test del home. Se le quitó la dependencia de la política de niveles: no toca archivos protegidos. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: En rediseno/home, test:s8-diferido y s3-frontera pasan; contrato.ts ya no nombra auth.ts, schema.prisma ni prisma.ts, y s3-frontera encuentra src/auth.ts.
- Nodo(s): rama.rediseno-home, lib.auth, lib.prisma
- Worktree: rediseno-home (la rama, antes del merge)
- Estado: abierta

### [B-108] Avisos internos a develOP: logger y alerts.ts libres, envíos con after(), dedupe propio y fallas a Sentry
- Objetivo: Que develOP se entere de los avisos que le corresponden: que no se pierdan en serverless, que no los silencie un tercero y que, si fallan, quede rastro. · Hallazgos que cierra: [BUG-183], [BUG-137], [SEC-089], [BUG-052], [SEC-055], [POD-357], [POD-385]
- Archivos a tocar: src/lib/logger.ts (meta anidada bajo meta/err; serialización con try/catch; error y warn a stderr) con su invariante; src/lib/alerts.ts (captureException si falla el webhook; sendTestAgencyAlert cableado a «Probar webhook» en Configuración; barrido de runPeriodicAgencyAlerts con tope, la parte protegida de PERF-011); admin/settings/_actions/settings.schemas.ts (https más allowlist o validateWebhookUrl del CRM); src/lib/actions/upsell.ts, messages.ts y contact.ts (after() de next/server); dedupe del upsell contra OrganizationModule.upsellLastRequestedAt en vez de ContactSubmission. · Archivos que NO se tocan: src/lib/leados/**; src/app/api/cron/os-follow-up (Franco); la neutralización del texto hacia Slack (SEC-054, Próximo).
- Zona: requiere decisión FROZEN
- Tamaño: M · Riesgo: Medio. SEC-054 (Próximo) y el camino único de contacto tocan alerts.ts y contact.ts antes. FAL-026 (alerts sin disparador) está en Ahora, en [B-14], no en Próximo. · Prerrequisitos: [B-89], [B-38], [B-39]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un invariante muestra que logger.error no lanza con meta circular ni BigInt en NODE_ENV=production y conserva el message; un webhook caído genera un evento en Sentry con el tipo de aviso; guardar un webhook http:// o a un host interno falla con mensaje claro; un visitante que manda el formulario público no silencia el aviso de upsell; el grep de sendAgencyAlert sin await ni after en las actions da 0; el barrido de alertas tiene take.
- Nodo(s): lib.logger, lib.alerts, int.sentry, h4.adm-config.datos-y-alertas, h4.adm-alertas.webhook-agencia, h2.cli-servicios.solicitar-modulo, modelo.ContactSubmission, h3.vis-whatsapp
- Worktree: wt/protegidos
- Estado: abierta

### [B-109] dashboard-actions libre: aprobación de entregas atómica y una sola action de notificaciones
- Objetivo: Cerrar las dos deudas del archivo, que 11-CONGELADOS recomienda pasar a libre. · Hallazgos que cierra: [BUG-062], [SEC-109], [POD-078]
- Archivos a tocar: src/actions/dashboard-actions.ts (dentro de la transacción, updateMany con where approvalStatus PENDING_APPROVAL y organizationId, abortando si count es 0; borrar markNotificationAsRead); src/components/dashboard/NotificationCenter.tsx:106 y NotificationHistoryModal.tsx:72 (usar markNotificationReadAction). · Archivos que NO se tocan: markNotificationReadAction de src/lib/actions/notifications.ts NO se borra (POD-078 proponía borrar el gemelo correcto); su filtro por userId lo pone [B-41] (SEC-038); src/components/ui/*.
- Zona: requiere decisión FROZEN
- Tamaño: S · Riesgo: Bajo: radio chico. · Prerrequisitos: [B-89], [B-41]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Dos aprobaciones concurrentes de la misma entrega crean un solo mensaje y una sola notificación (test); el grep de markNotificationAsRead da 0; las dos pantallas de notificaciones usan markNotificationReadAction.
- Nodo(s): lib.actions, h2.cli-proyecto.aprobar-o-pedir-cambios, modelo.Task, h2.cli-shell, lib.componentes-dashboard
- Worktree: wt/protegidos
- Estado: abierta

### [B-110] Fechas argentinas: fundir tz-ar en dates-ar y usarlas en alertas y en el análisis mensual
- Objetivo: Una sola fuente de fechas argentinas con un solo invariante, y que las alertas de agencia y el análisis mensual cuenten días y meses argentinos. · Hallazgos que cierra: [BUG-190], [BUG-090], [POD-358]
- Archivos a tocar: src/lib/tz-ar.ts (re-exportado desde dates-ar; repuntar los 12 imports); src/lib/dates-ar.ts (getISOWeekKeyAR, startOfDateRange y withinDateRange con sus casos) y su invariante; src/lib/alerts.ts (startOfDayAR, dayRangeAR, formatDateAR); src/modules/chatbot/lib/monthly-analysis.ts y server/analysis/getMonthlyAnalysisForOrg.ts (6 meses calendario AR, rellenados con 0); borrar src/lib/agency-settings.ts#AGENCY_TIMEZONE. · Archivos que NO se tocan: src/app/(protected)/admin/page.tsx y announcements (BUG-113 pasó a [B-132]: dates-ar ya tiene los rangos); src/lib/leados/** y el setter; src/components/ui/StatCard.tsx.
- Zona: requiere decisión FROZEN
- Tamaño: M · Riesgo: Medio: de tz-ar dependen los rangos y la clave de idempotencia del reporte semanal. BUG-034/BUG-128 (Próximo) tienen la misma causa y van antes. · Prerrequisitos: [B-89], [B-69]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: check:invariant:dates-ar corrido con TZ=UTC cubre los bordes ISO (2025-12-29 → 2026-W01; 2026-12-31 y 2027-01-01 → 2026-W53; 2027-01-04 → 2027-W01) y los rangos today/7d/30d a las 00:00 AR; los imports de '@/lib/tz-ar' quedan solo como re-export; a las 22:00 AR la ventana de vencimientos de alerts.ts usa el día argentino; el análisis mensual muestra 6 meses seguidos.
- Nodo(s): lib.tz-ar, lib.dates-ar, lib.alerts, h2.cli-resultados.analisis-mensual, modelo.QuotaUsage
- Worktree: wt/protegidos
- Estado: abierta

### [B-111] Reporte ejecutivo semanal: un sendForOrg con cerrojo, destinatario estable y top correcto
- Objetivo: Que el reporte semanal salga una vez por org, al destinatario correcto y con el ranking que el dueño eligió. · Hallazgos que cierra: [BUG-026], [DEU-033], [BUG-057], [BUG-058], [DEU-032], [POD-309], [POD-310]
- Archivos a tocar: src/lib/reports/executive-weekly/send.ts y send-manual.ts (fusionados en sendForOrg(orgId, {respectCadence}) con reserva condicional y expiración de PENDING viejos); api/admin/clients/[organizationId]/send-executive-report/route.ts; build.ts (destinatario ADMIN por joinedAt asc, o todos; reportEligiblePlan o planAllows); report-eligible-plan.ts y su invariante (comparar con build.ts); top-hot-leads.ts (rankear por score en la base sobre toda la semana); src/lib/email/templates/executive-weekly.ts (título con la cantidad real); dashboard/_actions/executive-report-prefs.schemas.ts. · Archivos que NO se tocan: src/lib/reports/client-monthly/*; el disparador del cron (BUG-047, Ahora).
- Zona: libre
- Tamaño: M · Riesgo: Medio. BUG-055 (Próximo, semanas viejas) toca build.ts antes. · Prerrequisitos: [B-56]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Cron y botón llamados en paralelo mandan un solo email (test); el destinatario es el mismo en corridas sucesivas; con 5 elegidos el mail dice «Tus 5» y rankea la semana completa; el invariante compara el gate de plan con build.ts.
- Nodo(s): h2.cli-reportes-email, h2.cli-reportes-email.reporte-semanal, h2.cli-reportes-email.preferencias-del-reporte, lib.plan, h4.adm-clientes, int.brevo, modelo.OrgMember
- Worktree: wt/portal-cliente
- Estado: abierta

### [B-112] Emails: URL base única sin fallback y plantillas que escapan lo que interpolan
- Objetivo: Que ningún email lleve links a localhost, relativos o 'undefined', y que los nombres interpolados no inyecten HTML. · Hallazgos que cierra: [BUG-059], [BUG-067], [DEU-049], [SEC-095], [POD-337]
- Archivos a tocar: Helper de URL base en src/lib/email/ (si [B-40] no lo creó; falla al arrancar sin NEXT_PUBLIC_APP_URL) usado en reports/executive-weekly/build.ts, email/unsubscribe-token.ts, tickets/actions.ts, email-marketing/_actions.ts y client-notifications/notify.ts (más captureException); escapeHtml en src/lib/email/ aplicado en templates/welcome-client.ts, bot-activated.ts, notify-message.ts, password-reset.ts y chatbot/server/notifications/sendInsightsNotification.ts; sendTestNotification pasa a renderLeadEmail y se borra sendLeadNotification. · Archivos que NO se tocan: src/emails/*.tsx (React Email ya escapa); los emails de «Acción requerida» (BUG-112, Próximo).
- Zona: libre
- Tamaño: S · Riesgo: Bajo. BUG-112 (Próximo) comparte la causa en otro sitio: va antes y puede dejar el helper. · Prerrequisitos: [B-40]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: El grep de 'localhost:3000' en src/lib/email, reports, tickets y client-notifications da 0; el arranque falla sin NEXT_PUBLIC_APP_URL; un companyName con <script> llega escapado en las 5 plantillas (invariante de render); el email de prueba de leads usa la plantilla real.
- Nodo(s): int.email, int.brevo, h2.cli-reportes-email.reporte-semanal, h4.adm-tickets, h3.cli-chatbot.aviso-lead-email, h2.cli-shell, lib.chatbot.notifications, h3.adm-chatbots
- Worktree: wt/portal-cliente
- Estado: abierta

### [B-113] Mensajes y tickets: paginación, leído fuera del render, orgs archivadas y orden por actividad
- Objetivo: Que las conversaciones con develOP escalen, que marcar como leído no falle en silencio y que la bandeja muestre lo que importa. · Hallazgos que cierra: [PERF-002], [BUG-120], [BUG-121], [DEU-059], [BUG-056], [UX-041]
- Archivos a tocar: dashboard/messages/page.tsx, components/dashboard/MessageThread.tsx y ClientChatThread.tsx (últimos N más «cargar anteriores» por (organizationId, createdAt)); admin/messages/[orgId]/page.tsx y _actions/message.actions.ts (MarkReadOnMount que llama a una action; filtro deletedAt; envío rechazado a orgs archivadas; hilo paginado con el mismo cursor); message.schemas.ts (.max 5000 y maxLength); src/lib/tickets/actions.ts (updatedAt al responder, en $transaction); admin/clients/[clientId]/_components/tabs/SupportTab.tsx y /admin/tickets (filtro por slug de org). · Archivos que NO se tocan: src/lib/alerts.ts (lee updatedAt).
- Zona: libre
- Tamaño: M · Riesgo: Bajo. UX-048 (Próximo) cambia el filtro por defecto de la bandeja de tickets: va antes y el orden por actividad se apoya en él. · Prerrequisitos: [B-73]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Una conversación de 500 mensajes carga 50 y pagina, en el portal y en el admin; abrir un hilo en el admin marca los leídos sin error de revalidatePath en el log; un cliente archivado no aparece en la bandeja y escribirle devuelve error claro; responder un ticket lo sube en la lista; «Ver todos» filtra por ese cliente.
- Nodo(s): h2.cli-mensajes.conversacion, modelo.Message, h2.cli-mensajes, h4.adm-mensajes.hilo-y-leido, h4.adm-mensajes.bandeja, h4.adm-mensajes.responder, h2.cli-soporte, h4.adm-tickets, h4.adm-clientes.tab-soporte
- Worktree: wt/portal-cliente
- Estado: abierta

### [B-114] IA del portal: fallos que no se cachean, snapshots validados y cupo atómico del brief
- Objetivo: Que una caída del LLM no deje la sección vacía 24 h, que el historial del brief no rompa con formas viejas y que el tope de regeneraciones se cumpla. · Hallazgos que cierra: [BUG-066], [DEU-031], [SEC-043]
- Archivos a tocar: src/lib/ai/results-insights.ts (el fallo no se cachea; captureException); src/lib/ai/brief-history.ts y executive-brief.ts (Zod al leer los snapshots); dashboard/_actions/regenerate-brief.ts (reserva condicional con updateMany más increment antes del LLM, o checkRateLimit por org). · Archivos que NO se tocan: prisma/schema.prisma.
- Zona: libre
- Tamaño: S · Riesgo: Bajo. PERF-004 y BUG-060 (Próximo) tocan el brief antes. · Prerrequisitos: [B-56], [B-47]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Cinco regeneraciones en paralelo producen como máximo las que permite el cupo (test con Promise.all); un 5xx de Anthropic no deja «sin insights» por 24 h y aparece en Sentry; un snapshot con forma vieja se descarta sin romper la página.
- Nodo(s): h2.cli-resultados, int.anthropic, h2.cli-inicio, h2.cli-inicio.resumen-ia, modelo.ExecutiveBriefSnapshot, lib.chatbot.llm, modelo.Organization
- Worktree: wt/portal-cliente
- Estado: abierta

### [B-115] Plan efectivo: una lectura por request y el estado de la suscripción
- Objetivo: Que el plan se lea una vez por request, sin escrituras escondidas, y que una suscripción CANCELED o PAST_DUE tenga un plan efectivo definido. · Hallazgos que cierra: [PERF-005], [DEU-034], [POD-311], [POD-312]
- Archivos a tocar: src/lib/plan/get-plan-for-org.ts (React cache(); sin escribir en la lectura; plan efectivo para CANCELED y PAST_DUE) con su invariante; src/lib/recommendations/get-recommendations-for-org.ts; dashboard/plan/page.tsx; src/lib/plan/plan-presentation.ts (precio y cupo leídos del Plan); src/lib/modules/check-activation.ts (fusionado con getActiveModuleSlugs). · Archivos que NO se tocan: prisma/schema.prisma; src/modules/chatbot/server/quota/* (BUG-024, Próximo).
- Zona: libre
- Tamaño: S · Riesgo: Medio: decidir qué ve una org PAST_DUE (fallback o bot en pausa) afecta al chat en producción. BUG-024 (Próximo) unifica la fuente del plan antes. · Prerrequisitos: [B-47]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un render de /dashboard/plan lee una sola vez el plan y el uso (log de queries); un invariante muestra que CANCELED y PAST_DUE devuelven el plan efectivo decidido; getPlanForOrg no escribe.
- Nodo(s): h2.cli-plan, h2.cli-inicio, lib.plan, h3.cli-chatbot
- Worktree: wt/portal-cliente
- Estado: abierta

### [B-116] Inicio y Resultados: deltas, visitas, valor y Health Score honestos, y contenido de IA rotulado
- Objetivo: Que Inicio y Resultados no muestren ceros fijos, deltas falsos ni sumas dobles, y que lo generado por IA lo diga. · Hallazgos que cierra: [BUG-051], [UX-016], [BUG-053], [UX-011], [POD-304], [POD-305], [POD-306]
- Archivos a tocar: src/lib/dashboard/week-results.ts y src/lib/ai/executive-brief-input.ts (visitas ocultas hasta cablear GA4; base 0 → «nuevo»; weekRangeAR), o retirar components/dashboard/home/WeekResultsGrid.tsx; home/MoneyEstimate.tsx y src/lib/dashboard/home-metrics-logic.ts («Valor potencial» o tasa de cierre real); src/lib/health-score.ts (SEO fuera del denominador; vencidas una vez; campos sin uso); results/InsightsBlock.tsx y analysis/DiscoveriesSection.tsx (badge «Generado con IA»); results/PageSpeedCard.tsx (rama muerta). · Archivos que NO se tocan: src/lib/integrations/google-business-profile.ts (UX-015 va con IDEA-003); src/components/ui/*.
- Zona: libre
- Tamaño: M · Riesgo: Bajo: el brief IA narra estos números. BUG-039/BUG-049 y SEC-048 (misma familia) van antes en Ahora/Próximo: acá solo lo que esas no cubren. · Prerrequisitos: [B-56], [B-15]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Con base 0 el delta dice «nuevo» y el brief no narra una suba del 100 %; sin GA4 ninguna tarjeta muestra Visitas en 0; para una org sin SEO el Health Score no cuenta esa métrica y una tarea vencida resta una vez (invariante); InsightsBlock y DiscoveriesSection muestran «Generado con IA»; visual-qa de Inicio y Resultados sin ❌.
- Nodo(s): h2.cli-inicio.resultados-semana, h2.cli-inicio.resumen-ia, h2.cli-inicio, h2.cli-inicio.semana-en-numeros, h2.cli-inicio.health-score, lib.health-score, h2.cli-resultados.insights-ia, h2.cli-resultados.analisis-mensual, int.anthropic
- Worktree: wt/portal-cliente
- Estado: abierta

### [B-117] Referidos: atribución con guardas completas y conversión auditable
- Objetivo: Que el programa de referidos no se pueda burlar con mayúsculas, no exponga al referido y registre qué org convirtió. · Hallazgos que cierra: [SEC-052], [DEU-021]
- Archivos a tocar: src/lib/referrals/referrals.service.ts (emails sin mayúsculas; Sentry en el catch; aviso a todos los SUPER_ADMIN); src/lib/actions/contact.ts (sobre el camino único de contacto); dashboard/referidos/page.tsx (email enmascarado); admin/referrals/_actions/referrals.admin.actions.ts (pedir la org cliente, guardarla en referredOrgId y rechazar la referente). · Archivos que NO se tocan: prisma/schema.prisma (referredOrgId ya existe).
- Zona: libre
- Tamaño: S · Riesgo: Bajo. El camino único de contacto (Próximo) reescribe contact.ts y habilita atribuir desde mobile (BUG-132). · Prerrequisitos: [B-39]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un referido con el email en otra capitalización se detecta como auto-referido; el referente ve el email enmascarado; marcar CONVERTED exige elegir la org, la guarda en referredOrgId y rechaza la referente.
- Nodo(s): h2.cli-referidos, h6.vis-contacto, h6.vis-contacto.atribucion-de-referido, h4.adm-referidos, modelo.Referral
- Worktree: wt/portal-cliente
- Estado: abierta

### [B-118] Portal: CTAs y redirecciones que llegan con su contexto y pantallas que leen el parámetro
- Objetivo: Que cada link del portal mande un parámetro que el destino lee (contexto del composer, tab activa, error de conexión) y que los redirects legacy lleguen en un salto. · Hallazgos que cierra: [BUG-046], [UX-007], [BUG-174], [UX-052]
- Archivos a tocar: OnboardingStatusCard.tsx, plan/UsageMeter.tsx y ClientKnowledgeView.tsx (?context=activacion, la clave que existe en message-context.ts); dashboard/modules/email-marketing/layout.tsx (usePathname en un componente cliente); dashboard/layout.tsx (sin la excepción isBienvenida por x-pathname); next.config.ts (redirects directos de /dashboard/crm y /dashboard/seo-avanzado); src/app/api/auth/tiendanube/callback/route.ts (try/catch) y dashboard/modules/tienda-conectada/page.tsx (lee ?error=). · Archivos que NO se tocan: src/proxy.ts (no se agrega x-pathname como header confiable); la navegación dura con window.location.assign (DEU-026, pasó a [B-119]).
- Zona: libre
- Tamaño: S · Riesgo: Bajo. BUG-032 (ALTA, Ahora) rehace el camino de conexión de Tiendanube: UX-052 va encima de ese callback. UX-008 (Agenda) se movió a la higiene del portal. · Prerrequisitos: [B-20]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: El CTA de activar el bot abre Mensajes con el composer precargado; la tab activa de Email marketing queda marcada; mandar un header x-pathname ya no saltea el gate de onboarding; /dashboard/seo-avanzado llega en un salto; un error del callback de Tiendanube se ve en tienda-conectada.
- Nodo(s): h2.cli-inicio.estado-onboarding, h2.cli-mensajes, h2.cli-email-mkt, h2.cli-shell.layout-y-navegacion, lib.proxy, h2.cli-plan, h2.cli-tienda.conectar-tienda, int.tiendanube
- Worktree: wt/navegacion
- Estado: abierta

### [B-119] Navegación de los portales según la regla: Link o redirect(), sin triggerTransition ni navegación dura
- Objetivo: Que admin y portal naveguen con Link o redirect() y no con el triggerTransition del sitio público, router.push sin motivo ni window.location.assign, y que un invariante lo sostenga. · Hallazgos que cierra: [DEU-024], [DEU-035], [DEU-039], [DEU-026]
- Archivos a tocar: bienvenida/_components/BienvenidaWizard.tsx, components/dashboard/NewTicketModal.tsx, email-marketing/campaigns/[id]/send/page.tsx, admin/chatbots/new/CreateBotForm.tsx, admin/clients/[clientId]/_components/ClientSwitcher.tsx, admin/leads/_components/lead-card.tsx, chatbot/components/admin/onboarding/Step5Review.tsx y admin/clients/[clientId]/edit/EditClientForm.tsx (redirect() en la action, Link o comentario inline); PremiumModuleCard.tsx, home/Recommendations.tsx, plan/UpgradeCtaButton.tsx, AlertaMetrica.tsx, email-marketing/campaigns/new/page.tsx y src/lib/actions/upsell.ts (sin window.location.assign ni <a href> internos); invariante nuevo check:invariant:navegacion (ningún archivo de (protected)/** importa TransitionContext; padrón con setter-nav.tsx:7 hasta que se decida DEU-082; control positivo). · Archivos que NO se tocan: src/context/TransitionContext.tsx (FROZEN); src/app/(protected)/setter/*; admin/leads/_actions/* (ZONA-FRANCO).
- Zona: libre
- Tamaño: M · Riesgo: Bajo. Suma DEU-026 (misma regla) desde la tarjeta de CTAs; el invariante de navegación sale de «De prosa a mecanismo» y de la de TransitionContext para vivir con la regla. lead-card.tsx también lo toca [B-129]. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: check:invariant:navegacion pasa con su control positivo; en src/components/dashboard el grep de window.location.assign y de <a href="/dashboard da 0; cada router.push que quede en los portales tiene un comentario con el motivo.
- Nodo(s): h2.cli-bienvenida.wizard-3-pasos, h2.cli-soporte.crear-ticket, h2.cli-email-mkt.crear-y-enviar-campana, h3.adm-chatbots.crear-bot, h4.adm-clientes.detalle, h4.adm-leads.pipeline-kanban, h4.adm-clientes.alta-cliente-con-bot, h4.adm-clientes.editar-datos, h2.cli-servicios.vitrina-modulos, h2.cli-inicio, h2.cli-plan, h2.cli-resultados, lib.context
- Worktree: wt/navegacion
- Estado: abierta

### [B-120] Runtime del chat: contabilidad del turno cortado por el watchdog y contratos de cuota que dicen lo que hacen
- Objetivo: Que cada turno quede contabilizado aunque lo corte el watchdog y que los contratos de cuota y los tipos públicos digan lo que hacen. · Hallazgos que cierra: [BUG-094], [DEU-050], [POD-336]
- Archivos a tocar: src/modules/chatbot/server/chat/handleChatRequest.ts y persistTurn.ts (si onFinish llega tarde, update dirigido de tokens, costo y toolCalls; quitar o mover el chequeo de KB de POD-336); server/quota/checker.ts (sin messagesAdded; checkQuota pasa a una lectura con nombre propio); shared/types.ts (tipos alineados a Prisma). · Archivos que NO se tocan: src/lib/isolation/*; los prompts; server/llm/* (otra tarjeta).
- Zona: libre
- Tamaño: M · Riesgo: Medio: camino caliente del chat. SEC-074 (ALTA) y BUG-092 tocan el watchdog en Ahora; el techo de Netlify (TEC-006) en Próximo. Esta va después, en el mismo worktree. Se separó de la credencial de Vertex y del pin de ai, que son otra causa. · Prerrequisitos: [B-07], [B-50]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Con un stream simulado, un turno cerrado por el watchdog termina con tokens y costo > 0 en ChatMessage cuando el proveedor los reporta; el grep de messagesAdded da 0; tsc pasa con los tipos públicos alineados.
- Nodo(s): h3.vis-api-chatbot, modelo.ChatMessage, modelo.QuotaUsage, lib.chatbot.shared, lib.chatbot.quota
- Worktree: wt/chatbot
- Estado: abierta

### [B-121] Proveedor LLM: credencial de Vertex parseada una vez, ai@6 fijado y reporte que no culpa al cliente
- Objetivo: Que una credencial rota no ensucie la base ni Sentry, que una subida de ai no rompa el cierre del stream en silencio y que el reporte semanal distinga una caída del LLM de un script mal instalado. · Hallazgos que cierra: [SEC-064], [TEC-004], [UX-033], [POD-338]
- Archivos a tocar: src/modules/chatbot/server/llm/providers/google.ts (credencial parseada una vez, error genérico); server/llm/providerStreamClose.ts y package.json (pin exacto de ai y @ai-sdk/google-vertex; invariante de versión); server/reports/buildWeeklyReport.ts (no culpar al cliente si hubo errores del bot); los tipos sin consumidores de POD-338. · Archivos que NO se tocan: src/lib/isolation/*; handleChatRequest.ts (tarjeta de runtime).
- Zona: libre
- Tamaño: S · Riesgo: Bajo. Renovar la credencial vencida (BUG-145) y hacer visible la caída del proveedor (BUG-063) van en Ahora; UX-033 se apoya en el evento de error que crea esa tarjeta. · Prerrequisitos: [B-01], [B-13]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Una credencial mal formada produce un solo error genérico por arranque, sin su texto en ChatbotEvent; cambiar la versión de ai rompe el invariante; con 0 conversaciones y errores del LLM la semana, el reporte no dice «verificá el script».
- Nodo(s): lib.chatbot.llm, modelo.ChatbotEvent, h3.cli-chatbot, lib.chatbot.reports, lib.chatbot.shared
- Worktree: wt/chatbot
- Estado: abierta

### [B-122] Evals y regresión: purga acotada a bots QA y teardown que restaura la cuota
- Objetivo: Que las baterías de evals y de regresión no borren conversaciones de clientes ni dejen la cuota en 0. · Hallazgos que cierra: [SEC-081], [BUG-188], [POD-168], [POD-169], [POD-170], [POD-065], [POD-066], [POD-067]
- Archivos a tocar: src/modules/chatbot/evals/cleanup.ts y runner.ts (además del prefijo, botConfigId in evalBotIds()); scripts/regression/purge.ts, cases.ts y run-baseline.ts (leer el QuotaUsage previo, restaurarlo, corregir el comentario); server/chat/requestSchema.ts (decidir si el prefijo de sessionId de evals queda reservado); evals/scoring/evaluate.ts y seed-eval-bots.ts (se quedan o se borran). · Archivos que NO se tocan: Datos de clientes; los seeds.
- Zona: libre
- Tamaño: S · Riesgo: Medio: hoy corre contra la Neon compartida; se prueba contra la base de test. · Prerrequisitos: [B-88]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Una conversación de un bot que no es de QA con sessionId que empieza con el prefijo de evals sobrevive a la purga (test contra la base de test); después de la batería QuotaUsage vuelve al valor previo; cada POD de evals y regresión queda borrado o anotado «se queda» con motivo.
- Nodo(s): lib.chatbot.evals, modelo.Conversation, modelo.ChatbotLead, lib.scripts, modelo.QuotaUsage
- Worktree: wt/chatbot
- Estado: abierta

### [B-123] Alertas de bots: reconocer silencia, transiciones condicionales, detector sin N+1 y vista mobile
- Objetivo: Que el triage de alertas funcione: reconocer silencia, resolver no reabre y el detector entra en el tiempo de una función. · Hallazgos que cierra: [BUG-028], [BUG-140], [PERF-010], [UX-037], [UX-038], [POD-342], [POD-343]
- Archivos a tocar: src/modules/chatbot/server/admin/detectBotIssues.ts (dedupe contra PENDING y ACKNOWLEDGED; groupBy por tipo de señal; emails en lote al final); manageAlerts.ts (updateMany condicional; ActionResult); api/cron/detect-bot-issues/route.ts (maxDuration explícito); admin/alerts/AlertsClient.tsx (catch con mensaje útil); _components/alerts-date-filter.tsx y alerts-filters.ts (flex-wrap; popover con clamp); admin/audit-log/_components/audit-period-filter.tsx (selector de período compartido). · Archivos que NO se tocan: src/lib/alerts.ts (alertas de agencia).
- Zona: libre
- Tamaño: M · Riesgo: Medio: FAL-016 (ALTA, Ahora) le da disparador al detector; si corre a diario antes de esta tarjeta, BUG-028 re-alerta por email y Telegram cada día: llevar al menos el dedupe junto con ese arreglo. BUG-111 y BUG-024 (Próximo) tocan la misma vista y el detector antes. · Prerrequisitos: [B-73], [B-47]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Reconocer una alerta y correr el detector no la recrea ni manda email; reconocer una RESOLVED no la reabre; con 30 bots el detector hace un número fijo de queries por tipo (log); /admin/alerts a 390 px sin scroll horizontal (visual-qa); un fallo al resolver muestra «No se pudo resolver la alerta; reintentá».
- Nodo(s): h4.adm-alertas, modelo.BotAlert, int.cron.detect-bot-issues, h4.adm-alertas.marcar-vista-resolver, h4.adm-alertas.detector-incidencias, lib.chatbot.admin, h4.adm-alertas.filtros-y-vista-completa, h4.adm-alertas.triage
- Worktree: wt/chatbot-admin
- Estado: abierta

### [B-124] Inteligencia del chatbot: alcance de las métricas decidido y stream de actividad sin huecos ni polling oculto
- Objetivo: Que actividad y health midan lo que dicen medir, que el stream no pierda eventos y que no consulte cada 3 s con la pestaña oculta. · Hallazgos que cierra: [DEU-019], [BUG-078], [PERF-008]
- Archivos a tocar: src/modules/chatbot/server/admin/getActivityChartData.ts y getLatencyHistory.ts (forOrg(develOP), o rótulo «plataforma» con groupBy); server/health/buildHealthVerdict.ts; server/config/envValidator.ts; src/lib/isolation (resolver las razones PENDIENTE-DECISIÓN); components/admin/ActivityLog.tsx, api/admin/chatbot/events/route.ts y server/admin/queries.ts (cursor createdAt + id; since con Zod; pausa con document.visibilityState, backoff sin eventos, corte ante 401 con aviso). · Archivos que NO se tocan: El guard de las páginas activity y health (SEC-063 lo cierra [B-10], en Ahora: acá solo se verifica).
- Zona: libre
- Tamaño: S · Riesgo: Bajo: decidir el alcance cambia lo que el admin cree que mide. PERF-008 venía en la tarjeta del dashboard del admin: es el mismo archivo y el mismo stream. · Prerrequisitos: [B-10]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un ORG_MEMBER con token válido recibe redirect en /admin/chatbot/activity y /health (verificación de SEC-063); el grep de 'PENDIENTE-DECISIÓN' en el registro da 0; dos eventos con el mismo createdAt llegan los dos al stream (test del cursor); VH-076: con la pestaña oculta no hay pedidos cada 3 s. SEC-063 lo cierra [B-10]; acá solo se verifica [F7 B23]
- Nodo(s): h3.adm-actividad, h3.adm-health, lib.isolation, lib.chatbot.admin, modelo.ChatbotEvent, h3.adm-actividad.stream-eventos, h3.adm-chatbots.actividad-por-bot
- Worktree: wt/chatbot-admin
- Estado: abierta

### [B-125] Cron de insights: costo visible y procesamiento por lotes
- Objetivo: Que el cron de insights registre su costo de LLM, lea solo lo que usa y procese los bots en lotes reanudables dentro del techo de la plataforma. · Hallazgos que cierra: [DEU-048], [PERF-012]
- Archivos a tocar: src/modules/chatbot/server/insights/generateInsights.ts (result.usage y costo con calculateCost en ChatbotEvent o QuotaUsage; 50 conversaciones y mensajes USER con take; modelo del plan; abortSignal con timeout); api/cron/generate-insights/route.ts y netlify/functions/generate-insights-cron.ts (cursor persistido o fan-out por bot; orderBy estable; maxDuration explícito; duración por bot medida). · Archivos que NO se tocan: prisma/schema.prisma (usar ChatbotEvent o QuotaUsage existentes).
- Zona: libre
- Tamaño: M · Riesgo: Medio: un fan-out mal acotado multiplica llamadas a Vertex. · Prerrequisitos: [B-14], [B-47]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-136: con todos los bots el cron termina dentro del techo o reanuda en la corrida siguiente; cada corrida deja tokens y costo registrados por bot.
- Nodo(s): h3.adm-chatbots, lib.chatbot.llm, int.cron.generate-insights, modelo.ChatbotInsight
- Worktree: wt/chatbot
- Estado: abierta

### [B-126] Alta de cliente con bot: slug válido y único y validación igual en alta, sandbox y portal
- Objetivo: Que el alta de cliente con bot y el perfil de empresa validen igual en todos lados y generen slugs válidos y únicos. · Hallazgos que cierra: [BUG-089], [BUG-184], [SEC-066], [SEC-049], [POD-331]
- Archivos a tocar: src/modules/chatbot/server/admin/createClientWithBot.ts y createClientOnly.ts (findUniqueBotSlug; avatarImageUrlSchema; máximos de saveKnowledgeBase); createBot.ts; src/lib/slugify.ts (respaldo 'bot' o 'cliente' más sufijo; Zod contra el slug vacío) y su invariante; src/lib/onboarding/core.ts; api/admin/chatbot/test-prompt/route.ts (mismos topes); server/admin/avatarImageUrlSchema.ts (desde el portal, solo data URL re-encodeada); client-avatar/ClientAvatar.tsx. · Archivos que NO se tocan: prisma/schema.prisma; la normalización del email del alta (BUG-002, Ahora); el preflight y la KB del alta (Próximo).
- Zona: libre
- Tamaño: M · Riesgo: Bajo-medio. BUG-002 (ALTA) y el preflight del alta (Próximo) tocan los mismos archivos antes. El borrador del wizard se separó: es otra causa. · Prerrequisitos: [B-23], [B-59]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Las altas «株式会社» y «Ñandú» generan slugs no vacíos y únicos (invariante de slugify); dos altas sobre la misma org no chocan en BotConfig.slug; el sandbox rechaza un prompt por encima del tope de la KB; desde el portal se rechaza un avatar con URL externa.
- Nodo(s): h3.adm-chatbots.alta-cliente-con-bot, lib.chatbot.admin, modelo.BotConfig, lib.slugify, h3.adm-chatbots, h4.adm-clientes.alta-cliente-con-bot, h3.adm-chatbots.probar-prompt, h2.cli-cuenta.perfil-empresa, modelo.Organization
- Worktree: wt/chatbot-admin
- Estado: abierta

### [B-127] Borrador del alta: sin PII en localStorage, guardado tras el primer cambio y plantilla que sigue a la industria
- Objetivo: Que el borrador del alta de cliente no deje PII en el navegador, no aparezca sin haber empezado y que la plantilla de KB siga a la industria elegida. · Hallazgos que cierra: [SEC-067], [BUG-080], [UX-023]
- Archivos a tocar: src/modules/chatbot/components/admin/onboarding/useOnboardingDraft.ts y types.ts (sin contacto ni data-URI; clave por usuario; guarda tras el primer cambio; se limpia al logout; avisa si falla); OnboardingWizard.tsx; Step3KnowledgeBase.tsx (ofrecer reemplazar la plantilla al cambiar la industria). · Archivos que NO se tocan: Las server actions del alta (otra tarjeta).
- Zona: libre
- Tamaño: S · Riesgo: Bajo: los borradores viejos con PII hay que borrarlos al primer arranque. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Después del paso 1, localStorage no tiene email, teléfono ni data-URI; abrir el alta sin tocar nada no muestra «onboarding sin terminar»; al cerrar sesión el borrador desaparece; cambiar la industria en el paso 1 ofrece reemplazar la plantilla.
- Nodo(s): h4.adm-clientes.borrador-alta, h4.adm-clientes.plantilla-kb-industria, h4.adm-clientes.alta-cliente-con-bot
- Worktree: wt/chatbot-admin
- Estado: abierta

### [B-128] Clientes en el admin: componente partido, fallos visibles, archivados distinguibles y credenciales al miembro correcto
- Objetivo: Que la ficha y el listado de clientes se puedan mantener y operar con teclado, y que muestren sus errores. · Hallazgos que cierra: [DEU-058], [UX-042], [UX-043], [A11Y-022], [BUG-118], [BUG-117], [BUG-124], [POD-349]
- Archivos a tocar: admin/clients/_components/ClientsListClient.tsx (de 772 líneas a ClientCard, BulkBar y flujo de borrado; focus-visible; acciones visibles sin hover); [clientId]/_components/ResendCredentialsButton.tsx y SendExecutiveReportButton.tsx (server actions con resultado tipado); ImpersonateButton.tsx y src/lib/bulk-actions.ts (toast.error); [clientId]/edit/EditClientForm.tsx y [clientId]/page.tsx (editar la empresa sin ADMIN; badge de archivado); ClientSwitcher.tsx (roles y aria-expanded); tabs/OverviewTab.tsx (ADMIN por joinedAt asc); clients/page.tsx (revalidateTag('admin-clients') en alta, edición y plan); [clientId]/chatbot/[[...tab]]/page.tsx (install e integrations en TAB_MAP). · Archivos que NO se tocan: createClientWithBot.ts (tarjeta del alta); la regla de a quién se le pueden resetear credenciales (SEC-087, Próximo).
- Zona: libre
- Tamaño: M · Riesgo: Bajo. SEC-087 y UX-040 (Próximo) tocan el mismo botón y las mismas actions de Clientes antes. · Prerrequisitos: [B-28], [B-58]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: ClientsListClient queda en menos de 300 líneas y sin fetch directo a route handlers; un cliente se archiva y se fija con teclado; un archivado muestra su badge en la ficha y el switcher; un cliente recién creado aparece sin recargar; /admin/clients/<id>/chatbot/install llega al tab install; reenviar credenciales nombra al usuario afectado.
- Nodo(s): h4.adm-clientes.listado, h4.adm-clientes.reenviar-credenciales, h4.adm-clientes.reporte-ejecutivo-manual, h4.adm-clientes.acciones-masivas, h4.adm-clientes.impersonar, h4.adm-clientes.editar-datos, h4.adm-clientes.detalle, h4.adm-clientes.archivar, h4.adm-clientes.alta-cliente, modelo.OrgMember, h4.adm-clientes.redireccion-chatbot-legacy, h3.adm-chatbots
- Worktree: wt/admin
- Estado: abierta

### [B-129] Leads del admin: un módulo de presentación, conteos coherentes y card operable por teclado
- Objetivo: Que el CRM del admin use una sola fuente de rótulos y criterios, muestre lo que pidió el cliente y se pueda operar con teclado. · Hallazgos que cierra: [DEU-061], [BUG-122], [BUG-123], [UX-045], [A11Y-023], [POD-351], [POD-352], [POD-353]
- Archivos a tocar: admin/leads/_components/lead-card.helpers.ts (única fuente de labels, tonos y fechas), lead-pipeline.shared.ts y demo-form.tsx (useTransition o catch); leads/[leadId]/page.tsx y leads/page.tsx (el mismo conteo comercial); _components/inbound-leads-table.tsx (badge de módulo o plan-upgrade-*); _components/lead-card.tsx (Link separado del handle de arrastre; botón fuera del role=button; onKeyDown solo si target === currentTarget). · Archivos que NO se tocan: admin/leads/_actions/* (ZONA-FRANCO); admin/leados/**.
- Zona: libre (admin/leads/_actions es ZONA-FRANCO y no se toca)
- Tamaño: S · Riesgo: Bajo. Se separó de Proyectos (otra causa) y suma A11Y-023 de la tarjeta de formularios del admin. lead-card.tsx también lo toca [B-119]. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: En admin/leads queda una sola definición de labels y tonos; el board y la ficha muestran el mismo conteo; demo-form no queda en «Guardando...» tras un rechazo; la tabla Inbound distingue módulo de upgrade de plan; VH-122: un lead se borra solo con teclado desde el board.
- Nodo(s): h4.adm-leads, h4.adm-leads.ficha-y-estado, modelo.OsLead, h4.adm-leads.demos, h4.adm-leads.inbound, h4.adm-leads.eliminar-lead, h4.adm-leads.pipeline-kanban
- Worktree: wt/admin
- Estado: abierta

### [B-130] Proyectos del admin: archivados fuera, proyecto interno con helper, aviso de aprobación y horas con dueño
- Objetivo: Que Proyectos deje fuera a las orgs archivadas, use un solo criterio de proyecto interno, avise al cliente al pedir aprobación y no deje editar horas ajenas sin rastro. · Hallazgos que cierra: [BUG-131], [DEU-064], [UX-051], [SEC-088], [POD-354], [POD-075]
- Archivos a tocar: projects/[projectId]/layout.tsx, projects/page.tsx y _actions/project.actions.ts (deletedAt null; orgs archivadas rechazadas); _actions/project.schemas.ts (4 campos muertos); helper isInternalProject y AGENCY_ORG_SLUG en src/lib usados en los 7 sitios; src/lib/actions/projects.ts, src/actions/agency-actions.ts y projects/_components/task-list.tsx (enviar a aprobación crea Notification y email, ActionResult y logAdminAction); team/_actions/time-entry.actions.ts (entry.userId === sesión o auditar; podar updateTimeEntry y listTimeEntriesByUser). · Archivos que NO se tocan: admin/leads/** (otra tarjeta).
- Zona: libre
- Tamaño: M · Riesgo: Bajo. Las tarjetas de Proyectos y de pagos/entregas de Próximo tocan las mismas actions antes; SEC-084 (agency-actions sin Zod) va con la guardia de Ahora. La poda del portal borra exports de lib/actions/projects.ts: va después de esta. · Prerrequisitos: [B-70], [B-71], [B-28]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Los selectores de proyecto no muestran orgs archivadas; fuera del helper el grep del slug mágico 'develop' da 0; enviar a aprobación crea la Notification y el email al cliente; editar o borrar horas de otro usuario falla o deja AdminAuditLog; el grep de updateTimeEntry da 0.
- Nodo(s): h2.cli-plan, h2.cli-servicios, h4.adm-proyectos.alta-edicion, modelo.Organization, h4.adm-proyectos, modelo.Project, h4.adm-proyectos.enviar-a-aprobacion, h2.cli-proyecto, modelo.Message, h4.adm-proyectos.carga-horas, modelo.OsTimeEntry
- Worktree: wt/admin
- Estado: abierta

### [B-131] Admin: validación estricta y listados con tope
- Objetivo: Que las entradas del admin pasen por Zod y que ningún listado traiga tablas enteras. · Hallazgos que cierra: [DEU-066], [PERF-011]
- Archivos a tocar: src/lib/audit-log-queries.ts (enum de AuditActionType; pageSize ≤ 100); src/lib/bulk-actions.ts (orgIds con schema; export en streaming con tope); admin/team/_actions/task.schemas.ts (assignedToId SUPER_ADMIN; .max en los textos); admin/tickets/_actions/ticket.actions.ts (cursor y filtros en el servidor); admin/team/page.tsx (workload solo de tareas no DONE o en una ventana); admin/leads/page.tsx (con tope); resúmenes de proyectos con take. · Archivos que NO se tocan: admin/leads/_actions/* (ZONA-FRANCO); el hilo de mensajes (lo pagina [B-113]); src/lib/alerts.ts (el barrido protegido va con [B-108]).
- Zona: libre
- Tamaño: M · Riesgo: Bajo. Se quitaron de acá el hilo de mensajes y el barrido de alerts.ts (protegido) para no duplicar. · Prerrequisitos: [B-113], [B-73]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: listAuditLog con un actionType inválido o pageSize 10000 devuelve error de validación; la bandeja de tickets pagina por cursor; en esos archivos no queda findMany sin take; exportar 10.000 leads no los carga todos en memoria; asignar una tarea a un ORG_MEMBER falla.
- Nodo(s): h4.adm-audit.listado, h4.adm-clientes.acciones-masivas, h4.adm-proyectos.tareas, h4.adm-tickets.bandeja, h4.adm-equipo.workload
- Worktree: wt/admin
- Estado: abierta

### [B-132] Dashboard del admin: KPIs en funciones puras, en hora argentina y con la tasa de respuesta por eventos
- Objetivo: Sacar el cálculo de KPIs de admin/page.tsx a funciones puras testeables, calcularlas con días argentinos y medir la tasa de respuesta sobre respuestas reales. · Hallazgos que cierra: [DEU-055], [BUG-114], [BUG-113]
- Archivos a tocar: src/app/(protected)/admin/page.tsx → módulo nuevo en src/lib/ con las consultas y los KPIs como funciones puras (sin reasignar un let; límites de hoy, semana y mes con dayRangeAR, weekRangeAR y monthRangeAR de dates-ar; tasa de respuesta sobre eventos de respuesta, card y chart con el mismo criterio) y sus tests; la página queda como composición; admin/announcements/_actions/announcements.actions.ts (expiresOn al fin del día AR). · Archivos que NO se tocan: src/lib/dates-ar.ts (ya tiene los rangos: se usa, no se cambia); src/lib/leados/** (los eventos de OsLead solo se leen).
- Zona: libre
- Tamaño: M · Riesgo: Bajo: comparar los KPIs antes y después con un test. Fusiona DEU-055 con BUG-114 (misma función) y BUG-113 (mismo archivo; dates-ar ya alcanza, sin esperar la fusión de tz-ar). PERF-008 pasó a la tarjeta del stream de actividad. · Prerrequisitos: [B-10]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: admin/page.tsx queda por debajo de 300 líneas y sin el error react-hooks/immutability; los KPIs dan lo mismo antes y después (test) salvo los corregidos; a las 22:00 AR los KPIs de hoy cuentan el día argentino (test con TZ=UTC); un lead que respondió y quedó PERDIDO cuenta como respondido y card y chart dan el mismo número; una novedad con expiresOn de hoy vence a las 23:59 AR.
- Nodo(s): h4.adm-dashboard, h4.adm-dashboard.kpis-operativos-y-financieros, h4.adm-dashboard.tendencias-historicas, h4.adm-dashboard.kpis-comerciales, h4.adm-novedades.publicar, modelo.OsLead, lib.dates-ar, lib.prisma
- Worktree: wt/admin
- Estado: abierta

### [B-133] Novedades del admin: retirar con feedback y dejar rastro
- Objetivo: Que retirar una novedad muestre si falló y que publicar y retirar queden en la auditoría. · Hallazgos que cierra: [UX-036]
- Archivos a tocar: admin/announcements/_components/announcement-list.tsx (mirar result.success; error en la fila) y _actions/announcements.actions.ts (logAdminAction al publicar y al retirar). · Archivos que NO se tocan: src/lib/audit-log.ts.
- Zona: libre
- Tamaño: S · Riesgo: Bajo. Se separó del dashboard: es otra causa. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Con la action de retiro forzada a fallar, el error aparece en la fila; publicar y retirar dejan una fila en AdminAuditLog.
- Nodo(s): h4.adm-novedades, h4.adm-novedades.listar-y-retirar, modelo.PanelAnnouncement
- Worktree: wt/admin
- Estado: abierta

### [B-134] LeadOS: escrituras comerciales atómicas, por la puerta comercial y con candado propio
- Objetivo: Que la maquinaria comercial de LeadOS escriba en una transacción, que todo cambio de estado pase por os-commercial y que el cron no dependa de una Notification. · Hallazgos que cierra: [BUG-165], [BUG-150], [DEU-060], [SEC-104], [BUG-170]
- Archivos a tocar: src/lib/os-commercial.ts (registrarContactoComercial, la postergación y crearDemoComercial en $transaction; constante explícita de +2 días); setter/_actions/dossier.actions.ts; admin/leads/_actions/reunion.actions.ts y lead.actions.ts (updateLeadStatus por os-commercial; reactivateAt calculado en el servidor con fechas AR); lead.schemas.ts; admin/leads/_components/change-status-select.tsx y lead-pipeline.tsx; src/lib/leados/agenda.ts; api/cron/os-follow-up/route.ts (idempotencia con clave propia de cron, sin fallback a un usuario cualquiera); src/lib/leados/novedades*.ts (purga de avisos de leads borrados). · Archivos que NO se tocan: prisma/schema.prisma (si BUG-170 pide cascade, va en la migración agrupada); src/auth.ts.
- Zona: ZONA-FRANCO
- Tamaño: M · Riesgo: Medio. BUG-149, BUG-160 y BUG-162 (Próximo) tocan la misma maquinaria antes; test:leados necesita la base de test. · Prerrequisitos: [B-80], [B-81], [B-88]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Con un fallo inyectado a mitad de registrarContactoComercial no queda actividad sin status (test:leados); mover un lead en el kanban limpia nextFollowUpAt y registra una actividad SISTEMA; corrido dos veces el mismo día el cron manda un solo digest; borrar un lead no deja avisos plegados; Franco aprobó.
- Nodo(s): lib.leados, modelo.OsLead, modelo.OsLeadActivity, h4.adm-leads.crud-y-estado, h4.adm-leads.ficha-y-estado, h4.adm-leads.pipeline-kanban, modelo.Notification, h5.set-dia.novedades-dirigidas, modelo.OsSetterNotice
- Worktree: wt/franco-leados
- Estado: abierta

### [B-135] LeadOS: borrado de lead auditado y backfill de caliente con guard
- Objetivo: Que borrar un lead deje auditoría y avise al setter dueño, y que el backfill de caliente no pise las marcas manuales de Franco. · Hallazgos que cierra: [DEU-074], [BUG-177]
- Archivos a tocar: admin/leads/_actions/lead.actions.ts (logAdminAction y LEAD_REASIGNADO_SALIENTE al dueño antes de borrar; evaluar archivar los leads con dossier); scripts/admin-1a-backfill-caliente.ts (borrarlo, o --confirm con dry-run y abortar si algún caliente difiere de la regla). · Archivos que NO se tocan: prisma/schema.prisma (soft-delete: decisión FROZEN); src/lib/leados/* salvo leer.
- Zona: ZONA-FRANCO
- Tamaño: S · Riesgo: Medio: el script ya se aplicó una vez; correrlo de nuevo pisa marcas manuales. Esta es la única tarjeta que toca el backfill (se sacó de la poda de LeadOS). · Prerrequisitos: [B-28]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Borrar un lead con dossier deja AdminAuditLog y una novedad para el setter dueño; correr el backfill sin --confirm no escribe y lista lo que cambiaría (o el script ya no existe); Franco aprobó.
- Nodo(s): h4.adm-leads.crud-y-estado, modelo.OsLead, modelo.OsLeadDossier, h4.adm-leads, h5.adm-revision-demos
- Worktree: wt/franco-leados
- Estado: abierta

### [B-136] LeadOS: fechas en hora argentina y un solo predicado de vencido
- Objetivo: Que LeadOS use dates-ar en vez de reimplementar el día argentino, y que «vencido» y la verificación del secreto del cron se calculen en un solo lugar. · Hallazgos que cierra: [BUG-151], [BUG-159], [DEU-081], [DEU-079]
- Archivos a tocar: admin/leads/_actions/inbound.actions.ts (parseCalendarDayAR); setter/leads/[leadId]/_components/lead-timeline.helpers.ts y manual/_components/manual-nav.tsx (timeZone AR); src/lib/leados/flow.ts; api/cron/os-follow-up/route.ts (dayRangeAR e isAuthorizedCronRequest compartido con timingSafeEqual); src/lib/leados/outreach.ts (contador de DMs con dayRangeAR); predicado único postergadoVencido(lead, ahora) en src/lib/leados; manual/_components/m5-seguimiento.tsx (toqueVencido resuelto en _data.ts). · Archivos que NO se tocan: src/lib/dates-ar.ts (ya exporta dayRangeAR y parseCalendarDayAR: se usa, no se cambia).
- Zona: ZONA-FRANCO
- Tamaño: S · Riesgo: Bajo. BUG-152 (Próximo) tiene la misma causa y va antes; esta cubre los sitios que esa no toca. Se quitó la dependencia de la fusión de tz-ar: dates-ar ya tiene lo necesario. · Prerrequisitos: [B-83]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: A las 22:00 AR el rango de inbound, el historial y el contador de DMs usan el día argentino (casos con TZ=UTC en el invariante); en src/lib/leados y el cron el grep de toISOString().slice(0,10) da 0; m5 no tiene el error react-hooks/purity.
- Nodo(s): h4.adm-leads.inbound-a-oslead, modelo.ContactSubmission, h5.set-manual.historial-del-lead, h5.set-manual.recorrido-y-barra, lib.leados, h5.set-lead.contador-dms-hoy, h5.set-manual.seguimiento
- Worktree: wt/franco-leados
- Estado: abierta

### [B-137] LeadOS: entradas validadas (topes, CSV, link del opener y decisor)
- Objetivo: Cerrar los bordes de entrada de LeadOS: textos sin tope, CSV mal parseado, falsos positivos del opener, agenda sin decisor e importación que expone el sistema. · Hallazgos que cierra: [SEC-103], [BUG-169], [BUG-167], [BUG-158], [SEC-102]
- Archivos a tocar: setter/_actions/dossier.schemas.ts, prospecto.schemas.ts, admin/leads/_actions/lead.schemas.ts, setter/nuevo/nuevo-prospecto-form.tsx e importar-prospectos-form.tsx (.max razonables y maxLength); src/lib/leados/prospecto-import.ts (comillas solo al inicio de un campo, RFC 4180; error si quedan abiertas); src/lib/leados/flow.ts y setter/_actions/outreach.schemas.ts (forma de dominio en el bloqueo de links); manual/_components/agenda-form.tsx y _actions/agenda.schemas.ts (decisorOk en «Buscar de nuevo» y en el servidor); setter/_actions/prospecto-bulk.actions.ts (consulta por lote de nombres normalizados). · Archivos que NO se tocan: prisma/schema.prisma; /api/qa/login (SEC-021 pasó a su tarjeta).
- Zona: ZONA-FRANCO
- Tamaño: M · Riesgo: Bajo. BUG-155 (textos > 5000), BUG-161 y UX-055 (dedupe y CSV de Excel) van antes en Próximo sobre los mismos archivos. · Prerrequisitos: [B-84], [B-85], [B-79]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Los invariantes de prospecto-import y del opener pasan con los casos nuevos ('…me encantó', 'cuenta.Me', comilla en medio de un campo); un campo de 50.000 caracteres se rechaza con mensaje; sin decisor confirmado «Buscar de nuevo» está deshabilitado y la action lo rechaza; la importación hace una consulta por lote y no devuelve leads de otros setters.
- Nodo(s): h5.set-lead, h5.set-nuevo, h4.adm-leads, h5.set-importar.csv, lib.leados, h5.set-lead.opener-sin-link, h5.set-manual.agenda, int.cal-com, h5.set-importar.importar-csv, modelo.OsLead
- Worktree: wt/franco-leados
- Estado: abierta

### [B-138] LeadOS: estado derivado del manual fiel y blobs del dossier atados a ids
- Objetivo: Que el manual del setter muestre el estado real y que los blobs del dossier sobrevivan a un cambio de texto visible. · Hallazgos que cierra: [BUG-166], [UX-056], [UX-054], [DEU-086]
- Archivos a tocar: setter/leads/[leadId]/manual/_data.ts (respondioDesde sin caer a updatedAt); src/lib/leados/manual.ts (el fin del retrabajo se deriva de un dato existente o de una marca de «correcciones aplicadas»); manual/_components/m15-envio.tsx (sin ofrecer el toque con la demo aprobada sin link); src/lib/leados/flow.ts, contracts.ts y setter/_actions/dossier.actions.ts (id junto al nombre, lectura tolerante; progreso ítem por ítem). · Archivos que NO se tocan: prisma/schema.prisma (si la marca pide columna, va en la migración agrupada, con Franco); la guardia de salida del opener (UX-053, pasó a la tarjeta de pérdida de trabajo).
- Zona: ZONA-FRANCO
- Tamaño: M · Riesgo: Medio: cambiar el formato de los blobs exige leer bien los ya guardados. BUG-164 y BUG-153 (Próximo) tocan la misma derivación antes. · Prerrequisitos: [B-80], [B-79]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: El barrido de derivación no muestra regresiones; un lead sin actividad de respuesta no muestra el banner; después de aplicar las correcciones el paso sale de «Construir»; con la demo aprobada sin link m15 no ofrece registrar un toque; renombrar un ítem visible no invalida un dossier guardado (test con un blob viejo); Franco aprobó.
- Nodo(s): h5.set-manual.cabecera-e-historial, lib.leados, h5.set-manual.derivacion-de-pantalla, modelo.OsLeadDossier, h5.set-manual.envio-demo, h5.set-lead.chequeo-final-y-revision, h5.set-lead.brief-y-construccion
- Worktree: wt/franco-leados
- Estado: abierta

### [B-139] Manual del setter: nada de lo tipeado se pierde (hooks de acción y autosave, guardia de salida en opener y traspaso)
- Objetivo: Que una excepción de una action termine en un toast, que navegar no pierda lo último tipeado y que salir del opener o de las notas de traspaso con texto sin registrar pida confirmación. · Hallazgos que cierra: [BUG-181], [BUG-182], [UX-053]
- Archivos a tocar: src/lib/use-step-action.ts (try/catch con toast.error genérico, onError y captureException); src/lib/use-autosave.ts (flush al desmontar en vez de cancelar); src/lib/use-unsaved-guard.ts; setter/leads/[leadId]/_components/opener-form.tsx, manual/_components/agenda-form.tsx, evaluacion-form.tsx y franja-recorrido.tsx (avisaEnSalidaInterna y useHayTrabajoSinRegistrar en los enlaces internos). · Archivos que NO se tocan: src/lib/leados/** (lógica).
- Zona: ZONA-FRANCO (los hooks de src/lib son libres; los consumidores son del setter)
- Tamaño: S · Riesgo: Medio: un flush fire-and-forget al desmontar puede escribir después de que el setter salió; probarlo en el manual. Fusiona la tarjeta de hooks con UX-053: es la misma causa (trabajo que se pierde al navegar). BUG-156 (Próximo) cubre el veredicto y va antes. · Prerrequisitos: [B-79]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Una action que lanza muestra un toast y no error.tsx (test del hook); escribir y navegar antes del debounce guarda el texto (probado en el manual); salir del opener con texto sin registrar pide confirmación; Franco lo recorrió.
- Nodo(s): h5.set-manual, lib.actions, lib.use-step-action, lib.use-autosave, lib.use-unsaved-guard, h5.set-manual.opener, h5.set-manual.agenda, h5.set-manual.recorrido-y-barra
- Worktree: wt/franco-leados
- Estado: abierta

### [B-140] Setter: lecturas acotadas en el home y el manual, y despacho del manual por registro
- Objetivo: Medir el home del setter con carteras grandes, leer el dossier con select acotado, que abrir un lead no cargue el manual dos veces y despachar las pantallas del manual con un registro tipado. · Hallazgos que cierra: [PERF-015], [PERF-014], [DEU-080]
- Archivos a tocar: src/lib/leados/ownership.ts, prospecto-import.ts y setter/page.tsx (medir primero; select acotado a los campos que leen buildHomeLeads, mis-numeros, progreso y novedades; grupo Archivo aparte); setter/leads/[leadId]/manual/page.tsx y manual/[paso]/page.tsx (índice con lectura mínima; el lead ya verificado se pasa a los helpers; Record<PantallaId, (manual) => Slots> en un módulo aparte con exhaustividad de tipos, PLAN-881). · Archivos que NO se tocan: prisma/schema.prisma; src/lib/leados/flow.ts salvo tipos.
- Zona: ZONA-FRANCO
- Tamaño: M · Riesgo: Bajo: medir antes de tocar. Suma PERF-014 desde la poda de LeadOS: es el mismo archivo y la misma causa (lecturas de más). · Prerrequisitos: [B-79]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-157: tiempo de render y filas del dossier del home medidos con la cartera más grande antes y después, registrados en el PR; abrir un lead carga el manual una sola vez (log de queries); la página del manual queda sin la escalera de ternarios ni fallback {}, con exhaustividad de tipos; test:setter pasa.
- Nodo(s): h5.set-dia, lib.leados, modelo.OsLead, modelo.OsLeadDossier, h5.set-manual, h5.set-manual.aterrizaje-y-guardia, h5.set-lead
- Worktree: wt/franco-leados
- Estado: abierta

### [B-141] Setter: accesibilidad de la cabina, del drawer y del manual
- Objetivo: Que el panel del setter y la revisión de demos se operen con teclado y con lector de pantalla. · Hallazgos que cierra: [A11Y-026], [A11Y-027], [A11Y-028], [A11Y-029], [A11Y-030], [A11Y-031], [A11Y-032], [BUG-154]
- Archivos a tocar: admin/leados/[leadId]/_components/decision-bar.tsx (diálogo con foco atrapado; role=alert); setter/_components/use-keyboard-shortcuts.ts y foco-surface.tsx (atajos que se apagan o activos solo con foco en la tarjeta); setter/_components/setter-shell.tsx (inert y Escape en el aside cerrado; aria-expanded y aria-controls); lead-card-actions.tsx (aria-label que empieza con el rótulo visible); manual/_components/chequeo-form.tsx (fila tocable); _components/evaluacion-form.tsx (radios nativos o tabindex itinerante); nuevo/nuevo-prospecto-form.tsx (role=alert); _components/copy-block.tsx (mirar el booleano de execCommand; texto seleccionable si falla). · Archivos que NO se tocan: src/components/ui/*.
- Zona: ZONA-FRANCO
- Tamaño: M · Riesgo: Bajo. Reutilizar el modal accesible que crea la tarjeta de Próximo. Suma A11Y-028 (drawer) desde la tarjeta del shell del setter. · Prerrequisitos: [B-76]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: axe no reporta violaciones en /setter, /setter/nuevo, un paso del manual ni en la revisión de demos; con el drawer cerrado el Tab no entra al rail y Escape lo cierra; los atajos se apagan desde «?»; el score se opera con flechas; con el portapapeles bloqueado «Copiar bloque» avisa; Franco lo recorrió.
- Nodo(s): h5.adm-revision-demos.cola-y-veredicto, h5.set-dia.foco-ahora, h5.set-dia.palancas-de-card, h5.set-dia.rail-navegacion, h5.set-manual.ayudas-de-paso, h5.set-manual.chequeo-final, h5.set-manual.ficha-y-veredicto, h5.set-nuevo.alta-manual
- Worktree: wt/franco-leados
- Estado: abierta

### [B-142] Setter: lienzo propio del portal y navegación clasificada
- Objetivo: Que el lienzo del setter no herede el tema claro del home y que su navegación siga una regla escrita. · Hallazgos que cierra: [DIS-003], [DEU-082]
- Archivos a tocar: setter/_components/setter-shell.tsx (lienzo con un rol propio del portal o el literal de los otros shells en vez de var(--color-void)); setter/_components/shortcuts-help.tsx:37,80; src/hooks/useThemeObserver.tsx (quitar data-theme al desmontar; archivo libre); setter/_components/setter-nav.tsx (<Link> en vez de triggerTransition si se declara portal); nuevo/nuevo-prospecto-form.tsx y nuevo/page.tsx (redirect() en cargarProspecto); foco-surface.tsx; trabajar-lead-button.tsx; src/components/layout/publicRoute.ts. · Archivos que NO se tocan: src/context/TransitionContext.tsx (solo deja de importarse); src/app/globals.css.
- Zona: ZONA-FRANCO (useThemeObserver.tsx y publicRoute.ts son libres)
- Tamaño: M · Riesgo: Medio. DIS-003 es PROBABLE: confirmarlo con VH-174 (home → login → setter sin recargar). BUG-175 (Lenis en /setter, Próximo) toca el mismo recorrido antes. Se separaron el drawer (a la tarjeta de a11y) y la higiene D4 (tarjeta propia). · Prerrequisitos: [B-90], [B-78]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: El recorrido home → /login → /setter sin recargar pinta el lienzo oscuro (visual-qa desktop+mobile); al salir del home <html> no conserva data-theme; setter-nav no usa triggerTransition, o la excepción está escrita en CLAUDE.md y en el padrón del invariante de navegación; Franco aprobó.
- Nodo(s): h5.set-dia, h5.set-dia.rail-navegacion, h5.set-nuevo, lib.ui, h5.adm-revision-demos
- Worktree: wt/franco-leados
- Estado: abierta

### [B-143] Higiene de UI del setter (D4: 97 detalles)
- Objetivo: Pasar la checklist de higiene de D4 sobre el setter y la revisión de demos, archivo por archivo. · Hallazgos que cierra: [DEU-089]
- Archivos a tocar: Los archivos de la lista de DEU-089 en 03-MEJORAS (setter/layout.tsx, setter/** y admin/leados/**): contraste (41), copy (24), inline (4), tildes (2) y otros (26), de a uno. · Archivos que NO se tocan: src/lib/leados/**; src/components/ui/*.
- Zona: ZONA-FRANCO
- Tamaño: S · Riesgo: Bajo. Va antes de migrar el setter al tema para no remapear dos veces. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Las 97 entradas de la checklist de DEU-089 están tachadas o anotadas; los 41 casos de contraste dan ≥ 4,5:1 medido; Franco lo recorrió.
- Nodo(s): h5.set-dia, h5.set-manual, h5.adm-revision-demos, h4.adm-leads
- Worktree: wt/franco-leados
- Estado: abierta

### [B-144] Motor de WhatsApp: decidir si es producto y dejar correcta la salida (estados, idempotencia y cierre)
- Objetivo: Que Valentino decida si el motor de WhatsApp es producto y, si lo es, dejar correcta la salida y la salud del motor antes de cablearlo: sin duplicados, sin estados pisados y sin conversaciones abiertas para siempre. · Hallazgos que cierra: [BUG-027], [BUG-103], [BUG-104], [BUG-105], [BUG-106], [BUG-107], [DEU-052], [DEU-053], [POD-341], [POD-069]
- Archivos a tocar: Paso 0: decisión de alcance escrita en DECISIONES (si no es producto, esta tarjeta y la de cableado se archivan). src/modules/motor/adapters/whatsapp/inbound/handle-status.ts (updateMany condicional por rango de estado); handle-health.ts (dedupe por severidad y templateId; REINSTATED y DISABLED mapeados; unmapped-event en warn); process.ts y handle-request.ts; handle-message.ts (política de cierre al reutilizar una conversación); outbound/client.ts (sin reintento tras timeout; presupuesto ≤ maxDuration); services/sendMessage.ts (wamid antes del despacho; idempotencia que mira FAILED y PENDING vencido; canal no enviable frena el envío); domain/identity.ts (no grabar unknown-identity si la transición existe); domain/prisma-errors.ts reemplazado por isUniqueViolation de src/lib/isolation/scoped-model.ts. · Archivos que NO se tocan: src/lib/isolation/registry.ts salvo el export; prisma/schema.prisma.
- Zona: libre (decisión de Valentino sobre el alcance del motor)
- Tamaño: L · Riesgo: Medio: sin tráfico real todo se valida con tests y el sandbox de 360dialog. La decisión se movió acá desde la tarjeta de cableado para que la salida quede correcta antes de recibir mensajes reales. · Prerrequisitos: [B-33]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: La decisión de alcance queda escrita. Tests del motor: un 'sent' tardío no pisa un 'read'; reintentar con la misma clave tras un 5xx agotado re-despacha o devuelve 'previously_failed'; un timeout no produce dos envíos; restringido → baneado crea alerta nueva; REINSTATED vuelve a APPROVED; reprocesar un batch no crea transiciones falsas; una conversación inactiva > 24 h se cierra; el grep del isUniqueViolation propio da 0; test:integration motor-isolation pasa.
- Nodo(s): h3.vis-whatsapp, modelo.MotorMessage, modelo.WabaChannel, h3.vis-whatsapp.salud-canal, modelo.MotorAlert, h3.vis-whatsapp.envio-mensajes, modelo.MotorTemplate, lib.isolation, h3.vis-whatsapp.identidad-bsuid, modelo.ContactIdentityTransition, modelo.MotorConversation
- Worktree: wt/motor
- Estado: abierta

### [B-145] Motor de WhatsApp: cablear entrada, alertas, identidad y errores (si se decidió producto)
- Objetivo: Si el motor es producto: que responda los mensajes entrantes, permita dar de alta canales, haga llegar las alertas de salud, no confunda identidades por teléfono reciclado y reporte sus errores. · Hallazgos que cierra: [FAL-021], [BUG-102], [FAL-022], [DEU-051]
- Archivos a tocar: src/app/api/motor/webhook/[channelToken]/route.ts (captureException con flush); src/modules/motor/adapters/whatsapp/inbound/handle-message.ts (consumidor de los IN con org derivada del canal autenticado) y handle-health.ts (alertas CRITICAL y HIGH por email o Telegram y visibles en /admin/chatbot/health); services/sendMessage.ts (llamador real; rechazo tipado con canal BANNED; logger real por default dentro del motor); domain/identity.ts (legacy solo si externalId no es BSUID) y el caso nuevo en tests/integration/motor-inbound.spec.ts; alta y rotación de canal (script o pantalla admin, S6-08). · Archivos que NO se tocan: prisma/schema.prisma; src/lib/logger.ts (protegido: se cablea en el motor); src/lib/alerts.ts (solo consumir).
- Zona: libre
- Tamaño: L · Riesgo: Alto: mensajes reales de WhatsApp a terceros y plantillas de Meta; probar con un número de prueba. · Prerrequisitos: [B-144], [B-33]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Con un número de prueba: un mensaje entrante genera respuesta; un canal se da de alta y rota; una alerta de número baneado llega por email o Telegram (VH-091); el caso BSUID con teléfono reciclado pasa; un error del webhook aparece en Sentry.
- Nodo(s): h3.vis-whatsapp, h3.vis-whatsapp.respuesta-automatica, h3.vis-whatsapp.alta-canal, modelo.MotorMessage, modelo.WabaChannel, h3.vis-whatsapp.identidad-bsuid, modelo.ContactIdentity, modelo.MotorConversation, h3.vis-whatsapp.salud-canal, modelo.MotorAlert, h3.adm-health, int.sentry, lib.logger
- Worktree: wt/motor
- Estado: abierta

### [B-146] Hooks y embed del chatbot: currentPath vivo, sessionId por bot, byte NUL y reglas del React Compiler
- Objetivo: Que el bot sepa en qué página está el visitante, que dos bots en el mismo origen no choquen y que los archivos del embed pasen el lint. · Hallazgos que cierra: [BUG-072], [BUG-018], [DEU-044], [DEU-047]
- Archivos a tocar: src/modules/chatbot/hooks/useChatbot.ts (currentPath de un ref en prepareSendMessagesRequest; sessionId con clave por slug); server/conversation/resolver.ts; components/chat/revealSafeMarkdown.ts (byte literal por '\u0000'); tooltip/useTooltipTriggers.ts y tooltip/ProactiveTooltip.tsx; embed/ChatbotEmbed.tsx (useCallback; sin setState en un effect). · Archivos que NO se tocan: prisma/schema.prisma (el unique (botConfigId, sessionId) va en la migración agrupada).
- Zona: libre
- Tamaño: S · Riesgo: Bajo: cambiar la clave del sessionId corta una vez la conversación en curso. BUG-087 (embed manda '/', Próximo) va antes sobre el mismo handshake. · Prerrequisitos: [B-36]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Después de navegar en el sitio de develOP el prompt recibe la ruta nueva (log del request); dos bots bajo el mismo origen no dan P2002; git diff --stat muestra revealSafeMarkdown.ts como texto; el eslint de esos 3 archivos no da errores del React Compiler.
- Nodo(s): h3.vis-widget-develop, lib.chatbot.hooks, modelo.Conversation, h3.vis-widget-cliente, h3.vis-api-chatbot, lib.chatbot, h3.vis-widget-develop.tooltip-proactivo, h3.vis-widget-cliente.chat-embebido
- Worktree: wt/widget
- Estado: abierta

### [B-147] Leads del chatbot en el portal: intención legible, DQ sin perder NULL, copiar y exportar honestos
- Objetivo: Que la sección de contactos de Mi Chatbot muestre datos legibles y completos y no anuncie éxitos que no ocurrieron. · Hallazgos que cierra: [UX-028], [BUG-101], [UX-030], [A11Y-018], [DEU-037], [POD-317]
- Archivos a tocar: src/modules/chatbot/components/dashboard/ChatbotOverview.tsx, dashboards/ConversationsTable.tsx y LeadsTable.tsx (la etiqueta de intención compartida que deja [B-42] y las keys del enum real); server/scoring/dqFilter.ts (classification null o distinta de dq); installation/SnippetCopyBlock.tsx y dashboard/ExportLeadsButton.tsx (await con catch; export con chequeo de status); ClientLeadsTable.tsx, LeadDetail.tsx y tooltip/ProactiveTooltip.tsx (aria-pressed, htmlFor, button, aria-current, role=alert); lead-intent-labels.ts (Object.hasOwn o Map); lead-detail-presentation.ts y server/tools/captureLead.ts (escribir channel o quitar la fila Canal). · Archivos que NO se tocan: prisma/schema.prisma.
- Zona: libre
- Tamaño: M · Riesgo: Bajo. BUG-071 (mismo vocabulario de intención en el CSV) y BUG-084/085 (misma pantalla) van antes en Próximo. · Prerrequisitos: [B-42], [B-62]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Ninguna pantalla del cliente muestra PURCHASE_READY y usa el mismo vocabulario que el CSV; los leads con classification NULL entran en el conteo (invariante del filtro); con el portapapeles bloqueado «Copiar» muestra error; los chips anuncian su estado; la fila Canal muestra un dato o no aparece.
- Nodo(s): h3.cli-chatbot.resumen, h3.cli-chatbot.conversaciones, h3.adm-chatbots.leads-del-bot, lib.chatbot.scoring, modelo.ChatbotLead, h3.cli-chatbot.instalacion, h3.cli-chatbot.exportar-csv, h3.cli-chatbot.contactos-lista, h3.cli-chatbot.contacto-detalle, lib.chatbot.leads
- Worktree: wt/chatbot
- Estado: abierta

### [B-148] Editor y detalle del bot (admin): ids estables, labels asociados, CRM que prueba lo editado y diálogos accesibles
- Objetivo: Que el editor y el alta del bot no marquen cambios fantasma, tengan labels asociados y errores anunciados, prueben lo que se edita y no tengan ciclos de tipos. · Hallazgos que cierra: [BUG-079], [DEU-041], [DEU-040], [UX-024], [UX-019], [BUG-095], [A11Y-009], [A11Y-011], [A11Y-010], [POD-319], [POD-320]
- Archivos a tocar: src/modules/chatbot/components/admin/BotConfigEditor.tsx y config/BotConfigDiffModal.tsx (normalizar una vez; contador; FIELD_LABELS completo; 'generico'; sin el onSave muerto); server/dashboard/updateBotAppearance.ts (preserva ids); config/Field.tsx, Input.tsx y ColorPicker.tsx reemplazados por src/components/ui/Field.tsx del kit (role=alert y aria-live en errores); onboarding/Step1Company.tsx y Step5Review.tsx; onboarding/kb-templates/index.ts, concesionaria.ts y admin/chatbots/[botId]/tabs/ConfigTab.tsx (tipos a types.ts para cortar el ciclo); integrations/CrmConfigForm.tsx y server/admin/integrations/testCrmConnection.ts (prueban la URL editada); server/crm/validateWebhookUrl.ts (prefijos IPv6 solo si el host tiene ':'); admin/chatbots/[botId]/BotDetailClient.tsx (curl con NEXT_PUBLIC_APP_URL; tablist); tabs/OverviewTab.tsx; activation/ActivationModal.tsx, kb/SaveConfirmModal.tsx, kb/TestPromptSandbox.tsx, config/tabs/BehaviorTab.tsx y AdvancedTab.tsx (diálogos accesibles; aria-label). · Archivos que NO se tocan: src/components/ui/Field.tsx y Modal.tsx (protegidos: solo usar); .dependency-cruiser.cjs salvo quitar la excepción del ciclo; el contraste de ActivityLog, Step2BotIdentity y ColorPicker (A11Y-012, pasó a la tarjeta de contraste).
- Zona: libre
- Tamaño: M · Riesgo: Bajo. Suma A11Y-010 (antes en una tarjeta mezclada con el kanban de leads): mismo editor y mismos Field/Input que POD-319/320. SEC-072 (SSRF del CRM) y UX-021 (Zod crudo en el editor) van antes en Próximo. · Prerrequisitos: [B-34], [B-58]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Abrir un bot con respuestas rápidas sin id no marca «cambios sin guardar»; depcruise no encuentra ciclos de tipos en kb-templates ni en el detalle; «Probar conexión» usa la URL del formulario; se acepta un webhook a fc.example.com; axe no reporta violaciones de label ni de nombre en el editor, el alta y los modales; los archivos config/Field.tsx e Input.tsx ya no existen.
- Nodo(s): h3.adm-chatbots.editar-config-bot, h3.cli-chatbot, h4.adm-clientes.plantilla-kb-industria, h3.adm-chatbots, h3.adm-chatbots.integracion-crm, int.n8n, lib.chatbot.crm, h3.adm-health, h3.adm-chatbots.activar-bot-preflight, h3.adm-chatbots.editar-kb, h3.adm-chatbots.probar-prompt, h4.adm-clientes.alta-cliente-con-bot, lib.ui
- Worktree: wt/chatbot-admin
- Estado: abierta

### [B-149] Un solo ChatShell para los tres paneles de chat, accesible por teclado
- Objetivo: Extraer un ChatShell común para el widget de develOP, el embed del cliente y la vista previa del admin, operable por teclado, con nombres accesibles, anuncio correcto para lectores y navegación sin recargar. · Hallazgos que cierra: [DEU-042], [A11Y-013], [A11Y-014], [A11Y-008], [A11Y-015], [BUG-068]
- Archivos a tocar: src/modules/chatbot/components/chat/ChatWindow.tsx, embed/ChatbotEmbed.tsx y preview/BotConfigPreview.tsx (ChatShell común parametrizado por config, estilos a clases y tokens; textarea con label, «Enviar mensaje», textos ≥ 4,5:1); LogicCompanion.tsx y tooltip/ProactiveTooltip.tsx (launcher como button, Escape, aria-modal, trampa y retorno de foco); public/widget.js (foco al abrir, burbuja fuera del Tab con el panel abierto, Escape); chat/StreamingMarkdown.tsx (aria-busy en el revelado y anuncio único en onTypingDone); hooks/useChatbot.ts y tool-cards/renderToolCall.tsx (navegar con triggerTransition en el sitio público manteniendo el widget; VALID_PATHS espejado). · Archivos que NO se tocan: src/context/TransitionContext.tsx (protegido: solo usar); los avatares 3D (otra tarjeta).
- Zona: libre
- Tamaño: L · Riesgo: Alto: tres superficies de chat a la vez; detrás de una bandera y con visual-qa desktop y mobile. Suma A11Y-008 y A11Y-015 (misma causa: panel no accesible) desde la tarjeta de copy del widget. Va después de los arreglos de seguridad del embed para no refactorizar dos veces. · Prerrequisitos: [B-52], [B-37], [B-99]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-079, VH-082 y VH-094: en los dos widgets el launcher abre con Enter o Espacio, Escape cierra y devuelve el foco y el lector anuncia el mensaje completo una sola vez y «Escribí tu consulta» / «Enviar mensaje»; ir a una sección desde el chat no recarga ni pierde la charla; los tres paneles usan el mismo ChatShell sin estilos inline; visual-qa desktop+mobile sin ❌.
- Nodo(s): h3.vis-widget-develop, h3.vis-widget-cliente, h3.vis-widget-cliente.conversar, h3.adm-chatbots, lib.chatbot, lib.chatbot.hooks
- Worktree: wt/widget
- Estado: abierta

### [B-150] Widget: saludo en vos, aviso de degradado honesto y launcher que no tapa en mobile
- Objetivo: Que el widget hable como develOP, no prometa WhatsApp sin número y no tape el sitio del cliente en mobile. · Hallazgos que cierra: [UX-018], [UX-026], [UX-020]
- Archivos a tocar: tool-cards/WhatsappHandoffCard.tsx y preview/BotConfigPreview.tsx (saludo en vos); components/chat/DegradedBanner.tsx y hooks/useChatbot.ts (título según haya número; copy por defecto si el mensaje viene vacío); shared/zIndex.ts y LogicCompanion.tsx (rango documentado; launcher más chico u oculto por debajo de cierto ancho). · Archivos que NO se tocan: src/modules/chatbot/components/avatar/*; la accesibilidad del panel (va con el ChatShell).
- Zona: libre
- Tamaño: S · Riesgo: Bajo. A11Y-008 y A11Y-015 pasaron al ChatShell. La relación con la escala global de capas la documenta [B-159]. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: El saludo del widget de develOP no dice «asistirle»; sin número de WhatsApp la tarjeta de degradado no promete WhatsApp y tiene un CTA; a 390 px el launcher no tapa el CTA del sitio (visual-qa).
- Nodo(s): h3.vis-widget-cliente, h3.vis-widget-develop
- Worktree: wt/widget
- Estado: abierta

### [B-151] Canvas 3D según la regla: dpr 1.5, pausa fuera de viewport y sin WebGL no montar
- Objetivo: Que los avatares 3D y el fondo DotMatrix sigan la regla del repo: dpr [1,1.5], pausa fuera de viewport o con la pestaña oculta, frame estático con reducir movimiento y nada sin WebGL. · Hallazgos que cierra: [PERF-009], [PERF-018]
- Archivos a tocar: src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx, NeuroAvatar.tsx, ParticleSphere.tsx (dpr [1,1.5]; frameloop 'demand' o IntersectionObserver y visibilitychange; Vector3 reutilizado y rotación por delta) y AvatarPicker.tsx (thumbnail estático; canvas solo en hover o selección); src/components/canvas/DotMatrix.tsx (dpr [1,1.5], esferas de 6-8 segmentos, pausa, frame estático con reduce, sin Canvas sin WebGL). · Archivos que NO se tocan: src/components/3d/HeroArtifact.tsx (FROZEN); avatar/CoreHalo.tsx (patrón de referencia); sin EffectComposer sobre canvas transparente.
- Zona: libre
- Tamaño: M · Riesgo: Medio: cambios de render visibles; comparar capturas. BUG-081 (boundary de WebGL, Próximo) toca los mismos avatares antes. · Prerrequisitos: [B-53]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: VH-083 y VH-098: con los avatares fuera de viewport no se renderizan frames (performance trace); git grep de dpr con tope mayor a 1.5 da 0; con 'reducir movimiento' DotMatrix queda estático; visual-qa desktop+mobile de login y del widget sin ❌.
- Nodo(s): h3.adm-chatbots, h3.cli-chatbot, h3.vis-widget-cliente, lib.chatbot, h3.adm-chatbots.editar-config-bot, h4.adm-clientes.alta-cliente-con-bot, h3.vis-widget-develop, h1.auth-login, h1.auth-recupero, h1.auth-invite
- Worktree: wt/canvas-3d
- Estado: abierta

### [B-152] Avatares del widget: fallback liviano, estado por instancia y LegacyNeuroAvatar limpio
- Objetivo: Que un avatar mal configurado no descargue three ni R3F, que dos instancias no compartan estado y que LegacyNeuroAvatar pase el lint sin any. · Hallazgos que cierra: [BUG-082], [BUG-083], [DEU-043], [DEU-045]
- Archivos a tocar: src/modules/chatbot/components/avatar/AvatarRenderer.tsx y registry.ts (style image o emoji incompleto → monograma); LegacyNeuroAvatar.tsx (refs por instancia; color del accent real; BufferAttribute tipado sin any; random en useState lazy; comentarios en UTF-8); legacyStateMapper.ts; avatarStyleSchema.ts (un schema con los ids en una constante pura, sin importar componentes cliente). · Archivos que NO se tocan: src/components/3d/HeroArtifact.tsx; CoreHalo.tsx; sin EffectComposer sobre canvas transparente.
- Zona: libre (confirmar con Valentino que LegacyNeuroAvatar no está protegido)
- Tamaño: M · Riesgo: Medio, por ser 3D: hoy dos widgets en la misma página comparten el mouse. Mismo archivo que la tarjeta de canvas: mismo worktree. · Prerrequisitos: [B-53]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: Un bot con style=image y sin URL no descarga three ni R3F (network); dos instancias con accents distintos pintan cada una su color; eslint sobre LegacyNeuroAvatar.tsx sin errores ni any; el archivo sin mojibake; la validación server de avatarStyle no importa el registry cliente (depcruise); visual-qa del widget.
- Nodo(s): h3.vis-widget-cliente, h3.vis-widget-develop, lib.chatbot, h3.cli-chatbot, h3.adm-chatbots
- Worktree: wt/canvas-3d
- Estado: abierta

### [B-153] Contraste AA en el texto funcional del portal, Mi Chatbot y el admin de chatbots
- Objetivo: Que el texto con información del portal, de Mi Chatbot y del admin de chatbots llegue a 4,5:1 sobre el fondo oscuro. · Hallazgos que cierra: [A11Y-002], [A11Y-017], [A11Y-012]
- Archivos a tocar: dashboard/soporte/[ticketId]/page.tsx, services/page.tsx, components/dashboard/PremiumModuleCard.tsx, tienda-conectada/_components/ConnectStoreCard.tsx, email-marketing/campaigns/page.tsx, cuenta e inicio; chatbot/components/dashboard/LeadDetail.tsx, ChatbotOverview.tsx, BusinessLeadCard.tsx y dashboards/LeadsTable.tsx; chatbot/components/admin/ActivityLog.tsx, onboarding/Step2BotIdentity.tsx y BotConfigEditor.tsx:144 (text-zinc-500/600/700 → zinc-400 o el token de texto secundario; mínimo 11-12 px). · Archivos que NO se tocan: src/components/ui/* (protegido); src/lib/design-tokens.ts; ColorPicker.tsx (lo reemplaza la tarjeta del editor).
- Zona: libre
- Tamaño: S · Riesgo: Bajo. Suma A11Y-012 (misma causa) desde la tarjeta del editor del bot. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: git grep de text-zinc-600 y text-zinc-700 en texto funcional de esos archivos da 0; la medición de contraste de las pantallas citadas da ≥ 4,5:1.
- Nodo(s): h2.cli-soporte.conversacion-ticket, h2.cli-servicios.servicios-contratados, h2.cli-servicios.vitrina-modulos, h2.cli-tienda, h2.cli-email-mkt, h2.cli-cuenta.boveda, h2.cli-inicio, h2.cli-shell, h3.cli-chatbot.contacto-detalle, h3.cli-chatbot.resumen, h3.cli-chatbot.contactos-lista, h3.adm-actividad.stream-eventos, h4.adm-clientes.alta-cliente-con-bot, lib.ui
- Worktree: wt/portal-cliente
- Estado: abierta

### [B-154] Portal: accesibilidad de formularios, notificaciones y navegación
- Objetivo: Que el portal del cliente anuncie sus errores, se opere con teclado y tenga sus PDF en contraste AA. · Hallazgos que cierra: [A11Y-004], [A11Y-005], [A11Y-006], [A11Y-007], [DEU-029]
- Archivos a tocar: components/dashboard/NotificationCenter.tsx y NotificationHistoryModal.tsx (filas como <button>); FormFeedback compartido (role=alert y role=status) en ProfileForms.tsx, ClientChatComposer.tsx, ReferralPanel.tsx, VaultRequestModal.tsx, email-marketing/campaigns/new/page.tsx, módulos y bienvenida; ProjectTaskTabs.tsx (descripción expandible); DashboardLayoutClient.tsx (inert en el aside cerrado); SidebarNav.tsx (aria-current); ProfileForms.tsx (toggles de contraseña dentro del Tab); src/lib/reports/client-monthly/ClientMonthlyReportPdf.tsx (zinc-600 y cian #0e7490); etiquetas de ticket, hook de posición de popover y la consulta Prisma de OnboardingStatusCard llevados a lib. · Archivos que NO se tocan: src/components/ui/*; NewTicketModal.tsx (lo migra [B-76]); src/lib/reports/MonthlyReport.tsx (lo borra la poda del portal).
- Zona: libre
- Tamaño: M · Riesgo: Bajo. A11Y-003 (Próximo) migra el modal de ticket antes. DEU-029 es la única tarjeta que mueve la consulta de OnboardingStatusCard (se sacó de IDEA-012). · Prerrequisitos: [B-76]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: La campana se opera con Tab y Enter; axe no reporta violaciones de aria en esas pantallas; con el drawer mobile cerrado el foco no entra al aside; el link activo tiene aria-current; el PDF mensual da ≥ 4,5:1 medido; PRIORITY_MAP, CATEGORY_MAP y calcPosition tienen una sola definición; OnboardingStatusCard no importa prisma.
- Nodo(s): h2.cli-shell.campana-notificaciones, h2.cli-cuenta, h2.cli-soporte, h2.cli-mensajes, h2.cli-proyecto.tareas-por-estado, h2.cli-shell.navegacion-sidebar, h2.cli-cuenta.cambiar-password, h2.cli-resultados.informe-mensual-pdf, h2.cli-reportes-email, h2.cli-inicio.estado-onboarding, h2.cli-shell
- Worktree: wt/portal-cliente
- Estado: abierta

### [B-155] Shell del admin: topbar en español, menú mobile usable, diálogos accesibles y loading propios
- Objetivo: Que el armazón del admin se lea en español, se opere con teclado y muestre la carga correcta en cada sección. · Hallazgos que cierra: [UX-034], [UX-035], [A11Y-019], [A11Y-020], [A11Y-021], [UX-039], [TEC-005], [POD-355]
- Archivos a tocar: admin/_components/admin-topbar.tsx (mapa completo; IDs detectados por formato cuid; aria-label; sin h1 duplicado); AdminLayoutClient.tsx y admin-sidebar.tsx (hamburguesa oculta con el drawer abierto; Escape, foco y aria-expanded); confirm-dialog.tsx, type-to-confirm-dialog.tsx, inline-confirm.tsx, leads/_components/lead-form.tsx y projects/_components/overlay-modal.tsx sobre el modal accesible compartido; AdminBreadcrumbs.tsx (nav con aria-label); announcement-publisher.tsx, AuditLogClient.tsx, BillingOverrideForm.tsx, InternalNotesCard.tsx y message-input.tsx (labels asociados; role=alert); loading.tsx en announcements, referrals y fg2-lab; admin/layout.tsx (sin el noStore redundante). · Archivos que NO se tocan: src/components/ui/Callout.tsx y Modal.tsx; admin/leados/** y fg2-lab/_components (ZONA-FRANCO: solo el loading.tsx de la ruta, con aviso).
- Zona: libre (el `loading.tsx` de `admin/fg2-lab` es ZONA-FRANCO: con aviso a Franco)
- Tamaño: M · Riesgo: Bajo. Reutiliza el modal de Próximo en vez de crear otro hook. DIS-002 (shells con roles) vuelve a tocar AdminLayoutClient después. · Prerrequisitos: [B-76]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: /admin/announcements se titula «Novedades» y ninguna sección sale en inglés; en mobile el drawer cierra con Escape y el logo se ve; los diálogos destructivos atrapan el foco y lo devuelven; cada página tiene un solo h1; axe sin violaciones de label en esos formularios; /admin/referrals muestra su propio skeleton.
- Nodo(s): h4.adm-shell, h4.adm-shell.navegacion, h4.adm-novedades, h4.adm-shell.confirmaciones, h4.adm-leads.alta-edicion, h4.adm-novedades.publicar, h4.adm-audit.listado-y-filtros, lib.ui, h4.adm-referidos, h4.adm-shell.acceso-y-layout
- Worktree: wt/admin
- Estado: abierta

### [B-156] Páginas de auth: AuthShell compartido y login partido
- Objetivo: Un solo fondo y armazón para las pantallas de auth y una página de login por debajo de 300 líneas, sin estilos inline. · Hallazgos que cierra: [DEU-004]
- Archivos a tocar: AuthShell nuevo (src/components/auth/AuthShell.tsx) con el fondo; src/app/login/page.tsx (de 511 líneas a LoginForm y MagicLinkForm en archivos propios, sin estilos inline); src/app/forgot-password/page.tsx; src/app/reset-password/page.tsx; src/app/accept-invite/InviteBackground.tsx. · Archivos que NO se tocan: src/auth.ts; src/components/canvas/DotMatrix.tsx (tarjeta de canvas); next.config.ts (SEC-027 pasó a la tarjeta de cabeceras).
- Zona: libre
- Tamaño: M · Riesgo: Bajo. A11Y-001 (Próximo) y PERF-018 tocan las mismas páginas: van antes. SEC-027 se separó: es otra causa y otro archivo. · Prerrequisitos: [B-77], [B-151]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Las 4 páginas usan AuthShell y el fondo se define una vez; login/page.tsx baja de 300 líneas y no tiene style={{}}; visual-qa desktop+mobile de las 4 no muestra cambios visibles.
- Nodo(s): h1.auth-login, h1.auth-recupero, h1.auth-invite, h1.auth-cambio
- Worktree: wt/auth-borde
- Estado: abierta

### [B-157] Fronteras de error y 404 por superficie: embed, admin y dashboard con su vuelta
- Objetivo: Que cada superficie tenga su página de error y su 404 con la vuelta a su inicio, y que la 404 respete el movimiento reducido. · Hallazgos que cierra: [UX-057], [UX-058], [A11Y-034], [POD-344]
- Archivos a tocar: src/app/embed/[slug]/not-found.tsx y error.tsx nuevos (silenciosos, avisan al widget); not-found.tsx nuevos en (protected)/dashboard y (protected)/admin con vuelta al panel; src/components/ui/SectionErrorBoundary.tsx (prop homeHref con default '/dashboard'; <Link>); admin/_components/AdminErrorBoundary.tsx (homeHref '/admin'; los error.tsx del admin apuntan a él); src/app/not-found.tsx (frame estático con reducir movimiento; pausa con visibilitychange o IntersectionObserver). · Archivos que NO se tocan: src/app/(protected)/setter/error.tsx (Franco).
- Zona: requiere decisión FROZEN (SectionErrorBoundary está en ui/*)
- Tamaño: S · Riesgo: Bajo: cambio de API aditivo con default idéntico. · Prerrequisitos: [B-89]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: /embed/inexistente ya no muestra la 404 de marketing; un notFound() en /admin/clients/x ofrece volver a /admin; el error de una sección del admin vuelve a /admin; con movimiento reducido la 404 no anima y en una pestaña oculta no consume CPU (performance trace).
- Nodo(s): h3.vis-widget-cliente, h2.cli-shell, h4.adm-shell, lib.ui, lib.proxy, lib.use-reduced-motion
- Worktree: wt/kit-ui
- Estado: abierta

### [B-158] Kit ui/* protegido: estados accesibles, StatCard es-AR, un solo EmptyState y huérfanos fuera
- Objetivo: Arreglar dentro del kit, ya con su gate, lo que solo se arregla editándolo: estados que se anuncian, locale, duplicados y huérfanos. · Hallazgos que cierra: [A11Y-039], [BUG-185], [DEU-107], [DEU-102], [POD-045], [POD-381], [POD-382], [POD-326]
- Archivos a tocar: src/components/ui/LoadingState.tsx, Spinner.tsx y skeletons/* (role=status, aria-live, texto sr-only); Tabs.tsx (aria-current en modo nav; tablist en modo value); Input.tsx y hermanos (aria-invalid); StatCard.tsx ('es-AR'); EmptyState.tsx y EmptyStateMuted.tsx (una primitiva a partir de ResultEmptyState); LogoStrokeOverlay.tsx, IntroLockupText.tsx y buttons/MagneticCta.tsx (useIsClient y cn de lib); src/lib/use-is-client.ts; src/modules/chatbot/components/admin/useIsClient.ts (repuntar sus 4 imports); borrar ui/HeroTitle.tsx, ui/ErrorState.tsx y ui/HyperText.tsx. · Archivos que NO se tocan: src/components/ui/index.ts salvo exports aditivos; Button, Card y Modal (kit semántico y A11Y-037); los componentes del intro y del home clásico.
- Zona: requiere decisión FROZEN + revisión de Franco (consumidores en el setter, `11-CONGELADOS.md`)
- Tamaño: M · Riesgo: Alto por alcance: el kit tiene 344 dependientes, 53 en la zona de Franco. A11Y-037 (Modal, Próximo) toca el mismo kit antes. · Prerrequisitos: [B-89]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Commit aparte con prefijo ui/ y cambios de API aditivos con default idéntico; tsc, el lint de los tocados y check:invariants en verde; visual-qa desktop+mobile de una pantalla por dominio consumidor (admin, portal, setter, admin de chatbots); LoadingState anuncia «Cargando»; un Input inválido expone aria-invalid; el grep de los 3 huérfanos da 0.
- Nodo(s): lib.ui, lib.use-is-client, lib.componentes-dashboard, h2.cli-agenda, h2.cli-tienda, h2.cli-resultados, h2.cli-cuenta
- Worktree: wt/kit-ui
- Estado: abierta

### [B-159] Una sola fuente de acentos y de z-index: design-tokens reemplazado
- Objetivo: Que los colores por servicio y la escala de capas tengan una sola fuente, verificada por invariantes, antes de construir la capa de tema del portal. · Hallazgos que cierra: [DEU-100], [DEU-101], [DEU-110], [DEU-111], [DIS-008], [UX-031], [POD-383], [POD-068]
- Archivos a tocar: src/lib/design-tokens.ts (zIndex a src/lib/z-index.ts con un tier 'popover' por encima de modal; colors.service y el resto se borran); sus consumidores (ui/Modal.tsx, setter-shell.tsx, DashboardLayoutClient.tsx); ui/Select.tsx y los ~10 popovers con zIndex 210 literal; chatbot/shared/zIndex.ts (relación documentada); src/lib/chromeReveal.ts (comentario); logic-core-v3/AGENTS.md:54-58; chatbot/prisma/seed.ts:222-226 (routeColorMap con la paleta de CLAUDE.md, WhatsApp sin fallback ficticio, verticalPack 'agencia'); globals.css:56-58 (comentario de GATE 1); tests/e2e/22-visual-regression.spec.ts (sale /admin/_design); invariantes check:invariant:acentos-servicio y check:invariant:z-index. · Archivos que NO se tocan: src/components/design-system/accent.ts; los valores de globals.css:60-63; la rama rediseno/home.
- Zona: requiere decisión FROZEN (design-tokens y Select; setter-shell es ZONA-FRANCO: aviso)
- Tamaño: M · Riesgo: Bajo-medio: un tier mal puesto cambia el orden de capas (Select dentro de Modal). El seed del bot se vuelve a correr con el guard de destino. · Prerrequisitos: [B-89]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: check:invariant:acentos-servicio confirma los 4 hex de CLAUDE.md en globals.css, DESIGN.md y el módulo de tokens; check:invariant:z-index fija appShell < … < modal < popover y toast; el grep de zIndex 210 y z-[210] da 0; un Select dentro de un Modal queda encima (visual-qa); ni AGENTS.md ni el seed conservan la permutación equivocada.
- Nodo(s): lib.design-tokens, lib.ui, lib.chromereveal, h5.set-dia, h3.vis-widget-develop, h3.vis-widget-develop.contenido-bot-develop, modelo.BotConfig, lib.tests, lib.sitio-publico
- Worktree: wt/diseno-portal
- Estado: abierta

### [B-160] Movimiento reducido correcto desde el primer render y una sola política en portales y widget
- Objetivo: Que quien pidió menos movimiento no vea animaciones desde el primer cuadro, en el admin, en el portal ni en el widget. · Hallazgos que cierra: [A11Y-040], [DIS-007], [DEU-057], [UX-014], [A11Y-016], [POD-345]
- Archivos a tocar: src/lib/use-reduced-motion.ts (useSyncExternalStore con snapshot de servidor; mismo nombre exportado); admin/_components/PageTransition.tsx y components/dashboard/PageTransition.tsx (pasan a template.tsx con árbol estable); admin/layout.tsx y DashboardLayoutClient.tsx (MotionConfig reducedMotion="user"); AnimatedCounter.tsx, AnimatedProgressBar.tsx y AnalyticsMetricCard.tsx (es-AR; valor final en SSR; pausa con IntersectionObserver); chatbot/components/avatar/AvatarRenderer.tsx, PulseAvatar.tsx, MonogramAvatar.tsx y chat/ChatWindow.tsx (los puntos de «pensando»). · Archivos que NO se tocan: src/components/ui/EmptyState.tsx; la coreografía de scroll de v3; el setter.
- Zona: requiere decisión FROZEN (use-reduced-motion: reemplazar)
- Tamaño: M · Riesgo: Medio. v3 importa el hook por su nombre: la firma no cambia. Remontar desde template.tsx reinicia el estado de formularios abiertos. · Prerrequisitos: [B-89]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: Con prefers-reduced-motion: reduce emulado, ni los PageTransition ni los contadores ni los avatares animan desde el primer cuadro (grabación o visual-qa); sin el ajuste, el PageTransition anima en cada navegación del admin y del portal; los contadores salen en es-AR; tsc y check:invariants en verde.
- Nodo(s): lib.use-reduced-motion, h4.adm-shell, h4.adm-shell.acceso-y-layout, lib.componentes-dashboard, h2.cli-resultados.trafico, h2.cli-proyecto.tareas-por-estado, h3.vis-widget-develop, h3.vis-widget-cliente, lib.chatbot
- Worktree: wt/diseno-portal
- Estado: abierta

### [B-161] TransitionContext protegido: el hash abre el shutter cuando pintó el destino y el destino declara su alineación
- Objetivo: Que la navegación con hash no abra el shutter antes de tiempo y que el contexto no dependa de ids de sección fijos. · Hallazgos que cierra: [BUG-189], [DEU-108]
- Archivos a tocar: src/context/TransitionContext.tsx (la rama de hash usa startTransition más pendingRouteReveal; scroll al ancla cuando cae isPending; isManualTransition se borra; alineación leída de un data-atributo o de scroll-margin); src/components/layout/Navbar.tsx y DynamicDock.tsx; src/components/sections/nosotros/Nosotros.tsx, o la sección que lleve el atributo. · Archivos que NO se tocan: src/components/3d/HeroArtifact.tsx; src/context/PreloaderContext.tsx; src/app/(protected)/** (el invariante de navegación pasó a [B-119]).
- Zona: requiere decisión FROZEN (aviso a Franco: `setter-nav.tsx:43` usa triggerTransition)
- Tamaño: M · Riesgo: Medio: envuelve todas las rutas públicas y no tiene test. Los ids 'servicios' y 'caracteristicas' cambian con rediseno/home (bead847c). · Prerrequisitos: [B-89]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: visual-qa desktop+mobile de / → /contact, de /web-development → /#servicios (el shutter no abre antes de que pinte el destino) y de back/forward, más /admin y /dashboard sin shutter; el grep de 'servicios' y 'caracteristicas' en TransitionContext da 0. La navegación del setter (destinos y drawer de setter-nav) no tiene regresiones en desktop ni en mobile [F7 B16]
- Nodo(s): lib.context, lib.sitio-publico, rama.rediseno-home
- Worktree: wt/protegidos
- Estado: abierta

### [B-162] Plataforma: configs tipadas, dependencias reales, Sentry sin duplicados y recursos propios
- Objetivo: Que la configuración de plataforma diga la verdad: config tipada, dependencias declaradas, una sola inicialización de Sentry, sin recursos de terceros y con una versión que identifique el deploy. · Hallazgos que cierra: [DEU-091], [DEU-092], [DEU-093], [DEU-094], [DEU-095], [BUG-172], [BUG-173], [PERF-017], [SEC-042], [POD-084], [POD-360], [POD-361], [POD-362], [POD-363], [POD-364], [POD-365], [POD-366], [POD-375], [POD-376], [POD-377], [POD-378], [POD-379]
- Archivos a tocar: tailwind.config.ts (se borra); next.config.ts (tipado NextConfig; analyzer detrás de ANALYZE; sin el remotePattern de placehold.co); eslint.config.mjs, .gitignore y tsconfig.json ('.next*/', sin los includes de .next-perf-*); package.json (three-stdlib declarado; framer-motion → motion/react en About.tsx y Hero.tsx; sin html2canvas ni jspdf; @types/three a devDependencies); .env.example (OAUTH_STATE_SECRET; sin RESEND_FROM_EMAIL; nota de NEXT_PUBLIC_BUILD_TIME); src/app/api/version/route.ts (SHA de Netlify y fecha de build); public/og-image.png o opengraph-image por ruta; src/app/layout.tsx (sin preconnects de terceros); noise.svg servido desde public/; los sentry.*.config duplicados de la raíz; bloques de métricas de src/lib/integrations/brevo.ts y src/lib/n8n.ts; src/app/api/track/route.ts (se borra); vercel.json (se borra: los crons ya los registra [B-14]); netlify.toml (rewrite muerto). · Archivos que NO se tocan: src/components/3d/HeroArtifact.tsx (three-stdlib solo se declara); src/components/ui/KineticText.tsx; src/app/api/test-sentry/route.ts (SEC-093, Ahora).
- Zona: libre
- Tamaño: M · Riesgo: Medio. Si se borran los sentry.*.config sin confirmar cuál carga Next 16, Sentry queda inerte: FAL-030 está en Ahora (no es MEDIA de Próximo) y va antes. Los crons de vercel.json los pasa a Netlify la tarjeta de Ahora. · Prerrequisitos: [B-05], [B-14]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: npm run build y tsc en verde; three-stdlib declarado y html2canvas y jspdf fuera; /api/version devuelve el SHA del deploy; /og-image.png responde 200 o la meta og apunta a un asset que existe; ningún preconnect a grainy-gradients ni a placehold.co; un evento de prueba llega a Sentry después de borrar los duplicados; POST /api/track devuelve 404; vercel.json no existe.
- Nodo(s): lib.plataforma.tailwind-config, lib.plataforma.next-config, lib.plataforma.package, int.brevo, lib.security, int.netlify, h2.cli-shell, h4.adm-shell, h6.vis-contacto, lib.sitio-publico, lib.ui, modelo.PageView
- Worktree: wt/plataforma
- Estado: abierta

### [B-163] Build y stack: memoria medida y plan de upgrades por etapas
- Objetivo: Medir la memoria real del build, acotar el escaneo de Tailwind y dejar un plan de upgrades mayores por etapas con Node alineado entre entornos. · Hallazgos que cierra: [TEC-007], [TEC-008]
- Archivos a tocar: netlify.toml (heap medido); next.config.ts; src/app/globals.css (@source not sobre docs/ y los distDirs); package.json (engines, @types/node alineado, plugin de Netlify fijado); plan escrito con un sprint por pieza: next-auth estable, Prisma 7, zod 4; evaluar Turbopack. · Archivos que NO se tocan: src/auth.ts; prisma/schema.prisma (Prisma 7 es su propia tarjeta).
- Zona: libre
- Tamaño: M · Riesgo: Medio: cambiar el bundler o la versión de Node puede romper el deploy; probar en un deploy preview. · Prerrequisitos: [B-04]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-161: el build termina en un clon limpio con 4096 MB y queda registrado el pico; Tailwind no escanea docs/; engines y la versión de Node coinciden entre CI, Netlify y local; el plan de upgrades tiene un sprint por pieza.
- Nodo(s): int.netlify, lib.plataforma.tailwind-config, lib.plataforma.package, lib.auth, lib.prisma
- Worktree: wt/plataforma
- Estado: abierta

### [B-164] Poda ALTA de src: 17 archivos huérfanos (1.899 LOC)
- Objetivo: Borrar los archivos de src con confianza ALTA y decidir de paso si la invitación se borra o se reconecta. · Hallazgos que cierra: [POD-002], [POD-003], [POD-004], [POD-005], [POD-013], [POD-014], [POD-015], [POD-016], [POD-017], [POD-018], [POD-019], [POD-023], [POD-046], [POD-047], [POD-048], [POD-049], [POD-050], [DEU-001], [POD-284]
- Archivos a tocar: src/actions/metrics-actions.ts y task-approvals.ts; admin/clients/_actions/client.schemas.ts; admin/projects/_components/convert-lead-dialog.tsx (solo si [B-87] no lo reconectó); components/dashboard/{AnalyticsPeriodSelector,AnimatedTaskList,CurrentMilestone,DownloadReportButton,LeakMeter,TicketStatusSelector,UpsellCard}.tsx; components/onboarding/OnboardingWizard.tsx; src/lib/actions/invitations.ts y src/app/accept-invite/ si se decide borrar la invitación (DEU-001); src/lib/client-health.ts, cn.ts y design-patterns.ts; chatbot/components/admin/config/Toggle.tsx. · Archivos que NO se tocan: src/actions/admin/onboarding-tasks.ts (POD-001, va con IDEA-012); src/components/ui/HeroTitle.tsx (POD-045, va con el kit); la lección de CLAUDE.md que cita TicketStatusSelector (se actualiza con el CLAUDE.md propuesto).
- Zona: libre
- Tamaño: S · Riesgo: Bajo: cada borrado tiene dos señales independientes. FAL-024 (Próximo) decide si convert-lead-dialog vive: va antes. Registrar la decisión de DEU-001 antes de tocar invitations.ts. · Prerrequisitos: [B-87]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Los archivos de la lista ya no existen (salvo convert-lead-dialog si se reconectó) y el grep de cada specifier da 0; tsc --noEmit, check:invariants y npm run build en verde; la decisión sobre la invitación queda registrada.
- Nodo(s): lib.actions, h4.adm-clientes, h4.adm-proyectos, lib.componentes-dashboard, lib.client-health, lib.cn, lib.design-patterns, h3.adm-chatbots, h1.auth-invite
- Worktree: wt/poda
- Estado: abierta

### [B-165] Poda de scripts sueltos y salidas generadas commiteadas (103 ALTA + 10 MEDIA)
- Objetivo: Sacar del repo los scripts one-off ya cumplidos, los sueltos de la raíz y los reportes y logs commiteados, y decidir uno por uno los 10 MEDIA. · Hallazgos que cierra: [POD-085], [POD-086], [POD-087], [POD-088], [POD-089], [POD-090], [POD-091], [POD-092], [POD-093], [POD-094], [POD-095], [POD-096], [POD-097], [POD-098], [POD-099], [POD-100], [POD-101], [POD-102], [POD-103], [POD-104], [POD-105], [POD-106], [POD-107], [POD-108], [POD-109], [POD-110], [POD-111], [POD-112], [POD-113], [POD-114], [POD-115], [POD-116], [POD-117], [POD-118], [POD-119], [POD-120], [POD-121], [POD-122], [POD-123], [POD-124], [POD-125], [POD-126], [POD-127], [POD-128], [POD-129], [POD-130], [POD-131], [POD-132], [POD-133], [POD-134], [POD-135], [POD-136], [POD-137], [POD-138], [POD-139], [POD-140], [POD-141], [POD-142], [POD-143], [POD-144], [POD-145], [POD-146], [POD-147], [POD-148], [POD-149], [POD-150], [POD-151], [POD-152], [POD-153], [POD-154], [POD-155], [POD-156], [POD-157], [POD-173], [POD-174], [POD-175], [POD-176], [POD-177], [POD-178], [POD-179], [POD-180], [POD-181], [POD-182], [POD-183], [POD-184], [POD-185], [POD-186], [POD-187], [POD-188], [POD-189], [POD-190], [POD-191], [POD-192], [POD-193], [POD-194], [POD-195], [POD-196], [POD-197], [POD-198], [POD-199], [POD-200], [POD-201], [POD-202], [POD-158], [POD-159], [POD-160], [POD-163], [POD-164], [POD-165], [POD-166], [POD-167], [POD-171], [POD-172], [DEU-106], [DEU-105], [SEC-004], [SEC-108]
- Archivos a tocar: Los 73 scripts ALTA (sueltos de la raíz de la app: script*.js, replace_analytics.js, find_unused.js, test-chat.mjs; en scripts/: _b13-*, _b14-*, logs _b3x/_ms*, _b5x-test-scoring, _db-cleanup-*, b4–b9 QA y smokes, encode-vertex-creds.js, p41-inject-campaigns.ts, 11 de qa-corridas, regression/diag-timings.ts, seed-matsu-*.ts, seed-messages-demo.ts, set-matsu-password.ts y utm1-smoke.mjs); las 30 salidas (_tmp_*.html, .eslint_output.txt, audit.txt, prisma_err.txt, prisma/migrations/__diff_check.sql, ts_errors.*, ts_prune_output.txt, unused_report*.txt y logs/JSON de scripts/ y tests/); .gitignore con patrones; los 10 MEDIA (_b13-latency-analyze, _b14-2-cleanup/seed-bench-prod, b3-qa-assign-leads, cleanup-messages-demo, 3 de qa-corridas, seed-matsu.ts y v1-qa-wizard-states): borrado o anotado con motivo. · Archivos que NO se tocan: Los scripts que nombra package.json o un doc vigente; scripts/auditoria/; scripts/regression/{cases,purge,run-baseline}.ts (tarjeta de evals); b1-verify-setter-ownership.ts y b2-verify-dossier.ts (tarjeta de secretos).
- Zona: libre (qa-corridas y los QA b4–b7 son del setter: aviso a Franco)
- Tamaño: S · Riesgo: Bajo: git conserva la historia. Lista cerrada: S mecánica, no poda masiva cruzada. scripts/qa-corridas/_p23/censo-ubicaciones.ts lee docs/baselines/p23-pliegue-antes.json: si se queda, el JSON también. Si _b14-2-cleanup se queda, BUG-176 lo arregla la tarjeta de seeds. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Un script que recorre la lista ALTA encuentra 0 archivos presentes; package.json no referencia ninguno de los borrados; npm run build, tsc y check:invariants en verde; .gitignore cubre *.log y _tmp_*; cada MEDIA está borrado o anotado «se queda» con motivo.
- Nodo(s): lib.scripts, int.cal-com, lib.chatbot.llm
- Worktree: wt/poda
- Estado: abierta

### [B-166] Poda del portal y de src/lib/actions: código muerto con hallazgo (decide Valentino)
- Objetivo: Decidir y borrar los motores PDF, las rutas, las actions y los módulos legacy del portal sin consumidores, incluida la escritura de lastDashboardVisit que nadie lee. · Hallazgos que cierra: [DEU-022], [DEU-027], [DEU-030], [PERF-006], [POD-058], [POD-059], [POD-060], [POD-061], [POD-062], [POD-076], [POD-077], [POD-079], [POD-296], [POD-297], [POD-298], [POD-299], [POD-300], [POD-301], [POD-302], [POD-303], [POD-307], [POD-359]
- Archivos a tocar: src/actions/onboarding-actions.ts; api/reports/monthly/route.ts y src/lib/reports/MonthlyReport.tsx; api/dashboard/leads/recent/route.ts (con sus dos asserts de tests/e2e/40); components/dashboard/ExecutiveReportTemplate.tsx; src/lib/premium-modules.ts (quedan activateModule y cancelModule; getActiveModuleSlugs a lib/modules); src/lib/actions/messages.ts (las 3 actions admin); los módulos de src/lib/actions/{clients,leads,leads-constants,services,settings,projects,contact,gbp-connection}.ts que sigan sin importadores después de las tarjetas de Próximo; dashboard/layout.tsx (la escritura de lastDashboardVisit); los loading.tsx de cuenta y campaigns/[id]; src/app/bienvenida/ según la decisión de DEU-023. · Archivos que NO se tocan: markNotificationReadAction (POD-078: es el gemelo correcto); src/actions/admin/onboarding-tasks.ts y src/lib/data/onboarding-tasks.ts (IDEA-012); gbp-connection.ts si se construye la UI de sucursal (FAL-011).
- Zona: libre
- Tamaño: M · Riesgo: Medio: «sin llamador» se midió con grep. DEU-023 (/bienvenida, Ahora) y DEU-067 (módulos legacy, en [B-70]) deciden antes; la tarjeta de proyectos de este bloque usa exports de lib/actions/projects.ts. · Prerrequisitos: [B-164], [B-109], [B-16], [B-70], [B-130]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Cada archivo o export de la lista está borrado o anotado «se queda» con motivo; tsc, check:invariants y el e2e 40 en verde; el grep de los símbolos borrados da 0; el layout del portal ya no escribe User.lastDashboardVisit.
- Nodo(s): h2.cli-bienvenida.guardar-perfil-legacy, modelo.ClientAsset, h2.cli-resultados, h3.cli-chatbot, modelo.ChatbotLead, lib.premium-modules, lib.actions, h2.cli-shell.layout-y-navegacion, modelo.User
- Worktree: wt/poda
- Estado: abierta

### [B-167] Poda del módulo chatbot: barrels, componentes y server code sin uso
- Objetivo: Recortar el módulo chatbot a lo que se consume, para achicar la superficie de server actions y el bundle del widget. · Hallazgos que cierra: [DEU-036], [DEU-046], [DEU-054], [POD-051], [POD-313], [POD-314], [POD-315], [POD-316], [POD-318], [POD-321], [POD-322], [POD-323], [POD-324], [POD-325], [POD-327], [POD-328], [POD-329], [POD-330], [POD-333], [POD-334], [POD-335], [POD-339], [POD-340]
- Archivos a tocar: src/modules/chatbot/index.ts, index.server.ts, components/admin/index.ts, components/chat/index.ts y types.ts (recortados a lo consumido); chat/QuickReplyChips.tsx, ChatMessages.tsx, ChatMessage.tsx y ChatInput.tsx; dashboard/ClientSettingsForm.tsx con server/admin/saveClientSettings.ts; getLeadSyncHistory de getCrmSyncHistory.ts; server/admin/preflightChecks.ts (solo si [B-59] no la cableó); las 2 funciones sin uso de insights/queries.ts; requireChatbotEnv de envValidator.ts; server/chat/reconcile.ts; api/admin/chatbot/insights/generate/route.ts. A decidir: api/admin/chatbot/demo-chat/[slug]/route.ts, update-proactive-prompts.ts, llm/providers/anthropic.ts y openai.ts, scoring/calculateLeadScore.ts. · Archivos que NO se tocan: server/insights/manageInsight.ts (POD-332: lo usa IDEA-001); src/lib/isolation/*.
- Zona: libre
- Tamaño: M · Riesgo: Medio. PERF-007 (peso del widget) depende de este recorte. El guard de runPreflightChecks (SEC-065) lo pone la tarjeta de Ahora; acá solo se borra si quedó sin uso. · Prerrequisitos: [B-59], [B-10]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: tsc, el eslint de la frontera y check:invariants en verde; el grep de cada símbolo borrado da 0; el bundle de /embed/[slug] ya no incluye editores de admin (medido con ANALYZE); POST /api/admin/chatbot/insights/generate devuelve 404.
- Nodo(s): lib.chatbot, h3.cli-chatbot.personalizacion, lib.actions, h3.adm-chatbots, lib.chatbot.insights, lib.chatbot.llm
- Worktree: wt/poda
- Estado: abierta

### [B-168] Poda del admin: actions sin llamador, rutas huérfanas y catálogos copiados
- Objetivo: Borrar las actions y rutas del admin que nadie llama y dejar una sola fuente para catálogos y helpers duplicados. · Hallazgos que cierra: [DEU-065], [POD-071], [POD-073], [POD-074], [POD-081], [POD-082], [POD-346], [POD-350], [POD-356]
- Archivos a tocar: admin/projects/_actions/maintenance.actions.ts#createMaintenancePayment y project.actions.ts#getProjectById; team/_actions/task.actions.ts#reorderTasks y #listTasksByUser; admin/settings/alerts/ y settings/reports/ (borrarlas o enlazarlas); _components/dashboard-history-charts.tsx (formatCurrency a un util compartido); messages/_components/emoji-popover.tsx (componente compartido); src/lib/premium-features.ts (con lib/actions/settings.ts); settings/_actions/settings.actions.ts (moduleKey tipado; BotAlertType de @prisma/client); settings/alerts/AlertSettingsClient.tsx; ASSET_TYPES con una sola fuente. (`unmarkMilestonePaid` no se borra: [B-71] lo conecta como Deshacer) [F7 B9] · Archivos que NO se tocan: listLeads y getLeadById (Franco, POD-070); admin/leados/**; time-entry.actions.ts (POD-075 va con la tarjeta de proyectos).
- Zona: libre
- Tamaño: S · Riesgo: Bajo. FAL-007 y FAL-023 (Próximo) pueden necesitar createMaintenancePayment: ya decididos antes. · Prerrequisitos: [B-166]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Cada export de la lista está borrado o anotado «se queda» con motivo; tsc y check:invariants en verde; el grep de 'pendiente de prisma generate' da 0; /admin/settings/alerts y /reports están borradas o tienen entrada en el menú.
- Nodo(s): h4.adm-config.precios-modulos, lib.premium-features, h4.adm-alertas.detector-incidencias, h4.adm-proyectos, h4.adm-equipo, h4.adm-config
- Worktree: wt/poda
- Estado: abierta

### [B-169] LeadOS: poda del wizard, del laboratorio FG-2 y de exports sin consumidor
- Objetivo: Sacar de LeadOS el código que quedó del wizard, los exports sin consumidor y, si FG-2 se descarta, su laboratorio. · Hallazgos que cierra: [DEU-075], [DEU-078], [DEU-085], [DEU-087], [DEU-088], [POD-052], [POD-053], [POD-054], [POD-063], [POD-064], [POD-070], [POD-080], [POD-367], [POD-368], [POD-369], [POD-370], [POD-371], [POD-372], [POD-373], [POD-374], [POD-380]
- Archivos a tocar: admin/leads/_actions/lead.actions.ts (listLeads y getLeadById); setter/leads/[leadId]/_components/ficha-step.tsx (rama editable y su CopyBlock), evaluacion-form.tsx, manual/_components/m1-ficha.tsx y m-construccion.tsx (etiquetas del veredicto unificadas; comentario de expectToast); src/lib/leados/guidance-content.ts, flow.ts, contracts.ts (referenciasFicha), herramientas.ts, paso.ts (reducido a la decisión de EVALUADA) y paso-admitido.ts (junto a los invariantes, con FichaSchema.parse y sin casts); admin/leados/setter/[setterId]/_components/setter-evaluaciones.tsx (helper compartido); admin/fg2-lab/** y src/lib/leados/_experimental/* (si FG-2 se descarta, «a decidir» 33); setter/leads/[leadId]/_components/brief-form.tsx. · Archivos que NO se tocan: src/lib/leados/manual.ts salvo lo que lea paso.ts; prisma/schema.prisma; scripts/admin-1a-backfill-caliente.ts (tarjeta de borrado auditado); manual/page.tsx y [paso]/page.tsx (PERF-014 pasó a la tarjeta de lecturas del setter); docs/bitacora-beta-3.md (DEU-076 se cierra al borrar la bitácora).
- Zona: ZONA-FRANCO
- Tamaño: M · Riesgo: Medio. DEU-077 (P25–P43 fuera de main) puede reintroducir lo que se poda: decidir antes qué rama manda. Borrar fg2-lab depende de cerrar FG-2. · Prerrequisitos: [B-90], [B-79]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: tsc, test:leados, test:setter y los invariantes de LeadOS en verde; el grep de cada símbolo borrado da 0; Franco aprobó cada borrado.
- Nodo(s): h4.adm-leads, h5.set-manual.ficha-y-veredicto, h5.set-manual.construccion, h5.set-manual.guia-y-herramientas, lib.leados, h5.set-manual, h5.set-manual.derivacion-de-pantalla, h5, h5.adm-fg2lab
- Worktree: wt/franco-leados
- Estado: abierta

### [B-170] Ramas: borrar las 43 mergeadas y archivar con tag las 14 con trabajo propio
- Objetivo: Dejar en origin solo las ramas vivas: borrar las mergeadas y conservar con tag las que tienen commits propios. · Hallazgos que cierra: [POD-205], [POD-206], [POD-207], [POD-208], [POD-209], [POD-210], [POD-211], [POD-212], [POD-213], [POD-214], [POD-215], [POD-216], [POD-217], [POD-218], [POD-219], [POD-220], [POD-221], [POD-222], [POD-223], [POD-224], [POD-225], [POD-226], [POD-227], [POD-228], [POD-229], [POD-230], [POD-231], [POD-232], [POD-233], [POD-234], [POD-235], [POD-236], [POD-237], [POD-238], [POD-239], [POD-240], [POD-241], [POD-242], [POD-243], [POD-244], [POD-245], [POD-246], [POD-247], [POD-248], [POD-249], [POD-250], [POD-251], [POD-252], [POD-253], [POD-254], [POD-255], [POD-256], [POD-257], [POD-258], [POD-259], [POD-260], [POD-266]
- Archivos a tocar: Ningún archivo del árbol: refs de origin (git tag archivo/<rama> en las 14 MEDIA/BAJA antes de borrarlas, después git push --delete) y regenerar 06-ATLAS/ramas.md. · Archivos que NO se tocan: rediseno/* y v3/* dormidas (esperan el merge de rediseno/home); main; auditoria/renovacion-2026-10; p25/* y las demás ramas de Franco con trabajo vivo; los respaldo-*.
- Zona: libre (leados/* y las fix/* del setter: confirmar con Franco)
- Tamaño: S · Riesgo: Bajo: el tag conserva los commits propios. Las operaciones de git las ejecuta Valentino a mano; el agente solo arma la lista de comandos. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: `git branch -r` ya no lista las 43 mergeadas; las 14 restantes tienen su tag archivo/<nombre> en origin antes de borrarse; ramas.md regenerado ya no las muestra.
- Nodo(s): rama.leados-v2-a-main, rama.fix-callejones, rama.redisign-home, rama.chore-auditoria-seguridad, rama.experimento-estetica-goal, rama.revert-home-abortado, rama.leados-b8a-iii
- Worktree: sin worktree (operaciones de git de Valentino)
- Estado: abierta

### [B-171] Docs consolidados: publicar los 10 vivos y borrar 128 docs
- Objetivo: Reemplazar los ~140 docs dispersos por los 10 vivos de 14-DOCS-CONSOLIDADOS, con las decisiones ya tomadas, y aplicar la lista de borrado de 10-PODA §docs. · Hallazgos que cierra: [POD-083], [DEU-056], [DEU-076]
- Archivos a tocar: Mover VISION, ARQUITECTURA, ROADMAP, DECISIONES, OPERACIONES, LECCIONES, SEGURIDAD-Y-PRIVACIDAD, LEADOS, DISENO e HISTORIAL a logic-core-v3/docs/. Borrar los 54 «borrar» y los 74 «consolidado» de la tabla §docs: raíz lane-*.md y AUDITORIA-VS-BRIEF; logic-core-v3/STATUS.md, DEPLOY.md, CHANGELOG*.md, _lane-*.md y __dev_task.md; .txt de reportes viejos; docs/bitacora-*.md (cierra DEU-076), sprints/*, audits/*, auditorias/*, regression/*.md, admin-changelog/*, client-portal/*, operations/*, baselines/* (incluye roadmap-pendientes.md, cierra DEU-056); logic-core-v3/README.md con el puntero a los 10. · Archivos que NO se tocan: Los 15 «mantener»: CLAUDE.md, DESIGN.md, PRODUCT.md, AGENTS.md, README.md, BRIEF-VISION-FLUJO-SETTER-v3.md, manual-usuario/*, impeccable-baseline.json, .github/skills/impeccable, docs/auditoria-2026-10/ y fg2-brief-experimento.md hasta que se decida FG-2; docs/_insumos/ (nunca se commitea); docs/baselines/p23-pliegue-antes.json mientras viva censo-ubicaciones.ts:34.
- Zona: libre (LEADOS.md y los docs de LeadOS los aprueba Franco)
- Tamaño: M · Riesgo: Bajo-medio. Borrar del árbol no saca de la historia los secretos que enumeran los docs (decidido en los «a decidir» 30 y 31). Separada de las decisiones: lista cerrada, S mecánica. · Prerrequisitos: [B-90]
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Los 10 docs vivos están en su lugar final; un script que recorre la tabla §docs no encuentra ninguno de los 128 marcados borrar/consolidado; fuera de docs/auditoria-2026-10, `rg` de STATUS.md, bitacora-roadmap y DEPLOY.md no devuelve punteros rotos; README apunta a los 10 y no publica contraseñas de seed.
- Nodo(s): doc.bitacora-roadmap, doc.bitacora-beta-3, doc.roadmap-pendientes, doc.audits-2026-05-bfg-leak-cleanup, doc.demo-guion, doc.leados-alta-setter, h4.adm-clientes
- Worktree: wt/docs
- Estado: abierta

### [B-172] Aplicar el CLAUDE.md propuesto: raíz de 172 líneas y tres anidados (setter, chatbot, prisma)
- Objetivo: Reemplazar el CLAUDE.md raíz por el borrador de 13-CLAUDE-MD-PROPUESTO, sin sus 3 afirmaciones falsas y con lo de cada área en CLAUDE.md anidados. · Hallazgos que cierra: [DEU-025], [DEU-062], [DEU-098]
- Archivos a tocar: CLAUDE.md raíz (borrador §2: alcance por superficie DESIGN.md/CLAUDE.md, regla de IDs en URLs reescrita para cuid opacos, roles con SETTER, motion en vez de Framer Motion, protegidos según la política y definición de terminado de 8 puntos); nuevos logic-core-v3/src/app/(protected)/setter/CLAUDE.md, src/modules/chatbot/CLAUDE.md y prisma/CLAUDE.md; logic-core-v3/AGENTS.md (puntero de ~5 líneas); docs/operations/00-entornos.md:17,86,146 (si sobrevive a la poda de docs, o su contenido en OPERACIONES); src/modules/chatbot/README.md (regla 1 de la frontera y stack); .claude/agents/visual-qa.md (tres servers y «VERIFICACIÓN PENDIENTE») y .claude/launch.json unificado. · Archivos que NO se tocan: Código de src/; DESIGN.md y PRODUCT.md (se citan); setter/CLAUDE.md no se commitea sin la aprobación de Franco.
- Zona: libre (setter/CLAUDE.md: ZONA-FRANCO)
- Tamaño: M · Riesgo: Medio. El borrador supone aplicados los mecanismos (hooks, eslint.gate, skill): si va antes, las marcas «(hook)» y «(gate)» se borran. Si la regla de IDs prohíbe también los cuid, DEU-025/DEU-062 abren una tarjeta de tokens públicos en vez de cerrarse acá. · Prerrequisitos: [B-89], [B-171]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: El CLAUDE.md raíz tiene ≤ 200 líneas, no presenta Framer Motion como stack, incluye SETTER en los roles y tiene reescrita la regla de IDs; cita qué documento manda en cada superficie; existen los tres anidados y AGENTS.md es un puntero; ningún doc vivo manda imprimir DATABASE_URL; Franco aprobó setter/CLAUDE.md.
- Nodo(s): lib.ui, h6, h2.cli-soporte, h3.cli-chatbot, h4.adm-mensajes, h4.adm-leads, h4.adm-clientes, h5.set-dia, lib.prisma
- Worktree: wt/docs
- Estado: abierta

### [B-173] De prosa a mecanismo: eslint.gate en CI, hooks PreToolUse, CODEOWNERS e invariantes de convención
- Objetivo: Que las reglas no negociables de CLAUDE.md las verifique una máquina: cero any, motion en vez de framer-motion, frontera del chatbot, archivos protegidos, comandos prohibidos, dpr y Zod. · Hallazgos que cierra: [DEU-099], [DEU-071]
- Archivos a tocar: Nuevo logic-core-v3/eslint.gate.config.mjs (no-explicit-any; no-restricted-imports de framer-motion y de la frontera chatbot/motor; no-restricted-syntax para PrismaClient y console con process.env); eslint.config.mjs; .github/workflows/ci.yml (paso del gate y escaneo de secretos del diff con secrets-historial.mjs --rango); .claude/settings.json con .claude/hooks/proteger-archivos.mjs y comandos-bloqueados.mjs; .github/CODEOWNERS; scripts/run-invariants.mjs:81,106 (descubrir los test:* con .invariant.ts); invariantes nuevos de dpr y padrón de Zod; src/lib/integrations/pagespeed.ts (unknown con guards); los any restantes de src. · Archivos que NO se tocan: src/components/3d/HeroArtifact.tsx; las reglas del lint completo que no están en cero; el invariante de navegación (va con [B-119]).
- Zona: libre (CODEOWNERS de la zona de Franco: Franco)
- Tamaño: L · Riesgo: Medio. Un hook mal escrito bloquea a todos los agentes: probar caso positivo y negativo. CODEOWNERS solo bloquea con «Require review from Code Owners» en main. DEU-090 (CI sin lint) está en este mismo bloque, en [B-88]: va antes. · Prerrequisitos: [B-172], [B-162], [B-88], [B-151]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: `npx eslint -c eslint.gate.config.mjs src` da 0 y corre en ci.yml; el grep de `from 'framer-motion'`, `: any` y `as any` en src da 0; el hook bloquea un Edit sobre un protegido no declarado y un `git add .`, y deja pasar un Edit libre; CODEOWNERS existe; run-invariants descubre los 28 test:* e INVARIANTES_ESPERADOS está al día; el escaneo de secretos corre sin imprimir valores.
- Nodo(s): int.pagespeed, h3.cli-chatbot, lib.ui, lib.plataforma.package, h2.cli-resultados.velocidad-sitio
- Worktree: wt/mecanismos
- Estado: abierta

### [B-174] Ciclo del Atlas: skill atlas-actualizar, hooks SessionStart/Stop y job de CI
- Objetivo: Que el Atlas de 06-ATLAS acompañe cada sprint que toca src/ o prisma/ sin depender de que alguien se acuerde. · Hallazgos que cierra: ninguno (tarjeta de proceso)
- Archivos a tocar: .claude/skills/atlas-actualizar/SKILL.md (con su excepción en .gitignore); .claude/settings.json (SessionStart, y un Stop que solo actúa ante «## Cierre del sprint»); scripts/auditoria/atlas/generar.mjs (flag --sin-historial y `git ls-files --others --exclude-standard` en modo worktree); .github/workflows/ci.yml (job atlas que avisa sin romper el build); scripts/auditoria/ llevado a main. · Archivos que NO se tocan: atlas.curado.json, zonas.json, funcionalidades.json y entradas.json (datos de personas).
- Zona: libre
- Tamaño: M · Riesgo: Bajo. El Stop solo actúa ante el encabezado de cierre. Requiere scripts/auditoria en main. · Prerrequisitos: [B-173]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Correr la skill después de un cambio en src/ deja atlas.json al día y `node scripts/auditoria/atlas/validar-atlas.mjs` pasa; una corrida de sprint no agrega líneas a historial.jsonl; un archivo nuevo sin git add aparece en el Atlas; el job atlas corre en CI y avisa sin fallar.
- Nodo(s): lib.scripts
- Worktree: wt/mecanismos
- Estado: abierta

### [B-175] Decisiones de diseño del portal antes de cualquier token (§4 de 04-DISENO)
- Objetivo: Que Valentino responda las 8 preguntas de §4 de 04-DISENO, sin trasladar al portal las decisiones del home, para que la capa de roles tenga valores. · Hallazgos que cierra: [DIS-004]
- Archivos a tocar: DISENO.md y DECISIONES.md de los docs consolidados. Las 8 preguntas: base y dark mode, CTA, set de acentos, a qué se ata el acento, tipografía (y si Chivo llega al portal con el merge), escala, motion y glass. Si se acota Chivo al home, también rediseno/home (v3:src/app/globals.css:15-17) antes del merge. · Archivos que NO se tocan: src/components/ui/*; el globals.css de main.
- Zona: libre
- Tamaño: S · Riesgo: Alto si se saltea: asumir las decisiones del home repite el error que F3 prohíbe, y el merge de rediseno/home cambia la familia del portal a Chivo como efecto lateral. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Las 8 preguntas tienen respuesta con fecha en DECISIONES; queda una línea explícita sobre Chivo en el portal, escrita antes del merge; las respuestas fijan el valor de cada rol que pide la capa.
- Nodo(s): lib.ui, rama.rediseno-home
- Worktree: wt/diseno-portal
- Estado: abierta

### [B-176] Banco visual del kit con auth y contraste por token
- Objetivo: Tener dónde ver el kit ui/* y los wrappers bajo cada tema y medir el contraste de cada token antes del primer cambio de piel. · Hallazgos que cierra: [DIS-006]
- Archivos a tocar: Ruta nueva con auth SUPER_ADMIN dentro de src/app/(protected)/admin/: renderiza las primitivas de ui/* y los wrappers del portal bajo cada tema, con la razón de contraste de cada par texto/fondo; src/app/styleguide/page.tsx detrás de auth o borrada. · Archivos que NO se tocan: src/components/ui/* (se renderiza, no se edita).
- Zona: libre
- Tamaño: M · Riesgo: Bajo. Hoy /styleguide es pública (noindex) y no renderiza ui/*. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: La página muestra las 22 primitivas con variantes y estados vacío, carga y error, con la razón de contraste de cada par; sin sesión SUPER_ADMIN redirige; /styleguide ya no es pública; visual-qa desktop+mobile.
- Nodo(s): lib.ui
- Worktree: wt/diseno-portal
- Estado: abierta

### [B-177] Capa de roles del portal y puente de paleta, con foco visible de dos tonos
- Objetivo: Re-tematizar los portales sin editar ui/*: roles semánticos en @theme static, un puente que redefine las variables de Tailwind dentro del scope del portal y un foco que pasa 3:1 sobre la base. · Hallazgos que cierra: [DIS-001], [DIS-005]
- Archivos a tocar: src/app/portal-theme.css nuevo, importado desde globals.css después de tailwindcss: @theme static con prefijo propio (canvas, panel, fg, fg-muted, rule, control-stroke, accent, on-accent, success, warning, danger, info, foco, radios y sombras), scopes [data-portal-theme] sin @layer y un puente que redefine --color-white/black, zinc y cyan, los estados, --radius-lg…3xl, --shadow-lg/2xl y --blur-xl/2xl; src/components/portal/PortalThemeScope.tsx (atributo en <html>, limpiado al desmontar), montado en AdminLayoutClient.tsx, DashboardLayoutClient.tsx y setter-shell.tsx (con Franco); regla :focus-visible única de dos tonos; src/lib/utils.ts solo si se registran tamaños --text-* nuevos (con test:s7-cn). · Archivos que NO se tocan: src/components/ui/*; src/hooks/useThemeObserver.tsx (no repetir su patrón); el sitio público.
- Zona: libre (setter-shell.tsx: ZONA-FRANCO; utils.ts: requiere decisión FROZEN)
- Tamaño: L · Riesgo: Alto. El puente no es semántico: zinc-950 es superficie y texto sobre acento, así que un tema claro rompe el contraste si no se edita el kit. Modal y Select portalean a body: el atributo va en <html>. `@theme` a secas poda tokens y `@theme inline` no deja llegar el override. · Prerrequisitos: [B-175], [B-176]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: En el banco, bajo cada tema, todos los pares texto/fondo del kit pasan AA y el foco da 3:1 contra la base; volver del portal al sitio público no deja el atributo ni las variables (visual-qa del home después de /dashboard); el kit se re-tiñe sin diff en src/components/ui; tsc y check:invariants en verde.
- Nodo(s): lib.ui, h4.adm-shell, h2.cli-shell, h5.set-dia
- Worktree: wt/diseno-portal
- Estado: abierta

### [B-178] Shells de los tres portales con roles y Toaster condicionado
- Objetivo: Que lienzo, velo, vidrio, radio y pie de los shells de admin, dashboard y setter lean roles en vez de literales, y que el Toaster tome el tema del portal sin cambiar el sitio público. · Hallazgos que cierra: [DIS-002], [DIS-009]
- Archivos a tocar: admin/_components/AdminLayoutClient.tsx (:30-41, :46, :97, :104), admin-sidebar.tsx y admin-topbar.tsx; components/dashboard/DashboardLayoutClient.tsx (:51-62, :109, :124-127, :171, :179); con Franco, setter/_components/setter-shell.tsx (:28, :35, :69) y setter/layout.tsx (:44-75); src/app/layout.tsx:125-134 (Toaster que lee los roles dentro del scope, o uno por shell). · Archivos que NO se tocan: src/components/ui/*; el aspecto del Toaster del sitio público.
- Zona: libre (setter: ZONA-FRANCO)
- Tamaño: M · Riesgo: Medio: el Toaster es global. El pie text-zinc-700 sobre #080a0c (≈1,9:1) tiene que subir a AA. · Prerrequisitos: [B-177]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: En los tres shells el grep de bg-[#080a0c], rgba( y rounded-[28px] da 0; los pies dan 4,5:1 medido; un toast en el sitio público se ve igual que antes y en el portal toma el tema; visual-qa desktop+mobile de /admin, /dashboard y /setter.
- Nodo(s): h4.adm-shell, h2.cli-shell, h5.set-dia, lib.ui
- Worktree: wt/diseno-portal
- Estado: abierta

### [B-179] Higiene de UI del portal del cliente: acentos, strokeWidth, inline, copy sin terminar y módulos DEPRECATED
- Objetivo: Que el portal del cliente cumpla las convenciones de CLAUDE.md, no muestre copy sin terminar, no esconda un módulo DEPRECATED activo y que Agenda copie el link en vez de descargarlo. · Hallazgos que cierra: [DEU-028], [UX-012], [BUG-043], [UX-008]
- Archivos a tocar: dashboard/services/page.tsx (SERVICE_TYPE_CONFIG con #10b981, #f59e0b y #8b5cf6; DEPRECATED si la org lo tiene ACTIVE o PAUSED; longDescription en el modal); src/lib/modules/showroom.ts; components/dashboard/PremiumModuleCard.tsx («Consultar»); ResultadosTabs.tsx (tilde de Tráfico); bienvenida/_components/Step3Tour.tsx; email-marketing/campaigns/new/page.tsx; agenda-inteligente/page.tsx (copiar con clipboard y aria-label; grid-cols-1 sm:grid-cols-3; <Link>); motor-resenas/_components/ReviewItem.tsx; cuenta/facturacion/page.tsx (clases Tailwind en vez de inline; strokeWidth={1.5}). · Archivos que NO se tocan: src/components/ui/*; globals.css.
- Zona: libre (Valentino confirma si un módulo DEPRECATED activo se muestra)
- Tamaño: S · Riesgo: Bajo. Suma UX-008 desde la tarjeta de CTAs: mismo archivo de Agenda y es higiene de UI, no navegación. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: En esos archivos el grep de Lucide sin strokeWidth={1.5} y de style={{ da 0; el detalle de un módulo muestra su longDescription y no PLACEHOLDER; una org con un módulo DEPRECATED activo lo ve en «Tus módulos»; «Copiar link» de Agenda copia al portapapeles y tiene aria-label; visual-qa de Servicios, Facturación y Agenda (mobile).
- Nodo(s): h2.cli-servicios.vitrina-modulos, h2.cli-servicios.servicios-contratados, h2.cli-resultados, lib.ui, h2.cli-email-mkt, modelo.PremiumModule, modelo.OrganizationModule, h2.cli-agenda.panel-de-agenda
- Worktree: wt/portal-cliente
- Estado: abierta

### [B-180] Higiene de UI del admin: 180 detalles (tildes, copy, strokeWidth, contraste, inline)
- Objetivo: Pasar la checklist de higiene de D3 sobre el admin, archivo por archivo. · Hallazgos que cierra: [DEU-069]
- Archivos a tocar: Los archivos de la lista de DEU-069 en 03-MEJORAS (admin-sidebar.tsx, AdminLayoutClient.tsx, admin-topbar.tsx, AdminBackButton.tsx, AdminErrorBoundary.tsx, admin/error.tsx y el resto de src/app/(protected)/admin/**), de a uno. · Archivos que NO se tocan: admin/leados/** y fg2-lab (su higiene es DEU-089, de Franco); src/components/ui/*.
- Zona: libre
- Tamaño: M · Riesgo: Bajo. Va antes de migrar el admin al tema. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Las 180 entradas de la checklist de DEU-069 están tachadas o anotadas; fuera de leados el grep de Lucide sin strokeWidth={1.5} en el admin da 0; visual-qa desktop+mobile de 5 rutas del admin sin ❌.
- Nodo(s): h4.adm-shell, h4.adm-alertas, h4.adm-audit
- Worktree: wt/admin
- Estado: abierta

### [B-181] Higiene de UI de integraciones, plataforma y kit compartido (D7, D8, D9)
- Objetivo: Pasar las checklists de higiene de D7 (15), D8 (17) y D9 (44) en los archivos libres. · Hallazgos que cierra: [DEU-073], [DEU-096], [DEU-103]
- Archivos a tocar: Las listas de DEU-073 (Footer.tsx, src/emails/ActionRequiredEmail.tsx y TicketReplyEmail.tsx, templates/welcome-client.ts y weekly-report.ts, api/email/optout/[contactId]/route.ts), DEU-096 (src/app/error.tsx, global-error.tsx, not-found.tsx, layout.tsx, globals.css) y DEU-103 (Navbar.tsx, brand/BrandMark.tsx, VersionBadge.tsx, canvas/DotMatrix.tsx y el resto), de a un archivo. · Archivos que NO se tocan: Las 25 entradas de DEU-103 en src/components/ui/* (van con el kit protegido); scripts/seed-matsu.ts si la poda de scripts lo borró.
- Zona: libre
- Tamaño: S · Riesgo: Bajo. · Prerrequisitos: ninguno
- Nivel de proceso: S · Modelo sugerido: Sonnet 5.5 · Esfuerzo: medium · Ultracode: OFF
- Criterio de aceptación: Las entradas libres de las tres checklists están tachadas o anotadas; los 28 casos de contraste dan ≥ 4,5:1 en texto o 3:1 en UI, medido; visual-qa de la 404, del pie y de un email renderizado.
- Nodo(s): h6.vis-contacto, int.email, h6.vis-optout, lib.plataforma.app-raiz, lib.sitio-publico, lib.scripts, lib.ui
- Worktree: wt/sitio-publico
- Estado: abierta

### [B-182] Migrar auth y widget al tema del portal
- Objetivo: Llevar al tema decidido las 7 pantallas de mayor puntaje de §5 (impacto 3, esfuerzo S): las 6 de auth y el widget embebido. · Hallazgos que cierra: ninguno (tarjeta de proceso)
- Archivos a tocar: src/app/{login,reset-password,accept-invite,cambiar-password,forgot-password,bienvenida}/**; src/app/embed/[slug]/** con chatbot/components/embed/ChatbotEmbed.tsx y chat/ChatWindow.tsx (o el ChatShell) (clases de paleta → roles; wrappers en src/components/portal/* donde el puente no alcanza). · Archivos que NO se tocan: src/components/ui/*; public/widget.js salvo lo visual del launcher.
- Zona: libre
- Tamaño: M · Riesgo: Medio: el widget vive en sitios de clientes y su tema respeta el accent del tenant. Con AuthShell y ChatShell hechos antes, cada pantalla se migra una sola vez. · Prerrequisitos: [B-178], [B-156], [B-149]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: El censo de diseño (scripts/auditoria/censo-diseno.mjs) de esas 7 pantallas baja a ~0 en paleta y literales fuera de los permitidos; visual-qa desktop+mobile de cada una bajo el tema decidido; contraste AA en el banco.
- Nodo(s): h1.auth-login, h1.auth-recupero, h1.auth-invite, h1.auth-cambio, h2.cli-bienvenida, h3.vis-widget-cliente
- Worktree: wt/diseno-portal
- Estado: abierta

### [B-183] Migrar el portal del cliente al tema
- Objetivo: Pasar las 32 pantallas del portal (~2.300 referencias de paleta) de clases de paleta a roles, pantalla por pantalla, en el orden de §5. · Hallazgos que cierra: ninguno (tarjeta de proceso)
- Archivos a tocar: src/app/(protected)/dashboard/**, src/components/dashboard/** y chatbot/components/{dashboard,dashboards,installation}/**. Primero las de puntaje 1,5 (cuenta, resultados, email-marketing, chatbot/knowledge…) y después las L (contactos, agenda, mensajes, tienda, chatbot). · Archivos que NO se tocan: src/components/ui/*; src/lib/email/templates/* (en un email el literal es obligatorio).
- Zona: libre
- Tamaño: L · Riesgo: Alto por volumen: durante la transición conviven pantallas con rol y con paleta; sin el banco cada remapeo es una regresión a ciegas. · Prerrequisitos: [B-178], [B-179]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: ON
- Criterio de aceptación: El censo de diseño del portal muestra paleta y literales cerca de 0 fuera de los permitidos; cada pantalla migrada tiene su visual-qa desktop+mobile sin ❌; tsc y check:invariants en verde.
- Nodo(s): h2.cli-shell, h2.cli-inicio, h2.cli-resultados, h2.cli-cuenta, h2.cli-email-mkt, h3.cli-chatbot
- Worktree: wt/diseno-portal
- Estado: abierta

### [B-184] Migrar el admin y el admin de chatbots al tema
- Objetivo: Pasar las pantallas del admin y del admin de chatbots (~4.300 referencias) de clases de paleta a roles, en el orden de §5. · Hallazgos que cierra: ninguno (tarjeta de proceso)
- Archivos a tocar: src/app/(protected)/admin/** fuera de leados y fg2-lab; src/components/admin/**; src/modules/chatbot/components/admin/**. · Archivos que NO se tocan: admin/leados/** y fg2-lab/** (ZONA-FRANCO); src/components/ui/*.
- Zona: libre
- Tamaño: L · Riesgo: Alto por volumen: 191 tsx en el admin y 96 en el módulo chatbot. · Prerrequisitos: [B-178], [B-180], [B-155]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: ON
- Criterio de aceptación: El censo de diseño del admin baja a cerca de 0 fuera de los permitidos; cada pantalla migrada tiene su visual-qa desktop+mobile; tsc y check:invariants en verde.
- Nodo(s): h4.adm-shell, h4.adm-clientes, h3.adm-chatbots, h4.adm-alertas, h4.adm-proyectos
- Worktree: wt/diseno-portal
- Estado: abierta

### [B-185] Migrar el setter al tema
- Objetivo: Llevar el panel del setter y la revisión de demos al tema del portal, con visual-qa por pantalla. · Hallazgos que cierra: ninguno (tarjeta de proceso)
- Archivos a tocar: src/app/(protected)/setter/**, admin/leados/** y admin/fg2-lab/** (si FG-2 sigue). · Archivos que NO se tocan: src/lib/leados/** (lógica); src/components/ui/*.
- Zona: ZONA-FRANCO
- Tamaño: L · Riesgo: Medio: 81 tsx y 928 referencias. Franco decide el lenguaje visual del setter mirando. · Prerrequisitos: [B-178], [B-142], [B-143]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: El censo de diseño del setter baja a cerca de 0 fuera de los permitidos; visual-qa desktop+mobile de las 6 pantallas del setter y de la revisión de demos; test:setter en verde; Franco aprobó.
- Nodo(s): h5.set-dia, h5.set-lead, h5.set-manual, h5.set-nuevo, h5.adm-revision-demos
- Worktree: wt/franco-leados
- Estado: abierta

### [B-186] Kit semántico: migrar ui/* a roles (lo que el puente no alcanza)
- Objetivo: Si Valentino descongela el kit, migrar sus internos de clases de paleta a roles para que el tema claro y oscuro sea solo CSS y no dependa del puente. · Hallazgos que cierra: ninguno (tarjeta de proceso)
- Archivos a tocar: src/components/ui/* (~25 archivos, 377 referencias): on-accent separado de superficie (Button.tsx:36, Badge.tsx, Tabs.tsx:80 frente a Modal.tsx:47, Card.tsx:32 y Toggle.tsx:40); el CTA primario que se decida; radios por tipo (skeletons rounded-[28px] y [26px], Card y Button); el glow cian literal (Card.tsx:31, :57); backdrop-blur sin sufijo y [20px]; className o surface en Modal y Toggle y slots en Select y Tabs; escala micro como tokens; el gradiente de PageHeader. · Archivos que NO se tocan: Los componentes del intro y del home clásico dentro de ui/.
- Zona: requiere decisión FROZEN
- Tamaño: L · Riesgo: Alto: 344 dependientes. Cada cambio de API es aditivo con default idéntico o migra todos los call sites en el mismo commit. · Prerrequisitos: [B-89], [B-177]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: El kit de portal queda casi sin clases de paleta (solo roles); el banco pasa AA bajo cada tema aun sin el puente; commits con prefijo ui/; visual-qa de una pantalla por dominio consumidor.
- Nodo(s): lib.ui
- Worktree: wt/diseno-portal
- Estado: abierta

### [B-187] Peso del widget y del layout raíz
- Objetivo: Que el widget público no cargue el barrel completo del chatbot y que el iframe /embed no cargue el chrome de marketing. · Hallazgos que cierra: [PERF-007], [PERF-016]
- Archivos a tocar: src/components/layout/ChatWidgetMount.tsx (import directo de LogicCompanion); src/modules/chatbot/index.ts (partido por superficie, sobre el recorte de la poda); src/app/layout.tsx y un route group del sitio de marketing con su layout (decisión de Valentino: reordena PreloaderProvider y TransitionProvider); @next/bundle-analyzer detrás de ANALYZE para medir. · Archivos que NO se tocan: src/context/TransitionContext.tsx y PreloaderContext.tsx (no romper el flujo de fases); src/components/3d/HeroArtifact.tsx.
- Zona: requiere decisión FROZEN (providers del layout raíz)
- Tamaño: L · Riesgo: Alto: mover providers rompe la coreografía del home; se hace después del merge de rediseno/home, sobre el resultado. · Prerrequisitos: [B-89], [B-167], [B-149], [B-188]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: VH-071 y VH-162: el bundle del widget y el de /embed bajan (bundle-analyzer, antes y después en el PR) y /embed no carga Navbar, Dock, Shutter, Preloader ni Lenis; visual-qa desktop+mobile del home sin ❌.
- Nodo(s): h3.vis-widget-develop, lib.chatbot, h3.vis-widget-cliente, h2.cli-shell, lib.ui
- Worktree: wt/post-merge-home
- Estado: abierta

### [B-188] Después del merge de rediseno/home: borrar el home clásico, HeroArtifact y las ramas v3 dormidas
- Objetivo: Cuando /v3 reemplace a /, sacar la cadena del hero viejo, las secciones y landings sin consumidor y las ramas dormidas, y reducir PreloaderContext a un provider mínimo. · Hallazgos que cierra: [PERF-022], [POD-348], [POD-386], [POD-006], [POD-007], [POD-008], [POD-009], [POD-010], [POD-011], [POD-012], [POD-020], [POD-021], [POD-022], [POD-024], [POD-025], [POD-026], [POD-027], [POD-028], [POD-029], [POD-030], [POD-031], [POD-032], [POD-033], [POD-034], [POD-035], [POD-036], [POD-037], [POD-038], [POD-039], [POD-040], [POD-041], [POD-042], [POD-043], [POD-044], [POD-055], [POD-056], [POD-057], [POD-261], [POD-262], [POD-263], [POD-264], [POD-265], [POD-267], [POD-268], [POD-269], [POD-270], [POD-271], [POD-272], [POD-273], [POD-274], [POD-275], [POD-276], [POD-277], [POD-278], [POD-279], [POD-280], [POD-281]
- Archivos a tocar: src/components/3d/HeroArtifact.tsx y su cadena (Hero.tsx, HeroCanvas, HeroArtifactLayer, HeroLogoSlot, BrandedLogoWhite.tsx); los 31 archivos ALTA de src/components/{automation,canvas,ia,sections,software,layout} y los 3 BAJA (SectionShell, CalculadorIA, PortfolioWebCases) tras verificarlos; src/context/PreloaderContext.tsx (isDone, setPhase('done') y el flag de automatización a lib/); src/lib/chromeReveal.ts (según sus consumidores); admin/clients/_components/HoverScaleCard.tsx (unificar); contrato.ts:237-239 (huella); las ramas rediseno/* y v3/* dormidas (tag y borrado, a mano por Valentino). · Archivos que NO se tocan: src/components/ui/buttons/MagneticCta.tsx (POD-386: el hero nuevo la necesita); src/context/TransitionContext.tsx; src/lib/utils.ts salvo lo que traiga la rama con test:s7-cn.
- Zona: requiere decisión FROZEN
- Tamaño: L · Riesgo: Alto. Borrar el hero viejo antes de que /v3 reemplace a / deja la home sin hero. HeroArtifact es la única prohibición con razón escrita (AGENTS.md:76). · Prerrequisitos: [B-89], [B-107]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: ON
- Criterio de aceptación: / sirve la home v3; el grep de HeroArtifact, HeroArtifactLayer y de los 31 archivos da 0; tsc, check:invariants, test:s8-diferido (huella actualizada en el mismo commit) y test:s7-cn (registrado como check:invariant:cn) en verde; e2e 01-landing y visual-qa de /, de una landing con MarketingIntro y de /dashboard; las 20 ramas dormidas tienen tag de archivo y no están en origin.
- Nodo(s): lib.sitio-publico, lib.context, lib.chromereveal, lib.utils, rama.rediseno-home, rama.rediseno-chrome, rama.rediseno-cimientos, rama.rediseno-motion, rama.rediseno-secciones-a, rama.rediseno-secciones-b, rama.v3-escena, rama.v3-luz, lib.plataforma.package
- Worktree: wt/post-merge-home
- Estado: abierta

### [B-189] Sitio público: CTA del hero, menú mobile accesible y animaciones que respetan reducir movimiento
- Objetivo: Que lo que sobreviva del sitio público tras el merge tenga CTAs con destino, menú mobile accesible, video liviano, intro que no bloquee el scroll y titular que respete reducir movimiento. · Hallazgos que cierra: [A11Y-035], [BUG-179], [PERF-020], [PERF-021], [A11Y-038]
- Archivos a tocar: Lo que sobreviva al merge de: src/components/layout/Hero.tsx (href a /contact o getWhatsappHref() y triggerTransition al portfolio) o el hero nuevo; src/components/layout/Navbar.tsx (aria-label que alterne, aria-expanded, aria-controls; hoja como diálogo con Escape y foco); sections/web-development/WebDevelopmentSensory.tsx (preload none, poster, carga en viewport; video recodificado < 1,5 MB); con decisión de Valentino, ui/MagneticCta.tsx (href u onClick obligatorio), VideoCard.tsx, MarketingIntro.tsx, Preloader.tsx y TypewriterText.tsx. · Archivos que NO se tocan: src/components/3d/HeroArtifact.tsx; src/context/PreloaderContext.tsx (no romper el flujo de fases); src/context/TransitionContext.tsx.
- Zona: requiere decisión FROZEN (src/components/ui/*)
- Tamaño: M · Riesgo: Alto: el home se reemplaza con rediseno/home; si Hero.tsx o TypewriterText se borran en el post-merge, BUG-179 y A11Y-038 se cierran verificando el hero nuevo. · Prerrequisitos: [B-89], [B-188]
- Nivel de proceso: M · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: VH-167: los CTA del hero llevan a contacto y al portfolio; VH-170: el scroll no queda bloqueado más que el trazo del intro; VH-171: con 'reducir movimiento' el titular es estático; /web-development no descarga el video antes de que entre en viewport (network); el menú mobile se abre con Enter, cierra con Escape y anuncia aria-expanded (axe sin violaciones).
- Nodo(s): h6, h6.vis-contacto, h1.auth-login, lib.ui
- Worktree: wt/sitio-publico
- Estado: abierta

### [B-190] Sitio público: SmoothScroll sin loops, scroll-lock con red, precios y WhatsApp de una sola fuente
- Objetivo: Cerrar los defectos del chrome público que sobreviven al rediseño: loops de rAF, una home que puede quedar sin scroll y datos duplicados. · Hallazgos que cierra: [PERF-019], [BUG-178], [DEU-097], [BUG-144], [PERF-013]
- Archivos a tocar: src/components/layout/SmoothScroll.tsx (cancelar el rAF en el cleanup, o autoRaf: true); EarlyScrollLock.tsx (setTimeout de seguridad con MARKETING_SCROLL_SAFETY_MS); Navbar.tsx y sections/home/OurServices.tsx (precios desde un módulo de datos con la moneda explícita); sections/home/Footer.tsx (strokeDashoffset con getTotalLength y opacidad en vez de blur). `sections/home/Footer.tsx`: el número de WhatsApp sale de `getWhatsappHref` de `lib/whatsapp.ts` (BUG-144); esta tarjeta lo migra [F7 B12] · Archivos que NO se tocan: src/components/3d/HeroArtifact.tsx; src/context/* [F7 B12: el número de WhatsApp del pie lo migra esta tarjeta].
- Zona: libre
- Tamaño: S · Riesgo: Medio: verificar qué sobrevive al merge antes de invertir (EarlyScrollLock y Footer podrían irse). BUG-175 (Lenis en el setter, Próximo) toca SmoothScroll antes. · Prerrequisitos: [B-78], [B-68], [B-188]
- Nivel de proceso: S · Modelo sugerido: Opus 5.5 · Esfuerzo: xhigh · Ultracode: OFF
- Criterio de aceptación: Tras 10 navegaciones públicas queda un solo loop de rAF de Lenis (performance trace); si el Hero no llega a 'done' el scroll se libera solo; el grep de precios literales en Navbar da 0; el pie usa lib/whatsapp.ts; visual-qa del pie desktop y mobile.
- Nodo(s): h6, lib.sitio-publico, h6.vis-contacto.formulario-pie-home, h6.vis-contacto, lib.ui
- Worktree: wt/sitio-publico
- Estado: abierta

### [B-191] Prisma 7 como sprint propio
- Objetivo: Planificar y ejecutar el salto de Prisma 6.19 a 7.x una vez cerrado el estado de las migraciones de producción. · Hallazgos que cierra: [TEC-001]
- Archivos a tocar: package.json; prisma/schema.prisma (generator y datasource); prisma.config.ts (datasource con directUrl); prisma/seed-guard.ts y los seeds y scripts que cargan .env (carga explícita). · Archivos que NO se tocan: Las migraciones aplicadas.
- Zona: requiere decisión FROZEN
- Tamaño: L · Riesgo: Alto: cambia el generador y la carga de entorno de seeds y scripts; con las migraciones de producción sin cerrar puede dejar drift. · Prerrequisitos: [B-105], [B-163]
- Nivel de proceso: L · Modelo sugerido: Opus 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Prisma 7.x instalado; npx prisma generate, tsc, check:invariants, test:integration y test:p2002 en verde contra la base de test; los seeds corren con el entorno explícito; migrate status sin drift.
- Nodo(s): lib.prisma, lib.prisma.seeds
- Worktree: wt/protegidos-schema
- Estado: abierta

### [B-192] IDEA-001 (resto): el dueño contesta desde Análisis las preguntas que el bot no supo
- Objetivo: Que el dueño pueda responder los huecos de la KB (KB_GAP) desde Análisis y que esa respuesta llegue a develOP para cargarla. · Hallazgos que cierra: [IDEA-001], [POD-332]
- Archivos a tocar: src/components/dashboard/results/analysis/DiscoveriesSection.tsx (para KB_GAP, «Tu respuesta» además de los botones que pone BUG-023); src/modules/chatbot/server/insights/manageInsight.ts (safeParse; revalida /dashboard/resultados/analisis); src/lib/data/message-context.ts (context 'kb'). La mitad de BUG-023 que [B-64] deja acá: isla cliente en `DiscoveriesSection.tsx` con APPLY/DISMISS para todas las categorías (llama a actOnInsight) y el link del email de `sendInsightsNotification.ts:47` a /dashboard/resultados/analisis [F7 B3] · Archivos que NO se tocan: generateInsights.ts y el cron; la KB del cliente (la carga develOP con saveKnowledgeBaseByOrgSlug).
- Zona: libre
- Tamaño: S · Riesgo: Medio. El dueño puede contestar precios o promesas que el bot repetiría: la respuesta pasa por develOP y por forbiddenStatements. Se recortó a lo que BUG-023 no cubre. · Prerrequisitos: [B-64]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Una respuesta a un KB_GAP llega a develOP como mensaje con context 'kb' y saca el descubrimiento de pendientes; un payload inválido a manageInsight se rechaza; visual-qa de Análisis.
- Nodo(s): lib.chatbot.insights, int.cron.generate-insights, h2.cli-resultados, lib.prisma
- Worktree: wt/ideas-chatbot
- Estado: abierta

### [B-193] IDEA-002 (resto): el cruce del 80 % de la cuota también avisa a develOP y aparece en Atención hoy
- Objetivo: Que develOP se entere cuando un cliente cruza el 80 % del cupo y que el dueño lo vea en Atención hoy, además del email que manda FAL-019. · Hallazgos que cierra: [IDEA-002]
- Archivos a tocar: src/modules/chatbot/server/quota/ (aviso a develOP por sendAgencyAlert al cruzar el 80 %, sobre el mismo marcador idempotente alert80Sent que usa FAL-019); src/lib/dashboard/attention.ts (ítem de cuota con link a /dashboard/plan). · Archivos que NO se tocan: prisma/schema.prisma (alert80Sent ya existe); el email al dueño al 80 % y al degradar (FAL-019, Próximo).
- Zona: libre
- Tamaño: S · Riesgo: Bajo. Corre en el camino caliente del chat: el aviso nunca puede romper el stream. Se recortó: el email al dueño ya lo cubre FAL-019. · Prerrequisitos: [B-48]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Al cruzar el 80 % sale un solo aviso a develOP por mes (test del accessor idempotente); Atención hoy muestra el ítem de cuota; un fallo del webhook no corta el turno.
- Nodo(s): lib.chatbot.quota, lib.isolation, lib.chatbot.chat, lib.chatbot.notifications, h2.cli-inicio
- Worktree: wt/ideas-chatbot
- Estado: abierta

### [B-194] IDEA-003: lo que Google te trajo (llamadas, «cómo llegar» y clics), con el error distinto de «no conectado»
- Objetivo: Cablear la Performance API de GBP en la tarjeta que hoy está stubbeada en 0. · Hallazgos que cierra: [IDEA-003], [UX-015]
- Archivos a tocar: src/lib/integrations/google-business-profile.ts (fetchMultiDailyMetricsTimeSeries con CALL_CLICKS, WEBSITE_CLICKS, BUSINESS_DIRECTION_REQUESTS e impresiones, 30 días con corrimiento, Promise.allSettled y parseo puro con invariante); components/dashboard/results/GBPMetricsCard.tsx (período rotulado; sin FIXME); dashboard/resultados/reputacion/page.tsx (un error no se muestra como «pendiente de conexión»). · Archivos que NO se tocan: El flujo OAuth de GBP (su UI es FAL-011).
- Zona: libre
- Tamaño: S · Riesgo: Medio: verificar que la Performance API esté habilitada en el proyecto de Google (VH-176); la cuenta de Google por org la decide la tarjeta de Ahora. · Prerrequisitos: [B-19], [B-54]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Con una org conectada la tarjeta muestra llamadas, cómo llegar y clics del período rotulado; un fallo de Performance no tumba las reseñas; un error de la API se ve como error; el invariante del parseo corre en check:invariants.
- Nodo(s): int.gbp, h2.cli-resultados
- Worktree: wt/ideas-portal
- Estado: abierta

### [B-195] IDEA-004: «Pedile la reseña» al marcar Vendido
- Objetivo: Que, al cerrar una venta, el dueño mande en un toque el link de reseña de Google por WhatsApp o email. · Hallazgos que cierra: [IDEA-004]
- Archivos a tocar: Helper puro del link (URL de AskReviewSection más teléfono normalizado con 549) con su invariante; src/modules/chatbot/components/dashboard/LeadStatusActions.tsx o LeadDetail.tsx (acción con wa.me y mailto); opcional, un ChatbotEvent 'review.requested'. · Archivos que NO se tocan: prisma/schema.prisma; el escritor de googleMapsPlaceId (FAL-004, [B-55]).
- Zona: libre
- Tamaño: S · Riesgo: Medio. Política de Google: se pide en todo «Vendido», sin filtrar por satisfacción. Ofrecerlo fuera del Motor de Reseñas puede canibalizarlo (decisión de producto). Se quitó el escritor del placeId: ya lo hace FAL-004. · Prerrequisitos: [B-55]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Con placeId cargado, al marcar Vendido aparece «Pedile la reseña» con un wa.me válido aunque el teléfono venga sin 549 (invariante); sin placeId no se ofrece.
- Nodo(s): h3.cli-chatbot, lib.chatbot, lib.prisma
- Worktree: wt/ideas-portal
- Estado: abierta

### [B-196] IDEA-005: SLA de soporte, con lo no contestado escalado por Telegram y marcado en la bandeja
- Objetivo: Que develOP vea, y reciba por Telegram, lo que un cliente escribió y nadie contestó a tiempo. · Hallazgos que cierra: [IDEA-005]
- Archivos a tocar: src/lib/support/sla.ts nuevo (puro; umbrales por prioridad en horario hábil, leídos de la fuente única de SLA) con su invariante; src/app/api/cron/support-sla/route.ts (CRON_SECRET); netlify/functions/support-sla-cron.ts y su entrada en netlify.toml; badge «vencido» en admin/tickets y admin/messages; un digest de Telegram por corrida, marcado con una clave en RateLimit. · Archivos que NO se tocan: vercel.json.
- Zona: libre
- Tamaño: M · Riesgo: Medio: si no respeta horario hábil y feriados hace ruido; no duplicar el aviso inmediato. UX-009 (Próximo) unifica los SLA prometidos: los umbrales salen de ahí. · Prerrequisitos: [B-113], [B-68], [B-14]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: El invariante de sla.ts cubre fin de semana y prioridades; corrido dos veces en la misma hora el cron manda un solo digest; la bandeja marca los vencidos; netlify.toml registra la función.
- Nodo(s): lib.componentes-dashboard, h2.cli-soporte, h2.cli-mensajes, lib.health-score, int.telegram
- Worktree: wt/ideas-admin
- Estado: abierta

### [B-197] IDEA-006 + IDEA-009: «Atención hoy» con lo que pasa en el negocio y el pedido de referido en el momento de valor
- Objetivo: Sumar a Atención hoy las reseñas sin responder, los productos por agotarse y el pedido de referido después de las primeras ventas. · Hallazgos que cierra: [IDEA-006], [IDEA-009]
- Archivos a tocar: src/lib/dashboard/attention.ts (ramas 'review', 'stock' y 'referral'; unión de tipos); components/dashboard/home/AttentionStack.tsx (ICON_MAP); src/lib/referrals/value-moment.ts nuevo (puro) con invariante; marcador «ya ofrecido» en RateLimit (30 días); bloque en src/lib/email/templates/weekly-report.ts. · Archivos que NO se tocan: executive-weekly.ts; el tratamiento de stock null de tiendanube.ts (BUG-033, [B-54]).
- Zona: libre
- Tamaño: M · Riesgo: Medio. Con la caché de Tiendanube fría son 4 fetch en serie en el render de Inicio, bajo el techo de 10 s (según el PROMPT; sin verificar, VH-159). Se quitó el arreglo de stock null: lo hace BUG-033 antes. · Prerrequisitos: [B-54]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Una org con reseñas sin responder ve el ítem con link a motor-resenas; un producto con stock ilimitado no se marca «por agotarse»; después del primer WON sin tickets abiertos el referido aparece una vez y, al cerrarlo, desaparece 30 días (invariante); una integración caída no tumba el bloque.
- Nodo(s): h2.cli-inicio, int.gbp, int.tiendanube, h2.cli-referidos, lib.chatbot, lib.chatbot.admin
- Worktree: wt/ideas-portal
- Estado: abierta

### [B-198] IDEA-007: contactos sin atender, con recordatorio al dueño y el «Digest diario» que la configuración ya ofrece
- Objetivo: Que el modo DAILY_DIGEST funcione y que un lead sin contactar genere un recordatorio. · Hallazgos que cierra: [IDEA-007]
- Archivos a tocar: src/app/api/cron/lead-reminders/route.ts; netlify/functions/lead-reminders-cron.ts y netlify.toml; src/lib/client-notifications/notify.ts (rama DAILY_DIGEST); plantilla «siguen esperando»; marca con checkRateLimit; si el digest no salió en 26 h, aviso inmediato; la query que cruza orgs pasa por el helper de aislamiento. · Archivos que NO se tocan: vercel.json.
- Zona: libre
- Tamaño: M · Riesgo: Medio. Spam si el dueño trabaja el lead por WhatsApp sin tocar «Lo contacté»: un solo recordatorio por lead y respetar DISABLED. El outbox de avisos post-lead (Próximo) toca el mismo camino de notificación antes. · Prerrequisitos: [B-14], [B-46]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Una org en DAILY_DIGEST recibe un solo email por día con los leads del día; un lead NEW de más de 24 h genera un solo recordatorio; el invariante de aislamiento cubre la query; netlify.toml registra la función.
- Nodo(s): lib.chatbot.notifications, h3.adm-chatbots, lib.chatbot.admin, lib.rate-limit, lib.prisma
- Worktree: wt/ideas-chatbot
- Estado: abierta

### [B-199] IDEA-008 + IDEA-013: «Ideas para crecer» con señales nuevas y el tablero de upsell para develOP
- Objetivo: Sumar señales al motor de recomendaciones y correr sus reglas sobre toda la cartera en una página del admin. · Hallazgos que cierra: [IDEA-008], [IDEA-013]
- Archivos a tocar: src/lib/recommendations/rules.ts y types.ts (avgResponseMinutes y googleRating; carritos recién después de verificar /checkouts); get-recommendations-for-org.ts; src/lib/recommendations/get-recommendations-for-all-orgs.ts nuevo (en lotes; unstable_cache de 1 h); admin/upsell/page.tsx nueva (org → recomendación → señal → último pedido; cuota agotada como fila aparte; «Escribirle»). · Archivos que NO se tocan: admin/leads/page.tsx (página aparte); prisma/schema.prisma.
- Zona: libre
- Tamaño: M · Riesgo: Medio. abandonedCarts7d no es confiable (tiendanube.ts:115, :158); no bajar la muestra mínima para el admin; mostrar lo pedido y nunca activado (FAL-005). · Prerrequisitos: [B-115]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Las reglas nuevas tienen sus casos en el invariante del motor; /admin/upsell carga con 150 orgs sin abrir 150 conexiones a la vez; solo la ve SUPER_ADMIN.
- Nodo(s): h2.cli-inicio, int.gbp, int.tiendanube, lib.prisma
- Worktree: wt/ideas-admin
- Estado: abierta

### [B-200] IDEA-010: el bot consulta el catálogo y el stock de Tiendanube
- Objetivo: Que el bot de un cliente con tienda conectada pueda buscar productos y mostrar precio y stock. · Hallazgos que cierra: [IDEA-010]
- Archivos a tocar: src/modules/chatbot/server/tools/ (tool buscar_producto con unstable_cache corto por org y término); getTools.ts y types.ts; components/tool-cards/ (tarjeta de producto) y renderToolCall.tsx; server/prompts/sections.ts (el stock es orientativo); script puntual para Plan.tools. · Archivos que NO se tocan: prisma/seeds/sync-plans.ts (pisa los precios); el stock null de tiendanube.ts (BUG-033).
- Zona: libre
- Tamaño: M · Riesgo: Alto. La latencia de Tiendanube cae dentro del turno, bajo los 10 s y stepCountIs(3); con el token revocado hoy devuelve null sin avisar (lo arregla BUG-033 antes). · Prerrequisitos: [B-54], [B-47]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Con tiendanubeConnectedAt la tool está disponible y sin conexión no; una búsqueda devuelve hasta 5 productos con precio y stock y la tarjeta enlaza a la tienda; un producto con stock null no se informa «sin stock»; el turno con la tool entra en el presupuesto (medido).
- Nodo(s): int.tiendanube, lib.chatbot.tools, h3.vis-widget-cliente, lib.chatbot.prompts, lib.prisma
- Worktree: wt/ideas-chatbot
- Estado: abierta

### [B-201] IDEA-011: radar de cartera en riesgo, con sección en el admin y parte diario por Telegram
- Objetivo: Que develOP vea a diario qué clientes están en riesgo, con señales que no den falsos positivos. · Hallazgos que cierra: [IDEA-011]
- Archivos a tocar: src/lib/admin/cartera-riesgo.ts nuevo (señales por groupBy; regla pura con invariante); sección «En riesgo» en el módulo de KPIs del dashboard del admin; cron diario (netlify/functions y netlify.toml) con un solo digest de Telegram. · Archivos que NO se tocan: runPeriodicAgencyAlerts de src/lib/alerts.ts tal como está; detectBotIssues.ts (se usa como señal).
- Zona: libre
- Tamaño: M · Riesgo: Medio. Falsos positivos posibles: el login no se registra (FAL-001) y la facturación no tiene escritor (FAL-006). · Prerrequisitos: [B-108], [B-123], [B-14], [B-132]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Un cliente con el bot vendiendo y sin tickets no figura en riesgo (invariante); el parte de Telegram sale una vez por día; la sección se calcula con un número fijo de queries.
- Nodo(s): lib.alerts, int.cron.alerts, lib.chatbot.admin, lib.prisma, int.telegram, lib.plataforma.netlify, h4.adm-dashboard
- Worktree: wt/ideas-admin
- Estado: abierta

### [B-202] IDEA-012: checklist de onboarding operable desde la ficha del cliente, o retirar el catálogo huérfano
- Objetivo: Decidir el destino del catálogo de tareas de onboarding (reconectarlo como pestaña del admin con autochequeo, o retirarlo) y ejecutarlo. · Hallazgos que cierra: [IDEA-012], [DEU-018], [POD-001], [POD-292], [POD-308]
- Archivos a tocar: admin/clients/[clientId]/_components/tabs/OnboardingTab.tsx nuevo; src/actions/admin/onboarding-tasks.ts (Zod; ActionResult; un revalidatePath que exista); src/lib/onboarding/core.ts (siembra en onboardClientCore); seed-tasks-for-org.ts; src/lib/onboarding/auto-status.ts nuevo (puro); src/lib/data/onboarding-tasks.ts (títulos para el cliente); unificación con el ítem de attention.ts. Si se retira: borrar catálogo, siembras, actions y tarjeta. · Archivos que NO se tocan: src/lib/actions/invitations.ts y clients.ts (sus siembras se van con la poda); la consulta de OnboardingStatusCard a lib (DEU-029, tarjeta de a11y del portal).
- Zona: libre
- Tamaño: M · Riesgo: Medio. Si se retira, baja a S. Conviven clientes viejos sin tareas y nuevos sembrados; el autochequeo no da por conectada una credencial vencida. · Prerrequisitos: ninguno
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: La decisión queda registrada. Si se reconecta: un alta nueva siembra las tareas, el admin las avanza desde la pestaña, las conectadas se marcan solas (invariante de auto-status) y el cliente ve títulos para el cliente. Si se retira: el grep del catálogo da 0.
- Nodo(s): lib.actions, lib.componentes-dashboard, lib.onboarding, h4.adm-clientes, h1.auth-invite, h2.cli-inicio, h2.cli-inicio.estado-onboarding, lib.data
- Worktree: wt/ideas-admin
- Estado: abierta

### [B-203] IDEA-014: ventas de la tienda que vinieron del bot
- Objetivo: Mostrarle al dueño cuántas compras de su tienda hizo gente que antes habló con el bot. · Hallazgos que cierra: [IDEA-014]
- Archivos a tocar: src/lib/integrations/tiendanube.ts (tipo de orden con contact_email y contact_phone; también el mes anterior, sobre la paginación que agrega BUG-033); función pura de cruce lead↔orden con invariante; tarjeta «Compras confirmadas en tu tienda» en Inicio y en tienda-conectada. · Archivos que NO se tocan: prisma/schema.prisma.
- Zona: libre
- Tamaño: M · Riesgo: Medio. La tasa de cruce puede ser baja: mostrar «al menos N»; el corte del mes con fechas AR; nunca mostrar emails de compradores. · Prerrequisitos: [B-54]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: El invariante del cruce cubre email normalizado, teléfono por los últimos 8 dígitos y la ventana de 30 días entre meses; la tarjeta no muestra datos de compradores; el fetch pagina más allá de 200 órdenes.
- Nodo(s): int.tiendanube, lib.prisma, h2.cli-inicio
- Worktree: wt/ideas-portal
- Estado: abierta

### [B-204] IDEA-015: el bot ofrece turnos de la agenda del negocio (Cal.com)
- Objetivo: Que el bot de un cliente con Cal.com ofrezca reservar un turno, sin romper la agenda del setter. · Hallazgos que cierra: [IDEA-015]
- Archivos a tocar: Tool offer_booking con su tarjeta (v1: link con nombre y email precompletados); alta en Plan.tools con un script puntual; regla de prompt. · Archivos que NO se tocan: src/lib/leados/agenda.ts (anclarla a develOP es BUG-038, [B-32]); el escritor de calComUsername (FAL-004, [B-55]); createBooking desde el bot (v2, sin auth).
- Zona: libre
- Tamaño: S · Riesgo: Alto si se hace sin sus prerrequisitos: cargar el Cal.com de un cliente hoy rompe la agenda del setter (BUG-038) y la v1 de Cal.com está apagada (TEC-002). Se recortó a la parte del bot: lo de Franco y el escritor ya están en otras tarjetas. · Prerrequisitos: [B-21], [B-32], [B-55]
- Nivel de proceso: M · Modelo sugerido: Sonnet 5.5 · Esfuerzo: high · Ultracode: OFF
- Criterio de aceptación: Con dos orgs con calComUsername la agenda del setter sigue usando la de develOP (test:leados); un bot con Cal.com ofrece la tarjeta con el link precompletado y sin Cal.com no; el turno entra en stepCountIs(3).
- Nodo(s): lib.prisma, int.cal-com, lib.chatbot.tools, h3.vis-widget-cliente
- Worktree: wt/ideas-chatbot
- Estado: abierta

## Hallazgos sin tarjeta

Ninguno: todo hallazgo vigente está en una tarjeta.

## Controles del padre

- «Ciclo del Atlas: skill atlas-actualizar, hooks SessionStart/Stop y job de CI»: sin nodos del Atlas; se tomaron de las rutas de «Archivos a tocar»: lib.scripts
- B-96: prerrequisito «Acceso a L3: regla única de contraseña, tokens hasheados, redirect seguro y avis» → B-25 «Recupero e invitación: regla única de contraseña, tokens hasheados de un solo us» (parecido 0.33)
- B-98: prerrequisito «Inventario de vencimientos de credenciales y Sentry que de verdad recibe» → B-05 «Sentry que recibe en producción y sin ruta de prueba pública» (tabla del padre)
- B-98: prerrequisito «Widget embebido: origen del host contra allowedDomains y bot pausado coherente» → B-36 «Widget embebido: el host informa origen y ruta, y el servidor valida allowedDoma» (parecido 0.42)
- B-99: prerrequisito «Widget embebido: origen del host contra allowedDomains y bot pausado coherente» → B-36 «Widget embebido: el host informa origen y ruta, y el servidor valida allowedDoma» (parecido 0.42)
- B-114: prerrequisito «El plan como única fuente de cupo, modelo y funciones de IA» → B-47 «El plan y un registro único de modelos como fuente de cupo, modelo y funciones d» (parecido 0.71)
- B-115: prerrequisito «El plan como única fuente de cupo, modelo y funciones de IA» → B-47 «El plan y un registro único de modelos como fuente de cupo, modelo y funciones d» (parecido 0.71)
- B-120: prerrequisito «Turno del chat: respuestas largas truncadas y techo alineado a Netlify» → B-50 «Techo real de Netlify medido: chat y crons largos dentro del límite» (tabla del padre)
- B-121: prerrequisito «Renovar la credencial de Vertex y confirmar que el chatbot responde» → B-01 «Renovar la credencial de Vertex e inventariar el vencimiento de cada credencial» (parecido 0.38)
- B-123: prerrequisito «El plan como única fuente de cupo, modelo y funciones de IA» → B-47 «El plan y un registro único de modelos como fuente de cupo, modelo y funciones d» (parecido 0.71)
- B-125: prerrequisito «El plan como única fuente de cupo, modelo y funciones de IA» → B-47 «El plan y un registro único de modelos como fuente de cupo, modelo y funciones d» (parecido 0.71)
- B-126: prerrequisito «Alta y activación de bots: preflight en el servidor, KB sin placeholders y crede» → B-59 «Activación de bots solo con preflight en el servidor y KB sin plantillas sin edi» (parecido 0.36)
- B-137: prerrequisito «Alta e importación de prospectos: dedupe contra el sistema y CSV de Excel» → B-85 «Importación de prospectos: CSV de Excel en español» (parecido 0.38)
- B-146: prerrequisito «Widget embebido: origen del host contra allowedDomains y bot pausado coherente» → B-36 «Widget embebido: el host informa origen y ruta, y el servidor valida allowedDoma» (parecido 0.42)
- B-147: prerrequisito «Mi Chatbot: conversación visible y métricas reales» → B-62 «Mi Chatbot: el detalle del contacto con su conversación y métricas que salen de » (parecido 0.38)
- B-149: prerrequisito «Widget del cliente: respetar su configuración, avisar que es IA y no caerse por » → B-52 «Widget del cliente: su posición, color y nombre, aviso de IA con política y sin » (tabla del padre)
- B-151: prerrequisito «Widget del cliente: respetar su configuración, avisar que es IA y no caerse por » → B-52 «Widget del cliente: su posición, color y nombre, aviso de IA con política y sin » (tabla del padre)
- B-152: prerrequisito «Widget del cliente: respetar su configuración, avisar que es IA y no caerse por » → B-52 «Widget del cliente: su posición, color y nombre, aviso de IA con política y sin » (tabla del padre)
- B-156: prerrequisito «Acceso a L3: regla única de contraseña, tokens hasheados, redirect seguro y avis» → B-25 «Recupero e invitación: regla única de contraseña, tokens hasheados de un solo us» (parecido 0.33)
- B-162: prerrequisito «Inventario de vencimientos de credenciales y Sentry que de verdad recibe» → B-05 «Sentry que recibe en producción y sin ruta de prueba pública» (tabla del padre)
- B-167: prerrequisito «Alta y activación de bots: preflight en el servidor, KB sin placeholders y crede» → B-59 «Activación de bots solo con preflight en el servidor y KB sin plantillas sin edi» (parecido 0.36)
- B-192: prerrequisito «Avisos del chatbot al cliente: cupo, reporte semanal con baja e insights acciona» → B-48 «Aviso de cupo al dueño del bot: al 80 % y al degradarse» (tabla del padre)
- B-193: prerrequisito «Avisos del chatbot al cliente: cupo, reporte semanal con baja e insights acciona» → B-48 «Aviso de cupo al dueño del bot: al 80 % y al degradarse» (tabla del padre)
- B-200: prerrequisito «El plan como única fuente de cupo, modelo y funciones de IA» → B-47 «El plan y un registro único de modelos como fuente de cupo, modelo y funciones d» (parecido 0.71)
- B-204: prerrequisito «LeadOS: herramientas externas con link y agenda con org explícita» → B-86 «LeadOS: herramientas externas del recorrido con link y sin el «Chat de evaluació» (parecido 0.44)

## Correcciones de F7

La re-lectura de cierre (run `wf_1bc3c339-ad5`) encontró referencias a títulos del borrador que no existían, prerrequisitos y zonas que faltaban, criterios sin un N fijado y combinaciones de modelo que no seguían E12. Se corrigieron a mano en este archivo con `scripts/auditoria/f7-correcciones.mjs` (cada cambio en una tarjeta lleva «[F7 …]» con el código del problema, en `_crudo/f7-resultado.json`). Desde C24 la fuente es este archivo: `backlog-md.mjs` no se vuelve a correr.
