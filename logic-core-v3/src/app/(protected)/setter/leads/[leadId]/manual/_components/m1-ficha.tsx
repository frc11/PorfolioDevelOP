import { ExternalLink } from 'lucide-react'
import type { Ficha } from '@/lib/leados/contracts'
import type { CopyBlockLead } from '@/lib/leados/copy-blocks'
import { FichaEjemplo } from '@/app/(protected)/setter/_components/ejemplo-ideal'
import { FichaForm } from '../../_components/ficha-form'
import { FichaStep } from '../../_components/ficha-step'

/**
 * M1 — «Cargá los datos del negocio» (4.2, piloto del patrón del Bloque 4).
 * Este módulo solo LLENA los tres slots del layout-tipo (`PantallaManual`);
 * no trae lógica propia:
 *   - contexto: identidad + links del alta, re-servidos (lo que se observa);
 *   - munición: el ejemplo de ficha bien hecha (misma pieza del wizard);
 *   - registro: `FichaForm` compartido (campos, gate con faltantes, autosave y
 *     guardia — el MISMO camino de escritura del wizard) o, congelada, la vista
 *     solo-lectura que ya renderiza `FichaStep`.
 */

/** Contexto: lo capturado en el alta que esta tarea necesita para observar. */
export function M1Contexto({ lead }: { lead: CopyBlockLead }) {
  const meta = [lead.industry, lead.zone].filter(Boolean).join(' · ')
  const links = [
    { label: 'Instagram', href: lead.instagramUrl },
    { label: 'Web actual', href: lead.currentWebUrl },
    { label: 'Google Maps', href: lead.googleMapsUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href))

  if (!meta && links.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        El alta no trajo links — buscá {lead.businessName} por nombre en Instagram y
        Google Maps.
      </p>
    )
  }

  return (
    <div className="space-y-2.5">
      {meta && <p className="text-sm text-zinc-400">{meta}</p>}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-zinc-200"
            >
              <ExternalLink size={11} strokeWidth={1.5} aria-hidden />
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

/** Munición: la referencia de cómo se ve una ficha bien hecha. */
export function M1Municion() {
  return <FichaEjemplo />
}

/** Registro: el form vivo compartido, o la ficha congelada post-evaluación. */
export function M1Registro({
  leadId,
  lead,
  ficha,
  editable,
}: {
  leadId: string
  lead: CopyBlockLead
  ficha: Ficha | null
  editable: boolean
}) {
  if (!editable) {
    // Congelada: la MISMA vista solo-lectura del wizard (`FichaStep` con
    // `editable={false}` es solo el `<details>` con el bloque de la ficha).
    return <FichaStep leadId={leadId} lead={lead} ficha={ficha} editable={false} />
  }
  return <FichaForm leadId={leadId} ficha={ficha} />
}
