'use client'

import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useRef, type CSSProperties, type Dispatch } from 'react'

import { Cta } from '../../../_componentes/chrome/Cta'
import { ErrorDelCampo } from '../../../_componentes/formularios/Campos'
import { BotonDelRecomendador } from './BotonDelRecomendador'
import type { AccionDelRecomendador, EstadoDelRecomendador } from './flujo'
import { ICONOS_DE_LAS_OPCIONES } from './iconos'
import { PREGUNTAS, TEXTOS_DEL_RECOMENDADOR } from './logica'
import { fundidoQueSube } from './movimiento'

/**
 * [C2-51] UNA ETAPA DEL RECOMENDADOR — el diagnóstico por etapas del sitio vivo (`lote1/20`) con la estética del home: papel, tinta,
 * los tokens y la letra del sitio, sin violeta.
 *   · arriba, el indicador 1-2-3 («El problema · La solución · El objetivo»): la raya y el número de cada paso se llenan de tinta;
 *   · la pregunta (`legend` de su grupo) y sus cinco opciones para tocar: tarjetas con su ícono (radios, se eligen también con las
 *     flechas); la elegida se invierte (tinta con letra de papel);
 *   · «Atrás» (desde la segunda) y «Siguiente» (en la última, «Ver mi recomendación»). Sin elegir, «Siguiente» no avanza y avisa
 *     con el error de siempre del sitio (`ErrorDelCampo`).
 * La pregunta cambia con un fundido (`AnimatePresence` en `wait`): la que se va se desvanece y la nueva se levanta. Al cambiar por un
 * gesto, el foco pasa a la opción elegida o a la primera (el lector anuncia la pregunta nueva por su `legend`).
 * Abajo de 1024 (teléfono y tablet), las opciones van a lo ancho, en una columna.
 */

const TARJETA =
  'flex h-full cursor-pointer items-center gap-[var(--spacing-4)] rounded-[var(--radius-fuerte)] border border-borde-fuerte bg-fondo px-[var(--spacing-5)] py-[var(--spacing-4)] text-tinta hover:border-tinta has-checked:border-tinta has-checked:bg-tinta has-checked:text-fondo has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-tinta'

interface Props {
  readonly estado: EstadoDelRecomendador
  readonly despachar: Dispatch<AccionDelRecomendador>
  readonly reducido: boolean
  /**
   * Ya hubo un gesto en el recomendador (no es la carga de la página): la pregunta que se monte toma el foco y entra con su fundido. Antes
   * del primer gesto, sin las props de Motion: el árbol servido no escribe una transformada (s10, con movimiento reducido).
   */
  readonly enfocarAlMontar: boolean
}

export function EtapaDelRecomendador({ estado, despachar, reducido, enfocarAlMontar }: Props): React.JSX.Element {
  const id = useId()
  const idDelError = `${id}-falta`
  const ultima = estado.etapa === PREGUNTAS.length - 1
  const formulario = useRef<HTMLFormElement>(null)

  // Tocó «Siguiente» sin elegir: el foco va a la primera opción (su grupo lleva el aviso en `aria-describedby`).
  useEffect(() => {
    if (estado.falta) formulario.current?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus()
  }, [estado.falta])

  return (
    <form
      ref={formulario}
      noValidate
      data-pieza="etapa-del-recomendador"
      data-etapa={estado.etapa}
      className="flex flex-col gap-[var(--spacing-6)] escritorio:gap-[var(--spacing-8)]"
      onSubmit={(e) => {
        e.preventDefault()
        despachar({ tipo: 'siguiente' })
      }}
    >
      <IndicadorDePasos etapa={estado.etapa} />
      <AnimatePresence mode="wait" initial={false}>
        <PreguntaDeLaEtapa key={estado.etapa} estado={estado} despachar={despachar} reducido={reducido} enfocarAlMontar={enfocarAlMontar} idDelError={idDelError} />
      </AnimatePresence>
      <div className="flex flex-col gap-[var(--spacing-4)]">
        <ErrorDelCampo id={idDelError} texto={estado.falta ? TEXTOS_DEL_RECOMENDADOR.faltaElegir : undefined} />
        <div data-parte="botones-de-la-etapa" className="flex flex-wrap items-center justify-between gap-[var(--spacing-4)]">
          {estado.etapa > 0 ? (
            <BotonDelRecomendador
              parte="atras"
              rotulo={TEXTOS_DEL_RECOMENDADOR.atras}
              alTocar={() => despachar({ tipo: 'atras' })}
            />
          ) : (
            <span aria-hidden="true" />
          )}
          <Cta type="submit" rotulo={ultima ? TEXTOS_DEL_RECOMENDADOR.ver : TEXTOS_DEL_RECOMENDADOR.siguiente} />
        </div>
      </div>
    </form>
  )
}

