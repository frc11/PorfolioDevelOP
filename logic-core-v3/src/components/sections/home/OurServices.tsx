'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  BarChart2,
  Bell,
  Bot,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Code2,
  Database,
  FileText,
  GitBranch,
  Globe,
  Layers,
  Mail,
  MessageSquare,
  Package,
  Pause,
  Phone,
  Play,
  RefreshCw,
  Search,
  Target,
  type LucideIcon,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { useLenis } from '@/components/layout/SmoothScroll';
import { useTransitionContext } from '@/context/TransitionContext';

type Service = {
  id: number;
  tag: string;
  title: string;
  description: string;
  price: string;
  timeline: string;
  metric: string;
  sectors: string[];
  outcomes: string[];
  cta: string;
  href: string;
  accent: string;
  glow: string;
  icon: LucideIcon;
};

const SERVICES: Service[] = [
  {
    id: 1,
    tag: 'SITIOS & LANDINGS',
    title: 'Tu vitrina\nabierta las\n24 horas.',
    description:
      'Diseñamos la presencia digital que pone tu negocio en Google, captura consultas mientras dormís y convierte visitas en clientes reales.',
    price: '$800 USD',
    timeline: '15 dias',
    metric: '+340% consultas promedio',
    sectors: ['Concesionarias', 'Clínicas', 'Gimnasios', 'Restaurantes'],
    outcomes: ['Más autoridad en Google', 'Carga impecable en mobile', 'Captación 24/7'],
    cta: 'Explorar sitios web',
    href: '/web-development',
    accent: '#06b6d4',
    glow:
      'radial-gradient(circle at 82% 22%, rgba(6,182,212,0.20), transparent 0 36%), radial-gradient(circle at 12% 86%, rgba(6,182,212,0.08), transparent 0 30%)',
    icon: Globe,
  },
  {
    id: 2,
    tag: 'INTELIGENCIA ARTIFICIAL',
    title: 'Un comercial\nque trabaja\nsin pausas.',
    description:
      'Un agente de IA responde consultas, califica leads y agenda reuniones por WhatsApp. A las 3AM, en feriados, siempre disponible.',
    price: '$300 USD',
    timeline: '7 dias',
    metric: '94% respuesta automática',
    sectors: ['Concesionarias', 'Clínicas', 'Comercios', 'Inmobiliarias'],
    outcomes: ['Atención inmediata', 'Mejor calidad de lead', 'Agenda operando sola'],
    cta: 'Explorar IA aplicada',
    href: '/ai-implementations',
    accent: '#10b981',
    glow:
      'radial-gradient(circle at 18% 18%, rgba(16,185,129,0.20), transparent 0 36%), radial-gradient(circle at 86% 76%, rgba(16,185,129,0.09), transparent 0 28%)',
    icon: Bot,
  },
  {
    id: 3,
    tag: 'AUTOMATIZACIÓN',
    title: 'Tu operación,\nen piloto\nautomático.',
    description:
      'Conectamos tus herramientas y automatizamos lo repetitivo. Reportes, seguimientos y notificaciones corriendo solos mientras vos te ocupás de lo importante.',
    price: '$200 USD',
    timeline: '5 dias',
    metric: '23hs por semana ahorradas',
    sectors: ['Distribuidoras', 'Comercios', 'Clínicas', 'Inmobiliarias'],
    outcomes: ['Menos trabajo manual', 'Follow-up automático', 'Reportes al instante'],
    cta: 'Explorar automatizaciones',
    href: '/process-automation',
    accent: '#f59e0b',
    glow:
      'radial-gradient(circle at 84% 20%, rgba(245,158,11,0.20), transparent 0 36%), radial-gradient(circle at 18% 82%, rgba(245,158,11,0.09), transparent 0 30%)',
    icon: Zap,
  },
  {
    id: 4,
    tag: 'SOFTWARE A MEDIDA',
    title: 'Tu empresa\nen una sola\npantalla.',
    description:
      'El sistema exacto para cómo trabaja tu negocio. Sin planillas, sin depender de nadie. Stock, ventas, clientes y equipo — todo centralizado.',
    price: '$1.500 USD',
    timeline: 'entrega por etapas',
    metric: '0 licencias mensuales',
    sectors: ['Constructoras', 'Mayoristas', 'Clínicas', 'Concesionarias'],
    outcomes: ['operación centralizada', 'Reportes directivos', 'Control total del dato'],
    cta: 'Explorar software a medida',
    href: '/software-development',
    accent: '#8b5cf6',
    glow:
      'radial-gradient(circle at 18% 18%, rgba(139,92,246,0.20), transparent 0 36%), radial-gradient(circle at 84% 82%, rgba(139,92,246,0.09), transparent 0 30%)',
    icon: Code2,
  },
];

const ORDERED_SERVICE_IDS = [1, 2, 4, 3] as const;
const ORDERED_SERVICES = ORDERED_SERVICE_IDS.map((serviceId) => {
  const service = SERVICES.find((item) => item.id === serviceId);

  if (!service) {
    throw new Error(`Missing service ${serviceId}`);
  }

  return service;
});

const SERVICE_SHORT_LABELS: Record<number, string> = {
  1: 'Sitio Web',
  2: 'Agente IA',
  3: 'Automatizaciones',
  4: 'Software',
};

const getServiceAnchorId = (serviceId: number) => `servicio-${serviceId}`;
const getServiceAccent = (serviceId: number, fallback: string) =>
  SERVICES.find((service) => service.id === serviceId)?.accent ?? fallback;
const SERVICE_DEMO_HOLD_MS = 2000;
const SERVICE_DEMO_ADVANCE_DELAY_MS = 300;

type ServiceDemoCycleConfig = {
  activeIndex: number;
  itemCount: number;
  animationDuration: number;
  isInView: boolean;
  cycleSeed: number;
  onAdvance: () => void;
};

function useServiceDemoCycle({
  activeIndex,
  itemCount,
  animationDuration,
  isInView,
  cycleSeed,
  onAdvance,
}: ServiceDemoCycleConfig) {
  const [progress, setProgress] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef(0);
  const animationProgressRef = useRef(0);
  const animFrameRef = useRef(0);
  const nextTabTimeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const tickRef = useRef<((now: number) => void) | null>(null);

  const clearPendingCycle = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);

    if (nextTabTimeoutRef.current) {
      clearTimeout(nextTabTimeoutRef.current);
      nextTabTimeoutRef.current = null;
    }
  }, []);

  const resetCycle = useCallback(() => {
    clearPendingCycle();
    progressRef.current = 0;
    animationProgressRef.current = 0;
    pausedAtRef.current = null;
    isRunningRef.current = false;
    isPausedRef.current = false;
    tickRef.current = null;
    setProgress(0);
    setAnimationProgress(0);
    setIsPaused(false);
  }, [clearPendingCycle]);

  const togglePause = useCallback(() => {
    if (!isInView) {
      return;
    }

    if (isPausedRef.current) {
      if (pausedAtRef.current !== null) {
        startTimeRef.current += performance.now() - pausedAtRef.current;
      }

      pausedAtRef.current = null;
      isPausedRef.current = false;
      isRunningRef.current = true;
      setIsPaused(false);

      if (tickRef.current) {
        animFrameRef.current = requestAnimationFrame(tickRef.current);
      }

      return;
    }

    if (!isRunningRef.current || progressRef.current >= 1) {
      return;
    }

    pausedAtRef.current = performance.now();
    isPausedRef.current = true;
    isRunningRef.current = false;
    setIsPaused(true);
    clearPendingCycle();
  }, [clearPendingCycle, isInView]);

  useEffect(() => {
    clearPendingCycle();
    progressRef.current = 0;
    animationProgressRef.current = 0;
    pausedAtRef.current = null;
    isPausedRef.current = false;
    const resetStateTimeout = window.setTimeout(() => {
      setProgress(0);
      setAnimationProgress(0);
      setIsPaused(false);
    }, 0);

    if (!isInView || itemCount <= 0) {
      isRunningRef.current = false;
      tickRef.current = null;
      return () => {
        clearTimeout(resetStateTimeout);
      };
    }

    const cycleAnimationDuration = Math.max(animationDuration, 1);
    const cycleTotalDuration = cycleAnimationDuration + SERVICE_DEMO_HOLD_MS;

    startTimeRef.current = performance.now();
    isRunningRef.current = true;

    const tick = (now: number) => {
      if (!isRunningRef.current || isPausedRef.current) {
        return;
      }

      const elapsed = now - startTimeRef.current;
      const nextProgress = Math.min(elapsed / cycleTotalDuration, 1);
      const nextAnimationProgress = Math.min(elapsed / cycleAnimationDuration, 1);

      if (nextProgress !== progressRef.current) {
        progressRef.current = nextProgress;
        setProgress(nextProgress);
      }

      if (nextAnimationProgress !== animationProgressRef.current) {
        animationProgressRef.current = nextAnimationProgress;
        setAnimationProgress(nextAnimationProgress);
      }

      if (nextProgress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      isRunningRef.current = false;
      nextTabTimeoutRef.current = window.setTimeout(() => {
        progressRef.current = 0;
        animationProgressRef.current = 0;
        setProgress(0);
        setAnimationProgress(0);
        onAdvance();
      }, SERVICE_DEMO_ADVANCE_DELAY_MS);
    };

    tickRef.current = tick;
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(resetStateTimeout);
      clearPendingCycle();
      isRunningRef.current = false;
      tickRef.current = null;
    };
  }, [activeIndex, animationDuration, clearPendingCycle, cycleSeed, isInView, itemCount, onAdvance]);

  return {
    progress,
    animationProgress,
    isPaused,
    togglePause,
    resetCycle,
  };
}

function ServiceDemoPauseButton({
  isPaused,
  onToggle,
  color,
}: {
  isPaused: boolean;
  onToggle: () => void;
  color: string;
}) {
  const Icon = isPaused ? Play : Pause;
  const label = isPaused ? 'Reanudar' : 'Pausar';

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onToggle}
      whileHover={{
        borderColor: `${color}55`,
        background: `${color}14`,
        boxShadow: `0 0 18px ${color}18`,
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 26,
        borderRadius: 999,
        border: `1px solid ${color}28`,
        background: 'rgba(255,255,255,0.035)',
        color: 'rgba(255,255,255,0.74)',
        padding: '0 9px',
        cursor: 'pointer',
        fontSize: 9,
        fontWeight: 750,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={10} color={color} strokeWidth={2.2} />
      <span>{label}</span>
    </motion.button>
  );
}

