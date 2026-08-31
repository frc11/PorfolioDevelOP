import type { ChoreoKeyframe, ChoreoVariant } from '@/app/v3/_lib/escena/choreographyTypes'
import {
  CALIBRADA_DOC,
  CALIBRADA_NOTES,
  CALIBRADA_SECTIONS,
} from './variantCalibradaNotes'

/**
 * VARIANTE · CALIBRADA A MANO — el recorrido que el humano compuso mirando.
 *
 * ═════════════════════════════════════════════════════════════════════════════
 * QUÉ ES, Y POR QUÉ SIGUE ACÁ
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * Hasta S8 esto **era** `CHOREO_KEYFRAMES`: la coreografía que el dueño del
 * proyecto calibró con el editor de S5 recorriendo el track y mirando la
 * escena, más los arreglos de S6 y los siete arcos de curvatura de S7.
 *
 * S9 eligió otro recorrido —el mix de la arquitectónica y la dramática— y ese
 * pasó a ocupar `choreography.ts`. **Éste no se borra**: son 21 poses compuestas
 * a mano en una sesión entera de trabajo humano, y este módulo ya perdió una
 * calibración completa por confiar en el portapapeles. Queda como recorrido
 * seleccionable desde el panel, para poder volver a compararlo en pantalla.
 *
 * ── El censo, sin redondear ──────────────────────────────────────
 *
 * **30 keyframes: 21 capturados + 9 derivados.** Siete de los 21 son sostenes
 * hechos con el botón de duplicar, no capturas; dos de esos siete ya no
 * sostienen nada porque se les movió la pose después de duplicar. Los 9
 * derivados son dos sub-movimientos de S4 y los siete arcos de S7.
 *
 * ── Por qué no lleva comentarios adentro del array ───────────────────
 *
 * Porque nunca fueron su fuente. Los `//` que este recorrido tenía dentro de
 * `choreography.ts` eran **la salida** de `choreographyNotesFrontal.ts` y
 * `choreographyNotesGiro.ts`, que el exportador regenera; están intactos y se
 * vuelven a emitir apretando "exportar" con esta variante activa. Así queda con
 * la misma forma que las otras tres propuestas —datos acá, razonamiento en el
 * módulo de notas— y el archivo baja de 530 líneas a 250.
 *
 * ⚠️ **Las 23 poses de S6 se verifican una por una** en
 * `s7-recorridos.invariant.ts`, contra una tabla congelada. Si alguna se mueve
 * acá, esa comprobación lo dice.
 */
