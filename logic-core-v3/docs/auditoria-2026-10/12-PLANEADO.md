# 12 — Lo planeado contra lo real

> Extracción de pendientes, promesas, decisiones, ideas, bloques de trabajo y lo que los registros declaran hecho (DEC-39), desde los docs del repo y `_insumos/drive/` (DEC-35). Cada ítem lleva su fuente exacta. **El estado en código lo completa cada dominio de F2** (con `ruta:línea` o la búsqueda que prueba la ausencia); mientras tanto figura «por cruzar». Los insumos de Drive son plan, historia u opinión: nunca evidencia del estado real. Generado por `scripts/auditoria/planeado-md.mjs`.

> Rutas de la fuente: relativas a `logic-core-v3/`; `raiz:` = raíz del repo; `_insumos/` = `logic-core-v3/docs/_insumos/` (insumos de Drive, fuera de git). `#n` distingue ítems que comparten línea. Los hallazgos CRÍTICA/ALTA/P0/P1 de las auditorías previas no se repiten acá: están en `_crudo/previas.json` y cada lector de F2 los re-verifica (DEC-12). Las observaciones de los extractores (contradicciones entre docs, alertas) van en el anexo final, sin verificar contra el código.

## Resumen

- Ítems: **1351** — por tipo: decision 212 · hecho-declarado 443 · idea 56 · pendiente 556 · promesa 6 · bloque 78.
- Estado en código: hecho 119 · parcial 42 · no empezado 77 · abandonado 3 · contradicho 3 · por cruzar 1107.
- ZONA-FRANCO: 361 ítems.
- TODO/FIXME en el código de `origin/main`: 70 (`_crudo/todos-codigo.json`).

| Nodo | Ítems | ZONA-FRANCO | Pendiente, bloque, idea o promesa | Hecho declarado | Decisión |
|---|---:|---:|---:|---:|---:|
| h1.auth-cambio | 6 | 0 | 2 | 2 | 2 |
| h1.auth-impersonacion | 1 | 0 | 1 | 0 | 0 |
| h1.auth-login | 12 | 0 | 6 | 5 | 1 |
| h1.auth-recupero | 2 | 0 | 1 | 1 | 0 |
| h2.cli-agenda | 2 | 0 | 1 | 0 | 1 |
| h2.cli-bienvenida | 2 | 0 | 2 | 0 | 0 |
| h2.cli-cuenta | 13 | 0 | 6 | 6 | 1 |
| h2.cli-email-mkt | 3 | 0 | 2 | 0 | 1 |
| h2.cli-inicio | 22 | 0 | 9 | 12 | 1 |
| h2.cli-mensajes | 4 | 0 | 3 | 1 | 0 |
| h2.cli-plan | 21 | 0 | 8 | 7 | 6 |
| h2.cli-proyecto | 5 | 0 | 3 | 2 | 0 |
| h2.cli-referidos | 2 | 0 | 0 | 1 | 1 |
| h2.cli-reportes-email | 14 | 0 | 6 | 5 | 3 |
| h2.cli-resenas | 11 | 0 | 6 | 5 | 0 |
| h2.cli-resultados | 21 | 0 | 10 | 8 | 3 |
| h2.cli-servicios | 16 | 0 | 8 | 4 | 4 |
| h2.cli-shell | 9 | 0 | 3 | 6 | 0 |
| h2.cli-soporte | 4 | 0 | 2 | 2 | 0 |
| h2.cli-tienda | 2 | 0 | 1 | 0 | 1 |
| h3.adm-actividad | 5 | 0 | 4 | 1 | 0 |
| h3.adm-chatbots | 60 | 2 | 33 | 24 | 3 |
| h3.adm-health | 6 | 0 | 4 | 2 | 0 |
| h3.cli-chatbot | 64 | 0 | 38 | 23 | 3 |
| h3.vis-api-chatbot | 174 | 0 | 95 | 51 | 28 |
| h3.vis-whatsapp | 2 | 0 | 1 | 0 | 1 |
| h3.vis-widget-cliente | 44 | 0 | 22 | 17 | 5 |
| h3.vis-widget-develop | 15 | 0 | 11 | 3 | 1 |
| h4.adm-alertas | 3 | 0 | 2 | 1 | 0 |
| h4.adm-audit | 5 | 0 | 3 | 1 | 1 |
| h4.adm-clientes | 33 | 0 | 23 | 6 | 4 |
| h4.adm-config | 10 | 1 | 6 | 2 | 2 |
| h4.adm-dashboard | 8 | 0 | 4 | 2 | 2 |
| h4.adm-equipo | 7 | 2 | 4 | 2 | 1 |
| h4.adm-leads | 14 | 12 | 8 | 4 | 2 |
| h4.adm-mensajes | 1 | 0 | 1 | 0 | 0 |
| h4.adm-novedades | 1 | 0 | 0 | 1 | 0 |
| h4.adm-proyectos | 15 | 0 | 8 | 5 | 2 |
| h4.adm-shell | 15 | 0 | 8 | 5 | 2 |
| h4.adm-tickets | 4 | 0 | 1 | 2 | 1 |
| h5.adm-fg2lab | 4 | 4 | 1 | 2 | 1 |
| h5.adm-revision-demos | 20 | 20 | 12 | 6 | 2 |
| h5.set-dia | 78 | 78 | 23 | 40 | 15 |
| h5.set-importar | 3 | 3 | 1 | 1 | 1 |
| h5.set-lead | 52 | 52 | 20 | 24 | 8 |
| h5.set-manual | 144 | 144 | 78 | 43 | 23 |
| h5.set-nuevo | 2 | 2 | 1 | 1 | 0 |
| h6.vis-contacto | 1 | 0 | 1 | 0 | 0 |
| h6.vis-optout | 3 | 0 | 2 | 1 | 0 |
| lib.otro | 19 | 11 | 8 | 7 | 4 |
| lib.plataforma | 187 | 27 | 116 | 46 | 25 |
| lib.sitio-publico | 57 | 0 | 31 | 8 | 18 |
| lib.transversal | 123 | 3 | 46 | 45 | 32 |

## h1 · Acceso

### h1.auth-cambio — Cambio obligatorio de contraseña

#### [PLAN-001] Acciones que tocan sessionVersion: llamada directa
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:398` · tipo: decision · estado declarado: hecho · fecha: 2026-06-27
- Nodo(s): h1.auth-cambio
- Qué es: Nunca <form action> con useActionState. Se usa startTransition con await y se navega o refresca después. Patrón: CambiarPasswordForm.
- Referencias: auth.ts (jwt callback) · CambiarPasswordForm.tsx · tambien en Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:87
- Estado en código: **hecho** — CambiarPasswordForm.tsx:116-131 y ProfileForms.tsx:374-394 invocan directo con startTransition y navegan/refrescan despues (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-002] Bloque B: password en /cambiar-password
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:60` · tipo: hecho-declarado · estado declarado: hecho (sin mergear)
- Nodo(s): h1.auth-cambio
- Qué es: Visor Eye/EyeOff, regla 8+mayúscula+número en el cliente y en Zod, y botón deshabilitado hasta que sea válido. Mecanismo intacto. Falta el OK visual.
- Referencias: 9a1d841 · f22f8d6 · CambiarPasswordForm.tsx · cambiar-password/actions.ts · tambien en Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:165
- Estado en código: **hecho** — Visor Eye/EyeOff (CambiarPasswordForm.tsx:30-76), regla en cliente (:19-25) y Zod (actions.ts:12-19), boton deshabilitado (:95, :203) en origin/main (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-003] Regla única de password: 8 caracteres, mayúscula y número
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:86` · tipo: decision · estado declarado: hecho
- Nodo(s): h1.auth-cambio
- Qué es: Una sola regla en todo el producto, en el cliente y en Zod del server.
- Referencias: CambiarPasswordSchema · UpdatePasswordSchema · tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:187
- Estado en código: **parcial** — Aplicada en CambiarPasswordSchema (cambiar-password/actions.ts:12-19) y UpdatePasswordSchema (schemas.ts:22-35); no en ResetPasswordSchema (schemas.ts:94-97) ni en accept-invite (actions.ts:26-31) (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-004] Endpoint logout-all
- Fuente: `docs/bitacora-roadmap.md:7621` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-25
- Nodo(s): h1.auth-cambio
- Qué es: Invalidar todos los tokens de un usuario para revocación post-incidente; no urgente.
- Estado en código: **no empezado** — git grep -niE "logout-all|logoutAll|revokeAll|signOutEverywhere" -> vacio (control: 4 archivos con sessionVersion increment) (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-005] B-SEC.3a — Invalidación de JWT al cambiar o resetear password
- Fuente: `docs/bitacora-roadmap.md:7968` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h1.auth-cambio
- Qué es: User.sessionVersion (migración aditiva) en el JWT; el callback jwt invalida tokens con versión distinta; incremento en reset, cambio de password, profile y resend-credentials; cierra SEC-AUTH-03.
- Referencias: prisma/schema.prisma · prisma/migrations/20260526050401_add_user_session_version/migration.sql · src/types/next-auth.d.ts · src/auth.ts · src/app/reset-password/actions.ts · src/app/cambiar-password/actions.ts +4
- Estado en código: **parcial** — Campo (schema.prisma:294), chequeo (auth.ts:212-230) e incrementos (reset :76, cambiar :59, profile :230, resend-credentials :71) existen; pero el trigger 'update' saltea el chequeo (auth.ts:216-217) y el proxy no lo ve (auth.config.ts:24-40) -> SEC-AUTH-03 no queda cerrado (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-006] Verificación dinámica de sessionVersion multi-device
- Fuente: `docs/bitacora-roadmap.md:8108` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h1.auth-cambio
- Qué es: Probar que un token previo deja de funcionar tras el reset y que unstable_update({}) dispara trigger update en NextAuth beta.30.
- Referencias: src/auth.ts · src/lib/actions/profile.ts · tambien en docs/bitacora-roadmap.md:8083 · tambien en docs/bitacora-roadmap.md:8110
- Estado en código: **no empezado** — git grep -n sessionVersion origin/main -- logic-core-v3/tests logic-core-v3/scripts -> vacio (control: tests/ tiene 97 archivos). Por lectura fallaria: bucle proxy.ts:134-146 vs dashboard/layout.tsx:90-92 y revivido por POST /api/auth/session (auth.ts:215-217) (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

### h1.auth-impersonacion — Ver como cliente (impersonación)

#### [PLAN-007] CTA de upsell en preview admin
- Fuente: `docs/sprints/p3-a-2-venta.md:131` · tipo: pendiente · estado declarado: aceptado (precedente P5.2)
- Nodo(s): h1.auth-impersonacion
- Qué es: Falla con 'Sesión inválida.' porque SUPER_ADMIN no tiene organizationId.
- Estado en código: **no empezado** — src/lib/actions/upsell.ts:16-19 sigue usando session.user.organizationId (SUPER_ADMIN no tiene); mismo patron en profile.ts:29-33 (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: decidir

### h1.auth-login — Login (contraseña, magic link, Google)

#### [PLAN-008] Bloque B3: visor de password en /login
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:73` · tipo: hecho-declarado · estado declarado: hecho (sin mergear)
- Nodo(s): h1.auth-login
- Qué es: Alterna el tipo del input en FloatingField solo para password. No toca loginAction.
- Referencias: e3740a2 · src/app/login/page.tsx
- Estado en código: **hecho** — login/page.tsx:52-58 y :108-118 (toggle del type; loginAction intacto) (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-009] 0.1 Auth QA-login: nombre de cookie de sesión unificado
- Fuente: `docs/bitacora-beta-2.md:22` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-25
- Nodo(s): h1.auth-login
- Qué es: src/lib/auth-cookies.ts fija SESSION_COOKIE_NAME/OPTIONS por NODE_ENV y lo importan qa/login, auth.ts y auth.config.ts; corrige prod sobre HTTP. Entrada reconstruida de la memoria del proyecto.
- Referencias: src/lib/auth-cookies.ts · src/app/api/qa/login/route.ts · src/auth.ts · src/auth.config.ts · bug detectado en docs/bitacora-beta.md:1744
- Estado en código: **hecho** — src/lib/auth-cookies.ts:19-30 importado por auth.ts:12, auth.config.ts:2 y qa/login/route.ts:29 (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-010] /login no tiene <h1>
- Fuente: `docs/bitacora-rediseno.md:3387` · tipo: pendiente · estado declarado: pendiente (preexistente) · fecha: 2026-08-05
- Nodo(s): h1.auth-login
- Qué es: Preexistente, detectado al verificar que las rutas sirven contenido real.
- Referencias: /login
- Estado en código: **no empezado** — git grep -n "<h1" origin/main -- logic-core-v3/src/app/login -> vacio (control: forgot-password/page.tsx:53) (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-011] MS-8 — Login QA inyectable con triple candado
- Fuente: `docs/bitacora-roadmap.md:6321` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h1.auth-login
- Qué es: /api/qa/login mintea la cookie de NextAuth para 3 personas seed (super-admin, client-a, client-b) solo con QA_ALLOW_LOCALHOST=1, Host localhost y sin NETLIFY/VERCEL_ENV=production; seed de org qa-cliente-b.
- Referencias: src/app/api/qa/login/route.ts · prisma/seed.ts · .env.example · .claude/agents/visual-qa.md
- Estado en código: **hecho** — src/app/api/qa/login/route.ts:49-73 (3 guardas) aplicadas en :85-88, :198-201, :215-218; persona setter agregada (:42) (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-012] Resend solo para Magic Link; transaccionales por Brevo
- Fuente: `docs/bitacora-roadmap.md:7546` · tipo: decision · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h1.auth-login
- Qué es: forgot-password migró de Resend a Brevo por consistencia con resend-credentials.
- Referencias: src/auth.ts · src/lib/email/brevo-service.ts
- Estado en código: **parcial** — Brevo: forgot-password/actions.ts:96-101, resend-credentials/route.ts:85-90, y el propio magic link (auth.ts:104). Siguen por Resend: src/lib/email.ts:1-30 (usado por tickets/actions.ts:5 y agency-actions.ts:7), notify-message.ts:1-18 y settings.ts:194 (muerto); email.ts:15-16 devuelve success:true sin API key (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-013] Extender ?e2e=1 al DotMatrix de las páginas de auth
- Fuente: `docs/bitacora-roadmap.md:7705` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h1.auth-login
- Qué es: /login, /forgot-password y /reset-password no se pueden screenshottear headless porque el canvas no pinta el primer frame.
- Referencias: DotMatrix · tambien en docs/bitacora-roadmap.md:7900
- Estado en código: **no empezado** — git grep -n e2e origin/main -- DotMatrix.tsx y src/app/{login,forgot-password,reset-password,accept-invite} -> vacio (control: PreloaderContext.tsx:81) (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-014] /logout en ALWAYS_ALLOWED del middleware pero la ruta no existe
- Fuente: `docs/bitacora-roadmap.md:7898` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h1.auth-login
- Qué es: Allowance muerta preexistente (404).
- Referencias: src/proxy.ts
- Estado en código: **no empezado** — src/proxy.ts:68 sigue con '/logout'; git ls-tree -r --name-only origin/main -- logic-core-v3/src/app | grep /logout/ -> vacio (control: git grep "'/logout'" -> proxy.ts:68). Ademas el matcher (:172) no incluye /logout ni /api, asi que '/api/auth/' y '/api/' tambien son muertas (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-015] D-AUTH inputs del login visibles
- Fuente: `docs/bitacora-roadmap.md:12242` · tipo: hecho-declarado · estado declarado: hecho (verificación humana pendiente)
- Nodo(s): h1.auth-login
- Qué es: FloatingField con initial/animate propios.
- Referencias: src/app/login/page.tsx
- Estado en código: **hecho** — FloatingField con initial/animate propios (login/page.tsx:61-72) (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-016] MAGIC-BREVO magic link por Brevo
- Fuente: `docs/bitacora-roadmap.md:12266` · tipo: hecho-declarado · estado declarado: hecho (verificación humana pendiente)
- Nodo(s): h1.auth-login
- Qué es: sendVerificationRequest usa Brevo; se quitó el from muerto del provider.
- Referencias: src/auth.ts
- Estado en código: **hecho** — sendVerificationRequest -> sendTransactionalEmail (auth.ts:97-121); el provider ya no tiene 'from' (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-017] Manejo de error en el envío del magic link
- Fuente: `docs/bitacora-roadmap.md:12279` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h1.auth-login
- Qué es: El resultado del envío no se inspecciona; throw on fail queda para sprint propio.
- Referencias: src/auth.ts
- Estado en código: **no empezado** — src/auth.ts:104 descarta el resultado de sendTransactionalEmail; brevo-service.ts:20-23 y :40-46 devuelven {ok:false} sin lanzar (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-018] Dead code getPostLoginPath en auth.ts
- Fuente: `docs/bitacora-roadmap.md:12323` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h1.auth-login
- Qué es: Función sin callers en auth.ts:65; limpieza en sprint propio.
- Referencias: src/auth.ts · también en fuente:12288
- Estado en código: **no empezado** — src/auth.ts:65-74; git grep -n getPostLoginPath origin/main -- logic-core-v3/src -> solo la definicion (auth.ts:65) (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-019] Hashes de auth-rate-limit sin salt
- Fuente: `docs/bitacora-roadmap.md:16881` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-11
- Nodo(s): h1.auth-login
- Qué es: Esquemas C/D de hash de la plataforma siguen sin salt.
- Referencias: src/lib/security/auth-rate-limit.ts
- Estado en código: **no empezado** — src/lib/security/auth-rate-limit.ts:24-27 y :37-43: sha256 sin sal ni pepper (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

### h1.auth-recupero — Olvidé / restablecer contraseña

#### [PLAN-020] B12.5 — Reset de contraseña endurecido
- Fuente: `docs/bitacora-roadmap.md:7481` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h1.auth-recupero
- Qué es: Token de 45 min de un solo uso con invalidación de previos, mensaje anti-enumeration idéntico + dummy bcrypt, rate-limit por IP/email/admin (in-memory), Zod en los 3 endpoints, forgot-password migrado a Brevo y audit PASSWORD_CHANGED.
- Referencias: src/lib/security/auth-rate-limit.ts · src/lib/email/templates/password-reset.ts · src/lib/actions/schemas.ts · src/app/forgot-password/actions.ts · src/app/reset-password/actions.ts · src/app/api/admin/users/[userId]/resend-credentials/route.ts
- Estado en código: **hecho** — Token 45 min (forgot-password/actions.ts:16), un solo uso (reset-password/actions.ts:55-56, :80-83), invalida previos (forgot :77-79), mensaje identico + bcrypt dummy (:17-18, :67-70), limites por IP/email/admin ahora en DB (limiter.ts:37-84), Zod en los 3 endpoints, Brevo, audit PASSWORD_CHANGED (reset :87-96) (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-021] Acceso pospuesto a Beta
- Fuente: `STATUS.md:190` · tipo: pendiente · estado declarado: pospuesto a Beta · fecha: 2026-05-21
- Nodo(s): h1.auth-recupero
- Qué es: Self-service signup, 'olvidé mi contraseña' por email (P1-4) y 2FA.
- Referencias: tambien en :191, :192
- Estado en código: **parcial** — Olvide mi contrasena hecho (forgot-password/actions.ts:24-110); signup y 2FA sin rastro (git ls-tree app | grep signup/register y git grep totp/2fa/otplib -> vacios; control: forgot-password listado) (D1-c1, lector D1-L1)
- ¿Sigue teniendo sentido?: decidir

## h2 · Portal del cliente

### h2.cli-agenda — Agenda inteligente (módulo)

#### [PLAN-022] D-C3: la reserva de turnos no va en el bot
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:14` · tipo: decision · estado declarado: descartado
- Nodo(s): h2.cli-agenda
- Qué es: Pertenece al proyecto agenda (~35%, API v1 apagada).
- Referencias: tambien en Franco/Bloques a Ejecutar/DASHBOARD/HANDOFF-chatbot-arranque.md:25 · tambien en Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:89
- Estado en código: **abandonado** — git grep -niE 'cal\.com|createBooking|bookAppointment|reservar turno' origin/main -- src/modules/chatbot vacio; control: integrations/cal-com usado en agenda-inteligente/page.tsx:6 y cal-com-v2 en setter/_actions/agenda.actions.ts:28 (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-023] Agenda Cal.com y WhatsApp Business API
- Fuente: `STATUS.md:198` · tipo: pendiente · estado declarado: pospuesto a Beta · fecha: 2026-05-21
- Nodo(s): h2.cli-agenda
- Qué es: Pospuestas a Beta (hoy WhatsApp es link).
- Referencias: tambien en :199
- Estado en código: **parcial** — Agenda: modulo ACTIVE en el catalogo (premium-modules.ts:52, :63) con integracion read-only v1 (cal-com.ts:4, :49); WhatsApp: 'whatsapp-autopilot' COMING_SOON (premium-modules.ts:84) (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

### h2.cli-bienvenida — Bienvenida / onboarding inicial

#### [PLAN-024] completeOnboardingAction sin caller y con auth débil
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:87` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-13
- Nodo(s): h2.cli-bienvenida
- Qué es: No tiene caller en src/, y obtiene la session pero no la usa. ¿Ruta muerta o a medio cablear?
- Referencias: completeOnboardingAction
- Estado en código: **no empezado** — src/actions/onboarding-actions.ts:79-82 sigue exportada (session obtenida y no usada) y guarda credenciales en claro (:111-131). git grep -n "onboarding-actions" → solo components/onboarding/OnboardingWizard.tsx:6 (importa saveOnboardingProfile), y ese wizard (:480) no tiene importadores (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-025] OnboardingWizard no reutilizable y borrador global
- Fuente: `docs/bitacora-beta-3.md:4928` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-08-24
- Nodo(s): h2.cli-bienvenida
- Qué es: 30 campos hardcodeados; el autoguardado es localStorage con clave global develop:onboarding:draft, sin servidor.
- Referencias: OnboardingWizard · ProgressBar.tsx
- Estado en código: **no empezado** — modules/chatbot/components/admin/onboarding/useOnboardingDraft.ts:6 DRAFT_KEY = 'develop:onboarding:draft' en localStorage (:31, :36) (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

### h2.cli-cuenta — Mi cuenta

#### [PLAN-026] Mi Cuenta: rediseño de Perfil, Facturación y Bóveda
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:49` · tipo: hecho-declarado · estado declarado: hecho (sin mergear) · fecha: 2026-06-27
- Nodo(s): h2.cli-cuenta
- Qué es: Ancho completo, receta visual del admin, primitivos Input y Toggle, menos ruido en la Bóveda. Corrige rutas muertas de revalidate/links y el mojibake.
- Referencias: 2c6966e · a5d511c · 26026df · 17a9e0a · 31bfd39 · lane/cuenta +1
- Estado en código: **hecho** — 2c6966e, a5d511c, 26026df, 17a9e0a, 31bfd39 son ancestros de origin/main (git merge-base --is-ancestor) (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-027] Fase 1: validación de password
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:177` · tipo: hecho-declarado · estado declarado: hecho (sin mergear) · fecha: 2026-06-27
- Nodo(s): h2.cli-cuenta
- Qué es: Regex de mayúscula y número en UpdatePasswordSchema, submit deshabilitado, visor corregido y unstable_update con payload.
- Referencias: 8b641a0 · src/lib/actions/schemas.ts
- Estado en código: **hecho** — schemas.ts:22-35 (regex mayuscula y numero); ProfileForms.tsx:331-344, :532 (submit deshabilitado); profile.ts:239; 8b641a0 ancestro. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: no

#### [PLAN-028] Fases 3 y 4: avatar del cliente y modal de la Bóveda
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:211` · tipo: hecho-declarado · estado declarado: hecho (sin mergear) · fecha: 2026-06-27
- Nodo(s): h2.cli-cuenta
- Qué es: ClientAvatarField reemplaza logoUrl en el form; logoUrl queda intacto en la DB. VaultRequestModal pasa al Modal primitivo.
- Referencias: 6c83b16 · f86c911 · ClientAvatarField · VaultRequestModal.tsx · tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:229
- Estado en código: **hecho** — ProfileForms.tsx:33-36, :234-237 (ClientAvatarField + hidden inputs); VaultRequestModal.tsx:7, :66-73 (Modal primitivo); commits 6c83b16 y f86c911 ancestros de origin/main. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: no

#### [PLAN-029] Fix de la pantalla negra al cambiar password
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:276` · tipo: hecho-declarado · estado declarado: hecho (sin verificar) · fecha: 2026-06-27
- Nodo(s): h2.cli-cuenta
- Qué es: PasswordForm pasa a onSubmit con startTransition, await y router.refresh, sin <form action>. auth.ts intacto. Pendiente de verificación humana.
- Referencias: 7a6ee10 · 2730502 · b31d76b · ProfileForms.tsx
- Estado en código: **hecho** — ProfileForms.tsx:375-397 (onSubmit + startTransition + await + router.refresh, sin <form action>); profile.ts:234-239 (unstable_update con payload); commits 7a6ee10, 2730502, b31d76b ancestros. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-030] Layout de Perfil en 2 columnas alineadas
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:319` · tipo: hecho-declarado · estado declarado: hecho (sin verificar) · fecha: 2026-06-27
- Nodo(s): h2.cli-cuenta
- Qué es: Reorden de columnas, zona de peligro a ancho completo y última card con flex-1 y h-full. También quita el espacio muerto inferior. Pendiente de verificación humana.
- Referencias: b9a8565 · 7adeae6 · 040ce97 · fde9bdb
- Estado en código: **hecho** — b9a8565, 7adeae6, 040ce97, fde9bdb en origin/main; perfil/page.tsx:237-323 (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-031] Facturas sin generación (frenado por schema)
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:420` · tipo: pendiente · estado declarado: bloqueado · fecha: 2026-06-27
- Nodo(s): h2.cli-cuenta
- Qué es: Invoice existe pero nunca se genera en producción. Requiere AssetType.INVOICE, una librería PDF, un form en el admin y poblar Invoice.pdfUrl.
- Referencias: Invoice.pdfUrl · AssetType.INVOICE · tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:171 · tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:410
- Estado en código: **no empezado** — git grep -nE 'invoice\.(create|createMany|upsert|update)' origin/main -- src prisma scripts -> solo prisma/seed.ts:595, :618; enum AssetType sin INVOICE (schema.prisma:96-103) (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-032] Timeline de la Bóveda con datos falsos
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:431` · tipo: pendiente · estado declarado: bloqueado · fecha: 2026-06-27
- Nodo(s): h2.cli-cuenta
- Qué es: El 'Registro de integridad y accesos' muestra ACTIVITY_LOG hardcodeado. El modelo real requiere schema.
- Referencias: boveda/page.tsx ACTIVITY_LOG · tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:117
- Estado en código: **no empezado** — boveda/page.tsx:51-58 ACTIVITY_LOG fijo, renderizado en :275-316 (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-033] Defectos menores de UX en Mi Cuenta
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:435` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-27
- Nodo(s): h2.cli-cuenta
- Qué es: ?delete= queda en la URL. VaultRequestModal no cierra con Escape. set-state-in-effect en VaultRevealButton:21. El tooltip 'Generando' se recorta. Eye sin strokeWidth. cuenta/loading.tsx desactualizado.
- Referencias: VaultRevealButton.tsx:21 · VaultRequestModal.tsx · cuenta/loading.tsx · tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:439 · tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:443 · tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:455
- Estado en código: **parcial** — Siguen: Modal.tsx sin Escape (git grep -nE 'Escape|keydown|onKeyDown' origin/main -- src/components/ui/Modal.tsx vacio); Eye/EyeOff sin strokeWidth (ProfileForms.tsx:423, :447, :503); tooltip 'Generando...' dentro de overflow-x-auto (facturacion/page.tsx:168, :241-254); cuenta/loading.tsx:5 max-w-5xl pb-20; ?delete= (ClientsListClient.tsx:251). Resuelto: VaultRevealButton.tsx:31-43 ya no hace setState directo en el effect. (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-034] 6 verificaciones humanas pendientes de lane/cuenta
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:461` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-27
- Nodo(s): h2.cli-cuenta
- Qué es: Password end-to-end, avatar, backdrop del modal, ticket→borrar, alineación de columnas y visual fino. Necesarias antes de declararla lista para producción.
- Referencias: tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:484
- Estado en código: **parcial** — Las features existen en main (PasswordForm ProfileForms.tsx:359-535, avatar :230-238, VaultRequestModal con Modal primitivo); la verificacion humana no es comprobable por codigo. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-035] PD-1: credenciales de la bóveda cifradas
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:8` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-13
- Nodo(s): h2.cli-cuenta
- Qué es: AES-256-GCM en ClientAsset.description con formato enc:v1. Ambos caminos de escritura cifran con validación Zod. Los lectores descifran y enmascaran con botón reveal. Backfill de 2 filas. Verificado end-to-end.
- Referencias: src/lib/crypto/credential-cipher.ts · src/lib/crypto/encrypt-for-storage.ts · src/lib/crypto/resolve-credential.ts · completeOnboardingAction · VaultRevealButton · env ONBOARDING_SECRET_KEY (solo nombre) +1
- Estado en código: **parcial** — Lectura en main: resolve-credential.ts:17-26, boveda/page.tsx:131, VaultTab.tsx:41. Escritura en claro en main: agency-actions.ts:103-111 (sin Zod ni cifrado); onboarding-actions.ts:111-131 en claro con url 'ENCRIPTADO_EN_TEXTO'. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-036] Cifrado serializado dentro de description
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:12` · tipo: decision · estado declarado: hecho · fecha: 2026-07-13
- Nodo(s): h2.cli-cuenta
- Qué es: Formato enc:v1:<iv>:<tag>:<ciphertext> en ClientAsset.description en lugar de columnas nuevas, para no depender de una migración.
- Referencias: ClientAsset.description
- Estado en código: **parcial** — Formato y lectura en main (credential-cipher.ts:11, :22; resolve-credential.ts:16-25); escritura cifrada solo en origin/b0-isolation-motor-chatbot (9fc616c4, no ancestro de origin/main); agency-actions.ts:103-110 escribe en claro (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-037] Credencial en claro al mostrarla (at-display)
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:24` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-13
- Nodo(s): h2.cli-cuenta
- Qué es: El enmascarado es cosmético: el valor descifrado viaja en el prop del RSC. PD-1 solo cerró el cifrado en reposo; endurecer lo que se muestra es deuda aparte.
- Referencias: /dashboard/cuenta/boveda · VaultRevealButton
- Estado en código: **no empezado** — boveda/page.tsx:185 <VaultRevealButton value={credential.value} /> serializa el valor descifrado como prop de un client component. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-038] PD-1 Onboarding Vault sin cerrar
- Fuente: `docs/bitacora-roadmap.md:13623` · tipo: pendiente · estado declarado: en curso · fecha: 2026-07-11
- Nodo(s): h2.cli-cuenta
- Qué es: Cambios de cifrado de credenciales del onboarding sin commitear y sin entrada de cierre en esta bitácora.
- Referencias: src/lib/crypto/ · docs/audit-PD1-cifrado-onboarding.md · src/components/dashboard/VaultRevealButton.tsx · también en fuente:13731
- Estado en código: **parcial** — En origin/main: credential-cipher.ts, resolve-credential.ts, VaultRevealButton. encrypt-for-storage.ts y su uso en agency-actions/onboarding-actions solo en origin/b0-isolation-motor-chatbot (commit 9fc616c4, rama 8 commits por delante de main). (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

### h2.cli-email-mkt — Email marketing (módulo)

#### [PLAN-039] Email marketing: sin BackLink y router.push documentado
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:84` · tipo: decision · estado declarado: hecho
- Nodo(s): h2.cli-email-mkt
- Qué es: Sin botón volver en campaigns/contactos (mismo criterio que resultados/* y cuenta/*). Los router.push post-acción de campaigns/new se documentan, no se migran.
- Referencias: campaigns/new · tambien en Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:85
- Estado en código: **parcial** — campaigns/new/page.tsx:38-40, :69-72, :150-153 documentados; send/page.tsx:24 router.push sin comentario (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-040] fromEmail libre en campañas sin validar dominio
- Fuente: `docs/bitacora-roadmap.md:9822` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-email-mkt
- Qué es: Riesgo de spoofing/deliverability si el envío no valida SPF/DKIM del remitente; sprint de deliverability propio.
- Referencias: también en fuente:9871
- Estado en código: **no empezado** — email-marketing/_actions.ts:134-137 solo chequea presencia; brevo.ts:76 usa params.fromEmail como sender. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-041] sendCampaignAction: updates por id y htmlContent sin sanitizar
- Fuente: `docs/bitacora-roadmap.md:11020#2` · tipo: pendiente · estado declarado: pendiente (reportado para decisión)
- Nodo(s): h2.cli-email-mkt
- Qué es: Dos update scoped solo por id y HTML de campañas sin sanitizar (XSS saliente).
- Referencias: src/app/(protected)/dashboard/modules/email-marketing/_actions.ts
- Estado en código: **no empezado** — _actions.ts:198-201 y :207-214 update por id (precedidos por findFirst scoped :177-179, no explotable); htmlContent sin sanitizar :135, :150-156 -> brevo.ts:75 (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: decidir

### h2.cli-inicio — Inicio

#### [PLAN-042] Inicio: reskin S1, S2, S3a y S5
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho (sin mergear)
- Nodo(s): h2.cli-inicio
- Qué es: OnboardingStatusCard con tokens y vidrio canónico. Hover split-wrapper en AttentionStack y WeekResultsGrid. Ancho completo y barrido de strokeWidth.
- Referencias: 2725caf · b811c17 · 6e19f7e · f9eb475 · 7b8aa4f · lane/inicio
- Estado en código: **hecho** — 2725caf, b811c17, 6e19f7e, f9eb475 y 7b8aa4f son ancestros de origin/main (git merge-base --is-ancestor); el 'sin mergear' ya no aplica (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-043] Inicio: datos honestos (S3b, S4, S4b)
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:34` · tipo: hecho-declarado · estado declarado: hecho (sin mergear)
- Nodo(s): h2.cli-inicio
- Qué es: Captions 'Sin integración aún' y 'En calibración'. Oculta el TrendChip falso (hash del orgId) y la frase de tendencia falsa del subtítulo.
- Referencias: b735b3f · 7777cdc · 8c7f12b · HealthScore.tsx · lib/health-score.ts computeTrend
- Estado en código: **hecho** — commits b735b3f, 7777cdc, 8c7f12b son ancestros de origin/main (git merge-base --is-ancestor); WeekResultsGrid.tsx:48-55; HealthScore.tsx:97-100, :394-401; computeTrend ausente (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-044] TrendChip oculto (opción B)
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:72` · tipo: decision · estado declarado: hecho
- Nodo(s): h2.cli-inicio
- Qué es: No se toca lib/health-score. Se reactiva cuando exista historial real (HealthScoreSnapshot, lane de datos aparte).
- Referencias: HealthScoreSnapshot · TrendChip
- Estado en código: **hecho** — HealthScore.tsx:97-100 sin TrendChip; no existe model HealthScoreSnapshot (git grep vacío; control: model ExecutiveBriefSnapshot en schema.prisma:459). (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-045] Deuda de datos de Inicio
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:96` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-inicio
- Qué es: Dos fuentes de score que se contradicen (CALIBRANDO contra Brief IA 84). Visitas fijas en 0 (falta GA4). Centinela ↑100% de calcTrend cuando la semana previa es 0.
- Referencias: week-results.ts · calcTrend · lib/dashboard/* · tambien en Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:98 · tambien en Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:99
- Estado en código: **no empezado** — HealthScore.tsx:31-33 'calibrando' perpetuo (dataConnections sin escritor) vs executive-brief.ts:291 total al LLM; week-results.ts:41-42 visitas 0; week-results.ts:109 centinela 100 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-046] El conteo de leads de Inicio mezcla tenants
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Inicio_ registro de cambios.md:97` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-inicio
- Qué es: contactSubmission.count se calcula sin organizationId: el número y el delta incluyen leads de otros tenants. Se tapó con el caption 'En calibración'. El fix real es scopear por organizationId (schema y query).
- Referencias: week-results.ts · computeLeadsScore · ContactSubmission
- Estado en código: **no empezado** — week-results.ts:43-52 y health-score.ts:284-289, :317-333 siguen contando ContactSubmission sin organizationId; solo existe el caption 'En calibración' (WeekResultsGrid.tsx:44-55) (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-047] Portal cliente: 'visits' hardcodeado en 0 en Resultados de la semana
- Fuente: `docs/bitacora-rediseno.md:2698` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-08-04
- Nodo(s): h2.cli-inicio
- Qué es: No hay integración de analítica (la card muestra 'Sin integración aún'); WeekResultsData no tiene ventas ni facturación y compara contra la semana anterior.
- Referencias: src/lib/dashboard/week-results.ts · src/lib/health-score.ts · src/lib/dashboard/attention.ts · src/lib/ai/executive-brief.ts · también en docs/bitacora-rediseno.md:2690
- Estado en código: **no empezado** — week-results.ts:41-42 Promise.resolve(0); WeekResultsGrid.tsx:49-52 solo rotula 'Sin integración aún'; WeekResultsData sin ventas :11-16 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-048] B6.4 — Gate de 4h entre regeneraciones manuales del brief (cierre de B6)
- Fuente: `docs/bitacora-roadmap.md:5264` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h2.cli-inicio
- Qué es: MIN_HOURS_BETWEEN_MANUAL_REGENS = 4 sobre el límite semanal de 3, inferido del estado existente sin schema nuevo; declara cerrado el bloque B6 (B6.1 a B6.4).
- Referencias: src/lib/ai/executive-brief.ts · AIExecutiveBriefV2.tsx · tambien en docs/bitacora-roadmap.md:5342
- Estado en código: **hecho** — executive-brief.ts:32, :169-182 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-049] Badge/disclaimer 'Generado por IA' en outputs LLM
- Fuente: `docs/bitacora-roadmap.md:6193` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h2.cli-inicio
- Qué es: Anotado en roadmap-pendientes §B9.3; incluye el AIExecutiveBrief (transparencia de IA, sprint propio).
- Referencias: docs/roadmap-pendientes.md · tambien en docs/bitacora-roadmap.md:6201
- Estado en código: **parcial** — AIExecutiveBriefV2.tsx:55 'Resumen Ejecutivo - IA'; InsightsBlock.tsx:49-52 y DiscoveriesSection.tsx:38 sin aviso. git grep -n -i "generado por ia\|AiBadge\|ai-disclaimer" origin/main -- logic-core-v3/src → 0; control: git grep -n -i "con IA" → motor-resenas/_components/ReviewItem.tsx:171 (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-050] B12.7 — Brief truncado por thinking tokens + label '0/6'
- Fuente: `docs/bitacora-roadmap.md:7265` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h2.cli-inicio
- Qué es: maxOutputTokens del brief a 1024 (gemini-2.5-flash consume tokens de thinking), isBriefValid invalida el brief truncado cacheado, BriefEmptyState honesto y label 'Integraciones conectadas'.
- Referencias: src/lib/ai/executive-brief.ts · src/app/(protected)/dashboard/page.tsx · src/components/dashboard/home/HealthScore.tsx
- Estado en código: **hecho** — executive-brief.ts:26 (1024), :38-42 isBriefValid usado en :84, :102, :187, :239; page.tsx:218-234 BriefEmptyState; HealthScore.tsx:186 'Integraciones conectadas' (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-051] AIExecutiveBrief sin feature flag
- Fuente: `docs/bitacora-roadmap.md:8921#3` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h2.cli-inicio
- Qué es: El brief IA del dashboard no tiene feature flag; derivado a B14.
- Estado en código: **no empezado** — dashboard/page.tsx:191-210 renderiza AIExecutiveBriefV2 tras getExecutiveBrief sin flag; git grep -n -i "FEATURE_FLAG\|featureFlag\|isFeatureEnabled" origin/main -- logic-core-v3/src → ningún mecanismo de flags (solo softFlags de LeadOS) (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-052] UX del Health Score 'Calibrando' tras redirect
- Fuente: `docs/bitacora-roadmap.md:10355` · tipo: pendiente · estado declarado: pendiente (decisión de Franco)
- Nodo(s): h2.cli-inicio
- Qué es: Al entrar a un módulo desactivado se redirige al home con 'Calibrando tu score'; decidir si es la UX deseada.
- Estado en código: **no empezado** — Módulo inactivo → redirect('/dashboard') (agenda-inteligente/page.tsx:321, tienda-conectada/page.tsx:296, email-marketing/layout.tsx:21); HealthScore.tsx:159,171 'Calibrando'. Sin decisión aplicada. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-053] Ventanas de semana por milisegundos crudos
- Fuente: `docs/bitacora-roadmap.md:11101` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-30
- Nodo(s): h2.cli-inicio
- Qué es: week-results.ts no alinea a días AR; migrar a weekRangeAR.
- Referencias: src/lib/dashboard/week-results.ts
- Estado en código: **no empezado** — week-results.ts:27-29 now − 7×24 h; home-metrics-logic.ts:22-30 sí usa weekRangeAR (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-054] P1.C home como panel de resultados
- Fuente: `docs/bitacora-roadmap.md:11172` · tipo: hecho-declarado · estado declarado: hecho (checkpoint visual humano) · fecha: 2026-06-30
- Nodo(s): h2.cli-inicio
- Qué es: Hero con las 4 preguntas del dueño, origen y embudo.
- Referencias: src/lib/dashboard/home-metrics.ts · src/components/dashboard/home/BusinessHero.tsx
- Estado en código: **hecho** — page.tsx:66-68, :110-138; home-metrics.ts:79-144; BusinessHero.tsx:46-197 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-055] Refactors futuros del home
- Fuente: `docs/bitacora-roadmap.md:11207` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-30
- Nodo(s): h2.cli-inicio
- Qué es: getGreeting()/formatDateES() a dates-ar (usa hora del server) y currentPath como 'página específica' del origen.
- Referencias: src/app/(protected)/dashboard/page.tsx · también en fuente:11190 · también en fuente:11222
- Estado en código: **no empezado** — dashboard/page.tsx:32-37 getHours(); :39-48 toLocaleDateString sin timeZone (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-056] P1.C-fix1 frontera RSC de empty states
- Fuente: `docs/bitacora-roadmap.md:11278` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30
- Nodo(s): h2.cli-inicio
- Qué es: SectionEmptyState client resuelve íconos por key.
- Referencias: src/components/dashboard/home/SectionEmptyState.tsx
- Estado en código: **hecho** — SectionEmptyState.tsx:1 'use client', :16-20 íconos por key (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: no

#### [PLAN-057] P1.C-fix cosméticos del home
- Fuente: `docs/bitacora-roadmap.md:11312` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30
- Nodo(s): h2.cli-inicio
- Qué es: Hover canónico, input sin spinners y empty states muted.
- Estado en código: **hecho** — MoneyEstimate.tsx:84 input sin spinners ([appearance:textfield]); BusinessHero.tsx:32-38 hover canónico con adminHoverCls (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-058] P5.1 motor de recomendaciones por reglas
- Fuente: `docs/bitacora-roadmap.md:11594` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30
- Nodo(s): h2.cli-inicio
- Qué es: 'Ideas para crecer' en el home con 4 reglas y CTA de upsell.
- Referencias: src/lib/recommendations/rules.ts · src/components/dashboard/home/Recommendations.tsx
- Estado en código: **hecho** — src/lib/recommendations/rules.ts (featureKey en :53, :89, :115, :147); Recommendations.tsx:180-205; page.tsx:78-80, :239-249 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-059] Señal 'fuera de horario' en recomendaciones v2
- Fuente: `docs/bitacora-roadmap.md:11649` · tipo: idea · estado declarado: pendiente · fecha: 2026-06-30
- Nodo(s): h2.cli-inicio
- Qué es: Señal cara (EXTRACT(HOUR)) diferida a v2.
- Estado en código: **no empezado** — git grep -n -i -E 'fuera de horario|outOfHours|afterHours|EXTRACT\(HOUR' origin/main -- logic-core-v3/src/lib/recommendations → vacío; control: 'connect-gbp' aparece en rules.ts. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-060] D1 computeTrend zombie eliminado
- Fuente: `docs/bitacora-roadmap.md:12325` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h2.cli-inicio
- Qué es: Se borró el trend por hash de health-score.ts.
- Referencias: src/lib/health-score.ts · cierra pendiente fuente:12058
- Estado en código: **hecho** — git grep -n computeTrend origin/main -- src → 0 (control: calcTrend en week-results.ts:107) (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: no

#### [PLAN-061] P5.1-fix reviewsEngineRule exige GBP operativa
- Fuente: `docs/bitacora-roadmap.md:12549` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h2.cli-inicio
- Qué es: Nueva señal gbpOperational para el borde CONNECTED_NO_LOCATION.
- Referencias: src/lib/recommendations/rules.ts
- Estado en código: **hecho** — rules.ts:70-74 (gbpOperational); get-recommendations-for-org.ts:54. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-062] P4.1 atribución por campaña en el panel
- Fuente: `docs/bitacora-roadmap.md:12778` · tipo: hecho-declarado · estado declarado: hecho (visual parcial) · fecha: 2026-07-04
- Nodo(s): h2.cli-inicio
- Qué es: LeadCampaigns en el home y celda 'Campaña' en el detalle del lead.
- Referencias: src/components/dashboard/home/LeadCampaigns.tsx · docs/sprints/p4-1-render-utm.md
- Estado en código: **hecho** — LeadCampaigns.tsx:18-69; leads/[id]/page.tsx:87-100 celda Campaña (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-063] Campaña UTM en el panel
- Fuente: `docs/sprints/p4-1-render-utm.md:16` · tipo: hecho-declarado · estado declarado: hecho, verificación visual pendiente
- Nodo(s): h2.cli-inicio
- Qué es: campaignLabel y tallyCampaigns, tarjeta LeadCampaigns en el home y celda Campaña en LeadDetail; nulos como 'Sin campaña'.
- Referencias: src/lib/dashboard/lead-origin.ts · src/components/dashboard/home/LeadCampaigns.tsx
- Estado en código: **hecho** — lead-origin.ts:108-120; home-metrics-logic.ts:206-234; LeadCampaigns.tsx:18-69; page.tsx:135; leads/[id]/page.tsx:90-100 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

### h2.cli-mensajes — Mensajes

#### [PLAN-064] Mensajes del cliente
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mensajes_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h2.cli-mensajes
- Qué es: Burbujas izquierda/derecha según autor, altura fija con scroll interno y word-break. Badge de no leídos que desaparece al abrir (markClientMessagesRead). Badge de presencia honesto.
- Referencias: _actions/mark-read.ts · MarkReadOnMount · tambien en Olme/Cliente - Registro de cambios/Mensajes_ registro de cambios.md:32
- Estado en código: **hecho** — messages/page.tsx:27-28; mark-read.ts:11-22; MarkReadOnMount.tsx:13-17; MessageThread.tsx:113-120 (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-065] 'Respondemos en < 4 hs, Lun–Vie 9–18hs'
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mensajes_ registro de cambios.md:30` · tipo: promesa · estado declarado: sin estado
- Nodo(s): h2.cli-mensajes
- Qué es: Pill fija en el chat del cliente que reemplazó al falso 'Equipo en línea'. Es un compromiso de tiempo de respuesta.
- Estado en código: **hecho** — MessageThread.tsx:114-119; contradicho por soporte/page.tsx:90 (9-19) y TicketReplyForm.tsx:32 (<24 h) (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-066] SEC-PII-01: email en un log de notify-message.ts
- Fuente: `docs/bitacora-roadmap.md:8321` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-mensajes
- Qué es: P1 de la auditoría de seguridad pendiente de corregir.
- Referencias: notify-message.ts:62 · docs/auditoria-seguridad-2026-05.md
- Estado en código: **hecho** — notify-message.ts:62 usa obfuscateEmail (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-067] Migrar notify-message y email.ts de Resend a Brevo
- Fuente: `docs/bitacora-roadmap.md:12216` · tipo: pendiente · estado declarado: pendiente (decisión)
- Nodo(s): h2.cli-mensajes
- Qué es: notify-message (from no verificado) y email.ts (agency/tickets/invites, from develop-agency.com) siguen en Resend.
- Referencias: src/lib/email/notify-message.ts · src/lib/email.ts · también en fuente:12239 · también en fuente:12271
- Estado en código: **no empezado** — notify-message.ts:1, :18, :50; email.ts:1, :4, :20-21 siguen con Resend (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: decidir

### h2.cli-plan — Mi plan

#### [PLAN-068] P0.3 scoring según plan y P0.4 coherencia comercial
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:130` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-12
- Nodo(s): h2.cli-plan
- Qué es: El lead scoring se habilita según el plan (planAllows('leadScoring')), también en el CSV. Starter baja de 50 a 49 y se quita mini-crm de los módulos premium.
- Referencias: planAllows('leadScoring') · premium-modules · tambien en Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:131
- Estado en código: **hecho** — planAllows(plan,'leadScoring') en 17 llamadas (layout.tsx:119, page.tsx:121, api/dashboard/chatbot/leads/export/route.ts:95); Starter 49 (sync-plans.ts:70, plan-presentation.ts:149); mini-crm fuera del catalogo (git grep mini-crm origin/main -- src/lib/data/premium-modules.ts vacio) (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-069] Mi plan: reskin, hover y ancho completo
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho (sin mergear)
- Nodo(s): h2.cli-plan
- Qué es: Tokens de GlassCard del admin y adminHoverCls en los tiers. Hover sin scale en el medidor. Skeletons alineados.
- Referencias: lane/plan · UsageMeter.tsx · PlansShowcase.tsx
- Estado en código: **hecho** — bedbda8, c15b740, ba584ac ancestros de origin/main; PlansShowcase.tsx:101-110; UsageMeter.tsx:83, :138; plan/page.tsx:17 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: no

#### [PLAN-070] Mi plan: estado sin bot y CTA de activación
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:22` · tipo: hecho-declarado · estado declarado: hecho (sin mergear)
- Nodo(s): h2.cli-plan
- Qué es: UsageMeter usa hasBotConfigured: card de onboarding y CTA bot-activation vía requestUpsellAction, sin acción nueva. Spinner de pending en UpgradeCtaButton.
- Referencias: UpgradeCtaButton.tsx · requestUpsellAction · featureKey bot-activation
- Estado en código: **hecho** — 40c37a7, 3fbbfe2, 4387cc1 ancestros de origin/main; UsageMeter.tsx:79-127; UpgradeCtaButton.tsx:117-121 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: no

#### [PLAN-071] No adoptar AnimatedProgressBar ni AnimatedCounter
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:56` · tipo: decision · estado declarado: descartado
- Nodo(s): h2.cli-plan
- Qué es: Traen copy fijo de proyectos y rompen el formato es-AR. Se mantienen la barra inline y formatNumberEs.
- Referencias: AnimatedProgressBar · AnimatedCounter
- Estado en código: **hecho** — Mi Plan no los importa (importadores: project/page.tsx:11-12 y AnalyticsMetricCard.tsx:3). (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-072] Panel 'mis servicios' y error.tsx en Mi plan
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:112` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-plan
- Qué es: Panel con CTA a /dashboard/services, diferido por decisión de diseño. /dashboard/plan no tiene error.tsx. Warning isUpgrade sin uso.
- Referencias: src/app/(protected)/dashboard/plan · tambien en Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:114 · tambien en Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:116
- Estado en código: **no empezado** — git ls-tree origin/main -- 'src/app/(protected)/dashboard/plan/' -> solo loading.tsx y page.tsx; PlansShowcase.tsx:192 isUpgrade desestructurado y sin uso; sin link a /dashboard/services en plan/ (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-073] Doble fetch de getOrgUsageSnapshot a propósito
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Plan_ registro de cambios.md:118` · tipo: decision · estado declarado: hecho
- Nodo(s): h2.cli-plan
- Qué es: Permite streaming independiente de cada Suspense. lib/plan está frozen y no se colapsa.
- Referencias: getOrgUsageSnapshot
- Estado en código: **hecho** — plan/page.tsx:37 y :42 llaman getOrgUsageSnapshot en cada Suspense. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-074] Sumar tools premium al plan BUSINESS cuando existan
- Fuente: `docs/bitacora-roadmap.md:2015` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h2.cli-plan
- Qué es: Hoy BUSINESS tiene las mismas 4 tools que PRO; nuevas tools (show_product_card, score_lead) se agregan al array tools de BUSINESS en sync-plans.ts sin cambiar schema.
- Referencias: prisma/seeds/sync-plans.ts · tambien en docs/bitacora-roadmap.md:2133 · tambien en docs/bitacora-roadmap.md:2306
- Estado en código: **no empezado** — prisma/seeds/sync-plans.ts:90 y :106 PRO y BUSINESS con BASE_TOOLS_5; git grep "show_product_card\|score_lead" origin/main -- src prisma → 0 (control: capture_lead aparece en sync-plans.ts) (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-075] Valores lockeados de los planes STARTER/PRO/BUSINESS
- Fuente: `docs/bitacora-roadmap.md:2036` · tipo: decision · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h2.cli-plan
- Qué es: 50/90/150 USD al mes; setup 700/900/1000; 500/3000/5000 conversaciones; 1/3/ilimitados dominios; reportes e insight desde PRO; CRM solo BUSINESS; soporte STANDARD/PRIORITY/PRIORITY_24H.
- Referencias: prisma/seeds/sync-plans.ts
- Estado en código: **contradicho** — prisma/seeds/sync-plans.ts:70 Starter 49 (no 50); resto coincide: :86 Pro 90, :102 Business 150, setup :71/:87/:103, quotas :72/:88/:104, maxDomains 1/3/null, reports/insight desde PRO, CRM solo BUSINESS, soporte STANDARD/PRIORITY/PRIORITY_24H (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-076] PLAN_FALLBACK es espejo manual del plan STARTER
- Fuente: `docs/bitacora-roadmap.md:2065` · tipo: decision · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h2.cli-plan
- Qué es: Si cambia STARTER en sync-plans.ts hay que actualizar la constante en paralelo (no DRY a propósito, para que exista aunque la DB esté caída).
- Referencias: src/lib/plan/fallback.ts · prisma/seeds/sync-plans.ts
- Estado en código: **hecho** — src/lib/plan/fallback.ts:44-60 = STARTER de prisma/seeds/sync-plans.ts:68-82 (49/700/500/gemini-2.5-flash/3 tools/1 dominio) (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-077] Dimensiones reports/insight/crm solo con helper en B4.2
- Fuente: `docs/bitacora-roadmap.md:2214` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h2.cli-plan
- Qué es: planAllows quedó listo pero las features no se construyeron en B4.2; luego B5.8 usa crmEnabled y B6.2 gatea el reporte por plan; en este rango no hay consumidor declarado de insightEnabled.
- Referencias: src/lib/plan/plan-allows.ts · tambien en docs/bitacora-roadmap.md:2215 · tambien en docs/bitacora-roadmap.md:2216 · tambien en docs/bitacora-roadmap.md:4450 · tambien en docs/bitacora-roadmap.md:4989
- Estado en código: **parcial** — 'insight' consumido en resultados/analisis/page.tsx:36 y api/reports/client-monthly/route.ts:31; 'crm' con 6 consumidores; 'reports' sin consumidor via planAllows (git grep "planAllows([^)]*'reports')" vacio; el reporte ejecutivo gatea por plan key) (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-078] B4.6 — Medidor de consumo + presentación de planes
- Fuente: `docs/bitacora-roadmap.md:2792` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h2.cli-plan
- Qué es: getOrgUsageSnapshot, UsageMeter con tono adaptativo sin alarma, PlansShowcase con Pro destacado y footer locked-as-celebration, página /dashboard/plan, medidor en /dashboard e item 'Mi plan' en el sidebar; adenda con fix de TZ en periodLabel.
- Referencias: src/lib/plan/get-org-usage.ts · src/lib/plan/plan-presentation.ts · src/components/dashboard/plan/UsageMeter.tsx · src/components/dashboard/plan/PlansShowcase.tsx · src/app/(protected)/dashboard/plan/page.tsx · src/app/(protected)/dashboard/page.tsx +4
- Estado en código: **hecho** — get-org-usage.ts:49-85; UsageMeter.tsx; PlansShowcase.tsx; plan/page.tsx:12-34; page.tsx:102-104; SidebarNav.tsx:65 'Mi plan'; fix TZ get-org-usage.ts:43-45 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-079] La cortesía/override de precio no se muestra al cliente
- Fuente: `docs/bitacora-roadmap.md:2949` · tipo: decision · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h2.cli-plan
- Qué es: Decisión de no exponer el priceOverride en /dashboard/plan (mostrarlo serían ~10 líneas).
- Referencias: src/components/dashboard/plan/UsageMeter.tsx
- Estado en código: **hecho** — git grep -n priceOverride origin/main -- "src/app/(protected)/dashboard" src/components/dashboard src/lib/plan → 0 (control: admin BillingOverrideCard.tsx:14, :22); PlansShowcase.tsx:135 muestra plan.monthlyPriceUsd de lista (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-080] Banner 'Plan pendiente de asignación' para orgs en fallback
- Fuente: `docs/bitacora-roadmap.md:2952` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h2.cli-plan
- Qué es: Opcional y de bajo impacto; hoy las orgs sin planId ven las 3 cards como 'Subir a X'.
- Referencias: src/app/(protected)/dashboard/plan/page.tsx · tambien en docs/bitacora-roadmap.md:2967
- Estado en código: **no empezado** — git grep -niE 'pendiente de asignaci|plan pendiente' origin/main -- src -> vacio; control: git grep -n isFallback origin/main -- src -> PlansShowcase.tsx:91, UsageMeter.tsx:129 (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-081] MS-3 — CTA de upgrade conectado a requestUpsellAction
- Fuente: `docs/bitacora-roadmap.md:3093` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h2.cli-plan
- Qué es: UpgradeCtaButton registra el lead (contactSubmission, alerta y notificaciones) y navega con window.location.assign a mensajes con texto pre-cargado (plan-upgrade-* / plan-change-*).
- Referencias: src/components/dashboard/plan/UpgradeCtaButton.tsx · src/components/dashboard/plan/PlansShowcase.tsx · src/lib/data/message-context.ts · src/lib/actions/upsell.ts · pendiente originado en docs/bitacora-roadmap.md:2853 · pendiente originado en docs/bitacora-roadmap.md:2951 +2
- Estado en código: **hecho** — UpgradeCtaButton.tsx:84-101; message-context.ts:30-48 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-082] Idempotencia del lead de upsell de plan
- Fuente: `docs/bitacora-roadmap.md:3191` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h2.cli-plan
- Qué es: Clicks repetidos generan filas y notificaciones duplicadas; dedupe por (org, service) en una ventana o ocultar el CTA 24h.
- Referencias: src/lib/actions/upsell.ts
- Estado en código: **hecho** — src/lib/actions/upsell.ts:81-87 + src/lib/upsell/dedup.ts:21, :33-40 (ventana 24 h por email + featureKey) (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: no

#### [PLAN-083] P0.4 coherencia comercial
- Fuente: `docs/bitacora-roadmap.md:11035` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-29
- Nodo(s): h2.cli-plan
- Qué es: Precio Starter USD 49 unificado; mini-crm removido.
- Referencias: fallback.ts · premium-features.ts · next.config.ts
- Estado en código: **parcial** — Starter 49 en lib/plan/fallback.ts:48 y plan-presentation.ts:149; 'mini-crm' sigue en src/lib/premium-features.ts:59 (usado por admin/settings) y en el redirect next.config.ts:157-160. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-084] Clave de período de cuota/billing en UTC
- Fuente: `docs/bitacora-roadmap.md:11100` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-30
- Nodo(s): h2.cli-plan
- Qué es: En las últimas 3h del mes AR la cuota/billing apunta al mes equivocado; migrar a monthRangeAR.
- Referencias: src/lib/plan/get-org-usage.ts · src/modules/chatbot/server/quota/checker.ts · src/modules/chatbot/server/admin/multiTenantQueries.ts · src/app/(protected)/admin/clients/_actions/plan.actions.ts
- Estado en código: **no empezado** — get-org-usage.ts:36-37, quota/checker.ts:15-16, multiTenantQueries.ts:251-252, admin/clients/_actions/plan.actions.ts:50, :56 con getUTCMonth; monthRangeAR existe en dates-ar.ts:180 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-085] Frozen del lane y decisiones locked de Mi plan
- Fuente: `raiz:lane-plan-log.md:15` · tipo: decision · estado declarado: decidido · fecha: 2026-06-25
- Nodo(s): h2.cli-plan
- Qué es: lib/plan, upsell.ts y components/ui solo lectura; superficie frosted, estado vacío sin bot, downgrade sin confirmación, meter sin scale.
- Referencias: tambien en :18-:20
- Estado en código: **hecho** — downgrade = Link sin confirmación PlansShowcase.tsx:201-210; medidor sin scale UsageMeter.tsx:83, :138; vacío sin bot :79-127; superficie frosted :83 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-086] /dashboard/plan sin error.tsx
- Fuente: `raiz:lane-plan-log.md:43` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-25
- Nodo(s): h2.cli-plan
- Qué es: Queda para un lane futuro.
- Referencias: tambien en :100
- Estado en código: **parcial** — git ls-files "src/app/(protected)/dashboard/plan" → loading.tsx, page.tsx; lo cubre dashboard/error.tsx:5-20 (SectionErrorBoundary con captureException :64) (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: no

#### [PLAN-087] Rediseño de Mi plan (5 sprints)
- Fuente: `raiz:lane-plan-log.md:72` · tipo: hecho-declarado · estado declarado: cerrado, verificación visual pendiente · fecha: 2026-06-25
- Nodo(s): h2.cli-plan
- Qué es: Reskin y estado vacío de UsageMeter (también en /dashboard), tier cards, spinner, fullwidth y CTA de activación sin bot; sin merge.
- Referencias: bedbda8 · 40c37a7 · c15b740 · 4387cc1 · ba584ac · 3fbbfe2 +1
- Estado en código: **hecho** — bedbda8, 40c37a7, c15b740, 4387cc1, ba584ac, 3fbbfe2 ancestros de origin/main (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: no

#### [PLAN-088] Sistema modular por planes
- Fuente: `STATUS.md:200` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): h2.cli-plan
- Qué es: Sin modelo Plan (B-Plan-1); definir con el socio y cuándo activar toggles por suscripción.
- Referencias: tambien en :232, :235 · docs/sprints/alpha-RESUMEN-FINAL.md:76
- Estado en código: **hecho** — prisma/schema.prisma:606 model Plan, :638-639 Subscription.planId; get-plan-for-org.ts:68; plan-allows.ts:17; gates en page.tsx:121 y analisis/page.tsx:36 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: no

### h2.cli-proyecto — Mi proyecto

#### [PLAN-089] Mi proyecto: reskin y pulida
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi proyecto_ registro de cambio.md:9` · tipo: hecho-declarado · estado declarado: hecho (sin mergear) · fecha: 2026-06-27
- Nodo(s): h2.cli-proyecto
- Qué es: Header, TaskCards, hero de progreso y hover split-wrapper. Ancho completo, fix del tab destino del banner de aprobación y empties sin tinte teal.
- Referencias: e644e55 · 92f1218 · e86ae3d · 8c71ec1 · fe89c1b · 32caad8 +5
- Estado en código: **hecho** — e644e55, 92f1218, e86ae3d, 8c71ec1, fe89c1b, 32caad8 en origin/main (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-090] Tiles de datos y selector de proyectos
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi proyecto_ registro de cambio.md:21` · tipo: hecho-declarado · estado declarado: hecho (sin mergear) · fecha: 2026-06-27
- Nodo(s): h2.cli-proyecto
- Qué es: Tipo, monto, inicio y entrega derivados sin schema. Selector por ?p=<id> con fallback que no filtra datos de otros tenants.
- Referencias: 7876c02 · be6aa4c
- Estado en código: **hecho** — project/page.tsx:186-195 (?p elige dentro del set scopeado, fallback sin fuga); 7876c02 y be6aa4c ancestros. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-091] Empties con tinte teal restantes
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi proyecto_ registro de cambio.md:54` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-27
- Nodo(s): h2.cli-proyecto
- Qué es: Quedan el 'Sin proyectos' de page.tsx y otros 2 EmptyState de task-list.tsx. bg-zinc-950/70 sin verificar visualmente.
- Referencias: dashboard/project/page.tsx · admin/projects/_components/task-list.tsx · tambien en Olme/Cliente - Registro de cambios/Mi proyecto_ registro de cambio.md:55 · ver Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:49
- Estado en código: **hecho** — project/page.tsx:172-181 y task-list.tsx:254, :529 usan EmptyStateMuted; ProjectEmptyState.tsx:11-22 sin el glow teal (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-092] Modelar ProjectMilestone + admin UI
- Fuente: `docs/bitacora-roadmap.md:6195` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h2.cli-proyecto
- Qué es: Para volver a mostrar milestones con datos reales en /dashboard/project; el componente CurrentMilestone quedó sin uso.
- Referencias: docs/roadmap-pendientes.md · src/components/dashboard/CurrentMilestone · tambien en docs/bitacora-roadmap.md:6188
- Estado en código: **no empezado** — git grep -n ProjectMilestone origin/main -- prisma/schema.prisma vacio; control: git grep -n CurrentMilestone origin/main -- src -> solo CurrentMilestone.tsx:6, :13 (sin importadores) (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-093] Milestones reales de proyecto
- Fuente: `docs/roadmap-pendientes.md:85` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h2.cli-proyecto
- Qué es: Modelo ProjectMilestone + CRUD admin + reactivar CurrentMilestone en /dashboard/project.
- Referencias: src/components/dashboard/CurrentMilestone.tsx
- Estado en código: **no empezado** — igual que PLAN-092: sin modelo; CurrentMilestone.tsx sin importadores (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: decidir

### h2.cli-referidos — Recomendá y ganá

#### [PLAN-094] P5.5 sistema de referidos
- Fuente: `docs/bitacora-roadmap.md:11777` · tipo: hecho-declarado · estado declarado: hecho (verificación visual pendiente) · fecha: 2026-07-01
- Nodo(s): h2.cli-referidos
- Qué es: Código/link /contact?ref=, atribución anti-abuso y admin de conversión.
- Referencias: src/lib/referrals/attribution.ts · src/app/(protected)/admin/referrals
- Estado en código: **hecho** — code.ts:29-32 (/contact?ref=); attribution.ts:41-52; referrals.service.ts:89-175; admin/referrals/page.tsx y _actions/referrals.admin.actions.ts. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-095] Beneficio de referidos: 1 mes bonificado
- Fuente: `docs/bitacora-roadmap.md:11823` · tipo: decision · estado declarado: hecho · fecha: 2026-07-01
- Nodo(s): h2.cli-referidos
- Qué es: Conversión = plan pago confirmado por develOP; el mes no se auto-aplica ni se notifica al cliente.
- Referencias: también en fuente:11830
- Estado en código: **hecho** — admin/referrals/_actions/referrals.admin.actions.ts:13-24 (PENDING→CONVERTED) y :36-47 (→REWARDED) manuales; sin aplicación automática ni aviso al cliente. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

### h2.cli-reportes-email — Reportes por email

#### [PLAN-096] MH.1: orderBy en reportes y latencia
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:23` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h2.cli-reportes-email
- Qué es: Agregar orderBy en buildWeeklyReport (3 sets) y en getLatencyHistory, para que las métricas salgan sobre filas reales.
- Referencias: buildWeeklyReport · getLatencyHistory · A2.3 · A2.2
- Estado en código: **no empezado** — buildWeeklyReport.ts:74-83, 85-92 y 94-101 con take sin orderBy; getLatencyHistory.ts:76-82 take 2000 sin orderBy. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-097] client-monthly-report-pdf no es invariante puro
- Fuente: `docs/bitacora-beta-3.md:5331` · tipo: pendiente · estado declarado: pendiente (C1b) · fecha: 2026-08-25
- Nodo(s): h2.cli-reportes-email
- Qué es: Consulta la DB; quedó excluido del agregado y reclasificarlo al job con base es C1b.
- Referencias: scripts/run-invariants.mjs
- Estado en código: **no empezado** — scripts/run-invariants.mjs:89-94 lo sigue excluyendo; package.json:105. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-098] B6.1 — Histórico semanal del executive brief
- Fuente: `docs/bitacora-roadmap.md:4866` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h2.cli-reportes-email
- Qué es: Tabla ExecutiveBriefSnapshot (una fila por org y semana ISO en TZ-AR) upserteada desde los 3 paths que escriben el cache; helper getBriefHistory.
- Referencias: prisma/schema.prisma · prisma/migrations/20260524225006_b61_executive_brief_snapshots/migration.sql · src/lib/ai/executive-brief.ts · src/lib/tz-ar.ts · src/lib/ai/brief-history.ts
- Estado en código: **hecho** — schema.prisma:459 ExecutiveBriefSnapshot; executive-brief.ts:334-360 persistBriefSnapshot; brief-history.ts:24-46. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-099] B6.2 — Reporte ejecutivo semanal por email
- Fuente: `docs/bitacora-roadmap.md:4978` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h2.cli-reportes-email
- Qué es: WeeklyReportLog + Organization.executiveReportOptOut; cron lunes 12:00 UTC registrado en vercel.json; gating PRO/BUSINESS, idempotencia por (org, periodKey), template nuevo y unsubscribe 1-click con HMAC; ruta de preview dev-only.
- Referencias: prisma/migrations/20260524230542_b62_executive_weekly_report_log/migration.sql · src/lib/email/unsubscribe-token.ts · src/lib/email/templates/executive-weekly.ts · src/lib/reports/executive-weekly/build.ts · src/lib/reports/executive-weekly/send.ts · src/app/api/cron/send-executive-reports/route.ts +5
- Estado en código: **parcial** — Migración 20260524230542_b62_executive_weekly_report_log, send.ts/build.ts, unsubscribe (api/email/unsubscribe-executive/route.ts:103,110) y preview dev-only (api/dev/email-preview/executive-weekly/route.ts:107-108) existen; el cron solo está en vercel.json:11-14 y prod es Netlify (netlify.toml:25-32 no lo agenda; docs/operations/00-entornos.md:12). (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-100] Reglas lockeadas del reporte ejecutivo semanal
- Fuente: `docs/bitacora-roadmap.md:4986` · tipo: decision · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h2.cli-reportes-email
- Qué es: Sin LLM al enviar (reusa cachedExecutiveBrief), solo PRO/BUSINESS, idempotente por (org, periodKey), falla parcial no aborta el cron, periodKey en TZ-AR, opt-out 1-click RFC 8058 y cero PII en logs.
- Referencias: src/lib/reports/executive-weekly/send.ts
- Estado en código: **parcial** — PRO/BUSINESS build.ts:91; idempotencia send.ts:105-112; falla parcial no aborta send.ts:103,205; periodKey TZ-AR send.ts:76; RFC 8058 send.ts:171-176. 'Sin LLM al enviar' no se cumple: build.ts:115-119 llama getExecutiveBrief si el cache no es vigente. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-101] Sin tests unitarios del HMAC de unsubscribe ni del builder del reporte
- Fuente: `docs/bitacora-roadmap.md:5154` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h2.cli-reportes-email
- Qué es: Hoy solo cubren el build y visual-qa; sumar un smoke en un sprint posterior.
- Referencias: src/lib/email/unsubscribe-token.ts · src/lib/reports/executive-weekly/build.ts
- Estado en código: **no empezado** — git grep -n -E 'signUnsubscribeToken|verifyUnsubscribeToken' origin/main -- logic-core-v3/tests '**/*.invariant.ts' '**/*.test.ts' → vacío; control: signEmailContactOptOutToken aparece en src/lib/security/idor-tokens.invariant.ts y tests/e2e/20-idor-optout.spec.ts. build.ts no tiene test propio (tests/e2e/41-admin-executive-report-send-now.spec.ts:5-7 lo evita). (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-102] B6.3 — Top 3 leads calientes en el reporte (solo Business)
- Fuente: `docs/bitacora-roadmap.md:5158` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h2.cli-reportes-email
- Qué es: getTopHotLeadsForWeek rankea por score efectivo con decay, excluye DQ y filtra por org; sección en el email solo para BUSINESS.
- Referencias: src/lib/reports/executive-weekly/top-hot-leads.ts · src/lib/email/templates/executive-weekly.ts · src/lib/reports/executive-weekly/build.ts · src/app/api/dev/email-preview/executive-weekly/route.ts
- Estado en código: **hecho** — top-hot-leads.ts:56-160 (decay :104-111, DQ :75, org :71); build.ts:154-163 solo BUSINESS. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-103] Link directo al detalle del lead desde el email
- Fuente: `docs/bitacora-roadmap.md:5259` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-24
- Nodo(s): h2.cli-reportes-email
- Qué es: Requiere firmar un token porque 'los IDs de lead no van en URLs por política'.
- Estado en código: **no empezado** — git grep signLeadToken|leadToken|lead-link-token → vacio; los emails enlazan la lista (sendTestNotification.ts:58). (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-104] P2.B.2 reporte ejecutivo a medida
- Fuente: `docs/bitacora-roadmap.md:11927` · tipo: hecho-declarado · estado declarado: hecho (migración editada, no aplicada)
- Nodo(s): h2.cli-reportes-email
- Qué es: Frecuencia y cantidad de leads configurables por el dueño en /dashboard/cuenta/perfil.
- Referencias: src/components/dashboard/ExecutiveReportPrefsForm.tsx · src/lib/reports/executive-weekly/send.ts
- Estado en código: **hecho** — migración 20260702223350_add_executive_report_config; executive-report-prefs.actions.ts:20-46 con Zod; send.ts:43-59 (BIWEEKLY); build.ts:99,161; perfil/page.tsx:193-203,297-306. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-105] Gate de plan del reporte duplicado a mano
- Fuente: `docs/bitacora-roadmap.md:11936` · tipo: decision · estado declarado: hecho
- Nodo(s): h2.cli-reportes-email
- Qué es: report-eligible-plan.ts calca el chequeo literal PRO/BUSINESS de build.ts (no planAllows); sincronizar a mano.
- Referencias: src/lib/reports/executive-weekly/report-eligible-plan.ts
- Estado en código: **hecho** — report-eligible-plan.ts:9-11 calca build.ts:91; el invariante report-eligible-plan.invariant.ts:14 no importa build.ts. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-106] executiveReportOptOut convive con la frecuencia
- Fuente: `docs/bitacora-roadmap.md:11940` · tipo: decision · estado declarado: hecho
- Nodo(s): h2.cli-reportes-email
- Qué es: Reactivar una frecuencia limpia el opt-out; la UI muestra el estado efectivo.
- Estado en código: **hecho** — executive-report-prefs.actions.ts:41 limpia el opt-out al reactivar; perfil/page.tsx:196, :305 muestra la frecuencia efectiva. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: no

#### [PLAN-107] Cadencia quincenal y ubicación del botón de reporte
- Fuente: `docs/bitacora-roadmap.md:11994` · tipo: pendiente · estado declarado: pendiente (decisión)
- Nodo(s): h2.cli-reportes-email
- Qué es: Decidir si el botón manual respeta la cadencia quincenal y si se copia a /admin/settings/reports.
- Referencias: también en fuente:11995
- Estado en código: **parcial** — send.ts:40-41 excluye a propósito al botón manual de la cadencia; el botón vive en admin/clients/[clientId]/_components/ExecutiveReportCard.tsx:20 y no en admin/settings/reports (git grep send-executive-report). (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-108] FIX-BRIEF: el brief IA ya no contradice las cards
- Fuente: `docs/bitacora-roadmap.md:11999` · tipo: hecho-declarado · estado declarado: hecho (verificación viva pendiente)
- Nodo(s): h2.cli-reportes-email
- Qué es: Gemini recibe solo los 4 números de las cards con dirección; corte de cache BRIEF_LOGIC_CUTOFF.
- Referencias: src/lib/ai/executive-brief-input.ts · src/lib/ai/executive-brief.ts
- Estado en código: **hecho** — executive-brief-input.ts:95-115 (solo numeros de las cards); BRIEF_LOGIC_CUTOFF en executive-brief-input.invariant.ts:15-126. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-109] Ajustar BRIEF_LOGIC_CUTOFF a la fecha de deploy
- Fuente: `docs/bitacora-roadmap.md:12041` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-reportes-email
- Qué es: Si el deploy fue posterior al 2026-07-02, subir la fecha del corte.
- Estado en código: **no empezado** — executive-brief-input.ts:204 sigue en 2026-07-02 (commit 852fcc39 del 2026-07-02); build.ts:113 lo usa como único control de frescura del brief. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: decidir

### h2.cli-resenas — Motor de reseñas (módulo)

#### [PLAN-110] SEC vía 2: motor-reseñas deriva la org de la sesión
- Fuente: `docs/bitacora-roadmap.md:11008` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h2.cli-resenas
- Qué es: generateDraft/replyAction validan organizationId contra la sesión (resolveScopedOrgId).
- Referencias: src/components/dashboard/modules/motor-resenas/_actions.ts · src/lib/security/org-scope.ts
- Estado en código: **hecho** — src/components/dashboard/modules/motor-resenas/_actions.ts:20, :55 resolveScopedOrgId; src/lib/security/org-scope.ts:20-27 (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-111] P3-A.1 backend de conexión GBP
- Fuente: `docs/bitacora-roadmap.md:12500` · tipo: hecho-declarado · estado declarado: hecho (verificación viva pendiente)
- Nodo(s): h2.cli-resenas
- Qué es: Descubre y persiste account/location, estados honestos y rating one-shot.
- Referencias: src/lib/actions/gbp-connection.ts · docs/sprints/p3-a-1-gbp-connection.md
- Estado en código: **hecho** — src/lib/actions/gbp-connection.ts:17 listAvailableLocations, :36 setActiveLocation. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-112] Verificación viva de la conexión GBP
- Fuente: `docs/bitacora-roadmap.md:12542` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-resenas
- Qué es: No hay cuenta GBP de prueba; OAuth vivo y locations reales sin ejercitar.
- Estado en código: **no empezado** — git grep -li 'gbp|google-business' origin/main -- tests -> solo un snapshot png; sin test ni script de verificacion (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-113] P3-A.2 venta del módulo de reseñas + estados honestos
- Fuente: `docs/bitacora-roadmap.md:12609` · tipo: hecho-declarado · estado declarado: hecho (verificación visual pendiente)
- Nodo(s): h2.cli-resenas
- Qué es: Vistas locked/connecting/operational según módulo × conexión.
- Referencias: src/lib/modules/motor-resenas-view.ts · docs/sprints/p3-a-2-venta.md
- Estado en código: **hecho** — src/lib/modules/motor-resenas-view.ts:20 (locked/connecting/operational), :38 resolveMotorResenasView. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-114] Selector de sucursal GBP y CTA en preview admin
- Fuente: `docs/bitacora-roadmap.md:12661` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-resenas
- Qué es: Selector para CONNECTED_NO_LOCATION('multiple') diferido; el CTA en preview de admin falla con 'Sesión inválida.'.
- Estado en código: **no empezado** — upsell.ts:16-19 session.user.organizationId -> 'Sesion invalida.' en soporte; selector sin UI (ver PLAN-118) (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-115] Cerrar el precio del Motor de Reseñas
- Fuente: `docs/bitacora-roadmap.md:12669` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-resenas
- Qué es: LockedView muestra [FALTA:precio] y la vitrina 60 USD con pricing no cerrado.
- Referencias: también en fuente:12629 · también en fuente:12661
- Estado en código: **no empezado** — LockedView.tsx:151 [FALTA:precio] vs premium-modules.ts:31 priceMonthlyUsd: 60 (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-116] Backend de conexión GBP
- Fuente: `docs/sprints/p3-a-1-gbp-connection.md:8` · tipo: hecho-declarado · estado declarado: hecho (sin verificación viva)
- Nodo(s): h2.cli-resenas
- Qué es: Descubre account+location, persiste por cardinalidad con estados honestos, listAvailableLocations/setActiveLocation y rating one-shot desde el callback (fetch crudo, sin dependencia).
- Referencias: src/lib/integrations/gbp-connection-logic.ts · src/lib/actions/gbp-connection.ts · tambien en :29
- Estado en código: **hecho** — gbp-connection-logic.ts:57-77 tipos y estados; src/lib/actions/gbp-connection.ts:17, :36; api/auth/google-business/callback/route.ts:61-68 descubrimiento tolerante (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-117] Verificación viva de GBP
- Fuente: `docs/sprints/p3-a-1-gbp-connection.md:138` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-resenas
- Qué es: Sin cuenta GBP de prueba; /reputacion no se puede sembrar (OAuth vivo, sin mock).
- Referencias: tambien en :149 · raiz:lane-resultados-redesign-log.md:225, :234, :312
- Estado en código: **no empezado** — El codigo a verificar existe (gbp-connection.ts:17, :36; motor-resenas-view.ts:38); no hay artefactos de verificacion ni cuenta de prueba en el repo. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-118] UI de conexión GBP y selector de sucursal
- Fuente: `docs/sprints/p3-a-1-gbp-connection.md:150` · tipo: pendiente · estado declarado: diferido
- Nodo(s): h2.cli-resenas
- Qué es: Botón self-service, wizard y selector para CONNECTED_NO_LOCATION('multiple'); P3-A.2 lo dejó diferido.
- Referencias: tambien en :19 · docs/sprints/p3-a-2-venta.md:5, :134
- Estado en código: **no empezado** — git grep -n "actions/gbp-connection'" origin/main -- src vacio; control: src/lib/actions/gbp-connection.ts:17 listAvailableLocations y :36 setActiveLocation existen (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-119] Venta y estados del Motor de Reseñas
- Fuente: `docs/sprints/p3-a-2-venta.md:7` · tipo: hecho-declarado · estado declarado: hecho, verificación visual pendiente
- Nodo(s): h2.cli-resenas
- Qué es: LockedView (con variante pausada y 'ya lo pediste'), ConnectingState, resolveMotorResenasView y key gbp en message-context.
- Referencias: src/lib/modules/motor-resenas-view.ts · LockedView.tsx · ConnectingState.tsx
- Estado en código: **hecho** — LockedView.tsx:84-108, :156-177; ConnectingState.tsx:13-46; motor-resenas-view.ts:38-42; message-context.ts:23 (gbp) (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-120] [FALTA:precio] en LockedView
- Fuente: `docs/sprints/p3-a-2-venta.md:84` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-resenas
- Qué es: Cerrar el precio antes de mostrarle la pantalla a un cliente real.
- Referencias: tambien en :43, :71, :153
- Estado en código: **no empezado** — src/app/(protected)/dashboard/modules/motor-resenas/_components/LockedView.tsx:151 'Precio: [FALTA:precio] /mes' visible al cliente (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

### h2.cli-resultados — Resultados

#### [PLAN-121] R1: reporte de ROI (input y render del panel)
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:18` · tipo: bloque · estado declarado: bloqueado · fecha: 2026-07-06
- Nodo(s): h2.cli-resultados
- Qué es: El runtime calcula calculatePotentialValue. El panel captura tasa de cierre y ticket promedio, y renderiza. Exige que MH esté cerrado.
- Referencias: calculatePotentialValue · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:39
- Estado en código: **parcial** — Ticket promedio capturado (dashboard/_actions/business-profile.actions.ts, MoneyEstimate.tsx); no hay tasa de cierre ni cálculo: git grep -n calculatePotentialValue origin/main -- logic-core-v3/src → vacío; control: averageTicketUsd aparece en 4 archivos. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-122] P0.2 Análisis mensual (Franco)
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:129` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-12
- Nodo(s): h2.cli-resultados
- Qué es: Pestaña en /dashboard/resultados/analisis, solo desde el plan Pro, filtrada por organización, sobre ChatbotInsight y agregados. Su contrato quedó congelado para la lane resultados.
- Referencias: getMonthlyAnalysisForOrg · monthly-analysis.ts · planAllows · tambien en Olme/Chatbot_ registro de cambios.md:50 · tambien en Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:122
- Estado en código: **hecho** — analisis/page.tsx:31-57 (resolveOrgId, planAllows 'insight' :35-36); getMonthlyAnalysisForOrg.ts:48-106 con forOrg (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-123] Resultados: Sprints 1, A, 2 y 3
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:19` · tipo: hecho-declarado · estado declarado: hecho (sin mergear)
- Nodo(s): h2.cli-resultados
- Qué es: Header único en los 4 tabs. Seed de QA para /analisis (gitignored). Infra en _shared (HoverCard, ResultEmptyState, chartTheme). Reskin de reputación y análisis.
- Referencias: 583a3ee · e6578b6 · 90a202e · d1a2380 · 2b51858 · 37609b5 +3
- Estado en código: **hecho** — 583a3ee, e6578b6, 90a202e, d1a2380, 2b51858 y 37609b5 ancestros de origin/main; PageHeader propio en los 4 tabs (analisis:40, reputacion:27, seo:117, trafico:61) y layout.tsx:3-10 solo con tabs (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-124] Resultados Sprint 4: Tráfico
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:55` · tipo: hecho-declarado · estado declarado: hecho (sin mergear)
- Nodo(s): h2.cli-resultados
- Qué es: Saca el dato inventado 'Google Ads', tipa el any del tooltip y hace determinístico el skeleton (sin Math.random). Reskin de tráfico y de los componentes compartidos.
- Referencias: 69ea796 · ee24347 · 15b1d21 · df4fbe8 · SessionsChart
- Estado en código: **hecho** — 69ea796, ee24347, 15b1d21 y df4fbe8 ancestros de origin/main; sin 'Google Ads' en Resultados; AnalyticsSkeleton.tsx:33 determinístico; SessionsChart sin any (git grep ': any\|as any' → 0) (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-125] Resultados Sprint 5: SEO
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:69` · tipo: hecho-declarado · estado declarado: hecho (sin mergear)
- Nodo(s): h2.cli-resultados
- Qué es: Saca un probe muerto. result.error ya no se muestra al cliente. Reskin de SEO con upsell.ts intacto.
- Referencias: df4854e · 0e1d35f · 5f7989e · SeoContent
- Estado en código: **hecho** — Commits df4854e, 0e1d35f y 5f7989e son ancestros de origin/main (git merge-base --is-ancestor); seo/page.tsx:181-198 no muestra result.error. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-126] D2: quitar datos falsos y marcar deltas fijos
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:106` · tipo: decision · estado declarado: hecho
- Nodo(s): h2.cli-resultados
- Qué es: Los datos inventados se eliminan. Los deltas hardcodeados se conservan con FIXME(data-truth) hasta un sprint de datos.
- Referencias: FIXME(data-truth)
- Estado en código: **parcial** — 'Google Ads' ya no aparece en Resultados (git grep → solo copy de home/LeadCampaigns.tsx:28); FIXME(data-truth) solo en seo/page.tsx:234-235; los deltas de trafico/page.tsx:204, :215, :227, :238 no tienen FIXME (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-127] Verificación visual de Resultados antes del merge
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:174` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-resultados
- Qué es: Obligatoria: 4 tabs, con ?demo=true y el seed de Matsu.
- Estado en código: **abandonado** — El merge ya ocurrió: 583a3ee, e6578b6, 90a202e, d1a2380, 2b51858, 37609b5, 69ea796, ee24347, 15b1d21 y df4fbe8 son ancestros de origin/main (git merge-base --is-ancestor). No hay registro de verificación visual en docs (lane-resultados-redesign-log.md:298 es pre-merge) (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-128] Sprint de datos de Resultados
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:175` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-resultados
- Qué es: Deltas reales, performance de GBP (hoy llega en 0), CTA 'ACTIVAR AHORA' sin handler e ID de propiedad GA4 de demo fijo.
- Referencias: getAnalyticsData · GBPMetricsCard · tambien en Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:130 · tambien en Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:133
- Estado en código: **no empezado** — Siguen los FIXME(data-truth): trafico/page.tsx:113-117 (CTA sin handler), seo/page.tsx:234-245 (trend 12.4 fijo), GBPMetricsCard.tsx:39 (performance en 0), trafico/page.tsx:74 (propertyId de demo). (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-129] Error de tsc preexistente en src/lib/searchconsole.ts
- Fuente: `docs/bitacora-rediseno.md:1553` · tipo: pendiente · estado declarado: intermitente · fecha: 2026-07-31
- Nodo(s): h2.cli-resultados
- Qué es: Conflicto de tipos googleapis/google-gax; aparece en B2-S1, B2-S2 y B2-S3 y no aparece en B2-S4.
- Referencias: src/lib/searchconsole.ts · también en docs/bitacora-rediseno.md:1825 · también en docs/bitacora-rediseno.md:2048 · también en docs/bitacora-rediseno.md:2529
- Estado en código: **hecho** — Baseline del padre: tsc 0 errores. searchconsole.ts:2 importa @googleapis/webmasters (package.json:131, package-lock.json:859, instalado) y castea el requestBody a webmasters_v3.Schema$SearchAnalyticsQueryRequest (:134, :144) (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-130] upsertBusinessMetrics sin callers ni UI
- Fuente: `docs/bitacora-roadmap.md:7154` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-05-25
- Nodo(s): h2.cli-resultados
- Qué es: La función existe pero ninguna UI la usa.
- Referencias: src/actions/metrics-actions.ts
- Estado en código: **no empezado** — src/actions/metrics-actions.ts:9 definida; git grep -n "metrics-actions" origin/main -- logic-core-v3/src → 0 importadores (control: git grep -n "upsertBusinessMetrics" → la definición). Es el único escritor de BusinessMetric (:31, :40): computeConversionScore (health-score.ts:282-298) queda siempre null (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-131] /dashboard/resultados/seo con mock data visible
- Fuente: `docs/bitacora-roadmap.md:8843` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h2.cli-resultados
- Qué es: Flag P1-7 del audit: la página SEO muestra datos mock.
- Estado en código: **parcial** — Con datos mock se muestra PreviewBanner (seo/page.tsx:226; searchconsole.ts:102-104), pero los deltas de las cards son fijos (seo/page.tsx:234-245). (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-132] P2.C PDF del informe mensual
- Fuente: `docs/bitacora-roadmap.md:12062` · tipo: hecho-declarado · estado declarado: hecho (verificación humana pendiente)
- Nodo(s): h2.cli-resultados
- Qué es: Descarga en /dashboard/resultados/analisis vía @react-pdf/renderer server-side.
- Referencias: src/app/api/reports/client-monthly/route.ts · src/lib/reports/client-monthly/ClientMonthlyReportPdf.tsx
- Estado en código: **hecho** — DownloadMonthlyReportButton.tsx:21 → client-monthly/route.ts:24-56 (resolveOrgId + planAllows 'insight') → get-client-monthly-report-data.ts:20-76 → ClientMonthlyReportPdf; tests/e2e/43-client-monthly-report-download.spec.ts (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-133] Borrar motores PDF huérfanos
- Fuente: `docs/bitacora-roadmap.md:12109` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-resultados
- Qué es: ExecutiveReportTemplate/DownloadReportButton (mock) y MonthlyReport + /api/reports/monthly sin uso.
- Referencias: src/components/dashboard/ExecutiveReportTemplate.tsx · src/app/api/reports/monthly/route.ts
- Estado en código: **no empezado** — Siguen en origin/main: src/app/api/reports/monthly/route.ts:21 (git grep -n "leads/recent\|reports/monthly" origin/main -- logic-core-v3 ':!logic-core-v3/docs' → solo el comentario de client-monthly/route.ts:6 y tests/e2e/43:9), src/lib/reports/MonthlyReport.tsx (solo lo importa route.ts:8), ExecutiveReportTemplate.tsx y DownloadReportButton.tsx:129 (git grep -n "dashboard/DownloadReportButton" → 0 importadores) (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-134] P2.C-fix-signo guion ASCII en deltas
- Fuente: `docs/bitacora-roadmap.md:12113` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h2.cli-resultados
- Qué es: MINUS SIGN U+2212 reemplazado en el PDF y en deltaPhrase del home.
- Referencias: src/lib/reports/client-monthly/monthly-report-data.ts · src/lib/dashboard/home-metrics-logic.ts
- Estado en código: **hecho** — home-metrics-logic.ts:49 y monthly-report-data.ts:61 usan '-'; git grep U+2212 en ambos → 0 (control: src/components/ia/RubrosIA.tsx lo contiene) (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: no

#### [PLAN-135] Componentes muertos de Resultados
- Fuente: `raiz:lane-resultados-redesign-log.md:19` · tipo: decision · estado declarado: decidido · fecha: 2026-06-25
- Nodo(s): h2.cli-resultados
- Qué es: DownloadReportButton, AnalyticsPeriodSelector, LeakMeter, ExecutiveReportTemplate: no revivir ni cablear.
- Referencias: tambien en :122
- Estado en código: **hecho** — git grep -l -w <nombre> origin/main -- logic-core-v3/src: DownloadReportButton, AnalyticsPeriodSelector y LeakMeter solo aparecen en su propio archivo; ExecutiveReportTemplate solo en sí mismo y en DownloadReportButton.tsx (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-136] Decisiones D1-D6 de Resultados
- Fuente: `raiz:lane-resultados-redesign-log.md:127` · tipo: decision · estado declarado: decidido · fecha: 2026-06-25
- Nodo(s): h2.cli-resultados
- Qué es: ResultEmptyState canónico, quitar fila 'Google Ads', FIXME en deltas, chartCardHoverCls local, no exponer result.error, commits atómicos.
- Referencias: tambien en :129-:134
- Estado en código: **parcial** — D1 ResultEmptyState en los 4 tabs (analisis:87, reputacion:41, seo:131, trafico:108); D3 chartCardHoverCls local (_shared/chartHover); D4 cumplido en SEO (seo/page.tsx:181-184) pero trafico/page.tsx:158 sigue renderizando {result.error}; D2 parcial (PLAN-126) (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-137] Deuda data-truth en Resultados
- Fuente: `raiz:lane-resultados-redesign-log.md:186` · tipo: pendiente · estado declarado: pendiente (FIXME data-truth) · fecha: 2026-06-25
- Nodo(s): h2.cli-resultados
- Qué es: Deltas de tendencia hardcodeados (/trafico, /seo), performance GBP en 0, CTA muerto 'ACTIVAR AHORA', demo property id hardcodeado.
- Referencias: tambien en :22, :316
- Estado en código: **no empezado** — Mismos FIXME: trafico/page.tsx:113-117, seo/page.tsx:234-245, GBPMetricsCard.tsx:39, trafico/page.tsx:74. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-138] Reskin de Resultados (sprints 1-5)
- Fuente: `raiz:lane-resultados-redesign-log.md:205` · tipo: hecho-declarado · estado declarado: hecho, sin merge · fecha: 2026-06-25
- Nodo(s): h2.cli-resultados
- Qué es: Header único por tab; /reputacion, /analisis, /trafico y /seo al canon admin; fixes Google Ads, tooltip tipado, skeleton determinístico y fuga de error.
- Referencias: 90a202e · 37609b5 · 3ee97f0 · df4fbe8 · 0e1d35f · 5f7989e +1
- Estado en código: **hecho** — Commits 90a202e, 37609b5, 3ee97f0, df4fbe8, 0e1d35f y 5f7989e están en origin/main (git merge-base --is-ancestor). (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-139] Seed QA de /analisis
- Fuente: `raiz:lane-resultados-redesign-log.md:217` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-25
- Nodo(s): h2.cli-resultados
- Qué es: scripts/dev/_seed-resultados-qa.ts (gitignored) corrido en Neon dev; resolvió Matsu BUSINESS.
- Referencias: d1a2380
- Estado en código: **hecho** — .gitignore:78 'scripts/dev/_seed-resultados-qa.ts'; d1a2380 ancestro de main; el archivo no existe en el disco (gitignored) y la siembra en Neon no es verificable por lectura (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-140] Verificación y merge de lane/resultados
- Fuente: `raiz:lane-resultados-redesign-log.md:309` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-25
- Nodo(s): h2.cli-resultados
- Qué es: Visual desde el worktree, /analisis con seed, coreografía por grabación; el merge lo hace el humano.
- Estado en código: **parcial** — Merge hecho (commits de la lane ancestros de origin/main; no quedan ramas lane/* en git for-each-ref); la verificación visual no deja rastro (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-141] Mocks sin aviso en Resultados
- Fuente: `STATUS.md:209` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): h2.cli-resultados
- Qué es: SEO muestra mock sin badge 'datos demo'; analytics/searchconsole/n8n devuelven mock sin avisar en UI.
- Referencias: tambien en :210
- Estado en código: **parcial** — PreviewBanner con isMockData en seo/page.tsx:226 y trafico/page.tsx:188 (y en ?demo: seo :124-125, trafico :68). Siguen las tendencias literales (trafico :204-238, seo :244-269) y la caída silenciosa a mock (analytics.ts:196-198, searchconsole.ts:211-213) (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

### h2.cli-servicios — Mis servicios y módulos

#### [PLAN-142] Sprint 5: 'Ver detalles' y ServiceDetailModal
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:159` · tipo: hecho-declarado · estado declarado: hecho (sin mergear) · fecha: 2026-06-25
- Nodo(s): h2.cli-servicios
- Qué es: Modal portaleado con longDescription tomado de un preset local. El CTA 'Desbloquear' y sus 4 estados quedan intactos.
- Referencias: bded0be · ServiceDetailModal.tsx · PremiumModuleCard.tsx · PRESET_MODULE_DETAILS
- Estado en código: **hecho** — ServiceDetailModal.tsx:53-234; PremiumModuleCard.tsx:59-79 (PRESET_MODULE_DETAILS), :427-438; bded0be ancestro de origin/main. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-143] Badge 'Próximamente Q3 2026'
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:175` · tipo: promesa · estado declarado: sin estado · fecha: 2026-06-25
- Nodo(s): h2.cli-servicios
- Qué es: Los módulos coming-soon muestran al cliente 'Próximamente Q3 2026', en la card y en el modal. Es una fecha comprometida.
- Referencias: PremiumModuleCard.tsx · ServiceDetailModal.tsx
- Estado en código: **hecho** — PremiumModuleCard.tsx:300 y ServiceDetailModal.tsx:181 renderizan 'Próximamente Q3 2026'. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: no

#### [PLAN-144] Servicios: Sprints 0-4 y hotfix
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:205` · tipo: hecho-declarado · estado declarado: hecho (sin mergear) · fecha: 2026-06-24
- Nodo(s): h2.cli-servicios
- Qué es: PremiumModuleCard y ServiceCard con el lenguaje del admin, loading espejado y 3 paneles de vidrio a ancho completo. El estado vacío se arma a mano por el boundary.
- Referencias: 5d97587 · 97c02c1 · ab86804 · a6550e9 · 7fda87c · 91b3b20 +1
- Estado en código: **hecho** — 5d97587, 97c02c1, ab86804, a6550e9, 7fda87c y 91b3b20 ancestros de origin/main; empty hand-rolled en services/page.tsx:222-234; ServiceDetailModal montado (PremiumModuleCard.tsx:427-438) (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-145] Modal de detalle de servicios contratados
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:217` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-25
- Nodo(s): h2.cli-servicios
- Qué es: '1 cuadro por servicio + N entidades por tipo'. Requiere relevar la relación Service→Project, que hoy no existe, y posiblemente schema.
- Referencias: ServiceCard · tambien en Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:266
- Estado en código: **no empezado** — services/page.tsx:156-162: 'Ver detalles' del ServiceCard sigue siendo Link a /dashboard/messages?context=default (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-146] longDescription real desde la DB en el modal
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:220` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-25
- Nodo(s): h2.cli-servicios
- Qué es: Reemplazar PRESET_MODULE_DETAILS pasando el campo como prop desde page.tsx. Mini-lane.
- Referencias: PRESET_MODULE_DETAILS · tambien en Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:268
- Estado en código: **no empezado** — PremiumModuleCard.tsx:59 PRESET_MODULE_DETAILS y :195 PRESET_MODULE_DETAILS[slug] ?? GENERIC_MODULE_DETAIL; el catálogo tiene longDescription (premium-modules.ts:28). (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-147] Servicios: tipografía del admin, accent y badge
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:244` · tipo: decision · estado declarado: hecho · fecha: 2026-06-24
- Nodo(s): h2.cli-servicios
- Qué es: Tipografía liviana del admin. Accent por módulo y servicio. Badge 'Premium' neutral. 'Ver detalles' como ícono.
- Referencias: tambien en Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:3
- Estado en código: **hecho** — PremiumModuleCard.tsx:300 badge 'Premium'; :251-262 accent por módulo; :340-341 'Ver detalles' como ícono con aria-label. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-148] No borrar src/lib/data/premium-modules.ts
- Fuente: `docs/bitacora-rediseno.md:3380` · tipo: decision · estado declarado: vigente · fecha: 2026-08-05
- Nodo(s): h2.cli-servicios
- Qué es: Sin consumidores en src/, pero lo usa prisma/seeds/sync-premium-modules.ts, que hace deleteMany sobre PremiumModule y organizationModule; borrarlo rompe el seed.
- Referencias: src/lib/data/premium-modules.ts · prisma/seeds/sync-premium-modules.ts · relacionado docs/bitacora-beta.md:17 (sync-premium-modules prod-runnable sin guard)
- Estado en código: **hecho** — git ls-tree origin/main src/lib/data/premium-modules.ts existe; prisma/seeds/sync-premium-modules.ts:4 lo importa (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-149] Los planes no incluyen módulos premium
- Fuente: `docs/bitacora-roadmap.md:2499` · tipo: decision · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h2.cli-servicios
- Qué es: El chatbot es el producto core; PremiumModule/OrganizationModule son add-ons que se venden aparte vía requestUpsellAction; no hay auto-activación por plan.
- Referencias: src/lib/premium-modules.ts · src/lib/actions/upsell.ts · tambien en docs/bitacora-roadmap.md:2613
- Estado en código: **hecho** — git grep -n -w activateModule origin/main -- . → solo premium-modules.ts:103 y docs/bitacora-roadmap.md:2613; no existe applyPlanModuleEntitlements (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-150] /dashboard/modules/* sin gating
- Fuente: `docs/bitacora-roadmap.md:8921#2` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h2.cli-servicios
- Qué es: Los módulos premium del dashboard no tenían gating al cierre de B13; derivado a B14.
- Estado en código: **parcial** — isModuleActive en agenda-inteligente/page.tsx:320-321, tienda-conectada/page.tsx:295-296, motor-resenas/page.tsx:110,120-127 y email-marketing/layout.tsx:20-21; pero email marketing usa un slug ausente del catálogo (premium-modules.ts:38) y sus actions no chequean el módulo (_actions.ts:17-27). (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-151] P5.2 vitrina de servicios + demanda medida
- Fuente: `docs/bitacora-roadmap.md:11654` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30
- Nodo(s): h2.cli-servicios
- Qué es: 3 estados, 'avisame cuando esté', dedup del upsell y tab Demanda en admin.
- Referencias: src/lib/modules/showroom.ts · src/lib/upsell/dedup.ts · src/app/(protected)/admin/leads/_components/module-demand-table.tsx
- Estado en código: **hecho** — showroom.ts:28-74 (3 estados); dedup.ts:33-40 usado en upsell.ts:87; 'avisame' en PremiumModuleCard.tsx:200-216; admin/leads/_components/module-demand-table.tsx existe. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-152] Módulo DEPRECATED poseído desaparece de 'Tus módulos'
- Fuente: `docs/bitacora-roadmap.md:11720` · tipo: pendiente · estado declarado: pendiente (decisión de Franco) · fecha: 2026-06-30
- Nodo(s): h2.cli-servicios
- Qué es: Decisión de producto: honrar 'ya lo tenés' para discontinuados exige tocar query y classifyModuleState.
- Estado en código: **no empezado** — services/page.tsx:177-180 trae solo ACTIVE/COMING_SOON; showroom.ts:28-35 no contempla DEPRECATED (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-153] PremiumModuleCard usa triggerTransition en portal
- Fuente: `docs/bitacora-roadmap.md:12663` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-servicios
- Qué es: Viola la regla de navegación de portales; migrar es otro alcance.
- Referencias: src/components/dashboard/PremiumModuleCard.tsx
- Estado en código: **hecho** — git grep triggerTransition en components/dashboard y (protected)/dashboard: solo comentarios (PremiumModuleCard.tsx:212, LockedView.tsx:10); la card navega con Link (:404-410) y window.location.assign (:215). (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: no

#### [PLAN-154] Vitrina muestra priceMonthlyUsd=60
- Fuente: `docs/sprints/p3-a-2-venta.md:129` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-servicios
- Qué es: Precio visible con el pricing sin cerrar.
- Estado en código: **no empezado** — PremiumModuleCard.tsx:362-367 muestra el precio del catálogo (premium-modules.ts:31 motor-resenas 60) mientras LockedView.tsx:151 muestra '[FALTA:precio]'. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-155] P3-A.2-acceso: vitrina -> LockedView
- Fuente: `docs/sprints/p3-a-2-venta.md:158` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-04
- Nodo(s): h2.cli-servicios
- Qué es: salesRouteHref en PremiumModuleCard solo para motor-resenas; submitInterest navega con window.location.assign en vez de triggerTransition. Los otros 3 módulos siguen pidiendo inline.
- Referencias: src/components/dashboard/PremiumModuleCard.tsx · src/app/(protected)/dashboard/services/page.tsx · tambien en :176
- Estado en código: **hecho** — services/page.tsx:325-327 salesRouteHref solo 'motor-resenas'; PremiumModuleCard.tsx:403-410 Link 'Ver módulo'; :212-215 window.location.assign tras requestUpsellAction; los demás siguen con RequestButton inline (:411-420) (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-156] Panel servicios + CTA a más servicios
- Fuente: `raiz:lane-plan-log.md:99` · tipo: pendiente · estado declarado: diferido · fecha: 2026-06-25
- Nodo(s): h2.cli-servicios
- Qué es: Diferido a post-merge.
- Estado en código: **no empezado** — dashboard/plan/page.tsx:16-33 solo monta UsageMeter y PlansShowcase. (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-157] Contrato de upsell congelado
- Fuente: `raiz:lane-resultados-redesign-log.md:182` · tipo: decision · estado declarado: decidido · fecha: 2026-06-25
- Nodo(s): h2.cli-servicios
- Qué es: requestUpsellAction(featureKey, featureName) contra PremiumModule.slug; tocarlo requiere coordinación (rompe Servicios y Plan).
- Referencias: src/lib/actions/upsell.ts
- Estado en código: **hecho** — upsell.ts:10-13 firma (featureKey, featureName); :45-48 lookup por PremiumModule.slug; consumidores UpgradeCtaButton.tsx:88, Recommendations.tsx:82, PremiumModuleCard.tsx:206, LockedView.tsx:68, seo/page.tsx:112 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

### h2.cli-shell — Shell del portal (sidebar, notificaciones, novedades)

#### [PLAN-158] Notificaciones del portal
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/General_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h2.cli-shell
- Qué es: NotificationCenter portaleado a body (trampa de backdrop-filter) y modal con el historial completo.
- Referencias: NotificationCenter.tsx · NotificationHistoryModal.tsx · lib/actions/notifications.ts
- Estado en código: **hecho** — NotificationCenter.tsx:169-274 (createPortal a body), NotificationHistoryModal.tsx:14-163, notifications.ts:46-93. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-159] Tarea 1: módulos premium en el sidebar y fullwidth
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h2.cli-shell
- Qué es: Los módulos activos pasan a la sección Servicios por el mismo .map que el resto de los ítems. Las páginas de módulo van a ancho completo. Mergeado.
- Referencias: 7cfe4a4 · 9699eaa · 6bd00a6 · src/components/dashboard/SidebarNav.tsx
- Estado en código: **hecho** — SidebarNav.tsx:72-81, :101-103, :123; commits 7cfe4a4, 9699eaa, 6bd00a6 ancestros de origin/main (git merge-base --is-ancestor). (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-160] Tarea 2: BackLink y navegación
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:21` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h2.cli-shell
- Qué es: Componente BackLink aplicado en soporte/[ticketId]. router.back de campaigns/send pasa a <Link>, y los router.push de campaigns/new quedan documentados. Mergeado.
- Referencias: e6155f5 · 841425c · 2e6dc93 · 461824d · src/components/dashboard/BackLink.tsx
- Estado en código: **hecho** — BackLink.tsx:17-30 usado en soporte/[ticketId]/page.tsx:120; campaigns/[id]/send/page.tsx:60 Cancelar con Link; router.push documentados en campaigns/new/page.tsx:38-40, :69-72, :150-153; commits e6155f5, 841425c, 2e6dc93, 461824d ancestros. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: no

#### [PLAN-161] Botón 'volver atrás' en subpáginas
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:84` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-shell
- Qué es: Patrón global del admin, diferido para todas las secciones con subpáginas.
- Referencias: tambien en Olme/Cliente - Registro de cambios/Mensajes_ registro de cambios.md:58 · tambien en Olme/Cliente - Registro de cambios/General_ registro de cambios.md:83 · ver Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:21 (BackLink)
- Estado en código: **parcial** — src/components/dashboard/BackLink.tsx:17 existe y solo se usa en soporte/[ticketId]/page.tsx:120 (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: si

#### [PLAN-162] B4.4 — Drop de User.unlockedFeatures (legacy)
- Fuente: `docs/bitacora-roadmap.md:2491` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h2.cli-shell
- Qué es: Slug legacy migrado a OrganizationModule, refactor de dashboard/layout, DashboardLayoutClient y SidebarNav, borradas toggleClientFeatureAction y toggleClientFeature (sin callers), DROP COLUMN con migración manual; fix de activeModuleSlugs en el sidebar mobile.
- Referencias: prisma/migrations/20260522214201_drop_user_unlocked_features/migration.sql · prisma/schema.prisma · prisma/seed.ts · src/app/(protected)/dashboard/layout.tsx · src/components/dashboard/DashboardLayoutClient.tsx · src/components/dashboard/SidebarNav.tsx +5
- Estado en código: **hecho** — prisma/migrations/20260522214201_drop_user_unlocked_features/migration.sql existe; git grep unlockedFeatures en src/prisma: solo comentario src/lib/premium-modules.ts:15; SidebarNav.tsx:95, :101-103 usa activeModuleSlugs. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: no

#### [PLAN-163] Quitar '(scaffolding)' del nombre del usuario seed
- Fuente: `docs/bitacora-roadmap.md:4226` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h2.cli-shell
- Qué es: Aparece en el banner del dashboard ('Matsu Admin (scaffolding)'); el doc no precisa en qué seed ('seed-agency-os o similar').
- Referencias: tambien en docs/bitacora-roadmap.md:4230 · tambien en docs/bitacora-roadmap.md:5934
- Estado en código: **no empezado** — scripts/seed-matsu.ts:27 const USER_NAME = 'Matsu Admin (scaffolding)' (se muestra en DashboardLayoutClient.tsx:140-143 via userDisplayName). (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: si

#### [PLAN-164] error.tsx faltantes en 12 páginas del dashboard
- Fuente: `docs/bitacora-roadmap.md:8921#4` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h2.cli-shell
- Qué es: 12 dashboard pages sin error boundary propio; derivado a B14.
- Estado en código: **parcial** — Existen dashboard/error.tsx (cubre a todas las hijas), cuenta/, resultados/, modules/ y chatbot/error.tsx, todos via SectionErrorBoundary con Sentry (SectionErrorBoundary.tsx:64). Soporte, messages, project, services, plan y referidos no tienen boundary propio. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-165] CC.5 pulida visual del dashboard cliente
- Fuente: `docs/bitacora-roadmap.md:10233` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h2.cli-shell
- Qué es: PageHeader unificado en 10 pantallas; seed BotConfig client-a y 4 errores TS resueltos; flag B7 declarado falso positivo.
- Referencias: src/components/ui/PageHeader.tsx · prisma/seed.ts · cierra pendientes fuente:10020, 10120, 10228, 10022, 9864
- Estado en código: **hecho** — git grep -l PageHeader origin/main -- "src/app/(protected)/dashboard" → 16 archivos (p. ej. page.tsx:299, plan/page.tsx:18, referidos/page.tsx) (D2-c1, lector D2-L4)
- ¿Sigue teniendo sentido?: no

#### [PLAN-166] P1-fix scroll reset al navegar
- Fuente: `docs/bitacora-roadmap.md:11419` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30
- Nodo(s): h2.cli-shell
- Qué es: ScrollTopOnNavigate montado en el main del dashboard.
- Referencias: src/components/dashboard/ScrollTopOnNavigate.tsx
- Estado en código: **hecho** — ScrollTopOnNavigate.tsx:16-35 montado en DashboardLayoutClient.tsx:174. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: no

### h2.cli-soporte — Soporte

#### [PLAN-167] Soporte: actions de tickets consolidadas
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h2.cli-soporte
- Qué es: Todo en lib/tickets. Responder no cambia el status y cada respuesta del admin manda email. Se borraron los archivos muertos.
- Referencias: lib/tickets/actions.ts · lib/tickets/schemas.ts
- Estado en código: **parcial** — Mutaciones en lib/tickets/actions.ts:38,110,179,202; responder no cambia el status (:106-109); el email del admin va por Resend con éxito simulado (lib/email.ts:15-16) y sin mirar el resultado (:166); components/dashboard/TicketStatusSelector.tsx quedó sin importadores (git grep TicketStatusSelector → solo su definición). (D2-c1, lector D2-L5)
- ¿Sigue teniendo sentido?: si

#### [PLAN-168] Soporte: tablero de 3 columnas
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:21` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h2.cli-soporte
- Qué es: SoporteBoard con fade, overview portaleado, página sin scroll y hover. Badges de prioridad y categoría también en el admin.
- Referencias: SoporteBoard.tsx · tambien en Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:17
- Estado en código: **hecho** — SoporteBoard.tsx:246-354 (fade :203-210, overview Modal :277-299); badges en admin ticket-list.tsx:57-70. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: no

#### [PLAN-169] Tickets en tiempo real
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:85` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h2.cli-soporte
- Qué es: Polling, SSE o websockets. Está fichado pero sin diseñar.
- Estado en código: **no empezado** — git grep -n -e EventSource -e setInterval -e refreshInterval -e useSWR -e WebSocket origin/main -- soporte/ y componentes del ticket → 0; control: ClientLeadsTable.tsx:146 setInterval(refresh, 30_000) (D2-c1, lector D2-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-170] Sacar el cliente Prisma del bundle del browser (NewTicketModal)
- Fuente: `docs/bitacora-roadmap.md:305` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h2.cli-soporte
- Qué es: El chunk de Prisma (~65KB) persiste porque NewTicketModal usa z.nativeEnum(TicketCategory/TicketPriority); el refactor a z.enum quedó diferido.
- Referencias: NewTicketModal.tsx · tambien en docs/bitacora-roadmap.md:327 · tambien en docs/bitacora-roadmap.md:374
- Estado en código: **hecho** — NewTicketModal.tsx:8 importa TicketCategory/TicketPriority de '@/lib/prisma-enums' (espejo client-safe, prisma-enums.ts:1-42). Barrido: ningun archivo 'use client' de origin/main importa valores runtime de @prisma/client (grep de lineas 'import {…} from' y '} from' sobre git show de cada archivo; control positivo: NotificationCenter.tsx:9 'import type' y tickets/schemas.ts:1 server importa valores). (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: no

### h2.cli-tienda — Tienda online (módulo)

#### [PLAN-171] Botón desconectar Tiendanube
- Fuente: `docs/bitacora-roadmap.md:9832` · tipo: idea · estado declarado: sin estado
- Nodo(s): h2.cli-tienda
- Qué es: No existe acción de desconexión de la tienda.
- Estado en código: **no empezado** — git grep -niE 'disconnect|desconect' origin/main -- src | grep -i tienda vacio; git grep -n 'tiendanubeStoreId: null' vacio; control: callback/route.ts:66 escribe tiendanubeStoreId (D2-c1, lector D2-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-172] Integración Tiendanube por API
- Fuente: `STATUS.md:234` · tipo: decision · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): h2.cli-tienda
- Qué es: Pendiente de decisión.
- Referencias: docs/sprints/alpha-RESUMEN-FINAL.md:78
- Estado en código: **parcial** — src/lib/integrations/tiendanube.ts:5-55 (OAuth + API) y tienda-conectada/page.tsx:86-87, :300-304 ya existen; la decision figura pendiente en docs; PremiumModuleCard.tsx:67 promete 'Integracion completa con Tiendanube'. (D2-c1, lector D2-L3)
- ¿Sigue teniendo sentido?: decidir

## h3 · Chatbot centralizado

### h3.adm-actividad — Actividad global de chatbots

#### [PLAN-173] Queries de las vistas admin de actividad y latencia
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:24` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.adm-actividad
- Qué es: getActivityChartData trae 7 días sin take ni índice. getLatencyHistory hace take:2000 sin orderBy. Corregir al tocar esas vistas.
- Referencias: getActivityChartData · getLatencyHistory · ver Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:23 (MH.1 también incluye getLatencyHistory)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-174] Lane Actividad
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:84` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-19
- Nodo(s): h3.adm-actividad
- Qué es: Seed, fix del casing del nivel, presets de fecha, 'Cargar más' en el cliente (take 250). Se editó ActivityLog.tsx compartido con la pestaña por bot.
- Referencias: 90b3c95 · 3ae17ab · 2b418d2 · 0f48ba7 · 8fa175a · 1d6753f +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-175] Actividad: take 250 fijo
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:110` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-19
- Nodo(s): h3.adm-actividad
- Qué es: Una paginación real en el server requiere sprint propio (toca queries.ts).
- Referencias: queries.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-176] Inteligencia por tenant
- Fuente: `_insumos/drive/Olme/Ideas de nuevas features.md:28` · tipo: idea · estado declarado: pendiente · fecha: 2026-06-20
- Nodo(s): h3.adm-actividad
- Qué es: Pasar Actividad, Health y Alertas de mono-bot (slug='develop' hardcodeado) a por-tenant. Hacen falta 3 migraciones aditivas, ya diseñadas pero no hechas, más un backfill. Quedó archivado como decisión de producto.
- Referencias: src/app/(protected)/admin/chatbot/activity/page.tsx · src/app/(protected)/admin/chatbot/health/page.tsx · ChatbotEvent.organizationId · BotAlert.organizationId · ChatbotEvent.latencyMs · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:47 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-177] P1 filtro por level en activity
- Fuente: `docs/sprints/alpha-1-reaudit.md:230` · tipo: pendiente · estado declarado: pendiente (Alpha.3) · fecha: 2026-05-17
- Nodo(s): h3.adm-actividad
- Qué es: Sin filtro info/warn/error.
- Referencias: tambien en :143, :253
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h3.adm-chatbots — Chatbots (admin)

#### [PLAN-178] La KB nunca se auto-actualiza
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:36` · tipo: decision · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): h3.adm-chatbots
- Qué es: Invariante de E1: toda sugerencia del LLM pasa por una cola de aprobación humana.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:19
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-179] C3.3: knobs que no mientan
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:71` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.adm-chatbots
- Qué es: Honrar temperature y maxOutputTokens, o sacarlos del form del admin. monthlyQuota se rotula como legacy.
- Referencias: monthlyQuota · V-1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-180] Nivel en MAYÚSCULA desde la página del bot
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:111` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-19
- Nodo(s): h3.adm-chatbots
- Qué es: chatbots/[botId]/page.tsx:75 manda el nivel en mayúscula. Está mitigado en el componente, pero la fuente sigue sucia.
- Referencias: src/app/(protected)/admin/chatbots/[botId]/page.tsx:75
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-181] Panel de configuración del bot: bugs, UX y emoji picker
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-12
- Nodo(s): h3.adm-chatbots
- Qué es: Arregla el casing de enums DB↔form, portalea los modales, deja un solo toggle de activo en el header, convierte Test endpoint en modal con curl, endurece Test email y deja la preview sticky. Suma el emoji picker (lazy, solo admin).
- Referencias: BotConfigEditor.tsx · saveBotConfig.ts · saveBotConfigByOrgSlug.ts · ConfigTab.tsx · TestEndpointModal · sendTestNotification.ts +5
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-182] Auditoría de datos Industria/Tono
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:114` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-12
- Nodo(s): h3.adm-chatbots
- Qué es: El Select de tono se recortó a los 3 tonos realmente mapeados. Industria pasa a usar el vocabulario canónico INDUSTRIES_LABELS, con un hint honesto. Update puntual de datos en sanmiguel y develop.
- Referencias: formatTone · INDUSTRIES_LABELS · seed.ts · tambien en Olme/Chatbot_ registro de cambios.md:44
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-183] Roadmap de datos del bot: tonos e industria
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:118` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-12
- Nodo(s): h3.adm-chatbots
- Qué es: Extender formatTone con los 4 tonos que faltan. Decidir si editar Industria re-seedea la KB (con confirmación) o pasa a solo lectura. Sumar 'agencia' al vocabulario canónico y a su template de KB.
- Referencias: formatTone · INDUSTRIES_LABELS · tambien en Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:121 · tambien en Olme/Chatbot_ registro de cambios.md:109
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-184] Freeze del AvatarPicker con varios canvas 3D
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:161` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-12
- Nodo(s): h3.adm-chatbots
- Qué es: Optimizar el montaje simultáneo de varios canvas 3D.
- Referencias: AvatarPicker
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-185] B1: eliminar bot, bulk y overview
- Fuente: `_insumos/drive/Olme/Chatbot_ registro de cambios.md:58` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): h3.adm-chatbots
- Qué es: deleteBotAction y bulkDeleteBotsAction con Zod y solo SUPER_ADMIN, confirmación in-app y overview en grilla responsive.
- Referencias: f369600 · e36f14c · b386b6c · dedcc8a · ae7a89a
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-186] B2: polish, conversión a OsLead y transcript
- Fuente: `_insumos/drive/Olme/Chatbot_ registro de cambios.md:68` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): h3.adm-chatbots
- Qué es: convertChatbotLeadToOsLead (requireSuperAdmin, Zod, $transaction, idempotente por email). Transcript expandible en Conversaciones. Polish visual varios.
- Referencias: d6d4d7b · 9655a42 · 5cf8163 · eb99ccc · 5bede50 · 18c6d53 +6
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-187] B3: convertedToOsLeadId, BOT_DELETED y badge persistente
- Fuente: `_insumos/drive/Olme/Chatbot_ registro de cambios.md:85` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): h3.adm-chatbots
- Qué es: Migración aditiva con migrate deploy. El audit BOT_DELETED se puede filtrar. El badge 'Ya convertido' persiste por ID, también para leads sin email.
- Referencias: 50a3d77 · c3dc192 · 7a80128 · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:36 · tambien en Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:17
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-188] B4: avatar del bot en base64 en DB
- Fuente: `_insumos/drive/Olme/Chatbot_ registro de cambios.md:93` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): h3.adm-chatbots
- Qué es: Compresión en el cliente (≤200×200 WebP) a data URL. Se quitó @vercel/blob y se revirtió el intento con Blob. Resuelve el pendiente de subir imagen de avatar.
- Referencias: 3792ab8 · e53fbbe (revertido) · avatarImageUrlSchema · tambien (pendiente previo) en Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:154
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-189] PA-2: anti-inyección en los CSV del admin
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:30` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-13
- Nodo(s): h3.adm-chatbots
- Qué es: Nuevo helper csv-escape: anti-fórmula, quoting RFC 4180, BOM y CRLF. Cableado en los dos generadores de CSV del admin. Verificado abriendo los exports en Excel.
- Referencias: src/lib/csv/csv-escape.ts · admin/chatbots/bulk-actions.ts · src/lib/bulk-actions.ts · npm run test:pa2 · scripts/dev/qa-seed-leads-dirty.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-190] PA-3/PA-4: bulk actions más robustos
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:43` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-13
- Nodo(s): h3.adm-chatbots
- Qué es: Los fallos reportan su causa. Pausar y activar van en batch (findMany + updateMany + logAdminActionsBatch). El borrado en bulk queda serial a propósito, por la trazabilidad de la auditoría.
- Referencias: logAdminActionsBatch · tambien en Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:47
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-191] Flake e2e 07-admin-navigation en rutas del bot develop
- Fuente: `docs/bitacora-beta-2.md:173` · tipo: pendiente · estado declarado: sin estado (flake) · fecha: 2026-06-27
- Nodo(s): h3.adm-chatbots
- Qué es: gotoAdminRoute hace self-skip cuando page.goto no estabiliza en 30 s sobre /admin/clients/develop/chatbot/* con next start frío.
- Referencias: tests/e2e/07-admin-navigation.spec.ts · también en docs/bitacora-beta-2.md:200 · también en docs/bitacora-beta-2.md:290
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-192] B1.5 — invalidateBotCache cableado en 8 callers
- Fuente: `docs/bitacora-roadmap.md:695` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.adm-chatbots
- Qué es: Los 5 updates de BotConfig y los 3 de KnowledgeBase invalidan el cache de resolveBotBySlug después del commit.
- Referencias: src/app/(protected)/admin/chatbots/[botId]/actions.ts · src/app/(protected)/admin/chatbots/bulk-actions.ts · src/modules/chatbot/server/admin/saveBotConfig.ts · src/modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts · src/modules/chatbot/server/admin/saveKnowledgeBase.ts · src/modules/chatbot/server/admin/saveKnowledgeBaseByOrgSlug.ts +4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-193] Mantener la invalidación del cache en nuevos callers
- Fuente: `docs/bitacora-roadmap.md:741` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.adm-chatbots
- Qué es: No hay lint que obligue a llamar invalidateBotCache tras updates de BotConfig/KnowledgeBase; si el slug se vuelve editable hay que invalidar también el slug viejo.
- Referencias: src/modules/chatbot/server/conversation/resolver.ts · tambien en docs/bitacora-roadmap.md:756 · tambien en docs/bitacora-roadmap.md:781
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-194] Sin límite de longitud por campo de la KnowledgeBase
- Fuente: `docs/bitacora-roadmap.md:1055` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.adm-chatbots
- Qué es: Un cliente puede cargar una KB enorme y degradar TTFB y costo por mensaje sin aviso.
- Referencias: src/modules/chatbot/server/prompts/helpers.ts · tambien en docs/bitacora-roadmap.md:1071
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-195] Cargar datos reales de Matsu (B2) en lugar del scaffolding
- Fuente: `docs/bitacora-roadmap.md:1104` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.adm-chatbots
- Qué es: La KB de Matsu tiene valores inventados (marca, ciudad, dirección 'de scaffolding') y el nombre de bot Aki es provisorio; cambiar el objeto SCAFFOLDING, re-correr el seed y el baseline.
- Referencias: scripts/seed-matsu.ts · tambien en docs/bitacora-roadmap.md:1181 · tambien en docs/bitacora-roadmap.md:1210 · tambien en docs/bitacora-roadmap.md:1211 · tambien en docs/bitacora-roadmap.md:1222 · tambien en docs/bitacora-roadmap.md:1227
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-196] Matsu sin allowedDomains ni embed configurados
- Fuente: `docs/bitacora-roadmap.md:1106` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.adm-chatbots
- Qué es: El shell no configuró dominios ni embed (funciona en dev porque validateOrigin permite localhost); el plan se asignó luego en B4.3 solo en dev.
- Referencias: scripts/seed-matsu.ts · tambien en docs/bitacora-roadmap.md:2402
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-197] Mostrar dominios usados vs permitidos (X de N)
- Fuente: `docs/bitacora-roadmap.md:2295` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h3.adm-chatbots
- Qué es: Tras un downgrade los dominios sobrantes quedan bloqueados sin contexto para el cliente; mostrarlo en admin y en el dashboard del cliente.
- Referencias: tambien en docs/bitacora-roadmap.md:2308
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-198] BotConfig.monthlyQuota obsoleto
- Fuente: `docs/bitacora-roadmap.md:2297` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h3.adm-chatbots
- Qué es: El cap lo da plan.quota; BotDetailClient todavía lee el campo legacy; deprecación pendiente.
- Referencias: src/app/(protected)/admin/chatbots/[botId]/BotDetailClient.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-199] BotConfig.llmModel editable en admin pero ignorado
- Fuente: `docs/bitacora-roadmap.md:2298` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h3.adm-chatbots
- Qué es: En runtime manda plan.llmModel; deuda de UX: indicar el override del plan o impedir editar el campo.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-200] Pendientes de verificación de B7
- Fuente: `docs/bitacora-roadmap.md:5927` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h3.adm-chatbots
- Qué es: AppearanceTab del admin, estados listening/speaking en vivo, flujo elegir-guardar-recargar y mobile de rutas protegidas.
- Referencias: tambien en docs/bitacora-roadmap.md:5928 · tambien en docs/bitacora-roadmap.md:5929 · tambien en docs/bitacora-roadmap.md:5930 · tambien en docs/bitacora-roadmap.md:5944
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-201] B9.1 — Eliminada la vista deprecada /admin/clients/[clientId]/chatbot
- Fuente: `docs/bitacora-roadmap.md:5948` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h3.adm-chatbots
- Qué es: ConversationsTab migrado a /admin/chatbots/[botId], hrefs reapuntados, carpeta deprecada borrada y reemplazada por un catch-all con permanentRedirect a la vista canónica; ClientChatbotTabs eliminado.
- Referencias: src/app/(protected)/admin/chatbots/[botId]/tabs/ConversationsTab.tsx · src/app/(protected)/admin/chatbots/[botId]/tabs.ts · src/app/(protected)/admin/chatbots/[botId]/page.tsx · src/app/(protected)/admin/chatbots/[botId]/BotDetailClient.tsx · src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx · src/app/(protected)/admin/clients/[clientId]/_components/tabs/ChatbotTab.tsx +7
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-202] B9.2 — Labels de conteo de conversaciones clarificados
- Fuente: `docs/bitacora-roadmap.md:6067` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h3.adm-chatbots
- Qué es: Las tres cifras (total, mes en curso, lista de 100) eran métricas válidas con labels ambiguos; se agregaron calificadores, footer 'Mostrando N de M' y listConversationsByOrgSlug devuelve {items, total}.
- Referencias: src/app/(protected)/admin/clients/[clientId]/_components/tabs/ChatbotTab.tsx · src/components/admin/managers/ChatbotManager.tsx · src/modules/chatbot/lib/business-metrics.ts · src/modules/chatbot/components/dashboard/ChatbotOverview.tsx · src/modules/chatbot/components/dashboards/ConversationsTable.tsx · src/modules/chatbot/server/admin/multiTenantQueries.ts +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-203] Ejecutar el dedupe de la KB de develOP
- Fuente: `docs/bitacora-roadmap.md:6269` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h3.adm-chatbots
- Qué es: Correr scripts/b9-4-dedupe-kb-develop.mjs en dry-run y luego --apply (Franco); businessInfo tiene una línea repetida 6 veces.
- Referencias: scripts/b9-4-dedupe-kb-develop.mjs · tambien en docs/bitacora-roadmap.md:6284 · tambien en docs/bitacora-roadmap.md:6299 · tambien en docs/bitacora-roadmap.md:6315
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-204] Enum-izar campos visuales de BotConfig
- Fuente: `docs/bitacora-roadmap.md:6976` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-25
- Nodo(s): h3.adm-chatbots
- Qué es: borderRadius, surfaceStyle, position, fontStyle, bubbleStyle y tone; pasada cosmética posterior.
- Referencias: prisma/schema.prisma
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-205] B13.3 — Pulir copy y contenido del bot demo
- Fuente: `docs/bitacora-roadmap.md:8457` · tipo: bloque · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h3.adm-chatbots
- Qué es: Seed del chatbot y {{PLACEHOLDERS}} sin reemplazar del bot demo 'CHATBOT'.
- Referencias: src/modules/chatbot/prisma/seed.ts · tambien en docs/bitacora-roadmap.md:8564
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-206] B13.0 — Preview del editor de bot con avatar vivo
- Fuente: `docs/bitacora-roadmap.md:8515` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): h3.adm-chatbots
- Qué es: BotConfigPreview reescrito: monta el AvatarRenderer real con vista Flotando/Abierto y estados Idle/Pensando/Hablando, espejo del state del editor y sin metadata técnica (modelo/temperatura/cuota siguen en AdvancedTab).
- Referencias: src/modules/chatbot/components/admin/config/BotConfigPreview.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-207] Sin IntersectionObserver para pausar el Canvas 3D del preview
- Fuente: `docs/bitacora-roadmap.md:8562` · tipo: decision · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): h3.adm-chatbots
- Qué es: Se confía en la degradación de B7 (dpr [1,1.5], antialias off); revisar en su propio sprint si cae el FPS en mobile.
- Referencias: src/modules/chatbot/components/admin/config/BotConfigPreview.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-208] Topbar del editor de bot muestra 'Detalle'
- Fuente: `docs/bitacora-roadmap.md:8572` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h3.adm-chatbots
- Qué es: Pasar el contexto del recurso (nombre del bot) al AdminTopbar.
- Referencias: src/app/(protected)/admin/_components/admin-topbar.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-209] Bloquear activación de bot con {{placeholders}} sin completar
- Fuente: `docs/bitacora-roadmap.md:8636` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h3.adm-chatbots
- Qué es: La banda ámbar del editor KB es solo estética; bloquear la activación del bot con placeholders sin reemplazar queda en roadmap.
- Referencias: src/modules/chatbot/components/admin/kb/MarkdownEditor.tsx · también en fuente:8664
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-210] Quick replies de concesionaria del bot demo
- Fuente: `docs/bitacora-roadmap.md:8678` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-05-26
- Nodo(s): h3.adm-chatbots
- Qué es: Se dejaron los quick replies temáticos del bot demo; cambiarlos a genéricos queda a decisión de Franco.
- Referencias: scripts/_b13-2-fix-demo-bots.mjs
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-211] Borrar bot bench-matsu de prod y scripts throwaway
- Fuente: `docs/bitacora-roadmap.md:9713` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h3.adm-chatbots
- Qué es: Correr _b14-2-cleanup-bench-prod.ts --confirm y eliminar scripts _b14-*.mjs post-v1.0.
- Referencias: también en fuente:9714
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-212] CC.2 integración CRM movida al admin
- Fuente: `docs/bitacora-roadmap.md:9881` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.adm-chatbots
- Qué es: Tab Integraciones en el bot admin con actions requireSuperAdmin; cliente ve solo CrmStatusIndicator.
- Referencias: src/app/(protected)/admin/chatbots/[botId]/tabs/IntegrationsTab.tsx · src/modules/chatbot/server/admin/integrations/ · src/modules/chatbot/components/dashboard/CrmStatusIndicator.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-213] Cambio prefetch={false} sin commitear en BotDetailClient
- Fuente: `docs/bitacora-roadmap.md:10386` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-30
- Nodo(s): h3.adm-chatbots
- Qué es: Cambio funcional pendiente de Franco que B15 no tocó ni commiteó.
- Referencias: src/app/(protected)/admin/chatbots/[botId]/BotDetailClient.tsx · también en fuente:10419
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-214] Migrar mapas de intent del admin y CSV al mapa compartido
- Fuente: `docs/bitacora-roadmap.md:11383` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-30
- Nodo(s): h3.adm-chatbots
- Qué es: LeadsTable admin, ficha-accordion de leados y buildLeadsCsv tienen el mismo patrón.
- Referencias: src/modules/chatbot/components/dashboards/LeadsTable.tsx · src/modules/chatbot/server/leads/csv/buildLeadsCsv.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-215] D4 guard anti-spam del cron de insights
- Fuente: `docs/bitacora-roadmap.md:12143` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.adm-chatbots
- Qué es: pendingCount real con getInsightsCountForBot (antes hardcodeado a 0).
- Referencias: src/app/api/cron/generate-insights/route.ts · tests/integration/generate-insights-pending-guard.spec.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-216] D3' Test email e insights migrados a Brevo
- Fuente: `docs/bitacora-roadmap.md:12185` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.adm-chatbots
- Qué es: sendLeadNotification e sendInsightsNotification por Brevo; fix org.name.
- Referencias: cierra pendiente fuente:11883
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-217] BotConfig.llmModel editable sin efecto
- Fuente: `docs/bitacora-roadmap.md:13257` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-07-07
- Nodo(s): h3.adm-chatbots
- Qué es: El modelo efectivo sale del plan; los campos del admin siguen editables.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-218] COST-2b demo-chat resuelve provider sin cast
- Fuente: `docs/bitacora-roadmap.md:13743` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-11
- Nodo(s): h3.adm-chatbots
- Qué es: normalizeLlmProvider + resolveEffectiveModel en el endpoint de preview.
- Referencias: src/app/api/demo-chat/[slug]/route.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-219] Endpoint demo-chat sin caller ni UI
- Fuente: `docs/bitacora-roadmap.md:13794` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-07-11
- Nodo(s): h3.adm-chatbots
- Qué es: Código muerto tras requireSuperAdmin; además usa prisma crudo fuera de isolation.
- Referencias: también en fuente:17059
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-220] Insights sin dedup entre corridas + timeout del cron
- Fuente: `docs/bitacora-roadmap.md:16510` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h3.adm-chatbots
- Qué es: Insights se duplican entre corridas y el cron tiene timeout de 20s.
- Referencias: también en fuente:16679
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-221] CARRERAS commit 2: provider-close en rutas admin
- Fuente: `docs/bitacora-roadmap.md:17035` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-12
- Nodo(s): h3.adm-chatbots
- Qué es: demo-chat y test-prompt con middleware de cierre; test-prompt ya no devuelve el error crudo.
- Referencias: cierra deuda fuente:15608
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-222] Vista admin read-only de CrmIntegration
- Fuente: `docs/roadmap-pendientes.md:24` · tipo: pendiente · estado declarado: pendiente (postergado) · fecha: 2026-05-24
- Nodo(s): h3.adm-chatbots
- Qué es: Sección por org con estado, últimos errores y últimas 20 entradas del historial; sin edición.
- Referencias: /admin/clients/[clientId]/chatbot/
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-223] Alpha.0 cleanup
- Fuente: `docs/sprints/alpha-0-cleanup.md:4` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.adm-chatbots
- Qué es: Borrado legacy /admin/os y /os, requireSuperAdmin en 6 actions y /api/admin/chatbot/events, 6 páginas /admin/clients/[orgSlug]/chatbot, StatCard unificado, sonner, React.cache en auth.
- Referencias: tambien en :11, :15, :25, :30
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-224] P1 paginación de conversaciones y leads del chatbot
- Fuente: `docs/sprints/alpha-1-reaudit.md:226` · tipo: pendiente · estado declarado: pendiente (Alpha.3) · fecha: 2026-05-17
- Nodo(s): h3.adm-chatbots
- Qué es: limit: 100 hardcodeado; cursor pagination y búsqueda por nombre/email.
- Referencias: tambien en :234, :250-:252
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-225] P1 'as any' en config del bot
- Fuente: `docs/sprints/alpha-1-reaudit.md:229` · tipo: pendiente · estado declarado: pendiente (Alpha.4) · fecha: 2026-05-17
- Nodo(s): h3.adm-chatbots
- Qué es: data.bot as any en /admin/clients/[slug]/chatbot/config.
- Referencias: tambien en :105, :256
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-226] Backfill de verticalPack en bots reales
- Fuente: `docs/sprints/q1-1-harness.md:103` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-05
- Nodo(s): h3.adm-chatbots
- Qué es: develop -> agencia, matsu -> usados; gate abierto.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-227] Lote 1 chatbots admin
- Fuente: `raiz:lane-LOG.md:16` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.adm-chatbots
- Qué es: ConfirmDialog en bulk, eliminar bot individual y bulk con auditoría, selects con ancho y labels, overview de 12 celdas, fixes de review.
- Referencias: f369600 · e36f14c · b386b6c · dedcc8a · ae7a89a
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-228] Hidratación reduced-motion en BotsListClient
- Fuente: `raiz:lane-LOG.md:76` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h3.adm-chatbots
- Qué es: initial={reduce ? false : 'hidden'} puede desajustar; aplicar useHydratedReducedMotion.
- Referencias: tambien en :83
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-229] Combobox de industria y métricas ricas
- Fuente: `raiz:lane-LOG.md:81` · tipo: idea · estado declarado: idea
- Nodo(s): h3.adm-chatbots
- Qué es: Generalizar LocationTypeahead y label map de industria; costo por conversación y series de uso (queries nuevas).
- Referencias: tambien en :82
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-230] Lote 2 chatbots admin (UI)
- Fuente: `raiz:lane-LOG.md:103` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.adm-chatbots
- Qué es: Checkbox custom, KBValidation glass, emoji picker en respuestas rápidas, preview sticky, metadata de ActivityLog togglable.
- Referencias: 5cf8163 · eb99ccc · 5bede50 · 18c6d53 · 14ffbf1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-231] Subidor de avatar del bot
- Fuente: `raiz:lane-LOG.md:118` · tipo: pendiente · estado declarado: parcial
- Nodo(s): h3.adm-chatbots
- Qué es: Solo se mejoró el campo URL; falta storage (dependencia nueva a aprobar) y POST /api/admin/chatbot/avatar-upload.
- Referencias: 29cd541 · tambien en :140
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-232] Convertir lead del bot a OsLead
- Fuente: `raiz:lane-LOG.md:124` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h3.adm-chatbots
- Qué es: convertChatbotLeadToOsLead solo para slug develop, idempotente por email; botón por fila en LeadsTab.
- Referencias: d6d4d7b
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-233] Transcript expandible de conversaciones
- Fuente: `raiz:lane-LOG.md:129` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.adm-chatbots
- Qué es: ConversationsTable expandible y getConversationTranscriptAction; quita el any de estimatedCostUsd.
- Referencias: 9655a42 · db3414c
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-234] 'Ya convertido' persistente
- Fuente: `raiz:lane-LOG.md:141` · tipo: pendiente · estado declarado: pendiente de coordinación · **ZONA-FRANCO**
- Nodo(s): h3.adm-chatbots
- Qué es: Badge solo in-session; requiere ChatbotLead.convertedToOsLeadId o left-join por email.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-235] Lote 2.1
- Fuente: `raiz:lane-LOG.md:168` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.adm-chatbots
- Qué es: Fecha de LeadsTable con timeZone AR (también dashboard cliente), click en card togglea selección, header de KB glass sticky.
- Referencias: 60bb425 · dabc45b · 1864d96
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-236] Admin v1.0
- Fuente: `STATUS.md:32` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-21
- Nodo(s): h3.adm-chatbots
- Qué es: Wizard de cliente, /admin/chatbots (+/new, bot con 5 tabs, KB con preview, Instalar, dominios), bulk ops, audit log, alertas 9 tipos con email/Telegram, reenvío de credenciales.
- Referencias: tests 06-*, 10, 16-*, 18-*, 30
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-237] Ruta canónica /admin/chatbots
- Fuente: `STATUS.md:216` · tipo: decision · estado declarado: decidido · fecha: 2026-05-21
- Nodo(s): h3.adm-chatbots
- Qué es: /admin/clients/[id]/chatbot/* queda deprecada.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h3.adm-health — Health de chatbots

#### [PLAN-238] Lane Health
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:56` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-19
- Nodo(s): h3.adm-health
- Qué es: Seed de latencia, hover (en el chart sin scale) y fix del formatter del tooltip P50/P95.
- Referencias: c1dfbc9 · 5590e6d · 558813c · 624d1b6 · health/LatencyChart.tsx · scripts/dev/seed-latency.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-239] getLatencyHistory: ventana y buckets desalineados
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:80` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-19
- Nodo(s): h3.adm-health
- Qué es: Queda ~1h de borde afuera del conteo. Deuda BAJA: por decisión no se arregla, mini-lote futuro si se prioriza.
- Referencias: getLatencyHistory.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-240] B1.6 — Health Score real + veredicto humano
- Fuente: `docs/bitacora-roadmap.md:792` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.adm-health
- Qué es: getLatencyHistory sin mocks (estados ok/insufficient/empty), buildHealthVerdict con veredicto Todo OK/Atención/Problema, LatencyChart con empty state honesto y VerdictHero en /admin/chatbot/health.
- Referencias: src/modules/chatbot/server/admin/getLatencyHistory.ts · src/modules/chatbot/server/health/buildHealthVerdict.ts · src/modules/chatbot/server/health/index.ts · src/modules/chatbot/components/admin/health/LatencyChart.tsx · src/app/(protected)/admin/chatbot/health/page.tsx · pendiente originado en docs/bitacora-roadmap.md:481 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-241] Health: tasa de error/5xx y alertas push
- Fuente: `docs/bitacora-roadmap.md:923` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-22
- Nodo(s): h3.adm-health
- Qué es: No construidas en B1.6; B1.7 si se pide la tasa de error; alertas Sentry/email al pasar a 'Problema' en otro sprint.
- Referencias: tambien en docs/bitacora-roadmap.md:924
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-242] Monitorear el costo multi-step (timings.step_count) en el health
- Fuente: `docs/bitacora-roadmap.md:1963` · tipo: promesa · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.adm-health
- Qué es: 'Lo voy a flag en el dashboard de health cuando llegue B4'; los flujos de captura gastan ~2x tokens en el turno de captura.
- Referencias: src/modules/chatbot/server/chat/handleChatRequest.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-243] Monitor automático del camino LLM
- Fuente: `docs/bitacora-roadmap.md:17096` · tipo: idea · estado declarado: sin estado · fecha: 2026-08-12
- Nodo(s): h3.adm-health
- Qué es: Si hace falta alerting, construirlo autenticado y con provider-close, nunca un GET público.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h3.cli-chatbot — Mi chatbot (cliente)

#### [PLAN-244] Widget 'Salud del bot' en el dashboard del dueño
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:11` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.cli-chatbot
- Qué es: Muestra en lenguaje simple el % de visitas atendidas, las conversaciones en modo degradado y el uptime. Espera a que cierre MH.4.
- Referencias: MH.4 · tambien en Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:26
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-245] UTM: '¿De dónde vienen mis leads?' (P4 del panel)
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:17` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.cli-chatbot
- Qué es: Usa utmSource, utmMedium, utmCampaign y firstContactedAt, que nacen en EV.2, más la captura de UTM.1. Esperar su cierre.
- Referencias: EV.2 · UTM.1 · utmSource · firstContactedAt
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-246] E1: superficie de gaps de KB y aprobación (panel)
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:19` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.cli-chatbot
- Qué es: Pantalla 'el bot no supo responder esto', flujo de aprobación de propuestas de KB y aplicación a la KB. La KB nunca se auto-actualiza.
- Referencias: E1.1 · ver Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:88 (C2.1, ciclo D2)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-247] firstContactedAt y decay del scoring
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:20` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.cli-chatbot
- Qué es: El panel escribe firstContactedAt cuando el dueño marca contacto. El scoring va a usar lastStatusChangeAt ?? capturedAt; coordinar el campo.
- Referencias: firstContactedAt · lastStatusChangeAt · tambien en Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:47
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-248] Render genérico de señales para verticales no-autos
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:25` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.cli-chatbot
- Qué es: Tarea del panel cuando llegue el primer cliente de otro vertical. Las señales legacy se mantienen por dual-write.
- Referencias: signals Json
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-249] Dual-write de las señales legacy sin fecha de salida
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:35` · tipo: decision · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): h3.cli-chatbot
- Qué es: Las señales legacy se siguen escribiendo porque las ve el cliente en el panel.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:25
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-250] Derivación al panel: consultas sin responder y memoria
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:88` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.cli-chatbot
- Qué es: Pantalla del dueño para C2.1 y C2.3. Ciclo D2: el cliente propone una mejora de KB y develOP la aprueba.
- Referencias: tambien en Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:64 · ver Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:19
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-251] Mi Chatbot: fix de Decimal, loadings y activación sin bot
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Chatbot_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.cli-chatbot
- Qué es: Number(usage.costUsd) por unstable_cache. Loadings a ancho completo. Sin bot se muestra ChatbotUpsellLanding en lugar de redirigir. Hover.
- Referencias: getUsageByOrgSlug · ChatbotUpsellLanding · tambien en Olme/Cliente - Registro de cambios/Chatbot_ registro de cambios.md:30
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-252] Config acotada del cliente (BotPersonalization)
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Chatbot_ registro de cambios.md:15` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.cli-chatbot
- Qué es: Color secundario y tinte, imagen de avatar en base64, emoji por quick-reply y dirty-state. Sin schema.
- Referencias: BotPersonalization · accentSecondary · chatSurfaceTint · avatarImageUrl
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-253] Leads en pipeline y conversaciones expandibles
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Chatbot_ registro de cambios.md:38` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.cli-chatbot
- Qué es: Columnas Calientes, Tibios y Fríos. Fix del filtro de fecha. Transcript inline con una action scopeada por org (anti-IDOR) y 'Conversación origen'.
- Referencias: dashboard/lead-pipeline/ · getClientConversationTranscriptAction · tambien en Olme/Cliente - Registro de cambios/Chatbot_ registro de cambios.md:50
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-254] Config completa del bot para el cliente
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Chatbot_ registro de cambios.md:87` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h3.cli-chatbot
- Qué es: Nombre, tono, prompts y color por ruta, y unificar el editor con el admin. Requiere decisiones de producto.
- Referencias: tambien en Olme/Cliente - Registro de cambios/Chatbot_ registro de cambios.md:23
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-255] Uploader de avatar con storage externo
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Chatbot_ registro de cambios.md:89` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h3.cli-chatbot
- Qué es: Hoy la imagen va en base64 inline. Queda pendiente una decisión de infra.
- Referencias: contradice Olme/Chatbot_ registro de cambios.md:97
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-256] e2e 15-client-personalization falla de forma intermitente
- Fuente: `docs/bitacora-beta-2.md:256` · tipo: pendiente · estado declarado: sin estado (flake) · fecha: 2026-06-27
- Nodo(s): h3.cli-chatbot
- Qué es: 'Guardar cambios' y 'cambiar welcome message' en /dashboard/chatbot/settings no completan (strict-mode locator); se atribuye a drift de la Neon dev compartida.
- Referencias: tests/e2e/15-client-personalization.spec.ts · también en docs/bitacora-beta-2.md:290 · también en docs/bitacora-beta-2.md:430
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-257] Mostrar en el dashboard el contexto nuevo del handoff
- Fuente: `docs/bitacora-roadmap.md:1648` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-22
- Nodo(s): h3.cli-chatbot
- Qué es: multiTenantQueries y ChatbotOverview solo leen visitorName/reason; intent, topicSummary y purchaseSignals quedan disponibles en la metadata del evento.
- Referencias: src/modules/chatbot/server/admin/multiTenantQueries.ts:104-112 · src/modules/chatbot/components/dashboard/ChatbotOverview.tsx:181
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-258] Un lead DQ es DQ siempre
- Fuente: `docs/bitacora-roadmap.md:3712` · tipo: decision · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.cli-chatbot
- Qué es: No se enfría con el decay, no se rescata con el tiempo ni se puede des-descartar a mano desde el detalle.
- Referencias: src/modules/chatbot/server/scoring/calculateLeadScore.ts · tambien en docs/bitacora-roadmap.md:3798 · tambien en docs/bitacora-roadmap.md:4324
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-259] B5.5 — Vista de leads priorizada por score efectivo
- Fuente: `docs/bitacora-roadmap.md:3822` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.cli-chatbot
- Qué es: Orden por effectiveScore en memoria, filtro de fecha con TZ Argentina, empty states diferenciados (sin leads, solo DQ, filtros vacíos), limpieza de jerga y guard defensivo en applyTimeDecay.
- Referencias: src/app/(protected)/dashboard/chatbot/leads/page.tsx · src/app/api/dashboard/leads/recent/route.ts · src/modules/chatbot/components/dashboard/ClientLeadsTable.tsx · src/modules/chatbot/components/dashboard/BusinessLeadCard.tsx · src/modules/chatbot/server/scoring/calculateLeadScore.ts · pendiente originado en docs/bitacora-roadmap.md:3805
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-260] Verificación visual pendiente de las pantallas de leads, CRM y export (B5.5-B5.9)
- Fuente: `docs/bitacora-roadmap.md:3897` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h3.cli-chatbot
- Qué es: Se cerraron por code review y DOM; la captura headless estaba bloqueada (preloader y luego timeouts); MS-6 deja agendada una pasada de visual-qa.
- Referencias: tambien en docs/bitacora-roadmap.md:3908 · tambien en docs/bitacora-roadmap.md:4022 · tambien en docs/bitacora-roadmap.md:4126 · tambien en docs/bitacora-roadmap.md:4346 · tambien en docs/bitacora-roadmap.md:4438 · tambien en docs/bitacora-roadmap.md:4617 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-261] B5.6 — Detalle de lead en ruta dedicada
- Fuente: `docs/bitacora-roadmap.md:3912` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.cli-chatbot
- Qué es: Reemplaza el modal por /dashboard/chatbot/leads/[id] con getLeadByIdForOrg y getConversationMessagesForOrg (filtro relacional, notFound si es de otra org); LeadDetail con contacto, 'por qué', conversación, WhatsApp pre-armado y seguimiento.
- Referencias: src/modules/chatbot/server/admin/multiTenantQueries.ts · src/modules/chatbot/index.server.ts · src/app/(protected)/dashboard/chatbot/leads/[id]/page.tsx · src/modules/chatbot/components/dashboard/LeadDetail.tsx · src/modules/chatbot/components/dashboard/BusinessLeadCard.tsx · src/modules/chatbot/components/dashboard/ClientLeadsTable.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-262] B5.7 — Aviso de leads calientes (badge, dot y ring)
- Fuente: `docs/bitacora-roadmap.md:4027` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.cli-chatbot
- Qué es: countHotNewLeadsForOrg con unstable_cache 30s y tag hot-leads-count; badge en el sidebar, dot en la tab Leads y ring en cards hot+NEW; polling pausado con la pestaña oculta.
- Referencias: src/modules/chatbot/server/admin/multiTenantQueries.ts · src/modules/chatbot/index.server.ts · src/app/(protected)/dashboard/layout.tsx · src/app/(protected)/dashboard/chatbot/layout.tsx · src/components/dashboard/DashboardLayoutClient.tsx · src/components/dashboard/SidebarNav.tsx +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-263] Push real / web push para leads calientes
- Fuente: `docs/bitacora-roadmap.md:4101` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-23
- Nodo(s): h3.cli-chatbot
- Qué es: Fuera de scope; roadmap B6+ cuando haya tracción y el cliente lo pida.
- Referencias: tambien en docs/bitacora-roadmap.md:4127 · tambien en docs/bitacora-roadmap.md:4397 · tambien en docs/bitacora-roadmap.md:4439
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-264] B5.5 (iteración 2) — Filtros DB-side + toggle Descartados
- Fuente: `docs/bitacora-roadmap.md:4131` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: listLeadsForDashboard filtra en Prisma con los índices de B5.1, filtros en la URL (status, range, view), toggle 'Descartados (N)', badge protagonista, polling con router.refresh(), fix de <a> anidado; helper src/lib/tz-ar.ts.
- Referencias: src/lib/tz-ar.ts · src/modules/chatbot/server/admin/multiTenantQueries.ts · src/modules/chatbot/index.server.ts · src/app/(protected)/dashboard/chatbot/leads/page.tsx · src/modules/chatbot/components/dashboard/ClientLeadsTable.tsx · src/modules/chatbot/components/dashboard/BusinessLeadCard.tsx +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-265] Paginación + materialización del score efectivo
- Fuente: `docs/bitacora-roadmap.md:4161` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: El orden por score efectivo es en memoria; a miles de leads por org no escala.
- Referencias: tambien en docs/bitacora-roadmap.md:4223 · tambien en docs/bitacora-roadmap.md:4243
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-266] /api/dashboard/leads/recent queda sin consumidor de UI
- Fuente: `docs/bitacora-roadmap.md:4181` · tipo: decision · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: La vista pasó a router.refresh(); el endpoint se mantiene porque lo usa un test e2e y queda como API disponible.
- Referencias: src/app/api/dashboard/leads/recent/route.ts · tambien en docs/bitacora-roadmap.md:4225
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-267] B5.6 (iteración 2) — Detalle de lead para casos DQ
- Fuente: `docs/bitacora-roadmap.md:4247` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: Hero gris 'Descartado', sección 'Por qué fue descartado', sin acciones comerciales y 'Notas' sin select de estado para leads DQ.
- Referencias: src/modules/chatbot/components/dashboard/LeadDetail.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-268] Botón 'Reportar mal clasificado'
- Fuente: `docs/bitacora-roadmap.md:4325` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: No hay feedback al motor (heurístico puro); evaluarlo en B6+.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-269] B5.7 (iteración 2) — revalidateTag del badge + chip 'Nuevo'
- Fuente: `docs/bitacora-roadmap.md:4350` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: captureLead invalida el tag hot-leads-count al entrar un hot; updateLeadStatus lo invalida al cruzar la frontera hot+NEW; chip cyan 'Nuevo' durante 6s para leads recién llegados en el polling.
- Referencias: src/modules/chatbot/server/tools/captureLead.ts · src/modules/chatbot/server/admin/updateLeadStatus.ts · src/modules/chatbot/components/dashboard/ClientLeadsTable.tsx · src/modules/chatbot/components/dashboard/BusinessLeadCard.tsx · pendiente originado en docs/bitacora-roadmap.md:4064
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-270] B5.8 — Integración CRM vía webhook n8n (DB-primero)
- Fuente: `docs/bitacora-roadmap.md:4443` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: Modelos CrmIntegration y CrmSyncAttempt, hook fire-and-forget tras el commit del lead, 3 intentos con backoff, anti-SSRF, secret opcional AES-256-GCM con CRM_SECRET_KEY, audit de cambios, PENDING zombie resuelto en lectura y card en /dashboard/chatbot/settings gateada por crmEnabled.
- Referencias: prisma/migrations/20260524210709_b58_crm_integration · src/modules/chatbot/server/crm/validateWebhookUrl.ts · src/modules/chatbot/server/crm/encryptSecret.ts · src/modules/chatbot/server/crm/buildLeadPayload.ts · src/modules/chatbot/server/crm/postToN8n.ts · src/modules/chatbot/server/crm/syncLeadToCrm.ts +15
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-271] Protección contra DNS rebinding en el webhook CRM
- Fuente: `docs/bitacora-roadmap.md:4483` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: validateWebhookUrl rechaza IPs privadas literales pero no dominios que resuelven a IP privada; resolver la IP justo antes del POST.
- Referencias: src/modules/chatbot/server/crm/validateWebhookUrl.ts · tambien en docs/bitacora-roadmap.md:4533 · tambien en docs/bitacora-roadmap.md:4619
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-272] Cron diario para syncs CRM FAILED
- Fuente: `docs/bitacora-roadmap.md:4531` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: Se eligió retry in-flight + reintento manual; un cron que barra los FAILED viejos queda para cuando haya volumen.
- Referencias: tambien en docs/bitacora-roadmap.md:4618
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-273] Aviso legal en la UI sobre envío de PII a terceros (webhook CRM)
- Fuente: `docs/bitacora-roadmap.md:4536` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: Nota para el dueño al configurar el endpoint: va a enviar datos personales de sus clientes a un sistema propio.
- Referencias: tambien en docs/bitacora-roadmap.md:4621
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-274] B5.9 — Exportar leads a CSV
- Fuente: `docs/bitacora-roadmap.md:4625` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: GET /api/dashboard/chatbot/leads/export con auth y filtro por org, respeta los filtros activos, nunca mezcla DQ, anti CSV-injection celda por celda, BOM UTF-8, audit LEADS_EXPORTED y tope de 10.000; botón ExportLeadsButton.
- Referencias: src/modules/chatbot/server/leads/csv/csvEscape.ts · src/modules/chatbot/server/leads/csv/buildLeadsCsv.ts · src/modules/chatbot/server/leads/csv/index.ts · src/app/api/dashboard/chatbot/leads/export/route.ts · src/modules/chatbot/components/dashboard/ExportLeadsButton.tsx · src/modules/chatbot/components/dashboard/ClientLeadsTable.tsx +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-275] Streaming/paginación del export CSV si una org supera 10k leads
- Fuente: `docs/bitacora-roadmap.md:4699` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: Hoy hay un tope EXPORT_LIMIT = 10.000; streaming con ReadableStream queda en roadmap-pendientes.
- Referencias: src/app/api/dashboard/chatbot/leads/export/route.ts · tambien en docs/bitacora-roadmap.md:4787
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-276] B8.5 — Vista de instalación compartida (snippet + guías)
- Fuente: `docs/bitacora-roadmap.md:5836` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h3.cli-chatbot
- Qué es: Módulo installation/ con buildEmbedSnippet como única fuente del snippet, INSTALL_PLATFORMS y PlatformInstructions; ClientInstallView e InstallTab refactorizados; warning de dominios faltantes también para el cliente.
- Referencias: src/modules/chatbot/components/installation/platforms.ts · src/modules/chatbot/components/installation/SnippetCopyBlock.tsx · src/modules/chatbot/components/installation/PlatformInstructions.tsx · src/modules/chatbot/components/installation/index.ts · src/app/(protected)/dashboard/chatbot/install/ClientInstallView.tsx · src/app/(protected)/admin/chatbots/[botId]/tabs/InstallTab.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-277] Exponer data-theme y data-position en el snippet
- Fuente: `docs/bitacora-roadmap.md:5888` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-25
- Nodo(s): h3.cli-chatbot
- Qué es: El snippet generado hardcodea data-theme dark aunque widget.js soporta light y bottom-left.
- Referencias: src/modules/chatbot/components/installation/platforms.ts · public/widget.js
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-278] B7 — Visual-qa retroactivo de avatares (verificado parcial)
- Fuente: `docs/bitacora-roadmap.md:5909` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h3.cli-chatbot
- Qué es: Los 5 avatares del registry rinden en /dashboard/chatbot/settings, el monograma usa iniciales reales y /embed/develop (desktop y mobile) muestra el avatar persistido; las implementaciones B7.x no tienen entrada en este rango.
- Referencias: AvatarPicker · src/modules/chatbot/components/avatar/AvatarRenderer.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-279] Layout de /dashboard/chatbot/settings comprimido a la izquierda
- Fuente: `docs/bitacora-roadmap.md:5935` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h3.cli-chatbot
- Qué es: A 1280px el contenido ocupa ~40% y el resto queda en blanco; es de la página, no del picker.
- Referencias: src/app/(protected)/dashboard/chatbot/settings/page.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-280] Reactivar 'Insights AI' real en el dashboard del chatbot
- Fuente: `docs/bitacora-roadmap.md:6194` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h3.cli-chatbot
- Qué es: Conectar a getPendingInsightsByOrgSlug con disclaimer de IA; la card placeholder se removió.
- Referencias: docs/roadmap-pendientes.md · src/modules/chatbot/components/dashboard/ChatbotOverview.tsx · tambien en docs/bitacora-roadmap.md:6185
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-281] Sync automática KB ↔ Sanity
- Fuente: `docs/bitacora-roadmap.md:9779` · tipo: idea · estado declarado: sin estado
- Nodo(s): h3.cli-chatbot
- Qué es: La edición de KB la hace develOP; sincronización vía Sanity queda como proyecto futuro.
- Referencias: también en fuente:10040 · también en fuente:10121
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-282] CC.3 KB del cliente solo lectura
- Fuente: `docs/bitacora-roadmap.md:10036` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.cli-chatbot
- Qué es: ClientKnowledgeView sin editables; se borró saveClientKnowledgeBase (escritura desde sesión cliente).
- Referencias: src/modules/chatbot/components/dashboard/ClientKnowledgeView.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-283] Flujo dedicado de solicitud de cambio de KB
- Fuente: `docs/bitacora-roadmap.md:10122` · tipo: idea · estado declarado: sin estado
- Nodo(s): h3.cli-chatbot
- Qué es: Hoy el cliente pide cambios por Mensajes; un flujo con tracking sería sprint propio.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-284] CC.4 preview vivo compartido admin/cliente
- Fuente: `docs/bitacora-roadmap.md:10133` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.cli-chatbot
- Qué es: BotConfigPreview movido a components/preview y usado por ambos lados.
- Referencias: src/modules/chatbot/components/preview/BotConfigPreview.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-285] Emoji picker en quick replies del cliente
- Fuente: `docs/bitacora-roadmap.md:10229` · tipo: idea · estado declarado: sin estado
- Nodo(s): h3.cli-chatbot
- Qué es: El cliente solo edita texto; al editar pierde los emojis del admin.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-286] P0.3 gate de presentación de priorización de leads
- Fuente: `docs/bitacora-roadmap.md:11040` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-29
- Nodo(s): h3.cli-chatbot
- Qué es: planAllows(plan,'leadScoring') en 4 superficies; Starter ve teaser.
- Referencias: src/lib/plan/plan-allows.ts · src/lib/plan/lead-scoring-gate.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-287] Verificación visual del gate de leads Starter vs Business
- Fuente: `docs/bitacora-roadmap.md:11112` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-30
- Nodo(s): h3.cli-chatbot
- Qué es: No montable con el seed; chequear chips/teaser/CSV con leads reales.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-288] P1.B acciones de un tap sobre el lead
- Fuente: `docs/bitacora-roadmap.md:11115` · tipo: hecho-declarado · estado declarado: hecho (checkpoint visual humano) · fecha: 2026-06-30
- Nodo(s): h3.cli-chatbot
- Qué es: Lo contacté/Vendido/No avanzó con deshacer y sellado de firstContactedAt.
- Referencias: src/modules/chatbot/lead-status-rules.ts · src/modules/chatbot/components/dashboard/LeadStatusActions.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-289] P1.D vista de leads unificada
- Fuente: `docs/bitacora-roadmap.md:11225` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30
- Nodo(s): h3.cli-chatbot
- Qué es: Redirect 308 /dashboard/leads y detalle enriquecido (origen, canal, señales Pro+).
- Referencias: src/lib/dashboard/lead-origin.ts · src/modules/chatbot/lead-detail-presentation.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-290] P1-fix correctivos visuales + labels de intent
- Fuente: `docs/bitacora-roadmap.md:11339` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30
- Nodo(s): h3.cli-chatbot
- Qué es: Card entera clickeable, detalle full-width y mapa compartido de intents.
- Referencias: src/modules/chatbot/lead-intent-labels.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-291] P1-fix2 hovers del detalle de lead
- Fuente: `docs/bitacora-roadmap.md:11433` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30
- Nodo(s): h3.cli-chatbot
- Qué es: adminHoverCls en 6 cards del LeadDetail.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-292] Botón 'Exportar CSV' en el dashboard
- Fuente: `docs/bitacora-roadmap.md:11591` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-30
- Nodo(s): h3.cli-chatbot
- Qué es: La route de export existe; falta la UI del botón.
- Referencias: src/app/api/dashboard/chatbot/leads/export/route.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-293] P2.A aviso de lead al cliente por email
- Fuente: `docs/bitacora-roadmap.md:11846` · tipo: hecho-declarado · estado declarado: hecho (checkpoint runtime pendiente)
- Nodo(s): h3.cli-chatbot
- Qué es: Email 'nuevo lead' a todos y 'lead caliente' Pro+ por Brevo, con cap y digest.
- Referencias: src/lib/client-notifications/notify.ts · src/modules/chatbot/server/tools/captureLead.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-294] handoff.callback no aparece en 'Derivaciones recientes'
- Fuente: `docs/bitacora-roadmap.md:15478` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h3.cli-chatbot
- Qué es: listRecentHandoffsByOrgSlug filtra solo handoff.whatsapp; requiere agregar type al shape (chat Panel).
- Referencias: src/modules/chatbot/server/admin/multiTenantQueries.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-295] E1: insights del bot para el dueño
- Fuente: `docs/bitacora-roadmap.md:15704` · tipo: bloque · estado declarado: pendiente (superficie bloqueante)
- Nodo(s): h3.cli-chatbot
- Qué es: Buque insignia del roadmap Plano B: el motor existe y corre solo; falta superficie para el dueño (insights quedan en PENDING).
- Referencias: también en fuente:15779 · también en fuente:16506
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-296] S7-09 ipHash llega al browser del cliente
- Fuente: `docs/bitacora-roadmap.md:16871` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-11
- Nodo(s): h3.cli-chatbot
- Qué es: findMany sin select en el dashboard de conversaciones manda Conversation.ipHash vía RSC.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-297] Cron de retry de CrmSyncAttempt FAILED
- Fuente: `docs/roadmap-pendientes.md:10` · tipo: pendiente · estado declarado: pendiente (postergado) · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: Barrer FAILED cada 24h y reintentar syncLeadToCrm; hoy in-flight + botón Reintentar.
- Referencias: B5.8 · syncLeadToCrm
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-298] Protección DNS rebinding en webhook n8n
- Fuente: `docs/roadmap-pendientes.md:16` · tipo: pendiente · estado declarado: pendiente (carril seguridad Franco) · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: Resolver la IP antes del POST en postToN8n.singlePost y revalidar contra la blacklist (RE-16).
- Referencias: validateWebhookUrl · RE-16 · tambien en :175
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-299] Nota legal de PII en CrmConfigForm
- Fuente: `docs/roadmap-pendientes.md:31` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: Aviso de envío de datos personales a terceros al activar el sync; antes del plan Business comercial.
- Referencias: CrmConfigForm
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-300] Header Idempotency-Key a n8n
- Fuente: `docs/roadmap-pendientes.md:38` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: Mandar Idempotency-Key: leadId para dedupe downstream.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-301] Export CSV de leads por streaming (>10k)
- Fuente: `docs/roadmap-pendientes.md:48` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: Hoy carga hasta 10k en memoria y trunca en silencio; streaming con cursor.
- Referencias: /api/dashboard/chatbot/leads/export
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-302] Export .xlsx y plantillas por CRM
- Fuente: `docs/roadmap-pendientes.md:55` · tipo: idea · estado declarado: postergado · fecha: 2026-05-24
- Nodo(s): h3.cli-chatbot
- Qué es: Excel nativo con formato y CSV por CRM destino; solo si un cliente lo pide.
- Referencias: tambien en :61
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-303] Insights AI reales en ChatbotOverview
- Fuente: `docs/roadmap-pendientes.md:78` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h3.cli-chatbot
- Qué es: Se removió el card placeholder; falta renderizar insights reales.
- Referencias: src/modules/chatbot/components/dashboard/ChatbotOverview.tsx · src/modules/chatbot/server/insights/
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-304] Alpha.0.5 fixes post test manual
- Fuente: `docs/sprints/alpha-0-5-cleanup.md:6` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-17
- Nodo(s): h3.cli-chatbot
- Qué es: Cache en auth/resolveOrgId/isAdminPreview, botones en ChatbotManager, Activity Log 24h, 'Mi Chatbot' en sidebar, ChatbotUpsellLanding, checkClientHasChatbot.
- Referencias: src/modules/chatbot/server/admin/clientHasChatbot.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-305] Más atribución por campaña
- Fuente: `docs/sprints/p4-1-render-utm.md:111` · tipo: idea · estado declarado: fuera de scope
- Nodo(s): h3.cli-chatbot
- Qué es: utmMedium, filtro de leads por campaña, tendencias multi-período, export por campaña y backfill.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-306] Roles en minúscula en LeadDetail
- Fuente: `raiz:lane-LOG.md:146` · tipo: pendiente · estado declarado: pendiente (preexistente)
- Nodo(s): h3.cli-chatbot
- Qué es: Filtra 'user'/'assistant' contra enum en mayúsculas; el transcript cae al fallback.
- Referencias: LeadDetail.tsx:470
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-307] Portal cliente v1.0
- Fuente: `STATUS.md:49` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-21
- Nodo(s): h3.cli-chatbot
- Qué es: Credenciales temporales con cambio forzado, dashboard en formato negocio, leads con polling 30s, email por lead, personalización limitada, snippet, reporte semanal sin opt-in.
- Referencias: tambien en :221
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h3.vis-api-chatbot — API pública del chatbot

#### [PLAN-308] EV: packs verticales (la base de todo)
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:23` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Hoja con ritual completo. Dual-write de señales. EV.2 migra UTM y firstContactedAt. Compuertas humanas en EV.3 (expectativas inmutables) y EV.4 (transcripts).
- Referencias: BLOQUE-EV · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:78 · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:85 · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:65
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-309] UTM.1: captura viva de UTM
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:23#2` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Captura de UTM en el runtime. El panel renderiza después de EV.2.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:17
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-310] E1: loop de gaps de KB (la feature estrella)
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:23#4` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Detecta, agrupa y sugiere mejoras a la KB con aprobación humana. Según el research es la única feature casi única del producto.
- Referencias: E1.1 · E1.2 · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:38 · ver Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:61 (C2.1)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-311] R1: cálculo de ROI en el runtime
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:23#5` · tipo: bloque · estado declarado: bloqueado · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: calculatePotentialValue. Exige MH cerrado; hay que integrarlo a la hoja.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-312] E0: identidad persistente y cierre/timeout de conversación
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:23#8` · tipo: bloque · estado declarado: bloqueado · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Van juntos (endedAt muerto, cuota en isNew). Plano de Fase 3: refinar contra el repo. Bloqueado por la política de retención.
- Referencias: endedAt · isNew · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:40 · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:84
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-313] E2: memoria y refinamiento del historial
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:23#9` · tipo: bloque · estado declarado: bloqueado · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Define qué historial se reenvía; el truncado mínimo va en RB.2. E2.3 bloqueado por la frontera conversación/cuota.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:46 · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:52
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-314] E3: inventario y catálogo
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:23#10` · tipo: bloque · estado declarado: bloqueado · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Bloqueado por la fuente de inventario previa a Sanity (manual, CSV o panel). E3.1 con ultracode.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:53
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-315] E4: vertical salud
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:23#11` · tipo: bloque · estado declarado: bloqueado · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Bloqueado por el análisis de compliance de datos sensibles. E4.1 con ultracode.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:54
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-316] Microsprints E5-E6 (carril rápido)
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:25` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: MS-E6.2 (timeout, primera cuota de la descomposición del handler) y MS-E6.3 (hashes de IP y privacidad).
- Referencias: MICROSPRINTS-E5-E6-hoja-de-corrida.md · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:58 · tambien en Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:46
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-317] Secuencia de verticales: usados, salud, inmobiliarias
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:33` · tipo: decision · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: El motor ya es de autos de facto. Decisión estresada; no reabrir.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-318] Packs verticales en código, no en DB
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:34` · tipo: decision · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Un vertical nuevo es un PR. Hacerlo con DB y UI sería sobreingeniería.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-319] Política de retención de datos del visitante
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:51` · tipo: decision · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Decisión abierta y la más urgente. Bloquea E0 y E2.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-320] Frontera conversación/cuota con memoria
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:52` · tipo: decision · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Abierta: ¿retomar una conversación cuenta como cuota nueva? Bloquea E2.3.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-321] Fuente de inventario previa a Sanity
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:53` · tipo: decision · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Abierta: manual, CSV o panel. Bloquea E3.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-322] Vertical salud y compliance
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:54` · tipo: decision · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Abierta: activar el vertical salud y analizar el manejo de datos sensibles. Bloquea E4.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-323] Hashes de IP y promesa de privacidad
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:58` · tipo: decision · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Abierta. La docstring 'GDPR-friendly' hoy es falsa. Microsprint MS-E6.3 definido.
- Referencias: MS-E6.3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-324] Descartados: no volver a proponer
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:63` · tipo: decision · estado declarado: descartado · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Fine-tuning por cliente, auto-aprendizaje de KB, verificador de 2ª pasada, RAG con embeddings, multi-idioma, Instagram DM, digest saliente por WhatsApp y jobs para quemar cuota.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:62
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-325] Carril de seguridad aparte (Opus)
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:64` · tipo: decision · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: /health info-disclosure y pentest van a un barrido aparte. En los bloques C también va ahí /smoke (P-4).
- Referencias: /health · /smoke · tambien en Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:52 · tambien en Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:21 · tambien en Franco/Bloques a Ejecutar/DASHBOARD/HANDOFF-chatbot-arranque.md:29
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-326] T0.1: gate a /smoke
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:13` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Exigir CRON_SECRET o sesión SUPER_ADMIN, más rate limit. Hoy es el único punto público que gasta LLM sin control.
- Referencias: /smoke · A4.2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-327] MH.2: conversación después del gate y cuota justa
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:24` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: No contar las Conversation en modo degradado. Compensar el cupo cuando el stream muere sin respuesta. Es la pieza sensible; se hace con Opus max.
- Referencias: A1.5 · A1.4 · ver Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:73 (C3.5)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-328] MH.3: contadores consistentes
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:25` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: messageCount real en lugar de +2 fijo. generateInsightsForBot liviano (take:50 con select y count).
- Referencias: generateInsightsForBot · messageCount · A1.9c · A2.1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-329] MH.4: servicio 'Salud del bot'
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:26` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Expone por org y período el % de visitas atendidas, las conversaciones degradadas y el uptime. El render es del panel.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:11
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-330] RB.1: carreras P2002 tratadas como éxito
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:36` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: En getOrCreateConversation, volver a leer en lugar de devolver 500. En capture_lead, devolver alreadyCaptured:true.
- Referencias: getOrCreateConversation · capture_lead · A1.2 · A1.6
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-331] RB.2: techo de historial en el server
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:37` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Truncar a los últimos N turnos en lugar de devolver 400 en el mensaje 51. Se hace con Opus max.
- Referencias: A1.1 · A4.4 · ver Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:44 (C0.2)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-332] RB.3: cierre sin huecos
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:38` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: onFinish transaccional ($transaction sobre mensaje, conversación y cuota) y un mensaje fijo de derivación cuando el modelo responde vacío.
- Referencias: onFinish · A1.3 · A1.7 · ver Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:72 (C3.4)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-333] Unique compuesto (botConfigId, sessionId)
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:45` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Va en el microsprint de sessionId ya definido; es el arreglo de fondo de lo que RB.1 solo tapa.
- Referencias: A1.2 · ver Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:70 (C3.2)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-334] Descomponer handleChatRequest (871 líneas)
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:46` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Pipeline por etapas, sin big-bang. La primera parte la paga MS-E6.2.
- Referencias: handleChatRequest · A5.2 · ver Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:74 (C3.6)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-335] Decay del scoring sobre actividad real
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:47` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Usar lastStatusChangeAt ?? capturedAt. Carril de scoring post-EV; coordina con el panel.
- Referencias: A1.8 · tambien en Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:20
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-336] Constantes de event-types y LEAD_INTENTS unificado
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:49` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Microsprint suelto para cuando se toque esa zona.
- Referencias: LEAD_INTENTS · A5.5 · A5.6
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-337] D-C1: orden de C2
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:12` · tipo: decision · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: Detección de consultas sin responder, luego catálogo, luego memoria. Se puede reordenar.
- Referencias: tambien en Franco/Bloques a Ejecutar/DASHBOARD/HANDOFF-chatbot-arranque.md:23
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-338] D-C2: cap de ~40 turnos
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:13` · tipo: decision · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: Se cumple con degradación digna a WhatsApp y se renuncia al 'ilimitado literal'.
- Referencias: tambien en Franco/Bloques a Ejecutar/DASHBOARD/HANDOFF-chatbot-arranque.md:24
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-339] D-C4: failover a Anthropic descartado
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:15` · tipo: decision · estado declarado: descartado
- Nodo(s): h3.vis-api-chatbot
- Qué es: Doble mantenimiento para un equipo de 2; la degradación a WhatsApp ya cubre el caso.
- Referencias: tambien en Franco/Bloques a Ejecutar/DASHBOARD/HANDOFF-chatbot-arranque.md:26
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-340] Secuencia de los bloques C
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:36` · tipo: decision · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: C0 → C1 → C2 ‖ C3. C3.2 va antes de C2.3; el resto de C3 se hace dejando mejor lo que se toca.
- Referencias: tambien en Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:79 · tambien en Franco/Bloques a Ejecutar/DASHBOARD/HANDOFF-chatbot-arranque.md:34
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-341] C0.1: navigate_to_page fuera de PRO/BUSINESS
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:43` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: Sacar la tool del seed, o restringirla a develOP, hasta que exista allowedNavigationPaths. Evita 404 en el dominio del cliente.
- Referencias: plan.tools · BotConfig.allowedNavigationPaths · C-4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-342] C0.2: que la conversación no muera muda
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:44` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: El widget envía ~30 mensajes y el server recorta con slice(-N) en lugar de rechazar más de 50. El soft-cap de 15 degrada a WhatsApp. Verificar con una conversación real de más de 30 turnos.
- Referencias: C-1 · ver Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:37 (RB.2)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-343] C0.3: un único modelo efectivo
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:45` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: plan.llmModel también va a calculateCost. getModel cae a gemini-2.5-flash con un WARN en lugar de lanzar error. Verificar que el costo registrado no sea 0.
- Referencias: calculateCost · getModel · plan.llmModel · C-5/V-2/D-4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-344] C1.1: nonce estable por conversación
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:52` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: vmsg pasa a HMAC(conversationId, secret) para tener un prefijo cacheable (~75% de descuento en input). Toca el spotlighting.
- Referencias: vmsg · P-3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-345] C1.2: ventana de historial y caps realistas
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:53` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: Reusa la ventana de C0.2. Baja los caps del schema (≤4000 chars, ≤30 items).
- Referencias: P-2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-346] C1.3: cap duro de turnos
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:54` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: A los ~40 turnos responde degradedResponse con CTA a WhatsApp, usando messageCount.
- Referencias: degradedResponse · messageCount
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-347] C1.4: medir el efecto en tokens
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:55` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: Comparar tokensIn y cachedContentTokenCount antes y después. No es opcional.
- Referencias: providerMetadata
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-348] C2.1: detectar consultas sin responder
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:61` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: El bot marca lo que no supo contestar. Alimenta el ciclo D2 de KB. Fue prometido en la propuesta de Matsu.
- Referencias: ver Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:19 (E1)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-349] C2.3: memoria del visitante
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:63` · tipo: bloque · estado declarado: bloqueado
- Nodo(s): h3.vis-api-chatbot
- Qué es: Reconoce a quien ya habló y retoma la conversación. Depende de que C3.2 esté cerrado.
- Referencias: tambien en Franco/Bloques a Ejecutar/DASHBOARD/HANDOFF-chatbot-arranque.md:36
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-350] C3.1: corte del proveedor a mitad del stream
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:69` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: onError en streamText: persistir el evento, no contar el turno y evaluar liberar cupo si falla antes del primer token.
- Referencias: streamText · C-3/V-4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-351] C3.2: sessionId compuesto
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:70` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: Migración aditiva @@unique([botConfigId, sessionId]) y el widget separa la key por slug. Cierra el 500 con dos bots en el mismo origin.
- Referencias: C-2/T-1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-352] C3.4: menos round-trips a la DB
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:72` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: Consolidar el doble rate-limit, que validateOrigin reuse el bot cacheado, paralelizar los writes de onFinish y fusionar getPlanForOrg.
- Referencias: validateOrigin · getPlanForOrg · P-1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-353] C3.5: conversaciones huérfanas
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:73` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: Crear la Conversation después de los gates, o aceptar las filas y contar solo las que tienen mensajes. Decidir y documentar.
- Referencias: C-7
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-354] C3.6: deuda del handler
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:74` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: Extraer persistTurn(), hacer logChatbotEvent realmente fire-and-forget y renombrar checkQuota a readQuotaUsage. Se aplica al tocar el handler.
- Referencias: persistTurn · checkQuota · D-1/D-2/D-3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-355] Endpoints públicos sin rate-limit y guard del primer mensaje
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:159` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-12
- Nodo(s): h3.vis-api-chatbot
- Qué es: 3 endpoints públicos sin rate-limit. Falta un guard en el server que exija que el primer mensaje sea del usuario (defensa en profundidad).
- Referencias: tambien en Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:160 · tambien en Olme/Chatbot_ registro de cambios.md:110
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-356] Sistema de leads consolidado
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:172` · tipo: idea · estado declarado: pendiente · fecha: 2026-06-12
- Nodo(s): h3.vis-api-chatbot
- Qué es: Dedup por dispositivo (deviceId anónimo con captureLead), temperatura = la máxima alcanzada más la recurrencia, y que 'nueva conversación' no borre el lead. Requiere diagnosticar antes el modelo Lead.
- Referencias: captureLead · deviceId
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-357] B1.3 — Instrumentación de latencia del bot por etapa
- Fuente: `docs/bitacora-roadmap.md:385` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: mark() por etapa y TTFB de Vertex vía onChunk; metadata.timings y alias metadata.latencyMs en chat.message_completed. Veredicto: ~85% del tiempo es Vertex.
- Referencias: src/modules/chatbot/server/chat/handleChatRequest.ts · scripts/_b13-latency-test.mjs · scripts/_b13-latency-analyze.mjs
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-358] Palancas para optimizar Vertex
- Fuente: `docs/bitacora-roadmap.md:494` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Por ROI: gemini-2.5-flash-lite, recortar el system prompt, prompt caching, paralelizar el post-persist y cache Redis de resolveBotBySlug; no aplicar sin decisión explícita.
- Referencias: google.ts:10-41 · src/modules/chatbot/server/prompts/buildSystemPrompt.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-359] Medir latencia del bot contra prod (Netlify + Neon main)
- Fuente: `docs/bitacora-roadmap.md:531` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Las cifras son de dev; falta una corrida contra la URL deployada (B13_BASE_URL) para el delta dev-prod; decisión de Franco.
- Referencias: scripts/_b13-latency-test.mjs · tambien en docs/bitacora-roadmap.md:536 · tambien en docs/bitacora-roadmap.md:660
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-360] B1.4 — Verificación de las 4 optimizaciones R2
- Fuente: `docs/bitacora-roadmap.md:539` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Rate-limit por sessionId, sin findFirst duplicado, Promise.all pre-LLM y cache in-memory de resolveBotBySlug confirmados y medidos; detectó invalidateBotCache sin callers.
- Referencias: src/modules/chatbot/server/chat/handleChatRequest.ts:123 · src/app/api/chatbot/[slug]/chat/route.ts:77 · src/modules/chatbot/server/conversation/resolver.ts:10-99
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-361] Optimizaciones de Vertex se evalúan con N>=3 corridas
- Fuente: `docs/bitacora-roadmap.md:623` · tipo: decision · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Vertex es no determinista entre corridas (TTFB p50 entre 2.3s y 5.8s); toda medición debe repetirse espaciada en el día.
- Referencias: tambien en docs/bitacora-roadmap.md:685 · tambien en docs/bitacora-roadmap.md:692
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-362] No migrar el cache del bot a Redis/Upstash todavía
- Fuente: `docs/bitacora-roadmap.md:629` · tipo: decision · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Re-evaluar si el tráfico supera ~10 req/min, entra un segundo cliente al chatbot o Netlify escala a varias instancias; el caveat de cache por instancia sin invalidación cruzada sigue abierto (aplica también a getPlanForOrg).
- Referencias: src/modules/chatbot/server/conversation/resolver.ts · src/lib/plan/get-plan-for-org.ts · tambien en docs/bitacora-roadmap.md:643 · tambien en docs/bitacora-roadmap.md:782 · tambien en docs/bitacora-roadmap.md:2299
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-363] Documentar el caveat del cache in-memory del bot
- Fuente: `docs/bitacora-roadmap.md:642` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Dejar documentado en CLAUDE.md o en un README del módulo chatbot que el cache es por instancia.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-364] B3.1 — Mapa del system prompt (sin cambios de código)
- Fuente: `docs/bitacora-roadmap.md:957` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: 9 secciones más un bloque #10 de intent inyectado en handleChatRequest; ~4.500 tokens para develOP; redundancias R1-R7 con ~750-970 tokens recuperables.
- Referencias: src/modules/chatbot/server/prompts/buildSystemPrompt.ts · src/modules/chatbot/server/prompts/sections.ts · src/modules/chatbot/server/chat/handleChatRequest.ts:276-278
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-365] navigate_to_page con 8 rutas hardcodeadas
- Fuente: `docs/bitacora-roadmap.md:1032` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: TODO en el archivo: las rutas deberían venir de BotConfig.allowedNavigationPaths (Phase 1.5).
- Referencias: src/modules/chatbot/server/tools/navigateToPage.ts:37-51 · tambien en docs/bitacora-roadmap.md:1072
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-366] Decidir si el bloque #10 (intent guidance) se centraliza en buildSystemPrompt
- Fuente: `docs/bitacora-roadmap.md:1070` · tipo: decision · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Hoy se appendea en handleChatRequest fuera del builder; decisión arquitectural abierta, B3.3 lo dejó intacto.
- Referencias: src/modules/chatbot/server/chat/handleChatRequest.ts:276-278 · src/modules/chatbot/server/intent/detectIntent.ts · tambien en docs/bitacora-roadmap.md:1085 · tambien en docs/bitacora-roadmap.md:1347
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-367] B3.2 — Shell de Matsu + batería de regresión + baseline
- Fuente: `docs/bitacora-roadmap.md:1091` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Seed idempotente de Matsu (org, usuario ORG_MEMBER, bot Aki, KB concesionaria con scaffolding), batería scripts/regression con 8 casos y purga por prefijo regression-test-, baseline capturado.
- Referencias: rama feat/b3.2-matsu-baseline · scripts/seed-matsu.ts · scripts/regression/cases.ts · scripts/regression/run-baseline.ts · scripts/regression/purge.ts · docs/regression/baseline-2026-05-22T22-00-07-164Z.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-368] Loreteo: el bot copia frases literales de los ejemplos del prompt (H4)
- Fuente: `docs/bitacora-roadmap.md:1179` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Persiste tras B3.3 y B3.5 (cambia de frase); la nota 'variá las palabras' no alcanza con Gemini 2.5 Flash; erradicarlo requiere A/B sin ejemplos concretos.
- Referencias: src/modules/chatbot/server/prompts/sections.ts · tambien en docs/bitacora-roadmap.md:1221 · tambien en docs/bitacora-roadmap.md:1335 · tambien en docs/bitacora-roadmap.md:1368 · tambien en docs/bitacora-roadmap.md:1377 · tambien en docs/bitacora-roadmap.md:1514
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-369] Lectura comercial de los baselines por Franco
- Fuente: `docs/bitacora-roadmap.md:1218` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Leer con ojo comercial los transcripts de cada baseline (B3.2, B3.3, B3.6, MS-1) y marcar respuestas mal vendidas o robóticas.
- Referencias: docs/regression/baseline-2026-05-22T22-00-07-164Z.md · tambien en docs/bitacora-roadmap.md:1229 · tambien en docs/bitacora-roadmap.md:1374 · tambien en docs/bitacora-roadmap.md:1384 · tambien en docs/bitacora-roadmap.md:1680 · tambien en docs/bitacora-roadmap.md:1954 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-370] La batería de regresión es gate de merge del bot
- Fuente: `docs/bitacora-roadmap.md:1223` · tipo: decision · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Antes de mergear cambios al bot se corre la batería y se compara con el baseline; si un caso degrada (precio inventado, jailbreak, lead no capturado) no se mergea. Desde MS-4: smoke durante el sprint y full antes de cerrarlo.
- Referencias: scripts/regression/run-baseline.ts · tambien en docs/bitacora-roadmap.md:3664
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-371] B3.3 — Poda del prompt (-19% tokens) + refuerzos
- Fuente: `docs/bitacora-roadmap.md:1233` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Aplicadas las redundancias R1-R7, regla maestra anti-alucinación, subbloque off-topic y nota anti-loreteo; batería 8/8 sin error técnico.
- Referencias: src/modules/chatbot/server/prompts/sections.ts · docs/regression/baseline-2026-05-22T22-19-20-185Z.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-372] Reglas anti-alucinación irreductibles en la Sección 6
- Fuente: `docs/bitacora-roadmap.md:1268` · tipo: decision · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Regla maestra + no inventar rol + no contradecir la KB + no prometer acciones imposibles + lenguaje no absoluto; se mantienen aunque el cliente deje forbiddenStatements vacío.
- Referencias: src/modules/chatbot/server/prompts/sections.ts · decisión pedida en docs/bitacora-roadmap.md:1084
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-373] Reforzar la 'pregunta de cierre' (Sección 2) debilitada por la poda
- Fuente: `docs/bitacora-roadmap.md:1334` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: El caso financiacion perdió la pregunta abierta de cierre; reforzar la línea en la Sección 2 (+20 chars).
- Referencias: src/modules/chatbot/server/prompts/sections.ts · tambien en docs/bitacora-roadmap.md:1375
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-374] B3.5 — capture_lead persiste email y teléfono juntos
- Fuente: `docs/bitacora-roadmap.md:1388` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Schema de la tool con phone?/email? y refine 'al menos uno'; el handler persiste ambos canales y loguea channels[]; caso de regresión lead-capture-both-channels.
- Referencias: src/modules/chatbot/server/tools/captureLead.ts · src/modules/chatbot/server/prompts/sections.ts · scripts/regression/cases.ts · docs/regression/baseline-2026-05-22T22-38-03-073Z.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-375] B3.6 — Handoff WhatsApp proactivo con payload rico
- Fuente: `docs/bitacora-roadmap.md:1523` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: show_whatsapp_handoff con intent enum, topicSummary, purchaseSignals y visitorContact; metadata rica en el evento y Telegram solo si no hubo capture_lead previo; triggers comerciales en la description y la Sección 4.
- Referencias: src/modules/chatbot/server/tools/showWhatsappHandoff.ts · src/modules/chatbot/server/prompts/sections.ts · scripts/regression/cases.ts · docs/regression/baseline-2026-05-22T22-49-06-262Z.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-376] Máximo 1 handoff por conversación: se controla desde el prompt
- Fuente: `docs/bitacora-roadmap.md:1667` · tipo: decision · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: No hay enforce duro en el handler; si el visitante vuelve a pedirlo el modelo puede repetir la card.
- Referencias: src/modules/chatbot/server/tools/showWhatsappHandoff.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-377] Decidir el volumen de Telegrams por handoff directo
- Fuente: `docs/bitacora-roadmap.md:1672` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Opciones: desactivar el push de handoff o limitarlo a intents purchase_ready/schedule_visit (~3 líneas en el handler).
- Referencias: src/modules/chatbot/server/tools/showWhatsappHandoff.ts · tambien en docs/bitacora-roadmap.md:1681
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-378] Regla 'sin signos de exclamación': ¿absoluta o con excepción en señales de compra?
- Fuente: `docs/bitacora-roadmap.md:1674` · tipo: decision · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Decisión de producto abierta; si es estricta hay que endurecer la Sección 5.
- Referencias: src/modules/chatbot/server/prompts/sections.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-379] MS-1 — Multi-step: capture_lead con texto + encadenado de offer_handoff_options
- Fuente: `docs/bitacora-roadmap.md:1819` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: stopWhen: stepCountIs(3) en streamText; toolCalls y usage agregados desde steps[] (cost-correctness); timings.step_count. Resuelve H2 y H3; show_whatsapp_handoff sin texto previo se acepta como UX.
- Referencias: src/modules/chatbot/server/chat/handleChatRequest.ts · scripts/regression/cases.ts · docs/regression/baseline-2026-05-22T23-18-15-111Z.md · pendiente originado en docs/bitacora-roadmap.md:1175 · pendiente originado en docs/bitacora-roadmap.md:1177 · pendiente originado en docs/bitacora-roadmap.md:1219 +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-380] Respuesta determinística post-capture_lead para ahorrar ~1s
- Fuente: `docs/bitacora-roadmap.md:1961` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-22
- Nodo(s): h3.vis-api-chatbot
- Qué es: Alternativa al step extra de Vertex (texto fijo en el toolResult); fallback de bajar a stepCountIs(2) si Vertex se vuelve lento.
- Referencias: tambien en docs/bitacora-roadmap.md:1967
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-381] B4.2 — Server gating de las 7 dimensiones del plan
- Fuente: `docs/bitacora-roadmap.md:2146` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: getPlanForOrg con cache 60s (nunca null), tryReserveConversation con UPDATE condicional atómico, planAllows, filtro de tools por plan, modelo LLM del plan, cap defensivo de dominios y respuesta degradada JSON sin llamar a Vertex.
- Referencias: src/lib/plan/fallback.ts · src/lib/plan/get-plan-for-org.ts · src/lib/plan/plan-allows.ts · src/lib/plan/index.ts · src/lib/security/origin-matcher.ts · src/modules/chatbot/server/quota/checker.ts +4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-382] Criterio PASS de lead-capture-chain según el plan
- Fuente: `docs/bitacora-roadmap.md:2294` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Con Starter el modelo deriva por WhatsApp (no tiene offer_handoff_options); el caso debería aceptar ambas rutas.
- Referencias: scripts/regression/cases.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-383] B4.5 — Modo degradado sin Gemini + alerta upsell + soft-cap
- Fuente: `docs/bitacora-roadmap.md:2638` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: degradedResponse con reason y datos de WhatsApp sin tocar Vertex, triggerUpsellAlertIfFirst atómico vía QuotaUsage.degradedAt (1 alerta por bot y mes), soft-cap de 15 turnos en el prompt, casos quota-exhausted y long-session-soft-cap con setup/teardown en la batería.
- Referencias: src/modules/chatbot/server/quota/upsellAlert.ts · src/modules/chatbot/server/quota/index.ts · src/modules/chatbot/server/prompts/types.ts · src/modules/chatbot/server/prompts/sections.ts · src/modules/chatbot/server/chat/handleChatRequest.ts · scripts/regression/cases.ts +5
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-384] Soft-cap como sugerencia del prompt, no corte del server
- Fuente: `docs/bitacora-roadmap.md:2692` · tipo: decision · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Desde 15 turnos del visitante el prompt sugiere derivar al humano; el modelo decide entre texto o show_whatsapp_handoff.
- Referencias: src/modules/chatbot/server/prompts/sections.ts · tambien en docs/bitacora-roadmap.md:2776
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-385] Test de carga del atomic reserve de cuota
- Fuente: `docs/bitacora-roadmap.md:2789` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Simular ~5000 conversaciones concurrentes contra un bot Business; no bloqueante.
- Referencias: src/modules/chatbot/server/quota/checker.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-386] B5.1 — Señales estructuradas en capture_lead
- Fuente: `docs/bitacora-roadmap.md:3196` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Migración aditiva b51 (category, 4 flags booleanos, providedPhone/Email, channel, score, classification, scoreSignals e índices); capture_lead con LEAD_INTENTS/LEAD_CATEGORIES y regla anti-inflado; providedPhone/Email derivados del input.
- Referencias: prisma/migrations/20260523183030_b51_add_lead_signals_and_scoring/migration.sql · prisma/schema.prisma · src/modules/chatbot/server/tools/captureLead.ts · scripts/regression/cases.ts · scripts/regression/run-baseline.ts · docs/regression/baseline-2026-05-23T18-33-48-648Z.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-387] intent queda String en DB con vocabulario unificado vía Zod
- Fuente: `docs/bitacora-roadmap.md:3207` · tipo: decision · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Para no romper rows legacy (quote/info/demo); luego B11.4 lo convirtió en enum con la unión de valores nuevos y legacy.
- Referencias: src/modules/chatbot/server/tools/captureLead.ts · tambien en docs/bitacora-roadmap.md:3324 · tambien en docs/bitacora-roadmap.md:6852
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-388] ChatbotLead.channel reservado sin uso
- Fuente: `docs/bitacora-roadmap.md:3243` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Campo agregado en B5.1 para canales futuros; queda null en todos los leads.
- Referencias: prisma/schema.prisma · tambien en docs/bitacora-roadmap.md:3328 · tambien en docs/bitacora-roadmap.md:3339
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-389] Mostrar señales y score del lead en el Telegram de capture_lead
- Fuente: `docs/bitacora-roadmap.md:3320` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Microsprint (<30 min) a la espera del OK de Franco; tocar notifyClient().
- Referencias: src/modules/chatbot/server/tools/captureLead.ts · tambien en docs/bitacora-roadmap.md:3335 · tambien en docs/bitacora-roadmap.md:3523
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-390] B5.3 — DQ activo sobre category distinta de sales (sin entrada propia)
- Fuente: `docs/bitacora-roadmap.md:3348` · tipo: bloque · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Planeado tras B5.2; no tiene entrada en la bitácora pero B5.4 lo da por hecho (dqFilter.ts, penalties, DQ_CATEGORY_LABELS, scripts/_b53-test-scoring.ts).
- Referencias: dqFilter.ts · scripts/_b53-test-scoring.ts · tambien en docs/bitacora-roadmap.md:3532 · tambien en docs/bitacora-roadmap.md:3776 · tambien en docs/bitacora-roadmap.md:3790
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-391] B5.2 — Motor de scoring heurístico server-side
- Fuente: `docs/bitacora-roadmap.md:3353` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: calculateLeadScore puro: cita 40, financiación 25, usado 20, modelo 10, teléfono 5; hot >=70, warm >=40; score, classification y scoreSignals persistidos en el create del lead, sin LLM; test unit 22/22.
- Referencias: src/modules/chatbot/server/scoring/calculateLeadScore.ts · src/modules/chatbot/server/scoring/index.ts · src/modules/chatbot/server/tools/captureLead.ts · scripts/_b52-test-scoring.ts · scripts/regression/run-baseline.ts · docs/regression/baseline-2026-05-23T19-42-43-822Z.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-392] recalculateLeadScore para re-puntuar leads que vuelven
- Fuente: `docs/bitacora-roadmap.md:3516` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Hoy el score se calcula solo al capturar; si un lead vuelve con nuevas señales no se recalcula.
- Referencias: tambien en docs/bitacora-roadmap.md:3520
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-393] MS-4 — Batería usable: smoke set + retry de 'terminated'
- Fuente: `docs/bitacora-roadmap.md:3537` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Flag --smoke con 4 casos críticos (smoke: true en cases.ts), DIRECT_URL opcional en el runner, retry único ante 'terminated' sin enmascarar asserts, diag-timings promovido a tooling; long-session-soft-cap se mantiene en 16 turnos.
- Referencias: scripts/regression/cases.ts · scripts/regression/run-baseline.ts · scripts/regression/diag-timings.ts · docs/regression/smoke-2026-05-23T21-19-30-029Z.md · docs/regression/baseline-2026-05-23T21-20-32-446Z.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-394] MS-5 — Paralelización de la batería + recorte de sleeps + rate-limit
- Fuente: `docs/bitacora-roadmap.md:3665` · tipo: bloque · estado declarado: bloqueado · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Bloqueado hasta que DIRECT_URL baje los 'terminated'; paralelizar sin eso empeora el pool.
- Referencias: tambien en docs/bitacora-roadmap.md:3539 · tambien en docs/bitacora-roadmap.md:3649 · tambien en docs/bitacora-roadmap.md:3677
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-395] B5.4 — Decay temporal, combos y explicabilidad del score
- Fuente: `docs/bitacora-roadmap.md:3681` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: DECAY_CURVE escalonada (1.00 a 0.30) aplicada en lectura sobre capturedAt, combos tradeIn+financing (+10) y modelo+cita (+5), getEffectiveScore y getScoreExplanation, labels en lenguaje PyME; 50+ asserts.
- Referencias: src/modules/chatbot/server/scoring/calculateLeadScore.ts · src/modules/chatbot/server/scoring/index.ts · scripts/_b54-test-scoring.ts · scripts/_b53-test-scoring.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-396] ChatbotLead.lastUserMessageAt si se habilita re-engagement
- Fuente: `docs/bitacora-roadmap.md:3807` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: El decay usa capturedAt como última actividad; si el bot vuelve a hablar con leads capturados (B7+) hace falta otra referencia.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-397] Calibrar la curva de decay con datos reales
- Fuente: `docs/bitacora-roadmap.md:3808` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h3.vis-api-chatbot
- Qué es: Heurística inicial; recalibrar con 200+ leads en producción midiendo conversión por tramo de edad.
- Referencias: src/modules/chatbot/server/scoring/calculateLeadScore.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-398] B11.4 — 5 campos string a enum del módulo chatbot
- Fuente: `docs/bitacora-roadmap.md:6833` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h3.vis-api-chatbot
- Qué es: Enums ChatMessageRole, ChatbotLeadIntent (nuevos + legacy), ChatbotEventLevel, BotIntensityLevel y LlmProvider; migración en dos fases con backfill a mayúsculas sin pérdida; 21 call-sites en 12 archivos.
- Referencias: prisma/migrations/20260525190000_b11_4a_create_enum_types/migration.sql · prisma/migrations/20260525190100_b11_4b_promote_columns_to_enum/migration.sql · src/modules/chatbot/server/logging/persistentLogger.ts · src/modules/chatbot/server/admin/saveBotConfig.ts · src/modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts · src/modules/chatbot/server/tools/captureLead.ts +14
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-399] SEC-LLM-01/02/03: prompt injection y PII hacia Vertex
- Fuente: `docs/bitacora-roadmap.md:8140` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: Endurecer el prompt contra injection y anonimizar la PII enviada al LLM.
- Referencias: docs/auditoria-seguridad-2026-05.md · tambien en docs/bitacora-roadmap.md:7963 · tambien en docs/bitacora-roadmap.md:8319
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-400] Consolidar el doble rate-limit del chat
- Fuente: `docs/bitacora-roadmap.md:9439` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h3.vis-api-chatbot
- Qué es: chatbotPerSession (route) y chatbotPerBotSession (handler) corren en serie; decidir clave única.
- Referencias: src/app/api/chatbot/[slug]/chat/route.ts · también en fuente:16670
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-401] Rate-limit en endpoints públicos config/health
- Fuente: `docs/bitacora-roadmap.md:9440` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h3.vis-api-chatbot
- Qué es: config, health y smoke sin rate-limit (smoke luego deprecado en 17070); defensa en profundidad.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-402] EV.4 intents desde pack vertical
- Fuente: `docs/bitacora-roadmap.md:10806` · tipo: hecho-declarado · estado declarado: hecho (smoke gated) · fecha: 2026-06-30
- Nodo(s): h3.vis-api-chatbot
- Qué es: Pack agencia con intents verbatim y usados con 7 intents de concesionaria; detectIntent puro.
- Referencias: src/modules/chatbot/server/verticals/packs/agencia.ts · src/modules/chatbot/server/verticals/packs/usados.ts · scripts/ev4-smoke.mjs
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-403] Smoke y 7 transcripts de EV.4
- Fuente: `docs/bitacora-roadmap.md:10843` · tipo: pendiente · estado declarado: bloqueado · fecha: 2026-06-30
- Nodo(s): h3.vis-api-chatbot
- Qué es: No corridos: server caído y bots con verticalPack 'base'.
- Referencias: docs/ev4-transcripts/README.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-404] Compuerta: EV.5 tras revisión de transcripts por Franco
- Fuente: `docs/bitacora-roadmap.md:10858` · tipo: decision · estado declarado: pendiente · fecha: 2026-06-30
- Nodo(s): h3.vis-api-chatbot
- Qué es: EV.5 no debía arrancar hasta que Franco leyera los transcripts y avalara el vocabulario de intents usados.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-405] EV.3 scoring desde pack con paridad 208/208
- Fuente: `docs/bitacora-roadmap.md:10862` · tipo: hecho-declarado · estado declarado: hecho (gate de despliegue abierto) · fecha: 2026-06-29
- Nodo(s): h3.vis-api-chatbot
- Qué es: calculateLeadScore lee el pack; dual-write de ChatbotLead.signals.
- Referencias: src/modules/chatbot/server/scoring/calculateLeadScore.ts · src/modules/chatbot/server/tools/captureLead.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-406] Backfill de BotConfig.verticalPack
- Fuente: `docs/bitacora-roadmap.md:10918` · tipo: pendiente · estado declarado: pendiente (script listo en D.1) · fecha: 2026-06-29
- Nodo(s): h3.vis-api-chatbot
- Qué es: develop→agencia, sanmiguel/matsu→usados antes de prod; D.1 creó el script pero la corrida es manual de Valentino.
- Referencias: prisma/seeds/backfill-vertical-pack.ts · también en fuente:10847 · también en fuente:10928 · también en fuente:11541 · también en fuente:15616
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-407] EV.1 contrato VerticalPack + registry + pack base
- Fuente: `docs/bitacora-roadmap.md:10932` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-28
- Nodo(s): h3.vis-api-chatbot
- Qué es: Módulo verticals/ sin cambio de runtime.
- Referencias: src/modules/chatbot/server/verticals/types.ts · src/modules/chatbot/server/verticals/registry.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-408] providedEmail ausente de LeadSignals
- Fuente: `docs/bitacora-roadmap.md:10990` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-28
- Nodo(s): h3.vis-api-chatbot
- Qué es: El motor no puntúa providedEmail; EV.2 debía añadirlo.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-409] Override de descripciones de tools con sesgo automotriz
- Fuente: `docs/bitacora-roadmap.md:10991` · tipo: idea · estado declarado: sin estado · fecha: 2026-06-28
- Nodo(s): h3.vis-api-chatbot
- Qué es: CAPTURE_LEAD_DESCRIPTION y handoff mencionan test drive; agregar override por pack; pack 'concesionaria' futuro.
- Referencias: también en fuente:10993
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-410] EV.5 tool copy por pack + payload n8n v2 + CSV
- Fuente: `docs/bitacora-roadmap.md:11465` · tipo: hecho-declarado · estado declarado: hecho (sin commitear al cierre) · fecha: 2026-06-30
- Nodo(s): h3.vis-api-chatbot
- Qué es: Copy de tools desde el pack, payload superset v2 y columnas de pack/señales en el CSV.
- Referencias: src/modules/chatbot/server/crm/buildLeadPayload.ts · src/modules/chatbot/server/leads/csv/buildLeadsCsv.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-411] Smoke de EV.5 (agencia y usados)
- Fuente: `docs/bitacora-roadmap.md:11536` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-30
- Nodo(s): h3.vis-api-chatbot
- Qué es: Franco corre el smoke agencia y lee transcripts; el de usados requiere bot sanmiguel inexistente en DB.
- Referencias: scripts/ev5-smoke.mjs · también en fuente:11589
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-412] Cierre del bloque EV
- Fuente: `docs/bitacora-roadmap.md:11564` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30
- Nodo(s): h3.vis-api-chatbot
- Qué es: Motor comercial vertical del chatbot (EV.1-EV.5).
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-413] UTM.1 atribución first-touch
- Fuente: `docs/bitacora-roadmap.md:12672` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-04
- Nodo(s): h3.vis-api-chatbot
- Qué es: UTM en Conversation (migración aditiva) heredados por el lead; widget.js manda referrer.
- Referencias: utm1_add_conversation_utm_fields · src/modules/chatbot/shared/attribution.ts · public/widget.js · docs/sprints/utm-1-captura.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-414] C3.2 sessionId único compuesto por bot
- Fuente: `docs/bitacora-roadmap.md:12755` · tipo: pendiente · estado declarado: pendiente (gated Franco + DB reconciliada) · fecha: 2026-07-04
- Nodo(s): h3.vis-api-chatbot
- Qué es: Conversation.sessionId @unique global; @@unique([botConfigId, sessionId]) + create atómico y clave de idempotencia por turno requieren migración.
- Referencias: también en fuente:13150 · también en fuente:14093 · también en fuente:16922 · también en fuente:17001
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-415] Q1.1 corredor de conversaciones doradas
- Fuente: `docs/bitacora-roadmap.md:12843` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: 36 escenarios contra bots QA reales con captura; faltan corridas en vivo de usados/agencia.
- Referencias: src/modules/chatbot/evals/ · docs/sprints/q1-1-harness.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-416] Q1.2 evaluación con asserts duros + juez LLM
- Fuente: `docs/bitacora-roadmap.md:12904` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: evals:score con asserts determinísticos y juez Opus para tono.
- Referencias: src/modules/chatbot/evals/scoring/ · docs/sprints/q1-2-scoring.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-417] Correr el juez de evals con ANTHROPIC_API_KEY
- Fuente: `docs/bitacora-roadmap.md:12951` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: Sin la key el juez perceptual se omite.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-418] mustNotClaim semántico y ajuste de expectedIntent
- Fuente: `docs/bitacora-roadmap.md:12959` · tipo: idea · estado declarado: sin estado · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: mustNotClaim es substring; decidir si se ajustan escenarios o patrones del pack por fails de intent.
- Referencias: también en fuente:12961
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-419] Q1.1-fix timeout de readback del harness
- Fuente: `docs/bitacora-roadmap.md:12967` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: Timeout 10s y continue en vez de abortar el escenario.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-420] INFRA.1 rastro off-Neon de fallas de persistencia
- Fuente: `docs/bitacora-roadmap.md:13021` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: logPersistFailure a stderr con .code/.cause y onError en streamText.
- Referencias: src/modules/chatbot/server/logging/logger.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-421] console.error en texto plano en captureLead
- Fuente: `docs/bitacora-roadmap.md:13083` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: notifyClient y syncLeadToCrm loguean sin estructura; follow-up barato.
- Referencias: src/modules/chatbot/server/tools/captureLead.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-422] COST-1 modelo/provider efectivo unificado
- Fuente: `docs/bitacora-roadmap.md:13155` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-07
- Nodo(s): h3.vis-api-chatbot
- Qué es: resolveEffectiveModel para ejecución y costo; WARN chat.cost_model_unknown.
- Referencias: src/modules/chatbot/server/llm/resolveEffectiveModel.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-423] Verificar costos reales en prod
- Fuente: `docs/bitacora-roadmap.md:13249` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-07
- Nodo(s): h3.vis-api-chatbot
- Qué es: SELECT comparativo de costo vs modelo del plan y volumen de chat.cost_model_unknown.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-424] CO-9 unificar el default de modelo (×7)
- Fuente: `docs/bitacora-roadmap.md:13259` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-07
- Nodo(s): h3.vis-api-chatbot
- Qué es: Default de modelo repetido en 7 lugares; no tocado.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-425] C0.2 conversación larga sin muerte muda
- Fuente: `docs/bitacora-roadmap.md:13387` · tipo: hecho-declarado · estado declarado: hecho (verificación humana pendiente) · fecha: 2026-07-10
- Nodo(s): h3.vis-api-chatbot
- Qué es: historyPolicy compartida, recorte server, ventana del widget y hard-cap con degradación a WhatsApp.
- Referencias: src/modules/chatbot/shared/historyPolicy.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-426] E2 historial autoritativo desde ChatMessage
- Fuente: `docs/bitacora-roadmap.md:13491` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-10
- Nodo(s): h3.vis-api-chatbot
- Qué es: El server sigue confiando en la ventana del cliente; también corregiría el drift de messageCount de turnos mudos.
- Referencias: también en fuente:16503
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-427] COST-2 breakdown de costo sin $0 silencioso
- Fuente: `docs/bitacora-roadmap.md:13630` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-11
- Nodo(s): h3.vis-api-chatbot
- Qué es: costs.ts conserva el total autoritativo y la clave del Record se deriva de .id.
- Referencias: src/modules/chatbot/server/pricing/costs.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-428] getModel real de Anthropic/OpenAI
- Fuente: `docs/bitacora-roadmap.md:13673` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-11
- Nodo(s): h3.vis-api-chatbot
- Qué es: Hoy son stubs; al implementarlos deben validar contra la misma tabla de precios.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-429] Re-verificar archivos agrupados por COST-1
- Fuente: `docs/bitacora-roadmap.md:13799` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-11
- Nodo(s): h3.vis-api-chatbot
- Qué es: test-prompt, generateInsights, health/smokeTest y executive-brief no se re-verificaron tras la nota falsa.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-430] ONF-1 reconcile transaccional del onFinish
- Fuente: `docs/bitacora-roadmap.md:13953` · tipo: hecho-declarado · estado declarado: hecho (no verificado bajo carga) · fecha: 2026-07-14
- Nodo(s): h3.vis-api-chatbot
- Qué es: Writes del turno en $transaction, compensación de cupo y fallback de respuesta vacía.
- Referencias: src/modules/chatbot/server/chat/reconcile.ts · 644b2b7
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-431] Test de carga y review completo de ONF-1
- Fuente: `docs/bitacora-roadmap.md:14126` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-14
- Nodo(s): h3.vis-api-chatbot
- Qué es: Carga concurrente en el último cupo, re-verificar aislamiento y corte a 10s; el review adversarial quedó incompleto.
- Referencias: tests/integration/chatbot-isolation.spec.ts · también en fuente:14071
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-432] DEADLINE-ONFINISH techo de tiempo en onFinish
- Fuente: `docs/bitacora-roadmap.md:14238` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: withDeadline y presupuesto por fase; telemetría chat.onfinish_phases.
- Referencias: src/modules/chatbot/server/chat/withDeadline.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-433] Cupo y costo de turnos abandonados o abortados
- Fuente: `docs/bitacora-roadmap.md:14334` · tipo: decision · estado declarado: pendiente (decisión Valentino/Franco)
- Nodo(s): h3.vis-api-chatbot
- Qué es: El cupo queda cobrado y los turnos por abort registran tokens/costo 0; compensar es decisión comercial pendiente.
- Referencias: también en fuente:14584
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-434] STREAM-TIMEOUT fase 1 (chunkMs)
- Fuente: `docs/bitacora-roadmap.md:14370` · tipo: hecho-declarado · estado declarado: hecho (revertido después)
- Nodo(s): h3.vis-api-chatbot
- Qué es: timeout chunkMs 5000 en streamText; luego removido en MUDEZ.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-435] Promesas detached de captureLead
- Fuente: `docs/bitacora-roadmap.md:14395` · tipo: pendiente · estado declarado: aceptado sin outbox (17138)
- Nodo(s): h3.vis-api-chatbot
- Qué es: notifyClient y syncLeadToCrm corren carrera contra el freeze de la lambda (captureLead.ts:467,474).
- Referencias: también en fuente:15605 · también en fuente:15791 · también en fuente:17138
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-436] STREAM-TIMEOUT fase 2 (stepMs + persistTurn)
- Fuente: `docs/bitacora-roadmap.md:14470` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: persistTurn idempotente invocable desde onFinish u onAbort; stepMs luego removido.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-437] WATCHDOG cierre del stream desde el borde
- Fuente: `docs/bitacora-roadmap.md:14609` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: streamWatchdog.ts cierra el body tras silencio y persiste el turno.
- Referencias: src/modules/chatbot/server/chat/streamWatchdog.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-438] WATCHDOG-2 dos ventanas + suspensión durante tools
- Fuente: `docs/bitacora-roadmap.md:14735` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: Ventana inicial larga, corta entre chunks y suspensión por contador de tools.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-439] WATCHDOG-3 ventana por step
- Fuente: `docs/bitacora-roadmap.md:14861` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: beginStep() rearma la ventana inicial en cada step.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-440] Peor caso de tool colgado + step 2 lento supera 30s
- Fuente: `docs/bitacora-roadmap.md:14929` · tipo: pendiente · estado declarado: sin estado
- Nodo(s): h3.vis-api-chatbot
- Qué es: Revisar STREAM_WATCHDOG_TOOL_MAX_MS si aparece en producción.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-441] PROVIDER-CLOSE middleware que cierra el stream del provider
- Fuente: `docs/bitacora-roadmap.md:14967` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: providerStreamClose.ts; el watchdog del borde pasa a red de seguridad.
- Referencias: src/modules/chatbot/server/llm/providerStreamClose.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-442] DEADLOCK-FINISH-STEP
- Fuente: `docs/bitacora-roadmap.md:15113` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: El transform de fallback retenía finish-step y trababa el pipeline; ahora decide en el chunk finish.
- Referencias: src/modules/chatbot/server/chat/reconcile.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-443] WATCHDOG-4 ventana decidida por contenido
- Fuente: `docs/bitacora-roadmap.md:15235` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: markContent() desde onChunk; el frame start ya no colapsa la ventana inicial.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-444] CONTACT-PATH tool confirm_contact_request
- Fuente: `docs/bitacora-roadmap.md:15344` · tipo: hecho-declarado · estado declarado: hecho (requiere paso manual en prod)
- Nodo(s): h3.vis-api-chatbot
- Qué es: Tool server-side que fuerza el step final en 'que me contacten' y registra handoff.callback.
- Referencias: src/modules/chatbot/server/tools/confirmContactRequest.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-445] C0.1 navigate_to_page solo en el bot de develOP
- Fuente: `docs/bitacora-roadmap.md:15489` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: Gate por bot en getTools() para cortar fuga de tráfico de clientes hacia develOP.
- Referencias: src/modules/chatbot/server/tools/getTools.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-446] BotConfig.allowedNavigationPaths
- Fuente: `docs/bitacora-roadmap.md:15597` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: Fix real de C0.1 (rutas de navegación por bot); requiere migración.
- Referencias: src/modules/chatbot/server/tools/navigateToPage.ts · también en fuente:15491 · también en fuente:15795
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-447] D.1 script de backfill de verticalPack
- Fuente: `docs/bitacora-roadmap.md:15616` · tipo: hecho-declarado · estado declarado: hecho (corrida manual pendiente)
- Nodo(s): h3.vis-api-chatbot
- Qué es: Script quirúrgico idempotente con dry-run; el agente no lo corrió.
- Referencias: prisma/seeds/backfill-vertical-pack.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-448] Detectar en runtime cuando el bot admite no saber
- Fuente: `docs/bitacora-roadmap.md:15781` · tipo: idea · estado declarado: sin estado
- Nodo(s): h3.vis-api-chatbot
- Qué es: Extensión natural de E1 distinta del batch retrospectivo.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-449] H.3 PROBE-STREAM: ruido apagado
- Fuente: `docs/bitacora-roadmap.md:16020` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: Emisores del camino sano borrados y dos logs promovidos a telemetría permanente.
- Referencias: src/modules/chatbot/server/chat/chunkTally.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-450] MS-E6.2 descomposición de handleChatRequest
- Fuente: `docs/bitacora-roadmap.md:16133` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: 2148→1297 líneas en tres costuras sin cambio de comportamiento.
- Referencias: src/modules/chatbot/server/chat/persistTurn.ts · src/modules/chatbot/server/chat/toolSuspension.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-451] La orquestación del chat no tiene tests
- Fuente: `docs/bitacora-roadmap.md:16149` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: Ningún test invoca handleChatRequest; oportunidad de testear toolSuspension y persistTurn aislados.
- Referencias: también en fuente:16296 · también en fuente:16512
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-452] e2e 40-lead-capture-e2e.spec.ts no confiable
- Fuente: `docs/bitacora-roadmap.md:16170` · tipo: pendiente · estado declarado: sin estado
- Nodo(s): h3.vis-api-chatbot
- Qué es: actionTimeout corta antes del stream y dos test.skip enmascaran fallas.
- Referencias: tests/e2e/40-lead-capture-e2e.spec.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-453] 4 bugs menores anotados en MS-E6.2
- Fuente: `docs/bitacora-roadmap.md:16284` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h3.vis-api-chatbot
- Qué es: Log llm_request_start con par solicitado, comentario stale, condición v3 duplicada y quota_reserve_ms sin mark().
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-454] BLOQUE MUDEZ
- Fuente: `docs/bitacora-roadmap.md:16314` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: 4 commits: se quitó chunkMs, red con texto canned, persistencia del texto visto y ventana de providerStreamClose.
- Referencias: test:mudez
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-455] Turno canned: cobrar y persistir
- Fuente: `docs/bitacora-roadmap.md:16378` · tipo: decision · estado declarado: hecho
- Nodo(s): h3.vis-api-chatbot
- Qué es: Se persiste el canned con source watchdog_canned y se cobra el cupo; el orden persist→abort no debe reordenarse.
- Referencias: también en fuente:16455
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-456] BLOQUE PRIVACIDAD
- Fuente: `docs/bitacora-roadmap.md:16711` · tipo: hecho-declarado · estado declarado: hecho (push y verificación post-deploy pendientes) · fecha: 2026-08-10
- Nodo(s): h3.vis-api-chatbot
- Qué es: Allowlist en logs de consola, hash de IP con salt obligatorio y redacción de PrismaClientValidationError.
- Referencias: docs/privacidad-afirmaciones-cliente.md · cierra deuda fuente:15483, 15602, 15603
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-457] Telegram interno con PII de visitantes
- Fuente: `docs/bitacora-roadmap.md:16866` · tipo: decision · estado declarado: pendiente (decisión de Franco) · fecha: 2026-08-11
- Nodo(s): h3.vis-api-chatbot
- Qué es: Decidir antes del primer cliente: declararlo en contrato o mandar solo un identificador.
- Referencias: también en fuente:16897
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-458] Limpiar ipHash históricos con salt público
- Fuente: `docs/bitacora-roadmap.md:16869` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-11
- Nodo(s): h3.vis-api-chatbot
- Qué es: Operación de datos sobre Conversation.ipHash generados con el salt hardcodeado.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-459] Sinks de log con datos crudos
- Fuente: `docs/bitacora-roadmap.md:16876` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-11
- Nodo(s): h3.vis-api-chatbot
- Qué es: chat.bad_request arrastra un snippet del body y lib/alerts.ts:145 loguea el Error crudo.
- Referencias: src/lib/alerts.ts · también en fuente:16878
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-460] BLOQUE CARRERAS: concurrencia del request
- Fuente: `docs/bitacora-roadmap.md:16903` · tipo: bloque · estado declarado: en curso · fecha: 2026-08-12
- Nodo(s): h3.vis-api-chatbot
- Qué es: P2002 perdedor-adopta, gate botBusy, provider-close en admin, deprecación de /smoke y trabajo detached.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-461] CARRERAS commit 1: P2002 perdedor-adopta
- Fuente: `docs/bitacora-roadmap.md:16916` · tipo: hecho-declarado · estado declarado: hecho (sin revisión adversarial) · fecha: 2026-08-12
- Nodo(s): h3.vis-api-chatbot
- Qué es: getOrCreateConversation y captureLead adoptan la fila ganadora; invariante test:p2002.
- Referencias: resolver.ts · src/modules/chatbot/server/tools/captureLead.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-462] Revisión adversarial del commit 1 de CARRERAS
- Fuente: `docs/bitacora-roadmap.md:16986` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-12
- Nodo(s): h3.vis-api-chatbot
- Qué es: Los agentes murieron por cuota; el diff queda sin revisar por terceros.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-463] CARRERAS commit 3: deprecación de /smoke
- Fuente: `docs/bitacora-roadmap.md:17070` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-12
- Nodo(s): h3.vis-api-chatbot
- Qué es: Borrado el GET público que quemaba Vertex por hit (smoke/route.ts y smokeTest.ts).
- Referencias: tests/e2e/04-health.spec.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-464] CARRERAS commit 4: detached
- Fuente: `docs/bitacora-roadmap.md:17125` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-12
- Nodo(s): h3.vis-api-chatbot
- Qué es: Se awaitea el evento BLOCKED_ORIGIN y Sentry.flush antes del 500.
- Referencias: src/app/api/chatbot/[slug]/chat/route.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-465] Aceptar trabajo detached sin outbox por ahora
- Fuente: `docs/bitacora-roadmap.md:17138` · tipo: decision · estado declarado: hecho · fecha: 2026-08-12
- Nodo(s): h3.vis-api-chatbot
- Qué es: Brevo/Telegram sin configurar y ningún tenant con CRM; el lead nunca se pierde, solo la notificación.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-466] Outbox transaccional para trabajo post-turno
- Fuente: `docs/bitacora-roadmap.md:17155` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-12
- Nodo(s): h3.vis-api-chatbot
- Qué es: Tabla escrita en la misma transacción + cron con reintentos; requiere migración, sprint propio.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-467] COST-1: verificar costo real en prod y cobertura
- Fuente: `docs/roadmap-pendientes.md:119` · tipo: pendiente · estado declarado: implementado, verificación pendiente · fecha: 2026-07-10
- Nodo(s): h3.vis-api-chatbot
- Qué es: SELECT de costos en PROD, volumen de chat.cost_model_unknown, otros call-sites de getModel y hueco registry vs pricing.
- Referencias: resolveEffectiveModel.ts · pricing/costs.ts · tambien en :125
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-468] C3.6 logChatbotEvent fire-and-forget
- Fuente: `docs/roadmap-pendientes.md:156` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-10
- Nodo(s): h3.vis-api-chatbot
- Qué es: Hoy se await-ea en el hot path; saldar al tocar el cluster onFinish.
- Referencias: C3.6
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-469] Carril de seguridad de Franco
- Fuente: `docs/roadmap-pendientes.md:175` · tipo: pendiente · estado declarado: pendiente (carril Franco) · fecha: 2026-07
- Nodo(s): h3.vis-api-chatbot
- Qué es: RT-2 /smoke sin auth quema Gemini, RE-13 /health expone internals, RE-7 atribución spoofeable, RT-13 sessionId adivinable, A.4 secret en history.
- Referencias: docs/consolidacion-planoA-runtime.md · RT-2 · RE-13 · RE-7 · RT-13 · A.4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-470] Decisiones abiertas que gatean bloques
- Fuente: `docs/roadmap-pendientes.md:176` · tipo: decision · estado declarado: abierta · fecha: 2026-07
- Nodo(s): h3.vis-api-chatbot
- Qué es: T0.1 gate de /smoke; firma real de prod gatea INFRA.3+RB.3+MH.2; fork de historial gatea C0.2.
- Referencias: T0.1 · C0.2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-471] INFRA.1 rastro off-Neon
- Fuente: `docs/sprints/infra-1-observabilidad.md:3` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: logPersistFailure/extractDbErrorInfo, onError en streamText y eventos chat.persist_failed, chat.unhandled_failed, chat.stream_error.
- Referencias: src/modules/chatbot/server/logging/logger.ts · npm run test:infra1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-472] console.error de captureLead a log estructurado
- Fuente: `docs/sprints/infra-1-observabilidad.md:75` · tipo: pendiente · estado declarado: diferido · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: notifyClient y syncLeadToCrm siguen en texto plano.
- Referencias: captureLead.ts L466-468, L478-480
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-473] Lint preexistente del runtime del chatbot
- Fuente: `docs/sprints/infra-1-observabilidad.md:76` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: toolResults sin usar en onFinish, react-hooks/refs en ChatbotEmbed, set-state-in-effect en useChatbot.
- Referencias: docs/sprints/infra-2-cold-start-retry.md:119 · docs/sprints/utm-1-captura.md:211
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-474] INFRA.3 causa raíz de conexión
- Fuente: `docs/sprints/infra-2-cold-start-retry.md:14` · tipo: bloque · estado declarado: bloqueado (firma real de prod + Sentry DSN) · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: lib/prisma.ts, pooler, DIRECT_URL, connection_limit y retry server-side en onFinish; ~11-14% de turnos perdidos bajo carga.
- Referencias: tambien en :131, :137 · docs/sprints/infra-1-observabilidad.md:70 · docs/sprints/q1-1-harness.md:179 · docs/roadmap-pendientes.md:176
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-475] Race write-write residual del user message
- Fuente: `docs/sprints/infra-2-cold-start-retry.md:134` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-api-chatbot
- Qué es: Cerrarlo requiere @@unique y migración.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-476] Q1.1 corredor de conversaciones doradas
- Fuente: `docs/sprints/q1-1-harness.md:3` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: 36 escenarios (12 x 3 packs) contra Gemini real con 3 bots QA; fix de readback 30->10 s. Batería completa a verificar por Valentino.
- Referencias: src/modules/chatbot/evals/ · npm run evals · tambien en :89, :109
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-477] Q1.2 evaluación de la batería
- Fuente: `docs/sprints/q1-2-scoring.md:3` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: Asserts duros (captura, handoff, mustNotClaim, intent) y juez Opus configurable por EVALS_JUDGE_MODEL.
- Referencias: src/modules/chatbot/evals/scoring/ · npm run evals:score
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-478] Juez LLM en vivo
- Fuente: `docs/sprints/q1-2-scoring.md:89` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-05
- Nodo(s): h3.vis-api-chatbot
- Qué es: Requiere ANTHROPIC_API_KEY en .env.local y revisar los veredictos de tono.
- Referencias: tambien en :82
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-479] Conversation.sessionId único global
- Fuente: `docs/sprints/utm-1-captura.md:236` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-04
- Nodo(s): h3.vis-api-chatbot
- Qué es: No es @@unique([botConfigId, sessionId]); riesgo de colisión cross-bot.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-480] Runtime del bot sin verificar
- Fuente: `STATUS.md:67` · tipo: pendiente · estado declarado: no verificado · fecha: 2026-05-21
- Nodo(s): h3.vis-api-chatbot
- Qué es: E2E con bot real skipped; P50/P95/success rate pendientes de medición en prod.
- Referencias: tambien en :82
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-481] Features del chatbot pospuestas a Beta
- Fuente: `STATUS.md:193` · tipo: pendiente · estado declarado: pospuesto a Beta · fecha: 2026-05-21
- Nodo(s): h3.vis-api-chatbot
- Qué es: Cards ricos, KB híbrida con review queue, lead scoring 0-100, memoria del visitante y sugerencias proactivas al dueño.
- Referencias: tambien en :194-:197
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h3.vis-whatsapp — Canal WhatsApp (motor)

#### [PLAN-482] WhatsApp directo queda fuera de la evolución
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:37` · tipo: decision · estado declarado: descartado · fecha: 2026-07-06
- Nodo(s): h3.vis-whatsapp
- Qué es: Se aceptan bases pasivas, no abstracciones. Se reabre con el primer vertical facturando o con claridad regulatoria.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-483] Clasificador P2002 duplicado en el motor WhatsApp
- Fuente: `docs/bitacora-roadmap.md:16992` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-12
- Nodo(s): h3.vis-whatsapp
- Qué es: motor/domain/prisma-errors.ts duplica el guard; migrar al de la frontera de aislamiento.
- Referencias: src/modules/motor/domain/prisma-errors.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h3.vis-widget-cliente — Widget embebible en el sitio del cliente

#### [PLAN-484] M1: audio en el widget y costos WABA
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:23#6` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-widget-cliente
- Qué es: Contenido no detallado en estos docs. El research quirúrgico de M1 se ofreció y nunca se corrió.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:72
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-485] EST: estética por vertical
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:23#7` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-widget-cliente
- Qué es: Nuevo prerrequisito EST.0: extraer el shell de chat duplicado entre on-site y embed. Los valores dependen de una decisión estética abierta.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:44 · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:55
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-486] Dirección estética por vertical
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:55` · tipo: decision · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-widget-cliente
- Qué es: Abierta: paletas y avatares por vertical. Bloquea los valores de EST, que por ahora usa placeholders.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-487] C2.2: catálogo visual en el chat
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:62` · tipo: bloque · estado declarado: pendiente
- Nodo(s): h3.vis-widget-cliente
- Qué es: Autos con foto y precio dentro de la conversación. Antes hay que relevar de dónde sale el catálogo. Prometido a Matsu.
- Referencias: tambien en Franco/Bloques a Ejecutar/DASHBOARD/HANDOFF-chatbot-arranque.md:35 · ver Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:53 (E3)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-488] Widget: colores, avatar 3D y modo offline
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:84` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-12
- Nodo(s): h3.vis-widget-cliente
- Qué es: Cablea chatSurfaceTint, accentColor y accentSecondary al widget real. Saca el EffectComposer del avatar R3F, que ahora usa glow simulado y dispose. En modo offline solo queda la tarjeta de WhatsApp.
- Referencias: ChatWindow.tsx · LogicCompanion.tsx · NeuroAvatar.tsx · ParticleSphere.tsx · PublicBotConfig · tambien en Olme/Chatbot_ registro de cambios.md:32 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-489] Cyan hardcodeado en el widget
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:93` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-12
- Nodo(s): h3.vis-widget-cliente
- Qué es: El botón enviar, Sparkles del estado vacío y thinkPulse ignoran el accent. Candidato a un sprint que cablee todo el widget de una vez.
- Referencias: ChatWindow.tsx · tambien en Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:166 · tambien en Olme/Chatbot_ registro de cambios.md:107 · ver Olme/Cliente - Registro de cambios/Chatbot_ registro de cambios.md:55-59 (resolución parcial declarada)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-490] QuickReplyChips.tsx muerto
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:165` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-12
- Nodo(s): h3.vis-widget-cliente
- Qué es: Duplica styling y no está montado: montarlo o borrarlo.
- Referencias: QuickReplyChips.tsx · tambien en Olme/Chatbot_ registro de cambios.md:108
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-491] Accent del widget en los 3 puntos
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Chatbot_ registro de cambios.md:55` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-widget-cliente
- Qué es: Siguen el accent del tenant, con cyan como fallback. Sparkles con strokeWidth 1.5. thinkPulse borrado.
- Referencias: ChatWindow.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-492] Color de acento por ruta en el widget (P1 Chatbots)
- Fuente: `_insumos/drive/Olme/Ideas de nuevas features.md:34` · tipo: idea · estado declarado: pendiente · fecha: 2026-06-20
- Nodo(s): h3.vis-widget-cliente
- Qué es: routeColorMap está en el schema y en publicConfig, pero no llega al widget en runtime. Falta crear resolveAccentColor y cablearlo.
- Referencias: resolveAccentColor · hooks/useChatbot.ts · ChatWindow.tsx · LogicCompanion.tsx · routeColorMap · tambien en Olme/Chatbot_ registro de cambios.md:106 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-493] B3.7 — 'Pensando' en el mismo frame del Enter
- Fuente: `docs/bitacora-roadmap.md:1684` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): h3.vis-widget-cliente
- Qué es: Flag local pendingSubmit en useChatbot combinado con el status del SDK para isStreaming y avatarState; la verificación visual en /embed/matsu quedó para Franco.
- Referencias: src/modules/chatbot/hooks/useChatbot.ts · tambien en docs/bitacora-roadmap.md:1807 · tambien en docs/bitacora-roadmap.md:1815
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-494] Test automático de percepción del widget (Playwright)
- Fuente: `docs/bitacora-roadmap.md:1803` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-22
- Nodo(s): h3.vis-widget-cliente
- Qué es: Medir el delay entre keydown Enter y la aparición del indicador 'Pensando'; requiere infraestructura nueva.
- Referencias: tambien en docs/bitacora-roadmap.md:1816
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-495] MS-2 — Widget degradado: derivación a WhatsApp en /embed
- Fuente: `docs/bitacora-roadmap.md:3009` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h3.vis-widget-cliente
- Qué es: useChatbot guarda el payload degradado completo (DegradedInfo); DegradedBanner reescrito con CTA wa.me y montado en ChatbotEmbed; input bloqueado; fix de los dots fantasma y keys del AnimatePresence.
- Referencias: src/modules/chatbot/hooks/useChatbot.ts · src/modules/chatbot/components/chat/DegradedBanner.tsx · src/modules/chatbot/components/embed/ChatbotEmbed.tsx · pendiente originado en docs/bitacora-roadmap.md:2777 · pendiente originado en docs/bitacora-roadmap.md:2787
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-496] B8.1 — Aislamiento CSS del bubble, tooltips, avatar cortado y z-index
- Fuente: `docs/bitacora-roadmap.md:5451` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): h3.vis-widget-cliente
- Qué es: all: initial en .dvlp-bubble/.dvlp-iframe (sin Shadow DOM), tokens CHATBOT_Z_INDEX, Canvas de NeuroAvatar con dimensiones, cola de 1 en ProactiveTooltip, ChatWindow usa ChatHeader con AvatarRenderer; el escape QA de validate-origin cubre requests sin Origin.
- Referencias: src/modules/chatbot/shared/zIndex.ts · src/modules/chatbot/components/avatar/NeuroAvatar.tsx · src/modules/chatbot/components/tooltip/ProactiveTooltip.tsx · src/modules/chatbot/components/LogicCompanion.tsx · src/modules/chatbot/components/chat/ChatWindow.tsx · public/widget.js +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-497] Probar el aislamiento CSS del widget embebido en un sitio real hostil
- Fuente: `docs/bitacora-roadmap.md:5539` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h3.vis-widget-cliente
- Qué es: Diferido a Franco; si all: initial no alcanza, evaluar Shadow DOM en sprint dedicado.
- Referencias: public/widget.js · tambien en docs/bitacora-roadmap.md:5480 · tambien en docs/bitacora-roadmap.md:5555
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-498] B8.2 — Sonidos Web Audio, mute persistente y entrada del bubble
- Fuente: `docs/bitacora-roadmap.md:5557` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h3.vis-widget-cliente
- Qué es: Hook useChatbotSounds (AudioContext lazy, chimes generados, sin assets), toggle mute persistido en localStorage, animación de entrada del bubble con useReducedMotion; aplicado en LogicCompanion y ChatbotEmbed.
- Referencias: src/modules/chatbot/hooks/useChatbotSounds.ts · src/modules/chatbot/components/chat/ChatHeader.tsx · src/modules/chatbot/components/chat/ChatWindow.tsx · src/modules/chatbot/components/LogicCompanion.tsx · src/modules/chatbot/components/embed/ChatbotEmbed.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-499] Unificar ChatWindow y ChatbotEmbed
- Fuente: `docs/bitacora-roadmap.md:5620` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h3.vis-widget-cliente
- Qué es: Dos UIs paralelas del chat; ChatbotEmbed sigue con header inline propio; toda feature de UI se aplica en dos lugares.
- Referencias: src/modules/chatbot/components/chat/ChatWindow.tsx · src/modules/chatbot/components/embed/ChatbotEmbed.tsx · tambien en docs/bitacora-roadmap.md:5636
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-500] B8.3 — Degradación elegante del widget (pausado, provider_error, cuota)
- Fuente: `docs/bitacora-roadmap.md:5650` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h3.vis-widget-cliente
- Qué es: El config devuelve paused en vez de 404 si el bot está inactivo; 5xx o error de red en /chat se vuelve provider_error en el cliente; ChatWindow usa DegradedBanner y bloquea el input; el degradado reactivo se limpia al cerrar.
- Referencias: src/modules/chatbot/shared/publicConfig.ts · src/modules/chatbot/server/config/getPublicConfig.ts · src/modules/chatbot/hooks/useChatbot.ts · src/modules/chatbot/components/chat/ChatWindow.tsx · src/modules/chatbot/components/LogicCompanion.tsx · pendiente originado en docs/bitacora-roadmap.md:3071 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-501] Sin kill switch dedicado: 5xx/red de /chat se muestra como provider_error
- Fuente: `docs/bitacora-roadmap.md:5673` · tipo: decision · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h3.vis-widget-cliente
- Qué es: Cubre Vertex caído, timeout o infra rota con la misma tarjeta de WhatsApp.
- Referencias: src/modules/chatbot/hooks/useChatbot.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-502] Telemetría del estado degradado del widget
- Fuente: `docs/bitacora-roadmap.md:5723` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-25
- Nodo(s): h3.vis-widget-cliente
- Qué es: Emitir un postMessage al host cuando monta el banner para medir cuántos visitantes lo ven.
- Referencias: src/modules/chatbot/components/embed/ChatbotEmbed.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-503] Exponer companyName en el config para el prefill de provider_error
- Fuente: `docs/bitacora-roadmap.md:5724` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-25
- Nodo(s): h3.vis-widget-cliente
- Qué es: Hoy provider_error usa un prefill genérico porque companyName solo viene en paused.
- Referencias: src/modules/chatbot/shared/publicConfig.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-504] B8.4 — Responsive mobile del widget embebido
- Fuente: `docs/bitacora-roadmap.md:5738` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h3.vis-widget-cliente
- Qué es: 100dvh en el embed y 72dvh en el sheet, safe-area-inset en el bubble, atributos mobile del textarea, viewport-fit cover + interactiveWidget resizes-content y /embed/[slug] ya no hace notFound si el bot está pausado.
- Referencias: src/modules/chatbot/components/embed/ChatbotEmbed.tsx · src/modules/chatbot/components/chat/ChatWindow.tsx · src/modules/chatbot/components/LogicCompanion.tsx · public/widget.js · src/app/embed/[slug]/page.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-505] Verificar teclado virtual y safe-area en teléfonos reales
- Fuente: `docs/bitacora-roadmap.md:5820` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h3.vis-widget-cliente
- Qué es: No emulable en preview headless; Franco confirma en iOS Safari y Android Chrome.
- Referencias: tambien en docs/bitacora-roadmap.md:5821
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-506] legacy_neuro ignora el size (siempre 224px)
- Fuente: `docs/bitacora-roadmap.md:8570` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h3.vis-widget-cliente
- Qué es: Componente tratado como frozen; homogeneizar vía LegacyNeuroAvatarAdapter en sprint propio (afecta también al widget real).
- Referencias: LegacyNeuroAvatarAdapter · tambien en docs/bitacora-roadmap.md:8526
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-507] B13.4 header ChatbotEmbed unificado + avatar respeta size
- Fuente: `docs/bitacora-roadmap.md:8694` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): h3.vis-widget-cliente
- Qué es: El embed usa ChatHeader; LegacyNeuroAvatarAdapter escala el avatar legacy al size pedido. Sin microinteracciones nuevas.
- Referencias: src/modules/chatbot/components/embed/ChatbotEmbed.tsx · src/modules/chatbot/components/avatar/LegacyNeuroAvatarAdapter.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-508] Disclaimers PII (Vertex AI + n8n) en el widget
- Fuente: `docs/bitacora-roadmap.md:8871` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h3.vis-widget-cliente
- Qué es: SEC-PII-02/03: aviso de procesamiento por Vertex y n8n en el primer mensaje; derivado a sprint de compliance.
- Referencias: también en fuente:8923
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-509] ChatbotEmbed hardcodea currentPath '/'
- Fuente: `docs/bitacora-roadmap.md:12753` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-04
- Nodo(s): h3.vis-widget-cliente
- Qué es: El embed nunca conoce el path real del sitio del cliente.
- Referencias: src/modules/chatbot/components/embed/ChatbotEmbed.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-510] INFRA.2 idempotencia + retry del widget
- Fuente: `docs/bitacora-roadmap.md:13090` · tipo: hecho-declarado · estado declarado: hecho (verificación humana pendiente) · fecha: 2026-07-06
- Nodo(s): h3.vis-widget-cliente
- Qué es: Dedup del mensaje de usuario y retry acotado para el cold-start de Neon.
- Referencias: src/modules/chatbot/server/chat/dedup.ts · docs/sprints/infra-2-cold-start-retry.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-511] RE-2 widget no muere si /config falla
- Fuente: `docs/bitacora-roadmap.md:13276` · tipo: hecho-declarado · estado declarado: hecho (verificación humana pendiente) · fecha: 2026-07-10
- Nodo(s): h3.vis-widget-cliente
- Qué es: configCache con retry sin envenenamiento y ConfigLoadError con reintento.
- Referencias: src/modules/chatbot/shared/configCache.ts · src/modules/chatbot/components/chat/ConfigLoadError.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-512] Errores ESLint preexistentes en el widget
- Fuente: `docs/bitacora-roadmap.md:13349` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-10
- Nodo(s): h3.vis-widget-cliente
- Qué es: react-hooks/refs en ChatbotEmbed y set-state-in-effect en useChatbot (parte de los ~80 de la auditoría CLEAN).
- Referencias: también en fuente:13135 · también en fuente:16656 · también en fuente:17023
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-513] WATCHDOG-2 fase 2 cursor de tipeo inline
- Fuente: `docs/bitacora-roadmap.md:14826` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h3.vis-widget-cliente
- Qué es: El caret queda a la derecha de la última palabra (ajustado a <p> en PROVIDER-CLOSE fase 2).
- Referencias: StreamingMarkdown.tsx · también en fuente:15089
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-514] BLOQUE VOZ
- Fuente: `docs/bitacora-roadmap.md:16526` · tipo: hecho-declarado · estado declarado: hecho (verificación humana pendiente)
- Nodo(s): h3.vis-widget-cliente
- Qué es: Conector neutral junto a tarjetas y widget con banners rate_limited, chat_unavailable y stream_interrupted.
- Referencias: src/modules/chatbot/components/chat/DegradedBanner.tsx · src/modules/chatbot/hooks/useChatbot.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-515] CARRERAS R3: botBusy en HandoffOptionsCard
- Fuente: `docs/bitacora-roadmap.md:17004` · tipo: hecho-declarado · estado declarado: hecho (verificación visual pendiente) · fecha: 2026-08-12
- Nodo(s): h3.vis-widget-cliente
- Qué es: Botones de la card deshabilitados con el turno en vuelo para evitar el doble mensaje.
- Referencias: HandoffOptionsCard.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-516] UTM perdido en /embed abierto top-level
- Fuente: `docs/roadmap-pendientes.md:107` · tipo: pendiente · estado declarado: pendiente (no urgente) · fecha: 2026-07-04
- Nodo(s): h3.vis-widget-cliente
- Qué es: Sin handshake develop:init la sesión va sin atribución; fallback a location.search en ChatbotEmbed.
- Referencias: ChatbotEmbed.tsx:64-84 · useChatbot.ts:123-135 · docs/sprints/utm-1-captura.md:243
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-517] Sin tests del camino de atribución del cliente
- Fuente: `docs/roadmap-pendientes.md:111` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-04
- Nodo(s): h3.vis-widget-cliente
- Qué es: Ningún test cubre handshake -> parseAttribution -> firstTouchRef -> body.
- Referencias: scripts/utm1-smoke.mjs
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-518] RE-2: verificación con Neon dormida
- Fuente: `docs/roadmap-pendientes.md:136` · tipo: pendiente · estado declarado: implementado, verificación pendiente · fecha: 2026-07-10
- Nodo(s): h3.vis-widget-cliente
- Qué es: Visual-qa del error/reintento de carga del widget y grabación de cold-start real.
- Referencias: RE-2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-519] Sin microcopy durante retry de /config
- Fuente: `docs/roadmap-pendientes.md:142` · tipo: decision · estado declarado: decidido (diferido) · fecha: 2026-07-10
- Nodo(s): h3.vis-widget-cliente
- Qué es: Spinner solo; 'Conectando…' queda para el POST /chat. Revisar con la grabación en mano.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-520] INFRA.2 dedup y retry del widget
- Fuente: `docs/sprints/infra-2-cold-start-retry.md:3` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): h3.vis-widget-cliente
- Qué es: shouldSkipUserPersist (cola huérfana 90s) y retry de 3 intentos con backoff 2s/4s, 'Conectando…' y connection_failed.
- Referencias: server/chat/dedup.ts · shared/chatRetryPolicy.ts · hooks/useChatbot.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-521] Política de reintento INFRA.2
- Fuente: `docs/sprints/infra-2-cold-start-retry.md:41` · tipo: decision · estado declarado: decidido · fecha: 2026-07-06
- Nodo(s): h3.vis-widget-cliente
- Qué es: Dedup por cola sin responder; connection_failed reemplaza el handoff a WhatsApp ante 5xx pre-stream; sin timeout de cliente en v1.
- Referencias: tambien en :46, :51, :102
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-522] Verificar retry simulando 5xx
- Fuente: `docs/sprints/infra-2-cold-start-retry.md:124` · tipo: pendiente · estado declarado: verificación humana pendiente · fecha: 2026-07-06
- Nodo(s): h3.vis-widget-cliente
- Qué es: Ver 'Conectando…', recuperación sin duplicados y copy 'probá de nuevo' en :3000.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-523] UTM.1 captura first-touch
- Fuente: `docs/sprints/utm-1-captura.md:3` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-04
- Nodo(s): h3.vis-widget-cliente
- Qué es: Migración aditiva de UTM en Conversation, attribution.ts, resolver create-only, Zod sanitizado, captureLead copia UTMs, firstTouch en sessionStorage, referrer en widget.js.
- Referencias: prisma/migrations/20260704224423_utm1_add_conversation_utm_fields · src/modules/chatbot/shared/attribution.ts · test:utm1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-524] ChatbotEmbed hardcodea currentPath '/'
- Fuente: `docs/sprints/utm-1-captura.md:233` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-04
- Nodo(s): h3.vis-widget-cliente
- Qué es: Bug preexistente del iframe embebido.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-525] Color por ruta en el widget
- Fuente: `raiz:lane-LOG.md:115` · tipo: pendiente · estado declarado: pendiente (fuera de lane)
- Nodo(s): h3.vis-widget-cliente
- Qué es: Admin y API guardan routeColorMap pero el widget siempre pinta accentColor; falta resolveAccentColor.
- Referencias: tambien en :135-:139
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-526] Widget para visitantes
- Fuente: `STATUS.md:60` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-21
- Nodo(s): h3.vis-widget-cliente
- Qué es: Script ~5KB, captura por tool calling, handoff a WhatsApp y whitelist de dominios.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-527] Arquitectura del widget
- Fuente: `STATUS.md:217` · tipo: decision · estado declarado: decidido · fecha: 2026-05-21
- Nodo(s): h3.vis-widget-cliente
- Qué es: iframe + script vanilla, CORS dinámico, allowedDomains por bot y validación de origin server-side.
- Referencias: tambien en :218, :219
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h3.vis-widget-develop — Widget de develOP en el sitio público

#### [PLAN-528] D10 avatares 3D fuera del bundle inicial
- Fuente: `docs/bitacora-beta-3.md:3529` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-10
- Nodo(s): h3.vis-widget-develop
- Qué es: HeavyAvatarsLazy.tsx con dynamic ssr:false y barrels con NeuroAvatarLazy; −237 kB gz en rutas públicas sin canvas.
- Referencias: HeavyAvatarsLazy.tsx · components/avatar/index.ts · modules/chatbot/index.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-529] Diferir el widget de chat entero
- Fuente: `docs/bitacora-beta-3.md:3663` · tipo: idea · estado declarado: sin estado · fecha: 2026-08-10
- Nodo(s): h3.vis-widget-develop
- Qué es: ~202 kB gz restantes; requiere decisión de producto (teaser a los 3 s, first-touch); three sigue en landings y home desktop.
- Referencias: ChatWidgetMount · también en fuente:3671
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-530] Launcher del chat en opacity 0 con animación perpetua
- Fuente: `docs/bitacora-rediseno.md:154` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-07-30
- Nodo(s): h3.vis-widget-develop
- Qué es: En modo normal el launcher queda con chatbotLauncherReveal corriendo y una transición de Framer encima; no se tocó.
- Referencias: src/modules/chatbot/components/LogicCompanion.tsx:199 · también en docs/bitacora-rediseno.md:493
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-531] B0.8 Anclas rotas del chatbot y del menú mobile
- Fuente: `docs/bitacora-rediseno.md:1340` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-31
- Nodo(s): h3.vis-widget-develop
- Qué es: VALID_PATHS de navigateToPage corregido (/#portfolio, /process-automation#calculadora) e ids agregados (#hero, #faq, #proceso) en las landings.
- Referencias: navigateToPage.ts (VALID_PATHS) · src/components/layout/Navbar.tsx (getNavItems, PROCESO_ANCHOR_BY_ROUTE, HASH_TO_LABEL)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-532] El widget de develOP navega por recarga completa
- Fuente: `docs/bitacora-rediseno.md:1409` · tipo: pendiente · estado declarado: relevado, no aplicado (se eligió dejarlo) · fecha: 2026-07-31
- Nodo(s): h3.vis-widget-develop
- Qué es: useChatbot.ts:487 usa window.location.href porque ChatWidgetMount está fuera del TransitionProvider (frozen); en carga fría no aterriza en anclas del home.
- Referencias: useChatbot.ts:487 · src/app/layout.tsx:112 · ChatbotEmbed.tsx:401 · LogicCompanion.tsx:162 · también en docs/bitacora-rediseno.md:3726
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-533] Launcher del chatbot se superpone a contenido a 390px
- Fuente: `docs/bitacora-rediseno.md:1459` · tipo: pendiente · estado declarado: parcial ('ya fichado') · fecha: 2026-07-31
- Nodo(s): h3.vis-widget-develop
- Qué es: Cubría el botón del menú mobile (resuelto al mover la nav arriba en B2-S2) y luego pisa contenido y el microcopy del hero; z-index de widget embebible.
- Referencias: LogicCompanion.tsx · también en docs/bitacora-rediseno.md:1468 · también en docs/bitacora-rediseno.md:1639 · también en docs/bitacora-rediseno.md:1765 · también en docs/bitacora-rediseno.md:3166 · también en docs/bitacora-rediseno.md:3389 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-534] Presupuesto mobile: el avatar R3F del widget de chat baja three.js
- Fuente: `docs/bitacora-rediseno.md:1588` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-07-31
- Nodo(s): h3.vis-widget-develop
- Qué es: A 390px entran unos 700 KB de three/r3f por el avatar del widget montado en todas las rutas públicas; es el próximo blanco si el peso mobile es objetivo.
- Referencias: también en docs/bitacora-rediseno.md:1862
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-535] Los ids servicios y caracteristicas no se renombran
- Fuente: `docs/bitacora-rediseno.md:2988` · tipo: decision · estado declarado: vigente · fecha: 2026-08-05
- Nodo(s): h3.vis-widget-develop
- Qué es: Los consumen Navbar (MAIN_NAV_ITEMS/HASH_TO_LABEL), la tool navigate_to_page del chatbot (VALID_PATHS) y TransitionContext frozen (líneas 28 y 41).
- Referencias: src/context/TransitionContext.tsx:28 · src/context/TransitionContext.tsx:41 · navigateToPage.ts · Navbar.tsx · también en docs/bitacora-rediseno.md:3070
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-536] NeuroAvatar: lazy load y cold start del launcher 3D
- Fuente: `docs/bitacora-roadmap.md:325` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-22
- Nodo(s): h3.vis-widget-develop
- Qué es: dynamic() de NeuroAvatar descartado en B1.2 (solo pesa en el chat/dashboard); el cold start del launcher 3D quedó para un sprint aparte.
- Referencias: src/modules/chatbot/components/avatar/NeuroAvatar.tsx · src/modules/chatbot/components/LogicCompanion.tsx · tambien en docs/bitacora-roadmap.md:377 · tambien en docs/bitacora-roadmap.md:1808
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-537] Recuperar el look del header del chat del sitio
- Fuente: `docs/bitacora-roadmap.md:5504` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h3.vis-widget-develop
- Qué es: ChatHeader quedó más sobrio que el header inline reemplazado (sin línea decorativa ni dots 'pensando'); opcional en sprint posterior.
- Referencias: src/modules/chatbot/components/chat/ChatHeader.tsx · tambien en docs/bitacora-roadmap.md:5541
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-538] THREE.WebGLRenderer Context Lost con varios Canvas
- Fuente: `docs/bitacora-roadmap.md:5534` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h3.vis-widget-develop
- Qué es: Aparece al montar/desmontar el bubble y el header del panel; sin pantalla negra; sprint de ciclo de vida de R3F si se ataca.
- Referencias: tambien en docs/bitacora-roadmap.md:5716 · tambien en docs/bitacora-roadmap.md:5814
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-539] Decidir tamaño del avatar de Lucia en el launcher
- Fuente: `docs/bitacora-roadmap.md:8801` · tipo: pendiente · estado declarado: pendiente (decisión de Franco) · fecha: 2026-05-26
- Nodo(s): h3.vis-widget-develop
- Qué es: Tras el fix del adapter el avatar legacy_neuro del LogicCompanion se ve más chico; opciones: cambiar avatar, subir size o revertir.
- Referencias: también en fuente:8918
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-540] FIX-ORIGIN config same-origin en prod
- Fuente: `docs/bitacora-roadmap.md:14132` · tipo: hecho-declarado · estado declarado: hecho (verificación en prod pendiente)
- Nodo(s): h3.vis-widget-develop
- Qué es: El widget propio ya no recibe 403 por falta de header Origin.
- Referencias: src/app/api/chatbot/[slug]/config/same-origin.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-541] Sprint de copy del widget
- Fuente: `docs/bitacora-roadmap.md:16582` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h3.vis-widget-develop
- Qué es: Empty-state 'Sistema Listo / Protocolo de consultoría' sin voseo (ChatWindow.tsx) y 'WhatsApp no configurado.' visible al visitante.
- Referencias: ChatWindow.tsx · WhatsappHandoffCard.tsx · también en fuente:16668
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-542] TODOs: chatbot en ai-implementations y datos de Organization
- Fuente: `docs/sprints/alpha-pre-cierre-RESUMEN.md:65` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-17
- Nodo(s): h3.vis-widget-develop
- Qué es: Reintegrar el chatbot en /ai-implementations; agregar contactEmail y rubro a Organization en onboarding.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

## h4 · Panel de admin

### h4.adm-alertas — Alertas

#### [PLAN-543] Lane Alertas
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:24` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-19
- Nodo(s): h4.adm-alertas
- Qué es: Badge que se revalida, Zod en alertId, seed, filtros de fecha, overview por columna, 'Ver bot' con <Link> y cap uniforme de columnas.
- Referencias: 404b224 · e90a195 · e60dca4 · a665ffc · 5f73f80 · 8be5a26 +12
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-544] Filtros de alertas al server
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:51` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-19
- Nodo(s): h4.adm-alertas
- Qué es: Hoy filtran en el cliente. Si el volumen crece, bajar el filtrado a listAlerts. No es urgente.
- Referencias: listAlerts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-545] alerts-detector.spec.ts no corre bajo test:integration
- Fuente: `docs/bitacora-roadmap.md:12400` · tipo: pendiente · estado declarado: pendiente (decisión)
- Nodo(s): h4.adm-alertas
- Qué es: 7 fallos por falta de baseURL/webServer; decidir config dedicada o corrida manual.
- Referencias: tests/integration/alerts-detector.spec.ts · también en fuente:12493
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h4.adm-audit — Audit log

#### [PLAN-546] Lane config-audit
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Configuracion_ registro de cambios.md:50` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-19
- Nodo(s): h4.adm-audit
- Qué es: Hover en filas y stat cards. Paginación load-more server-side (cambia el contrato de listAuditLog). Filtros de fecha y acción en el server con anti-race.
- Referencias: lane/config-audit · 53ba0cf · 0daa5bb · 401bd9c · 2c51a90 · src/lib/audit-log-queries.ts +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-547] Stat cards del Audit log globales
- Fuente: `_insumos/drive/Olme/Ideas de nuevas features.md:56` · tipo: decision · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): h4.adm-audit
- Qué es: Se decidió que muestren los últimos 7 días globales y no el filtro activo. Si se cambia, hay que agregar el filtro al contrato de getAuditLogStats. La decisión sigue abierta a revisión.
- Referencias: getAuditLogStats
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-548] Dropdown de período duplicado
- Fuente: `_insumos/drive/Olme/Ideas de nuevas features.md:66` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-20
- Nodo(s): h4.adm-audit
- Qué es: audit-period-filter copia ProjectsPeriodDropdown. No se importó por la regla anti-acople del trabajo en paralelo. Unificar.
- Referencias: audit-log/_components/audit-period-filter.tsx · ProjectsPeriodDropdown · tambien en Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:91
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-549] AdminAuditLog sin targetOrganizationId (P1-5 del audit de DB)
- Fuente: `docs/bitacora-roadmap.md:2480` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h4.adm-audit
- Qué es: Solo tiene targetType + targetId; no hay filtro por org en la UI del audit.
- Referencias: prisma/schema.prisma
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-550] Valor BOT_DELETED en AuditActionType
- Fuente: `raiz:lane-LOG.md:39` · tipo: pendiente · estado declarado: pendiente de coordinación
- Nodo(s): h4.adm-audit
- Qué es: Hoy se audita como OTHER con metadata.subAction; requiere migración aditiva.
- Referencias: tambien en :79
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h4.adm-clientes — Clientes

#### [PLAN-551] Sub-lanes de Clientes (clients, tickets, messages)
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:23` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): h4.adm-clientes
- Qué es: Clients: lista, detalle, plan y billing, onboarding (createClientOnly y updateClient nuevos) y field-normalize; borró BotPreview. Tickets y messages: scopes propios. Merge interno limpio y luego a main.
- Referencias: lane/clientes @ 3ba49df · lane/clientes-clients · lane/clientes-tickets · lane/clientes-messages · field-normalize.ts · tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:30 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-552] Tanda de fixes de Clientes
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:34` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): h4.adm-clientes
- Qué es: city persistida, internalNotes, toErrorMessage (corrige la fuga de ZodError en updateSettings), archivar con deletedAt, avatar y hard-delete con TypeToConfirmDialog y audit CLIENT_DELETED.
- Referencias: f5ccebc · ef97856 · 2c26930 · 5e33733 · 3f1ad22 · e8c7ae0 +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-553] Eliminar cliente: archivar (soft) y borrar (hard, cascade C)
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:51` · tipo: decision · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): h4.adm-clientes
- Qué es: Archivar es reversible y es el default. Eliminar es irreversible y pide confirmación por texto. El hard-delete preserva los OsLead y borra lo propio del cliente.
- Referencias: hardDeleteClient · TypeToConfirmDialog · Organization.deletedAt · tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:52 · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:45
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-554] Avatar del cliente
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:53` · tipo: decision · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): h4.adm-clientes
- Qué es: Emoji, imagen base64 comprimida en el cliente e iniciales editables a mano (máximo 2, no derivadas del nombre). Fallback: imagen, emoji, iniciales y neutro.
- Referencias: ClientAvatar · ClientAvatarField · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:46
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-555] Wrappers de hover de Clientes a ui compartido
- Fuente: `_insumos/drive/Olme/Ideas de nuevas features.md:67` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-20
- Nodo(s): h4.adm-clientes
- Qué es: HoverScaleCard, hover-scale y message-bubble se mueven a @/components/ui. Config e Inteligencia ya usan adminHoverCls.
- Referencias: HoverScaleCard · hover-scale · message-bubble · @/components/ui
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-556] VaultManager no muestra errores al admin
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:86` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-13
- Nodo(s): h4.adm-clientes
- Qué es: Los errores solo van a console.error. Con el fallo duro de PD-1, el form no se limpia y no aparece ningún mensaje.
- Referencias: VaultManager
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-557] Bulk actions de /admin/clients: el label intercepta el click del checkbox
- Fuente: `docs/bitacora-beta.md:1660` · tipo: pendiente · estado declarado: pendiente (preexistente) · fecha: 2026-06-25
- Nodo(s): h4.adm-clientes
- Qué es: e2e 16-admin-bulk-actions: checkbox sr-only bajo un <label> absoluto que intercepta pointer events; interacción rota/flaky real.
- Referencias: tests/e2e/16-admin-bulk-actions.spec.ts · también en docs/bitacora-beta-2.md:70
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-558] e2e de onboarding del cliente falla en el wizard /admin/clients/new
- Fuente: `docs/bitacora-beta.md:1661` · tipo: pendiente · estado declarado: pendiente (preexistente) · fecha: 2026-06-25
- Nodo(s): h4.adm-clientes
- Qué es: 30-onboarding-e2e-complete no llega al input de teléfono (Step 4, typeControlledInput en helpers/form.ts:15); deuda ajena al setter.
- Referencias: tests/e2e/30-onboarding-e2e-complete.spec.ts · tests/helpers/form.ts:15 · también en docs/bitacora-beta-2.md:71 · también en docs/bitacora-beta-2.md:520 · también en docs/bitacora-beta-2.md:560
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-559] Generar ASSET_TYPES desde el schema (VaultManager)
- Fuente: `docs/bitacora-roadmap.md:304` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-22
- Nodo(s): h4.adm-clientes
- Qué es: El array local espeja el enum AssetType de Prisma y debe actualizarse a mano si cambia el enum; script gen-from-schema fuera de scope.
- Referencias: src/components/admin/managers/VaultManager.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-560] Deprecar Subscription.planName y Subscription.price (legacy)
- Fuente: `docs/bitacora-roadmap.md:2019` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h4.adm-clientes
- Qué es: Se mantienen por rollback; aún los leen src/lib/subscription.ts, SubscriptionBanner, client-list/client-card/ClientHeader y el StatCard 'Plan' del OverviewTab.
- Referencias: src/lib/subscription.ts · src/components/dashboard/SubscriptionBanner.tsx · tambien en docs/bitacora-roadmap.md:2112 · tambien en docs/bitacora-roadmap.md:2131 · tambien en docs/bitacora-roadmap.md:2468 · tambien en docs/bitacora-roadmap.md:2475 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-561] Asignar tier a sonrisa-norte y sigma-contable en prod
- Fuente: `docs/bitacora-roadmap.md:2034` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): h4.adm-clientes
- Qué es: 'Plan AI Care' y 'Plan Maintenance' no tienen mapeo; editar PLAN_NAME_TO_KEY y re-correr el script, o dejarlas en fallback Starter.
- Referencias: prisma/seeds/migrate-subscriptions-to-plan-id.ts · tambien en docs/bitacora-roadmap.md:2092 · tambien en docs/bitacora-roadmap.md:2132 · tambien en docs/bitacora-roadmap.md:2142
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-562] B4.3 — UI admin: asignar plan + billing override
- Fuente: `docs/bitacora-roadmap.md:2311` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h4.adm-clientes
- Qué es: Migración aditiva de override y scheduling; actions assignPlanToOrg, setBillingOverride y clearBillingOverride con Zod, requireSuperAdmin, audit e invalidación de cache; cards en /admin/clients/[clientId]; Matsu piloto en BUSINESS con 0 USD hasta 2026-08-21 (dev).
- Referencias: prisma/migrations/20260523001750_add_billing_override_and_plan_scheduling/migration.sql · src/app/(protected)/admin/clients/_actions/plan.actions.ts · src/app/(protected)/admin/clients/_actions/plan.schemas.ts · src/lib/plan/get-plan-for-org.ts · src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentCard.tsx · src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentForm.tsx +4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-563] Separación gating / billing (non-negotiable)
- Fuente: `docs/bitacora-roadmap.md:2337` · tipo: decision · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h4.adm-clientes
- Qué es: El gating del bot solo lee Plan; la facturación usa priceOverride vigente o Plan.monthlyPrice; la action de billing nunca toca planId y viceversa.
- Referencias: prisma/schema.prisma:472-486 · src/app/(protected)/admin/clients/_actions/plan.actions.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-564] Upgrade inmediato con reset de cuota; downgrade al 1° del mes siguiente (UTC)
- Fuente: `docs/bitacora-roadmap.md:2346` · tipo: decision · estado declarado: hecho · fecha: 2026-05-23
- Nodo(s): h4.adm-clientes
- Qué es: Decidido por sortOrder; el downgrade pendiente se aplica lazy en getPlanForOrg sin cron; first assignment también resetea la cuota.
- Referencias: src/lib/plan/get-plan-for-org.ts · tambien en docs/bitacora-roadmap.md:2355 · tambien en docs/bitacora-roadmap.md:2461
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-565] Aplicar plan BUSINESS + cortesía 0 USD a Matsu en prod
- Fuente: `docs/bitacora-roadmap.md:2474` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h4.adm-clientes
- Qué es: Se aplicó solo en dev con un script throwaway que bypassea la action; en prod hacerlo desde /admin/clients/matsu.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-566] Cron de aviso de override por vencer
- Fuente: `docs/bitacora-roadmap.md:2476` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h4.adm-clientes
- Qué es: Hoy el override pasa a 'vencido' sin notificación; agregar un cron de aviso (B4.4/B4.5 o posterior).
- Referencias: tambien en docs/bitacora-roadmap.md:2486 · tambien en docs/bitacora-roadmap.md:2788
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-567] Tests de downgrade real con tráfico (E2E)
- Fuente: `docs/bitacora-roadmap.md:2478` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h4.adm-clientes
- Qué es: El path está cubierto por code review pero no probado en vivo antes del primer cliente downgradeable.
- Referencias: tambien en docs/bitacora-roadmap.md:2488
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-568] Vista admin read-only de CrmIntegration por org
- Fuente: `docs/bitacora-roadmap.md:4454` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): h4.adm-clientes
- Qué es: El super admin solo tiene el audit log o la impersonation para soportar al cliente.
- Referencias: tambien en docs/bitacora-roadmap.md:4534 · tambien en docs/bitacora-roadmap.md:4620
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-569] Vista de instalación desde /admin/clients/[clientId]
- Fuente: `docs/bitacora-roadmap.md:5887` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-25
- Nodo(s): h4.adm-clientes
- Qué es: Hoy hay que ir por /admin/chatbots/[botId] para ver lo que ve el cliente.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-570] B9.4 — Bulk Import eliminado (dedupe de KB pendiente)
- Fuente: `docs/bitacora-roadmap.md:6228` · tipo: hecho-declarado · estado declarado: en curso · fecha: 2026-05-25
- Nodo(s): h4.adm-clientes
- Qué es: Borrada la carpeta admin/clients/bulk-import (form y action), su entrada en el sidebar y docs/csv-import-format.md; el dedupe de la KB de develOP quedó como script sin ejecutar (sprint parcial).
- Referencias: src/app/(protected)/admin/clients/bulk-import/ (borrado) · src/app/(protected)/admin/_components/admin-sidebar.tsx · docs/csv-import-format.md (borrado) · scripts/b9-4-dedupe-kb-develop.mjs
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-571] Naming: clientId en /admin/clients/[clientId] es en realidad la organización
- Fuente: `docs/bitacora-roadmap.md:7163` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-05-25
- Nodo(s): h4.adm-clientes
- Qué es: Cambiarlo requiere migrar URLs, redirects y bookmarks; marcado como inconsistencia conocida.
- Referencias: src/lib/actions/clients.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-572] UI admin para regenerar password (resend-credentials)
- Fuente: `docs/bitacora-roadmap.md:7622` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-05-25
- Nodo(s): h4.adm-clientes
- Qué es: El botón del panel que dispara el endpoint no fue parte de B12.5; 'si ya existe, está cubierto; si no, es un paso aparte'.
- Referencias: src/app/api/admin/users/[userId]/resend-credentials/route.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-573] CSRF en /api/auth/google-business/start?orgId=
- Fuente: `docs/bitacora-roadmap.md:8373` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h4.adm-clientes
- Qué es: Un SUPER_ADMIN engañado puede iniciar el flujo para otra org (linking attack); mitigar con nonce CSRF en cookie o doble confirmación post-callback.
- Referencias: src/app/api/auth/google-business/start/route.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-574] Sin verificación del recurso GBP tras el callback
- Fuente: `docs/bitacora-roadmap.md:8375` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h4.adm-clientes
- Qué es: Los tokens se asocian a la org del state sin validar el gbpLocationId esperado; propuesta: selector de cuentas/locations con audit log.
- Referencias: src/app/api/auth/google-business/callback/route.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-575] P2.B.1 botón admin 'Enviar reporte ahora'
- Fuente: `docs/bitacora-roadmap.md:11886` · tipo: hecho-declarado · estado declarado: hecho (e2e 41 sin correr)
- Nodo(s): h4.adm-clientes
- Qué es: Trigger manual del Executive Weekly Report por org, sin tocar el motor.
- Referencias: src/lib/reports/executive-weekly/send-manual.ts · src/app/api/admin/clients/[organizationId]/send-executive-report/route.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-576] Limpiar org mock san-miguel
- Fuente: `docs/bitacora-roadmap.md:15520` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h4.adm-clientes
- Qué es: Fixture mock anotado por Franco para cleanup.
- Referencias: STATUS.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-577] Confirmar Subscription/Plan de matsu
- Fuente: `docs/bitacora-roadmap.md:15609` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h4.adm-clientes
- Qué es: No se pudo confirmar por archivos si el piloto matsu tiene plan asignado; verificar en admin.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-578] Unificar Command Center
- Fuente: `docs/sprints/alpha-0-cleanup.md:35` · tipo: pendiente · estado declarado: pospuesto a Alpha.1
- Nodo(s): h4.adm-clientes
- Qué es: Mover entregables y bóveda a /admin/clients/[clientId] y eliminar /admin/agency-dashboard.
- Referencias: docs/sprints/alpha-RESUMEN-FINAL.md:45 (lo declara hecho)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-579] P0 wizard sin validación server-side
- Fuente: `docs/sprints/alpha-1-reaudit.md:220` · tipo: pendiente · estado declarado: pendiente (Alpha.2) · fecha: 2026-05-17
- Nodo(s): h4.adm-clientes
- Qué es: /admin/clients/new sin feedback de error ni spinner.
- Referencias: tambien en :85, :246 · docs/sprints/alpha-2-onboarding.md:30
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-580] P1 búsqueda, filtros y sort en /admin/clients
- Fuente: `docs/sprints/alpha-1-reaudit.md:225` · tipo: pendiente · estado declarado: pendiente (Alpha.5) · fecha: 2026-05-17
- Nodo(s): h4.adm-clientes
- Qué es: Sin búsqueda, filtros por estado/servicio ni sort.
- Referencias: tambien en :237, :261, :262
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-581] Wizard de onboarding profesionalizado
- Fuente: `docs/sprints/alpha-2-onboarding.md:9` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-17
- Nodo(s): h4.adm-clientes
- Qué es: Borrador en localStorage (7 días), DraftBanner, slugify, sugerencias por industria, BotPreview y Step5 con spinner y error.
- Referencias: src/lib/slugify.ts · useOnboardingDraft.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-582] Cronometrar el wizard y E2E
- Fuente: `docs/sprints/alpha-2-onboarding.md:69` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-17
- Nodo(s): h4.adm-clientes
- Qué es: Completar en <8 min (test manual); E2E del wizard pospuestos a Alpha.19.
- Referencias: tambien en :70
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-583] Onboarding del piloto Matsu (Beta)
- Fuente: `STATUS.md:5` · tipo: promesa · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): h4.adm-clientes
- Qué es: Matsu (plan Business) contratado, onboarding pendiente; sin org/bot/user en DB al 2026-05-21.
- Referencias: tambien en :174-:180
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h4.adm-config — Configuración

#### [PLAN-584] Sin UI admin para el Cal.com de develOP
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:808` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h4.adm-config
- Qué es: calComUsername/calComEmbedUrl de la org develOP solo se cargan directo en base.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-585] Lane config-settings
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Configuracion_ registro de cambios.md:21` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-19
- Nodo(s): h4.adm-config
- Qué es: Hover canónico, sin spinners en los number inputs, limpieza de imports muertos y fix del contrato de pricing (valida por slug real) más la fuga de ZodError en updateModulePricing.
- Referencias: lane/config-settings · b1000cc · 78e7d86 · b0a8ea5 · 20dd783 · 8f93de3 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-586] config-design no-go: editor de tema diferido
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Configuracion_ registro de cambios.md:91` · tipo: decision · estado declarado: descartado · fecha: 2026-06-19
- Nodo(s): h4.adm-config
- Qué es: Un editor de tema en runtime obligaría a cablear CSS vars en ~35 componentes de ui/* y a crear un modelo Prisma. Rama descartada; el relevamiento queda como documentación.
- Referencias: /admin/_design · lane/config-design · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:18 · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:48
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-587] Writer canónico del pricing de PremiumModule
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Configuracion_ registro de cambios.md:107` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-19
- Nodo(s): h4.adm-config
- Qué es: config-settings escribe priceMonthlyUsd y la lane plan&billing de Clientes consume el mismo modelo. Falta definir quién es el writer canónico. Ojo: revalidar /dashboard/services con el dueño de esa ruta.
- Referencias: PremiumModule.priceMonthlyUsd · updateModulePricing · tambien en Olme/Admin - Registro de cambios/Configuracion_ registro de cambios.md:108
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-588] Máscara del token de Telegram duplicada
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Configuracion_ registro de cambios.md:112` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-19
- Nodo(s): h4.adm-config
- Qué es: Unificar maskFromInput (cliente) y maskSecret (server) en un solo helper, con el server como fuente de verdad. Hay riesgo de que diverjan. Falta la decisión y un refactor chico.
- Referencias: src/app/(protected)/admin/settings/_components/settings-console.tsx · src/app/(protected)/admin/settings/_actions/settings.actions.ts · tambien en Olme/Ideas de nuevas features.md:54 · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:70
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-589] Simplificar ensureAgencySettingsRecord
- Fuente: `_insumos/drive/Olme/Ideas de nuevas features.md:53` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-20
- Nodo(s): h4.adm-config
- Qué es: Con el singleton @unique se puede pasar de findFirst orderBy a findUnique({where:{singleton:true}}). Refactor chico y opcional.
- Referencias: d14fcff · AgencySettings.singleton · ensureAgencySettingsRecord
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-590] Credenciales de Telegram config-first con fallback a env (par atómico)
- Fuente: `docs/bitacora-beta.md:429` · tipo: decision · estado declarado: vigente · fecha: 2026-06-19
- Nodo(s): h4.adm-config
- Qué es: AgencySettings.osTelegramBotToken/ChatId editables en /admin/settings mandan si están completos; si no, el par de env; DB caída cae a env; nunca se mezclan fuentes.
- Referencias: src/lib/notifications/telegram.ts · prisma/schema.prisma (AgencySettings.osTelegram*) · settings.actions.ts · settings-console.tsx · también en docs/bitacora-beta.md:936 (isTelegramConfigured)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-591] Consolidar premium-features.ts (legacy) con premium-modules.ts
- Fuente: `docs/bitacora-roadmap.md:2614` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h4.adm-config
- Qué es: El catálogo legacy de 11 slugs sigue vivo porque admin/settings lo usa para precios de módulos.
- Referencias: premium-features.ts · src/lib/premium-modules.ts · tambien en docs/bitacora-roadmap.md:2624 · tambien en docs/bitacora-roadmap.md:2634
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-592] D5' máscara del token Telegram consolidada
- Fuente: `docs/bitacora-roadmap.md:12294` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h4.adm-config
- Qué es: mask-secret.ts compartido; el dropdown de período no se consolidó.
- Referencias: src/lib/mask-secret.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-593] Prisma crudo fuera de isolation en reports
- Fuente: `docs/bitacora-roadmap.md:16882` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-11
- Nodo(s): h4.adm-config
- Qué es: admin/settings/reports/page.tsx consulta sin pasar por la frontera de isolation.
- Referencias: src/app/(protected)/admin/settings/reports/page.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h4.adm-dashboard — Dashboard del admin

#### [PLAN-594] Dashboard admin: visualización y UX
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Admin (operacion)_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-16
- Nodo(s): h4.adm-dashboard
- Qué es: Código muerto, labels, estados vacíos, loading alineado, a11y, reduced-motion, hover en wrapper externo y entrada en CSS. Mergeado a main.
- Referencias: c092747 · 5e25ea9 · 651f68e · 8acb272 · 5bb5e38 · 8caad3c +5
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-595] Dashboard: sin datos derivables extra ni count-up
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Admin (operacion)_ registro de cambios.md:57` · tipo: decision · estado declarado: descartado · fecha: 2026-06-16
- Nodo(s): h4.adm-dashboard
- Qué es: La Fase 3 de datos derivables no se ejecuta (su material se borró). Count-up de KPIs descartado. La entrada es en CSS, no con motion/react.
- Referencias: tambien en Olme/Admin - Registro de cambios/Operaciones/Admin (operacion)_ registro de cambios.md:58
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-596] cumulativeRevenue dentro del map
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Admin (operacion)_ registro de cambios.md:65` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-16
- Nodo(s): h4.adm-dashboard
- Qué es: Error de lint previo (react-hooks/immutability). El fix es refactorizar el cálculo financiero fuera del map.
- Referencias: src/app/(protected)/admin/page.tsx:500
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-597] Eyebrows técnicos 'FILA 1/2/3' en /admin
- Fuente: `docs/bitacora-roadmap.md:8499` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h4.adm-dashboard
- Qué es: Polish per-pantalla derivado a B13.2.
- Referencias: src/app/(protected)/admin/page.tsx · tambien en docs/bitacora-roadmap.md:8595
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-598] Claridad de métricas comerciales
- Fuente: `raiz:lane-dashboard-log.md:100` · tipo: pendiente · estado declarado: parcial (solo subtítulos)
- Nodo(s): h4.adm-dashboard
- Qué es: Tasa de respuesta mal etiquetada; cierre de card (histórico) vs chart (cohorte mensual) no reconcilian.
- Referencias: tambien en :46, :47, :105
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-599] Dashboard admin fases 1-3
- Fuente: `raiz:lane-dashboard-log.md:111` · tipo: hecho-declarado · estado declarado: commiteado, esperando verificación visual
- Nodo(s): h4.adm-dashboard
- Qué es: Código muerto, typos, subtítulos de cierre, empty states en charts, loading alineado, a11y, reduced-motion, hover en 14 cards y reveal de secciones.
- Referencias: c092747 · 8acb272 · 4683a2f · 1ded1c7 · a9739cc · 3240425 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-600] Lint cumulativeRevenue
- Fuente: `raiz:lane-dashboard-log.md:172` · tipo: pendiente · estado declarado: pendiente (decisión del humano)
- Nodo(s): h4.adm-dashboard
- Qué es: react-hooks/immutability preexistente en admin/page.tsx; recomputar sin reasignar un let.
- Referencias: tambien en :179
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-601] Sin count-up de KPIs
- Fuente: `raiz:lane-dashboard-log.md:243` · tipo: decision · estado declarado: decidido
- Nodo(s): h4.adm-dashboard
- Qué es: Count-up descartado; bg de MemberHoursCard y dos tiers de radios quedan a decisión de Valentino.
- Referencias: tambien en :258
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h4.adm-equipo — Equipo

#### [PLAN-602] Horas del equipo siempre en 0.0 h
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:848` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h4.adm-equipo
- Qué es: Tableros de horas de /admin/team sin registro de actividad de setters.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-603] Bug de horas cargadas a otro usuario
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Equipo_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): h4.adm-equipo
- Qué es: La time entry siempre usa session.user.id y se valida la pertenencia en el server. El selector muestra tareas propias y sin asignar; cargar horas en una sin asignar la autoasigna.
- Referencias: 08af3ae · a64d36b · listTasksByProject
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-604] Regla de negocio de carga de horas
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Equipo_ registro de cambios.md:20` · tipo: decision · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): h4.adm-equipo
- Qué es: Nadie registra horas en nombre de otro. Una tarea sin asignar se autoasigna al cargarle horas. Lo decidió Valentino.
- Referencias: tambien en Olme/Admin - Registro de cambios/Operaciones/Equipo_ registro de cambios.md:13
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-605] updateTimeEntry sin guard de pertenencia
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Equipo_ registro de cambios.md:24` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-17
- Nodo(s): h4.adm-equipo
- Qué es: Al crear horas ya se valida a quién pertenece la entrada; al editarlas no. Un admin puede editar horas ajenas. Riesgo bajo, pero conviene cerrarlo.
- Referencias: updateTimeEntry · team/_actions/* · tambien en Olme/Admin - Registro de cambios/Operaciones/Equipo_ registro de cambios.md:59 · tambien en Olme/Ideas de nuevas features.md:55
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-606] Equipo: display jerárquico y hover
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Equipo_ registro de cambios.md:28` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): h4.adm-equipo
- Qué es: Miembro, proyectos colapsables y tareas con horas reales contra estimadas. Se enriqueció la query assignedTasks existente. Hover en las stat cards.
- Referencias: 7f5cf97 · 38edcaa · tambien en Olme/Admin - Registro de cambios/Operaciones/Equipo_ registro de cambios.md:41
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-607] No hay pantalla de setters en el admin
- Fuente: `docs/bitacora-beta-3.md:4843` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-22 · **ZONA-FRANCO**
- Nodo(s): h4.adm-equipo
- Qué es: /admin/team lista solo SUPER_ADMIN; los setters se gestionan solo desde la asignación en el lead.
- Referencias: /admin/team
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-608] Time entries con z.coerce.date() sobre fecha sin hora
- Fuente: `docs/bitacora-beta-3.md:6352` · tipo: pendiente · estado declarado: listado, sin tocar · fecha: 2026-08-25/26 (inferida)
- Nodo(s): h4.adm-equipo
- Qué es: date, from y to de time-entry.schemas.ts, alimentados por time-entry-panel: el mismo bug de un día, vivo según la bitácora.
- Referencias: admin/team/_actions/time-entry.schemas.ts:33-34 · time-entry-panel.tsx:252
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h4.adm-leads — Leads

#### [PLAN-609] OsLead no pertenece a una org; convertedToOsLeadId sin FK
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:60` · tipo: decision · estado declarado: hecho · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: El vínculo cliente↔lead es indirecto, vía Project.osLeadId. convertedToOsLeadId es un string suelto a propósito, para no acoplar el chatbot con una relación dura.
- Referencias: OsLead · Project.osLeadId · ChatbotLead.convertedToOsLeadId · tambien en Olme/Ideas de nuevas features.md:18
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-610] Leads admin: kanban, inbound y filtros
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Leads_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-16 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: 32 commits. Kanban con @dnd-kit y drag desde el overview. Overview y form portaleados. Filtros, typeahead de ubicación y schemas fuera de 'use server'. Mergeado a main.
- Referencias: fe1fa2b · @dnd-kit/core@6.3.1 · @dnd-kit/utilities@3.2.2 · activity.schemas.ts · demo.schemas.ts · lead-zone.helpers.ts +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-611] Confirmación de borrado dentro del overview
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Leads_ registro de cambios.md:48` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-16 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: El z-index se resolvió con un hotfix. El refactor al popup local anclado (paridad con Proyectos) quedó agendado como sprint dedicado.
- Referencias: ConfirmDialog
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-612] Cerrar lead y convertirlo en cliente con vínculo de ID duro
- Fuente: `_insumos/drive/Olme/Ideas de nuevas features.md:11` · tipo: idea · estado declarado: pendiente · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: Botón en el lead del pipeline que crea la Organization y lo pasa a cerrado/ganado guardando el vínculo lead→cliente. Requiere relevamiento, schema (rompe la regla de no-acople) y state machine. Complejidad alta.
- Referencias: OsLead · Organization · ChatbotLead.convertedToOsLeadId · closedToOrgId · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:71 · tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:69 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-613] pipelineOrder del kanban de Leads
- Fuente: `_insumos/drive/Olme/Ideas de nuevas features.md:39` · tipo: idea · estado declarado: pendiente · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: Orden manual persistido dentro de cada columna del kanban. Requiere un campo en OsLead (schema) y lógica de drag-and-drop con persistencia. Hoy reordenar en la misma columna no hace nada.
- Referencias: OsLead.pipelineOrder · prisma/schema.prisma · tambien en Olme/Admin - Registro de cambios/Operaciones/Leads_ registro de cambios.md:47 · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:68 · tambien en Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:89
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-614] admin-1a Campo persistido OsLead.caliente + backfill
- Fuente: `docs/bitacora-beta-2.md:177` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: Columna boolean default false (migración solo aditiva) y backfill idempotente que replica esCaliente (12 de 37 leads).
- Referencias: prisma/migrations/20260627000000_admin_1a_add_oslead_caliente/migration.sql · scripts/admin-1a-backfill-caliente.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-615] admin-1b El caliente operativo pasa al campo (toggle en la asignación)
- Fuente: `docs/bitacora-beta-2.md:204` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: esCaliente(caliente, stage?) lee el campo; gates, badges, orden de cola y sidebar lo siguen; toggle role=switch persistido por assignLeadSetter sin tocar assignedToId.
- Referencias: src/lib/leados/revision.ts · src/lib/leados/flow.ts · src/lib/leados/home.ts · src/app/(protected)/admin/leads/_components/assign-setter-control.tsx · src/app/(protected)/admin/leads/_actions/lead.actions.ts · src/app/(protected)/admin/leads/[leadId]/page.tsx +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-616] Única fuente del caliente operativo: OsLead.caliente marcado por Franco
- Fuente: `docs/bitacora-beta-2.md:260` · tipo: decision · estado declarado: vigente · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: El score y el veredicto CALIENTE del setter son informativos y no disparan nada operativo; UI, action y server usan la misma gateBriefAbierto.
- Referencias: src/lib/leados/revision.ts · src/lib/leados/flow.ts · también en docs/bitacora-beta-2.md:235 · también en docs/bitacora-beta-2.md:294
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-617] Residuos de fechas en admin y outreach
- Fuente: `docs/bitacora-beta-3.md:4240` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-12 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: optionalReactivateAtSchema del admin usa z.coerce.date(); limitesDelDiaArgentino duplica dayRangeAR; dates-ar no estaba encadenado.
- Referencias: outreach.ts · src/lib/dates-ar.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-618] optionalReactivateAtSchema de admin/leads: trampa latente
- Fuente: `docs/bitacora-beta-3.md:6354` · tipo: pendiente · estado declarado: latente, sin tocar · fecha: 2026-08-25/26 (inferida)
- Nodo(s): h4.adm-leads
- Qué es: Hoy no está afectado porque recibe instantes reales (Date.now() más N días), pero falla igual el día que se le conecte un date-picker.
- Referencias: admin/leads/_actions/lead.schemas.ts:40 · change-status-select.tsx:42 · lead-pipeline.tsx:127
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-619] Carga + ratio de descarte del setter en el control de asignación
- Fuente: `docs/bitacora-beta.md:802` · tipo: hecho-declarado · estado declarado: hecho (falta ver con 2+ setters y layout mobile) · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: Panel 'Carga del equipo' y label con leads activos y % descarte reusando calcularRatioSetters; assignLeadSetter sin cambios.
- Referencias: src/lib/leados/setter-carga.ts · src/app/(protected)/admin/leads/_components/assign-setter-control.tsx · src/app/(protected)/admin/leads/[leadId]/page.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-620] Distinguir 'módulo' vs 'plan upgrade' en /admin/leads
- Fuente: `docs/bitacora-roadmap.md:3192` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): h4.adm-leads
- Qué es: El campo service de contactSubmission mezcla slugs de módulos y plan-upgrade-*; mapearlo visualmente en InboundLeadsTable.
- Referencias: InboundLeadsTable
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-621] ContactSubmission.leadStatus colisiona con el enum LeadStatus
- Fuente: `docs/bitacora-roadmap.md:6980` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: Investigar si conviene unificar en un sprint propio; LeadStatus es la máquina comercial de OsLead.
- Referencias: prisma/schema.prisma
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-622] P1 toast en CRUD de leads OS
- Fuente: `docs/sprints/alpha-1-reaudit.md:227` · tipo: pendiente · estado declarado: pendiente (Alpha.4) · fecha: 2026-05-17 · **ZONA-FRANCO**
- Nodo(s): h4.adm-leads
- Qué es: Pipeline /admin/leads sin toast de éxito/error ni paginación.
- Referencias: tambien en :154, :155, :258
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h4.adm-mensajes — Mensajes (admin)

#### [PLAN-623] F3: /admin/messages/[orgId] confía en el layout
- Fuente: `docs/bitacora-roadmap.md:6492` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h4.adm-mensajes
- Qué es: Mitigado porque las actions validan SUPER_ADMIN; limpiar la duplicación; no re-probado en runtime.
- Referencias: src/app/(protected)/admin/messages/[orgId]/page.tsx · tambien en docs/bitacora-roadmap.md:6823 · tambien en docs/bitacora-roadmap.md:7240
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h4.adm-novedades — Novedades

#### [PLAN-624] P5.3 feed de novedades + publisher admin
- Fuente: `docs/bitacora-roadmap.md:11726` · tipo: hecho-declarado · estado declarado: hecho (verificación visual pendiente) · fecha: 2026-07-01
- Nodo(s): h4.adm-novedades
- Qué es: Badge y lista en el dashboard; /admin/announcements con alcance ALL/ORG.
- Referencias: src/lib/announcements/visibility.ts · src/app/(protected)/admin/announcements
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h4.adm-proyectos — Proyectos

#### [PLAN-625] Proyectos y Equipo inseparables
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Proyectos_ registro de cambios.md:5` · tipo: decision · estado declarado: hecho · fecha: 2026-06-16
- Nodo(s): h4.adm-proyectos
- Qué es: Las actions de Task y TimeEntry viven en team/_actions/* y las importan 5 sitios de Proyectos. El trabajo va secuencial en main.
- Referencias: team/_actions/* · tambien en Olme/Admin - Registro de cambios/Operaciones/Equipo_ registro de cambios.md:60 · tambien en Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:11
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-626] lane/proyectos
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Proyectos_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-16
- Nodo(s): h4.adm-proyectos
- Qué es: Arregla el proyecto interno invisible (matchesStart null) y la fuga de errores de Prisma en deleteProject. Agrega lastActivityAt. Review adversarial: mergeable.
- Referencias: b9d4475 · matchesStart · deriveProjectLastActivityAt
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-627] Defectos menores latentes de Proyectos
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Proyectos_ registro de cambios.md:21` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-16
- Nodo(s): h4.adm-proyectos
- Qué es: La X de overlay-modal saltea dismissible; scroll-lock no-LIFO; TaskApprovalControl no mira result.success; confirmingId compartido.
- Referencias: overlay-modal · TaskApprovalControl · tambien en Olme/Admin - Registro de cambios/Operaciones/Proyectos_ registro de cambios.md:66
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-628] Kanban de Proyectos migrado a @dnd-kit
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Proyectos_ registro de cambios.md:29` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-16
- Nodo(s): h4.adm-proyectos
- Qué es: Drag desde el overview, DragOverlay, HOLD 200/5, guard contra phantom-click e id estable en el DndContext.
- Referencias: 26a4922 · 5f86933 · 7c17f00 · 82a213c · ab2a182 · a32932c +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-629] Proyectos internos (B11.1)
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Proyectos_ registro de cambios.md:48` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-16
- Nodo(s): h4.adm-proyectos
- Qué es: Sin cliente, el proyecto se resuelve a la org develop. Helper único isInternalProject y presentación 'Proyecto interno de develOP'.
- Referencias: 0dfc004 · 336e0df · 251cb3a · resolveProjectOrganization · isInternalProject
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-630] Project.organizationId NOT NULL; un proyecto interno usa la org develop
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Proyectos_ registro de cambios.md:52` · tipo: decision · estado declarado: hecho · fecha: 2026-06-16
- Nodo(s): h4.adm-proyectos
- Qué es: No se toca el schema: B11.1 revirtió a propósito el nullable. Se renombra solo la presentación, no la org en la DB (es compartida con el chatbot).
- Referencias: Project.organizationId · tambien en Olme/Admin - Registro de cambios/Operaciones/Proyectos_ registro de cambios.md:83
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-631] updateProjectStatus global para super-admin
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Proyectos_ registro de cambios.md:67` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-16
- Nodo(s): h4.adm-proyectos
- Qué es: Usa requireSuperAdmin sin filtrar por organizationId. Cambiar la autorización es decisión aparte.
- Referencias: updateProjectStatus
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-632] Admin: eliminar proyecto desde el detalle
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi proyecto_ registro de cambio.md:33` · tipo: hecho-declarado · estado declarado: hecho (sin mergear) · fecha: 2026-06-27
- Nodo(s): h4.adm-proyectos
- Qué es: Zona de peligro con un modal que llama al deleteProjectAction existente (SUPER_ADMIN).
- Referencias: 5733e29 · deleteProjectAction
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-633] estimatedEndDate de proyectos con z.coerce.date() sobre fecha sin hora
- Fuente: `docs/bitacora-beta-3.md:6350` · tipo: pendiente · estado declarado: listado, sin tocar · fecha: 2026-08-25/26 (inferida)
- Nodo(s): h4.adm-proyectos
- Qué es: Mismo corrimiento de un día que F1 arregló en la postergación, y según la bitácora sigue vivo. Lo alimentan los date-pickers de project-form y convert-lead-dialog.
- Referencias: admin/projects/_actions/project.schemas.ts:23 · project-form.tsx:297 · convert-lead-dialog.tsx:242
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-634] F4: /admin/projects/[projectId]/payments sin re-guard local
- Fuente: `docs/bitacora-roadmap.md:6493` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h4.adm-proyectos
- Qué es: Loader sin auth y mutaciones inline (markMilestonePaid, generatePendingMaintenance, markMaintenancePaid); verificar las actions de milestone y maintenance.
- Referencias: src/app/(protected)/admin/projects/[projectId]/payments/page.tsx:69-103 · tambien en docs/bitacora-roadmap.md:6824 · tambien en docs/bitacora-roadmap.md:7240
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-635] B11.1 — Project.organizationId NOT NULL + Cascade + índice
- Fuente: `docs/bitacora-roadmap.md:6577` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): h4.adm-proyectos
- Qué es: Proyectos huérfanos demo (Sigma y Sonrisa) borrados con cascade; organizationId NOT NULL con FK Cascade e índice; project.actions falla temprano sin org y seed-agency-os usa 'develop' para proyectos internos.
- Referencias: prisma/schema.prisma · prisma/migrations/20260525182135_b11_1_project_organizationid_not_null/migration.sql · src/app/(protected)/admin/projects/_actions/project.actions.ts · prisma/seed-agency-os.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-636] Flag isInternal siempre false en project.actions
- Fuente: `docs/bitacora-roadmap.md:6678` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h4.adm-proyectos
- Qué es: Se dejó en el contrato para no romper consumidores; borrar si no se usa.
- Referencias: src/app/(protected)/admin/projects/_actions/project.actions.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-637] Project.organizationId nullable
- Fuente: `docs/bitacora-roadmap.md:8921` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h4.adm-proyectos
- Qué es: Derivado a B14 junto con otros pendientes estructurales del portal.
- Referencias: prisma/schema.prisma
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-638] createTaskForClientAction no cross-valida org del proyecto
- Fuente: `docs/bitacora-roadmap.md:11020` · tipo: pendiente · estado declarado: pendiente (reportado para decisión)
- Nodo(s): h4.adm-proyectos
- Qué es: F5: SUPER_ADMIN puede crear tarea sin validar project.organizationId === organizationId.
- Referencias: agency-actions.createTaskForClientAction
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-639] P1 toast en ProjectManager
- Fuente: `docs/sprints/alpha-1-reaudit.md:228` · tipo: pendiente · estado declarado: pendiente (Alpha.4) · fecha: 2026-05-17
- Nodo(s): h4.adm-proyectos
- Qué es: TODO explícito en agency-dashboard.
- Referencias: tambien en :49, :257
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h4.adm-shell — Shell del admin

#### [PLAN-640] Admin cerrado: 4 áreas, 14 secciones
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:9` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): h4.adm-shell
- Qué es: Operaciones, Clientes, Inteligencia y Configuración en origin/main, con tsc verde y verificación visual humana por sección.
- Referencias: tambien en Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:74
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-641] 1ª tanda: 3 lanes en paralelo y fixes de shared
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:11` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): h4.adm-shell
- Qué es: Dashboard, Proyectos+Equipo y Leads, mergeados con --no-ff. Fixes de StatCard, ConfirmDialog portaleado y z-index. AdminBackButton unificado.
- Referencias: 3da90cf · AdminBackButton · tambien en Olme/Admin - Registro de cambios/Operaciones/Admin (operacion)_ registro de cambios.md:67
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-642] 2ª tanda: Chatbots, Demos y bloque en main
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:17` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): h4.adm-shell
- Qué es: Fix de decision-bar después del merge, migración de convertedToOsLeadId y BOT_DELETED, y fix centralizado del backdrop-filter en AdminLayoutClient.
- Referencias: AdminLayoutClient.tsx · decision-bar.tsx · tambien en Olme/Admin - Registro de cambios/Operaciones/Revision Demos_ registro de cambios.md:40
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-643] Eyebrows en uppercase que deforman la marca develOP
- Fuente: `docs/bitacora-roadmap.md:8495` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h4.adm-shell
- Qué es: Los eyebrows admin muestran 'DEVELOP / SECCIÓN' por el uppercase; derivado a B13.2.
- Referencias: tambien en docs/bitacora-roadmap.md:8598
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-644] Header admin mobile: el hamburger se superpone al BrandMark
- Fuente: `docs/bitacora-roadmap.md:8497` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h4.adm-shell
- Qué es: Diferencia de layout mobile entre admin y dashboard; derivado a B13.2.
- Referencias: src/app/(protected)/admin/_components/admin-sidebar.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-645] Card de usuario del sidebar admin con 'SUPER_ADMIN' y 'Admin DevelOP' crudos
- Fuente: `docs/bitacora-roadmap.md:8501` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h4.adm-shell
- Qué es: Mapear server-side a sentence case; derivado a B13.2.
- Referencias: src/app/(protected)/admin/_components/admin-sidebar.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-646] Migrar 11 pages admin con headers inline a PageHeader
- Fuente: `docs/bitacora-roadmap.md:8668` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): h4.adm-shell
- Qué es: Requiere extender PageHeader con eyebrow tipo breadcrumb y action slot; derivado a B14.
- Referencias: también en fuente:8684 · también en fuente:8869 · también en fuente:8919
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-647] B13.5 cierre de coherencia visual
- Fuente: `docs/bitacora-roadmap.md:8814` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): h4.adm-shell
- Qué es: Radios hardcodeados residuales a tokens y topbar admin con labels en español.
- Referencias: src/app/(protected)/admin/_components/admin-topbar.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-648] Unificar lenguaje visual admin ↔ dashboard
- Fuente: `docs/bitacora-roadmap.md:10378` · tipo: decision · estado declarado: pendiente (decisión de Franco) · fecha: 2026-05-30
- Nodo(s): h4.adm-shell
- Qué es: Admin usa panels rounded-[28px] bg-white/5 (×36) vs tokens del dashboard; migrar es sprint grande o se conserva identidad 'consola'.
- Referencias: b0bc086 revertido por bb4cf0d · también en fuente:10402
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-649] Patrón único de header admin
- Fuente: `docs/bitacora-roadmap.md:10379` · tipo: decision · estado declarado: pendiente (decisión de Franco) · fecha: 2026-05-30
- Nodo(s): h4.adm-shell
- Qué es: Peso/color del título dividido entre páginas boxed y unboxed.
- Referencias: también en fuente:10403
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-650] P0 error boundaries en /admin
- Fuente: `docs/sprints/alpha-1-reaudit.md:219` · tipo: pendiente · estado declarado: pendiente (Alpha.2) · fecha: 2026-05-17
- Nodo(s): h4.adm-shell
- Qué es: Crear error.tsx en /admin, /admin/clients/[clientId]/chatbot y /admin/projects/[projectId].
- Referencias: tambien en :34, :245
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-651] P1 loading por sección del admin
- Fuente: `docs/sprints/alpha-1-reaudit.md:224` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-17
- Nodo(s): h4.adm-shell
- Qué es: Solo admin/loading.tsx; skeletons por sub-ruta (P2 #14 a Bloque C).
- Referencias: tambien en :238, :247, :266
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-652] Design system del portal (Alpha.10-12)
- Fuente: `docs/sprints/alpha-bloque-C-RESUMEN.md:5` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h4.adm-shell
- Qué es: 12 componentes en src/components/ui, design-tokens.ts, /admin/_design, migración a Card/Button/Input, legacy stat-card y empty-state borrados.
- Referencias: docs/design-system.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-653] Bloque D estética admin (Alpha.13-15)
- Fuente: `docs/sprints/alpha-bloque-C-RESUMEN.md:40` · tipo: bloque · estado declarado: próximo
- Nodo(s): h4.adm-shell
- Qué es: Animaciones, skeletons premium y polish de Activity/Health/Alerts.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-654] ConfirmDialog sin focus-trap ni Escape
- Fuente: `raiz:lane-LOG.md:80` · tipo: pendiente · estado declarado: pendiente de coordinación
- Nodo(s): h4.adm-shell
- Qué es: Mejorar el componente compartido del admin.
- Referencias: src/app/(protected)/admin/_components/confirm-dialog · tambien en :22
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h4.adm-tickets — Tickets

#### [PLAN-655] Cambios cross-rol en tickets y messages del admin
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/General_ registro de cambios.md:33` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h4.adm-tickets
- Qué es: Badges, input unificado, Enter envía con IME guard, auto-scroll y word-break.
- Referencias: message-bubble.tsx · message-thread.tsx · MessagesScrollAnchor.tsx · tambien en Olme/Cliente - Registro de cambios/General_ registro de cambios.md:41
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-656] Fase 5: ticket de eliminación lleva al hard-delete
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:243` · tipo: hecho-declarado · estado declarado: hecho (sin mergear) · fecha: 2026-06-27
- Nodo(s): h4.adm-tickets
- Qué es: Bloque en ticket-chat con <Link> a /admin/clients?delete=<orgId>, que abre automáticamente el TypeToConfirmDialog existente. Solo abre el diálogo, nunca borra.
- Referencias: fe32886 · ticket-chat.tsx · ClientsListClient.tsx · requestAccountDeletionAction
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-657] Ticket de eliminación identificado por el título literal
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:406` · tipo: decision · estado declarado: hecho · fecha: 2026-06-27
- Nodo(s): h4.adm-tickets
- Qué es: Se usa ticket.title === 'Solicitud de eliminación de cuenta', sin categoría en el schema. Si cambia el string, el bloque de aprobación deja de aparecer.
- Referencias: requestAccountDeletionAction · ticket-chat.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-658] P2 paginación de tickets y proyectos
- Fuente: `docs/sprints/alpha-1-reaudit.md:235` · tipo: pendiente · estado declarado: pendiente (Alpha.5) · fecha: 2026-05-17
- Nodo(s): h4.adm-tickets
- Qué es: No escalan con volumen.
- Referencias: tambien en :236, :263
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

## h5 · Setter y LeadOS

### h5.adm-fg2lab — FG-2 Lab (experimento)

#### [PLAN-659] FG-2.0 Prototipo /admin/fg2-lab + harness de medición
- Fuente: `docs/bitacora-beta.md:1516` · tipo: hecho-declarado · estado declarado: hecho (prototipo); gate abierto · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.adm-fg2lab
- Qué es: Formulario estructurado de gastronomía que arma un prompt prescriptivo, cronómetro y fila de log TSV; lab no linkeado en el sidebar.
- Referencias: src/lib/leados/_experimental/fg2-brief-lab.ts · src/app/(protected)/admin/fg2-lab/page.tsx · src/app/(protected)/admin/fg2-lab/_components/fg2-lab-client.tsx · src/app/(protected)/admin/fg2-lab/_components/medicion-panel.tsx · docs/experimentos/fg2-brief-experimento.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-660] El código de FG-2 es experimental y descartable
- Fuente: `docs/bitacora-beta.md:1539` · tipo: decision · estado declarado: vigente · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.adm-fg2lab
- Qué es: Marcado EXPERIMENTAL/DESCARTABLE en cada archivo, a borrar tras la decisión del experimento; solo lee fichas, no toca gates.
- Referencias: src/lib/leados/_experimental/ · src/app/(protected)/admin/fg2-lab/ · scripts/_experimental/fg2-gen-prompts.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-661] Correr el experimento FG-2 (5 con formulario vs 5 a mano)
- Fuente: `docs/bitacora-beta.md:1543` · tipo: pendiente · estado declarado: pendiente (preparado, no corrido) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.adm-fg2lab
- Qué es: Franco pega los 10 prompts en Claude Design, juzga calidad 1–5 y registra tiempo y cuota por demo.
- Referencias: docs/experimentos/fg2-brief-experimento.md · docs/experimentos/fg2-prompts-listos.md · también en docs/bitacora-beta.md:1558 · también en docs/bitacora-beta.md:1634
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-662] FG-2.0 Experimento preparado (5 casos + 10 prompts + checklist)
- Fuente: `docs/bitacora-beta.md:1596` · tipo: hecho-declarado · estado declarado: hecho (preparación); experimento no corrido · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.adm-fg2lab
- Qué es: Casos precargados (2 arquetipos marcados como no reales), selector en el lab, generador de prompts y rúbrica; el experimento no se corrió.
- Referencias: src/lib/leados/_experimental/fg2-casos-gastro.ts · fg2-lab-client.tsx · scripts/_experimental/fg2-gen-prompts.ts · docs/experimentos/fg2-prompts-listos.md · docs/experimentos/fg2-brief-experimento.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h5.adm-revision-demos — Revisión de demos (LeadOS)

#### [PLAN-663] Calibración del self-check (checkId en rechazos)
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:367` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: checkId opcional en RechazoSchema, modal de rechazo con panel del self-check, guía de retrabajo y métrica de checks falsamente verdes en /admin/leados.
- Referencias: decision-bar.tsx · src/lib/leados/revision.ts · src/app/(protected)/admin/leados/page.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-664] lane/demos: cola de Revisión de Demos
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Revision Demos_ registro de cambios.md:17` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-17 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: Seed con URLs reales, ficha en acordeón, preview sticky y fix definitivo de Aprobar/Rechazar (overlay portaleado). Usa OsLeadDossier en EN_REVISION, no OsDemo. Ya no salta solo a la demo siguiente.
- Referencias: ec561ff · 58458f8 · 45bf684 (superseded) · 9265791 · c2a6c66 · 284f897 +4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-665] decision-bar.tsx reconciliado después del merge
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Revision Demos_ registro de cambios.md:44` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-17 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: El JSX quedó roto por un merge con código de Franco. Se reconcilió con la estructura de la lane.
- Referencias: decision-bar.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-666] Correr el seed de la cola de demos
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Revision Demos_ registro de cambios.md:52` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-17 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: El worktree no tenía .env.local; el script idempotente quedó sin correr. Componentes oversize a monitorear.
- Referencias: scripts/demos-seed-review-queue.ts · tambien en Olme/Admin - Registro de cambios/Operaciones/Revision Demos_ registro de cambios.md:73 · tambien en Olme/Admin - Registro de cambios/Operaciones/Revision Demos_ registro de cambios.md:74
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-667] Admin no muestra el material nuevo de la ficha
- Fuente: `docs/bitacora-beta-3.md:2382` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-03 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: FICHA_BLOQUES lista solo los seis campos viejos; Franco no ve materiales.
- Referencias: admin/leados/[leadId]/_components/dossier-panels.tsx:227
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-668] Rechazo estructurado (sección o checkId)
- Fuente: `docs/bitacora-beta-3.md:4325` · tipo: idea · estado declarado: descartado por ahora · fecha: 2026-08-12 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: «donde» es texto libre y RechazoSchema no tiene checkId; estructurarlo habilita saltar al lugar y señalar un check.
- Referencias: RechazoSchema · también en fuente:4834,4937,5141
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-669] «Me trabé» es un slot único sin historial
- Fuente: `docs/bitacora-beta-3.md:4840` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-22 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: escaladoAt/escaladoNota se borran en cualquier cambio de stage; solo se ven en «Setters trabados».
- Referencias: OsLeadDossier.escaladoAt
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-670] Cola de revisión del admin casi invisible
- Fuente: `docs/bitacora-beta-3.md:4858` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-22 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: 8.662 px de contenido y se ve el 9%; las evaluaciones de un setter, el 7%.
- Referencias: /admin/leados
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-671] Listas de stages adyacentes no atadas al grafo
- Fuente: `docs/bitacora-beta-3.md:5874` · tipo: pendiente · estado declarado: anotado, no tocado · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: admin/leados/page.tsx:67 (stages del filtro «en vuelo») y manual.ts:420 (STAGES_POST_CHEQUEO) repiten conjuntos de stages por fuera de LEGAL_TRANSITIONS. Anotadas, no tocadas.
- Referencias: src/app/(protected)/admin/leados/page.tsx:67 · manual.ts:420
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-672] Avisarle al admin de las demos aprobadas sin link permanente
- Fuente: `docs/bitacora-beta-3.md:7401` · tipo: idea · estado declarado: no tocado · fecha: 2026-08-27 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: pipeline.ts saca APROBADA de las etapas de producción con SLA infinito, así que Franco no ve como atasco una demo aprobada sin finalUrl. Ese caso solo nace por seeds o tooling, porque la UI exige el link.
- Referencias: pipeline.ts · AprobarRevisionSchema · scripts/b2-verify-dossier.ts:266 · tambien en docs/bitacora-beta-3.md:7402
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-673] assignment-trail.ts repite inline el discriminador SISTEMA
- Fuente: `docs/bitacora-beta-3.md:7532` · tipo: pendiente · estado declarado: listado, sin tocar · fecha: 2026-08-27 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: Escribe la negación exacta de SOLO_CONTACTOS_COMERCIALES en vez de usar el fragmento: el discriminador está dos veces.
- Referencias: assignment-trail.ts:75 · isolation.ts (SOLO_CONTACTOS_COMERCIALES)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-674] Stage EN_REVISION inline en tres lugares del admin
- Fuente: `docs/bitacora-beta-3.md:7533` · tipo: pendiente · estado declarado: listado, sin tocar · fecha: 2026-08-27 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: La cola de revisión del admin repite el discriminador del stage en tres archivos, sin una fuente única.
- Referencias: admin/layout.tsx:23 · admin/leados/[leadId]/page.tsx:89 · admin/leados/page.tsx:34
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-675] Flag a Franco: import corregido en setter-evaluaciones.tsx (WIP untracked)
- Fuente: `docs/bitacora-beta.md:822` · tipo: pendiente · estado declarado: sin estado (flag) · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: Se cambió el import de formatFechaHora de revision a flow para destrabar el build; confirmar si el dueño del WIP esperaba otra cosa.
- Referencias: src/app/(protected)/admin/leados/setter/[setterId]/_components/setter-evaluaciones.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-676] Drill-down de la métrica descarte/avance (/admin/leados/setter/[setterId])
- Fuente: `docs/bitacora-beta.md:840` · tipo: hecho-declarado · estado declarado: hecho (sign-off visual de Franco) · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: La fila del setter linkea a sus últimas evaluaciones (score, veredicto, stage, razonamiento) con el mismo cálculo de la cola.
- Referencias: src/app/(protected)/admin/leados/setter/[setterId]/page.tsx · setter-evaluaciones.tsx · src/app/(protected)/admin/leados/page.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-677] VEREDICTO_TONES duplicado localmente a propósito
- Fuente: `docs/bitacora-beta.md:853` · tipo: decision · estado declarado: vigente · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: Copia local del mapa canónico de dossier-panels.tsx para no tocar un archivo fuera de scope; el Record tipado rompe si cambia el enum.
- Referencias: setter-evaluaciones.tsx · dossier-panels.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-678] Panorama de producción del admin (conteo por etapa + atascos)
- Fuente: `docs/bitacora-beta.md:880` · tipo: hecho-declarado · estado declarado: hecho (sign-off perceptual de Franco) · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: Tablero FICHA→EN_REVISION con antigüedad y badge de atasco por SLA; RECHAZADA entra a la lista de atascos sin carril propio.
- Referencias: src/lib/leados/pipeline.ts · src/app/(protected)/admin/leados/_components/pipeline-board.tsx · src/app/(protected)/admin/leados/page.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-679] Antigüedad por etapa derivada de updatedAt + SLA editable
- Fuente: `docs/bitacora-beta.md:890` · tipo: decision · estado declarado: vigente · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: Sin migración: 'sin movimiento desde' = updatedAt; STAGE_SLA_HORAS (FICHA/EVALUADA/BRIEF 48h, CONSTRUCCION 72h, EN_REVISION 24h, RECHAZADA 48h).
- Referencias: src/lib/leados/pipeline.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-680] DRY de setterLabel (deuda sistémica pre-existente)
- Fuente: `docs/bitacora-beta.md:902` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: Anotado en la review adversarial del panorama de producción, fuera de alcance.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-681] Señal in-app de alarmas + 'me trabé' persistido + aviso de Telegram sin configurar
- Fuente: `docs/bitacora-beta.md:917` · tipo: hecho-declarado · estado declarado: hecho (verificación funcional de Franco) · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: Badge 'Revisión demos' en el sidebar (calientes en ámbar), columnas escaladoAt/escaladoNota con panel 'Setters trabados' y banner si Telegram no está configurado.
- Referencias: prisma/migrations/20260620180000_add_dossier_escalado · src/lib/leados/escalamiento.ts · src/lib/leados/escalamiento.invariant.ts · src/lib/leados/dossier.ts · src/lib/notifications/telegram.ts · src/app/(protected)/admin/layout.tsx +4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-682] Cola de revisión del admin (B5 de LeadOS)
- Fuente: `docs/bitacora-roadmap.md:7854#2` · tipo: bloque · estado declarado: pendiente · fecha: 2026-06-12 · **ZONA-FRANCO**
- Nodo(s): h5.adm-revision-demos
- Qué es: Revisión del activo demo por el admin (EN_REVISION a APROBADA o RECHAZADA con motivo).
- Referencias: src/lib/leados/dossier.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h5.set-dia — Tu día (setter)

#### [PLAN-683] Roadmap v15 del flujo del setter: decisiones D1–D7 cerradas
- Fuente: `docs/bitacora-beta-2.md:9` · tipo: decision · estado declarado: cerradas · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: La bitácora solo detalla D4 (caliente = campo de Franco), D6 (postergados vencidos accionables) y D7 (sticky liviano); D1–D3 y D5 no se describen.
- Referencias: también en docs/bitacora-beta-2.md:204 · también en docs/bitacora-beta-2.md:306 · también en docs/bitacora-beta-2.md:343
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-684] Bloques 1 y 3–6 del rediseño del flujo del setter sin entrada
- Fuente: `docs/bitacora-beta-2.md:136` · tipo: bloque · estado declarado: sin estado · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: La bitácora prevé agregar 'franja admin, 1-6' uno por bloque; solo registra pre-bloque 0, franja admin y Bloque 2.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-685] 2.1a Home del setter en modo dirección (foco secuenciado + sticky)
- Fuente: `docs/bitacora-beta-2.md:306` · tipo: hecho-declarado · estado declarado: hecho (eyeball visual final de Franco) · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: FocoSurface entrega un lead accionable con su porqué y CTAs Ir/Parquear/Saltar; cartera secundaria colapsada; lanes, recorrido y continuar-cta borrados.
- Referencias: src/lib/leados/foco.ts · src/lib/leados/foco.invariant.ts · src/lib/leados/foco-cookie.ts · src/app/(protected)/setter/_actions/foco.actions.ts · foco-surface.tsx · cartera-view.tsx +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-686] Sticky del foco por cookie httpOnly leados-foco-v1
- Fuente: `docs/bitacora-beta-2.md:317` · tipo: decision · estado declarado: vigente · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Sin DB ni migración; un stickyId fuera de 'trabajar' se ignora por construcción; el foco presenta y calcula, nunca transiciona.
- Referencias: src/lib/leados/foco-cookie.ts · foco.actions.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-687] 2.1b Postergados vencidos accionables (D6) + estado 'todo en espera'
- Fuente: `docs/bitacora-beta-2.md:343` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: POSTERGADO con reactivateAt vencido vuelve a 'trabajar'; HomeEnEspera con cuentas disjuntas en espera/fijados/pausados.
- Referencias: src/lib/leados/flow.ts · src/lib/leados/home.ts · home-en-espera.tsx · foco-surface.tsx · src/app/(protected)/setter/page.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-688] agruparParaHome quedó sin callers desde 2.1a
- Fuente: `docs/bitacora-beta-2.md:349` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Función de flow.ts muerta, no se tocó.
- Referencias: src/lib/leados/flow.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-689] Decidir si un lead fijado (pin) accionable puede ser foco
- Fuente: `docs/bitacora-beta-2.md:375` · tipo: pendiente · estado declarado: pendiente (decisión de Franco) · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: particionarCartera lo excluye de 'trabajar', así que fijar tu única accionable hace desaparecer el foco; decisión de Franco documentada en el código.
- Referencias: src/lib/leados/flow.ts (particionarCartera) · también en docs/bitacora-beta-2.md:447 · también en docs/bitacora-beta-2.md:466 · también en docs/bitacora-beta-2.md:559
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-690] Invariante ejecutable de D6 (flow.invariant.ts)
- Fuente: `docs/bitacora-beta-2.md:381` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: flow.ts pasa a imports relativos .ts para que ts-node lo cargue; check:invariant:flow asevera vencido vs futuro.
- Referencias: src/lib/leados/flow.ts · src/lib/leados/flow.invariant.ts · package.json (check:invariant:flow)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-691] 2.2 Novedades integradas al foco
- Fuente: `docs/bitacora-beta-2.md:402` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-28 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: getNovedadesSetter excluye el aviso del lead-foco, el panel va debajo del foco y cada aviso aterriza en su paso por el ancla de stage (sin ?step=).
- Referencias: src/lib/leados/novedades.ts · src/app/(protected)/setter/page.tsx · novedades-panel.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-692] 2.3 Cabina subordinada (atajos viejos no-op + cartera secundaria pulida)
- Fuente: `docs/bitacora-beta-2.md:440` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-28 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: No quedaban atajos del modelo viejo; hover diseñado y riel neutro en la cartera; el pin se deja como está.
- Referencias: cartera-view.tsx · src/lib/leados/flow.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-693] 2.4 Estados de carga y error del foco
- Fuente: `docs/bitacora-beta-2.md:472` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: loading.tsx redibujado al modo dirección y error.tsx con logger.error + Sentry.captureException; lógica pura sin tocar.
- Referencias: src/app/(protected)/setter/loading.tsx · src/app/(protected)/setter/error.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-694] 2.5 Onboarding del setter explica el modo dirección
- Fuente: `docs/bitacora-beta-2.md:514` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: La misma card descartable suma el bloque 'Trabajás un lead por vez'; STORAGE_KEY pasa de v1 a v2 para re-mostrarse una vez.
- Referencias: src/app/(protected)/setter/_components/onboarding-hint.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-695] Cierre del Bloque 2 'Foco / Modo dirección' (2.1→2.5)
- Fuente: `docs/bitacora-beta-2.md:545` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Base e2e estable en 32/10/8 (sin spec de /setter); pendientes a Franco: pin-como-foco y e2e de onboarding del cliente.
- Referencias: también en docs/bitacora-beta-2.md:559 · también en docs/bitacora-beta-2.md:560
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-696] B6.6 pasada perceptual del wizard y del home
- Fuente: `docs/bitacora-beta-3.md:620` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Sprint nombrado para cerrar lo visual de B6.2-B6.5; no aparece como sección en el documento.
- Referencias: también en fuente:641,665
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-697] Sprint 2.3 remediación A-14/A-24/A-09
- Fuente: `docs/bitacora-beta-3.md:683` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Teléfono re-servido, guardia de salida en Evaluación, archivo categorizado (archivoMotivo, VistaCartera) y archivados suman a Tu semana; proof-screenshots gitignorado.
- Referencias: commit 6dd4946 · flow.ts · progreso.ts · cartera-toolbar.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-698] Bloque 6: pin ordena el foco, novedades informan, guía en estructura
- Fuente: `docs/bitacora-beta-3.md:1024` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-04 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: particionarCartera/ordenFoco (invariante particion), AbrirFocoButton + resumen de cola en revisión, onboarding-hint.tsx borrado.
- Referencias: también en fuente:1046,1074 · commits 7b3e491,811362c,7074ba6 · particion.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-699] 2.1 el foco no miente (cadencia, postergado, rechazado)
- Fuente: `docs/bitacora-beta-3.md:1290` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-17 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: os-commercial.ts: SIN_RESPUESTA escribe nextFollowUpAt null, contactos limpian reactivateAt, rama RECHAZADO; señal sinProximoToque; spec foco-no-miente.
- Referencias: os-commercial.ts · home.ts · tests/leados/foco-no-miente.spec.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-700] Navegación del setter: triggerTransition vs CLAUDE.md
- Fuente: `docs/bitacora-beta-3.md:1806` · tipo: decision · estado declarado: abierta · fecha: 2026-07-23 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: setter-nav.tsx:38 dice «decisión cerrada · CLAUDE.md», pero CLAUDE.md no clasifica /setter; falta que CLAUDE.md lo diga (C-26).
- Referencias: setter-nav.tsx:38 · también en fuente:633
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-701] Novedades sin techo y huérfanas
- Fuente: `docs/bitacora-beta-3.md:1877` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: El home acumula novedades (campana 9+); 77 de 80 avisos eran huérfanos de leads borrados.
- Referencias: también en fuente:4545,4792
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-702] P8 el foco prioriza construir
- Fuente: `docs/bitacora-beta-3.md:2795` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-04 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: trabajoTier en flow.ts (CONSTRUIR, ESPERA_TU_ACCION, CONTACTAR_CON_DEMO, EVALUAR, CONTACTO_SIN_DEMO); nunca sugiere construir sin veredicto.
- Referencias: flow.ts · particion.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-703] Exports sin consumidor en el foco
- Fuente: `docs/bitacora-beta-3.md:2921` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-04 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: agruparParaHome (flow.ts:532) y soltarFoco no los llama nadie.
- Referencias: flow.ts:532 · también en fuente:4909
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-704] Panel pide mandar link de demo aprobada sin finalUrl
- Fuente: `docs/bitacora-beta-3.md:3921` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-10 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: grupoPara/proximaAccionPara no miran finalUrl; el admin no puede aprobar sin link y el setter ve «Seguí la cadencia».
- Referencias: flow.ts · también en fuente:4848
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-705] Contraste AA incumplido en /setter
- Fuente: `docs/bitacora-beta-3.md:4130` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-12 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: 46 de 103 textos visibles no llegan a AA; el peor da 1,97:1 a 10 px.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-706] F3 acuse de recibo en el lugar del clic
- Fuente: `docs/bitacora-beta-3.md:4561` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: «Saltar» del foco suma toast; invariante acuse-recibo por call-site (22 invariantes).
- Referencias: commit fc9ea865 · foco-surface.tsx · acuse-recibo.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-707] Orden «colas» de la cartera inalcanzable
- Fuente: `docs/bitacora-beta-3.md:5038` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-24 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: cartera-view.tsx:36 degrada 'colas' a 'urgencia' y el valor no está en ORDEN_OPCIONES.
- Referencias: cartera-view.tsx:36
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-708] El rail «Tus herramientas» muestra «pendiente» sin salida
- Fuente: `docs/bitacora-beta-3.md:7025` · tipo: pendiente · estado declarado: anotado, no tocado · fecha: 2026-08-26 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: tools-rail.tsx dice «pendiente» y nada más. Es el panel persistente del shell, no un bloque de munición; se declaró y se dejó sin tocar en tres sprints.
- Referencias: tools-rail.tsx:41-43 · tambien en docs/bitacora-beta-3.md:7732 · tambien en docs/bitacora-beta-3.md:7852 · tambien en docs/bitacora-beta-3.md:8076
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-709] P5 VOCABULARIO: un concepto, un nombre
- Fuente: `docs/bitacora-beta-3.md:7052` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-26/27 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Pausar (personal) y Postergar (comercial) quedan separados, con la vista y el filtro «Postergados por el negocio». El motivo del tilde cambia según el stage, el rail apunta a «Tu día», se dice «construir» y no «producir la demo», y se fue «(Evaluación)». Invariante vista-cartera.
- Referencias: fix/vocabulario · 6ef28432 · fa4af2a0 · flow.ts (vistaDeLead) · src/lib/leados/vista-cartera.invariant.ts · m-construccion.tsx +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-710] Pausar y postergar son dos conceptos; manda la pausa personal
- Fuente: `docs/bitacora-beta-3.md:7060` · tipo: decision · estado declarado: decidido · fecha: 2026-08-26/27 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: La pausa es snoozedUntil, privada por (lead, setter) y sin cron. La postergación es status POSTERGADO más reactivateAt: global, y la levanta el cron. Si coexisten gana la pausa, y cada filtro contiene lo que dice su nombre.
- Referencias: cartera.actions.ts:74 · os-commercial.ts:181 · flow.ts:766 · api/cron/os-follow-up/route.ts:112-119 · tambien en docs/bitacora-beta-3.md:7071
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-711] P7 LA QUINTA SUPERFICIE: una demo aprobada sin link permanente ya no se ofrece para mandar
- Fuente: `docs/bitacora-beta-3.md:7258` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-27 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: finalUrl llega a HomeLeadInput. proximaAccionPara, grupoPara y esperaDe distinguen con o sin link, el contador del panel pasa a contarEnVueloPorTurno y FALTA_LINK_PERMANENTE es la fuente única del texto. Invariante aprobada-sin-link con censo y guard de descubrimiento; spec 18.
- Referencias: fix/quinta-superficie · 035f90a1 · src/lib/leados/aprobada-sin-link.invariant.ts · flow.ts · turno.ts · setter/page.tsx +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-712] Trampa latente en describirFoco (paso.ts) para APROBADA
- Fuente: `docs/bitacora-beta-3.md:7301` · tipo: pendiente · estado declarado: latente, anotado en el archivo · fecha: 2026-08-27 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: En APROBADA diría «Enviá el link de la demo» mirando solo el gate del brief. Hoy no se renderiza; la trampa quedó anotada en el propio archivo.
- Referencias: paso.ts:165 · tambien en docs/bitacora-beta-3.md:8076
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-713] APROBADA con toque vencido cae en «trabajar» con una sugerencia no accionable
- Fuente: `docs/bitacora-beta-3.md:7400` · tipo: pendiente · estado declarado: preexistente, anotado, no arreglado · fecha: 2026-08-27 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Con la demo sin mandar, el gate cerrado y el toque vencido, el lead entra a la cola de trabajo y hasta puede ser el foco, pero la tarjeta dice «esperá». Grupo y accionabilidad salen de dos escaleras independientes.
- Referencias: flow.ts:433
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-714] P8 UNA SOLA FUENTE: cuatro duplicaciones cerradas
- Fuente: `docs/bitacora-beta-3.md:7406` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: SOLO_DMS_MANDADOS y dmsMandadosHoyWhere pasan a ser el único where del contador; esReloopRechazo lee LEGAL_TRANSITIONS con guard de aridad; finDePausaAR ancla la pausa al día AR (invariante pausa-dia bajo TZ=UTC); y la cuenta de invariantes queda exacta en 48.
- Referencias: fix/una-sola-fuente · 0c92dd08 · isolation.ts · escalamiento.ts:56 · reloop-selfcheck-reset.invariant.ts · cartera.schemas.ts +6
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-715] El cartel del home nombra la fase «Seguimiento»
- Fuente: `docs/bitacora-beta-3.md:7853` · tipo: pendiente · estado declarado: anotado, sin hacer · fecha: 2026-08-30 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: paso.ts manda a seguir el contacto en «Seguimiento», que es una fase y no una pantalla; además el envío tiene pantalla propia (m15). Queda fuera del invariante de enlaces.
- Referencias: paso.ts:184 · tambien en docs/bitacora-beta-3.md:8076
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-716] Tres leads «CORRIDA» quedaron en la base dev
- Fuente: `docs/bitacora-beta-3.md:8297` · tipo: pendiente · estado declarado: anotado; no se borraron a propósito · fecha: 2026-08-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Un postergado, un descartado y un evaluado: se dejaron a propósito como evidencia del recorrido.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-717] El rail sigue ofreciendo el «Chat de evaluación» de un paso que ya no existe
- Fuente: `docs/bitacora-beta-3.md:8779` · tipo: pendiente · estado declarado: no tocado a propósito (decisión de Franco) · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Es una fila inerte (url: null) que anuncia una herramienta y una fase que la fusión retiró. Borrar la entrada de herramientas.ts lo decide Franco.
- Referencias: herramientas.ts · tools-rail.tsx · tambien en docs/bitacora-beta-3.md:9177
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-718] Padding del scroller del shell del setter (main py-8)
- Fuente: `docs/bitacora-beta-3.md:9451` · tipo: pendiente · estado declarado: anotado, fuera de alcance · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Son 32 px de cromo en las catorce pantallas, pero pertenecen al shell que comparten el home y la cartera: tocarlo mueve pantallas de fuera del manual.
- Referencias: shell del setter (main py-8)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-719] P21 LA COLA DE TRABAJO: el panel muestra la cola del día y no un lead por vez
- Fuente: `docs/bitacora-beta-3.md:10240` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-09-03 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: cola.ts y cola-del-dia.tsx, con el foco como primer ítem y un tope de 5. Las novedades se deduplican por lead visible, se agrupan y bajan (1.346 → 582 px a 1440). «Soltar» quedó conectado a soltarFoco y se fue «Leads activos». Invariante cola; spec 26.
- Referencias: fix/cola-de-trabajo · c8e0da7a · 29d0635f · cola.ts · cola-del-dia.tsx · novedades-agrupar.ts +4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-720] Dos avisos con acción del mismo negocio se muestran los dos
- Fuente: `docs/bitacora-beta-3.md:10447` · tipo: decision · estado declarado: decidido · fecha: 2026-09-03 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: «Franco aprobó» y «Franco pidió cambios» de vueltas distintas son dos hechos, y plegarlos escondería un «Abrir». Queda como está.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-721] TOPE_COLA = 5 se eligió, no se midió
- Fuente: `docs/bitacora-beta-3.md:10451` · tipo: pendiente · estado declarado: a revisar con uso real · fecha: 2026-09-03 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: El tope no se contrastó con el ritmo real de un setter: si queda corto o largo se cambia en una línea. Un aviso vigente puede apuntar a un lead que quedó fuera de las cinco filas.
- Referencias: TOPE_COLA · tambien en docs/bitacora-beta-3.md:10863
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-722] P22 PARA QUÉ SIRVE LA CARTERA: la cartera agrupada por lo que toca hacer
- Fuente: `docs/bitacora-beta-3.md:10456` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-09-03/06 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: agruparCartera y VISTAS_CARTERA son la fuente única de encabezados y filtro. «Para trabajar» queda abierto y los otros siete grupos plegados con su conteo. Se fueron el orden muerto «colas» y el badge de etapa en jerga, y Fijar/Pausar/Nota tienen rótulo visible. Spec 27.
- Referencias: fix/cartera-para-que · c8e0da7a · flow.ts (agruparCartera, VISTAS_CARTERA) · home-empty.tsx:18 · tests/helpers/setter-ui.ts (expandirGruposCartera) · scripts/qa-corridas/medir-cartera.ts +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-723] El mapa de la cartera queda al fondo de todo
- Fuente: `docs/bitacora-beta-3.md:10635` · tipo: idea · estado declarado: anotado, no hecho · fecha: 2026-09-03/06 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Con «Para trabajar» abierto, los otros siete encabezados quedan detrás de 49 tarjetas. Una salida posible es una franja de conteos en la cabecera de la cartera. El grupo abierto, además, está fijo en VISTA_ABIERTA y la cartera sigue colapsada por defecto.
- Referencias: VISTA_ABIERTA · tambien en docs/bitacora-beta-3.md:10641 · tambien en docs/bitacora-beta-3.md:10643
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-724] B0.1 Shell del setter (rail + contenido)
- Fuente: `docs/bitacora-beta.md:46` · tipo: hecho-declarado · estado declarado: hecho (verificación perceptual de Franco declarada) · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: setter-shell.tsx espeja la geometría del admin (rail 240px, drawer mobile, main scrolleable); layout.tsx sigue Server Component con auth intacta.
- Referencias: src/app/(protected)/setter/_components/setter-shell.tsx · src/app/(protected)/setter/layout.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-725] B0.2 Barra de navegación del setter (setter-nav)
- Fuente: `docs/bitacora-beta.md:82` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Rail con destinos reales (único hub /setter 'Cartera'), pill activa con layoutId namespaced y aria-current; sin rutas inventadas.
- Referencias: src/app/(protected)/setter/_components/setter-nav.tsx · src/app/(protected)/setter/_components/setter-shell.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-726] Navegación del rail del setter solo por triggerTransition()
- Fuente: `docs/bitacora-beta.md:92` · tipo: decision · estado declarado: vigente en su momento · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Decisión cerrada en B0.2: sin <Link>, router.push ni useRouter en la barra. Después prev/next y atajos usan <Link>/.click() para no pasar por el shutter.
- Referencias: src/app/(protected)/setter/_components/setter-nav.tsx · src/context/TransitionContext.tsx · también en docs/bitacora-beta.md:269 · también en docs/bitacora-beta.md:779
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-727] Validar salto entre rutas por triggerTransition con 2+ destinos en el rail
- Fuente: `docs/bitacora-beta.md:124` · tipo: pendiente · estado declarado: pendiente (condicional) · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Cuando el rail tenga 2 o más destinos, validar el click-nav entre rutas y el caveat de hydration mismatch de TransitionContext en dev (prod OK).
- Referencias: src/context/TransitionContext.tsx · también en docs/bitacora-beta.md:128 · también en docs/bitacora-beta.md:278
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-728] B0.3 Scoreboard de solo lectura + numeración única + hint de-numerado
- Fuente: `docs/bitacora-beta.md:132` · tipo: hecho-declarado · estado declarado: hecho (sign-off perceptual de Franco) · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: StatCards envueltos en una sección de solo lectura ('De un vistazo') y onboarding-hint sin numerar; el stepper de 5 etapas queda como única fuente numerada.
- Referencias: src/app/(protected)/setter/page.tsx · src/app/(protected)/setter/_components/onboarding-hint.tsx · marcador de 5 StatCards retirado en 2.1a según docs/bitacora-beta-2.md:478
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-729] FG-0 cierre: z-index del chrome a tokens + 5 regresiones B9
- Fuente: `docs/bitacora-beta.md:212` · tipo: hecho-declarado · estado declarado: hecho (sign-off perceptual de Franco) · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Shell y drawer del setter consumen el tier app* de design-tokens.ts; banner de rechazo, lane prioritario, paso activo y DecisionBar elevados; pill de stage del admin cableada a STAGE_TONE.
- Referencias: src/lib/design-tokens.ts · setter-shell.tsx · lead-wizard.tsx · home-sections.tsx · dossier-stepper.tsx · src/app/(protected)/admin/leados/[leadId]/page.tsx +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-730] Disciplina de color B9: cyan = accionable, el resto informativo
- Fuente: `docs/bitacora-beta.md:226` · tipo: decision · estado declarado: vigente · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: El 'plano' se ataca con elevación y jerarquía, nunca re-saturando; stage y rótulos informativos en tonos semánticos, nunca cyan.
- Referencias: también en docs/bitacora-beta.md:280 · también en docs/bitacora-beta.md:1249 · también en docs/bitacora-beta.md:1502
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-731] Cierre del bloque FG-0 (chrome del setter + reconciliación visual)
- Fuente: `docs/bitacora-beta.md:263` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: B0.1–B0.4 más la pasada de cierre; todo presentación, tsc 0, build verde, 61 migraciones.
- Referencias: también en docs/bitacora-beta.md:46 · también en docs/bitacora-beta.md:82 · también en docs/bitacora-beta.md:132 · también en docs/bitacora-beta.md:178 · también en docs/bitacora-beta.md:212
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-732] FG-0.5 Índices compuestos para la cabina del operador
- Fuente: `docs/bitacora-beta.md:359` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: OsLead[assignedToId,nextFollowUpAt] y OsLeadActivity[performedById,createdAt]; migración solo aditiva aplicada con migrate deploy.
- Referencias: prisma/migrations/20260619132830_add_operator_cabin_indexes/migration.sql · prisma/schema.prisma
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-733] Rótulo del criterio de orden por card (motivoOrden)
- Fuente: `docs/bitacora-beta.md:578` · tipo: hecho-declarado · estado declarado: hecho (sign-off perceptual de Franco) · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Chip neutro por card en 'Para trabajar ahora' con el tier real (respondió, caliente, orden de llegada).
- Referencias: src/lib/leados/flow.ts · home-sections.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-734] motivoOrden debe mantenerse en sincronía con el sort de urgencia
- Fuente: `docs/bitacora-beta.md:591` · tipo: decision · estado declarado: vigente · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Criterio y rótulo son dos lecturas de la misma regla; si otro lane pasa a ordenarse por urgencia hay que extender motivoOrden.
- Referencias: src/lib/leados/flow.ts · también en docs/bitacora-beta.md:620 · también en docs/bitacora-beta-2.md:353
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-735] Palancas de la cartera: buscar/filtrar/ordenar + fijar/pausar/nota privada
- Fuente: `docs/bitacora-beta.md:668` · tipo: hecho-declarado · estado declarado: hecho (falta confirmar privacidad con 2 setters reales) · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Toolbar client-side y tabla nueva OsLeadSetterMeta (privada por setterId) con server actions ownership-gated; invariante check:invariant:setter-meta.
- Referencias: cartera-toolbar.tsx · cartera-view.tsx · src/app/(protected)/setter/_actions/cartera.actions.ts · cartera.schemas.ts · lead-card-actions.tsx · src/lib/leados/setter-meta.ts +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-736] Snooze de cartera (personal) y 'Postergar' del Paso 9 (comercial) conviven
- Fuente: `docs/bitacora-beta.md:715` · tipo: decision · estado declarado: vigente · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Son cosas distintas a propósito; si se confunden en uso, revisar etiquetas.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-737] Atajos de teclado del operador + ayuda mínima
- Fuente: `docs/bitacora-beta.md:762` · tipo: hecho-declarado · estado declarado: hecho; los atajos del modelo viejo desaparecen con 2.1a (quedan t/p/s/?) · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: useKeyboardShortcuts con guard de campos de escritura; j/k/Enter/r en la cartera y j/k/b en el recorrido; pastilla de ayuda.
- Referencias: src/app/(protected)/setter/_components/use-keyboard-shortcuts.ts · shortcuts-help.tsx · también en docs/bitacora-beta-2.md:445
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-738] Atajos = el mismo click; acciones sensibles sin atajo
- Fuente: `docs/bitacora-beta.md:767` · tipo: decision · estado declarado: vigente · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Enviar opener/demo, transiciones y fijar/pausar siguen siendo click con su gate; los atajos activan el <Link> existente (.click()), no router.push ni triggerTransition.
- Referencias: también en docs/bitacora-beta.md:779
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-739] 0.5.8 Novedades dirigidas al setter (OsSetterNotice)
- Fuente: `docs/bitacora-beta.md:974` · tipo: hecho-declarado · estado declarado: hecho (verificación funcional de Franco) · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Avisos in-app de lead asignado, demo aprobada/rechazada y reasignación saliente; badge en el topbar y 'demos esperando a Franco'; invariante check:invariant:novedades.
- Referencias: src/lib/leados/novedades.ts · src/lib/leados/novedades.invariant.ts · src/app/(protected)/setter/_actions/novedades.actions.ts · novedades-panel.tsx · novedades-marcar-visto.tsx · prisma/migrations/20260620190000_add_setter_novedades +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-740] Avisos al setter in-app, no por Telegram
- Fuente: `docs/bitacora-beta.md:982` · tipo: decision · estado declarado: vigente · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: sendTelegram resuelve a un único chat (Franco) y no hay chatId por setter.
- Referencias: src/lib/notifications/telegram.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-741] Telegram al setter con chatId por usuario
- Fuente: `docs/bitacora-beta.md:1027` · tipo: idea · estado declarado: sin estado (propuesta) · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Desbloqueo futuro fuera de scope para que las novedades también lleguen por Telegram al setter.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-742] 0.5.9 Carril 'Continuá donde dejaste'
- Fuente: `docs/bitacora-beta.md:1031` · tipo: hecho-declarado · estado declarado: hecho; reemplazado por el foco de 2.1a · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: CTA arriba del home al tope de 'trabajar' (próxima acción más urgente, no último lead tocado).
- Referencias: continuar-cta.tsx · cartera-view.tsx · borrado en docs/bitacora-beta-2.md:323
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-743] 0.5.10 'Tu semana' (señal de avance del setter)
- Fuente: `docs/bitacora-beta.md:1069` · tipo: hecho-declarado · estado declarado: hecho (sign-off perceptual de Franco) · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Contactos, demos enviadas y reuniones en ventana móvil de 7 días; se oculta en cero, sin metas ni ranking; fix ESLint de onboarding-hint.
- Referencias: src/lib/leados/progreso.ts · src/app/(protected)/setter/_components/progreso-semana.tsx · src/app/(protected)/setter/page.tsx · onboarding-hint.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-744] 0.5.11 'Mis números' del setter
- Fuente: `docs/bitacora-beta.md:1111` · tipo: hecho-declarado · estado declarado: hecho (verificación con 2 setters pendiente) · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Leads activos y ratio descarte/avance propios reusando calcularRatioSetters; invariante check:invariant:mis-numeros; ESTADOS_TERMINALES movido a revision.ts.
- Referencias: src/lib/leados/mis-numeros.ts · src/lib/leados/mis-numeros.invariant.ts · src/app/(protected)/setter/_components/mis-numeros.tsx · src/lib/leados/revision.ts · src/lib/leados/setter-carga.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-745] Al setter no se le muestra la alarma 'nunca descarta'
- Fuente: `docs/bitacora-beta.md:1122` · tipo: decision · estado declarado: vigente · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: alarmaNuncaDescarta es lectura de gestión del admin; al setter se le muestra su número, no un juicio.
- Referencias: src/lib/leados/revision.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-746] Cierre del bloque FG-0.5 (cabina del operador + handoffs)
- Fuente: `docs/bitacora-beta.md:1237` · tipo: hecho-declarado · estado declarado: hecho (verificación perceptual de cada superficie en cola de Franco) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: 11 piezas (índices, 3 admin, 7 del setter), isolation.ts como fuente única de aislamiento y 6 invariantes sin DB verdes.
- Referencias: commit feat(fg-0.5 admin) · src/lib/leados/isolation.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-747] Patrón de trabajo heredado por FG-1
- Fuente: `docs/bitacora-beta.md:1253` · tipo: decision · estado declarado: vigente · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Descubrimiento con Explore → módulo puro + invariante ejecutable por regla de aislamiento → smoke HTTP autenticado (dev:qa) en pantallas auth-gated.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-748] FG-1.1 Onboarding del setter enseña el flujo invertido
- Fuente: `docs/bitacora-beta.md:1291` · tipo: hecho-declarado · estado declarado: hecho (sign-off perceptual de Franco) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: 4 tarjetas (el score marca el camino, opener antes que demo, la espera, caliente adelanta la demo) y banda 'Ojo'.
- Referencias: src/app/(protected)/setter/_components/onboarding-hint.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-749] Seed de estados del setter (7 leads QA)
- Fuente: `docs/bitacora-beta.md:1673` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-25 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: qaLeadSeeds con ensureLeadDossier idempotente en seed-agency-os.ts: ficha a medias, caliente, en revisión, aprobado, rechazado, descartado y postergado vencido.
- Referencias: prisma/seed-agency-os.ts · también en docs/bitacora-beta-2.md:83
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-750] Smoke test e2e del setter (tests/setter/, 35 tests) + diagnóstico de drift
- Fuente: `docs/bitacora-beta.md:1729` · tipo: hecho-declarado · estado declarado: suite escrita y type-clean; ejecución en browser pendiente; reconciliación pendiente del OK de Franco · fecha: 2026-06-22 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Suite aislada con playwright.setter.config.ts y npm run test:setter contra build de producción; se borró el BOT_DELETED duplicado del schema que rompía el build.
- Referencias: docs/smoke-report.md · tests/setter/ · playwright.setter.config.ts · prisma/schema.prisma · también en docs/bitacora-beta.md:1631 · también en docs/bitacora-beta.md:1748 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-751] B1 (LeadOS) — Capa de acceso del setter
- Fuente: `docs/bitacora-roadmap.md:7819` · tipo: hecho-declarado · estado declarado: en curso · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Rol SETTER (migración aditiva), requireSetter(), rama SETTER en src/proxy.ts, zona /setter con guard propio, signIn que exime a SETTER, getOwnedLead por assignedToId, seed de setter QA y procedimiento de alta; el bloque no se cierra hasta la verificación manual.
- Referencias: prisma/schema.prisma · prisma/migrations/20260611210802_add_setter_role/ · src/lib/auth-guards.ts · src/proxy.ts · src/auth.ts · src/auth.config.ts +10
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-752] Alta de setters solo por credenciales (Google prohibido)
- Fuente: `docs/bitacora-roadmap.md:7838` · tipo: decision · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: El profile() de Google fuerza ORG_MEMBER; el login por magic link de un setter ya creado sí se permite.
- Referencias: docs/leados-alta-setter.md · tambien en docs/bitacora-roadmap.md:7899
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-753] No crear requireSetterOrAdmin() hasta que haya consumidor
- Fuente: `docs/bitacora-roadmap.md:7842` · tipo: decision · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Una superficie compartida va a necesitar acceso a datos distinto por rol (admin ve todo, setter lo suyo); se diseña cuando exista.
- Referencias: src/lib/auth-guards.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-754] Verificación manual de Franco de B1 y B2 LeadOS
- Fuente: `docs/bitacora-roadmap.md:7888` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-12 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: B2: Prisma Studio con tablas intactas y /admin/leads igual que antes. B1: alta, login, cambio de password, redirects de las 3 identidades, getOwnedLead con lead real y sesión del setter.
- Referencias: tambien en docs/bitacora-roadmap.md:7892 · tambien en docs/bitacora-roadmap.md:7902 · tambien en docs/bitacora-roadmap.md:7904
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-755] /setter muestra el navbar público y el widget de chat marketing
- Fuente: `docs/bitacora-roadmap.md:7897` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Vienen del root layout; el shell propio del panel setter llega con el wizard.
- Referencias: src/app/(protected)/setter/layout.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-756] B0.1 shell del setter (rail + contenido)
- Fuente: `docs/bitacora-roadmap.md:10565` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: setter-shell espeja la geometría del admin con drawer mobile.
- Referencias: src/app/(protected)/setter/_components/setter-shell.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-757] B0.2 navegación del setter
- Fuente: `docs/bitacora-roadmap.md:10601` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: setter-nav con un único destino /setter, navegación solo por triggerTransition().
- Referencias: src/app/(protected)/setter/_components/setter-nav.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-758] Validar salto entre rutas del setter
- Fuente: `docs/bitacora-roadmap.md:10647` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Cuando haya ≥2 destinos, verificar en runtime triggerTransition y el caveat de hydration.
- Referencias: también en fuente:10797
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-759] B0.3 scoreboard de solo lectura + numeración única
- Fuente: `docs/bitacora-roadmap.md:10651` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Scoreboard no clickeable y hint de-numerado; el stepper de 5 etapas manda.
- Referencias: src/app/(protected)/setter/page.tsx · src/app/(protected)/setter/_components/onboarding-hint.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-760] Cierre del bloque FG-0
- Fuente: `docs/bitacora-roadmap.md:10782` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-dia
- Qué es: Chrome del setter y reconciliación visual de LeadOS completos (B0.1-B0.4 + cierre).
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h5.set-importar — Importar prospectos

#### [PLAN-761] A.2 importación masiva CSV de prospectos
- Fuente: `docs/bitacora-beta-3.md:425` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-importar
- Qué es: prospecto-import.ts (parser RFC-4180), importarProspectos con $transaction, tope MAX_FILAS_IMPORT=500, ruta /setter/nuevo/importar, invariante prospecto-import.
- Referencias: lib/leados/prospecto-import.ts · prospecto-bulk.actions.ts · prospecto-import.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-762] Mapeo flexible de columnas en la importación CSV
- Fuente: `docs/bitacora-beta-3.md:431` · tipo: idea · estado declarado: sin estado · **ZONA-FRANCO**
- Nodo(s): h5.set-importar
- Qué es: Formato fijo v1 (COLUMNAS_IMPORT); mapeo flexible queda a futuro.
- Referencias: prospecto-import.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-763] Dedup cross-setter por existencia global
- Fuente: `docs/bitacora-beta-3.md:436` · tipo: decision · estado declarado: vigente · **ZONA-FRANCO**
- Nodo(s): h5.set-importar
- Qué es: nombresEnSistema en la action devuelve solo un bit; excepción deliberada al aislamiento de lectura; CSV nativo sin dependencia.
- Referencias: prospecto-bulk.actions.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h5.set-lead — Ficha del lead

#### [PLAN-764] admin-0 Regla 'caliente' unificada en esCaliente() excluyendo DESCARTADA
- Fuente: `docs/bitacora-beta-2.md:138` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: 5 copias inline desincronizadas reemplazadas por esCaliente(score, stage?) en revision.ts; comportamiento neutro probado por equivalencia.
- Referencias: src/lib/leados/revision.ts · src/lib/leados/flow.ts · src/app/(protected)/setter/page.tsx · opener-step.tsx · dossier.actions.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-765] admin-1c La opinión del setter sobre temperatura pasa a informativa
- Fuente: `docs/bitacora-beta-2.md:237` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: notificarEvaluacionCaliente renombrada notificarEvaluacionScoreAlto con texto informativo; el veredicto CALIENTE queda documentado como lectura del setter.
- Referencias: src/lib/leados/notify.ts · dossier.actions.ts · src/lib/leados/contracts.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-766] calienteNotificadaAt conserva su nombre legacy
- Fuente: `docs/bitacora-beta-2.md:246` · tipo: decision · estado declarado: vigente · fecha: 2026-06-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Es flag de idempotencia de la notificación; renombrarlo exigiría migrar blobs y podría re-notificar.
- Referencias: src/lib/leados/contracts.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-767] admin-1d Gate server-side de demo preventiva lee el campo caliente
- Fuente: `docs/bitacora-beta-2.md:262` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: transitionDossier case BRIEF reusa gateBriefAbierto(status, caliente); el score del setter deja de abrir el brief; harness b2-verify-dossier actualizado (18/18).
- Referencias: src/lib/leados/dossier.ts · scripts/b2-verify-dossier.ts · cierra docs/bitacora-beta-2.md:258 y :561
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-768] Lint react-hooks/purity en seguimiento-step.tsx
- Fuente: `docs/bitacora-beta-3.md:193` · tipo: pendiente · estado declarado: pendiente (archivo retirado L1003) · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: new Date(Date.now()) del date-picker; candidato a sprint propio. El archivo figura retirado en 5.6 y el form nuevo usa useState lazy.
- Referencias: también en fuente:209,231,277,387,972
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-769] Bloque 3 wizard del lead cerrado (3.1-3.7 + 4·C)
- Fuente: `docs/bitacora-beta-3.md:283` · tipo: hecho-declarado · estado declarado: hecho (luego retirado en 5.6) · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Wizard de página larga guiado: PasoActualBanner/StepAnchor, GUIA_* en guidance-content.ts, error.tsx/loading.tsx de [leadId], StepLink. El propio doc lo declara retirado en 5.6 (L1003).
- Referencias: también en fuente:12,16,67,103,137,173,213,247,365 · guidance-content.ts · paso-actual-banner.tsx · step-anchor.tsx · step-nav.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-770] V-1 seed QA: un lead por estado del wizard
- Fuente: `docs/bitacora-beta-3.md:297` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: scripts/v1-qa-wizard-states.ts siembra 13 leads «QA-W» owned por setter-qa, idempotente, solo branch Neon dev; stage directo permitido en seed, no en app.
- Referencias: scripts/v1-qa-wizard-states.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-771] 5.2/5.3 tests de claim atómico, assign admin y suite test:leados
- Fuente: `docs/bitacora-beta-3.md:457` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Specs 06-claim-atomico, 07-admin-assign-caliente; playwright.leados.config.ts con dossier-gates, envio-demo-rechazo, selfcheck-anti-bypass, alta-import; invariantes gate-envio y self-check.
- Referencias: también en fuente:482 · tests/setter/06-claim-atomico.spec.ts · tests/leados/ · playwright.leados.config.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-772] B6.1/B6.2/B6.3/B6.5 fixes del wizard y del rail
- Fuente: `docs/bitacora-beta-3.md:564` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: openerPendiente, GuiaRetrabajo en RECHAZADA, RELOOP_RESET limpia solo selfCheckJson (invariante reloop-selfcheck), botón «Cargar prospecto» en setter-nav.tsx, router.refresh en escalar-modal.
- Referencias: también en fuente:596,624,645 · escalamiento.ts · dossier.ts · setter-nav.tsx · reloop-selfcheck-reset.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-773] Remediación 3.1/3.2: useStepAction, auxiliares y derivarPasoDelLead
- Fuente: `docs/bitacora-beta-3.md:715` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Hook src/lib/use-step-action.ts (9 call-sites), auxiliares extraídos de construccion-step y derivación única src/lib/leados/paso.ts.
- Referencias: también en fuente:792 · src/lib/use-step-action.ts · src/lib/leados/paso.ts · commit 2d8a3bc
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-774] Adopción de useStepAction en ~10 componentes
- Fuente: `docs/bitacora-beta-3.md:740` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: ficha-step, nuevo-prospecto-form, importar, foco-surface, lead-card-actions, novedades-marcar-visto, etc. repiten el ciclo submit a mano.
- Referencias: también en fuente:754,4606
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-775] El setter no puede cargar googleMapsUrl ni currentWebUrl
- Fuente: `docs/bitacora-beta-3.md:2376` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-03 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: No están en el alta ni en el CSV y no hay action de edición de columnas del lead; exige tocar isolation.ts.
- Referencias: schema.prisma:873 · isolation.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-776] timeline sin guard exhaustivo de canal
- Fuente: `docs/bitacora-beta-3.md:5777` · tipo: pendiente · estado declarado: anotado, no hecho · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: El eje de canal del invariante timeline («SISTEMA se muestra pero NO cuenta») se sigue probando con casos puntuales. Le falta el censo de ActivityChannel que se le agregó a contador-dms.
- Referencias: check:invariant:timeline · src/lib/leados/contador-dms.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-777] Test de aislamiento DB-bound de ownership.ts
- Fuente: `docs/bitacora-beta.md:114` · tipo: pendiente · estado declarado: pendiente (fuera de scope) · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: No hay runner unitario; un invariante DB-bound exige sembrar 2 setters con leads cruzados. Quedó fuera de scope (se usaron invariantes puros sin DB).
- Referencias: src/lib/leados/ownership.ts · también en docs/bitacora-beta.md:542
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-778] Errores ESLint react-hooks pre-existentes en el setter
- Fuente: `docs/bitacora-beta.md:174` · tipo: pendiente · estado declarado: parcial: page.tsx:34 (:687), construccion-step.tsx:53 (:941) y onboarding-hint.tsx:39 (:1085) declarados resueltos; seguimiento-step.tsx sigue vivo (:1508) · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: purity en setter/page.tsx:34 y en seguimiento-step.tsx (Date.now() en minReactivacion); set-state-in-effect en onboarding-hint.tsx:39 y construccion-step.tsx:53.
- Referencias: src/app/(protected)/setter/leads/[leadId]/_components/seguimiento-step.tsx · también en docs/bitacora-beta.md:208 · también en docs/bitacora-beta.md:277 · también en docs/bitacora-beta.md:331 · también en docs/bitacora-beta.md:355 · también en docs/bitacora-beta.md:1398 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-779] B0.4 Headers 'Paso N' reconciliados con el stepper de 5 etapas
- Fuente: `docs/bitacora-beta.md:178` · tipo: hecho-declarado · estado declarado: hecho (sign-off perceptual de Franco) · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Paso 1–4 solo en ficha, evaluación, brief y construcción; opener, seguimiento, agenda, draft y self-check sin número; cross-refs de copy realineadas.
- Referencias: opener-step.tsx · seguimiento-step.tsx · agenda-step.tsx · draft-step.tsx · self-check-step.tsx · brief-step.tsx +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-780] El stepper de 5 etapas es la única numeración del flujo del setter
- Fuente: `docs/bitacora-beta.md:184` · tipo: decision · estado declarado: vigente · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Ficha·Evaluación·Brief·Construcción·Revisión (1:1 con DossierStage); toda superficie nueva del setter debe deferir a él y no numerar el flujo.
- Referencias: src/app/(protected)/setter/leads/[leadId]/_components/dossier-stepper.tsx · también en docs/bitacora-beta.md:280 · también en docs/bitacora-beta.md:1302
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-781] Wizard del lead duplicado en el DOM por variantes responsive
- Fuente: `docs/bitacora-beta.md:197` · tipo: pendiente · estado declarado: sin estado (pre-existente) · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Una copia vive bajo un ancestro display:none (pre-existente, no tocado); StepAnchor tuvo que esquivarla con offsetParent.
- Referencias: src/app/(protected)/setter/leads/[leadId]/_components/lead-wizard.tsx · también en docs/bitacora-beta.md:1166
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-782] Orientación de herramientas externas (ToolGuide + herramientas.ts + 'Tus herramientas')
- Fuente: `docs/bitacora-beta.md:284` · tipo: hecho-declarado · estado declarado: hecho (sign-off perceptual de Franco) · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Registro editable de 5 herramientas (Evaluador, Gem de diseño, Claude Design, Netlify Drop, Gem de outreach) con explicación colapsable y lanzador en cada paso y en el rail.
- Referencias: src/lib/leados/herramientas.ts · src/app/(protected)/setter/_components/tool-guide.tsx · src/app/(protected)/setter/_components/tools-rail.tsx · setter-nav.tsx · evaluacion-step.tsx · brief-step.tsx +4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-783] Cargar las 4 URLs reales de herramientas (TODO: URL)
- Fuente: `docs/bitacora-beta.md:314` · tipo: pendiente · estado declarado: pendiente (Franco) · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Franco debe reemplazar los null de herramientas.ts para Evaluador, Gem de diseño, Claude Design y Gem de outreach; hoy la UI muestra 'Link pendiente'.
- Referencias: src/lib/leados/herramientas.ts · también en docs/bitacora-beta.md:353
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-784] Migrar herramientas.ts y onboarding-hint a la fuente única de guía (FG-1.0)
- Fuente: `docs/bitacora-beta.md:354` · tipo: pendiente · estado declarado: pendiente (diferido) · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: FG-1.0 se creó (guidance-content.ts) pero el registro de herramientas y la guía del onboarding siguen localizados a propósito.
- Referencias: src/lib/leados/herramientas.ts · src/lib/leados/guidance-content.ts · onboarding-hint.tsx · también en docs/bitacora-beta.md:297 · también en docs/bitacora-beta.md:1252 · también en docs/bitacora-beta.md:1287 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-785] Autosave + guardia de salida de ficha y brief
- Fuente: `docs/bitacora-beta.md:515` · tipo: hecho-declarado · estado declarado: hecho (verificación funcional de Franco pendiente) · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: useAutosave (debounce 1200ms, maxWait 8s), useUnsavedGuard (beforeunload) e indicador de estado; el autosave del brief solo en stage BRIEF y nunca transiciona.
- Referencias: src/lib/use-autosave.ts · src/lib/use-unsaved-guard.ts · src/app/(protected)/setter/_components/autosave-status.tsx · ficha-step.tsx · brief-step.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-786] Autoguardar la captura inicial del brief en EVALUADA
- Fuente: `docs/bitacora-beta.md:573` · tipo: idea · estado declarado: sin estado (posible follow-up) · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Exigiría un path que persista briefJson parcial sin transicionar (schema laxo + flag en la action); hoy lo cubre la guardia de salida.
- Referencias: src/lib/leados/dossier.ts · dossier.actions.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-787] Rastro visible de reasignación (canal SISTEMA + banner 'Te asignaron')
- Fuente: `docs/bitacora-beta.md:624` · tipo: hecho-declarado · estado declarado: hecho (verificación funcional de Franco) · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: assignLeadSetter registra una OsLeadActivity SISTEMA solo si cambia el dueño; banner en el detalle del setter; el feed admin muestra 'Reasignación'; invariante check:invariant.
- Referencias: src/lib/leados/assignment-trail.ts · src/lib/leados/assignment-trail.invariant.ts · src/lib/leados/isolation.ts · prisma/migrations/20260619150000_add_activity_channel_sistema · src/app/(protected)/admin/leads/_actions/lead.actions.ts · src/app/(protected)/setter/leads/[leadId]/page.tsx +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-788] El evento SISTEMA nunca cuenta como contacto comercial
- Fuente: `docs/bitacora-beta.md:640` · tipo: decision · estado declarado: vigente · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: SOLO_CONTACTOS_COMERCIALES (isolation.ts) lo excluye de _count.activities, último contacto del cron, gate de Seguimiento y listas admin; CreateActivitySchema rechaza SISTEMA.
- Referencias: src/lib/leados/isolation.ts · activity.schemas.ts · src/app/api/cron/os-follow-up/route.ts · src/app/(protected)/admin/leads/page.tsx · también en docs/bitacora-beta.md:998 · también en docs/bitacora-beta.md:1248
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-789] Recorrido de cola prev/next (?cola=)
- Fuente: `docs/bitacora-beta.md:719` · tipo: hecho-declarado · estado declarado: hecho; luego borrado en 2.1a · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Strip sticky con Anterior/Siguiente sobre la cola ya clasificada (recorrido.ts puro; buildHomeLeads extraído a home.ts).
- Referencias: src/lib/leados/recorrido.ts · src/lib/leados/home.ts · recorrido-strip.tsx · borrado en docs/bitacora-beta-2.md:323
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-790] El escalamiento pertenece al dossier y se resetea en toda transición
- Fuente: `docs/bitacora-beta.md:928` · tipo: decision · estado declarado: vigente · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: No va en el meta privado del setter (sobrevive a la reasignación); transitionDossier mergea ESCALADO_RESET; persistir nunca transiciona.
- Referencias: src/lib/leados/escalamiento.ts · src/lib/leados/dossier.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-791] 0.5.12 Al abrir el lead, caer en el paso activo
- Fuente: `docs/bitacora-beta.md:1151` · tipo: hecho-declarado · estado declarado: hecho (verificación funcional de Franco) · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: StepAnchor hace scroll a la sección según pasoActual(stage), exportado del stepper, saltando la copia responsive oculta.
- Referencias: src/app/(protected)/setter/leads/[leadId]/_components/step-anchor.tsx · lead-wizard.tsx · dossier-stepper.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-792] Decidir dónde aterriza un lead en EVALUADA (brief vs opener)
- Fuente: `docs/bitacora-beta.md:1173` · tipo: pendiente · estado declarado: pendiente (decisión de Franco) · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Hoy cae en «brief» por deferir al stepper; si se prefiere el opener es 1 línea en anchorActivo, decisión de interpretación del flujo que es de Franco.
- Referencias: lead-wizard.tsx (anchorActivo)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-793] 0.5.13 Timeline del lead en el detalle del setter
- Fuente: `docs/bitacora-beta.md:1190` · tipo: hecho-declarado · estado declarado: hecho (sign-off perceptual de Franco) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Lectura separada listOwnedLeadTimeline que incluye SISTEMA (se muestra sin contar); invariante check:invariant:timeline.
- Referencias: src/lib/leados/timeline.ts · src/lib/leados/timeline.invariant.ts · lead-timeline.tsx · lead-timeline.helpers.ts · src/lib/leados/isolation.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-794] FG-1.0 Fuente única tipada de contenido de guía (guidance-content.ts)
- Fuente: `docs/bitacora-beta.md:1328` · tipo: hecho-declarado · estado declarado: hecho (sign-off perceptual de Franco) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Tipos CampoGuia/PasoGuia/EjemploContrastado y registro GUIA_PASOS; la ficha del Paso 1 migrada como prueba.
- Referencias: src/lib/leados/guidance-content.ts · ficha-step.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-795] FG-4 razones del self-check
- Fuente: `docs/bitacora-beta.md:1358` · tipo: bloque · estado declarado: sin estado (planeado) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Consumidor planeado de SelfCheckRazon en guidance-content.ts (checkId string desacoplado de HARD_CHECKS/SOFT_CHECKS).
- Referencias: src/lib/leados/guidance-content.ts · también en docs/bitacora-beta.md:1335 · también en docs/bitacora-beta.md:1341
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-796] FG-1.2 TeachPanel ('¿por qué importa?' + esto-sí/esto-no) en 5 pasos
- Fuente: `docs/bitacora-beta.md:1368` · tipo: hecho-declarado · estado declarado: hecho (QA visual en runtime pendiente de Franco) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Componente reutilizable aplicado a construcción, self-check, opener, objeciones y traspaso, con el contenido en guidance-content.ts.
- Referencias: src/app/(protected)/setter/_components/teach-panel.tsx · src/lib/leados/guidance-content.ts · construccion-step.tsx · self-check-step.tsx · opener-step.tsx · seguimiento-step.tsx +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-797] Rediseñar la pantalla de Construcción (sobre-guiada)
- Fuente: `docs/bitacora-beta.md:1387` · tipo: pendiente · estado declarado: pendiente (sprint aparte) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Apila 10+ bloques; propuesta: shell de 6 fases como stepper/acordeón y MaterialesNegocio plegado en su fase. Sprint aparte.
- Referencias: construccion-step.tsx · SHELL_CONSTRUCCION · también en docs/bitacora-beta.md:1507
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-798] Segundo par esto-sí/no en el self-check
- Fuente: `docs/bitacora-beta.md:1389` · tipo: idea · estado declarado: sin estado · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Sumar datosReales/fielAlBrief si Franco lo quiere (la asimetría actual es deliberada).
- Referencias: src/lib/leados/guidance-content.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-799] FG-1.4 'Ver ejemplo' del estado ideal (ficha y self-check)
- Fuente: `docs/bitacora-beta.md:1405` · tipo: hecho-declarado · estado declarado: hecho (sign-off perceptual de Franco, sin capturas) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Ejemplares completos en guidance-content.ts y componente colapsable ejemplo-ideal.tsx en ficha y self-check.
- Referencias: src/app/(protected)/setter/_components/ejemplo-ideal.tsx · src/lib/leados/guidance-content.ts · ficha-step.tsx · self-check-step.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-800] FG-1.3 Validación de calidad de la ficha al salir del campo
- Fuente: `docs/bitacora-beta.md:1442` · tipo: hecho-declarado · estado declarado: hecho (verificación funcional de Franco) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Nudge neutro onBlur en 5 campos (campoFichaFlojo, umbral 40) que orienta sin bloquear ni tocar autosave ni gates.
- Referencias: src/lib/leados/ficha-calidad.ts · src/app/(protected)/setter/_components/campo-mejora.tsx · src/lib/leados/guidance-content.ts · ficha-step.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-801] Calidad advisory ≠ gate; frontera palabras/criterio/estructura
- Fuente: `docs/bitacora-beta.md:1446` · tipo: decision · estado declarado: vigente · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: ficha-calidad.ts vive fuera de flow.ts; las palabras en guidance-content.ts, el criterio en lógica pura y la estructura en componentes; la guía nunca toca gates ni autosave.
- Referencias: src/lib/leados/ficha-calidad.ts · src/lib/leados/flow.ts · también en docs/bitacora-beta.md:1343 · también en docs/bitacora-beta.md:1501 · también en docs/bitacora-beta.md:1504
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-802] Cierre del bloque FG-1 (capa de mentoría del setter)
- Fuente: `docs/bitacora-beta.md:1486` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: FG-1.pre, 1.0, 1.1, 1.2, 1.4 y 1.3 completos; gates y autosave intactos; verificación perceptual en manos de Franco.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-803] Extender la validación de calidad a los forms de brief y construcción
- Fuente: `docs/bitacora-beta.md:1509` · tipo: idea · estado declarado: sin estado (fuera de alcance de FG-1) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: La infraestructura (campo mejora en 1.0 + heurística análoga + CampoMejora) es reusable.
- Referencias: src/lib/leados/ficha-calidad.ts · campo-mejora.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-804] QA visual en runtime del bloque FG-1 + harness de seed por stage
- Fuente: `docs/bitacora-beta.md:1510` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Las pantallas del setter exigen auth y leads sembrados por stage; FG-2 podría montar el harness para automatizarlo.
- Referencias: relacionado docs/bitacora-beta.md:1673 (seed de estados) · relacionado docs/bitacora-beta.md:1735 (suite tests/setter)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-805] FG-2.1→2.3 formulario estructurado para los 4 rubros
- Fuente: `docs/bitacora-beta.md:1518` · tipo: bloque · estado declarado: bloqueado (gate abierto) · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: No se deriva hasta que corra el experimento 5 vs 5; FG-2 también recibe la capa 'cómo dirigir la IA' / ejemplos de prompt.
- Referencias: también en docs/bitacora-beta.md:286 · también en docs/bitacora-beta.md:340 · también en docs/bitacora-beta.md:1558 · también en docs/bitacora-beta.md:1636
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-806] Refactor preparatorio FG-2: contenido de flow.ts a flow-content.ts
- Fuente: `docs/bitacora-beta.md:1564` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: 8 grupos de copy (SHELL_CONSTRUCCION, HARD/SOFT_CHECKS, CANAL_INSTAGRAM, etc.) movidos con re-export; flow.ts 824→614 líneas, gates sin mover.
- Referencias: src/lib/leados/flow-content.ts · src/lib/leados/flow.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-807] Refinar SHELL_CONSTRUCCION tras el test de Claude Design
- Fuente: `docs/bitacora-beta.md:1570` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-21 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Sigue marcado PROVISORIO; es el ancla editable del constructor de FG-2.
- Referencias: src/lib/leados/flow-content.ts · también en docs/bitacora-beta.md:1588
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-808] B2 (LeadOS) — Modelo de producción del dossier
- Fuente: `docs/bitacora-roadmap.md:7852` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-12 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Enum DossierStage y modelo OsLeadDossier 1:1 con OsLead (migración aditiva), contratos zod de los blobs (ficha, evaluación, brief, self-check, rechazos) y transitionDossier con transiciones legales y guard optimista; verificación 17/17; sin UI ni server actions.
- Referencias: prisma/schema.prisma · prisma/migrations/20260612121536_add_os_lead_dossier/ · src/lib/leados/contracts.ts · src/lib/leados/dossier.ts · scripts/b2-verify-dossier.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-809] transitionDossier es la única puerta del stage del dossier
- Fuente: `docs/bitacora-roadmap.md:7863` · tipo: decision · estado declarado: hecho · fecha: 2026-06-12 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Setear stage con Prisma fuera de dossier.ts está prohibido; el setter accede siempre vía ownership (getOwnedDossier), nunca por el id del dossier; todo blob se parsea con zod antes de escribir.
- Referencias: src/lib/leados/dossier.ts · src/lib/leados/contracts.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-810] Gate EVALUADA a BRIEF del flujo invertido
- Fuente: `docs/bitacora-roadmap.md:7876` · tipo: decision · estado declarado: hecho · fecha: 2026-06-12 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Pasa si el lead respondió (RESPONDIO, CALL_AGENDADA o CERRADO) o si el score de evaluación es >=4; DESCARTADA exige motivo y no valida score.
- Referencias: src/lib/leados/dossier.ts · tambien en docs/bitacora-roadmap.md:7883 · tambien en docs/bitacora-roadmap.md:7884
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-811] Test de aislamiento DB-bound de ownership.ts
- Fuente: `docs/bitacora-roadmap.md:10633` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Sembrar 2 setters con leads cruzados para probar listOwnedLeads/getOwnedLead; fuera de scope de 0.2.
- Referencias: src/lib/leados/ownership.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-812] Errores ESLint preexistentes del setter
- Fuente: `docs/bitacora-roadmap.md:10693` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: react-hooks/purity (setter/page.tsx:34, seguimiento-step.tsx:198) y set-state-in-effect (onboarding-hint.tsx:39).
- Referencias: también en fuente:10727 · también en fuente:10796
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-813] B0.4 headers Paso N reconciliados
- Fuente: `docs/bitacora-roadmap.md:10697` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Outreach/agenda/draft/self-check de-numerados; hueco 'Paso 8' eliminado.
- Referencias: src/app/(protected)/setter/leads/[leadId]/_components/lead-wizard.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-814] FG-0 cierre: z-index a tokens + regresiones B9
- Fuente: `docs/bitacora-roadmap.md:10731` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Tier app* en zIndex bajo modal; elevación en banner, lane, stepper y DecisionBar; STAGE_TONE en pill admin.
- Referencias: src/lib/design-tokens.ts · src/app/(protected)/admin/leados/[leadId]/page.tsx · src/app/(protected)/admin/leados/[leadId]/_components/decision-bar.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-815] Regla para superficies nuevas del setter
- Fuente: `docs/bitacora-roadmap.md:10799` · tipo: decision · estado declarado: hecho · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): h5.set-lead
- Qué es: Deben deferir al stepper canónico de 5 etapas y a 'cyan = accionable, resto informativo'.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h5.set-manual — Manual del lead

#### [PLAN-816] P43 Refinar (mc2) completado
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:2` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: 5 prompts de refinamiento tipados en prompts-refinamiento.ts y pantalla mc2-refinar.tsx (contexto plegado, acordeón de munición, un tilde).
- Referencias: prompts-refinamiento.ts · mc2-refinar.tsx · docs/p43-refinar/REPORTE.md · tambien en :33, :130
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-817] mc2 con tilde único, no cinco
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:26` · tipo: decision · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Un solo tilde persiste en bloque ['cta','calidad','mobile'] para no romper progresoJson/FASE_IDS; la spec pedía 5 (ver H-05).
- Referencias: src/lib/leados/contracts.ts (FASE_IDS) · tambien en :143, :745
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-818] Trabajo LeadOS sin commitear
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:184` · tipo: pendiente · estado declarado: pendiente (sin commit) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: P43 quedó en working tree sin git add ni commit; la auditoría ve un diff de 48 archivos como baseline de la rama p25/rafaga-tildes.
- Referencias: rama p25/rafaga-tildes · tambien en :906, :956
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-819] M14 self-check tripartito, 15 checks y gate
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:187` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Contrato aditivo (estado opcional, primeraMirada), 5 criterios de diseño bloqueantes, selector sin_revisar/bien/mal en chequeo-form.tsx y gate selfCheckAprobado.
- Referencias: src/lib/leados/contracts.ts · chequeo-form.tsx · src/lib/leados/flow.ts · tambien en :227, :278, :298
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-820] No tocar selfCheckJson ni SelfCheckSchema
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:386` · tipo: decision · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: La correlación checkId-check se hace por nombre en memoria (HARD_CHECKS.find) para no romper blobs históricos.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-821] M1 calidad de ficha + corte de 10 min
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:457` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: 4 campos aditivos (direccionFisica, horariosReales, contactoExacto, comoSeVeWeb), umbrales alcanzaParaDecidir/Disenar y corte en fichaJson.corte que relega en ordenFoco.
- Referencias: registrarCorteFicha · tests/leados/m1-sprint-calidad.spec.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-822] G2 ángulo wow en m4/m15/m5
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:494` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: obtenerAnguloWow en copy-blocks.ts y AnguloWowCard en opener, envío y seguimiento; sin ángulo degrada al copy previo. Regla: se ofrece, no se inyecta.
- Referencias: src/lib/leados/copy-blocks.ts · tests/leados/angulo-wow-mensajes.spec.ts · tambien en :553
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-823] Barrera AST para invariantes de copy y enlaces
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:655` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: copy-sin-jerga/copy-sin-ubicacion usan AMBITO fijo y enlaces-manual una lista estática; barrera AST estimada en 400-600 LOC, sprint separado.
- Referencias: docs/barrera-rutas-ast.md · tambien en :839, :840
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-824] H-01 doble formulario en m6
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:701` · tipo: pendiente · estado declarado: pendiente (Bloqueante) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Tras las 4 vueltas, Zod exige pegadoGem legacy si el Gem tiene URL; bloquea al setter.
- Referencias: brief-form.tsx#L288-L362 · dossier.schemas.ts#L148-L157 · docs/decisiones-oslead-vii/ · tambien en :807, :820, :892
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-825] H-02 pérdida de las 4 vueltas ante F5 en m6
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:712` · tipo: pendiente · estado declarado: pendiente (Crítica) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: M6Registro no pasa autosaveEnabled; no hay persistencia local del brief en curso.
- Referencias: m6-brief.tsx#L116 · brief-form.tsx#L186-L194 · tambien en :859
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-826] H-03 botón principal mudo en m1
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:723` · tipo: pendiente · estado declarado: pendiente (Alta) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Registrar evaluación falla sin mostrar errores si el bloque 5 de FichaForm está colapsado.
- Referencias: m1-ficha.tsx#L225-L231 · evaluacion-form.tsx#L169-L173 · tambien en :806
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-827] H-04 falso verde del gate de self-check
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:734` · tipo: pendiente · estado declarado: pendiente (Alta) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: selfCheckAprobado no exige los criterios de diseño nuevos si se omiten del payload; el invariante tiene un aserto vacuo.
- Referencias: src/lib/leados/flow.ts#L221-L231 · self-check-gate.invariant.ts#L76-L86 · tambien en :833, :838, :896
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-828] H-05 mc2: un tilde vs cinco
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:745` · tipo: pendiente · estado declarado: pendiente (Media) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: decisiones-por-pantalla y mc2-prompts-refinamiento piden 5 tildes por prompt; el código tiene tildeUnico.
- Referencias: mc2-refinar.tsx#L273-L313 · tambien en :821, :831, :893
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-829] H-06 m13 en RECHAZADA sin cambiar link
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:756` · tipo: pendiente · estado declarado: pendiente (Media) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Se congela el borrador y exige Reabrir construcción; guardarDraftUrl solo acepta stage CONSTRUCCION.
- Referencias: m13-borrador.tsx#L109-L132 · dossier.actions.ts#L330-L335 · tambien en :832, :894
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-830] H-07 control G3 no implementado
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:767` · tipo: pendiente · estado declarado: pendiente (Media) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Falta el chequeo '¿Exportaste después del último refinamiento?' antes de guardar el borrador.
- Referencias: borrador-form.tsx#L170-L206 · tambien en :822, :895
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-831] H-08 sin gate de decisor en búsqueda de agenda (m16)
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:778` · tipo: pendiente · estado declarado: pendiente (Media) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: ofrecerHorarios no valida decisorConfirmado; 'Buscar de nuevo' queda habilitado.
- Referencias: agenda.actions.ts#L125-L160 · agenda-form.tsx#L238-L246 · tambien en :823, :897
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-832] H-09 Cal.com de LeadOS frágil multi-tenant
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:789` · tipo: pendiente · estado declarado: pendiente (Crítica) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: getCalConfigLeadOS aborta si más de una Organization tiene calComUsername; un cliente con Cal.com rompe la agenda del setter.
- Referencias: src/lib/leados/agenda.ts#L57-L85 · tambien en :855
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-833] Guías faltantes para el setter
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:812` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Generador de wa.me (m1), modelo/opciones de Claude Design (mc1), dónde está Export (m13) y cronómetro del corte de 10 min.
- Referencias: tambien en :813, :814, :815
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-834] Evaluación de m1 sin autosave
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:819` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Promete 'se guarda sola' pero la evaluación se pierde al salir o recargar.
- Referencias: tambien en :860
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-835] Rótulo CONTEXTO DEL LEAD sigue
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:824` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Debía eliminarse (decisiones §S7); sigue en pantalla-manual.tsx.
- Referencias: pantalla-manual.tsx#L205 · tambien en :899
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-836] m6: decisiones de brief no construidas
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:828` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Título del brief debía eliminarse (sigue obligatorio), CTA debía ser obligatorio (es opcional) y 'concepto' debía llamarse 'Ángulo wow'.
- Referencias: dossier.schemas.ts#L131 · dossier.schemas.ts#L137 · tambien en :829, :830, :889-:891
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-837] m5: jerarquía de resultados y numeración de toques
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:834` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Jerarquizar Rechazó/Respondió (hoy 4 tarjetas iguales) y unificar 'Toques 1 de 3' vs 'toque 2 de 3'.
- Referencias: tambien en :898
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-838] Código LeadOS construido sin uso
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:844` · tipo: pendiente · estado declarado: pendiente (poda) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: ConstruccionMunicion/BadgeProvisorio importados sin render; referenciasFicha y notasMarca sin consumidores; campos de vueltas sin gate.
- Referencias: m-construccion.tsx#L129 · contracts.ts (BriefSchema)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-839] Supuestos sobre herramientas externas sin medir
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:852` · tipo: pendiente · estado declarado: pendiente (riesgo) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Export de Claude Design, Netlify Drop sin cuenta y URLs que caducan, 4 Gems con 3-5 imágenes, webhooks de Cal.com.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-840] Robustez del manual ante acciones del setter
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:861` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Atrás muestra BriefSanity bloqueado, sesión expirada sin redirect ni guardado local, sin concurrencia optimista, stickyId único por usuario.
- Referencias: tambien en :862, :863, :864
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-841] Numeración «Paso N» flow-wide
- Fuente: `docs/bitacora-beta-3.md:12` · tipo: decision · estado declarado: hecho (1.1 y P9) · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Decisión de producto: referir pasos por nombre y no por número; el copy visible se barrió en 1.1 y P9.
- Referencias: también en fuente:255,276,293,1106,1186,3219
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-842] Pasadas perceptuales a ojo de Franco (wizard, manual, home)
- Fuente: `docs/bitacora-beta-3.md:54` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Verificación visual desktop/mobile pedida en casi todos los sprints; screenshots fallaban por visibilityState hidden; parte cubierta por 7.1.
- Referencias: también en fuente:131,207,389,421,1012,1038,1376,1746 · sección 7.1 en fuente:1122
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-843] Caliente es campo exclusivo de Franco
- Fuente: `docs/bitacora-beta-3.md:110` · tipo: decision · estado declarado: vigente · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Score ≥4 solo avisa; el setter no marca caliente (alta forzada a false); el copy del setter dice «avanzar con prioridad».
- Referencias: dossier.actions.ts:152-166 · también en fuente:408,883,893,1393,1488
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-844] Línea roja del flujo invertido del envío
- Fuente: `docs/bitacora-beta-3.md:177` · tipo: decision · estado declarado: vigente · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El link de la demo solo sale con APROBADA ∧ finalUrl ∧ (respondió ∨ caliente); claim atómico y re-validación server.
- Referencias: flow.ts gateEnvioDemo · dossier.ts marcarDemoEnviadaOwned · outreach.actions.ts enviarDemoAprobada · también en fuente:1175
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-845] Cadencia +2/+2/+3 y corte; cierre a PERDIDO lo decide Franco
- Fuente: `docs/bitacora-beta-3.md:222` · tipo: decision · estado declarado: vigente · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: calculateNextFollowUp en follow-up.ts; agotada no ofrece más toques; el setter no cierra a PERDIDO.
- Referencias: follow-up.ts · también en fuente:973,988,1307
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-846] 4·A librería de prompts de diseño + 4·B puente self-check
- Fuente: `docs/bitacora-beta-3.md:320` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: src/lib/leados/prompts-disenio.ts (estetica/mobile/motion) y HARD_CHECK_PROMPT/promptParaHardCheck, hoy solo mobile→mobile.
- Referencias: también en fuente:341 · src/lib/leados/prompts-disenio.ts · self-check-step.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-847] Curado fino de los prompts de diseño
- Fuente: `docs/bitacora-beta-3.md:330` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Los prompts de prompts-disenio.ts son semilla; el contenido fino lo cura Franco.
- Referencias: también en fuente:337
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-848] Más prompts para hard-checks y soft-checks
- Fuente: `docs/bitacora-beta-3.md:361` · tipo: idea · estado declarado: sin estado · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Prompts lead-agnósticos para linksWhatsapp/sinRelleno y enganchar estetica/motion a los SOFT-checks; HARD_CHECK_PROMPT sigue 1 de 10.
- Referencias: también en fuente:665,3161
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-849] Tests rojos y flaky de la suite setter
- Fuente: `docs/bitacora-beta-3.md:474` · tipo: pendiente · estado declarado: parcial · fecha: 2026-06-30 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: B3 copy-drift, B10 y G1 flaky, 01-flow:229 copy vieja; F4 arreglado en 3.4 y la copy reconciliada en b468ec6.
- Referencias: también en fuente:478,935,1064,1316,1384,1496
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-850] E.1 progresoJson del dossier
- Fuente: `docs/bitacora-beta-3.md:509` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Columna progresoJson (migración 20260630000000_add_dossier_progreso), FASE_IDS, saveOwnedProgreso e invariante progreso; checklist, no gate.
- Referencias: prisma/migrations/20260630000000_add_dossier_progreso · contracts.ts · dossier.ts · progreso-isolation.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-851] El progreso es checklist, nunca gate; el re-loop lo preserva
- Fuente: `docs/bitacora-beta-3.md:521` · tipo: decision · estado declarado: vigente · fecha: 2026-06-30 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: progresoJson jamás se cablea a EN_REVISION; RECHAZADA→CONSTRUCCION preserva fases y draft y resetea solo el self-check.
- Referencias: también en fuente:522,609
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-852] E.2 UI de fases que consume progresoJson
- Fuente: `docs/bitacora-beta-3.md:534` · tipo: bloque · estado declarado: pendiente · fecha: 2026-06-30 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Próximo paso declarado tras E.1; no hay sección E.2 propia, aunque FaseAutoReporte usa guardarProgreso desde 5.3.
- Referencias: también en fuente:928
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-853] Mutación cruzada testeada en 2 de ~19 writes
- Fuente: `docs/bitacora-beta-3.md:673` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Ownership 100% en capa de aplicación sin RLS; falta prueba dinámica de setter B contra leads de A en dossier/outreach/agenda/cartera/foco.
- Referencias: también en fuente:677
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-854] Cuatro de cinco herramientas externas sin URL
- Fuente: `docs/bitacora-beta-3.md:677` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: herramientas.ts: Chat de evaluación, Gem de diseño, Claude Design y Gem de outreach en null; no hay modelo ni pantalla, solo editar el .ts; frena el recorrido en m2.
- Referencias: herramientas.ts:87 · también en fuente:1186,1210,1865,1964,2657,3516,4014,4542,4827
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-855] Motivo de PERDIDO no garantizado
- Fuente: `docs/bitacora-beta-3.md:709` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Volver obligatorio agenda.resultado.nota en AgendaSchema es una decisión de contrato.
- Referencias: contracts.ts AgendaSchema
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-856] Bloques 4-5: manual paso-por-pantalla M1-M16
- Fuente: `docs/bitacora-beta-3.md:756` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-03 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: manual.ts derivarPantalla, ruta /setter/leads/[leadId]/manual/[paso], pantallas M1-M16 + espera/revisión/M-R; costura posicionDe→derivarPasoDelLead.
- Referencias: también en fuente:816,846,875,897,918,944,968 · commits 8781724,a8e7747,2e75007,8fa48f6,5654716,3a7addd,914862a,6ad4066 · scripts/dev/qa-manual-m5-m16.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-857] referenciasFicha fantasma en BriefSchema
- Fuente: `docs/bitacora-beta-3.md:925` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-03 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Sin lectores ni campo de formulario; se pierde en cada re-guardado de guardarBrief; sacarlo es tocar el contrato.
- Referencias: contracts.ts:118 · también en fuente:2385,2955,3018
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-858] 5.6 EL CORTE: manual reemplaza al wizard
- Fuente: `docs/bitacora-beta-3.md:992` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-04 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: /setter/leads/[leadId] redirige al manual; wizard retirado (16 archivos); construccion-ctas, escalamiento-construccion, historial-lead, CabeceraLead; e2e migrada 39/39.
- Referencias: commit 75b9d7f · manual/_components/construccion-ctas.tsx · historial-lead.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-859] Naming histórico del wizard en código
- Fuente: `docs/bitacora-beta-3.md:1014` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-04 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: StepAnchorId y comentarios de paso.ts, ~110 menciones a «wizard» y 13 «Paso N» en comentarios de server actions.
- Referencias: paso.ts · también en fuente:1186,3286,3289
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-860] 7.0 smoke-test del manual
- Fuente: `docs/bitacora-beta-3.md:1099` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-04 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: 41 hallazgos, 2 arreglados (role=alert), 39 (b) volcados a docs/auditorias/SMOKE-TEST-MANUAL-2026-07.md.
- Referencias: commit 036d70b · docs/auditorias/SMOKE-TEST-MANUAL-2026-07.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-861] 39 hallazgos (b) del smoke-test para triage
- Fuente: `docs/bitacora-beta-3.md:1105` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-04 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: docs/auditorias/SMOKE-TEST-MANUAL-2026-07.md; incluye NavConstruccion renderizado en mr (decisión de producto).
- Referencias: también en fuente:1116,1186,1195
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-862] Construcción bajo el fold en mobile: no reestructurar
- Fuente: `docs/bitacora-beta-3.md:1138` · tipo: decision · estado declarado: descartado por ahora · fecha: 2026-07-04 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El Registro de mc1/mc2 queda bajo el fold; Franco descartó por ahora bajar contexto/munición debajo de la acción.
- Referencias: también en fuente:1186
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-863] 7.1/7.3 header compacto mobile y regresión final del rediseño
- Fuente: `docs/bitacora-beta-3.md:1170` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-04 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: manual-nav.tsx compacto en mobile; regresión multi-lente sin regresiones (docs/auditorias/REGRESION-FINAL-2026-07.md); proyecto de rediseño cerrado.
- Referencias: también en fuente:1122 · commit c82ff48 · docs/auditorias/REGRESION-FINAL-2026-07.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-864] Backlog AUD-2 y diseño de la fase PRE
- Fuente: `docs/bitacora-beta-3.md:1206` · tipo: bloque · estado declarado: en curso (P3.1 y B-05 atacados) · fecha: 2026-07-07 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: 40 ítems (3 P1, 10 P2, 17 P3, 10 decisiones de Franco), 10 PR-x y fase PRE de 4 pantallas como insumo del Bloque 8.
- Referencias: docs/auditorias/AUDITORIA-CIERRE-2026-07.md · también en fuente:1888,1644
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-865] 1.1 barrido de vocabulario del wizard muerto
- Fuente: `docs/bitacora-beta-3.md:1216` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-09 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: 72 strings en 18 archivos (sin «Paso N» ni jerga visible); quedó absorbido en commit huérfano 44e25be y se recuperó como 612c4ee (Sprint R).
- Referencias: commit 612c4ee · commit 44e25be (huérfano) · también en fuente:1244
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-866] POSTERGADO no reanuda la cadencia
- Fuente: `docs/bitacora-beta-3.md:1301` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-17 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Solo se limpia reactivateAt; un resume real exige transición POSTERGADO→working que decida Franco; copy de flow.ts:404 imprecisa.
- Referencias: os-commercial.ts · flow.ts:404
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-867] 2.2/2.3 M5 agotada y terminales a archivo
- Fuente: `docs/bitacora-beta-3.md:1325` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-17 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: cadenciaAgotada oculta «No respondió»; pantalla 'archivo' para PERDIDO, guard leadActivo en registrarResultado, C-17 sin cyan en terminales; manual.invariant.
- Referencias: también en fuente:1345 · archivo-manual.tsx · manual.invariant.ts · tests/setter/08-m5-cadencia-agotada.spec.ts · 09-archivo-terminal.spec.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-868] 3.1-3.4 (jul-22): caliente solo de Franco, guardias, tilde y residuos
- Fuente: `docs/bitacora-beta-3.md:1380` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-22 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Copy sin «caliente» para el setter, useUnsavedGuard en opener/seguimiento, tilde deshabilitado fuera de CONSTRUCCION, start:qa encadena build, fix flaky F4.
- Referencias: también en fuente:1413,1448,1484 · commits b468ec6,909ad8d,79d3787,db557e8 · fase-auto-reporte.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-869] 4.1 errores persistentes y en criollo
- Fuente: `docs/bitacora-beta-3.md:1514` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-23 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: src/lib/leados/error-copy.ts traduce 17 mensajes del motor; action-codes.ts SLOT_OCUPADO; error inline en chequeo-form y envio-form.
- Referencias: commit b6b2132 · error-copy.ts · action-codes.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-870] 5.1/5.3 (jul-23): última charla en m5 y m15 consultable
- Fuente: `docs/bitacora-beta-3.md:1564` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-23 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: ultimoToque/openerTexto re-servidos; m15 habilitada en APROBADA con gate cerrado (invariante manual caso 6).
- Referencias: también en fuente:1589 · commits 88b1f13,65058fc
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-871] 6.0-6.2 (jul-23): agenda con memoria (B-05)
- Fuente: `docs/bitacora-beta-3.md:1613` · tipo: hecho-declarado · estado declarado: hecho (pase visual pendiente de Franco) · fecha: 2026-07-23 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Spec 12-claim-agenda; estado OFRECIDOS reclamable, compensación restaura, guardarHorariosOfrecidosOwned; m16 re-entra con memoria, guardia y confirmación inline.
- Referencias: también en fuente:1644,1712 · commits 8b3ce80,6a88cbe · src/lib/leados/agenda.ts · tests/setter/13-m16-memoria.spec.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-872] P3.1 la interfaz deja de decir cosas que no son
- Fuente: `docs/bitacora-beta-3.md:1886` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Toque vencido visible, textoLibre .max(5000), line-clamp/break-words, Parquear→Pausar, pluralización de horarios, placeholder de Zona eliminado.
- Referencias: m5-seguimiento.tsx · contracts.ts · pantalla-manual.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-873] Copy muerto en guidance-content.ts y paso.ts
- Fuente: `docs/bitacora-beta-3.md:1925` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: GUIA_CONSTRUCCION, GUIA_REVISION, GUIA_TRASPASO, casi todo GUIA_BRIEF, describirFoco y títulos de espera/revisión en PANTALLAS: sin consumidores, retirarlos es poda.
- Referencias: guidance-content.ts:525-563 · también en fuente:2650,3020,3283,3826,4507
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-874] Buscar horarios devuelve jerga de setup de Cal.com
- Fuente: `docs/bitacora-beta-3.md:1975` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: «Setup B7.0 pendiente… calComUsername» llega crudo al setter y esquiva error-copy.ts.
- Referencias: también en fuente:3979
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-875] Cal.com sin configurar y sin camino de escritura
- Fuente: `docs/bitacora-beta-3.md:1994` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: calComUsername/calComEmbedUrl en NULL en las 16 orgs y ningún write en el código; m16 falla al hacer clic.
- Referencias: también en fuente:3519,4544,4830
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-876] parseProgreso vacía el progreso en silencio
- Fuente: `docs/bitacora-beta-3.md:2034` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: safeParse contra FASE_IDS: una llave muerta borra todo el blob sin error ni log; renombrar fases es destructivo.
- Referencias: flow.ts:131-134 · también en fuente:4899,5128
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-877] Links en el opener: decisión de Franco
- Fuente: `docs/bitacora-beta-3.md:2046` · tipo: decision · estado declarado: pendiente de decisión · fecha: 2026-07-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: La regla vive en flow.ts:205; cambiarla toca ~3 archivos de lógica, 8 de copy (incluido el prompt del Gem) y 4+ tests.
- Referencias: flow.ts:205
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-878] P1 poda: seis correcciones de copy
- Fuente: `docs/bitacora-beta-3.md:2072` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: «hace hace», label de Perdidos, aria-label del checkbox de agenda, límites de Instagram 30/24/6→10/8/3, comentario de contarDmsHoy.
- Referencias: flow-content.ts · canal-seguridad.tsx · cartera-toolbar.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-879] Límites de Instagram 10/8/3 a validar por Franco
- Fuente: `docs/bitacora-beta-3.md:2114` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Textos del cartel de canal-seguridad y números de perfil conservador según historial real de la cuenta.
- Referencias: canal-seguridad.tsx · flow-content.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-880] P4 poda: m3 fusionada en m2
- Fuente: `docs/bitacora-beta-3.md:2119` · tipo: hecho-declarado · estado declarado: hecho (test:setter contaminado, sin autocierre) · fecha: 2026-07-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: m3-veredicto.tsx borrado; m2 «Llevá la ficha a evaluar y registrá el veredicto»; herramienta renombrada «Chat de evaluación (Sonnet)».
- Referencias: manual.ts · m2-evaluador.tsx · herramientas.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-881] Monolito de manual/[paso]/page.tsx
- Fuente: `docs/bitacora-beta-3.md:2192` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Escalera de 11-12 ternarios anidados; desarmarla es sprint propio.
- Referencias: manual/[paso]/page.tsx · también en fuente:2643
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-882] P5-A la ficha recibe el material de la demo
- Fuente: `docs/bitacora-beta-3.md:2267` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-03 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Grupo materiales (resenasUrl, imagenesUrl, otraRedUrl, queVende, comoSePresenta) en FichaSchema sin migración; viaja a buildConstruccionBlock.
- Referencias: contracts.ts · ficha-form.tsx · copy-blocks.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-883] Decisiones de producto de la poda a aprobar en preview
- Fuente: `docs/bitacora-beta-3.md:2389` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-03 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Campos de material, títulos de m2/mc1/mc2/m6/m14, ¿10 obligatorios?, rótulos del foco y textos de turno.
- Referencias: también en fuente:2235,2663,2927,3030,3166,3300,3937
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-884] P6-B Construcción: seis pantallas pasan a dos (mc1/mc2)
- Fuente: `docs/bitacora-beta-3.md:2474` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: PANTALLA_DE_FASE explícita, invariante pantallas-construccion, seis tildes conservados 3+3, direcciones viejas redirigen.
- Referencias: commit 742f756 · manual.ts · pantallas-construccion.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-885] Construcción hacia cero pantallas
- Fuente: `docs/bitacora-beta-3.md:2478` · tipo: bloque · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Brief v3: fases reabsorbidas por el chequeo final y la librería de prompts; mc1/mc2 es paso intermedio.
- Referencias: PANTALLA_DE_FASE
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-886] Residuos de construcción tras el colapso
- Fuente: `docs/bitacora-beta-3.md:2645` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El motivo del tilde miente en RECHAZADA, el item de assets duplica materiales.imagenesUrl y faseActual es campo fantasma de ProgresoSchema.
- Referencias: fase-auto-reporte.tsx · contracts.ts ProgresoSchema
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-887] gateBriefAbierto del recorrido viejo frena construir en frío
- Fuente: `docs/bitacora-beta-3.md:2913` · tipo: decision · estado declarado: pendiente de decisión · fecha: 2026-08-04 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Exige respondió ∨ caliente, así un lead evaluado y frío no puede construir; decisión de producto de Franco.
- Referencias: flow.ts gateBriefAbierto · también en fuente:3025
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-888] P5-B m6 reconvertida «Decidí cómo va a ser la demo»
- Fuente: `docs/bitacora-beta-3.md:2933` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-04 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Se retira la pregunta de Notas de marca (sigue en el payload para no borrar datos viejos).
- Referencias: brief-form.tsx · guidance-content.ts · manual.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-889] P7 chequeo final con autosave y 10 obligatorios en dos grupos
- Fuente: `docs/bitacora-beta-3.md:3038` · tipo: hecho-declarado · estado declarado: hecho (sin commit al cierre) · fecha: 2026-08-05 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Autosave delay 0 sobre guardarSelfCheck, sin botón Guardar; HardCheck.grupo setter/franco, 3 criterios nuevos.
- Referencias: chequeo-form.tsx · flow-content.ts · tests/helpers/setter-db.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-890] Verificación automática de la demo
- Fuente: `docs/bitacora-beta-3.md:3157` · tipo: idea · estado declarado: sin estado · fecha: 2026-08-05 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: No existe ningún fetch/HEAD/Lighthouse contra draftUrl; hoy el chequeo es checklist humano.
- Referencias: draftUrl
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-891] P9 barrido final de vocabulario de la poda
- Fuente: `docs/bitacora-beta-3.md:3177` · tipo: hecho-declarado · estado declarado: hecho (commiteado luego como f06df31e) · fecha: 2026-08-07 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Título de m14, contador de fase solo si m>1, proximaAccionPara sin paréntesis, «Instagram», «delator de diseño»; llaves persistidas intactas.
- Referencias: commit f06df31e · también en fuente:3795
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-892] HardCheck.nombre es etiqueta y llave persistida
- Fuente: `docs/bitacora-beta-3.md:3212` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-07 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El gate une el blob por nombre visible; renombrar desaprueba self-checks guardados; pasar a id (D26-ter) es destructivo y no hay precedente de matcher con fallback.
- Referencias: contracts.ts:125 · flow-content.ts:128 · también en fuente:3275,4995,5121,5287
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-893] Ambigüedades de vocabulario a decidir por Franco
- Fuente: `docs/bitacora-beta-3.md:3279` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-07 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: «assets», «Toque» vs «Seguimiento», «call» vs «reunión», «brief» en el form de m6 y Pausar/Posponer/Postergar.
- Referencias: también en fuente:3303,3409,3933,3981
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-894] P11 a quién le toca (turno)
- Fuente: `docs/bitacora-beta-3.md:3789` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-10 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: src/lib/leados/turno.ts (turnoDelLead, TEXTO_TURNO) e invariante turno; cuarto «todavía no» del envío (aprobada sin finalUrl = Franco).
- Referencias: commit 513f38b4 · turno.ts · turno.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-895] Patrones de la corrida de experiencia
- Fuente: `docs/bitacora-beta-3.md:3977` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-11 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: «El dato no viaja» (7 casos), checks bloqueantes de 26 px sin fila tappeable y baches de celular diferidos.
- Referencias: docs/manual-usuario/BACHES-CORRIDA-EXPERIENCIA.md · también en fuente:3983,4118
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-896] m13 muestra error Zod crudo en inglés
- Fuente: `docs/bitacora-beta-3.md:3990` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-11 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Guardar sin el interruptor devuelve «Invalid literal value, expected true» con aria-invalid sobre la URL válida.
- Referencias: borrador-form.tsx · también en fuente:4774
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-897] 22 baches no-celular pendientes y 10 de celular diferidos
- Fuente: `docs/bitacora-beta-3.md:4126` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-12 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Listados por ID en BACHES-RE-VERIFICADOS.md; el celular quedó diferido por Franco.
- Referencias: docs/manual-usuario/BACHES-RE-VERIFICADOS.md · también en fuente:4520
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-898] F1 postergación un día antes y contador de DMs
- Fuente: `docs/bitacora-beta-3.md:4138` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-12 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: parseCalendarDayAR en dates-ar.ts aplicado al schema; contarDmsHoy cuenta solo SIN_RESPUESTA (SOLO_MENSAJES_ENVIADOS); invariantes postergacion y contador-dms.
- Referencias: commit 34e15156 · src/lib/dates-ar.ts · isolation.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-899] Postergaciones guardadas con el bug UTC
- Fuente: `docs/bitacora-beta-3.md:4234` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-12 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: No se migraron; en producción hay que volver a contarlas.
- Referencias: reactivateAt
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-900] F2 el pedido de Franco acompaña la corrección
- Fuente: `docs/bitacora-beta-3.md:4277` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-12 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: GuiaRetrabajo en mr, mc1, mc2, m13 y m14 con vueltas anteriores plegadas; cierra C-19/B-11 (historial de rechazos visible).
- Referencias: commit 2d456390 · tests/setter/14-motivo-rechazo.spec.ts · también en fuente:1895,4110
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-901] Rechazo y reapertura no quedan en el historial
- Fuente: `docs/bitacora-beta-3.md:4352` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-12 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: rechazarRevision y reabrirConstruccion no escriben OsLeadActivity («sin movimientos»); el rechazo tampoco aparece en el panel de inicio.
- Referencias: HistorialDelLead
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-902] agenda.ts busca la org de Cal.com globalmente
- Fuente: `docs/bitacora-beta-3.md:4832` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-22 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: agenda.ts:44 sin filtro de tenant: cargar el campo en una org cliente rompe LeadOS con «Config Cal.com ambigua».
- Referencias: src/lib/leados/agenda.ts:44 · cli-agenda
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-903] Decisiones OSLead VII no construibles como están
- Fuente: `docs/bitacora-beta-3.md:4896` · tipo: bloque · estado declarado: pendiente de decisión · fecha: 2026-08-24 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: 17 decisiones no construibles (10+7), 7 cambios de schema destructivos y «sacar el Evaluador» (pantalla reversible, enum no); el paso 2 de A3 no se corrió.
- Referencias: docs/decisiones-oslead-vii/ · plan-de-accion-v4.md · también en fuente:4955,4959,4992,5049
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-904] LEGAL_TRANSITIONS sin invariante
- Fuente: `docs/bitacora-beta-3.md:5134` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Es const sin export en dossier.ts (importa @/lib/prisma); solo la cubre test:leados.
- Referencias: dossier.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-905] Self-check atado por nombre: no se hace el fallback id→nombre
- Fuente: `docs/bitacora-beta-3.md:5564` · tipo: decision · estado declarado: decidido: sin implementar, el invariante lo declara en rojo · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: selfCheckJson guarda {nombre, ok} sin id: renombrar o agregar un hard-check desaprueba en silencio los self-checks guardados. El fallback (SelfCheckSchema, write path, gate y formulario) quedó fuera; la aserción 7 de self-check-gate.invariant.ts lo marca en rojo.
- Referencias: src/lib/leados/self-check-gate.invariant.ts · flow-content.ts:128 · contracts.ts:125 · flow.ts:188 · flow.ts:207 · chequeo-form.tsx:51 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-906] Rediseño de m14 (chequeo final)
- Fuente: `docs/bitacora-beta-3.md:5599` · tipo: bloque · estado declarado: pendiente (planeado) · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Trabajo futuro: el rediseño de m14 va a renombrar hard-checks y actualizar el censo. Como el vínculo es por nombre, eso desaprueba los self-checks ya guardados (ver la decisión de la línea 5564).
- Referencias: flow-content.ts (HARD_CHECKS) · src/lib/leados/self-check-gate.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-907] progresoJson todo-o-nada: cambiar FASE_IDS exige migrar los blobs
- Fuente: `docs/bitacora-beta-3.md:5743` · tipo: decision · estado declarado: regla vigente (invariante progreso) · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: parseProgreso descarta el blob entero si un id no valida, y un renombre coordinado de FASE_IDS borra los tildes de todos los setters. Regla: si el cambio es a propósito, migrar los blobs guardados y actualizar el fixture en el mismo commit.
- Referencias: src/lib/leados/progreso-isolation.invariant.ts · flow.ts:133 · contracts.ts · flow-content.ts · manual.ts · tambien en docs/bitacora-beta-3.md:5766
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-908] C2: LEGAL_TRANSITIONS pasa a dossier-stage.ts y estrena invariante
- Fuente: `docs/bitacora-beta-3.md:5829` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El grafo de stage se movió tal cual a src/lib/leados/dossier-stage.ts, sin imports de valor. Invariante dossier-stage: grafo censado, FICHA→BRIEF ilegal, enum vs grafo, alcanzabilidad y guards por case. Un microsprint corrige el comentario de ci.yml. Commits locales, sin push.
- Referencias: src/lib/leados/dossier-stage.ts · src/lib/leados/dossier-stage.invariant.ts · src/lib/leados/dossier.ts · .github/workflows/ci.yml · c219d830 · 7eeacdef +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-909] Garantía estructural: sin veredicto no se construye (FICHA→BRIEF ilegal)
- Fuente: `docs/bitacora-beta-3.md:5841` · tipo: decision · estado declarado: vigente · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: FICHA tiene una sola salida, EVALUADA. La aserción 2 del invariante no se borra: al fusionar m1 y m2 hay que decidir de forma explícita qué reemplaza la garantía. D15-bis dejó la transición intacta y sumó un test e2e.
- Referencias: src/lib/leados/dossier-stage.invariant.ts · tests/setter/20-veredicto-abre-construir.spec.ts · tambien en docs/bitacora-beta-3.md:5987 · tambien en docs/bitacora-beta-3.md:6167 · tambien en docs/bitacora-beta-3.md:8715
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-910] Validar con Franco el grafo de stage congelado
- Fuente: `docs/bitacora-beta-3.md:6162` · tipo: pendiente · estado declarado: pendiente (verificación humana de Franco) · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: C2 congela el grafo tal como está, no como debería estar. Si sobra o falta una transición, es una decisión de producto para otro sprint, con premortem.
- Referencias: src/lib/leados/dossier-stage.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-911] F1-VERIF: verificados de punta a punta los dos bugs de datos que arregló F1
- Fuente: `docs/bitacora-beta-3.md:6220` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-25/26 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: La postergación se guarda como día de calendario AR (parseCalendarDayAR) y el contador de DMs cuenta mensajes (SOLO_MENSAJES_ENVIADOS). Medido contra Neon dev: arreglado en leados/v1-integracion y todavía vivo en main a esa fecha. Sin código nuevo.
- Referencias: 34e15156 · cbfaa27f · dates-ar.ts:107-130 · outreach.schemas.ts · outreach.ts · isolation.ts:142-144 +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-912] Postergaciones con desvío de medianoche UTC en producción: sin contar
- Fuente: `docs/bitacora-beta-3.md:6338` · tipo: pendiente · estado declarado: sin medir en producción; no migrado · fecha: 2026-08-25/26 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: En dev hay 0 filas con el desvío. En producción el número es desconocido porque no se conectó a esa base, y no se migró nada.
- Referencias: OsLead.reactivateAt
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-913] P3 CALLEJONES: tres pantallas que nombraban una salida y no la ofrecían
- Fuente: `docs/bitacora-beta-3.md:6529` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-26 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El error del borrador sale en castellano y en el control correcto (errorMap, props aditivas en Toggle, errores por control). m13 en RECHAZADA ofrece «Reabrir construcción» y enlace-chequeo lleva al chequeo final (m14). Invariante draft-url-mensaje y spec 15.
- Referencias: fix/callejones · a2004edb · d167df16 · setter/_actions/dossier.schemas.ts:75 · Toggle.tsx · borrador-form.tsx +4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-914] Pasada perceptual de Franco (copy y estética) de P3 a P20
- Fuente: `docs/bitacora-beta-3.md:6738` · tipo: pendiente · estado declarado: pendiente (verificación humana) · fecha: 2026-08-26 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Cada sprint le deja a Franco validar que la copy nueva suene al producto, que tarjetas y pantallas no queden cargadas ni pobres, y el juicio estético en general. Ningún test lo valida.
- Referencias: tambien en docs/bitacora-beta-3.md:7043 · tambien en docs/bitacora-beta-3.md:7129 · tambien en docs/bitacora-beta-3.md:7246 · tambien en docs/bitacora-beta-3.md:7395 · tambien en docs/bitacora-beta-3.md:7859 · tambien en docs/bitacora-beta-3.md:8789 +5
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-915] P4 MUNICIONES: la salida del link pendiente queda a la vista y los títulos dicen qué hay
- Fuente: `docs/bitacora-beta-3.md:6745` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-26 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: SalidaLinkPendiente va fuera de todo plegable en m2, m4, m5, m6, mc1, mc2 y mr (mr estrena munición). Los títulos de ToolGuide y TeachPanel nombran su contenido. Se cerraron los dos pendientes de P3: el paso 4 de m13 congelado y el toast que nombraba el chequeo. Spec 16.
- Referencias: fix/municiones · fa4af2a0 · tool-guide.tsx · teach-panel.tsx · herramientas.ts · tests/setter/16-municiones-salida.spec.ts +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-916] Regla: una salida nunca se pliega y un plegable dice lo que contiene
- Fuente: `docs/bitacora-beta-3.md:6848` · tipo: decision · estado declarado: regla vigente · fecha: 2026-08-26 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Lo que destraba al setter queda siempre visible, y cada plegable lleva un título que nombra su contenido. P17 la extiende: se pliega lo que el novato necesita y el experto no, pero nunca el botón ni el título.
- Referencias: tambien en docs/bitacora-beta-3.md:6878 · tambien en docs/bitacora-beta-3.md:9310
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-917] Cuatro herramientas sin URL en herramientas.ts (las carga Franco)
- Fuente: `docs/bitacora-beta-3.md:7034` · tipo: pendiente · estado declarado: pendiente (Franco) · fecha: 2026-08-26 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: evaluador, gemDiseno, claudeDesign y gemOutreach tienen url: null. Cargar el link desactiva solo el modo «sin herramienta», y el spec 16 falla a propósito el día que se carguen. Desde D15-bis el evaluador ya no tiene pantalla que lo use.
- Referencias: herramientas.ts · tests/setter/16-municiones-salida.spec.ts · tambien en docs/bitacora-beta-3.md:6983 · tambien en docs/bitacora-beta-3.md:8231 · tambien en docs/bitacora-beta-3.md:8479 · tambien en docs/bitacora-beta-3.md:8692
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-918] Rediseño de m6 (brief): vocabulario de brief, Gem y herramientas
- Fuente: `docs/bitacora-beta-3.md:7088` · tipo: bloque · estado declarado: pendiente (diferido al rediseño de m6) · fecha: 2026-08-26/27 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El vocabulario de «brief», «Gem» y los nombres de herramientas (Chat de evaluación, Claude Design, Netlify Drop) quedó afuera a propósito porque «el rediseño de m6 los cambia igual».
- Referencias: tambien en docs/bitacora-beta-3.md:7135
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-919] P6 DATOS QUE VIAJAN: fecha de postergación, causa de espera y contador de toques
- Fuente: `docs/bitacora-beta-3.md:7139` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: reactivateAt llega a la tarjeta («Postergado — vuelve el 5/9») y al chip de ManualHeader. CausaEspera y causaDeEspera en turno.ts más GUIA_ESPERA; las esperas muestran el draftUrl y dicen «Toques: N de 3». Spec 17.
- Referencias: fix/datos-viajan · b87bc821 · turno.ts · flow.ts · guidance-content.ts (GUIA_ESPERA) · estado-manual.tsx +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-920] Referencia de plazo en las esperas (enRevisionAt / SLA)
- Fuente: `docs/bitacora-beta-3.md:7253` · tipo: idea · estado declarado: no hecho (requiere campo nuevo) · fecha: 2026-08-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Las esperas no pueden decir hace cuánto que esperan: no hay marca de entrada a revisión ni SLA persistido. Cerrarlo pide un campo nuevo.
- Referencias: OsLeadDossier (aprobadaAt, enviadaAt)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-921] Guards de stage inline en siete updateMany de dossier.ts
- Fuente: `docs/bitacora-beta-3.md:7531` · tipo: pendiente · estado declarado: listado, sin tocar · fecha: 2026-08-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Siete consultas vuelven a escribir en su where la máquina de stage que le pertenece a LEGAL_TRANSITIONS: el caso 2 de P8, pero aplicado a consultas.
- Referencias: dossier.ts:266,291,319,345,377,404,422
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-922] Escrituras de canal y resultado sin fragmento propio
- Fuente: `docs/bitacora-beta-3.md:7534` · tipo: pendiente · estado declarado: listado, sin tocar · fecha: 2026-08-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El lado de escritura de lo que cuenta el contador escribe el par canal + resultado inline. SOLO_DMS_MANDADOS solo lo nombra para las lecturas.
- Referencias: outreach.actions.ts:127-128 · outreach.actions.ts:190 · agenda.actions.ts:241-242
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-923] El borde del día argentino tiene copias privadas en LeadOS
- Fuente: `docs/bitacora-beta-3.md:7537` · tipo: pendiente · estado declarado: listado, sin tocar · fecha: 2026-08-27 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Además de la versión canónica de dates-ar.ts hay una copia privada en outreach.ts y otra propia en el cron os-follow-up. Ninguna se tocó.
- Referencias: dates-ar.ts · outreach.ts:15-33 · api/cron/os-follow-up/route.ts:7
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-924] P10 DESTINOS ALCANZABLES: censo de los destinos que nombran las quince pantallas
- Fuente: `docs/bitacora-beta-3.md:7685` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-30 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Se encontraron 19 menciones con defecto en cinco clases. Se arreglaron las clases 1 a 3 y el enlace que rebotaba: EnlacePantalla, el enlace a «Correcciones» desde mc1/mc2 y M16Municion con estadoDeAgenda. Invariante enlaces-manual (6.912 estados); spec 17-destinos.
- Referencias: fix/destinos-alcanzables · 1596b1cb · EnlacePantalla · src/lib/leados/enlaces-manual.invariant.ts · tests/setter/17-destinos-alcanzables.spec.ts · cierra pendiente de docs/bitacora-beta-3.md:7134 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-925] Date.now() en el render de m5-seguimiento.tsx (error de lint)
- Fuente: `docs/bitacora-beta-3.md:7851` · tipo: pendiente · estado declarado: anotado, sin hacer · fecha: 2026-08-30 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Error react-hooks/purity que ya estaba antes de P10.
- Referencias: m5-seguimiento.tsx:63 · tambien en docs/bitacora-beta-3.md:8076
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-926] Contenido muerto de la guía que nombra destinos
- Fuente: `docs/bitacora-beta-3.md:7854` · tipo: pendiente · estado declarado: anotado, sin hacer · fecha: 2026-08-30 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: GUIA_CONSTRUCCION, partes de GUIA_BRIEF, GUIA_OPENER y GUIA_SEGUIMIENTO, GUIA_TRASPASO y GUIA_REVISION.aprobada no tienen consumidores. Borrarlos es otro sprint.
- Referencias: guidance-content.ts · tambien en docs/bitacora-beta-3.md:8076
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-927] La copy en subjuntivo de m-construccion.tsx ya no hace falta
- Fuente: `docs/bitacora-beta-3.md:8075` · tipo: pendiente · estado declarado: anotado, no tocado · fecha: 2026-08-30 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Está redactada así para esquivar el expectToast viejo, que ya se arregló. Es código de producto y no se tocó.
- Referencias: m-construccion.tsx · tambien en docs/bitacora-beta-3.md:8207
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-928] CORRIDA DE RECORRIDO: el camino entero de un lead por la UI real
- Fuente: `docs/bitacora-beta-3.md:8211` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: De la carga del lead a la agenda, pasando por rechazo, retrabajo, aprobación, envío y postergación, más un descarte completo. Encontró 9 baches (B1 a B9) y declaró 6 falsos positivos, sin tocar código.
- Referencias: corrida/recorrido-completo · 2da5de41 · docs/corrida-recorrido-2026-08-31/ · cumple docs/bitacora-beta-3.md:6740 · cumple docs/bitacora-beta-3.md:7860
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-929] Carrera de tildes del auto-reporte (B3 / N2): el arreglo de P25 hay que rehacerlo sobre el tronco
- Fuente: `docs/bitacora-beta-3.md:8238` · tipo: pendiente · estado declarado: pendiente (arreglo de P25 sin integrar) · fecha: 2026-08-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Tildar tres fases en 400 ms guarda una y la pantalla muestra tres (progresoJson; selfCheckJson está a salvo). P25 (d0b37c71) lo arregló fuera del tronco y quedó en p25/carrera-tildes. Se rehace en su propio sprint: dueño único del blob y autoguardado serializado.
- Referencias: p25/carrera-tildes · d0b37c71 · fase-auto-reporte.tsx · tambien en docs/bitacora-beta-3.md:8489 · tambien en docs/bitacora-beta-3.md:9915 · tambien en docs/bitacora-beta-3.md:10857 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-930] B5: la pantalla no acompaña al dato
- Fuente: `docs/bitacora-beta-3.md:8243` · tipo: pendiente · estado declarado: pendiente (sin tocar en el rango) · fecha: 2026-08-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Bache de la corrida del novato clasificado como «molesta» y vivo desde agosto. El detalle está en el reporte de la corrida, no en la bitácora.
- Referencias: docs/corrida-recorrido-2026-08-31/ · tambien en docs/bitacora-beta-3.md:8260 · tambien en docs/bitacora-beta-3.md:8489 · tambien en docs/bitacora-beta-3.md:9915
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-931] Cal.com y Telegram sin configurar ni verificados de punta a punta
- Fuente: `docs/bitacora-beta-3.md:8282` · tipo: pendiente · estado declarado: pendiente (configuración de Franco) · fecha: 2026-08-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: calComUsername y calComEmbedUrl están en null en todas las orgs (setup B7.0), así que confirmarReunion → POST /v2/bookings nunca se ejecutó. Telegram no tiene credenciales y el escalamiento «Me trabé» no sale. La configuración la hace Franco en la org develOP.
- Referencias: agenda.actions.ts · cal-com-v2.ts · AgencySettings · B7.0 · tambien en docs/bitacora-beta-3.md:8234 · tambien en docs/bitacora-beta-3.md:8321 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-932] LA CONFIGURACIÓN QUE FALTA: el brief no exige lo que no se puede traer y Cal.com deja la jerga
- Fuente: `docs/bitacora-beta-3.md:8302` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-31 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: herramientaSinLink y faltaPorHerramientaSinLink en herramientas.ts. El brief exige el pegado del Gem solo si el Gem tiene link, y el faltante se nombra en vez de omitirse. Los mensajes de Cal.com se reescribieron sin jerga. Invariante copy-sin-jerga; specs 19 y campo-sin-herramienta.
- Referencias: fix/config-faltante · fa36389a · 52ac5c62 · herramientas.ts · agenda.ts · cal-com-v2.ts:200 +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-933] D15-bis LA FUSIÓN: ficha y veredicto en una sola pantalla (m1)
- Fuente: `docs/bitacora-beta-3.md:8495` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: m2 sale del registro: el setter carga la ficha y decide el veredicto en m1, sin el chat externo. DESCARTADA aterriza en archivo, m1 se completa con el veredicto y quedan 9 fases y 14 pantallas. LEGAL_TRANSITIONS, EvaluacionSchema y transitionDossier no se tocaron; spec 20.
- Referencias: fix/fusion-m1-m2 · f4332226 · 52ac5c62 · m1-ficha.tsx · src/lib/leados/manual.invariant.ts:88 · tests/setter/20-veredicto-abre-construir.spec.ts +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-934] P16 LA FICHA POR FUENTES: cinco bloques y avance por completitud (piloto)
- Fuente: `docs/bitacora-beta-3.md:8795` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: La ficha se recorre por fuente: Instagram, Google, web, balance y «Tu decisión», cada bloque con su material. El siguiente se abre solo al completar el anterior, sin persistir estado. ficha-bloques.ts, bloques-secuenciales.tsx e invariante ficha-bloques; spec 21. Contratos y gate intactos.
- Referencias: fix/ficha-por-fuentes · 8b8ecf23 · f4332226 · src/lib/leados/ficha-bloques.ts · src/lib/leados/ficha-bloques.invariant.ts · src/app/(protected)/setter/_components/bloques-secuenciales.tsx +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-935] ¿El avance por completitud se extiende a las catorce pantallas?
- Fuente: `docs/bitacora-beta-3.md:8810` · tipo: decision · estado declarado: pendiente (decisión de Franco) · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Lo decide Franco con el piloto de P16 andando. Lecciones: «completo» necesita las dos mitades, el avance espera al pointerup, las cabeceras de lo que viene van visibles y el nombre del bloque no puede competir con los controles.
- Referencias: S2 (A3-bis) · tambien en docs/bitacora-beta-3.md:9188
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-936] La sugerencia de calidad frena el avance automático (a criterio de Franco)
- Fuente: `docs/bitacora-beta-3.md:8985` · tipo: decision · estado declarado: la tomó el sprint; a validar por Franco · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El bloque no se pliega mientras haya un nudge recién disparado, pero no funciona como gate: no bloquea submit ni transición. Es la única decisión de P16 que roza un límite escrito.
- Referencias: ficha-calidad.ts · tambien en docs/bitacora-beta-3.md:9186
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-937] Rediseño de la ficha: cuatro campos nuevos, dos umbrales y el corte de diez minutos
- Fuente: `docs/bitacora-beta-3.md:9159` · tipo: bloque · estado declarado: fuera de alcance; pendiente (decisión de Franco) · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Dirección, horarios, contacto exacto y «cómo se ve la web» (llenaría el bloque de la web, que hoy tiene un solo campo), más dos umbrales de suficiencia y el corte de diez minutos. Cambian el contrato del blob o requieren decisiones de Franco.
- Referencias: FichaSchema (contracts.ts) · tambien en docs/bitacora-beta-3.md:8785 · tambien en docs/bitacora-beta-3.md:8885
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-938] FichaStep con editable={true} es código muerto
- Fuente: `docs/bitacora-beta-3.md:9173` · tipo: pendiente · estado declarado: anotado, no tocado · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Su único consumidor lo monta con editable={false}. La rama viva arrastra GUIA_FICHA.intro, duracion y el CopyBlock de la ficha, que no se renderizan en ningún lado. La limpieza no se hizo.
- Referencias: FichaStep · GUIA_FICHA
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-939] P17 EL CROMO DEL PRIMER PLIEGUE: el layout-tipo de PantallaManual achicado
- Fuente: `docs/bitacora-beta-3.md:9197` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Las zonas pasan a banda y solo el bloque de trabajo es tarjeta; se fue el eyebrow, el cyan quedó reservado a la acción y se plegaron el preview de CopyBlock y la tabla de criterios de m1. A 1440 las 11 pantallas de trabajo muestran algo accionable en el pliegue. Spec 22.
- Referencias: fix/cromo-primer-pliegue · c9b1db7a · 8b8ecf23 · scripts/qa-corridas/medir-pliegue-manual.ts · scripts/v1-qa-wizard-states.ts · tests/setter/22-cromo-primer-pliegue.spec.ts +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-940] Plegar las guías numeradas de m13, m16 y m5 lo decide Franco
- Fuente: `docs/bitacora-beta-3.md:9358` · tipo: decision · estado declarado: pendiente (decisión de Franco) · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: A 390 lo que queda arriba del trabajo ya no es cromo sino contenido. Plegarlo mejoraría el número, pero sería sacarle al manual lo que es.
- Referencias: tambien en docs/bitacora-beta-3.md:9453
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-941] Contraste de copy-block.tsx en el estado «Copiado»
- Fuente: `docs/bitacora-beta-3.md:9460` · tipo: pendiente · estado declarado: anotado, no tocado · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Usa text-zinc-300 sobre el tinte esmeralda y el hook de diseño lo marca. Ya estaba antes del sprint y no se tocó.
- Referencias: copy-block.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-942] P17: validar el plegado del preview copiable y el filo neutro de la instrucción
- Fuente: `docs/bitacora-beta-3.md:9471` · tipo: decision · estado declarado: tomada; a validar por Franco · fecha: 2026-09-01 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Plegar el texto crudo del bloque copiable fue el único movimiento que cambió veredictos; botón y título quedaron arriba. El cyan pasó al bloque de trabajo y la instrucción quedó con filo neutro. Las dos cosas quedan para que las mire Franco.
- Referencias: tambien en docs/bitacora-beta-3.md:9474
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-943] P18 LA ACCIÓN A LA VISTA: barra de acción principal en las pantallas del manual
- Fuente: `docs/bitacora-beta-3.md:9479` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: barra-accion.tsx queda sticky al pie de PantallaManual. Cada formulario declara su acción con useAccionPrincipal, con el mismo estado y el mismo disabled, y el motivo del bloqueo va con aria-describedby. Acción visible 9/9 a los dos anchos; spec 23.
- Referencias: fix/accion-a-la-vista · 66d7fe64 · c9b1db7a · manual/_components/barra-accion.tsx · tests/setter/23-accion-a-la-vista.spec.ts · docs/baselines/p18-pliegue-antes.json +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-944] La suite no cubre m16 para la barra de acción
- Fuente: `docs/bitacora-beta-3.md:9685` · tipo: pendiente · estado declarado: anotado · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Su acción solo aparece después de elegir un horario, y para eso hace falta una búsqueda real de disponibilidad. Se verificó a mano.
- Referencias: agenda-form.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-945] La barra de acción aparece recién en la hidratación
- Fuente: `docs/bitacora-beta-3.md:9687` · tipo: pendiente · estado declarado: anotado · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El botón ya no viene en el HTML del server, así que en una carga fría hay un instante sin barra. Se podría cerrar pasando un descriptor desde el server; queda para otro sprint.
- Referencias: barra-accion.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-946] m1 con la ficha vacía no ofrece ninguna acción
- Fuente: `docs/bitacora-beta-3.md:9690` · tipo: decision · estado declarado: pendiente (decisión de producto) · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El acordeón de P16 no monta el veredicto hasta que se abre el último bloque. Si el veredicto tendría que estar disponible antes, es una decisión de producto.
- Referencias: m1-ficha.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-947] ¿Sigue el patrón de la barra fija? (el costo en m4 a 1440)
- Fuente: `docs/bitacora-beta-3.md:9704` · tipo: decision · estado declarado: pendiente (decisión de Franco) · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: La barra cuesta 57 px de pliegue y cambió un solo veredicto: m4 a 1440, que tenía 8 px de margen. La pregunta de fondo es si hace que el producto se lea como una aplicación.
- Referencias: tambien en docs/bitacora-beta-3.md:9706
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-948] P19 EL PASO QUE CORRESPONDE: barrido de la derivación del paso actual
- Fuente: `docs/bitacora-beta-3.md:9711` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: 373.248 combinaciones contra un oráculo independiente. La postergación entra a la derivación, el re-loop aterriza en mc1, «aparece en tu foco» pasa a «entra a tu cola» y se disuelve la zona vacía de mr. Pantallas no admitidas como paso de ahora: de 29.856 a 0. Invariante paso-admitido; spec 24.
- Referencias: fix/paso-que-corresponde · 62c6273a · 66d7fe64 · scripts/qa-corridas/barrido-derivacion.ts · src/lib/leados/paso-admitido.ts · paso-admitido.invariant.ts +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-949] Con la reunión ya agendada se aterriza en m16 «Agendá la reunión»: excepción declarada
- Fuente: `docs/bitacora-beta-3.md:9804` · tipo: decision · estado declarado: declarado, no arreglado (a propósito) · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Es un aterrizaje terminal, sin acción y con badge «Completada». Mandarlo a espera haría decir «Le toca al negocio» sobre una reunión ya reservada. El invariante declara cada caso y exige que la excepción siga ocurriendo.
- Referencias: paso-admitido.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-950] `ficha` es un campo muerto en DerivacionManualInput
- Fuente: `docs/bitacora-beta-3.md:9813` · tipo: pendiente · estado declarado: anotado, no tocado · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Ninguna rama de la derivación de posición lo lee; lo consumen las pantallas. Anotado, no tocado.
- Referencias: DerivacionManualInput (manual.ts) · tambien en docs/bitacora-beta-3.md:9914
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-951] Un cuarto turno para la espera de un lead que pausó el setter
- Fuente: `docs/bitacora-beta-3.md:9907` · tipo: idea · estado declarado: anotado · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: La espera de un postergado dice «Le toca al negocio» y la causa lo aclara abajo, pero el titular no nombra a quien decidió la pausa. Un cuarto turno queda para otro sprint.
- Referencias: turno.ts · tambien en docs/bitacora-beta-3.md:9922
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-952] Registrar qué correcciones del rechazo se aplicaron
- Fuente: `docs/bitacora-beta-3.md:9910` · tipo: idea · estado declarado: no hecho (el dato no existe) · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Sin ese dato, mientras el re-loop siga abierto el paso señalado es la construcción (mc1), aunque el setter ya esté más adelante. No se inventó el dato.
- Referencias: tambien en docs/bitacora-beta-3.md:9923
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-953] P20 LA FRANJA DEL RECORRIDO: los nueve pasos a la vista en las catorce pantallas
- Fuente: `docs/bitacora-beta-3.md:9938` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: FranjaRecorrido va entre la cabecera y el título. Sus pasos salen de FASES_EN_ORDEN, el paso de ahora de posicion.actual, y solo enlaza lo alcanzable. Reemplaza a NavAtras y a indicadorDeFase, que se borró. Invariante recorrido; spec 25 con 37 casos.
- Referencias: fix/franja-recorrido · 795d8f31 · 62c6273a · franja-recorrido.tsx · recorrido.ts · scripts/qa-corridas/capturar-franja.ts +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-954] Mantener o sacar la franja según el saldo vertical
- Fuente: `docs/bitacora-beta-3.md:10130` · tipo: decision · estado declarado: pendiente (decisión de Franco) · fecha: 2026-09-02 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Cuesta 33 px de pliegue y devuelve entre 59 y 128 px de scroll en 12 de las 14 pantallas; m1 a 390 conserva 25 px de margen. El sprint deja el número; la conclusión es de Franco.
- Referencias: tambien en docs/bitacora-beta-3.md:10127
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-955] P20 ADENDA: re-verificación completa y arreglo del «Opener» prometido en pantallas de estado
- Fuente: `docs/bitacora-beta-3.md:10135` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-09-03 · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: Todo lo que reportó P20 se reprodujo sin diferencias, y no se perdió ningún destino. iSiguiente ya no nombra el primer paso cuando no hay paso de ahora (espera, revisión y archivo a 390). También corrige las citas archivo:línea de P20.
- Referencias: 795d8f31 · 29d0635f · franja-recorrido.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-956] P23 EL VEREDICTO QUE SE PIERDE Y EL CICLO: cinco baches de la segunda corrida del novato
- Fuente: `docs/bitacora-beta-3.md:10647` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-09-03/06 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: El veredicto no se autoguarda y la copy deja de prometerlo; salir con datos cargados pregunta (useUnsavedGuard opt-in). Se suprime la vuelta del ciclo espera⇄m5 con ofreceSalida. Se reescribieron las referencias de ubicación, y los avisos caducos envejecen en vez de borrarse. Spec 28.
- Referencias: fix/veredicto-y-ciclo · ea94dbf8 · manual.ts (ofreceSalida) · useUnsavedGuard · check:invariant:copy-sin-ubicacion · check:invariant:novedades-vigencia +4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-957] Autoguardar el veredicto exige una columna nueva (frenado; decide Franco)
- Fuente: `docs/bitacora-beta-3.md:10665` · tipo: decision · estado declarado: frenado (decisión de Franco) · fecha: 2026-09-03/06 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: evaluacionJson solo lo escribe transitionDossier, y el seed usa evaluacionJson != null como proxy, así que un borrador ahí sería un veredicto a medias. Se eligió no autoguardar: hacerlo bien requiere un cambio de schema.
- Referencias: dossier.ts:154 · dossier.ts:185 · prisma/seed-agency-os.ts:2034
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-958] N8 de la segunda corrida del novato, fuera de scope
- Fuente: `docs/bitacora-beta-3.md:10857` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-09-03/06 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: P23 cerró cinco de los ocho baches; N2 (la carrera de tildes) y N8 quedaron afuera por la regla de un solo objetivo. Este rango no describe qué es N8.
- Referencias: tambien en docs/bitacora-beta-3.md:10649
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-959] «La revisión que sale a internet sola»
- Fuente: `docs/bitacora-beta-3.md:10862` · tipo: pendiente · estado declarado: anotado, sprint propio · fecha: 2026-09-03/06 (inferida) · **ZONA-FRANCO**
- Nodo(s): h5.set-manual
- Qué es: La anotó la segunda corrida del novato para un sprint propio. Este rango no detalla el defecto.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h5.set-nuevo — Cargar un prospecto

#### [PLAN-960] A.1 carga manual de prospecto por el setter
- Fuente: `docs/bitacora-beta-3.md:393` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): h5.set-nuevo
- Qué es: ownedLeadCreateData en isolation.ts (dueño=sesión, caliente=false, source Setter), NuevoProspectoSchema, cargarProspecto, ruta /setter/nuevo, invariante alta-propia.
- Referencias: isolation.ts · prospecto.schemas.ts · prospecto.actions.ts · alta-propia.invariant.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-961] Wizard del setter (B3/B4 de LeadOS)
- Fuente: `docs/bitacora-roadmap.md:7854` · tipo: bloque · estado declarado: pendiente · fecha: 2026-06-12 · **ZONA-FRANCO**
- Nodo(s): h5.set-nuevo
- Qué es: Siguiente trabajo sobre el dossier: las server actions y la UI del setter para ficha, evaluación y brief.
- Referencias: src/lib/leados/dossier.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

## h6 · Entradas públicas que alimentan lo interno

### h6.vis-contacto — Formulario de contacto público

#### [PLAN-962] ESLint set-state-in-effect en /contact (captura de ?ref)
- Fuente: `docs/bitacora-rediseno.md:790` · tipo: pendiente · estado declarado: pendiente (decisión de Franco) · fecha: 2026-07-30
- Nodo(s): h6.vis-contacto
- Qué es: Error preexistente en app/contact/page.tsx:73 (y en DiagnosticoSoftware.tsx:520); queda abierto si va en sprint aparte o se deja.
- Referencias: src/app/contact/page.tsx:73 · src/components/software/DiagnosticoSoftware.tsx:520 · también en docs/bitacora-rediseno.md:1037 · también en docs/bitacora-rediseno.md:1080 · también en docs/bitacora-rediseno.md:1231
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### h6.vis-optout — Baja de emails de marketing

#### [PLAN-963] F7: /api/email/optout/[contactId] sin firma
- Fuente: `docs/bitacora-roadmap.md:6496` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): h6.vis-optout
- Qué es: Cualquiera con el link puede dar de baja al contacto; replicar el HMAC de unsubscribe-executive. B11.3 lo deja para un sprint dedicado y el checklist de B-SEC.3c lo da por cerrado citando unsubscribe-token.ts (contradicción, ver notas).
- Referencias: src/app/api/email/optout/[contactId]/route.ts:4-14 · tambien en docs/bitacora-roadmap.md:6543 · tambien en docs/bitacora-roadmap.md:6556 · tambien en docs/bitacora-roadmap.md:6822 · tambien en docs/bitacora-roadmap.md:7241 · tambien en docs/bitacora-roadmap.md:8401
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-964] SEC vía 1: opt-out de email con token HMAC
- Fuente: `docs/bitacora-roadmap.md:10995` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): h6.vis-optout
- Qué es: La ruta de opt-out exige token por contacto; cierra IDOR/enumeración y el bug de {{contact.id}} de Brevo.
- Referencias: src/app/api/email/optout/[contactId]/route.ts · src/lib/email/unsubscribe-token.ts · tests/e2e/20-idor-optout.spec.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-965] Atributos Brevo CONTACT_ID/OPTOUT_TOKEN + e2e de opt-out
- Fuente: `docs/bitacora-roadmap.md:11031` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): h6.vis-optout
- Qué es: Crear atributos en Brevo para que el footer interpole el token; correr 20-idor-optout.spec.ts.
- Referencias: también en fuente:11029
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

## Transversal, plataforma y otros

### lib.otro

#### [PLAN-966] Ultracode solo para builds arquitectónicos
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:42` · tipo: decision · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): lib.otro
- Qué es: Solo en E1.2, E3.1 y E4.1. Las auditorías nunca van en /loop. El tope de modelo es Opus 4.8.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:13
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-967] Descargo contractual por alucinaciones
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:57` · tipo: decision · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): lib.otro
- Qué es: Abierta, precedente Air Canada. No bloquea, pero tiene que estar antes del primer contrato nuevo.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-968] Integrar T0/MH/RB al índice y generar sus hojas
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:70` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): lib.otro
- Qué es: Sumar 'R1 exige MH' y EST.0 al 00-INDICE. Las hojas de corrida de T0, MH y RB no están generadas.
- Referencias: 00-INDICE-bloques-ejecucion.md · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:71
- Estado en código: **no empezado** — git ls-tree -r --name-only origin/main | grep -i 00-INDICE → solo logic-core-v3/docs/manual-usuario/00-INDICE.md; 00-INDICE-bloques-ejecucion.md no está en el repo (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-969] Archivar pendientes-delta en docs/roadmap-pendientes.md
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:93` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): lib.otro
- Qué es: Hallazgos de las Auditorías I-III y absorciones (scoping, event-types, LEAD_INTENTS, cache, gate GCP).
- Referencias: docs/roadmap-pendientes.md · pendientes-delta-evolucion.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-970] Documentos de referencia que no existen en el repo
- Fuente: `docs/bitacora-beta-3.md:1103` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-04 · **ZONA-FRANCO**
- Nodo(s): lib.otro
- Qué es: docs/brief-vision-flujo-setter.md, Cimiento de Chat, Manual de Flujo, inventario de 16 pantallas (brief v3 §9) y correccion-decisiones-vs-A3.md.
- Referencias: también en fuente:1208,1787,2041,4975
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-971] Corrida D1: método LeadOS destilado
- Fuente: `docs/bitacora-beta-3.md:1752` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-23 · **ZONA-FRANCO**
- Nodo(s): lib.otro
- Qué es: docs/metodo/LECCIONES-LEADOS.md, PROPUESTA-CIMIENTO.md (21 cambios de método) y MAPA-LEADOS.md.
- Referencias: commits 23a19c3,f01a178,69d0fb4 · docs/metodo/
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-972] Galería de estados M0 y regeneración (Corrida G)
- Fuente: `docs/bitacora-beta-3.md:1845` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): lib.otro
- Qué es: Galería docs/manual-usuario/galeria/ (npm run galeria); luego aislada en .next-galeria :3004 con índice generado por scripts/dev/m0-galeria-indice.ts.
- Referencias: también en fuente:3308 · commit c138ae4c · playwright.galeria.config.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-973] Manual de usuario del Panel del Setter (M1 y M1 v3)
- Fuente: `docs/bitacora-beta-3.md:1939` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-10 · **ZONA-FRANCO**
- Nodo(s): lib.otro
- Qué es: docs/manual-usuario/ índice + capítulos y HALLAZGOS-MANUAL.md; v3 reescrito sobre el producto podado (13 capítulos).
- Referencias: también en fuente:3423 · docs/manual-usuario/00-INDICE.md · HALLAZGOS-MANUAL.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-974] Galería y manual de usuario desfasados y con huecos
- Fuente: `docs/bitacora-beta-3.md:1979` · tipo: pendiente · estado declarado: pendiente · **ZONA-FRANCO**
- Nodo(s): lib.otro
- Qué es: Cartera nunca fotografiada (35 y 36 idénticos), estados sin captura y capítulos desfasados por P11; el índice declara 0 huecos.
- Referencias: docs/manual-usuario/galeria/INDICE.md · también en fuente:3397,4513
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-975] PROBE terreno para la poda
- Fuente: `docs/bitacora-beta-3.md:2006` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-31 · **ZONA-FRANCO**
- Nodo(s): lib.otro
- Qué es: docs/probe-poda-terreno.md: 10 ítems relevados y 55 hallazgos laterales (rama redesign/home).
- Referencias: docs/probe-poda-terreno.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-976] Contenido comercial del manual que solo Franco puede escribir
- Fuente: `docs/bitacora-beta-3.md:3514` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-10 · **ZONA-FRANCO**
- Nodo(s): lib.otro
- Qué es: Rubros y zonas que funcionan, tono real, openers y respuestas a objeciones curadas.
- Referencias: docs/manual-usuario/
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-977] Corridas de experiencia y re-verificación de baches
- Fuente: `docs/bitacora-beta-3.md:3943` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-11 · **ZONA-FRANCO**
- Nodo(s): lib.otro
- Qué es: BACHES-CORRIDA-EXPERIENCIA.md (48 baches, medida sobre 4dadd274 sin poda) y BACHES-RE-VERIFICADOS.md; capturas setter y admin en docs/diagnostico-visual-*.
- Referencias: también en fuente:4086,4745,4813 · docs/manual-usuario/BACHES-RE-VERIFICADOS.md · docs/diagnostico-visual-2026-08/ · docs/diagnostico-visual-admin-2026-08/
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-978] Verificación de arranque OSLead VII
- Fuente: `docs/bitacora-beta-3.md:4454` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-18 · **ZONA-FRANCO**
- Nodo(s): lib.otro
- Qué es: docs/verificacion-arranque-oslead-vii.md: F1/F2 sin pushear, F3 sin commit, F4 inexistente, 15 pasos sobre 6 rutas.
- Referencias: docs/verificacion-arranque-oslead-vii.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-979] A3 y A3-BIS viabilidad de decisiones OSLead VII
- Fuente: `docs/bitacora-beta-3.md:4885` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-24 · **ZONA-FRANCO**
- Nodo(s): lib.otro
- Qué es: docs/auditorias/A3-VIABILIDAD-DECISIONES-2026-08.md y A3-VIABILIDAD-BIS-2026-08.md.
- Referencias: también en fuente:4963 · docs/decisiones-oslead-vii/
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-980] El slug del bot demo es 'develop', no 'aki'
- Fuente: `docs/bitacora-roadmap.md:5936` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): lib.otro
- Qué es: Corregir snippets o docs que hardcodeen 'aki'.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-981] getN8nMetrics (src/lib/n8n.ts) mock sin call sites
- Fuente: `docs/bitacora-roadmap.md:6166` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-05-25
- Nodo(s): lib.otro
- Qué es: Código muerto o futuro; si un módulo lo consume debe usar isMockData + PreviewBanner.
- Referencias: src/lib/n8n.ts · tambien en docs/bitacora-roadmap.md:6199
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-982] Beta de LeadOS sigue en bitacora-beta.md
- Fuente: `docs/bitacora-roadmap.md:10803` · tipo: decision · estado declarado: hecho · fecha: 2026-06-18 · **ZONA-FRANCO**
- Nodo(s): lib.otro
- Qué es: Este archivo queda como histórico; las entradas de la beta de LeadOS van a bitacora-beta.md.
- Referencias: docs/bitacora-beta.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-983] Actualizar workflow n8n para leer signalsV2
- Fuente: `docs/bitacora-roadmap.md:11543` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-30
- Nodo(s): lib.otro
- Qué es: No urgente: el workflow v1 sigue funcionando.
- Referencias: también en fuente:11590
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-984] Regla de gates: uno por vez y sin pipes
- Fuente: `docs/bitacora-roadmap.md:16414` · tipo: decision · estado declarado: hecho
- Nodo(s): lib.otro
- Qué es: Un pipe enmascaró tsc/eslint y el exit code; leer salida completa o usar PIPESTATUS.
- Referencias: también en fuente:17106
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### lib.plataforma

#### [PLAN-985] Q1: batería de evals
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:23#3` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): lib.plataforma
- Qué es: ~36 escenarios con asserts y juez. Las decisiones A–D por defecto están sin ratificar. Es el gasto pesado legítimo de cuota.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:45 · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:62
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-986] GCP single-project: revisar con el cliente activo #5
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:41` · tipo: decision · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): lib.plataforma
- Qué es: No se construye ahora. Falta decidir con qué cuenta se paga el LLM.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:50
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-987] Ratificar las decisiones A–D de Q1
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:56` · tipo: decision · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): lib.plataforma
- Qué es: Abierta: confirmarlas o dejar los defaults.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-988] T0.2: cron de cleanupOldEvents
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:14` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): lib.plataforma
- Qué es: Ruta de cron copiada de las dos existentes.
- Referencias: cleanupOldEvents · A2.4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-989] T0.3: higiene de los crons
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:15` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): lib.plataforma
- Qué es: Tipar el any del cron. Si falta CRON_SECRET al inicio de cada cron, abortar.
- Referencias: A5.3 · A1.9a
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-990] Invalidación de cache con varias instancias
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:51` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): lib.plataforma
- Qué es: Diferido: el TTL de 60s lo acota. Revisar si se edita la config en vivo frente a clientes.
- Referencias: A4.6
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-991] CSP de Report-Only a enforcement
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:158` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-12
- Nodo(s): lib.plataforma
- Qué es: Hardening fichado pero no ejecutado.
- Referencias: tambien en Olme/Chatbot_ registro de cambios.md:110
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-992] Infra: default 'generic', DIRECT_URL, main/prod y Vertex
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:167` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-12
- Nodo(s): lib.plataforma
- Qué es: El default 'generic' del schema es código muerto (cambiarlo exige migración). DIRECT_URL sin setear. Reconciliar las branches main y prod. Gobernanza de Vertex/GCP a cargo de Franco.
- Referencias: prisma/schema.prisma · DIRECT_URL · tambien en Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:168
- Estado en código: **no empezado** — schema.prisma:1324 default 'generic' (canónico 'generico' en createClientWithBot.ts:17); sin directUrl (schema.prisma:5-8); no existe rama git prod (git branch -a); credencial de Vertex vencida (hecho conocido) (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-993] Fallback develop de seed-agency-os roto
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Proyectos_ registro de cambios.md:68` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-16
- Nodo(s): lib.plataforma
- Qué es: El map organizationIdBySlug nunca recibe la key. Bug separado.
- Referencias: seed-agency-os · organizationIdBySlug
- Estado en código: **no empezado** — seed-agency-os.ts:2398 y :2422-2426 (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-994] Migraciones de la 3ª tanda
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:37` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): lib.plataforma
- Qué es: Organization recibe city, avatar*, internalNotes y deletedAt. AgencySettings recibe singleton @unique. Ambas con migrate deploy.
- Referencias: 988d1ae · d14fcff · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:37 · tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:68
- Estado en código: **hecho** — 20260619234252_add_organization_city_avatar_notes_softdelete/migration.sql:2-7 y 20260620173833_add_agency_settings_singleton_unique/migration.sql:2-5 en main; luego DROP (20260621120000) y re-ADD (20260622120000) (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-995] Migraciones aditivas con migrate deploy, nunca dev ni reset
- Fuente: `_insumos/drive/Olme/Chatbot_ registro de cambios.md:121` · tipo: decision · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): lib.plataforma
- Qué es: Mostrar el SQL antes de aplicar en Neon. Por el drift de Franco se usa SQL manual con migrate deploy, porque migrate dev dispararía un reset. migrate status no detecta drift estructural: hay que usar migrate diff.
- Referencias: tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:34 · tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:77 · tambien en Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:66 · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:89
- Estado en código: **parcial** — Las reconciliaciones usan IF EXISTS / IF NOT EXISTS vía deploy (20260621120000:11; 20260622120000:9-11) pero 20260621120000:14-29 fue destructiva (DROP) y docs/operations/00-entornos.md:85 sigue indicando 'npx prisma migrate dev'. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-996] Merge de la lane setter de Franco con drift en Neon
- Fuente: `_insumos/drive/Olme/Ideas de nuevas features.md:73` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-20 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: OsLeadSetterMeta, 2 índices y la recreación del enum ActivityChannel ya existen en Neon pero no en schema ni migrations. La migración de Franco debe marcarlos como aplicados (migrate resolve --applied), no recrearlos, porque migrate dev dispararía un reset.
- Referencias: OsLeadSetterMeta · OsLead_assignedToId_nextFollowUpAt_idx · OsLeadActivity_performedById_createdAt_idx · enum ActivityChannel · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:39 · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:66 +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-997] CO-5/CO-6: índices del portal en producción
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:52` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-13
- Nodo(s): lib.plataforma
- Qué es: Migración con 6 índices aditivos en Service, Invoice, Message y ContactSubmission, aplicada con migrate deploy a la Neon compartida.
- Referencias: prisma/migrations/20260710203413_add_portal_indexes
- Estado en código: **hecho** — 20260710203413_add_portal_indexes/migration.sql:1-6; declarados en schema.prisma:544, :603, :685, :705-707. La aplicación en prod no es verificable leyendo. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-998] Enum-izar ContactSubmission.leadStatus
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:62` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-13
- Nodo(s): lib.plataforma
- Qué es: Diferido: pasar String? a enum no es aditivo. Necesita columna nueva, backfill y cutover, o descartarse.
- Referencias: ContactSubmission.leadStatus · tambien en Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:91
- Estado en código: **no empezado** — schema.prisma:697 'leadStatus String? @default("NUEVO")'; validación solo en app (src/lib/actions/leads.ts:27) (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-999] Migraciones fantasma del motor B1 resueltas
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:66` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-13
- Nodo(s): lib.plataforma
- Qué es: Había 3 migraciones aplicadas en Neon sin SQL en git. El dueño las commiteó, los checksums coincidieron y se integraron por merge, sin cirugía.
- Referencias: b1s1_webhook_credentials_and_identity_transitions · b1s2_outbound_apikey_templates_idempotency · b1s3_health_events_and_alerts · 62994be · 5fcb92d · b1-s2-bsp-outbound
- Estado en código: **hecho** — Las tres están versionadas en origin/main: 20260709163143_b1s1_webhook_credentials_and_identity_transitions, 20260709180000_b1s2_outbound_apikey_templates_idempotency, 20260709200000_b1s3_health_events_and_alerts. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1000] Nada se aplica a Neon sin commit y push previo
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:74` · tipo: decision · estado declarado: hecho · fecha: 2026-07-13
- Nodo(s): lib.plataforma
- Qué es: Regla de proceso adoptada tras el incidente de las migraciones fantasma.
- Estado en código: **parcial** — No hay control técnico: netlify.toml:2 no migra y no hay CI de migrate status; el caso 20260619140100 (resuelta sin ejecutar) es anterior a la regla (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1001] Caveats del QA-login
- Fuente: `docs/bitacora-beta-2.md:44` · tipo: pendiente · estado declarado: abierto (conocido) · fecha: 2026-06-25
- Nodo(s): lib.plataforma
- Qué es: curl sobre http no manda cookies Secure (hay que pasarla a mano) y bounce cosmético de :3001 a :3000 por NEXTAUTH_URL.
- Referencias: src/app/api/qa/login/route.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1002] Comentario stale del campo caliente en schema.prisma:824-827
- Fuente: `docs/bitacora-beta-2.md:292` · tipo: pendiente · estado declarado: pendiente (opcional) · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Dice que nadie lo setea ni lo lee; fix trivial de comentario si Franco quiere (schema es frozen).
- Referencias: prisma/schema.prisma:824-827
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1003] E2E global roja en lanes dashboard/cliente/admin
- Fuente: `docs/bitacora-beta-3.md:55` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-29
- Nodo(s): lib.plataforma
- Qué es: Fallas pre-existentes (11-16, 20-22, 30); timeout de login en tests/helpers/auth.ts:12; necesita su pasada de mantenimiento.
- Referencias: también en fuente:782,859,870 · tests/helpers/auth.ts:12
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1004] dev:qa no hidrata pantallas LeadOS pesadas
- Fuente: `docs/bitacora-beta-3.md:95` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-29 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Con 127.0.0.1 Next 16 dev bloquea dev-resources; navegar por localhost; allowedDevOrigins no tocado.
- Referencias: también en fuente:836
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1005] Error de tipos en searchconsole.ts y build sin tipos
- Fuente: `docs/bitacora-beta-3.md:335` · tipo: pendiente · estado declarado: resuelto según L2452 y L5234
- Nodo(s): lib.plataforma
- Qué es: src/lib/searchconsole.ts:119 (google-auth-library duplicada) y ignoreBuildErrors; el error desaparece en L2452 e ignoreBuildErrors se retira en C1.
- Referencias: src/lib/searchconsole.ts:119 · también en fuente:555,2132,2452,5006,5234
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1006] CI nunca corrió y no tiene secrets
- Fuente: `docs/bitacora-beta-3.md:505` · tipo: pendiente · estado declarado: parcial · fecha: 2026-06-30
- Nodo(s): lib.plataforma
- Qué es: e2e.yml anidado no lo leía Actions; desde C1 corre ci.yml, pero los jobs de test saltean sin DATABASE_URL_TEST (0 secrets en el repo).
- Referencias: logic-core-v3/.github/workflows/e2e.yml · .github/workflows/ci.yml · también en fuente:5008,5152,5264,5307,5372
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1007] Drift físico de 7 columnas del lane chatbot
- Fuente: `docs/bitacora-beta-3.md:528` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-30
- Nodo(s): lib.plataforma
- Qué es: Organization.averageTicketUsd, chatbot_bot_config.verticalPack, chatbot_lead.firstContactedAt/signals/utm*: reconciliar es decisión de Franco.
- Referencias: también en fuente:534,554,560,1801
- Estado en código: **hecho** — schema.prisma:409, :1329, :1477, :1481-1483, :1487 las declara; las crean 20260629195726_ev2_vertical_pack_signals_utm/migration.sql:2-9 y 20260630032132_add_org_average_ticket_usd/migration.sql:2 (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1008] Deuda de lint del repo
- Fuente: `docs/bitacora-beta-3.md:778` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-03
- Nodo(s): lib.plataforma
- Qué es: Errores pre-existentes en lanes ajenos (chatbot, tailwind.config); C0 mide 102 errores/110 warnings; el lint queda fuera del gate; globalIgnores no cubre distDirs alternativos.
- Referencias: también en fuente:914,2635,5073,5254,5258 · eslint.config.mjs
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1009] Higiene de tooling
- Fuente: `docs/bitacora-beta-3.md:1186` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-04
- Nodo(s): lib.plataforma
- Qué es: Key eslint deprecada en next.config.ts y falta "type":"module" en package.json.
- Referencias: next.config.ts · package.json
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1010] Renormalización CRLF del repo
- Fuente: `docs/bitacora-beta-3.md:1259` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-11
- Nodo(s): lib.plataforma
- Qué es: core.autocrlf=true + .gitattributes; renormalizar es decisión de Franco.
- Referencias: logic-core-v3/.gitattributes
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1011] Base del lane LeadOS en rama b1-s2-bsp-outbound
- Fuente: `docs/bitacora-beta-3.md:1265` · tipo: decision · estado declarado: declarada · fecha: 2026-07-11 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Declarada tras Sprint R; separar lanes por rama queda a decisión de Franco. Más adelante el trabajo sigue en main, redesign/home y leados/v1-integracion.
- Referencias: rama b1-s2-bsp-outbound · también en fuente:2010,4657
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1012] Sprint T: main typechea (cron cleanup-old-events)
- Fuente: `docs/bitacora-beta-3.md:1269` · tipo: hecho-declarado · estado declarado: hecho (falta next build de Franco) · fecha: 2026-07-17
- Nodo(s): lib.plataforma
- Qué es: getProvidedCronSecret movido de route.ts a cron-secret.ts para que route.ts solo exporte GET+dynamic (TS2344).
- Referencias: commit d0e8ef4 · src/app/api/cron/cleanup-old-events/cron-secret.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1013] Crons: dedupe de getProvidedCronSecret y build autoritativo
- Fuente: `docs/bitacora-beta-3.md:1273` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-17
- Nodo(s): lib.plataforma
- Qué es: Otros 3 route.ts de cron con la misma duplicación; falta el next build de Franco sobre main d0e8ef4.
- Referencias: también en fuente:1283
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1014] QA_ALLOW_LOCALHOST abriría /api/qa/login en prod
- Fuente: `docs/bitacora-beta-3.md:2049` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-31
- Nodo(s): lib.plataforma
- Qué es: El guard se evalúa en request time; validate-origin.ts:49 es otra superficie de una sola pata. Verificar el entorno de producción.
- Referencias: /api/qa/login · validate-origin.ts:49 · también en fuente:2064
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1015] Endpoint test-sentry sin guard en producción
- Fuente: `docs/bitacora-beta-3.md:2062` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-31
- Nodo(s): lib.plataforma
- Qué es: src/app/api/test-sentry/route.ts viaja al bundle y genera un 500 no autenticado.
- Referencias: src/app/api/test-sentry/route.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1016] Invariantes con tsx corren sin chequeo de tipos
- Fuente: `docs/bitacora-beta-3.md:2065` · tipo: pendiente · estado declarado: pendiente (C1b) · fecha: 2026-07-31 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: 24 de 43 scripts usan tsx (postergacion, contador-dms, acuse…); su Record exhaustivo es inerte. Se atiende en C1b.
- Referencias: también en fuente:5103,5282,5328
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1017] Microsprint INFRA: suite del setter con distDir propio
- Fuente: `docs/bitacora-beta-3.md:2398` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-03
- Nodo(s): lib.plataforma
- Qué es: distDir por E2E_DIST_DIR en next.config.ts, script start:setter (.next-setter, :3003), reuseExistingServer false.
- Referencias: next.config.ts · package.json · playwright.setter.config.ts · .gitignore
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1018] qa-persona y qa-walkthrough siguen en .next compartido
- Fuente: `docs/bitacora-beta-3.md:2465` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-03
- Nodo(s): lib.plataforma
- Qué es: playwright.qa-persona/qa-walkthrough.config.ts usan start:qa en .next; la galería ya se aisló en Corrida G.
- Referencias: playwright.qa-persona.config.ts · playwright.qa-walkthrough.config.ts · también en fuente:3317
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1019] Suite qa-persona recorre el wizard retirado
- Fuente: `docs/bitacora-beta-3.md:3291` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-07 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: tests/qa-persona/corrida-1-novato-frio.spec.ts usa [data-step] del wizard; fuera de los gates.
- Referencias: tests/qa-persona/corrida-1-novato-frio.spec.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1020] @next/bundle-analyzer instalado sin cablear
- Fuente: `docs/bitacora-beta-3.md:3667` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-10
- Nodo(s): lib.plataforma
- Qué es: Cablearlo exige tocar next.config.ts.
- Referencias: next.config.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1021] Tailwind escanea docs/ y distDirs
- Fuente: `docs/bitacora-beta-3.md:3777` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-10
- Nodo(s): lib.plataforma
- Qué es: Una clase arbitraria con url() en un .md rompe el build; acotar las fuentes en globals.css; distDirs alternativos deben ignorarse antes del primer build.
- Referencias: globals.css · también en fuente:3651,3757
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1022] tsconfig.json modificado por builds con distDir alternativo
- Fuente: `docs/bitacora-beta-3.md:3798` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-10
- Nodo(s): lib.plataforma
- Qué es: Next agrega includes de .next-galeria/.next-perf-*; quedó sin commitear y mezclado.
- Referencias: tsconfig.json · también en fuente:3407,3928,4873
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1023] F0 + Integración: ramas reconciliadas y carril F en leados/v1-integracion
- Fuente: `docs/bitacora-beta-3.md:4046` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-12 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Push a main 8b60c176..05ae1a87; P11 rescatado del stash; luego F1+F2+F3 mergeados sobre origin/main 17727117 en rama leados/v1-integracion (no main).
- Referencias: también en fuente:4655 · merge 7e18f9a7 · rama leados/v1-integracion
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1024] A2-S1 /setter deja de ser embebible
- Fuente: `docs/bitacora-beta-3.md:4382` · tipo: hecho-declarado · estado declarado: hecho (verificación en prod pendiente) · fecha: 2026-08-15 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: next.config.ts: X-Frame-Options DENY para /(admin|dashboard|setter) y CSP frame-ancestors 'none' en /setter; /embed sigue embebible.
- Referencias: next.config.ts · commit 17727117
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1025] CSP global sigue en Report-Only
- Fuente: `docs/bitacora-beta-3.md:4408` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-15
- Nodo(s): lib.plataforma
- Qué es: Pasarla a enforce es otra decisión, con riesgo sobre el widget embebible.
- Referencias: next.config.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1026] Verificar en prod los headers anti-clickjacking de /setter
- Fuente: `docs/bitacora-beta-3.md:4447` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-15 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: curl -I contra el dominio real en Netlify; Franco no revisó aún el cambio.
- Referencias: también en fuente:4739
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1027] tsx no es dependencia declarada
- Fuente: `docs/bitacora-beta-3.md:4495` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-18
- Nodo(s): lib.plataforma
- Qué es: Resuelve por binario global o caché de npx; de él dependen ~60 invariantes, prisma db seed y los seeds QA.
- Referencias: package.json · también en fuente:4736,4801
- Estado en código: **no empezado** — package.json no lo declara (dependencies :122-170, devDependencies :181-201); 67 líneas con 'npx tsx' y 2 con 'tsx' (:117); package-lock sin node_modules/tsx (control: node_modules/ts-node presente); prisma.config.ts:31 seed 'npx tsx prisma/seed.ts'. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1028] ¿leados/v1-integracion pasa a main?
- Fuente: `docs/bitacora-beta-3.md:4739` · tipo: decision · estado declarado: pendiente de decisión · fecha: 2026-08-20 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Decisión de Franco sobre si la rama integrada pasa a ser main, y cuándo.
- Referencias: rama leados/v1-integracion
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1029] Rotar credencial de la branch Neon dev
- Fuente: `docs/bitacora-beta-3.md:4808` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-20
- Nodo(s): lib.plataforma
- Qué es: Un prefijo del password quedó impreso en el log de una sesión; el documento no contiene el valor.
- Estado en código: **no empezado** — No verificable por código; nada en el repo indica la rotación (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1030] Invariantes con falso verde
- Fuente: `docs/bitacora-beta-3.md:4904` · tipo: pendiente · estado declarado: pendiente (C1b) · fecha: 2026-08-24 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: pantallas-construccion tautológica, progreso-isolation ciega al blob, self-check-gate y contador-dms pasan sabotajes, particion no llama a grupoPara. Se atiende en C1b.
- Referencias: también en fuente:5019,5119,5276,5374
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1031] C0 red de verificación sometida a sabotaje
- Fuente: `docs/bitacora-beta-3.md:5053` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-25
- Nodo(s): lib.plataforma
- Qué es: docs/auditorias/C0-RED-DE-VERIFICACION-2026-08.md: tsc en 0, lint 102 errores, falsos verdes, 21 invariantes huérfanos.
- Referencias: docs/auditorias/C0-RED-DE-VERIFICACION-2026-08.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1032] Tests del chatbot fuera de agregados
- Fuente: `docs/bitacora-beta-3.md:5145` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-25
- Nodo(s): lib.plataforma
- Qué es: ~30 test:* del chatbot no están en ningún agregado; sin aserción de unicidad sobre HARD_CHECKS[].nombre.
- Referencias: package.json
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1033] C1 gate encendido: tipos, 43 invariantes y ci.yml
- Fuente: `docs/bitacora-beta-3.md:5182` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-25
- Nodo(s): lib.plataforma
- Qué es: scripts/run-invariants.mjs (PISO_MINIMO 43), check:types, ignoreBuildErrors retirado, .github/workflows/ci.yml en raíz con Node 24; run 32870120782 success.
- Referencias: scripts/run-invariants.mjs · .github/workflows/ci.yml · commit 2515cb29
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1034] db-backup.yml sin secrets
- Fuente: `docs/bitacora-beta-3.md:5271` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-25
- Nodo(s): lib.plataforma
- Qué es: Usa tres secrets que no existen (0 en el repo): explica el P0 del backup.
- Referencias: .github/workflows/db-backup.yml
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1035] C1b invariantes que prueban lo que prometen (parcial en rango)
- Fuente: `docs/bitacora-beta-3.md:5380` · tipo: hecho-declarado · estado declarado: hecho (detalle fuera de rango) · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Declara cuatro invariantes reforzados solo en *.invariant.ts; en el rango solo la Fase 1 (Node 24 en ci.yml, tabla de runners 19 ts-node / 24 tsx). El resto sigue después de L5500.
- Referencias: commit 3f636437
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1036] check:invariant:client-monthly-report-pdf sigue excluido
- Fuente: `docs/bitacora-beta-3.md:5783` · tipo: promesa · estado declarado: pendiente (excluido con motivo) · fecha: 2026-08-25
- Nodo(s): lib.plataforma
- Qué es: Necesita base. Moverlo al job de CI con DB quedó para el sprint que abra .github/workflows/ci.yml; en EL TRONCO figura como exclusión documentada del runner.
- Referencias: .github/workflows/ci.yml · scripts/run-invariants.mjs · tambien en docs/bitacora-beta-3.md:6187 · tambien en docs/bitacora-beta-3.md:7623 · tambien en docs/bitacora-beta-3.md:10946
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1037] Lint fuera del gate y midiendo mal
- Fuente: `docs/bitacora-beta-3.md:5791` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-25
- Nodo(s): lib.plataforma
- Qué es: Reporta 108.208 problemas porque globalIgnores no cubre los distDir alternativos y se lintean bundles minificados. Queda para un sprint propio, que se describe como barato.
- Referencias: globalIgnores (config ESLint)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1038] Base de test dedicada (DATABASE_URL_TEST / .env.test) para las suites de LeadOS
- Fuente: `docs/bitacora-beta-3.md:5795` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: test:leados y test:setter cargan .env.local y escriben en la Neon dev compartida. No existe .env.test ni DATABASE_URL_TEST, y los jobs test-leados/e2e del CI se saltean con warning.
- Referencias: playwright.setter.config.ts:31 · playwright.leados.config.ts:25 · tests/helpers/setter-db.ts · tambien en docs/bitacora-beta-3.md:6500 · tambien en docs/bitacora-beta-3.md:7625 · tambien en docs/bitacora-beta-3.md:7676 +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1039] C1b: cuatro invariantes con falso verde arreglados
- Fuente: `docs/bitacora-beta-3.md:5799` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-25 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: self-check-gate (censo congelado y self-check guardado ayer), contador-dms (censo de enums en runtime), pantallas-construccion (fixture independiente) y progreso (blob guardado ayer). Sin cambios de producción. El encabezado de C1b está en la línea 5380, fuera del rango.
- Referencias: src/lib/leados/self-check-gate.invariant.ts · src/lib/leados/contador-dms.invariant.ts · src/lib/leados/pantallas-construccion.invariant.ts · src/lib/leados/progreso-isolation.invariant.ts · leados/v1-integracion
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1040] Un invariante nuevo se prueba viendo que imprime, no que sale 0
- Fuente: `docs/bitacora-beta-3.md:6115` · tipo: decision · estado declarado: regla anotada; nada roto · fecha: 2026-08-25
- Nodo(s): lib.plataforma
- Qué es: Con ts-node, un archivo cuyos imports son todos import type compila y type-chequea, pero no ejecuta su cuerpo y sale 0 en silencio. Hoy los 19 tienen un import de valor; queda como regla.
- Referencias: scripts/run-invariants.mjs
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1041] V1-A-MAIN: la rama de integración a salvo y el merge a main preparado
- Fuente: `docs/bitacora-beta-3.md:6376` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-25/26 (inferida) · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Se pusheó leados/v1-integracion (3f636437..b3ea27db). leados/v1-a-main se creó desde origin/main y avanzó por fast-forward a b3ea27db sin conflictos. F1, F2 (guia-retrabajo) y F3 (acuse-recibo) se verificaron por contenido. No se pusheó a main.
- Referencias: leados/v1-integracion · leados/v1-a-main · b3ea27db · 17727117 · src/lib/leados/acuse-recibo.invariant.ts · guia-retrabajo.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1042] Push a main (lo hace Franco) y primera corrida del gate de CI sobre main
- Fuente: `docs/bitacora-beta-3.md:6517` · tipo: pendiente · estado declarado: pendiente (Franco); ningún sprint del rango pusheó a main · fecha: 2026-08-25/26 (inferida) · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Cada sprint del rango le deja a Franco el ascenso a main con refspec explícito: primero leados/v1-a-main, después fix/una-sola-fuente y al final la punta del tronco. La primera corrida de ci.yml sobre main queda para verificación humana.
- Referencias: git push origin refs/heads/leados/v1-a-main:refs/heads/main · git push origin refs/heads/fix/una-sola-fuente:refs/heads/main · .github/workflows/ci.yml · tambien en docs/bitacora-beta-3.md:6205 · tambien en docs/bitacora-beta-3.md:7664 · tambien en docs/bitacora-beta-3.md:7675 +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1043] Cuenta exacta de invariantes, con fallo en las dos direcciones
- Fuente: `docs/bitacora-beta-3.md:7510` · tipo: decision · estado declarado: regla vigente · fecha: 2026-08-27
- Nodo(s): lib.plataforma
- Qué es: INVARIANTES_ESPERADOS en run-invariants.mjs aborta si hay invariantes de más o de menos. Quien agrega uno sube la cuenta en el mismo commit: 48 en P8, 56 en P23.
- Referencias: scripts/run-invariants.mjs · tambien en docs/bitacora-beta-3.md:10842
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1044] El cron os-follow-up escribe el status POSTERGADO inline
- Fuente: `docs/bitacora-beta-3.md:7535` · tipo: pendiente · estado declarado: listado, sin tocar · fecha: 2026-08-27 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: El status aparece dos veces en el cron sin una fuente única.
- Referencias: api/cron/os-follow-up/route.ts:168 · api/cron/os-follow-up/route.ts:176
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1045] Techo declarado de la red sin base
- Fuente: `docs/bitacora-beta-3.md:7543` · tipo: decision · estado declarado: aceptado (límite declarado) · fecha: 2026-08-27 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Los invariantes no pueden afirmar que contarDmsHoy y pausarLead sigan llamando a la fuente única, ni detectar que un script se va y entra otro (la cuenta no cambia). Se acepta como límite.
- Referencias: tambien en docs/bitacora-beta-3.md:7544
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1046] EL ASCENSO: las seis ramas de P3 a P8 pusheadas y verificadas
- Fuente: `docs/bitacora-beta-3.md:7566` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-29 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Seis ramas pusheadas con refspec explícito, verificadas 0/0 contra origin. La punta 0c92dd08 es fast-forward sobre origin/main 17727117 y los gates dan verde con 47 invariantes. No se pusheó a main.
- Referencias: 0c92dd08 · 17727117 · a2004edb · fa4af2a0 · 6ef28432 · b87bc821 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1047] Ramas pusheadas sin upstream configurado
- Fuente: `docs/bitacora-beta-3.md:7681` · tipo: pendiente · estado declarado: deliberado, anotado · fecha: 2026-08-29 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Se pushearon con refspec explícito y sin -u, a propósito. Un git push sin argumentos parado en ellas sigue siendo ambiguo.
- Referencias: tambien en docs/bitacora-beta-3.md:6733
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1048] P11 LOS HELPERS QUE PRUEBAN: cuatro helpers de test con falso verde arreglados
- Fuente: `docs/bitacora-beta-3.md:7864` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-30 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: expectToast queda acotado a [data-sonner-toast]; pickSelect, typeControlledInput y setControlledSelect afirman su post-condición. Banco propio tests/helpers-probe (npm run test:helpers, sin server ni DB). Cero código de producto.
- Referencias: fix/helpers-que-prueban · 728b943e · tests/helpers/setter-ui.ts · tests/helpers/form.ts · playwright.helpers-probe.config.ts · tests/helpers-probe/ +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1049] fieldControl + firstVisible eligen en silencio cuando dos etiquetas coinciden
- Fuente: `docs/bitacora-beta-3.md:8041` · tipo: pendiente · estado declarado: latente, anotado · fecha: 2026-08-30 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: El contains() del xpath es portante y los 21 call sites lo envuelven en firstVisible(). El sabotaje queda en test.fail() a propósito, y los 15 call sites dentro de las 118 pruebas no están medidos. Cerrarlo obliga a tocar los 21.
- Referencias: tests/helpers/setter-ui.ts:42 · tambien en docs/bitacora-beta-3.md:8072 · tambien en docs/bitacora-beta-3.md:8195 · tambien en docs/bitacora-beta-3.md:8206
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1050] Tres helpers de test muertos
- Fuente: `docs/bitacora-beta-3.md:8074` · tipo: pendiente · estado declarado: anotado, sin hacer · fecha: 2026-08-30
- Nodo(s): lib.plataforma
- Qué es: setControlledInput, qaLogout y logout no tienen ningún call site.
- Referencias: form.ts:3 · setter-auth.ts:84 · auth.ts:28
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1051] LA CORRIDA: suites corridas con los helpers nuevos, 118/118 en verde
- Fuente: `docs/bitacora-beta-3.md:8080` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-31 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: La línea base y los arreglos dan 118/118, y dos controles prueban que las aserciones corren de verdad. Se arreglaron las dos aserciones sin filo (/Demo enviada registrada/i sin .catch) y los selectores rotos de corrida-1. El banco pasa de 22 a 26 casos.
- Referencias: 2da5de41 · 728b943e · tests/setter/01-flow.spec.ts:298 · tests/qa-walkthrough/corrida-1.spec.ts:233 · tests/qa-walkthrough/corrida-1.spec.ts:313 · cierra pendiente de docs/bitacora-beta-3.md:7980 +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1052] tests/qa-walkthrough está fuera de todo gate: darle script o borrarla
- Fuente: `docs/bitacora-beta-3.md:8205` · tipo: decision · estado declarado: pendiente de decidir · fecha: 2026-08-31 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Tiene config propia pero ningún script de package.json la invoca, y por eso acumuló líneas rotas de un renombre. La bitácora lo plantea como decisión, no como arreglo.
- Referencias: playwright.qa-walkthrough.config.ts · tests/qa-walkthrough/ · tambien en docs/bitacora-beta-3.md:8167
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1053] EL TRONCO: veinticinco sprints vuelven a una sola línea (sin push a main)
- Fuente: `docs/bitacora-beta-3.md:10869` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-09-06 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Se pushearon trece ramas con commits solo locales (P16–P23, y P25 en p25/carrera-tildes). La punta real es ea94dbf8, sobre una cadena lineal de 49 commits con un solo merge (7e18f9a7). Se verificaron 27 ramas sin pérdidas y el gate quedó en la raíz. El push a main es de Franco.
- Referencias: ea94dbf8 · 7e18f9a7 · d0b37c71 · p25/carrera-tildes · 17727117 · .github/workflows/ci.yml
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1054] El build se envenena solo por una clase Tailwind citada en esta bitácora
- Fuente: `docs/bitacora-beta-3.md:10924` · tipo: pendiente · estado declarado: mitigado; causa raíz sin arreglar · fecha: 2026-09-06
- Nodo(s): lib.plataforma
- Qué es: La bitácora cita una clase con una URL arbitraria entre corchetes. Como Tailwind escanea docs/**/*.md (y .next/ en los worktrees), el segundo build falla con «Cannot find module './&'». Se mitigó borrando los distDir; la causa sigue en el doc.
- Referencias: docs/bitacora-beta-3.md · .gitignore:17 · tambien en docs/bitacora-beta-3.md:7610
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1055] C.0 Guard anti-prod en seeds + passwords a env
- Fuente: `docs/bitacora-beta.md:11` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): lib.plataforma
- Qué es: Guard compartido assertDevSeedTarget (aborta sin DATABASE_URL, con NODE_ENV=production o host no dev; override ALLOW_PROD_SEED=1) y passwords de seed a env vars SEED_*_PASSWORD sin default.
- Referencias: prisma/seed-guard.ts · prisma/seed.ts · prisma/seed-agency-os.ts · .env.example
- Estado en código: **hecho** — seed-guard.ts:42-98; seed.ts:75-80; logic-core-v3/.env.example:38-49 documenta SEED_*_PASSWORD sin default (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1056] sync-plans y sync-premium-modules sin guard anti-prod a propósito
- Fuente: `docs/bitacora-beta.md:41` · tipo: decision · estado declarado: vigente · fecha: 2026-06-17
- Nodo(s): lib.plataforma
- Qué es: Se declaran prod-runnables por diseño y no reciben guard; regla: todo seed mutador futuro reusa assertDevSeedTarget + requireSeedPassword.
- Referencias: sync-plans.ts · sync-premium-modules.ts · prisma/seed-guard.ts · también en docs/bitacora-beta.md:17 · también en docs/bitacora-beta.md:42 · relacionado docs/bitacora-rediseno.md:3380 (sync-premium-modules hace deleteMany sobre PremiumModule y organizationModule)
- Estado en código: **parcial** — La excepción se cumple; la regla no: add-contact-tool.ts y backfill-vertical-pack.ts (mutadores posteriores, pensados para prod) e init-data-connections.ts tampoco usan assertDevSeedTarget (git grep en prisma/seeds = 0). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1057] Limpieza opcional del @@index([assignedToId]) suelto de OsLead
- Fuente: `docs/bitacora-beta.md:414` · tipo: pendiente · estado declarado: pendiente (opcional) · fecha: 2026-06-19 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Quedó como prefijo redundante del índice compuesto nuevo; un DROP INDEX lo limpiaría pero no es aditivo.
- Referencias: prisma/schema.prisma
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1058] Drift DB↔schema: BOT_DELETED adoptado y convertedToOsLeadId dropeada
- Fuente: `docs/bitacora-beta.md:470` · tipo: hecho-declarado · estado declarado: hecho (FG-1.pre declara luego que 20260619140100 quedó --applied sin ejecutar el SQL) · fecha: 2026-06-19
- Nodo(s): lib.plataforma
- Qué es: Decisión de Franco: adoptar BOT_DELETED en AuditActionType y dropear chatbot_lead.convertedToOsLeadId con 2 migraciones idempotentes; los borrados de bot pasan a actionType BOT_DELETED.
- Referencias: prisma/migrations/20260619140000_add_bot_deleted_audit_action/migration.sql · prisma/migrations/20260619140100_drop_chatbot_lead_converted_column/migration.sql · src/app/(protected)/admin/chatbots/bulk-actions.ts · src/app/(protected)/admin/chatbots/[botId]/actions.ts · también en docs/bitacora-beta.md:1271
- Estado en código: **contradicho** — BOT_DELETED sí: 20260619140000_add_bot_deleted_audit_action/migration.sql:8, schema.prisma:192, admin/chatbots/bulk-actions.ts:205 y [botId]/actions.ts:146. La columna se re-agregó: 20260622120000_readd_client_columns_dropped_by_reconcile/migration.sql:21, y se usa en admin/chatbots/_actions/convert-chatbot-lead.actions.ts:39. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1059] Reconciliar main con 3 migraciones aplicadas en el Neon dev compartido
- Fuente: `docs/bitacora-beta.md:955` · tipo: pendiente · estado declarado: pendiente (acción para Franco) · fecha: 2026-06-20
- Nodo(s): lib.plataforma
- Qué es: Faltan en el repo 20260617184913_add_converted_lead_link_and_bot_deleted_audit, 20260619234252_add_organization_city_avatar_notes_softdelete y 20260620173833_add_agency_settings_singleton_unique; si no, migrate dev pedirá reset.
- Referencias: prisma/migrations · también en docs/bitacora-beta.md:958 · relacionado docs/bitacora-beta.md:1258 · relacionado docs/bitacora-beta.md:1746
- Estado en código: **hecho** — 20260617184913_add_converted_lead_link_and_bot_deleted_audit, 20260619234252_add_organization_city_avatar_notes_softdelete y 20260620173833_add_agency_settings_singleton_unique están en main (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1060] FG-1.pre Cierre del drift DB↔schema (9 divergencias dropeadas)
- Fuente: `docs/bitacora-beta.md:1258` · tipo: hecho-declarado · estado declarado: hecho; luego cuestionado (la lane de clientes usa esas columnas) · fecha: 2026-06-21
- Nodo(s): lib.plataforma
- Qué es: Franco aprobó 'DROP todo': AgencySettings.singleton, Organization avatarEmoji/avatarImageUrl/avatarInitials/city/deletedAt/internalNotes y chatbot_lead.convertedToOsLeadId, con migración idempotente vía migrate deploy.
- Referencias: prisma/migrations/20260621120000_reconcile_dev_drift_schema_align · contradicho en docs/bitacora-beta.md:1746
- Estado en código: **contradicho** — 20260621120000_reconcile_dev_drift_schema_align/migration.sql:14-29 las dropeó y 20260622120000_readd_client_columns_dropped_by_reconcile/migration.sql:1-21 las re-agregó; hoy el schema las declara y el código las usa (p. ej. archiveClient.ts:34, convert-chatbot-lead.actions.ts:39). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1061] seed-agency-os falla en projectSeeds sin la org 'develop'
- Fuente: `docs/bitacora-beta.md:1726` · tipo: pendiente · estado declarado: pendiente (fuera de scope) · fecha: 2026-06-25
- Nodo(s): lib.plataforma
- Qué es: Error 'No se encontro organizationId para develop' si la BD no tiene esa org; los qaLeadSeeds se insertan antes de ese punto.
- Referencias: prisma/seed-agency-os.ts · también en docs/bitacora-beta-2.md:129
- Estado en código: **no empezado** — seed-agency-os.ts:2398 (el mapa solo recibe los slugs de organizationSeeds) y :2422-2426 (throw); falla siempre, exista o no la org en la base (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1062] next build se queda sin heap con el default
- Fuente: `docs/bitacora-beta.md:1733` · tipo: pendiente · estado declarado: sin estado (workaround) · fecha: 2026-06-22
- Nodo(s): lib.plataforma
- Qué es: Corre verde con NODE_OPTIONS=--max-old-space-size=6144 (otra entrada usa 8192); pipear el build a tail enmascara el OOM.
- Referencias: también en docs/bitacora-rediseno.md:1556 · también en docs/bitacora-rediseno.md:3699
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1063] Browsers de Playwright no llegan al server local (loopback bloqueado)
- Fuente: `docs/bitacora-beta.md:1742` · tipo: pendiente · estado declarado: bloqueado · fecha: 2026-06-22
- Nodo(s): lib.plataforma
- Qué es: Chromium y Firefox dan ERR_CONNECTION_REFUSED mientras curl y Node llegan; destrabar en AV/firewall o correr en CI.
- Referencias: contradicho por docs/bitacora-beta.md:1643 · contradicho por docs/bitacora-beta-2.md:54
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1064] Drift de columnas de clientes: adoptarlas con migración aditiva
- Fuente: `docs/bitacora-beta.md:1746` · tipo: decision · estado declarado: pendiente (decisión a confirmar por Franco) · fecha: 2026-06-22
- Nodo(s): lib.plataforma
- Qué es: La DB no tiene AgencySettings.singleton, Organization.avatar*/city/deletedAt/internalNotes ni chatbot_lead.convertedToOsLeadId, que schema y código usan (las dropeó la reconciliación de leados); propuesta IF NOT EXISTS solo con migrate deploy.
- Referencias: docs/smoke-report.md §2.5 · prisma/migrations/20260621120000_reconcile_dev_drift_schema_align · contradice docs/bitacora-beta.md:1258
- Estado en código: **hecho** — 20260622120000_readd_client_columns_dropped_by_reconcile/migration.sql:13-21 (ADD IF NOT EXISTS de las 9); schema.prisma:401-419, :823 y :1510 las declaran. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1065] next.config.ts ignora errores de tipos y lint en el build
- Fuente: `docs/bitacora-rediseno.md:162` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-07-30
- Nodo(s): lib.plataforma
- Qué es: typescript.ignoreBuildErrors y eslint.ignoreDuringBuilds en true (build verde no implica tipos verdes); Next 16.2.9 avisa que la clave eslint no está soportada.
- Referencias: next.config.ts · también en docs/bitacora-rediseno.md:501
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1066] Cero merges a main hasta el final del rediseño; redesign/home rama única
- Fuente: `docs/bitacora-rediseno.md:569` · tipo: decision · estado declarado: vigente en su fecha; luego hubo merge vía PR #4 (:3606) · fecha: 2026-07-30
- Nodo(s): lib.plataforma
- Qué es: Decisión de Franco: fix/home-sanidad, fix/fonts-geist-scope y fix/motion-sanidad-mobile absorbidas en redesign/home; producción queda como está.
- Referencias: redesign/home · fix/home-sanidad · fix/fonts-geist-scope · fix/motion-sanidad-mobile · también en docs/bitacora-rediseno.md:4 · también en docs/bitacora-rediseno.md:980
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1067] robots.ts bloquea rutas internas; sitemap solo con las 6 públicas
- Fuente: `docs/bitacora-rediseno.md:755` · tipo: decision · estado declarado: vigente · fecha: 2026-07-30
- Nodo(s): lib.plataforma
- Qué es: Disallow de admin, dashboard, setter, /api/, /embed/ y rutas de sesión y alta; sitemap con home, 4 landings y contact; /styleguide se sacó luego de robots.
- Referencias: src/app/robots.ts · src/app/sitemap.ts · también en docs/bitacora-rediseno.md:758 · también en docs/bitacora-rediseno.md:1221
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1068] Borrar las ramas absorbidas por redesign/home
- Fuente: `docs/bitacora-rediseno.md:994` · tipo: pendiente · estado declarado: pendiente (decisión de Franco) · fecha: 2026-07-30
- Nodo(s): lib.plataforma
- Qué es: Ninguna aporta nada que redesign/home no tenga; borrarlas es decisión de Franco.
- Referencias: fix/home-sanidad · fix/fonts-geist-scope · fix/motion-sanidad-mobile · también en docs/bitacora-rediseno.md:1085
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1069] El subagente visual-qa no puede entregar reporte
- Fuente: `docs/bitacora-rediseno.md:1615` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-07-31
- Nodo(s): lib.plataforma
- Qué es: El puerto del server no está en .claude/launch.json y el subagente pierde acceso a sus herramientas; el pane de preview mide 0 fps de rAF. Se verificó con Playwright.
- Referencias: .claude/launch.json · también en docs/bitacora-rediseno.md:2142
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1070] Instalación de Impeccable v3.5.0 + baseline del detector
- Fuente: `docs/bitacora-rediseno.md:2181` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-31
- Nodo(s): lib.plataforma
- Qué es: Skill y hook (PostToolUse sobre Edit/Write/MultiEdit y Stop) en .claude/ (no versionado) y en .github/ para Copilot; PRODUCT.md, DESIGN.md y .impeccable/design.json; baseline 115 en src/, 46 público, 0 en design-system.
- Referencias: .claude/skills/impeccable/ · .claude/settings.local.json · .github/skills/impeccable/ · .github/hooks/impeccable.json · PRODUCT.md · DESIGN.md +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1071] Impeccable aporta detección, no dirección estética
- Fuente: `docs/bitacora-rediseno.md:2187` · tipo: decision · estado declarado: vigente · fecha: 2026-07-31
- Nodo(s): lib.plataforma
- Qué es: Donde contradiga la dirección gana develOP (Geist + Geist Mono no se reabre; Arial de los mails es falso positivo); el techo del design-system es 0 hallazgos.
- Referencias: también en docs/bitacora-rediseno.md:2210 · también en docs/bitacora-rediseno.md:2222 · también en docs/bitacora-rediseno.md:2223
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1072] Reglas de uso de Impeccable mientras se construye
- Fuente: `docs/bitacora-rediseno.md:2238` · tipo: decision · estado declarado: vigente (hasta cerrar B2) · fecha: 2026-07-31
- Nodo(s): lib.plataforma
- Qué es: Permitidos detect, el hook y /impeccable audit/critique; prohibidos polish, bolder, quieter, distill, animate, Live Mode y corridas masivas hasta terminar y revisar B2.
- Referencias: npx impeccable detect src/app src/components/sections src/components/ia src/components/automation src/components/software
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1073] framer-motion y three-stdlib son dependencias fantasma
- Fuente: `docs/bitacora-rediseno.md:3722` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-08-12
- Nodo(s): lib.plataforma
- Qué es: No están en package.json; resuelven por transitivas de motion y drei (ya era así en julio).
- Referencias: package.json
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1074] B0.6 — Build verde + purga del leak enviroment.env
- Fuente: `docs/bitacora-roadmap.md:6` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-21
- Nodo(s): lib.plataforma
- Qué es: tsc y build verdes; enviroment.env purgado de todo el history con git-filter-repo en un mirror local (no pusheado). La migración de executive-brief.ts al provider factory (Gemini) ya estaba en el working tree.
- Referencias: docs/audits/2026-05-bfg-leak-cleanup.md · src/lib/ai/executive-brief.ts · commit 3953558 reescrito a 7f69ff1 (mirror local)
- Estado en código: **parcial** — git log origin/main --oneline -- '*enviroment.env' → 39535583 y c351b793: la purga hecha en un mirror local no llegó a origin; tsc 0 errores (baseline F0) (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1075] Force-push del history purgado (leak enviroment.env)
- Fuente: `docs/bitacora-roadmap.md:46` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): lib.plataforma
- Qué es: El mirror purgado quedó en C:/tmp/bfg-purge-2026-05-21; falta coordinar con el socio, commitear el working tree y seguir los pasos B a F de la sección 8.3 del runbook; regenerar el mirror si pasan días.
- Referencias: docs/audits/2026-05-bfg-leak-cleanup.md §8.3 · tambien en docs/bitacora-roadmap.md:51 · tambien en docs/bitacora-roadmap.md:56
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1076] Warnings de Sentry en el build (onRequestError, global-error.js)
- Fuente: `docs/bitacora-roadmap.md:52` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): lib.plataforma
- Qué es: Deuda de instrumentación: hook onRequestError faltante y global-error.js recomendado; el sentry.client.config deprecado se migró en B1.2. Siguen reportados en B12.6.
- Referencias: sentry.server.config.ts · sentry.edge.config.ts · tambien en docs/bitacora-roadmap.md:83 · tambien en docs/bitacora-roadmap.md:311 · tambien en docs/bitacora-roadmap.md:7667
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1077] B1.1 — Diagnóstico de performance build/dev (solo medición)
- Fuente: `docs/bitacora-roadmap.md:59` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-21
- Nodo(s): lib.plataforma
- Qué es: Build cold 160s (compile webpack 64%), googleapis 13.5MB en server, lucide ~695KB y shim de Prisma en el bundle cliente, dev con turbopack 2.75x más rápido, latencia Neon ~55ms por query; recomendaciones para B1.2.
- Referencias: package.json · next.config.ts
- Estado en código: **hecho** — Era solo medición; en el código siguen dev y build con --webpack (package.json:7, :9), o sea que la recomendación de turbopack para dev no se adoptó. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1078] Variables críticas faltantes en .env.local (check-env)
- Fuente: `docs/bitacora-roadmap.md:66` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): lib.plataforma
- Qué es: IMPERSONATION_SECRET, DEVELOP_ALERTS_EMAIL y NEXT_PUBLIC_APP_URL faltan; no bloquean el build pero sí impersonation, alertas técnicas y CTAs públicos.
- Referencias: scripts/check-env.js · tambien en docs/bitacora-roadmap.md:222
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1079] Pasar next build a Turbopack cuando sea estable
- Fuente: `docs/bitacora-roadmap.md:202` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): lib.plataforma
- Qué es: B1.2 solo cambió el script dev; el build sigue con --webpack porque next build --turbopack era beta en Next 16.
- Referencias: package.json · tambien en docs/bitacora-roadmap.md:316 · tambien en docs/bitacora-roadmap.md:376
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1080] Mitigar la latencia de Neon en dev
- Fuente: `docs/bitacora-roadmap.md:213` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-21
- Nodo(s): lib.plataforma
- Qué es: Opciones: branch dev en us-east-2, Postgres local o cache server-side (unstable_cache / React cache); amerita sprint propio por el trade-off con prod en sa-east-1.
- Estado en código: **parcial** — 24 archivos usan unstable_cache y 7 importan cache de React (git grep); la región o branch de dev no es verificable por código (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1081] B1.2 — Optimizaciones de build/dev
- Fuente: `docs/bitacora-roadmap.md:256` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): lib.plataforma
- Qué es: Build con NODE_OPTIONS 8GB vía cross-env, lucide con imports nominados (-695KB), googleapis en serverExternalPackages, VaultManager con import type, sentry.client.config migrado a instrumentation-client.ts y script dev a --turbopack (build sigue webpack).
- Referencias: package.json · next.config.ts · src/instrumentation-client.ts · src/components/admin/managers/VaultManager.tsx · src/components/sections/todo-incluido/TodoIncluidoFeatureCard.tsx · src/components/sections/modulos-opcionales/ModuloActiveCard.tsx +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1082] @google-analytics/data a serverExternalPackages
- Fuente: `docs/bitacora-roadmap.md:329` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): lib.plataforma
- Qué es: Otros ~2.1MB del server bundle (chunk 3411) que podrían externalizarse con el mismo patrón que googleapis.
- Referencias: next.config.ts · tambien en docs/bitacora-roadmap.md:375
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1083] Borrar scripts y logs throwaway de mediciones en scripts/
- Fuente: `docs/bitacora-roadmap.md:524` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): lib.plataforma
- Qué es: _b13-* después de B1.4; luego logs _b32/_b33/_b35/_b36/_b52/_b53/_ms1/_ms4 cuando DIRECT_URL elimine los 'terminated'.
- Referencias: scripts/_b13-latency-test.mjs · tambien en docs/bitacora-roadmap.md:686 · tambien en docs/bitacora-roadmap.md:3667
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1084] Correr sync-plans.ts y migrate-subscriptions-to-plan-id.ts en prod
- Fuente: `docs/bitacora-roadmap.md:2082` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): lib.plataforma
- Qué es: Netlify aplica la migración pero no los scripts; sin ellos la tabla plan queda vacía y todas las subs caen al fallback Starter.
- Referencias: prisma/seeds/sync-plans.ts · prisma/seeds/migrate-subscriptions-to-plan-id.ts · tambien en docs/bitacora-roadmap.md:2135 · tambien en docs/bitacora-roadmap.md:2141
- Estado en código: **parcial** — prisma/seeds/sync-plans.ts:149-176 existe; migrate-subscriptions-to-plan-id.ts fue borrado en a6746085 (2026-06-05, git log --diff-filter=D); netlify.toml:2 ya no corre migrate deploy, así que 'Netlify aplica la migración' tampoco es cierto. La ejecución en prod no se puede verificar leyendo. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1085] Inconsistencia de @@map (snake_case) entre modelos del schema
- Fuente: `docs/bitacora-roadmap.md:2126` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-22
- Nodo(s): lib.plataforma
- Qué es: Algunos modelos usan @@map (plan, premium_module, organization_module) y otros no; corregirlo es scope aparte.
- Referencias: prisma/schema.prisma
- Estado en código: **no empezado** — 23 de 63 modelos tienen @@map (git show origin/main:logic-core-v3/prisma/schema.prisma | grep -c '@@map(' → 23; grep -c '^model ' → 63); ej. Organization sin @@map (schema.prisma:332-452) y Plan con @@map('plan') (:631) (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1086] Pre-flight en prod antes del DROP COLUMN de unlockedFeatures
- Fuente: `docs/bitacora-roadmap.md:2565` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): lib.plataforma
- Qué es: Migrar slugs residuales de prod a OrganizationModule antes del merge (el script se borró; recuperarlo del historial) o aceptar perder esos arrays.
- Referencias: prisma/seeds/migrate-unlocked-features.ts (borrado) · tambien en docs/bitacora-roadmap.md:2623 · tambien en docs/bitacora-roadmap.md:2628
- Estado en código: **abandonado** — prisma/seeds/migrate-unlocked-features.ts se agregó en c8478587 y se borró en a3180600 (git log --diff-filter=AD), el mismo commit de la migración 20260522214201; no hay pre-flight en el repo (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1087] Setear DIRECT_URL (Neon sin pooler) en .env.local
- Fuente: `docs/bitacora-roadmap.md:3663` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-23
- Nodo(s): lib.plataforma
- Qué es: El runner ya lo soporta; sin él el pool de Neon dev sigue cortando conexiones en corridas largas de la batería.
- Referencias: scripts/regression/run-baseline.ts · scripts/regression/diag-timings.ts · tambien en docs/bitacora-roadmap.md:3297 · tambien en docs/bitacora-roadmap.md:3336 · tambien en docs/bitacora-roadmap.md:3676
- Estado en código: **parcial** — scripts/regression/run-baseline.ts:25, :40 y diag-timings.ts:16-19 ya lo soportan; el valor en .env.local no se puede verificar leyendo; schema.prisma:5-8 no declara directUrl. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1088] Organization.n8nWorkflowIds (legacy) sin uso
- Fuente: `docs/bitacora-roadmap.md:4452` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-05-24
- Nodo(s): lib.plataforma
- Qué es: Campo String[] existente sin uso en el código; B5.8 creó su propio modelo dedicado.
- Referencias: prisma/schema.prisma
- Estado en código: **no empezado** — schema.prisma:339 sigue declarado; único escritor src/lib/actions/clients.ts:164,199 (módulo sin importadores según D1) y seeds (seed.ts:204,219); sin lectores (git grep -n n8nWorkflowIds origin/main -- logic-core-v3/src) (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1089] tsconfig: scripts/** fuera del typecheck y allowImportingTsExtensions
- Fuente: `docs/bitacora-roadmap.md:4568` · tipo: decision · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): lib.plataforma
- Qué es: Necesario para que los smokes (b58, b59) corran con imports .ts; los scripts quedan fuera de tsc --noEmit.
- Referencias: tsconfig.json · tambien en docs/bitacora-roadmap.md:4721
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1090] Generar CRM_SECRET_KEY en .env.local
- Fuente: `docs/bitacora-roadmap.md:4602` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-24
- Nodo(s): lib.plataforma
- Qué es: Sin la key el header de autenticación del webhook queda deshabilitado en la UI.
- Referencias: .env.example
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1091] MS-6 — Bypass del preloader en automatización (?e2e=1)
- Fuente: `docs/bitacora-roadmap.md:4793` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): lib.plataforma
- Qué es: PreloaderContext salta a 'done' si navigator.webdriver o ?e2e=1 (edición de un archivo listado como frozen 'no romper el flujo de fases'); visual-qa.md exige ?e2e=1 en todas las URLs.
- Referencias: src/context/PreloaderContext.tsx · .claude/agents/visual-qa.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1092] MS-7 — Screenshot contra build de prod (start:qa en :3001)
- Fuente: `docs/bitacora-roadmap.md:5354` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-24
- Nodo(s): lib.plataforma
- Qué es: Script start:qa (next start -p 3001), server next-prod-qa en .claude/launch.json y política de visual-qa: la UI pesada se verifica contra build de prod con screenshot real.
- Referencias: package.json · .claude/launch.json · .claude/agents/visual-qa.md · pendiente originado en docs/bitacora-roadmap.md:4850
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1093] Tras el auto-suspend de Neon dev, reiniciar el server antes de declarar bloqueo
- Fuente: `docs/bitacora-roadmap.md:5940` · tipo: decision · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.plataforma
- Qué es: El pool de Prisma queda con sockets muertos; pingear con prisma migrate status y levantar el server fresco.
- Referencias: tambien en docs/bitacora-roadmap.md:8541
- Estado en código: **hecho** — Es procedimiento; el código lo sigue necesitando: src/lib/prisma.ts:5-6 no reconecta ni reintenta. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1094] Migraciones string a enum en 3 pasos
- Fuente: `docs/bitacora-roadmap.md:6928` · tipo: decision · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.plataforma
- Qué es: (a) crear el enum de forma tolerante, (b) deployar el código nuevo, (c) recién entonces el constraint estricto; SQL a mano porque Prisma lo trata como drop + recreate.
- Referencias: prisma/migrations/20260525190000_b11_4a_create_enum_types/migration.sql · prisma/migrations/20260525190100_b11_4b_promote_columns_to_enum/migration.sql · tambien en docs/bitacora-roadmap.md:6922
- Estado en código: **hecho** — 20260525190000_b11_4a_create_enum_types/migration.sql:15-29 crea los tipos; 20260525190100_b11_4b_promote_columns_to_enum/migration.sql:16-20 normaliza y :23-41 promueve con defaults restaurados. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1095] B11.5 — 3 índices agregados (Conversation, ChatbotEvent, Notification)
- Fuente: `docs/bitacora-roadmap.md:7013` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.plataforma
- Qué es: Índices (botConfigId, lastMessageAt desc), (botConfigId, type, createdAt desc) y (organizationId, createdAt desc); los DROP de índices muertos quedaron diferidos (parcial por diseño).
- Referencias: prisma/schema.prisma · prisma/migrations/20260525192047_b11_5_add_3_missing_indexes/migration.sql · docs/roadmap-pendientes.md · docs/audits/2026-05-auditoria-db.md
- Estado en código: **hecho** — schema.prisma:731 (Notification), :1413 (Conversation), :1617 (ChatbotEvent); migración 20260525192047_b11_5_add_3_missing_indexes (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1096] Drop de índices redundantes diferido a post-B14
- Fuente: `docs/bitacora-roadmap.md:7049` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): lib.plataforma
- Qué es: chatbot_bot_config_slug_idx, EmailContact_organizationId_idx, EmailCampaign_organizationId_idx y otros del audit §3.1; medir con pg_stat_user_indexes en PROD con Matsu viva >=2 semanas tras pg_stat_reset().
- Referencias: docs/roadmap-pendientes.md · docs/audits/2026-05-auditoria-db.md · tambien en docs/bitacora-roadmap.md:7056
- Estado en código: **no empezado** — Siguen en el schema: BotConfig @@index([slug]) (schema.prisma:1343) con slug @unique (:1278); EmailContact @@index([organizationId]) (:1230) cubierto por @@unique([organizationId, email]) (:1229); EmailCampaign @@index([organizationId]) (:1261) cubierto por (:1262). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1097] Drop de índices de OsLead diferido (OsLead_status_idx, OsLead_nextFollowUpAt_idx)
- Fuente: `docs/bitacora-roadmap.md:7051` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25 · **ZONA-FRANCO**
- Nodo(s): lib.plataforma
- Qué es: Subsumidos por el índice compuesto; misma condición de medición en PROD post-B14.
- Referencias: docs/roadmap-pendientes.md · docs/audits/2026-05-auditoria-db.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1098] Sentry diferido a B14
- Fuente: `docs/bitacora-roadmap.md:7347` · tipo: decision · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.plataforma
- Qué es: Lockeado; B12.1 deja TODO(B14) en los error boundaries.
- Referencias: tambien en docs/bitacora-roadmap.md:7427
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1099] Cablear Sentry.captureException en los error boundaries (TODO B14)
- Fuente: `docs/bitacora-roadmap.md:7392` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): lib.plataforma
- Qué es: SectionErrorBoundary y src/app/error.tsx tienen el snippet comentado listo para descomentar.
- Referencias: src/components/ui/SectionErrorBoundary.tsx · src/app/error.tsx · tambien en docs/bitacora-roadmap.md:7427 · tambien en docs/bitacora-roadmap.md:7433
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1100] Rate-limit distribuido (Upstash Redis) — SEC-RATELIMIT-01
- Fuente: `docs/bitacora-roadmap.md:7523` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): lib.plataforma
- Qué es: El limiter es in-memory por proceso; en serverless multi-instancia el límite se multiplica. Abierto en el checklist de B-SEC.3c.
- Referencias: src/lib/security/auth-rate-limit.ts · tambien en docs/bitacora-roadmap.md:7620 · tambien en docs/bitacora-roadmap.md:7709 · tambien en docs/bitacora-roadmap.md:8139 · tambien en docs/bitacora-roadmap.md:8318 · tambien en docs/bitacora-roadmap.md:8405
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1101] Borrar ts_errors.log committeado
- Fuente: `docs/bitacora-roadmap.md:7670` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): lib.plataforma
- Qué es: Artefacto de marzo 2026 que hizo reportar falsos errores de TypeScript a un agente; git rm pendiente.
- Referencias: ts_errors.log · tambien en docs/bitacora-roadmap.md:7707
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1102] Push del tag v0.9.0-rc.1 al remote
- Fuente: `docs/bitacora-roadmap.md:7740` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): lib.plataforma
- Qué es: Quedó local; Franco decide cuándo es visible en GitHub.
- Referencias: tag v0.9.0-rc.1 · tambien en docs/bitacora-roadmap.md:7745
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1103] B-SEC.2 — Next 16.2.1 a 16.2.6 + npm audit fix
- Fuente: `docs/bitacora-roadmap.md:7771` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.plataforma
- Qué es: Cierra 13 de 15 advisories (bypass de middleware/proxy, SSRF en WebSocket, DoS, cache poisoning, protobufjs RCE). La entrada está partida por B1/B2 LeadOS y continúa en la línea 7906.
- Referencias: package.json · package-lock.json · docs/auditoria-seguridad-2026-05.md · pendiente originado en docs/bitacora-roadmap.md:223
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1104] 2 advisories moderate restantes (postcss <8.5.10 vía next)
- Fuente: `docs/bitacora-roadmap.md:7906` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: El único fix de npm era un downgrade de next a 9.3.3; esperar Next 16.2.7+ o 16.3.x y re-correr npm audit.
- Referencias: package.json · tambien en docs/bitacora-roadmap.md:7964
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1105] SEC-MISC-01: headers de seguridad globales
- Fuente: `docs/bitacora-roadmap.md:8141` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: HSTS, X-Frame-Options, Permissions-Policy, Referrer-Policy y CSP-Report-Only.
- Referencias: docs/auditoria-seguridad-2026-05.md · tambien en docs/bitacora-roadmap.md:8320
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1106] Housekeeping de archivos sueltos del repo
- Fuente: `docs/bitacora-roadmap.md:8876` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): lib.plataforma
- Qué es: script*.js, find_unused.js, *.bak y archivos de iteraciones viejas en raíz; sprint propio.
- Referencias: también en fuente:8924
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1107] BP.1 googleapis reemplazado por paquetes granulares
- Fuente: `docs/bitacora-roadmap.md:8939` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): lib.plataforma
- Qué es: google-auth-library + @googleapis/webmasters; −190 MB en node_modules.
- Referencias: src/lib/integrations/google-business-profile.ts · src/lib/searchconsole.ts · src/lib/actions/settings.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1108] BP.2 Prisma fuera del bundle del browser
- Fuente: `docs/bitacora-roadmap.md:9017` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): lib.plataforma
- Qué es: Enums client-safe en prisma-enums.ts; @prisma/client en serverExternalPackages.
- Referencias: src/lib/prisma-enums.ts · src/lib/actions/schemas.ts
- Estado en código: **hecho** — src/lib/prisma-enums.ts:14-42; next.config.ts:25-27 serverExternalPackages incluye @prisma/client; ningún archivo 'use client' importa valores de @prisma/client (solo import type). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1109] Eliminar stubs de Prisma del bundle cliente
- Fuente: `docs/bitacora-roadmap.md:9127` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): lib.plataforma
- Qué es: Requiere verbatimModuleSyntax o alias webpack; sprint dedicado.
- Estado en código: **no empezado** — git grep verbatimModuleSyntax en tsconfig.json y next.config.ts → vacío; next.config.ts:25-27 solo serverExternalPackages; 58 imports de valor desde @prisma/client en src (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1110] Codegen de prisma-enums.ts desde schema.prisma
- Fuente: `docs/bitacora-roadmap.md:9128` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-26
- Nodo(s): lib.plataforma
- Qué es: Hoy la copia de enums se sincroniza a mano; considerar generador automático.
- Referencias: src/lib/prisma-enums.ts · también en fuente:9129
- Estado en código: **no empezado** — src/lib/prisma-enums.ts:10-12 declara sincronización manual; git grep "prisma-enums" en tests y scripts da 0 (control: importado en PlanAssignmentForm.tsx:4 y NewTicketModal.tsx:8). Hoy los 4 enums coinciden con schema.prisma:76-94 y :234-238. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1111] BP.3 Lucide ya tree-shakeable
- Fuente: `docs/bitacora-roadmap.md:9135` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): lib.plataforma
- Qué es: Verificado sin cambios de código.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1112] Regla ESLint contra imports barrel de lucide-react
- Fuente: `docs/bitacora-roadmap.md:9213` · tipo: idea · estado declarado: sin estado · fecha: 2026-05-26
- Nodo(s): lib.plataforma
- Qué es: no-restricted-imports para impedir import * de lucide-react.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1113] BP.4 sin flag de heap + prisma.config.ts
- Fuente: `docs/bitacora-roadmap.md:9220` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): lib.plataforma
- Qué es: Se quitó NODE_OPTIONS 8 GB del build y la config Prisma pasó a prisma.config.ts.
- Referencias: prisma.config.ts · package.json
- Estado en código: **hecho** — prisma.config.ts:26-34; package.json sin bloque 'prisma': { ni NODE_OPTIONS (git grep vacío; control package.json:157 dependencia prisma) (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1114] Upgrade a Prisma 7
- Fuente: `docs/bitacora-roadmap.md:9321` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): lib.plataforma
- Qué es: Prisma 7.8.0 disponible; major upgrade en sprint dedicado.
- Referencias: también en fuente:9290
- Estado en código: **no empezado** — package.json:133 "@prisma/client": "^6.19.2" y :157 "prisma": "^6.19.2". (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1115] Quitar cross-env si ya no se usa
- Fuente: `docs/bitacora-roadmap.md:9322` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): lib.plataforma
- Qué es: cross-env quedó en devDependencies sin uso en build.
- Referencias: package.json
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1116] B14.3 backups automatizados con restore-test
- Fuente: `docs/bitacora-roadmap.md:9446` · tipo: hecho-declarado · estado declarado: hecho (primer run pendiente de Franco)
- Nodo(s): lib.plataforma
- Qué es: GH Action diaria pg_dump cifrado GPG + job de restore-test; scripts locales de backup/restore.
- Referencias: .github/workflows/db-backup.yml · scripts/db-backup-local.sh · scripts/db-restore-local.sh · docs/operations/neon-backups.md
- Estado en código: **hecho** — .github/workflows/db-backup.yml:36-41 y job restore-test; scripts/db-backup-local.sh, scripts/db-restore-local.sh y docs/operations/neon-backups.md presentes. La primera corrida no es verificable leyendo. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1117] Backups cifrados por ser repo público
- Fuente: `docs/bitacora-roadmap.md:9452` · tipo: decision · estado declarado: hecho
- Nodo(s): lib.plataforma
- Qué es: Artifacts de GH en repo público → cifrado AES256 con passphrase en secret; condiciona el diseño del backup.
- Referencias: frc11/PorfolioDevelOP
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1118] Setear secrets del backup y validar primer run
- Fuente: `docs/bitacora-roadmap.md:9535` · tipo: pendiente · estado declarado: bloqueado (Franco)
- Nodo(s): lib.plataforma
- Qué es: BACKUP_GPG_PASSPHRASE y DIRECT_DATABASE_URL_PROD en GH; disparar workflow manual y confirmar ambos jobs.
- Referencias: también en fuente:9540
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1119] e2e.yml mal ubicado, nunca corrió
- Fuente: `docs/bitacora-roadmap.md:9541` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: logic-core-v3/.github/workflows/e2e.yml no lo lee GitHub; moverlo a la raíz con working-directory.
- Referencias: logic-core-v3/.github/workflows/e2e.yml · también en fuente:9715 · también en fuente:17075
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1120] Retención de backups >30 días y RPO menor
- Fuente: `docs/bitacora-roadmap.md:9542` · tipo: idea · estado declarado: sin estado
- Nodo(s): lib.plataforma
- Qué es: Mover artifacts a S3/R2 si se requiere; bajar RPO de 24h a 6h/1h cuando crezca el volumen.
- Referencias: también en fuente:9543
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1121] B14.5 Sentry cableado con scrubbing de PII
- Fuente: `docs/bitacora-roadmap.md:9547` · tipo: hecho-declarado · estado declarado: hecho (DSN pendiente)
- Nodo(s): lib.plataforma
- Qué es: scrub-pii en todos los inits, global-error.tsx, onRequestError y captura de errores del bot.
- Referencias: src/lib/sentry/scrub-pii.ts · src/app/global-error.tsx · src/instrumentation.ts · scripts/_b14-5-scrub-smoke.mjs
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1122] Activar Sentry en prod (DSN + source maps)
- Fuente: `docs/bitacora-roadmap.md:9630` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: Crear proyecto y setear NEXT_PUBLIC_SENTRY_DSN (y token para source maps) en Netlify; al 2026-08 seguía inactivo.
- Referencias: también en fuente:9637 · también en fuente:13073 · también en fuente:16738
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1123] Consolidar inits de Sentry duplicados
- Fuente: `docs/bitacora-roadmap.md:9636` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: instrumentation.ts vs sentry.server/edge.config.ts legacy; además IPv6 y breadcrumbs de consola sin cubrir.
- Referencias: sentry.server.config.ts · sentry.edge.config.ts · también en fuente:9717 · también en fuente:16873
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1124] B14.4 checklist de deploy y smoke de prod
- Fuente: `docs/bitacora-roadmap.md:9641` · tipo: hecho-declarado · estado declarado: hecho (ejecución pendiente de Franco)
- Nodo(s): lib.plataforma
- Qué es: Prod no tenía el código de B14; se entregó checklist de 7 fases y smoke script en lugar del smoke real.
- Referencias: docs/operations/b14-deploy-checklist.md · scripts/_b14-4-smoke-prod.mjs
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1125] Tag recomendado v1.0.0-rc.1
- Fuente: `docs/bitacora-roadmap.md:9694` · tipo: decision · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: rc hasta uso real de Matsu; v1.0.0 cuando el cliente use el producto sin romperse. package.json seguía en 0.1.0.
- Referencias: también en fuente:9650 · también en fuente:9728
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1126] Cache CDN agresiva en / (Age 71 días)
- Fuente: `docs/bitacora-roadmap.md:9721` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: Netlify servía cache vieja sin invalidar al deploy; investigar en sprint propio.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1127] Activar módulos premium en el seed de QA
- Fuente: `docs/bitacora-roadmap.md:10353` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: client-a sin organizationModule ACTIVE impide verificar visualmente motor-reseñas/agenda/tienda/email.
- Referencias: prisma/seed.ts
- Estado en código: **no empezado** — git grep -n -i organizationModule origin/main -- logic-core-v3/prisma/seed.ts logic-core-v3/prisma/seed-agency-os.ts → vacío; control: prisma/seeds/sync-premium-modules.ts:73 (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1128] Baseline tsc rojo por @googleapis/webmasters
- Fuente: `docs/bitacora-roadmap.md:10451` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-06-02
- Nodo(s): lib.plataforma
- Qué es: searchconsole.ts TS2307 citado como baseline en muchos sprints; dejó de aparecer en COST-2b/CRON-2.
- Referencias: src/lib/searchconsole.ts · también en fuente:10485 · también en fuente:13821
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1129] C.0 seeds blindados contra prod
- Fuente: `docs/bitacora-roadmap.md:10530` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): lib.plataforma
- Qué es: assertDevSeedTarget aborta contra prod; passwords de seed pasan a env vars sin default.
- Referencias: prisma/seed-guard.ts · prisma/seed.ts · prisma/seed-agency-os.ts
- Estado en código: **hecho** — seed.ts:73-80; seed-agency-os.ts:351, :2386-2389; seed-guard.ts:42-98 (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1130] sync-plans/sync-premium-modules sin guard anti-prod
- Fuente: `docs/bitacora-roadmap.md:10560` · tipo: decision · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): lib.plataforma
- Qué es: Son prod-runnables por diseño; seeds mutadores nuevos deben reusar seed-guard.
- Referencias: prisma/seeds/sync-plans.ts · también en fuente:10561
- Estado en código: **hecho** — Ninguno importa seed-guard: git grep "seed-guard|assertDevSeedTarget" en prisma/seeds da 0 (control: prisma/seed-agency-os.ts:26, :2386). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1131] Update manual de OrganizationModule mini-crm
- Fuente: `docs/bitacora-roadmap.md:11037` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-29
- Nodo(s): lib.plataforma
- Qué es: Filas con slug mini-crm en DB dev/prod requieren SQL manual antes del deploy.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1132] Build local OOM con heap default
- Fuente: `docs/bitacora-roadmap.md:11110` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-06-30
- Nodo(s): lib.plataforma
- Qué es: Varias entradas necesitan 6-8 GB de heap para el build, contradiciendo BP.4.
- Referencias: también en fuente:11762 · también en fuente:12746 · también en fuente:16845
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1133] Aplicar migración ExecutiveReportFrequency
- Fuente: `docs/bitacora-roadmap.md:11989` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: Revisar y aplicar en la Neon compartida, regenerar Prisma y correr invariantes y tests.
- Referencias: prisma/schema.prisma · también en fuente:11946 · también en fuente:11986
- Estado en código: **hecho** — prisma/migrations/20260702223350_add_executive_report_config/migration.sql:2-6; schema.prisma:396-397 y :493-497 (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1134] D6 infra de tests de integración
- Fuente: `docs/bitacora-roadmap.md:12353` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.plataforma
- Qué es: playwright.integration.config.ts + script test:integration.
- Referencias: playwright.integration.config.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1135] D7 test del PDF P2.C movido a Node puro
- Fuente: `docs/bitacora-roadmap.md:12405` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.plataforma
- Qué es: El crash era el runner de Playwright; nuevo invariante tsx contra Neon.
- Referencias: src/lib/reports/client-monthly/get-client-monthly-report-data.invariant.ts
- Estado en código: **hecho** — src/lib/reports/client-monthly/get-client-monthly-report-data.invariant.ts existe con su script check:invariant:client-monthly-report-pdf; corre contra Neon (no hay base de test). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1136] Aggregate check:invariants incompleto
- Fuente: `docs/bitacora-roadmap.md:12450` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: No incluye varios invariantes (client-monthly-report, dates-ar, lead-status, etc.).
- Referencias: package.json · también en fuente:12305
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1137] Seed QA sin utmCampaign
- Fuente: `docs/bitacora-roadmap.md:12836` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-04
- Nodo(s): lib.plataforma
- Qué es: qa-seed-leads.ts solo puebla utmSource; el caso con campaña no es visible.
- Referencias: scripts/dev/qa-seed-leads.ts
- Estado en código: **no empezado** — scripts/dev/qa-seed-leads.ts:186 solo setea utmSource; git grep utmCampaign en ese archivo = 0. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1138] INFRA.3 causa raíz de conexión a Neon
- Fuente: `docs/bitacora-roadmap.md:13093` · tipo: pendiente · estado declarado: pendiente (gated) · fecha: 2026-07-06
- Nodo(s): lib.plataforma
- Qué es: lib/prisma.ts, pooler, DIRECT_URL y retry de conexión; gated en firma real de prod + Sentry DSN.
- Referencias: src/lib/prisma.ts · también en fuente:13148 · también en fuente:14049
- Estado en código: **no empezado** — src/lib/prisma.ts:5-6 cliente sin timeouts ni reintento; prisma/schema.prisma:5-8 sin directUrl; git grep connect_timeout/pool_timeout en src solo encuentra comentarios (withDeadline.ts:7, logger.ts:118). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1139] Drift de migraciones entre ramas
- Fuente: `docs/bitacora-roadmap.md:13504` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-10
- Nodo(s): lib.plataforma
- Qué es: add_portal_indexes local sin aplicar y 3 migraciones b1s* del motor en la DB dev ausentes en la rama.
- Referencias: 20260710203413_add_portal_indexes · también en fuente:13611
- Estado en código: **hecho** — 20260710203413_add_portal_indexes y 20260709163143/20260709180000/20260709200000 (b1s1-3) están en main; drift schema↔migraciones = 0 (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1140] T0.2 cron de cleanupOldEvents
- Fuente: `docs/bitacora-roadmap.md:13516` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-11
- Nodo(s): lib.plataforma
- Qué es: Ruta /api/cron/cleanup-old-events con retención de 30 días.
- Referencias: src/app/api/cron/cleanup-old-events/route.ts · netlify.toml
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1141] vercel.json y netlify.toml con crons distintos
- Fuente: `docs/bitacora-roadmap.md:13529` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-11
- Nodo(s): lib.plataforma
- Qué es: vercel.json registra os-follow-up, regenerate-briefs y send-executive-reports; desincronizado.
- Referencias: vercel.json · netlify.toml · también en fuente:13595 · también en fuente:16887
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1142] CRON-2 scheduled function real de cleanup
- Fuente: `docs/bitacora-roadmap.md:13839` · tipo: hecho-declarado · estado declarado: hecho (no verificado en prod) · fecha: 2026-07-11
- Nodo(s): lib.plataforma
- Qué es: netlify/functions/cleanup-old-events-cron.ts llama a la ruta Next.
- Referencias: netlify/functions/cleanup-old-events-cron.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1143] Crons sin scheduler real en Netlify
- Fuente: `docs/bitacora-roadmap.md:13906` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-11
- Nodo(s): lib.plataforma
- Qué es: regenerate-briefs, send-executive-reports, detect-bot-issues, alerts y os-follow-up (este último de LeadOS) quedan sin function agendada.
- Referencias: también en fuente:13910
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1144] Riesgo de envenenamiento del pool de Prisma
- Fuente: `docs/bitacora-roadmap.md:14302` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: withDeadline abandona sin cancelar; vigilar P2024; cancelación real exige statement_timeout en Neon (decisión con Franco).
- Referencias: también en fuente:14366
- Estado en código: **parcial** — withDeadline.ts:14-26 documenta que abandona sin cancelar y persistTurn no reintenta ante deadline (persistTurn.ts:480-482); statement_timeout y lock_timeout no están configurados (git grep statement_timeout vacío; control withDeadline.ts:7 pool_timeout) (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1145] Agregar confirm_contact_request a Plan.tools en prod
- Fuente: `docs/bitacora-roadmap.md:15436` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: Correr prisma/seeds/add-contact-tool.ts contra prod; no correr sync-plans.ts completo (pisa 13 columnas).
- Referencias: prisma/seeds/add-contact-tool.ts · también en fuente:15416
- Estado en código: **parcial** — prisma/seeds/add-contact-tool.ts:47-68 listo; el catálogo ya lo trae (sync-plans.ts:57, :63) y el fallback también (src/lib/plan/fallback.ts:57). Que haya corrido en prod no es verificable por lectura. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1146] BREVO_API_KEY y Telegram sin configurar en prod
- Fuente: `docs/bitacora-roadmap.md:15600` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: Las notificaciones de lead no se envían.
- Referencias: también en fuente:15787 · también en fuente:16507 · también en fuente:17143
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1147] Rotar la key de Vertex expuesta en logs
- Fuente: `docs/bitacora-roadmap.md:15604` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: Credencial de Vertex expuesta en logs (el doc no trae el valor), pendiente de rotación.
- Referencias: también en fuente:15785 · también en fuente:16508 · también en fuente:16678
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1148] D.3 cron real de generate-insights
- Fuente: `docs/bitacora-roadmap.md:15685` · tipo: hecho-declarado · estado declarado: hecho (verificación en prod pendiente)
- Nodo(s): lib.plataforma
- Qué es: Function de Netlify POST con timeout 20s; cierra el bloque DESPERTAR.
- Referencias: netlify/functions/generate-insights-cron.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1149] H.1 cron real de send-weekly-reports
- Fuente: `docs/bitacora-roadmap.md:15800` · tipo: hecho-declarado · estado declarado: hecho (verificación en prod pendiente)
- Nodo(s): lib.plataforma
- Qué es: Function de Netlify gemela de D.3.
- Referencias: netlify/functions/send-weekly-reports-cron.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1150] H.2 auth de crons que falla cerrado
- Fuente: `docs/bitacora-roadmap.md:15846` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.plataforma
- Qué es: Helper compartido cron-secret.ts aplicado a generate-insights, send-weekly-reports y detect-bot-issues; se quitó el any.
- Referencias: src/lib/cron/cron-secret.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1151] Consolidar auth inline de 4 crons al helper
- Fuente: `docs/bitacora-roadmap.md:15933` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: os-follow-up (LeadOS), regenerate-briefs, send-executive-reports y alerts siguen con chequeo propio; limpieza, no vulnerabilidad.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1152] H.4 misceláneos
- Fuente: `docs/bitacora-roadmap.md:15940` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.plataforma
- Qué es: Se quitó la key eslint de next.config.ts e indentación de persistTurn; .netlify ya estaba ignorado.
- Referencias: next.config.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1153] typescript.ignoreBuildErrors activo en next.config.ts
- Fuente: `docs/bitacora-roadmap.md:15974` · tipo: pendiente · estado declarado: sin estado
- Nodo(s): lib.plataforma
- Qué es: El build ignora errores de tipos; NextConfig no tipa el objeto y tiparlo podría destapar mismatches.
- Referencias: next.config.ts · también en fuente:15981
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1154] Pinear versión exacta del paquete ai
- Fuente: `docs/bitacora-roadmap.md:16499` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.plataforma
- Qué es: El ^ subió de 6.0.177 a 6.0.214 sin decisión humana.
- Referencias: package.json · también en fuente:16680
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1155] Env vars faltantes en el worktree de dev
- Fuente: `docs/bitacora-roadmap.md:16884` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-11
- Nodo(s): lib.plataforma
- Qué es: IMPERSONATION_SECRET y DEVELOP_ALERTS_EMAIL faltan; check-env sale 1 en dev.
- Referencias: también en fuente:16900
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1156] Verificar la retención de logs de Netlify
- Fuente: `docs/bitacora-roadmap.md:16895` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-11
- Nodo(s): lib.plataforma
- Qué es: La PII ya derramada expira según la retención del plan.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1157] Drop de 6 índices con 0 scans
- Fuente: `docs/roadmap-pendientes.md:97` · tipo: pendiente · estado declarado: diferido · fecha: 2026-05-25
- Nodo(s): lib.plataforma
- Qué es: Recién post-B14 con PROD de Matsu viva 2 semanas y pg_stat_reset previo.
- Referencias: docs/audits/2026-05-auditoria-db.md §3.1 · B11.5
- Estado en código: **no empezado** — Mismos índices que PLAN-1096 siguen declarados (schema.prisma:1230, :1261, :1343); además OsLead @@index([status]) y @@index([assignedToId]) (:896, :899) cubiertos por compuestos (:898, :900). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1158] T0.2 cron cleanupOldEvents
- Fuente: `docs/roadmap-pendientes.md:151` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-10
- Nodo(s): lib.plataforma
- Qué es: Sin hacer; chatbotEvent crece y COST-1 le suma un evento.
- Referencias: T0.2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1159] Verificación visual automática bloqueada
- Fuente: `docs/roadmap-pendientes.md:165` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-10
- Nodo(s): lib.plataforma
- Qué es: visual-qa sin MCP de preview (o /api/qa/login bloqueado, o dev server ajeno); la verificación visual cae en Valentino. Antes de C0.2.
- Referencias: raiz:lane-plan-log.md:64 · raiz:lane-resultados-redesign-log.md:214 · docs/sprints/p4-1-render-utm.md:98 · docs/sprints/infra-2-cold-start-retry.md:121
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1160] Alpha.0.6 legacy y env vars
- Fuente: `docs/sprints/alpha-0-6-cleanup-extended.md:5` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.plataforma
- Qué es: Borrado SidebarNav duplicado; .env.example, docs/env-vars.md y scripts/check-env.js; 3 console.log menos; framer-motion se mantiene en el sitio público.
- Referencias: tambien en :18
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1161] Baseline y observabilidad
- Fuente: `docs/sprints/alpha-0-7-baseline-observability.md:5` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-17
- Nodo(s): lib.plataforma
- Qué es: P95 12987 ms y DB 1082 ms; configs de Sentry; documentación de backups Neon y DR.
- Referencias: docs/baselines/2026-05-chatbot-runtime.md · docs/operations/neon-backups.md
- Estado en código: **hecho** — docs/baselines/2026-05-chatbot-runtime.md y docs/operations/neon-backups.md existen; sentry.server.config.ts y src/instrumentation-client.ts (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1162] DSN de Sentry sin configurar
- Fuente: `docs/sprints/alpha-0-7-baseline-observability.md:16` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-17
- Nodo(s): lib.plataforma
- Qué es: Sin DSN el canal Sentry es no-op; setearlo en Netlify.
- Referencias: docs/sprints/alpha-pre-cierre-RESUMEN.md:62 · docs/sprints/infra-1-observabilidad.md:69
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1163] STATUS.md y smoke final
- Fuente: `docs/sprints/alpha-0-9-status-verificacion.md:5` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-17
- Nodo(s): lib.plataforma
- Qué es: STATUS.md creado; smoke de 14 endpoints sin 500.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1164] Env vars críticas faltantes en .env local
- Fuente: `docs/sprints/alpha-pre-cierre-RESUMEN.md:61` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-17
- Nodo(s): lib.plataforma
- Qué es: AUTH_SECRET, NEXTAUTH_URL, GOOGLE_APPLICATION_CREDENTIALS, CHATBOT_GCP_PROJECT_ID, BREVO_API_KEY, DEVELOP_ALERTS_EMAIL (solo nombres).
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1165] Backups de Neon sin verificar
- Fuente: `docs/sprints/alpha-pre-cierre-RESUMEN.md:63` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-17
- Nodo(s): lib.plataforma
- Qué es: Requiere acceso a la consola de Neon.
- Estado en código: **parcial** — .github/workflows/db-backup.yml:36-41 (backup diario cifrado y job restore-test) existe; los backups/PITR de la consola de Neon no son verificables leyendo. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1166] Avisar al socio de la migración en Neon compartida
- Fuente: `docs/sprints/utm-1-captura.md:228` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-04
- Nodo(s): lib.plataforma
- Qué es: SQL aditivo aplicado sobre la branch dev compartida.
- Referencias: tambien en :252
- Estado en código: **parcial** — La migración 20260704224423_utm1_add_conversation_utm_fields está en main y el schema la declara (schema.prisma:1384-1386); el aviso no es verificable por código (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1167] Build rojo por baseline ajeno
- Fuente: `raiz:lane-plan-log.md:33` · tipo: pendiente · estado declarado: abierto · fecha: 2026-06-25
- Nodo(s): lib.plataforma
- Qué es: npm run build falla (@googleapis/webmasters faltante, set-state-in-effect en PreloaderContext) y hace OOM; tsc baseline searchconsole.ts:119.
- Referencias: raiz:lane-resultados-redesign-log.md:191 · docs/sprints/p3-a-1-gbp-connection.md:23 · docs/sprints/infra-1-observabilidad.md:50 · docs/sprints/utm-1-captura.md:223
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1168] Borrar org seed san-miguel
- Fuente: `STATUS.md:151` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): lib.plataforma
- Qué es: Seed mock marcada para limpieza con 3 projects, 4 services y 1 user.
- Referencias: tambien en :183, :239, :259
- Estado en código: **no empezado** — seed.ts:198-228 y seed-agency-os.ts:397-416 la siguen creando (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1169] Cleanup B0.3 en prod
- Fuente: `STATUS.md:168` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): lib.plataforma
- Qué es: Replicar en la branch main de Neon; luego borrar scripts throwaway _db-cleanup-*.mjs.
- Referencias: docs/audits/2026-05-cleanup-db-dev.md §6 · tambien en :238, :284
- Estado en código: **no empezado** — docs/audits/2026-05-cleanup-db-dev.md:6 'Pendiente replicar en prod'; scripts/_db-cleanup-execute.mjs:10-15 (IDs hardcodeados) sigue versionado junto a _db-cleanup-inspect*.mjs. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1170] Aislamiento dev/prod con Neon branching
- Fuente: `STATUS.md:223` · tipo: decision · estado declarado: decidido · fecha: 2026-05-21
- Nodo(s): lib.plataforma
- Qué es: .env apunta a la branch dev; prod a main desde Netlify.
- Referencias: B0.1
- Estado en código: **hecho** — logic-core-v3/.env.example:21-24 (local → branch dev, prod → branch main); seed-guard.ts:18-30 reconoce la branch dev (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1171] Plan de Neon y política de retención
- Fuente: `STATUS.md:233` · tipo: decision · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): lib.plataforma
- Qué es: Free vs Launch según backups; retención de conversaciones/leads sin definir.
- Referencias: tambien en :236 · docs/sprints/alpha-RESUMEN-FINAL.md:77
- Estado en código: **no empezado** — La única purga es chatbot_events a 30 días (src/modules/chatbot/server/logging/persistentLogger.ts:153-163); no hay retención para conversaciones, mensajes ni leads, y rate_limit no se purga (git grep rateLimit.deleteMany = 0). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

### lib.sitio-publico

#### [PLAN-1172] Home: EarlyScrollLock y useHydratedReducedMotion
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:136` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-12
- Nodo(s): lib.sitio-publico
- Qué es: El scroll-lock se movió a un componente con useServerInsertedHTML. Un hook con useSyncExternalStore corrige el hydration mismatch de WhyDevelOP.
- Referencias: EarlyScrollLock.tsx · layout.tsx · WhyDevelOP.tsx · useHydratedReducedMotion
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1173] Route B del preloader y Paint sprint
- Fuente: `_insumos/drive/Olme/Ideas de nuevas features.md:44` · tipo: idea · estado declarado: pendiente · fecha: 2026-06-20
- Nodo(s): lib.sitio-publico
- Qué es: Intro de marca en las páginas de marketing, más clipping en runtime de los materiales del logo con THREE.Plane, sin tocar HeroArtifact (frozen). Path A confirmado.
- Referencias: src/components/3d/HeroArtifact.tsx · THREE.Plane · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:72 · tambien en Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:93 · tambien en Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:191
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1174] Microsprint a11y: vuelve el cursor del sistema
- Fuente: `docs/bitacora-beta-3.md:2671` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-08-04
- Nodo(s): lib.sitio-publico
- Qué es: Se quitó cursor:none residual de CustomCursor en 13 archivos del sitio público y del widget; PortfolioWebCases conserva su excepción.
- Referencias: Portfolio.tsx · ChatWindow.tsx · LogicCompanion.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1175] Errores de consola pre-existentes en landings
- Fuente: `docs/bitacora-beta-3.md:2766` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-04
- Nodo(s): lib.sitio-publico
- Qué es: 404 en /process-automation y /software-development; CSP report-only del iframe template-zero en /web-development.
- Referencias: también en fuente:3632
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1176] Residuos públicos del cursor y código muerto
- Fuente: `docs/bitacora-beta-3.md:2772` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-04
- Nodo(s): lib.sitio-publico
- Qué es: data-cursor muerto en ~10 elementos; 5 componentes sin importadores (borrar o montar, decide Franco); span «Conversemos →» sin teclado.
- Referencias: PortfolioWebCases.tsx:361 · ProcesoSoftware.tsx · ShowcaseSoftware.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1177] D11 framer-motion del home: sin nada que sacar
- Fuente: `docs/bitacora-beta-3.md:3685` · tipo: hecho-declarado · estado declarado: hecho (sin cambios de código) · fecha: 2026-08-10
- Nodo(s): lib.sitio-publico
- Qué es: Medición: el chunk de motion (42,5 kB gz) lo carga el root layout; cerrado en Fase 1 sin tocar src.
- Referencias: PreloaderContext.tsx · Navbar.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1178] Aligerar el inicial del sitio público
- Fuente: `docs/bitacora-beta-3.md:3767` · tipo: idea · estado declarado: sin estado · fecha: 2026-08-10
- Nodo(s): lib.sitio-publico
- Qué es: MarketingIntro se bundlea en / sin renderizarse (Preloader.tsx:6); Footer legacy de 916 líneas; sacar framer-motion exige tocar PreloaderContext congelado.
- Referencias: Preloader.tsx:6 · Footer.tsx · PreloaderContext.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1179] Home: pasada visual y contenido real de placeholders
- Fuente: `docs/bitacora-beta-3.md:3783` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-10
- Nodo(s): lib.sitio-publico
- Qué es: Lo que queda del home tras agotar performance.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1180] Carriles paralelos fuera del tronco: reconciliar el rediseño del home
- Fuente: `docs/bitacora-beta-3.md:10910` · tipo: pendiente · estado declarado: anotado · fecha: 2026-09-06
- Nodo(s): lib.sitio-publico
- Qué es: Los audits de junio y julio, el carril del Motor (b0, b1, b2) y el rediseño del home (rediseno/*, v3/*) nunca estuvieron en main. Cuando suba el carril del home va a tener que reconciliar contra una main que avanzó.
- Referencias: rediseno/* · v3/* · b0 · b1 · b2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1181] Neutralizar el scroll suave de Lenis bajo prefers-reduced-motion
- Fuente: `docs/bitacora-rediseno.md:137` · tipo: pendiente · estado declarado: pendiente (bloque posterior) · fecha: 2026-07-30
- Nodo(s): lib.sitio-publico
- Qué es: SmoothScroll.tsx es JS y no se alcanza desde CSS; su rAF perpetuo también quedó fichado como pendiente.
- Referencias: src/components/layout/SmoothScroll.tsx · también en docs/bitacora-rediseno.md:2795
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1182] Gate 1 del rediseño: puntos sin cierre explícito
- Fuente: `docs/bitacora-rediseno.md:509` · tipo: pendiente · estado declarado: parcial · fecha: 2026-07-30
- Nodo(s): lib.sitio-publico
- Qué es: Cerrados: acentos A (:2508), Geist (:2223), bug de Geist (:655), sombra por tema (:2341), capítulos (:2348). Sin cierre: flecha del CTA icono vs carácter, contrastes de S5 y bios, revisión visual de Franco.
- Referencias: /styleguide · también en docs/bitacora-rediseno.md:1058 · también en docs/bitacora-rediseno.md:1069
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1183] Copy de venta con tono de borrador en web-development
- Fuente: `docs/bitacora-rediseno.md:823` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-07-30
- Nodo(s): lib.sitio-publico
- Qué es: metricPills de WebDevelopmentBento.tsx:70 y headlines de WebDevelopmentByRubro.tsx; fuera de un sprint de sanidad.
- Referencias: WebDevelopmentBento.tsx:70 · WebDevelopmentByRubro.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1184] Bugs de scroll-lock invisibles para la automatización
- Fuente: `docs/bitacora-rediseno.md:951` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-07-30
- Nodo(s): lib.sitio-publico
- Qué es: EarlyScrollLock y PreloaderContext:125 se saltean bajo navigator.webdriver; el discriminador es manual (abrir /contact en un navegador normal).
- Referencias: src/context/PreloaderContext.tsx:125 · EarlyScrollLock.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1185] Revisar el texto que reemplazó el claim +47
- Fuente: `docs/bitacora-rediseno.md:1075` · tipo: pendiente · estado declarado: pendiente (decisión de Franco) · fecha: 2026-07-30
- Nodo(s): lib.sitio-publico
- Qué es: Quedó 'Automatizaciones funcionando en negocios del NOA' en VaultIA y RubrosIA; copy de venta a validar.
- Referencias: VaultIA.tsx:184 · RubrosIA.tsx:318 · también en docs/bitacora-rediseno.md:675
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1186] Margen de la red de seguridad del scroll (293 ms en /contact)
- Fuente: `docs/bitacora-rediseno.md:1323` · tipo: pendiente · estado declarado: pendiente (decisión de Franco) · fecha: 2026-07-30
- Nodo(s): lib.sitio-publico
- Qué es: Opciones sin implementar: dejarlo, subir Hero y MarketingIntro a ~8000 ms, o armar el timer de MarketingIntro después del readiness gate.
- Referencias: src/components/ui/MarketingIntro.tsx · también en docs/bitacora-rediseno.md:1163
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1187] ESLint set-state-in-effect en el chrome público (Navbar/DynamicDock)
- Fuente: `docs/bitacora-rediseno.md:1444` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-31
- Nodo(s): lib.sitio-publico
- Qué es: Preexistente en Navbar.tsx:183; tras HOME-CLASICO quedan 2 (DynamicDock.tsx:460 y Navbar.tsx:183), sprint aparte si se quiere.
- Referencias: src/components/layout/Navbar.tsx:183 · src/components/layout/DynamicDock.tsx:460 · también en docs/bitacora-rediseno.md:3704 · también en docs/bitacora-rediseno.md:3720
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1188] HeroArtifact.tsx (frozen) mantiene un float perpetuo
- Fuente: `docs/bitacora-rediseno.md:1643` · tipo: decision · estado declarado: vigente (restricción de archivo frozen) · fecha: 2026-07-31
- Nodo(s): lib.sitio-publico
- Qué es: Math.sin en su useFrame contradice el 'nada perpetuo' de la dirección; no se toca por estar congelado (solo se gatea por frameloop).
- Referencias: src/components/3d/HeroArtifact.tsx · también en docs/bitacora-rediseno.md:2418
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1189] CalculadorIA.tsx:316 sirve un número de WhatsApp propio sin leer la env
- Fuente: `docs/bitacora-rediseno.md:1817` · tipo: pendiente · estado declarado: pendiente (decisión humana) · fecha: 2026-07-31
- Nodo(s): lib.sitio-publico
- Qué es: Es el único destino realmente distinto en producción; unificarlo cambia a dónde llega el lead y lo decide una persona.
- Referencias: src/components/ia/CalculadorIA.tsx:316
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1190] Atributos data-cursor inertes en 6 archivos
- Fuente: `docs/bitacora-rediseno.md:1868` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-07-31
- Nodo(s): lib.sitio-publico
- Qué es: Sin CustomCursor no hacen nada; limpieza cosmética cuando se toquen esos archivos.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1191] React #418 (hydration mismatch) con prefers-reduced-motion
- Fuente: `docs/bitacora-rediseno.md:2156` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-08-03
- Nodo(s): lib.sitio-publico
- Qué es: Aparece en / y en tres landings: un componente compartido ramifica el marcado con useReducedMotion; la diferencia debería ir en CSS.
- Referencias: también en docs/bitacora-rediseno.md:2746 · también en docs/bitacora-rediseno.md:2853
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1192] Animaciones contra la regla de performance en el sitio
- Fuente: `docs/bitacora-rediseno.md:2218` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-07-31
- Nodo(s): lib.sitio-publico
- Qué es: layout-transition en OurServices.tsx:7639 (width) y VaultIA.tsx:226 (padding); bounce-easing infinito en WebDevelopmentBento.tsx:171 y ComparadorSection.tsx:44.
- Referencias: OurServices.tsx:7639 · VaultIA.tsx:226 · WebDevelopmentBento.tsx:171 · ComparadorSection.tsx:44
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1193] PRODUCT.md: alcance solo marketing y nada fabricado
- Fuente: `docs/bitacora-rediseno.md:2230` · tipo: decision · estado declarado: vigente · fecha: 2026-07-31
- Nodo(s): lib.sitio-publico
- Qué es: El portal queda fuera de alcance; CTA único por WhatsApp y voseo; no existen ni se fabrican testimonios, logos de clientes, benchmarks, casos publicados ni pricing.
- Referencias: PRODUCT.md · DESIGN.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1194] Gate de merge: nada con placeholders a la vista llega a main
- Fuente: `docs/bitacora-rediseno.md:2665` · tipo: decision · estado declarado: vigente · fecha: 2026-08-04
- Nodo(s): lib.sitio-publico
- Qué es: Ninguna rama con contenido marcado se mergea hasta que Franco lo cierre; no lo levanta que se vea en menos lugares.
- Referencias: también en docs/bitacora-rediseno.md:2824 · también en docs/bitacora-rediseno.md:3325 · también en docs/bitacora-rediseno.md:3333
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1195] D1 del rediseño: sin pricing ni módulos en el home
- Fuente: `docs/bitacora-rediseno.md:2976` · tipo: decision · estado declarado: vigente · fecha: 2026-08-05
- Nodo(s): lib.sitio-publico
- Qué es: Los servicios del home no muestran precios ('módulos y precios salen del home').
- Referencias: src/components/sections/servicios/ · relacionado PRODUCT.md (docs/bitacora-rediseno.md:2230)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1196] Inventario de placeholders del rediseño (27 cadenas) + fotos del equipo
- Fuente: `docs/bitacora-rediseno.md:3323` · tipo: pendiente · estado declarado: pendiente (Franco) · fecha: 2026-08-05
- Nodo(s): lib.sitio-publico
- Qué es: Contenido que Franco debe cerrar en Portfolio.tsx, portal-demo/data.ts, servicios/data.ts, nosotros/data.ts y cierre/Cierre.tsx, más fotos de Franco y Valentino; la home clásica de main no los renderiza.
- Referencias: src/components/sections/home/Portfolio.tsx · src/components/sections/portal-demo/data.ts · src/components/sections/servicios/data.ts · src/components/sections/nosotros/data.ts · src/components/sections/cierre/Cierre.tsx · también en docs/bitacora-rediseno.md:2822 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1197] B7: rediseño de la landing /web-development
- Fuente: `docs/bitacora-rediseno.md:3405` · tipo: bloque · estado declarado: sin estado (planeado) · fecha: 2026-08-07
- Nodo(s): lib.sitio-publico
- Qué es: Incluye un bloque de casos propio, el gradient-text del h1 y los huérfanos de sections/web-development/.
- Referencias: src/app/web-development/page.tsx · también en docs/bitacora-rediseno.md:3589 · también en docs/bitacora-rediseno.md:3591
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1198] Errores de consola preexistentes en /web-development
- Fuente: `docs/bitacora-rediseno.md:3579` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-08-07
- Nodo(s): lib.sitio-publico
- Qué es: 404 de assets de WebTemplatesImmersive, CSP report-only por el iframe a template-zero.netlify.app, 404 de grainy-gradients.vercel.app/noise.svg (×2) y ERR_ABORTED de un video.
- Referencias: WebTemplatesImmersive · también en docs/bitacora-rediseno.md:1236 · también en docs/bitacora-rediseno.md:1452
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1199] Cuatro huérfanos en sections/web-development/
- Fuente: `docs/bitacora-rediseno.md:3587` · tipo: pendiente · estado declarado: sin estado (no se borra) · fecha: 2026-08-07
- Nodo(s): lib.sitio-publico
- Qué es: PortfolioWebCases.tsx (con cursor custom), ShowcaseSection.tsx (con un <Link href='#'> placeholder), WebDevelopmentObjections.tsx y WebDevelopmentSensory.tsx sin importadores; insumo para B7.
- Referencias: src/components/sections/web-development/PortfolioWebCases.tsx · src/components/sections/web-development/ShowcaseSection.tsx:580 · src/components/sections/web-development/WebDevelopmentObjections.tsx · src/components/sections/web-development/WebDevelopmentSensory.tsx · también en docs/bitacora-rediseno.md:1466 · también en docs/bitacora-rediseno.md:1866 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1200] HOME-CLASICO: la home clásica vuelve a main y el rediseño queda experimental
- Fuente: `docs/bitacora-rediseno.md:3604` · tipo: hecho-declarado · estado declarado: hecho (pasada mobile y flujo en producción sin verificar) · fecha: 2026-08-12
- Nodo(s): lib.sitio-publico
- Qué es: Decisión de producto: 30 archivos restaurados desde 63a4e364 (padre del merge del PR #4), EarlyScrollLock remontado en layout.tsx y PanelPlate.tsx borrado; el rediseño vive en origin/redesign/home.
- Referencias: commit 63a4e364 · PR #4 · origin/redesign/home · src/app/layout.tsx · src/components/sections/portal-demo/PanelPlate.tsx · también en docs/bitacora-rediseno.md:3606 +1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1201] Regresión de performance y chrome viejo aceptados con la home clásica
- Fuente: `docs/bitacora-rediseno.md:3682` · tipo: decision · estado declarado: vigente (decisión de producto) · fecha: 2026-08-12
- Nodo(s): lib.sitio-publico
- Qué es: Vuelven el scroll-lock de ~9,8 s, los dynamic() con carga en cascada y ~9.000 líneas; Navbar/DynamicDock vuelven a todas las rutas públicas.
- Referencias: también en docs/bitacora-rediseno.md:3691
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1202] El Hero clásico baja el HDRI de un CDN en runtime
- Fuente: `docs/bitacora-rediseno.md:3724` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-08-12
- Nodo(s): lib.sitio-publico
- Qué es: <Environment preset='studio' /> pierde reflejos sin red; el rediseño lo había self-hosteado (1641 KB) y propuesto Lightformers o comprimirlo.
- Referencias: src/components/layout/Hero.tsx · public/hdri/studio_small_03_1k.hdr · también en docs/bitacora-rediseno.md:1646 · también en docs/bitacora-rediseno.md:2160
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1203] Anclas /#... en carga fría pueden no aterrizar (vuelve con la home clásica)
- Fuente: `docs/bitacora-rediseno.md:3726` · tipo: pendiente · estado declarado: pendiente (bug viejo reintroducido) · fecha: 2026-08-12
- Nodo(s): lib.sitio-publico
- Qué es: Secciones dynamic() sin caja al resolver el hash y #nosotros duplicado en About.tsx; afecta también la navegación del chatbot a anclas del home.
- Referencias: src/app/page.tsx · src/components/sections/home/About.tsx · también en docs/bitacora-rediseno.md:1681 · también en docs/bitacora-rediseno.md:2654 · también en docs/bitacora-rediseno.md:3042
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1204] Huérfanos del rediseño dejados a propósito en main
- Fuente: `docs/bitacora-rediseno.md:3729` · tipo: decision · estado declarado: vigente · fecha: 2026-08-12
- Nodo(s): lib.sitio-publico
- Qué es: HeroArtifactLayer, HeroCanvas, cierre/*, nosotros/*, servicios/* y portal-demo/useEscenaCycle compilan solos; design-system y /styleguide intactos; receta documentada para volver al rediseño.
- Referencias: src/components/layout/HeroArtifactLayer.tsx · src/components/layout/HeroCanvas.tsx · src/components/sections/cierre/ · src/components/sections/nosotros/ · src/components/sections/servicios/ · src/components/sections/portal-demo/useEscenaCycle
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1205] Canvas 3D de la landing con dpr [1,2] y sin culling
- Fuente: `docs/bitacora-roadmap.md:5370` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-05-24
- Nodo(s): lib.sitio-publico
- Qué es: Diagnóstico del timeout: shader FBM de 3 octavas en HeroBackground y varios canvas (DotMatrix, Interactive3DNetwork, ReactiveBackground) con dpr [1,1.5] o [1,2] sin culling; no se tocó.
- Referencias: HeroBackground.tsx:50-78 · DotMatrix · Interactive3DNetwork · ReactiveBackground
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1206] REVEAL-FIX.1 coreografía del intro
- Fuente: `docs/bitacora-roadmap.md:10425` · tipo: hecho-declarado · estado declarado: hecho (verificación por grabación pendiente) · fecha: 2026-06-02
- Nodo(s): lib.sitio-publico
- Qué es: MARKETING_INTERACT_MS a 1000, will-change en mobile y logo 2D sólido sube con el toldo.
- Referencias: src/components/ui/MarketingIntro.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1207] Verificación humana de la coreografía del intro
- Fuente: `docs/bitacora-roadmap.md:10455` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-02
- Nodo(s): lib.sitio-publico
- Qué es: El intro no es observable por automation; confirmar por grabación y ajustar tunables de duración/offsets.
- Referencias: también en fuente:10487 · también en fuente:10523 · también en fuente:10526
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1208] REVEAL-FIX.2 sin sticker blanco detrás del logo
- Fuente: `docs/bitacora-roadmap.md:10463` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-02
- Nodo(s): lib.sitio-publico
- Qué es: Se quitó el stroke de la máscara del LogoStrokeOverlay.
- Referencias: src/components/ui/LogoStrokeOverlay.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1209] REVEAL-TEXT lockup develOP + slogan
- Fuente: `docs/bitacora-roadmap.md:10491` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-02
- Nodo(s): lib.sitio-publico
- Qué es: Texto con wipe en ambas intros (IntroLockupText) y textReveal en PreloaderContext.
- Referencias: src/components/ui/IntroLockupText.tsx · src/context/PreloaderContext.tsx · src/components/ui/Preloader.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1210] No borrar Preloader ni MarketingIntro
- Fuente: `docs/sprints/sprint-b0-bis-cierre.md:20` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.sitio-publico
- Qué es: Su supervivencia la decide B2.
- Referencias: tambien en :33
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1211] B0-bis T1: three fuera del bundle inicial
- Fuente: `docs/sprints/sprint-b0-bis-cierre.md:25` · tipo: bloque · estado declarado: plan (sin estado)
- Nodo(s): lib.sitio-publico
- Qué es: MarketingIntro dinámico en Preloader.tsx (plan B: BrandedIntroCanvas); medir chunks y Lighthouse mobile (baseline 34/100, LCP 6,1 s).
- Referencias: src/components/ui/Preloader.tsx · rama fix/home-sanidad · fe099b9 · tambien en :59
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1212] B0-bis T2-T3: badge y canonical del home
- Fuente: `docs/sprints/sprint-b0-bis-cierre.md:35` · tipo: bloque · estado declarado: plan
- Nodo(s): lib.sitio-publico
- Qué es: Unificar el badge de ubicación en About.tsx y agregar alternates.canonical '/'.
- Referencias: src/components/sections/home/About.tsx · src/app/layout.tsx · tambien en :42
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1213] B0.5 T1: sacar el claim +47
- Fuente: `docs/sprints/sprint-b05-sanidad-sitio.md:22` · tipo: bloque · estado declarado: plan
- Nodo(s): lib.sitio-publico
- Qué es: RubrosIA.tsx:318 y VaultIA.tsx:184 -> 'Automatizaciones funcionando en negocios del NOA'.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1214] B0.5 T2-T4: copy e higiene
- Fuente: `docs/sprints/sprint-b05-sanidad-sitio.md:32` · tipo: bloque · estado declarado: plan
- Nodo(s): lib.sitio-publico
- Qué es: 44 preguntas sin apertura, 36 tildes y voseo, Tucumán, 3 archivos .bak y mojibake en HeroAutomation/RubrosIA.
- Referencias: audit/copy-preguntas-sin-apertura.txt · audit/copy-tildes.txt · tambien en :38, :47
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1215] B0.5 T5: sitemap.ts y robots.ts
- Fuente: `docs/sprints/sprint-b05-sanidad-sitio.md:52` · tipo: bloque · estado declarado: plan
- Nodo(s): lib.sitio-publico
- Qué es: Solo rutas públicas; robots excluye /dashboard, /admin, /setter, /api/, /embed/, /login, /bienvenida.
- Referencias: src/app/sitemap.ts · src/app/robots.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1216] Anti-referencias del rediseño
- Fuente: `raiz:DESIGN.md:92` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.sitio-publico
- Qué es: Fuera glassmorphism, backdrop-blur, gradientes, sombras de color, radios grandes, motion perpetuo, cards que escalan, cursores custom, typewriters.
- Referencias: tambien en :211, :291-:299
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1217] Gate 1 cerrado (B2-S4): acentos
- Fuente: `raiz:DESIGN.md:125` · tipo: decision · estado declarado: cerrado
- Nodo(s): lib.sitio-publico
- Qué es: Opción A del código: web cian, IA verde, automatización ámbar, software violeta #8b5cf6 (queda el token, no 'índigo').
- Referencias: docs/proof-screenshots/b2-s4/ · tambien en :154
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1218] Acento solo sobre oscuro y alternancia estricta
- Fuente: `raiz:DESIGN.md:141` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.sitio-publico
- Qué es: Ninguna sección crema lleva acento; nunca dos secciones seguidas con el mismo tema (data-ds-theme por sección).
- Referencias: tambien en :150, :160, :162
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1219] Escala tipográfica y medidas
- Fuente: `raiz:DESIGN.md:190` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.sitio-publico
- Qué es: Pisos de clamp como escala (lead/body >= 1.20, data/display-lg <= 0.75); container 1240px, prosa 65ch, bajada 42ch.
- Referencias: tambien en :201
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1220] Relieve solo en el CTA primario
- Fuente: `raiz:DESIGN.md:215` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.sitio-publico
- Qué es: Sombra de dos capas que se invierte con el tema; secundario plano con borde >= 3:1; sin scale ni tracking animado; press 2px en CSS puro.
- Referencias: tambien en :229, :243, :273
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1221] Índice de capítulos
- Fuente: `raiz:DESIGN.md:262` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.sitio-publico
- Qué es: Todas las secciones con ChapterLabel '( 01 )' correlativo y hero = 01; replicar en las 4 landings.
- Referencias: tambien en :264-:267
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1222] Motion escasa
- Fuente: `raiz:DESIGN.md:271` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.sitio-publico
- Qué es: Reveals opacity+translateY ~0.9s once, estados 150ms, prefers-reduced-motion.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1223] Un solo CTA: WhatsApp
- Fuente: `raiz:PRODUCT.md:29` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.sitio-publico
- Qué es: El sitio solo deriva a WhatsApp; sin formulario largo, agenda por calendario ni pricing público.
- Referencias: tambien en :41, :65, :79
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1224] Acentos por servicio
- Fuente: `raiz:PRODUCT.md:54` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.sitio-publico
- Qué es: web cyan, IA verde, automatización ámbar, software 'índigo' (DESIGN.md dice violeta).
- Referencias: tambien en :66
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1225] Estructura de capítulos del home
- Fuente: `raiz:PRODUCT.md:58` · tipo: pendiente · estado declarado: sin decidir
- Nodo(s): lib.sitio-publico
- Qué es: Sin decidir la estructura definitiva post-rediseño.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1226] Voz y nada inventado
- Fuente: `raiz:PRODUCT.md:64` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.sitio-publico
- Qué es: Voseo rioplatense sin jerga de agencia; no fabricar testimonios, logos, métricas, casos ni pricing.
- Referencias: tambien en :75, :83
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1227] Tipografía Geist y Geist Mono
- Fuente: `raiz:PRODUCT.md:67` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.sitio-publico
- Qué es: No se incorporan familias nuevas.
- Referencias: raiz:DESIGN.md:186, :300
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1228] Design system y baseline Impeccable
- Fuente: `raiz:PRODUCT.md:71` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.sitio-publico
- Qué es: src/components/design-system/, tokens @theme en globals.css, /styleguide; baseline Impeccable v3.5.0 (2026-07-31).
- Referencias: logic-core-v3/docs/impeccable-baseline.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

### lib.transversal

#### [PLAN-1229] Copy de contadores después de MH.2
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:13` · tipo: bloque · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): lib.transversal
- Qué es: Revisar todo conteo de conversaciones del panel para que diga 'atendidas' y no mezcle las degradadas.
- Referencias: MH.2 · tambien en Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:28
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1230] Frontera de chats por superficie
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:29` · tipo: decision · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): lib.transversal
- Qué es: Runtime, widget, KB y motor son del chat Chatbot; /admin y /dashboard, del chat Panel. Tocar src/modules/chatbot/server/* exige coordinar.
- Referencias: src/modules/chatbot/server/* · tambien en Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:32 · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:95 · tambien en Franco/Bloques a Ejecutar/DASHBOARD/HANDOFF-chatbot-arranque.md:39
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1231] Estado del producto: v0.9.0-rc.1 sin producción
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:9` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): lib.transversal
- Qué es: Feature-complete, no está en producción y Matsu no siguió. El repo en HEAD affa06a está antes de EV; nada del plan se ejecutó.
- Referencias: tag v0.9.0-rc.1 · affa06a · tambien en Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:17
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1232] Auditorías I-III: aislamiento multi-tenant sin rojos
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:28` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): lib.transversal
- Qué es: Las tres fueron read-only. La III barrió todas las queries del dominio chatbot y dio 0 rojos. El hallazgo más grave fue /smoke público.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:64
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1233] MH es la apuesta comercial #1 y prerrequisito de R1
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:39` · tipo: decision · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): lib.transversal
- Qué es: Un ROI calculado sobre métricas sucias se vuelve en contra.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1234] El reporte del agente no es el estado
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:97` · tipo: decision · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): lib.transversal
- Qué es: Antes de dar un bloque por cerrado, verificar que exista su cierre '## ✅' en la bitácora. Build verde no significa que funcione.
- Referencias: tambien en Franco/Bloques a Ejecutar/DASHBOARD/HANDOFF-chatbot-arranque.md:37 · tambien en Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:93
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1235] Contrato de scoping explícito en helpers
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:48` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-06
- Nodo(s): lib.transversal
- Qué es: Helpers que confían en el parámetro que reciben. Consolidar sobre el patrón relacional de multiTenantQueries.
- Referencias: multiTenantQueries · A5.4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1236] Orden de ejecución de la evolución
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:57` · tipo: decision · estado declarado: hecho · fecha: 2026-07-06
- Nodo(s): lib.transversal
- Qué es: T0 → EV → UTM.1 → Q1 → MH → RB → E1 → R1 (exige MH) → resto. MH y RB pueden permutar.
- Referencias: tambien en Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:59
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1237] Cuatro frentes F1-F4
- Fuente: `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:645` · tipo: hecho-declarado · estado declarado: hecho · **ZONA-FRANCO**
- Nodo(s): lib.transversal
- Qué es: F1 Modal.tsx con role=dialog/aria-modal; F2 franja de conteos en cartera-view.tsx; F3 borrador on-demand (draft-preview.tsx) en /admin/leados/[leadId]; F4 invariantes endurecidos.
- Referencias: src/components/ui/Modal.tsx · cartera-view.tsx · draft-preview.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1238] Patrones establecidos del admin
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:54` · tipo: decision · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): lib.transversal
- Qué es: Hover único adminHoverCls. Modales portaleados a body por la trampa de backdrop-filter. TypeToConfirmDialog con auditoría sin FK. Schemas Zod en .schemas.ts. Navegación con <Link> o router.refresh, nunca router.push.
- Referencias: src/lib/hover.ts · TypeToConfirmDialog · AdminLayoutClient.tsx · tambien en Olme/Admin - Registro de cambios/Operaciones/Leads_ registro de cambios.md:73 · tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:61 · tambien en Olme/Cliente - Registro de cambios/General_ registro de cambios.md:14
- Estado en código: **parcial** — Existen adminHoverCls (src/lib/hover.ts:5), admin/_components/type-to-confirm-dialog.tsx y 18 *.schemas.ts, pero router.push sigue en el admin (CreateBotForm.tsx:80, ClientSwitcher.tsx:67, lead-card.tsx:69, convert-lead-dialog.tsx:132) (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1239] column-overview duplicado entre Alertas y Leads
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:52` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-19
- Nodo(s): lib.transversal
- Qué es: alert-column-overview.tsx copia 1:1 el patrón de Leads. Extraerlo a un componente compartido.
- Referencias: alerts/_components/alert-column-overview.tsx · admin/leads/_components/column-overview.tsx · tambien en Olme/Ideas de nuevas features.md:65 · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:70
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1240] Select compartido con listbox propio
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Operaciones/Chatbot_ registro de cambios.md:52` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-12
- Nodo(s): lib.transversal
- Qué es: Chevron propio, color-scheme dark y listbox con un select nativo oculto sincronizado. Cero cambios en los 42 call sites, con portal y teclado completo.
- Referencias: src/components/ui/Select.tsx · src/lib/use-is-client.ts · tambien en Olme/Chatbot_ registro de cambios.md:24
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1241] Merge de Inteligencia y Configuración
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:29` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): lib.transversal
- Qué es: Consolidación por sector y luego a main. Chocó package.json (seed:latency) y se verificó que la pestaña por bot no regresionó.
- Referencias: resuelve Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:6 · tambien en Olme/Admin - Registro de cambios/Inteligencia_ registro de cambios.md:132
- Estado en código: **hecho** — package.json:20 'seed:latency' presente en main. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1242] Limpieza final y push
- Fuente: `_insumos/drive/Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:57` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-20
- Nodo(s): lib.transversal
- Qué es: Se borró código muerto (deleteClientAction legacy y el cluster client-*, 1999 líneas). Seeds de Neon limpiados, ramas borradas y push a origin/main.
- Referencias: 289d792 · tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:70
- Estado en código: **hecho** — git grep deleteClientAction en src = 0 (control: hardDeleteClient importado en ClientsListClient.tsx:14). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1243] Subida de imágenes = base64 en DB, sin infra externa
- Fuente: `_insumos/drive/Olme/Chatbot_ registro de cambios.md:119` · tipo: decision · estado declarado: hecho · fecha: 2026-06-17
- Nodo(s): lib.transversal
- Qué es: La imagen se comprime en el cliente y se guarda en la DB, en lugar de pedir una URL o usar Vercel Blob. Aplica al avatar del bot y al del cliente.
- Referencias: tambien en Olme/Chatbot_ registro de cambios.md:97 · tambien en Olme/Admin - Registro de cambios/Clientes_ registro de cambios.md:53 · tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:46 · contradice Olme/Cliente - Registro de cambios/Chatbot_ registro de cambios.md:89
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1244] Merges y seeds los hace Valentino, no CC
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/General_ registro de cambios.md:76` · tipo: decision · estado declarado: hecho
- Nodo(s): lib.transversal
- Qué es: Los merges los hace un humano sobre main, paso a paso, con --no-edit. Los seeds y las migraciones los corre él.
- Referencias: tambien en Olme/Cliente - Registro de cambios/General_ registro de cambios.md:77 · tambien en Olme/Cliente - Registro de cambios/General_ registro de cambios.md:64
- Estado en código: **hecho** — No hay automatización que corra seeds ni migraciones: netlify.toml:2 sin migrate deploy; los seeds documentan corrida manual (sync-plans.ts:9-13, add-contact-tool.ts:24-27). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1245] Estado vacío en páginas server: armado a mano
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:402` · tipo: decision · estado declarado: hecho · fecha: 2026-06-27
- Nodo(s): lib.transversal
- Qué es: EmptyState es 'use client' y recibe el ícono como componente, que no puede cruzar el boundary RSC. En páginas server se arma en JSX.
- Referencias: EmptyState · tambien en Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:153
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1246] Tarea 3: EmptyStateMuted como estado vacío canónico
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:36` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.transversal
- Qué es: Re-export de ResultEmptyState. Migra los estados vacíos de listas en el cliente (módulos, soporte, project, services, chatbot) y en el admin (~20 archivos). Mergeado.
- Referencias: 63c455f · 79ce485 · 211672f · 565afb1 · ea8c5ff · 7e1ac3d +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1247] Bloque A cosmético (Batch 2)
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:52` · tipo: hecho-declarado · estado declarado: hecho (sin mergear)
- Nodo(s): lib.transversal
- Qué es: Loadings a ancho completo, empty 'sin proyectos', hover en los tiles de proyecto, empties del chatbot overview y Mi plan de pb-20 a pb-6.
- Referencias: f3c2b32 · ab111c4 · 82aed0e · 6ea7df9 · 713c203 · lane/portal-pulido
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1248] Solo los vacíos de lista se aplanan; los heroes conservan su marca
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:81` · tipo: decision · estado declarado: hecho
- Nodo(s): lib.transversal
- Qué es: Los heroes de venta, conexión y bienvenida mantienen su diseño. variant=dashed se unifica a EmptyStateMuted. Excepción: ProjectsTab:76.
- Referencias: ChatbotUpsellLanding · tambien en Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:82
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1249] Barrido de pb-20 en todo el portal
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:88` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: pb-20 es el valor de todo el portal. Solo se alineó Mi plan; el barrido completo queda para una lane aparte.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1250] Deuda previa del portal
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:168` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: set-state-in-effect en conversation-list (L57), deps del useMemo en ClientLeadsTable (L186), formAction muerto en campaigns/new, <Field> sin htmlFor.
- Referencias: admin/messages/_components/conversation-list.tsx:57 · ClientLeadsTable.tsx:186 · campaigns/new · Field
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1251] Subir chartCardHoverCls a lib/hover.ts
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Resultados_ registro de cambios.md:176` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: Variante sin scale para recharts. Hoy existe como copia local; subirla al shared es un follow-up aditivo.
- Referencias: src/lib/hover.ts · results/_shared/chartHover.ts · LatencyChart.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1252] Bug latente: EmptyState con ícono Lucide en páginas server
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:218` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-25
- Nodo(s): lib.transversal
- Qué es: Si una página server le pasa un ícono Lucide a EmptyState, la página no renderiza con datos vacíos. Afecta project, modules/* y chatbot/settings.
- Referencias: EmptyState · tambien en Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:156 · tambien en Olme/Cliente - Registro de cambios/Servicios_ registro de cambios.md:267 · ver Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:45-48 (migración de esos empties)
- Estado en código: **hecho** — Las páginas server usan EmptyStateMuted, universal y sin 'use client' (src/components/ui/EmptyStateMuted.tsx:7-8): dashboard/chatbot/settings/page.tsx:53-54, agenda-inteligente/page.tsx:262-263. ui/EmptyState.tsx:1 es 'use client' y no se usa desde páginas server. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1253] Chat compartido entre Mensajes y Ticket
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:49` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.transversal
- Qué es: ClientChatThread, ChatBubble y ClientChatComposer. Se borró AnimatedChatBubble. Mensajes quedó byte-idéntico.
- Referencias: ClientChatThread.tsx · ChatBubble.tsx · ClientChatComposer.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1254] Chat compartido: solo la UI
- Fuente: `_insumos/drive/Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:66` · tipo: decision · estado declarado: hecho
- Nodo(s): lib.transversal
- Qué es: El componente no importa Prisma ni tiene actions. Los datos de tickets y de mensajes no se mezclan.
- Referencias: tambien en Olme/Cliente - Registro de cambios/Soporte_ registro de cambios.md:68
- Estado en código: **hecho** — src/components/dashboard/ClientChatThread.tsx, ClientChatComposer.tsx y ChatBubble.tsx solo importan react, motion, lucide y UI local; los usan admin/tickets/_components/ticket-chat.tsx y dashboard/soporte/[ticketId]/page.tsx (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1255] date-preset-filter compartido
- Fuente: `_insumos/drive/Olme/Ideas de nuevas features.md:64` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-20
- Nodo(s): lib.transversal
- Qué es: El mapeo preset→rango de fechas está reimplementado 4 veces (Leads, Alertas, Actividad, Audit). Extraer un util compartido. Es deuda de consolidación.
- Referencias: tambien en Olme/Admin - Registro de cambios/ADMIN COMPLETO_ registro de cambios.md:70 · tambien en Olme/Admin - Registro de cambios/Transversal (operaciones)_ registro de cambios.md:91
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1256] csv-escape duplicado a propósito
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:34` · tipo: decision · estado declarado: hecho · fecha: 2026-07-13
- Nodo(s): lib.transversal
- Qué es: La lógica del módulo chatbot se copió a src/lib/csv en lugar de importarla cruzando la frontera de módulo. Si cambia el escape, hay que sincronizar las dos copias.
- Referencias: src/lib/csv/csv-escape.ts · src/modules/chatbot/server/ · tambien en Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:89
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1257] Rama b0-isolation-motor-chatbot sin mergear a main
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:81` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-13
- Nodo(s): lib.transversal
- Qué es: El trabajo del panel de esa tanda (PD-1, PA, CO-5) vive en la rama. Está pusheada y ya integra origin/main.
- Referencias: b0-isolation-motor-chatbot
- Estado en código: **no empezado** — git log origin/main..origin/b0-isolation-motor-chatbot da 8 commits fuera de main, entre ellos 9fc616c4 'cifrar credenciales en write-paths + Zod (PD-1.2)'; en main src/actions/agency-actions.ts:103-110 sigue guardando sin cifrar. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

#### [PLAN-1258] Dos helpers AES-GCM conviviendo
- Fuente: `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:88` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-07-13
- Nodo(s): lib.transversal
- Qué es: secret-box.ts (del motor) y credential-cipher/encrypt-for-storage (del panel). Evaluar si se consolidan.
- Referencias: src/lib/crypto/secret-box.ts · src/lib/crypto/credential-cipher.ts · src/lib/crypto/encrypt-for-storage.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1259] SectionErrorBoundary no sirve fuera del portal cliente
- Fuente: `docs/bitacora-beta-2.md:489` · tipo: decision · estado declarado: vigente · fecha: 2026-06-29
- Nodo(s): lib.transversal
- Qué es: No se migró el boundary del setter porque su 'Volver al inicio' apunta a /dashboard; se replicó a mano el par logger + Sentry.
- Referencias: SectionErrorBoundary · src/app/(protected)/setter/error.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1260] B1.A TextArea promovida al kit UI
- Fuente: `docs/bitacora-beta-3.md:538` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-01
- Nodo(s): lib.transversal
- Qué es: setter/_components/text-area.tsx movido a components/ui/Textarea.tsx y exportado en el barrel; 9 consumidores repuntados.
- Referencias: src/components/ui/Textarea.tsx · src/components/ui/index.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1261] AUD-1 auditoría del setter vs Brief de Visión v2
- Fuente: `docs/bitacora-beta-3.md:669` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-02 · **ZONA-FRANCO**
- Nodo(s): lib.transversal
- Qué es: Informe AUDITORIA-VS-BRIEF-2026-07.md en raíz: 29 divergencias (2 sev 4); gating de aislamiento con perímetro acotado.
- Referencias: AUDITORIA-VS-BRIEF-2026-07.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1262] 7.2 accesibilidad sistémica de Field.tsx
- Fuente: `docs/bitacora-beta-3.md:1146` · tipo: hecho-declarado · estado declarado: hecho (commit registrado como «<pendiente>») · fecha: 2026-07-04
- Nodo(s): lib.transversal
- Qué es: Field con useId + FieldControlProvider (field-context.ts): label htmlFor, aria-describedby, aria-invalid en Input/TextArea, focus-visible; confirmado en browser en 7.3.
- Referencias: components/ui/Field.tsx · field-context.ts · también en fuente:982,1184
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1263] AUD-2 auditoría de cierre
- Fuente: `docs/bitacora-beta-3.md:1200` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-07 · **ZONA-FRANCO**
- Nodo(s): lib.transversal
- Qué es: docs/auditorias/AUDITORIA-CIERRE-2026-07.md: 26 hallazgos C-xx, 10 PR-x, diseño fase PRE y backlog de 40 ítems.
- Referencias: docs/auditorias/AUDITORIA-CIERRE-2026-07.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1264] 21 cambios de método (PROPUESTA-CIMIENTO)
- Fuente: `docs/bitacora-beta-3.md:1778` · tipo: idea · estado declarado: propuesto · fecha: 2026-07-23
- Nodo(s): lib.transversal
- Qué es: Lo más urgente: M-01/M-02, un worktree por sesión y exclusividad de commit.
- Referencias: docs/metodo/PROPUESTA-CIMIENTO.md · también en fuente:1835
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1265] excludeDqWhere sin ningún invariante (7 consumidores)
- Fuente: `docs/bitacora-beta-3.md:7530` · tipo: pendiente · estado declarado: listado, sin tocar · fecha: 2026-08-27
- Nodo(s): lib.transversal
- Qué es: El fragmento where del filtro de descalificados del chatbot tiene siete consumidores de producto y ninguna red: la misma forma que tenía el contador antes de P8.
- Referencias: modules/chatbot/server/scoring/dqFilter.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1266] Helpers de filtro por fecha sin zona horaria en admin y chatbot
- Fuente: `docs/bitacora-beta-3.md:7537#2` · tipo: pendiente · estado declarado: listado, sin tocar · fecha: 2026-08-27
- Nodo(s): lib.transversal
- Qué es: Cuatro helpers del lado del cliente tienen la misma forma sin zona horaria: admin/alerts, admin/audit-log, admin/leads y chatbot/activity.
- Referencias: admin/alerts · admin/audit-log · admin/leads · chatbot/activity
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1267] El <Select> compartido se cierra solo de forma intermitente
- Fuente: `docs/bitacora-beta-3.md:9167` · tipo: pendiente · estado declarado: anotado, no tocado · fecha: 2026-09-01
- Nodo(s): lib.transversal
- Qué es: Se cierra ante cualquier scroll de la página (listener en fase de captura) y al abrirse enfoca su listbox sin preventScroll, lo que puede provocar justo ese scroll. Ya estaba antes de P16 y no se tocó.
- Referencias: <Select> compartido
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1268] El Modal compartido no declara role=dialog ni aria-modal
- Fuente: `docs/bitacora-beta-3.md:10858` · tipo: pendiente · estado declarado: anotado, no hecho · fecha: 2026-09-03/06 (inferida)
- Nodo(s): lib.transversal
- Qué es: Afecta a todos los modales de la app: el diálogo de salida de P23 funciona, pero no se anuncia como diálogo. Son dos atributos y quedan para un sprint propio.
- Referencias: Modal compartido
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1269] Tier de z-index del chrome en design-tokens.ts bajo modal 10000
- Fuente: `docs/bitacora-beta.md:221` · tipo: decision · estado declarado: vigente · fecha: 2026-06-18
- Nodo(s): lib.transversal
- Qué es: appShell 80, appDrawerBackdrop 100, appDrawer 110, appNavTrigger 120, appDrawerClose 130, aplicados por style inline porque Tailwind v4 no emite z-* desde el objeto TS.
- Referencias: src/lib/design-tokens.ts · setter-shell.tsx · también en docs/bitacora-beta.md:52 (Modal con zIndex.modal 10000) · choca con el plan de borrar design-tokens.ts en docs/bitacora-rediseno.md:133
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1270] Sender único de Telegram (sendTelegram + resolveTelegramCredentials)
- Fuente: `docs/bitacora-beta.md:418` · tipo: hecho-declarado · estado declarado: hecho (verificación en uso real por Franco) · fecha: 2026-06-19
- Nodo(s): lib.transversal
- Qué es: Las 3 copias (telegram.ts del chatbot, leados/notify.ts y el cron os-follow-up) pasan por un único sender; notifyTelegramOptional queda como wrapper.
- Referencias: src/lib/notifications/telegram.ts · src/lib/leados/notify.ts · src/app/api/cron/os-follow-up/route.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1271] Línea base e2e pre-rediseño: 32 passed / 10 failed / 8 skipped
- Fuente: `docs/bitacora-beta.md:1639` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-25
- Nodo(s): lib.transversal
- Qué es: npm run test:e2e (22 specs, 50 tests) corre en Chromium; los 10 fallos son preexistentes (7 visuales, 2 bulk-actions, 1 onboarding).
- Referencias: playwright.config.ts · tests/e2e/ · también en docs/bitacora-beta-2.md:50
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1272] Regenerar snapshots de regresión visual desactualizados
- Fuente: `docs/bitacora-beta.md:1659` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-25
- Nodo(s): lib.transversal
- Qué es: 22-visual-regression difiere 3–8% en /admin, /admin/clients, /admin/alerts, /admin/_design, /dashboard, /dashboard/chatbot y /dashboard/chatbot/settings; regenerar con --update-snapshots.
- Referencias: tests/e2e/22-visual-regression.spec.ts · también en docs/bitacora-beta-2.md:69 · también en docs/bitacora-beta-2.md:79
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1273] B1-S1 Tokens ds-* en @theme static + escala tipográfica + reduced-motion global
- Fuente: `docs/bitacora-rediseno.md:31` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-30
- Nodo(s): lib.transversal
- Qué es: 37 tokens con infijo ds en globals.css y el primer bloque prefers-reduced-motion del sitio (1ms, una iteración), que aplica a toda la app.
- Referencias: src/app/globals.css · commit feat(design-system): tokens base, escala tipográfica y reduced-motion global
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1274] Convenciones de tokens del design system
- Fuente: `docs/bitacora-rediseno.md:63` · tipo: decision · estado declarado: vigente · fecha: 2026-07-30
- Nodo(s): lib.transversal
- Qué es: Infijo ds dentro de los namespaces de Tailwind para no colisionar con --color-void/--color-accent; @theme static para forzar la emisión; reduced-motion con 1ms + iteration-count 1.
- Referencias: src/app/globals.css · también en docs/bitacora-rediseno.md:73 · también en docs/bitacora-rediseno.md:83
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1275] Eliminar tailwind.config.ts y design-tokens.ts y limpiar tokens viejos en el bloque final
- Fuente: `docs/bitacora-rediseno.md:133` · tipo: pendiente · estado declarado: pendiente (bloque final) · fecha: 2026-07-30
- Nodo(s): lib.transversal
- Qué es: Se declaran desconectados del pipeline (Tailwind 4 CSS-first); también hay que limpiar --color-void, --color-obsidian, --color-accent y [data-theme].
- Referencias: tailwind.config.ts · src/lib/design-tokens.ts · src/app/globals.css · también en docs/bitacora-rediseno.md:141 · riesgo: design-tokens.ts aporta zIndex al shell del setter y al Modal (docs/bitacora-beta.md:52, :221) · sin cambios en HOME-CLASICO (docs/bitacora-rediseno.md:3643)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1276] Asignación de acentos por servicio: opción A
- Fuente: `docs/bitacora-rediseno.md:172` · tipo: decision · estado declarado: cerrada (opción A) · fecha: 2026-08-04
- Nodo(s): lib.transversal
- Qué es: Web cyan #06b6d4, IA verde #10b981, Automation ámbar #f59e0b, Software violeta #8b5cf6; CLAUDE.md alineado con A en B0.5 y Gate 1 cerrado con A en DESIGN.md y accent.ts.
- Referencias: src/app/globals.css · CLAUDE.md · DESIGN.md · src/components/design-system/accent.ts · también en docs/bitacora-rediseno.md:515 · también en docs/bitacora-rediseno.md:763 +3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1277] B1-S2 Componentes base del design system + ui/Button extendido
- Fuente: `docs/bitacora-rediseno.md:182` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-30
- Nodo(s): lib.transversal
- Qué es: 10 componentes en src/components/design-system/, capa semántica por sección y variantes ds-primary/ds-secondary/ds en ui/Button (sus 19 consumidores intactos).
- Referencias: src/components/design-system/ · src/components/ui/Button.tsx · src/hooks/useThemeObserver.tsx · src/app/globals.css · commit feat(design-system): componentes base del sistema visual
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1278] Extender ui/Button en vez de envolverlo (y sus agregados posteriores)
- Fuente: `docs/bitacora-rediseno.md:233` · tipo: decision · estado declarado: vigente (ui/Button sin cambios en HOME-CLASICO) · fecha: 2026-07-30
- Nodo(s): lib.transversal
- Qué es: twMerge no colapsa rounded-ds-*/text-ds-*, por eso se extiende; luego se exporta buttonClasses() (CtaButton con href = <a>), tamaño ds-compact y hasFramerPress() del lado de la variante.
- Referencias: src/components/ui/Button.tsx · src/components/design-system/CtaButton.tsx · también en docs/bitacora-rediseno.md:1515 · también en docs/bitacora-rediseno.md:1798 · también en docs/bitacora-rediseno.md:2331 · también en docs/bitacora-rediseno.md:3642
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1279] Theming local por sección (data-ds-theme) junto al data-theme global
- Fuente: `docs/bitacora-rediseno.md:257` · tipo: decision · estado declarado: vigente · fecha: 2026-07-30
- Nodo(s): lib.transversal
- Qué es: SectionShell escribe data-ds-theme en su <section> y avisa al ThemeProvider viejo con useThemeSectionOptional (no tira sin provider); atributos distintos en elementos distintos.
- Referencias: src/components/design-system/SectionShell.tsx · src/hooks/useThemeObserver.tsx · también en docs/bitacora-rediseno.md:266 · también en docs/bitacora-rediseno.md:275
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1280] B1-S3 Styleguide /styleguide (noindex), cierre de B1
- Fuente: `docs/bitacora-rediseno.md:361` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-30
- Nodo(s): lib.transversal
- Qué es: Página interna con paleta, acentos, tipografía, componentes con estados y el esqueleto de las 6 secciones; sin links entrantes.
- Referencias: src/app/styleguide/ · commit feat(design-system): styleguide con las 6 secciones y opciones para Gate 1
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1281] Fuente de prueba Space Grotesk en el styleguide
- Fuente: `docs/bitacora-rediseno.md:387` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-07-30
- Nodo(s): lib.transversal
- Qué es: Declarada solo en TypographyBlock.tsx; si se descarta se borra el archivo (la dirección fijó Geist + Geist Mono).
- Referencias: src/app/styleguide/_components/TypographyBlock.tsx · relacionado docs/bitacora-rediseno.md:2223
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1282] cn() con extendTailwindMerge para los tokens --text-ds-*
- Fuente: `docs/bitacora-rediseno.md:403` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-30
- Nodo(s): lib.transversal
- Qué es: twMerge descartaba tamaños text-ds-* por confundirlos con color; se declararon como grupo font-size, con 0 diferencias sobre 5.615 className reales.
- Referencias: src/lib/utils.ts · también en docs/bitacora-rediseno.md:417
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1283] Layout raíz: <html lang='es'> con las variables de Geist
- Fuente: `docs/bitacora-rediseno.md:602` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-30
- Nodo(s): lib.transversal
- Qué es: next/font deja las variables en <html> (en <body> Geist no aplicaba en ninguna página); canonical y meta sin el claim +47.
- Referencias: src/app/layout.tsx · fix/fonts-geist-scope · también en docs/bitacora-rediseno.md:614 · también en docs/bitacora-rediseno.md:655
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1284] Regla para pasadas masivas sobre copy
- Fuente: `docs/bitacora-rediseno.md:814` · tipo: decision · estado declarado: vigente · fecha: 2026-07-30
- Nodo(s): lib.transversal
- Qué es: Distinguir string de texto vs string de clave o tipo y saltear interpolaciones de template literals (una pasada rompió claves de lookup e interfaces).
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1285] CustomCursor y NoiseOverlay fuera del layout raíz (todas las superficies)
- Fuente: `docs/bitacora-rediseno.md:1737` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-07-31
- Nodo(s): lib.transversal
- Qué es: Desconectados en B2-S2 (cursor:none global y grano infinito en toda ruta) y borrados después; HOME-CLASICO los deja afuera explícitamente.
- Referencias: src/app/layout.tsx · también en docs/bitacora-rediseno.md:1870 · también en docs/bitacora-rediseno.md:2379 · también en docs/bitacora-rediseno.md:2520 · también en docs/bitacora-rediseno.md:3656
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1286] Números de WhatsApp centralizados en src/lib/whatsapp.ts
- Fuente: `docs/bitacora-rediseno.md:1801` · tipo: hecho-declarado · estado declarado: hecho en redesign/home; verificar en main tras HOME-CLASICO · fecha: 2026-07-31
- Nodo(s): lib.transversal
- Qué es: 15 call-sites migrados (incluye /contact con getWhatsappDigits) y 6 que servían wa.me/undefined; HOME-CLASICO restauró Footer.tsx y PortalDemoCTA.tsx a la versión previa.
- Referencias: src/lib/whatsapp.ts · src/app/contact/page.tsx · también en docs/bitacora-rediseno.md:1628 · relacionado docs/bitacora-rediseno.md:3615
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1287] gray-on-color (contraste) diferido en portal y chatbot
- Fuente: `docs/bitacora-rediseno.md:2224` · tipo: pendiente · estado declarado: diferido · fecha: 2026-07-31
- Nodo(s): lib.transversal
- Qué es: El detector marca 56 casos de gris sobre color en src/; solo 3 caen en la superficie pública, el resto es portal y chatbot.
- Referencias: docs/impeccable-baseline.md · también en docs/bitacora-rediseno.md:2208
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1288] Calibración del design system (B1-S5)
- Fuente: `docs/bitacora-rediseno.md:2256` · tipo: hecho-declarado · estado declarado: hecho (T8 del 3D cerrado en B2-S4) · fecha: 2026-08-03
- Nodo(s): lib.transversal
- Qué es: Escala tipográfica re-elegida (--text-ds-subhead, medida en ch), acento por área, CTA sin canto con un solo press y borde 3:1, sombra por tema, capítulos 01–06, isChromeFreeRoute y NoiseOverlay borrado.
- Referencias: src/app/globals.css · src/components/ui/Button.tsx · src/components/layout/publicRoute.ts · DESIGN.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1289] Los acentos de servicio viven solo sobre lienzo oscuro
- Fuente: `docs/bitacora-rediseno.md:2309` · tipo: decision · estado declarado: vigente · fecha: 2026-08-03
- Nodo(s): lib.transversal
- Qué es: Tres de cuatro no llegan a 3:1 sobre crema; la distinguibilidad depende del área (se pinta el nombre del frente); sobre oscuro se aclara para subir contraste.
- Referencias: DESIGN.md · también en docs/bitacora-rediseno.md:2504 · también en docs/bitacora-rediseno.md:2511
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1290] Rutas sin chrome: CHROME_FREE_PREFIXES + isChromeFreeRoute()
- Fuente: `docs/bitacora-rediseno.md:2369` · tipo: decision · estado declarado: vigente · fecha: 2026-08-03
- Nodo(s): lib.transversal
- Qué es: Separado de isPortalRoute (que responde si es producto); /styleguide sin Navbar ni launcher; se conserva en HOME-CLASICO porque ChatWidgetMount lo necesita.
- Referencias: src/components/layout/publicRoute.ts · ChatWidgetMount.tsx · también en docs/bitacora-rediseno.md:3635
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1291] Clases cursor-none esconden el cursor sin reemplazo
- Fuente: `docs/bitacora-rediseno.md:2539` · tipo: pendiente · estado declarado: parcial · fecha: 2026-08-04
- Nodo(s): lib.transversal
- Qué es: Regresión de accesibilidad en elementos interactivos de Portfolio, About, CalculadoraAutomation, FlujoAutomation, PortfolioWebCases, LogicCompanion y ChatWindow:695; HOME-CLASICO dice que Franco limpió los de ChatWindow y LogicCompanion.
- Referencias: src/modules/chatbot/components/LogicCompanion.tsx · ChatWindow.tsx:695 · también en docs/bitacora-rediseno.md:3661
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1292] Techo de FCP/LCP: los 19 scripts async del <head>
- Fuente: `docs/bitacora-rediseno.md:3573` · tipo: pendiente · estado declarado: sin estado · fecha: 2026-08-07
- Nodo(s): lib.transversal
- Qué es: 1,1 MB raw / 356,5 KB gz con 1.078 ms de long tasks retrasan el primer paint; bajar LCP a menos de 2,5 s pide trabajar el bundle, no el hero.
- Referencias: también en docs/bitacora-rediseno.md:3292
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1293] Contenido crítico va en ds-rise, no en ds-reveal
- Fuente: `docs/bitacora-rediseno.md:3595` · tipo: decision · estado declarado: vigente · fecha: 2026-08-07
- Nodo(s): lib.transversal
- Qué es: Un ancestro en opacity 0 saca al h1 de la carrera de LCP; regla escrita en globals.css. Portfolio, PortalDemo, Nosotros, Servicios y Cierre todavía envuelven su titular en ds-reveal.
- Referencias: src/app/globals.css · src/components/layout/Hero.tsx · también en docs/bitacora-rediseno.md:3482
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1294] HOME-CLASICO: qué conserva la versión del rediseño
- Fuente: `docs/bitacora-rediseno.md:3633` · tipo: decision · estado declarado: vigente · fecha: 2026-08-12
- Nodo(s): lib.transversal
- Qué es: Se conservan publicRoute.ts (superset), PublicOnlyComponents, SmoothScroll, ChatWidgetMount, chromeReveal, useThemeObserver, MarketingIntro, ui/Button, lib/utils, design-tokens y globals.css (+322 ds-*); useChromeRevealed vuelve al viejo (espera phase 'done').
- Referencias: src/components/layout/publicRoute.ts · src/components/layout/PublicOnlyComponents.tsx · src/components/layout/SmoothScroll.tsx · src/components/layout/useChromeRevealed.ts · src/app/globals.css
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1295] B4.1 — Modelo Plan + seed lockeado + fallback Starter
- Fuente: `docs/bitacora-roadmap.md:1977` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-22
- Nodo(s): lib.transversal
- Qué es: Enums PlanKey/SupportTier, modelo Plan, Subscription.planId nullable (migración aditiva), seed idempotente de 3 planes, script de mapeo planName a planId y constante PLAN_FALLBACK; orgs fake sonrisa-norte y sigma-contable borradas en dev.
- Referencias: prisma/schema.prisma · prisma/migrations/20260522234313_add_plan_model/migration.sql · prisma/seeds/sync-plans.ts · prisma/seeds/migrate-subscriptions-to-plan-id.ts · src/lib/plan-fallback.ts
- Estado en código: **hecho** — 20260522234313_add_plan_model/migration.sql:2-40; prisma/seeds/sync-plans.ts:66-115; PLAN_FALLBACK en src/lib/plan/fallback.ts:44 (no en src/lib/plan-fallback.ts); migrate-subscriptions-to-plan-id.ts ya borrado (a6746085). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1296] B9.3 — Honestidad de datos demo
- Fuente: `docs/bitacora-roadmap.md:6152` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.transversal
- Qué es: SEO y Analytics ya tenían PreviewBanner condicional; se removieron del render la card 'Insights AI' placeholder y el milestone hardcodeado de /dashboard/project; 3 pendientes anotados en roadmap-pendientes.
- Referencias: src/app/(protected)/dashboard/project/page.tsx · src/modules/chatbot/components/dashboard/ChatbotOverview.tsx · src/components/dashboard/PreviewBanner.tsx · docs/roadmap-pendientes.md · docs/audits/2026-05-auditoria-profunda.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1297] Toda pantalla con datos mock usa PreviewBanner condicional
- Fuente: `docs/bitacora-roadmap.md:6180` · tipo: decision · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.transversal
- Qué es: Mismo componente que SEO y Analytics, condicionado a data.isMockData; ningún dato de ejemplo sin marca.
- Referencias: src/components/dashboard/PreviewBanner.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1298] B11.0 — Probe multi-tenant: mapa de fugas
- Fuente: `docs/bitacora-roadmap.md:6453` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.transversal
- Qué es: Inventario de 70 server actions y 33 API routes; C1 (tiendanube/callback pre-auth) y C2 (replyTicketAction post-auth) confirmados en runtime; fragilidades F1-F8 mapeadas y scope de B11.1-B11.3 definido.
- Referencias: src/app/api/auth/tiendanube/callback/route.ts · src/actions/ticket-actions.ts · src/app/api/auth/google-business/callback/route.ts · src/lib/actions/projects.ts · src/actions/agency-actions.ts · src/lib/actions/contact.ts +2
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1299] Notification.organizationId sigue nullable
- Fuente: `docs/bitacora-roadmap.md:6719` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): lib.transversal
- Qué es: Aplicar el mismo patrón NOT NULL + Cascade; no bloqueante.
- Referencias: prisma/schema.prisma
- Estado en código: **no empezado** — schema.prisma:721 'organizationId String?'; el cron os-follow-up crea notificaciones sin org como marcador de idempotencia (src/app/api/cron/os-follow-up/route.ts:276-286) (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1300] B11.2 — assertResourceBelongsToOrg + fixes C1, C2, F2, F5, F6
- Fuente: `docs/bitacora-roadmap.md:6727` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.transversal
- Qué es: Helpers assertTicketBelongsToOrg/assertProjectBelongsToOrg; tiendanube callback con auth + SUPER_ADMIN + audit y start solo SUPER_ADMIN; requireSuperAdmin en markLeadAsRead y en las 7 actions de projects.ts; rename a getGlobalBotsOverviewStats.
- Referencias: src/lib/auth/assert-ownership.ts · src/modules/chatbot/server/admin/getGlobalBotsOverviewStats.ts · src/app/api/auth/tiendanube/callback/route.ts · src/app/api/auth/tiendanube/start/route.ts · src/actions/ticket-actions.ts · src/actions/agency-actions.ts +6
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1301] B11.6 — BusinessMetric y PageView con organizationId
- Fuente: `docs/bitacora-roadmap.md:7070` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.transversal
- Qué es: Tablas vacías: clientId reemplazado por organizationId con FK Cascade; /api/track deriva la org de la sesión; health-score simplificado (cierra F8).
- Referencias: prisma/migrations/20260525192312_b11_6_clientid_to_organizationid/migration.sql · src/actions/metrics-actions.ts · src/app/api/track/route.ts · src/components/dashboard/LeakMeter.tsx · src/lib/health-score.ts · pendiente originado en docs/bitacora-roadmap.md:6497
- Estado en código: **hecho** — 20260525192312_b11_6_clientid_to_organizationid/migration.sql:20-37; src/app/api/track/route.ts:24-27 toma la org de la sesión (SUPER_ADMIN acepta organizationId del body). /api/track no tiene llamadores (git grep "api/track" en src y public = 0; control: '/api/admin/alerts/trigger-detector' aparece en AlertSettingsClient.tsx:89) y LeakMeter no tiene importadores. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1302] B11.3 — Re-probe de B11.0 (cierre del epic B11)
- Fuente: `docs/bitacora-roadmap.md:7187` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.transversal
- Qué es: C1 y C2 cerrados con evidencia runtime; F5, F6 y F8 cerrados; controles de regresión OK; F2, F3, F4 y F7 diferidos. Cuenta F1 como cerrado aunque solo re-probó el curl anónimo (ver notas).
- Referencias: src/app/api/auth/tiendanube/callback/route.ts · src/actions/ticket-actions.ts · src/actions/agency-actions.ts · src/app/api/track/route.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1303] B12.1 — Error boundaries + loading skeletons
- Fuente: `docs/bitacora-roadmap.md:7351` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.transversal
- Qué es: SectionErrorBoundary compartido que loguea con logger y no muestra mensajes técnicos; 5 error.tsx en dashboard y 4 nuevos en admin, AdminErrorBoundary refactorizado y app/error.tsx con logger; 8 loading.tsx nuevos.
- Referencias: src/components/ui/SectionErrorBoundary.tsx · src/components/ui/index.ts · src/app/(protected)/admin/_components/AdminErrorBoundary.tsx · src/app/error.tsx · src/app/(protected)/dashboard/error.tsx · src/app/(protected)/dashboard/loading.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1304] B12.6 — Smoke de flujos críticos + re-tag v0.9.0-rc.1
- Fuente: `docs/bitacora-roadmap.md:7654` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-25
- Nodo(s): lib.transversal
- Qué es: Smoke de 18 rutas y 2 endpoints contra build prod con sesiones QA; tag v1.0.0 local borrado y v0.9.0-rc.1 creado sobre 6c0cfef (solo local).
- Referencias: tag v0.9.0-rc.1 (commit 6c0cfef) · tag v1.0.0 (commit 1746e27, borrado local)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1305] Camino a v1.0.0
- Fuente: `docs/bitacora-roadmap.md:7744` · tipo: bloque · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): lib.transversal
- Qué es: Matsu en prod con v0.9.0-rc.1 durante un período acordado; si no rompe se tagea v1.0.0, si rompe fix + v0.9.0-rc.2.
- Referencias: tambien en docs/bitacora-roadmap.md:7767
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1306] Smoke runtime con browser de la protección de rutas post-upgrade
- Fuente: `docs/bitacora-roadmap.md:7934` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: Confirmar 307 a /login para anónimos en /admin y /dashboard y la separación SUPER_ADMIN / ORG_MEMBER (lo corre Franco).
- Referencias: src/app/(protected)/admin/layout.tsx · src/app/(protected)/dashboard/layout.tsx · tambien en docs/bitacora-roadmap.md:7962
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1307] SEC-AUTH-04: middleware/proxy global como defense-in-depth
- Fuente: `docs/bitacora-roadmap.md:8138` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: Reducir la superficie si un layout futuro olvida auth().
- Referencias: docs/auditoria-seguridad-2026-05.md · tambien en docs/bitacora-roadmap.md:8317
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1308] B-SEC.3b — state OAuth firmado con HMAC (Tiendanube + Google Business)
- Fuente: `docs/bitacora-roadmap.md:8145` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.transversal
- Qué es: Helper oauth-state.ts (orgId + nonce + expiración de 10 min, HMAC con scope); getAuthUrl firma y los callbacks verifican antes de tocar la DB; cierra SEC-AUTH-01/02 y el state-swap (F1 de B11.0).
- Referencias: src/lib/security/oauth-state.ts · src/lib/integrations/tiendanube.ts · src/app/api/auth/tiendanube/callback/route.ts · src/lib/integrations/google-business-profile.ts · src/app/api/auth/google-business/callback/route.ts · pendiente originado en docs/bitacora-roadmap.md:6490 +4
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1309] Sin anti-replay duro en el state OAuth
- Fuente: `docs/bitacora-roadmap.md:8180` · tipo: decision · estado declarado: hecho
- Nodo(s): lib.transversal
- Qué es: No se persisten nonces consumidos; el TTL de 10 min y el flujo SUPER_ADMIN-only acotan el riesgo.
- Referencias: src/lib/security/oauth-state.ts · tambien en docs/bitacora-roadmap.md:8253
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1310] Probar el state firmado en un flujo OAuth real (sandbox)
- Fuente: `docs/bitacora-roadmap.md:8284` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: Confirmar que Tiendanube y Google no truncan ni modifican el state y cubrir refresh o doble click durante el consent.
- Referencias: src/lib/security/oauth-state.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1311] B-SEC.3c — Verificación del cierre del state-swap de Google Business
- Fuente: `docs/bitacora-roadmap.md:8325` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.transversal
- Qué es: Report-only sin cambios de código; re-corre el probe 9/9, aclara que en B11.0 el hallazgo era F1 (no F3) y actualiza el checklist heredado de B-SEC.1.
- Referencias: src/app/api/auth/google-business/callback/route.ts:27-33 · C:/tmp/probe-oauth-state.mjs (fuera del repo)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1312] B13.1 — Tokens, BrandMark y sidebar/tabs/breadcrumb unificados
- Fuente: `docs/bitacora-roadmap.md:8409` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): lib.transversal
- Qué es: design-tokens con regla de color y colores por servicio, componente BrandMark nuevo, pill activo idéntico en ambos sidebars, Tabs único con API dual (href/value), breadcrumb en sentence case y barrido de 'Agency OS' / 'Logic Core' visibles.
- Referencias: src/lib/design-tokens.ts · src/components/brand/BrandMark.tsx · src/app/(protected)/admin/_components/admin-sidebar.tsx · src/components/dashboard/SidebarNav.tsx · src/components/ui/Tabs.tsx · src/components/ui/index.ts +5
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1313] Bloque B13: 'Profundizar es DEFINIR, no AGREGAR'
- Fuente: `docs/bitacora-roadmap.md:8411` · tipo: decision · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): lib.transversal
- Qué es: Visual puro: cero lógica, queries, auth o schema; quitar efectos antes que sumarlos.
- Referencias: tambien en docs/bitacora-roadmap.md:8506
- Estado en código: **hecho** — git log origin/main -- prisma/schema.prisma prisma/migrations | grep B13 → vacío; control: commits B13 existen (0ca56f34, bb4cf0d6, b0bc086a) (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1314] Kickers del header único: ¿uppercase o sentence case?
- Fuente: `docs/bitacora-roadmap.md:8503` · tipo: decision · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): lib.transversal
- Qué es: Decisión que afecta toda la app, a tomar en B13.2 al unificar el patrón kicker + H1 + subtitle.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1315] B13.2 — Aplicación de tokens + quick wins (inventario dentro del rango)
- Fuente: `docs/bitacora-roadmap.md:8585` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): lib.transversal
- Qué es: Inventario: bot demo 'CHATBOT' solo en la DB (slug chatbot, Empresa Demo, pausado), quick reply de Lucia con emoji en seed.ts:248, eyebrows 'Fila 1/2/3', KPIs con color decorativo, ColorPicker, eyebrows con la marca y MarkdownEditor sin highlight de placeholders. Los cambios aplicados se detallan después de la línea 8600 (fuera de este rango).
- Referencias: src/modules/chatbot/prisma/seed.ts:248 · src/app/(protected)/admin/page.tsx · src/modules/chatbot/components/admin/config/ColorPicker.tsx · src/modules/chatbot/components/admin/kb/MarkdownEditor.tsx
- Estado en código: **hecho** — src/modules/chatbot/prisma/seed.ts:217-219 quedan 3 quick replies y el 💰 no está (git grep -F vacío); MarkdownEditor.tsx:11 y :29 detectan placeholders; ColorPicker.tsx:60 h-6 w-6 (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1316] 109 eyebrows uppercase técnicos sin pasar a sentence case
- Fuente: `docs/bitacora-roadmap.md:8662` · tipo: decision · estado declarado: pendiente (decisión de Franco) · fecha: 2026-05-26
- Nodo(s): lib.transversal
- Qué es: Solo se corrigieron los 15 eyebrows con marca develOP; pasar el resto a sentence case es un sprint dedicado si Franco lo pide.
- Referencias: también en fuente:8680 · también en fuente:8920
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1317] Tokenizar 124 radios hardcodeados
- Fuente: `docs/bitacora-roadmap.md:8666` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): lib.transversal
- Qué es: 124 rounded-[28px]/[24px] en 30+ archivos; tokenizarlos a rounded-2xl/3xl es un sprint dedicado.
- Referencias: también en fuente:8682
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1318] 5 hallazgos P2 de seguridad real sin atender
- Fuente: `docs/bitacora-roadmap.md:8822` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): lib.transversal
- Qué es: SEC-LLM-04 (trimming prompt), SEC-LLM-07 (CAPTCHA capture_lead), SEC-LOGGING-01 (redacción PII), SEC-CACHE-01 (revalidateTag+TTL), SEC-DEP-04 (npm audit) → track de seguridad.
- Referencias: docs/auditoria-seguridad-2026-05.md · también en fuente:8873 · también en fuente:8922
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1319] Cierre del bloque B13 (design system)
- Fuente: `docs/bitacora-roadmap.md:8887` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): lib.transversal
- Qué es: B13.0-B13.5: BrandMark único, tabs/sidebar unificados, KPIs neutros, placeholders KB visibles, embed unificado.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1320] Verificar GBP OAuth y Search Console con credenciales reales
- Fuente: `docs/bitacora-roadmap.md:9002` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-26
- Nodo(s): lib.transversal
- Qué es: No se probó en runtime contra Google; confirmar callback OAuth de GBP y query de Search Console.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1321] B14.1 rate limiter persistente en Neon
- Fuente: `docs/bitacora-roadmap.md:9326` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-26
- Nodo(s): lib.transversal
- Qué es: Tabla rate_limit con UPSERT atómico; reemplaza al in-memory en 6 call sites.
- Referencias: prisma/migrations/20260526233939_add_rate_limit_b14_1 · src/lib/rate-limit/limiter.ts · src/lib/rate-limit/presets.ts · src/lib/security/auth-rate-limit.ts
- Estado en código: **hecho** — schema.prisma:1765-1777; src/lib/rate-limit/limiter.ts:46-54 UPSERT con ON CONFLICT; migración 20260526233939_add_rate_limit_b14_1 (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1322] B2 — Matsu vivo
- Fuente: `docs/bitacora-roadmap.md:9705` · tipo: bloque · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: Onboarding real (KB, admin, allowedDomains), embed + CORS real, activar plan/billing en BotConfig, notificaciones Sentry→Slack/email.
- Referencias: también en fuente:15621 (Matsu pinchó, cero tráfico)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1323] CC.1 auditoría de lo que configura el cliente
- Fuente: `docs/bitacora-roadmap.md:9756` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.transversal
- Qué es: Único tecnicismo en el dashboard: CRM (webhook n8n); KB y fromEmail dudosos.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1324] Hydration mismatch en TransitionContext/preloader
- Fuente: `docs/bitacora-roadmap.md:10021` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: Bloquea click-nav del sidebar en dev (prod OK según el doc); sprint propio.
- Referencias: src/context/TransitionContext.tsx · también en fuente:9973 · también en fuente:10354 · también en fuente:10797
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1325] B15 consolidación design system en el portal
- Fuente: `docs/bitacora-roadmap.md:10367` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-30
- Nodo(s): lib.transversal
- Qué es: Headers outliers alineados y stagger reveal en listas admin; intento V4 revertido.
- Referencias: f2f36af · 9628b80 · 47b6721 · e5702e3
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1326] Definir eyebrow canónico
- Fuente: `docs/bitacora-roadmap.md:10376` · tipo: decision · estado declarado: pendiente (decisión de Franco) · fecha: 2026-05-30
- Nodo(s): lib.transversal
- Qué es: El sistema se contradice (Eyebrow 0.24em vs PageHeader 0.28em semibold y dispersos); Franco define el valor.
- Referencias: src/lib/design-patterns.ts · también en fuente:10400
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1327] P1.A helper de fechas AR + averageTicketUsd
- Fuente: `docs/bitacora-roadmap.md:11057` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-06-30
- Nodo(s): lib.transversal
- Qué es: dates-ar.ts con rangos semana/mes y Organization.averageTicketUsd.
- Referencias: src/lib/dates-ar.ts · prisma/migrations/20260630032132_add_org_average_ticket_usd
- Estado en código: **hecho** — src/lib/dates-ar.ts existe; 20260630032132_add_org_average_ticket_usd/migration.sql:2; schema.prisma:409. (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1328] Cierre del bloque P5 motor comercial
- Fuente: `docs/bitacora-roadmap.md:11834` · tipo: hecho-declarado · estado declarado: hecho (verificación visual pendiente) · fecha: 2026-07-01
- Nodo(s): lib.transversal
- Qué es: Migraciones P5.3a/P5.4a aplicadas a mano; verificación visual del bloque pendiente.
- Estado en código: **hecho** — 20260701150307_add_panel_announcement y 20260701154505_add_referrals en main; schema.prisma:1792-1865 (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: no

#### [PLAN-1329] requireSuperAdmin() sin tipo de retorno explícito
- Fuente: `docs/bitacora-roadmap.md:11910` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: La inferencia cross-file colapsa por React.cache sobre auth; solución de raíz: anotar el tipo en auth-guards.ts.
- Referencias: src/lib/auth-guards.ts
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1330] Familia date-preset-filter divergente a propósito
- Fuente: `docs/bitacora-roadmap.md:12312` · tipo: decision · estado declarado: hecho
- Nodo(s): lib.transversal
- Qué es: 6 copias de filtro de fecha/período se mantienen separadas por diseño; no consolidar.
- Referencias: audit-period-filter.tsx · projects-period-dropdown.tsx
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1331] Tokens OAuth guardados en claro
- Fuente: `docs/bitacora-roadmap.md:12527` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: GBP, Tiendanube y Cal.com guardan tokens sin cifrar; sprint SEC dedicado.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1332] Badge 'Generado por IA'
- Fuente: `docs/roadmap-pendientes.md:72` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-05-25
- Nodo(s): lib.transversal
- Qué es: Disclaimer en AIExecutiveBrief e insights LLM; considerar DataOriginBadge demo|ai-generated|real-time.
- Referencias: AIExecutiveBrief · PreviewBanner
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1333] ui/EmptyState.tsx posible huérfano
- Fuente: `docs/sprints/alpha-0-6-cleanup-extended.md:21` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: Pendiente de decisión.
- Referencias: src/components/ui/EmptyState.tsx · docs/sprints/alpha-pre-cierre-RESUMEN.md:64
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1334] 9 specs E2E nuevos
- Fuente: `docs/sprints/alpha-0-8-tests-e2e.md:3` · tipo: hecho-declarado · estado declarado: hecho
- Nodo(s): lib.transversal
- Qué es: Specs 06 a 14 y tests/helpers/auth.ts; 7/21 pasan.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1335] Tests E2E rojos por login
- Fuente: `docs/sprints/alpha-0-8-tests-e2e.md:20` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: 14 fallan por selectores/timeout del login; luego 5/21 en Bloque C.
- Referencias: docs/sprints/alpha-0-9-status-verificacion.md:15 · docs/sprints/alpha-bloque-C-RESUMEN.md:30
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1336] Fase Alpha en 6 bloques
- Fuente: `docs/sprints/alpha-pre-cierre-RESUMEN.md:107` · tipo: bloque · estado declarado: planificado · fecha: 2026-05-17
- Nodo(s): lib.transversal
- Qué es: Alpha.1-21 en bloques A-F (alpha-bloque-A ... F); en docs/sprints solo está el resumen del bloque C.
- Referencias: alpha-bloque-A-admin-funcional.md · alpha-bloque-F-cierre.md
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1337] develOP v1.0 released
- Fuente: `docs/sprints/alpha-RESUMEN-FINAL.md:21` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05
- Nodo(s): lib.transversal
- Qué es: 22 specs E2E, design system, audit log, alertas, bulk, command palette, dashboard cliente en formato negocio, mobile, 5 workflows, changelog.
- Referencias: tambien en :92
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1338] Decisiones clave de Alpha
- Fuente: `docs/sprints/alpha-RESUMEN-FINAL.md:45` · tipo: decision · estado declarado: decidido · fecha: 2026-05
- Nodo(s): lib.transversal
- Qué es: agency-dashboard -> /admin/clients/[id] con tabs, alertas por cron, personalización limitada del cliente, E2E como estrategia principal sin unit tests.
- Referencias: tambien en :48-:50
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1339] Próximos pasos mayo-agosto
- Fuente: `docs/sprints/alpha-RESUMEN-FINAL.md:66` · tipo: promesa · estado declarado: pendiente · fecha: 2026-05
- Nodo(s): lib.transversal
- Qué es: Grabar demo (docs/demo-guion.md), activar primer cliente real, monitorear baseline; Beta: 8 features, widget embebible, reportes semanales AI.
- Referencias: tambien en :67, :68, :71-:73
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1340] Tokens OAuth y credenciales en claro
- Fuente: `docs/sprints/p3-a-1-gbp-connection.md:92` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: GBP, Tiendanube, Cal.com y credenciales de onboarding sin cifrar; sprint SEC dedicado (AES-GCM como CRM).
- Referencias: docs/roadmap-pendientes.md:175 (CO-7 + PD-1)
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1341] Commits delegados al humano
- Fuente: `docs/sprints/p3-a-1-gbp-connection.md:148` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: Varios sprints cierran con 'commitear cuando revises' (P3-A.1/A.2, P4.1, Q1.1, Q1.2, UTM.1).
- Referencias: docs/sprints/p3-a-2-venta.md:154, :229 · docs/sprints/p4-1-render-utm.md:124 · docs/sprints/q1-1-harness.md:99 · docs/sprints/utm-1-captura.md:259
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1342] B0.5 T6: mapeo de colores en CLAUDE.md
- Fuente: `docs/sprints/sprint-b05-sanidad-sitio.md:58` · tipo: bloque · estado declarado: plan
- Nodo(s): lib.transversal
- Qué es: web cyan, IA verde, automatización ámbar, software 'índigo/violeta'.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1343] StatCard frozen: typo y a11y
- Fuente: `raiz:lane-dashboard-log.md:65` · tipo: pendiente · estado declarado: pendiente de coordinación
- Nodo(s): lib.transversal
- Qué es: 'Requiere atencion' sin tilde, íconos sin aria, prop format sin uso, transition-[width].
- Referencias: src/components/ui/StatCard.tsx:126 · tambien en :86, :103, :176, :177
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1344] Skeleton animate-pulse sin motion-reduce
- Fuente: `raiz:lane-dashboard-log.md:104` · tipo: pendiente · estado declarado: pendiente de coordinación
- Nodo(s): lib.transversal
- Qué es: Componente compartido Skeleton.tsx.
- Referencias: tambien en :178
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1345] error.message al cliente en actions
- Fuente: `raiz:lane-LOG.md:153` · tipo: pendiente · estado declarado: pendiente
- Nodo(s): lib.transversal
- Qué es: Convención repo-wide; endurecer en commit aparte.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1346] Subir chartCardHoverCls a lib/hover.ts
- Fuente: `raiz:lane-resultados-redesign-log.md:131` · tipo: pendiente · estado declarado: pendiente · fecha: 2026-06-25
- Nodo(s): lib.transversal
- Qué es: Follow-up aditivo; hoy duplicado en results/_shared y LatencyChart.
- Referencias: tambien en :185
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1347] Portal fuera del rediseño
- Fuente: `raiz:PRODUCT.md:13` · tipo: decision · estado declarado: decidido
- Nodo(s): lib.transversal
- Qué es: Admin, dashboard, LeadOS y chatbot tienen lenguaje visual cerrado y no están en agenda de rediseño.
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1348] v1.0 funcional
- Fuente: `STATUS.md:18` · tipo: hecho-declarado · estado declarado: hecho (verificado 2026-05-21) · fecha: 2026-05-21
- Nodo(s): lib.transversal
- Qué es: Build pasa, 39/50 Playwright (3 fails de visual regression), onboarding sin SQL, alertas, reportes semanales, widget.
- Referencias: tag v1.0.0 · commit 7d551ba
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1349] AIExecutiveBrief con LLM real
- Fuente: `STATUS.md:47` · tipo: hecho-declarado · estado declarado: hecho · fecha: 2026-05-21
- Nodo(s): lib.transversal
- Qué es: Gemini 2.5 Flash vía Vercel AI SDK, cache 7 días, 3 regeneraciones/semana (migrado desde el SDK de Anthropic).
- Referencias: src/lib/ai/executive-brief.ts:229 · tambien en :226
- Estado en código: por cruzar
- ¿Sigue teniendo sentido?: por decidir en su dominio

#### [PLAN-1350] Visual regression: re-baseline o investigar
- Fuente: `STATUS.md:112` · tipo: decision · estado declarado: pendiente · fecha: 2026-05-21
- Nodo(s): lib.transversal
- Qué es: 3 fails de spec 22 (drift <2%) esperan decisión de Franco.
- Referencias: tambien en :237
- Estado en código: **no empezado** — tests/e2e/22-visual-regression.spec.ts sigue en el repo; la decisión de re-baseline no tiene rastro en código (D6-c1, lector D6-L1)
- ¿Sigue teniendo sentido?: decidir

#### [PLAN-1351] Limitaciones conocidas
- Fuente: `STATUS.md:203` · tipo: pendiente · estado declarado: abierta · fecha: 2026-05-21
- Nodo(s): lib.transversal
- Qué es: Cold start Neon ~1s, rate limiter in-memory por lambda, reportes por bot no consolidados, bulk sin cola, admin básico en mobile.
- Referencias: tambien en :204-:208
- Estado en código: **parcial** — El rate limiter ya es compartido en la base (src/lib/rate-limit/limiter.ts:25, :46-52; migración 20260526233939); el cold start sigue igual (src/lib/prisma.ts:5-6). (D6-c1, lector D6-L2)
- ¿Sigue teniendo sentido?: si

## Anexo — TODO/FIXME del código por nodo

- **h2.cli-bienvenida** (2): `src/app/bienvenida/_actions/complete-onboarding.ts:39`, `src/app/bienvenida/_actions/complete-onboarding.ts:40`
- **h2.cli-proyecto** (2): `src/app/(protected)/dashboard/project/page.tsx:40`, `src/app/(protected)/dashboard/project/page.tsx:211`
- **h2.cli-resultados** (3): `src/app/(protected)/dashboard/resultados/seo/page.tsx:234`, `src/app/(protected)/dashboard/resultados/trafico/page.tsx:113`, `src/components/dashboard/results/GBPMetricsCard.tsx:39`
- **h2.cli-servicios** (1): `src/lib/modules/motor-resenas-view.ts:31`
- **h3.adm-chatbots** (1): `src/app/(protected)/admin/chatbots/[botId]/actions.ts:101`
- **h3.vis-whatsapp** (1): `src/modules/motor/adapters/whatsapp/inbound/resolve-channel.ts:8`
- **h3.vis-widget-cliente** (1): `src/modules/chatbot/components/chat/StreamingMarkdown.tsx:73`
- **h4.adm-equipo** (3): `src/app/(protected)/admin/team/_actions/task.actions.ts:173`, `src/app/(protected)/admin/team/_components/member-workload.tsx:54`, `src/app/(protected)/admin/team/_components/member-workload.tsx:65`
- **h4.adm-proyectos** (6): `src/app/(protected)/admin/projects/[projectId]/page.tsx:171`, `src/app/(protected)/admin/projects/_components/task-form.tsx:249`, `src/app/(protected)/admin/projects/_components/task-list.tsx:74`, `src/app/(protected)/admin/projects/_components/task-list.tsx:81`, `src/app/(protected)/admin/projects/_components/task-list.tsx:92` +1
- **h4.adm-shell** (1): `src/app/(protected)/admin/_components/AdminErrorBoundary.tsx:15`
- **h5.adm-fg2lab** (1): `src/app/(protected)/admin/fg2-lab/_components/fg2-lab-client.tsx:159`
- **h5.set-dia** (4): `src/app/(protected)/setter/_actions/prospecto-bulk.actions.ts:127`, `src/app/(protected)/setter/_components/cartera-view.tsx:25`, `src/app/(protected)/setter/_components/cola-del-dia.tsx:43`, `src/app/(protected)/setter/_components/novedades-panel.tsx:152`
- **h5.set-lead** (2): `src/app/(protected)/setter/leads/[leadId]/_components/guia-retrabajo.tsx:37`, `src/app/(protected)/setter/leads/[leadId]/_components/lead-timeline.tsx:56`
- **h5.set-manual** (2): `src/app/(protected)/setter/leads/[leadId]/manual/_components/pantalla-manual.tsx:137`, `src/app/(protected)/setter/leads/[leadId]/manual/_data.ts:36`
- **lib.actions** (1): `src/actions/agency-actions.ts:44`
- **lib.chatbot.analysis** (1): `src/modules/chatbot/server/analysis/getMonthlyAnalysisForOrg.ts:4`
- **lib.chatbot.chat** (4): `src/modules/chatbot/server/chat/__tests__/stream-watchdog.invariant.ts:765`, `src/modules/chatbot/server/chat/persistTurn.ts:215`, `src/modules/chatbot/server/chat/reconcile.ts:451`, `src/modules/chatbot/server/chat/reconcile.ts:540`
- **lib.chatbot.evals** (1): `src/modules/chatbot/evals/cleanup.ts:4`
- **lib.chatbot.scoring** (1): `src/modules/chatbot/server/scoring/dqFilter.ts:9`
- **lib.componentes-dashboard** (4): `src/components/dashboard/ProjectTaskTabs.tsx:13`, `src/components/dashboard/ProjectTaskTabs.tsx:52`, `src/components/dashboard/ProjectTaskTabs.tsx:182`, `src/components/dashboard/ProjectTaskTabs.tsx:192`
- **lib.health-score** (1): `src/lib/health-score.ts:396`
- **lib.leados** (16): `src/lib/leados/cola.ts:8`, `src/lib/leados/contracts.ts:68`, `src/lib/leados/enlaces-manual.invariant.ts:14`, `src/lib/leados/foco.invariant.ts:17`, `src/lib/leados/gate-envio-demo.invariant.ts:74` +11
- **lib.plataforma.app-raiz** (1): `src/app/globals.css:205`
- **lib.prisma.seeds** (6): `prisma/seed-agency-os.ts:1163`, `prisma/seed-agency-os.ts:1260`, `prisma/seed-agency-os.ts:1343`, `prisma/seed.ts:332`, `prisma/seed.ts:339` +1
- **lib.sitio-publico** (4): `src/app/ai-implementations/page.tsx:217`, `src/components/ia/VaultIA.tsx:331`, `src/components/sections/home/OurServices.tsx:6530`, `src/components/sections/todo-incluido/TodoIncluido.tsx:289`

## Anexo — Observaciones de los extractores (sin verificar contra el código)

### `docs/bitacora-roadmap.md` (1-8600) — 232 ítems

- Rango asignado docs/bitacora-roadmap.md:1-8600 leído completo con Read (el archivo tiene 17161 líneas; el resto lo lee otro agente). La entrada B13.2 (L8585) continúa después de la línea 8600.
- Rutas en refs relativas a logic-core-v3/ salvo .claude/* (raíz del repo) y C:/tmp/* (fuera del repo). Duplicados unificados con 'tambien en docs/bitacora-roadmap.md:N'; pendientes que la propia bitácora cierra más adelante se registraron como 'pendiente originado en ...' dentro del hecho-declarado que los cierra.
- SECRET: docs/bitacora-roadmap.md:36 — valor completo de la key filtrada en enviroment.env (UUID; el doc dice que fue rotada, L50). Prefijos parciales de la misma key en L19 (comando git log -S) y L50.
- SECRET: docs/bitacora-roadmap.md:3001 — password en texto plano del usuario dev matsu-admin@dev.local.
- SECRET: docs/bitacora-roadmap.md:6375, :6376 y :6377 — passwords en texto plano de las cuentas seed super-admin, client-a y client-b (tabla de MS-8).
- SECRET: docs/bitacora-roadmap.md:7837 — password en texto plano del setter QA seed.
- No credencial pero identificador de infra: hostname del endpoint Neon dev (ep-…) en L64, L390, L544, L1097, L1150, L1983, L3663 (con y sin -pooler y sufijo de query), L6654, L6924, L7828, L7861, L7985 (db neondb); prefijo del host de prod en L1983.
- Contradicción script dev: B1.2 (L313) dice que dev pasó a --turbopack; B3.3 (L1369) dice que dev usa webpack por default; MS-7 (L5369) cita 'next dev --webpack' en package.json:7.
- Contradicción middleware: MS-8 (L6334) y B-SEC.2 (L7936) afirman que no hay middleware y que la protección es por layouts; B12.6 (L7682, L7687) reporta 307 'middleware'; B1 LeadOS (L7830, L7898) modifica src/proxy.ts (matcher /setter, ALWAYS_ALLOWED); SEC-AUTH-04 (L8138) pide un middleware global. Verificar si src/proxy.ts existía antes de LeadOS.
- Contradicción F1 (state-swap Google Business): B11.2 (L6822) lo deja sin tocar; B11.3 (L7210, L7257) lo cuenta como cerrado aunque solo re-probó el curl anónimo; recién B-SEC.3b (L8145) lo cierra. B-SEC.3b/3c lo llaman F3 (L8145, L8333) cuando en B11.0 F3 era /admin/messages (L6492).
- Contradicción F7 (/api/email/optout sin firma): B11.3 (L7241) lo deja pendiente para un sprint de HMAC; el checklist de B-SEC.3c (L8401) lo marca cerrado citando unsubscribe-token.ts, que pertenece al reporte ejecutivo (B6.2, L5095, ruta /api/email/unsubscribe-executive). En el rango no hay sprint que firme /api/email/optout/[contactId].
- Numeración inconsistente en el checklist de B-SEC.3c (L8398-L8400): F2 descrito como 'IDOR projects.ts' y F4 como 'agency-actions cross-projectId', cuando en B11.0 F2 era trust-the-layout de projects.ts, F4 la página de payments y agency-actions era F5.
- Contradicción clientId: B9.1 (L6013) dice que en /admin/clients/[clientId] el clientId es el orgSlug; B11.6 (L7163) dice que el valor que se pasa es Organization.id.
- IDs internos en URL: B5.6 (L3919) crea /dashboard/chatbot/leads/[id] con el id del lead; B6.3 (L5259) dice que 'los IDs de lead no van en URLs por política'; CLAUDE.md prohíbe exponer IDs internos en URLs; también /admin/chatbots/[botId] con cuid (L8544).
- Hosting ambiguo: Netlify aplica prisma migrate deploy (L2080, L2563) pero el cron del reporte semanal se registra en vercel.json (L5036, L5146); MS-8 guarda contra NETLIFY y VERCEL_ENV (L6351); B12.5 habla de que 'Vercel escala horizontalmente' (L7620).
- Sentry: B12.1 (L7433) habla de 'cuando B14 instale @sentry/nextjs', pero B1.2 (L307-L311) ya configuraba Sentry en instrumentation-client.ts y MS-7 (L5368) cita withSentryConfig en next.config.ts.
- Contra CLAUDE.md: B13.0 (L8562) decide no usar IntersectionObserver para el Canvas 3D del preview (CLAUDE.md lo exige en animaciones pesadas); MS-7 (L5370) diagnostica canvas con dpr [1,2] (CLAUDE.md: máximo [1,1.5]).
- Frozen: MS-6 (L4815) edita src/context/PreloaderContext.tsx (frozen 'no romper el flujo de fases'); B13.0 (L8526) trata LegacyNeuroAvatar como FROZEN aunque no figura en la tabla de frozen de CLAUDE.md.
- Orden de migraciones: la de B4.4 (20260522214201_drop_user_unlocked_features, L2557) tiene timestamp anterior a las de B4.1 (20260522234313, L1999) y B4.3 (20260523001750, L2317) aunque se creó después.
- B11.1 (L6593) corrige una afirmación heredada de B0.3: había 3 proyectos sin org, no 1.
- B8.5 (L5887) propone /admin/clients/[clientId]/chatbot/install, ruta que el catch-all de B9.1 (L6011-L6016) captura y redirige a overview.
- Estructura del doc: B-SEC.2 (L7771) queda partido por las entradas B1 y B2 de LeadOS (L7819-L7904) y sigue en L7906; los flags y pendientes de B1 LeadOS (L7895-L7904) aparecen después del contenido de B2 con numeración '### 3)' y '### 4)' duplicada.
- Sin entrada propia en el rango: B5.3 (B5.4 lo da por hecho en L3776, L3785, L3790), B3.4, B7.1-B7.3 (B7 aparece solo como visual-qa retroactivo en L5909), B10, B12.0, B12.2-B12.4, B-SEC.1 (auditoría docs/auditoria-seguridad-2026-05.md) y B14. B12.7 aparece antes que B12.1 y B13.0 después de B13.1.
- Sin fecha en el encabezado: B-SEC.2, B-SEC.3a, B-SEC.3b, B-SEC.3c y B1 LeadOS (sus migraciones son 20260526050401 y 20260611210802 respectivamente); B5.4-B5.7, MS-6, B6.x, MS-7, B7 y B9.x la tienen en el cuerpo.
- El probe ejecutable de B-SEC.3b/3c vive fuera del repo (C:/tmp/probe-oauth-state.mjs, L8241 y L8350); no es reproducible desde el repositorio.
- Muchos sprints cierran con 'verificación visual/manual pendiente de Franco'; se consolidaron en pocos ítems (L3897 para B5, L5820 widget mobile, L5927 B7, L7888 LeadOS).

### `_insumos/drive/Olme/Ideas de nuevas features.md` (1-73), `_insumos/drive/Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md` (1-92), `_insumos/drive/Olme/Chatbot_ registro de cambios.md` (1-122) y 27 más — 243 ítems

- Credenciales: ningún doc contiene un valor de secreto; un grep de patrones de API key, cadena de conexión, token y private_key no encontró nada. Solo aparecen nombres de variables y archivos: ONBOARDING_SECRET_KEY (registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:15), CRON_SECRET (ROADMAP-MEJORA-post-auditoria.md:13,15), RESEND_API_KEY (Operaciones/Chatbot_:44), DIRECT_URL (Operaciones/Chatbot_:168), y el token de Vercel Blob quitado del .env (Olme/Chatbot_:97). Relevante para E10: Cliente - Registro de cambios/General_:75 indica copiar .env.local y vertex-credentials.json a cada worktree nuevo, sin valor.
- Contradicción 1, onFinish: RB.3 (ROADMAP-MEJORA-post-auditoria.md:38) lo quiere transaccional con $transaction sobre mensaje, conversación y cuota; C3.4 (ROADMAP-CHATBOT-bloques-C.md:72) quiere paralelizar esos mismos 3 writes.
- Contradicción 2, /smoke: el roadmap de evolución lo pone en el carril inmediato T0.1 (ROADMAP-MEJORA:13; HANDOFF-cierre:28). Los bloques C lo excluyen como P-4 y lo mandan al carril de seguridad de Franco (ROADMAP-CHATBOT-bloques-C:21; HANDOFF-chatbot-arranque:29). /health va a seguridad en ambos.
- Contradicción 3, getLatencyHistory: DERIVACION-chat-panel:24 lo asigna al panel (las vistas admin son de ustedes), pero MH.1 del runtime también lo incluye (ROADMAP-MEJORA:23).
- Contradicción 4, Matsu: HANDOFF-cierre:9 dice que 'pinchó' y que la propuesta pasó a wishlist. HANDOFF-chatbot-arranque:6 y ROADMAP-CHATBOT-bloques-C:5 lo dan como primer cliente real entrando, y C2 como deuda comercial firmada. Por el contexto de la auditoría, hoy no hay clientes reales.
- Contradicción 5, modelo: ROADMAP-CHATBOT-bloques-C:62 asigna 'Fable · high' a C2.2; HANDOFF-cierre:13 y ROADMAP-MEJORA:4 dicen tope Opus 4.8 con Fable retirado.
- Contradicción 6, avatar: Olme/Chatbot_:97,119 declara decidido base64 en DB sin infra externa (Vercel Blob revertido). Cliente - Registro de cambios/Chatbot_:89 deja abierto el storage externo como decisión de infra.
- Contradicción 7, cerrar lead → cliente: Ideas:18 propone un FK OsLead→Organization o closedToOrgId. Cliente/Chatbot_:88 propone volver FK a ChatbotLead.convertedToOsLeadId, lo que choca con la decisión deliberada de que sea string suelto (Clientes_:60).
- Contradicción 8, runner de seeds: Inicio_:88 dice usar tsx, nunca ts-node (Node 24). Resultados_:31 usó npx ts-node --transpile-only porque tsx no estaba instalado.
- Tensión, aislamiento: la Auditoría III declara 0 rojos de aislamiento en el dominio chatbot (HANDOFF-cierre:28; ROADMAP-MEJORA:64). Inicio_:97 registra que el conteo de leads de Inicio y computeLeadsScore usan ContactSubmission sin organizationId, o sea datos de otros tenants mostrados al cliente.
- Solapamiento entre los dos roadmaps del runtime (ambos del 2026-07-06). C0.2/C1.2 ≈ RB.2 (historial y mensaje 51). C3.2 ≈ unique compuesto A1.2 (ROADMAP-MEJORA:45). C3.5/C3.1 ≈ MH.2 (conversaciones degradadas y cuota sin respuesta). C3.6 ≈ A5.2. C2.1 ≈ E1 (gaps de KB). C2.2 ≈ E3 (catálogo e inventario). C2.3 ≈ E0/E2 (memoria). Se dejaron como entradas separadas con referencias cruzadas ('ver ...').
- Resoluciones entre docs, sin verificar contra código. Pendiente de subir imagen del avatar (Operaciones/Chatbot_:154) → B4 3792ab8. Fuga de ZodError en updateSettings (Configuracion_:113) → 5e33733. Merge y pasada visual de Inteligencia (Inteligencia_:6,132) → Transversal:29-31. Botón volver (Soporte:84) → BackLink en soporte/[ticketId] (Portal General:21). Cyan del widget → parcial según Cliente/Chatbot:55-59. EmptyState con Lucide (Servicios:218) → migración a EmptyStateMuted (Portal General:45-48). El snapshot 'secciones sin trabajar' de General_:84,97-102 quedó desactualizado por las lanes posteriores.
- Estado de merge: varias lanes del portal cliente se declaran cerradas pero sin mergear a main: inicio, plan, project, services, resultados, cuenta, y los Bloques A/B de portal-pulido. También la rama b0-isolation-motor-chatbot (PD1-PA-CO5:81). Va como estado_declarado 'hecho (sin mergear)'; hay que cruzarlo con git.
- El paquete Drive de Franco que cita HANDOFF-cierre:19-26 (LEEME-PRIMERO, 00-INDICE, roadmap-macro v2.4, 11 hojas de bloque EV/UTM1/Q1/E1/R1/M1/EST/E0/E2/E3/E4, MICROSPRINTS-E5-E6, pendientes-delta-evolucion) no está en _insumos/drive/Franco: solo están Bloques a Ejecutar y Work Flow. Las entradas de esos bloques salen solo de menciones; su contenido detallado no está disponible. M1 casi no tiene descripción. Los docs del repo citados (docs/audit-chatbot-runtime.md, docs/roadmap-maestro.md, docs/roadmap-pendientes.md, docs/bitacora-roadmap.md) no se verificaron: fuera de alcance.
- Convenciones de extracción. En Ideas de nuevas features.md, las secciones 1-2 son tipo idea; la sección 3 (follow-ups), la 4 (deuda de consolidación, que el doc aclara que no son features) y la 5 (coordinación) son tipo pendiente, salvo 'stat cards del Audit log' que es decision. Para duplicados, la entrada principal va en la aparición más antigua por fecha del doc, excepto cuando el ítem es una idea de Ideas de nuevas features.md, que se ancla ahí. Las demás apariciones van en refs como 'tambien en <ruta sin _insumos/drive/>:linea'. En tipo decision, estado_declarado 'hecho' = decisión tomada y 'pendiente' = decisión abierta. 'Archivado' o 'diferido' se registran como pendiente con el matiz en la descripción. Los hechos se agruparon por sección o sprint, reuniendo sub-secciones cosméticas chicas.
- zona_franco se aplicó literalmente: true en ítems cuyo objeto es OsLead, LeadOS, setter o /admin/leados. Eso incluye el kanban /admin/leads (opera OsLead), Revisión Demos (OsLeadDossier), pipelineOrder, 'cerrar lead → cliente', el drift de la lane setter y la decisión de no-acople. La conversión ChatbotLead→OsLead (B2) se dejó en false porque es código del módulo chatbot. Los bloques CHATBOT y DASHBOARD de Franco no son zona franca. Este rango no cubre la carpeta OSLEAD.
- Promesas visibles al cliente para cruzar con la realidad: 'Próximamente Q3 2026' en los módulos coming-soon (Servicios_:175), ya vencida a 2026-10-13; 'Respondemos en < 4 hs, Lun–Vie 9–18' (Mensajes_:30); y la docstring 'GDPR-friendly', que el propio doc declara falsa (HANDOFF-cierre:58).

### `_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md` (1-959), `docs/roadmap-pendientes.md` (1-181), `STATUS.md` (1-334) y 27 más — 184 ítems

- SECRETS: STATUS.md:258 contraseña en texto plano de una cuenta seed admin; STATUS.md:259 contraseña en texto plano de una cuenta seed cliente (mock San Miguel). No se copiaron los valores.
- Identificadores de infraestructura (no son credenciales): hostname del pooler Neon dev en STATUS.md:86, STATUS.md:299 y _insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:452, :454.
- CONTRADICCIÓN sobre el acento de Software: raiz:PRODUCT.md:54 dice índigo; raiz:DESIGN.md:20/:125 dice violeta #8b5cf6 (Gate 1 cerrado: queda el token); docs/sprints/sprint-b05-sanidad-sitio.md:63 dice 'índigo/violeta'; CLAUDE.md dice Violet.
- CONTRADICCIÓN sobre glassmorphism: raiz:DESIGN.md:92/:211/:291 lo prohíbe en el sitio público y CLAUDE.md lo da como convención. En el portal: raiz:lane-LOG.md:107/:186 agrega backdrop-blur (KBValidation, KnowledgeBaseEditor) y raiz:lane-plan-log.md:25 lo usa como ancla admin, pero raiz:lane-resultados-redesign-log.md:273/:275 lo quita por considerarlo fuera del canon admin.
- CONTRADICCIÓN de motion: raiz:DESIGN.md:271 pide reveals de ~0.9s; CLAUDE.md fija la convención en 0.6s / y 20.
- Matsu: STATUS.md:177 dice que no existe en código ni DB (2026-05-21). raiz:lane-resultados-redesign-log.md:229 dice que el seed resolvió Matsu BUSINESS con bot en Neon dev (2026-06-25), y docs/sprints/q1-1-harness.md:31/:103 lo trata como bot de cliente real. STATUS.md está desactualizado.
- Widget: docs/sprints/alpha-RESUMEN-FINAL.md:72 pone 'Priorizar Widget embebible' como Beta, pero STATUS.md:21/:61 lo declara hecho en v1.0.
- 'Zero any': docs/sprints/alpha-RESUMEN-FINAL.md:41 declara 100% sin any, pero docs/sprints/alpha-1-reaudit.md:229 deja un 'as any' pendiente, raiz:lane-resultados-redesign-log.md:82 encuentra any en SessionsChart y raiz:lane-LOG.md:130 elimina un any en ConversationsTable.
- Estrategia de tests: docs/sprints/alpha-RESUMEN-FINAL.md:50 dice E2E como estrategia principal y sin unit tests; los sprints de julio usan *.invariant.ts con tsx como gate (infra-1:21, q1-2:32, p3-a-1:41).
- Rutas del chatbot admin: docs/sprints/alpha-0-cleanup.md:15-19 crea /admin/clients/[orgSlug]/chatbot/*; STATUS.md:216 las depreca a favor de /admin/chatbots; docs/roadmap-pendientes.md:26 igual propone una vista nueva bajo /admin/clients/[clientId]/chatbot/.
- Gate de build: CLAUDE.md exige npm run build; lanes y sprints declaran el build rojo por un baseline ajeno y lo excluyen como gate (raiz:lane-plan-log.md:32-33, p3-a-1:23, p3-a-2:102, raiz:lane-resultados-redesign-log.md:191). docs/sprints/utm-1-captura.md:223 dice que el build pasó con heap de 6144.
- Frozen: CLAUDE.md lista 4 archivos; los lanes congelan además components/ui/* (incluido StatCard), lib/plan/*, upsell.ts, lib/hover.ts, LatencyChart.tsx y tratan schema.prisma como FROZEN (raiz:lane-dashboard-log.md:12, raiz:lane-plan-log.md:15, raiz:lane-resultados-redesign-log.md:21, raiz:lane-LOG.md:33).
- Navegación en el portal: docs/sprints/p3-a-2-venta.md:190-192 usa window.location.assign() después del éxito, patrón que no está entre los que permite CLAUDE.md para portales.
- OSLEAD interno: PROMPT 2 (:298-318) declara correcto el gate del self-check y la auditoría H-04 (:737) lo marca como falso verde. Además, H-04 cuenta '4 criterios nuevos' (:741) y lista 5 (:737, igual que :241-:247).
- OSLEAD interno: el aire mobile es 56 px en el prompt de estética (:19, :72) y 48 px en el criterio 'Aire suficiente' (:260). Las transiciones son <0,5 s en la reconciliación (:20) y <0,3 s en el prompt 3 (:85).
- OSLEAD: la decisión de P43 (:26, un tilde) contradice decisiones-por-pantalla, que pide cinco tildes; la auditoría lo levanta como H-05. La tabla de :885-:899 recoge 11 contradicciones entre docs/decisiones-oslead-vii/ y el código.
- Nombre del DSN de Sentry: docs/sprints/alpha-0-7-baseline-observability.md:16 y alpha-pre-cierre:62 dicen SENTRY_DSN; docs/sprints/infra-1-observabilidad.md:18/:69 dicen NEXT_PUBLIC_SENTRY_DSN.
- Sprints que son planes y no registros (sin resultado declarado): docs/sprints/sprint-b0-bis-cierre.md y docs/sprints/sprint-b05-sanidad-sitio.md. Sus tareas van como tipo 'bloque'.
- docs/sprints/alpha-pre-cierre-RESUMEN.md:107-113 nombra alpha-bloque-A, B, D, E y F; en docs/sprints/ solo existe alpha-bloque-C-RESUMEN.md.
- Criterio zona_franco: además del doc OSLEAD (todo en true), marqué true lo que toca OsLead (raiz:lane-LOG.md:124 y :141, y docs/sprints/alpha-1-reaudit.md:227 sobre leads OS). Los KPIs comerciales de raiz:lane-dashboard-log.md leen OsLead/OsDemo pero quedaron en false como adm-dashboard.

### `docs/bitacora-beta-3.md` (5501-10981) — 103 ítems

- El archivo está en C:\auditoria-2026-10\logic-core-v3\docs\bitacora-beta-3.md (no en el docs/ de la raíz) y tiene 10.981 líneas. El rango asignado arranca dentro de C1b, cuyo encabezado está en la línea 5380, fuera del rango; su declaración de cierre (5799) se extrajo igual.
- Todo el rango es del Bloque 3 de LeadOS (el wizard y el panel del setter, carril de Franco), así que zona_franco=true salvo lo transversal o ajeno a LeadOS: lint, regla y runner de invariantes, envenenamiento del build por Tailwind, Modal y Select compartidos, schemas de fecha de admin/projects, admin/team y admin/leads, excludeDqWhere, helpers de fecha de admin y chatbot, client-monthly-report-pdf, helpers de test mixtos y los carriles del rediseño del home.
- Pendientes que el mismo rango declara cerrados más adelante: se plegaron dentro del hecho-declarado que los cierra, con refs del tipo 'cierra pendiente de docs/bitacora-beta-3.md:NNNN'. Casos: 5787→C2; 6175, 6181, 6277 y 6328→P8; 6726 y 6730→P4; 7038→P5; 7134, 7254 y 7562→P10; 7248 y 7252→P7; 7850→P11; 7980, 8000 y 8001→LA CORRIDA; 8334 y 8483→D15-bis; 9163→P17; 9693→P19; 10450→P22. Baches de la corrida: B1 y B2→CONFIGURACIÓN QUE FALTA y D15-bis, B4, B6 y B8→P19, B7→P21, B9→P23. La «corrida de comportamiento pendiente» (6740, 7860)→CORRIDA DE RECORRIDO.
- Numeración de sprints según la tabla de 7579-7584 y el resto del rango: P3 callejones, P4 municiones, P5 vocabulario, P6 datos-viajan, P7 quinta-superficie, P8 una-sola-fuente, P10 destinos, P11 helpers, D15-bis = P15, P16 a P23, y P25 = carrera de tildes. Inconsistencia: LA CONFIGURACIÓN QUE FALTA usa el worktree wt-p13-config (8305), pero D15-bis la llama P14 (8497, 8501).
- Contradicción de política de tests: V1-A-MAIN (6500-6505), EL ASCENSO (7625) y P11 (7878, 7980) no corrieron test:setter ni test:leados por la regla de cero escrituras en la base. LA CORRIDA (8082) dice que esa prohibición «era un error de redacción» y que las suites corren contra Neon dev desde P3 (CALLEJONES ya las corrió, 6708). La base de test dedicada sigue pendiente.
- Para cruzar con el código: QUINTA (7400) dice que una APROBADA con gate cerrado y toque vencido cae en «trabajar» (flow.ts:433), mientras que P23 (10769-10771) afirma que grupoPara manda la APROBADA con gate cerrado a seguimiento. Puede ser un cambio entre sprints o una descripción parcial.
- Herramientas sin URL (7034, 8479): tras D15-bis el evaluador ya no tiene pantalla que lo consuma, pero sigue en herramientas.ts y en el rail (8779, 9177). El pendiente de Franco quedó en parte obsoleto.
- Push a main: todos los sprints del rango declaran que no pushearon a main y EL TRONCO (10975) se lo deja a Franco. Sin embargo, la base auditada origin/main @ 57c421bc es, según el git log de este worktree, el commit «docs(tronco): EL TRONCO». Conviene verificar cuándo y cómo se movió main. En ese mismo log P22 = 1112b2b7 (el doc no da ese hash) y P23 = ea94dbf8 (coincide con 10895).
- Autocorrecciones dentro del rango: 7658 (son siete causas de espera, no seis); 7743 («Correcciones» sí era alcanzable, por un enlace genérico); 10223-10229 (citas archivo:línea de P20 corregidas); 10517 (la premisa de P22 era falsa: los íconos ya tenían nombre accesible); 10951-10952 (P25, commit d0b37c71, midió sobre el árbol equivocado: 63/25 pruebas contra las 187/33 de la punta).
- La segunda corrida del novato (8 baches, N1 a N8; 10649) se menciona pero este rango no la describe. N8 y «la revisión que sale a internet sola» (10862) no tienen detalle aquí; probablemente estén en el reporte de esa corrida (ver docs/corrida-recorrido-* u otra bitácora).
- La pasada perceptual de Franco (copy y estética), que se repite en casi todos los sprints, se unificó en un solo ítem (6738) con todas las líneas en refs. Las decisiones puntuales que trae cada lista de verificación humana se extrajeron por separado: propagar el avance por completitud, el nudge que frena el avance, las guías numeradas, la barra fija, la franja y el plegado del preview.
- Credenciales: no aparece ninguna (ni password, ni token, ni API key, ni cadena de conexión completa). docs/bitacora-beta-3.md:8086 trae en texto plano el host del endpoint de Neon dev, un fragmento de DATABASE_URL sin usuario ni password, y :8199 repite el id del endpoint; no se copiaron. :8088 lista solo nombres de variables de entorno, sin valores. 6549, 6919 y 10609 tienen emails de cuentas QA @develop.test, que no son secretos.

### `docs/bitacora-roadmap.md` (8601-17161) — 258 ítems

- SECRET: docs/bitacora-roadmap.md:10534 trae passwords de usuarios seed en texto plano (SUPER_ADMIN, cliente, setter). C.0 las movió a env vars en el código, pero la bitácora las sigue mostrando. No se copiaron.
- Identificador de infraestructura (no es credencial completa): las líneas 9491-9492 y 10535 traen el hostname del endpoint Neon. Contradicción: 9491 lo usa para derivar DIRECT_DATABASE_URL_PROD y 10535 lo llama 'host dev'.
- Seguridad: 15604, 15785, 16508 y 16678 dicen 'key de Vertex expuesta en logs, pendiente de rotación' (sin el valor). El usuario indicó no renovarla durante la corrida y seguir E10.
- Contradicción con CLAUDE.md: B0.2 (10611, 10788) fija la navegación del setter solo por triggerTransition(), que según CLAUDE.md no aplica en portales. P3-A.2 (12663) marca a PremiumModuleCard como violación de esa misma regla.
- Contradicción: BP.4 (9240-9242) declara que el build entra en el heap por defecto y quita el flag. P1.A (11110), P5.3 (11762), UTM.1 (12746) y PRIVACIDAD (16845) dicen que el build da OOM sin 6-8 GB.
- Contradicción: B13.5 (8905) dice que el literal 'Protocolo de consultoría' no existía. BLOQUE VOZ (16584) lo encuentra en ChatWindow.tsx.
- Contradicción interna EV: el cierre del bloque (11572-11576) describe EV.1, EV.2 y EV.4 distinto de sus propias entradas: EV.1 'cero runtime' en 10984, EV.3 '5 señales' en 10871 y las claves de intents usados en 10834.
- Compuerta incumplida: EV.4 (10858) exigía que Franco leyera los transcripts antes de EV.5, pero EV.5 se cerró (11465) con los smokes sin correr.
- El backfill de verticalPack cambia entre fuentes: EV.5 (11541) lo hace sobre sanmiguel, Q1.1 (12896) sobre matsu y D.1 (15656) sobre ambos. D.1 (15621) dice que Matsu 'pinchó, cero tráfico' y C0.1 (15520) que san-miguel es un fixture mock. Coincide con 'no hay clientes reales'.
- 10803 declara este archivo 'histórico' (la beta de LeadOS sigue en bitacora-beta.md), pero recibe entradas del chatbot y el panel hasta 2026-08-12.
- Diagnósticos que se contradicen en serie: STREAM-TIMEOUT F1/F2, WATCHDOG y PROVIDER-CLOSE culpan a Gemini por no cerrar el stream. DEADLOCK-FINISH-STEP (15120-15130) prueba que Gemini estaba sano y que el culpable era el transform propio de ONF-1 (commit 644b2b7, 2026-07-14). Además, DEADLINE-ONFINISH aparece como 'ONF-2' en 14393 y 14660.
- Contradicción con la regla 'cero any': D3' (12213) llama 'excepción sancionada' al any de generate-insights/route.ts:58, y H.2 (15907) lo quita.
- Repo público: B14.3 (9452-9456) y PRIVACIDAD (16772) apoyan decisiones en que el repo es público. El usuario indica que pasa a privado (DEC-34/R15 cerrados), así que esas restricciones quedan como contexto histórico.
- Sentry: B14.5 (9630) planea activarlo, pero INFRA.1 (13036) y PRIVACIDAD (16738) confirman que a 2026-08 no hay DSN en Netlify (inactivo en prod).
- Varias entradas no tienen fecha en el encabezado: quedaron con '' o con una fecha inferida de evidencia interna (ONF-1 = 2026-07-14 por 15167; UTM.1 por el smoke del 2026-07-04).
- El encabezado de B13.2 está antes de la línea 8601 (rango del otro agente); de esa sección solo extraje sus flags pendientes (8636-8684).
- El archivo termina en la línea 17161, dentro del BLOQUE CARRERAS (EN CURSO), sin cierre del bloque. Las líneas 16711-16801 tienen mojibake ('â€”').
- Muchos cierres llevan una 'verificación humana declarada' sin resolver. La marqué en estado_declarado de cada hecho-declarado en vez de crear ítems aparte.
- Los pendientes que una entrada posterior del mismo rango declara cerrados se unificaron en el hecho-declarado que los cierra (refs 'cierra pendiente fuente:N'): seed BotConfig client-a, 4 errores TS, computeTrend, Test email Resend, PII de show_whatsapp_handoff, hashes de IP/salt y demo-chat sin provider-close.

### `docs/bitacora-beta-3.md` (1-5500) — 152 ítems

- Ruta real: logic-core-v3/docs/bitacora-beta-3.md.
- Hay números de sprint repetidos con fechas distintas: 2.3, 3.1, 3.2, 4.1, 5.1, 5.3, 6.1 y 6.2 existen en dos tandas (jul-02..04 y jul-17..23). Hay que distinguirlos por fecha o línea.
- Contradicción: setter-nav.tsx:38 y L633 dicen que la navegación del setter con triggerTransition es «decisión cerrada · CLAUDE.md», pero CLAUDE.md no clasifica /setter (L1806, backlog C-26).
- Contradicción sobre el drift Prisma: L528 habla de 7 columnas físicas que el schema ya no declara; L554 dice que el schema sí las declara y era cliente stale; L560 lo sigue marcando como drift.
- Contradicción de QA: L95 recomienda navegar por 127.0.0.1; L836 dice que con 127.0.0.1 Next 16 dev no hidrata y hay que usar localhost.
- Contradicción: F3 (L4595) declara refutado B-P3 (la pantalla acompaña al dato), pero la corrida del 20/08 (L4779) captura m4 y m14 mostrando la instrucción anterior tras escribir.
- Contradicción: L1986 dice que el checkbox de m16 no tiene nombre accesible; L4003 dice que el label envolvente sí lo nombra. P1 (L2091) igual le agregó aria-label.
- Contradicción: L4776 dice que espera y revisión muestran el mismo encabezado; A3 (L4939) dice que las pantallas ya difieren y lo compartido es la capa de turno.
- La corrida de experiencia del 11/8 (L3958) midió 4dadd274, que no tiene la poda; F0 (L4058) lo explica.
- Conteos de lint dispares: ~101-104 errores (L778, L914, L1010), 11.381 (L2635), 212 problemas/102 errores (L5073) y 108.208 cuando no se ignoran los distDirs (L5258).
- C1b (L5413) corrige que el comentario de C1 sobre «type-stripping nativo» en ci.yml es incorrecto.
- Commits no registrados: 7.2 figura «Commit <pendiente>» (L1148); P7 y P9 cerraron sin commit (L3041, L3179) y P9 se commiteó luego como f06df31e (L3795).
- Secret: no se encontró ningún valor de credencial en 1-5500. L4807-4809 informa que un prefijo del password de la branch Neon dev quedó impreso en un log de sesión, sin el valor. L301 y L484 nombran el endpoint de la branch Neon dev (identificador, no credencial). L5308 y L5373 citan el comando gh secret set DATABASE_URL_TEST sin valor.
- El rango termina en L5500, dentro de C1b; el detalle de C1b (Fase 2) y las secciones siguientes (C2, V1-A-MAIN, etc.) los lee otro agente.

### `docs/bitacora-beta.md` (1-1750), `docs/bitacora-beta-2.md` (1-561), `docs/bitacora-rediseno.md` (1-3736) — 179 ítems

- Rutas reales: los tres documentos están en C:/auditoria-2026-10/logic-core-v3/docs/ (no en la raíz del repo).
- Contradicción de regla: docs/bitacora-beta.md:92 fija la navegación del rail del setter solo por triggerTransition(). El CLAUDE.md vigente pide <Link> en portales y dice que triggerTransition() no aplica fuera del sitio público; el doc no aclara si /setter cuenta como portal. El mismo doc navega con <Link>/.click() en el recorrido y en los atajos (:734, :779).
- Contradicción interna sobre el drift en docs/bitacora-beta.md: :470-511 lo da por cerrado (convertedToOsLeadId dropeada y verificada inexistente en :502). :1252 lo vuelve a listar como deuda abierta. :1271 dice que la migración 20260619140100 se registró con migrate resolve --applied sin ejecutar el SQL.
- Decisiones opuestas sobre las columnas Organization.avatar*/city/deletedAt/internalNotes, AgencySettings.singleton y chatbot_lead.convertedToOsLeadId. En docs/bitacora-beta.md:1274-1279 (FG-1.pre) Franco aprobó DROP. En :1746 se dice que la lane de clientes las usa y se propone adoptarlas con migración aditiva, a confirmar.
- Playwright y test:setter: docs/bitacora-beta.md:1735-1742 (fechado 2026-06-22) crea tests/setter/ y npm run test:setter y dice que el host bloquea los browsers. :1643-1651 y docs/bitacora-beta-2.md:54-62 (2026-06-25) dicen que Playwright NO está bloqueado y que NO existen test:setter ni specs del setter. bitacora-beta-2 repite 'no existe spec de /setter' (:314, :339, :462). La entrada del 06-22 está ubicada después de las del 06-25.
- docs/bitacora-beta-2.md:10 (Estado global) está desactualizado: dice 'Próximo: 2.3', pero 2.3, 2.4, 2.5 y el cierre del Bloque 2 ya están registrados (:440-561). La entrada 0.1 (:22-24) declara que se reconstruyó desde la memoria del proyecto y no tiene entrada en bitacora-beta.md.
- Varios ítems de bitacora-beta fueron reemplazados según bitacora-beta-2: 0.5.9 'Continuá donde dejaste', el recorrido de cola (?cola=) y los atajos j/k/r/b se borraron en 2.1a (docs/bitacora-beta-2.md:323, :445). El marcador de 5 StatCards de B0.3 se retiró (:478).
- Merges del rediseño: docs/bitacora-rediseno.md:569 decide cero merges a main hasta terminar el rediseño, y :2665/:2824/:3325 fijan un gate de merge por placeholders. Pero :3606-3611 (HOME-CLASICO) dice que el rediseño sí entró a main vía PR #4 y se revirtió restaurando archivos de 63a4e364. Los 'hecho' del rediseño (B2–B4, D9) pueden no estar en origin/main; por eso los hecho puramente del home público no se extrajeron.
- Corrección interna: docs/bitacora-rediseno.md:3312-3316 (B4-S3) atribuye el render delay del LCP al preloader; :3438-3442 (D9) lo corrige: la causa era animate-ds-reveal sobre el ancestro del h1.
- Riesgo cruzado: docs/bitacora-rediseno.md:133-135 planea eliminar src/lib/design-tokens.ts por estar 'desconectado del pipeline', y :141 limpiar --color-void. Según docs/bitacora-beta.md:52 y :221-222, el Modal (zIndex.modal) y el shell del setter consumen design-tokens.ts por style inline, y :230 dice que dossier-stepper usa var(--color-void).
- Heap del build: NODE_OPTIONS=--max-old-space-size=6144 en docs/bitacora-beta.md:1733 y docs/bitacora-rediseno.md:3699; 8192 en docs/bitacora-rediseno.md:1556.
- Documentos de sprint citados que no existen: docs/sprints/sprint-b1-sistema-diseno.md (docs/bitacora-rediseno.md:10, :504) y docs/sprints/sprint-b06-motion-bugs.md (:833).
- Secret: docs/bitacora-beta.md:15 contiene contraseñas literales de cuentas de seed (tipo password; valores no copiados).
- Identificadores sin credencial: docs/bitacora-beta.md:16, :334, :387, :472 y :508 nombran el host de la rama dev de Neon (endpoint parcial). docs/bitacora-rediseno.md:1628-1630 y :1817 listan números de WhatsApp hardcodeados (dato de contacto; no se copiaron).
- Criterio de zona_franco: todo lo de bitacora-beta y bitacora-beta-2 es LeadOS/setter (zona_franco=true), salvo infra, seeds generales, drift de columnas de clientes, e2e de admin/cliente, QA-login, el sender de Telegram y SectionErrorBoundary, que se marcaron false. Nada de bitacora-rediseno es ZONA-FRANCO.
