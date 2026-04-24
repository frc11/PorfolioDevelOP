'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

interface IntegrationCard {
  id: number
  group: 'how' | 'benefit'
  badge: string
  title: string
  description: string
  details: string[]
  accent: string
  accentRgb: string
}

interface IntegrationStat {
  id: number
  value: string
  label: string
  accent: string
  accentRgb: string
}

const integrationStats: IntegrationStat[] = [
  {
    id: 0,
    value: '3 pasos',
    label: 'De consulta a accion',
    accent: '#34d399',
    accentRgb: '52,211,153',
  },
  {
    id: 1,
    value: '7-14 dias',
    label: 'Para salir en piloto',
    accent: '#2dd4bf',
    accentRgb: '45,212,191',
  },
  {
    id: 2,
    value: 'Hasta x3',
    label: 'Consultas atendidas',
    accent: '#22c55e',
    accentRgb: '34,197,94',
  },
]

const integrationCards: IntegrationCard[] = [
  {
    id: 0,
    group: 'how',
    badge: 'PASO 01 - ENTRADA',
    title: 'Captura consultas desde WhatsApp y tu web',
    description:
      'La IA recibe cada mensaje con contexto del canal y del servicio que busca el cliente.',
    details: ['Widget, boton o formulario conectado', 'Identifica origen y tipo de consulta', 'Ordena mensajes antes de responder'],
    accent: '#34d399',
    accentRgb: '52,211,153',
  },
  {
    id: 1,
    group: 'how',
    badge: 'PASO 02 - LOGICA',
    title: 'Consulta tus datos y aplica reglas del negocio',
    description:
      'Antes de contestar, valida precios, servicios, disponibilidad y politicas para evitar errores.',
    details: ['Base de conocimiento con tus fuentes', 'Reglas por rubro, zona o servicio', 'Derivacion a humano cuando aplica'],
    accent: '#2dd4bf',
    accentRgb: '45,212,191',
  },
  {
    id: 2,
    group: 'how',
    badge: 'PASO 03 - ACCION',
    title: 'Responde, ejecuta tareas y confirma resultados',
    description:
      'No solo conversa: tambien puede cotizar, agendar, crear lead y cerrar cada flujo con seguimiento.',
    details: ['Acciones conectadas a CRM y agenda', 'Notificaciones internas automaticas', 'Cierre con respuesta final al cliente'],
    accent: '#22c55e',
    accentRgb: '34,197,94',
  },
  {
    id: 3,
    group: 'benefit',
    badge: 'BENEFICIO 01 - VENTAS',
    title: 'Recuperas oportunidades que hoy se pierden',
    description:
      'Responder rapido y con informacion clara mejora la conversion desde el primer contacto.',
    details: ['Menos demoras en primera respuesta', 'Mas consultas calificadas para ventas', 'Seguimiento consistente hasta cierre'],
    accent: '#10b981',
    accentRgb: '16,185,129',
  },
  {
    id: 4,
    group: 'benefit',
    badge: 'BENEFICIO 02 - OPERACION',
    title: 'Baja carga operativa sin bajar calidad',
    description:
      'La IA absorbe consultas repetitivas para que tu equipo se enfoque en casos de mayor valor.',
    details: ['Menos tareas manuales por canal', 'Atencion continua fuera de horario', 'Escalado a humano solo cuando conviene'],
    accent: '#14b8a6',
    accentRgb: '20,184,166',
  },
  {
    id: 5,
    group: 'benefit',
    badge: 'BENEFICIO 03 - CONTROL',
    title: 'Tenes control total y mejora continua',
    description:
      'Cada respuesta queda registrada para medir resultados, ajustar reglas y escalar con menos riesgo.',
    details: ['Historial completo por conversacion', 'Metricas de tiempos y conversion', 'Iteraciones mensuales de performance'],
    accent: '#34d399',
    accentRgb: '52,211,153',
  },
]

const CARD_GROUPS: Array<{ id: IntegrationCard['group']; title: string; description: string }> = [
  {
    id: 'how',
    title: 'Como funciona la IA en tu negocio',
    description: 'Un flujo simple: entrada, logica y accion conectada con tu operacion real.',
  },
  {
    id: 'benefit',
    title: 'Que beneficios concretos te trae',
    description: 'Impacto directo en ventas, tiempo operativo y control de calidad comercial.',
  },
]

