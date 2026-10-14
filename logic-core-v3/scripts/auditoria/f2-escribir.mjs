#!/usr/bin/env node
// Auditoría de renovación 2026-10 — vuelca un ciclo de F2 ya revisado por el padre.
//
// Entrada: _crudo/ciclos/<ciclo>-revision.json (de f2-procesar.mjs, con las decisiones del
// padre), los crudos por lote (_crudo/ciclos/<ciclo>-<lote>.json) y los argumentos del ciclo
// (_crudo/ciclos/<ciclo>.args.json). Hace, en este orden:
//  1. Hallazgos «aceptar» → IDs globales (máximo existente + 1 por prefijo, DEC-24) y al
//     registro _crudo/hallazgos.json; confianza VERIFICADO-POR-LECTURA solo si el padre leyó
//     las líneas (verificado_padre), PROBABLE para el resto de MEDIA/BAJA (DEC-37). Una
//     CRÍTICA/ALTA sin verificado_padre corta todo. «descartar» → _crudo/descartados.json
//     con su motivo (DEC-31).
//  2. Los que requieren verificación humana → VH-NNN en 08 con su caso de prueba.
//  3. Lo planeado cruzado → _crudo/planeado-cruces.json (y avisa los ítems sin cruce).
//  4. Acumulados por lote (idempotentes): funcionalidades, entradas, flujos, previas,
//     alertas, poda, patrones y ausencias en _crudo/*.json.
//  5. Ledger: los archivos del lote leídos completos → «leído» con el ciclo.
//  6. Regenera 03/02/09 (hallazgos-md.mjs) y 12-PLANEADO.md (planeado-md.mjs).
// Idempotente: lo que ya tiene id_asignado no se vuelve a escribir.
//
// Uso (desde logic-core-v3): node scripts/auditoria/f2-escribir.mjs docs/auditoria-2026-10/_crudo/ciclos/<ciclo>-revision.json

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { HERRAMIENTAS, nodoDeRuta } from './atlas/nodos.mjs'

