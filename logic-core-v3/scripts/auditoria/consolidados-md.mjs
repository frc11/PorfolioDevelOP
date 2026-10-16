#!/usr/bin/env node
// Auditoría de renovación 2026-10 — escribe 13-CLAUDE-MD-PROPUESTO.md (E8, DEC-41), 14-DOCS-CONSOLIDADOS/ (E11, DEC-44)
// y _crudo/poda-docs.json (la §docs de 10-PODA.md, que agrega poda-md.mjs) desde _crudo/f6b-resultado.json
// (un agente de CLAUDE.md y una síntesis) y _crudo/f6b-extraccion/ (los tres extractores de docs, partido por el tope de
// 300 KB). No aplica nada: todo es propuesta. Un solo uso.
// Uso (desde logic-core-v3): node scripts/auditoria/consolidados-md.mjs

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { leerPartido } from './crudo-partes.mjs'

const DIR = path.resolve(process.cwd(), 'docs/auditoria-2026-10')
const r = JSON.parse(readFileSync(path.join(DIR, '_crudo/f6b-resultado.json'), 'utf8'))
const { claude, sintesis } = r
const ext = leerPartido(path.join(DIR, '_crudo'), 'f6b-extraccion', { items: [] }).items
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const cerca = (s) => { let f = '````'; while (String(s).includes(f)) f += '`'; return f }
const bloque = (s, lang = 'markdown') => { const f = cerca(s); return `${f}${lang}\n${String(s).replace(/\s+$/, '')}\n${f}` }
const lineas = (s) => String(s ?? '').split('\n').length

// ── 13 ──
const clases = claude.auditoria.reduce((a, x) => { a[x.clase] = (a[x.clase] ?? 0) + 1; return a }, {})
const md13 = `# 13 — Propuesta de CLAUDE.md y del ciclo de actualización del mapa

> E8 de la ENMIENDA-01 y DEC-41. **No se aplica nada:** es una propuesta con evidencia para que la decidan Valentino y Franco. La redactó un agente de solo lectura (run \`wf_7cfe2151-e7b\`, \`_crudo/f6b-resultado.json\`) con las contradicciones de §10 del plan, los hallazgos de convenciones de F2, la política de \`11-CONGELADOS.md\` y \`06-ATLAS/regenerar.md\`.

## Resumen

${claude.resumen}

## 1. Auditoría del CLAUDE.md actual

${claude.auditoria.length} afirmaciones: ${Object.entries(clases).map(([k, v]) => `${k} ${v}`).join(' · ')}.

| Afirmación | Cita | Clase | Evidencia |
|---|---|---|---|
${claude.auditoria.map((x) => `| ${esc(x.afirmacion)} | ${esc(x.cita)} | ${x.clase} | ${esc(x.evidencia)} |`).join('\n')}

## 2. Borrador del CLAUDE.md raíz (${lineas(claude.borrador_md)} líneas; tope 200)

${bloque(claude.borrador_md)}

## 3. CLAUDE.md anidados por área

${claude.anidados.map((a) => `### \`${a.ruta}\`\n\n${bloque(a.contenido_md)}`).join('\n\n')}

## 4. De prosa a mecanismo

| Regla | Mecanismo | Detalle | Evidencia |
|---|---|---|---|
${claude.mecanismos.map((m) => `| ${esc(m.regla)} | ${esc(m.mecanismo)} | ${esc(m.detalle)} | ${esc(m.evidencia)} |`).join('\n')}

## 5. Ciclo de actualización del mapa

- **Definición de terminado (en CLAUDE.md):** ${claude.ciclo_mapa.definicion_de_terminado}
- **Skill de proyecto \`atlas-actualizar\`:** ${claude.ciclo_mapa.skill}
- **Hook \`Stop\`:** ${claude.ciclo_mapa.hook_stop}
- **Chequeo de CI (avisa, no rompe):** ${claude.ciclo_mapa.ci}

## 6. AGENTS.md, STATUS.md y DEPLOY.md

${claude.otros_docs.map((o) => `- **\`${o.doc}\`** — ${o.recomendacion}. ${o.razon}`).join('\n')}
`
writeFileSync(path.join(DIR, '13-CLAUDE-MD-PROPUESTO.md'), md13, 'utf8')

// ── 14 ──
const D14 = path.join(DIR, '14-DOCS-CONSOLIDADOS')
rmSync(D14, { recursive: true, force: true }); mkdirSync(D14, { recursive: true })
const nombreArchivo = (n) => (/\.md$/i.test(n) ? n : `${n}.md`).replace(/[\\/:*?"<>|]/g, '-')
for (const d of sintesis.documentos) writeFileSync(path.join(D14, nombreArchivo(d.nombre)), `> BORRADOR de la auditoría 2026-10 (E11, DEC-44). No reemplaza todavía a ningún doc: borrar y reemplazar es un sprint posterior (ver \`10-PODA.md\` §docs). Cada afirmación lleva su fuente.\n\n${d.contenido_md.replace(/\s+$/, '')}\n`, 'utf8')
const readme = `# 14 — Docs consolidados (borradores)

> E11 de la ENMIENDA-01 y DEC-44. Valentino pidió que todo lo conversado y craneado quede resumido en pocos documentos vivos y que el resto se borre. **En esta corrida solo se redacta: no se borró ni se editó ningún doc existente.** La lista de borrado está en \`10-PODA.md\` §docs. Armado por tres extractores y una síntesis de solo lectura (run \`wf_7cfe2151-e7b\`), sobre ${ext.reduce((s, x) => s + (x?.docs?.length ?? 0), 0)} docs de \`docs/\`, la raíz del repo y los insumos de Drive.

## Estructura propuesta (${sintesis.estructura.length} documentos vivos)

| Documento | Para qué | Reemplaza |
|---|---|---|
${sintesis.estructura.map((e) => `| [${e.nombre}](${nombreArchivo(e.nombre)}) | ${esc(e.proposito)} | ${esc(e.reemplaza)} |`).join('\n')}

## A decidir (contradicciones entre fuentes; no se resuelven acá)

${sintesis.a_decidir.map((a, i) => `${i + 1}. **${a.tema}**\n${a.posiciones.map((p) => `   - ${p.dice} (${p.fuente})`).join('\n')}`).join('\n')}
`
writeFileSync(path.join(D14, 'README.md'), readme, 'utf8')

// ── §docs de 10-PODA (lo agrega poda-md.mjs) ──
writeFileSync(path.join(DIR, '_crudo/poda-docs.json'), JSON.stringify({ nota: 'Lista de borrado de docs (E11): la redactó la síntesis de F6b; la aplica un sprint S posterior.', items: sintesis.poda_docs }, null, 1) + '\n', 'utf8')
const acc = sintesis.poda_docs.reduce((a, x) => { a[x.accion] = (a[x.accion] ?? 0) + 1; return a }, {})
console.log(`13: ${claude.auditoria.length} afirmaciones, borrador de ${lineas(claude.borrador_md)} líneas, ${claude.anidados.length} anidados, ${claude.mecanismos.length} mecanismos · 14: ${sintesis.documentos.length} docs, ${sintesis.a_decidir.length} a decidir · poda de docs ${JSON.stringify(acc)}`)
