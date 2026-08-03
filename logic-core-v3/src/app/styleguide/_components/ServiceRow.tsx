import { MonoLabel, RuleDivider, Subhead, type ServiceAccent } from '@/components/design-system'

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
 * Dos correcciones de calibración conviven acá:
 *
 * 1. **El peldaño que faltaba.** El nombre del frente era una mono de 12px, así
 *    que la sección saltaba del titular de 68px directo a la etiqueta más chica
 *    del sistema. Ahora es `Subhead`, el nivel intermedio.
 *
 * 2. **La dosis del acento.** El acento vivía en un tick de 6×6 px — 36 px² por
 *    fila. Con tan poca área, sacarle el color a las cuatro filas casi no
 *    perdía información: un identificador que no identifica. Ahora pinta el
 *    nombre del frente y su plazo, que es superficie plana y sólida. El tick se
 *    fue: con el nombre en color, repetía el mismo dato en 36 px².
 *
 * Sigue sin haber gradiente, glow ni borde lateral de acento — la dosis mínima
 * es de color, no de área.
 */
export function ServiceRow({ name, timeline, accentToken, last = false }: ServiceRowProps) {
  return (
    <div>
      <div className="flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <Subhead accent={accentToken}>{name}</Subhead>
        <MonoLabel accent={accentToken}>{timeline}</MonoLabel>
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