function AtmosphereGlows() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '860px',
          height: '520px',
          background:
            'radial-gradient(ellipse, rgba(52,211,153,0.075) 0%, rgba(16,185,129,0.03) 42%, transparent 72%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '38%',
          left: '-12%',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(45,212,191,0.045) 0%, transparent 65%)',
          filter: 'blur(84px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '35%',
          right: '-12%',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 65%)',
          filter: 'blur(84px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {[22, 46, 70].map((top, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${top}%`,
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(255,255,255,0.02)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}
    </>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <div style={{ textAlign: 'center', marginBottom: 'clamp(36px, 6vh, 60px)' }}>
      <motion.div
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay: 0.08 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(52,211,153,0.28)',
          color: '#34d399',
          padding: '6px 16px',
          borderRadius: '100px',
          fontSize: '11px',
          letterSpacing: '0.24em',
          fontWeight: 600,
          marginBottom: '22px',
          background: 'rgba(16,185,129,0.08)',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 9px rgba(52,211,153,0.9)',
            animation: 'pulseDot 1.7s infinite',
          }}
        />
        IA PARA NEGOCIOS REALES
      </motion.div>

      <motion.h2
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: 'clamp(30px, 4.5vw, 58px)',
          fontWeight: 900,
          color: 'white',
          margin: '0 0 14px',
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
        }}
      >
        Como funciona la IA
        <br />
        <span style={{ color: '#34d399', textShadow: '0 0 16px rgba(52,211,153,0.24)' }}>
          y por que conviene implementarla.
        </span>
      </motion.h2>

      <motion.p
        initial={reduced ? { opacity: 1 } : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.75, delay: 0.35 }}
        style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.52)',
          maxWidth: '720px',
          margin: '0 auto',
          lineHeight: 1.65,
        }}
      >
        Esta seccion te muestra de forma simple que hace la IA por dentro y que resultado concreto puede generar en tu negocio desde las primeras semanas.
      </motion.p>
    </div>
  )
}

