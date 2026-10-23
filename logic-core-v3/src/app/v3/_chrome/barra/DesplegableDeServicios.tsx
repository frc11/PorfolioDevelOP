'use client'

import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

import { cn } from '@/lib/utils'

import { EnlaceDeRuta } from '../../_componentes/navegacion/EnlaceDeRuta'
import { sonar } from '../../_lib/sonido/bus'
import { PAGINAS_DE_SERVICIO, SERVICIOS_DEL_HOME, destinoDesde } from '../paginas'

/**
 * [B12a.5] EL DESPLEGABLE DE SERVICIOS (D5) — la lista de las páginas de servicio, debajo de «Servicios» en la píldora.
 *
 * [B12a.8] «Servicios» es un ENLACE (a la sección del home, `#servicios`; desde una página, al home con el velo) y la lista se abre aparte:
 * · con el hover con intención (`intencionMs` quieto encima de «Servicios» o de su flechita): el que se abrió así se cierra `salidaMs`
 *   después de que el puntero se va;
 * · con el teclado: la flecha abajo sobre «Servicios», o Enter (o Espacio) en la flechita del costado; el foco entra a la lista;
 * · con un clic en la flechita (queda abierta hasta un clic afuera).
 * Sin «Todos los servicios»: eso es «Servicios» mismo. Esc la cierra y el foco vuelve a quien la abrió; un clic afuera o el foco afuera la
 * cierran. La lista va FUERA de la píldora (la píldora recorta lo que se le sale: `overflow-x: auto`), así que el Tab se maneja acá: desde
 * la flechita abierta entra a la lista; desde el último ítem sigue con el que va después de «Servicios»; Shift+Tab desde el primero vuelve
 * a la flechita.
 */
export const DESPLEGABLE = { intencionMs: 180, salidaMs: 280 } as const
export const ID_DEL_DESPLEGABLE = 'desplegable-de-servicios'

/** Lo que se lista: las páginas de servicio. */
export const ITEMS_DEL_DESPLEGABLE = PAGINAS_DE_SERVICIO

export interface Desplegable {
  readonly abierto: boolean
  readonly enlace: RefObject<HTMLAnchorElement | null>
  readonly boton: RefObject<HTMLButtonElement | null>
  readonly panel: RefObject<HTMLDivElement | null>
  readonly alClic: (e: React.MouseEvent) => void
  readonly alEntrar: () => void
  readonly alSalir: () => void
  readonly alTeclearElEnlace: (e: React.KeyboardEvent) => void
  readonly alTeclearElBoton: (e: React.KeyboardEvent) => void
  readonly alTeclearLaLista: (e: React.KeyboardEvent) => void
  readonly cerrar: (devolverElFoco: boolean) => void
}

const enlacesDe = (panel: HTMLElement | null): HTMLAnchorElement[] => (panel === null ? [] : [...panel.querySelectorAll<HTMLAnchorElement>('a[href]')])

