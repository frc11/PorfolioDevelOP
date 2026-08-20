import type { ChoreoVariant } from './choreographyTypes'
import {
  ARQUITECTONICA_DOC,
  ARQUITECTONICA_NOTES,
  ARQUITECTONICA_SECTIONS,
} from './variantNotes'

/**
 * VARIANTE · ARQUITECTÓNICA — el espacio es el protagonista.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * LA TESIS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * **El logo pequeño en un lugar grande.** Distancias largas, aire alrededor, y
 * todo lo que S5 construyó —los once planos suspendidos, la retícula del techo,
 * los tres pilares, las marcas de replanteo del piso— entrando en cuadro de
 * verdad en vez de asomando por los costados. Es la variante que responde a la
 * pregunta "¿para qué se construyó todo eso si nunca se ve?".
 *
 * ── Qué la define, en tres números ─────────────────────────────────────────
 *
 * | | base calibrada | arquitectónica |
 * |---|---:|---:|
 * | distancias | 7 a 16 | **11,5 a 29** |
 * | alto del logo en cuadro | 65% a 142% | **37% a 98%** |
 * | veces que el logo DESBORDA el cuadro | 21 de 30 | **0 de 28** |
 *
 * **El logo nunca desborda.** Ese es el compromiso de la variante: en toda pose
 * se lo ve entero, con espacio alrededor, y ese espacio es la escena.
 *
 * ── La restricción que la gobierna, y es geométrica ────────────────────────
 *
 * > **Un plano suspendido no puede quedar ENTRE la cámara y el logo.**
 *
 * Los once planos viven entre radio 11,8 y 22. La base nunca pasa de 16, así que
 * el problema no existía; esta variante llega a 29 y ahí sí. La regla que la
 * hace sana es la de S5, aplicada al revés:
 *
 * - **Las poses lejanas viven en la cuña libre** — el sector de ±40° del eje
 *   frontal donde no hay ningún plano. Ahí la distancia puede ser cualquiera.
 * - **Las poses que se salen de la cuña se quedan por debajo de 11,8**, o sea
 *   por dentro del anillo entero. Si la cámara está más cerca que TODOS los
 *   planos, ninguno puede interponerse.
 *
 * **Ese 11,8 es el que ordena el giro entero.** Demos gira a 11,5 y no a 14 por
 * esta razón y no por gusto — es la restricción que la escena de S5 le impone a
 * cualquier recorrido que quiera abrirse fuera del frente. Verificado pose por
 * pose contra la caja orientada de los once planos: el más cerca pasa a 3,09 de
 * mundo del segmento cámara→logo.
 *
 * ── Las tres decisiones propias ────────────────────────────────────────────
 *
 * 1. **La cámara sube.** Alturas de 1,8 a 9 en las pantallas de contenido, con
 *    picados francos: desde arriba se ve el PISO, y el piso es donde están las
 *    marcas de replanteo, las cotas y la escala graduada. En la base ese dibujo
 *    casi nunca entra al cuadro.
 * 2. **El giro se abre.** Demos gira a 11,5 de distancia en vez de 7, así que la
 *    vuelta muestra el ESPACIO girando alrededor del logo y no el logo girando
 *    contra un fondo indistinto. Es la diferencia entre orbitar un objeto y
 *    recorrer una sala. Más lejos no puede ir: ahí empieza el anillo de planos.
 * 3. **El cierre a 29.** El logo queda en el 39% del alto del cuadro, con la
 *    retícula del techo entrando por arriba y los pilares a los costados. Deja
 *    más aire para texto que ninguna otra variante — y es la que más
 *    explícitamente dice "esto es un lugar".
 *
 * ── Lo que hereda de la base y no se discute ───────────────────────────────
 *
 * Los seis tramos, las ocho pantallas, los bordes en múltiplos de 1/8, la vuelta
 * entera de 360° dentro de Demos y el patrón de sostén.
 *
 * ⚠️ **Todas las poses van `derived: true`**: son propuestas calculadas, no
 * composiciones. La base calibrada sigue intacta.
 */
