#!/usr/bin/env node
// Auditoría de renovación 2026-10 — genera docs/auditoria-2026-10/12-PLANEADO.md (DEC-39).
//
// Entrada:
//   _crudo/planeado-extraido/      — ítems extraídos en F1.12 (partido en piezas < 300 KB) (fuente:línea, tipo, título…)
//   _crudo/planeado-cruces.json    — (opcional) estado en código de cada ítem, que van
//                                    completando los ciclos de F2: { "<fuente>:<línea>": {estado, evidencia, sentido, ciclo} }
//   _crudo/todos-codigo.json       — TODO/FIXME del código (se resumen por herramienta)
// IDs PLAN-NNN estables por «fuente:línea»: si el .md ya existe se conservan.
//
// Uso (desde logic-core-v3): node scripts/auditoria/planeado-md.mjs

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { HERRAMIENTAS, AREAS, nodoDeRuta } from './atlas/nodos.mjs'
import { leerMapa, leerPartido } from './crudo-partes.mjs'

const appRoot = process.cwd()
const CRUDO = path.resolve(appRoot, 'docs/auditoria-2026-10/_crudo')
const MD = path.resolve(appRoot, 'docs/auditoria-2026-10/12-PLANEADO.md')
const leer = (f, d) => (existsSync(path.join(CRUDO, f)) ? JSON.parse(readFileSync(path.join(CRUDO, f), 'utf8').replace(/^﻿/, '')) : d)
const extraido = leerPartido(CRUDO, 'planeado-extraido', { items: [] })
const cruces = leerMapa(CRUDO, 'planeado-cruces', {})
const todos = leer('todos-codigo.json', { items: [] })

