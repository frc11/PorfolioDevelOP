import type { ChoreoVariant } from '@/app/v3/_lib/escena/choreographyTypes'
import {
  INTIMA_DOC,
  INTIMA_NOTES,
  INTIMA_SECTIONS,
} from './variantNotes'

/**
 * VARIANTE · ÍNTIMA — el objeto llena el cuadro.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * LA TESIS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * **La escena se intuye entre los bordes del logo, no se muestra.** Distancias
 * cortas, el objeto ocupando más alto que el cuadro durante buena parte del
 * recorrido, y el espacio apareciendo en la franja que queda libre. Es la
 * variante donde la marca es arquitectura y no un objeto sobre una mesa.
 *
 * ── Qué la define, en tres números ─────────────────────────────────────────
 *
 * | | base calibrada | íntima |
 * |---|---:|---:|
 * | distancias | 7 a 16 | **6,4 a 11,5** |
 * | alto del logo en cuadro | 65% a 142% | **86% a 168%** |
 * | veces que el logo DESBORDA el cuadro | 21 de 30 (70%) | **21 de 24 (88%)** |
 *
 * A distancia 6,4 el logo mide un 68% más que el alto del cuadro: lo que se ve
 * es un fragmento — un canto, una curva, el borde de la extrusión— y el espacio
 * entra por el costado. Eso no es un defecto de encuadre, es la propuesta.
 *
 * La diferencia con la base no es que ésta desborde y aquélla no —la base
 * también desborda en dos tercios de sus poses— sino **cuánto**: donde la base
 * baja hasta el 65%, la íntima no baja del 86%. Nunca hay aire de sobra.
 *
 * ── Las tres decisiones propias ────────────────────────────────────────────
 *
 * 1. **El encuadre trabaja al máximo.** `frameX` vive en ±0,85 a ±1: con el
 *    logo desbordando, la única forma de que quede espacio para el contenido es
 *    empujarlo entero contra un costado. En la base el encuadre es un ajuste;
 *    acá es estructural.
 * 2. **Los ángulos se abren temprano.** La base pasa medio recorrido en azimut
 *    0; ésta se corre a −26° y +22° ya en "quiénes somos", porque de cerca un
 *    ángulo de tres cuartos muestra el canto y el canto es lo que da volumen. De
 *    frente y a 6,4 el logo se lee plano.
 * 3. **Números es el único respiro.** En 0,500 la cámara se va a 11,2 —la
 *    distancia más larga de la variante— y el logo entra entero por primera vez.
 *    Un recorrido que nunca muestra el objeto completo no tiene con qué comparar
 *    los fragmentos.
 *
 * ── Lo que hereda de la base y no se discute ───────────────────────────────
 *
 * Los seis tramos, las ocho pantallas, los bordes en múltiplos de 1/8, la vuelta
 * entera de 360° dentro de Demos y el patrón de sostén en las pantallas donde
 * hay contenido que leer.
 *
 * ⚠️ **Todas las poses van `derived: true`, y no es una formalidad.** Ninguna
 * fue compuesta por el humano mirando la escena: son una propuesta calculada. La
 * base calibrada sigue intacta y es la que se carga por default.
 */
