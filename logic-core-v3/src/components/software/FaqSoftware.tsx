"use client"

import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MessageCircle, ArrowRight, Minus, Plus } from 'lucide-react'

type FaqItem = {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Cuánto cuesta un sistema a medida para mi empresa?',
    answer: 'Depende de la complejidad. Un CRM básico arranca desde $1.500 USD con panel de clientes, historial de ventas y reportes. Un ERP completo con múltiples módulos puede ir desde $4.000 USD. Lo que siempre garantizamos: el costo es fijo (sin sorpresas) y lo que construimos es tuyo para siempre, sin suscripciones de plataforma.',
  },
  {
    question: '¿Cuánto tiempo demora el desarrollo desde el día 1?',
    answer: 'Entre 6 y 16 semanas según la escala. Semana 1-2: relevamiento y arquitectura. Semana 3-4: diseño de interfaces. Semana 5-10: desarrollo del core. Semana 11-16: módulos adicionales, pruebas y lanzamiento. Tenés acceso a un demo funcional desde la semana 4 para dar feedback en tiempo real.',
  },
  {
    question: '¿Pueden migrar mis datos de Excel, Google Sheets o sistema anterior?',
    answer: 'Sí, siempre. La migración de datos es parte del proceso estándar. Exportamos todo lo que tenés (clientes, productos, historial), lo limpiamos y lo cargamos en el nuevo sistema. Si tu sistema anterior tiene una API o exportación CSV, el proceso es limpio y sin pérdida de información.',
  },
  {
    question: '¿El sistema funciona desde el celular de mis empleados?',
    answer: 'Completamente. Desarrollamos en Next.js con diseño responsive que funciona igual en celular, tablet y computadora. No necesitás instalar nada — se accede desde el navegador con usuario y contraseña. Si necesitás una app nativa para iOS o Android, podemos cotizarla por separado.',
  },
  {
    question: '¿Qué pasa si necesito cambios o nuevas funciones después de la entrega?',
    answer: 'El sistema es tuyo: podés pedirme cambios cuando quieras. Ofrecemos un plan de mantenimiento mensual que cubre hasta 10 horas de ajustes, actualizaciones de seguridad y soporte prioritario. También podés contratar horas sueltas para features nuevos. Nunca quedás encadenado a un proveedor.',
  },
  {
    question: '¿Trabajan con empresas de otras provincias o solo Tucumán?',
    answer: 'Trabajamos con empresas de todo el país y también en el exterior. Tucumán es nuestra base, pero el 40% de nuestros proyectos son para clientes de Buenos Aires, Mendoza, Córdoba y Uruguay. Todo el proceso puede hacerse 100% remoto con reuniones por videollamada y entregas por demo en vivo.',
  },
  {
    question: '¿Qué tecnologías usan y por qué?',
    answer: 'Stack moderno y estable: Next.js + TypeScript para el frontend (velocidad + seguridad de tipos), Node.js o Python para el backend, PostgreSQL para la base de datos y hosting en la nube (AWS o Vercel según necesidad). Elegimos tecnología madura con comunidad activa — sin experimentos que te dejen colgado en 2 años.',
  },
  {
    question: '¿Cómo garantizan que el sistema no va a fallar en producción?',
    answer: 'Tres capas de protección: (1) testing automatizado antes de cada deploy, (2) monitoreo 24/7 con alertas en tiempo real, y (3) backups automáticos diarios. Nuestro uptime promedio en sistemas productivos es del 99,7%. En 3 años de desarrollo, ningún cliente perdió datos. Si algo falla, lo resolvemos en menos de 4 horas hábiles.',
  },
]

const OBJECTION_ITEMS: FaqItem[] = [
  {
    question: '¿Y si no me gusta cómo queda?',
    answer: 'No cerramos ninguna pantalla sin tu aprobación. Validamos arquitectura, flujos y estética antes de construir el sistema completo.',
  },
  {
    question: '¿Qué pasa si quiero agregar módulos después?',
    answer: 'El sistema se construye modular desde el día 1. Agregar nuevas áreas no implica rehacer lo que ya funciona — solo sumamos encima.',
  },
  {
    question: '¿Qué incluye exactamente el precio?',
    answer: 'Alcance, entregables y etapas definidos desde el inicio. Sin zonas grises ni costos sorpresa a mitad del proyecto. El precio acordado es el precio final.',
  },
]

const springTransition = {
  type: 'spring',
  stiffness: 190,
  damping: 24,
  mass: 0.85,
} as const

const ease = [0.16, 1, 0.3, 1] as const

