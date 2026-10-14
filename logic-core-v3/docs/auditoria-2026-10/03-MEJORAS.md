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

### [SEC-037] El overview de Mi Chatbot manda al navegador la fila completa de Organization: tokens de Google Business y Tiendanube, API key de Cal.com y las notas internas de develOP
- Dominio: D5  ·  Severidad: ALTA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/admin/getClientSession.ts:17` — «include: { organization: { include: {»; `src/app/(protected)/dashboard/chatbot/page.tsx:46` — «<ChatbotOverview session={session}»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:1` — «'use client'»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:30` — «organization: Organization & { botConfig: BotConfig | null }»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:63` — «{session.bot.botName} está atendiendo consultas las 24 horas.»; `prisma/schema.prisma:359` — «gbpAccessToken String? @db.Text gbpRefreshToken String? @db.Text»; `prisma/schema.prisma:367` — «tiendanubeAccessToken String? @db.Text»; `prisma/schema.prisma:402` — «internalNotes String?»
- Impacto: Bloqueante para el primer cliente con Reseñas o Tienda conectada: cualquier usuario de su org (incluido un VIEWER) recibe en el payload RSC de /dashboard/chatbot el access y refresh token de Google Business, el token sin vencimiento de Tiendanube y la API key de Cal.com (credenciales emitidas a la app de develOP sobre sus cuentas), legibles en DevTools y por cualquier XSS o extensión del navegador, y además internalNotes, las notas privadas que develOP escribe sobre ese cliente. El componente solo usa session.bot.botName; getPublicConfig del mismo módulo sí usa select.
- Propuesta: En getClientChatbotSession leer org y bot con select acotado (lo que usan las páginas: id, slug, siteUrl, companyName y campos del bot) y pasarle a ChatbotOverview solo botName; agregar un invariante que prohíba tipos Prisma completos (Organization, BotConfig, User) en props de componentes 'use client'. Confirmar antes y después con el caso de prueba del payload.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.admin, modelo.Organization, modelo.BotConfig
- REQUIERE-VERIFICACIÓN-HUMANA: VH-035

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
- Evidencia: `src/modules/chatbot/server/admin/archiveClient.ts:9` — «// Archivar = soft-delete REVERSIBLE. Marca SOLO el Organization (deletedAt); NO»; `src/modules/chatbot/server/admin/archiveClient.ts:34` — «(c) => c.organization.update({ where: { id: org.id }, data: { deletedAt: new Date() } }),»; `src/auth.ts:31` — «select: { companyName: true, onboardingCompleted: true,»; `src/lib/preview.ts:10` — «if (role === 'ORG_MEMBER') { return session?.user?.organizationId ?? null»; `src/app/(protected)/dashboard/layout.tsx:23` — «select: { companyName: true, onboardingCompleted: true },»; `prisma/schema.prisma:417` — «// Soft-delete de cliente. null = activo; con fecha = archivado/eliminado»; `src/app/(protected)/admin/clients/page.tsx:23` — «where: { deletedAt: null },»; `src/modules/chatbot/server/conversation/resolver.ts:38` — «if (!bot || !bot.isActive || !bot.knowledgeBase) {»
- Impacto: Si 'archivar' se usa para dar de baja a un cliente (falta de pago, fin de contrato), sus usuarios siguen entrando y operando el portal; ningun punto de auth ni del portal lee deletedAt (git grep). Depende de la intencion del producto.
- Propuesta: Decidir que significa archivar. Si debe cortar acceso: chequear organization.deletedAt en resolveOrgId (preview.ts, libre) con mensaje claro, y en getUserAccessState/signIn (auth.ts, decision para Valentino).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.sesion-jwt, h4.adm-clientes, lib.auth, modelo.Organization, h2.cli-shell, h3.vis-api-chatbot, int.cron.send-weekly-reports, h4.adm-clientes.archivar-cliente
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
- Evidencia: `src/lib/rate-limit/limiter.ts:29` — «// UPSERT resetea count=1 y muda la ventana. No hay job de limpieza — la tabla // no acumula buckets "muertos" dentro de la misma ventana porque la siguiente»; `src/lib/rate-limit/limiter.ts:46` — «INSERT INTO rate_limit (id, key, count, "windowStart", "expiresAt", "createdAt", "updatedAt") VALUES ($1, $2, 1, $3, $4, $3, $3) ON CONFLICT (key) DO UPDATE SET»; `src/app/api/motor/webhook/[channelToken]/route.ts:33` — «const rate = await checkRateLimit({ key: 'motorWebhookPerChannel:${tokenHash}',»; `src/modules/chatbot/server/chat/handleChatRequest.ts:185` — «key: 'chatbotPerBotSession:${slug}:${body.sessionId}',»; `src/app/forgot-password/actions.ts:51` — «const emailLimit = await applyAuthRateLimit({ scope: 'forgotPasswordPerEmail', identifier: email,»; `src/app/api/chatbot/[slug]/chat/route.ts:77` — «// se resetean UNA vez en el deploy (ventana de 60s; las filas viejas las // barre el cleanup perezoso del limiter).»; `src/lib/rate-limit/limiter.ts:65` — «if (!row) { // El UPSERT con RETURNING siempre devuelve una fila. Si no la hay, // hay un problema de conexión o de schema — fail closed (rechazar)»; `prisma/migrations/20260526233939_add_rate_limit_b14_1/migration.sql:18` — «CREATE INDEX "rate_limit_expiresAt_idx" ON "rate_limit"("expiresAt");»; `prisma/schema.prisma:1763` — «// claves muertas dentro de la misma ventana. El índice en expiresAt deja la // puerta abierta a un job de purga futuro si hace falta.»
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