const previos = new Map()
let maximo = 0
if (existsSync(MD)) for (const m of readFileSync(MD, 'utf8').matchAll(/^#### \[PLAN-(\d+)\] .*?\n- Fuente: `([^`]+)`/gm)) { previos.set(m[2], Number(m[1])); maximo = Math.max(maximo, Number(m[1])) }

const nodoDe = (h) => (HERRAMIENTAS[h] ? `${HERRAMIENTAS[h][0]}.${h}` : h === 'transversal' ? 'lib.transversal' : h === 'sitio-publico' ? 'lib.sitio-publico' : h === 'infra' ? 'lib.plataforma' : 'lib.otro')
const items = extraido.items.map((i) => ({ ...i, clave: `${i.fuente}:${i.linea}${i.sub ? `#${i.sub}` : ''}` }))
items.sort((a, b) => nodoDe(a.herramienta).localeCompare(nodoDe(b.herramienta)) || a.fuente.localeCompare(b.fuente) || a.linea - b.linea || (a.sub ?? 1) - (b.sub ?? 1))
for (const i of items) i.id = previos.get(i.clave) ?? ++maximo

const porNodo = new Map()
for (const i of items) { const n = nodoDe(i.herramienta); if (!porNodo.has(n)) porNodo.set(n, []); porNodo.get(n).push(i) }
const estados = items.reduce((m, i) => { const e = cruces[i.clave]?.estado ?? 'por cruzar'; m[e] = (m[e] ?? 0) + 1; return m }, {})
const tipos = items.reduce((m, i) => ((m[i.tipo] = (m[i.tipo] ?? 0) + 1), m), {})

const md = ['# 12 — Lo planeado contra lo real', '']
md.push('> Extracción de pendientes, promesas, decisiones, ideas, bloques de trabajo y lo que los registros declaran hecho (DEC-39), desde los docs del repo y `_insumos/drive/` (DEC-35). Cada ítem lleva su fuente exacta. **El estado en código lo completa cada dominio de F2** (con `ruta:línea` o la búsqueda que prueba la ausencia); mientras tanto figura «por cruzar». Los insumos de Drive son plan, historia u opinión: nunca evidencia del estado real. Generado por `scripts/auditoria/planeado-md.mjs`.', '')
md.push('> Rutas de la fuente: relativas a `logic-core-v3/`; `raiz:` = raíz del repo; `_insumos/` = `logic-core-v3/docs/_insumos/` (insumos de Drive, fuera de git). `#n` distingue ítems que comparten línea. Los hallazgos CRÍTICA/ALTA/P0/P1 de las auditorías previas no se repiten acá: están en `_crudo/previas.json` y cada lector de F2 los re-verifica (DEC-12). Las observaciones de los extractores (contradicciones entre docs, alertas) van en el anexo final, sin verificar contra el código.', '')
md.push('## Resumen', '')
md.push(`- Ítems: **${items.length}** — por tipo: ${Object.entries(tipos).map(([k, v]) => `${k} ${v}`).join(' · ')}.`)
md.push(`- Estado en código: ${Object.entries(estados).map(([k, v]) => `${k} ${v}`).join(' · ')}.`)
md.push(`- ZONA-FRANCO: ${items.filter((i) => i.zona_franco).length} ítems.`)
md.push(`- TODO/FIXME en el código de \`origin/main\`: ${todos.items.length} (\`_crudo/todos-codigo.json\`).`, '')
md.push('| Nodo | Ítems | ZONA-FRANCO | Pendiente, bloque, idea o promesa | Hecho declarado | Decisión |', '|---|---:|---:|---:|---:|---:|')
for (const n of [...new Set(items.map((i) => nodoDe(i.herramienta)))].sort()) {
  const g = items.filter((i) => nodoDe(i.herramienta) === n)
  const c = (f) => g.filter(f).length
  md.push(`| ${n} | ${g.length} | ${c((i) => i.zona_franco)} | ${c((i) => ['pendiente', 'bloque', 'idea', 'promesa'].includes(i.tipo))} | ${c((i) => i.tipo === 'hecho-declarado')} | ${c((i) => i.tipo === 'decision')} |`)
}
md.push('')
const orden = [...porNodo.keys()].sort()
let areaActual = null
for (const n of orden) {
  const area = n.split('.')[0]
  if (AREAS[area] && area !== areaActual) { md.push(`## ${area} · ${AREAS[area]}`, ''); areaActual = area }
  else if (!AREAS[area] && areaActual !== 'otros') { md.push('## Transversal, plataforma y otros', ''); areaActual = 'otros' }
  const h = n.split('.')[1]
  md.push(`### ${n}${HERRAMIENTAS[h] ? ` — ${HERRAMIENTAS[h][1]}` : ''}`, '')
  for (const i of porNodo.get(n)) {
    const c = cruces[i.clave]
    md.push(`#### [PLAN-${String(i.id).padStart(3, '0')}] ${i.titulo}`)
    md.push(`- Fuente: \`${i.clave}\` · tipo: ${i.tipo} · estado declarado: ${i.estado_declarado || 'sin estado'}${i.fecha ? ` · fecha: ${i.fecha}` : ''}${i.zona_franco ? ' · **ZONA-FRANCO**' : ''}`)
    md.push(`- Nodo(s): ${n}`)
    md.push(`- Qué es: ${i.descripcion}`)
    if (i.refs?.length) md.push(`- Referencias: ${i.refs.slice(0, 6).join(' · ')}${i.refs.length > 6 ? ` +${i.refs.length - 6}` : ''}`)
    md.push(`- Estado en código: ${c ? `**${c.estado}** — ${c.evidencia}${c.ciclo ? ` (${c.ciclo})` : ''}` : 'por cruzar'}`)
    md.push(`- ¿Sigue teniendo sentido?: ${c?.sentido ?? 'por decidir en su dominio'}`, '')
  }
}
// TODO/FIXME por nodo, como anexo
const todosPorNodo = todos.items.reduce((m, t) => { const n = nodoDeRuta(t.archivo); (m[n] ??= []).push(t); return m }, {})
md.push('## Anexo — TODO/FIXME del código por nodo', '')
for (const n of Object.keys(todosPorNodo).sort()) {
  md.push(`- **${n}** (${todosPorNodo[n].length}): ${todosPorNodo[n].slice(0, 5).map((t) => `\`${t.archivo}:${t.linea}\``).join(', ')}${todosPorNodo[n].length > 5 ? ` +${todosPorNodo[n].length - 5}` : ''}`)
}
md.push('')
// Observaciones de los extractores (contradicciones entre docs, alertas): datos para los dominios, sin verificar
if (extraido.agentes?.length) {
  md.push('## Anexo — Observaciones de los extractores (sin verificar contra el código)', '')
  for (const a of extraido.agentes) {
    const docs = a.docs_leidos.map((d) => `\`${d.doc}\`${d.rango ? ` (${String(d.rango).split(' ')[0]})` : ''}`)
    md.push(`### ${docs.length > 3 ? `${docs.slice(0, 3).join(', ')} y ${docs.length - 3} más` : docs.join(', ')} — ${a.items} ítems`, '')
    // el id del endpoint de Neon no es una credencial, pero ubica la base: se recorta igual
    for (const n of a.notas) md.push(`- ${String(n).replace(/\s+/g, ' ').replace(/\bep-[a-z]+-[a-z]+[\w.-]*(?:\.\.\.|…)?/g, 'ep-…').trim()}`)
    md.push('')
  }
}
writeFileSync(MD, md.join('\n'), 'utf8')
console.log(`12-PLANEADO.md: ${items.length} ítems (PLAN-001..PLAN-${String(maximo).padStart(3, '0')}); estados ${JSON.stringify(estados)}`)
