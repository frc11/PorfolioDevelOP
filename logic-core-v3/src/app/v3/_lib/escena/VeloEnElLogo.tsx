'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import type * as THREE from 'three'

import { ESCENARIO_MIN_ANCHO_PX } from '../compuerta'
import { hayBanco } from './entorno'
import { VELO_DEL_TEXTO, VELO_EN_LA_ESCENA, conElVeloEnElLogo } from './veloDelTexto'

/**
 * [PULIDO 2] 3 · EL VELO EN LA ESCENA (`?velo=escena`): parchea el logo una vez y, en cada cuadro abajo de 1024, mide los textos
 * de Trabajos que se ven (la bajada del cartel y el de la demo a la vista) y le pasa al sombreador una elipse por cada uno, con
 * la opacidad con que se ve. Marca la raíz (`data-velo="escena"`) para que la hoja saque el velo del DOM.
 */
const TEXTOS = "[data-panel='trabajos'] [data-pieza='cartel'] p, [data-panel='trabajos'] [data-capa='demos'] [data-pieza='texto']"

/** Sólo para el banco: el velo apagado. */
const APAGADO_EN_EL_BANCO = { valor: false }

/** La opacidad con que se ve un elemento (el producto de la de él y sus ancestros, hasta la sección). */
function opacidadVista(e: Element): number {
  let o = 1
  for (let n: Element | null = e; n !== null && o > 0.01; n = n.parentElement) {
    o *= Number(getComputedStyle(n).opacity) || 0
    if (n.hasAttribute('data-panel')) break
  }
  return o
}

export function VeloEnElLogo({ logoMaterialRef }: { readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null> }) {
  useEffect(() => {
    const raiz = document.querySelector('[data-v3]')
    raiz?.setAttribute('data-velo', 'escena')
    // Con banco: el velo apagado y prendido (el contraste mide lo que hay detrás del texto sin él).
    const ventana = window as Window & { __veloDelBanco?: { apagar: (apagado: boolean) => void } }
    if (hayBanco()) ventana.__veloDelBanco = { apagar: (apagado) => { APAGADO_EN_EL_BANCO.valor = apagado } }
    return () => {
      raiz?.removeAttribute('data-velo')
      VELO_DEL_TEXTO.uFuerzaDelVelo.value.fill(0)
      delete ventana.__veloDelBanco
    }
  }, [])

  const parcheado = useRef<THREE.MeshStandardMaterial | null>(null)
  useFrame((state) => {
    const material = logoMaterialRef.current
    if (material !== null && parcheado.current !== material) {
      conElVeloEnElLogo(material)
      parcheado.current = material
    }
    const fuerzas = VELO_DEL_TEXTO.uFuerzaDelVelo.value
    fuerzas.fill(0)
    if (window.innerWidth >= ESCENARIO_MIN_ANCHO_PX || APAGADO_EN_EL_BANCO.valor) return
    const dpr = state.gl.getPixelRatio()
    const alto = state.size.height * dpr
    let i = 0
    for (const e of document.querySelectorAll(TEXTOS)) {
      if (i >= VELO_EN_LA_ESCENA.textos) break
      const r = e.getBoundingClientRect()
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > window.innerHeight) continue
      const o = opacidadVista(e)
      if (o <= 0.01) continue
      VELO_DEL_TEXTO.uVelos.value[i].set((r.left + r.width / 2) * dpr, alto - (r.top + r.height / 2) * dpr, (VELO_EN_LA_ESCENA.ancho * r.width * dpr) / 2, (VELO_EN_LA_ESCENA.alto * r.height * dpr) / 2)
      fuerzas[i] = VELO_EN_LA_ESCENA.fuerza * o
      i += 1
    }
  })
  return null
}
