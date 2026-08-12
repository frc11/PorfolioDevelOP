import { Space_Grotesk } from 'next/font/google'
import { DataStat, Eyebrow, Lead, Surface } from '@/components/design-system'
import { SgLabel } from './SgBlock'

/**
 * Fuente de PRUEBA, cargada solo en esta página.
 *
 * Se declara en este módulo y no en `app/layout.tsx` a propósito: en el App
 * Router `next/font` preloadea por ruta, así que la fuente no toca ninguna otra
 * página del sitio. Si Franco descarta la opción, se borra este archivo y no
 * queda nada colgado.
 *
 * La elección concreta es del ejecutor: el sprint pedía "una grotesca con más
 * carácter" sin nombrar ninguna. Space Grotesk es una grotesca técnica con
 * carácter propio en la `a`, la `g` y la `t`, sobria y sin florituras — que es lo
 * que pide "instrumento de precisión". Cambiarla por otra es un `import` de una
 * línea.
 */
const displayCandidate = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-sg-display',
  display: 'swap',
})

const H1_REAL = 'Software de élite, sin la burocracia de agencia.'
const H2_REAL = 'Cuatro frentes. Un sistema.'
const LEAD_REAL =
  'Web, agentes de IA y sistemas a medida para negocios que quieren operar en serio. Desde Tucumán, para todo el país.'
const BODY_REAL =
  'Te respondemos hoy. Coordinamos una llamada de 30 minutos, directo con un ingeniero.'

function ScaleRow({
  token, meta, children,
}: {
  token: string
  meta: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-ds-rule pt-8">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <code className="font-ds-mono text-[0.7rem] text-ds-fg">{token}</code>
        <span className="font-ds-mono text-[0.7rem] text-ds-fg-muted">{meta}</span>
      </div>
      {children}
    </div>
  )
}

