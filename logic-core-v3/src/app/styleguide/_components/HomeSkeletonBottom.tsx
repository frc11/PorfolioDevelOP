import {
  ChapterLabel,
  CtaButton,
  DisplayHeading,
  Lead,
  MonoLabel,
  RuleDivider,
  SectionShell,
  Subhead,
  Surface,
} from '@/components/design-system'
import { SERVICE_ROWS, ServiceRow } from './ServiceRow'

const PENDIENTE = '[PENDIENTE DE FRANCO]'

/**
 * S5 — Qué hacemos. Tema oscuro.
 *
 * Es la única sección con acentos, y por eso NO puede ser crema: tres de los
 * cuatro no llegan a 3:1 sobre el lienzo claro (cian 2.10, verde 2.19, ámbar
 * 1.86). La alternancia estricta la habría dejado en crema; se resolvió
 * intercambiándola con los contrastes en vez de sacarle el color, que era lo
 * único que distingue una fila de otra.
 */
export function SkeletonServices() {
  return (
    <SectionShell theme="dark" id="home-s5">
      <div className="flex flex-col gap-10">
        <ChapterLabel number="05" />

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
          El acento pinta el nombre del frente y su plazo. Cuatro acentos en la misma vista es la
          única excepción del sistema, y existe porque acá el color es lo que distingue un frente
          del otro — no decoración. Por eso también es la única sección donde el acento necesita
          área: en 36 px² de tick no alcanzaba a identificar nada.
        </p>
      </div>
    </SectionShell>
  )
}

/**
 * S4 — Por qué develOP. Tema crema.
 *
 * Los tres contrastes van con el texto en placeholder: el sprint pide "los 3
 * contrastes agencia/develOP" pero no dice cuáles son, y las bios están
 * explícitamente pendientes. La estructura se muestra; el copy no se inventa.
 *
 * Va cuarta y no quinta: es la sección crema que la alternancia estricta pedía
 * en ese lugar, y —a diferencia de los cuatro frentes— no necesita acento para
 * funcionar, así que es la que puede vivir sobre claro.
 */
export function SkeletonWhy() {
  return (
    <SectionShell theme="light" id="home-s4">
      <div className="flex flex-col gap-10">
        <ChapterLabel number="04" />

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
                  {/*
                    El lado develOP va en el peldaño nuevo (`Subhead`) y el de
                    la agencia queda en cuerpo. No es énfasis inventado: el
                    bloque YA los distinguía por color (`text-ds-fg` contra
                    `text-ds-fg-muted`); lo que faltaba era el escalón de
                    tamaño, porque el contraste saltaba del titular de la
                    sección directo a la mono de 12px.
                  */}
                  <Subhead as="p">
                    {PENDIENTE} — contraste {index}
                  </Subhead>
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

/**
 * S6 — Cierre. Tema crema.
 *
 * Cierra en claro por la alternancia estricta, y eso es deliberado: obliga a
 * resolver el CTA sobre crema, que era un hueco real del sistema — los 22
 * botones del styleguide vivían sobre oscuro y el relieve estaba calculado
 * contra lienzo oscuro. Con `--shadow-ds-control` invertido por tema, el mismo
 * componente se apoya bien en los dos.
 */
export function SkeletonClose() {
  return (
    <SectionShell theme="light" id="home-s6">
      <div className="flex flex-col items-start gap-8">
        <ChapterLabel number="06" />

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
