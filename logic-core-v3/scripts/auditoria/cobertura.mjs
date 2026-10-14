#!/usr/bin/env node
// Auditoría de renovación 2026-10 — generador del ledger de cobertura.
//
// Lee el árbol de una ref de git (por defecto `origin/main`), clasifica cada
// archivo por dominio (D1..D9, PUB, DOC, -) y alcance (profundo | superficial |
// fuera), y escribe `docs/auditoria-2026-10/_cobertura.csv`.
//
// Solo lectura sobre el repo: usa `git ls-tree` y no toca ningún archivo fuera
// del CSV de salida. Es re-ejecutable: si el CSV ya existe, conserva `estado`,
// `ciclo` y las notas manuales (lo que va después de " | " en `notas`) de cada
// ruta que siga existiendo. Dominio y alcance se recalculan siempre desde las
// reglas de este archivo: para reclasificar, se edita una regla y se re-corre.
//
// Uso (PowerShell, desde logic-core-v3):
//   node scripts/auditoria/cobertura.mjs
//   node scripts/auditoria/cobertura.mjs --ref origin/main --out docs/auditoria-2026-10/_cobertura.csv
//   node scripts/auditoria/cobertura.mjs --resumen      (solo imprime conteos, no escribe)

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
function opt(name, fallback) {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}
const REF = opt('--ref', 'origin/main')
const SOLO_RESUMEN = args.includes('--resumen')

const appRoot = process.cwd()
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const OUT = path.resolve(appRoot, opt('--out', 'docs/auditoria-2026-10/_cobertura.csv'))

