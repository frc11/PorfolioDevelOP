#!/usr/bin/env node
// Auditoría de renovación 2026-10 — datos para 01-INVENTARIO.md (F1).
//
// Saca de la ref: rutas (page) por área con su URL, route handlers con sus métodos,
// archivos de server actions con la cantidad de funciones exportadas, modelos y enums
// del schema agrupados, variables de entorno usadas en el código contra las
// documentadas en .env.example (solo nombres), scripts de package.json por familia,
// tests por carpeta e invariantes, y crons por registrador.
//
// Solo lectura. Escribe docs/auditoria-2026-10/_crudo/inventario.json.
// Uso (desde logic-core-v3): node scripts/auditoria/inventario.mjs [--ref origin/main]

import { execFileSync, spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { nodoDeRuta } from './atlas/nodos.mjs'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const REF = opt('--ref', 'origin/main')
const appRoot = process.cwd()
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const A = 'logic-core-v3/'
const arbol = execFileSync('git', ['-c', 'core.quotepath=off', 'ls-tree', '-r', '--name-only', REF], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n').filter(Boolean)
const leer = (lista) => {
  const res = spawnSync('git', ['cat-file', '--batch'], { cwd: repoRoot, input: lista.map((r) => `${REF}:${r}`).join('\n') + '\n', maxBuffer: 1 << 30 })
  const m = new Map(); let pos = 0; const buf = res.stdout
  for (const r of lista) { const nl = buf.indexOf(0x0a, pos); const h = buf.subarray(pos, nl).toString('utf8').match(/^[0-9a-f]+ \w+ (\d+)$/); pos = nl + 1; if (!h) continue; const n = Number(h[1]); m.set(r, buf.subarray(pos, pos + n).toString('utf8')); pos += n + 1 }
  return m
}
const codigo = arbol.filter((r) => r.startsWith(A) && /\.(tsx?|jsx?|mjs|cjs|toml|json|ya?ml)$/.test(r) && !r.endsWith('package-lock.json'))
const txt = leer([...codigo, `${A}.env.example`, `${A}prisma/schema.prisma`, '.github/workflows/ci.yml', '.github/workflows/db-backup.yml'])
const esTest = (r) => /(\.invariant\.tsx?|\.test\.tsx?|\.spec\.tsx?)$|\/__tests__\//.test(r)

// Rutas
const urlDe = (r) => '/' + r.slice(`${A}src/app/`.length).replace(/\/?(page|route)\.tsx?$/, '').split('/').filter((s) => !/^\(.*\)$/.test(s)).join('/')
const paginas = arbol.filter((r) => /^logic-core-v3\/src\/app\/.*page\.tsx?$/.test(r)).map((r) => ({ url: urlDe(r), archivo: r.slice(A.length), nodo: nodoDeRuta(r) }))
const handlers = arbol.filter((r) => /^logic-core-v3\/src\/app\/.*\/route\.ts$/.test(r)).map((r) => {
  const t = txt.get(r) ?? ''
  const metodos = [...new Set([...t.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b|export\s+const\s+\{([^}]*)\}/g)].flatMap((m) => (m[1] ? [m[1]] : m[2].split(',').map((s) => s.trim()))))]
  return { url: urlDe(r), archivo: r.slice(A.length), metodos, runtime: (t.match(/export const runtime\s*=\s*['"](\w+)['"]/) ?? [])[1] ?? null, maxDuration: Number((t.match(/export const maxDuration\s*=\s*(\d+)/) ?? [])[1]) || null, nodo: nodoDeRuta(r) }
})
const acciones = arbol.filter((r) => r.startsWith(`${A}src/`) && /^\s*['"]use server['"]/m.test(txt.get(r) ?? '')).map((r) => ({ archivo: r.slice(A.length), funciones: [...(txt.get(r) ?? '').matchAll(/^export\s+(?:async\s+)?function\s+(\w+)|^export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\(/gm)].map((m) => m[1] ?? m[2]), nodo: nodoDeRuta(r) }))

// Schema
const schema = txt.get(`${A}prisma/schema.prisma`) ?? ''
const modelos = [...schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)].map((m) => ({ modelo: m[1], tabla: (m[2].match(/@@map\("([^"]+)"\)/) ?? [])[1] ?? m[1], campos: m[2].split('\n').filter((l) => /^\s+\w+\s+\S/.test(l) && !/^\s+@@/.test(l)).length, organizationId: /\borganizationId\b/.test(m[2]) }))
const enums = [...schema.matchAll(/^enum\s+(\w+)\s*\{([\s\S]*?)^\}/gm)].map((m) => ({ enum: m[1], valores: m[2].split('\n').map((l) => l.replace(/\/\/.*$/, '').trim()).filter((l) => l && !l.startsWith('@@')).length }))

// Variables de entorno: usadas (process.env.X en src, netlify, configs) vs documentadas en .env.example
const usadas = new Map()
for (const r of codigo.filter((x) => !esTest(x) && /^(logic-core-v3\/(src|netlify|prisma)\/|logic-core-v3\/[^/]+\.(ts|mjs|js)$)/.test(x))) {
  for (const m of (txt.get(r) ?? '').matchAll(/process\.env\.([A-Z0-9_]+)|process\.env\[['"]([A-Z0-9_]+)['"]\]/g)) {
    const k = m[1] ?? m[2]
    if (!usadas.has(k)) usadas.set(k, new Set())
    usadas.get(k).add(r.slice(A.length))
  }
}
const documentadas = new Set([...(txt.get(`${A}.env.example`) ?? '').matchAll(/^#?\s*([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1]))
const env = [...usadas].map(([k, s]) => ({ variable: k, archivos: s.size, ejemplo: [...s][0], documentada: documentadas.has(k) })).sort((a, b) => a.variable.localeCompare(b.variable))
const soloDocumentadas = [...documentadas].filter((k) => !usadas.has(k)).sort()

// package.json
const pkg = JSON.parse(txt.get(`${A}package.json`) ?? '{}')
const scripts = Object.keys(pkg.scripts ?? {})
const familias = scripts.reduce((m, s) => { const f = s.split(':')[0]; m[f] = (m[f] ?? 0) + 1; return m }, {})

// Tests
const tests = arbol.filter((r) => r.startsWith(A) && (esTest(r) || r.startsWith(`${A}tests/`)))
const testsPorCarpeta = tests.reduce((m, r) => { const k = r.startsWith(`${A}tests/`) ? r.split('/').slice(1, 3).join('/') : r.split('/').slice(1, 4).join('/'); m[k] = (m[k] ?? 0) + 1; return m }, {})
const invariantes = arbol.filter((r) => r.startsWith(`${A}src/`) && /\.invariant\.tsx?$/.test(r)).length

// Crons
const netlifyToml = txt.get(`${A}netlify.toml`) ?? ''
const vercel = JSON.parse(txt.get(`${A}vercel.json`) ?? '{}')
const crons = {
  netlify: [...netlifyToml.matchAll(/\[functions\."([^"]+)"\]\s*\n\s*schedule\s*=\s*"([^"]+)"/g)].map((m) => ({ funcion: m[1], schedule: m[2], archivo_existe: arbol.includes(`${A}netlify/functions/${m[1]}.ts`) })),
  vercel: (vercel.crons ?? []).map((c) => ({ path: c.path, schedule: c.schedule })),
  github_actions: [...(txt.get('.github/workflows/db-backup.yml') ?? '').matchAll(/cron:\s*'([^']+)'/g)].map((m) => ({ workflow: 'db-backup.yml', schedule: m[1] })),
  rutas_cron: handlers.filter((h) => h.url.startsWith('/api/cron/')).map((h) => h.url),
}

const salida = { ref: REF, paginas, handlers, acciones, modelos, enums, env, env_solo_documentadas: soloDocumentadas, scripts_package: { total: scripts.length, familias }, tests: { total: tests.length, por_carpeta: testsPorCarpeta, invariantes_en_src: invariantes }, crons, dependencias: { dependencies: Object.keys(pkg.dependencies ?? {}).length, devDependencies: Object.keys(pkg.devDependencies ?? {}).length } }
writeFileSync(path.resolve(appRoot, 'docs/auditoria-2026-10/_crudo/inventario.json'), JSON.stringify(salida, null, 1) + '\n', 'utf8')
console.log(`páginas ${paginas.length} · handlers ${handlers.length} · archivos con server actions ${acciones.length} (${acciones.reduce((s, a) => s + a.funciones.length, 0)} funciones) · modelos ${modelos.length} · enums ${enums.length}`)
console.log(`env usadas ${env.length} (no documentadas: ${env.filter((e) => !e.documentada).length}) · documentadas sin uso ${soloDocumentadas.length} · scripts package.json ${scripts.length} · tests ${tests.length} (invariantes en src ${invariantes})`)
console.log(`crons: netlify ${crons.netlify.length} · vercel ${crons.vercel.length} · GH ${crons.github_actions.length} · rutas /api/cron ${crons.rutas_cron.length}`)
