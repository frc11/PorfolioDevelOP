'use client'

import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence, useReducedMotion } from 'motion/react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string
  answer: string
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const faqItems: FAQItem[] = [
  {
    question: '¿Tengo que cambiar mi número de WhatsApp?',
    answer: 'No. Conectamos la IA a tu número de WhatsApp actual usando la API oficial de Meta. Tus clientes siguen escribiendo al mismo número de siempre — solo que ahora alguien responde al instante, las 24 horas.',
  },
  {
    question: '¿La IA puede inventar precios o información incorrecta?',
    answer: 'No puede. Los agentes que construimos tienen reglas estrictas: solo responden en base a tus datos reales (precios, stock, políticas). Si alguien pregunta algo que la IA no sabe, deriva la conversación a un humano de tu equipo automáticamente. Nada se inventa.',
  },
  {
    question: '¿La IA puede cobrar por MercadoPago?',
    answer: 'Sí. El agente puede generar el link de pago de MercadoPago, enviárselo al cliente por WhatsApp y verificar que el pago se acreditó. Todo en la misma conversación, sin que intervenga nadie de tu equipo.',
  },
  {
    question: '¿Necesito saber programar para usarlo después?',
    answer: 'Para nada. Te entregamos un panel simple donde podés ver todas las conversaciones, actualizar los datos de tu negocio y revisar el historial. No hace falta tocar código nunca.',
  },
  {
    question: '¿Cuánto tiempo lleva implementarlo?',
    answer: 'La primera versión funcional está lista en 2 semanas. Empezamos con los casos más frecuentes (consultas de precio, turnos, stock) y de ahí expandimos. En el primer mes ya ves resultados medibles.',
  },
  {
    question: '¿Qué pasa si quiero pausar o cancelar?',
    answer: 'Sin contrato largo. La suscripción mensual se puede pausar o cancelar en cualquier momento. El agente que construimos para tu negocio queda documentado — no perdés nada de lo que se armó.',
  },
]

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function AtmosphereVault() {
  return (
    <>
      {/* Glow principal superior */}
      <div style={{
        position:'absolute',
        top:'-80px', left:'50%',
        transform:'translateX(-50%)',
        width:'800px', height:'500px',
        background:'radial-gradient(ellipse, rgba(123,47,255,0.08) 0%, rgba(0,255,136,0.04) 40%, transparent 65%)',
        filter:'blur(100px)',
        pointerEvents:'none',
        zIndex:0,
      }}/>

      {/* Glow CTA inferior */}
      <div style={{
        position:'absolute',
        bottom:'-40px', left:'50%',
        transform:'translateX(-50%)',
        width:'700px', height:'400px',
        background:'radial-gradient(ellipse, rgba(0,255,136,0.08) 0%, transparent 60%)',
        filter:'blur(90px)',
        pointerEvents:'none',
        zIndex:0,
      }}/>

      {/* Líneas de horizonte decorativas */}
      {[20, 50, 80].map((top, i) => (
        <div key={i} style={{
          position: 'absolute', top: `${top}%`, left: 0, right: 0, height: '1px',
          background: 'rgba(255,255,255,0.015)', pointerEvents: 'none', zIndex: 0,
        }} />
      ))}
    </>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <motion.div
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          display: 'inline-flex', padding: '6px 16px', borderRadius: '100px',
          border: '1px solid rgba(0, 255, 136, 0.3)', color: '#00ff88',
          fontSize: '11px', letterSpacing: '0.25em', fontWeight: 600,
          background: 'rgba(0, 255, 136, 0.05)', marginBottom: '20px'
        }}
      >
        [ LO QUE QUERÉS SABER ]
      </motion.div>
      <motion.h2
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900,
          color: 'white', margin: '0 0 16px', lineHeight: 1.1
        }}
      >
        Todo claro antes de arrancar.
      </motion.h2>
      <motion.p
        initial={reduced ? { opacity: 1 } : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.4)', maxWidth: '500px', margin: '0 auto' }}
      >
        Las preguntas que todos hacen — respondidas sin blablá.
      </motion.p>
    </div>
  )
}

