import { LOGO_INK_VIEWBOX_ATTR, LOGO_PATH_D } from '@/components/ui/LogoMark'
import { cn } from '@/lib/utils'

import { LOGOTIPO } from './sistema'

/**
 * LAS TRES PIEZAS DE LA MARCA — logotipo, separador, prefijo — y su lockup.
 *
 * El porqué de cada una y la propuesta de Instrument Serif están en `marca.ts`.
 * Acá está la forma. Todas consumen TOKENS: el prefijo `bg-acento` (el alias, que
 * se retiñe por `data-servicio`), el separador `bg-borde`, el logotipo la tinta
 * heredada. Cero color escrito.
 */

type EtiquetaDeTexto = 'span' | 'p' | 'div' | 'h1' | 'h2'

/**
 * EL LOGOTIPO — la palabra «develOP», el MISMO en todos lados.
 *
 * En Chivo con `tracking-titulo`: es la marca, no un párrafo. `como` separa el
 * nivel del elemento, igual que el resto del sistema tipográfico: un logotipo que
 * es el `h1` de una página y uno que es una firma en el pie se ven igual y
 * anuncian distinto.
 */
export function Logotipo({
  como: Como = 'span',
  className,
}: {
  readonly como?: EtiquetaDeTexto
  readonly className?: string
}): React.JSX.Element {
  return (
    <Como data-pieza="logotipo" className={cn('font-titulo tracking-titulo leading-titulo font-semi', className)}>
      {LOGOTIPO}
    </Como>
  )
}

/**
 * EL ISOTIPO — la marca dibujada, en 2D y en el DOM. **La cuarta pieza.**
 *
 * ── ⚠️ DE DÓNDE SALE EL DIBUJO, Y POR QUÉ NO ES UNA COPIA MÁS ─────────────
 *
 * Del `LOGO_PATH_D` que ya exporta `components/ui/LogoMark.tsx`, que a su vez es
 * el path de `public/logodevelOP.svg` —**el asset canónico de marca**, el mismo
 * que el mesh 3D extrude por `SVGLoader`—. Ese archivo documenta que el path
 * está copiado en CUATRO lugares del repo y que si la marca cambia hay que
 * tocar los cuatro; esta pieza **no agrega el quinto**: importa la constante.
 *
 * Es también la razón por la que NO se captura el 3D ni se lee el canvas: el
 * dibujo ya existe como datos, y el preloader nuevo (`IntroLogoStroke`) ya lo
 * usa exactamente así —SVG inline en el DOM, sin WebGL— como su camino de
 * respaldo declarado. Esta pieza es ese mismo camino, quieto.
 *
 * ── Por qué el `viewBox` es el de la TINTA y no el cuadrado de 1024 ───────
 *
 * Porque `LOGO_INK_VIEWBOX` mide la tinta real —978,5 × 680,7— y dice que **no
 * llena el cuadrado y no está centrada en él: su centro cae 33 unidades por
 * debajo**. Con el cuadrado, un alto declarado de 81 px pintaría 54 de marca y
 * 27 de aire mudo, con la pieza corrida para abajo. Con el `viewBox` recortado,
 * el alto que se le pide es el alto que se ve. Es la misma decisión que
 * `IntroLogoStroke` toma para el trazo del preloader, y por el mismo motivo.
 *
 * ── Lo que NO declara, a propósito ────────────────────────────────────────
 *
 * Ni tamaño ni color. `fill="currentColor"` hereda la tinta del contexto —así
 * la marca se da vuelta sola con `data-seccion="invertida"` sin una clase
 * condicional— y la caja la pone quien la monta, que es el único que sabe con
 * qué la está alineando. `role="presentation"`: la palabra `develOP` va en
 * texto al lado, así que el dibujo no agrega un dato, agrega un registro.
 */
export function Isotipo({ className }: { readonly className?: string }): React.JSX.Element {
  return (
    <svg
      data-pieza="isotipo"
      viewBox={LOGO_INK_VIEWBOX_ATTR}
      className={cn('w-auto shrink-0', className)}
      fill="currentColor"
      role="presentation"
      focusable="false"
    >
      <path d={LOGO_PATH_D} />
    </svg>
  )
}

/**
 * EL PREFIJO DE SERVICIO — la marca de RELLENO que estructura por color.
 *
 * `bg-acento` es el alias: en la home vale el acento por defecto (web) y en una
 * subpágina con `data-servicio` se retiñe solo, sin una clase condicional. Va
 * como relleno y NUNCA como texto —sobre oscuro el acento no llega ni a 3:1—, así
 * que este es el único registro donde el color de servicio aparece, y aparece
 * como forma, no como palabra. `aria-hidden`: es una marca, no dice nada que el
 * logotipo no diga.
 */
export function PrefijoDeServicio({ className }: { readonly className?: string }): React.JSX.Element {
  return (
    <span
      data-pieza="prefijo-de-servicio"
      aria-hidden="true"
      className={cn('inline-block size-[var(--spacing-2)] shrink-0 bg-acento', className)}
    />
  )
}

/**
 * EL SEPARADOR — la regla de 1px que marca la relación entre el logotipo y lo que
 * sigue. Es el divisor del sistema (`DESIGN.md`: «reglas de 1px que dividen»), no
 * un glifo nuevo. Vertical y a la altura del texto (`self-stretch`).
 *
 * ⚠ Es el lugar PROPUESTO para la única aparición de Instrument Serif (ver
 * `marca.ts`). Hoy es la regla; el día que se cargue la serif, este es el punto
 * donde entra, y sólo acá.
 */
export function Separador({ className }: { readonly className?: string }): React.JSX.Element {
  return <span data-pieza="separador" aria-hidden="true" className={cn('w-px shrink-0 self-stretch bg-borde', className)} />
}

/**
 * EL LOCKUP — los tres registros operando como conjunto, que es el punto entero.
 *
 * `prefijo develOP │ lo-que-sigue`. Sin `children` es sólo prefijo + logotipo (la
 * firma mínima); con `children`, el separador aparece entre el logotipo y la
 * continuación. Es el conjunto que hace que la marca deje de leerse como símbolo
 * suelto.
 */
export function MarcaLockup({
  children,
  como,
  className,
}: {
  readonly children?: React.ReactNode
  readonly como?: EtiquetaDeTexto
  readonly className?: string
}): React.JSX.Element {
  return (
    <span data-pieza="marca-lockup" className={cn('inline-flex items-center gap-[var(--spacing-2)]', className)}>
      <PrefijoDeServicio />
      <Logotipo como={como} />
      {children !== undefined && children !== null && (
        <>
          <Separador />
          <span data-parte="continuacion" className="font-cuerpo text-cuerpo tracking-texto leading-texto">
            {children}
          </span>
        </>
      )}
    </span>
  )
}
