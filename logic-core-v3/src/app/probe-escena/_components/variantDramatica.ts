import type { ChoreoVariant } from '@/app/v3/_lib/escena/choreographyTypes'
import {
  DRAMATICA_DOC,
  DRAMATICA_NOTES,
  DRAMATICA_SECTIONS,
} from './variantNotes'

/**
 * VARIANTE · DRAMÁTICA — picados y contrapicados marcados.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * LA TESIS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * **La altura como recurso narrativo.** La base usa el rango vertical con
 * prudencia y lo gasta casi todo en un solo momento; ésta lo recorre entero,
 * varias veces, y hace que cada pantalla cambie de PUNTO DE VISTA y no solo de
 * encuadre. Se mira desde arriba, se mira desde el piso, y el cambio entre las
 * dos cosas es el gesto.
 *
 * ── Qué la define, en tres números ─────────────────────────────────────────
 *
 * | | base calibrada | dramática |
 * |---|---:|---:|
 * | alturas | −3,9 a 9 | **−3,9 a 9** (el rango entero) |
 * | veces que cruza la altura del logo (y=0) | 4 | **11** |
 * | mayor salto de altura entre poses vecinas | 7,8 | **11,4** |
 *
 * El rango es el mismo porque es el que el slider permite; lo que cambia es
 * cuántas veces se lo recorre. Once cruces por el nivel del objeto significan
 * once cambios de picado a contrapicado en ocho pantallas.
 *
 * ── Las tres decisiones propias ────────────────────────────────────────────
 *
 * 1. **El hero mira desde ABAJO.** Altura −3,2, contrapicado de 14°: la marca
 *    se ve más grande que el observador. Es la decisión más agresiva de la
 *    variante y la que más cambia la primera impresión del sitio — la base entra
 *    desde arriba, ésta desde el piso.
 * 2. **"Quiénes somos" alterna arriba y abajo.** Persona 1 a +9 (el techo del
 *    rango), el cruce a −1,4, persona 2 otra vez a +9. Las dos personas no se
 *    distinguen por el lado de la pantalla sino por desde dónde se las mira, y
 *    entre las dos hay una caída de 10,4 —y después una recuperación de 10,4—
 *    que es el gesto vertical más grande de las cuatro coreografías.
 * 3. **El cierre es un contrapicado.** Altura −1,4 a 18 de distancia: la última
 *    imagen del recorrido mira la marca desde abajo, con el sol ya bajo. Es lo
 *    contrario del cierre de la base, que se aleja desde arriba. El logo queda
 *    en el 63% del alto del cuadro: aire de sobra para el wordmark y el slogan.
 *
 * ── Y una decisión que el sol hizo posible ─────────────────────────────────
 *
 * Como el sol ahora recorre un arco ligado al progreso, **una coreografía que
 * baje la cámara en el momento correcto lo tiene más tiempo en cuadro**. Esta
 * variante empuja `demos · giro ½` hasta el piso del rango (−3,9) con la cámara
 * mirando 21° hacia arriba, justo cuando el sol cruza el frente. Es la única de
 * las cuatro donde la fuente de luz es un elemento de composición y no un
 * accidente.
 *
 * ── Lo que hereda de la base y no se discute ───────────────────────────────
 *
 * Los seis tramos, las ocho pantallas, los bordes en múltiplos de 1/8, la vuelta
 * entera de 360° dentro de Demos y el patrón de sostén.
 *
 * ⚠️ **Todas las poses van `derived: true`**: son propuestas calculadas, no
 * composiciones. La base calibrada sigue intacta.
 */
