# 03 — Mejoras

> Seguridad · bugs latentes · tecnología vieja · rendimiento · deuda · calidad · observabilidad · accesibilidad, más una sección final ZONA-FRANCO. Formato de hallazgo: PROMPT §5.1 + la línea `Nodo(s)` (ENMIENDA-01 E7). IDs `PREFIJO-NNN` globales por prefijo, nunca reutilizados (DEC-24). Severidad y confianza con la rúbrica DEC-23; no hay clientes reales, así que el impacto se redacta como «bloqueante para el primer cliente real». `REQUIERE-VERIFICACIÓN-HUMANA` es una marca aparte con su `VH-NNN` de `08`. Las MEDIA y BAJA quedan `PROBABLE` salvo las que el padre leyó (DEC-37). Ningún valor de secret aparece en este documento. Rutas relativas a `logic-core-v3/`. Generado por `scripts/auditoria/hallazgos-md.mjs` desde `_crudo/hallazgos.json`.

## Seguridad

### [SEC-005] Magic link sin rate limit: un anonimo dispara emails ilimitados por Brevo a cualquier cuenta registrada
- Dominio: D1  ·  Severidad: CRÍTICA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/login/actions.ts:135` — «export async function magicLinkAction(»; `src/app/login/actions.ts:146` — «await signIn('resend', { email, redirectTo: '/dashboard',»; `src/auth.ts:101` — «async sendVerificationRequest({ identifier: email, url }) {»; `src/auth.ts:104` — «await sendTransactionalEmail({»; `src/app/api/auth/[...nextauth]/route.ts:3` — «export const { GET, POST } = handlers»; `src/lib/rate-limit/presets.ts:8` — «export const RATE_LIMIT_PRESETS = { // ── Auth ── forgotPasswordPerIp: { limit: 5, windowMs: 15 * 60_000 },»
- Impacto: Bloqueante para el primer cliente real: cualquiera puede pedir magic links sin limite para su email, por la action o directo por POST /api/auth/signin/resend (CSRF de /api/auth/csrf). El cliente recibe rafagas de 'Tu acceso a develOP' y la cuenta Brevo compartida gasta cuota y reputacion; si Brevo limita o suspende, dejan de salir resets, bienvenidas y avisos de leads. Por la rubrica (operacion con costo de emails, anonima, sin limite) es CRITICA aunque solo alcance emails registrados, que ademas se enumeran con el mismo endpoint.
- Propuesta: Agregar presets magicLinkPerIp/magicLinkPerEmail en presets.ts y aplicarlos con applyAuthRateLimit en magicLinkAction; envolver handlers.POST en route.ts para aplicar el mismo limite a /api/auth/signin/resend (o sumar /api/auth al matcher del proxy). Responder igual con o sin limite para no abrir otro oraculo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.magic-link, int.brevo, lib.rate-limit, lib.auth

### [SEC-007] Fuerza bruta de login sin freno real: el limite vive solo en loginAction (memoria por lambda) y el endpoint nativo de Credentials no tiene ninguno
- Dominio: D1  ·  Severidad: ALTA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/login/actions.ts:20` — «const rateLimitMap = new Map<string, RateEntry>()»; `src/app/login/actions.ts:53` — «hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??»; `src/app/login/actions.ts:113` — «if (error instanceof AuthError) { recordFailedAttempt(ip)»; `src/app/api/auth/[...nextauth]/route.ts:3` — «export const { GET, POST } = handlers»; librería @auth/core@0.41.2, lib/index.js línea 51 — «case "callback": if (options.provider.type === "credentials") validateCSRF(action, csrfTokenVerified);»; `src/auth.ts:157` — «const isValid = await bcrypt.compare(String(credentials.password), user.password)»
- Impacto: Un anonimo puede probar contrasenas sin limite contra cualquier cuenta (incluido el SUPER_ADMIN) por POST /api/auth/callback/credentials con el CSRF de /api/auth/csrf; ni siquiera por loginAction hay freno real: el Map es por instancia serverless, se pierde en cada lambda fria, se indexa por el primer X-Forwarded-For y cualquier redirect limpia el contador (actions.ts:125-127). Las contrasenas de reset/accept-invite solo exigen 8 caracteres y las temporales tienen ~34 bits.
- Propuesta: (libre) Reemplazar el Map por applyAuthRateLimit (limiter.ts, DB) por IP y por email; aplicar el mismo limite a /api/auth/callback/credentials envolviendo handlers.POST en route.ts (o sumando /api/auth al matcher del proxy); tomar la IP del header confiable de la plataforma (x-nf-client-connection-ip en Netlify).
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.login-password, lib.rate-limit, lib.auth, modelo.User
- REQUIERE-VERIFICACIÓN-HUMANA: VH-007

### [SEC-023] Las páginas de /admin exigen SUPER_ADMIN solo en el layout y en el proxy: un token invalidado, degradado o de un admin borrado sigue leyendo datos de todos los clientes por navegación RSC
- Dominio: D1  ·  Severidad: ALTA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/proxy.ts:148` — «if (isAdminRoute && role !== ADMIN_ROLE) {»; `src/auth.config.ts:24` — «callbacks: { authorized({ auth }) { return true // Route protection is handled in middleware logic»; `src/app/(protected)/admin/layout.tsx:47` — «if (session.user.role !== 'SUPER_ADMIN') { redirect('/dashboard')»; librería next@16.2.9, dist/server/app-render/app-render.js línea 164 — «const flightRouterState = shouldProvideFlightRouterState ? (0, _parseandvalidateflightrouterstate.parseAndValidateFlightRouterState)(headers[_approuterheaders.NEXT_ROUTER_STATE_TREE_HEADER]) : undefined;»; librería next@16.2.9, dist/server/app-render/walk-tree-with-flight-router-state.js línea 53 — «const renderComponentsOnThisLevel = // No further router state available !flightRouterState || // Segment in router state does not match current segment !(0, _matchsegments.matchSegment)(actualSegment, flightRouterState[»; `src/app/(protected)/admin/team/page.tsx:19` — «const users = await prisma.user.findMany({»; `src/app/(protected)/admin/referrals/page.tsx:9` — «const referrals = await prisma.referral.findMany({»; `src/app/(protected)/admin/page.tsx:182` — «prisma.agencySettings.findFirst({»
- Impacto: Bloqueante para el primer cliente real. Escenario: se filtra la cookie del SUPER_ADMIN (PC compartida, malware, extensión) y develOP reacciona cambiando la contraseña. El corte por sessionVersion no llega al panel. El proxy decide /admin con el rol del JWT (auth.config.ts no tiene callback jwt ni mira sessionVersion) y re-firma la cookie por 30 días (SEC-010). En un pedido RSC con el árbol del layout ya montado, Next no ejecuta admin/layout.tsx y renderiza solo la página. Es lo que manda el router en cada clic, o un curl con Next-Router-State-Tree. Hay 15 páginas de /admin que consultan Prisma sin auth() propio:
- admin (KPIs y cobros)
- team (usuarios admin)
- referrals (emails de referidos de todos los clientes)
- projects, projects/[id]/payments y projects/[id]/tasks
- leads y leads/[leadId]
- messages/[orgId] (nombre de la org)
- announcements
- chatbot/activity
- leados, leados/[leadId] y leados/setter/[setterId]
- fg2-lab
Lo mismo vale para un admin degradado o borrado (DEU-002), y para la pestaña de otro dispositivo que sigue navegando por clics después del cambio de contraseña. Las mutaciones sí fallan porque las actions llaman requireSuperAdmin. Contraste: /setter carga sus datos con requireSetter en _data.ts y el portal con resolveOrgId, que releen la base.
- Propuesta: Zona libre, salvo admin/leados/* y fg2-lab, que son ZONA-FRANCO (coordinar con Franco). Mover la autorización al lado del dato: un helper cacheado requireSuperAdminPage() (auth() fresco + rol, y si no pasa redirect/notFound) que se llame al inicio de cada page.tsx de /admin o dentro de sus funciones de datos, como ya hace /setter. Sumar un invariante que falle si una page de /admin no lo llama. El layout queda como UX, no como frontera.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-shell, h4.adm-dashboard, h4.adm-equipo, h4.adm-referidos, h4.adm-proyectos, h4.adm-leads, h4.adm-mensajes, h4.adm-novedades, h3.adm-actividad, h5.adm-revision-demos, h5.adm-fg2lab, lib.proxy, lib.auth
- REQUIERE-VERIFICACIÓN-HUMANA: VH-013

### [SEC-009] Enumeracion de usuarios: el magic link responde distinto si el email existe (y el login/forgot delatan por tiempo y por 'error inesperado')
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/auth.ts:181` — «const existingUser = await prisma.user.findUnique({»; librería @auth/core@0.41.2, lib/actions/signin/send-token.js línea 33 — «throw new AccessDenied("AccessDenied");»; `src/app/login/actions.ts:151` — «return 'SUCCESS'»; `src/app/login/actions.ts:154` — «return 'No se pudo generar el Magic Link. Intentá de nuevo.'»; `src/auth.ts:152` — «if (!user?.password) return null if (!user.emailVerified) { throw new Error('EMAIL_NOT_VERIFIED')»; `src/app/login/actions.ts:119` — «if ((error.cause as { message?: string })?.message === 'EMAIL_NOT_VERIFIED') {»; `src/app/forgot-password/actions.ts:96` — «const result = await sendTransactionalEmail({»
- Impacto: Un anonimo confirma sin limite que emails son clientes de develOP (y cuales son admin), anulando el trabajo anti-enumeracion de forgot-password y alimentando el bombardeo de magic links y la fuerza bruta. Ademas: login sin bcrypt dummy para usuarios inexistentes (diferencia de tiempo); la rama EMAIL_NOT_VERIFIED nunca matchea porque Auth.js envuelve el error en CallbackRouteError con cause {err} (callback/index.js:388) y devuelve 'Ocurrio un error inesperado' antes de chequear la contrasena; forgot-password espera a Brevo solo si el usuario existe.
- Propuesta: (libre) magicLinkAction debe devolver el mismo exito ante AccessDenied (mensaje 'si la cuenta existe...'); en forgot-password, no esperar el envio en el camino de la respuesta o igualar el tiempo. Decision para Valentino (auth.ts FROZEN): bcrypt dummy cuando no hay usuario y chequear emailVerified despues del bcrypt.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.magic-link, h1.auth-login.login-password, h1.auth-recupero.solicitar-enlace, lib.auth

### [SEC-010] La sesion vive 30 dias deslizantes, no 8 h: el proxy re-firma la cookie con el maxAge por defecto de Auth.js
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/auth.ts:79` — «session: { strategy: 'jwt', maxAge: 8 * 60 * 60,»; `src/auth.config.ts:12` — «session: { strategy: 'jwt' },»; librería @auth/core@0.41.2, lib/init.js línea 38 — «const maxAge = 30 * 24 * 60 * 60; // Sessions expire after 30 days of being idle by default»; librería @auth/core@0.41.2, lib/actions/session.js línea 46 — «const newToken = await jwt.encode({ ...jwt, token, salt });»; librería next-auth@5.0.0-beta.31, lib/index.js línea 169 — «finalResponse.headers.append("set-cookie", cookie);»
- Impacto: Cada visita a /dashboard, /admin, /setter, /login, /bienvenida o /cambiar-password re-emite el JWT con exp y cookie a 30 dias (auth() de paginas no escribe cookies). Una sesion olvidada en una PC compartida o una cookie robada sigue sirviendo hasta 30 dias sin uso en vez de 8 h; la politica declarada (bitacora-roadmap:6334 'JWT (8 h)') no se cumple.
- Propuesta: (libre) Fijar session.maxAge y updateAge en auth.config.ts iguales a auth.ts (idealmente constante compartida, p. ej. junto a auth-cookies.ts).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.sesion-jwt, lib.proxy, lib.auth
- REQUIERE-VERIFICACIÓN-HUMANA: VH-009

### [SEC-011] Open redirect en el proxy: callbackUrl con barra invertida o tab pasa isSafeCallbackUrl
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/proxy.ts:19` — «return Boolean(value && value.startsWith('/') && !value.startsWith('//'))»; `src/proxy.ts:135` — «if (isSafeCallbackUrl(callbackUrl) && callbackUrl !== LOGIN_PATH) { return NextResponse.redirect(new URL(callbackUrl as string, nextUrl))»
- Impacto: Un link https://develop.com.ar/login?callbackUrl=/%5Cevil.com enviado a un cliente logueado lo manda a https://evil.com: el parser WHATWG trata la barra invertida como '/' en http(s) y elimina tabs (/%09/evil.com). Phishing con dominio legitimo ('tu sesion vencio, ingresa de nuevo'). El eslabon inferido es el parser de URL en runtime.
- Propuesta: (libre) Resolver con new URL(callbackUrl, nextUrl) y exigir url.origin === nextUrl.origin antes de redirigir (o rechazar barra invertida y caracteres de control).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.ruteo-por-rol, lib.proxy
- REQUIERE-VERIFICACIÓN-HUMANA: VH-011

### [SEC-012] La regla unica de contrasena (8+mayuscula+numero) no se aplica en reset-password ni en accept-invite
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/schemas.ts:94` — «password: z .string() .min(8, 'La contraseña debe tener al menos 8 caracteres.')»; `src/app/accept-invite/actions.ts:26` — «if (!password || password.length < 8) {»; `src/app/reset-password/ResetPasswordForm.tsx:193` — «placeholder="Mínimo 8 caracteres"»; `src/app/cambiar-password/actions.ts:17` — «.regex(/[A-Z]/, 'La nueva contraseña debe incluir al menos una mayúscula.')»
- Impacto: Un cliente que se olvida la contrasena puede elegir 'aaaaaaaa' y un usuario invitado (las invitaciones de equipo eran SUPER_ADMIN) tambien; contradice la decision de una sola regla (PLAN-003) y abarata la fuerza bruta. accept-invite ademas valida a mano con casts 'as string', sin Zod.
- Propuesta: (libre) Extraer un passwordSchema compartido en schemas.ts y usarlo en ResetPasswordSchema, en accept-invite (con Zod) y en CambiarPasswordSchema/UpdatePasswordSchema; espejar checkStrength en ResetPasswordForm y AcceptInviteForm.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-recupero.restablecer-password, h1.auth-invite.aceptar-invitacion, lib.actions

### [SEC-013] Tokens de reset e invitacion guardados en claro; consumo no atomico y los demas tokens siguen vivos tras el reset
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/forgot-password/actions.ts:73` — «const token = crypto.randomBytes(32).toString('hex')»; `src/app/forgot-password/actions.ts:81` — «data: { token, userId: user.id, expiresAt },»; `src/app/reset-password/actions.ts:45` — «const record = await prisma.passwordResetToken.findUnique({ where: { token },»; `src/app/reset-password/actions.ts:80` — «prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() },»; librería @auth/core@0.41.2, lib/actions/signin/send-token.js línea 63 — «token: await createHash('${token}${secret}'),»
- Impacto: Quien lea la tabla PasswordResetToken (backup, Neon compartida, logs) puede usar cualquier token vigente (45 min reset, 7 dias invitacion) y fijar la contrasena de esa cuenta; Auth.js si hashea el token del magic link, el reset propio no. Dos envios simultaneos del mismo token pasan ambos (check-then-update) y tras un reset exitoso no se borran otros tokens pendientes.
- Propuesta: (libre) Guardar sha256(token) y buscar por hash; consumir con updateMany({ where: { id, usedAt: null } }) verificando count; al resetear, borrar los demas tokens sin usar del usuario.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-recupero.restablecer-password, h1.auth-invite.aceptar-invitacion, modelo.PasswordResetToken

### [SEC-014] Archivar un cliente no le corta el acceso: login, sesion y portal siguen operativos
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/archiveClient.ts:9` — «// Archivar = soft-delete REVERSIBLE. Marca SOLO el Organization (deletedAt); NO»; `src/modules/chatbot/server/admin/archiveClient.ts:34` — «(c) => c.organization.update({ where: { id: org.id }, data: { deletedAt: new Date() } }),»; `src/auth.ts:31` — «select: { companyName: true, onboardingCompleted: true,»; `src/lib/preview.ts:10` — «if (role === 'ORG_MEMBER') { return session?.user?.organizationId ?? null»; `src/app/(protected)/dashboard/layout.tsx:23` — «select: { companyName: true, onboardingCompleted: true },»
- Impacto: Si 'archivar' se usa para dar de baja a un cliente (falta de pago, fin de contrato), sus usuarios siguen entrando y operando el portal; ningun punto de auth ni del portal lee deletedAt (git grep). Depende de la intencion del producto.
- Propuesta: Decidir que significa archivar. Si debe cortar acceso: chequear organization.deletedAt en resolveOrgId (preview.ts, libre) con mensaje claro, y en getUserAccessState/signIn (auth.ts, decision para Valentino).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.sesion-jwt, h4.adm-clientes, lib.auth, modelo.Organization
- REQUIERE-VERIFICACIÓN-HUMANA: VH-012

### [SEC-015] Cambio de contrasena sin limite de intentos sobre la contrasena actual
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/cambiar-password/actions.ts:44` — «const isValid = await bcrypt.compare(input.oldPassword, user.password)»; `src/lib/actions/profile.ts:218` — «const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password)»; `src/app/cambiar-password/actions.ts:49` — «const newHash = await bcrypt.hash(input.newPassword, 10)»
- Impacto: Con una sesion robada (precondicion fuerte), un atacante prueba la contrasena actual sin freno y, al acertar, la cambia: el sessionVersion+1 desloguea a la victima de todos sus dispositivos (toma de cuenta persistente). Ademas el costo de bcrypt difiere (10 aca, 12 en profile.ts:223 y reset).
- Propuesta: (libre) applyAuthRateLimit por userId en cambiarPasswordAction y updatePasswordAction; unificar el costo de bcrypt.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-cambio.cambio-forzado, h2.cli-cuenta.cambiar-password, lib.rate-limit

### [SEC-016] profile.ts: WhatsApp sin validacion y mensajes internos de Prisma devueltos al cliente
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/profile.ts:87` — «const whatsapp = ((formData.get('whatsapp') as string | null) ?? '').trim() || null»; `src/lib/actions/profile.ts:72` — «return { success: false, error: toErrorMessage(error, 'No se pudo actualizar el perfil.') }»; `src/lib/action-utils.ts:31` — «if (error instanceof Error) { return error.message }»
- Impacto: Un error de Prisma (p. ej. P2025 'Invalid prisma.organization.update() invocation...') llega textual a la UI del cliente (viola 'nunca exponer errores internos'); el campo WhatsApp acepta cualquier texto de cualquier largo (lo ve el admin en ClientHeader/OverviewTab). Mismo toErrorMessage en :99, :146, :183, :244.
- Propuesta: (libre en profile.ts) Zod para whatsapp (formato/largo) y mensaje fijo en los catch para errores no-Zod; action-utils.ts es FROZEN -> si se quiere cambiar el helper, decision para Valentino.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-cuenta, lib.actions

### [SEC-025] Los límites por IP de forgot-password, reset-password y el formulario de contacto se esquivan rotando X-Forwarded-For: getClientIpHash toma el primer valor del header
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/security/auth-rate-limit.ts:39` — «const fwd = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()»; `src/app/forgot-password/actions.ts:43` — «const ipHash = await getClientIpHash() const ipLimit = await applyAuthRateLimit({ scope: 'forgotPasswordPerIp', identifier: ipHash })»; `src/app/reset-password/actions.ts:19` — «const ipHash = await getClientIpHash() const ipLimit = await applyAuthRateLimit({ scope: 'resetPasswordPerIp', identifier: ipHash })»; `src/lib/actions/contact.ts:22` — «// Clave no controlable por el atacante: IP hasheada, no un campo del FormData. const ipHash = await getClientIpHash()»
- Impacto: En Netlify, el primer valor de X-Forwarded-For puede venir del cliente. La IP que pone la plataforma está en x-nf-client-connection-ip, y el repo solo la usa para limpiar Sentry. Un anónimo que manda un X-Forwarded-For distinto en cada pedido estrena un bucket cada vez:
- El formulario público de contacto queda sin freno: por cada envío, una fila en ContactSubmission, el webhook de alertas y n8n. Esto contradice el comentario de contact.ts:22.
- forgot-password pierde su tope por IP y queda solo el de 3/h por email, multiplicable por cada cuenta registrada en envíos por Brevo.
- reset-password pierde su freno por IP.
Es el mismo patrón que SEC-007 cita solo para loginAction.
- Propuesta: Zona libre. Crear un helper único getClientIp() que lea la IP confiable de la plataforma (x-nf-client-connection-ip en Netlify, con fallback local) en vez del primer XFF. Usarlo en getClientIpHash, en login/actions.ts y en el extractor del chatbot (requestSchema.ts:110). Sumar un invariante con XFF falsificado.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.rate-limit, lib.security, h1.auth-recupero, h6.vis-contacto
- REQUIERE-VERIFICACIÓN-HUMANA: VH-015

### [SEC-029] Impersonación global por navegador: con dos clientes abiertos en pestañas distintas, lo que soporte guarda en la pestaña de X se escribe en Y
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/actions/impersonation.ts:33` — «const jar = await cookies() jar.set(IMPERSONATION_COOKIE, token, getImpersonationCookieOptions())»; `src/lib/impersonation.ts:82` — «export function getImpersonationCookieOptions() { return { path: '/',»; `src/lib/preview.ts:14` — «if (role === 'SUPER_ADMIN') { const impersonation = await getImpersonationSession() return impersonation?.orgId ?? null»; `src/app/(protected)/dashboard/_actions/business-profile.actions.ts:25` — «const organizationId = await resolveOrgId()»; `src/app/(protected)/dashboard/_actions/business-profile.actions.ts:33` — «await prisma.organization.update({ where: { id: organizationId },»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:158` — «const campaign = await prisma.emailCampaign.create({ data: { organizationId: org.id,»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:177` — «const campaign = await prisma.emailCampaign.findFirst({ where: { id: campaignId, organizationId: org.id },»
- Impacto: Bloqueante para operar con el primer cliente real junto a otros. La impersonación vive en una sola cookie por navegador (path '/') y startImpersonationAction la pisa sin mirar si ya había otra activa. Cada acción del portal resuelve la org en el momento del envío (resolveOrgId lee esa cookie), no la de la pantalla que se está viendo. Escenario: soporte abre 'Ver como cliente' de X en una pestaña y de Y en otra (o vuelve con el botón Atrás). La pestaña de X sigue mostrando X, pero lo que se guarda ahí se escribe en Y: ticket promedio, preferencias del reporte, onboarding, tickets, importación de contactos, campañas de email. Una campaña creada 'para X' queda en Y y, si se envía desde esa pestaña, sale a los contactos de Y (el chequeo id + org pasa porque ambos son de Y). Es escritura entre tenants por error de operación, sin aviso, y la auditoría no deja ver la intención.
- Propuesta: Zona libre. Atar la org a la pantalla: durante el preview, mandar en cada acción del portal el orgId que se renderizó (firmado o como token por pestaña) y rechazar si no coincide con la cookie ('Cambiaste de cliente en otra pestaña: recargá'). Como mínimo, que startImpersonationAction no pise una impersonación activa sin terminarla. Decidir junto con la política de escritura del preview de SEC-020: si el preview pasa a solo lectura, desaparece la mitad de escritura.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-impersonacion, lib.preview, h2.cli-inicio, h2.cli-email-mkt, h2.cli-soporte, h4.adm-clientes
- REQUIERE-VERIFICACIÓN-HUMANA: VH-017

### [SEC-030] La auditoría se pierde en silencio: logAdminAction traga el error sin Sentry y corre después del cambio (contraseña, impersonación), y el vencimiento de la impersonación no se registra
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/audit-log.ts:39` — «} catch (error) { console.error('[audit-log] Failed to log action:', error) }»; `src/app/reset-password/actions.ts:68` — «const [updatedUser] = await prisma.$transaction([»; `src/app/reset-password/actions.ts:87` — «await logAdminAction({»; `src/app/cambiar-password/actions.ts:51` — «await prisma.user.update({»; `src/app/cambiar-password/actions.ts:63` — «await logAdminAction({»; `src/lib/actions/impersonation.ts:34` — «jar.set(IMPERSONATION_COOKIE, token, getImpersonationCookieOptions())»; `src/lib/actions/impersonation.ts:36` — «await logAdminAction({»; `src/components/dashboard/ImpersonationTimer.tsx:29` — «if (nextRemaining <= 0) { router.replace('/admin/clients')»
- Impacto: Si el insert en admin_audit_log falla (hipo de Neon, pool agotado), el restablecimiento o cambio de contraseña y la impersonación del portal de un cliente ocurren igual y sin rastro. El error queda solo en la consola de la función: el helper no llama a Sentry y no hay captureConsoleIntegration. La impersonación ni siquiera falla cerrada, porque la cookie se emite antes de auditar. Además, una impersonación que vence sola (30 min) termina con router.replace en el navegador sin registrar IMPERSONATION_ENDED; solo el botón de salir lo registra. Para el primer cliente real: justo cuando hay un incidente, el historial de quién entró a su cuenta y qué se cambió tiene huecos que nadie detecta. El helper lo usan 43 llamadas en 31 archivos, incluidas bajas definitivas de clientes.
- Propuesta: Decisión para Valentino (audit-log.ts es FROZEN-inferido): Sentry.captureException en el catch y una variante que reciba el cliente de transacción, para que el registro viaje en el mismo $transaction que el cambio. Zona libre en los llamadores: en startImpersonationAction, auditar antes de emitir la cookie y abortar si falla (acción privilegiada, falla cerrada); registrar el fin por vencimiento (al detectar el token vencido o desde el timer vía stopImpersonationAction).
- Esfuerzo: M  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): lib.audit-log, h1.auth-recupero, h1.auth-cambio, h1.auth-impersonacion, h4.adm-audit, modelo.AdminAuditLog, int.sentry

### [SEC-031] rate_limit no se purga nunca y varias claves las elige quien llama: el webhook del motor inserta una fila por cada token inventado en la Neon compartida
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/rate-limit/limiter.ts:29` — «// UPSERT resetea count=1 y muda la ventana. No hay job de limpieza — la tabla // no acumula buckets "muertos" dentro de la misma ventana porque la siguiente»; `src/lib/rate-limit/limiter.ts:46` — «INSERT INTO rate_limit (id, key, count, "windowStart", "expiresAt", "createdAt", "updatedAt") VALUES ($1, $2, 1, $3, $4, $3, $3) ON CONFLICT (key) DO UPDATE SET»; `src/app/api/motor/webhook/[channelToken]/route.ts:33` — «const rate = await checkRateLimit({ key: 'motorWebhookPerChannel:${tokenHash}',»; `src/modules/chatbot/server/chat/handleChatRequest.ts:185` — «key: 'chatbotPerBotSession:${slug}:${body.sessionId}',»; `src/app/forgot-password/actions.ts:51` — «const emailLimit = await applyAuthRateLimit({ scope: 'forgotPasswordPerEmail', identifier: email,»; `src/app/api/chatbot/[slug]/chat/route.ts:77` — «// se resetean UNA vez en el deploy (ventana de 60s; las filas viejas las // barre el cleanup perezoso del limiter).»; `src/lib/rate-limit/limiter.ts:65` — «if (!row) { // El UPSERT con RETURNING siempre devuelve una fila. Si no la hay, // hay un problema de conexión o de schema — fail closed (rechazar)»
- Impacto: La 'limpieza perezosa' solo reusa una fila cuando la MISMA clave vuelve; una clave que no vuelve queda para siempre (git grep sin ningún DELETE sobre rate_limit). Varias claves las elige el visitante: el token de la URL del webhook del motor (POST anónimo; se limita ANTES de validar el canal y sin límite por IP delante), el sessionId del chatbot (1 a 200 caracteres libres), el email de forgot-password y la IP vía X-Forwarded-For (SEC-025). Un script anónimo contra /api/motor/webhook/<aleatorio> suma una fila por pedido: a 50 pedidos/s son unas 180.000 filas por hora, con sus tres índices, en la Neon que comparten la app y Franco, y no se van al terminar el ataque. Para el primer cliente real: el almacenamiento del proyecto puede llenarse y cortar las escrituras de todos. Además la rama 'fail closed' de limiter.ts:65 es inalcanzable: una falla de conexión lanza una excepción que los llamadores de auth no atrapan.
- Propuesta: Zona libre. Cron diario que borre filas con expiresAt vencido hace más de un día (el índice en expiresAt ya existe), registrado como los demás crons. En el webhook del motor, validar el formato del channelToken y poner un límite por IP antes del límite por canal (o limitar después de confirmar que el canal existe). Corregir los comentarios de limiter.ts:28-33 y chat/route.ts:76-78. Definir y documentar la política ante error de base (fail-closed real con try/catch en checkRateLimit).
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.rate-limit, modelo.RateLimit, h3.vis-whatsapp, h3.vis-api-chatbot, h1.auth-recupero, h6.vis-contacto
- REQUIERE-VERIFICACIÓN-HUMANA: VH-019

### [SEC-032] Nombre de empresa sin tope de largo: el cliente puede inflar el prompt de su propio chatbot decenas de veces y el costo de Vertex lo paga develOP
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/schemas.ts:15` — «name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'), companyName: z.string().trim().min(2, 'La empresa debe tener al menos 2 caracteres.'),»; `src/lib/actions/profile.ts:55` — «prisma.organization.update({ where: { id: organizationId }, data: {»; `src/modules/chatbot/server/chat/handleChatRequest.ts:650` — «companyName: bot.organization.companyName,»; `src/modules/chatbot/server/prompts/sections.ts:24` — «Sos ${botConfig.botName}, parte del equipo de ${context.companyName}. Primer punto de contacto con visitantes del sitio.»; `src/modules/chatbot/server/admin/saveKnowledgeBase.ts:12` — «businessInfo: z.string().max(50_000),»; `src/app/bienvenida/_actions/complete-onboarding.ts:10` — «companyName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),»; `scripts/_b13-dev.log:42` — «"tokensIn":5579»
- Impacto: UpdateProfileSchema (Mi Cuenta -> Perfil) y el wizard de /bienvenida aceptan cualquier largo de nombre de empresa; el input tampoco tiene maxLength y solo frena el límite por defecto de 1 MB del body de una server action. Ese nombre entra al system prompt del bot de la org 7 veces (git grep de context.companyName en sections.ts), mientras que cada campo de la base de conocimiento sí tiene tope (50.000). Con 200.000 caracteres, cada turno pasa de unos 5.600 tokens de entrada medidos a unos 250.000 (cerca de 45x), hasta agotar la cuota mensual; con un nombre más largo el prompt excede el contexto del modelo y el bot deja de responder. También rompe listas del admin y emails que muestran el nombre. Hoy no cuesta porque la credencial de Vertex está vencida; con el primer cliente real, un cliente malintencionado o una cuenta comprometida multiplica el gasto de develOP. El alta del admin sí limita a 100 (createClientOnly.ts:20).
- Propuesta: Zona libre. .max() razonable (100, como el alta del admin) en UpdateProfileSchema.name/companyName, CompleteOnboardingSchema y onboarding-actions.ts:20, más maxLength en los inputs. Defensa en profundidad: truncar context.companyName al armar el prompt. Script de datos (sin migrate reset) que detecte nombres existentes fuera de rango.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-cuenta, h2.cli-bienvenida, h3.vis-api-chatbot, int.vertex, modelo.Organization, lib.actions
- REQUIERE-VERIFICACIÓN-HUMANA: VH-020

### [SEC-001] Clave de Google AI con el valor completo en dos documentos y en el historial
- Dominio: D7  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `docs/audits/2026-05-bfg-leak-cleanup.md:94` y `docs/bitacora-roadmap.md:36` — valor completo de una `GOOGLE_GENERATIVE_AI_API_KEY` (omitido); historial: `logic-core-v3/enviroment.env` agregado en `3953558312` (2026-02-12) y alcanzable desde 116 refs (`_crudo/secrets-historial.json`); `docs/audits/2026-05-bfg-leak-cleanup.md:193-197` — «### 8.2 Lo que NO se hizo … ❌ `git push --force` al remote»; `:204` — «La key `…` sigue deshabilitada en Google Cloud (Franco ya rotó — confirmado)».
- Impacto: bloqueante para el primer cliente real solo si la clave siguiera viva: cualquiera con un clon (el repo pasó a privado, pero estuvo público según `docs/baselines/2026-07-auditoria-seguridad.md:3360`) podría consumir la cuota de Google AI a nombre de develOP. Valentino confirma que las credenciales del repo son de prueba (ENMIENDA-01 P1).
- Propuesta: borrar el valor de los dos documentos (dejar solo un prefijo), confirmar en Google Cloud que la clave está revocada y decidir si se purga el historial (`git-filter-repo` + force-push coordinado) o se acepta como clave muerta.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-002], [SEC-003], [SEC-004]
- Nodo(s): int.google-ai, doc.audits-2026-05-bfg-leak-cleanup, doc.bitacora-roadmap
- REQUIERE-VERIFICACIÓN-HUMANA: VH-001

### [SEC-002] Email y contraseña de las cuentas del seed (SUPER_ADMIN y cliente) escritos en el repo
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `README.md:29-30`, `STATUS.md:258-259`, `docs/demo-guion.md:15-16`, `docs/bitacora-beta.md:15`, `docs/bitacora-roadmap.md:6375-6377` (tabla de MS-8: super-admin, client-a y client-b) y `:10534`, `tests/helpers/auth.ts:21` y `:25` — patrón «email / contraseña» (valores omitidos); el seed actual ya no los usa: `prisma/seed.ts:76-79` — `bcrypt.hash(requireSeedPassword('SEED_ADMIN_PASSWORD'), 12)`.
- Impacto: bloqueante para el primer cliente real: si la base de producción se siembra —o se sembró antes del cambio— con esas contraseñas, queda un SUPER_ADMIN con contraseña conocida por cualquiera que lea el repo.
- Propuesta: sacar los literales de docs y del helper de tests (que lea de entorno, como el seed), sembrar producción limpia y confirmar que ninguna base expuesta conserva esas contraseñas.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-001], [SEC-003]
- Nodo(s): lib.auth, lib.prisma.seeds, lib.tests
- REQUIERE-VERIFICACIÓN-HUMANA: VH-002

### [SEC-003] Contraseña de la cuenta QA de setter en docs y como literal en dos scripts
- Dominio: D4  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `docs/leados-alta-setter.md:25` (cuenta QA de setter + contraseña) y `:40` (`bcrypt.hash` de un literal); `docs/bitacora-roadmap.md:7837` (la misma cuenta y contraseña); `scripts/b1-verify-setter-ownership.ts:44` y `scripts/b2-verify-dossier.ts:66` — `const setterPassword = await bcrypt.hash('…', 12)` (valores omitidos).
- Impacto: bloqueante para el primer cliente real si alguna de esas cuentas existe en producción con esa contraseña (un setter ve leads y opera sobre ellos).
- Propuesta: sacar la contraseña de los docs; los dos scripts son one-off (ver [POD-161], [POD-162]): borrarlos o hacer que lean la contraseña de entorno.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-002], [POD-161], [POD-162]
- Nodo(s): h5.set-dia, lib.scripts, doc.leados-alta-setter
- REQUIERE-VERIFICACIÓN-HUMANA: VH-002

### [SEC-004] Contraseña del admin de Matsu (base de dev) literal en un script commiteado
- Dominio: D9  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `scripts/set-matsu-password.ts:17` — `const PASSWORD = '…'` (omitido); `:15` — host de la Neon de dev en `EXPECTED_DEV_HOST` (no es una credencial, pero ubica la base); `docs/bitacora-roadmap.md:3001` repite la contraseña del usuario dev de Matsu en texto plano (omitida; hallado en F1.12).
- Impacto: bloqueante para el primer cliente real solo si esa contraseña se reutiliza fuera de dev o si la base de dev queda accesible con datos reales del piloto.
- Propuesta: borrar el script (one-off, [POD-155], confianza de poda ALTA) o que lea la contraseña de entorno; no reutilizarla en otros entornos.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-002], [POD-155]
- Nodo(s): lib.scripts
- REQUIERE-VERIFICACIÓN-HUMANA: VH-002

### [SEC-008] trustHost fijo en true: si falta AUTH_URL/NEXTAUTH_URL en producción, el host del magic link sale de X-Forwarded-Host
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/auth.ts:78` — «trustHost: true,»; librería @auth/core@0.41.2, lib/utils/env.js línea 68 — «const envUrl = envObject.AUTH_URL ?? envObject.NEXTAUTH_URL;»; librería @auth/core@0.41.2, lib/utils/env.js línea 81 — «const detectedHost = headers.get("x-forwarded-host") ?? headers.get("host");»; librería @auth/core@0.41.2, lib/actions/signin/send-token.js línea 48 — «const sendRequest = provider.sendVerificationRequest({»; `.env.example:73` — «NEXTAUTH_URL=»
- Impacto: Endurecimiento. Con trustHost: true fijo (auth.ts:78), Auth.js no falla cerrado si en producción falta AUTH_URL/NEXTAUTH_URL, y en ese caso el signIn de magicLinkAction arma la URL del link con X-Forwarded-Host. NEXTAUTH_URL figura como obligatoria en la documentación, pero scripts/check-env.js no corre en el build (no hay prebuild y netlify.toml usa npm run build). Para el primer cliente real solo es explotable si la variable falta y Netlify deja pasar el header del cliente: el email legítimo llevaría el token a un dominio ajeno (toma de cuenta).
- Propuesta: Confirmar AUTH_URL/NEXTAUTH_URL en el contexto Production de Netlify (VH); correr check-env.js antes del build para fallar si falta. Decisión para Valentino (auth.ts es FROZEN): limitar trustHost a entornos no productivos.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.magic-link, lib.auth, int.brevo
- REQUIERE-VERIFICACIÓN-HUMANA: VH-008

### [SEC-017] passwordResetRequired solo se impone en el proxy; ALWAYS_ALLOWED tiene entradas muertas y getLegacyAdminRedirectPath nunca redirige
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/proxy.ts:68` — «const ALWAYS_ALLOWED = [CHANGE_PASSWORD_PATH, '/api/auth/', '/logout', '/api/']»; `src/proxy.ts:84` — «if ( isAuthenticated && passwordResetRequired &&»; `src/proxy.ts:172` — «matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password'],»; `src/proxy.ts:23` — «if (pathname === ADMIN_OS_PATH || pathname.startsWith('${ADMIN_OS_PATH}/')) { return null»
- Impacto: Un usuario con contrasena temporal puede usar /api/* y server actions posteadas a rutas fuera del matcher sin cambiarla (ningun layout ni action lee passwordResetRequired): el forzado es higiene, no frontera, y es lo unico que depende solo del proxy frente al advisory de next. Las entradas '/api/auth/', '/api/' y '/logout' (ruta inexistente, PLAN-014) nunca aplican; getLegacyAdminRedirectPath siempre devuelve null porque ADMIN_OS_PATH === ADMIN_PATH (:8-9). El proxy decide con claims congelados del login (complete-onboarding no llama unstable_update).
- Propuesta: (libre) Chequear passwordResetRequired (dato fresco de Node) en los layouts de portal; limpiar ALWAYS_ALLOWED y borrar getLegacyAdminRedirectPath (:22-65, :81, :92-96); documentar que /api queda fuera del proxy por diseno.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.ruteo-por-rol, h1.auth-cambio.cambio-forzado, lib.proxy

### [SEC-018] OrgRole (ADMIN/MEMBER/VIEWER) viaja en la sesion pero ningun guard lo lee
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/auth.ts:227` — «token.orgRole = accessState.orgRole»; `src/lib/actions/profile.ts:29` — «const organizationId = session?.user?.organizationId»; `prisma/schema.prisma:523` — «role OrgRole @default(ADMIN)»
- Impacto: Latente: hoy todas las membresias se crean ADMIN; el dia que se invite a un VIEWER podra cambiar nombre de empresa, contacto, preferencias de toda la org y pedir la baja de la cuenta (profile.ts solo exige organizationId).
- Propuesta: Definir el modelo de permisos por OrgRole antes de habilitar miembros no-ADMIN; helper requireOrgRole en las actions de cuenta.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.auth, h2.cli-cuenta, modelo.OrgMember

### [SEC-019] Contrasena temporal de 8 caracteres con estructura fija (~34 bits) y sin vencimiento
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/security/generate-temp-password.ts:15` — «export function generateTempPassword(): string { return ( randomFromString(LETTERS, 4) +»; `src/lib/security/generate-temp-password.ts:11` — «.map((b) => str[b % str.length])»; `src/app/api/admin/users/[userId]/resend-credentials/route.ts:68` — «passwordResetRequired: true,»
- Impacto: La temporal (4 letras + 2 numeros + 2 especiales, sesgo de modulo) viaja por email y sirve indefinidamente hasta el primer login; junto con la fuerza bruta sin freno real es el eslabon mas debil de las cuentas nuevas. ~5,7% sale sin mayuscula.
- Propuesta: (libre) 16+ caracteres aleatorios (base64url) o reemplazar la temporal por un link de un solo uso en el email de bienvenida, con vencimiento.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-cambio.cambio-forzado, h4.adm-clientes, lib.security

### [SEC-020] Impersonacion: secreto de respaldo literal, misma clave que AUTH_SECRET, cookie que sobrevive al logout y politica de escritura sin definir
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/impersonation.ts:15` — «process.env.IMPERSONATION_SECRET ?? process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? <literal de respaldo, valor omitido>»; `src/actions/auth-actions.ts:6` — «await signOut({ redirectTo: '/login' })»; `src/lib/preview.ts:14` — «if (role === 'SUPER_ADMIN') { const impersonation = await getImpersonationSession()»; `src/lib/actions/upsell.ts:16` — «const organizationId = session?.user?.organizationId»
- Impacto: Si faltaran las tres variables, los tokens de impersonacion se firmarian con un literal publico del repo (hoy inalcanzable: Auth.js exige AUTH_SECRET en prod); por defecto firma HS256 con AUTH_SECRET crudo (reuso de clave). El logout no borra impersonation-token. Durante el preview, las actions con resolveOrgId escriben como el cliente y las que usan session.user.organizationId fallan con 'Sesion invalida.' (profile.ts:29-33, upsell.ts:16-19), sin marca de 'hecho por soporte'.
- Propuesta: (libre) Exigir IMPERSONATION_SECRET en prod (fallar si falta, sin literal); borrar la cookie en signOutAction; decidir si el preview es solo lectura (gate de mutaciones) o escritura auditada.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-impersonacion.iniciar, h1.auth-impersonacion.navegar-como-cliente, lib.impersonation

### [SEC-022] Hashes de rate limit sin sal: IP y email recuperables por fuerza bruta
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/security/auth-rate-limit.ts:26` — «return '${scope}:${createHash('sha256').update(raw.toLowerCase()).digest('hex').slice(0, 24)}'»; `src/lib/security/auth-rate-limit.ts:42` — «return createHash('sha256').update(ip).digest('hex').slice(0, 24)»
- Impacto: El comentario promete no guardar IPs ni emails en claro, pero sha256 sin sal de una IPv4 (2^32) o de un email conocido se revierte en segundos; la tabla rate_limit vive en la Neon compartida.
- Propuesta: (libre) HMAC con un pepper de entorno (PLAN-019).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.rate-limit, lib.security

### [SEC-026] El registro de auditoría guarda como IP el primer X-Forwarded-For, un dato que escribe el cliente
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/audit-log.ts:20` — «const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null»
- Impacto: La IP de cada evento de AdminAuditLog (cambios de contraseña, impersonación, acciones del admin) es la que el cliente declare. Quien opere con una cuenta comprometida deja rastros con la IP que quiera, y una investigación posterior no puede confiar en ese campo.
- Propuesta: Decisión para Valentino (audit-log.ts es FROZEN-inferido): usar la misma IP confiable del helper getClientIp() propuesto para los rate limits.
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): lib.audit-log, h4.adm-audit, modelo.AdminAuditLog
- REQUIERE-VERIFICACIÓN-HUMANA: VH-015

### [SEC-027] Las páginas de auth y /bienvenida se pueden embeber en un iframe ajeno: X-Frame-Options solo cubre admin|dashboard|setter y la CSP global es Report-Only
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `next.config.ts:94` — «source: '/(admin|dashboard|setter)(.*)', headers: [ { key: 'X-Frame-Options', value: 'DENY' },»; `next.config.ts:72` — «key: 'Content-Security-Policy-Report-Only',»; `next.config.ts:80` — «"frame-ancestors 'none'",»
- Impacto: /login, /forgot-password, /reset-password, /accept-invite, /cambiar-password y /bienvenida (wizard con sesión) se renderizan dentro de cualquier sitio. Eso habilita clickjacking o UI redress con el dominio legítimo. El riesgo es acotado porque esas pantallas piden tipear datos, pero contradice la política del propio config, que tiene frame-ancestors 'none' solo en modo reporte. No hay public/_headers ni [[headers]] en netlify.toml que lo compensen.
- Propuesta: Zona libre. Extender el bloque X-Frame-Options: DENY / frame-ancestors 'none' a esas rutas (o aplicarlo global salvo /embed/* y /widget.js) y pasar la CSP a enforce (PLAN-1025).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login, h1.auth-recupero, h1.auth-cambio, h1.auth-invite, h2.cli-bienvenida
- REQUIERE-VERIFICACIÓN-HUMANA: VH-016

### [SEC-028] stopImpersonationAction no exige SUPER_ADMIN: cualquier sesión puede escribir eventos IMPERSONATION_ENDED en la auditoría
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/impersonation.ts:50` — «export async function stopImpersonationAction() { const session = await auth()»; `src/lib/actions/impersonation.ts:66` — «if (session?.user?.id) { await logAdminAction({»; `src/lib/actions/impersonation.ts:13` — «if (session?.user?.role !== 'SUPER_ADMIN' || !session.user.id) {»; `src/app/(protected)/admin/clients/_actions/client.actions.ts:12` — «export async function stopImpersonationAction() { return stopImpersonationActionBase()»
- Impacto: Es una server action sin control de rol, contra la regla del repo de verificar sesión y rol en toda action (startImpersonationAction sí lo hace, :13). Un ORG_MEMBER o SETTER que consiga su id (por ejemplo con el advisory de divulgación de Server Functions de next <16.2.11) agrega entradas 'Finalizó impersonation' a su nombre en el registro de auditoría del admin. No da acceso a datos, pero ensucia la traza de impersonación.
- Propuesta: Zona libre. Registrar el evento solo si getImpersonationSession() devuelve una impersonación válida del mismo admin (o si el rol es SUPER_ADMIN). Borrar la cookie siempre. Mismo criterio en el wrapper de client.actions.ts.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-impersonacion, h4.adm-audit, modelo.AdminAuditLog

### [SEC-033] Cerrar sesión no revoca el token: una copia de la cookie sigue sirviendo y no existe 'cerrar sesión en todos los dispositivos'
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/actions/auth-actions.ts:5` — «export async function signOutAction() { await signOut({ redirectTo: '/login' })»; librería @auth/core@0.41.2, lib/actions/signout.js línea 15 — «if (session.strategy === "jwt") {»; librería @auth/core@0.41.2, lib/actions/signout.js línea 28 — «cookies.push(...sessionStore.clean());»; `src/auth.ts:218` — «typeof token.sessionVersion === 'number' && accessState.sessionVersion !== undefined && token.sessionVersion !== accessState.sessionVersion»
- Impacto: Con sesiones JWT, salir solo borra la cookie de ese navegador; el token sigue siendo válido hasta que vence (30 días deslizantes por SEC-010), porque el logout no sube User.sessionVersion. Si un cliente sospecha que alguien copió su sesión (PC compartida, extensión), 'Cerrar sesión' no lo protege, y la única revocación disponible es cambiar la contraseña, que SEC-006 permite revivir. Precondición fuerte: copia previa de la cookie.
- Propuesta: Decidir (PLAN-004 lo tiene como idea sin estado). Zona libre: agregar 'Cerrar sesión en todos los dispositivos' en Mi Cuenta que incremente sessionVersion (el mecanismo ya existe) y, opcionalmente, incrementarlo también en el logout explícito, aceptando que desloguea los demás dispositivos.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login, lib.auth, h2.cli-cuenta
- REQUIERE-VERIFICACIÓN-HUMANA: VH-026

## Bugs latentes

### [BUG-002] El alta de cliente guarda el email tal cual se tipeo: con una mayuscula el cliente no puede entrar por ningun metodo
- Dominio: D1  ·  Severidad: ALTA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/admin/createClientOnly.ts:26` — «userEmail: z.string().email(),»; `src/modules/chatbot/server/admin/createClientOnly.ts:91` — «email: parsed.userEmail,»; `src/modules/chatbot/server/admin/createClientWithBot.ts:141` — «email: parsed.userEmail,»; `src/lib/onboarding/core.ts:91` — «email: input.userEmail,»; `src/auth.ts:143` — «where: { email: String(credentials.email).trim().toLowerCase() },»; `src/lib/actions/clients.ts:96` — «// FIX 3 — email casing. Normalizamos a lowercase para alinear con el login»; `prisma/schema.prisma:289` — «email String @unique»
- Impacto: Bloqueante para el primer cliente real: si el admin carga 'Juan@Empresa.com' (o el teclado del celular capitaliza), el User queda con mayuscula; el login con contrasena (auth.ts:143), el magic link (signIn callback auth.ts:176-184) y forgot-password (ForgotPasswordSchema toLowerCase, schemas.ts:80) buscan en minuscula con igualdad exacta -> 'Email o contrasena incorrectos' para siempre. Tambien permite duplicados que difieren solo en mayusculas. El arreglo ya existe en el camino viejo (clients.ts:96-100) y en updateClient.ts:71, pero no en los tres caminos vivos de alta.
- Propuesta: (libre) Normalizar con .trim().toLowerCase() en los schemas de alta (createClientOnly.ts:26, createClientWithBot.ts:34, admin/chatbots/new/actions.ts:27 / onboarding/core.ts) y en el wizard (Step1Company.tsx:169); script de datos que pase a minuscula los emails existentes verificando colisiones (sin migrate reset).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.login-password, h1.auth-login.magic-link, h4.adm-clientes, modelo.User

### [BUG-001] Sesion invalidada en Node pero viva en el proxy: bucle /login <-> portal (ERR_TOO_MANY_REDIRECTS)
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/auth.ts:222` — «return null»; `src/app/(protected)/dashboard/layout.tsx:90` — «if (!organizationId) { redirect(session?.user?.role === 'SUPER_ADMIN' ? '/admin/clients' : '/login')»; `src/proxy.ts:143` — «return NextResponse.redirect( new URL(onboardingCompleted ? DASHBOARD_PATH : ONBOARDING_PATH, nextUrl)»; `src/auth.config.ts:24` — «callbacks: { authorized({ auth }) { return true // Route protection is handled in middleware logic»; librería next-auth@5.0.0-beta.31, lib/index.js línea 91 — «return Promise.resolve(headers()).then((h) => getSession(h, config).then((r) => r.json()));»; librería next-auth@5.0.0-beta.31, lib/index.js línea 169 — «finalResponse.headers.append("set-cookie", cookie);»; `src/app/api/admin/users/[userId]/resend-credentials/route.ts:71` — «sessionVersion: { increment: 1 },»; `src/modules/chatbot/server/admin/hardDeleteClient.ts:141` — «await tx.organization.delete({ where: { id: organizationId } })»
- Impacto: Bloqueante para el primer cliente real en el flujo de soporte: tras un reset por email, un cambio de contrasena en otro dispositivo o 'Reenviar credenciales' desde admin, el navegador con la sesion vieja queda atrapado: el layout (Node) ve la sesion nula y manda a /login; el proxy (sin chequeo de version, auth() de RSC no limpia la cookie) la ve valida y devuelve a /dashboard. El cliente no llega ni al formulario para entrar con la contrasena nueva hasta borrar cookies. Mismo bucle para usuarios sin membresia (org borrada por hardDeleteClient) o borrados, para admin (/admin <-> /login) y setter (/setter <-> /login).
- Propuesta: (libre) Que el proxy no rebote /login al portal solo por la cookie (dejar renderizar /login y que decida la pagina), o que los layouts, ante sesion nula con cookie presente, redirijan a una ruta que haga signOut y limpie la cookie en vez de /login; opcionalmente dar al proxy un chequeo de validez. Confirmar con la prueba multi-dispositivo de PLAN-006.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.ruteo-por-rol, h1.auth-login.sesion-jwt, lib.proxy, lib.auth, h2.cli-shell, h4.adm-shell
- REQUIERE-VERIFICACIÓN-HUMANA: VH-006

### [BUG-004] El rol CLIENT existe en el enum pero el proxy lo expulsa de /dashboard: un usuario CLIENT queda en bucle
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `prisma/schema.prisma:15` — «CLIENT»; `src/proxy.ts:154` — «if (isDashboardRoute && role !== USER_ROLE && !(role === ADMIN_ROLE && isImpersonating)) {»; `src/lib/preview.ts:10` — «if (role === 'ORG_MEMBER') {»
- Impacto: Latente (ningun codigo asigna CLIENT, git grep vacio), pero un usuario CLIENT con org pasa el signIn y queda en bucle /dashboard -> /login -> /dashboard (proxy.ts:143-145); resolveOrgId le devuelve null. CLAUDE.md documenta 'ORG_MEMBER / CLIENT -> /dashboard/*', lo contrario del codigo.
- Propuesta: Decidir: declarar CLIENT legacy (y corregir la doc) o tratarlo como ORG_MEMBER en proxy.ts y preview.ts. El enum vive en schema.prisma (FROZEN): no tocarlo sin decision.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.ruteo-por-rol, lib.proxy, lib.auth

### [BUG-008] magicLinkAction declara éxito sin mirar la URL que devuelve signIn: el 'throw on fail' previsto para BUG-003 con un Error común seguiría mostrando 'Link generado'
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/login/actions.ts:146` — «await signIn('resend', { email, redirectTo: '/dashboard',»; `src/app/login/actions.ts:151` — «return 'SUCCESS'»; librería @auth/core@0.41.2, lib/actions/signin/send-token.js línea 66 — «await Promise.all([sendRequest, createToken]);»; librería @auth/core@0.41.2, index.js línea 124 — «if (isAuthError && isRaw && !isRedirect) throw error;»; librería @auth/core@0.41.2, index.js línea 140 — «return Response.redirect(url);»; librería next-auth@5.0.0-beta.31, lib/actions.js línea 48 — «const responseUrl = res instanceof Response ? res.headers.get("Location") : res.redirect;»; librería @auth/core@0.41.2, errors.js línea 333 — «export class EmailSignInError extends SignInError {»
- Impacto: Con redirect:false, signIn no lanza ante errores que no son AuthError: Auth.js los convierte en una redirección a /api/auth/error?error=Configuration, next-auth devuelve esa URL y magicLinkAction la ignora y responde 'SUCCESS'. Hoy no se dispara en el uso normal: sendVerificationRequest nunca lanza y los errores del adapter llegan como AdapterError. Pero el arreglo planeado para BUG-003 (PLAN-017, 'throw on fail'), hecho con un Error común, dejaría al cliente viendo 'Link generado' igual y sin email. Además, como el envío corre en paralelo con la creación del token (Promise.all), si falla la base el mail puede salir igual con un link muerto mientras la pantalla dice que falló.
- Propuesta: Zona libre en login/actions.ts: considerar éxito solo si la URL devuelta es /api/auth/verify-request; si no, devolver error y capturarlo. Para BUG-003 (auth.ts, decisión para Valentino): lanzar EmailSignInError, subclase de AuthError que Auth.js re-lanza en modo raw, en vez de Error.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.magic-link, lib.auth, int.brevo

### [BUG-009] Topes de largo de contraseña distintos: /cambiar-password y Mi Cuenta aceptan más de 128 caracteres y el login los rechaza
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/cambiar-password/actions.ts:14` — «newPassword: z .string() .min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')»; `src/lib/actions/schemas.ts:25` — «newPassword: z .string() .min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')»; `src/app/login/actions.ts:72` — «if (password.length < 8 || password.length > 128) { return 'La contraseña debe tener entre 8 y 128 caracteres.'»; `src/lib/actions/schemas.ts:97` — «.max(128, 'Contraseña demasiado larga.'),»; librería bcryptjs@3.0.3, index.js línea 322 — «export function truncates(password) {»
- Impacto: Un cliente que define desde /cambiar-password o Mi Cuenta una contraseña de más de 128 caracteres (frase larga o gestor configurado al máximo) no puede volver a entrar con contraseña: el login responde 'debe tener entre 8 y 128 caracteres' antes de compararla, y solo le queda el magic link o recuperar. Además bcryptjs usa solo los primeros 72 bytes y trunca en silencio: con acentos (2 bytes en UTF-8) el tope real es menor, y dos contraseñas largas con el mismo comienzo valen lo mismo.
- Propuesta: Zona libre. Un passwordSchema compartido (el mismo que pide SEC-012) con un .max único (128 caracteres o 72 bytes) en login, reset, accept-invite, cambiar-password y Mi Cuenta, con aviso en el formulario.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-cambio, h2.cli-cuenta, h1.auth-login.password
- REQUIERE-VERIFICACIÓN-HUMANA: VH-024

## Tecnología vieja

## Rendimiento

## Deuda

### [DEU-001] Flujo de invitacion huerfano: ninguna action viva emite links a /accept-invite (y la de clientes nunca los enviaba)
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/invitations.ts:110` — «const inviteUrl = '${baseUrl}/accept-invite?token=${token}'»; `src/lib/actions/invitations.ts:116` — «message: 'Invitación generada para ${email}. El link fue impreso en la consola del servidor.',»; `src/lib/actions/settings.ts:194` — «await sendEmail({»; `src/lib/email.ts:15` — «if (!resend) { return { success: true }»; `src/app/accept-invite/actions.ts:15` — «export async function acceptInviteAction(»
- Impacto: inviteClientAction no tiene callers y nunca envia ni imprime el link (el mensaje miente); inviteTeamMemberAction vive en settings.ts, modulo sin importadores, y enviaria por Resend (contra PLAN-012) fingiendo exito sin RESEND_API_KEY. /accept-invite queda como superficie publica sin uso. Si alguien lo reconecta tal cual, la invitacion no llega.
- Propuesta: Decidir: borrar accept-invite + invitations.ts + inviteTeamMemberAction, o reconectarlo enviando por Brevo con resultado verificado y la regla de contrasena unica.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-invite.emitir-invitacion, h1.auth-invite.aceptar-invitacion, h4.adm-config, int.resend

### [DEU-003] router.push en CambiarPasswordForm (justificado inline) con destino fijo /dashboard
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/cambiar-password/CambiarPasswordForm.tsx:114` — «// Mecanismo intacto (ya es seguro): invocación directa + await + navegación DESPUÉS // del await, con el cookie ya en sessionVersion N+1. No se toca auth.ts.»; `src/app/cambiar-password/CambiarPasswordForm.tsx:126` — «router.push('/dashboard')»
- Impacto: Rubrica: router.push en portal con comentario que lo justifica = DEU BAJA. Para SETTER y SUPER_ADMIN funciona por un rebote extra del proxy.
- Propuesta: Mantener el comentario o navegar segun el rol que devuelva la action.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-cambio.cambio-forzado

### [DEU-004] Fondo de auth copiado en 4 paginas y /login de 511 lineas con estilos inline
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/login/page.tsx:412` — «function AmbientParticles() {»; `src/app/forgot-password/page.tsx:243` — «<div className="pointer-events-none fixed inset-0" style={{»; `src/app/accept-invite/InviteBackground.tsx:17` — «<div className="pointer-events-none fixed inset-0" style={{»; `src/app/reset-password/page.tsx:17` — «<div className="pointer-events-none fixed inset-0" style={{»
- Impacto: Cambiar el look de auth exige tocar 4 archivos (reset-password ademas omite DotMatrix); /login supera las 300 lineas con CSS inline donde hay utilidades Tailwind (anti-vibecode).
- Propuesta: (libre) AuthShell compartido con el fondo y separar LoginForm/MagicLinkForm en archivos propios.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login, h1.auth-recupero, h1.auth-invite

## Calidad

### [UX-001] El exito del magic link le dice al cliente que el link 'fue impreso en la consola del servidor'
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/login/page.tsx:194` — «La URL de verificación fue impresa en la{' '} <span className="font-mono text-zinc-400">consola del servidor</span>.»; `src/app/login/page.tsx:197` — «Copiala y pegala en el navegador para ingresar.»
- Impacto: Copy de desarrollo en el camino del cliente: tras pedir el magic link el cliente lee que tiene que copiar una URL de la consola del servidor y no sabe que debe revisar su email. Incumple 'sin datos de mentira' de L3.
- Propuesta: (libre) Reemplazar por un mensaje anti-enumeracion ('Si la cuenta existe, te mandamos un link de acceso por email; vence en 24 h').
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.magic-link

### [UX-002] 'Continuar con Google' no puede completar para ningun usuario y /login no muestra ningun ?error
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/auth.ts:125` — «id: profile.sub,»; `src/auth.ts:192` — «const accessState = await getUserAccessState(user.id)»; `src/auth.ts:200` — «return '${LOGIN_PATH}?error=unauthorized'»; librería @auth/core@0.41.2, lib/actions/callback/index.js línea 64 — «user: userByAccount ?? userFromProvider,»; `src/app/login/page.tsx:286` — «<form action={googleSignInAction} className="mb-5">»; `src/auth.ts:95` — «pages: { signIn: LOGIN_PATH },»
- Impacto: Sin cuenta Google vinculada (y no existe codigo que vincule: git grep de account.create/linkAccount vacio) el signIn callback recibe user.id = sub de Google, no encuentra usuario y devuelve '/login?error=unauthorized'; /login no lee searchParams, asi que el cliente vuelve al login sin mensaje. Si faltan AUTH_GOOGLE_ID/SECRET (no estan en .env.example) termina en un error de Google. Mismo silencio para cualquier ?error del signIn callback; el magic link vencido cae en la pagina de error por defecto de Auth.js en ingles (pages.error no configurado).
- Propuesta: Decidir: quitar el boton (libre, login/page.tsx:286-299) o implementar vinculacion por email verificado (auth.ts, decision para Valentino). En ambos casos leer ?error en /login con mensajes en espanol y configurar pages.error (auth.ts, decision).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.google-oauth, h1.auth-login.magic-link, lib.auth
- REQUIERE-VERIFICACIÓN-HUMANA: VH-010

### [UX-004] Recuperar la contraseña castiga el reintento: cada pedido anula el link anterior y, desde el cuarto en la hora, la pantalla dice 'te mandamos un mail' sin mandar nada
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/forgot-password/actions.ts:76` — «await prisma.$transaction([ prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null },»; `src/lib/rate-limit/presets.ts:12` — «forgotPasswordPerEmail: { limit: 3, windowMs: 60 * 60_000 },»; `src/app/forgot-password/actions.ts:55` — «if (!emailLimit.allowed) { return { type: 'success', message: ANTI_ENUM_MESSAGE }»; `src/app/reset-password/actions.ts:61` — «message: 'Este enlace no es válido o ya expiró. Solicitá uno nuevo.',»; `src/app/reset-password/ResetPasswordForm.tsx:264` — «<Link href="/login"»; `src/lib/email/templates/password-reset.ts:48` — «El enlace vence en ${minutes} minutos</strong> y solo se puede usar una vez.»
- Impacto: Escenario típico del primer cliente: el mail tarda (Brevo puede demorar o colgar el envío, BUG-003), aprieta 'Enviar enlace' de nuevo o lo pide desde el celular, y abre el primer mail: 'Este enlace no es válido o ya expiró', porque el segundo pedido lo borró. Ni el mail ni la pantalla avisan que solo vale el último. El error de /reset-password no ofrece pedir otro: solo 'Volver al inicio de sesión'; el link a /forgot-password aparece únicamente si falta el token. Si reintenta, desde el cuarto pedido en la hora el límite por email responde el mismo 'te mandamos un mail' sin enviar nada (anti-enumeración). Queda hasta una hora sin link válido, sin saber por qué, y llama a develOP: falla el criterio de autonomía de L3.
- Propuesta: Zona libre. Texto en el email y en la pantalla de éxito: 'si pediste más de uno, usá el último'. En el estado de error de ResetPasswordForm, link a /forgot-password. Evaluar no invalidar los tokens previos al pedir uno nuevo: que venzan solos a los 45 min y se borren todos al usar uno, como propone SEC-013, para que cualquiera de los mails funcione.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-recupero, h1.auth-recupero.forgot, h1.auth-recupero.reset, lib.rate-limit, int.brevo
- REQUIERE-VERIFICACIÓN-HUMANA: VH-022

### [UX-003] Cambio forzado sin salida si el cliente no tiene la temporal, y copy de 'forzado' tambien en cambio voluntario
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/cambiar-password/CambiarPasswordForm.tsx:140` — «<Field label="Contraseña actual" error={errors.oldPassword} required>»; `src/proxy.ts:89` — «return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, nextUrl))»; `src/app/cambiar-password/page.tsx:20` — «Por seguridad, necesitás definir una nueva antes de entrar.»
- Impacto: Un cliente nuevo que entra por magic link (passwordResetRequired=true desde el alta) queda encerrado en /cambiar-password pidiendo una 'contrasena actual' que puede no tener (email de bienvenida perdido); la pagina no ofrece /forgot-password (git grep vacio) y todo el portal redirige ahi. El texto de 'antes de entrar' aparece tambien al cambiarla por gusto.
- Propuesta: (libre) Link a /forgot-password en la pagina; copy condicionado a forceChange; evaluar no exigir la actual cuando el ingreso fue por magic link.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-cambio.cambio-forzado

### [UX-005] Después de iniciar sesión se pierde el destino: los links de los emails (lead caliente, ticket, mensajes) terminan en el inicio del portal
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/proxy.ts:105` — «const loginUrl = new URL(LOGIN_PATH, nextUrl) loginUrl.searchParams.set('callbackUrl', '${pathname}${nextUrl.search}')»; `src/app/login/actions.ts:102` — «const redirectTo = isSuperAdmin ? '/admin' : isSetter»; `src/app/login/actions.ts:111` — «await signIn('credentials', { email, password, redirectTo })»; `src/app/login/actions.ts:148` — «redirectTo: '/dashboard',»; `src/lib/client-notifications/notify.ts:169` — «leadUrl: '${appUrl}/dashboard/chatbot/leads/${input.leadId}',»; `src/lib/tickets/actions.ts:164` — «ticketUrl: '${baseUrl}/dashboard/soporte/${ticketInfo.id}',»
- Impacto: El proxy guarda el destino en ?callbackUrl=, pero /login no lo lee (git grep vacío) y loginAction/magicLinkAction fijan el destino por rol. El caso más común es el celular sin sesión: el cliente toca 'ver lead' en el email de lead caliente, entra y aterriza en /dashboard, y tiene que buscar el lead a mano justo en el flujo donde importa la rapidez. Lo mismo con respuestas de tickets y mensajes.
- Propuesta: Zona libre. Pasar callbackUrl como campo oculto del formulario de /login y usarlo como redirectTo cuando sea una ruta interna válida para el rol, validada por mismo origen (ver SEC-011 para no abrir un open redirect); mismo criterio en magicLinkAction.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login, lib.proxy, h3.cli-chatbot, h2.cli-soporte, h2.cli-mensajes
- REQUIERE-VERIFICACIÓN-HUMANA: VH-025

## Observabilidad

## Accesibilidad

### [A11Y-001] Paginas de auth: /login sin h1, texto por debajo de AA, errores sin anunciar y visor de contrasena fuera del teclado
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: a11y
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/login/page.tsx:367` — «className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"»; `src/app/login/page.tsx:263` — «<p className="mt-4 text-sm text-zinc-600">»; `src/app/login/page.tsx:404` — «<p className="text-[11px] text-zinc-700">Powered by develOP</p>»; `src/app/login/page.tsx:358` — «<p className="text-xs text-red-400">{error}</p>»; `src/app/login/page.tsx:112` — «tabIndex={-1}»
- Impacto: Aritmetica WCAG (paleta zinc de Tailwind 4 aprox. en sRGB): zinc-600 (#52525b, L~0,086) sobre #080a0c (L~0,003) = 0,136/0,053 = 2,6:1; zinc-500 = 4,1:1; zinc-700 = 1,9:1; AA exige 4,5:1. El link '¿Olvidaste tu contrasena?' queda en ~2,5:1. Los errores ('Email o contrasena incorrectos') no tienen role=alert/aria-live, el selector Contrasena/Magic Link no tiene semantica de tabs (:317-334) y no hay <h1> (PLAN-010). Mismo patron en forgot/reset/accept.
- Propuesta: (libre) h1 visible o sr-only; role='alert' en los bloques de error de login/forgot/reset/accept/cambiar; subir a zinc-400 los textos funcionales; quitar tabIndex -1 del visor; role='tablist'/aria-selected en el selector.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.login-password, h1.auth-recupero.solicitar-enlace, h1.auth-recupero.restablecer-password, h1.auth-invite.aceptar-invitacion

## ZONA-FRANCO

> Hallazgos sobre `src/lib/leados/`, `setter/`, `admin/leados/`, `admin/leads/_actions/`, `admin/fg2-lab/`, `src/auth.ts`, `src/lib/auth-cookies.ts`, `api/qa/login` y los modelos `OsLead*`/`ActivityChannel`. Se repiten en `09-PARA-FRANCO.md`.

### [SEC-006] La invalidacion por sessionVersion se revive con POST /api/auth/session (trigger 'update' saltea el chequeo)
- Dominio: D1  ·  Severidad: ALTA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/auth.ts:215` — «if ( trigger !== 'signIn' && trigger !== 'update' &&»; `src/auth.ts:230` — «token.sessionVersion = accessState.sessionVersion»; `src/app/api/auth/[...nextauth]/route.ts:3` — «export const { GET, POST } = handlers»; librería @auth/core@0.41.2, lib/index.js línea 57 — «case "session": validateCSRF(action, csrfTokenVerified); return await actions.session(options, sessionStore, cookies, true, request.body?.data);»; librería @auth/core@0.41.2, lib/actions/session.js línea 30 — «...(isUpdate && { trigger: "update" }),»
- Impacto: Si alguien obtiene la cookie de sesion de un cliente (PC compartida, malware, cookie filtrada), que el cliente cambie o restablezca la contrasena NO lo echa: con la cookie vieja, GET /api/auth/csrf + POST /api/auth/session (double-submit, sin conocer la contrasena) dispara el callback jwt con trigger 'update', que saltea la comparacion y re-firma el token con la sessionVersion nueva. SEC-AUTH-03 queda cerrado solo contra reuso pasivo.
- Propuesta: Decision para Valentino (auth.ts FROZEN + ZONA-FRANCO): comparar sessionVersion tambien en trigger 'update' (antes de refrescar) y hacer que las actions que suben la version emitan el token nuevo por un camino que no dependa de saltear el chequeo (p. ej. pasar la version nueva en el payload de unstable_update y aceptarla solo si coincide con la DB, o re-loguear tras el cambio). Sumar la prueba multi-dispositivo de PLAN-006.
- Esfuerzo: M  ·  Zona: FROZEN + ZONA-FRANCO
- Relacionado: —
- Nodo(s): h1.auth-login.sesion-jwt, h1.auth-cambio.cambio-forzado, h1.auth-recupero.restablecer-password, lib.auth, modelo.User
- REQUIERE-VERIFICACIÓN-HUMANA: VH-005

### [BUG-003] El envio del magic link nunca falla: sendVerificationRequest ignora el resultado de Brevo y la UI muestra exito
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/auth.ts:104` — «await sendTransactionalEmail({»; `src/lib/email/brevo-service.ts:20` — «if (!process.env.BREVO_API_KEY) { console.error('[Brevo] BREVO_API_KEY no configurada') return { ok: false, error: 'EMAIL_NOT_CONFIGURED' }»; `src/lib/email/brevo-service.ts:40` — «} catch (error) { console.error('[Brevo] Error sending email:', error)»; librería @getbrevo/brevo@5.0.4, dist/cjs/core/fetcher/requestWithRetries.js línea 15 — «const DEFAULT_MAX_RETRIES = 2;»
- Impacto: Sin BREVO_API_KEY, con Brevo caido o remitente no verificado, el cliente ve 'Link generado' y nunca recibe nada; no queda rastro en Sentry (solo console.error). El SDK espera hasta 60 s por intento con 2 reintentos, dejando el submit colgado hasta el timeout de la funcion (RESIL-05 parcial).
- Propuesta: Decision para Valentino (auth.ts FROZEN + ZONA-FRANCO): lanzar cuando result.ok es false para que Auth.js devuelva error (PLAN-017). En brevo-service.ts (libre) pasar timeoutInSeconds/maxRetries cortos y Sentry.captureException en el catch.
- Esfuerzo: S  ·  Zona: FROZEN + ZONA-FRANCO
- Relacionado: —
- Nodo(s): h1.auth-login.magic-link, int.brevo, int.sentry, lib.auth

### [BUG-006] Una falla de la base en el callback jwt se trata como 'sin sesión': rebote /login <-> portal en vez de pantalla de error, y unstable_update borra la cookie
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/auth.ts:207` — «const shouldRefreshFromDb = Boolean(userId) && (trigger === 'update' || trigger === 'signIn' || !user)»; `src/auth.ts:209` — «if (userId && shouldRefreshFromDb) { const accessState = await getUserAccessState(userId)»; librería @auth/core@0.41.2, lib/actions/session.js línea 58 — «catch (e) { logger.error(new JWTSessionError(e));»; librería @auth/core@0.41.2, lib/actions/session.js línea 61 — «response.cookies?.push(...sessionStore.clean());»; librería next-auth@5.0.0-beta.31, lib/index.js línea 48 — «return getSession(_headers, _config).then((r) => r.json());»; librería next-auth@5.0.0-beta.31, lib/actions.js línea 83 — «for (const c of res?.cookies ?? []) cookieJar.set(c.name, c.value, c.options);»; `src/app/(protected)/dashboard/layout.tsx:90` — «if (!organizationId) { redirect(session?.user?.role === 'SUPER_ADMIN' ? '/admin/clients' : '/login')»; `src/app/(protected)/admin/layout.tsx:43` — «if (!session?.user) { redirect('/login')»; `src/proxy.ts:143` — «return NextResponse.redirect( new URL(onboardingCompleted ? DASHBOARD_PATH : ONBOARDING_PATH, nextUrl)»; `src/app/(protected)/dashboard/_actions/business-profile.actions.ts:26` — «if (!organizationId) return { ok: false, error: 'Tu sesión expiró. Volvé a entrar.' }»; `src/app/cambiar-password/actions.ts:73` — «await unstable_update({ user: { passwordResetRequired: false } })»
- Impacto: Bloqueante para L3 del portal ante cualquier hipo de Neon (despertar en frío, timeout del pool). Cada auth() en Node consulta la base (getUserAccessState) y el callback no distingue 'base caída' de 'sesión inválida': Auth.js atrapa el error, lo imprime en consola y devuelve sesión nula. Los layouts de dashboard, admin y setter mandan a /login; el proxy, que no consulta la base, ve la cookie válida y devuelve al portal. Resultado: rebotes mientras dure la falla y ERR_TOO_MANY_REDIRECTS si persiste, en vez de error.tsx con 'Reintentar'. Las server actions responden 'Tu sesión expiró', 'Sesión inválida' o 'No autenticado' sin que la sesión haya vencido. Si la falla cae en el unstable_update posterior a cambiar la contraseña (cambiar-password y Mi Cuenta), Auth.js borra la cookie: el cliente queda deslogueado justo después de un cambio exitoso. Nada llega a Sentry: develOP no ve la caída ni su efecto.
- Propuesta: Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO): envolver getUserAccessState del callback jwt en try/catch; ante error de infraestructura, capturar en Sentry y devolver el token marcado (p. ej. token.error = 'db_unavailable') en vez de dejar que Auth.js lo convierta en sesión nula. Exponer la marca en la sesión y que los layouts (zona libre) lancen un error real (error.tsx con reintento) en vez de redirect('/login'). Alternativa: conservar los claims del token durante la caída (sin chequeo de sessionVersion) con alerta. Configurar logger.error de NextAuth hacia Sentry (ver el FAL de este ciclo).
- Esfuerzo: M  ·  Zona: FROZEN + ZONA-FRANCO
- Relacionado: —
- Nodo(s): lib.auth, lib.proxy, h2.cli-shell, h4.adm-shell, h1.auth-cambio, lib.prisma, int.sentry
- REQUIERE-VERIFICACIÓN-HUMANA: VH-018

### [BUG-007] El magic link se gasta en el primer GET: un escáner de enlaces del correo lo consume antes que el cliente
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: librería @auth/core@0.41.2, lib/actions/signin/send-token.js línea 52 — «url: '${baseUrl}/callback/${provider.id}?${new URLSearchParams({»; librería @auth/core@0.41.2, lib/actions/callback/index.js línea 141 — «const invite = await adapter.useVerificationToken({»; librería @auth/core@0.41.2, lib/actions/callback/index.js línea 153 — «if (invalidInvite) throw new Verification({ hasInvite, expired });»; `src/auth.ts:95` — «pages: { signIn: LOGIN_PATH },»; `src/auth.ts:113` — «<a href="${url}"»; `src/app/reset-password/actions.ts:80` — «prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() },»
- Impacto: El enlace del email apunta directo a GET /api/auth/callback/resend, que borra el token de un solo uso en el primer pedido (useVerificationToken), sin interacción. Los filtros de correo que abren los links para analizarlos (Microsoft 365 Safe Links/Defender, Mimecast, Proofpoint, algunos antivirus) lo consumen antes que la persona. Cuando el cliente hace clic, Auth.js lanza Verification y muestra su página de error en inglés (UX-002). Para un primer cliente con correo corporativo el magic link no funciona nunca y no hay explicación. El reset de contraseña no tiene el problema: /reset-password solo consume el token al enviar el formulario (POST). Eslabón inferido: el comportamiento del escáner del proveedor de correo.
- Propuesta: Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO): que sendVerificationRequest mande un link a una página propia de confirmación (zona libre, p. ej. /login/confirmar) con un botón que recién ahí siga al callback, o reemplazar el link por un código de un solo uso. Configurar pages.error/verifyRequest con texto en español (ver UX-002).
- Esfuerzo: M  ·  Zona: FROZEN + ZONA-FRANCO
- Relacionado: —
- Nodo(s): h1.auth-login, h1.auth-login.magic-link, lib.auth, modelo.VerificationToken, int.brevo
- REQUIERE-VERIFICACIÓN-HUMANA: VH-021

### [SEC-024] /api/qa/login confía en el header Host y los scripts QA escuchan en toda la red: cualquiera en la misma LAN obtiene una sesión SUPER_ADMIN
- Dominio: D1  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/api/qa/login/route.ts:54` — «const host = request.headers.get('host') ?? ''»; `src/app/api/qa/login/route.ts:61` — «if (!isLocalhost) { return { allowed: false, reason: 'host_not_localhost' }»; `package.json:8` — «"dev:qa": "cross-env QA_ALLOW_LOCALHOST=1 next dev --webpack -p 3002",»; `package.json:11` — «"start:qa": "npm run build && cross-env QA_ALLOW_LOCALHOST=1 next start -p 3001",»; librería next@16.2.9, dist/cli/next-start.js línea 72 — «const hostname = options.hostname;»; librería next@16.2.9, dist/server/lib/start-server.js línea 267 — «server.listen(port, hostname);»
- Impacto: La 'triple guarda' (route.ts:14-23) queda reducida a la variable QA_ALLOW_LOCALHOST, que los cuatro scripts QA encienden: el Host lo escribe el cliente y la guarda de hosting no aplica en una PC. dev:qa, start:qa, start:setter y start:galeria no pasan -H, así que Next llama server.listen(port, undefined), escucha en todas las interfaces e imprime la URL 'Network'. Un tercero en la misma red (cowork, bar, oficina) hace POST http://<IP>:3002/api/qa/login con 'Host: localhost' y {persona:'super-admin'}. Recibe un JWT de SUPER_ADMIN firmado con el AUTH_SECRET local y válido 8 h, que usa contra ese servidor: panel admin completo y escritura sobre la base del .env local, que según el PROMPT §3 es la Neon compartida. Además, ese servidor expuesto corre en Windows con next 16.2.9, que tiene un advisory crítico de RCE para servidores Windows (la versión la evalúa D8).
- Propuesta: Coordinar con Franco (ZONA-FRANCO):
1. Agregar -H 127.0.0.1 a dev:qa, start:qa, start:setter y start:galeria, y evaluar lo mismo para dev.
2. En la route, no usar Host como guarda: exigir además un secreto por corrida (header con un QA_LOGIN_TOKEN aleatorio que solo conoce el runner de visual-qa).
3. Responder 404 genérico sin reason (SEC-021).
- Esfuerzo: S  ·  Zona: ZONA-FRANCO
- Relacionado: —
- Nodo(s): h1.auth-login, h1.auth-login.qa-login, lib.auth
- REQUIERE-VERIFICACIÓN-HUMANA: VH-014

### [BUG-005] Org primaria no deterministica: orgMemberships take:1 sin orderBy en cada auth()
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/auth.ts:37` — «take: 1,»; `src/app/login/actions.ts:94` — «take: 1,»; `prisma/schema.prisma:530` — «@@unique([userId, organizationId])»
- Impacto: Latente: el schema permite varias membresias por usuario; si un usuario pertenece a dos orgs, cada auth() (que refresca de la DB) puede resolver una org distinta y el usuario ve/escribe en la que Postgres devuelva primero.
- Propuesta: Decision para Valentino (auth.ts FROZEN): orderBy explicito (joinedAt) o selector de org activa; mismo cambio en login/actions.ts:88-95 y qa/login/route.ts:118-127.
- Esfuerzo: S  ·  Zona: FROZEN + ZONA-FRANCO
- Relacionado: —
- Nodo(s): lib.auth, modelo.OrgMember

### [DEU-002] auth.ts: codigo muerto y estado sin usar (getPostLoginPath, userExists): un usuario borrado conserva sesion ORG_MEMBER
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/auth.ts:65` — «function getPostLoginPath(state: {»; `src/auth.ts:61` — «userExists: Boolean(dbUser),»; `src/auth.ts:44` — «const role = dbUser?.role ?? ('ORG_MEMBER' as Role)»
- Impacto: getPostLoginPath (y ADMIN_PATH/DASHBOARD_PATH/ONBOARDING_PATH :15-17) no tienen callers (PLAN-018). userExists se calcula y nunca se lee: un usuario borrado conserva una sesion con rol ORG_MEMBER por defecto y sin org (sessionVersion undefined no invalida, :219) hasta que expire; hoy sin datos expuestos, pero cualquier handler que solo pida 'sesion' lo deja pasar y el portal entra en el bucle de redirecciones.
- Propuesta: Decision para Valentino (FROZEN + ZONA-FRANCO): devolver null en jwt cuando !userExists y borrar getPostLoginPath con sus constantes.
- Esfuerzo: S  ·  Zona: FROZEN + ZONA-FRANCO
- Relacionado: —
- Nodo(s): lib.auth, h1.auth-login.sesion-jwt

### [SEC-021] /api/qa/login revela en el 403 cual guarda fallo
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/api/qa/login/route.ts:87` — «return NextResponse.json({ error: 'forbidden', reason: guard.reason }, { status: 403 })»; `src/app/api/qa/login/route.ts:50` — «if (process.env.QA_ALLOW_LOCALHOST !== '1') { return { allowed: false, reason: 'qa_flag_off' }»
- Impacto: Un sondeo anonimo en produccion sabe si QA_ALLOW_LOCALHOST esta activa; la guarda 3 (:65-70) depende de que NETLIFY/VERCEL_ENV existan en runtime. Bajo: las tres guardas siguen cerrando (Host localhost no es alcanzable por la CDN).
- Propuesta: Coordinar con Franco: 404 generico sin reason fuera de localhost.
- Esfuerzo: S  ·  Zona: ZONA-FRANCO
- Relacionado: —
- Nodo(s): h1.auth-login, lib.auth
