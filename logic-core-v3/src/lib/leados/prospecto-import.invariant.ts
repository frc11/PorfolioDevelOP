/**
 * Chequeo de invariante de IMPORTACIÓN MASIVA del setter (Sprint A.2) — sin DB.
 *
 *   npm run check:invariant:prospecto-import
 *
 * EXTIENDE el invariante de A.1 (`alta-propia.invariant.ts`) al LOTE: cuando el
 * setter importa una tanda desde un CSV, el dueño de CADA fila se DERIVA de la
 * sesión — jamás de una columna del archivo (anti-IDOR de escritura EN LOTE). Y
 * la entrada NO confiable se valida fila por fila: lo inválido / duplicado NO
 * construye ningún lead (nada fugado), no rompe la tanda.
 *
 * Corre el pipeline REAL (parseCsv → mapearFilas → NuevoProspectoSchema →
 * dedupEnLote → construirAltasLote), no una maqueta. Importa solo módulos puros
 * (prospecto-import, isolation, el schema zod de A.1) — cero Neon, cero efectos.
 */
import assert from 'node:assert/strict'
import {
  construirAltasLote,
  dedupEnLote,
  mapearFilas,
  MAX_FILAS_IMPORT,
  normalizarNombre,
  parseCsv,
  type FilaValida,
} from './prospecto-import.ts'
import { ownedListWhere } from './isolation.ts'
import { NuevoProspectoSchema } from '../../app/(protected)/setter/_actions/prospecto.schemas.ts'

const SETTER_A = 'setter-a'
const SETTER_B = 'setter-b'

