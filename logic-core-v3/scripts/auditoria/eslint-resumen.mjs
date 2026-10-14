#!/usr/bin/env node
// Auditoría de renovación 2026-10 — resumen del baseline de eslint SIN código fuente.
//
// El formateador JSON de ESLint copia en `source` el texto completo de cada archivo
// con problemas (y `output` si hubo fixes): eso podría llevar un literal sensible a
// docs/. Este script lee el JSON crudo, descarta `source` y `output`, escribe un JSON
// reducido (archivo, regla, severidad, línea, columna, mensaje) y un resumen en
// Markdown por regla y por carpeta, y borra el crudo.
//
// Uso (desde logic-core-v3):
//   node scripts/auditoria/eslint-resumen.mjs
//   node scripts/auditoria/eslint-resumen.mjs --raw <crudo.json> --out <reducido.json> --md <resumen.md> --conservar-raw

import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const appRoot = process.cwd()
const RAW = path.resolve(appRoot, opt('--raw', 'docs/auditoria-2026-10/_crudo/eslint.raw.json'))
const OUT = path.resolve(appRoot, opt('--out', 'docs/auditoria-2026-10/_crudo/eslint.json'))
const MD = path.resolve(appRoot, opt('--md', 'docs/auditoria-2026-10/_crudo/eslint-resumen.md'))

if (!existsSync(RAW)) { console.error(`no existe ${RAW}`); process.exit(1) }
const texto = readFileSync(RAW, 'utf8').replace(/^﻿/, '')
const resultados = JSON.parse(texto)

const mensajes = []
for (const r of resultados) {
  const archivo = path.relative(appRoot, r.filePath).split(path.sep).join('/')
  for (const m of r.messages ?? []) {
    mensajes.push({
      archivo,
      regla: m.ruleId ?? '(parse)',
      severidad: m.severity === 2 ? 'error' : 'warning',
      linea: m.line ?? null,
      columna: m.column ?? null,
      mensaje: (m.message ?? '').slice(0, 300),
    })
  }
}

const totales = { archivos_lintados: resultados.length, archivos_con_problemas: resultados.filter((r) => (r.messages ?? []).length).length, errores: 0, warnings: 0 }
const porRegla = new Map()
const porCarpeta = new Map()
for (const m of mensajes) {
  if (m.severidad === 'error') totales.errores++
  else totales.warnings++
  const k = `${m.regla}|${m.severidad}`
  porRegla.set(k, (porRegla.get(k) ?? 0) + 1)
  const carpeta = m.archivo.split('/').slice(0, 3).join('/')
  const c = porCarpeta.get(carpeta) ?? { errores: 0, warnings: 0 }
  m.severidad === 'error' ? c.errores++ : c.warnings++
  porCarpeta.set(carpeta, c)
}

writeFileSync(OUT, JSON.stringify({ nota: 'Sin source ni output: solo ubicación, regla y mensaje.', totales, mensajes }, null, 1) + '\n', 'utf8')

const lineas = [
  '# Baseline de eslint — resumen',
  '',
  `Archivos lintados: ${totales.archivos_lintados} · con problemas: ${totales.archivos_con_problemas} · **errores: ${totales.errores}** · warnings: ${totales.warnings}`,
  '',
  '## Por regla',
  '',
  '| Regla | Severidad | Cantidad |',
  '|---|---|---|',
  ...[...porRegla].sort((a, b) => b[1] - a[1]).map(([k, n]) => { const [regla, sev] = k.split('|'); return `| \`${regla}\` | ${sev} | ${n} |` }),
  '',
  '## Por carpeta (3 niveles)',
  '',
  '| Carpeta | Errores | Warnings |',
  '|---|---|---|',
  ...[...porCarpeta].sort((a, b) => b[1].errores - a[1].errores || b[1].warnings - a[1].warnings).map(([c, v]) => `| \`${c}\` | ${v.errores} | ${v.warnings} |`),
  '',
]
writeFileSync(MD, lineas.join('\n'), 'utf8')
if (!args.includes('--conservar-raw')) unlinkSync(RAW)
console.log(`archivos=${totales.archivos_lintados} con-problemas=${totales.archivos_con_problemas} errores=${totales.errores} warnings=${totales.warnings}`)
console.log(`escrito: ${path.relative(appRoot, OUT)}, ${path.relative(appRoot, MD)}${args.includes('--conservar-raw') ? '' : ' (crudo borrado)'}`)
