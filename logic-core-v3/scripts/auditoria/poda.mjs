#!/usr/bin/env node
// Auditoría de renovación 2026-10 — triage de poda (ENMIENDA-01 E2, DEC-36).
//
// Junta SEÑALES OBJETIVAS por candidato y arma `_crudo/poda-candidatos.json`:
//   · knip (archivos, exports y dependencias sin uso)       → _crudo/knip.json
//   · huérfanos de depcruise                                → _crudo/depcruise-resumen.json
//   · sin referencias por nombre (git grep del nombre base y del specifier de import)
//   · ruta (page) sin link, redirect ni href que la nombre
//   · último commit propio de más de 90 días y sin importadores
//   · marcado como experimento / temporal / borrar / descartable / legacy / deprecated
//   · server actions exportadas sin llamador
//   · scripts one-off, salidas generadas y archivos sueltos en la raíz
//   · ramas mergeadas o abandonadas                         → _crudo/ramas.json
//   · valores de enum de Prisma sin ninguna mención en src/
// Interacción con rediseno/home: todo lo que esa rama modifica o borra, y el home
// viejo que v3 reemplaza, va con propuesta «esperar merge de rediseno/home».
//
// Las señales son candidatos, no verdad: la confianza ALTA exige al menos dos señales
// independientes, «nada encontrado» en la búsqueda de qué rompe, y que no sea zona
// congelada, de Franco ni de rediseno/home. Solo lectura sobre el repo.
//
// Uso (desde logic-core-v3): node scripts/auditoria/poda.mjs [--ref origin/main] [--rediseno origin/rediseno/home] [--hoy 2026-10-13]

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const REF = opt('--ref', 'origin/main')
const REDISENO = opt('--rediseno', 'origin/rediseno/home')
const HOY = new Date(opt('--hoy', new Date().toISOString().slice(0, 10)) + 'T12:00:00Z')
const appRoot = process.cwd()
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const CRUDO = path.resolve(appRoot, 'docs/auditoria-2026-10/_crudo')
const A = 'logic-core-v3/'
const git = (...a) => execFileSync('git', ['-c', 'core.quotepath=off', ...a], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 1 << 28 })
const leerJson = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8').replace(/^\uFEFF/, '')) : null)

// ── Ledger ───────────────────────────────────────────────────────────────────
function parsearFila(l) { const f = []; let a = '', q = false; for (let i = 0; i < l.length; i++) { const c = l[i]; if (q) { if (c === '"' && l[i + 1] === '"') { a += '"'; i++ } else if (c === '"') q = false; else a += c } else if (c === '"') q = true; else if (c === ',') { f.push(a); a = '' } else a += c } f.push(a); return f }
const ledger = new Map(readFileSync(path.resolve(appRoot, 'docs/auditoria-2026-10/_cobertura.csv'), 'utf8').replace(/\r\n/g, '\n').split('\n').slice(1).filter(Boolean).map(parsearFila).map((f) => [f[0], { dominio: f[1], alcance: f[2], estado: f[3], notas: f[5] }]))
const zonaDe = (r) => { const n = ledger.get(r)?.notas ?? ''; return n.includes('ZONA-FRANCO') ? 'ZONA-FRANCO' : /FROZEN/.test(n) ? 'congelado' : 'libre' }

// ── Árbol y contenidos de la ref ─────────────────────────────────────────────
const arbol = git('ls-tree', '-r', '--name-only', REF).split('\n').filter(Boolean)
const enArbol = new Set(arbol)
const textuales = arbol.filter((r) => /\.(ts|tsx|js|jsx|mjs|cjs|json|md|toml|yml|yaml|css|html|prisma)$/.test(r) && !r.startsWith('.github/skills/') && !/package-lock\.json$/.test(r))
const res = spawnSync('git', ['cat-file', '--batch'], { cwd: repoRoot, input: textuales.map((r) => `${REF}:${r}`).join('\n') + '\n', maxBuffer: 1 << 30 })
const contenido = new Map()
{ let pos = 0; const buf = res.stdout
  for (const r of textuales) { const nl = buf.indexOf(0x0a, pos); const m = buf.subarray(pos, nl).toString('utf8').match(/^[0-9a-f]+ \w+ (\d+)$/); pos = nl + 1; if (!m) continue; const n = Number(m[1]); contenido.set(r, buf.subarray(pos, pos + n).toString('utf8')); pos += n + 1 } }
