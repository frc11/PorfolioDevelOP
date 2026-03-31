'use client';

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';
import {
  BarChart3,
  Bot,
  Clock3,
  Cpu,
  Database,
  Layers3,
  LayoutDashboard,
  MessageCircle,
  Settings2,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useThemeSection } from '@/hooks/useThemeObserver';

type AccentKey = 'cyan' | 'slate' | 'emerald' | 'violet';
type VisualKey = 'progress' | 'lock' | 'status' | 'ownership';
type TabMainVisualKey = 'timeline' | 'nodes' | 'ai';
type TabVisualKey =
  | VisualKey
  | 'roi'
  | 'clock'
  | 'layers'
  | 'dashboard'
  | 'agents'
  | 'gear'
  | 'metrics'
  | 'logo';

type TabbedFeature = {
  tag: string;
  signal: string;
  title: string;
  supportTitle: string;
  text: string;
  accent: AccentKey;
  visual: TabMainVisualKey;
};

type TabbedCard = {
  title: string;
  text: string;
  accent: AccentKey;
  visual: TabVisualKey;
};

type TabbedDimension = {
  label: string;
  summary: string;
  feature: TabbedFeature;
  cards: TabbedCard[];
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const TAB_PILL_SPRING = { type: 'spring', stiffness: 340, damping: 30, mass: 0.9 } as const;
const AUTO_ADVANCE_MS = 17_000;
const PROGRESS_TICK_MS = 100;
const SECONDARY_GRID_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.02,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.06,
      staggerDirection: -1,
    },
  },
} as const;
const SECONDARY_CARD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.24, ease: EASE_OUT },
  },
} as const;

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateViewport);
      return () => mediaQuery.removeEventListener('change', updateViewport);
    }

    mediaQuery.addListener(updateViewport);
    return () => mediaQuery.removeListener(updateViewport);
  }, []);

  return isMobile;
}

const TABBED_DIMENSIONS: TabbedDimension[] = [
  {
    label: 'La Anti-Agencia',
    summary:
      'Velocidad real, decisiones directas y un delivery que evita la fricci\u00f3n comercial de una agencia tradicional.',
    feature: {
      tag: 'LA ANTI-AGENCIA',
      signal: 'Velocidad operativa',
      title: 'Software de \u00e9lite. Sin la burocracia de las agencias.',
      supportTitle: 'Ejecuci\u00f3n sin fricci\u00f3n.',
      text:
        'Eliminamos las reuniones in\u00fatiles y los presupuestos inflados. Construimos ecosistemas digitales de alto rendimiento directo al grano, para que empieces a vender en tiempo r\u00e9cord.',
      accent: 'cyan',
      visual: 'timeline',
    },
    cards: [
      {
        title: 'Velocidad Absoluta',
        text: 'Sistemas operativos y webs listas en semanas, no en semestres.',
        accent: 'cyan',
        visual: 'progress',
      },
      {
        title: 'Cero Costos Ocultos',
        text: 'Precios cerrados desde el d\u00eda 1. Sin sorpresas, sin licencias mensuales abusivas.',
        accent: 'slate',
        visual: 'lock',
      },
      {
        title: 'Soporte Directo',
        text: 'Hablas directamente con los ingenieros (nosotros). Cero intermediarios.',
        accent: 'emerald',
        visual: 'status',
      },
      {
        title: 'Propiedad Total',
        text: 'El c\u00f3digo, el dise\u00f1o y los datos son 100% tuyos. No te atamos a nuestras plataformas.',
        accent: 'cyan',
        visual: 'ownership',
      },
    ],
  },
  {
    label: 'Ecosistema Rentable',
    summary:
      'No entregamos una web aislada: dise\u00f1amos una infraestructura que captura, automatiza y convierte como un sistema.',
    feature: {
      tag: 'ECOSISTEMA RENTABLE',
      signal: 'ROI estructural',
      title: 'Tu negocio no necesita una web, necesita un ecosistema.',
      supportTitle: 'Arquitectura orientada a conversi\u00f3n.',
      text:
        'Conectamos adquisici\u00f3n, operaci\u00f3n y conversi\u00f3n para que cada pieza trabaje en cadena. Menos silos, m\u00e1s retorno visible sobre la inversi\u00f3n.',
      accent: 'emerald',
      visual: 'nodes',
    },
    cards: [
      {
        title: 'Retorno de Inversi\u00f3n',
        text: 'Cada m\u00f3dulo est\u00e1 dise\u00f1ado para recuperar inversi\u00f3n con procesos que generan ventas.',
        accent: 'emerald',
        visual: 'roi',
      },
      {
        title: 'Operaci\u00f3n 24/7',
        text: 'El sistema captura leads, responde y ejecuta incluso cuando tu equipo est\u00e1 offline.',
        accent: 'cyan',
        visual: 'clock',
      },
      {
        title: 'Escalabilidad T\u00e9cnica',
        text: 'La arquitectura crece por capas sin rehacer lo que ya funciona ni frenar la operaci\u00f3n.',
        accent: 'violet',
        visual: 'layers',
      },
      {
        title: 'Control Total',
        text: 'Visibilidad en tiempo real sobre funnels, performance y puntos cr\u00edticos desde un mismo tablero.',
        accent: 'cyan',
        visual: 'dashboard',
      },
    ],
  },
  {
    label: 'La Ventaja IA',
    summary:
      'Llevamos IA a procesos comerciales y operativos concretos para ejecutar m\u00e1s r\u00e1pido y decidir con datos vivos.',
    feature: {
      tag: 'LA VENTAJA IA',
      signal: 'Tecnolog\u00eda injusta',
      title: 'Mientras tu competencia usa Excel, nosotros implementamos IA.',
      supportTitle: 'Procesamiento de datos en tiempo real.',
      text:
        'Dise\u00f1amos capas de IA que responden, ordenan, califican y optimizan sin sumar caos. M\u00e1s throughput, menos tareas repetitivas y una ventaja que se siente desde la operaci\u00f3n.',
      accent: 'violet',
      visual: 'ai',
    },
    cards: [
      {
        title: 'Agentes Inteligentes',
        text: 'Bots y asistentes entrenados para responder, clasificar y ejecutar con contexto.',
        accent: 'cyan',
        visual: 'agents',
      },
      {
        title: 'Reducci\u00f3n de Tareas',
        text: 'Quitamos carga repetitiva del equipo para liberar tiempo estrat\u00e9gico y comercial.',
        accent: 'slate',
        visual: 'gear',
      },
      {
        title: 'Decisiones con Data',
        text: 'M\u00e9tricas vivas y se\u00f1ales autom\u00e1ticas para decidir con contexto, no con intuici\u00f3n.',
        accent: 'emerald',
        visual: 'metrics',
      },
      {
        title: 'Vanguardia Tech',
        text: 'Integramos stacks y modelos de frontera antes de que se vuelvan est\u00e1ndar del mercado.',
        accent: 'violet',
        visual: 'logo',
      },
    ],
  },
];

