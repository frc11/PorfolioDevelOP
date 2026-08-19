'use client'

import { motion, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import {
  MOTION_DURATION,
  MOTION_EASE,
  Parallax,
  Reveal,
  useScrollProgress,
  type MotionEaseName,
} from '@/components/design-system/motion'
import { SgLabel } from './SgBlock'

/**
 * Vitrina del sistema de motion (S2-motion, Bloque 4c). Entregable
 * verificable del sprint: acá es donde el humano juzga si la física se
 * siente bien, no en el código. Muestra los tokens del Bloque 2 (curvas,
 * escala de duraciones) y las tres primitivas del Bloque 3 en vivo.
 */
export function MotionBlock() {
  return (
    <div className="flex flex-col gap-16">
      <CurvesShowcase />
      <DurationLadder />
      <RevealAndStaggerShowcase />
      <ParallaxShowcase />
    </div>
  )
}

// ── Curvas ───────────────────────────────────────────────────────────────

const CURVE_NAMES: readonly MotionEaseName[] = ['arrive', 'shift']

const CURVE_COPY: Record<MotionEaseName, { rationale: string }> = {
  arrive: {
    rationale:
      'Todo lo que ENTRA a pantalla: reveals, transición cromática, el intro. Desaceleración pareja y redondeada — la canónica de CLAUDE.md.',
  },
  shift: {
    rationale:
      'Cambios de estado sobre algo que YA está visible: hover, botón, toggle. Simétrica y mecánica — la del resize del dock, reutilizada.',
  },
}

/** Muestrea la forma paramétrica de un cubic-bezier — el path que traza es
 * el mismo que el de "progreso vs. tiempo" independientemente de la
 * velocidad a la que se recorra, así que sirve para dibujar la curva sin
 * tener que invertir la función. */
function sampleCubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  steps = 48,
): Array<[number, number]> {
  const points: Array<[number, number]> = []
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const mt = 1 - t
    const x = 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t
    const y = 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t
    points.push([x, y])
  }
  return points
}

const PLOT_SIZE = 96

