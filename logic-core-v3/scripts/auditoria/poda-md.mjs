#!/usr/bin/env node
// Auditoría de renovación 2026-10 — genera docs/auditoria-2026-10/10-PODA.md desde
// _crudo/poda-candidatos.json (salida de poda.mjs) y la lista de archivos PODA-ALTA
// que pasan a lectura superficial en F2 (ENMIENDA-01 E2, DEC-36).
//
// IDs POD-NNN estables: si 10-PODA.md ya existe, se conserva el ID de cada candidato
// (por título) y los nuevos toman máximo + 1. Nunca se reutiliza un ID.
//
// Uso (desde logic-core-v3): node scripts/auditoria/poda-md.mjs

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { nodoDeRuta, nodoDeRama } from './atlas/nodos.mjs'

const appRoot = process.cwd()
const CRUDO = path.resolve(appRoot, 'docs/auditoria-2026-10/_crudo')
const MD = path.resolve(appRoot, 'docs/auditoria-2026-10/10-PODA.md')
const LISTA_ALTA = path.join(CRUDO, 'lista-poda-alta.txt')
const p = JSON.parse(readFileSync(path.join(CRUDO, 'poda-candidatos.json'), 'utf8'))
const A = 'logic-core-v3/'

function parsearFila(l) { const f = []; let a = '', q = false; for (let i = 0; i < l.length; i++) { const c = l[i]; if (q) { if (c === '"' && l[i + 1] === '"') { a += '"'; i++ } else if (c === '"') q = false; else a += c } else if (c === '"') q = true; else if (c === ',') { f.push(a); a = '' } else a += c } f.push(a); return f }
const ledger = new Map(readFileSync(path.resolve(appRoot, 'docs/auditoria-2026-10/_cobertura.csv'), 'utf8').replace(/\r\n/g, '\n').split('\n').slice(1).filter(Boolean).map(parsearFila).map((f) => [f[0], { alcance: f[2], estado: f[3], notas: f[5] ?? '' }]))

