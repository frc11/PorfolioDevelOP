import { ExternalLink } from 'lucide-react'
import { HERRAMIENTAS, HERRAMIENTAS_ORDEN } from '@/lib/leados/herramientas'

/**
 * Panel persistente «Tus herramientas» del rail del setter: accesos directos a
 * las herramientas externas del flujo, presentes en toda la zona /setter. Para
 * que un setter sin bookmarks propios pueda avanzar sin salir a buscar links.
 *
 * Son links EXTERNOS (pestaña nueva), NO rutas de la app: por eso NO usan
 * `triggerTransition` (eso es solo para navegación interna) y no violan el
 * "no se inventan rutas" del rail. El detalle de cada herramienta (qué es / qué
 * esperar) vive en su paso del wizard; acá es solo acceso rápido.
 *
 * Contenido y links salen del registro editable (lib/leados/herramientas.ts).
 */
export function ToolsRail({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Herramientas externas del setter">
      <div className="px-3 pb-2">
        <p className="text-[11px] font-medium tracking-tight text-zinc-500">
          Tus herramientas
        </p>
      </div>

      <ul className="space-y-0.5">
        {HERRAMIENTAS_ORDEN.map((id) => {
          const herramienta = HERRAMIENTAS[id]

          if (!herramienta.url) {
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-zinc-600"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{herramienta.nombre}</span>
                  <span className="block truncate text-[10px] text-zinc-700">
                    {herramienta.dondeSeUsa}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-amber-300/50">
                  pendiente
                </span>
              </li>
            )
          }

          return (
            <li key={id}>
              <a
                href={herramienta.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
                className="group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-100"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{herramienta.nombre}</span>
                  <span className="block truncate text-[10px] text-zinc-600">
                    {herramienta.dondeSeUsa}
                  </span>
                </span>
                <ExternalLink
                  size={13}
                  strokeWidth={1.5}
                  className="shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-300"
                />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
