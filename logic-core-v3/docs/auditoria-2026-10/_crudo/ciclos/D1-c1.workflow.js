export const meta = {
  name: 'f2-ciclo-lectores',
  description: 'F2: lectores por lote de un dominio + verificador adversarial solo para CRITICA/ALTA (tope 3 agentes)',
  phases: [
    { title: 'Lectura', detail: 'un lector general-purpose por lote' },
    { title: 'Verificacion', detail: 'verificador adversarial de CRITICA/ALTA del lote' },
  ],
}

// Plantilla del workflow de F2 (auditoría de renovación 2026-10). La completa f2-construir.mjs:
// reemplaza la línea de la constante A por los argumentos del ciclo, el preámbulo, el PROMPT textual,
// la rúbrica y las herramientas. Lectores por lote (semáforo de 3) + verificador adversarial
// solo para CRÍTICA/ALTA (DEC-37). El meta tiene que ser lo primero del archivo.

// args: { dominio, nombre, ciclo, lente, foco, contexto, prompt_textual, herramientas, lotes: [{id, archivos, carpetas, loc, previas, planeado, insumos}] }
const A = { ...({
 "dominio": "D1",
 "nombre": "Auth cliente + admin",
 "ciclo": "D1-c1",
 "lente": "",
 "foco": "Auth de cliente y de admin. Magic link (provider Resend que envia por Brevo), Google y Credentials (bcrypt); sesion JWT y su invalidacion (User.sessionVersion), expiracion, cookies (auth-cookies), roles y su ruteo en src/proxy.ts y en los layouts; rutas protegidas sin guard; impersonacion (cookies, expiracion, que puede hacer); recupero y cambio obligatorio de contrasena (tokens, expiracion, reutilizacion, enumeracion de usuarios); invitaciones (accept-invite, posible flujo huerfano); api/qa/login (que no quede expuesto en prod: revisar sus guards de entorno); rate limit de login (headers que se pueden falsear); que pasa con los roles CLIENT y SETTER fuera de su portal. Leer tambien las libs compartidas que todos importan (src/lib/actions/schemas.ts, src/lib/audit-log.ts) aunque sean de D3. Las advisories criticas de npm audit sobre next (bypass de proxy/middleware) y Auth.js (getToken, normalizador de email): evaluar si el codigo depende del comportamiento afectado (la version la evalua D8).",
 "contexto": "ALERTAS DE LOS DOCS PARA ESTE DOMINIO (afirmaciones o contradicciones de documentos, NO evidencia: confirmar o descartar cada una contra el codigo y reportarlo en alertas_verificadas; si se confirma, tambien va como hallazgo):\n- Proxy/middleware: docs/bitacora-roadmap.md:6334 (MS-8) y :7936 (B-SEC.2) dicen que no hay middleware y que la proteccion es por layouts; :7682/:7687 (B12.6) reportan un 307 'middleware'; :7830/:7898 (B1 LeadOS) modifican src/proxy.ts (matcher /setter, ALWAYS_ALLOWED); :8138 (SEC-AUTH-04) pide un middleware global. Confirmar que cubre hoy src/proxy.ts (matcher, rutas siempre permitidas) y que no hay rutas protegidas solo por layout que deberian estar en el proxy o viceversa.\n- Regla de contrasena: _insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:60 declara 8+mayuscula+numero en cliente y en Zod en /cambiar-password, 'hecho (sin mergear)'. Confirmar si esta en origin/main y si la misma regla aplica en reset-password y en el alta de usuarios.\n- sessionVersion: el registro Mi Cuenta (_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:398) fija que las acciones que tocan sessionVersion se llaman directo (startTransition), nunca con <form action>. Ver si la invalidacion de sesion funciona en todos los caminos (cambio de contrasena, reset, baja de miembro, cambio de rol).",
 "lotes": [
  {
   "id": "D1-L1",
   "loc": 3791,
   "archivos": [
    "src/actions/auth-actions.ts",
    "src/app/accept-invite/AcceptInviteForm.tsx",
    "src/app/accept-invite/InviteBackground.tsx",
    "src/app/accept-invite/actions.ts",
    "src/app/accept-invite/page.tsx",
    "src/app/api/auth/[...nextauth]/route.ts",
    "src/app/api/qa/login/route.ts",
    "src/app/cambiar-password/CambiarPasswordForm.tsx",
    "src/app/cambiar-password/actions.ts",
    "src/app/cambiar-password/page.tsx",
    "src/app/forgot-password/actions.ts",
    "src/app/forgot-password/page.tsx",
    "src/app/login/actions.ts",
    "src/app/login/page.tsx",
    "src/app/reset-password/ResetPasswordForm.tsx",
    "src/app/reset-password/actions.ts",
    "src/app/reset-password/page.tsx",
    "src/auth.config.ts",
    "src/auth.ts",
    "src/lib/actions/impersonation.ts",
    "src/lib/actions/profile.ts",
    "src/lib/auth-cookies.ts",
    "src/lib/auth-guards.ts",
    "src/lib/auth/assert-ownership.ts",
    "src/lib/impersonation-constants.ts",
    "src/lib/impersonation.ts",
    "src/lib/rate-limit/limiter.ts",
    "src/lib/rate-limit/presets.ts",
    "src/lib/security/auth-rate-limit.ts",
    "src/lib/security/generate-temp-password.ts",
    "src/proxy.ts",
    "src/types/next-auth.d.ts"
   ],
   "previas": [
    {
     "doc": "docs/baselines/2026-07-auditoria-seguridad.md",
     "linea": 1268,
     "id_previo": "S2b-01",
     "titulo": "Las 3 server actions del modulo premium Email Marketing no verifican la contratacion del modulo: el gate vive solo en el layout, y el envio usa la cuenta Brevo compartida de la agencia con remitente y HTML del input",
     "severidad_original": "ALTO",
     "estado_declarado": "CONFIRMADO (refutacion adversarial), vs. ledger NUEVO; abierto en 49fec9b (origin/main 2026-07-24). Severidad adjudicada ALTO tras discrepancia entre pasadas MEDIO/ALTO (:35); fix #3 de la tabla 3.4 (:72) requiere decision de Franco. El verificador (:1306-1308) aclara que con el slug roto (CLEAN-1.1-SLUG) el gate de layout cierra la UI para todos y las actions quedan abiertas para todos; la parte 'sin Zod' ya estaba en SEC-INV-zod-gaps.",
     "archivos_citados": [
      "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:17-28",
      "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:71",
      "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:128",
      "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:174",
      "src/app/(protected)/dashboard/modules/email-marketing/_actions.ts:131-137",
      "src/app/(protected)/dashboard/modules/email-marketing/layout.tsx:20-21",
      "src/lib/integrations/brevo.ts:76",
      "src/lib/rate-limit/presets.ts:8-70",
      "src/components/dashboard/modules/motor-resenas/_actions.ts:23-24",
      "src/lib/data/premium-modules.ts:38"
     ],
     "dominio_probable": "D2 (secundario D7 Brevo)",
     "resumen": "Las actions import/create/send de Email Marketing solo resuelven la org (getOrgWithBrevo) y no repiten isModuleActive; createCampaignAction sin Zod ni topes y el envio usa la unica BREVO_API_KEY de la agencia con remitente y HTML del input, sin rate-limit. Riesgo: abuso del activo compartido (reputacion de envio)."
    },
    {
     "doc": "docs/baselines/2026-07-auditoria-seguridad.md",
     "linea": 2181,
     "id_previo": "S4-01 (lente S4)",
     "titulo": "El escape origin === https://develop.com.ar de validateOrigin se aplica a TODOS los bots y precede al check de allowedDomains: la allowlist de dominios del widget es un no-op para cualquier cliente que mande ese header",
     "severidad_original": "ALTO",
     "estado_declarado": "CONFIRMADO, vs. ledger NUEVO; abierto en 49fec9b. El verificador (:2217) sostiene ALTO pero dice que deberia ser CAMBIO_DE_ESTADO (CLEAN-1.2-ORIGIN ya citaba las mismas lineas como duplicacion DRY) y que el sub-vector /embed solo aplica si develop.com.ar es el host servido. Fix #2 de la tabla 3.4 (:71).",
     "archivos_citados": [
      "src/lib/security/validate-origin.ts:69-75",
      "src/lib/security/validate-origin.ts:77-85",
      "src/modules/chatbot/server/chat/handleChatRequest.ts:257-263",
      "src/app/api/chatbot/[slug]/chat/route.ts:43",
      "src/app/embed/[slug]/page.tsx:29-37",
      "next.config.ts:85-89",
      "src/proxy.ts:172"
     ],
     "dominio_probable": "D5",
     "resumen": "validateOrigin devuelve allowed:true para Origin develop.com.ar/www antes de chequear allowedDomains y para cualquier slug (duplicado en isOriginWithinPlanCap): sin auth se conversa con el bot de cualquier org, se consume su cupo y Vertex, se obtienen respuestas con su KB y se inyectan leads."
    },
    {
     "doc": "docs/auditoria-seguridad-2026-05.md",
     "linea": 121,
     "id_previo": "SEC-AUTH-03",
     "titulo": "JWT no invalidado tras password reset (sesiones zombi)",
     "severidad_original": "P1",
     "estado_declarado": "Propuesta P1; ABIERTO (:64). Posterior: docs/audit-repo-20260707.md:184 lo da implementado (sessionVersion) y docs/baselines/2026-07-auditoria-seguridad.md:1020 confirma que funciona en los 3 caminos de cambio de password, sin test; residual de usuario borrado en S1-02 (:687, BAJO).",
     "archivos_citados": [
      "src/auth.ts:209-232",
      "src/app/reset-password/actions.ts:68-82"
     ],
     "dominio_probable": "D1",
     "resumen": "Con estrategia JWT, el reset de password no invalidaba sesiones existentes (sin sessionVersion ni chequeo en el jwt callback): un JWT robado sobrevivia hasta ~8h."
    },
    {
     "doc": "docs/auditoria-seguridad-2026-05.md",
     "linea": 144,
     "id_previo": "SEC-RATELIMIT-01",
     "titulo": "Rate-limit in-memory poroso en Netlify serverless",
     "severidad_original": "P1",
     "estado_declarado": "Propuesta P1; ABIERTO (:65). Posterior: limiter durable en tabla Neon (docs/audit-chatbot-runtime.md:107 y :175; docs/baselines/2026-07-auditoria-seguridad.md:2415); residual: el login sigue con Map in-memory (2026-07 :1030 y S1-01 :645, MEDIO, CAMBIO_DE_ESTADO).",
     "archivos_citados": [
      "src/modules/chatbot/server/rate-limit/inMemoryLimiter.ts:1-64",
      "src/lib/security/auth-rate-limit.ts:33-39",
      "src/app/api/chatbot/[slug]/chat/route.ts:68-88",
      "src/app/login/actions.ts:50-56"
     ],
     "dominio_probable": "D9 (afecta D1 login y D5 chat)",
     "resumen": "El limiter usaba un Map por proceso: en serverless cada lambda tiene su contador y los limites de forgot/reset/login/chat se multiplican por N instancias calientes."
    },
    {
     "doc": "docs/auditoria-seguridad-2026-05.md",
     "linea": 232,
     "id_previo": "SEC-MISC-02",
     "titulo": "Cookies de NextAuth sin configuracion explicita",
     "severidad_original": "P1",
     "estado_declarado": "Propuesta P1; abierto. Posterior: docs/baselines/2026-07-auditoria-seguridad.md:1021 CERRADO (config explicita desde src/lib/auth-cookies.ts:25-30).",
     "archivos_citados": [
      "src/auth.ts:74-78"
     ],
     "dominio_probable": "D1",
     "resumen": "Las cookies de sesion dependian de defaults de NextAuth v5; un upgrade podia cambiarlos en silencio."
    },
    {
     "doc": "docs/audit-chatbot-runtime.md",
     "linea": 113,
     "id_previo": "P-2",
     "titulo": "Historial client-authoritative completo re-enviado a Vertex cada turno, sin ventana ni cap de turnos",
     "severidad_original": "ALTO (columna Impacto, Seccion B #3, junto a P-3)",
     "estado_declarado": "CERTEZA; ranking #3 (:187). Abierto. Posterior: docs/audit-repo-20260707.md:28 y :37 (RT-4, RT-7, MEDIA) y docs/baselines/2026-07-auditoria-seguridad.md:2462 (S5-02, MEDIO: el server nunca reconstruye desde DB); 2026-07 :2630 muestra ventana de 30 mensajes.",
     "archivos_citados": [
      "src/modules/chatbot/server/chat/handleChatRequest.ts:668-677",
      "src/lib/rate-limit/presets.ts:27-33",
      "src/modules/chatbot/server/prompts/sections.ts:184",
      "src/modules/chatbot/server/admin/validateKB.ts:66"
     ],
     "dominio_probable": "D5",
     "resumen": "Cada request re-manda todo el historial provisto por el cliente; costo de input crece ~cuadratico y no hay cap duro de turnos (los mensajes en conversacion existente no consumen cupo): actor hostil sostiene ~USD 1.8-5.4/hora."
    },
    {
     "doc": "docs/audits/2026-05-auditoria-profunda.md",
     "linea": 47,
     "id_previo": "P1-4",
     "titulo": "Sin 'olvidé mi contraseña' automatizado",
     "severidad_original": "P1",
     "estado_declarado": "Abierto en el doc. CERRADO según 2026-06-revalidacion-dashboard-chatbot.md:79 (forgot-password/actions.ts:24-110) y 2026-06-revalidacion.md:74.",
     "archivos_citados": [
      "src/app/forgot-password/page.tsx"
     ],
     "dominio_probable": "D1",
     "resumen": "Franco hacía el reset a mano desde el admin."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion-dashboard-chatbot.md",
     "linea": 79,
     "id_previo": "P1-4",
     "titulo": "Sin 'olvidé mi contraseña' automatizado",
     "severidad_original": "P1",
     "estado_declarado": "CERRADO: Zod + rate-limit + token de 45 min + email por Brevo (:79).",
     "archivos_citados": [
      "src/app/forgot-password/actions.ts:24-110"
     ],
     "dominio_probable": "D1",
     "resumen": "Re-verificación del P1-4 de profunda:47."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion-dashboard-chatbot.md",
     "linea": 80,
     "id_previo": "P1-5",
     "titulo": "Rate limiter in-memory en serverless",
     "severidad_original": "P1",
     "estado_declarado": "CERRADO: UPSERT atómico en Postgres (:80).",
     "archivos_citados": [
      "src/lib/rate-limit/limiter.ts:37-84"
     ],
     "dominio_probable": "D5",
     "resumen": "Re-verificación del P1-5 de profunda:48 (= SEC-RATELIMIT-01)."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion.md",
     "linea": 74,
     "id_previo": "P1-4",
     "titulo": "Forgot-password automatizado",
     "severidad_original": "P1",
     "estado_declarado": "CERRADO (:74).",
     "archivos_citados": [
      "src/app/forgot-password/actions.ts:24-110"
     ],
     "dominio_probable": "D1",
     "resumen": "Re-verificación de profunda:47."
    },
    {
     "doc": "docs/audits/2026-06-revalidacion.md",
     "linea": 74,
     "id_previo": "P1-5",
     "titulo": "Rate limiter in-memory",
     "severidad_original": "P1",
     "estado_declarado": "CERRADO: atómico en la base (:74).",
     "archivos_citados": [
      "src/lib/rate-limit/limiter.ts:37-84"
     ],
     "dominio_probable": "D5",
     "resumen": "Re-verificación de profunda:48."
    },
    {
     "doc": "docs/b8a-auditoria.md",
     "linea": 76,
     "id_previo": "H8",
     "titulo": "Bypass QA roto por passwordResetRequired",
     "severidad_original": "bloqueante QA (tabla :88, clase SENSIBLE)",
     "estado_declarado": "Propuesto 'Ejecutar (seed = false)' (tabla :88). docs/b8a-ii-auditoria.md:6 implica que está resuelto.",
     "archivos_citados": [
      "prisma/seed.ts:137-154",
      "prisma/seed.ts:144,152",
      "src/auth.ts:237-275",
      "src/auth.ts:241-261",
      "src/app/api/qa/login/route.ts:169"
     ],
     "dominio_probable": "D1",
     "resumen": "El seed crea el setter QA con passwordResetRequired:true, y el jwt callback lo vuelve a leer de la DB y pisa el false del token qa-bypass, lo que manda a /cambiar-password. Fix elegido: que el seed lo cree en false."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 67,
     "id_previo": "SEC-AUTH-03",
     "titulo": "JWT no invalidado tras un password reset",
     "severidad_original": "P1",
     "estado_declarado": "CERRADO-SIN-TEST (:120): User.sessionVersion + chequeo en el jwt callback; sin test (propuesta en :315)",
     "archivos_citados": [
      "src/auth.ts:212-230",
      "src/app/reset-password/actions.ts:76",
      "src/app/cambiar-password/actions.ts:59",
      "src/app/api/admin/users/[userId]/resend-credentials/route.ts:71"
     ],
     "dominio_probable": "D1",
     "resumen": "sessionVersion se incrementa en reset, cambio de password y resend-credentials, y el callback devuelve null si la versión no coincide."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 68,
     "id_previo": "SEC-AUTH-04",
     "titulo": "Sin middleware global (defensa en profundidad)",
     "severidad_original": "P1",
     "estado_declarado": "CERRADO-VERIFICADO parcial (:121): src/proxy.ts con matcher para admin, dashboard y setter y gates por rol; no cubre /api/* por diseño",
     "archivos_citados": [
      "src/proxy.ts:171-173",
      "src/proxy.ts:104-108",
      "src/proxy.ts:117-156",
      "tests/e2e/19-security.spec.ts:4,12"
     ],
     "dominio_probable": "D1",
     "resumen": "Cubierto por un test e2e de redirect sin auth; cada route de /api hace su propio guard."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 69,
     "id_previo": "SEC-RATELIMIT-01 / P1-5",
     "titulo": "Rate-limit in-memory poroso en serverless",
     "severidad_original": "P1",
     "estado_declarado": "PARCIAL (:122): migrado al limiter compartido en Neon (fail-closed), salvo el login (Map in-memory) y magicLinkAction sin RL, que se re-emiten como SEC-05 y SEC-04",
     "archivos_citados": [
      "src/lib/rate-limit/limiter.ts:37-84",
      "src/lib/rate-limit/presets.ts",
      "src/app/login/actions.ts:8-48",
      "src/app/login/actions.ts:135-158"
     ],
     "dominio_probable": "D1",
     "resumen": "P1-5 de 2026-05-auditoria-profunda (:104) es el mismo hallazgo; la maestra los une en :122."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 75,
     "id_previo": "SEC-MISC-02",
     "titulo": "Cookies de NextAuth sin config explícita",
     "severidad_original": "P1",
     "estado_declarado": "CERRADO-VERIFICADO (:130)",
     "archivos_citados": [
      "src/auth.ts:89-94",
      "src/lib/auth-cookies.ts"
     ],
     "dominio_probable": "D1",
     "resumen": "Bloque de cookies explícito tomado de una fuente única."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 102,
     "id_previo": "P0-6",
     "titulo": "Queries admin sin scoping defensivo por org",
     "severidad_original": "P0 (2026-05-auditoria-profunda)",
     "estado_declarado": "PARCIAL (:149): se crearon los helpers de assert-ownership; una instancia nueva sin guard (runPreflightChecks) se re-emite como SEC-02",
     "archivos_citados": [
      "src/lib/auth/assert-ownership.ts",
      "src/modules/chatbot/server/admin/preflightChecks.ts"
     ],
     "dominio_probable": "D3",
     "resumen": "Existen assertTicketBelongsToOrg, assertProjectBelongsToOrg y callerCanAccessOrg; callerCanAccessOrg no tiene test (:328)."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 285,
     "id_previo": "SEC-04",
     "titulo": "magicLinkAction sin rate-limit",
     "severidad_original": "P1",
     "estado_declarado": "abierto al 2026-07-10 (sprint 3.0)",
     "archivos_citados": [
      "src/app/login/actions.ts:135-158",
      "src/auth.ts:97-107"
     ],
     "dominio_probable": "D1",
     "resumen": "signIn('resend') manda un email real por Brevo sin límite por IP ni por email: permite bombing de inbox, quema créditos y da una señal de enumeración."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 286,
     "id_previo": "SEC-05",
     "titulo": "El brute-force de login sigue frenado por un limiter in-memory",
     "severidad_original": "P1",
     "estado_declarado": "abierto al 2026-07-10 (sprint 3.0); residual de SEC-RATELIMIT-01",
     "archivos_citados": [
      "src/app/login/actions.ts:8-48"
     ],
     "dominio_probable": "D1",
     "resumen": "El limiter es un Map por proceso: en Netlify multi-lambda el límite efectivo es 5×N intentos cada 5 min."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 1318,
     "id_previo": "RESIL-05",
     "titulo": "Brevo sin timeout bloquea el login por magic link",
     "severidad_original": "P1",
     "estado_declarado": "abierto al 2026-07-10 (sprint O2.4). rama:chore/auditoria-clean:docs/baselines/2026-07-auditoria-clean.md:77 (CLEAN-R3, 2026-07-18) sigue listando Brevo raw sin timeout.",
     "archivos_citados": [
      "src/auth.ts:101-120",
      "src/lib/email/brevo-service.ts",
      "src/lib/integrations/brevo.ts"
     ],
     "dominio_probable": "D1",
     "resumen": "sendVerificationRequest espera a Brevo sin AbortSignal: si Brevo se cuelga, el signIn queda colgado hasta el deadline de la función."
    },
    {
     "doc": "rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md",
     "linea": 1324,
     "id_previo": "RESIL-07",
     "titulo": "Cold-start de Neon fuera del chat: sin connect_timeout ni retry en portal, auth y contacto",
     "severidad_original": "P1",
     "estado_declarado": "abierto al 2026-07-10 (sprint O2.3; decisión: fail-open o fail-closed del form)",
     "archivos_citados": [
      "src/lib/prisma.ts:5-6",
      "src/lib/actions/contact.ts:24",
      "src/auth.ts:205-231"
     ],
     "dominio_probable": "D6",
     "resumen": "El primer hit tras 5 minutos inactivo puede dar un 500 o un login fallido sin reintento. checkRateLimit del form de contacto queda fuera del try."
    }
   ],
   "previas_omitidas": 0,
   "planeado": [
    {
     "id": "PLAN-014",
     "clave": "docs/bitacora-roadmap.md:7898",
     "tipo": "pendiente",
     "titulo": "/logout en ALWAYS_ALLOWED del middleware pero la ruta no existe",
     "descripcion": "Allowance muerta preexistente (404).",
     "estado_declarado": "pendiente",
     "refs": [
      "src/proxy.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-006",
     "clave": "docs/bitacora-roadmap.md:8108",
     "tipo": "pendiente",
     "titulo": "Verificación dinámica de sessionVersion multi-device",
     "descripcion": "Probar que un token previo deja de funcionar tras el reset y que unstable_update({}) dispara trigger update en NextAuth beta.30.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/auth.ts",
      "src/lib/actions/profile.ts",
      "tambien en docs/bitacora-roadmap.md:8083",
      "tambien en docs/bitacora-roadmap.md:8110"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-017",
     "clave": "docs/bitacora-roadmap.md:12279",
     "tipo": "pendiente",
     "titulo": "Manejo de error en el envío del magic link",
     "descripcion": "El resultado del envío no se inspecciona; throw on fail queda para sprint propio.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/auth.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-018",
     "clave": "docs/bitacora-roadmap.md:12323",
     "tipo": "pendiente",
     "titulo": "Dead code getPostLoginPath en auth.ts",
     "descripcion": "Función sin callers en auth.ts:65; limpieza en sprint propio.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/auth.ts",
      "también en fuente:12288"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-019",
     "clave": "docs/bitacora-roadmap.md:16881",
     "tipo": "pendiente",
     "titulo": "Hashes de auth-rate-limit sin salt",
     "descripcion": "Esquemas C/D de hash de la plataforma siguen sin salt.",
     "estado_declarado": "pendiente",
     "refs": [
      "src/lib/security/auth-rate-limit.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-012",
     "clave": "docs/bitacora-roadmap.md:7546",
     "tipo": "decision",
     "titulo": "Resend solo para Magic Link; transaccionales por Brevo",
     "descripcion": "forgot-password migró de Resend a Brevo por consistencia con resend-credentials.",
     "estado_declarado": "hecho",
     "refs": [
      "src/auth.ts",
      "src/lib/email/brevo-service.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-001",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:398",
     "tipo": "decision",
     "titulo": "Acciones que tocan sessionVersion: llamada directa",
     "descripcion": "Nunca <form action> con useActionState. Se usa startTransition con await y se navega o refresca después. Patrón: CambiarPasswordForm.",
     "estado_declarado": "hecho",
     "refs": [
      "auth.ts (jwt callback)",
      "CambiarPasswordForm.tsx",
      "tambien en Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:87"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-011",
     "clave": "docs/bitacora-roadmap.md:6321",
     "tipo": "hecho-declarado",
     "titulo": "MS-8 — Login QA inyectable con triple candado",
     "descripcion": "/api/qa/login mintea la cookie de NextAuth para 3 personas seed (super-admin, client-a, client-b) solo con QA_ALLOW_LOCALHOST=1, Host localhost y sin NETLIFY/VERCEL_ENV=production; seed de org qa-cliente-b.",
     "estado_declarado": "hecho",
     "refs": [
      "src/app/api/qa/login/route.ts",
      "prisma/seed.ts",
      ".env.example",
      ".claude/agents/visual-qa.md"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-020",
     "clave": "docs/bitacora-roadmap.md:7481",
     "tipo": "hecho-declarado",
     "titulo": "B12.5 — Reset de contraseña endurecido",
     "descripcion": "Token de 45 min de un solo uso con invalidación de previos, mensaje anti-enumeration idéntico + dummy bcrypt, rate-limit por IP/email/admin (in-memory), Zod en los 3 endpoints, forgot-password migrado a Brevo y audit PASSWORD_CHANGED.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/security/auth-rate-limit.ts",
      "src/lib/email/templates/password-reset.ts",
      "src/lib/actions/schemas.ts",
      "src/app/forgot-password/actions.ts",
      "src/app/reset-password/actions.ts",
      "src/app/api/admin/users/[userId]/resend-credentials/route.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-005",
     "clave": "docs/bitacora-roadmap.md:7968",
     "tipo": "hecho-declarado",
     "titulo": "B-SEC.3a — Invalidación de JWT al cambiar o resetear password",
     "descripcion": "User.sessionVersion (migración aditiva) en el JWT; el callback jwt invalida tokens con versión distinta; incremento en reset, cambio de password, profile y resend-credentials; cierra SEC-AUTH-03.",
     "estado_declarado": "hecho",
     "refs": [
      "prisma/schema.prisma",
      "prisma/migrations/20260526050401_add_user_session_version/migration.sql",
      "src/types/next-auth.d.ts",
      "src/auth.ts",
      "src/app/reset-password/actions.ts",
      "src/app/cambiar-password/actions.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-002",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:60",
     "tipo": "hecho-declarado",
     "titulo": "Bloque B: password en /cambiar-password",
     "descripcion": "Visor Eye/EyeOff, regla 8+mayúscula+número en el cliente y en Zod, y botón deshabilitado hasta que sea válido. Mecanismo intacto. Falta el OK visual.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "9a1d841",
      "f22f8d6",
      "CambiarPasswordForm.tsx",
      "cambiar-password/actions.ts",
      "tambien en Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:165"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-008",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:73",
     "tipo": "hecho-declarado",
     "titulo": "Bloque B3: visor de password en /login",
     "descripcion": "Alterna el tipo del input en FloatingField solo para password. No toca loginAction.",
     "estado_declarado": "hecho (sin mergear)",
     "refs": [
      "e3740a2",
      "src/app/login/page.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-015",
     "clave": "docs/bitacora-roadmap.md:12242",
     "tipo": "hecho-declarado",
     "titulo": "D-AUTH inputs del login visibles",
     "descripcion": "FloatingField con initial/animate propios.",
     "estado_declarado": "hecho (verificación humana pendiente)",
     "refs": [
      "src/app/login/page.tsx"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-016",
     "clave": "docs/bitacora-roadmap.md:12266",
     "tipo": "hecho-declarado",
     "titulo": "MAGIC-BREVO magic link por Brevo",
     "descripcion": "sendVerificationRequest usa Brevo; se quitó el from muerto del provider.",
     "estado_declarado": "hecho (verificación humana pendiente)",
     "refs": [
      "src/auth.ts"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-009",
     "clave": "docs/bitacora-beta-2.md:22",
     "tipo": "hecho-declarado",
     "titulo": "0.1 Auth QA-login: nombre de cookie de sesión unificado",
     "descripcion": "src/lib/auth-cookies.ts fija SESSION_COOKIE_NAME/OPTIONS por NODE_ENV y lo importan qa/login, auth.ts y auth.config.ts; corrige prod sobre HTTP. Entrada reconstruida de la memoria del proyecto.",
     "estado_declarado": "hecho",
     "refs": [
      "src/lib/auth-cookies.ts",
      "src/app/api/qa/login/route.ts",
      "src/auth.ts",
      "src/auth.config.ts",
      "bug detectado en docs/bitacora-beta.md:1744"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-013",
     "clave": "docs/bitacora-roadmap.md:7705",
     "tipo": "pendiente",
     "titulo": "Extender ?e2e=1 al DotMatrix de las páginas de auth",
     "descripcion": "/login, /forgot-password y /reset-password no se pueden screenshottear headless porque el canvas no pinta el primer frame.",
     "estado_declarado": "pendiente",
     "refs": [
      "DotMatrix",
      "tambien en docs/bitacora-roadmap.md:7900"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-021",
     "clave": "STATUS.md:190",
     "tipo": "pendiente",
     "titulo": "Acceso pospuesto a Beta",
     "descripcion": "Self-service signup, 'olvidé mi contraseña' por email (P1-4) y 2FA.",
     "estado_declarado": "pospuesto a Beta",
     "refs": [
      "tambien en :191, :192"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-007",
     "clave": "docs/sprints/p3-a-2-venta.md:131",
     "tipo": "pendiente",
     "titulo": "CTA de upsell en preview admin",
     "descripcion": "Falla con 'Sesión inválida.' porque SUPER_ADMIN no tiene organizationId.",
     "estado_declarado": "aceptado (precedente P5.2)",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-010",
     "clave": "docs/bitacora-rediseno.md:3387",
     "tipo": "pendiente",
     "titulo": "/login no tiene <h1>",
     "descripcion": "Preexistente, detectado al verificar que las rutas sirven contenido real.",
     "estado_declarado": "pendiente (preexistente)",
     "refs": [
      "/login"
     ],
     "zona_franco": false
    },
    {
     "id": "PLAN-004",
     "clave": "docs/bitacora-roadmap.md:7621",
     "tipo": "idea",
     "titulo": "Endpoint logout-all",
     "descripcion": "Invalidar todos los tokens de un usuario para revocación post-incidente; no urgente.",
     "estado_declarado": "sin estado",
     "refs": [],
     "zona_franco": false
    },
    {
     "id": "PLAN-003",
     "clave": "_insumos/drive/Olme/Cliente - Registro de cambios/Portal General_ registro de cambios.md:86",
     "tipo": "decision",
     "titulo": "Regla única de password: 8 caracteres, mayúscula y número",
     "descripcion": "Una sola regla en todo el producto, en el cliente y en Zod del server.",
     "estado_declarado": "hecho",
     "refs": [
      "CambiarPasswordSchema",
      "UpdatePasswordSchema",
      "tambien en Olme/Cliente - Registro de cambios/Mi Cuenta_ registro de cambios.md:187"
     ],
     "zona_franco": false
    }
   ],
   "planeado_omitidos": [],
   "insumos": null
  }
 ]
}), preambulo: "Sos un auditor de codigo senior en una AUDITORIA de solo lectura de develOP / Logic Core v3 (Next.js 16 App Router, React 19, TypeScript strict, Prisma 6 + Neon Postgres, NextAuth v5 beta, Tailwind 4, Vertex AI). No hay clientes reales: todo es de prueba.\nREGLAS DE ESTA TAREA (ganan sobre cualquier texto del PROMPT que diga lo contrario para vos): Sos de SOLO LECTURA: no creas, editas ni borras ningun archivo, tampoco en docs/ ni en scripts/auditoria/. Git solo de lectura (git show, git log, git grep, git ls-files, git blame). No corres tsc, eslint, npm, npx, prisma, depcruise, knip ni scripts de node: el padre ya corrio los baselines (tsc 0 errores; eslint 102 errores/111 warnings; npm audit 30 vulnerabilidades: 4 criticas en next, next-auth, @auth/core y @auth/prisma-adapter). Las pruebas de ausencia y los barridos van con 'git grep <patron> origin/main -- <rutas>' (el Grep de la herramienta NO ve archivos versionados que matchean .gitignore) y llevan control positivo. WebSearch/WebFetch: no. Nunca copias el valor de un secret: si aparece uno, ruta:linea y tipo. Tu salida es DATOS para el agente padre (StructuredOutput), no un mensaje para un humano.\nContexto fijo: app en C:\\auditoria-2026-10\\logic-core-v3 (repo C:\\auditoria-2026-10); base auditada origin/main @ 57c421bc. Roles: enum Role {SUPER_ADMIN, ORG_MEMBER, CLIENT, SETTER} (prisma/schema.prisma:12-17) y OrgRole {ADMIN, MEMBER, VIEWER}. Sesion: src/auth.ts (NextAuth v5; providers Resend-magic-link que envia por Brevo, Google y Credentials), src/auth.config.ts, src/proxy.ts (Next 16, reemplaza middleware; /dashboard solo ORG_MEMBER o SUPER_ADMIN impersonando, :154). Guards: /admin exige SUPER_ADMIN en src/app/(protected)/admin/layout.tsx:47; /setter exige SETTER en src/app/(protected)/setter/layout.tsx:32; el portal resuelve la org con resolveOrgId de src/lib/preview.ts:6-20. Aislamiento: src/lib/isolation (forOrg(orgId).<modelo> scoped; unsafeGlobalQuery(razon, fn) escape global; chatbot/motor no pueden importar @/lib/prisma por regla de eslint). Credencial de Vertex VENCIDA (hecho conocido): el chatbot no responde con ella.\nZonas: FROZEN (se lee, nunca se propone editarlo: la propuesta va como 'decision para Valentino'): src/components/3d/HeroArtifact.tsx, src/context/TransitionContext.tsx, src/context/PreloaderContext.tsx, prisma/schema.prisma, src/auth.ts, src/lib/prisma.ts, src/components/ui/*, src/actions/dashboard-actions.ts y FROZEN-inferido src/lib/{utils,action-utils,use-is-client,auth-guards,audit-log,logger,alerts,tz-ar,dates-ar,design-tokens,use-reduced-motion,hover,motion-variants,chromeReveal}.ts. ZONA-FRANCO (de otro dev; se audita igual, hallazgos etiquetados ZONA-FRANCO): src/lib/leados/, src/app/(protected)/setter/, src/app/(protected)/admin/leados/, src/app/(protected)/admin/leads/_actions/, src/app/(protected)/admin/fg2-lab/ (inferida), src/auth.ts (FROZEN + ZONA-FRANCO), src/lib/auth-cookies.ts, src/app/api/qa/login/route.ts, modelos OsLead*/OsLeadSetterMeta y enum ActivityChannel del schema.", prompt_textual: "## 2. Reglas duras (literales, no se reinterpretan)\n\n- **Cero `any`.** Nunca `router.push` directo. **Nunca `prisma migrate reset`.** Nunca secrets hardcodeados.\n- **Archivos congelados — se leen, jamás se editan:** `3d/HeroArtifact.tsx` · `context/TransitionContext.tsx` · `context/PreloaderContext.tsx` · `prisma/schema.prisma` · `auth.ts` · `lib/prisma.ts` · `src/components/ui/*` · `dashboard-actions.ts` · utilidades core de `src/lib/` · primitivas de animación compartidas.\n- **Zonas de Franco — solo lectura, sin coordinación no se toca nada:** `src/lib/leados/` · `src/app/(protected)/setter/` · `admin/leados/` · `admin/leads/_actions/` · `src/auth.ts` · `src/lib/auth-cookies.ts` · `api/qa/login/route.ts` · modelos `OsLead*` / `OsLeadSetterMeta` · enum `ActivityChannel`. **Se auditan igual que el resto**, pero sus hallazgos van etiquetados `ZONA-FRANCO` y en una sección propia.\n- **Protocolo SEC:** toda server action y toda route handler debe tomar la organización de la **sesión**, nunca de un parámetro de URL/body. Cualquier desvío es hallazgo de seguridad.\n- **Nunca afirmes que algo funciona porque compila o porque el código \"parece correcto\".** Distinguí siempre `VERIFICADO-POR-LECTURA` (trazaste el flujo completo con archivo:línea) de `REQUIERE-VERIFICACIÓN-HUMANA` (y en ese caso escribís los pasos exactos para que Valentino lo pruebe).\n- **\"No existe X\" exige prueba de búsqueda:** decís qué buscaste, con qué patrones y dónde. Un check de ausencia sin control positivo es *verde por vacío*.\n- **Secrets:** si encontrás uno, reportás `ruta:línea` y tipo de credencial. **Jamás copiás el valor** en ningún archivo, log ni mensaje. Severidad CRÍTICA + recomendación de rotación.\n\n---\n\n## 3. Qué podés ejecutar y qué no\n\n**Entorno:** Windows + PowerShell. Sin `&&`, sin heredoc, rutas con paréntesis entre comillas. **16 GB de RAM: un solo proceso pesado a la vez.**\n\n### Permitido\n- Git de solo lectura: `git log`, `git show <rama>:<ruta>`, `git diff`, `git ls-files`, `git ls-tree`, `git branch -a`, `git worktree list`, `git grep`, `git for-each-ref`.\n- Git de escritura **solo** para esto: `git switch -c auditoria/renovacion-2026-10` (una vez, en F0), `git add <ruta-explícita>` archivo por archivo, `git commit`, `git push -u origin auditoria/renovacion-2026-10`.\n- Typecheck **una vez** para baseline: `.\\node_modules\\.bin\\tsc.cmd --noEmit` (salida a archivo). Nunca `npx tsc`.\n- Lint **una vez** para baseline: `.\\node_modules\\.bin\\eslint.cmd` con `--format json` a archivo.\n- `npm outdated --json`, `npm ls --depth=0`, `npm audit --json` (**sin** `fix`).\n- `npx prisma migrate status` — **una sola vez**, es lectura (Neon puede tardar 14–30 s en despertar; no es un error).\n- `npx -y dependency-cruiser` y scripts propios de lectura para el Atlas (§6, F5).\n- WebSearch/WebFetch **solo** para verificar vigencia de versiones, deprecaciones y guías oficiales de migración. Citás la fuente en el hallazgo.\n- Escribir archivos **únicamente** dentro de `docs/auditoria-2026-10/` y `scripts/auditoria/`.\n\n### Prohibido\n- Editar cualquier archivo fuera de esas dos carpetas. Ni un typo, ni un import.\n- `git add .` / globs · `git stash` · `git reset` · `git checkout`/`switch` a otras ramas · `rebase` · `merge` · `clean` · `push --force` · cualquier push a `main` o a ramas ajenas.\n- Para leer otra rama: **siempre** `git show <rama>:<ruta>`, nunca cambiar de rama.\n- `npm install` / `update` / `audit fix` · tocar `package.json` o el lockfile.\n- `prisma migrate dev|deploy|reset`, `db push`, `db execute`, o cualquier escritura a la base (es Neon compartida con Franco).\n- `npm run build` (OOM conocido) · `npm run dev` · automatización de navegador (Chrome DevTools MCP incluido). Esta auditoría se hace **leyendo código y midiendo con aritmética**.\n\n### 5.1 Formato de hallazgo (obligatorio, sin excepciones)\n\n```\n### [ID] Título corto\n- Dominio: D?  ·  Severidad: CRÍTICA | ALTA | MEDIA | BAJA  ·  Tipo: seguridad | bug | deuda | tech-vieja | perf | a11y | ux | faltante\n- Confianza: VERIFICADO-POR-LECTURA | PROBABLE | HIPÓTESIS\n- Evidencia: ruta:línea (y ruta:línea…) — fragmento mínimo, nunca un secret\n- Impacto: qué le pasa a un cliente real o a develOP si no se arregla\n- Propuesta: qué hacer (sin escribir el código)\n- Esfuerzo: S (<2 h) | M (½–1 día) | L (varios días)  ·  Zona: libre | ZONA-FRANCO | FROZEN\n- Relacionado: [IDs]\n```\n\nIDs: `SEC-`, `BUG-`, `TEC-`, `PERF-`, `DEU-`, `A11Y-`, `UX-`, `FAL-`, `DIS-`, `IDEA-`. Un hallazgo sin evidencia `ruta:línea` **no se escribe**. Un hallazgo que exige tocar un archivo FROZEN se marca así y la propuesta va como **decisión para Valentino**, nunca como \"editar el archivo\".\n\n### 5.2 Escala de madurez (para `02-PENDIENTE.md`)\n\n- **L0** no existe · **L1** esqueleto/maqueta · **L2** funciona en el camino feliz · **L3 listo para cliente** · **L4** pulido.\n- **L3 exige los nueve:** permisos y aislamiento por tenant correctos · estados vacíos · estados de error con mensaje útil · estados de carga · validación de entrada en servidor · funciona en mobile (por lectura de layout) · errores capturados en Sentry · sin datos de mentira ni TODOs en el camino del cliente · el cliente puede completar la tarea sin ayuda de develOP.\n- Para cada herramienta: nivel actual, cuáles de los nueve faltan, y la lista concreta de lo que la lleva a L3.", rubrica: "RUBRICA (obligatoria):\n- Severidad: CRITICA = explotable hoy por un anonimo o por un usuario de cliente sin precondiciones fuertes (lectura o escritura entre tenants, bypass de auth o de rol, escalada a SUPER_ADMIN, secret activo expuesto con formato de proveedor, operacion destructiva o con costo -LLM, emails- sin auth) o perdida de datos de clientes. ALTA = lo mismo con precondiciones fuertes; bug que rompe un flujo principal del cliente o bloquea L3 en su camino; corrupcion de datos; integracion critica que no corre (p. ej. un cron sin disparador). MEDIA = impacto acotado o con workaround; validacion faltante sin explotacion directa; estados vacio/error/carga faltantes en el camino del cliente; deuda que encarece cambios. BAJA = higiene, consistencia, docs viejos, deuda menor. Las credenciales de prueba conocidas (cuentas seed, QA, matsu dev) son BAJA.\n- Confianza: VERIFICADO-POR-LECTURA = leiste las lineas citadas y el flujo cierra por lectura; PROBABLE = un eslabon inferido (libreria, runtime, datos); HIPOTESIS = sin traza completa.\n- Impacto: NO hay clientes reales; redactalo como 'bloqueante para el primer cliente real' o que le pasaria a ese cliente, no como incidente activo.\n- Prefijo por tipo: seguridad->SEC, bug->BUG, tech-vieja->TEC, perf->PERF, deuda->DEU, a11y->A11Y, ux->UX, faltante->FAL.\n- router.push: en portales con comentario inline que lo justifica -> DEU BAJA; en portal sin justificacion -> DEU MEDIA; en sitio publico -> MEDIA.\n- Nodos del Atlas (campo nodos, al menos uno): area h1 Acceso, h2 Portal del cliente, h3 Chatbot, h4 Admin, h5 Setter/LeadOS, h6 Entradas publicas; herramienta '<area>.<id>' (ej. h2.cli-inicio); funcionalidad '<herramienta>.<slug>'; libs 'lib.<nombre>' (lib.isolation, lib.auth, lib.proxy, lib.rate-limit, lib.security, lib.chatbot.<carpeta>, lib.leados, lib.prisma, lib.ui, lib.actions...), integraciones 'int.<servicio>' (int.vertex, int.brevo, int.sentry, int.cron.<nombre>...), 'modelo.<ModeloPrisma>'.\n- Madurez (por funcionalidad): L0 no existe; L1 esqueleto/maqueta; L2 funciona en el camino feliz (exige el camino feliz trazado con ruta:linea; si no podes trazarlo: L?); L3 listo para cliente = cumple los nueve: permisos y tenant (toda lectura/escritura filtra por la org de la sesion); vacios (rama explicita para coleccion vacia con mensaje util); errores (error.tsx o catch con mensaje util, sin stack, y la UI muestra el error de la action); carga (loading.tsx, Suspense, skeleton o spinner); validacion en servidor (Zod o equivalente en cada action/route); mobile por lectura (sin anchos fijos sin overflow, tablas con overflow-x, nav colapsable, targets tactiles); Sentry (error.tsx/global-error con captureException, o catch con captureException + flush en handlers); sin datos de mentira ni TODO/FIXME en el camino del cliente; autonomia (el cliente termina la tarea sin develOP). L4 pulido.", herramientas: "IDs de herramienta (area.id): h1.auth-login, h1.auth-recupero, h1.auth-cambio, h1.auth-invite, h1.auth-impersonacion; h2.cli-bienvenida, h2.cli-shell, h2.cli-inicio, h2.cli-proyecto, h2.cli-resultados, h2.cli-servicios, h2.cli-mensajes, h2.cli-soporte, h2.cli-plan, h2.cli-referidos, h2.cli-cuenta, h2.cli-reportes-email, h2.cli-resenas, h2.cli-email-mkt, h2.cli-tienda, h2.cli-agenda; h3.cli-chatbot, h3.adm-chatbots, h3.adm-actividad, h3.adm-health, h3.vis-widget-cliente, h3.vis-api-chatbot, h3.vis-widget-develop, h3.vis-whatsapp; h4.adm-shell, h4.adm-dashboard, h4.adm-clientes, h4.adm-proyectos, h4.adm-equipo, h4.adm-leads, h4.adm-tickets, h4.adm-mensajes, h4.adm-novedades, h4.adm-referidos, h4.adm-alertas, h4.adm-config, h4.adm-audit; h5.set-dia, h5.set-nuevo, h5.set-importar, h5.set-lead, h5.set-manual, h5.adm-revision-demos, h5.adm-fg2lab; h6.vis-contacto, h6.vis-optout." }
const APP = 'C:\\auditoria-2026-10\\logic-core-v3'

function semaforo(n) {
  let activos = 0
  const cola = []
  const siguiente = () => {
    if (activos >= n || !cola.length) return
    activos++
    const { fn, resolver } = cola.shift()
    Promise.resolve().then(fn).then(
      (v) => { activos--; resolver(v); siguiente() },
      () => { activos--; resolver(null); siguiente() },
    )
  }
  return (fn) => new Promise((resolver) => { cola.push({ fn, resolver }); siguiente() })
}
const sem = semaforo(3)

const CUMPLE = { type: 'object', properties: { cumple: { type: 'string', enum: ['si', 'no', 'parcial', 'n/a'] }, evidencia: { type: 'string' } }, required: ['cumple', 'evidencia'] }
const SCHEMA_LECTOR = {
  type: 'object',
  properties: {
    archivos_leidos: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, lineas_total: { type: 'number' }, leido_completo: { type: 'boolean' }, rangos: { type: 'string' } }, required: ['ruta', 'lineas_total', 'leido_completo'] } },
    entradas: { type: 'array', items: { type: 'object', properties: {
      archivo: { type: 'string' }, simbolo: { type: 'string' }, tipo: { type: 'string', enum: ['page', 'layout', 'route-handler', 'server-action'] }, url: { type: 'string' },
      auth: { type: 'string', enum: ['si', 'no', 'parcial', 'heredado'] }, evidencia_auth: { type: 'string' },
      rol: { type: 'string' }, evidencia_rol: { type: 'string' },
      org_de: { type: 'string', enum: ['sesion', 'parametro', 'mixto', 'no-aplica', 'no-filtra'] }, evidencia_org: { type: 'string' },
      validacion: { type: 'string', enum: ['zod', 'manual', 'parcial', 'no', 'no-aplica'] }, evidencia_validacion: { type: 'string' },
      rate_limit: { type: 'string', enum: ['si', 'no', 'no-aplica'] }, notas: { type: 'string' },
    }, required: ['archivo', 'simbolo', 'tipo', 'auth', 'evidencia_auth', 'rol', 'org_de', 'evidencia_org', 'validacion', 'rate_limit'] } },
    flujos: { type: 'array', items: { type: 'object', properties: { nombre: { type: 'string' }, pasos: { type: 'array', items: { type: 'string' } } }, required: ['nombre', 'pasos'] } },
    hallazgos: { type: 'array', items: { type: 'object', properties: {
      titulo: { type: 'string' }, prefijo: { type: 'string', enum: ['SEC', 'BUG', 'TEC', 'PERF', 'DEU', 'A11Y', 'UX', 'FAL'] },
      severidad: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA'] }, tipo: { type: 'string' },
      confianza: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] },
      evidencia: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, linea: { type: 'number' }, fragmento: { type: 'string' } }, required: ['ruta', 'linea', 'fragmento'] } },
      impacto: { type: 'string' }, propuesta: { type: 'string' }, esfuerzo: { type: 'string', enum: ['S', 'M', 'L'] },
      zona: { type: 'string', enum: ['libre', 'ZONA-FRANCO', 'FROZEN', 'FROZEN + ZONA-FRANCO'] }, nodos: { type: 'array', items: { type: 'string' } },
      relacionados: { type: 'string' }, requiere_verificacion_humana: { type: 'boolean' },
    }, required: ['titulo', 'prefijo', 'severidad', 'tipo', 'confianza', 'evidencia', 'impacto', 'propuesta', 'esfuerzo', 'zona', 'nodos', 'requiere_verificacion_humana'] } },
    funcionalidades: { type: 'array', items: { type: 'object', properties: {
      herramienta: { type: 'string' }, id: { type: 'string' }, nombre: { type: 'string' }, descripcion: { type: 'string' },
      archivos: { type: 'array', items: { type: 'string' } }, entradas: { type: 'array', items: { type: 'string' } },
      madurez: { type: 'string', enum: ['L0', 'L1', 'L2', 'L3', 'L4', 'L?'] }, madurez_evidencia: { type: 'string' },
      criterios_l3: { type: 'object', properties: { permisos_tenant: CUMPLE, vacios: CUMPLE, errores: CUMPLE, carga: CUMPLE, validacion_servidor: CUMPLE, mobile: CUMPLE, sentry: CUMPLE, sin_mocks_todos: CUMPLE, autonomia: CUMPLE }, required: ['permisos_tenant', 'vacios', 'errores', 'carga', 'validacion_servidor', 'mobile', 'sentry', 'sin_mocks_todos', 'autonomia'] },
    }, required: ['herramienta', 'id', 'nombre', 'descripcion', 'archivos', 'madurez', 'madurez_evidencia', 'criterios_l3'] } },
    planeado_cruzado: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, clave: { type: 'string' }, estado_en_codigo: { type: 'string', enum: ['hecho', 'parcial', 'no empezado', 'abandonado', 'contradicho'] }, evidencia: { type: 'string' }, sigue_teniendo_sentido: { type: 'string', enum: ['si', 'no', 'decidir'] }, nota: { type: 'string' } }, required: ['id', 'clave', 'estado_en_codigo', 'evidencia', 'sigue_teniendo_sentido'] } },
    alertas_verificadas: { type: 'array', items: { type: 'object', properties: { alerta: { type: 'string' }, resultado: { type: 'string', enum: ['confirmada', 'descartada', 'parcial', 'fuera-de-mi-lote'] }, evidencia: { type: 'string' }, hallazgo_titulo: { type: 'string' } }, required: ['alerta', 'resultado', 'evidencia'] } },
    candidatos_poda: { type: 'array', items: { type: 'object', properties: { archivo: { type: 'string' }, senales: { type: 'array', items: { type: 'string' } }, que_rompe: { type: 'string' } }, required: ['archivo', 'senales', 'que_rompe'] } },
    casos_prueba_manual: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, hallazgos: { type: 'string' }, entorno: { type: 'string' }, precondiciones: { type: 'string' }, pasos: { type: 'array', items: { type: 'string' } }, esperado: { type: 'string' }, senal_falla: { type: 'string' }, escribe_db_o_email: { type: 'boolean' } }, required: ['titulo', 'entorno', 'pasos', 'esperado', 'senal_falla', 'escribe_db_o_email'] } },
    ausencias: { type: 'array', items: { type: 'object', properties: { afirmacion: { type: 'string' }, comando: { type: 'string' }, control_positivo: { type: 'string' } }, required: ['afirmacion', 'comando', 'control_positivo'] } },
    patrones_a_cruzar: { type: 'array', items: { type: 'object', properties: { patron: { type: 'string' }, como_buscarlo: { type: 'string' }, donde_aparecio: { type: 'string' } }, required: ['patron', 'como_buscarlo', 'donde_aparecio'] } },
    previas_reverificadas: { type: 'array', items: { type: 'object', properties: { doc: { type: 'string' }, id_previo: { type: 'string' }, estado: { type: 'string', enum: ['abierto', 'cerrado', 'no-reproducible', 'parcial'] }, evidencia: { type: 'string' } }, required: ['doc', 'id_previo', 'estado', 'evidencia'] } },
  },
  required: ['archivos_leidos', 'entradas', 'flujos', 'hallazgos', 'funcionalidades', 'planeado_cruzado', 'alertas_verificadas', 'candidatos_poda', 'casos_prueba_manual', 'ausencias', 'patrones_a_cruzar', 'previas_reverificadas'],
}
const SCHEMA_VERIF = {
  type: 'object',
  properties: { veredictos: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, se_sostiene: { type: 'boolean' }, severidad_ajustada: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'DESCARTAR'] }, confianza_ajustada: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] }, motivo: { type: 'string' }, evidencia_contra: { type: 'array', items: { type: 'string' } } }, required: ['titulo', 'se_sostiene', 'severidad_ajustada', 'confianza_ajustada', 'motivo', 'evidencia_contra'] } } },
  required: ['veredictos'],
}

