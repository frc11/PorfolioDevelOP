import type { EditableKeyframe } from './choreographyEditor'
import { CHOREO_CHANNELS, type ChoreoVariant } from './choreographyTypes'
import { SECTION_RULE_WIDTH } from './choreographyNotes'

/**
 * EL EXPORT — de la sesión de edición de vuelta a `choreography.ts`.
 *
 * Genera el bloque entero de `CHOREO_KEYFRAMES`, con su doc, sus separadores de
 * tramo y los comentarios de cada keyframe, listo para reemplazar el que está
 * en el archivo. El humano copia y pega; **el probe nunca escribe en disco.**
 *
 * ── Por qué se re-emiten los comentarios ───────────────────────────────────
 *
 * Un export de solo números convertiría cada pegado en una pérdida: se iría el
 * razonamiento de por qué cada keyframe está donde está, que es lo único que
 * hace que ese archivo se pueda calibrar sin leer código. Los comentarios viven
 * como dato en `choreographyNotes.ts` — ver la regla ahí: **se editan allá**.
 *
 * ── Las normalizaciones, que en S6 quedaron en una ────────────────────────
 *
 * S5 dejó anotadas tres diferencias entre lo que salía de acá y lo que había en
 * el archivo, todas de autoría a mano: dónde caía el comentario de cada
 * keyframe, si había renglón vacío después del separador de tramo, y el ancho de
 * uno de los separadores. **Las tres se cerraron al reescribir el bloque en
 * S6**: el archivo de hoy tiene exactamente la forma que emite este exportador,
 * así que exportar sin haber tocado nada devuelve el archivo tal cual está.
 *
 * Queda una sola diferencia viva, y es la que tiene que quedar:
 *
 * - **El censo del doc se recalcula** (cuántos capturados, derivados y agregados
 *   hay de verdad), en vez de repetir un número escrito a mano que quedaría
 *   viejo al primer duplicado.
 *
 * ── Cuatro recorridos, cuatro destinos (S7) ────────────────────────────────
 *
 * El exportador recibe la VARIANTE, no solo los keyframes, y de ella saca tres
 * cosas que antes eran constantes: el nombre de la constante a emitir, el doc de
 * arriba del array y la tabla de comentarios.
 *
 * **No es una generalización de más: es lo que impide un error grave.** Con el
 * nombre fijo, exportar la variante íntima habría emitido `CHOREO_KEYFRAMES`, y
 * pegar ese bloque habría pisado la coreografía calibrada a mano con una
 * propuesta. El panel de export dice además en qué archivo va.
 *
 * ── La luz ya no está en la pose ───────────────────────────────────────────
 *
 * Hasta S5 este archivo tenía que decidir, keyframe por keyframe, si emitir
 * `...LIT` o los dos números de luz. Eso murió con el cambio: la pose son cinco
 * canales de cámara y la iluminación es una curva aparte (`LIGHT_ARC`), que el
 * editor no toca y el exportador no emite.
 *
 * ── Los números ────────────────────────────────────────────────────────────
 *
 * Cada valor se redondea a cuatro decimales y se emite en su forma más corta:
 * `-1` y no `-1.0000`. Los cuatro decimales no son estética, son higiene —
 * arrastrar un slider deja colas de coma flotante (0,30000000000000004) y esas
 * colas terminarían pegadas en el archivo.
 */

const INDENT = '  '
const ITEM_INDENT = '    '

/** El valor más corto que representa al número, sin colas de coma flotante. */
function formatNumber(value: number): string {
  const rounded = Number(value.toFixed(4))
  // `Object.is` y no `=== 0`: el −0 existe y se imprime "-0", que es ruido.
  return Object.is(rounded, -0) ? '0' : String(rounded)
}

function formatString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/** Una línea de comentario con su sangría. Sin texto no deja espacio colgando. */
function commentLine(indent: string, text: string): string {
  return text.length > 0 ? `${indent}// ${text}` : `${indent}//`
}

