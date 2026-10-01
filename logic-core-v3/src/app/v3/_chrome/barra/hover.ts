/**
 * [NAVBAR] RETOQUE 4 · EL HOVER DE LA BARRA — dos variantes, más tranquilas que el rollover tipo botón (que queda en el
 * CTA, el mail, WhatsApp y los proyectos):
 *
 *   · `a` (la de siempre, sin bandera): el rótulo sube a tinta plena y una línea fina crece desde el centro;
 *   · `b`: un resaltado suave, UNO, que se desliza al ítem bajo el mouse (o con el foco) y en reposo marca el activo.
 *
 * Se elige en la URL: `/v3?interfaz=navhover=b` (o `=a`). Puro: lo prueba `s39-navbar`.
 */
export const VARIANTES_DEL_HOVER = ['a', 'b'] as const
export type VarianteDelHover = (typeof VARIANTES_DEL_HOVER)[number]

/** La variante pedida en la consulta de la URL (`?interfaz=navhover=b`); sin pedido, o con otro valor, la `a`. */
export function varianteDelHover(consulta: string): VarianteDelHover {
  const pedido = new URLSearchParams(consulta).get('interfaz') ?? ''
  const valor = pedido
    .split(',')
    .map((p) => p.trim())
    .find((p) => p.startsWith('navhover='))
    ?.slice('navhover='.length)
  return valor === 'b' ? 'b' : 'a'
}
