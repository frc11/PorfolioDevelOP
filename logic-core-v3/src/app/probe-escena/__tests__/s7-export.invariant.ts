/**
 * COMPROBACIONES DE S7 · el camino de vuelta al archivo.
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-export.invariant.ts
 *
 * Lo que verifica es lo único que garantiza que calibrar no pierda el
 * razonamiento escrito: **que el exportador siga devolviendo el archivo byte por
 * byte**. Ya se rompió dos veces durante S7, las dos por texto escrito en el
 * lugar equivocado.
 *
 * ⚠️ **Se llamaba `s7-moire.invariant.ts` hasta S10.** Las comprobaciones del
 * moiré —aliasing, batido, tramas— se mudaron a `s10-fondo.invariant.ts`, que es
 * donde vive la envolvente de dos capas que las reemplazó.
 *
 * ⚠️ **Y en S11 perdió la otra mitad.** Acá vivían seis chequeos sobre la forma
 * de los dos sprites del sol —el escalón entre el núcleo y el halo, la caída sin
 * canto del washout— y se borraron **con las funciones que los generaban**:
 * `createSunSpriteData` y `createWashoutSpriteData` ya no existen. No hay nada
 * que verificar ni nada que quede verde por vacío; lo que queda es el round-trip
 * del exportador, que es lo único que este archivo siempre fue de verdad.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import { VARIANT_DEFINITIVA } from '../_components/choreographyVariants'
import { buildKeyframesSource } from '../_components/choreographyExport'
import { createChoreoEditor } from '../_components/choreographyEditor'
import { check, report, section } from './harness'

// ── 7 · El camino de vuelta al archivo ──────────────────────────────────────

section('El export devuelve el archivo')

{
  const editor = createChoreoEditor()
  const emitted = buildKeyframesSource(editor.keyframes, VARIANT_DEFINITIVA)

  const source = readFileSync(
    join(process.cwd(), 'src/app/v3/_lib/escena/choreography.ts'),
    'utf8'
  )
  const start = source.indexOf('/**\n * El recorrido.')
  const constIndex = source.indexOf('export const CHOREO_KEYFRAMES')
  const end = source.indexOf('\n]\n', constIndex)
  const onFile = start >= 0 && end >= 0 ? `${source.slice(start, end + 3)}` : ''

  check(
    'exportar la definitiva sin tocar nada devuelve el bloque del archivo, byte por byte',
    emitted === onFile,
    `${emitted.length} bytes emitidos contra ${onFile.length} en el archivo`
  )

  editor.setVariant('intima')
  const intima = buildKeyframesSource(editor.keyframes, editor.variant)
  check(
    'exportar una variante NO emite el nombre del recorrido definitivo',
    intima.includes('export const VARIANT_INTIMA_KEYFRAMES') &&
      !intima.includes('export const CHOREO_KEYFRAMES'),
    'pegar una variante sobre `choreography.ts` pisaría la coreografía definitiva'
  )
  check('el censo del doc cuenta las poses de la variante activa', intima.includes('24 keyframes'))

  editor.setVariant('definitiva')
  check('volver a la definitiva no perdió su sesión', editor.keyframes.length === CHOREO_KEYFRAMES.length)
  check('y sigue sin estar sucia', editor.dirty === false)
}

report('s7 · export y sprites')
