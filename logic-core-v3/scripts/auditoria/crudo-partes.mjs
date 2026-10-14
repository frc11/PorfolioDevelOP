// Auditoría de renovación 2026-10 — JSON de _crudo/ partidos en piezas de menos de 300 KB.
//
// PROMPT §5: lo crudo se commitea solo si cada archivo pesa menos de 300 KB. Los datos que la
// corrida necesita para regenerar entregables (p. ej. lo planeado extraído en F1.12) se guardan
// partidos: _crudo/<nombre>/parte-1.json, parte-2.json… Cada parte lleva los metadatos del objeto
// (todo menos `items`) y un tramo de `items`. Leer junta las partes en orden; si no hay carpeta,
// lee el archivo único _crudo/<nombre>.json (compatibilidad).

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export const TOPE_BYTES = 290_000

export function leerPartido(dirCrudo, nombre, porDefecto) {
  const carpeta = path.join(dirCrudo, nombre)
  if (existsSync(carpeta)) {
    const partes = readdirSync(carpeta).filter((f) => /^parte-\d+\.json$/.test(f)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
    if (!partes.length) return porDefecto
    const objetos = partes.map((f) => JSON.parse(readFileSync(path.join(carpeta, f), 'utf8').replace(/^﻿/, '')))
    const { items: _i, parte: _p, partes: _ps, ...meta } = objetos[0]
    return { ...meta, items: objetos.flatMap((o) => o.items ?? []) }
  }
  const unico = path.join(dirCrudo, `${nombre}.json`)
  return existsSync(unico) ? JSON.parse(readFileSync(unico, 'utf8').replace(/^﻿/, '')) : porDefecto
}

export function escribirPartido(dirCrudo, nombre, objeto, tope = TOPE_BYTES) {
  const { items = [], ...meta } = objeto
  const tramos = []
  let actual = []
  const peso = (its) => Buffer.byteLength(JSON.stringify({ ...meta, parte: 0, partes: 0, items: its }, null, 1), 'utf8')
  for (const it of items) {
    if (actual.length && peso([...actual, it]) > tope) { tramos.push(actual); actual = [] }
    actual.push(it)
  }
  if (actual.length || !tramos.length) tramos.push(actual)
  const carpeta = path.join(dirCrudo, nombre)
  mkdirSync(carpeta, { recursive: true })
  for (const f of readdirSync(carpeta)) if (/^parte-\d+\.json$/.test(f)) rmSync(path.join(carpeta, f))
  tramos.forEach((its, i) => writeFileSync(path.join(carpeta, `parte-${i + 1}.json`), JSON.stringify({ ...meta, parte: i + 1, partes: tramos.length, items: its }, null, 1), 'utf8'))
  return tramos.length
}
