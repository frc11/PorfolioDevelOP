#!/usr/bin/env node
// Auditoría de renovación 2026-10 — pase superficial de DOC y PUB (DEC-22).
//
// Por cada fila del ledger con dominio DOC o PUB: líneas, bytes, fecha y autor del
// último commit que la tocó en la ref, título (primer encabezado Markdown) y, para
// código público, si es page/layout/route, 'use client' y cantidad de imports.
// Escribe docs/auditoria-2026-10/_crudo/inventario-superficial.json y deja una lista
// de rutas para marcarlas `superficial` con `cobertura.mjs --marcar`.
//
// Solo lectura sobre el repo (git log / cat-file de la ref).
// Uso (desde logic-core-v3): node scripts/auditoria/inventario-superficial.mjs [--ref origin/main]

import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const REF = opt('--ref', 'origin/main')
const appRoot = process.cwd()
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const CSV = path.resolve(appRoot, 'docs/auditoria-2026-10/_cobertura.csv')
const OUT = path.resolve(appRoot, opt('--out', 'docs/auditoria-2026-10/_crudo/inventario-superficial.json'))
const LISTA = path.resolve(appRoot, 'docs/auditoria-2026-10/_crudo/lista-superficial-doc-pub.txt')

function parsearFila(l) { const f = []; let a = '', q = false; for (let i = 0; i < l.length; i++) { const c = l[i]; if (q) { if (c === '"' && l[i + 1] === '"') { a += '"'; i++ } else if (c === '"') q = false; else a += c } else if (c === '"') q = true; else if (c === ',') { f.push(a); a = '' } else a += c } f.push(a); return f }
const filas = readFileSync(CSV, 'utf8').replace(/\r\n/g, '\n').split('\n').slice(1).filter(Boolean).map(parsearFila)
const objetivo = filas.filter((f) => (f[1] === 'DOC' || f[1] === 'PUB') && f[2] === 'superficial').map((f) => f[0])

// Contenidos en un solo proceso.
const res = spawnSync('git', ['cat-file', '--batch'], { cwd: repoRoot, input: objetivo.map((r) => `${REF}:${r}`).join('\n') + '\n', maxBuffer: 1 << 30 })
const buf = res.stdout
const contenido = new Map()
let pos = 0
for (const r of objetivo) {
  const nl = buf.indexOf(0x0a, pos)
  const m = buf.subarray(pos, nl).toString('utf8').match(/^[0-9a-f]+ \w+ (\d+)$/)
  pos = nl + 1
  if (!m) { contenido.set(r, null); continue }
  const largo = Number(m[1])
  contenido.set(r, buf.subarray(pos, pos + largo).toString('utf8'))
  pos += largo + 1
}

// Último commit por archivo: un solo `git log` recorriendo la historia de la ref.
const ultimo = new Map()
const log = execFileSync('git', ['-c', 'core.quotepath=off', 'log', REF, '--name-only', '--format=@@%cI%x09%an'], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 1 << 28 })
let actual = null
const buscados = new Set(objetivo)
for (const l of log.split('\n')) {
  if (l.startsWith('@@')) { actual = l.slice(2).split('\t'); continue }
  if (l && actual && buscados.has(l) && !ultimo.has(l)) ultimo.set(l, { fecha: actual[0], autor: actual[1] })
}

const items = objetivo.map((r) => {
  const t = contenido.get(r)
  const dom = filas.find((f) => f[0] === r)[1]
  const lineas = typeof t === 'string' ? (t.match(/\n/g) ?? []).length + (t.length && !t.endsWith('\n') ? 1 : 0) : null
  const item = { ruta: r, dominio: dom, lineas, bytes: typeof t === 'string' ? Buffer.byteLength(t) : null, ultimo_commit: ultimo.get(r) ?? null }
  if (typeof t === 'string' && /\.mdx?$/.test(r)) item.titulo = (t.match(/^\s*#{1,3}\s+(.+)$/m)?.[1] ?? '').replace(/\\/g, '').slice(0, 140)
  if (typeof t === 'string' && /\.(tsx?|jsx?|mjs)$/.test(r)) {
    item.tipo = /\/page\.tsx?$/.test(r) ? 'page' : /\/layout\.tsx?$/.test(r) ? 'layout' : /\/route\.ts$/.test(r) ? 'route' : 'modulo'
    item.client = /^\s*['"]use client['"]/m.test(t)
    item.imports = (t.match(/^\s*import\s/gm) ?? []).length
  }
  return item
})

mkdirSync(path.dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify({ ref: REF, total: items.length, items }, null, 1) + '\n', 'utf8')
writeFileSync(LISTA, objetivo.join('\n') + '\n', 'utf8')
const porDom = items.reduce((m, i) => ((m[i.dominio] = (m[i.dominio] ?? 0) + 1), m), {})
console.log(`inventario superficial: ${items.length} filas ${JSON.stringify(porDom)} → ${path.relative(appRoot, OUT)}`)
console.log(`lista para --marcar: ${path.relative(appRoot, LISTA)}`)
