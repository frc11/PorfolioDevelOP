#!/usr/bin/env node
// Auditoría de renovación 2026-10 — completa 09-PARA-FRANCO.md desde «## Bloques a ejecutar» hasta el final:
// el estado contra el código de cada ítem de los bloques de Franco (Drive: «Bloques a Ejecutar/», y los
// pendientes de las bitácoras del repo), que trajeron los extractores de F6b (_crudo/f6b-extraccion/), y las
// tarjetas del backlog en su zona (06-ATLAS/backlog.json, si existe). La sección «## Hallazgos» la escribe
// hallazgos-md.mjs, que conserva todo lo que va desde «## Bloques a ejecutar». Un solo uso (F6.5).
// Uso (desde logic-core-v3): node scripts/auditoria/franco-md.mjs

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { leerPartido } from './crudo-partes.mjs'

const DIR = path.resolve(process.cwd(), 'docs/auditoria-2026-10')
const P09 = path.join(DIR, '09-PARA-FRANCO.md')
const t09 = readFileSync(P09, 'utf8').replace(/\r\n/g, '\n')
const iB = t09.indexOf('## Bloques a ejecutar')
if (iB < 0) { console.error('09 sin «## Bloques a ejecutar»'); process.exit(1) }
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').trim()

const ext = leerPartido(path.join(DIR, '_crudo'), 'f6b-extraccion', { items: [] }).items
const items = ext.flatMap((e) => (e.bloques_franco ?? []).map((x) => ({ ...x, extractor: e.extractor })))
// Correcciones de F7 (re-lectura de cierre, _crudo/f7-resultado.json), verificadas por el padre: [comienzo del ítem, cambios]
const CORRECCIONES = [
  ['Cargar los secrets BACKUP_GPG_PASSPHRASE', { estado: 'no empezado', evidencia: 'gh run list (2026-10-15): 140 corridas fallidas y 1 cancelada, ninguna exitosa, y 0 secrets de Actions en el repo (BUG-171); el workflow existe (.github/workflows/db-backup.yml:39-42). [F7 C6/K6]' }],
  ['H-05: cinco tildes por prompt en mc2', { evidencia: 'mc2 existe (manual.ts:107 y :135-137) con un tilde por fase; mc2-refinar.tsx y los cinco tildes por prompt existen solo en el WIP 506e0059 de origin/p25/rafaga-tildes. [F7 C9]' }],
  ['Setear NEXT_PUBLIC_SENTRY_DSN en Netlify', { estado: 'sin verificar', evidencia: 'Según bitacora-roadmap.md:17135 (2026-08) Sentry seguía inactivo en producción; el estado de la variable en Netlify no se ve en el código (VH-135). [F7 C21/K13]' }],
  ['Onboarding real de Matsu y firma de v1.0.0', { estado: 'no empezado', evidencia: 'No hay clientes reales (ENMIENDA-01 §0); STATUS.md:174-178 y bitacora-roadmap.md:9707-9718 lo dejaban pendiente, y el tema Matsu está entre los «a decidir» de 14-DOCS-CONSOLIDADOS. [F7 C22]' }],
]
for (const [inicio, cambios] of CORRECCIONES) {
  const x = items.find((i) => String(i.item).startsWith(inicio))
  if (!x) { console.error('no está el ítem', inicio); process.exit(1) }
  Object.assign(x, cambios)
}
const ORDEN = ['no empezado', 'parcial', 'sin verificar', 'hecho', 'abandonado', 'contradicho']
const cuenta = (xs) => ORDEN.map((k) => [k, xs.filter((x) => x.estado === k).length]).filter(([, n]) => n).map(([k, n]) => `${k} ${n}`).join(' · ')

const md = ['## Bloques a ejecutar: estado contra el código', '']
md.push(`> ${items.length} ítems (${cuenta(items)}). Los extrajeron los agentes de F6b (run \`wf_7cfe2151-e7b\`, \`_crudo/f6b-extraccion/\`) desde \`Franco/Bloques a Ejecutar/\` de Drive (insumo local, no se commitea) y desde las bitácoras y sprints del repo, y cada uno trae su evidencia en \`origin/main\` @ \`57c421bc\` (o la búsqueda que prueba que falta). El padre muestreó 5 contra la base y se sostuvieron (\`handleChatRequest.ts:952\`, \`agenda.ts:70\`, \`brief-form.tsx:85\`, \`historyPolicy.ts:31-61\`, \`herramientas.ts:63-117\`). Lo marcado «dudoso» por el extractor no se verificó.`, '')
const grupos = new Map()
for (const x of items) {
  const clave = x.extractor === 'resto' ? x.bloque : 'Pendientes de las bitácoras y sprints del repo'
  if (!grupos.has(clave)) grupos.set(clave, [])
  grupos.get(clave).push(x)
}
for (const [g, xs] of grupos) {
  const docs = [...new Set(xs.map((x) => x.doc))]
  md.push(`### ${g} — ${xs.length} ítems (${cuenta(xs)})`, '')
  if (g !== 'Pendientes de las bitácoras y sprints del repo') md.push(`Fuente: ${docs.map((d) => `\`${d}\``).join(', ')}.`, '')
  md.push(g === 'Pendientes de las bitácoras y sprints del repo' ? '| Bloque | Ítem | Estado | Evidencia | Fuente |' : '| Ítem | Estado | Evidencia |', g === 'Pendientes de las bitácoras y sprints del repo' ? '|---|---|---|---|---|' : '|---|---|---|')
  const orden = [...xs].sort((a, b) => ORDEN.indexOf(a.estado) - ORDEN.indexOf(b.estado))
  for (const x of orden) md.push(g === 'Pendientes de las bitácoras y sprints del repo' ? `| ${esc(x.bloque)} | ${esc(x.item)} | ${x.estado} | ${esc(x.evidencia)} | \`${esc(x.doc)}\` |` : `| ${esc(x.item)} | ${x.estado} | ${esc(x.evidencia)} |`)
  md.push('')
}

// Tarjetas del backlog en la zona
const BK = path.join(DIR, '06-ATLAS', 'backlog.json')
md.push('## Tarjetas del backlog en tu zona', '')
if (!existsSync(BK)) md.push('Se completa con `07-BACKLOG.md` (F6.4).', '')
else {
  const tj = JSON.parse(readFileSync(BK, 'utf8')).tarjetas.filter((t) => /FRANCO/i.test(t.zona))
  md.push(`> ${tj.length} tarjetas de \`07-BACKLOG.md\` tocan tu zona. Son **decisión tuya**: la auditoría no propone tocar nada de la zona sin coordinación. Detalle completo en \`07-BACKLOG.md\`.`, '')
  md.push('| Tarjeta | Bloque | Tamaño | Hallazgos | Coordinación |', '|---|---|---|---|---|')
  for (const t of tj) md.push(`| [${t.id}] ${esc(t.titulo)} | ${t.bloque} | ${t.tamano} | ${t.hallazgos.slice(0, 8).join(', ')}${t.hallazgos.length > 8 ? ` y ${t.hallazgos.length - 8} más` : ''} | ${/FROZEN/i.test(t.zona) ? 'también requiere decisión FROZEN (Valentino)' : esc(t.zona)} |`)
  md.push('')
}
writeFileSync(P09, t09.slice(0, iB) + md.join('\n'), 'utf8')
console.log(`09: ${items.length} ítems de bloques en ${grupos.size} grupos (${cuenta(items)})${existsSync(BK) ? ' + tarjetas de la zona' : ''}`)
