'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import type { MotionValue } from 'framer-motion';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Globe, Layers3, MonitorSmartphone, Sparkles } from 'lucide-react';
import { useTransitionContext } from '@/context/TransitionContext';

const socialLinks = {
  linkedin: 'https://linkedin.com/company/develop-agency',
  instagram: 'https://instagram.com/develop.agency',
  twitter: 'https://twitter.com/develop_agency',
  email: 'mailto:hola@develop.com.ar',
};

const GALLERY_ITEMS = [
  {
    eyebrow: 'Portal privado',
    title: 'Client Portal',
    description: 'Metricas, entregas y mensajes dentro de una sola vista.',
    accentFrom: '#22d3ee',
    accentTo: '#0f172a',
    glow: 'rgba(34,211,238,0.24)',
    badge: 'Live',
  },
  {
    eyebrow: 'Software B2B',
    title: 'Agency Dashboard',
    description: 'Operaciones, equipo y modulos con una UI sobria y precisa.',
    accentFrom: '#8b5cf6',
    accentTo: '#111827',
    glow: 'rgba(139,92,246,0.22)',
    badge: 'Suite',
  },
  {
    eyebrow: 'Web premium',
    title: 'Landing Commerce',
    description: 'Estructura comercial, velocidad y presencia visual.',
    accentFrom: '#38bdf8',
    accentTo: '#0b1120',
    glow: 'rgba(56,189,248,0.2)',
    badge: 'Launch',
  },
  {
    eyebrow: 'Automatizacion',
    title: 'Ops Flow',
    description: 'Flujos conectados, menos friccion y mas control operativo.',
    accentFrom: '#a78bfa',
    accentTo: '#111827',
    glow: 'rgba(167,139,250,0.22)',
    badge: 'Flow',
  },
];

function PreviewChrome() {
  return (
    <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
      <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
      <div className="ml-2 h-5 flex-1 rounded-full bg-white/[0.06]" />
    </div>
  );
}

