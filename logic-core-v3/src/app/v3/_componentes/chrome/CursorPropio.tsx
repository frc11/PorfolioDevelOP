'use client'

import { useEffect, useRef } from 'react'

import {
  ATRIBUTO_SECCION,
  EPSILON_PX,
  SEGUIMIENTO,
  SELECTOR_DE_CONTROLES,
  VALOR_SECCION_INVERTIDA,
} from '../../_lib/cursor'
import { MARCA_CURSOR } from '../../_lib/marcaCursor'

/**
 * EL CURSOR PROPIO — dos capas de DOM que persiguen al puntero.
 *
 * ⚠ Este módulo se importa SÓLO desde `CursorCompuerta.tsx`, de forma
 * perezosa. Importarlo estáticamente desde cualquier otro lado mete el cursor
 * en la carga inicial y las dos compuertas dejan de significar algo.
 *
 * ── Interpola, no está clavado ────────────────────────────────────────────
 *
 * Está medido: con un salto largo el núcleo avanzaba ~10px cada 300ms con la
 * razón decreciendo, y a los 3,1s todavía no había convergido; el halo iba
 * sistemáticamente por detrás del núcleo. Eso es un seguimiento exponencial
 * con dos coeficientes distintos, y así está implementado — el del halo es
 * menor, que es la relación medida.
 *
 * El coeficiente exacto no se midió (hacía falta movimiento real sostenido) y
 * está declarado como decisión en `_lib/cursor.ts`.
 *
 * ── El bucle se apaga solo ────────────────────────────────────────────────
 *
 * Cuando las dos capas convergen dentro de `EPSILON_PX` el `requestAnimationFrame`
 * se corta y no se vuelve a pedir hasta el próximo movimiento. Un cursor
 * quieto no debería costar un fotograma por refresco de pantalla para siempre.
 *
 * ── Nunca oculta el cursor nativo ─────────────────────────────────────────
 *
 * Este componente no escribe `cursor` en ninguna parte, y el CSS tampoco. Las
 * dos capas van `pointer-events: none`, así que `elementFromPoint` ve lo que
 * hay debajo y no a sí mismo.
 *
 * ── Táctil ────────────────────────────────────────────────────────────────
 *
 * Las compuertas son de ANCHO, no de tipo de puntero: un escritorio con
 * pantalla táctil queda arriba del umbral, y eso es deliberado. Pero un evento
 * de dedo no debe mover el cursor —daría un punto que salta en cada toque—,
 * así que se ignoran los `pointermove` que no son de mouse ni de lápiz. Es un
 * filtro de eventos, no una compuerta de montaje.
 */
export default function CursorPropio() {
  const raiz = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const elemento = raiz.current
    if (elemento === null) return

    const destino = { x: 0, y: 0 }
    const nucleo = { x: 0, y: 0 }
    const halo = { x: 0, y: 0 }
    let iniciado = false
    let cuadro = 0

    const escribir = (): void => {
      elemento.style.setProperty('--cursor-nucleo-x', `${nucleo.x}px`)
      elemento.style.setProperty('--cursor-nucleo-y', `${nucleo.y}px`)
      elemento.style.setProperty('--cursor-halo-x', `${halo.x}px`)
      elemento.style.setProperty('--cursor-halo-y', `${halo.y}px`)
    }

    const avanzar = (): void => {
      nucleo.x += (destino.x - nucleo.x) * SEGUIMIENTO.nucleo
      nucleo.y += (destino.y - nucleo.y) * SEGUIMIENTO.nucleo
      halo.x += (destino.x - halo.x) * SEGUIMIENTO.halo
      halo.y += (destino.y - halo.y) * SEGUIMIENTO.halo
      escribir()

      const lejos =
        Math.abs(destino.x - nucleo.x) > EPSILON_PX ||
        Math.abs(destino.y - nucleo.y) > EPSILON_PX ||
        Math.abs(destino.x - halo.x) > EPSILON_PX ||
        Math.abs(destino.y - halo.y) > EPSILON_PX

      cuadro = lejos ? window.requestAnimationFrame(avanzar) : 0
    }

    const arrancarBucle = (): void => {
      if (cuadro === 0) cuadro = window.requestAnimationFrame(avanzar)
    }

    /** Qué hay debajo del puntero: si es un control y de qué sección es. */
    const leerContexto = (x: number, y: number): void => {
      const debajo = document.elementFromPoint(x, y)
      const esControl = debajo !== null && debajo.closest(SELECTOR_DE_CONTROLES) !== null
      if (esControl) elemento.setAttribute('data-sobre', 'control')
      else elemento.removeAttribute('data-sobre')

      // El color acompaña a la SECCIÓN: copiando el atributo, el bloque que
      // S0 ya trae redefine --color-tinta y --color-borde sobre este mismo
      // elemento y las dos capas se dan vuelta solas.
      const enInvertida =
        debajo !== null &&
        debajo.closest(`[${ATRIBUTO_SECCION}="${VALOR_SECCION_INVERTIDA}"]`) !== null
      if (enInvertida) elemento.setAttribute(ATRIBUTO_SECCION, VALOR_SECCION_INVERTIDA)
      else elemento.removeAttribute(ATRIBUTO_SECCION)
    }

    const alMover = (evento: PointerEvent): void => {
      if (evento.pointerType !== 'mouse' && evento.pointerType !== 'pen') return
      destino.x = evento.clientX
      destino.y = evento.clientY

      if (!iniciado) {
        // Sin salto de entrada: la primera lectura coloca las dos capas donde
        // ya está el puntero en vez de hacerlas viajar desde el origen.
        nucleo.x = destino.x
        nucleo.y = destino.y
        halo.x = destino.x
        halo.y = destino.y
        iniciado = true
        escribir()
        elemento.setAttribute('data-activo', 'si')
      }

      leerContexto(destino.x, destino.y)
      arrancarBucle()
    }

    const alSalir = (): void => {
      elemento.removeAttribute('data-activo')
    }

    const alEntrar = (): void => {
      if (iniciado) elemento.setAttribute('data-activo', 'si')
    }

    window.addEventListener('pointermove', alMover, { passive: true })
    document.addEventListener('pointerleave', alSalir)
    document.addEventListener('pointerenter', alEntrar)

    return () => {
      window.removeEventListener('pointermove', alMover)
      document.removeEventListener('pointerleave', alSalir)
      document.removeEventListener('pointerenter', alEntrar)
      if (cuadro !== 0) window.cancelAnimationFrame(cuadro)
    }
  }, [])

  return (
    <div
      ref={raiz}
      data-pieza="cursor"
      // La MARCA viaja como valor de atributo: se usa en tiempo de ejecución,
      // así que ningún minificador la pliega. Es lo que `s3-peso.invariant.ts`
      // busca en la salida del build para demostrar que el chunk es perezoso.
      data-cursor={MARCA_CURSOR}
      aria-hidden="true"
    >
      {/* El halo va primero: queda debajo del núcleo sin un z-index propio. */}
      <div data-parte="halo" />
      <div data-parte="nucleo" />
    </div>
  )
}
