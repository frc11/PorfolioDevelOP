import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import type { DossierStage } from '@prisma/client'
import { Badge } from '@/components/ui'
import type { Brief, SelfCheck } from '@/lib/leados/contracts'
import { rutaManual } from '@/lib/leados/manual'
import { SelfCheckEjemplo } from '@/app/(protected)/setter/_components/ejemplo-ideal'
import { TeachPanel } from '@/app/(protected)/setter/_components/teach-panel'
import { BriefResumen } from '../../_components/brief-form'
import { ChequeoForm } from './chequeo-form'

/**
 * M14 — «Chequeá la demo antes de mandarla» / chequeo final (5.4, tramo Chequeo;
 * retitulada en P9). El gate de Construcción presentado en el manual, con dos
 * correcciones de auditoría:
 *   - contexto: el LINK DEL BORRADOR A LA VISTA dentro de la pantalla (cierra
 *     A-04: los checks se hacen contra la demo publicada, sin salir a buscarla) +
 *     el brief re-servido (referencia para «fiel al brief»);
 *   - munición: cómo chequear bien — el teach del self-check + el ejemplo de uno
 *     terminado (`TeachPanel` / `SelfCheckEjemplo`, las mismas piezas del wizard);
 *   - registro: la grilla de dos niveles y el envío a revisión (`ChequeoForm`,
 *     que reusa listas + puente + actions del wizard; el server es el gate).
 * El chequeo final sigue siendo EL gate de Construcción; las fases de Construcción no
 * gatean. El avance lo da el motor: enviar a revisión transiciona a EN_REVISION.
 */

/** Contexto: el borrador a la vista (A-04) + el brief que pedía qué construir. */
export function M14Contexto({
  draftUrl,
  brief,
}: {
  draftUrl: string | null
  brief: Brief | null
}) {
  return (
    <div className="space-y-3">
      {draftUrl ? (
        <div>
          <p className="text-[11px] font-medium text-zinc-600">
            Tu borrador
          </p>
          <a
            href={draftUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 break-all text-sm font-medium text-cyan-300 hover:text-cyan-200"
          >
            <ExternalLink size={13} strokeWidth={1.5} className="shrink-0" />
            {draftUrl}
          </a>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
            Abrilo en otra pestaña —mejor en incógnito y en tu celular— y chequealo punto por punto
            contra la lista de abajo.
          </p>
        </div>
      ) : (
        <p className="text-xs leading-relaxed text-zinc-500">
          Todavía no hay borrador publicado — el salto a «Borrador» está acá abajo, en el
          registro.
        </p>
      )}
      {brief && brief.secciones.length > 0 && (
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            El brief pedía
          </p>
          <BriefResumen brief={brief} />
        </div>
      )}
    </div>
  )
}

/** Munición: cómo hacer un chequeo honesto + el ejemplo de uno terminado. */
export function M14Municion() {
  return (
    <div className="space-y-4">
      {/* El rótulo dice QUÉ vas a entender adentro, no que adentro hay un porqué:
          «¿Por qué importa?» era el mismo título genérico en cualquier pantalla y
          no prometía nada. El de acá es exactamente lo que dicen sus dos párrafos
          (`GUIA_SELF_CHECK.porque`). Mismo estándar que el ejemplo de abajo, que
          ya lo cumplía: «Ver ejemplo de un chequeo final bien hecho». */}
      <TeachPanel
        id="selfCheck"
        titulo="Por qué marcar en verde sin mirar vuelve como rechazo"
      />
      <SelfCheckEjemplo />
    </div>
  )
}

/** Registro: la grilla interactiva en construcción, o el resumen read-only de lo
 * ya enviado a revisión. */
export function M14Registro({
  leadId,
  stage,
  draftUrl,
  selfCheck,
  brief,
}: {
  leadId: string
  stage: DossierStage | null
  draftUrl: string | null
  selfCheck: SelfCheck | null
  brief: Brief | null
}) {
  // EN_REVISION / APROBADA: el chequeo ya viajó — resumen read-only de lo enviado.
  if (stage !== 'CONSTRUCCION') {
    return (
      <div className="space-y-3">
        <Badge tone="emerald" variant="soft">
          Enviado a revisión
        </Badge>
        {selfCheck && (
          <p className="text-xs leading-relaxed text-zinc-500">
            {selfCheck.itemsDuros.filter((item) => item.ok).length} puntos obligatorios en verde
            {selfCheck.softFlags.length > 0
              ? ` · ${selfCheck.softFlags.length} delator(es) de diseño marcados para Franco`
              : ' · sin delatores de diseño marcados'}
            .
          </p>
        )}
      </div>
    )
  }

  // CONSTRUCCION sin borrador: la guardia del server no habilita m14 acá, pero si
  // se llega, se explica y se ofrece el salto a publicarlo (no un rebote mudo).
  if (!draftUrl) {
    return (
      <div className="space-y-3">
        <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
          Publicá el borrador primero: el chequeo se hace mirando la demo publicada, no el export
          local. Apenas guardes el link, esta pantalla se abre.
        </p>
        <Link
          href={rutaManual(leadId, 'm13')}
          className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-medium text-cyan-200 transition-colors hover:bg-cyan-500/20"
        >
          Ir a publicar el borrador
          <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    )
  }

  return <ChequeoForm leadId={leadId} selfCheck={selfCheck} brief={brief} />
}
