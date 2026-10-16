#!/usr/bin/env node
// Auditoría de renovación 2026-10 — escribe 07-BACKLOG.md (F6.4) desde _crudo/f6c-resultado/ (el backlog final del
// crítico por bloque, partido por el tope de 300 KB; el borrador de los dos armadores está en _crudo/f6c-borrador/). El padre controla y corrige lo mecánico, y deja anotado cada cambio en «Controles del padre»:
//   - IDs citados que no existen (se quitan) · nodos fuera del Atlas (se quitan; si no queda ninguno, salen de los
//     hallazgos de la tarjeta) · zona: si un hallazgo es ZONA-FRANCO o FROZEN, la tarjeta lo dice
//   - toda CRÍTICA y ALTA vigente en una tarjeta de Ahora · cobertura de MEDIA, BAJA y FAL
//   - prerrequisitos: de título a [B-##]; sin ciclos · combinación modelo/esfuerzo/ultracode dentro de la tabla de E12
// Después: node scripts/auditoria/atlas/backlog.mjs (backlog.json sale del .md). Un solo uso.
// Uso (desde logic-core-v3): node scripts/auditoria/backlog-md.mjs

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { leerPartido } from './crudo-partes.mjs'
import { cargarAlias, resolverLista } from './atlas/alias.mjs'
import { nodoDeRuta } from './atlas/nodos.mjs'

