'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useThemeSection } from '@/hooks/useThemeObserver';

type AccentKey = 'cyan' | 'blue' | 'violet';

type Quality = {
  id: number;
  label: string;
  desc: string;
  accent: AccentKey;
  pattern: number[];
};

const QUALITIES: Quality[] = [
  {
    id: 1,
    label: 'Tecnologia actual',
    desc: 'Herramientas modernas, decisiones sobrias y una base tecnica preparada para crecer.',
    accent: 'cyan',
    pattern: [1, 2, 6, 7, 12, 13, 18, 19, 23, 24],
  },
  {
    id: 2,
    label: 'Crece con vos',
    desc: 'La estructura acompana el crecimiento sin rehacer todo cuando aparecen nuevas necesidades.',
    accent: 'violet',
    pattern: [0, 4, 5, 9, 10, 14, 18, 20, 21],
  },
  {
    id: 3,
    label: 'Entrega rapida',
    desc: 'Secciones y flujos pensados para mostrar avance real desde el principio.',
    accent: 'cyan',
    pattern: [2, 3, 7, 8, 12, 16, 17, 22, 24],
  },
  {
    id: 4,
    label: 'Facil de usar',
    desc: 'Interacciones claras, jerarquia visual fuerte y menos friccion para el usuario final.',
    accent: 'blue',
    pattern: [1, 5, 6, 11, 12, 13, 17, 18, 23],
  },
  {
    id: 5,
    label: 'Siempre disponibles',
    desc: 'Un proceso visible y una comunicacion que transmite control en cada etapa.',
    accent: 'violet',
    pattern: [0, 1, 2, 8, 12, 16, 20, 21, 22],
  },
  {
    id: 6,
    label: 'Tu info, protegida',
    desc: 'Capas de seguridad, backups y una base que inspira confianza sin volverse pesada.',
    accent: 'blue',
    pattern: [2, 4, 7, 9, 10, 14, 15, 19, 24],
  },
  {
    id: 7,
    label: 'Funciona en cualquier lado',
    desc: 'La experiencia mantiene consistencia en desktop, tablet y mobile.',
    accent: 'cyan',
    pattern: [0, 3, 4, 8, 9, 12, 15, 16, 20],
  },
  {
    id: 8,
    label: 'Con IA incluida',
    desc: 'Automatizacion, agentes y capas inteligentes integradas sin romper la experiencia.',
    accent: 'violet',
    pattern: [1, 4, 5, 6, 12, 18, 19, 23, 24],
  },
];

const ACCENT_STYLES: Record<
  AccentKey,
  { border: string; glow: string; strong: string; soft: string; badge: string }
> = {
  cyan: {
    border: 'rgba(34, 211, 238, 0.28)',
    glow: 'rgba(34, 211, 238, 0.14)',
    strong: 'rgba(34, 211, 238, 0.95)',
    soft: 'rgba(34, 211, 238, 0.18)',
    badge: 'text-cyan-300',
  },
  blue: {
    border: 'rgba(96, 165, 250, 0.28)',
    glow: 'rgba(96, 165, 250, 0.14)',
    strong: 'rgba(96, 165, 250, 0.92)',
    soft: 'rgba(96, 165, 250, 0.18)',
    badge: 'text-sky-300',
  },
  violet: {
    border: 'rgba(167, 139, 250, 0.3)',
    glow: 'rgba(167, 139, 250, 0.14)',
    strong: 'rgba(167, 139, 250, 0.94)',
    soft: 'rgba(167, 139, 250, 0.18)',
    badge: 'text-violet-300',
  },
};

function MatrixOverlay({
  accent,
  pattern,
  hovered,
  size = 5,
  cellSize = 10,
}: {
  accent: AccentKey;
  pattern: number[];
  hovered: boolean;
  size?: number;
  cellSize?: number;
}) {
  const tone = ACCENT_STYLES[accent];

  return (
    <div
      className="pointer-events-none absolute right-5 top-5 grid gap-1"
      style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
      aria-hidden="true"
    >
      {Array.from({ length: size * size }).map((_, index) => {
        const activeIndex = pattern.indexOf(index);
        const isAccentCell = activeIndex !== -1;
        const isLit = hovered && isAccentCell;

        return (
          <span
            key={index}
            className="rounded-[3px] transition-all duration-300 ease-out"
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              opacity: isLit ? 1 : isAccentCell ? 0.34 : 0.11,
              transform: isLit ? 'scale(1)' : 'scale(0.92)',
              backgroundColor: isLit
                ? tone.strong
                : isAccentCell
                  ? tone.soft
                  : 'rgba(255, 255, 255, 0.06)',
              boxShadow: isLit ? `0 0 16px ${tone.glow}` : 'none',
              transitionDelay: isLit ? `${activeIndex * 18}ms` : '0ms',
            }}
          />
        );
      })}
    </div>
  );
}