export const VARIANT_CALIBRADA_KEYFRAMES: readonly ChoreoKeyframe[] = [
  { at: 0, name: 'entrada · mirada alta', pose: { angleDeg: 0, height: 9, distance: 15, frameX: 0.9, frameY: 0 } },
  { at: 0.068, name: 'hero · arco de bajada', derived: true, ease: 'linear', pose: { angleDeg: -7, height: 4.6, distance: 15.4, frameX: 0.9, frameY: 0 } },
  { at: 0.125, name: 'hero', ease: 'arrive', pose: { angleDeg: 0, height: 0, distance: 11, frameX: 0.75, frameY: 0 } },
  { at: 0.188, name: 'hero · sostén', ease: 'arrive', pose: { angleDeg: 0, height: 0, distance: 11, frameX: 0.75, frameY: 0 } },
  { at: 0.223, name: 'quiénes somos · arco de entrada', derived: true, ease: 'shift', pose: { angleDeg: 5.5, height: 3.4, distance: 10.7, frameX: 0.3, frameY: 0 } },
  { at: 0.25, name: 'quiénes somos · persona 1', ease: 'shift', pose: { angleDeg: 0, height: 5, distance: 9, frameX: -0.8, frameY: 0 } },
  { at: 0.293, name: 'quiénes somos · persona 1 · sostén', ease: 'shift', pose: { angleDeg: 0, height: 5, distance: 9, frameX: -0.8, frameY: 0 } },
  { at: 0.335, name: 'persona 2 · cruce (apex)', derived: true, ease: 'linear', pose: { angleDeg: 0, height: 4.5431, distance: 10.7012, frameX: -0.1568, frameY: 0 } },
  { at: 0.375, name: 'quiénes somos · persona 2', ease: 'shift', pose: { angleDeg: 0, height: 5, distance: 9, frameX: 0.8, frameY: 0 } },
  { at: 0.395, name: 'quiénes somos · persona 2 · sostén', ease: 'shift', pose: { angleDeg: 0, height: 2.6492, distance: 9.8298, frameX: 0.5698, frameY: 0 } },
  { at: 0.414, name: 'números · arco de caída', derived: true, ease: 'shift', pose: { angleDeg: 0, height: 0.1, distance: 10.6, frameX: 0.6, frameY: 0 } },
  { at: 0.445, name: 'números · baja la altura', derived: true, ease: 'shift', pose: { angleDeg: 0, height: -3.9, distance: 9, frameX: 0.4762, frameY: 0 } },
  { at: 0.491, name: 'números · sube y se aleja', ease: 'shift', pose: { angleDeg: 0, height: 1, distance: 11, frameX: 0.0129, frameY: 0 } },
  { at: 0.5, name: 'números', ease: 'shift', pose: { angleDeg: 0, height: 1, distance: 14.1, frameX: 0, frameY: 0 } },
  { at: 0.531, name: 'números · deriva en arco', derived: true, ease: 'linear', pose: { angleDeg: -4, height: 2, distance: 14.6, frameX: -0.1, frameY: 0 } },
  { at: 0.563, name: 'números · sostén', ease: 'shift', pose: { angleDeg: 0, height: 0, distance: 12, frameX: 0, frameY: 0 } },
  { at: 0.589, name: 'portfolio · arco de aproximación', derived: true, ease: 'shift', pose: { angleDeg: 27, height: 1.9, distance: 11, frameX: -0.24, frameY: 0 } },
  { at: 0.625, name: 'portfolio', ease: 'shift', pose: { angleDeg: 45, height: 6, distance: 7, frameX: -1, frameY: 0 } },
  { at: 0.643, name: 'portfolio · sostén', ease: 'shift', pose: { angleDeg: 45, height: 6, distance: 7, frameX: -1, frameY: 0 } },
  { at: 0.679, name: 'demos · giro ¼', ease: 'linear', turn: 'literal', pose: { angleDeg: 135, height: 3.9, distance: 7, frameX: -0.5, frameY: 0 } },
  { at: 0.697, name: 'demos · giro ½', ease: 'linear', turn: 'literal', pose: { angleDeg: 180, height: -3.9, distance: 8, frameX: 0, frameY: 0.1 } },
  { at: 0.715, name: 'demos · giro ¾', ease: 'linear', turn: 'literal', pose: { angleDeg: 225, height: -3.9, distance: 7, frameX: -0.5, frameY: 0 } },
  { at: 0.75, name: 'demos', ease: 'shift', turn: 'literal', pose: { angleDeg: 315, height: -3.9, distance: 7, frameX: 1, frameY: 0 } },
  { at: 0.788, name: 'demos · sostén', ease: 'shift', turn: 'literal', pose: { angleDeg: 315, height: -3.9, distance: 7, frameX: 1, frameY: 0 } },
  { at: 0.809, name: 'final · arco de subida', derived: true, ease: 'shift', pose: { angleDeg: 306, height: 0.9, distance: 8.6, frameX: 0.86, frameY: 0 } },
  { at: 0.825, name: 'final · se levanta', ease: 'shift', pose: { angleDeg: 315, height: 4.5, distance: 7, frameX: 1, frameY: 0 } },
  { at: 0.85, name: 'final · gira', ease: 'shift', pose: { angleDeg: 360, height: 4.5, distance: 8, frameX: 0, frameY: 0 } },
  { at: 0.868, name: 'cierre · arco de retirada', derived: true, ease: 'linear', pose: { angleDeg: 360, height: 5.4, distance: 12.6, frameX: 0, frameY: 0 } },
  { at: 0.89, name: 'cierre · sostén', ease: 'arrive', pose: { angleDeg: 360, height: 1.5, distance: 16, frameX: 0, frameY: 0 } },
  { at: 1, name: 'cierre', ease: 'arrive', pose: { angleDeg: 360, height: 1.5, distance: 16, frameX: 0, frameY: 0 } },
]

export const VARIANT_CALIBRADA: ChoreoVariant = {
  id: 'calibrada',
  label: 'calibrada a mano',
  thesis:
    'El recorrido que el humano compuso mirando la escena, con los arcos de S7. Era la base hasta S8.',
  constName: 'VARIANT_CALIBRADA_KEYFRAMES',
  file: 'variantCalibrada.ts',

  doc: CALIBRADA_DOC,
  sections: CALIBRADA_SECTIONS,
  notes: CALIBRADA_NOTES,

  keyframes: VARIANT_CALIBRADA_KEYFRAMES,
}
