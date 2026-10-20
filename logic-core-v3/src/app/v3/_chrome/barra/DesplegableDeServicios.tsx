'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

import { EnlaceDeRuta } from '../../_componentes/navegacion/EnlaceDeRuta'
import { PAGINAS_DE_SERVICIO, TODOS_LOS_SERVICIOS, destinoDesde } from '../paginas'

/**
 * [B12a.5] EL DESPLEGABLE DE SERVICIOS (D5) — «Servicios» en la píldora abre la lista de las páginas de servicio, con la sección del home
 * primero. Se abre con clic, con Enter (el foco entra a la lista) y con el hover con intención (`intencionMs` quieto encima); el que se
 * abrió con el hover se cierra `salidaMs` después de que el puntero se va (el que se abrió con clic o Enter, no). Esc lo cierra y el
 * foco vuelve a «Servicios»; un clic afuera o el foco afuera lo cierran.
 *
 * La lista va FUERA de la píldora (la píldora recorta lo que se le sale: `overflow-x: auto`), debajo de «Servicios» (`barra.css`), así
 * que el orden del Tab se maneja acá: desde «Servicios» abierto, Tab entra a la lista; desde el último, sigue con el ítem que va
 * después de «Servicios»; Shift+Tab desde el primero vuelve a «Servicios».
 */
export const DESPLEGABLE = { intencionMs: 180, salidaMs: 280 } as const
export const ID_DEL_DESPLEGABLE = 'desplegable-de-servicios'

/** Lo que se lista: la sección del home y las tres páginas. */
export const ITEMS_DEL_DESPLEGABLE = [TODOS_LOS_SERVICIOS, ...PAGINAS_DE_SERVICIO] as const

export interface Desplegable {
  readonly abierto: boolean
  readonly boton: RefObject<HTMLButtonElement | null>
  readonly panel: RefObject<HTMLDivElement | null>
  readonly alClic: (e: React.MouseEvent) => void
  readonly alEntrar: () => void
  readonly alSalir: () => void
  readonly alTeclearElBoton: (e: React.KeyboardEvent) => void
  readonly alTeclearLaLista: (e: React.KeyboardEvent) => void
  readonly cerrar: (devolverElFoco: boolean) => void
}

const enlacesDe = (panel: HTMLElement | null): HTMLAnchorElement[] => (panel === null ? [] : [...panel.querySelectorAll<HTMLAnchorElement>('a[href]')])

export function useDesplegable(): Desplegable {
  const [abierto, setAbierto] = useState(false)
  const boton = useRef<HTMLButtonElement | null>(null)
  const panel = useRef<HTMLDivElement | null>(null)
  const reloj = useRef(0)
  const conElHover = useRef(false)
  const entrarConElFoco = useRef(false)
  const abiertoAhora = useRef(false)
  useEffect(() => {
    abiertoAhora.current = abierto
  }, [abierto])

  const cerrar = useCallback((devolverElFoco: boolean): void => {
    window.clearTimeout(reloj.current)
    setAbierto(false)
    if (devolverElFoco) boton.current?.focus({ preventScroll: true })
  }, [])
  const alClic = useCallback((e: React.MouseEvent): void => {
    window.clearTimeout(reloj.current)
    // Enter o Espacio (un clic sin puntero): el foco entra a la lista.
    entrarConElFoco.current = e.detail === 0
    const delHover = conElHover.current
    conElHover.current = false
    // Abierta por el hover, el clic la deja abierta (ya no se va con el puntero); si no, alterna.
    setAbierto((a) => (a && delHover ? true : !a))
  }, [])
  const alEntrar = useCallback((): void => {
    window.clearTimeout(reloj.current)
    if (abiertoAhora.current) return
    reloj.current = window.setTimeout(() => {
      conElHover.current = true
      entrarConElFoco.current = false
      setAbierto(true)
    }, DESPLEGABLE.intencionMs)
  }, [])
  const alSalir = useCallback((): void => {
    window.clearTimeout(reloj.current)
    if (abiertoAhora.current && !conElHover.current) return
    reloj.current = window.setTimeout(() => setAbierto(false), DESPLEGABLE.salidaMs)
  }, [])
  const alTeclearElBoton = useCallback((e: React.KeyboardEvent): void => {
    if (e.key !== 'Tab' || e.shiftKey || !abiertoAhora.current) return
    const primero = enlacesDe(panel.current)[0]
    if (primero === undefined) return
    e.preventDefault()
    primero.focus()
  }, [])
  const alTeclearLaLista = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key !== 'Tab') return
      const enlaces = enlacesDe(panel.current)
      const i = enlaces.indexOf(document.activeElement as HTMLAnchorElement)
      if (e.shiftKey && i === 0) {
        e.preventDefault()
        boton.current?.focus()
        return
      }
      if (e.shiftKey || i !== enlaces.length - 1) return
      // Desde el último, el ítem que va después de «Servicios» en la píldora (o la esquina, si es el último).
      const deLaPildora = [...(boton.current?.closest('[data-parte="lista"]')?.querySelectorAll<HTMLElement>('a[href], button') ?? [])]
      const siguiente = deLaPildora[deLaPildora.indexOf(boton.current as HTMLElement) + 1] ?? boton.current?.closest('[data-pieza="barra"]')?.querySelector<HTMLElement>('[data-parte="esquina"] a[href]')
      if (siguiente === null || siguiente === undefined) return
      e.preventDefault()
      cerrar(false)
      siguiente.focus()
    },
    [cerrar],
  )

  // Abierto: la lista debajo de «Servicios» (su centro, medido contra la cabecera), el foco adentro si se abrió con el teclado, y lo que
  // lo cierra (Esc, un clic afuera, el foco afuera).
  useLayoutEffect(() => {
    const b = boton.current
    const p = panel.current
    if (!abierto || b === null || p === null) return undefined
    const cabecera = b.closest<HTMLElement>('[data-pieza="barra"]')
    // Debajo de «Servicios» y, si abajo no entra (la píldora nace al pie de la primera pantalla), arriba; de nuevo con el scroll.
    const ubicar = (): void => {
      if (cabecera === null) return
      const r = b.getBoundingClientRect()
      p.style.setProperty('--desplegable-x', `${String(r.left + r.width / 2 - cabecera.getBoundingClientRect().left)}px`)
      p.setAttribute('data-hacia', r.bottom + p.offsetHeight + r.height > window.innerHeight ? 'arriba' : 'abajo')
    }
    ubicar()
    if (entrarConElFoco.current) enlacesDe(p)[0]?.focus({ preventScroll: true })
    const adentro = (n: EventTarget | null): boolean => n instanceof Node && (b.contains(n) || p.contains(n))
    const alTeclear = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') cerrar(adentro(document.activeElement))
    }
    const alApretar = (e: PointerEvent): void => {
      if (!adentro(e.target)) cerrar(false)
    }
    const alEnfocar = (e: FocusEvent): void => {
      if (!adentro(e.target)) cerrar(false)
    }
    document.addEventListener('keydown', alTeclear)
    document.addEventListener('pointerdown', alApretar)
    document.addEventListener('focusin', alEnfocar)
    window.addEventListener('resize', ubicar)
    window.addEventListener('scroll', ubicar, { passive: true })
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.removeEventListener('pointerdown', alApretar)
      document.removeEventListener('focusin', alEnfocar)
      window.removeEventListener('resize', ubicar)
      window.removeEventListener('scroll', ubicar)
    }
  }, [abierto, cerrar])
  useEffect(() => () => window.clearTimeout(reloj.current), [])

  return { abierto, boton, panel, alClic, alEntrar, alSalir, alTeclearElBoton, alTeclearLaLista, cerrar }
}

