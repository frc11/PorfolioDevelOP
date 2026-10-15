#!/usr/bin/env node
// Auditoría de renovación 2026-10 — validador de los entregables (DEC-32).
//
// Se corre antes de cada commit. Chequea sobre docs/auditoria-2026-10/:
//  1. Cada bloque `### [ID] …` tiene los campos de su tipo:
//     hallazgos (SEC/BUG/TEC/PERF/DEU/A11Y/UX/FAL/DIS/IDEA): §5.1 del PROMPT + `Nodo(s)`;
//     POD (10-PODA), PLAN (12-PLANEADO, encabezado ####), VH (08), CNG (11), B (07).
//  2. La evidencia trae `ruta:línea`; la ruta existe en la ref (o lleva `raíz:` /
//     `rama:<rama>:`) y la línea no pasa el largo del archivo.
//  3. IDs únicos; los `[ID]` citados existen.
//  4. `Nodo(s)` con al menos un id de la gramática del Atlas.
//  5. Zona coherente con el ledger (aviso): evidencia en archivo ZONA-FRANCO o FROZEN
//     con Zona «libre».
//  6. Cero coincidencias de patrones de secrets en toda la carpeta (incluido _crudo/).
// Con --emitir escribe 06-ATLAS/hallazgos.json (ENMIENDA-01 E7) desde los bloques.
//
// Uso (desde logic-core-v3): node scripts/auditoria/validar.mjs [--ref origin/main] [--emitir]

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const REF = opt('--ref', 'origin/main')
const appRoot = process.cwd()
const DIR = path.resolve(appRoot, 'docs/auditoria-2026-10')
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()

const errores = []
const avisos = []
const err = (donde, msg) => errores.push(`${donde}: ${msg}`)
const aviso = (donde, msg) => avisos.push(`${donde}: ${msg}`)

// ── Archivos de la carpeta ───────────────────────────────────────────────────
function recorrer(d) { return readdirSync(d).flatMap((n) => { const p = path.join(d, n); return statSync(p).isDirectory() ? recorrer(p) : [p] }) }
const todos = recorrer(DIR)
const mds = todos.filter((f) => f.endsWith('.md') && !/[\\/]_crudo[\\/]/.test(f) && !/PROMPT\.md$|ENMIENDA-\d+\.md$/.test(f))

