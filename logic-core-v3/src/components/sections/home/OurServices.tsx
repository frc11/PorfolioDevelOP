'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  type MotionValue,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  BarChart2,
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
  Phone,
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
              fontSize: 9,
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
              fontSize: 8,
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
    { id: 4, label: 'Google Maps', icon: <MapsGlyph />, duration: 4000, color: service.accent },
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

  function SimSEO({ isActive, progress, color }: SimProps) {
    const query = 'Clínica odontológica en Tucumán';
    const typedLength = Math.floor(Math.min(progress / 0.25, 1) * query.length);
    const typedQuery = query.slice(0, typedLength);
    const showResults = progress > 0.28;
    const highlightFirst = progress > 0.55;
    const showStars = progress > 0.7;

    return (
      <div
        style={{
          height: '100%',
          minHeight: 0,
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '4px 2px',
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
            padding: '10px 14px',
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
            gap: 6,
            flex: 1,
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
                padding: '12px 14px',
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
                    fontSize: 8,
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
                  fontSize: 13,
                  fontWeight: highlightFirst ? 700 : 400,
                  color: highlightFirst ? 'white' : 'rgba(255,255,255,0.4)',
                  marginBottom: 4,
                  transition: 'all 400ms',
                  lineHeight: 1.3,
                }}
              >
                Tu Empresa | develOP
              </div>

              {/* Descripción */}
              <div
                style={{
                  fontSize: 10,
                  color: highlightFirst ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
                  lineHeight: 1.5,
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
                    marginTop: 8,
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

          {/* RESULTADOS 2 y 3 — competidores */}
          {[
            {
              pos: 2,
              url: 'competidor1.com',
              title: 'Competidor Local — Servicios',
              desc: 'Información básica. Sin optimización.',
            },
            {
              pos: 3,
              url: 'directoriolocal.com',
              title: 'Directorio de empresas',
              desc: 'Listado general sin diferenciación.',
            },
          ].map(
            (result, i) =>
              showResults &&
              progress > 0.35 + i * 0.1 && (
                <motion.div
                  key={result.pos}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: highlightFirst ? 0.35 : 0.7,
                    y: 0,
                    filter: highlightFirst ? 'grayscale(0.6)' : 'none',
                  }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 10,
                    padding: '10px 14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
                      #{result.pos}
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{result.url}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.35)',
                      marginBottom: 3,
                      fontWeight: 500,
                    }}
                  >
                    {result.title}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{result.desc}</div>
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
    const visiblePoints = Math.floor(progress * baseData.length);
    const showGraph = progress > 0.2;
    const showMap = progress > 0.4;

    // Silueta Argentina mejorada
    const argentinaPath =
      'M80,8 C88,8 98,12 105,20 C112,28 115,38 114,50 C113,60 108,68 110,80 C112,90 108,100 105,112 C102,122 104,132 100,142 C96,152 92,162 88,172 C84,182 80,192 76,202 C72,212 68,222 62,232 C56,242 50,252 44,260 C40,266 36,268 34,264 C32,258 34,250 36,242 C38,234 36,226 34,216 C32,206 34,196 32,186 C30,176 28,166 30,156 C28,146 26,136 28,126 C26,116 24,106 26,96 C24,86 22,76 24,66 C26,56 28,46 26,36 C28,28 34,18 42,12 C52,6 66,6 80,8Z';

    const mapCities = [
      { name: 'Buenos Aires', cx: 65, cy: 175, r: 6 },
      { name: 'C\u00f3rdoba', cx: 58, cy: 130, r: 5 },
      { name: 'Rosario', cx: 62, cy: 152, r: 4 },
      { name: 'Tucum\u00e1n', cx: 52, cy: 82, r: 4 },
      { name: 'Mendoza', cx: 40, cy: 138, r: 4 },
      { name: 'Salta', cx: 48, cy: 56, r: 3 },
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
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{'\u00daltimos 30 d\u00edas \u00b7 Tu sitio'}</div>
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
                  fontSize: 8,
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
                {'\u2191 '}
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
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.08em',
                  marginBottom: 8,
                }}
              >
                {'\u00daLTIMOS 12 D\u00cdAS'}
              </div>
              <svg
                viewBox="0 0 120 60"
                style={{ flex: 1, width: '100%', minHeight: 0, overflow: 'hidden' }}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {visiblePoints > 1 &&
                  (() => {
                    const pts = baseData.slice(0, visiblePoints).map((v, i) => ({
                      x: (i / (baseData.length - 1)) * 120,
                      y: 55 - (v / 160) * 50,
                    }));
                    const areaD = [
                      `M ${pts[0].x} 60`,
                      ...pts.map((p) => `L ${p.x} ${p.y}`),
                      `L ${pts[pts.length - 1].x} 60 Z`,
                    ].join(' ');
                    const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    return (
                      <>
                        <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />
                        <path
                          d={lineD}
                          fill="none"
                          stroke={color}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Punto final con glow */}
                        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill={color} />
                        <circle
                          cx={pts[pts.length - 1].x}
                          cy={pts[pts.length - 1].y}
                          r="6"
                          fill="none"
                          stroke={color}
                          strokeWidth="0.5"
                          opacity="0.4"
                        />
                      </>
                    );
                  })()}
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
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.08em',
                  marginBottom: 4,
                  flexShrink: 0,
                }}
              >
                ORIGEN
              </div>
              <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
                <svg
                  viewBox="20 5 100 270"
                  style={{ width: '100%', height: '100%' }}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Silueta Argentina */}
                  <path
                    d={argentinaPath}
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="0.8"
                  />
                  {/* Ciudades */}
                  {mapCities.map(
                    (city, i) =>
                      progress > 0.42 + i * 0.07 && (
                        <g key={city.name}>
                          {/* Anillo pulsante */}
                          <motion.circle
                            cx={city.cx}
                            cy={city.cy}
                            r={city.r * 2}
                            fill="none"
                            stroke={color}
                            strokeWidth="0.5"
                            animate={{ r: [city.r * 1.5, city.r * 3, city.r * 1.5], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                          />
                          {/* Punto */}
                          <motion.circle
                            cx={city.cx}
                            cy={city.cy}
                            r={city.r}
                            fill={color}
                            initial={{ r: 0, opacity: 0 }}
                            animate={{ r: city.r, opacity: 0.85 }}
                            transition={{ type: 'spring', stiffness: 300, delay: i * 0.08 }}
                            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
                          />
                        </g>
                      )
                  )}
                </svg>
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
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{'Captura autom\u00e1tica \u00b7 24/7'}</div>
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
            {'CAPTACI\u00d3N'}
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
                      fontSize: 8,
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
              {submitted ? '\u2713 CONSULTA ENVIADA' : 'ENVIANDO...'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notificaciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <AnimatePresence>
            {showWhatsApp && (
              <motion.div
                initial={{ opacity: 0, x: 16, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  background: 'rgba(37,211,102,0.07)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(37,211,102,0.20)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: 'rgba(37,211,102,0.15)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MessageSquare size={13} color="#25D366" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#25D366', marginBottom: 3 }}>
                    {'WhatsApp \u2192 Tu equipo'}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                    {'"Nueva consulta: Carlos Mendoza \u2014 Precios"'}
                  </div>
                </div>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>ahora</span>
              </motion.div>
            )}

            {showIA && (
              <motion.div
                initial={{ opacity: 0, x: 16, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
                style={{
                  background: `${color}07`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${color}20`,
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: `${color}15`,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={13} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 3 }}>{'IA \u2192 Carlos Mendoza'}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                    {'"\u00a1Hola Carlos! Recibimos tu consulta, te contactamos en minutos \ud83d\ude80"'}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
  function SimMaps({ isActive, progress, color }: SimProps) {
    const showGrid = progress > 0.1;
    const showCompetitors = progress > 0.22;
    const showClient = progress > 0.5;
    const showPanel = progress > 0.72;

    const competitors = [
      { x: '28%', y: '48%', rating: '2.8', delay: 0.22 },
      { x: '68%', y: '36%', rating: '3.1', delay: 0.3 },
      { x: '58%', y: '65%', rating: '3.4', delay: 0.38 },
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
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Tucumán, Argentina</div>
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
            display: 'flex',
            gap: 8,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Mapa */}
          <div
            style={{
              flex: 1,
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
                  backgroundSize: '24px 24px',
                }}
              />
            )}

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
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50% 50% 50% 0',
                          transform: 'rotate(-45deg)',
                          background: 'rgba(120,120,120,0.5)',
                          border: '1px solid rgba(160,160,160,0.25)',
                          backdropFilter: 'blur(8px)',
                        }}
                      />
                      <div
                        style={{
                          background: 'rgba(20,20,20,0.85)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 5,
                          padding: '2px 5px',
                          fontSize: 8,
                          color: 'rgba(255,255,255,0.35)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {comp.rating} â­
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
                  left: '50%',
                  top: '42%',
                  transform: 'translate(-50%, -100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  zIndex: 10,
                }}
              >
                {/* Anillos */}
                {[1, 2].map((ring) => (
                  <motion.div
                    key={ring}
                    animate={{
                      scale: [1, 2 + ring * 0.8],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 2.2,
                      delay: ring * 0.5,
                      repeat: isActive ? Infinity : 0,
                      ease: 'easeOut',
                    }}
                    style={{
                      position: 'absolute',
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      border: `1px solid ${color}`,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                    }}
                  />
                ))}

                {/* Pin */}
                <motion.div
                  animate={isActive ? { y: [0, -5, 0] } : { y: 0 }}
                  transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    boxShadow: `0 0 24px ${color}50, 0 4px 16px rgba(0,0,0,0.5)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <span style={{ transform: 'rotate(45deg)', fontSize: 13 }}></span>
                </motion.div>

                {/* Label */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, type: 'spring' }}
                  style={{
                    background: color,
                    backdropFilter: 'blur(8px)',
                    color: 'black',
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 6,
                    whiteSpace: 'nowrap',
                    boxShadow: `0 2px 12px ${color}40`,
                    letterSpacing: '0.03em',
                  }}
                >
                  TU EMPRESA · 5.0
                </motion.div>
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
                width: 108,
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${color}20`,
                borderRadius: 12,
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flexShrink: 0,
              }}
            >
              {/* Rating principal */}
              <div>
                <div
                  style={{
                    fontSize: 8,
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
                    fontSize: 7,
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
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>{item.label}</span>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color, fontWeight: 700 }}>{item.you}</span>
                      <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.15)' }}>vs</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{item.them}</span>
                    </div>
                  </div>
                ))}
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
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: 8,
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
            Lo que tu sitio hace por vos, en vivo
          </span>
          <span
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            Cada funci\u00f3n trabajando mientras dorm\u00eds
          </span>
        </div>

        <motion.div
          animate={{
            background: isInView ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
            borderColor: isInView ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)',
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
              background: isInView ? '#10b981' : 'rgba(255,255,255,0.2)',
              boxShadow: isInView ? '0 0 6px #10b981' : 'none',
            }}
            style={{ width: 5, height: 5, borderRadius: '50%' }}
          />
          <span
            style={{
              fontSize: 8,
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: isInView ? '#10b981' : 'rgba(255,255,255,0.25)',
            }}
          >
            {isInView ? 'ACTIVO' : 'PAUSADO'}
          </span>
        </motion.div>
      </div>

      <div
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

          return (
            <button
              key={sim.id}
              type="button"
              onClick={() => handleTabClick(index)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                padding: '10px 4px 8px',
                background: isActive ? `${sim.color}10` : 'transparent',
                border: `1px solid ${isActive ? `${sim.color}30` : 'transparent'}`,
                borderRadius: 10,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 200ms ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="tabGlow"
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
                  color: isActive ? sim.color : 'rgba(255,255,255,0.2)',
                  transition: 'color 200ms',
                  position: 'relative',
                }}
              >
                {sim.icon}
              </div>

              <span
                style={{
                  fontSize: 8,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? sim.color : 'rgba(255,255,255,0.2)',
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
              ? SimSEO({
                isActive: isInView,
                progress,
                color: activeSimulation.color,
              })
              : activeTab === 1
                ? SimAnalytics({
                  isActive: isInView,
                  progress,
                  color: activeSimulation.color,
                })
                : activeTab === 2
                  ? SimLeads({
                    isActive: isInView,
                    progress,
                    color: activeSimulation.color,
                  })
                  : activeTab === 3
                    ? SimMaps({
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

const AI_COLOR = '#10b981';

type AISimulation = {
  id: number;
  label: string;
  icon: LucideIcon;
  duration: number;
  color: string;
};

const AI_SIMULATIONS: AISimulation[] = [
  { id: 1, label: 'Chat IA', icon: MessageSquare, duration: 6000, color: AI_COLOR },
  { id: 2, label: 'Leads', icon: Target, duration: 5500, color: AI_COLOR },
  { id: 3, label: 'Agenda', icon: Calendar, duration: 5000, color: AI_COLOR },
  { id: 4, label: 'Métricas', icon: BarChart2, duration: 4500, color: AI_COLOR },
];

type AISimProps = { isActive: boolean; progress: number; color: string };

function SimChat({ isActive: _isActive, progress: _progress, color: _color }: AISimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Chat IA — próximo sprint</div>;
}
function SimLeadsIA({ isActive: _isActive, progress: _progress, color: _color }: AISimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Leads IA — próximo sprint</div>;
}
function SimAgenda({ isActive: _isActive, progress: _progress, color: _color }: AISimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Agenda — próximo sprint</div>;
}
function SimMétricas({ isActive: _isActive, progress: _progress, color: _color }: AISimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Métricas — próximo sprint</div>;
}

function AIScene({ service: _service }: { service: Service }) {
  type SimProps = { isActive: boolean; progress: number; color: string };

  function SimChat({ isActive, progress, color }: SimProps) {
    const clientMsg1 = 'Hola! Tienen la Toyota Hilux 4x4 disponible? Cuánto sale?';
    const botMsg1 =
      '¡Hola!  Sí, tenemos 2 Hilux 4x4 disponibles ahora mismo:\n\n• AT Full: $47.500 USD\n• MT SR: $43.200 USD\n\n¿Querés que te cuente las diferencias o preferís ver las fotos?';
    const clientMsg2 = 'Me interesa la AT Full. Tienen financiación?';
    const botMsg2 =
      '¡Sí! Tenemos 3 opciones de financiación disponibles. También puedo agendarte un test drive está semana. ¿Cuándo te queda mejor? ðŸš—';

    const showHeader = progress > 0.1;
    const client1Length =
      progress > 0.15 ? Math.floor(Math.min((progress - 0.15) / 0.2, 1) * clientMsg1.length) : 0;
    const showTyping = progress > 0.38 && progress < 0.52;
    const bot1Length = progress > 0.52 ? Math.floor(Math.min((progress - 0.52) / 0.23, 1) * botMsg1.length) : 0;
    const client2Length =
      progress > 0.76 ? Math.floor(Math.min((progress - 0.76) / 0.09, 1) * clientMsg2.length) : 0;
    const bot2Length = progress > 0.86 ? Math.floor(Math.min((progress - 0.86) / 0.14, 1) * botMsg2.length) : 0;
    const showTimeBadge = progress > 0.92;

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
                fontSize: 8,
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
            gap: 8,
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
                  padding: '8px 11px',
                  fontSize: 11,
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
                  fontSize: 8,
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
                  padding: '8px 11px',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.5,
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
                  fontSize: 8,
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
                    }}
                  >
                    âš¡ 1.8s
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
                  padding: '8px 11px',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.45,
                }}
              >
                {clientMsg2.slice(0, client2Length)}
              </div>
              <div
                style={{
                  fontSize: 8,
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
                  padding: '8px 11px',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.5,
                }}
              >
                {botMsg2.slice(0, bot2Length)}
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
        msg: 'Quiero comprar una Hilux está semana, tengo efectivo',
        score: 94,
        label: 'CALIENTE',
        labelColor: '#10b981',
        delay: 0.15,
        analyzeAt: 0.42,
        classifyAt: 0.67,
      },
      {
        name: 'Ana Garc\u00eda',
        msg: 'Me gustar\u00eda saber los precios de las camionetas',
        score: 61,
        label: 'TIBIO',
        labelColor: '#f59e0b',
        delay: 0.24,
        analyzeAt: 0.5,
        classifyAt: 0.73,
      },
      {
        name: 'Juan P.',
        msg: 'Solo estoy viendo opciones por ahora',
        score: 22,
        label: 'FR\u00cdO',
        labelColor: '#6b7280',
        delay: 0.33,
        analyzeAt: 0.58,
        classifyAt: 0.79,
      },
    ];

    const showSummary = progress > 0.88;

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
              {'CALIFICACI\u00d3N AUTOM\u00c1TICA'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              {'IA analizando intenci\u00f3n de compra'}
            </div>
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
            PROCESANDO
          </motion.div>
        </div>

        {/* Lista de leads */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            flex: 1,
          }}
        >
          {leads.map((lead) => {
            const visible = progress > lead.delay;
            const analyzing = progress > lead.analyzeAt && progress < lead.classifyAt;
            const analyzeProgress =
              progress > lead.analyzeAt
                ? Math.min((progress - lead.analyzeAt) / (lead.classifyAt - lead.analyzeAt), 1)
                : 0;
            const classified = progress > lead.classifyAt;

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
                  padding: '10px 12px',
                  transition: 'all 500ms ease',
                }}
              >
                {/* Fila superior: nombre + badge */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: classified ? `${lead.labelColor}20` : 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        transition: 'background 400ms',
                      }}
                    >
                      {lead.name.charAt(0)}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
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
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.4,
                    marginBottom: analyzing || classified ? 8 : 0,
                    fontStyle: 'italic',
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
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
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
                          width: classified ? `${lead.score}%` : `${analyzeProgress * lead.score}%`,
                        }}
                        transition={{ duration: 0.3 }}
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
                { label: 'CALIENTES', count: '1', color: '#10b981' },
                { label: 'TIBIOS', count: '1', color: '#f59e0b' },
                { label: 'FR\u00cdOS', count: '1', color: '#6b7280' },
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
                      fontSize: 7,
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

    const clientMsg = 'Hola! Quisiera sacar un turno para ver un auto está semana';
    const botMsg =
      '\u00a1Perfecto! Tengo disponibilidad:\n\ud83d\udcc5 Martes 14hs\n\ud83d\udcc5 Jueves 11hs\n\ud83d\udcc5 Viernes 16hs\n\u00bfCu\u00e1l te queda mejor?';
    const clientConfirm = 'El jueves a las 11hs perfecto';
    const botConfirm =
      '\u2705 \u00a1Listo! Turno confirmado para el Jueves a las 11hs. Te mando el recordatorio 24hs antes \ud83d\udcf2';

    const showHeader = progress > 0.08;
    const clientLength =
      progress > 0.12 ? Math.floor(Math.min((progress - 0.12) / 0.18, 1) * clientMsg.length) : 0;
    const botLength = progress > 0.32 ? Math.floor(Math.min((progress - 0.32) / 0.13, 1) * botMsg.length) : 0;
    const confirmLength =
      progress > 0.46 ? Math.floor(Math.min((progress - 0.46) / 0.13, 1) * clientConfirm.length) : 0;
    const botConfirmLength =
      progress > 0.6 ? Math.floor(Math.min((progress - 0.6) / 0.15, 1) * botConfirm.length) : 0;
    const calendarFilled = progress > 0.64;
    const showEventDetail = progress > 0.76;

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
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: 2,
                }}
              >
                {'AGENDA AUTOM\u00c1TICA'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{'Sin intervenci\u00f3n humana'}</div>
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
            gridTemplateColumns: '1fr auto',
            gap: 8,
            minHeight: 0,
          }}
        >
          {/* Chat */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
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
                    padding: '7px 10px',
                    fontSize: 10,
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
                    padding: '7px 10px',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {botMsg.slice(0, botLength)}
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
                    padding: '7px 10px',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {clientConfirm.slice(0, confirmLength)}
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
                    background: `${color}10`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${color}25`,
                    borderRadius: '10px 10px 10px 2px',
                    padding: '7px 10px',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1.45,
                  }}
                >
                  {botConfirm.slice(0, botConfirmLength)}
                </div>
              </motion.div>
            )}
          </div>

          {/* Mini calendario */}
          <div
            style={{
              width: 90,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '8px',
              }}
            >
              {/* Mes */}
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.4)',
                  textAlign: 'center',
                  marginBottom: 8,
                  letterSpacing: '0.06em',
                }}
              >
                ESTA SEMANA
              </div>

              {/* Días */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 3,
                }}
              >
                {days.map((day, index) => {
                  const isBooked = index === bookedDay && calendarFilled;
                  return (
                    <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>{day}</span>
                      <motion.div
                        animate={{
                          background: isBooked ? color : 'rgba(255,255,255,0.05)',
                          border: isBooked ? `1px solid ${color}50` : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: isBooked ? `0 0 10px ${color}40` : 'none',
                        }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                          width: 24,
                          height: 24,
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
                    padding: '8px',
                  }}
                >
                  <div style={{ fontSize: 8, color, fontWeight: 600, marginBottom: 5, letterSpacing: '0.06em' }}>
                    CONFIRMADO
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 600,
                      marginBottom: 3,
                    }}
                  >
                    Jueves · 11:00hs
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Test Drive · Carlos M.</div>
                  <div style={{ fontSize: 8, color: `${color}70`, marginTop: 4 }}>
                    {'\ud83d\udcf2 Recordatorio programado'}
                  </div>
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
              {'DASHBOARD DE ATENCI\u00d3N'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Hoy · Tiempo real</div>
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
              { label: 'SATISFACCI\u00d3N', value: `${satisfaccion}%`, color: '#f59e0b' },
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
                    fontSize: 7,
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.08em',
                    marginBottom: 4,
                  }}
                >
                  {metric.label}
                </div>
                <div
                  style={{
                    fontSize: 20,
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
                fontSize: 8,
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
                  <span style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>
                    1.8s
                  </span>
                  <span style={{ fontSize: 9, color: `${color}80` }}>IA</span>
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
                      fontSize: 26,
                      fontWeight: 800,
                      color: 'rgba(255,255,255,0.3)',
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    4hs
                  </span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>humano</span>
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
                fontSize: 9,
                color,
                background: `${color}10`,
                border: `1px solid ${color}20`,
                borderRadius: 6,
                padding: '4px 8px',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              8.000í— m\u00e1s r\u00e1pido qué un humano
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
              padding: '8px 10px',
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 8,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              ACTIVIDAD HOY
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 4,
                height: 36,
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
                  <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.2)' }}>{bar.hour}</span>
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
  const [progress, setProgress] = useState(0);
  const [cycleSeed, setCycleSeed] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const animFrameRef = useRef(0);
  const nextTabTimeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const isRunningRef = useRef(false);

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

    const duration = AI_SIMULATIONS[activeTab]?.duration ?? 1;

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
        setActiveTab((previousTab) => (previousTab + 1) % AI_SIMULATIONS.length);
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
  }, [activeTab, cycleSeed, isInView]);

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
      <div style={{ marginBottom: 8, flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: `${AI_COLOR}80`, marginBottom: 4 }}>
          AGENTE IA · EN VIVO
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
          Tu sistema comercial trabajando ahora mismo
        </div>
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
                  fontSize: 8,
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
              ? SimChat({ isActive: isInView, progress, color: activeSimulation.color })
              : activeTab === 1
                ? SimLeadsIA({ isActive: isInView, progress, color: activeSimulation.color })
                : activeTab === 2
                  ? SimAgenda({ isActive: isInView, progress, color: activeSimulation.color })
                  : SimMétricas({ isActive: isInView, progress, color: activeSimulation.color })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
function useMagneticOffset() {
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  const springConfig = { stiffness: 190, damping: 20, mass: 0.35 };
  const x = useSpring(targetX, springConfig);
  const y = useSpring(targetY, springConfig);

  return { targetX, targetY, x, y };
}

type MagneticFlowPathProps = {
  fromX: MotionValue<number>;
  fromY: MotionValue<number>;
  toX: MotionValue<number>;
  toY: MotionValue<number>;
  burstWidth: MotionValue<number>;
  burstOpacity: MotionValue<number>;
  burstFilter: MotionValue<string>;
  color: string;
  connectionIndex: number;
};

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
}: MagneticFlowPathProps) {
  const controlOffset = useTransform(() => (toX.get() - fromX.get()) * 0.28);
  const controlStartX = useTransform(() => fromX.get() + controlOffset.get());
  const controlEndX = useTransform(() => toX.get() - controlOffset.get());
  const pulseX = useTransform(() => fromX.get() + (toX.get() - fromX.get()) * 0.5);
  const pulseY = useTransform(() => fromY.get() + (toY.get() - fromY.get()) * 0.5);
  const path = useMotionTemplate`M ${fromX} ${fromY} C ${controlStartX} ${fromY} ${controlEndX} ${toY} ${toX} ${toY}`;

  return (
    <>
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeOpacity={0.18}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={burstWidth}
        strokeLinecap="round"
        strokeOpacity={burstOpacity}
        style={{ filter: burstFilter }}
      />
      <motion.circle
        r={2.5}
        fill={color}
        animate={{ opacity: [0.12, 0.95, 0.12] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: connectionIndex * 0.18 }}
        style={{
          cx: pulseX,
          cy: pulseY,
          filter: burstFilter,
        }}
      />
    </>
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
    { id: 2, label: 'Follow-up', icon: MessageSquare, duration: 5500, color: AUTO_COLOR },
    { id: 3, label: 'Reportes', icon: FileText, duration: 5000, color: AUTO_COLOR },
    { id: 4, label: 'Sync Apps', icon: RefreshCw, duration: 5500, color: AUTO_COLOR },
  ]);

  function SimFlujo({ isActive, progress, color }: SimProps) {
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
              FLUJO ACTIVO
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Formulario → n8n → Apps</div>
          </div>
          {showCounter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: 9,
                color,
                background: `${color}12`,
                border: `1px solid ${color}25`,
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
                transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                style={{ width: 5, height: 5, borderRadius: '50%', background: color }}
              />
              {execCount} hoy
            </motion.div>
          )}
        </div>

        {/* Canvas del flujo */}
        <div
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* SVG de conexiones */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {connections.map((conn, index) => {
              const visible = progress > conn.showAt;
              const pulseProgress = progress > conn.pulseAt ? Math.min((progress - conn.pulseAt) / 0.15, 1) : 0;
              const mx = (conn.fromX + conn.toX) / 2;
              const my = (conn.fromY + conn.toY) / 2 - 10;

              return visible ? (
                <g key={index}>
                  {/* Línea de conexión */}
                  <motion.path
                    d={`M ${conn.fromX} ${conn.fromY} Q ${mx} ${my} ${conn.toX} ${conn.toY}`}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="0.8"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  {/* Pulso de datos */}
                  {pulseProgress > 0 && (
                    <motion.circle
                      r="1.2"
                      fill={progress > conn.pulseAt + 0.08 ? color : '#06b6d4'}
                      filter={`drop-shadow(0 0 2px ${color})`}
                      animate={{
                        cx: [conn.fromX, mx, conn.toX],
                        cy: [conn.fromY, my, conn.toY],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: isActive ? Infinity : 0,
                        delay: index * 0.2,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </g>
              ) : null;
            })}
          </svg>

          {/* Nodos */}
          {nodes.map((node, index) => {
            const nodeVisible = progress > index * 0.06;
            const nodeActive =
              progress > 0.45 &&
              (node.id === 'n8n'
                ? n8nActive
                : node.id === 'whatsapp'
                  ? progress > 0.58
                  : node.id === 'crm'
                    ? progress > 0.65
                    : progress > 0.35);
            const IconComp = node.icon;

            return nodeVisible ? (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: index * 0.05 }}
                style={{
                  position: 'absolute',
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                {/* Anillo pulsante en nodo activo */}
                {nodeActive && (
                  <motion.div
                    animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                    transition={{ duration: 1.2, repeat: isActive ? Infinity : 0 }}
                    style={{
                      position: 'absolute',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: `1px solid ${node.nodeColor}`,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}

                {/* Nodo */}
                <motion.div
                  animate={{
                    background: nodeActive ? `${node.nodeColor}25` : 'rgba(255,255,255,0.05)',
                    borderColor: nodeActive ? `${node.nodeColor}50` : 'rgba(255,255,255,0.10)',
                    boxShadow: nodeActive ? `0 0 16px ${node.nodeColor}30` : 'none',
                  }}
                  transition={{ duration: 0.4 }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComp
                    size={13}
                    color={nodeActive ? node.nodeColor : 'rgba(255,255,255,0.3)'}
                    strokeWidth={1.5}
                  />
                </motion.div>

                {/* Label */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 600,
                      color: nodeActive ? node.nodeColor : 'rgba(255,255,255,0.35)',
                      transition: 'color 400ms',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {node.label}
                  </div>
                  <div
                    style={{
                      fontSize: 7,
                      color: 'rgba(255,255,255,0.2)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {node.sublabel}
                  </div>
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
        detail: 'Maria preguntó por precios de servicio',
        icon: MessageSquare,
        iconColor: '#06b6d4',
        showAt: 0.12,
        type: 'client',
      },
      {
        time: 'Mar 10:32',
        label: '24hs sin respuesta',
        detail: 'Sistema detecta silencio del lead',
        icon: Clock,
        iconColor: '#f59e0b',
        showAt: 0.28,
        type: 'system',
      },
      {
        time: 'Mar 10:33',
        label: 'Follow-up automático',
        detail: '"¡Hola Maria! ¿Pudiste ver la info que te enviamos?"',
        icon: Zap,
        iconColor: color,
        showAt: 0.45,
        type: 'auto',
      },
      {
        time: 'Mar 11:15',
        label: 'Cliente responde',
        detail: 'Maria: "Si! Me interesa, ¿cuándo podemos hablar?"',
        icon: MessageSquare,
        iconColor: '#10b981',
        showAt: 0.62,
        type: 'client',
      },
      {
        time: 'Mar 11:47',
        label: 'Deal cerrado',
        detail: 'Turno agendado · Conversion: 94%',
        icon: CheckCircle,
        iconColor: '#10b981',
        showAt: 0.78,
        type: 'success',
      },
    ] as const;

    const showStat = progress > 0.85;

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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
          {/* Línea vertical del timeline */}
          <div
            style={{
              position: 'absolute',
              left: 15,
              top: 8,
              bottom: 8,
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
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  display: 'flex',
                  gap: 10,
                  paddingBottom: index < events.length - 1 ? 10 : 0,
                  position: 'relative',
                }}
              >
                {/* ícono del nodo */}
                <div
                  style={{
                    width: 30,
                    height: 30,
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
                  <IconComp size={13} color={event.iconColor} strokeWidth={1.5} />
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
                    padding: '7px 10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: isAuto ? color : isSuccess ? '#10b981' : 'rgba(255,255,255,0.75)',
                      }}
                    >
                      {event.label}
                    </span>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>{event.time}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.4)',
                      lineHeight: 1.4,
                      fontStyle: event.type === 'client' ? 'italic' : 'normal',
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
    const generateProgress = progress > 0.35 ? Math.min((progress - 0.35) / 0.2, 1) : 0;
    const showReport = progress > 0.55;
    const showSent = progress > 0.75;

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
            }}
          >
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: 10 }}>
              RECOLECTANDO DATOS...
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
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

            {/* Barra de generación */}
            {generateProgress > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 5,
                  }}
                >
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
                    GENERANDO REPORTE...
                  </span>
                  <span style={{ fontSize: 9, color, fontWeight: 600 }}>{Math.floor(generateProgress * 100)}%</span>
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
                    animate={{ width: `${generateProgress * 100}%` }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${color}80, ${color})`,
                      borderRadius: 100,
                      boxShadow: `0 0 8px ${color}60`,
                    }}
                  />
                </div>
              </motion.div>
            )}
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
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>
                    {item.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{item.value}</div>
                </motion.div>
              ))}
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
        detail: 'Contacto creado: Laura Sanchez',
        icon: Database,
        color: '#8b5cf6',
        showAt: 0.35,
      },
      {
        label: 'Follow-up agendado',
        detail: 'Recordatorio para manana 10:00hs',
        icon: Calendar,
        color: '#06b6d4',
        showAt: 0.55,
      },
      {
        label: 'Vendedor notificado',
        detail: 'WhatsApp enviado a Martin G.',
        icon: MessageSquare,
        color: '#25D366',
        showAt: 0.7,
      },
    ] as const;

    const showTime = progress > 0.86;

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
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', marginBottom: 8 }}>
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
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {syncSteps.map((step) => {
            const visible = progress > step.showAt;
            const IconComp = step.icon;
            return visible ? (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: `${step.color}08`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${step.color}20`,
                  borderRadius: 10,
                  padding: '9px 12px',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: `${step.color}15`,
                    border: `1px solid ${step.color}25`,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComp size={13} color={step.color} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: step.color, marginBottom: 2 }}>{step.label}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{step.detail}</div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={10} color="black" strokeWidth={3} />
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
  const [progress, setProgress] = useState(0);
  const [cycleSeed, setCycleSeed] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const animFrameRef = useRef(0);
  const nextTabTimeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const isRunningRef = useRef(false);

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

    const duration = autoSimulations[activeTab]?.duration ?? 1;

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
        setActiveTab((previousTab) => (previousTab + 1) % autoSimulations.length);
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
  }, [activeTab, autoSimulations, cycleSeed, isInView]);

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
      <div style={{ marginBottom: 8, flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: `${AUTO_COLOR}80`, marginBottom: 4 }}>
          {'AUTOMATIZACIONES \u00b7 EN VIVO'}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
          Tus procesos corriendo solos ahora mismo
        </div>
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
                  fontSize: 8,
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
              ? SimFlujo({ isActive: isInView, progress, color: activeSimulation.color })
              : activeTab === 1
                ? SimFollowUp({ isActive: isInView, progress, color: activeSimulation.color })
                : activeTab === 2
                  ? SimReporte({ isActive: isInView, progress, color: activeSimulation.color })
                  : SimSync({ isActive: isInView, progress, color: activeSimulation.color })}
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
    { id: 1, label: 'CRM', icon: Users, duration: 5500, color: SW_COLOR },
    { id: 2, label: 'Dashboard', icon: BarChart2, duration: 5000, color: SW_COLOR },
    { id: 3, label: 'Stock', icon: Package, duration: 5500, color: SW_COLOR },
    { id: 4, label: 'Equipo', icon: Layers, duration: 5000, color: SW_COLOR },
  ]);

  function SimCRM({ isActive, progress, color }: SimProps) {
    void isActive;

    const stages = [
      { label: 'Nuevos', stageColor: '#06b6d4', total: '$12.400' },
      { label: 'Propuesta', stageColor: '#8b5cf6', total: '$28.900' },
      { label: 'Negoc.', stageColor: color, total: '$15.200' },
      { label: 'Cerrado', stageColor: '#10b981', total: '$47.800' },
    ] as const;

    const movingDealStage = progress < 0.5 ? 1 : progress < 0.65 ? 2 : 3;

    const showDeals = progress > 0.2;
    const dealMoved = progress > 0.75;
    const closedTotal = dealMoved ? '$56.300' : '$47.800';

    const staticDeals = [
      { name: 'Clinica Norte', value: '$3.200', stage: 0, avatar: 'CN', dealColor: '#06b6d4' },
      { name: 'Gym Evolucion', value: '$1.800', stage: 2, avatar: 'GE', dealColor: color },
      { name: 'Rest. El Patio', value: '$4.100', stage: 3, avatar: 'RE', dealColor: '#10b981' },
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
            {closedTotal}
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
                padding: '8px 6px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
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
                    fontSize: 8,
                    fontWeight: 600,
                    color: stage.stageColor,
                    letterSpacing: '0.05em',
                  }}
                >
                  {stage.label}
                </div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>
                  {stageIndex === 3 ? closedTotal : stage.total}
                </div>
              </div>

              {/* Deals estáticos */}
              {showDeals &&
                staticDeals
                  .filter((deal) => deal.stage === stageIndex)
                  .map((deal, index) => (
                    <motion.div
                      key={deal.name}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        background: `${deal.dealColor}10`,
                        border: `1px solid ${deal.dealColor}20`,
                        borderRadius: 6,
                        padding: '5px 6px',
                      }}
                    >
                      <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
                        {deal.name}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: deal.dealColor }}>{deal.value}</div>
                    </motion.div>
                  ))}

              {/* Deal que se mueve */}
              {showDeals && movingDealStage === stageIndex && (
                <motion.div
                  layout
                  layoutId="movingDeal"
                  style={{
                    background: `${color}15`,
                    border: `1px solid ${color}35`,
                    borderRadius: 6,
                    padding: '5px 6px',
                    boxShadow: `0 0 12px ${color}20`,
                  }}
                >
                  <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>
                    Auto San Miguel
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color }}>$8.500</div>
                  {movingDealStage === 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        fontSize: 8,
                        color: '#10b981',
                        marginTop: 2,
                        fontWeight: 600,
                      }}
                    >
                      ✓ CERRADO
                    </motion.div>
                  )}
                </motion.div>
              )}
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

    const showGraph = progress > 0.55;
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
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', marginBottom: 4 }}>
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
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', marginBottom: 4 }}>
              {kpis[1].label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981', lineHeight: 1 }}>{kpis[1].value}</div>
            <div style={{ fontSize: 8, color: 'rgba(16,185,129,0.6)', marginTop: 3 }}>nuevos</div>
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
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', marginBottom: 4 }}>
              RETEN.
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#8b5cf6', lineHeight: 1 }}>{kpis[2].value}%</div>
            <div style={{ fontSize: 8, color: 'rgba(139,92,246,0.6)', marginTop: 3 }}>clientes</div>
          </div>
        </div>

        {/* Grafico */}
        {showGraph && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', marginBottom: 8 }}>
              REVENUE MENSUAL
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 5,
                height: 48,
              }}
            >
              {barData.map((bar, index) => {
                const barProgress = Math.min(Math.max((progress - 0.55 - index * 0.025) / 0.12, 0), 1);
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
                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)' }}>{bar.month}</span>
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
      { name: 'Bujias NGK', stock: 28, min: 8, unit: 'un.', status: 'ok' },
      { name: 'Pastillas Freno', stock: 12, min: 10, unit: 'jgo.', status: 'warning' },
    ] as const;

    const showAlert = progress > 0.2;
    const showOrder = progress > 0.4;
    const orderProgress = progress > 0.4 ? Math.min((progress - 0.4) / 0.2, 1) : 0;
    const showNotif = progress > 0.6;
    const showUpdated = progress > 0.8;

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
              gestión DE STOCK
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Reposicion automática activa</div>
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
              padding: '7px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {['PRODUCTO', 'STOCK', 'MINIMO'].map((header) => (
              <span key={header} style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
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
                  padding: '8px 12px',
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Orden generada */}
          {showOrder && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: `${color}08`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${color}20`,
                borderRadius: 8,
                padding: '8px 12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
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

          {/* Proveedor notificado */}
          {showNotif && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'rgba(37,211,102,0.07)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(37,211,102,0.18)',
                borderRadius: 8,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Mail size={13} color="#25D366" />
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#25D366', marginBottom: 1 }}>Email → Proveedor</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Orden #1847 enviada · Entrega: 48hs</div>
              </div>
            </motion.div>
          )}

          {/* Stock actualizado */}
          {showUpdated && (
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
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color, marginBottom: 1 }}>Stock repuesto en camino</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Sin intervencion humana</div>
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: `${color}20`,
                  border: `1px solid ${color}30`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={15} color={color} strokeWidth={2.5} />
              </div>
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
    ] as const;

    const tasks = [
      {
        title: 'Follow-up: 5 leads calientes',
        assignee: 'MG',
        dueColor: '#06b6d4',
        progressVal: progress > 0.22 ? Math.min((progress - 0.22) / 0.28, 1) : 0,
        completedAt: 0.5,
        showAt: 0.22,
        urgent: false,
      },
      {
        title: 'Preparar propuesta Clinica Norte',
        assignee: 'LS',
        dueColor: '#8b5cf6',
        progressVal: progress > 0.28 ? Math.min((progress - 0.28) / 0.4, 1) * 0.65 : 0,
        completedAt: null,
        showAt: 0.28,
        urgent: progress > 0.7,
      },
      {
        title: 'Instalacion sistema nuevo cliente',
        assignee: 'CP',
        dueColor: '#10b981',
        progressVal: progress > 0.34 ? Math.min((progress - 0.34) / 0.35, 1) * 0.4 : 0,
        completedAt: null,
        showAt: 0.34,
        urgent: false,
      },
    ] as const;

    const showSummary = progress > 0.85;

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
            3 activos
          </div>
        </div>

        {/* Avatares del equipo */}
        <div
          style={{
            display: 'flex',
            gap: 8,
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
                  background: `${member.memberColor}08`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${member.memberColor}20`,
                  borderRadius: 8,
                  padding: '7px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
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
                    fontSize: 8,
                    fontWeight: 700,
                    color: member.memberColor,
                    flexShrink: 0,
                  }}
                >
                  {member.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{member.name}</div>
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>{member.role}</div>
                </div>
              </motion.div>
            ) : null
          )}
        </div>

        {/* Tareas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                  padding: '8px 10px',
                  transition: 'all 400ms ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
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
                        fontSize: 8,
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

        {/* Resumen del director */}
        {showSummary && (
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
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Productividad del equipo hoy</span>
            <span style={{ fontSize: 16, fontWeight: 800, color }}>78%</span>
          </motion.div>
        )}
      </div>
    );
  }

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

    const duration = swSimulations[activeTab]?.duration ?? 1;

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
        setActiveTab((previousTab) => (previousTab + 1) % swSimulations.length);
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
  }, [activeTab, cycleSeed, isInView, swSimulations]);

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
      <div style={{ marginBottom: 8, flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: `${SW_COLOR}80`, marginBottom: 4 }}>
          {'SOFTWARE · EN VIVO'}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
          Tu empresa bajo control total
        </div>
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
                  fontSize: 8,
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
              ? SimCRM({ isActive: isInView, progress, color: activeSimulation.color })
              : activeTab === 1
                ? SimDashboard({ isActive: isInView, progress, color: activeSimulation.color })
                : activeTab === 2
                  ? SimStock({ isActive: isInView, progress, color: activeSimulation.color })
                  : SimEquipo({ isActive: isInView, progress, color: activeSimulation.color })}
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
                fontSize: 8,
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

