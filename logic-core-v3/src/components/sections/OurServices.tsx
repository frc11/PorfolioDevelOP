'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  type MotionValue,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import {
  ArrowUpRight,
  Bot,
  Check,
  Code2,
  Globe,
  MessageSquare,
  Phone,
  type LucideIcon,
  User,
  Zap,
} from 'lucide-react';
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
    title: 'Una presencia digital que convierte visitas en consultas reales.',
    description:
      'Diseñamos experiencias de alto impacto para que tu empresa se vea premium, aparezca bien posicionada y capture demanda sin depender de tu tiempo.',
    price: '$800 USD',
    timeline: '15 dias',
    metric: '+340% consultas promedio',
    sectors: ['Concesionarias', 'Clinicas', 'Gimnasios', 'Restaurantes'],
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
    title: 'Un sistema comercial que responde, filtra y agenda aunque tu equipo no esté online.',
    description:
      'Integramos agentes de IA en WhatsApp y web para responder consultas, calificar leads y liberar tiempo ejecutivo sin perder velocidad de respuesta.',
    price: '$300 USD',
    timeline: '7 dias',
    metric: '94% respuesta automatica',
    sectors: ['Concesionarias', 'Clinicas', 'Comercios', 'Inmobiliarias'],
    outcomes: ['Atención inmediata', 'Mejor calidad de lead', 'Agenda operando sola'],
    cta: 'Explorar IA aplicada',
    href: '/ai-implementations',
    accent: '#8b5cf6',
    glow:
      'radial-gradient(circle at 18% 18%, rgba(139,92,246,0.18), transparent 0 36%), radial-gradient(circle at 86% 76%, rgba(139,92,246,0.08), transparent 0 28%)',
    icon: Bot,
  },
  {
    id: 3,
    tag: 'AUTOMATIZACION',
    title: 'Procesos conectados para que la operacion avance sin friccion humana.',
    description:
      'Orquestamos flujos entre tus herramientas para eliminar tareas repetitivas, acelerar seguimiento comercial y reducir errores administrativos.',
    price: '$200 USD',
    timeline: '5 dias',
    metric: '23hs por semana ahorradas',
    sectors: ['Distribuidoras', 'Comercios', 'Clinicas', 'Inmobiliarias'],
    outcomes: ['Menos trabajo manual', 'Follow-up automatico', 'Reportes al instante'],
    cta: 'Explorar automatizaciones',
    href: '/process-automation',
    accent: '#10b981',
    glow:
      'radial-gradient(circle at 84% 20%, rgba(16,185,129,0.18), transparent 0 36%), radial-gradient(circle at 18% 82%, rgba(16,185,129,0.08), transparent 0 30%)',
    icon: Zap,
  },
  {
    id: 4,
    tag: 'SOFTWARE A MEDIDA',
    title: 'Un ecosistema propio para dirigir la empresa con claridad, control y velocidad.',
    description:
      'Construimos software de gestion, CRM y paneles ejecutivos alineados con la logica real de tu negocio para escalar sin depender de planillas.',
    price: '$1.500 USD',
    timeline: 'entrega por etapas',
    metric: '0 licencias mensuales',
    sectors: ['Constructoras', 'Mayoristas', 'Clinicas', 'Concesionarias'],
    outcomes: ['Operacion centralizada', 'Reportes directivos', 'Control total del dato'],
    cta: 'Explorar software a medida',
    href: '/software-development',
    accent: '#f59e0b',
    glow:
      'radial-gradient(circle at 18% 18%, rgba(245,158,11,0.18), transparent 0 36%), radial-gradient(circle at 84% 82%, rgba(245,158,11,0.08), transparent 0 30%)',
    icon: Code2,
  },
];

