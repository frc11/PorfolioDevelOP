'use client'

import { AnimatePresence, motion, type Transition } from 'motion/react'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'

import { Historias } from '../../_componentes/historias/Historias'
import type { SalidaDeLasHistorias } from '../../_componentes/historias/maquinaDeLasHistorias'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { CONSULTA_DEBAJO_DE_768, cajaPegada, destinoDeLaSalida, montarLasHistorias, type PasoDelPrecio } from '../bloques/precio/historiasDelPrecio'
import { PantallaDelPaso } from '../bloques/precio/PantallaDelPaso'
import { ETIQUETA_DE_LAS_HISTORIAS, ROTULOS_DE_LAS_HISTORIAS } from '../bloques/precio/rotulos'
import type { EstiloConVariables } from '../estiloDelAcento'

/**
 * [SERVICIOS M2b] EL PRECIO EN HISTORIAS — por debajo de 768, las tres opciones con las historias comunes del home
 * (`_componentes/historias/`, P-H19), importadas tal cual: su comportamiento no cambia. Plan: `docs/servicios/SPRINT-M2b.md` §2.
 *
 *   · El título en papel y, debajo, la sección alta (dos pantallas, solo con movimiento: `motion-safe`, por CSS) con su caja anclada.
 *     Mientras la caja no cubre el cuadro se ve la lista quieta (los hijos: el primer paso a pantalla).
 *   · Las historias se montan con la caja pegada, por debajo de 768 y sin movimiento reducido (`montarLasHistorias`), como en el
 *     Portfolio: entran con un fundido y arrancan en la Simple, el mismo paso que la lista deja a la vista. Al salir se desmontan.
 *   · Las salidas del componente mueven la página: adelante, al final de la sección alta (el CTA del precio queda arriba); atrás, al título.
 *   · La caja pegada se mide en el layout (la sección alta no la transforma nada), con el scroll y el tamaño, a lo sumo una vez por cuadro.
 *   · Desde 768 no se montan nunca: lo decide `matchMedia` con la consulta de `max-md:` (en el servidor, nunca).
 */

const CURVA_DE_LA_CASA: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]
const FUNDIDO: Transition = { duration: 0.6, ease: CURVA_DE_LA_CASA }
/** Dos pantallas: la caja anclada se queda pegada una pantalla de scroll, lo que frena la inercia de la entrada (como `--alto-del-precio`). */
const ESTILO_DE_LA_SECCION_ALTA: EstiloConVariables = { '--alto-de-las-historias': '200svh' }

function suscribirseAlAncho(alCambiar: () => void): () => void {
  const mql = window.matchMedia(CONSULTA_DEBAJO_DE_768)
  mql.addEventListener('change', alCambiar)
  return () => mql.removeEventListener('change', alCambiar)
}
const debajoDe768Ahora = (): boolean => window.matchMedia(CONSULTA_DEBAJO_DE_768).matches
const enElServidor = (): boolean => false

/** Lo que pinta cada paso de las historias: la misma pantalla que la lista quieta. */
export const pantallaDelPaso = (paso: PasoDelPrecio): ReactNode => <PantallaDelPaso paso={paso} />

export function PrecioEnHistorias({
  pasos,
  encabezado,
  children,
}: {
  readonly pasos: readonly PasoDelPrecio[]
  readonly encabezado: ReactNode
  /** La lista quieta, renderizada en el servidor. */
  readonly children: ReactNode
}): React.JSX.Element {
  const debajoDe768 = useSyncExternalStore(suscribirseAlAncho, debajoDe768Ahora, enElServidor)
  const reducido = useMovimientoReducido()
  const raiz = useRef<HTMLDivElement>(null)
  const alta = useRef<HTMLDivElement>(null)
  const [pegada, setPegada] = useState(false)
  const conHistorias = debajoDe768 && !reducido

  useEffect(() => {
    const el = alta.current
    if (!conHistorias || el === null) return undefined
    let cuadro = 0
    const medir = (): void => {
      cuadro = 0
      setPegada(cajaPegada(el.getBoundingClientRect(), window.innerHeight))
    }
    const pedir = (): void => {
      if (cuadro === 0) cuadro = requestAnimationFrame(medir)
    }
    pedir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      cancelAnimationFrame(cuadro)
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
    }
  }, [conHistorias])

  const salir = useCallback((hacia: SalidaDeLasHistorias): void => {
    const r = raiz.current
    const a = alta.current
    if (r === null || a === null) return
    const y = window.scrollY
    const top = destinoDeLaSalida(hacia, { titulo: r.getBoundingClientRect().top + y, finDeLaAlta: a.getBoundingClientRect().bottom + y })
    window.scrollTo({ top, behavior: 'smooth' })
  }, [])

  const montadas = montarLasHistorias({ debajoDe768, reducido, pegada })
  return (
    <div ref={raiz} className="flex flex-col gap-8 pt-12">
      {encabezado}
      <div ref={alta} data-pieza="precio-en-historias" className="relative motion-safe:h-[var(--alto-de-las-historias)]" style={ESTILO_DE_LA_SECCION_ALTA}>
        <div className="relative motion-safe:sticky motion-safe:top-0 motion-safe:h-svh motion-safe:overflow-clip">
          {/* La lista quieta queda debajo: con las historias encima, fuera del foco y del lector. */}
          <div inert={montadas} className="motion-safe:absolute motion-safe:inset-0">
            {children}
          </div>
          <AnimatePresence mode="wait">
            {montadas ? (
              <motion.div key="historias" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: FUNDIDO }} exit={{ opacity: 0, transition: FUNDIDO }}>
                <Historias items={pasos} renderItem={pantallaDelPaso} alSalir={salir} etiqueta={ETIQUETA_DE_LAS_HISTORIAS} rotulos={ROTULOS_DE_LAS_HISTORIAS} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