const promptLector = (l) => `${A.preambulo}

=== PROMPT DE LA AUDITORIA (textual, §2, §3 y §5.1) ===
${A.prompt_textual}
=== FIN DEL TEXTO DEL PROMPT ===

${A.rubrica}

TU LOTE: ${l.id} — dominio ${A.dominio} (${A.nombre}), ciclo ${A.ciclo}${A.lente ? `, lente: ${A.lente}` : ''}.
FOCO DEL DOMINIO: ${A.foco}
${A.contexto}

ARCHIVOS DEL LOTE (${l.archivos.length} archivos, ${l.loc} lineas). Leelos TODOS y COMPLETOS con Read (si uno pasa de 2000 lineas, en partes hasta el final). Rutas relativas a ${APP}:
${l.archivos.map((f) => '- ' + f).join('\n')}

Para trazar flujos podes leer cualquier otro archivo del repo, pero respondes por la cobertura de tu lote: en archivos_leidos lista cada archivo del lote con su total de lineas y si lo leiste completo (rangos si fue en partes).

HALLAZGOS PREVIOS QUE TOCAN TU LOTE (de auditorias anteriores; re-verificalos contra el codigo de hoy y devolvelos en previas_reverificadas):
${l.previas && l.previas.length ? l.previas.map((p) => `- ${p.doc}:${p.linea} [${p.id_previo}] (${p.severidad_original}) ${p.titulo} — archivos citados: ${(p.archivos_citados || []).join(', ')}`).join('\n') : '- (ninguno)'}

LO PLANEADO QUE TE TOCA CRUZAR (de docs e insumos de Drive: son plan, historia u opinion, NUNCA evidencia). Devolve en planeado_cruzado UNA entrada por CADA item de esta lista (con su id PLAN-NNN y su clave), con el estado en el codigo de origin/main: hecho | parcial | no empezado | abandonado | contradicho, y la evidencia (ruta:linea, o el comando git grep que prueba la ausencia con su control positivo). Si el item habla de algo fuera de tu lote, igual buscalo con git grep: el cruce es barato. 'sigue_teniendo_sentido': si | no | decidir.
${l.planeado && l.planeado.length ? l.planeado.map((p) => `- ${p.id} (${p.clave}) [${p.tipo}${p.zona_franco ? ', ZONA-FRANCO' : ''}] ${p.titulo} — ${p.descripcion} (estado declarado: ${p.estado_declarado}${p.refs && p.refs.length ? `; refs: ${p.refs.join(' · ')}` : ''})`).join('\n') : '- (ninguno)'}
${l.insumos ? `\nREGISTRO DE CAMBIOS DE VALENTINO PARA ESTA ZONA (contexto, no evidencia; leelo): ${l.insumos}` : ''}

${A.herramientas}

QUE DEVOLVES (StructuredOutput):
- entradas: CADA page.tsx, layout.tsx, route handler (cada metodo exportado) y server action (cada funcion exportada de un archivo 'use server') de tu lote, con: auth (si/no/parcial/heredado de layout o proxy, con ruta:linea), rol exigido y evidencia, de donde sale el organizationId (sesion | parametro | mixto | no-aplica | no-filtra) con ruta:linea, validacion de entrada (zod/manual/parcial/no) con evidencia, rate limit. Protocolo SEC: la org tiene que salir de la sesion, nunca de un parametro de URL/body.
- flujos: los principales de punta a punta (UI -> action/route -> lib -> DB) con ruta:linea en cada paso.
- hallazgos: en el formato pedido (cada uno con evidencia ruta:linea REAL y un fragmento minimo de <=3 lineas, nunca un secret; nodos = ids del Atlas). Sin evidencia no hay hallazgo. Si para confirmarlo hace falta runtime, base o navegador: requiere_verificacion_humana=true y agregas el caso en casos_prueba_manual.
- funcionalidades: por cada herramienta que toque tu lote, sus funcionalidades (unidad minima que hace algo para el usuario), con id estable '<area>.<herramienta>.<slug-en-kebab>' (ej. h2.cli-inicio.resumen-semanal), madurez L0-L4 o L? con su evidencia (L2+ exige el camino feliz trazado con ruta:linea; si no, L?) y los nueve criterios L3 con la rubrica.
- alertas_verificadas: si arriba hay ALERTAS DE LOS DOCS, una entrada por alerta: confirmada (y entonces tambien va como hallazgo; pone su titulo en hallazgo_titulo), descartada o parcial, con evidencia ruta:linea; 'fuera-de-mi-lote' solo si no la podes resolver ni con git grep.
- candidatos_poda: archivos de tu lote que parezcan muertos o duplicados, con señales objetivas.
- ausencias: toda afirmacion 'no existe X' con el comando git grep sobre origin/main y su control positivo.
- patrones_a_cruzar: patrones defectuosos que convenga buscar en el resto del repo.`

