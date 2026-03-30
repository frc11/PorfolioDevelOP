'use client';

import { useRef, type ReactNode } from 'react';
import {
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
  Cpu,
  Globe,
  type LucideIcon,
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
    outcomes: ['Mas autoridad en Google', 'Carga impecable en mobile', 'Captacion 24/7'],
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
    title: 'Un sistema comercial que responde, filtra y agenda aunque tu equipo no este online.',
    description:
      'Integramos agentes de IA en WhatsApp y web para responder consultas, calificar leads y liberar tiempo ejecutivo sin perder velocidad de respuesta.',
    price: '$300 USD',
    timeline: '7 dias',
    metric: '94% respuesta automatica',
    sectors: ['Concesionarias', 'Clinicas', 'Comercios', 'Inmobiliarias'],
    outcomes: ['Atencion inmediata', 'Mejor calidad de lead', 'Agenda operando sola'],
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20, mass: 0.7 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20, mass: 0.7 });

  const desktopX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const desktopY = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const mobileX = useTransform(smoothX, [-0.5, 0.5], [-25, 25]);
  const mobileY = useTransform(smoothY, [-0.5, 0.5], [-25, 25]);
  const desktopRotateY = useTransform(smoothX, [-0.5, 0.5], [3.5, -3.5]);
  const desktopRotateX = useTransform(smoothY, [-0.5, 0.5], [-2.5, 2.5]);
  const mobileRotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);
  const mobileRotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const glowX = useTransform(smoothX, [-0.5, 0.5], [34, 68]);
  const glowY = useTransform(smoothY, [-0.5, 0.5], [24, 64]);
  const ambientGlow = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(34,211,238,0.18), rgba(255,255,255,0.08) 18%, rgba(8,14,24,0.08) 40%, transparent 66%)`;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(Math.max(-0.5, Math.min(0.5, relativeX)));
    mouseY.set(Math.max(-0.5, Math.min(0.5, relativeY)));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_50%_18%,#0f1721_0%,#091019_54%,#05070a_100%)] [perspective:1400px]"
    >
      <motion.div className="pointer-events-none absolute inset-0 opacity-90" style={{ background: ambientGlow }} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_16%,transparent_78%,rgba(255,255,255,0.03))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.04),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100%_28px] opacity-[0.16]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:28px_100%] opacity-[0.14]" />

      <div className="pointer-events-none absolute bottom-[8%] left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-full bg-black/60 blur-3xl" />
      <div className="pointer-events-none absolute left-[20%] top-[18%] h-28 w-28 rounded-full bg-cyan-400/10 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-[20%] right-[18%] h-24 w-24 rounded-full bg-cyan-300/10 blur-[80px]" />

      <motion.div
        style={{
          x: desktopX,
          y: desktopY,
          rotateX: desktopRotateX,
          rotateY: desktopRotateY,
          transformStyle: 'preserve-3d',
        }}
        className="absolute left-[8%] top-[12%] w-[72%]"
      >
        <div className="relative aspect-[16/9] rounded-[2rem] border border-white/10 bg-white/[0.02] p-3 shadow-2xl backdrop-blur-md">
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_28%,transparent_72%,rgba(255,255,255,0.03))]" />
          <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] border border-white/6" />

          <div className="relative h-full overflow-hidden rounded-[1.55rem] border border-white/10 bg-black/28">
            <motion.div
              animate={{ scale: [1, 1.06, 1], opacity: [0.32, 0.62, 0.32] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute left-1/2 top-[14%] h-[46%] w-[60%] -translate-x-1/2 rounded-full blur-[70px]"
              style={{
                background: `radial-gradient(circle, ${service.accent}2d 0%, rgba(255,255,255,0.08) 32%, transparent 74%)`,
              }}
            />

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),transparent_16%,transparent_78%,rgba(255,255,255,0.04))]" />

            <div className="relative flex h-full flex-col p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/55" />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: service.accent }} />
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/48">
                  Multi Device
                </div>
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-white/[0.05] px-4 py-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/42">
                  Executive Landing
                </div>
                <div className="mt-3 max-w-[80%] text-[1.15rem] font-black leading-[1.02] tracking-[-0.05em] text-white/88">
                  Una presencia premium lista para convertir desde cualquier pantalla.
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="h-8 rounded-full shadow-[0_0_28px_rgba(34,211,238,0.22)]"
                    style={{
                      width: '6.75rem',
                      background: `linear-gradient(90deg, ${service.accent}, rgba(255,255,255,0.82))`,
                    }}
                  />
                  <div className="h-8 w-24 rounded-full border border-white/10 bg-white/[0.04]" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-[1.08fr_0.92fr] gap-3">
                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="h-2 w-20 rounded-full bg-white/18" />
                  <div className="mt-3 h-18 rounded-[1rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
                  <div className="mt-3 h-2 w-24 rounded-full bg-white/12" />
                </div>
                <div className="space-y-3">
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-3">
                    <div className="h-2 w-12 rounded-full bg-white/18" />
                    <div className="mt-3 h-10 rounded-[0.85rem] bg-white/[0.05]" />
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-3">
                    <div className="h-2 w-16 rounded-full bg-white/18" />
                    <div className="mt-3 h-10 rounded-[0.85rem] bg-white/[0.05]" />
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center gap-3 pt-4">
                <div className="h-9 flex-1 rounded-[1rem] border border-white/10 bg-white/[0.03]" />
                <div
                  className="flex h-9 w-28 items-center justify-center rounded-[1rem] text-[9px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                  style={{ backgroundColor: `${service.accent}2b` }}
                >
                  Launch
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-full h-8 w-10 -translate-x-1/2 rounded-b-[1rem] border border-t-0 border-white/10 bg-white/[0.03] backdrop-blur-md" />
          <div className="pointer-events-none absolute left-1/2 top-[calc(100%+1.5rem)] h-2.5 w-[30%] -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.03] shadow-[0_18px_36px_rgba(0,0,0,0.42)] backdrop-blur-md" />
        </div>
      </motion.div>

      <motion.div
        style={{
          x: mobileX,
          y: mobileY,
          rotateX: mobileRotateX,
          rotateY: mobileRotateY,
          transformStyle: 'preserve-3d',
        }}
        className="absolute right-[11%] top-[29%] z-10 w-[26%] min-w-[120px] max-w-[158px]"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
          className="relative aspect-[9/16] rounded-[2.15rem] border border-white/20 bg-white/[0.03] p-[7px] shadow-2xl backdrop-blur-md"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[2.15rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.14),transparent_42%,transparent_74%,rgba(255,255,255,0.04))]" />
          <div className="absolute left-1/2 top-[10px] z-20 h-[18px] w-[44%] -translate-x-1/2 rounded-full border border-white/10 bg-black/55" />

          <div className="relative h-full overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/34">
            <motion.div
              animate={{ scale: [0.96, 1.06, 0.96], opacity: [0.32, 0.72, 0.32] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute left-1/2 top-[18%] h-[28%] w-[70%] -translate-x-1/2 rounded-full blur-2xl"
              style={{ background: `radial-gradient(circle, ${service.accent}38 0%, transparent 72%)` }}
            />

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_16%,transparent_80%,rgba(255,255,255,0.04))]" />

            <motion.div
              animate={{ y: [0, -50, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex h-[calc(100%+50px)] flex-col gap-3 px-3 pb-5 pt-12"
            >
              <div className="rounded-[1.1rem] border border-white/12 bg-white/[0.08] px-3 py-3 shadow-[0_0_22px_rgba(34,211,238,0.12)]">
                <div className="h-2 w-14 rounded-full bg-white/24" />
                <div className="mt-3 h-14 rounded-[0.95rem]" style={{ backgroundColor: `${service.accent}1f` }} />
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-white/[0.06] p-3">
                <div className="h-2 w-10 rounded-full bg-white/18" />
                <div className="mt-3 h-10 rounded-[0.85rem] bg-white/[0.06]" />
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-white/[0.06] p-3">
                <div className="h-2 w-16 rounded-full bg-white/18" />
                <div className="mt-3 h-10 rounded-[0.85rem] bg-white/[0.06]" />
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-white/[0.06] p-3">
                <div className="h-2 w-12 rounded-full bg-white/18" />
                <div className="mt-3 h-10 rounded-[0.85rem] bg-white/[0.06]" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function AIScene({ service }: { service: Service }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 130, damping: 18, mass: 0.45 });
  const smoothY = useSpring(pointerY, { stiffness: 130, damping: 18, mass: 0.45 });

  const massX = useTransform(smoothX, [-0.5, 0.5], [18, -18]);
  const massY = useTransform(smoothY, [-0.5, 0.5], [14, -14]);

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

  const blobs = [
    {
      id: 'cyan-core',
      className: 'h-28 w-28',
      style: {
        background:
          'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.88), rgba(34,211,238,0.92) 28%, rgba(34,211,238,0.3) 62%, transparent 78%)',
      },
      animate: {
        x: [0, 34, -18, 22, 0],
        y: [0, -26, 18, 8, 0],
        scale: [1, 1.08, 0.96, 1.03, 1],
      },
      transition: { duration: 9.5, repeat: Infinity, ease: 'easeInOut' as const },
    },
    {
      id: 'violet-deep',
      className: 'h-32 w-32',
      style: {
        background:
          'radial-gradient(circle at 40% 40%, rgba(139,92,246,0.88), rgba(76,29,149,0.95) 42%, rgba(17,24,39,0.18) 74%, transparent 86%)',
      },
      animate: {
        x: [0, -28, 22, -14, 0],
        y: [0, 24, -12, -18, 0],
        scale: [0.96, 1.05, 1.1, 0.98, 0.96],
      },
      transition: { duration: 11.2, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.6 },
    },
    {
      id: 'black-orbit',
      className: 'h-24 w-24',
      style: {
        background:
          'radial-gradient(circle at 40% 40%, rgba(24,24,27,0.95), rgba(5,8,12,0.98) 52%, rgba(0,0,0,0.14) 76%, transparent 90%)',
        boxShadow: '0 0 40px rgba(0,0,0,0.35)',
      },
      animate: {
        x: [0, 22, -26, 10, 0],
        y: [0, 18, 26, -16, 0],
        scale: [1.02, 0.94, 1.06, 1, 1.02],
      },
      transition: { duration: 10.4, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.1 },
    },
    {
      id: 'cyan-vapor',
      className: 'h-20 w-20',
      style: {
        background: `radial-gradient(circle at 45% 45%, ${service.accent}cc, rgba(34,211,238,0.42) 46%, transparent 78%)`,
      },
      animate: {
        x: [0, -20, 18, 28, 0],
        y: [0, -18, -22, 16, 0],
        scale: [0.92, 1.06, 0.98, 1.1, 0.92],
      },
      transition: { duration: 8.8, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.3 },
    },
  ];

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_center,#11131a_0%,#090b10_62%,#06070a_100%)]"
    >
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <filter id="ai-gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 24 -12"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_30%,transparent_72%,rgba(255,255,255,0.02))]" />

      <motion.div
        className="absolute inset-0"
        style={{ x: massX, y: massY, filter: 'url(#ai-gooey-filter)' }}
      >
        {blobs.map((blob) => (
          <motion.div
            key={blob.id}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${blob.className}`}
            style={blob.style}
            animate={blob.animate}
            transition={blob.transition}
          />
        ))}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/15 bg-white/[0.08] shadow-[0_18px_50px_rgba(255,255,255,0.08)] backdrop-blur-md">
          <div className="absolute inset-[10px] rounded-[20px] border border-white/12" />
          <div
            className="absolute -inset-4 rounded-[34px] blur-2xl"
            style={{ background: `radial-gradient(circle, ${service.accent}22 0%, transparent 72%)` }}
          />
          <Cpu size={28} color="rgba(255,255,255,0.92)" strokeWidth={1.4} className="relative z-10" />
        </div>
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
}: {
  fromX: MotionValue<number>;
  fromY: MotionValue<number>;
  toX: MotionValue<number>;
  toY: MotionValue<number>;
  burstWidth: MotionValue<number>;
  burstOpacity: MotionValue<number>;
  burstFilter: MotionValue<string>;
}) {
  const controlX1 = useTransform(() => fromX.get() + (toX.get() - fromX.get()) * 0.36);
  const controlX2 = useTransform(() => toX.get() - (toX.get() - fromX.get()) * 0.36);
  const path = useMotionTemplate`M ${fromX} ${fromY} C ${controlX1} ${fromY}, ${controlX2} ${toY}, ${toX} ${toY}`;

  return (
    <>
      <motion.path d={path} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1.2} strokeLinecap="round" />
      <motion.path
        d={path}
        fill="none"
        stroke="#22d3ee"
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
    { id: 'n8n', label: 'n8n', color: '#f97316', x: 154, y: 110, magnet: n8n },
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
        <MagneticFlowPath
          fromX={stripeX}
          fromY={stripeY}
          toX={n8nX}
          toY={n8nY}
          burstWidth={burstWidth}
          burstOpacity={burstOpacity}
          burstFilter={burstFilter}
        />
        <MagneticFlowPath
          fromX={n8nX}
          fromY={n8nY}
          toX={whatsappX}
          toY={whatsappY}
          burstWidth={burstWidth}
          burstOpacity={burstOpacity}
          burstFilter={burstFilter}
        />
        <MagneticFlowPath
          fromX={n8nX}
          fromY={n8nY}
          toX={crmX}
          toY={crmY}
          burstWidth={burstWidth}
          burstOpacity={burstOpacity}
          burstFilter={burstFilter}
        />
        <MagneticFlowPath
          fromX={n8nX}
          fromY={n8nY}
          toX={erpX}
          toY={erpY}
          burstWidth={burstWidth}
          burstOpacity={burstOpacity}
          burstFilter={burstFilter}
        />
      </svg>

      {nodeDefs.map((node) => (
        <motion.div
          key={node.id}
          className="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] shadow-[0_22px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl"
          style={{
            left: `${(node.x / 320) * 100}%`,
            top: `${(node.y / 240) * 100}%`,
            x: node.magnet.x,
            y: node.magnet.y,
          }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.15),transparent_55%)]" />
          <div
            className="pointer-events-none absolute inset-[7px] rounded-full border"
            style={{ borderColor: `${node.color}33` }}
          />
          <div className="relative z-10 flex flex-col items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: node.color, boxShadow: `0 0 14px ${node.color}` }}
            />
            <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/78">
              {node.label}
            </span>
          </div>
        </motion.div>
      ))}
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
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.16), rgba(34,211,238,0.12) 18%, rgba(255,255,255,0.02) 34%, transparent 58%)`;

  const backX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const backY = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);
  const midX = useTransform(smoothX, [-0.5, 0.5], [-22, 22]);
  const midY = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);
  const frontX = useTransform(smoothX, [-0.5, 0.5], [-34, 34]);
  const frontY = useTransform(smoothY, [-0.5, 0.5], [-28, 28]);
  const coreX = useTransform(smoothX, [-0.5, 0.5], [-42, 42]);
  const coreY = useTransform(smoothY, [-0.5, 0.5], [-36, 36]);

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
          className="pointer-events-none absolute right-6 top-6 rounded-full border border-white/8 px-3 py-1 text-[9px] uppercase tracking-[0.24em] text-white/42"
          style={{ transform: 'translateZ(52px)' }}
        >
          Live Sync
        </div>

        <div
          className="absolute left-[8%] top-[18%] w-[74%]"
          style={{ transformStyle: 'preserve-3d', transform: 'translateZ(34px)' }}
        >
          <motion.pre
            style={{ x: backX, y: backY }}
            className="overflow-hidden rounded-[16px] border border-white/7 bg-white/[0.025] px-4 py-3 font-mono text-[11px] leading-6 text-cyan-100/42"
          >
{`const pipeline = {
  leads: "captured",
  sync: "crm.live",
  state: "stable"
};`}
          </motion.pre>
        </div>

        <div
          className="absolute right-[7%] top-[34%] w-[56%]"
          style={{ transformStyle: 'preserve-3d', transform: 'translateZ(82px)' }}
        >
          <motion.pre
            style={{ x: midX, y: midY }}
            className="overflow-hidden rounded-[18px] border border-white/8 bg-black/26 px-4 py-3 font-mono text-[11px] leading-6 text-white/58 shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
          >
{`SELECT revenue_today,
       active_clients,
       pending_tasks
