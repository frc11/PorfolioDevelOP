'use client'

import { Bot } from 'lucide-react'

import { PageHeader } from '@/components/ui/PageHeader'

import type { IdDeDemo } from '../../catalogo'
import { useReproduccion } from '../../reproduccion'
import { NOMBRE_DEL_ASISTENTE } from './datos'

/**
 * [NOCTURNO] B · EL ENCABEZADO DEL CHATBOT — el de `app/(protected)/dashboard/chatbot/layout.tsx`: `PageHeader`
 * (IMPORTADO de `components/ui/PageHeader.tsx`) con «Mi Chatbot», el nombre del asistente y su estado; y las pestañas,
 * COPIADAS de `modules/chatbot/components/dashboard/ClientDashboardTabs.tsx` (allá la activa sale de `usePathname` y cada
 * una es un `<Link>` a `/dashboard/chatbot/*`). Acá la activa es la de la demo, y en la demo grande las pestañas que tienen
 * demo cambian a la suya (Leads, Conversaciones, Información); las demás quedan como texto. El indicador de la activa va
 * quieto (el real vuela con un `layoutId`, que con varias demos en la página volaría de una a otra).
 */
export type PestanaDelChatbot = 'overview' | 'leads' | 'conversations' | 'knowledge' | 'settings' | 'install'

const PESTANAS: readonly { readonly id: PestanaDelChatbot; readonly rotulo: string; readonly demo?: IdDeDemo }[] = [
  { id: 'overview', rotulo: 'Overview' },
  { id: 'leads', rotulo: 'Leads', demo: 'leads' },
  { id: 'conversations', rotulo: 'Conversaciones', demo: 'conversaciones' },
  { id: 'knowledge', rotulo: 'Información', demo: 'informacion' },
  { id: 'settings', rotulo: 'Configuración' },
  { id: 'install', rotulo: 'Instalación' },
]

/** Los contactos calientes sin contactar (el punto rosa de la pestaña Leads). */
const CALIENTES_DE_EJEMPLO = 1

export function EncabezadoDelChatbot({ activa, irA }: { readonly activa: PestanaDelChatbot; readonly irA?: (demo: IdDeDemo) => void }): React.JSX.Element {
  const grande = useReproduccion().modo === 'completa'
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Mi Chatbot" title={NOMBRE_DEL_ASISTENTE} description="Activo · respondiendo a tus visitantes" icon={Bot} />
      <div className="relative">
        <nav aria-label="Secciones del chatbot" className="flex gap-1 overflow-x-auto border-b border-zinc-800 [scrollbar-width:none]">
          {PESTANAS.map((p) => {
            const esLaActiva = p.id === activa
            const conPunto = p.id === 'leads' && !esLaActiva
            const rotulo = (
              <span className="inline-flex items-center gap-1.5">
                {p.rotulo}
                {conPunto && (
                  <span className="relative inline-flex h-2 w-2" aria-label={`${String(CALIENTES_DE_EJEMPLO)} contacto caliente sin contactar`}>
                    <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/60 motion-reduce:animate-none" />
                    <span className="relative h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                  </span>
                )}
              </span>
            )
            const clase = `relative whitespace-nowrap px-4 py-2.5 text-sm ${esLaActiva ? 'text-cyan-500' : 'text-zinc-400'}`
            const indicador = esLaActiva && <span aria-hidden="true" className="absolute right-0 bottom-0 left-0 h-0.5 bg-cyan-500" />
            if (grande && irA !== undefined && p.demo !== undefined && !esLaActiva) {
              const destino = p.demo
              return (
                <button key={p.id} type="button" onClick={() => irA(destino)} className={`${clase} cursor-pointer hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-cyan-400`}>
                  {rotulo}
                </button>
              )
            }
            return (
              <span key={p.id} aria-current={esLaActiva ? 'page' : undefined} className={clase}>
                {rotulo}
                {indicador}
              </span>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