const lineasDe = (r) => { const t = contenido.get(r); return typeof t === 'string' ? (t.match(/\n/g) ?? []).length + (t.length && !t.endsWith('\n') ? 1 : 0) : 0 }

// Último commit por archivo en la ref.
const ultimo = new Map()
{ let actual = null
  for (const l of git('log', REF, '--name-only', '--format=@@%cI').split('\n')) { if (l.startsWith('@@')) { actual = l.slice(2); continue } if (l && actual && !ultimo.has(l)) ultimo.set(l, actual) } }
const edadDias = (r) => (ultimo.has(r) ? Math.round((HOY - new Date(ultimo.get(r))) / 86400000) : null)

// Qué toca rediseno/home.
const tocaRediseno = new Map()
for (const l of git('diff', '--name-status', `${REF}...${REDISENO}`).split('\n').filter(Boolean)) { const [st, f] = l.split('\t'); if (st === 'M' || st === 'D') tocaRediseno.set(f, st) }
// Home viejo que v3 reemplaza: código del sitio público (PUB) y el chrome/escena del home.
const esHomeViejo = (r) => ledger.get(r)?.dominio === 'PUB' || /^logic-core-v3\/src\/(components\/(sections|3d|canvas|software|automation|ia|layout)|context)\//.test(r)

// ── Búsqueda de referencias por nombre ───────────────────────────────────────
// Corpus donde se busca: todo el código/config/tests/scripts de la app (no docs ni capturas).
const corpus = textuales.filter((r) => r.startsWith(A) && !r.startsWith(`${A}docs/`) && !/\.md$/.test(r))
function referencias(ruta) {
  const sinExt = ruta.replace(/\.(tsx?|jsx?|mjs|cjs)$/, '')
  const base = path.posix.basename(sinExt) === 'index' ? path.posix.basename(path.posix.dirname(sinExt)) : path.posix.basename(sinExt)
  const spec = sinExt.startsWith(`${A}src/`) ? '@/' + sinExt.slice(`${A}src/`.length).replace(/\/index$/, '') : null
  const encontrados = []
  const esc = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Cadena entre comillas que contiene el nombre base. Si la cadena es un specifier
  // de módulo que resuelve a OTRO archivo existente, no cuenta como referencia.
  const reCadena = new RegExp(`(['"\`])([^'"\`\\n]*(?:^|[/@.])${esc}(?:[./][^'"\`\\n]*)?)\\1|\\b${esc}\\b(?=\\s*\\()`, 'g')
  for (const r of corpus) {
    if (r === ruta) continue
    const t = contenido.get(r)
    if (typeof t !== 'string') continue
    if (spec && (t.includes(`'${spec}'`) || t.includes(`"${spec}"`))) { encontrados.push(r.slice(A.length)); continue }
    let cuenta = false
    for (const m of t.matchAll(reCadena)) {
      const s = m[2]
      if (s === undefined) continue // llamada `base(` sin comillas: no es una ruta, se ignora
      if (s.startsWith('@/') || s.startsWith('./') || s.startsWith('../')) {
        const destino = resolverSpec(r, s)
        if (destino && destino !== ruta) continue // es import de otro archivo con el mismo nombre
      }
      cuenta = true
      break
    }
    if (cuenta) encontrados.push(r.slice(A.length))
  }
  return { encontrados, busqueda: `nombre base «${base}»${spec ? ` y specifier «${spec}»` : ''} entre comillas (descartando imports que resuelven a otro archivo) en ${corpus.length} archivos de código, config, tests y scripts de ${REF} (sin docs)` }
}
const EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json']
function resolverSpec(desde, spec) {
  const base = spec.startsWith('@/') ? `${A}src/${spec.slice(2)}` : path.posix.normalize(path.posix.join(path.posix.dirname(desde), spec))
  for (const c of [base, ...EXT.map((e) => base + e), ...EXT.map((e) => `${base}/index${e}`)]) if (enArbol.has(c)) return c
  return null
}

