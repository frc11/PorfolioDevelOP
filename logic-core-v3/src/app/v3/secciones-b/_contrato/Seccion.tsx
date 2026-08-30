import { cn } from '@/lib/utils'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Panel } from '../../_componentes/Panel'
import { NUMERO_DE_CONTRATO, seccionDe, type IdDeSeccionB } from './secciones'

/**
 * EL MARCO DE UNA SECCIÓN — la superficie, la altura y el rótulo.
 *
 * ── Qué NO hace, y por qué importa ────────────────────────────────────────
 *
 * **No envuelve el contenido en un `Envoltorio`.** Parecía la comodidad
 * evidente y rompe el pinneado: `position: sticky` se pega dentro de la caja de
 * su PADRE, así que el hijo `sticky` tiene que ser hijo directo de la sección
 * alta. Un envoltorio intermedio de altura automática mide lo que mide su
 * contenido —una pantalla— y el rango de pegado se va a cero, sin ningún error
 * en consola. `PanelPinneado` ya lo dejó escrito y acá se respeta: el marco pone
 * la `<section>` y cada sección arma su propia contención adentro.
 *
 * ── La superficie sale de la tabla, no de acá ─────────────────────────────
 *
 * `Panel` la lee de `_lib/secciones.ts`, que escribe el lane A. Este marco no
 * decide ni el color ni la altura ni si la sección va invertida: recorre el
 * dato. Es lo que hace que el día que el lane A escriba `oscuro-opaco` en Cierre
 * no haya que tocar una línea de este lane.
 */

export interface SeccionProps {
  readonly id: IdDeSeccionB
  readonly children: React.ReactNode
}

export function Seccion({ id, children }: SeccionProps): React.JSX.Element {
  return <Panel seccion={seccionDe(id)}>{children}</Panel>
}

export interface EncabezadoDeSeccionProps {
  readonly id: IdDeSeccionB
  /** El nombre visible de la sección. Es contenido. */
  readonly nombre: string
  readonly className?: string
}

/**
 * El rótulo: el número en la columna lateral de 140px y la etiqueta de sección.
 *
 * `EtiquetaDeSeccion` es la pieza más repetida del inventario —29 apariciones—
 * y trae su medición entera: `text.micro`, `leading.micro`, peso medio,
 * mayúsculas y la sangría de `--spacing-8`. Acá la sangría se apaga: la columna
 * lateral ya separa, y sumar las dos cosas la correría dos veces.
 *
 * ── ⚠️ EL NÚMERO VA EN TINTA PLENA, Y NO ES ESTÉTICA ──────────────────────
 *
 * `RotuloDePanel` (S1) pinta su número a `--opacity-casi` (0,6), y acá se
 * empezó copiando eso. **Está medido que no alcanza sobre el canvas:** la tinta
 * al 60 % compuesta sobre `--color-superficie-3` da **4,4043:1**, por debajo de
 * AA (4,5:1). Sobre el papel sí pasa —4,83:1— así que el defecto sólo aparece
 * en un panel `papel-transparente`, que es exactamente la superficie de
 * contrato de la sección 07.
 *
 * Bajar la opacidad empeora (menos alfa = más fondo claro = menos contraste) y
 * el sistema no declara ningún escalón por encima de 0,6. Así que el número va
 * en tinta plena: **13,62:1** peor caso sobre el canvas y **18,00:1** sobre la
 * sección invertida. Lo que lo mantiene discreto es el tamaño —`text-micro`,
 * 10 px, monoespaciada y en mayúsculas—, no un alfa que no da.
 *
 * `s6-render.invariant` produce las tres cifras; ninguna está transcrita.
 *
 * ⚠️ **Queda reportado, y NO se toca:** `RotuloDePanel` de `_componentes/Panel.tsx`
 * tiene el mismo `opacity-casi`. Hoy no falla porque las ocho secciones son
 * `papel-opaco`; el día que un panel transparente lo use, su número cae a
 * 4,4043:1. Ese archivo es de S1 y este lane no lo modifica.
 */
export function EncabezadoDeSeccion({
  id,
  nombre,
  className,
}: EncabezadoDeSeccionProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 gap-[var(--grilla-canal-amplio)] tablet:grid-cols-[var(--columna-lateral)_minmax(0,1fr)]',
        className,
      )}
    >
      <p className="font-codigo text-micro tracking-micro leading-micro uppercase">
        {NUMERO_DE_CONTRATO[id]}
      </p>
      <EtiquetaDeSeccion como="p" sangria={false}>
        {nombre}
      </EtiquetaDeSeccion>
    </div>
  )
}

/**
 * La contención estándar de una sección: a sangre, con los 32px fijos de
 * `--pad-lateral-compacto` y el tope de 1920px en el contenido.
 *
 * Es `Envoltorio` con un nombre que dice para qué se usa acá. Existe para que
 * las cuatro secciones contengan igual sin que cada una recuerde qué props le
 * tocaban.
 */
export function ContenidoDeSeccion({
  children,
  className,
  claseDeContenido,
}: {
  readonly children: React.ReactNode
  readonly className?: string
  readonly claseDeContenido?: string
}): React.JSX.Element {
  return (
    <Envoltorio className={className} claseDeContenido={claseDeContenido}>
      {children}
    </Envoltorio>
  )
}
