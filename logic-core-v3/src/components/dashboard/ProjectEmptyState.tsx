'use client'

import { FolderKanban } from 'lucide-react'
import { EmptyState } from '@/components/ui'

/**
 * Wrapper client del empty "proyecto sin tareas".
 *
 * `EmptyState` (ui/*) es client y su prop `icon` es un `LucideIcon`
 * (ComponentType, se renderiza como `<Icon/>`). Pasar el componente lucide
 * desde el Server Component `page.tsx` no serializa cruzando el boundary
 * Server→Client. Importar el ícono acá, dentro de un módulo client, hace que
 * la función nunca cruce el boundary. `page.tsx` solo renderiza
 * `<ProjectEmptyState/>` (sin props función).
 */
export function ProjectEmptyState() {
  return (
    <EmptyState
      icon={FolderKanban}
      title="develOP está armando tu hoja de ruta"
      description="Cuando el equipo asigne tareas y entregables a tu proyecto, los vas a ver acá. Recibís una notificación al iniciar la actividad."
      cta={{ label: 'Hablar con el equipo', href: '/dashboard/messages?context=proyecto' }}
    />
  )
}