function PreguntaDeLaEtapa({ estado, despachar, reducido, enfocarAlMontar, idDelError }: Props & { readonly idDelError: string }): React.JSX.Element {
  const id = useId()
  const grupo = useRef<HTMLFieldSetElement>(null)
  const pregunta = PREGUNTAS[estado.etapa] ?? PREGUNTAS[0]
  const elegida = estado.respuestas[estado.etapa] ?? null

  // Montada por un gesto («Siguiente», «Atrás», «Empezar de nuevo»): el foco a la opción elegida o a la primera. Sólo al montar.
  const alMontar = useRef(enfocarAlMontar)
  useEffect(() => {
    if (!alMontar.current) return
    const radios = grupo.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    ;(grupo.current?.querySelector<HTMLInputElement>('input[type="radio"]:checked') ?? radios?.[0])?.focus({ preventScroll: true })
  }, [])

  return (
    <motion.fieldset ref={grupo} data-parte="pregunta" aria-describedby={estado.falta ? idDelError : undefined} className="flex min-w-0 flex-col gap-[var(--spacing-5)]" {...(enfocarAlMontar ? fundidoQueSube(reducido) : {})}>
      <legend className="font-display font-fuerte tracking-display leading-titulo text-fluido-titulo-l mb-[var(--spacing-5)]">{pregunta.texto}</legend>
      <div className="grid grid-cols-1 gap-[var(--spacing-3)] escritorio:grid-cols-3">
        {pregunta.opciones.map((opcion, i) => {
          const Icono = ICONOS_DE_LAS_OPCIONES[estado.etapa]?.[i] ?? Check
          const campo = `${id}-opcion-${String(i)}`
          return (
            // Con `id` y `for`: el nombre accesible sale del rótulo (lo leen los instrumentos de s10), como en los campos del sitio.
            <label key={opcion.texto} htmlFor={campo} data-foco="pastilla" data-pieza="opcion-del-recomendador" className={TARJETA}>
              <input id={campo} type="radio" name={`${id}-respuesta`} value={i} checked={elegida === i} onChange={() => despachar({ tipo: 'responder', opcion: i })} className="sr-only" />
              <Icono aria-hidden="true" strokeWidth={1.5} className="size-6 shrink-0" />
              <span className="font-cuerpo text-fluido-titulo-s leading-texto">{opcion.texto}</span>
            </label>
          )
        })}
      </div>
    </motion.fieldset>
  )
}

/** El indicador 1-2-3: una raya y un número por paso, en tinta los hechos y el de ahora (`aria-current="step"`). */
function IndicadorDePasos({ etapa }: { readonly etapa: number }): React.JSX.Element {
  return (
    <ol data-parte="indicador-de-pasos" className="grid grid-cols-3 gap-[var(--spacing-2)] escritorio:gap-[var(--spacing-4)]">
      {PREGUNTAS.map((p, i) => {
        const hecho = i < etapa
        const ahora = i === etapa
        return (
          <li key={p.paso} aria-current={ahora ? 'step' : undefined} data-estado={hecho ? 'hecho' : ahora ? 'ahora' : 'despues'} className="flex min-w-0 flex-col gap-[var(--spacing-3)]">
            <span aria-hidden="true" className={`h-0.5 w-full rounded-full transition-colors duration-[var(--duracion-media)] ${hecho || ahora ? 'bg-tinta' : 'bg-borde'}`} />
            <span className={`flex items-center gap-[var(--spacing-2)] font-cuerpo text-cuerpo leading-texto font-medio ${hecho || ahora ? 'text-tinta' : 'text-tinta-tenue'}`}>
              {/* El número lo dibuja el CSS (`content`): es decoración del paso, no un dato del contenido (el escáner de cifras lee el texto). */}
              <span
                aria-hidden="true"
                style={{ '--numero-del-paso': `"${String(i + 1)}"` } as CSSProperties}
                className={`grid size-7 shrink-0 place-items-center rounded-full border text-caption transition-colors duration-[var(--duracion-media)] ${ahora ? 'border-tinta bg-tinta text-fondo' : hecho ? 'border-tinta' : 'border-borde-fuerte'} ${hecho ? '' : 'before:content-[var(--numero-del-paso)]'}`}
              >
                {hecho ? <Check aria-hidden="true" strokeWidth={1.5} className="size-4" /> : null}
              </span>
              <span className="truncate">{p.paso}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
