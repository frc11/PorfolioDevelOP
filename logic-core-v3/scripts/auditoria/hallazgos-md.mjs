#!/usr/bin/env node
// Auditoría de renovación 2026-10 — del registro de hallazgos a los entregables.
//
// Fuente de verdad: _crudo/hallazgos.json ({ hallazgos: [...] }) y _crudo/funcionalidades.json.
// Genera:
//   03-MEJORAS.md      todo lo que no es FAL, por sección (DEC-24), con la sección ZONA-FRANCO al final
//   02-PENDIENTE.md    madurez por herramienta (funcionalidades, DEC-25) + los FAL bajo su herramienta
//   09-PARA-FRANCO.md  la sección «Hallazgos» (lo ZONA-FRANCO, con la plantilla de 09); el resto del
//                      archivo (bloques a ejecutar) se conserva tal cual
// Un hallazgo con `bloque_md` (escrito a mano) se copia verbatim; los demás se arman con §5.1 +
// `Nodo(s)`. La primera vez, si el registro no existe, se importa de los bloques de 03-MEJORAS.md.
// Ningún fragmento con forma de credencial llega al .md (patrones de secrets-historial.mjs).
//
// Uso (desde logic-core-v3): node scripts/auditoria/hallazgos-md.mjs

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { AREAS, HERRAMIENTAS } from './atlas/nodos.mjs'

const DIR = path.resolve(process.cwd(), 'docs/auditoria-2026-10')
const CRUDO = path.join(DIR, '_crudo')
const REG = path.join(CRUDO, 'hallazgos.json')
const FUN = path.join(CRUDO, 'funcionalidades.json')
const leer = (f, d) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, '')) : d)

// patrones de credencial (los de secrets-historial.mjs, sin duplicarlos)
const srcSec = readFileSync(path.resolve(process.cwd(), 'scripts/auditoria/secrets-historial.mjs'), 'utf8').replace(/\r\n/g, '\n')
const iniP = srcSec.indexOf('const PATRONES = [')
const PATRONES = (0, eval)(srcSec.slice(iniP, srcSec.indexOf('\n]\n', iniP) + 2).replace('const PATRONES = ', '').trim())
export const limpio = (s) => (PATRONES.some(([, re]) => re.test(String(s ?? ''))) ? '(omitido: tiene forma de credencial)' : String(s ?? ''))

const SECCIONES = ['Seguridad', 'Bugs latentes', 'Tecnología vieja', 'Rendimiento', 'Deuda', 'Calidad', 'Observabilidad', 'Accesibilidad']
const ORDEN_SEV = { 'CRÍTICA': 0, ALTA: 1, MEDIA: 2, BAJA: 3 }
const TIPO = { SEC: 'seguridad', BUG: 'bug', TEC: 'tech-vieja', PERF: 'perf', DEU: 'deuda', A11Y: 'a11y', UX: 'ux', FAL: 'faltante' }
const esFranco = (h) => /ZONA-FRANCO/.test(h.zona ?? '')
const seccionDe = (h) => {
  if (h.seccion) return h.seccion
  const t = String(h.tipo_detalle ?? h.tipo ?? '')
  if (/observab/i.test(t)) return 'Observabilidad'
  if (/calidad/i.test(t)) return 'Calidad'
  return { SEC: 'Seguridad', BUG: 'Bugs latentes', TEC: 'Tecnología vieja', PERF: 'Rendimiento', DEU: 'Deuda', A11Y: 'Accesibilidad', UX: 'Calidad' }[h.prefijo] ?? 'Deuda'
}
const num = (id) => Number(String(id).split('-')[1])
const ordenar = (a, b) => (ORDEN_SEV[a.severidad] ?? 9) - (ORDEN_SEV[b.severidad] ?? 9) || a.prefijo.localeCompare(b.prefijo) || num(a.id) - num(b.id)

