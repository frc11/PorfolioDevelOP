#!/usr/bin/env node
// Auditoría de renovación 2026-10 — inventario de ramas y worktrees.
//
// Para cada rama (locales ∪ remotas de origin, sin HEAD) calcula contra la base
// (por defecto `origin/main`): último commit (sha, fecha, autor, asunto),
// ahead/behind, si está mergeada, archivos tocados desde la merge-base,
// archivos que existen SOLO en la rama, carpetas tocadas, worktree asociado y
// si la copia local difiere de la remota. Clasifica: mergeada / viva /
// dormida / abandonada según la edad del último commit propio (o worktree activo).
//
// Solo lectura sobre git (for-each-ref, rev-list, diff --name-status, ls-tree,
// worktree list). Escribe un JSON en docs/auditoria-2026-10/_crudo/.
//
// Uso (desde logic-core-v3):
//   node scripts/auditoria/ramas.mjs
//   node scripts/auditoria/ramas.mjs --base origin/main --hoy 2026-10-13 --out docs/auditoria-2026-10/_crudo/ramas.json

import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const BASE = opt('--base', 'origin/main')
const HOY = new Date(opt('--hoy', new Date().toISOString().slice(0, 10)) + 'T12:00:00Z')
const appRoot = process.cwd()
const OUT = path.resolve(appRoot, opt('--out', 'docs/auditoria-2026-10/_crudo/ramas.json'))
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()

const git = (...a) => execFileSync('git', ['-c', 'core.quotepath=off', ...a], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).trim()
const lineas = (s) => (s ? s.split('\n').filter(Boolean) : [])

// ── Refs ─────────────────────────────────────────────────────────────────────
const locales = new Map(lineas(git('for-each-ref', 'refs/heads', '--format=%(refname:short)\t%(objectname)')).map((l) => l.split('\t')))
const remotas = new Map(
  lineas(git('for-each-ref', 'refs/remotes/origin', '--format=%(refname:lstrip=3)\t%(objectname)'))
    .map((l) => l.split('\t'))
    .filter(([n]) => n !== 'HEAD'),
)
const nombres = [...new Set([...locales.keys(), ...remotas.keys()])].sort()

// Worktrees: rama → ruta
const worktrees = new Map()
let wtRuta = null
for (const l of lineas(git('worktree', 'list', '--porcelain'))) {
  if (l.startsWith('worktree ')) wtRuta = l.slice(9)
  else if (l.startsWith('branch refs/heads/')) worktrees.set(l.slice(18), wtRuta)
}

const enBase = new Set(lineas(git('ls-tree', '-r', '--name-only', BASE)))
const shaBase = git('rev-parse', BASE)

function edadDias(fechaIso) {
  return Math.round((HOY - new Date(fechaIso)) / 86400000)
}

const ramas = []
for (const nombre of nombres) {
  const local = locales.get(nombre) ?? null
  const remota = remotas.get(nombre) ?? null
  const ref = remota ? `origin/${nombre}` : nombre
  const [sha, fecha, autor, asunto] = git('log', '-1', '--format=%H%x09%cI%x09%an%x09%s', ref).split('\t')
  const [behind, ahead] = git('rev-list', '--left-right', '--count', `${BASE}...${ref}`).split(/\s+/).map(Number)
  let localVsRemota = null
  if (local && remota && local !== remota) {
    const [soloRemota, soloLocal] = git('rev-list', '--left-right', '--count', `origin/${nombre}...${nombre}`).split(/\s+/).map(Number)
    localVsRemota = { local_adelante: soloLocal, local_atras: soloRemota }
  }
  let mergeBase = null
  let fechaMergeBase = null
  try {
    mergeBase = git('merge-base', BASE, ref)
    fechaMergeBase = git('log', '-1', '--format=%cI', mergeBase)
  } catch { /* historias sin ancestro común */ }

  // Lo que la rama cambió desde la merge-base (three-dot).
  const cambios = ahead > 0 && mergeBase ? lineas(git('diff', '--name-status', '--no-renames', `${BASE}...${ref}`)) : []
  const conteo = { A: 0, M: 0, D: 0, otros: 0 }
  const soloEnRama = []
  const carpetas = new Map()
  for (const l of cambios) {
    const [estado, archivo] = l.split('\t')
    if (estado in conteo) conteo[estado]++
    else conteo.otros++
    if (estado === 'A' && !enBase.has(archivo)) soloEnRama.push(archivo)
    const partes = archivo.split('/')
    const carpeta = partes[0] === 'logic-core-v3' ? partes.slice(0, Math.min(partes.length - 1, 4)).join('/') : partes.slice(0, Math.min(partes.length - 1, 2)).join('/') || '(raiz)'
    carpetas.set(carpeta, (carpetas.get(carpeta) ?? 0) + 1)
  }

  // Edad del último commit PROPIO (no del último commit de main que trae la rama).
  const ultimoPropio = ahead > 0 ? git('log', '-1', '--format=%cI', `${BASE}..${ref}`) : null
  const edad = ultimoPropio ? edadDias(ultimoPropio) : null
  // Criterio de DEC-13: mergeada = sin commits propios; viva = commit propio en
  // los últimos 30 días o worktree activo; dormida = 31–60 días; abandonada = más.
  let estado
  if (ahead === 0) estado = 'mergeada'
  else if (edad <= 30 || worktrees.has(nombre)) estado = 'viva'
  else if (edad <= 60) estado = 'dormida'
  else estado = 'abandonada'

  ramas.push({
    nombre,
    ref,
    local_sha: local,
    remota_sha: remota,
    solo_local: !remota,
    solo_remota: !local,
    local_vs_remota: localVsRemota,
    worktree: worktrees.get(nombre) ?? null,
    ultimo_commit: { sha: sha.slice(0, 10), fecha, autor, asunto: asunto.length > 140 ? asunto.slice(0, 137) + '…' : asunto },
    ultimo_commit_propio: ultimoPropio,
    edad_dias: edad,
    ahead,
    behind,
    merge_base: mergeBase ? mergeBase.slice(0, 10) : null,
    fecha_merge_base: fechaMergeBase,
    estado,
    archivos_tocados: cambios.length,
    por_estado: conteo,
    solo_en_rama_total: soloEnRama.length,
    solo_en_rama_muestra: soloEnRama.slice(0, 40),
    carpetas_top: [...carpetas].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, n]) => `${c} (${n})`),
  })
}

mkdirSync(path.dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify({ base: BASE, sha_base: shaBase, hoy: HOY.toISOString().slice(0, 10), total: ramas.length, ramas }, null, 2) + '\n', 'utf8')

const porEstado = ramas.reduce((m, r) => ((m[r.estado] = (m[r.estado] ?? 0) + 1), m), {})
console.log(`base=${BASE} (${shaBase.slice(0, 8)})  ramas=${ramas.length}  ${JSON.stringify(porEstado)}`)
for (const r of ramas.sort((a, b) => (a.estado + a.nombre).localeCompare(b.estado + b.nombre))) {
  console.log(`${r.estado.padEnd(10)} ${r.nombre.padEnd(42)} +${String(r.ahead).padStart(4)} -${String(r.behind).padStart(4)}  ${r.ultimo_commit.fecha.slice(0, 10)}  solo-rama:${String(r.solo_en_rama_total).padStart(4)}${r.worktree ? `  [wt ${r.worktree}]` : ''}`)
}
console.log(`\nescrito: ${path.relative(appRoot, OUT)}`)
