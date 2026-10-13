#!/usr/bin/env node
// Auditoría de renovación 2026-10 — drift entre prisma/schema.prisma y las migraciones,
// SIN base de datos.
//
// 1. Parsea `prisma/schema.prisma` (modelos, campos, @map/@@map, @id/@@id,
//    @unique/@@unique, @@index, @relation con onDelete, enums con @map/@@map,
//    tipos nativos @db.*) y deriva los objetos que Prisma esperaría en Postgres.
// 2. Reproduce en orden las migraciones de `prisma/migrations/*/migration.sql`
//    (CREATE/ALTER/DROP de tablas, columnas, tipos enum, índices y FKs) y arma el
//    esquema que esas migraciones dejan aplicado. Lo que no reconoce (DML,
//    sentencias a mano) se lista con archivo:línea para leerlo a mano.
// 3. Compara las dos fotos: tablas, columnas (tipo, nulabilidad), enums,
//    índices (por tabla+columnas+unicidad) y FKs (columnas, destino, onDelete).
//
// Solo lectura. Escribe `docs/auditoria-2026-10/_crudo/drift.json` y un resumen.
// Uso (desde logic-core-v3): node scripts/auditoria/drift.mjs [--out <ruta>]

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const appRoot = process.cwd()
const OUT = path.resolve(appRoot, opt('--out', 'docs/auditoria-2026-10/_crudo/drift.json'))
const SCHEMA = path.resolve(appRoot, 'prisma/schema.prisma')
const MIGS = path.resolve(appRoot, 'prisma/migrations')

