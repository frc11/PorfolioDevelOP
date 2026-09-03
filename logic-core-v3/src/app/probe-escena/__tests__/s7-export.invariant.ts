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
 *
 * ⚠️ **NORMALIZA EL FIN DE LÍNEA ANTES DE BUSCAR, Y ÉSE ERA EL DEFECTO.**
 *
 * Las tres agujas —`'/**\n * El recorrido.'`, la del `const` y `'\n]\n'`— llevan
 * `\n`, y `choreography.ts` está en disco con CRLF (`core.autocrlf` en true, que
 * es la configuración de este repo en Windows). Las dos primeras `indexOf`
 * fallaban y la función devolvía **cadena vacía**: la comparación "byte por
 * byte" medía 11.703 bytes emitidos contra **0** en el archivo, o sea que dejó
 * de mirar el archivo. No es una diferencia de contenido — con el fin de línea
 * normalizado los dos lados coinciden carácter por carácter.
 *
 * Y el control positivo de abajo tampoco lo discriminaba: `'export const
 * OTRA_COSA = []\n'` no tiene el bloque **ni con un fin de línea ni con el
 * otro**, así que daba verde con la función rota. El que se agregó exige
 * encontrarlo con los DOS —es el patrón de `s10-logo.invariant.ts` §6, donde el
 * mismo detector se corre contra `CHOREO` y contra `CHOREO_LF`.
 *
 * El emisor produce `\n` siempre: ECMAScript normaliza los terminadores de línea
 * de un template literal a LF al leer el fuente, así que `buildKeyframesSource`
 * no depende de con qué finales de línea esté guardado su propio archivo. La
 * normalización va de un solo lado, que es el que la necesita.
 */
function bloqueDelArchivo(source: string): string {
  const lf = source.replace(/\r\n/g, '\n')
  const start = lf.indexOf('/**\n * El recorrido.')
  const constIndex = lf.indexOf('export const CHOREO_KEYFRAMES')
  const end = constIndex >= 0 ? lf.indexOf('\n]\n', constIndex) : -1
  return start >= 0 && end >= 0 ? lf.slice(start, end + 3) : ''
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
   * ⚠ **EL CONTROL QUE FALTABA: el mismo bloque, con los DOS finales de línea.**
   *
   * El de arriba no discrimina la falla que este archivo tuvo: un fuente sin el
   * bloque no lo tiene ni con `\n` ni con `\r\n`, así que daba verde con el
   * recorte ciego a CRLF. Éste exige lo contrario — que el recorte ENCUENTRE el
   * bloque en las dos escrituras del mismo archivo y devuelva **lo mismo**.
   *
   * Se construyen las dos a partir del fuente real y no de un fixture: un
   * fixture escrito a mano puede quedarse viejo, y lo que hay que poder decir es
   * que ESTE archivo se recorta igual esté guardado como esté.
   */
  const enLf = source.replace(/\r\n/g, '\n')
  const enCrlf = enLf.replace(/\n/g, '\r\n')
  check(
    'control positivo — el recorte encuentra el bloque con LF y con CRLF, y devuelve lo mismo',
    bloqueDelArchivo(enLf).length > 0 && bloqueDelArchivo(enCrlf) === bloqueDelArchivo(enLf),
    `${bloqueDelArchivo(enLf).length} bytes desde el fuente en LF y ${bloqueDelArchivo(enCrlf).length} desde el mismo fuente en CRLF — el archivo en disco está en ${source.includes('\r\n') ? 'CRLF' : 'LF'}`
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
