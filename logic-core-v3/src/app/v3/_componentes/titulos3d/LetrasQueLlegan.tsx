'use client'

import { motionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { Fragment, useCallback, useLayoutEffect, useRef } from 'react'

import { useReducedMotion } from '@/lib/use-reduced-motion'

import { LLEGADA_3D, llegadaDeLaLetra, transformDeLaLetra } from '../../_lib/titulos3d/llegada'

/**
 * [ESCENA 9] T5 · V1 · EL TÍTULO EN 3D, EN EL DOM (bandera `titulos=dom`; el porqué, en `_lib/titulos3d/llegada.ts`).
 *
 * El título de verdad (el mismo texto y la misma tipografía, nítido a cualquier tamaño) partido en letras con perspectiva
 * de CSS. **Accesible:** para un lector de pantalla hay una sola copia del texto, entera (`sr-only`); las letras van con
 * `aria-hidden`. **Barato:** sólo `transform` y `opacity`, escritos por referencia desde el progreso (ningún render de
 * React por cuadro). **Con movimiento reducido** aparecen sin moverse.
 */

/** Un progreso quieto (llegado), para cuando no hay uno: los ganchos no pueden ser condicionales. */
const LLEGADO = motionValue(1)

interface Props {
  readonly texto: string
  /** El progreso de la llegada (el que movía la pieza); `null`: llegada. */
  readonly progreso: MotionValue<number> | null
}

export function LetrasQueLlegan({ texto, progreso }: Props): React.JSX.Element {
  const reducido = useReducedMotion()
  const letras = useRef<(HTMLSpanElement | null)[]>([])
  // Las letras agrupadas por palabra: una letra suelta en `inline-block` deja cortar el renglón en cualquier lado.
  const palabras: { readonly letras: string[]; readonly desde: number }[] = []
  let desde = 0
  for (const palabra of texto.split(' ')) {
    const letrasDeLaPalabra = Array.from(palabra)
    palabras.push({ letras: letrasDeLaPalabra, desde })
    desde += letrasDeLaPalabra.length
  }
  const aplicar = useCallback(
    (p: number) => {
      const n = letras.current.length
      for (let i = 0; i < n; i += 1) {
        const el = letras.current[i]
        if (el === null || el === undefined) continue
        const e = llegadaDeLaLetra(p, n > 1 ? i / (n - 1) : 0)
        el.style.opacity = e.toFixed(3)
        el.style.transform = reducido ? 'none' : transformDeLaLetra(e)
      }
    },
    [reducido],
  )
  useLayoutEffect(() => {
    aplicar(progreso === null ? 1 : progreso.get())
  }, [aplicar, progreso])
  useMotionValueEvent(progreso ?? LLEGADO, 'change', aplicar)
  return (
    <span className="relative inline-block" style={{ perspective: `${String(LLEGADA_3D.perspectiva)}px` }}>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true" className="inline-block" style={{ transformStyle: 'preserve-3d' }}>
        {palabras.map((p, w) => (
          // Una palabra (y una letra) no cambia de lugar: el índice es su identidad.
          <Fragment key={w}>
            {w > 0 ? ' ' : null}
            <span className="inline-block whitespace-nowrap" style={{ transformStyle: 'preserve-3d' }}>
              {p.letras.map((c, k) => (
                <span
                  key={k}
                  ref={(el) => {
                    letras.current[p.desde + k] = el
                  }}
                  className="inline-block will-change-transform"
                  style={{ transformOrigin: '50% 100%', backfaceVisibility: 'hidden' }}
                >
                  {c}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  )
}
