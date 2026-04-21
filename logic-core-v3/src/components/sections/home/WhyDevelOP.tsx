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
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  Cpu,
  Layers3,
  LayoutDashboard,
  Lock,
  LockOpen,
  MessageCircle,
  Server,
  Settings2,
  Sparkles,
  TrendingUp,
  Zap,
  FileStack,
  Users,
  Stamp,
  Mail,
  Rocket,
  Code2,
  XCircle,
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
const GLASS_CARD_CLASS =
  'rounded-3xl border border-white/[0.05] bg-[#ffffff]/[0.02] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl';

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
      'Velocidad real, decisiones directas y un delivery qué evita la fricci\u00f3n comercial de una agencia tradicional.',
    feature: {
      tag: 'LA ANTI-AGENCIA',
      signal: 'Velocidad operativa',
      title: 'Software de \u00e9lite. Sin la burocracia de las agencias.',
      supportTitle: 'Ejecuci\u00f3n sin fricci\u00f3n.',
      text:
        'develOP opera como un equipo de ingenier\u00eda puro, eliminando burocracia para entregar software de \u00e9lite en tiempo r\u00e9cord.',
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
      'No entregamos una web aislada: dise\u00f1amos una infraestructura qué captura, automatiza y convierte como un sistema.',
    feature: {
      tag: 'ECOSISTEMA RENTABLE',
      signal: 'ROI estructural',
      title: 'Tu negocio no necesita una web, necesita un ecosistema.',
      supportTitle: 'Arquitectura orientada a conversi\u00f3n.',
      text:
        'Conectamos adquisici\u00f3n, operaci\u00f3n y conversi\u00f3n para qué cada pieza trabaje en cadena. Menos silos, m\u00e1s retorno visible sobre la inversi\u00f3n.',
      accent: 'emerald',
      visual: 'nodes',
    },
    cards: [
      {
        title: 'Retorno de Inversi\u00f3n',
        text: 'Cada m\u00f3dulo est\u00e1 dise\u00f1ado para recuperar inversi\u00f3n con procesos qué generan ventas.',
        accent: 'emerald',
        visual: 'roi',
      },
      {
        title: 'Operaci\u00f3n 24/7',
        text: 'El sistema captura leads, responde y ejecuta incluso cuándo tu equipo est\u00e1 offline.',
        accent: 'cyan',
        visual: 'clock',
      },
      {
        title: 'Escalabilidad T\u00e9cnica',
        text: 'La arquitectura crece por capas sin rehacer lo qué ya funciona ni frenar la operaci\u00f3n.',
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
        'Dise\u00f1amos capas de IA qué responden, ordenan, califican y optimizan sin sumar caos. M\u00e1s throughput, menos tareas repetitivas y una ventaja qué se siente desde la operaci\u00f3n.',
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
        text: 'Integramos stacks y modelos de frontera antes de qué se vuelvan est\u00e1ndar del mercado.',
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

function AgencyComparisonVisual() {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const shouldSimplify = shouldReduceMotion || isMobile;

  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-10%' });

  const count76Ref = useRef<HTMLSpanElement>(null);
  const count15Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (shouldSimplify || !isInView) return;

    const c76 = animate(0, 76, {
      duration: 10,
      ease: 'linear',
      onUpdate: (val) => {
        if (count76Ref.current) count76Ref.current.textContent = Math.round(val).toString();
      }
    });

    const c15 = animate(0, 15, {
      duration: 2,
      ease: 'linear',
      onUpdate: (val) => {
        if (count15Ref.current) count15Ref.current.textContent = Math.round(val).toString();
      }
    });

    return () => {
      c76.stop();
      c15.stop();
    };
  }, [shouldSimplify, isInView]);

  const frictionIcons = [
    { Icon: Mail, delay: 2.0, left: '20%', text: 'Ida y Vuelta' },
    { Icon: Users, delay: 4.0, left: '40%', text: 'Reuniones' },
    { Icon: FileStack, delay: 6.0, left: '60%', text: 'Cambios' },
    { Icon: Stamp, delay: 8.0, left: '80%', text: 'Aprobación' },
  ];

  const velocityIcons = [
    { Icon: Code2, delay: 0.6, left: '33%', text: 'Prototipo' },
    { Icon: Rocket, delay: 1.2, left: '66%', text: 'Deploy' },
    { Icon: Zap, delay: 1.8, left: '90%', text: 'Go Live' },
  ];

  return (
    <div ref={containerRef} className="mt-4 w-full rounded-3xl border border-white/[0.04] bg-[#0a0a0c]/80 p-2 backdrop-blur-2xl relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      
      <div className="relative z-10 flex w-full flex-col gap-6 rounded-[24px] border border-white/[0.04] bg-white/[0.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-5">
        
        <div className="relative overflow-hidden rounded-[24px] border border-red-900/30 bg-[radial-gradient(ellipse_at_top_left,rgba(153,27,27,0.15),transparent_70%),linear-gradient(180deg,rgba(10,10,12,0.2),rgba(10,10,12,0.6))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_20px_rgba(220,38,38,0.04)] md:p-6 lg:p-7">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/80">
                <AlertTriangle className="h-4 w-4 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                AGENCIAS TRADICIONALES
              </span>
              <span className="pl-6 text-xs font-semibold tracking-wider text-red-400/50 md:text-sm">
                MESES DE BUROCRACIA
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 whitespace-nowrap pl-6 sm:pl-0">
              <span ref={count76Ref} className="font-mono text-[2.75rem] font-black leading-none tracking-tighter text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] md:text-[3.25rem]">
                {shouldSimplify ? '76' : '0'}
              </span>
              <span className="text-sm font-bold tracking-widest text-red-500/50">DÍAS</span>
            </div>
          </div>

          <div className="relative z-10 h-2 w-full overflow-hidden rounded-full border border-red-900/50 bg-red-950/30">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-red-500 to-red-400 shadow-[0_0_15px_#ef4444,0_0_20px_#dc2626]"
              initial={{ width: shouldSimplify ? '100%' : '0%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: shouldSimplify ? 0.01 : 10, ease: 'linear' }}
            />
          </div>

          <div className="relative mt-2 h-10 w-full px-1">
            {frictionIcons.map((item, i) => (
              <motion.div
                key={i}
                className="absolute flex flex-col items-center gap-1.5"
                style={{ left: item.left }}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: [0, 1, 0], y: [15, 0, -10] }}
                viewport={{ once: true }}
                transition={{
                  duration: 2.5,
                  delay: shouldSimplify ? 0 : item.delay,
                  times: [0, 0.2, 1],
                  ease: 'easeOut',
                }}
              >
                <div className="whitespace-nowrap rounded-md border border-red-500/30 bg-red-950/80 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-red-300 backdrop-blur-md">
                  {item.text}
                </div>
                <item.Icon className="h-4 w-4 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              </motion.div>
            ))}
          </div>

          <div className="relative mt-2 flex flex-wrap gap-2.5">
            {[
              'Procesos R\u00edgidos',
              'Alta Dependencia',
              'Costos Ocultos',
            ].map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: shouldSimplify ? 0 : 0.5 + i * 0.4, ease: 'easeOut' }}
                className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-950/40 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_0_12px_rgba(239,68,68,0.1)] hover:border-red-500/40 transition-colors"
               >
                <XCircle className="h-3.5 w-3.5 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-red-300">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-cyan-700/30 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.15),transparent_70%),linear-gradient(180deg,rgba(10,10,12,0.2),rgba(10,10,12,0.6))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_30px_rgba(34,211,238,0.08)] md:p-6 lg:p-7">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1.5">
              <span className="relative z-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                <Zap className="h-4 w-4 fill-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                develOP
              </span>
              <span className="relative z-10 pl-6 text-xs font-semibold tracking-wider text-cyan-300/60 md:text-sm">
                DIRECTO AL OBJETIVO
              </span>
            </div>
            <div className="relative z-10 flex items-baseline gap-1.5 whitespace-nowrap pl-6 sm:pl-0">
              <span ref={count15Ref} className="font-mono text-[2.75rem] font-black leading-none tracking-tighter text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] md:text-[3.25rem]">
                {shouldSimplify ? '15' : '0'}
              </span>
              <span className="text-sm font-bold tracking-widest text-cyan-400/60">DÍAS</span>
            </div>
          </div>

          <div className="relative z-10 h-2 w-full overflow-hidden rounded-full border border-cyan-900/50 bg-cyan-950/30">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-white shadow-[0_0_20px_#22d3ee,0_0_30px_#fff]"
              initial={{ width: shouldSimplify ? '100%' : '0%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: shouldSimplify ? 0.01 : 2, ease: 'linear' }}
            />
          </div>

          <div className="relative mt-2 h-10 w-full px-1">
            {velocityIcons.map((item, i) => (
              <motion.div
                key={i}
                className="absolute flex flex-col items-center gap-1.5"
                style={{ left: item.left }}
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                whileInView={{ opacity: [0, 1, 0], y: [15, 0, -10], scale: [0.8, 1.1, 0.9] }}
                viewport={{ once: true }}
                transition={{
                  duration: 2.2,
                  delay: shouldSimplify ? 0 : item.delay,
                  times: [0, 0.3, 1],
                  ease: 'easeOut',
                }}
              >
                <div className="whitespace-nowrap rounded-md border border-cyan-500/30 bg-cyan-950/80 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] backdrop-blur-md">
                  {item.text}
                </div>
                <item.Icon className="h-4 w-4 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 mt-2 flex flex-wrap gap-2.5">
            {[
              'Iteraci\u00f3n R\u00e1pida',
              'Sin intermediarios',
              'Despliegue Continuo',
            ].map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: shouldSimplify ? 0 : 0.5 + i * 0.4, ease: 'easeOut' }}
                className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(34,211,238,0.15)] hover:border-cyan-400/50 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-100">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function TabbedCardIcon({ visual }: { visual: TabVisualKey }) {
  const iconMap: Record<TabVisualKey, LucideIcon> = {
    progress: Zap,
    lock: LockOpen,
    status: MessageCircle,
    ownership: Server,
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
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent text-white/60 shadow-inner transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]">
      <Icon className="h-6 w-6 text-current drop-shadow-sm" />
    </div>
  );
}

function ProgressVisual({ accent, animationKey }: { accent: AccentKey; animationKey: number }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="-mx-5 -mt-5 mb-6 sm:-mx-6 sm:-mt-6 relative flex w-[calc(100%+40px)] sm:w-[calc(100%+48px)] h-[150px] flex-col justify-end overflow-hidden rounded-t-[24px] border-b border-cyan-500/10 bg-[radial-gradient(ellipse_at_top,rgba(8,145,178,0.15),transparent_70%)] px-6 pb-6">
      <div className="flex items-end justify-between gap-3 relative z-10 w-full">
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400/80 drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">Entrega real</div>
          <motion.div
            key={`progress-value-${animationKey}`}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.45, ease: 'easeOut' }}
            className="text-[3rem] font-black leading-none tracking-tighter text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]"
          >
            100%
          </motion.div>
        </div>
        <div className="rounded-full border border-cyan-400/30 bg-cyan-950/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.4)] backdrop-blur-md">
          live
        </div>
      </div>
      <div className="relative mt-4 h-2.5 w-full overflow-hidden rounded-full border border-cyan-700/50 bg-cyan-950/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] z-10">
        <motion.div
          key={`progress-fill-${animationKey}`}
          className="absolute inset-y-0 left-0 rounded-full shadow-[0_0_15px_#22d3ee,0_0_30px_#fff]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${tone.strong} 65%, #fff 100%)`,
          }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.9, ease: 'easeOut' }}
        />
        {!shouldReduceMotion && (
          <motion.div
            key={`progress-glint-${animationKey}`}
            className="absolute inset-y-0 w-20 rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1px]"
            initial={{ x: -80 }}
            animate={{ x: 400 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
          />
        )}
      </div>
    </div>
  );
}