// ── Import inicial desde 03-MEJORAS.md ──────────────────────────────────────
function importar() {
  const texto = readFileSync(path.join(DIR, '03-MEJORAS.md'), 'utf8').replace(/\r\n/g, '\n')
  const hs = []
  let seccion = null
  for (const parte of texto.split(/\n(?=## |### \[)/)) {
    const s = parte.match(/^## (.+)$/m)
    if (s && parte.startsWith('## ')) { seccion = s[1].trim(); continue }
    const m = parte.match(/^### \[([A-Z0-9]+)-(\d+)\] (.+)$/m)
    if (!m) continue
    const bloque = parte.replace(/\n+$/, '')
    hs.push({
      id: `${m[1]}-${m[2]}`, prefijo: m[1], titulo: m[3].trim(), bloque_md: bloque,
      severidad: (bloque.match(/Severidad:\s*(CRÍTICA|ALTA|MEDIA|BAJA)/) ?? [])[1] ?? null,
      zona: ((bloque.match(/Zona:\s*([^\n·]+)/) ?? [])[1] ?? '').trim(),
      dominio: (bloque.match(/Dominio:\s*(D\d)/) ?? [])[1] ?? null,
      nodos: ((bloque.match(/Nodo\(s\):\s*([^\n]+)/) ?? [])[1] ?? '').split(',').map((x) => x.trim()).filter(Boolean),
      vh: (bloque.match(/REQUIERE-VERIFICACIÓN-HUMANA:\s*(VH-\d+)/) ?? [])[1] ?? null,
      seccion: seccion === 'ZONA-FRANCO' ? null : seccion,
      origen: { ciclo: 'F1', manual: true }, estado: 'vigente',
    })
  }
  return { hallazgos: hs }
}
const reg = leer(REG, null) ?? importar()
if (!existsSync(REG)) writeFileSync(REG, JSON.stringify(reg, null, 1), 'utf8')
const vigentes = reg.hallazgos.filter((h) => h.estado !== 'descartado')

// ── Bloque §5.1 ──────────────────────────────────────────────────────────────
const comillas = (s) => limpio(s).replace(/`/g, "'").replace(/\s+/g, ' ').trim().slice(0, 220)
// el código de librerías (node_modules) no está en el repo: se cita con paquete@versión y sin
// backticks, para que validar.mjs no lo tome como una ruta del repo
const versiones = new Map()
const versionDe = (pkg) => {
  if (!versiones.has(pkg)) { try { versiones.set(pkg, JSON.parse(readFileSync(path.resolve(process.cwd(), 'node_modules', pkg, 'package.json'), 'utf8')).version) } catch { versiones.set(pkg, '?') } }
  return versiones.get(pkg)
}
export function evidenciaMd(h) {
  return (h.evidencia ?? []).map((e) => {
    const frag = e.fragmento ? ` — «${comillas(e.fragmento)}»` : ''
    const lib = String(e.ruta).match(/^node_modules\/((?:@[^/]+\/)?[^/]+)\/(.+)$/)
    if (lib) return `librería ${lib[1]}@${versionDe(lib[1])}, ${lib[2]} línea ${e.linea}${frag}`
    // salidas de la propia auditoría (baselines de _crudo/): no están en origin/main
    const propia = String(e.ruta).match(/^docs\/auditoria-2026-10\/(.+)$/)
    if (propia) return `dato de la auditoría, ${propia[1]} línea ${e.linea}${frag}`
    return `\`${e.ruta}:${e.linea}${e.linea_fin ? `-${e.linea_fin}` : ''}\`${frag}`
  }).join('; ')
}
function bloque(h) {
  if (h.bloque_md) return h.bloque_md
  const ids = (h.relacionados_ids ?? []).map((i) => `[${i}]`)
  const rel = [ids.join(', '), (h.previas ?? []).length ? `previas: ${h.previas.join('; ')}` : ''].filter(Boolean).join('; ') || '—'
  const l = [
    `### [${h.id}] ${h.titulo}`,
    `- Dominio: ${h.dominio}  ·  Severidad: ${h.severidad}  ·  Tipo: ${TIPO[h.prefijo] ?? h.tipo}`,
    `- Confianza: ${h.confianza}`,
    `- Evidencia: ${evidenciaMd(h)}`,
    `- Impacto: ${limpio(h.impacto)}`,
    `- Propuesta: ${limpio(h.propuesta)}`,
    `- Esfuerzo: ${h.esfuerzo}  ·  Zona: ${h.zona}`,
    `- Relacionado: ${rel}`,
    `- Nodo(s): ${(h.nodos ?? []).join(', ')}`,
  ]
  if (h.vh) l.push(`- REQUIERE-VERIFICACIÓN-HUMANA: ${h.vh}`)
  return l.join('\n')
}

// ── 03-MEJORAS.md ────────────────────────────────────────────────────────────
const CAB_03 = '# 03 — Mejoras\n\n> Seguridad · bugs latentes · tecnología vieja · rendimiento · deuda · calidad · observabilidad · accesibilidad, más una sección final ZONA-FRANCO. Formato de hallazgo: PROMPT §5.1 + la línea `Nodo(s)` (ENMIENDA-01 E7). IDs `PREFIJO-NNN` globales por prefijo, nunca reutilizados (DEC-24). Severidad y confianza con la rúbrica DEC-23; no hay clientes reales, así que el impacto se redacta como «bloqueante para el primer cliente real». `REQUIERE-VERIFICACIÓN-HUMANA` es una marca aparte con su `VH-NNN` de `08`. Las MEDIA y BAJA quedan `PROBABLE` salvo las que el padre leyó (DEC-37). Ningún valor de secret aparece en este documento. Rutas relativas a `logic-core-v3/`. Generado por `scripts/auditoria/hallazgos-md.mjs` desde `_crudo/hallazgos.json`.'
const no_fal = vigentes.filter((h) => h.prefijo !== 'FAL')
const md03 = [CAB_03, '']
for (const s of SECCIONES) {
  md03.push(`## ${s}`, '')
  for (const h of no_fal.filter((x) => !esFranco(x) && seccionDe(x) === s).sort(ordenar)) md03.push(bloque(h), '')
}
md03.push('## ZONA-FRANCO', '', '> Hallazgos sobre `src/lib/leados/`, `setter/`, `admin/leados/`, `admin/leads/_actions/`, `admin/fg2-lab/`, `src/auth.ts`, `src/lib/auth-cookies.ts`, `api/qa/login` y los modelos `OsLead*`/`ActivityChannel`. Se repiten en `09-PARA-FRANCO.md`.', '')
for (const h of no_fal.filter(esFranco).sort(ordenar)) md03.push(bloque(h), '')
writeFileSync(path.join(DIR, '03-MEJORAS.md'), md03.join('\n'), 'utf8')

// ── 02-PENDIENTE.md ──────────────────────────────────────────────────────────
const CAB_02 = '# 02 — Qué falta\n\n> Madurez de cada herramienta de §6 del plan, con la escala del PROMPT §5.2 (L0 no existe · L1 esqueleto · L2 camino feliz · **L3 listo para cliente** · L4 pulido). **La unidad que se mide es la funcionalidad** (ENMIENDA-01 E7, DEC-25); la madurez de una herramienta es la de su funcionalidad más floja y la de un área, un cálculo agregado. Un L2 o más afirma que algo funciona: exige el camino feliz trazado con `ruta:línea`; si no, queda `L?`. Los faltantes se escriben como `FAL-NNN` bajo su herramienta. La hipótesis de Valentino —«el admin y el portal están muy desarrollados y les faltan sobre todo módulos»— se confirma o se desmiente acá con evidencia, no se asume. Generado por `scripts/auditoria/hallazgos-md.mjs` (funcionalidades de `_crudo/funcionalidades.json`, faltantes de `_crudo/hallazgos.json`).'
const CRIT = { permisos_tenant: 'permisos y tenant', vacios: 'vacíos', errores: 'errores', carga: 'carga', validacion_servidor: 'validación en servidor', mobile: 'mobile', sentry: 'Sentry', sin_mocks_todos: 'sin mocks ni TODO', autonomia: 'autonomía' }
const NIVEL = { L0: 0, L1: 1, 'L?': 1.5, L2: 2, L3: 3, L4: 4 }
const fun = leer(FUN, { items: [] }).items
const funPorHerr = new Map()
for (const f of fun) { const h = String(f.herramienta).split('.').slice(0, 2).join('.'); if (!funPorHerr.has(h)) funPorHerr.set(h, []); funPorHerr.get(h).push(f) }
const faltan = (f) => Object.entries(f.criterios_l3 ?? {}).filter(([, v]) => v && v.cumple !== 'si' && v.cumple !== 'n/a').map(([k]) => CRIT[k] ?? k)
const fals = vigentes.filter((h) => h.prefijo === 'FAL')
const herrDe = (h) => (h.nodos ?? []).map((n) => n.split('.').slice(0, 2).join('.')).find((n) => /^h\d\./.test(n)) ?? null
const md02 = [CAB_02, '', '## Resumen por área', '']
md02.push('| Área | Herramientas medidas | Funcionalidades | En L3 o más | Faltantes de L3 más comunes | FAL |', '|---|---:|---:|---:|---|---:|')
for (const [a, nombre] of Object.entries(AREAS)) {
  const hs = [...funPorHerr.keys()].filter((h) => h.startsWith(`${a}.`))
  const fs = hs.flatMap((h) => funPorHerr.get(h))
  const cuenta = {}
  for (const f of fs) for (const c of faltan(f)) cuenta[c] = (cuenta[c] ?? 0) + 1
  const top = Object.entries(cuenta).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([c, n]) => `${c} (${n})`).join(', ')
  md02.push(`| ${a} · ${nombre} | ${hs.length} / ${Object.values(HERRAMIENTAS).filter(([ar]) => ar === a).length} | ${fs.length} | ${fs.filter((f) => NIVEL[f.madurez] >= 3).length} | ${top || '—'} | ${fals.filter((h) => (herrDe(h) ?? '').startsWith(`${a}.`)).length} |`)
}
md02.push('')
for (const [a, nombre] of Object.entries(AREAS)) {
  md02.push(`## ${a} · ${nombre}${a === 'h5' ? ' (ZONA-FRANCO)' : ''}`, '')
  for (const [id, [ar, nom]] of Object.entries(HERRAMIENTAS)) {
    if (ar !== a) continue
    const h = `${a}.${id}`
    const fs = funPorHerr.get(h) ?? []
    const fh = fals.filter((x) => herrDe(x) === h && !esFranco(x))
    if (!fs.length && !fh.length) continue
    md02.push(`### ${h} — ${nom}`, '')
    if (fs.length) {
      const min = fs.reduce((m, f) => (NIVEL[f.madurez] < NIVEL[m] ? f.madurez : m), 'L4')
      const crits = [...new Set(fs.flatMap(faltan))]
      md02.push(`- Madurez de la herramienta: **${min}** (la de su funcionalidad más floja; ${fs.length} funcionalidades: ${Object.entries(fs.reduce((m, f) => ((m[f.madurez] = (m[f.madurez] ?? 0) + 1), m), {})).map(([k, v]) => `${v}×${k}`).join(', ')}).`)
      md02.push(`- Criterios de L3 que faltan en alguna funcionalidad: ${crits.length ? crits.join(', ') : 'ninguno'}.`, '')
      md02.push('| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |', '|---|---|---|---|')
      for (const f of fs.slice().sort((x, y) => String(x.id).localeCompare(String(y.id)))) md02.push(`| \`${f.id}\` ${String(f.nombre).replace(/\|/g, '/')} | ${f.madurez} | ${faltan(f).join(', ') || '—'} | ${limpio(f.madurez_evidencia).replace(/\|/g, '/').replace(/\s+/g, ' ').slice(0, 260)} |`)
      md02.push('')
    }
    for (const x of fh.sort(ordenar)) md02.push(bloque(x), '')
  }
  const sueltos = fals.filter((x) => !esFranco(x) && !herrDe(x) && (x.nodos ?? []).some((n) => n.startsWith(`${a}`)))
  if (sueltos.length) { md02.push('### Otros faltantes del área', ''); for (const x of sueltos.sort(ordenar)) md02.push(bloque(x), '') }
}
md02.push('## ZONA-FRANCO', '', '> Faltantes en herramientas de Franco; se repiten en `09-PARA-FRANCO.md`.', '')
for (const x of fals.filter(esFranco).sort(ordenar)) md02.push(bloque(x), '')
const sinArea = fals.filter((x) => !esFranco(x) && !herrDe(x) && !Object.keys(AREAS).some((a) => (x.nodos ?? []).some((n) => n.startsWith(a))))
if (sinArea.length) { md02.push('## Faltantes transversales', ''); for (const x of sinArea.sort(ordenar)) md02.push(bloque(x), '') }
writeFileSync(path.join(DIR, '02-PENDIENTE.md'), md02.join('\n'), 'utf8')

// ── 09-PARA-FRANCO.md (sección Hallazgos) ───────────────────────────────────
const p09 = path.join(DIR, '09-PARA-FRANCO.md')
const t09 = readFileSync(p09, 'utf8').replace(/\r\n/g, '\n')
const iH = t09.indexOf('## Hallazgos')
const iB = t09.indexOf('## Bloques a ejecutar')
const cab09 = t09.slice(0, iH).trimEnd()
const resto09 = iB >= 0 ? t09.slice(iB) : '## Bloques a ejecutar: estado contra el código\n'
const md09 = [cab09, '', '## Hallazgos', '']
const franco = vigentes.filter(esFranco).sort(ordenar)
if (!franco.length) md09.push('Todavía no hay hallazgos en la zona (se completa con D1 —`auth.ts`, `auth-cookies.ts`, `api/qa/login`— y con D4).', '')
for (const h of franco) {
  const doc = h.prefijo === 'FAL' ? '02-PENDIENTE.md' : '03-MEJORAS.md'
  md09.push(`### ${h.id} · ${h.titulo}`)
  md09.push(`- Contexto: ${h.contexto_franco ?? `${h.dominio ?? ''} · ${(h.nodos ?? []).join(', ')}. ${h.severidad ?? ''}${h.confianza ? `, ${h.confianza}` : ''}.`}`)
  md09.push(`- Evidencia: ${h.bloque_md ? `ver la ficha [${h.id}] en ${doc}` : evidenciaMd(h)}`)
  if (!h.bloque_md) { md09.push(`- Impacto: ${limpio(h.impacto)}`); md09.push(`- Propuesta: ${limpio(h.propuesta)}`) }
  md09.push(`- Cómo verificar: ${h.como_verificar ?? (h.vh ? `${h.vh} en 08-VERIFICACION-HUMANA.md` : 'leer las líneas citadas en origin/main')}`)
  const parteLibre = /\(libre|libre\)|\(libre en/i.test(h.propuesta ?? '')
  md09.push(`- Coordinación: ${h.coordinacion ?? (parteLibre ? 'una parte del arreglo cae fuera de la zona (ver Propuesta, «libre»): coordinar con Valentino quién la hace' : 'ninguna fuera de la zona')}`)
  md09.push(`- Ficha completa: ${h.id} en ${doc}`, '')
}
writeFileSync(p09, [...md09, resto09.trimEnd(), ''].join('\n'), 'utf8')

console.log(`hallazgos-md: ${vigentes.length} vigentes (${no_fal.length} en 03, ${fals.length} FAL en 02, ${franco.length} en 09) · ${fun.length} funcionalidades en ${funPorHerr.size} herramientas`)