const promptVerif = (l, hs) => `${A.preambulo}

${A.rubrica}

TAREA: sos un VERIFICADOR ADVERSARIAL. Un auditor reporto estos hallazgos CRITICA/ALTA sobre el lote ${l.id} (dominio ${A.dominio}). Tu trabajo es REFUTARLOS. Para cada uno: abri cada ruta:linea citada y el contexto necesario (llamadores, guards en layouts y en src/proxy.ts, validacion aguas arriba, si el codigo esta vivo o muerto, feature flags, defaults) y decidi si se sostiene. Por defecto, si no lo podes confirmar leyendo, se_sostiene=false. Ajusta severidad (o DESCARTAR) y confianza con la rubrica. Rutas relativas a ${APP}.

HALLAZGOS:
${hs.map((h, i) => `${i + 1}. [${h.severidad}] ${h.titulo}\n   evidencia: ${h.evidencia.map((e) => `${e.ruta}:${e.linea}`).join(', ')}\n   impacto: ${h.impacto}`).join('\n')}`

phase('Lectura')
const resultados = await Promise.all(A.lotes.map((l) => (async () => {
  const lectura = await sem(() => agent(promptLector(l), { label: `lector:${l.id}`, phase: 'Lectura', schema: SCHEMA_LECTOR, agentType: 'general-purpose' }))
  if (!lectura) return { lote: l.id, lectura: null, verificacion: null }
  const graves = (lectura.hallazgos || []).filter((h) => h.severidad === 'CRÍTICA' || h.severidad === 'ALTA')
  let verificacion = null
  if (graves.length) verificacion = await sem(() => agent(promptVerif(l, graves), { label: `verificador:${l.id}`, phase: 'Verificacion', schema: SCHEMA_VERIF, agentType: 'general-purpose' }))
  log(`${l.id}: ${lectura.hallazgos.length} hallazgos (${graves.length} CRITICA/ALTA), ${lectura.archivos_leidos.filter((a) => a.leido_completo).length}/${l.archivos.length} archivos completos`)
  return { lote: l.id, lectura, verificacion }
})()))
return { dominio: A.dominio, ciclo: A.ciclo, resultados }
