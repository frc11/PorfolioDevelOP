'use client'

import { useMotionValueEvent, type MotionValue } from 'motion/react'
import { useRef } from 'react'

import { estadoDeLaGota, type VentanaDeLaGota } from './gota'

/**
 * LA CAPA DE LA GOTA — la mitad que toca el DOM. **[B12]**
 *
 * ⚠ **El archivo se llama `CapaDeLaGota.tsx` y no `Gota.tsx`, y no es un
 * capricho:** al lado vive `gota.ts` —el núcleo puro— y en un checkout
 * case-insensitive (Windows) dos módulos del mismo directorio que difieren sólo
 * en la caja se resuelven al azar y la sección se rompe **en silencio**. La
 * regla está escrita en `_contrato/forma.ts`, que la pagó una vez con
 * `seccion.ts` / `Seccion.tsx`. Acá se cumplió al primer intento porque `tsc`
 * la cazó — el nombre lleva la cicatriz.
 *
 * El núcleo es puro y vive en `gota.ts`; acá está lo mínimo que escribe en el
 * navegador. **Es el mismo reparto que B3 hizo con el revelado**: `maskDeRevelado`
 * es una función y `aplicarRevelado` es la capa fina que le pone la cadena al
 * elemento. La razón es la misma: lo que se afirma es la función, y lo que toca
 * el DOM no tiene aritmética adentro.
 *
 * ── ⚠️ CERO `setState` POR CUADRO, Y ES UNA REGLA DEL SPRINT ──────────────
 *
 * La máscara y la opacidad se escriben con `useMotionValueEvent` sobre un `ref`,
 * o sea `el.style.setProperty` fuera de React. Un `useState` acá sería un render
 * del árbol por cuadro de scroll con la escena 3D dibujando al lado, que es
 * exactamente lo que la regla 9 prohíbe.
 *
 * ⚠️ **Y es `useMotionValueEvent` y no `progreso.on` dentro de un `useEffect`, con
 * el número:** el hook hace exactamente eso, y escribirlo a mano cuesta **40 B
 * más** en la carga inicial —medido entre dos builds del mismo árbol,
 * `s5-presupuesto-recibos-de-b12.ts`—, porque el `useEffect` con su cierre y su
 * arreglo de dependencias minifica peor que la llamada al hook que ya viene
 * empaquetado con el resto de `motion/react`.
 *
 * ── Por qué se ESCONDE en vez de quedarse a opacidad 0 ────────────────────
 *
 * Porque una capa transparente sigue siendo una capa: compone, ocupa una capa de
 * pintura y —sobre todo— es un elemento que un instrumento de contraste puede
 * leer como fondo. Con `visibility: hidden` sale del cuadro y de la lectura.
 * El primer estado sale de la MISMA función pura, en el `style` inicial, así que
 * el servidor y el primer cuadro del cliente dicen lo mismo.
 */
export function CapaDeLaGota({
  progreso,
  ventana,
  className,
}: {
  readonly progreso: MotionValue<number>
  readonly ventana: VentanaDeLaGota
  readonly className?: string
}): React.JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null)

  useMotionValueEvent(progreso, 'change', (p) => {
    const el = ref.current
    if (el === null) return
    const estado = estadoDeLaGota(p, ventana)
    const mask = estado === null ? '' : estado.mask
    el.style.setProperty('mask-image', mask)
    el.style.setProperty('-webkit-mask-image', mask)
    el.style.setProperty('opacity', String(estado === null ? 0 : estado.opacidad))
    el.style.setProperty('visibility', estado === null ? 'hidden' : 'visible')
  })

  const inicial = estadoDeLaGota(progreso.get(), ventana)

  return (
    <div
      ref={ref}
      data-pieza="gota"
      aria-hidden="true"
      className={className}
      style={{
        maskImage: inicial === null ? undefined : inicial.mask,
        WebkitMaskImage: inicial === null ? undefined : inicial.mask,
        opacity: inicial === null ? 0 : inicial.opacidad,
        visibility: inicial === null ? 'hidden' : 'visible',
      }}
    />
  )
}
