'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, type Dispatch } from 'react'

import { cn } from '@/lib/utils'

import { fundidoDelEnvio } from '../../../_lib/formularios/estadoDeEnvio'
import { COLOR_DE_LA_PALABRA, ESTILO_DEL_PINTADO, TituloQueSePintaAlLlegar, usePintadoAlLlegar } from '../escenario/TituloQueSePintaAlLlegar'
import { BotonDelRecomendador } from './BotonDelRecomendador'
import { ContactoDelRecomendador } from './ContactoDelRecomendador'
import type { AccionDelRecomendador } from './flujo'
import { ICONO_DE_LA_SOLUCION } from './iconos'
import { analisis, recomendar, solucion, TEXTOS_DEL_RECOMENDADOR, type IdDeSolucion, type Respuestas } from './logica'
import { fundidoQueSube } from './movimiento'

/**
 * [C2-51] EL RESULTADO, EN EL MISMO LUGAR (no abre el contacto de la barra):
 *   · «¡Listo!…», que se pinta como los títulos grandes (`TituloQueSePintaAlLlegar`, en su renglón que parte);
 *   · el análisis armado con las frases (`analisis`), que se pinta palabra por palabra como si se escribiera (el mismo pintado, más
 *     lento: `PINTADO_DEL_ANALISIS_MS`), y «Elegí la que más te cierre.»;
 *   · las dos tarjetas (A destacada: invertida). [L4] Al elegir una, las dos tarjetas se cambian EN EL MISMO LUGAR por el contacto
 *     precargado (`ContactoDelRecomendador`, con su «Enviar», «Ver la página de…» y «Empezar de nuevo»); después de un envío con éxito
 *     (`volver`) vuelven las tarjetas, sin reiniciar el flujo;
 *   · «Empezar de nuevo» (abajo de las tarjetas).
 */

/** El análisis se pinta en esto (ms): lo bastante lento para leerse como algo que se escribe, lo bastante corto para no esperar. */
export const PINTADO_DEL_ANALISIS_MS = 1800

interface Props {
  readonly respuestas: Respuestas
  readonly elegida: IdDeSolucion | null
  readonly despachar: Dispatch<AccionDelRecomendador>
  readonly reducido: boolean
  readonly idDelTitulo: string
}

