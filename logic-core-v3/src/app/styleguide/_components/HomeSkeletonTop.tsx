import {
  ChapterLabel,
  CtaButton,
  DataStat,
  DisplayHeading,
  Eyebrow,
  Lead,
  MonoLabel,
  RuleDivider,
  SectionShell,
  Surface,
} from '@/components/design-system'
import { ProductPlate } from './ProductPlate'

const PENDIENTE = '[DATO PENDIENTE DE FRANCO]'

/**
 * Campo del caso real. Estructura sí, dato no: el sprint es explícito en que no
 * se inventa ninguna cifra ni ningún nombre de cliente.
 */
function CaseField({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2 border-t border-ds-rule pt-5">
      <MonoLabel>{label}</MonoLabel>
      <p className="text-ds-body text-ds-fg">{PENDIENTE}</p>
      {hint ? <p className="text-sm text-ds-fg-muted">{hint}</p> : null}
    </div>
  )
}

/** S1 — Hero. Tema oscuro. */
export function SkeletonHero() {
  return (
    <SectionShell theme="dark" id="home-s1">
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <ChapterLabel number="01" />
          <Eyebrow>Ingeniería de software — Tucumán, AR</Eyebrow>
        </div>

        {/*
          En el home real esto es el <h1>. Acá va como h2 porque el <h1> de la
          página es el título del styleguide, y dos h1 en un documento es un olor
          de accesibilidad que no vale la pena introducir en una herramienta.
        */}
        <DisplayHeading size="xl" as="h2">
          Software de élite, sin la burocracia de agencia.
        </DisplayHeading>

        <Lead>
          Web, agentes de IA y sistemas a medida para negocios que quieren operar en serio. Desde
          Tucumán, para todo el país.
        </Lead>

        <div className="flex flex-col items-start gap-4">
          <CtaButton>Escribinos por WhatsApp</CtaButton>
          <p className="max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
            Te respondemos hoy. Coordinamos una llamada de 30 minutos, directo con un ingeniero.
          </p>
        </div>
      </div>
    </SectionShell>
  )
}

/** S2 — La prueba. Tema crema. */
export function SkeletonProof() {
  return (
    <SectionShell theme="light" id="home-s2">
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <ChapterLabel number="02" />
          <MonoLabel>Caso real</MonoLabel>
        </div>

        <DisplayHeading size="lg" as="h2">
          Esto ya funciona.
        </DisplayHeading>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-5">
            <CaseField label="Cliente" />
            <CaseField label="Contexto" />
            <CaseField label="Entregable" />
          </div>

          <Surface padding="lg" className="flex flex-col gap-8">
            <MonoLabel>Resultados</MonoLabel>
            <div className="grid gap-8 sm:grid-cols-2">
              <DataStat value={PENDIENTE} label="Resultado 1" />
              <DataStat value={PENDIENTE} label="Resultado 2" />
            </div>
            <RuleDivider />
            <p className="text-sm leading-relaxed text-ds-fg-muted">
              Ninguna cifra de esta sección está inventada ni estimada. Las cuatro casillas quedan
              con el placeholder a la vista hasta que Franco defina el caso.
            </p>
          </Surface>
        </div>
      </div>
    </SectionShell>
  )
}

/** S3 — La prueba viva. Tema oscuro. Acá vive la lámina de producto. */
export function SkeletonLiveProof() {
  return (
    <SectionShell theme="dark" id="home-s3">
      <div className="flex flex-col gap-10">
        <ChapterLabel number="03" />

        <DisplayHeading size="lg" as="h2">
          Un lunes a la mañana, abrís tu panel.
        </DisplayHeading>

        <ProductPlate />
      </div>
    </SectionShell>
  )
}