function LuminousAccordion({
  items,
  openIndex,
  onToggle,
  delayOffset = 0,
  tone = 'indigo',
}: {
  items: FaqItem[]
  openIndex: number | null
  onToggle: (index: number) => void
  delayOffset?: number
  tone?: 'indigo' | 'violet'
}) {
  const accentRgb = tone === 'indigo' ? '99,102,241' : '139,92,246'
  const accentText = tone === 'indigo' ? 'text-indigo-300' : 'text-violet-300'

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <motion.article
            key={item.question}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: delayOffset + index * 0.05, ease }}
            className="group/faq-item relative overflow-hidden rounded-2xl border backdrop-blur-[18px] transition-all duration-150"
            style={{
              borderColor: isOpen ? `rgba(${accentRgb},0.62)` : 'rgba(255,255,255,0.12)',
              background: isOpen
                ? 'linear-gradient(145deg, rgba(9,10,28,0.92) 0%, rgba(6,6,20,0.95) 62%, rgba(8,8,24,0.90) 100%)'
                : 'linear-gradient(145deg, rgba(9,10,24,0.72) 0%, rgba(7,7,20,0.66) 60%, rgba(9,9,24,0.70) 100%)',
              boxShadow: isOpen
                ? `0 0 0 1px rgba(${accentRgb},0.3), 0 0 30px rgba(${accentRgb},0.15), inset 0 0 20px rgba(${accentRgb},0.08)`
                : '0 14px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(255,255,255,0.03)',
              WebkitBackdropFilter: 'blur(18px) saturate(145%)',
              backdropFilter: 'blur(18px) saturate(145%)',
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: isOpen ? 0.44 : 0.32,
                background:
                  'linear-gradient(140deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 24%, rgba(255,255,255,0.01) 62%, rgba(255,255,255,0.04) 100%)',
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover/faq-item:opacity-100"
              style={{
                background:
                  `radial-gradient(75% 85% at 0% 0%, rgba(${accentRgb},0.14) 0%, transparent 62%), ` +
                  `radial-gradient(70% 80% at 100% 100%, rgba(${accentRgb},0.10) 0%, transparent 66%)`,
              }}
            />

            <button
              onClick={() => onToggle(index)}
              aria-expanded={isOpen}
              className="relative z-10 w-full px-5 py-6 text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className="max-w-3xl text-[clamp(1rem,1.6vw,1.15rem)] font-semibold leading-relaxed transition-colors duration-150"
                  style={{ color: isOpen ? 'rgba(241,245,249,0.98)' : 'rgba(255,255,255,0.85)' }}
                >
                  {item.question}
                </span>

                <div
                  className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-150"
                  style={{
                    borderColor: isOpen ? `rgba(${accentRgb},0.64)` : 'rgba(255,255,255,0.12)',
                    background: isOpen ? `rgba(${accentRgb},0.18)` : 'rgba(255,255,255,0.03)',
                    boxShadow: isOpen ? `0 0 18px rgba(${accentRgb},0.35)` : 'none',
                  }}
                >
                  {isOpen
                    ? <Minus size={15} strokeWidth={1.5} className={accentText} />
                    : <Plus size={15} strokeWidth={1.5} className="text-white/60" />
                  }
                </div>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -8 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -6 }}
                  transition={{
                    height: springTransition,
                    opacity: { duration: 0.2, ease },
                    y: springTransition,
                  }}
                  className="overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    initial={{ boxShadow: `0 0 0 rgba(${accentRgb},0)` }}
                    animate={{ boxShadow: `0 0 0 1px rgba(${accentRgb},0.28), 0 0 24px rgba(${accentRgb},0.12)` }}
                    transition={{ duration: 0.32, ease }}
                    className="mx-5 mb-5 rounded-xl border bg-black/30 px-4 py-4 backdrop-blur-[14px] sm:px-5"
                    style={{ borderColor: `rgba(${accentRgb},0.28)` }}
                  >
                    <p className="text-sm leading-8 text-zinc-300 md:text-[15px]">
                      {item.answer}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        )
      })}
    </div>
  )
}

