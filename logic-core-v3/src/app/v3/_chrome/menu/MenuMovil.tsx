'use client'

import { X } from 'lucide-react'
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref, type RefObject } from 'react'

import { cn } from '@/lib/utils'

import { Isotipo } from '../../_componentes/marca/Marca'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { ESCALA_DEL_FUNDIDO, MS_DEL_FUNDIDO } from '../../_secciones/trabajos/demos/apertura'
import { useDialogo } from '../../_secciones/trabajos/demos/dialogo'
import { MS_DEL_GENIE, correrPorTiempo, type Caja } from '../../_secciones/trabajos/demos/genie'
import { abrirContacto, useContacto } from '../contacto/apertura'
import { nocheQueSeVe, tonoBajo } from '../cursor/estado'
import { ENLACES_DEL_HOME } from '../enlaces'
import { salaDetrasDelMenu } from '../escena/salaDetrasDelMenu'
import { GenieDelMenu, type ControlDelGenieDelMenu, type PiezaDelGenie } from './GenieDelMenu'
import { LenteDelVidrio, conLente } from './LenteDelVidrio'
import { vaInvertido } from './tono'
import { useTonoDebajo } from './useTonoDebajo'

/**
 * EL MENÚ DEL TELÉFONO — un círculo con el logo arriba al centro y un panel de vidrio líquido. **[CONTACTO]** ·
 * **[NAVBAR] T3**
 *
 * Se monta cuando el chrome está en modo menú (abajo de `medio`, o si la barra no entra: lo mide `BarraDelHome`).
 *
 *   · **Se abre con el Genie de las demos, desde el botón, y se cierra igual, de vuelta al botón** (`GenieDelMenu`, la
 *     misma geometría y el mismo reloj que la ventana de una demo). Lo que viaja es una copia plana del panel; al
 *     terminar de abrir, el vidrio de verdad toma su lugar. Con movimiento reducido, sin Genie: un fundido corto (el de
 *     las demos). En SPRINT CONTACTO el Genie se descartó para este menú por su costo (p95 93 ms con la CPU ×4): acá
 *     todo está MONTADO Y ESCONDIDO desde que el chrome pasa a modo menú (el panel, las tiras en `display: none`, el
 *     mapa de la lente ya dibujado), así abrir no monta nada. Medido en `navbar/t3-menu/`.
 *   · **Cubre casi toda la pantalla**, centrado, con `--spacing-4` de margen en los cuatro lados.
 *   · **El vidrio** (`vidrio.css`): desenfoque y saturación del fondo, el brillo especular arriba y un filo de luz; en
 *     Chromium, además, la refracción del canto (`LenteDelVidrio`). Safari no acepta filtros SVG en el
 *     `backdrop-filter` y se queda con lo demás, que se sostiene solo.
 *   · **El tono, el de la zona** (se lee al abrir, en el medio del cuadro): sobre zona oscura, vidrio claro; sobre zona
 *     clara, vidrio oscuro (los tokens de la sala invertida). El texto es la tinta de cada tono sobre su tinte: AA
 *     contra cualquier fondo (medido en `navbar/t3-menu/`).
 *   · Detrás, la sala se desenfoca y se oscurece (`salaDetrasDelMenu`, T1 de INTERFAZ 2) y la página, poco.
 *
 * Es un diálogo con el foco atrapado (`TrampaDelMenu`, montada sólo mientras está abierto): su botón de cerrar está
 * ADENTRO, en el lugar del botón del menú (que se esconde mientras el panel lo tapa), así el lector lo encuentra y Tab no
 * se escapa. Esc, el botón o tocar afuera lo cierran; el foco vuelve al botón del menú. Los ítems son grandes (un
 * renglón de `--spacing-12` como mínimo) y «Contacto» abre el formulario cuando el menú terminó de irse.
 */

export const ROTULO_DEL_MENU = { abrir: 'Abrir el menú', cerrar: 'Cerrar el menú', menu: 'Menú' } as const

/**
 * El relevo entre la copia plana del Genie y el vidrio (ms): al abrir el vidrio se funde encima de las tiras quietas; al
 * cerrar se funde mientras las tiras arrancan. Sin él se veía el salto: la copia plana no puede leer el fondo.
 */
export const MS_DEL_RELEVO = 140

/** Sobre una zona oscura (la sala de noche, una foto), el vidrio claro; sobre una clara, el oscuro. */
function zonaOscura(): boolean {
  const debajo = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
  if (debajo !== null && (debajo.tagName === 'IMG' || debajo.tagName === 'VIDEO')) return true
  return tonoBajo(debajo, nocheQueSeVe()) === 'oscuro'
}