const CLASE_DEL_TEXTO = 'text-cuerpo tracking-texto leading-texto font-semi'

/** Lo que el botón y la lista reciben del desplegable (las refs van por `ref`, desestructuradas: nada se lee en el render). */
type Mandos = Pick<Desplegable, 'abierto' | 'alEntrar' | 'alSalir'>

/** «Servicios» en la píldora: el botón que abre la lista (con el activo y el resaltado de los demás ítems). */
export function BotonDeServicios({ ref, abierto, alEntrar, alSalir, alClic, alTeclear, rotulo, activo }: Mandos & {
  readonly ref: RefObject<HTMLButtonElement | null>
  readonly alClic: Desplegable['alClic']
  readonly alTeclear: Desplegable['alTeclearElBoton']
  readonly rotulo: string
  readonly activo: boolean
}): React.JSX.Element {
  return (
    <button
      ref={ref}
      type="button"
      data-pieza="barra-enlace"
      data-nav-id={TODOS_LOS_SERVICIOS.id}
      data-activo={activo ? 'true' : undefined}
      aria-current={activo ? 'true' : undefined}
      aria-expanded={abierto}
      aria-controls={ID_DEL_DESPLEGABLE}
      onClick={alClic}
      onPointerEnter={alEntrar}
      onPointerLeave={alSalir}
      onKeyDown={alTeclear}
      className={CLASE_DEL_TEXTO}
    >
      <span data-parte="rotulo">{rotulo}</span>
    </button>
  )
}

/** La lista, debajo de «Servicios» (fuera de la píldora): la sección del home y las tres páginas. */
export function ListaDeServicios({ ref, abierto, alEntrar, alSalir, alTeclear, cerrar, ruta }: Mandos & {
  readonly ref: RefObject<HTMLDivElement | null>
  readonly alTeclear: Desplegable['alTeclearLaLista']
  readonly cerrar: Desplegable['cerrar']
  readonly ruta: string | null
}): React.JSX.Element {
  return (
    <div ref={ref} id={ID_DEL_DESPLEGABLE} data-parte="desplegable" data-abierto={abierto ? '' : undefined} onPointerEnter={alEntrar} onPointerLeave={alSalir} onKeyDown={alTeclear}>
      <ul>
        {ITEMS_DEL_DESPLEGABLE.map((p) => (
          <li key={p.id}>
            {/* Cerrada, fuera del recorrido del teclado también en el marcado (la hoja ya la esconde con `visibility`). */}
            <EnlaceDeRuta href={destinoDesde(ruta, p.destino)} data-pieza="desplegable-enlace" tabIndex={abierto ? undefined : -1} onClick={() => cerrar(false)} className={CLASE_DEL_TEXTO}>
              {p.rotulo}
            </EnlaceDeRuta>
          </li>
        ))}
      </ul>
    </div>
  )
}
