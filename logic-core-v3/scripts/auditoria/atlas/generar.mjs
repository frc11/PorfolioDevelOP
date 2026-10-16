#!/usr/bin/env node
// Atlas — genera 06-ATLAS/atlas.json desde el árbol de una ref (ENMIENDA-01 E7, DEC-40) y agrega una línea a
// historial.jsonl. Portable: solo módulos nativos de Node y el binario de git; ningún import de src/.
//
// Lee de la carpeta del Atlas tres archivos de datos que mantienen las personas (ningún generador los pisa):
//   funcionalidades.json  — los nodos «funcionalidad» (id, nombre, descripcion, padre, archivos, entradas)
//   zonas.json            — archivos congelados y patrones de la zona de Franco
//   atlas.curado.json     — madurez, veredicto y alcance por nodo (solo se lee para el historial)
// y, si existen, hallazgos.json (validar.mjs --emitir) y backlog.json, también para el historial.
//
// Uso (desde cualquier carpeta):
//   node scripts/auditoria/atlas/generar.mjs --repo <raíz del repo> --ref <ref|HEAD|worktree> [--app logic-core-v3] [--atlas <carpeta>] [--sin-ramas]

import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { AREAS, HERRAMIENTAS, nodoDeRuta, nodoDeRama, nodoDeModelo } from './nodos.mjs'

const args = process.argv.slice(2)
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d)
const REPO = path.resolve(opt('--repo', execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()))
const REF = opt('--ref', 'HEAD')
const APP = opt('--app', 'logic-core-v3')
const ATLAS = path.resolve(opt('--atlas', path.join(REPO, APP, 'docs/auditoria-2026-10/06-ATLAS')))
const SIN_RAMAS = args.includes('--sin-ramas')
const git = (...a) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8', maxBuffer: 1 << 30 })
const gitRef = REF === 'worktree' ? 'HEAD' : REF
const leerJson = (f, d) => (existsSync(path.join(ATLAS, f)) ? JSON.parse(readFileSync(path.join(ATLAS, f), 'utf8')) : d)

