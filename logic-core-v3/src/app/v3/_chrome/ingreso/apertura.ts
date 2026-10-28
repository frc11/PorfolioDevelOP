'use client'

import { useEffect, useSyncExternalStore } from 'react'

import { quitarElTelon } from './telon'

/**
 * [B7] QUIÉN ABRE EL LOGIN Y QUÉ DICE LA URL — un estado chico del chrome, la delegación de clics y el historial.
 *
 *   · **El disparador** es cualquier `[data-abre-ingreso]` (hoy, «Login» de la esquina de la barra). Sigue siendo un enlace a
 *     `/login`: sin JavaScript, o con Ctrl/Cmd/Shift o la rueda, va al login de siempre. Con un clic normal, el clic se atiende acá
 *     (en la captura, como el contacto) y el login se despliega encima de la página.
 *   · **La URL** cambia al abrir: `?ingresar` (lo demás de la URL se queda), con `history.pushState` —next lo parchea: lo integra a
 *     su router sin pedir nada al servidor— y NUNCA `router.push`. Así la flecha atrás cierra (con la animación inversa) y la de
 *     adelante vuelve a abrir. La entrada que empuja el login lleva su marca en el estado del historial.
 *   · **«Volver al home»** (y Esc) cierra igual que la flecha: si la entrada la empujó el login, `history.back()` (no queda una
 *     entrada muerta); si se entró directo con `?ingresar` (no hay a dónde volver adentro del sitio), se reemplaza la URL sin él.
 *   · **La entrada directa** con `?ingresar` lo abre al montar (sin clic: con el fundido).
 *   · El scroll no se toca en ningún paso: la hoja es fija y la página queda donde estaba (|Δy| = 0, lo mide el banco).
 *
 *   · **La vuelta de la caché** (`pageshow` con `persisted`, p. ej. al volver de Google con la flecha del navegador): la página vuelve con
 *     lo que tenía en memoria, es decir el envío «cargando». Se quita el telón de la ida, el login sigue a la URL (`?ingresar`: queda
 *     abierto) y `vuelta` sube, para que el formulario se arme de nuevo y el «cargando» se limpie.
 *
 * `montado` sigue en `true` mientras la hoja se va (la animación inversa); la hoja avisa al terminar (`soltarIngreso`).
 */

export const PARAMETRO_DEL_INGRESO = 'ingresar'
export const SELECTOR_DEL_INGRESO = '[data-abre-ingreso]'
/** La marca, en el estado del historial, de la entrada que empujó el login. */
export const MARCA_DE_LA_ENTRADA = 'ingresoEmpujado'

export interface EstadoDelIngreso {
  /** Lo que pide la URL (y el clic): desplegado o yéndose. */
  readonly abierto: boolean
  /** Mientras la hoja está en el documento (también mientras vuelve al botón). */
  readonly montado: boolean
  /** El botón del que sale y al que vuelve (y el foco, al cerrar); `null`: el fundido. */
  readonly origen: HTMLElement | null
  /** Cuántas veces volvió la página de la caché de ida y vuelta: la `key` del formulario (limpia el «cargando»). */
  readonly vuelta: number
}

/** Lo que el login usa del historial y de la ubicación: los del navegador, o los de la prueba. */
export interface Historial {
  readonly state: unknown
  pushState(datos: unknown, sinUso: string, url: string): void
  replaceState(datos: unknown, sinUso: string, url: string): void
  back(): void
}
export interface Ubicacion {
  readonly pathname: string
  readonly search: string
  readonly hash: string
}

export const pideIngreso = (busqueda: string): boolean => new URLSearchParams(busqueda).has(PARAMETRO_DEL_INGRESO)

/** La misma URL con `?ingresar` (al final de la consulta, sin `=`), y el ancla donde estaba. */
export function conIngreso(u: Ubicacion): string {
  const resto = new URLSearchParams(u.search)
  resto.delete(PARAMETRO_DEL_INGRESO)
  const consulta = resto.toString()
  return `${u.pathname}?${consulta === '' ? '' : `${consulta}&`}${PARAMETRO_DEL_INGRESO}${u.hash}`
}

/** La misma URL sin `?ingresar`. */
export function sinIngreso(u: Ubicacion): string {
  const resto = new URLSearchParams(u.search)
  resto.delete(PARAMETRO_DEL_INGRESO)
  const consulta = resto.toString()
  return `${u.pathname}${consulta === '' ? '' : `?${consulta}`}${u.hash}`
}

export const entradaEmpujada = (estadoDelHistorial: unknown): boolean =>
  typeof estadoDelHistorial === 'object' && estadoDelHistorial !== null && (estadoDelHistorial as Record<string, unknown>)[MARCA_DE_LA_ENTRADA] === true

let entorno: { readonly historial: () => Historial; readonly ubicacion: () => Ubicacion } = {
  historial: () => window.history,
  ubicacion: () => window.location,
}

/** Para el invariante: un historial y una ubicación de mentira (sin argumentos, los del navegador). */
export function usarEntorno(historial?: () => Historial, ubicacion?: () => Ubicacion): void {
  entorno = historial === undefined || ubicacion === undefined ? { historial: () => window.history, ubicacion: () => window.location } : { historial, ubicacion }
}

