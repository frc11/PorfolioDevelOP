'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

type AdminBackButtonProps = {
  href: string
  label: string
}

// Etiqueta amigable por sección, para cuando el "Volver" apunta a un origen
// distinto del índice fijo (navegación cross-section vía ?from=).
const SECTION_LABELS: Record<string, string> = {
  team: 'Equipo',
  leads: 'leads',
  leados: 'la cola de leads',
  chatbots: 'chatbots',
  clients: 'clientes',
  projects: 'proyectos',
  tickets: 'tickets',
  messages: 'mensajes',
  'audit-log': 'auditoría',
}

function backLabelFor(path: string): string {
  const segment = path.replace(/^\/admin\//, '').split(/[/?#]/)[0] ?? ''
  const name = SECTION_LABELS[segment]
  return name ? `Volver a ${name}` : 'Volver'
}

// El "Volver" es context-aware: si un link que cruza secciones nos trajo acá
// con ?from=<ruta interna>, volvemos a ese origen; si no, al índice fijo (href).
// Solo se aceptan rutas internas del admin (evita open-redirect). Las vistas a
// las que se entra directo (sin ?from=) conservan el comportamiento actual.
export function AdminBackButton({ href, label }: AdminBackButtonProps) {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const hasOrigin = Boolean(from) && from!.startsWith('/admin/')

  const target = hasOrigin ? from! : href
  const text = hasOrigin ? backLabelFor(from!) : label

  return (
    <Link
      href={target}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
    >
      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
      {text}
    </Link>
  )
}
