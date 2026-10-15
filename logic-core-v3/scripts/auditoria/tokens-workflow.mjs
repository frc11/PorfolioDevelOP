#!/usr/bin/env node
// Auditoría de renovación 2026-10 — tokens y lecturas por agente de un workflow de F2 (DEC-53).
//
// Lee las transcripciones locales de un run (`<dir>/agent-*.jsonl` + `.meta.json`, que deja el
// harness en el directorio del workflow) y, por agente: mensajes, tokens procesados (entrada +
// caché creada + caché leída + salida, con el uso final de cada mensaje), tokens de salida,
// contexto final, y lecturas (Read) dentro y fuera de su lote. Con `--args <ciclo>.args.json`
// cruza cada lector con su lote (archivos y LOC) y da tokens por kLOC: es la medida de
// «antes y después» del cambio de DEC-53 (lectores acotados a su lote).
//
// Solo lectura; no toca el repo. Las transcripciones viven fuera del repo y no se commitean.
// Uso (desde logic-core-v3):
//   node scripts/auditoria/tokens-workflow.mjs <dir-del-workflow> [--args <ciclo>.args.json] [--json]

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const [, , dir, ...resto] = process.argv
if (!dir || !existsSync(dir)) { console.error('uso: tokens-workflow.mjs <dir-del-workflow> [--args <ciclo>.args.json] [--json]'); process.exit(1) }
const argsRuta = resto.includes('--args') ? resto[resto.indexOf('--args') + 1] : null
const comoJson = resto.includes('--json')
const lotes = new Map()
if (argsRuta) for (const l of JSON.parse(readFileSync(argsRuta, 'utf8')).lotes ?? []) lotes.set(l.id, { loc: l.loc, archivos: new Set(l.archivos) })

// ruta absoluta o relativa → relativa a logic-core-v3 (con barras normales)
const relativa = (p) => {
  const s = String(p ?? '').replace(/\\/g, '/')
  const i = s.indexOf('logic-core-v3/')
  return i >= 0 ? s.slice(i + 'logic-core-v3/'.length) : s.replace(/^\.\//, '')
}

// estado de cada agente según el journal del run (result | failed | started)
const estado = new Map()
const journal = path.join(dir, 'journal.jsonl')
if (existsSync(journal)) {
  for (const l of readFileSync(journal, 'utf8').split(/\r?\n/)) {
    if (!l) continue
    try { const o = JSON.parse(l); if (o.agentId && ['started', 'result', 'failed'].includes(o.type)) estado.set(o.agentId, o.type === 'started' ? 'en curso' : o.type === 'result' ? 'terminado' : 'falló') } catch { /* línea parcial */ }
  }
}
const filas = []
for (const f of readdirSync(dir).filter((x) => /^agent-.*\.jsonl$/.test(x))) {
  const metaRuta = path.join(dir, f.replace(/\.jsonl$/, '.meta.json'))
  const meta = existsSync(metaRuta) ? JSON.parse(readFileSync(metaRuta, 'utf8')) : {}
  const etiqueta = meta.description ?? f
  const usoPorMensaje = new Map()
  const lecturas = []
  let otrasHerramientas = 0
  for (const linea of readFileSync(path.join(dir, f), 'utf8').split('\n')) {
    if (!linea) continue
    let o
    try { o = JSON.parse(linea) } catch { continue }
    const m = o.message
    if (!m) continue
    if (m.usage && m.id) usoPorMensaje.set(m.id, m.usage)
    if (m.role === 'assistant' && Array.isArray(m.content)) {
      for (const c of m.content) {
        if (c.type !== 'tool_use') continue
        if (c.name === 'Read') lecturas.push(relativa(c.input?.file_path))
        else otrasHerramientas++
      }
    }
  }
  let procesados = 0
  let nuevos = 0
  let salida = 0
  let ultimo = null
  for (const u of usoPorMensaje.values()) {
    procesados += (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.output_tokens ?? 0)
    nuevos += (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.output_tokens ?? 0)
    salida += u.output_tokens ?? 0
    ultimo = u
  }
  const contextoFinal = ultimo ? (ultimo.input_tokens ?? 0) + (ultimo.cache_creation_input_tokens ?? 0) + (ultimo.cache_read_input_tokens ?? 0) : 0
  const idLote = (etiqueta.match(/^lector:(.+)$/) ?? [])[1]
  const lote = idLote ? lotes.get(idLote) : null
  const distintas = [...new Set(lecturas)]
  const fuera = lote ? distintas.filter((p) => !lote.archivos.has(p) && !p.startsWith('docs/auditoria-2026-10/')) : []
  filas.push({
    agente: etiqueta, id: f.replace(/^agent-|\.jsonl$/g, ''), estado: estado.get(f.replace(/^agent-|\.jsonl$/g, '')) ?? 's/d', mensajes: usoPorMensaje.size, procesados, sin_cache_leida: nuevos, salida, contexto_final: contextoFinal,
    lecturas: lecturas.length, archivos_distintos: distintas.length, fuera_del_lote: lote ? fuera.length : null,
    otras_herramientas: otrasHerramientas, loc_lote: lote?.loc ?? null, archivos_lote: lote?.archivos.size ?? null,
    procesados_por_kloc: lote?.loc ? Math.round(procesados / (lote.loc / 1000)) : null,
  })
}
filas.sort((a, b) => a.agente.localeCompare(b.agente))
if (comoJson) { console.log(JSON.stringify(filas, null, 1)); process.exit(0) }
const M = (n) => (n / 1e6).toFixed(2) + ' M'
for (const r of filas) {
  const lote = r.loc_lote ? ` · lote ${r.archivos_lote} arch / ${r.loc_lote} LOC · ${M(r.procesados_por_kloc)}/kLOC · leídos fuera del lote ${r.fuera_del_lote}/${r.archivos_distintos}` : ''
  console.log(`${r.agente} [${r.estado}]: ${M(r.procesados)} procesados (${M(r.sin_cache_leida)} sin caché leída) · salida ${Math.round(r.salida / 1000)}k · contexto final ${Math.round(r.contexto_final / 1000)}k · ${r.mensajes} mensajes · Read ${r.lecturas} · otras herramientas ${r.otras_herramientas}${lote}`)
}
const total = filas.reduce((s, r) => s + r.procesados, 0)
const totalNuevos = filas.reduce((s, r) => s + r.sin_cache_leida, 0)
console.log(`total: ${filas.length} agentes · ${M(total)} procesados (${M(totalNuevos)} sin caché leída)`)