export function TypographyBlock() {
  return (
    <div className={`flex flex-col gap-16 ${displayCandidate.variable}`}>
      {/* ── Aviso: el sitio hoy NO está renderizando Geist ──────────────── */}
      <div className="border border-ds-rule bg-ds-panel p-6 rounded-ds-surface">
        <SgLabel>Leer antes de comparar</SgLabel>
        <p className="max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
          El sitio público <strong className="text-ds-fg">hoy no está renderizando Geist</strong>.
          Las clases <code className="font-ds-mono">font-sans</code> y{' '}
          <code className="font-ds-mono">font-mono</code> apuntan a{' '}
          <code className="font-ds-mono">--font-sans</code>, que se declara en{' '}
          <code className="font-ds-mono">:root</code> leyendo la variable que{' '}
          <code className="font-ds-mono">next/font</code> deja en el{' '}
          <code className="font-ds-mono">&lt;body&gt;</code> — así que no resuelve y todo cae en la
          fuente de la interfaz del sistema operativo. Es pre-existente e idéntico en{' '}
          <code className="font-ds-mono">main</code>, y arreglarlo cambia la tipografía de todas las
          páginas, así que queda fuera de este bloque.
        </p>
        <p className="mt-4 max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
          Los especímenes de abajo sí usan Geist de verdad (el sistema resuelve la familia en un
          scope donde la variable existe). La tercera muestra es lo que ve un visitante hoy.
        </p>
        {/*
          El wrapper repone la familia heredada que tiene el sitio real (la de
          preflight, en el <html>). Hace falta porque `font-sans` resuelve a un
          valor INVÁLIDO, no a vacío: la declaración se descarta y el elemento
          hereda la familia de su ancestro. Sin este reset, el especimen heredaba
          el `font-ds-sans` del styleguide y mostraba Geist — o sea mentía.
        */}
        <div className="mt-6 font-[family-name:ui-sans-serif,system-ui,sans-serif]">
          <p className="font-sans text-ds-display-lg font-medium text-balance text-ds-fg">
            {H1_REAL}
          </p>
        </div>
        <p className="mt-2 font-ds-mono text-[0.7rem] uppercase tracking-[0.14em] text-ds-fg-muted">
          ↑ lo que el sitio renderiza hoy con font-sans
        </p>
      </div>

      {/* ── Las dos opciones de display, lado a lado ───────────────────── */}
      <div>
        <SgLabel>Decisión de Gate 1 — familia del display</SgLabel>
        <p className="mb-6 max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
          El mismo titular, la misma escala y el mismo tracking. Lo único que cambia es la familia.
          Geist es lo que ya está cargado en el sitio; Space Grotesk es la alternativa de prueba y
          solo se carga en esta página.
        </p>
        <div className="grid gap-px overflow-hidden border border-ds-rule rounded-ds-surface lg:grid-cols-2">
          <div className="bg-ds-panel p-6 md:p-8">
            <SgLabel>Opción 1 — Geist (la actual)</SgLabel>
            <p className="font-ds-sans text-ds-display-lg font-medium text-balance text-ds-fg">
              {H1_REAL}
            </p>
            <p className="mt-6 font-ds-sans text-xl text-ds-fg-muted">
              AaBbGgQqRr 0123456789 — ¿áéíóú ñ?
            </p>
          </div>
          <div className="bg-ds-panel p-6 md:p-8">
            <SgLabel>Opción 2 — Space Grotesk (prueba)</SgLabel>
            <p className="font-[family-name:var(--font-sg-display)] text-ds-display-lg font-medium text-balance text-ds-fg">
              {H1_REAL}
            </p>
            <p className="mt-6 font-[family-name:var(--font-sg-display)] text-xl text-ds-fg-muted">
              AaBbGgQqRr 0123456789 — ¿áéíóú ñ?
            </p>
          </div>
        </div>
      </div>

      {/* ── La escala completa, con texto real ──────────────────────────── */}
      <div>
        <SgLabel>La escala completa — con el copy real del home</SgLabel>
        <div className="flex flex-col gap-8">
          <ScaleRow
            token="--text-ds-display-xl"
            meta="clamp(3.25rem, 8vw, 7rem) · lh .98 · tracking −.03em"
          >
            <p className="font-ds-sans text-ds-display-xl font-medium text-balance text-ds-fg">
              {H1_REAL}
            </p>
          </ScaleRow>

          <ScaleRow
            token="--text-ds-display-lg"
            meta="clamp(2.25rem, 5vw, 4.25rem) · lh 1.05 · tracking −.02em"
          >
            <p className="font-ds-sans text-ds-display-lg font-medium text-balance text-ds-fg">
              {H2_REAL}
            </p>
          </ScaleRow>

          <ScaleRow token="--text-ds-lead" meta="clamp(1.125rem, 1.6vw, 1.375rem) · lh 1.55 · máx 55ch">
            <Lead>{LEAD_REAL}</Lead>
          </ScaleRow>

          <ScaleRow token="--text-ds-body" meta="1.0625rem · lh 1.7 · medida de prosa 65ch">
            <p className="max-w-ds-prose text-ds-body text-ds-fg">{BODY_REAL}</p>
          </ScaleRow>

          <ScaleRow token="--text-ds-eyebrow" meta=".75rem · mono · uppercase · tracking .18em">
            <Eyebrow>Ingeniería de software — Tucumán, AR</Eyebrow>
          </ScaleRow>

          <ScaleRow token="--text-ds-data" meta="clamp(2rem, 4vw, 3.5rem) · mono 500 · lh 1">
            <div className="flex flex-wrap items-end gap-12">
              <p className="font-ds-mono text-ds-data tabular-nums text-ds-fg">0123456789</p>
              <DataStat value="[PENDIENTE]" label="Métrica del caso" />
            </div>
          </ScaleRow>

          <ScaleRow token="--text-ds-control" meta="1rem · lh 1 — agregado en S2 para los botones">
            <Surface padding="sm" className="inline-block">
              <span className="text-ds-control text-ds-fg">Escribinos por WhatsApp</span>
            </Surface>
          </ScaleRow>
        </div>
      </div>
    </div>
  )
}
