import { ExternalLink } from 'lucide-react'
import type { DossierStage } from '@prisma/client'
import type { Brief } from '@/lib/leados/contracts'
import { GUIA_DRAFT } from '@/lib/leados/guidance-content'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'
import { BriefResumen } from '../../_components/brief-form'
import { BorradorForm } from './borrador-form'

/**
 * M13 — «Publicá y registrá el link del borrador» (5.4, tramo Borrador del
 * patrón 4.2/5.1/5.2/5.3). Vocabulario 2.x: borrador, no draft. Presentación del
 * manual sobre el MISMO camino de escritura del wizard (misma action/schema
 * `guardarDraftUrl`/`DraftUrlInputSchema`, reusados por `BorradorForm`):
 *   - contexto: el brief re-servido (`BriefResumen`) — lo que la demo tenía que
 *     entregar, como norte de lo que se publica;
 *   - munición: el link a Netlify Drop (`ToolGuide`, fuente `herramientas.ts`) y
 *     los pasos mecánicos (`GUIA_DRAFT.pasos`) — el cómo publicar;
 *   - registro: el form compartido (captura o verificado), o el resumen de
 *     consulta con el link al volver a la pantalla ya completada.
 * El avance no se setea acá: guardar el borrador NO transiciona el stage (sigue en
 * CONSTRUCCION) — habilita M14; la posición se RE-DERIVA sola (el motor).
 */

/** Contexto: el brief re-servido — la demo se publica contra lo que él pedía. */
export function M13Contexto({ brief }: { brief: Brief | null }) {
  if (!brief) {
    // Inalcanzable con la guardia del server (m13 exige CONSTRUCCION, con brief
    // guardado atrás) — vacío honesto por si el dato se pierde entre carga y render.
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        El brief tiene que estar armado antes de publicar el borrador.
      </p>
    )
  }
  return (
    <div className="space-y-2">
      <p className="text-xs leading-relaxed text-zinc-500">
        Esto es lo que la demo tenía que entregar — publicá el borrador de eso.
      </p>
      <BriefResumen brief={brief} />
    </div>
  )
}

/** Munición: Netlify Drop + los pasos para exportar y publicar el borrador. */
export function M13Municion() {
  return (
    <div className="space-y-4">
      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
        <LineaRicaText linea={GUIA_DRAFT.intro} />
      </p>
      <ToolGuide id="netlifyDrop" />
      <ol className="space-y-1.5 text-xs leading-relaxed text-zinc-400">
        {GUIA_DRAFT.pasos.map((paso, index) => (
          <li key={paso} className="flex gap-2">
            <span className="font-semibold text-cyan-300/80">{index + 1}.</span>
            {paso}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Registro: el form del borrador (captura/verificado) en construcción, o el
 * resumen de consulta con el link cuando el borrador ya quedó fijo (post-envío). */
export function M13Registro({
  leadId,
  stage,
  draftUrl,
}: {
  leadId: string
  stage: DossierStage | null
  draftUrl: string | null
}) {
  // Post-construcción (EN_REVISION / APROBADA / RECHAZADA) con borrador ya
  // publicado: el link quedó fijo — resumen de consulta, sin editar.
  if (stage !== 'CONSTRUCCION' && draftUrl) {
    return (
      <div className="space-y-2">
        <a
          href={draftUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-cyan-300 hover:text-cyan-200"
        >
          <ExternalLink size={13} strokeWidth={1.5} className="shrink-0" />
          {draftUrl}
        </a>
        <p className="text-xs leading-relaxed text-zinc-500">
          El borrador ya quedó publicado — desde acá se hizo el chequeo final.
        </p>
      </div>
    )
  }
  // CONSTRUCCION: captura viva (o verificado con opción de cambiar el link).
  return <BorradorForm leadId={leadId} draftUrl={draftUrl} />
}
