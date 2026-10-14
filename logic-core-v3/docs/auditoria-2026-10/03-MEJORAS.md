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

### [UX-003] Cambio forzado sin salida si el cliente no tiene la temporal, y copy de 'forzado' tambien en cambio voluntario
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: ux
- Confianza: PROBABLE
- Evidencia: `src/app/cambiar-password/CambiarPasswordForm.tsx:140` — «<Field label="Contraseña actual" error={errors.oldPassword} required>»; `src/proxy.ts:89` — «return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, nextUrl))»; `src/app/cambiar-password/page.tsx:20` — «Por seguridad, necesitás definir una nueva antes de entrar.»
- Impacto: Un cliente nuevo que entra por magic link (passwordResetRequired=true desde el alta) queda encerrado en /cambiar-password pidiendo una 'contrasena actual' que puede no tener (email de bienvenida perdido); la pagina no ofrece /forgot-password (git grep vacio) y todo el portal redirige ahi. El texto de 'antes de entrar' aparece tambien al cambiarla por gusto.
- Propuesta: (libre) Link a /forgot-password en la pagina; copy condicionado a forceChange; evaluar no exigir la actual cuando el ingreso fue por magic link.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: —
- Nodo(s): h1.auth-cambio.cambio-forzado

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