const sinComillas = (s) => s.replace(/^"|"$/g, '')
const normTipo = (t) => t.replace(/"/g, '').replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').trim().toUpperCase()

// ── 1. Schema ────────────────────────────────────────────────────────────────
const fuente = readFileSync(SCHEMA, 'utf8').replace(/\r\n/g, '\n')
const bloques = [...fuente.matchAll(/^(model|enum)\s+(\w+)\s*\{([\s\S]*?)^\}/gm)]
const enumsSchema = new Map() // nombre prisma → { db, valores: [db] }
const modelosSchema = new Map() // nombre prisma → { db, lineas }
for (const [, tipo, nombre, cuerpo] of bloques) {
  const lineas = cuerpo.split('\n').map((l) => l.replace(/\/\/.*$/, '').trim()).filter(Boolean)
  if (tipo === 'enum') {
    const map = lineas.find((l) => l.startsWith('@@map('))
    const valores = lineas.filter((l) => !l.startsWith('@@')).map((l) => {
      const m = l.match(/^(\w+)(?:\s+@map\("([^"]+)"\))?/)
      return m[2] ?? m[1]
    })
    enumsSchema.set(nombre, { db: map ? map.match(/@@map\("([^"]+)"\)/)[1] : nombre, valores })
  } else {
    const map = lineas.find((l) => l.startsWith('@@map('))
    modelosSchema.set(nombre, { db: map ? map.match(/@@map\("([^"]+)"\)/)[1] : nombre, lineas })
  }
}

const TIPO_DEFECTO = {
  String: 'TEXT', Boolean: 'BOOLEAN', Int: 'INTEGER', BigInt: 'BIGINT', Float: 'DOUBLE PRECISION',
  Decimal: 'DECIMAL(65,30)', DateTime: 'TIMESTAMP(3)', Json: 'JSONB', Bytes: 'BYTEA',
}
const NATIVO = {
  Text: () => 'TEXT', VarChar: (a) => `VARCHAR(${a})`, Char: (a) => `CHAR(${a})`, Uuid: () => 'UUID',
  Timestamptz: (a) => `TIMESTAMPTZ(${a ?? 6})`, Timestamp: (a) => `TIMESTAMP(${a ?? 6})`, Date: () => 'DATE',
  Time: (a) => `TIME(${a ?? 6})`, Integer: () => 'INTEGER', SmallInt: () => 'SMALLINT', BigInt: () => 'BIGINT',
  Real: () => 'REAL', DoublePrecision: () => 'DOUBLE PRECISION', Decimal: (a) => `DECIMAL(${a})`, JsonB: () => 'JSONB',
  Json: () => 'JSON', Boolean: () => 'BOOLEAN', Inet: () => 'INET', Citext: () => 'CITEXT', ByteA: () => 'BYTEA',
}

function listaCampos(s) { return s.split(',').map((x) => x.trim().replace(/\(.*\)$/, '').replace(/^"|"$/g, '')).filter(Boolean) }

const esperado = { tablas: new Map(), enums: new Map(), indices: [], fks: [] }
for (const [, e] of enumsSchema) esperado.enums.set(e.db, e.valores)
for (const [nombre, m] of modelosSchema) {
  const columnas = new Map()
  const campoAColumna = new Map()
  let pk = null
  for (const l of m.lineas) {
    if (l.startsWith('@@')) continue
    const f = l.match(/^(\w+)\s+([\w.]+(?:\([^)]*\))?)(\[\])?(\?)?\s*(.*)$/)
    if (!f) continue
    const [, campo, tipoBase, lista, opcional, attrs] = f
    if (attrs.includes('@ignore')) continue
    const esModelo = modelosSchema.has(tipoBase)
    if (esModelo) {
      const rel = attrs.match(/@relation\(([^)]*(?:\([^)]*\)[^)]*)*)\)/)
      if (rel && /fields:\s*\[/.test(rel[1])) {
        const campos = listaCampos(rel[1].match(/fields:\s*\[([^\]]*)\]/)[1])
        const refs = listaCampos(rel[1].match(/references:\s*\[([^\]]*)\]/)[1])
        const onDelete = rel[1].match(/onDelete:\s*(\w+)/)?.[1] ?? null
        const mapFk = rel[1].match(/map:\s*"([^"]+)"/)?.[1] ?? null
        esperado.fks.push({ modelo: nombre, tabla: m.db, campos, destinoModelo: tipoBase, refs, onDelete, opcional: Boolean(opcional), mapFk })
      }
      continue
    }
    const col = attrs.match(/@map\("([^"]+)"\)/)?.[1] ?? campo
    campoAColumna.set(campo, col)
    let tipo
    const nativo = attrs.match(/@db\.(\w+)(?:\(([^)]*)\))?/)
    if (enumsSchema.has(tipoBase)) tipo = enumsSchema.get(tipoBase).db
    else if (nativo && NATIVO[nativo[1]]) tipo = NATIVO[nativo[1]](nativo[2])
    else if (tipoBase.startsWith('Unsupported(')) tipo = tipoBase.match(/Unsupported\("([^"]+)"\)/)?.[1] ?? 'UNSUPPORTED'
    else tipo = TIPO_DEFECTO[tipoBase] ?? `?${tipoBase}`
    if (lista) tipo += '[]'
    // Prisma crea las listas escalares sin NOT NULL (`"tags" TEXT[]`), aunque el campo no sea opcional.
    columnas.set(col, { tipo: normTipo(tipo), notNull: !opcional && !lista, campo })
    if (attrs.includes('@id')) pk = [col]
    if (/@unique\b/.test(attrs)) esperado.indices.push({ tabla: m.db, columnas: [col], unico: true, origen: `${nombre}.${campo} @unique` })
  }
  for (const l of m.lineas.filter((x) => x.startsWith('@@'))) {
    const cols = (s) => listaCampos(s).map((c) => campoAColumna.get(c) ?? c)
    let mm
    if ((mm = l.match(/^@@id\(\[([^\]]*)\]/))) pk = cols(mm[1])
    else if ((mm = l.match(/^@@unique\(\[([^\]]*)\]/))) esperado.indices.push({ tabla: m.db, columnas: cols(mm[1]), unico: true, origen: `${nombre} ${l}` })
    else if ((mm = l.match(/^@@index\(\[([^\]]*)\]/))) esperado.indices.push({ tabla: m.db, columnas: cols(mm[1]), unico: false, origen: `${nombre} ${l}` })
  }
  for (const fk of esperado.fks.filter((x) => x.modelo === nombre)) fk.columnas = fk.campos.map((c) => campoAColumna.get(c) ?? c)
  esperado.tablas.set(m.db, { modelo: nombre, columnas, pk })
}
for (const fk of esperado.fks) {
  const destino = modelosSchema.get(fk.destinoModelo)
  fk.tablaDestino = destino.db
  // Default de Prisma: SetNull si la relación es opcional, Restrict si es requerida.
  fk.onDeleteEfectivo = (fk.onDelete ?? (fk.opcional ? 'SetNull' : 'Restrict')).toUpperCase().replace('SETNULL', 'SET NULL').replace('NOACTION', 'NO ACTION').replace('SETDEFAULT', 'SET DEFAULT')
}

