'use client'

import { useEffect, useRef, type CSSProperties } from 'react'

import { useCoreografiaActiva } from '../_contrato/coreografia'
import { TARJETAS } from './contenido'
import { Fondo } from './Fondo'
import { arranques, corrimientoDeProfundidad } from './geometria'
import { Tarjeta } from './Tarjeta'

const ULTIMO_ARRANQUE = arranques()[TARJETAS.length - 1]

/**
 * EL CAOS — el encabezado, el fondo y las ocho features en sus lugares de la tabla ([PASADA FINAL] B1: el del sprint
 * nocturno, con las demos usables en su lugar; `geometria.ts`).
 *
 * El caos es un contenedor (`@container`): desde 72rem de contenido las features flotan; antes, en columna. Con la
 * coreografía activa (≥ 1025 y sin movimiento reducido) corre UNA suscripción de scroll para la profundidad de cada
 * pieza con `data-profundidad` (las features y el fondo). B3 · primero se LEE todo y después se ESCRIBE todo: el
 * `offsetTop` y el alto de cada pieza se miden una vez (no ven la transformada que se les escribe) y por cuadro sólo se
 * lee el borde de cada contenedor, una vez por contenedor; antes, una lectura de `getBoundingClientRect` por pieza
 * intercalada con cada escritura forzaba un recálculo de estilos por pieza y por cuadro (medido: el hilo principal
 * saturado con la CPU ×4).
 */
export function Galeria({ encabezado }: { readonly encabezado: React.ReactNode }): React.JSX.Element {
  const anima = useCoreografiaActiva()
  const caos = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raiz = caos.current
    if (!anima || raiz === null) return
    interface Pieza {
      readonly el: HTMLElement
      readonly padre: HTMLElement
      readonly velocidad: number
      arriba: number
      alto: number
    }
    const piezas: Pieza[] = []
    for (const el of raiz.querySelectorAll<HTMLElement>('[data-profundidad]')) {
      const padre = el.offsetParent
      if (padre instanceof HTMLElement) piezas.push({ el, padre, velocidad: Number(el.dataset.profundidad), arriba: 0, alto: 0 })
    }
    const medir = (): void => {
      for (const p of piezas) {
        p.arriba = p.el.offsetTop
        p.alto = p.el.offsetHeight
      }
    }
    let pedido = 0
    const bordes = new Map<HTMLElement, number>()
    const pintar = (): void => {
      pedido = 0
      const alto = window.innerHeight
      // Lecturas: el borde de arriba de cada contenedor, una vez por contenedor.
      bordes.clear()
      for (const p of piezas) if (!bordes.has(p.padre)) bordes.set(p.padre, p.padre.getBoundingClientRect().top)
      // Escrituras: la transformada de cada pieza en cuadro (o cerca).
      for (const p of piezas) {
        const centro = (bordes.get(p.padre) ?? 0) + p.arriba + p.alto / 2
        if (centro < -alto || centro > 2 * alto) continue
        p.el.style.transform = `translate3d(0, ${String(corrimientoDeProfundidad(centro, alto, p.velocidad))}px, 0)`
      }
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(pintar)
    }
    const alCambiarElTamano = (): void => {
      medir()
      pedir()
    }
    medir()
    pintar()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', alCambiarElTamano)
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', alCambiarElTamano)
      if (pedido !== 0) cancelAnimationFrame(pedido)
      for (const p of piezas) p.el.style.transform = ''
    }
  }, [anima])

  // La última feature va en el flujo: el caos reserva arriba el lugar donde arranca (en la columna, nada).
  const alto = { '--arranque-final': `${String(ULTIMO_ARRANQUE)}svh` } as CSSProperties

  return (
    <div ref={caos} data-pieza="caos-del-panel" style={alto} className="@container relative flex flex-col gap-[var(--spacing-12)] escritorio:block">
      <Fondo />
      {encabezado}
      <ul data-pieza="galeria-del-panel" className="flex flex-col gap-y-[calc(var(--spacing-20)*0.875)] escritorio:relative escritorio:block escritorio:pt-[var(--arranque-final)] escritorio:@max-6xl:flex escritorio:@max-6xl:flex-col escritorio:@max-6xl:gap-y-[var(--spacing-20)] escritorio:@max-6xl:pt-0">
        {TARJETAS.map((tarjeta, i) => (
          <Tarjeta key={tarjeta.titulo} tarjeta={tarjeta} indice={i} />
        ))}
      </ul>
    </div>
  )
}
