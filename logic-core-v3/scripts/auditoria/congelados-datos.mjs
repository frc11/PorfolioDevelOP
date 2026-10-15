#!/usr/bin/env node
// Auditoría de renovación 2026-10 — datos medidos de cada congelado para 11-CONGELADOS.md (E5, DEC-38).
//
// Por archivo congelado (los 6 explícitos del PROMPT, src/components/ui/* como grupo, dashboard-actions.ts y
// los 14 inferidos de DEC-10): líneas, historia en git (primer y último commit, cantidad, últimos 90 días,
// commits que nombran el congelamiento), importadores por dominio y tests (depcruise), hallazgos y fichas de
// poda que lo citan, menciones en docs y en CLAUDE.md/AGENTS.md, y cambios en rediseno/home desde su base.
// Solo lectura del repo; escribe _crudo/congelados-datos.json.
//
// Uso (desde logic-core-v3): node scripts/auditoria/congelados-datos.mjs [--base 57c421bc] [--rediseno bead847c]

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { leerPartido } from './crudo-partes.mjs'

const args = process.argv.slice(2)
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d)
const BASE = opt('--base', '57c421bc')
const REDISENO = opt('--rediseno', 'rediseno/home')
const APP = process.cwd()
const RAIZ = path.resolve(APP, '..')
const CRUDO = path.join(APP, 'docs/auditoria-2026-10/_crudo')
const git = (...a) => execFileSync('git', ['-C', RAIZ, ...a], { encoding: 'utf8', maxBuffer: 1e9 }).trim()
const A = 'logic-core-v3/'

const EXPLICITOS = [
  ['src/components/3d/HeroArtifact.tsx', 'PROMPT + CLAUDE.md'],
  ['src/context/TransitionContext.tsx', 'PROMPT + CLAUDE.md'],
  ['src/context/PreloaderContext.tsx', 'PROMPT + CLAUDE.md'],
  ['prisma/schema.prisma', 'PROMPT + CLAUDE.md'],
  ['src/auth.ts', 'PROMPT'],
  ['src/lib/prisma.ts', 'PROMPT'],
  ['src/actions/dashboard-actions.ts', 'PROMPT'],
]
const INFERIDOS = ['utils', 'action-utils', 'use-is-client', 'auth-guards', 'audit-log', 'logger', 'alerts', 'tz-ar', 'dates-ar', 'design-tokens', 'use-reduced-motion', 'hover', 'motion-variants', 'chromeReveal'].map((n) => [`src/lib/${n}.ts`, 'DEC-10 (inferido)'])
const UI = git('ls-tree', '-r', '--name-only', BASE, '--', `${A}src/components/ui`).split('\n').filter(Boolean).map((r) => r.slice(A.length))

// ledger: dominio por ruta
const parsear = (l) => { const f = []; let a = '', q = false; for (let i = 0; i < l.length; i++) { const c = l[i]; if (q) { if (c === '"' && l[i + 1] === '"') { a += '"'; i++ } else if (c === '"') q = false; else a += c } else if (c === '"') q = true; else if (c === ',') { f.push(a); a = '' } else a += c } f.push(a); return f }
const dominio = new Map(readFileSync(path.join(APP, 'docs/auditoria-2026-10/_cobertura.csv'), 'utf8').replace(/\r\n/g, '\n').split('\n').slice(1).filter(Boolean).map(parsear).map((f) => [f[0], f[1]]))
const dep = existsSync(path.join(CRUDO, 'depcruise.json')) ? new Map(JSON.parse(readFileSync(path.join(CRUDO, 'depcruise.json'), 'utf8')).modules.map((m) => [m.source, m])) : new Map()
const reg = leerPartido(CRUDO, 'hallazgos', null, 'hallazgos').hallazgos.filter((h) => h.estado === 'vigente')
const poda = readFileSync(path.join(APP, 'docs/auditoria-2026-10/10-PODA.md'), 'utf8')
const mb = git('merge-base', BASE, REDISENO)
const desde90 = '2026-07-17'

