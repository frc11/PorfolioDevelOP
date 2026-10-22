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
 * (`_lib/escena/resenas/tarjetas.ts`): sólo esas se ven y entran en el orden del teclado. Qué reseña muestra cada una lo decide la escena
 * (cambia en la nuca del aro, donde no se ve).
 *
 *   · hover (mouse): el aro frena, la placa sube, suena el `tic` de la barra y aparece «Ver trabajo →» (CSS);
 *   · clic: el `clic` de siempre (el escucha global del sonido) y el ancla del trabajo;
 *   · con `?resenas-arrastre=si`, arrastrar gira el aro (con inercia al soltar); el clic de un arrastre no navega.
 */
export function CapaDelAro({ arrastre }: { readonly arrastre: boolean }): React.JSX.Element {
  useSyncExternalStore(suscribirALasResenas, versionDeLasResenas, versionDeLasResenas)
  const indices = resenaDeCadaPlaca()
  const capa = useRef<HTMLDivElement>(null)
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
    if (!arrastre || el === null) return undefined
    let x: number | null = null
    let id = -1
    const abajo = (e: PointerEvent): void => {
      if (e.pointerType === 'touch' || e.button !== 0) return
      x = e.clientX
      id = e.pointerId
      arrastrado.current = false
    }
    const mover = (e: PointerEvent): void => {
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
  }, [arrastre])

  return (
    <div
      ref={capa}
      data-pieza="capa-del-aro"
      className="pointer-events-none absolute inset-0"
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
            aria-label={TEXTO_DE_LAS_RESENAS.enlace(r.nombre, r.negocio)}
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
            onFocus={() => {
              RESENAS_EN_VIVO.senalada = i
            }}
            onBlur={() => {
              if (RESENAS_EN_VIVO.senalada === i) RESENAS_EN_VIVO.senalada = -1
            }}
          >
            <VerTrabajo />
            <CaraDeLaResena resena={r} />
          </a>
        )
      })}
    </div>
  )
}