function StageFrame({
  service,
  children,
}: {
  service: Service;
  children: ReactNode;
}) {
  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.02] p-5 backdrop-blur-2xl md:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-90" style={{ background: service.glow }} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_34%,transparent_72%,rgba(255,255,255,0.02))]" />

      <div className="pointer-events-none absolute right-[-4%] top-[-14%] text-[clamp(7rem,16vw,14rem)] font-black leading-none tracking-[-0.08em] text-white/[0.045] mix-blend-soft-light [text-shadow:0_0_40px_rgba(255,255,255,0.02)] [WebkitTextStroke:1px_rgba(255,255,255,0.05)]">
        {String(service.id).padStart(2, '0')}
      </div>

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <div className="rounded-full border border-white/[0.06] bg-black/18 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
            {service.tag}
          </div>
          <div
            className="rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em]"
            style={{
              borderColor: `${service.accent}28`,
              color: service.accent,
              backgroundColor: `${service.accent}12`,
            }}
          >
            {service.metric}
          </div>
        </div>

        <div className="relative mt-5 flex-1 overflow-hidden rounded-[28px] border border-white/[0.06] bg-black/18 ring-1 ring-white/10 contrast-[1.05] saturate-[1.08]">
          <div
            className="pointer-events-none absolute inset-0 opacity-20 blur-3xl"
            style={{ background: `radial-gradient(circle at 50% 50%, ${service.accent}, transparent 62%)` }}
          />
          {children}
        </div>
      </div>
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

  type SEOResult = {
    position: number;
    url: string;
    title: string;
    description: string;
    isClient: boolean;
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
    { id: 1, label: 'SEO Local', icon: <SearchGlyph />, duration: 5000, color: '#06b6d4' },
    { id: 2, label: 'Analytics', icon: <AnalyticsGlyph />, duration: 4500, color: '#10b981' },
    { id: 3, label: 'Leads', icon: <LeadsGlyph />, duration: 5500, color: '#8b5cf6' },
    { id: 4, label: 'Google Maps', icon: <MapsGlyph />, duration: 4000, color: '#f59e0b' },
  ]);

  const [activeTab, setActiveTab] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cycleSeed, setCycleSeed] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const animFrameRef = useRef(0);
  const nextTabTimeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const isRunningRef = useRef(false);
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

  useEffect(() => {
    if (nextTabTimeoutRef.current) {
      clearTimeout(nextTabTimeoutRef.current);
      nextTabTimeoutRef.current = null;
    }

    if (!isInView) {
      cancelAnimationFrame(animFrameRef.current);
      isRunningRef.current = false;
      return;
    }

    const duration = webSimulations[activeTab]?.duration ?? 1;

    progressRef.current = 0;
    startTimeRef.current = performance.now();
    isRunningRef.current = true;

    const tick = (now: number) => {
      if (!isRunningRef.current) {
        return;
      }

      const elapsed = now - startTimeRef.current;
      const nextProgress = Math.min(elapsed / duration, 1);

      if (nextProgress !== progressRef.current) {
        progressRef.current = nextProgress;
        setProgress(nextProgress);
      }

      if (nextProgress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      isRunningRef.current = false;
      nextTabTimeoutRef.current = window.setTimeout(() => {
        progressRef.current = 0;
        setProgress(0);
        setActiveTab((previousTab) => (previousTab + 1) % webSimulations.length);
      }, 300);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (nextTabTimeoutRef.current) {
        clearTimeout(nextTabTimeoutRef.current);
        nextTabTimeoutRef.current = null;
      }
      isRunningRef.current = false;
    };
  }, [activeTab, cycleSeed, isInView, webSimulations]);

  const handleTabClick = (index: number) => {
    cancelAnimationFrame(animFrameRef.current);
    if (nextTabTimeoutRef.current) {
      clearTimeout(nextTabTimeoutRef.current);
      nextTabTimeoutRef.current = null;
    }
    isRunningRef.current = false;
    progressRef.current = 0;
    setProgress(0);
    setActiveTab(index);
    setCycleSeed((currentSeed) => currentSeed + 1);
  };

  const activeSimulation = webSimulations[activeTab];
  const activePlaceholder = placeholderConfigs[activeTab];

  const renderSEOScene = ({ isActive, progress, color }: SimProps) => {
    const query = 'Cl\u00ednica odontol\u00f3gica en Tucum\u00e1n';
    const typedLength = Math.floor(progress * 4 * query.length);
    const typedQuery = query.slice(0, Math.min(typedLength, query.length));
    const showResults = progress > 0.25;
    const highlightFirst = progress > 0.55;

    const results: SEOResult[] = [
      {
        position: 1,
        url: 'tuempresa.com.ar',
        title: 'Tu Empresa | develOP',
        description: 'El mejor servicio en tu zona. Consulta precios y pedi presupuesto online.',
        isClient: true,
      },
      {
        position: 2,
        url: 'competidor1.com',
        title: 'Competidor Local - Servicios',
        description: 'Informacion basica. Sin optimizacion.',
        isClient: false,
      },
      {
        position: 3,
        url: 'directoriolocal.com',
        title: 'Directorio de empresas',
        description: 'Listado general sin diferenciacion.',
        isClient: false,
      },
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 8,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            BUSQUEDA ACTIVA
          </span>
          <span
            style={{
              fontSize: 8,
              color,
              background: `${color}12`,
              border: `1px solid ${color}25`,
              borderRadius: 4,
              padding: '2px 6px',
            }}
          >
            SEO LOCAL EN TIEMPO REAL
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: showResults ? `0 0 0 1px ${color}10 inset` : 'none',
          }}
        >
          <div style={{ display: 'inline-flex', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
            <SearchGlyph />
          </div>

          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.75)',
              flex: 1,
              minWidth: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {typedQuery}
            {progress < 0.25 && (
              <motion.span
                animate={isActive ? { opacity: [1, 0, 1] } : { opacity: 1 }}
                transition={{ duration: 0.6, repeat: isActive ? Infinity : 0 }}
                style={{ borderRight: '1px solid rgba(255,255,255,0.6)', marginLeft: 1 }}
              >
                &nbsp;
              </motion.span>
            )}
          </span>

          {showResults && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: 9,
                color,
                background: `${color}15`,
                borderRadius: 4,
                padding: '2px 6px',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              BUSCAR
            </motion.span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 12% 8%, ${color}12 0%, transparent 38%)`,
              pointerEvents: 'none',
            }}
          />

          {results.map((result, index) => (
            <AnimatePresence key={result.position}>
              {showResults && progress > 0.25 + index * 0.12 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={
                    result.isClient && highlightFirst && isActive
                      ? { opacity: 1, y: 0, scale: [1, 1.012, 1] }
                      : { opacity: 1, y: 0, scale: 1 }
                  }
                  transition={
                    result.isClient && highlightFirst && isActive
                      ? {
                          opacity: { duration: 0.3 },
                          y: { duration: 0.3 },
                          scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                        }
                      : { duration: 0.3 }
                  }
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: result.isClient && highlightFirst
                      ? `1px solid ${color}50`
                      : '1px solid rgba(255,255,255,0.06)',
                    background: result.isClient && highlightFirst
                      ? `${color}08`
                      : 'rgba(255,255,255,0.02)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 400ms ease',
                    boxShadow: result.isClient && highlightFirst
                      ? `0 0 0 1px ${color}12 inset, 0 18px 32px ${color}14`
                      : 'none',
                  }}
                >
                  {result.isClient && highlightFirst && (
                    <motion.div
                      animate={isActive ? { opacity: [0.14, 0.28, 0.14] } : { opacity: 0.18 }}
                      transition={{ duration: 1.8, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 8,
                        background: `linear-gradient(90deg, ${color}14 0%, transparent 72%)`,
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {result.isClient && highlightFirst && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: 8,
                        background: color,
                        color: 'black',
                        fontSize: 8,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 100,
                        letterSpacing: '0.05em',
                        zIndex: 2,
                      }}
                    >
                      TU EMPRESA
                    </motion.div>
                  )}

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: result.isClient && highlightFirst
                            ? color
                            : 'rgba(255,255,255,0.2)',
                          minWidth: 12,
                        }}
                      >
                        #{result.position}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          color: 'rgba(255,255,255,0.3)',
                        }}
                      >
                        {result.url}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: result.isClient && highlightFirst ? 600 : 400,
                        color: result.isClient && highlightFirst
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(255,255,255,0.45)',
                        marginBottom: 2,
                      }}
                    >
                      {result.title}
                    </div>

                    <div
                      style={{
                        fontSize: 9,
                        color: result.isClient && highlightFirst
                          ? 'rgba(255,255,255,0.45)'
                          : 'rgba(255,255,255,0.2)',
                        lineHeight: 1.4,
                      }}
                    >
                      {result.description}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalyticsScene = ({ isActive, progress, color }: SimProps) => {
    const visits = Math.floor(progress * 1842);
    const sessions = Math.floor(progress * 247);
    const conversion = (progress * 3.2).toFixed(1);
    const baseData = [120, 145, 132, 178, 165, 210, 195, 240, 228, 270, 255, 310];
    const visiblePoints = Math.floor(progress * baseData.length);
    const showGraph = progress > 0.2;
    const showMap = progress > 0.35;
    const mapPoints = [
      { name: 'Tucuman', x: '42%', y: '38%', size: 8, delay: 0.35 },
      { name: 'Buenos Aires', x: '52%', y: '68%', size: 12, delay: 0.41 },
      { name: 'Cordoba', x: '44%', y: '50%', size: 10, delay: 0.47 },
      { name: 'Rosario', x: '48%', y: '58%', size: 8, delay: 0.53 },
      { name: 'Mendoza', x: '32%', y: '52%', size: 7, delay: 0.59 },
      { name: 'Salta', x: '38%', y: '22%', size: 6, delay: 0.65 },
    ];
    const chartGradientId = 'analyticsAreaGrad';
    const chartPoints = baseData.slice(0, visiblePoints).map((value, index) => {
      const x = (index / (baseData.length - 1)) * 120;
      const y = 60 - (value / 320) * 55;

      return `${x},${y}`;
    });
    const chartAreaPath =
      visiblePoints > 1
        ? [
            'M 0 60',
            ...baseData.slice(0, visiblePoints).map((value, index) => {
              const x = (index / (baseData.length - 1)) * 120;
              const y = 60 - (value / 320) * 55;

              return `L ${x} ${y}`;
            }),
            `L ${((visiblePoints - 1) / (baseData.length - 1)) * 120} 60`,
            'Z',
          ].join(' ')
        : '';

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '4px 2px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 8,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
            }}
          >
            PANEL EN TIEMPO REAL
          </span>

          <motion.span
            animate={isActive ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.8 }}
            transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
            style={{
              fontSize: 8,
              color,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {/*
              <div>
                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: 20,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.3)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    DESDE
                  </span>
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 800,
                      color: 'white',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                    }}
                  >
                    {service.price}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: service.accent,
                      background: `${service.accent}12`,
                      border: `1px solid ${service.accent}25`,
                      borderRadius: 100,
                      padding: '4px 10px',
                      fontWeight: 500,
                    }}
                  >
                    {'⏱ '}
                    {service.timeline}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {service.sectors.map((sector) => (
                    <span
                      key={sector}
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 4,
                        padding: '3px 8px',
                      }}
                    >
                      {sector}
                    </span>
                  ))}
                </div>

                <motion.button
                  type="button"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  onClick={() => onNavigate(service.href)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    color: service.accent,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {service.cta}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    {'↗'}
                  </motion.span>
                </motion.button>
              </div>
            */}
              <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 10px ${color}99`,
              }}
            />
            LIVE
          </motion.span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[
            { label: 'VISITAS', value: visits.toLocaleString(), metricColor: color },
            { label: 'SESIONES', value: sessions.toString(), metricColor: '#8b5cf6' },
            { label: 'CONV.', value: `${conversion}%`, metricColor: '#f59e0b' },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${metric.metricColor}20`,
                borderRadius: 8,
                padding: '6px 8px',
                boxShadow: progress > 0.7 ? `0 0 0 1px ${metric.metricColor}10 inset` : 'none',
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.3)',
                  marginBottom: 3,
                  letterSpacing: '0.06em',
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: metric.metricColor,
                }}
              >
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: 8,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginBottom: 6 }}>
              ULTIMOS 12 DIAS
            </div>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 18% 18%, ${color}12 0%, transparent 34%)`,
                pointerEvents: 'none',
              }}
            />

            {showGraph ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                <svg width="100%" height="60" viewBox="0 0 120 60" preserveAspectRatio="none">
                  {visiblePoints > 1 && (
                    <>
                      <defs>
                        <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                          <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={chartAreaPath} fill={`url(#${chartGradientId})`} />
                      <polyline
                        points={chartPoints.join(' ')}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                </svg>
              </motion.div>
            ) : (
              <div style={{ height: 60, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }} />
            )}
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: 8,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>
              ORIGEN DEL TRAFICO
            </div>

            <svg
              viewBox="0 0 100 140"
              style={{
                width: '100%',
                height: 'calc(100% - 16px)',
                opacity: 0.15,
              }}
            >
              <path
                d="M35,5 L55,5 L70,15 L75,30 L72,45 L65,55 L70,70 L65,85 L60,100 L55,115 L45,130 L38,135 L32,125 L28,110 L30,95 L25,80 L22,65 L25,50 L20,35 L25,20 Z"
                fill="rgba(255,255,255,0.3)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </svg>

            {showMap &&
              mapPoints.map((point, index) =>
                progress > point.delay ? (
                  <motion.div
                    key={point.name}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    style={{
                      position: 'absolute',
                      left: point.x,
                      top: point.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <motion.div
                      animate={isActive ? { scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] } : { opacity: 0.45, scale: 1 }}
                      transition={{ duration: 2, repeat: isActive ? Infinity : 0, delay: index * 0.2 }}
                      style={{
                        position: 'absolute',
                        width: point.size * 2,
                        height: point.size * 2,
                        borderRadius: '50%',
                        background: color,
                        opacity: 0.3,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                    <div
                      style={{
                        width: point.size / 1.5,
                        height: point.size / 1.5,
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                      }}
                    />
                  </motion.div>
                ) : null
              )}
          </div>
        </div>
      </div>
    );
  };

  const renderLeadsScene = ({ isActive, progress, color }: SimProps) => {
    const fields = [
      { label: 'Nombre', value: 'Carlos Mendoza', icon: <User size={10} /> },
      { label: 'WhatsApp', value: '+54 381 555-1234', icon: <Phone size={10} /> },
      { label: 'Servicio', value: 'Consulta de precios', icon: <MessageSquare size={10} /> },
    ];
    const fieldProgress = [0, 0.13, 0.26];
    const showSubmit = progress > 0.38;
    const submitting = progress > 0.4 && progress < 0.55;
    const showNotif = progress > 0.62;
    const showResponse = progress > 0.82;

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
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span
            style={{
              fontSize: 8,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
            }}
          >
            FORMULARIO DE CONTACTO
          </span>
          <span style={{ fontSize: 8, color }}>{'CAPTACIÓN 24/7'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {fields.map((field, index) => {
            const fieldVisible = progress > fieldProgress[index];
            const charCount = fieldVisible
              ? Math.floor(((progress - fieldProgress[index]) / 0.13) * field.value.length)
              : 0;
            const displayValue = field.value.slice(0, Math.min(charCount, field.value.length));
            const isCompleted = charCount >= field.value.length;

            return (
              <AnimatePresence key={field.label}>
                {fieldVisible && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isCompleted ? `${color}35` : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 8,
                      padding: '7px 10px',
                      transition: 'border-color 300ms',
                    }}
                  >
                    <div style={{ color: isCompleted ? color : 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                      {field.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>
                        {field.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.8)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {displayValue}
                        {!isCompleted && (
                          <motion.span
                            animate={isActive ? { opacity: [1, 0, 1] } : { opacity: 1 }}
                            transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                            style={{ borderRight: `1px solid ${color}`, marginLeft: 1 }}
                          >
                            &nbsp;
                          </motion.span>
                        )}
                      </div>
                    </div>

                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                        style={{ flexShrink: 0 }}
                      >
                        <Check size={10} color={color} />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>

        {showSubmit && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: submitting ? `${color}40` : `${color}20`,
              border: `1px solid ${color}50`,
              borderRadius: 8,
              padding: '9px',
              textAlign: 'center',
              fontSize: 10,
              fontWeight: 600,
              color,
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {submitting ? (
              <>
                <motion.div
                  animate={isActive ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.8, repeat: isActive ? Infinity : 0, ease: 'linear' }}
                  style={{
                    width: 10,
                    height: 10,
                    border: `1.5px solid ${color}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                  }}
                />
                ENVIANDO...
              </>
            ) : (
              'CONSULTA ENVIADA ✓'
            )}
          </motion.div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {showNotif && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                background: 'rgba(37, 211, 102, 0.08)',
                border: '1px solid rgba(37, 211, 102, 0.25)',
                borderRadius: 8,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  background: 'rgba(37,211,102,0.15)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={11} color="#25D366" />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#25D366', marginBottom: 2 }}>
                  {'WhatsApp → Tu equipo'}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
                  {'"Nueva consulta: Carlos Mendoza — Precios"'}
                </div>
              </div>

              <div
                style={{
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.2)',
                  marginLeft: 'auto',
                  flexShrink: 0,
                }}
              >
                ahora
              </div>
            </motion.div>
          )}

          {showResponse && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              style={{
                background: `${color}08`,
                border: `1px solid ${color}25`,
                borderRadius: 8,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  background: `${color}15`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={11} color={color} />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color, marginBottom: 2 }}>
                  {'IA → Carlos Mendoza'}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
                  {'"¡Hola Carlos! Recibimos tu consulta, te contactamos en minutos 🚀"'}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const renderMapsScene = ({ isActive, progress, color }: SimProps) => {
    const showMap = progress > 0.15;
    const competitorPins = [
      { x: '35%', y: '45%', name: 'Sin web', stars: 2.8, delay: 0.22 },
      { x: '65%', y: '38%', name: 'Sin info', stars: 3.1, delay: 0.32 },
      { x: '55%', y: '62%', name: 'Sin fotos', stars: 3.4, delay: 0.38 },
    ];
    const showClient = progress > 0.48;
    const showPanel = progress > 0.78;

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '4px 2px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span
            style={{
              fontSize: 8,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
            }}
          >
            {'GOOGLE MAPS \u00b7 LOCAL'}
          </span>
          <span style={{ fontSize: 8, color }}>{'PRIMERA POSICI\u00d3N'}</span>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: 6, overflow: 'hidden' }}>
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              position: 'relative',
              overflow: 'hidden',
              minHeight: 120,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 58% 42%, ${color}10 0%, transparent 34%), linear-gradient(180deg, rgba(7,11,16,0.88) 0%, rgba(5,8,12,0.94) 100%)`,
                pointerEvents: 'none',
              }}
            />

            {showMap && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            )}

            {competitorPins.map((pin) =>
              progress > pin.delay ? (
                <motion.div
                  key={pin.name}
                  initial={{ scale: 0, y: -10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  style={{
                    position: 'absolute',
                    left: pin.x,
                    top: pin.y,
                    transform: 'translate(-50%, -100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(100,100,100,0.8)',
                      border: '1px solid rgba(150,150,150,0.3)',
                      borderRadius: '50% 50% 50% 0',
                      transform: 'rotate(-45deg)',
                      width: 16,
                      height: 16,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 7,
                      color: 'rgba(255,255,255,0.3)',
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {`${pin.stars}\u2b50`}
                  </div>
                </motion.div>
              ) : null
            )}

            {showClient && (
              <motion.div
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '40%',
                  transform: 'translate(-50%, -100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 10,
                }}
              >
                <motion.div
                  animate={isActive ? { y: [0, -4, 0] } : { y: 0 }}
                  transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                  style={{
                    background: color,
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    width: 24,
                    height: 24,
                    boxShadow: `0 0 16px ${color}60`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      transform: 'rotate(45deg)',
                      fontSize: 8,
                      color: 'black',
                    }}
                  >
                    {'\u2605'}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    background: color,
                    color: 'black',
                    fontSize: 8,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    marginTop: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {'TU EMPRESA \u00b7 5.0 \u2b50'}
                </motion.div>
              </motion.div>
            )}
          </div>

          {showPanel && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                width: 110,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${color}25`,
                borderRadius: 8,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>
                  TU EMPRESA
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color }}>5.0</span>
                  <div>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} style={{ fontSize: 9, color: '#f59e0b' }}>
                        {'\u2605'}
                      </span>
                    ))}
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>47 rese\u00f1as</div>
                  </div>
                </div>
              </div>

              {[
                { label: 'Fotos', status: true },
                { label: 'Horarios', status: true },
                { label: 'Web', status: true },
                { label: 'WhatsApp', status: true },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                  <span style={{ fontSize: 9, color }}>{'\u2713'}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    );
  };

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
              fontSize: 10,
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
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: 8,
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
          padding: '2px 8px 10px',
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
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            Operacion digital en cuatro vistas
          </span>
        </div>

        <div
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            border: `1px solid ${activeSimulation.color}2f`,
            background: `${activeSimulation.color}12`,
            color: activeSimulation.color,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {isInView ? 'Viewport on' : 'Viewport off'}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '0 0 8px',
          flexShrink: 0,
        }}
      >
        {webSimulations.map((simulation, index) => {
          const isActive = index === activeTab;

          return (
            <button
              key={simulation.id}
              type="button"
              onClick={() => handleTabClick(index)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 4px',
                background: isActive ? `${simulation.color}12` : 'rgba(255,255,255,0.01)',
                border: `1px solid ${isActive ? `${simulation.color}35` : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ color: isActive ? simulation.color : 'rgba(255,255,255,0.25)' }}>
                {simulation.icon}
              </div>

              <span
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? simulation.color : 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap',
                }}
              >
                {simulation.label}
              </span>

              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: 2,
                    width: `${progress * 100}%`,
                    background: simulation.color,
                    transition: 'none',
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
              ? renderSEOScene({
                  isActive: isInView,
                  progress,
                  color: activeSimulation.color,
                })
              : activeTab === 1
                ? renderAnalyticsScene({
                    isActive: isInView,
                    progress,
                    color: activeSimulation.color,
                  })
              : activeTab === 2
                  ? renderLeadsScene({
                      isActive: isInView,
                      progress,
                      color: activeSimulation.color,
                    })
                : activeTab === 3
                  ? renderMapsScene({
                      isActive: isInView,
                      progress,
                      color: activeSimulation.color,
                    })
              : activePlaceholder &&
                renderPlaceholderScene({
                  isActive: isInView,
                  progress,
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

const CHAT_MESSAGES = [
  {
    id: 1,
    text: 'Hola! Tienen la Hilux 4x4 disponible?',
    from: 'user',
    time: '22:47',
    delay: 0,
  },
  {
    id: 2,
    text: 'Hola! Si, tenemos 2 unidades disponibles. Te paso los precios ahora mismo 🚗',
    from: 'bot',
    time: '22:47',
    delay: 1.4,
  },
  {
    id: 3,
    text: 'Hilux 4x4 AT: $45.000 USD\nHilux 4x4 MT: $42.500 USD\n¿Queres coordinar un test drive?',
    from: 'bot',
    time: '22:48',
    delay: 2.4,
  },
  {
    id: 4,
    text: 'Si! Cuando tienen disponible?',
    from: 'user',
    time: '22:49',
    delay: 3.8,
  },
  {
    id: 5,
    text: 'Tengo lugar manana a las 10hs o el jueves a las 16hs. ¿Cual te queda mejor?',
    from: 'bot',
    time: '22:49',
    delay: 5.0,
  },
] as const;

function AIScene({ service }: { service: Service }) {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cycle = () => {
      setVisibleMessages([]);
      setIsTyping(false);
      setCycleKey((currentKey) => currentKey + 1);
    };

    const interval = setInterval(cycle, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    CHAT_MESSAGES.forEach((message) => {
      if (message.from === 'bot') {
        timers.push(
          setTimeout(() => {
            setIsTyping(true);
          }, message.delay * 1000 - 800)
        );
      }

      timers.push(
        setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages((previous) => [...previous, message.id]);

          requestAnimationFrame(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
          });
        }, message.delay * 1000)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [cycleKey]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 8,
        background:
          'radial-gradient(circle at top, rgba(139,92,246,0.08) 0%, rgba(14,16,22,0.92) 52%, rgba(7,8,12,1) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 8,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: `${service.accent}20`,
            border: `1px solid ${service.accent}4d`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Bot size={15} color={service.accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
            Agente develOP
          </div>
          <div
            style={{
              fontSize: 10,
              color: '#25D366',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#25D366' }} />
            En linea · Responde al instante
          </div>
        </div>
        <div
          style={{
            fontSize: 9,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.05em',
          }}
        >
          WhatsApp
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '4px 8px',
        }}
      >
        <AnimatePresence>
          {CHAT_MESSAGES.filter((message) => visibleMessages.includes(message.id)).map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                alignSelf: message.from === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              <div
                style={{
                  background: message.from === 'user' ? `${service.accent}20` : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${
                    message.from === 'user' ? `${service.accent}4d` : 'rgba(255,255,255,0.08)'
                  }`,
                  borderRadius: message.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '8px 12px',
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: 'rgba(255,255,255,0.85)',
                  whiteSpace: 'pre-line',
                }}
              >
                {message.text}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.25)',
                  marginTop: 3,
                  textAlign: message.from === 'user' ? 'right' : 'left',
                  paddingLeft: message.from === 'bot' ? 4 : 0,
                  paddingRight: message.from === 'user' ? 4 : 0,
                }}
              >
                {message.time}
                {message.from === 'bot' && ' · IA'}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px 12px 12px 2px',
                padding: '8px 14px',
                display: 'flex',
                gap: 4,
                alignItems: 'center',
              }}
            >
              {[0, 0.2, 0.4].map((delay, index) => (
                <motion.div
                  key={index}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.5, delay, repeat: Infinity }}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: `${service.accent}99`,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function useMagneticOffset() {
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, { stiffness: 150, damping: 10, mass: 0.55 });
  const y = useSpring(targetY, { stiffness: 150, damping: 10, mass: 0.55 });

  return { targetX, targetY, x, y };
}

function MagneticFlowPath({
  fromX,
  fromY,
  toX,
  toY,
  burstWidth,
  burstOpacity,
  burstFilter,
  color,
  connectionIndex,
}: {
  fromX: MotionValue<number>;
  fromY: MotionValue<number>;
  toX: MotionValue<number>;
  toY: MotionValue<number>;
  burstWidth: MotionValue<number>;
  burstOpacity: MotionValue<number>;
  burstFilter: MotionValue<string>;
  color: string;
  connectionIndex: number;
}) {
  const controlX1 = useTransform(() => fromX.get() + (toX.get() - fromX.get()) * 0.36);
  const controlX2 = useTransform(() => toX.get() - (toX.get() - fromX.get()) * 0.36);
  const pathD = useMotionTemplate`M ${fromX} ${fromY} C ${controlX1} ${fromY}, ${controlX2} ${toY}, ${toX} ${toY}`;

  return (
    <>
      <motion.path d={pathD} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1.2} strokeLinecap="round" />
      <motion.path
        d={pathD}
        fill="none"
        stroke={`${color}60`}
        strokeWidth={1}
        strokeDasharray="4 8"
        strokeLinecap="round"
        animate={{ strokeDashoffset: [0, -24] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: connectionIndex * 0.12,
          ease: 'linear',
        }}
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        style={{
          strokeWidth: burstWidth,
          opacity: burstOpacity,
          filter: burstFilter,
        }}
      />
    </>
  );
}

function AutomationScene({ service }: { service: Service }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const burstEnergyRaw = useTransform(scrollVelocity, (value) => Math.min(Math.abs(value) / 2200, 1));
  const burstEnergy = useSpring(burstEnergyRaw, {
    stiffness: 210,
    damping: 24,
    mass: 0.38,
  });

  const burstWidth = useTransform(burstEnergy, [0, 1], [0.8, 3.8]);
  const burstOpacity = useTransform(burstEnergy, [0, 1], [0.05, 0.92]);
  const burstBlur = useTransform(burstEnergy, [0, 1], [0, 16]);
  const burstFilter = useMotionTemplate`drop-shadow(0 0 ${burstBlur}px rgba(34,211,238,0.92))`;

  const stripe = useMagneticOffset();
  const n8n = useMagneticOffset();
  const whatsapp = useMagneticOffset();
  const crm = useMagneticOffset();
  const erp = useMagneticOffset();

  const nodeDefs = [
    { id: 'stripe', label: 'Stripe', color: '#635bff', x: 52, y: 54, magnet: stripe },
    { id: 'n8n', label: 'N8N', color: '#10b981', x: 154, y: 110, magnet: n8n },
    { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', x: 266, y: 50, magnet: whatsapp },
    { id: 'crm', label: 'CRM', color: service.accent, x: 262, y: 182, magnet: crm },
    { id: 'erp', label: 'ERP', color: '#38bdf8', x: 86, y: 184, magnet: erp },
  ] as const;

  const stripeX = useTransform(stripe.x, (value) => 52 + value);
  const stripeY = useTransform(stripe.y, (value) => 54 + value);
  const n8nX = useTransform(n8n.x, (value) => 154 + value);
  const n8nY = useTransform(n8n.y, (value) => 110 + value);
  const whatsappX = useTransform(whatsapp.x, (value) => 266 + value);
  const whatsappY = useTransform(whatsapp.y, (value) => 50 + value);
  const crmX = useTransform(crm.x, (value) => 262 + value);
  const crmY = useTransform(crm.y, (value) => 182 + value);
  const erpX = useTransform(erp.x, (value) => 86 + value);
  const erpY = useTransform(erp.y, (value) => 184 + value);

  const connections = [
    {
      fromX: stripeX,
      fromY: stripeY,
      toX: n8nX,
      toY: n8nY,
      color: '#635bff',
    },
    {
      fromX: n8nX,
      fromY: n8nY,
      toX: whatsappX,
      toY: whatsappY,
      color: '#25D366',
    },
    {
      fromX: n8nX,
      fromY: n8nY,
      toX: crmX,
      toY: crmY,
      color: service.accent,
    },
    {
      fromX: n8nX,
      fromY: n8nY,
      toX: erpX,
      toY: erpY,
      color: '#38bdf8',
    },
  ] as const;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cursorX = ((event.clientX - rect.left) / rect.width) * 320;
    const cursorY = ((event.clientY - rect.top) / rect.height) * 240;

    nodeDefs.forEach((node) => {
      const dx = cursorX - node.x;
      const dy = cursorY - node.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= 100) {
        const attraction = (1 - distance / 100) * 0.52;
        node.magnet.targetX.set(dx * attraction);
        node.magnet.targetY.set(dy * attraction);
        return;
      }

      node.magnet.targetX.set(0);
      node.magnet.targetY.set(0);
    });
  };

  const handlePointerLeave = () => {
    nodeDefs.forEach((node) => {
      node.magnet.targetX.set(0);
      node.magnet.targetY.set(0);
    });
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_center,#11161d_0%,#0a0d11_58%,#07090c_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_28%,transparent_72%,rgba(255,255,255,0.03))]" />

      <svg
        viewBox="0 0 320 240"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        {connections.map((connection, index) => (
          <MagneticFlowPath
            key={`${index}-${connection.color}`}
            fromX={connection.fromX}
            fromY={connection.fromY}
            toX={connection.toX}
            toY={connection.toY}
            burstWidth={burstWidth}
            burstOpacity={burstOpacity}
            burstFilter={burstFilter}
            color={connection.color}
            connectionIndex={index}
          />
        ))}
      </svg>

      {nodeDefs.map((node, nodeIndex) => (
        <motion.div
          key={node.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(node.x / 320) * 100}%`,
            top: `${(node.y / 240) * 100}%`,
            x: node.magnet.x,
            y: node.magnet.y,
            zIndex: node.id === 'n8n' ? 2 : 1,
          }}
        >
          {node.id === 'n8n' ? (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 35% 35%, rgba(16,185,129,0.25), rgba(16,185,129,0.08))',
                border: '1px solid rgba(16,185,129,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(16,185,129,0.12)',
                position: 'relative',
              }}
            >
              {[80, 96, 112].map((size, index) => (
                <motion.div
                  key={index}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 2 + index * 0.5, repeat: Infinity, delay: index * 0.6 }}
                  style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}
                />
              ))}
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>N8N</span>
            </div>
          ) : (
            <div
              style={{
                position: 'relative',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: nodeIndex * 0.4 }}
                style={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  border: `1px solid ${node.color}50`,
                }}
              />

              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${node.color}30, ${node.color}10)`,
                  border: `1px solid ${node.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 20px ${node.color}15, inset 0 1px 0 ${node.color}20`,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: node.color,
                    boxShadow: `0 0 8px ${node.color}`,
                  }}
                />
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: -20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 9,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                {node.label}
              </div>
            </div>
          )}
        </motion.div>
      ))}

      <motion.div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 8,
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }}
        />
        <span style={{ fontSize: 9, color: 'rgba(16,185,129,0.8)', fontWeight: 500 }}>
          23 ejecuciones hoy
        </span>
      </motion.div>
    </div>
  );
}

function SoftwareScene({ service }: { service: Service }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const springConfig = { stiffness: 160, damping: 22, mass: 0.45 };
  const smoothX = useSpring(pointerX, springConfig);
  const smoothY = useSpring(pointerY, springConfig);

  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [15, -15]);

  const glareX = useTransform(smoothX, [-0.5, 0.5], [18, 82]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], [18, 82]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.16), rgba(34,211,238,0.12) 18%, rgba(255,255,255,0.06) 34%, transparent 58%)`;

  const backX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const backY = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);
  const midX = useTransform(smoothX, [-0.5, 0.5], [-22, 22]);
  const midY = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);
  const frontX = useTransform(smoothX, [-0.5, 0.5], [-34, 34]);
  const frontY = useTransform(smoothY, [-0.5, 0.5], [-28, 28]);
  const coreX = useTransform(smoothX, [-0.5, 0.5], [-42, 42]);
  const coreY = useTransform(smoothY, [-0.5, 0.5], [-36, 36]);

  const codeLines = [
    { code: 'const pipeline = {', indent: 0, color: 'rgba(255,255,255,0.5)' },
    { code: '  leads: "captured",', indent: 1, color: '#06b6d4' },
    { code: '  sync: "crm.live",', indent: 1, color: '#10b981' },
    { code: '  revenue: "$47.200",', indent: 1, color: '#f59e0b' },
    { code: '  state: "stable"', indent: 1, color: '#8b5cf6' },
    { code: '};', indent: 0, color: 'rgba(255,255,255,0.5)' },
  ] as const;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    pointerX.set(Math.max(-0.5, Math.min(0.5, relativeX)));
    pointerY.set(Math.max(-0.5, Math.min(0.5, relativeY)));
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div className="h-full w-full [perspective:1000px]">
      <motion.div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_top,#141821_0%,#090b0f_64%,#060709_100%)]"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{ background: glareBackground }}
        />

        <div
          className="pointer-events-none absolute inset-[8%] rounded-[20px] border border-white/6"
          style={{ transform: 'translateZ(10px)' }}
        />

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-35"
          style={{
            background: `radial-gradient(circle, ${service.accent}55 0%, ${service.accent}18 38%, transparent 76%)`,
            transform: 'translateZ(24px)',
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:100%_24px]"
          style={{ transform: 'translateZ(0px)' }}
        />

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:32px_100%]"
          style={{ transform: 'translateZ(0px)' }}
        />

        <div
          className="pointer-events-none absolute left-6 top-6 text-[10px] uppercase tracking-[0.32em] text-white/28"
          style={{ transform: 'translateZ(36px)' }}
        >
          Data Core / Software
        </div>

        <div
          className="pointer-events-none absolute right-6 top-6 rounded-full border border-white/8 px-3 py-1"
          style={{ transform: 'translateZ(52px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}
            />
            <span style={{ fontSize: 9, color: '#10b981', fontWeight: 600, letterSpacing: '0.05em' }}>
              SISTEMA ACTIVO
            </span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
              · ultima sync hace 2s
            </span>
          </div>
        </div>

        <div
          className="absolute left-[8%] top-[18%] w-[74%]"
          style={{ transformStyle: 'preserve-3d', transform: 'translateZ(34px)' }}
        >
          <motion.div
            style={{ x: backX, y: backY }}
            className="overflow-hidden rounded-[16px] border border-white/7 bg-white/[0.025] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
          >
            <div className="mb-3 text-[8px] uppercase tracking-[0.18em] text-white/28">runtime.ts</div>
            {codeLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: line.color,
                  paddingLeft: line.indent * 16,
                  lineHeight: 1.8,
                }}
              >
                {line.code}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div
          className="absolute right-[7%] top-[34%] w-[40%]"
          style={{ transformStyle: 'preserve-3d', transform: 'translateZ(82px)' }}
        >
          <motion.div
            style={{ x: midX, y: midY }}
            className="overflow-hidden rounded-[18px] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
          >
            <div
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: 'rgba(16,185,129,0.6)',
                  marginBottom: 4,
                  letterSpacing: '0.08em',
                }}
              >
                REVENUE HOY
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>$47.200</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                ↑ 12% vs ayer
              </div>
            </div>
          </motion.div>
        </div>

        <div
          className="absolute left-[14%] top-[56%] w-[38%]"
          style={{ transformStyle: 'preserve-3d', transform: 'translateZ(138px)' }}
        >
          <motion.div
            style={{ x: frontX, y: frontY }}
            className="overflow-hidden rounded-[20px] shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
          >
            <div
              style={{
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.2)',
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: 'rgba(6,182,212,0.6)',
                  marginBottom: 4,
                  letterSpacing: '0.08em',
                }}
              >
                LEADS ACTIVOS
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#06b6d4' }}>34</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                8 cerrando esta semana
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="pointer-events-none absolute bottom-6 right-6 rounded-[18px] border px-4 py-3 shadow-[0_24px_60px_rgba(0,0,0,0.32)]"
          style={{
            x: coreX,
            y: coreY,
            transform: 'translateZ(164px)',
            borderColor: `${service.accent}35`,
            background: 'rgba(8, 11, 16, 0.76)',
          }}
        >
          <div className="text-[9px] uppercase tracking-[0.26em] text-white/40">Core State</div>
          <div className="mt-2 text-2xl font-bold tracking-[-0.06em] text-white">Stable</div>
          <div className="mt-1 text-[10px]" style={{ color: service.accent }}>
            0 monthly licenses
          </div>
        </motion.div>
      </motion.div>
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
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start 85%', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 0.12, 0.9, 1], [0.955, 1, 1, 0.985]);
  const opacity = useTransform(scrollYProgress, [0, 0.08, 0.9, 1], [0.12, 1, 1, 0.72]);
  const y = useTransform(scrollYProgress, [0, 0.12, 0.9, 1], [28, 0, 0, -12]);
  const blur = useTransform(scrollYProgress, [0, 0.1], [4, 0]);
  const brightness = useTransform(scrollYProgress, [0, 0.08, 0.9, 1], [0.82, 1, 1, 0.88]);
  const textX = useTransform(scrollYProgress, [0, 0.14], [-16, 0]);
  const visualX = useTransform(scrollYProgress, [0, 0.17], [16, 0]);
  const numberOpacity = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.85, 0.95, 1], [0, 0.04, 0, 0, 0.04, 0]);
  const filter = useMotionTemplate`blur(${blur}px) brightness(${brightness})`;
  const stickyTop = `calc(8vh + ${index * 18}px)`;
  const isWebDevelopmentService = service.id === 1;

  return (
    <div ref={cardRef} className="relative h-auto md:h-[100vh]" style={{ zIndex: index + 1 }}>
      <motion.article
        style={{ scale, opacity, y, filter, top: stickyTop }}
        className="relative mx-auto min-h-[78vh] overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.02] shadow-[0_0_100px_rgba(0,0,0,0.8),0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:sticky md:h-[80vh] md:max-h-[80vh]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_34%,transparent_74%,rgba(255,255,255,0.02))]" />
        <motion.div
          style={{
            position: 'absolute',
            right: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '20vw',
            fontWeight: 900,
            color: service.accent,
            opacity: numberOpacity,
            pointerEvents: 'none',
            letterSpacing: '-0.05em',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          0{service.id}
        </motion.div>

        <div className="relative grid w-full items-stretch gap-6 p-4 sm:p-6 md:p-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 lg:p-10">
          <motion.div
            style={{ x: textX }}
            className="order-2 flex min-h-0 flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.02] p-5 backdrop-blur-2xl sm:p-6 lg:order-1 lg:p-8"
          >
            {isWebDevelopmentService ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 20 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    style={{ height: 1, background: service.accent }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.2em',
                      color: service.accent,
                    }}
                  >
                    {service.tag}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 'clamp(1.6rem, 2.5vw, 2.4rem)',
                    fontWeight: 800,
                    lineHeight: 1.08,
                    letterSpacing: '-0.025em',
                    color: 'white',
                    marginBottom: 16,
                  }}
                >
                  {service.title}
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: 24,
                  }}
                >
                  {service.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {service.outcomes.map((outcome, outcomeIndex) => (
                    <motion.div
                      key={outcome}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: outcomeIndex * 0.08 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          background: `${service.accent}12`,
                          border: `1px solid ${service.accent}25`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Check size={10} color={service.accent} />
                      </div>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{outcome}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 24 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ height: 1, background: service.accent, flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.2em',
                      color: service.accent,
                      textTransform: 'uppercase',
                    }}
                  >
                    {service.tag}
                  </span>
                </motion.div>

                <h3
                  style={{
                    fontSize: 'clamp(1.8rem, 2.8vw, 2.6rem)',
                    fontWeight: 800,
                    lineHeight: 1.08,
                    letterSpacing: '-0.025em',
                    color: 'white',
                    margin: '0 0 20px',
                  }}
                >
                  {service.title}
                </h3>

                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.45)',
                    margin: '0 0 28px',
                    maxWidth: '90%',
                  }}
                >
                  {service.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                  {service.outcomes.map((outcome, outcomeIndex) => (
                    <motion.div
                      key={outcome}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: outcomeIndex * 0.06, duration: 0.3 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 100,
                        background: `${service.accent}08`,
                        border: `1px solid ${service.accent}20`,
                      }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: service.accent,
                          opacity: 0.8,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: 'rgba(255,255,255,0.6)',
                          fontWeight: 400,
                        }}
                      >
                        {outcome}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {isWebDevelopmentService ? (
              <div>
                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: 20,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.3)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    DESDE
                  </span>
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 800,
                      color: 'white',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                    }}
                  >
                    {service.price}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: service.accent,
                      background: `${service.accent}12`,
                      border: `1px solid ${service.accent}25`,
                      borderRadius: 100,
                      padding: '4px 10px',
                      fontWeight: 500,
                    }}
                  >
                    {'⏱ '}
                    {service.timeline}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {service.sectors.map((sector) => (
                    <span
                      key={sector}
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 4,
                        padding: '3px 8px',
                      }}
                    >
                      {sector}
                    </span>
                  ))}
                </div>

                <motion.button
                  type="button"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  onClick={() => onNavigate(service.href)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    color: service.accent,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {service.cta}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    {'↗'}
                  </motion.span>
                </motion.button>
              </div>
            ) : (
            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  DESDE
                </span>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: 'white',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {service.price}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: service.accent,
                    background: `${service.accent}12`,
                    border: `1px solid ${service.accent}25`,
                    borderRadius: 100,
                    padding: '4px 10px',
                    fontWeight: 500,
                  }}
                >
                  <span aria-hidden="true">⏱ </span>
                  {service.timeline}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {service.sectors.map((sector) => (
                  <span
                    key={sector}
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.3)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 4,
                      padding: '3px 8px',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {sector}
                  </span>
                ))}
              </div>

              <motion.button
                type="button"
                whileHover={{ x: 6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => onNavigate(service.href)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: service.accent,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {service.cta}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{ display: 'inline-flex' }}
                >
                  <ArrowUpRight size={15} />
                </motion.span>
              </motion.button>
              </div>
            )}
          </motion.div>

          <motion.div
            style={{ x: visualX }}
            className="order-1 min-h-[320px] overflow-hidden rounded-3xl lg:order-2"
          >
            <ServiceVisual service={service} />
          </motion.div>
        </div>
      </motion.article>
    </div>
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

