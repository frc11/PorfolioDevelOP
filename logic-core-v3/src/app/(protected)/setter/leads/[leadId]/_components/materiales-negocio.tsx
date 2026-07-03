import { ExternalLink, Images } from 'lucide-react'
import type { Ficha } from '@/lib/leados/contracts'
import type { CopyBlockLead } from '@/lib/leados/copy-blocks'

/**
 * B8A-II: los materiales reales del negocio, a mano en el paso donde se
 * construye (antes vivían sólo en el header del lead y en la ficha colapsada,
 * a un scroll largo). Los links abren el origen para bajar logo y fotos; las
 * reseñas y el tono se leen acá y además viajan en el bloque pegable.
 */
export function MaterialesNegocio({ lead, ficha }: { lead: CopyBlockLead; ficha: Ficha | null }) {
  const assets = [
    { label: 'Instagram', href: lead.instagramUrl },
    { label: 'Google Maps', href: lead.googleMapsUrl },
    { label: 'Web actual', href: lead.currentWebUrl },
  ].filter((a): a is { label: string; href: string } => Boolean(a.href))

  if (assets.length === 0 && !ficha?.resenas && !ficha?.contenidoReal) return null

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-100">
        <Images size={14} strokeWidth={1.5} className="shrink-0 text-zinc-400" />
        Materiales reales del negocio — usalos, nada de placeholders
      </p>

      {assets.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-zinc-500">Bajá el logo y 3–5 fotos del feed de:</p>
          <div className="flex flex-wrap gap-2">
            {assets.map((asset) => (
              <a
                key={asset.label}
                href={asset.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                <ExternalLink size={11} strokeWidth={1.5} />
                {asset.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {ficha?.resenas && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-zinc-400">Reseñas reales (prueba social)</p>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">
            {ficha.resenas}
          </p>
        </div>
      )}

      {ficha?.contenidoReal && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-zinc-400">Contenido y tono</p>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">
            {ficha.contenidoReal}
          </p>
        </div>
      )}
    </div>
  )
}
