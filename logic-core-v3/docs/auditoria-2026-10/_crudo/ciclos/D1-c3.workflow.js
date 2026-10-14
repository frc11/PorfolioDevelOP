export const meta = {
  name: 'f2-ciclo-cazadores',
  description: 'F2 ciclos 2-3: cazadores de huecos con lente por tramo + verificador adversarial solo para CRITICA/ALTA (tope 3 agentes)',
  phases: [
    { title: 'Caza', detail: 'un cazador general-purpose por tramo, con la lente del ciclo' },
    { title: 'Verificacion', detail: 'verificador adversarial de CRITICA/ALTA del tramo' },
  ],
}

// Plantilla de los ciclos 2 y 3 de F2 (auditoría de renovación 2026-10, DEC-26). La completa
// f2-construir.mjs igual que la de lectores. Un cazador por tramo de <= 16k LOC: el dominio ya
// se leyó completo en el ciclo 1; el cazador busca lo que se pasó con la lente del ciclo y
// recibe los títulos ya registrados para no repetirlos. El meta tiene que ser lo primero.

// args: { dominio, nombre, ciclo, lente, foco, contexto, lotes: [{id, archivos, loc, titulos_existentes, planeado, alertas_pendientes}] }
const A = { ...({
 "dominio": "D1",
 "nombre": "Auth cliente + admin",
 "ciclo": "D1-c3",
 "lente": "ERRORES, CARRERAS Y LIMITES. Por cada entrada del dominio y por las libs de sesion: manejo de errores (catch que se traga el error, mensajes internos o stack al cliente, errores que no llegan a Sentry o sin flush en serverless, ramas de error inalcanzables); atomicidad y transacciones (consumo de tokens de reset e invitacion, cambio de contrasena, creacion de usuarios, auditoria que se pierde si falla); carreras (doble submit, dos resets concurrentes, dos pestanas, contadores de rate limit no atomicos, unstable_update en paralelo); idempotencia; limites y tiempos (expiracion de tokens y de sesion, ventanas de rate limit, timeouts del SDK de Brevo, maxDuration de la funcion, cold start de Neon en cada auth()); estados de carga, vacio y error en las pantallas de auth (botones que quedan colgados, mensajes genericos, falta de reintento). Busca causas raiz distintas de los titulos ya registrados.",
 "foco": "Auth de cliente y de admin. Magic link (provider Resend que envia por Brevo), Google y Credentials (bcrypt); sesion JWT y su invalidacion (User.sessionVersion), expiracion, cookies (auth-cookies), roles y su ruteo en src/proxy.ts y en los layouts; rutas protegidas sin guard; impersonacion (cookies, expiracion, que puede hacer); recupero y cambio obligatorio de contrasena (tokens, expiracion, reutilizacion, enumeracion de usuarios); invitaciones (accept-invite, posible flujo huerfano); api/qa/login (que no quede expuesto en prod: revisar sus guards de entorno); rate limit de login (headers que se pueden falsear); que pasa con los roles CLIENT y SETTER fuera de su portal. Leer tambien las libs compartidas que todos importan (src/lib/actions/schemas.ts, src/lib/audit-log.ts) aunque sean de D3. Las advisories criticas de npm audit sobre next (bypass de proxy/middleware) y Auth.js (getToken, normalizador de email): evaluar si el codigo depende del comportamiento afectado (la version la evalua D8).",
 "contexto": "",
 "lotes": [
  {
   "id": "D1-T1",
   "loc": 3791,
   "lotes_origen": [
    "D1-L1"
   ],
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
   "titulos_existentes": [
    "SEC-002 Email y contraseña de las cuentas del seed (SUPER_ADMIN y cliente) escritos en el repo",
    "SEC-005 Magic link sin rate limit: un anonimo dispara emails ilimitados por Brevo a cualquier cuenta registrada",
    "SEC-006 La invalidacion por sessionVersion se revive con POST /api/auth/session (trigger 'update' saltea el chequeo)",
    "BUG-001 Sesion invalidada en Node pero viva en el proxy: bucle /login <-> portal (ERR_TOO_MANY_REDIRECTS)",
    "SEC-007 Fuerza bruta de login sin freno real: el limite vive solo en loginAction (memoria por lambda) y el endpoint nativo de Credentials no tiene ninguno",
    "BUG-002 El alta de cliente guarda el email tal cual se tipeo: con una mayuscula el cliente no puede entrar por ningun metodo",
    "SEC-008 trustHost fijo en true: si falta AUTH_URL/NEXTAUTH_URL en producción, el host del magic link sale de X-Forwarded-Host",
    "SEC-009 Enumeracion de usuarios: el magic link responde distinto si el email existe (y el login/forgot delatan por tiempo y por 'error inesperado')",
    "SEC-010 La sesion vive 30 dias deslizantes, no 8 h: el proxy re-firma la cookie con el maxAge por defecto de Auth.js",
    "UX-001 El exito del magic link le dice al cliente que el link 'fue impreso en la consola del servidor'",
    "BUG-003 El envio del magic link nunca falla: sendVerificationRequest ignora el resultado de Brevo y la UI muestra exito",
    "UX-002 'Continuar con Google' no puede completar para ningun usuario y /login no muestra ningun ?error",
    "SEC-011 Open redirect en el proxy: callbackUrl con barra invertida o tab pasa isSafeCallbackUrl",
    "SEC-012 La regla unica de contrasena (8+mayuscula+numero) no se aplica en reset-password ni en accept-invite",
    "SEC-013 Tokens de reset e invitacion guardados en claro; consumo no atomico y los demas tokens siguen vivos tras el reset",
    "SEC-014 Archivar un cliente no le corta el acceso: login, sesion y portal siguen operativos",
    "SEC-015 Cambio de contrasena sin limite de intentos sobre la contrasena actual",
    "A11Y-001 Paginas de auth: /login sin h1, texto por debajo de AA, errores sin anunciar y visor de contrasena fuera del teclado",
    "SEC-016 profile.ts: WhatsApp sin validacion y mensajes internos de Prisma devueltos al cliente",
    "DEU-001 Flujo de invitacion huerfano: ninguna action viva emite links a /accept-invite (y la de clientes nunca los enviaba)",
    "SEC-017 passwordResetRequired solo se impone en el proxy; ALWAYS_ALLOWED tiene entradas muertas y getLegacyAdminRedirectPath nunca redirige",
    "DEU-002 auth.ts: codigo muerto y estado sin usar (getPostLoginPath, userExists): un usuario borrado conserva sesion ORG_MEMBER",
    "BUG-004 El rol CLIENT existe en el enum pero el proxy lo expulsa de /dashboard: un usuario CLIENT queda en bucle",
    "SEC-018 OrgRole (ADMIN/MEMBER/VIEWER) viaja en la sesion pero ningun guard lo lee",
    "BUG-005 Org primaria no deterministica: orgMemberships take:1 sin orderBy en cada auth()",
    "SEC-019 Contrasena temporal de 8 caracteres con estructura fija (~34 bits) y sin vencimiento",
    "SEC-020 Impersonacion: secreto de respaldo literal, misma clave que AUTH_SECRET, cookie que sobrevive al logout y politica de escritura sin definir",
    "SEC-021 /api/qa/login revela en el 403 cual guarda fallo",
    "SEC-022 Hashes de rate limit sin sal: IP y email recuperables por fuerza bruta",
    "UX-003 Cambio forzado sin salida si el cliente no tiene la temporal, y copy de 'forzado' tambien en cambio voluntario",
    "DEU-003 router.push en CambiarPasswordForm (justificado inline) con destino fijo /dashboard",
    "DEU-004 Fondo de auth copiado en 4 paginas y /login de 511 lineas con estilos inline",
    "SEC-023 Las páginas de /admin exigen SUPER_ADMIN solo en el layout y en el proxy: un token invalidado, degradado o de un admin borrado sigue leyendo datos de todos los clientes por navegación RSC",
    "SEC-024 /api/qa/login confía en el header Host y los scripts QA escuchan en toda la red: cualquiera en la misma LAN obtiene una sesión SUPER_ADMIN",
    "SEC-025 Los límites por IP de forgot-password, reset-password y el formulario de contacto se esquivan rotando X-Forwarded-For: getClientIpHash toma el primer valor del header",
    "SEC-026 El registro de auditoría guarda como IP el primer X-Forwarded-For, un dato que escribe el cliente",
    "SEC-027 Las páginas de auth y /bienvenida se pueden embeber en un iframe ajeno: X-Frame-Options solo cubre admin|dashboard|setter y la CSP global es Report-Only",
    "SEC-028 stopImpersonationAction no exige SUPER_ADMIN: cualquier sesión puede escribir eventos IMPERSONATION_ENDED en la auditoría",
    "FAL-001 Los inicios de sesión no dejan rastro: no hay events en auth.ts ni tipo LOGIN en AuditActionType",
    "FAL-002 Cambiar o restablecer la contraseña no le avisa al titular por email"
   ],
   "planeado": [],
   "planeado_omitidos": [],
   "alertas_pendientes": []
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

const SCHEMA_CAZADOR = {
  type: 'object',
  properties: {
    archivos_leidos: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, lineas_total: { type: 'number' }, leido_completo: { type: 'boolean' }, rangos: { type: 'string' } }, required: ['ruta', 'lineas_total', 'leido_completo'] } },
    cobertura_lente: { type: 'array', items: { type: 'object', properties: { que: { type: 'string' }, resultado: { type: 'string' } }, required: ['que', 'resultado'] } },
    hallazgos: { type: 'array', items: { type: 'object', properties: {
      titulo: { type: 'string' }, prefijo: { type: 'string', enum: ['SEC', 'BUG', 'TEC', 'PERF', 'DEU', 'A11Y', 'UX', 'FAL'] },
      severidad: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA'] }, tipo: { type: 'string' },
      confianza: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] },
      evidencia: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, linea: { type: 'number' }, fragmento: { type: 'string' } }, required: ['ruta', 'linea', 'fragmento'] } },
      impacto: { type: 'string' }, propuesta: { type: 'string' }, esfuerzo: { type: 'string', enum: ['S', 'M', 'L'] },
      zona: { type: 'string', enum: ['libre', 'ZONA-FRANCO', 'FROZEN', 'FROZEN + ZONA-FRANCO'] }, nodos: { type: 'array', items: { type: 'string' } },
      relacionados: { type: 'string' }, requiere_verificacion_humana: { type: 'boolean' },
    }, required: ['titulo', 'prefijo', 'severidad', 'tipo', 'confianza', 'evidencia', 'impacto', 'propuesta', 'esfuerzo', 'zona', 'nodos', 'requiere_verificacion_humana'] } },
    planeado_cruzado: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, clave: { type: 'string' }, estado_en_codigo: { type: 'string', enum: ['hecho', 'parcial', 'no empezado', 'abandonado', 'contradicho'] }, evidencia: { type: 'string' }, sigue_teniendo_sentido: { type: 'string', enum: ['si', 'no', 'decidir'] }, nota: { type: 'string' } }, required: ['id', 'clave', 'estado_en_codigo', 'evidencia', 'sigue_teniendo_sentido'] } },
    alertas_verificadas: { type: 'array', items: { type: 'object', properties: { alerta: { type: 'string' }, resultado: { type: 'string', enum: ['confirmada', 'descartada', 'parcial', 'fuera-de-mi-lote'] }, evidencia: { type: 'string' }, hallazgo_titulo: { type: 'string' } }, required: ['alerta', 'resultado', 'evidencia'] } },
    casos_prueba_manual: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, hallazgos: { type: 'string' }, entorno: { type: 'string' }, precondiciones: { type: 'string' }, pasos: { type: 'array', items: { type: 'string' } }, esperado: { type: 'string' }, senal_falla: { type: 'string' }, escribe_db_o_email: { type: 'boolean' } }, required: ['titulo', 'entorno', 'pasos', 'esperado', 'senal_falla', 'escribe_db_o_email'] } },
    ausencias: { type: 'array', items: { type: 'object', properties: { afirmacion: { type: 'string' }, comando: { type: 'string' }, control_positivo: { type: 'string' } }, required: ['afirmacion', 'comando', 'control_positivo'] } },
    patrones_a_cruzar: { type: 'array', items: { type: 'object', properties: { patron: { type: 'string' }, como_buscarlo: { type: 'string' }, donde_aparecio: { type: 'string' } }, required: ['patron', 'como_buscarlo', 'donde_aparecio'] } },
  },
  required: ['archivos_leidos', 'cobertura_lente', 'hallazgos', 'planeado_cruzado', 'alertas_verificadas', 'casos_prueba_manual', 'ausencias', 'patrones_a_cruzar'],
}
const SCHEMA_VERIF = {
  type: 'object',
  properties: { veredictos: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, se_sostiene: { type: 'boolean' }, severidad_ajustada: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'DESCARTAR'] }, confianza_ajustada: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] }, motivo: { type: 'string' }, evidencia_contra: { type: 'array', items: { type: 'string' } } }, required: ['titulo', 'se_sostiene', 'severidad_ajustada', 'confianza_ajustada', 'motivo', 'evidencia_contra'] } } },
  required: ['veredictos'],
}