export default function OurServices() {
  const SERVICE_ACCENTS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'] as const;
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const { triggerTransition } = useTransitionContext();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
              setActiveServiceIndex(index);
            }
          });
        },
        {
          threshold: [0.3, 0.5, 0.7],
          rootMargin: '-20% 0px -20% 0px',
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const activeAccent = SERVICE_ACCENTS[activeServiceIndex];

  const headerY = useTransform(scrollYProgress, [0, 1], [0, -32]);
  const headerScale = useTransform(scrollYProgress, [0, 1], [1, 0.985]);

  return (
    <section
      ref={sectionRef}
      id="servicios"
      className="relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 50% 14%, rgba(42, 79, 93, 0.18) 0%, rgba(19, 29, 49, 0.14) 20%, rgba(3, 3, 5, 0) 44%),
          radial-gradient(circle at 50% -8%, rgba(18, 25, 41, 0.58) 0%, rgba(7, 9, 14, 0.9) 36%, #030305 72%),
          linear-gradient(180deg, #06070b 0%, #030305 34%, #020203 100%)
        `,
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          animate={{
            background: `radial-gradient(
              ellipse 80% 60% at 50% 40%,
              ${activeAccent}08 0%,
              ${activeAccent}04 35%,
              transparent 70%
            )`,
          }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '-15%',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.015)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <motion.div
          animate={{
            background: `radial-gradient(
              circle,
              ${activeAccent}06 0%,
              transparent 70%
            )`,
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '30%',
            right: '-10%',
            width: '35vw',
            height: '35vw',
            borderRadius: '50%',
            filter: 'blur(100px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(
              ellipse 100% 100% at 50% 50%,
              transparent 40%,
              rgba(0,0,0,0.4) 100%
            )`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <motion.div
          animate={{
            background: `linear-gradient(
              90deg,
              transparent 0%,
              ${activeAccent}20 30%,
              ${activeAccent}40 50%,
              ${activeAccent}20 70%,
              transparent 100%
            )`,
          }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        <FloatingParticles activeAccent={activeAccent} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 pb-16 pt-20 sm:px-8 lg:px-10 lg:pt-28">
        <motion.div
          style={{ y: headerY, scale: headerScale }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 100,
              padding: '6px 16px',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#06b6d4',
                boxShadow: '0 0 8px #06b6d4',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              STACK DEVELOP
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: '0 0 24px',
            }}
          >
            <span
              style={{
                display: 'block',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              Todo lo que tu negocio
            </span>
            <span
              style={{
                display: 'block',
                fontWeight: 800,
                color: 'white',
              }}
            >
              necesita para crecer.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.4)',
              maxWidth: 520,
              margin: '0 auto',
            }}
          >
            Desde tu primera presencia digital hasta un ecosistema completo con IA y automatizaciones.
            {' '}Cada solucion disenada para generar resultados reales, no solo tecnologia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
              marginTop: 32,
            }}
          >
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.08, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 100,
                  border: `1px solid ${service.accent}25`,
                  background: `${service.accent}08`,
                  cursor: 'default',
                }}
              >
                <service.icon
                  size={13}
                  color={service.accent}
                  strokeWidth={1.5}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.65)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {service.tag}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: service.accent,
                    opacity: 0.7,
                    borderLeft: `1px solid ${service.accent}30`,
                    paddingLeft: 8,
                  }}
                >
                  {service.price}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <div
          style={{
            height: 1,
            margin: '64px 0 0',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
          }}
        />

        <div className="relative mt-16 md:min-h-[400vh]">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden md:block">
            <div
              style={{
                position: 'sticky',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '0 0 0 16px',
                zIndex: 10,
              }}
            >
              {SERVICES.map((service, index) => (
                <motion.div
                  key={service.id}
                  animate={{
                    height: activeServiceIndex === index ? 32 : 12,
                    background: activeServiceIndex === index ? service.accent : 'rgba(255,255,255,0.15)',
                    opacity: activeServiceIndex === index ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    width: 2,
                    borderRadius: 100,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6 md:space-y-0">
            {SERVICES.map((service, index) => (
              <div
                key={service.id}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
              >
                <ServiceCard
                  service={service}
                  index={index}
                  onNavigate={triggerTransition}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
