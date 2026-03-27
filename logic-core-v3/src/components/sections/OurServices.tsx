'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CaseCard {
  icon: string;
  title: string;
  description: string;
}

interface ServiceTab {
  id: string;
  label: string;
  icon: string;
  href: string;
  ctaText: string;
  problem: string;
  features: string[];
  price: string;
  time: string;
  casesTitle: string;
  cases: CaseCard[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TABS: ServiceTab[] = [
  {
    id: "web",
    label: "Sitio Web",
    icon: "🌐",
    href: "/web-development",
    ctaText: "Quiero mi sitio web →",
    problem:
      "Si alguien busca tu negocio en Google y no te encuentra, ese cliente fue a la competencia. Un sitio web profesional te pone en el mapa las 24 horas.",
    features: [
      "Diseño profesional adaptado a tu rubro",
      "Optimizado para aparecer en Google (SEO)",
      "Funciona perfecto en celular",
      "Formularios que capturan consultas",
      "Carga rápida (Core Web Vitals)",
      "Panel para que vos mismo actualices contenido",
    ],
    price: "desde $800 USD",
    time: "Primeros resultados en 15 días",
    casesTitle: "¿Para qué tipo de negocio?",
    cases: [
      {
        icon: "🚗",
        title: "Concesionaria",
        description:
          "Catálogo de vehículos online con formulario de consulta. Tus clientes ven los autos disponibles antes de venir al local.",
      },
      {
        icon: "🏥",
        title: "Clínica / Médico",
        description:
          "Turnos online 24/7. Tus pacientes sacan turno solos sin llamar a la secretaria.",
      },
      {
        icon: "🏋️",
        title: "Gimnasio",
        description:
          "Landing con membresías, horarios y clases. Captás socios nuevos aunque estés cerrado.",
      },
      {
        icon: "🍕",
        title: "Restaurante",
        description:
          "Menú digital, delivery y reservas. Más pedidos sin atender el teléfono.",
      },
    ],
  },
  {
    id: "ai",
    label: "Inteligencia Artificial",
    icon: "🤖",
    href: "/ai-implementations",
    ctaText: "Quiero un agente de IA →",
    problem:
      "Cada consulta que llega a las 11pm y no se responde es un cliente que se va a la competencia. Un agente de IA responde, califica y agenda por vos, a cualquier hora.",
    features: [
      "Bot para WhatsApp y/o tu sitio web",
      "Responde preguntas frecuentes automáticamente",
      "Califica si el cliente está listo para comprar",
      "Agenda reuniones o turnos solo",
      "Aprende de tu negocio con el tiempo",
      "Reportes de conversaciones cada semana",
    ],
    price: "desde $300 USD",
    time: "Funcionando en 7 días",
    casesTitle: "¿Para qué tipo de negocio?",
    cases: [
      {
        icon: "🚗",
        title: "Concesionaria",
        description:
          "El bot responde '¿tienen la Hilux disponible?' a las 2am y agenda el test drive para el día siguiente.",
      },
      {
        icon: "🏥",
        title: "Clínica",
        description:
          "El agente consulta síntomas, recomienda el especialista y agenda el turno sin que la recepcionista intervenga.",
      },
      {
        icon: "🏋️",
        title: "Gimnasio",
        description:
          "Responde preguntas sobre precios, horarios y planes. Convierte consultas en socios nuevos automáticamente.",
      },
      {
        icon: "🏪",
        title: "Comercio",
        description:
          "Atiende consultas de stock, precios y envíos. Tu local virtual abierto las 24 horas.",
      },
    ],
  },
  {
    id: "automation",
    label: "Automatizaciones",
    icon: "⚡",
    href: "/process-automation",
    ctaText: "Quiero automatizar mi negocio →",
    problem:
      "Si tu equipo pierde horas copiando datos de un lado a otro, mandando mails repetitivos o haciendo seguimiento manual, eso tiene un costo. Las automatizaciones eliminan ese costo.",
    features: [
      "Conexión entre tus apps (WhatsApp, Gmail, Drive, etc.)",
      "Notificaciones automáticas a tu equipo",
      "Seguimiento de clientes sin intervención manual",
      "Reportes automáticos cada semana o mes",
      "Flujos de aprobación digitales",
      "Backup automático de información importante",
    ],
    price: "desde $200 USD",
    time: "Primer flujo activo en 5 días",
    casesTitle: "¿Para qué tipo de negocio?",
    cases: [
      {
        icon: "🚗",
        title: "Concesionaria",
        description:
          "Cuando alguien llena el formulario web, automáticamente llega al vendedor por WhatsApp con todos los datos del cliente.",
      },
      {
        icon: "🏥",
        title: "Clínica",
        description:
          "Recordatorio automático de turno 24hs antes. Reducción de ausencias del 60%.",
      },
      {
        icon: "📦",
        title: "Distribuidora",
        description:
          "Cuando el stock baja de cierto nivel, el sistema genera la orden de compra automáticamente.",
      },
      {
        icon: "🏪",
        title: "Comercio",
        description:
          "Cada venta genera la factura, actualiza el stock y notifica al cliente. Sin tocar nada.",
      },
    ],
  },
  {
    id: "software",
    label: "Software a Medida",
    icon: "💻",
    href: "/software-development",
    ctaText: "Quiero un sistema a medida →",
    problem:
      "A veces el negocio creció y las planillas de Excel ya no alcanzan. Necesitás un sistema hecho específicamente para cómo trabaja tu empresa.",
    features: [
      "Sistema de gestión para tu operación",
      "CRM para seguimiento de clientes y ventas",
      "Panel de reportes en tiempo real",
      "Roles y permisos por usuario",
      "Integrado con tus herramientas actuales",
      "Tuyo para siempre, sin licencias mensuales",
    ],
    price: "desde $1.500 USD",
    time: "Entrega en etapas desde la semana 3",
    casesTitle: "¿Para qué tipo de negocio?",
    cases: [
      {
        icon: "🚗",
        title: "Concesionaria",
        description:
          "Sistema propio de gestión de inventario, ventas y seguimiento de clientes. Reemplaza 4 planillas de Excel.",
      },
      {
        icon: "🏥",
        title: "Clínica",
        description:
          "Historia clínica digital, turnos, facturación y reportes. Todo en un solo sistema.",
      },
      {
        icon: "🏗️",
        title: "Constructora",
        description:
          "Seguimiento de obras, materiales, subcontratistas y presupuestos en tiempo real.",
      },
      {
        icon: "🏪",
        title: "Comercio mayorista",
        description:
          "Gestión de pedidos, stock por depósito, lista de precios y vendedores con su propio acceso.",
      },
    ],
  },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const panelVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const featureVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.07, duration: 0.3 },
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CaseCard({ card, index }: { card: CaseCard; index: number }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xl leading-none">{card.icon}</span>
        <span className="text-sm font-semibold text-white">{card.title}</span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-400">{card.description}</p>
    </motion.div>
  );
}

function TabPanel({ tab, direction }: { tab: ServiceTab; direction: number }) {
  return (
    <motion.div
      key={tab.id}
      custom={direction}
      variants={panelVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="grid grid-cols-1 gap-8 lg:grid-cols-2"
    >
      {/* LEFT — Info */}
      <div className="flex flex-col gap-6">
        {/* Problem */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm">
          <p className="text-sm font-medium text-cyan-400 mb-2">El problema que resolvemos</p>
          <p className="text-base leading-relaxed text-zinc-300">{tab.problem}</p>
        </div>

        {/* Features */}
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Qué incluye
          </p>
          <ul className="flex flex-col gap-2">
            {tab.features.map((f, i) => (
              <motion.li
                key={f}
                variants={featureVariants}
                initial="hidden"
                animate="visible"
                custom={i}
                className="flex items-start gap-2.5 text-sm text-zinc-300"
              >
                <span className="mt-0.5 shrink-0 text-cyan-400">✓</span>
                {f}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Price + Time */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-sm text-zinc-500">desde </span>
            <span className="text-2xl font-bold text-white">
              {tab.price.replace("desde ", "")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
            <span className="text-xs">⏱</span>
            <span className="text-xs font-medium text-emerald-400">{tab.time}</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={tab.href}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          {tab.ctaText}
        </Link>
      </div>

      {/* RIGHT — Cases */}
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
          {tab.casesTitle}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {tab.cases.map((c, i) => (
            <CaseCard key={c.title} card={c} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Accordion (mobile) ───────────────────────────────────────────────────────

function AccordionItem({ tab, isOpen, onToggle }: { tab: ServiceTab; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <span>{tab.icon}</span>
          {tab.label}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-zinc-400"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.3 } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-5 border-t border-white/[0.06] px-5 pb-5 pt-4">
              {/* Problem */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
                <p className="mb-1.5 text-xs font-medium text-cyan-400">El problema que resolvemos</p>
                <p className="text-sm leading-relaxed text-zinc-300">{tab.problem}</p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2">
                {tab.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="mt-0.5 shrink-0 text-cyan-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Price + Time */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xl font-bold text-white">{tab.price}</span>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                  <span className="text-xs">⏱</span>
                  <span className="text-xs font-medium text-emerald-400">{tab.time}</span>
                </div>
              </div>

              {/* Cases — horizontal scroll */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  {tab.casesTitle}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {tab.cases.map((c) => (
                    <div
                      key={c.title}
                      className="min-w-[200px] shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
                    >
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="text-lg">{c.icon}</span>
                        <span className="text-xs font-semibold text-white">{c.title}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-400">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link
                href={tab.href}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-black"
              >
                {tab.ctaText}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OurServices() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  function handleTabChange(index: number) {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  }

  function handleAccordionToggle(index: number) {
    setOpenAccordion(openAccordion === index ? null : index);
  }

  return (
    <section
      id="servicios"
      style={{ backgroundColor: "#080a0c" }}
      className="relative py-24 overflow-hidden"
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Servicios
            </span>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            ¿Qué problema tenés?
          </h2>
          <p className="mx-auto max-w-2xl text-base text-zinc-400">
            Elegí lo que mejor describe tu situación y te contamos cómo lo resolvemos.
          </p>
        </div>

        {/* ── DESKTOP: Tab bar ── */}
        <div className="hidden lg:block">
          <div
            className="relative mb-8 flex gap-2 rounded-2xl p-2"
            style={{ backgroundColor: "#111113" }}
          >
            {TABS.map((tab, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(i)}
                  className="relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200"
                  style={{
                    color: isActive ? "#000" : "#71717a",
                    border: isActive ? "none" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-xl bg-cyan-400"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{tab.icon}</span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab panel */}
          <div
            className="overflow-hidden rounded-2xl border border-white/[0.06] p-8"
            style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <TabPanel
                key={activeIndex}
                tab={TABS[activeIndex]}
                direction={direction}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* ── MOBILE: Accordion ── */}
        <div className="flex flex-col gap-3 lg:hidden">
          {TABS.map((tab, i) => (
            <AccordionItem
              key={tab.id}
              tab={tab}
              isOpen={openAccordion === i}
              onToggle={() => handleAccordionToggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
