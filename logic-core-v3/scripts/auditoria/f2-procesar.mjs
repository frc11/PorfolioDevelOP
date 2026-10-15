#!/usr/bin/env node
// Auditoría de renovación 2026-10 — procesa la salida de un workflow de F2 (DEC-21, DEC-37).
//
// 1. Guarda el crudo de cada lote en _crudo/ciclos/<ciclo>-<lote>.json (la cola de DEC-21:
//    un .json de ciclos/ sin línea en el log del plan es trabajo pendiente).
// 2. Arma _crudo/ciclos/<ciclo>-revision.json: cada hallazgo del lector con su clave
//    temporal, el veredicto del verificador y la decisión inicial que le toca por DEC-37:
//      «leer»           CRÍTICA/ALTA que sobrevivió al verificador: el padre lee las líneas
//      «leer-refutada»  CRÍTICA/ALTA que el verificador refutó: el padre lee líneas y
//                       motivo antes de descartarla (DEC-31)
//      «muestrear»      1 de cada 5 MEDIA/BAJA por lote (mínimo 1): el padre la lee
//      «aceptar»        el resto de MEDIA/BAJA, que entra como PROBABLE; y, desde D3 (DEC-55), el
//                       hallazgo único «Higiene de UI — Dx» que junta los higiene_ui de todos los lotes
//    El padre deja cada una en «aceptar» (con verificado_padre: true si leyó las líneas)
//    o «descartar» (con nota_padre = motivo), ajusta campos si hace falta y corre
//    f2-escribir.mjs. Si la revisión ya existe, NO se pisa (usar --forzar).
// 3. Imprime un resumen.
//
// Uso (desde logic-core-v3):
//   node scripts/auditoria/f2-procesar.mjs <salida-del-workflow (.output o .json)> [--run <runId>] [--forzar]

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { escribirSegunPeso, existePartido } from './crudo-partes.mjs'

const args = process.argv.slice(2)
const ENTRADA = args[0]
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null)
const RUN = opt('--run')
const FORZAR = args.includes('--forzar')
const CICLOS = path.resolve(process.cwd(), 'docs/auditoria-2026-10/_crudo/ciclos')
mkdirSync(CICLOS, { recursive: true })

const crudo = JSON.parse(readFileSync(ENTRADA, 'utf8').replace(/^﻿/, ''))
const res = typeof crudo.result === 'string' ? JSON.parse(crudo.result) : (crudo.result ?? crudo)
if (!res?.resultados) { console.error('la entrada no tiene «resultados»: ¿es la salida de un workflow de F2?'); process.exit(1) }
const { dominio, ciclo } = res
const fecha = new Date().toISOString()

const SEV = { 'CRÍTICA': 0, ALTA: 1, MEDIA: 2, BAJA: 3 }
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()
// cazadores (ciclos 2+): su salida trae cobertura_lente y no marca el ledger
const modo = res.resultados.some((r) => r.lectura?.cobertura_lente) ? 'cazador' : 'lector'
const revision = { dominio, ciclo, modo, run: RUN, fecha, lotes: [], hallazgos: [] }

for (const r of res.resultados) {
  const archivo = path.join(CICLOS, `${ciclo}-${r.lote}.json`)
  writeFileSync(archivo, JSON.stringify({ dominio, ciclo, lote: r.lote, run: RUN, fecha, lectura: r.lectura, verificacion: r.verificacion }, null, 1), 'utf8')
  const L = r.lectura
  if (!L) { revision.lotes.push({ lote: r.lote, estado: 'sin-lectura' }); continue }
  const veredictos = r.verificacion?.veredictos ?? []
  const hs = (L.hallazgos ?? []).map((h, i) => ({ ...h, tmp: `${ciclo}/${r.lote}/H${String(i + 1).padStart(2, '0')}`, lote: r.lote }))
  // muestreo determinista de MEDIA/BAJA: 1 de cada 5, mínimo 1 (cada quinto empezando por el primero)
  const menores = hs.filter((h) => SEV[h.severidad] >= 2)
  const muestra = new Set(menores.filter((_, i) => i % 5 === 0).map((h) => h.tmp))
  for (const h of hs) {
    const v = veredictos.find((x) => norm(x.titulo) === norm(h.titulo)) ?? null
    let decision
    if (SEV[h.severidad] <= 1) decision = v && (!v.se_sostiene || v.severidad_ajustada === 'DESCARTAR') ? 'leer-refutada' : 'leer'
    else decision = muestra.has(h.tmp) ? 'muestrear' : 'aceptar'
    revision.hallazgos.push({ decision, nota_padre: '', ...h, verificador: v, ...(SEV[h.severidad] <= 1 && !v && r.verificacion ? { aviso: 'el verificador no devolvió veredicto con este título' } : {}) })
  }
  const completos = (L.archivos_leidos ?? []).filter((a) => a.leido_completo).length
  revision.lotes.push({
    lote: r.lote,
    estado: 'leido',
    archivos_leidos: (L.archivos_leidos ?? []).length,
    completos,
    entradas: (L.entradas ?? []).length,
    funcionalidades: (L.funcionalidades ?? []).length,
    planeado_cruzado: (L.planeado_cruzado ?? []).length,
    alertas: (L.alertas_verificadas ?? []).length,
    previas: (L.previas_reverificadas ?? []).length,
    poda: (L.candidatos_poda ?? []).length,
    casos: (L.casos_prueba_manual ?? []).length,
    ausencias: (L.ausencias ?? []).length,
    patrones: (L.patrones_a_cruzar ?? []).length,
    verificador: r.verificacion ? `${veredictos.length} veredictos` : 'no corrió',
  })
}