// ── Modo marcar (DEC-21): actualiza estado/ciclo/nota de una lista de rutas sin
// reclasificar nada.
//   node scripts/auditoria/cobertura.mjs --marcar leído --ciclo D1-c1 --lista <archivo> [--nota "texto"]
//   (la lista: una ruta por línea, relativa a la raíz del repo o a logic-core-v3/)
if (args.includes('--marcar')) {
  const ESTADOS = ['pendiente', 'leído', 'superficial', 'excluido-generado']
  const estado = opt('--marcar', null)
  const ciclo = opt('--ciclo', '')
  const nota = opt('--nota', '')
  const lista = opt('--lista', null)
  if (!ESTADOS.includes(estado) || !lista) {
    console.error(`uso: --marcar <${ESTADOS.join('|')}> --lista <archivo> [--ciclo <id>] [--nota <texto>]`)
    process.exit(1)
  }
  const pedidas = readFileSync(path.resolve(appRoot, lista), 'utf8').replace(/^﻿/, '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  const normal = (r) => (r.startsWith('logic-core-v3/') || r.startsWith('.') || !existsSync(path.join(repoRoot, 'logic-core-v3', r)) ? r : `logic-core-v3/${r}`)
  const objetivo = new Set(pedidas.map((r) => normal(r.replace(/\\/g, '/'))))
  const texto = readFileSync(OUT, 'utf8')
  const lineasCsv = texto.replace(/\r\n/g, '\n').split('\n')
  const cabecera = lineasCsv.shift()
  const cel = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  const parsearFila = (l) => { const f = []; let a = '', q = false; for (let i = 0; i < l.length; i++) { const c = l[i]; if (q) { if (c === '"' && l[i + 1] === '"') { a += '"'; i++ } else if (c === '"') q = false; else a += c } else if (c === '"') q = true; else if (c === ',') { f.push(a); a = '' } else a += c } f.push(a); return f }
  let tocadas = 0
  const encontradas = new Set()
  const salidaCsv = [cabecera]
  for (const l of lineasCsv) {
    if (!l) continue
    const f = parsearFila(l)
    if (objetivo.has(f[0])) {
      encontradas.add(f[0])
      f[3] = estado
      if (ciclo) f[4] = ciclo
      if (nota) {
        const [auto, manual = ''] = f[5].includes(' | ') ? [f[5].slice(0, f[5].indexOf(' | ')), f[5].slice(f[5].indexOf(' | ') + 3)] : [f[5], '']
        const notas = new Set(manual ? manual.split('; ') : [])
        notas.add(nota)
        f[5] = `${auto} | ${[...notas].join('; ')}`
      }
      tocadas++
    }
    salidaCsv.push(f.map(cel).join(','))
  }
  writeFileSync(OUT, salidaCsv.join('\n') + '\n', 'utf8')
  const faltan = [...objetivo].filter((r) => !encontradas.has(r))
  console.log(`marcadas ${tocadas} filas como «${estado}»${ciclo ? ` (ciclo ${ciclo})` : ''}${nota ? ` con nota «${nota}»` : ''}; ${faltan.length} rutas pedidas no están en el ledger`)
  for (const r of faltan.slice(0, 20)) console.log(`  no encontrada: ${r}`)
  process.exit(faltan.length ? 3 : 0)
}

const A = 'logic-core-v3/'

// ── Etiquetas de zona ────────────────────────────────────────────────────────
const FROZEN_EXPLICITO = new Set([
  `${A}src/components/3d/HeroArtifact.tsx`,
  `${A}src/context/TransitionContext.tsx`,
  `${A}src/context/PreloaderContext.tsx`,
  `${A}prisma/schema.prisma`,
  `${A}src/auth.ts`,
  `${A}src/lib/prisma.ts`,
  `${A}src/actions/dashboard-actions.ts`,
])
// «utilidades core de src/lib/» y «primitivas de animación compartidas» no
// tienen lista en el PROMPT. Criterio determinista (DEC-10 en 00-PLAN-Y-LOG):
//  (a) archivo de primer nivel de src/lib/ importado (sin contar tests) desde
//      3 dominios o más;
//  (b) primitiva de animación/interacción importada desde 2 dominios o más.
// Medido sobre origin/main @ 57c421bc.
const FROZEN_INFERIDO = new Set([
  // (a) utilidades core
  `${A}src/lib/utils.ts`,
  `${A}src/lib/action-utils.ts`,
  `${A}src/lib/use-is-client.ts`,
  `${A}src/lib/auth-guards.ts`,
  `${A}src/lib/audit-log.ts`,
  `${A}src/lib/logger.ts`,
  `${A}src/lib/alerts.ts`,
  `${A}src/lib/tz-ar.ts`,
  `${A}src/lib/dates-ar.ts`,
  `${A}src/lib/design-tokens.ts`,
  // (a) y (b) primitivas de animación compartidas
  `${A}src/lib/use-reduced-motion.ts`,
  `${A}src/lib/hover.ts`,
  `${A}src/lib/motion-variants.ts`,
  // (b)
  `${A}src/lib/chromeReveal.ts`,
])
const ZONA_FRANCO = [
  new RegExp(`^${A}src/lib/leados/`),
  new RegExp(`^${A}src/app/\\(protected\\)/setter/`),
  new RegExp(`^${A}src/app/\\(protected\\)/admin/leados/`),
  new RegExp(`^${A}src/app/\\(protected\\)/admin/leads/_actions/`),
  new RegExp(`^${A}src/auth\\.ts$`),
  new RegExp(`^${A}src/lib/auth-cookies\\.ts$`),
  new RegExp(`^${A}src/app/api/qa/login/route\\.ts$`),
]

// ── Reglas (la primera que matchea gana) ─────────────────────────────────────
// Cada regla: [regex, dominio, alcance, nota]
const P = (s) => new RegExp(`^${A}${s}`)
const REGLAS = [
  // Reclasificaciones puntuales (revisión adversarial de F0, cada una con su
  // importador verificado): el archivo va al dominio cuyo flujo lo usa, no al
  // que sugiere su carpeta.
  [P('src/lib/preview\\.ts$'), 'D2', 'profundo', 'tenant-scope (resolveOrgId del portal)'],
  [P('src/components/sections/home/Footer\\.tsx$'), 'D7', 'profundo', 'webhook n8n desde el navegador'],
  [P('prisma/seeds/(sync-plans|sync-premium-modules)\\.ts$'), 'D6', 'profundo', 'seed que se corre contra prod; catalogo que la app lee en runtime'],
  [P('prisma/migrations/__diff_check\\.sql$'), '-', 'fuera', 'archivo vacio en la carpeta de migraciones'],
  [P('prisma/backups/'), 'D6', 'superficial', 'volcado de catalogo commiteado (revisar PII)'],
  [P('prisma/migrate-os-to-unified\\.ts$'), 'D6', 'superficial', 'script que cuenta filas'],
  [P('src/lib/onboarding/core\\.ts$'), 'D5', 'profundo', 'alta de cliente (unico llamador: admin/chatbots/new)'],
  [P('src/modules/chatbot/server/admin/(hardDeleteClient|archiveClient|updateClient|updateClientInternalNotes|manageAlerts)\\.ts$'), 'D3', 'profundo', 'server-actions de Admin > Clientes / Alertas'],
  [P('src/lib/health-score\\.ts$'), 'D2', 'profundo', 'logica-dashboard'],
  [P('src/lib/actions/(messages|announcements)\\.ts$'), 'D2', 'profundo', 'server-actions del cliente'],
  [P('src/lib/client-notifications/'), 'D5', 'profundo', 'aviso de lead al cliente (lo dispara captureLead)'],
  [P('src/lib/ai/(results-insights|review-reply-draft)\\.ts$'), 'D5', 'profundo', 'proveedor-ia: Anthropic directo fuera del modulo chatbot'],
  [P('src/components/layout/publicRoute\\.ts$'), 'D9', 'profundo', 'decide donde se montan el chrome publico y el widget'],
  [P('src/components/layout/useChromeRevealed\\.ts$'), 'D5', 'profundo', 'decide cuando aparece el widget'],
  [P('src/app/\\(protected\\)/admin/fg2-lab/'), 'D4', 'profundo', 'experimento LeadOS (ZONA-FRANCO-inferida)'],
  [P('src/lib/modules/demand\\.ts$'), 'D3', 'profundo', 'logica-admin (cruza orgs a proposito)'],
  [P('src/app/contact/page\\.tsx$'), 'D3', 'profundo', 'UI del endpoint publico submitContactForm; captura ?ref='],
  [P('src/lib/premium-features\\.ts$'), 'D3', 'profundo', 'logica-admin'],
  [P('src/lib/whatsapp\\.ts$'), 'PUB', 'superficial', 'links wa.me del sitio publico'],
  [P('src/hooks/useThemeObserver\\.tsx$'), 'PUB', 'superficial', 'hook del home publico'],

  // Fuera: binarios, assets, lockfile, salidas generadas commiteadas
  [/\.(png|jpe?g|gif|webp|avif|ico|svg|mp4|webm|mov|hdr|glb|gltf|bin|woff2?|ttf|otf|eot|pdf|zip|gz|mp3|wav)$/i, '-', 'fuera', 'asset-binario'],
  [P('package-lock\\.json$'), 'D8', 'fuera', 'lockfile (se analiza con npm ls / npm audit)'],
  [P('(ts_errors\\.(log|txt)|ts_prune_output\\.txt|unused_report(_utf8)?\\.txt|audit\\.txt|prisma_err\\.txt|\\.eslint_output\\.txt)$'), 'D9', 'fuera', 'salida-generada-commiteada'],
  [/\.log$/, 'D9', 'fuera', 'log-commiteado'],
  [P('scripts/_b1[34].*\\.json$'), 'D9', 'fuera', 'salida-de-bench-commiteada'],
  [/(^|\/)\.gitkeep$/, '-', 'fuera', 'placeholder'],
  [/^_tmp_.*\.html$/, '-', 'fuera', 'temporal-suelto-en-raiz'],
  [/^\.github\/skills\//, '-', 'fuera', 'vendorizado: skill impeccable'],

  // Documentación
  [P('docs/ev[45]-transcripts/README\\.md$'), 'DOC', 'superficial', 'doc'],
  [P('docs/ev[45]-transcripts/'), 'DOC', 'superficial', 'transcripts (revisar PII)'],
  [P('docs/'), 'DOC', 'superficial', 'doc'],
  [/^[^/]+\.md$/, 'DOC', 'superficial', 'doc-raiz-repo'],
  [P('[^/]+\\.md$'), 'DOC', 'superficial', 'doc-raiz-app'],
  [P('src/.*README\\.md$'), 'DOC', 'superficial', 'doc-de-modulo'],

  // Tooling del repo
  [/^\.github\/workflows\//, 'D8', 'profundo', 'ci'],
  [/^\.github\//, 'D8', 'superficial', 'tooling'],
  [/^\.claude\//, 'D8', 'superficial', 'tooling-agentes'],
  [P('\\.claude/'), 'D8', 'superficial', 'tooling-agentes'],
  [/^\.(gitignore|claudeignore)$/, 'D8', 'superficial', 'config-repo'],
  [/^\.impeccable(\/|$)/, 'D8', 'superficial', 'tooling: config de skill impeccable'],

  // Tests y scripts (alcance superficial)
  [P('tests/'), 'D9', 'superficial', 'test-e2e/integracion'],
  [P('playwright[^/]*\\.config\\.ts$'), 'D9', 'superficial', 'config-tests'],
  [P('scripts/auditoria/'), 'D9', 'superficial', 'auditoria-2026-10'],
  [P('scripts/'), 'D9', 'superficial', 'script-operativo'],
  [P('(script[^/]*|replace_analytics|find_unused)\\.js$'), 'D9', 'superficial', 'script-suelto-raiz-app'],
  [P('test-chat\\.mjs$'), 'D9', 'superficial', 'script-suelto-raiz-app'],

  // Configuración de la app
  [P('package\\.json$'), 'D8', 'profundo', 'dependencias'],
  [P('(next\\.config\\.ts|tsconfig\\.json|eslint\\.config\\.mjs|postcss\\.config\\.mjs|tailwind\\.config\\.ts|knip\\.ts|\\.dependency-cruiser\\.cjs|\\.env\\.example|\\.gitignore|\\.gitattributes)$'), 'D8', 'profundo', 'config'],
  [P('netlify\\.toml$'), 'D8', 'profundo', 'config; crons'],
  [P('vercel\\.json$'), 'D7', 'profundo', 'crons'],
  [P('netlify/'), 'D7', 'profundo', 'cron'],
  [P('(instrumentation\\.ts|sentry\\.(server|edge)\\.config\\.ts)$'), 'D7', 'profundo', 'sentry'],
  [P('prisma\\.config\\.ts$'), 'D6', 'profundo', 'config-prisma'],

  // Datos
  [P('prisma/schema\\.prisma$'), 'D6', 'profundo', 'schema; modelos OsLead* y enum ActivityChannel = ZONA-FRANCO'],
  [P('prisma/migrations/migration_lock\\.toml$'), 'D6', 'superficial', 'migracion'],
  [P('prisma/migrations/'), 'D6', 'profundo', 'migracion'],
  [P('prisma/(seed|seed-guard)\\.ts$'), 'D6', 'profundo', 'seed'],
  [P('prisma/backups/'), 'D6', 'profundo', 'backup-commiteado (revisar PII)'],
  [P('prisma/'), 'D6', 'superficial', 'seed'],

  // App Router — zonas de Franco y chatbot antes que los genéricos
  [P('src/app/\\(protected\\)/setter/'), 'D4', 'profundo', 'setter'],
  [P('src/app/\\(protected\\)/admin/leados/'), 'D4', 'profundo', 'admin-leados'],
  [P('src/app/\\(protected\\)/admin/leads/_actions/'), 'D4', 'profundo', 'admin-leads-actions'],
  [P('src/app/\\(protected\\)/admin/chatbots?/'), 'D5', 'profundo', 'admin-chatbot'],
  [P('src/app/\\(protected\\)/admin/'), 'D3', 'profundo', 'admin'],
  [P('src/app/\\(protected\\)/dashboard/chatbot/'), 'D5', 'profundo', 'dashboard-chatbot'],
  [P('src/app/\\(protected\\)/dashboard/'), 'D2', 'profundo', 'dashboard'],
  [P('src/app/\\(protected\\)/'), 'D1', 'profundo', 'protected-raiz'],

  [P('src/app/api/chatbot/'), 'D5', 'profundo', 'api-chatbot-publica'],
  [P('src/app/api/admin/chatbot/'), 'D5', 'profundo', 'api-admin-chatbot'],
  [P('src/app/api/dashboard/chatbot/'), 'D5', 'profundo', 'api-dashboard-chatbot'],
  [P('src/app/api/motor/'), 'D5', 'profundo', 'motor; webhook'],
  [P('src/app/api/auth/\\[\\.\\.\\.nextauth\\]/'), 'D1', 'profundo', 'nextauth'],
  [P('src/app/api/auth/'), 'D7', 'profundo', 'oauth'],
  [P('src/app/api/qa/'), 'D1', 'profundo', 'qa-login'],
  [P('src/app/api/cron/os-follow-up/'), 'D4', 'profundo', 'cron-leados'],
  [P('src/app/api/cron/'), 'D7', 'profundo', 'cron'],
  [P('src/app/api/admin/'), 'D3', 'profundo', 'api-admin'],
  [P('src/app/api/(dashboard|reports)/'), 'D2', 'profundo', 'api-dashboard'],
  [P('src/app/api/(email|test-sentry|dev)/'), 'D7', 'profundo', 'api-integracion'],
  [P('src/app/api/track/'), 'D7', 'profundo', 'endpoint-publico'],
  [P('src/app/api/'), 'D8', 'profundo', 'api'],

  [P('src/app/(login|forgot-password|reset-password|cambiar-password|accept-invite)/'), 'D1', 'profundo', 'auth-ui'],
  [P('src/app/bienvenida/'), 'D2', 'profundo', 'onboarding-cliente'],
  [P('src/app/embed/'), 'D5', 'profundo', 'embed'],
  [P('src/app/(layout\\.tsx|error\\.tsx|global-error\\.tsx|not-found\\.tsx|globals\\.css)$'), 'D8', 'profundo', 'raiz-app'],
  [P('src/app/(sitemap|robots)\\.ts$'), 'PUB', 'superficial', 'seo'],
  [P('src/app/'), 'PUB', 'superficial', 'sitio-publico'],

  // Módulos
  [P('src/modules/chatbot/evals/'), 'D5', 'superficial', 'evals'],
  [P('src/modules/motor/'), 'D5', 'profundo', 'motor'],
  [P('src/modules/'), 'D5', 'profundo', 'chatbot'],

  // Componentes
  [P('src/components/ui/'), 'D9', 'profundo', 'ui-base'],
  [P('src/components/dashboard/'), 'D2', 'profundo', 'componentes-dashboard'],
  [P('src/components/(admin|onboarding)/'), 'D3', 'profundo', 'componentes-admin'],
  [P('src/components/layout/ChatWidgetMount\\.tsx$'), 'D5', 'profundo', 'monta-widget-en-sitio-publico'],
  [P('src/components/'), 'PUB', 'superficial', 'componentes-sitio-publico'],

  // Server actions y lib
  [P('src/actions/dashboard-actions\\.ts$'), 'D2', 'profundo', 'server-actions'],
  [P('src/actions/(onboarding-actions|task-approvals)\\.ts$'), 'D2', 'profundo', 'server-actions'],
  [P('src/actions/auth-actions\\.ts$'), 'D1', 'profundo', 'server-actions'],
  [P('src/actions/'), 'D3', 'profundo', 'server-actions'],

  [P('src/lib/leados/'), 'D4', 'profundo', 'leados'],
  [P('src/lib/(os-commercial|leados-ui|follow-up)\\.ts$'), 'D4', 'profundo', 'leados-libre'],
  [P('src/lib/isolation/'), 'D6', 'profundo', 'aislamiento'],
  [P('src/lib/(prisma|prisma-enums)\\.ts$'), 'D6', 'profundo', 'datos'],
  [P('src/lib/data/'), 'D6', 'profundo', 'catalogos'],
  [P('src/lib/auth/'), 'D1', 'profundo', 'auth'],
  [P('src/lib/(auth-guards|auth-cookies|impersonation|impersonation-constants)\\.ts$'), 'D1', 'profundo', 'auth'],
  [P('src/lib/security/(auth-rate-limit|generate-temp-password)\\.ts$'), 'D1', 'profundo', 'seguridad'],
  [P('src/lib/security/org-scope\\.ts$'), 'D2', 'profundo', 'tenant-scope'],
  [P('src/lib/security/(origin-matcher|validate-origin)\\.ts$'), 'D5', 'profundo', 'origen-widget'],
  [P('src/lib/security/oauth-state\\.ts$'), 'D7', 'profundo', 'oauth'],
  [P('src/lib/security/'), 'D1', 'profundo', 'seguridad'],
  [P('src/lib/rate-limit/'), 'D1', 'profundo', 'rate-limit'],
  [P('src/lib/actions/(impersonation|invitations|profile)\\.ts$'), 'D1', 'profundo', 'server-actions'],
  [P('src/lib/actions/gbp-connection\\.ts$'), 'D7', 'profundo', 'server-actions'],
  [P('src/lib/actions/(referrals|upsell|notifications)\\.ts$'), 'D2', 'profundo', 'server-actions'],
  [P('src/lib/actions/contact\\.ts$'), 'D3', 'profundo', 'server-actions; endpoint-publico'],
  [P('src/lib/actions/'), 'D3', 'profundo', 'server-actions'],
  [P('src/lib/(email|n8n|whatsapp|searchconsole|analytics|mask-secret)\\.ts$'), 'D7', 'profundo', 'integracion'],
  [P('src/lib/(email|integrations|notifications|cron|sentry|crypto)/'), 'D7', 'profundo', 'integracion'],
  [P('src/lib/ai/'), 'D2', 'profundo', 'ia-llm'],
  [P('src/lib/(dashboard|modules|recommendations|upsell|referrals|client-notifications|billing|plan|tickets|onboarding|reports|announcements)/'), 'D2', 'profundo', 'logica-dashboard'],
  [P('src/lib/(premium-features|premium-modules|subscription)\\.ts$'), 'D2', 'profundo', 'logica-dashboard'],
  [P('src/lib/(health-score|client-health|agency-settings|alerts|bulk-actions|preview|audit-log|audit-log-queries)\\.ts$'), 'D3', 'profundo', 'logica-admin'],
  [P('src/lib/tokens-estimate\\.ts$'), 'D5', 'profundo', 'chatbot'],
  [P('src/lib/(motion-variants|chromeReveal|hover|logo-footprint|marketing-routes|home-routes)\\.ts$'), 'PUB', 'superficial', 'lib-sitio-publico'],
  [P('src/lib/'), 'D9', 'profundo', 'lib-transversal'],

  [P('src/(proxy|auth|auth\\.config)\\.ts$'), 'D1', 'profundo', 'auth'],
  [P('src/types/'), 'D1', 'profundo', 'tipos-sesion'],
  [P('src/instrumentation(-client)?\\.ts$'), 'D7', 'profundo', 'sentry'],
  [P('src/emails/'), 'D7', 'profundo', 'emails'],
  [P('src/hooks/'), 'D9', 'profundo', 'hooks'],
  [P('src/context/'), 'PUB', 'superficial', 'contexto-sitio-publico'],

  [P('public/widget\\.js$'), 'D5', 'profundo', 'widget-embebible'],
  [P('public/'), 'D5', 'superficial', 'pagina-de-prueba-del-widget'],
]

const ES_TEST = /(\.invariant\.tsx?|\.test\.tsx?|\.spec\.tsx?)$|\/__tests__\//
const ES_CODIGO = /\.(ts|tsx|js|jsx|mjs|cjs)$/

// Marcas por contenido: sirven para los barridos cruzados (toda server action,
// todo route handler) y para promover a profundo un archivo superficial de
// `src/` que toca datos, sesión o servidor aunque viva en una carpeta pública.
const MARCAS = [
  ['toca-db', /from\s+['"]@\/lib\/prisma['"]|new\s+PrismaClient|from\s+['"]@\/lib\/isolation['"]|\bforOrg\(|\bunsafeGlobalQuery\(/],
  ['server-action', /^\s*['"]use server['"]/m],
  // `usa-auth` solo ve el import directo de @/auth; `guard-indirecto` ve los
  // guards por helper. Ninguna de las dos sirve de filtro para el barrido SEC:
  // ese barrido recorre TODAS las entradas, tengan o no la marca.
  ['usa-auth', /from\s+['"]@\/auth['"]/],
  ['guard-indirecto', /\b(requireSuperAdmin|requireRole|requireAdmin|requireSetter|assertOwnership|resolveOrgId|getOrgScope|ensureAdmin|verifyCronSecret|CRON_SECRET)\b/],
  ['client-component', /^\s*['"]use client['"]/m],
]
// Escritura en la base: llamadas de mutación de Prisma o SQL ejecutado.
const ESCRIBE_DB = /\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\s*\(|\$executeRaw(Unsafe)?\b/
const HANDLER = /export\s+(async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b|export\s+const\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b|export\s+const\s+\{[^}]*\b(GET|POST|PUT|PATCH|DELETE)\b[^}]*\}/

function clasificar(ruta, contenido) {
  let dominio = 'D9'
  let alcance = 'superficial'
  const notas = []
  const regla = REGLAS.find(([re]) => re.test(ruta))
  if (regla) {
    ;[, dominio, alcance] = regla
    notas.push(regla[3])
  } else {
    notas.push('SIN-CLASIFICAR')
  }
  const esTest = ES_TEST.test(ruta)
  if (alcance !== 'fuera' && esTest) {
    alcance = 'superficial'
    notas.push('test')
  }
  if (alcance !== 'fuera' && typeof contenido === 'string' && ES_CODIGO.test(ruta)) {
    const marcas = MARCAS.filter(([, re]) => re.test(contenido)).map(([m]) => m)
    if (/\/route\.(ts|js)$/.test(ruta) && HANDLER.test(contenido)) marcas.push('route-handler')
    if (marcas.includes('toca-db') && ESCRIBE_DB.test(contenido)) marcas.push('escribe-db')
    notas.push(...marcas)
    // (1) Un archivo de `src/` (que no sea test ni eval) que toca DB, sesión o
    //     servidor no puede quedar superficial aunque viva en una carpeta pública.
    const sensible = marcas.some((m) => !['client-component', 'guard-indirecto'].includes(m))
    const enSrc = ruta.startsWith(`${A}src/`) && !ruta.startsWith(`${A}src/modules/chatbot/evals/`)
    if (alcance === 'superficial' && !esTest && enSrc && sensible) {
      alcance = 'profundo'
      notas.push('promovido-por-contenido')
    }
    // (2) Scripts, seeds y evals que ESCRIBEN en la base (la Neon es compartida):
    //     se leen línea por línea con criterios fijos (credenciales literales,
    //     destino prod, guard de entorno, borrados sin scoping por tenant).
    if (alcance === 'superficial' && !esTest && marcas.includes('escribe-db')) {
      alcance = 'profundo'
      notas.push('promovido: escribe en la base')
    }
  }
  if (FROZEN_EXPLICITO.has(ruta) || new RegExp(`^${A}src/components/ui/`).test(ruta)) notas.push('FROZEN')
  else if (FROZEN_INFERIDO.has(ruta)) notas.push('FROZEN-inferido')
  if (ZONA_FRANCO.some((re) => re.test(ruta))) notas.push('ZONA-FRANCO')
  const estado = alcance === 'fuera' ? 'excluido-generado' : 'pendiente'
  return { dominio, alcance, estado, notas: notas.join('; ') }
}

// ── CSV ──────────────────────────────────────────────────────────────────────
function campo(v) {
  const s = String(v ?? '')
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
function parsearCsv(texto) {
  const filas = []
  let fila = []
  let actual = ''
  let comillas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { actual += '"'; i++ }
      else if (c === '"') comillas = false
      else actual += c
    } else if (c === '"') comillas = true
    else if (c === ',') { fila.push(actual); actual = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++
      fila.push(actual); actual = ''
      if (fila.some((x) => x !== '')) filas.push(fila)
      fila = []
    } else actual += c
  }
  if (actual !== '' || fila.length) { fila.push(actual); filas.push(fila) }
  return filas
}

const previo = new Map()
if (existsSync(OUT)) {
  const filas = parsearCsv(readFileSync(OUT, 'utf8'))
  for (const [ruta, , , estado, ciclo, notas] of filas.slice(1)) {
    const manual = (notas ?? '').includes(' | ') ? notas.slice(notas.indexOf(' | ') + 3) : ''
    previo.set(ruta, { estado, ciclo, manual })
  }
}

const salida = execFileSync('git', ['-c', 'core.quotepath=off', 'ls-tree', '-r', '--name-only', '-z', REF], {
  cwd: repoRoot,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
})
const rutas = salida.split('\0').filter(Boolean).sort()

// Contenido de los archivos de código de la ref, en un solo proceso de git.
function leerBlobs(ref, lista) {
  const entrada = lista.map((r) => `${ref}:${r}`).join('\n') + '\n'
  const res = spawnSync('git', ['cat-file', '--batch'], { cwd: repoRoot, input: entrada, maxBuffer: 1024 * 1024 * 1024 })
  const buf = res.stdout
  const mapa = new Map()
  let pos = 0
  for (const r of lista) {
    const nl = buf.indexOf(0x0a, pos)
    const cabecera = buf.subarray(pos, nl).toString('utf8')
    pos = nl + 1
    const m = cabecera.match(/^[0-9a-f]+ (\w+) (\d+)$/)
    if (!m) { mapa.set(r, null); continue }
    const largo = Number(m[2])
    mapa.set(r, buf.subarray(pos, pos + largo).toString('utf8'))
    pos += largo + 1
  }
  return mapa
}
const contenidos = leerBlobs(REF, rutas.filter((r) => ES_CODIGO.test(r) && !r.startsWith('.github/skills/')))

const clasificadas = new Map(rutas.map((ruta) => [ruta, clasificar(ruta, contenidos.get(ruta))]))

// Segunda pasada: un archivo del sitio público que importa DIRECTAMENTE código
// interno (alias `@/` o ruta relativa) deja de ser «superficial» — lo que se
// rompa ahí se rompe en el portal. No es transitiva a propósito: el layout raíz
// importa el chrome público (Navbar, Shutter…) pero lo monta solo fuera de los
// portales, y seguir la cadena promovería medio sitio público.
const EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
const existentes = new Set(rutas)
function resolver(desde, spec) {
  let base
  if (spec.startsWith('@/')) base = `${A}src/${spec.slice(2)}`
  else if (spec.startsWith('./') || spec.startsWith('../')) base = path.posix.normalize(path.posix.join(path.posix.dirname(desde), spec))
  else return null
  for (const cand of [base, ...EXT.map((e) => base + e), ...EXT.map((e) => `${base}/index${e}`)]) if (existentes.has(cand)) return cand
  return null
}
const IMPORT = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\s*\(\s*['"]([^'"]+)['"]\s*\)|^\s*import\s+['"]([^'"]+)['"]/gm
const importadoresPub = new Map() // ruta PUB → [importadores internos]
for (const [desde, c] of clasificadas) {
  if (!desde.startsWith(`${A}src/`) || !/^D\d$/.test(c.dominio) || c.alcance !== 'profundo') continue
  const texto = contenidos.get(desde)
  if (typeof texto !== 'string') continue
  for (const m of texto.matchAll(IMPORT)) {
    const destino = resolver(desde, m[1] ?? m[2] ?? m[3] ?? m[4])
    if (destino && clasificadas.get(destino)?.dominio === 'PUB') {
      if (!importadoresPub.has(destino)) importadoresPub.set(destino, [])
      importadoresPub.get(destino).push(desde.slice(A.length))
    }
  }
}
for (const [ruta, quienes] of importadoresPub) {
  const c = clasificadas.get(ruta)
  const soloUi = quienes.every((q) => q.startsWith('src/components/ui/'))
  c.dominio = 'D9'
  c.alcance = 'profundo'
  c.notas = `compartido: lo importa ${soloUi ? 'components/ui (FROZEN)' : 'codigo interno'} (${quienes.slice(0, 2).join(', ')}${quienes.length > 2 ? ` +${quienes.length - 2}` : ''}); ${c.notas}`
}

const filas = rutas.map((ruta) => {
  const c = clasificadas.get(ruta)
  const p = previo.get(ruta)
  return {
    ruta,
    dominio: c.dominio,
    alcance: c.alcance,
    estado: p && p.estado && c.alcance !== 'fuera' ? p.estado : c.estado,
    ciclo: p?.ciclo ?? '',
    notas: p?.manual ? `${c.notas} | ${p.manual}` : c.notas,
  }
})

// ── Resumen ──────────────────────────────────────────────────────────────────
const ORDEN = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'PUB', 'DOC', '-']
const tabla = new Map()
for (const f of filas) {
  const k = f.dominio
  if (!tabla.has(k)) tabla.set(k, { profundo: 0, superficial: 0, fuera: 0, leido: 0, superf_hecho: 0, poda: 0 })
  const t = tabla.get(k)
  t[f.alcance]++
  if (f.estado === 'leído') t.leido++
  // Un profundo que la poda pasó a superficial (nota PODA-ALTA) se cuenta aparte:
  // no es cobertura profunda, pero tampoco es una fila superficial del alcance.
  if (f.estado === 'superficial' && f.alcance === 'profundo') t.poda++
  if (f.estado === 'superficial' && f.alcance === 'superficial') t.superf_hecho++
}
console.log(`ref=${REF}  archivos=${filas.length}`)
console.log('dominio  profundo  superficial  fuera  | leído/profundo (PODA-ALTA)  superficial-hecho/superficial')
for (const k of ORDEN.filter((k) => tabla.has(k)).concat([...tabla.keys()].filter((k) => !ORDEN.includes(k)))) {
  const t = tabla.get(k)
  console.log(
    `${k.padEnd(7)} ${String(t.profundo).padStart(9)} ${String(t.superficial).padStart(12)} ${String(t.fuera).padStart(6)}  | ${String(t.leido).padStart(5)}/${t.profundo} (${t.poda})  ${String(t.superf_hecho).padStart(5)}/${t.superficial}`,
  )
}
const sinClasificar = filas.filter((f) => f.notas.includes('SIN-CLASIFICAR'))
if (sinClasificar.length) {
  console.log(`\nSIN-CLASIFICAR (${sinClasificar.length}):`)
  for (const f of sinClasificar) console.log(`  ${f.ruta}`)
}

if (!SOLO_RESUMEN) {
  const lineas = ['ruta,dominio,alcance,estado,ciclo,notas']
  for (const f of filas) lineas.push([f.ruta, f.dominio, f.alcance, f.estado, f.ciclo, f.notas].map(campo).join(','))
  writeFileSync(OUT, lineas.join('\n') + '\n', 'utf8')
  console.log(`\nescrito: ${path.relative(appRoot, OUT)}`)
}
