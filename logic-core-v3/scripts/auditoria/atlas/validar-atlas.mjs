#!/usr/bin/env node
// Atlas — valida los JSON de 06-ATLAS/ contra atlas.schema.json (ENMIENDA-01 E7, regla 1) y que toda arista apunte a
// nodos existentes. Validador propio y mínimo (type, enum, required, properties, additionalProperties, items, pattern,
// $ref locales): sin dependencias, para que el Atlas se pueda mudar de repo sin instalar nada.
// Uso: node scripts/auditoria/atlas/validar-atlas.mjs [--atlas <carpeta 06-ATLAS>]

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const ATLAS = path.resolve(args.includes('--atlas') ? args[args.indexOf('--atlas') + 1] : path.join(process.cwd(), 'docs/auditoria-2026-10/06-ATLAS'))
const schema = JSON.parse(readFileSync(path.join(ATLAS, 'atlas.schema.json'), 'utf8'))
const defs = schema.definitions
const tipoDe = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v)
const errores = []
const validar = (v, s, donde) => {
  if (errores.length > 50) return
  if (s.$ref) return validar(v, defs[s.$ref.split('/').pop()], donde)
  if (s.type) { const ts = [].concat(s.type); const t = tipoDe(v); if (!ts.includes(t) && !(t === 'integer' && ts.includes('number'))) { errores.push(`${donde}: tipo ${t}, se esperaba ${ts.join('|')}`); return } }
  if (s.enum && !s.enum.includes(v)) errores.push(`${donde}: «${v}» fuera de ${JSON.stringify(s.enum)}`)
  if (s.pattern && typeof v === 'string' && !new RegExp(s.pattern).test(v)) errores.push(`${donde}: «${v}» no cumple ${s.pattern}`)
  if (tipoDe(v) === 'object') {
    for (const k of s.required ?? []) if (!(k in v)) errores.push(`${donde}: falta «${k}»`)
    for (const [k, sub] of Object.entries(s.properties ?? {})) if (k in v) validar(v[k], sub, `${donde}.${k}`)
    if (s.additionalProperties && typeof s.additionalProperties === 'object') for (const [k, x] of Object.entries(v)) if (!(k in (s.properties ?? {}))) validar(x, s.additionalProperties, `${donde}.${k}`)
  }
  if (tipoDe(v) === 'array' && s.items) v.forEach((x, i) => validar(x, s.items, `${donde}[${i}]`))
}
const ARCHIVOS = { 'atlas.json': 'atlas', 'atlas.curado.json': 'curado', 'funcionalidades.json': 'funcionalidades', 'zonas.json': 'zonas', 'entradas.json': 'entradas', 'hallazgos.json': 'hallazgos', 'backlog.json': 'backlog', 'alias.json': 'alias' }
let vistos = 0
for (const [f, d] of Object.entries(ARCHIVOS)) {
  if (!existsSync(path.join(ATLAS, f))) continue
  vistos++
  validar(JSON.parse(readFileSync(path.join(ATLAS, f), 'utf8')), defs[d], f)
}
// integridad referencial del grafo
const atlas = JSON.parse(readFileSync(path.join(ATLAS, 'atlas.json'), 'utf8'))
const ids = new Set(atlas.nodos.map((n) => n.id))
const huerfanas = atlas.aristas.filter((a) => !ids.has(a.de) || !ids.has(a.a))
for (const a of huerfanas.slice(0, 20)) errores.push(`arista ${a.tipo} ${a.de} → ${a.a}: nodo inexistente`)
const curado = existsSync(path.join(ATLAS, 'atlas.curado.json')) ? JSON.parse(readFileSync(path.join(ATLAS, 'atlas.curado.json'), 'utf8')).nodos : {}
const sinNodo = Object.keys(curado).filter((k) => !ids.has(k))
for (const k of sinNodo.slice(0, 20)) errores.push(`atlas.curado.json: «${k}» no es un nodo de atlas.json`)
// el alias curado apunta a nodos reales, y todo hallazgo de hallazgos.json tiene al menos un nodo (E7, regla 1)
const alias = existsSync(path.join(ATLAS, 'alias.json')) ? JSON.parse(readFileSync(path.join(ATLAS, 'alias.json'), 'utf8')).alias : {}
for (const [k, d] of Object.entries(alias)) if (!ids.has(d)) errores.push(`alias.json: «${k}» apunta a «${d}», que no es un nodo`)
const hall = existsSync(path.join(ATLAS, 'hallazgos.json')) ? JSON.parse(readFileSync(path.join(ATLAS, 'hallazgos.json'), 'utf8')).hallazgos : []
for (const h of hall) { const malos = [].concat(h.nodo ?? []).filter((n) => !ids.has(n)); if (![].concat(h.nodo ?? []).length) errores.push(`hallazgos.json: ${h.id} sin ningún nodo del Atlas (sumar un alias)`); else if (malos.length) errores.push(`hallazgos.json: ${h.id} apunta a ${malos.join(', ')}, que no existe`) }
// cada tarjeta del backlog apunta a nodos que existen (E7, regla 1)
const tarjetas = existsSync(path.join(ATLAS, 'backlog.json')) ? JSON.parse(readFileSync(path.join(ATLAS, 'backlog.json'), 'utf8')).tarjetas : []
for (const t of tarjetas) {
  const malos = (t.nodos ?? []).filter((n) => !ids.has(n))
  if (!t.nodos?.length) errores.push(`backlog.json: ${t.id} sin nodos`)
  else if (malos.length === t.nodos.length) errores.push(`backlog.json: ${t.id} solo apunta a nodos inexistentes (${malos.slice(0, 3).join(', ')})`)
}
for (const e of errores.slice(0, 50)) console.log(`  ERROR ${e}`)
console.log(`validar-atlas: ${vistos} archivos · ${atlas.nodos.length} nodos · ${atlas.aristas.length} aristas · errores ${errores.length}`)
process.exit(errores.length ? 1 : 0)