export const VARIANT_ARQUITECTONICA: ChoreoVariant = {
  id: 'arquitectonica',
  label: 'arquitectónica',
  thesis: 'Distancias largas y aire: el logo pequeño en un lugar grande, con la sala en cuadro.',
  constName: 'VARIANT_ARQUITECTONICA_KEYFRAMES',
  file: 'variantArquitectonica.ts',

  doc: ARQUITECTONICA_DOC,
  sections: ARQUITECTONICA_SECTIONS,
  notes: ARQUITECTONICA_NOTES,

  keyframes: [
    // ── Tramo 1 · Hero ───────────────────────────────────────────────────────
    {
      at: 0,
      name: 'entrada · la sala entera',
      derived: true,
      pose: { angleDeg: 0, height: 9, distance: 29, frameX: 0.35, frameY: 0 },
    },
    {
      at: 0.07,
      name: 'hero · arco de bajada',
      derived: true,
      ease: 'linear',
      pose: { angleDeg: -12, height: 6.4, distance: 26, frameX: 0.45, frameY: 0 },
    },
    {
      at: 0.125,
      name: 'hero',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 0, height: 1.8, distance: 20, frameX: 0.62, frameY: 0 },
    },
    {
      at: 0.188,
      name: 'hero · sostén',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 0, height: 1.8, distance: 20, frameX: 0.62, frameY: 0 },
    },

    // ── Tramo 2 · Quiénes somos (dos personas) ───────────────────────────────
    {
      at: 0.222,
      name: 'quiénes somos · arco de entrada',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 10, height: 4.6, distance: 18.5, frameX: 0.2, frameY: 0 },
    },
    {
      at: 0.25,
      name: 'quiénes somos · persona 1',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 0, height: 6.5, distance: 15.5, frameX: -0.75, frameY: 0 },
    },
    {
      at: 0.3,
      name: 'persona 1 · sostén',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 0, height: 6.5, distance: 15.5, frameX: -0.75, frameY: 0 },
    },
    {
      at: 0.338,
      name: 'persona 2 · cruce',
      derived: true,
      ease: 'linear',
      pose: { angleDeg: -8, height: 8.2, distance: 17.5, frameX: 0, frameY: 0 },
    },
    {
      at: 0.375,
      name: 'quiénes somos · persona 2',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 0, height: 6.5, distance: 15.5, frameX: 0.75, frameY: 0 },
    },

    // ── Tramo 3 · Números ────────────────────────────────────────────────────
    {
      at: 0.42,
      name: 'números · arco de caída',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 4, height: 1.2, distance: 17, frameX: 0.5, frameY: 0 },
    },
    {
      at: 0.46,
      name: 'números · baja',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 4, height: -3.4, distance: 14.5, frameX: 0.35, frameY: 0 },
    },
    {
      at: 0.5,
      name: 'números',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 0, height: 2.4, distance: 23, frameX: 0, frameY: 0 },
    },
    {
      at: 0.532,
      name: 'números · deriva en arco',
      derived: true,
      ease: 'linear',
      pose: { angleDeg: -10, height: 3.6, distance: 25.5, frameX: -0.1, frameY: 0 },
    },
    {
      at: 0.563,
      name: 'números · sostén',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 0, height: 2.2, distance: 21, frameX: 0, frameY: 0 },
    },

    // ── Tramo 4 · Portfolio ──────────────────────────────────────────────────
    {
      at: 0.592,
      name: 'portfolio · arco de aproximación',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 22, height: 4.6, distance: 18, frameX: -0.35, frameY: 0 },
    },
    {
      at: 0.625,
      name: 'portfolio',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 42, height: 8.4, distance: 11.5, frameX: -1, frameY: 0 },
    },
    {
      at: 0.648,
      name: 'portfolio · sostén',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 42, height: 8.4, distance: 11.5, frameX: -1, frameY: 0 },
    },

    // ── Tramo 5 · Demos ──────────────────────────────────────────────────────
    {
      at: 0.679,
      name: 'demos · giro ¼',
      derived: true,
      ease: 'linear',
      turn: 'literal',
      pose: { angleDeg: 132, height: 4.2, distance: 11.5, frameX: -0.6, frameY: 0 },
    },
    {
      at: 0.697,
      name: 'demos · giro ½',
      derived: true,
      ease: 'linear',
      turn: 'literal',
      pose: { angleDeg: 177, height: -1.2, distance: 11.5, frameX: 0, frameY: 0 },
    },
    {
      at: 0.715,
      name: 'demos · giro ¾',
      derived: true,
      ease: 'linear',
      turn: 'literal',
      pose: { angleDeg: 222, height: -3.6, distance: 11.5, frameX: -0.6, frameY: 0 },
    },
    {
      at: 0.75,
      name: 'demos',
      derived: true,
      ease: 'shift',
      turn: 'literal',
      pose: { angleDeg: 312, height: -3, distance: 11.5, frameX: 0.9, frameY: 0 },
    },
    {
      at: 0.788,
      name: 'demos · sostén',
      derived: true,
      ease: 'shift',
      turn: 'literal',
      pose: { angleDeg: 312, height: -3, distance: 11.5, frameX: 0.9, frameY: 0 },
    },

    // ── Tramo 6 · Movimiento final + cierre ──────────────────────────────────
    {
      at: 0.81,
      name: 'final · arco de subida',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 303, height: 2.2, distance: 11.5, frameX: 0.8, frameY: 0 },
    },
    {
      at: 0.828,
      name: 'final · se levanta',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 312, height: 7.6, distance: 11.5, frameX: 0.85, frameY: 0 },
    },
    {
      at: 0.852,
      name: 'final · gira',
      derived: true,
      ease: 'shift',
      pose: { angleDeg: 352, height: 7, distance: 15.5, frameX: 0.25, frameY: 0 },
    },
    {
      at: 0.87,
      name: 'cierre · arco de retirada',
      derived: true,
      ease: 'linear',
      pose: { angleDeg: 360, height: 8.4, distance: 21, frameX: 0, frameY: 0 },
    },
    {
      at: 0.89,
      name: 'cierre · sostén',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 360, height: 3.6, distance: 29, frameX: 0, frameY: 0 },
    },
    {
      at: 1,
      name: 'cierre',
      derived: true,
      ease: 'arrive',
      pose: { angleDeg: 360, height: 3.6, distance: 29, frameX: 0, frameY: 0 },
    },
  ],
}
