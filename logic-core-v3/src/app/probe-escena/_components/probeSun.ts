import { clamp01 } from './probeScene'

/**
 * EL SOL (S7) — el cuerpo de la luz principal.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * NO ES UN OBJETO MÁS DE LA ESCENA: ES LA KEY, DIBUJADA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * La escena tenía luz sin fuente. Un espacio abstracto sin un solo elemento
 * cotidiano se lee como un render; poner **la fuente a la vista** es lo que le
 * da realismo espacial, porque la sombra pasa a venir de algún lado que se ve.
 *
 * Por eso la posición del sol NO vive acá: vive en `LIGHT_ARC`
 * (`choreography.ts`), junto con el nivel y la temperatura, y `lightRig.ts`
 * coloca la luz y el cuerpo sobre **la misma dirección** en el mismo frame. Un
 * sprite dibujado por un lado y una direccional por el otro serían dos soles, y
 * en cuanto uno se moviera la sombra dejaría de coincidir con la fuente.
 *
 * Acá viven solo las tres cosas que son del CUERPO y no de la luz: a qué
 * distancia se lo dibuja, qué tamaño tiene y qué forma tiene su disco.
 *
 * ── Por qué a distancia finita, y no "en el infinito" ──────────────────────
 *
 * Un sol de verdad está en el infinito, y una `DirectionalLight` también. Se lo
 * podría dibujar clavado a la cámara para reproducir eso: sin paralaje, siempre
 * exactamente sobre el eje de la luz.
 *
 * **No conviene, por dos razones concretas.** Un cuerpo a distancia fija de una
 * cámara que se mueve entra y sale de la geometría (cruzaría la retícula del
 * techo, los planos, la pared del ciclorama) de forma impredecible. Y sin
 * paralaje el sol no pertenece al espacio: se lee como una calcomanía sobre el
 * lente. A 34 unidades el sol es un cuerpo de la sala —lo tapan las barras del
 * techo, lo tapan los planos— y la dirección sigue coincidiendo con la de la
 * luz **en el origen, que es donde está el logo y donde la coincidencia se
 * lee**.
 *
 * ── Blanco sobre blanco: por qué el sol es GRANDE ──────────────────────────
 *
 * Este set es papel claro, así que hay un techo duro: el píxel más brillante
 * posible es 255 y el papel a luz plena ya está en 248. Medido contra el
 * shading real de la escena:
 *
 * | | valor |
 * |---|---:|
 * | el sol (blanco, sin tone mapping, con niebla) | **254/255** |
 * | la pared del ciclorama DETRÁS del sol | **213/255** |
 * | el piso de papel a luz plena | 248/255 |
 *
 * Los 41 puntos de contraste salen de un hecho estructural y no de una perilla:
 * **la pared contra la que se ve el sol es, por construcción, la única que el
 * sol no ilumina** (su normal apunta en contra, así que N·L < 0). El sol
 * siempre se recorta contra su propia sombra.
 *
 * Cuarenta y un puntos alcanzan para un disco, no para un destello. Por eso la
 * forma la da el TAMAÑO y el DEGRADÉ, no el brillo: núcleo chico y halo ancho.
 *
 * ── "Parcial, nunca completo" ──────────────────────────────────────────────
 *
 * En el momento de máxima visibilidad el núcleo mide **9,4° de diámetro — el
 * 27% del alto del cuadro** (un sol reconocible, que no le disputa el cuadro al
 * logo) y el halo mide **41°, o sea el 117%**: el halo NUNCA entra entero,
 * siempre lo corta el borde. Es la regla del sprint, resuelta con dos radios.
 */

// ── Dónde y cuánto ──────────────────────────────────────────────────────────

/**
 * Distancia del cuerpo al origen. La dirección la da `LIGHT_ARC`.
 *
 * 34 no es libre: es el valor que deja al sol **fuera del anillo de planos
 * suspendidos** (radio máximo 22, así que nunca queda adentro de uno), **dentro
 * del cuadrado de la retícula aérea** (±31 en X y en Z, así que las barras del
 * techo lo cruzan por delante y la oclusión sale gratis) y **por delante de la
 * pantalla de rendijas** (radio 38), que le da un fondo con textura en vez de
 * pared lisa. A lo largo del arco su radio horizontal va de 27,5 a 33,3.
 */