const ACCENT_STYLES: Record<
  AccentKey,
  { border: string; glow: string; soft: string; strong: string; textClass: string }
> = {
  cyan: {
    border: 'rgba(34, 211, 238, 0.28)',
    glow: 'rgba(34, 211, 238, 0.18)',
    soft: 'rgba(34, 211, 238, 0.12)',
    strong: 'rgba(103, 232, 249, 0.98)',
    textClass: 'text-cyan-300',
  },
  slate: {
    border: 'rgba(148, 163, 184, 0.26)',
    glow: 'rgba(148, 163, 184, 0.16)',
    soft: 'rgba(148, 163, 184, 0.12)',
    strong: 'rgba(226, 232, 240, 0.92)',
    textClass: 'text-slate-300',
  },
  emerald: {
    border: 'rgba(74, 222, 128, 0.24)',
    glow: 'rgba(74, 222, 128, 0.16)',
    soft: 'rgba(74, 222, 128, 0.12)',
    strong: 'rgba(134, 239, 172, 0.96)',
    textClass: 'text-emerald-300',
  },
  violet: {
    border: 'rgba(167, 139, 250, 0.24)',
    glow: 'rgba(167, 139, 250, 0.18)',
    soft: 'rgba(167, 139, 250, 0.12)',
    strong: 'rgba(196, 181, 253, 0.98)',
    textClass: 'text-violet-300',
  },
};

