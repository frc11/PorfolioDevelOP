'use client'

import { motion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'

import { LOGO_INK_VIEWBOX, LOGO_PATH_D } from '@/components/ui/LogoMark'

import { sonar } from '../../_lib/sonido/bus'

/**
 * [PULIDO 11] B2 · B3 · EL ENCASTRE DEL RESULTADO — el vocabulario del sitio (el logo que encaja en su hueco) dicho en chico: en
 * la tarjeta hay una RANURA con la forma del logo y una PIEZA del logo que baja.
 *
 *   · `encaja` (el éxito): la pieza cae (arranca quieta y acelera: la gravedad), entra al ras con un rebote mínimo y suena el
 *     pestillo; de la ranura sale una onda de luz blanca y el borde se enciende un instante. Dice «llegó» sin decirlo.
 *   · `no-encaja` (el error): la pieza cae torcida, choca con el borde de la ranura (no entra), el borde se enciende en ROJO, la
 *     pieza rebota y queda afuera, apoyada y torcida; suena un golpe grave corto (el pulso).
 *
 * Arranca con `empieza` (cuando la tarjeta ya se ve: terminado el volteo) y avisa con `alTerminar`. Con movimiento reducido, el
 * estado final directo (y el sonido igual: no es movimiento). Los tiempos, en `ENCAJE`. SVG con Motion: sin lienzo propio.
 */
export const ENCAJE = {
  /** Cuánto baja la pieza (unidades del logo: su alto es 681) y cuánto más grande arranca (más cerca de la cámara). */
  caida: 330,
  cerca: 1.12,
  /** Éxito: la caída, el contacto (en la fracción de la caída) y el rebote (unidades); cuándo avisa (s). */
  exito: { s: 0.95, contacto: 0.62, rebote: 22, termina: 1.05 },
  /** Error: dónde choca (unidades sobre la ranura), cuánto rebota, dónde queda y torcida cuánto (grados). */
  error: { s: 1.35, contacto: 0.5, choca: -96, rebota: -300, queda: -170, corre: 130, torcida: -13, tumbada: -24, termina: 1.45 },
  /** La onda de luz del éxito: cuánto se abre y cuánto dura (s). */
  onda: { escala: 1.42, s: 0.75 },
} as const

const V = LOGO_INK_VIEWBOX
const MARGEN = 60
// La vista es la ranura con su margen: la pieza cae desde arriba de la caja (el SVG no recorta).
const VISTA = `${String(V.x - MARGEN)} ${String(V.y - MARGEN)} ${String(V.width + 2 * MARGEN)} ${String(V.height + 2 * MARGEN)}`
/** La proporción de la vista (ancho / alto): la de la caja que la contiene. */
export const PROPORCION_DEL_ENCAJE = (V.width + 2 * MARGEN) / (V.height + 2 * MARGEN)

export type Encaje = 'encaja' | 'no-encaja'

interface Props {
  readonly resultado: Encaje
  readonly empieza: boolean
  readonly quieto: boolean
  readonly alTerminar: () => void
}

export function EncajeDelLogo({ resultado, empieza, quieto, alTerminar }: Props): React.JSX.Element {
  const id = useId().replace(/:/g, '')
  const [tocado, setTocado] = useState(false)
  // Un solo sonido por encastre (en desarrollo React corre los efectos dos veces).
  const sono = useRef(false)
  const avisar = useRef(alTerminar)
  useEffect(() => {
    avisar.current = alTerminar
  })
  const exito = resultado === 'encaja'
  const T = exito ? ENCAJE.exito : ENCAJE.error
  // Con movimiento reducido, el contacto es el estado final directo (no espera a nadie).
  const contacto = tocado || (empieza && quieto)
  useEffect(() => {
    if (!empieza) return undefined
    if (quieto) {
      if (!sono.current) sonar(exito ? 'pestillo' : 'pulso')
      sono.current = true
      avisar.current()
      return undefined
    }
    const toca = window.setTimeout(() => {
      setTocado(true)
      if (!sono.current) sonar(exito ? 'pestillo' : 'pulso')
      sono.current = true
    }, T.s * T.contacto * 1000)
    const termina = window.setTimeout(() => avisar.current(), T.termina * 1000)
    return () => {
      window.clearTimeout(toca)
      window.clearTimeout(termina)
    }
  }, [empieza, quieto, exito, T])

  const E = ENCAJE.error
  // La pieza: arriba y más cerca, invisible, hasta que empieza; con movimiento reducido, donde termina.
  const arriba = { y: -ENCAJE.caida, scale: ENCAJE.cerca, opacity: 0, x: exito ? 0 : E.corre * 0.4, rotate: exito ? 0 : E.torcida * 0.4 }
  const final = exito ? { y: 0, scale: 1, opacity: 1, x: 0, rotate: 0 } : { y: E.queda, scale: 1.02, opacity: 1, x: E.corre, rotate: E.tumbada }
  const pieza = !empieza ? arriba : quieto ? final : exito
    ? { y: [-ENCAJE.caida, 0, -ENCAJE.exito.rebote, 0], scale: [ENCAJE.cerca, 1, 1.006, 1], opacity: [0, 1, 1, 1], x: 0, rotate: 0 }
    : { y: [-ENCAJE.caida, E.choca, E.rebota, E.queda], scale: [ENCAJE.cerca, 1.03, 1.06, 1.02], opacity: [0, 1, 1, 1], x: [E.corre * 0.4, E.corre * 0.8, E.corre * 1.1, E.corre], rotate: [E.torcida * 0.4, E.torcida, E.tumbada * 1.2, E.tumbada] }
  const tiempos = exito ? [0, ENCAJE.exito.contacto, 0.8, 1] : [0, E.contacto, 0.74, 1]
  // La caída: arranca quieta y acelera (la gravedad); después, el rebote amortiguado.
  const curvas = exito ? (['easeIn', 'easeOut', 'easeIn'] as const) : (['easeIn', 'easeOut', [0.34, 1.56, 0.64, 1] as const] as const)
  return (
    <svg viewBox={VISTA} aria-hidden="true" focusable="false" className="block size-full overflow-visible" data-encaje={resultado} data-contacto={contacto ? '' : undefined}>
      <defs>
        <clipPath id={`ranura-${id}`}>
          <path d={LOGO_PATH_D} />
        </clipPath>
        <filter id={`desenfoque-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <radialGradient id={`luz-${id}`}>
          <stop offset="0%" stopColor="var(--resultado-luz)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--resultado-luz)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* La ranura: un pozo con la forma del logo, con la sombra de su borde de arriba adentro (se lee hundida). */}
      <path d={LOGO_PATH_D} fill="var(--resultado-pozo)" />
      <g clipPath={`url(#ranura-${id})`}>
        <path d={LOGO_PATH_D} fill="none" stroke="var(--resultado-sombra)" strokeWidth={46} filter={`url(#desenfoque-${id})`} transform="translate(0 16)" />
      </g>
      {/* El borde, tenue; con el contacto se enciende encima (blanco al encajar; rojo al chocar): sólo cambia la opacidad (Motion no
          interpola un color hecho con color-mix). */}
      <path d={LOGO_PATH_D} fill="none" strokeWidth={exito ? 7 : 10} stroke="var(--resultado-borde)" />
      <motion.path
        d={LOGO_PATH_D}
        fill="none"
        strokeWidth={exito ? 7 : 10}
        stroke={exito ? 'var(--resultado-luz)' : 'var(--rojo-del-error)'}
        initial={false}
        animate={{ opacity: !contacto ? 0 : exito ? (quieto ? 0.35 : [0.9, 0.35]) : quieto ? 0.85 : [1, 0.85] }}
        transition={{ duration: quieto ? 0 : exito ? 0.6 : 0.35 }}
      />
      {/* La onda de luz del éxito: el contorno que se abre desde la ranura y un resplandor. */}
      {exito && contacto && !quieto && (
        <>
          <motion.ellipse cx={V.x + V.width / 2} cy={V.y + V.height / 2} rx={V.width * 0.55} ry={V.height * 0.6} fill={`url(#luz-${id})`} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: [0, 0.75, 0], scale: [0.7, 1.05, 1.25] }} transition={{ duration: ENCAJE.onda.s, ease: 'easeOut' }} />
          <motion.path d={LOGO_PATH_D} fill="none" stroke="var(--resultado-luz)" strokeWidth={9} initial={{ opacity: 0.95, scale: 1 }} animate={{ opacity: 0, scale: ENCAJE.onda.escala }} transition={{ duration: ENCAJE.onda.s, ease: 'easeOut' }} />
        </>
      )}
      {/* El error: el resplandor rojo del borde. */}
      {!exito && contacto && !quieto && (
        <motion.path d={LOGO_PATH_D} fill="none" stroke="var(--rojo-del-error)" strokeWidth={26} filter={`url(#desenfoque-${id})`} initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0.35] }} transition={{ duration: 0.7, ease: 'easeOut' }} />
      )}
      {/* La sombra de la pieza en la ranura: se achica y se oscurece mientras baja (con el error, corrida: no entra). */}
      <motion.path
        d={LOGO_PATH_D}
        fill="var(--resultado-sombra)"
        filter={`url(#desenfoque-${id})`}
        initial={false}
        animate={!empieza ? { opacity: 0, scale: 1.15, x: 0 } : quieto ? { opacity: exito ? 0 : 0.3, scale: 1, x: exito ? 0 : E.corre * 0.5 } : { opacity: exito ? [0, 0.45, 0] : [0, 0.4, 0.3], scale: [1.15, 1, 1], x: exito ? 0 : [0, E.corre * 0.4, E.corre * 0.5] }}
        transition={{ duration: quieto ? 0 : T.s * (exito ? 0.75 : 1), ease: 'easeIn' }}
      />
      {/* La pieza: el logo lleno, con un filo claro (el canto que toma la luz). */}
      <motion.g initial={false} animate={pieza} transition={quieto || !empieza ? { duration: 0 } : { duration: T.s, times: tiempos, ease: [...curvas] }}>
        <path d={LOGO_PATH_D} fill="var(--resultado-tinta)" />
        <path d={LOGO_PATH_D} fill="none" stroke="var(--resultado-filo)" strokeWidth={6} />
      </motion.g>
    </svg>
  )
}
