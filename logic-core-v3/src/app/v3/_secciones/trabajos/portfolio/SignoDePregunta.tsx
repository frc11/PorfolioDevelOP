'use client'

import { motion, type Transition } from 'motion/react'
import { useId, useState } from 'react'

import { OPACIDAD_DE_LA_MARCA } from './MarcaDeAgua'
import { SECUENCIA } from './secuencia'
import { ARMADO_S, ARRANQUE_DEL_PUNTO_S, SIGNO, cuadrosDelPunto } from './signo'

/**
 * EL «?» DE «LA TUYA», con el estilo del logo de develOP: «el logo, pero con forma de signo de pregunta». El logo es una cinta de
 * ancho constante (`LOGO_PATH_D`: lazos de radio ~257 por fuera y ~153 por dentro, cortes rectos); este signo es la misma cinta
 * (104 de ancho sobre un lazo de 200 de radio: 252 por fuera y 148 por dentro) con el gancho, la vuelta al revés que baja al
 * palo y el punto, todo de arcos y rectas (un contorno exacto, sin trazos que ensanchar). Y lleva lo de la pieza del logo de
 * `EncajeDelLogo`: el relleno gris, el filo claro (el canto que toma la luz) y la sombra corrida hacia abajo.
 */
export const CONTORNO_DEL_SIGNO =
  'M51.83 323.76A252 252 0 1 1 426 498.24A148 148 0 0 0 352 626.41L352 730L248 730L248 626.41A252 252 0 0 1 374 408.17A148 148 0 1 0 154.25 305.7Z'
export const PUNTO_DEL_SIGNO = 'M248 810H352V914H248Z'
const VISTA_DEL_SIGNO = '36 16 540 920'
/** Lo que se corre la sombra (unidades del dibujo: el del logo, 16 hacia abajo) y el ancho del filo (el del logo, 6). */
const SOMBRA_DEL_SIGNO = 16
const FILO_DEL_SIGNO = 6
const GRIS_DEL_LOGO = 'color-mix(in srgb, var(--color-tinta) 55%, var(--color-fondo))'

/**
 * [B1.2c] EL «?», CENTRADO EN LA TIRA Y ARMÁNDOSE (plan §13, punto 6; la animación, `signo.ts`): el trazo, el relleno y el punto que
 * cae y rebota; después queda quieto, con el brillo de las marcas de agua. Entra cuando «la tuya» se activa (`visible`) y al volver a
 * entrar se rearma (cada entrada lo monta de nuevo); con movimiento reducido aparece armado. Centrado en la tira y adentro de ella:
 * en la tablet parada se achica al ancho de la tira (el dibujo entra entero en su caja, `meet`) y no se corta.
 */
export function SignoDePregunta({ visible, reducido }: { readonly visible: boolean; readonly reducido: boolean }): React.JSX.Element {
  // Cada entrada (`visible` que se prende) lo monta de nuevo: el estado que se ajusta a la prop, en el mismo render.
  const [entrada, setEntrada] = useState(visible ? 1 : 0)
  const [antes, setAntes] = useState(visible)
  if (visible !== antes) {
    setAntes(visible)
    if (visible) setEntrada(entrada + 1)
  }
  return (
    <motion.div
      aria-hidden="true"
      data-marca-de-agua="signo"
      className="pointer-events-none absolute inset-x-8 inset-y-16 flex items-center justify-center"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: reducido || visible ? 0 : SECUENCIA.seVaS }}
    >
      {entrada > 0 ? <SignoQueSeArma key={entrada} reducido={reducido} /> : null}
    </motion.div>
  )
}

/** El dibujo, armándose desde su montaje (exportado para el invariante de Trabajos, que lo marca en el servidor). */
export function SignoQueSeArma({ reducido }: { readonly reducido: boolean }): React.JSX.Element {
  const recorte = `signo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const punto = cuadrosDelPunto()
  const tramo = (duracion: number, demora: number): Transition => (reducido ? { duration: 0 } : { duration: duracion, delay: demora, ease: [...SECUENCIA.curva] })
  return (
    <motion.svg
      focusable="false"
      viewBox={VISTA_DEL_SIGNO}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      initial={{ opacity: reducido ? OPACIDAD_DE_LA_MARCA : SIGNO.opacidadArmandose }}
      animate={{ opacity: OPACIDAD_DE_LA_MARCA }}
      transition={tramo(SIGNO.apagarseS, ARMADO_S)}
    >
      <defs>
        {/* El trazo, recortado contra su propia silueta: vive adentro de lo que el relleno cubre (el `stroke-alignment: inner` del preloader). */}
        <clipPath id={recorte}>
          <path d={CONTORNO_DEL_SIGNO} />
        </clipPath>
      </defs>
      {/* La sombra y el relleno del gancho: entran con el relleno, después del trazo. */}
      <motion.g initial={{ opacity: reducido ? 1 : 0 }} animate={{ opacity: 1 }} transition={tramo(SIGNO.rellenoS, SIGNO.trazoS)}>
        <path d={CONTORNO_DEL_SIGNO} transform={`translate(0 ${String(SOMBRA_DEL_SIGNO)})`} style={{ fill: 'var(--color-fondo)' }} />
        <path d={CONTORNO_DEL_SIGNO} style={{ fill: GRIS_DEL_LOGO }} />
      </motion.g>
      {/* El filo, dibujándose de punta a punta (`pathLength` nativo: el dibujado del preloader). */}
      <g clipPath={`url(#${recorte})`}>
        <motion.path
          d={CONTORNO_DEL_SIGNO}
          pathLength={1}
          fill="none"
          strokeDasharray={1}
          style={{ stroke: 'var(--color-tinta)', strokeWidth: FILO_DEL_SIGNO * 2 }}
          initial={{ strokeDashoffset: reducido ? 0 : 1 }}
          animate={{ strokeDashoffset: 0 }}
          transition={tramo(SIGNO.trazoS, 0)}
        />
      </g>
      {/* El punto: cae y rebota (la física de las piezas del pie), después del relleno. */}
      <motion.g
        initial={{ y: reducido ? 0 : -SIGNO.caida, opacity: reducido ? 1 : 0 }}
        animate={{ y: reducido ? 0 : punto.y, opacity: 1 }}
        transition={
          reducido
            ? { duration: 0 }
            : { y: { duration: punto.duracionS, delay: ARRANQUE_DEL_PUNTO_S, times: punto.times, ease: 'linear' }, opacity: { duration: 0.05, delay: ARRANQUE_DEL_PUNTO_S } }
        }
      >
        <path d={PUNTO_DEL_SIGNO} transform={`translate(0 ${String(SOMBRA_DEL_SIGNO)})`} style={{ fill: 'var(--color-fondo)' }} />
        <path d={PUNTO_DEL_SIGNO} style={{ fill: GRIS_DEL_LOGO, stroke: 'var(--color-tinta)', strokeWidth: FILO_DEL_SIGNO }} />
      </motion.g>
    </motion.svg>
  )
}
