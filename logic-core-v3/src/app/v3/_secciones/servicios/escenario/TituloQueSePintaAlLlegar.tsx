'use client'

import type { MotionValue } from 'motion/react'
import { useEffect, useRef, type CSSProperties } from 'react'

import { useMovimientoReducido } from '../../../_lib/motion/reducido'
import { TIPOGRAFIA_QUE_SE_PINTA } from '../../tu-panel/TituloQueSePinta'
import { avanceDeLaPalabra, grisSinPintar } from '../../tu-panel/pintado'

/**
 * [C2-50] «NUESTROS SERVICIOS», EL TÍTULO QUE SE PINTA AL LLEGAR (ítem 12) — en la letra del título del Panel (la display de
 * mayúsculas, `TIPOGRAFIA_QUE_SE_PINTA`) y con su pintado de gris claro a tinta palabra por palabra (`pintado.ts`), pero por TIEMPO
 * y rápido: cuando el título termina de llegar (el progreso de la entrada, P2, en 1) se pinta en `PINTADO_MS`; si la entrada vuelve
 * para atrás, se despinta. Sin progreso (el teléfono, sin coreografía), se pinta al quedar a la vista. Con movimiento reducido, pintado
 * entero (el defecto de la variable es 1).
 *
 * El tamaño lo dicen `--divisor-del-titulo` y `--tope-del-titulo` (los mismos nombres del Panel), puestos por quien lo monta: más
 * chico que el del Panel, para que el título quede en el tercio del medio y el globo de web se pose sin pisarlo (`capa.ts`).
 */
export const PINTADO_MS = 650

const COLOR_DE_LA_PALABRA = '[color:color-mix(in_oklab,var(--color-tinta)_calc(var(--pintado,1)*100%),var(--gris-del-pintado))]'

export interface Renglon {
  readonly palabras: readonly string[]
}

export function TituloQueSePintaAlLlegar({ renglones, progreso, id }: { readonly renglones: readonly Renglon[]; readonly progreso: MotionValue<number> | null; readonly id: string }): React.JSX.Element {
  const titulo = useRef<HTMLHeadingElement>(null)
  const reducido = useMovimientoReducido()

  useEffect(() => {
    const el = titulo.current
    if (reducido || el === null) return undefined
    const palabras = [...el.querySelectorAll<HTMLElement>('[data-palabra]')]
    let avance = 0
    let objetivo = 0
    let pedido = 0
    let antes = 0
    const escribir = (): void => palabras.forEach((p, i) => p.style.setProperty('--pintado', avanceDeLaPalabra(avance, i, palabras.length).toFixed(4)))
    const cuadro = (t: number): void => {
      const dt = antes === 0 ? 16 : t - antes
      antes = t
      avance = objetivo > avance ? Math.min(objetivo, avance + dt / PINTADO_MS) : objetivo
      escribir()
      pedido = avance === objetivo ? 0 : requestAnimationFrame(cuadro)
    }
    const ir = (a: number): void => {
      if (a === objetivo) return
      objetivo = a
      antes = 0
      if (pedido === 0) pedido = requestAnimationFrame(cuadro)
    }
    escribir()
    let soltar: () => void
    if (progreso !== null) {
      const mirar = (p: number): void => (p >= 0.999 ? ir(1) : p < 0.5 ? ir(0) : undefined)
      mirar(progreso.get())
      soltar = progreso.on('change', mirar)
    } else {
      const mirador = new IntersectionObserver(([e]) => ir(e?.isIntersecting === true ? 1 : 0), { threshold: 0.6 })
      mirador.observe(el)
      soltar = () => mirador.disconnect()
    }
    return () => {
      soltar()
      if (pedido !== 0) cancelAnimationFrame(pedido)
      for (const p of palabras) p.style.removeProperty('--pintado')
    }
  }, [progreso, reducido])

  return (
    <h2 ref={titulo} id={id} data-pieza="titulo-que-se-pinta" className={TIPOGRAFIA_QUE_SE_PINTA} style={{ '--gris-del-pintado': grisSinPintar() } as CSSProperties}>
      {renglones.map((renglon, k) => (
        <span key={renglon.palabras.join(' ')} data-caja-del-titulo="" className="block whitespace-nowrap">
          {renglon.palabras.map((palabra, j) => (
            <span key={palabra}>
              {k > 0 || j > 0 ? ' ' : null}
              <span data-palabra="" className={COLOR_DE_LA_PALABRA}>
                {palabra}
              </span>
            </span>
          ))}
        </span>
      ))}
    </h2>
  )
}