// DEC-55 (desde D3): los BAJA cosméticos que los lectores dejaron en higiene_ui van en un único hallazgo
// «Higiene de UI — Dx» por dominio, con la lista de ruta:línea y sin verificación individual (no entra al muestreo)
const higiene = res.resultados.flatMap((r) => (r.lectura?.higiene_ui ?? []).map((x) => ({ ...x, lote: r.lote })))
if (higiene.length) {
  const porTipo = {}
  for (const x of higiene) porTipo[x.tipo] = (porTipo[x.tipo] ?? 0) + 1
  const enUi = higiene.filter((x) => /(^|\/)src\/components\/ui\//.test(String(x.ruta).replace(/\\/g, '/'))).length
  revision.hallazgos.push({
    decision: 'aceptar', nota_padre: 'DEC-55: higiene de UI agrupada, sin verificación individual', tmp: `${ciclo}/HIGIENE`, lote: 'todos',
    titulo: `Higiene de UI — ${dominio}: ${higiene.length} detalles cosméticos (${Object.entries(porTipo).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')})`,
    prefijo: 'DEU', severidad: 'BAJA', tipo: 'deuda', confianza: 'PROBABLE',
    evidencia: higiene.map((x) => ({ ruta: x.ruta, linea: x.linea, fragmento: `[${x.tipo}] ${String(x.detalle).slice(0, 160)}` })),
    impacto: 'Bloqueante para el primer cliente real solo en lo visual: textos sin tildes o con jerga, íconos con trazo distinto, contraste bajo y estilos inline que no siguen los tokens. Ninguno cambia datos ni permisos.',
    propuesta: `Una pasada de higiene por dominio, de a un archivo, con la lista de abajo como checklist.${enUi ? ` ${enUi} entradas están en src/components/ui/* (FROZEN): esas quedan como decisión para Valentino.` : ''}`,
    esfuerzo: higiene.length > 40 ? 'M' : 'S', zona: dominio === 'D4' ? 'ZONA-FRANCO' : 'libre', nodos: [], requiere_verificacion_humana: false, higiene: true, verificador: null,
  })
}

// la revisión va en _crudo/ciclos/<ciclo>-revision.json, o partida en <ciclo>-revision/parte-N.json si pasa el tope (DEC-49)
const salida = `${ciclo}-revision`
if (existePartido(CICLOS, salida) && !FORZAR) console.log(`(la revisión ${salida} ya existe: no se pisa; usar --forzar)`)
else escribirSegunPeso(CICLOS, salida, revision, 'hallazgos')

console.log(`${dominio} ${ciclo} · run ${RUN ?? '—'}`)
for (const l of revision.lotes) console.log(`  ${l.lote}: ${l.estado === 'leido' ? `${l.completos}/${l.archivos_leidos} completos · entradas ${l.entradas} · funcionalidades ${l.funcionalidades} · PLAN ${l.planeado_cruzado} · alertas ${l.alertas} · previas ${l.previas} · poda ${l.poda} · casos ${l.casos} · ausencias ${l.ausencias} · patrones ${l.patrones} · verificador ${l.verificador}` : l.estado}`)
const cuenta = (f) => revision.hallazgos.filter(f).length
console.log(`  hallazgos ${revision.hallazgos.length}: CRÍTICA ${cuenta((h) => h.severidad === 'CRÍTICA')} · ALTA ${cuenta((h) => h.severidad === 'ALTA')} · MEDIA ${cuenta((h) => h.severidad === 'MEDIA')} · BAJA ${cuenta((h) => h.severidad === 'BAJA')}`)
console.log(`  decisiones: leer ${cuenta((h) => h.decision === 'leer')} · leer-refutada ${cuenta((h) => h.decision === 'leer-refutada')} · muestrear ${cuenta((h) => h.decision === 'muestrear')} · aceptar ${cuenta((h) => h.decision === 'aceptar')}`)
for (const h of revision.hallazgos.slice().sort((a, b) => SEV[a.severidad] - SEV[b.severidad])) {
  console.log(`  [${h.decision}] ${h.tmp} ${h.prefijo} ${h.severidad} ${h.confianza} — ${h.titulo}${h.verificador ? ` · verif: ${h.verificador.se_sostiene ? 'sostiene' : 'refuta'} → ${h.verificador.severidad_ajustada}` : ''}`)
}
