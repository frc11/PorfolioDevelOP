'use client'

import { motion } from 'motion/react'

import { CURVAS } from '../../_lib/motion/curvas'

/**
 * [PASADA FINAL] C1 · EL PARLANTE, ANIMADO — el mismo dibujo de siempre (el parlante, las dos ondas; apagado, tachado),
 * con el trazo fino y el borde del tono contrario debajo (como el infinito). Al prenderlo las ondas se dibujan, la corta
 * y enseguida la larga, y la cruz se retira; al apagarlo las ondas se cortan (primero la larga) y la cruz se dibuja. Con el
 * motor todavía esperando la primera acción (`suena` falso con el parlante prendido) las ondas quedan tenues y laten
 * despacio ([AJUSTES FINALES] A3: un estado «en espera» honesto, no «activado»): lo que se ve es lo real. Apagado, la cruz
 * de siempre (sus dos trazos se dibujan uno después del otro). Con la curva principal y sin
 * resorte: medido, el de los íconos (400/15) pasa al cortar por un largo de −0,27, y el SVG dibuja ENTERO un trazo con
 * guiones negativos (y al dibujar, la punta tiembla). Con movimiento reducido, sin dibujarse: aparecen y desaparecen.
 */
const PARLANTE = 'M4 9.5h3.2L12 5.5v13l-4.8-4H4z'
const ONDA_CORTA = 'M15.5 9.2a4 4 0 0 1 0 5.6'
const ONDA_LARGA = 'M18.2 6.6a7.6 7.6 0 0 1 0 10.8'
const CRUZ = ['M16 9.5l4.5 5', 'M20.5 9.5l-4.5 5'] as const

/** Cómo se dibuja o se corta cada trazo (nunca sale de 0…1: un tween interrumpido arranca de donde está) y cuánto espera el siguiente (s). */
export const TRAZO_DEL_ICONO = { duration: 0.3, ease: CURVAS.principal } as const
export const ESCALON_DE_LAS_ONDAS_S = 0.08
/** Cuánto se ven las ondas mientras el motor espera la primera acción, hasta dónde laten y cada cuánto (s). */
export const ONDAS_EN_ESPERA = 0.45
export const PULSO_DE_LA_ESPERA = { hasta: 0.75, s: 1.8 } as const
/** El latido de la espera: la opacidad de las ondas va y vuelve, sin parar, suave. */
const LATIDO = { duration: PULSO_DE_LA_ESPERA.s, repeat: Infinity, ease: 'easeInOut' } as const

function Trazos({ prendido, suena, reducido, ...trazo }: { readonly prendido: boolean; readonly suena: boolean; readonly reducido: boolean; readonly stroke: string; readonly strokeWidth: number; readonly opacity?: number }): React.JSX.Element {
  const visible = prendido ? (suena ? 1 : ONDAS_EN_ESPERA) : 0
  // En espera (prendido, sin la primera acción): las ondas laten entre tenues y un poco más; con movimiento reducido, quietas.
  const espera = prendido && !suena && !reducido
  const onda = (demora: number) => {
    const transicion = espera ? { ...TRAZO_DEL_ICONO, delay: demora, opacity: LATIDO } : { ...TRAZO_DEL_ICONO, delay: demora }
    return {
      initial: false as const,
      animate: reducido ? { opacity: visible } : { pathLength: prendido ? 1 : 0, opacity: espera ? [ONDAS_EN_ESPERA, PULSO_DE_LA_ESPERA.hasta, ONDAS_EN_ESPERA] : visible },
      transition: reducido ? { duration: 0 } : transicion,
    }
  }
  return (
    <g {...trazo}>
      <path d={PARLANTE} />
      <motion.path data-parte="onda" d={ONDA_CORTA} {...onda(prendido ? 0 : ESCALON_DE_LAS_ONDAS_S)} />
      <motion.path data-parte="onda" d={ONDA_LARGA} {...onda(prendido ? ESCALON_DE_LAS_ONDAS_S : 0)} />
      {CRUZ.map((d, k) => (
        <motion.path
          key={d}
          data-parte="cruz"
          d={d}
          initial={false}
          animate={reducido ? { opacity: prendido ? 0 : 1 } : { pathLength: prendido ? 0 : 1, opacity: prendido ? 0 : 1 }}
          transition={reducido ? { duration: 0 } : { ...TRAZO_DEL_ICONO, delay: prendido ? 0 : (2 + k) * ESCALON_DE_LAS_ONDAS_S }}
        />
      ))}
    </g>
  )
}

export function IconoDelParlante({ prendido, suena, reducido }: { readonly prendido: boolean; readonly suena: boolean; readonly reducido: boolean }): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="block h-[var(--spacing-5)] w-[var(--spacing-5)] overflow-visible escritorio:h-[var(--spacing-6)] escritorio:w-[var(--spacing-6)]" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* El borde del tono contrario, debajo (como el infinito): se lee sobre cualquier fondo. */}
      <Trazos prendido={prendido} suena={suena} reducido={reducido} stroke="var(--color-fondo)" strokeWidth={3.5} opacity={0.35} />
      <Trazos prendido={prendido} suena={suena} reducido={reducido} stroke="currentColor" strokeWidth={1.5} />
    </svg>
  )
}
