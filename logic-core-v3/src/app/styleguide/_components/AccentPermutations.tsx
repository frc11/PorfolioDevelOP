import {
  DataStat,
  MonoLabel,
  Surface,
  accentBgClass,
  type ServiceAccent,
} from '@/components/design-system'
import { SERVICE_ROWS, ServiceRow } from './ServiceRow'
import { SgLabel } from './SgBlock'

/**
 * Las dos permutaciones son los MISMOS cuatro hex repartidos distinto. En vez de
 * escribir colores literales, cada opción se expresa como "a este servicio le
 * toca el token de aquel otro" — así el styleguide sigue consumiendo los tokens
 * del sistema y no aparece ningún hex hardcodeado.
 *
 * Cyan queda en web development en las dos opciones; los otros tres rotan.
 */
type Permutation = Record<ServiceAccent, ServiceAccent>

const OPTION_A: Permutation = {
  web: 'web',
  ia: 'ia',
  automation: 'automation',
  software: 'software',
}

const OPTION_B: Permutation = {
  web: 'web',
  ia: 'software',
  automation: 'ia',
  software: 'automation',
}

const SERVICE_TITLES: Record<ServiceAccent, string> = {
  web: 'Web development',
  ia: 'Inteligencia artificial',
  automation: 'Automatización',
  software: 'Software a medida',
}

function PermutationColumn({
  title, subtitle, permutation,
}: {
  title: string
  subtitle: string
  permutation: Permutation
}) {
  return (
    <Surface padding="lg" className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-medium text-ds-fg">{title}</h3>
        <p className="text-sm text-ds-fg-muted">{subtitle}</p>
      </header>

      {/* Asignación desnuda: qué color le toca a cada servicio. */}
      <div className="flex flex-col gap-3">
        {SERVICE_ROWS.map((row) => (
          <div key={row.service} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={`size-4 shrink-0 ${accentBgClass[permutation[row.service]]}`}
            />
            <span className="text-sm text-ds-fg">{SERVICE_TITLES[row.service]}</span>
          </div>
        ))}
      </div>

      {/* En uso real 1: MonoLabel con tick. */}
      <div className="flex flex-col gap-3">
        <SgLabel>En un MonoLabel</SgLabel>
        <MonoLabel accent={permutation.ia} tick>
          Demo conceptual
        </MonoLabel>
        <MonoLabel accent={permutation.automation} tick>
          Caso real
        </MonoLabel>
      </div>

      {/* En uso real 2: DataStat acentuado. */}
      <div className="flex flex-col gap-3">
        <SgLabel>En un DataStat</SgLabel>
        <DataStat
          value="[PENDIENTE]"
          label="Métrica del caso"
          accent={permutation.software}
        />
      </div>

      {/* En uso real 3: la fila de servicio. */}
      <div className="flex flex-col">
        <SgLabel>En las filas de servicio</SgLabel>
        {SERVICE_ROWS.map((row, index) => (
          <ServiceRow
            key={row.service}
            {...row}
            accentToken={permutation[row.service]}
            last={index === SERVICE_ROWS.length - 1}
          />
        ))}
      </div>
    </Surface>
  )
}

export function AccentPermutations() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <PermutationColumn
        title="Opción A — la del código"
        subtitle="web = cyan · ia = verde · automation = ámbar · software = violeta"
        permutation={OPTION_A}
      />
      <PermutationColumn
        title="Opción B — la de CLAUDE.md"
        subtitle="web = cyan · ia = violeta · automation = verde · software = ámbar"
        permutation={OPTION_B}
      />
    </div>
  )
}