export default function FaqSoftware() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const [openObjectionIndex, setOpenObjectionIndex] = useState<number | null>(0)
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative z-10 w-full overflow-hidden bg-[#06060f] px-4 py-24 md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 86% at 50% 0%, rgba(49,46,129,0.22) 0%, rgba(6,6,15,0) 58%), radial-gradient(96% 74% at 82% 90%, rgba(76,29,149,0.16) 0%, rgba(6,6,15,0) 68%)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(99,102,241,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.10) 1px, transparent 1px)',
          backgroundSize: '7.2rem 7.2rem',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 32%, transparent 92%)',
        }}
      />

      <motion.div
        aria-hidden="true"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, filter: 'blur(10px)' }}
        whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.22 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease }}
        className="pointer-events-none absolute left-1/2 top-0 z-[1] aspect-square w-[156%] -translate-x-1/2 sm:w-[152%] md:top-1/2 md:w-[148%] md:-translate-y-1/2 lg:w-[142%] xl:w-[136%]"
      >
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id="sw-faq-stroke" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(99,102,241,0.07)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0.10)" />
            </linearGradient>
            <linearGradient id="sw-faq-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(99,102,241,0.08)" />
              <stop offset="52%" stopColor="rgba(139,92,246,0.12)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.06)" />
            </linearGradient>
            <pattern id="sw-faq-lines" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(26)">
              <rect width="26" height="26" fill="rgba(0,0,0,0)" />
              <line x1="0" y1="0" x2="0" y2="26" stroke="rgba(167,139,250,0.14)" strokeWidth="2" />
            </pattern>
            <mask id="sw-faq-mask">
              <rect width="1000" height="1000" fill="black" />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="1260" fontWeight="900" fill="white">?</text>
            </mask>
          </defs>
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="1260" fontWeight="900" fill="transparent" stroke="url(#sw-faq-stroke)" strokeWidth="6" opacity="0.5">?</text>
          <g mask="url(#sw-faq-mask)" opacity="0.28">
            <rect width="1000" height="1000" fill="url(#sw-faq-fill)" />
            <rect width="1000" height="1000" fill="url(#sw-faq-lines)" />
          </g>
        </svg>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay: prefersReducedMotion ? 0 : 0.42, ease }}
        className="relative z-10 mx-auto max-w-[90rem]"
      >
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, delay: 0.08, ease }}
          className="mb-16 text-center lg:text-left"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/[0.07] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-200/88 shadow-[0_0_20px_rgba(99,102,241,0.14)]">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_14px_rgba(99,102,241,0.85)]" />
            Preguntas frecuentes
          </div>

          <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-[0.96] tracking-[-0.05em] text-white">
            Todo lo que querés saber
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-200 bg-clip-text text-transparent">
              antes de empezar.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-300/70 md:text-lg lg:mx-0">
            Respondemos las dudas más comunes sobre desarrollo de software a medida
            para empresas de Tucumán y Argentina.
          </p>
        </motion.div>

        <LuminousAccordion
          items={FAQ_ITEMS}
          openIndex={openFaqIndex}
          onToggle={(index) => setOpenFaqIndex(openFaqIndex === index ? null : index)}
          tone="indigo"
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.08, ease }}
          className="mb-6 mt-14 text-center lg:text-left"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/18 bg-violet-400/[0.06] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-200/82">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400/90" />
            Objeciones comunes
          </div>
          <p className="mx-auto max-w-3xl text-sm leading-7 text-zinc-300/68 md:text-base lg:mx-0">
            Las dudas que más frenan la decisión, reunidas acá para que tengas claridad total.
          </p>
        </motion.div>

        <LuminousAccordion
          items={OBJECTION_ITEMS}
          openIndex={openObjectionIndex}
          onToggle={(index) => setOpenObjectionIndex(openObjectionIndex === index ? null : index)}
          delayOffset={0.12}
          tone="violet"
        />

        <motion.button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-mascot-chat'))}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          whileHover={{
            borderColor: 'rgba(99,102,241,0.55)',
            backgroundColor: 'rgba(99,102,241,0.06)',
            y: -2,
          }}
          transition={{ duration: 0.45, ease }}
          className="mt-10 w-full rounded-2xl border px-6 py-5 text-left"
          style={{
            borderColor: 'rgba(99,102,241,0.30)',
            background: 'linear-gradient(145deg, rgba(99,102,241,0.08) 0%, rgba(67,56,202,0.12) 55%, rgba(124,58,237,0.10) 100%)',
            boxShadow: '0 0 0 1px rgba(99,102,241,0.12), 0 14px 36px rgba(0,0,0,0.34)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(99,102,241,0.10)',
                border: '1px solid rgba(99,102,241,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#818cf8', flexShrink: 0,
              }}>
                <MessageCircle size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontSize: 'clamp(16px,2vw,20px)', fontWeight: 700, color: 'rgba(224,231,255,0.96)', margin: '0 0 3px' }}>
                  ¿Tenés otra pregunta?
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>
                  Abrí el chat y preguntá lo que quieras — respondemos al instante.
                </p>
              </div>
            </div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ color: 'rgba(99,102,241,0.55)', flexShrink: 0 }}
            >
              <ArrowRight size={20} strokeWidth={1.5} />
            </motion.div>
          </div>
        </motion.button>
      </motion.div>
    </section>
  )
}