const CERRADO: EstadoDelIngreso = { abierto: false, montado: false, origen: null, vuelta: 0 }
let estado: EstadoDelIngreso = CERRADO
const oyentes = new Set<() => void>()
const avisar = (): void => oyentes.forEach((f) => f())

export const estadoDelIngreso = (): EstadoDelIngreso => estado

/** Abre desde el botón `origen` (o con el fundido, si es `null`) y, si la URL no lo dice todavía, empuja `?ingresar`. */
export function abrirIngreso(origen: HTMLElement | null): void {
  if (estado.abierto) return
  const u = entorno.ubicacion()
  if (!pideIngreso(u.search)) entorno.historial().pushState({ [MARCA_DE_LA_ENTRADA]: true }, '', conIngreso(u))
  estado = { ...estado, abierto: true, montado: true, origen }
  avisar()
}

/** «Volver al home» y Esc: la animación inversa ya, y la URL como la dejaría la flecha atrás. */
export function cerrarIngreso(): void {
  if (!estado.abierto) return
  estado = { ...estado, abierto: false }
  avisar()
  const historial = entorno.historial()
  const u = entorno.ubicacion()
  if (!pideIngreso(u.search)) return
  if (entradaEmpujada(historial.state)) historial.back()
  else historial.replaceState(null, '', sinIngreso(u))
}

/** La flecha del navegador (y la entrada directa): el login sigue a la URL. `origen` es el botón, si se abre. */
export function seguirALaUrl(origen: () => HTMLElement | null): void {
  const pide = pideIngreso(entorno.ubicacion().search)
  if (pide && !estado.abierto) {
    estado = { ...estado, abierto: true, montado: true, origen: origen() }
    avisar()
  } else if (!pide && estado.abierto) {
    estado = { ...estado, abierto: false }
    avisar()
  }
}

/** La página volvió de la caché de ida y vuelta: sin telón, el formulario armado de nuevo y el login como dice la URL. */
export function volverDeLaCache(origen: () => HTMLElement | null): void {
  quitarElTelon()
  estado = { ...estado, vuelta: estado.vuelta + 1 }
  avisar()
  seguirALaUrl(origen)
}

/** La hoja terminó de volver al botón: se desmonta. Si mientras tanto se pidió de nuevo, sigue. */
export function soltarIngreso(): void {
  if (estado.abierto || !estado.montado) return
  estado = { ...estado, montado: false }
  avisar()
}

/** Para el invariante: de vuelta al principio. */
export function reiniciarIngreso(): void {
  estado = { ...CERRADO }
  avisar()
}

function suscribir(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}

export function useIngreso(): EstadoDelIngreso {
  return useSyncExternalStore(suscribir, estadoDelIngreso, () => CERRADO)
}

/** El botón del login a la vista (para salir de él al volver por la flecha, y para devolverle el foco). */
export function botonDelIngreso(): HTMLElement | null {
  return document.querySelector<HTMLElement>(SELECTOR_DEL_INGRESO)
}

/** ¿Este clic es para el login de la página? Sólo el principal, sin teclas que piden otra pestaña o ventana. */
export function esUnClicParaElLogin(e: Pick<MouseEvent, 'button' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'defaultPrevented'>): boolean {
  return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

/**
 * Se monta una vez, en el chrome: los clics de apertura (en la captura), la flecha del navegador y la entrada directa. Al acercarse
 * al botón (el puntero o el foco) se pide el código de la hoja, así el clic no la espera.
 */
export function useAperturaDelIngreso(precargar: () => void): void {
  useEffect(() => {
    const alTocar = (e: MouseEvent): void => {
      const disparador = e.target instanceof Element ? e.target.closest<HTMLElement>(SELECTOR_DEL_INGRESO) : null
      if (disparador === null || !esUnClicParaElLogin(e)) return
      e.preventDefault()
      precargar()
      abrirIngreso(disparador)
    }
    const alAcercarse = (e: Event): void => {
      if (e.target instanceof Element && e.target.closest(SELECTOR_DEL_INGRESO) !== null) precargar()
    }
    const alUsarLaFlecha = (): void => seguirALaUrl(botonDelIngreso)
    const alVolverDeLaCache = (e: PageTransitionEvent): void => {
      if (e.persisted) volverDeLaCache(botonDelIngreso)
    }
    document.addEventListener('click', alTocar, { capture: true })
    document.addEventListener('pointerover', alAcercarse)
    document.addEventListener('focusin', alAcercarse)
    window.addEventListener('popstate', alUsarLaFlecha)
    window.addEventListener('pageshow', alVolverDeLaCache)
    // La entrada directa con `?ingresar` (o la vuelta a una entrada que lo tenía): sin clic, con el fundido.
    seguirALaUrl(() => null)
    return () => {
      document.removeEventListener('click', alTocar, { capture: true })
      document.removeEventListener('pointerover', alAcercarse)
      document.removeEventListener('focusin', alAcercarse)
      window.removeEventListener('popstate', alUsarLaFlecha)
      window.removeEventListener('pageshow', alVolverDeLaCache)
    }
  }, [precargar])
}