export const VARIANT_DRAMATICA: ChoreoVariant = {
  id: 'dramatica',
  label: 'dramática',
  thesis: 'Contrastes de altura: picados y contrapicados marcados, y cambios audaces entre tramos.',
  constName: 'VARIANT_DRAMATICA_KEYFRAMES',
  file: 'variantDramatica.ts',

  doc: DRAMATICA_DOC,
  sections: DRAMATICA_SECTIONS,
  notes: DRAMATICA_NOTES,

  keyframes: [
    // ── Tramo 1 · Hero ───────────────────────────────────────────────────────
    {
      at: 0,
      name: 'entrada · cenital',
      derived: true,
      pose: { angleDeg: 0, height: 9, distance: 12, frameX: 0.2, frameY: 0 },
    },
    {
      at: 0.066,
      name: 'hero · arco de bajada',
      derived: true,
      ease: 'linear',
      pose: { angleDeg: -16, height: 8.2, distance: 16, frameX: 0.6, frameY: 0 },
    },
    {
      at: 0.125,
      name: 'hero',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 0, height: -3.2, distance: 13, frameX: 0.8, frameY: 0 },
    },
    {
      at: 0.188,
      name: 'hero · sostén',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 0, height: -3.2, distance: 13, frameX: 0.8, frameY: 0 },
    },

    // ── Tramo 2 · Quiénes somos (dos personas) ───────────────────────────────
    {
      at: 0.224,
      name: 'quiénes somos · arco de entrada',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 18, height: 3, distance: 11, frameX: 0.35, frameY: 0 },
    },
    {
      at: 0.25,
      name: 'quiénes somos · persona 1',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: -34, height: 9, distance: 9.5, frameX: -0.85, frameY: 0 },
    },
    {
      at: 0.3,
      name: 'persona 1 · sostén',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: -34, height: 9, distance: 9.5, frameX: -0.85, frameY: 0 },
    },
    {
      at: 0.336,
      name: 'persona 2 · cruce',
      derived: true,
      ease: 'linear',
      pose: { angleDeg: -4, height: -1.4, distance: 12, frameX: 0, frameY: 0 },
    },
    {
      at: 0.375,
      name: 'quiénes somos · persona 2',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 30, height: 9, distance: 9.5, frameX: 0.85, frameY: 0 },
    },

    // ── Tramo 3 · Números ────────────────────────────────────────────────────
    {
      at: 0.418,
      name: 'números · arco de caída',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 30, height: 1.6, distance: 11.5, frameX: 0.6, frameY: 0 },
    },
    {
      at: 0.455,
      name: 'números · desde el piso',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 14, height: -3.9, distance: 8, frameX: 0.4, frameY: 0 },
    },
    {
      at: 0.5,
      name: 'números',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 0, height: 7.4, distance: 17, frameX: 0, frameY: 0 },
    },
    {
      at: 0.534,
      name: 'números · deriva en arco',
      derived: true,
      ease: 'linear',
      pose: { angleDeg: -14, height: 5, distance: 19.5, frameX: -0.15, frameY: 0 },
    },
    {
      at: 0.563,
      name: 'números · sostén',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 0, height: 3, distance: 15, frameX: 0, frameY: 0 },
    },

    // ── Tramo 4 · Portfolio ──────────────────────────────────────────────────
    {
      at: 0.592,
      name: 'portfolio · arco de aproximación',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 26, height: -2, distance: 13, frameX: -0.4, frameY: 0 },
    },
    {
      at: 0.625,
      name: 'portfolio',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 56, height: 8.6, distance: 7.5, frameX: -1, frameY: 0 },
    },
    {
      at: 0.646,
      name: 'portfolio · sostén',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 56, height: 8.6, distance: 7.5, frameX: -1, frameY: 0 },
    },

    // ── Tramo 5 · Demos ──────────────────────────────────────────────────────
    {
      at: 0.678,
      name: 'demos · giro ¼',
      derived: true,
      ease: 'linear',
      turn: 'literal',
      pose: { angleDeg: 146, height: 2, distance: 8.5, frameX: -0.5, frameY: 0 },
    },
    {
      at: 0.697,
      name: 'demos · giro ½',
      derived: true,
      ease: 'linear',
      turn: 'literal',
      pose: { angleDeg: 191, height: -3.9, distance: 8.6, frameX: 0.1, frameY: 0 },
    },
    {
      at: 0.716,
      name: 'demos · giro ¾',
      derived: true,
      ease: 'linear',
      turn: 'literal',
      pose: { angleDeg: 236, height: -3.9, distance: 7.5, frameX: -0.5, frameY: 0 },
    },
    {
      at: 0.75,
      name: 'demos',
      derived: true,
      ease: 'shift',
      turn: 'literal',
      pose: { angleDeg: 326, height: -3.9, distance: 7, frameX: 1, frameY: 0 },
    },
    {
      at: 0.788,
      name: 'demos · sostén',
      derived: true,
      ease: 'shift',
      turn: 'literal',
      pose: { angleDeg: 326, height: -3.9, distance: 7, frameX: 1, frameY: 0 },
    },

    // ── Tramo 6 · Movimiento final + cierre ──────────────────────────────────
    {
      at: 0.808,
      name: 'final · arco de subida',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 316, height: -1, distance: 9.5, frameX: 0.9, frameY: 0 },
    },
    {
      at: 0.828,
      name: 'final · se levanta',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 326, height: 8.6, distance: 8, frameX: 0.95, frameY: 0 },
    },
    {
      at: 0.852,
      name: 'final · gira',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 352, height: 6, distance: 9, frameX: 0.3, frameY: 0 },
    },
    {
      at: 0.872,
      name: 'cierre · arco de retirada',
      derived: true,
      ease: 'linear',
      pose: { angleDeg: 360, height: 9, distance: 13, frameX: 0, frameY: 0 },
    },
    {
      at: 0.89,
      name: 'cierre · sostén',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 360, height: -1.4, distance: 18, frameX: 0, frameY: 0 },
    },
    {
      at: 1,
      name: 'cierre',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 360, height: -1.4, distance: 18, frameX: 0, frameY: 0 },
    },
  ],
}
