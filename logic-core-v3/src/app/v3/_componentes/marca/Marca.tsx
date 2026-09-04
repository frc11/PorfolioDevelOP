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