function SocialProof({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.15)',
        borderRadius: '14px', padding: '16px 20px', marginBottom: 'clamp(32px, 4vh, 48px)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex' }}>
        {['#00ff88', '#7b2fff', '#00ff88', '#7b2fff', '#00ff88'].map((c, i) => (
          <div key={i} style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${c}, rgba(0,0,0,0.5))`,
            border: '2px solid #030308', marginLeft: i === 0 ? 0 : '-8px',
            position: 'relative', zIndex: 5 - i,
          }} />
        ))}
      </div>

      <div style={{ flex: 1, minWidth: '200px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: '0 0 3px' }}>
          +47 negocios ya automatizados en NOA
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          Restaurantes · Clínicas · Comercios · Inmobiliarias en Tucumán y alrededores
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {'★★★★★'.split('').map((s, i) => (
            <span key={i} style={{ fontSize: '16px', color: '#00ff88' }}>{s}</span>
          ))}
        </div>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Excelencia en servicio</span>
      </div>
    </motion.div>
  )
}

function FAQItem({ item, index, isOpen, onToggle, isInView }: { item: FAQItem; index: number; isOpen: boolean; onToggle: () => void; isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)', position: 'relative',
        ...(isOpen && !reduced && { borderLeft: '2px solid rgba(0, 255, 136, 0.4)', paddingLeft: '12px' }),
        transition: 'border 200ms, padding 200ms',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%', padding: 'clamp(16px, 2.5vh, 22px) 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: '16px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 'clamp(14px, 1.6vw, 17px)', fontWeight: 600,
          color: isOpen ? '#00ff88' : 'rgba(255,255,255,0.75)',
          transition: 'color 200ms', lineHeight: 1.4, flex: 1,
        }}>
          {item.question}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: isOpen ? '1px solid rgba(0, 255, 136, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
            background: isOpen ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: isOpen ? '#00ff88' : 'rgba(255, 255, 255, 0.4)',
            flexShrink: 0, transition: 'background 200ms, border 200ms',
          }}
        >
          +
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              fontSize: '14px', lineHeight: 1.75, color: 'rgba(255, 255, 255, 0.5)',
              margin: '0 48px 20px 0', paddingBottom: '4px'
            }}>
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FAQList({ items, openIndex, setOpenIndex, isInView }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item: FAQItem, i: number) => (
        <FAQItem
          key={i} item={item} index={i}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          isInView={isInView}
        />
      ))}
    </div>
  )
}

function CTAFinal({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginTop: 'clamp(56px, 8vh, 96px)', textAlign: 'center', position: 'relative' }}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.3) 30%, rgba(123,47,255,0.3) 70%, transparent)',
          transformOrigin: 'center', marginBottom: 'clamp(48px, 7vh, 80px)',
        }}
      />

      <p style={{ fontSize: '11px', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', margin: '0 0 20px' }}>
        ¿SEGUÍS MANEJANDO TODO A MANO?
      </p>

      <h2 style={{ fontSize: 'clamp(32px, 5vw, 68px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        <span style={{ color: 'white' }}>¿Tu competencia ya</span><br />
        <span style={{
          background: 'linear-gradient(135deg, #00ff88, #7b2fff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          integró IA? ¿Y tú?
        </span>
      </h2>

      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '480px', margin: '0 auto clamp(32px, 5vh, 52px)', lineHeight: 1.65 }}>
        El momento de integrar IA no es el año que viene. Es hoy.<br />
        Sin contrato largo. Resultados visibles desde el primer mes.
      </p>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: '100px', padding: '8px 18px', marginBottom: '32px',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Primera consulta gratuita · Sin compromiso</span>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'clamp(24px, 4vh, 40px)' }}>
        <motion.a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola DevelOP, vi la página de IA y quiero ver cómo funciona para mi negocio')}`}
          target="_blank" rel="noopener noreferrer"
          whileHover={reduced ? {} : { scale: 1.04 }}
          whileTap={reduced ? {} : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'linear-gradient(135deg, #25d366, #128c7e)', color: 'white',
            fontWeight: 800, fontSize: '15px', letterSpacing: '0.04em', padding: '16px 36px',
            borderRadius: '100px', textDecoration: 'none',
            boxShadow: '0 0 40px rgba(37,211,102,0.3), 0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          💬 Quiero implementar IA →
        </motion.a>

        <motion.a
          href="#live-chat"
          whileHover={reduced ? {} : { scale: 1.02, borderColor: 'rgba(0,255,136,0.4)' }}
          whileTap={reduced ? {} : { scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '14px',
            padding: '16px 28px', borderRadius: '100px', textDecoration: 'none', transition: 'all 200ms',
          }}
        >
          Probar la IA primero
        </motion.a>
      </div>

      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em' }}>
        Respondemos en menos de 2 horas en horario comercial
      </p>

      <div style={{
        marginTop: 'clamp(48px, 7vh, 80px)', paddingTop: '32px',
        borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ textAlign: 'left' }}>
          <span style={{
            fontSize: '18px', fontWeight: 900,
            background: 'linear-gradient(135deg, #00ff88, #7b2fff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            display: 'block',
          }}>
            DevelOP
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>
            TUCUMÁN · ARGENTINA
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.12)', margin: 0 }}>
          © 2025 DevelOP. Todos los derechos reservados.
        </p>
      </div>
    </motion.div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function VaultIA() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section
      id="vault"
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)',
        background: '#030308',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AtmosphereVault />

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Header isInView={isInView} />
        <SocialProof isInView={isInView} />
        
        <FAQList
          items={faqItems}
          openIndex={openIndex}
          setOpenIndex={setOpenIndex}
          isInView={isInView}
        />

        <CTAFinal isInView={isInView} />
      </div>
    </section>
  )
}
