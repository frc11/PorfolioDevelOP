import {
  CtaButton,
  DisplayHeading,
  Lead,
  MonoLabel,
  RuleDivider,
  SectionShell,
  Surface,
} from '@/components/design-system'
import { SERVICE_ROWS, ServiceRow } from './ServiceRow'

const PENDIENTE = '[PENDIENTE DE FRANCO]'

/** S4 — Qué hacemos. Tema oscuro. */
export function SkeletonServices() {
  return (
    <SectionShell theme="dark" id="home-s4">
      <div className="flex flex-col gap-10">
        <DisplayHeading size="lg" as="h2">
          Cuatro frentes. Un sistema.
        </DisplayHeading>

        <div className="flex flex-col">
          <RuleDivider />
          {SERVICE_ROWS.map((row, index) => (
            <ServiceRow
              key={row.service}
              {...row}
              // Permutación A (la del código), que es la que hoy tienen los
              // tokens. Si en el Gate 1 gana la B, se cambian los cuatro hex en
              // globals.css y esta sección no se toca.
              accentToken={row.service}
              last={index === SERVICE_ROWS.length - 1}
            />
          ))}
          <RuleDivider />
        </div>

        <p className="max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
          El acento aparece una vez por fila, en el tick. Cuatro acentos en la misma vista es la
          única excepción del sistema, y existe porque acá el color es lo que distingue un frente
          del otro — no decoración.
        </p>
      </div>
    </SectionShell>
  )
}

/**
 * S5 — Por qué develOP. Tema crema.
 *
 * Los tres contrastes van con el texto en placeholder: el sprint pide "los 3
 * contrastes agencia/develOP" pero no dice cuáles son, y las bios están
 * explícitamente pendientes. La estructura se muestra; el copy no se inventa.
 */
export function SkeletonWhy() {
  return (
    <SectionShell theme="light" id="home-s5">
      <div className="flex flex-col gap-10">
        <DisplayHeading size="lg" as="h2">
          Ingenieros, no intermediarios.
        </DisplayHeading>

        <div className="flex flex-col">
          {[1, 2, 3].map((index) => (
            <div key={index}>
              <div className="grid gap-4 py-7 md:grid-cols-2 md:gap-12">
                <div className="flex flex-col gap-2">
                  <MonoLabel>Una agencia</MonoLabel>
                  <p className="text-ds-body text-ds-fg-muted">
                    {PENDIENTE} — contraste {index}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <MonoLabel>develOP</MonoLabel>
                  <p className="text-ds-body text-ds-fg">
                    {PENDIENTE} — contraste {index}
                  </p>
                </div>
              </div>
              {index === 3 ? null : <RuleDivider />}
            </div>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2].map((index) => (
            <Surface key={index} padding="lg" className="flex flex-col gap-4">
              <div
                className="size-16 border border-ds-rule bg-ds-canvas rounded-ds-surface"
                aria-hidden="true"
              />
              <MonoLabel>Ingeniero {index}</MonoLabel>
              <p className="text-ds-body text-ds-fg-muted">[BIOS PENDIENTES DE FRANCO]</p>
            </Surface>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}

/** S6 — Cierre. Tema oscuro. */
export function SkeletonClose() {
  return (
    <SectionShell theme="dark" id="home-s6">
      <div className="flex flex-col items-start gap-8">
        <DisplayHeading size="lg" as="h2">
          Empecemos por una llamada.
        </DisplayHeading>

        <Lead>
          Te respondemos hoy. Coordinamos una llamada de 30 minutos, directo con un ingeniero.
        </Lead>

        <div className="flex flex-wrap items-center gap-4">
          <CtaButton>Escribinos por WhatsApp</CtaButton>
          <CtaButton tone="secondary" withArrow={false}>
            Ver el caso completo
          </CtaButton>
        </div>
      </div>
    </SectionShell>
  )
}