const promptCazador = (l) => `${A.preambulo}

=== PROMPT DE LA AUDITORIA (textual, §2, §3 y §5.1) ===
${A.prompt_textual}
=== FIN DEL TEXTO DEL PROMPT ===

${A.rubrica}

TU TRAMO: ${l.id} — dominio ${A.dominio} (${A.nombre}), ciclo ${A.ciclo}. SOS UN CAZADOR DE HUECOS CON LENTE: ${A.lente}
El ciclo 1 ya leyo completo este dominio y registro los hallazgos de abajo. Tu trabajo es encontrar lo que se le paso, mirando con la lente. No repitas un titulo existente: si lo que encontras es la misma causa raiz, no va; si es otra causa o el mismo patron en otro lugar no citado, si va (con su propia evidencia).
FOCO DEL DOMINIO: ${A.foco}
${A.contexto}

ARCHIVOS DEL TRAMO (${l.archivos.length} archivos, ${l.loc} lineas; rutas relativas a ${APP}). Lee todos los que importan para la lente (las entradas: pages, layouts, route handlers y server actions, siempre); en cobertura_lente deci que revisaste y con que resultado (por entrada o por grupo de archivos):
${l.archivos.map((f) => '- ' + f).join('\n')}

TITULOS YA REGISTRADOS EN ESTE DOMINIO (no repetir):
${l.titulos_existentes && l.titulos_existentes.length ? l.titulos_existentes.map((t) => '- ' + t).join('\n') : '- (ninguno)'}

LO PLANEADO QUE QUEDO SIN CRUZAR (devolve una entrada por item en planeado_cruzado, con id y clave; evidencia ruta:linea o git grep con control positivo):
${l.planeado && l.planeado.length ? l.planeado.map((p) => `- ${p.id} (${p.clave}) [${p.tipo}${p.zona_franco ? ', ZONA-FRANCO' : ''}] ${p.titulo} — ${p.descripcion} (estado declarado: ${p.estado_declarado})`).join('\n') : '- (ninguno)'}

ALERTAS QUE QUEDARON SIN RESOLVER (una entrada por alerta en alertas_verificadas):
${l.alertas_pendientes && l.alertas_pendientes.length ? l.alertas_pendientes.map((a) => '- ' + a).join('\n') : '- (ninguna)'}

${A.herramientas}

QUE DEVOLVES (StructuredOutput): hallazgos nuevos en el formato pedido (evidencia ruta:linea REAL con fragmento minimo de <=3 lineas, nunca un secret; nodos = ids del Atlas; si hace falta runtime, base o navegador: requiere_verificacion_humana=true y el caso en casos_prueba_manual); cobertura_lente; planeado_cruzado; alertas_verificadas; ausencias (toda afirmacion 'no existe X' con su git grep sobre origin/main y control positivo); patrones_a_cruzar. Si con la lente no encontras nada nuevo, devolve hallazgos vacio: es un resultado valido y cuenta para cerrar el dominio.`

