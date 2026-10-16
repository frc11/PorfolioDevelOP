#!/usr/bin/env node
// Atlas — backlog.json desde 07-BACKLOG.md (ENMIENDA-01 E7: «backlog.json — GENERADO desde 07-BACKLOG.md»).
// El .md es la fuente: lo mantienen las personas (estado de cada tarjeta, tarjetas nuevas). Este script lo
// parsea y pisa backlog.json. Portable: solo módulos nativos de Node, ningún import de src/.
//
// Tarjeta (bajo una sección «## Ahora», «## Próximo» o «## Después»):
//   ### [B-01] Título
//   - Objetivo: … · Hallazgos que cierra: [SEC-001], [BUG-002]
//   - Archivos a tocar: … · Archivos que NO se tocan: …
//   - Zona: libre | ZONA-FRANCO | requiere decisión FROZEN
//   - Tamaño: S|M|L · Riesgo: … · Prerrequisitos: [B-03] | ninguno
//   - Nivel de proceso: S|M|L · Modelo sugerido: … · Esfuerzo: … · Ultracode: ON|OFF
//   - Criterio de aceptación: …
//   - Nodo(s): h2.cli-inicio, lib.isolation
//   - Worktree: …
//   - Estado: abierta | en curso | hecha | descartada
//
// Uso (desde logic-core-v3): node scripts/auditoria/atlas/backlog.mjs [--backlog <07-BACKLOG.md>] [--atlas <carpeta 06-ATLAS>]

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d }
const ATLAS = path.resolve(opt('--atlas', 'docs/auditoria-2026-10/06-ATLAS'))
const MD = path.resolve(opt('--backlog', path.join(ATLAS, '..', '07-BACKLOG.md')))
if (!existsSync(MD)) { console.error(`no existe ${MD}`); process.exit(1) }

const texto = readFileSync(MD, 'utf8').replace(/\r\n/g, '\n')
const BLOQUES = { ahora: 'Ahora', 'próximo': 'Próximo', proximo: 'Próximo', 'después': 'Después', despues: 'Después' }
const campo = (b, nombre) => {
  const m = b.match(new RegExp(`(?:^|\\n- |· )${nombre}:\\s*([^\\n]*?)(?= · [A-ZÁÉÍÓÚ][^:\\n·]{2,40}:|\\n|$)`))
  return m ? m[1].trim() : ''
}
const ids = (s, re) => [...String(s).matchAll(re)].map((m) => m[1])

const tarjetas = []
const errores = []
let bloque = null
for (const seccion of texto.split(/\n(?=## |### \[B-\d+\])/)) {
  const h2 = seccion.match(/^## (.+)$/m)
  if (h2 && seccion.startsWith('## ')) {
    const clave = h2[1].trim().toLowerCase().split(/\s/)[0]
    bloque = BLOQUES[clave] ?? bloque
    continue
  }
  const m = seccion.match(/^### \[(B-\d+)\] (.+)$/m)
  if (!m) continue
  if (!bloque) { errores.push(`${m[1]} fuera de un bloque Ahora/Próximo/Después`); continue }
  const tam = campo(seccion, 'Tamaño')
  const nivel = campo(seccion, 'Nivel de proceso')
  const t = {
    id: m[1],
    titulo: m[2].trim(),
    bloque,
    objetivo: campo(seccion, 'Objetivo'),
    hallazgos: ids(campo(seccion, 'Hallazgos que cierra'), /\[([A-Z][A-Z0-9]*-\d+)\]/g),
    nodos: campo(seccion, 'Nodo\\(s\\)').split(/[,·]/).map((s) => s.replace(/`/g, '').trim().split(/\s/)[0]).filter(Boolean),
    zona: campo(seccion, 'Zona'),
    nivel_proceso: nivel,
    tamano: tam,
    riesgo: campo(seccion, 'Riesgo'),
    prereqs: ids(campo(seccion, 'Prerrequisitos'), /\[(B-\d+)\]/g),
    modelo: campo(seccion, 'Modelo sugerido'),
    esfuerzo: campo(seccion, 'Esfuerzo'),
    ultracode: campo(seccion, 'Ultracode'),
    criterio: campo(seccion, 'Criterio de aceptación'),
    worktree: campo(seccion, 'Worktree'),
    estado: campo(seccion, 'Estado') || 'abierta',
  }
  if (!['S', 'M', 'L'].includes(t.tamano)) errores.push(`${t.id}: Tamaño «${t.tamano}» (S, M o L)`)
  if (!['S', 'M', 'L'].includes(t.nivel_proceso)) errores.push(`${t.id}: Nivel de proceso «${t.nivel_proceso}» (S, M o L)`)
  if (!t.nodos.length) errores.push(`${t.id}: sin Nodo(s)`)
  tarjetas.push(t)
}
const vistos = new Set()
for (const t of tarjetas) { if (vistos.has(t.id)) errores.push(`${t.id} duplicada`); vistos.add(t.id) }
for (const t of tarjetas) for (const p of t.prereqs) if (!vistos.has(p)) errores.push(`${t.id}: prerrequisito ${p} no existe`)
if (errores.length) { for (const e of errores) console.error('error', e); process.exit(1) }

const peso = { S: 1, M: 3, L: 8 }
const abiertas = tarjetas.filter((t) => !['hecha', 'descartada'].includes(t.estado))
const resumen = {
  por_bloque: tarjetas.reduce((a, t) => { a[t.bloque] = (a[t.bloque] ?? 0) + 1; return a }, {}),
  por_estado: tarjetas.reduce((a, t) => { a[t.estado] = (a[t.estado] ?? 0) + 1; return a }, {}),
  trabajo_abierto: abiertas.reduce((s, t) => s + (peso[t.tamano] ?? 0), 0),
}
writeFileSync(path.join(ATLAS, 'backlog.json'), JSON.stringify({ schemaVersion: 1, fuente: path.relative(ATLAS, MD).split(path.sep).join('/'), resumen, tarjetas }, null, 1) + '\n', 'utf8')
console.log(`backlog.json: ${tarjetas.length} tarjetas ${JSON.stringify(resumen.por_bloque)} · estados ${JSON.stringify(resumen.por_estado)} · trabajo abierto ${resumen.trabajo_abierto} (S=1, M=3, L=8)`)