function ServicesDetailCta({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.42 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="grid gap-8 pb-[38svh] pt-12 lg:grid-cols-[clamp(7rem,10vw,11rem)_minmax(0,1fr)] lg:gap-12 lg:pb-[42svh] lg:pt-20"
    >
      <div className="relative hidden min-h-full w-full lg:block" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: [0, 1, 0.72], scale: [0.7, 1.18, 1] }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            top: 34,
            left: '50%',
            width: 34,
            height: 34,
            transform: 'translateX(-50%)',
            borderRadius: 999,
            background: '#06b6d4',
            boxShadow: '0 0 26px #06b6d4, 0 0 76px rgba(6,182,212,0.55)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          whileInView={{ opacity: 1, scaleY: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            top: 50,
            bottom: 26,
            left: '50%',
            width: 10,
            transform: 'translateX(-50%)',
            transformOrigin: 'top center',
            borderRadius: 999,
            background: 'linear-gradient(180deg, #06b6d4, #10b981 34%, #8b5cf6 68%, #f59e0b)',
            boxShadow: '0 0 42px rgba(6,182,212,0.28), 0 0 64px rgba(245,158,11,0.22)',
          }}
        />
      </div>
      <motion.div
        data-cursor="hover"
        initial="rest"
        whileHover="hover"
        whileInView="show"
        viewport={{ once: true, amount: 0.45 }}
        variants={{
          rest: {
            borderColor: 'rgba(255,255,255,0.10)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 28px 82px rgba(0,0,0,0.36)',
          },
          show: {
            borderColor: 'rgba(6,182,212,0.28)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.12), 0 34px 110px rgba(0,0,0,0.44), 0 0 96px rgba(6,182,212,0.18), 0 0 120px rgba(245,158,11,0.10)',
          },
          hover: {
            y: -3,
            borderColor: 'rgba(255,255,255,0.18)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.14), 0 38px 120px rgba(0,0,0,0.48), 0 0 120px rgba(6,182,212,0.22), 0 0 140px rgba(245,158,11,0.14)',
          },
        }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'relative',
          minHeight: 'clamp(23rem, 46svh, 32rem)',
          overflow: 'hidden',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.10)',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.022)), radial-gradient(circle at 14% 18%, rgba(6,182,212,0.18), transparent 0 32%), radial-gradient(circle at 82% 20%, rgba(16,185,129,0.12), transparent 0 30%), radial-gradient(circle at 64% 90%, rgba(139,92,246,0.13), transparent 0 32%), radial-gradient(circle at 94% 76%, rgba(245,158,11,0.14), transparent 0 28%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 28px 82px rgba(0,0,0,0.36)',
          padding: 'clamp(1.4rem, 3vw, 3rem)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.42)',
                marginBottom: 10,
              }}
            >
              Siguiente paso
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: 'clamp(1.45rem, 2.5vw, 2.2rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.035em',
                color: 'white',
                fontWeight: 900,
              }}
            >
              ProfundizÃ¡ en la soluciÃ³n que mÃ¡s sentido tenga para tu negocio.
            </h3>
          </div>
        </div>

        <div style={{ marginTop: 22, display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))' }}>
          {ORDERED_SERVICES.map((service) => (
            <motion.button
              key={service.id}
              type="button"
              onClick={() => onNavigate(service.href)}
              whileHover={{
                y: -2,
                background: `${service.accent}16`,
                borderColor: `${service.accent}5C`,
                boxShadow: `0 0 28px ${service.accent}20`,
              }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                minHeight: 46,
                borderRadius: 8,
                border: `1px solid ${service.accent}2E`,
                background: `${service.accent}0B`,
                color: service.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                fontSize: 11,
                fontWeight: 850,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {SERVICE_SHORT_LABELS[service.id]}
              <span aria-hidden="true">-&gt;</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ServicesFullWidthCta({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <motion.div
      id="servicios-siguiente-paso"
      initial="rest"
      whileInView="show"
      viewport={{ once: true, amount: 0.34 }}
      className="pb-[48svh] pt-24 lg:pb-[54svh] lg:pt-32"
    >
      <motion.div
        data-cursor="hover"
        initial="rest"
        whileHover="hover"
        variants={{
          rest: {
            opacity: 0,
            y: 22,
            borderColor: 'rgba(255,255,255,0.11)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 28px 82px rgba(0,0,0,0.38)',
          },
          show: {
            opacity: 1,
            y: 0,
            borderColor: 'rgba(255,255,255,0.22)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.14), 0 46px 150px rgba(0,0,0,0.56), 0 0 120px rgba(6,182,212,0.30), 0 0 150px rgba(16,185,129,0.18), 0 0 160px rgba(245,158,11,0.16)',
          },
          hover: {
            y: -5,
            borderColor: 'rgba(255,255,255,0.30)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.18), 0 54px 170px rgba(0,0,0,0.60), 0 0 140px rgba(6,182,212,0.34), 0 0 170px rgba(139,92,246,0.20), 0 0 180px rgba(245,158,11,0.18)',
          },
        }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          minHeight: 'clamp(34rem, 68svh, 46rem)',
          overflow: 'hidden',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.10)',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.082), rgba(255,255,255,0.022)), radial-gradient(circle at 12% 18%, rgba(6,182,212,0.22), transparent 0 30%), radial-gradient(circle at 78% 16%, rgba(16,185,129,0.16), transparent 0 32%), radial-gradient(circle at 62% 86%, rgba(139,92,246,0.16), transparent 0 31%), radial-gradient(circle at 96% 74%, rgba(245,158,11,0.18), transparent 0 30%)',
          padding: 'clamp(1.5rem, 4vw, 4.75rem)',
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        <motion.div
          aria-hidden="true"
          variants={{
            rest: { opacity: 0, scaleX: 0.28 },
            show: { opacity: [0, 1, 0.72], scaleX: [0.28, 1.04, 1] },
            hover: { opacity: 1, scaleX: 1 },
          }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
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
          variants={{
            rest: { opacity: 0 },
            show: { opacity: [0, 0.78, 0.48] },
            hover: { opacity: 0.68 },
          }}
          transition={{ duration: 1.2, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            inset: '-20% -10%',
            background:
              'radial-gradient(circle at 18% 28%, rgba(6,182,212,0.28), transparent 0 24%), radial-gradient(circle at 48% 10%, rgba(16,185,129,0.18), transparent 0 25%), radial-gradient(circle at 78% 34%, rgba(139,92,246,0.22), transparent 0 26%), radial-gradient(circle at 88% 78%, rgba(245,158,11,0.20), transparent 0 24%)',
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
                <div
                  key={item.label}
                  style={{
                    minHeight: 82,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(255,255,255,0.035)',
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
                </div>
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
            {ORDERED_SERVICES.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.button
                  key={service.id}
                  type="button"
                  onClick={() => onNavigate(service.href)}
                  whileHover={{
                    x: 7,
                    background: `${service.accent}16`,
                    borderColor: `${service.accent}68`,
                    boxShadow: `0 0 34px ${service.accent}24`,
                  }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    minHeight: 74,
                    borderRadius: 10,
                    border: `1px solid ${service.accent}30`,
                    background: `linear-gradient(135deg, ${service.accent}10, rgba(255,255,255,0.025))`,
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
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      display: 'grid',
                      placeItems: 'center',
                      background: `${service.accent}14`,
                      border: `1px solid ${service.accent}32`,
                      boxShadow: `0 0 22px ${service.accent}18`,
                    }}
                  >
                    <Icon size={16} color={service.accent} strokeWidth={1.8} />
                  </span>
                  <span style={{ minWidth: 0 }}>
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
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 11,
                      fontWeight: 850,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: index === 0 ? '#050607' : service.accent,
                      background: index === 0 ? service.accent : `${service.accent}12`,
                      border: `1px solid ${service.accent}30`,
                      borderRadius: 999,
                      padding: '7px 10px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Ver
                    <span aria-hidden="true">-&gt;</span>
                  </span>
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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 200,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3), transparent)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: 'linear-gradient(0deg, rgba(0,0,0,0.3), transparent)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <motion.div
          animate={{
            background: `radial-gradient(
              ellipse 80% 60% at 50% 40%,
              ${activeAccent}12 0%,
              ${activeAccent}06 35%,
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
              ${activeAccent}0B 0%,
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
                data-lenis-prevent
                data-lenis-prevent-wheel
                data-lenis-prevent-touch
                aria-label={`Ir a ${SERVICE_SHORT_LABELS[service.id]}`}
                onPointerDownCapture={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  scrollToService(service.id);
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  scrollToService(service.id);
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
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
                  cursor: 'pointer',
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


