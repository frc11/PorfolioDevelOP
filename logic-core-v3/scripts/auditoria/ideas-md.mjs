#!/usr/bin/env node
// Auditoría de renovación 2026-10 — escribe 05-IDEAS.md (F4, PROMPT §F4, plan §7.4, DEC-35) desde _crudo/f4-resultado.json
// (dos generadores y un crítico adversarial). Cada habilitador se cita como `ruta:línea` comprobada contra la base:
// las citas que no existen en la ref se dejan como texto. Un solo uso.
// Uso (desde logic-core-v3): node scripts/auditoria/ideas-md.mjs [--ref 57c421bc]

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { nodoDeRuta } from './atlas/nodos.mjs'

const args = process.argv.slice(2)
const REF = args.includes('--ref') ? args[args.indexOf('--ref') + 1] : '57c421bc'
const DIR = path.resolve(process.cwd(), 'docs/auditoria-2026-10')
const r = JSON.parse(readFileSync(path.join(DIR, '_crudo/f4-resultado.json'), 'utf8'))
const F = r.final
const largo = new Map()
const lineasDe = (ruta) => {
  if (!largo.has(ruta)) { try { largo.set(ruta, execFileSync('git', ['show', `${REF}:./${ruta}`], { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').length) } catch { largo.set(ruta, 0) } }
  return largo.get(ruta)
}
const REF_RE = /((?:src|prisma|netlify|scripts|tests)\/[^\s:,;()«»`]+?\.[a-zA-Z]+|netlify\.toml|package\.json|vercel\.json):(\d+)(?:-(\d+))?/g
const citas = (txt) => [...txt.matchAll(REF_RE)].map(([, ruta, a, b]) => ({ ruta, a: Number(a), b: b ? Number(b) : null })).filter((c) => lineasDe(c.ruta) >= (c.b ?? c.a))
const parsear = (l) => { const f = []; let a = '', q = false; for (let i = 0; i < l.length; i++) { const c = l[i]; if (q) { if (c === '"' && l[i + 1] === '"') { a += '"'; i++ } else if (c === '"') q = false; else a += c } else if (c === '"') q = true; else if (c === ',') { f.push(a); a = '' } else a += c } f.push(a); return f }
const dominio = new Map(readFileSync(path.join(DIR, '_cobertura.csv'), 'utf8').replace(/\r\n/g, '\n').split('\n').slice(1).filter(Boolean).map(parsear).map((f) => [f[0].replace(/^logic-core-v3\//, ''), f[1]]))
const zona = (z) => (/FRANCO/i.test(z) ? 'ZONA-FRANCO' : /congel|FROZEN/i.test(z) ? 'congelado' : 'libre')
const puntaje = (x) => x.impacto * x.factibilidad / x.costo

const ranking = [...F.ranking].sort((a, b) => puntaje(b) - puntaje(a))
const bloques = ranking.map((x, i) => {
  const id = `IDEA-${String(i + 1).padStart(3, '0')}`
  const cs = x.habilitadores.flatMap(citas)
  const unicas = [...new Map(cs.map((c) => [`${c.ruta}:${c.a}`, c])).values()]
  const doms = unicas.map((c) => dominio.get(c.ruta)).filter((d) => /^D\d$/.test(d ?? ''))
  const dom = doms.length ? Object.entries(doms.reduce((a, d) => { a[d] = (a[d] ?? 0) + 1; return a }, {})).sort((p, q) => q[1] - p[1])[0][0] : 'D9'
  const nodos = [...new Set(unicas.map((c) => nodoDeRuta(c.ruta)))].slice(0, 5)
  x.id = id
  return [
    `### [${id}] ${x.titulo}`,
    `- Dominio: ${dom}  ·  Severidad: — (idea)  ·  Tipo: idea`,
    '- Confianza: VERIFICADO-POR-LECTURA (habilitadores leídos por el crítico; ver «Verificación»)',
    `- Evidencia: ${unicas.slice(0, 8).map((c) => `\`${c.ruta}:${c.a}${c.b ? `-${c.b}` : ''}\``).join(' · ')}`,
    `- Impacto: ${x.problema}`,
    `- Propuesta: ${x.que_falta}`,
    `- Esfuerzo: ${x.esfuerzo}  ·  Zona: ${zona(x.zona)}${zona(x.zona) !== 'libre' ? ` (${x.zona})` : ''}`,
    `- Nodo(s): ${nodos.join(', ') || 'lib.chatbot'}`,
    `- Habilitadores (lo que ya existe): ${x.habilitadores.map((h) => h.replace(/\n/g, ' ')).join(' · ')}`,
    `- Costo operativo (free tiers): ${x.costo_operativo}`,
    `- Riesgo: ${x.riesgo}`,
    `- Origen: ${x.origen}`,
    `- Puntaje: impacto ${x.impacto} × factibilidad ${x.factibilidad} ÷ costo ${x.costo} = **${puntaje(x).toFixed(2)}**. ${x.cuenta}`,
    `- Verificación: ${x.verificacion}`,
    '',
  ].join('\n')
})

const md = `# 05 — Ideas

> F4 del PROMPT. Entre 10 y 15 ideas, rankeadas; cada una se apoya en algo concreto que ya existe en el repo (\`origin/main\` @ \`${REF}\`) y nada exige cambiar de stack. Se armó con un workflow de solo lectura (run \`wf_4995cac0-53b\`, \`_crudo/f4-resultado.json\`): dos generadores con perspectivas distintas (el dueño de la PyME y la operación de develOP) propusieron ${r.candidatas.length} candidatas, y un crítico adversarial abrió cada habilitador, juntó duplicados, descartó ${F.descartadas.length} y puntuó el resto. **La lista de Olme** (\`_insumos/drive/Olme/Ideas de nuevas features.md\`, del 2026-06-20) fue insumo obligatorio (DEC-35): sus ideas no se proponen como nuevas; se evalúan abajo con su cita y su factibilidad de hoy.

## Ranking

Puntaje = impacto × factibilidad ÷ costo, cada factor de 1 a 5 (costo 5 = el más caro, sumando esfuerzo y costo operativo). La cuenta y la razón de cada factor van en cada idea.

| # | Idea | Impacto | Factibilidad | Costo | Puntaje | Esfuerzo | Zona |
|---|---|---|---|---|---|---|---|
${ranking.map((x, i) => `| [${x.id}] | ${x.titulo} | ${x.impacto} | ${x.factibilidad} | ${x.costo} | ${puntaje(x).toFixed(2)} | ${x.esfuerzo.split(':')[0]} | ${zona(x.zona)} |`).join('\n')}

## Ideas

${bloques.join('\n')}
## Las ideas de Olme, evaluadas

Fuente: \`_insumos/drive/Olme/Ideas de nuevas features.md\` (insumo local, no versionado). Ninguna se propone como nueva; cada una lleva su factibilidad con el código de hoy.

| Idea de Olme | Cita | ¿En el ranking? | Factibilidad hoy |
|---|---|---|---|
${F.olme.map((o) => `| ${o.idea.replace(/\|/g, '\\|')} | ${o.cita.replace(/^docs\//, '')} | ${o.en_ranking ? 'sí' : 'no'} | ${o.factibilidad_hoy.replace(/\|/g, '\\|').replace(/\n/g, ' ')} |`).join('\n')}

## Descartadas

${F.descartadas.map((d) => `- **${d.titulo}.** ${d.motivo}`).join('\n')}
`
writeFileSync(path.join(DIR, '05-IDEAS.md'), md, 'utf8')
console.log(`05-IDEAS.md: ${ranking.length} ideas (IDEA-001..IDEA-${String(ranking.length).padStart(3, '0')}) · Olme ${F.olme.length} · descartadas ${F.descartadas.length}`)
