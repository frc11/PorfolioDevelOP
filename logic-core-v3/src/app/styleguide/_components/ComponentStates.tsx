import {
  ChapterLabel,
  CtaButton,
  DataStat,
  DisplayHeading,
  Eyebrow,
  Lead,
  MonoLabel,
  RuleDivider,
  Surface,
} from '@/components/design-system'
import { SgLabel } from './SgBlock'

function Specimen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <span className="font-ds-mono text-[0.7rem] uppercase tracking-[0.14em] text-ds-fg-muted">
        {label}
      </span>
      {children}
    </div>
  )
}

/**
 * Matriz de estados del CTA.
 *
 * `hover`, `active` y `focus-visible` son pseudo-clases: no se pueden mostrar
 * estáticas. Van dos veces:
 *
 * - **Vivos**: el componente real. Pasar el mouse, apretar y tabular hace lo suyo.
 * - **Forzados**: el MISMO componente con la única declaración que aporta cada
 *   estado, aplicada sin la pseudo-clase y con `!` para que gane. No es un
 *   dibujo aparte — es el botón de verdad con el estado clavado, así que los dos
 *   no pueden divergir.
 */
function CtaMatrix({ tone }: { tone: 'primary' | 'secondary' }) {
  const forcedHover = tone === 'primary' ? 'opacity-90!' : 'border-ds-fg!'
  const forcedActive = tone === 'primary' ? 'translate-y-[2px]! shadow-none!' : 'translate-y-[1px]!'

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SgLabel>Vivos — interactuar para verlos</SgLabel>
        <div className="flex flex-wrap items-center gap-6">
          <Specimen label="normal / hover / active / focus">
            <CtaButton tone={tone}>Escribinos por WhatsApp</CtaButton>
          </Specimen>
          <Specimen label="sin flecha">
            <CtaButton tone={tone} withArrow={false}>
              Ver el caso completo
            </CtaButton>
          </Specimen>
          <Specimen label="disabled">
            <CtaButton tone={tone} disabled>
              Escribinos por WhatsApp
            </CtaButton>
          </Specimen>
          <Specimen label="loading">
            <CtaButton tone={tone} loading>
              Enviando
            </CtaButton>
          </Specimen>
        </div>
      </div>

      <div>
        <SgLabel>Forzados — el mismo botón con el estado clavado</SgLabel>
        <div className="flex flex-wrap items-center gap-6">
          <Specimen label="normal">
            <CtaButton tone={tone}>Escribinos por WhatsApp</CtaButton>
          </Specimen>
          <Specimen label="hover">
            <CtaButton tone={tone} className={forcedHover}>
              Escribinos por WhatsApp
            </CtaButton>
          </Specimen>
          <Specimen label="active (hundido)">
            <CtaButton tone={tone} className={forcedActive}>
              Escribinos por WhatsApp
            </CtaButton>
          </Specimen>
          <Specimen label="focus-visible">
            <CtaButton
              tone={tone}
              className="outline-2! outline-offset-2! outline-ds-fg!"
            >
              Escribinos por WhatsApp
            </CtaButton>
          </Specimen>
        </div>
      </div>
    </div>
  )
}

export function ComponentStates() {
  return (
    <div className="flex flex-col gap-16">
      {/* ── CtaButton ────────────────────────────────────────────────────── */}
      <div>
        <SgLabel>CtaButton — primario</SgLabel>
        <p className="mb-6 max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
          Inversión monocroma, canto superior iluminado, sombra corta de dos capas y radio de
          control. Sin scale en hover y sin letterSpacing animado. Al apretarlo baja 2px y además
          escala 0.97 — las dos cosas a la vez, porque Tailwind usa la propiedad{' '}
          <code className="font-ds-mono">translate</code> y Framer Motion usa{' '}
          <code className="font-ds-mono">transform</code>.
        </p>
        <CtaMatrix tone="primary" />
      </div>

      <div>
        <SgLabel>CtaButton — secundario</SgLabel>
        <p className="mb-6 max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
          Transparente, borde de 1px, plano. Sin relieve: no compite con el primario.
        </p>
        <CtaMatrix tone="secondary" />
      </div>

      <RuleDivider />

      {/* ── Piezas tipográficas ──────────────────────────────────────────── */}
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <SgLabel>Eyebrow</SgLabel>
          <div className="flex flex-col gap-4">
            <Eyebrow>Ingeniería de software — Tucumán, AR</Eyebrow>
            <Eyebrow accent="web">Con acento — de uso escaso</Eyebrow>
          </div>
        </div>

        <div>
          <SgLabel>ChapterLabel</SgLabel>
          <div className="flex flex-col gap-4">
            <ChapterLabel number="01" title="La prueba" />
            <ChapterLabel number="03" title="Un lunes cualquiera" />
            <ChapterLabel number="01" />
          </div>
        </div>

        <div>
          <SgLabel>MonoLabel</SgLabel>
          <div className="flex flex-col items-start gap-4">
            <MonoLabel>Caso real</MonoLabel>
            <MonoLabel accent="ia" tick>
              Demo conceptual
            </MonoLabel>
            <MonoLabel>15 días</MonoLabel>
          </div>
        </div>

        <div>
          <SgLabel>DataStat</SgLabel>
          <div className="flex flex-wrap gap-10">
            <DataStat value="[PENDIENTE]" label="Sin acento" />
            <DataStat value="[PENDIENTE]" label="Con acento" accent="automation" />
          </div>
        </div>
      </div>

      <div>
        <SgLabel>DisplayHeading — xl y lg</SgLabel>
        <div className="flex flex-col gap-8">
          <DisplayHeading size="xl" as="h2">
            Software de élite, sin la burocracia de agencia.
          </DisplayHeading>
          <DisplayHeading size="lg" as="h2">
            Cuatro frentes. Un sistema.
          </DisplayHeading>
        </div>
      </div>

      <div>
        <SgLabel>Lead — corta a 55ch</SgLabel>
        <Lead>
          Web, agentes de IA y sistemas a medida para negocios que quieren operar en serio. Desde
          Tucumán, para todo el país.
        </Lead>
      </div>

      <div>
        <SgLabel>RuleDivider — 1px con el color de borde del tema</SgLabel>
        <RuleDivider />
      </div>

      {/* ── Surface ──────────────────────────────────────────────────────── */}
      <div>
        <SgLabel>Surface — radio 0, borde 1px, sin relieve ni blur</SgLabel>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
            <Surface key={padding} padding={padding}>
              <p className="text-sm text-ds-fg-muted">
                padding=&quot;{padding}&quot;
              </p>
            </Surface>
          ))}
        </div>
      </div>
    </div>
  )
}