// ── 2. Migraciones ───────────────────────────────────────────────────────────
const aplicado = { tablas: new Map(), enums: new Map(), indices: new Map(), fks: new Map() }
const noReconocidas = []
const dirs = readdirSync(MIGS).filter((d) => statSync(path.join(MIGS, d)).isDirectory()).sort()

function sentencias(sql) {
  const out = []
  let actual = ''
  let lineaInicio = 1
  let linea = 1
  let enDolar = false
  // Los comentarios de bloque se vacían conservando los saltos de línea (para que archivo:línea siga valiendo).
  const limpio = sql.replace(/\r\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
  for (const raw of limpio.split('\n')) {
    const l = enDolar ? raw : raw.replace(/--.*$/, '')
    if (!actual.trim()) lineaInicio = linea
    actual += l + '\n'
    if ((l.match(/\$\$/g) ?? []).length % 2 === 1) enDolar = !enDolar
    if (!enDolar && /;\s*$/.test(l)) { out.push({ texto: actual.trim(), linea: lineaInicio }); actual = '' }
    linea++
  }
  if (actual.trim()) out.push({ texto: actual.trim(), linea: lineaInicio })
  return out
}

function partirNivelCero(s) {
  const partes = []
  let prof = 0, actual = '', comillas = false
  for (const c of s) {
    if (c === "'" ) comillas = !comillas
    if (!comillas && c === '(') prof++
    if (!comillas && c === ')') prof--
    if (!comillas && prof === 0 && c === ',') { partes.push(actual.trim()); actual = '' } else actual += c
  }
  if (actual.trim()) partes.push(actual.trim())
  return partes
}

function columnaDeDefinicion(def) {
  const m = def.match(/^"([^"]+)"\s+(.+)$/s)
  if (!m) return null
  const resto = m[2]
  const tipo = resto.split(/\s+(NOT NULL|NULL|DEFAULT|PRIMARY KEY|UNIQUE|REFERENCES|CONSTRAINT|GENERATED)\b/i)[0]
  return { nombre: m[1], tipo: normTipo(tipo), notNull: /\bNOT NULL\b/i.test(resto) || /\bPRIMARY KEY\b/i.test(resto) }
}

