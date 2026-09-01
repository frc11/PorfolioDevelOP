/**
 * §4 DE `s9-instrumentos.invariant.ts` — EL `scroll-padding-top` DEL SITIO
 * VIEJO, Y EL QUE `/v3` DECLARA ENCIMA.
 *
 * ── Por qué vive en su propio archivo ─────────────────────────────────────
 *
 * SITIO-S11 reescribió el §2 del invariante —el acoplamiento de tipo, que §7.36
 * pedía cerrar sin dejar afirmaciones verdaderas por vacío— y con eso el archivo
 * cruzó las 300 líneas del repo. Se partió por TEMA, en dos: el acoplamiento se
 * fue a `s9-acoplamiento.ts` y esta sección acá. Ninguna de las dos comparte una
 * constante con lo que quedó en el invariante —el marcador de los controles
 * positivos y las rutas de §7.13—, así que el corte no rompe ninguna lectura.
 *
 * Exporta UNA función y no corre nada al importarse: quien la llama es el
 * invariante, en el orden en que sus secciones se leen.
 */

import { DESTINOS_DE_LA_RUTA } from '../../_secciones/cierre/contenido'
import { BORDE_INFERIOR_EN_REPOSO_PX } from '../navegacion'

import { afirmar, afirmarIgual, controlPositivo, noCorre, titulo } from './afirmar'
import { resolver, tokensDelTema } from './s3-css'
import { aPx, declaracionCss, leer } from './s9-instrumentos'

export function afirmarElScrollPadding(): void {
  /**
   * Resuelve un `calc()` de tokens a píxeles, con los tokens REALES del tema.
   * Devuelve `null` si algún `var()` no existe: un token inventado tiene que
   * fallar, no valer cero.
   */
  function resolverEnPx(expresion: string): number | null {
    const cantidad = resolver(expresion, tokensDelTema())
    return cantidad === null || cantidad.unidad !== 'px' ? null : cantidad.n
  }

  titulo('4 · scroll-padding-top — el del sitio viejo, y el que /v3 declara encima')

  const GLOBALS = leer('src/app/globals.css')
  afirmarIgual(
    declaracionCss(GLOBALS, 'scroll-padding-top'),
    'var(--spacing-ds-nav)',
    '`globals.css` lo declara sobre el `<html>`, adentro de `@layer base`',
  )
  const NAV = declaracionCss(GLOBALS, '--spacing-ds-nav')
  const SCROLL_PADDING_PX = NAV === null ? Number.NaN : (aPx(NAV) ?? Number.NaN)
  afirmarIgual(SCROLL_PADDING_PX, 64, '`--spacing-ds-nav` = 4rem = 64px, que es el alto de la barra fija del sitio VIEJO')
  controlPositivo('el conversor de unidades no acepta cualquier cosa', '4em', (valor: string) => aPx(valor) !== null)

  /** /v3 hereda la regla porque el layout raíz importa `globals.css`. */
  afirmar(
    leer('src/app/layout.tsx').includes('./globals.css'),
    'el layout raíz importa `globals.css`, así que la regla del `<html>` alcanza también a `/v3`',
  )
  afirmar(
    /pathname\.startsWith\('\/v3'\)/.test(leer('src/components/layout/SmoothScroll.tsx')),
    'y Lenis NO corre en /v3: el scroll es NATIVO, así que `scroll-padding-top` gobierna de verdad el aterrizaje',
  )

  /**
   * ⚠️ **LA VARA ES LA PASTILLA, Y LA DECIDIÓ EL HUMANO EN LA PARADA DE SITIO-S9.**
   *
   * Había dos, y las dos se midieron. Contra la **pastilla** —que en reposo ocupa
   * de `--spacing-6` (24) a 24 + su alto (48), o sea hasta **72 px**— el heredado
   * quedaba **8 px corto** y el borde de la sección se metía abajo de ella. Contra
   * el **borde del bloque** —cada sección es N × 100svh y su borde superior quiere
   * el borde del viewport— el valor correcto habría sido 0, y sobraban los 64
   * enteros. **Se eligió la pastilla:** un ancla que aterriza debajo de la pastilla
   * no sirve.
   */
  const BORDE_INFERIOR_PASTILLA_PX = BORDE_INFERIOR_EN_REPOSO_PX
  afirmarIgual(BORDE_INFERIOR_PASTILLA_PX, 72, 'la pastilla en reposo termina a 72px del borde superior (24 de reposo + 48 de alto)')
  afirmarIgual(BORDE_INFERIOR_PASTILLA_PX - SCROLL_PADDING_PX, 8, 'y el heredado se quedaba 8px corto contra esa vara — el desvío que este sprint arregla')
  afirmarIgual(DESTINOS_DE_LA_RUTA.length, 7, 'son SIETE las anclas que el pie ofrece, todas con el mismo aterrizaje')

  /**
   * ⚠️ **EL ARREGLO NO TOCA CSS GLOBAL, Y ESO NO ERA GRATIS.** `scroll-padding` va
   * sobre el CONTENEDOR DE SCROLL, que es el `<html>`, y el `<html>` no lleva
   * `[data-v3]` —la marca vive en el envoltorio de `v3/layout.tsx`—. La salida es
   * `html:has([data-v3])`, que **sólo matchea cuando hay un `[data-v3]` en el
   * documento**: cumple la propiedad que el repo custodia —ninguna hoja de /v3
   * alcanza al sitio vivo— aunque no cumpliera el `startsWith` con el que
   * `s3-tokens` §5 la comprobaba. Ese detector aprendió la forma, anclada entera y
   * con tres controles positivos.
   */
  const HOJA_NAV = leer('src/app/v3/_estilos/navegacion.css')
  afirmar(
    HOJA_NAV.includes('html:has([data-v3])'),
    'la hoja de /v3 declara el `scroll-padding-top` sobre el contenedor de scroll, acotado con `:has()`',
  )
  afirmar(
    !GLOBALS.includes('[data-v3]') && declaracionCss(GLOBALS, 'scroll-padding-top') === 'var(--spacing-ds-nav)',
    '  y `globals.css` NO se tocó: el sitio vivo conserva sus 64px',
  )

  /**
   * El valor de la hoja no es un 72 escrito: es la MISMA cuenta que
   * `_lib/navegacion.ts` deriva de los cuatro tokens. Se comprueba resolviendo la
   * declaración contra `theme-develop.css`, no comparando texto — así, si mañana
   * alguien mueve `--spacing-3`, el número se mueve en los dos lados o esto falla.
   */
  const DECLARADO = declaracionCss(HOJA_NAV, 'scroll-padding-top')
  afirmar(DECLARADO !== null, '  y lo declara con un `calc()` de tokens, no con un literal', DECLARADO ?? '(nada)')
  afirmarIgual(
    resolverEnPx(DECLARADO ?? ''),
    BORDE_INFERIOR_PASTILLA_PX,
    '  y ese `calc()` resuelve EXACTAMENTE al borde inferior de la pastilla en reposo',
  )
  controlPositivo(
    'el resolvedor no da por bueno un calc con un token que no existe',
    'calc(var(--no-existe) + var(--spacing-6))',
    (expr: string) => resolverEnPx(expr) !== null,
  )

  noCorre(
    'el aterrizaje REAL de las siete anclas, medido en el navegador',
    'el sprint prohíbe abrir un navegador, y una medición de scroll con la pestaña no visible da cero (lección de Aug 2026). Los 72 px son geométricos, derivados de los tokens; quien confirme el aterrizaje tiene que hacerlo con la pestaña al frente',
  )
}