// ── Árbol y contenidos ──────────────────────────────────────────────────────
const todos = (REF === 'worktree' ? git('ls-files', '--', APP) : git('ls-tree', '-r', '--name-only', gitRef, '--', APP)).split('\n').filter(Boolean)
const rel = (r) => r.slice(APP.length + 1)
const CODIGO = /\.(tsx?|jsx?|mjs|cjs)$/
// src/ y netlify/ enteros; además el código de scripts/, tests/ y prisma/ (seeds, migraciones; sin los dumps de
// prisma/backups/) y la config de la raíz de la app, para que los hallazgos sobre scripts, tests, seeds y config
// tengan nodo (lib.scripts, lib.tests, lib.prisma.*, lib.plataforma.*)
const CONFIG_RAIZ = /^[^/]+\.(ts|mjs|cjs|js|json|toml)$/
const relevantes = todos.filter((r) => {
  const x = rel(r)
  return /^(src|netlify)\//.test(x) || ['prisma/schema.prisma', 'netlify.toml', 'vercel.json'].includes(x) ||
    (/^(scripts|tests)\//.test(x) && CODIGO.test(x)) ||
    (/^prisma\//.test(x) && !/^prisma\/backups\//.test(x) && (CODIGO.test(x) || /\.sql$/.test(x))) ||
    (CONFIG_RAIZ.test(x) && x !== 'package-lock.json')
})
function leerVarios(rutas) {
  const m = new Map()
  if (REF === 'worktree') { for (const r of rutas) m.set(r, readFileSync(path.join(REPO, r), 'utf8')); return m }
  for (let ini = 0; ini < rutas.length; ini += 400) {
    const tramo = rutas.slice(ini, ini + 400)
    const out = execFileSync('git', ['-C', REPO, 'cat-file', '--batch'], { input: tramo.map((r) => `${gitRef}:${r}`).join('\n') + '\n', maxBuffer: 1 << 30 })
    let i = 0, k = 0
    while (i < out.length && k < tramo.length) {
      const nl = out.indexOf(10, i)
      const cab = out.subarray(i, nl).toString().split(' ')
      if (cab[1] === 'missing') { i = nl + 1; k++; continue }
      const tam = Number(cab[2])
      m.set(tramo[k], out.subarray(nl + 1, nl + 1 + tam).toString('utf8'))
      i = nl + 1 + tam + 1; k++
    }
  }
  return m
}
const texto = leerVarios(relevantes)
const lineas = (s) => (s ? s.split('\n').length : 0)

// ── Zonas ───────────────────────────────────────────────────────────────────
const zonas = leerJson('zonas.json', { congelados: [], franco: [] })
const congelados = new Set(zonas.congelados)
const franco = zonas.franco.map((s) => new RegExp(s))
const zonaArchivo = (r) => (franco.some((re) => re.test(r)) ? 'franco' : congelados.has(r) || zonas.congelados.some((c) => c.endsWith('/') && r.startsWith(c)) ? 'congelado' : 'libre')

// ── Nodos ───────────────────────────────────────────────────────────────────
const nodos = new Map()
const tipoDe = (id) => (/^h[1-6]$/.test(id) ? 'area' : /^h[1-6]\.[^.]+$/.test(id) ? 'herramienta' : /^h[1-6]\./.test(id) ? 'funcionalidad' : id.split('.')[0] === 'int' ? 'integracion' : id.split('.')[0] === 'modelo' ? 'modelo' : id.split('.')[0] === 'rama' ? 'rama' : id.split('.')[0] === 'doc' ? 'doc' : 'lib')
const nodo = (id, extra = {}) => {
  if (!nodos.has(id)) {
    const area = /^h[1-6]/.test(id) ? id.slice(0, 2) : null
    nodos.set(id, { id, tipo: tipoDe(id), nombre: id, padre: null, area, descripcion: '', archivos: [], loc: 0, rutas: [], modelos: [], entradas: [], dueno: 'Valentino', zona: 'libre', ultimo_commit: null, ramas: [] })
  }
  return Object.assign(nodos.get(id), extra)
}
for (const [a, nombre] of Object.entries(AREAS)) nodo(a, { nombre })
for (const [h, [a, nombre]] of Object.entries(HERRAMIENTAS)) nodo(`${a}.${h}`, { nombre, padre: a, area: a })

const nodoDeArchivo = new Map()
const enRelevantes = new Set(relevantes)
for (const r of todos) {
  const id = nodoDeRuta(r)
  if (!/^(src|netlify|prisma)\//.test(rel(r)) && !/^docs\//.test(rel(r)) && !enRelevantes.has(r)) continue
  if (/^docs\/(auditoria-|_insumos)/.test(rel(r))) continue
  nodoDeArchivo.set(r, id)
  const n = nodo(id)
  n.archivos.push(rel(r))
  n.loc += lineas(texto.get(r))
}
const funcs = leerJson('funcionalidades.json', { funcionalidades: [] }).funcionalidades
// una herramienta que solo nombran las funcionalidades (falta en la gramática de nodos.mjs) igual se crea
for (const f of funcs) if (!nodos.has(f.padre)) nodo(f.padre, { tipo: 'herramienta', nombre: f.padre, padre: f.padre.slice(0, 2), area: f.padre.slice(0, 2), descripcion: 'Herramienta que solo nombran las funcionalidades: falta en nodos.mjs.' })
for (const f of funcs) {
  const presentes = f.archivos.filter((a) => texto.has(`${APP}/${a}`))
  nodo(f.id, { tipo: 'funcionalidad', nombre: f.nombre, descripcion: f.descripcion ?? '', padre: f.padre, area: f.padre.slice(0, 2), archivos: presentes, entradas: f.entradas ?? [], loc: presentes.reduce((s, a) => s + lineas(texto.get(`${APP}/${a}`)), 0), ...(presentes.length < f.archivos.length ? { archivos_ausentes: f.archivos.filter((a) => !presentes.includes(a)) } : {}) })
}

// ── Modelos (parser directo del schema; no toca el schema) ──────────────────
const schema = texto.get(`${APP}/prisma/schema.prisma`) ?? ''
const modelos = [...schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)].map(([, nombre, cuerpo]) => {
  const campos = cuerpo.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//') && !l.startsWith('@@'))
  return { nombre, campos: campos.map((l) => { const [c, t] = l.split(/\s+/); return { c, t } }) }
})
const enums = new Set([...schema.matchAll(/^enum\s+(\w+)/gm)].map((m) => m[1]))
const nombresModelo = new Set(modelos.map((m) => m.nombre))
const aristas = []
const arista = (de, a, tipo, extra = {}) => { if (de !== a) aristas.push({ de, a, tipo, ...extra }) }
for (const m of modelos) {
  const rels = m.campos.filter((x) => nombresModelo.has(String(x.t).replace(/[?[\]]/g, ''))).map((x) => ({ campo: x.c, modelo: x.t.replace(/[?[\]]/g, ''), muchos: x.t.endsWith('[]'), opcional: x.t.endsWith('?') }))
  nodo(nodoDeModelo(m.nombre), { tipo: 'modelo', nombre: m.nombre, archivos: ['prisma/schema.prisma'], campos: m.campos.length, organizationId: m.campos.some((x) => x.c === 'organizationId'), relaciones: rels, zona: zonaArchivo(`${APP}/prisma/schema.prisma`) === 'franco' || /^OsLead|^OsSetter/.test(m.nombre) ? 'franco' : 'congelado' })
  for (const r of rels) if (!r.muchos) arista(nodoDeModelo(m.nombre), nodoDeModelo(r.modelo), 'depende', { campo: r.campo })
}

// ── Entradas: páginas, handlers y server actions ────────────────────────────
const urlDe = (r, base) => '/' + rel(r).replace(/^src\/app\/?/, '').replace(new RegExp(`/?${base}$`), '').split('/').filter((s) => s && !/^\(.*\)$/.test(s) && !s.startsWith('@')).join('/')
const paginas = [], handlers = [], acciones = []
for (const [r, s] of texto) {
  if (!CODIGO.test(r)) continue
  const n = nodos.get(nodoDeArchivo.get(r))
  if (/\/src\/app\/(.*\/)?page\.(tsx|ts|jsx|js)$/.test(r)) { const url = urlDe(r, 'page\\.(tsx|ts|jsx|js)'); paginas.push({ url, archivo: rel(r), nodo: n?.id }); n?.rutas.push(url); n?.entradas.push(`page ${url}`) }
  if (/\/src\/app\/(.*\/)?route\.(ts|js)$/.test(r)) {
    const url = urlDe(r, 'route\\.(ts|js)')
    const metodos = [...new Set([...s.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b|export\s+const\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b|export\s*\{([^}]*)\}/g)].flatMap((m) => (m[3] ? (m[3].match(/\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g) ?? []) : [m[1] ?? m[2]])))]
    handlers.push({ url, archivo: rel(r), metodos, nodo: n?.id }); n?.rutas.push(url); n?.entradas.push(`route ${metodos.join('|')} ${url}`)
  }
  // 'use server' a nivel de archivo, o inline dentro de una función (server actions definidas en una página)
  const directiva = /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*\s*['"]use server['"]/.test(s)
  const inline = !directiva && /\{\s*['"]use server['"]/.test(s)
  if (directiva || inline) {
    const funciones = directiva
      ? [...new Set([...s.matchAll(/export\s+async\s+function\s+(\w+)|export\s+const\s+(\w+)\s*=\s*async/g)].map((m) => m[1] ?? m[2]))]
      : [...new Set([...s.matchAll(/async\s+function\s+(\w+)\s*\([^)]*\)[^{]*\{\s*['"]use server['"]/g)].map((m) => m[1]))]
    acciones.push({ archivo: rel(r), funciones, nodo: n?.id }); for (const f of funciones) n?.entradas.push(`action ${f}`)
  }
}

// ── Aristas: importa, usa-modelo, llama-api, dispara, contiene ─────────────
const existe = (r) => texto.has(r) || todos.includes(r)
const resolver = (desde, esp) => {
  let base
  if (esp.startsWith('@/')) base = `${APP}/src/${esp.slice(2)}`
  else if (esp.startsWith('.')) base = path.posix.normalize(path.posix.join(path.posix.dirname(desde), esp))
  else return null
  for (const s of ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '/index.ts', '/index.tsx', '/index.js']) if (existe(base + s)) return base + s
  return null
}
const conteo = new Map()
const acc = new Map([...nombresModelo].map((m) => [m[0].toLowerCase() + m.slice(1), m]))
const LEE = new Set(['findMany', 'findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'count', 'aggregate', 'groupBy'])
const usos = new Map()
const handlerRe = handlers.map((h) => ({ ...h, re: new RegExp(`^${h.url.replace(/\[\[?\.\.\.[^/]+\]?\]/g, '.*').replace(/\[[^/]+\]/g, '[^/]+')}$`) }))
for (const [r, s] of texto) {
  if (!CODIGO.test(r)) continue
  const de = nodoDeArchivo.get(r)
  if (!de) continue
  for (const m of s.matchAll(/(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    const t = resolver(r, m[1] ?? m[2] ?? m[3])
    const a = t && nodoDeArchivo.get(t)
    if (a && a !== de) conteo.set(`${de}→${a}`, (conteo.get(`${de}→${a}`) ?? 0) + 1)
  }
  for (const m of s.matchAll(/\.(\w+)\.(findMany|findUnique|findUniqueOrThrow|findFirst|findFirstOrThrow|count|aggregate|groupBy|create|createMany|createManyAndReturn|update|updateMany|upsert|delete|deleteMany)\(/g)) {
    const mod = acc.get(m[1]); if (!mod) continue
    const k = `${de}→${mod}`; const u = usos.get(k) ?? { lee: 0, escribe: 0 }
    u[LEE.has(m[2]) ? 'lee' : 'escribe']++; usos.set(k, u)
    const n = nodos.get(de); if (!n.modelos.includes(mod)) n.modelos.push(mod)
  }
  for (const m of s.matchAll(/fetch\(\s*[`'"](\/api\/[^`'"?$]+)/g)) {
    const h = handlerRe.find((x) => x.re.test(m[1].replace(/\/$/, '')))
    if (h && h.nodo && h.nodo !== de) arista(de, h.nodo, 'llama-api', { url: m[1] })
  }
}
for (const [k, n] of conteo) { const [de, a] = k.split('→'); arista(de, a, 'importa', { peso: n }) }
for (const [k, u] of usos) { const [de, mod] = k.split('→'); arista(de, nodoDeModelo(mod), 'usa-modelo', u) }
for (const n of nodos.values()) if (n.padre) arista(n.padre, n.id, 'contiene')
// crons: netlify.toml (scheduled functions → la ruta que llaman) y vercel.json
const toml = texto.get(`${APP}/netlify.toml`) ?? ''
for (const m of toml.matchAll(/\[functions\.["']?([\w-]+)["']?\][^[]*?schedule\s*=\s*["']([^"']+)["']/g)) {
  const fn = [...texto.keys()].find((r) => r.startsWith(`${APP}/netlify/functions/${m[1]}.`))
  const ruta = fn && (texto.get(fn).match(/\/api\/cron\/[\w-]+/) ?? [])[0]
  const h = ruta && handlers.find((x) => x.url === ruta)
  arista('int.netlify', h?.nodo ?? 'int.cron', 'dispara', { schedule: m[2], funcion: m[1], ruta: ruta ?? null })
}
try { for (const c of JSON.parse(texto.get(`${APP}/vercel.json`) ?? '{}').crons ?? []) { const h = handlers.find((x) => x.url === c.path); arista('int.vercel', h?.nodo ?? 'int.cron', 'dispara', { schedule: c.schedule, ruta: c.path }) } } catch { /* vercel.json ausente o inválido */ }
for (const id of ['int.netlify', 'int.vercel']) if (aristas.some((x) => x.de === id)) nodo(id, { nombre: id === 'int.netlify' ? 'Netlify (scheduled functions)' : 'Vercel (crons registrados)' })

// ── Zona, dueño y último commit por nodo ────────────────────────────────────
for (const n of nodos.values()) {
  if (!n.archivos.length || n.tipo === 'modelo') continue
  const zs = n.archivos.map((a) => zonaArchivo(`${APP}/${a}`))
  const mayor = (z) => zs.filter((x) => x === z).length > zs.length / 2
  n.zona = mayor('franco') ? 'franco' : mayor('congelado') ? 'congelado' : 'libre'
}
for (const n of nodos.values()) n.dueno = n.zona === 'franco' ? 'Franco' : n.zona === 'congelado' ? 'FROZEN' : 'Valentino'
const ultimo = new Map()
let actual = null
for (const l of git('log', '--format=%x01%h|%ad', '--date=short', '--name-only', gitRef, '--', `${APP}/src`, `${APP}/prisma`, `${APP}/netlify`).split('\n')) {
  if (l.startsWith('\x01')) actual = l.slice(1)
  else if (l && !ultimo.has(l)) ultimo.set(l, actual)
}
for (const n of nodos.values()) {
  const cs = n.archivos.map((a) => ultimo.get(`${APP}/${a}`)).filter(Boolean)
  if (cs.length) { const [h, f] = cs.sort((x, y) => y.split('|')[1].localeCompare(x.split('|')[1]))[0].split('|'); n.ultimo_commit = { sha: h, fecha: f } }
}

// ── Ramas ───────────────────────────────────────────────────────────────────
if (!SIN_RAMAS) {
  const sha = git('rev-parse', gitRef).trim()
  const wts = new Map(git('worktree', 'list', '--porcelain').split('\n\n').map((b) => [((b.match(/^branch refs\/heads\/(.+)$/m) ?? [])[1]), (b.match(/^worktree (.+)$/m) ?? [])[1]]).filter(([b]) => b))
  const refs = git('for-each-ref', '--format=%(refname:short)|%(committerdate:short)', 'refs/heads', 'refs/remotes').split('\n').filter((l) => l && !/\/HEAD\|/.test(l) && !/^origin\|/.test(l))
  const vistas = new Map()
  for (const l of refs) { const [ref, fecha] = l.split('|'); const nombre = ref.replace(/^origin\//, ''); if (!vistas.has(nombre) || ref.startsWith('origin/')) vistas.set(nombre, { ref, fecha }) }
  const hoy = new Date()
  for (const [nombre, { ref, fecha }] of vistas) {
    const [behind, ahead] = git('rev-list', '--left-right', '--count', `${sha}...${ref}`).trim().split(/\s+/).map(Number)
    const edad = Math.round((hoy - new Date(fecha)) / 864e5)
    const estado = ahead === 0 ? 'mergeada' : edad <= 30 || wts.has(nombre) ? 'viva' : edad <= 60 ? 'dormida' : 'abandonada'
    const id = nodoDeRama(nombre)
    nodo(id, { tipo: 'rama', nombre, ahead, behind, ultimo_commit: { fecha }, estado, worktree: wts.get(nombre) ?? null, zona: 'libre', dueno: '' })
    if (ahead > 0) {
      const mb = git('merge-base', sha, ref).trim()
      const tocados = new Set(git('diff', '--name-only', mb, ref, '--', APP).split('\n').filter(Boolean).map((r) => nodoDeRuta(r)))
      for (const t of tocados) { const n = nodos.get(t); if (n && !n.ramas.includes(nombre)) n.ramas.push(nombre) }
      nodos.get(id).nodos_tocados = tocados.size
    }
  }
}

// ── Salida ──────────────────────────────────────────────────────────────────
let remoto = ''
try { remoto = git('remote', 'get-url', 'origin').trim().replace(/^https:\/\/[^@]+@/, 'https://') } catch { remoto = path.basename(REPO) }
const generado = { repo: remoto, app: APP, ref: REF, sha: git('rev-parse', gitRef).trim(), fecha: new Date().toISOString().slice(0, 10) }
const lista = [...nodos.values()].sort((a, b) => a.id.localeCompare(b.id))
const atlas = { schemaVersion: 1, generado, control: { paginas: paginas.length, handlers: handlers.length, archivos_con_acciones: acciones.length, modelos: modelos.length, enums: enums.size, funcionalidades: funcs.length }, entradas: { paginas, handlers, acciones }, nodos: lista, aristas }
writeFileSync(path.join(ATLAS, 'atlas.json'), JSON.stringify(atlas, null, 1) + '\n', 'utf8')

// historial.jsonl: una línea por corrida, sin pisar las anteriores
const curado = leerJson('atlas.curado.json', { nodos: {} }).nodos
const contar = (k) => Object.values(curado).reduce((a, x) => { const v = x[k] ?? 'sin dato'; a[v] = (a[v] ?? 0) + 1; return a }, {})
const hall = leerJson('hallazgos.json', { hallazgos: [] }).hallazgos
const back = leerJson('backlog.json', { tarjetas: [] }).tarjetas ?? []
const linea = { fecha: generado.fecha, sha: generado.sha, por_madurez: contar('madurez'), por_veredicto: contar('veredicto'), por_alcance: contar('alcance'), hallazgos_abiertos_por_severidad: hall.filter((h) => h.estado !== 'cerrado').reduce((a, h) => { a[h.severidad] = (a[h.severidad] ?? 0) + 1; return a }, {}), loc_total: lista.filter((n) => n.tipo !== 'funcionalidad' && n.tipo !== 'modelo').reduce((s, n) => s + n.loc, 0), tarjetas_por_estado: back.reduce((a, t) => { a[t.estado] = (a[t.estado] ?? 0) + 1; return a }, {}) }
appendFileSync(path.join(ATLAS, 'historial.jsonl'), JSON.stringify(linea) + '\n', 'utf8')
const porTipo = lista.reduce((a, n) => { a[n.tipo] = (a[n.tipo] ?? 0) + 1; return a }, {})
console.log(`atlas.json (${REF} @ ${generado.sha.slice(0, 8)}): ${lista.length} nodos ${JSON.stringify(porTipo)} · ${aristas.length} aristas · control ${JSON.stringify(atlas.control)}`)
