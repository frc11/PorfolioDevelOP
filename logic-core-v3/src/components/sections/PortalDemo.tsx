'use client';

import { motion } from 'framer-motion';
import { BarChart2, MessageSquare, CheckSquare } from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature {
  icon: React.ReactNode;
  color: string;
  glow: string;
  title: string;
  description: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  {
    icon: <BarChart2 size={22} />,
    color: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
    title: 'Métricas de tu negocio',
    description:
      'Visitantes, posicionamiento en Google y ROI. Todo actualizado automáticamente, sin pedirlo.',
  },
  {
    icon: <MessageSquare size={22} />,
    color: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    title: 'Comunicación directa',
    description:
      'Hablá con el equipo develOP cuando quieras. Sin grupos de WhatsApp, sin mails perdidos.',
  },
  {
    icon: <CheckSquare size={22} />,
    color: 'text-violet-400',
    glow: 'shadow-violet-500/20',
    title: 'Estado del proyecto',
    description:
      'Cada tarea, cada entrega. Ves el avance en tiempo real y aprobás cuando estés listo.',
  },
];

// ─── Stagger variants ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      animate={{ y: [0, -8, 0] }}
      // @ts-expect-error — framer-motion animate + transition coexistence
      style={{ animationPlayState: 'running' }}
      className="w-full max-w-2xl mx-auto"
    >
      <FloatingMockup />
    </motion.div>
  );
}

function FloatingMockup() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60"
      style={{ background: '#080a0c' }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-white/10"
        style={{ background: '#0d0f10' }}
      >
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <div
          className="flex-1 mx-3 rounded-md px-3 py-1 text-xs text-white/30 font-mono"
          style={{ background: '#1a1c1e' }}
        >
          portal.develop.com.ar
        </div>
      </div>

      {/* Dashboard header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-white/5"
        style={{ background: '#0d0f10' }}
      >
        <span className="text-sm font-bold tracking-tight text-white/90">
          devel<span className="text-cyan-400">OP</span>
        </span>
        <span className="text-xs text-white/40">Concesionaria San Miguel</span>
      </div>

      {/* Dashboard body */}
      <div className="p-5 space-y-4" style={{ background: '#080a0c' }}>

        {/* Row 1 — metric cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Visitas', value: '1.842' },
            { label: 'Servicios', value: '2' },
            { label: 'Tareas', value: '3' },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg p-3 border border-white/5 flex flex-col gap-1"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{card.label}</span>
              <span className="text-lg font-bold text-white/90">{card.value}</span>
            </div>
          ))}
        </div>

        {/* Row 2 — progress bar */}
        <div
          className="rounded-lg p-4 border border-white/5 space-y-2"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="flex justify-between text-xs text-white/50">
            <span>Proyecto: en progreso</span>
            <span className="text-cyan-400 font-semibold">29%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '29%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
            />
          </div>
        </div>

        {/* Row 3 — message preview */}
        <div
          className="rounded-lg px-4 py-3 border border-white/5 flex items-start gap-3"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[10px] font-bold text-cyan-400">F</span>
          </div>
          <div>
            <p className="text-[11px] text-white/50 mb-0.5">
              <span className="text-white/70 font-semibold">Franco</span> · hace 2h
            </p>
            <p className="text-xs text-white/60">El catálogo está casi listo, revisalo cuando puedas ✅</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PortalDemo() {
  return (
    <section
      className="relative w-full py-24 md:py-32 overflow-hidden"
      style={{ background: '#080a0c' }}
    >
      {/* Radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(6,182,212,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border border-cyan-500/30 text-cyan-400 bg-cyan-500/5">
            Incluido en todos los proyectos
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
            Tu panel de control,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">
              siempre disponible
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/50 leading-relaxed">
            Sabés exactamente en qué estamos trabajando, cuándo termina y cómo está rindiendo tu
            inversión. En tiempo real, desde tu celular.
          </p>
        </motion.div>

        {/* ── Two-column layout: features + mockup ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={`flex items-start gap-5 rounded-2xl p-5 border border-white/5 shadow-lg ${feature.glow}`}
                style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
              >
                <div
                  className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${feature.color} border border-white/10`}
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Mockup */}
          <DashboardMockup />

        </div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-20"
        >
          <p className="text-white/50 text-sm mb-5">
            ¿Querés ver cómo quedaría para tu negocio?
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-black bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20"
          >
            Ver demo en vivo →
          </Link>
          <p className="mt-4 text-xs text-white/30 tracking-wide">
            Acceso inmediato · Sin registrarte · Sin costo
          </p>
        </motion.div>

      </div>
    </section>
  );
}