function CurvePlot({ curve }: { curve: readonly [number, number, number, number] }) {
  const [x1, y1, x2, y2] = curve
  const points = sampleCubicBezier(x1, y1, x2, y2)
  const path = points
    .map(([x, y]) => `${(x * PLOT_SIZE).toFixed(1)},${(PLOT_SIZE - y * PLOT_SIZE).toFixed(1)}`)
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${PLOT_SIZE} ${PLOT_SIZE}`}
      width={PLOT_SIZE}
      height={PLOT_SIZE}
      className="shrink-0 rounded-ds-surface border border-ds-rule bg-ds-panel"
      role="img"
      aria-label={`Curva cubic-bezier(${curve.join(', ')}) — progreso vertical contra tiempo horizontal`}
    >
      <line
        x1={0}
        y1={PLOT_SIZE}
        x2={PLOT_SIZE}
        y2={0}
        stroke="var(--color-ds-rule)"
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <polyline points={path} fill="none" stroke="var(--color-ds-fg)" strokeWidth={2} />
    </svg>
  )
}

function EaseTrack({
  curve,
  replayKey,
}: {
  curve: readonly [number, number, number, number]
  replayKey: number
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-ds-panel">
      <motion.div
        key={replayKey}
        className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-ds-fg"
        initial={{ left: '0%' }}
        animate={{ left: prefersReducedMotion ? '0%' : 'calc(100% - 12px)' }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: MOTION_DURATION.elemento, ease: curve }
        }
      />
    </div>
  )
}

function CurvesShowcase() {
  const [replayKey, setReplayKey] = useState(0)

  return (
    <div>
      <SgLabel>Curvas — dos, no ocho</SgLabel>
      <p className="mb-6 max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
        El B1 de este sprint relevó 8 curvas distintas conviviendo en el home, ninguna
        tokenizada. Quedan estas dos: <code className="font-ds-mono">arrive</code> para lo que
        entra a pantalla, <code className="font-ds-mono">shift</code> para lo que ya está visible
        y cambia de estado. El punto y el gráfico de cada una animan con la misma duración
        (<code className="font-ds-mono">MOTION_DURATION.elemento</code>, 0.6s) para que la
        diferencia que se vea sea solo la curva.
      </p>

      <button
        type="button"
        onClick={() => setReplayKey((key) => key + 1)}
        className="mb-8 self-start rounded-ds-control border border-ds-control-stroke px-4 py-2 font-ds-mono text-ds-eyebrow uppercase text-ds-fg transition-colors hover:bg-ds-panel"
      >
        Reproducir de nuevo
      </button>

      <div className="grid gap-8 sm:grid-cols-2">
        {CURVE_NAMES.map((name) => (
          <div key={name} className="flex gap-5 rounded-ds-surface border border-ds-rule p-5">
            <CurvePlot curve={MOTION_EASE[name]} />
            <div className="flex flex-1 flex-col gap-3">
              <div>
                <p className="font-ds-mono text-sm text-ds-fg">{name}</p>
                <p className="font-ds-mono text-[0.7rem] text-ds-fg-muted">
                  cubic-bezier({MOTION_EASE[name].join(', ')})
                </p>
              </div>
              <EaseTrack curve={MOTION_EASE[name]} replayKey={replayKey} />
              <p className="text-xs leading-relaxed text-ds-fg-muted">
                {CURVE_COPY[name].rationale}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Escala de duraciones ────────────────────────────────────────────────

const DURATION_ROWS: readonly { scale: keyof typeof MOTION_DURATION; use: string }[] = [
  { scale: 'micro', use: 'Hover, botón — retroalimentación sobre algo ya visible' },
  { scale: 'elemento', use: 'Una card entrando (el default de Reveal)' },
  { scale: 'seccion', use: 'La transición cromática entre secciones' },
  { scale: 'pagina', use: 'Un momento autoral de una sola vez (no aplicado en este sprint)' },
]

function DurationLadder() {
  return (
    <div>
      <SgLabel>Duraciones — cuatro escalas</SgLabel>
      <div className="overflow-hidden rounded-ds-surface border border-ds-rule">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-ds-panel">
              <th className="px-4 py-3 font-ds-mono text-[0.7rem] uppercase text-ds-fg-muted">
                Token
              </th>
              <th className="px-4 py-3 font-ds-mono text-[0.7rem] uppercase text-ds-fg-muted">
                Valor
              </th>
              <th className="px-4 py-3 font-ds-mono text-[0.7rem] uppercase text-ds-fg-muted">
                Uso
              </th>
            </tr>
          </thead>
          <tbody>
            {DURATION_ROWS.map((row) => (
              <tr key={row.scale} className="border-t border-ds-rule">
                <td className="px-4 py-3 font-ds-mono text-ds-fg">MOTION_DURATION.{row.scale}</td>
                <td className="px-4 py-3 font-ds-mono text-ds-fg-muted">
                  {MOTION_DURATION[row.scale]}s
                </td>
                <td className="px-4 py-3 text-ds-fg-muted">{row.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Reveal + stagger ─────────────────────────────────────────────────────

const STAGGER_ITEMS: readonly string[] = ['01', '02', '03', '04', '05', '06', '07', '08']

function RevealAndStaggerShowcase() {
  const [replayKey, setReplayKey] = useState(0)

  return (
    <div>
      <SgLabel>Reveal — entrada y desfase</SgLabel>
      <p className="mb-6 max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
        8 hermanos, índice 0 a 7. El desfase tiene tope en{' '}
        <code className="font-ds-mono">REVEAL_MAX_STAGGER_INDEX</code> (5): del 6to hermano en
        adelante el delay deja de crecer — se nota en que el 06, 07 y 08 aparecen juntos.
      </p>

      <button
        type="button"
        onClick={() => setReplayKey((key) => key + 1)}
        className="mb-8 self-start rounded-ds-control border border-ds-control-stroke px-4 py-2 font-ds-mono text-ds-eyebrow uppercase text-ds-fg transition-colors hover:bg-ds-panel"
      >
        Reproducir de nuevo
      </button>

      <div key={replayKey} className="flex flex-col gap-10">
        <Reveal>
          <div className="max-w-sm rounded-ds-surface border border-ds-rule bg-ds-panel p-6">
            <p className="text-ds-body text-ds-fg">
              Un elemento — 20px, 0.6s, <code className="font-ds-mono">arrive</code>.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STAGGER_ITEMS.map((label, index) => (
            <Reveal key={label} index={index}>
              <div className="rounded-ds-surface border border-ds-rule bg-ds-panel p-4 text-center">
                <span className="font-ds-mono text-sm text-ds-fg">{label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Parallax ──────────────────────────────────────────────────────────────

/**
 * Instrumentación permanente del sistema (S3-hero, Bloque 0): el progreso del
 * hook impreso en vivo. La física del parallax es un diferencial de ~8% de la
 * velocidad de página — imperceptible sin referencia — así que la vitrina no
 * puede depender de "ver el desplazamiento" para saber si `useScrollProgress`
 * entrega valores. Si el número avanza, el hook funciona; se acabó el juicio
 * perceptual. Escribe `textContent` directo al DOM (cero setState por frame).
 */
function ProgressReadout() {
  const boxRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<HTMLSpanElement>(null)
  const progress = useScrollProgress(boxRef)

  useMotionValueEvent(progress, 'change', (latest) => {
    if (valueRef.current) valueRef.current.textContent = latest.toFixed(3)
  })

  useEffect(() => {
    if (valueRef.current) valueRef.current.textContent = progress.get().toFixed(3)
  }, [progress])

  return (
    <div ref={boxRef} className="pointer-events-none absolute inset-0">
      <p className="absolute right-6 top-6 font-ds-mono text-[0.7rem] uppercase text-ds-fg-muted">
        useScrollProgress → <span ref={valueRef} className="text-ds-fg" />
      </p>
    </div>
  )
}

function ParallaxShowcase() {
  return (
    <div>
      <SgLabel>Parallax — intensidad como parámetro</SgLabel>
      <p className="mb-6 max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
        <code className="font-ds-mono">intensityPx</code> acá es 160 — generoso a propósito para
        que el efecto sea inequívoco en la vitrina; un uso real probablemente pida menos
        (&ldquo;sutil&rdquo;). Scrolleá el bloque: la tarjeta se corre respecto de la línea
        central (la referencia fija), y el número de arriba a la derecha es el progreso del
        hook en vivo — si avanza, la primitiva entrega valores.
      </p>

      <div className="relative h-[100vh] overflow-hidden rounded-ds-surface border border-ds-rule bg-ds-panel">
        <p className="absolute left-6 top-6 max-w-[14rem] font-ds-mono text-[0.7rem] uppercase text-ds-fg-muted">
          Scrolleá este bloque
        </p>
        <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-ds-rule" />
        <Parallax intensityPx={160} className="flex h-full items-center justify-center">
          <div className="rounded-ds-surface border border-ds-rule bg-ds-canvas px-10 py-8 text-center">
            <span className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">
              Parallax
            </span>
            <p className="mt-2 text-ds-body text-ds-fg">intensityPx=160</p>
          </div>
        </Parallax>
        <ProgressReadout />
      </div>
    </div>
  )
}
