'use client'

import { useEffect, useState } from 'react'

import { ContenidoDelCta } from '../../_componentes/chrome/Cta'
import { EncajeDelLogo, PROPORCION_DEL_ENCAJE } from '../../_componentes/formularios/EncajeDelLogo'
import { EnlaceDeRuta } from '../../_componentes/navegacion/EnlaceDeRuta'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

/** Cuánto espera la pieza antes de caer, con la página ya a la vista (ms): que se vea la caída entera, no a mitad. */
const ESPERA_MS = 700

/**
 * Los colores del encastre sobre el papel: la tarjeta del resultado los da vuelta por estas dos propiedades (el respaldo de la sección
 * invertida, `_estilos/resultado.css`). Así la pieza es de tinta y el pozo, un gris hundido en el papel.
 */
const SOBRE_EL_PAPEL = {
  '--resultado-oscuro-invertido': 'var(--color-fondo)',
  '--resultado-claro-invertido': 'var(--color-tinta)',
  aspectRatio: String(PROPORCION_DEL_ENCAJE),
} as React.CSSProperties

/**
 * [L7e · E1] LA 404: EL LOGO QUE NO ENCAJA. La pieza del logo cae a su ranura, choca con el borde, rebota y queda afuera, torcida: el
 * estado de error del encastre de los formularios (`EncajeDelLogo`), con su sonido si el sonido está prendido. Un toque a la pieza la
 * vuelve a tirar (remonta el encastre). Con movimiento reducido, el estado final directo.
 */
export function NoEncaja(): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const [intento, setIntento] = useState(0)
  // El intento que ya arrancó: con un intento nuevo, la pieza vuelve arriba hasta que pasa la espera.
  const [arrancado, setArrancado] = useState(-1)
  const empieza = arrancado === intento

  useEffect(() => {
    const t = window.setTimeout(() => setArrancado(intento), intento === 0 ? ESPERA_MS : 120)
    return () => window.clearTimeout(t)
  }, [intento])

  return (
    <section className="mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center gap-10 px-6 py-28 text-center">
      <div data-tarjeta="resultado" className="relative w-[min(70vw,22rem)]" style={SOBRE_EL_PAPEL}>
        <EncajeDelLogo key={intento} resultado="no-encaja" empieza={empieza} quieto={reducido} alTerminar={() => undefined} />
        <button
          type="button"
          onClick={() => setIntento((n) => n + 1)}
          aria-label="Tirar el logo otra vez"
          className="absolute inset-0 cursor-pointer rounded-medio"
        />
      </div>
      <h1 className="text-titulo-l leading-titulo escritorio:text-titulo-xl">
        <span className="block font-display font-fuerte tracking-display uppercase">Esta página no existe,</span>
        <span className="block font-liviano tracking-titulo italic uppercase">pero tu proyecto sí puede.</span>
      </h1>
      <EnlaceDeRuta href="/v3" data-pieza="cta" data-variante="linea" data-registro="cuerpo" className="text-base no-underline">
        <ContenidoDelCta rotulo="Volver al home" />
      </EnlaceDeRuta>
    </section>
  )
}
