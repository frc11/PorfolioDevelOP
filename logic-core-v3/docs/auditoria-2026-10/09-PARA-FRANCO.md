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

### SEC-021 · /api/qa/login revela en el 403 cual guarda fallo
- Contexto: D1 · h1.auth-login, lib.auth. BAJA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/api/qa/login/route.ts:87` — «return NextResponse.json({ error: 'forbidden', reason: guard.reason }, { status: 403 })»; `src/app/api/qa/login/route.ts:50` — «if (process.env.QA_ALLOW_LOCALHOST !== '1') { return { allowed: false, reason: 'qa_flag_off' }»
- Impacto: Un sondeo anonimo en produccion sabe si QA_ALLOW_LOCALHOST esta activa; la guarda 3 (:65-70) depende de que NETLIFY/VERCEL_ENV existan en runtime. Bajo: las tres guardas siguen cerrando (Host localhost no es alcanzable por la CDN).
- Propuesta: Coordinar con Franco: 404 generico sin reason fuera de localhost.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-021 en 03-MEJORAS.md

## Bloques a ejecutar: estado contra el código
