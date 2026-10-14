// Auditoría de renovación 2026-10 — JSON de _crudo/ partidos en piezas de menos de 300 KB.
//
// PROMPT §5: lo crudo se commitea solo si cada archivo pesa menos de 300 KB. Los datos que la
// corrida necesita para regenerar entregables (lo planeado extraído en F1.12, el registro de
// hallazgos, las revisiones de cada ciclo) se guardan partidos: _crudo/<nombre>/parte-1.json,
// parte-2.json… Cada parte lleva los metadatos del objeto (todo menos el arreglo que se parte, por
// defecto `items`) y un tramo de ese arreglo. Leer junta las partes en orden; si no hay carpeta,
// lee el archivo único _crudo/<nombre>.json (compatibilidad). Escribir partido borra el archivo
// único, si quedó de antes: la carpeta manda.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export const TOPE_BYTES = 290_000

export function leerPartido(dirCrudo, nombre, porDefecto, campo = 'items') {
  const carpeta = path.join(dirCrudo, nombre)
  if (existsSync(carpeta)) {
    const partes = readdirSync(carpeta).filter((f) => /^parte-\d+\.json$/.test(f)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
    if (!partes.length) return porDefecto
    const objetos = partes.map((f) => JSON.parse(readFileSync(path.join(carpeta, f), 'utf8').replace(/^﻿/, '')))
    const { [campo]: _i, parte: _p, partes: _ps, ...meta } = objetos[0]
    return { ...meta, [campo]: objetos.flatMap((o) => o[campo] ?? []) }
  }
  const unico = path.join(dirCrudo, `${nombre}.json`)
  return existsSync(unico) ? JSON.parse(readFileSync(unico, 'utf8').replace(/^﻿/, '')) : porDefecto
}

export function existePartido(dirCrudo, nombre) {
  return existsSync(path.join(dirCrudo, nombre)) || existsSync(path.join(dirCrudo, `${nombre}.json`))
}

export function escribirPartido(dirCrudo, nombre, objeto, tope = TOPE_BYTES, campo = 'items') {
  const { [campo]: items = [], ...meta } = objeto
  const tramos = []
  let actual = []
  const peso = (its) => Buffer.byteLength(JSON.stringify({ ...meta, parte: 0, partes: 0, [campo]: its }, null, 1), 'utf8')
  for (const it of items) {
    if (actual.length && peso([...actual, it]) > tope) { tramos.push(actual); actual = [] }
    actual.push(it)
  }
  if (actual.length || !tramos.length) tramos.push(actual)
  const carpeta = path.join(dirCrudo, nombre)
  mkdirSync(carpeta, { recursive: true })
  for (const f of readdirSync(carpeta)) if (/^parte-\d+\.json$/.test(f)) rmSync(path.join(carpeta, f))
  tramos.forEach((its, i) => writeFileSync(path.join(carpeta, `parte-${i + 1}.json`), JSON.stringify({ ...meta, parte: i + 1, partes: tramos.length, [campo]: its }, null, 1), 'utf8'))
  rmSync(path.join(dirCrudo, `${nombre}.json`), { force: true })
  return tramos.length
}

// Archivo único mientras entre en el tope; partido cuando no (los acumulados crecen con cada ciclo).
// Borra la otra forma para que nunca convivan dos versiones.
export function escribirSegunPeso(dirCrudo, nombre, objeto, campo = 'items', tope = TOPE_BYTES) {
  const texto = JSON.stringify(objeto, null, 1)
  if (Buffer.byteLength(texto, 'utf8') > tope) return escribirPartido(dirCrudo, nombre, objeto, tope, campo)
  rmSync(path.join(dirCrudo, nombre), { recursive: true, force: true })
  writeFileSync(path.join(dirCrudo, `${nombre}.json`), texto, 'utf8')
  return 1
}

// Un mapa { clave: valor } (p. ej. planeado-cruces) se guarda tal cual mientras entre en el tope;
// partido, como items { clave, valor }. Leer devuelve siempre el mapa.
export function leerMapa(dirCrudo, nombre, porDefecto = {}) {
  if (existsSync(path.join(dirCrudo, nombre))) return Object.fromEntries(leerPartido(dirCrudo, nombre, { items: [] }).items.map((x) => [x.clave, x.valor]))
  return leerPartido(dirCrudo, nombre, porDefecto)
}

export function escribirMapa(dirCrudo, nombre, mapa, tope = TOPE_BYTES) {
  const texto = JSON.stringify(mapa, null, 1)
  if (Buffer.byteLength(texto, 'utf8') > tope) return escribirPartido(dirCrudo, nombre, { items: Object.entries(mapa).map(([clave, valor]) => ({ clave, valor })) }, tope)
  rmSync(path.join(dirCrudo, nombre), { recursive: true, force: true })
  writeFileSync(path.join(dirCrudo, `${nombre}.json`), texto, 'utf8')
  return 1
}
