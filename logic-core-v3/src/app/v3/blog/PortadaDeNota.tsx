import { cn } from '@/lib/utils'

import type { Nota, TonoDePortada } from './_notas/tipos'

/**
 * [L7c] LA PORTADA TIPOGRÁFICA de una nota — sin fotos: la palabra clave en grande sobre la tinta, el papel o el acento de un servicio, con
 * formas simples (un círculo y una línea). Su tamaño sale del ancho de su caja (`cqw`), así que es la misma en el carrusel y en la tarjeta.
 * Sobre el acento, el texto va en el papel (el acento del tema es oscuro: la tinta sobre él no llega a AA).
 */
const TONOS: Readonly<Record<TonoDePortada, { readonly caja: string; readonly servicio?: string }>> = {
  tinta: { caja: 'bg-tinta text-fondo' },
  papel: { caja: 'bg-fondo text-tinta border border-borde' },
  web: { caja: 'bg-acento text-fondo', servicio: 'web' },
  ia: { caja: 'bg-acento text-fondo', servicio: 'ia-automatizacion' },
  software: { caja: 'bg-acento text-fondo', servicio: 'software' },
  automatizacion: { caja: 'bg-acento text-fondo', servicio: 'ia-automatizacion' },
}

export function PortadaDeNota({ nota, className }: { readonly nota: Nota; readonly className?: string }): React.JSX.Element {
  const tono = TONOS[nota.portada.tono]
  return (
    <div
      data-pieza="portada-de-nota"
      {...(tono.servicio === undefined ? {} : { 'data-servicio': tono.servicio })}
      className={cn('@container relative aspect-[16/9] w-full overflow-hidden', tono.caja, className)}
    >
      <span aria-hidden="true" className="absolute -right-[12cqw] -bottom-[18cqw] size-[56cqw] rounded-circulo border-[1.2cqw] border-current opacity-25" />
      <span aria-hidden="true" className="absolute top-[8cqw] left-[6cqw] h-[0.6cqw] w-[14cqw] bg-current opacity-60" />
      <span className="absolute bottom-[6cqw] left-[6cqw] max-w-[80cqw] text-[length:13cqw] leading-[0.95] font-semi tracking-tight">{nota.portada.palabra}</span>
    </div>
  )
}
