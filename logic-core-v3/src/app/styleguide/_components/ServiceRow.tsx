import { MonoLabel, RuleDivider, type ServiceAccent } from '@/components/design-system'

export interface ServiceRowData {
  /** Nombre del frente, con el copy que ya usa el sitio. */
  name: string
  /** Rol de servicio — define QUÉ fila es, no de qué color se pinta. */
  service: ServiceAccent
  /** Timeline en mono. `[PENDIENTE]` cuando no está definido. */
  timeline: string
}

interface ServiceRowProps extends ServiceRowData {
  /**
   * Token de acento con el que se pinta la fila. Se separa de `service` porque
   * el styleguide muestra las DOS permutaciones: la misma fila se pinta con un
   * token distinto en cada opción, sin duplicar ningún color literal.
   */
  accentToken: ServiceAccent
  last?: boolean
}

/**
 * Fila de servicio de la sección "Cuatro frentes. Un sistema.".
 *
 * El acento aparece una sola vez, en el tick del label. Nada de gradientes ni
 * glows: es la dosis mínima que pide la dirección.
 */
export function ServiceRow({ name, timeline, accentToken, last = false }: ServiceRowProps) {
  return (
    <div>
      <div className="flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <MonoLabel accent={accentToken} tick>
          {name}
        </MonoLabel>
        <span className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">{timeline}</span>
      </div>
      {last ? null : <RuleDivider />}
    </div>
  )
}

/**
 * Los cuatro frentes con el copy que ya vive en `OurServices.tsx` y los
 * timelines que fija el sprint. `[PENDIENTE]` en software a medida: el código
 * dice "entrega por etapas" y el plazo en días no está definido.
 */
export const SERVICE_ROWS: readonly ServiceRowData[] = [
  { name: 'Sitios & landings', service: 'web', timeline: '15 días' },
  { name: 'Inteligencia artificial', service: 'ia', timeline: '7 días' },
  { name: 'Automatización', service: 'automation', timeline: '5 días' },
  { name: 'Software a medida', service: 'software', timeline: '[PENDIENTE]' },
]
