#!/usr/bin/env node
// Auditoría de renovación 2026-10 — aplica las decisiones del padre a la revisión de un ciclo de F2.
//
// Entrada: _crudo/ciclos/<ciclo>-decisiones.json, que queda commiteado como registro de la
// verificación del padre (DEC-37, DEC-31). Forma:
//   {
//     "H01": { "decision": "aceptar" | "descartar" | "fusionar", "verificado_padre": true, "nota_padre": "qué se leyó",
//              "con": "H05" | "SEC-014",   // solo con fusionar: hallazgo del ciclo o ya registrado que se queda
//              ...campos a pisar del hallazgo (severidad, confianza, titulo, impacto, propuesta, zona,
//                 seccion, nodos, relacionados_ids, previas, requiere_verificacion_humana, coordinacion,
//                 prefijo, tipo, dominio, evidencia),
//              "confianza_padre": "PROBABLE",   // leído por el padre pero con un eslabón de runtime (DEC-23)
//              "relacionados_tmp": ["D2-L1/H19"], // relación con otro hallazgo del ciclo (se resuelve a ID al escribir)
//              "destino": { "severidad": "ALTA", … },  // con fusionar contra un ID registrado: corrige ese hallazgo
//              "caso_indice": 2            // caso de prueba del lote (índice en casos_prueba_manual)
//              "caso_indices": [3, 10],    // o varios, que se funden en uno (pasos concatenados)
//              "caso_titulo": "…" },       // título del caso fundido (opcional)
//     ...
//   }
// La clave es el sufijo de la clave temporal («H01») o la clave completa («D1-c3/D1-T1/H01»).
// Un sufijo que se repite en varios lotes del ciclo corta con error: ahí va la clave completa.
// Después se corre f2-escribir.mjs, que exige que no quede ninguna «leer», «leer-refutada» ni «muestrear».
//
// Uso (desde logic-core-v3): node scripts/auditoria/f2-decidir.mjs <ciclo>

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { escribirSegunPeso, existePartido, leerPartido } from './crudo-partes.mjs'

const CICLO = process.argv[2]
if (!CICLO) { console.error('uso: f2-decidir.mjs <ciclo>'); process.exit(1) }
const CICLOS = path.resolve(process.cwd(), 'docs/auditoria-2026-10/_crudo/ciclos')
const REV = `${CICLO}-revision` // partida en _crudo/ciclos/<ciclo>-revision/ (DEC-49) o archivo único
const DEC = path.join(CICLOS, `${CICLO}-decisiones.json`)
if (!existePartido(CICLOS, REV)) { console.error(`falta ${REV}`); process.exit(1) }
if (!existsSync(DEC)) { console.error(`falta ${path.basename(DEC)}`); process.exit(1) }
const rev = leerPartido(CICLOS, REV, null, 'hallazgos')
const decisiones = JSON.parse(readFileSync(DEC, 'utf8').replace(/^﻿/, ''))
const casosDe = new Map()
const casos = (lote) => {
  if (!casosDe.has(lote)) {
    const f = path.join(CICLOS, `${CICLO}-${lote}.json`)
    casosDe.set(lote, existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')).lectura?.casos_prueba_manual ?? [] : [])
  }
  return casosDe.get(lote)
}
const ESPECIALES = new Set(['caso_indice', 'caso_indices', 'caso_titulo'])
let aplicadas = 0
for (const [clave, d] of Object.entries(decisiones)) {
  const candidatos = rev.hallazgos.filter((h) => h.tmp === clave || h.tmp.endsWith(`/${clave}`))
  if (candidatos.length !== 1) { console.error(`${clave}: ${candidatos.length ? 'ambigua (usar la clave completa)' : 'no existe en la revisión'}`); process.exit(1) }
  const h = candidatos[0]
  if (!['aceptar', 'descartar', 'fusionar'].includes(d.decision)) { console.error(`${clave}: decision inválida «${d.decision}»`); process.exit(1) }
  if (d.decision === 'descartar' && !d.nota_padre) { console.error(`${clave}: descartar exige nota_padre con el motivo (DEC-31)`); process.exit(1) }
  // fusionar: misma causa raíz que otro hallazgo del ciclo (clave temporal) o ya registrado (ID): se suma su evidencia, sin ID nuevo
  if (d.decision === 'fusionar') {
    if (!d.con) { console.error(`${clave}: fusionar exige «con» (clave temporal del ciclo o ID registrado)`); process.exit(1) }
    if (!/^[A-Z0-9]+-\d+$/.test(d.con)) {
      const destino = rev.hallazgos.filter((x) => x.tmp === d.con || x.tmp.endsWith(`/${d.con}`))
      if (destino.length !== 1) { console.error(`${clave}: destino de fusión «${d.con}» ${destino.length ? 'ambiguo' : 'inexistente'}`); process.exit(1) }
      d.con = destino[0].tmp
    }
  }
  for (const [k, v] of Object.entries(d)) if (!ESPECIALES.has(k)) h[k] = v
  const indices = d.caso_indices ?? (d.caso_indice !== undefined ? [d.caso_indice] : null)
  if (indices) {
    const cs = indices.map((i) => casos(h.lote)[i])
    if (cs.some((c) => !c)) { console.error(`${clave}: caso de prueba inexistente (${indices.join(', ')})`); process.exit(1) }
    h.caso = cs.length === 1 ? cs[0] : { ...cs[0], titulo: d.caso_titulo ?? cs.map((c) => c.titulo).join(' + '), pasos: cs.flatMap((c, i) => c.pasos.map((p) => (i ? `(${c.titulo}) ${p}` : p))), escribe_db_o_email: cs.some((c) => c.escribe_db_o_email) }
  }
  aplicadas++
}
escribirSegunPeso(CICLOS, REV, rev, 'hallazgos')
const pend = rev.hallazgos.filter((h) => ['leer', 'leer-refutada', 'muestrear'].includes(h.decision))
const cuenta = (x) => rev.hallazgos.filter((h) => h.decision === x).length
console.log(`${CICLO}: ${aplicadas} decisiones aplicadas · aceptar ${cuenta('aceptar')} · fusionar ${cuenta('fusionar')} · descartar ${cuenta('descartar')} · pendientes ${pend.length}${pend.length ? ` → ${pend.map((h) => h.tmp).join(', ')}` : ''}`)
