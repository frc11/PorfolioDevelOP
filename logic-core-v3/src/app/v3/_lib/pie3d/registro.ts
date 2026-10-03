'use client'

import { useEffect, useSyncExternalStore, type RefObject } from 'react'

import { CONSULTA_ESCENARIO } from '../compuerta'
import { entornoDeLaEscena } from '../escena/entorno'
import { useAnchoMinimo } from '../useAnchoMinimo'

/**
 * [RETOQUE DEL PIE] P2 · EL PIE DE VOLUMEN, del lado del DOM — sin three (como `titulos3d/registro.ts`): cada pieza del
 * pie anota acá su elemento y la escena (`escena/pie3d/`) la arma en WebGL, la pone en el mundo mirando al frente y la
 * dibuja; el DOM sigue siendo el de verdad (se enfoca, se escribe, lo anuncia el lector) y cada cuadro la escena le
 * escribe a lo interactivo la transformada que lo deja sobre su pieza.
 *
 *   texto        un texto suelto (el logotipo, el titular, los rótulos de columna, la línea legal): extruido en el negro
 *   placa        un enlace o un botón (el recorrido, el mail, WhatsApp, las redes): una placa con su texto en relieve
 *   formulario   el formulario entero: una sola placa, con los campos en pozos de su cara y Enviar como tecla
 *
 * El estado de cada pieza que se hunde (el mouse encima, el foco del teclado, apretada) lo escriben sus escuchas acá y
 * la escena lo lee en su cuadro: ningún `setState` por cuadro.
 */
export type FormaDeLaPieza = 'texto' | 'placa' | 'formulario'

export interface PiezaDelPie {
  readonly id: string
  readonly forma: FormaDeLaPieza
  /** Su caja es la cara de la pieza (en la placa y el formulario, lo que se transforma). */
  readonly elemento: HTMLElement
  /** En qué orden se anotó. */
  readonly orden: number
}

export const PIEZAS_DEL_PIE = new Map<string, PiezaDelPie>()

const oyentes = new Set<() => void>()
let version = 0
let orden = 0
function avisar(): void {
  version += 1
  for (const f of oyentes) f()
}
export function suscribirALasPiezas(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}
export const versionDeLasPiezas = (): number => version

/** Anota la pieza mientras está montada (y `activo`: el pie de volumen, desde 1025). */
export function usePiezaDelPie(ref: RefObject<HTMLElement | null>, { id, forma, activo }: { readonly id: string; readonly forma: FormaDeLaPieza; readonly activo: boolean }): void {
  useEffect(() => {
    const el = ref.current
    if (!activo || el === null) return undefined
    orden += 1
    PIEZAS_DEL_PIE.set(id, { id, forma, elemento: el, orden })
    avisar()
    return () => {
      PIEZAS_DEL_PIE.delete(id)
      el.style.transform = ''
      avisar()
    }
  }, [ref, id, forma, activo])
}

/** Cómo va el pie en esta carga: `plano` (abajo de 1025, sin títulos de volumen, en el servidor), `volumen` o `antes` (la prueba). */
export type ModoDelPie = 'plano' | 'volumen' | 'antes'

const sinCambios = (): (() => void) => () => undefined
function modoDelEntorno(): 'volumen' | 'antes' | 'no' {
  const e = entornoDeLaEscena()
  if (e.pruebas.pie === 'antes') return 'antes'
  return e.titulos === 'no' ? 'no' : 'volumen'
}

export function useModoDelPie(): ModoDelPie {
  const delEntorno = useSyncExternalStore(sinCambios, modoDelEntorno, () => 'no' as const)
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  return escritorio && delEntorno !== 'no' ? delEntorno : 'plano'
}

/** ¿La escena ya armó y compiló el pie? Recién ahí el DOM apaga lo que el 3D dibuja (sin WebGL, el pie plano). */
let listo = false
const oyentesDelListo = new Set<() => void>()
export function marcarElPieListo(v: boolean): void {
  if (listo === v) return
  listo = v
  for (const f of oyentesDelListo) f()
}
function suscribirAlListo(f: () => void): () => void {
  oyentesDelListo.add(f)
  return () => {
    oyentesDelListo.delete(f)
  }
}
export function usePieListo(): boolean {
  return useSyncExternalStore(suscribirAlListo, () => listo, () => false)
}

/** Lo que hunde una pieza: el mouse encima, el foco del teclado (visible) y apretada (el botón o Enter y Espacio). */
export interface Hundido {
  encima: boolean
  foco: boolean
  apretada: boolean
}

export const HUNDIDOS = new WeakMap<Element, Hundido>()

/** Cuánto pide hundirse (0 a 1: 1 es apretada; encima o con el foco, `encima`). */
export function cuantoSeHunde(h: Hundido | undefined, encima: number): number {
  if (h === undefined) return 0
  return h.apretada ? 1 : h.encima || h.foco ? encima : 0
}

/** Los escuchas del hundido, en el elemento (sin re-render): el puntero fino, el foco visible y las teclas que aprietan. */
export function useHundido(ref: RefObject<HTMLElement | null>, activo: boolean): void {
  useEffect(() => {
    const el = ref.current
    if (!activo || el === null) return undefined
    const h: Hundido = { encima: false, foco: false, apretada: false }
    HUNDIDOS.set(el, h)
    const esPuntero = (e: PointerEvent): boolean => e.pointerType === 'mouse' || e.pointerType === 'pen'
    const entra = (e: PointerEvent): void => {
      if (esPuntero(e)) h.encima = true
    }
    const sale = (e: PointerEvent): void => {
      if (esPuntero(e)) [h.encima, h.apretada] = [false, false]
    }
    const aprieta = (e: PointerEvent): void => {
      if (e.button === 0) h.apretada = true
    }
    const suelta = (): void => {
      h.apretada = false
    }
    const enfoca = (e: FocusEvent): void => {
      h.foco = e.target instanceof Element && e.target.matches(':focus-visible')
    }
    const desenfoca = (): void => {
      ;[h.foco, h.apretada] = [false, false]
    }
    const tecla = (e: KeyboardEvent): void => {
      if (e.key === 'Enter' || e.key === ' ') h.apretada = e.type === 'keydown'
    }
    const escuchas: [string, EventListener][] = [
      ['pointerenter', entra as EventListener],
      ['pointerleave', sale as EventListener],
      ['pointerdown', aprieta as EventListener],
      ['pointerup', suelta],
      ['pointercancel', suelta],
      ['focusin', enfoca as EventListener],
      ['focusout', desenfoca],
      ['keydown', tecla as EventListener],
      ['keyup', tecla as EventListener],
    ]
    for (const [tipo, f] of escuchas) el.addEventListener(tipo, f, { passive: true })
    return () => {
      for (const [tipo, f] of escuchas) el.removeEventListener(tipo, f)
      HUNDIDOS.delete(el)
    }
  }, [ref, activo])
}
