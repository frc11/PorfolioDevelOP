import { Caption, Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import type { Diferencial, Testimonio } from './contenido'

/**
 * LAS PIEZAS QUE APARECEN — la tarjeta de un diferencial y el testimonio.
 *
 * ── Ninguna de las dos pinta un fondo, y ésa es la regla de la sección ────
 *
 * Esta sección es `papel-transparente` en la tabla del contrato: el panel deja
 * ver lo que hay detrás. La tentación evidente —ponerle a cada tarjeta una
 * superficie clara para "asegurar" la lectura— es una decisión de dirección de
 * arte que no es de este sprint, y además rompería lo único que la superficie
 * transparente compra.
 *
 * Así que la separación entre piezas la hace **una línea**: un borde de un
 * `hairline` con `--color-borde`, que es el separador decorativo del sistema.
 * Ni fondo, ni desenfoque, ni gradiente, ni capa. El invariante lo afirma
 * archivo por archivo.
 *
 * ── Toda la tipografía va en la tinta primaria ────────────────────────────
 *
 * Sobre un panel transparente lo que queda detrás del texto no es un token: es
 * el escenario. `--color-tinta-media` y `--color-tinta-tenue` están calculadas
 * contra las cuatro superficies de papel, no contra una sala con gradiente, así
 * que acá no se usan. La sección hereda `text-tinta` del panel y no lo pisa en
 * ningún lado. El invariante mide la razón de esa tinta contra lo que hoy hay
 * detrás y publica el peor caso.
 */

/**
 * ── ⚠️ B4-A · LA SANGRÍA BAJA DE `--spacing-4` A `--spacing-2`, Y ES EL ARREGLO
 *      DE LOS 24 px ────────────────────────────────────────────────────────
 *
 * **El número, primero.** A 1440×900 la sección renderizaba **923,70 px en una
 * ventana de 900** —medido con scroll real, `[data-panel="por-que-develop"]`— y
 * los 23,70 que sobraban salían enteros del bloque de P5: renderiza **475,19 px
 * de contenido propio** contra un piso declarado de 450 (`50svh`). O sea que el
 * piso dejó de gobernar y lo que gobierna es la lista.
 *
 * **Por qué se toca ESTA sangría y no el hueco entre tarjetas.** Las dos median
 * `--spacing-4`, así que la regla de cada tarjeta quedaba **exactamente en el
 * medio** de una banda de 32 px: 16 px la separaban del texto de la tarjeta de
 * arriba y 16 de su propio título. Una regla equidistante no agrupa —no dice si
 * cierra lo de arriba o abre lo de abajo—, y una separación que introduce tiene
 * que estar más cerca de lo que introduce. Con la sangría en `--spacing-2` la
 * regla queda a 8 px de su título y a 16 del bloque anterior: **el arreglo de
 * composición y el de altura son el mismo**, y por eso no hay que elegir.
 *
 * **Qué compra, con la cuenta.** Cuatro tarjetas × 8 px = **32 px** menos de
 * lista. El bloque baja de 475,19 a 443,2 de contenido propio, o sea **por
 * debajo de su piso de 450**, y ahí vuelve a mandar el piso: la sección mide
 * `48 + 48 + 11 + 276,13 + 65,39 + 450 = 898,52` y entra en su pantalla con
 * 1,48 px de aire. Ése es el mínimo alcanzable sin tocar
 * `ALTO_MINIMO_DEL_BLOQUE_SVH`, que es lo que impide que el rango de P5
 * degenere; el modelo de `s7-por-que-develop.invariant` §8 lo publica.
 *
 * ⚠ A 1920 no cambia el alto de la sección: ahí el bloque nunca estuvo atado por
 * su contenido —`content-between` reparte el sobrante— y la sección medía y
 * sigue midiendo 1080 px exactos.
 */
export function TarjetaDeDiferencial({
  diferencial,
}: {
  readonly diferencial: Diferencial
}): React.JSX.Element {
  return (
    <div className="border-borde flex flex-col gap-[var(--spacing-2)] border-t pt-[var(--spacing-2)]">
      <Titular nivel="titulo-s" como="h3">
        {diferencial.titulo}
      </Titular>
      <Cuerpo como="p">{diferencial.cuerpo}</Cuerpo>
    </div>
  )
}

/**
 * EL TESTIMONIO QUE FALTA, con la forma del que va a ir.
 *
 * Es un `<blockquote>` de verdad con su `<footer>`: el día que entre la cita,
 * lo único que cambia es el texto. El marcador va en la familia monoespaciada
 * —el mismo tratamiento que `_contrato/HuecoDeMedio.tsx` le da a los suyos—
 * para que se lea como lo que es: un hueco, no una cita.
 */
export function BloqueDeTestimonio({
  testimonio,
}: {
  readonly testimonio: Testimonio
}): React.JSX.Element {
  return (
    <blockquote className="border-borde-fuerte flex flex-col gap-[var(--spacing-4)] border-l pl-[var(--spacing-4)]">
      <Titular nivel="titulo-s" como="p" className="font-codigo">
        {testimonio.marcador}
      </Titular>
      <Cuerpo como="p">{testimonio.forma}</Cuerpo>
      <footer>
        <Caption como="p" className="font-codigo uppercase">
          {testimonio.firma}
        </Caption>
      </footer>
    </blockquote>
  )
}