export const VARIANT_INTIMA: ChoreoVariant = {
  id: 'intima',
  label: 'íntima',
  thesis: 'Distancias cortas: el logo llena el cuadro y el espacio se intuye entre sus bordes.',
  constName: 'VARIANT_INTIMA_KEYFRAMES',
  file: 'variantIntima.ts',

  doc: INTIMA_DOC,
  sections: INTIMA_SECTIONS,
  notes: INTIMA_NOTES,

  keyframes: [
    // ── Tramo 1 · Hero ───────────────────────────────────────────────────────
    {
      at: 0,
      name: 'entrada · sobre el canto',
      derived: true,
      pose: { angleDeg: 0, height: 6.6, distance: 11.5, frameX: 0.5, frameY: 0 },
    },
    {
      at: 0.062,
      name: 'hero · arco de bajada',
      derived: true,
      ease: 'linear',
      pose: { angleDeg: -9, height: 3.4, distance: 10.8, frameX: 0.72, frameY: 0 },
    },
    {
      at: 0.125,
      name: 'hero',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 0, height: -0.4, distance: 7.6, frameX: 0.85, frameY: 0 },
    },
    {
      at: 0.188,
      name: 'hero · sostén',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 0, height: -0.4, distance: 7.6, frameX: 0.85, frameY: 0 },
    },

    // ── Tramo 2 · Quiénes somos (dos personas) ───────────────────────────────
    {
      at: 0.25,
      name: 'quiénes somos · persona 1',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: -26, height: 2.2, distance: 6.6, frameX: -0.92, frameY: 0 },
    },
    {
      at: 0.3,
      name: 'persona 1 · sostén',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: -26, height: 2.2, distance: 6.6, frameX: -0.92, frameY: 0 },
    },
    {
      at: 0.335,
      name: 'persona 2 · cruce',
      derived: true,
      ease: 'linear',
      pose: { angleDeg: -6, height: 3.6, distance: 8.4, frameX: 0, frameY: 0 },
    },
    {
      at: 0.375,
      name: 'quiénes somos · persona 2',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 22, height: 2.2, distance: 6.6, frameX: 0.92, frameY: 0 },
    },

    // ── Tramo 3 · Números ────────────────────────────────────────────────────
    {
      at: 0.438,
      name: 'números · al ras',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 22, height: -3.4, distance: 6.4, frameX: 0.55, frameY: 0 },
    },
    {
      at: 0.5,
      name: 'números',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 6, height: 0.6, distance: 11.2, frameX: 0, frameY: 0 },
    },
    {
      at: 0.563,
      name: 'números · sostén',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 6, height: 0.2, distance: 10.2, frameX: 0, frameY: 0 },
    },

    // ── Tramo 4 · Portfolio ──────────────────────────────────────────────────
    {
      at: 0.59,
      name: 'portfolio · arco de aproximación',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 34, height: 3.6, distance: 8.6, frameX: -0.55, frameY: 0 },
    },
    {
      at: 0.625,
      name: 'portfolio',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 62, height: 3.4, distance: 6.4, frameX: -1, frameY: 0 },
    },
    {
      at: 0.66,
      name: 'portfolio · sostén',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 62, height: 3.4, distance: 6.4, frameX: -1, frameY: 0 },
    },

    // ── Tramo 5 · Demos ──────────────────────────────────────────────────────
    {
      at: 0.688,
      name: 'demos · giro ¼',
      derived: true,
      ease: 'linear',
      turn: 'literal',
      pose: { angleDeg: 130, height: 1.4, distance: 6.6, frameX: -0.4, frameY: 0 },
    },
    {
      at: 0.706,
      name: 'demos · giro ½',
      derived: true,
      ease: 'linear',
      turn: 'literal',
      pose: { angleDeg: 197, height: -2.6, distance: 7.2, frameX: 0.1, frameY: 0 },
    },
    {
      at: 0.724,
      name: 'demos · giro ¾',
      derived: true,
      ease: 'linear',
      turn: 'literal',
      pose: { angleDeg: 265, height: -3.6, distance: 6.6, frameX: -0.4, frameY: 0 },
    },
    {
      at: 0.75,
      name: 'demos',
      derived: true,
      ease: 'shift',
      turn: 'literal',
      pose: { angleDeg: 332, height: -3.2, distance: 6.4, frameX: 1, frameY: 0 },
    },
    {
      at: 0.788,
      name: 'demos · sostén',
      derived: true,
      ease: 'shift',
      turn: 'literal',
      pose: { angleDeg: 332, height: -3.2, distance: 6.4, frameX: 1, frameY: 0 },
    },

    // ── Tramo 6 · Movimiento final + cierre ──────────────────────────────────
    {
      at: 0.812,
      name: 'final · arco de subida',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 324, height: 0.4, distance: 8, frameX: 0.85, frameY: 0 },
    },
    {
      at: 0.83,
      name: 'final · se levanta',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 332, height: 4.4, distance: 6.6, frameX: 0.9, frameY: 0 },
    },
    {
      at: 0.862,
      name: 'final · gira',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 346, height: 4, distance: 7.4, frameX: 0.3, frameY: 0 },
    },
    {
      at: 0.89,
      name: 'cierre · sostén',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 360, height: 1.6, distance: 11.5, frameX: 0, frameY: 0 },
    },
    {
      at: 1,
      name: 'cierre',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 360, height: 1.6, distance: 11.5, frameX: 0, frameY: 0 },
    },
  ],
}