const APP = process.cwd()
const DIR = path.resolve(APP, 'docs/auditoria-2026-10')
const CRUDO = path.join(DIR, '_crudo')
const CICLOS = path.join(CRUDO, 'ciclos')
const leer = (f, d) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, '')) : d)
const escribir = (f, o) => writeFileSync(f, JSON.stringify(o, null, 1), 'utf8')
const REV = path.resolve(APP, process.argv[2] ?? '')
const rev = leer(REV, null)
if (!rev) { console.error('uso: f2-escribir.mjs <ciclo>-revision.json'); process.exit(1) }
const { ciclo, dominio } = rev
const SEV = { 'CRÍTICA': 0, ALTA: 1, MEDIA: 2, BAJA: 3 }
const PREFIJOS = ['SEC', 'BUG', 'TEC', 'PERF', 'DEU', 'A11Y', 'UX', 'FAL']
const TIPO = { SEC: 'seguridad', BUG: 'bug', TEC: 'tech-vieja', PERF: 'perf', DEU: 'deuda', A11Y: 'a11y', UX: 'ux', FAL: 'faltante' }
const NODO_VALIDO = /^(h[1-6](\.[a-z0-9-]+){0,2}|lib(\.[a-z0-9-]+)+|int(\.[a-z0-9-]+)+|modelo\.[A-Za-z0-9]+|rama\.[a-z0-9-]+|doc\.[a-z0-9-]+)$/
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()
const normRuta = (r) => {
  // sin anotaciones del lector como «(traza)» o «(re-verificación …)»
  let s = String(r ?? '').replace(/\\/g, '/').replace(/\s+\(.*\)\s*$/, '').trim()
  if (/^[A-Za-z]:\/auditoria-2026-10\/(?!logic-core-v3\/)/.test(s)) return `raíz:${s.replace(/^[A-Za-z]:\/auditoria-2026-10\//, '')}`
  s = s.replace(/^.*?logic-core-v3\//, '')
  if (/^\.github\//.test(s)) return `raíz:${s}`
  return s
}

// ── 0. Todo revisado ─────────────────────────────────────────────────────────
const sinRevisar = rev.hallazgos.filter((h) => ['leer', 'leer-refutada', 'muestrear'].includes(h.decision))
if (sinRevisar.length) { console.error(`faltan decisiones del padre en ${sinRevisar.length}: ${sinRevisar.map((h) => `${h.tmp} [${h.decision}]`).join(', ')}`); process.exit(1) }
const malas = rev.hallazgos.filter((h) => h.decision === 'aceptar' && !h.id_asignado && SEV[h.severidad] <= 1 && !h.verificado_padre)
if (malas.length) { console.error(`CRÍTICA/ALTA aceptadas sin verificado_padre: ${malas.map((h) => h.tmp).join(', ')}`); process.exit(1) }

const lotes = new Map()
for (const l of rev.lotes.filter((x) => x.estado === 'leido')) lotes.set(l.lote, leer(path.join(CICLOS, `${ciclo}-${l.lote}.json`), null)?.lectura ?? null)
const args = leer(path.join(CICLOS, `${ciclo}.args.json`), null)
if (!args) console.log(`aviso: no está ${ciclo}.args.json — no se puede medir qué PLAN quedaron sin cruce ni qué archivos eran del lote`)

// ── 1. IDs ───────────────────────────────────────────────────────────────────
const REG = path.join(CRUDO, 'hallazgos.json')
const reg = leer(REG, null)
if (!reg) { console.error('falta _crudo/hallazgos.json: correr antes node scripts/auditoria/hallazgos-md.mjs'); process.exit(1) }
const maximos = new Map()
const usar = (id) => { const [p, n] = String(id).split('-'); if (Number(n) > (maximos.get(p) ?? 0)) maximos.set(p, Number(n)) }
for (const h of reg.hallazgos) usar(h.id)
const recorrer = (d) => readdirSync(d).flatMap((f) => { const p = path.join(d, f); return f === '_crudo' ? [] : statSync(p).isDirectory() ? recorrer(p) : [p] })
for (const f of recorrer(DIR).filter((x) => x.endsWith('.md'))) for (const m of readFileSync(f, 'utf8').matchAll(/^#{3,4} \[?([A-Z0-9]+)-(\d+)\]?[ ·]/gm)) usar(`${m[1]}-${m[2]}`)
const siguiente = (p) => { const n = (maximos.get(p) ?? 0) + 1; maximos.set(p, n); return `${p}-${String(n).padStart(3, '0')}` }

// previas que citan los archivos de la evidencia (para la línea «Relacionado»)
const previasIdx = leer(path.join(CRUDO, 'previas.json'), { items: [] }).items
const previasDe = (h, lectura) => {
  const rutas = new Set((h.evidencia ?? []).map((e) => normRuta(e.ruta)))
  const reverif = new Map((lectura?.previas_reverificadas ?? []).map((p) => [`${p.doc}|${p.id_previo}`, p.estado]))
  return previasIdx.filter((p) => (p.archivos_citados ?? []).some((c) => rutas.has(normRuta(c.replace(/:\d+(-\d+)?$/, '')))) && ['abierto', 'parcial'].includes(reverif.get(`${p.doc}|${p.id_previo}`)))
    .map((p) => `\`${p.doc}:${p.linea}\` (${p.id_previo})`).slice(0, 4)
}

const nuevos = []
const descartados = leer(path.join(CRUDO, 'descartados.json'), { items: [] })
const vhPorCaso = new Map()
for (const h of rev.hallazgos) {
  const lectura = lotes.get(h.lote)
  if (h.decision === 'descartar') {
    if (!descartados.items.some((d) => d.tmp === h.tmp)) descartados.items.push({ ciclo, lote: h.lote, tmp: h.tmp, titulo: h.titulo, severidad: h.severidad, prefijo: h.prefijo, motivo_padre: h.nota_padre || '(sin motivo)', verificador: h.verificador ? { se_sostiene: h.verificador.se_sostiene, severidad_ajustada: h.verificador.severidad_ajustada, motivo: h.verificador.motivo } : null, evidencia: (h.evidencia ?? []).map((e) => `${normRuta(e.ruta)}:${e.linea}`) })
    continue
  }
  if (h.decision !== 'aceptar' || h.id_asignado) continue
  if (!PREFIJOS.includes(h.prefijo)) { console.error(`${h.tmp}: prefijo inválido ${h.prefijo}`); process.exit(1) }
  const id = siguiente(h.prefijo)
  const evidencia = (h.evidencia ?? []).map((e) => ({ ruta: normRuta(e.ruta), linea: e.linea, ...(e.linea_fin ? { linea_fin: e.linea_fin } : {}), fragmento: e.fragmento }))
  let nodos = (h.nodos ?? []).map((n) => String(n).trim()).filter(Boolean)
  if (!nodos.some((n) => NODO_VALIDO.test(n))) nodos = [...new Set([...nodos, ...evidencia.map((e) => nodoDeRuta(e.ruta)).filter((n) => NODO_VALIDO.test(n))])]
  const confianza = h.verificado_padre ? 'VERIFICADO-POR-LECTURA' : h.confianza === 'HIPÓTESIS' ? 'HIPÓTESIS' : SEV[h.severidad] >= 2 ? 'PROBABLE' : h.confianza
  let vh = null
  if (h.requiere_verificacion_humana) {
    const casos = lectura?.casos_prueba_manual ?? []
    const t = norm(h.titulo)
    const caso = h.caso ?? casos.find((c) => norm(c.hallazgos).includes(t.slice(0, 50))) ?? casos.find((c) => norm(c.titulo) === t) ?? casos.find((c) => t && norm(c.hallazgos).split(' ').filter((w) => w.length > 4 && t.includes(w)).length >= 4)
    if (!caso) console.log(`aviso: ${id} (${h.tmp}) pide verificación humana y no tiene caso de prueba: agregá «caso» en la revisión`)
    else {
      if (!vhPorCaso.has(caso)) vhPorCaso.set(caso, { vh: siguiente('VH'), ids: [], prioridad: 3 })
      const e = vhPorCaso.get(caso)
      e.ids.push(id)
      e.prioridad = Math.min(e.prioridad, SEV[h.severidad] ?? 3)
      vh = e.vh
    }
  }
  const entrada = {
    id, prefijo: h.prefijo, titulo: h.titulo, dominio, severidad: h.severidad, tipo: TIPO[h.prefijo], tipo_detalle: h.tipo, confianza,
    evidencia, impacto: h.impacto, propuesta: h.propuesta, esfuerzo: h.esfuerzo, zona: h.zona, nodos,
    relacionados_ids: h.relacionados_ids ?? [], previas: h.previas ?? previasDe(h, lectura), relacionados_texto: h.relacionados ?? '',
    vh, ...(h.seccion ? { seccion: h.seccion } : {}), ...(h.coordinacion ? { coordinacion: h.coordinacion } : {}), ...(h.como_verificar ? { como_verificar: h.como_verificar } : {}),
    origen: { ciclo, lote: h.lote, tmp: h.tmp, verificado_padre: !!h.verificado_padre, nota_padre: h.nota_padre || '', verificador: h.verificador ? { se_sostiene: h.verificador.se_sostiene, severidad_ajustada: h.verificador.severidad_ajustada } : null },
    estado: 'vigente',
  }
  reg.hallazgos.push(entrada)
  h.id_asignado = id
  h.vh_asignado = vh
  nuevos.push(entrada)
}
escribir(REG, reg)
escribir(path.join(CRUDO, 'descartados.json'), descartados)

// ── 2. VH en 08 ──────────────────────────────────────────────────────────────
const PRIO = ['alta', 'alta', 'media', 'baja']
const limpiar = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()
if (vhPorCaso.size) {
  const p08 = path.join(DIR, '08-VERIFICACION-HUMANA.md')
  let t08 = readFileSync(p08, 'utf8').replace(/\r\n/g, '\n').trimEnd()
  for (const [c, { vh, ids, prioridad }] of vhPorCaso) {
    t08 += `\n\n### [${vh}] ${limpiar(c.titulo)}\n- Verifica: ${ids.map((i) => `[${i}]`).join(', ')} · Prioridad: ${PRIO[prioridad]}\n- Entorno: ${limpiar(c.entorno)}\n- Precondiciones: ${limpiar(c.precondiciones) || '—'}\n- Pasos: ${(c.pasos ?? []).map((p, i) => `${i + 1}) ${limpiar(p)}`).join(' ')}\n- Resultado esperado: ${limpiar(c.esperado)}\n- Señal de falla: ${limpiar(c.senal_falla)}\n- ¿Escribe en la base o manda emails?: ${c.escribe_db_o_email ? 'sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción' : 'no'}`
  }
  writeFileSync(p08, `${t08}\n`, 'utf8')
}

// ── 3. Lo planeado ───────────────────────────────────────────────────────────
const PC = path.join(CRUDO, 'planeado-cruces.json')
const cruces = leer(PC, {})
const mdPlan = readFileSync(path.join(DIR, '12-PLANEADO.md'), 'utf8')
const idAClave = new Map([...mdPlan.matchAll(/^#### \[(PLAN-\d+)\] .*?\n- Fuente: `([^`]+)`/gm)].map((m) => [m[1], m[2]]))
const claves = new Set(idAClave.values())
let aplicados = 0
const sinCruce = []
for (const [lote, lectura] of lotes) {
  const devueltos = new Set()
  for (const pc of lectura?.planeado_cruzado ?? []) {
    const clave = claves.has(pc.clave) ? pc.clave : idAClave.get(pc.id)
    if (!clave) { console.log(`aviso: ${lote} devolvió un cruce sin id/clave válidos (${pc.id} / ${pc.clave})`); continue }
    devueltos.add(clave)
    cruces[clave] = { estado: pc.estado_en_codigo, evidencia: limpiar(pc.evidencia), sentido: pc.sigue_teniendo_sentido, ...(pc.nota ? { nota: limpiar(pc.nota) } : {}), ciclo: `${ciclo}, lector ${lote}` }
    aplicados++
  }
  const asignados = (args?.lotes ?? []).find((l) => l.id === lote)?.planeado ?? []
  for (const p of asignados) if (!devueltos.has(p.clave)) sinCruce.push(`${p.id} (${lote})`)
}
escribir(PC, cruces)

// ── 4. Acumulados ────────────────────────────────────────────────────────────
const normHerr = (h) => { const s = String(h ?? ''); if (/^h\d\./.test(s)) return s; return HERRAMIENTAS[s] ? `${HERRAMIENTAS[s][0]}.${s}` : s }
const ACUM = {
  'funcionalidades.json': (l) => (l.funcionalidades ?? []).map((f) => ({ ...f, herramienta: normHerr(f.herramienta) })),
  'entradas.json': (l) => l.entradas ?? [],
  'flujos.json': (l) => l.flujos ?? [],
  'previas-estado.json': (l) => l.previas_reverificadas ?? [],
  'alertas-estado.json': (l) => l.alertas_verificadas ?? [],
  'poda-f2.json': (l) => l.candidatos_poda ?? [],
  'patrones.json': (l) => l.patrones_a_cruzar ?? [],
  'ausencias.json': (l) => l.ausencias ?? [],
}
for (const [archivo, sacar] of Object.entries(ACUM)) {
  const f = path.join(CRUDO, archivo)
  const a = leer(f, { items: [] })
  for (const [lote, lectura] of lotes) {
    if (!lectura) continue
    const nuevosItems = sacar(lectura).map((x) => ({ ciclo, lote, ...x }))
    a.items = a.items.filter((x) => !(x.ciclo === ciclo && x.lote === lote))
    if (archivo === 'funcionalidades.json') { const ids = new Set(nuevosItems.map((x) => x.id)); a.items = a.items.filter((x) => !ids.has(x.id)) }
    a.items.push(...nuevosItems)
  }
  escribir(f, a)
}

// ── 5. Ledger ────────────────────────────────────────────────────────────────
const leidos = []
const incompletos = []
for (const [lote, lectura] of lotes) {
  const delLote = new Set(((args?.lotes ?? []).find((l) => l.id === lote)?.archivos ?? []).map(normRuta))
  for (const a of lectura?.archivos_leidos ?? []) {
    const r = normRuta(a.ruta)
    if (delLote.size && !delLote.has(r)) continue
    if (a.leido_completo) leidos.push(r); else incompletos.push(`${r} (${a.rangos ?? 'parcial'})`)
  }
  for (const r of delLote) if (!(lectura?.archivos_leidos ?? []).some((a) => normRuta(a.ruta) === r)) incompletos.push(`${r} (no figura en archivos_leidos)`)
}
if (rev.modo === 'cazador') console.log('ledger: ciclo de cazadores, no se marca (los archivos ya quedaron «leído» en el ciclo 1)')
else if (leidos.length) {
  const lista = path.join(CICLOS, `${ciclo}-leidos.txt`)
  writeFileSync(lista, `${[...new Set(leidos)].join('\n')}\n`, 'utf8')
  console.log(execFileSync(process.execPath, ['scripts/auditoria/cobertura.mjs', '--marcar', 'leído', '--ciclo', ciclo, '--lista', path.relative(APP, lista)], { cwd: APP, encoding: 'utf8' }).trim())
}

// ── 6. Entregables ───────────────────────────────────────────────────────────
escribir(REV, rev)
console.log(execFileSync(process.execPath, ['scripts/auditoria/hallazgos-md.mjs'], { cwd: APP, encoding: 'utf8' }).trim())
console.log(execFileSync(process.execPath, ['scripts/auditoria/planeado-md.mjs'], { cwd: APP, encoding: 'utf8' }).trim())

const c = (s) => nuevos.filter((h) => h.severidad === s).length
console.log(`${ciclo}: nuevos ${nuevos.length} (C ${c('CRÍTICA')} / A ${c('ALTA')} / M ${c('MEDIA')} / B ${c('BAJA')}): ${nuevos.map((h) => h.id).join(', ') || '—'}`)
console.log(`VH nuevos: ${[...vhPorCaso.values()].map((v) => v.vh).join(', ') || '—'} · descartados en el ciclo: ${rev.hallazgos.filter((h) => h.decision === 'descartar').length}`)
console.log(`PLAN cruzados: ${aplicados} · sin cruce (quedan para el ciclo siguiente): ${sinCruce.length}${sinCruce.length ? ` → ${sinCruce.slice(0, 15).join(', ')}${sinCruce.length > 15 ? '…' : ''}` : ''}`)
console.log(`ledger: ${new Set(leidos).size} leídos · incompletos ${incompletos.length}${incompletos.length ? ` → ${incompletos.slice(0, 10).join('; ')}` : ''}`)
