'use client'

import { useEffect, useRef } from 'react'

/**
 * [PULIDO 12] 3 · LA MEMORIA DE UN FORMULARIO QUE SE VUELVE A MONTAR. Al cruzar 1024 (girar una tablet) el pie pasa de plano a
 * volumen y su árbol cambia de tipo (`CanalDePieza` con progreso o sin él): React desmonta el formulario y lo monta de nuevo, y
 * lo escrito o la tarjeta del resultado se perdían. Lo suyo se anota en cada cambio (el nuevo se dibuja ANTES de que el viejo se
 * desmonte: guardarlo al desmontarse llegaba tarde); si otro se monta mientras el dueño sigue montado o enseguida de irse
 * (`VIGENCIA_MS`), arranca de ahí. Un envío en viaje se anota como promesa (se queda hasta el envío siguiente: si llegó entre el
 * dibujo del nuevo y su efecto, igual la recibe; quedar «enviando» para siempre no puede pasar): el que se monta recibe su
 * respuesta. Lo escrito no queda en memoria: se borra `VIGENCIA_MS` después de que el dueño se fue.
 */
export const VIGENCIA_MS = 1000

const guardados = new Map<string, { readonly valor: unknown; readonly montado: boolean; readonly cuando: number }>()
const pedidos = new Map<string, Promise<unknown>>()

export function anotar(clave: string, valor: unknown, montado: boolean, ahora: number = performance.now()): void {
  const anotado = { valor, montado, cuando: ahora }
  guardados.set(clave, anotado)
  if (!montado && typeof window !== 'undefined') window.setTimeout(() => guardados.get(clave) === anotado && guardados.delete(clave), VIGENCIA_MS + 100)
}

/** Lo anotado, si el dueño sigue montado o se fue recién (no se borra: en desarrollo React monta dos veces y los dos lo leen). */
export function recuperar<T>(clave: string, ahora: number = typeof performance === 'undefined' ? 0 : performance.now()): T | null {
  const g = guardados.get(clave)
  if (g === undefined || (!g.montado && ahora - g.cuando > VIGENCIA_MS)) return null
  return g.valor as T
}

/** Lo guardado, con un envío que ya no está en viaje vuelto al reposo (si no, quedaría «enviando» para siempre). */
export function recuperarAlMontar<T extends { readonly estado: { readonly fase: string } }>(clave: string, reposo: T['estado']): T | null {
  const m = recuperar<T>(clave)
  if (m === null || m.estado.fase !== 'enviando' || pedidoEnCurso(clave) !== null) return m
  return { ...m, estado: reposo }
}

export function anotarElPedido<R>(clave: string, pedido: Promise<R>): Promise<R> {
  pedidos.set(clave, pedido)
  return pedido
}

export function pedidoEnCurso<R>(clave: string): Promise<R> | null {
  return (pedidos.get(clave) as Promise<R> | undefined) ?? null
}

/** Montado de nuevo con un envío en viaje (`enViaje`, al montar): su respuesta llega a `llego`. */
export function useRespuestaEnViaje<R>(clave: string, enViaje: boolean, llego: (r: R) => void): void {
  const alMontar = useRef({ enViaje, llego })
  useEffect(() => {
    const pedido = pedidoEnCurso<R>(clave)
    if (!alMontar.current.enViaje || pedido === null) return undefined
    let vivo = true
    void pedido.then((r) => {
      if (vivo) alMontar.current.llego(r)
    })
    return () => {
      vivo = false
    }
  }, [clave])
}

/** Anota `actual` (lo último que se dibujó) en cada cambio, y que el dueño se fue cuando se desmonta. */
export function useRecordar(clave: string, actual: unknown): void {
  const ultimo = useRef(actual)
  useEffect(() => {
    ultimo.current = actual
    anotar(clave, actual, true)
  })
  useEffect(() => () => anotar(clave, ultimo.current, false), [clave])
}