/** Valida una matriz de filas crudas con el MISMO schema que el action. */
function validar(filas: { fila: number; data: Record<string, unknown> }[]): {
  validas: FilaValida[]
  invalidas: number[]
} {
  const validas: FilaValida[] = []
  const invalidas: number[] = []
  for (const f of filas) {
    const parsed = NuevoProspectoSchema.safeParse(f.data)
    if (parsed.success) {
      validas.push({ fila: f.fila, data: parsed.data, norm: normalizarNombre(parsed.data.businessName) })
    } else {
      invalidas.push(f.fila)
    }
  }
  return { validas, invalidas }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ANTI-IDOR DE ESCRITURA EN LOTE — el corazón del sprint. Aunque CADA fila
//    intente inyectar otro `assignedToId` (y `caliente: true`), `construirAltasLote`
//    no lo lee: arma cada registro por el builder aislado de A.1 y fuerza la sesión.
// ─────────────────────────────────────────────────────────────────────────────
const hostiles = [
  { businessName: 'Phishing SRL', assignedToId: SETTER_B, caliente: true },
  { businessName: 'Otro Negocio', assignedToId: SETTER_B, owner: SETTER_B },
] as unknown as Parameters<typeof construirAltasLote>[0]

const altasHostiles = construirAltasLote(hostiles, SETTER_A)
assert.equal(altasHostiles.length, 2, 'se construye un alta por fila')
for (const a of altasHostiles) {
  assert.equal(a.assignedToId, SETTER_A, 'cada lead del lote se asigna al setter de la sesión')
  assert.notEqual(a.assignedToId, SETTER_B, 'ningún lead del lote queda en la cartera de otro (sin fuga)')
  assert.equal(a.caliente, false, 'el lote entra frío — inyectar caliente=true no gana')
  assert.equal(a.source, 'Setter', 'queda marcada la segunda fuente (auto-cargado)')
}

// La frontera de ESCRITURA del lote es la MISMA que la de LECTURA de A.1.
assert.equal(altasHostiles[0].assignedToId, ownedListWhere(SETTER_A).assignedToId)
assert.notEqual(altasHostiles[0].assignedToId, ownedListWhere(SETTER_B).assignedToId)

// ─────────────────────────────────────────────────────────────────────────────
// 2. PIPELINE REAL: una columna `assignedToId` en el ARCHIVO no existe como campo
//    del lead (mapearFilas la ignora) y, encima, las filas inválidas no se
//    construyen — nada fugado, la tanda sigue.
// ─────────────────────────────────────────────────────────────────────────────
const csvHostil = [
  'nombre,email,assignedToId',
  'Café Bueno,hola@cafe.com,setter-b', // válida; la columna hostil ni mapea
  ',sin-nombre@x.com,setter-b', // inválida: sin nombre (mínimo de FICHA)
  'Mail Roto,no-es-un-mail,setter-b', // inválida: email mal formado
].join('\n')

const mapeoHostil = mapearFilas(parseCsv(csvHostil))
assert.ok(mapeoHostil.ok, 'el encabezado tiene la columna nombre')
if (mapeoHostil.ok) {
  const { validas, invalidas } = validar(mapeoHostil.filas)
  assert.equal(validas.length, 1, 'solo la fila bien formada sobrevive la validación')
  assert.equal(invalidas.length, 2, 'sin-nombre y email-roto rebotan (no rompen la tanda)')

  const altas = construirAltasLote(validas.map((v) => v.data), SETTER_A)
  assert.equal(altas.length, 1, 'solo se construye el alta de la fila válida — lo inválido no fuga')
  assert.equal(altas[0].assignedToId, SETTER_A, 'la columna assignedToId del archivo no tuvo efecto alguno')
  assert.equal(altas[0].businessName, 'Café Bueno')
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DEDUP DENTRO DEL ARCHIVO: el mismo negocio (acento/caja aparte) cuenta una
//    vez — una lista repetida no crea dos leads.
// ─────────────────────────────────────────────────────────────────────────────
const mapeoDup = mapearFilas(parseCsv(['nombre', 'Café Repetido', 'cafe repetido', 'Otro'].join('\n')))
assert.ok(mapeoDup.ok)
if (mapeoDup.ok) {
  const { validas } = validar(mapeoDup.filas)
  const { unicas, duplicadas } = dedupEnLote(validas)
  assert.equal(unicas.length, 2, 'el negocio repetido cuenta una vez; "Otro" aparte')
  assert.equal(duplicadas.length, 1, 'la repetición se reporta')
  assert.equal(duplicadas[0].motivo, 'en-archivo')
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PARSER CORRECTO: comas/comillas dentro de un campo entre comillas NO parten
//    la fila (donde el split naíf por `,` fallaría).
// ─────────────────────────────────────────────────────────────────────────────
assert.deepEqual(
  parseCsv('nombre,zona\n"Bar, El Rincón","Palermo, CABA"\n'),
  [['nombre', 'zona'], ['Bar, El Rincón', 'Palermo, CABA']],
  'campos entre comillas con comas quedan intactos',
)

// Renglones en blanco (intermedios o finales) se saltan; el resto se conserva.
const mapeoVacias = mapearFilas(parseCsv('nombre\nUno\n\n   \nDos\n'))
assert.ok(mapeoVacias.ok)
if (mapeoVacias.ok) {
  assert.equal(mapeoVacias.filas.length, 2, 'renglones vacíos no cuentan como filas de datos')
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ENCABEZADO SIN LA COLUMNA OBLIGATORIA → falla limpio (no inventa filas).
// ─────────────────────────────────────────────────────────────────────────────
assert.equal(
  mapearFilas(parseCsv('email,telefono\na@b.com,123\n')).ok,
  false,
  'sin columna "nombre" el mapeo falla en vez de crear leads sin negocio',
)

// Sanidad del tope de lote (entrada no confiable acotada).
assert.ok(MAX_FILAS_IMPORT > 0, 'hay un tope de filas por tanda')

console.log(
  '✓ invariante OK: la importación masiva deriva el dueño de la sesión en CADA fila ' +
    '(anti-IDOR de escritura en lote), valida la entrada no confiable por fila, y ' +
    'lo inválido/duplicado no construye ningún lead — sin fuga, sin romper la tanda.',
)
