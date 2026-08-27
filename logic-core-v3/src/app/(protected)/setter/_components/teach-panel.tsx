import { Fragment } from 'react'
import { Check, Lightbulb, X } from 'lucide-react'
import {
  GUIA_PASOS,
  type EjemploContrastado,
  type GuiaPasoId,
  type LineaRica,
} from '@/lib/leados/guidance-content'

/**
 * Render de una `LineaRica`: texto con fragmentos enfatizados. El resalte es
 * parte del mensaje de enseñanza, por eso vive con el contenido (1.0) y se
 * pinta acá sin volver a meter copy en el componente. Exportado para que los
 * intros y las explicaciones de gate (3.2) reusen el MISMO render — un solo
 * lugar pinta la `LineaRica`, no se duplica el map por componente.
 */
export function LineaRicaText({
  linea,
  emphasisClassName = 'font-semibold text-zinc-200',
}: {
  linea: LineaRica
  /** Clase del fragmento enfatizado — el default sirve para fondos neutros; un
   * contenedor con tono propio (p.ej. el rosa del gate del opener) pasa el suyo. */
  emphasisClassName?: string
}) {
  return (
    <>
      {linea.map((segmento, indice) =>
        typeof segmento === 'string' ? (
          <Fragment key={indice}>{segmento}</Fragment>
        ) : (
          <strong key={indice} className={emphasisClassName}>
            {segmento.enfasis}
          </strong>
        ),
      )}
    </>
  )
}

/** Un par esto-sí / esto-no. Color SEMÁNTICO (verde bien / rosa mal), no decorativo. */
function EjemploContraste({ ejemplo }: { ejemplo: EjemploContrastado }) {
  return (
    <div className="space-y-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {ejemplo.tema}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-emerald-400/20 bg-emerald-500/[0.05] p-2.5">
          <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
            <Check size={12} strokeWidth={1.5} aria-hidden={true} className="shrink-0" />
            Esto sí
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-300">{ejemplo.asiSi}</p>
        </div>
        <div className="rounded-md border border-rose-400/20 bg-rose-500/[0.05] p-2.5">
          <p className="flex items-center gap-1 text-[11px] font-semibold text-rose-300">
            <X size={12} strokeWidth={1.5} aria-hidden={true} className="shrink-0" />
            Esto no
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">{ejemplo.asiNo}</p>
        </div>
      </div>
      {ejemplo.porque && (
        <p className="text-[11px] leading-relaxed text-zinc-500">{ejemplo.porque}</p>
      )}
    </div>
  )
}

/**
 * Panel de enseñanza reutilizable: «¿Por qué importa?» (el porqué del paso) +
 * el contraste «esto sí / esto no», colapsable. Productiza el patrón de ayuda
 * de la ficha (m1) y el colapsable de `ToolGuide`, para las pantallas que hoy
 * no enseñan. Contenido 100% de `guidance-content.ts` (1.0) — no hardcodea
 * texto. Estilo NEUTRAL (disciplina B9: el cyan queda para lo accionable).
 *
 * `collapsible={false}` cuando ya vive dentro de un contenedor plegado (p.ej.
 * el `<details>` de objeciones), para no anidar dos colapsables.
 *
 * Es complemento, no muleta: si una pantalla necesitara muchos de estos para
 * entenderse, el diseño base está mal y hay que arreglar ESE, no tapar con guía.
 */
export function TeachPanel({
  id,
  collapsible = true,
  titulo = '¿Por qué importa?',
}: {
  id: GuiaPasoId
  collapsible?: boolean
  /**
   * Rótulo del panel. El default sirve al uso INLINE (ya vive dentro de un
   * plegable que promete: el bloque de objeciones de m5). Plegado, en cambio, el
   * rótulo es la única promesa que hay: «¿Por qué importa?» dice que adentro hay
   * un porqué, pero no de qué — y un título que no dice qué hay adentro es un
   * plegable que no se abre. Ahí el llamador pasa el suyo.
   */
  titulo?: string
}) {
  const guia = GUIA_PASOS[id]
  // Sin porqué ni ejemplos no hay nada que enseñar — no renderiza un panel vacío.
  if (!guia || (!guia.porque && (!guia.ejemplos || guia.ejemplos.length === 0))) {
    return null
  }

  const cuerpo = (
    <div className="space-y-3.5">
      {guia.porque && (
        <div className="space-y-1.5">
          {guia.porque.map((linea, indice) => (
            <p key={indice} className="text-xs leading-relaxed text-zinc-400">
              <LineaRicaText linea={linea} />
            </p>
          ))}
        </div>
      )}
      {guia.ejemplos && guia.ejemplos.length > 0 && (
        <div className="space-y-2">
          {guia.ejemplos.map((ejemplo) => (
            <EjemploContraste key={ejemplo.tema} ejemplo={ejemplo} />
          ))}
        </div>
      )}
    </div>
  )

  // Inline (no colapsable): ya está dentro de un contenedor plegado.
  if (!collapsible) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
          <Lightbulb size={13} strokeWidth={1.5} aria-hidden={true} className="text-zinc-400" />
          {titulo}
        </p>
        {cuerpo}
      </div>
    )
  }

  return (
    <details className="rounded-xl border border-white/10 bg-white/[0.02]">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-4 py-3 text-xs font-semibold text-zinc-200 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
        <Lightbulb size={13} strokeWidth={1.5} aria-hidden={true} className="text-zinc-400" />
        {titulo}
      </summary>
      <div className="border-t border-white/[0.06] px-4 py-3.5">{cuerpo}</div>
    </details>
  )
}
