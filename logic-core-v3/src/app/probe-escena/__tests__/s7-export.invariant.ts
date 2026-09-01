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

/**
 * El recorte del bloque, como FUNCIÓN y no en línea. Es lo que permite correrlo
 * contra un fuente que no lo tiene: si devolviera algo en ese caso, la
 * comparación byte por byte de abajo estaría midiendo dos cadenas vacías.
 */
function bloqueDelArchivo(source: string): string {
  const start = source.indexOf('/**\n * El recorrido.')
  const constIndex = source.indexOf('export const CHOREO_KEYFRAMES')
  const end = constIndex >= 0 ? source.indexOf('\n]\n', constIndex) : -1
  return start >= 0 && end >= 0 ? source.slice(start, end + 3) : ''
}

{
  const editor = createChoreoEditor()
  const emitted = buildKeyframesSource(editor.keyframes, VARIANT_DEFINITIVA)

  const source = readFileSync(
    join(process.cwd(), 'src/app/v3/_lib/escena/choreography.ts'),
    'utf8'
  )
  const onFile = bloqueDelArchivo(source)

  check(
    'exportar la definitiva sin tocar nada devuelve el bloque del archivo, byte por byte',
    emitted === onFile,
    `${emitted.length} bytes emitidos contra ${onFile.length} en el archivo`
  )
  check(
    'control positivo — el recorte devuelve VACÍO en un fuente que no lleva el bloque',
    bloqueDelArchivo('export const OTRA_COSA = []\n') === '',
    'sin esto, "byte por byte" podría estar comparando dos cadenas vacías y salir en verde'
  )

  /**
   * ⚠ **EL CONTROL QUE VALE, y es el que corre la MISMA función.** Se mueve UNA
   * pose del editor y se vuelve a exportar: si el emisor no reflejara la
   * mutación, el round-trip de arriba pasaría también con el editor roto.
   */
  const sucio = createChoreoEditor()
  sucio.applyPose(sucio.keyframes[1].id, { angleDeg: 7, height: 7, distance: 7, frameX: 0, frameY: 0 })
  check(
    'control positivo — con UNA pose movida, el mismo emisor ya NO devuelve el archivo',
    buildKeyframesSource(sucio.keyframes, VARIANT_DEFINITIVA) !== onFile,
    'el emisor lee las poses vivas, no la constante importada'
  )
  check(
    'control positivo — y el editor lo sabe: mover una pose lo deja sucio',
    sucio.dirty === true,
    'la bandera que habilita el reset no es decorativa'
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
  check(
    'control positivo — el MISMO predicado del nombre pasa a falso sobre la salida de la definitiva',
    !(
      emitted.includes('export const VARIANT_INTIMA_KEYFRAMES') &&
      !emitted.includes('export const CHOREO_KEYFRAMES')
    ),
    'si diera verde con las dos salidas, no estaría mirando el nombre de la constante'
  )
  check(
    'control positivo — y el censo NO dice 24 cuando la variante tiene otra cantidad de poses',
    !emitted.includes('24 keyframes'),
    `la definitiva tiene ${CHOREO_KEYFRAMES.length} poses, no 24 — el censo cuenta las que se le pasan`
  )

  editor.setVariant('definitiva')
  check('volver a la definitiva no perdió su sesión', editor.keyframes.length === CHOREO_KEYFRAMES.length)
  check('y sigue sin estar sucia', editor.dirty === false)
}

report('s7 · export y sprites')