function useCardSpotlight(enabled = true) {
  const x = useMotionValue(-320);
  const y = useMotionValue(-320);
  const motionBackground = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, rgba(6,182,212,0.15), transparent 72%)`;

  const handleMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (!enabled) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    if (!enabled) {
      return;
    }
    x.set(-320);
    y.set(-320);
  };

  const background = enabled
    ? motionBackground
    : 'radial-gradient(260px circle at -320px -320px, rgba(6,182,212,0.15), transparent 72%)';

  return { background, handleMouseMove, handleMouseLeave };
}

function AbstractTimeline() {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const shouldSimplify = shouldReduceMotion || isMobile;

  const chaoticPath =
    'M 10 58 L 62 18 L 44 18 L 98 64 L 132 64 L 132 40 L 164 40 L 148 72 L 212 72 L 248 72 L 234 46 L 286 46 L 314 14 L 296 30 L 344 30 L 328 58 L 376 58 L 412 24';
  const directPath = 'M 10 12 L 412 12';

  return (
    <div className="flex min-h-[200px] items-center justify-center md:min-h-[240px]">
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] p-5 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent_45%)]" />
        <div className="relative flex flex-col gap-8 md:gap-10">
          <div>
            <div className="text-[10px] tracking-[0.28em] text-white/40">
              AGENCIAS TRADICIONALES // MESES DE BUROCRACIA
            </div>
            <svg viewBox="0 0 420 84" className="mt-4 h-16 w-full md:h-20" preserveAspectRatio="none" aria-hidden="true">
              <path
                d={chaoticPath}
                fill="none"
                className="stroke-red-500/30"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              <motion.path
                d={chaoticPath}
                fill="none"
                className="stroke-red-500"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeDasharray="72 560"
                animate={shouldReduceMotion ? { strokeDashoffset: 0 } : { strokeDashoffset: [560, 0] }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 10, ease: 'linear', repeat: Infinity }}
              />
            </svg>
          </div>

          <div className="pt-8 md:pt-[40px]">
            <div className="text-[10px] tracking-[0.28em] text-cyan-400">
              develOP // DIRECTO AL OBJETIVO
            </div>
            <svg viewBox="0 0 420 24" className="mt-4 h-8 w-full md:h-10" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="comet-tail-mask" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="white" stopOpacity="0" />
                  <stop offset="72%" stopColor="white" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="white" stopOpacity="1" />
                </linearGradient>
                <filter id="comet-glow">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <mask id="comet-mask">
                  <rect width="420" height="24" fill="black" />
                  <motion.rect
                    y="0"
                    width={shouldSimplify ? 402 : 120}
                    height="24"
                    fill="url(#comet-tail-mask)"
                    initial={{ x: shouldSimplify ? 10 : -110 }}
                    animate={{ x: shouldSimplify ? 10 : [-110, 292] }}
                    transition={{
                      duration: shouldSimplify ? 0.01 : 1.5,
                      ease: shouldSimplify ? 'linear' : 'easeOut',
                      repeat: Infinity,
                      repeatDelay: shouldSimplify ? 0 : 0.22,
                    }}
                  />
                </mask>
              </defs>

              <path
                d={directPath}
                fill="none"
                stroke="rgba(8,145,178,0.4)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d={directPath}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3"
                strokeLinecap="round"
                mask="url(#comet-mask)"
                filter="url(#comet-glow)"
              />

              <motion.circle
                cy="12"
                fill="#22d3ee"
                r={shouldSimplify ? 3 : 5}
                filter="url(#comet-glow)"
                style={{ filter: 'drop-shadow(0 0 20px #22d3ee)' }}
                initial={{ cx: shouldSimplify ? 412 : 10, opacity: 1 }}
                animate={
                  shouldSimplify
                    ? { cx: 412, opacity: 1 }
                    : { cx: [10, 412], opacity: [0.82, 1] }
                }
                transition={{
                  duration: shouldSimplify ? 0.01 : 1.5,
                  ease: shouldSimplify ? 'linear' : 'easeOut',
                  repeat: Infinity,
                  repeatDelay: shouldSimplify ? 0 : 0.22,
                }}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabbedCardIcon({ visual }: { visual: TabVisualKey }) {
  const iconMap: Record<TabVisualKey, LucideIcon> = {
    progress: Zap,
    lock: Shield,
    status: MessageCircle,
    ownership: Database,
    roi: TrendingUp,
    clock: Clock3,
    layers: Layers3,
    dashboard: LayoutDashboard,
    agents: Bot,
    gear: Settings2,
    metrics: BarChart3,
    logo: Cpu,
  };
  const Icon = iconMap[visual];

  return (
    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.03] text-white/70 transition-all duration-300 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 group-hover:shadow-[0_0_24px_rgba(34,211,238,0.18)]">
      <Icon className="h-5 w-5 text-current" />
    </div>
  );
}

function ProgressVisual({ accent, animationKey }: { accent: AccentKey; animationKey: number }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        <span>Entrega</span>
        <span className={tone.textClass}>100%</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-white/8">
        <motion.div
          key={`progress-fill-${animationKey}`}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${tone.soft} 0%, ${tone.strong} 65%, rgba(255,255,255,0.95) 100%)`,
          }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 1, ease: 'easeOut' }}
        />
        {!shouldReduceMotion && (
          <motion.div
            key={`progress-glint-${animationKey}`}
            className="absolute inset-y-0 w-14 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent blur-[1px]"
            initial={{ x: -56 }}
            animate={{ x: 250 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.08 }}
          />
        )}
      </div>
    </div>
  );
}

function LockVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="inline-flex rounded-[22px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <svg viewBox="0 0 92 72" className="h-14 w-20" aria-hidden="true">
        <motion.g
          animate={shouldReduceMotion ? { rotate: 0, x: 0, y: 0 } : { rotate: -18, x: -4, y: -2 }}
          transition={{ duration: 1.15, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: '78% 62%' }}
        >
          <path
            d="M34 30 V21 C34 13.3 39.8 8 46 8 C52.2 8 58 13.3 58 21 V30"
            fill="none"
            stroke={tone.strong}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </motion.g>
        <rect
          x="24"
          y="28"
          width="44"
          height="30"
          rx="12"
          fill="rgba(255,255,255,0.05)"
          stroke={tone.border}
        />
        <circle cx="46" cy="43" r="4" fill={tone.strong} />
        <path d="M46 43 V49" stroke={tone.strong} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function StatusVisual({ accent, animationKey }: { accent: AccentKey; animationKey: number }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-5 w-5 items-center justify-center">
        <span className="absolute h-5 w-5 rounded-full animate-ping" style={{ backgroundColor: tone.soft }} />
        <span
          className="absolute h-5 w-5 rounded-full border"
          style={{ borderColor: tone.border, backgroundColor: 'rgba(9,12,16,0.72)' }}
        />
        <span
          className="relative h-2.5 w-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: tone.strong, boxShadow: `0 0 18px ${tone.glow}` }}
        />
      </span>
      <div className="h-px flex-1 overflow-hidden bg-white/10">
        <motion.div
          key={`status-line-${animationKey}`}
          className="h-full bg-gradient-to-r to-transparent"
          style={{ backgroundImage: `linear-gradient(90deg, ${tone.strong} 0%, transparent 100%)` }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 1, ease: 'easeOut', delay: 0.08 }}
        />
      </div>
    </div>
  );
}

function OwnershipVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="inline-flex rounded-[22px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <svg viewBox="0 0 96 72" className="h-14 w-20" aria-hidden="true">
        <rect
          x="28"
          y="16"
          width="40"
          height="40"
          rx="12"
          fill="rgba(255,255,255,0.04)"
          stroke={tone.border}
        />
        <rect x="35" y="25" width="26" height="5" rx="2.5" fill={tone.strong} opacity="0.9" />
        <rect x="35" y="37" width="26" height="5" rx="2.5" fill={tone.strong} opacity="0.65" />
        <rect x="35" y="49" width="18" height="3" rx="1.5" fill={tone.strong} opacity="0.45" />

        <motion.path
          d="M18 28 L12 36 L18 44"
          fill="none"
          stroke={tone.strong}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={shouldReduceMotion ? { opacity: 0.8 } : { opacity: [0.5, 1, 0.5], x: [0, -1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M78 28 L84 36 L78 44"
          fill="none"
          stroke={tone.strong}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={shouldReduceMotion ? { opacity: 0.8 } : { opacity: [0.5, 1, 0.5], x: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
        />
      </svg>
    </div>
  );
}

function MainNodesVisual() {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const shouldSimplify = shouldReduceMotion || isMobile;
  const countRef = useRef<HTMLDivElement | null>(null);
  const satellites = [
    {
      label: 'WhatsApp AI',
      path: 'M96 78 C 132 94, 164 116, 210 140',
      delay: 0,
      position: 'left-[3%] top-[12%] md:left-[10%] md:top-[14%]',
    },
    {
      label: 'Ads & SEO',
      path: 'M324 80 C 290 94, 256 114, 210 140',
      delay: 0.55,
      position: 'right-[3%] top-[12%] md:right-[10%] md:top-[15%]',
    },
    {
      label: 'CRM Sync',
      path: 'M210 226 C 210 204, 210 176, 210 140',
      delay: 1.1,
      position: 'bottom-[6%] left-1/2 -translate-x-1/2 md:bottom-[8%]',
    },
  ] as const;

  useEffect(() => {
    const node = countRef.current;

    if (!node) {
      return;
    }

    if (shouldSimplify) {
      node.textContent = '+850';
      return;
    }

    node.textContent = '+0';

    const controls = animate(0, 850, {
      duration: 1.4,
      ease: EASE_OUT,
      onUpdate: (value) => {
        node.textContent = `+${Math.round(value)}`;
      },
    });

    return () => controls.stop();
  }, [shouldSimplify]);

  return (
    <div className="flex min-h-[220px] items-center justify-center md:min-h-[260px]">
      <div className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] py-6 md:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <svg
          viewBox="0 0 420 280"
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {satellites.map((satellite) => (
            <g key={satellite.label}>
              <path
                d={satellite.path}
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <motion.path
                d={satellite.path}
                fill="none"
                stroke="rgba(34,211,238,0.92)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="12 26"
                animate={shouldSimplify ? { strokeDashoffset: 0 } : { strokeDashoffset: [44, 0] }}
                transition={{
                  duration: shouldSimplify ? 0.01 : 1.8,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: shouldSimplify ? 0 : satellite.delay,
                }}
                style={{ filter: `drop-shadow(0 0 ${shouldSimplify ? 5 : 8}px rgba(34,211,238,0.34))` }}
              />
            </g>
          ))}
        </svg>

        {satellites.map((satellite) => (
          <motion.div
            key={satellite.label}
            className={`pointer-events-none absolute z-0 rounded-full border border-cyan-500/20 bg-white/[0.03] px-3 py-1.5 text-[9px] tracking-[0.14em] text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_18px_rgba(34,211,238,0.08)] backdrop-blur-md md:px-4 md:py-2 md:text-[10px] md:tracking-[0.16em] ${satellite.position}`}
            animate={shouldSimplify ? { y: 0 } : { y: [-5, 5, -5] }}
            transition={{
              duration: shouldSimplify ? 0.01 : 4.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: shouldSimplify ? 0 : satellite.delay,
            }}
          >
            {satellite.label}
          </motion.div>
        ))}

        <motion.div
          className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-cyan-500/30 bg-[#030305]/80 backdrop-blur-md shadow-[0_0_28px_rgba(6,182,212,0.12)] md:h-32 md:w-32 md:backdrop-blur-xl md:shadow-[0_0_40px_rgba(6,182,212,0.15)]"
          animate={shouldSimplify ? { scale: 1 } : { scale: [1, 1.05, 1] }}
          transition={{ duration: shouldSimplify ? 0.01 : 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="pointer-events-none absolute -inset-1.5 rounded-full border border-cyan-500/20 md:-inset-2"
            animate={shouldSimplify ? { scale: 1, opacity: 0.22 } : { scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: shouldSimplify ? 0.01 : 2.6, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="pointer-events-none absolute -inset-3.5 rounded-full border border-cyan-500/20 md:-inset-5"
            animate={shouldSimplify ? { scale: 1, opacity: 0.14 } : { scale: [1, 1.5], opacity: [0.35, 0] }}
            transition={{ duration: shouldSimplify ? 0.01 : 2.6, repeat: Infinity, ease: 'easeOut', delay: shouldSimplify ? 0 : 1.15 }}
          />
          <div ref={countRef} className="text-2xl font-bold tracking-tighter text-white md:text-3xl">
            +0
          </div>
          <div className="mt-1 text-[9px] tracking-[0.28em] text-cyan-400">LEADS GENERADOS</div>
        </motion.div>
      </div>
    </div>
  );
}

function MainAIVisual() {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const shouldSimplify = shouldReduceMotion || isMobile;
  const inputs = ['Mensaje 3:14 AM', 'Dato Suelto', 'Lead Frío'] as const;
  const outputs = ['✓ Cita Agendada', '✓ CRM Actualizado', '✓ Lead Calificado'] as const;

  return (
    <div className="relative flex min-h-[220px] flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] px-4 py-5 sm:px-6 md:min-h-[250px] md:flex-row md:justify-between md:px-10 md:py-0">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="flex w-full flex-col gap-3 md:w-auto">
        {inputs.map((item, index) => (
          <motion.div
            key={item}
            className="w-fit rounded-sm border border-white/5 bg-white/5 px-3 py-1 text-[10px] text-white/40"
            animate={shouldSimplify ? { x: 0, opacity: 0.5 } : { x: [0, 50], opacity: [0, 1, 0] }}
            transition={{
              duration: shouldSimplify ? 0.01 : 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: shouldSimplify ? 0 : index * 0.45,
            }}
          >
            {item}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="relative z-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-violet-500/40 bg-[#030305]/80 shadow-[0_0_18px_rgba(139,92,246,0.16)] backdrop-blur-md md:h-24 md:w-24 md:shadow-[0_0_30px_rgba(139,92,246,0.2)] md:backdrop-blur-xl"
        animate={shouldSimplify ? { scale: 1 } : { scale: [1, 1.03, 1] }}
        transition={{ duration: shouldSimplify ? 0.01 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] p-px"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(139,92,246,0.8), transparent)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          animate={{ rotate: shouldSimplify ? 0 : 360 }}
          transition={{ duration: shouldSimplify ? 0.01 : 4.5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="pointer-events-none absolute left-0 h-px w-full bg-violet-400/80 shadow-[0_0_8px_#8b5cf6] md:shadow-[0_0_10px_#8b5cf6]"
          animate={shouldSimplify ? { top: '50%', opacity: 0.8 } : { top: ['0%', '100%', '0%'], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: shouldSimplify ? 0.01 : 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          animate={{ rotate: shouldSimplify ? 0 : 180 }}
          transition={{ duration: shouldSimplify ? 0.01 : 8, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-7 w-7 text-violet-300 md:h-8 md:w-8" />
        </motion.div>
      </motion.div>

      <div className="flex w-full flex-col items-end gap-3 md:w-auto">
        {outputs.map((item, index) => (
          <motion.div
            key={item}
            initial={shouldSimplify ? false : { x: -50, opacity: 0 }}
            animate={shouldSimplify ? { x: 0, opacity: 1 } : { x: [-50, 0, 18], opacity: [0, 1, 0] }}
            transition={{
              duration: shouldSimplify ? 0.01 : 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: shouldSimplify ? 0 : 0.35 + index * 0.45,
            }}
            className="w-fit rounded-full border border-cyan-500/50 bg-cyan-900/20 px-4 py-1.5 text-[10px] font-medium text-cyan-300"
          >
            {item}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RoiVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="inline-flex rounded-[22px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <svg viewBox="0 0 112 68" className="h-14 w-24" aria-hidden="true">
        <path d="M8 56 H104 M12 10 V56" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />
        <motion.path
          d="M16 48 C 28 46, 36 34, 50 34 S 78 18, 98 12"
          fill="none"
          stroke={tone.strong}
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.92, ease: EASE_OUT }}
        />
        <motion.circle
          cx="98"
          cy="12"
          r="4.5"
          fill={tone.strong}
          animate={shouldReduceMotion ? { opacity: 1 } : { scale: [1, 1.2, 1], opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

function ClockVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="inline-flex rounded-[22px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <svg viewBox="0 0 84 84" className="h-14 w-14" aria-hidden="true">
        <circle cx="42" cy="42" r="26" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
        <circle cx="42" cy="42" r="2.5" fill={tone.strong} />
        <motion.g
          animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '42px 42px' }}
        >
          <path d="M42 42 L42 24" stroke={tone.strong} strokeWidth="3" strokeLinecap="round" />
        </motion.g>
        <motion.g
          animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '42px 42px' }}
        >
          <path d="M42 42 L56 42" stroke={tone.strong} strokeWidth="2.5" strokeLinecap="round" opacity="0.72" />
        </motion.g>
      </svg>
    </div>
  );
}

function LayersVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="relative h-16 w-24 [perspective:600px]">
      {[0, 1, 2].map((layer) => (
        <motion.div
          key={layer}
          className="absolute left-1/2 h-10 w-16 -translate-x-1/2 rounded-xl border border-white/10 bg-white/[0.04]"
          style={{ top: `${layer * 9}px`, transform: 'rotateX(70deg) skewX(-14deg)' }}
          animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { y: [0, -3, 0], opacity: [0.58, 1, 0.58] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay: layer * 0.12 }}
        >
          <div className="mx-auto mt-2 h-1.5 w-9 rounded-full" style={{ backgroundColor: tone.strong, opacity: 0.9 }} />
        </motion.div>
      ))}
    </div>
  );
}

function DashboardVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="grid w-24 gap-2">
      <div className="grid grid-cols-[1.3fr_0.9fr] gap-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
          <div className="mb-2 h-1.5 w-10 rounded-full" style={{ backgroundColor: tone.strong, opacity: 0.9 }} />
          <div className="flex items-end gap-1">
            {[10, 16, 24].map((height, index) => (
              <motion.div
                key={height}
                className="w-2 rounded-full"
                style={{ backgroundColor: tone.strong }}
                animate={shouldReduceMotion ? { height } : { height: [height - 4, height, height - 2] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.12 }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
          <motion.div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: tone.strong, boxShadow: `0 0 14px ${tone.glow}` }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [0.3, 1, 0.3], scale: [1, 1.18, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-1.5">
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              className="h-2 rounded-full"
              style={{ backgroundColor: tone.strong }}
              animate={shouldReduceMotion ? { opacity: 0.85 } : { opacity: [0.24, 1, 0.24] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut', delay: index * 0.14 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentsVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="relative inline-flex rounded-[22px] border border-white/10 bg-black/20 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <motion.div
        className="absolute inset-0 rounded-[22px] blur-xl"
        style={{ backgroundColor: tone.glow }}
        animate={shouldReduceMotion ? { opacity: 0.28 } : { opacity: [0.18, 0.36, 0.18] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative space-y-2">
        {[44, 30].map((width, index) => (
          <motion.div
            key={width}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2"
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: [0.45, 1, 0.45], filter: ['blur(6px)', 'blur(0px)', 'blur(6px)'], x: [0, 4, 0] }
            }
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.24 }}
          >
            <div className="h-1.5 rounded-full bg-white/55" style={{ width }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GearVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="inline-flex rounded-[22px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <svg viewBox="0 0 84 84" className="h-14 w-14" aria-hidden="true">
        <motion.g
          animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 90 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '42px 42px' }}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <motion.rect
              key={index}
              x="39"
              y="10"
              width="6"
              height="14"
              rx="3"
              fill={tone.strong}
              transform={`rotate(${index * 45} 42 42)`}
              animate={shouldReduceMotion ? { opacity: 0.85 } : { opacity: [1, 0.18, 1] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut', delay: index * 0.08 }}
            />
          ))}
        </motion.g>
        <circle cx="42" cy="42" r="16" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" />
        <circle cx="42" cy="42" r="6" fill={tone.strong} />
      </svg>
    </div>
  );
}

function MetricsVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];
  const itemHeight = 16;

  const renderTicker = (values: string[]) => (
    <div className="h-4 overflow-hidden">
      <motion.div
        animate={shouldReduceMotion ? { y: 0 } : { y: [0, -itemHeight, -itemHeight * 2, 0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {values.map((value) => (
          <div key={value} className={`h-4 text-[13px] font-semibold leading-4 ${tone.textClass}`}>
            {value}
          </div>
        ))}
      </motion.div>
    </div>
  );

  return (
    <div className="grid w-24 gap-2 rounded-[22px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="grid grid-cols-3 gap-2">
        {renderTicker(['42%', '58%', '71%'])}
        {renderTicker(['18m', '12m', '7m'])}
        {renderTicker(['1.4x', '1.9x', '2.3x'])}
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <motion.div
          className="h-1.5 rounded-full"
          style={{ backgroundColor: tone.strong }}
          animate={{ width: ['34%', '62%', '84%', '34%'] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

function LogoPulseVisual() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-16 w-24 items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <motion.div
        className="absolute inset-2 rounded-full blur-2xl"
        style={{
          background:
            'conic-gradient(from 90deg, rgba(34,211,238,0.52), rgba(167,139,250,0.58), rgba(34,211,238,0.52))',
        }}
        animate={shouldReduceMotion ? { rotate: 0, opacity: 0.5 } : { rotate: 360, opacity: [0.35, 0.72, 0.35] }}
        transition={{ duration: 6.4, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="relative rounded-full border border-white/10 bg-[#0b0e12]/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white"
        animate={shouldReduceMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        develOP
      </motion.div>
    </div>
  );
}

function CardVisual({
  visual,
  accent,
  animationKey,
}: {
  visual: VisualKey;
  accent: AccentKey;
  animationKey: number;
}) {
  if (visual === 'progress') {
    return <ProgressVisual accent={accent} animationKey={animationKey} />;
  }

  if (visual === 'lock') {
    return <LockVisual accent={accent} />;
  }

  if (visual === 'status') {
    return <StatusVisual accent={accent} animationKey={animationKey} />;
  }

  return <OwnershipVisual accent={accent} />;
}

function FeaturedCard({ feature }: { feature: TabbedFeature }) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const tone = ACCENT_STYLES[feature.accent];
  const { background, handleMouseMove, handleMouseLeave } = useCardSpotlight(!isMobile);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      whileHover={shouldReduceMotion || isMobile ? undefined : { y: -6 }}
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
      className="group relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-white/[0.05] bg-[#ffffff]/[0.02] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-colors duration-500 hover:border-white/15 sm:p-6 md:min-h-[520px] md:p-8"
    >
      <motion.div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background }} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 18%, rgba(255,255,255,0.08), transparent 30%), radial-gradient(circle at 100% 100%, ${tone.glow}, transparent 40%)`,
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${tone.strong} 50%, transparent 100%)` }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between gap-6 md:gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {feature.tag}
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {feature.signal}
          </div>
        </div>

        <div className="max-w-2xl">
          <h3 className="text-2xl font-semibold tracking-tight text-white/90 md:text-3xl">{feature.supportTitle}</h3>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">{feature.text}</p>
        </div>

        <TabbedFeatureVisual visual={feature.visual} />
      </div>
    </motion.article>
  );
}

function SecondaryCard({ card, activeTab }: { card: TabbedCard; activeTab: number }) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const tone = ACCENT_STYLES[card.accent];
  const { background, handleMouseMove, handleMouseLeave } = useCardSpotlight(!isMobile);

  return (
    <motion.article
      variants={SECONDARY_CARD_VARIANTS}
      whileHover={shouldReduceMotion || isMobile ? undefined : { y: -5 }}
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
      className="group relative min-h-[220px] overflow-hidden rounded-3xl border border-white/[0.05] bg-[#ffffff]/[0.02] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-colors duration-500 hover:border-white/15 sm:min-h-[236px] sm:p-6 md:min-h-[252px]"
    >
      <motion.div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background }} />
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 82% 10%, ${tone.glow} 0%, transparent 42%)` }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${tone.strong} 50%, transparent 100%)` }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 min-h-[56px] md:mb-8">
          <TabbedCardVisual visual={card.visual} accent={card.accent} animationKey={activeTab} />
        </div>

        <div className="mt-auto max-w-[18rem]">
          <TabbedCardIcon visual={card.visual} />
          <h3 className="text-xl font-medium tracking-tight text-white md:text-2xl">{card.title}</h3>
          <p className="mt-3 text-sm leading-6 text-white/50">{card.text}</p>
        </div>
      </div>
    </motion.article>
  );
}

function TabbedCardVisual({
  visual,
  accent,
  animationKey,
}: {
  visual: TabVisualKey;
  accent: AccentKey;
  animationKey: number;
}) {
  if (visual === 'progress' || visual === 'lock' || visual === 'status' || visual === 'ownership') {
    return <CardVisual visual={visual} accent={accent} animationKey={animationKey} />;
  }

  if (visual === 'roi') {
    return <RoiVisual accent={accent} />;
  }

  if (visual === 'clock') {
    return <ClockVisual accent={accent} />;
  }

  if (visual === 'layers') {
    return <LayersVisual accent={accent} />;
  }

  if (visual === 'dashboard') {
    return <DashboardVisual accent={accent} />;
  }

  if (visual === 'agents') {
    return <AgentsVisual accent={accent} />;
  }

  if (visual === 'gear') {
    return <GearVisual accent={accent} />;
  }

  if (visual === 'metrics') {
    return <MetricsVisual accent={accent} />;
  }

  return <LogoPulseVisual />;
}

function TabbedFeatureVisual({ visual }: { visual: TabMainVisualKey }) {
  if (visual === 'timeline') {
    return <AbstractTimeline />;
  }

  if (visual === 'nodes') {
    return <MainNodesVisual />;
  }

  return <MainAIVisual />;
}

export function WhyDevelOP() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: false,
    margin: '-20%',
  });
  const [activeTab, setActiveTab] = useState(0);
  const [cycleProgress, setCycleProgress] = useState(0);
  const activeDimension = TABBED_DIMENSIONS[activeTab];
  const shouldReduceMotion = useReducedMotion();

  useThemeSection(isInView, 'dark');

  useEffect(() => {
    const progressStep = PROGRESS_TICK_MS / AUTO_ADVANCE_MS;
    const intervalId = window.setInterval(() => {
      setCycleProgress((current) => {
        const next = current + progressStep;

        if (next >= 1) {
          setActiveTab((previous) => (previous + 1) % TABBED_DIMENSIONS.length);
          return 0;
        }

        return next;
      });
    }, PROGRESS_TICK_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setCycleProgress(0);
  };

  return (
    <section ref={ref} id="caracteristicas" className="relative overflow-hidden bg-[#030712] py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_30%)]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="pointer-events-none absolute top-0 left-0 h-24 w-full bg-gradient-to-b from-[#030712] via-[#030712]/80 to-transparent backdrop-blur-xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent backdrop-blur-sm" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-cyan-300">
            Why develOP
          </div>
          <div className="mt-5 min-h-[7.5rem] overflow-hidden md:min-h-[9rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={activeDimension.feature.title}
                initial={{ y: '110%', opacity: 0, filter: 'blur(16px)' }}
                animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: '-24%', opacity: 0, filter: 'blur(12px)' }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.65, ease: EASE_OUT }}
                className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-5xl font-black leading-[1.1] tracking-tighter text-transparent md:text-6xl"
              >
                {activeDimension.feature.title}
              </motion.h2>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={activeDimension.summary}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="mt-5 text-sm leading-7 text-zinc-300 md:text-base"
            >
              {activeDimension.summary}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <div className="mb-10">
          <div className="w-full overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            className="mx-auto inline-flex min-w-max items-center gap-2 whitespace-nowrap rounded-full border border-white/5 bg-white/[0.02] p-1"
            role="tablist"
            aria-label="Dimensiones de Why develOP"
          >
            {TABBED_DIMENSIONS.map((dimension, index) => {
              const isActive = activeTab === index;

              return (
                <button
                  key={dimension.label}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(index)}
                  className="relative shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors duration-300 hover:text-white"
                >
                  {isActive && (
                    <motion.div
                      layoutId="why-tab-pill"
                      className="absolute inset-0 rounded-full bg-white/10"
                      transition={TAB_PILL_SPRING}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-white' : ''}`}>{dimension.label}</span>
                  <span className="absolute inset-x-3 bottom-1.5 h-px overflow-hidden rounded-full bg-cyan-500/10">
                    <motion.span
                      className="block h-full origin-left bg-cyan-500/30"
                      animate={{ scaleX: isActive ? cycleProgress : 0 }}
                      transition={{ ease: 'linear', duration: PROGRESS_TICK_MS / 1000 }}
                      style={{ transformOrigin: 'left center' }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeDimension.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.16fr)_minmax(0,1fr)]"
          >
            <FeaturedCard feature={activeDimension.feature} />

            <motion.div
              variants={SECONDARY_GRID_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-4 sm:grid-cols-2 xl:auto-rows-fr"
            >
              {activeDimension.cards.map((card, index) => (
                <SecondaryCard key={`${activeDimension.label}-${card.title}-${index}`} card={card} activeTab={activeTab} />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
