/**
 * La marca de develOP como SVG inline — UNA sola copia del path en todo el
 * sitio público nuevo.
 *
 * Por qué inline y no `<img src="/logodevelOP.svg">`: el fill hereda
 * `currentColor`, así que la marca invierte con el tema (y con la inversión
 * cromática del intro) sin duplicar assets ni filtros CSS. Y por ser parte del
 * HTML del documento, se pinta en el primer paint — sin request extra, sin
 * hueco mientras baja.
 *
 * El path es el de `public/logodevelOP.svg` (el asset canónico de marca, B0b
 * §B4), con su `viewBox` original de 1024×1024 intacto — el mismo que extrude
 * el mesh 3D. Si el asset de marca cambia, se actualizan los dos a la vez.
 *
 * Server Component a propósito (sin `'use client'`): es marcado puro y no
 * debe costar un byte de JS. Decorativo por default — quien lo monte decide si
 * aporta significado; hoy los dos consumidores (intro y hero) lo tratan como
 * ornamento porque el nombre de la marca ya está en texto al lado.
 */

/**
 * El path, exportado, para que el trazo del preloader (S8) dibuje EXACTAMENTE
 * la misma marca sin una segunda copia de estos 493 caracteres.
 *
 * **Es un solo subpath cerrado** (un `M`, un `z`, sin `M` internos): por eso se
 * puede dibujar con una sola pasada de lápiz continua, y por eso
 * `stroke-dashoffset` sobre `pathLength="1"` alcanza — sin la `pathLength` cara
 * de Framer, que `CLAUDE.md` prohíbe para paths complejos.
 *
 * ⚠ Quedan otras dos copias del mismo path en `src`, las dos PREEXISTENTES y
 * ninguna tocada por S8: `ui/LogoStrokeOverlay.tsx` (Route B / marketing — ese
 * camino no se toca) y `sections/home/Footer.tsx`. Más el asset canónico,
 * `public/logodevelOP.svg`, que es el que extrude el mesh 3D. Si la marca
 * cambia, son cuatro lugares.
 */
export const LOGO_PATH_D =
  'M532 700v-67q0-6 3-10l54-98q0-3 4-4l4 5q13 27 34 48 35 35 83 41a153 153 0 0 0 86-288c-62-28-134-13-178 39q-20 24-33 52l-57 127q-16 38-40 71-63 86-166 105-92 16-173-30A257 257 0 0 1 38 371a258 258 0 0 1 210-164 257 257 0 0 1 233 92q5 6 1 10l-52 93-1 1q-4 8-8 0l-7-13q-37-62-108-75-66-10-118 30-43 33-55 86-16 76 35 136 37 41 91 48 83 11 139-53 18-23 29-49l51-111q18-44 44-83a257 257 0 0 1 201-113q96-5 171 52a256 256 0 0 1 69 336 262 262 0 0 1-298 121q-8-4-7 6l-1 100 1 58q1 8-6 6H538q-7 1-6-7z'

/**
 * LA CAJA DE LA TINTA, en unidades del viewBox de 1024 — el dato que hace que
 * el SVG y el mesh 3D se puedan superponer sin un salto (S8b).
 *
 * **La tinta NO llena el viewBox y NO está centrada en él**: mide 978,5 × 680,7
 * y su centro cae en (509,1 · 545,1), o sea **33 unidades por debajo** del
 * centro del cuadrado. Sobre un logo de 548 px eso son 18 px de desfase
 * vertical — la diferencia entre un relevo invisible y uno que se ve saltar.
 *
 * De dónde salen los números: se aplanó el path (cúbicas, cuadráticas y arcos
 * elípticos por la parametrización de centro de la spec, 400 muestras por
 * segmento) y se tomó el extremo de cada eje. Contraverificación contra la
 * medición que `PROBE-ESCENA.md` publica del mesh **extruido**: sumándole el
 * bisel de `PROBE_EXTRUDE` (1 unidad por lado, o sea +2 en cada dimensión) y
 * escalando por 0,007 da **6,863 × 4,779** de mundo, contra los 6,86 × 4,78
 * publicados. Las dos mediciones son independientes y coinciden.
 *
 * El centro de esta caja es el ORIGEN del logo de la escena: `ProbeLogo` centra
 * la geometría en su propia caja antes de ponerla en el origen. Por eso la
 * proyección de `lib/scene-framing.ts` devuelve el centro de la TINTA y no el
 * del cuadrado.
 */
export const LOGO_INK_VIEWBOX = {
  x: 19.869,
  y: 204.73,
  width: 978.459,
  height: 680.67,
} as const

/** `viewBox` recortado a la tinta: el path llena el elemento, sin margen muerto. */
export const LOGO_INK_VIEWBOX_ATTR = `${LOGO_INK_VIEWBOX.x} ${LOGO_INK_VIEWBOX.y} ${LOGO_INK_VIEWBOX.width} ${LOGO_INK_VIEWBOX.height}`

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      className={className}
      fill="currentColor"
      role="presentation"
      focusable="false"
    >
      <path d={LOGO_PATH_D} />
    </svg>
  )
}