export function MenuMovil(): React.JSX.Element | null {
  const { modo } = useContacto()
  const [abierto, setAbierto] = useState(false)
  const [vidrioOscuro, setVidrioOscuro] = useState(false)
  const [cubierto, setCubierto] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  const menu = useRef<ControlDelMenu>(null)
  const haciaElContacto = useRef(false)
  const enMenu = modo === 'menu'
  const invertido = vaInvertido(useTonoDebajo(boton, enMenu))

  // [INTERFAZ 2] T1 · la sala se desenfoca y se oscurece apenas detrás del menú abierto.
  useEffect(() => {
    salaDetrasDelMenu(abierto)
    return () => salaDetrasDelMenu(false)
  }, [abierto])

  // Si el chrome vuelve a la barra, el menú se cierra (ajuste durante el render, no en un efecto).
  const [enMenuAntes, setEnMenuAntes] = useState(enMenu)
  if (enMenuAntes !== enMenu) {
    setEnMenuAntes(enMenu)
    if (!enMenu) setAbierto(false)
  }

  const alCerrado = useCallback(() => {
    setCubierto(false)
    setAbierto(false)
  }, [])
  const alContacto = useCallback(() => {
    haciaElContacto.current = true
  }, [])

  // Al cerrar del todo, con la trampa de foco y el bloqueo de scroll ya soltados.
  const alSoltar = useCallback((): void => {
    if (haciaElContacto.current) {
      haciaElContacto.current = false
      abrirContacto([], boton.current)
    } else boton.current?.focus({ preventScroll: true })
  }, [])

  if (!enMenu) return null
  return (
    // [NAVBAR] Arriba del resto del chrome (el infinito del recorrido, la barra): el panel abierto lo tapa todo.
    <div data-pieza="menu-movil" className="fixed inset-x-0 top-0 z-[var(--z-overlay)]">
      <Menu ref={menu} abierto={abierto} invertido={vidrioOscuro} boton={boton} alCubrir={setCubierto} alCerrado={alCerrado} alContacto={alContacto} alSoltar={alSoltar} />
      <button
        ref={boton}
        type="button"
        data-parte="boton-del-menu"
        data-seccion={invertido ? 'invertida' : undefined}
        aria-label={abierto ? ROTULO_DEL_MENU.cerrar : ROTULO_DEL_MENU.abrir}
        aria-expanded={abierto}
        aria-controls="menu-movil"
        onClick={() => {
          if (abierto) return
          setVidrioOscuro(!zonaOscura())
          setAbierto(true)
          menu.current?.abrir()
        }}
        className={cn(
          'bg-fondo text-tinta border-borde fixed inset-x-0 top-[var(--spacing-4)] mx-auto grid size-[var(--spacing-12)] place-items-center rounded-full border shadow-[var(--shadow-flotante)] transition-colors duration-[var(--duracion-media)]',
          cubierto && 'invisible',
        )}
      >
        <Isotipo className="h-[var(--spacing-5)]" />
      </button>
    </div>
  )
}

type Fase = 'cerrado' | 'abriendo' | 'abierto' | 'cerrando'

/** Una pieza del panel medida en su lugar (relativa al panel): lo que la copia plana del Genie repite. */
interface PiezaMedida {
  readonly cerrar: boolean
  readonly texto: string
  readonly caja: Caja
}

interface Geometria {
  readonly ventana: Caja
  readonly destino: Caja
  readonly radio: number
  readonly piezas: readonly PiezaMedida[]
}

function cajaDe(el: Element | null): Caja {
  const r = el?.getBoundingClientRect()
  return r === undefined ? { x: 0, y: 0, ancho: 0, alto: 0 } : { x: r.left, y: r.top, ancho: r.width, alto: r.height }
}

/** El panel (en su lugar, escondido) y el botón: de dónde sale el Genie y adónde va, y el radio del panel para la lente. */
function medirLaGeometria(panel: HTMLElement | null, boton: HTMLElement | null): Geometria {
  const radio = panel === null ? 0 : Number.parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 0
  const ventana = cajaDe(panel)
  const piezas = panel === null ? [] : [...panel.querySelectorAll<HTMLElement>('[data-parte="cerrar-el-menu"], [data-parte="item-del-menu"]')].map((el) => {
    const c = cajaDe(el)
    return { cerrar: el.getAttribute('data-parte') === 'cerrar-el-menu', texto: el.textContent ?? '', caja: { x: c.x - ventana.x, y: c.y - ventana.y, ancho: c.ancho, alto: c.alto } }
  })
  return { ventana, destino: cajaDe(boton), radio, piezas }
}