function IntegrationStatsRow({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()
  const statRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const [centerStatIds, setCenterStatIds] = useState<number[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let rafId = 0
    const isTouchOrTablet = () => window.innerWidth <= 1024

    const updateCenterStat = () => {
      if (!isTouchOrTablet()) {
        setCenterStatIds((prev) => (prev.length === 0 ? prev : []))
        return
      }

      const viewportCenterY = window.innerHeight / 2
      const bandTop = viewportCenterY - 30
      const bandBottom = viewportCenterY + 30
      let hasAnyStatInCenterBand = false

      integrationStats.forEach((stat) => {
        const el = statRefs.current[stat.id]
        if (!el) return

        const rect = el.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight) return

        const intersectsCenterBand = rect.bottom >= bandTop && rect.top <= bandBottom
        if (intersectsCenterBand) {
          hasAnyStatInCenterBand = true
        }
      })

      const nextIds = hasAnyStatInCenterBand ? integrationStats.map((stat) => stat.id) : []
      setCenterStatIds((prev) => {
        if (prev.length === nextIds.length && prev.every((id, idx) => id === nextIds[idx])) {
          return prev
        }
        return nextIds
      })
    }

    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateCenterStat)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('orientationchange', scheduleUpdate)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('orientationchange', scheduleUpdate)
    }
  }, [])

  return (
    <div
      className="integration-stats-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: 'clamp(28px, 5vh, 40px)',
      }}
    >
      {integrationStats.map((stat, i) => (
        <motion.div
          key={stat.id}
          ref={(el) => {
            statRefs.current[stat.id] = el
          }}
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            opacity: { duration: 0.5, delay: 0.45 + i * 0.08, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 0.5, delay: 0.45 + i * 0.08, ease: [0.16, 1, 0.3, 1] },
          }}
          whileHover={
            reduced
              ? undefined
              : {
                y: -3,
                borderColor: `rgba(${stat.accentRgb},0.5)`,
                boxShadow: `0 10px 26px rgba(0,0,0,0.35), 0 0 26px rgba(${stat.accentRgb},0.16)`,
                transition: { duration: 0.07, ease: 'easeOut' },
              }
          }
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '14px',
            border:
              centerStatIds.includes(stat.id)
                ? `1px solid rgba(${stat.accentRgb},0.5)`
                : `1px solid rgba(${stat.accentRgb},0.24)`,
            background:
              centerStatIds.includes(stat.id)
                ? 'linear-gradient(145deg, rgba(10,20,24,0.88), rgba(7,8,14,0.96))'
                : 'linear-gradient(145deg, rgba(7,12,20,0.86), rgba(7,8,14,0.95))',
            padding: '12px 14px',
            boxShadow:
              centerStatIds.includes(stat.id)
                ? `0 10px 26px rgba(0,0,0,0.35), 0 0 26px rgba(${stat.accentRgb},0.16)`
                : 'none',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(120% 120% at 0% 0%, rgba(${stat.accentRgb},0.18) 0%, transparent 58%)`,
              opacity: 0.85,
            }}
          />
          <p
            style={{
              position: 'relative',
              margin: '0 0 4px',
              fontSize: '22px',
              fontWeight: 900,
              lineHeight: 1,
              color: stat.accent,
              fontFamily: 'monospace',
            }}
          >
            {stat.value}
          </p>
          <p style={{ position: 'relative', margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.52)' }}>{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

function IntegrationCardsGrid({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const [centerCardIds, setCenterCardIds] = useState<number[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let rafId = 0
    const isTouchOrTablet = () => window.innerWidth <= 1024

    const updateCenterCard = () => {
      if (!isTouchOrTablet()) {
        setCenterCardIds((prev) => (prev.length === 0 ? prev : []))
        return
      }

      const viewportCenterY = window.innerHeight / 2
      const bandTop = viewportCenterY - 24
      const bandBottom = viewportCenterY + 24
      const nextIds: number[] = []

      integrationCards.forEach((card) => {
        const el = cardRefs.current[card.id]
        if (!el) return

        const rect = el.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight) return

        const intersectsCenterBand = rect.bottom >= bandTop && rect.top <= bandBottom
        if (intersectsCenterBand) {
          nextIds.push(card.id)
        }
      })

      nextIds.sort((a, b) => a - b)
      setCenterCardIds((prev) => {
        if (prev.length === nextIds.length && prev.every((id, idx) => id === nextIds[idx])) return prev
        return nextIds
      })
    }

    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateCenterCard)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('orientationchange', scheduleUpdate)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('orientationchange', scheduleUpdate)
    }
  }, [])

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {CARD_GROUPS.map((group, groupIndex) => {
        const cards = integrationCards.filter((card) => card.group === group.id)

        return (
          <div key={group.id} style={{ display: 'grid', gap: '10px' }}>
            <motion.div
              initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                opacity: { duration: 0.46, delay: 0.48 + groupIndex * 0.2, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 0.46, delay: 0.48 + groupIndex * 0.2, ease: [0.16, 1, 0.3, 1] },
              }}
              style={{
                border: '1px solid rgba(52,211,153,0.22)',
                borderRadius: '12px',
                background: 'linear-gradient(140deg, rgba(16,185,129,0.12), rgba(7,8,14,0.84))',
                padding: '10px 12px',
              }}
            >
              <p
                style={{
                  margin: '0 0 2px',
                  fontSize: '12px',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#6ee7b7',
                }}
              >
                {group.title}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(220,252,231,0.7)', lineHeight: 1.5 }}>
                {group.description}
              </p>
            </motion.div>

            <div className="integration-cards-grid">
              {cards.map((card, i) => {
                const isHovered = hoveredCard === card.id || centerCardIds.includes(card.id)
                const cardDelay = 0.56 + groupIndex * 0.2 + i * 0.06

                return (
                  <motion.article
                    key={card.id}
                    ref={(el) => {
                      cardRefs.current[card.id] = el
                    }}
                    onHoverStart={() => setHoveredCard(card.id)}
                    onHoverEnd={() => setHoveredCard((current) => (current === card.id ? null : current))}
                    initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    whileHover={
                      reduced
                        ? undefined
                        : {
                          y: -5,
                          scale: 1.01,
                          transition: { duration: 0.07, ease: 'easeOut' },
                        }
                    }
                    transition={{
                      opacity: { duration: 0.48, delay: cardDelay, ease: [0.16, 1, 0.3, 1] },
                      y: { duration: 0.48, delay: cardDelay, ease: [0.16, 1, 0.3, 1] },
                    }}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      overflow: 'hidden',
                      borderRadius: '16px',
                      border: isHovered
                        ? `1px solid rgba(${card.accentRgb},0.52)`
                        : `1px solid rgba(${card.accentRgb},0.2)`,
                      background: isHovered
                        ? 'linear-gradient(145deg, rgba(10,20,24,0.88), rgba(7,8,14,0.96))'
                        : 'linear-gradient(145deg, rgba(8,10,18,0.84), rgba(7,8,14,0.94))',
                      padding: '18px',
                      boxShadow: isHovered
                        ? `0 14px 34px rgba(0,0,0,0.45), 0 0 32px rgba(${card.accentRgb},0.2), inset 0 1px 0 rgba(255,255,255,0.1)`
                        : '0 10px 26px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.05)',
                      transition: 'border-color 70ms ease-out, background 70ms ease-out, box-shadow 70ms ease-out',
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        opacity: isHovered ? 1 : 0.55,
                        background: `radial-gradient(120% 120% at 0% 0%, rgba(${card.accentRgb},0.24) 0%, transparent 62%), radial-gradient(110% 120% at 100% 100%, rgba(${card.accentRgb},0.16) 0%, transparent 65%)`,
                        transition: 'opacity 70ms ease-out',
                      }}
                    />

                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 18,
                        right: 18,
                        height: '1px',
                        background: `linear-gradient(90deg, transparent, rgba(${card.accentRgb},0.72), transparent)`,
                        opacity: isHovered ? 1 : 0.55,
                        transition: 'opacity 70ms ease-out',
                      }}
                    />

                    <p
                      style={{
                        position: 'relative',
                        margin: '0 0 10px',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        color: isHovered ? card.accent : 'rgba(167,243,208,0.8)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {card.badge}
                    </p>

                    <h3
                      style={{
                        position: 'relative',
                        margin: '0 0 8px',
                        fontSize: '19px',
                        lineHeight: 1.3,
                        fontWeight: 800,
                        letterSpacing: '-0.01em',
                        color: isHovered ? '#ecfdf5' : 'white',
                        textShadow: isHovered ? `0 0 18px rgba(${card.accentRgb},0.3)` : 'none',
                        transition: 'color 70ms ease-out, text-shadow 70ms ease-out',
                      }}
                    >
                      {card.title}
                    </h3>

                    <p
                      style={{
                        position: 'relative',
                        margin: '0 0 14px',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        color: isHovered ? 'rgba(220,252,231,0.86)' : 'rgba(255,255,255,0.56)',
                        transition: 'color 70ms ease-out',
                      }}
                    >
                      {card.description}
                    </p>

                    <ul
                      style={{
                        position: 'relative',
                        listStyle: 'none',
                        margin: 'auto 0 0',
                        padding: 0,
                        display: 'grid',
                        gap: '6px',
                      }}
                    >
                      {card.details.map((detail) => (
                        <li
                          key={detail}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '12px',
                            lineHeight: 1.5,
                            color: isHovered ? 'rgba(220,252,231,0.9)' : 'rgba(255,255,255,0.5)',
                            transition: 'color 70ms ease-out',
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              marginTop: '7px',
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: isHovered ? card.accent : `rgba(${card.accentRgb},0.55)`,
                              boxShadow: isHovered ? `0 0 10px rgba(${card.accentRgb},0.8)` : 'none',
                              flexShrink: 0,
                            }}
                          />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.article>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BottomNote({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
      style={{
        marginTop: 'clamp(22px, 3.6vh, 30px)',
        borderRadius: '14px',
        border: '1px solid rgba(52,211,153,0.28)',
        background: 'linear-gradient(145deg, rgba(16,185,129,0.12), rgba(7,8,14,0.84))',
        padding: '14px 16px',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'rgba(220,252,231,0.86)' }}>
        Empezamos con un piloto enfocado en consultas de alto impacto y luego escalamos a ventas, soporte y seguimiento comercial con metricas claras.
      </p>
    </motion.div>
  )
}

export default function DemoIA() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  return (
    <section
      ref={sectionRef}
      id="demo-ia"
      style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)',
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AtmosphereGlows />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Header isInView={isInView} />
        <IntegrationStatsRow isInView={isInView} />
        <IntegrationCardsGrid isInView={isInView} />
        <BottomNote isInView={isInView} />
      </div>

      <style>{`
        .integration-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        @media (max-width: 1024px) {
          .integration-cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .integration-cards-grid > article:last-child:nth-child(odd) {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 680px) {
          .integration-cards-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 480px) {
          .integration-stats-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @keyframes pulseDot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.55;
            transform: scale(0.88);
          }
        }
      `}</style>
    </section>
  )
}