const promptVerif = (l, hs) => `${A.preambulo}

${A.rubrica}

TAREA: sos un VERIFICADOR ADVERSARIAL. Un cazador reporto estos hallazgos CRITICA/ALTA sobre el tramo ${l.id} (dominio ${A.dominio}, lente: ${A.lente}). Tu trabajo es REFUTARLOS. Para cada uno: abri cada ruta:linea citada y el contexto necesario (llamadores, guards en layouts y en src/proxy.ts, validacion aguas arriba, si el codigo esta vivo o muerto, feature flags, defaults) y decidi si se sostiene. Por defecto, si no lo podes confirmar leyendo, se_sostiene=false. Ajusta severidad (o DESCARTAR) y confianza con la rubrica. Rutas relativas a ${APP}.

HALLAZGOS:
${hs.map((h, i) => `${i + 1}. [${h.severidad}] ${h.titulo}\n   evidencia: ${h.evidencia.map((e) => `${e.ruta}:${e.linea}`).join(', ')}\n   impacto: ${h.impacto}`).join('\n')}`

phase('Caza')
const resultados = await Promise.all(A.lotes.map((l) => (async () => {
  const lectura = await sem(() => agent(promptCazador(l), { label: `cazador:${l.id}`, phase: 'Caza', schema: SCHEMA_CAZADOR, agentType: 'general-purpose' }))
  if (!lectura) return { lote: l.id, lectura: null, verificacion: null }
  const graves = (lectura.hallazgos || []).filter((h) => h.severidad === 'CRÍTICA' || h.severidad === 'ALTA')
  let verificacion = null
  if (graves.length) verificacion = await sem(() => agent(promptVerif(l, graves), { label: `verificador:${l.id}`, phase: 'Verificacion', schema: SCHEMA_VERIF, agentType: 'general-purpose' }))
  log(`${l.id}: ${lectura.hallazgos.length} hallazgos nuevos (${graves.length} CRITICA/ALTA)`)
  return { lote: l.id, lectura, verificacion }
})()))
return { dominio: A.dominio, ciclo: A.ciclo, resultados }
