#!/usr/bin/env node
// Auditoría de renovación 2026-10 — junta la salida de los agentes de extracción de F1.12
// (DEC-39) en docs/auditoria-2026-10/_crudo/planeado-extraido/ (partido en piezas de menos
// de 300 KB, PROMPT §5; ver crudo-partes.mjs). Un solo uso.
//
// Lee el journal del workflow (una línea JSON por evento; las de type "result" traen
// { items, docs_leidos, notas }) y se queda con los resultados cuyos ítems tienen
// `fuente` (los de previas tienen `doc` y van a previas.json). Cuando dos ítems comparten
// «fuente:línea», el segundo y los siguientes llevan `sub` (2, 3…) para que la clave del
// ítem en 12-PLANEADO.md sea única y estable.
//
// Uso (desde logic-core-v3): node scripts/auditoria/planeado-extraer.mjs <journal.jsonl> <id-del-workflow>

import { readFileSync } from 'node:fs'
import { escribirPartido } from './crudo-partes.mjs'
import path from 'node:path'

const [, , JOURNAL, WF] = process.argv
if (!JOURNAL || !WF) { console.error('uso: planeado-extraer.mjs <journal.jsonl> <id-del-workflow>'); process.exit(1) }
const CRUDO = path.resolve(process.cwd(), 'docs/auditoria-2026-10/_crudo')

const eventos = readFileSync(JOURNAL, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const agentes = []
const items = []
for (const e of eventos) {
  if (e.type !== 'result' || !e.result?.items?.length || !('fuente' in e.result.items[0])) continue
  agentes.push({ agente: e.agentId, items: e.result.items.length, docs_leidos: e.result.docs_leidos ?? [], notas: [].concat(e.result.notas ?? []) })
  items.push(...e.result.items)
}
const vistos = new Map()
for (const i of items) {
  const k = `${i.fuente}:${i.linea}`
  const n = (vistos.get(k) ?? 0) + 1
  vistos.set(k, n)
  if (n > 1) i.sub = n
}
// el id del endpoint de Neon no es una credencial, pero ubica la base: se recorta igual
const limpio = JSON.parse(JSON.stringify({ workflow: WF, agentes, total: items.length, items }).replace(/\bep-[a-z]+-[a-z]+[\w.-]*(?:\.\.\.|…)?/g, 'ep-…'))
const partes = escribirPartido(CRUDO, 'planeado-extraido', limpio)
const conSub = items.filter((i) => i.sub).length
console.log(`planeado-extraido/: ${items.length} ítems de ${agentes.length} agentes en ${partes} partes; ${conSub} con sub-clave`)
