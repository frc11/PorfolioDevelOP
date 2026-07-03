'use client'

import { AlarmClock } from 'lucide-react'
import { Callout } from '@/components/ui'
import { formatEspera } from '@/lib/leados/revision'
import { useHidratado } from './use-hidratado'

/**
 * Turnaround visible: el lead respondió y está esperando la demo. La condición
 * de diseño del tramo es resolverse en horas, no días. El "hace X" depende del
 * reloj del cliente → se difiere a post-hidratación con `useHidratado`.
 */
export function UrgenciaBanner({ respondioDesde }: { respondioDesde: string | null }) {
  const hidratado = useHidratado()
  if (!respondioDesde) return null
  const espera = hidratado ? formatEspera(new Date(respondioDesde), new Date()) : null
  return (
    <Callout tone="warning" icon={AlarmClock}>
      <span className="font-medium">
        El negocio respondió y está esperando{espera ? ` (última movida ${espera})` : ''}. Este
        tramo se resuelve en horas, no días.
      </span>
    </Callout>
  )
}