/** El separador de tramo, rellenado con `─` hasta el ancho que ya tiene el archivo. */
function sectionRule(title: string): string {
  const head = `${INDENT}// ── ${title} `
  const fill = Math.max(0, SECTION_RULE_WIDTH - head.length)
  return `${head}${'─'.repeat(fill)}`
}

/** Los cinco canales de cámara, en el orden fijo del módulo. Nada de luz. */
function poseLiteral(keyframe: EditableKeyframe): string {
  const parts: string[] = []

  for (const channel of CHOREO_CHANNELS) {
    parts.push(`${channel}: ${formatNumber(keyframe.pose[channel])}`)
  }

  return `{ ${parts.join(', ')} }`
}

/**
 * "1 capturado" y no "1 capturados". El censo lo lee un humano en un archivo que
 * después edita a mano, y un comentario mal escrito envejece peor que uno viejo.
 */
function count(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`
}

/** El doc que va arriba del array, con el censo recalculado sobre los datos vivos. */
function arrayDoc(keyframes: readonly EditableKeyframe[], variant: ChoreoVariant): string[] {
  const derived = keyframes.filter((keyframe) => keyframe.derived).length
  const added = keyframes.filter((keyframe) => keyframe.origin === 'editor').length
  const captured = keyframes.length - derived - added
  const touched = keyframes.filter(
    (keyframe) => keyframe.origin === 'archivo' && !keyframe.derived && keyframe.edited
  ).length

  const census = [count(captured, 'capturado'), count(derived, 'derivado')]
  if (added > 0) census.push(`${count(added, 'agregado')} en el editor`)

  const lines = ['/**', ` * El recorrido. ${keyframes.length} keyframes: ${census.join(' + ')}.`]

  if (touched > 0) {
    lines.push(
      ' *',
      ` * ${count(touched, 'de las posiciones capturadas', 'de las posiciones capturadas')} se`,
      touched === 1
        ? ' * ajustó con el editor: ya no es la captura cruda del humano, es la captura'
        : ' * ajustaron con el editor: ya no son la captura cruda del humano, son la captura',
      ' * calibrada mirando.'
    )
  }

  lines.push(' *')
  for (const line of variant.doc) lines.push(line.length > 0 ? ` * ${line}` : ' *')
  lines.push(' */')

  return lines
}

/**
 * El bloque completo, listo para reemplazar al que está en `choreography.ts`.
 *
 * Puro: no toca el DOM, no toca el store y no escribe nada. Lo llama el botón
 * del editor y su salida va al portapapeles.
 */
export function buildKeyframesSource(
  keyframes: readonly EditableKeyframe[],
  variant: ChoreoVariant
): string {
  const lines: string[] = [
    ...arrayDoc(keyframes, variant),
    `export const ${variant.constName}: readonly ChoreoKeyframe[] = [`,
  ]

  keyframes.forEach((keyframe, index) => {
    const section = variant.sections[keyframe.name]
    if (section) {
      // Renglón en blanco antes de cada tramo menos el primero: es lo que separa
      // los bloques a la vista.
      if (index > 0) lines.push('')
      lines.push(sectionRule(section.title))
      if (section.body.length > 0) {
        lines.push(commentLine(INDENT, ''))
        for (const line of section.body) lines.push(commentLine(INDENT, line))
      }
    }

    lines.push(`${INDENT}{`)

    const note = variant.notes[keyframe.name]
    if (note) for (const line of note) lines.push(commentLine(ITEM_INDENT, line))

    lines.push(`${ITEM_INDENT}at: ${formatNumber(keyframe.at)},`)
    lines.push(`${ITEM_INDENT}name: ${formatString(keyframe.name)},`)
    if (keyframe.derived) lines.push(`${ITEM_INDENT}derived: true,`)
    if (keyframe.ease) lines.push(`${ITEM_INDENT}ease: ${formatString(keyframe.ease)},`)
    if (keyframe.turn) lines.push(`${ITEM_INDENT}turn: ${formatString(keyframe.turn)},`)
    lines.push(`${ITEM_INDENT}pose: ${poseLiteral(keyframe)},`)

    lines.push(`${INDENT}},`)
  })

  lines.push(']')

  return `${lines.join('\n')}\n`
}