function LockVisual({ accent }: { accent: AccentKey }) {
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="-mx-5 -mt-5 mb-6 sm:-mx-6 sm:-mt-6 relative flex w-[calc(100%+40px)] sm:w-[calc(100%+48px)] h-[150px] items-center justify-center overflow-hidden rounded-t-[24px] border-b border-white/5 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_0_30px_rgba(255,255,255,0.02)] transition-all duration-500 group-hover:border-emerald-500/30 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] group-hover:from-emerald-500/10">
        <Lock className="absolute h-10 w-10 text-white/40 transition-all duration-500 group-hover:-rotate-12 group-hover:scale-75 group-hover:opacity-0" />
        <LockOpen
          className="absolute h-10 w-10 scale-75 text-emerald-400 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
          style={{ filter: `drop-shadow(0 0 20px rgba(52,211,153,0.9))` }}
        />
        <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </div>
  );
}

function StatusVisual({ accent, animationKey }: { accent: AccentKey; animationKey: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="-mx-5 -mt-5 mb-6 sm:-mx-6 sm:-mt-6 relative flex w-[calc(100%+40px)] sm:w-[calc(100%+48px)] h-[150px] flex-col justify-center overflow-hidden rounded-t-[24px] border-b border-emerald-900/10 bg-[radial-gradient(ellipse_at_left,rgba(16,185,129,0.1),transparent_70%)] px-8">
      <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-400/80 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)] mb-4">Soporte directo</div>
      <div className="flex items-center gap-6">
        <span className="relative flex h-8 w-8 items-center justify-center">
          <span className="absolute h-10 w-10 rounded-full animate-ping bg-emerald-500/50" />
          <span className="absolute h-8 w-8 rounded-full border border-emerald-700/80 bg-[#090c10]" />
          <span className="relative h-4 w-4 rounded-full animate-pulse bg-emerald-400 shadow-[0_0_20px_#34d399]" />
        </span>
        <div className="h-0.5 flex-1 overflow-hidden bg-emerald-950/40 rounded-full">
          <motion.div
            key={`status-line-${animationKey}`}
            className="h-full bg-gradient-to-r to-transparent shadow-[0_0_8px_#34d399]"
            style={{ backgroundImage: `linear-gradient(90deg, #34d399 0%, transparent 100%)` }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 1.2, ease: 'easeOut', delay: 0.1 }}
          />
        </div>
      </div>
    </div>
  );
}

function OwnershipVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = ACCENT_STYLES[accent];

  return (
    <div className="-mx-5 -mt-5 mb-6 sm:-mx-6 sm:-mt-6 relative flex w-[calc(100%+40px)] sm:w-[calc(100%+48px)] h-[150px] items-center justify-center overflow-hidden rounded-t-[24px] border-b border-cyan-500/10 bg-[radial-gradient(ellipse_at_top,rgba(8,145,178,0.15),transparent_70%)]">
      <motion.div
        className="relative flex h-20 w-48 items-center gap-5 rounded-2xl border border-cyan-500/40 bg-cyan-950/50 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
        animate={shouldReduceMotion ? { y: 0 } : { y: [-4, 4, -4], boxShadow: [`0 10px 30px rgba(0,0,0,0.5), 0 0 0px ${tone.glow}`, `0 10px 30px rgba(0,0,0,0.5), 0 0 25px ${tone.glow}`, `0 10px 30px rgba(0,0,0,0.5), 0 0 0px ${tone.glow}`] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Server className="h-8 w-8 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
        <div className="flex w-full flex-col gap-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200">Infraestructura</div>
          <div className="grid gap-2">
            {[0.9, 0.6].map((opacity, index) => (
              <motion.div
                key={index}
                className="h-1.5 w-full rounded-full"
                style={{ backgroundColor: tone.strong, opacity }}
                animate={shouldReduceMotion ? { opacity } : { opacity: [opacity * 0.4, opacity, opacity * 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.15 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
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
      <div className="relative flex w-full items-center justify-center overflow-hidden rounded-[24px] border border-cyan-800/30 bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.2),transparent_70%),linear-gradient(180deg,rgba(10,10,12,0.1),rgba(10,10,12,0.7))] py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_30px_rgba(34,211,238,0.05)] md:py-8 lg:min-h-[300px]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
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
                stroke="rgba(34,211,238,0.15)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <motion.path
                d={satellite.path}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="4 20"
                animate={shouldSimplify ? { strokeDashoffset: 0 } : { strokeDashoffset: [24, 0] }}
                transition={{
                  duration: shouldSimplify ? 0.01 : 1.2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: shouldSimplify ? 0 : satellite.delay,
                }}
                style={{ filter: `drop-shadow(0 0 ${shouldSimplify ? 5 : 8}px #22d3ee)` }}
              />
            </g>
          ))}
        </svg>

        {satellites.map((satellite) => (
          <motion.div
            key={satellite.label}
            className={`pointer-events-none absolute z-0 rounded-full border border-cyan-400/30 bg-cyan-950/60 px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(34,211,238,0.2)] backdrop-blur-xl md:px-5 md:py-2.5 md:text-[10px] md:tracking-[0.2em] ${satellite.position}`}
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
          className="relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full border border-cyan-400/40 bg-[#020617]/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(34,211,238,0.2)] md:h-40 md:w-40 md:shadow-[0_0_80px_rgba(34,211,238,0.25)]"
          animate={shouldSimplify ? { scale: 1 } : { scale: [1, 1.05, 1], boxShadow: ['0 0 30px rgba(34,211,238,0.1)', '0 0 60px rgba(34,211,238,0.3)', '0 0 30px rgba(34,211,238,0.1)'] }}
          transition={{ duration: shouldSimplify ? 0.01 : 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="pointer-events-none absolute -inset-2 rounded-full border border-cyan-400/30 md:-inset-3"
            animate={shouldSimplify ? { scale: 1, opacity: 0.22 } : { scale: [1, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: shouldSimplify ? 0.01 : 2.6, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="pointer-events-none absolute -inset-5 rounded-full border border-cyan-400/20 md:-inset-7"
            animate={shouldSimplify ? { scale: 1, opacity: 0.14 } : { scale: [1, 1.6], opacity: [0.4, 0] }}
            transition={{ duration: shouldSimplify ? 0.01 : 2.6, repeat: Infinity, ease: 'easeOut', delay: shouldSimplify ? 0 : 1.15 }}
          />
          <div ref={countRef} className="font-mono text-4xl font-black tracking-tighter text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] md:text-5xl">
            +0
          </div>
          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-cyan-400/80 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">LEADS GENERADOS</div>
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

  return (
    <div className="-mx-5 -mt-5 mb-6 sm:-mx-6 sm:-mt-6 relative flex w-[calc(100%+40px)] sm:w-[calc(100%+48px)] h-[150px] items-end justify-center overflow-hidden rounded-t-[24px] border-b border-cyan-500/10 bg-[radial-gradient(ellipse_at_bottom,rgba(34,211,238,0.12),transparent_70%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
      <svg viewBox="0 0 300 100" className="h-[90%] w-full relative z-10" aria-hidden="true" preserveAspectRatio="none">
        <path d="M0 80 H300" stroke="rgba(34,211,238,0.15)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M0 50 H300" stroke="rgba(34,211,238,0.1)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M0 20 H300" stroke="rgba(34,211,238,0.05)" strokeWidth="1" strokeDasharray="4 4" />
        <motion.path
          d="M0 80 C 80 75, 120 40, 200 35 S 250 15, 300 10"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="3.5"
          style={{ filter: 'drop-shadow(0 0 12px rgba(34,211,238,0.8))' }}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 1.5, ease: 'easeOut' }}
        />
        <motion.circle
          cx="300"
          cy="10"
          r="6"
          fill="#22d3ee"
          style={{ filter: 'drop-shadow(0 0 15px rgba(34,211,238,1))' }}
          animate={shouldReduceMotion ? { opacity: 1 } : { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

function ClockVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="-mx-5 -mt-5 mb-6 sm:-mx-6 sm:-mt-6 relative flex w-[calc(100%+40px)] sm:w-[calc(100%+48px)] h-[150px] items-center justify-center overflow-hidden rounded-t-[24px] border-b border-cyan-500/10 bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.15),transparent_60%)]">
      {/* Sonar Radar Rings */}
      <motion.div
        className="absolute h-16 w-16 rounded-full border border-cyan-400"
        style={{ filter: `drop-shadow(0 0 10px rgba(34,211,238,0.8))` }}
        animate={shouldReduceMotion ? { opacity: 0.5 } : { scale: [1, 3.5], opacity: [0.8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0 }}
      />
      <motion.div
        className="absolute h-16 w-16 rounded-full border border-cyan-400/80"
        style={{ filter: `drop-shadow(0 0 10px rgba(34,211,238,0.5))` }}
        animate={shouldReduceMotion ? { opacity: 0.5 } : { scale: [1, 3.5], opacity: [0.6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 1.25 }}
      />

      <motion.div
        className="absolute h-16 w-16 rounded-full border border-cyan-400/40 bg-cyan-950/60 backdrop-blur-md"
        animate={{ scale: [1, 1.1, 1], boxShadow: [`0 0 15px rgba(34,211,238,0.2)`, `0 0 30px rgba(34,211,238,0.6)`, `0 0 15px rgba(34,211,238,0.2)`] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Clock3 className="relative z-10 h-8 w-8 text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
    </div>
  );
}

function LayersVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="-mx-5 -mt-5 mb-6 sm:-mx-6 sm:-mt-6 relative flex w-[calc(100%+40px)] sm:w-[calc(100%+48px)] h-[150px] items-center justify-center overflow-hidden rounded-t-[24px] border-b border-cyan-500/10 bg-[radial-gradient(ellipse_at_top,rgba(8,145,178,0.15),transparent_70%)] [perspective:800px]">
      <div className="relative h-24 w-40 mt-4">
        {[0, 1, 2].map((layer) => (
          <motion.div
            key={layer}
            className="absolute left-1/2 h-16 w-32 -translate-x-1/2 rounded-2xl border border-cyan-400/30 bg-cyan-950/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_5px_15px_rgba(0,0,0,0.5)] backdrop-blur-sm"
            style={{ top: `${layer * 12}px`, transform: 'rotateX(65deg) skewX(-15deg)', zIndex: 3 - layer }}
            animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { y: [-3, 3, -3], opacity: [0.6, 1, 0.6], filter: [`drop-shadow(0 0 0px rgba(34,211,238,0))`, `drop-shadow(0 0 25px rgba(34,211,238,0.5))`, `drop-shadow(0 0 0px rgba(34,211,238,0))`] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: layer * 0.25 }}
          >
            <div className="mx-auto mt-4 h-1.5 w-14 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DashboardVisual({ accent }: { accent: AccentKey }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="-mx-5 -mt-5 mb-6 sm:-mx-6 sm:-mt-6 relative flex w-[calc(100%+40px)] sm:w-[calc(100%+48px)] h-[150px] items-center justify-center overflow-hidden rounded-t-[24px] border-b border-cyan-500/10 bg-[radial-gradient(ellipse_at_left,rgba(8,145,178,0.15),transparent_70%)]">
      <div className="grid w-full max-w-[200px] gap-3">
        <div className="grid grid-cols-[1fr_0.6fr] gap-3">
          <div className="rounded-xl border border-cyan-700/50 bg-cyan-950/50 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(34,211,238,0.1)] backdrop-blur-md">
            <div className="mb-4 h-2 w-16 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <div className="flex items-end gap-2 h-10">
              {[14, 26, 40, 20].map((height, index) => (
                <div key={index} className="flex h-full items-end">
                  <motion.div
                    className="w-3 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.7)]"
                    style={{ height }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 1.5 }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-cyan-700/50 bg-cyan-950/50 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(34,211,238,0.1)] backdrop-blur-md">
            <motion.div
              className="h-6 w-6 rounded-full bg-cyan-400 shadow-[0_0_25px_rgba(34,211,238,1)]"
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <div className="h-1.5 w-8 rounded-full bg-cyan-800/80" />
          </div>
        </div>

        <div className="flex justify-between rounded-xl border border-cyan-700/50 bg-cyan-950/50 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(34,211,238,0.1)] backdrop-blur-md">
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              className="h-3 w-8 rounded-full bg-cyan-500/80 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
              animate={shouldReduceMotion ? { opacity: 0.85 } : { opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 1.2 }}
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

function FeaturedCard({ feature, activeTab }: { feature: TabbedFeature; activeTab: number }) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const tone = ACCENT_STYLES[feature.accent];
  const { background, handleMouseMove, handleMouseLeave } = useCardSpotlight(!isMobile);
  const showAgencyComparison = activeTab === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      whileHover={shouldReduceMotion || isMobile ? undefined : { y: -6 }}
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
      className={`group relative h-full min-h-[420px] overflow-hidden ${GLASS_CARD_CLASS} p-5 transition-colors duration-500 hover:border-white/12 sm:p-6 md:min-h-[520px] md:p-8`}
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

      <div className="relative z-10 flex h-full flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.04] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(255,255,255,0.02)] transition-colors group-hover:bg-white/[0.06] group-hover:border-white/10">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: tone.strong, boxShadow: `0 0 10px ${tone.glow}` }} />
            {feature.tag}
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500 transition-colors group-hover:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 transition-all group-hover:animate-pulse" style={{ backgroundColor: tone.strong, boxShadow: `0 0 0px ${tone.glow}` }} />
            {feature.signal}
          </div>
        </div>

        <div className="max-w-2xl">
          <h3 className="text-3xl font-black tracking-tighter text-white drop-shadow-sm md:text-4xl lg:text-5xl">
            {feature.supportTitle}
          </h3>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg transition-colors group-hover:text-zinc-300">
            {feature.text}
          </p>
        </div>

        {showAgencyComparison ? <AgencyComparisonVisual /> : <div className="mt-auto"><TabbedFeatureVisual visual={feature.visual} /></div>}
      </div>
    </motion.article>
  );
}

function SecondaryCard({ card, activeTab, cardIndex }: { card: TabbedCard; activeTab: number; cardIndex: number }) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const tone = ACCENT_STYLES[card.accent];
  const { background, handleMouseMove, handleMouseLeave } = useCardSpotlight(!isMobile);
  const focusCardIndex = Math.min(activeTab, 3);
  const isFocusCard = cardIndex === focusCardIndex;

  return (
    <motion.article
      variants={SECONDARY_CARD_VARIANTS}
      whileHover={shouldReduceMotion || isMobile ? undefined : { y: -5 }}
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
      className={`group relative min-h-[220px] overflow-hidden ${GLASS_CARD_CLASS} p-5 transition-colors duration-500 hover:border-white/12 sm:min-h-[236px] sm:p-6 md:min-h-[252px]`}
    >
      <motion.div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background }} />
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)]"
        initial={false}
        animate={{ opacity: isFocusCard ? 1 : 0, scale: isFocusCard ? 1 : 0.96 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.55, ease: EASE_OUT }}
      />
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
          <h3 className="text-xl font-bold tracking-tight text-white transition-all duration-300 md:text-2xl group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">{card.title}</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400 transition-colors duration-300 group-hover:text-zinc-300">{card.text}</p>
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
    return <AgencyComparisonVisual />;
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
            <FeaturedCard feature={activeDimension.feature} activeTab={activeTab} />

            <motion.div
              variants={SECONDARY_GRID_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-4 sm:grid-cols-2 xl:auto-rows-fr"
            >
              {activeDimension.cards.map((card, index) => (
                <SecondaryCard
                  key={`${activeDimension.label}-${card.title}-${index}`}
                  card={card}
                  activeTab={activeTab}
                  cardIndex={index}
                />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
