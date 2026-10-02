'use client'

import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref, type RefObject } from 'react'

import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { sonar } from '../../_lib/sonido/bus'
import { ESCALA_DEL_FUNDIDO, MS_DEL_FUNDIDO } from '../../_secciones/trabajos/demos/apertura'
import { useDialogo } from '../../_secciones/trabajos/demos/dialogo'
import { MS_DEL_GENIE, correrPorTiempo, liderDelGenie } from '../../_secciones/trabajos/demos/genie'
import { GenieDelMenu, type ControlDelGenieDelMenu, type PiezaDelGenie } from './GenieDelMenu'
import { LenteDelVidrio, conLente } from './LenteDelVidrio'
import { CLASE_DEL_CERRAR, CLASE_DEL_ITEM, CRUZ, ContenidoDelMenu, ROTULO_DEL_MENU, medirLaGeometria, mismaGeometria, type Geometria } from './PanelDelMenu'
import { aplicarLaSilueta, soltarLaSilueta } from './silueta'

/**
 * [NAVBAR] EL PANEL DEL MENÚ DEL TELÉFONO — el vidrio, su Genie (con la silueta) y la trampa del diálogo. Lo abre el
 * botón de `MenuMovil.tsx` (a mano: `ControlDelMenu.abrir`); el porqué de cada decisión está en el docblock de allá.
 * Separado de él para que ninguno pase las 300 líneas (`s8-montaje`).
 */

type Fase = 'cerrado' | 'abriendo' | 'abierto' | 'cerrando'

