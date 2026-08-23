/**
 * COMPROBACIONES DE S7 · el camino de vuelta al archivo, y la forma de los
 * sprites generados.
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
 * donde vive la envolvente de dos capas que las reemplazó. Acá quedó el export,
 * que nunca fue del moiré, y la forma del sprite del sol, que sigue siendo la
 * misma.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { CHOREO_KEYFRAMES } from '../_components/choreography'
import { VARIANT_DEFINITIVA } from '../_components/choreographyVariants'
import { buildKeyframesSource } from '../_components/choreographyExport'
import { createChoreoEditor } from '../_components/choreographyEditor'
import {
  SUN_CORE,
  SUN_WASHOUT_FALLOFF,
  createSunSpriteData,
  createWashoutSpriteData,
} from '../_components/probeSun'
import { check, report, section } from './harness'

section('La forma del sol y de su washout')

{
  const sun = createSunSpriteData(64, SUN_CORE, 0.5, 2.4)
  const sunAlpha = (x: number, y: number) => sun[(y * 64 + x) * 4 + 3] / 255
  check('el núcleo del sol es opaco en el centro', sunAlpha(32, 32) > 0.99)
  check('el halo se apaga del todo en el borde', sunAlpha(0, 32) < 0.02)
  const coreEdge = Math.round(32 + SUN_CORE * 32)
  check(
    'hay un escalón entre el disco y el halo: es lo que lo hace leer como fuente',
    sunAlpha(coreEdge - 3, 32) - sunAlpha(coreEdge + 3, 32) > 0.2,
    `${sunAlpha(coreEdge - 3, 32).toFixed(2)} adentro contra ${sunAlpha(coreEdge + 3, 32).toFixed(2)} afuera`
  )

  /**
   * El washout es lo contrario del cuerpo: no tiene escalón. Un cuerpo tiene
   * canto; la luz que se dispersa alrededor de él, no.
   */
  const wash = createWashoutSpriteData(64, SUN_WASHOUT_FALLOFF)
  const washAlpha = (x: number, y: number) => wash[(y * 64 + x) * 4 + 3] / 255
  // 0,95 y no 0,99: con lado par ningún téxel cae exactamente en el centro, así
  // que el más cercano ya está a 0,022 del radio y la caída con exponente 1,8 le
  // come cuatro centésimas. Es la textura, no el perfil.
  check(
    'el washout es pleno en el centro',
    washAlpha(32, 32) > 0.95,
    `${washAlpha(32, 32).toFixed(3)} en el téxel central`
  )
  check('y se apaga del todo en el borde', washAlpha(0, 32) < 0.01)
  let monotone = true
  for (let x = 32; x < 63; x += 1) {
    if (washAlpha(x + 1, 32) > washAlpha(x, 32) + 1e-6) monotone = false
  }
  check(
    'y cae sin escalón: no es un cuerpo, es dispersión',
    monotone,
    `de ${washAlpha(32, 32).toFixed(2)} en el centro a ${washAlpha(62, 32).toFixed(2)} en el borde`
  )
}

// ── 7 · El camino de vuelta al archivo ──────────────────────────────────────

section('El export devuelve el archivo')

{
  const editor = createChoreoEditor()
  const emitted = buildKeyframesSource(editor.keyframes, VARIANT_DEFINITIVA)

  const source = readFileSync(
    join(process.cwd(), 'src/app/probe-escena/_components/choreography.ts'),
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