for (const dir of dirs) {
  const archivo = path.join(MIGS, dir, 'migration.sql')
  let sql
  try { sql = readFileSync(archivo, 'utf8') } catch { continue }
  for (const { texto, linea } of sentencias(sql)) {
    const t = texto.replace(/;\s*$/, '').replace(/\s+/g, ' ').trim()
    const donde = `prisma/migrations/${dir}/migration.sql:${linea}`
    let m
    if ((m = t.match(/^CREATE TYPE "([^"]+)" AS ENUM \(([\s\S]*)\)$/i))) {
      aplicado.enums.set(m[1], m[2].split(',').map((v) => v.trim().replace(/^'|'$/g, '')))
    } else if ((m = t.match(/^ALTER TYPE "([^"]+)" ADD VALUE (?:IF NOT EXISTS )?'([^']+)'(?:\s+(BEFORE|AFTER)\s+'([^']+)')?$/i))) {
      const vals = aplicado.enums.get(m[1]) ?? []
      if (!vals.includes(m[2])) vals.push(m[2])
      aplicado.enums.set(m[1], vals)
    } else if ((m = t.match(/^ALTER TYPE "([^"]+)" RENAME TO "([^"]+)"$/i))) {
      aplicado.enums.set(m[2], aplicado.enums.get(m[1]) ?? []); aplicado.enums.delete(m[1])
    } else if ((m = t.match(/^ALTER TYPE "([^"]+)" RENAME VALUE '([^']+)' TO '([^']+)'$/i))) {
      aplicado.enums.set(m[1], (aplicado.enums.get(m[1]) ?? []).map((v) => (v === m[2] ? m[3] : v)))
    } else if ((m = t.match(/^DROP TYPE (?:IF EXISTS )?"([^"]+)"$/i))) {
      aplicado.enums.delete(m[1])
    } else if ((m = t.match(/^CREATE TABLE (?:IF NOT EXISTS )?"([^"]+)" \(([\s\S]*)\)$/i))) {
      const columnas = new Map()
      let pk = null
      for (const def of partirNivelCero(m[2])) {
        let c
        if ((c = def.match(/^CONSTRAINT "([^"]+)" PRIMARY KEY \(([^)]*)\)/i))) pk = c[2].split(',').map((x) => sinComillas(x.trim()))
        else if ((c = def.match(/^CONSTRAINT "([^"]+)" FOREIGN KEY \(([^)]*)\) REFERENCES "([^"]+)"\(([^)]*)\)(.*)$/i))) {
          aplicado.fks.set(c[1], { tabla: m[1], columnas: c[2].split(',').map((x) => sinComillas(x.trim())), destino: c[3], refs: c[4].split(',').map((x) => sinComillas(x.trim())), onDelete: (c[5].match(/ON DELETE (SET NULL|CASCADE|RESTRICT|NO ACTION|SET DEFAULT)/i)?.[1] ?? 'NO ACTION').toUpperCase(), donde })
        } else if (/^CONSTRAINT /i.test(def) || /^PRIMARY KEY/i.test(def)) {
          if ((c = def.match(/^PRIMARY KEY \(([^)]*)\)/i))) pk = c[1].split(',').map((x) => sinComillas(x.trim()))
        } else {
          const col = columnaDeDefinicion(def)
          if (col) { columnas.set(col.nombre, { tipo: col.tipo, notNull: col.notNull }); if (/PRIMARY KEY/i.test(def)) pk = [col.nombre] }
          else noReconocidas.push({ donde, texto: `CREATE TABLE ${m[1]} → ${def.slice(0, 120)}` })
        }
      }
      aplicado.tablas.set(m[1], { columnas, pk, donde })
    } else if ((m = t.match(/^DROP TABLE (?:IF EXISTS )?"([^"]+)"(?: CASCADE)?$/i))) {
      aplicado.tablas.delete(m[1])
      for (const [k, i] of aplicado.indices) if (i.tabla === m[1]) aplicado.indices.delete(k)
      for (const [k, f] of aplicado.fks) if (f.tabla === m[1]) aplicado.fks.delete(k)
    } else if ((m = t.match(/^ALTER TABLE (?:IF EXISTS )?(?:ONLY )?"([^"]+)" RENAME TO "([^"]+)"$/i))) {
      aplicado.tablas.set(m[2], aplicado.tablas.get(m[1])); aplicado.tablas.delete(m[1])
      for (const i of aplicado.indices.values()) if (i.tabla === m[1]) i.tabla = m[2]
      for (const f of aplicado.fks.values()) { if (f.tabla === m[1]) f.tabla = m[2]; if (f.destino === m[1]) f.destino = m[2] }
    } else if ((m = t.match(/^ALTER TABLE (?:IF EXISTS )?(?:ONLY )?"([^"]+)"\s+([\s\S]+)$/i))) {
      const tabla = aplicado.tablas.get(m[1])
      for (const accion of partirNivelCero(m[2])) {
        let a
        if (!tabla) { noReconocidas.push({ donde, texto: `ALTER sobre tabla inexistente ${m[1]}: ${accion.slice(0, 100)}` }); continue }
        if ((a = accion.match(/^ADD COLUMN (?:IF NOT EXISTS )?([\s\S]+)$/i))) {
          const col = columnaDeDefinicion(a[1].trim())
          if (col) tabla.columnas.set(col.nombre, { tipo: col.tipo, notNull: col.notNull })
        } else if ((a = accion.match(/^DROP COLUMN (?:IF EXISTS )?"([^"]+)"/i))) {
          // Postgres se lleva con la columna los índices y las FKs que la usan.
          tabla.columnas.delete(a[1])
          for (const [k, i] of aplicado.indices) if (i && i.tabla === m[1] && i.columnas.includes(a[1])) aplicado.indices.delete(k)
          for (const [k, f] of aplicado.fks) if (f.tabla === m[1] && f.columnas.includes(a[1])) aplicado.fks.delete(k)
        }
        else if ((a = accion.match(/^RENAME COLUMN "([^"]+)" TO "([^"]+)"$/i))) { tabla.columnas.set(a[2], tabla.columnas.get(a[1])); tabla.columnas.delete(a[1]) }
        else if ((a = accion.match(/^ALTER COLUMN "([^"]+)" SET NOT NULL$/i))) { const c = tabla.columnas.get(a[1]); if (c) c.notNull = true }
        else if ((a = accion.match(/^ALTER COLUMN "([^"]+)" DROP NOT NULL$/i))) { const c = tabla.columnas.get(a[1]); if (c) c.notNull = false }
        else if ((a = accion.match(/^ALTER COLUMN "([^"]+)" (?:SET DATA )?TYPE ([^\s][\s\S]*?)(?:\s+USING[\s\S]*)?$/i))) { const c = tabla.columnas.get(a[1]); if (c) c.tipo = normTipo(a[2]) }
        else if (/^ALTER COLUMN "([^"]+)" (SET|DROP) DEFAULT/i.test(accion)) { /* defaults no se comparan */ }
        else if ((a = accion.match(/^ADD CONSTRAINT "([^"]+)" PRIMARY KEY \(([^)]*)\)/i))) tabla.pk = a[2].split(',').map((x) => sinComillas(x.trim()))
        else if ((a = accion.match(/^ADD CONSTRAINT "([^"]+)" FOREIGN KEY \(([^)]*)\) REFERENCES "([^"]+)"\(([^)]*)\)(.*)$/i))) {
          aplicado.fks.set(a[1], { tabla: m[1], columnas: a[2].split(',').map((x) => sinComillas(x.trim())), destino: a[3], refs: a[4].split(',').map((x) => sinComillas(x.trim())), onDelete: (a[5].match(/ON DELETE (SET NULL|CASCADE|RESTRICT|NO ACTION|SET DEFAULT)/i)?.[1] ?? 'NO ACTION').toUpperCase(), donde })
        } else if ((a = accion.match(/^ADD CONSTRAINT "([^"]+)" UNIQUE \(([^)]*)\)/i))) {
          aplicado.indices.set(a[1], { tabla: m[1], columnas: a[2].split(',').map((x) => sinComillas(x.trim())), unico: true, donde })
        } else if ((a = accion.match(/^DROP CONSTRAINT (?:IF EXISTS )?"([^"]+)"/i))) { aplicado.fks.delete(a[1]); aplicado.indices.delete(a[1]) }
        else if ((a = accion.match(/^RENAME CONSTRAINT "([^"]+)" TO "([^"]+)"$/i))) {
          if (aplicado.fks.has(a[1])) { aplicado.fks.set(a[2], aplicado.fks.get(a[1])); aplicado.fks.delete(a[1]) }
          if (aplicado.indices.has(a[1])) { aplicado.indices.set(a[2], aplicado.indices.get(a[1])); aplicado.indices.delete(a[1]) }
        } else noReconocidas.push({ donde, texto: `ALTER TABLE ${m[1]} → ${accion.slice(0, 140)}` })
      }
    } else if ((m = t.match(/^CREATE (UNIQUE )?INDEX (?:CONCURRENTLY )?(?:IF NOT EXISTS )?"([^"]+)" ON "([^"]+)"(?: USING \w+)?\s*\(([^)]*)\)([\s\S]*)$/i))) {
      aplicado.indices.set(m[2], { tabla: m[3], columnas: m[4].split(',').map((x) => sinComillas(x.trim().replace(/\s+(ASC|DESC)$/i, ''))), unico: Boolean(m[1]), parcial: /WHERE/i.test(m[5]), donde })
    } else if ((m = t.match(/^DROP INDEX (?:IF EXISTS )?"([^"]+)"$/i))) aplicado.indices.delete(m[1])
    else if ((m = t.match(/^ALTER INDEX (?:IF EXISTS )?"([^"]+)" RENAME TO "([^"]+)"$/i))) { aplicado.indices.set(m[2], aplicado.indices.get(m[1])); aplicado.indices.delete(m[1]) }
    else noReconocidas.push({ donde, texto: t.split('\n')[0].slice(0, 160) })
  }
}

// ── 3. Comparación ───────────────────────────────────────────────────────────
const difs = []
const d = (tipo, objeto, detalle) => difs.push({ tipo, objeto, detalle })
for (const [nombre, valores] of esperado.enums) {
  const ap = aplicado.enums.get(nombre)
  if (!ap) { d('enum-falta-en-migraciones', nombre, valores.join(',')); continue }
  const faltan = valores.filter((v) => !ap.includes(v)); const sobran = ap.filter((v) => !valores.includes(v))
  if (faltan.length || sobran.length) d('enum-valores-distintos', nombre, `faltan en migraciones: [${faltan}] · sobran en migraciones: [${sobran}]`)
}
for (const nombre of aplicado.enums.keys()) if (!esperado.enums.has(nombre)) d('enum-sobra-en-migraciones', nombre, '')

for (const [tabla, e] of esperado.tablas) {
  const ap = aplicado.tablas.get(tabla)
  if (!ap) { d('tabla-falta-en-migraciones', tabla, `modelo ${e.modelo}`); continue }
  for (const [col, c] of e.columnas) {
    const a = ap.columnas.get(col)
    if (!a) { d('columna-falta-en-migraciones', `${tabla}.${col}`, `${c.tipo}${c.notNull ? ' NOT NULL' : ''}`); continue }
    if (a.tipo !== c.tipo) d('columna-tipo-distinto', `${tabla}.${col}`, `schema ${c.tipo} · migraciones ${a.tipo}`)
    if (a.notNull !== c.notNull) d('columna-nulabilidad-distinta', `${tabla}.${col}`, `schema ${c.notNull ? 'NOT NULL' : 'NULL'} · migraciones ${a.notNull ? 'NOT NULL' : 'NULL'}`)
  }
  for (const col of ap.columnas.keys()) if (!e.columnas.has(col)) d('columna-sobra-en-migraciones', `${tabla}.${col}`, ap.columnas.get(col).tipo)
  if (e.pk && ap.pk && e.pk.join(',') !== ap.pk.join(',')) d('pk-distinta', tabla, `schema (${e.pk}) · migraciones (${ap.pk})`)
}
for (const tabla of aplicado.tablas.keys()) if (!esperado.tablas.has(tabla)) d('tabla-sobra-en-migraciones', tabla, aplicado.tablas.get(tabla).donde)

const claveIdx = (i) => `${i.tabla}|${i.columnas.join(',')}|${i.unico ? 'U' : 'I'}`
const idxAplicados = new Map([...aplicado.indices.values()].filter(Boolean).map((i) => [claveIdx(i), i]))
const idxEsperados = new Map(esperado.indices.map((i) => [claveIdx(i), i]))
// Las PK no se declaran como índice en el schema: no cuentan como sobrantes.
const clavesPk = new Set([...aplicado.tablas].filter(([, t]) => t.pk).map(([n, t]) => `${n}|${t.pk.join(',')}|U`))
for (const [k, i] of idxEsperados) if (!idxAplicados.has(k)) d('indice-falta-en-migraciones', k, i.origen)
for (const [k, i] of idxAplicados) if (!idxEsperados.has(k) && !clavesPk.has(k)) d('indice-sobra-en-migraciones', k, `${i.donde}${i.parcial ? ' (parcial)' : ''}`)

const claveFk = (tabla, cols) => `${tabla}|${cols.join(',')}`
const fkAplicadas = new Map([...aplicado.fks.values()].map((f) => [claveFk(f.tabla, f.columnas), f]))
for (const f of esperado.fks) {
  const a = fkAplicadas.get(claveFk(f.tabla, f.columnas))
  if (!a) { d('fk-falta-en-migraciones', claveFk(f.tabla, f.columnas), `→ ${f.tablaDestino} onDelete ${f.onDeleteEfectivo}`); continue }
  if (a.destino !== f.tablaDestino) d('fk-destino-distinto', claveFk(f.tabla, f.columnas), `schema ${f.tablaDestino} · migraciones ${a.destino}`)
  if (a.onDelete !== f.onDeleteEfectivo) d('fk-ondelete-distinto', claveFk(f.tabla, f.columnas), `schema ${f.onDeleteEfectivo} · migraciones ${a.onDelete} (${a.donde})`)
}
const fkEsperadas = new Set(esperado.fks.map((f) => claveFk(f.tabla, f.columnas)))
for (const [k, a] of fkAplicadas) if (!fkEsperadas.has(k)) d('fk-sobra-en-migraciones', k, `→ ${a.destino} (${a.donde})`)

mkdirSync(path.dirname(OUT), { recursive: true })
const resumen = difs.reduce((m, x) => ((m[x.tipo] = (m[x.tipo] ?? 0) + 1), m), {})
writeFileSync(OUT, JSON.stringify({
  migraciones: dirs.length,
  schema: { tablas: esperado.tablas.size, enums: esperado.enums.size, indices: esperado.indices.length, fks: esperado.fks.length },
  aplicado: { tablas: aplicado.tablas.size, enums: aplicado.enums.size, indices: aplicado.indices.size, fks: aplicado.fks.size },
  resumen, diferencias: difs, sentencias_no_reconocidas: noReconocidas,
}, null, 2) + '\n', 'utf8')
console.log(`migraciones=${dirs.length}  schema: ${esperado.tablas.size} tablas/${esperado.enums.size} enums/${esperado.indices.length} índices/${esperado.fks.length} FKs  ·  aplicado: ${aplicado.tablas.size}/${aplicado.enums.size}/${aplicado.indices.size}/${aplicado.fks.size}`)
console.log('diferencias:', JSON.stringify(resumen))
for (const x of difs) console.log(`  ${x.tipo.padEnd(32)} ${x.objeto}  ${x.detalle}`)
console.log(`sentencias no reconocidas: ${noReconocidas.length}`)
for (const n of noReconocidas) console.log(`  ${n.donde}  ${n.texto}`)
console.log(`\nescrito: ${path.relative(appRoot, OUT)}`)