const mismaCaja = (a: Caja, b: Caja): boolean => a.x === b.x && a.y === b.y && a.ancho === b.ancho && a.alto === b.alto
const mismaGeometria = (a: Geometria, b: Geometria): boolean =>
  mismaCaja(a.ventana, b.ventana) && mismaCaja(a.destino, b.destino) && a.radio === b.radio && a.piezas.length === b.piezas.length && a.piezas.every((p, i) => mismaCaja(p.caja, b.piezas[i].caja))

/** Lo que el botón del menú le pide al panel. */
export interface ControlDelMenu {
  readonly abrir: () => void
}

/** La trampa del diálogo, montada sólo con el menú abierto. Su desmontaje suelta el foco y el scroll (en ese orden). */
function TrampaDelMenu({ caja, alCerrar, alSoltar }: { readonly caja: RefObject<HTMLDivElement | null>; readonly alCerrar: () => void; readonly alSoltar: () => void }): null {
  useDialogo(caja, alCerrar)
  // Declarado después de `useDialogo`: su limpieza corre después de la de la trampa (que, si no, retendría el foco).
  useEffect(() => alSoltar, [alSoltar])
  return null
}

export function Menu({
  abierto,
  invertido,
  boton,
  alCubrir,
  alCerrado,
  alContacto,
  alSoltar,
  ref,
}: {
  /** Lo pide el botón; el menú abre con el Genie y, al terminar de cerrar, avisa (`alCerrado`). */
  readonly abierto: boolean
  /** El vidrio oscuro (sobre una zona clara). */
  readonly invertido: boolean
  readonly boton: RefObject<HTMLButtonElement | null>
  /** El panel abierto tapa al botón del menú (su botón de cerrar va en el mismo lugar). */
  readonly alCubrir: (cubierto: boolean) => void
  readonly alCerrado: () => void
  readonly alContacto: () => void
  readonly alSoltar: () => void
  readonly ref?: Ref<ControlDelMenu>
}): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const velo = useRef<HTMLDivElement>(null)
  const capaDelGenie = useRef<HTMLDivElement>(null)
  const pintor = useRef<ControlDelGenieDelMenu>(null)
  const cancelar = useRef<() => void>(() => undefined)
  /** La fase y cuánto está metido en el botón (1 = adentro): refs, para que cerrar no cambie y la trampa no se rearme. */
  const fase = useRef<Fase>('cerrado')
  const metido = useRef(1)
  const reducido = useMovimientoReducido()
  const [geometria, setGeometria] = useState<Geometria | null>(null)
  const arrancarAlMedir = useRef(false)
  const [lente] = useState(conLente)

  // Montado y escondido: la geometría (y con ella el mapa de la lente) se mide ya, no al abrir, y otra vez si cambia el
  // cuadro. Un objeto nuevo sólo si cambió algo: las cuarenta tiras no se vuelven a dibujar por nada.
  useEffect(() => {
    const medir = (): void => {
      const nueva = medirLaGeometria(caja.current, boton.current)
      setGeometria((g) => (g !== null && mismaGeometria(g, nueva) ? g : nueva))
    }
    const primera = requestAnimationFrame(medir)
    window.addEventListener('resize', medir)
    return () => {
      cancelAnimationFrame(primera)
      window.removeEventListener('resize', medir)
    }
  }, [boton])

  /** Un cuadro del Genie: `m` es cuánto está metido en el botón (1 = adentro). */
  const cuadro = useCallback((m: number): void => {
    metido.current = m
    pintor.current?.pintar(m)
    velo.current?.style.setProperty('opacity', (1 - m).toFixed(3))
  }, [])

  /** El vidrio de verdad a la vista (o no), la capa del Genie al revés, y el velo que atrapa los toques. */
  const mostrar = useCallback((vidrio: boolean, genie: boolean): void => {
    caja.current?.style.setProperty('visibility', vidrio ? 'visible' : 'hidden')
    capaDelGenie.current?.style.setProperty('visibility', genie ? 'visible' : 'hidden')
  }, [])

  /** Movimiento reducido: sin Genie, el panel en su lugar con un fundido y una escala corta (los de las demos). */
  const fundir = useCallback(
    (hacia: 0 | 1, alTerminar: () => void): (() => void) => {
      mostrar(true, false)
      return correrPorTiempo(
        MS_DEL_FUNDIDO,
        (t) => {
          const u = hacia === 1 ? t / MS_DEL_FUNDIDO : 1 - t / MS_DEL_FUNDIDO
          caja.current?.style.setProperty('opacity', u.toFixed(3))
          caja.current?.style.setProperty('scale', (ESCALA_DEL_FUNDIDO + (1 - ESCALA_DEL_FUNDIDO) * u).toFixed(4))
          velo.current?.style.setProperty('opacity', u.toFixed(3))
        },
        alTerminar,
      )
    },
    [mostrar],
  )

  const arrancar = useCallback((): void => {
    fase.current = 'abriendo'
    velo.current?.style.setProperty('pointer-events', 'auto')
    const listo = (): void => {
      fase.current = 'abierto'
      alCubrir(true)
      caja.current?.querySelector<HTMLElement>('[data-parte="item-del-menu"]')?.focus({ preventScroll: true })
    }
    if (reducido) {
      cancelar.current = fundir(1, listo)
      return
    }
    caja.current?.style.removeProperty('opacity')
    caja.current?.style.removeProperty('scale')
    mostrar(false, true)
    cuadro(1)
    // Un cuadro después del que muestra las tiras: contar desde ahí era perder los primeros.
    const espera = requestAnimationFrame(() => {
      cancelar.current = correrPorTiempo(MS_DEL_GENIE, (t) => cuadro(1 - t / MS_DEL_GENIE), () => {
        caja.current?.style.setProperty('opacity', '0')
        mostrar(true, true)
        cancelar.current = correrPorTiempo(MS_DEL_RELEVO, (t) => caja.current?.style.setProperty('opacity', (t / MS_DEL_RELEVO).toFixed(3)), () => {
          mostrar(true, false)
          listo()
        })
      })
    })
    cancelar.current = () => cancelAnimationFrame(espera)
  }, [reducido, fundir, mostrar, cuadro, alCubrir])

  // LA APERTURA, que pide el botón. Si la geometría cambió (el teclado del teléfono, una rotación) se re-mide y arranca
  // cuando las tiras ya están a medida.
  useImperativeHandle(
    ref,
    () => ({
      abrir: () => {
        if (fase.current !== 'cerrado') return
        const ahora = medirLaGeometria(caja.current, boton.current)
        if (geometria !== null && mismaGeometria(ahora, geometria)) arrancar()
        else {
          arrancarAlMedir.current = true
          setGeometria(ahora)
        }
      },
    }),
    [geometria, arrancar, boton],
  )
  useLayoutEffect(() => {
    if (!arrancarAlMedir.current || geometria === null) return
    arrancarAlMedir.current = false
    arrancar()
  }, [geometria, arrancar])

  // EL CIERRE: el vidrio se va, y el Genie lo lleva de vuelta al botón (desde donde iba, si se cierra abriendo).
  const cerrar = useCallback((): void => {
    if (fase.current === 'cerrando' || fase.current === 'cerrado') return
    const estabaAbierto = fase.current === 'abierto'
    fase.current = 'cerrando'
    cancelar.current()
    alCubrir(false)
    const terminar = (): void => {
      fase.current = 'cerrado'
      mostrar(false, false)
      caja.current?.style.removeProperty('opacity')
      velo.current?.style.setProperty('pointer-events', 'none')
      alCerrado()
    }
    if (reducido) {
      cancelar.current = fundir(0, terminar)
      return
    }
    mostrar(estabaAbierto, true)
    const desde = estabaAbierto ? 0 : metido.current
    cuadro(desde)
    const ms = MS_DEL_GENIE * (1 - desde)
    cancelar.current = correrPorTiempo(
      ms,
      (t) => {
        cuadro(desde + (1 - desde) * (ms === 0 ? 1 : t / ms))
        if (estabaAbierto) caja.current?.style.setProperty('opacity', Math.max(0, 1 - t / MS_DEL_RELEVO).toFixed(3))
      },
      terminar,
    )
  }, [reducido, fundir, cuadro, mostrar, alCubrir, alCerrado])

  // Si el chrome vuelve a la barra con el menú abierto, el padre lo da por cerrado: acá se apaga todo de golpe.
  useEffect(() => {
    if (abierto || fase.current === 'cerrado' || fase.current === 'cerrando') return
    cancelar.current()
    fase.current = 'cerrado'
    mostrar(false, false)
  }, [abierto, mostrar])
  useEffect(() => () => cancelar.current(), [])

  const tono = invertido ? 'invertida' : undefined
  // La copia plana: cada pieza medida, pintada como la de verdad.
  const piezas = useMemo<readonly PiezaDelGenie[]>(
    () =>
      (geometria?.piezas ?? []).map((p, i) => ({
        clave: String(i),
        caja: p.caja,
        nodo: p.cerrar ? <span className={cn(CLASE_DEL_CERRAR, 'size-full')}>{CRUZ}</span> : <span className={cn(CLASE_DEL_ITEM, 'h-full')}>{p.texto}</span>,
      })),
    [geometria],
  )
  return (
    <>
      {abierto && <TrampaDelMenu caja={caja} alCerrar={cerrar} alSoltar={alSoltar} />}
      <div
        ref={velo}
        data-parte="velo-del-menu"
        aria-hidden="true"
        onClick={cerrar}
        className="pointer-events-none fixed inset-0 bg-[color-mix(in_srgb,var(--color-tinta)_20%,transparent)] opacity-0 backdrop-blur-[calc(var(--blur-panel)/3)]"
        // [INTERFAZ 2] T1 · el velo desenfoca POCO la página (un tercio de `--blur-panel`): la que se va de foco es la sala.
      />
      {geometria !== null && !reducido && (
        <div ref={capaDelGenie} className="invisible">
          <GenieDelMenu
            ref={pintor}
            ventana={geometria.ventana}
            destino={geometria.destino}
            piezas={piezas}
            fondo={(hijos) => (
              <div data-pieza="vidrio-plano" data-seccion={tono} className="size-full">
                {hijos}
              </div>
            )}
          />
        </div>
      )}
      {lente && geometria !== null && <LenteDelVidrio ancho={geometria.ventana.ancho} alto={geometria.ventana.alto} radio={geometria.radio} />}
      <div
        ref={caja}
        id="menu-movil"
        role="dialog"
        aria-modal="true"
        aria-label={ROTULO_DEL_MENU.menu}
        data-parte="menu"
        data-pieza="vidrio"
        data-seccion={tono}
        data-lente={lente && geometria !== null ? '' : undefined}
        data-lenis-prevent=""
        className="invisible fixed inset-[var(--spacing-4)] flex flex-col"
      >
        <ContenidoDelMenu alCerrar={cerrar} alContacto={alContacto} />
      </div>
    </>
  )
}

