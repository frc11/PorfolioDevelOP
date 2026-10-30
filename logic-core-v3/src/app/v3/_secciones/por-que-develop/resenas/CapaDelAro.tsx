'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

import { sonar } from '../../../_lib/sonido/bus'
import { ARO } from '../../../_lib/escena/resenas/aro'
import { CAPA_DEL_ARO, RESENAS_EN_VIVO, TARJETAS_DEL_ARO, resenaDeCadaPlaca, suscribirALasResenas, versionDeLasResenas } from '../../../_lib/escena/resenas/enVivo'
import { RESENAS, TEXTO_DE_LAS_RESENAS, enlaceDelTrabajo } from './contenido'
import { CaraDeLaResena, VerTrabajo } from './TarjetaDeResena'

const PLACAS = Array.from({ length: ARO.placas }, (_, i) => i)
/** Lo que el puntero tiene que correrse (px) para que un clic sea un arrastre. */
const UMBRAL_DEL_ARRASTRE = 6

/**
 * [NOCTURNO B2] LAS TARJETAS DEL ARO, del lado del DOM — una por placa física: un enlace al trabajo de su reseña en el Portfolio (el deep
 * link de B1: el escucha del Portfolio lo lleva al paso). La escena las lleva al frente de su placa en cada cuadro y dice cuál se lee
 * (`_lib/escena/resenas/tarjetas.ts`). Qué reseña muestra cada una lo decide la escena (cambia en la nuca del aro, donde no se ve). Son del
 * puntero: para el lector y el teclado están las reseñas enteras, iguales en las dos ramas (`ResenasParaElLector.tsx`).
 *
 *   · hover (mouse): el aro frena, la placa sube, suena el `tic` de la barra y aparece «Ver trabajo →» (CSS);
 *   · clic: el `clic` de siempre (el escucha global del sonido) y el ancla del trabajo;
 *   · arrastrar gira el aro (con inercia al soltar; por defecto desde C2-70, sin bandera); el clic de un arrastre no navega;
 *   · [C2-70] con el mouse sobre el aro, el cartel «Mantené para arrastrar» sale desde el puntero y lo sigue (arrastrando, se va).
 */
export function CapaDelAro(): React.JSX.Element {
  useSyncExternalStore(suscribirALasResenas, versionDeLasResenas, versionDeLasResenas)
  const indices = resenaDeCadaPlaca()
  const capa = useRef<HTMLDivElement>(null)
  const cartel = useRef<HTMLSpanElement>(null)
  const arrastrado = useRef(false)

  useEffect(() => {
    CAPA_DEL_ARO.el = capa.current
    return () => {
      CAPA_DEL_ARO.el = null
    }
  }, [])

  useEffect(() => {
    const el = capa.current
    const v = RESENAS_EN_VIVO.arrastre
    v.activo = false
    if (el === null) return undefined
    let x: number | null = null
    let id = -1
    // El cartel: sigue al mouse sobre una tarjeta del aro; se va al salir de todas o arrastrando.
    const mostrarElCartel = (e: PointerEvent): void => {
      const c = cartel.current
      if (c === null || e.pointerType !== 'mouse') return
      const sobreElAro = e.target instanceof Element && e.target.closest('[data-pieza="resena-del-aro"]') !== null && el.contains(e.target)
      const visible = sobreElAro && !arrastrado.current
      if (visible) {
        const caja = el.getBoundingClientRect()
        c.style.transform = `translate3d(${String(Math.round(e.clientX - caja.left + 14))}px, ${String(Math.round(e.clientY - caja.top + 18))}px, 0)`
      }
      if (c.hasAttribute('data-visible') !== visible) c.toggleAttribute('data-visible', visible)
    }
    const abajo = (e: PointerEvent): void => {
      if (e.pointerType === 'touch' || e.button !== 0) return
      x = e.clientX
      id = e.pointerId
      arrastrado.current = false
    }
    const mover = (e: PointerEvent): void => {
      mostrarElCartel(e)
      if (x === null || e.pointerId !== id) return
      const dx = e.clientX - x
      if (!arrastrado.current && Math.abs(dx) < UMBRAL_DEL_ARRASTRE) return
      arrastrado.current = true
      v.activo = true
      v.dx += dx
      x = e.clientX
    }
    const arriba = (e: PointerEvent): void => {
      if (e.pointerId !== id) return
      x = null
      v.activo = false
    }
    el.addEventListener('pointerdown', abajo)
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', arriba)
    window.addEventListener('pointercancel', arriba)
    return () => {
      el.removeEventListener('pointerdown', abajo)
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', arriba)
      window.removeEventListener('pointercancel', arriba)
      v.activo = false
    }
  }, [])

  return (
    <div
      ref={capa}
      data-pieza="capa-del-aro"
      aria-hidden="true"
      // [L5] Arrastrar el aro no selecciona texto (se pintaba de azul: lote2/08).
      className="pointer-events-none absolute inset-0 select-none"
      style={{ zIndex: 1 }}
      onClickCapture={(e) => {
        if (!arrastrado.current) return
        arrastrado.current = false
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {PLACAS.map((i) => {
        const r = RESENAS[(indices[i] ?? i) % RESENAS.length]
        return (
          <a
            key={i}
            ref={(el) => {
              TARJETAS_DEL_ARO[i] = el
            }}
            href={enlaceDelTrabajo(r)}
            draggable={false}
            tabIndex={-1}
            data-pieza="resena-del-aro"
            data-placa={i}
            className="group pointer-events-auto invisible absolute top-0 left-0 block h-[var(--alto-de-la-tarjeta)] w-[var(--ancho-de-la-tarjeta)] origin-top-left"
            onPointerEnter={(e) => {
              if (e.pointerType === 'touch') return
              RESENAS_EN_VIVO.senalada = i
              sonar('tic')
            }}
            onPointerLeave={() => {
              if (RESENAS_EN_VIVO.senalada === i) RESENAS_EN_VIVO.senalada = -1
            }}
          >
            <VerTrabajo />
            <CaraDeLaResena resena={r} />
          </a>
        )
      })}
      {/* [C2-90v] `data-visible` de presencia; la escala transiciona con el fundido por `banda.css` (sin el `transform` que sigue al mouse). */}
      <span
        ref={cartel}
        data-pieza="cartel-del-arrastre"
        className="pointer-events-none absolute top-0 left-0 origin-top-left scale-75 whitespace-nowrap rounded-[var(--radius-fuerte)] bg-tinta px-[var(--spacing-4)] py-[var(--spacing-2)] text-cuerpo text-fondo opacity-0 shadow-flotante transition-opacity duration-media data-visible:scale-100 data-visible:opacity-100"
        style={{ zIndex: 2000 }}
      >
        {TEXTO_DE_LAS_RESENAS.arrastrar}
      </span>
    </div>
  )
}