// ── Árbol de la ref y largo de archivos (lazy) ───────────────────────────────
const arbol = new Set(execFileSync('git', ['-c', 'core.quotepath=off', 'ls-tree', '-r', '--name-only', REF], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n').filter(Boolean))
const largos = new Map()
function largo(rutaRepo, ref = REF) {
  const k = `${ref}:${rutaRepo}`
  if (largos.has(k)) return largos.get(k)
  const r = spawnSync('git', ['show', k], { cwd: repoRoot, maxBuffer: 1 << 28 })
  const n = r.status === 0 ? (r.stdout.toString('utf8').match(/\n/g) ?? []).length + 1 : null
  largos.set(k, n)
  return n
}

// ── Ledger (zonas) ───────────────────────────────────────────────────────────
function parsearFila(l) { const f = []; let a = '', q = false; for (let i = 0; i < l.length; i++) { const c = l[i]; if (q) { if (c === '"' && l[i + 1] === '"') { a += '"'; i++ } else if (c === '"') q = false; else a += c } else if (c === '"') q = true; else if (c === ',') { f.push(a); a = '' } else a += c } f.push(a); return f }
const ledger = new Map(readFileSync(path.join(DIR, '_cobertura.csv'), 'utf8').replace(/\r\n/g, '\n').split('\n').slice(1).filter(Boolean).map(parsearFila).map((f) => [f[0], f[5] ?? '']))

// ── Parseo de bloques ────────────────────────────────────────────────────────
const PREFIJOS_HALLAZGO = ['SEC', 'BUG', 'TEC', 'PERF', 'DEU', 'A11Y', 'UX', 'FAL', 'DIS', 'IDEA']
const CAMPOS = {
  hallazgo: ['Dominio:', 'Severidad:', 'Tipo:', 'Confianza:', 'Evidencia:', 'Impacto:', 'Propuesta:', 'Esfuerzo:', 'Zona:', 'Nodo(s):'],
  POD: ['Qué rompe si se borra:', 'Confianza de poda:', 'Propuesta:', 'Zona:', 'Nodo(s):'],
  PLAN: ['Fuente:', 'Nodo(s):', 'Estado en código:'],
  VH: ['Verifica:', 'Entorno:', 'Pasos:', 'Resultado esperado:', 'Señal de falla:', '¿Escribe en la base o manda emails?:'],
  CNG: ['Origen:', 'Recomendación:', 'Nodo(s):'],
  B: ['Objetivo', 'Zona:', 'Tamaño:', 'Nodo(s):'],
}
const NODO_VALIDO = /^(h[1-6](\.[a-z0-9-]+){0,2}|lib(\.[a-z0-9-]+)+|int(\.[a-z0-9-]+)+|modelo\.[A-Za-z0-9]+|rama\.[a-z0-9-]+|doc\.[a-z0-9-]+)$/
const definidos = new Map()
const citados = []
const hallazgos = []
for (const f of mds) {
  const rel = path.relative(DIR, f).split(path.sep).join('/')
  const texto = readFileSync(f, 'utf8').replace(/\r\n/g, '\n')
  const bloques = texto.split(/\n(?=#{3,4} \[[A-Z0-9]+-\d+\])/)
  for (const b of bloques) {
    const m = b.match(/^#{3,4} \[([A-Z0-9]+)-(\d+)\] (.+)$/m)
    if (!m || b.indexOf(m[0]) > 5) continue
    const id = `${m[1]}-${m[2]}`
    const prefijo = m[1]
    if (definidos.has(id)) err(rel, `ID duplicado ${id} (también en ${definidos.get(id)})`)
    definidos.set(id, rel)
    const tipoBloque = PREFIJOS_HALLAZGO.includes(prefijo) ? 'hallazgo' : prefijo
    const campos = CAMPOS[tipoBloque]
    if (campos) for (const c of campos) if (!b.includes(c)) err(rel, `${id} sin el campo «${c}»`)
    for (const r of b.matchAll(/\[([A-Z0-9]+-\d+)\]/g)) if (r[1] !== id) citados.push([rel, id, r[1]])
    const nodos = (b.match(/Nodo\(s\):\s*([^\n]+)/) ?? [])[1]
    if (nodos !== undefined) {
      const lista = nodos.split(/[,·]/).map((s) => s.replace(/`/g, '').trim().split(/\s/)[0]).filter(Boolean)
      if (!lista.some((n) => NODO_VALIDO.test(n))) err(rel, `${id} sin un id de nodo válido en «${nodos.slice(0, 80)}»`)
    }
    // Evidencia: solo en hallazgos (y POD/PLAN no la exigen con línea).
    if (tipoBloque === 'hallazgo') {
      const ev = (b.match(/- Evidencia:([^\n]*(?:\n(?!- [A-ZÁÉÍÓÚ¿][^:\n]{1,40}:)[^\n]*)*)/) ?? [])[1] ?? ''
      const refs = [...ev.matchAll(/`((?:raíz:|rama:[^:`\s]+:)?[^`\s:]+\.[A-Za-z0-9]+):(\d+)(?:-(\d+))?`/g)]
      if (!refs.length) err(rel, `${id} sin ninguna evidencia \`ruta:línea\``)
      for (const [, rutaCruda, l1, l2] of refs) {
        let ref = REF, ruta = rutaCruda
        if (ruta.startsWith('raíz:')) ruta = ruta.slice('raíz:'.length)
        else if (ruta.startsWith('rama:')) { const p = ruta.split(':'); ref = p[1]; ruta = `logic-core-v3/${p.slice(2).join(':')}` }
        else ruta = `logic-core-v3/${ruta}`
        if (ref === REF && !arbol.has(ruta)) { err(rel, `${id}: ${rutaCruda} no existe en ${REF}`); continue }
        const n = largo(ruta, ref)
        if (n === null) { err(rel, `${id}: no se pudo leer ${ref}:${ruta}`); continue }
        if (Number(l2 ?? l1) > n) err(rel, `${id}: ${rutaCruda}:${l2 ?? l1} pasa el largo del archivo (${n})`)
        const notas = ledger.get(ruta) ?? ''
        const zona = (b.match(/Zona:\s*([^\n·]+)/) ?? [])[1] ?? ''
        if (/ZONA-FRANCO/.test(notas) && !/ZONA-FRANCO/.test(zona)) aviso(rel, `${id}: evidencia en zona de Franco (${rutaCruda}) con Zona «${zona.trim()}»`)
        if (/(^|; )FROZEN(;|$| )/.test(notas) && !/FROZEN|congelado/i.test(zona)) aviso(rel, `${id}: evidencia en archivo congelado (${rutaCruda}) con Zona «${zona.trim()}»`)
      }
      const sev = (b.match(/Severidad:\s*(CRÍTICA|ALTA|MEDIA|BAJA)/) ?? [])[1] ?? null
      const conf = (b.match(/Confianza:\s*(VERIFICADO-POR-LECTURA|PROBABLE|HIPÓTESIS)/) ?? [])[1] ?? null
      if (prefijo !== 'DIS' && prefijo !== 'IDEA') {
        if (!sev) err(rel, `${id} sin severidad válida`)
        if (!conf) err(rel, `${id} sin confianza válida`)
      }
      const primera = refs[0]
      hallazgos.push({ id, titulo: m[3].trim(), severidad: sev, tipo: (b.match(/Tipo:\s*([a-z0-9-]+)/) ?? [])[1] ?? null, confianza: conf, nodo: nodos ? nodos.split(/[,·]/).map((s) => s.trim().split(/\s/)[0]).filter((n) => NODO_VALIDO.test(n)) : [], archivo: primera ? primera[1] : null, linea: primera ? Number(primera[2]) : null, zona: ((b.match(/Zona:\s*([^\n·]+)/) ?? [])[1] ?? '').trim(), estado: /RETIRADO|retirado:/.test(b) ? 'retirado' : 'abierto', documento: rel })
    }
  }
}
for (const [rel, desde, a] of citados) if (!definidos.has(a)) err(rel, `${desde} cita [${a}], que no existe`)

// ── Secrets en toda la carpeta ───────────────────────────────────────────────
const PATRONES = [
  /sk-ant-[A-Za-z0-9_-]{20,}/, /AIza[0-9A-Za-z_-]{35}/, /xkeysib-[a-f0-9]{20,}/, /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\b(ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/, /\bAKIA[0-9A-Z]{16}\b/, /sntrys_[A-Za-z0-9]{20,}/, /\bnpg_[A-Za-z0-9]{10,}/, /\bwhsec_[A-Za-z0-9]{20,}/,
  /postgres(ql)?:\/\/[^:@/\s'"<]+:[^@/\s'"<>]{6,}@(?!localhost|127\.0\.0\.1)[a-z0-9.-]+/i, /GOCSPX-[A-Za-z0-9_-]{20,}/, /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/, /\bEAA[A-Za-z0-9]{30,}/,
  /\bcal_(live|test)_[A-Za-z0-9]{16,}/, /\bnfp_[A-Za-z0-9]{20,}/, /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  /\b[A-Z0-9_]*(KEY|SECRET|TOKEN)\b["']?\s*[:=]\s*['"]?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  /\b(pass(word)?|pwd|contrase(ñ|n)a)\b\s*[:=]\s*['"](?![$<{…])[^'"\s…]{6,}['"]/i,
]
for (const f of todos) {
  if (!/\.(md|json|csv|txt|jsonl)$/.test(f)) continue
  const lineas = readFileSync(f, 'utf8').split('\n')
  lineas.forEach((l, i) => { for (const re of PATRONES) if (re.test(l)) err(path.relative(DIR, f), `línea ${i + 1}: patrón de secret (${re.source.slice(0, 30)}…)`) })
}

// ── Tope de 300 KB por archivo de _crudo/ (PROMPT §5) ───────────────────────
// Lo que pasa el tope queda local (no se commitea) y se anota en el plan; lo que la corrida
// necesita para regenerar va partido con crudo-partes.mjs.
const LOCALES = new Set(['_crudo/depcruise.json'])
// El script de un workflow de F2 (_crudo/ciclos/<ciclo>.workflow.js) se regenera igual con
// f2-construir.mjs desde <ciclo>.args.json + plantilla + PROMPT.md: si pasa el tope queda local
// (aviso) mientras no esté en el índice de git; si alguien lo stageó, es error como cualquier otro.
const enIndice = new Set(execFileSync('git', ['-c', 'core.quotepath=off', 'ls-files', '--', path.join(DIR, '_crudo')], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 1 << 24 }).split('\n').filter(Boolean).map((p) => p.replace(/^.*?docs\/auditoria-2026-10\//, '')))
for (const f of todos) {
  const rel = path.relative(DIR, f).split(path.sep).join('/')
  if (!rel.startsWith('_crudo/') || LOCALES.has(rel)) continue
  const bytes = statSync(f).size
  if (bytes <= 300 * 1024) continue
  if (/^_crudo\/ciclos\/[^/]+\.workflow\.js$/.test(rel) && !enIndice.has(rel)) aviso(rel, `pesa ${Math.round(bytes / 1024)} KB: queda local (se regenera con f2-construir.mjs desde ${rel.replace(/\.workflow\.js$/, '.args.json').replace(/^_crudo\/ciclos\//, '')})`)
  else err(rel, `pesa ${Math.round(bytes / 1024)} KB: el tope de lo crudo es 300 KB (partirlo con crudo-partes.mjs o dejarlo local)`)
}

if (args.includes('--emitir')) {
  const destino = path.join(DIR, '06-ATLAS')
  mkdirSync(destino, { recursive: true })
  writeFileSync(path.join(destino, 'hallazgos.json'), JSON.stringify({ schemaVersion: 1, generado: { ref: REF }, hallazgos }, null, 1) + '\n', 'utf8')
}

const porPrefijo = [...definidos.keys()].reduce((m, id) => { const p = id.split('-')[0]; m[p] = (m[p] ?? 0) + 1; return m }, {})
console.log(`validar: ${mds.length} documentos · bloques ${definidos.size} ${JSON.stringify(porPrefijo)} · hallazgos ${hallazgos.length}`)
console.log(`errores: ${errores.length} · avisos: ${avisos.length}`)
for (const e of errores.slice(0, 60)) console.log(`  ERROR ${e}`)
for (const a of avisos.slice(0, 30)) console.log(`  aviso ${a}`)
process.exit(errores.length ? 1 : 0)
