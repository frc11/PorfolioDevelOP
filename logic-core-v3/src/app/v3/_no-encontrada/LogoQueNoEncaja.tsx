'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { EncajeDelLogo, PROPORCION_DEL_ENCAJE } from '../_componentes/formularios/EncajeDelLogo'
import { entradaAbierta, suscribirALaEntrada } from '../_lib/entrada'
import { useMovimientoReducido } from '../_lib/motion/reducido'

import { ARRANQUE, esperaDelIntento, puedeArrancar } from './arranque'

const suscribirALaVisibilidad = (f: () => void): (() => void) => {
  document.addEventListener('visibilitychange', f)
  return () => document.removeEventListener('visibilitychange', f)
}

/**
 * [M2] EL LOGO QUE NO ENCAJA — la idea del prototipo 1 de `l7/lab` con la animación del error del formulario: la MISMA pieza
 * (`EncajeDelLogo` en `no-encaja`, con sus tiempos, sus curvas y su sonido de error si el sonido está prendido), en la MISMA tarjeta oscura del
 * resultado (`data-tarjeta="resultado"`, sus colores en `resultado.css`). La pieza cae torcida, choca con el borde de la ranura, el borde se
 * enciende en rojo, rebota y queda afuera, apoyada y torcida.
 *
 * Arranca cuando se puede ver (`arranque.ts`): la entrada abierta, la pestaña visible y la tarjeta en el cuadro. Un toque (o Enter) la vuelve a
 * tirar. Con movimiento reducido, el estado final directo (el del formulario: `useMovimientoReducido`), y el sonido igual.
 */
export function LogoQueNoEncaja(): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const entrada = useSyncExternalStore(suscribirALaEntrada, entradaAbierta, () => false)
  const visible = useSyncExternalStore(suscribirALaVisibilidad, () => document.visibilityState === 'visible', () => false)
  const tarjeta = useRef<HTMLDivElement>(null)
  const [enVista, setEnVista] = useState(false)
  const [intento, setIntento] = useState(0)
  // El intento que ya arrancó: con uno nuevo, la pieza vuelve arriba (se remonta) hasta que pasa su espera.
  const [arrancado, setArrancado] = useState(-1)
  const puede = puedeArrancar({ entrada, visible, enVista })

  useEffect(() => {
    const el = tarjeta.current
    if (el === null) return undefined
    const observador = new IntersectionObserver(([e]) => setEnVista(e !== undefined && e.intersectionRatio >= ARRANQUE.enVistaMinima), { threshold: [0, ARRANQUE.enVistaMinima, 1] })
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    if (!puede || arrancado === intento) return undefined
    const t = window.setTimeout(() => setArrancado(intento), esperaDelIntento(intento))
    return () => window.clearTimeout(t)
  }, [puede, arrancado, intento])

  return (
    <div
      ref={tarjeta}
      data-tarjeta="resultado"
      data-resultado="error"
      data-pieza="logo-que-no-encaja"
      data-arranco={arrancado === intento ? 'si' : 'no'}
      className="relative w-[min(44vw,11rem)] rounded-[var(--radius-medio)] bg-[var(--resultado-fondo)] px-[var(--spacing-6)] pt-[var(--spacing-12)] pb-[var(--spacing-6)] escritorio:w-[15rem]"
    >
      <div style={{ aspectRatio: String(PROPORCION_DEL_ENCAJE) }}>
        <EncajeDelLogo key={intento} resultado="no-encaja" empieza={arrancado === intento} quieto={reducido} alTerminar={() => undefined} />
      </div>
      <button type="button" onClick={() => setIntento((n) => n + 1)} aria-label="Tirar el logo otra vez" className="absolute inset-0 cursor-pointer rounded-[var(--radius-medio)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tinta" />
    </div>
  )
}
