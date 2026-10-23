'use client'

import { useEffect, useSyncExternalStore } from 'react'
import type * as THREE from 'three'

import { hayBanco } from './entorno'

/**
 * [CIERRE A-ter] A13 · EL CONTEXTO DE WEBGL, PERDIDO Y REPUESTO (`webglcontextlost` / `webglcontextrestored`). three se encarga de lo suyo
 * (deja de dibujar y, al reponerse, vuelve a subir la geometría y las texturas), pero lo que se pintó UNA vez en un render target (el
 * estudio de los reflejos de los títulos y del pie) queda vacío, y mientras el contexto está perdido lo impreso no se ve con su DOM apagado.
 * Los textos impresos (`titulos3d/sincronia.ts`, `pie3d/PieDeVolumen.tsx`) leen esto: perdido, sueltan lo armado (su DOM vuelve a la vista);
 * repuesto, rehacen el estudio y vuelven a armar. Sin React ni three en el estado: un número que cambia y sus oyentes.
 *
 * [C2-71] EL BUG DEL PIE (ítem 25, `lote2/19`: «el form del contacto desapareció»): lo perdido era UNO para toda la página. Cuando la escena
 * se rehace (cruzar los 1025 px, el lienzo que r3f vuelve a montar), r3f suelta el lienzo viejo y medio segundo después le fuerza la pérdida
 * del contexto (`forceContextLoss`): ese lienzo descartado avisaba «perdido», nadie lo reponía nunca y el lienzo NUEVO quedaba para siempre
 * «perdido». El pie de volumen no se volvía a armar (sin 3D: los rótulos sueltos del DOM, sin la placa ni los campos, y el final del pie
 * esperando al pie entero) y los títulos quedaban en su DOM. Ahora lo perdido es de CADA lienzo y cuenta sólo el vivo (el último que se
 * vigila: el de la escena montada); lo que le pase a uno descartado no se oye. Banco: `CONTROL=contexto-global` (`faq-del-pie.ts`).
 */
const perdidos = new WeakSet<EventTarget>()
const vigilados = new WeakSet<EventTarget>()
/** El lienzo vivo: el último que se vigila (cada escena que se monta vigila el suyo). */
let vivo: EventTarget | null = null
let version = 0
const oyentes = new Set<() => void>()

/** Sólo para el control del banco: lo perdido vuelve a ser uno para toda la página (el bug, de vuelta). */
type VentanaDelBanco = Window & { __contextoDelLienzoGlobal?: boolean }
let perdidoGlobal = false
const global = (): boolean => hayBanco() && (window as VentanaDelBanco).__contextoDelLienzoGlobal === true

function avisar(lienzo: EventTarget, perdio: boolean): void {
  if (perdio) perdidos.add(lienzo)
  else perdidos.delete(lienzo)
  perdidoGlobal = perdio
  if (lienzo !== vivo && !global()) return
  version += 1
  for (const f of oyentes) f()
}

/** Escucha el lienzo (una vez por lienzo) y lo toma como el vivo. */
export function vigilarElContexto(lienzo: EventTarget): void {
  vivo = lienzo
  if (vigilados.has(lienzo)) return
  vigilados.add(lienzo)
  lienzo.addEventListener('webglcontextlost', () => avisar(lienzo, true))
  lienzo.addEventListener('webglcontextrestored', () => avisar(lienzo, false))
}

/** ¿El contexto del lienzo vivo está perdido? */
export const contextoPerdido = (): boolean => (global() ? perdidoGlobal : vivo !== null && perdidos.has(vivo))

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