function StageFrame({
  service,
  children,
}: {
  service: Service;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Glow de fondo del color del servicio */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${service.accent}08 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Browser window */}
      <motion.div
        data-cursor="hover"
        whileHover={{
          borderColor: `${service.accent}42`,
          boxShadow: `
            0 30px 72px rgba(0,0,0,0.58),
            0 0 0 1px rgba(255,255,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 0 54px ${service.accent}22
          `,
        }}
        transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(10,10,12,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: `
            0 32px 80px rgba(0,0,0,0.6),
            0 0 0 1px rgba(255,255,255,0.04),
            inset 0 1px 0 rgba(255,255,255,0.07),
            0 0 40px ${service.accent}10
          `,
          flex: 1,
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          willChange: 'box-shadow, border-color',
        }}
      >
        {/* Browser top bar */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: c,
                  opacity: 0.75,
                }}
              />
            ))}
          </div>

          {/* URL bar */}
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              maxWidth: 320,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: service.accent,
                boxShadow: `0 0 4px ${service.accent}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {service.tag.toLowerCase().replace(/\s+|&/g, '')}.develop.com.ar
            </span>
          </div>

          {/* Badge de métrica del servicio */}
          <div
            style={{
              marginLeft: 'auto',
              fontSize: 10,
              fontWeight: 600,
              color: service.accent,
              background: `${service.accent}12`,
              border: `1px solid ${service.accent}25`,
              borderRadius: 100,
              padding: '3px 8px',
              letterSpacing: '0.04em',
              flexShrink: 0,
            }}
          >
            {service.metric}
          </div>
        </div>

        {/* Top bar del portal — nombre del servicio */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <service.icon size={12} color={service.accent} strokeWidth={1.5} />
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: `${service.accent}80`,
                textTransform: 'uppercase',
              }}
            >
              {service.tag}
            </span>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              fontSize: 9,
              color: service.accent,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: service.accent,
                boxShadow: `0 0 8px ${service.accent}`,
              }}
            />
            EN VIVO
          </motion.div>
        </div>

        {/* Área de contenido — las simulaciones */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
            padding: 0,
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function WebScene({ service }: { service: Service }) {
  type WebSimulation = {
    id: number;
    label: string;
    icon: ReactNode;
    duration: number;
    color: string;
  };

  type SimProps = {
    isActive: boolean;
    progress: number;
    color: string;
  };

  type PlaceholderConfig = {
    title: string;
    helper: string;
    values: Array<{ label: string; value: string }>;
  };

  const IconBase = ({ children }: { children: ReactNode }) => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );

  const SearchGlyph = () => (
    <IconBase>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </IconBase>
  );

  const AnalyticsGlyph = () => (
    <IconBase>
      <path d="M4 19h16" />
      <path d="M7 16v-4" />
      <path d="M12 16V7" />
      <path d="M17 16v-7" />
    </IconBase>
  );

  const LeadsGlyph = () => (
    <IconBase>
      <path d="M5 7.5C5 6.12 6.12 5 7.5 5h9C17.88 5 19 6.12 19 7.5v5c0 1.38-1.12 2.5-2.5 2.5H11l-4 4v-4H7.5A2.5 2.5 0 0 1 5 12.5v-5Z" />
    </IconBase>
  );

  const MapsGlyph = () => (
    <IconBase>
      <path d="M12 20s5-4.7 5-9a5 5 0 1 0-10 0c0 4.3 5 9 5 9Z" />
      <circle cx="12" cy="11" r="1.8" />
    </IconBase>
  );

  const [webSimulations] = useState<WebSimulation[]>(() => [
    { id: 1, label: 'SEO Local', icon: <SearchGlyph />, duration: 5000, color: service.accent },
    { id: 2, label: 'Analytics', icon: <AnalyticsGlyph />, duration: 4500, color: service.accent },
    { id: 3, label: 'Leads', icon: <LeadsGlyph />, duration: 5500, color: service.accent },
    { id: 4, label: 'Google Maps', icon: <MapsGlyph />, duration: 6500, color: service.accent },
  ]);

  const [activeTab, setActiveTab] = useState(0);
  const [hoveredWebTab, setHoveredWebTab] = useState<number | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [cycleSeed, setCycleSeed] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const placeholderConfigs: PlaceholderConfig[] = [
    {
      title: 'SEO Local',
      helper: 'Rank tracking',
      values: [
        { label: 'Ranking', value: '#3' },
        { label: 'Clicks', value: '1.8k' },
        { label: 'CTR', value: '6.4%' },
      ],
    },
    {
      title: 'Analytics',
      helper: 'Traffic pulse',
      values: [
        { label: 'Sessions', value: '2.4k' },
        { label: 'Bounce', value: '29%' },
        { label: 'ROAS', value: '4.1x' },
      ],
    },
    {
      title: 'Leads',
      helper: 'Inbox routing',
      values: [
        { label: 'Inbound', value: '47' },
        { label: 'Hot', value: '18' },
        { label: 'Reply', value: '94%' },
      ],
    },
    {
      title: 'Google Maps',
      helper: 'Local reach',
      values: [
        { label: 'Views', value: '9.2k' },
        { label: 'Calls', value: '132' },
        { label: 'Route', value: '+21%' },
      ],
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => observer.disconnect();
  }, []);

  const advanceWebTab = useCallback(() => {
    setActiveTab((previousTab) => (previousTab + 1) % webSimulations.length);
  }, [webSimulations.length]);

  const {
    progress,
    animationProgress,
    isPaused,
    togglePause,
    resetCycle,
  } = useServiceDemoCycle({
    activeIndex: activeTab,
    itemCount: webSimulations.length,
    animationDuration: webSimulations[activeTab]?.duration ?? 1,
    isInView,
    cycleSeed,
    onAdvance: advanceWebTab,
  });

  const handleTabClick = (index: number) => {
    resetCycle();
    setHoveredWebTab(null);
    setActiveTab(index);
    setCycleSeed((currentSeed) => currentSeed + 1);
  };

  const activeSimulation = webSimulations[activeTab];
  const activePlaceholder = placeholderConfigs[activeTab];
  const visualWebTab = hoveredWebTab ?? activeTab;

  function SimSEO({ isActive, progress, color }: SimProps) {
    const query = 'Clínica odontológica en Tucumán';
    const typedLength = Math.floor(Math.min(progress / 0.25, 1) * query.length);
    const typedQuery = query.slice(0, typedLength);
    const showResults = progress > 0.28;
    const highlightFirst = progress > 0.55;
    const showStars = progress > 0.7;
    const competitorResults = [
      {
        pos: 2,
        url: 'competidor1.com',
        title: 'Clínica local | Turnos',
        desc: 'Presencia básica en Google.',
      },
      {
        pos: 3,
        url: 'directoriolocal.com',
        title: 'Directorio de clínicas',
        desc: 'Listado general sin CTA.',
      },
      {
        pos: 4,
        url: 'odontologiatuc.com',
        title: 'Consultorio odontológico',
        desc: 'Ficha incompleta.',
      },
      {
        pos: 5,
        url: 'guiaempresas.com',
        title: 'Guía de servicios',
        desc: 'Resultado secundario.',
      },
    ];

    return (
      <div
        style={{
          height: '100%',
          minHeight: 0,
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '2px',
          overflow: 'hidden',
        }}
      >
        {/* Header del panel */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 2,
              }}
            >
              BÚSQUEDA ACTIVA
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Google · Tucumán, Argentina
            </div>
          </div>
          <div
            style={{
              fontSize: 9,
              color,
              background: `${color}12`,
              border: `1px solid ${color}25`,
              borderRadius: 6,
              padding: '4px 8px',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            SEO LOCAL
          </div>
        </div>

        {/* Barra de búsqueda glassmorphism */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 12,
            padding: '8px 12px',
            flexShrink: 0,
          }}
        >
          <Search size={13} color="rgba(255,255,255,0.3)" strokeWidth={1.5} />
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.8)',
              flex: 1,
              fontWeight: 400,
            }}
          >
            {typedQuery}
            {progress < 0.25 && (
              <motion.span
                animate={isActive ? { opacity: [1, 0] } : { opacity: 1 }}
                transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                style={{
                  display: 'inline-block',
                  width: 1,
                  height: 12,
                  background: color,
                  marginLeft: 2,
                  verticalAlign: 'middle',
                }}
              />
            )}
          </span>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                fontSize: 10,
                color: 'black',
                background: color,
                borderRadius: 6,
                padding: '4px 10px',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              BUSCAR
            </motion.div>
          )}
        </div>

        {/* Resultados */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* RESULTADO #1 — TU EMPRESA */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                background: highlightFirst
                  ? `linear-gradient(135deg, ${color}12, ${color}06)`
                  : 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${highlightFirst ? `${color}30` : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12,
                padding: '9px 12px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                boxShadow: highlightFirst ? `0 0 30px ${color}12` : 'none',
              }}
            >
              {/* Borde izquierdo de acento */}
              <motion.div
                animate={{ opacity: highlightFirst ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: `linear-gradient(180deg, ${color}, ${color}60)`,
                  borderRadius: '3px 0 0 3px',
                }}
              />

              {/* Badge TU EMPRESA */}
              {highlightFirst && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    position: 'absolute',
                    top: -1,
                    right: 10,
                    background: color,
                    color: 'black',
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '0 0 6px 6px',
                    letterSpacing: '0.08em',
                  }}
                >
                  TU EMPRESA
                </motion.div>
              )}

              {/* Posición + URL */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: highlightFirst ? color : 'rgba(255,255,255,0.2)',
                    transition: 'color 400ms',
                  }}
                >
                  #1
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {highlightFirst && (
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={8} color="black" strokeWidth={3} />
                    </div>
                  )}
                  <span
                    style={{
                      fontSize: 10,
                      color: highlightFirst ? `${color}80` : 'rgba(255,255,255,0.25)',
                      transition: 'color 400ms',
                    }}
                  >
                    tuempresa.com.ar
                  </span>
                </div>
              </div>

              {/* Título del resultado */}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: highlightFirst ? 700 : 400,
                  color: highlightFirst ? 'white' : 'rgba(255,255,255,0.4)',
                  marginBottom: 3,
                  transition: 'all 400ms',
                  lineHeight: 1.3,
                }}
              >
                Tu Empresa | develOP
              </div>

              {/* Descripción */}
              <div
                style={{
                  fontSize: 11,
                  color: highlightFirst ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
                  lineHeight: 1.42,
                  transition: 'color 400ms',
                }}
              >
                El mejor servicio en tu zona. Consultá precios, pedí presupuesto online.
              </div>

              {/* Stars */}
              {showStars && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 6,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <motion.span
                      key={s}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: s * 0.05, type: 'spring', stiffness: 400 }}
                      style={{ fontSize: 11, color: '#f59e0b' }}
                    >

                    </motion.span>
                  ))}
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>
                    4.9 · 47 reseñas
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* RESULTADOS 2 a 5 — competidores con presencia decreciente */}
          {competitorResults.map(
            (result, i) =>
              showResults &&
              progress > 0.36 + i * 0.075 && (
                <motion.div
                  key={result.pos}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: highlightFirst ? [0.58, 0.45, 0.32, 0.22][i] : [0.82, 0.68, 0.52, 0.38][i],
                    y: 0,
                    filter: highlightFirst ? 'grayscale(0.6)' : 'none',
                  }}
                  transition={{ duration: 0.35, delay: i * 0.055 }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 10,
                    padding: '6px 11px',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.24)', fontWeight: 700 }}>
                      #{result.pos}
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)' }}>{result.url}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.35)',
                      marginBottom: 2,
                      fontWeight: 500,
                    }}
                  >
                    {result.title}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', lineHeight: 1.25 }}>{result.desc}</div>
                </motion.div>
              )
          )}
        </div>
      </div>
    );
  }
  function SimAnalytics({ isActive, progress, color }: SimProps) {
    const visits = Math.floor(progress * 1842);
    const sessions = Math.floor(progress * 247);
    const conv = (progress * 3.2).toFixed(1);

    const baseData = [45, 62, 58, 78, 71, 95, 88, 112, 98, 128, 115, 148];
    const showGraph = progress > 0.2;
    const showMap = progress > 0.4;
    const chartProgress = Math.max(0, Math.min((progress - 0.2) / 0.72, 1));
    const easedChartProgress = chartProgress * chartProgress * (3 - 2 * chartProgress);
    const chartWidth = 160;
    const chartHeight = 86;
    const chartPadX = 11;
    const chartPadTop = 13;
    const chartPadBottom = 16;
    const chartBaseY = chartHeight - chartPadBottom;
    const chartPlotWidth = chartWidth - chartPadX * 2;
    const chartPlotHeight = chartHeight - chartPadTop - chartPadBottom;
    const dataMin = 36;
    const dataMax = 156;
    const chartPoints = baseData.map((value, index) => ({
      x: chartPadX + (index / (baseData.length - 1)) * chartPlotWidth,
      y: chartBaseY - ((value - dataMin) / (dataMax - dataMin)) * chartPlotHeight,
    }));
    const chartLinePath = chartPoints
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');
    const chartAreaPath = `${chartLinePath} L ${chartPoints[chartPoints.length - 1].x.toFixed(2)} ${chartBaseY} L ${chartPoints[0].x.toFixed(2)} ${chartBaseY} Z`;
    const markerSegment = Math.min(baseData.length - 2, Math.floor(easedChartProgress * (baseData.length - 1)));
    const markerSegmentProgress = easedChartProgress * (baseData.length - 1) - markerSegment;
    const markerStart = chartPoints[markerSegment];
    const markerEnd = chartPoints[markerSegment + 1] ?? markerStart;
    const marker = {
      x: markerStart.x + (markerEnd.x - markerStart.x) * markerSegmentProgress,
      y: markerStart.y + (markerEnd.y - markerStart.y) * markerSegmentProgress,
    };
    const chartRevealWidth = Math.max(0, chartPadX + chartPlotWidth * easedChartProgress);
    const gradientId = `analytics-grad-${color.replace('#', '')}`;
    const clipId = `analytics-clip-${color.replace('#', '')}`;

    const mapCities = [
      { name: 'Formosa', left: '60%', top: '11%', size: 6.4 },
      { name: 'Tucumán', left: '44%', top: '15%', size: 6.8 },
      { name: 'Córdoba', left: '48%', top: '30%', size: 8 },
      { name: 'Mendoza', left: '30%', top: '45%', size: 7.2 },
      { name: 'Corrientes', left: '70%', top: '20%', size: 6.8 },
      { name: 'Buenos Aires', left: '65%', top: '35%', size: 9.6 },
      { name: 'Santa Cruz', left: '30%', top: '75%', size: 7.2 },
      { name: 'Tierra del Fuego', left: '39%', top: '92%', size: 6.4 },
    ];

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '4px 2px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 2,
              }}
            >
              PANEL EN TIEMPO REAL
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>Últimos 30 días · Tu sitio</div>
          </div>
          <motion.div
            animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
            transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 9,
              fontWeight: 600,
              color,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 8px ${color}`,
              }}
            />
            LIVE
          </motion.div>
        </div>

        {/* 3 metricas grandes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6,
            flexShrink: 0,
          }}
        >
          {[
            { label: 'VISITAS', value: visits.toLocaleString(), trend: '+12%', color },
            { label: 'SESIONES', value: sessions.toString(), trend: '+8%', color: '#8b5cf6' },
            { label: 'CONV.', value: `${conv}%`, trend: '+0.4%', color: '#f59e0b' },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${m.color}18`,
                borderRadius: 10,
                padding: '8px 10px',
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.08em',
                  marginBottom: 4,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: m.color,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  marginBottom: 3,
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: '#10b981',
                  fontWeight: 500,
                }}
              >
                ↑{' '}
                {m.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Area principal: grafico + mapa */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '3fr 2fr',
            gap: 6,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Grafico */}
          {showGraph && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '10px 10px 8px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.08em',
                  marginBottom: 8,
                }}
              >
                {'ÚLTIMOS 12 DÍAS'}
              </div>
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                style={{ flex: 1, width: '100%', minHeight: 0, overflow: 'visible' }}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.24" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </linearGradient>
                  <clipPath id={clipId}>
                    <rect x="0" y="0" width={chartRevealWidth} height={chartHeight} rx="2" />
                  </clipPath>
                </defs>
                {[0.25, 0.5, 0.75].map((line) => (
                  <line
                    key={line}
                    x1={chartPadX}
                    x2={chartWidth - chartPadX}
                    y1={chartPadTop + chartPlotHeight * line}
                    y2={chartPadTop + chartPlotHeight * line}
                    stroke="rgba(255,255,255,0.055)"
                    strokeWidth="0.7"
                  />
                ))}
                <g clipPath={`url(#${clipId})`}>
                  <path d={chartAreaPath} fill={`url(#${gradientId})`} />
                  <motion.path
                    d={chartLinePath}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
                    initial={false}
                    animate={{ opacity: showGraph ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                </g>
                {chartProgress > 0.03 && (
                  <g>
                    <circle cx={marker.x} cy={marker.y} r="3" fill={color} />
                    <motion.circle
                      cx={marker.x}
                      cy={marker.y}
                      r="7"
                      fill="none"
                      stroke={color}
                      strokeWidth="0.7"
                      opacity="0.42"
                      animate={isActive ? { r: [5.5, 8.5, 5.5], opacity: [0.3, 0.05, 0.3] } : { r: 6, opacity: 0.25 }}
                      transition={{ duration: 2.2, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
                    />
                  </g>
                )}
              </svg>
            </motion.div>
          )}

          {/* Mapa Argentina */}
          {showMap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '10px 8px 8px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.08em',
                  marginBottom: 4,
                  flexShrink: 0,
                }}
              >
                ORIGEN
              </div>
              <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
                <Image
                  src="/maps/argentina.svg"
                  alt="Mapa de Argentina"
                  fill
                  sizes="160px"
                  style={{
                    position: 'absolute',
                    objectFit: 'cover',
                    objectPosition: '48% 41%',
                    padding: 0,
                    opacity: 0.58,
                    filter: `invert(1) grayscale(1) brightness(1.32) contrast(1.08) drop-shadow(0 0 10px ${color}20)`,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                />
                {mapCities.map(
                  (city, i) =>
                    progress > 0.42 + i * 0.07 && (
                      <motion.span
                        key={city.name}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: i * 0.08 }}
                        style={{
                          position: 'absolute',
                          left: city.left,
                          top: city.top,
                          width: city.size,
                          height: city.size,
                          borderRadius: '50%',
                          background: color,
                          transform: 'translate(-50%, -50%)',
                          boxShadow: `0 0 4px ${color}, 0 0 12px ${color}66`,
                          zIndex: 2,
                        }}
                      >
                        <motion.span
                          aria-hidden
                          animate={{ scale: [1, 2.6, 1], opacity: [0.42, 0, 0.42] }}
                          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                          style={{
                            position: 'absolute',
                            inset: -city.size * 0.6,
                            borderRadius: '50%',
                            border: `1px solid ${color}`,
                          }}
                        />
                      </motion.span>
                    )
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }
  function SimLeads({ isActive, progress, color }: SimProps) {
    const fields = [
      { label: 'Nombre', value: 'Carlos Mendoza', icon: User },
      { label: 'WhatsApp', value: '+54 381 555-1234', icon: Phone },
      { label: 'Servicio', value: 'Consulta de precios', icon: MessageSquare },
    ];

    const fieldThresholds = [0, 0.12, 0.24];
    const showButton = progress > 0.38;
    const submitted = progress > 0.5;
    const showWhatsApp = progress > 0.62;
    const showIA = progress > 0.8;
    const leadEvents = [
      { label: 'Lead capturado', detail: 'Formulario validado', threshold: 0.52, Icon: CheckCircle },
      { label: 'WhatsApp enviado', detail: 'Aviso instantáneo al equipo', threshold: 0.62, Icon: MessageSquare },
      { label: 'IA clasificó intención', detail: 'Consulta de precios · alta prioridad', threshold: 0.72, Icon: Bot },
      { label: 'Equipo notificado', detail: 'Comercial asignado', threshold: 0.82, Icon: Users },
      { label: 'Seguimiento programado', detail: 'Recordatorio en 24hs', threshold: 0.9, Icon: Clock },
    ];

    return (
      <div
        style={{
          height: '100%',
          minHeight: 0,
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>
              FORMULARIO DE CONTACTO
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>Captura automática · 24/7</div>
          </div>
          <div
            style={{
              fontSize: 9,
              color,
              background: `${color}12`,
              border: `1px solid ${color}25`,
              borderRadius: 6,
              padding: '4px 8px',
              fontWeight: 600,
            }}
          >
            CAPTACIÓN
          </div>
        </div>

        {/* Campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          {fields.map((field, i) => {
            const visible = progress > fieldThresholds[i];
            const charProgress = visible ? Math.min((progress - fieldThresholds[i]) / 0.12, 1) : 0;
            const charCount = Math.floor(charProgress * field.value.length);
            const displayValue = field.value.slice(0, charCount);
            const complete = charCount >= field.value.length;
            const IconComponent = field.icon;

            return visible ? (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: complete ? `${color}08` : 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${complete ? `${color}30` : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10,
                  padding: '9px 12px',
                  transition: 'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              >
                <div
                  style={{
                    color: complete ? color : 'rgba(255,255,255,0.2)',
                    transition: 'color 300ms',
                    flexShrink: 0,
                  }}
                >
                  <IconComponent size={13} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.25)',
                      marginBottom: 2,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {field.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    {displayValue}
                    {!complete && visible && (
                      <motion.span
                        animate={isActive ? { opacity: [1, 0] } : { opacity: 1 }}
                        transition={{ duration: 0.4, repeat: isActive ? Infinity : 0 }}
                        style={{
                          display: 'inline-block',
                          width: 1.5,
                          height: 12,
                          background: color,
                          marginLeft: 1,
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                  </div>
                </div>
                {complete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={10} color="black" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.div>
            ) : null;
          })}
        </div>

        {/* Boton submit */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: submitted ? `linear-gradient(135deg, ${color}30, ${color}15)` : `${color}15`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${submitted ? `${color}50` : `${color}25`}`,
                borderRadius: 10,
                padding: '11px',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: submitted ? color : `${color}80`,
                letterSpacing: '0.1em',
                flexShrink: 0,
                boxShadow: submitted ? `0 0 20px ${color}15` : 'none',
                transition: 'all 400ms ease',
              }}
            >
              {submitted ? '✓ CONSULTA ENVIADA' : 'ENVIANDO...'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flujo operativo */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '8px 9px',
            overflow: 'hidden',
          }}
        >
          {leadEvents.map(({ label, detail, threshold, Icon }, index) => {
            const active = progress > threshold;

            return (
              <motion.div
                key={label}
                initial={false}
                animate={{
                  opacity: active ? 1 : 0.34,
                  scale: active ? 1 : 0.985,
                  borderColor: active ? `${color}28` : 'rgba(255,255,255,0.055)',
                  backgroundColor: active ? `${color}08` : 'rgba(255,255,255,0.018)',
                }}
                transition={{ duration: 0.28, delay: active ? index * 0.025 : 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid rgba(255,255,255,0.055)',
                  borderRadius: 9,
                  padding: '6px 8px',
                  minHeight: 0,
                }}
              >
                <motion.div
                  animate={{
                    backgroundColor: active ? color : 'rgba(255,255,255,0.08)',
                    color: active ? '#020617' : 'rgba(255,255,255,0.28)',
                    boxShadow: active ? `0 0 12px ${color}30` : 'none',
                  }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={12} strokeWidth={2.2} />
                </motion.div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 750,
                      color: active ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.34)',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: active ? 'rgba(255,255,255,0.46)' : 'rgba(255,255,255,0.22)',
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {detail}
                  </div>
                </div>
                {active && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: `${color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={10} color={color} strokeWidth={3} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          <AnimatePresence>
            {(showWhatsApp || showIA) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 9,
                  padding: '7px 9px',
                  background: showIA ? `${color}10` : 'rgba(37,211,102,0.08)',
                  border: `1px solid ${showIA ? `${color}28` : 'rgba(37,211,102,0.22)'}`,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: showIA ? color : '#25D366', lineHeight: 1.2 }}>
                    {showIA ? 'IA → Carlos Mendoza' : 'WhatsApp → Tu equipo'}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.48)',
                      lineHeight: 1.28,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {showIA
                      ? 'Respuesta lista y seguimiento activo'
                      : '"Nueva consulta: Carlos Mendoza — Precios"'}
                  </div>
                </div>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.32)', fontWeight: 700 }}>ahora</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
  function SimMaps({ isActive, progress, color }: SimProps) {
    const showGrid = progress > 0.1;
    const showCompetitors = progress > 0.1;
    const showClient = progress > 0.5;
    const showPanel = progress > 0.5;

    const competitors = [
  // ZONA 1 - noroeste / arriba izquierda, sin tapar “San Miguel”
  { x: '4%', y: '19%', rank: '#2', rating: '3.8', delay: 0.10 },
  { x: '14%', y: '1%', rank: '#3', rating: '3.6', delay: 0.18 },
  { x: '11%', y: '22%', rank: '#4', rating: '3.4', delay: 0.30 },

  // ZONA 2 - norte centro, por encima del texto grande
  { x: '36%', y: '2%', rank: '#2', rating: '3.9', delay: 0.22 },
  { x: '40%', y: '10%', rank: '#3', rating: '3.7', delay: 0.34 },
  { x: '30%', y: '35%', rank: '#4', rating: '3.5', delay: 0.42 },

  // ZONA 3 - norte derecha
  { x: '65%', y: '12%', rank: '#2', rating: '3.8', delay: 0.14 },
  { x: '80%', y: '22%', rank: '#3', rating: '3.6', delay: 0.26 },
  { x: '60%', y: '37%', rank: '#4', rating: '3.4', delay: 0.38 },

  // ZONA 4 - oeste medio / Villa Luján, evitando tapar texto
  { x: '15%', y: '53%', rank: '#2', rating: '3.7', delay: 0.20 },
  { x: '25%', y: '42%', rank: '#3', rating: '3.5', delay: 0.32 },
  { x: '31%', y: '59%', rank: '#4', rating: '3.3', delay: 0.44 },

  // ZONA 5 - este medio / Villa 9 de Julio, separados del texto
  { x: '90%', y: '30%', rank: '#2', rating: '3.8', delay: 0.16 },
  { x: '86%', y: '47%', rank: '#3', rating: '3.6', delay: 0.28 },
  { x: '94%', y: '48%', rank: '#4', rating: '3.4', delay: 0.40 },

  // ZONA 6 - sudoeste / abajo izquierda
  { x: '9%', y: '72%', rank: '#2', rating: '3.6', delay: 0.24 },
  { x: '18%', y: '82%', rank: '#3', rating: '3.4', delay: 0.36 },
  { x: '26%', y: '74%', rank: '#4', rating: '3.2', delay: 0.46 },

  // ZONA 7 - sur centro, sin tapar “Centro”
  { x: '43%', y: '78%', rank: '#2', rating: '3.7', delay: 0.33 },
  { x: '59%', y: '81%', rank: '#3', rating: '3.5', delay: 0.41 },
  { x: '70%', y: '80%', rank: '#4', rating: '3.3', delay: 0.47 },

  // ZONA 8 - sudeste / Parque 9 de Julio, evitando tapar el texto grande
  { x: '83%', y: '82%', rank: '#2', rating: '3.6', delay: 0.12 },
  { x: '84%', y: '64%', rank: '#3', rating: '3.4', delay: 0.25 },
  { x: '94%', y: '82%', rank: '#4', rating: '3.2', delay: 0.35 },

  // ZONA TU EMPRESA - aparecen últimos antes del #1
  { x: '50%', y: '50%', rank: '#2', rating: '3.6', delay: 0.455 },
  { x: '74%', y: '63%', rank: '#3', rating: '3.4', delay: 0.465 },
  { x: '50%', y: '64%', rank: '#4', rating: '3.2', delay: 0.475 },
  { x: '65%', y: '66%', rank: '#5', rating: '3.0', delay: 0.485 },
];
    const primaryMapMarker = { left: '62%', top: '60%' };
    const gridZones = [
      { left: '30%', top: '10%', rank: '#3', active: true },
      { left: '10%', top: '10%', rank: '#4', active: true },
      { left: '53%', top: '12%', rank: '#4', active: true },
      { left: '68%', top: '31%', rank: '#2', active: true },
      { left: '27%', top: '52%', rank: '#2', active: true },
      { left: '90%', top: '60%', rank: '#2', active: true },
      { left: '90%', top: '40%', rank: '#3', active: true },
      { left: '15%', top: '74%', rank: '#4', active: true },
      { left: '50%', top: '80%', rank: '#2', active: true },
    ];

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>
              GOOGLE MAPS · LOCAL
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>Tucumán, Argentina</div>
          </div>
          <div
            style={{
              fontSize: 9,
              color,
              background: `${color}12`,
              border: `1px solid ${color}25`,
              borderRadius: 6,
              padding: '4px 8px',
              fontWeight: 600,
            }}
          >
            PRIMERA POSICIÓN
          </div>
        </div>

        {/* írea mapa + panel lateral */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) 122px',
            gap: 10,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Mapa */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Grid del mapa */}
            {showGrid && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                  backgroundSize: '26px 26px',
                }}
              />
            )}

            {showGrid && (
              <motion.div
                initial={{ opacity: 0, scale: 1.025 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                }}
              >
                <Image
                  src="/maps/tucuman-googlemaps.png"
                  alt="Mapa real de Tucumán"
                  fill
                  sizes="420px"
                  priority={false}
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    opacity: 0.68,
                    filter: 'saturate(0.72) contrast(1.08) brightness(0.64)',
                    transform: 'scale(1.03)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      `radial-gradient(circle at ${primaryMapMarker.left} ${primaryMapMarker.top}, ${color}26, transparent 0 24%), linear-gradient(180deg, rgba(2,6,23,0.22), rgba(2,6,23,0.48))`,
                    mixBlendMode: 'screen',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(135deg, rgba(2,6,23,0.18), rgba(2,6,23,0.02) 42%, rgba(2,6,23,0.36)), radial-gradient(circle at 50% 50%, transparent 0 45%, rgba(0,0,0,0.30) 100%)',
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>
            )}

            {showGrid &&
              gridZones.map((zone, index) => (
                <motion.div
                  key={`${zone.left}-${zone.top}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: zone.active ? 1 : 0.45, scale: 1 }}
                  transition={{ duration: 0.35, delay: index * 0.025 }}
                  style={{
                    position: 'absolute',
                    left: zone.left,
                    top: zone.top,
                    width: 36,
                    height: 30,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: 9,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 800,
                    color: zone.active ? color : 'rgba(255,255,255,0.22)',
                    background: zone.active ? `${color}12` : 'rgba(255,255,255,0.035)',
                    border: `1px solid ${zone.active ? `${color}35` : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {zone.rank}
                </motion.div>
              ))}

            {/* Pins competidores */}
            {showCompetitors &&
              competitors.map(
                (comp, i) =>
                  progress > comp.delay && (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      style={{
                        position: 'absolute',
                        left: comp.x,
                        top: comp.y,
                        transform: 'translate(-50%, -100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                        zIndex: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50% 50% 50% 0',
                          transform: 'rotate(-45deg)',
                          background: 'rgba(148,163,184,0.22)',
                          border: '1px solid rgba(203,213,225,0.18)',
                          backdropFilter: 'blur(8px)',
                        }}
                      />
                      <div
                        style={{
                          display: 'none',
                          background: 'rgba(20,20,20,0.9)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 5,
                          padding: '2px 5px',
                          fontSize: 9,
                          color: 'rgba(255,255,255,0.36)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {comp.rank} · {comp.rating}
                      </div>
                      <div
                        style={{
                          background: 'rgba(15,23,42,0.86)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 6,
                          padding: '2px 6px',
                          fontSize: 9,
                          fontWeight: 800,
                          color: 'rgba(255,255,255,0.46)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {comp.rank}
                      </div>
                      <div
                        style={{
                          display: 'none',
                          background: 'rgba(20,20,20,0.85)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 5,
                          padding: '2px 5px',
                          fontSize: 9,
                          color: 'rgba(255,255,255,0.35)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {comp.rating} ⭐
                      </div>
                    </motion.div>
                  )
              )}

            {/* Pin cliente DESTACADO */}
            {showClient && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                style={{
                  position: 'absolute',
                  left: primaryMapMarker.left,
                  top: primaryMapMarker.top,
                  width: 0,
                  height: 0,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                }}
              >
                {/* Anillos */}
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    animate={{
                      scale: [1, 2.2 + ring * 0.62],
                      opacity: [0.38, 0],
                    }}
                    transition={{
                      duration: 2.6,
                      delay: ring * 0.42,
                      repeat: isActive ? Infinity : 0,
                      ease: 'easeOut',
                    }}
                    style={{
                      position: 'absolute',
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      border: `1px solid ${color}`,
                      top: -15,
                      left: -15,
                      transform: 'translate(-50%, -45%)',
                      pointerEvents: 'none',
                    }}
                  />
                ))}

                {/* Zona ranking principal */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 50,
                    height: 38,
                    borderRadius: 12,
                    transform: 'translate(-50%, -50%)',
                    background: `linear-gradient(135deg, ${color}24, ${color}10)`,
                    boxShadow: `0 0 26px ${color}24, inset 0 1px 0 rgba(255,255,255,0.20)`,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: '0 6px 5px 0',
                    border: `1px solid ${color}70`,
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 900, color, lineHeight: 1, textShadow: `0 0 14px ${color}66` }}>
                    #1
                  </span>
                </div>

                {/* Pin */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 2,
                    width: 30,
                    height: 40,
                    transform: 'translate(-50%, -100%)',
                    filter: `drop-shadow(0 0 18px ${color}55) drop-shadow(0 5px 10px rgba(0,0,0,0.55))`,
                    pointerEvents: 'none',
                  }}
                >
                  <svg viewBox="0 0 30 40" width="30" height="40" aria-hidden="true">
                    <path
                      d="M15 38C15 38 26 25.6 26 15.2C26 8.6 21.08 3.5 15 3.5C8.92 3.5 4 8.6 4 15.2C4 25.6 15 38 15 38Z"
                      fill="rgba(2,6,23,0.96)"
                      stroke={color}
                      strokeWidth="1.4"
                    />
                    <circle cx="15" cy="15.5" r="5.6" fill={color} />
                    <circle cx="15" cy="15.5" r="2.4" fill="#020617" opacity="0.88" />
                  </svg>
                </div>

                {/* Label */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, type: 'spring' }}
                  style={{
                    position: 'absolute',
                    left: 42,
                    top: -18,
                    transform: 'translateY(-50%)',
                    background: 'rgba(2,6,23,0.88)',
                    backdropFilter: 'blur(8px)',
                    color,
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: `1px solid ${color}35`,
                    whiteSpace: 'nowrap',
                    boxShadow: `0 2px 12px rgba(0,0,0,0.36), 0 0 14px ${color}1F`,
                    letterSpacing: '0.03em',
                  }}
                >
                  TU EMPRESA
                </motion.div>
              </motion.div>
            )}

            {showClient && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  bottom: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 6,
                  zIndex: 6,
                }}
              >
                {[
                  ['7/9', 'zonas top 3'],
                  ['+41%', 'llamadas'],
                  ['5.0', 'rating'],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    style={{
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(0,0,0,0.34)',
                      padding: '5px 6px',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div style={{ color, fontSize: 12, fontWeight: 800, lineHeight: 1 }}>{value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 9, marginTop: 3, whiteSpace: 'nowrap' }}>{label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Panel lateral */}
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                minWidth: 0,
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${color}20`,
                borderRadius: 12,
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                minHeight: 0,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  borderRadius: 10,
                  border: `1px solid ${color}22`,
                  background: `${color}0C`,
                  padding: '8px',
                }}
              >
                <div style={{ fontSize: 9, color, marginBottom: 4, letterSpacing: '0.08em', fontWeight: 700 }}>
                  POSICIÓN LOCAL
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>TOP</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.42)' }}>en tu zona</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>REPUTACIÓN</span>
                  <span style={{ color, fontSize: 13, fontWeight: 800 }}>5.0</span>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} style={{ width: 7, height: 7, borderRadius: 2, background: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.28)' }} />
                  ))}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.36)' }}>47 reseñas activas</div>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {[
                ['Perfil completo', '100%'],
                ['Web conectada', 'OK'],
                ['WhatsApp visible', 'OK'],
              ].map((item, i) => (
                <motion.div
                  key={item[0]}
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.25 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.46)' }}>{item[0]}</span>
                  <span style={{ fontSize: 9, color, fontWeight: 800 }}>{item[1]}</span>
                </motion.div>
              ))}

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              <div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.24)', marginBottom: 5, letterSpacing: '0.08em' }}>
                  VS COMPETENCIA
                </div>
                {[
                  { label: 'Reseñas', you: '47', them: '8' },
                  { label: 'Rating', you: '5.0', them: '3.4' },
                  { label: 'Top 3', you: '7/9', them: '2/9' },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.32)' }}>{item.label}</span>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color, fontWeight: 700 }}>{item.you}</span>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)' }}>vs</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.24)' }}>{item.them}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {/* Qué muestra el mapa + métricas (llena el panel hasta abajo) */}
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: 10,
                  border: `1px solid ${color}22`,
                  background: `${color}0C`,
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 9, color, marginBottom: 4, letterSpacing: '0.08em', fontWeight: 700 }}>
                    QUÉ MUESTRA
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                    Posicionamiento de tu negocio por zona, por encima de la competencia local.
                  </div>
                </div>
                
              </div>

              <div style={{ display: 'none' }}>
              {/* Rating principal */}
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.25)',
                    marginBottom: 4,
                    letterSpacing: '0.06em',
                  }}
                >
                  TU EMPRESA
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 3 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>5.0</span>
                </div>
                <div>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} style={{ fontSize: 10, color: '#f59e0b' }}>

                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>47 reseñas</div>
              </div>

              {/* Separador */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {/* Checkmarks */}
              {['Fotos', 'Horarios', 'Web', 'WhatsApp'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{item}</span>
                  <span style={{ fontSize: 10, color }}>✓</span>
                </motion.div>
              ))}

              {/* Separador */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {/* VS competencia */}
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.2)',
                    marginBottom: 5,
                    letterSpacing: '0.08em',
                  }}
                >
                  VS COMPETENCIA
                </div>
                {[
                  { label: 'Reseñas', you: '47', them: '8' },
                  { label: 'Rating', you: '5.0', them: '3.1' },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{item.label}</span>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color, fontWeight: 700 }}>{item.you}</span>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>vs</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{item.them}</span>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }
  const renderPlaceholderScene = ({
    color,
    helper,
    isActive,
    progress,
    title,
    values,
  }: SimProps & {
    title: string;
    helper: string;
    values: Array<{ label: string; value: string }>;
  }) => (
    <div
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 12px',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            Web simulation
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.92)',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </span>
        </div>

        <div
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            border: `1px solid ${color}32`,
            background: `${color}14`,
            color,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {isActive ? `Loop ${Math.round(progress * 100)}%` : 'En espera'}
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          background:
            'linear-gradient(180deg, rgba(7,10,16,0.92) 0%, rgba(5,7,11,0.86) 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 22% 16%, ${color}22 0%, transparent 34%), radial-gradient(circle at 78% 78%, ${service.accent}14 0%, transparent 32%)`,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(transparent 0%, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '100% 28px',
            opacity: 0.16,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '28px 100%',
            opacity: 0.14,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            height: '100%',
            display: 'grid',
            gridTemplateRows: 'auto auto 1fr',
            gap: 12,
            padding: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 16px ${color}80`,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.54)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Proximo sprint
              </span>
            </div>

            <span
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.28)',
              }}
            >
              {helper}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            {values.map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '10px 10px 12px',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.32)',
                    marginBottom: 8,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              alignContent: 'end',
              gap: 10,
            }}
          >
            {[88, 72, 64, 79].map((width, index) => (
              <div key={index} style={{ display: 'grid', gap: 6 }}>
                <div
                  style={{
                    height: 8,
                    width: `${width}%`,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)',
                  }}
                />
                <div
                  style={{
                    height: 2,
                    width: `${40 + index * 15}%`,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.06)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <motion.div
          animate={{
            opacity: isActive ? [0.18, 0.34, 0.18] : 0.1,
            scaleX: isActive ? [0.98, 1, 0.98] : 1,
          }}
          transition={{
            duration: 2.2,
            repeat: isActive ? Infinity : 0,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            bottom: 12,
            height: 3,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
            transformOrigin: 'center',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${color}, ${service.accent})`,
              transition: 'none',
            }}
          />
        </motion.div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 10,
          fontSize: 11,
          color: 'rgba(255,255,255,0.34)',
          paddingInline: 2,
        }}
      >
        <span>{isInView ? 'Autoplay habilitado por viewport' : 'Autoplay pausado fuera de viewport'}</span>
        <span>{activeSimulation.duration / 1000}s loop</span>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: 6,
        overflow: 'hidden',
        background: `radial-gradient(circle at top, ${service.accent}12 0%, rgba(9,13,19,0.96) 42%, rgba(4,6,10,1) 100%)`,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '0 8px 8px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.34)',
            }}
          >
            develOP web
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            Lo que tu sitio hace por vos, en vivo
          </span>
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.36)',
              lineHeight: 1.35,
            }}
          >
            Cada función trabajando mientras dormís
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <ServiceDemoPauseButton
            isPaused={isPaused}
            onToggle={togglePause}
            color={activeSimulation.color}
          />
          <motion.div
            animate={{
              background: isInView && !isPaused ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
              borderColor: isInView && !isPaused ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)',
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              border: '1px solid',
              borderRadius: 100,
              padding: '3px 8px',
              whiteSpace: 'nowrap',
            }}
          >
            <motion.div
              animate={{
                background: isInView && !isPaused ? '#10b981' : 'rgba(255,255,255,0.2)',
                boxShadow: isInView && !isPaused ? '0 0 6px #10b981' : 'none',
              }}
              style={{ width: 5, height: 5, borderRadius: '50%' }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: isInView && !isPaused ? '#10b981' : 'rgba(255,255,255,0.25)',
              }}
            >
              {isInView && !isPaused ? 'ACTIVO' : 'PAUSADO'}
            </span>
          </motion.div>
        </div>
      </div>

      <div
        onMouseLeave={() => setHoveredWebTab(null)}
        onPointerLeave={() => setHoveredWebTab(null)}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
          padding: '0 0 8px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        {webSimulations.map((sim, index) => {
          const isActive = index === activeTab;
          const isVisual = index === visualWebTab;

          return (
            <button
              key={sim.id}
              type="button"
              onClick={() => handleTabClick(index)}
              onPointerEnter={() => setHoveredWebTab(index)}
              onFocus={() => setHoveredWebTab(index)}
              onBlur={() => setHoveredWebTab(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                padding: '8px 4px 7px',
                background: isVisual ? `${sim.color}10` : 'transparent',
                border: `1px solid ${isVisual ? `${sim.color}30` : 'transparent'}`,
                borderRadius: 10,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 200ms ease',
              }}
            >
              {isVisual && (
                <motion.div
                  layoutId="tabGlow"
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 0%, ${sim.color}15, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              <div
                style={{
                  color: isVisual ? sim.color : 'rgba(255,255,255,0.2)',
                  transition: 'color 200ms',
                  position: 'relative',
                }}
              >
                {sim.icon}
              </div>

              <span
                style={{
                  fontSize: 9,
                  fontWeight: isVisual ? 600 : 400,
                  color: isVisual ? sim.color : 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.04em',
                  position: 'relative',
                  transition: 'color 200ms',
                  whiteSpace: 'nowrap',
                }}
              >
                {sim.label}
              </span>

              {isVisual && (
                <motion.div
                  layoutId="webTabIndicator"
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: 2,
                    width: isActive ? `${progress * 100}%` : '100%',
                    background: `linear-gradient(90deg, ${sim.color}80, ${sim.color})`,
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              )}

              {!isActive && index < activeTab && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.025)',
          padding: 6,
          minHeight: 0,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ height: '100%' }}
          >
            {activeTab === 0
              ? SimSEO({
                isActive: isInView,
                progress: animationProgress,
                color: activeSimulation.color,
              })
              : activeTab === 1
                ? SimAnalytics({
                  isActive: isInView,
                  progress: animationProgress,
                  color: activeSimulation.color,
                })
                : activeTab === 2
                  ? SimLeads({
                    isActive: isInView,
                    progress: animationProgress,
                    color: activeSimulation.color,
                  })
                  : activeTab === 3
                    ? SimMaps({
                      isActive: isInView,
                      progress: animationProgress,
                      color: activeSimulation.color,
                    })
                    : activePlaceholder &&
                    renderPlaceholderScene({
                      isActive: isInView,
                      progress: animationProgress,
                      color: activeSimulation.color,
                      title: activePlaceholder.title,
                      helper: activePlaceholder.helper,
                      values: activePlaceholder.values,
                    })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const AI_COLOR = '#10b981';

type AISimulation = {
  id: number;
  label: string;
  icon: LucideIcon;
  duration: number;
  color: string;
};

const AI_SIMULATIONS: AISimulation[] = [
  { id: 1, label: 'Chat IA', icon: MessageSquare, duration: 8500, color: AI_COLOR },
  { id: 2, label: 'Leads', icon: Target, duration: 6200, color: AI_COLOR },
  { id: 3, label: 'Agenda', icon: Calendar, duration: 8000, color: AI_COLOR },
  { id: 4, label: 'Métricas', icon: BarChart2, duration: 5200, color: AI_COLOR },
];

function AIScene({ service }: { service: Service }) {
  void service;

  type SimProps = { isActive: boolean; progress: number; color: string };

  function SimChat({ isActive, progress, color }: SimProps) {
    const clientMsg1 = '¡Hola! ¿Tienen la Toyota Hilux 4x4 disponible? ¿Cuánto sale?';
    const botMsg1 =
      '¡Hola! Sí, tenemos 2 Hilux 4x4 disponibles:\n• AT Full: $47.500 USD\n• MT SR: $43.200 USD\nPuedo mostrarte fotos o simular financiación.';
    const clientMsg2 = 'Me interesa la AT Full. Tienen financiación?';
    const botMsg2 =
      'Sí. Hay 3 opciones disponibles. También puedo agendarte un test drive esta semana.';
    const clientMsg3 = 'Perfecto, jueves a la mañana.';
    const botMsg3 = 'Listo. Te reservé jueves 11:00 y avisé al equipo comercial.';
    const clientMsg4 = 'Genial, ¿me pasás la dirección?';
    const botMsg4 = 'Te la envié por WhatsApp 📍 Te esperamos el jueves a las 11. ¡Buen día!';

    const showHeader = progress > 0.06;
    const client1Length =
      progress > 0.1 ? Math.floor(Math.min((progress - 0.1) / 0.12, 1) * clientMsg1.length) : 0;
    const showTyping = progress > 0.24 && progress < 0.32;
    const bot1Length = progress > 0.32 ? Math.floor(Math.min((progress - 0.32) / 0.16, 1) * botMsg1.length) : 0;
    const client2Length =
      progress > 0.5 ? Math.floor(Math.min((progress - 0.5) / 0.06, 1) * clientMsg2.length) : 0;
    const bot2Length = progress > 0.57 ? Math.floor(Math.min((progress - 0.57) / 0.09, 1) * botMsg2.length) : 0;
    const client3Length =
      progress > 0.68 ? Math.floor(Math.min((progress - 0.68) / 0.05, 1) * clientMsg3.length) : 0;
    const bot3Length = progress > 0.74 ? Math.floor(Math.min((progress - 0.74) / 0.09, 1) * botMsg3.length) : 0;
    const client4Length =
      progress > 0.84 ? Math.floor(Math.min((progress - 0.84) / 0.04, 1) * clientMsg4.length) : 0;
    const bot4Length = progress > 0.89 ? Math.floor(Math.min((progress - 0.89) / 0.06, 1) * botMsg4.length) : 0;
    const showTimeBadge = progress > 0.5;

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          padding: '4px 2px',
        }}
      >
        {/* Header del chat */}
        {showHeader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              marginBottom: 8,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: `${color}20`,
                border: `1px solid ${color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={15} color={color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                Agente develOP
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <motion.div
                  animate={isActive ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
                  transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                  style={{ width: 5, height: 5, borderRadius: '50%', background: '#25D366' }}
                />
                En línea · Responde al instante
              </div>
            </div>
            <div
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.05em',
              }}
            >
              WhatsApp
            </div>
          </motion.div>
        )}

        {/* Mensajes */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 3,
            overflowY: 'hidden',
          }}
        >
          {/* Cliente msg 1 */}
          {client1Length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ alignSelf: 'flex-end', maxWidth: '82%' }}
            >
              <div
                style={{
                  background: `${color}20`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${color}25`,
                  borderRadius: '12px 12px 2px 12px',
                  padding: '6px 9px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.45,
                }}
              >
                {clientMsg1.slice(0, client1Length)}
                {client1Length < clientMsg1.length && (
                  <motion.span
                    animate={isActive ? { opacity: [1, 0] } : { opacity: 1 }}
                    transition={{ duration: 0.4, repeat: isActive ? Infinity : 0 }}
                    style={{
                      display: 'inline-block',
                      width: 1.5,
                      height: 11,
                      background: color,
                      marginLeft: 2,
                      verticalAlign: 'middle',
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.2)',
                  textAlign: 'right',
                  marginTop: 2,
                  paddingRight: 4,
                }}
              >
                22:47
              </div>
            </motion.div>
          )}

          {/* Typing indicator */}
          <AnimatePresence>
            {showTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px 12px 12px 2px',
                  padding: '9px 14px',
                  display: 'flex',
                  gap: 4,
                  alignItems: 'center',
                }}
              >
                {[0, 0.18, 0.36].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={isActive ? { y: [0, -4, 0] } : { y: 0 }}
                    transition={{ duration: 0.55, delay, repeat: isActive ? Infinity : 0 }}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: color,
                      opacity: 0.7,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bot msg 1 */}
          {bot1Length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ alignSelf: 'flex-start', maxWidth: '88%' }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '12px 12px 12px 2px',
                  padding: '6px 9px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.35,
                  whiteSpace: 'pre-line',
                }}
              >
                {botMsg1.slice(0, bot1Length)}
                {bot1Length < botMsg1.length && (
                  <motion.span
                    animate={isActive ? { opacity: [1, 0] } : { opacity: 1 }}
                    transition={{ duration: 0.4, repeat: isActive ? Infinity : 0 }}
                    style={{
                      display: 'inline-block',
                      width: 1.5,
                      height: 11,
                      background: 'rgba(255,255,255,0.4)',
                      marginLeft: 2,
                      verticalAlign: 'middle',
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.2)',
                  marginTop: 2,
                  paddingLeft: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                22:47 · IA
                {showTimeBadge && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      background: `${color}20`,
                      border: `1px solid ${color}30`,
                      borderRadius: 100,
                      padding: '1px 6px',
                      color,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Clock size={10} color={color} strokeWidth={2} style={{ flexShrink: 0 }} />
                    1.8s
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}

          {/* Cliente msg 2 */}
          {client2Length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ alignSelf: 'flex-end', maxWidth: '82%' }}
            >
              <div
                style={{
                  background: `${color}20`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${color}25`,
                  borderRadius: '12px 12px 2px 12px',
                  padding: '6px 9px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.45,
                }}
              >
                {clientMsg2.slice(0, client2Length)}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.2)',
                  textAlign: 'right',
                  marginTop: 2,
                  paddingRight: 4,
                }}
              >
                22:49
              </div>
            </motion.div>
          )}

          {/* Bot msg 2 */}
          {bot2Length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ alignSelf: 'flex-start', maxWidth: '88%' }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '12px 12px 12px 2px',
                  padding: '6px 9px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.4,
                }}
              >
                {botMsg2.slice(0, bot2Length)}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.2)',
                  marginTop: 2,
                  paddingLeft: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                22:49 · IA
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: `${color}20`,
                    border: `1px solid ${color}30`,
                    borderRadius: 100,
                    padding: '1px 6px',
                    color,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Clock size={10} color={color} strokeWidth={2} style={{ flexShrink: 0 }} />
                  2.1s
                </motion.span>
              </div>
            </motion.div>
          )}

          {client3Length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ alignSelf: 'flex-end', maxWidth: '82%' }}
            >
              <div
                style={{
                  background: `${color}20`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${color}25`,
                  borderRadius: '12px 12px 2px 12px',
                  padding: '7px 10px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.4,
                }}
              >
                {clientMsg3.slice(0, client3Length)}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.2)',
                  textAlign: 'right',
                  marginTop: 2,
                  paddingRight: 4,
                }}
              >
                22:50
              </div>
            </motion.div>
          )}

          {bot3Length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ alignSelf: 'flex-start', maxWidth: '88%' }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '12px 12px 12px 2px',
                  padding: '7px 10px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.82)',
                  lineHeight: 1.42,
                }}
              >
                {botMsg3.slice(0, bot3Length)}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.2)',
                  marginTop: 2,
                  paddingLeft: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                22:50 · IA
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: `${color}20`,
                    border: `1px solid ${color}30`,
                    borderRadius: 100,
                    padding: '1px 6px',
                    color,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Clock size={10} color={color} strokeWidth={2} style={{ flexShrink: 0 }} />
                  1.5s
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* Cliente msg 4 */}
          {client4Length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ alignSelf: 'flex-end', maxWidth: '82%' }}
            >
              <div
                style={{
                  background: `${color}20`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${color}25`,
                  borderRadius: '12px 12px 2px 12px',
                  padding: '7px 10px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.4,
                }}
              >
                {clientMsg4.slice(0, client4Length)}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.2)',
                  textAlign: 'right',
                  marginTop: 2,
                  paddingRight: 4,
                }}
              >
                22:51
              </div>
            </motion.div>
          )}

          {/* Bot msg 4 */}
          {bot4Length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ alignSelf: 'flex-start', maxWidth: '88%' }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '12px 12px 12px 2px',
                  padding: '7px 10px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.82)',
                  lineHeight: 1.42,
                }}
              >
                {botMsg4.slice(0, bot4Length)}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.2)',
                  marginTop: 2,
                  paddingLeft: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                22:51 · IA
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: `${color}20`,
                    border: `1px solid ${color}30`,
                    borderRadius: 100,
                    padding: '1px 6px',
                    color,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Clock size={10} color={color} strokeWidth={2} style={{ flexShrink: 0 }} />
                  1.7s
                </motion.span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  function SimLeadsIA({ isActive, progress, color }: SimProps) {
    void isActive;

    const leads = [
      {
        name: 'Carlos M.',
        msg: 'Quiero comprar una Hilux esta semana, tengo efectivo',
        score: 94,
        label: 'CALIENTE',
        labelColor: '#10b981',
        delay: 0.12,
      },
      {
        name: 'Ana García',
        msg: 'Me gustaría saber los precios de las camionetas',
        score: 61,
        label: 'TIBIO',
        labelColor: '#f59e0b',
        delay: 0.17,
      },
      {
        name: 'Juan P.',
        msg: 'Solo estoy viendo opciones por ahora',
        score: 22,
        label: 'FRÍO',
        labelColor: '#6b7280',
        delay: 0.22,
      },
      {
        name: 'Sofía R.',
        msg: 'Necesito financiar una unidad para mi empresa',
        score: 82,
        label: 'CALIENTE',
        labelColor: '#10b981',
        delay: 0.27,
      },
      {
        name: 'Martín L.',
        msg: 'Quiero comparar planes antes de decidir',
        score: 48,
        label: 'TIBIO',
        labelColor: '#f59e0b',
        delay: 0.32,
      },
    ];

    const scoreProgress = Math.max(0, Math.min((progress - 0.48) / 0.22, 1));
    const analyzing = progress > 0.42 && progress < 0.7;
    const classified = progress > 0.7;
    const showSummary = progress > 0.82;

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 2,
              }}
            >
              {'CALIFICACIÓN AUTOMÁTICA'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>
              IA analizando intención de compra
            </div>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              fontSize: 10,
              color,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 6px ${color}`,
              }}
            />
            PROCESANDO
          </motion.div>
        </div>

        {/* Lista de leads */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            flex: 1,
            minHeight: 0,
            justifyContent: 'flex-end',
          }}
        >
          {leads.map((lead) => {
            const visible = progress > lead.delay;

            return visible ? (
              <motion.div
                key={lead.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  background: classified ? `${lead.labelColor}08` : 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${classified ? `${lead.labelColor}25` : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 10,
                  padding: '7px 10px',
                  transition: 'all 500ms ease',
                  minHeight: 0,
                }}
              >
                {/* Fila superior: nombre + badge */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: classified ? `${lead.labelColor}20` : 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        transition: 'background 400ms',
                      }}
                    >
                      {lead.name.charAt(0)}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      {lead.name}
                    </span>
                  </div>

                  {/* Badge de clasificación */}
                  <AnimatePresence>
                    {classified && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          background: `${lead.labelColor}15`,
                          border: `1px solid ${lead.labelColor}30`,
                          borderRadius: 100,
                          padding: '3px 8px',
                        }}
                      >
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: lead.labelColor,
                            boxShadow: `0 0 6px ${lead.labelColor}`,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: lead.labelColor,
                            letterSpacing: '0.08em',
                          }}
                        >
                          {lead.label}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mensaje del lead */}
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.3,
                    marginBottom: analyzing || classified ? 6 : 0,
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {`"${lead.msg}"`}
                </div>

                {/* Barra de análisis */}
                {(analyzing || classified) && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
                        {classified ? 'SCORE FINAL' : 'ANALIZANDO...'}
                      </span>
                      {classified && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: lead.labelColor,
                          }}
                        >
                          {lead.score}/100
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        height: 3,
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 100,
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        animate={{
                            width: `${scoreProgress * lead.score}%`,
                        }}
                        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          height: '100%',
                          background: classified
                            ? lead.labelColor
                            : `linear-gradient(90deg, ${color}80, ${color})`,
                          borderRadius: 100,
                          boxShadow: classified ? `0 0 8px ${lead.labelColor}60` : 'none',
                          transition: 'background 400ms, box-shadow 400ms',
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null;
          })}
        </div>

        {/* Resumen final */}
        <AnimatePresence>
          {showSummary && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
                flexShrink: 0,
              }}
            >
              {[
                { label: 'CALIENTES', count: '2', color: '#10b981' },
                { label: 'TIBIOS', count: '2', color: '#f59e0b' },
                { label: 'FRÍOS', count: '1', color: '#6b7280' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08, type: 'spring' }}
                  style={{
                    background: `${item.color}08`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${item.color}20`,
                    borderRadius: 8,
                    padding: '6px 8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, color: item.color, lineHeight: 1 }}>
                    {item.count}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.25)',
                      marginTop: 2,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  function SimAgenda({ isActive, progress, color }: SimProps) {
    void isActive;

    const clientMsg = '¡Hola! Quisiera sacar un turno para ver un auto esta semana';
    const botMsg =
      '¡Perfecto! Tengo disponibilidad:\n📅 Martes 14hs\n📅 Jueves 11hs\n📅 Viernes 16hs\n¿Cuál te queda mejor?';
    const clientConfirm = 'El jueves a las 11hs perfecto';
    const botConfirm =
      '✅ ¡Listo! Turno confirmado para el Jueves a las 11hs. Te mando el recordatorio 24hs antes 📲';
    const client2 = '¿Necesito llevar algo para el test drive?';
    const botConfirm2 =
      'Solo tu DNI y licencia de conducir vigente 🚗 Te espero el jueves en la concesionaria. Te envié la ubicación por WhatsApp ✅';

    const showHeader = progress > 0.06;
    const clientLength =
      progress > 0.1 ? Math.floor(Math.min((progress - 0.1) / 0.14, 1) * clientMsg.length) : 0;
    const botLength = progress > 0.26 ? Math.floor(Math.min((progress - 0.26) / 0.14, 1) * botMsg.length) : 0;
    const confirmLength =
      progress > 0.42 ? Math.floor(Math.min((progress - 0.42) / 0.1, 1) * clientConfirm.length) : 0;
    const botConfirmLength =
      progress > 0.54 ? Math.floor(Math.min((progress - 0.54) / 0.14, 1) * botConfirm.length) : 0;
    const client2Length =
      progress > 0.7 ? Math.floor(Math.min((progress - 0.7) / 0.08, 1) * client2.length) : 0;
    const botConfirm2Length =
      progress > 0.8 ? Math.floor(Math.min((progress - 0.8) / 0.14, 1) * botConfirm2.length) : 0;
    const calendarFilled = progress > 0.58;
    const showEventDetail = progress > 0.66;
    const showSyncNotes = progress > 0.74;
    const showNext = progress > 0.9;
    const showStats = progress > 0.06;
    const agendaChecks = [
      'Recordatorio enviado',
      'Calendario sincronizado',
      'Cliente confirmado',
      'Sin intervención humana',
    ];

    const days = ['L', 'M', 'X', 'J', 'V'];
    const bookedDay = 3;

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        {/* Header */}
        {showHeader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: 2,
                }}
              >
                AGENDA AUTOMÁTICA
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>Sin intervención humana</div>
            </div>
            <div
              style={{
                fontSize: 9,
                color,
                background: `${color}12`,
                border: `1px solid ${color}25`,
                borderRadius: 6,
                padding: '4px 8px',
                fontWeight: 600,
              }}
            >
              IA ACTIVA
            </div>
          </motion.div>
        )}

        {/* Layout: chat izquierda + mini calendario derecha */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 160px',
            gap: 10,
            minHeight: 0,
          }}
        >
          {/* Chat */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: 7,
              overflow: 'hidden',
            }}
          >
            {/* Cliente */}
            {clientLength > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ alignSelf: 'flex-end', maxWidth: '90%' }}
              >
                <div
                  style={{
                    background: `${color}18`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${color}25`,
                    borderRadius: '10px 10px 2px 10px',
                    padding: '6px 9px',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.45,
                  }}
                >
                  {clientMsg.slice(0, clientLength)}
                  {clientLength < clientMsg.length && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.4, repeat: Infinity }}
                      style={{
                        display: 'inline-block',
                        width: 1.5,
                        height: 10,
                        background: color,
                        marginLeft: 2,
                        verticalAlign: 'middle',
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.2)',
                    textAlign: 'right',
                    marginTop: 2,
                    paddingRight: 4,
                  }}
                >
                  09:15
                </div>
              </motion.div>
            )}

            {/* Bot respuesta */}
            {botLength > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ alignSelf: 'flex-start', maxWidth: '95%' }}
              >
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '10px 10px 10px 2px',
                    padding: '6px 9px',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {botMsg.slice(0, botLength)}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.2)',
                    marginTop: 2,
                    paddingLeft: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  09:15 · IA
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      background: `${color}20`,
                      border: `1px solid ${color}30`,
                      borderRadius: 100,
                      padding: '1px 6px',
                      color,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Clock size={10} color={color} strokeWidth={2} style={{ flexShrink: 0 }} />
                    1.6s
                  </motion.span>
                </div>
              </motion.div>
            )}

            {/* Cliente confirma */}
            {confirmLength > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ alignSelf: 'flex-end', maxWidth: '90%' }}
              >
                <div
                  style={{
                    background: `${color}18`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${color}25`,
                    borderRadius: '10px 10px 2px 10px',
                    padding: '6px 9px',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {clientConfirm.slice(0, confirmLength)}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.2)',
                    textAlign: 'right',
                    marginTop: 2,
                    paddingRight: 4,
                  }}
                >
                  09:16
                </div>
              </motion.div>
            )}

            {/* Bot confirma */}
            {botConfirmLength > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ alignSelf: 'flex-start', maxWidth: '95%' }}
              >
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '10px 10px 10px 2px',
                    padding: '6px 9px',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1.45,
                  }}
                >
                  {botConfirm.slice(0, botConfirmLength)}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.2)',
                    marginTop: 2,
                    paddingLeft: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  09:16 · IA
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      background: `${color}20`,
                      border: `1px solid ${color}30`,
                      borderRadius: 100,
                      padding: '1px 6px',
                      color,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Clock size={10} color={color} strokeWidth={2} style={{ flexShrink: 0 }} />
                    1.3s
                  </motion.span>
                </div>
              </motion.div>
            )}

            {/* Cliente pregunta extra */}
            {client2Length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ alignSelf: 'flex-end', maxWidth: '90%' }}
              >
                <div
                  style={{
                    background: `${color}18`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${color}25`,
                    borderRadius: '10px 10px 2px 10px',
                    padding: '6px 9px',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.45,
                  }}
                >
                  {client2.slice(0, client2Length)}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.2)',
                    textAlign: 'right',
                    marginTop: 2,
                    paddingRight: 4,
                  }}
                >
                  09:17
                </div>
              </motion.div>
            )}

            {/* Bot cierre */}
            {botConfirm2Length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ alignSelf: 'flex-start', maxWidth: '95%' }}
              >
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '10px 10px 10px 2px',
                    padding: '6px 9px',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1.45,
                  }}
                >
                  {botConfirm2.slice(0, botConfirm2Length)}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.2)',
                    marginTop: 2,
                    paddingLeft: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  09:17 · IA
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      background: `${color}20`,
                      border: `1px solid ${color}30`,
                      borderRadius: 100,
                      padding: '1px 6px',
                      color,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Clock size={10} color={color} strokeWidth={2} style={{ flexShrink: 0 }} />
                    1.9s
                  </motion.span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Mini calendario */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
              minHeight: 0,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '7px',
              }}
            >
              {/* Mes */}
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.4)',
                  textAlign: 'center',
                  marginBottom: 8,
                  letterSpacing: '0.06em',
                }}
              >
                ESTA SEMANA
              </div>

              {/* Mini-stats */}
              {showStats && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                    Turnos hoy <strong style={{ color, fontWeight: 700 }}>5</strong>
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                    Confirmados <strong style={{ color, fontWeight: 700 }}>4</strong>
                  </span>
                </motion.div>
              )}

              {/* Días */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 20px)',
                  gap: 3,
                  justifyContent: 'center',
                }}
              >
                {days.map((day, index) => {
                  const isBooked = index === bookedDay && calendarFilled;
                  return (
                    <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{day}</span>
                      <motion.div
                        animate={{
                          background: isBooked ? color : 'rgba(255,255,255,0.05)',
                          border: isBooked ? `1px solid ${color}50` : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: isBooked ? `0 0 10px ${color}40` : 'none',
                        }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                          width: 20,
                          height: 22,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isBooked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            <Check size={10} color="black" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detalle del evento */}
            <AnimatePresence>
              {showEventDetail && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: `${color}10`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${color}25`,
                    borderRadius: 10,
                    padding: '8px 9px',
                  }}
                >
                  <div style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 5, letterSpacing: '0.08em' }}>
                    CONFIRMADO
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 600,
                      marginBottom: 3,
                      lineHeight: 1.25,
                    }}
                  >
                    Jueves · 11:00hs
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Test Drive · Carlos M.</div>
                  <div style={{ fontSize: 9, color: `${color}75`, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Bell size={10} color={`${color}75`} strokeWidth={2} style={{ flexShrink: 0 }} />
                    Recordatorio programado
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSyncNotes && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                    padding: '7px',
                  }}
                >
                  {agendaChecks.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.22 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        minWidth: 0,
                      }}
                    >
                      <CheckCircle size={12} color={color} strokeWidth={2.4} style={{ flexShrink: 0 }} />
                      <span
                        style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.46)',
                          lineHeight: 1.25,
                        }}
                      >
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Próximo turno */}
            <AnimatePresence>
              {showNext && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '8px 9px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.35)',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                    }}
                  >
                    PRÓXIMOS
                  </div>
                  {[
                    { time: 'Viernes · 16:00hs', sub: 'Consulta · Ana R.' },
                    { time: 'Lunes · 10:00hs', sub: 'Entrega · Diego F.' },
                    { time: 'Miércoles · 09:00hs', sub: 'Llamado · Pedro M.' },
                  ].map((next) => (
                    <div key={next.time}>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.7)',
                          fontWeight: 600,
                          marginBottom: 2,
                          lineHeight: 1.25,
                        }}
                      >
                        {next.time}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{next.sub}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  function SimMétricas({ isActive, progress, color }: SimProps) {
    void isActive;

    const totalConsultas = Math.floor(Math.min((progress - 0.15) / 0.35, 1) * 147);
    const respondidas = Math.floor(Math.min((progress - 0.15) / 0.35, 1) * 139);
    const satisfaccion = (Math.min((progress - 0.15) / 0.35, 1) * 97).toFixed(0);

    const showMetrics = progress > 0.15;
    const showComparison = progress > 0.5;
    const showChart = progress > 0.75;

    const chartData = [
      { hour: '8h', value: 0.3 },
      { hour: '10h', value: 0.6 },
      { hour: '12h', value: 0.9 },
      { hour: '14h', value: 0.7 },
      { hour: '16h', value: 1.0 },
      { hour: '18h', value: 0.8 },
      { hour: '20h', value: 0.5 },
      { hour: '22h', value: 0.85 },
    ];

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 2,
              }}
            >
              DASHBOARD DE ATENCIÓN
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>Hoy · Tiempo real</div>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              fontSize: 9,
              color,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 6px ${color}`,
              }}
            />
            LIVE
          </motion.div>
        </div>

        {/* Métricas principales */}
        {showMetrics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
              flexShrink: 0,
            }}
          >
            {[
              { label: 'CONSULTAS', value: totalConsultas.toString(), color },
              { label: 'RESPONDIDAS', value: respondidas.toString(), color: '#10b981' },
              { label: 'SATISFACCIÓN', value: `${satisfaccion}%`, color: '#f59e0b' },
            ].map((metric, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${metric.color}18`,
                  borderRadius: 10,
                  padding: '8px 10px',
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.08em',
                    marginBottom: 4,
                  }}
                >
                  {metric.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: metric.color,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {metric.value}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* COMPARATIVA IA VS HUMANO */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              padding: '10px 12px',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.10em',
                marginBottom: 10,
              }}
            >
              TIEMPO DE RESPUESTA
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              {/* IA */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>
                    1.8s
                  </span>
                  <span style={{ fontSize: 10, color: `${color}80` }}>IA</span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: color,
                    borderRadius: 100,
                    width: '8%',
                    boxShadow: `0 0 8px ${color}60`,
                  }}
                />
              </div>

              {/* VS */}
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.15)',
                  fontWeight: 600,
                  paddingBottom: 10,
                }}
              >
                vs
              </div>

              {/* Humano */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: 'rgba(255,255,255,0.3)',
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    4hs
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.24)' }}>humano</span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 100,
                    width: '100%',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 10,
                color,
                background: `${color}10`,
                border: `1px solid ${color}20`,
                borderRadius: 6,
                padding: '5px 8px',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              8.000× más rápido que un humano
            </div>
          </motion.div>
        )}

        {/* Gráfico de actividad */}
        {showChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              padding: '9px 10px',
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.08em',
                marginBottom: 8,
                flexShrink: 0,
              }}
            >
              ACTIVIDAD HOY
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 4,
                flex: 1,
                minHeight: 78,
              }}
            >
              {chartData.map((bar, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${bar.value * 100}%` }}
                    transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
                    style={{
                      width: '100%',
                      background: bar.value > 0.7 ? color : `${color}50`,
                      borderRadius: '3px 3px 0 0',
                      boxShadow: bar.value > 0.7 ? `0 0 8px ${color}40` : 'none',
                    }}
                  />
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.24)' }}>{bar.hour}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [cycleSeed, setCycleSeed] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => observer.disconnect();
  }, []);

  const advanceAiTab = useCallback(() => {
    setActiveTab((previousTab) => (previousTab + 1) % AI_SIMULATIONS.length);
  }, []);

  const {
    progress,
    animationProgress,
    isPaused,
    togglePause,
    resetCycle,
  } = useServiceDemoCycle({
    activeIndex: activeTab,
    itemCount: AI_SIMULATIONS.length,
    animationDuration: AI_SIMULATIONS[activeTab]?.duration ?? 1,
    isInView,
    cycleSeed,
    onAdvance: advanceAiTab,
  });

  const handleTabClick = (index: number) => {
    resetCycle();
    setActiveTab(index);
    setCycleSeed((currentSeed) => currentSeed + 1);
  };

  const activeSimulation = AI_SIMULATIONS[activeTab];

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: 8,
        gap: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          marginBottom: 8,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: `${AI_COLOR}80`, marginBottom: 4 }}>
          AGENTE IA · EN VIVO
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
          Tu sistema comercial trabajando ahora mismo
        </div>
        </div>
        <ServiceDemoPauseButton
          isPaused={isPaused}
          onToggle={togglePause}
          color={activeSimulation.color}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${AI_SIMULATIONS.length}, 1fr)`,
          gap: 4,
          flexShrink: 0,
        }}
      >
        {AI_SIMULATIONS.map((sim, index) => {
          const isActive = index === activeTab;
          const IconComp = sim.icon;

          return (
            <button
              key={sim.id}
              type="button"
              onClick={() => handleTabClick(index)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '7px 4px',
                borderRadius: 8,
                border: isActive ? `1px solid ${AI_COLOR}30` : '1px solid transparent',
                background: isActive ? `${AI_COLOR}10` : 'transparent',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 200ms ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="aiTabGlow"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 0%, ${AI_COLOR}15, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              <div
                style={{
                  color: isActive ? AI_COLOR : 'rgba(255,255,255,0.2)',
                  transition: 'color 200ms',
                  position: 'relative',
                }}
              >
                <IconComp size={12} strokeWidth={1.8} />
              </div>

              <span
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? AI_COLOR : 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.04em',
                  position: 'relative',
                  transition: 'color 200ms',
                  whiteSpace: 'nowrap',
                }}
              >
                {sim.label}
              </span>

              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: 2,
                    width: `${progress * 100}%`,
                    background: `linear-gradient(90deg, ${AI_COLOR}80, ${AI_COLOR})`,
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              )}

              {!isActive && index < activeTab && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.025)',
          padding: 8,
          minHeight: 0,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ height: '100%' }}
          >
            {activeTab === 0
              ? SimChat({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })
              : activeTab === 1
                ? SimLeadsIA({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })
                : activeTab === 2
                  ? SimAgenda({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })
                  : SimMétricas({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
function AutomationScene({ service }: { service: Service }) {
  void service;

  type AutomationSimulation = {
    id: number;
    label: string;
    icon: LucideIcon;
    duration: number;
    color: string;
  };

  type SimProps = { isActive: boolean; progress: number; color: string };

  const AUTO_COLOR = '#f59e0b';

  const [autoSimulations] = useState<AutomationSimulation[]>(() => [
    { id: 1, label: 'Flujo', icon: GitBranch, duration: 6000, color: AUTO_COLOR },
    { id: 2, label: 'Follow-up', icon: MessageSquare, duration: 8000, color: AUTO_COLOR },
    { id: 3, label: 'Reportes', icon: FileText, duration: 7500, color: AUTO_COLOR },
    { id: 4, label: 'Sync Apps', icon: RefreshCw, duration: 8000, color: AUTO_COLOR },
  ]);

  function SimFlujo({ isActive, progress, color }: SimProps) {
    // Raise endpoints toward the icon circle center. Increase → lines move up; decrease → move down.
    const ICON_CENTER_OFFSET_Y = -3;
    const CONNECTION_BOW = -6;
    const ICON_CENTER_OFFSET_X = -5; // + = líneas a la izquierda · - = a la derecha
    const nodes = [
      { id: 'form', label: 'Formulario', sublabel: 'Web', icon: Globe, nodeColor: '#06b6d4', x: 10, y: 15 },
      { id: 'n8n', label: 'n8n', sublabel: 'Orquesta', icon: Zap, nodeColor: color, x: 42, y: 45 },
      { id: 'whatsapp', label: 'WhatsApp', sublabel: 'Notif.', icon: MessageSquare, nodeColor: '#25D366', x: 74, y: 15 },
      { id: 'crm', label: 'CRM', sublabel: 'Registro', icon: Database, nodeColor: '#8b5cf6', x: 74, y: 72 },
      { id: 'email', label: 'Email', sublabel: 'Trigger', icon: Mail, nodeColor: '#f59e0b', x: 10, y: 72 },
    ] as const;

    const connections = [
      { fromX: 10, fromY: 15, toX: 42, toY: 45, showAt: 0.18, pulseAt: 0.38 },
      { fromX: 10, fromY: 72, toX: 42, toY: 45, showAt: 0.24, pulseAt: 0.42 },
      { fromX: 42, fromY: 45, toX: 74, toY: 15, showAt: 0.32, pulseAt: 0.58 },
      { fromX: 42, fromY: 45, toX: 74, toY: 72, showAt: 0.36, pulseAt: 0.65 },
    ] as const;

    const execCount = Math.floor(Math.max(0, (progress - 0.75) / 0.25) * 23);
    const showCounter = progress > 0.75;
    const n8nActive = progress > 0.45 && progress < 0.78;

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 2px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>FLUJO ACTIVO</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Formulario → n8n → Apps</div>
          </div>
          {showCounter && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 9, color, background: `${color}12`, border: `1px solid ${color}25`, borderRadius: 6, padding: '4px 8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: isActive ? Infinity : 0 }} style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
              {execCount} hoy
            </motion.div>
          )}
        </div>

        {/* Canvas del flujo */}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
          {/* SVG de conexiones */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
            {connections.map((conn, index) => {
              const visible = progress > conn.showAt;
              const pulseProgress = progress > conn.pulseAt ? Math.min((progress - conn.pulseAt) / 0.15, 1) : 0;

              // Offset endpoints toward icon circle — does not affect node positioning
              const afy = conn.fromY - ICON_CENTER_OFFSET_Y;
              const aty = conn.toY - ICON_CENTER_OFFSET_Y;
              const afx = conn.fromX - ICON_CENTER_OFFSET_X;
              const atx = conn.toX - ICON_CENTER_OFFSET_X;

              // Perpendicular bow (direction vector uses raw delta — offset cancels)
              const dx = conn.toX - conn.fromX;
              const dy = conn.toY - conn.fromY;
              const len = Math.hypot(dx, dy) || 1;
              const mx = (afx + atx) / 2 + (-dy / len) * CONNECTION_BOW;
              const my = (afy + aty) / 2 + (dx / len) * CONNECTION_BOW;

              // 6-point bezier sampling for pulse trajectory
              const bezier = (a: number, c: number, b: number, t: number): number =>
                (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
              const ts = [0, 0.2, 0.4, 0.6, 0.8, 1];
              const cxs = ts.map((t) => bezier(afx, mx, atx, t));
              const cys = ts.map((t) => bezier(afy, my, aty, t));

              return visible ? (
                <g key={index}>
                  <motion.path d={`M ${afx} ${afy} Q ${mx} ${my} ${atx} ${aty}`} stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" fill="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease: 'easeOut' }} />
                  {pulseProgress > 0 && (
                    <motion.circle r="1.2" fill={progress > conn.pulseAt + 0.08 ? color : '#06b6d4'} filter={`drop-shadow(0 0 2px ${color})`} animate={{ cx: cxs, cy: cys, opacity: [0, 1, 1, 1, 1, 0] }} transition={{ duration: 0.8, repeat: isActive ? Infinity : 0, delay: index * 0.2, ease: 'easeInOut' }} />
                  )}
                </g>
              ) : null;
            })}
          </svg>

          {/* Nodos */}
          {nodes.map((node, index) => {
            const nodeVisible = progress > index * 0.06;
            const nodeActive = progress > 0.45 && (node.id === 'n8n' ? n8nActive : node.id === 'whatsapp' ? progress > 0.58 : node.id === 'crm' ? progress > 0.65 : progress > 0.35);
            const IconComp = node.icon;

            return nodeVisible ? (
              <motion.div key={node.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15, delay: index * 0.05 }} style={{ position: 'absolute', left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -16px)', width: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
                  {nodeActive && (
                    <motion.div animate={{ scale: [1, 1.8], opacity: [0.5, 0] }} transition={{ duration: 1.2, repeat: isActive ? Infinity : 0 }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${node.nodeColor}` }} />
                  )}
                  <motion.div animate={{ background: nodeActive ? `${node.nodeColor}25` : 'rgba(255,255,255,0.05)', borderColor: nodeActive ? `${node.nodeColor}50` : 'rgba(255,255,255,0.10)', boxShadow: nodeActive ? `0 0 16px ${node.nodeColor}30` : 'none' }} transition={{ duration: 0.4 }} style={{ position: 'relative', width: 32, height: 32, borderRadius: '50%', backdropFilter: 'blur(20px)', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={13} color={nodeActive ? node.nodeColor : 'rgba(255,255,255,0.3)'} strokeWidth={1.5} />
                  </motion.div>
                </div>
                {/* Label */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: nodeActive ? node.nodeColor : 'rgba(255,255,255,0.35)', transition: 'color 400ms', whiteSpace: 'nowrap' }}>{node.label}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>{node.sublabel}</div>
                </div>
              </motion.div>
            ) : null;
          })}
        </div>
      </div>
    );
  }

  function SimFollowUp({ isActive, progress, color }: SimProps) {
    const events = [
      {
        time: 'Lun 10:32',
        label: 'Consulta recibida',
        detail: 'María pregunta por precios del servicio',
        icon: MessageSquare,
        iconColor: '#06b6d4',
        showAt: 0.08,
        type: 'client',
      },
      {
        time: 'Mar 10:30',
        label: '24hs sin respuesta',
        detail: 'Sistema detecta silencio del lead',
        icon: Clock,
        iconColor: '#f59e0b',
        showAt: 0.17,
        type: 'system',
      },
      {
        time: 'Mar 10:31',
        label: 'Follow-up automático enviado',
        detail: 'Mensaje personalizado por WhatsApp',
        icon: Zap,
        iconColor: color,
        showAt: 0.27,
        type: 'auto',
      },
      {
        time: 'Mar 11:15',
        label: 'Cliente responde',
        detail: '"¡Sí! Me interesa, ¿cuándo hablamos?"',
        icon: MessageSquare,
        iconColor: '#10b981',
        showAt: 0.40,
        type: 'client',
      },
      {
        time: 'Mar 11:15',
        label: 'IA detecta intención',
        detail: 'Intención de compra: alta',
        icon: Bot,
        iconColor: color,
        showAt: 0.48,
        type: 'system',
      },
      {
        time: 'Mar 11:16',
        label: 'Lead reactivado',
        detail: 'Movido al pipeline activo',
        icon: RefreshCw,
        iconColor: '#f59e0b',
        showAt: 0.55,
        type: 'auto',
      },
      {
        time: 'Mar 11:16',
        label: 'Vendedor notificado',
        detail: 'Alerta enviada a Martín G.',
        icon: User,
        iconColor: color,
        showAt: 0.63,
        type: 'system',
      },
      {
        time: 'Mar 11:17',
        label: 'Registro actualizado en CRM',
        detail: 'Ficha y etapa sincronizadas',
        icon: Database,
        iconColor: '#8b5cf6',
        showAt: 0.71,
        type: 'system',
      },
      {
        time: 'Mar 11:47',
        label: 'Deal cerrado',
        detail: 'Turno agendado · Conversión 94%',
        icon: CheckCircle,
        iconColor: '#10b981',
        showAt: 0.82,
        type: 'success',
      },
    ] as const;

    const showStat = progress > 0.9;

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 2,
              }}
            >
              SEGUIMIENTO automático
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Ningún lead se pierde</div>
          </div>
          <div
            style={{
              fontSize: 9,
              color,
              background: `${color}12`,
              border: `1px solid ${color}25`,
              borderRadius: 6,
              padding: '4px 8px',
              fontWeight: 600,
            }}
          >
            AUTO
          </div>
        </div>

        {/* Timeline */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 7,
            position: 'relative',
          }}
        >
          {/* Línea vertical del timeline */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: 6,
              bottom: 6,
              width: 1,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            }}
          />

          {events.map((event, index) => {
            const visible = progress > event.showAt;
            const IconComp = event.icon;
            const isSuccess = event.type === 'success';
            const isAuto = event.type === 'auto';

            return visible ? (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  display: 'flex',
                  gap: 9,
                  position: 'relative',
                }}
              >
                {/* ícono del nodo */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: `${event.iconColor}15`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${event.iconColor}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isSuccess || isAuto ? `0 0 12px ${event.iconColor}30` : 'none',
                    zIndex: 1,
                  }}
                >
                  <IconComp size={12} color={event.iconColor} strokeWidth={1.5} />
                </div>

                {/* Contenido */}
                <div
                  style={{
                    flex: 1,
                    background: isAuto
                      ? `${color}08`
                      : isSuccess
                        ? 'rgba(16,185,129,0.06)'
                        : 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isAuto ? `${color}20` : isSuccess ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)'
                      }`,
                    borderRadius: 8,
                    padding: '5px 9px',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: isAuto ? color : isSuccess ? '#10b981' : 'rgba(255,255,255,0.75)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                      }}
                    >
                      {event.label}
                    </span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{event.time}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.4)',
                      lineHeight: 1.25,
                      fontStyle: event.type === 'client' ? 'italic' : 'normal',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {event.detail}
                  </div>
                </div>
              </motion.div>
            ) : null;
          })}
        </div>

        {/* Stat final */}
        {showStat && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: `${color}10`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${color}25`,
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
              Leads recuperados con follow-up automático
            </span>
            <motion.span
              animate={isActive ? { opacity: [0.85, 1, 0.85] } : { opacity: 1 }}
              transition={{ duration: 1.2, repeat: isActive ? Infinity : 0 }}
              style={{ fontSize: 16, fontWeight: 800, color }}
            >
              68%
            </motion.span>
          </motion.div>
        )}
      </div>
    );
  }

  function SimReporte({ isActive, progress, color }: SimProps) {
    void isActive;

    const dataItems = [
      { label: 'Ventas del mes', value: '$47.200', icon: '', readAt: 0.18 },
      { label: 'Nuevos clientes', value: '23', icon: '', readAt: 0.23 },
      { label: 'Consultas totales', value: '147', icon: '', readAt: 0.28 },
      { label: 'Tasa de cierre', value: '34%', icon: '', readAt: 0.33 },
    ] as const;

    const showClock = progress > 0.05;
    const showDataCollection = progress > 0.15;
    // El anillo llega a 100% en ~0.46 y se MANTIENE hasta que aparece el reporte (0.55),
    // dando ~0.7-0.9s de hold visible en 100% antes de la transición.
    const generateProgress = progress > 0.34 ? Math.min((progress - 0.34) / 0.12, 1) : 0;
    const showReport = progress > 0.55;
    const showSent = progress > 0.75;

    // Loader circular (anillo SVG con strokeDashoffset).
    const ringR = 40;
    const ringC = 2 * Math.PI * ringR;

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        {/* Header con reloj */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 2,
              }}
            >
              REPORTE automático
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Cada lunes · 8:00 AM</div>
          </div>
          {showClock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color,
                background: `${color}12`,
                border: `1px solid ${color}25`,
                borderRadius: 6,
                padding: '4px 10px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Lun 08:00
            </motion.div>
          )}
        </div>

        {/* Recolección de datos */}
        {showDataCollection && !showReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              padding: '10px 12px',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: 10, flexShrink: 0 }}>
              RECOLECTANDO DATOS...
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
              {dataItems.map((item) =>
                progress > item.readAt ? (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: `${color}08`,
                      border: `1px solid ${color}15`,
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12 }}>{item.icon}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{item.value}</span>
                  </motion.div>
                ) : null
              )}
            </div>

            {/* Loader circular de generación (ocupa el espacio sobrante) */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <div style={{ position: 'relative', width: 100, height: 100 }}>
                <svg width={100} height={100} viewBox="0 0 100 100" style={{ display: 'block' }}>
                  <circle cx={50} cy={50} r={ringR} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={9} />
                  <motion.circle
                    cx={50}
                    cy={50}
                    r={ringR}
                    fill="none"
                    stroke={color}
                    strokeWidth={9}
                    strokeLinecap="round"
                    strokeDasharray={ringC}
                    animate={{ strokeDashoffset: ringC * (1 - generateProgress) }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    transform="rotate(-90 50 50)"
                    style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 800,
                    color,
                    letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Math.floor(generateProgress * 100)}%
                </div>
              </div>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
                {generateProgress > 0 ? 'GENERANDO REPORTE...' : 'PREPARANDO...'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Preview del reporte */}
        {showReport && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${color}20`,
              borderRadius: 10,
              padding: '10px 12px',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Header del reporte */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Reporte Semanal</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                  Semana del 14 al 20 de Abril
                </div>
              </div>
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: `${color}15`,
                  border: `1px solid ${color}25`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={13} color={color} />
              </div>
            </div>

            {/* Métricas del reporte */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {dataItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.08 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 8,
                    padding: '7px 8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>
                    {item.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{item.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Mejor canal + mini-tendencia */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: '6px 9px',
                flexShrink: 0,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 2, letterSpacing: '0.06em' }}>
                  CANAL CON MEJOR RENDIMIENTO
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>WhatsApp · 62%</div>
              </div>
              <svg width={48} height={20} viewBox="0 0 48 20" style={{ flexShrink: 0 }}>
                <motion.polyline
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  points="0,16 9,13 18,14 27,8 36,9 45,3"
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Recomendación IA (ocupa el alto sobrante) */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                background: `${color}08`,
                border: `1px solid ${color}20`,
                borderRadius: 8,
                padding: '8px 10px',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={13} color={color} strokeWidth={1.5} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, color, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>
                  RECOMENDACIÓN IA
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>
                  Reforzar campañas de WhatsApp: +18% de conversión proyectada.
                </div>
              </div>
            </div>

            {/* Próximo reporte + destinatarios */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Próximo reporte · Lun 21 Abr 08:00</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>3 destinatarios</span>
            </div>
          </motion.div>
        )}

        {/* Notificación enviado */}
        {showSent && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(37,211,102,0.07)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(37,211,102,0.20)',
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                background: 'rgba(37,211,102,0.15)',
                border: '1px solid rgba(37,211,102,0.25)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Mail size={13} color="#25D366" />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#25D366', marginBottom: 2 }}>
                Enviado al equipo directivo
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>3 destinatarios · hace un momento</div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  function SimSync({ isActive, progress, color }: SimProps) {
    const showForm = progress > 0.05;
    const syncing = progress > 0.2 && progress < 0.38;
    const syncProgress = progress > 0.2 ? Math.min((progress - 0.2) / 0.15, 1) : 0;

    const syncSteps = [
      {
        label: 'CRM actualizado',
        detail: 'Contacto creado: Laura Sánchez',
        icon: Database,
        color: '#8b5cf6',
        showAt: 0.30,
      },
      {
        label: 'Follow-up agendado',
        detail: 'Recordatorio para mañana 10:00hs',
        icon: Calendar,
        color: '#06b6d4',
        showAt: 0.40,
      },
      {
        label: 'Google Calendar sincronizado',
        detail: 'Evento creado en la agenda',
        icon: Calendar,
        color: '#10b981',
        showAt: 0.48,
      },
      {
        label: 'Tag comercial aplicado',
        detail: 'Etiqueta: Lead caliente',
        icon: Target,
        color: color,
        showAt: 0.56,
      },
      {
        label: 'Vendedor notificado',
        detail: 'Alerta enviada a Martín G.',
        icon: User,
        color: color,
        showAt: 0.64,
      },
      {
        label: 'WhatsApp enviado',
        detail: 'Mensaje de bienvenida automático',
        icon: MessageSquare,
        color: '#25D366',
        showAt: 0.72,
      },
      {
        label: 'Tarea creada',
        detail: 'Asignada al equipo comercial',
        icon: CheckCircle,
        color: '#06b6d4',
        showAt: 0.80,
      },
    ] as const;

    const showTime = progress > 0.88;

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 2,
              }}
            >
              SYNC automático
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Formulario → 3 apps en 2 segundos</div>
          </div>
          <div
            style={{
              fontSize: 9,
              color,
              background: `${color}12`,
              border: `1px solid ${color}25`,
              borderRadius: 6,
              padding: '4px 8px',
              fontWeight: 600,
            }}
          >
            EN VIVO
          </div>
        </div>

        {/* Formulario origen */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '10px 12px',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', marginBottom: 8 }}>
              FORMULARIO WEB · ORIGEN
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { label: 'Nombre', value: 'Laura Sanchez' },
                { label: 'WhatsApp', value: '+54 381 444-5678' },
                { label: 'Interes', value: 'Presupuesto web' },
                { label: 'Empresa', value: 'Clinica Norte' },
              ].map((field) => (
                <div
                  key={field.label}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 6,
                    padding: '5px 8px',
                  }}
                >
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>
                    {field.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{field.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Barra de sync */}
        {syncProgress > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
                {syncing ? 'SINCRONIZANDO...' : 'COMPLETADO'}
              </span>
              <span style={{ fontSize: 9, color, fontWeight: 600 }}>{Math.floor(syncProgress * 100)}%</span>
            </div>
            <div
              style={{
                height: 3,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 100,
                overflow: 'hidden',
              }}
            >
              <motion.div
                animate={{ width: `${syncProgress * 100}%` }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${color}80, ${color})`,
                  borderRadius: 100,
                  boxShadow: `0 0 8px ${color}50`,
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Steps completados */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 6,
          }}
        >
          {syncSteps.map((step) => {
            const visible = progress > step.showAt;
            const IconComp = step.icon;
            return visible ? (
              <motion.div
                key={step.label}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: `${step.color}08`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${step.color}20`,
                  borderRadius: 9,
                  padding: '5px 9px',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    background: `${step.color}15`,
                    border: `1px solid ${step.color}25`,
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComp size={12} color={step.color} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: step.color,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.4)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {step.detail}
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={9} color="black" strokeWidth={3} />
                </motion.div>
              </motion.div>
            ) : null;
          })}
        </div>

        {/* Tiempo total */}
        {showTime && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              background: `${color}10`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${color}25`,
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>3 apps sincronizadas en</span>
            <motion.span
              animate={isActive ? { opacity: [0.9, 1, 0.9] } : { opacity: 1 }}
              transition={{ duration: 1.1, repeat: isActive ? Infinity : 0 }}
              style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: '-0.02em' }}
            >
              2.3s
            </motion.span>
          </motion.div>
        )}
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [cycleSeed, setCycleSeed] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => observer.disconnect();
  }, []);

  const advanceAutoTab = useCallback(() => {
    setActiveTab((previousTab) => (previousTab + 1) % autoSimulations.length);
  }, [autoSimulations.length]);

  const {
    progress,
    animationProgress,
    isPaused,
    togglePause,
    resetCycle,
  } = useServiceDemoCycle({
    activeIndex: activeTab,
    itemCount: autoSimulations.length,
    animationDuration: autoSimulations[activeTab]?.duration ?? 1,
    isInView,
    cycleSeed,
    onAdvance: advanceAutoTab,
  });

  const handleTabClick = (index: number) => {
    resetCycle();
    setActiveTab(index);
    setCycleSeed((currentSeed) => currentSeed + 1);
  };

  const activeSimulation = autoSimulations[activeTab];

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: 8,
        gap: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          marginBottom: 8,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: `${AUTO_COLOR}80`, marginBottom: 4 }}>
            {'AUTOMATIZACIONES · EN VIVO'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
            Tus procesos corriendo solos ahora mismo
          </div>
        </div>
        <ServiceDemoPauseButton
          isPaused={isPaused}
          onToggle={togglePause}
          color={activeSimulation.color}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${autoSimulations.length}, 1fr)`,
          gap: 4,
          flexShrink: 0,
        }}
      >
        {autoSimulations.map((sim, index) => {
          const isActive = index === activeTab;
          const IconComp = sim.icon;

          return (
            <button
              key={sim.id}
              type="button"
              onClick={() => handleTabClick(index)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '7px 4px',
                borderRadius: 8,
                border: isActive ? `1px solid ${AUTO_COLOR}30` : '1px solid transparent',
                background: isActive ? `${AUTO_COLOR}10` : 'transparent',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 200ms ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="autoTabGlow"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 0%, ${AUTO_COLOR}15, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              <div
                style={{
                  color: isActive ? AUTO_COLOR : 'rgba(255,255,255,0.2)',
                  transition: 'color 200ms',
                  position: 'relative',
                }}
              >
                <IconComp size={12} strokeWidth={1.8} />
              </div>

              <span
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? AUTO_COLOR : 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.04em',
                  position: 'relative',
                  transition: 'color 200ms',
                  whiteSpace: 'nowrap',
                }}
              >
                {sim.label}
              </span>

              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: 2,
                    width: `${progress * 100}%`,
                    background: `linear-gradient(90deg, ${AUTO_COLOR}80, ${AUTO_COLOR})`,
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              )}

              {!isActive && index < activeTab && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.025)',
          padding: 8,
          minHeight: 0,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ height: '100%' }}
          >
            {activeTab === 0
              ? SimFlujo({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })
              : activeTab === 1
                ? SimFollowUp({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })
                : activeTab === 2
                  ? SimReporte({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })
                  : SimSync({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SoftwareScene({ service }: { service: Service }) {
  void service;

  type SoftwareSimulation = {
    id: number;
    label: string;
    icon: LucideIcon;
    duration: number;
    color: string;
  };

  type SimProps = { isActive: boolean; progress: number; color: string };

  const SW_COLOR = '#8b5cf6';

  const [swSimulations] = useState<SoftwareSimulation[]>(() => [
    { id: 1, label: 'CRM', icon: Users, duration: 11000, color: SW_COLOR },
    { id: 2, label: 'Dashboard', icon: BarChart2, duration: 5000, color: SW_COLOR },
    { id: 3, label: 'Stock', icon: Package, duration: 7000, color: SW_COLOR },
    { id: 4, label: 'Equipo', icon: Layers, duration: 6500, color: SW_COLOR },
  ]);

  function SimCRM({ isActive, progress, color }: SimProps) {
    void isActive;

    // Etapas: 0 Nuevos · 1 Propuesta · 2 Negoc. · 3 Cerrado.
    const stages = [
      { label: 'Nuevos', stageColor: '#06b6d4' },
      { label: 'Propuesta', stageColor: '#8b5cf6' },
      { label: 'Negoc.', stageColor: color },
      { label: 'Cerrado', stageColor: '#10b981' },
    ] as const;

    // Modelo data-driven unificado: cada deal es una tarjeta con layoutId propio. `stage0` es su
    // etapa inicial; `moves` son las transiciones (at = umbral de progress, to = etapa destino).
    // Las transiciones pueden ir hacia adelante o hacia atrás (reasignación).
    type CrmMove = { at: number; to: number };
    type CrmDeal = {
      id: string;
      name: string;
      value: number;
      stage0: number;
      enter: number;
      moves: CrmMove[];
      who: string; // iniciales del responsable
      pj: number; // jitter de probabilidad por deal (realismo)
    };

    // Cronograma verificado por simulación (sweep de progress 0→1): pico ≤5 tarjetas por columna
    // en TODO instante (nunca 6 → sin overflow), 5 oleadas con destinos distintos por oleada (sin
    // choque), reasignaciones hacia atrás (taller, spa, optica) y movimiento desde Nuevos. Orden
    // "drenar-antes-de-llenar" dentro de cada oleada. Distribución final ≈ [4,4,5,5] (18 deals).
    const deals: CrmDeal[] = [
      { id: 'clinica', name: 'Clínica Norte', value: 3200, stage0: 0, enter: 0.1, who: 'MG', pj: 5, moves: [{ at: 0.19, to: 1 }, { at: 0.56, to: 2 }] },
      { id: 'consultorio', name: 'Consultorio Norte', value: 2700, stage0: 0, enter: 0.1, who: 'LS', pj: -3, moves: [{ at: 0.31, to: 1 }] },
      { id: 'cafe', name: 'Café Central', value: 1500, stage0: 0, enter: 0.1, who: 'CP', pj: 7, moves: [{ at: 0.55, to: 1 }] },
      { id: 'farmacia', name: 'Farmacia Centro', value: 2100, stage0: 0, enter: 0.1, who: 'SR', pj: -6, moves: [] },
      { id: 'panaderia', name: 'Panadería Sol', value: 1600, stage0: 0, enter: 0.1, who: 'MG', pj: 2, moves: [] },
      { id: 'estetica', name: 'Estética Centro', value: 1900, stage0: 1, enter: 0.1, who: 'LS', pj: 4, moves: [{ at: 0.2, to: 2 }] },
      { id: 'gym', name: 'Gym Evolución', value: 1800, stage0: 1, enter: 0.1, who: 'CP', pj: -5, moves: [{ at: 0.32, to: 2 }] },
      { id: 'taller', name: 'Taller RG', value: 3700, stage0: 1, enter: 0.1, who: 'SR', pj: 6, moves: [{ at: 0.43, to: 2 }, { at: 0.68, to: 1 }] },
      { id: 'optica', name: 'Óptica Visión', value: 2200, stage0: 1, enter: 0.1, who: 'MG', pj: -2, moves: [{ at: 0.57, to: 0 }] },
      { id: 'hotel', name: 'Hotel Jardín', value: 6700, stage0: 2, enter: 0.1, who: 'LS', pj: 3, moves: [{ at: 0.18, to: 3 }] },
      { id: 'auto', name: 'Auto San Miguel', value: 8500, stage0: 2, enter: 0.1, who: 'CP', pj: -4, moves: [{ at: 0.3, to: 3 }] },
      { id: 'distrib', name: 'Distribuidora Sur', value: 5300, stage0: 2, enter: 0.1, who: 'SR', pj: 5, moves: [{ at: 0.42, to: 3 }] },
      { id: 'spa', name: 'Spa Aurora', value: 2800, stage0: 2, enter: 0.1, who: 'MG', pj: -6, moves: [{ at: 0.44, to: 1 }, { at: 0.69, to: 2 }] },
      { id: 'constructora', name: 'Constructora Lima', value: 7400, stage0: 2, enter: 0.1, who: 'LS', pj: 2, moves: [] },
      { id: 'patio', name: 'Rest. El Patio', value: 4100, stage0: 3, enter: 0.1, who: 'CP', pj: 0, moves: [] },
      { id: 'vega', name: 'Inmobiliaria Vega', value: 9200, stage0: 3, enter: 0.1, who: 'SR', pj: 0, moves: [] },
      { id: 'tienda', name: 'Tienda Local', value: 2400, stage0: 0, enter: 0.3, who: 'MG', pj: -3, moves: [] },
      { id: 'logistica', name: 'Logística Andina', value: 6100, stage0: 0, enter: 0.45, who: 'LS', pj: 4, moves: [{ at: 0.8, to: 1 }] },
    ];

    const formatMoney = (n: number): string => `$${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

    // Probabilidad por etapa (Nuevos ~25-40 · Propuesta ~50-65 · Negoc ~70-85 · Cerrado 100).
    const stageProbBase = [33, 58, 78, 100];
    const probOf = (deal: CrmDeal, stageIndex: number): number =>
      stageIndex === 3 ? 100 : Math.max(5, Math.min(99, stageProbBase[stageIndex] + deal.pj));

    // Etapa actual de un deal según progress (null = todavía no visible).
    const stageOf = (deal: CrmDeal): number | null => {
      if (progress < deal.enter) return null;
      let current = deal.stage0;
      for (const move of deal.moves) {
        if (progress >= move.at) current = move.to;
        else break;
      }
      return current;
    };

    // Fade-in al entrar (las tarjetas no se archivan → el board se mantiene denso).
    const opacityOf = (deal: CrmDeal): number => {
      const fadeIn = 0.03;
      if (progress < deal.enter) return 0;
      if (progress < deal.enter + fadeIn) return Math.min(1, (progress - deal.enter) / fadeIn);
      return 1;
    };

    // Una tarjeta recién saltada se eleva por encima del resto durante el vuelo.
    const justMoved = (deal: CrmDeal): boolean =>
      deal.moves.some((move) => progress >= move.at && progress < move.at + 0.04);

    // Subtotal por columna = suma de las tarjetas presentes en esa etapa en este instante.
    const subtotalOf = (stageIndex: number): number =>
      deals.reduce((sum, deal) => (stageOf(deal) === stageIndex ? sum + deal.value : sum), 0);

    // Total del header = suma de todas las tarjetas visibles (== suma de subtotales).
    const grandTotal = formatMoney(
      deals.reduce((sum, deal) => (stageOf(deal) !== null ? sum + deal.value : sum), 0),
    );

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 2,
              }}
            >
              CRM · PIPELINE
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Estado actual de ventas</div>
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color,
              letterSpacing: '-0.02em',
            }}
          >
            {grandTotal}
          </div>
        </div>

        {/* Pipeline */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 5,
          }}
        >
          {stages.map((stage, stageIndex) => (
            <div
              key={stage.label}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
                padding: '7px 5px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Header de columna */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '100%',
                    height: 2,
                    background: stage.stageColor,
                    borderRadius: 100,
                    marginBottom: 5,
                    opacity: 0.6,
                  }}
                />
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: stage.stageColor,
                    letterSpacing: '0.05em',
                  }}
                >
                  {stage.label}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>
                  {formatMoney(subtotalOf(stageIndex))}
                </div>
              </div>

              {/* Tarjetas: layoutId único por deal → Framer anima el reflujo y el vuelo entre
                  columnas. Cada tarjeta se tiñe con el color de su etapa actual. */}
              {deals
                .filter((deal) => stageOf(deal) === stageIndex)
                .map((deal) => (
                  <motion.div
                    key={deal.id}
                    layout
                    layoutId={`deal-${deal.id}`}
                    transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                    style={{
                      position: 'relative',
                      zIndex: justMoved(deal) ? 5 : 1,
                      background: `${stage.stageColor}12`,
                      border: `1px solid ${stage.stageColor}30`,
                      borderRadius: 7,
                      padding: '5px 7px',
                      boxShadow: stageIndex === 3 ? `0 0 10px ${stage.stageColor}20` : 'none',
                      opacity: opacityOf(deal),
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                    }}
                  >
                    {/* Responsable + nombre */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                      <span
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: '50%',
                          background: `${stage.stageColor}22`,
                          border: `1px solid ${stage.stageColor}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 7,
                          fontWeight: 700,
                          color: stage.stageColor,
                          flexShrink: 0,
                        }}
                      >
                        {deal.who}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.82)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                        }}
                      >
                        {deal.name}
                      </span>
                    </div>
                    {/* Valor */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {stageIndex === 3 && (
                        <Check size={10} color={stage.stageColor} strokeWidth={3} style={{ flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 11, fontWeight: 700, color: stage.stageColor }}>
                        {formatMoney(deal.value)}
                      </span>
                    </div>
                    {/* Probabilidad */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div
                        style={{
                          flex: 1,
                          height: 3,
                          minWidth: 0,
                          background: 'rgba(255,255,255,0.08)',
                          borderRadius: 100,
                          overflow: 'hidden',
                        }}
                      >
                        <motion.div
                          animate={{ width: `${probOf(deal, stageIndex)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          style={{ height: '100%', background: stage.stageColor, borderRadius: 100 }}
                        />
                      </div>
                      <span style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                        {probOf(deal, stageIndex)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function SimDashboard({ isActive, progress, color }: SimProps) {
    const metricProgress = Math.min(Math.max((progress - 0.15) / 0.4, 0), 1);

    const kpis = [
      { label: 'REVENUE', value: Math.floor(metricProgress * 47200), color },
      { label: 'CLIENTES', value: Math.floor(metricProgress * 23), color: '#10b981' },
      { label: 'RETENCION', value: Math.floor(metricProgress * 89), color: '#8b5cf6' },
    ] as const;

    const showGraph = progress > 0.4;
    const showAlert = progress > 0.75;

    const barData = [
      { month: 'E', value: 0.55 },
      { month: 'F', value: 0.7 },
      { month: 'M', value: 0.62 },
      { month: 'A', value: 0.85 },
      { month: 'M', value: 0.78 },
      { month: 'J', value: 0.94 },
    ] as const;

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 2,
              }}
            >
              DASHBOARD EJECUTIVO
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Junio 2025 · En tiempo real</div>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
            style={{ fontSize: 9, color, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
          >
            <div
              style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }}
            />
            LIVE
          </motion.div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, flexShrink: 0 }}>
          {/* Revenue */}
          <div
            style={{
              gridColumn: 'span 2',
              background: `${color}08`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${color}20`,
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', marginBottom: 4 }}>
              {kpis[0].label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
              ${kpis[0].value.toLocaleString()}
            </div>
            <div style={{ fontSize: 9, color: '#10b981', marginTop: 3 }}>↑ 18% vs mes anterior</div>
          </div>

          {/* Clientes */}
          <div
            style={{
              background: 'rgba(16,185,129,0.06)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 10,
              padding: '10px 8px',
            }}
          >
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', marginBottom: 4 }}>
              {kpis[1].label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981', lineHeight: 1 }}>{kpis[1].value}</div>
            <div style={{ fontSize: 9, color: 'rgba(16,185,129,0.6)', marginTop: 3 }}>nuevos</div>
          </div>

          {/* Retencion */}
          <div
            style={{
              background: 'rgba(139,92,246,0.06)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: 10,
              padding: '10px 8px',
            }}
          >
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', marginBottom: 4 }}>
              RETEN.
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#8b5cf6', lineHeight: 1 }}>{kpis[2].value}%</div>
            <div style={{ fontSize: 9, color: 'rgba(139,92,246,0.6)', marginTop: 3 }}>clientes</div>
          </div>
        </div>

        {/* Grafico */}
        {showGraph && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', marginBottom: 8, flexShrink: 0 }}>
              REVENUE MENSUAL
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 5,
                flex: 1,
                minHeight: 0,
              }}
            >
              {barData.map((bar, index) => {
                const barProgress = Math.min(Math.max((progress - 0.4 - index * 0.025) / 0.12, 0), 1);
                const isLastBar = index === barData.length - 1;
                return (
                  <div
                    key={`${bar.month}-${index}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <motion.div
                      animate={{ height: `${barProgress * bar.value * 100}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{
                        width: '100%',
                        background: isLastBar ? color : `${color}40`,
                        borderRadius: '3px 3px 0 0',
                        boxShadow: isLastBar ? `0 0 10px ${color}50` : 'none',
                        minHeight: barProgress > 0 ? 2 : 0,
                      }}
                    />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{bar.month}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Alerta */}
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: `${color}10`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${color}25`,
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Meta del mes alcanzada</span>
            <span style={{ fontSize: 16, fontWeight: 800, color }}>94%</span>
          </motion.div>
        )}
      </div>
    );
  }

  function SimStock({ isActive, progress, color }: SimProps) {
    const products = [
      { name: 'Filtro de Aire', stock: 45, min: 10, unit: 'un.', status: 'ok' },
      {
        name: 'Aceite Motor 5W30',
        stock: progress > 0.2 ? 3 : 18,
        min: 15,
        unit: 'lt.',
        status: progress > 0.2 ? 'critical' : 'ok',
      },
      { name: 'Bujías NGK', stock: 28, min: 8, unit: 'un.', status: 'ok' },
      { name: 'Pastillas Freno', stock: 12, min: 10, unit: 'jgo.', status: 'warning' },
    ] as const;

    const showAlert    = progress > 0.2;
    const showOrder    = progress > 0.35;
    const orderProgress = progress > 0.35 ? Math.min((progress - 0.35) / 0.15, 1) : 0;
    const showEmail    = progress > 0.5;
    const showConfirm  = progress > 0.62;
    const showVendor   = progress > 0.72;
    const showResolved = progress > 0.85;

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 2,
              }}
            >
              GESTIÓN DE STOCK
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>Reposición automática activa</div>
          </div>
          {showAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                fontSize: 9,
                color: '#ef4444',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 6,
                padding: '4px 8px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
                style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444' }}
              />
              ALERTA
            </motion.div>
          )}
        </div>

        {/* Tabla de productos */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Header tabla */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: 8,
              padding: '6px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {['PRODUCTO', 'STOCK', 'MÍNIMO'].map((header) => (
              <span key={header} style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
                {header}
              </span>
            ))}
          </div>

          {/* Filas */}
          {products.map((product, index) => {
            const isCritical = product.status === 'critical';
            const isWarning = product.status === 'warning';
            const rowColor = isCritical ? '#ef4444' : isWarning ? color : '#10b981';

            return (
              <motion.div
                key={product.name}
                animate={{
                  background: isCritical ? 'rgba(239,68,68,0.06)' : 'transparent',
                }}
                transition={{ duration: 0.4 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: 8,
                  padding: '6px 12px',
                  borderBottom: index < products.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: rowColor,
                      flexShrink: 0,
                      boxShadow: isCritical ? `0 0 6px ${rowColor}` : 'none',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: isCritical ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
                      fontWeight: isCritical ? 600 : 400,
                    }}
                  >
                    {product.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: rowColor,
                    textAlign: 'right',
                  }}
                >
                  {product.stock} {product.unit}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.25)',
                    textAlign: 'right',
                  }}
                >
                  {product.min}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Flujo automático */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Orden generada */}
          {showOrder && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: `${color}08`,
                border: `1px solid ${color}20`,
                borderRadius: 8,
                padding: '6px 9px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, color }}>Orden automática generada</span>
                <span style={{ fontSize: 9, color: `${color}70` }}>50 lt. Aceite 5W30</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${orderProgress * 100}%` }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    borderRadius: 100,
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Email → Proveedor */}
          {showEmail && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'rgba(37,211,102,0.07)',
                border: '1px solid rgba(37,211,102,0.18)',
                borderRadius: 8,
                padding: '6px 9px',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <Mail size={13} color="#25D366" strokeWidth={1.5} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#25D366', marginBottom: 1 }}>Email → Proveedor</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Orden #1847 enviada · Entrega: 48hs</div>
              </div>
            </motion.div>
          )}

          {/* Proveedor confirmó */}
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'rgba(16,185,129,0.07)',
                border: '1px solid rgba(16,185,129,0.18)',
                borderRadius: 8,
                padding: '6px 9px',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <CheckCircle size={13} color="#10b981" strokeWidth={1.5} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#10b981', marginBottom: 1 }}>Proveedor confirmó</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Entrega confirmada · 24hs</div>
              </div>
            </motion.div>
          )}

          {/* Vendedor notificado */}
          {showVendor && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: `${color}08`,
                border: `1px solid ${color}20`,
                borderRadius: 8,
                padding: '6px 9px',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <User size={13} color={color} strokeWidth={1.5} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color, marginBottom: 1 }}>Vendedor notificado</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Alerta de reposición enviada</div>
              </div>
            </motion.div>
          )}

          {/* Stock crítico resuelto */}
          {showResolved && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: `${color}10`,
                border: `1px solid ${color}25`,
                borderRadius: 8,
                padding: '6px 9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color, marginBottom: 1 }}>Stock crítico resuelto</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Sin intervención humana</div>
              </div>
              <div
                style={{
                  width: 26,
                  height: 26,
                  background: `${color}20`,
                  border: `1px solid ${color}30`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={13} color={color} strokeWidth={2.5} />
              </div>
            </motion.div>
          )}

          {/* Franja-resumen: fila compacta que toma el alto sobrante sin desbordar */}
          {showResolved && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                gap: 8,
              }}
            >
              {[
                { icon: Package, label: 'Órdenes', value: '3', metricColor: color },
                { icon: Clock, label: 'Gestión', value: '0 min', metricColor: '#10b981' },
                { icon: CheckCircle, label: 'Quiebres', value: '5', metricColor: '#10b981' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}
                >
                  <metric.icon size={15} color={metric.metricColor} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: metric.metricColor, letterSpacing: '-0.02em' }}>
                    {metric.value}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.35)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {metric.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  function SimEquipo({ isActive, progress, color }: SimProps) {
    const team = [
      { name: 'Martin G.', role: 'Ventas', avatar: 'MG', memberColor: '#06b6d4', activeAt: 0.08 },
      { name: 'Laura S.', role: 'Operaciones', avatar: 'LS', memberColor: '#8b5cf6', activeAt: 0.14 },
      { name: 'Carlos P.', role: 'Técnico', avatar: 'CP', memberColor: '#10b981', activeAt: 0.2 },
      { name: 'Sofía R.', role: 'Marketing', avatar: 'SR', memberColor: '#f59e0b', activeAt: 0.26 },
    ] as const;

    const activeCount = team.filter((member) => progress > member.activeAt).length;

    const tasks = [
      {
        title: 'Follow-up: 5 leads calientes',
        assignee: 'MG',
        dueColor: '#06b6d4',
        progressVal: progress > 0.16 ? Math.min((progress - 0.16) / 0.28, 1) : 0,
        completedAt: 0.46,
        showAt: 0.16,
        urgent: false,
      },
      {
        title: 'Preparar propuesta Clínica Norte',
        assignee: 'LS',
        dueColor: '#8b5cf6',
        progressVal: progress > 0.24 ? Math.min((progress - 0.24) / 0.5, 1) * 0.6 : 0,
        completedAt: null,
        showAt: 0.24,
        urgent: progress > 0.68,
      },
      {
        title: 'Instalación sistema nuevo cliente',
        assignee: 'CP',
        dueColor: '#10b981',
        progressVal: progress > 0.32 ? Math.min((progress - 0.32) / 0.5, 1) * 0.45 : 0,
        completedAt: null,
        showAt: 0.32,
        urgent: false,
      },
      {
        title: 'Revisar métricas semanales',
        assignee: 'SR',
        dueColor: '#f59e0b',
        progressVal: progress > 0.4 ? Math.min((progress - 0.4) / 0.32, 1) : 0,
        completedAt: 0.78,
        showAt: 0.4,
        urgent: false,
      },
      {
        title: 'Ajustar stock crítico',
        assignee: 'CP',
        dueColor: '#10b981',
        progressVal: progress > 0.5 ? Math.min((progress - 0.5) / 0.4, 1) * 0.35 : 0,
        completedAt: null,
        showAt: 0.5,
        urgent: progress > 0.62,
      },
    ] as const;

    // Distribución de tareas del equipo para el donut (suma 100). Anima por strokeDashoffset.
    type DonutSeg = { label: string; pct: number; segColor: string; start: number; dur: number };
    const donutSegments: DonutSeg[] = [
      { label: 'Completadas', pct: 45, segColor: '#10b981', start: 0.12, dur: 0.18 },
      { label: 'En progreso', pct: 25, segColor: '#3b82f6', start: 0.22, dur: 0.16 },
      { label: 'Urgentes', pct: 18, segColor: '#ef4444', start: 0.32, dur: 0.14 },
      { label: 'Pendientes', pct: 12, segColor: 'rgba(255,255,255,0.28)', start: 0.4, dur: 0.14 },
    ];
    const DONUT_R = 44;
    const DONUT_C = 2 * Math.PI * DONUT_R;
    const donutValue = Math.round(78 * Math.min(progress / 0.45, 1));

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 2,
              }}
            >
              CONTROL DE EQUIPO
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Vista del director · Hoy</div>
          </div>
          <div
            style={{
              fontSize: 9,
              color: '#10b981',
              background: 'rgba(16,185,129,0.10)',
              border: '1px solid rgba(16,185,129,0.20)',
              borderRadius: 6,
              padding: '4px 8px',
              fontWeight: 600,
            }}
          >
            {activeCount} activos
          </div>
        </div>

        {/* Avatares del equipo */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexShrink: 0,
          }}
        >
          {team.map((member) =>
            progress > member.activeAt ? (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  background: `${member.memberColor}08`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${member.memberColor}20`,
                  borderRadius: 8,
                  padding: '6px 7px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: `${member.memberColor}20`,
                    border: `1px solid ${member.memberColor}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 700,
                    color: member.memberColor,
                    flexShrink: 0,
                  }}
                >
                  {member.avatar}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.75)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {member.name}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.3)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {member.role}
                  </div>
                </div>
              </motion.div>
            ) : null
          )}
        </div>

        {/* Tareas */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {tasks.map((task) => {
            const visible = progress > task.showAt;
            const completed = task.completedAt !== null && progress > task.completedAt;
            const isUrgent = task.urgent;

            return visible ? (
              <motion.div
                key={task.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: completed
                    ? 'rgba(16,185,129,0.06)'
                    : isUrgent
                      ? 'rgba(239,68,68,0.06)'
                      : 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${completed ? 'rgba(16,185,129,0.20)' : isUrgent ? 'rgba(239,68,68,0.20)' : 'rgba(255,255,255,0.07)'
                    }`,
                  borderRadius: 8,
                  padding: '6px 10px',
                  transition: 'all 400ms ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: completed ? 'rgba(255,255,255,0.4)' : isUrgent ? '#ef4444' : 'rgba(255,255,255,0.7)',
                      textDecoration: completed ? 'line-through' : 'none',
                      flex: 1,
                      marginRight: 8,
                    }}
                  >
                    {task.title}
                  </span>
                  {completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={9} color="black" strokeWidth={3} />
                    </motion.div>
                  )}
                  {isUrgent && !completed && (
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
                      style={{
                        fontSize: 9,
                        color: '#ef4444',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                      }}
                    >
                      URGENTE
                    </motion.span>
                  )}
                </div>
                <div
                  style={{
                    height: 3,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 100,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(completed ? 1 : task.progressVal) * 100}%`,
                      background: completed ? '#10b981' : isUrgent ? '#ef4444' : task.dueColor,
                      borderRadius: 100,
                      transition: 'width 300ms ease, background 400ms ease',
                    }}
                  />
                </div>
              </motion.div>
            ) : null;
          })}
        </div>

        {/* Donut: distribución de tareas del equipo. Ocupa el alto sobrante. */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            background: `${color}10`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${color}25`,
            borderRadius: 10,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          {/* Donut SVG */}
          <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
            <svg width={104} height={104} viewBox="0 0 104 104" style={{ display: 'block', transform: 'none' }}>
              {/* track */}
              <circle cx={52} cy={52} r={DONUT_R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
              {(() => {
                let acc = 0;
                return donutSegments.map((seg) => {
                  const startFrac = acc;
                  acc += seg.pct / 100;
                  const segLen = (seg.pct / 100) * DONUT_C;
                  const reveal = progress > seg.start ? Math.min((progress - seg.start) / seg.dur, 1) : 0;
                  const dashoffset = DONUT_C - segLen * reveal;
                  const rotate = startFrac * 360 - 90;
                  return (
                    <circle
                      key={seg.label}
                      cx={52}
                      cy={52}
                      r={DONUT_R}
                      fill="none"
                      stroke={seg.segColor}
                      strokeWidth={14}
                      strokeLinecap="butt"
                      strokeDasharray={`${DONUT_C} ${DONUT_C}`}
                      strokeDashoffset={dashoffset}
                      transform={`rotate(${rotate} 52 52)`}
                    />
                  );
                });
              })()}
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0,
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {donutValue}%
              </span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', marginTop: 2 }}>
                Productividad
              </span>
            </div>
          </div>

          {/* Leyenda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            {donutSegments.map((seg) => (
              <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 3,
                    background: seg.segColor,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.6)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {seg.label}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: seg.segColor, marginLeft: 'auto', flexShrink: 0 }}>
                  {seg.pct}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [cycleSeed, setCycleSeed] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => observer.disconnect();
  }, []);

  const advanceSoftwareTab = useCallback(() => {
    setActiveTab((previousTab) => (previousTab + 1) % swSimulations.length);
  }, [swSimulations.length]);

  const {
    progress,
    animationProgress,
    isPaused,
    togglePause,
    resetCycle,
  } = useServiceDemoCycle({
    activeIndex: activeTab,
    itemCount: swSimulations.length,
    animationDuration: swSimulations[activeTab]?.duration ?? 1,
    isInView,
    cycleSeed,
    onAdvance: advanceSoftwareTab,
  });

  const handleTabClick = (index: number) => {
    resetCycle();
    setActiveTab(index);
    setCycleSeed((currentSeed) => currentSeed + 1);
  };

  const activeSimulation = swSimulations[activeTab];

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: 8,
        gap: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          marginBottom: 8,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: `${SW_COLOR}80`, marginBottom: 4 }}>
          {'SOFTWARE · EN VIVO'}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
          Tu empresa bajo control total
        </div>
        </div>
        <ServiceDemoPauseButton
          isPaused={isPaused}
          onToggle={togglePause}
          color={activeSimulation.color}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${swSimulations.length}, 1fr)`,
          gap: 4,
          flexShrink: 0,
        }}
      >
        {swSimulations.map((sim, index) => {
          const isActive = index === activeTab;
          const IconComp = sim.icon;

          return (
            <button
              key={sim.id}
              type="button"
              onClick={() => handleTabClick(index)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '7px 4px',
                borderRadius: 8,
                border: isActive ? `1px solid ${SW_COLOR}30` : '1px solid transparent',
                background: isActive ? `${SW_COLOR}10` : 'transparent',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 200ms ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="swTabGlow"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 0%, ${SW_COLOR}15, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              <div
                style={{
                  color: isActive ? SW_COLOR : 'rgba(255,255,255,0.2)',
                  transition: 'color 200ms',
                  position: 'relative',
                }}
              >
                <IconComp size={12} strokeWidth={1.8} />
              </div>

              <span
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? SW_COLOR : 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.04em',
                  position: 'relative',
                  transition: 'color 200ms',
                  whiteSpace: 'nowrap',
                }}
              >
                {sim.label}
              </span>

              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: 2,
                    width: `${progress * 100}%`,
                    background: `linear-gradient(90deg, ${SW_COLOR}80, ${SW_COLOR})`,
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              )}

              {!isActive && index < activeTab && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.025)',
          padding: 8,
          minHeight: 0,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ height: '100%' }}
          >
            {activeTab === 0
              ? SimCRM({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })
              : activeTab === 1
                ? SimDashboard({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })
                : activeTab === 2
                  ? SimStock({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })
                  : SimEquipo({ isActive: isInView, progress: animationProgress, color: activeSimulation.color })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
function ServiceVisual({ service }: { service: Service }) {
  let scene: ReactNode;

  if (service.id === 1) {
    scene = <WebScene service={service} />;
  } else if (service.id === 2) {
    scene = <AIScene service={service} />;
  } else if (service.id === 3) {
    scene = <AutomationScene service={service} />;
  } else {
    scene = <SoftwareScene service={service} />;
  }

  return <StageFrame service={service}>{scene}</StageFrame>;
}

const SERVICE_IMPACT_ITEMS: Record<number, Array<{ label: string; value: string }>> = {
  1: [
    { label: 'Base', value: 'SEO local' },
    { label: 'Captura', value: 'Form + WhatsApp' },
    { label: 'Carga', value: 'Mobile first' },
  ],
  2: [
    { label: 'Canal', value: 'WhatsApp' },
    { label: 'Filtro', value: 'Leads calificados' },
    { label: 'Agenda', value: 'Turnos listos' },
  ],
  3: [
    { label: 'Flujo', value: 'Apps conectadas' },
    { label: 'Alertas', value: 'Seguimiento activo' },
    { label: 'Reportes', value: 'Envio programado' },
  ],
  4: [
    { label: 'Modulos', value: 'Ventas + stock' },
    { label: 'Datos', value: 'Reportes propios' },
    { label: 'Costo', value: 'Sin licencias' },
  ],
};

function ServiceImpactSnapshot({ service }: { service: Service }) {
  const items = SERVICE_IMPACT_ITEMS[service.id] ?? SERVICE_IMPACT_ITEMS[1];

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.32)',
            }}
          >
            Impacto estimado
          </div>
          <div style={{ marginTop: 4, fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.3 }}>
            {service.metric}
          </div>
        </div>
        <div
          style={{
            height: 8,
            width: 8,
            borderRadius: '50%',
            background: service.accent,
            boxShadow: `0 0 18px ${service.accent}90`,
            flexShrink: 0,
          }}
        />
      </div>

      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              minHeight: 54,
              borderRadius: 8,
              border: `1px solid ${service.accent}24`,
              background: `${service.accent}0B`,
              padding: '9px 10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: `${service.accent}B5`,
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </span>
            <span style={{ fontSize: 10, lineHeight: 1.25, color: 'rgba(255,255,255,0.62)' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceInfoCard({
  service,
  onNavigate,
}: {
  service: Service;
  onNavigate: (href: string) => void;
}) {
  const Icon = service.icon;

  return (
    <motion.article
      data-cursor="hover"
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{
        rest: {
          y: 0,
          borderColor: `${service.accent}24`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 58px rgba(0,0,0,0.32), 0 0 36px ${service.accent}0D`,
        },
        hover: {
          y: -3,
          borderColor: `${service.accent}56`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 30px 70px rgba(0,0,0,0.36), 0 0 72px ${service.accent}24`,
        },
      }}
      transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8,
        border: `1px solid ${service.accent}24`,
        background: `${service.glow}, radial-gradient(circle at 72% 18%, ${service.accent}14, transparent 0 28%), linear-gradient(180deg, ${service.accent}0A, rgba(255,255,255,0.038) 36%, rgba(255,255,255,0.018))`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 58px rgba(0,0,0,0.32), 0 0 36px ${service.accent}0D`,
        padding: 'clamp(1.2rem, 2vw, 1.75rem)',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        willChange: 'transform, box-shadow, border-color',
      }}
    >
      <motion.div
        aria-hidden="true"
        variants={{
          rest: { opacity: 0.5, x: '-22%' },
          hover: { opacity: 1, x: '18%' },
        }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '-45%',
          width: '70%',
          background:
            'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.08) 45%, transparent 78%)',
          pointerEvents: 'none',
          filter: 'blur(10px)',
        }}
      />
      <motion.div
        aria-hidden="true"
        variants={{
          rest: { opacity: 0.4 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.08), transparent 34%), linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.18) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: 0, height: '100%', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ width: 28, height: 1, background: service.accent, flexShrink: 0 }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: service.accent,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {service.tag}
            </span>
          </div>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: `1px solid ${service.accent}36`,
              background: `${service.accent}10`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={16} color={service.accent} strokeWidth={1.7} />
          </div>
        </div>

        <h3
          style={{
            margin: '16px 0 0',
            maxWidth: 520,
            fontSize: 'clamp(1.9rem, 2.45vw, 2.75rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: '#fff',
            whiteSpace: 'pre-line',
            minHeight: '3em',
            maxHeight: '3em',
            overflow: 'hidden',
          }}
        >
          {service.title}
        </h3>

        <p
          style={{
            margin: '14px 0 0',
            maxWidth: 560,
            fontSize: 13,
            lineHeight: 1.48,
            color: 'rgba(255,255,255,0.54)',
            minHeight: '4.44em',
            maxHeight: '4.44em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {service.description}
        </p>

        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gap: 9,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.025)',
            padding: 11,
            flexShrink: 0,
          }}
        >
          {service.outcomes.map((outcome) => (
            <div key={outcome} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span
                style={{
                  width: 19,
                  height: 19,
                  borderRadius: 5,
                  border: `1px solid ${service.accent}34`,
                  background: `${service.accent}12`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={10} color={service.accent} />
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.35, color: 'rgba(255,255,255,0.68)' }}>{outcome}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, flexShrink: 0 }}>
          <ServiceImpactSnapshot service={service} />
        </div>

        <div
          style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, max-content) auto',
            alignItems: 'center',
            justifyContent: 'start',
            columnGap: 12,
            rowGap: 8,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', letterSpacing: '0.12em', paddingTop: 4 }}>
            DESDE
          </span>
          <span
            style={{
              fontSize: 'clamp(1.6rem, 2.35vw, 2.25rem)',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-0.045em',
              lineHeight: 1,
            }}
          >
            {service.price}
          </span>
          <span
            style={{
              fontSize: 10,
              color: service.accent,
              background: `${service.accent}12`,
              border: `1px solid ${service.accent}30`,
              borderRadius: 999,
              padding: '4px 9px',
              fontWeight: 700,
            }}
          >
            {service.timeline}
          </span>
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
          {service.sectors.map((sector) => (
            <span
              key={sector}
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.42)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 6,
                padding: '5px 9px',
                lineHeight: 1,
              }}
            >
              {sector}
            </span>
          ))}
        </div>

        <motion.button
          type="button"
          whileHover={{
            scale: 1.012,
            background: `linear-gradient(135deg, ${service.accent}34, ${service.accent}16)`,
            borderColor: `${service.accent}70`,
            boxShadow: `0 0 34px ${service.accent}24`,
          }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={() => onNavigate(service.href)}
          style={{
            marginTop: 'auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            minHeight: 48,
            padding: '13px 18px',
            borderRadius: 8,
            background: `linear-gradient(135deg, ${service.accent}26, ${service.accent}10)`,
            border: `1px solid ${service.accent}42`,
            color: service.accent,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            boxShadow: `0 0 24px ${service.accent}12`,
            flexShrink: 0,
          }}
        >
          {service.cta}
          <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            -&gt;
          </motion.span>
        </motion.button>
      </div>
    </motion.article>
  );
}

function ServiceDemoPanel({ service }: { service: Service }) {
  return (
    <div
      className="h-[clamp(39rem,78svh,49rem)] overflow-visible lg:h-full"
      style={{ position: 'relative', minHeight: 0, maxHeight: '100%', perspective: 1400, borderRadius: 16 }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '8% -8% 4%',
          background: `radial-gradient(ellipse at center, ${service.accent}18, transparent 62%)`,
          filter: 'blur(24px)',
          opacity: 0.8,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '8%',
          right: '8%',
          bottom: 8,
          height: 34,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${service.accent}26, transparent 68%)`,
          filter: 'blur(14px)',
        }}
      />

      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={{
          rest: {},
          hover: {},
        }}
        transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'relative',
          height: '100%',
          minHeight: 0,
          maxHeight: '100%',
          overflow: 'visible',
          borderRadius: 16,
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          aria-hidden="true"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 0 },
          }}
          transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: 'absolute',
            inset: -22,
            borderRadius: 20,
            background: 'transparent',
            boxShadow: 'none',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <motion.div
          aria-hidden="true"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 17,
            border: `1px solid ${service.accent}38`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px ${service.accent}16`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 18, rotateX: 4 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            minHeight: 0,
            maxHeight: '100%',
            overflow: 'visible',
            borderRadius: 16,
            transformOrigin: 'center center',
          }}
        >
          <ServiceVisual service={service} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function ServiceCard({
  service,
  index,
  onNavigate,
}: {
  service: Service;
  index: number;
  onNavigate: (href: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const isReversed = index % 2 === 1;

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start 85%', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 0.16, 0.86, 1], [0.97, 1, 1, 0.985]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.9, 1], [0.18, 1, 1, 0.72]);
  const y = useTransform(scrollYProgress, [0, 0.16, 0.88, 1], [16, 0, 0, 0]);
  const infoX = useTransform(scrollYProgress, [0, 0.22], [isReversed ? 18 : -18, 0]);
  const demoX = useTransform(scrollYProgress, [0, 0.22], [isReversed ? -18 : 18, 0]);
  const demoRotateY = useTransform(scrollYProgress, [0, 0.22], [isReversed ? -1.4 : 1.4, 0]);
  const gridClass = isReversed
    ? 'lg:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.82fr)]'
    : 'lg:grid-cols-[minmax(20rem,0.82fr)_minmax(0,1.18fr)]';

  return (
    <section
      ref={cardRef}
      id={getServiceAnchorId(service.id)}
      data-service-card
      className="relative scroll-mt-24"
      style={{ zIndex: 1 }}
    >
      <motion.div
        className={`mx-auto grid w-full items-stretch gap-8 overflow-visible lg:h-[clamp(42rem,82svh,51rem)] lg:max-h-[clamp(42rem,82svh,51rem)] lg:gap-10 ${gridClass}`}
        style={{ opacity, y, scale, perspective: 1400, minHeight: 0 }}
      >
        <motion.div
          style={{ x: infoX }}
          className={`order-1 h-full min-h-0 overflow-visible ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}
        >
          <ServiceInfoCard service={service} onNavigate={onNavigate} />
        </motion.div>

        <motion.div
          style={{ x: demoX, rotateY: demoRotateY }}
          className={`order-2 h-full min-h-0 overflow-visible ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}
        >
          <ServiceDemoPanel service={service} />
        </motion.div>
      </motion.div>
    </section>
  );
}
const PARTICLES = [
  { x: '8%', y: '15%', size: 1.5, duration: 8, delay: 0, opacity: 0.25 },
  { x: '85%', y: '10%', size: 1, duration: 10, delay: 1.5, opacity: 0.2 },
  { x: '92%', y: '35%', size: 2, duration: 7, delay: 0.8, opacity: 0.18 },
  { x: '5%', y: '55%', size: 1.5, duration: 9, delay: 2, opacity: 0.22 },
  { x: '88%', y: '65%', size: 1, duration: 11, delay: 0.3, opacity: 0.15 },
  { x: '12%', y: '75%', size: 2, duration: 8.5, delay: 1.2, opacity: 0.2 },
  { x: '78%', y: '85%', size: 1.5, duration: 9.5, delay: 0.6, opacity: 0.18 },
  { x: '3%', y: '88%', size: 1, duration: 12, delay: 1.8, opacity: 0.15 },
  { x: '50%', y: '5%', size: 1, duration: 7.5, delay: 2.5, opacity: 0.12 },
  { x: '95%', y: '50%', size: 1.5, duration: 10, delay: 0.9, opacity: 0.18 },
  { x: '45%', y: '92%', size: 1, duration: 8, delay: 1.4, opacity: 0.15 },
  { x: '20%', y: '30%', size: 1, duration: 13, delay: 3, opacity: 0.1 },
] as const;

function FloatingParticles({ activeAccent }: { activeAccent: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {PARTICLES.map((particle, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,1)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            y: [0, -18, -6, -24, 0],
            x: [0, 8, -4, 6, 0],
            opacity: [
              particle.opacity * 0.3,
              particle.opacity,
              particle.opacity * 0.5,
              particle.opacity * 0.8,
              particle.opacity * 0.3,
            ],
            scale: [0.8, 1.6, 1, 1.3, 0.8],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
        />
      ))}

      {[
        { x: '30%', y: '20%', size: 2, duration: 6, delay: 0 },
        { x: '65%', y: '70%', size: 2, duration: 7, delay: 1 },
        { x: '15%', y: '60%', size: 1.5, duration: 8, delay: 0.5 },
      ].map((particle, index) => (
        <motion.div
          key={`accent-${index}`}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            background: activeAccent,
            y: [0, -15, 0],
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.8, 1],
            boxShadow: [
              `0 0 4px ${activeAccent}40`,
              `0 0 12px ${activeAccent}60`,
              `0 0 4px ${activeAccent}40`,
            ],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
            background: { duration: 1.2 },
          }}
        />
      ))}
    </div>
  );
}

function OurServicesBackground({ activeAccent }: { activeAccent: string }) {
  const cyan = getServiceAccent(1, '#06b6d4');
  const green = getServiceAccent(2, '#10b981');
  const violet = getServiceAccent(4, '#8b5cf6');
  const orange = getServiceAccent(3, '#f59e0b');
  const zones = [
    {
      color: cyan,
      inset: 'clamp(3rem, 7vw, 6rem) auto auto -12%',
      width: '42vw',
      height: '28rem',
      background: `radial-gradient(ellipse at center, ${cyan}22, ${cyan}0B 35%, transparent 70%)`,
      blur: 46,
      opacity: 0.74,
    },
    {
      color: green,
      inset: '28% auto auto -10%',
      width: '34vw',
      height: '34rem',
      background: `radial-gradient(ellipse at center, ${green}1D, ${green}08 38%, transparent 72%)`,
      blur: 54,
      opacity: 0.58,
    },
    {
      color: violet,
      inset: 'auto auto 10% -8%',
      width: '38vw',
      height: '30rem',
      background: `radial-gradient(ellipse at center, ${violet}20, ${violet}0A 36%, transparent 72%)`,
      blur: 58,
      opacity: 0.62,
    },
    {
      color: orange,
      inset: 'auto -12% 2% auto',
      width: '42vw',
      height: '34rem',
      background: `radial-gradient(ellipse at center, ${orange}22, ${orange}0A 34%, transparent 72%)`,
      blur: 58,
      opacity: 0.66,
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 34% at 50% 9%, rgba(25,38,58,0.42), transparent 64%), linear-gradient(180deg, #06070b 0%, #030407 42%, #020203 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            `url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '160px 160px',
          opacity: 0.32,
        }}
      />

      {zones.map((zone) => (
        <div
          key={zone.color}
          style={{
            position: 'absolute',
            inset: zone.inset,
            width: zone.width,
            height: zone.height,
            background: zone.background,
            filter: `blur(${zone.blur}px)`,
            opacity: zone.opacity,
          }}
        />
      ))}

      <motion.div
        animate={{
          background: `radial-gradient(ellipse 55% 28% at 50% 22%, ${activeAccent}0D 0%, transparent 74%)`,
        }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.9,
        }}
      />

      <svg
        className="hidden md:block"
        viewBox="0 0 1440 2400"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.44,
        }}
      >
        <defs>
          <linearGradient id="services-top-flow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={cyan} stopOpacity="0" />
            <stop offset="0.24" stopColor={cyan} stopOpacity="0.28" />
            <stop offset="0.56" stopColor={green} stopOpacity="0.16" />
            <stop offset="1" stopColor={green} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="services-bottom-flow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={violet} stopOpacity="0" />
            <stop offset="0.22" stopColor={violet} stopOpacity="0.22" />
            <stop offset="0.7" stopColor={orange} stopOpacity="0.24" />
            <stop offset="1" stopColor={orange} stopOpacity="0" />
          </linearGradient>
          <pattern id="services-grid" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M72 0H0V72" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="1440" height="2400" fill="url(#services-grid)" opacity="0.75" />

        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-40 270 C160 250 210 150 365 155 C520 160 560 250 725 230 C880 212 960 106 1190 84" stroke="url(#services-top-flow)" strokeWidth="2" />
          <path d="M-20 323 C172 316 254 232 392 246 C532 260 594 333 742 300 C902 264 1010 164 1260 156" stroke={cyan} strokeOpacity="0.10" strokeWidth="1" />
          <path d="M118 176 L210 176 L210 118 L326 118 L326 92" stroke={cyan} strokeOpacity="0.18" strokeWidth="1.1" />
          <path d="M72 238 L170 238 L170 292 L282 292" stroke={cyan} strokeOpacity="0.14" strokeWidth="1" />

          <path d="M90 864 C226 805 320 842 414 778 C504 718 584 695 705 724" stroke={green} strokeOpacity="0.18" strokeWidth="1.2" />
          <path d="M54 940 L178 900 L318 962 L454 884 L626 918" stroke={green} strokeOpacity="0.18" strokeWidth="1" />
          <path d="M64 1048 L166 1048 L166 1108 L302 1108 L302 1166" stroke={green} strokeOpacity="0.12" strokeWidth="1" />

          <path d="M-70 1774 C142 1718 234 1846 420 1764 C585 1691 654 1586 820 1618" stroke="url(#services-bottom-flow)" strokeWidth="2" />
          <path d="M84 1908 L184 1840 L312 1884 L432 1800 L548 1832" stroke={violet} strokeOpacity="0.18" strokeWidth="1" />
          <path d="M1006 1930 C1116 1856 1200 1866 1298 1794 C1362 1748 1414 1748 1486 1762" stroke={orange} strokeOpacity="0.20" strokeWidth="1.2" />
          <path d="M1058 2028 L1142 2028 L1142 1970 L1238 1970 L1238 1912 L1326 1912" stroke={orange} strokeOpacity="0.16" strokeWidth="1" />
        </g>

        <g>
          {[
            { cx: 210, cy: 118, color: cyan },
            { cx: 170, cy: 292, color: cyan },
            { cx: 178, cy: 900, color: green },
            { cx: 318, cy: 962, color: green },
            { cx: 184, cy: 1840, color: violet },
            { cx: 432, cy: 1800, color: violet },
            { cx: 1142, cy: 1970, color: orange },
            { cx: 1238, cy: 1912, color: orange },
          ].map((node) => (
            <circle key={`${node.cx}-${node.cy}`} cx={node.cx} cy={node.cy} r="4" fill={node.color} opacity="0.42" />
          ))}
        </g>
      </svg>

      <div
        className="hidden lg:block"
        style={{
          position: 'absolute',
          inset: '8% 13%',
          borderRadius: '48%',
          background: 'radial-gradient(ellipse at center, rgba(2,3,6,0.86) 0%, rgba(2,3,6,0.62) 34%, transparent 72%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.28), transparent 18%, transparent 82%, rgba(0,0,0,0.30)), linear-gradient(180deg, rgba(0,0,0,0.38), transparent 12%, transparent 88%, rgba(0,0,0,0.46))',
        }}
      />

      <FloatingParticles activeAccent={activeAccent} />
    </div>
  );
}

function ServicesProgressRail({
  services,
  activeServiceIndex,
  activeAccent,
  markers,
  endMarker,
  progress,
}: {
  services: Service[];
  activeServiceIndex: number;
  activeAccent: string;
  markers: number[];
  endMarker: number;
  progress: MotionValue<number>;
}) {
  const firstMarker = markers[0] ?? 0;
  const railBottom = Math.max(0, 100 - endMarker);

  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[clamp(7rem,10vw,11rem)] lg:block"
      aria-hidden="true"
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        <motion.div
          animate={{
            boxShadow: `inset 0 0 22px rgba(0,0,0,0.68), 0 0 42px ${activeAccent}18`,
          }}
          transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: 'absolute',
            top: `${firstMarker}%`,
            bottom: `${railBottom}%`,
            left: '50%',
            width: 11,
            transform: 'translateX(-50%)',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.045)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: `inset 0 0 22px rgba(0,0,0,0.68), 0 0 38px ${activeAccent}16`,
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{
              background: `linear-gradient(180deg, ${activeAccent}, ${activeAccent}96 72%, ${activeAccent}30)`,
              boxShadow: `0 0 38px ${activeAccent}7A`,
            }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              scaleY: progress,
              transformOrigin: 'top center',
            }}
          />
        </motion.div>

        {services.map((service, index) => {
          const isActive = activeServiceIndex === index;
          const top = `${markers[index] ?? (index / services.length) * 100}%`;

          return (
            <motion.div
              key={service.id}
              animate={{
                width: isActive ? 35 : 18,
                height: isActive ? 35 : 18,
                opacity: isActive ? 1 : 0.72,
                backgroundColor: service.accent,
                boxShadow: isActive
                  ? `0 0 18px ${service.accent}, 0 0 48px ${service.accent}78`
                  : `0 0 18px ${service.accent}50`,
              }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                position: 'absolute',
                top,
                left: '50%',
                transform: 'translate(-50%, -50%)',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.28)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function ServiceRailSpacer() {
  return <div className="relative hidden min-h-full w-full lg:block" aria-hidden="true" />;
}

function ServiceRow({
  service,
  index,
  onActive,
  onNavigate,
  onRowRef,
}: {
  service: Service;
  index: number;
  onActive: (index: number) => void;
  onNavigate: (href: string) => void;
  onRowRef: (index: number, element: HTMLDivElement | null) => void;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const setRowNode = useCallback(
    (element: HTMLDivElement | null) => {
      rowRef.current = element;
      onRowRef(index, element);
    },
    [index, onRowRef]
  );

  useEffect(() => {
    const currentRow = rowRef.current;
    if (!currentRow) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.28) {
          onActive(index);
        }
      },
      {
        threshold: [0.28, 0.45, 0.62],
        rootMargin: '-18% 0px -18% 0px',
      }
    );

    observer.observe(currentRow);
    return () => observer.disconnect();
  }, [index, onActive]);

  return (
    <div
      ref={setRowNode}
      data-service-row
      className="grid items-stretch gap-8 py-16 md:py-20 lg:grid-cols-[clamp(7rem,10vw,11rem)_minmax(0,1fr)] lg:gap-12 lg:py-32 xl:py-36"
    >
      <ServiceRailSpacer />
      <ServiceCard service={service} index={index} onNavigate={onNavigate} />
    </div>
  );
}

function ServicesFullWidthCta({ onNavigate }: { onNavigate: (href: string) => void }) {
  const [isCtaHovered, setIsCtaHovered] = useState(false);
  const [ctaGlowStep, setCtaGlowStep] = useState(0);
  const [hoveredCtaServiceId, setHoveredCtaServiceId] = useState<number | null>(null);
  const ctaCorners = [
    { key: 'web', color: getServiceAccent(1, '#06b6d4'), top: '-18%', left: '-10%' },
    { key: 'ai', color: getServiceAccent(2, '#10b981'), top: '-18%', right: '-10%' },
    { key: 'software', color: getServiceAccent(4, '#8b5cf6'), bottom: '-22%', left: '-10%' },
    { key: 'automation', color: getServiceAccent(3, '#f59e0b'), bottom: '-22%', right: '-10%' },
  ];
  const ctaEase = [0.22, 1, 0.36, 1] as [number, number, number, number];
  const hoveredCtaService = hoveredCtaServiceId
    ? SERVICES.find((service) => service.id === hoveredCtaServiceId)
    : null;
  const activeCtaGlowColor = hoveredCtaService?.accent ?? ctaCorners[ctaGlowStep]?.color ?? getServiceAccent(1, '#06b6d4');
  const ctaSmoothTransition = { duration: 0.78, ease: ctaEase };
  const ctaGlowTransition = { duration: hoveredCtaServiceId ? 0.38 : 0.72, ease: ctaEase };
  const ctaBaseShadow = 'inset 0 1px 0 rgba(255,255,255,0.14), 0 46px 150px rgba(0,0,0,0.56)';
  const ctaHoverShadow = `inset 0 1px 0 rgba(255,255,255,0.18), 0 54px 170px rgba(0,0,0,0.60), 0 0 138px ${activeCtaGlowColor}66, 0 0 196px ${activeCtaGlowColor}36`;

  useEffect(() => {
    if (!isCtaHovered || hoveredCtaServiceId !== null) {
      return;
    }

    const glowCycle = window.setInterval(() => {
      setCtaGlowStep((current) => (current + 1) % ctaCorners.length);
    }, 1000);

    return () => window.clearInterval(glowCycle);
  }, [isCtaHovered, hoveredCtaServiceId, ctaCorners.length]);

  return (
    <motion.div
      id="servicios-siguiente-paso"
      initial="rest"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="pb-20 pt-24 md:pb-24 lg:pb-28 lg:pt-32"
    >
      <motion.div
        data-cursor="hover"
        initial="rest"
        onHoverStart={() => setIsCtaHovered(true)}
        onHoverEnd={() => {
          setIsCtaHovered(false);
          setHoveredCtaServiceId(null);
        }}
        whileHover={{ y: -3, filter: 'brightness(1.02)' }}
        animate={{
          borderColor: isCtaHovered ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.22)',
          boxShadow: isCtaHovered ? ctaHoverShadow : ctaBaseShadow,
        }}
        variants={{
          rest: {
            opacity: 1,
            y: 0,
            filter: 'brightness(1)',
            borderColor: 'rgba(255,255,255,0.11)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 28px 82px rgba(0,0,0,0.38)',
          },
          show: {
            opacity: 1,
            y: 0,
            filter: 'brightness(1)',
            borderColor: 'rgba(255,255,255,0.22)',
            boxShadow: ctaBaseShadow,
          },
        }}
        transition={{
          ...ctaSmoothTransition,
          borderColor: { duration: 0.72, ease: ctaEase },
          boxShadow: { duration: hoveredCtaServiceId ? 0.38 : 0.72, ease: ctaEase },
        }}
        style={{
          position: 'relative',
          minHeight: 'clamp(34rem, 68svh, 46rem)',
          overflow: 'hidden',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.10)',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.082), rgba(255,255,255,0.022)), radial-gradient(ellipse at center, rgba(2,4,8,0.88), rgba(2,4,8,0.42) 46%, rgba(2,4,8,0.16) 100%)',
          padding: 'clamp(1.5rem, 4vw, 4.75rem)',
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        {ctaCorners.map(({ key, color, ...position }) => {
          const isCornerActive = color === activeCtaGlowColor;

          return (
            <motion.div
              key={key}
              aria-hidden="true"
              animate={{
                opacity: isCtaHovered ? (isCornerActive ? 0.62 : 0.1) : 0,
                scale: isCornerActive ? 1.08 : 0.96,
              }}
              transition={ctaGlowTransition}
              style={{
                position: 'absolute',
                width: 'clamp(15rem, 31vw, 29rem)',
                height: 'clamp(15rem, 31vw, 29rem)',
                ...position,
                background: `radial-gradient(circle at center, ${color}24 0%, ${color}10 34%, transparent 70%)`,
                filter: 'blur(18px)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          );
        })}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '18% 18%',
            borderRadius: '42%',
            background: 'radial-gradient(ellipse at center, rgba(3,4,8,0.86) 0%, rgba(3,4,8,0.62) 48%, transparent 74%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={{
            opacity: isCtaHovered ? 0.46 : 0.1,
          }}
          transition={ctaGlowTransition}
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.085), transparent 38%, rgba(255,255,255,0.045)), radial-gradient(ellipse at center, rgba(255,255,255,0.055), transparent 66%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={{
            opacity: isCtaHovered ? 1 : 0,
            borderColor: isCtaHovered ? `${activeCtaGlowColor}42` : `${activeCtaGlowColor}00`,
            boxShadow: `0 0 110px ${activeCtaGlowColor}52, 0 0 190px ${activeCtaGlowColor}2E`,
            scale: isCtaHovered ? 1 : 0.97,
          }}
          transition={{
            opacity: { duration: 0.78, ease: ctaEase },
            borderColor: { duration: hoveredCtaServiceId ? 0.38 : 0.65, ease: ctaEase },
            boxShadow: { duration: hoveredCtaServiceId ? 0.38 : 0.65, ease: ctaEase },
            scale: { duration: 0.78, ease: ctaEase },
          }}
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: 15,
            border: '1px solid transparent',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={{
            opacity: isCtaHovered ? 0.78 : 0.24,
            scaleX: isCtaHovered ? 1 : 0.96,
          }}
          transition={{ ...ctaGlowTransition, duration: 0.72 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 'clamp(1.5rem, 4vw, 4.75rem)',
            right: 'clamp(1.5rem, 4vw, 4.75rem)',
            height: 3,
            transformOrigin: 'center',
            borderRadius: 999,
            background:
              'linear-gradient(90deg, transparent, #06b6d4 12%, #10b981 38%, #8b5cf6 68%, #f59e0b 88%, transparent)',
            boxShadow:
              '0 0 26px rgba(6,182,212,0.75), 0 0 58px rgba(139,92,246,0.36), 0 0 76px rgba(245,158,11,0.34)',
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={{
            opacity: isCtaHovered ? 0.26 : 0.04,
          }}
          transition={{ ...ctaGlowTransition, duration: 0.78 }}
          style={{
            position: 'absolute',
            inset: '-20% -10%',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.13), transparent 0 56%)',
            filter: 'blur(26px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))',
            gap: 'clamp(1.5rem, 4vw, 4rem)',
            alignItems: 'center',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 850,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.42)',
                marginBottom: 14,
              }}
            >
              Cierre de diagnostico
            </div>
            <h3
              style={{
                margin: 0,
                maxWidth: 860,
                fontSize: 'clamp(2.1rem, 5.4vw, 5.35rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.035em',
                color: 'white',
                fontWeight: 900,
              }}
            >
              Converti esta lectura en una decision clara.
            </h3>
            <p
              style={{
                margin: 'clamp(1.1rem, 2.4vw, 1.7rem) 0 0',
                maxWidth: 760,
                fontSize: 'clamp(1rem, 1.25vw, 1.18rem)',
                lineHeight: 1.62,
                color: 'rgba(255,255,255,0.64)',
              }}
            >
              Si tu negocio necesita verse mejor, responder mas rapido, ahorrar horas o centralizar la operacion,
              el proximo paso es elegir el frente con mayor impacto y construirlo con foco comercial desde el dia uno.
            </p>
            <div
              style={{
                marginTop: 'clamp(1.4rem, 3vw, 2.25rem)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))',
                gap: 10,
                maxWidth: 760,
              }}
            >
              {[
                { label: '4 areas', value: 'Presencia, IA, procesos y sistema' },
                { label: '1 plan', value: 'Prioridad segun retorno real' },
                { label: '0 relleno', value: 'Solo piezas que mueven ventas' },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  data-cursor="hover"
                  whileHover={{
                    y: -2,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(255,255,255,0.18)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.10), 0 16px 36px rgba(0,0,0,0.22), 0 0 28px rgba(255,255,255,0.07)',
                  }}
                  transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    minHeight: 82,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.10)',
                    backgroundColor: 'rgba(255,255,255,0.035)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                    padding: '14px 15px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 7,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 850,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.42)',
                    }}
                  >
                    {item.label}
                  </span>
                  <span style={{ fontSize: 13, lineHeight: 1.35, color: 'rgba(255,255,255,0.68)' }}>{item.value}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ minWidth: 0, display: 'grid', gap: 12, alignContent: 'center' }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 850,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.40)',
              }}
            >
              Elegi por donde empezar
            </div>
            {ORDERED_SERVICES.map((service) => {
              const Icon = service.icon;

              return (
                <motion.button
                  key={service.id}
                  type="button"
                  onClick={() => onNavigate(service.href)}
                  onHoverStart={() => setHoveredCtaServiceId(service.id)}
                  onHoverEnd={() => setHoveredCtaServiceId(null)}
                  initial="rowRest"
                  whileHover="rowHover"
                  variants={{
                    rowRest: {
                      x: 0,
                      y: 0,
                      backgroundColor: 'rgba(255,255,255,0.018)',
                      borderColor: `${service.accent}30`,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                    },
                    rowHover: {
                      x: 5,
                      y: -2,
                      backgroundColor: `${service.accent}0F`,
                      borderColor: `${service.accent}72`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 42px rgba(0,0,0,0.28), 0 0 36px ${service.accent}24`,
                    },
                  }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    position: 'relative',
                    minHeight: 74,
                    overflow: 'hidden',
                    borderRadius: 10,
                    border: `1px solid ${service.accent}30`,
                    backgroundColor: 'rgba(255,255,255,0.018)',
                    backgroundImage: `linear-gradient(135deg, ${service.accent}0A, rgba(255,255,255,0.02))`,
                    color: service.accent,
                    display: 'grid',
                    gridTemplateColumns: '34px minmax(0,1fr) auto',
                    alignItems: 'center',
                    gap: 13,
                    padding: '13px 16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <motion.span
                    aria-hidden="true"
                    variants={{
                      rowRest: { opacity: 0 },
                      rowHover: { opacity: 1 },
                    }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(circle at 18% 50%, ${service.accent}22, transparent 0 36%), linear-gradient(120deg, ${service.accent}10, transparent 54%)`,
                      pointerEvents: 'none',
                    }}
                  />
                  <motion.span
                    variants={{
                      rowRest: {
                        scale: 1,
                        backgroundColor: `${service.accent}14`,
                        borderColor: `${service.accent}32`,
                        boxShadow: `0 0 22px ${service.accent}18`,
                      },
                      rowHover: {
                        scale: 1.045,
                        backgroundColor: `${service.accent}20`,
                        borderColor: `${service.accent}64`,
                        boxShadow: `0 0 16px ${service.accent}38, 0 0 34px ${service.accent}20`,
                      },
                    }}
                    transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      border: `1px solid ${service.accent}32`,
                      display: 'grid',
                      placeItems: 'center',
                      backgroundColor: `${service.accent}14`,
                      boxShadow: `0 0 22px ${service.accent}18`,
                    }}
                  >
                    <Icon size={16} color={service.accent} strokeWidth={1.8} />
                  </motion.span>
                  <span style={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 900,
                        letterSpacing: '0.10em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {SERVICE_SHORT_LABELS[service.id]}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        marginTop: 4,
                        fontSize: 11,
                        lineHeight: 1.35,
                        color: 'rgba(255,255,255,0.52)',
                      }}
                    >
                      {service.metric}
                    </span>
                  </span>
                  <motion.span
                    variants={{
                      rowRest: {
                        color: service.accent,
                        backgroundColor: 'rgba(4,6,10,0.22)',
                        borderColor: `${service.accent}36`,
                        boxShadow: `0 0 0 ${service.accent}00`,
                      },
                      rowHover: {
                        color: '#050607',
                        backgroundColor: service.accent,
                        borderColor: `${service.accent}B8`,
                        boxShadow: `0 0 18px ${service.accent}38`,
                      },
                    }}
                    transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 11,
                      fontWeight: 850,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: service.accent,
                      backgroundColor: 'rgba(4,6,10,0.22)',
                      border: `1px solid ${service.accent}30`,
                      borderRadius: 999,
                      padding: '7px 10px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Ver
                    <span aria-hidden="true">-&gt;</span>
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function OurServices() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const servicesTrackRef = useRef<HTMLDivElement | null>(null);
  const serviceRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const serviceScrollIntentRef = useRef(0);
  const [railMarkers, setRailMarkers] = useState<number[]>([]);
  const [railEndMarker, setRailEndMarker] = useState(100);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [activeRailIndex, setActiveRailIndex] = useState(0);
  const { triggerTransition } = useTransitionContext();
  const lenis = useLenis();
  const railRawProgress = useMotionValue(0);
  const railProgress = useSpring(railRawProgress, { stiffness: 150, damping: 34, mass: 0.28 });

  const activeAccent = ORDERED_SERVICES[activeServiceIndex]?.accent ?? ORDERED_SERVICES[0]?.accent ?? '#06b6d4';
  const activeRailAccent = ORDERED_SERVICES[activeRailIndex]?.accent ?? ORDERED_SERVICES[0]?.accent ?? '#06b6d4';

  const updateRailProgress = useCallback(() => {
    const firstRow = serviceRowRefs.current[0];
    const lastRow = serviceRowRefs.current[ORDERED_SERVICES.length - 1];
    const firstTarget = firstRow?.querySelector<HTMLElement>('[data-service-card]') ?? firstRow;
    const lastTarget = lastRow?.querySelector<HTMLElement>('[data-service-card]') ?? lastRow;

    if (!firstTarget || !lastTarget) return;

    const firstRect = firstTarget.getBoundingClientRect();
    const lastRect = lastTarget.getBoundingClientRect();
    const firstTop = window.scrollY + firstRect.top;
    const lastMiddle = window.scrollY + lastRect.top + lastRect.height * 0.5;
    const viewportCenter = window.scrollY + window.innerHeight * 0.5;
    const progressRange = lastMiddle - firstTop;
    const nextProgress = progressRange > 0 ? (viewportCenter - firstTop) / progressRange : 0;

    railRawProgress.set(Math.max(0, Math.min(1, nextProgress)));
  }, [railRawProgress]);

  const measureRailMarkers = useCallback(() => {
    const track = servicesTrackRef.current;
    if (!track) return;

    const trackRect = track.getBoundingClientRect();
    if (trackRect.height <= 0) return;

    const nextMarkers = ORDERED_SERVICES.map((_, index) => {
      const row = serviceRowRefs.current[index];
      const target = row?.querySelector<HTMLElement>('[data-service-card]') ?? row;

      if (!target) {
        return (index / ORDERED_SERVICES.length) * 100;
      }

      const markerTop = target.getBoundingClientRect().top - trackRect.top;
      return Math.max(0, Math.min(100, (markerTop / trackRect.height) * 100));
    });

    const lastRow = serviceRowRefs.current[ORDERED_SERVICES.length - 1];
    const lastTarget = lastRow?.querySelector<HTMLElement>('[data-service-card]') ?? lastRow;
    const lastRect = lastTarget?.getBoundingClientRect();
    const nextEndMarker = lastRect
      ? Math.max(0, Math.min(100, ((lastRect.bottom - trackRect.top) / trackRect.height) * 100))
      : 100;

    setRailMarkers(nextMarkers);
    setRailEndMarker(nextEndMarker);
    updateRailProgress();
  }, [updateRailProgress]);

  const setServiceRowRef = useCallback(
    (index: number, element: HTMLDivElement | null) => {
      serviceRowRefs.current[index] = element;
      window.requestAnimationFrame(measureRailMarkers);
    },
    [measureRailMarkers]
  );

  const updateActiveRailIndex = useCallback(
    (latestProgress: number) => {
      if (railMarkers.length === 0) {
        setActiveRailIndex(0);
        return;
      }

      const firstMarker = railMarkers[0] ?? 0;
      const currentRailPosition = firstMarker + latestProgress * (railEndMarker - firstMarker);
      const nextIndex = railMarkers.reduce((currentIndex, marker, index) => {
        return currentRailPosition + 0.2 >= marker ? index : currentIndex;
      }, 0);

      setActiveRailIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
    },
    [railEndMarker, railMarkers]
  );

  useMotionValueEvent(railProgress, 'change', updateActiveRailIndex);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      updateActiveRailIndex(railProgress.get());
    });

    return () => window.cancelAnimationFrame(frame);
  }, [railMarkers, railProgress, updateActiveRailIndex]);

  useEffect(() => {
    updateRailProgress();

    let frame = 0;
    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateRailProgress);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [updateRailProgress]);

  const scrollToService = useCallback((serviceId: number) => {
    const now = performance.now();
    if (now - serviceScrollIntentRef.current < 120) return;
    serviceScrollIntentRef.current = now;

    const index = ORDERED_SERVICES.findIndex((service) => service.id === serviceId);
    const row = index >= 0 ? serviceRowRefs.current[index] : null;
    const target =
      document.getElementById(getServiceAnchorId(serviceId)) ??
      row?.querySelector<HTMLElement>('[data-service-card]') ??
      row;

    if (!target) return;

    const rect = target.getBoundingClientRect();
    const targetCenter = window.scrollY + rect.top + rect.height / 2;
    const top = targetCenter - window.innerHeight / 2;
    const targetTop = Math.max(0, top);
    const distance = Math.abs(targetTop - window.scrollY);
    const duration = Math.min(1.75, Math.max(0.7, distance / 1200));

    setActiveServiceIndex(Math.max(0, index));
    setActiveRailIndex(Math.max(0, index));

    if (lenis) {
      lenis.scrollTo(targetTop, {
        immediate: false,
        force: true,
        lock: false,
        duration,
      });
      return;
    }

    window.scrollTo({ top: targetTop, left: 0, behavior: 'smooth' });
  }, [lenis]);

  useEffect(() => {
    measureRailMarkers();

    const resizeObserver = new ResizeObserver(() => measureRailMarkers());
    const track = servicesTrackRef.current;

    if (track) {
      resizeObserver.observe(track);
    }

    serviceRowRefs.current.forEach((row) => {
      if (row) {
        resizeObserver.observe(row);
      }
    });

    window.addEventListener('resize', measureRailMarkers);
    const timeout = window.setTimeout(measureRailMarkers, 350);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureRailMarkers);
      window.clearTimeout(timeout);
    };
  }, [measureRailMarkers]);

  return (
    <section
      ref={sectionRef}
      id="servicios"
      className="relative isolate overflow-hidden bg-[#020407] text-white"
    >
      <OurServicesBackground activeAccent={activeAccent} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[clamp(12rem,24vw,22rem)]"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(2,4,7,0.62) 34%, rgba(2,4,7,0.26) 68%, transparent 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-12rem] z-[1] h-[26rem] w-[72rem] -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(ellipse, rgba(0,0,0,0.72), rgba(2,7,12,0.42) 38%, rgba(6,182,212,0.035) 58%, transparent 76%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-80"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(2,7,12,0.44) 42%, #020407 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-12rem] left-1/2 z-[1] h-80 w-[70rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse, rgba(6,182,212,0.09), rgba(37,99,235,0.04) 42%, transparent 72%)',
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-4rem] left-[-8%] z-[1] hidden h-52 w-[64rem] opacity-20 lg:block"
        viewBox="0 0 1020 220"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 150C150 96 240 188 380 132C530 72 630 64 760 112C866 152 930 126 1020 78"
          stroke="rgba(56,189,248,0.40)"
          strokeWidth="1"
        />
        <path
          d="M0 184C160 138 270 202 410 158C560 110 670 98 814 146C910 178 970 154 1020 128"
          stroke="rgba(37,99,235,0.26)"
          strokeWidth="1"
        />
      </svg>

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pb-14 pt-20 sm:px-8 lg:px-10 lg:pt-24">
        {/* HEADER INMERSIVO */}
        <div
          style={{
            textAlign: 'center',
            maxWidth: 800,
            margin: '0 auto',
            padding: '0 32px 52px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: `1px solid ${activeAccent}24`,
              borderRadius: 100,
              padding: '6px 16px',
              marginBottom: 28,
              background: `${activeAccent}09`,
              boxShadow: `0 0 26px ${activeAccent}10`,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: activeAccent,
                boxShadow: `0 0 10px ${activeAccent}`,
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              EL ECOSISTEMA DEVELOP
            </span>
          </motion.div>

          {/* H2 */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              margin: '0 0 20px',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
              Cuatro soluciones.
            </span>
            <br />
            <span style={{ color: 'white' }}>Un solo objetivo.</span>
          </motion.h2>

          {/* Subfrase */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 17,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.38)',
              maxWidth: 560,
              margin: '0 auto 40px',
            }}
          >
            Todo lo que tu negocio necesita para vender más, operar mejor
            y crecer{' '}
            <strong style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
              sin contratar más gente.
            </strong>
          </motion.p>

          {/* Chips de los 4 servicios con colores */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {ORDERED_SERVICES.map((service) => (
              <motion.button
                key={service.id}
                type="button"
                data-cursor="hover"
                aria-label={`Ir a ${SERVICE_SHORT_LABELS[service.id]}`}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToService(service.id);
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{
                  y: -2,
                  background: `${service.accent}12`,
                  borderColor: `${service.accent}45`,
                  boxShadow: `0 0 26px ${service.accent}1F`,
                }}
                viewport={{ once: true }}
                transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 14px',
                  background: `${service.accent}08`,
                  border: `1px solid ${service.accent}22`,
                  borderRadius: 100,
                  cursor: 'none',
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: service.accent,
                    boxShadow: `0 0 6px ${service.accent}80`,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {SERVICE_SHORT_LABELS[service.id]}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: service.accent,
                    opacity: 0.7,
                    borderLeft: `1px solid ${service.accent}30`,
                    paddingLeft: 7,
                  }}
                >
                  {service.price.replace(' USD', '')}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* SEPARADOR */}
        <div
          style={{
            width: '100%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${activeAccent}18, rgba(255,255,255,0.08), ${activeAccent}18, transparent)`,
            marginBottom: 42,
          }}
        />

        <div ref={servicesTrackRef} className="relative mt-6 md:mt-8">
          <ServicesProgressRail
            services={ORDERED_SERVICES}
            activeServiceIndex={activeRailIndex}
            activeAccent={activeRailAccent}
            markers={railMarkers}
            endMarker={railEndMarker}
            progress={railProgress}
          />

          <div>
            {ORDERED_SERVICES.map((service, index) => (
              <ServiceRow
                key={service.id}
                service={service}
                index={index}
                onActive={setActiveServiceIndex}
                onNavigate={triggerTransition}
                onRowRef={setServiceRowRef}
              />
            ))}
          </div>
        </div>

        <ServicesFullWidthCta onNavigate={triggerTransition} />
      </div>
    </section>
  );
}