### [SEC-035] El registro de aislamiento no bloquea nested writes en WabaChannel.templates/alerts (re-parenting cross-tenant posible)
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/isolation/registry.ts:44` — «const WABA_CHANNEL_NESTED = ['organization', 'conversations'] as const»; `src/lib/isolation/registry.ts:222` — «forbiddenCreateKeys: WABA_CHANNEL_NESTED, forbiddenUpdateKeys: [...WABA_CHANNEL_NESTED, 'organizationId'],»; `prisma/schema.prisma:2042` — «conversations MotorConversation[] templates MotorTemplate[] alerts MotorAlert[]»; `tests/integration/motor-isolation.spec.ts:318` — «organization: { connect: { id: b.orgId } },»
- Impacto: La garantía documentada del helper (nested writes rechazados, re-parenting prohibido; scoped-model.ts:11-17) no cubre las dos relaciones que se agregaron en B1-S2/S3: el tipo WabaChannelUpdate (Omit de UncheckedUpdateInput) y el chequeo runtime de scoped-model.ts:331-337 dejan pasar templates/alerts, así que un update o create de canal con { templates: { connect: [{ id }] } } haría que Prisma reescriba organizationId/wabaChannelId de una plantilla o alerta de OTRA org hacia el canal propio. Hoy ningún caller arma ese data con input de usuario, así que no hay explotación directa, pero es el borde de aislamiento del motor de WhatsApp del primer cliente y el test negativo no lo cubre.
- Propuesta: Agregar 'templates' y 'alerts' a WABA_CHANNEL_NESTED; generar las listas de relaciones desde Prisma.dmmf o sumar un test que compare cada *_NESTED contra los campos de relación del schema, para que una relación nueva no quede abierta; sumar el caso al test (h) de motor-isolation.spec.ts.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.isolation, modelo.WabaChannel, modelo.MotorTemplate, modelo.MotorAlert, h3.vis-whatsapp
- REQUIERE-VERIFICACIÓN-HUMANA: VH-028

### [SEC-036] Credenciales de terceros en claro en la base: tokens OAuth de Google Business, token de Tiendanube, API key de Cal.com, token de Telegram y credenciales de la Bóveda
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `prisma/migrations/20260503150000_add_gbp_fields/migration.sql:5` — «ADD COLUMN "gbpAccessToken" TEXT, ADD COLUMN "gbpRefreshToken" TEXT,»; `prisma/migrations/20260504235814_add_tiendanube_fields/migration.sql:2` — «ALTER TABLE "Organization" ADD COLUMN "tiendanubeAccessToken" TEXT,»; `prisma/migrations/20260505000536_add_cal_com_fields/migration.sql:2` — «ALTER TABLE "Organization" ADD COLUMN "calComApiKey" TEXT,»; `src/app/api/auth/google-business/callback/route.ts:52` — «gbpAccessToken: tokens.access_token, gbpRefreshToken: tokens.refresh_token,»; `src/actions/agency-actions.ts:103` — «await prisma.clientAsset.create({ data: { organizationId,»; `prisma/schema.prisma:1704` — «// Auth opcional vía header (ej. "X-Webhook-Secret"). Secret cifrado AES-256-GCM // con env CRM_SECRET_KEY.»; `prisma/schema.prisma:360` — «gbpRefreshToken String? @db.Text»; `prisma/schema.prisma:367` — «tiendanubeAccessToken String? @db.Text»; `prisma/schema.prisma:375` — «calComApiKey String? @db.Text»; `prisma/schema.prisma:835` — «osTelegramBotToken String?»; `src/app/api/auth/google-business/callback/route.ts:53` — «gbpRefreshToken: tokens.refresh_token,»; `src/app/api/auth/tiendanube/callback/route.ts:67` — «tiendanubeAccessToken: tokens.access_token,»
- Impacto: Quien tenga lectura de la base o de un dump (la Neon dev es compartida con otro desarrollador) obtiene el refresh token de Google Business del cliente (permite responder reseñas en su nombre), acceso a su tienda, su API key de Cal.com, el token del bot de Telegram (AgencySettings, 20260406033000:3, escrito en claro en settings.actions.ts:161) y las credenciales de dominio/hosting cargadas en la Bóveda. El repo ya cifra en reposo el secret del CRM y la API key del motor, y tiene credential-cipher para la Bóveda, pero el cifrado de los write-paths (PD-1.2, commit 9fc616c4) quedó en la rama b0-isolation-motor-chatbot sin mergear.
- Propuesta: Cifrar en los write-paths con secret-box/credential-cipher (callbacks OAuth de GBP y Tiendanube, settings de Telegram, carga de Cal.com y assets de la Bóveda), backfill idempotente y lectura tolerante (resolve-credential ya soporta ambos formatos); mergear o portar 9fc616c4.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): modelo.Organization, modelo.AgencySettings, modelo.ClientAsset, int.google-business-profile, int.tiendanube, int.calcom, int.telegram, h2.cli-resenas, h2.cli-tienda, h2.cli-agenda, h2.cli-cuenta, int.gbp, lib.crypto
- REQUIERE-VERIFICACIÓN-HUMANA: VH-031

### [SEC-038] Notification es por usuario pero el portal la lee y la marca por organización: el cliente ve y apaga las notificaciones dirigidas al SUPER_ADMIN, con links a /admin/projects/<id>
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:718` — «userId String»; `src/app/(protected)/dashboard/layout.tsx:101` — «prisma.notification.findMany({ where: { organizationId },»; `src/lib/actions/notifications.ts:33` — «await prisma.notification.updateMany({ where: { id: parsed.data.id, organizationId },»; `src/lib/actions/notifications.ts:82` — «const notifications = await prisma.notification.findMany({ where: { organizationId },»; `src/actions/dashboard-actions.ts:67` — «userId: admin.id, organizationId, taskId: task.id,»; `src/actions/dashboard-actions.ts:70` — «actionUrl: '/admin/projects/${task.projectId}',»; `src/actions/agency-actions.ts:54` — «const notifications = orgMembers.map(member => ({»; `src/components/dashboard/NotificationCenter.tsx:125` — «router.push(notif.actionUrl)»
- Impacto: Cuando un cliente aprueba o rechaza una entrega, la campana de todos los miembros de su org muestra las notificaciones escritas para el SUPER_ADMIN ('Cliente pidio cambios en...', 'Entrega aprobada por cliente...'), con un link a /admin/projects/<id> que expone el id interno y rebota en el proxy; cada miembro ve también las copias de los demás (una por miembro en cada pedido de aprobación) y cualquiera las marca leídas para todos. Ninguna pantalla del admin lee Notification, así que los avisos al SUPER_ADMIN (upsell, mensajes, referidos, aprobaciones) solo terminan en la campana del cliente o en ningún lado.
- Propuesta: En dashboard/layout.tsx y lib/actions/notifications.ts (libres) filtrar lectura y marcado por { userId de la sesión, organizationId }. Decisión para Valentino (dashboard-actions.ts es FROZEN): no poner organizationId en las notificaciones del admin y decidir si el equipo necesita una bandeja propia o si esos avisos van solo por alerta/email.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-shell, h2.cli-proyecto, h4.adm-proyectos, modelo.Notification, lib.actions

### [SEC-039] La baja de una campaña puede caer en otro cliente: CONTACT_ID y OPTOUT_TOKEN se guardan en el contacto global de Brevo y el último import de ese email los pisa
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:114` — «CONTACT_ID: contact.id, OPTOUT_TOKEN: signEmailContactOptOutToken(contact.id),»; `src/lib/integrations/brevo.ts:49` — «listIds: params.listIds, updateEnabled: true,»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:155` — «/api/email/optout/{{contact.CONTACT_ID}}?token={{contact.OPTOUT_TOKEN}}»; `prisma/schema.prisma:1229` — «@@unique([organizationId, email])»; `src/app/api/email/optout/[contactId]/route.ts:91` — «await prisma.emailContact.updateMany({ where: { id: contactId },»
- Impacto: Si dos clientes de develOP tienen al mismo destinatario (caso común), el contacto de Brevo es uno solo por email en la cuenta compartida y queda con el CONTACT_ID del último cliente que importó. Cuando esa persona se da de baja desde la campaña del cliente A, el link apunta al EmailContact del cliente B: se marca optedOut en la base de B (escritura entre tenants disparada por un tercero) y A la sigue contando como activa. Un cliente con el módulo puede provocarlo a propósito importando emails de la lista de otro.
- Propuesta: No guardar ids por tenant en atributos globales de Brevo: firmar un token que incluya organizationId y email y resolver la fila por (org, email) en la ruta de baja, o usar atributos por lista/org y el desuscribe nativo por lista. Verificar el modelo de contactos de Brevo con el caso de prueba.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt, h6.vis-optout, int.brevo, modelo.EmailContact
- REQUIERE-VERIFICACIÓN-HUMANA: VH-037

### [SEC-040] El export masivo de leads del admin no neutraliza fórmulas: un visitante anónimo del widget puede inyectar una fórmula en un CSV que junta leads de varias organizaciones
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/bulk-actions.ts:50` — «const leads = await prisma.chatbotLead.findMany({ where: { botConfig: { organizationId: { in: uniqueOrgIds } } },»; `src/lib/bulk-actions.ts:74` — «.map((value) => '"${String(value).replace(/"/g, '""')}"')»; `src/modules/chatbot/server/leads/csv/csvEscape.ts:22` — «const DANGEROUS_PREFIX = /^[=+\-@\t\r]/»; `src/modules/chatbot/server/tools/captureLead.ts:59` — «name: z.string().min(2).max(100).describe(»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:121` — «const result = await bulkExportLeads([...selected])»
- Impacto: El export del cliente ya prefija las celdas peligrosas (csvEscape.ts:5-10 documenta este mismo ataque), pero el export del admin no: un visitante que deja como nombre '=HYPERLINK(...)' o una fórmula IMPORT convierte el CSV que develOP abre en Excel o Google Sheets en un vector para mandar a un tercero nombres, emails y teléfonos de los leads de todas las orgs seleccionadas.
- Propuesta: Reusar rowToCsv/csvEscape de modules/chatbot/server/leads/csv en bulkExportLeads (y en cualquier otro CSV del admin); agregar un invariante que busque armados de CSV con join(',') fuera de ese helper.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes, h3.vis-widget-cliente, modelo.ChatbotLead, lib.actions
- REQUIERE-VERIFICACIÓN-HUMANA: VH-040

### [SEC-041] El seed del chatbot y update-proactive-prompts escriben en cualquier DATABASE_URL sin guard, aunque el escape los rotula 'script de dev' y ese seed define el bot de producción de develOP
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/prisma/seed.ts:272` — «const botConfig = await unsafeGlobalQuery('SEED: upsert del bot develOP (script de dev)', (c) =>»; `src/modules/chatbot/prisma/seed.ts:275` — «update: { // Update mantiene el id pero refresca todo el contenido»; `src/modules/chatbot/prisma/seed.ts:342` — «const kb = await unsafeGlobalQuery('SEED: upsert de la KB del bot develOP (script de dev)', (c) =>»; `src/modules/chatbot/prisma/update-proactive-prompts.ts:23` — «'SEED: update de proactivePrompts del bot develOP por slug (script de dev)',»; `docs/bitacora-roadmap.md:10815` — «- **Bot de la agencia**: vive en 'src/modules/chatbot/prisma/seed.ts' (org 'develop', slug 'develop'), no en el seed principal.»; `prisma/seed.ts:20` — «import { assertDevSeedTarget, requireSeedPassword } from './seed-guard.ts'»
- Impacto: Correr 'npx tsx src/modules/chatbot/prisma/seed.ts' con el .env apuntando a prod (es el camino documentado para el bot de la agencia) pisa sin dry-run ni confirmación toda la config del bot público de develOP (activo, bienvenida, quick replies, WhatsApp, modelo, cuota) y las siete secciones de su knowledge base con los valores del código, borrando cualquier ajuste hecho desde el admin. La razón 'script de dev' de los cuatro escapes SEED es falsa: no hay guard y el script es la fuente del bot de producción.
- Propuesta: Agregar assertDevSeedTarget o un flag explícito de destino más un dry-run con diff antes de escribir; corregir las razones de los escapes SEED para que digan mantenimiento de prod; separar la provisión del bot de prod en un script con confirmación.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-034]
- Nodo(s): lib.seeds, lib.isolation, modelo.BotConfig, modelo.KnowledgeBase, int.neon

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

### [SEC-034] El guard anti-prod de los seeds compara por substring sobre toda la URL
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `prisma/seed-guard.ts:26` — «if (databaseUrl.includes(DEV_HOST_FRAGMENT)) {»; `prisma/seed-guard.ts:29` — «return LOCAL_FRAGMENTS.some((fragment) => databaseUrl.includes(fragment))»; `prisma/seed-guard.ts:43` — «if (process.env.ALLOW_PROD_SEED === '1') {»; `prisma/seed-guard.ts:15` — «* Prisma NO carga '.env.local'; las SEED_*_PASSWORD viven en '.env' (gitignored).»; `prisma.config.ts:23` — «loadEnv({ path: '.env.local' })»
- Impacto: Una URL que contenga 'localhost', '127.0.0.1' o el id del endpoint dev en cualquier parte (usuario, password, parámetros) pasa el guard, y con ALLOW_PROD_SEED=1 el seed corre contra cualquier destino con solo un aviso. El comentario dice que .env.local no se carga, pero prisma db seed lo carga primero, así que el destino real depende de cómo se invoca. Son seeds de dev: riesgo operativo.
- Propuesta: Parsear la URL con new URL() y comparar hostname exacto contra una lista de hosts permitidos; exigir que el override nombre el host esperado (ALLOW_PROD_SEED=<host>) y corregir el comentario de seed-guard.ts:13-15.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.seeds, int.neon

### [SEC-042] /api/track no tiene consumidores y acepta escrituras ilimitadas en PageView: sin Zod, sin tope de largo ni rate limit, y el SUPER_ADMIN elige la org por body
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/api/track/route.ts:20` — «const url = String(data?.url ?? '')»; `src/app/api/track/route.ts:24` — «const organizationId = session.user.role === 'SUPER_ADMIN' ? bodyOrgId ?? session.user.organizationId ?? null»; `src/app/api/track/route.ts:33` — «await prisma.pageView.create({»
- Impacto: Cualquier sesión de cliente puede insertar filas sin límite y con URLs de cualquier tamaño en la Neon compartida (tabla sin lectores ni purga), y el admin puede imputar visitas a cualquier org por body; no aporta nada al producto.
- Propuesta: Borrar la ruta y el modelo (candidato a poda) o, si se va a usar, validar con Zod (url acotada), aplicar rate limit por sesión y tomar la org solo de resolveOrgId.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-shell, modelo.PageView

### [SEC-043] El tope de 3 regeneraciones semanales del brief es check-then-act: pedidos en paralelo pasan todos el control y cada uno llama al LLM
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/ai/executive-brief.ts:157` — «if (currentRegenerations >= REGENERATION_LIMIT) {»; `src/lib/ai/executive-brief.ts:185` — «const generation = await generateBriefText(organizationId, org.companyName, now)»; `src/lib/ai/executive-brief.ts:201` — «executiveBriefRegenerations: nextRegenerations,»; `src/app/(protected)/dashboard/_actions/regenerate-brief.ts:19` — «const result = await regenerateExecutiveBrief(orgId.data)»
- Impacto: Hoy sin efecto (credencial de Vertex vencida). Con Vertex activo, un usuario de cualquier cliente que dispare N llamadas simultáneas a regenerateBriefAction obtiene N generaciones pagadas por develOP y el contador queda en 1; puede repetirlo cada 4 horas hasta tres veces por semana.
- Propuesta: Reservar el cupo antes de llamar al LLM con un update condicional (where executiveBriefRegenerations < 3 y última regeneración vieja, con increment) y seguir solo si afectó una fila, o sumar checkRateLimit por org.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio, int.vertex, modelo.Organization
- REQUIERE-VERIFICACIÓN-HUMANA: VH-042

## Bugs latentes

### [BUG-002] El alta de cliente guarda el email tal cual se tipeo: con una mayuscula el cliente no puede entrar por ningun metodo
- Dominio: D1  ·  Severidad: ALTA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/admin/createClientOnly.ts:26` — «userEmail: z.string().email(),»; `src/modules/chatbot/server/admin/createClientOnly.ts:91` — «email: parsed.userEmail,»; `src/modules/chatbot/server/admin/createClientWithBot.ts:141` — «email: parsed.userEmail,»; `src/lib/onboarding/core.ts:91` — «email: input.userEmail,»; `src/auth.ts:143` — «where: { email: String(credentials.email).trim().toLowerCase() },»; `src/lib/actions/clients.ts:96` — «// FIX 3 — email casing. Normalizamos a lowercase para alinear con el login»; `prisma/schema.prisma:289` — «email String @unique»; `prisma/schema.prisma:1229` — «@@unique([organizationId, email])»
- Impacto: Bloqueante para el primer cliente real: si el admin carga 'Juan@Empresa.com' (o el teclado del celular capitaliza), el User queda con mayuscula; el login con contrasena (auth.ts:143), el magic link (signIn callback auth.ts:176-184) y forgot-password (ForgotPasswordSchema toLowerCase, schemas.ts:80) buscan en minuscula con igualdad exacta -> 'Email o contrasena incorrectos' para siempre. Tambien permite duplicados que difieren solo en mayusculas. El arreglo ya existe en el camino viejo (clients.ts:96-100) y en updateClient.ts:71, pero no en los tres caminos vivos de alta.
- Propuesta: (libre) Normalizar con .trim().toLowerCase() en los schemas de alta (createClientOnly.ts:26, createClientWithBot.ts:34, admin/chatbots/new/actions.ts:27 / onboarding/core.ts) y en el wizard (Step1Company.tsx:169); script de datos que pase a minuscula los emails existentes verificando colisiones (sin migrate reset).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.login-password, h1.auth-login.magic-link, h4.adm-clientes, modelo.User, modelo.EmailContact, h1.auth-login, h2.cli-email-mkt

### [BUG-012] Email Marketing Pro inalcanzable: el gate y el sidebar buscan el slug 'email-marketing' y el catálogo sincronizado usa 'email-marketing-pro'
- Dominio: D6  ·  Severidad: ALTA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/data/premium-modules.ts:38` — «slug: 'email-marketing-pro',»; `src/app/(protected)/dashboard/modules/email-marketing/layout.tsx:20` — «const isActive = await isModuleActive(organizationId, 'email-marketing') if (!isActive) redirect('/dashboard')»; `src/components/dashboard/SidebarNav.tsx:78` — «{ slug: 'email-marketing', item: { href: '/dashboard/modules/email-marketing', label: 'Email marketing', icon: Mail } },»; `src/app/(protected)/dashboard/layout.tsx:57` — «where: { organizationId: orgId, status: 'ACTIVE' }, select: { module: { select: { slug: true } } },»; `prisma/seeds/sync-premium-modules.ts:68` — «const obsoleteModules = existingModules.filter((moduleData) => !catalogSlugs.has(moduleData.slug))»; `prisma/backups/premium-module-pre-push.json:68` — «"slug": "email-marketing",»
- Impacto: Bloqueante para el primer cliente que contrate Email Marketing Pro: el catálogo (y por lo tanto la tabla premium_module después del sync) solo tiene 'email-marketing-pro', pero el sidebar solo muestra el ítem si el slug activo es 'email-marketing' y el layout del módulo redirige a /dashboard sin mensaje cuando isModuleActive(org, 'email-marketing') es falso. Solo funcionaría si la base conserva la fila legacy 'email-marketing' (anterior al cambio del 2026-05-04) y el admin activó esa. Como el gate vive solo en el layout, las server actions del módulo siguen invocables directamente (ver S2b-01).
- Propuesta: Unificar el slug con una sola constante derivada de PREMIUM_MODULES_CATALOG (mapa slug -> ruta) y usarla en el layout del módulo y en PREMIUM_MODULES de SidebarNav; revisar qué slugs hay hoy en premium_module y mover activaciones legacy si existen; agregar un invariante que compare los slugs usados en isModuleActive/SidebarNav contra el catálogo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt, h2.cli-email-mkt.acceso-al-modulo, h2.cli-servicios, lib.data, modelo.PremiumModule, modelo.OrganizationModule
- REQUIERE-VERIFICACIÓN-HUMANA: VH-027

### [BUG-021] La baja de email marketing no llega a Brevo: la campaña sale a toda la lista y quien se dio de baja sigue recibiendo (un reimport lo vuelve a sumar)
- Dominio: D2  ·  Severidad: ALTA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/api/email/optout/[contactId]/route.ts:91` — «await prisma.emailContact.updateMany({ where: { id: contactId }, data: { optedOut: true, optedOutAt: new Date() },»; `src/app/api/email/optout/[contactId]/route.ts:100` — «'Tu dirección de email fue removida de esta lista. No recibirás más correos de esta campaña.',»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:194` — «listIds: [listId],»; `src/lib/integrations/brevo.ts:77` — «recipients: { listIds: params.listIds },»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:144` — «where: { organizationId: org.id, optedOut: false },»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:104` — «if (listId) { await syncContact({»
- Impacto: Bloqueante para el primer cliente que use Email Marketing: la baja solo cambia optedOut en la base; la campaña se manda a la lista de Brevo completa, así que la persona sigue recibiendo aunque la página le confirmó que fue removida, y si el cliente reimporta su CSV el contacto vuelve a entrar a la lista. Expone al cliente a denuncias por spam y a develOP a la suspensión de la cuenta Brevo compartida; recipientCount (cuenta solo los no dados de baja) tampoco coincide con lo que Brevo envía.
- Propuesta: Al darse de baja, sacar el contacto de la lista de la org en Brevo (o bloquearlo) además de marcar optedOut; en el import saltear los optedOut; o usar el desuscribe nativo de Brevo y sincronizar su webhook de bajas a EmailContact. Confirmar el comportamiento real de Brevo con el caso de prueba.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt, h6.vis-optout, int.brevo, modelo.EmailContact, modelo.EmailCampaign
- REQUIERE-VERIFICACIÓN-HUMANA: VH-036

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

### [BUG-010] El portal muestra un precio de plan desactualizado: Subscription.price solo se escribe al crear la suscripción
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:659` — «price Float»; `src/app/(protected)/admin/clients/_actions/plan.actions.ts:179` — «const subData: Prisma.SubscriptionUncheckedUpdateInput = {»; `src/app/(protected)/admin/clients/_actions/plan.actions.ts:192` — «price: targetPlan.monthlyPrice.toNumber(),»; `src/lib/plan/get-plan-for-org.ts:53` — «planId: sub.pendingPlanId,»; `src/app/(protected)/dashboard/cuenta/perfil/page.tsx:211` — «price: org.subscription.price,»; `src/components/dashboard/ProfileForms.tsx:662` — «{plan.currency} {plan.price.toLocaleString('es-AR')}»
- Impacto: Después de un upgrade (plan.actions.ts:197-200) o de un downgrade diferido (get-plan-for-org.ts:50-58), el cliente ve en /dashboard/cuenta/perfil el nombre del plan nuevo con el precio del anterior; un priceOverride vigente tampoco se muestra. El primer cliente real que cambie de plan va a ver un precio distinto del que se le cobra.
- Propuesta: Una sola fuente: mostrar el precio efectivo (priceOverride vigente o Plan.monthlyPrice) en lugar de Subscription.price, o actualizar price en las dos rutas de cambio de plan. Eliminar Subscription.price si queda sin uso es decisión para Valentino (schema FROZEN).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-cuenta, h4.adm-clientes, modelo.Subscription, modelo.Plan

### [BUG-011] seed-agency-os aborta siempre en el proyecto interno: el mapa de orgs nunca recibe 'develop'
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `prisma/seed-agency-os.ts:1302` — «organizationSlug: null,»; `prisma/seed-agency-os.ts:2398` — «organizationIdBySlug.set(organizationSeed.slug, organization.id)»; `prisma/seed-agency-os.ts:2422` — «const effectiveSlug = projectSeed.organizationSlug ?? 'develop'»; `prisma/seed-agency-os.ts:2426` — «throw new Error('No se encontro organizationId para ${effectiveSlug}')»; `prisma/seed-agency-os.ts:2453` — «'- Nota: el proyecto interno ya se siembra con organizationId = null.',»
- Impacto: El dataset de QA de Agency OS queda siempre a medias: se siembran 2 de 4 proyectos, nunca el de Sigma (con pagos de mantenimiento) ni las ContactSubmission, y el proceso sale con código 1. No depende de que exista la org 'develop' en la base: el mapa solo recibe los 3 slugs de organizationSeeds (:396-455). Sin impacto directo en un cliente, pero las pantallas de proyectos, horas y mantenimiento no se pueden verificar con datos sembrados.
- Propuesta: Resolver la org del proyecto interno consultando la base por slug (o agregar la org interna a organizationSeeds) antes del bucle de proyectos, o quitar el proyecto interno del seed; corregir el mensaje de :2453. Cierra PLAN-1061 y PLAN-993.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.seeds, modelo.Project, modelo.Organization, h4.adm-proyectos

### [BUG-013] update/delete del helper con id undefined en runtime operan sobre todas las filas del tenant (o sobre el bot por organizationId único)
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/isolation/scoped-model.ts:235` — «const batch = await this.unsafe.updateMany({ where: this.scopedWhere({ id }), data: prepared })»; `src/lib/isolation/scoped-model.ts:262` — «const existing = await this.findById(id) if (existing === null) throw new IsolationNotFoundError(this.cfg.model, id) const batch = await this.unsafe.deleteMany({ where: this.scopedWhere({ id }) })»; `src/lib/isolation/scoped-model.ts:223` — «return (await this.unsafe.update({ where: { id, organizationId: this.organizationId },»; `prisma/schema.prisma:1274` — «organizationId String @unique»
- Impacto: Prisma ignora las claves con valor undefined: en los 8 modelos con scope relacional (Conversation, ChatMessage, ChatbotLead, KnowledgeBase, ChatbotInsight, QuotaUsage, ChatbotEvent, BotAlert) update(undefined) actualiza todas las filas de la org y delete(undefined) las borra todas (findById(undefined) devuelve la primera); en BotConfig y CrmIntegration el where queda en organizationId, que es único, y delete borraría el bot entero con su cascada. Los callers actuales pasan ids validados por Zod o leídos de la base (updateLeadStatus.ts:42, manageInsight.ts:37, updateBotAppearance.ts:95), así que es una trampa latente dentro de un mismo tenant, en la primitiva que protege los datos del cliente.
- Propuesta: Validar en ScopedModelDelegate.findById/update/delete que id sea string no vacío y lanzar IsolationError si no; agregar el caso al test de aislamiento.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.isolation, modelo.BotConfig, modelo.ChatbotLead, modelo.Conversation, modelo.CrmIntegration
- REQUIERE-VERIFICACIÓN-HUMANA: VH-029

### [BUG-014] El deploy a producción ya no aplica migraciones (sacado en b85f791d) y la documentación sigue diciendo que Netlify lo hace
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `netlify.toml:2` — «command = "npx prisma generate && npm run build"»; `package.json:9` — «"build": "next build --webpack",»; `prisma/migrations/20260522214201_drop_user_unlocked_features/migration.sql:11` — «-- Riesgo: zero (data migrada + cero readers). Netlify autoaplica esta -- migración en el próximo deploy de main.»; `docs/operations/00-entornos.md:86` — «| Aplicar migraciones a prod | 'main' | Netlify lo hace en build ('prisma migrate deploy' en el script de build) o se corre manualmente»; `DEPLOY.md:52` — «npx prisma migrate deploy»; `prisma/migrations/20260622120000_readd_client_columns_dropped_by_reconcile/migration.sql:4` — «-- declara y la DB no tiene NO rompe el build, rompe en RUNTIME (Prisma default-select pide»; dato de la auditoría, _crudo/prisma-migrate-status.txt línea 9 — «error: Environment variable not found: DATABASE_URL.»
- Impacto: Desde el 2026-06-28 (commit b85f791d quitó 'npx prisma migrate deploy' del build) cada migración nueva —12 con timestamp posterior, incluidas las del motor y los índices del portal— depende de que alguien corra migrate deploy a mano contra la branch main de Neon. Si se deploya código que lee una columna nueva antes de correrla, Prisma la pide en el select por defecto y las pantallas de ese modelo fallan en producción para todos los clientes; nada en el build ni en CI detecta migraciones pendientes.
- Propuesta: Decidir el mecanismo y dejarlo escrito: o volver a migrate deploy en el build (con conexión directa sin pooler) o un paso obligatorio de checklist/CI que corra migrate status contra prod y bloquee si hay pendientes; corregir 00-entornos.md y no afirmar autoaplicación en comentarios de migraciones.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.prisma, int.neon, int.netlify, lib.migraciones
- REQUIERE-VERIFICACIÓN-HUMANA: VH-030

### [BUG-015] El hard-delete de un cliente borra en cascada los registros financieros de la agencia y los leads del bot (que el resumen subinforma) y deja vivos a sus usuarios
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `prisma/migrations/20260525182135_b11_1_project_organizationid_not_null/migration.sql:17` — «ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;»; `prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:198` — «ALTER TABLE "OsPaymentMilestone" ADD CONSTRAINT "OsPaymentMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;»; `src/modules/chatbot/server/admin/hardDeleteClient.ts:49` — «_count: { select: { projects: true, tickets: true, messages: true, clientAssets: true },»; `src/modules/chatbot/server/admin/hardDeleteClient.ts:141` — «await tx.organization.delete({ where: { id: organizationId } })»; `src/modules/chatbot/server/admin/createClientOnly.ts:66` — «if (existingUser) throw new Error('El email ingresado ya está registrado en el sistema.')»; `prisma/schema.prisma:528` — «organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)»; `src/modules/chatbot/server/admin/hardDeleteClient.ts:84` — «where: { botConfigId: botId, convertedToOsLeadId: null },»; `prisma/schema.prisma:1441` — «botConfig BotConfig @relation(fields: [botConfigId], references: [id], onDelete: Cascade)»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:190` — «// (p. ej. desde un ticket "Solicitud de eliminación de cuenta"). La action y el»
- Impacto: Al atender una solicitud de baja (el admin enlaza ?delete=<orgId> desde el ticket) se borran hitos de pago, pagos de mantenimiento y horas cargadas (OsPaymentMilestone/OsMaintenancePayment/OsTimeEntry, también :201 y :207), que son contabilidad de develOP, sin que el modal los mencione. Los User del cliente quedan sin org con email, nombre, teléfono y hash de contraseña: la baja no elimina sus datos personales y el email queda bloqueado para un alta nueva.
- Propuesta: Contar y mostrar pagos y horas en el resumen; decidir si se preservan (exportarlos antes o desacoplarlos con SetNull, cambio de schema FROZEN: decisión para Valentino); borrar o anonimizar en la misma transacción los User que solo pertenecían a esa org.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes, h4.adm-clientes.eliminar-cliente, modelo.Project, modelo.OsPaymentMilestone, modelo.OsMaintenancePayment, modelo.OsTimeEntry, modelo.User, modelo.OrgMember, modelo.ChatbotLead

### [BUG-016] sync-premium-modules borra activaciones no activas de clientes (PAUSED/CANCELLED/INACTIVE) al retirar un slug del catálogo, sin dry-run ni transacción
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `prisma/seeds/sync-premium-modules.ts:73` — «const activeReferences = await prisma.organizationModule.count({ where: { moduleId: moduleData.id,»; `prisma/seeds/sync-premium-modules.ts:105` — «await prisma.organizationModule.deleteMany({ where: { moduleId: { in: obsoleteIds },»; `prisma/seeds/sync-premium-modules.ts:112` — «const deleteResult = await prisma.premiumModule.deleteMany({»; `src/lib/data/premium-modules.ts:18` — «* Catálogo completo de módulos premium. * SOURCE OF TRUTH del catálogo. Cualquier cambio se hace acá.»
- Impacto: Renombrar o retirar un slug y correr el sync (declarado prod-runnable, sin guard) borra en todas las orgs el historial de módulos pausados o cancelados y sus contadores de upsell, sin backup; el chequeo (solo cuenta ACTIVE) y los borrados no son atómicos, así que una activación concurrente deja el sync a medias. Es el mismo mecanismo por el que el slug legacy 'email-marketing' quedó fuera de la base.
- Propuesta: Dry-run por defecto, $transaction, y en vez de borrar marcar el módulo como DEPRECATED (el enum ya existe) preservando las activaciones; borrar solo con confirmación explícita.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-servicios, modelo.OrganizationModule, modelo.PremiumModule, lib.data

### [BUG-017] El precio de los módulos tiene dos fuentes de verdad: la home pública lee el catálogo en código, el portal lee la DB que edita el admin, y el sync revierte la edición
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/components/sections/modulos-opcionales/ModuloActiveCard.tsx:248` — «${module.priceMonthlyUsd}»; `src/app/(protected)/admin/settings/_actions/settings.actions.ts:193` — «await prisma.premiumModule.update({ where: { id: moduleRow.id }, data: { priceMonthlyUsd: parsed.price },»; `prisma/seeds/sync-premium-modules.ts:54` — «existing.priceMonthlyUsd !== nextData.priceMonthlyUsd ||»; `src/app/(protected)/dashboard/services/page.tsx:177` — «prisma.premiumModule.findMany({»
- Impacto: Si el admin ajusta un precio en /admin/settings, el portal del cliente muestra el nuevo pero la home pública (src/app/page.tsx:39 -> ModulosOpcionales) sigue con el del código, y la próxima corrida del sync (sync-premium-modules.ts:145-148) lo pisa sin aviso. El primer cliente puede ver en su panel un precio distinto del publicado.
- Propuesta: Elegir una sola fuente: o el precio vive solo en la DB (la home lo lee de ahí con cache y el sync deja de tocarlo), o se quita la edición de precio del admin.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-config, h4.adm-config.precio-modulos, h2.cli-servicios, lib.data, modelo.PremiumModule

### [BUG-019] La migración v2-unify-project-task partió clientes en organizaciones duplicadas por un match difuso de nombres; la limpieza en prod sigue pendiente
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:46` — «ON lower(regexp_replace(org."companyName", ...)) = lower(regexp_replace(op."businessName", ...)) OR org."companyName" ILIKE op."businessName" || '%' OR op."businessName" ILIKE org."companyName" || '%'»; `prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:53` — «COALESCE(op."organizationId", om."organizationId", 'os-org-' || op."id") AS "resolvedOrganizationId",»; `prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:136` — «WHEN 'CANCELADO' THEN 'COMPLETED'::"ProjectStatus"»; `docs/audits/2026-05-cleanup-db-dev.md:13` — «Se removieron 2 orgs duplicadas leftover del seed 'v2-unify-project-task' (abril)»; `docs/audits/2026-05-cleanup-db-dev.md:6` — «**Estado:** ✅ Ejecutado y verificado en dev. **Pendiente replicar en prod** (branch 'main' de Neon).»; `prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:47` — «OR org."companyName" ILIKE op."businessName" || '%'»; `prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:48` — «OR op."businessName" ILIKE org."companyName" || '%'»
- Impacto: Lectura de las 14 sentencias DML pedidas: :29 y :77 asignan proyectos internos a una org por prefijo de nombre (ILIKE sin escapar comodines; puede caer en el cliente equivocado) o crean una org sintética 'os-org-*' sin miembros cuando no matchea —así nacieron los duplicados de Sigma y Sonrisa con su propio proyecto y hasta un bot—; :114 los materializa en Project, visible en el portal; :136 convierte CANCELADO en COMPLETED y :135 EN_MANTENIMIENTO en IN_PROGRESS; :153 pierde el asignado de las tareas; y el DROP TABLE OsProject (20260406040000:2) borró contacto, serviceType y fechas. Las otras 9 (multi_tenancy:24, v2:182, allow_internal:6/:14/:21 sobre la org interna, b11_4b:16-20 normalización a mayúsculas) no mezclan ni pierden datos de clientes. Si prod corrió la misma migración, puede tener orgs duplicadas o proyectos en el tenant equivocado.
- Propuesta: Correr en prod los SELECT de solo lectura del caso de prueba (orgs 'os-org-%'/'agency-os-%' y proyectos con osLeadId cuyo businessName no coincide con la org) y ejecutar la limpieza B0.3 (PLAN-1169) si aparecen; las migraciones no se editan.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): modelo.Project, modelo.Organization, modelo.Task, h2.cli-proyecto, h4.adm-proyectos, lib.migraciones
- REQUIERE-VERIFICACIÓN-HUMANA: VH-033

### [BUG-020] Sin timeouts ni reintento ante el cold start de Neon fuera del chat, y el datasource no declara directUrl
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/prisma.ts:5` — «export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })»; `prisma/schema.prisma:5` — «datasource db { provider = "postgresql" url = env("DATABASE_URL")»; `src/modules/chatbot/hooks/useChatbot.ts:274` — «// INFRA.2 — Reintento acotado para el cold-start de Neon (branch free): un»; `src/lib/prisma.ts:6` — «globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })»; `.env.example:25` — «DATABASE_URL=»; `src/modules/chatbot/server/logging/logger.ts:118` — «* P2024 pool timeout, P1001 connect) — el discriminador para el sprint de causa raíz.»
- Impacto: Tras el auto-suspend de Neon, el primer login, el formulario de contacto público y las páginas del portal dependen del timeout por defecto del driver; solo el widget del chatbot reintenta. El primer acceso del día del primer cliente puede terminar en error.tsx. Sin directUrl, las migraciones pasan por el pooler (PLAN-1087/1138).
- Propuesta: Decisión para Valentino (prisma.ts y schema.prisma son FROZEN): connect_timeout/pool_timeout en la URL, directUrl para migraciones y un reintento acotado para P1001/P1017 en las rutas públicas críticas o en el cliente compartido.
- Esfuerzo: M  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): lib.prisma, int.neon, h1.auth-login, h6.vis-contacto, h3.vis-api-chatbot
- REQUIERE-VERIFICACIÓN-HUMANA: VH-034

### [BUG-022] Mi Chatbot resuelve la organización con su propia consulta (orgMember.findFirst sin orderBy) e ignora resolveOrgId: la vista previa del admin no ve el bot del cliente y con dos membresías muestra otra org
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/getClientSession.ts:15` — «c.orgMember.findFirst({ where: { userId: session.user.id },»; `src/lib/preview.ts:14` — «if (role === 'SUPER_ADMIN') { const impersonation = await getImpersonationSession() return impersonation?.orgId ?? null»; `src/app/(protected)/dashboard/chatbot/page.tsx:24` — «const session = await getClientChatbotSession() if (!session) return <ChatbotUpsellLanding />»; `src/app/(protected)/dashboard/chatbot/leads/page.tsx:36` — «const session = await getClientChatbotSession() if (!session) redirect('/dashboard')»; `src/app/api/dashboard/chatbot/leads/export/route.ts:84` — «const session = await getClientChatbotSession()»; `src/modules/chatbot/server/dashboard/updateBotAppearance.ts:61` — «const orgId = await resolveOrgId()»; `prisma/seed.ts:82` — «const admin = await prisma.user.upsert({»
- Impacto: Soporte no puede revisar el chatbot de un cliente impersonándolo: con un SUPER_ADMIN sin OrgMember (así lo siembra el seed) /dashboard/chatbot muestra la landing de 'activá tu chatbot' aunque checkClientHasChatbot (con resolveOrgId, page.tsx:15-18) dijo que hay bot, leads y conversaciones redirigen a /dashboard y el CSV da 401, mientras la apariencia sí se edita sobre el cliente. Si un usuario tiene membresías en dos orgs, esta sección puede mostrar y modificar (estado de leads, insights) una org distinta de la del resto del portal en el mismo request.
- Propuesta: Que getClientChatbotSession derive la org de resolveOrgId() (o reciba el orgId) y lea org y bot con select acotado; agregar un invariante que prohíba orgMember.findFirst sin orderBy como resolución de tenant. Verificar en prod (solo lectura) si los SUPER_ADMIN tienen OrgMember.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-005], [SEC-029]
- Nodo(s): h3.cli-chatbot, h1.auth-impersonacion, lib.chatbot.admin, modelo.OrgMember
- REQUIERE-VERIFICACIÓN-HUMANA: VH-038

### [BUG-023] Los insights del chatbot quedan PENDING para siempre: ninguna pantalla llama a actOnInsight y el cron deja de generar para ese bot al quinto pendiente
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/api/cron/generate-insights/route.ts:38` — «if (pendingCount >= 5) { results.skipped_pending_overload++»; `src/modules/chatbot/server/insights/manageInsight.ts:15` — «export async function actOnInsight(input: z.infer<typeof InsightActionSchema>) {»; `src/modules/chatbot/server/analysis/getMonthlyAnalysisForOrg.ts:62` — «where: { botConfigId, status: { in: ['PENDING', 'APPLIED'] } },»; `src/app/api/cron/generate-insights/route.ts:66` — «dashboardUrl: '${process.env.NEXT_PUBLIC_APP_URL}/dashboard/chatbot',»; `netlify.toml:25` — «[functions."generate-insights-cron"] schedule = "0 9 * * *"»
- Impacto: Para un cliente Pro/Business: el cron diario genera insights con Vertex y le manda un email para verlos en /dashboard/chatbot, donde no aparecen (solo se listan, sin acciones, en Resultados > Análisis). Como nada los saca de PENDING (actOnInsight no tiene consumidores e IGNORED no tiene escritor), al juntar cinco el bot queda excluido del cron para siempre: los 'Insights semanales' que promete la landing se cortan a los pocos días.
- Propuesta: Agregar en Análisis los botones Aplicar/Descartar que llamen a actOnInsight, o expirar a IGNORED los PENDING viejos dentro del cron; corregir el link del email a la página que los muestra.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, h2.cli-resultados, int.cron.generate-insights, int.vertex, modelo.ChatbotInsight

### [BUG-024] El plan y BotConfig son dos fuentes de verdad: el chat corta por Plan.quota y usa el modelo del plan con temperatura fija, pero el admin edita y el detector de alertas lee BotConfig.monthlyQuota (1000) y maxOutputTokens no se aplica
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/chat/handleChatRequest.ts:345` — «if (quota.conversationsUsed >= plan.quota) {»; `src/modules/chatbot/server/chat/handleChatRequest.ts:952` — «temperature: 0.7,»; `src/modules/chatbot/server/admin/detectBotIssues.ts:68` — «if (usage && usage.conversationsCount >= bot.monthlyQuota) {»; `src/modules/chatbot/server/admin/createClientWithBot.ts:186` — «monthlyQuota: 1000,»; `prisma/seeds/sync-plans.ts:72` — «quota: 500,»; `src/modules/chatbot/server/admin/saveBotConfig.ts:45` — «llmModel: z.string().min(1).max(80), temperature: z.number().min(0).max(2), maxOutputTokens: z.number().int().min(100).max(8192),»; `src/app/(protected)/admin/chatbots/[botId]/tabs/OverviewTab.tsx:98` — «value={'${quotaUsed.toLocaleString('es-AR')} / ${bot.monthlyQuota.toLocaleString('es-AR')}'}»
- Impacto: Con el primer cliente Starter el bot se corta a 500 conversaciones pero la alerta QUOTA_EXHAUSTED compara contra 1000 y nunca dispara; con Pro o Business (3000/5000, sync-plans.ts:88 y :104) dispara a 1000 aunque el bot sigue funcionando. El admin ve '500 / 1000' y el cliente ve el límite del plan. Editar modelo, temperatura, tope de salida o cuota en el admin no cambia nada en runtime, y como streamText no recibe maxOutputTokens, cada uno de los hasta 3 pasos de un turno puede generar el máximo del modelo: el costo por turno de un visitante anónimo no tiene tope configurable.
- Propuesta: Sacar del editor del admin los campos legacy (o mostrarlos solo lectura con el valor del plan); que detector, preflight y fichas del admin usen getPlanForOrg().quota; pasar maxOutputTokens explícito en streamText. Decisión para Valentino (schema FROZEN): borrar las columnas legacy de BotConfig.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots, h4.adm-alertas, h3.vis-api-chatbot, modelo.BotConfig, modelo.Plan, lib.plan, int.vertex

### [BUG-025] EmailCampaign sin estado intermedio ni métricas: SENDING y SCHEDULED no se escriben (doble envío posible), FAILED no tiene reintento y aperturas y clics nunca se actualizan
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:181` — «if (campaign.status !== 'DRAFT') return { error: 'Solo podés enviar campañas en estado DRAFT.' }»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:205` — «const sent = await brevoSendCampaign(brevoResult.campaignId)»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:210` — «status: sent ? 'SENT' : 'FAILED',»; `prisma/schema.prisma:1141` — «enum EmailCampaignStatus { DRAFT SCHEDULED»; `src/lib/integrations/brevo.ts:143` — «export async function getCampaignStats(campaignId: number): Promise<{»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/page.tsx:110` — «{pct(campaign.openedCount, campaign.recipientCount)}»
- Impacto: Cuando el módulo se habilite: dos envíos concurrentes de la misma campaña (dos pestañas, un reintento) pasan el control de DRAFT y Brevo crea y manda dos campañas a toda la lista; una campaña FAILED (por ejemplo Brevo la creó pero sendNow falló) no se puede reintentar y queda huérfana en Brevo; y la tabla de campañas muestra 0% de aperturas y clics para siempre porque getCampaignStats no tiene llamadores (dato falso en el camino del cliente).
- Propuesta: Pasar DRAFT a SENDING con updateMany condicional (where status DRAFT) antes de llamar a Brevo y abortar si no afectó filas; permitir reintento de FAILED reusando el brevoCampaignId guardado; traer las métricas con getCampaignStats (cron o al abrir la tabla) o webhook de Brevo, u ocultar las columnas.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt, int.brevo, modelo.EmailCampaign
- REQUIERE-VERIFICACIÓN-HUMANA: VH-039

### [BUG-004] El rol CLIENT existe en el enum pero el proxy lo expulsa de /dashboard: un usuario CLIENT queda en bucle
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `prisma/schema.prisma:15` — «CLIENT»; `src/proxy.ts:154` — «if (isDashboardRoute && role !== USER_ROLE && !(role === ADMIN_ROLE && isImpersonating)) {»; `src/lib/preview.ts:10` — «if (role === 'ORG_MEMBER') {»; `prisma/migrations/20260519232631_add_client_role_and_password_reset_required/migration.sql:2` — «ALTER TYPE "Role" ADD VALUE 'CLIENT';»; `prisma/migrations/20260320200000_multi_tenancy_organizations/migration.sql:84` — «ALTER TYPE "Role" RENAME VALUE 'CLIENT' TO 'ORG_MEMBER';»; `src/modules/chatbot/server/admin/createClientOnly.ts:94` — «role: 'ORG_MEMBER',»; `src/auth.config.ts:4` — «type Role = 'SUPER_ADMIN' | 'ORG_MEMBER' | 'CLIENT' | 'SETTER'»
- Impacto: Latente (ningun codigo asigna CLIENT, git grep vacio), pero un usuario CLIENT con org pasa el signIn y queda en bucle /dashboard -> /login -> /dashboard (proxy.ts:143-145); resolveOrgId le devuelve null. CLAUDE.md documenta 'ORG_MEMBER / CLIENT -> /dashboard/*', lo contrario del codigo.
- Propuesta: Decidir: declarar CLIENT legacy (y corregir la doc) o tratarlo como ORG_MEMBER en proxy.ts y preview.ts. El enum vive en schema.prisma (FROZEN): no tocarlo sin decision.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-login.ruteo-por-rol, lib.proxy, lib.auth, modelo.User

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

### [BUG-018] chatbot_conversation.sessionId es único global y el widget guarda un solo sessionId por origen: dos bots bajo el mismo origen chocan (P2002 sin adopción)
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `prisma/migrations/20260512150823_chatbot_init/migration.sql:142` — «CREATE UNIQUE INDEX "chatbot_conversation_sessionId_key" ON "chatbot_conversation"("sessionId");»; `src/modules/chatbot/hooks/useChatbot.ts:27` — «const existing = window.sessionStorage.getItem('chatbot:sessionId')»; `src/modules/chatbot/server/conversation/resolver.ts:133` — «// p.ej. la colisión cross-bot del sessionId global (@unique sin»
- Impacto: Si alguien usa el chat de un bot y después el de otro bajo el mismo origen (por ejemplo, el equipo probando /embed/<slug> de dos clientes en la misma pestaña), el segundo create da P2002, la adopción scopeada no encuentra fila (resolver.ts:137 relanza) y el chat del segundo bot falla. No mezcla datos entre tenants.
- Propuesta: Guardar el sessionId por slug en el widget (clave con el slug) como arreglo libre; a mediano plazo unique compuesto (botConfigId, sessionId) (schema FROZEN, decisión para Valentino).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): modelo.Conversation, h3.vis-widget-cliente, h3.vis-api-chatbot
- REQUIERE-VERIFICACIÓN-HUMANA: VH-032

### [BUG-026] El reporte ejecutivo semanal no usa PENDING como cerrojo: el cron y el envío manual concurrentes mandan el mail dos veces
- Dominio: D7  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/reports/executive-weekly/send.ts:109` — «if (existing?.status === 'SENT') {»; `src/lib/reports/executive-weekly/send.ts:149` — «status: 'PENDING',»; `src/lib/reports/executive-weekly/send-manual.ts:50` — «if (existing?.status === 'SENT') {»; `src/app/api/admin/clients/[organizationId]/send-executive-report/route.ts:57` — «const result = await sendExecutiveWeeklyReportManual(organizationId)»
- Impacto: Si el admin dispara el envío manual mientras corre el cron (o hace dos clics, o el scheduler reintenta), ambos leen un estado distinto de SENT, ambos marcan PENDING y ambos mandan: el cliente recibe el mismo reporte dos veces; si la función muere después de Brevo y antes de marcar SENT, la próxima corrida lo reenvía.
- Propuesta: Reservar la fila con un update o insert condicional (status distinto de SENT y sin PENDING reciente) y seguir solo si la reserva afectó una fila; expirar PENDING viejos.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-reportes-email, h4.adm-clientes, int.brevo, modelo.WeeklyReportLog
- REQUIERE-VERIFICACIÓN-HUMANA: VH-041

### [BUG-027] Salida del motor de WhatsApp (latente): el estado se escribe sin condición, el wamid se guarda después del envío y el estado del canal no frena la salida
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/motor/adapters/whatsapp/inbound/handle-status.ts:53` — «const currentRank = STATUS_RANK[message.status]»; `src/modules/motor/adapters/whatsapp/inbound/handle-status.ts:58` — «await scope.motorMessage.update(message.id, { status: next })»; `src/modules/motor/services/sendMessage.ts:248` — «await scope.motorMessage.update(messageId, { status: 'SENT', providerMessageId: result.wamid })»; `src/modules/motor/adapters/whatsapp/inbound/process.ts:163` — «next = addTo(next, 'statusesSkipped')»; `src/modules/motor/services/sendMessage.ts:113` — «if (channel === null || channel.apiKeyEncrypted === null || channel.apiKeyIv === null || channel.apiKeyTag === null) {»; `src/modules/motor/adapters/whatsapp/inbound/handle-request.ts:39` — «if (channel.status === 'INACTIVE') {»
- Impacto: Hoy latente: sendMotorMessage no tiene llamadores hasta B2. Cuando se conecte: dos webhooks concurrentes (delivered y read) pueden dejar el mensaje en DELIVERED después de READ o pisar un FAILED; un status que llega antes de que se guarde el wamid se descarta como unknown-message sin reintento; si la función muere entre la aceptación del BSP y el update, el mensaje queda PENDING para siempre con la clave de idempotencia quemada; y un canal INACTIVE (solo se chequea en la entrada) o reportado BANNED/RESTRICTED sigue despachando, justo lo que la alerta de calidad de Meta quería evitar.
- Propuesta: Aplicar el status con updateMany condicional (where status en rangos menores y distinto de FAILED); correlacionar el wamid antes del despacho o reintentar el lookup; marcar como desconocidos los PENDING viejos; chequear status y channelStatus en resolveTargets antes de enviar.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp, modelo.MotorMessage, modelo.WabaChannel, lib.motor

### [BUG-028] Reconocer una alerta del chatbot no la silencia: el detector solo deduplica contra PENDING de las últimas 24 h y la vuelve a crear con email y Telegram
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/detectBotIssues.ts:250` — «status: 'PENDING', createdAt: { gte: new Date(Date.now() - ONE_DAY_MS) },»; `src/modules/chatbot/server/admin/detectBotIssues.ts:267` — «const emailResult = await sendAlertEmail(issue)»; `src/modules/chatbot/server/admin/manageAlerts.ts:46` — «status: 'ACKNOWLEDGED', acknowledgedAt: new Date(),»
- Impacto: Latente mientras el detector no tenga disparador (D7); en cuanto corra periódicamente, marcar como vista una alerta de un problema que sigue activo (cuota agotada, errores del proveedor) hace que la corrida siguiente cree otra PENDING y mande otro email y otro Telegram; lo mismo a las 24 h con una PENDING. Además, reconocer una alerta ya resuelta la reabre como ACKNOWLEDGED conservando resolvedAt.
- Propuesta: Deduplicar contra alertas abiertas (PENDING y ACKNOWLEDGED) del mismo bot y tipo, y aceptar el reconocimiento solo desde PENDING con updateMany condicional.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-alertas, modelo.BotAlert, int.cron.detect-bot-issues, int.telegram

## Tecnología vieja

### [TEC-001] Prisma 6.19 con 7.x disponible: el salto exige cambiar el schema congelado y la carga de .env de los seeds
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: tech-vieja
- Confianza: PROBABLE
- Evidencia: `package.json:133` — «"@prisma/client": "^6.19.2",»; `prisma/schema.prisma:2` — «provider = "prisma-client-js"»; `prisma/seed-guard.ts:13` — «* Nota de entorno: '@prisma/client' carga '.env' completo al importarse, así que»; dato de la auditoría, _crudo/npm-outdated.json línea 1 — «@prisma/client current 6.19.3, latest 7.10.0 (resumen del baseline F0)»
- Impacto: La rama 7 mueve la URL del datasource a prisma.config.ts, cambia el generador y deja de cargar .env automáticamente; el guard de seeds asume esa carga (seed-guard.ts:13-14). El upgrade toca el schema congelado y los seeds; sin plan, queda bloqueado o se hace a ciegas.
- Propuesta: Decisión para Valentino (schema FROZEN): planificar el salto a Prisma 7 como sprint propio (datasource en prisma.config.ts con directUrl, generador nuevo, carga explícita de env en seeds y scripts) después de cerrar el estado de migraciones de prod.
- Esfuerzo: M  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): lib.prisma, lib.seeds, lib.migraciones

## Rendimiento

### [PERF-001] FKs sin índice (Task.projectId, Notification.userId/taskId, ChatbotEvent.conversationId) e índices redundantes
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:584` — «projectId String»; `prisma/schema.prisma:590` — «@@index([assignedToId])»; `src/app/(protected)/dashboard/project/page.tsx:138` — «tasks: { orderBy: { id: 'asc' } },»; `prisma/schema.prisma:1410` — «@@index([sessionId])»; `prisma/schema.prisma:1343` — «@@index([slug])»; `prisma/migrations/20260318202838_init/migration.sql:176` — «ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;»; `src/modules/chatbot/server/logging/persistentLogger.ts:160` — «(c) => c.chatbotEvent.deleteMany({ where: { createdAt: { lt: threshold } } }),»
- Impacto: El include de tareas de /dashboard/project, los conteos de health-score.ts:387-398 y las cascadas Project→Task, Task→Notification y Conversation→ChatbotEvent recorren la tabla entera (no se nota al volumen de hoy). Hay índices duplicados por un unique o por un compuesto con la misma primera columna: Conversation.sessionId (:1375/:1410), BotConfig.slug (:1278/:1343), QuotaUsage.botConfigId (:1594-1595), OrgMember.userId (:530-531), EmailContact.organizationId (:1229-1230), OsMaintenancePayment.projectId (:1047-1048), EmailCampaign.organizationId (:1261-1262), OsLead.status y OsLead.assignedToId (:896-900).
- Propuesta: Decisión para Valentino (schema FROZEN): agregar @@index([projectId]) en Task, @@index([userId]) y @@index([taskId]) en Notification, @@index([conversationId]) en ChatbotEvent, y hacer los DROP de índices cubiertos que B11.5 dejó diferidos.
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): modelo.Task, modelo.Notification, modelo.ChatbotEvent, modelo.Conversation, h2.cli-proyecto, h3.adm-actividad

## Deuda

### [DEU-005] Borrar un User borra en cascada los tickets que abrió y todas sus respuestas, en cualquier organización
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:771` — «user User @relation(fields: [userId], references: [id], onDelete: Cascade)»; `prisma/schema.prisma:786` — «user User @relation(fields: [userId], references: [id], onDelete: Cascade)»; `prisma/migrations/20260403170000_reconcile_existing_schema/migration.sql:181` — «ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_userId_fkey" ... ON DELETE CASCADE ON UPDATE CASCADE;»; `prisma/schema.prisma:1065` — «user User @relation("OsTimeEntryUser", fields: [userId], references: [id])»; `prisma/migrations/20260403170000_reconcile_existing_schema/migration.sql:175` — «ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;»
- Impacto: El historial de soporte es de la organización pero cuelga del autor: si se elimina un usuario (baja de un empleado del cliente, pedido de borrado, limpieza de una cuenta de develOP) desaparecen los tickets que abrió con todos sus mensajes, y si es SUPER_ADMIN, sus respuestas en los tickets de todos los clientes. A la vez, un usuario con horas cargadas no se puede borrar (Restrict en OsTimeEntry). Hoy no hay ruta de borrado de usuarios en src, así que el riesgo es latente; los tests sí borran usuarios.
- Propuesta: Decisión para Valentino (schema FROZEN): Ticket.userId y TicketMessage.userId opcionales con onDelete: SetNull (o snapshot del autor) y definir el borrado de usuarios como anonimización en vez de DELETE.
- Esfuerzo: M  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): modelo.Ticket, modelo.TicketMessage, modelo.User, h2.cli-soporte, h4.adm-tickets

### [DEU-006] Solo chatbot_events tiene retención; rate_limit, mensajes, leads y formularios crecen sin purga
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `prisma/schema.prisma:1763` — «// claves muertas dentro de la misma ventana. El índice en expiresAt deja la»; `prisma/schema.prisma:1764` — «// puerta abierta a un job de purga futuro si hace falta.»; `src/app/api/cron/cleanup-old-events/route.ts:14` — «const RETENTION_DAYS = 30»; `src/modules/chatbot/server/logging/persistentLogger.ts:160` — «(c) => c.chatbotEvent.deleteMany({ where: { createdAt: { lt: threshold } } }),»
- Impacto: Cada clave nueva de rate limit (incluidas las armadas con datos del pedido, patrón D1-c3) es una fila permanente; conversaciones y mensajes del chatbot (con nombres y teléfonos), ChatbotLead, ContactSubmission, AdminAuditLog con IP (schema.prisma:1667) y PasswordResetToken vencidos no tienen retención. Sin pieza legal (LEG-01) no hay plazo que informarle al primer cliente.
- Propuesta: Extender el cron de limpieza: purgar rate_limit con expiresAt vencido y PasswordResetToken usados o vencidos; definir con Franco plazos para conversaciones, mensajes y formularios (borrar o anonimizar).
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [SEC-031]
- Nodo(s): modelo.RateLimit, modelo.Conversation, modelo.ChatMessage, modelo.ContactSubmission, modelo.PasswordResetToken, int.cron.cleanup-old-events

### [DEU-007] Sin directUrl: migrate y seeds corren por el pooler de Neon
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:7` — «url = env("DATABASE_URL")»; `.env.example:30` — «# Opción A: sacar '-pooler' del subdomain del DATABASE_URL pooled.»; `.env.example:35` — «DIRECT_DATABASE_URL=»
- Impacto: prisma migrate usa un advisory lock de sesión y espera una conexión única; por PgBouncer en modo transacción ese lock no garantiza exclusión entre dos corridas y pueden aparecer errores intermitentes de prepared statements. Hasta ahora las migraciones pasaron por -pooler, pero es el camino que Prisma desaconseja para migrar prod.
- Propuesta: Decisión para Valentino (schema FROZEN): agregar directUrl = env("DIRECT_DATABASE_URL") al datasource; la variable ya existe en .env.example y en los secrets del backup, la app sigue en el pooler.
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): lib.prisma, lib.migraciones, int.neon

### [DEU-013] La frontera de aislamiento solo cubre src/modules/{chatbot,motor} y api/chatbot: 46 accesos directos a modelos aislados fuera del helper y la regla de eslint no corre en CI
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `eslint.config.mjs:53` — «files: [ "src/modules/chatbot/**/*.{ts,tsx}", "src/app/api/chatbot/**/*.{ts,tsx}",»; `src/lib/isolation/index.ts:41` — «ChatbotLead, CrmIntegration (chatbot, port en B0-S3). Fuera de este directorio, prisma directo sobre * estos modelos solo queda en el código legacy del chatbot hasta B0-S3;»; `src/lib/dashboard/home-metrics.ts:59` — «const lead = await prisma.chatbotLead.findFirst({ where: { botConfig: { organizationId }, status: 'NEW', classification: 'hot' },»; `src/app/(protected)/dashboard/chatbot/knowledge/page.tsx:14` — «async () => prisma.knowledgeBase.findUnique({ where: { botConfigId: session.bot.id } }),»; `raíz:.github/workflows/ci.yml:20` — «# ── Por qué el lint NO está acá ──»
- Impacto: git grep de prisma.<modelo aislado> fuera de src/lib/isolation (sin tests ni comentarios) da 46 accesos en 26 archivos de portal, admin, crons, reportes y embed. Los revisados filtran por org a mano, pero un cambio futuro sin filtro no lo frena ni el helper ni el lint, que además no corre en CI (102 errores previos). Para el primer cliente, el riesgo es una regresión de aislamiento silenciosa en las pantallas que más datos del chatbot muestran.
- Propuesta: Extender no-restricted-imports/no-restricted-syntax a los consumidores de modelos del chatbot y del motor (o migrar esos 26 archivos a forOrg) y correr en CI al menos esa regla sobre ese subconjunto aunque el lint global siga apagado.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.isolation, lib.prisma, h2.cli-inicio, h3.cli-chatbot, h4.adm-config

### [DEU-014] Migraciones de reconciliación agregaron, borraron y re-agregaron columnas con datos de clientes con un criterio falso, y 20260619140100 quedó resuelta sin ejecutar
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `prisma/migrations/20260619234252_add_organization_city_avatar_notes_softdelete/migration.sql:2` — «ALTER TABLE "Organization" ADD COLUMN "avatarEmoji" TEXT,»; `prisma/migrations/20260621120000_reconcile_dev_drift_schema_align/migration.sql:5` — «-- Ningún código las lee (build verde ⇒ no son campos del client). Se DROPEAN para»; `prisma/migrations/20260621120000_reconcile_dev_drift_schema_align/migration.sql:10` — «-- • DB reconstruida desde la historia: la historia NUNCA las agrega → el DROP es no-op.»; `prisma/migrations/20260621120000_reconcile_dev_drift_schema_align/migration.sql:27` — «-- La migración 20260619140100 ya lo declaró drop pero quedó RESUELTA SIN EJECUTAR -- (resolve --applied sin correr el SQL) → la columna seguía física.»; `prisma/migrations/20260622120000_readd_client_columns_dropped_by_reconcile/migration.sql:1` — «-- Re-add de columnas de cliente que 20260621120000_reconcile_dev_drift_schema_align -- DROPEÓ por error.»; `prisma/migrations/20260619140100_drop_chatbot_lead_converted_column/migration.sql:4` — «-- NUNCA usó esta columna; el string jamás estuvo en el schema/código committeado»; `prisma/migrations/20260617184913_add_converted_lead_link_and_bot_deleted_audit/migration.sql:5` — «ALTER TABLE "chatbot_lead" ADD COLUMN "convertedToOsLeadId" TEXT;»; `prisma/migrations/20260621120000_reconcile_dev_drift_schema_align/migration.sql:23` — «ALTER TABLE "Organization" DROP COLUMN IF EXISTS "deletedAt";»; `prisma/migrations/20260622120000_readd_client_columns_dropped_by_reconcile/migration.sql:17` — «ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);»; `prisma/migrations/20260619140100_drop_chatbot_lead_converted_column/migration.sql:9` — «ALTER TABLE "chatbot_lead" DROP COLUMN IF EXISTS "convertedToOsLeadId";»
- Impacto: En cada base donde corrió la secuencia (la dev compartida y, con el build que hasta el 2026-06-28 aplicaba migraciones, probablemente prod) se perdieron los valores de Organization.city/internalNotes/avatar*/deletedAt (un cliente archivado vuelve a figurar activo) y de chatbot_lead.convertedToOsLeadId. El estado final coincide con el schema, pero el historial guarda una migración marcada como aplicada sin correr y dos comentarios falsos (la historia sí agregaba esas columnas en 20260617184913, 20260619234252 y 20260620173833) que invitan a repetir el procedimiento. Con datos reales, el mismo procedimiento borraría información de clientes.
- Propuesta: Regla escrita para reconciliaciones: ningún DROP sin (a) git grep de usos en src, (b) prisma migrate diff contra la base y (c) backup previo; registrar en la bitácora qué datos se perdieron; verificar hoy con migrate diff de solo lectura que no queda drift físico. No editar migraciones existentes.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): modelo.Organization, modelo.AgencySettings, modelo.ChatbotLead, lib.prisma, int.neon, lib.migraciones
- REQUIERE-VERIFICACIÓN-HUMANA: VH-030

### [DEU-017] Sin base de test: las suites de integración, LeadOS y setter escriben en la Neon dev compartida y en CI no corren (falta DATABASE_URL_TEST)
- Dominio: D6  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `playwright.integration.config.ts:37` — «dotenv.config({ path: '.env.local' })»; `playwright.leados.config.ts:25` — «dotenv.config({ path: '.env.local' })»; `raíz:.github/workflows/ci.yml:144` — «echo "::warning::DATABASE_URL_TEST no está configurado — los tests de LeadOS NO corrieron.»; `raíz:.github/workflows/ci.yml:174` — «# del workflow anidado que este archivo reemplaza; ninguno existe hoy.»; `playwright.integration.config.ts:15` — «* globalSetup separado) para que DATABASE_URL esté disponible antes de que»; `tests/e2e/30-onboarding-e2e-complete.spec.ts:153` — «await prisma.organization.delete({ where: { slug: createdOrgSlug } }).catch(() => undefined)»; `tests/e2e/30-onboarding-e2e-complete.spec.ts:156` — «await prisma.user.delete({ where: { email: testEmail } }).catch(() => undefined)»; `tests/helpers/setter-db.ts:376` — «await prisma.user.deleteMany({ where: { id: { in: tracker.userIds } } })»
- Impacto: Los tests negativos de aislamiento (motor-isolation, chatbot-isolation) y los de LeadOS nunca corren en CI, y a mano siembran y limpian datos en la misma base dev que usa Franco. Una regresión de aislamiento puede entrar a main sin alarma antes del primer cliente.
- Propuesta: Crear una branch de Neon dedicada a tests (efímera o recreada por branching, nunca migrate reset), cargar DATABASE_URL_TEST en GitHub y apuntar los configs de Playwright a esa variable.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.isolation, int.neon, lib.prisma, modelo.Organization, modelo.User

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

### [DEU-008] Montos de dinero en Float (Invoice, Subscription, PremiumModule, OrganizationModule) junto a Decimal
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:672` — «amount Float»; `prisma/schema.prisma:659` — «price Float»; `prisma/schema.prisma:1199` — «priceLockedUsd Float»; `prisma/schema.prisma:610` — «monthlyPrice Decimal @db.Decimal(10, 2)»; `prisma/migrations/20260318202838_init/migration.sql:130` — «"amount" DOUBLE PRECISION NOT NULL,»; `prisma/migrations/20260403170000_reconcile_existing_schema/migration.sql:47` — «"price" DOUBLE PRECISION NOT NULL,»; `prisma/migrations/20260420000000_baseline_premium_modules/migration.sql:40` — «"priceLockedUsd" DOUBLE PRECISION NOT NULL,»
- Impacto: Sumas de facturas y precios bloqueados acumulan error de punto flotante y conviven con montos Decimal del mismo dominio (Plan, Project, OsPaymentMilestone). Cambiar el tipo con datos reales exige una migración con conversión.
- Propuesta: Decisión para Valentino (schema FROZEN): pasar los montos a Decimal(10,2) antes de cargar facturación real del primer cliente.
- Esfuerzo: M  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): modelo.Invoice, modelo.Subscription, modelo.PremiumModule, modelo.OrganizationModule, h2.cli-plan

### [DEU-009] Los seeds adoptan datos existentes por nombre no único y les asignan usuarios con contraseña de seed
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `prisma/seed-agency-os.ts:1799` — «const existingByCompanyName = await prisma.organization.findFirst({»; `prisma/seed-agency-os.ts:1851` — «update: { role },»; `prisma/seed-agency-os.ts:1930` — «const existingLead = await prisma.osLead.findFirst({»; `prisma/seed-agency-os.ts:360` — «password: adminPassword,»; `prisma/seed.ts:83` — «where: { email: 'admin@develop.com' },»
- Impacto: En la base dev compartida el seed pisa leads de Franco que compartan businessName (estado, notas, asignación), adjunta usuarios de seed como ADMIN a cualquier org con el mismo companyName y eleva a SUPER_ADMIN con la contraseña de seed a cualquier cuenta franco@ o valentino@develop.com existente. Las cuentas usan dominios reales de terceros (develop.com, sanmiguel.com, sonrisanorte.com), así que cualquier email que la app mande desde dev a esas cuentas sale a dominios ajenos.
- Propuesta: Buscar solo por ids deterministas del seed (seedId) o por slug, nunca por companyName/businessName; no tocar role ni password de usuarios que el seed no creó; usar dominios reservados (.test/.example) en todas las cuentas sembradas.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.seeds, modelo.Organization, modelo.OsLead, modelo.User

### [DEU-010] BotConfig.industry es String libre con tres vocabularios ('generic', 'generico', 'automotive')
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:1324` — «industry String @default("generic")»; `src/modules/chatbot/server/admin/createClientWithBot.ts:17` — «'inmobiliaria', 'concesionaria', 'distribuidora', 'constructora', 'generico',»; `prisma/seed.ts:807` — «industry: 'automotive',»; `src/app/(protected)/admin/chatbots/BotsListClient.tsx:41` — «if (industryFilter !== 'all' && bot.industry !== industryFilter) return false»
- Impacto: El filtro por rubro del admin separa valores que significan lo mismo; el bot QA de San Miguel queda con un rubro fuera del catálogo de los formularios de alta ('concesionaria'); el default del schema nunca coincide con el canónico.
- Propuesta: Decisión para Valentino (schema FROZEN): convertir industry en enum o cambiar el default a 'generico'. Mientras tanto sembrar 'concesionaria' en seed.ts:807 y revisar prisma/seeds/backfill-vertical-pack.ts, que depende de ese valor.
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): modelo.BotConfig, lib.seeds, h3.adm-chatbots

### [DEU-011] Comentarios de los archivos de datos que afirman cosas falsas
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `prisma/schema.prisma:399` — «// Client profile (admin-managed). city la captura el creador pero hoy la»; `prisma/schema.prisma:400` — «// action no la persiste; internalNotes se muestra en OverviewTab (hoy placeholder).»; `prisma.config.ts:9` — «// 🔴 NO tocar migrations existentes — los 49 archivos en prisma/migrations/»; `prisma/migrations/20260619140100_drop_chatbot_lead_converted_column/migration.sql:4` — «-- NUNCA usó esta columna; el string jamás estuvo en el schema/código committeado»
- Impacto: city e internalNotes sí se persisten (EditClientForm.tsx:82-83, InternalNotesCard.tsx:45); hay 86 migraciones, no 49; la columna sí la había agregado 20260617184913:5; seed-agency-os.ts:2453 dice que el proyecto interno se siembra con organizationId null cuando la columna es NOT NULL. Quien decida sobre datos leyendo estos archivos parte de premisas equivocadas.
- Propuesta: Corregir los comentarios de los archivos libres (prisma.config.ts, seed-agency-os.ts, seed-guard.ts); el de schema.prisma:399-400 es decisión para Valentino (FROZEN). Las migraciones aplicadas no se editan: dejar la corrección en la bitácora.
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): lib.prisma, lib.seeds, lib.migraciones

### [DEU-012] AdminAuditLog sin organizationId: no se puede reconstruir la auditoría de un cliente
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:1661` — «targetType String»; `prisma/schema.prisma:1662` — «targetId String»; `prisma/schema.prisma:1673` — «@@index([targetType, targetId, createdAt])»
- Impacto: Las acciones sobre un cliente quedan con targetType/targetId heterogéneos (Organization, BotConfig, ChatbotLead…); reconstruir todo lo hecho sobre la org X exige conocer cada tipo y resolver ids, y después de un hard-delete ya no se pueden resolver.
- Propuesta: Decisión para Valentino (schema FROZEN): agregar targetOrganizationId opcional sin FK (para sobrevivir al hard-delete), indexado, y completarlo en logAdminAction.
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): modelo.AdminAuditLog, h4.adm-audit

### [DEU-015] init-data-connections.ts usa `as any`, no tiene referencias y fabrica integraciones 'conectadas' con lastSync = ahora
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `prisma/seeds/init-data-connections.ts:18` — «where: { dataConnections: { equals: null as any } },»; `prisma/seeds/init-data-connections.ts:34` — «ga4: { connected: Boolean(org.analyticsPropertyId), lastSync: org.analyticsPropertyId ? new Date().toISOString() : null,»; `prisma/migrations/20260427194426_add_health_score_and_brief_cache_fields/migration.sql:7` — «ALTER COLUMN "dataConnections" SET DEFAULT '{"ga4":{"connected":false,"lastSync":null},...»
- Impacto: Viola la regla 'cero any' (es el único error de eslint del lote). Si se corriera marcaría como conectadas y recién sincronizadas integraciones solo por tener un ID cargado: dato falso para el health score. Además, en Prisma 6 un filtro Json por null pide Prisma.DbNull, así que es probable que falle antes (no verificado en runtime). No lo referencia nada: backfill one-shot de abril.
- Propuesta: Borrarlo (la columna tiene default desde 20260427194426) o reescribirlo con Prisma.DbNull, sin inventar lastSync y con guard de entorno.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): modelo.Organization, h2.cli-resultados

### [DEU-016] Los seeds del lote solo corren con tsx, que no está declarado: `npx tsx` resuelve una versión sin fijar mientras DATABASE_URL apunta a prod
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `prisma/seeds/sync-plans.ts:13` — «* DATABASE_URL=<prod> npx tsx prisma/seeds/sync-plans.ts»; `prisma/seeds/add-contact-tool.ts:88` — «if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? '')).href) {»; `package.json:172` — «"ts-node": { "compilerOptions": { "module": "CommonJS",»; `package.json:20` — «"seed:latency": "ts-node --transpile-only scripts/dev/seed-latency.ts",»; `prisma.config.ts:32` — «seed: 'npx tsx prisma/seed.ts',»; `package.json:17` — «"seed:agency-os": "ts-node prisma/seed-agency-os.ts",»; `package.json:18` — «"seed:agency-os-v2": "ts-node prisma/seed-agency-os.ts",»; `prisma/seed-agency-os.ts:26` — «import { assertDevSeedTarget, requireSeedPassword } from './seed-guard.ts'»; `tsconfig.json:18` — «"allowImportingTsExtensions": true,»
- Impacto: package.json tiene 67 líneas con `npx tsx` y 25 con ts-node; tsx no está en dependencies, devDependencies ni en el lockfile, así que cada corrida usa un binario global o descarga la última versión del registro, también al correr scripts contra prod. Los seeds con import.meta no corren con ts-node configurado en CommonJS (el runner que sí está declarado).
- Propuesta: Declarar tsx con versión fija en devDependencies, exponer los seeds de prod como scripts de npm y unificar el runner.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.prisma, lib.seeds

### [DEU-018] Catálogo de tareas de onboarding huérfano: solo lo siembran módulos 'use server' sin importadores y sus títulos internos se mostrarían al cliente
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/lib/onboarding/seed-tasks-for-org.ts:5` — «await prisma.onboardingTask.createMany({»; `src/lib/data/onboarding-tasks.ts:21` — «title: 'Configurar AgencySettings de la organización',»; `src/components/dashboard/OnboardingStatusCard.tsx:28` — «if (tasks.length === 0) return null»; `src/modules/chatbot/server/admin/createClientOnly.ts:85` — «onboardingCompleted: true,»
- Impacto: La siembra solo se llama desde src/lib/actions/clients.ts e invitations.ts, que no tienen importadores, y el alta vigente no siembra tareas: la tarjeta 'Estamos configurando tu negocio' del inicio (dashboard/page.tsx:61) nunca aparece para clientes nuevos. Si se reactivara, el cliente vería títulos internos del equipo (nombres de modelos, 'Crear cuenta del cliente y enviar credenciales'). Las actions de admin para avanzarlas (src/actions/admin/onboarding-tasks.ts) tampoco tienen importadores.
- Propuesta: Decidir: retirar la feature (catálogo, siembra, actions y tarjeta) o reconectarla con títulos para el cliente y una UI de admin que las avance.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio, h2.cli-inicio.estado-onboarding, lib.data, modelo.OnboardingTask

### [DEU-019] Dos escapes unsafeGlobalQuery quedaron con razón 'PENDIENTE-DECISIÓN': métricas del admin rotuladas como del bot de develOP agregan todas las orgs
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/admin/getActivityChartData.ts:12` — «const events = await unsafeGlobalQuery( 'PENDIENTE-DECISIÓN: chart de actividad agrega eventos de todas las orgs en una página enmarcada como el bot develOP»; `src/modules/chatbot/server/admin/getActivityChartData.ts:15` — «c.chatbotEvent.findMany({ where: { createdAt: { gte: sevenDaysAgo } },»; `src/modules/chatbot/server/admin/getLatencyHistory.ts:73` — «const events = await unsafeGlobalQuery( 'PENDIENTE-DECISIÓN: latencia P50/P95 agrega eventos de todas las orgs»
- Impacto: De los 68 escapes globales del repo (37 archivos), estos dos son los únicos sin justificación de plataforma: /admin/chatbot/activity y /admin/chatbot/health muestran números de todos los clientes como si fueran del bot propio, y el de actividad trae sin límite todos los eventos de 7 días. Solo afecta al admin, sin fuga hacia clientes.
- Propuesta: Decidir: scopear a forOrg(<org de develOP>) o re-rotular ambas páginas como métricas de plataforma y agregar en SQL (groupBy) en vez de traer filas.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-actividad, h3.adm-health, lib.isolation

### [DEU-020] sync-plans.ts sigue indicando cómo correrlo en prod aunque pisa las 13 columnas del catálogo, y todavía ofrece navigate_to_page a Pro/Business
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `prisma/seeds/sync-plans.ts:12` — «* Correrlo en prod (después de 'prisma migrate deploy'): * DATABASE_URL=<prod> npx tsx prisma/seeds/sync-plans.ts»; `prisma/seeds/sync-plans.ts:48` — «// columna de la DB. Pero correr ESTE seed pisaría las 13 columnas de cada Plan // (precios, cuotas, límites) con los valores de acá»; `prisma/seeds/sync-plans.ts:168` — «await prisma.plan.update({ where: { key: next.key }, data: next,»; `prisma/seeds/sync-plans.ts:56` — «'navigate_to_page',»
- Impacto: Quien siga el encabezado revierte en prod precios, cuotas o modelos ajustados a mano; el mismo archivo lo advierte más abajo. El catálogo declara una tool que el runtime descarta para todos los clientes (getTools.ts:121).
- Propuesta: Sacar la instrucción de prod del encabezado (o agregar --dry-run con diff por columna) y quitar navigate_to_page del catálogo hasta que exista allowedNavigationPaths.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): modelo.Plan, h3.vis-api-chatbot, h2.cli-plan

### [DEU-021] Un referido pasa a CONVERTED sin vincular la organización referida: referredOrgId no tiene escritor y la conversión no se puede auditar
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/referrals/_actions/referrals.admin.actions.ts:18` — «const result = await prisma.referral.updateMany({ where: { id, status: 'PENDING' }, data: { status: 'CONVERTED' },»; `prisma/schema.prisma:1847` — «// desde el inicio; 'referredOrgId' se completa al convertir. 'rewardedAt' marca cuándo se»; `prisma/schema.prisma:1855` — «referredOrgId String?»
- Impacto: El mes bonificado (REWARDED) se acredita sobre una conversión que es solo un clic del admin: no queda qué organización contrató, no se puede verificar que no sea la misma org referente ni recalcular el beneficio, y la relación referred con su índice y su SetNull es letra muerta.
- Propuesta: Pedir en markReferralConvertedAction la org cliente que contrató (select en el admin), guardarla en referredOrgId y validar que no sea la org referente.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-referidos, h2.cli-referidos, modelo.Referral

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
