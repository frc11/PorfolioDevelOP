import { ExternalLink } from 'lucide-react'
import type { DossierStage } from '@prisma/client'
import { Badge } from '@/components/ui'
import type { Brief } from '@/lib/leados/contracts'
import { GUIA_DRAFT, GUIA_DRAFT_PASOS_CONGELADO } from '@/lib/leados/guidance-content'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'
import { BriefResumen } from '../../_components/brief-form'
import { BorradorForm } from './borrador-form'
import { ReabrirConstruccion } from './construccion-ctas'

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

/**
 * Munición: Netlify Drop + los pasos para exportar y publicar el borrador.
 *
 * `congelado` = el rechazo dejó el borrador fijo (RECHAZADA con link publicado).
 * El instructivo por defecto termina en «pegala acá abajo» y ahí abajo, en ese
 * estado, no hay campo: el registro muestra el borrador congelado y el botón de
 * reabrir. La pantalla mentía sobre lo que se puede hacer — el último paso pasa a
 * decir dónde aparece el campo de verdad (`GUIA_DRAFT_PASOS_CONGELADO`). Los
 * otros tres no cambian: publicar en Netlify se hace igual, antes o después.
 */
export function M13Municion({ congelado }: { congelado: boolean }) {
  const pasos = congelado ? GUIA_DRAFT_PASOS_CONGELADO : GUIA_DRAFT.pasos
  return (
    <div className="space-y-4">
      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
        <LineaRicaText linea={GUIA_DRAFT.intro} />
      </p>
      <ToolGuide id="netlifyDrop" />
      <ol className="space-y-1.5 text-xs leading-relaxed text-zinc-400">
        {pasos.map((paso, index) => (
          <li key={paso} className="flex gap-2">
            <span className="font-semibold text-cyan-300/80">{index + 1}.</span>
            {paso}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** El link publicado, como pieza de consulta — el mismo bloque en los dos
 * estados read-only (rechazo y post-envío). */
function LinkDelBorrador({ draftUrl }: { draftUrl: string }) {
  return (
    <a
      href={draftUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-cyan-300 hover:text-cyan-200"
    >
      <ExternalLink size={13} strokeWidth={1.5} className="shrink-0" />
      {draftUrl}
    </a>
  )
}

/** Registro: el form del borrador (captura/verificado) en construcción, la
 * reapertura cuando el rechazo dejó el borrador congelado, o el resumen de
 * consulta con el link cuando el borrador ya quedó fijo (post-envío). */
export function M13Registro({
  leadId,
  stage,
  draftUrl,
}: {
  leadId: string
  stage: DossierStage | null
  draftUrl: string | null
}) {
  // RECHAZADA con borrador publicado: la guía de retrabajo manda ACÁ («volvé a
  // Borrador y re-publicá»), y hasta este sprint la pantalla no tenía un solo
  // control — solo el link viejo y un texto que hablaba en pasado. El motor
  // guarda el link SOLO en CONSTRUCCION (`saveOwnedDraftUrl`), así que mostrar
  // «Cambiar el link» acá sería un botón que rebota: un callejón con un paso
  // más. Lo que falta es lo de antes — reabrir la construcción, la ÚNICA
  // transición legal de vuelta (`LEGAL_TRANSITIONS.RECHAZADA`) y la misma
  // action que ya ofrece la reentrada. Al reabrir, esta pantalla vuelve sola al
  // form editable y la nota de Franco sigue arriba (F2).
  if (stage === 'RECHAZADA' && draftUrl) {
    return (
      <div className="space-y-3">
        <Badge tone="rose" variant="soft">
          Borrador congelado por el rechazo
        </Badge>
        <LinkDelBorrador draftUrl={draftUrl} />
        <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
          Este es el borrador que Franco rechazó. Para publicar uno nuevo y cambiar el link,
          reabrí la construcción — el pedido de arriba te sigue en cada pantalla y el chequeo
          final se vuelve a pasar antes de reenviar.
        </p>
        <ReabrirConstruccion leadId={leadId} />
      </div>
    )
  }
  // Post-construcción (EN_REVISION / APROBADA) con borrador ya publicado: el
  // link quedó fijo — resumen de consulta, sin editar.
  if (stage !== 'CONSTRUCCION' && draftUrl) {
    return (
      <div className="space-y-2">
        <LinkDelBorrador draftUrl={draftUrl} />
        <p className="text-xs leading-relaxed text-zinc-500">
          El borrador ya quedó publicado — desde acá se hizo el chequeo final.
        </p>
      </div>
    )
  }
  // CONSTRUCCION: captura viva (o verificado con opción de cambiar el link).
  return <BorradorForm leadId={leadId} draftUrl={draftUrl} />
}