// ── Insumos de señales ───────────────────────────────────────────────────────
const knip = leerJson(path.join(CRUDO, 'knip.json'))
const depc = leerJson(path.join(CRUDO, 'depcruise-resumen.json'))
const ramas = leerJson(path.join(CRUDO, 'ramas.json'))
const knipArchivos = new Set((knip?.files ?? []).map((f) => `${A}${f.replace(/\\/g, '/')}`))
const knipIssues = knip?.issues ?? []
const huerfanos = new Set((depc?.huerfanos ?? []).map((f) => `${A}${f}`))
// Marcador: solo dentro de un comentario y con palabras que declaran el destino del
// archivo («temporal» o «legacy» sueltos dan falsos positivos: «contraseña temporal»).
const MARCADOR = /(\/\/|\/\*|^\s*\*)[^\n]*\b(EXPERIMENTAL|DESCARTABLE|descartable|@deprecated|DEPRECATED|deprecated|throwaway|Throwaway|dead code|c[oó]digo muerto|no se usa|se puede borrar|BORRAR|borrar (este|cuando|despu[eé]s))\b/m
const CONVENCION_NEXT = /\/(page|layout|route|loading|error|not-found|global-error|template|default|opengraph-image|icon)\.(tsx?|jsx?)$|^logic-core-v3\/src\/(proxy|instrumentation|instrumentation-client|auth|auth\.config)\.ts$|^logic-core-v3\/src\/app\/(sitemap|robots)\.ts$/
const pkg = JSON.parse(contenido.get(`${A}package.json`) ?? '{}')
const scriptsPkg = Object.values(pkg.scripts ?? {}).join('\n')
const enPackageScripts = (r) => scriptsPkg.includes(r.slice(A.length)) || scriptsPkg.includes(path.posix.basename(r))

const candidatos = []
const agregar = (c) => {
  const enRediseno = c.archivos.some((f) => tocaRediseno.has(f)) || (c.categoria !== 'rama' && c.archivos.length > 0 && c.archivos.every(esHomeViejo))
  const zona = c.archivos.map(zonaDe).find((z) => z !== 'libre') ?? 'libre'
  // LOC solo cuando el candidato es el archivo entero (un export, una action o un
  // valor de enum no se llevan el archivo).
  const enteros = ['archivo', 'ruta', 'config-muerta', 'script-one-off', 'salida-generada']
  candidatos.push({ ...c, loc: enteros.includes(c.categoria) ? c.archivos.reduce((s, f) => s + lineasDe(f), 0) : 0, zona, rediseno: enRediseno })
}

// 1) Archivos: huérfanos de depcruise ∪ archivos de knip ∪ marcados.
const archivosCandidatos = new Set([...huerfanos, ...knipArchivos])
for (const r of arbol) if (r.startsWith(`${A}src/`) && /\.(tsx?|jsx?)$/.test(r) && MARCADOR.test(contenido.get(r) ?? '') && !/\.(invariant|test|spec)\./.test(r)) archivosCandidatos.add(r)
for (const r of [...archivosCandidatos].sort()) {
  if (!enArbol.has(r) || CONVENCION_NEXT.test(r)) continue
  const senales = []
  if (huerfanos.has(r)) senales.push('huérfano de depcruise')
  if (knipArchivos.has(r)) senales.push('knip: archivo sin uso')
  if (MARCADOR.test(contenido.get(r) ?? '')) senales.push(`marcado en el código («${(contenido.get(r).match(MARCADOR) ?? [''])[0]}»)`)
  const ref = referencias(r)
  const soloTests = ref.encontrados.length > 0 && ref.encontrados.every((f) => /(\.invariant\.|\.test\.|\.spec\.|__tests__\/|^tests\/)/.test(f))
  if (ref.encontrados.length === 0) senales.push('sin referencias por nombre')
  else if (soloTests) senales.push('solo lo referencian tests')
  const edad = edadDias(r)
  if (edad !== null && edad > 90 && (huerfanos.has(r) || knipArchivos.has(r))) senales.push(`último commit hace ${edad} días y sin importadores`)
  const cli = enPackageScripts(r) || /\/(evals|prisma)\//.test(r)
  if (cli) senales.push('entrada de CLI (package.json o carpeta de scripts/evals/seeds)')
  const fuertes = senales.filter((s) => /huérfano|knip/.test(s)).length
  const nada = ref.encontrados.length === 0
  let confianza = 'BAJA'
  if (fuertes >= 1 && nada && senales.length >= 2 && !cli) confianza = 'ALTA'
  else if (fuertes >= 1 && (nada || soloTests)) confianza = 'MEDIA'
  agregar({
    categoria: 'archivo', titulo: r.slice(A.length), archivos: [r], senales,
    que_rompe: nada ? `nada encontrado (${ref.busqueda})` : `referencias: ${ref.encontrados.slice(0, 6).join(', ')}${ref.encontrados.length > 6 ? ` +${ref.encontrados.length - 6}` : ''} (${ref.busqueda})`,
    confianza,
  })
}

