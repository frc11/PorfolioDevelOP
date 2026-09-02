import { cn } from '@/lib/utils'

import { ENLACES_DE_MUESTRA, type EnlaceDeNavegacion } from '../../_lib/navegacion'

import type { EstadoForzado } from './Cta'

/**
 * LA PASTILLA DE NAVEGACIÓN FLOTANTE.
 *
 * ── No es un header ───────────────────────────────────────────────────────
 *
 * Ninguna de las tres páginas medidas tiene un elemento `<header>`, y de las
 * seis regiones fijas que cumplen esa función **cinco son idénticas en 0, 100,
 * 500, 2000 y 8000px de scroll**: misma huella de clases, mismo transform,
 * misma opacidad, mismo fondo. No hay barra que se encoja ni que gane sombra
 * al bajar.
 *
 * Lo único que se mueve es esta pastilla, y no por una clase sino por su
 * POSICIÓN: es `absolute` dentro de un envoltorio `sticky`. El mecanismo y la
 * derivación del umbral están en `_estilos/navegacion.css` y en
 * `_lib/navegacion.ts`.
 *
 * ── Por qué no depende del sprint de motion ───────────────────────────────
 *
 * Porque no hay scroll acá. Ni listener, ni `scroll-timeline`, ni cálculo por
 * fotograma: `sticky` con un `top` negativo produce exactamente la curva
 * medida —`top = nacimiento − scrollY` hasta topar en `reposo`— con
 * geometría. Este componente no importa una sola línea del sistema de
 * coreografía.
 *
 * ── Dónde se monta ────────────────────────────────────────────────────────
 *
 * Tiene que ser hijo de un contenedor alto y sin `overflow` recortado, y tan
 * arriba del documento como sea posible: el envoltorio `sticky` mide 0 de
 * alto, así que no empuja nada, pero su posición natural es la que define el
 * nacimiento. Esta pieza NO se monta en `/v3` en este sprint — el home es del
 * sprint de secciones.
 *
 * ── Abajo de 1025 es EL MISMO MARCADO (SITIO-S11) ─────────────────────────
 *
 * `s10-mobile` §8 midió que la fila de cinco enlaces mide 600 px y se salía
 * 112 px por lado a 375 (defecto 4). **El arreglo no toca una sola línea de
 * este archivo**, y eso es lo que se quería: se resolvió con un tope de ancho
 * relativo en `_estilos/navegacion.css` —`calc(100% - --pad-lateral-compacto
 * × 2)`— y la fila recorriéndose de costado adentro de la pastilla. Sin media
 * query, sin una rama de JavaScript y sin un marcado alternativo.
 *
 * La consecuencia que importa es de accesibilidad: **el árbol es idéntico en
 * los cinco anchos**. Los cinco `<a>` siguen estando, las cinco paradas de
 * tabulación siguen siendo cinco y el `<nav>` sigue teniendo el mismo nombre,
 * así que lo que `s10-acceso` cuenta arriba del umbral es lo mismo que hay
 * abajo. Un menú plegable habría sido un `<button>` más —una parada nueva y un
 * estado nuevo— para un problema que era de ancho.
 */

export interface NavegacionProps {
  readonly enlaces?: readonly EnlaceDeNavegacion[]
  /** Rótulo de la región. `<nav>` sin nombre es una región sin nombre. */
  readonly rotulo?: string
  readonly className?: string
  /**
   * La etiqueta del ENVOLTORIO `sticky`. `div` por defecto; `header` cuando esta
   * pieza es la cabecera del documento.
   *
   * ── ⚠️ POR QUÉ ES EL ENVOLTORIO Y NO UN `<header>` ALREDEDOR (SITIO-S12) ──
   *
   * El defecto 15 de §7.39 pide dos cosas a la vez: que el documento tenga
   * `banner` y que el `<nav>` deje de estar anidado en el `<main>`. La forma
   * obvia —envolver esta pieza en un `<header>`— **rompe el mecanismo en
   * silencio**: `position: sticky` se pega dentro de su CONTENEDOR DE BLOQUE, y
   * un `<header>` alrededor de un envoltorio de `block-size: 0` mide cero, así
   * que el rango de pegado sería cero y la pastilla se iría con el scroll. Es el
   * mismo defecto que `ChromeDelHome` documenta para un `<div>` intermedio.
   *
   * Con la etiqueta puesta EN el envoltorio no hay elemento nuevo: el contenedor
   * de bloque sigue siendo el ancestro que ya era, y el rol de landmark se gana
   * sin mover un píxel. Un `block-size: 0` no le quita el rol a un `<header>`.
   *
   * El default se queda en `div` porque la galería de `/v3/componentes` monta
   * esta misma pieza y ahí no es la cabecera de nada.
   */
  readonly como?: 'div' | 'header'
}

export function Navegacion({
  enlaces = ENLACES_DE_MUESTRA,
  rotulo = 'Navegación principal',
  className,
  como: Envoltorio = 'div',
}: NavegacionProps) {
  return (
    <Envoltorio data-pieza="navegacion" className={className}>
      <nav data-parte="pastilla" aria-label={rotulo}>
        <ul data-parte="lista">
          {enlaces.map((enlace) => (
            <li key={enlace.id}>
              <EnlaceDeNavegacionFlotante enlace={enlace} />
            </li>
          ))}
        </ul>
      </nav>
    </Envoltorio>
  )
}

/**
 * El enlace, con su marcador.
 *
 * El marcador entra desde `scale(0.8) translateX(−16px)` con opacidad 0, y el
 * enlace entero se corre 8px. Todo medido, todo con `--ease-principal` y
 * `--duracion-lenta`. Va `aria-hidden` porque es un punto: no dice nada que el
 * rótulo no diga ya.
 *
 * Se exporta suelto porque la galería de estados lo necesita fuera de la
 * pastilla — una pastilla `sticky` de alto cero no se puede mostrar en una
 * ficha de 200px.
 */
export function EnlaceDeNavegacionFlotante({
  enlace,
  forzado,
  className,
}: {
  readonly enlace: EnlaceDeNavegacion
  readonly forzado?: EstadoForzado
  readonly className?: string
}) {
  return (
    <a
      href={enlace.destino}
      data-pieza="nav-enlace"
      data-forzado={forzado}
      className={cn('text-cuerpo tracking-texto leading-texto font-semi', className)}
    >
      <span data-parte="marcador" aria-hidden="true" />
      <span data-parte="rotulo">{enlace.rotulo}</span>
    </a>
  )
}