/** Lo que el botón del menú le pide al panel: abrir, con el vidrio oscuro (sobre una zona clara) o claro. */
export interface ControlDelMenu {
  readonly abrir: (vidrioOscuro: boolean) => void
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
  boton,
  alCubrir,
  alCerrado,
  alSoltar,
  alContacto,
  ref,
}: {
  /** Lo que el botón anuncia (y la trampa del diálogo); el Genie lo arranca `abrir`, a mano. */
  readonly abierto: boolean
  readonly boton: RefObject<HTMLButtonElement | null>
  readonly alCubrir: (cubierto: boolean) => void
  readonly alCerrado: () => void
  readonly alSoltar: () => void
  readonly alContacto: () => void
  readonly ref?: Ref<ControlDelMenu>
}): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const velo = useRef<HTMLDivElement>(null)
  const capaDelGenie = useRef<HTMLDivElement>(null)
  const filo = useRef<SVGPathElement>(null)
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

  const capas = useCallback(() => ({ vidrio: caja.current, texto: capaDelGenie.current, filo: filo.current }), [])

  /** La forma y el texto en el progreso `m` del Genie (1 = adentro del botón), sin tocar el velo. */
  const forma = useCallback(
    (m: number): void => {
      if (geometria === null) return
      pintor.current?.pintar(m)
      aplicarLaSilueta(m, geometria.ventana, geometria.destino, liderDelGenie(geometria.ventana, geometria.destino), geometria.radio, capas())
    },
    [geometria, capas],
  )

  /** Un cuadro del Genie: la forma, y el velo que la acompaña. */
  const cuadro = useCallback(
    (m: number): void => {
      metido.current = m
      forma(m)
      velo.current?.style.setProperty('opacity', (1 - m).toFixed(3))
    },
    [forma],
  )

  /** Cerrado, en el Genie (el vidrio recortado por la silueta, el texto en las tiras) o abierto (el vidrio entero). */
  const mostrar = useCallback(
    (estado: 'cerrado' | 'genie' | 'abierto'): void => {
      caja.current?.style.setProperty('visibility', estado === 'cerrado' ? 'hidden' : 'visible')
      capaDelGenie.current?.style.setProperty('visibility', estado === 'genie' ? 'visible' : 'hidden')
      if (estado === 'genie') caja.current?.setAttribute('data-genie', '')
      else {
        caja.current?.removeAttribute('data-genie')
        soltarLaSilueta(capas())
      }
    },
    [capas],
  )

  /** Movimiento reducido: sin Genie, el panel en su lugar con un fundido y una escala corta (los de las demos). */
  const fundir = useCallback(
    (hacia: 0 | 1, alTerminar: () => void): (() => void) => {
      mostrar('abierto')
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
    sonar('abre') // [3D Y SONIDO] T2
    velo.current?.style.setProperty('pointer-events', 'auto')
    // Las tiras también: si el clic cae durante el precalentado, ninguna queda casi transparente.
    for (const el of [caja.current, capaDelGenie.current]) el?.style.removeProperty('opacity')
    caja.current?.style.removeProperty('scale')
    const listo = (): void => {
      fase.current = 'abierto'
      alCubrir(true)
      caja.current?.querySelector<HTMLElement>('[data-parte="item-del-menu"]')?.focus({ preventScroll: true })
    }
    if (reducido) {
      cancelar.current = fundir(1, listo)
      return
    }
    mostrar('genie')
    cuadro(1)
    // Un cuadro después del que muestra la forma: contar desde ahí era perder los primeros.
    const espera = requestAnimationFrame(() => {
      cancelar.current = correrPorTiempo(MS_DEL_GENIE, (t) => cuadro(1 - t / MS_DEL_GENIE), () => {
        mostrar('abierto')
        listo()
      })
    })
    cancelar.current = () => cancelAnimationFrame(espera)
  }, [reducido, fundir, mostrar, cuadro, alCubrir])

  // [Retoque 1] PRECALENTAR: una vez, el vidrio con su lente y las tiras se pintan dos cuadros casi transparentes, así
  // el primer Genie no compila nada en su primer cuadro (el filtro, la forma, las cuarenta capas).
  const precalentado = useRef(false)
  useEffect(() => {
    if (geometria === null || precalentado.current || reducido) return
    precalentado.current = true
    const casiNada = (si: boolean): void => {
      for (const el of [caja.current, capaDelGenie.current]) {
        if (si) el?.style.setProperty('opacity', '0.01')
        else el?.style.removeProperty('opacity')
      }
    }
    let cuadro1 = 0
    let cuadro2 = 0
    const reloj = window.setTimeout(() => {
      if (fase.current !== 'cerrado') return
      casiNada(true)
      mostrar('genie')
      forma(0.5)
      cuadro1 = requestAnimationFrame(() => {
        cuadro2 = requestAnimationFrame(() => {
          if (fase.current === 'cerrado') mostrar('cerrado')
          casiNada(false)
        })
      })
    }, 600)
    return () => {
      window.clearTimeout(reloj)
      cancelAnimationFrame(cuadro1)
      cancelAnimationFrame(cuadro2)
    }
  }, [geometria, reducido, mostrar, forma])

  // LA APERTURA, que pide el botón. Si la geometría cambió (el teclado del teléfono, una rotación) se re-mide y arranca
  // cuando las tiras ya están a medida. El tono va a mano: abrir no vuelve a dibujar nada.
  useImperativeHandle(
    ref,
    () => ({
      abrir: (vidrioOscuro: boolean) => {
        if (fase.current !== 'cerrado') return
        for (const el of [caja.current, capaDelGenie.current]) {
          if (vidrioOscuro) el?.setAttribute('data-seccion', 'invertida')
          else el?.removeAttribute('data-seccion')
        }
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

  // EL CIERRE: la forma vuelve al botón con el vidrio adentro (desde donde iba, si se cierra abriendo).
  const cerrar = useCallback((): void => {
    if (fase.current === 'cerrando' || fase.current === 'cerrado') return
    const estabaAbierto = fase.current === 'abierto'
    fase.current = 'cerrando'
    sonar('cierra') // [3D Y SONIDO] T2
    cancelar.current()
    alCubrir(false)
    const terminar = (): void => {
      fase.current = 'cerrado'
      mostrar('cerrado')
      caja.current?.style.removeProperty('opacity')
      caja.current?.style.removeProperty('scale')
      velo.current?.style.setProperty('pointer-events', 'none')
      alCerrado()
    }
    if (reducido) {
      cancelar.current = fundir(0, terminar)
      return
    }
    const desde = estabaAbierto ? 0 : metido.current
    cuadro(desde)
    mostrar('genie')
    const ms = MS_DEL_GENIE * (1 - desde)
    cancelar.current = correrPorTiempo(ms, (t) => cuadro(desde + (1 - desde) * (ms === 0 ? 1 : t / ms)), terminar)
  }, [reducido, fundir, cuadro, mostrar, alCubrir, alCerrado])

  // Si el chrome vuelve a la barra con el menú abierto, el padre lo da por cerrado: acá se apaga todo de golpe.
  useEffect(() => {
    if (abierto || fase.current === 'cerrado' || fase.current === 'cerrando') return
    cancelar.current()
    fase.current = 'cerrado'
    mostrar('cerrado')
  }, [abierto, mostrar])
  useEffect(() => () => cancelar.current(), [])

  // El texto del Genie: cada pieza medida, pintada como la de verdad.
  const piezas = useMemo<readonly PiezaDelGenie[]>(
    () =>
      (geometria?.piezas ?? []).map((p, i) => ({
        clave: String(i),
        caja: p.caja,
        nodo: p.cerrar ? <span className={`${CLASE_DEL_CERRAR} size-full`}>{CRUZ}</span> : <span className={`${CLASE_DEL_ITEM} h-full`}>{p.texto}</span>,
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
      {lente && geometria !== null && <LenteDelVidrio ancho={geometria.ventana.ancho} alto={geometria.ventana.alto} radio={geometria.radio} />}
      <div
        ref={caja}
        id="menu-movil"
        role="dialog"
        aria-modal="true"
        aria-label={ROTULO_DEL_MENU.menu}
        data-parte="menu"
        data-pieza="vidrio"
        data-lente={lente && geometria !== null ? '' : undefined}
        data-lenis-prevent=""
        className="invisible fixed inset-[var(--spacing-4)] flex flex-col"
      >
        {/* [Retoque 1] El filo de luz que sigue a la silueta mientras el Genie la recorta. */}
        <svg data-parte="filo-del-genie" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full overflow-visible">
          <path ref={filo} />
        </svg>
        <ContenidoDelMenu alCerrar={cerrar} alContacto={alContacto} />
      </div>
      {/* El texto del Genie va ENCIMA del vidrio. */}
      {geometria !== null && !reducido && (
        <div ref={capaDelGenie} className="invisible">
          <GenieDelMenu ref={pintor} ventana={geometria.ventana} destino={geometria.destino} piezas={piezas} />
        </div>
      )}
    </>
  )
}