// 2) Exports y dependencias de knip.
for (const iss of knipIssues) {
  const archivo = `${A}${(iss.file ?? '').replace(/\\/g, '/')}`
  const exps = [...(iss.exports ?? []), ...(iss.types ?? [])].map((e) => e.name ?? e).filter(Boolean)
  if (exps.length && !archivo.endsWith('package.json')) agregar({ categoria: 'export', titulo: `${archivo.slice(A.length)}: ${exps.slice(0, 8).join(', ')}${exps.length > 8 ? ` +${exps.length - 8}` : ''}`, archivos: [archivo], senales: ['knip: export sin uso'], que_rompe: 'knip no encontró importadores de esos exports (verificar por nombre antes de borrar)', confianza: 'MEDIA', detalle: exps })
  for (const tipo of ['dependencies', 'devDependencies', 'unlisted', 'unresolved', 'binaries']) {
    const deps = (iss[tipo] ?? []).map((d) => d.name ?? d).filter(Boolean)
    if (!deps.length) continue
    for (const d of deps) {
      const usado = corpus.some((r) => { const t = contenido.get(r) ?? ''; return t.includes(`'${d}'`) || t.includes(`"${d}"`) || t.includes(`'${d}/`) || t.includes(`"${d}/`) })
      agregar({ categoria: tipo === 'unlisted' || tipo === 'unresolved' ? 'dependencia-faltante' : 'dependencia', titulo: `${tipo}: ${d}`, archivos: [archivo], senales: [`knip: ${tipo}`, usado ? 'aparece citado en el código (revisar)' : 'sin import por nombre en el código'], que_rompe: usado ? 'hay menciones del paquete en el código' : `nada encontrado (import de «${d}» en ${corpus.length} archivos)`, confianza: !usado && tipo !== 'unlisted' && tipo !== 'unresolved' ? 'ALTA' : 'MEDIA', paquete: d })
    }
  }
}

