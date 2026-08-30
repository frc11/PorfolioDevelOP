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

export function TarjetaDeDiferencial({
  diferencial,
}: {
  readonly diferencial: Diferencial
}): React.JSX.Element {
  return (
    <div className="border-borde flex flex-col gap-[var(--spacing-2)] border-t pt-[var(--spacing-4)]">
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