const DIR = path.resolve(process.cwd(), 'docs/auditoria-2026-10')
const crudas = leerPartido(path.join(DIR, '_crudo'), 'f6c-resultado', { tarjetas: [] }, 'tarjetas').tarjetas
const reg = leerPartido(path.join(DIR, '_crudo'), 'hallazgos', { hallazgos: [] }, 'hallazgos').hallazgos.filter((h) => h.estado === 'vigente')
const porId = new Map(reg.map((h) => [h.id, h]))
const definidos = new Set()
const mds = []
const recorrer = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory() && !['_crudo', '_reportes'].includes(e.name)) recorrer(p); else if (e.name.endsWith('.md') && e.name !== '07-BACKLOG.md') mds.push(p) } }
recorrer(DIR)
const nodosDe = new Map()
for (const f of mds) for (const b of readFileSync(f, 'utf8').replace(/\r\n/g, '\n').split(/\n(?=#{3,4} \[)/)) {
  const m = b.match(/^#{3,4} \[([A-Z][A-Z0-9]*-\d+)\]/)
  if (!m) continue
  definidos.add(m[1])
  const n = (b.match(/Nodo\(s\):\s*([^\n]+)/) ?? [])[1]
  if (n) nodosDe.set(m[1], n.split(/[,·]/).map((s) => s.replace(/`/g, '').trim().split(/\s/)[0]).filter(Boolean))
}
const nodosAtlas = new Set(JSON.parse(readFileSync(path.join(DIR, '06-ATLAS/atlas.json'), 'utf8')).nodos.map((n) => n.id))
const alias = cargarAlias(path.join(DIR, '06-ATLAS'))
const NODO_VALIDO = /^(h[1-6](\.[a-z0-9-]+){0,2}|lib(\.[a-z0-9-]+)+|int(\.[a-z0-9-]+)+|modelo\.[A-Za-z0-9]+|rama\.[a-z0-9-]+|doc\.[a-z0-9-]+)$/
const controles = []
const nota = (s) => controles.push(s)
const limpio = (s) => String(s ?? '').replace(/\s*\n\s*/g, ' ').replace(/ · /g, '; ').trim()
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

// ── tarjetas ──
const BLOQUES = ['Ahora', 'Próximo', 'Después']
const tarjetas = []
for (const t of crudas) {
  if (!BLOQUES.includes(t.bloque)) { nota(`«${t.titulo}»: bloque «${t.bloque}» → Después`); t.bloque = 'Después' }
  const ids = [...new Set((t.hallazgos ?? []).map((x) => String(x).match(/[A-Z][A-Z0-9]*-\d+/)?.[0]).filter(Boolean))]
  const malos = ids.filter((x) => !porId.has(x) && !definidos.has(x))
  if (malos.length) nota(`«${t.titulo}»: se quitaron IDs que no existen: ${malos.join(', ')}`)
  const hall = ids.filter((x) => porId.has(x) || definidos.has(x))
  let nodos = [...new Set((t.nodos ?? []).map((n) => String(n).replace(/`/g, '').trim()))]
  const fuera = nodos.filter((n) => !NODO_VALIDO.test(n) || !nodosAtlas.has(n))
  nodos = resolverLista(nodos.filter((n) => NODO_VALIDO.test(n)), nodosAtlas, alias)
  if (!nodos.length) {
    nodos = resolverLista(hall.flatMap((x) => porId.get(x)?.nodos ?? nodosDe.get(x) ?? []), nodosAtlas, alias).slice(0, 4)
    let de = 'sus hallazgos'
    if (!nodos.length) {
      // sin hallazgos con nodo (tarjetas de proceso): los nodos salen de las rutas de «Archivos a tocar»
      const rutas = [...String(t.archivos_tocar ?? '').matchAll(/(?:^|[\s(`;,])((?:src|prisma|scripts|tests|netlify|docs)\/[A-Za-z0-9_.()[\]@/-]+)/g)].map((m) => m[1])
      nodos = resolverLista(rutas.map((r) => nodoDeRuta(r)), nodosAtlas, alias).slice(0, 4)
      de = 'las rutas de «Archivos a tocar»'
    }
    nota(`«${t.titulo}»: sin nodos del Atlas${fuera.length ? ` (traía ${fuera.slice(0, 4).join(', ')})` : ''}; se tomaron de ${de}: ${nodos.join(', ') || 'ninguno'}`)
  }
  let zona = limpio(t.zona)
  const zonas = hall.map((x) => porId.get(x)?.zona ?? '')
  if (zonas.some((z) => /FRANCO/.test(z)) && !/FRANCO/i.test(zona)) { nota(`«${t.titulo}»: zona «${zona}» + ZONA-FRANCO (tiene hallazgos de la zona)`); zona = /^libre$/i.test(zona) ? 'ZONA-FRANCO (coordinar con Franco)' : `${zona}; ZONA-FRANCO (coordinar con Franco)` }
  if (zonas.some((z) => /FROZEN/.test(z)) && !/FROZEN/i.test(zona)) { nota(`«${t.titulo}»: zona «${zona}» + requiere decisión FROZEN (tiene hallazgos sobre congelados)`); zona = /^libre$/i.test(zona) ? 'requiere decisión FROZEN' : `${zona}; requiere decisión FROZEN` }
  tarjetas.push({ ...t, hallazgos: hall, nodos, zona })
}
if (!tarjetas.length) { console.error('_crudo/f6c-resultado/ sin tarjetas'); process.exit(1) }

// toda CRÍTICA y ALTA en Ahora
const enAhora = new Set(tarjetas.filter((t) => t.bloque === 'Ahora').flatMap((t) => t.hallazgos))
for (const h of reg.filter((x) => ['CRÍTICA', 'ALTA'].includes(x.severidad) && !enAhora.has(x.id))) {
  const t = tarjetas.find((x) => x.hallazgos.includes(h.id))
  if (t) { nota(`${h.id} (${h.severidad}) estaba en «${t.titulo}» (${t.bloque}): la tarjeta pasa a Ahora`); t.bloque = 'Ahora' }
  else nota(`${h.id} (${h.severidad}) no está en ninguna tarjeta: REVISAR`)
}

// orden e IDs
const orden = BLOQUES.flatMap((b) => tarjetas.filter((t) => t.bloque === b))
orden.forEach((t, i) => { t.id = `B-${String(i + 1).padStart(2, '0')}` })
const porTitulo = new Map(orden.map((t) => [norm(t.titulo), t.id]))
const VACIAS = new Set('para como sobre desde hasta entre todo toda todos cada solo sola real reales unico unica'.split(' '))
const tokens = (s) => new Set(norm(s).split(' ').filter((w) => w.length > 3 && !VACIAS.has(w)))
// títulos del borrador que el crítico cambió tanto que el parecido no alcanza: comienzo del viejo → comienzo del nuevo
const RENOMBRADAS = {
  'inventario de vencimientos de credenciales': 'sentry que recibe en produccion',
  'turno del chat respuestas largas': 'techo real de netlify medido',
  'widget del cliente respetar su configuracion': 'widget del cliente su posicion',
  'avisos del chatbot al cliente': 'aviso de cupo al dueno del bot',
}
const jaccard = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1) }
for (const t of orden) {
  const pre = []
  for (const p of t.prereqs ?? []) {
    const ya = String(p).match(/B-\d+/)?.[0]
    let id = porTitulo.get(norm(p)) ?? [...porTitulo.entries()].find(([k]) => k.startsWith(norm(p).slice(0, 40)) || norm(p).startsWith(k.slice(0, 40)))?.[1] ?? (ya && orden.some((x) => x.id === ya) ? ya : null)
    const manual = Object.entries(RENOMBRADAS).find(([viejo]) => norm(p).startsWith(viejo))
    const destino = manual && orden.find((x) => norm(x.titulo).startsWith(manual[1]))
    if (!id && destino) { id = destino.id; nota(`${t.id}: prerrequisito «${String(p).slice(0, 80)}» → ${destino.id} «${limpio(destino.titulo).slice(0, 80)}» (tabla del padre)`) }
    if (!id) {
      // el crítico renombró tarjetas y algunos prerrequisitos citan el título del borrador: el más parecido por palabras
      const tp = tokens(p)
      const [mejor, s] = orden.filter((x) => x.id !== t.id).map((x) => [x, jaccard(tp, tokens(x.titulo))]).sort((a, b) => b[1] - a[1])[0] ?? []
      if (mejor && s >= 0.3) { id = mejor.id; nota(`${t.id}: prerrequisito «${String(p).slice(0, 80)}» → ${mejor.id} «${limpio(mejor.titulo).slice(0, 80)}» (parecido ${s.toFixed(2)})`) }
    }
    if (id && id !== t.id) pre.push(id)
    else if (!id) nota(`${t.id}: prerrequisito sin resolver «${String(p).slice(0, 90)}» (se quitó)`)
  }
  t.pre = [...new Set(pre)]
}
// ciclos
const visitar = (id, pila) => { if (pila.includes(id)) return [...pila, id]; const t = orden.find((x) => x.id === id); for (const p of t?.pre ?? []) { const c = visitar(p, [...pila, id]); if (c) return c } return null }
for (const t of orden) { const c = visitar(t.id, []); if (c) { const a = c[c.length - 2], b = c[c.length - 1]; const ta = orden.find((x) => x.id === a); ta.pre = ta.pre.filter((x) => x !== b); nota(`ciclo de prerrequisitos ${c.join(' → ')}: se quitó ${a} → ${b}`) } }

// tabla de E12
const E12 = [['Sonnet 5.5', 'medium', 'OFF'], ['Sonnet 5.5', 'high', 'OFF'], ['Opus 5.5', 'medium', 'OFF'], ['Opus 5.5', 'high', 'OFF'], ['Opus 5.5', 'high', 'ON'], ['Opus 5.5', 'xhigh', 'OFF']]
for (const t of orden) {
  t.modelo = /opus/i.test(t.modelo) ? 'Opus 5.5' : /sonnet/i.test(t.modelo) ? 'Sonnet 5.5' : limpio(t.modelo)
  t.esfuerzo = (String(t.esfuerzo).match(/xhigh|high|medium|low/i)?.[0] ?? limpio(t.esfuerzo)).toLowerCase()
  if (!E12.some(([m, e, u]) => m === t.modelo && e === t.esfuerzo && u === t.ultracode)) nota(`${t.id}: ${t.modelo} · ${t.esfuerzo} · ${t.ultracode} no está en la tabla de E12`)
}

// cobertura
const cubiertos = new Set(orden.flatMap((t) => t.hallazgos))
const sinTarjeta = reg.filter((h) => !cubiertos.has(h.id))
const cob = (f) => { const xs = reg.filter(f); return `${xs.filter((h) => cubiertos.has(h.id)).length}/${xs.length}` }
const peso = { S: 1, M: 3, L: 8 }

// ── md ──
const card = (t) => [
  `### [${t.id}] ${limpio(t.titulo)}`,
  `- Objetivo: ${limpio(t.objetivo)} · Hallazgos que cierra: ${t.hallazgos.map((x) => `[${x}]`).join(', ') || 'ninguno (tarjeta de proceso)'}`,
  `- Archivos a tocar: ${limpio(t.archivos_tocar)} · Archivos que NO se tocan: ${limpio(t.archivos_no)}`,
  `- Zona: ${t.zona}`,
  `- Tamaño: ${t.tamano} · Riesgo: ${limpio(t.riesgo)} · Prerrequisitos: ${t.pre.length ? t.pre.map((x) => `[${x}]`).join(', ') : 'ninguno'}`,
  `- Nivel de proceso: ${t.nivel_proceso} · Modelo sugerido: ${t.modelo} · Esfuerzo: ${t.esfuerzo} · Ultracode: ${t.ultracode}`,
  `- Criterio de aceptación: ${limpio(t.criterio)}`,
  `- Nodo(s): ${t.nodos.join(', ')}`,
  `- Worktree: ${limpio(t.worktree) || 'propio'}`,
  '- Estado: abierta',
  '',
].join('\n')
const cuenta = (xs, k) => xs.reduce((a, t) => { a[t[k]] = (a[t[k]] ?? 0) + 1; return a }, {})
const md = [
  '# 07 — Backlog de sprints',
  '',
  `> F6.4 (PROMPT §F6.4 y ENMIENDA-01 E12). Una tarjeta por causa raíz, lista para convertirse en el prompt de un sprint. Armado por dos agentes de solo lectura (Ahora/Próximo y Después) y revisado por un crítico por bloque (run \`wf_b8f7655d-c09\`, \`_crudo/f6c-resultado/\`) sobre el registro de ${reg.length} hallazgos, los DIS, las IDEA, la poda, los congelados, \`13\` y \`14\`; el padre controló lo mecánico (ver «Controles del padre» al final). **Nada de esto está hecho:** todas las tarjetas arrancan en \`Estado: abierta\`. \`06-ATLAS/backlog.json\` se genera desde este archivo con \`node scripts/auditoria/atlas/backlog.mjs\`: si cambia una tarjeta, se cambia acá y se regenera.`,
  '',
  '## Cómo leer una tarjeta',
  '',
  '- **Bloques:** **Ahora** = toda CRÍTICA y ALTA, y lo que bloquea L3 en el camino del cliente · **Próximo** = lo que lleva cada herramienta a L3 · **Después** = mejoras, diseño, ideas, poda, congelados y docs.',
  '- **Zona:** `libre` · `ZONA-FRANCO` (decisión de Franco, coordinar antes) · `requiere decisión FROZEN` (Valentino decide antes de tocar un congelado; ver `11-CONGELADOS.md`).',
  '- **Nivel de proceso** (E12): **S** prompt corto, sin plan · **M** plan corto · **L** ritual completo (leer scope, mapear lo existente, proponer estructura).',
  '- **Modelo · esfuerzo · ultracode** según la tabla de E12: S mecánica → Sonnet 5.5 · medium · OFF · M con spec clara → Sonnet 5.5 · high · OFF (si falla, Opus 5.5 · medium) · L ambigua, seguridad, arquitectura o multi-área → Opus 5.5 · high · OFF (ON solo si cruza muchas áreas) · visual fino, 3D o timing → Opus 5.5 · xhigh · OFF · poda masiva o migración que cruza el repo → Opus 5.5 · high · ON.',
  '- **Worktree:** las tarjetas con el mismo nombre conviene hacerlas juntas, en un mismo worktree.',
  '- **Trabajo restante** (métrica de E7): S = 1, M = 3, L = 8.',
  '',
  '## Resumen',
  '',
  '| Bloque | Tarjetas | S / M / L | Trabajo (S=1, M=3, L=8) | ZONA-FRANCO | FROZEN |',
  '|---|---|---|---|---|---|',
  ...BLOQUES.map((b) => { const xs = orden.filter((t) => t.bloque === b); const c = cuenta(xs, 'tamano'); return `| ${b} | ${xs.length} | ${c.S ?? 0} / ${c.M ?? 0} / ${c.L ?? 0} | ${xs.reduce((s, t) => s + (peso[t.tamano] ?? 0), 0)} | ${xs.filter((t) => /FRANCO/i.test(t.zona)).length} | ${xs.filter((t) => /FROZEN/i.test(t.zona)).length} |` }),
  `| **Total** | **${orden.length}** | | **${orden.reduce((s, t) => s + (peso[t.tamano] ?? 0), 0)}** | | |`,
  '',
  `**Cobertura del registro:** CRÍTICA ${cob((h) => h.severidad === 'CRÍTICA')} y ALTA ${cob((h) => h.severidad === 'ALTA')} (todas en Ahora) · MEDIA ${cob((h) => h.severidad === 'MEDIA')} · BAJA ${cob((h) => h.severidad === 'BAJA')} · FAL ${cob((h) => h.prefijo === 'FAL')}. Las que no tienen tarjeta están al final, con su severidad.`,
  '',
  '### Por worktree',
  '',
  '| Worktree | Tarjetas |',
  '|---|---|',
  ...[...orden.reduce((m, t) => { const k = limpio(t.worktree) || 'propio'; m.set(k, [...(m.get(k) ?? []), t.id]); return m }, new Map())].filter(([, ids]) => ids.length > 1).map(([k, ids]) => `| ${k} | ${ids.join(', ')} |`),
  '',
]
for (const b of BLOQUES) { md.push(`## ${b}`, ''); for (const t of orden.filter((x) => x.bloque === b)) md.push(card(t)) }
md.push('## Hallazgos sin tarjeta', '')
const sev = ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA']
md.push(sinTarjeta.length ? `${sinTarjeta.length} hallazgos vigentes no quedaron en ninguna tarjeta (${sev.map((s) => `${s} ${sinTarjeta.filter((h) => h.severidad === s).length}`).join(' · ')}). Son candidatos a sumarse a la tarjeta de su módulo cuando se trabaje: ${sinTarjeta.map((h) => `${h.id} (${h.severidad})`).join(', ')}.` : 'Ninguno: todo hallazgo vigente está en una tarjeta.', '')
md.push('## Controles del padre', '', controles.length ? controles.map((c) => `- ${c}`).join('\n') : '- Sin correcciones.', '')
writeFileSync(path.join(DIR, '07-BACKLOG.md'), md.join('\n'), 'utf8')
console.log(`07-BACKLOG.md: ${orden.length} tarjetas ${JSON.stringify(cuenta(orden, 'bloque'))} · C ${cob((h) => h.severidad === 'CRÍTICA')} A ${cob((h) => h.severidad === 'ALTA')} M ${cob((h) => h.severidad === 'MEDIA')} B ${cob((h) => h.severidad === 'BAJA')} · ${controles.length} controles`)