export const SUN_RADIUS = 34

/**
 * Radio del sprite, en unidades de mundo. Es el radio del HALO; el núcleo es la
 * fracción de abajo.
 *
 * A la distancia del momento de máxima visibilidad (42,7) esto da 41° de
 * diámetro: más que el alto del cuadro. Es deliberado — ver "parcial, nunca
 * completo" arriba.
 */
export const SUN_SPRITE_RADIUS = 16

/** Fracción del radio con densidad plena: el disco del sol propiamente dicho. */
export const SUN_CORE = 0.22
/**
 * Exponente de la caída del halo fuera del núcleo. Más alto = halo más cerrado
 * y más "disco"; más bajo = más veladura.
 */
export const SUN_GLOW_FALLOFF = 2.4
/** Opacidad del halo en el borde del núcleo, antes de la caída. */
export const SUN_GLOW_OPACITY = 0.5

export const SUN_SPRITE_SIZE = 128

/**
 * El sol es blanco, no cálido. La temperatura de la escena la lleva la luz que
 * él mismo emite (`kelvin` en `LIGHT_ARC`), y teñir además el cuerpo sería
 * contar la misma cosa dos veces — con el agravante de que a 7700 K el disco se
 * pondría azul, que es exactamente lo que un sol no hace.
 */
export const SUN_COLOR = '#FFFFFF'

/**
 * Cuánto se apaga el cuerpo cuando baja el arco.
 *
 * **Proporcional al nivel, sin excepción**: el sol ES la principal, y la
 * principal baja proporcional (ver `probeLighting.ts`). Cualquier otra pendiente
 * haría que el cuerpo y su luz contaran historias distintas.
 *
 * En el cierre el nivel es 0,34: el sol queda al 34% de opacidad, bajo sobre el
 * horizonte y apenas visible. Es lo que tiene que pasar.
 */
export function sunOpacityFor(level: number): number {
  return clamp01(level)
}

// ── La forma del disco ──────────────────────────────────────────────────────

/**
 * La máscara del sol, como RGBA crudo. Es el cuarto generador de sprite del
 * módulo —después del polvo, el bokeh y la oclusión de contacto— y el único con
 * DOS regímenes:
 *
 * - hasta `core`: alfa 1. Es el disco, y tiene borde: el sol de un cielo con
 *   algo de bruma no se difumina, se corta.
 * - de `core` hacia afuera: cae desde `glow` con exponente. Es el halo
 *   atmosférico, y es lo que hace que el sol se lea aunque el fondo esté a 40
 *   puntos de distancia en un canvas de 255.
 *
 * El escalón entre 1 y `glow` en el borde del núcleo **es el efecto**: sin él,
 * un degradé continuo desde el centro se lee como una mancha de niebla y no
 * como una fuente. Se suaviza sobre dos téxeles para que el escalón no aliase.
 *
 * Pura, igual que los otros tres: puede vivir en un `useMemo` sin violar
 * `react-hooks/purity`.
 */
export function createSunSpriteData(
  size: number,
  core: number,
  glow: number,
  falloff: number
): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  const center = (size - 1) / 2
  const radius = size / 2
  const tail = Math.max(1e-6, 1 - core)
  // Dos téxeles de suavizado en el borde del núcleo, en unidades de radio.
  const soften = 2 / radius

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - center) / radius
      const dy = (y - center) / radius
      const distance = Math.sqrt(dx * dx + dy * dy)

      const halo = glow * Math.pow(clamp01((1 - distance) / tail), falloff)
      // Mezcla del núcleo al halo sobre `soften`, para que el canto del disco
      // tenga un borde de dos téxeles en vez de un escalón duro.
      const coreMix = clamp01((core + soften - distance) / (2 * soften))
      const alpha = halo + (1 - halo) * coreMix

      const i = (y * size + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = Math.round(clamp01(alpha) * 255)
    }
  }

  return data
}