// IDs previos (estabilidad).
const previos = new Map()
let maximo = 0
if (existsSync(MD)) for (const m of readFileSync(MD, 'utf8').matchAll(/^### \[POD-(\d+)\] (.+)$/gm)) { previos.set(m[2].trim(), Number(m[1])); maximo = Math.max(maximo, Number(m[1])) }

const ORDEN = ['archivo', 'export', 'server-action-sin-llamador', 'ruta', 'dependencia', 'dependencia-faltante', 'config-muerta', 'script-one-off', 'salida-generada', 'enum-sin-uso', 'rama']
const NOMBRE_CAT = {
  archivo: 'Archivos', export: 'Exports sin uso', 'server-action-sin-llamador': 'Server actions sin llamador', ruta: 'Rutas sin entrada',
  dependencia: 'Dependencias de package.json', 'dependencia-faltante': 'Dependencias faltantes o sin resolver (no es poda: va a D8)',
  'config-muerta': 'Configuraciones y docs de plataforma muertos', 'script-one-off': 'Scripts one-off y sueltos', 'salida-generada': 'Salidas generadas y temporales commiteadas',
  'enum-sin-uso': 'Valores de enum sin uso', rama: 'Ramas',
}
const RANGO = { ALTA: 0, MEDIA: 1, BAJA: 2 }
function propuesta(c) {
  if (c.rediseno) return 'esperar merge de rediseno/home'
  if (c.zona === 'ZONA-FRANCO') return 'decidir (Franco)'
  if (c.zona === 'congelado') return 'decidir (Valentino): está congelado en esta corrida'
  if (c.categoria === 'config-muerta') return c.titulo.endsWith('vercel.json') ? 'fusionar con netlify.toml (mover los 3 crons) y después borrar' : 'fusionar con el doc de operaciones de 14-DOCS-CONSOLIDADOS y después borrar'
  if (c.categoria === 'dependencia-faltante') return 'decidir (Valentino): declarar o quitar el uso (hallazgo de D8)'
  if (c.categoria === 'rama') return c.confianza === 'ALTA' ? 'borrar la rama (su contenido ya está en main)' : 'archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí'
  if (c.confianza === 'ALTA') return 'borrar'
  return 'decidir (Valentino)'
}
const nodos = (c) => (c.categoria === 'rama' ? [nodoDeRama(c.rama)] : [...new Set(c.archivos.map((f) => nodoDeRuta(f)))])

const ordenados = [...p.candidatos].sort((a, b) => ORDEN.indexOf(a.categoria) - ORDEN.indexOf(b.categoria) || RANGO[a.confianza] - RANGO[b.confianza] || a.titulo.localeCompare(b.titulo))
for (const c of ordenados) {
  const t = c.titulo.trim()
  c.id = previos.get(t) ?? ++maximo
}
const ficha = (c) => [
  `### [POD-${String(c.id).padStart(3, '0')}] ${c.titulo.trim()}`,
  `- ${NOMBRE_CAT[c.categoria] ?? c.categoria} · ${c.archivos.length ? `${c.archivos.map((f) => `\`${f.startsWith(A) ? f.slice(A.length) : `raíz:${f}`}\``).slice(0, 4).join(', ')}${c.archivos.length > 4 ? ` +${c.archivos.length - 4}` : ''} · ${c.loc} LOC` : 'sin archivos'} · Nodo(s): ${nodos(c).join(', ')} · Señales: ${c.senales.join('; ')}`,
  `- Qué rompe si se borra: ${c.que_rompe}`,
  `- Confianza de poda: ${c.confianza}`,
  `- Propuesta: ${propuesta(c)}`,
  `- Zona: ${c.zona === 'congelado' ? 'congelado' : c.zona}`,
  '',
].join('\n')

// Archivos PODA-ALTA: confianza ALTA, fuera de rediseno, archivo o script, alcance profundo y pendiente en el ledger.
const alta = ordenados.filter((c) => c.confianza === 'ALTA' && !c.rediseno && ['archivo', 'script-one-off'].includes(c.categoria))
const altaProfundos = alta.flatMap((c) => c.archivos).filter((f) => ledger.get(f)?.alcance === 'profundo')
const locAltaProfundo = altaProfundos.reduce((s, f) => s + (p.candidatos.find((c) => c.archivos.includes(f))?.loc ?? 0), 0)
writeFileSync(LISTA_ALTA, altaProfundos.join('\n') + '\n', 'utf8')

const fuera = ordenados.filter((c) => !c.rediseno)
const rediseno = ordenados.filter((c) => c.rediseno)
const tabla = {}
for (const c of ordenados) { const k = c.categoria; tabla[k] ??= { ALTA: 0, MEDIA: 0, BAJA: 0, rediseno: 0, loc: 0 }; c.rediseno ? tabla[k].rediseno++ : tabla[k][c.confianza]++; tabla[k].loc += c.loc }

const md = []
md.push('# 10 — Poda', '')
md.push(`> Triage de poda de la ENMIENDA-01 E2 (DEC-36). Generado por \`scripts/auditoria/poda.mjs\` + \`poda-md.mjs\` sobre \`${p.ref}\`, con \`${p.rediseno}\` como referencia de lo que no se toca; fecha de referencia ${p.hoy}. knip: **${p.knip_disponible ? 'disponible' : 'NO disponible'}**. Las señales son candidatos, no verdad: la confianza ALTA exige dos señales independientes, «nada encontrado» en la búsqueda de qué rompe y que no sea zona congelada, de Franco ni de \`rediseno/home\`. **No se borra nada en esta corrida.**`, '')
md.push('## Resumen', '')
md.push('| Categoría | ALTA | MEDIA | BAJA | Esperar rediseño | LOC |', '|---|---|---|---|---|---|')
for (const k of ORDEN.filter((k) => tabla[k])) md.push(`| ${NOMBRE_CAT[k]} | ${tabla[k].ALTA} | ${tabla[k].MEDIA} | ${tabla[k].BAJA} | ${tabla[k].rediseno} | ${tabla[k].loc} |`)
md.push(`| **Total** | **${fuera.filter((c) => c.confianza === 'ALTA').length}** | **${fuera.filter((c) => c.confianza === 'MEDIA').length}** | **${fuera.filter((c) => c.confianza === 'BAJA').length}** | **${rediseno.length}** | **${ordenados.reduce((s, c) => s + c.loc, 0)}** |`, '')
md.push('## Regla por defecto para F2 (PODA-ALTA)', '')
md.push(`Los archivos de confianza ALTA (categorías archivo y script, fuera de \`rediseno/home\`) que el ledger tenía como **profundo** pasan a lectura **superficial** (estado \`superficial\`, nota \`PODA-ALTA\`): **${altaProfundos.length} archivos, ${locAltaProfundo} LOC** que quedan fuera de la lectura profunda. Lista: \`_crudo/lista-poda-alta.txt\`. Si Valentino decide conservar alguno, se audita en ese momento.`, '')
for (const k of ORDEN) {
  const cs = fuera.filter((c) => c.categoria === k)
  if (!cs.length) continue
  md.push(`## ${NOMBRE_CAT[k]}`, '')
  for (const c of cs) md.push(ficha(c))
}
md.push('## Esperar merge de `rediseno/home`', '')
md.push(`Candidatos que \`rediseno/home\` modifica o borra (\`git diff --name-status ${p.ref}...${p.rediseno}\`), que pertenecen al home viejo que v3 reemplaza, o que son ramas intermedias del rediseño. **No se proponen para borrar ahora**: esta sección es el insumo de la poda post-merge.`, '')
for (const c of rediseno) md.push(ficha(c))
// Candidatos que traen los lectores de F2 (_crudo/poda-f2.json): si el archivo ya tiene ficha de F1
// se suman sus señales a esa ficha (sección siguiente); si no, ficha nueva con confianza MEDIA (la
// señal viene de lectura, no de un barrido mecánico) e ID estable por título.
const f2 = existsSync(path.join(CRUDO, 'poda-f2.json')) ? JSON.parse(readFileSync(path.join(CRUDO, 'poda-f2.json'), 'utf8')).items : []
const limpiarRuta = (r) => String(r).replace(/\\/g, '/').replace(/\s+\(.*\)\s*$/, '').replace(/^.*?logic-core-v3\//, '').trim()
const refuerzos = []
const nuevosF2 = []
for (const c of f2) {
  const ruta = limpiarRuta(c.archivo)
  const previa = ordenados.find((x) => x.archivos.some((f) => f === `${A}${ruta}` || f.startsWith(`${A}${ruta.replace(/\/$/, '')}/`)))
  if (previa) refuerzos.push({ id: previa.id, ruta, c })
  else nuevosF2.push({ ruta, c })
}
if (nuevosF2.length || refuerzos.length) {
  md.push('## Candidatos de F2 (lectores y cazadores)', '')
  md.push('> Señales que encontraron los lectores de cada dominio al leer el código completo. Confianza MEDIA salvo que el dominio la confirme; la propuesta queda para Valentino (o para Franco en su zona).', '')
  for (const { ruta, c } of nuevosF2) {
    const titulo = `${ruta} (${c.ciclo})`
    const id = previos.get(titulo) ?? ++maximo
    const zona = ledger.get(`${A}${ruta}`)?.notas ?? ''
    const z = /ZONA-FRANCO/.test(zona) ? (/FROZEN/.test(zona) ? 'FROZEN + ZONA-FRANCO' : 'ZONA-FRANCO') : /(^|; )FROZEN/.test(zona) ? 'congelado' : 'libre'
    md.push(`### [POD-${String(id).padStart(3, '0')}] ${titulo}`)
    md.push(`- Hallado en F2 · \`${ruta}\` · Nodo(s): ${nodoDeRuta(`${A}${ruta}`)} · Señales: ${c.senales.join('; ')}`)
    md.push(`- Qué rompe si se borra: ${c.que_rompe}`)
    md.push('- Confianza de poda: MEDIA')
    md.push(`- Propuesta: ${z === 'libre' ? 'decidir (Valentino)' : z === 'ZONA-FRANCO' ? 'decidir (Franco)' : 'decidir (Valentino): archivo congelado'}`)
    md.push(`- Zona: ${z}`, '')
  }
  if (refuerzos.length) {
    md.push('### Refuerzos de F2 sobre fichas de F1', '')
    for (const { id, ruta, c } of refuerzos) md.push(`- [POD-${String(id).padStart(3, '0')}] \`${ruta}\` (${c.ciclo}): ${c.senales.join('; ')}. Qué rompe: ${c.que_rompe}`)
    md.push('')
  }
}
md.push('## §docs', '', 'Se completa en F6 junto con `14-DOCS-CONSOLIDADOS/` (DEC-44): qué doc se borra, qué consolidado lo reemplaza y qué se pierde, si algo.', '')
writeFileSync(MD, md.join('\n'), 'utf8')
console.log(`10-PODA.md: ${ordenados.length} fichas (POD-001..POD-${String(maximo).padStart(3, '0')}); PODA-ALTA profundos: ${altaProfundos.length} archivos / ${locAltaProfundo} LOC → ${path.relative(appRoot, LISTA_ALTA)}`)
