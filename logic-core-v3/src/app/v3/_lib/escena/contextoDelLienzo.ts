'use client'

import { useEffect, useSyncExternalStore } from 'react'
import type * as THREE from 'three'

/**
 * [CIERRE A-ter] A13 · EL CONTEXTO DE WEBGL, PERDIDO Y REPUESTO (`webglcontextlost` / `webglcontextrestored`). three se encarga de lo suyo
 * (deja de dibujar y, al reponerse, vuelve a subir la geometría y las texturas), pero lo que se pintó UNA vez en un render target (el
 * estudio de los reflejos de los títulos y del pie) queda vacío, y mientras el contexto está perdido lo impreso no se ve con su DOM apagado.
 * Los textos impresos (`titulos3d/sincronia.ts`, `pie3d/PieDeVolumen.tsx`) leen esto: perdido, sueltan lo armado (su DOM vuelve a la vista);
 * repuesto, rehacen el estudio y vuelven a armar. Sin React ni three en el estado: un número que cambia y sus oyentes.
 */
let perdido = false
let version = 0
const oyentes = new Set<() => void>()
const vigilados = new WeakSet<HTMLCanvasElement>()

function avisar(perdio: boolean): void {
  perdido = perdio
  version += 1
  for (const f of oyentes) f()
}

/** Escucha el lienzo (una vez por lienzo). */
export function vigilarElContexto(lienzo: HTMLCanvasElement): void {
  if (vigilados.has(lienzo)) return
  vigilados.add(lienzo)
  lienzo.addEventListener('webglcontextlost', () => avisar(true))
  lienzo.addEventListener('webglcontextrestored', () => avisar(false))
}

export const contextoPerdido = (): boolean => perdido

function suscribir(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}

/** Cuántas veces se perdió o se repuso el contexto del lienzo de `gl`: en las dependencias de lo que se arma, lo rehace. */
export function useVersionDelContexto(gl: THREE.WebGLRenderer): number {
  useEffect(() => vigilarElContexto(gl.domElement), [gl])
  return useSyncExternalStore(
    suscribir,
    () => version,
    () => 0,
  )
}
