import { readFileSync } from 'node:fs'
import path from 'node:path'

import { RAIZ } from './s4-corrida'

/**
 * DESLIZAR-1 · LA CURVA DEL DESLIZAMIENTO, PARA LOS INSTRUMENTOS.
 *
 * ── ⚠️ POR QUÉ ESTA COPIA EXISTE, Y POR QUÉ NO ES UNA SEGUNDA DEFINICIÓN ──
 *
 * El deslizamiento **no declara su curva**: la hereda de `OPCIONES_DE_LENIS`,
 * que es la del sitio vivo (ver `_componentes/deslizamiento.ts`). Un instrumento
 * que quiera MUESTREARLA —para sacar la velocidad de cámara, o para afirmar que
 * sigue siendo un expoOut— tendría que importarla, y **no puede**:
 * `SmoothScroll.tsx` hace `import 'lenis/dist/lenis.css'` en su línea 5, y `tsx`
 * levanta `SyntaxError: Unexpected identifier 'body'` al toparse con la hoja. Es
 * el límite que `v3/layout.tsx` ya declara con esas palabras: *«un componente que
 * importa un `.css` no se puede cargar desde una comprobación con `tsx`»*.
 *
 * La salida es la que `s18-compuertas.invariant.ts` §3b ya usa contra ese mismo
 * archivo: **se lo lee como TEXTO**. Acá van las dos mitades juntas:
 *
 *   1. `LINEA_DE_LA_CURVA_EN_EL_SITIO_VIVO` — la línea exacta que el producto
 *      tiene que tener, carácter por carácter;
 *   2. `CURVA_DEL_DESLIZAMIENTO` — la misma función escrita acá, para evaluarla.
 *
 * La copia no puede desviarse en silencio: `s18-deslizamiento.invariant` §4
 * compara la mitad 1 contra el fuente del producto **y** muestrea la mitad 2
 * contra el expoOut canónico. Si alguien recalibra el sitio vivo, el invariante
 * lo dice en vez de que el sprint se entere por la pantalla.
 */

const SITIO_VIVO = 'src/components/layout/SmoothScroll.tsx'

/** La línea de `OPCIONES_DE_LENIS`, tal cual está escrita en el producto. */
export const LINEA_DE_LA_CURVA_EN_EL_SITIO_VIVO =
  'easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),'

/** `true` si el producto sigue declarando esa línea. */
export function laCurvaSigueSiendoLaDelSitioVivo(): boolean {
  return readFileSync(path.join(RAIZ, SITIO_VIVO), 'utf8').includes(LINEA_DE_LA_CURVA_EN_EL_SITIO_VIVO)
}

/**
 * LA MISMA FUNCIÓN, EVALUABLE.
 *
 * Es un expoOut: `1 − 2^(−10t)`, con el `1,001` de escala y el `min` que la
 * librería usa para que toque el 1 **antes** del final en vez de acercarse
 * asintóticamente. El precio de ese truco está medido: la curva vale 1 a partir
 * de t = 0,996578, o sea que los últimos 6,8 ms de un viaje de 2.000 ya están
 * quietos.
 */
export const CURVA_DEL_DESLIZAMIENTO = (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t))

/** El expoOut canónico, sin el truco de la librería. Es la vara contra la que se
 *  juzga que la de arriba PERTENECE a la familia, y no la copia de la copia. */
export const EXPO_OUT_CANONICO = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
