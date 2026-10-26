'use client'

import type { MotionValue } from 'motion/react'
import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'

import { cn } from '@/lib/utils'

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
 *
 * [C2-51] El recomendador lo reusa: `como` (el nivel del encabezado; por defecto `h2`), `className` (se mezcla con la tipografía: la
 * alineación, otro tamaño) y `envolver` (los renglones parten donde no entran, para un título largo). El pintado salió a
 * `usePintadoAlLlegar` para que lo use también un párrafo (el análisis del resultado) con otra duración. Sin esas props, lo de siempre.
 */
export const PINTADO_MS = 650

/** El color de una palabra: la tinta en la proporción de su pintado (`--pintado`), el resto el gris claro (`--gris-del-pintado`). */
export const COLOR_DE_LA_PALABRA = '[color:color-mix(in_oklab,var(--color-tinta)_calc(var(--pintado,1)*100%),var(--gris-del-pintado))]'

/** El gris de lo que todavía no se pintó, para el `style` de quien contiene las palabras. */
export const ESTILO_DEL_PINTADO = { '--gris-del-pintado': grisSinPintar() } as CSSProperties

export interface Renglon {
  readonly palabras: readonly string[]
}

/**
 * El pintado por tiempo de las `[data-palabra]` de `ref`: con `progreso`, al llegar a 1 (y se despinta si baja de la mitad); sin él,
 * al quedar a la vista (el 60 %). Recorre las palabras en `duracionMs`. Con movimiento reducido no hace nada (pintado entero).
 */
export function usePintadoAlLlegar(ref: RefObject<HTMLElement | null>, progreso: MotionValue<number> | null, duracionMs: number = PINTADO_MS): void {
  const reducido = useMovimientoReducido()

  useEffect(() => {
    const el = ref.current
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
      avance = objetivo > avance ? Math.min(objetivo, avance + dt / duracionMs) : objetivo
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
  }, [ref, progreso, reducido, duracionMs])
}

interface Props {
  readonly renglones: readonly Renglon[]
  readonly progreso: MotionValue<number> | null
  readonly id: string
  readonly como?: 'h2' | 'h3' | 'h4'
  readonly className?: string
  readonly envolver?: boolean
}

export function TituloQueSePintaAlLlegar({ renglones, progreso, id, como: Etiqueta = 'h2', className, envolver = false }: Props): React.JSX.Element {
  const titulo = useRef<HTMLHeadingElement>(null)
  usePintadoAlLlegar(titulo, progreso)

  return (
    <Etiqueta ref={titulo} id={id} data-pieza="titulo-que-se-pinta" className={className === undefined ? TIPOGRAFIA_QUE_SE_PINTA : cn(TIPOGRAFIA_QUE_SE_PINTA, className)} style={ESTILO_DEL_PINTADO}>
      {renglones.map((renglon, k) => (
        <span key={renglon.palabras.join(' ')} data-caja-del-titulo="" className={envolver ? 'inline' : 'block whitespace-nowrap'}>
          {renglon.palabras.map((palabra, j) => (
            <span key={`${String(j)}-${palabra}`}>
              {k > 0 || j > 0 ? ' ' : null}
              <span data-palabra="" className={COLOR_DE_LA_PALABRA}>
                {palabra}
              </span>
            </span>
          ))}
        </span>
      ))}
    </Etiqueta>
  )
}