export function ResultadoDelRecomendador({ respuestas, elegida, despachar, reducido, idDelTitulo }: Props): React.JSX.Element {
  const rec = recomendar(respuestas)
  const titulo = TEXTOS_DEL_RECOMENDADOR.resultado.split(' ')
  const caja = useRef<HTMLDivElement>(null)
  // Llega por un gesto (Ver mi recomendación): el foco al resultado, que el lector anuncia por su título. Sin mover la página.
  useEffect(() => caja.current?.focus({ preventScroll: true }), [])
  // [L4] Al cambiar entre las soluciones y el contacto (elegir, o volver tras el envío) la tarjeta o el formulario que tenía el foco se
  // desmontan: el foco vuelve al resultado, cuando termina el fundido.
  const cambio = useRef(false)
  useEffect(() => {
    if (!cambio.current) {
      cambio.current = true
      return undefined
    }
    const espera = window.setTimeout(() => caja.current?.focus({ preventScroll: true }), fundidoDelEnvio(reducido) * 1000 + 60)
    return () => window.clearTimeout(espera)
  }, [elegida, reducido])
  return (
    <div ref={caja} tabIndex={-1} role="group" aria-labelledby={idDelTitulo} data-pieza="resultado-del-recomendador" data-a={rec.a} data-b={rec.b} data-elegida={elegida ?? ''} className="flex flex-col gap-[var(--spacing-8)]">
      <div className="@container flex flex-col gap-[var(--spacing-5)]">
        <TituloQueSePintaAlLlegar renglones={[{ palabras: titulo }]} progreso={null} id={idDelTitulo} como="h4" envolver className="text-left text-fluido-titulo-l" />
        <Analisis texto={analisis(respuestas, rec)} />
      </div>
      {/* [L4] Elegir una cambia las dos soluciones por el contacto, en el mismo lugar; después del envío vuelven las soluciones. */}
      <AnimatePresence mode="wait" initial={false}>
        {elegida === null ? (
          <motion.div key="soluciones" data-parte="soluciones" className="flex flex-col gap-[var(--spacing-8)]" {...fundidoQueSube(reducido)}>
            <div className="flex flex-col gap-[var(--spacing-4)]">
              <p className="font-cuerpo text-cuerpo leading-texto font-medio">{TEXTOS_DEL_RECOMENDADOR.elegi}</p>
              <div className="grid grid-cols-1 gap-[var(--spacing-4)] escritorio:grid-cols-2">
                {[rec.a, rec.b].map((id) => (
                  <TarjetaDeSolucion key={id} id={id} destacada={id === rec.a} alElegir={() => despachar({ tipo: 'elegir', solucion: id })} />
                ))}
              </div>
            </div>
            <div className="flex">
              <BotonDelRecomendador parte="empezar-de-nuevo" rotulo={TEXTOS_DEL_RECOMENDADOR.empezarDeNuevo} alTocar={() => despachar({ tipo: 'reiniciar' })} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="contacto" data-parte="contacto-en-su-lugar" {...fundidoQueSube(reducido)}>
            <ContactoDelRecomendador respuestas={respuestas} elegida={elegida} alEnviado={() => despachar({ tipo: 'volver' })} alEmpezar={() => despachar({ tipo: 'reiniciar' })} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** El análisis: sus palabras se pintan de gris a tinta en orden, al quedar a la vista (el pintado de los títulos, más lento). */
function Analisis({ texto }: { readonly texto: string }): React.JSX.Element {
  const parrafo = useRef<HTMLParagraphElement>(null)
  usePintadoAlLlegar(parrafo, null, PINTADO_DEL_ANALISIS_MS)
  const palabras = texto.split(' ')
  return (
    <p ref={parrafo} data-parte="analisis" className="font-cuerpo text-fluido-titulo-s leading-texto max-w-[calc(var(--spacing-20)*10)]" style={ESTILO_DEL_PINTADO}>
      {palabras.map((palabra, i) => (
        <span key={`${String(i)}-${palabra}`}>
          {i > 0 ? ' ' : null}
          <span data-palabra="" className={COLOR_DE_LA_PALABRA}>
            {palabra}
          </span>
        </span>
      ))}
    </p>
  )
}

/** Una solución: su ícono, su nombre y por qué. Es un botón (elegirla); la A va invertida (la destacada). */
function TarjetaDeSolucion({ id, destacada, alElegir }: { readonly id: IdDeSolucion; readonly destacada: boolean; readonly alElegir: () => void }): React.JSX.Element {
  const s = solucion(id)
  const Icono = ICONO_DE_LA_SOLUCION[id]
  return (
    <button
      type="button"
      data-pieza="tarjeta-de-solucion"
      data-solucion={id}
      data-destacada={destacada ? 'si' : 'no'}
      onClick={alElegir}
      className={cn(
        'flex h-full w-full cursor-pointer flex-col items-start gap-[var(--spacing-4)] rounded-[var(--radius-fuerte)] border p-[var(--spacing-6)] text-left transition-colors duration-[var(--duracion-rapida)] escritorio:p-[var(--spacing-8)]',
        destacada ? 'border-tinta bg-tinta text-fondo' : 'border-borde-fuerte bg-fondo text-tinta hover:border-tinta',
      )}
    >
      <span aria-hidden="true" className={cn('grid size-12 shrink-0 place-items-center rounded-full border', destacada ? 'border-fondo/30' : 'border-borde-fuerte')}>
        <Icono aria-hidden="true" strokeWidth={1.5} className="size-6" />
      </span>
      <span className="font-display font-fuerte tracking-display leading-titulo text-fluido-titulo-m">{s.nombre}</span>
      <span className="font-cuerpo text-cuerpo leading-texto">{s.porQue}</span>
    </button>
  )
}
