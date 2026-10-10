'use client'

import { useEffect, useState } from 'react'

import { TarjetaDeResultado } from './TarjetaDeResultado'

/**
 * [PULIDO 13] K2 · PRECALENTAR EL RESULTADO — la primera vez que se dibuja el encastre, el GPU compila los sombreadores de su
 * raster (los desenfoques del SVG, los trazos gruesos): cuadros de 40 a 330 ms justo cuando aparece la tarjeta (medido con el
 * banco en frío, sin la caché de sombreadores; con la caché, ninguno). Esto dibuja las dos tarjetas (el éxito y el error, con su
 * encastre corriendo y mudo) una vez ANTES, del tamaño de la de verdad (la caja del formulario), detrás de él y casi
 * transparentes (`PRECALENTAR.opacidad`: lo justo para que se pinten), y se van a los `PRECALENTAR.ms`.
 *
 * `activo`: cuándo (lo decide quien la monta: un momento quieto antes de que se pueda enviar). Una sola vez por montaje.
 *
 * Sólo en el panel de Contacto. En el pie (adentro de su placa o suelto) el primer hover de Enviar pasaba a trabar ~430 ms
 * (medido en frío, con y sin: `pulido-13/k2`), más que lo que ahorraba en la tarjeta (40 a 133 ms): ahí no se precalienta.
 */
export const PRECALENTAR = { opacidad: 0.01, ms: 1800 } as const

interface Props {
  readonly activo: boolean
  readonly compacto?: boolean
  readonly enVolumen?: boolean
}

const nada = (): void => undefined

export function PrecalentarElResultado({ activo, compacto = false, enVolumen = false }: Props): React.JSX.Element | null {
  const [terminado, setTerminado] = useState(false)
  const dibujando = activo && !terminado
  useEffect(() => {
    if (!dibujando) return undefined
    const fin = window.setTimeout(() => setTerminado(true), PRECALENTAR.ms)
    return () => window.clearTimeout(fin)
  }, [dibujando])
  if (!dibujando) return null
  return (
    <div aria-hidden="true" inert data-precalentar="" data-sin-volumen="" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" style={{ opacity: PRECALENTAR.opacidad }}>
      {(['exito', 'error'] as const).map((tipo) => (
        <div key={tipo} className="absolute inset-0 flex">
          <TarjetaDeResultado tipo={tipo} mensaje={tipo} empieza enVolumen={enVolumen} compacto={compacto} alReintentar={nada} precalentar />
        </div>
      ))}
    </div>
  )
}
