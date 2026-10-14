# 09 — Para Franco

> Hallazgos y estado de lo planeado en la zona de Franco (LeadOS: `src/lib/leados/`, `src/app/(protected)/setter/`, `admin/leados/`, `admin/leads/_actions/`, `admin/fg2-lab/`; además `src/auth.ts`, `src/lib/auth-cookies.ts`, `api/qa/login` y los modelos `OsLead*`/`ActivityChannel`). Esta corrida no toca nada de la zona: todo lo que sigue es para que lo tomes sin contexto. Plantilla por ítem: contexto en 2 líneas · evidencia · impacto · propuesta · cómo verificar · qué coordinación hace falta. También va acá el estado de cada bloque de `Bloques a Ejecutar/` (CHATBOT, DASHBOARD, OSLEAD) contra el código (DEC-35).

## Hallazgos

### SEC-006 · La invalidacion por sessionVersion se revive con POST /api/auth/session (trigger 'update' saltea el chequeo)
- Contexto: D1 · h1.auth-login.sesion-jwt, h1.auth-cambio.cambio-forzado, h1.auth-recupero.restablecer-password, lib.auth, modelo.User. ALTA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/auth.ts:215` — «if ( trigger !== 'signIn' && trigger !== 'update' &&»; `src/auth.ts:230` — «token.sessionVersion = accessState.sessionVersion»; `src/app/api/auth/[...nextauth]/route.ts:3` — «export const { GET, POST } = handlers»; librería @auth/core@0.41.2, lib/index.js línea 57 — «case "session": validateCSRF(action, csrfTokenVerified); return await actions.session(options, sessionStore, cookies, true, request.body?.data);»; librería @auth/core@0.41.2, lib/actions/session.js línea 30 — «...(isUpdate && { trigger: "update" }),»
- Impacto: Si alguien obtiene la cookie de sesion de un cliente (PC compartida, malware, cookie filtrada), que el cliente cambie o restablezca la contrasena NO lo echa: con la cookie vieja, GET /api/auth/csrf + POST /api/auth/session (double-submit, sin conocer la contrasena) dispara el callback jwt con trigger 'update', que saltea la comparacion y re-firma el token con la sessionVersion nueva. SEC-AUTH-03 queda cerrado solo contra reuso pasivo.
- Propuesta: Decision para Valentino (auth.ts FROZEN + ZONA-FRANCO): comparar sessionVersion tambien en trigger 'update' (antes de refrescar) y hacer que las actions que suben la version emitan el token nuevo por un camino que no dependa de saltear el chequeo (p. ej. pasar la version nueva en el payload de unstable_update y aceptarla solo si coincide con la DB, o re-loguear tras el cambio). Sumar la prueba multi-dispositivo de PLAN-006.
- Cómo verificar: VH-005 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-006 en 03-MEJORAS.md

### BUG-003 · El envio del magic link nunca falla: sendVerificationRequest ignora el resultado de Brevo y la UI muestra exito
- Contexto: D1 · h1.auth-login.magic-link, int.brevo, int.sentry, lib.auth. MEDIA, PROBABLE.
- Evidencia: `src/auth.ts:104` — «await sendTransactionalEmail({»; `src/lib/email/brevo-service.ts:20` — «if (!process.env.BREVO_API_KEY) { console.error('[Brevo] BREVO_API_KEY no configurada') return { ok: false, error: 'EMAIL_NOT_CONFIGURED' }»; `src/lib/email/brevo-service.ts:40` — «} catch (error) { console.error('[Brevo] Error sending email:', error)»; librería @getbrevo/brevo@5.0.4, dist/cjs/core/fetcher/requestWithRetries.js línea 15 — «const DEFAULT_MAX_RETRIES = 2;»
- Impacto: Sin BREVO_API_KEY, con Brevo caido o remitente no verificado, el cliente ve 'Link generado' y nunca recibe nada; no queda rastro en Sentry (solo console.error). El SDK espera hasta 60 s por intento con 2 reintentos, dejando el submit colgado hasta el timeout de la funcion (RESIL-05 parcial).
- Propuesta: Decision para Valentino (auth.ts FROZEN + ZONA-FRANCO): lanzar cuando result.ok es false para que Auth.js devuelva error (PLAN-017). En brevo-service.ts (libre) pasar timeoutInSeconds/maxRetries cortos y Sentry.captureException en el catch.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: una parte del arreglo cae fuera de la zona (ver Propuesta, «libre»): coordinar con Valentino quién la hace
- Ficha completa: BUG-003 en 03-MEJORAS.md

### BUG-006 · Una falla de la base en el callback jwt se trata como 'sin sesión': rebote /login <-> portal en vez de pantalla de error, y unstable_update borra la cookie
- Contexto: D1 · lib.auth, lib.proxy, h2.cli-shell, h4.adm-shell, h1.auth-cambio, lib.prisma, int.sentry. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/auth.ts:207` — «const shouldRefreshFromDb = Boolean(userId) && (trigger === 'update' || trigger === 'signIn' || !user)»; `src/auth.ts:209` — «if (userId && shouldRefreshFromDb) { const accessState = await getUserAccessState(userId)»; librería @auth/core@0.41.2, lib/actions/session.js línea 58 — «catch (e) { logger.error(new JWTSessionError(e));»; librería @auth/core@0.41.2, lib/actions/session.js línea 61 — «response.cookies?.push(...sessionStore.clean());»; librería next-auth@5.0.0-beta.31, lib/index.js línea 48 — «return getSession(_headers, _config).then((r) => r.json());»; librería next-auth@5.0.0-beta.31, lib/actions.js línea 83 — «for (const c of res?.cookies ?? []) cookieJar.set(c.name, c.value, c.options);»; `src/app/(protected)/dashboard/layout.tsx:90` — «if (!organizationId) { redirect(session?.user?.role === 'SUPER_ADMIN' ? '/admin/clients' : '/login')»; `src/app/(protected)/admin/layout.tsx:43` — «if (!session?.user) { redirect('/login')»; `src/proxy.ts:143` — «return NextResponse.redirect( new URL(onboardingCompleted ? DASHBOARD_PATH : ONBOARDING_PATH, nextUrl)»; `src/app/(protected)/dashboard/_actions/business-profile.actions.ts:26` — «if (!organizationId) return { ok: false, error: 'Tu sesión expiró. Volvé a entrar.' }»; `src/app/cambiar-password/actions.ts:73` — «await unstable_update({ user: { passwordResetRequired: false } })»
- Impacto: Bloqueante para L3 del portal ante cualquier hipo de Neon (despertar en frío, timeout del pool). Cada auth() en Node consulta la base (getUserAccessState) y el callback no distingue 'base caída' de 'sesión inválida': Auth.js atrapa el error, lo imprime en consola y devuelve sesión nula. Los layouts de dashboard, admin y setter mandan a /login; el proxy, que no consulta la base, ve la cookie válida y devuelve al portal. Resultado: rebotes mientras dure la falla y ERR_TOO_MANY_REDIRECTS si persiste, en vez de error.tsx con 'Reintentar'. Las server actions responden 'Tu sesión expiró', 'Sesión inválida' o 'No autenticado' sin que la sesión haya vencido. Si la falla cae en el unstable_update posterior a cambiar la contraseña (cambiar-password y Mi Cuenta), Auth.js borra la cookie: el cliente queda deslogueado justo después de un cambio exitoso. Nada llega a Sentry: develOP no ve la caída ni su efecto.
- Propuesta: Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO): envolver getUserAccessState del callback jwt en try/catch; ante error de infraestructura, capturar en Sentry y devolver el token marcado (p. ej. token.error = 'db_unavailable') en vez de dejar que Auth.js lo convierta en sesión nula. Exponer la marca en la sesión y que los layouts (zona libre) lancen un error real (error.tsx con reintento) en vez de redirect('/login'). Alternativa: conservar los claims del token durante la caída (sin chequeo de sessionVersion) con alerta. Configurar logger.error de NextAuth hacia Sentry (ver el FAL de este ciclo).
- Cómo verificar: VH-018 en 08-VERIFICACION-HUMANA.md
- Coordinación: una parte del arreglo cae fuera de la zona (ver Propuesta, «libre»): coordinar con Valentino quién la hace
- Ficha completa: BUG-006 en 03-MEJORAS.md

### BUG-007 · El magic link se gasta en el primer GET: un escáner de enlaces del correo lo consume antes que el cliente
- Contexto: D1 · h1.auth-login, h1.auth-login.magic-link, lib.auth, modelo.VerificationToken, int.brevo. MEDIA, PROBABLE.
- Evidencia: librería @auth/core@0.41.2, lib/actions/signin/send-token.js línea 52 — «url: '${baseUrl}/callback/${provider.id}?${new URLSearchParams({»; librería @auth/core@0.41.2, lib/actions/callback/index.js línea 141 — «const invite = await adapter.useVerificationToken({»; librería @auth/core@0.41.2, lib/actions/callback/index.js línea 153 — «if (invalidInvite) throw new Verification({ hasInvite, expired });»; `src/auth.ts:95` — «pages: { signIn: LOGIN_PATH },»; `src/auth.ts:113` — «<a href="${url}"»; `src/app/reset-password/actions.ts:80` — «prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() },»
- Impacto: El enlace del email apunta directo a GET /api/auth/callback/resend, que borra el token de un solo uso en el primer pedido (useVerificationToken), sin interacción. Los filtros de correo que abren los links para analizarlos (Microsoft 365 Safe Links/Defender, Mimecast, Proofpoint, algunos antivirus) lo consumen antes que la persona. Cuando el cliente hace clic, Auth.js lanza Verification y muestra su página de error en inglés (UX-002). Para un primer cliente con correo corporativo el magic link no funciona nunca y no hay explicación. El reset de contraseña no tiene el problema: /reset-password solo consume el token al enviar el formulario (POST). Eslabón inferido: el comportamiento del escáner del proveedor de correo.
- Propuesta: Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO): que sendVerificationRequest mande un link a una página propia de confirmación (zona libre, p. ej. /login/confirmar) con un botón que recién ahí siga al callback, o reemplazar el link por un código de un solo uso. Configurar pages.error/verifyRequest con texto en español (ver UX-002).
- Cómo verificar: VH-021 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-007 en 03-MEJORAS.md

### FAL-003 · Los errores de autenticación no llegan a Sentry: NextAuth sin logger y loginAction convierte todo AuthError en 'error inesperado' (y lo cuenta como intento fallido)
- Contexto: D1 · h1.auth-login, h1.auth-login.password, h1.auth-login.magic-link, lib.auth, int.sentry. MEDIA, PROBABLE.
- Evidencia: `src/auth.ts:76` — «const nextAuthResult = NextAuth({ adapter: PrismaAdapter(prisma) as Adapter, trustHost: true,»; librería @auth/core@0.41.2, lib/utils/logger.js línea 7 — «error(error) { const name = error instanceof AuthError ? error.type : error.name; console.error('${red}[auth][error]${reset} ${name}: ${error.message}');»; librería @auth/core@0.41.2, lib/actions/callback/index.js línea 388 — «const error = new CallbackRouteError(e, { provider: provider.id });»; `src/app/login/actions.ts:113` — «if (error instanceof AuthError) { recordFailedAttempt(ip)»; `src/app/login/actions.ts:122` — «return 'Ocurrió un error inesperado. Intentá de nuevo.'»; `src/app/login/actions.ts:153` — «if (error instanceof AuthError) { return 'No se pudo generar el Magic Link. Intentá de nuevo.'»; `src/instrumentation.ts:49` — «export const onRequestError = Sentry.captureRequestError»
- Impacto: Auth.js atrapa sus errores internos (base caída en authorize o en los callbacks, que llegan como CallbackRouteError o AccessDenied; AdapterError al crear el token del magic link; JWTSessionError; errores de OAuth) y solo los imprime con console.error. La config no define logger ni events y no hay captureConsoleIntegration. Lo que sí llega a las actions se devuelve como texto, y onRequestError solo ve errores que se lanzan. Para el primer cliente real: si el login se rompe por la plataforma, cada intento dice 'Ocurrió un error inesperado' o 'No se pudo generar el Magic Link' y develOP se entera cuando el cliente llama. Además loginAction cuenta esas fallas del servidor como intentos fallidos: con 5 seguidas el cliente queda bloqueado 5 minutos ('Demasiados intentos fallidos') aunque nunca se equivocó.
- Propuesta: Zona libre en login/actions.ts: capturar en Sentry los AuthError que no sean CredentialsSignin (ni el AccessDenied esperado del magic link) y no llamar a recordFailedAttempt para ellos. Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO): logger.error de NextAuth que envíe a Sentry (el scrub de PII ya corre en beforeSend).
- Cómo verificar: VH-023 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: FAL-003 en 02-PENDIENTE.md

### SEC-024 · /api/qa/login confía en el header Host y los scripts QA escuchan en toda la red: cualquiera en la misma LAN obtiene una sesión SUPER_ADMIN
- Contexto: D1 · h1.auth-login, h1.auth-login.qa-login, lib.auth. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/api/qa/login/route.ts:54` — «const host = request.headers.get('host') ?? ''»; `src/app/api/qa/login/route.ts:61` — «if (!isLocalhost) { return { allowed: false, reason: 'host_not_localhost' }»; `package.json:8` — «"dev:qa": "cross-env QA_ALLOW_LOCALHOST=1 next dev --webpack -p 3002",»; `package.json:11` — «"start:qa": "npm run build && cross-env QA_ALLOW_LOCALHOST=1 next start -p 3001",»; librería next@16.2.9, dist/cli/next-start.js línea 72 — «const hostname = options.hostname;»; librería next@16.2.9, dist/server/lib/start-server.js línea 267 — «server.listen(port, hostname);»
- Impacto: La 'triple guarda' (route.ts:14-23) queda reducida a la variable QA_ALLOW_LOCALHOST, que los cuatro scripts QA encienden: el Host lo escribe el cliente y la guarda de hosting no aplica en una PC. dev:qa, start:qa, start:setter y start:galeria no pasan -H, así que Next llama server.listen(port, undefined), escucha en todas las interfaces e imprime la URL 'Network'. Un tercero en la misma red (cowork, bar, oficina) hace POST http://<IP>:3002/api/qa/login con 'Host: localhost' y {persona:'super-admin'}. Recibe un JWT de SUPER_ADMIN firmado con el AUTH_SECRET local y válido 8 h, que usa contra ese servidor: panel admin completo y escritura sobre la base del .env local, que según el PROMPT §3 es la Neon compartida. Además, ese servidor expuesto corre en Windows con next 16.2.9, que tiene un advisory crítico de RCE para servidores Windows (la versión la evalúa D8).
- Propuesta: Coordinar con Franco (ZONA-FRANCO):
1. Agregar -H 127.0.0.1 a dev:qa, start:qa, start:setter y start:galeria, y evaluar lo mismo para dev.
2. En la route, no usar Host como guarda: exigir además un secreto por corrida (header con un QA_LOGIN_TOKEN aleatorio que solo conoce el runner de visual-qa).
3. Responder 404 genérico sin reason (SEC-021).
- Cómo verificar: VH-014 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-024 en 03-MEJORAS.md

### BUG-005 · Org primaria no deterministica: orgMemberships take:1 sin orderBy en cada auth()
- Contexto: D1 · lib.auth, modelo.OrgMember. BAJA, PROBABLE.
- Evidencia: `src/auth.ts:37` — «take: 1,»; `src/app/login/actions.ts:94` — «take: 1,»; `prisma/schema.prisma:530` — «@@unique([userId, organizationId])»
- Impacto: Latente: el schema permite varias membresias por usuario; si un usuario pertenece a dos orgs, cada auth() (que refresca de la DB) puede resolver una org distinta y el usuario ve/escribe en la que Postgres devuelva primero.
- Propuesta: Decision para Valentino (auth.ts FROZEN): orderBy explicito (joinedAt) o selector de org activa; mismo cambio en login/actions.ts:88-95 y qa/login/route.ts:118-127.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-005 en 03-MEJORAS.md

### DEU-002 · auth.ts: codigo muerto y estado sin usar (getPostLoginPath, userExists): un usuario borrado conserva sesion ORG_MEMBER
- Contexto: D1 · lib.auth, h1.auth-login.sesion-jwt. BAJA, PROBABLE.
- Evidencia: `src/auth.ts:65` — «function getPostLoginPath(state: {»; `src/auth.ts:61` — «userExists: Boolean(dbUser),»; `src/auth.ts:44` — «const role = dbUser?.role ?? ('ORG_MEMBER' as Role)»
- Impacto: getPostLoginPath (y ADMIN_PATH/DASHBOARD_PATH/ONBOARDING_PATH :15-17) no tienen callers (PLAN-018). userExists se calcula y nunca se lee: un usuario borrado conserva una sesion con rol ORG_MEMBER por defecto y sin org (sessionVersion undefined no invalida, :219) hasta que expire; hoy sin datos expuestos, pero cualquier handler que solo pida 'sesion' lo deja pasar y el portal entra en el bucle de redirecciones.
- Propuesta: Decision para Valentino (FROZEN + ZONA-FRANCO): devolver null en jwt cuando !userExists y borrar getPostLoginPath con sus constantes.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-002 en 03-MEJORAS.md

### FAL-001 · Los inicios de sesión no dejan rastro: no hay events en auth.ts ni tipo LOGIN en AuditActionType
- Contexto: D1 · h1.auth-login, lib.auth, h4.adm-audit, modelo.AdminAuditLog. BAJA, PROBABLE.
- Evidencia: `src/auth.ts:173` — «callbacks: {»; `prisma/schema.prisma:190` — «enum AuditActionType {»; `prisma/schema.prisma:211` — «PASSWORD_CHANGED»; `src/app/login/actions.ts:113` — «if (error instanceof AuthError) { recordFailedAttempt(ip)»
- Impacto: Una toma de la cuenta SUPER_ADMIN (fuerza bruta de SEC-007, magic link a un buzón comprometido) o de un cliente no deja registro de cuándo ni desde dónde se entró. Los fallos solo suman a un Map en memoria y los éxitos no se guardan en ningún lado. develOP no puede detectar ni reconstruir un acceso indebido. Además, el 'registro de accesos' que se le muestra al cliente en la Bóveda es inventado (PLAN-032).
- Propuesta: Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO; el schema es FROZEN, migración sin reset). Opción: events.signIn/signOut en auth.ts que escriban en AdminAuditLog con tipos nuevos (LOGIN_SUCCEEDED/LOGIN_FAILED) o en una tabla propia. Como mínimo para SUPER_ADMIN y con la IP confiable.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: FAL-001 en 02-PENDIENTE.md

### SEC-021 · /api/qa/login revela en el 403 cual guarda fallo
- Contexto: D1 · h1.auth-login, lib.auth. BAJA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/api/qa/login/route.ts:87` — «return NextResponse.json({ error: 'forbidden', reason: guard.reason }, { status: 403 })»; `src/app/api/qa/login/route.ts:50` — «if (process.env.QA_ALLOW_LOCALHOST !== '1') { return { allowed: false, reason: 'qa_flag_off' }»
- Impacto: Un sondeo anonimo en produccion sabe si QA_ALLOW_LOCALHOST esta activa; la guarda 3 (:65-70) depende de que NETLIFY/VERCEL_ENV existan en runtime. Bajo: las tres guardas siguen cerrando (Host localhost no es alcanzable por la CDN).
- Propuesta: Coordinar con Franco: 404 generico sin reason fuera de localhost.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-021 en 03-MEJORAS.md

## Bloques a ejecutar: estado contra el código
