'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { Suspense, lazy, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { abrirLaEntrada, entradaAbierta, scrollRetenido, suscribirALaEntrada } from '../../_lib/entrada'
import { PROPIEDAD_DE_LA_CUBIERTA, SCRIPT_DE_LA_DECISION, decisionDeLaVentana } from './decision'

/**
 * [B12c] EL PRELOADER DEL SITIO — la primera entrada del día, por cualquier página de /v3 (lo decidió Valentino el 2026-10-21; el
 * detalle, en `docs/cola/2026-10-22/70-B12c-preloader.md` y `docs/rediseno/SPRINT-B12C-NOCTURNO.md`). Es nuevo: no usa ni toca
 * `PreloaderContext.tsx` (frozen) ni el intro viejo del home vivo (`IntroDelHome`, apagado en /v3 desde ESCENA 4).
 *
 * Tres piezas, por lo que cada una necesita:
 *
 *   1. **La decisión, antes del primer pintado:** el script de `decision.ts` va al `<head>` del HTML del servidor
 *      (`useServerInsertedHTML`, el mismo camino del gate del intro viejo). Si es la primera entrada del día, muestra esta cubierta y
 *      bloquea el scroll desde el primer instante.
 *   2. **La cubierta:** viaja en el HTML del servidor, negra, encima de todo (también del chrome y de los diálogos), y sin la decisión no
 *      se ve (`_estilos/preloader.css`, con su seguro si la página no hidrata). Sin hijos en el servidor: lo que se ve lo pone la capa.
 *   3. **La capa** (`CapaDelPreloader`, perezosa: sólo la baja quien la ve): la secuencia, la flecha y la espera de la carga. Al terminar,
 *      la entrada se abre (`_lib/entrada.ts`): el titular del hero y el logo caen, o el título de la página llega. **El scroll** sigue
 *      bloqueado hasta que llegan (lo que llega con la entrada lo retiene), o a lo sumo `TOPE_DEL_BLOQUEO_MS` después.
 *
 * Sin la decisión (las otras entradas del día, las recargas, las pruebas) esto es un `div` escondido y nada más: ni la capa ni el
 * bloqueo, y la entrada abierta desde el principio.
 */
const CapaDelPreloader = lazy(() => import('./CapaDelPreloader'))

/** Abierta la entrada, lo más que el scroll espera a lo que llega con ella (el logo que cae y el título de una página: 2,4 s). */
export const TOPE_DEL_BLOQUEO_MS = 6000

const sinCambios = (): (() => void) => () => undefined

export function PreloaderDelSitio(): React.JSX.Element {
  // El script va una sola vez, en el primer envío del HTML (el callback corre en cada envío del stream).
  const insertado = useRef(false)
  useServerInsertedHTML(() => {
    if (insertado.current) return null
    insertado.current = true
    return <script dangerouslySetInnerHTML={{ __html: SCRIPT_DE_LA_DECISION }} />
  })
  // La decisión del script, después de hidratar (el servidor no la conoce: el primer render es el de la cubierta escondida).
  const decision = useSyncExternalStore(sinCambios, decisionDeLaVentana, () => null)
  const [terminado, setTerminado] = useState(false)
  // La capa pintó su primer cuadro: desde ahí la maneja ella (y el seguro sin JavaScript de la hoja se apaga). Si nunca arranca (su
  // módulo no llegó, la página no hidrató), el seguro la esconde a los 20 s.
  const [arranco, setArranco] = useState(false)
  const alArrancar = useCallback((): void => setArranco(true), [])
  const cubierta = useRef<HTMLDivElement>(null)

  // La capa terminó (su blanco se fundió): la cubierta se va y la entrada se abre.
  const alTerminar = useCallback((): void => {
    document.documentElement.style.removeProperty(PROPIEDAD_DE_LA_CUBIERTA)
    abrirLaEntrada()
    setTerminado(true)
  }, [])

  // El bloqueo del scroll (lo puso el script): se suelta con la entrada abierta y nada que llegue con ella, o a su tope.
  useEffect(() => {
    if (decision === null) return undefined
    let tope: number | undefined
    let suelto = false
    const soltar = (): void => {
      if (suelto) return
      suelto = true
      window.clearTimeout(tope)
      decision.soltar()
    }
    const revisar = (): void => {
      if (!entradaAbierta()) return
      tope ??= window.setTimeout(soltar, TOPE_DEL_BLOQUEO_MS)
      if (!scrollRetenido()) soltar()
    }
    const quitar = suscribirALaEntrada(revisar)
    revisar()
    return () => {
      quitar()
      window.clearTimeout(tope)
    }
  }, [decision])

  const activo = decision !== null && !terminado
  return (
    <div
      ref={cubierta}
      data-pieza="preloader"
      data-estado={terminado ? 'fuera' : arranco ? 'vivo' : undefined}
      role={activo ? 'dialog' : undefined}
      aria-modal={activo ? true : undefined}
      aria-label={activo ? 'Bienvenida' : undefined}
      aria-hidden={activo ? undefined : true}
      className="bg-tinta fixed inset-0 z-[calc(var(--z-overlay)+1)] overflow-hidden"
    >
      {activo && (
        <Suspense fallback={null}>
          <CapaDelPreloader decision={decision} cubierta={cubierta} alArrancar={alArrancar} alTerminar={alTerminar} />
        </Suspense>
      )}
    </div>
  )
}
