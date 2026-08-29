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
 */

export interface NavegacionProps {
  readonly enlaces?: readonly EnlaceDeNavegacion[]
  /** Rótulo de la región. `<nav>` sin nombre es una región sin nombre. */
  readonly rotulo?: string
  readonly className?: string
}

export function Navegacion({
  enlaces = ENLACES_DE_MUESTRA,
  rotulo = 'Navegación principal',
  className,
}: NavegacionProps) {
  return (
    <div data-pieza="navegacion" className={className}>
      <nav data-parte="pastilla" aria-label={rotulo}>
        <ul data-parte="lista">
          {enlaces.map((enlace) => (
            <li key={enlace.id}>
              <EnlaceDeNavegacionFlotante enlace={enlace} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
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
