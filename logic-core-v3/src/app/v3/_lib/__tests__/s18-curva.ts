import { readFileSync } from 'node:fs'
import path from 'node:path'

import { RAIZ } from './s4-corrida'

/**
 * DESLIZAR · LAS DOS CURVAS, PARA LOS INSTRUMENTOS.
 *
 * ── ⚠️ QUÉ CAMBIÓ EN DESLIZAR-2, Y POR QUÉ ESTE ARCHIVO SE REESCRIBIÓ ─────
 *
 * En DESLIZAR-1 había UNA curva: el viaje heredaba la del sitio vivo, y este
 * archivo existía para poder muestrearla sin importarla. **Desde DESLIZAR-2 hay
 * dos**, y la reescritura no borra la afirmación vieja —la mueve de sujeto:
 *
 *   · **la de la RUEDA** sigue siendo `OPCIONES_DE_LENIS.easing`, un expoOut, y
 *     sigue siendo la que gobierna todo gesto. Lo que antes se afirmaba del viaje
 *     ahora se afirma de ella, y con más fuerza: que el sprint **no la movió**;
 *   · **la del VIAJE** es `CURVAS.simetrica` (`power1.inOut`), del vocabulario de
 *     develOP. Ésa **sí se puede importar** —`curvas.ts` no toca CSS— así que no
 *     hay copia de ella acá y no hace falta.
 *
 * ── Por qué la de la rueda hay que copiarla y la del viaje no ─────────────
 *
 * `SmoothScroll.tsx` hace `import 'lenis/dist/lenis.css'` en su línea 5, y `tsx`
 * levanta `SyntaxError: Unexpected identifier 'body'` al toparse con la hoja: es
 * el límite que `v3/layout.tsx` ya declara con esas palabras —*«un componente que
 * importa un `.css` no se puede cargar desde una comprobación con `tsx`»*—. Así
 * que `OPCIONES_DE_LENIS` no se puede importar ni desde un invariante ni desde un
 * script, y la salida es la que `s18-compuertas.invariant.ts` §3b ya usa contra
 * ese mismo archivo: **leerlo como TEXTO**.
 *
 * Las dos mitades de esa copia:
 *
 *   1. `LINEA_DE_LA_CURVA_EN_EL_SITIO_VIVO` — la línea exacta que el producto
 *      tiene que tener, carácter por carácter;
 *   2. `CURVA_DE_LA_RUEDA` — la misma función escrita acá, para evaluarla.
 *
 * La copia no puede desviarse en silencio: `s18-deslizamiento.invariant` §4
 * compara la mitad 1 contra el fuente del producto **y** muestrea la mitad 2
 * contra el expoOut canónico.
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
 * LA CURVA DE LA RUEDA, EVALUABLE — la del sitio vivo, y el sprint no la toca.
 *
 * Es un expoOut: `1 − 2^(−10t)`, con el `1,001` de escala y el `min` que la
 * librería usa para que toque el 1 **antes** del final en vez de acercarse
 * asintóticamente. El precio de ese truco está medido: la curva vale 1 a partir
 * de t = 0,996578.
 *
 * ⚠ Y su rasgo importante para DESLIZAR-2: **arranca a velocidad máxima**. La
 * derivada en `t = 0` vale `10 ln 2 = 6,9315`, que es lo correcto para un gesto
 * —una rueda tiene que responder en el primer cuadro— y es exactamente lo que un
 * viaje programático NO quiere.
 */
export const CURVA_DE_LA_RUEDA = (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t))

/** El expoOut canónico, sin el truco de la librería. Es la vara contra la que se
 *  juzga que la de arriba PERTENECE a la familia, y no la copia de la copia. */
export const EXPO_OUT_CANONICO = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

/**
 * LA VELOCIDAD INSTANTÁNEA DE UNA CURVA, por diferencias centradas.
 *
 * En unidades de «fracción del camino por fracción del tiempo», o sea que 1 es la
 * velocidad media. Sirve para las dos cosas que el sprint necesita afirmar: que
 * la curva del viaje **arranca en cero** y cuánto vale su pico sobre la media.
 *
 * `h` chico y centrado a propósito: una diferencia hacia adelante en `t = 0`
 * sobreestima el arranque de una cuadrática justo donde importa.
 */
export function velocidadDe(curva: (t: number) => number, t: number, h = 1e-6): number {
  const a = Math.max(0, t - h)
  const b = Math.min(1, t + h)
  return (curva(b) - curva(a)) / (b - a)
}

/** El pico de velocidad de una curva sobre la grilla, y dónde cae. */
export function picoDeVelocidad(
  curva: (t: number) => number,
  muestras = 2000,
): { readonly pico: number; readonly en: number } {
  let pico = 0
  let en = 0
  for (let i = 0; i <= muestras; i += 1) {
    const t = i / muestras
    const v = velocidadDe(curva, t)
    if (v > pico) {
      pico = v
      en = t
    }
  }
  return { pico, en }
}