function PreviewSurface({
  item,
  compact = false,
}: {
  item: (typeof GALLERY_ITEMS)[number];
  compact?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[26px] border border-white/10 bg-[#07090d]/95 shadow-[0_28px_60px_rgba(0,0,0,0.35)] ${compact ? 'h-[170px]' : 'h-[285px]'
        }`}
      style={{ boxShadow: `0 24px 60px rgba(0,0,0,0.32), 0 0 40px ${item.glow}` }}
    >
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at top left, ${item.accentFrom}55 0%, transparent 45%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
        }}
      />
      <PreviewChrome />

      <div className="relative z-10 flex h-full flex-col p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-400">{item.eyebrow}</div>
            <div className="mt-2 text-lg font-semibold tracking-tight text-white">{item.title}</div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-zinc-300">
            {item.badge}
          </div>
        </div>

        <div
          className={`mt-4 rounded-[18px] border border-white/10 p-4 ${compact ? 'h-[88px]' : 'h-[118px]'
            }`}
          style={{
            background: `linear-gradient(135deg, ${item.accentFrom}22 0%, ${item.accentTo} 100%)`,
          }}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75">
              <Sparkles className="h-3.5 w-3.5" />
              develOP
            </div>
            <div className="max-w-[80%] text-sm font-medium leading-5 text-white/90">{item.description}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/[0.05] p-3">
            <div className="text-[9px] uppercase tracking-[0.22em] text-zinc-500">UI</div>
            <div className="mt-2 h-2 rounded-full bg-white/70" />
            <div className="mt-2 h-2 w-2/3 rounded-full bg-white/20" />
          </div>
          <div className="rounded-xl bg-white/[0.05] p-3">
            <div className="text-[9px] uppercase tracking-[0.22em] text-zinc-500">Core</div>
            <div className="mt-2 h-2 rounded-full bg-white/80" />
            <div className="mt-2 h-2 w-1/2 rounded-full bg-white/20" />
          </div>
          <div className="rounded-xl bg-white/[0.05] p-3">
            <div className="text-[9px] uppercase tracking-[0.22em] text-zinc-500">Data</div>
            <div className="mt-2 h-2 rounded-full bg-white/65" />
            <div className="mt-2 h-2 w-3/4 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BackgroundPortalWall({
  y,
  scale,
}: {
  y: MotionValue<number>;
  scale: MotionValue<number>;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,24,0.18)_0%,rgba(7,12,19,0.28)_50%,rgba(4,6,10,0.58)_100%)]" />

      <motion.div
        className="absolute inset-[-10%]"
        style={{ y, scale }}
      >
        <div
          className="absolute inset-0 opacity-[0.74] blur-[7px] saturate-[1.18] brightness-[1.2]"
          style={{
            backgroundImage: "url('/footer-portal-wall.svg')",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,6,10,0.56)_0%,rgba(4,6,10,0.26)_20%,rgba(4,6,10,0.08)_36%,rgba(4,6,10,0.42)_72%,rgba(4,6,10,0.78)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,10,0.34)_0%,rgba(4,6,10,0.08)_14%,rgba(4,6,10,0.01)_28%,rgba(4,6,10,0.01)_72%,rgba(4,6,10,0.08)_86%,rgba(4,6,10,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(34,211,238,0.14)_0%,transparent_20%),radial-gradient(circle_at_12%_78%,rgba(34,211,238,0.12)_0%,transparent_22%),radial-gradient(circle_at_92%_18%,rgba(167,139,250,0.14)_0%,transparent_22%),radial-gradient(circle_at_90%_84%,rgba(34,211,238,0.12)_0%,transparent_20%)]" />
    </div>
  );
}

function TiltedGallery({
  items,
  side,
}: {
  items: (typeof GALLERY_ITEMS)[number][];
  side: 'left' | 'right';
}) {
  const shouldReduceMotion = useReducedMotion();

  const positions =
    side === 'left'
      ? [
        'left-6 top-2 -rotate-[8deg] z-20',
        'left-0 top-[238px] rotate-[6deg] z-10',
      ]
      : [
        'right-6 top-2 rotate-[8deg] z-20',
        'right-0 top-[238px] -rotate-[6deg] z-10',
      ];

  return (
    <div className="relative hidden h-[650px] w-[390px] xl:block">
      {items.map((item, index) => (
        <motion.div
          key={`${side}-${item.title}`}
          initial={{
            opacity: 0,
            x: side === 'left' ? -32 : 32,
            y: 22,
            rotate: side === 'left' ? -4 : 4,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 0,
          }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{
            duration: 0.55,
            delay: index * 0.08,
            ease: [0.23, 1, 0.32, 1],
          }}
          whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
          className={`absolute w-[342px] ${positions[index]}`}
        >
          <PreviewSurface item={item} />
        </motion.div>
      ))}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 transition-colors duration-200 hover:text-zinc-200"
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
    >
      {children}
    </Link>
  );
}

function MagneticButton({ href, isMobile = false }: { href: string; isMobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { triggerTransition } = useTransitionContext();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isSimulatingHover, setIsSimulatingHover] = useState(false);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);
  const textX = useTransform(mouseX, (value) => value * 0.3);
  const textY = useTransform(mouseY, (value) => value * 0.3);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isMobile || !ref.current) return;

    const { clientX, clientY } = event;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    x.set(middleX * 0.8);
    y.set(middleY * 0.8);
  };

  const reset = () => {
    if (isMobile) return;
    x.set(0);
    y.set(0);
  };

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();

    if (isMobile) {
      setIsSimulatingHover(true);

      setTimeout(() => {
        triggerTransition(href);

        setTimeout(() => {
          setIsSimulatingHover(false);
        }, 1000);
      }, 1500);
    } else {
      triggerTransition(href);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={isMobile ? 'cursor-pointer' : 'cursor-none'}
      data-cursor={isMobile ? '' : 'hover'}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={reset}
        style={{ x: mouseX, y: mouseY }}
        className={`relative flex items-center justify-center ${isSimulatingHover ? 'group-active-simulated' : 'group'
          }`}
        whileHover={!isMobile ? { scale: 1.55 } : {}}
        animate={isSimulatingHover ? { scale: 1.55 } : { scale: 1 }}
        transition={{ type: 'tween', ease: 'circOut', duration: isMobile ? 1.5 : 2.2 }}
      >
        <motion.div
          className={`relative overflow-hidden rounded-full bg-white transition-shadow duration-500 ${isMobile ? 'h-48 w-48' : 'h-40 w-40 md:h-56 md:w-56'
            } ${isSimulatingHover
              ? 'shadow-[0_0_100px_0px_rgba(34,211,238,0.45),0_0_60px_0px_rgba(255,255,255,0.35)]'
              : 'shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_100px_0px_rgba(34,211,238,0.45),0_0_60px_0px_rgba(255,255,255,0.35)]'
            }`}
          whileHover={
            !isMobile
              ? {
                x: [0, -1, 1, -1, 1, 0],
                y: [0, 1, -1, 1, -1, 0],
              }
              : {}
          }
          animate={
            isSimulatingHover
              ? {
                x: [0, -1, 1, -1, 1, 0],
                y: [0, 1, -1, 1, -1, 0],
              }
              : { x: 0, y: 0 }
          }
          transition={{
            x: { repeat: Infinity, duration: 0.2, ease: 'linear' },
            y: { repeat: Infinity, duration: 0.2, ease: 'linear', delay: 0.1 },
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white via-zinc-200 to-zinc-100 opacity-100" />
          <div
            className={`absolute inset-0 bg-gradient-to-tr from-cyan-50 via-white to-zinc-100 transition-opacity duration-700 ${isSimulatingHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
          />
          <div
            className={`absolute inset-0 scale-95 rounded-full border transition-colors duration-500 ${isSimulatingHover
              ? 'border-zinc-400 opacity-50'
              : 'border-zinc-300 opacity-50 group-hover:border-zinc-400'
              }`}
          />

          <motion.div
            style={{ x: textX, y: textY }}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            <span
              className={`absolute inset-0 flex items-center justify-center text-center text-xl font-black tracking-tighter text-black transition-opacity duration-300 md:text-2xl ${isSimulatingHover ? 'opacity-0' : 'group-hover:opacity-0'
                }`}
            >
              EMPEZAR
            </span>

            <div
              className={`absolute inset-0 flex items-center justify-center origin-center transform transition-all duration-500 delay-100 ${isSimulatingHover
                ? 'opacity-100 scale-110 rotate-45'
                : 'opacity-0 scale-50 rotate-45 group-hover:opacity-100 group-hover:scale-110'
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={isMobile ? '74' : '62'}
                height={isMobile ? '74' : '62'}
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
                style={{ transform: 'rotate(-45deg)' }}
              >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        <div
          className={`absolute inset-0 -z-10 scale-100 rounded-full border border-white/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] transition-opacity duration-1000 ${isSimulatingHover ? 'opacity-0' : 'opacity-30 group-hover:opacity-0'
            }`}
        />
      </motion.div>
    </div>
  );
}

export const Footer = () => {
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const wallY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-48, 84]);
  const wallScale = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1.12, 1.12] : [1.12, 1.2]);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-[#04060a] py-24 md:py-32">
      <BackgroundPortalWall y={wallY} scale={wallScale} />

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.09)_0%,transparent_35%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.08)_0%,transparent_32%)]" />

      <div className="relative z-10 mx-auto max-w-[1760px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 xl:grid-cols-[390px_minmax(0,820px)_390px] xl:gap-10">
          <TiltedGallery items={GALLERY_ITEMS.slice(0, 2)} side="left" />

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="relative mx-auto flex min-h-[760px] w-full max-w-[820px] flex-col items-center justify-center overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_30%,rgba(6,8,12,0.86)_100%)] px-6 py-16 text-center shadow-[0_40px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl md:px-10"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_18%,transparent_82%,rgba(255,255,255,0.02)_100%)]" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/8 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-cyan-300">
                <Globe className="h-3.5 w-3.5" />
                Build with develOP
              </div>

              <div className="mt-8 text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text">
                <h2 className="text-[16.8vw] font-black leading-[0.9] tracking-[0.16em] md:text-[6.8vw] md:tracking-[0.1em]">
                  {shouldReduceMotion ? 'LISTO' : <span >¿LISTO</span>}
                </h2>
                <h2 className="mt-1.5 text-[10.2vw] font-bold leading-[0.94] tracking-[0.14em] text-zinc-300 md:text-[5.35vw] md:tracking-[0.1em]">
                  {shouldReduceMotion ? 'PARA' : <span className="block pl-[0.14em]">PARA</span>}
                </h2>
              </div>

              <div className="my-8 md:my-10">
                <MagneticButton href="/contact" isMobile={false} />
              </div>

              <h2 className="text-[16.8vw] font-black leading-[0.8] tracking-[0.1em] text-transparent bg-gradient-to-b from-cyan-300 via-cyan-400 to-cyan-600 bg-clip-text md:text-[8.5vw] md:tracking-[0.1em]">
                <span className="block pl-[0.1em] pb-[0.1em]">CRECER?</span>
              </h2>

              <p className="mt-10 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                Una experiencia mas sobria, un CTA mas claro y un cierre que sigue teniendo presencia
                sin depender de efectos pesados.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs tracking-[0.2em] text-zinc-300 uppercase">
                  <Layers3 className="h-3.5 w-3.5 text-cyan-300" />
                  Landing pages
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs tracking-[0.2em] text-zinc-300 uppercase">
                  <MonitorSmartphone className="h-3.5 w-3.5 text-violet-300" />
                  Client portals
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-16 flex flex-col items-center gap-6">
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Contacto</div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-400">
                <span>Tucuman, Argentina</span>
                <span className="hidden text-zinc-700 md:inline">|</span>
                <span>hola@develop.com.ar</span>
                <span className="hidden text-zinc-700 md:inline">|</span>
                <span>Respuesta &lt; 24hs</span>
              </div>

              <div className="flex flex-wrap justify-center gap-5 pt-2">
                <FooterLink href={socialLinks.linkedin}>LinkedIn</FooterLink>
                <FooterLink href={socialLinks.instagram}>Instagram</FooterLink>
                <FooterLink href={socialLinks.twitter}>Twitter_X</FooterLink>
                <FooterLink href={socialLinks.email}>Email</FooterLink>
              </div>
            </div>
          </motion.div>

          <TiltedGallery items={GALLERY_ITEMS.slice(2, 4)} side="right" />
        </div>
      </div>
    </footer>
  );
};
