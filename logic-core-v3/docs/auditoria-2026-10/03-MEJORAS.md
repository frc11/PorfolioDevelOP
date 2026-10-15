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

### [SEC-057] Un anónimo agota en minutos el cupo mensual de conversaciones de cualquier bot de cliente (y el gasto de Vertex): el Origin de develop.com.ar vale para todos los bots y cada sessionId nuevo reserva un cupo
- Dominio: D5  ·  Severidad: CRÍTICA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/chat/handleChatRequest.ts:400` — «if (isNewConversation) { const reserve = await tryReserveConversation(orgId, bot.id, plan.quota)»; `src/modules/chatbot/server/chat/requestSchema.ts:55` — «sessionId: z.string().min(1).max(200),»; `src/modules/chatbot/server/chat/handleChatRequest.ts:185` — «key: 'chatbotPerBotSession:${slug}:${body.sessionId}',»; `src/app/api/chatbot/[slug]/chat/route.ts:80` — «const rateKey = 'chatbotPerSession:${origin ?? 'no-origin'}:${ipHash}'»; `src/lib/rate-limit/presets.ts:27` — «chatbotPerSession: { limit: 30, windowMs: 60_000 },»; `src/lib/security/validate-origin.ts:70` — «if ( origin === 'https://develop.com.ar' || origin === 'https://www.develop.com.ar'»; `src/modules/chatbot/server/chat/degradedResponse.ts:97` — «// develop.com.ar nunca cae al cap»; `src/lib/security/origin-matcher.ts:40` — «if (originHost.endsWith('.' + clean)) return true»; `next.config.ts:131` — «{ key: 'Content-Security-Policy', value: "frame-ancestors *;" },»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:67` — «if (event.data?.type === 'develop:init') { parentOriginRef.current = event.origin»; `src/modules/chatbot/hooks/useChatbot.ts:272` — «api: '/api/chatbot/${slug}/chat',»; `src/modules/chatbot/server/chat/handleChatRequest.ts:952` — «temperature: 0.7, stopWhen: stepCountIs(3),»; `src/lib/security/origin-matcher.ts:39` — «if (originHost === clean) return true if (originHost.endsWith('.' + clean)) return true»; `src/modules/chatbot/server/chat/handleChatRequest.ts:345` — «if (quota.conversationsUsed >= plan.quota) {»; `prisma/seeds/sync-plans.ts:72` — «quota: 500,»; `src/modules/chatbot/server/chat/requestSchema.ts:111` — «if (forwarded) return forwarded.split(',')[0].trim()»; `src/lib/security/validate-origin.ts:71` — «origin === 'https://develop.com.ar' ||»; `src/modules/chatbot/server/chat/handleChatRequest.ts:401` — «const reserve = await tryReserveConversation(orgId, bot.id, plan.quota)»; `src/modules/chatbot/server/quota/checker.ts:137` — «const { reserved, conversationsUsed } = await forOrg(organizationId).quotaUsage.reserveConversation({»
- Impacto: Bloqueante para el primer cliente real. Cualquier script sin login que conozca el slug (está en el snippet público del sitio del cliente) manda POST con Origin https://develop.com.ar (permitido para todos los bots y exento del tope de dominios del plan) y un sessionId nuevo por pedido: cada pedido crea una conversación y reserva 1 cupo del mes, que no se devuelve si el LLM respondió. Con el tope de 30/min por (origin, IP) y los dos orígenes de develOP son 60 conversaciones/min desde una sola IP: Starter (500) se agota en ~8 min, Pro (3000) en ~50 min y Business (5000) en ~83 min; rotando subdominios del cliente o el esquema como Origin cada variante abre un balde nuevo. Desde ahí todo visitante real recibe 'alcanzamos el límite de atención automática del mes' hasta fin de mes, y develOP paga cada llamada (hasta ~30 mensajes de 4000 caracteres de entrada y salida sin maxOutputTokens). La allowlist tampoco protege el widget oficial: /embed se deja enmarcar por cualquier sitio y llama same-origin con Origin develop.com.ar, así que un tercero puede embeber el bot de un cliente, consumir su cupo y recibir los leads por postMessage. Hoy queda enmascarado por la credencial de Vertex vencida (cada fallo devuelve el cupo); se activa al renovarla.
- Propuesta: Decisión de diseño en tres partes: (1) rate limit por la IP confiable de la plataforma (no por el header Origin ni por sessionId) más un techo de conversaciones nuevas por IP/hora y por bot/hora; (2) cobrar el cupo cuando hay intercambio real (p. ej. primer turno respondido o segundo mensaje), no al crear la conversación; (3) hacer cumplir allowedDomains en el embed: frame-ancestors por bot y validar el origin del padre en el handshake, dejando develop.com.ar exento solo para el bot propio. Además fijar maxOutputTokens y alertar por velocidad de consumo del cupo.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [SEC-068]
- Nodo(s): h3.vis-api-chatbot, h3.vis-widget-cliente, lib.security, lib.rate-limit, lib.chatbot.chat, lib.chatbot.quota, int.vertex, modelo.QuotaUsage, modelo.Conversation
- REQUIERE-VERIFICACIÓN-HUMANA: VH-065

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
- Evidencia: `src/proxy.ts:148` — «if (isAdminRoute && role !== ADMIN_ROLE) {»; `src/auth.config.ts:24` — «callbacks: { authorized({ auth }) { return true // Route protection is handled in middleware logic»; `src/app/(protected)/admin/layout.tsx:47` — «if (session.user.role !== 'SUPER_ADMIN') { redirect('/dashboard')»; librería next@16.2.9, dist/server/app-render/app-render.js línea 164 — «const flightRouterState = shouldProvideFlightRouterState ? (0, _parseandvalidateflightrouterstate.parseAndValidateFlightRouterState)(headers[_approuterheaders.NEXT_ROUTER_STATE_TREE_HEADER]) : undefined;»; librería next@16.2.9, dist/server/app-render/walk-tree-with-flight-router-state.js línea 53 — «const renderComponentsOnThisLevel = // No further router state available !flightRouterState || // Segment in router state does not match current segment !(0, _matchsegments.matchSegment)(actualSegment, flightRouterState[»; `src/app/(protected)/admin/team/page.tsx:19` — «const users = await prisma.user.findMany({»; `src/app/(protected)/admin/referrals/page.tsx:9` — «const referrals = await prisma.referral.findMany({»; `src/app/(protected)/admin/page.tsx:182` — «prisma.agencySettings.findFirst({»; `src/app/(protected)/admin/announcements/page.tsx:11` — «const [announcements, organizations] = await Promise.all([»; `src/app/(protected)/admin/audit-log/page.tsx:9` — «if (!session?.user || session.user.role !== 'SUPER_ADMIN') {»; `src/app/(protected)/admin/leads/page.tsx:23` — «const leads = await prisma.osLead.findMany({»; `src/app/(protected)/admin/leads/[leadId]/page.tsx:212` — «prisma.user.findMany({ where: { role: 'SETTER' }, select: { id: true, name: true, email: true },»; `src/app/(protected)/admin/messages/[orgId]/page.tsx:24` — «await markAsRead(orgId) const [organization, conversationResult] = await Promise.all([»; `src/app/(protected)/admin/messages/[orgId]/page.tsx:27` — «prisma.organization.findUnique({ where: { id: orgId },»; `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:70` — «const { projectId } = await params const [projectRecord, milestones, maintenancePayments] = await Promise.all([»; `src/app/(protected)/admin/projects/[projectId]/tasks/page.tsx:35` — «prisma.user.findMany({ where: { role: Role.SUPER_ADMIN,»; `src/app/(protected)/admin/projects/[projectId]/layout.tsx:160` — «if (!project || !callerCanAccessOrg(session.user, project.organizationId)) {»; `src/lib/auth/assert-ownership.ts:88` — «return Boolean(resourceOrgId) && caller.organizationId === resourceOrgId»; `src/app/(protected)/admin/projects/page.tsx:9` — «prisma.organization.findMany({ select: { id: true, companyName: true },»; `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:73` — «prisma.project.findUnique({ where: { id: projectId },»; `docs/bitacora-roadmap.md:8400` — «| F4 / B11 agency-actions cross-projectId | ✅ Cerrado |»; `docs/bitacora-roadmap.md:6493` — «| **F4** | ['src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:69-103'] ... Loader sin auth check»
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
- Nodo(s): h4.adm-shell, h4.adm-dashboard, h4.adm-equipo, h4.adm-referidos, h4.adm-proyectos, h4.adm-leads, h4.adm-mensajes, h4.adm-novedades, h3.adm-actividad, h5.adm-revision-demos, h5.adm-fg2lab, lib.proxy, lib.auth, modelo.OsLead, modelo.Organization, h4.adm-proyectos.ficha, h4.adm-proyectos.pagos-hitos, modelo.OsPaymentMilestone, modelo.OsMaintenancePayment
- REQUIERE-VERIFICACIÓN-HUMANA: VH-013

### [SEC-036] Credenciales de terceros en claro en la base: tokens OAuth de Google Business, token de Tiendanube, API key de Cal.com, token de Telegram y las credenciales de la Bóveda (el cifrado de escritura quedó sin mergear)
- Dominio: D6  ·  Severidad: ALTA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `prisma/migrations/20260503150000_add_gbp_fields/migration.sql:5` — «ADD COLUMN "gbpAccessToken" TEXT, ADD COLUMN "gbpRefreshToken" TEXT,»; `prisma/migrations/20260504235814_add_tiendanube_fields/migration.sql:2` — «ALTER TABLE "Organization" ADD COLUMN "tiendanubeAccessToken" TEXT,»; `prisma/migrations/20260505000536_add_cal_com_fields/migration.sql:2` — «ALTER TABLE "Organization" ADD COLUMN "calComApiKey" TEXT,»; `src/app/api/auth/google-business/callback/route.ts:52` — «gbpAccessToken: tokens.access_token, gbpRefreshToken: tokens.refresh_token,»; `src/actions/agency-actions.ts:103` — «await prisma.clientAsset.create({ data: { organizationId,»; `prisma/schema.prisma:1704` — «// Auth opcional vía header (ej. "X-Webhook-Secret"). Secret cifrado AES-256-GCM // con env CRM_SECRET_KEY.»; `prisma/schema.prisma:360` — «gbpRefreshToken String? @db.Text»; `prisma/schema.prisma:367` — «tiendanubeAccessToken String? @db.Text»; `prisma/schema.prisma:375` — «calComApiKey String? @db.Text»; `prisma/schema.prisma:835` — «osTelegramBotToken String?»; `src/app/api/auth/google-business/callback/route.ts:53` — «gbpRefreshToken: tokens.refresh_token,»; `src/app/api/auth/tiendanube/callback/route.ts:67` — «tiendanubeAccessToken: tokens.access_token,»; `src/lib/crypto/credential-cipher.ts:73` — «export function encryptCredential(plaintext: string): string { // sin llamadores en origin/main»; `src/lib/crypto/resolve-credential.ts:24` — «return { value: description, error: false } // texto plano pasa tal cual»; `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:85` — «AES-256 // badge del header (tambien :148 en cada tarjeta)»; `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:185` — «<VaultRevealButton value={credential.value} /> // el valor viaja en el payload RSC»; `src/actions/agency-actions.ts:109` — «description: data.description»; `src/components/admin/managers/VaultManager.tsx:5` — «import { createClientAssetAction } from '@/actions/agency-actions'»; `src/actions/onboarding-actions.ts:115` — «url: 'ENCRIPTADO_EN_TEXTO',»; `src/components/admin/managers/VaultManager.tsx:85` — «placeholder="Contraseña o instrucciones..."»; `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:148` — «AES-256»; `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:51` — «// ─── Demo activity log (PLACEHOLDER — data fake; modelo real = schema, parada aparte) ──»; `src/components/dashboard/VaultRevealButton.tsx:61` — «Información sensible — Solo visible para vos»; `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:131` — «? resolveCredentialDisplay(asset.description)»
- Impacto: Bloqueante para el primer cliente real: quien tenga lectura de la base o de un dump (la Neon dev es compartida con otro desarrollador) obtiene el refresh token de Google Business del cliente (permite responder reseñas en su nombre), acceso a su tienda, su API key de Cal.com, el token del bot de Telegram (AgencySettings, 20260406033000:3, escrito en claro en settings.actions.ts:161) y las credenciales de dominio y hosting cargadas en la Bóveda, mientras el portal le asegura al cliente, en el encabezado y en cada tarjeta de la Bóveda, que están cifradas con AES-256. El repo ya cifra en reposo el secret del CRM y la API key del motor, y tiene credential-cipher para la Bóveda, pero el cifrado de los write-paths (PD-1.2, commit 9fc616c4) quedó en la rama b0-isolation-motor-chatbot sin mergear: encryptCredential no tiene llamadores fuera de los tests.
- Propuesta: Cifrar en los write-paths con secret-box/credential-cipher (callbacks OAuth de GBP y Tiendanube, settings de Telegram, carga de Cal.com y assets de la Bóveda), backfill idempotente y lectura tolerante (resolve-credential ya soporta ambos formatos); mergear o portar 9fc616c4.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): modelo.Organization, modelo.AgencySettings, modelo.ClientAsset, int.google-business-profile, int.tiendanube, int.calcom, int.telegram, h2.cli-resenas, h2.cli-tienda, h2.cli-agenda, h2.cli-cuenta, int.gbp, lib.crypto, h2.cli-cuenta.boveda, h4.adm-clientes, lib.actions, h2.cli-cuenta.boveda-solicitar-documento, h4.adm-clientes.boveda-alta-activo, h4.adm-clientes.boveda-carga
- REQUIERE-VERIFICACIÓN-HUMANA: VH-031

### [SEC-037] El overview de Mi Chatbot manda al navegador la fila completa de Organization: tokens de Google Business y Tiendanube, API key de Cal.com y las notas internas de develOP
- Dominio: D5  ·  Severidad: ALTA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/admin/getClientSession.ts:17` — «include: { organization: { include: {»; `src/app/(protected)/dashboard/chatbot/page.tsx:46` — «<ChatbotOverview session={session}»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:1` — «'use client'»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:30` — «organization: Organization & { botConfig: BotConfig | null }»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:63` — «{session.bot.botName} está atendiendo consultas las 24 horas.»; `prisma/schema.prisma:359` — «gbpAccessToken String? @db.Text gbpRefreshToken String? @db.Text»; `prisma/schema.prisma:367` — «tiendanubeAccessToken String? @db.Text»; `prisma/schema.prisma:402` — «internalNotes String?»; `src/modules/chatbot/server/admin/multiTenantQueries.ts:249` — «return forOrg(botInfo.organization.id).quotaUsage.findByPeriod( (findFirst sin select, registry.ts:562)»; `src/app/(protected)/dashboard/chatbot/page.tsx:43` — «const usageSerialized = usage ? { ...usage, costUsd: Number(usage.costUsd) } : null»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:25` — «type SerializedQuotaUsage = Omit<QuotaUsage, 'costUsd'> & { costUsd: number }»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:41` — «monthlyConversations: usage?.conversationsCount ?? 0, (unico campo que usa)»; `src/modules/chatbot/server/analysis/getMonthlyAnalysisForOrg.ts:80` — «// SOLO conteos. tokensIn/tokensOut/costUsd son internos — jamás salen de acá.»
- Impacto: Bloqueante para el primer cliente con Reseñas o Tienda conectada: cualquier usuario de su org (incluido un VIEWER) recibe en el payload RSC de /dashboard/chatbot el access y refresh token de Google Business, el token sin vencimiento de Tiendanube y la API key de Cal.com (credenciales emitidas a la app de develOP sobre sus cuentas), legibles en DevTools y por cualquier XSS o extensión del navegador, y además internalNotes, las notas privadas que develOP escribe sobre ese cliente. El componente solo usa session.bot.botName; getPublicConfig del mismo módulo sí usa select.
- Propuesta: En getClientChatbotSession leer org y bot con select acotado (lo que usan las páginas: id, slug, siteUrl, companyName y campos del bot) y pasarle a ChatbotOverview solo botName; agregar un invariante que prohíba tipos Prisma completos (Organization, BotConfig, User) en props de componentes 'use client'. Confirmar antes y después con el caso de prueba del payload.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.admin, modelo.Organization, modelo.BotConfig, modelo.QuotaUsage, lib.chatbot.server
- REQUIERE-VERIFICACIÓN-HUMANA: VH-035

### [SEC-045] El cliente puede fijar su analyticsPropertyId desde el onboarding y GA4 se lee con la service account unica de develOP
- Dominio: D2  ·  Severidad: ALTA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/bienvenida/_actions/complete-onboarding.ts:13` — «ga4MeasurementId: z.string().optional(),»; `src/app/bienvenida/_actions/complete-onboarding.ts:38` — «analyticsPropertyId: parsed.data.ga4MeasurementId,»; `src/app/bienvenida/_actions/complete-onboarding.ts:23` — «const organizationId = await resolveOrgId() // no chequea que el onboarding siga pendiente: re-ejecutable»; `src/lib/analytics.ts:95` — «const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY»; `src/app/(protected)/dashboard/resultados/trafico/page.tsx:92` — «propertyId={client.analyticsPropertyId}»
- Impacto: Un cliente que conozca el ID numerico de la propiedad GA4 de otro cliente (a la que la service account de develOP tiene acceso) puede fijarlo en su org y ver el trafico de ese otro negocio en su panel.
- Propuesta: Que solo develOP asigne analyticsPropertyId; si el cliente lo informa, guardarlo como pendiente de verificacion; validar formato y bloquear la re-ejecucion del onboarding completado.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-035], [DEU-023], [FAL-010]
- Nodo(s): h2.cli-bienvenida, h2.cli-resultados, int.ga4, modelo.Organization
- REQUIERE-VERIFICACIÓN-HUMANA: VH-048

### [SEC-048] Inicio, Health Score, reporte semanal y brief IA cuentan como leads del cliente los ContactSubmission de toda la agencia (sin organizationId), incluidos los pedidos de upsell de los demás clientes
- Dominio: D2  ·  Severidad: ALTA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/dashboard/week-results.ts:43` — «prisma.contactSubmission .count({ where: { createdAt: { gte: weekAgo } },»; `src/lib/health-score.ts:312` — «void organizationId // ContactSubmission is global (no orgId FK yet), so this gives an agency-wide»; `src/components/dashboard/home/WeekResultsGrid.tsx:44` — «// · leads: el conteo es agency-wide (ContactSubmission sin organizationId,»; `src/lib/reports/executive-weekly/build.ts:175` — «value: toNumber(week.leads.value),»; `src/lib/ai/executive-brief.ts:293` — «leads: weekResults.leads,»; `src/lib/health-score.ts:311` — «async function computeLeadsScore(organizationId: string): Promise<number | null> { void organizationId»; `src/lib/health-score.ts:284` — «prisma.contactSubmission.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }) // conversion»; `prisma/schema.prisma:688` — «model ContactSubmission { // sin organizationId»; `src/lib/actions/upsell.ts:88` — «await prisma.contactSubmission.create({ data: { name: user.name ?? org.companyName, email: user.email, company: org.companyName,»; `src/components/dashboard/home/WeekResultsGrid.tsx:46` — «// para no presentarlo como dato cerrado del cliente — sin revelar que es // global.»; `src/app/(protected)/dashboard/page.tsx:183` — «const data = await getWeekResults(organizationId)»; `src/lib/health-score.ts:314` — «// ContactSubmission is global (no orgId FK yet), so this gives an agency-wide // lead volume signal — still useful as a relative trend metric.»; `src/lib/reports/executive-weekly/build.ts:174` — «leads: { value: toNumber(week.leads.value), deltaPercent: week.leads.trend,»
- Impacto: Bloqueante para el primer cliente real: la card 'Leads' de Inicio (dashboard/page.tsx:183), el Health Score (dimensiones leads y conversion, health-score.ts:282-289 y :311-333), el email del reporte ejecutivo semanal y el brief de Gemini muestran el volumen de contactos entrantes de develOP (formulario publico + upsells de todos los clientes) como leads del negocio del cliente. Todos los clientes ven el mismo numero y se filtra un agregado de actividad de otros tenants. El hedge 'En calibracion' solo existe en la card de Inicio, no en el email ni en el brief.
- Propuesta: Dejar de usar ContactSubmission para metricas de cliente: contar los leads propios de la org (p. ej. ChatbotLead via forOrg(orgId)) o mostrar '—' hasta tener fuente por org. Atribuir ContactSubmission a una org exige organizationId en prisma/schema.prisma (FROZEN: decision para Valentino). Agregar un invariante que falle si lib/dashboard, lib/health-score o lib/reports consultan modelos sin organizationId.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio, h2.cli-inicio.resultados-semana, h2.cli-reportes-email, int.vertex, modelo.ContactSubmission, h2.cli-inicio.resultados-de-la-semana, h2.cli-inicio.health-score, lib.dashboard, lib.health-score, h2.cli-inicio.resumen-ia, h2.cli-reportes-email.reporte-semanal, lib.reports, modelo.ExecutiveBriefSnapshot
- REQUIERE-VERIFICACIÓN-HUMANA: VH-051

### [SEC-074] Cortar la conexion antes de que termine el turno saltea los dos topes de gasto del chat: la conversacion nueva devuelve su cupo y la existente no suma al tope de 40 mensajes
- Dominio: D5  ·  Severidad: ALTA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/chat/handleChatRequest.ts:400` — «if (isNewConversation) { const reserve = await tryReserveConversation(orgId, bot.id, plan.quota)»; `src/modules/chatbot/server/chat/handleChatRequest.ts:1320` — «if (info.reason === 'cancelled') { runAbortController.abort()»; `src/modules/chatbot/server/chat/handleChatRequest.ts:1123` — «await compensateReservedQuota?.('stream_abort', { firstTokenDelivered: ttfbAt !== null,»; `src/modules/chatbot/server/chat/reconcile.ts:367` — «case 'stream_abort': // Antes del primer chunk util -> no se entrego nada, se devuelve. return !input.firstTokenDelivered»; `src/modules/chatbot/server/chat/handleChatRequest.ts:1031` — «ttfbAt === null && (chunk.type === 'text-delta' || chunk.type === 'tool-call')»; `src/modules/chatbot/server/chat/handleChatRequest.ts:1140` — «if (accumulatedAssistantText.trim().length > 0) {»; `src/modules/chatbot/server/chat/persistTurn.ts:447` — «messageCount: { increment: 2 }, // user + assistant»; `src/modules/chatbot/server/chat/handleChatRequest.ts:547` — «if ((conversation.messageCount ?? 0) >= HARD_CAP_MESSAGES) {»; `src/modules/chatbot/server/chat/reconcile.ts:370` — «return !input.firstTokenDelivered»; librería ai@6.0.214, dist/index.js línea 7363 — «onAbort == null ? void 0 : onAbort({ steps: recordedSteps });»; `src/modules/chatbot/server/quota/checker.ts:197` — «const discarded = await tx.conversation.deleteMany({ id: input.conversationId, messages: { none: { role: 'ASSISTANT' } },»; `src/modules/chatbot/server/conversation/resolver.ts:94` — «return { conversation, isNew: false }»; `src/modules/chatbot/server/chat/persistTurn.ts:434` — «await tx.chatMessage.create({ conversationId: conversation.id,»; `src/lib/isolation/registry.ts:334` — «client.conversation.findFirst({ where: { id, botConfig: { organizationId } }, select: { id: true } }),»
- Impacto: Bloqueante para el primer cliente real (con la credencial de Vertex renovada). Los dos techos que acotan el gasto de LLM de un visitante anonimo cuentan recien cuando el turno se cierra: (a) una conversacion nueva reserva 1 cupo, pero si el cliente corta la conexion antes del primer text-delta (el 'thinking' de Gemini 2.5 Flash no cuenta, asi que la ventana es de segundos) onAbort devuelve el cupo y borra la conversacion: el panel del cliente no ve nada; (b) en una conversacion existente, messageCount solo se incrementa dentro de persistTurn (unico escritor) y un turno cortado sin texto no se persiste, asi que el tope de 40 mensajes nunca llega. Con 1 cupo y el limite de 10 pedidos/min por sessionId, una conversacion admite unas 14.400 llamadas por dia, cada una con el system prompt completo (KB de hasta ~220 mil caracteres, ~60 mil tokens). El verificador L8 de SEC-057 dio por sentado que el gasto queda 'acotado por la cuota mensual y por HARD_CAP_MESSAGES': no lo esta. Eslabones inferidos: que la plataforma (Netlify) propague el corte del cliente al stream y que Vertex facture una llamada cortada antes del primer token (entrada + thinking).
- Propuesta: Separar 'cupo de producto' de 'techo de gasto': contar el intento de LLM (reserva o incremento de turno) antes de llamar al proveedor y no devolverlo en 'stream_abort' (desconexion del cliente), solo en fallas del proveedor ('stream_error'); sumar un techo de llamadas LLM por conversacion y por org/dia que no dependa de la persistencia del turno; registrar los turnos cortados como cobrados.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [SEC-057]
- Nodo(s): h3.vis-api-chatbot, h3.vis-widget-cliente, lib.chatbot.chat, lib.chatbot.quota, int.vertex, modelo.QuotaUsage, modelo.Conversation, lib.chatbot.conversation
- REQUIERE-VERIFICACIÓN-HUMANA: VH-105

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

### [SEC-038] Notification es por usuario pero el portal la lee y la marca por organización: el cliente ve y apaga las notificaciones dirigidas al SUPER_ADMIN, con links a /admin/projects/<id>
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:718` — «userId String»; `src/app/(protected)/dashboard/layout.tsx:101` — «prisma.notification.findMany({ where: { organizationId },»; `src/lib/actions/notifications.ts:33` — «await prisma.notification.updateMany({ where: { id: parsed.data.id, organizationId },»; `src/lib/actions/notifications.ts:82` — «const notifications = await prisma.notification.findMany({ where: { organizationId },»; `src/actions/dashboard-actions.ts:67` — «userId: admin.id, organizationId, taskId: task.id,»; `src/actions/dashboard-actions.ts:70` — «actionUrl: '/admin/projects/${task.projectId}',»; `src/actions/agency-actions.ts:54` — «const notifications = orgMembers.map(member => ({»; `src/components/dashboard/NotificationCenter.tsx:125` — «router.push(notif.actionUrl)»; `src/actions/dashboard-actions.ts:62` — «await tx.notification.createMany({ data: superAdmins.map((admin) => ({ ... userId: admin.id, organizationId,»; `src/lib/actions/notifications.ts:55` — «await prisma.notification.updateMany({ where: { organizationId, read: false },»; `src/lib/actions/upsell.ts:107` — «const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' },»
- Impacto: Cuando un cliente aprueba o rechaza una entrega, la campana de todos los miembros de su org muestra las notificaciones escritas para el SUPER_ADMIN ('Cliente pidio cambios en...', 'Entrega aprobada por cliente...'), con un link a /admin/projects/<id> que expone el id interno y rebota en el proxy; cada miembro ve también las copias de los demás (una por miembro en cada pedido de aprobación) y cualquiera las marca leídas para todos. Ninguna pantalla del admin lee Notification, así que los avisos al SUPER_ADMIN (upsell, mensajes, referidos, aprobaciones) solo terminan en la campana del cliente o en ningún lado.
- Propuesta: En dashboard/layout.tsx y lib/actions/notifications.ts (libres) filtrar lectura y marcado por { userId de la sesión, organizationId }. Decisión para Valentino (dashboard-actions.ts es FROZEN): no poner organizationId en las notificaciones del admin y decidir si el equipo necesita una bandeja propia o si esos avisos van solo por alerta/email.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-shell, h2.cli-proyecto, h4.adm-proyectos, modelo.Notification, lib.actions, h2.cli-shell.notificaciones, h2.cli-proyecto.aprobar-o-pedir-cambios, h2.cli-shell.campana-notificaciones, h2.cli-proyecto.aprobacion-entregas, h4.adm-dashboard

### [SEC-039] La baja de una campaña puede caer en otro cliente: CONTACT_ID y OPTOUT_TOKEN se guardan en el contacto global de Brevo y el último import de ese email los pisa
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:114` — «CONTACT_ID: contact.id, OPTOUT_TOKEN: signEmailContactOptOutToken(contact.id),»; `src/lib/integrations/brevo.ts:49` — «listIds: params.listIds, updateEnabled: true,»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:155` — «/api/email/optout/{{contact.CONTACT_ID}}?token={{contact.OPTOUT_TOKEN}}»; `prisma/schema.prisma:1229` — «@@unique([organizationId, email])»; `src/app/api/email/optout/[contactId]/route.ts:91` — «await prisma.emailContact.updateMany({ where: { id: contactId },»; `src/lib/integrations/brevo.ts:39` — «const res = await fetch('${API_BASE}/contacts', { method: 'POST', ... updateEnabled: true»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:113` — «attributes: { CONTACT_ID: contact.id, OPTOUT_TOKEN: signEmailContactOptOutToken(contact.id) },»
- Impacto: Si dos clientes de develOP tienen al mismo destinatario (caso común), el contacto de Brevo es uno solo por email en la cuenta compartida y queda con el CONTACT_ID del último cliente que importó. Cuando esa persona se da de baja desde la campaña del cliente A, el link apunta al EmailContact del cliente B: se marca optedOut en la base de B (escritura entre tenants disparada por un tercero) y A la sigue contando como activa. Un cliente con el módulo puede provocarlo a propósito importando emails de la lista de otro.
- Propuesta: No guardar ids por tenant en atributos globales de Brevo: firmar un token que incluya organizationId y email y resolver la fila por (org, email) en la ruta de baja, o usar atributos por lista/org y el desuscribe nativo por lista. Verificar el modelo de contactos de Brevo con el caso de prueba.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt, h6.vis-optout, int.brevo, modelo.EmailContact, h2.cli-email-mkt.baja-de-contactos
- REQUIERE-VERIFICACIÓN-HUMANA: VH-037

### [SEC-040] El export masivo de leads del admin no neutraliza fórmulas: un visitante anónimo del widget puede inyectar una fórmula en un CSV que junta leads de varias organizaciones
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/bulk-actions.ts:50` — «const leads = await prisma.chatbotLead.findMany({ where: { botConfig: { organizationId: { in: uniqueOrgIds } } },»; `src/lib/bulk-actions.ts:74` — «.map((value) => '"${String(value).replace(/"/g, '""')}"')»; `src/modules/chatbot/server/leads/csv/csvEscape.ts:22` — «const DANGEROUS_PREFIX = /^[=+\-@\t\r]/»; `src/modules/chatbot/server/tools/captureLead.ts:59` — «name: z.string().min(2).max(100).describe(»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:121` — «const result = await bulkExportLeads([...selected])»; `src/app/(protected)/admin/chatbots/bulk-actions.ts:139` — «(lead.intent ?? '').replace(/"/g, '""'),»; `src/app/(protected)/admin/chatbots/bulk-actions.ts:144` — «const csv = [headers.join(','), ...rows.map(r => r.map(v => '"${v}"').join(','))].join('\n')»; `src/modules/chatbot/server/leads/csv/csvEscape.ts:25` — «export function csvEscape(value: string | number | null | undefined): string {»
- Impacto: El export del cliente ya prefija las celdas peligrosas (csvEscape.ts:5-10 documenta este mismo ataque), pero el export del admin no: un visitante que deja como nombre '=HYPERLINK(...)' o una fórmula IMPORT convierte el CSV que develOP abre en Excel o Google Sheets en un vector para mandar a un tercero nombres, emails y teléfonos de los leads de todas las orgs seleccionadas.
- Propuesta: Reusar rowToCsv/csvEscape de modules/chatbot/server/leads/csv en bulkExportLeads (y en cualquier otro CSV del admin); agregar un invariante que busque armados de CSV con join(',') fuera de ese helper.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes, h3.vis-widget-cliente, modelo.ChatbotLead, lib.actions, h3.adm-chatbots, h3.adm-chatbots.acciones-bulk, lib.chatbot.leads
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

### [SEC-044] Email marketing: las 3 server actions no verifican el módulo contratado, no validan con Zod ni tienen rate limit, y mandan el remitente y el HTML del formulario por la cuenta Brevo de develOP
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:17` — «async function getOrgWithBrevo() { const organizationId = await resolveOrgId() // sin isModuleActive»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:134` — «const fromEmail = (formData.get('fromEmail') as string | null)?.trim()»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:137` — «if (!name || !subject || !fromName || !fromEmail || !htmlContent) {»; `src/lib/integrations/brevo.ts:76` — «sender: { name: params.fromName, email: params.fromEmail },»; `src/app/(protected)/dashboard/modules/email-marketing/layout.tsx:20` — «const isActive = await isModuleActive(organizationId, 'email-marketing') // unico gate»; `src/components/dashboard/modules/motor-resenas/_actions.ts:23` — «const isActive = await isModuleActive(organizationId, 'motor-resenas') // control: este modulo si lo chequea en la action»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:174` — «export async function sendCampaignAction(campaignId: string) { const org = await getOrgWithBrevo()»
- Impacto: Bloqueante para el primer cliente real: cualquier ORG_MEMBER (o un cliente que dio de baja el modulo) que obtenga el ID de las actions puede importar contactos arbitrarios y enviar HTML arbitrario con el remitente que quiera por la cuenta Brevo compartida de develOP, sin tope de tamano ni rate limit. Una denuncia de spam suspende la cuenta Brevo y con ella los emails transaccionales de todos los clientes.
- Propuesta: En cada action: gate con isModuleActive usando el slug real del catalogo; schema Zod con largos maximos y fromEmail validado contra remitentes verificados de la org o el dominio de develOP; tope de filas/bytes del CSV; checkRateLimit por org con un preset nuevo. Evaluar subcuentas Brevo por cliente.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [BUG-012], [BUG-021], [SEC-039], [SEC-005]
- Nodo(s): h2.cli-email-mkt, h2.cli-email-mkt.crear-y-enviar-campana, h2.cli-email-mkt.importar-contactos, int.brevo, lib.rate-limit, modelo.EmailCampaign, lib.modules, modelo.EmailContact
- REQUIERE-VERIFICACIÓN-HUMANA: VH-043

### [SEC-047] Formularios y actions del portal sin rate limit y con validación incompleta: tickets, mensajes, upsell, onboarding y PDF sin tope; texto libre sin .max(); el nombre del módulo lo manda el cliente
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/tickets/schemas.ts:5` — «title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres.'),»; `src/lib/tickets/actions.ts:88` — «if (parsed.data.priority === 'HIGH' || parsed.data.priority === 'URGENT') {»; `src/lib/actions/schemas.ts:47` — «featureName: z.string().trim().min(1, 'Nombre de feature inválido.'),»; `src/app/api/reports/client-monthly/route.ts:40` — «const buffer = await renderToBuffer(»; `src/app/bienvenida/_actions/complete-onboarding.ts:10` — «companyName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),»; `src/lib/actions/profile.ts:87` — «const whatsapp = ((formData.get('whatsapp') as string | null) ?? '').trim() || null»; `src/lib/tickets/actions.ts:92` — «detail: ticket.title,»; `src/lib/actions/upsell.ts:102` — «detail: 'Solicitó activar ${parsed.data.featureName}. Contacto: ${user.email}.',»; `src/lib/actions/messages.ts:155` — «sendAgencyAlert({ type: 'MESSAGE_NEW',»; `src/lib/tickets/actions.ts:89` — «sendAgencyAlert({ type: 'TICKET_URGENT',»; `src/lib/actions/profile.ts:218` — «const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password)»; `src/lib/actions/schemas.ts:45` — «export const UpsellRequestSchema = z.object({ featureKey: z.string().trim().min(1, 'Feature inválida.'), featureName: z.string().trim().min(1, 'Nombre de feature inválido.'),»; `src/lib/actions/upsell.ts:81` — «const lastSubmission = await prisma.contactSubmission.findFirst({ where: { email: user.email, service: parsed.data.featureKey },»; `src/lib/actions/upsell.ts:99` — «sendAgencyAlert({ type: 'LEAD_UPSELL',»; `src/lib/actions/upsell.ts:128` — «title: '${org.companyName} está interesada en ${parsed.data.featureName}',»; `src/lib/tickets/actions.ts:49` — «const session = await auth() const organizationId = await resolveOrgId() (sin checkRateLimit en todo el archivo)»
- Impacto: Un usuario de cliente autenticado puede crear tickets urgentes sin límite (cada uno dispara la alerta al webhook de develOP con el título sin tope), inflar upsellRequestCount con clics y forzar renders de PDF en serie. CLAUDE.md exige rate limit en todo envío de formulario; checkRateLimit y RATE_LIMIT_PRESETS ya existen (lib/rate-limit) y no se usan acá.
- Propuesta: checkRateLimit por userId en createTicketAction, requestUpsellAction, completeOnboardingAction y la ruta del PDF; .max() en title, description, featureName, companyName, whatsapp.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-015], [SEC-016], [SEC-032]
- Nodo(s): h2.cli-soporte.crear-ticket, h2.cli-servicios.vitrina-modulos, h2.cli-resultados.informe-mensual-pdf, lib.rate-limit, int.webhook-alertas, h2.cli-cuenta.perfil-empresa, h2.cli-servicios.solicitar-modulo, lib.actions, h2.cli-mensajes, h2.cli-soporte, h2.cli-cuenta.cambiar-password, h2.cli-servicios, h2.cli-plan, h4.adm-leads, modelo.ContactSubmission, lib.tickets, int.alert-webhook

### [SEC-051] Acciones del motor de reseñas sin Zod ni rate limit: rating, nombre y texto que van al LLM los manda el navegador, reviewName se interpola en la URL de Google y los errores crudos vuelven al cliente
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/modules/motor-resenas/_actions.ts:11` — «export async function generateDraft(params: { organizationId: string rating: number»; `src/components/dashboard/modules/motor-resenas/_actions.ts:35` — «rating: params.rating, reviewerName: params.reviewerName, reviewComment: params.reviewComment,»; `src/components/dashboard/modules/motor-resenas/_actions.ts:43` — «error: err instanceof Error ? err.message : 'Error generando draft',»; `src/lib/integrations/google-business-profile.ts:285` — «'https://mybusiness.googleapis.com/v4/${reviewName}/reply',»; `src/lib/integrations/google-business-profile.ts:298` — «return { ok: false, error: 'Google API: ${res.status} ${text}' }»; `src/lib/ai/review-reply-draft.ts:28` — «Comentario: ${params.reviewComment ?? '(sin texto, solo rating)'}»; `src/components/dashboard/modules/motor-resenas/_actions.ts:33` — «const draft = await generateReviewReplyDraft({ ... rating: params.rating, reviewerName: params.reviewerName,»; `src/app/(protected)/dashboard/modules/motor-resenas/_components/ReviewItem.tsx:49` — «const result = await generateDraft({ organizationId, rating: review.rating, reviewerName: review.reviewerName, reviewComment: review.comment,»
- Impacto: Con el módulo activo, un usuario puede mandar a Claude Haiku texto arbitrario y sin tope (costo, y prompt-injection sobre la respuesta que después publica en Google), sin rate limit; puede apuntar el PUT de respuesta a cualquier recurso v4 que alcance el token OAuth de su org (si develOP conectara GBP con una cuenta de agencia que administra varias fichas, a fichas de otros clientes: HIPÓTESIS); y ve en la UI mensajes internos de Anthropic y de Google (ReviewItem.tsx:59, :76).
- Propuesta: Zod en ambas actions (rating entero 1-5, textos con .max(), reviewName con patrón accounts/{n}/locations/{n}/reviews/{id}); que generateDraft relea la reseña por reviewName en GBP en vez de confiar en el payload; verificar que el reviewName pertenezca al gbpLocationId de la org; mensajes genéricos + captureException; rate limit por org.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [SEC-032]
- Nodo(s): h2.cli-resenas, int.gbp, int.anthropic, lib.ai, h2.cli-resenas.responder-resenas-con-ia, lib.rate-limit
- REQUIERE-VERIFICACIÓN-HUMANA: VH-056

### [SEC-053] El selector de sucursal GBP 'self-service' valida la pertenencia contra lo que ve el token, y ese token lo obtiene un SUPER_ADMIN: con la cuenta de Google de develOP un cliente podria listar y adoptar fichas de otros clientes (latente, sin importadores)
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/api/auth/google-business/start/route.ts:7` — «if (!session?.user || session.user.role !== 'SUPER_ADMIN') {»; `src/app/api/auth/google-business/callback/route.ts:49` — «await prisma.organization.update({ where: { id: orgId }, data: { gbpAccessToken: tokens.access_token, ...»; `src/lib/actions/gbp-connection.ts:15` — «* SUPER_ADMIN no tiene organizationId → no puede usarlo; es self-service del dueño.»; `src/lib/integrations/gbp-connection-logic.ts:263` — «const { locations } = await discoverLocations(accessToken, deps) const hit = findLocationInList(locations, locationId)»; `src/lib/integrations/gbp-connection-logic.ts:241` — «return locations.map((l) => ({ ... title: l.title, address: l.address,»; `docs/sprints/p3-a-1-gbp-connection.md:116` — «tokens de la propia org) + persiste el compuesto + one-shot. Ninguna location cross-org es alcanzable.»; `src/lib/integrations/google-business-profile.ts:341` — «'https://mybusiness.googleapis.com/v4/${org.gbpLocationId}/reviews?pageSize=50',»
- Impacto: Hoy no es explotable: listAvailableLocations y setActiveLocation no tienen importadores (POD-059) y el start del OAuth no esta enlazado (FAL-011). Pero el diseno afirma que ninguna ficha de otra org es alcanzable apoyandose en un supuesto que el codigo no garantiza: el consentimiento de Google ocurre en la sesion del SUPER_ADMIN, asi que si develOP conecta las fichas con su cuenta de agencia (la que administra las fichas de varios clientes), el token guardado en cada org ve todas esas fichas. El dia que P3-A.2 (PLAN-118) monte el selector self-service, el primer cliente real veria nombre y direccion de las fichas de los demas clientes y podria fijar una ajena como propia: su portal mostraria las resenas y metricas de otro negocio y publicaria respuestas en el Google de ese otro negocio.
- Propuesta: Antes de construir el selector, decidir con que cuenta de Google se conecta cada org. Si es la de develOP: la ubicacion de cada org la fija solo el SUPER_ADMIN (action con requireSuperAdmin), el cliente no lista ubicaciones, y replyToReview/listReviews verifican que el recurso cuelgue de org.gbpLocationId. Si es la del cliente: el OAuth lo tiene que poder iniciar el dueno (hoy es SUPER_ADMIN-only) y el token deja de ser de develOP. Mientras tanto, podar gbp-connection.ts (POD-059) o marcarlo como no apto para el cliente.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [SEC-051], [FAL-011]
- Nodo(s): h2.cli-resenas, h2.cli-resenas.publicar-respuesta, h2.cli-resultados.reputacion-gbp, int.gbp, lib.actions, modelo.Organization
- REQUIERE-VERIFICACIÓN-HUMANA: VH-060

### [SEC-054] Texto de clientes y de visitantes anónimos llega sin neutralizar al webhook de alertas (Slack): menciones <!channel>/<!here> y enlaces con texto engañoso en el canal interno de develOP
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/alerts.ts:64` — «'🏢 Cliente: ${event.clientName}', '💬 ${event.detail}',»; `src/lib/alerts.ts:134` — «body: JSON.stringify({ text: formatAlertMessage(event) }),»; `src/lib/tickets/actions.ts:92` — «detail: ticket.title,»; `src/lib/actions/messages.ts:160` — «? '${parsedMessage.data.content.slice(0, 160)}...'»; `src/lib/actions/upsell.ts:102` — «detail: 'Solicitó activar ${parsed.data.featureName}. Contacto: ${user.email}.',»; `src/lib/actions/contact.ts:74` — «clientName: payload.company || payload.name,»; `src/app/(protected)/admin/settings/_components/settings-console.tsx:267` — «placeholder="https://hooks.slack.com/..."»; `src/lib/actions/messages.ts:157` — «clientName: org.companyName, detail: parsedMessage.data.content.length > 160»; `src/lib/actions/schemas.ts:16` — «companyName: z.string().trim().min(2, 'La empresa debe tener al menos 2 caracteres.'),»
- Impacto: Con el webhook de Slack configurado (el destino que sugiere el panel), un cliente (titulo de ticket Alta/Urgente, mensaje, nombre del modulo pedido, nombre de empresa) o cualquier visitante anonimo del formulario publico (nombre, empresa, servicio) controla texto que Slack interpreta como formato: puede notificar a todo el canal con <!channel>/<!here> y publicar enlaces disfrazados (<https://sitio-falso|Abrir ticket en el admin>) dentro de una alerta que el equipo toma como del sistema. Es un vector de phishing contra quien tiene la cuenta SUPER_ADMIN y de ruido en el canal; ningun campo tiene tope de largo (SEC-047, SEC-032).
- Propuesta: Decision para Valentino (src/lib/alerts.ts es congelado): escapar &, < y > en formatAlertMessage (formato de escape de Slack) o enviar los campos del usuario como texto plano en un bloque sin mrkdwn, y truncarlos. Alternativa en zona libre: neutralizar y truncar en los llamadores (tickets/actions.ts, messages.ts, upsell.ts, contact.ts) antes de llamar a sendAgencyAlert.
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): h2.cli-soporte.crear-ticket, h2.cli-mensajes.enviar-mensaje, h2.cli-servicios.solicitar-modulo, h6.vis-contacto, h4.adm-config, lib.alerts, int.slack, h2.cli-soporte, h2.cli-mensajes, h2.cli-servicios, int.webhook-alertas
- REQUIERE-VERIFICACIÓN-HUMANA: VH-061

### [SEC-056] Inyección indirecta de instrucciones: lo que un visitante escribe en el widget entra al prompt de los insights y vuelve al dueño como «Qué podés hacer», firmado por develOP y sin revisión
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/insights/generateInsights.ts:62` — «.filter((message) => message.role === 'USER') .map((message) => message.content)»; `src/modules/chatbot/server/insights/generateInsights.ts:66` — «return '[Conv ${index + 1}, path=${conversation.currentPath ?? '/'}, leadCaptured=${conversation.leadCaptured}]: ${userMessages.slice(0, 400)}'»; `src/modules/chatbot/server/insights/generateInsights.ts:106` — «prompt: 'Conversaciones a analizar:\n\n${conversationsSummary}',»; `src/modules/chatbot/server/insights/generateInsights.ts:123` — «suggestedAction: insight.suggestedAction, evidenceCount: insight.evidenceCount, status: 'PENDING',»; `src/modules/chatbot/server/analysis/getMonthlyAnalysisForOrg.ts:62` — «where: { botConfigId, status: { in: ['PENDING', 'APPLIED'] } },»; `src/components/dashboard/results/analysis/DiscoveriesSection.tsx:38` — «develOP revisa las conversaciones de tu asistente y te cuenta qué encontró»; `src/components/dashboard/results/analysis/DiscoveriesSection.tsx:87` — «{insight.suggestedAction} (bajo el rótulo «Qué podés hacer», :84)»; `src/lib/reports/client-monthly/ClientMonthlyReportPdf.tsx:280` — «<Text>{insight.suggestedAction}</Text>»; `netlify.toml:25` — «[functions."generate-insights-cron"] schedule = "0 9 * * *"»; `src/lib/ai/results-insights.ts:133` — «'- "${q.query}": ${q.impressions} imp, ${q.clicks} clicks, posición ${q.position.toFixed(1)}' (mismo patrón con los pagePath de GA4 en :82)»
- Impacto: Bloqueante para el primer cliente Pro o Business con el análisis activo. Un visitante anónimo que abra 10 o más conversaciones en el widget (el mínimo está en :45) puede dictarle al modelo el texto de los «descubrimientos». El cron diario los publica como PENDING, sin revisión humana, y el cliente los ve en Resultados > Análisis y en el PDF mensual bajo «Qué podés hacer», con un copy que asegura que develOP revisó las conversaciones. Ejemplos: «cambiá el WhatsApp de derivación al +54…», «agregá a la KB que los pagos van al alias X», «contactá a tal proveedor». Las respuestas del modelo admiten hasta 500 caracteres por campo (:17). Hoy está latente por la credencial de Vertex vencida.
- Propuesta: Tratar como datos no confiables los mensajes de visitantes, el currentPath y las consultas y paths de GA4/Search Console: delimitarlos en un bloque etiquetado e instruir al modelo a no seguir instrucciones que vengan adentro. No mostrarle al cliente insights PENDING; publicar solo los que develOP revisó (hoy actOnInsight no tiene pantalla, BUG-023) o, al menos, filtrar en la salida teléfonos, URLs, CBU/alias y pedidos de cambio de contacto. Corregir el copy «develOP revisa» para que diga lo que realmente pasa. El generador es del dominio D5.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados, h3.vis-widget-cliente, lib.chatbot.insights, modelo.ChatbotInsight, int.vertex, int.cron.generate-insights
- REQUIERE-VERIFICACIÓN-HUMANA: VH-064

### [SEC-058] Texto del visitante entra al system prompt sin delimitar (currentPath) y el historial 'assistant' que manda el navegador se acepta tal cual
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/chat/requestSchema.ts:56` — «currentPath: z.string().max(500).optional(),»; `src/modules/chatbot/server/chat/handleChatRequest.ts:651` — «currentPath: body.currentPath,»; `src/modules/chatbot/server/prompts/sections.ts:200` — «- Ruta del usuario: ${context.currentPath ?? 'no determinada'}»; `src/modules/chatbot/server/chat/handleChatRequest.ts:946` — «if (m.role === 'assistant') { return { role: 'assistant', content: [{ type: 'text', text: m.content }] }»; `src/modules/chatbot/server/chat/requestSchema.ts:48` — «role: z.enum(['user', 'assistant', 'system']), content: z.string().max(MAX_MESSAGE_CHARS),»; `src/modules/chatbot/server/chat/persistTurn.ts:279` — «const warnings = validateAssistantOutput(text)»; `src/modules/chatbot/server/chat/handleChatRequest.ts:947` — «return { role: 'assistant', content: [{ type: 'text', text: m.content }] }»
- Impacto: El spotlighting con nonce (SEC-LLM-01) envuelve solo los mensajes 'user'. Por currentPath (500 caracteres libres, con saltos de línea) un visitante escribe dentro del system prompt con autoridad de operador, y con turnos 'assistant' falsos arma un historial a medida. Puede hacer que el bot prometa precios o condiciones falsas a nombre del cliente (capturas), disparar capture_lead con datos inventados (mails al cliente y sync al CRM) o sacar la guía de ventas interna (salesGuidance/forbiddenStatements). El daño queda en la conversación del atacante y en las tools de ese tenant.
- Propuesta: Validar currentPath como ruta (regex de path, sin saltos de línea, ≤200) o pasarlo por el canal no confiable; reconstruir el historial 'assistant' desde los ChatMessage persistidos (o firmarlo con HMAC) en vez de confiar en el body.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-api-chatbot, lib.chatbot.prompts, lib.chatbot.chat, int.vertex
- REQUIERE-VERIFICACIÓN-HUMANA: VH-068

### [SEC-059] El health público del chatbot devuelve el mapa de variables de entorno, errores internos y la existencia de bots, sin rate limit
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/api/chatbot/[slug]/health/route.ts:12` — «const health = await checkChatbotHealth(slug) return Response.json(health, {»; `src/modules/chatbot/server/health/checkHealth.ts:93` — «env: { ok: envResult.allCriticalPresent, details: envResult },»; `src/modules/chatbot/server/config/envValidator.ts:84` — «const vars: EnvVarStatus[] = ENV_VARS.map((v) => {»; `src/modules/chatbot/server/health/checkHealth.ts:35` — «dbCheck = { ok: false, error: error instanceof Error ? error.message : 'unknown' }»; `src/modules/chatbot/server/health/checkHealth.ts:74` — «botCheck = { ok: false, error: 'Bot with slug "${slug}" not found' }»; `src/modules/chatbot/server/health/checkHealth.ts:76` — «botCheck = { ok: false, slug: bot.slug, botName: bot.botName, error: 'Bot is inactive' }»; `src/proxy.ts:172` — «matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', ...]»; `src/modules/chatbot/server/health/index.ts:2` — «// endpoint /smoke (GET público que quemaba una llamada real a Vertex por hit,»
- Impacto: Cualquiera sin login obtiene qué secretos están configurados (si falta CHATBOT_IP_HASH_SALT, todas las conversaciones dan 500 en prod), el texto crudo del error de la base o del proveedor cuando fallan (puede incluir host o proyecto GCP) y puede enumerar qué slugs existen y están activos. Cada pedido hace dos queries a Neon sin freno. Contradice 'Never expose internal error messages'.
- Propuesta: Que el endpoint público devuelva solo {ok} (o exija CRON_SECRET/admin) y tenga rate limit; el detalle queda en /admin/chatbot/health y en logs.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-api-chatbot, h3.vis-api-chatbot.health-publico, lib.chatbot.health, lib.security, h3.adm-health, lib.rate-limit, lib.proxy, int.neon, lib.prisma

### [SEC-060] Las rutas de IA del admin (test-prompt, demo-chat) responden 500 y generan un evento de Sentry por cada pedido anónimo
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/api/admin/chatbot/test-prompt/route.ts:28` — «await requireSuperAdmin()»; `src/app/api/admin/chatbot/demo-chat/[slug]/route.ts:32` — «await requireSuperAdmin()»; `src/modules/chatbot/server/admin/requireSuperAdmin.ts:10` — «if (!session?.user) { throw new Error('UNAUTHORIZED: no active session')»; `src/instrumentation.ts:49` — «export const onRequestError = Sentry.captureRequestError»; `src/proxy.ts:172` — «matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password'],»
- Impacto: Un script anónimo en bucle no llega al LLM (bien), pero cada pedido es un 500 y un evento en Sentry: se puede gastar la cuota de Sentry y tapar errores reales. /api no pasa por el proxy, así que no hay otra barrera.
- Propuesta: Chequear la sesión y devolver 401/403 JSON sin throw en los route handlers (o envolver el guard en try/catch).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.kb-y-sandbox, int.sentry, lib.chatbot.admin
- REQUIERE-VERIFICACIÓN-HUMANA: VH-092

### [SEC-061] Cada 403 de origen escribe un ChatbotEvent antes de cualquier rate limit
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/api/chatbot/[slug]/chat/route.ts:42` — «const validation = await validateOrigin({ origin, botSlug: slug })»; `src/app/api/chatbot/[slug]/chat/route.ts:55` — «await forOrg(validation.organizationId) .chatbotEvent.create({»; `src/app/api/chatbot/[slug]/chat/route.ts:79` — «const ipHash = hashIp(extractClientIp(request))»
- Impacto: Para cualquier bot activo, un anónimo con un Origin no permitido genera una lectura y una escritura en Neon por pedido, sin tope: infla chatbot_events (30 días de retención), ensucia el log de actividad del admin y fabrica picos de 'dominio no autorizado'.
- Propuesta: Rate limit por IP antes de validateOrigin y registrar los bloqueos agregados (uno por origin por ventana) en vez de uno por pedido.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-api-chatbot, modelo.ChatbotEvent, lib.rate-limit

### [SEC-065] runPreflightChecks: server action exportada sin sesión ni rol
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/admin/preflightChecks.ts:1` — «'use server'»; `src/modules/chatbot/server/admin/preflightChecks.ts:13` — «export async function runPreflightChecks(botId: string): Promise<PreflightCheck[]> {»; `src/modules/chatbot/server/admin/preflightChecks.ts:19` — «'ADMIN: preflight — lectura del bot por id (super-admin, cualquier org)',»; `src/modules/chatbot/server/admin/preflightChecks.ts:123` — «message: 'Numero: +${bot.whatsappNumber}',»; `src/app/(protected)/admin/chatbots/[botId]/BotDetailClient.tsx:140` — «const checks = await runPreflightChecks(bot.id)»; `src/app/(protected)/admin/chatbots/[botId]/actions.ts:30` — «if (!session?.user || session.user.role !== 'SUPER_ADMIN') {»; `src/modules/chatbot/server/admin/preflightChecks.ts:18` — «const bot = await unsafeGlobalQuery(»
- Impacto: La función se importa desde un client component, así que es un endpoint público: quien tenga el id de la action (está en el JS de /admin/chatbots/[botId]) y el cuid de un bot puede leer sin sesión el estado de configuración de un bot de cualquier organización (completitud de la KB, número de WhatsApp, color, cuota). El escape unsafeGlobalQuery dice 'super-admin' pero nada lo exige. Viola la regla 'verificar sesión y rol en cada Server Action'. Las precondiciones (id de la action y del bot) lo dejan en MEDIA.
- Propuesta: Llamar requireSuperAdmin() al inicio y validar botId con Zod; sacar canActivate del archivo 'use server' (es una función pura); repetir el preflight en el servidor dentro de la action que activa.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.activar-bot-preflight, lib.chatbot.admin, lib.isolation, modelo.BotConfig, h3.adm-chatbots, h3.adm-chatbots.activar-pausar-eliminar, h3.adm-chatbots.preflight-activacion
- REQUIERE-VERIFICACIÓN-HUMANA: VH-073

### [SEC-068] El widget de cualquier cliente corre desde cualquier sitio: el embed vive en develop.com.ar, que la allowlist deja pasar siempre
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `next.config.ts:129` — «source: '/embed/:slug*', ... { key: 'Content-Security-Policy', value: "frame-ancestors *;" } (comentario :127-128: 'R18 will restrict to a whitelist')»; `src/lib/security/validate-origin.ts:71` — «origin === 'https://develop.com.ar' || origin === 'https://www.develop.com.ar' -> return { allowed: true, ... }»; `src/modules/chatbot/server/chat/degradedResponse.ts:97` — «// develop.com.ar nunca cae al cap»; `public/widget.js:125` — «iframe.src = ... '/embed/' + ... (BASE_URL = 'https://develop.com.ar' en :21)»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:67` — «if (event.data?.type === 'develop:init') { parentOriginRef.current = event.origin»; `src/modules/chatbot/components/admin/onboarding/Step1Company.tsx:115` — «<label className="block text-sm text-zinc-400 mb-1">URL del sitio web (opcional)</label>»; `src/modules/chatbot/server/admin/createClientWithBot.ts:134` — «siteUrl: parsed.websiteUrl,»; `src/modules/chatbot/server/admin/createClientWithBot.ts:165` — «isActive: true,»; `src/lib/security/validate-origin.ts:78` — «if (bot.allowedDomains.length === 0) {»; `src/modules/chatbot/components/admin/onboarding/Step5Review.tsx:350` — «? 'El cliente se creará y el bot quedará activo inmediatamente.'»
- Impacto: Todo el trafico del widget sale del iframe /embed alojado en develop.com.ar, asi que el POST a /chat lleva Origin develop.com.ar y validateOrigin lo acepta para cualquier bot; el tope de dominios del plan tampoco aplica. Bloqueante para el primer cliente real: cualquier tercero puede pegar el snippet con su slug (o un iframe a /embed/<slug>) en otro sitio y agotar su cupo mensual (el bot queda degradado para sus visitantes reales) y el costo de Vertex de develOP; un cliente Starter (maxDomains 1) puede instalarlo en dominios ilimitados.
- Propuesta: Decidir el modelo de confianza: que widget.js pase el origen del host, que el embed lo valide (event.origin del handshake) y lo reenvie a /config y /chat, y que el servidor lo contraste contra allowedDomains y el tope del plan; frame-ancestors dinamico por bot desde allowedDomains (el R18 pendiente). Documentar que Origin se puede forjar fuera del navegador: el limite real de costo siguen siendo rate limit y cupo.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [SEC-057], [UX-017]
- Nodo(s): h3.vis-widget-cliente, h3.vis-widget-cliente.chat-embebido, lib.security, int.vertex, modelo.BotConfig, h4.adm-clientes.alta-cliente-con-bot
- REQUIERE-VERIFICACIÓN-HUMANA: VH-085

### [SEC-072] SSRF del webhook CRM: solo se valida la URL inicial (pasan redirects, DNS e IPv6 mapeada) y 'Probar conexión' le devuelve al cliente hasta 200 caracteres de la respuesta
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/crm/validateWebhookUrl.ts:11` — «Deuda conocida (roadmap-pendientes): DNS rebinding.»; `src/modules/chatbot/server/crm/validateWebhookUrl.ts:87` — «hostname === '::1' || hostname.startsWith('fe80:') ||»; `src/modules/chatbot/server/crm/postToN8n.ts:87` — «const response = await fetch(input.webhookUrl, { method: 'POST',»; `src/modules/chatbot/server/crm/postToN8n.ts:117` — «errorMessage: sanitizeSnippet('HTTP ${response.status}: ${errorBody}'),»; `src/modules/chatbot/server/admin/integrations/testCrmConnection.ts:115` — «error: result.errorMessage ?? 'Falló la conexión',»
- Impacto: Un usuario de un cliente con CRM habilitado puede hacer que el servidor de develOP pegue a destinos internos: con una URL https propia que redirige (301/302/307) a http://127.0.0.1:<puerto> o 169.254.169.254, o con https://[::ffff:7f00:1]/ (loopback IPv4 mapeado, que el validador no reconoce), o con un dominio que resuelve a IP privada. Con 'Probar conexión' lee el status y los primeros 200 caracteres de las respuestas de error. Precondición: cuenta de cliente con plan CRM.
- Propuesta: fetch con redirect:'manual' (o validar cada salto); resolver DNS justo antes del POST y bloquear rangos privados, incluidos ::ffff:0:0/96, ::, 0.0.0.0/8 y 100.64.0.0/10; conectar a la IP validada; en 'Probar conexión' devolver solo un estado genérico (ok / código HTTP).
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.crm, int.n8n
- REQUIERE-VERIFICACIÓN-HUMANA: VH-099

### [SEC-073] Datos personales de visitantes de todos los clientes se envian al Telegram del equipo de develOP
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/tools/captureLead.ts:444` — «// Telegram — always fires for the develOP team when configured (env-based)»; `src/modules/chatbot/server/tools/captureLead.ts:450` — «phone ? 'Tel: ${phone}' : '',»; `src/modules/chatbot/server/tools/showWhatsappHandoff.ts:157` — «input.visitorContact ? 'Contacto: ${input.visitorContact}' : '',»
- Impacto: Nombre, email, telefono y resumen de cada lead de cada cliente salen a un chat de Telegram de develOP sin opcion por cliente. Con el primer cliente real, develOP actua como encargado de datos de terceros y esa transferencia tendria que estar declarada y acotada (Ley 25.326). Decision para Valentino.
- Propuesta: Gate por cliente (opt-in) o mandar solo identificadores y link al panel; documentar el tratamiento en la politica y el contrato.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.chatbot.tools, int.telegram, modelo.ChatbotLead

### [SEC-075] El aviso de 'Lead caliente' saltea el tope anti-spam y lo caliente lo dictan las senales del visitante: un anonimo manda un mail por conversacion al dueno y un Telegram por lead y por derivacion al equipo de develOP
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/client-notifications/decide.ts:47` — «if (input.classification === 'hot' && input.hasLeadScoring) { return { notify: true, template: 'hot', bypassCap: true }»; `src/lib/client-notifications/notify.ts:111` — «if (!decision.bypassCap) { const cap = await checkRateLimit({»; `src/modules/chatbot/server/verticals/packs/base.ts:28` — «key: 'requestedAppointment', ... points: 40, ... key: 'providedPhone', ... points: 30,»; `src/modules/chatbot/server/tools/captureLead.ts:358` — «const { score, classification, signals: scoreSignals, dqReason } = calculateLeadScore( { signals: signalValues, category: input.category, phone },»; `src/modules/chatbot/server/tools/captureLead.ts:455` — «void notifyTelegramOptional(telegramMsg).catch((err: unknown) => {»; `src/modules/chatbot/server/tools/showWhatsappHandoff.ts:164` — «void notifyTelegramOptional(tgMsg).catch((err: unknown) => {»; `src/lib/rate-limit/presets.ts:65` — «leadNotifyPerOrg: { limit: 5, windowMs: 60 * 60_000 },»
- Impacto: Bloqueante para el primer cliente Pro/Business. Con el pack base (default de todo bot nuevo) 'quiero una reunion, mi cel 11 5555 1234' ya suma 70 = caliente (base.ts:60). Un anonimo que abre conversaciones nuevas (Origin y sessionId rotables, SEC-057) produce un mail individual 'Lead caliente' por conversacion hasta agotar el cupo del mes (cientos), sin digest ni el tope de 5 por hora que el diseno promete para no despertar al dueno con basura. En paralelo, cada lead y cada derivacion a WhatsApp sin lead previo (que ni siquiera exige datos de contacto) manda un mensaje al Telegram del equipo de develOP, de todos los clientes, sin ningun tope. Consume el plan de Brevo compartido con magic links y resets (que el plan tenga limite diario es HIPOTESIS).
- Propuesta: Mantener la prioridad del caliente pero con su propio tope por org (p. ej. N por hora y despues digest); no clasificar caliente solo con flags que declara el LLM (exigir canal verificado y una senal comprobable en el texto del visitante); aplicar checkRateLimit por org a notifyTelegramOptional y agrupar.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-099], [SEC-057]
- Nodo(s): h3.vis-api-chatbot, h3.cli-chatbot, lib.chatbot.tools, lib.client-notifications, int.brevo, int.telegram, modelo.ChatbotLead
- REQUIERE-VERIFICACIÓN-HUMANA: VH-106

### [SEC-076] Texto de terceros entra sin delimitar a los prompts de lib/ai: quien deja una resena en Google puede dictar el borrador de respuesta que el dueno publica, y rutas de GA4 y consultas de Search Console llegan crudas a los insights de Resultados
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/ai/review-reply-draft.ts:28` — «Comentario: ${params.reviewComment ?? '(sin texto, solo rating)'}»; `src/lib/ai/review-reply-draft.ts:26` — «Resena de: ${params.reviewerName}»; `src/app/(protected)/dashboard/modules/motor-resenas/_components/ReviewItem.tsx:53` — «reviewComment: review.comment,»; `src/app/(protected)/dashboard/modules/motor-resenas/_components/ReviewItem.tsx:68` — «const result = await replyAction({ organizationId, reviewName: review.reviewName,»; `src/lib/ai/results-insights.ts:82` — «${input.topPages.slice(0, 5).map((p) => '- ${p.path}: ${p.visits} visitas»; `src/lib/ai/results-insights.ts:133` — «'- "${q.query}": ${q.impressions} imp, ${q.clicks} clicks»; `src/modules/chatbot/server/chat/handleChatRequest.ts:884` — «const wrapUntrusted = (text: string): string => { (control: el chat si delimita)»
- Impacto: Para el primer cliente con Motor de resenas: cualquier persona con cuenta de Google puede escribir en su resena instrucciones para el redactor (p. ej. 'ofrece reintegro del 100% escribiendo a una casilla ajena') y el borrador que el panel sugiere las sigue; si el dueno lo publica sin leer con atencion, queda en Google bajo el nombre del negocio (promesa falsa o contacto de un estafador visible para otros clientes). En Resultados, las rutas visitadas (pagePath, que un tercero fabrica visitando URLs inventadas si el tag dispara en 404) y las consultas de busqueda entran como datos sin delimitar y pueden convertir un insight en un mensaje dirigido al dueno. Es el patron que D2-c2 dejo para cruzar en D5; SEC-056 cubre solo los insights del chatbot y SEC-051 la falta de Zod.
- Propuesta: Helper compartido de spotlighting para lib/ai (envolver el texto de terceros con nonce y regla 'contenido no confiable' en el system, como sections.ts:151); en el borrador, marcar en la UI cualquier URL, email o telefono que no figure en los datos del negocio antes de publicar; acotar largo del texto de terceros.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [SEC-056], [SEC-051]
- Nodo(s): h2.cli-resenas, h2.cli-resultados, lib.ai, int.anthropic, int.google-business-profile, int.ga4
- REQUIERE-VERIFICACIÓN-HUMANA: VH-108

### [SEC-078] El widget renderiza la respuesta del modelo como markdown con imagenes remotas y links sin restriccion: una ruta armada en develop.com.ar puede sacar lo que escribe el visitante
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/chat/ChatWindow.tsx:22` — «const MARKDOWN_COMPONENTS: Components = { (solo p, code y strong: sin a, sin img, sin urlTransform)»; `src/modules/chatbot/components/chat/StreamingMarkdown.tsx:171` — «<ReactMarkdown components={components}>{body}</ReactMarkdown>»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:358` — «<ReactMarkdown components={{ p: ..., code: ..., strong: ... }}>{m.content}»; librería react-markdown@10.1.0, lib/index.js línea 124 — «const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i»; `src/modules/chatbot/components/LogicCompanion.tsx:53` — «const chatbot = useChatbot({ slug, currentPath: pathname, attribution })»; `src/components/layout/useChromeRevealed.ts:41` — «return true (cualquier ruta que no sea home ni marketing, incluida una inexistente, monta el widget al instante)»; `src/modules/chatbot/server/prompts/sections.ts:200` — «- Ruta del usuario: ${context.currentPath ?? 'no determinada'}»; `next.config.ts:77` — «"img-src 'self' data: blob: https:", (y la CSP es Report-Only, :72)»; `public/widget.js:123` — «'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'»
- Impacto: El texto del asistente pasa por react-markdown con los renderers por defecto de a e img, cuya urlTransform deja pasar https. Cualquier ![](https://host/?d=...) que emita el modelo se descarga sola en el navegador del visitante, sin clic. Cualquier [texto](https://...) queda como link activo sin target ni rel: en develop.com.ar navega la pestana entera fuera del sitio, y en el embed navega el iframe dentro del sitio del cliente (la charla desaparece). Sumado a SEC-058 (currentPath crudo en el system prompt): un tercero le manda a alguien un link a develop.com.ar/<instrucciones>; cualquier ruta inexistente monta el widget al instante con usePathname como currentPath. Si el modelo obedece, cada respuesta lleva una imagen que manda a un servidor ajeno el nombre, telefono o email que el visitante escriba despues, o un link de phishing que firma el asistente oficial. SEC-058 registro el dano como 'queda en la conversacion del atacante'; este es el canal de salida que alcanza a una victima ajena, y es otra causa: el delimitado de la entrada no garantiza nada sobre la salida. En los bots de clientes (embed, currentPath fijo '/') queda la variante legitima: un link de la KB abre dentro del iframe de 380 px y se pierde la conversacion. Hoy esta latente por la credencial de Vertex vencida; es bloqueante para el primer cliente real si se mantiene.
- Propuesta: En los tres renderers (ChatWindow, StreamingMarkdown y ChatbotEmbed) no cargar imagenes que vengan del modelo: disallowedElements ['img'] o un renderer de img que muestre solo el alt. Agregar un renderer de a con target _blank y rel 'noopener noreferrer nofollow', con allowlist de hosts (dominio del cliente, wa.me, develop.com.ar); lo que quede fuera se muestra como texto. Unificar un unico mapa de componentes compartido (ver DEU-042). Complementa el arreglo de SEC-058, no lo reemplaza. A mediano plazo pasar la CSP a enforcement con img-src acotado.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-058]
- Nodo(s): h3.vis-widget-develop, h3.vis-widget-cliente, lib.chatbot.components, int.vertex
- REQUIERE-VERIFICACIÓN-HUMANA: VH-109

### [SEC-084] agency-actions: server actions sin Zod, sin auditoría y con organizationId por parámetro sin verificar en la bóveda
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/actions/agency-actions.ts:17` — «data: { title: string; description: string; dueDate?: Date }»; `src/actions/agency-actions.ts:96` — «data: { name: string; url: string; type: AssetType; description?: string }»; `src/actions/agency-actions.ts:21` — «throw new Error('Unauthorized')»; `src/components/admin/managers/VaultManager.tsx:31` — «console.error(error)»
- Impacto: Viola la regla de Zod en cada Server Action: title/description/url sin tope terminan en notificaciones y emails al cliente; la url del activo se publica como href en la bóveda del cliente (boveda/page.tsx:212) sin exigir http(s); el activo se crea en una org que puede no existir o estar archivada (error de FK crudo). Ni la tarea ni el activo quedan en AdminAuditLog (git grep vacío; control archiveClient.ts:6 sí audita). Si algo falla el admin no ve nada: el caller solo hace console.error. El organizationId por parámetro es inherente a una acción admin cross-tenant y en la tarea está mitigado por assertProjectBelongsToOrg (:29), no en el activo.
- Propuesta: Schemas Zod (title/description con .max, url con protocolo http/https, type como nativeEnum, organizationId existente y no archivada), devolver ActionResult en vez de throw, logAdminAction en ambas, y que VaultManager/ProjectManager muestren el error.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [DEU-066]
- Nodo(s): h4.adm-clientes, h4.adm-clientes.boveda-alta-activo, h4.adm-clientes.tarea-para-aprobacion, lib.actions, modelo.ClientAsset, modelo.Task, modelo.AdminAuditLog

### [SEC-086] Cambios sensibles del admin sin registro de auditoría: webhook de alertas, token de Telegram, precios, referidos y acciones masivas, y en Proyectos borrar, cambiar de estado y marcar pagos
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/settings/_actions/settings.actions.ts:148` — «await prisma.agencySettings.update({»; `src/app/(protected)/admin/referrals/_actions/referrals.admin.actions.ts:41` — «const result = await prisma.referral.updateMany({ where: { id, status: 'CONVERTED' }, data: { status: 'REWARDED', rewardedAt: new Date() },»; `src/lib/bulk-actions.ts:50` — «const leads = await prisma.chatbotLead.findMany({»; `src/app/api/admin/users/[userId]/resend-credentials/route.ts:93` — «await logAdminAction({»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:806` — «await tx.osTimeEntry.deleteMany({ where: { projectId } }) await tx.osPaymentMilestone.deleteMany({ where: { projectId } })»; `src/lib/actions/projects.ts:114` — «await prisma.project.delete({ where: { id: projectId } })»; `src/app/(protected)/admin/projects/_actions/milestone.actions.ts:26` — «const milestone = await prisma.osPaymentMilestone.update({»
- Impacto: Una cuenta SUPER_ADMIN mal usada o comprometida puede redirigir el webhook de alertas (lleva nombres de clientes y detalle de tickets) a un servidor propio, cambiar el token de Telegram, bajar precios, marcar referidos como bonificados o exportar todos los leads de todos los clientes sin rastro en /admin/audit-log (git grep de logAdminAction en settings, referrals y team: 0 resultados). Bloqueante para el primer cliente en trazabilidad de sus datos personales.
- Propuesta: Llamar a logAdminAction (con computeDiff, sin valores de secretos) en updateSettings, updateModulePricing, markReferral*Action y bulkExportLeads (cantidad de filas y orgs), con actionType dedicados si hace falta migración.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [DEU-012]
- Nodo(s): h4.adm-config, h4.adm-referidos.gestion-estados, h4.adm-clientes.acciones-masivas, h4.adm-audit, lib.audit-log, modelo.AdminAuditLog, modelo.AgencySettings, h4.adm-proyectos.borrado, h4.adm-proyectos.pagos-hitos

### [SEC-087] Reenviar credenciales resetea la contraseña de cualquier usuario, incluidos SUPER_ADMIN y SETTER, y si Brevo falla devuelve la temporal en la respuesta
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/api/admin/users/[userId]/resend-credentials/route.ts:46` — «const user = await prisma.user.findUnique({ where: { id: userId },»; `src/app/api/admin/users/[userId]/resend-credentials/route.ts:64` — «await prisma.user.update({ where: { id: userId }, data: {»; `src/app/api/admin/users/[userId]/resend-credentials/route.ts:112` — «tempPassword: emailResult.ok ? null : tempPassword,»; `src/app/api/admin/users/[userId]/resend-credentials/route.ts:49` — «orgMemberships: { include: { organization: { select: { companyName: true } } }, take: 1,»
- Impacto: Un SUPER_ADMIN (o su sesión robada, SEC-023) puede tomar la cuenta de otro admin o del setter de Franco pidiendo el reset por userId: si el envío falla recibe la temporal. El email es la bienvenida de cliente aunque el destino no lo sea, y para usuarios con varias orgs nombra una arbitraria (take: 1 sin orderBy, patrón D1).
- Propuesta: Limitar el endpoint a usuarios CLIENT/ORG_MEMBER (o confirmación reforzada para SUPER_ADMIN/SETTER), plantilla según rol, orderBy determinista y aviso a la cuenta afectada.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-019], [SEC-023], [BUG-118]
- Nodo(s): h4.adm-clientes.reenviar-credenciales, h1.auth-cambio, int.brevo, modelo.User
- REQUIERE-VERIFICACIÓN-HUMANA: VH-128

### [SEC-090] El formulario público de contacto acepta texto sin tope en todos sus campos y lo replica a la DB, la alerta de agencia y n8n
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/schemas.ts:57` — «name: z.string().trim().min(2, 'Nombre inválido.'), email: z.string().trim().email('El email no es válido.'),»; `src/lib/actions/schemas.ts:62` — «message: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres.'),»; `src/lib/actions/contact.ts:75` — «detail: 'Nuevo lead desde formulario. Contacto: ${payload.email}. Servicio: ${payload.service || 'General'}.',»; `src/lib/actions/schemas.ts:46` — «featureKey: z.string().trim().min(1, 'Feature inválida.'), featureName: z.string().trim().min(1, 'Nombre de feature inválido.'),»
- Impacto: Un anónimo puede mandar campos de hasta el límite por defecto del body de server actions (~1 MB; next.config sin bodySizeLimit). Eso se guarda en ContactSubmission (message es @db.Text), entra a la alerta de agencia y al webhook de n8n, y se interpola en texto de alerta (company/name/email/service). El rate limit es de 5 por IP cada 15 min, pero la IP sale del primer X-Forwarded-For (patrón D1-c1) y cada IP falsificada crea una fila nueva en rate_limit (patrón D1-c3). Riesgo para el primer cliente: spam y crecimiento de almacenamiento en Neon, más ruido en las alertas. UpsellRequestSchema (portal autenticado) tiene el mismo defecto en featureKey/featureName.
- Propuesta: Agregar .max() razonables (name 120, email 254, phone 40, company 120, service 60 o enum, message 5000, featureName 120). Opcional: bodySizeLimit explícito para server actions. Escapar los campos del visitante en sendAgencyAlert.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-054], [SEC-055]
- Nodo(s): h6.vis-contacto.enviar-formulario, modelo.ContactSubmission, lib.actions, int.n8n, h2.cli-servicios

### [SEC-001] Clave de Google AI con el valor completo en dos documentos y en el historial
- Dominio: D7  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `docs/audits/2026-05-bfg-leak-cleanup.md:94` y `docs/bitacora-roadmap.md:36` — valor completo de una `GOOGLE_GENERATIVE_AI_API_KEY` (omitido); historial: `logic-core-v3/enviroment.env` agregado en `3953558312` (2026-02-12) y alcanzable desde 116 refs (`_crudo/secrets-historial.json`); `docs/audits/2026-05-bfg-leak-cleanup.md:193-197` — «### 8.2 Lo que NO se hizo … ❌ `git push --force` al remote»; `:204` — «La key `…` sigue deshabilitada en Google Cloud (Franco ya rotó — confirmado)».
- Impacto: bloqueante para el primer cliente real solo si la clave siguiera viva: cualquiera con un clon (el repo sigue público: `gh repo view frc11/PorfolioDevelOP --json visibility` devolvió `PUBLIC` el 2026-10-13 y el 2026-10-14, y ya lo era según `docs/baselines/2026-07-auditoria-seguridad.md:3360`) podría consumir la cuota de Google AI a nombre de develOP. Valentino confirma que las credenciales del repo son de prueba (ENMIENDA-01 P1).
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
- Evidencia: `src/auth.ts:227` — «token.orgRole = accessState.orgRole»; `src/lib/actions/profile.ts:29` — «const organizationId = session?.user?.organizationId»; `prisma/schema.prisma:523` — «role OrgRole @default(ADMIN)»; `prisma/schema.prisma:19` — «enum OrgRole { ADMIN MEMBER VIEWER»; `src/auth.ts:251` — «session.user.orgRole = token.orgRole as OrgRole | undefined»; `src/lib/actions/upsell.ts:14` — «const session = await auth() const userId = session?.user?.id const organizationId = session?.user?.organizationId»; `src/components/dashboard/modules/motor-resenas/_actions.ts:55` — «const organizationId = resolveScopedOrgId(await resolveOrgId(), params.organizationId)»; `src/modules/chatbot/server/dashboard/updateBotAppearance.ts:61` — «const orgId = await resolveOrgId()»; `src/auth.config.ts:5` — «type OrgRole = 'ADMIN' | 'MEMBER' | 'VIEWER'»
- Impacto: Latente: hoy todas las membresias se crean ADMIN; el dia que se invite a un VIEWER podra cambiar nombre de empresa, contacto, preferencias de toda la org y pedir la baja de la cuenta (profile.ts solo exige organizationId).
- Propuesta: Definir el modelo de permisos por OrgRole antes de habilitar miembros no-ADMIN; helper requireOrgRole en las actions de cuenta.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.auth, h2.cli-cuenta, modelo.OrgMember, h2.cli-shell, h2.cli-resenas, h2.cli-email-mkt, lib.preview, h3.cli-chatbot

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
- Evidencia: `src/lib/ai/executive-brief.ts:157` — «if (currentRegenerations >= REGENERATION_LIMIT) {»; `src/lib/ai/executive-brief.ts:185` — «const generation = await generateBriefText(organizationId, org.companyName, now)»; `src/lib/ai/executive-brief.ts:201` — «executiveBriefRegenerations: nextRegenerations,»; `src/app/(protected)/dashboard/_actions/regenerate-brief.ts:19` — «const result = await regenerateExecutiveBrief(orgId.data)»; `src/lib/ai/executive-brief.ts:195` — «await prisma.organization.update({ where: { id: organizationId }, data: { cachedExecutiveBrief: generation.text, ...»
- Impacto: Hoy sin efecto (credencial de Vertex vencida). Con Vertex activo, un usuario de cualquier cliente que dispare N llamadas simultáneas a regenerateBriefAction obtiene N generaciones pagadas por develOP y el contador queda en 1; puede repetirlo cada 4 horas hasta tres veces por semana.
- Propuesta: Reservar el cupo antes de llamar al LLM con un update condicional (where executiveBriefRegenerations < 3 y última regeneración vieja, con increment) y seguir solo si afectó una fila, o sumar checkRateLimit por org.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio, int.vertex, modelo.Organization, h2.cli-inicio.resumen-ejecutivo-ia, lib.rate-limit
- REQUIERE-VERIFICACIÓN-HUMANA: VH-042

### [SEC-046] Errores crudos de Brevo, Google y Anthropic se devuelven y se muestran al cliente
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/integrations/brevo.ts:82` — «return { ok: false, error: 'Brevo error: ${res.status} ${await res.text()}' }»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:202` — «return { error: brevoResult.error } // se renderiza en send/page.tsx:55»; `src/lib/integrations/google-business-profile.ts:298` — «return { ok: false, error: 'Google API: ${res.status} ${text}' }»; `src/components/dashboard/modules/motor-resenas/_actions.ts:43` — «error: err instanceof Error ? err.message : 'Error generando draft',»
- Impacto: El cliente ve cuerpos de error de proveedores (codigos, mensajes de la API, datos de la cuenta de develOP) en vez de un mensaje util; viola la regla de CLAUDE.md de no exponer errores internos.
- Propuesta: Mapear a mensajes de producto, registrar el detalle en Sentry y no devolverlo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-016]
- Nodo(s): h2.cli-email-mkt, h2.cli-resenas, int.brevo, int.gbp, int.anthropic

### [SEC-049] El avatar de la empresa acepta cualquier URL http(s) que el admin carga con <img>; el base64 (hasta 600 KB) sigue en la DB
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/avatarImageUrlSchema.ts:16` — «/^https?:\/\//i.test(value) ||»; `src/modules/chatbot/server/admin/avatarImageUrlSchema.ts:10` — «const MAX_AVATAR_URL_LENGTH = 600_000 // ~450KB binario; una webp 200x200 entra holgada»; `src/modules/chatbot/components/admin/client-avatar/ClientAvatar.tsx:30` — «<img src={avatarImageUrl}»; `src/app/(protected)/admin/clients/page.tsx:51` — «avatarImageUrl: client.avatarImageUrl,»; `src/app/(protected)/admin/clients/page.tsx:72` — «clients={clients.map(toListItem)} archivedClients={archivedClients.map(toListItem)}»
- Impacto: Salteando la UI (que sube data URLs), un cliente puede setear un avatar http(s) propio; cada vez que develOP abre /admin/clients el navegador del SUPER_ADMIN pide esa URL (IP, user-agent, horario). La lista de clientes ademas trae hasta 600 KB de base64 por org en el payload.
- Propuesta: Desde el portal aceptar solo data URLs (o un dominio de storage propio) y re-encodear server-side; a futuro mover a storage externo y guardar la URL.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-cuenta.perfil-empresa, h4.adm-clientes, modelo.Organization, h4.adm-clientes.listado

### [SEC-050] Solicitud de eliminacion de cuenta sin control de OrgRole ni alerta a develOP, detectada en el admin por un titulo que cualquier ticket puede copiar
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/profile.ts:152` — «const organizationId = session?.user?.organizationId»; `src/app/(protected)/admin/tickets/_components/ticket-chat.tsx:119` — «const isDeletionRequest = ticket.title === 'Solicitud de eliminación de cuenta'»; `src/components/dashboard/ProfileForms.tsx:765` — «Esta acción creará un ticket de soporte de alta prioridad. Tu cuenta y todos los datos»
- Impacto: Latente: hoy todos los miembros se crean con OrgRole ADMIN (createClientOnly.ts:105, createClientWithBot.ts:155, onboarding/core.ts:101-105) y orgRole no se chequea en ningun lado; cuando existan MEMBER/VIEWER cualquiera podra pedir el borrado de toda la org. Un ticket normal con ese titulo exacto (tickets/schemas.ts:5 lo permite) dispara en el admin el banner '¿Aprobar solicitud de eliminacion?' con 'Ir a borrar'. La solicitud real no genera alerta (createTicketAction si alerta HIGH) y puede repetirse sin dedup.
- Propuesta: Marcar la solicitud con un campo o categoria propios (no el titulo), exigir OrgRole ADMIN, disparar sendAgencyAlert, dedupear por org y registrar quien la pidio.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-018]
- Nodo(s): h2.cli-cuenta.eliminar-cuenta, h4.adm-tickets, lib.auth

### [SEC-052] Atribución de referidos: guardas anti-abuso con huecos y el email del referido expuesto al referente
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/lib/referrals/referrals.service.ts:115` — «prisma.user.findFirst({ where: { email: referredEmail }, select: { id: true } }),»; `src/lib/actions/contact.ts:68` — «if (referralCode) { await attributeReferralFromContact({ code: referralCode, referredEmail: payload.email })»; `src/lib/referrals/referrals.service.ts:151` — «const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' },»; `src/app/(protected)/dashboard/referidos/page.tsx:73` — «{referral.referredEmail ?? 'Contacto referido'}»
- Impacto: Un cliente existente cuyo User.email tenga mayúsculas (las altas no normalizan) pasa como 'negocio nuevo' y puede terminar en un mes bonificado; cualquiera con un código público puede inflar referidos PENDING con emails inventados (rate limit por IP falsificable, contact.ts:23-27); el email de quien escribió a develOP queda visible para el cliente referente sin consentimiento; solo se notifica a un SUPER_ADMIN cualquiera y los fallos van a console.error. Mitigado porque la conversión la confirma develOP a mano.
- Propuesta: Comparar emails sin distinguir mayúsculas (o normalizar en las altas); mostrar el email enmascarado; notificar a todos los SUPER_ADMIN; Sentry en el catch.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-referidos, h6.vis-contacto, h6.vis-contacto.atribucion-de-referido, modelo.Referral, lib.referrals

### [SEC-055] La deduplicacion del pedido de upsell consulta ContactSubmission, que tambien escribe el formulario publico anonimo: un visitante puede silenciar 24 h el aviso del pedido de un cliente
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/actions/upsell.ts:82` — «where: { email: user.email, service: parsed.data.featureKey },»; `src/lib/actions/upsell.ts:79` — «// así que la consulta queda auto-scopeada al propio cliente (no puede leer submissions»; `src/lib/actions/upsell.ts:87` — «if (shouldCreateUpsellSubmission(lastSubmission?.createdAt ?? null, new Date())) {»; `src/lib/actions/contact.ts:62` — «await prisma.contactSubmission.create({ // formulario publico, email y service libres»; `src/lib/actions/schemas.ts:61` — «service: z.string().trim().optional().nullable(),»
- Impacto: Quien conozca el email de acceso de un cliente puede mandar el formulario publico con ese email y service igual al slug del modulo (por ejemplo 'motor-resenas'); durante 24 h los pedidos de ese cliente no crean el lead en /admin/leads, ni la alerta, ni las notificaciones (solo sube el contador de OrganizationModule). Impacto acotado, pero el comentario afirma un aislamiento que una tabla global escrita por anonimos no da.
- Propuesta: Deduplicar contra la propia fila OrganizationModule (leer upsellLastRequestedAt antes del upsert) o marcar los ContactSubmission de upsell con un discriminador que solo escriba esta action (servicio con prefijo y organizacion), nunca por email libre.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-048], [SEC-047]
- Nodo(s): h2.cli-servicios.solicitar-modulo, h6.vis-contacto, modelo.ContactSubmission, modelo.OrganizationModule, lib.actions

### [SEC-062] Las acciones del admin devuelven el mensaje crudo del error (Prisma/SDK) a la UI y no lo reportan a Sentry: chatbots, planes, mensajes y proyectos
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/chatbots/[botId]/actions.ts:96` — «error: error instanceof Error ? error.message : 'unknown',»; `src/app/(protected)/admin/chatbots/[botId]/transcript-action.ts:61` — «error: error instanceof Error ? error.message : 'No se pudo cargar el transcript.',»; `src/app/(protected)/admin/chatbots/bulk-actions.ts:55` — «error: error instanceof Error ? error.message : 'unknown',»; `src/app/(protected)/admin/chatbots/[botId]/BotDetailClient.tsx:144` — «toast.error('No se pudieron correr los checks: ${String(error)}')»; `src/app/(protected)/admin/chatbots/new/actions.ts:91` — «error: error instanceof Error ? error.message : 'Error desconocido',»; `src/app/(protected)/admin/clients/_actions/plan.actions.ts:239` — «console.error('assignPlanToOrg error:', error) return fail(error instanceof Error ? error.message : 'Error desconocido.')»; `src/app/(protected)/admin/clients/_actions/plan.actions.ts:187` — «await prisma.subscription.create({ data: { organizationId,»; `src/app/(protected)/admin/messages/_actions/message.actions.ts:122` — «return fail(error instanceof Error ? error.message : 'Failed to list conversations')»; `src/app/(protected)/admin/messages/_actions/message.actions.ts:202` — «return fail(error instanceof Error ? error.message : 'Failed to send message')»; `src/app/(protected)/admin/messages/_components/conversation-list-loader.tsx:15` — «{conversationsResult.error}»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:639` — «return fail(error instanceof Error ? error.message : 'Failed to create project')»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:829` — «return fail(error instanceof Error ? error.message : 'Failed to delete project')»; `src/app/(protected)/admin/projects/_actions/maintenance.actions.ts:86` — «return fail(error instanceof Error ? error.message : 'Failed to mark payment as paid')»; `src/lib/action-utils.ts:20` — «// Convierte cualquier error en un mensaje limpio para el cliente, sin filtrar // el array crudo de un ZodError ni un stack trace.»
- Impacto: Solo lo ve un SUPER_ADMIN, pero expone nombres de tablas, constraints y mensajes del SDK en toasts; contradice 'Never expose internal error messages'.
- Propuesta: Mapear errores conocidos a mensajes y loguear el resto con captureException.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots, h4.adm-clientes.plan, h4.adm-clientes.billing-override, int.sentry, lib.actions, h4.adm-mensajes, h4.adm-proyectos

### [SEC-063] Las páginas de Inteligencia del chatbot (actividad y health) no tienen guard propio
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/chatbot/activity/page.tsx:9` — «export default async function ActivityPage() { const [bot, chartData] = await Promise.all([»; `src/app/(protected)/admin/chatbot/health/page.tsx:10` — «export default async function HealthPage() { const [health, latencyHistory] = await Promise.all([»
- Impacto: Dependen del guard de admin/layout.tsx y del proxy; si el layout no se re-ejecuta en un render parcial y el JWT tiene claims viejos, leen eventos del bot de develOP y el mapa de variables de entorno.
- Propuesta: auth() + rol SUPER_ADMIN al inicio de cada página (mismo patrón que chatbots/page.tsx:14-17).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-actividad, h3.adm-health

### [SEC-064] Si el JSON de la credencial de Vertex está mal formado, el parseo se reintenta en cada pedido y su mensaje de error se guarda en la base y va a Sentry
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: HIPÓTESIS
- Evidencia: `src/modules/chatbot/server/llm/providers/google.ts:72` — «if (!this.client) {»; `src/modules/chatbot/server/llm/providers/google.ts:82` — «credentials: JSON.parse(credJson),»; `src/modules/chatbot/server/chat/handleChatRequest.ts:1383` — «message: unhandledError instanceof Error ? unhandledError.message : 'unknown',»
- Impacto: El SyntaxError de V8 puede citar un fragmento del texto alrededor del error; si cae dentro de private_key, ese fragmento queda en ChatbotEvent (visible en el log de actividad del admin), en stderr y en Sentry, una vez por pedido. No hay ninguna credencial versionada en origin/main (ver ausencias). La rotación de la key que la bitácora da por expuesta no es verificable desde el repo; hoy la credencial está vencida.
- Propuesta: Parsear la credencial una vez, dentro de try/catch, con un mensaje genérico ('credencial de Vertex inválida') sin el texto del error; confirmar la rotación de la key reportada como expuesta.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): int.vertex, lib.chatbot.llm, modelo.ChatbotEvent, int.sentry
- REQUIERE-VERIFICACIÓN-HUMANA: VH-070

### [SEC-066] Validación del alta y del sandbox inconsistente con el resto de las acciones
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/admin/createClientWithBot.ts:34` — «userEmail: z.string().email(),»; `src/modules/chatbot/server/admin/createClientWithBot.ts:44` — «businessInfo: z.string().min(20),»; `src/modules/chatbot/server/admin/createClientWithBot.ts:57` — «avatarImageUrl: z.string().nullable(),»; `src/modules/chatbot/server/admin/createClientWithBot.ts:28` — «clientAvatarImageUrl: avatarImageUrlSchema,»; `src/app/api/admin/chatbot/test-prompt/route.ts:21` — «kbDraft: z.record(z.string(), z.string()),»; `src/modules/chatbot/server/admin/saveKnowledgeBase.ts:12` — «businessInfo: z.string().max(50_000),»; `src/modules/chatbot/server/admin/createClientWithBot.ts:70` — «function slugify(s: string): string {»
- Impacto: El email no se normaliza (el login sí); el teléfono y las 7 secciones de KB no tienen máximo (saveKnowledgeBase sí: 10.000–50.000); el avatar del bot acepta cualquier string sin el schema de URL/data-URL ni el tope de 600 KB que la misma acción aplica al avatar del cliente; el teléfono vacío se guarda como '' y el paso 2 muestra '/500' sin limitar el textarea. Es entrada de SUPER_ADMIN, por eso BAJA.
- Propuesta: Reusar avatarImageUrlSchema, los máximos de saveKnowledgeBase y la normalización de email del login en createClientWithBot/createClientOnly y en el sandbox.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.alta-cliente-con-bot, h3.adm-chatbots.probar-prompt, lib.chatbot.admin, h3.adm-chatbots.alta-cliente-con-bot

### [SEC-067] El borrador del alta de cliente guarda PII del contacto y la KB en localStorage 7 dias bajo una clave global, aunque no se edite nada, y falla en silencio
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/components/admin/onboarding/useOnboardingDraft.ts:6` — «const DRAFT_KEY = 'develop:onboarding:draft'»; `src/modules/chatbot/components/admin/onboarding/useOnboardingDraft.ts:70` — «localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))»; `src/modules/chatbot/components/admin/onboarding/types.ts:50` — «userEmail: string userName: string userPhone: string»
- Impacto: Email, telefono y WhatsApp del cliente, mas avatares en data-URI y la KB, quedan en el navegador del SUPER_ADMIN sin borrarse al hacer logout; la clave no se separa por usuario. Con data-URIs grandes, setItem puede exceder la cuota y el borrador se pierde sin aviso (catch vacio :72-74). Se graba el estado inicial al abrir la pagina, asi que la proxima visita muestra 'borrador' aunque no se haya escrito nada. Errores de eslint en :49 (set-state-in-effect) y :56 (exhaustive-deps).
- Propuesta: Excluir de la persistencia los campos de contacto y los data-URI (o usar sessionStorage), namespacing por usuario, limpiar al logout, guardar solo despues del primer cambio y avisar si falla.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes

### [SEC-069] Conversaciones del cliente: todas las columnas de Conversation (ipHash, userAgent) viajan al navegador y la tabla muestra tokens y costo de develOP
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/multiTenantQueries.ts:180` — «scope.conversation.findMany({ where: { botConfigId: botInfo.bot.id }, ... include: { lead: {...}, _count: {...} } })»; `prisma/schema.prisma:1376` — «ipHash String? userAgent String? @db.Text»; `src/app/(protected)/dashboard/chatbot/conversations/page.tsx:17` — «<ConversationsTable conversations={items}»; `src/modules/chatbot/components/dashboards/ConversationsTable.tsx:102` — «<th ...>Tokens (in / out)</th> <th ...>Costo</th>»
- Impacto: El payload RSC de la pagina lleva ipHash (salado), userAgent, sessionId y referrer de cada visitante al navegador del dueno; ademas le mostramos tokens y costo en USD por conversacion, jerga tecnica y base de costos de develOP.
- Propuesta: select explicito con solo lo que la tabla usa; decision para Valentino: ocultar tokens y costo en la vista del cliente.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot.conversaciones, modelo.Conversation
- REQUIERE-VERIFICACIÓN-HUMANA: VH-089

### [SEC-070] Handshake del embed sin validar la ventana emisora; antes del handshake los eventos salen a '*'
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:29` — «const parentOriginRef = useRef<string>('*')»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:67` — «if (event.data?.type === 'develop:init') { parentOriginRef.current = event.origin»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:103` — «notifyParent('lead-captured', tc.input)»; `public/widget.js:165` — «if (event.origin !== BASE_URL) return (control: el host si valida)»
- Impacto: Cualquier otro frame del sitio del cliente con referencia al iframe puede fijar la atribucion UTM del visitante y cortar los eventos al host; con un widget.js viejo sin handshake, el lead capturado (nombre, telefono, email) se postea a '*'. Riesgo bajo: el destinatario sigue siendo el padre.
- Propuesta: Aceptar develop:init solo si event.source === window.parent y el origen esta en allowedDomains; no postear PII hasta tener origen confirmado.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente.chat-embebido, lib.security

### [SEC-071] Script que imprime la credencial completa de Vertex por stdout
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `scripts/encode-vertex-creds.js:8` — «console.log('--- Pegar este VALOR en Netlify como GOOGLE_VERTEX_CREDENTIALS_JSON ---')»; `scripts/encode-vertex-creds.js:10` — «console.log(JSON.stringify(parsed))»
- Impacto: El helper lee vertex-credentials.json y vuelca la cuenta de servicio entera (incluida la clave privada) a la terminal. Corrido dentro de una sesion de agente o de CI, la credencial queda en transcripts o logs: es un vector plausible de la 'key expuesta en logs' de la bitacora. El archivo nunca fue commiteado (.gitignore:55). No se copio ningun valor.
- Propuesta: Escribir el resultado a un archivo local ignorado o al portapapeles, nunca a stdout; al rotar la credencial vencida, no reutilizar este flujo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): int.vertex, lib.chatbot.llm

### [SEC-077] El scoring de leads que el plan Starter no incluye viaja igual al navegador: las paginas de contactos pasan la fila completa de ChatbotLead (score, scoreSignals, internalNotes, notificationSent) a componentes cliente
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/chatbot/leads/page.tsx:61` — «// P0.3 — Gate de PRESENTACION de la priorizacion caliente/tibio/frio. El // scoring se computa igual abajo»; `src/app/(protected)/dashboard/chatbot/leads/page.tsx:95` — «...lead, effectiveScore: effective.effectiveScore,»; `src/app/(protected)/dashboard/chatbot/leads/page.tsx:116` — «<ClientLeadsTable leads={leads}»; `src/modules/chatbot/components/dashboard/ClientLeadsTable.tsx:1` — «'use client'»; `src/app/api/dashboard/chatbot/leads/export/route.ts:30` — «* NO se exporta: * - score crudo, scoreSignals, internalNotes, botConfigId, notificationSent*.»; `src/app/(protected)/dashboard/chatbot/page.tsx:30` — «listLeadsByOrgSlug(orgSlug, 5),»
- Impacto: Un cliente Starter ve en el payload RSC (DevTools) la clasificacion caliente/tibio/frio, el puntaje y su desglose que se venden como mejora a Pro, y la politica que el propio CSV declara ('solo lo legible al dueno') no se cumple en pantalla: tambien viajan notificationSent*, botConfigId y convertedToOsLeadId. Sin cruce entre tenants.
- Propuesta: Proyectar a un DTO en el servidor para lista, detalle y resumen: si el plan no incluye leadScoring, no enviar score/classification/scoreSignals/effective*; nunca enviar notificationSent*, botConfigId ni convertedToOsLeadId.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, h3.cli-chatbot.contactos, h3.cli-chatbot.contacto-detalle, lib.plan, modelo.ChatbotLead

### [SEC-079] Resumen de Mi Chatbot: leads y uso cacheados con el slug de la org como clave (se reutiliza tras un borrado) y con tags que nada invalida
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/multiTenantQueries.ts:51` — «['chatbot-leads', orgSlug, String(limit)], { revalidate: 120, tags: ['chatbot-leads:${orgSlug}'] }»; `src/modules/chatbot/server/admin/multiTenantQueries.ts:255` — «['chatbot-usage', orgSlug], { revalidate: 300, tags: ['chatbot-usage:${orgSlug}'] }»; `src/app/(protected)/dashboard/chatbot/page.tsx:27` — «const orgSlug = session.organization.slug»; `src/modules/chatbot/server/admin/hardDeleteClient.ts:141` — «await tx.organization.delete({ where: { id: organizationId } })»; `src/modules/chatbot/server/admin/createClientWithBot.ts:107` — «const baseSlug = slugify(parsed.orgName) const uniqueSlug = await findUniqueSlug(baseSlug)»; `src/modules/chatbot/server/admin/updateLeadStatus.ts:78` — «revalidatePath('/dashboard/chatbot/leads') (otra ruta; ningun revalidateTag de chatbot-leads ni chatbot-usage)»
- Impacto: El resto de las caches del portal usan organizationId o botId (dashboard-hot-leads-count, chatbot-bot-config, chatbot-kb). Estas dos usan el slug, que se libera con el borrado definitivo; el alta se lo reasigna al primer cliente con el mismo nombre. Durante 2 min (leads) y 5 min (uso), el resumen del cliente nuevo puede mostrar nombre, telefono, email y mensaje de los ultimos 5 contactos del cliente borrado, ademas de su consumo. La ventana es chica y depende de una secuencia del admin, por eso BAJA. El efecto de todos los dias es otro: ningun revalidateTag invalida los tags chatbot-leads:* ni chatbot-usage:*, y captureLead y updateLeadStatus revalidan otras rutas. Un lead nuevo tarda hasta 2 min en aparecer en el resumen y el uso del mes, hasta 5 min.
- Propuesta: Usar organizationId (o botConfigId) como clave y como tag de las dos caches. Invalidarlas con revalidateTag desde captureLead, updateLeadStatus y hardDeleteClient, como ya se hace con hot-leads-count.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.server, modelo.ChatbotLead, modelo.QuotaUsage, h4.adm-clientes
- REQUIERE-VERIFICACIÓN-HUMANA: VH-110

### [SEC-080] El embed le avisa al sitio del cliente cada intento de capture_lead con los datos crudos del modelo, aunque el servidor los haya descartado o la captura haya fallado
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:99` — «tc.toolName === 'capture_lead' && !seenToolCallIds.current.has(tc.toolCallId)»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:103` — «notifyParent('lead-captured', tc.input)»; `src/modules/chatbot/hooks/useChatbot.ts:508` — «else if (part.type && part.type.startsWith('tool-')) { ... input: anyPart.input, (:518; no mira state ni output)»; `src/modules/chatbot/server/tools/captureLead.ts:260` — «const phone = phoneReason === 'ok' ? rawPhone : null const email = emailReason === 'ok' ? rawEmail : null»; `src/modules/chatbot/server/tools/captureLead.ts:283` — «if (!phone && !email) { (repregunta y no persiste)»; `public/widget.js:180` — «new CustomEvent('develop:lead', { detail: data.payload })»
- Impacto: El evento sale la primera vez que aparece la parte de la tool, sin mirar su estado ni el resultado. El sitio anfitrion recibe nombre, telefono, email y el resumen armado por el modelo tambien cuando capture_lead rechazo el canal (no aparece en lo que escribio el visitante o tiene formato invalido, SEC-LLM-03) o cuando la escritura fallo. Sale un evento por intento, incluidos los rechazados, y no uno por lead guardado. Ademas el CustomEvent se dispara en el window del anfitrion, donde cualquier script de terceros (pixeles, chats, librerias) puede escucharlo: rompe el aislamiento que el iframe le da a la PII del visitante. Para el primer cliente que conecte develop:lead a su analitica: conversiones falsas y datos de contacto que develOP decidio no guardar.
- Propuesta: Emitir lead-captured solo cuando la parte este en output-available con output.success === true. Mandar solo el leadId y un flag de conversion, sin PII, o como mucho los campos que el servidor persistio. Documentar el contrato de develop:lead para los clientes.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-070]
- Nodo(s): h3.vis-widget-cliente, lib.chatbot.components, modelo.ChatbotLead
- REQUIERE-VERIFICACIÓN-HUMANA: VH-111

### [SEC-081] La purga de evals borra por prefijo de sessionId en todas las orgs: ese prefijo lo puede elegir cualquier visitante y la purga no se acota a los bots QA
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/evals/cleanup.ts:55` — «where: { sessionId: { startsWith: SESSION_PREFIX } },»; `src/modules/chatbot/evals/cleanup.ts:95` — «sessionId: { startsWith: SESSION_PREFIX }, // doble cinturón»; `src/modules/chatbot/evals/cleanup.ts:108` — «(c) => c.quotaUsage.deleteMany({ where: { botConfigId: { in: botIds } } }), (solo la cuota se acota a los bots QA)»; `src/modules/chatbot/server/chat/requestSchema.ts:55` — «sessionId: z.string().min(1).max(200),»; `src/modules/chatbot/evals/runner.ts:352` — «const purge = await purgeEvalRows({ resetQuota: true })»; `scripts/regression/purge.ts:48` — «where: { sessionId: { startsWith: SESSION_PREFIX } },»
- Impacto: Corre solo contra la Neon dev, porque guardDevHost compara el host exacto. Pero esa base la comparte Franco y tiene bots que no son de evals (sanmiguel, develop, matsu; seed-eval-bots.ts:7). En cada corrida de npm run evals se borra, con sus leads y eventos, cualquier conversacion de cualquier bot cuyo sessionId empiece con 'evals-' (en scripts/regression/purge.ts, con 'regression-test-'). El sessionId lo manda el navegador sin formato. El escape unsafeGlobalQuery se rotula 'conversaciones de eval', pero el filtro no lo garantiza: el 'doble cinturon' repite el mismo prefijo. Hoy no tiene impacto en prod.
- Propuesta: Acotar el findMany y los deleteMany a botConfigId in evalBotIds(), ademas del prefijo, como ya hace el reset de cuota. Lo mismo en scripts/regression/purge.ts con los bots de regresion.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.chatbot.evals, modelo.Conversation, modelo.ChatbotLead, modelo.ChatbotEvent

### [SEC-082] El stream del chat le manda al visitante anónimo los argumentos y resultados de las tools: la clasificación interna del lead (spam/empleo/proveedor, señales, resumen para el equipo) y el id interno del lead
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/chat/handleChatRequest.ts:1186` — «const streamed = result.toUIMessageStreamResponse()»; librería ai@6.0.214, dist/index.js línea 8461 — «type: "tool-input-available",»; librería ai@6.0.214, dist/index.js línea 8486 — «type: "tool-output-available",»; `src/modules/chatbot/server/tools/captureLead.ts:79` — «category: z.enum(LEAD_CATEGORIES).default('sales').describe(»; `src/modules/chatbot/server/tools/captureLead.ts:76` — «'Resumen breve (1-2 oraciones) en español rioplatense de qué busca el usuario. Va a la BD para el equipo.'»; `src/modules/chatbot/server/tools/captureLead.ts:555` — «leadId: result.id,»; `src/modules/chatbot/server/tools/showWhatsappHandoff.ts:60` — «purchaseSignals: z.string().max(300).optional().describe(»
- Impacto: Cualquiera que abra las herramientas de desarrollo en el sitio de un cliente real (o un competidor que lo automatice) lee en el SSE cómo lo clasificó el bot (category 'spam', 'employment' o 'provider', las señales de scoring), el resumen que la propia descripción del schema declara 'para el equipo', las 'señales de compra' citadas del handoff y el cuid interno del lead. capture_lead no renderiza tarjeta (renderToolCall cae en default), así que el widget no necesita nada de eso. El riesgo es bajo, pero expone criterio comercial del cliente e ids internos.
- Propuesta: Que capture_lead devuelva solo {success, alreadyCaptured} (sin leadId). Filtrar en el borde (TransformStream sobre el UI stream, antes del watchdog) los chunks tool-input-* y tool-output-* de las tools sin tarjeta (capture_lead, confirm_contact_request). Antes de filtrar, verificar en renderToolCall y useChatbot que nadie los consuma.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-api-chatbot, h3.vis-widget-cliente, h3.vis-widget-develop, lib.chatbot.tools, modelo.ChatbotLead

### [SEC-083] show_whatsapp_handoff guarda y manda a Telegram el 'contacto' del visitante sin la validación de formato y pertenencia que capture_lead aplica (SEC-LLM-03)
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/tools/showWhatsappHandoff.ts:50` — «visitorContact: z.string().max(200).optional().describe(»; `src/modules/chatbot/server/tools/showWhatsappHandoff.ts:140` — «visitorContact: input.visitorContact ?? null,»; `src/modules/chatbot/server/tools/captureLead.ts:253` — «const phoneReason = classifyChannel(rawPhone, isValidArgentinePhone, (v) =>»
- Impacto: En un handoff directo, sin capture_lead previo, el modelo puede inventar o completar un teléfono o un email: justo lo que SEC-LLM-03 bloquea en capture_lead. Ese dato queda en la metadata del ChatbotEvent y llega al Telegram de develOP como 'Contacto:'. Con un cliente real, el equipo podría llamar a un tercero. El dueño no ve ese contacto (el panel solo muestra visitorName), así que nadie lo corrige.
- Propuesta: Extraer classifyChannel, phoneAppearsInVisitorText y emailAppearsInVisitorText de captureLead a un helper y aplicarlos a visitorContact (leyendo los USER persistidos de la conversación): si no pasa, guardar null. Alternativa: sacar visitorContact del schema y tomar el contacto del lead capturado.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-073]
- Nodo(s): lib.chatbot.tools, int.telegram, modelo.ChatbotEvent, h3.vis-api-chatbot

### [SEC-085] Boveda admin: las credenciales se descifran en el render y el 'revelar' no protege ni audita
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/[clientId]/_components/tabs/VaultTab.tsx:39` — «const credential = isAccess && asset.description ? resolveCredentialDisplay(asset.description)»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/VaultTab.tsx:71` — «<VaultRevealButton value={credential.value} />»; `src/components/dashboard/VaultRevealButton.tsx:1` — «'use client'»
- Impacto: Al abrir la pestana Boveda, todas las credenciales ACCESS del cliente viajan en claro en el payload RSC al navegador del admin, aunque nadie toque 'revelar'. No queda registro de que SUPER_ADMIN vio que credencial: para el primer cliente real no hay trazabilidad de acceso a sus accesos.
- Propuesta: Descifrar bajo demanda con una server action que exija SUPER_ADMIN, devuelva un solo valor y escriba audit (CREDENTIAL_REVEALED); el render solo manda metadatos.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [SEC-036]
- Nodo(s): h4.adm-clientes.tab-boveda, modelo.ClientAsset, lib.audit-log

### [SEC-088] Editar y borrar horas no valida a quién pertenecen: un SUPER_ADMIN borra horas ajenas sin rastro (updateTimeEntry además no tiene llamadores)
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/team/_actions/time-entry.actions.ts:203` — «const existingEntry = await prisma.osTimeEntry.findUnique({ where: { id: entryId },»; `src/app/(protected)/admin/team/_actions/time-entry.actions.ts:250` — «const entry = await prisma.osTimeEntry.delete({»; `src/app/(protected)/admin/team/_actions/time-entry.actions.ts:160` — «if (task.assignedToId !== null && task.assignedToId !== userId) {»
- Impacto: La regla 'nadie registra horas en nombre de otro' (PLAN-604) se cumple al crear pero no al editar ni al borrar: desde el panel de horas (time-entry-panel.tsx:189) un admin puede borrar las de un compañero y no queda audit log. Riesgo bajo entre socios, pero el reporte de horas pierde valor como registro.
- Propuesta: Exigir entry.userId === sesión en update/delete (o auditar si se permite) y podar updateTimeEntry si no se usa.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-proyectos.carga-horas, modelo.OsTimeEntry

### [SEC-089] El webhook de alertas acepta cualquier URL (http, hosts internos) y el servidor le hace POST sin restricción
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/settings/_actions/settings.schemas.ts:25` — «alertWebhookUrl: z.preprocess(emptyStringToNull, z.string().url().nullable()),»; `src/lib/alerts.ts:131` — «const response = await fetch(webhookUrl, {»
- Impacto: Con una cuenta SUPER_ADMIN (precondición fuerte) el server de develOP manda POSTs a direcciones internas o a un servidor propio con nombres de clientes y detalle de tickets, y el cambio no se audita.
- Propuesta: Exigir https y una allowlist de hosts (Slack, Discord, n8n propio) o reutilizar validateWebhookUrl del módulo CRM.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-054]
- Nodo(s): h4.adm-config.datos-y-alertas, lib.alerts

### [SEC-091] updateClient cambia el email de login del cliente sin avisar al email anterior ni invalidar la sesión
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/updateClient.ts:71` — «const nextEmail = parsed.userEmail.toLowerCase()»; `src/modules/chatbot/server/admin/updateClient.ts:108` — «const nextUser = await tx.user.update({ where: { id: adminUser.id }, data: {»
- Impacto: El SUPER_ADMIN reescribe el email con el que el cliente se loguea y recibe el magic link: no se le avisa ni al email viejo ni al nuevo, no se resetea emailVerified y no se sube sessionVersion. Un typo deja al cliente sin acceso por magic link, sin que él sepa por qué. userPhone no tiene .max() (:25).
- Propuesta: Avisar por email (viejo y nuevo) al cambiar el email de login, resetear emailVerified o pedir confirmación, subir sessionVersion y acotar userPhone.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-014]
- Nodo(s): h4.adm-clientes.editar-datos, modelo.User, h1.auth-login

### [SEC-092] toErrorMessage (action-utils, FROZEN-inferido) devuelve al cliente el message crudo de cualquier Error: la alerta D3-A4 quedó resuelta solo para ZodError (configuración, novedades, tareas, horas, tickets) y dos rutas devuelven String(error)
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/settings/_actions/settings.actions.ts:171` — «return fail(toErrorMessage(error, 'No se pudo actualizar la configuracion.'))»; `src/lib/action-utils.ts:31` — «if (error instanceof Error) { return error.message }»; `src/lib/action-utils.ts:28` — «if (error instanceof ZodError) { return error.issues[0]?.message ?? fallback»; `src/app/(protected)/admin/announcements/_actions/announcements.actions.ts:56` — «return fail(toErrorMessage(error, 'No se pudo publicar la novedad.'))»; `src/lib/action-utils.ts:32` — «return error.message»; `src/app/(protected)/admin/announcements/_components/announcement-publisher.tsx:178` — «{serverError}»; `src/app/api/admin/alerts/trigger-detector/route.ts:15` — «return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })»; `src/app/(protected)/admin/team/_actions/task.actions.ts:193` — «return fail(error instanceof Error ? error.message : 'Failed to create task')»
- Impacto: El fix 5e33733 resolvió el ZodError (action-utils.ts:28-29). Sin embargo, un error de ensureAgencySettingsRecord o de agencySettings.update (settings.actions.ts:145-166), por ejemplo un PrismaClientKnownRequestError o un fallo de conexión, devuelve su message completo a la UI: invocación de Prisma, modelo, campo y posiblemente el host. Solo lo ve un SUPER_ADMIN, pero viola 'Never expose internal error messages'. Lo mismo pasa en project.actions.ts:829.
- Propuesta: Decisión para Valentino (action-utils.ts es FROZEN-inferido): que toErrorMessage solo pase el message de una clase UserFacingError, y fallback para el resto. Mientras tanto, los callers pueden mapear errores de Prisma a fallback.
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: [SEC-062]
- Nodo(s): h4.adm-config, lib.action-utils, h4.adm-novedades.publicar, lib.actions, int.sentry, h4.adm-alertas, h4.adm-proyectos.tareas, h4.adm-tickets

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
- Evidencia: `src/lib/data/premium-modules.ts:38` — «slug: 'email-marketing-pro',»; `src/app/(protected)/dashboard/modules/email-marketing/layout.tsx:20` — «const isActive = await isModuleActive(organizationId, 'email-marketing') if (!isActive) redirect('/dashboard')»; `src/components/dashboard/SidebarNav.tsx:78` — «{ slug: 'email-marketing', item: { href: '/dashboard/modules/email-marketing', label: 'Email marketing', icon: Mail } },»; `src/app/(protected)/dashboard/layout.tsx:57` — «where: { organizationId: orgId, status: 'ACTIVE' }, select: { module: { select: { slug: true } } },»; `prisma/seeds/sync-premium-modules.ts:68` — «const obsoleteModules = existingModules.filter((moduleData) => !catalogSlugs.has(moduleData.slug))»; `prisma/backups/premium-module-pre-push.json:68` — «"slug": "email-marketing",»; `prisma/seeds/sync-premium-modules.ts:130` — «await prisma.premiumModule.create({ data: { slug: moduleData.slug, ...nextData } })»; `src/components/dashboard/PremiumModuleCard.tsx:307` — «{isOwned ? (»; `src/lib/modules/check-activation.ts:10` — «module: { slug: moduleSlug },»
- Impacto: Bloqueante para el primer cliente que contrate Email Marketing Pro: el catálogo (y por lo tanto la tabla premium_module después del sync) solo tiene 'email-marketing-pro', pero el sidebar solo muestra el ítem si el slug activo es 'email-marketing' y el layout del módulo redirige a /dashboard sin mensaje cuando isModuleActive(org, 'email-marketing') es falso. Solo funcionaría si la base conserva la fila legacy 'email-marketing' (anterior al cambio del 2026-05-04) y el admin activó esa. Como el gate vive solo en el layout, las server actions del módulo siguen invocables directamente (ver S2b-01).
- Propuesta: Unificar el slug con una sola constante derivada de PREMIUM_MODULES_CATALOG (mapa slug -> ruta) y usarla en el layout del módulo y en PREMIUM_MODULES de SidebarNav; revisar qué slugs hay hoy en premium_module y mover activaciones legacy si existen; agregar un invariante que compare los slugs usados en isModuleActive/SidebarNav contra el catálogo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt, h2.cli-email-mkt.acceso-al-modulo, h2.cli-servicios, lib.data, modelo.PremiumModule, modelo.OrganizationModule, h2.cli-shell, h2.cli-shell.navegacion-sidebar, lib.modules
- REQUIERE-VERIFICACIÓN-HUMANA: VH-027

### [BUG-021] La baja de email marketing no llega a Brevo: la campaña sale a toda la lista y quien se dio de baja sigue recibiendo (un reimport lo vuelve a sumar)
- Dominio: D2  ·  Severidad: ALTA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/api/email/optout/[contactId]/route.ts:91` — «await prisma.emailContact.updateMany({ where: { id: contactId }, data: { optedOut: true, optedOutAt: new Date() },»; `src/app/api/email/optout/[contactId]/route.ts:100` — «'Tu dirección de email fue removida de esta lista. No recibirás más correos de esta campaña.',»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:194` — «listIds: [listId],»; `src/lib/integrations/brevo.ts:77` — «recipients: { listIds: params.listIds },»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:144` — «where: { organizationId: org.id, optedOut: false },»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:104` — «if (listId) { await syncContact({»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:143` — «const activeContacts = await prisma.emailContact.findMany({ where: { organizationId: org.id, optedOut: false } // solo el conteo excluye bajas»
- Impacto: Bloqueante para el primer cliente que use Email Marketing: la baja solo cambia optedOut en la base; la campaña se manda a la lista de Brevo completa, así que la persona sigue recibiendo aunque la página le confirmó que fue removida, y si el cliente reimporta su CSV el contacto vuelve a entrar a la lista. Expone al cliente a denuncias por spam y a develOP a la suspensión de la cuenta Brevo compartida; recipientCount (cuenta solo los no dados de baja) tampoco coincide con lo que Brevo envía.
- Propuesta: Al darse de baja, sacar el contacto de la lista de la org en Brevo (o bloquearlo) además de marcar optedOut; en el import saltear los optedOut; o usar el desuscribe nativo de Brevo y sincronizar su webhook de bajas a EmailContact. Confirmar el comportamiento real de Brevo con el caso de prueba.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt, h6.vis-optout, int.brevo, modelo.EmailContact, modelo.EmailCampaign, h2.cli-email-mkt.baja-de-contactos
- REQUIERE-VERIFICACIÓN-HUMANA: VH-036

### [BUG-032] Tienda conectada: 'Conectar mi tienda' lleva al cliente a una ruta solo-SUPER_ADMIN que responde 401 en JSON
- Dominio: D2  ·  Severidad: ALTA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/dashboard/modules/tienda-conectada/_components/ConnectStoreCard.tsx:39` — «href={'/api/auth/tiendanube/start?orgId=${organizationId}'}»; `src/app/api/auth/tiendanube/start/route.ts:11` — «if (!session?.user || session.user.role !== 'SUPER_ADMIN') {»; `src/app/api/auth/tiendanube/start/route.ts:12` — «return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })»; `src/app/(protected)/dashboard/modules/tienda-conectada/_components/ConnectStoreCard.tsx:57` — «Vas a ser redirigido a Tiendanube para autorizar el acceso.»
- Impacto: Bloqueante para el primer cliente del modulo (150 USD/mes en el catalogo): el CTA principal termina en una pagina con JSON crudo; solo develOP puede conectar la tienda desde el modo soporte y nada se lo explica al cliente.
- Propuesta: Decidir el flujo: self-service del dueno con la org tomada de la sesion (sin orgId en la URL) y state firmado, o un estado 'develOP conecta tu tienda' como ConnectingState del motor de resenas. En ambos casos sacar el orgId de la URL.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-tienda.conectar-tienda, int.tiendanube

### [BUG-039] Tendencias «vs mes anterior» inventadas en Tráfico y SEO, también sobre datos reales
- Dominio: D2  ·  Severidad: ALTA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/dashboard/resultados/trafico/page.tsx:204` — «trend={{ value: 12.3 }}»; `src/app/(protected)/dashboard/resultados/trafico/page.tsx:238` — «trend={{ value: 23, displayValue: '0:23' }}»; `src/app/(protected)/dashboard/resultados/seo/page.tsx:244` — «trend={12.4}»; `src/app/(protected)/dashboard/resultados/seo/page.tsx:260` — «trend={data.avgCtr >= 3 ? 1.2 : -1.4}»; `src/components/dashboard/AnalyticsMetricCard.tsx:70` — «<span className="text-[10px] text-zinc-500">vs mes anterior</span>»; `src/app/(protected)/dashboard/resultados/seo/page.tsx:234` — «FIXME(data-truth): los 'trend' son deltas hardcodeados (no salen de Search»
- Impacto: Con datos reales de Search Console el cliente ve siempre «▲12,4% vs mes anterior» en clicks y «▲7,1%» en impresiones aunque su tráfico haya caído, y el delta de CTR/posición cambia de signo por un umbral fijo. Es lo primero que un cliente compara contra su propia consola: dato inventado presentado como medición, bloquea L3. En Tráfico ni siquiera hay FIXME (trafico/page.tsx:204, :215, :227, :238).
- Propuesta: Quitar las tendencias hasta tener el período anterior, o calcularlas con un segundo dateRange en GA4 y una segunda consulta en Search Console. Nunca literales.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados, h2.cli-resultados.trafico-ga4, h2.cli-resultados.seo-search-console, h2.cli-resultados.trafico, h2.cli-resultados.seo, int.google-analytics, int.search-console

### [BUG-040] Detalle de ticket en mobile: el hilo de mensajes colapsa a 0 px
- Dominio: D2  ·  Severidad: ALTA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:115` — «<div className="flex h-[calc(100svh-14rem)] min-h-0 w-full flex-col gap-5 sm:h-[calc(100svh-12.5rem)]">»; `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:159` — «<div className="flex flex-1 min-h-0 flex-col gap-5 lg:flex-row">»; `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:193` — «<div className="flex flex-col min-h-0 shrink-0 overflow-y-auto rounded-2xl ... lg:w-52 xl:w-56">»; `src/components/dashboard/ClientChatThread.tsx:48` — «<div className={['flex min-h-0 flex-1 flex-col gap-3', className].filter(Boolean).join(' ')}>»
- Impacto: Aritmética por lectura: en un teléfono el contenedor mide 100svh-224 px (≈330-590 px); la cabecera del ticket ocupa ≈200 px y la columna Timeline+Detalles, shrink-0 y sin alto máximo en <lg, ≈440 px. El hilo (flex-1 min-h-0) queda en 0 px y el composer se superpone a la Timeline. El cliente que abre desde el celular el mail «Actualización de Soporte» no puede leer la respuesta.
- Propuesta: En <lg dejar fluir la página (h-auto) o mover Timeline/Detalles a un bloque colapsable debajo del chat, con shrink-0 y alto fijo solo desde lg; dar un min-h al hilo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-soporte.conversacion-ticket, h2.cli-soporte
- REQUIERE-VERIFICACIÓN-HUMANA: VH-050

### [BUG-047] Los crons del reporte ejecutivo semanal y del brief IA (y el de os-follow-up) solo están registrados en vercel.json: en Netlify no tienen disparador
- Dominio: D7  ·  Severidad: ALTA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `vercel.json:8` — «"path": "/api/cron/regenerate-briefs",»; `vercel.json:12` — «"path": "/api/cron/send-executive-reports",»; `netlify.toml:25` — «[functions."generate-insights-cron"]»; `AGENTS.md:21` — «- **Deploy:** Netlify»; `src/lib/ai/executive-brief.ts:223` — «export async function refreshExecutiveBriefCache(»; `src/components/dashboard/home/AIExecutiveBriefV2.tsx:110` — «: 'Proxima actualizacion automatica: lunes'}»; `netlify.toml:28` — «[functions."send-weekly-reports-cron"] (las únicas agendadas en :25-32 son generate-insights, send-weekly-reports y cleanup-old-events)»; `docs/operations/00-entornos.md:12` — «| **Prod** | Netlify (build + runtime) | Variables del dashboard de Netlify |»; `src/app/api/cron/send-executive-reports/route.ts:5` — «export const maxDuration = 300»; `src/lib/reports/executive-weekly/send.ts:102` — «for (const { id: orgId, executiveReportFrequency } of orgs) {»; `src/lib/plan/plan-presentation.ts:99` — «label: 'Reportes semanales claros',»; `src/app/(protected)/dashboard/page.tsx:227` — «Tu primer resumen ejecutivo se genera el próximo lunes con los datos de tu semana.»
- Impacto: netlify.toml:25-32 y netlify/functions solo agendan generate-insights, send-weekly-reports y cleanup-old-events; nada dispara /api/cron/regenerate-briefs ni /api/cron/send-executive-reports. En producción el brief solo se genera al abrir el home (y hoy, con la credencial Vertex vencida, nunca) y el email ejecutivo semanal de Pro/Business no sale. La UI promete 'Próxima actualización automática: lunes', el estado vacío dice 'se genera el próximo lunes' (page.tsx:226) y el error de regeneración 'se actualiza automaticamente cada lunes' (executive-brief.ts:161).
- Propuesta: Agregar netlify/functions/regenerate-briefs-cron.ts y send-executive-reports-cron.ts con el mismo molde que send-weekly-reports-cron.ts y su schedule en netlify.toml, o eliminar vercel.json si no se usa; alinear los textos de la UI con lo que realmente corre.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): int.cron.regenerate-briefs, int.cron.send-executive-reports, h2.cli-inicio.resumen-ia, h2.cli-reportes-email, h2.cli-reportes-email.reporte-semanal, int.brevo, modelo.WeeklyReportLog, lib.reports
- REQUIERE-VERIFICACIÓN-HUMANA: VH-055

### [BUG-063] Con Vertex caído (hoy, credencial vencida) nadie se entera: el health dice 'Todo OK', no queda error en la base y el cliente ve su bot 'Activo' sin conversaciones
- Dominio: D5  ·  Severidad: ALTA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/health/checkHealth.ts:48` — «const provider = getLLMProvider() const models = provider.listModels()»; `src/modules/chatbot/server/llm/providers/google.ts:108` — «listModels(): ModelInfo[] { return Object.values(GOOGLE_MODELS).map(({ apiModelId: _omit, ...rest }) => rest)»; `src/modules/chatbot/server/health/buildHealthVerdict.ts:125` — «: 'Todos los sistemas responden. El bot está listo para recibir consultas.'»; `src/modules/chatbot/server/chat/handleChatRequest.ts:1052` — «logPersistFailure('chat.stream_error', error, {»; `src/modules/chatbot/server/logging/logger.ts:177` — «console.error( JSON.stringify({»; `src/modules/chatbot/server/admin/detectBotIssues.ts:88` — «level: 'ERROR', createdAt: { gte: oneHourAgo }, OR: [»; `src/modules/chatbot/server/quota/checker.ts:197` — «const discarded = await tx.conversation.deleteMany({»; `src/modules/chatbot/server/chat/persistTurn.ts:353` — «if (getConversationDiscarded()) {»; `src/app/(protected)/dashboard/chatbot/layout.tsx:51` — «? 'Activo · respondiendo a tus visitantes'»; `src/instrumentation.ts:15` — «if (error.message?.includes('RESOURCE_EXHAUSTED')) return null»; `src/app/(protected)/dashboard/chatbot/layout.tsx:50` — «session.bot.isActive ? 'Activo · respondiendo a tus visitantes'»; `src/modules/chatbot/hooks/useChatbot.ts:470` — «onError: () => { setDegradedInfo((prev) => ... reason: 'stream_interrupted',»; `src/modules/chatbot/server/chat/reconcile.ts:366` — «case 'stream_error': case 'stream_abort': return !input.firstTokenDelivered»; `src/modules/chatbot/server/config/envValidator.ts:35` — «name: 'GOOGLE_APPLICATION_CREDENTIALS', required: true,»; `src/modules/chatbot/server/health/checkHealth.ts:49` — «const models = provider.listModels()»; `src/modules/chatbot/server/llm/providers/google.ts:63` — «if (!credPath && !credJson) {»; `src/app/(protected)/admin/chatbot/health/page.tsx:146` — «Verificar que CHATBOT_GOOGLE_API_KEY sea válida y la Generative Language API esté»; `src/modules/chatbot/components/admin/health/LatencyChart.tsx:144` — «: 'El gráfico se llena automáticamente con cada conversación. Aún no hay respuestas medidas en las últimas 24h.'»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:63` — «{session.bot.botName} está atendiendo consultas las 24 horas.»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:109` — «value="24/7"»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:418` — «{chatbot.degradedInfo && ( <DegradedBanner key="degraded-banner" info={chatbot.degradedInfo} />»; `src/modules/chatbot/server/admin/detectBotIssues.ts:91` — «{ type: { contains: 'llm' } },»; `src/modules/chatbot/server/chat/handleChatRequest.ts:1369` — «// devolver el stream (este catch solo alcanza fallos pre-return), el»; `src/modules/chatbot/server/chat/handleChatRequest.ts:1265` — «onSilentClose: async () => { if (accumulatedAssistantText.trim().length > 0) return null»; `src/modules/chatbot/server/chat/persistTurn.ts:537` — «type: 'chat.message_completed',»; `src/modules/chatbot/server/llm/providers/google.ts:62` — «// En production (Netlify) usamos JSON inline. En development local, file path.»; `src/modules/chatbot/server/admin/detectBotIssues.ts:219` — «type: 'capture_lead.error',»; `src/modules/chatbot/server/tools/captureLead.ts:601` — «type: 'capture_lead.error', (dentro de console.error(JSON.stringify(...)), sin logChatbotEvent ni Sentry)»; `src/modules/chatbot/server/health/checkHealth.ts:35` — «dbCheck = { ok: false, error: error instanceof Error ? error.message : 'unknown' }»
- Impacto: Bloqueante para el primer cliente real. Con la credencial vencida (o cualquier caída del proveedor) el visitante recibe la derivación canned ('Se me complicó generar una respuesta ahora...'); como no llegó ningún chunk, la compensación devuelve el cupo y BORRA la conversación con el mensaje del visitante: el cliente no ve conversaciones ni leads y su encabezado sigue diciendo 'Activo · respondiendo a tus visitantes'. El error solo va a stderr y a Sentry (si hay DSN); no queda ChatbotEvent ERROR, así que el detector de alertas no podría verlo aunque corriera. /admin/chatbot/health y /api/chatbot/[slug]/health solo miran variables y que el constructor no tire: con latencia 'empty' muestran 'Todo OK'. Los runbooks (docs/operations/04-responder-alerta.md:18) mandan a mirar justo esa página. Además Sentry descarta los errores de cuota de Vertex (RESOURCE_EXHAUSTED).
- Propuesta: Registrar el fallo del proveedor como ChatbotEvent ERROR (p. ej. chat.provider_error) en onError; que el health haga una llamada real mínima, cacheada y con techo, o lea la tasa de errores reciente; que el veredicto pase a 'Problema' si hubo fallos del proveedor y cero respuestas; no descartar RESOURCE_EXHAUSTED en Sentry (bajarle el nivel); y mostrarle al cliente un estado honesto cuando su bot no responde.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-health, h3.vis-api-chatbot, h3.cli-chatbot, int.vertex, int.sentry, lib.chatbot.health, lib.chatbot.chat, lib.chatbot.quota, modelo.ChatbotEvent, h3.vis-widget-develop, h3.adm-health.latencia-p50-p95, h3.cli-chatbot.resumen, h4.adm-alertas.detector-incidencias, h3.vis-widget-cliente, lib.chatbot.admin, h3.adm-actividad, lib.chatbot.logging, lib.chatbot.tools, lib.chatbot.llm
- REQUIERE-VERIFICACIÓN-HUMANA: VH-066

### [BUG-085] Las metricas del resumen del chatbot son constantes o estan mal calculadas (oportunidades, valor estimado, tiempo de respuesta)
- Dominio: D5  ·  Severidad: ALTA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:42` — «capturedLeads: recentLeads.length, leadValueUSD: 50, successRate: 0.97,»; `src/app/(protected)/dashboard/chatbot/page.tsx:30` — «listLeadsByOrgSlug(orgSlug, 5),»; `src/modules/chatbot/server/admin/multiTenantQueries.ts:34` — «where: { botConfigId: botInfo.bot.id }, orderBy: { capturedAt: 'desc' }, take: limit,»; `src/modules/chatbot/lib/business-metrics.ts:21` — «avgResponseSeconds: Math.round((input.avgLatencyMs ?? 1500) / 100) / 10,»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:110` — «description={'Responde en ~${formatResponseTime(metrics.avgResponseSeconds)}'}»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:43` — «leadValueUSD: 50,»
- Impacto: 'Oportunidades este mes' es como maximo 5 y son los ultimos 5 leads de toda la historia, descartados incluidos; 'Valor estimado' es 5 x US$50 fijo; 'Responde en ~1,5 s' es una constante. El primer cliente real ve numeros inventados en la portada de su chatbot (falla 'sin datos de mentira' de L3).
- Propuesta: Contar leads del mes en curso excluyendo DQ con una query de conteo scoped; quitar el valor estimado o basarlo en un ticket declarado por el cliente y rotularlo como estimacion; calcular la latencia con datos reales o sacar la linea.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot.resumen, modelo.ChatbotLead, modelo.QuotaUsage, h3.cli-chatbot, lib.chatbot.lib
- REQUIERE-VERIFICACIÓN-HUMANA: VH-087

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
- Evidencia: `prisma/schema.prisma:659` — «price Float»; `src/app/(protected)/admin/clients/_actions/plan.actions.ts:179` — «const subData: Prisma.SubscriptionUncheckedUpdateInput = {»; `src/app/(protected)/admin/clients/_actions/plan.actions.ts:192` — «price: targetPlan.monthlyPrice.toNumber(),»; `src/lib/plan/get-plan-for-org.ts:53` — «planId: sub.pendingPlanId,»; `src/app/(protected)/dashboard/cuenta/perfil/page.tsx:211` — «price: org.subscription.price,»; `src/components/dashboard/ProfileForms.tsx:662` — «{plan.currency} {plan.price.toLocaleString('es-AR')}»; `src/app/(protected)/admin/page.tsx:226` — «_sum: { price: true,»
- Impacto: Después de un upgrade (plan.actions.ts:197-200) o de un downgrade diferido (get-plan-for-org.ts:50-58), el cliente ve en /dashboard/cuenta/perfil el nombre del plan nuevo con el precio del anterior; un priceOverride vigente tampoco se muestra. El primer cliente real que cambie de plan va a ver un precio distinto del que se le cobra.
- Propuesta: Una sola fuente: mostrar el precio efectivo (priceOverride vigente o Plan.monthlyPrice) en lugar de Subscription.price, o actualizar price en las dos rutas de cambio de plan. Eliminar Subscription.price si queda sin uso es decisión para Valentino (schema FROZEN).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-cuenta, h4.adm-clientes, modelo.Subscription, modelo.Plan, h4.adm-clientes.plan, h4.adm-dashboard, lib.plan

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
- Evidencia: `prisma/migrations/20260525182135_b11_1_project_organizationid_not_null/migration.sql:17` — «ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;»; `prisma/migrations/20260406010000_v2-unify-project-task/migration.sql:198` — «ALTER TABLE "OsPaymentMilestone" ADD CONSTRAINT "OsPaymentMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;»; `src/modules/chatbot/server/admin/hardDeleteClient.ts:49` — «_count: { select: { projects: true, tickets: true, messages: true, clientAssets: true },»; `src/modules/chatbot/server/admin/hardDeleteClient.ts:141` — «await tx.organization.delete({ where: { id: organizationId } })»; `src/modules/chatbot/server/admin/createClientOnly.ts:66` — «if (existingUser) throw new Error('El email ingresado ya está registrado en el sistema.')»; `prisma/schema.prisma:528` — «organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)»; `src/modules/chatbot/server/admin/hardDeleteClient.ts:84` — «where: { botConfigId: botId, convertedToOsLeadId: null },»; `prisma/schema.prisma:1441` — «botConfig BotConfig @relation(fields: [botConfigId], references: [id], onDelete: Cascade)»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:190` — «// (p. ej. desde un ticket "Solicitud de eliminación de cuenta"). La action y el»; `prisma/schema.prisma:527` — «user User @relation(fields: [userId], references: [id], onDelete: Cascade) organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)»; `src/modules/chatbot/server/admin/hardDeleteClient.ts:50` — «select: { projects: true, tickets: true, messages: true, clientAssets: true },»; `src/modules/chatbot/server/admin/updateClient.ts:79` — «throw new Error('El email ingresado ya está registrado en otro usuario.')»
- Impacto: Al atender una solicitud de baja (el admin enlaza ?delete=<orgId> desde el ticket) se borran hitos de pago, pagos de mantenimiento y horas cargadas (OsPaymentMilestone/OsMaintenancePayment/OsTimeEntry, también :201 y :207), que son contabilidad de develOP, sin que el modal los mencione. Los User del cliente quedan sin org con email, nombre, teléfono y hash de contraseña: la baja no elimina sus datos personales y el email queda bloqueado para un alta nueva.
- Propuesta: Contar y mostrar pagos y horas en el resumen; decidir si se preservan (exportarlos antes o desacoplarlos con SetNull, cambio de schema FROZEN: decisión para Valentino); borrar o anonimizar en la misma transacción los User que solo pertenecían a esa org.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes, h4.adm-clientes.eliminar-cliente, modelo.Project, modelo.OsPaymentMilestone, modelo.OsMaintenancePayment, modelo.OsTimeEntry, modelo.User, modelo.OrgMember, modelo.ChatbotLead, h4.adm-clientes.eliminar-definitivo, h1.auth-login, h2.cli-cuenta

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
- Evidencia: `src/modules/chatbot/server/admin/getClientSession.ts:15` — «c.orgMember.findFirst({ where: { userId: session.user.id },»; `src/lib/preview.ts:14` — «if (role === 'SUPER_ADMIN') { const impersonation = await getImpersonationSession() return impersonation?.orgId ?? null»; `src/app/(protected)/dashboard/chatbot/page.tsx:24` — «const session = await getClientChatbotSession() if (!session) return <ChatbotUpsellLanding />»; `src/app/(protected)/dashboard/chatbot/leads/page.tsx:36` — «const session = await getClientChatbotSession() if (!session) redirect('/dashboard')»; `src/app/api/dashboard/chatbot/leads/export/route.ts:84` — «const session = await getClientChatbotSession()»; `src/modules/chatbot/server/dashboard/updateBotAppearance.ts:61` — «const orgId = await resolveOrgId()»; `prisma/seed.ts:82` — «const admin = await prisma.user.upsert({»; `src/app/(protected)/dashboard/chatbot/conversations/page.tsx:9` — «const session = await getClientChatbotSession() if (!session) redirect('/dashboard')»; `src/app/(protected)/dashboard/chatbot/settings/page.tsx:17` — «const orgId = await resolveOrgId()»; `src/app/(protected)/dashboard/chatbot/page.tsx:15` — «const orgId = await resolveOrgId() ... :24 const session = await getClientChatbotSession()»; `src/modules/chatbot/server/admin/updateLeadStatus.ts:18` — «const session = await getClientChatbotSession()»; `src/modules/chatbot/components/dashboard/CrmStatusIndicator.tsx:21` — «const organizationId = await resolveOrgId()»
- Impacto: Soporte no puede revisar el chatbot de un cliente impersonándolo: con un SUPER_ADMIN sin OrgMember (así lo siembra el seed) /dashboard/chatbot muestra la landing de 'activá tu chatbot' aunque checkClientHasChatbot (con resolveOrgId, page.tsx:15-18) dijo que hay bot, leads y conversaciones redirigen a /dashboard y el CSV da 401, mientras la apariencia sí se edita sobre el cliente. Si un usuario tiene membresías en dos orgs, esta sección puede mostrar y modificar (estado de leads, insights) una org distinta de la del resto del portal en el mismo request.
- Propuesta: Que getClientChatbotSession derive la org de resolveOrgId() (o reciba el orgId) y lea org y bot con select acotado; agregar un invariante que prohíba orgMember.findFirst sin orderBy como resolución de tenant. Verificar en prod (solo lectura) si los SUPER_ADMIN tienen OrgMember.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-005], [SEC-029]
- Nodo(s): h3.cli-chatbot, h1.auth-impersonacion, lib.chatbot.admin, modelo.OrgMember, lib.preview, lib.isolation
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
- Evidencia: `src/modules/chatbot/server/chat/handleChatRequest.ts:345` — «if (quota.conversationsUsed >= plan.quota) {»; `src/modules/chatbot/server/chat/handleChatRequest.ts:952` — «temperature: 0.7,»; `src/modules/chatbot/server/admin/detectBotIssues.ts:68` — «if (usage && usage.conversationsCount >= bot.monthlyQuota) {»; `src/modules/chatbot/server/admin/createClientWithBot.ts:186` — «monthlyQuota: 1000,»; `prisma/seeds/sync-plans.ts:72` — «quota: 500,»; `src/modules/chatbot/server/admin/saveBotConfig.ts:45` — «llmModel: z.string().min(1).max(80), temperature: z.number().min(0).max(2), maxOutputTokens: z.number().int().min(100).max(8192),»; `src/app/(protected)/admin/chatbots/[botId]/tabs/OverviewTab.tsx:98` — «value={'${quotaUsed.toLocaleString('es-AR')} / ${bot.monthlyQuota.toLocaleString('es-AR')}'}»; `src/modules/chatbot/components/admin/config/tabs/AdvancedTab.tsx:56` — «<Field label="Temperature" hint="0 es mas determinista, 2 es mas creativo">»; `src/modules/chatbot/server/chat/handleChatRequest.ts:713` — «const effectiveModel = resolveEffectiveModel(normalizeLlmProvider(bot.llmProvider), plan.llmModel)»; `src/app/(protected)/admin/chatbots/[botId]/tabs/OverviewTab.tsx:46` — «bot.monthlyQuota > 0 ? Math.min(100, (quotaUsed / bot.monthlyQuota) * 100) : 0»; `src/lib/onboarding/core.ts:134` — «monthlyQuota: 1000,»; `src/lib/plan/fallback.ts:50` — «quota: 500,»; `src/app/api/admin/chatbot/demo-chat/[slug]/route.ts:57` — «const effectiveModel = resolveEffectiveModel(normalizeLlmProvider(bot.llmProvider), bot.llmModel)»; `src/modules/chatbot/components/admin/config/tabs/AdvancedTab.tsx:120` — «{ value: 'DAILY_DIGEST', label: 'Digest diario' },»; `src/lib/client-notifications/notify.ts:94` — «if (org.leadNotificationMode === 'DISABLED') return»; `src/modules/chatbot/components/admin/config/tabs/AdvancedTab.tsx:77` — «<Field label="Quota mensual">»; `src/modules/chatbot/server/llm/providers/anthropic.ts:18` — «throw new ProviderNotImplementedError('anthropic')»; `src/modules/chatbot/components/admin/onboarding/Step5Review.tsx:304` — «<LlmFact label="Quota" value="1000 conv/mes" />»; `src/modules/chatbot/server/admin/preflightChecks.ts:151` — «if (bot.monthlyQuota > 0) {»; `src/modules/chatbot/server/admin/saveBotConfig.ts:47` — «maxOutputTokens: z.number().int().min(100).max(8192),»; `src/modules/chatbot/server/config/getPublicConfig.ts:121` — «routeColorMap: (bot.routeColorMap as unknown as RouteColorMap) ?? {},»; `src/app/api/admin/chatbot/demo-chat/[slug]/route.ts:113` — «maxOutputTokens: bot.maxOutputTokens,»; `prisma/schema.prisma:1315` — «maxOutputTokens Int @default(800)»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/ChatbotTab.tsx:94` — «value={'${org.botConfig.monthlyQuota.toLocaleString('es-AR')} conv'}»; `src/modules/chatbot/server/chat/handleChatRequest.ts:211` — «// a las otras dos. La cuota del plan reemplaza bot.monthlyQuota»
- Impacto: Con el primer cliente Starter el bot se corta a 500 conversaciones pero la alerta QUOTA_EXHAUSTED compara contra 1000 y nunca dispara; con Pro o Business (3000/5000, sync-plans.ts:88 y :104) dispara a 1000 aunque el bot sigue funcionando. El admin ve '500 / 1000' y el cliente ve el límite del plan. Editar modelo, temperatura, tope de salida o cuota en el admin no cambia nada en runtime, y como streamText no recibe maxOutputTokens, cada uno de los hasta 3 pasos de un turno puede generar el máximo del modelo: el costo por turno de un visitante anónimo no tiene tope configurable.
- Propuesta: Sacar del editor del admin los campos legacy (o mostrarlos solo lectura con el valor del plan); que detector, preflight y fichas del admin usen getPlanForOrg().quota; pasar maxOutputTokens explícito en streamText. Decisión para Valentino (schema FROZEN): borrar las columnas legacy de BotConfig.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots, h4.adm-alertas, h3.vis-api-chatbot, modelo.BotConfig, modelo.Plan, lib.plan, int.vertex, h3.adm-chatbots.config-llm-y-cuota, h3.adm-chatbots.detalle-overview, lib.chatbot.chat, lib.client-notifications, h3.adm-chatbots.editar-config-bot, h4.adm-clientes.alta-cliente-con-bot, lib.chatbot.llm, h3.adm-chatbots.editar-config, h4.adm-clientes.tab-chatbot

### [BUG-025] EmailCampaign sin estado intermedio ni métricas: SENDING y SCHEDULED no se escriben (doble envío posible), FAILED no tiene reintento y aperturas y clics nunca se actualizan
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:181` — «if (campaign.status !== 'DRAFT') return { error: 'Solo podés enviar campañas en estado DRAFT.' }»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:205` — «const sent = await brevoSendCampaign(brevoResult.campaignId)»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:210` — «status: sent ? 'SENT' : 'FAILED',»; `prisma/schema.prisma:1141` — «enum EmailCampaignStatus { DRAFT SCHEDULED»; `src/lib/integrations/brevo.ts:143` — «export async function getCampaignStats(campaignId: number): Promise<{»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/page.tsx:110` — «{pct(campaign.openedCount, campaign.recipientCount)}»; `src/app/(protected)/dashboard/modules/email-marketing/layout.tsx:31` — «Envia campanas de email a tus contactos y segui los resultados en tiempo real.»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:148` — «const recipientCount = activeContacts.length // al crear el borrador»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:217` — «return { ok: true } // tambien con sent === false y status FAILED»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/page.tsx:144` — «El envio fallo. Revisa la configuracion e intenta de nuevo. // sin accion de reintento»
- Impacto: Cuando el módulo se habilite: dos envíos concurrentes de la misma campaña (dos pestañas, un reintento) pasan el control de DRAFT y Brevo crea y manda dos campañas a toda la lista; una campaña FAILED (por ejemplo Brevo la creó pero sendNow falló) no se puede reintentar y queda huérfana en Brevo; y la tabla de campañas muestra 0% de aperturas y clics para siempre porque getCampaignStats no tiene llamadores (dato falso en el camino del cliente).
- Propuesta: Pasar DRAFT a SENDING con updateMany condicional (where status DRAFT) antes de llamar a Brevo y abortar si no afectó filas; permitir reintento de FAILED reusando el brevoCampaignId guardado; traer las métricas con getCampaignStats (cron o al abrir la tabla) o webhook de Brevo, u ocultar las columnas.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt, int.brevo, modelo.EmailCampaign, h2.cli-email-mkt.metricas-de-campana, h2.cli-email-mkt.crear-y-enviar-campana
- REQUIERE-VERIFICACIÓN-HUMANA: VH-039

### [BUG-029] Nueva campana: 'Enviar ahora' manda a todos los contactos sin confirmacion, 'Guardar borrador' ignora errores y los botones se traban si la action lanza
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/modules/email-marketing/campaigns/new/page.tsx:87` — «form id=campaign-form onSubmit={handleSendNow} // el submit (y Enter) envia»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/new/page.tsx:149` — «await createCampaignAction(fd) // resultado ignorado; luego router.push (:153)»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/new/page.tsx:53` — «const createResult = await createCampaignAction(fd) // sin try/catch: setSending(false) no corre si lanza»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/new/page.tsx:34` — «const [state, formAction, pending] = useActionState<State, FormData>( // formAction nunca se usa»
- Impacto: Un envio irreversible a toda la base sale con un clic (o con Enter en un campo de una linea si el HTML ya esta completo) sin el paso de confirmacion que si tiene /send; un borrador que falla validacion se pierde en silencio; un error de red deja 'Enviando...' para siempre.
- Propuesta: Separar crear de enviar: guardar siempre como borrador y enviar desde /send con confirmacion y conteo de destinatarios; usar el resultado de createCampaignAction; try/catch con estado de error; quitar el useActionState muerto.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt.crear-y-enviar-campana
- REQUIERE-VERIFICACIÓN-HUMANA: VH-044

### [BUG-030] 'Editar' una campana en borrador abre un formulario vacio y guardar crea otra campana
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/modules/email-marketing/campaigns/page.tsx:131` — «href={'/dashboard/modules/email-marketing/campaigns/new?edit=${campaign.id}'}»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/new/page.tsx:29` — «export default function NewCampaignPage() { // no lee searchParams; no existe accion de update»
- Impacto: El cliente no puede corregir un borrador: cada 'Editar' termina en un duplicado.
- Propuesta: Implementar la edicion (cargar la campana por id scoped a la org de la sesion + updateCampaignAction con Zod) o quitar el boton.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt.crear-y-enviar-campana, modelo.EmailCampaign

### [BUG-031] Importacion CSV sin limites: una llamada a Brevo por fila en serie, conteo enganoso y fallas de sincronizacion silenciosas
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:73` — «const csvText = formData.get('csv') as string | null»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:84` — «for (const row of rows) { // await upsert + await syncContact por fila»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:102` — «created++ // cuenta tambien actualizaciones; el boolean de syncContact se ignora»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:58` — «const cols = line.split(',')... // split ingenuo, rompe con comas entre comillas»
- Impacto: Un CSV de algunos miles de filas excede el tiempo de la funcion y queda importado a medias sin aviso; contactos guardados en la base pero no en Brevo nunca reciben campanas y el mensaje 'N importados' miente.
- Propuesta: Validar tamano y filas maximas, parser CSV real, upsert por lotes y alta masiva en Brevo (contacts/import), contar creados/actualizados/fallidos por separado y mostrar el detalle.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt.importar-contactos, int.brevo, modelo.EmailContact

### [BUG-033] Resumen de Tiendanube: los errores de la API se muestran como ceros, no pagina y el stock ilimitado aparece como 'Agotado'
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/integrations/tiendanube.ts:96` — «... = ordersThisMonthRes.ok ? await ordersThisMonthRes.json() : []»; `src/lib/integrations/tiendanube.ts:144` — «stock: v.stock ?? 0,»; `src/lib/integrations/tiendanube.ts:147` — «.filter((p) => p.stock !== null && p.stock <= 3)»; `src/lib/integrations/tiendanube.ts:115` — «'${API_BASE}/${auth.storeId}/carts?per_page=50&abandoned=true', // sin filtro de 7 dias (ConnectStoreCard.tsx:68 promete 'Ultimos 7 dias')»
- Impacto: Con el token vencido o revocado el cliente ve 0 pedidos y 0 facturacion como si fuera real; con mas de 200 pedidos al mes las cifras quedan cortas; los productos sin control de stock (stock null en Tiendanube) se listan como agotados.
- Propuesta: Tratar !res.ok como error (estado de error + Sentry), paginar, respetar stock null como ilimitado y filtrar carritos por fecha.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-tienda.resumen-de-ventas, int.tiendanube
- REQUIERE-VERIFICACIÓN-HUMANA: VH-045

### [BUG-034] Fechas y horas del portal formateadas sin zona horaria: turnos corridos 3 h, saludo y fecha del Inicio, Timeline del ticket, tooltip de sesiones un día antes y horas del chat distintas entre servidor y navegador
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/page.tsx:33` — «const hour = new Date().getHours()»; `src/app/(protected)/dashboard/page.tsx:41` — «.toLocaleDateString('es-AR', { weekday: 'long', ... // sin timeZone»; `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:18` — «return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })»; `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:98` — «const day = start.getDate()»; `src/lib/dates-ar.ts:233` — «export function formatTimeAR(date: Date): string { // helper disponible y sin usar aca»; `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:41` — «return d.toLocaleDateString('es-AR', {»; `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:304` — «{ticket.createdAt.toLocaleDateString('es-AR', {»; `src/app/(protected)/dashboard/services/page.tsx:149` — «{startDate.toLocaleDateString('es-AR', {»; `src/components/dashboard/results/analysis/DiscoveriesSection.tsx:25` — «timeZone: TZ_AR,»; `src/components/dashboard/SessionsChart.tsx:47` — «{new Date(label).toLocaleDateString('es-AR', {»; `src/lib/analytics.ts:171` — «const date = '${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}'»; `src/components/dashboard/ChatBubble.tsx:19` — «return new Date(date).toLocaleString('es-AR', {»; `src/components/dashboard/ImpersonationTimer.tsx:20` — «const [remaining, setRemaining] = useState(() => new Date(expiresAt).getTime() - Date.now())»; `src/components/dashboard/CurrentPlanCard.tsx:17` — «return date.toLocaleDateString('es-AR', {»; `src/components/dashboard/results/PageSpeedCard.tsx:60` — «return date.toLocaleString('es-AR', {»; `src/components/dashboard/results/GBPMetricsCard.tsx:13` — «return date.toLocaleDateString('es-AR', {»; `src/components/dashboard/results/analysis/DiscoveriesSection.tsx:24` — «const DATE_FMT = new Intl.DateTimeFormat('es-AR', { timeZone: TZ_AR,»; `src/modules/chatbot/components/dashboards/ConversationsTable.tsx:45` — «return new Date(d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:206` — «{new Date(h.createdAt).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', ...»; `src/modules/chatbot/components/dashboards/LeadsTable.tsx:37` — «// timeZone fijo (AR): sin esto el server (Netlify = UTC) y el cliente (UTC-3) ... → hydration mismatch.»
- Impacto: Con el server en UTC (no hay TZ en vercel.json ni netlify.toml; el repo corre sus invariantes con TZ=UTC) un turno de las 10:00 de Buenos Aires se muestra 13:00; entre las 21 y las 24 h el Inicio muestra la fecha de manana y el saludo es incorrecto en franjas de 3 h (ademas 'Buenos dias' sin tilde, page.tsx:34). Igual en facturacion (:88-94), boveda (:202-206), referidos (:22-24) y proyecto (:70-76).
- Propuesta: Usar formatDateAR/formatTimeAR/TZ_AR de dates-ar (o timeZone 'America/Argentina/Buenos_Aires') en todos los formateos de server components y agregar un invariante que lo exija.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio, h2.cli-agenda.panel-de-agenda, h2.cli-cuenta, lib.dates-ar, h2.cli-soporte.conversacion-ticket, h2.cli-servicios.servicios-contratados, lib.tz-ar, h2.cli-mensajes, h2.cli-soporte, h2.cli-resultados.trafico, h1.auth-impersonacion, h2.cli-resultados, h3.cli-chatbot.conversaciones, h3.cli-chatbot.resumen
- REQUIERE-VERIFICACIÓN-HUMANA: VH-047

### [BUG-035] El onboarding pide el 'ID de medicion (G-XXXX)' y lo guarda como Property ID, que la lectura de GA4 rechaza
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/bienvenida/_components/Step2Conexiones.tsx:38` — «ID de medicion (formato G-XXXXXXX)»; `src/app/bienvenida/_actions/complete-onboarding.ts:38` — «analyticsPropertyId: parsed.data.ga4MeasurementId,»; `src/lib/analytics.ts:66` — «if (/^G-|^GA-/i.test(trimmed)) { // lanza 'El Property ID debe ser el ID numerico...'»
- Impacto: Todo cliente que sigue las instrucciones del onboarding termina con la pagina de Trafico en error y no tiene como corregirlo desde su panel.
- Propuesta: Pedir el Property ID numerico (o no pedir nada y que lo cargue develOP) y validar el formato con Zod.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-045], [FAL-010]
- Nodo(s): h2.cli-bienvenida, h2.cli-resultados, int.ga4

### [BUG-036] Motor de resenas: un error de la API de Google se muestra como 'Sin resenas todavia'
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/integrations/google-business-profile.ts:344` — «const data: unknown = await res.json() // sin chequear res.ok»; `src/lib/integrations/google-business-profile.ts:365` — «return [] // catch»; `src/app/(protected)/dashboard/modules/motor-resenas/page.tsx:27` — «Tu Google ya esta conectado. Cuando lleguen resenas van a aparecer aca para responderlas»
- Impacto: Con el token vencido, la cuota agotada o la ubicacion mal asignada, el cliente cree que no tiene resenas y deja de responder las reales.
- Propuesta: Distinguir error de vacio en listReviews (resultado ok/error), estado de error con CTA a develOP y Sentry.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resenas.responder-resenas-con-ia, int.gbp

### [BUG-037] Avisos por email de mensajes nuevos y de respuestas a tickets: el resultado de Resend se ignora (éxito simulado) y el remitente está marcado como no verificado
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/email/notify-message.ts:50` — «await resend.emails.send({»; `src/lib/email/notify-message.ts:51` — «from: 'develOP <hola@develop.com.ar>', // ⚠️ Franco, ajustar al dominio real verificado en Resend»; `src/lib/email/notify-message.ts:62` — «console.log('[notify-message] Email sent to ${obfuscateEmail(member.user.email)}')»; librería resend@6.16.0, dist/index.d.cts línea 601 — «type CreateEmailResponse = Response<CreateEmailResponseSuccess>; // { data, error }: el SDK no lanza»; `src/lib/tickets/actions.ts:156` — «const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' sendEmail({»; `src/lib/tickets/actions.ts:166` — «}).catch(console.error) (sendEmail nunca rechaza: el resultado se ignora)»; `src/lib/email.ts:15` — «if (!resend) { return { success: true }»; `src/lib/email.ts:21` — «from: 'develOP Agency <hello@develop-agency.com>',»; `docs/env-vars.md:45` — «| 'RESEND_API_KEY' | OPCIONAL (alternativa a Brevo) |»
- Impacto: Si el dominio no esta verificado en Resend, el cliente nunca recibe el aviso de que develOP le escribio, y los logs dicen 'Email sent'.
- Propuesta: Leer { error } del resultado, reportarlo a Sentry, verificar el dominio o migrar a Brevo (PLAN-067).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-mensajes.aviso-por-email, h4.adm-mensajes, int.resend, h4.adm-tickets, h4.adm-tickets.responder-y-avisar-por-email, int.brevo, lib.email
- REQUIERE-VERIFICACIÓN-HUMANA: VH-049

### [BUG-041] Fallas de GA4, Search Console, GBP y del PDF mensual quedan en console.error o se disfrazan de demo
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/analytics.ts:196` — «} catch { // Fall back to mock data on any API error return { ok: true, data: getMockAnalyticsData() }»; `src/lib/searchconsole.ts:211` — «} catch { // Fall back to mock data on any API error return { ok: true, data: getMockSearchConsoleData() }»; `src/app/(protected)/dashboard/resultados/seo/page.tsx:181` — «if (!result.ok) {»; `src/lib/integrations/google-business-profile.ts:203` — «console.error('[GBP] Reviews API error:', reviewsRes.status, await reviewsRes.text())»; `src/app/(protected)/dashboard/resultados/reputacion/page.tsx:22` — «console.error('[GBP] Reputation page failed:', err)»; `src/app/api/reports/client-monthly/route.ts:58` — «console.error('[client-monthly-report] PDF generation error', error)»
- Impacto: Si la service account pierde acceso o se revoca el token de GBP, el cliente pasa a ver datos de ejemplo con el banner «vista previa… develOP se encarga de la activación», o «Reputación pendiente de conexión», y develOP no se entera: no hay evento en Sentry. La rama de error de SEO (seo/page.tsx:181-200) es inalcanzable porque getSearchConsoleData nunca devuelve ok:false. Los null de GBP y los [] de insights se cachean (1 h y 24 h).
- Propuesta: Que las libs devuelvan ok:false con causa tipada cuando hay credenciales y la API falla (sin mock); Sentry.captureException (+ flush en route handlers) en esos catch; mostrar «no pudimos actualizar» en vez de demo.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [FAL-015], [UX-015]
- Nodo(s): h2.cli-resultados, int.google-analytics, int.search-console, int.google-business-profile, int.sentry, h2.cli-resultados.informe-mensual-pdf

### [BUG-042] Tres definiciones de «lead» frente al cliente: el PDF mensual y las recomendaciones cuentan los descalificados
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/reports/client-monthly/get-client-monthly-report-data.ts:56` — «prisma.chatbotLead.count({ where: { botConfigId, capturedAt: { gte: current.start, lt: current.end } },»; `src/lib/dashboard/home-metrics.ts:92` — «const notDq: Prisma.ChatbotLeadWhereInput = { OR: [{ classification: null }, { classification: { not: 'dq' } }],»; `src/modules/chatbot/server/scoring/dqFilter.ts:23` — «NOT: { classification: 'dq' },»; `src/modules/chatbot/server/reports/buildWeeklyReport.ts:63` — «...excludeDqWhere(),»; `src/modules/chatbot/server/analysis/getMonthlyAnalysisForOrg.ts:83` — «scope.chatbotLead.groupBy({ by: ['category'], where: { botConfigId, ... (sin filtro DQ; alimenta leadsLast30d :104)»; `src/lib/dashboard/home-metrics.ts:87` — «// Lead "del negocio" = todo lo capturado MENOS los descalificados (DQ).»; `src/modules/chatbot/server/scoring/dqFilter.ts:4` — «* Los DQ NO se borran (auditoría). Se filtran SOLO en queries que alimenten: * - métricas de conversión visibles al cliente,»; `src/lib/recommendations/rules.ts:47` — «body: 'Este mes entraron ${s.leadsLast30d} consultas y tu ficha de Google todavía no está conectada.»
- Impacto: El PDF «Descargá el informe del mes» suma spam, empleo y proveedores (DQ) y da un número mayor que el de Inicio (que excluye DQ e incluye no clasificados); el reporte semanal usa excludeDqWhere, que en SQL también descarta los null, y da un tercer número. El cliente compara y deja de confiar en todos.
- Propuesta: Un único helper de «lead del negocio» (el notDq de home-metrics) usado por PDF, semanal y home; corregir excludeDqWhere para incluir null.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados.informe-mensual-pdf, h2.cli-inicio, h2.cli-reportes-email, modelo.ChatbotLead, lib.chatbot.scoring, h2.cli-inicio.ideas-para-crecer, lib.reports, lib.recommendations

### [BUG-044] Modo soporte sin política de escritura: unas actions del portal toman session.user.organizationId (fallan o apuntan a la org del admin) y otras resolveOrgId y escriben como el cliente (marcan leídos sus mensajes, gastan su cupo del brief)
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/messages.ts:119` — «const organizationId = session?.user?.organizationId»; `src/lib/actions/notifications.ts:75` — «const organizationId = session?.user?.organizationId»; `src/lib/actions/referrals.ts:14` — «const organizationId = session?.user?.organizationId»; `src/lib/actions/announcements.ts:20` — «const organizationId = session?.user?.organizationId»; `src/actions/dashboard-actions.ts:14` — «if (!session?.user?.id || !session.user.organizationId) {»; `src/app/(protected)/dashboard/referidos/page.tsx:27` — «const organizationId = await resolveOrgId()»; `src/app/(protected)/dashboard/messages/page.tsx:28` — «<MarkReadOnMount action={markClientMessagesRead} />»; `src/app/(protected)/dashboard/messages/_actions/mark-read.ts:15` — «await prisma.message.updateMany({ where: { organizationId, fromAdmin: true, read: false }, data: { read: true } }) // org de resolveOrgId»; `src/app/(protected)/dashboard/_actions/regenerate-brief.ts:16` — «const orgId = z.string().min(1).safeParse(await resolveOrgId()) // el admin consume el cupo del cliente»; `src/app/(protected)/dashboard/layout.tsx:80` — «prisma.user.update({ where: { id: session.user.id }, data: { lastDashboardVisit: new Date() } })»; `src/app/(protected)/dashboard/cuenta/perfil/page.tsx:121` — «La edicion no esta disponible durante la sesion de soporte.»; `src/lib/actions/upsell.ts:16` — «const organizationId = session?.user?.organizationId»; `src/lib/actions/notifications.ts:48` — «const organizationId = session?.user?.organizationId»; `src/app/(protected)/dashboard/layout.tsx:74` — «resolveOrgId(),»; `src/lib/tickets/actions.ts:50` — «const organizationId = await resolveOrgId() const userId = session?.user?.id (en preview: org del cliente, autor SUPER_ADMIN, isAdmin false :77)»; `src/lib/recommendations/types.ts:56` — «* pre-llenado de /dashboard/messages. Sin 'organizationId' a propósito: la * acción resuelve la org desde la sesión, el cliente no puede targetear otra.»
- Impacto: En una sesion de soporte (SUPER_ADMIN impersonando) la pagina muestra al cliente pero Mensajes, Boveda→Solicitar documento, Oportunidades SEO, 'Ver todas las notificaciones', marcar leidas, Novedades, Referidos, Desbloquear modulo y Aprobar entrega fallan con 'Sesion invalida.'/'No autorizado.' (en el seed el SUPER_ADMIN no tiene membresia, prisma/seed.ts:80-100) o, si alguna vez la tuviera (auth.ts:37 take:1 sin orderBy), escribirian en esa otra org. Tickets y preferencias del reporte si usan resolveOrgId (tickets/actions.ts:50, executive-report-prefs.actions.ts:23): comportamiento inconsistente dentro del mismo portal.
- Propuesta: Una politica unica para escrituras en preview: resolveOrgId en todas (con el reparo D1-c3 de la cookie global) o deshabilitar explicitamente las escrituras en preview con aviso (como perfil/page.tsx:105-150). Decision para Valentino sobre dashboard-actions.ts (FROZEN: :14, :102, :190).
- Esfuerzo: M  ·  Zona: FROZEN
- Relacionado: [SEC-029], [BUG-022], [BUG-005]
- Nodo(s): h2.cli-mensajes, h2.cli-shell.campana-notificaciones, h2.cli-referidos, h2.cli-servicios.solicitar-modulo, h1.auth-impersonacion, lib.actions, lib.preview, h2.cli-mensajes.no-leidos-al-abrir, h2.cli-soporte, h2.cli-inicio.ideas-para-crecer
- REQUIERE-VERIFICACIÓN-HUMANA: VH-052

### [BUG-045] Handlers del portal sin manejo de excepciones ni confirmación: el modal de ticket y «Marcar como resuelto» quedan colgados, el resuelto no pide confirmación y otros fallos son silenciosos
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/components/dashboard/NewTicketModal.tsx:53` — «setIsSubmitting(true) const res = await createTicketAction(parsed.data)»; `src/components/dashboard/NewTicketModal.tsx:104` — «onClick={() => !isSubmitting && setIsOpen(false)}»; `src/components/dashboard/ResolveTicketButton.tsx:14` — «const res = await resolveTicketClientAction(ticketId) setIsPending(false) if (res.success) router.refresh()»; `src/app/(protected)/dashboard/_actions/executive-report-prefs.actions.ts:31` — «await prisma.organization.update({»; `src/components/dashboard/NotificationCenter.tsx:106` — «await markNotificationAsRead(id)»; `src/components/dashboard/ResolveTicketButton.tsx:16` — «if (res.success) router.refresh()»; `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:183` — «Si el problema persiste, por favor abrí un nuevo ticket.»; `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:181` — «Este ticket ha sido marcado como resuelto. ... Si el problema persiste, por favor abrí un nuevo ticket.»; `src/lib/tickets/actions.ts:208` — «if (!ticketId.trim()) return fail('Ticket inválido.')»
- Impacto: Ante una caida de red o un error del server action el cliente queda con el spinner infinito en 'Abrir Ticket' sin poder cerrar el modal; 'Marcar como resuelto' no informa el fallo (res.success false se ignora) y una excepcion lo deja deshabilitado; un error de DB al guardar la frecuencia del reporte reemplaza la pagina de Cuenta por el error boundary; las marcas de leido fallidas no avisan. Eslabon inferido: comportamiento de React ante el rechazo de la promesa.
- Propuesta: try/finally para resetear el estado pendiente y mostrar el error (toast o inline con role=alert); en ResolveTicketButton mostrar res.error; en saveExecutiveReportPrefs try/catch con mensaje generico y Sentry.captureException.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-soporte.crear-ticket, h2.cli-soporte.resolver-ticket, h2.cli-reportes-email.preferencias-reporte, h2.cli-shell.campana-notificaciones, h2.cli-soporte
- REQUIERE-VERIFICACIÓN-HUMANA: VH-053

### [BUG-048] Organization.dataConnections no tiene escritor: Health Score en 'calibrando' y 'develOP está conectando tus herramientas (0/6)' para siempre
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/health-score.ts:86` — «const connections: DataConnections = parseDataConnections(org.dataConnections) const { level, connectedCount, totalCount, percentage } = getConnectionLevel(connections)»; `src/lib/types/data-connections.ts:47` — «if (percentage < 30) level = 'ONBOARDING'»; `src/components/dashboard/home/HealthScore.tsx:31` — «if (data.level === 'ONBOARDING') { return <HealthScoreOnboarding data={data} />»; `src/lib/dashboard/attention.ts:119` — «description: 'develOP esta conectando tus herramientas (${connectedCount}/${totalCount} listas).',»; `src/lib/recommendations/get-recommendations-for-org.ts:53` — «gbpConnected: Boolean(gbpConnectedAt),»
- Impacto: Ningún código escribe dataConnections (solo el seed one-shot de defaults), así que todas las orgs quedan en 0/6 y nivel ONBOARDING aunque develOP les haya conectado Google Business (gbpConnectedAt, que sí usan las recomendaciones) o cargado analyticsPropertyId. El home muestra 'Estamos calibrando tu score' y 'Atención hoy' agrega un ítem falso perpetuo; el score calculado nunca se ve en la UI pero sí se le pasa al LLM ('Health Score: N/100') y al email: es la contradicción 'CALIBRANDO vs Brief 84' que registró Valentino. Además el tráfico GA4 solo suma si ga4.connected (health-score.ts:143), o sea nunca.
- Propuesta: Derivar el nivel de conexión de columnas reales (gbpConnectedAt/gbpLocationId, analyticsPropertyId, siteUrl, tokens de integraciones) en vez del JSON sin escritor, o escribirlo en los callbacks OAuth; mientras siga 'calibrando' en la UI, no mandar el total al brief ni al email.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [DEU-015]
- Nodo(s): h2.cli-inicio.health-score, h2.cli-inicio.atencion-hoy, h2.cli-inicio.resumen-ia, modelo.Organization, lib.health-score

### [BUG-049] El hero compara la semana en curso (parcial) contra la semana anterior completa
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/dashboard/home-metrics-logic.ts:27` — «current: weekRangeAR(now), previous: previousRangeForPeriod('week', now),»; `src/lib/dates-ar.ts:209` — «return { start: new Date(current.start.getTime() - 7 * DAY_MS), end: current.start }»; `src/lib/dashboard/home-metrics.ts:103` — «prisma.chatbotLead.count({ where: businessWhere(current) }), prisma.chatbotLead.count({ where: businessWhere(previous) }),»; `src/components/dashboard/home/BusinessHero.tsx:73` — «: (deltaPhrase(leads) ?? 'esta semana')}»
- Impacto: La pieza principal del home ('Leads esta semana') compara lunes 00:00 AR → ahora contra los 7 días completos anteriores: un lunes a la mañana con 2 leads contra 15 de la semana pasada el cliente lee '-13 vs la semana pasada'. El delta es negativo casi toda la semana aunque el ritmo sea igual; el doc de la función dice 'anterior equivalente' y no lo es.
- Propuesta: Comparar contra el mismo tramo de la semana anterior (inicio de semana −7 d hasta now −7 d) o mostrar la semana anterior completa sin delta hasta que cierre la actual; agregar el caso al invariante de home-metrics-logic.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio.semana-en-numeros, lib.dashboard

### [BUG-050] Facturación: 'Total mensual' con precio de catálogo y 'Próxima facturación' inventada (1° del mes siguiente)
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/billing/get-current-plan.ts:70` — «const monthlyTotal = modules.reduce( (sum, om) => sum + (om.module.priceMonthlyUsd ?? 0),»; `src/lib/billing/get-current-plan.ts:76` — «const nextBillingAt = modules.length > 0 ? new Date(now.getFullYear(), now.getMonth() + 1, 1) : null»; `src/lib/premium-modules.ts:125` — «priceLockedUsd: module.priceMonthlyUsd,»; `src/app/(protected)/dashboard/cuenta/facturacion/page.tsx:81` — «const renewalDate = subscription?.renewalDate ?? null»; `src/components/dashboard/CurrentPlanCard.tsx:179` — «{formatUsd(plan.monthlyTotal)}»
- Impacto: En Mi cuenta → Facturación el cliente puede ver dos fechas de cobro distintas en la misma página (renewalDate real y el 1° del mes siguiente calculado con la hora del server) y un 'Total mensual' que suma precios de lista actuales en lugar del precio bloqueado (priceLockedUsd), sin la mensualidad del plan del chatbot ni el priceOverride. Dato de facturación incorrecto frente al primer cliente.
- Propuesta: Tomar la fecha de Subscription.renewalDate/Invoice, sumar priceLockedUsd y la mensualidad efectiva del plan (Plan.monthlyPrice o priceOverride vigente), o rotular el bloque como 'módulos adicionales' sin fecha propia.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [FAL-006], [BUG-017]
- Nodo(s): h2.cli-cuenta, modelo.OrganizationModule, modelo.Subscription, lib.billing

### [BUG-054] La landing de upsell del chatbot sigue con precio falso y WhatsApp placeholder (CLEAN-H1 abierto)
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/components/dashboard/ChatbotUpsellLanding.tsx:15` — «const WHATSAPP_URL = 'https://wa.me/5493815555555?text=Hola%2C+quiero+saber+m%C3%A1s+sobre+el+chatbot'»; `src/modules/chatbot/components/dashboard/ChatbotUpsellLanding.tsx:148` — «$150 USD»; `src/modules/chatbot/components/dashboard/ChatbotUpsellLanding.tsx:152` — «Incluye 1.000 conversaciones · reportes semanales · soporte directo»; `src/lib/plan/plan-presentation.ts:149` — «monthlyPriceUsd: 49, customersPerMonth: 500,»; `src/app/(protected)/dashboard/chatbot/page.tsx:21` — «return <ChatbotUpsellLanding />»; `src/modules/chatbot/components/dashboard/ChatbotUpsellLanding.tsx:49` — «href={WHATSAPP_URL}»; `src/lib/whatsapp.ts:21` — «const FALLBACK_WHATSAPP_NUMBER = '5493816223508'»; `src/modules/chatbot/server/admin/clientHasChatbot.ts:6` — «where: { isActive: true },»; `src/app/(protected)/dashboard/chatbot/layout.tsx:52` — «: 'Pausado · no responde hasta que lo reactives'»; `prisma/seeds/sync-plans.ts:70` — «monthlyPrice: new Prisma.Decimal('49'), ... quota: 500, (Starter); Business :102 '150', quota 5000 :104»; `src/lib/whatsapp.ts:41` — «export function getWhatsappDigits(): string { ... NEXT_PUBLIC_WHATSAPP_NUMBER || FALLBACK_WHATSAPP_NUMBER»; `src/modules/chatbot/components/dashboard/ChatbotUpsellLanding.tsx:105` — «title="Insights semanales" ... 'Te llega un email todos los lunes' (Starter reportsEnabled: false, sync-plans.ts:76)»
- Impacto: Todo cliente sin chatbot activo ve 'Desde $150 USD / 1.000 conversaciones' (catálogo real: Starter USD 49 con 500, Business USD 150 con 5.000, prisma/seeds/sync-plans.ts:68-111) y el único CTA lleva a un número inexistente: el camino de venta del producto principal está roto y miente el precio. Bloquea L3 del chatbot ('sin datos de mentira').
- Propuesta: Leer precio y cupo de PLAN_PRESENTATIONS (o del Plan en base) y mandar el CTA a /dashboard/messages?context=activacion vía requestUpsellAction.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, h2.cli-plan, lib.plan, h3.cli-chatbot.activacion-upsell, lib.chatbot.admin, h3.cli-chatbot.upsell-activacion, modelo.Plan

### [BUG-055] El reporte semanal puede mandar un brief y métricas de semanas viejas con la etiqueta de la última semana
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/reports/executive-weekly/build.ts:113` — «const cachedBriefIsCurrent = isBriefCacheCurrent(org.cachedExecutiveBriefAt) let briefText = cachedBriefIsCurrent ? org.cachedExecutiveBrief?.trim() || '' : ''»; `src/lib/ai/executive-brief-input.ts:207` — «export function isBriefCacheCurrent(cachedAt: Date | null): boolean { return cachedAt !== null && cachedAt.getTime() >= BRIEF_LOGIC_CUTOFF.getTime()»; `src/lib/reports/executive-weekly/build.ts:122` — «const history = await getBriefHistory(organizationId, 2) const current = history[0] ?? null»; `src/lib/ai/brief-history.ts:30` — «const rows = await prisma.executiveBriefSnapshot.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' }, take,»; `src/lib/reports/executive-weekly/build.ts:168` — «weekLabel: formatWeekRangeLabel(weekRange.start, weekRange.end),»; `src/lib/ai/executive-brief.ts:18` — «const CACHE_TTL_DAYS = 7 (TTL que build.ts no aplica)»
- Impacto: Con el cron de briefs apagado en Netlify y Vertex vencido, el cache y el último snapshot pueden tener semanas; el mail (hoy disparable con 'Enviar ahora') presenta ese texto y esos números como 'tu semana del X al Y', y el delta de salud compara dos snapshots cualesquiera.
- Propuesta: Exigir que el snapshot usado sea del periodKey de la semana reportada (y el anterior, de la semana previa) y que el brief tenga a lo sumo 7 días; si no se cumple, regenerar o saltear con NO_DATA.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-reportes-email.reporte-semanal, h4.adm-clientes, modelo.ExecutiveBriefSnapshot, lib.reports, int.vertex
- REQUIERE-VERIFICACIÓN-HUMANA: VH-059

### [BUG-060] El resumen ejecutivo IA y los insights IA de Tráfico y SEO no consultan el plan: Starter los recibe (y el cron los regenera) aunque la vitrina de planes los vende como mejora a Pro
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/page.tsx:193` — «brief = await getExecutiveBrief(organizationId) // sin planAllows; el semaforo si lo tiene en :121»; `src/lib/ai/executive-brief.ts:96` — «const generation = await generateBriefText( // cache vencido: llama al LLM sin mirar el plan»; `src/app/(protected)/dashboard/_actions/regenerate-brief.ts:19` — «const result = await regenerateExecutiveBrief(orgId.data)»; `src/app/api/cron/regenerate-briefs/route.ts:29` — «subscription: { is: { status: 'ACTIVE' } }, // unico filtro junto a onboardingCompleted»; `src/lib/plan/plan-presentation.ts:154` — «{ icon: Sparkles, label: 'Resumen ejecutivo de tu negocio' }, // nextTierTeaser de STARTER»; `prisma/seeds/sync-plans.ts:77` — «insightEnabled: false, // plan STARTER (reportsEnabled: false en :76)»; `src/app/(protected)/dashboard/resultados/trafico/page.tsx:168` — «: await getTrafficInsights({»; `src/app/(protected)/dashboard/resultados/analisis/page.tsx:36` — «const showAnalysis = planAllows(plan, 'insight') // control: aca si hay gate»
- Impacto: Un primer cliente Starter ve en /dashboard/plan que el 'Resumen ejecutivo de tu negocio' es del plan siguiente, pero el Inicio se lo genera con LLM (gemini-2.5-flash), le deja regenerarlo 3 veces por semana y el cron semanal se lo rehace; Trafico y SEO le muestran insights de Claude Haiku. develOP paga el LLM de un beneficio que no cobra y el upsell a Pro pierde su argumento. El gate de 'analisis con IA' (insightEnabled) solo se aplica en Analisis y en el PDF mensual.
- Propuesta: Decidir si el brief y los insights son de todos los planes (y corregir plan-presentation.ts) o de Pro/Business. En el segundo caso, gatear del lado server con planAllows(plan, 'insight') (o reportEligiblePlan) en getExecutiveBrief/BriefServerWrapper, regenerateBriefAction, el cron regenerate-briefs y antes de getTrafficInsights/getSeoInsights, mostrando un teaser como AnalysisTeaser.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-043]
- Nodo(s): h2.cli-inicio.resumen-ejecutivo-ia, h2.cli-resultados.insights-ia, h2.cli-plan.vitrina-de-planes-y-upgrade, lib.plan, lib.ai, int.vertex, int.anthropic, int.cron.regenerate-briefs
- REQUIERE-VERIFICACIÓN-HUMANA: VH-062

### [BUG-061] Las bajas de un clic se ejecutan en el GET: un escáner de enlaces del correo da de baja al dueño del reporte semanal y a los contactos de las campañas sin que nadie haga clic
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/api/email/unsubscribe-executive/route.ts:103` — «export async function GET(request: Request) { return handle(request)»; `src/app/api/email/unsubscribe-executive/route.ts:77` — «data: { executiveReportOptOut: true },»; `src/app/api/email/optout/[contactId]/route.ts:93` — «data: { optedOut: true, optedOutAt: new Date() }, // dentro del GET de :69»; `src/lib/email/templates/executive-weekly.ts:289` — «<a href="${escapeHtml(input.unsubscribeUrl)}" ...>Dejar de recibir este reporte</a>»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:155` — «<a href="${appUrl}/api/email/optout/{{contact.CONTACT_ID}}?token={{contact.OPTOUT_TOKEN}}"»; `src/lib/reports/executive-weekly/build.ts:99` — «if (org.executiveReportOptOut || org.executiveReportFrequency === 'DISABLED') {»; `src/app/(protected)/dashboard/_actions/executive-report-prefs.actions.ts:41` — «...(parsed.data.frequency !== 'DISABLED' ? { executiveReportOptOut: false } : {}),»; `src/app/api/email/unsubscribe-executive/route.ts:75` — «await prisma.organization.update({ where: { id: orgId }, data: { executiveReportOptOut: true },»; `src/lib/reports/executive-weekly/build.ts:191` — «unsubscribeUrl: buildUnsubscribeUrl(organizationId),»; `src/app/api/email/optout/[contactId]/route.ts:91` — «await prisma.emailContact.updateMany({ where: { id: contactId }, data: { optedOut: true, optedOutAt: new Date() }, (dentro de GET, :69)»; `src/lib/email/unsubscribe-token.ts:63` — «return '${base}/api/email/unsubscribe-executive?org=${encodeURIComponent( organizationId, )}&token=${token}'»
- Impacto: Los filtros de correo corporativos (Microsoft Defender Safe Links, Mimecast, Proofpoint) abren cada enlace del mail al recibirlo. Con el primer cliente PRO/BUSINESS que use un correo asi, el primer reporte semanal lo da de baja solo: el lunes siguiente build.ts lo saltea por OPTOUT y Perfil muestra 'No recibir' sin que lo haya pedido; si lo reactiva, el proximo mail lo vuelve a dar de baja. En email marketing, los destinatarios detras de esos filtros quedan como 'Bajas' tras la primera campana (hoy ensucia el conteo porque la baja no llega a Brevo, BUG-021; al arreglar BUG-021 dejarian de recibir sin haberlo pedido). El comentario de route.ts:107 cita RFC 8058, que recomienda confirmar en la pagina justamente porque el antispam hace GET automatico.
- Propuesta: Separar los verbos en ambas rutas: el GET muestra una pagina con un boton 'Confirmar baja' (form POST) y no escribe; el POST (el que usan Gmail/Outlook con List-Unsubscribe-Post) hace la baja. Opcional: guardar fecha y origen de la baja para auditarla.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-007], [BUG-021]
- Nodo(s): h2.cli-reportes-email.reporte-semanal, h2.cli-reportes-email.preferencias-reporte, h2.cli-email-mkt.baja-de-contactos, h6.vis-optout, int.brevo, modelo.Organization, modelo.EmailContact, h2.cli-reportes-email, h2.cli-email-mkt
- REQUIERE-VERIFICACIÓN-HUMANA: VH-063

### [BUG-064] El alta 'org + bot' no mira si salió el mail de bienvenida, que es la única copia de la contraseña temporal
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/onboarding/core.ts:75` — «const tempPassword = generateTempPassword()»; `src/lib/onboarding/core.ts:198` — «emailSent: emailResult.ok,»; `src/app/(protected)/admin/chatbots/new/actions.ts:69` — «const result = await onboardClientCore({»; `src/app/(protected)/admin/chatbots/new/actions.ts:86` — «return { ok: true, botId: bot.id }»; `src/app/(protected)/admin/chatbots/new/CreateBotForm.tsx:79` — «toast.success('Chatbot creado')»
- Impacto: Si Brevo falla, el admin ve 'Chatbot creado' y el cliente no puede entrar: nadie conoce la contraseña. Reintentar el alta falla con 'El email ... ya está registrado' (core.ts:73). Si la función expira durante los reintentos de Brevo, la org quedó creada y el admin ve un error genérico.
- Propuesta: Propagar emailSent a la UI con aviso y botón de reenvío de credenciales; sacar el envío del camino crítico (cola o after()) con estado persistido.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.crear-bot, int.brevo, lib.onboarding

### [BUG-065] La burbuja del widget en el sitio del cliente ignora la posición y el color que el cliente configura, y el iframe se anuncia como 'Chat develOP'
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `public/widget.js:28` — «var position = scriptTag.getAttribute('data-position') || 'bottom-right'»; `public/widget.js:64` — «'background:#06b6d4;cursor:pointer;z-index:' + Z_BUBBLE + ';' +»; `src/modules/chatbot/components/installation/platforms.ts:27` — «return '<script src="${WIDGET_APP_URL}/widget.js" data-bot="${botSlug}" data-theme="dark"></script>'»; `src/modules/chatbot/server/dashboard/updateBotAppearance.ts:31` — «position: z.enum(BOT_POSITIONS).optional(),»; `public/widget.js:117` — «iframe.title = 'Chat develOP'»; `src/modules/chatbot/components/admin/config/tabs/BehaviorTab.tsx:34` — «<Field label="Prompts proactivos" hint="Mensajes por ruta. Usa / como default visual general.">»; `src/modules/chatbot/components/admin/config/tabs/BehaviorTab.tsx:41` — «<Field label="Mapa de color por ruta" hint="Permite contextualizar el color del widget por pagina">»; `src/modules/chatbot/components/tooltip/ProactiveTooltip.tsx:22` — «if (proactivePrompts['default']?.length) return proactivePrompts['default']»; `src/modules/chatbot/server/config/getPublicConfig.ts:121` — «routeColorMap: (bot.routeColorMap as unknown as RouteColorMap) ?? {},»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:296` — «onClick={() => chatbot.sendMessage(qr.promptToSend)}»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:269` — «<Sparkles size={20} strokeWidth={1.5} style={{ color: 'rgba(6,182,212,0.8)' }} />»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:537` — «: 'linear-gradient(135deg, rgba(6,182,212,0.85), rgba(6,182,212,0.65))',»; `src/modules/chatbot/components/chat/ChatWindow.tsx:116` — «const [ar, ag, ab] = hexToRgb(config.accentColor) ?? ACCENT_FALLBACK»; `public/widget.js:125` — «iframe.src =»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:298` — «background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.22)',»; `src/modules/chatbot/components/chat/ChatWindow.tsx:117` — «const secondaryRgb = config.accentSecondary ? hexToRgb(config.accentSecondary) : null (control: el widget de develOP si los aplica)»; `src/modules/chatbot/components/dashboard/BotPersonalization.tsx:165` — «toast.success('Cambios guardados. Tu chatbot ya se ve asi.')»
- Impacto: El cliente cambia la posición o el color en Mi Chatbot → Configuración, guarda, y en su sitio la burbuja sigue abajo a la derecha y cyan (solo cambia el contenido del iframe). Los lectores de pantalla anuncian 'Chat develOP' en el sitio del cliente. Es el patrón 'lo configuro y no se aplica' de los changelogs.
- Propuesta: Que widget.js lea position y accentColor de /config (o que el snippet incluya data-position) y use el nombre del bot o de la empresa como title.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente, h3.cli-chatbot.personalizacion, h3.adm-chatbots.editar-config-bot, modelo.BotConfig, h3.cli-chatbot, h3.vis-widget-cliente.chat-embebido, h3.cli-chatbot.instalacion
- REQUIERE-VERIFICACIÓN-HUMANA: VH-093

### [BUG-068] Ir a una seccion desde el chat recarga la pagina: la charla desaparece y el bot pierde el contexto
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/LogicCompanion.tsx:165` — «onNavigate: chatbot.navigateTo,»; `src/modules/chatbot/hooks/useChatbot.ts:583` — «const navigateTo = useCallback((path: string) => { if (typeof window === 'undefined') return window.location.href = path»; `src/modules/chatbot/hooks/useChatbot.ts:160` — «(proactive-* teaser bubbles don't count). In-memory only — resets on reload.»; `src/modules/chatbot/server/chat/handleChatRequest.ts:941` — «messages: body.messages.map((m): ModelMessage => {»; `src/modules/chatbot/components/tool-cards/renderToolCall.tsx:22` — «const navigateToPageSchema = z.object({ path: z.string(),»
- Impacto: En el sitio de develOP, cuando el bot ofrece 'te llevo a la seccion de IA' y el visitante toca el boton, la pagina se recarga entera sin la transicion del Shutter que CLAUDE.md exige para el sitio publico: el chat vuelve cerrado y vacio y reaparece el teaser; como el server arma el contexto con el historial que manda el widget, el siguiente mensaje llega sin historia aunque la conversacion siga en la base con el mismo sessionId. Ademas el cliente acepta cualquier string como destino (no espeja VALID_PATHS) y lo pasa a window.location.href (un 'javascript:' inyectado seria solo self-XSS).
- Propuesta: Navegar con triggerTransition() (sitio publico) manteniendo el widget montado; espejar VALID_PATHS en el validador del cliente; a mediano plazo historial autoritativo desde ChatMessage (PLAN-426).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop, lib.chatbot.hooks

### [BUG-069] 'Deshacer' no deshace el primer contacto: velocidad de respuesta y embudo cuentan contactos que no ocurrieron
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/dashboard/LeadStatusActions.tsx:8` — «// optimista (...) y un "Deshacer" inmediato // en el toast por si se equivoco de boton.»; `src/modules/chatbot/components/dashboard/LeadStatusActions.tsx:104` — «toast.success('Lo dejamos como estaba')»; `src/modules/chatbot/lead-status-rules.ts:55` — «return statusImpliesContact(nextStatus) && currentFirstContactedAt == null»; `src/modules/chatbot/server/admin/updateLeadStatus.ts:46` — «...(sealFirstContact ? { firstContactedAt: new Date() } : {}),»; `src/lib/dashboard/home-metrics-logic.ts:121` — «const wasContacted = statusImpliesContact(l.status) || l.firstContactedAt != null»; `src/lib/dashboard/home-metrics-logic.ts:71` — «(s) => s.firstContactedAt != null && s.firstContactedAt.getTime() >= s.capturedAt.getTime(),»
- Impacto: Si el dueno toca 'Lo contacte' por error y aprieta 'Deshacer' (el toast le dice 'Lo dejamos como estaba'), el lead vuelve a NEW pero queda sellado: el inicio y el reporte mensual (monthly-report-data.ts:95 reusa buildFunnel) lo cuentan como contactado y la velocidad de respuesta promedia un 'contacto' de segundos que no existio. Con pocos leads una sola equivocacion distorsiona la metrica que se le vende al cliente. El invariant lead-status-rules.invariant.ts:100-103 fija este comportamiento como deseado.
- Propuesta: Que el deshacer inmediato restaure el firstContactedAt previo (el action puede devolver el valor anterior y aceptar un flag de undo) o sellar con ventana de gracia; o decidir explicitamente la semantica y alinear el embudo (decision de producto).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, h2.cli-inicio, h2.cli-reportes-email, lib.chatbot.lead-status-rules, modelo.ChatbotLead

### [BUG-070] Cambio de estado del lead: 'Guardado' falso en el detalle y errores tecnicos en ingles en el toast
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/dashboard/LeadDetail.tsx:183` — «startTransition(async () => { await updateLeadStatus({ leadId: lead.id, status, notes }) setSavedAt(Date.now())»; `src/modules/chatbot/components/dashboard/LeadDetail.tsx:526` — «{savedAt && !isPending ? 'Guardado' : ''}»; `src/modules/chatbot/server/admin/updateLeadStatus.ts:19` — «if (!session) return { ok: false, error: 'No session' }»; `src/modules/chatbot/server/admin/updateLeadStatus.ts:33` — «return { ok: false, error: 'Lead not found or unauthorized' }»; `src/modules/chatbot/components/dashboard/LeadStatusActions.tsx:99` — «toast.error(res.error ?? 'No se pudo guardar el cambio')»; `src/modules/chatbot/server/admin/updateLeadStatus.ts:21` — «const parsed = UpdateLeadStatusSchema.parse(input)»; `src/modules/chatbot/components/dashboard/LeadDetail.tsx:184` — «await updateLeadStatus({ leadId: lead.id, status, notes }) setSavedAt(Date.now())»; `src/modules/chatbot/components/dashboard/LeadDetail.tsx:185` — «setSavedAt(Date.now())»
- Impacto: En el detalle, si la sesion vencio o el lead no pertenece a la org resuelta (p. ej. admin impersonando, porque getClientChatbotSession no honra la impersonacion), el boton dice 'Guardado' y las notas no se guardaron: el dueno pierde notas sin enterarse. En la lista, el toast le muestra 'No session' o 'Lead not found or unauthorized'. Un input invalido o un error de DB lanza dentro de la transicion y termina en el error boundary de la seccion en lugar de un mensaje.
- Propuesta: Chequear res.ok en LeadDetail y mostrar el error; mapear los errores del action a textos en castellano para el dueno; safeParse y try/catch con captureException en updateLeadStatus.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.admin, h3.cli-chatbot.contacto-detalle, h3.cli-chatbot.acciones-rapidas-lead, h3.cli-chatbot.estado-lead, modelo.ChatbotLead

### [BUG-071] El CSV de leads exporta la intencion como enum crudo (CLEAN-R1 sigue abierto) y con otro vocabulario que el panel
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/leads/csv/buildLeadsCsv.ts:37` — «const INTENT_LABELS: Record<string, string> = { // B5.1+ canon purchase_ready: 'Quiere comprar',»; `src/modules/chatbot/server/leads/csv/buildLeadsCsv.ts:82` — «function labelIntent(intent: string | null): string { if (!intent) return 'Sin especificar' return INTENT_LABELS[intent] ?? intent»; `src/app/api/dashboard/chatbot/leads/export/route.ts:156` — «intent: l.intent,»; `src/modules/chatbot/lead-intent-labels.ts:15` — «const INTENT_LABELS: Record<ChatbotLeadIntent, string> = { PURCHASE_READY: 'Listo para comprar',»; `src/modules/chatbot/server/leads/csv/buildLeadsCsv.ts:54` — «postventa: 'Postventa',»; `src/modules/chatbot/server/leads/csv/buildLeadsCsv.ts:39` — «purchase_ready: 'Quiere comprar',»; `src/modules/chatbot/server/leads/csv/buildLeadsCsv.ts:84` — «return INTENT_LABELS[intent] ?? intent»; `src/modules/chatbot/server/tools/captureLead.ts:371` — «const intentEnum = input.intent.toUpperCase() as ChatbotLeadIntent»; `src/lib/plan/lead-scoring-gate.invariant.ts:112` — «intent: 'purchase_ready',»
- Impacto: El dueno que descarga sus contactos ve 'PURCHASE_READY' o 'QUOTE_REQUEST' en la columna de intencion (el propio builder promete 'frase legible') y etiquetas distintas a las del panel ('Postventa'/'Otro' frente a 'Posventa'/'Otra consulta' de lead-detail-presentation.ts:48,52). Es el mismo bug que P1-fix arreglo en el panel, vivo en el export.
- Propuesta: Usar intentLabel() de lead-intent-labels.ts y categoryLabel() de lead-detail-presentation.ts en buildLeadsCsv, borrar los mapas locales y agregar el caso al invariant del CSV.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.leads, lib.chatbot.lead-presentation, modelo.ChatbotLead

### [BUG-073] Plantillas de KB con datos inventados y {{placeholders}} pasan el alta y el bot sale activo
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/components/admin/onboarding/kb-templates/generico.ts:28` — «Aceptamos efectivo, transferencia bancaria, tarjetas de débito y crédito. Para cuotas, usamos MercadoPago.»; `src/modules/chatbot/components/admin/onboarding/kb-templates/restaurant.ts:33` — «Sí, contamos con opciones vegetarianas y menú apto celíacos (cruzado en cocina aislada). Consultar al mozo.»; `src/modules/chatbot/components/admin/onboarding/kb-templates/generico.ts:4` — «businessInfo: '# {{NOMBRE_EMPRESA}}»; `src/modules/chatbot/components/admin/onboarding/Step3KnowledgeBase.tsx:26` — «state.businessInfo.length >= 20 &&»; `src/modules/chatbot/server/admin/createClientWithBot.ts:165` — «isActive: true,»; `src/modules/chatbot/server/admin/preflightChecks.ts:47` — «return !value || value.trim().length < 20»; `src/modules/chatbot/server/prompts/helpers.ts:48` — «return trimmed»; `src/lib/onboarding/core.ts:115` — «isActive: true,»; `src/modules/chatbot/server/admin/createBot.ts:73` — «isActive: false,»; `src/modules/chatbot/components/admin/onboarding/kb-templates/concesionaria.ts:10` — «**Dirección:** {{DIRECCION_COMPLETA}}',»; `src/modules/chatbot/components/admin/onboarding/kb-templates/concesionaria.ts:19` — «- Autos revisados por nuestro taller oficial, con garantía de 3 meses en motor y caja.»; `src/modules/chatbot/server/admin/createBot.ts:58` — «const template = getTemplate(resolvedIndustry)»; `src/modules/chatbot/components/admin/onboarding/kb-templates/concesionaria.ts:4` — «businessInfo: '# {{NOMBRE_CONCESIONARIA}}»
- Impacto: Bloqueante para el primer cliente real: si develOP crea el bot con el asistente y no reescribe a mano las 7 secciones, el bot queda activo y afirma a los visitantes políticas que el negocio no tiene (envíos a todo el país, 30 días de cambio, factura A y B, cocina aislada para celíacos, recargo del 10 %, cargo del 50 % por cancelar) o devuelve literales como {{DIRECCION_COMPLETA}}. El gate del paso 3 y el preflight sólo miden largo, y el armado del prompt pasa el texto tal cual. Riesgo comercial y legal (alérgenos, salud) sobre respuestas que el dueño no autorizó.
- Propuesta: Separar en las plantillas los ejemplos (guía, comentarios) del contenido afirmativo; bloquear en servidor la activación (createClientWithBot, toggleBotActiveAction, bulk y preflight) mientras queden {{...}} o secciones idénticas a la plantilla; crear el bot pausado desde el asistente y forzar el preflight; marcar en el paso 3 qué frases son de ejemplo.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.alta-cliente-con-bot, h4.adm-clientes.plantilla-kb-industria, h3.adm-chatbots.activar-bot-preflight, lib.chatbot.prompts, modelo.KnowledgeBase, h3.adm-chatbots.crear-bot, h3.adm-chatbots.activar-pausar-eliminar, lib.onboarding, modelo.BotConfig, h3.adm-chatbots, h3.adm-chatbots.crear-bot-org-existente, h3.adm-chatbots.preflight-activacion, lib.chatbot.admin
- REQUIERE-VERIFICACIÓN-HUMANA: VH-072

### [BUG-074] Sandbox 'Probar prompt': burbuja vacía si falla el proveedor y prueba distinta de producción
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/kb/TestPromptSandbox.tsx:46` — «message: userMsg.content,»; `src/modules/chatbot/components/admin/kb/TestPromptSandbox.tsx:160` — «{message.content || (streaming && index === messages.length - 1 ? '...' : '')}»; `src/app/api/admin/chatbot/test-prompt/route.ts:50` — «const rawModel = provider.getModel('gemini-2.5-flash')»; `src/app/api/admin/chatbot/test-prompt/route.ts:99` — «return result.toTextStreamResponse()»; librería ai@6.0.214, dist/index.mjs línea 6826 — «onError = ({ error }) => {»; librería ai@6.0.214, dist/index.mjs línea 8156 — «if (part.type === "text-delta") {»
- Impacto: Los errores que llegan dentro del stream (credencial vencida, cuota de Vertex, timeout) se descartan: textStream sólo deja pasar text-delta y el onError por defecto hace console.error crudo, fuera de Sentry. El admin ve una burbuja vacía. Además el sandbox manda sólo el último mensaje, fija proveedor y modelo, no pasa tools ni pack vertical: lo que se prueba no es lo que contesta el bot en producción.
- Propuesta: Pasar onError a streamText (Sentry + sanitizado) y devolver un marcador de error que el cliente muestre; enviar el historial de la prueba; resolver modelo, tools y pack con la misma lógica que el runtime.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.probar-prompt, lib.chatbot.llm, int.vertex, int.sentry
- REQUIERE-VERIFICACIÓN-HUMANA: VH-074

### [BUG-075] El preflight de activación sólo se respeta en el cliente: toggle, bulk y alta activan sin chequeos
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/activation/ActivationModal.tsx:137` — «disabled={!canActivate || loading}»; `src/app/(protected)/admin/chatbots/[botId]/actions.ts:44` — «data: { isActive: newActive },»; `src/app/(protected)/admin/chatbots/bulk-actions.ts:80` — «data: { isActive: true },»; `src/modules/chatbot/server/admin/preflightChecks.ts:170` — «export async function canActivate(checks: PreflightCheck[]): Promise<boolean> {»; `src/modules/chatbot/server/admin/createClientWithBot.ts:165` — «isActive: true,»
- Impacto: El modal deshabilita el botón con checks en rojo, pero toggleBotActiveAction no vuelve a correr el preflight, bulkActivateBotsAction activa en lote sin chequeos y el asistente crea el bot ya activo. Un bot sin KB o con bienvenida vacía puede quedar respondiendo en producción; canActivate no se usa del lado servidor.
- Propuesta: Mover la decisión al servidor: toggleBotActiveAction y bulkActivateBotsAction corren runPreflightChecks y rechazan con 'fail'; el asistente crea el bot pausado o pasa por el mismo preflight.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.activar-bot-preflight, lib.chatbot.admin, modelo.BotConfig

### [BUG-076] Alta de cliente: en producción el admin ve un error genérico en vez del motivo
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/createClientWithBot.ts:116` — «if (existingUser) throw new Error('El email ingresado ya está registrado en el sistema.')»; `src/modules/chatbot/server/admin/createClientWithBot.ts:104` — «if (!result.success) throw new Error(zodErrorToMessage(result.error))»; `src/modules/chatbot/server/admin/createClientOnly.ts:66` — «if (existingUser) throw new Error('El email ingresado ya está registrado en el sistema.')»; `src/modules/chatbot/components/admin/onboarding/Step5Review.tsx:111` — «setError(err instanceof Error ? err.message : 'Error al crear el cliente.')»; librería next@16.2.9, dist/compiled/next-server/app-page.runtime.prod.js línea 2 — «An error occurred in the Server Components render. The specific message is omitted in production builds»
- Impacto: Las acciones del alta lanzan con throw errores de negocio esperados; en un build de producción el mensaje llega reemplazado por uno genérico con digest. Con un email repetido o un dato inválido develOP ve 'An error occurred in the Server Components render…' y no sabe qué corregir; cada intento además cuenta como error.
- Propuesta: Devolver { ok: false, error } para los casos esperados (email existente, validación) y reservar throw para lo inesperado; el paso 5 ya muestra el texto.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.alta-cliente-con-bot, h4.adm-clientes.alta-cliente-sin-bot, lib.chatbot.admin, h3.adm-chatbots.alta-cliente-con-bot, h4.adm-clientes.alta-sin-bot
- REQUIERE-VERIFICACIÓN-HUMANA: VH-075

### [BUG-077] Alta con bot: la contraseña temporal sólo vuelve después del envío por Brevo
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/createClientWithBot.ts:123` — «const created = await unsafeGlobalQuery(»; `src/modules/chatbot/server/admin/createClientWithBot.ts:238` — «const emailResult = await sendTransactionalEmail({»; `src/modules/chatbot/server/admin/createClientWithBot.ts:265` — «tempPassword,»; `src/lib/email/brevo-service.ts:27` — «const result = await client.transactionalEmails.sendTransacEmail({»; `src/modules/chatbot/components/admin/onboarding/Step5Review.tsx:140` — «Password temporal — cópiala ahora, no se vuelve a mostrar»
- Impacto: La transacción ya commiteó org, usuario y bot; recién después se espera a Brevo (sin timeout propio) y a dos auditorías. Si la función expira o Brevo cuelga, el admin recibe un error, el cliente existe con una contraseña que nadie conoce y reintentar el alta falla por email duplicado. Nueva aparición del patrón ya visto en createClientOnly.
- Propuesta: Devolver las credenciales antes del email (enviarlo con after() o una cola) o acotar el envío con timeout; ofrecer 'reenviar credenciales' si falló.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.alta-cliente-con-bot, int.brevo
- REQUIERE-VERIFICACIÓN-HUMANA: VH-096

### [BUG-081] Sin error boundary local para los avatares 3D: un fallo de WebGL o del chunk diferido tumba el widget o la pagina, aunque AvatarRenderer documenta 'never throws'
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/avatar/AvatarRenderer.tsx:38` — «* Guarantee: this component never throws and never renders nothing.»; `src/modules/chatbot/components/avatar/HeavyAvatarsLazy.tsx:27` — «const NeuroAvatarImpl = dynamic(() => import('./NeuroAvatar').then((m) => m.NeuroAvatar), {»; `src/app/layout.tsx:137` — «<ChatWidgetMount />»; `src/components/layout/ChatWidgetMount.tsx:41` — «if (isChromeFree || !revealed) return null return <LogicCompanion slug={WIDGET_SLUG} />»
- Impacto: git grep de ErrorBoundary/getDerivedStateFromError en modules/chatbot, ChatWidgetMount y app/embed = 0 (control: AdminErrorBoundary.tsx existe). Con WebGL deshabilitado/bloqueado o ChunkLoadError, R3F/next-dynamic propagan el error: en el embed cae a app/error.tsx (iframe con pagina de error), en la config del admin/cliente al error.tsx del segmento; en el sitio de develOP el widget vive en el layout raiz (escalaria a global-error) aunque hoy su avatar es 'image' (HeavyAvatarsLazy.tsx:13-15).
- Propuesta: Envolver AvatarRenderer (o los wrappers Lazy) en un ErrorBoundary que caiga al Monograma, con captureException; detectar WebGL antes de montar el canvas.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente, h3.cli-chatbot, h3.adm-chatbots, int.sentry, h3.vis-widget-develop
- REQUIERE-VERIFICACIÓN-HUMANA: VH-084

### [BUG-084] El detalle del contacto nunca muestra la conversacion: filtra roles en minuscula contra el enum USER/ASSISTANT
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/components/dashboard/LeadDetail.tsx:546` — «const visible = messages.filter((m) => m.role === 'user' || m.role === 'assistant')»; `prisma/schema.prisma:152` — «enum ChatMessageRole { USER ASSISTANT»; `src/modules/chatbot/server/admin/multiTenantQueries.ts:170` — «select: { id: true, role: true, content: true, createdAt: true },»; `src/modules/chatbot/components/dashboards/ConversationsTable.tsx:204` — «// NO replicamos el filtro lowercase de LeadDetail (bug preexistente fuera de scope).»
- Impacto: En todo lead con conversacion guardada la seccion 'De que hablaron' muestra 'Esta conversacion tiene mensajes tecnicos pero ninguno del visitante...'. El dueno no puede leer que pidio el contacto antes de llamarlo, que es el corazon del detalle.
- Propuesta: Comparar contra el enum (normalizar a mayuscula como TranscriptDetail) o reusar TranscriptDetail; tipar role como ChatMessageRole para que el compilador lo atrape.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, h3.cli-chatbot.contacto-detalle, modelo.ChatMessage
- REQUIERE-VERIFICACIÓN-HUMANA: VH-086

### [BUG-086] Bot pausado: el cliente ve el header 'Pausado' y debajo la landing de venta, y no tiene como reactivarlo
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/admin/clientHasChatbot.ts:5` — «const bot = await forOrg(orgId).botConfig.findFirst({ where: { isActive: true },»; `src/app/(protected)/dashboard/chatbot/page.tsx:20` — «if (!hasActiveChatbot) { return <ChatbotUpsellLanding />»; `src/app/(protected)/dashboard/chatbot/layout.tsx:52` — «: 'Pausado · no responde hasta que lo reactives'»; `src/modules/chatbot/server/admin/saveClientSettings.ts:21` — «isActive: z.boolean().optional(), (se descarta: no se pasa en :40-47)»; `src/modules/chatbot/server/admin/clientHasChatbot.ts:6` — «where: { isActive: true },»
- Impacto: Un cliente cuyo bot se pausa (por develOP o por falta de pago) pierde su resumen y ve 'Un empleado virtual... Quiero activarlo' con precio falso, bajo un header que le dice 'Pausado... hasta que lo reactives', pero ningun control vivo permite reactivarlo (el unico toggle esta en ClientSettingsForm, muerto).
- Propuesta: Gatear el resumen por existencia de BotConfig (no por isActive) y mostrar un estado 'pausado' con motivo y CTA de contacto; ajustar el copy del layout a lo que el cliente realmente puede hacer.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot.resumen, h3.cli-chatbot.upsell-activacion, modelo.BotConfig, h3.cli-chatbot, lib.chatbot.admin, lib.preview
- REQUIERE-VERIFICACIÓN-HUMANA: VH-088

### [BUG-087] El embed manda siempre currentPath '/': ruta del lead, conversacion y prompt quedan en la home
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:27` — «const chatbot = useChatbot({ slug, currentPath: '/', attribution })»; `src/modules/chatbot/server/conversation/resolver.ts:101` — «currentPath: input.currentPath ?? null,»; `src/modules/chatbot/server/prompts/sections.ts:200` — «- Ruta del usuario: ${context.currentPath ?? 'no determinada'}»; `src/modules/chatbot/components/dashboard/LeadDetail.tsx:360` — «<dt ...>Estaba viendo</dt> ... {lead.conversation.currentPath}»
- Impacto: Para todos los visitantes de sitios de clientes el dueno ve '/' en 'Estaba viendo' y en la columna 'Ruta', y el modelo recibe 'Ruta del usuario: /' aunque el visitante este en la pagina de precios. El parentUrl ya llega en el handshake (ChatbotEmbed.tsx:79-80) y solo se usa para UTM.
- Propuesta: Derivar currentPath del pathname de parentUrl en el handshake y actualizarlo con mensajes de navegacion del host.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente.chat-embebido, h3.cli-chatbot.contacto-detalle, h3.cli-chatbot.conversaciones

### [BUG-088] Con el bot pausado, el embed muestra saludo y respuestas rapidas que mandan mensajes igual
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/hooks/useChatbot.ts:248` — «if (data?.paused) { ... reason: 'bot_paused',»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:240` — «{chatbot.messages.length === 0 ? (»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:296` — «onClick={() => chatbot.sendMessage(qr.promptToSend)}»; `src/modules/chatbot/components/chat/ChatWindow.tsx:285` — «{messages.length === 0 && !degraded ? ( (control: el widget de develOP si gatea)»
- Impacto: En el sitio de un cliente pausado el visitante ve saludo, chips y la tarjeta offline a la vez; tocar un chip manda un mensaje que el servidor rechaza (validate-origin.ts:67 bot_inactive). El arreglo A6 'offline muestra solo WhatsApp' no se porto al embed.
- Propuesta: Mismo gate que ChatWindow (!chatbot.degradedInfo) para el empty-state y los chips, y bloquear sendMessage cuando inputLockedByDegrade.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente.chat-embebido
- REQUIERE-VERIFICACIÓN-HUMANA: VH-088

### [BUG-091] Al llenarse el cupo se cortan también las conversaciones en curso, y la que tomó el último cupo recibe una sola respuesta
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/chat/handleChatRequest.ts:345` — «if (quota.conversationsUsed >= plan.quota) {»; `src/modules/chatbot/server/chat/handleChatRequest.ts:397` — «// Atomic reserve: solo para conversación nueva (mensaje en // convo existente no incrementa el contador, así que no necesita reserve).»; `src/modules/chatbot/server/quota/checker.ts:41` — «const conversationsUsed = usage?.conversationsCount ?? 0»
- Impacto: El gate optimista no distingue conversaciones nuevas de existentes. A fin de mes, un visitante en medio de una consulta que ya consumió su cupo recibe de golpe 'alcanzamos el límite del mes'; la conversación que reservó el último cupo (contador == cupo) se degrada en su segundo mensaje, así que el cliente paga un cupo por una sola respuesta.
- Propuesta: Aplicar el gate de cupo solo cuando isNewConversation; las conversaciones existentes siguen hasta el tope de 40 mensajes.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-api-chatbot, modelo.QuotaUsage

### [BUG-092] El turno del chat no tiene techo absoluto ni de salida: sin maxOutputTokens ni timeout total, dos arranques en frío más un tool o una respuesta larga superan los 30 s de maxDuration
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/chat/handleChatRequest.ts:952` — «temperature: 0.7, stopWhen: stepCountIs(3),»; `src/modules/chatbot/server/chat/handleChatRequest.ts:954` — «// MUDEZ (commit 1) — SIN 'timeout'.»; `src/modules/chatbot/server/chat/reconcile.ts:252` — «export const PROVIDER_STREAM_INITIAL_IDLE_MS = 12_000»; `src/modules/chatbot/server/chat/reconcile.ts:281` — «export const STREAM_WATCHDOG_TOOL_MAX_MS = 15_000»; `src/app/api/chatbot/[slug]/chat/route.ts:8` — «export const maxDuration = 30»; `src/modules/chatbot/server/chat/reconcile.ts:115` — «export const ROUTE_MAX_DURATION_MS = 30_000»; `src/modules/chatbot/server/chat/persistTurn.ts:389` — «// Ante un corte de Netlify (~10s) a mitad de la transacción, la»; `src/modules/chatbot/server/chat/reconcile.ts:267` — «export const STREAM_WATCHDOG_INITIAL_IDLE_MS = 12_000»; `src/modules/chatbot/server/chat/handleChatRequest.ts:987` — «experimental_onStepStart: () => { watchdogRef.current?.beginStep()»; `src/modules/chatbot/server/chat/handleChatRequest.ts:953` — «stopWhen: stepCountIs(3),»
- Impacto: Todas las ventanas son de inactividad, no relojes: hasta 12 s de silencio inicial por step, más hasta 15 s de tool, más otro arranque de 12 s, ya superan 30 s sin que nada corte. Sin maxOutputTokens, un pedido de respuesta larga (o una inyección) genera texto continuo que no dispara ningún idle. Si la plataforma mata la función, el turno no se persiste, el costo no se registra y la reserva de cupo no se compensa. Los comentarios no coinciden sobre el límite real (persistTurn habla de ~10 s, reconcile asume 30 s) y la constante está copiada a mano.
- Propuesta: Fijar maxOutputTokens (por plan, ver BUG-024) y un techo de pared global del run (AbortSignal con ROUTE_MAX_DURATION menos margen) que dispare el mismo camino del watchdog (persistir lo visto y la derivación); mover maxDuration a una constante compartida importable; verificar el timeout real de la función en Netlify.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-api-chatbot, lib.chatbot.chat, int.vertex, lib.chatbot.llm
- REQUIERE-VERIFICACIÓN-HUMANA: VH-090

### [BUG-093] Una respuesta del bot de más de 4000 caracteres deja la conversación en 400 en todos los turnos siguientes
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/chat/requestSchema.ts:48` — «role: z.enum(['user', 'assistant', 'system']), content: z.string().max(MAX_MESSAGE_CHARS),»; `src/modules/chatbot/hooks/useChatbot.ts:432` — «messages: trimHistory( msgs»; `src/modules/chatbot/shared/historyPolicy.ts:45` — «mensaje del historial que exceda el cap deja la conversación en 400 hasta que»; `src/modules/chatbot/server/chat/handleChatRequest.ts:140` — «return Response.json({ error: 'Invalid request body' }, { status: 400 })»
- Impacto: El tope de 4000 caracteres pensado para el input del visitante se aplica también a los turnos 'assistant' que el widget reenvía completos. Como el modelo no tiene maxOutputTokens, una respuesta larga (listado de servicios, comparación) hace que cada mensaje siguiente devuelva 400 hasta salir de la ventana de 30 mensajes, es decir, por el resto de la conversación (que se cierra a los 40). Es la 'conversación que muere' de C-1 por otra puerta.
- Propuesta: Validar el largo solo en mensajes 'user' y truncar (no rechazar) los 'assistant' en el server o en el widget; fijar maxOutputTokens acorde.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-api-chatbot, h3.vis-widget-cliente
- REQUIERE-VERIFICACIÓN-HUMANA: VH-100

### [BUG-096] Reporte semanal: el total de leads tiene tope 10 y el delta se calcula contra un conteo sin tope
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/reports/buildWeeklyReport.ts:67` — «take: 10,»; `src/modules/chatbot/server/reports/buildWeeklyReport.ts:120` — «total: leadsThisWeek.length,»; `src/modules/chatbot/server/reports/buildWeeklyReport.ts:121` — «deltaFromPrevWeek: percentChange(leadsLastWeekCount, leadsThisWeek.length),»
- Impacto: Un cliente con 25 leads esta semana y 25 la anterior recibe 'N=10 leads, -60%' y el resumen generado tambien usa 10. El primer cliente real veria su metrica principal subreportada justo cuando el bot rinde.
- Propuesta: Separar el count (scope.chatbotLead.count con el mismo where) de la lista de 10 items para el detalle.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.reports, int.cron.send-weekly-reports, modelo.ChatbotLead

### [BUG-097] El system prompt describe tools que el plan no habilita (Starter sin offer_handoff_options; '5 tools' vs '4 tools')
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/prompts/sections.ts:84` — «- offer_handoff_options se invoca SIEMPRE inmediatamente después de capture_lead exitoso.»; `prisma/seeds/sync-plans.ts:60` — «const STARTER_TOOLS = [ 'capture_lead', 'show_whatsapp_handoff', 'confirm_contact_request' ]»; `src/modules/chatbot/server/prompts/sections.ts:80` — «Tenés 5 tools — el SDK te pasa la descripción detallada de cada una»; `src/modules/chatbot/server/prompts/sections.ts:147` — «Tus únicas acciones reales son las 4 tools de la sección 4.»
- Impacto: buildToolsOverview ignora plan.tools y el gate C0.1: un bot Starter recibe la orden de invocar SIEMPRE una tool que no tiene, y todos los bots de clientes leen reglas de navigate_to_page. Con el modelo obedeciendo instrucciones contradictorias, el cierre tras capturar el lead puede quedar sin la tarjeta o sin texto para el plan de entrada.
- Propuesta: Pasar a buildSystemPrompt la lista efectiva de tools (Object.keys(tools)) y generar la seccion 4 solo con las presentes; unificar el conteo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-api-chatbot, lib.chatbot.prompts, lib.chatbot.tools

### [BUG-098] confirm_contact_request registra un evento que ninguna pantalla lee: el cliente no se entera del pedido de contacto
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/tools/confirmContactRequest.ts:85` — «export const CONTACT_REQUEST_EVENT_TYPE = 'handoff.callback'»; `src/modules/chatbot/server/admin/multiTenantQueries.ts:218` — «type: 'handoff.whatsapp',»; `src/modules/chatbot/server/logging/persistentLogger.ts:160` — «(c) => c.chatbotEvent.deleteMany({ where: { createdAt: { lt: threshold } } }),»
- Impacto: El bot le confirma al visitante que 'el equipo se va a comunicar', pero el pedido y el canal preferido viven solo en chatbot_events (que se purgan a 30 dias) y ningun listado los muestra. El dueno recibe el email del lead sin saber que pidio que lo llamen.
- Propuesta: Marcar el pedido en el lead (columna o metadata en ChatbotLead) o listar handoff.callback junto a las derivaciones, y destacarlo en el email del lead.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-api-chatbot, h3.cli-chatbot, lib.chatbot.tools, modelo.ChatbotEvent

### [BUG-099] Avisos post-lead fire-and-forget en serverless (email al cliente, CRM n8n, Telegram) sin outbox
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/tools/captureLead.ts:493` — «void notifyClient()»; `src/modules/chatbot/server/tools/captureLead.ts:500` — «void syncLeadToCrm({ leadId: result.id, trigger: 'auto' }).catch((err: unknown) => {»; `src/modules/chatbot/server/tools/showWhatsappHandoff.ts:164` — «void notifyTelegramOptional(tgMsg).catch((err: unknown) => {»; `src/app/(protected)/admin/chatbots/[botId]/actions.ts:75` — «sendTransactionalEmail({»; `src/app/(protected)/admin/chatbots/[botId]/actions.ts:83` — «}).catch((err: unknown) => {»; `src/modules/chatbot/server/tools/captureLead.ts:455` — «void notifyTelegramOptional(telegramMsg).catch((err: unknown) => {»; `src/modules/chatbot/server/admin/integrations/retryCrmSync.ts:73` — «void syncLeadToCrm({ leadId, trigger: 'manual' }).catch((err: unknown) => {»; `src/modules/chatbot/server/admin/integrations/retryCrmSync.ts:79` — «return { ok: true as const }»; `src/modules/chatbot/components/admin/integrations/RetrySyncButton.tsx:21` — «toast.success('Reintento disparado. En unos segundos se actualiza el historial.')»; `src/modules/chatbot/server/crm/getEffectiveSyncStatus.ts:6` — «* Si el proceso muere entre crear un CrmSyncAttempt PENDING y marcar SUCCESS/FAILED»; `src/modules/chatbot/server/crm/postToN8n.ts:7` — «Tiempo total peor caso: ~33s (3 × 10s + 1s + 3s). Como se corre en * fire-and-forget post-respuesta del bot, no impacta UX.»; `src/modules/chatbot/server/crm/syncLeadToCrm.ts:85` — «const attempt = await scope.crmSyncAttempt.create({»; `src/modules/chatbot/server/crm/getEffectiveSyncStatus.ts:33` — «if (elapsed > SYNC_STALE_THRESHOLD_MS) { return 'FAILED'»
- Impacto: Si el stream termina antes de que Brevo/n8n respondan (Brevo con reintentos largos), la plataforma congela la function y el email de nuevo lead al cliente o el sync al CRM pueden no salir nunca, sin reintento. El lead queda en el panel, pero el aviso que el cliente paga no.
- Propuesta: Outbox transaccional (fila escrita en la misma tx del lead) + cron con reintentos, o al menos await acotado antes de cerrar el step.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [BUG-052]
- Nodo(s): h3.vis-api-chatbot, lib.chatbot.tools, int.brevo, int.n8n, int.telegram, h3.adm-chatbots.activar-pausar-eliminar, h3.adm-chatbots.historial-sync-crm, lib.chatbot.crm, modelo.CrmSyncAttempt, h3.adm-chatbots.integracion-crm, h3.cli-chatbot
- REQUIERE-VERIFICACIÓN-HUMANA: VH-101

### [BUG-100] Telegram en Markdown legado con datos sin escapar y link relativo: avisos que Telegram rechaza en silencio
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/notifications/telegram.ts:117` — «await sendTelegram(message, { parseMode: 'Markdown' })»; `src/modules/chatbot/server/tools/captureLead.ts:449` — «email ? 'Email: ${email}' : '',»; `src/modules/chatbot/server/quota/upsellAlert.ts:82` — «(input.adminLinkPath ? '\n[Ver cliente](${input.adminLinkPath})' : ''),»; `src/modules/chatbot/server/chat/handleChatRequest.ts:383` — «adminLinkPath: '/admin/clients/${bot.organization.id}',»
- Impacto: Un email con guion bajo (juan_perez@...) o un nombre/resumen con * o _ rompe el parseo de entidades de Telegram (400) y el aviso de nuevo lead o de handoff al equipo se pierde, solo con console.error. El link de upsell es relativo, inutil fuera del sitio.
- Propuesta: Usar parse_mode HTML con escape (ya es el default de sendTelegram) o escapar Markdown; links absolutos con NEXT_PUBLIC_APP_URL.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.chatbot.tools, lib.chatbot.quota, int.telegram
- REQUIERE-VERIFICACIÓN-HUMANA: VH-102

### [BUG-102] La reconciliacion por telefono pisa identidades que nacieron con BSUID: un numero reciclado hereda la identidad y la conversacion de otra persona
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/motor/domain/identity.ts:57` — «const legacy = await db.contactIdentity.findFirst({ where: { channelType: 'WHATSAPP', waId: ref.phone, reconciledAt: null }, })»; `src/modules/motor/domain/identity.ts:61` — «const updated = await db.contactIdentity.update(legacy.id, { externalId: ref.bsuid, reconciledAt: new Date(),»; `src/modules/motor/domain/identity.ts:69` — «const created = await db.contactIdentity.upsertByExternalId({ channelType: 'WHATSAPP', externalId: ref.bsuid,»; `tests/integration/motor-inbound.spec.ts:239` — «expect(identity?.waId).toBe(phone) expect(identity?.reconciledAt).toBeNull()»; `src/modules/motor/adapters/whatsapp/inbound/handle-message.ts:72` — «const existing = await tx.motorConversation.findFirst({ where: { wabaChannelId, contactIdentityId, status: 'OPEN' },»
- Impacto: Afecta al primer negocio cliente. La identidad que se crea por la via normal queda con externalId=BSUID A, waId=P y reconciledAt=null (identity.ts:69-74; lo fija el test en spec:239-240). Si despues llega un BSUID B distinto con el mismo telefono P (numero reciclado, el caso que el docstring en identity.ts:11-13 dice cubrir), el paso 2 trata esa fila como legacy y le reescribe el externalId a B. Los mensajes de la persona nueva se suman a la conversacion OPEN de la anterior (handle-message.ts:72-80). Cuando exista B2, el bot le contestaria con el historial de otra persona. La persona original, si vuelve con su BSUID A, queda como identidad nueva y pierde su historial. Ademas, findFirst sin orderBy hace que la eleccion no sea deterministica si hay varias filas con ese waId.
- Propuesta: Tratar como legacy solo las filas cuyo externalId no sea un BSUID (por ejemplo !isBsuid(externalId) o externalId === waId), o marcar las altas nativas. Agregar a motor-inbound.spec.ts un caso: identidad nativa A con telefono P, despues B con telefono P; se espera que queden dos identidades.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp.identidad-bsuid, modelo.ContactIdentity, modelo.MotorConversation

### [BUG-108] Bot pausado: en produccion /config responde 403 y el visitante ve 'No pudimos conectar con el chat' en vez de la tarjeta de WhatsApp (B8.3 solo funciona en dev)
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/config/getPublicConfig.ts:124` — «paused: bot.isActive ? null : buildPausedInfo(bot),»; `src/app/api/chatbot/[slug]/config/route.ts:51` — «if (!origin && isSameOriginBypassApplicable() && isTrustedSameOrigin(request)) { if (!(await isBotServable(slug))) { return new Response(JSON.stringify({ error: 'Origin not allowed' }), {»; `src/app/api/chatbot/[slug]/config/same-origin.ts:72` — «return bot !== null && bot.isActive»; `src/lib/security/validate-origin.ts:67` — «if (!bot.isActive) return { allowed: false, reason: 'bot_inactive' }»; `src/lib/security/validate-origin.ts:56` — «allowed: process.env.NODE_ENV !== 'production',»; `src/modules/chatbot/shared/chatRetryPolicy.ts:68` — «if (status >= 400) return { kind: 'client-error', status, retryAfterMs: parseRetryAfterMs(retryAfter) }»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:177` — «if (!chatbot.config) { ... <ConfigLoadError onRetry={chatbot.retryLoadConfig} />»
- Impacto: El embed vive en develop.com.ar, asi que su GET a /config es same-origin y el navegador no manda Origin: en produccion entra por isBotServable, que exige isActive, y devuelve 403 (y validateOrigin hace lo mismo cross-origin). Cuando develOP pausa el bot de un cliente (impago, KB a corregir), el visitante del sitio del cliente ve un error de conexion con 'Reintentar' que parece una caida, en vez de la tarjeta 'fuera de servicio, escribinos por WhatsApp' que B8.3 diseno. En dev el GET sin Origin pasa (validate-origin.ts:56) y la tarjeta aparece, por eso no se noto. La premisa de BUG-088 (saludo y chips con el bot pausado) solo se reproduce en dev o con la config cacheada antes de pausar.
- Propuesta: Decidir una sola regla y pinnearla en el invariante fix-origin-same-origin: o /config sirve bots existentes inactivos (solo config con paused; el chat sigue cortando por bot_inactive), o el widget interpreta el 403 con reason bot_inactive como pausado. Hoy dos comentarios del repo afirman lo contrario uno del otro (getPublicConfig.ts:60 vs same-origin.ts:63-66).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente, h3.vis-api-chatbot, lib.security, lib.chatbot.config
- REQUIERE-VERIFICACIÓN-HUMANA: VH-107

### [BUG-109] Un turno vacío de Vertex en una conversación nueva se paga en Google pero no queda en la base: la compensación descarta la fila y persistTurn sale antes de sumar tokens y costo
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/chat/reconcile.ts:371` — «case 'empty_response':»; `src/modules/chatbot/server/chat/reconcile.ts:374` — «return input.toolCallCount === 0»; `src/modules/chatbot/server/chat/persistTurn.ts:340` — «compensate('empty_response', {»; `src/modules/chatbot/server/chat/persistTurn.ts:353` — «if (getConversationDiscarded()) {»; `src/modules/chatbot/server/chat/persistTurn.ts:359` — «turnDiscarded: true,»; `src/modules/chatbot/server/chat/persistTurn.ts:372` — «const costBreakdown = calculateCost(»; `src/modules/chatbot/server/chat/persistTurn.ts:460` — «await incrementQuota(»; `src/modules/chatbot/server/chat/handleChatRequest.ts:1171` — «tokensIn: hasSteps»
- Impacto: Con el primer cliente real, cada turno que Gemini cierra vacío en una conversación nueva (el bloque MUDEZ lo midió en producción) consume tokens que Google factura. onFinish trae el usage real (handleChatRequest:1171), pero la compensación borra la conversación y persistTurn vuelve en :353-365, antes de calculateCost (:372) y de incrementQuota (:460). El log chat.llm_request_finished de ese camino tampoco lleva tokensIn, tokensOut ni costUsd. QuotaUsage.costUsd y el costo por cliente que ve develOP subestiman el gasto real justo en los turnos anómalos, y no se puede conciliar contra la factura de GCP. Es otro camino que BUG-094 (watchdog) y DEU-048 (insights).
- Propuesta: Separar devolver el cupo de borrar el costo. Antes del early-return, sumar tokens y costo al QuotaUsage del período reservado (incrementQuota con isNewConversation:false, con su propio deadline) o como mínimo loguear tokensIn, tokensOut y costUsd en chat.llm_request_finished.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-094]
- Nodo(s): h3.vis-api-chatbot, h3.adm-chatbots, lib.chatbot.chat, lib.chatbot.quota, modelo.QuotaUsage, int.vertex

### [BUG-110] El cron de insights del chatbot no consulta el plan: llama a Vertex por los bots Starter y les manda 'N insights nuevos' que su plan no les deja ver
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/api/cron/generate-insights/route.ts:19` — «where: { isActive: true },»; `src/app/api/cron/generate-insights/route.ts:43` — «const result = await generateInsightsForBot(bot.organization.id, bot.id)»; `src/app/api/cron/generate-insights/route.ts:61` — «await sendInsightsNotificationEmail({»; `src/modules/chatbot/server/insights/generateInsights.ts:102` — «const { object } = await generateObject({»; `prisma/seeds/sync-plans.ts:77` — «insightEnabled: false,»; `src/lib/plan/fallback.ts:59` — «insightEnabled: false,»; `src/app/(protected)/dashboard/resultados/analisis/page.tsx:36` — «const showAnalysis = planAllows(plan, 'insight')»; `src/modules/chatbot/server/notifications/sendInsightsNotification.ts:48` — «Ver mis insights →»; `netlify.toml:26` — «schedule = "0 9 * * *"»
- Impacto: Un primer cliente Starter (o sin suscripción, que cae al plan fallback con insightEnabled en false) con 10 o más conversaciones en 30 días entra en el cron diario. Gemini le genera insights y le llega el mail 'N insights nuevos para <bot>' con el botón 'Ver mis insights'. En el panel no los encuentra: Análisis y el PDF mensual los ocultan por plan. Es una promesa rota que genera consultas de soporte, y develOP paga el LLM de un beneficio que no cobra. Como los PENDING nunca se resuelven (BUG-023), el gasto se corta al quinto pendiente, pero el mail ya salió. Es el mismo patrón que BUG-060 en un lugar que no cita.
- Propuesta: En el cron, resolver getPlanForOrg y saltear el bot (sin LLM ni mail) si planAllows(plan,'insight') es false. O decidir que los insights son de todos los planes y mostrarlos. Unificar la decisión con BUG-060.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-060]
- Nodo(s): int.cron.generate-insights, lib.chatbot.insights, lib.chatbot.notifications, h2.cli-resultados, int.vertex, int.brevo, modelo.ChatbotInsight

### [BUG-111] Alertas: la vista carga solo las 100 más recientes de cualquier estado y calcula filtros, contadores y triage sobre ese recorte (las pendientes viejas desaparecen)
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/manageAlerts.ts:25` — «take: 100,»; `src/app/(protected)/admin/alerts/AlertsClient.tsx:58` — «const totalPending = alerts.filter((a) => a.status === 'PENDING').length»; `src/app/(protected)/admin/layout.tsx:11` — «async () => prisma.botAlert.count({ where: { status: 'PENDING' } }),»; `src/modules/chatbot/server/admin/manageAlerts.ts:24` — «orderBy: { createdAt: 'desc' }, take: 100,»; `src/modules/chatbot/server/admin/manageAlerts.ts:16` — «...(filter?.status && { status: filter.status as never }),»; `src/app/(protected)/admin/alerts/page.tsx:5` — «const alerts = await listAlerts()»
- Impacto: Con más de 100 alertas, las PENDING más viejas no aparecen en ninguna columna ni en 'Ver todas' y no se pueden marcar ni resolver desde la UI; 'Totales pendientes', 'Críticas pendientes' y el tiempo promedio de resolución quedan subestimados y el badge del sidebar (que cuenta todas) no coincide con la página.
- Propuesta: Traer siempre todas las PENDING/ACKNOWLEDGED (o paginar por columna en el server), calcular los stats con count/aggregate en el server y bajar los filtros a listAlerts (PLAN-544).
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-alertas, h4.adm-alertas.triage, h4.adm-alertas.filtros-y-vista-completa, modelo.BotAlert, h4.adm-alertas.listado

### [BUG-112] Emails 'Acción requerida' de una tarea para aprobación: sin await, con fallback a localhost y fallos solo a console.error
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/actions/agency-actions.ts:74` — «// Fire and forget emails to each user»; `src/actions/agency-actions.ts:75` — «const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'»; `src/actions/agency-actions.ts:86` — «}).catch(console.error)»
- Impacto: El primer cliente real puede no recibir el email de que tiene una entrega para aprobar: la action devuelve antes de que salgan los envíos y en una función serverless las promesas pendientes pueden cortarse; si falta la variable, el link apunta a localhost; ningún fallo llega a Sentry. La notificación in-app sí se crea dentro de la transacción (:37-72).
- Propuesta: Esperar los envíos con Promise.allSettled (o encolarlos), registrar fallos con captureException y eliminar el fallback a localhost (fallar al arrancar si falta la URL).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-052], [BUG-099], [BUG-119], [UX-051]
- Nodo(s): h4.adm-clientes.tarea-para-aprobacion, h2.cli-proyecto, int.brevo, int.sentry
- REQUIERE-VERIFICACIÓN-HUMANA: VH-112

### [BUG-115] Billing override: precio vacio o por defecto aplica una cortesia de 0 USD por 90 dias en un clic
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideForm.tsx:33` — «const [price, setPrice] = useState<string>( currentPriceOverride !== null ? String(currentPriceOverride) : '0',»; `src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideForm.tsx:52` — «const priceNum = Number(price) if (Number.isNaN(priceNum) || priceNum < 0) {»; `src/app/(protected)/admin/clients/_actions/plan.schemas.ts:17` — «priceOverride: z.number().min(0).max(100_000),»
- Impacto: Si el admin borra el campo (Number('') = 0) o toca 'Aplicar override' sin cambiar el valor inicial, el cliente queda facturado en 0 USD hasta la fecha por defecto (+90 dias), sin confirmacion (BillingOverrideForm.tsx:141). Quitar el override si pide confirmacion; aplicarlo no.
- Propuesta: Campo de precio vacio por defecto y obligatorio; rechazar '' en cliente y servidor (precio requerido explicito); pedir confirmacion cuando el precio es 0 o menor al del plan, mostrando el monto y la fecha.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-134]
- Nodo(s): h4.adm-clientes.billing-override, modelo.Subscription, h2.cli-cuenta
- REQUIERE-VERIFICACIÓN-HUMANA: VH-116

### [BUG-116] No se puede cancelar un downgrade programado desde la UI
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentForm.tsx:37` — «const noChange = selectedKey === currentPlanKey»; `src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentForm.tsx:109` — «disabled={pending || noChange}»; `src/app/(protected)/admin/clients/_actions/plan.actions.ts:124` — «if (kind === 'unchanged') { // Limpia cualquier pending obsoleto que apunte a este mismo plan.»
- Impacto: Si se programa por error un downgrade, la unica rama que lo limpia (re-elegir el plan actual) esta bloqueada por el boton. El unico camino es un upgrade real (que resetea la cuota del mes, plan.actions.ts:206-208) y volver a bajar. Ademas esa rama no deja audit ni invalida cache (:124-132).
- Propuesta: Agregar en PlanAssignmentCard (junto al aviso de downgrade pendiente :62-75) un boton 'Cancelar downgrade' que llame a una action dedicada con audit; o permitir 'Sin cambios' cuando hay pendingPlan.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.plan, modelo.Subscription, lib.audit-log
- REQUIERE-VERIFICACIÓN-HUMANA: VH-117

### [BUG-119] Email al cliente por respuesta del admin: fire-and-forget sin after(), puede perderse en serverless
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/messages/_actions/message.actions.ts:193` — «queueAdminMessageEmail({ organizationId: parsed.organizationId, senderName: adminUser?.name ?? 'Equipo develOP',»; `src/app/(protected)/admin/messages/_actions/message.actions.ts:200` — «return ok({ id: message.id })»; `src/lib/email/admin-message-notification.ts:20` — «void (async () => {»
- Impacto: La action responde OK antes de que el email salga; en Netlify (funciones serverless) el trabajo pendiente después de la respuesta puede congelarse o cortarse. El primer cliente real puede no enterarse por email de que develOP le respondió, y nadie lo sabe: el resultado no vuelve a la action ni hay Sentry en este camino. No hay after()/waitUntil en todo src (git grep).
- Propuesta: Envolver el envío en after() de next/server (o await con timeout acotado) y capturar el fallo en Sentry; decidir si el aviso por email es parte del contrato con el cliente.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-052], [BUG-099], [BUG-112]
- Nodo(s): h4.adm-mensajes.responder, int.brevo, h2.cli-mensajes, modelo.Message
- REQUIERE-VERIFICACIÓN-HUMANA: VH-121

### [BUG-125] Un proyecto recién creado sin monto, lead ni horas queda oculto en el tablero por el filtro por defecto
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/projects/_components/projects-filters.ts:65` — «start: { period: '6m', from: '', to: '' },»; `src/app/(protected)/admin/projects/_components/projects-filters.ts:162` — «if (!startDate) { return false»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:382` — «if (candidates.length === 0) { return null»; `src/app/(protected)/admin/projects/_components/project-form.tsx:187` — «closeModal() router.refresh()»
- Impacto: Bloqueante menor para el primer cliente real. Si se da de alta su proyecto sin monto (o un proyecto interno), no hay hitos, horas, mantenimiento ni lead, y deriveProjectStartDate devuelve null. Con el filtro por defecto (Inicio: 6 meses) la card no aparece en Planning después de guardar: el contador sube pero el tablero no la muestra, y el alta parece fallida. Pasa lo mismo con proyectos convertidos de un lead creado hace más de 6 meses. El registro de cambios declara el fix ('if (!startDate) return true', Proyectos_ registro de cambios.md:15), pero no está en ningún branch.
- Propuesta: Que matchesStart trate startDate null como visible (o que el default de Inicio sea 'Todos'). Agregar un test del filtro con startDate null y corregir el registro de cambios.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-proyectos, h4.adm-proyectos.tablero-kanban, h4.adm-proyectos.alta-edicion, modelo.Project

### [BUG-126] Los hitos de pago se crean solo en el alta: si el monto se carga o cambia después no se crean ni se ajustan, y Pagos no tiene estado vacío
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/projects/_actions/project.actions.ts:620` — «await createDefaultMilestones(tx, createdProject.id, parsed.agreedAmount)»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:685` — «...(data.agreedAmount !== undefined ? { agreedAmount: data.agreedAmount } : {}),»; `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:127` — «<div className="mt-5 grid gap-4 lg:grid-cols-2"> {project.milestones.map((milestone) => (»
- Impacto: Si el proyecto del primer cliente se crea sin monto y el monto se carga al editarlo, nunca tendrá hitos de inicio y entrega. createDefaultMilestones solo se llama en :620 y :903, y no hay UI para crearlos. La pestaña Pagos muestra un bloque 'Hitos de desarrollo' vacío y sin explicación. Si el monto cambia, los hitos quedan con el 50/50 anterior y 'Hitos pagados' (page.tsx:307) y la card del tablero muestran montos que no coinciden con lo acordado.
- Propuesta: En updateProject, llamar a createDefaultMilestones cuando el proyecto no tenga hitos. Decisión para Valentino: si un cambio de monto recalcula los hitos no pagados. Agregar en Pagos una rama vacía con explicación.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-proyectos.pagos-hitos, h4.adm-proyectos.alta-edicion, modelo.OsPaymentMilestone

### [BUG-127] Una entrega con cambios pedidos por el cliente no se puede reenviar a aprobación desde el admin
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/projects/_components/task-list.tsx:618` — «if (task.approvalStatus || task.status !== 'DONE') { return null»; `src/actions/dashboard-actions.ts:135` — «approvalStatus: 'REJECTED',»; `src/lib/actions/projects.ts:194` — «data: { approvalStatus: 'PENDING_APPROVAL' },»
- Impacto: Cuando el primer cliente pide cambios en una entrega (flujo D2 'Aprobar o pedir cambios en una entrega'), el admin ve 'Cambios solicitados' y el motivo, pero el botón 'Enviar a aprobacion' no vuelve a aparecer. Ninguna escritura del repo vuelve approvalStatus a null ni re-envía una tarea REJECTED (ver ausencias). El ciclo pedir cambios, corregir y aprobar no se puede cerrar, y la tarea queda rechazada en el portal del cliente. La única salida es crear otra tarea.
- Propuesta: Mostrar el control también con REJECTED: el re-envío pasa la tarea a PENDING_APPROVAL y limpia rejectionReason. Alternativa: resetear approvalStatus cuando la tarea sale de DONE. En ambos casos, mirar el resultado de la action.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-062]
- Nodo(s): h4.adm-proyectos.aprobacion-entregas, h2.cli-proyecto, modelo.Task

### [BUG-128] Fechas sin hora guardadas como medianoche UTC se muestran un día antes en Argentina: entrega estimada, horas cargadas y fechas límite del plan y del billing override
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/projects/_actions/project.schemas.ts:23` — «const optionalDateSchema = z.preprocess(emptyValueToUndefined, z.coerce.date().optional())»; `src/app/(protected)/admin/projects/_components/project-card.tsx:111` — «}).format(new Date(value))»; `src/app/(protected)/admin/projects/_components/time-entry-panel.tsx:72` — «return new Date().toISOString().slice(0, 10)»; `src/app/(protected)/admin/projects/_components/projects-filters.ts:199` — «return time >= startOfToday().getTime() && (windowEnd ? time <= windowEnd.getTime() : true)»; `src/app/(protected)/admin/clients/_actions/plan.actions.ts:271` — «const overrideUntilDate = new Date(overrideUntil)»; `src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideForm.tsx:70` — «message: 'Override seteado: $${result.data.priceOverride} hasta ${new Date(result.data.overrideUntil).toLocaleDateString('es-AR')}',»; `src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentForm.tsx:58` — «const date = new Date(data.pending.effectiveAt).toLocaleDateString('es-AR')»; `src/app/(protected)/admin/team/_actions/time-entry.schemas.ts:33` — «const dateSchema = z.preprocess(emptyValueToUndefined, z.coerce.date())»; `src/app/(protected)/admin/team/_actions/time-entry.actions.ts:178` — «date: parsed.date,»; `src/app/(protected)/admin/projects/_components/time-entry-panel.tsx:68` — «}).format(new Date(value))»
- Impacto: Una entrega estimada del 20/10 se guarda como 2026-10-20T00:00Z. La card, formateada en un navegador en UTC-3, muestra '19 oct', mientras la ficha (formateada en el servidor) dice 20. El filtro 'Próxima semana' deja afuera una entrega de hoy. En Horas, después de las 21 h la fecha por defecto es la de mañana, y el schema de horas tiene el mismo patrón (time-entry.schemas.ts:33). Si el portal del cliente formatea igual, el cliente ve la fecha corrida.
- Propuesta: Parsear 'YYYY-MM-DD' como fecha calendario (mediodía UTC, o un helper de dates-ar) en project.schemas y time-entry.schemas, y formatear con timeZone 'America/Argentina/Buenos_Aires'.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [BUG-034], [BUG-113]
- Nodo(s): h4.adm-proyectos.tablero-kanban, h4.adm-proyectos.horas, modelo.Project, modelo.OsTimeEntry, h4.adm-clientes.billing-override, h4.adm-clientes.plan, h4.adm-clientes.tab-chatbot, h4.adm-proyectos.carga-horas, h4.adm-equipo.workload
- REQUIERE-VERIFICACIÓN-HUMANA: VH-123

### [BUG-129] Editar proyecto no permite vaciar campos opcionales (descripción, montos, entrega, servicio)
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/projects/_actions/project.schemas.ts:9` — «const trimmed = value.trim() return trimmed === '' ? undefined : trimmed»; `src/app/(protected)/admin/projects/_actions/project.schemas.ts:14` — «if (value === null || value === undefined || value === '') {»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:681` — «...(data.description !== undefined ? { description: data.description } : {}),»
- Impacto: Si en 'Editar' se borra la descripción, el monto acordado, el monthly rate o la entrega estimada y se guarda, no cambia nada: el string vacío pasa a undefined y updateProject saltea el campo. El admin cree que lo borró, pero el dato viejo sigue en la ficha, en los filtros y en el portal del cliente.
- Propuesta: En UpdateProjectSchema, distinguir 'no enviado' de 'vaciado' (null explícito para limpiar) y mapear null a la columna en updateProject.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-proyectos.alta-edicion, modelo.Project

### [BUG-130] Elegir el servicio de un proyecto activa un Service en la org del cliente y nunca desactiva el anterior
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/projects/_actions/project.actions.ts:279` — «if (!existingService) { await tx.service.create({»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:673` — «await syncOrganizationService(tx, organization, normalizedServiceType)»; `src/lib/billing/get-current-plan.ts:39` — «prisma.service.findMany({ where: { organizationId,»
- Impacto: Si el admin elige 'AI' por error y lo corrige a 'Web', el primer cliente queda con dos Service ACTIVE. Esos servicios se leen en Servicios (dashboard/services/page.tsx:173) y en Facturación (get-current-plan.ts:39), así que el cliente vería servicios que no contrató. Los proyectos internos también crean Services en la org develop.
- Propuesta: Decisión para Valentino: si la clasificación del proyecto debe sincronizar Service, hacerlo idempotente por proyecto y pausar el anterior; si no, separar la clasificación del proyecto del alta de servicios contratados.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-proyectos.alta-edicion, h2.cli-servicios, h2.cli-cuenta, modelo.Service
- REQUIERE-VERIFICACIÓN-HUMANA: VH-124

### [BUG-132] En mobile /contact no tiene formulario: el link de referido /contact?ref= no puede atribuir desde un teléfono
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/contact/page.tsx:119` — «className="relative hidden h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#031319]/84 p-5 md:p-6 lg:flex"»; `src/app/contact/page.tsx:148` — «<form action={action} className="grid grid-cols-2 gap-2"> <input type="hidden" name="referralCode" value={referralCode} />»; `src/app/contact/page.tsx:262` — «<div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:hidden">»
- Impacto: Debajo de 1024 px la sección que contiene el único formulario (y el campo oculto referralCode) está en display:none; en mobile solo quedan WhatsApp, llamada y email, que no llevan el código. La atribución ocurre solo en submitContactForm (src/lib/actions/contact.ts:68-69). Bloqueante para el primer cliente que comparta su link desde Referidos: los negocios que lo abran en el celular nunca quedan registrados y el mes bonificado no se gana. Además la página bloquea el scroll (page.tsx:77-94) y en desktops de poca altura el bloque del formulario puede recortarse (PROBABLE, caso manual).
- Propuesta: Mostrar el formulario también en mobile (o un CTA que lo despliegue) o propagar ?ref= al prefill de WhatsApp/email con otro camino de atribución; revisar el bloqueo de scroll en alturas bajas.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-052], [DEU-021]
- Nodo(s): h6.vis-contacto.formulario, h6.vis-contacto.captura-referido, h2.cli-referidos, modelo.Referral, modelo.ContactSubmission
- REQUIERE-VERIFICACIÓN-HUMANA: VH-126

### [BUG-133] La ficha del cliente mide la cuota del bot en tokens contra monthlyQuota×1000, pero monthlyQuota es el cupo de conversaciones
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/components/admin/managers/ChatbotManager.tsx:69` — «const maxTokens = botConfig.monthlyQuota * 1000»; `src/components/admin/managers/ChatbotManager.tsx:70` — «const usagePercentage = Math.min((currentQuota.tokensOut / maxTokens) * 100, 100)»; `src/modules/chatbot/server/quota/checker.ts:44` — «withinQuota: conversationsUsed < monthlyQuota,»
- Impacto: El admin ve 'Límite: 1.000.000' tokens y una barra casi vacía mientras el bot puede estar al 100 % de sus conversaciones y respondiendo degradado; no anticipa el QUOTA_EXHAUSTED ni ofrece el upgrade. Con monthlyQuota = 0 la barra calcula 0/0 y el ancho queda en NaN %.
- Propuesta: Mostrar conversationsCount / monthlyQuota (la métrica de checker.ts) y, si interesa, los tokens como dato aparte sin límite inventado; proteger la división por cero.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-024]
- Nodo(s): h4.adm-clientes, h4.adm-clientes.resumen-chatbot, lib.chatbot.quota, modelo.BotConfig

### [BUG-134] Guardar un precio de módulo con el campo vacío lo publica a USD 0 en el portal de clientes, sin confirmación
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/settings/_components/settings-console.tsx:140` — «const nextPrice = Number(pricingDrafts[moduleKey] ?? '')»; `src/app/(protected)/admin/settings/_actions/settings.schemas.ts:39` — «price: z.coerce.number().min(0, 'Ingresa un precio valido.'),»; `src/app/(protected)/admin/settings/_actions/settings.actions.ts:193` — «await prisma.premiumModule.update({ where: { id: moduleRow.id }, data: { priceMonthlyUsd: parsed.price },»
- Impacto: Number('') es 0 y el schema acepta 0: un clic en 'Guardar' con el input borrado deja el módulo a USD 0 en /dashboard/services (revalidatePath :199) y el toast dice 'Precio actualizado'. El primer cliente ve un módulo gratis y lo pide a ese precio.
- Propuesta: Rechazar el vacío en cliente y servidor (string no vacío antes del coerce, o .positive() si 0 no es válido), pedir confirmación del cambio de precio y auditarlo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-017], [BUG-115]
- Nodo(s): h4.adm-config.precios-modulos, modelo.PremiumModule, h2.cli-servicios

### [BUG-135] 'Enviar reportes ahora' reenvía el reporte semanal a todos los clientes en cada clic: sin confirmación, sin deduplicación por semana y sin rate limit
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/settings/reports/ReportSettingsClient.tsx:34` — «const res = await fetch('/api/admin/reports/send-now', { method: 'POST' })»; `src/app/api/admin/reports/send-now/route.ts:12` — «const results = await sendWeeklyReports()»; `src/modules/chatbot/server/reports/sendWeeklyReports.ts:63` — «const result = await sendTransactionalEmail({»
- Impacto: Cada clic (o el cron del lunes más un clic) manda otro email a cada cliente con bot activo: sendWeeklyReports no mira REPORT.WEEKLY_SENT antes de enviar. El envío es secuencial dentro del request y puede cortarse por timeout a mitad. A diferencia de send-executive-report (route.ts:35, applyAuthRateLimit), este endpoint no tiene límite. El primer cliente recibe el mismo reporte varias veces.
- Propuesta: Confirmación 'Vas a mandar N emails'; deduplicar por bot y semana (evento o periodKey como el reporte ejecutivo); rate limit por admin; mover el envío a un job o paginarlo.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [BUG-026]
- Nodo(s): h4.adm-config.reportes-semanales, int.brevo, int.cron.send-weekly-reports, lib.chatbot.reports, modelo.ChatbotEvent

### [BUG-138] El hard-delete y el archivado no protegen la org de la agencia (develOP), que aparece como un cliente más
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/page.tsx:22` — «prisma.organization.findMany({ where: { deletedAt: null },»; `src/app/(protected)/admin/projects/page.tsx:11` — «where: { slug: { not: 'develop' } },»; `src/modules/chatbot/server/admin/hardDeleteClient.ts:141` — «await tx.organization.delete({ where: { id: organizationId } })»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:527` — «confirmPhrase="ELIMINAR"»; `src/app/(protected)/admin/chatbot/activity/page.tsx:11` — «prisma.botConfig.findUnique({ where: { slug: 'develop' }, ...»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:233` — «where: { slug: 'develop' },»
- Impacto: La lista de Clientes trae todas las orgs no archivadas, sin excluir la de la agencia, al revés que Proyectos, que sí la excluye. Ni hardDeleteClient ni archiveClient la bloquean del lado del servidor, y la confirmación pide tipear 'ELIMINAR', no el nombre del cliente. Un error del SUPER_ADMIN (elegir la fila de develOP y confirmar) borra en cascada el bot del sitio con sus conversaciones y leads, todos los proyectos internos con sus hitos de pago y horas, más tickets y mensajes. Sin backups (DR-01) no hay vuelta atrás. Además, el widget del sitio, /admin/chatbot/activity y health, que buscan slug 'develop', y el alta de proyectos internos (project.actions.ts:233) dejan de funcionar. Antes del primer cliente real, es el borrado irreversible más grande al que el panel está expuesto.
- Propuesta: Rechazar en el servidor el archivado y el hard-delete de la org de la agencia (slug 'develop' o un flag isAgency) dentro de hardDeleteClient/archiveClient. Excluirla de /admin/clients igual que hace projects/page.tsx:11. Pedir que se tipee el nombre o el slug del cliente en vez de una frase genérica. Exigir que el cliente esté archivado antes del hard-delete. Resolver DR-01 (backups).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-015], [DEU-064]
- Nodo(s): h4.adm-clientes, h4.adm-clientes.eliminar-definitivo, h4.adm-clientes.archivar, modelo.Organization, h3.vis-widget-develop, h4.adm-proyectos
- REQUIERE-VERIFICACIÓN-HUMANA: VH-130

### [BUG-139] Form de contacto: el rate limit consulta la DB fuera del try y un fallo de Neon tira la página de error en vez del mensaje
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/contact.ts:24` — «const rl = await checkRateLimit({ key: 'contactFormPerIp:${ipHash}',»; `src/lib/actions/contact.ts:61` — «try {»; `src/lib/rate-limit/limiter.ts:44` — «const rows = await prisma.$queryRawUnsafe<UpsertRow[]>(»; `src/lib/prisma.ts:6` — «globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })»
- Impacto: El upsert del rate limit no tiene catch (limiter.ts:44) y en contactFormAction corre antes del try (:61). Si Neon tarda en despertar o la conexión falla, la action lanza la excepción, useActionState la propaga al error boundary y el visitante ve la pantalla de error en vez de 'No se pudo enviar el formulario'. Es el formulario con el que entran los leads de develOP, y no hay retry ni connect_timeout en prisma.ts.
- Propuesta: Mover getClientIpHash/checkRateLimit adentro del try, o envolverlos con un mensaje útil y captureException. Evaluar retry corto ante cold-start (RESIL-07).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-025]
- Nodo(s): h6.vis-contacto.enviar-formulario, lib.rate-limit, lib.prisma
- REQUIERE-VERIFICACIÓN-HUMANA: VH-131

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
- Evidencia: `prisma/migrations/20260512150823_chatbot_init/migration.sql:142` — «CREATE UNIQUE INDEX "chatbot_conversation_sessionId_key" ON "chatbot_conversation"("sessionId");»; `src/modules/chatbot/hooks/useChatbot.ts:27` — «const existing = window.sessionStorage.getItem('chatbot:sessionId')»; `src/modules/chatbot/server/conversation/resolver.ts:133` — «// p.ej. la colisión cross-bot del sessionId global (@unique sin»; `prisma/schema.prisma:1375` — «sessionId String @unique»; `src/modules/chatbot/server/conversation/resolver.ts:137` — «if (!adopted) throw error»
- Impacto: Si alguien usa el chat de un bot y después el de otro bajo el mismo origen (por ejemplo, el equipo probando /embed/<slug> de dos clientes en la misma pestaña), el segundo create da P2002, la adopción scopeada no encuentra fila (resolver.ts:137 relanza) y el chat del segundo bot falla. No mezcla datos entre tenants.
- Propuesta: Guardar el sessionId por slug en el widget (clave con el slug) como arreglo libre; a mediano plazo unique compuesto (botConfigId, sessionId) (schema FROZEN, decisión para Valentino).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): modelo.Conversation, h3.vis-widget-cliente, h3.vis-api-chatbot, h3.vis-widget-develop, lib.chatbot.hooks, lib.chatbot.conversation
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
- Evidencia: `src/modules/motor/adapters/whatsapp/inbound/handle-status.ts:53` — «const currentRank = STATUS_RANK[message.status]»; `src/modules/motor/adapters/whatsapp/inbound/handle-status.ts:58` — «await scope.motorMessage.update(message.id, { status: next })»; `src/modules/motor/services/sendMessage.ts:248` — «await scope.motorMessage.update(messageId, { status: 'SENT', providerMessageId: result.wamid })»; `src/modules/motor/adapters/whatsapp/inbound/process.ts:163` — «next = addTo(next, 'statusesSkipped')»; `src/modules/motor/services/sendMessage.ts:113` — «if (channel === null || channel.apiKeyEncrypted === null || channel.apiKeyIv === null || channel.apiKeyTag === null) {»; `src/modules/motor/adapters/whatsapp/inbound/handle-request.ts:39` — «if (channel.status === 'INACTIVE') {»; `src/modules/motor/adapters/whatsapp/inbound/handle-status.ts:41` — «const message = await scope.motorMessage.findFirst({ where: { providerMessageId: status.id, direction: 'OUT' },»
- Impacto: Hoy latente: sendMotorMessage no tiene llamadores hasta B2. Cuando se conecte: dos webhooks concurrentes (delivered y read) pueden dejar el mensaje en DELIVERED después de READ o pisar un FAILED; un status que llega antes de que se guarde el wamid se descarta como unknown-message sin reintento; si la función muere entre la aceptación del BSP y el update, el mensaje queda PENDING para siempre con la clave de idempotencia quemada; y un canal INACTIVE (solo se chequea en la entrada) o reportado BANNED/RESTRICTED sigue despachando, justo lo que la alerta de calidad de Meta quería evitar.
- Propuesta: Aplicar el status con updateMany condicional (where status en rangos menores y distinto de FAILED); correlacionar el wamid antes del despacho o reintentar el lookup; marcar como desconocidos los PENDING viejos; chequear status y channelStatus en resolveTargets antes de enviar.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp, modelo.MotorMessage, modelo.WabaChannel, lib.motor, h3.vis-whatsapp.estados-entrega

### [BUG-028] Reconocer una alerta del chatbot no la silencia: el detector solo deduplica contra PENDING de las últimas 24 h y la vuelve a crear con email y Telegram
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/detectBotIssues.ts:250` — «status: 'PENDING', createdAt: { gte: new Date(Date.now() - ONE_DAY_MS) },»; `src/modules/chatbot/server/admin/detectBotIssues.ts:267` — «const emailResult = await sendAlertEmail(issue)»; `src/modules/chatbot/server/admin/manageAlerts.ts:46` — «status: 'ACKNOWLEDGED', acknowledgedAt: new Date(),»
- Impacto: Latente mientras el detector no tenga disparador (D7); en cuanto corra periódicamente, marcar como vista una alerta de un problema que sigue activo (cuota agotada, errores del proveedor) hace que la corrida siguiente cree otra PENDING y mande otro email y otro Telegram; lo mismo a las 24 h con una PENDING. Además, reconocer una alerta ya resuelta la reabre como ACKNOWLEDGED conservando resolvedAt.
- Propuesta: Deduplicar contra alertas abiertas (PENDING y ACKNOWLEDGED) del mismo bot y tipo, y aceptar el reconocimiento solo desde PENDING con updateMany condicional.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-alertas, modelo.BotAlert, int.cron.detect-bot-issues, int.telegram

### [BUG-043] Módulo DEPRECATED que el cliente tiene activo desaparece de 'Tus módulos'
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/services/page.tsx:179` — «status: { in: ['ACTIVE', 'COMING_SOON'] },»; `src/lib/modules/showroom.ts:32` — «if (orgModuleStatus === 'ACTIVE' || orgModuleStatus === 'PAUSED') return 'owned'»; `src/app/(protected)/dashboard/layout.tsx:57` — «where: { organizationId: orgId, status: 'ACTIVE' },»
- Impacto: Si develOP discontinúa un módulo que un cliente sigue pagando, deja de figurar en Servicios aunque el menú lateral lo siga mostrando (layout.tsx:53-62). Incoherencia visible.
- Propuesta: Decisión de Franco: traer DEPRECATED en la query y clasificarlo owned si la org lo tiene ACTIVE/PAUSED.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-servicios.vitrina-modulos, modelo.PremiumModule, modelo.OrganizationModule

### [BUG-046] CTAs que llevan a Mensajes con un contexto que Mensajes ignora (?prefill=conexiones, context=bot-activation): el composer queda vacío
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/OnboardingStatusCard.tsx:97` — «href="/dashboard/messages?prefill=conexiones"»; `src/components/dashboard/MessageThread.tsx:73` — «const context = searchParams.get('context')»; `src/lib/data/message-context.ts:2` — «activacion:»; `src/components/dashboard/plan/UsageMeter.tsx:119` — «featureKey="bot-activation"»; `src/components/dashboard/plan/UpgradeCtaButton.tsx:82` — «const targetHref = '/dashboard/messages?context=${resolvedFeatureKey}'»; `src/lib/data/message-context.ts:56` — «let template = MESSAGE_CONTEXTS[context] ?? ''»; `src/modules/chatbot/components/dashboard/ClientKnowledgeView.tsx:157` — «href="/dashboard/messages?context=knowledge"»; `src/modules/chatbot/components/dashboard/CrmStatusIndicator.tsx:55` — «href="/dashboard/messages?context=crm" (igual :92, :127)»
- Impacto: El cliente en onboarding llega a Mensajes con el composer vacio en lugar del mensaje preparado sobre sus conexiones.
- Propuesta: Cambiar a ?context=activacion (la clave existente).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio.estado-onboarding, h2.cli-mensajes, h2.cli-plan, h3.cli-chatbot.base-conocimiento, h3.cli-chatbot.estado-crm

### [BUG-051] 'Resultados de la semana': visitas fijas en 0, ventanas en milisegundos y centinela +100 % que el LLM narra como suba
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/dashboard/week-results.ts:41` — «Promise.resolve(0), Promise.resolve(0),»; `src/lib/dashboard/week-results.ts:28` — «const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)»; `src/lib/dashboard/week-results.ts:109` — «if (previous === 0) return current > 0 ? 100 : 0»; `src/lib/ai/executive-brief-input.ts:143` — «return '${metric.delta > 0 ? 'subió' : 'bajó'} ${magnitude}% vs la semana anterior'»
- Impacto: La tarjeta Visitas siempre muestra '—' 'Sin integración aún' aunque la org tenga analyticsPropertyId; con semana previa en 0 el delta se informa como +100 % y el brief le dice al dueño 'subió 100%'; la ventana móvil de 7×24 h no coincide con la semana AR del hero, así que el mismo home muestra dos 'semanas' distintas.
- Propuesta: Ocultar Visitas hasta cablear GA4; devolver null ('nuevo') cuando la base es 0; migrar a weekRangeAR, o retirar WeekResultsGrid en favor del hero org-scoped y reapuntar brief y email a home-metrics.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio.resultados-semana, h2.cli-inicio.resumen-ia, lib.dashboard

### [BUG-052] sendAgencyAlert sin await dentro de server actions (fire-and-forget en serverless)
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/actions/upsell.ts:99` — «sendAgencyAlert({ type: 'LEAD_UPSELL',»; `src/lib/actions/upsell.ts:104` — «}).catch(() => {})»; `src/lib/actions/messages.ts:163` — «}).catch(() => {})»; `src/lib/actions/contact.ts:72` — «sendAgencyAlert({ type: 'LEAD_EXTERNAL',»; `src/lib/actions/contact.ts:77` — «}).catch(() => {})»; `src/lib/actions/contact.ts:95` — «console.error('contactFormAction error:', error)»
- Impacto: En Netlify la función puede congelarse al devolver la respuesta y el fetch al webhook (alerts.ts:131-137, timeout 8 s) quedar sin completar: el pedido de upsell o el mensaje del cliente llega a la base pero develOP no recibe el aviso.
- Propuesta: Usar after() de next/server para el envío o await con el timeout existente.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): int.webhook-alertas, lib.actions, h6.vis-contacto.enviar-formulario, int.sentry, int.n8n
- REQUIERE-VERIFICACIÓN-HUMANA: VH-058

### [BUG-053] Health Score: SEO siempre null (placeholder) y tareas en curso vencidas contadas dos veces
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/health-score.ts:265` — «// Placeholder — will connect to Search Console API in a future iteration»; `src/lib/health-score.ts:396` — «status: { in: ['TODO', 'IN_PROGRESS'] },»; `src/lib/health-score.ts:406` — «const total = done + inProgress + overdue»
- Impacto: La dimensión Digital nunca suma SEO; una tarea IN_PROGRESS vencida cuenta como sana y como vencida a la vez, distorsionando la dimensión Operativa que alimenta el número del brief y del email.
- Propuesta: Excluir la métrica SEO del denominador de forma explícita o cablearla; contar las vencidas fuera de inProgress.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio.health-score, lib.health-score

### [BUG-056] Ticket.updatedAt no se toca al responder: la lista ordena mal y un cliente activo puede figurar como inactivo
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/tickets/actions.ts:140` — «const message = await prisma.ticketMessage.create({ data: { content: ..., ticketId: ..., userId, isAdmin },»; `src/app/(protected)/dashboard/soporte/page.tsx:23` — «orderBy: { updatedAt: 'desc' },»; `src/lib/alerts.ts:97` — «organization.tickets[0]?.updatedAt,»
- Impacto: Un ticket con respuestas nuevas no sube en la lista del cliente ni del admin, y un cliente que solo conversa por tickets suma alertas de 'Cliente inactivo'.
- Propuesta: Crear el mensaje a través de ticket.update({ data: { messages: { create }, updatedAt: new Date() } }) o en una $transaction.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-soporte, h4.adm-tickets, h4.adm-alertas, modelo.Ticket, modelo.TicketMessage

### [BUG-057] El reporte va a un solo admin elegido sin orden (take: 1 sin orderBy)
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/reports/executive-weekly/build.ts:78` — «members: { where: { role: 'ADMIN' }, include: { user: { select: { email: true, name: true } } }, take: 1, },»; `src/lib/reports/executive-weekly/build.ts:103` — «const primary = org.members[0]?.user»
- Impacto: Con dos o más admins en la org, el destinatario puede variar entre corridas y el resto nunca recibe el reporte.
- Propuesta: orderBy createdAt asc o un destinatario explícito; evaluar enviar a todos los ADMIN.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-005]
- Nodo(s): h2.cli-reportes-email.reporte-semanal, modelo.OrgMember, lib.reports

### [BUG-058] Top de leads calientes: rankea solo los 50 más recientes y el mail dice 'Tus 3' aunque el dueño eligió 5 o 10
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/reports/executive-weekly/top-hot-leads.ts:91` — «orderBy: { capturedAt: 'desc' }, take: 50,»; `src/lib/reports/executive-weekly/top-hot-leads.ts:129` — «.slice(0, safeLeadCount)»; `src/lib/email/templates/executive-weekly.ts:139` — «Tus 3 leads más calientes de la semana»; `src/app/(protected)/dashboard/_actions/executive-report-prefs.schemas.ts:15` — «leadCount: z.union([z.literal(3), z.literal(5), z.literal(10)], {»
- Impacto: Con más de 50 leads en la semana, un lead de score alto del lunes puede quedar afuera del ranking; el título del bloque contradice la cantidad configurada por el cliente.
- Propuesta: Traer todos los leads con score de la semana (u ordenar por score en la base) antes del decay; título con la cantidad real.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-reportes-email.reporte-semanal, h2.cli-reportes-email.preferencias-del-reporte, lib.reports

### [BUG-059] Links de emails del lote con fallback a http://localhost:3000
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/reports/executive-weekly/build.ts:187` — «dashboardUrl: '${(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(»; `src/lib/email/unsubscribe-token.ts:58` — «const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace( (usado por build.ts:191)»; `src/lib/tickets/actions.ts:156` — «const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:141` — «const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:155` — «<a href="${appUrl}/api/email/optout/{{contact.CONTACT_ID}}?token={{contact.OPTOUT_TOKEN}}"»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:165` — «htmlContent: htmlWithFooter,»
- Impacto: Si falta la variable en producción, el reporte semanal y el aviso de ticket llevan links a localhost (incluido el de baja del reporte, que entonces no funciona).
- Propuesta: Leer la URL base de un helper que falle en build/arranque si falta, sin fallback.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-reportes-email.reporte-semanal, h4.adm-tickets, lib.email, h2.cli-email-mkt.crear-y-enviar-campana, h2.cli-email-mkt.baja-de-contactos, h6.vis-optout

### [BUG-062] Aprobar y pedir cambios en una entrega es check-then-act: el estado se lee fuera de la transaccion y el update no exige PENDING_APPROVAL
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/actions/dashboard-actions.ts:26` — «const task = await prisma.task.findUnique({ where: { id: parsed.data.taskId }, include: { project: true } })»; `src/actions/dashboard-actions.ts:39` — «if (task.approvalStatus !== 'PENDING_APPROVAL') {»; `src/actions/dashboard-actions.ts:44` — «await tx.task.update({ where: { id: parsed.data.taskId }, data: { approvalStatus: 'APPROVED' },»; `src/actions/dashboard-actions.ts:132` — «await tx.task.update({ where: { id: parsed.data.taskId }, // REJECTED, mismo patron»
- Impacto: Dos pedidos casi simultaneos (aprobar en una pestana y pedir cambios en otra, o llamadas directas a la action) pasan los dos el control: quedan en Mensajes 'Aprobé la entrega' y 'Solicité cambios', dos tandas de notificaciones a todos los SUPER_ADMIN y un estado final que depende de cual escribio ultimo. Frente al primer cliente, el equipo no sabe si la entrega quedo aprobada.
- Propuesta: Decision para Valentino (dashboard-actions.ts es congelado): dentro de la transaccion usar updateMany con where { id, approvalStatus: 'PENDING_APPROVAL', project: { organizationId } } y abortar si count === 0 antes de crear mensajes y notificaciones.
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): h2.cli-proyecto.aprobar-o-pedir-cambios, modelo.Task, lib.actions

### [BUG-066] Insights de Resultados: un fallo de Anthropic se cachea 24 h como 'sin insights' y no llega a Sentry
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/ai/results-insights.ts:37` — «return unstable_cache( async () => generateTrafficInsights(input),»; `src/lib/ai/results-insights.ts:102` — «} catch (err) { console.error('[Traffic Insights] Generation failed:', err) return []»
- Impacto: Un 429 o un timeout transitorio deja al cliente sin insights por un día entero (el [] queda en cache) y nadie se entera.
- Propuesta: Ante error, lanzar o devolver un valor que no se cachee; captureException.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados, int.anthropic, lib.ai

### [BUG-067] Aviso de lead al cliente: links relativos si falta NEXT_PUBLIC_APP_URL y los fallos solo van a console.error
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/client-notifications/notify.ts:135` — «const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')»; `src/lib/client-notifications/notify.ts:169` — «leadUrl: '${appUrl}/dashboard/chatbot/leads/${input.leadId}',»; `src/lib/client-notifications/notify.ts:175` — «console.error('[client-notifications] notifyClientOfLead failed (lead ya guardado):', err)»
- Impacto: Sin la variable, 'Ver este lead en mi panel' lleva a un link roto. Un fallo de Brevo o de la base en el aviso no deja rastro en Sentry: el dueño no recibe el aviso y nadie lo sabe.
- Propuesta: Fallback a la URL de producción o validar la variable al arrancar; captureException en los catch.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot.aviso-lead-email, int.brevo, lib.client-notifications

### [BUG-072] currentPath queda congelado en la primera pagina: el bot de develOP infiere la seccion equivocada tras navegar
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/hooks/useChatbot.ts:456` — «[slug, currentPath]»; `src/modules/chatbot/hooks/useChatbot.ts:459` — «const { messages: sdkMessages, sendMessage: sdkSendMessage, setMessages, status } = useChat({»; librería @ai-sdk/react@3.0.216, dist/index.mjs línea 184 — «const chatRef = useRef( "chat" in options ? options.chat : new Chat(optionsWithCallbacks)»; `src/modules/chatbot/server/prompts/sections.ts:200` — «- Ruta del usuario: ${context.currentPath ?? 'no determinada'}»
- Impacto: El widget sigue montado al navegar (layout raiz), pero useChat conserva la instancia y el transport del primer render (solo se recrea si cambia chat o id): todos los turnos mandan la ruta donde se abrio el sitio. El prompt usa esa ruta para 'inferir interes segun la seccion' (sections.ts:205), asi que en /ai-implementations el bot puede seguir creyendo que el visitante esta en el home; tambien se persiste la ruta vieja en Conversation.currentPath (resolver.ts:90-93).
- Propuesta: Leer currentPath desde un ref dentro de prepareSendMessagesRequest (como sessionId y el opener) o pasarlo en el body de sendMessage.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop, lib.chatbot.hooks

### [BUG-078] El stream de actividad puede perder eventos entre consultas
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/components/admin/ActivityLog.tsx:116` — «lastFetchRef.current = data.serverTime ?? new Date().toISOString()»; `src/app/api/admin/chatbot/events/route.ts:21` — «? await listEventsSince(bot.organizationId, bot.id, new Date(since))»; `src/app/api/admin/chatbot/events/route.ts:35` — «serverTime: new Date().toISOString(),»; `src/modules/chatbot/server/admin/queries.ts:54` — «where: { botConfigId, createdAt: { gt: since } },»; `src/modules/chatbot/server/admin/queries.ts:56` — «take: limit,»
- Impacto: El próximo 'since' es la hora del servidor tomada después de la query, no el createdAt del último evento: lo creado entre la query y ese instante, o lo que pase de 50 en una ráfaga de 3 s, no aparece nunca en vivo (sólo al recargar). Un 'since' inválido da un 500 sin manejar.
- Propuesta: Usar como cursor el createdAt (e id) del último evento recibido, paginar hasta vaciar y validar 'since' con Zod.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-actividad.stream-eventos, lib.chatbot.admin, modelo.ChatbotEvent

### [BUG-079] El editor marca 'cambios sin guardar' al abrir bots con respuestas rápidas sin id
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/BotConfigEditor.tsx:52` — «const [initialState, setInitialState] = useState<BotConfigEditorState>(() => normalizeInitial(initial))»; `src/modules/chatbot/components/admin/BotConfigEditor.tsx:53` — «const [state, setState] = useState<BotConfigEditorState>(() => normalizeInitial(initial))»; `src/modules/chatbot/components/admin/BotConfigEditor.tsx:288` — «id: typeof record.id === 'string' ? record.id : crypto.randomUUID(),»; `src/modules/chatbot/components/admin/BotConfigEditor.tsx:61` — «() => JSON.stringify(state) !== JSON.stringify(initialState),»; `src/modules/chatbot/server/dashboard/updateBotAppearance.ts:48` — «return replies.map((reply) => ({»
- Impacto: Dos normalizaciones independientes generan UUID distintos para cada respuesta rápida sin id (las que guarda el cliente desde su panel y las del seed del bot develop): la barra 'Tenés cambios sin guardar' aparece al abrir el editor y el diff muestra 'Respuestas rápidas' modificadas sin que nadie tocara nada.
- Propuesta: Normalizar una sola vez y reusar el objeto para ambos estados, o derivar ids determinísticos; que updateBotAppearance preserve o genere ids.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.editar-config-bot, h3.cli-chatbot
- REQUIERE-VERIFICACIÓN-HUMANA: VH-078

### [BUG-080] El borrador del alta se guarda vacío y muestra 'onboarding sin terminar' sin haber empezado
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/onboarding/useOnboardingDraft.ts:28` — «didRestore.current = true»; `src/modules/chatbot/components/admin/onboarding/useOnboardingDraft.ts:60` — «if (!didRestore.current) return»; `src/modules/chatbot/components/admin/onboarding/useOnboardingDraft.ts:70` — «localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))»; `src/modules/chatbot/components/admin/onboarding/OnboardingWizard.tsx:115` — «{hasDraft && (»
- Impacto: El efecto de restauración marca didRestore antes de que corra el de autoguardado en el mismo commit, así que abrir /admin/clients/new y quedarse un segundo guarda el estado inicial como borrador; 'Descartar' también lo vuelve a guardar. En la visita siguiente aparece el banner de onboarding sin terminar sobre un formulario vacío.
- Propuesta: Guardar sólo si el estado difiere de INITIAL_STATE (o tras una edición del usuario) y no re-guardar tras descartar.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.borrador-alta
- REQUIERE-VERIFICACIÓN-HUMANA: VH-097

### [BUG-082] Estilo 'image'/'emoji' sin URL o emoji cae al avatar 3D pesado por defecto ('neuro') y descarga three + R3F
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/avatar/AvatarRenderer.tsx:51` — «if (style === 'image' && avatarImageUrl) {»; `src/modules/chatbot/components/avatar/AvatarRenderer.tsx:87` — «const resolved = getAvatarOrDefault(style)»; `src/modules/chatbot/components/avatar/registry.ts:11` — «export const DEFAULT_AVATAR_ID = 'neuro'»
- Impacto: Si el cliente elige 'Imagen custom' o 'Emoji' y no completa el valor, cada visitante ve el Orbe Neural y baja ~230 kB gz de three/R3F (HeavyAvatarsLazy.tsx:12-13), solo con un console.warn.
- Propuesta: Fallback de escotilla incompleta a un avatar liviano (monograma) y/o validar en el server que style=image exige avatarImageUrl y style=emoji exige avatarEmoji.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente, h3.cli-chatbot

### [BUG-083] LegacyNeuroAvatar comparte color y mouse a nivel modulo entre instancias y reduce el accent del tenant a 4 paletas
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx:54` — «const activeColorRef = { current: new THREE.Color('#06b6d4') };»; `src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx:157` — «activeColorRef.current.lerp(targetColor.current, lerpFactor);»; `src/modules/chatbot/components/avatar/legacyStateMapper.ts:35` — «return 'cyan'»
- Impacto: Con 'Rostro Neural', el header (idle), el indicador 'pensando' (thinking, violeta) y el launcher montan instancias cuyos ColorController escriben el mismo color global cada frame: los colores se mezclan/parpadean. Ademas cualquier accent fuera de 4 prefijos se pinta cyan.
- Propuesta: Mover activeColorRef/mouseRef a refs por instancia (contexto del Canvas) y derivar el color del accent real en vez de la paleta fija.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente, h3.vis-widget-develop
- REQUIERE-VERIFICACIÓN-HUMANA: VH-098

### [BUG-089] Alta con bot: el slug del bot se toma del de la org sin verificar unicidad en BotConfig
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/createClientWithBot.ts:85` — «c.organization.findUnique({ where: { slug: candidate } }),»; `src/modules/chatbot/server/admin/createClientWithBot.ts:162` — «slug: uniqueSlug,»; `src/modules/chatbot/server/admin/createBot.ts:57` — «const slug = await findUniqueBotSlug(slugify(input.botName))»; `prisma/schema.prisma:1278` — «slug String @unique»
- Impacto: createBot deriva slugs de bot desde el nombre del bot, asi que puede existir un bot 'sofia' sin org 'sofia'. Si despues se da de alta la org 'Sofia', su slug esta libre en Organization pero choca en BotConfig: P2002, rollback de toda la tx y error generico. Mismo patron en lib/onboarding/core.ts:66 y :111.
- Propuesta: Calcular el slug del bot con findUniqueBotSlug (createBot.ts:12-27) en ambas altas.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.alta-cliente-con-bot, lib.chatbot.admin, modelo.BotConfig

### [BUG-090] Analisis mensual: la serie salta meses sin fila y compara contra el ultimo mes con datos
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/lib/monthly-analysis.ts:73` — «const current = points.length > 0 ? points[points.length - 1] : null»; `src/modules/chatbot/lib/monthly-analysis.ts:74` — «const prev = points.length > 1 ? points[points.length - 2] : null»; `src/modules/chatbot/server/analysis/getMonthlyAnalysisForOrg.ts:79` — «take: SERIES_MONTHS,»
- Impacto: La serie son las ultimas 6 filas de QuotaUsage, no los ultimos 6 meses: un mes sin conversaciones no tiene fila y desaparece del grafico, y la variacion compara con el ultimo mes con datos. Mientras el mes en curso no tenga su primera conversacion, 'como viene tu mes' muestra el mes anterior.
- Propuesta: Generar los 6 meses calendario (en hora AR) y rellenar con 0 los que no tengan fila.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados, h2.cli-resultados.analisis-mensual, modelo.QuotaUsage

### [BUG-094] Cuando actúa el watchdog el turno queda con 0 tokens, costo 0 y sin toolCalls: onFinish no 'recupera la contabilidad' como dice el comentario
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/chat/handleChatRequest.ts:1250` — «// registrado, onFinish recupera la contabilidad del turno // (persistTurn es idempotente — el primero en llegar gana).»; `src/modules/chatbot/server/chat/handleChatRequest.ts:1230` — «toolCalls: [], tokensIn: 0, tokensOut: 0,»; `src/modules/chatbot/server/chat/persistTurn.ts:181` — «if (turnPersisted) { streamProbe.mark('persistTurn_skipped', { source: input.source }) return»
- Impacto: El watchdog persiste primero con 0 tokens y sin toolCalls; cuando después llega onFinish con el usage real, persistTurn lo saltea. Subreporta costo en el panel de uso y pierde las tarjetas de tools (handoff, lead) en el transcript de los turnos que cierra el watchdog.
- Propuesta: Si onFinish llega después de un cierre del watchdog, actualizar tokens, costo y toolCalls del mensaje ya persistido (update dirigido) o, como mínimo, corregir el comentario y medir cuántos turnos cierran por watchdog.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-api-chatbot, modelo.ChatMessage, modelo.QuotaUsage

### [BUG-095] El validador del webhook rechaza dominios legítimos que empiezan con 'fc' o 'fd'
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/crm/validateWebhookUrl.ts:89` — «hostname.startsWith('fc') || hostname.startsWith('fd')»
- Impacto: Un cliente cuyo n8n vive en un dominio como fdn8n.cliente.com o fc-automatizaciones.com no puede configurar el CRM: recibe 'No se pueden usar IPs privadas o de loopback'.
- Propuesta: Aplicar los prefijos IPv6 solo cuando el hostname es un literal IPv6 (contiene ':').
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.crm

### [BUG-101] excludeDqWhere excluye tambien los leads con classification NULL
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/scoring/dqFilter.ts:23` — «NOT: { classification: 'dq' },»; `prisma/schema.prisma:1493` — «classification LeadClassification?»
- Impacto: Con la semantica de NULL de SQL que usa Prisma, los leads sin clasificar (legacy o creados por scripts) desaparecen de metricas y del reporte semanal. Hoy el camino de produccion siempre clasifica, por eso BAJA.
- Propuesta: OR: [{ classification: null }, { classification: { not: 'dq' } }].
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.chatbot.scoring, h3.cli-chatbot, modelo.ChatbotLead
- REQUIERE-VERIFICACIÓN-HUMANA: VH-104

### [BUG-103] El dedupe de alertas por (canal, tipo) en 24 h hace que pasar de restringido a baneado no genere alerta nueva y que el rechazo de una plantilla tape el de otras
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/motor/adapters/whatsapp/inbound/handle-health.ts:106` — «const recent = await scope.motorAlert.findFirst({ where: { wabaChannelId: channel.id, type: input.type, createdAt: { gte: since } },»; `src/modules/motor/adapters/whatsapp/inbound/handle-health.ts:247` — «type: 'PHONE_RESTRICTED_OR_BANNED', severity: nextStatus === 'BANNED' ? 'CRITICAL' : 'HIGH',»
- Impacto: Si Meta restringe el numero y lo banea dentro de las 24 h, la unica alerta que queda es 'Número restringido' con severidad HIGH; el baneo CRITICAL se descarta. Un segundo template rechazado ese dia no deja rastro. Hoy es latente porque las alertas no tienen lector (ver la FAL de alertas).
- Propuesta: Deduplicar por (canal, tipo, severidad) para la alerta del numero y por (canal, tipo, templateId) para las plantillas, o dejar que una severidad mayor siempre genere su alerta.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp.salud-canal, modelo.MotorAlert

### [BUG-104] La clave de idempotencia de salida queda quemada por un despacho fallido o colgado: el reintento devuelve 'deduped' y el mensaje nunca sale
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/motor/services/sendMessage.ts:213` — «if (input.idempotencyKey !== undefined) { const existing = await findByIdempotencyKey(scope, input.idempotencyKey) if (existing !== null) {»; `src/modules/motor/services/sendMessage.ts:190` — «where: { direction: 'OUT', outboundIdempotencyKey: key }, select: { id: true, providerMessageId: true },»; `src/modules/motor/services/sendMessage.ts:251` — «await scope.motorMessage.update(messageId, { status: 'FAILED',»
- Impacto: Latente porque no hay llamador. Cuando B2 reintente un envio que fallo (red agotada, 5xx) o que quedo PENDING porque la funcion expiro entre la reserva y el despacho, va a recibir 'deduped' con wamid null, igual que un exito, y la respuesta del bot nunca le llega al cliente final. El docstring (:17) cuida no quemar la clave en el decrypt, pero no en el despacho.
- Propuesta: Leer tambien el status en findByIdempotencyKey: si la fila esta FAILED (o PENDING vencida), re-despachar sobre esa misma fila o devolver un resultado distinto ('previously_failed'). Agregar un test que reintente con la misma clave despues de un 5xx agotado.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp.envio-mensajes, modelo.MotorMessage

### [BUG-105] El reintento ante timeout o 5xx puede duplicar el mensaje al cliente final, y el peor caso (unos 34 s) supera el maxDuration de las rutas
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/motor/adapters/whatsapp/outbound/client.ts:233` — «const isTimeout = error instanceof Error && error.name === 'AbortError' return { outcome: 'retryable',»; `src/modules/motor/adapters/whatsapp/outbound/client.ts:94` — «const DEFAULT_TIMEOUT_MS = 10_000 const DEFAULT_RETRY_DELAYS_MS = [1_000, 3_000] as const»
- Impacto: Latente. Un timeout del lado cliente despues de que 360dialog ya acepto el POST reenvia el mismo texto: la Cloud API no tiene clave de idempotencia, asi que el usuario recibe el mensaje dos veces. El codigo evita reintentar el 2xx sin wamid (:205-206) pero no este caso. Tres intentos de 10 s mas 4 s de espera suman unos 34 s, por encima del maxDuration=15 del webhook y de 30 en el chat, si B2 lo llama de forma sincronica. Eslabon inferido: el comportamiento del BSP ante POSTs duplicados.
- Propuesta: No reintentar ante timeout (solo ante errores de conexion antes de enviar), o bajar el timeout y los intentos para que entren en el presupuesto del llamador. Llevar el envio a una cola o funcion de fondo cuando B2 lo cablee.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp.envio-mensajes, int.360dialog

### [BUG-106] PAUSED queda terminal en el espejo local de plantillas: los eventos de reactivacion o deshabilitacion no tienen mapeo
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/motor/adapters/whatsapp/inbound/handle-health.ts:45` — «const TEMPLATE_STATUS_MAP: Readonly<Record<string, MotorTemplateStatus>> = { APPROVED: 'APPROVED', REJECTED: 'REJECTED',»; `src/modules/motor/adapters/whatsapp/inbound/handle-health.ts:132` — «if (nextStatus === undefined) { logger.debug(»; `src/modules/motor/services/sendMessage.ts:150` — «return template === null || template.status !== 'APPROVED' ? 'template_not_approved' : null»
- Impacto: Si Meta reactiva una plantilla pausada (evento REINSTATED) o la deshabilita (DISABLED/FLAGGED), el mapeo no lo cubre y solo deja un debug. La plantilla queda PAUSED para siempre: el envio la rechaza aunque Meta la haya vuelto a habilitar. Una plantilla DISABLED que seguia APPROVED localmente sale y falla en el BSP. Eslabon inferido: la lista de valores de event viene de la doc de Meta, que no se verifico en este lote.
- Propuesta: Confirmar contra el sandbox de 360dialog la lista de event, mapear REINSTATED a APPROVED y DISABLED a un estado no enviable, y pasar el log de 'unmapped-event' a warn para que se vea.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp.salud-canal, modelo.MotorTemplate
- REQUIERE-VERIFICACIÓN-HUMANA: VH-091

### [BUG-107] El reintento de un batch reprocesa user_id_update y deja transiciones 'unknown-identity' falsas
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/motor/domain/identity.ts:110` — «const identity = await db.contactIdentity.findFirst({ where: { channelType: 'WHATSAPP', externalId: input.oldExternalId }, })»; `src/modules/motor/domain/identity.ts:113` — «if (identity === null) { await recordTransition(db, input, null, 'user_id_update:unknown-identity')»; `src/modules/motor/adapters/whatsapp/inbound/process.ts:67` — «for (const entry of envelope.entry) { for (const change of entry.changes ?? []) { summary = await applyEvent(scope, channel, classifyChange(change), summary)»
- Impacto: Los changes de un batch se aplican en orden y sin atomicidad. Si un change posterior falla por infraestructura, el route devuelve 500 y el BSP reenvia todo el batch. El user_id_update que ya habia migrado no encuentra el ID viejo y graba una segunda transicion 'unknown-identity'. El rastro de auditoria de reconciliacion queda con filas que dicen que la identidad era desconocida cuando no lo era.
- Propuesta: Antes de grabar 'unknown-identity', chequear si ya existe una transicion (from, to) para esa org, o si existe una identidad con el newExternalId, y en ese caso devolver 'migrated' sin escribir.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp.identidad-bsuid, modelo.ContactIdentityTransition

### [BUG-113] Fechas en UTC en vez de hora Argentina: KPIs de hoy/semana/mes del dashboard y caducidad de novedades
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/page.tsx:66` — «current.setHours(23, 59, 59, 999)»; `src/app/(protected)/admin/page.tsx:60` — «current.setHours(0, 0, 0, 0)»; `src/app/(protected)/admin/announcements/_actions/announcements.actions.ts:36` — «const candidate = new Date('${parsed.expiresOn}T23:59:59.999Z')»
- Impacto: Con el servidor en UTC, 'Leads pendientes de follow-up hoy' corta a las 20:59 ART y después de las 21:00 suma los de mañana; la semana arranca el domingo 21:00 y el mes el último día 21:00 ART, así que un cobro de esa noche cae en el mes siguiente. Una novedad que caduca 'el 10' desaparece el 10 a las 20:59 ART (esto último no depende del TZ del server).
- Propuesta: Usar los helpers de fecha AR existentes (src/lib/dates-ar.ts / tz-ar.ts) para los límites de día, semana y mes y para el fin de día de expiresOn.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-034], [BUG-128]
- Nodo(s): h4.adm-dashboard, h4.adm-dashboard.kpis-comerciales, h4.adm-novedades.publicar, lib.dates-ar
- REQUIERE-VERIFICACIÓN-HUMANA: VH-114

### [BUG-114] Tasa de respuesta del dashboard subestimada: el denominador incluye perdidos y postergados que sí respondieron
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/page.tsx:45` — «LeadStatus.PERDIDO,»; `src/app/(protected)/admin/page.tsx:349` — «const responseRate = formatPercentage(respondedCount, demoQualifiedCount)»; `src/app/(protected)/admin/page.tsx:607` — «primaryHint="Sobre leads en etapa demo o posterior, según su estado actual"»
- Impacto: Un lead que respondió y después pasó a PERDIDO o POSTERGADO cuenta en el denominador (DEMO_PIPELINE_STATUSES) y no en el numerador (RESPONDED_PIPELINE_STATUSES): la tasa baja con cada pérdida aunque la respuesta haya ocurrido. Card de cierre (histórica) y chart (cohorte por createdAt) siguen sin reconciliar; solo se agregaron subtítulos.
- Propuesta: Basar la tasa en eventos (timestamp de respuesta en OsActivity o un respondedAt) y no en el estado actual; alinear card y chart al mismo criterio.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-dashboard, h4.adm-dashboard.kpis-comerciales, modelo.OsLead

### [BUG-117] El alta de un cliente no invalida el cache del listado
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/clients/page.tsx:20` — «const getClients = unstable_cache( async () =>»; `src/app/(protected)/admin/clients/page.tsx:28` — «{ revalidate: 60, tags: ['admin-clients'] }»
- Impacto: createClientOnly.ts, createClientWithBot.ts y lib/onboarding/core.ts no llaman revalidateTag('admin-clients') ni revalidatePath (git grep sin resultados; control: archiveClient.ts:48 si lo hace). El cliente recien creado puede no aparecer en /admin/clients hasta 60 s o mas; igual tras renombrar (updateClient solo revalidatePath) o cambiar plan.
- Propuesta: revalidateTag('admin-clients') en las actions de alta, edicion y plan.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.listado, h4.adm-clientes.alta-cliente
- REQUIERE-VERIFICACIÓN-HUMANA: VH-119

### [BUG-118] Re-enviar credenciales apunta al primer miembro sin filtrar rol, distinto del que se edita
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/[clientId]/_components/tabs/OverviewTab.tsx:19` — «members: { orderBy: { joinedAt: 'asc' }, take: 1,»; `src/app/(protected)/admin/clients/[clientId]/edit/page.tsx:31` — «where: { role: 'ADMIN' },»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/OverviewTab.tsx:90` — «<ResendCredentialsButton userId={primaryMember.user.id}»
- Impacto: Si el miembro mas antiguo no es el ADMIN de la org (por ejemplo, un usuario de develOP agregado para soporte o un VIEWER), 'Re-enviar credenciales' invalida la contrasena de ese usuario y no la del administrador que muestra Editar datos.
- Propuesta: Usar el mismo criterio (OrgRole ADMIN, joinedAt asc) en OverviewTab y mostrar a quien se le resetea.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-087]
- Nodo(s): h4.adm-clientes.reenviar-credenciales, modelo.OrgMember
- REQUIERE-VERIFICACIÓN-HUMANA: VH-132

### [BUG-120] markAsRead se ejecuta durante el render: revalidatePath lanza (E7) y el fallo se descarta
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/messages/[orgId]/page.tsx:24` — «await markAsRead(orgId)»; `src/app/(protected)/admin/messages/_actions/message.actions.ts:224` — «revalidateMessagePaths(parsedOrganizationId) return ok({ count: result.count }) } catch (error) {»; librería next@16.2.9, dist/server/web/spec-extension/revalidate.js línea 114 — «if (workUnitStore.phase === 'render') { throw ... during render which is unsupported»
- Impacto: Next 16.2.9 prohíbe revalidatePath en render (la request store arranca en phase 'render', app-render.js:733). El updateMany (:213) sí escribe, pero la invalidación de /admin/messages, /dashboard y /dashboard/messages nunca corre desde este camino y cada apertura de conversación genera una excepción tragada (fail() no loguea). Además, una escritura en el GET se re-ejecuta en cada router.refresh (p. ej. tras sendMessage).
- Propuesta: Replicar el patrón del portal (D2 'Mensajes con develOP': MarkReadOnMount -> mark-read action) o separar una función de escritura sin revalidate para usar en el render; no ignorar el ActionResult.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-mensajes.hilo-y-leido, modelo.Message

### [BUG-121] Clientes archivados siguen en la bandeja de Mensajes y se les puede escribir (y mandar email)
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/messages/_actions/message.actions.ts:47` — «where: { messages: { some: {},»; `src/app/(protected)/admin/messages/_actions/message.actions.ts:177` — «prisma.message.create({ data: { organizationId: parsed.organizationId,»; `src/app/(protected)/admin/clients/page.tsx:23` — «where: { deletedAt: null },»
- Impacto: Archivar un cliente lo saca de /admin/clients pero no de Mensajes; el admin puede seguir escribiéndole y dispararle emails. Inconsistente con el soft-delete del resto del admin.
- Propuesta: Filtrar deletedAt: null en listConversations (o mostrarlo con badge «Archivado») y rechazar sendMessage sobre orgs archivadas o inexistentes con un mensaje claro.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-014], [BUG-131]
- Nodo(s): h4.adm-mensajes.bandeja, h4.adm-mensajes.responder, modelo.Organization

### [BUG-122] Conteo de actividad distinto entre el board y la ficha del lead
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/leads/page.tsx:29` — «activities: { where: SOLO_CONTACTOS_COMERCIALES },»; `src/app/(protected)/admin/leads/[leadId]/page.tsx:450` — «<p className="mt-2 text-sm text-zinc-200">{lead.activities.length} registros</p>»
- Impacto: La card del board cuenta sólo contactos comerciales y la ficha cuenta todas las actividades (incluye las reasignaciones SISTEMA, include sin where en :186): el mismo lead muestra dos números distintos.
- Propuesta: Mostrar en la ficha el mismo conteo comercial (o rotular explícitamente 'incluye reasignaciones').
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-leads.ficha-y-estado, modelo.OsLead

### [BUG-123] markDemoViewed sin manejo de rechazo: el botón queda trabado en «Guardando...»
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/leads/_components/demo-form.tsx:246` — «void markDemoViewed({ demoId }).then((result) => { setDemoPendingId(null)»
- Impacto: Si la llamada a la server action falla por red o lanza, la promesa rechaza sin catch: demoPendingId nunca vuelve a null, el botón queda deshabilitado y no se muestra error.
- Propuesta: Usar useTransition como el resto de los componentes o agregar .catch que limpie el estado y muestre un error.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-leads.demos

### [BUG-124] El redirect de /admin/clients/[clientId]/chatbot/* pierde los tabs install e integrations
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx:36` — «const targetTab: TabId = requested && TAB_MAP[requested] ? TAB_MAP[requested] : 'overview'»; `src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx:29` — «where: { slug: orgSlug },»; `src/app/(protected)/admin/chatbots/[botId]/tabs.ts:1` — «export const VALID_TABS = ['overview', 'config', 'knowledge', 'activity', 'leads', 'conversations', 'install', 'integrations'] as const»; `src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx:28` — «const org = await prisma.organization.findUnique({ where: { slug: orgSlug },»; `src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx:22` — «permanentRedirect('/login')»
- Impacto: TAB_MAP (:6-13) no tiene install ni integrations: links viejos a /chatbot/install (B8.5) caen en overview. Además busca sólo por slug mientras la navegación interna de clients usa Organization.id (ClientTabsNav.tsx:34), así que un link con id da 404.
- Propuesta: Agregar install e integrations a TAB_MAP y resolver la org por id o slug como hace clients/[clientId]/page.tsx:40-42; actualizar roadmap-pendientes.md:26 (la vista CRM ya existe en IntegrationsTab).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes, h3.adm-chatbots, h4.adm-clientes.redireccion-chatbot-legacy

### [BUG-131] Los selectores de cliente de Proyectos ofrecen organizaciones archivadas
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/projects/[projectId]/layout.tsx:145` — «where: { slug: { not: 'develop',»; `src/app/(protected)/admin/projects/page.tsx:11` — «where: { slug: { not: 'develop' } },»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:242` — «const organization = await tx.organization.findUnique({ where: { id: organizationId,»
- Impacto: Un cliente archivado (soft-delete con deletedAt, schema.prisma:419, que admin/clients/page.tsx:23 oculta) sigue en el desplegable 'Vincular a cliente', y createProject y updateProject lo aceptan. Se pueden crear proyectos (y activar Services) para una org dada de baja.
- Propuesta: Filtrar deletedAt: null en los dos findMany y rechazar orgs archivadas en resolveProjectOrganization.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-121]
- Nodo(s): h4.adm-proyectos.alta-edicion, modelo.Organization

### [BUG-136] Contrato del guard SUPER_ADMIN roto en el lote: send-executive-report espera 'UNAUTHORIZED' y siempre responde 403; las páginas muestran 'Unauthorized' o un 404 en vez de ir a /login
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/api/admin/clients/[organizationId]/send-executive-report/route.ts:17` — «const status = message.startsWith('UNAUTHORIZED') ? 401 : 403»; `src/lib/auth-guards.ts:7` — «throw new Error('Unauthorized')»; `src/app/(protected)/admin/tickets/[ticketId]/page.tsx:16` — «if (!ticketResult.success) { notFound()»; `src/lib/audit-log-queries.ts:5` — «import { requireSuperAdmin } from '@/modules/chatbot/server/admin/requireSuperAdmin'»
- Impacto: Sin sesión el endpoint responde 403 y el botón no puede decir 'tu sesión venció'; en /admin/settings y /admin/tickets una sesión vencida pinta 'Unauthorized' en una caja roja (settings/page.tsx:31-33, tickets/page.tsx:28-31) y el detalle de ticket da 404 también ante un error de base. Conviven tres guards: auth-guards, el del módulo chatbot (audit-log-queries.ts:5, bulk-actions.ts:6) y chequeos inline en 5 archivos.
- Propuesta: En la ruta, comparar contra el mensaje real o un código tipado (zona libre). Decisión para Valentino: un único requireSuperAdmin con error tipado en auth-guards (FROZEN-inferido) y un manejador común (redirect('/login') en páginas, 401/403 en rutas); distinguir not-found de error en getTicketById.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.auth, h4.adm-shell, h4.adm-tickets.conversacion-y-respuesta, h4.adm-config, h4.adm-clientes.reporte-ejecutivo-manual

### [BUG-137] Si el webhook de alertas falla, solo queda un console.error: develOP pierde los avisos de tickets urgentes, leads y mensajes sin enterarse
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/alerts.ts:139` — «if (!response.ok) { console.error( '[alerts] Webhook respondió ${response.status} ${response.statusText} para ${event.type}.'»; `src/lib/alerts.ts:144` — «} catch (error) { console.error('[alerts] No se pudo enviar la alerta ${event.type}:', error)»
- Impacto: Un webhook vencido o mal escrito apaga todas las alertas de la agencia en silencio: no hay Sentry, no hay captureConsoleIntegration y Configuración no muestra el último envío.
- Propuesta: Sentry.captureException/Message con el tipo de evento y mostrar en Configuración el estado del último envío.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-052]
- Nodo(s): h4.adm-alertas.webhook-agencia, lib.alerts, int.sentry

### [BUG-140] acknowledgeAlert/resolveAlert no verifican el estado previo: marcar como vista una resuelta la reabre
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/manageAlerts.ts:44` — «where: { id }, data: { status: 'ACKNOWLEDGED',»; `src/modules/chatbot/server/admin/manageAlerts.ts:87` — «where: { id }, data: { status: 'RESOLVED',»
- Impacto: El update va solo por id. Una doble acción (dos pestañas o dos admins) o un ack tardío sobre una alerta RESOLVED la devuelve a ACKNOWLEDGED, y el badge de pendientes y el historial quedan incoherentes. Si la alerta no existe, el update lanza P2025 (throw, no mensaje).
- Propuesta: Condicionar la transición (where: { id, status: 'PENDING' } para el ack; status distinto de RESOLVED para resolver) con updateMany y devolver ok/fail según count.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-062]
- Nodo(s): h4.adm-alertas.marcar-vista-resolver, modelo.BotAlert

## Tecnología vieja

### [TEC-002] Agenda inteligente usa la API v1 de Cal.com, apagada segun el propio repo, con la API key en la query string
- Dominio: D2  ·  Severidad: ALTA  ·  Tipo: tech-vieja
- Confianza: PROBABLE
- Evidencia: `src/lib/integrations/cal-com.ts:4` — «const API_BASE = 'https://api.cal.com/v1'»; `src/lib/integrations/cal-com.ts:49` — «const res = await fetch('${API_BASE}/bookings?apiKey=${apiKey}', {»; `src/lib/integrations/cal-com-v2.ts:4` — «NUEVO y separado a proposito de 'cal-com.ts' (v1): la v1 fue apagada el 8/abr/2026 y ese modulo es deuda aparte del dashboard del cliente»; `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:226` — «No se pudo cargar la informacion de tu agenda. Intenta de nuevo en unos minutos.»
- Impacto: Bloqueante para el primer cliente del modulo (80 USD/mes, ACTIVE en el catalogo): con Cal.com conectado la pagina siempre muestra el error y nunca el link de reservas (EmbedPreview vive dentro del resumen, page.tsx:282); la API key viaja en la URL (logs y cache de fetch).
- Propuesta: Migrar a la v2 reutilizando cal-com-v2.ts (headers, cal-api-version) con la key fuera de la URL; mostrar el link de reservas aunque falle el resumen; Sentry en el catch.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [FAL-004], [SEC-036]
- Nodo(s): h2.cli-agenda.panel-de-agenda, int.calcom, modelo.Organization
- REQUIERE-VERIFICACIÓN-HUMANA: VH-046

### [TEC-003] Modelos LLM fijados a mano en 14 lugares y sin chequeo de vigencia; lib/ai usa Haiku 4.5 de generación anterior
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: tech-vieja
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/llm/providers/google.ts:14` — «id: 'gemini-2.5-flash',»; `src/lib/plan/fallback.ts:51` — «llmModel: 'gemini-2.5-flash',»; `src/app/api/admin/chatbot/test-prompt/route.ts:50` — «const rawModel = provider.getModel('gemini-2.5-flash')»; `src/lib/ai/results-insights.ts:4` — «const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'»; `src/lib/ai/review-reply-draft.ts:33` — «model: 'claude-haiku-4-5-20251001',»; `src/modules/chatbot/components/admin/config/tabs/AdvancedTab.tsx:17` — «{ value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },»; `prisma/seeds/sync-plans.ts:73` — «llmModel: 'gemini-2.5-flash',»; `src/modules/chatbot/server/llm/resolveEffectiveModel.ts:21` — «export const FALLBACK_MODEL_ID = 'gemini-2.5-flash'»; `src/lib/onboarding/core.ts:133` — «llmModel: 'gemini-2.5-flash',»
- Impacto: Si Google discontinúa gemini-2.5-flash en Vertex, caen todos los bots a la vez y el health sigue en 'Todo OK' (solo mira una lista estática). Cambiar de modelo exige tocar seeds de planes, fallback, provider, rutas y lib/ai. claude-haiku-4-5-20251001 sigue activo pero es la generación anterior (USD 1/5 por millón contra 0,10/0,50 de Haiku 5.5); las opciones Anthropic del admin no coinciden con la lista del provider, que además es un stub. La vigencia de Gemini en Vertex no se pudo verificar (WebSearch no permitido en esta tarea).
- Propuesta: Un registro único de modelos por uso; chequear la fecha de discontinuación en Vertex; una llamada real mínima en el health; evaluar Haiku 5.5 para lib/ai.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): int.vertex, int.anthropic, lib.chatbot.llm, lib.ai, lib.plan, h3.vis-api-chatbot
- REQUIERE-VERIFICACIÓN-HUMANA: VH-069

### [TEC-001] Prisma 6.19 con 7.x disponible: el salto exige cambiar el schema congelado y la carga de .env de los seeds
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: tech-vieja
- Confianza: PROBABLE
- Evidencia: `package.json:133` — «"@prisma/client": "^6.19.2",»; `prisma/schema.prisma:2` — «provider = "prisma-client-js"»; `prisma/seed-guard.ts:13` — «* Nota de entorno: '@prisma/client' carga '.env' completo al importarse, así que»; dato de la auditoría, _crudo/npm-outdated.json línea 1 — «@prisma/client current 6.19.3, latest 7.10.0 (resumen del baseline F0)»
- Impacto: La rama 7 mueve la URL del datasource a prisma.config.ts, cambia el generador y deja de cargar .env automáticamente; el guard de seeds asume esa carga (seed-guard.ts:13-14). El upgrade toca el schema congelado y los seeds; sin plan, queda bloqueado o se hace a ciegas.
- Propuesta: Decisión para Valentino (schema FROZEN): planificar el salto a Prisma 7 como sprint propio (datasource en prisma.config.ts con directUrl, generador nuevo, carga explícita de env en seeds y scripts) después de cerrar el estado de migraciones de prod.
- Esfuerzo: M  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): lib.prisma, lib.seeds, lib.migraciones

### [TEC-004] El cierre del stream depende de internals de ai@6 citados por numero de linea, con rango ^ en package.json
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: tech-vieja
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `package.json:141` — «"ai": "^6.0.177",»; `src/modules/chatbot/server/llm/providerStreamClose.ts:186` — «// @ai-sdk/google/dist/internal/index.js:1650»
- Impacto: PROVIDER-CLOSE, el watchdog y los hooks se calibraron contra el comportamiento interno de una version concreta (flush, tee, onAbort sin await). Un npm install que suba la minor puede romper el cierre del stream sin que compile distinto. El pin exacto ya figura como deuda en la bitacora.
- Propuesta: Pin exacto de ai y @ai-sdk/google-vertex y un invariante de version que falle si cambia.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.chatbot.llm, int.vertex

### [TEC-005] Layout del admin con APIs de caché heredadas (unstable_noStore redundante y unstable_cache)
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: tech-vieja
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/layout.tsx:2` — «import { unstable_noStore as noStore, unstable_cache } from 'next/cache'»; `src/app/(protected)/admin/layout.tsx:8` — «export const dynamic = 'force-dynamic'»; `src/app/(protected)/admin/layout.tsx:39` — «noStore()»
- Impacto: noStore() es redundante con force-dynamic y ambas APIs unstable_* tienen reemplazo en Next 15/16 (connection() y 'use cache' + cacheTag); cuando se retiren, el layout del admin deja de compilar. Sin fuente web citada en esta corrida (WebFetch no permitido).
- Propuesta: Quitar noStore() y planificar la migración de unstable_cache a 'use cache' + cacheTag en el sprint de actualización de Next.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-shell, h4.adm-shell.acceso-y-layout

## Rendimiento

### [PERF-003] SEO y Tráfico llaman a Search Console y GA4 en cada render sin caché
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/resultados/seo/page.tsx:179` — «const result = await getSearchConsoleData(siteUrl)»; `src/lib/searchconsole.ts:125` — «const [queriesRes, pagesRes, dailyRes] = await Promise.all([»; `src/lib/analytics.ts:113` — «const [summaryResponse, pagesResponse, dailyResponse, sourcesResponse] = await Promise.all([»; `src/lib/integrations/pagespeed.ts:30` — «return unstable_cache(»
- Impacto: Cada visita al tab hace 3 (SEO) o 4 (Tráfico) llamadas a Google antes de pintar, con segundos de skeleton, y consume cuota por propiedad; navegar entre tabs las multiplica. PageSpeed y GBP sí están cacheados (pagespeed.ts:30-34, google-business-profile.ts:178-182).
- Propuesta: Envolver getSearchConsoleData y getAnalyticsData en unstable_cache por (org, siteUrl/propertyId) con revalidate de horas, como PageSpeed y GBP.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados.seo-search-console, h2.cli-resultados.trafico-ga4, int.search-console, int.google-analytics

### [PERF-004] Brief IA: la llamada al LLM corre dentro del render del Inicio y sin caché negativa (con Vertex vencido, cada visita reintenta)
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/page.tsx:193` — «brief = await getExecutiveBrief(organizationId)»; `src/lib/ai/executive-brief.ts:95` — «try { const generation = await generateBriefText(»; `src/lib/ai/executive-brief.ts:102` — «if (!generation || !isBriefValid(generation.text)) {»; `src/lib/ai/executive-brief.ts:154` — «const currentRegenerations = cacheAge >= CACHE_TTL_DAYS ? 0 : org.executiveBriefRegenerations»; `src/app/(protected)/dashboard/_actions/regenerate-brief.ts:19` — «const result = await regenerateExecutiveBrief(orgId.data)»
- Impacto: Con el cache vencido (sin cron en Netlify) o la credencial Vertex vencida (hoy) cada visita al home dispara una llamada a Vertex y deja el bloque en skeleton hasta que falla; si el LLM devuelve texto truncado no se guarda nada y la próxima visita reintenta. Dos clics simultáneos (o un script contra la action) pasan el tope de 3 y el gate de 4 h porque el contador se lee antes (:154) y se escribe después del LLM (:196-203). El uso de tokens no se registra en ningún lado.
- Propuesta: Generar solo desde el cron y leer el cache en el render; guardar marca del último intento fallido con backoff; reservar la regeneración con un update condicional atómico (where executiveBriefRegenerations < 3) antes de llamar al LLM; rate limit en la action; registrar usage.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [SEC-043]
- Nodo(s): h2.cli-inicio.resumen-ia, int.vertex, lib.ai
- REQUIERE-VERIFICACIÓN-HUMANA: VH-057

### [PERF-007] El widget publico importa el barrel cliente completo: editores de admin, onboarding, tablas y server actions viajan a todo el sitio
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `src/components/layout/ChatWidgetMount.tsx:12` — «const LogicCompanion = dynamic( () => import('@/modules/chatbot').then((m) => ({ default: m.LogicCompanion })),»; `src/modules/chatbot/index.ts:75` — «export { KnowledgeBaseEditor, BotConfigEditor } from './components/admin' export { ActivityLog } from './components/admin' export { OnboardingWizard } from './components/admin'»; `src/modules/chatbot/index.ts:88` — «export { updateLeadStatus } from './server/admin/updateLeadStatus' export { saveClientSettings } from './server/admin/saveClientSettings'»; `src/modules/chatbot/index.ts:30` — «// Diferido: este barrel lo importa entero 'ChatWidgetMount' en toda ruta // publica. Reexportar el avatar 3D eager metia 'three' + R3F (225 kB gz) en el // bundle del widget aunque nadie lo monte.»
- Impacto: Cada visita publica descarga y evalua, para mostrar un boton de 56 px, codigo del panel admin y del dashboard que nunca monta: los propios devs midieron que el barrel no se poda (asi entraba three+R3F) y la bitacora deja ~202 kB gz de widget. Peor TBT/INP en mobile y los ids de tres server actions del panel quedan en el JS publico.
- Propuesta: Importar LogicCompanion por ruta directa en ChatWidgetMount; partir index.ts por superficie (widget, dashboard, admin) o eliminarlo; medir con @next/bundle-analyzer (instalado y sin cablear).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop, lib.chatbot.barrel
- REQUIERE-VERIFICACIÓN-HUMANA: VH-071

### [PERF-008] ActivityLog consulta cada 3 s aunque la pestaña esté oculta
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/ActivityLog.tsx:103` — «const interval = setInterval(async () => {»; `src/modules/chatbot/components/admin/ActivityLog.tsx:123` — «}, 3000)»; `src/app/api/admin/chatbot/events/route.ts:8` — «const session = await auth()»; `src/app/api/admin/chatbot/events/route.ts:17` — «const bot = await prisma.botConfig.findUnique({ where: { slug }, select: { id: true, organizationId: true } })»
- Impacto: Cada pestaña abierta en Actividad (global o por bot) hace 20 invocaciones por minuto (28.800 por día) con auth y dos queries a Neon, aunque esté en segundo plano: mantiene la base despierta y consume cuota de invocaciones de Netlify. Una pestaña olvidada un fin de semana suma más de 80.000 llamadas. Además los 401 por sesión vencida se ignoran en silencio.
- Propuesta: Pausar con document.visibilityState, backoff cuando no hay eventos y cortar ante 401 con aviso; o revalidar a demanda.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-actividad.stream-eventos, h3.adm-chatbots.actividad-por-bot, int.neon
- REQUIERE-VERIFICACIÓN-HUMANA: VH-076

### [PERF-009] Avatares 3D siempre renderizando (sin pausa fuera de viewport), LegacyNeuroAvatar con dpr hasta 2 y AvatarPicker que monta los dos canvas pesados a la vez
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx:940` — «dpr={[1, 2]}»; `src/modules/chatbot/components/avatar/NeuroAvatar.tsx:33` — «frameloop = 'always',»; `src/modules/chatbot/components/avatar/AvatarPicker.tsx:84` — «{AVATAR_REGISTRY.map((entry) => (»; `src/modules/chatbot/components/avatar/ParticleSphere.tsx:42` — «const pos = basePos.clone().multiplyScalar(radius)»; `src/modules/chatbot/components/avatar/AvatarPicker.tsx:211` — «<AvatarRenderer»; `src/modules/chatbot/components/admin/onboarding/OnboardingWizard.tsx:76` — «avatarStyle: 'legacy_neuro',»; `src/modules/chatbot/components/admin/config/tabs/AppearanceTab.tsx:40` — «<AvatarPicker»
- Impacto: Viola reglas de CLAUDE.md (dpr max 1.5, IntersectionObserver en animaciones pesadas). Nadie pasa frameloop (git grep 'frameloop=' solo encuentra NeuroAvatar.tsx:54). En la config del admin y del cliente conviven 2 canvas del picker + los de la preview, a 60 fps; el changelog admin registra 'Freeze del AvatarPicker' como pendiente. ParticleSphere asigna 120 Vector3 por frame y rota sin delta (:35), mas rapido en 120 Hz.
- Propuesta: dpr [1,1.5]; frameloop 'demand' o pausa por IntersectionObserver/visibilitychange; en el picker mostrar thumbnail estatico y montar el canvas solo en hover/seleccion; reutilizar un Vector3 y escalar la rotacion por delta.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots, h3.cli-chatbot, h3.vis-widget-cliente, lib.chatbot.components, h3.adm-chatbots.editar-config-bot, h4.adm-clientes.alta-cliente-con-bot, lib.chatbot.avatar
- REQUIERE-VERIFICACIÓN-HUMANA: VH-083

### [PERF-001] FKs sin índice (Task.projectId, Notification.userId/taskId, ChatbotEvent.conversationId) e índices redundantes
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `prisma/schema.prisma:584` — «projectId String»; `prisma/schema.prisma:590` — «@@index([assignedToId])»; `src/app/(protected)/dashboard/project/page.tsx:138` — «tasks: { orderBy: { id: 'asc' } },»; `prisma/schema.prisma:1410` — «@@index([sessionId])»; `prisma/schema.prisma:1343` — «@@index([slug])»; `prisma/migrations/20260318202838_init/migration.sql:176` — «ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;»; `src/modules/chatbot/server/logging/persistentLogger.ts:160` — «(c) => c.chatbotEvent.deleteMany({ where: { createdAt: { lt: threshold } } }),»
- Impacto: El include de tareas de /dashboard/project, los conteos de health-score.ts:387-398 y las cascadas Project→Task, Task→Notification y Conversation→ChatbotEvent recorren la tabla entera (no se nota al volumen de hoy). Hay índices duplicados por un unique o por un compuesto con la misma primera columna: Conversation.sessionId (:1375/:1410), BotConfig.slug (:1278/:1343), QuotaUsage.botConfigId (:1594-1595), OrgMember.userId (:530-531), EmailContact.organizationId (:1229-1230), OsMaintenancePayment.projectId (:1047-1048), EmailCampaign.organizationId (:1261-1262), OsLead.status y OsLead.assignedToId (:896-900).
- Propuesta: Decisión para Valentino (schema FROZEN): agregar @@index([projectId]) en Task, @@index([userId]) y @@index([taskId]) en Notification, @@index([conversationId]) en ChatbotEvent, y hacer los DROP de índices cubiertos que B11.5 dejó diferidos.
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): modelo.Task, modelo.Notification, modelo.ChatbotEvent, modelo.Conversation, h2.cli-proyecto, h3.adm-actividad

### [PERF-002] Mensajes carga y renderiza la conversación completa sin límite ni paginación
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/messages/page.tsx:16` — «prisma.message.findMany({ where: { organizationId }, orderBy: { createdAt: 'asc' } })»; `src/components/dashboard/MessageThread.tsx:62` — «messages.map((msg) => ({»; `src/components/dashboard/ClientChatThread.tsx:58` — «{messages.map((message) => (»
- Impacto: Con el tiempo cada visita trae y serializa al cliente todo el historial de la conversacion.
- Propuesta: Paginar (ultimos N con 'cargar anteriores') usando el indice (organizationId, createdAt).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-mensajes.conversacion, modelo.Message, h2.cli-mensajes, h2.cli-mensajes.chat-con-equipo

### [PERF-005] Plan y consumo se leen varias veces por request y getPlanForOrg escribe dentro de un camino de lectura
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/plan/page.tsx:37` — «const snapshot = await getOrgUsageSnapshot(organizationId) (repetido en :42)»; `src/lib/recommendations/get-recommendations-for-org.ts:34` — «getOrgUsageSnapshot(organizationId), (Inicio ya lo llama en dashboard/page.tsx:164 y getPlanForOrg en :116)»; `src/lib/plan/get-plan-for-org.ts:69` — «const cached = planCache.get(orgId) if (cached && cached.expiresAt > Date.now()) return cached.data await applyPendingPlanIfDue(orgId)»; `src/lib/plan/get-plan-for-org.ts:21` — «const planCache = new Map<string, CacheEntry>()»
- Impacto: Inicio hace dos lecturas de consumo y hasta tres resoluciones de plan por visita; con Suspense en paralelo todas fallan el cache a la vez y cada una puede ejecutar el update de pendingPlan. La invalidación del cache solo limpia la instancia que atiende al admin (:131-133). Bajo hoy; crece con orgs y tráfico.
- Propuesta: Envolver getOrgUsageSnapshot y getPlanForOrg en React cache(): deduplica por request sin romper el streaming de cada Suspense (el lane de Plan lo descartó creyendo lo contrario).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-plan, h2.cli-inicio, lib.plan

### [PERF-006] El layout del portal escribe User.lastDashboardVisit en cada render, sin esperar el resultado, y ningun codigo lo lee
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/layout.tsx:80` — «prisma.user .update({ where: { id: session.user.id }, data: { lastDashboardVisit: new Date() } })»; `src/app/(protected)/dashboard/layout.tsx:85` — «.catch((error) => { console.error('[lastDashboardVisit] update failed:', error)»; `prisma/schema.prisma:298` — «updatedAt DateTime @updatedAt lastDashboardVisit DateTime?»
- Impacto: Cada render completo del layout (carga, navegacion dura y cada router.refresh que el portal hace tras sus mutaciones) dispara un UPDATE sobre User sin await, tambien en modo soporte sobre el usuario del SUPER_ADMIN, y mueve User.updatedAt. Es carga de escritura sin valor sobre la Neon compartida; si el dato se empezara a usar (ultimo acceso, churn), el fire-and-forget en serverless lo puede perder (mismo riesgo que BUG-052).
- Propuesta: Quitar la escritura o, si se quiere el dato, escribirlo con await una vez por dia/sesion (solo si cambio) y darle un lector (ficha del cliente en el admin o detector de inactividad).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-shell.layout-y-navegacion, modelo.User, lib.prisma

### [PERF-010] Detector de incidencias secuencial N+1 sin maxDuration
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/detectBotIssues.ts:28` — «const bots = await unsafeGlobalQuery(»; `src/modules/chatbot/server/admin/detectBotIssues.ts:38` — «for (const bot of bots) {»; `src/modules/chatbot/server/admin/detectBotIssues.ts:267` — «const emailResult = await sendAlertEmail(issue)»
- Impacto: Por bot activo hace hasta 8 consultas en serie (:66-221) y por alerta nueva findFirst + create + email + update + Telegram en serie (:242-280). Aritmetica: 50 bots activos x 8 consultas x ~20 ms ~= 8 s antes de mandar un solo email, contra el timeout por defecto de las funciones sincronicas de Netlify (10 s). La ruta del cron no declara maxDuration (route.ts:5-20). Hoy no corre (no tiene scheduler); importa al arreglar eso.
- Propuesta: Agregados con groupBy por botConfigId en una consulta por tipo de senal, emails al final en lote, y maxDuration explicito en la ruta.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-alertas.detector-incidencias, int.cron.detect-bot-issues, lib.chatbot.admin, modelo.ChatbotEvent

### [PERF-011] Listados y consultas del admin sin paginación ni tope: tickets, workload del equipo, export masivo de leads, barrido de alertas, pipeline de leads, hilo de mensajes y resúmenes de proyectos
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: perf
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/tickets/_actions/ticket.actions.ts:59` — «const tickets = await prisma.ticket.findMany({»; `src/app/(protected)/admin/team/page.tsx:44` — «prisma.task.findMany({ where: { assignedToId: {»; `src/lib/bulk-actions.ts:50` — «const leads = await prisma.chatbotLead.findMany({»; `src/lib/alerts.ts:205` — «prisma.organization.findMany({»; `src/app/(protected)/admin/leads/page.tsx:23` — «const leads = await prisma.osLead.findMany({»; `src/app/(protected)/admin/leads/page.tsx:202` — «<OutboundLeadsView leads={leads} />»; `src/app/(protected)/admin/messages/_actions/message.actions.ts:144` — «const messages = await prisma.message.findMany({ where: { organizationId: parsedOrganizationId,»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:936` — «const projects = await prisma.project.findMany({»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:976` — «timeEntries: { select: { id: true,»
- Impacto: Con datos de prueba no se nota; con el primer año de clientes /admin/tickets trae todos los tickets de todas las orgs para filtrar en memoria, /admin/team trae todas las tareas históricas (incluidas DONE, que además se listan) con todas sus horas y el export arma el CSV completo en memoria de la action.
- Propuesta: Paginación por cursor y filtros en servidor en tickets; workload solo de tareas no DONE o en ventana; export en streaming con tope.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-tickets.bandeja, h4.adm-equipo.workload, h4.adm-clientes.acciones-masivas, h4.adm-leads.pipeline-kanban, h4.adm-mensajes.hilo-y-leido, modelo.OsLead, modelo.Message, h4.adm-proyectos.tablero-kanban, modelo.OsTimeEntry

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

### [DEU-023] /bienvenida es inalcanzable para altas reales y arrastra defectos latentes
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/lib/onboarding/core.ts:85` — «onboardingCompleted: true,»; `src/modules/chatbot/server/admin/createClientOnly.ts:85` — «onboardingCompleted: true,»; `src/modules/chatbot/server/admin/createClientWithBot.ts:135` — «onboardingCompleted: true,»; `src/app/(protected)/dashboard/layout.tsx:127` — «if ((!client.onboardingCompleted || !client.companyName?.trim()) && !preview && !isBienvenida) {»; `src/app/bienvenida/_actions/complete-onboarding.ts:39` — «// TODO: Agregar contactEmail a Organization en próximos sprints»; `src/app/bienvenida/_actions/complete-onboarding.ts:50` — «targetAudience: 'Rubro: ${parsed.data.rubro}',»; `src/actions/onboarding-actions.ts:79` — «export async function completeOnboardingAction(data: OnboardingData) {»
- Impacto: El cliente nuevo nunca ve el wizard: las tres altas vivas crean la org con onboardingCompleted: true y las dos que no (lib/actions/clients.ts:124, invitations.ts:86) no tienen importadores. Queda código mantenido con bugs listos para aparecer si alguien cambia el default: pide el ID de GA equivocado, bloquea con «Email inválido» si se borra el email opcional que ni se guarda (:11, :39), guarda el rubro en targetAudience, que nadie lee, y tiene TODOs en el camino del cliente. Además duplica un onboarding legacy muerto (components/onboarding/OnboardingWizard.tsx + actions/onboarding-actions.ts).
- Propuesta: Decisión para Valentino: (a) borrar /bienvenida y el onboarding legacy y simplificar los redirects (proxy.ts, login/actions.ts:101-107, dashboard/layout.tsx:123-129; auth.ts:73 es FROZEN), o (b) convertirlo en el primer paso real del cliente (alta con onboardingCompleted:false) arreglando GA, email, rubro, .max y TODOs.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [SEC-027], [DEU-018], [SEC-045], [FAL-010]
- Nodo(s): h2.cli-bienvenida, h2.cli-bienvenida.wizard-3-pasos, lib.proxy, lib.onboarding, modelo.ClientBrandProfile

### [DEU-024] router.push sin comentario que lo justifique en el portal (alta de ticket, bienvenida y envío de campaña)
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/bienvenida/_components/BienvenidaWizard.tsx:38` — «router.push('/dashboard')»; `src/components/dashboard/NewTicketModal.tsx:63` — «router.push('/dashboard/soporte/${res.data.ticketId}')»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/[id]/send/page.tsx:24` — «router.push('/dashboard/modules/email-marketing/campaigns')»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/[id]/send/page.tsx:23` — «router.push('/dashboard/modules/email-marketing/campaigns')»
- Impacto: Viola la regla de navegación de CLAUDE.md para portales (router.push solo con justificación inline). Patrón que se replica.
- Propuesta: redirect() dentro de la server action (complete-onboarding; createTicketAction podría redirigir al detalle) o documentar inline el motivo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [DEU-003]
- Nodo(s): h2.cli-bienvenida.wizard-3-pasos, h2.cli-soporte.crear-ticket, h2.cli-email-mkt.crear-y-enviar-campana, h2.cli-email-mkt

### [DEU-035] router.push sin justificación en el portal admin: alta de bot, card del pipeline de leads y ClientSwitcher
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/chatbots/new/CreateBotForm.tsx:80` — «router.push('/admin/chatbots/${result.botId}')»; `src/app/(protected)/admin/clients/[clientId]/_components/ClientSwitcher.tsx:64` — «function handleSelect(client: ClientOption) { setOpen(false) setSearch('')»; `src/app/(protected)/admin/clients/[clientId]/_components/ClientSwitcher.tsx:67` — «router.push('/admin/clients/${client.id}')»; `src/app/(protected)/admin/leads/_components/lead-card.tsx:69` — «onClick={presentational ? undefined : () => router.push('/admin/leads/${lead.id}')}»; `src/app/(protected)/admin/leads/_components/lead-card.tsx:82` — «router.push('/admin/leads/${lead.id}')»
- Impacto: Contradice la regla de navegación de portales (redirect() en la server action o comentario inline que justifique el push).
- Propuesta: redirect() en createBotAction tras el éxito, o documentar el motivo inline.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.crear-bot, h4.adm-clientes.detalle, h4.adm-leads.pipeline-kanban

### [DEU-038] Acciones gemelas por id y por slug divergieron: la que usa la UI devuelve err.message crudo
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/saveKnowledgeBase.ts:86` — «// PRIVACIDAD: sanitizado — el try cubre knowledgeBase.update con la KB»; `src/modules/chatbot/server/admin/saveKnowledgeBaseByOrgSlug.ts:70` — «const msg = err instanceof Error ? err.message : 'Unknown error'»; `src/modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts:139` — «const msg = err instanceof Error ? err.message : 'Unknown error'»; `src/app/(protected)/admin/chatbots/[botId]/tabs/KnowledgeTab.tsx:25` — «orgSlug={bot.organization.slug}»; `src/modules/chatbot/components/admin/BotConfigEditor.tsx:79` — «const result = orgSlug»; `src/modules/chatbot/server/admin/saveBotConfig.ts:155` — «const msg = sanitizeErrorMessage(error)»; `src/modules/chatbot/server/admin/saveBotConfig.ts:81` — «return { success: false, error: 'Invalid input: ' + parsed.error.message }»
- Impacto: Las acciones por id sanitizan y loguean; las por slug (las únicas que alcanza la UI, porque ConfigTab y KnowledgeTab siempre pasan orgSlug) devuelven el mensaje crudo de Prisma —que según el propio comentario puede ecoar la KB o el email de notificaciones— y no dejan rastro. Hay dos schemas Zod copiados que ya pueden divergir y dos endpoints públicos para lo mismo.
- Propuesta: Una sola action por recurso (resolver por slug o id dentro), con sanitizeErrorMessage y chatbotLog; borrar las ramas muertas del editor.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.editar-config-bot, h3.adm-chatbots.editar-kb, lib.chatbot.admin, h3.adm-chatbots.editar-config

### [DEU-039] triggerTransition del sitio público usado en el portal admin (alta de bot y edición de cliente)
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/onboarding/Step5Review.tsx:11` — «import { useTransitionContext } from '@/context/TransitionContext'»; `src/modules/chatbot/components/admin/onboarding/Step5Review.tsx:183` — «triggerTransition(»; `src/context/TransitionContext.tsx:118` — «router.push(target);»; `src/app/(protected)/admin/clients/[clientId]/edit/EditClientForm.tsx:92` — «triggerTransition(detailHref)»; `src/context/TransitionContext.tsx:111` — «setIsAnimating(true); // cierra shutter (0.3s)»; `src/app/layout.tsx:114` — «<Shutter />»
- Impacto: CLAUDE.md reserva triggerTransition para el sitio público (el Shutter no existe en portales); acá navega al bot recién creado con 300 ms de demora y un router.push sin comentario que lo justifique. Funciona, pero rompe la convención de navegación del portal y arrastra el estado de animación del sitio.
- Propuesta: Usar <Link> a /admin/chatbots/[id] (o router.push con comentario si se quiere imperativo post-submit).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.alta-cliente-con-bot, lib.ui, h4.adm-clientes.editar-datos

### [DEU-042] Tres implementaciones paralelas del panel de chat (ChatWindow 694 lineas, ChatbotEmbed 559, BotConfigPreview) con paridad mantenida a mano y estilos inline
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/chat/ChatWindow.tsx:43` — «// Fondo del panel — paridad WYSIWYG con la preview del admin (BotConfigPreview, // 'surfaceBg'): mismo mapeo intensityLevel → opacidad y mismo 'tint + alpha hex'. // Si esa fórmula cambia allá, cambiar acá también.»; `src/modules/chatbot/components/preview/BotConfigPreview.tsx:92` — «// ── accentSecondary visual knobs — mismos valores que ChatWindow ──────────»; `src/modules/chatbot/components/chat/ChatWindow.tsx:203` — «{true && (»
- Impacto: Cada cambio de UI del chat se hace 2-3 veces y ya divergen: colores (hallazgo del embed en cyan), mensaje de bienvenida, typewriter (StreamingMarkdown solo lo usa ChatWindow). ChatWindow viola la politica anti-vibecode (>300 lineas, CSS inline masivo, condicional muerto {true && ...}).
- Propuesta: Ejecutar EST.0: extraer un ChatShell comun (header, lista con StreamingMarkdown, input, banners) parametrizado por config, consumido por LogicCompanion, ChatbotEmbed y BotConfigPreview; mover estilos a clases/tokens.
- Esfuerzo: L  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop, h3.vis-widget-cliente, h3.adm-chatbots, lib.chatbot.components

### [DEU-048] Insights del chatbot: costo de LLM invisible y carga de 200 conversaciones completas para usar 50 × 400 caracteres
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/insights/generateInsights.ts:102` — «const { object } = await generateObject({ model, schema: InsightsResponseSchema,»; `src/modules/chatbot/server/insights/generateInsights.ts:35` — «include: { messages: { select: { role: true, content: true, createdAt: true },»; `src/modules/chatbot/server/insights/generateInsights.ts:59` — «.slice(0, 50)»; `src/modules/chatbot/server/insights/generateInsights.ts:99` — «const provider = getLLMProvider('google') const model = provider.getModel('gemini-2.5-flash')»; `netlify/functions/generate-insights-cron.ts:5` — «// Agendada vía netlify.toml: [functions."generate-insights-cron"] schedule = "0 9 * * *".»
- Impacto: Todos los días, por cada bot activo con al menos 10 conversaciones, se llama a Gemini y el uso no queda en QuotaUsage ni en ningún evento: develOP no ve ese costo ni tiene tope de gasto. Además la query trae todos los mensajes de hasta 200 conversaciones (hasta 40 mensajes de 4000 caracteres cada una) para mandar 50 resúmenes de 400 caracteres; el modelo está fijo y no hay timeout.
- Propuesta: Registrar result.usage (tokens y costo con calculateCost) en un ChatbotEvent o en QuotaUsage; limitar la query a 50 conversaciones y a mensajes USER con take; usar el modelo del plan; pasar abortSignal con timeout.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots, int.vertex, int.cron.generate-insights, modelo.ChatbotInsight

### [DEU-051] Los errores de infraestructura del webhook del motor solo van a stdout y los fallos de envio no se loguean (logger NOOP por default)
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/api/motor/webhook/[channelToken]/route.ts:51` — «} catch (error) { logger.error('motor-inbound: error de infraestructura procesando el webhook', error)»; `src/lib/logger.ts:61` — «error(msg: string, meta?: unknown) { this.format('error', msg, meta) }»; `src/modules/motor/adapters/whatsapp/outbound/client.ts:257` — «const logger = deps.logger ?? NOOP_LOGGER»
- Impacto: La route atrapa la excepcion y devuelve 500, asi que onRequestError (instrumentation.ts:49) no se dispara, y el logger solo escribe a stdout (no hay captureConsoleIntegration). El BSP reintenta hasta 7 dias y despues descarta. Una falla persistente (drift de schema, Neon caido) haria perder todos los mensajes del primer cliente sin que nadie se entere. Del lado de salida, sendMotorMessage no pasa logger, asi que reintentos y fallos del BSP no dejan ninguna traza.
- Propuesta: Agregar Sentry.captureException (con flush) en el catch de la route y cablear un logger real por default en sendMotorMessage/sendViaProvider. Es el mismo patron que D1-c1 'Fallos manejados que solo hacen console.error'.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp, int.sentry, lib.logger

### [DEU-055] admin/page.tsx: 865 líneas con el cálculo de KPIs dentro del componente y el error de lint react-hooks/immutability
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/page.tsx:497` — «let cumulativeRevenue = 0»; `src/app/(protected)/admin/page.tsx:500` — «cumulativeRevenue += revenue»; dato de la auditoría, _crudo/eslint.json línea 740 — «"regla": "react-hooks/immutability",»; `src/app/(protected)/admin/page.tsx:353` — «const revenueMap = new Map<string, number>()»
- Impacto: Cada cambio de métrica obliga a tocar un server component que mezcla 15 consultas, reglas de negocio (qué cuenta como respuesta, cuándo se reconoce un ingreso) y JSX, sin tests sobre esos cálculos; el único error de lint del lote vive acá (línea 500). Viola la política anti-vibecode (componente > 300 líneas, lógica de negocio en UI).
- Propuesta: Extraer consultas y cálculos a un módulo de lib (funciones puras testeables), recomputar el acumulado sin reasignar un let y dejar la página como composición.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-dashboard, h4.adm-dashboard.kpis-operativos-y-financieros, h4.adm-dashboard.tendencias-historicas

### [DEU-063] Borrar un proyecto tiene dos implementaciones distintas (el detalle usa la legacy, sin Zod ni try) y hay 8 server actions exportadas sin consumidores
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/projects/_components/projects-board.tsx:156` — «const result = await deleteProject(projectId)»; `src/app/(protected)/admin/projects/[projectId]/_components/delete-project-button.tsx:75` — «<form action={deleteProjectAction} className="flex justify-end gap-3">»; `src/lib/actions/projects.ts:111` — «const projectId = (formData.get('projectId') as string | null) ?? ''»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:524` — «isInternal: false,»; `src/lib/actions/projects.ts:114` — «await prisma.project.delete({ where: { id: projectId } })»; `src/app/(protected)/admin/projects/[projectId]/_components/delete-project-button.tsx:6` — «import { deleteProjectAction } from '@/lib/actions/projects'»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:829` — «return fail(error instanceof Error ? error.message : 'Failed to delete project')»
- Impacto: El tablero borra con deleteProject (Zod, transacción, ActionResult) y la ficha con deleteProjectAction (cast de FormData sin Zod, delete directo, redirect). Cualquier cambio, como auditoría, soft-delete o aviso al cliente, hay que hacerlo dos veces y ya divergen. Además quedan exportadas y sin uso: getProjectById (con isInternal fijo en false y otro texto en :510), unmarkMilestonePaid, createMaintenancePayment, y 5 actions de lib/actions/projects.ts (createProjectAction, updateProjectAction, createTaskAction, updateTaskStatusAction, deleteTaskAction).
- Propuesta: Unificar en project.actions.deleteProject; la ficha puede llamarla y después hacer redirect. Borrar las exports muertas, o conectar unmarkMilestonePaid como 'Deshacer'.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: [DEU-067]
- Nodo(s): h4.adm-proyectos.borrado, lib.actions, h4.adm-proyectos.eliminar-proyecto, modelo.Project, lib.audit-log, h4.adm-audit

### [DEU-067] Cuatro módulos 'use server' legacy sin importadores y 6 actions muertas más, que duplican versiones vivas con contratos peores
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/settings.ts:92` — «error: error instanceof Error ? error.message : 'No se pudo guardar la configuración.',»; `src/lib/actions/settings.ts:191` — «const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'»; `src/lib/actions/leads.ts:14` — «async function ensureAdmin() { const session = await auth() return session?.user?.role === 'SUPER_ADMIN'»; `src/lib/actions/clients.ts:177` — «members: { where: { role: 'ADMIN' },»; `src/lib/actions/services.ts:21` — «export async function createServiceAction(»; `src/lib/actions/projects.ts:35` — «export async function createProjectAction(»
- Impacto: clients.ts, services.ts, settings.ts y leads.ts (+ leads-constants.ts) no tienen importadores. Tampoco los tienen 5 de las 7 actions de projects.ts ni markLeadAsRead. Duplican _actions vivas (settings.actions.ts:127/:175, project.actions.ts:593/:643, admin/leads/_actions) y arrastran defectos que volverían si alguien las reconecta: error.message crudo (settings.ts:92, :142, :234, :270, :304, y JSON.parse del service account en :285), token de invitación en claro (:180-189), fallback a localhost (:191), usuario creado antes del email (:172-194), guard reimplementado (leads.ts:14-17, settings.ts:20-28), take:1 sin orderBy (clients.ts:177-181) y update sin Zod (clients.ts:157-171). Encarecen cada cambio: hay que adivinar cuál es la versión vigente.
- Propuesta: Borrar clients.ts, services.ts, settings.ts, leads.ts y leads-constants.ts. En projects.ts, migrar los dos consumidores vivos (delete-project-button.tsx:6 → deleteProject; task-list.tsx:22 → una action en admin/projects/_actions) y borrar el archivo. Quitar markLeadAsRead de contact.ts.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [DEU-001], [DEU-018], [DEU-063]
- Nodo(s): lib.actions, h4.adm-config, h4.adm-equipo, h4.adm-leads, h4.adm-proyectos, h4.adm-clientes

### [DEU-001] Flujo de invitacion huerfano: ninguna action viva emite links a /accept-invite (y la de clientes nunca los enviaba)
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/invitations.ts:110` — «const inviteUrl = '${baseUrl}/accept-invite?token=${token}'»; `src/lib/actions/invitations.ts:116` — «message: 'Invitación generada para ${email}. El link fue impreso en la consola del servidor.',»; `src/lib/actions/settings.ts:194` — «await sendEmail({»; `src/lib/email.ts:15` — «if (!resend) { return { success: true }»; `src/app/accept-invite/actions.ts:15` — «export async function acceptInviteAction(»; `src/lib/actions/settings.ts:148` — «export async function inviteTeamMemberAction(input: {»; `src/lib/actions/settings.ts:192` — «const inviteUrl = '${baseUrl}/accept-invite?token=${token}'»
- Impacto: inviteClientAction no tiene callers y nunca envia ni imprime el link (el mensaje miente); inviteTeamMemberAction vive en settings.ts, modulo sin importadores, y enviaria por Resend (contra PLAN-012) fingiendo exito sin RESEND_API_KEY. /accept-invite queda como superficie publica sin uso. Si alguien lo reconecta tal cual, la invitacion no llega.
- Propuesta: Decidir: borrar accept-invite + invitations.ts + inviteTeamMemberAction, o reconectarlo enviando por Brevo con resultado verificado y la regla de contrasena unica.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-invite.emitir-invitacion, h1.auth-invite.aceptar-invitacion, h4.adm-config, int.resend, h4.adm-equipo, h4.adm-equipo.invitar-miembro, h1.auth-invite

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
- Evidencia: `prisma/schema.prisma:1661` — «targetType String»; `prisma/schema.prisma:1662` — «targetId String»; `prisma/schema.prisma:1673` — «@@index([targetType, targetId, createdAt])»; `src/app/(protected)/admin/audit-log/_components/AuditLogClient.tsx:246` — «{entry.targetType} / {entry.targetId.slice(0, 12)}»; `src/app/(protected)/admin/audit-log/_components/AuditLogClient.tsx:27` — «targetType: string»; `prisma/schema.prisma:1652` — «model AdminAuditLog {»
- Impacto: Las acciones sobre un cliente quedan con targetType/targetId heterogéneos (Organization, BotConfig, ChatbotLead…); reconstruir todo lo hecho sobre la org X exige conocer cada tipo y resolver ids, y después de un hard-delete ya no se pueden resolver.
- Propuesta: Decisión para Valentino (schema FROZEN): agregar targetOrganizationId opcional sin FK (para sobrevivir al hard-delete), indexado, y completarlo en logAdminAction.
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: —
- Nodo(s): modelo.AdminAuditLog, h4.adm-audit, h4.adm-audit.listado-y-filtros

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
- Evidencia: `src/lib/onboarding/seed-tasks-for-org.ts:5` — «await prisma.onboardingTask.createMany({»; `src/lib/data/onboarding-tasks.ts:21` — «title: 'Configurar AgencySettings de la organización',»; `src/components/dashboard/OnboardingStatusCard.tsx:28` — «if (tasks.length === 0) return null»; `src/modules/chatbot/server/admin/createClientOnly.ts:85` — «onboardingCompleted: true,»; `src/lib/onboarding/seed-tasks-for-org.ts:4` — «export async function seedOnboardingTasksForOrg(organizationId: string) { await prisma.onboardingTask.createMany({»; `src/lib/actions/clients.ts:139` — «await seedOnboardingTasksForOrg(newOrgId).catch((e) => (módulo sin importadores)»; `src/lib/actions/invitations.ts:93` — «await seedOnboardingTasksForOrg(org.id).catch((e) => (módulo sin importadores)»; `src/modules/chatbot/server/admin/createClientOnly.ts:101` — «await tx.orgMember.create({ (alta viva; no siembra tareas, igual que createClientWithBot.ts:151 y lib/onboarding/core.ts:101)»
- Impacto: La siembra solo se llama desde src/lib/actions/clients.ts e invitations.ts, que no tienen importadores, y el alta vigente no siembra tareas: la tarjeta 'Estamos configurando tu negocio' del inicio (dashboard/page.tsx:61) nunca aparece para clientes nuevos. Si se reactivara, el cliente vería títulos internos del equipo (nombres de modelos, 'Crear cuenta del cliente y enviar credenciales'). Las actions de admin para avanzarlas (src/actions/admin/onboarding-tasks.ts) tampoco tienen importadores.
- Propuesta: Decidir: retirar la feature (catálogo, siembra, actions y tarjeta) o reconectarla con títulos para el cliente y una UI de admin que las avance.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio, h2.cli-inicio.estado-onboarding, lib.data, modelo.OnboardingTask, h2.cli-inicio.checklist-de-onboarding, h2.cli-bienvenida, lib.onboarding

### [DEU-019] Dos escapes unsafeGlobalQuery quedaron con razón 'PENDIENTE-DECISIÓN': métricas del admin rotuladas como del bot de develOP agregan todas las orgs
- Dominio: D6  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/admin/getActivityChartData.ts:12` — «const events = await unsafeGlobalQuery( 'PENDIENTE-DECISIÓN: chart de actividad agrega eventos de todas las orgs en una página enmarcada como el bot develOP»; `src/modules/chatbot/server/admin/getActivityChartData.ts:15` — «c.chatbotEvent.findMany({ where: { createdAt: { gte: sevenDaysAgo } },»; `src/modules/chatbot/server/admin/getLatencyHistory.ts:73` — «const events = await unsafeGlobalQuery( 'PENDIENTE-DECISIÓN: latencia P50/P95 agrega eventos de todas las orgs»; `src/modules/chatbot/server/admin/getLatencyHistory.ts:68` — «// PENDIENTE-DECISIÓN: agrega latencia (chat.message_completed) de TODAS las»; `src/modules/chatbot/server/admin/getLatencyHistory.ts:82` — «take: 2000,»; `src/app/(protected)/admin/chatbot/health/page.tsx:146` — «Verificar que CHATBOT_GOOGLE_API_KEY sea válida y la Generative Language API esté»; `src/modules/chatbot/server/health/buildHealthVerdict.ts:65` — «hint: health.checks.llmProvider.error ?? 'Revisá la API key y que la API esté habilitada.',»; `src/modules/chatbot/server/config/envValidator.ts:35` — «name: 'GOOGLE_APPLICATION_CREDENTIALS', required: true,»; `src/modules/chatbot/server/admin/getLatencyHistory.ts:25` — «return d.toLocaleString('es-AR', { day: '2-digit',»; `src/app/(protected)/admin/chatbot/health/page.tsx:12` — «checkChatbotHealth('develop'), getLatencyHistory(24),»; `src/modules/chatbot/server/admin/getActivityChartData.ts:30` — «const key = new Date(event.createdAt).toLocaleDateString('es-AR', {»; `src/app/(protected)/admin/chatbot/activity/page.tsx:34` — «slug="develop"»; `src/modules/chatbot/components/admin/health/LatencyChart.tsx:160` — «Datos reales»; `src/modules/chatbot/server/admin/getLatencyHistory.ts:37` — «d.setHours(d.getHours() - i, 0, 0, 0)»; `src/modules/chatbot/server/admin/getLatencyHistory.ts:66` — «const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000)»; `src/modules/chatbot/server/admin/getActivityChartData.ts:25` — «const key = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })»
- Impacto: De los 68 escapes globales del repo (37 archivos), estos dos son los únicos sin justificación de plataforma: /admin/chatbot/activity y /admin/chatbot/health muestran números de todos los clientes como si fueran del bot propio, y el de actividad trae sin límite todos los eventos de 7 días. Solo afecta al admin, sin fuga hacia clientes.
- Propuesta: Decidir: scopear a forOrg(<org de develOP>) o re-rotular ambas páginas como métricas de plataforma y agregar en SQL (groupBy) en vez de traer filas.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-actividad, h3.adm-health, lib.isolation, lib.chatbot.health, lib.chatbot.admin, h3.adm-actividad.grafico-semanal, h3.adm-health.latencia-p50-p95, h3.adm-health.latencia, h3.adm-actividad.grafico-7-dias, modelo.ChatbotEvent

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

### [DEU-022] Modulo 'use server' muerto que guarda credenciales en claro con url 'ENCRIPTADO_EN_TEXTO'
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/actions/onboarding-actions.ts:79` — «export async function completeOnboardingAction(data: OnboardingData) { // sin Zod»; `src/actions/onboarding-actions.ts:115` — «url: 'ENCRIPTADO_EN_TEXTO',»; `src/actions/onboarding-actions.ts:117` — «description: data.domainCredentials»; `src/components/onboarding/OnboardingWizard.tsx:6` — «import { saveOnboardingProfile } from '@/actions/onboarding-actions' // unico importador, a su vez sin importadores»
- Impacto: Hoy es inalcanzable desde la UI, pero si alguien lo reconecta vuelve a guardar credenciales en texto plano con una etiqueta que miente, sin validacion.
- Propuesta: Borrar onboarding-actions.ts y components/onboarding/OnboardingWizard.tsx (ver candidatos de poda).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-036]
- Nodo(s): h2.cli-bienvenida.guardar-perfil-legacy, modelo.ClientAsset

### [DEU-025] IDs internos (cuid) en URLs del portal (ticket, lead, campaña, ?p= de proyecto), todos resueltos contra la org de la sesión: sin IDOR, contra la regla de CLAUDE.md
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:61` — «where: { id: ticketId, organizationId },»; `src/components/dashboard/SoporteBoard.tsx:108` — «href={'/dashboard/soporte/${ticket.id}'}»; `src/lib/tickets/actions.ts:164` — «ticketUrl: '${baseUrl}/dashboard/soporte/${ticketInfo.id}',»; `src/app/(protected)/dashboard/chatbot/leads/[id]/page.tsx:34` — «const lead = await getLeadByIdForOrg(id, session.organization.id)»; `src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:178` — «where: { id: campaignId, organizationId: org.id },»; `src/app/(protected)/dashboard/project/page.tsx:268` — «href={'?p=${p.id}'}»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/page.tsx:159` — «href={'/dashboard/modules/email-marketing/campaigns/${campaignId}/send'}»; `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:60` — «const ticket = await prisma.ticket.findUnique({ where: { id: ticketId, organizationId },»; `src/app/(protected)/dashboard/project/page.tsx:194` — «? projects.find((p) => p.id === selectedId)»; `src/components/dashboard/home/BusinessHero.tsx:131` — «href={'${LEADS_HREF}/${semaforo.top.id}'}»; `src/modules/chatbot/server/admin/multiTenantQueries.ts:148` — «return forOrg(organizationId).chatbotLead.findFirst({»; `src/components/dashboard/NewTicketModal.tsx:63` — «router.push('/dashboard/soporte/${res.data.ticketId}') (además sin comentario que justifique router.push)»; `src/app/(protected)/dashboard/chatbot/leads/[id]/page.tsx:33` — «const lead = await getLeadByIdForOrg(id, session.organization.id)»
- Impacto: Sin explotación: los tres ids (ticket, lead, campaña) se validan contra la org de la sesión (getLeadByIdForOrg usa forOrg, multiTenantQueries.ts:147-155). Pero contradice CLAUDE.md y la decisión B6.3, y los ids viajan en historial, mails y logs.
- Propuesta: Decidir si la regla aplica a cuid opacos; si aplica, token público por ticket/lead; si no, actualizar CLAUDE.md.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-soporte, h3.cli-chatbot, h2.cli-email-mkt, h2.cli-proyecto, h2.cli-inicio.semana-en-numeros

### [DEU-026] Navegación dura con window.location.assign y <a href> internos en vitrina, recomendaciones, plan y resultados
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/PremiumModuleCard.tsx:212` — «// Navegación HARD (no triggerTransition — no aplica en portales, ni router.push):»; `src/components/dashboard/PremiumModuleCard.tsx:215` — «window.location.assign('/dashboard/messages?${params.toString()}')»; `src/components/dashboard/home/Recommendations.tsx:91` — «window.location.assign('/dashboard/messages?${params.toString()}')»; `src/components/dashboard/plan/UpgradeCtaButton.tsx:100` — «window.location.assign(targetHref)»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/new/page.tsx:40` — «router.push('/dashboard/modules/email-marketing/campaigns') // con comentario :38-39 (tambien :72 y :153)»; `src/lib/actions/upsell.ts:143` — «revalidatePath('/dashboard')»; `src/components/dashboard/AlertaMetrica.tsx:97` — «<a href={accion.href}»
- Impacto: Recarga completa del portal tras pedir un módulo (se pierde estado y aparece el loading global) y un tercer patrón de navegación que CLAUDE.md no lista. Está justificado inline, por eso BAJA.
- Propuesta: Redirigir desde una server action (redirect()) o no revalidar /dashboard antes de navegar; documentar la excepción en CLAUDE.md.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-servicios.vitrina-modulos, h2.cli-inicio, h2.cli-plan, h2.cli-servicios, h2.cli-plan.pedir-cambio-de-plan, h2.cli-inicio.ideas-para-crecer, h2.cli-servicios.solicitar-modulo, h2.cli-resultados

### [DEU-027] Motores PDF y endpoints huérfanos siguen publicados (api/reports/monthly, api/dashboard/leads/recent, DownloadReportButtons con ExecutiveReportTemplate, datos mock y el dominio legacy)
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/api/reports/monthly/route.ts:21` — «export async function GET(req: NextRequest) {»; `src/app/api/reports/monthly/route.ts:106` — «analytics: analyticsResult?.ok ? analyticsResult.data : null,»; `src/components/dashboard/DownloadReportButton.tsx:129` — «export function DownloadReportButtons({ organizationId, isLocked = false }: { organizationId?: string, isLocked?: boolean }) {»; `src/app/api/dashboard/leads/recent/route.ts:50` — «...lead,»; `src/components/dashboard/ExecutiveReportTemplate.tsx:120` — «www.develop-agency.com»; `src/components/dashboard/DownloadReportButton.tsx:82` — «const mockData: ReportData = {»; `package.json:148` — «"html2canvas": "^1.4.1",»; `src/app/api/reports/monthly/route.ts:31` — «const month = searchParams.get('month') ?? currentMonth() (solo rotula; los datos no se filtran por mes)»; `src/lib/analytics.ts:97` — «// Return mock data for demo property or missing/invalid credentials if (!keyJson || property === MOCK_PROPERTY_ID) {»; `src/lib/reports/MonthlyReport.tsx:296` — «if (data.analytics) { (no mira isMockData) ... Tu sitio recibió ${a.sessions...} visitas este mes»; `src/app/api/reports/monthly/route.ts:125` — «const filename = 'reporte-${client.companyName.toLowerCase().replace(/\s+/g, '-')}-${year}-${mon}.pdf'»
- Impacto: Superficie autenticada viva sin dueño: /api/reports/monthly acepta organizationId por query para SUPER_ADMIN y armaría un PDF con datos demo como si fueran reales; /api/dashboard/leads/recent devuelve filas completas (incluye convertedToOsLeadId de LeadOS). Más ExecutiveReportTemplate, AnalyticsPeriodSelector y LeakMeter sin importadores.
- Propuesta: Borrar las dos rutas, lib/reports/MonthlyReport.tsx y los cuatro componentes; ajustar tests/e2e/40.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados, h3.cli-chatbot, modelo.ChatbotLead, h2.cli-reportes-email, h2.cli-reportes-email.pdf-reporte-ejecutivo, lib.reports, int.ga4, int.search-console

### [DEU-028] Convenciones de CLAUDE.md incumplidas en el portal: colores de servicio cruzados, CSS inline donde hay clases Tailwind, Lucide sin strokeWidth={1.5} y copy sin tildes
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/services/page.tsx:37` — «glowRgb: '167,139,250',»; `src/app/(protected)/dashboard/services/page.tsx:44` — «glowRgb: '52,211,153',»; `src/app/(protected)/dashboard/services/page.tsx:51` — «glowRgb: '251,191,36',»; `src/app/(protected)/dashboard/services/page.tsx:292` — «background: 'linear-gradient(90deg, #06b6d4 0%, #818cf8 50%, #c084fc 100%)',»; `src/app/(protected)/dashboard/services/page.tsx:116` — «<Icon size={24} />»; `src/app/bienvenida/_components/Step3Tour.tsx:37` — «<Icon size={16} />»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/new/page.tsx:10` — «const glassBorder: React.CSSProperties = { background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px) saturate(180%)',»; `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:28` — «background: 'rgba(16,185,129,0.05)',»; `src/app/(protected)/dashboard/modules/motor-resenas/_components/ReviewItem.tsx:92` — «style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px) saturate(180%)',»; `src/app/(protected)/dashboard/cuenta/facturacion/page.tsx:116` — «<AlertTriangle size={17} className='mt-0.5 shrink-0 text-red-400' />»; `src/app/(protected)/dashboard/page.tsx:222` — «icon={<Sparkles size={10} />}»; `src/components/dashboard/NotificationCenter.tsx:146` — «<Bell size={15} />»; `src/components/dashboard/ProfileForms.tsx:53` — «<CheckCircle size={14} className="flex-shrink-0" />»; `src/components/dashboard/CuentaTabs.tsx:9` — «{ href: '/dashboard/cuenta/facturacion', label: 'Facturacion', icon: CreditCard },»; `src/components/dashboard/NewTicketModal.tsx:14` — «title: z.string().min(5, 'El titulo debe tener al menos 5 caracteres.'),»; `src/components/dashboard/SubscriptionBanner.tsx:16` — «El pago de tu suscripción se encuentra vencido. Por favor, regulariza tu situación ...»; `src/components/dashboard/plan/PlansShowcase.tsx:121` — «<Check size={10} strokeWidth={2} />»; `src/components/dashboard/plan/PlansShowcase.tsx:305` — «<Lock size={7} strokeWidth={2.5} />»; `src/components/dashboard/home/AIExecutiveBriefV2.tsx:81` — «<RefreshCw size={11} />»; `src/components/dashboard/home/HealthScore.tsx:156` — «<Sparkles className="text-cyan-400 mb-2" size={28} />»
- Impacto: IA aparece violeta, Automatización esmeralda y Software ámbar en Servicios, cuando CLAUDE.md fija IA esmeralda, Automatización ámbar y Software violeta. Gradiente estático inline existiendo clases Tailwind, e iconos sin strokeWidth={1.5} (también trafico/page.tsx:153, PremiumModuleCard.tsx:144, :265, Step2Conexiones.tsx:32).
- Propuesta: Mapear SERVICE_TYPE_CONFIG a #10b981 / #f59e0b / #8b5cf6, clases Tailwind para el gradiente y strokeWidth={1.5}.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-servicios.servicios-contratados, lib.ui, h2.cli-email-mkt, h2.cli-agenda, h2.cli-resenas, h2.cli-tienda, h2.cli-cuenta.historial-de-facturas, h2.cli-shell, h2.cli-plan, h2.cli-inicio

### [DEU-029] Logica de datos y mapas duplicados en componentes del portal (Prisma en OnboardingStatusCard, PRIORITY/CATEGORY_MAP x3, calcPosition x3)
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/components/dashboard/OnboardingStatusCard.tsx:17` — «const tasks = await prisma.onboardingTask.findMany({»; `src/components/dashboard/SoporteBoard.tsx:28` — «const PRIORITY_MAP: Record<TicketPriority, { label: string; cls: string; pulse?: boolean }> = {»; `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:33` — «const PRIORITY_MAP: Record<string, { label: string; cls: string; pulse?: boolean }> = {»; `src/components/dashboard/NotificationCenter.tsx:27` — «function calcPosition(trigger: HTMLElement): PanelPosition {»
- Impacto: Etiquetas/colores de prioridad y el posicionamiento de popovers hay que cambiarlos en 3 lugares (tambien admin ticket-list.tsx:57-70, AnnouncementsFeed.tsx:21, EmojiPopover.tsx:32); la consulta Prisma dentro de un componente UI contradice la regla anti-vibecode.
- Propuesta: Extraer etiquetas de ticket compartidas, un hook de posicion de popover del portal y mover la consulta de onboarding a lib.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio.estado-onboarding, h2.cli-soporte, h2.cli-shell

### [DEU-030] Código muerto o duplicado en el lote: 6 de 7 exports de lib/premium-modules.ts, 3 actions admin de lib/actions/messages.ts y markNotificationReadAction
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/lib/premium-modules.ts:46` — «export async function hasModuleActive(»; `src/lib/actions/messages.ts:16` — «export async function sendMessageAction(»; `src/lib/actions/notifications.ts:19` — «export async function markNotificationReadAction(id: string): Promise<ActionResult> {»; `src/lib/actions/notifications.ts:15` — «revalidatePath('/dashboard') revalidatePath('/dashboard')»
- Impacto: hasModuleActive duplica isModuleActive (src/lib/modules/check-activation.ts:3-15); lib/premium-modules.ts convive con lib/data/premium-modules.ts (mismo nombre, otro rol); las actions admin de messages.ts duplican admin/messages/_actions/message.actions.ts:177 y quedan como superficie 'use server' sin dueño.
- Propuesta: Conservar activateModule/cancelModule para el alta de módulos y borrar el resto; mover getActiveModuleSlugs a lib/modules; eliminar sendMessageAction, markAdminMessagesAsReadAction, markMessagesAsReadAction y markNotificationReadAction; quitar el revalidatePath duplicado.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.premium-modules, lib.actions

### [DEU-031] Snapshots JSON del brief casteados con 'as unknown as' sin validar
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/lib/ai/brief-history.ts:42` — «healthScores: row.healthScores as unknown as HealthScoreResult, weekResults: row.weekResults as unknown as WeekResultsData,»; `src/lib/ai/executive-brief.ts:341` — «const healthScores = generation.healthScore as unknown as Prisma.InputJsonValue»
- Impacto: Un snapshot viejo o con otra forma da healthTotal undefined y el delta sale NaN ('bajó NaN puntos') en el prompt y en el email.
- Propuesta: Validar con Zod al leer y descartar el snapshot que no valide.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio.resumen-ia, modelo.ExecutiveBriefSnapshot

### [DEU-032] Gate de plan del reporte duplicado y su invariante no lo compara con build.ts (verde por arnés)
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/lib/reports/executive-weekly/report-eligible-plan.ts:9` — «export function reportEligiblePlan(planKey: PlanKey): boolean { return planKey === 'PRO' || planKey === 'BUSINESS'»; `src/lib/reports/executive-weekly/build.ts:91` — «if (plan.key !== 'PRO' && plan.key !== 'BUSINESS') {»; `src/lib/reports/executive-weekly/report-eligible-plan.invariant.ts:14` — «import { reportEligiblePlan, businessOnlyReportSection } from './report-eligible-plan.ts' (no importa build.ts aunque :7 dice verificar contra él)»; `src/lib/plan/plan-allows.ts:19` — «case 'reports': return plan.reportsEnabled»
- Impacto: Si cambia el gate de build.ts, la tarjeta de preferencias muestra algo falso y el invariante sigue verde; además el gate ignora Plan.reportsEnabled, que el admin puede editar.
- Propuesta: Que build.ts importe reportEligiblePlan, o que ambos usen planAllows(plan, 'reports'); actualizar el comentario que lo declara fuera de scope.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-reportes-email, lib.reports, lib.plan

### [DEU-033] send-manual.ts reimplementa la secuencia de send.ts y deja el reenvío expuesto a duplicados por timeout
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/lib/reports/executive-weekly/send-manual.ts:27` — «* P2.B.1) no tiene forma de acotar a 1 org ... Esta función reimplementa la MISMA secuencia»; `src/lib/reports/executive-weekly/send-manual.ts:93` — «const sendResult = await sendTransactionalEmail({ (después del upsert PENDING :74-89)»; `src/lib/reports/executive-weekly/send-manual.ts:151` — «return { ok: false, reason: 'UNEXPECTED_ERROR', periodKey, error: message }»
- Impacto: Dos copias del flujo crítico divergen con cada cambio; si la función corta después de Brevo y antes del update, el log queda PENDING y el próximo 'Enviar ahora' manda el mail de nuevo. El admin recibe el mensaje de error interno.
- Propuesta: Extraer un sendForOrg(orgId, { respectCadence }) que usen el cron y el botón; tratar un PENDING reciente como envío en vuelo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes, h2.cli-reportes-email.reporte-semanal, lib.reports, int.brevo

### [DEU-034] getPlanForOrg ignora el estado de la suscripción: una org CANCELED o PAST_DUE conserva su plan
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/lib/plan/get-plan-for-org.ts:74` — «const sub = await prisma.subscription.findUnique({ where: { organizationId: orgId }, select: { plan: { select: { (no lee status)»; `prisma/schema.prisma:658` — «status SubscriptionStatus @default(ACTIVE)»; `src/lib/reports/executive-weekly/send.ts:81` — «subscription: { is: { status: 'ACTIVE' } }, (el cron sí lo filtra)»
- Impacto: Hoy ningún código pone CANCELED, así que el impacto es latente: cuando develOP dé de baja a un cliente, el bot y el portal siguen con el cupo y las features del plan anterior.
- Propuesta: Definir el plan efectivo para CANCELED y PAST_DUE (fallback o bot en pausa), aplicarlo en getPlanForOrg y cubrirlo con un invariante.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [FAL-006]
- Nodo(s): h2.cli-plan, h3.cli-chatbot, lib.plan, modelo.Subscription

### [DEU-036] Los barrels del chatbot exportan componentes que nadie monta y nombres que nadie importa
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/index.ts:40` — «ChatMessages, ChatMessage, ChatInput,»; `src/modules/chatbot/index.ts:89` — «export { saveClientSettings } from './server/admin/saveClientSettings'»; `src/modules/chatbot/index.server.ts:13` — «export { ProviderNotImplementedError, ModelNotSupportedError,»; `src/modules/chatbot/components/chat/index.ts:3` — «export { ChatMessages } from './ChatMessages' export { ChatMessage } from './ChatMessage' export { ChatInput } from './ChatInput'»; `src/modules/chatbot/components/chat/index.ts:8` — «export type { ChatWindowProps, UIChatMessage, ToolCallInUIMessage } from './types'»; `src/modules/chatbot/components/chat/types.ts:34` — «degradedMode?: boolean»
- Impacto: Del barrel cliente se consumen 3 de 52 exports y del server 20 de 85 nombres. ChatMessages, ChatMessage, ChatInput y QuickReplyChips no los monta nadie (el registro de Valentino cuenta fixes que 'aterrizaron en codigo muerto'), A11Y-01 citaba ChatInput, que no se renderiza, y saveClientSettings sigue publicada sin UI. Encarece cambios y confunde auditorias.
- Propuesta: Borrar los componentes muertos y recortar los barrels a lo consumido, o reemplazarlos por imports directos.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.chatbot.barrel, lib.chatbot.components

### [DEU-037] Las etiquetas del lead buscan con 'in'/indice sobre objetos planos y channelLabel nunca recibe datos
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/lead-intent-labels.ts:45` — «if (intent != null && intent in INTENT_LABELS) { return INTENT_LABELS[intent as ChatbotLeadIntent]»; `src/modules/chatbot/lead-detail-presentation.ts:71` — «return CHANNEL_LABELS[channel.toLowerCase()] ?? null»; `src/modules/chatbot/server/tools/captureLead.ts:381` — «const lead = await tx.chatbotLead.create({ botConfigId: ctx.botConfigId,»
- Impacto: Hoy los callers pasan valores del enum de Prisma, pero la firma acepta cualquier string: 'constructor' o 'toString' devolverian una funcion (React no la renderiza). channelLabel y su mapa (incluye WhatsApp e Instagram) no tienen datos: el unico create de ChatbotLead no escribe channel, asi que la fila 'Canal' del detalle nunca aparece, tampoco para un bot vendido por WhatsApp.
- Propuesta: Usar Object.hasOwn o Map; escribir channel en capture_lead ('widget'/'embed') o quitar la fila 'Canal' del detalle.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.chatbot.lead-presentation, h3.cli-chatbot, modelo.ChatbotLead

### [DEU-040] Ciclos de dependencia de sólo tipos en plantillas de KB y detalle del bot
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/onboarding/kb-templates/index.ts:3` — «export interface KBTemplate {»; `src/modules/chatbot/components/admin/onboarding/kb-templates/index.ts:14` — «import { legalTemplate } from './legal'»; `src/modules/chatbot/components/admin/onboarding/kb-templates/concesionaria.ts:1` — «import type { KBTemplate } from './index'»; `src/app/(protected)/admin/chatbots/[botId]/tabs/ConfigTab.tsx:4` — «import type { BotWithDetails } from '../BotDetailClient'»; `.dependency-cruiser.cjs:27` — «tsPreCompilationDeps: true,»
- Impacto: depcruise sigue en 22 ciclos (10 de kb-templates, los del detalle del bot y los de lead-pipeline). Son de tipos, sin efecto en runtime, pero ensucian el reporte y traban extraer el módulo.
- Propuesta: Mover KBTemplate y BotWithDetails/MappedEvent a sus propios types.ts.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.plantilla-kb-industria, h3.adm-chatbots

### [DEU-041] Higiene del editor: contador fijo, label faltante, industria no canónica y ramas muertas
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/BotConfigEditor.tsx:318` — «return 28»; `src/modules/chatbot/components/admin/BotConfigEditor.tsx:47` — «industry: 'generic',»; `src/modules/chatbot/components/admin/config/BotConfigDiffModal.tsx:37` — «leadNotificationMode: 'Modo de notificación',»; `src/modules/chatbot/components/admin/BotConfigEditor.tsx:72` — «if (onSave) {»
- Impacto: '28 campos editables expuestos' es un número fijo (hoy son 29); el diff muestra 'allowedDomains' crudo porque falta en FIELD_LABELS; el default 'generic' no existe en el vocabulario canónico (industries.ts:11 'generico'); onSave y la rama sin orgSlug nunca se usan.
- Propuesta: Borrar o calcular el contador, completar FIELD_LABELS, usar 'generico' y eliminar onSave y las ramas por id.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.editar-config-bot

### [DEU-043] LegacyNeuroAvatar.tsx acumula 6 errores de eslint del baseline (incluido un 'any' explicito) y 25 lineas con mojibake
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx:601` — «ref={bufferAttrRef as any}»; `src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx:523` — «const r = 1.05 + Math.random() * 0.3;»; `src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx:114` — «// Avanzar transici├│n de contexto»
- Impacto: Rompe la regla dura 'cero any' y suma errores de react-hooks/purity (:523,:525,:532) y react-hooks/refs (:603 x2) al baseline de 102. Los comentarios con mojibake no se leen. Los comentarios del adapter lo tratan como FROZEN (LegacyNeuroAvatarAdapter.tsx:10) aunque no esta en la lista de congelados.
- Propuesta: Decision para Valentino: confirmar si LegacyNeuroAvatar esta congelado. Si no: tipar el ref como THREE.BufferAttribute, generar los random en un useState lazy, y re-guardar los comentarios en UTF-8.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.chatbot.components

### [DEU-044] revealSafeMarkdown.ts contiene un byte NUL literal: git trata el archivo como binario
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/chat/revealSafeMarkdown.ts:15` — «const PH = '<byte NUL>' // placeholder de 1 char (preserva longitudes → índices 1:1)»
- Impacto: git log --numstat muestra '-\t-' para el archivo (commit 3bc2349a): los diffs y revisiones de PR no muestran cambios en la logica que limpia el markdown parcial; las herramientas de edicion lo rechazan.
- Propuesta: Reemplazar el literal por el escape '\u0000' (mismo valor en runtime).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.chatbot.components

### [DEU-045] avatarStyleSchema: el schema del cliente se documenta 'sin escape hatches' pero es identico al del admin, y la validacion server importa el registry de componentes cliente
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/avatar/avatarStyleSchema.ts:45` — «* Zod schema for CLIENT-side mutations (dashboard). Same surface but * without the escape hatches.»; `src/modules/chatbot/components/avatar/avatarStyleSchema.ts:31` — «return [...AVATAR_IDS, 'emoji', 'image']»; `src/modules/chatbot/components/avatar/avatarStyleSchema.ts:2` — «import { AVATAR_IDS } from './registry'»
- Impacto: Doc que contradice el codigo en una regla de validacion; dos schemas redundantes; las server actions (updateBotAppearance.ts:10, saveBotConfig.ts:6) arrastran el registry que importa modulos 'use client' (HeavyAvatarsLazy) solo para leer ids.
- Propuesta: Unificar en un solo schema con los ids en una constante pura (sin importar componentes), y corregir el docstring.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, h3.adm-chatbots, lib.chatbot.components

### [DEU-046] ClientSettingsForm muerto, con tres any y un toggle 'Activar Chatbot' que no hace nada
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/dashboard/ClientSettingsForm.tsx:26` — «(bot.quickReplies as any[]) ?? []»; `src/modules/chatbot/components/dashboard/ClientSettingsForm.tsx:36` — «accentColor: accentColor as any, position: position as any,»; `src/modules/chatbot/components/dashboard/index.ts:3` — «export { ClientSettingsForm } from './ClientSettingsForm' (unico importador; modules/chatbot/index.ts:85 no lo re-exporta)»; `src/modules/chatbot/index.ts:89` — «export { saveClientSettings } from './server/admin/saveClientSettings'»
- Impacto: Viola la regla 'cero any' (3 errores del baseline de eslint), mantiene viva una server action publica sin consumidor y un toggle que el servidor ignora; cualquiera que lo reconecte creeria que el cliente puede activar su bot.
- Propuesta: Borrar ClientSettingsForm, su export y saveClientSettings (BotPersonalization lo reemplaza).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot.personalizacion, lib.actions

### [DEU-047] Errores de eslint de reglas del React Compiler en el embed y el tooltip proactivo
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/tooltip/useTooltipTriggers.ts:31` — «const lastActivityRef = useRef<number>(Date.now()) (react-hooks/purity)»; `src/modules/chatbot/components/tooltip/ProactiveTooltip.tsx:79` — «setCurrentPrompt(prompt) (react-hooks/set-state-in-effect)»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:317` — «chatbot.messages.map((m) => ( (react-hooks/refs)»; `src/modules/chatbot/components/tooltip/useTooltipTriggers.ts:89` — «const reset = () => setTrigger(null) (nueva identidad en cada render: re-dispara los effects que la usan)»
- Impacto: Errores del baseline de eslint en codigo publico; con el React Compiler activo pueden producir renders inconsistentes. reset sin useCallback hace que ProactiveTooltip re-ejecute su effect en cada render.
- Propuesta: useCallback para reset, inicializar lastActivityRef en el effect, derivar el prompt sin setState en effect; revisar el falso positivo de refs en el embed.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop.tooltip-proactivo, h3.vis-widget-cliente.chat-embebido

### [DEU-049] Email de insights sin escapar botName/companyName y con URL que puede quedar 'undefined'; el email de prueba de leads usa otra plantilla que la real
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/notifications/sendInsightsNotification.ts:36` — «para ${botName} en ${organizationName}</p>»; `src/app/api/cron/generate-insights/route.ts:66` — «dashboardUrl: '${process.env.NEXT_PUBLIC_APP_URL}/dashboard/chatbot',»; `src/modules/chatbot/server/admin/sendTestNotification.ts:46` — «const result = await sendLeadNotificationEmail({»; `src/modules/chatbot/server/notifications/sendLeadNotification.ts:74` — «${escapeHtml(lead.createdAt.toLocaleString('es-AR'))}»
- Impacto: Un nombre de bot con HTML se inyecta en el mail del propio cliente (riesgo bajo, mismo tenant). El boton 'probar notificacion' del admin manda una plantilla que produccion no usa (produccion usa lib/client-notifications/templates.ts) y con la hora en UTC: la prueba no representa lo que recibe el cliente.
- Propuesta: Escapar con el helper de sendLeadNotification; fallback explicito de URL; que sendTestNotification use renderLeadEmail de client-notifications y borrar sendLeadNotification.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots, h3.cli-chatbot, lib.chatbot.notifications, int.brevo

### [DEU-050] Contratos muertos o desfasados: messagesAdded ignorado, checkQuota con MAX_SAFE_INTEGER y tipos publicos que no coinciden con Prisma
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/quota/checker.ts:56` — «messagesAdded: number (no se usa en upsertPeriod :76-92)»; `src/modules/chatbot/server/chat/handleChatRequest.ts:226` — «const r = await checkQuota(orgId, bot.id, Number.MAX_SAFE_INTEGER)»; `src/modules/chatbot/shared/types.ts:50` — «export type ChatbotLeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'converted'»; `src/modules/chatbot/shared/types.ts:40` — «export type AvatarStyle = 'neuro' | 'legacy_neuro' | 'simple' | 'custom_image' | 'emoji' | 'none'»
- Impacto: El barrel publico exporta tipos que contradicen el enum real (Prisma usa NEW/CONTACTED/IN_NEGOTIATION/WON/LOST; el avatar real usa monograma/onda/geometrico/image): quien los use compila contra valores que no existen. withinQuota de checkQuota siempre es true y confunde.
- Propuesta: Borrar los tipos sin consumidores, quitar messagesAdded y dejar checkQuota como lectura de uso con nombre propio.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.chatbot.shared, lib.chatbot.quota

### [DEU-052] Clasificador de P2002 duplicado: el motor mantiene su propio isUniqueViolation en vez del guard de la frontera de aislamiento (PLAN-483)
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/motor/domain/prisma-errors.ts:10` — «export function isUniqueViolation(error: unknown, field?: string): boolean { if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {»; `src/lib/isolation/scoped-model.ts:56` — «* El motor tiene su clasificador local equivalente (motor/domain/ * prisma-errors.ts, isUniqueViolation): NO se consolida acá para no estrenar * un import cruzado entre módulos — queda anotado como deuda de consolidación»
- Impacto: Son dos clasificadores que pueden divergir. El del motor es mas preciso (mira meta.target por campo) y el de isolation no. Cualquier cambio de formato del error en Prisma hay que arreglarlo en dos lugares.
- Propuesta: Mover la variante con parametro field a src/lib/isolation/scoped-model.ts (export desde @/lib/isolation, que el motor ya puede importar) y borrar motor/domain/prisma-errors.ts, migrando sus 3 importadores (handle-message.ts:18, identity.ts:24, sendMessage.ts:24).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): lib.isolation, h3.vis-whatsapp

### [DEU-053] Las conversaciones del motor nunca se cierran: una sola conversacion OPEN perpetua por contacto y canal
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/motor/adapters/whatsapp/inbound/handle-message.ts:72` — «const existing = await tx.motorConversation.findFirst({ where: { wabaChannelId, contactIdentityId, status: 'OPEN' }, orderBy: { createdAt: 'asc' },»; `prisma/schema.prisma:2097` — «status MotorConversationStatus @default(OPEN)»
- Impacto: Ningun codigo escribe status CLOSED: es una columna sin escritor. Cuando B2 use la conversacion como contexto o mida conversaciones (cuota, costo, metricas del negocio), cada contacto va a tener un hilo infinito, el contexto va a crecer sin limite y las metricas por conversacion no van a significar nada.
- Propuesta: Definir en B2 la politica de cierre (por inactividad o al vencer la ventana de 24 h) y aplicarla al reutilizar la conversacion en upsertOpenConversation.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-whatsapp, modelo.MotorConversation

### [DEU-054] POST /api/admin/chatbot/insights/generate es una ruta huérfana que llama a Vertex sin el tope de pendientes del cron, sin Zod y sin manejo de errores
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/api/admin/chatbot/insights/generate/route.ts:12` — «const body = (await req.json()) as { botSlug?: unknown }»; `src/app/api/admin/chatbot/insights/generate/route.ts:24` — «const result = await generateInsightsForBot(bot.organizationId, bot.id)»; `src/app/api/cron/generate-insights/route.ts:38` — «if (pendingCount >= 5) {»
- Impacto: Hoy nadie la llama (ver ausencias), pero sigue publicada. Un SUPER_ADMIN, o una sesión robada de uno, puede invocarla en bucle: cada llamada es una consulta a Gemini con hasta 50 conversaciones del cliente y le agrega hasta 5 insights PENDING más, sin el freno de 5 pendientes que sí tiene el cron. Esos insights le llegan al cliente en Análisis y en el PDF. Un body que no es JSON da 500 sin captura.
- Propuesta: Borrarla junto con la poda. Si se quiere un botón 'generar ahora', aplicar el mismo gate de pendientes y de plan, Zod, rate limit por admin y try/catch con Sentry.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-060]
- Nodo(s): h3.adm-chatbots, lib.chatbot.insights, int.vertex, modelo.ChatbotInsight

### [DEU-056] Docs desactualizados sobre el admin: roadmap-pendientes propone una vista en /admin/clients/[clientId]/chatbot/* (ruta que solo redirige; la vista CRM ya existe en /admin/chatbots) y la lección de CLAUDE.md sobre ticket-chat ya no aplica
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx:36` — «const targetTab: TabId = requested && TAB_MAP[requested] ? TAB_MAP[requested] : 'overview'»; `docs/roadmap-pendientes.md:26` — «- **Qué:** En '/admin/clients/[clientId]/chatbot/' o equivalente, una sección read-only que muestre la 'CrmIntegration'»; `STATUS.md:216` — «1. Nueva ruta canónica '/admin/chatbots' — la vieja '/admin/clients/[id]/chatbot/*' queda deprecada»; `raíz:CLAUDE.md:189` — «'ticket-chat.tsx:110' y 'TicketStatusSelector.tsx:31' NO fueron migrados al '<Select>' compartido.»; `src/app/(protected)/admin/tickets/_components/ticket-chat.tsx:160` — «<Select»; `src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx:28` — «const org = await prisma.organization.findUnique({ where: { slug: orgSlug },»
- Impacto: Quien retome roadmap-pendientes construiría la vista en una ruta que redirige a /admin/chatbots/<botId>?tab=overview ('install' de B8.5 tampoco está en TAB_MAP), duplicando lo que la tab de Integraciones de /admin/chatbots/[botId] ya muestra (flujo D5 'Configurar y probar la integración CRM').
- Propuesta: Marcar la pendiente de roadmap-pendientes.md:24-30 como cubierta o reubicarla en /admin/chatbots/[botId], y anotar en la bitácora que 'install' no se implementó.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots, h4.adm-clientes, h4.adm-tickets.cambio-estado

### [DEU-057] PageTransition vive en el layout: anima solo el primer montaje del admin, no cada navegación
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/layout.tsx:65` — «<PageTransition>{children}</PageTransition>»; `src/app/(protected)/admin/_components/PageTransition.tsx:21` — «initial="hidden"»; `src/app/(protected)/admin/alerts/_components/alert-card.tsx:57` — «navega con <Link> + PageTransition, NO con router.push ni triggerTransition»
- Impacto: El layout de App Router persiste entre navegaciones, así que el fade-up corre una vez al entrar al admin y las páginas siguientes aparecen sin transición, aunque otros componentes asumen lo contrario. Código que promete algo que no hace.
- Propuesta: Moverlo a un template.tsx (se remonta por navegación) o borrarlo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-shell, h4.adm-shell.acceso-y-layout

### [DEU-058] Deuda anti-vibecode en Clientes: componente de 772 lineas y fetch directo a route handlers
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:124` — «const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8' })»; `src/app/(protected)/admin/clients/[clientId]/_components/ResendCredentialsButton.tsx:18` — «const res = await fetch('/api/admin/users/${userId}/resend-credentials', { method: 'POST' })»; `src/app/(protected)/admin/clients/[clientId]/_components/SendExecutiveReportButton.tsx:18` — «retryAfterSeconds?: number»
- Impacto: ClientsListClient (772 lineas) mezcla lista, seleccion, bulk, archivo, borrado, deep-link y la tarjeta: cada cambio toca un archivo enorme. Los botones de credenciales y reporte usan fetch directo en vez de server actions; el 429 con retryAfterSeconds se muestra como error generico (:61).
- Propuesta: Separar ClientCard, BulkBar y el flujo de borrado en archivos propios; mover las dos llamadas a server actions con resultado tipado y mostrar el tiempo de espera del rate limit.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.listado, h4.adm-clientes.reenviar-credenciales, h4.adm-clientes.reporte-ejecutivo-manual

### [DEU-059] Contenido del mensaje del admin sin .max(): termina en la base y en el email
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/messages/_actions/message.schemas.ts:17` — «content: z.preprocess( emptyStringToUndefined, z.string().min(1, 'El mensaje no puede estar vacio.')»
- Impacto: Sin tope de largo en servidor ni en el textarea (message-input.tsx:101-110); un pegado accidental muy largo se guarda y se manda por email al cliente. Sólo lo escribe un SUPER_ADMIN.
- Propuesta: Agregar .max() razonable (p. ej. 5000) y maxLength en el textarea con el mismo valor.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-mensajes.responder, int.brevo

### [DEU-061] Helpers y rótulos duplicados con divergencias en admin/leads
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/leads/[leadId]/page.tsx:64` — «function serviceBadgeTone(serviceType: OsServiceType | null): string {»; `src/app/(protected)/admin/leads/_components/demo-form.tsx:48` — «function serviceBadgeTone(serviceType: DemoServiceType): string {»; `src/app/(protected)/admin/leads/_components/lead-pipeline.shared.ts:46` — «RESPONDIO: 'Respondio',»
- Impacto: serviceBadgeTone/serviceLabel existen tres veces ([leadId]/page.tsx:64-92, demo-form.tsx:48-76, lead-card.helpers.ts:33-61); statusLabel de la ficha dice 'Respondió' ([leadId]/page.tsx:103) y el board 'Respondio'; relativeTime (lead-activity.helpers.ts:50) y formatRelativeTime (lead-card.helpers.ts:3) difieren ('dias' vs 'd', guard de NaN sólo en uno). Cada cambio de copy o de servicio hay que hacerlo en varios lugares.
- Propuesta: Un único módulo de presentación del lead (labels, tonos, fechas) en _components y que ficha, card y demos lo importen.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-leads

### [DEU-062] IDs internos (cuid) en URLs del admin: /admin/messages/[orgId], /admin/leads/[leadId] y /admin/clients/[clientId], que además acepta id o slug
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/messages/_components/conversation-list.tsx:104` — «href={'/admin/messages/${conversation.organizationId}'}»; `src/app/(protected)/admin/messages/[orgId]/page.tsx:28` — «where: { id: orgId },»; `src/app/(protected)/admin/clients/[clientId]/page.tsx:42` — «OR: [{ id: orgSlug }, { slug: orgSlug }],»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:630` — «href={'/admin/clients/${client.id}'}»; `src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx:29` — «where: { slug: orgSlug },»; `src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx:22` — «permanentRedirect('/login')»; `src/app/(protected)/admin/clients/[clientId]/page.tsx:33` — «const { clientId: orgSlug } = await params»; `src/app/(protected)/admin/clients/_actions/plan.actions.ts:168` — «revalidatePath('/admin/clients/${organizationId}')»; `src/app/(protected)/admin/projects/_components/project-card.tsx:251` — «href={'/admin/projects/${project.id}'}»; `src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx:28` — «const org = await prisma.organization.findUnique({ where: { slug: orgSlug },»; `src/lib/alerts.ts:278` — «link: '/admin/clients/${organization.id}',»; `src/app/(protected)/admin/tickets/_components/ticket-chat.tsx:242` — «href={'/admin/clients?delete=${ticket.organizationId}'}»; `src/components/admin/managers/ChatbotManager.tsx:45` — «const clientPath = organizationSlug ?? organizationId»
- Impacto: Incumple la regla de CLAUDE.md (usar slugs o tokens en URLs). El slug ya viaja en la conversación (message.actions.ts:55, conversation-list.tsx:15) y no se usa. Mismo criterio en clients (ClientTabsNav.tsx:34 usa client.id).
- Propuesta: Decidir la convención del admin (slug para orgs); si se adopta, rutear Mensajes por slug y resolver id en servidor.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [DEU-025]
- Nodo(s): h4.adm-mensajes, h4.adm-leads, h4.adm-clientes, h3.adm-chatbots, h4.adm-clientes.detalle, modelo.Organization, h4.adm-proyectos, h4.adm-alertas.webhook-agencia, h4.adm-tickets.solicitud-baja

### [DEU-064] El criterio 'proyecto interno' se repite como slug mágico 'develop' en 7 sitios y el helper único que declara el registro no existe
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/projects/[projectId]/layout.tsx:164` — «const isInternalProject = project.organization?.slug === 'develop'»; `src/app/(protected)/admin/projects/[projectId]/tasks/page.tsx:57` — «const showApprovalFlow = project.organization?.slug !== 'develop'»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:510` — «const businessName = project.organization?.companyName ?? 'Proyecto interno develOP'»; `src/app/(protected)/admin/projects/[projectId]/page.tsx:163` — «// P0-6: scoping defensivo. SUPER_ADMIN ve cualquier proyecto (incl. internos // con organizationId null); cualquier otro rol futuro queda atado a su org.»
- Impacto: El registro de cambios (Proyectos_ registro de cambios.md:56) dice que se extrajo isInternalProject() como fuente única, pero git grep 'isInternalProject(' da 0. La condición está en layout.tsx:147 y :164, page.tsx:169, tasks/page.tsx:57, project.actions.ts:233 y :454, y page.tsx:11 (la lista). serializeProjectDetail fija isInternal en false. Los comentarios de la ficha siguen hablando de organizationId null aunque la columna es NOT NULL (schema.prisma:559). Es la 'bomba de tiempo' que el propio registro describe.
- Propuesta: Crear un helper isInternalProject(org) y una constante AGENCY_ORG_SLUG en lib, usarlos en los 7 sitios y actualizar los comentarios.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-138]
- Nodo(s): h4.adm-proyectos, modelo.Project

### [DEU-065] Catálogos y tipos copiados a mano: PremiumFeatureKey castea slugs que no le pertenecen, BotAlertType local 'pendiente de prisma generate' y ASSET_TYPES espejado
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/settings/_actions/settings.actions.ts:114` — «moduleKey: mod.slug as PremiumFeatureKey,»; `src/lib/premium-features.ts:51` — «key: 'motor-resenias',»; `src/lib/data/premium-modules.ts:24` — «slug: 'motor-resenas',»; `src/app/(protected)/admin/settings/alerts/AlertSettingsClient.tsx:7` — «// Include new enum values pending prisma generate type BotAlertType =»
- Impacto: El tipo de la consola dice que las claves son las 11 del catálogo legacy pero en runtime llegan los slugs de PremiumModule (otra lista): el compilador no protege nada. El catálogo legacy solo lo usa lib/actions/settings.ts (sin importadores). El enum BotAlertType ya tiene los 9 valores en schema.prisma:139-149, así que la copia local es innecesaria.
- Propuesta: Tipar moduleKey como string (o el tipo del catálogo de premium-modules), importar BotAlertType de @prisma/client y podar premium-features.ts junto con lib/actions/settings.ts.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-017]
- Nodo(s): h4.adm-config.precios-modulos, lib.premium-features, h4.adm-alertas.detector-incidencias, modelo.PremiumModule

### [DEU-066] Validación laxa en entradas del admin: actionType del audit log casteado sin validar, pageSize sin tope, orgIds sin schema y tareas asignables a cualquier usuario
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/lib/audit-log-queries.ts:35` — «...(filter?.actionType && { actionType: filter.actionType as AuditActionType,»; `src/lib/audit-log-queries.ts:19` — «pageSize = 10,»; `src/lib/bulk-actions.ts:8` — «export async function bulkPauseBots(orgIds: string[]) {»; `src/app/(protected)/admin/team/_actions/task.schemas.ts:50` — «const optionalCreateAssignedToSchema = z.preprocess( emptyStringToUndefined, UserIdSchema.optional()»
- Impacto: Un actionType inválido llega a Prisma y rompe la página del audit log (sin try/catch → error.tsx); pageSize lo decide quien llama; una tarea puede quedar asignada a un CLIENT o SETTER y desaparecer del workload (que solo lista SUPER_ADMIN). Títulos, descripciones y notas sin .max().
- Propuesta: Zod en listAuditLog (enum de AuditActionType, pageSize ≤ 100) y en bulk-actions; validar que assignedToId sea SUPER_ADMIN; .max() en textos.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-084]
- Nodo(s): h4.adm-audit.listado, h4.adm-clientes.acciones-masivas, h4.adm-proyectos.tareas

### [DEU-068] Instancias del lote: auditoría escrita después del efecto con un helper que traga el error (y archivar se registra como CLIENT_UPDATED)
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/admin/hardDeleteClient.ts:166` — «await logAdminAction({»; `src/modules/chatbot/server/admin/archiveClient.ts:41` — «actionType: 'CLIENT_UPDATED', action: 'Archivó (soft-delete reversible) el cliente "${org.companyName}"',»; `src/modules/chatbot/server/admin/manageAlerts.ts:53` — «if (before) { await logAdminAction({»
- Impacto: Todas las mutaciones auditadas del lote auditan después del efecto, con el helper que solo hace console.error (verificado en D1: audit-log.ts:40): hardDeleteClient.ts:166, archiveClient.ts:37/:73, updateClient.ts:121, updateClientInternalNotes.ts:40, manageAlerts.ts:54/:97. Si el insert del audit falla tras un hard-delete irreversible, no queda registro y nadie se entera. Archivar y desarchivar usan CLIENT_UPDATED, así que el filtro por acción del audit log no los distingue.
- Propuesta: Igual que el patrón D1-c3: captureException en el helper (decisión para Valentino, porque audit-log.ts es FROZEN-inferido) y, para el hard-delete, escribir el audit dentro de la transacción. Agregar CLIENT_ARCHIVED/CLIENT_UNARCHIVED al enum (schema FROZEN: decisión para Valentino).
- Esfuerzo: S  ·  Zona: FROZEN
- Relacionado: [DEU-012]
- Nodo(s): lib.audit-log, h4.adm-audit, h4.adm-clientes

### [DEU-069] Higiene de UI — D3: 180 detalles cosméticos (tilde 54, copy 51, strokeWidth 30, contraste 23, inline 11, otro 11)
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/_components/admin-sidebar.tsx:206` — «[copy] La card de usuario muestra el rol crudo 'SUPER_ADMIN' (PLAN-645)»; `src/app/(protected)/admin/_components/admin-sidebar.tsx:89` — «[copy] Ítems 'Health score' y 'Audit log' (:97) en inglés en una nav en español»; `src/app/(protected)/admin/_components/AdminLayoutClient.tsx:47` — «[tilde] aria-label 'Abrir menu' sin tilde; también 'Cerrar menu' en :55 y :70»; `src/app/(protected)/admin/_components/AdminLayoutClient.tsx:104` — «[contraste] Footer 'develOP Admin' en text-zinc-700 sobre #080a0c»; `src/app/(protected)/admin/_components/AdminLayoutClient.tsx:34` — «[inline] Gradientes de fondo en style inline»; `src/app/(protected)/admin/_components/admin-topbar.tsx:91` — «[strokeWidth] LogOut sin strokeWidth={1.5}»; `src/app/(protected)/admin/_components/AdminBackButton.tsx:15` — «[copy] 'Equipo' con mayúscula y el resto en minúscula: 'Volver a Equipo' contra 'Volver a leads'»; `src/app/(protected)/admin/_components/AdminErrorBoundary.tsx:15` — «[otro] Comentario 'TODO Sentry' obsoleto: SectionErrorBoundary ya captura en :64»; `src/app/(protected)/admin/error.tsx:12` — «[otro] context 'el admin' genera el tag de Sentry 'admin.el admin' (audit-log/error.tsx:12 'audit log' con espacio)»; `src/app/(protected)/admin/alerts/page.tsx:17` — «[tilde] 'automaticamente' sin tilde»; `src/app/(protected)/admin/alerts/AlertsClient.tsx:249` — «[copy] Emoji en el estado vacío 'Todo OK 🎉'»; `src/app/(protected)/admin/alerts/AlertsClient.tsx:190` — «[copy] Severidad 'Warning' en inglés (también alert-card.tsx:107)»; `src/app/(protected)/admin/alerts/AlertsClient.tsx:178` — «[contraste] Rótulo 'Severidad' text-[10px] text-zinc-600»; `src/app/(protected)/admin/alerts/AlertsClient.tsx:248` — «[contraste] Estado vacío por columna en text-zinc-600 italic»; `src/app/(protected)/admin/alerts/_components/alert-card.tsx:41` — «[contraste] Fecha de la alerta text-[10px] text-zinc-600»; `src/app/(protected)/admin/alerts/_components/alerts-date-filter.tsx:59` — «[contraste] Rótulo 'Período' text-[10px] text-zinc-600»; `src/app/(protected)/admin/alerts/_components/alerts-date-filter.tsx:94` — «[inline] style colorScheme dark inline (también :105); existe la clase [color-scheme:dark]»; `src/app/(protected)/admin/alerts/loading.tsx:14` — «[otro] Skeleton de tabs y lista vertical; la vista real es kanban de 3 columnas con 4 stat cards»; `src/app/(protected)/admin/audit-log/_components/AuditLogClient.tsx:150` — «[tilde] 'Ultimos 7 dias' sin tildes»; `src/app/(protected)/admin/audit-log/_components/AuditLogClient.tsx:151` — «[tilde] 'Tipos de accion' sin tilde»; `src/app/(protected)/admin/audit-log/_components/AuditLogClient.tsx:182` — «[tilde] 'aca' sin tilde»; `src/app/(protected)/admin/audit-log/_components/AuditLogClient.tsx:307` — «[tilde] 'Cargar mas' sin tilde»; `src/app/(protected)/admin/audit-log/_components/AuditLogClient.tsx:371` — «[tilde] 'Despues' sin tilde»; `src/app/(protected)/admin/audit-log/_components/AuditLogClient.tsx:452` — «[tilde] 'Se elimino' sin tilde»; `src/app/(protected)/admin/audit-log/_components/AuditLogClient.tsx:358` — «[copy] Badge y opciones del filtro (:141) muestran el enum crudo (CLIENT_CREATED, BOT_DELETED)»; `src/app/(protected)/admin/audit-log/loading.tsx:15` — «[otro] Skeleton con 4 stats y tabla; la página real tiene 3 stats y lista de cards»; `src/app/(protected)/admin/loading.tsx:13` — «[otro] Skeleton w-[480px] (y w-96 en :12) desborda a 390 px mientras carga»; `src/app/(protected)/admin/page.tsx:569` — «[inline] style animationDelay inline en 4 secciones (:569, :618, :668, :704)»; `src/app/(protected)/admin/page.tsx:719` — «[inline] Bloque <style> inline con keyframes dashReveal»; `src/app/(protected)/admin/announcements/_components/announcement-list.tsx:122` — «[contraste] 'Publicada ...' en text-zinc-600»; `src/app/(protected)/admin/announcements/_components/announcement-publisher.tsx:150` — «[contraste] Ayuda 'Sin fecha = no caduca.' en text-zinc-600»; `src/app/(protected)/admin/_components/type-to-confirm-dialog.tsx:112` — «[copy] Texto de pending fijo 'Eliminando...' aunque confirmLabel sea otra acción»; `src/app/(protected)/admin/clients/[clientId]/_components/ClientTabsNav.tsx:14` — «[tilde] 'Boveda' sin tilde (Bóveda)»; `src/app/(protected)/admin/clients/[clientId]/_components/ClientTabsNav.tsx:11` — «[copy] Tab 'Overview' en ingles (Resumen)»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:348` — «[tilde] 'Mas activos' sin tilde»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:480` — «[tilde] 'aca' sin tilde (acá)»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:481` — «[tilde] 'Ajusta la busqueda' -> 'Ajustá la búsqueda' (voseo y tilde)»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:662` — «[strokeWidth] Icono Bot con strokeWidth={2}»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:725` — «[strokeWidth] Icono Pin con strokeWidth={2}»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:722` — «[copy] aria-label 'Despinear'/'Pinear' (anglicismo; Fijar/Quitar fijado)»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:684` — «[copy] Abreviaturas 'Proy' y 'Msgs' (:700) en la tarjeta»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:138` — «[otro] confirm() nativo 'Pausar bots de N clientes?' sin ¿ y fuera del sistema de dialogos»; `src/app/(protected)/admin/clients/[clientId]/_components/ClientSwitcher.tsx:143` — «[strokeWidth] Icono Check con strokeWidth={2}»; `src/app/(protected)/admin/clients/[clientId]/_components/ClientHeader.tsx:77` — «[copy] Estado de suscripcion crudo del enum '(ACTIVE)'»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/OverviewTab.tsx:48` — «[tilde] 'Estado suscripcion' sin tilde y valor enum crudo en :49»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/OverviewTab.tsx:64` — «[tilde] 'Modulos activos' sin tilde»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/OverviewTab.tsx:79` — «[tilde] 'Informacion de contacto' sin tilde»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/ProjectsTab.tsx:53` — «[copy] Estado de proyecto crudo del enum (IN_PROGRESS)»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/ProjectsTab.tsx:58` — «[tilde] 'pendientes de aprobacion' sin tilde»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/SupportTab.tsx:45` — «[copy] Estado de ticket crudo del enum»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/VaultTab.tsx:24` — «[tilde] 'Subir a boveda' y 'Sin archivos en la boveda.' (:34) sin tilde»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/VaultTab.tsx:56` — «[copy] Tipo de asset crudo del enum»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/VaultTab.tsx:67` — «[contraste] Error de credencial en text-red-400/60 (bajo contraste)»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/ChatbotTab.tsx:44` — «[tilde] 'todavia' sin tilde; 'Configura' sin voseo (:45)»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/ChatbotTab.tsx:93` — «[copy] 'Quota mensual' / 'conv' (spanglish y abreviatura)»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/ChatbotTab.tsx:131` — «[tilde] 'Metricas' sin tilde; 'Activity log' (:161) y 'Knowledge Base' (:143) en ingles»; `src/app/(protected)/admin/clients/[clientId]/_components/ImpersonateButton.tsx:46` — «[copy] Titulo 'Impersonar a X?' sin ¿; descripcion 'usa el boton' sin tilde ni voseo (:47)»; `src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentCard.tsx:48` — «[contraste] Texto funcional en text-zinc-600 '(fallback Starter en runtime)'»; `src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentCard.tsx:64` — «[otro] Emoji '⏳' en la UI en lugar de icono Lucide»; `src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentForm.tsx:102` — «[contraste] placeholder text-zinc-600»; `src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideForm.tsx:136` — «[contraste] placeholder text-zinc-600»; `src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideCard.tsx:33` — «[copy] Titulo 'Billing override' en ingles»; `src/app/(protected)/admin/clients/[clientId]/_components/InternalNotesCard.tsx:90` — «[contraste] Contador en text-zinc-600»; `src/app/(protected)/admin/clients/[clientId]/edit/EditClientForm.tsx:213` — «[contraste] Contador en text-zinc-600»; `src/app/(protected)/admin/clients/[clientId]/_components/ResendCredentialsButton.tsx:51` — «[copy] 'password temporal' en ingles (contraseña)»; `src/app/(protected)/admin/leads/_components/assign-setter-control.tsx:80` — «[strokeWidth] UserRound sin strokeWidth={1.5}»; `src/app/(protected)/admin/leads/_components/assign-setter-control.tsx:228` — «[strokeWidth] LoaderCircle sin strokeWidth={1.5}»; `src/app/(protected)/admin/leads/_components/demo-form.tsx:297` — «[strokeWidth] Eye sin strokeWidth={1.5}»; `src/app/(protected)/admin/leads/_components/demo-form.tsx:308` — «[strokeWidth] PlayCircle sin strokeWidth={1.5}»; `src/app/(protected)/admin/leads/_components/demo-form.tsx:325` — «[strokeWidth] ExternalLink sin strokeWidth (también :337)»; `src/app/(protected)/admin/leads/_components/inbound-leads-table.tsx:136` — «[strokeWidth] CheckCircle2 y Sparkles sin strokeWidth (:136, :147, :191, :202)»; `src/app/(protected)/admin/leads/_components/lead-activity-feed.tsx:109` — «[strokeWidth] LoaderCircle sin strokeWidth (también :196) e ícono de canal :223»; `src/app/(protected)/admin/leads/_components/lead-card.tsx:108` — «[strokeWidth] MapPin, LoaderCircle, UserRound, Clock3, FlaskConical sin strokeWidth (:108, :127, :153, :162, :168, :173)»; `src/app/(protected)/admin/leads/_components/lead-form.tsx:181` — «[strokeWidth] X del botón cerrar sin strokeWidth»; `src/app/(protected)/admin/leads/_components/lead-pipeline.shared.ts:37` — «[tilde] 'Captacion' y 'Conversion' (:38) sin tilde»; `src/app/(protected)/admin/leads/_components/lead-pipeline.shared.ts:46` — «[tilde] 'Respondio' (la ficha dice 'Respondió'); igual en lead-activity.helpers.ts:42 y :129»; `src/app/(protected)/admin/leads/_components/lead-activity.helpers.ts:65` — «[tilde] 'Hace N dias' sin tilde»; `src/app/(protected)/admin/leads/_components/lead-filters-bar.tsx:92` — «[tilde] 'Ubicacion' y 'Periodo' (:68), 'Cualquier periodo' (:14)»; `src/app/(protected)/admin/leads/_components/lead-filters.ts:109` — «[tilde] 'Sin ubicacion'»; `src/app/(protected)/admin/leads/_components/location-typeahead.tsx:177` — «[tilde] placeholder 'Cualquier ubicacion'»; `src/app/(protected)/admin/leads/_components/inbound-leads-table.tsx:95` — «[tilde] 'Todavia', 'aca' (:96), 'Telefono' (:106, :128, :185), 'Accion' (:109)»; `src/app/(protected)/admin/leads/_components/inbound-period-filter.tsx:68` — «[tilde] 'Periodo' sin tilde»; `src/app/(protected)/admin/leads/_components/column-overview.tsx:168` — «[tilde] 'aca' sin tilde (también pipeline-column.tsx:109, lead-activity-feed.tsx:265)»; `src/app/(protected)/admin/leads/_components/lead-activity-feed.tsx:100` — «[tilde] 'proximos' (:100, :172), 'Proximo' (:125), 'conversacion' (:172)»; `src/app/(protected)/admin/leads/_components/demo-form.tsx:201` — «[tilde] 'Que cubre ... proximos pasos', 'visualizacion' (:263), 'Agrega' sin voseo (:354)»; `src/app/(protected)/admin/messages/_actions/message.schemas.ts:19` — «[tilde] 'El mensaje no puede estar vacio.'»; `src/app/(protected)/admin/leads/[leadId]/page.tsx:442` — «[copy] Rótulo en inglés 'Reactivate at'»; `src/app/(protected)/admin/leads/[leadId]/page.tsx:376` — «[copy] Monto acordado como '$${agreedAmount}' sin formato de moneda ni separadores es-AR»; `src/app/(protected)/admin/leads/_components/lead-form.tsx:189` — «[copy] Labels en inglés 'Business name', 'Instagram URL' (:291), 'Google Maps URL' (:321); opción 'WEB' (:54)»; `src/app/(protected)/admin/leads/_components/demo-form.tsx:154` — «[copy] Labels 'Demo URL' y 'Loom URL' (:166); opción 'WEB' (:39)»; `src/app/(protected)/admin/leads/_components/lead-activity-feed.tsx:124` — «[copy] 'Follow-up pendiente!' sin signo de apertura; fallback 'Super Admin' (:255)»; `src/app/(protected)/admin/leads/_components/reunion-panel.tsx:109` — «[copy] Nota interna de desarrollo visible: 'Sin notas (no debería pasar — son obligatorias desde B7)'»; `src/app/(protected)/admin/messages/_actions/message.actions.ts:122` — «[copy] Fallbacks de error en inglés ('Failed to list conversations', :164, :202, :227) y 'Invalid organization id' en message.schemas.ts:12»; `src/app/(protected)/admin/leads/_components/assign-setter-control.tsx:155` — «[contraste] 'sin evaluar' en text-zinc-600 sobre fondo oscuro (< 4,5:1)»; `src/app/(protected)/admin/messages/page.tsx:8` — «[contraste] Texto de placeholder en text-white/40 (~3,7:1)»; `src/app/(protected)/admin/leads/_components/reunion-panel.tsx:184` — «[contraste] placeholder:text-zinc-600 en el textarea de nota»; `src/app/(protected)/admin/leads/[leadId]/page.tsx:310` — «[contraste] Rótulos text-[10px] text-zinc-500 sobre bg-black/20 en todas las tarjetas (~4,1:1 o menos); patrón repetido en el lote»; `src/app/(protected)/admin/messages/_components/conversation-list.tsx:109` — «[inline] borderBottom inline; existe border-b border-white/[0.06] + last:border-0»; `src/app/(protected)/admin/leads/_components/column-overview.tsx:160` — «[inline] gridTemplateColumns inline en lugar de grid-cols-*»; `src/app/(protected)/admin/leads/_components/themed-date-input.tsx:26` — «[inline] colorScheme inline; Tailwind 4 tiene utilidad de color-scheme»; `src/app/(protected)/admin/projects/[projectId]/layout.tsx:38` — «[copy] Etiqueta de estado en inglés 'Planning' (también en project-list.tsx:27 y project-status-control.tsx:11)»; `src/app/(protected)/admin/projects/[projectId]/layout.tsx:42` — «[tilde] 'Revision' sin tilde (también en project-list.tsx:29 y project-status-control.tsx:13)»; `src/app/(protected)/admin/projects/[projectId]/layout.tsx:185` — «[strokeWidth] Building2 sin strokeWidth={1.5}»; `src/app/(protected)/admin/projects/[projectId]/layout.tsx:224` — «[strokeWidth] LogIn sin strokeWidth={1.5}»; `src/app/(protected)/admin/projects/[projectId]/page.tsx:72` — «[tilde] 'Todavia no inicio mantenimiento' (Todavía, inició)»; `src/app/(protected)/admin/projects/[projectId]/page.tsx:90` — «[tilde] 'Mantenimiento al dia' (día)»; `src/app/(protected)/admin/projects/[projectId]/page.tsx:184` — «[tilde] 'Todavia no hay una descripcion detallada' (Todavía, descripción)»; `src/app/(protected)/admin/projects/[projectId]/page.tsx:231` — «[tilde] 'Suscripcion' (Suscripción)»; `src/app/(protected)/admin/projects/[projectId]/page.tsx:190` — «[contraste] Rótulos de 10 px en text-zinc-500 sobre fondo oscuro (~4,1:1 < 4,5:1); se repite en las tiles de page.tsx, project-card.tsx:176 y hours/page.tsx:74»; `src/app/(protected)/admin/projects/[projectId]/page.tsx:35` — «[otro] Moneda fija en USD en los formateadores (también en payments/page.tsx:39, hours/page.tsx:17, project-card.tsx:97 y project-form.tsx:61): confirmar si es decisió»; `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:204` — «[tilde] 'El proyecto pasara a mantenimiento' (pasará)»; `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:211` — «[tilde] 'Todavia no hay meses generados' (Todavía)»; `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:222` — «[tilde] Encabezado 'Accion' y 'Sin accion' en :262 y :312 (Acción)»; `src/app/(protected)/admin/projects/[projectId]/_components/project-tabs.tsx:12` — «[copy] Pestaña 'Overview' en inglés»; `src/app/(protected)/admin/projects/[projectId]/_components/delete-project-button.tsx:30` — «[strokeWidth] LoaderCircle sin strokeWidth={1.5}»; `src/app/(protected)/admin/projects/[projectId]/_components/project-status-control.tsx:83` — «[strokeWidth] LoaderCircle sin strokeWidth={1.5}»; `src/app/(protected)/admin/projects/_components/project-card.tsx:183` — «[strokeWidth] CalendarDays (:183, :191), CircleDollarSign (:199), FolderKanban (:210) y CheckCircle2 (:216) sin strokeWidth={1.5}»; `src/app/(protected)/admin/projects/_components/project-form.tsx:230` — «[strokeWidth] AlertTriangle sin strokeWidth={1.5}»; `src/app/(protected)/admin/projects/_components/project-form.tsx:252` — «[tilde] Placeholder 'automatizacion' (automatización)»; `src/app/(protected)/admin/projects/_components/project-form.tsx:261` — «[tilde] Label 'Descripcion' (Descripción)»; `src/app/(protected)/admin/projects/_components/project-form.tsx:325` — «[copy] Label 'Monthly rate' en inglés»; `src/app/(protected)/admin/projects/_actions/project.schemas.ts:53` — «[copy] Errores de validación en inglés que ve el usuario: 'Project name is required' y 'Amount must be positive' (:26)»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:662` — «[copy] Mensajes en inglés que llegan a la UI vía fail: 'Project not found', 'Organization not found' (:254), 'Lead already has a linked project' (:859); en maintenance»; `src/app/(protected)/admin/projects/_actions/project.actions.ts:510` — «[copy] 'Proyecto interno develOP' frente a 'Proyecto interno de develOP' en el resto (:456, layout.tsx:167)»; `src/app/(protected)/admin/projects/_components/task-form.tsx:115` — «[copy] Errores en inglés: 'Title is required' y 'Estimated hours must be zero or positive' (:123)»; `src/app/(protected)/admin/projects/_components/task-list.tsx:150` — «[tilde] 'Esperando aprobacion del cliente' y 'Enviar a aprobacion' en :645 (aprobación)»; `src/app/(protected)/admin/projects/_components/task-list.tsx:256` — «[copy] 'Todavia no hay tareas' / 'Crea la primera tarea' (:257): falta tilde y usa tuteo en vez de voseo (Creá)»; `src/app/(protected)/admin/projects/_components/task-list.tsx:430` — «[copy] Rótulo 'Time entries' en inglés (también en :496)»; `src/app/(protected)/admin/projects/_components/task-list.tsx:487` — «[tilde] 'Descripcion' y 'Sin descripcion detallada todavia.' (:490); 'Todavia no hay horas' (:532)»; `src/app/(protected)/admin/projects/_components/task-list.tsx:362` — «[strokeWidth] ChevronDown (:362), ChevronRight (:364), LoaderCircle (:392, :475, :641), Clock3 (:412), CheckCircle2 (:427), AlertTriangle (:440) y Send (:643) sin strokeWidth»; `src/app/(protected)/admin/projects/_components/task-list.tsx:556` — «[contraste] Texto descriptivo en text-zinc-600 sobre fondo oscuro (< 4,5:1)»; `src/app/(protected)/admin/projects/_components/time-entry-panel.tsx:143` — «[copy] 'Selecciona una tarea.', 'Ingresa una cantidad de horas valida.' (:149) y 'Selecciona una fecha.' (:154): tuteo y falta tilde (Seleccioná, Ingresá, válida)»; `src/app/(protected)/admin/projects/_components/time-entry-panel.tsx:208` — «[copy] 'Carga rapida de horas' / 'Registra trabajo real ... y manten el costo/hora' (:210): faltan tildes y usa tuteo»; `src/app/(protected)/admin/projects/_components/time-entry-panel.tsx:272` — «[tilde] Placeholder 'Que se hizo, bloqueo, avance, revision...' (Qué, revisión)»; `src/app/(protected)/admin/projects/_components/time-entry-panel.tsx:300` — «[copy] 'Todavia no hay horas registradas' / 'Empieza cargando...' (:301): falta tilde y usa tuteo (Empezá)»; `src/app/(protected)/admin/projects/_components/time-entry-panel.tsx:331` — «[tilde] Encabezado 'Accion' (Acción)»; `src/app/(protected)/admin/projects/_components/time-entry-panel.tsx:288` — «[strokeWidth] Plus (:288) y Trash2 (:354, :395) sin strokeWidth={1.5}»; `src/app/(protected)/admin/projects/_components/projects-filter-bar.tsx:123` — «[copy] 'Reestablecer filtros' debería ser 'Restablecer filtros'»; `src/app/(protected)/admin/projects/_components/draggable-project-card.tsx:109` — «[copy] La confirmación de borrado del tablero no menciona los pagos de mantenimiento; la de la ficha sí (delete-project-button.tsx:69-71). Ninguna avisa que el cliente»; `src/app/(protected)/admin/projects/_components/project-list.tsx:105` — «[inline] style con maxHeight y maskImage para el preview capado; Tailwind 4 lo cubre con max-h-[42rem] y utilidades mask-*/arbitrarias»; `src/app/(protected)/admin/projects/_components/project-list.tsx:171` — «[inline] style gridTemplateColumns; existe grid-cols-[repeat(auto-fill,minmax(320px,1fr))]»; `src/app/(protected)/admin/settings/_components/settings-console.tsx:184` — «[strokeWidth] Settings2, Clock3 (:187), Target (:478), Users (:524), BellRing (:624) sin strokeWidth={1.5}»; `src/app/(protected)/admin/settings/_components/settings-console.tsx:411` — «[strokeWidth] Loader2/CheckCircle2 del botón por fila y del SaveButton (:698) sin strokeWidth»; `src/app/(protected)/admin/settings/page.tsx:17` — «[strokeWidth] Icono Settings sin strokeWidth»; `src/app/(protected)/admin/tickets/_components/ticket-chat.tsx:184` — «[strokeWidth] MessageSquareText sin strokeWidth»; `src/app/(protected)/admin/tickets/_components/ticket-list.tsx:208` — «[strokeWidth] MessageSquareText sin strokeWidth»; `src/components/admin/managers/ChatbotManager.tsx:80` — «[strokeWidth] Bot (:80), Activity (:100) y TrendingUp (:122) sin strokeWidth»; `src/components/admin/managers/ProjectManager.tsx:60` — «[strokeWidth] Loader2/Send sin strokeWidth»; `src/components/admin/managers/VaultManager.tsx:97` — «[strokeWidth] Loader2/UploadCloud sin strokeWidth»; `src/app/contact/page.tsx:140` — «[strokeWidth] CheckCircle, Send (:222), TimerReset (:231), ShieldCheck (:239), MapPin (:247), iconos de canal (:316) y ArrowUpRight (:329) sin strokeWidth»; `src/app/(protected)/admin/settings/alerts/AlertSettingsClient.tsx:213` — «[contraste] Fecha y estado de cada alerta en text-zinc-600 sobre fondo oscuro»; `src/app/(protected)/admin/settings/reports/ReportSettingsClient.tsx:146` — «[contraste] Email del destinatario y fecha (:149) en text-zinc-600»; `src/components/admin/managers/ChatbotManager.tsx:54` — «[contraste] Texto de ayuda 'Creá uno para empezar…' en text-zinc-600»; `src/app/(protected)/admin/team/page.tsx:201` — «[contraste] Descripción del estado vacío en text-white/40»; `src/app/(protected)/admin/settings/_components/settings-console.tsx:178` — «[tilde] 'configuracion', 'parametros' (:179), 'catalogo' y 'clasico' (:198), 'configuracion' (:207), 'proximas' (:308), 'modulos' (:336), 'Parametros' (:430), 'composic»; `src/app/(protected)/admin/settings/_actions/settings.actions.ts:123` — «[tilde] 'configuracion' (:123), 'Configuracion actualizada.' (:169), 'No se encontro el modulo.' (:190)»; `src/app/(protected)/admin/settings/_actions/settings.schemas.ts:38` — «[tilde] 'Modulo invalido.' y 'Ingresa un precio valido.' (:39)»; `src/app/(protected)/admin/settings/page.tsx:25` — «[tilde] Título 'Configuracion'»; `src/app/(protected)/admin/team/page.tsx:202` — «[tilde] 'aca' (también member-workload.tsx:261 y ticket-list.tsx:152)»; `src/app/(protected)/admin/team/_actions/task.actions.ts:250` — «[copy] Mensajes al usuario en inglés: 'Task not found', 'One or more tasks were not found' (:290), 'Tasks must belong to the same project' (:295) y fallbacks 'Failed t»; `src/app/(protected)/admin/team/_actions/task.schemas.ts:38` — «[copy] Mensajes de validación en inglés ('Invalid project id', 'Title is required' :79, 'Estimated hours must be…' :68)»; `src/app/(protected)/admin/team/_actions/time-entry.schemas.ts:20` — «[copy] Mensajes en inglés ('Invalid task id', 'Hours must be positive' :27)»; `src/app/(protected)/admin/team/_actions/time-entry.actions.ts:153` — «[copy] 'Task not found' y 'Time entry not found' (:216) en inglés»; `src/app/(protected)/admin/tickets/_actions/ticket.actions.ts:156` — «[copy] 'Ticket not found' y 'Failed to list tickets' (:96) en inglés»; `src/app/(protected)/admin/settings/_actions/settings.schemas.ts:22` — «[copy] .email() y .url() (:24, :25) sin mensaje propio: el toast muestra 'Invalid email' / 'Invalid url' de Zod en inglés»; `src/app/(protected)/admin/settings/alerts/AlertSettingsClient.tsx:148` — «[copy] 'issues encontrados' mezcla inglés y español»; `src/app/(protected)/admin/settings/alerts/page.tsx:28` — «[copy] Eyebrow 'Settings · Alertas' en inglés (también reports/page.tsx:34 'Settings · Reportes')»; `src/app/(protected)/admin/settings/_components/settings-console.tsx:545` — «[copy] Muestra el enum crudo 'SUPER_ADMIN' como etiqueta de rol»; `src/app/contact/page.tsx:277` — «[copy] 'Online ahora' y 'Menos de 2 horas' (:234) son promesas fijas que no dependen de nada»; `src/app/(protected)/admin/tickets/_components/ticket-date-filter.tsx:67` — «[inline] style={{ colorScheme: 'dark' }} cuando existe la clase [color-scheme:dark]»; `src/app/contact/page.tsx:219` — «[inline] style={{ transition: 'none' }} repetido (:297, :303, :339, :340) en lugar de transition-none; boxShadow inline en :120 y :260»; `src/app/(protected)/admin/settings/_components/settings-console.tsx:56` — «[otro] cn() local duplicado en vez de importar el de @/lib/utils»; `src/app/(protected)/admin/tickets/_components/ticket-chat.tsx:209` — «[otro] Burbuja con whitespace-pre-wrap sin break-words: una URL larga desborda en mobile (message-bubble.tsx:52 sí lo tiene)»; `src/components/admin/managers/ChatbotManager.tsx:130` — «[otro] 'Leads (últimos)' cuenta solo la lista recortada que pasa el tab, no el total»; `src/modules/chatbot/server/admin/manageAlerts.ts:59` — «[tilde] Texto de auditoría visible en /admin/audit-log: 'Marco alerta como vista' → 'Marcó'»; `src/modules/chatbot/server/admin/manageAlerts.ts:102` — «[tilde] Texto de auditoría visible: 'Resolvio alerta' → 'Resolvió'»; `src/lib/actions/settings.ts:342` — «[copy] El mensaje de prueba del webhook usa un cliente y un ticket inventados ('Concesionaria San Miguel') (código muerto)»; `src/lib/actions/settings.ts:204` — «[copy] El email de invitación muestra el nombre del enum 'SUPER_ADMIN' al usuario (código muerto)»; `src/lib/actions/clients.ts:30` — «[tilde] 'formato valido' → 'válido' (código muerto)»; `src/lib/actions/clients.ts:168` — «[tilde] 'ID de cliente invalido.' → 'inválido' (código muerto)»
- Impacto: Bloqueante para el primer cliente real solo en lo visual: textos sin tildes o con jerga, íconos con trazo distinto, contraste bajo y estilos inline que no siguen los tokens. Ninguno cambia datos ni permisos.
- Propuesta: Una pasada de higiene por dominio, de a un archivo, con la lista de abajo como checklist.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-shell, h4.adm-alertas, h4.adm-audit, h4.adm-dashboard, h4.adm-novedades, h4.adm-clientes, h4.adm-leads, h4.adm-mensajes, h4.adm-proyectos, h4.adm-config, h4.adm-tickets, h6.vis-contacto, h4.adm-equipo

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

### [UX-006] Motor de resenas: la vista de venta muestra '[FALTA:precio]' mientras la vitrina cobra 60 USD
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/modules/motor-resenas/_components/LockedView.tsx:151` — «Precio: <span className=... >[FALTA:precio]</span> /mes»; `src/lib/data/premium-modules.ts:31` — «priceMonthlyUsd: 60,»
- Impacto: El cliente ve un placeholder interno y dos precios distintos para el mismo modulo; incumple 'sin datos de mentira ni TODOs' de L3.
- Propuesta: Cerrar la decision comercial (PLAN-115) y leer el precio del catalogo en LockedView.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resenas.vista-de-venta, h2.cli-servicios

### [UX-009] Promesas vencidas y contradictorias visibles al cliente: «Próximamente Q3 2026» y cuatro SLA de respuesta distintos sin medición
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/PremiumModuleCard.tsx:300` — «{isComingSoon ? 'Próximamente Q3 2026' : 'Premium'}»; `src/components/dashboard/ServiceDetailModal.tsx:181` — «{isComingSoon ? 'Próximamente Q3 2026' : 'Premium'}»; `src/app/(protected)/dashboard/soporte/page.tsx:87` — «value="< 4h"»; `src/components/dashboard/MessageThread.tsx:114` — «Respondemos en {'< 4 hs'}»; `src/components/dashboard/TicketReplyForm.tsx:32` — «helperText="El equipo de develOP será notificado de inmediato. Respuesta asíncrona estándar en menos de 24hs."»; `src/app/bienvenida/_components/Step3Tour.tsx:14` — «{ icon: MessageSquare, label: 'Comunicación directa', description: 'Mensajes y soporte 24/7' },»; `src/components/sections/modulos-opcionales/ModulosOpcionales.tsx:487` — «PROXIMAMENTE Q3 2026»; `src/components/dashboard/MessageThread.tsx:119` — «<span className="text-zinc-300">9–18hs</span>»; `src/app/(protected)/dashboard/soporte/page.tsx:90` — «subtitle="Lun-Vie 9-19hs ART"»; `src/lib/plan/plan-presentation.ts:135` — «label: 'Soporte prioritario', hint: 'Respuesta en menos de 24 horas hábiles',»; `prisma/seeds/sync-plans.ts:95` — «supportTier: SupportTier.PRIORITY, (Pro ya es prioritario; la vitrina lo vende como exclusivo de Business, plan-presentation.ts:171)»; `src/app/(protected)/dashboard/modules/motor-resenas/_components/LockedView.tsx:151` — «Precio: <span className="font-semibold text-amber-300">[FALTA:precio]</span> /mes»; `src/components/dashboard/PremiumModuleCard.tsx:366` — «${priceMonthlyUsd}{' '} (la vitrina muestra USD 60 para el mismo módulo, premium-modules.ts:31)»
- Impacto: Al 14/10/2026 la vitrina promete módulos para un trimestre que ya terminó (y el propio comentario de PremiumModuleCard.tsx:335 dice que el CTA «NO promete fecha»). El cliente lee cuatro SLA distintos: 24/7 (bienvenida), <4 h Lun–Vie 9–18 (Mensajes, MessageThread.tsx:117-119), <4 h Lun-Vie 9-19 (Soporte, soporte/page.tsx:90) y <24 h (respuesta de ticket). Primer reclamo previsible del primer cliente.
- Propuesta: Sacar la fecha del badge (o leerla de PremiumModule) y definir un único SLA en una constante compartida que consuman Soporte, Mensajes y el composer del ticket.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-servicios.vitrina-modulos, h2.cli-soporte, h2.cli-mensajes, h2.cli-bienvenida, h2.cli-servicios, h2.cli-mensajes.conversacion, h2.cli-plan, lib.plan, h2.cli-servicios.vitrina-de-modulos, h2.cli-resenas, lib.modules

### [UX-010] ACTIVAR AHORA de SEO descarta el resultado: sin feedback y falla muda en la vista de soporte
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/resultados/seo/page.tsx:110` — «const activarSeo = async () => { 'use server' await requestUpsellAction('seo-avanzado', 'SEO Avanzado')»; `src/lib/actions/upsell.ts:16` — «const organizationId = session?.user?.organizationId»; `src/lib/actions/upsell.ts:60` — «upsellRequestCount: { increment: 1 },»
- Impacto: El cliente pulsa y no ve confirmación ni error (el ActionResult se tira) ni estado pendiente; repite clics o cree que no funcionó. En la vista de soporte de un SUPER_ADMIN la acción devuelve «Sesión inválida.» sin que nadie lo vea. Viola la regla de feedback visible de CLAUDE.md.
- Propuesta: Pasar el CTA a un client component con useActionState que muestre «Solicitud enviada» o el error (como RequestButton de PremiumModuleCard); usar resolveOrgId en upsell.ts.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados.seo-solicitar-activacion, lib.actions

### [UX-013] Oportunidades SEO con copy fijo de Tucuman y CTA que envia pedidos reales sobre datos de ejemplo
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/OportunidadesSEO.tsx:49` — «descripcion: 'En promedio aparecés en la posición #${data.avgPosition.toFixed(0)} de Google. Tus competidores en Tucumán están captando esos clientes.',»; `src/components/dashboard/OportunidadSEO.tsx:84` — «<input type="hidden" name="content" value={mensajeAdmin} />»; `src/app/(protected)/dashboard/resultados/seo/page.tsx:321` — «<OportunidadesSEO data={data} />»; `src/lib/searchconsole.ts:48` — «{ query: 'concesionaria tucuman', clicks: 89, impressions: 1240, ctr: 7.2, position: 4.1 },»; `src/components/dashboard/SeoAlertas.tsx:39` — «¡Eso es tráfico gratuito garantizado!»
- Impacto: Un cliente de otra ciudad lee que su competencia 'en Tucuman' le gana; en modo demo (seo/page.tsx:157-161) o con el fallback a mock (searchconsole.ts:104/:111/:213) el boton 'Quiero subir al top 3' manda a develOP un pedido real por la keyword ficticia 'concesionaria tucuman'. Tambien promete resultados ('triplicar las visitas' :23, 'garantizado').
- Propuesta: Parametrizar la ubicacion desde el perfil del negocio o quitarla; ocultar o deshabilitar las CTAs cuando data.isMockData; revisar el copy de promesas.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados, h2.cli-resultados.oportunidades-seo

### [UX-017] La instalación le pide al cliente cargar dominios en una sección que no existe y le dice que sin eso el widget no carga (falso)
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/chatbot/install/ClientInstallView.tsx:50` — «Cargá los dominios de tu sitio en Configuración → Dominios permitidos. Sin esto, el widget no va a cargar en tu web aunque pegues el snippet.»; `src/app/(protected)/dashboard/chatbot/settings/page.tsx:22` — «prisma.botConfig.findUnique({ where: { organizationId: orgId },»; `src/app/(protected)/admin/chatbots/[botId]/tabs/InstallTab.tsx:51` — «Configurá los dominios del cliente en Config → Dominios permitidos. Sin esto, el widget no va a cargar.»; `src/lib/security/validate-origin.ts:69` — «// Dominio de develOP siempre permitido (antes del check de allowedDomains)»
- Impacto: El cliente no puede completar la instalación solo (su Configuración no tiene campo de dominios) y depende de develOP; y la advertencia es falsa: el widget oficial llama desde develop.com.ar y carga igual. Admin y cliente creen tener una protección que no existe.
- Propuesta: Alinear el texto con el comportamiento real (o hacer cumplir allowedDomains en el embed, ver hallazgo del cupo) y dar al cliente un campo de dominios validado, o decir que lo carga develOP.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-068]
- Nodo(s): h3.cli-chatbot.instalacion, h3.adm-chatbots.instalacion, h3.vis-widget-cliente

### [UX-021] Editor de config sin validación en el cliente: el error vuelve como JSON crudo de Zod
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/config/tabs/BehaviorTab.tsx:65` — «label: '',»; `src/modules/chatbot/components/admin/config/tabs/BehaviorTab.tsx:136` — «onChange({ ...value, [key]: [''] })»; `src/modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts:15` — «label: z.string().min(1).max(40),»; `src/modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts:74` — «return { success: false, error: 'Invalid input: ' + parsed.error.message }»; `src/modules/chatbot/components/admin/BotConfigEditor.tsx:100` — «error: (error: Error) => 'Error: ${error.message}',»; `src/modules/chatbot/components/admin/onboarding/Step4Appearance.tsx:16` — «const optHexValid = (color: string | null) => !color || HEX_RE.test(color)»
- Impacto: 'Agregar respuesta' y 'Agregar ruta' crean filas vacías que el servidor rechaza, igual que un color tipeado a medias (el asistente sí lo valida, el editor no). El admin recibe un toast con el JSON de issues de Zod, sin campo marcado, y el modal de diff queda abierto. Viola 'validación en cliente y servidor con feedback visible'.
- Propuesta: Validar en el cliente con el mismo schema antes de abrir el diff, marcar los campos inválidos y devolver desde el servidor un mensaje legible (como zodErrorToMessage del alta).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.editar-config-bot, lib.chatbot.admin

### [UX-022] Dominios permitidos sin normalizar ni tope visible del plan
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/config/tabs/AdvancedTab.tsx:142` — «next[idx] = e.target.value»; `src/modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts:56` — «allowedDomains: z.array(z.string().max(253)).max(50),»; `src/lib/security/origin-matcher.ts:39` — «if (originHost === clean) return true»; `src/modules/chatbot/server/chat/degradedResponse.ts:68` — «effective: botAllowedDomains.slice(0, planMaxDomains),»; `src/lib/plan/fallback.ts:57` — «maxDomains: 1,»
- Impacto: Un dominio con mayúscula, espacio final o ruta ('Cliente.com.ar ', 'cliente.com.ar/contacto') nunca matchea el host del Origin y el widget queda bloqueado sin aviso; las filas vacías se guardan y ocupan cupo. El editor deja cargar 50 dominios sin mostrar que el plan (1 en fallback) sólo habilita los primeros N: el resto queda degradado en silencio.
- Propuesta: Normalizar en servidor (trim, minúsculas, sin esquema, ruta ni vacíos) y validar formato de host; mostrar 'X de N dominios del plan' y marcar los excedentes.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.editar-config-bot, lib.security, modelo.BotConfig
- REQUIERE-VERIFICACIÓN-HUMANA: VH-077

### [UX-025] Con el proveedor caido (Vertex vencida) el visitante ve 'Se corto la respuesta / Escribi de nuevo y seguimos' en cada intento, sin derivacion a WhatsApp
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/hooks/useChatbot.ts:475` — «reason: 'stream_interrupted', message: STREAM_INTERRUPTED_MESSAGE, whatsappNumber: null,»; `src/modules/chatbot/components/chat/DegradedBanner.tsx:41` — «if (AMBER_REASONS.has(info.reason)) {»; `src/modules/chatbot/components/chat/DegradedBanner.tsx:25` — «stream_interrupted: 'Escribí de nuevo y seguimos.',»; `src/modules/chatbot/server/chat/handleChatRequest.ts:1057` — «Sentry.captureException(error, {»; `src/modules/chatbot/hooks/useChatbot.ts:86` — «// Supersede al viejo 'provider_error' (que degradaba a WhatsApp al primer fallo).»; `src/modules/chatbot/hooks/useChatbot.ts:288` — «whatsappNumber: null,»; `src/modules/chatbot/hooks/useChatbot.ts:575` — «if (!config?.whatsappNumber) return»
- Impacto: Una falla persistente del proveedor (hoy la credencial vencida) se presenta como transitoria: el visitante del sitio del cliente reintenta en loop y el lead se pierde, aunque el bot tenga whatsappNumber configurado (PublicBotConfig.whatsappNumber). La variante ambar nunca ofrece WhatsApp; connection_failed tampoco (useChatbot.ts:286-290). El sistema se entera solo por Sentry del server.
- Propuesta: Contar fallas consecutivas de proveedor por sesion y, desde la segunda, escalar a la variante verde con el whatsappNumber del config y copy honesto ('el asistente no esta disponible'). Decidir con Valentino si connection_failed persistente tambien deriva.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente, h3.vis-widget-develop, int.vertex, int.sentry, h3.vis-widget-cliente.conversar, h3.vis-whatsapp, lib.chatbot.hooks
- REQUIERE-VERIFICACIÓN-HUMANA: VH-080

### [UX-027] iOS: textarea del widget a 13px sin maximum-scale en el viewport, Safari hace zoom al enfocar
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/chat/ChatWindow.tsx:585` — «fontSize: '13px',»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:510` — «fontSize: '13px',»; `src/app/embed/[slug]/page.tsx:13` — «export const viewport: Viewport = {»
- Impacto: En iPhone, enfocar el input con fuente <16px dispara auto-zoom: el panel fijo queda desencuadrado y el visitante tiene que hacer pinch. src/app/layout.tsx no exporta viewport (git grep 'export const viewport' = 0; control: embed/[slug]/page.tsx:13) y el del embed no fija maximumScale. Afecta el criterio mobile de L3 en ambos widgets.
- Propuesta: Subir la fuente del textarea a 16px en mobile (font-size: max(16px, ...)) en vez de bloquear el zoom; verificar en iOS Safari real (PLAN-505).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop, h3.vis-widget-cliente
- REQUIERE-VERIFICACIÓN-HUMANA: VH-081

### [UX-029] Personalizacion: sin validacion de largo minimo en el cliente y error generico 'Datos invalidos'
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/server/dashboard/updateBotAppearance.ts:40` — «welcomeMessage: z.string().trim().min(10).max(200).optional(),»; `src/modules/chatbot/components/dashboard/BotPersonalization.tsx:311` — «update('welcomeMessage', event.target.value.slice(0, 200)) (solo tope maximo)»; `src/modules/chatbot/components/dashboard/BotPersonalization.tsx:167` — «toast.error('Error: ${result.error}')»
- Impacto: Un mensaje de bienvenida de menos de 10 caracteres (o vacio, aunque el campo dice 'required') termina en 'Error: Datos invalidos' sin decir que campo; el cliente queda sin saber que corregir. Los details del servidor (:66-72) no se usan.
- Propuesta: Validar min 10 en el cliente con mensaje en el campo y mapear details del Zod a errores por campo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot.personalizacion

### [UX-032] Prompt y tools con la filosofia de consultora de develOP y vocabulario de concesionaria para todos los rubros (incluye 'SLA <4hs')
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/prompts/sections.ts:47` — «Precios y plazos: si te los piden sin diagnóstico, NO tirás número»; `src/modules/chatbot/server/verticals/packs/usados.ts:183` — «'El visitante preguntó el precio. Si tenés el precio publicado, dalo; ...»; `src/modules/chatbot/server/tools/offerHandoffOptions.ts:24` — «- "Que me contacten" (asíncrono, SLA <4hs)»; `src/modules/chatbot/server/tools/captureLead.ts:89` — «'true SOLO si mencionó entregar un usado en parte de pago/tasación. false si nunca lo dijo.'»
- Impacto: Seccion 2 (fija para todos los tenants) manda diagnosticar 'tamano, rubro, como operan hoy' y no dar precios; el pack usados manda dar el precio publicado; un gimnasio o una clinica reciben un bot que interroga como consultora B2B. La descripcion de offer_handoff_options le ensena al modelo un SLA de 4 h que el cliente no prometio. Los flags de capture_lead (usado, test drive, financiacion) son de autos para todos.
- Propuesta: Mover la mision y la regla de precios al pack vertical (o a la KB) y dejar en sections.ts solo reglas universales; sacar el SLA de la description; parametrizar las descripciones de flags por pack.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-api-chatbot, lib.chatbot.prompts, lib.chatbot.verticals, lib.chatbot.tools

### [UX-040] Las actions del admin que comunican errores esperados con throw se ven genéricas en producción (solo llega el digest) y cada una va a Sentry: Clientes (editar datos, notas internas, archivar y eliminar)
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/[clientId]/edit/EditClientForm.tsx:94` — «setError(err instanceof Error ? err.message : 'No se pudo guardar. Intentá de nuevo.')»; `src/modules/chatbot/server/admin/updateClient.ts:79` — «throw new Error('El email ingresado ya está registrado en otro usuario.')»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:168` — «toast.error(err instanceof Error ? err.message : 'No se pudo archivar el cliente')»; `src/instrumentation.ts:49` — «export const onRequestError = Sentry.captureRequestError»; `src/modules/chatbot/server/admin/updateClient.ts:37` — «if (!result.success) throw new Error(zodErrorToMessage(result.error))»; `src/modules/chatbot/server/admin/archiveClient.ts:30` — «if (org.deletedAt) throw new Error('El cliente ya está archivado.')»; `src/modules/chatbot/server/admin/updateClientInternalNotes.ts:23` — «if (!result.success) throw new Error('Datos inválidos para las notas internas.')»; `docs/bitacora-roadmap.md:7211` — «HTTP 200 + **'1:E{"digest":"3529886923"}'** (error server thrown ...»
- Impacto: updateClient, updateClientInternalNotes, archive/unarchive, getClientDeletionSummary y hardDeleteClient comunican errores esperados lanzando Error. En un build de produccion Next reemplaza el mensaje de errores lanzados en server actions por uno generico con digest, asi que el admin veria un texto en ingles inutil en vez de 'El email ya esta registrado'. Ademas cada error esperado se registra en Sentry via onRequestError (ruido).
- Propuesta: Que esas actions devuelvan un resultado tipado ({ ok:false, error }) para errores esperados (como ya hacen plan.actions con ActionResult) y reservar throw para fallos reales; la UI muestra result.error.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.editar-datos, h4.adm-clientes.notas-internas, h4.adm-clientes.archivar, h4.adm-clientes.eliminar, int.sentry, h4.adm-clientes.eliminar-definitivo, lib.actions
- REQUIERE-VERIFICACIÓN-HUMANA: VH-118

### [UX-044] Overview de columna con 3 columnas fijas en cualquier ancho: inusable en mobile
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/leads/_components/column-overview.tsx:19` — «const OVERVIEW_COLS = 3 // columnas de la grilla de cards dentro del overlay»; `src/app/(protected)/admin/leads/_components/column-overview.tsx:160` — «style={{ gridTemplateColumns: 'repeat(${OVERVIEW_COLS}, minmax(0, 1fr))' }}»
- Impacto: A 390 px: 390 − 32 (p-4 del overlay, :108) − 48 (p-6, :156) = 310 px; menos 2 gaps de 16 px = 278 / 3 ≈ 92,7 px por card. La card tiene p-4 (lead-card.tsx:87) → ~60 px útiles, de los que el botón de borrar ocupa 36 px + gap 12 (lead-card.tsx:124, :100): ~12 px para el nombre. Ver todos los leads de una columna desde el teléfono es imposible.
- Propuesta: Grilla responsive con clases Tailwind (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3) en lugar del style inline.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-leads.pipeline-kanban

### [UX-046] Pagos: 'Marcar pagado' no tiene confirmación, estado pendiente, mensaje de error ni forma de deshacer
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:156` — «action={async () => { 'use server' await markMilestonePaid(milestone.id)»; `src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:188` — «await generatePendingMaintenance(project.id)»; `src/app/(protected)/admin/projects/_actions/milestone.actions.ts:49` — «export async function unmarkMilestonePaid(»
- Impacto: Un clic equivocado marca como cobrado un pago del cliente y la UI no permite deshacerlo: unmarkMilestonePaid existe pero no tiene consumidores. Si la action falla (sesión vencida, error de base), el ActionResult se descarta y el botón no muestra nada. Un doble clic vuelve a sellar paidAt. 'Generar meses pendientes' no dice cuántos meses creó. Para cobros reales esto es un estado financiero que no se puede corregir desde el admin.
- Propuesta: Pasar los formularios de Pagos a un client component con useActionState o useFormStatus: confirmación breve, mensaje de error y un botón 'Deshacer' conectado a unmarkMilestonePaid (y su equivalente para mantenimiento).
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-proyectos.pagos-hitos, h4.adm-proyectos.mantenimiento, modelo.OsPaymentMilestone

### [UX-047] El tablero de proyectos usa cards de ancho fijo de 340 px que desbordan en teléfonos
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/projects/_components/project-list.tsx:125` — «className="flex w-[340px] shrink-0"»; `src/app/(protected)/admin/projects/_components/project-list.tsx:171` — «style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}»; `src/app/(protected)/admin/projects/_components/droppable-project-column.tsx:30` — «'rounded-[28px] border bg-white/5 p-5 backdrop-blur-xl transition-colors',»
- Impacto: A 390 px de ancho, después del padding del main y los 20 px por lado de la columna, quedan unos 318 px para una card de 340 px que no puede encogerse: el tablero desborda o se recorta. Es justo la vista que se diseñó para touch (HOLD de 200 ms). El overview tiene el mismo mínimo de 320 px dentro de p-4 + p-6.
- Propuesta: Usar w-full max-w-[340px] en la card y minmax(min(100%,320px),1fr) en el overview.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-proyectos.tablero-kanban
- REQUIERE-VERIFICACIÓN-HUMANA: VH-125

### [UX-048] La bandeja de tickets del admin arranca filtrada al último mes por updatedAt: un ticket abierto sin actividad reciente desaparece de la vista y de los contadores
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/tickets/_components/ticket-date-filter.tsx:88` — «const [preset, setPreset] = useState<Preset>('1m')»; `src/app/(protected)/admin/tickets/_components/ticket-date-filter.tsx:123` — «onChange({ fromMs: presetCutoff(nowMs, preset), toMs: nowMs })»; `src/app/(protected)/admin/tickets/_components/ticket-list.tsx:91` — «return tickets.filter((ticket) => { const updatedMs = new Date(ticket.updatedAt).getTime()»; `src/app/(protected)/admin/tickets/_components/ticket-list.tsx:151` — «title="No hay tickets en esta bandeja"»
- Impacto: Un ticket OPEN creado hace más de 30 días no aparece en 'Abiertos' ni en el contador al entrar a /admin/tickets, y como responder no toca updatedAt (BUG-056) tampoco vuelve aunque el cliente siga escribiendo; el estado vacío afirma que no hay tickets. Para el primer cliente real: su pedido queda sin respuesta sin que nadie lo vea.
- Propuesta: Default 'Todos' o aplicar el periodo solo a RESUELTOS (OPEN/IN_PROGRESS siempre visibles); avisar en el estado vacío cuántos quedan fuera del periodo; arreglar BUG-056.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-056]
- Nodo(s): h4.adm-tickets, h4.adm-tickets.bandeja, modelo.Ticket

### [UX-049] /admin/settings/alerts y /admin/settings/reports son páginas huérfanas y prometen crons que no corren
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/_components/admin-sidebar.tsx:96` — «{ href: '/admin/settings', label: 'Configuración', icon: Settings },»; `src/app/(protected)/admin/settings/alerts/AlertSettingsClient.tsx:124` — «Corre el detector manualmente sin esperar el cron de 15 minutos.»; `src/app/(protected)/admin/settings/_components/settings-console.tsx:628` — «9:00 AM Argentina»
- Impacto: Ningún link lleva a 'Sistema de alertas' ni a 'Reportes semanales' (git grep sin resultados fuera de su carpeta): son la única UI para correr el detector de bots, que no tiene cron (FAL-016), y el envío manual. El texto asegura 'cada 15 minutos' y una 'Hora del cron 9:00 AM' (os-follow-up solo figura en vercel.json, BUG-047). develOP confía en un monitoreo que no existe.
- Propuesta: Enlazar ambas subpáginas desde /admin/settings (o fusionarlas con /admin/alerts) y reemplazar los horarios fijos por la última corrida real leída de la base, o quitarlos hasta que haya disparador.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [FAL-016]
- Nodo(s): h4.adm-alertas.detector-incidencias, h4.adm-config.reportes-semanales, h4.adm-config, int.cron.detect-bot-issues

### [UX-050] Acciones del admin cuyo fallo no se muestra: Referidos ignora el resultado y Crear entregable / Subir a Bóveda tragan el error en console.error
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/referrals/_components/referrals-admin-table.tsx:38` — «await action(id)»; `src/components/admin/managers/ProjectManager.tsx:21` — «// Optionally show a toast here } catch (error) { console.error(error)»; `src/components/admin/managers/VaultManager.tsx:30` — «} catch (error) { console.error(error)»; `src/actions/agency-actions.ts:90` — «revalidatePath('/admin/clients')»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/VaultTab.tsx:26` — «<VaultManager organizationId={clientId} />»
- Impacto: Si la action falla (sesión vencida, proyecto de otra org, URL inválida) el admin no ve nada; 'Crear y Notificar al Cliente' tampoco confirma el éxito. revalidatePath('/admin/clients') no es la ruta en la que se está (/admin/clients/<slug>?tab=…), así que la lista puede no refrescarse hasta recargar (PROBABLE).
- Propuesta: Mostrar result.error o el error capturado (toast + role=alert), confirmar el éxito y revalidar la ruta de detalle o hacer router.refresh() tras éxito.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-referidos.gestion-estados, h4.adm-clientes.crear-entregable, h4.adm-clientes.boveda-carga, h4.adm-clientes.tab-boveda, int.sentry
- REQUIERE-VERIFICACIÓN-HUMANA: VH-129

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

### [UX-007] x-pathname nunca se setea: las tabs de Email marketing no marcan la activa y el gate de onboarding se saltea con un header
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/dashboard/modules/email-marketing/layout.tsx:24` — «const pathname = headersList.get('x-pathname') ?? ''»; `src/app/(protected)/dashboard/modules/email-marketing/layout.tsx:42` — «const isActive = pathname.startsWith(tab.href)»; `src/app/(protected)/dashboard/layout.tsx:124` — «const pathname = headersList.get('x-pathname') || ''»; `src/proxy.ts:168` — «return NextResponse.next() // no setea headers de request»
- Impacto: Las tabs Campanas/Contactos nunca muestran cual esta activa; quien mande x-pathname: /bienvenida usa el panel sin completar el onboarding.
- Propuesta: usePathname en un componente cliente para las tabs; sacar la excepcion isBienvenida (la ruta /bienvenida no vive bajo este layout).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-email-mkt, h2.cli-shell.layout-y-navegacion, lib.proxy

### [UX-008] Agenda: 'Copiar link' descarga un archivo link.txt y es un icono sin aria-label; las estadisticas van en 3 columnas fijas en mobile
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:191` — «href={'data:text/plain,${encodeURIComponent(link)}'}»; `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:192` — «download=link.txt title=Copiar link»; `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:235` — «div className='grid grid-cols-3 gap-3'»; `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:46` — «href=/dashboard/messages?context=agenda // <a> en vez de <Link>»
- Impacto: El boton con titulo 'Copiar link' baja un archivo en vez de copiar y no tiene nombre accesible; en 390 px las tarjetas con 'CANCELADOS' en mayusculas espaciadas no entran.
- Propuesta: Boton cliente con navigator.clipboard y aria-label, grid-cols-1 sm:grid-cols-3 y <Link> para navegacion interna.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-agenda.panel-de-agenda

### [UX-011] Contenido generado por IA presentado sin aviso en Resultados
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/components/dashboard/results/InsightsBlock.tsx:52` — «Lectura ejecutiva generada con tus datos reales»; `src/components/dashboard/results/analysis/DiscoveriesSection.tsx:38` — «develOP revisa las conversaciones de tu asistente y te cuenta qué encontró»; `src/lib/ai/results-insights.ts:91` — «const response = await getAnthropicClient().messages.create({»; `src/components/dashboard/home/AIExecutiveBriefV2.tsx:55` — «Resumen Ejecutivo - IA»
- Impacto: Los insights de Tráfico/SEO (Claude Haiku) y los descubrimientos del análisis (Gemini, generateInsights.ts:99-100) se presentan como lectura «con tus datos reales» o como revisión de develOP; solo el brief de Inicio lleva la etiqueta IA. Riesgo de confianza si un insight se equivoca.
- Propuesta: Badge o leyenda «Generado con IA» en InsightsBlock y DiscoveriesSection, igual al del brief.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados.insights-ia, h2.cli-resultados.analisis-mensual, int.anthropic, int.vertex

### [UX-012] Copy sin terminar en el camino del cliente: modal y descripciones de 'Ver detalles' PLACEHOLDER que ignoran el longDescription, pestaña 'Trafico', 'Ver detalles' que lleva a Mensajes
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/PremiumModuleCard.tsx:53` — «// PLACEHOLDER — editar copy real luego.»; `src/components/dashboard/ResultadosTabs.tsx:8` — «{ href: '/dashboard/resultados/trafico', label: 'Trafico', icon: BarChart3 },»; `src/app/(protected)/dashboard/services/page.tsx:157` — «href="/dashboard/messages?context=default"»; `src/components/dashboard/PremiumModuleCard.tsx:67` — «'Integración completa con Tiendanube. Ventas, productos, stock, abandonos de carrito y métricas comerciales aparecen en tu panel develOP. ...»; `src/components/dashboard/PremiumModuleCard.tsx:195` — «const longDescription = PRESET_MODULE_DETAILS[slug] ?? GENERIC_MODULE_DETAIL»
- Impacto: El modal de módulos muestra copy marcado como placeholder (promete «facturas en 30 segundos», «24/7»), la pestaña dice «Trafico» sin tilde y el «Ver detalles» de un servicio contratado lleva al chat. Sin datos inventados graves, pero se nota sin terminar.
- Propuesta: Pasar longDescription de la DB (la query de services/page.tsx:177-182 ya trae la fila completa), corregir la tilde y renombrar el botón a «Consultar» hasta que exista el detalle (PLAN-145).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-servicios.vitrina-modulos, h2.cli-servicios.servicios-contratados, h2.cli-resultados, h2.cli-servicios, h2.cli-servicios.catalogo-y-detalle

### [UX-014] AnimatedCounter sin formato es-AR ni reduced-motion y AnimatedProgressBar con animacion infinita sin pausa
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/AnimatedCounter.tsx:25` — «ref.current.textContent = Math.round(v).toString()»; `src/components/dashboard/AnimatedCounter.tsx:32` — «0»; `src/components/dashboard/AnimatedProgressBar.tsx:51` — «repeat: Infinity,»; `src/components/dashboard/AnalyticsMetricCard.tsx:55` — «<AnimatedCounter value={Math.round(rawValue)} />»
- Impacto: En Trafico 12345 sesiones se muestran '12345' mientras el resto del portal usa '12.345'; SSR y lectores de pantalla ven '0' hasta que entra en viewport; la barra de progreso anima para siempre aunque haya reduced-motion o este fuera de pantalla (regla de performance de CLAUDE.md).
- Propuesta: Formatear con Intl es-AR, renderizar el valor final en SSR y respetar useReducedMotion; pausar el sweep con IntersectionObserver.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados.trafico, h2.cli-proyecto.tareas-por-estado

### [UX-015] Reputación: performance de GBP stubbeada a 0 con FIXME y un fallo de la API se muestra como 'pendiente de conexión'
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/results/GBPMetricsCard.tsx:39` — «// FIXME(data-truth): performance.* viene stubbeado a 0 desde getGBPMetrics»; `src/lib/integrations/google-business-profile.ts:218` — «const performance = { profileViews: 0,»; `src/app/(protected)/dashboard/resultados/reputacion/page.tsx:21` — «} catch (err) { console.error('[GBP] Reputation page failed:', err)»
- Impacto: El bloque de vistas/llamadas/cómo llegar nunca aparece aunque se pide el scope businessprofileperformance; si la API falla un día, el cliente lee 'Reputación en Google pendiente de conexión' estando conectado.
- Propuesta: Cablear la Performance API o quitar el scope y el bloque; distinguir error de 'no conectado' en la página.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-041], [FAL-011]
- Nodo(s): h2.cli-resultados, int.gbp

### [UX-016] 'Cuánto te generó la web' muestra leads × ticket (supone conversión del 100 %)
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/home/MoneyEstimate.tsx:113` — «<p className="text-xs tracking-tight text-zinc-500">Cuánto te generó la web</p>»; `src/lib/dashboard/home-metrics-logic.ts:95` — «return leadCount * ticketUsd»
- Impacto: Con 20 leads y ticket US$ 1.500 el título afirma que la web generó '≈ US$ 30.000'; el subtítulo dice 'oportunidades', pero el encabezado lo presenta como plata generada.
- Propuesta: Título 'Valor potencial de tus leads' o aplicar la tasa de cierre real del embudo (sold/total).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-inicio.semana-en-numeros

### [UX-018] El widget de develOP saluda con 'Protocolo de consultoría iniciado. ¿Cómo puedo asistirle hoy?'
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/chat/ChatWindow.tsx:321` — «Protocolo de consultoría iniciado. ¿Cómo puedo asistirle hoy?»; `src/modules/chatbot/components/chat/ChatWindow.tsx:305` — «color: 'rgba(255,255,255,0.3)',»; `src/modules/chatbot/components/chat/ChatWindow.tsx:311` — «Sistema Listo»; `src/modules/chatbot/components/tool-cards/WhatsappHandoffCard.tsx:17` — «if (!whatsappUrl) { return ( <div className="rounded-xl border border-red-500/30 ...">WhatsApp no configurado.»; `src/modules/chatbot/components/chat/ChatWindow.tsx:659` — «aria-label="Send message" > <Send size={15} strokeWidth={2.25} />»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:280` — «{config.welcomeMessage}»; `src/modules/chatbot/components/preview/BotConfigPreview.tsx:218` — «{state.welcomeMessage || 'Mensaje de bienvenida'}»; `src/modules/chatbot/components/tool-cards/WhatsappHandoffCard.tsx:20` — «WhatsApp no configurado.»; `src/modules/chatbot/components/chat/ChatWindow.tsx:315` — «color: 'rgba(255,255,255,0.5)',»
- Impacto: Copy de 'usted' y tono robótico en el estado vacío del widget del sitio de develOP, contra el tono rioplatense del bot; el rótulo 'Sistema Listo' va en blanco al 30 % (contraste bajo). Solo afecta al widget de develOP (LogicCompanion); el embed de clientes no usa ChatWindow.
- Propuesta: Reemplazar por un saludo en vos y subir el contraste.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop, h3.vis-widget-cliente, h3.vis-widget-cliente.conversar, lib.chatbot.components, h3.adm-chatbots

### [UX-019] El curl de 'Test endpoint' apunta al dominio del cliente, donde no vive la API
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/chatbots/[botId]/BotDetailClient.tsx:415` — «const urlBase = domain ? 'https://${domain}' : 'https://[your-domain]'»; `src/app/(protected)/admin/chatbots/[botId]/BotDetailClient.tsx:417` — «'curl -X POST ${urlBase}/api/chatbot/${slug}/chat \\',»
- Impacto: El admin copia el curl y le pega a https://<dominio-del-cliente>/api/chatbot/..., que no existe (la API está en develop.com.ar): la prueba falla y despista.
- Propuesta: URL base = NEXT_PUBLIC_APP_URL y Origin = dominio del cliente.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots

### [UX-020] Los z-index del widget contradicen su propio contrato y el launcher tapa contenido en mobile
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/shared/zIndex.ts:9` — «* Do NOT raise these to int32 max (2_147_483_647). A widget that always wins * blocks legitimate host UI and is hostile to the embedder.»; `src/modules/chatbot/shared/zIndex.ts:19` — «backdrop: 2_147_000_000, /** Floating bubble ... */ bubble: 2_147_000_100,»; `src/modules/chatbot/components/LogicCompanion.tsx:191` — «position: 'fixed', ...position, zIndex: CHATBOT_Z_INDEX.bubble,»
- Impacto: El docstring promete dejar lugar para modales del sitio host (rango 100-9999) pero los valores quedan a ~480 mil de int32: launcher, teaser y backdrop ganan sobre cualquier menu, modal o banner del sitio de develOP y de los clientes. Sin ajuste para pantallas angostas, a 390 px la burbuja fija pisa contenido y microcopy (PLAN-533, observado en bitacora).
- Propuesta: Bajar los tokens a un rango documentado (alto solo para el panel abierto), reducir o desplazar el launcher y ocultar el teaser bajo cierto ancho; verificar a 390 px.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop, h3.vis-widget-cliente
- REQUIERE-VERIFICACIÓN-HUMANA: VH-095

### [UX-023] Paso 3 del alta: la plantilla no cambia si después se cambia la industria
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/onboarding/Step3KnowledgeBase.tsx:10` — «if (!state.businessInfo) {»; `src/modules/chatbot/components/admin/onboarding/Step3KnowledgeBase.tsx:23` — «}, [state.industry]) // Only run if industry changes or on mount (if empty)»
- Impacto: Si se visita el paso 3 y se vuelve al 1 a corregir la industria, la KB y las respuestas rápidas siguen siendo de la industria anterior (sólo se aplica con businessInfo vacío) y nada lo avisa; el comentario promete lo contrario.
- Propuesta: Al cambiar la industria con KB cargada, ofrecer reemplazar la plantilla con confirmación o marcar la diferencia.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.plantilla-kb-industria

### [UX-024] 'Probar conexión' del CRM prueba la URL guardada, no la que se está editando
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/components/admin/integrations/CrmConfigForm.tsx:37` — «const canTest = hasIntegration && webhookUrl.length > 0»; `src/modules/chatbot/server/admin/integrations/testCrmConnection.ts:51` — «const integration = await forOrg(organizationId).crmIntegration.findFirst()»; `src/modules/chatbot/server/admin/integrations/testCrmConnection.ts:75` — «webhookUrl: integration.webhookUrl,»
- Impacto: El botón se habilita con la URL del input pero la prueba usa la de la base: si develOP cambia la URL y prueba antes de guardar, ve 'Conexión OK' de la URL vieja.
- Propuesta: Deshabilitar la prueba con cambios sin guardar o mandar la URL editada (validada) a testCrmConnection.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.integracion-crm, int.n8n

### [UX-026] Card de degradado promete WhatsApp sin numero: titulo 'Te seguimos por WhatsApp' con input bloqueado y sin CTA; el mensaje puede llegar vacio
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/chat/DegradedBanner.tsx:155` — «Te seguimos por WhatsApp»; `src/modules/chatbot/components/chat/DegradedBanner.tsx:212` — «Volvé a probar más tarde y vamos a poder seguir ayudándote.»; `src/modules/chatbot/hooks/useChatbot.ts:332` — «message: typeof data.message === 'string' ? data.message : '',»
- Impacto: Bot pausado / cuota agotada / tope de conversacion sin whatsappNumber (campo opcional en el alta): el visitante lee que sigue por WhatsApp, no hay boton y el input queda bloqueado; si el server no manda message, el parrafo sale vacio.
- Propuesta: Titulo condicional a cleanNumber (p. ej. 'El chat no esta disponible ahora') y copy por defecto cuando message viene vacio.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente, h3.vis-widget-develop

### [UX-028] La intencion del lead aparece como enum crudo (PURCHASE_READY) y los colores de intencion nunca matchean
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:158` — «{lead.intent ?? '—'} ·{' '}»; `src/modules/chatbot/components/dashboards/ConversationsTable.tsx:150` — «✓ {c.lead.name} ({c.lead.intent})»; `src/modules/chatbot/components/dashboards/LeadsTable.tsx:28` — «const INTENT_COLORS: Record<string, string> = { quote: ..., demo: ..., info: ...»; `prisma/schema.prisma:158` — «enum ChatbotLeadIntent { PURCHASE_READY»
- Impacto: El cliente lee 'PURCHASE_READY' en su resumen y en conversaciones; en el admin todos los chips de intencion salen del color 'other'. Es el mismo bug que P1-fix corrigio en lead-intent-labels.ts pero quedo en tres sitios.
- Propuesta: Usar intentLabel() de lead-intent-labels.ts y keys del enum real para los colores.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot.resumen, h3.cli-chatbot.conversaciones, h3.adm-chatbots.leads-del-bot

### [UX-030] Copiar snippet y Exportar CSV anuncian exito sin saber el resultado
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/installation/SnippetCopyBlock.tsx:29` — «navigator.clipboard.writeText(snippet) setCopied(true) toast.success(toastMessage)»; `src/modules/chatbot/components/dashboard/ExportLeadsButton.tsx:63` — «a.click() document.body.removeChild(a) ... toast.success(... 'Exportando tus contactos…')»
- Impacto: Si el portapapeles esta bloqueado (permisos, iframe) el cliente pega nada en su sitio creyendo que copio el snippet; si el export falla (sesion vencida, 500) el toast igual dice que exporta.
- Propuesta: await + catch del clipboard con fallback de seleccion; export via fetch con chequeo de status y blob, o al menos sin toast de exito.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot.instalacion, h3.cli-chatbot.exportar-csv

### [UX-031] Seed del bot develOP con WhatsApp ficticio de fallback, colores de servicio invertidos y sin verticalPack
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/prisma/seed.ts:231` — «whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5493815555555',»; `src/modules/chatbot/prisma/seed.ts:224` — «'/ai-implementations': '#8b5cf6',»; `src/app/globals.css:61` — «--color-ds-accent-ia: #10b981;»; `src/modules/chatbot/prisma/seed.ts:51` — «- Color de marca: violeta»
- Impacto: Si se corre el seed sin la variable, el bot publico de develOP deriva a un numero inventado. Los colores por ruta y los 'Color de marca' de la KB estan cruzados respecto de la paleta canonica (IA verde, automatizacion ambar, software violeta, globals.css:61-63), asi que el bot puede decirle a un prospecto el color equivocado. El seed tampoco deja verticalPack en 'agencia'.
- Propuesta: Fallar el seed si falta NEXT_PUBLIC_WHATSAPP_NUMBER, corregir routeColorMap y el texto de la KB a la paleta canonica, y fijar verticalPack 'agencia'.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop, h3.vis-widget-develop.contenido-bot-develop, modelo.BotConfig, modelo.KnowledgeBase

### [UX-033] Con cero conversaciones el reporte semanal culpa al cliente ('verifica el script'), aunque la causa sea el LLM caido
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/server/reports/buildWeeklyReport.ts:181` — «return 'Esta semana no hubo actividad en tu chatbot. Verificá que el script esté instalado.'»; `src/modules/chatbot/server/quota/checker.ts:197` — «const discarded = await tx.conversation.deleteMany({»
- Impacto: Cuando Vertex falla antes del primer token, la compensacion borra la Conversation nueva; la semana queda con 0 conversaciones y el mail le pide al cliente revisar su instalacion mientras el problema es de develOP.
- Propuesta: Antes de ese mensaje, mirar eventos de error del bot en la semana y usar un texto neutro o avisar a develOP.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot, lib.chatbot.reports, lib.chatbot.quota
- REQUIERE-VERIFICACIÓN-HUMANA: VH-103

### [UX-034] Topbar: /admin/announcements se titula 'Detalle' y otras secciones salen en inglés por la heurística de ID
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/_components/admin-topbar.tsx:12` — «if (/^[a-z0-9]{10,}$/i.test(segment)) {»; `src/app/(protected)/admin/_components/admin-topbar.tsx:13` — «return 'Detalle'»; `src/app/(protected)/admin/_components/admin-topbar.tsx:24` — «const sectionLabelMap: Record<string, string> = {»
- Impacto: En Novedades el h1 del topbar dice 'Detalle' ('announcements' son 13 letras y la regex lo toma por ID); Referidos sale 'Referrals', Revisión demos 'Leados' y las subrutas 'New', 'Edit', 'Payments'. Contradice el cierre B13.5 de labels en español.
- Propuesta: Completar el mapa con todas las secciones y subrutas y detectar IDs por formato cuid (letra inicial + dígitos) en vez de por largo.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-shell, h4.adm-shell.navegacion, h4.adm-novedades

### [UX-035] Menú mobile del admin: la hamburguesa queda encima del drawer y tapa el logo; drawer sin Escape ni manejo de foco
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/_components/AdminLayoutClient.tsx:46` — «className="fixed left-4 top-4 z-[120] rounded-xl border border-white/10 bg-zinc-900/90 p-2.5 backdrop-blur lg:hidden"»; `src/app/(protected)/admin/_components/AdminLayoutClient.tsx:62` — «className={'fixed left-0 top-0 z-[110] h-screen w-[240px] transition-transform lg:translate-x-0 ${»; `src/app/(protected)/admin/_components/admin-sidebar.tsx:117` — «<div className="border-b border-white/10 px-5 py-5">»
- Impacto: En el teléfono, al abrir el menú el botón (caja de 16 a 58 px, z-120) queda sobre el BrandMark del sidebar (arranca en 20 px, z-110). El drawer no cierra con Escape, no mueve ni atrapa el foco y el botón no expone aria-expanded.
- Propuesta: Ocultar la hamburguesa mientras mobileOpen (o bajarla de z), agregar Escape, foco inicial/trap y aria-expanded/aria-controls reutilizando el patrón de alert-column-overview.tsx:43-89.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-shell, h4.adm-shell.navegacion
- REQUIERE-VERIFICACIÓN-HUMANA: VH-113

### [UX-036] Retirar una novedad ignora el resultado de la action: si falla, el admin no ve nada
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/announcements/_components/announcement-list.tsx:40` — «await deleteAnnouncementAction(id)»; `src/app/(protected)/admin/announcements/_components/announcement-list.tsx:41` — «setConfirmingId(null)»; `src/app/(protected)/admin/announcements/_actions/announcements.actions.ts:75` — «return fail(toErrorMessage(error, 'No se pudo retirar la novedad.'))»
- Impacto: Si el retiro falla (sesión vencida, base caída), la confirmación se cierra como si hubiera funcionado; la novedad sigue visible para los clientes y el admin solo lo nota si vuelve a mirar la lista. Tampoco queda registro en AdminAuditLog de quién publicó o retiró.
- Propuesta: Chequear result.success y mostrar el error en la fila; registrar publicar/retirar con logAdminAction.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-novedades, h4.adm-novedades.listar-y-retirar, modelo.PanelAnnouncement

### [UX-037] Filtros de /admin/alerts no envuelven en mobile: desborde horizontal y popover de rango fuera de pantalla
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/alerts/AlertsClient.tsx:177` — «<div className="flex items-center gap-2">»; `src/app/(protected)/admin/alerts/_components/alerts-date-filter.tsx:58` — «<div className="flex items-center gap-2">»; `src/app/(protected)/admin/alerts/_components/alerts-date-filter.tsx:81` — «className="absolute left-full top-0 z-50 ml-2 w-64 rounded-2xl border ...»
- Impacto: A 390 px el ancho útil del main es ~334 px (390 menos p-3 del shell y p-4 del main); la fila de severidad suma ~400 px (rótulo + 5 chips) y la de período ~550 px (rótulo + 6 chips), ambas sin flex-wrap, así que el contenido scrollea en horizontal y el popover 'Personalizado' (256 px, a la derecha del último chip) abre fuera del viewport.
- Propuesta: flex-wrap en ambas filas (o un select en mobile) y anclar el popover debajo del chip con clamp al viewport como audit-period-filter.tsx:31-45.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-alertas, h4.adm-alertas.filtros-y-vista-completa
- REQUIERE-VERIFICACIÓN-HUMANA: VH-115

### [UX-038] Acciones de alertas: error genérico 'Error' y rechazo de promesa sin manejar
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/alerts/AlertsClient.tsx:94` — «error: 'Error',»; `src/app/(protected)/admin/alerts/AlertsClient.tsx:96` — «await promise»; `src/app/(protected)/admin/alerts/AlertsClient.tsx:132` — «onAck={(id) => void handleAck(id)}»
- Impacto: Si marcar como vista o resolver falla (sesión vencida: requireSuperAdmin lanza 'Unauthorized'), el toast dice solo 'Error' y la promesa rechazada queda sin manejar (try/finally sin catch, llamada con void), lo que termina como unhandledrejection.
- Propuesta: catch con mensaje útil ('No se pudo resolver la alerta; reintentá') y que acknowledgeAlert/resolveAlert devuelvan ActionResult.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-alertas.triage

### [UX-039] Secciones sin loading.tsx propio muestran el skeleton del Dashboard (/admin/announcements, /admin/referrals, /admin/fg2-lab)
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/loading.tsx:19` — «{/* Fila 1 — KPIs comerciales (3 cols) */}»; `src/app/(protected)/admin/loading.tsx:61` — «{/* Fila 4 — Gráficos (2x2) */}»; `src/app/(protected)/admin/announcements/page.tsx:10` — «export default async function AdminAnnouncementsPage() {»
- Impacto: Al navegar a Novedades o Referidos aparece el esqueleto de KPIs y gráficos del Dashboard y después salta a un formulario o lista: un estado de carga que anuncia otra pantalla.
- Propuesta: loading.tsx propio en announcements, referrals y fg2-lab, o un skeleton genérico en el root y el de KPIs dentro de la página con Suspense.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-shell, h4.adm-novedades, h4.adm-referidos

### [UX-041] Soporte: 'Ver todos' manda ?clientId= que /admin/tickets y /admin/messages ignoran
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/[clientId]/_components/tabs/SupportTab.tsx:30` — «<SupportSection title={'Tickets recientes (${tickets.length})'} href={'/admin/tickets?clientId=${clientId}'}>»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/SupportTab.tsx:55` — «<SupportSection title="Mensajes recientes" href={'/admin/messages?clientId=${clientId}'}>»; `src/app/(protected)/admin/clients/[clientId]/_components/tabs/SupportTab.tsx:19` — «take: 10,»
- Impacto: Desde la ficha del cliente, 'Ver todos' abre todos los tickets de todos los clientes y la bandeja de mensajes sin seleccion. El titulo 'Tickets recientes (N)' tope 10 aparenta ser el total.
- Propuesta: Que /admin/tickets acepte el filtro por org (slug) y que 'Ver todos' de mensajes apunte a /admin/messages/[orgId]; mostrar el total real con _count.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.tab-soporte, h4.adm-tickets, h4.adm-mensajes

### [UX-042] Fallos silenciosos: exportar leads en lote e impersonar no muestran el error
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:120` — «try { const result = await bulkExportLeads([...selected]) if (!result.ok) return»; `src/lib/bulk-actions.ts:79` — «return { ok: true, csv, count: leads.length }»; `src/app/(protected)/admin/clients/[clientId]/_components/ImpersonateButton.tsx:25` — «} catch (error) { console.error('Impersonation failed', error)»
- Impacto: bulkExportLeads nunca devuelve ok:false (lanza), y handleBulkExportLeads no tiene catch: el boton deja de girar y no pasa nada. Impersonar fallido solo deja un console.error con el dialogo abierto. handleBulkPauseBots re-lanza tras toast.promise (:148).
- Propuesta: catch con toast.error en ambos; resultado tipado en bulk-actions.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.acciones-masivas, h4.adm-clientes.impersonar

### [UX-043] Estados borde del detalle: sin ADMIN no se puede editar nada y los archivados no se distinguen
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/[clientId]/edit/EditClientForm.tsx:64` — «const canSubmit = hasAdminUser &&»; `src/app/(protected)/admin/clients/[clientId]/page.tsx:65` — «prisma.organization.findMany({ select: { id: true, companyName: true, slug: true },»
- Impacto: Una org sin miembro ADMIN no permite corregir ni el nombre de la empresa (EditClientForm.tsx:101-105). El switcher lista orgs archivadas y el header no marca 'Archivado', asi que se puede impersonar o cambiar plan a un archivado sin advertencia.
- Propuesta: Permitir editar los datos de la empresa sin usuario admin (y ofrecer crear uno); filtrar o marcar archivados en el switcher y mostrar un badge en ClientHeader.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-clientes.editar-datos, h4.adm-clientes.detalle

### [UX-045] La tabla Inbound no muestra qué pidió el cliente: no distingue módulo vs upgrade de plan
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/leads/_components/inbound-leads-table.tsx:17` — «service: string | null»; `src/app/(protected)/admin/leads/_components/inbound-leads-table.tsx:104` — «<th className="px-4 py-3 font-medium">Nombre</th>»; `src/lib/actions/upsell.ts:93` — «service: parsed.data.featureKey,»
- Impacto: Los pedidos de módulo y de upgrade (plan-upgrade-*, UpgradeCtaButton.tsx:80) que hace el cliente desde su panel caen en Inbound sin columna de servicio (el campo llega pero no se renderiza); para saber qué pidió hay que leer el mensaje.
- Propuesta: Agregar columna/badge de servicio con mapeo módulo vs plan-upgrade-* (PLAN-620).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-leads.inbound, h2.cli-plan, h2.cli-servicios

### [UX-051] 'Enviar a aprobación' no avisa al cliente (ni campana ni email), falla en silencio y no audita
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/lib/actions/projects.ts:197` — «await tx.message.create({ data: { content: '📋 Tu entrega "${task.title}" está lista para revisión. ...»; `src/actions/agency-actions.ts:54` — «const notifications = orgMembers.map(member => ({ type: 'ACTION_REQUIRED' as const,»; `src/app/(protected)/admin/projects/_components/task-list.tsx:628` — «await sendTaskForApprovalAction(formData) router.refresh()»
- Impacto: El camino vivo para pedir aprobación (task-list) solo crea un Message. A diferencia de createTaskForClientAction, no genera Notification ACTION_REQUIRED ni email, así que el cliente se entera recién cuando entra al portal. La action devuelve void y sale en silencio si la tarea no existe (:182, :188). Un guard vencido lanza dentro de startTransition sin catch y termina en el error boundary. No hay auditoría.
- Propuesta: Reusar la creación de Notification + email de agency-actions (o un helper común), devolver ActionResult y mostrar el feedback en la UI. Agregar logAdminAction.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [BUG-112]
- Nodo(s): h4.adm-proyectos.enviar-a-aprobacion, h2.cli-proyecto, modelo.Message, modelo.Notification

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

### [A11Y-002] Texto funcional en zinc-600/700 sobre el fondo del portal (#080a0c, ≈2,6:1 y ≈1,9:1) en tickets, servicios, módulos, cuenta e inicio
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: a11y
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:246` — «<p className="mt-0.5 font-mono text-[9px] text-zinc-600">{step.time}</p>»; `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:249` — «<p className="mt-0.5 text-[9px] italic text-zinc-700">Pendiente</p>»; `src/app/(protected)/dashboard/soporte/[ticketId]/page.tsx:261` — «<span className="flex items-center gap-1 text-zinc-600">»; `src/app/(protected)/dashboard/services/page.tsx:145` — «<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600">»; `src/components/dashboard/PremiumModuleCard.tsx:362` — «<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600">»; `src/app/(protected)/dashboard/modules/tienda-conectada/_components/ConnectStoreCard.tsx:56` — «p className='max-w-xs text-xs leading-relaxed text-zinc-600' // aviso 'Solo lectura'»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/page.tsx:104` — «text-[10px] font-medium uppercase tracking-widest text-zinc-600 // Enviados/Abiertos/Clicks/Bajas»; `src/app/(protected)/dashboard/page.tsx:228` — «p className='text-xs text-zinc-600'»; `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:319` — «p className='mt-5 text-center text-[9px] text-zinc-600'»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/new/page.tsx:118` — «p className='text-[11px] text-zinc-600' // ayuda del campo HTML»; `src/components/dashboard/ProfileForms.tsx:67` — «return <p className="text-[10px] text-zinc-600">{children}</p>»; `src/components/dashboard/ProjectEmptyState.tsx:30` — «<p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-600">»; `src/components/dashboard/notification-shared.tsx:98` — «<span className="flex-shrink-0 text-[10px] text-zinc-600">{timeAgo(notif.createdAt)}</span>»; `src/components/dashboard/ClientChatComposer.tsx:128` — «{helperText && <p className="mt-1.5 text-[10px] text-zinc-600">{helperText}</p>}»; `src/components/dashboard/DashboardLayoutClient.tsx:179` — «<footer className="flex items-center justify-between px-1 py-2 text-xs text-zinc-700">»; `src/components/dashboard/home/AIExecutiveBriefV2.tsx:103` — «<div className="flex flex-col gap-2 border-t border-white/[0.04] pt-2 text-[10px] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">»; `src/components/dashboard/home/HealthScore.tsx:123` — «className="flex items-center gap-2 text-[10px] text-zinc-600"»; `src/components/dashboard/home/WeekResultsGrid.tsx:28` — «<span className="shrink-0 text-[10px] text-zinc-600">vs semana anterior</span>»; `src/components/dashboard/results/analysis/MonthTrendSection.tsx:52` — «<p className="text-xs text-zinc-600">»; `src/components/dashboard/VaultRevealButton.tsx:143` — «<p className="text-[9px] text-red-400/40">»; `src/components/dashboard/DashboardLayoutClient.tsx:51` — «className="fixed inset-0 bg-[#080a0c] text-zinc-100 selection:bg-cyan-500/30"»
- Impacto: Horas de la Timeline, «Pendiente», etiquetas de Detalles, «Activo desde» y «Desde» quedan en ≈2,5:1 (zinc-600 sobre ≈#0b0d10) y ≈1,9:1 (zinc-700), en 9-10 px. Falla WCAG AA 1.4.3 en el camino del cliente.
- Propuesta: Subir a zinc-400 o más claro (≥4,5:1) y mínimo 11-12 px para texto con información.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-soporte.conversacion-ticket, h2.cli-servicios.servicios-contratados, h2.cli-servicios.vitrina-modulos, h2.cli-tienda, h2.cli-email-mkt, h2.cli-cuenta.boveda, h2.cli-inicio, lib.ui, h2.cli-shell, h2.cli-cuenta, h2.cli-proyecto, h2.cli-soporte, h2.cli-resultados

### [A11Y-003] NewTicketModal es un modal hecho a mano: sin role=dialog, sin foco atrapado ni Esc, cierre sin aria-label, labels sin asociar, z-50 bajo el sidebar y sin scroll interno
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/NewTicketModal.tsx:83` — «<div className="fixed inset-0 z-50 flex items-center justify-center px-4">»; `src/components/dashboard/NewTicketModal.tsx:103` — «<button onClick={() => !isSubmitting && setIsOpen(false)}»; `src/components/dashboard/NewTicketModal.tsx:127` — «<label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">»; `src/lib/design-tokens.ts:242` — «appDrawer: 110, // panel del rail en mobile»
- Impacto: Con lector de pantalla no se anuncia el dialogo, los campos no tienen nombre accesible (solo placeholder) y el boton de cierre (solo <X/>, :107) se anuncia como 'boton'; Esc no cierra y el Tab escapa a la pagina. En desktop el sidebar (zIndex 110) queda por encima del fondo y sigue clickeable; en pantallas bajas o con teclado abierto el boton 'Abrir Ticket' puede quedar fuera del viewport (sin overflow-y en :83-97, PROBABLE).
- Propuesta: Migrar al Modal primitivo de components/ui (ya usado por VaultRequestModal y SoporteBoard): portal a body con zIndex.modal, foco atrapado, Esc y aria-modal; label con htmlFor e id en los campos; aria-label en el cierre.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-soporte, h2.cli-soporte.crear-ticket, lib.ui
- REQUIERE-VERIFICACIÓN-HUMANA: VH-054

### [A11Y-010] Campos del editor y del alta sin etiqueta asociada ni errores anunciados
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/config/Field.tsx:15` — «<label className="flex items-center gap-1 text-sm font-medium text-zinc-200">»; `src/components/ui/Field.tsx:32` — «htmlFor={fieldId}»; `src/modules/chatbot/components/admin/config/ColorPicker.tsx:27` — «type="color"»; `src/modules/chatbot/components/admin/onboarding/Step1Company.tsx:74` — «<label className="block text-sm text-zinc-400 mb-1">Nombre de la empresa</label>»; `src/modules/chatbot/components/admin/onboarding/Step5Review.tsx:312` — «<div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">»; `src/modules/chatbot/components/admin/config/tabs/AvatarUploader.tsx:96` — «{error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}»
- Impacto: El editor usa un Field local que no vincula el label (sin htmlFor ni contexto) mientras el del kit sí; Inputs, Selects, ColorPicker y Slider de los 5 tabs quedan sin nombre accesible. En el alta los labels tampoco apuntan a sus inputs, y los errores (paso 5, inline y del uploader, que se reusa en el portal del cliente) no tienen role=alert. Con lector de pantalla no se puede completar la configuración.
- Propuesta: Reemplazar config/Field y config/Input por los del kit (asocian label y describedby), envolver los inputs del alta en Field del kit y agregar role=alert/aria-live a los errores.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.editar-config-bot, h4.adm-clientes.alta-cliente-con-bot, lib.ui

### [A11Y-013] Widget de develOP no operable por teclado: el launcher no abre con Enter/Espacio y el panel no cierra con Escape ni retiene el foco
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: a11y
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/modules/chatbot/components/LogicCompanion.tsx:180` — «role="button" tabIndex={0} onClick={handleToggle}»; `src/modules/chatbot/components/chat/ChatWindow.tsx:247` — «role="dialog" aria-label={'Consultor ${config.botName}'}»; `src/modules/chatbot/components/chat/ChatWindow.tsx:210` — «onClick={onClose}»; `src/modules/chatbot/components/LogicCompanion.tsx:215` — «whileTap={reducedMotion ? undefined : { scale: 0.95 }}»; `src/modules/chatbot/components/tooltip/ProactiveTooltip.tsx:129` — «onClick={(e) => { // Stop the click bubbling to the launcher's onClick»; librería motion-dom@12.42.0, dist/es/gestures/press/utils/keyboard.mjs línea 14 — «target.dispatchEvent(new PointerEvent("pointer" + type, { isPrimary: true, bubbles: true }));»
- Impacto: Un visitante que navega con teclado o lector de pantalla puede enfocar el launcher pero no abrir el chat (un div con role=button no recibe click con Enter/Espacio; motion 12 solo dispara gestos tap con Enter, no onClick, y con reduced-motion whileTap queda undefined). Si lo abre, no hay Escape, ni aria-modal, ni trampa de foco, ni devolucion del foco. WCAG 2.1.1 (A). Bloqueante para L3 del widget que se usa como demo del producto.
- Propuesta: Usar un <button> real para el launcher (o onKeyDown Enter/Espacio), cerrar con Escape en el panel, aria-modal=true, trampa de foco y devolver el foco al launcher al cerrar. Revisar el mismo patron en el bubble de public/widget.js.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop, lib.chatbot.components
- REQUIERE-VERIFICACIÓN-HUMANA: VH-079

### [A11Y-014] La region aria-live (role=log) envuelve el texto que el typewriter reescribe por frame: el lector de pantalla anuncia fragmentos
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/chat/ChatWindow.tsx:277` — «role="log" aria-live="polite"»; `src/modules/chatbot/components/chat/StreamingMarkdown.tsx:99` — «setRevealed(next)»; `src/modules/chatbot/components/chat/StreamingMarkdown.tsx:143` — «const body = settled ? text : revealSafeMarkdown(text.slice(0, revealedCount))»
- Impacto: Cada avance del revelado (hasta ~60/s) muta el texto dentro de la region viva; NVDA/VoiceOver suelen anunciar trozos repetidos o cortados en vez de la respuesta completa.
- Propuesta: Marcar el bubble en revelado con aria-hidden/aria-busy y anunciar el mensaje completo una vez en onTypingDone (region sr-only separada).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop
- REQUIERE-VERIFICACIÓN-HUMANA: VH-082

### [A11Y-017] Texto funcional en text-zinc-600 sobre fondo oscuro en el chatbot del cliente (contraste < 4,5:1)
- Dominio: D5  ·  Severidad: MEDIA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/dashboard/LeadDetail.tsx:279` — «... px-3 py-2 text-sm text-zinc-600"> ('Sin telefono'; igual :293 'Sin email', :521 contador, :381, :589)»; `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:205` — «<span className="shrink-0 text-xs text-zinc-600"> (fecha de derivacion)»; `src/modules/chatbot/components/dashboard/BusinessLeadCard.tsx:123` — «<span className="text-zinc-600"> · {decayTierLabel}</span>»; `src/modules/chatbot/components/dashboards/LeadsTable.tsx:90` — «<div className="mt-1 text-zinc-600">desde {lead.conversation.currentPath}</div>»
- Impacto: zinc-600 (#52525b) sobre el fondo casi negro da ~2,5:1: datos utiles (fecha de derivacion, 'Sin telefono', antiguedad del lead) ilegibles con baja vision o pantalla al sol. Falla WCAG AA del quality baseline.
- Propuesta: Subir a zinc-400 o al token de texto secundario con contraste AA.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot.contacto-detalle, h3.cli-chatbot.resumen, h3.cli-chatbot.contactos-lista

### [A11Y-023] Cards del pipeline: botón anidado en un article role=button; por teclado no se puede borrar un lead
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/leads/_components/lead-card.tsx:64` — «role="button"»; `src/app/(protected)/admin/leads/_components/lead-card.tsx:80` — «if (event.key === 'Enter') { event.preventDefault() router.push('/admin/leads/${lead.id}')»; `src/app/(protected)/admin/leads/_components/lead-card.tsx:116` — «<button type="button" disabled={isPending}»
- Impacto: El keydown de Enter sobre «Eliminar lead» (o sobre los botones del InlineConfirm, que se renderiza dentro de la card) burbujea al article, que hace preventDefault y navega al detalle: el botón nunca se activa. Space dispara el KeyboardSensor de dnd-kit (activador = la card entera) y levanta la card. Un lector de pantalla anuncia un botón dentro de otro botón.
- Propuesta: En el onKeyDown del article actuar sólo si event.target === event.currentTarget; mejor aún, separar la navegación (Link) del handle de arrastre y sacar el botón del elemento con role=button.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-leads.eliminar-lead, h4.adm-leads.pipeline-kanban, lib.ui
- REQUIERE-VERIFICACIÓN-HUMANA: VH-122

### [A11Y-024] Formulario público de /contact: labels sin asociar a sus campos y error sin role=alert
- Dominio: D3  ·  Severidad: MEDIA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/app/contact/page.tsx:151` — «<label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-[#8deef5]/60">Nombre *</label> <input name="name"»; `src/app/contact/page.tsx:213` — «<p className="col-span-2 text-xs text-rose-300">{state.error}</p>»
- Impacto: Ninguno de los seis <label> tiene htmlFor ni envuelve su campo: un lector de pantalla anuncia 'campo de edición' sin nombre; el error de envío no se anuncia. Falla WCAG 1.3.1 y 4.1.2 en el formulario de captación pública.
- Propuesta: id + htmlFor (o label envolvente) en cada campo, aria-invalid/aria-describedby y role=alert en el mensaje de error.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [A11Y-005]
- Nodo(s): h6.vis-contacto.formulario

### [A11Y-004] Filas del dropdown de notificaciones no operables con teclado
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/NotificationCenter.tsx:238` — «<motion.div layout key={notif.id}»; `src/components/dashboard/NotificationCenter.tsx:245` — «onClick={() => handleNotifClick(notif)}»; `src/components/dashboard/NotificationHistoryModal.tsx:149` — «<button»
- Impacto: Con teclado o lector de pantalla no se puede abrir ni marcar una notificacion desde la campana (div con onClick, sin role/tabIndex/onKeyDown); si desde 'Ver todas', que usa <button>.
- Propuesta: Usar <button type='button'> como en el historial.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-shell.campana-notificaciones

### [A11Y-005] Bloques de error de formularios del portal sin role=alert ni aria-live (módulos, cuenta, soporte, mensajes, referidos, servicios, bienvenida)
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/ProfileForms.tsx:43` — «<motion.div initial={{ opacity: 0, y: -4 }}»; `src/components/dashboard/NewTicketModal.tsx:120` — «<div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">»; `src/components/dashboard/ClientChatComposer.tsx:85` — «<div className="mb-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">»; `src/components/dashboard/ReferralPanel.tsx:114` — «<p className="mb-3 text-sm text-rose-300">{error}</p>»; `src/components/dashboard/VaultRequestModal.tsx:108` — «{error && <p className="text-xs font-medium text-red-400">{error}</p>}»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/new/page.tsx:124` — «p className='rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400'»; `src/app/(protected)/dashboard/modules/email-marketing/campaigns/[id]/send/page.tsx:53` — «div className='flex items-center gap-2 rounded-lg border border-red-500/20 ...'»; `src/app/(protected)/dashboard/modules/email-marketing/contactos/_components/ImportCSVButton.tsx:63` — «div className='flex items-center gap-2 rounded-lg border border-red-500/20 ...'»; `src/app/(protected)/dashboard/modules/motor-resenas/_components/LockedView.tsx:231` — «p role='alert' ... // control: aca si esta»; `src/app/bienvenida/_components/Step1Empresa.tsx:41` — «<label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">»; `src/app/bienvenida/_components/Step2Conexiones.tsx:41` — «<input»; `src/app/bienvenida/_components/BienvenidaWizard.tsx:122` — «<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">»; `src/app/(protected)/dashboard/resultados/trafico/page.tsx:152` — «<div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4 backdrop-blur-sm">»; `src/components/dashboard/NewTicketModal.tsx:103` — «<button onClick={() => !isSubmitting && setIsOpen(false)}»; `src/components/dashboard/home/AIExecutiveBriefV2.tsx:115` — «<div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">»; `src/components/dashboard/home/Recommendations.tsx:119` — «<p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-red-400">»; `src/components/dashboard/VaultRevealButton.tsx:119` — «<button onClick={handleCopy} title="Copiar"»
- Impacto: Los lectores de pantalla no anuncian el error al guardar el perfil, crear un ticket, enviar un mensaje, generar el codigo de referido o pedir un documento (tambien PremiumModuleCard.tsx:328 y DangerZone ProfileForms.tsx:727).
- Propuesta: role='alert' (o aria-live='assertive') en los contenedores de error y role='status' en los de exito; idealmente un FormFeedback compartido.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [A11Y-001]
- Nodo(s): h2.cli-cuenta, h2.cli-soporte, h2.cli-mensajes, h2.cli-referidos, h2.cli-servicios, h2.cli-email-mkt, h2.cli-resenas, h2.cli-bienvenida.wizard-3-pasos, h2.cli-resultados, h2.cli-soporte.crear-ticket, h2.cli-inicio.resumen-ia, h2.cli-inicio.ideas-para-crecer, h2.cli-cuenta.boveda, lib.ui

### [A11Y-006] Contenido solo en hover y foco perdido: descripcion de tareas, drawer mobile cerrado enfocable, sin aria-current y toggles de contrasena fuera del Tab
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/components/dashboard/ProjectTaskTabs.tsx:125` — «<div className="overflow-hidden max-h-0 transition-all duration-500 group-hover:max-h-32 group-hover:mt-3">»; `src/components/dashboard/DashboardLayoutClient.tsx:80` — «className={'fixed left-0 top-0 h-screen w-[240px] transition-transform lg:translate-x-0 ${»; `src/components/dashboard/SidebarNav.tsx:138` — «<Link href={href} onClick={onNavigate}»; `src/components/dashboard/ProfileForms.tsx:419` — «tabIndex={-1}»
- Impacto: En touch y con teclado la descripcion de cada tarea no se puede ver; en mobile el Tab recorre los links del drawer cerrado (solo translate, sin inert); el link activo no se anuncia; mostrar/ocultar contrasena no es alcanzable con teclado.
- Propuesta: Expandir la descripcion con un control accesible; inert/aria-hidden al aside cerrado en <lg; aria-current='page' en el link activo; quitar tabIndex=-1.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-proyecto.tareas-por-estado, h2.cli-shell.navegacion-sidebar, h2.cli-cuenta.cambiar-password

### [A11Y-007] Contraste por debajo de AA en los PDF de informes (gris sobre gris claro y cian sobre blanco)
- Dominio: D2  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/lib/reports/client-monthly/ClientMonthlyReportPdf.tsx:24` — «const GRAY = '#71717a' const LIGHT_BG = '#f4f4f5' (4,40:1 en cardLabel 7,5 pt :74-80, cardSub :82, emptyText :112)»; `src/lib/reports/client-monthly/ClientMonthlyReportPdf.tsx:58` — «monthLabel: { fontSize: 12, color: CYAN, fontFamily: 'Helvetica-Bold', marginBottom: 3 }, (#06b6d4 sobre blanco = 2,43:1)»; `src/lib/reports/MonthlyReport.tsx:165` — «cardValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: CYAN, (sobre LIGHT_BG = 2,21:1, menos de 3:1 aun como texto grande)»
- Impacto: El informe pensado para reenviarse al socio o contador tiene etiquetas, fecha y marca difíciles de leer impresas o en pantallas con poco brillo.
- Propuesta: zinc-600 (#52525b, 7,0:1 sobre #f4f4f5) para textos secundarios y un cian oscuro (#0e7490, unos 5,4:1 sobre blanco) para textos de marca.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h2.cli-resultados.informe-mensual-pdf, lib.reports

### [A11Y-008] Widget embebido: al abrir no mueve el foco, la burbuja oculta sigue en el orden de tabulación y Esc no cierra
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `public/widget.js:150` — «bubble.style.opacity = '0' bubble.style.pointerEvents = 'none'»; `public/widget.js:158` — «if (iframe) iframe.classList.remove('dvlp-open')»; `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:216` — «onClose={() => notifyParent('close')}»
- Impacto: Un visitante con teclado o lector de pantalla queda con el foco en un botón invisible al abrir, y al cerrar el foco no vuelve a la burbuja; no hay cierre con Esc.
- Propuesta: Mover el foco al iframe al abrir y devolverlo al cerrar, sacar la burbuja del tab order mientras está abierto y escuchar Escape.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-cliente
- REQUIERE-VERIFICACIÓN-HUMANA: VH-094

### [A11Y-009] Detalle del bot (admin): tabs sin semántica ARIA, botón de cierre sin etiqueta y textos en zinc-600/700 sobre fondo oscuro
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/chatbots/[botId]/BotDetailClient.tsx:257` — «<button key={tab.id} onClick={() => changeTab(tab.id)}»; `src/app/(protected)/admin/chatbots/[botId]/BotDetailClient.tsx:356` — «<button type="button" onClick={() => setShowPauseConfirm(false)}»; `src/app/(protected)/admin/chatbots/[botId]/tabs/OverviewTab.tsx:174` — «<p className="text-xs text-zinc-700">»; `src/app/(protected)/admin/chatbot/health/page.tsx:28` — «<p className="text-[11px] font-mono text-zinc-600">Checked at: {health.timestamp}</p>»
- Impacto: Las pestañas no anuncian estado (sin role=tab/aria-selected), el botón X del modal de pausa no tiene aria-label y hay texto con contraste menor a 4,5:1.
- Propuesta: role=tablist/tab + aria-selected, aria-label en el botón de cierre y grises a zinc-400.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots, h3.adm-health

### [A11Y-011] Modales propios sin semántica de diálogo y botones solo-ícono sin aria-label
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/activation/ActivationModal.tsx:71` — «<button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/[0.05]">»; `src/modules/chatbot/components/admin/activation/ActivationModal.tsx:54` — «className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"»; `src/modules/chatbot/components/admin/kb/SaveConfirmModal.tsx:35` — «className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"»; `src/modules/chatbot/components/admin/kb/TestPromptSandbox.tsx:188` — «<Send className="h-4 w-4" strokeWidth={1.5} />»; `src/modules/chatbot/components/admin/config/tabs/BehaviorTab.tsx:99` — «<Trash2 className="h-4 w-4" strokeWidth={1.5} />»; `src/modules/chatbot/components/admin/config/tabs/AdvancedTab.tsx:158` — «<Trash2 size={13} strokeWidth={1.5} />»
- Impacto: ActivationModal, BotConfigDiffModal, SaveConfirmModal y TestPromptSandbox no tienen role=dialog/aria-modal, Escape ni manejo de foco; 9 botones de cerrar, enviar, limpiar y borrar no tienen aria-label. SaveConfirmModal y el sandbox no van por portal y su z-50 queda debajo de la sidebar (z-110). ActivationModal no tiene max-h ni scroll: en pantallas bajas 'Activar bot' puede quedar fuera de vista.
- Propuesta: Unificar en un modal accesible (role=dialog, aria-modal, foco inicial y Escape) y agregar aria-label a los botones solo-ícono. El Modal del kit tampoco tiene role=dialog ni Escape y es FROZEN: decisión para Valentino.
- Esfuerzo: M  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-chatbots.activar-bot-preflight, h3.adm-chatbots.editar-kb, h3.adm-chatbots.probar-prompt, lib.ui

### [A11Y-012] Texto funcional en zinc-600 y zinc-500 por debajo de AA
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/admin/ActivityLog.tsx:209` — «<div className="rounded-[28px] border border-white/10 bg-white/[0.02] py-16 text-center text-sm text-zinc-600">»; `src/modules/chatbot/components/admin/ActivityLog.tsx:194` — «<span className="hidden text-[11px] text-zinc-600 sm:inline">»; `src/modules/chatbot/components/admin/onboarding/Step2BotIdentity.tsx:56` — «<p className="text-xs text-zinc-600 mt-1">»; `src/modules/chatbot/components/admin/BotConfigEditor.tsx:144` — «<span className="ml-3 text-xs text-zinc-600">{exposedCount} campos editables expuestos</span>»; `src/modules/chatbot/components/admin/config/ColorPicker.tsx:51` — «<p className="mb-2 text-xs text-zinc-500">Sugerencias</p>»
- Impacto: Cuenta: luminancia de #52525b 0,0859, de #71717a 0,1673 y del fondo #080a0c 0,0029 -> zinc-600 ≈2,6:1 y zinc-500 ≈4,1:1, contra 4,5:1 de AA. Quedan bajo el umbral el estado vacío del stream, el aviso de pausa, el contador de caracteres y las ayudas; ColorPicker y el uploader se reusan en el portal del cliente.
- Propuesta: Texto funcional en zinc-400 (≈7,7:1); 500/600 sólo decorativo. Revisar el token en el design system.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.adm-actividad.stream-eventos, h4.adm-clientes.alta-cliente-con-bot, lib.ui

### [A11Y-015] Panel del chat: textarea sin label accesible, boton enviar etiquetado en ingles y textos con contraste de ~2,6:1 y ~2,2:1
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/chat/ChatWindow.tsx:305` — «color: 'rgba(255,255,255,0.3)',»; `src/modules/chatbot/components/chat/ChatWindow.tsx:612` — «color: 'rgba(255,255,255,0.25)',»; `src/modules/chatbot/components/chat/ChatWindow.tsx:659` — «aria-label="Send message"»
- Impacto: 'Sistema Listo' (11px, blanco 0.3 sobre el panel aprox. #0a0c18) da ~2,6:1 y el hint 'Enter para enviar' (9px, 0.25) ~2,2:1, ambos por debajo de 4,5:1. El textarea (:527-594) solo tiene placeholder como nombre accesible y el boton enviar se anuncia en ingles en una UI en castellano.
- Propuesta: aria-label='Escribi tu consulta' en el textarea, 'Enviar mensaje' en el boton, y subir la opacidad de esos textos a 0.6 o mas.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop

### [A11Y-016] Animaciones infinitas de avatares e indicador 'pensando' que no respetan prefers-reduced-motion
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/chat/ChatWindow.tsx:445` — «repeat: Infinity,»; `src/modules/chatbot/components/avatar/PulseAvatar.tsx:64` — «repeat: Infinity,»; `src/modules/chatbot/components/avatar/MonogramAvatar.tsx:81` — «transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}»
- Impacto: El launcher anima sin parar en toda pagina publica (y en el sitio del cliente). git grep de useReducedMotion/prefers-reduced-motion en components/avatar = 0 (control: StreamingMarkdown.tsx:5,47 si lo usa) y no hay MotionConfig global. WCAG 2.2.2 / 2.3.3.
- Propuesta: Leer useReducedMotion en AvatarRenderer y pasar un estado estatico a los avatares; detener los dots con reduced motion.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.vis-widget-develop, h3.vis-widget-cliente, lib.chatbot.components

### [A11Y-018] Controles del chatbot sin estado o nombre accesible (chips, labels, tooltip, pestanas, error del transcript)
- Dominio: D5  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/modules/chatbot/components/dashboard/ClientLeadsTable.tsx:272` — «<button key={key} onClick={...} className={chipClass(initialRange === key)}> (sin aria-pressed; igual :222-234, :284-298)»; `src/modules/chatbot/components/dashboard/LeadDetail.tsx:496` — «<label className="mb-1 block text-xs text-zinc-500">Estado</label> (sin htmlFor; igual :512)»; `src/modules/chatbot/components/tooltip/ProactiveTooltip.tsx:129` — «onClick={(e) => { ... onAccept(currentPrompt) }} (div sin role, tabIndex ni onKeyDown)»; `src/modules/chatbot/components/dashboards/ConversationsTable.tsx:201` — «return <p className="text-xs text-red-300">No se pudo cargar el transcript. Probá de nuevo.</p>»
- Impacto: Con lector de pantalla no se sabe que filtro esta activo ni a que campo corresponde cada control; el teaser proactivo del sitio de develOP no se puede aceptar con teclado; el error del transcript no se anuncia.
- Propuesta: aria-pressed en chips, htmlFor/id en labels, convertir el tooltip en button, aria-current en la pestana activa, role=alert en el error.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h3.cli-chatbot.contactos-lista, h3.cli-chatbot.contacto-detalle, h3.vis-widget-develop.tooltip-proactivo

### [A11Y-019] Diálogos del admin sin semántica de diálogo, foco inicial, trap ni Escape: confirmaciones destructivas y el modal de LeadForm
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/_components/confirm-dialog.tsx:48` — «role="dialog"»; `src/app/(protected)/admin/_components/type-to-confirm-dialog.tsx:46` — «onClick={isPending ? undefined : onClose}»; `src/app/(protected)/admin/_components/inline-confirm.tsx:51` — «role="dialog"»; `src/app/(protected)/admin/leads/_components/lead-form.tsx:166` — «<div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#05070a]/80 p-4 backdrop-blur-md">»; `src/app/(protected)/admin/leads/_components/lead-form.tsx:176` — «<button type="button" onClick={closeModal}»; `src/app/(protected)/admin/leads/_components/lead-form.tsx:188` — «<label className="mb-2 block text-sm font-medium text-zinc-200">»
- Impacto: Con teclado o lector de pantalla, al confirmar archivar/eliminar cliente, acciones masivas de bots o impersonar, el foco queda detrás del modal, Tab recorre el fondo y Escape no cierra (git grep Escape vacío en los tres); ConfirmDialog no tiene aria-label/labelledby y se anuncia como un diálogo sin título.
- Propuesta: Un hook de modal accesible compartido (foco inicial, trap, Escape, restore, aria-labelledby) como el de alert-column-overview.tsx:43-89, aplicado a los tres componentes.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-shell, h4.adm-shell.confirmaciones, h4.adm-leads.alta-edicion, lib.ui

### [A11Y-020] Topbar y breadcrumbs con controles solo-ícono sin aria-label y h1 duplicado por página
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/_components/admin-topbar.tsx:88` — «title="Cerrar sesión"»; `src/app/(protected)/admin/_components/admin-topbar.tsx:75` — «<h1 className="mt-1 truncate text-lg font-medium tracking-tight text-white">»; `src/app/(protected)/admin/alerts/page.tsx:13` — «<h1 className="text-3xl font-semibold tracking-tight text-zinc-100">»; `src/app/(protected)/admin/_components/AdminBreadcrumbs.tsx:26` — «<Home className="h-3 w-3" strokeWidth={1.5} />»
- Impacto: El botón de logout y el link a Inicio de los breadcrumbs se anuncian sin nombre (title no es confiable para lectores); cada página admin con h1 propio (19 archivos por git grep) queda con dos h1, uno de ellos el del topbar.
- Propuesta: aria-label en ambos íconos, nav con aria-label de breadcrumb, y que el título del topbar no sea un h1 (o quitar el h1 de las páginas).
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-shell, h4.adm-shell.navegacion

### [A11Y-021] Formularios y controles del admin sin semántica accesible (labels sin asociar, controles sin nombre, errores sin role=alert): novedades, audit log, plan, billing override, notas, leads, mensajes, proyectos, configuración y tickets
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/announcements/_components/announcement-publisher.tsx:102` — «<label className="mb-2 block text-sm font-medium text-zinc-200">Título</label>»; `src/app/(protected)/admin/announcements/_components/announcement-publisher.tsx:177` — «<div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">»; `src/app/(protected)/admin/audit-log/_components/AuditLogClient.tsx:297` — «{error ? <Callout tone="danger">{error}</Callout> : null}»; `src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideForm.tsx:98` — «<label className="text-[10px] uppercase tracking-[0.24em] text-zinc-500"> Precio override (USD/mes)»; `src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideForm.tsx:155` — «<div className={ feedback.type === 'success'»; `src/app/(protected)/admin/clients/[clientId]/_components/InternalNotesCard.tsx:88` — «{error && <p className="text-xs text-red-400">{error}</p>}»; `src/app/(protected)/admin/leads/_components/lead-form.tsx:343` — «<div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">»; `src/app/(protected)/admin/messages/_components/message-input.tsx:93` — «<div className="mb-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">»; `src/app/(protected)/admin/leads/_components/lead-pipeline.tsx:220` — «role="alert"»; `src/app/(protected)/admin/projects/_components/project-form.tsx:213` — «<label className="mb-2 block text-sm font-medium text-zinc-200"> Vincular a cliente del portal (opcional) </label>»; `src/app/(protected)/admin/projects/_components/time-entry-panel.tsx:236` — «<label className="mb-2 block text-sm font-medium text-zinc-200">Horas</label> <input»; `src/app/(protected)/admin/projects/_components/projects-board.tsx:225` — «<div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">»; `src/app/(protected)/admin/projects/_components/overlay-modal.tsx:92` — «const focusFrame = window.requestAnimationFrame(() => { panelRef.current?.focus()»; `src/app/(protected)/admin/settings/_components/settings-console.tsx:730` — «<button type="button" role="switch"»; `src/app/(protected)/admin/settings/_components/settings-console.tsx:386` — «<input type="number" min="0"»; `src/app/(protected)/admin/tickets/_components/ticket-reply-form.tsx:84` — «<textarea ref={textareaRef} value={content}»; `src/app/(protected)/admin/tickets/_components/ticket-chat.tsx:175` — «<div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">»
- Impacto: Los labels no tienen htmlFor/id, así que un lector de pantalla anuncia los campos sin nombre; los errores por campo, el error del server y el aviso de éxito no tienen role=alert/aria-live, y el Callout del design system tampoco (git grep vacío en Callout.tsx).
- Propuesta: Asociar label e input (o usar el Field del design system), role=alert/aria-live en errores y éxito; decisión para Valentino si Callout (src/components/ui, FROZEN) agrega role según tone.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h4.adm-novedades.publicar, h4.adm-audit.listado-y-filtros, lib.ui, h4.adm-clientes.plan, h4.adm-clientes.billing-override, h4.adm-clientes.notas-internas, h4.adm-leads, h4.adm-mensajes, h4.adm-proyectos.alta-edicion, h4.adm-proyectos.tareas, h4.adm-proyectos.horas, h4.adm-config.datos-y-alertas, h4.adm-config.precios-modulos, h4.adm-tickets.conversacion-y-respuesta, h4.adm-clientes.crear-entregable

### [A11Y-022] Archivar y fijar son invisibles sin hover: teclado y pantallas tactiles
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:712` — «className="rounded-lg p-1.5 text-zinc-500 opacity-0 transition-opacity hover:bg-white/[0.05] hover:text-amber-300 group-hover:opacity-100 disabled:opacity-50"»; `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx:721` — «className="rounded-lg p-1.5 opacity-0 transition-opacity hover:bg-white/[0.05] group-hover:opacity-100"»; `src/app/(protected)/admin/clients/[clientId]/_components/ClientSwitcher.tsx:32` — «if (event.key === 'k' && (event.metaKey || event.ctrlKey)) { event.preventDefault()»
- Impacto: Con teclado el foco cae en botones invisibles (sin focus-visible:opacity-100); en celular no hay hover, asi que archivar y fijar no se ven. El switcher secuestra Ctrl+K en toda la pagina y su boton no expone aria-expanded/aria-haspopup (:72-86).
- Propuesta: Agregar focus-visible:opacity-100 y mostrar las acciones siempre en pantallas sin hover (media hover:none); roles y aria-expanded en el switcher.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [A11Y-006]
- Nodo(s): h4.adm-clientes.listado, h4.adm-clientes.archivar, h4.adm-clientes.detalle
- REQUIERE-VERIFICACIÓN-HUMANA: VH-120

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

### [BUG-038] Configurar la agenda de un cliente rompe la agenda del setter: LeadOS busca 'la unica org con calComUsername'
- Dominio: D2  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/lib/leados/agenda.ts:58` — «const orgs = await prisma.organization.findMany({ where: { calComUsername: { not: null } },»; `src/lib/leados/agenda.ts:70` — «if (orgs.length > 1) { // devuelve 'Hay mas de una agenda conectada...'»; `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:325` — «select: { calComApiKey: true, calComUsername: true, calComEmbedUrl: true }, // mismos campos»
- Impacto: El dia que develOP configure Cal.com para su primer cliente del modulo Agenda, el setter deja de poder agendar reuniones hasta que alguien borre el username de una de las dos orgs.
- Propuesta: Coordinar con Franco: identificar la org de develOP por un flag/slug explicito o config propia de LeadOS en vez de 'la unica con calComUsername'.
- Esfuerzo: S  ·  Zona: ZONA-FRANCO
- Relacionado: —
- Nodo(s): h5.set-lead, h2.cli-agenda.panel-de-agenda, lib.leados, int.calcom, modelo.Organization

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

### [DEU-060] Fecha de reactivación de POSTERGADO calculada en el cliente y duplicada; la trampa de z.coerce.date sigue armada
- Dominio: D3  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/admin/leads/_components/change-status-select.tsx:40` — «reactivateAt: next === 'POSTERGADO' ? new Date(Date.now() + POSTPONE_DAYS * 24 * 60 * 60 * 1000)»; `src/app/(protected)/admin/leads/_components/lead-pipeline.tsx:125` — «reactivateAt: status === 'POSTERGADO' ? new Date(Date.now() + POSTPONE_DAYS * 24 * 60 * 60 * 1000)»; `src/app/(protected)/admin/leads/_actions/lead.schemas.ts:40` — «z.coerce.date().optional()»
- Impacto: La regla de negocio (7 días) vive en dos componentes (POSTPONE_DAYS en change-status-select.tsx:14 y lead-pipeline.tsx:32) y depende del reloj del navegador. Si se conecta un date-picker, 'YYYY-MM-DD' se interpreta como medianoche UTC (21:00 del día anterior en Argentina).
- Propuesta: Que updateLeadStatus derive el default de reactivateAt en servidor con el helper de fechas AR y que el schema normalice fechas de calendario. Requiere coordinar con Franco (lead.actions/lead.schemas).
- Esfuerzo: S  ·  Zona: ZONA-FRANCO
- Relacionado: —
- Nodo(s): h4.adm-leads.ficha-y-estado, h4.adm-leads.pipeline-kanban, lib.leados

### [SEC-021] /api/qa/login revela en el 403 cual guarda fallo
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/api/qa/login/route.ts:87` — «return NextResponse.json({ error: 'forbidden', reason: guard.reason }, { status: 403 })»; `src/app/api/qa/login/route.ts:50` — «if (process.env.QA_ALLOW_LOCALHOST !== '1') { return { allowed: false, reason: 'qa_flag_off' }»
- Impacto: Un sondeo anonimo en produccion sabe si QA_ALLOW_LOCALHOST esta activa; la guarda 3 (:65-70) depende de que NETLIFY/VERCEL_ENV existan en runtime. Bajo: las tres guardas siguen cerrando (Host localhost no es alcanzable por la CDN).
- Propuesta: Coordinar con Franco: 404 generico sin reason fuera de localhost.
- Esfuerzo: S  ·  Zona: ZONA-FRANCO
- Relacionado: —
- Nodo(s): h1.auth-login, lib.auth