const esTest = (r) => /(^|\/)(tests?|__tests__)\//.test(r) || /\.(invariant|test|spec)\.tsx?$/.test(r)
const medir = (ruta) => {
  const full = `${A}${ruta}`
  const lineas = git('show', `${BASE}:${full}`).split('\n').length
  const log = git('log', '--format=%h|%ad|%s', '--date=short', BASE, '--', full).split('\n').filter(Boolean)
  const ult90 = git('log', '--format=%h', `--since=${desde90}`, BASE, '--', full).split('\n').filter(Boolean).length
  const congelan = log.filter((l) => /frozen|congel|no tocar|intocable/i.test(l))
  const m = dep.get(ruta)
  const dependientes = m?.dependents ?? []
  const porDominio = {}
  for (const d of dependientes) { const k = esTest(d) ? 'tests' : dominio.get(`${A}${d}`) ?? '?'; porDominio[k] = (porDominio[k] ?? 0) + 1 }
  const hallazgos = reg.filter((h) => (h.evidencia ?? []).some((e) => e.ruta === ruta) || (h.bloque_md ?? '').includes(ruta)).map((h) => `${h.id} ${h.severidad}`)
  const pods = [...poda.matchAll(/^### \[(POD-\d+)\][^\n]*\n([\s\S]*?)(?=^### |\Z)/gm)].filter((x) => x[0].includes(ruta)).map((x) => x[1])
  const rd = git('diff', '--numstat', mb, REDISENO, '--', full)
  const borrado = !git('ls-tree', '--name-only', REDISENO, '--', full)
  return {
    ruta, lineas, commits: log.length, ultimos_90_dias: ult90,
    primero: log.at(-1) ?? null, ultimo: log[0] ?? null, commits_que_nombran_congelamiento: congelan.slice(0, 5),
    dependientes: dependientes.length, por_dominio: porDominio, en_depcruise: !!m,
    hallazgos, pod: pods,
    rediseno_home: borrado ? 'borrado' : rd ? rd.split('\t').slice(0, 2).map(Number).join('/') : 'sin cambios',
  }
}
const menciones = (aguja) => {
  let out = ''
  try { out = git('grep', '-n', '-F', aguja, BASE, '--', `${A}docs`, `:!${A}docs/auditoria-2026-10`, 'CLAUDE.md', `${A}AGENTS.md`, `${A}CLAUDE.md`) } catch { out = '' }
  const ls = out.split('\n').filter(Boolean).map((l) => l.replace(`${BASE}:`, '').replace(/^logic-core-v3\//, ''))
  return { total: ls.length, reglas: ls.filter((l) => /^(CLAUDE\.md|AGENTS\.md)/.test(l)).map((l) => l.slice(0, 200)).slice(0, 6), ejemplos: ls.filter((l) => !/^(CLAUDE\.md|AGENTS\.md)/.test(l)).map((l) => l.slice(0, 160)).slice(0, 4) }
}

const items = []
for (const [ruta, origen] of [...EXPLICITOS, ...INFERIDOS]) items.push({ grupo: origen, ...medir(ruta), menciones: menciones(ruta.replace(/^src\//, '')) })
const ui = UI.map(medir)
const sumar = (k) => ui.reduce((s, x) => s + (x[k] ?? 0), 0)
const uiDom = {}
for (const x of ui) for (const [k, v] of Object.entries(x.por_dominio)) uiDom[k] = (uiDom[k] ?? 0) + v
items.push({
  grupo: 'PROMPT (src/components/ui/* como grupo)', ruta: 'src/components/ui/*', archivos: ui.length, lineas: sumar('lineas'),
  commits: sumar('commits'), ultimos_90_dias: sumar('ultimos_90_dias'), dependientes: sumar('dependientes'), por_dominio: uiDom,
  sin_importadores: ui.filter((x) => x.en_depcruise && x.dependientes === 0).map((x) => x.ruta),
  hallazgos: [...new Set(ui.flatMap((x) => x.hallazgos))], pod: [...new Set(ui.flatMap((x) => x.pod))],
  rediseno_home: ui.filter((x) => x.rediseno_home !== 'sin cambios').map((x) => `${x.ruta.replace('src/components/ui/', '')} ${x.rediseno_home}`),
  menciones: menciones('components/ui'), detalle: ui,
})
const salida = { generado: new Date().toISOString().slice(0, 10), base: BASE, rediseno: `${REDISENO} @ ${git('rev-parse', '--short', REDISENO)} (merge-base ${mb.slice(0, 8)})`, items }
writeFileSync(path.join(CRUDO, 'congelados-datos.json'), `${JSON.stringify(salida, null, 1)}\n`, 'utf8')
for (const x of items) console.log(`${x.ruta} · ${x.lineas} líneas · ${x.commits} commits (${x.ultimos_90_dias} en 90 días) · ${x.dependientes} dependientes ${JSON.stringify(x.por_dominio)} · hallazgos ${x.hallazgos.length} · POD ${x.pod.length} · rediseno ${Array.isArray(x.rediseno_home) ? x.rediseno_home.length + ' cambiados' : x.rediseno_home} · docs ${x.menciones.total}`)