export function useDesplegable(): Desplegable {
  const [abierto, setAbierto] = useState(false)
  const enlace = useRef<HTMLAnchorElement | null>(null)
  const boton = useRef<HTMLButtonElement | null>(null)
  const panel = useRef<HTMLDivElement | null>(null)
  const reloj = useRef(0)
  const conElHover = useRef(false)
  const entrarConElFoco = useRef(false)
  /** A quién vuelve el foco al cerrar con Esc: la flechita o «Servicios» (la flecha abajo). */
  const quienAbrio = useRef<'boton' | 'enlace'>('boton')
  const abiertoAhora = useRef(false)
  useEffect(() => {
    abiertoAhora.current = abierto
  }, [abierto])

  const cerrar = useCallback((devolverElFoco: boolean): void => {
    window.clearTimeout(reloj.current)
    setAbierto(false)
    if (devolverElFoco) (quienAbrio.current === 'enlace' ? enlace.current : boton.current)?.focus({ preventScroll: true })
  }, [])
  /** La flechita: Enter o Espacio (un clic sin puntero) abre con el foco adentro; abierta por el hover, el clic la deja abierta. */
  const alClic = useCallback((e: React.MouseEvent): void => {
    window.clearTimeout(reloj.current)
    entrarConElFoco.current = e.detail === 0
    quienAbrio.current = 'boton'
    const delHover = conElHover.current
    conElHover.current = false
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
  /** «Servicios»: la flecha abajo abre la lista con el foco adentro (Enter sigue siendo el enlace). */
  const alTeclearElEnlace = useCallback((e: React.KeyboardEvent): void => {
    if (e.key !== 'ArrowDown') return
    e.preventDefault()
    window.clearTimeout(reloj.current)
    conElHover.current = false
    quienAbrio.current = 'enlace'
    if (abiertoAhora.current) {
      enlacesDe(panel.current)[0]?.focus()
      return
    }
    entrarConElFoco.current = true
    setAbierto(true)
  }, [])
  /** La flechita, abierta: Tab entra a la lista; la flecha abajo también. */
  const alTeclearElBoton = useCallback((e: React.KeyboardEvent): void => {
    const entra = (e.key === 'Tab' && !e.shiftKey) || e.key === 'ArrowDown'
    if (!entra) return
    if (!abiertoAhora.current) {
      if (e.key !== 'ArrowDown') return
      e.preventDefault()
      quienAbrio.current = 'boton'
      entrarConElFoco.current = true
      setAbierto(true)
      return
    }
    const primero = enlacesDe(panel.current)[0]
    if (primero === undefined) return
    e.preventDefault()
    primero.focus()
  }, [])
  const alTeclearLaLista = useCallback(
    (e: React.KeyboardEvent): void => {
      const enlaces = enlacesDe(panel.current)
      const i = enlaces.indexOf(document.activeElement as HTMLAnchorElement)
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        enlaces[(i + (e.key === 'ArrowDown' ? 1 : enlaces.length - 1)) % enlaces.length]?.focus()
        return
      }
      if (e.key !== 'Tab') return
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

  // Abierto: la lista debajo de «Servicios» ([C2-21] su borde izquierdo, medido contra la cabecera), el foco adentro si se abrió con el teclado, y lo que
  // lo cierra (Esc, un clic afuera, el foco afuera).
  useLayoutEffect(() => {
    const a = enlace.current
    const b = boton.current
    const p = panel.current
    if (!abierto || a === null || b === null || p === null) return undefined
    const cabecera = b.closest<HTMLElement>('[data-pieza="barra"]')
    // Debajo de «Servicios» y, si abajo no entra (la píldora nace al pie de la primera pantalla), arriba; de nuevo con el scroll.
    const ubicar = (): void => {
      if (cabecera === null) return
      const ra = a.getBoundingClientRect()
      // [C2-21] El borde izquierdo de la lista en el de «Servicios» (la hoja ya no la centra: `barra.css`).
      p.style.setProperty('--desplegable-x', `${String(Math.min(ra.left, b.getBoundingClientRect().left) - cabecera.getBoundingClientRect().left)}px`)
      p.setAttribute('data-hacia', ra.bottom + p.offsetHeight + ra.height > window.innerHeight ? 'arriba' : 'abajo')
    }
    ubicar()
    if (entrarConElFoco.current) enlacesDe(p)[0]?.focus({ preventScroll: true })
    const adentro = (n: EventTarget | null): boolean => n instanceof Node && (a.contains(n) || b.contains(n) || p.contains(n))
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

  return { abierto, enlace, boton, panel, alClic, alEntrar, alSalir, alTeclearElEnlace, alTeclearElBoton, alTeclearLaLista, cerrar }
}

const CLASE_DEL_TEXTO = 'text-cuerpo tracking-texto leading-texto font-semi'

/** Lo que «Servicios» y la lista reciben del desplegable (las refs van por `ref`, desestructuradas: nada se lee en el render). */
type Mandos = Pick<Desplegable, 'abierto' | 'alEntrar' | 'alSalir'>

/** «Servicios» en la píldora: el enlace a la sección del home y, al costado, la flechita que abre la lista. */
export function ServiciosDeLaPildora({ refDelEnlace, refDelBoton, abierto, alEntrar, alSalir, alClic, alTeclearElEnlace, alTeclearElBoton, rotulo, activo, ruta }: Mandos & {
  readonly refDelEnlace: RefObject<HTMLAnchorElement | null>
  readonly refDelBoton: RefObject<HTMLButtonElement | null>
  readonly alClic: Desplegable['alClic']
  readonly alTeclearElEnlace: Desplegable['alTeclearElEnlace']
  readonly alTeclearElBoton: Desplegable['alTeclearElBoton']
  readonly rotulo: string
  readonly activo: boolean
  readonly ruta: string | null
}): React.JSX.Element {
  return (
    <span data-parte="servicios" className="inline-flex items-center" onPointerEnter={alEntrar} onPointerLeave={alSalir}>
      <EnlaceDeRuta
        ref={refDelEnlace}
        href={destinoDesde(ruta, SERVICIOS_DEL_HOME.destino)}
        data-pieza="barra-enlace"
        data-nav-id={SERVICIOS_DEL_HOME.id}
        data-activo={activo ? 'true' : undefined}
        aria-current={activo ? 'true' : undefined}
        onKeyDown={alTeclearElEnlace}
        className={CLASE_DEL_TEXTO}
      >
        <span data-parte="rotulo">{rotulo}</span>
      </EnlaceDeRuta>
      <button
        ref={refDelBoton}
        type="button"
        data-parte="abrir-servicios"
        aria-label="Las páginas de servicio"
        aria-expanded={abierto}
        aria-controls={ID_DEL_DESPLEGABLE}
        onClick={alClic}
        onKeyDown={alTeclearElBoton}
        className="grid size-[var(--spacing-6)] place-items-center"
      >
        <ChevronDown aria-hidden="true" strokeWidth={1.5} className={cn('size-[var(--spacing-4)] transition-transform duration-[var(--duracion-media)] ease-[var(--ease-principal)] motion-reduce:transition-none', abierto && 'rotate-180')} />
      </button>
    </span>
  )
}

/** La lista, debajo de «Servicios» (fuera de la píldora): las páginas de servicio. */
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
            {/* [C2-21] El mismo tic de hover que los ítems de la barra (con el sonido apagado, nada). */}
            <EnlaceDeRuta href={destinoDesde(ruta, p.destino)} data-pieza="desplegable-enlace" tabIndex={abierto ? undefined : -1} onClick={() => cerrar(false)} onPointerEnter={() => sonar('tic')} onFocus={() => sonar('tic')} className={CLASE_DEL_TEXTO}>
              {p.rotulo}
            </EnlaceDeRuta>
          </li>
        ))}
      </ul>
    </div>
  )
}
