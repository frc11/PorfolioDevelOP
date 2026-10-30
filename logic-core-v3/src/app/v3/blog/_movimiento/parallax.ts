'use client'

import { useEffect, type RefObject } from 'react'

import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

/**
 * [M2] EL PARALLAX DE LAS FOTOS DEL BLOG — la foto va más despacio que su marco: con el marco abajo del centro del cuadro, la foto está corrida
 * hacia arriba adentro de él, y a medida que sube se corre hacia abajo (la profundidad). La capa de la foto sobra `SOBRA` de cada lado del marco
 * (`CLASE_DE_LA_CAPA`), así el corrimiento nunca deja ver el borde.
 *
 * UNA sola suscripción de scroll para todas las fotos de la página (el carrusel, la grilla, la nota y las relacionadas), y primero se LEE todo y
 * después se ESCRIBE todo: la lección de la galería vieja de «Tu panel» (`af4e53ca^:…/tu-panel/Galeria.tsx`), donde leer y escribir intercalados
 * forzaba un recálculo por foto y por cuadro. Sólo se mueven las fotos cerca del cuadro (`IntersectionObserver`). Con movimiento reducido, quietas.
 */
export const SOBRA = 0.08

/** La capa de la foto: el marco más la sobra de cada lado (8 %, `SOBRA`). Clase escrita entera para el escáner. */
export const CLASE_DE_LA_CAPA = 'pointer-events-none absolute -inset-[8%] will-change-transform'

/**
 * Cuánto se corre la foto (px, + hacia abajo) para un marco de `alto` px cuyo tope está en `tope` (coordenadas del cuadro, de `altoDelCuadro`):
 * cero con el marco centrado; la sobra entera hacia arriba con el marco recién asomando abajo, y hacia abajo al irse por arriba. Total y acotada.
 */
export function corrimientoDeLaFoto(tope: number, alto: number, altoDelCuadro: number): number {
  if (!(alto > 0) || !(altoDelCuadro > 0)) return 0
  const recorrido = (altoDelCuadro + alto) / 2
  const d = (tope + alto / 2 - altoDelCuadro / 2) / recorrido
  const acotado = d < -1 ? -1 : d > 1 ? 1 : d
  return -acotado * SOBRA * alto
}

interface FotoRegistrada {
  readonly marco: HTMLElement
  readonly capa: HTMLElement
  cerca: boolean
}

const fotos = new Set<FotoRegistrada>()
let pedido = 0
let observador: IntersectionObserver | null = null

function pintar(): void {
  pedido = 0
  const alto = window.innerHeight
  const cerca = [...fotos].filter((f) => f.cerca)
  // Lecturas: el borde de cada marco. Después, las escrituras.
  const bordes = cerca.map((f) => f.marco.getBoundingClientRect())
  cerca.forEach((f, i) => {
    const b = bordes[i]
    if (b !== undefined) f.capa.style.transform = `translate3d(0, ${corrimientoDeLaFoto(b.top, b.height, alto).toFixed(1)}px, 0)`
  })
}

function pedir(): void {
  if (pedido === 0) pedido = requestAnimationFrame(pintar)
}

function registrar(marco: HTMLElement, capa: HTMLElement): () => void {
  const foto: FotoRegistrada = { marco, capa, cerca: false }
  if (fotos.size === 0) {
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    // Un margen de medio cuadro: la foto ya está en su lugar cuando asoma.
    observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) for (const f of fotos) if (f.marco === e.target) f.cerca = e.isIntersecting
        pedir()
      },
      { rootMargin: '50% 0px 50% 0px' },
    )
  }
  fotos.add(foto)
  observador?.observe(marco)
  pedir()
  return () => {
    fotos.delete(foto)
    observador?.unobserve(marco)
    capa.style.transform = ''
    if (fotos.size > 0) return
    window.removeEventListener('scroll', pedir)
    window.removeEventListener('resize', pedir)
    observador?.disconnect()
    observador = null
    if (pedido !== 0) cancelAnimationFrame(pedido)
    pedido = 0
  }
}

/** Mueve la `capa` adentro del `marco` con el scroll, mientras no haya movimiento reducido. */
export function useParallaxDeLaFoto(marco: RefObject<HTMLElement | null>, capa: RefObject<HTMLElement | null>): void {
  const reducido = usePrefiereMenosMovimiento()
  useEffect(() => {
    const m = marco.current
    const c = capa.current
    if (reducido || m === null || c === null) return undefined
    return registrar(m, c)
  }, [reducido, marco, capa])
}