FROM control_room;`}
          </motion.pre>
        </div>

        <div
          className="absolute left-[14%] top-[56%] w-[58%]"
          style={{ transformStyle: 'preserve-3d', transform: 'translateZ(138px)' }}
        >
          <motion.pre
            className="overflow-hidden rounded-[20px] border px-4 py-4 font-mono text-[11px] leading-6 text-white/78 shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
            style={{
              x: frontX,
              y: frontY,
              borderColor: `${service.accent}40`,
              background: `linear-gradient(135deg, ${service.accent}18, rgba(255,255,255,0.05))`,
            }}
          >
{`if (signal === "purchase_intent") {
  assignOwner("sales");
  pushDashboard("priority");
}`}
          </motion.pre>
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
    offset: ['start start', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 0.14, 0.7, 1], [0.985, 1, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.14, 0.7, 1], [0.7, 1, 1, 0.4]);
  const y = useTransform(scrollYProgress, [0, 0.22, 1], [36, 0, -18]);
  const blur = useTransform(scrollYProgress, [0.7, 1], [0, 10]);
  const brightness = useTransform(scrollYProgress, [0.7, 1], [1, 0.84]);
  const filter = useMotionTemplate`blur(${blur}px) brightness(${brightness})`;

  return (
    <div ref={cardRef} className="relative h-auto md:h-[100vh]" style={{ zIndex: index + 1 }}>
      <motion.article
        style={{ scale, opacity, y, filter }}
        className="relative mx-auto min-h-[78vh] overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.02] shadow-[0_0_100px_rgba(0,0,0,0.8),0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:sticky md:top-[10vh] md:h-[80vh] md:max-h-[80vh]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_34%,transparent_74%,rgba(255,255,255,0.02))]" />

        <div className="relative grid w-full items-stretch gap-6 p-4 sm:p-6 md:p-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 lg:p-10">
          <div className="order-2 flex min-h-0 flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.02] p-5 backdrop-blur-2xl sm:p-6 lg:order-1 lg:p-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-px w-6" style={{ backgroundColor: service.accent }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: service.accent }}
                >
                  {service.tag}
                </span>
              </div>

              <h3 className="mt-4 max-w-[14ch] text-[clamp(1.9rem,3.2vw,3.5rem)] font-black leading-[0.96] tracking-[-0.06em] text-white">
                {service.title}
              </h3>

              <p className="mt-5 max-w-[60ch] text-[15px] leading-7 text-white/68 sm:text-base sm:leading-8">
                {service.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {service.outcomes.map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{
                      y: -2,
                      boxShadow: `0 12px 30px -20px ${service.accent}`,
                    }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.05] bg-black/16 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-white/72"
                  >
                    <Check size={12} color={service.accent} strokeWidth={2} />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap items-end gap-x-4 gap-y-2 border-y border-white/[0.05] py-5">
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/38">desde</span>
                <span className="text-[clamp(2rem,3vw,3rem)] font-black tracking-[-0.05em] text-white">
                  {service.price}
                </span>
                <span
                  className="rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    borderColor: `${service.accent}28`,
                    color: service.accent,
                    backgroundColor: `${service.accent}12`,
                  }}
                >
                  {service.timeline}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {service.sectors.map((sector) => (
                  <motion.span
                    key={sector}
                    whileHover={{
                      y: -2,
                      color: 'rgba(255,255,255,0.82)',
                      borderColor: 'rgba(255,255,255,0.12)',
                    }}
                    transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                    className="rounded-full border border-white/[0.05] bg-black/16 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/50"
                  >
                    {sector}
                  </motion.span>
                ))}
              </div>

              <motion.button
                type="button"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                onClick={() => onNavigate(service.href)}
                className="mt-7 flex items-center gap-2 bg-transparent p-0 text-left text-[13px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: service.accent, border: 'none', cursor: 'pointer' }}
              >
                {service.cta}
                <ArrowUpRight size={15} />
              </motion.button>
            </div>
          </div>

          <div className="order-1 min-h-[320px] overflow-hidden rounded-3xl lg:order-2">
            <ServiceVisual service={service} />
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export default function OurServices() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { triggerTransition } = useTransitionContext();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const ambientOpacity = useTransform(scrollYProgress, [0, 0.18, 0.72, 1], [0.12, 0.22, 0.3, 0.16]);
  const auraY = useTransform(scrollYProgress, [0, 1], [-48, 140]);
  const auraScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1.03, 1.12]);
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
          className="absolute left-1/2 top-[-10vh] h-[72rem] w-[72rem] -translate-x-1/2 rounded-full blur-[170px]"
          style={{
            y: auraY,
            scale: auraScale,
            opacity: ambientOpacity,
            background:
              'radial-gradient(circle, rgba(96, 169, 188, 0.16) 0%, rgba(54, 86, 138, 0.14) 24%, rgba(13, 19, 31, 0.12) 44%, rgba(3, 3, 5, 0) 74%)',
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.045),transparent_34%)]" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.65) 1px, transparent 0)',
            backgroundSize: '72px 72px, 72px 72px, 24px 24px',
            maskImage: 'linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%)',
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%,transparent_82%,rgba(255,255,255,0.03))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_44%,rgba(0,0,0,0.34)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 pb-16 pt-20 sm:px-8 lg:px-10 lg:pt-28">
        <motion.div
          style={{ y: headerY, scale: headerScale }}
          className="max-w-4xl"
        >
          <span className="inline-flex rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48 backdrop-blur-2xl">
            Ecosistema
          </span>
          <h2 className="mt-6 bg-gradient-to-b from-[#f4f1ea] via-[#d8d2c5] to-[#7f7a71] bg-clip-text text-[clamp(3rem,6vw,6.5rem)] font-black tracking-tighter text-transparent">
            Nuestras Soluciones
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/56 sm:text-[17px]">
            Un stack de soluciones premium para vender mejor, operar con mas eficiencia y dirigir el crecimiento con claridad.
          </p>
        </motion.div>

        <div className="relative mt-16 space-y-6 md:min-h-[400vh] md:space-y-0">
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onNavigate={triggerTransition}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