function FeaturedCard({ quality }: { quality: Quality }) {
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[quality.accent];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      whileHover={shouldReduceMotion ? undefined : { y: -6 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative h-full min-h-[520px] overflow-hidden rounded-[32px] border bg-[linear-gradient(180deg,rgba(16,18,23,0.92)_0%,rgba(8,10,14,0.96)_100%)] p-7 md:p-8"
      style={{
        borderColor: hovered ? tone.border : 'rgba(255,255,255,0.08)',
        boxShadow: hovered ? `0 24px 70px ${tone.glow}` : '0 24px 70px rgba(0,0,0,0.28)',
      }}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 18% 20%, ${tone.glow} 0%, transparent 48%)`,
          }}
        />
      </div>

      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${tone.strong} 50%, transparent 100%)`,
          opacity: hovered ? 1 : 0.32,
        }}
      />

      <MatrixOverlay accent={quality.accent} pattern={quality.pattern} hovered={hovered} size={6} cellSize={10} />

      <div className="relative z-10 flex h-full flex-col justify-between gap-10">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-zinc-300">
            <Sparkles className={`h-3.5 w-3.5 ${tone.badge}`} />
            Why develOP
          </div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Core signal</div>
        </div>

        <div className="max-w-2xl">
          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            Una seccion mas clara, viva y mucho mas liviana.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 md:text-base">
            Dejamos atras el canvas 3D y convertimos esta parte en una grilla de valor. Sigue teniendo
            movimiento, pero ahora el foco esta en la composicion, el hover y la lectura.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {['Next.js', 'IA aplicada', 'Automatizacion', 'Portal B2B'].map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs tracking-wide text-zinc-300"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="grid gap-4 pt-2 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Direccion</div>
            <div className="mt-2 text-sm font-medium text-white">{quality.label}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Sensacion</div>
            <div className="mt-2 text-sm font-medium text-white">Sobria, tecnica y actual</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Interaccion</div>
            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
              Micro grid reactiva
              <ArrowUpRight className={`h-4 w-4 ${tone.badge}`} />
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function QualityCard({ quality, order }: { quality: Quality; order: number }) {
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[quality.accent];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.45, delay: order * 0.04, ease: [0.23, 1, 0.32, 1] }}
      whileHover={shouldReduceMotion ? undefined : { y: -5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative min-h-[240px] overflow-hidden rounded-[28px] border bg-[linear-gradient(180deg,rgba(11,13,18,0.94)_0%,rgba(7,8,12,0.98)_100%)] p-6 sm:min-h-[252px]"
      style={{
        borderColor: hovered ? tone.border : 'rgba(255,255,255,0.08)',
        boxShadow: hovered ? `0 18px 50px ${tone.glow}` : '0 18px 50px rgba(0,0,0,0.22)',
      }}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 85% 15%, ${tone.glow} 0%, transparent 42%)`,
          }}
        />
      </div>

      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${tone.strong} 50%, transparent 100%)`,
          opacity: hovered ? 1 : 0.24,
        }}
      />

      <MatrixOverlay accent={quality.accent} pattern={quality.pattern} hovered={hovered} />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            0{quality.id}
          </div>
          <ShieldCheck className={`h-4 w-4 ${tone.badge}`} />
        </div>

        <div className="pr-16">
          <h3 className="text-xl font-bold tracking-tight text-white md:text-2xl">{quality.label}</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-400">{quality.desc}</p>
        </div>
      </div>
    </motion.article>
  );
}

export function WhyDevelOP() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: false,
    margin: '-20%',
  });

  useThemeSection(isInView, 'dark');

  const [featured, ...cards] = QUALITIES;
  const secondaryCards = cards.slice(0, 4);

  return (
    <section
      ref={ref}
      id="caracteristicas"
      className="relative overflow-hidden bg-[#030712] py-28 md:py-36"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,211,235,0.08),transparent_38%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.08),transparent_34%)]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#030712] via-[#030712]/80 to-transparent backdrop-blur-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent backdrop-blur-sm pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-cyan-300">
            Why develOP
          </div>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">
            Lo tecnico tambien puede sentirse vivo.
          </h2>
          <p className="mt-5 text-sm leading-7 text-zinc-400 md:text-base">
            Esta nueva version baja el ruido visual, mantiene presencia y usa el hover para sumar detalle
            donde importa.
          </p>
        </motion.div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_minmax(0,1fr)]">
          <FeaturedCard quality={featured} />

          <div className="grid gap-4 sm:grid-cols-2 xl:auto-rows-fr">
            {secondaryCards.map((quality, index) => (
              <QualityCard key={quality.id} quality={quality} order={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