// 3) Server actions exportadas sin llamador (archivos 'use server' que sí tienen importadores).
for (const r of arbol.filter((x) => x.startsWith(`${A}src/`) && /^\s*['"]use server['"]/m.test(contenido.get(x) ?? ''))) {
  if (huerfanos.has(r) || knipArchivos.has(r)) continue
  const t = contenido.get(r)
  const nombres = [...t.matchAll(/^export\s+(?:async\s+)?function\s+(\w+)|^export\s+const\s+(\w+)\s*=/gm)].map((m) => m[1] ?? m[2])
  const sinLlamador = nombres.filter((n) => !corpus.some((o) => o !== r && new RegExp(`\\b${n}\\b`).test(contenido.get(o) ?? '')))
  if (sinLlamador.length) agregar({ categoria: 'server-action-sin-llamador', titulo: `${r.slice(A.length)}: ${sinLlamador.join(', ')}`, archivos: [r], senales: ['export sin ninguna mención por nombre fuera de su archivo'], que_rompe: `nada encontrado (git grep de cada nombre en ${corpus.length} archivos)`, confianza: 'MEDIA', detalle: sinLlamador })
}

// 4) Rutas (page) sin link, redirect ni href.
for (const r of arbol.filter((x) => /^logic-core-v3\/src\/app\/.*page\.tsx?$/.test(x))) {
  const url = '/' + r.slice(`${A}src/app/`.length).replace(/\/?page\.tsx?$/, '').split('/').filter((s) => !/^\(.*\)$/.test(s)).join('/')
  if (url === '/') continue
  const prefijo = url.includes('[') ? url.slice(0, url.indexOf('[')) : url
  const carpeta = path.posix.dirname(r)
  const citada = corpus.some((o) => !o.startsWith(carpeta + '/') && o !== r && (contenido.get(o) ?? '').includes(prefijo.endsWith('/') ? prefijo : `${prefijo}`) && new RegExp(`['"\`]${prefijo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`?#/$]|\\$\\{)`).test(contenido.get(o) ?? ''))
  if (!citada) agregar({ categoria: 'ruta', titulo: `${url} (${r.slice(A.length)})`, archivos: [r], senales: ['ruta sin link, redirect, href ni push que la nombre'], que_rompe: `nada encontrado (literal «${prefijo}» en ${corpus.length} archivos; las URL armadas con constantes no se ven)`, confianza: 'MEDIA' })
}

// 5) Scripts one-off, salidas generadas y sueltos de la raíz de la app.
const ONE_OFF = /^logic-core-v3\/(scripts\/(_b\d|b\d+-|p\d+-|v1-qa|qa-corridas\/|regression\/|_db-|_ms\d|seed-matsu|set-matsu|cleanup-messages|seed-messages|utm1-smoke|encode-vertex)|script[^/]*\.js$|replace_analytics\.js$|find_unused\.js$|test-chat\.mjs$)/
for (const r of arbol.filter((x) => ONE_OFF.test(x))) {
  const ref = referencias(r)
  const nada = ref.encontrados.length === 0 && !enPackageScripts(r)
  agregar({ categoria: 'script-one-off', titulo: r.slice(A.length), archivos: [r], senales: ['script de un sprint o suelto en la raíz', ...(nada ? ['sin referencias por nombre ni en package.json'] : []), ...(edadDias(r) > 30 ? [`último commit hace ${edadDias(r)} días`] : [])], que_rompe: nada ? `nada encontrado (${ref.busqueda}; package.json scripts)` : `referencias: ${ref.encontrados.slice(0, 4).join(', ')}`, confianza: nada ? 'ALTA' : 'MEDIA' })
}
for (const r of arbol.filter((x) => (ledger.get(x)?.notas ?? '').match(/salida-generada-commiteada|log-commiteado|salida-de-bench-commiteada|temporal-suelto-en-raiz|archivo vacio/))) {
  agregar({ categoria: 'salida-generada', titulo: r, archivos: [r], senales: ['salida generada o temporal commiteada (clasificación del ledger)'], que_rompe: 'nada: no es código que se importe', confianza: 'ALTA' })
}

// 6) Configuraciones y docs de plataforma muertos (lista cerrada, con su señal).
const CONFIG = [
  [`${A}vercel.json`, 'declara 3 crons de Vercel en un deploy de Netlify (netlify.toml); hay que mover los crons antes de borrarlo'],
  [`${A}DEPLOY.md`, 'describe un deploy en Vercel con Resend y n8n; la configuración viva es Netlify'],
]
for (const [r, s] of CONFIG) if (enArbol.has(r)) agregar({ categoria: 'config-muerta', titulo: r.slice(A.length), archivos: [r], senales: [s], que_rompe: r.endsWith('vercel.json') ? 'se pierde la única declaración de os-follow-up, regenerate-briefs y send-executive-reports' : 'nada en runtime', confianza: 'MEDIA' })

// 7) Ramas.
for (const b of ramas?.ramas ?? []) {
  if (['main', 'auditoria/renovacion-2026-10', 'rediseno/home'].includes(b.nombre)) continue
  const v3 = /^(v3\/|rediseno\/|respaldo\/)/.test(b.nombre)
  if (b.estado === 'mergeada') agregar({ categoria: 'rama', titulo: `${b.nombre} (mergeada, último commit ${b.ultimo_commit.fecha.slice(0, 10)})`, archivos: [], senales: ['sin commits propios fuera de origin/main'], que_rompe: b.worktree ? `tiene worktree en ${b.worktree}` : 'nada: todo su contenido está en main', confianza: b.worktree ? 'MEDIA' : 'ALTA', rama: b.nombre, rediseno_rama: v3 })
  else if (b.estado === 'abandonada') agregar({ categoria: 'rama', titulo: `${b.nombre} (+${b.ahead}/-${b.behind}, último commit propio ${String(b.ultimo_commit_propio).slice(0, 10)})`, archivos: [], senales: [`abandonada: ${b.edad_dias} días sin commits propios`], que_rompe: `${b.solo_en_rama_total} archivos solo existen ahí (revisar antes de borrar)`, confianza: b.solo_en_rama_total === 0 ? 'MEDIA' : 'BAJA', rama: b.nombre, rediseno_rama: v3 })
  else if (v3 && b.estado !== 'viva') agregar({ categoria: 'rama', titulo: `${b.nombre} (${b.estado}, +${b.ahead}/-${b.behind})`, archivos: [], senales: ['rama intermedia del rediseño del home'], que_rompe: `${b.solo_en_rama_total} archivos solo existen ahí`, confianza: 'BAJA', rama: b.nombre, rediseno_rama: true })
}
for (const c of candidatos) if (c.categoria === 'rama' && c.rediseno_rama) c.rediseno = true

// 8) Valores de enum sin ninguna mención en src/.
const schema = contenido.get(`${A}prisma/schema.prisma`) ?? ''
const srcCorpus = corpus.filter((r) => r.startsWith(`${A}src/`))
for (const [, nombre, cuerpo] of schema.matchAll(/^enum\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
  const valores = cuerpo.split('\n').map((l) => l.replace(/\/\/.*$/, '').trim()).filter((l) => l && !l.startsWith('@@')).map((l) => l.split(/\s+/)[0])
  const sinUso = valores.filter((v) => !srcCorpus.some((r) => new RegExp(`\\b${v}\\b`).test(contenido.get(r) ?? '')))
  if (sinUso.length) {
    agregar({ categoria: 'enum-sin-uso', titulo: `enum ${nombre}: ${sinUso.join(', ')}`, archivos: [`${A}prisma/schema.prisma`], senales: ['ninguna mención de la palabra en src/'], que_rompe: 'borrarlo exige migración (y schema.prisma es congelado en esta corrida)', confianza: 'BAJA', detalle: sinUso })
    // La zona sale del bloque del schema, no del archivo entero (DEC-11).
    candidatos[candidatos.length - 1].zona = /^(ActivityChannel|LeadStatus|OsLead|OsServiceType|ActivityResult|MilestoneType|DossierStage|OsSetterNoticeKind)/.test(nombre) ? 'ZONA-FRANCO' : 'congelado'
  }
}

const resumen = {}
for (const c of candidatos) { const k = `${c.categoria}|${c.rediseno ? 'esperar-rediseno' : c.confianza}`; resumen[k] = (resumen[k] ?? 0) + 1 }
const locAlta = candidatos.filter((c) => c.confianza === 'ALTA' && !c.rediseno && c.zona === 'libre').reduce((s, c) => s + c.loc, 0)
writeFileSync(path.join(CRUDO, 'poda-candidatos.json'), JSON.stringify({ ref: REF, rediseno: REDISENO, hoy: HOY.toISOString().slice(0, 10), knip_disponible: Boolean(knip), total: candidatos.length, loc_alta_libre: locAlta, resumen, candidatos }, null, 1) + '\n', 'utf8')
console.log(`candidatos: ${candidatos.length}  (knip ${knip ? 'sí' : 'NO disponible'})  LOC con confianza ALTA en zona libre y fuera de rediseno: ${locAlta}`)
for (const [k, n] of Object.entries(resumen).sort()) console.log(`  ${k.padEnd(48)} ${n}`)