/** La cruz del botón de cerrar (la misma en la copia plana del Genie). */
const CRUZ = <X aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-5)]" />

/** El adentro del panel: su botón de cerrar (arriba al centro, en el lugar del botón del menú) y los ítems. */
function ContenidoDelMenu({ alCerrar, alContacto }: { readonly alCerrar: () => void; readonly alContacto: () => void }): React.JSX.Element {
  return (
    <div className="flex size-full flex-col">
      <button type="button" data-parte="cerrar-el-menu" aria-label={ROTULO_DEL_MENU.cerrar} onClick={alCerrar} className={CLASE_DEL_CERRAR}>
        {CRUZ}
      </button>
      <nav aria-label="Navegación principal" className="flex flex-1 flex-col justify-center px-[var(--spacing-6)] pb-[var(--spacing-12)]">
        <ul className="flex flex-col gap-[var(--spacing-1)]">
          {ENLACES_DEL_HOME.map((enlace) => (
            <li key={enlace.id}>
              {enlace.destino === '#contacto' ? (
                <button
                  type="button"
                  data-parte="item-del-menu"
                  onClick={() => {
                    alContacto()
                    alCerrar()
                  }}
                  className={CLASE_DEL_ITEM}
                >
                  {enlace.rotulo}
                </button>
              ) : (
                <a href={enlace.destino} data-parte="item-del-menu" onClick={alCerrar} className={CLASE_DEL_ITEM}>
                  {enlace.rotulo}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

const CLASE_DEL_CERRAR = 'bg-fondo text-tinta border-borde mx-auto grid size-[var(--spacing-12)] shrink-0 place-items-center rounded-full border'

const CLASE_DEL_ITEM = cn(
  'text-titulo-m font-titulo leading-titulo tracking-titulo flex min-h-[var(--spacing-12)] w-full items-center rounded-[var(--radius-medio)] px-[var(--spacing-4)] py-[var(--spacing-2)] text-left',
  'hover:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)]',
)
