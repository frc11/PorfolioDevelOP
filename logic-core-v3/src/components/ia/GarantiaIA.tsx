'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import {
  FileText,
  Lock,
  Settings2,
  ShieldCheck,
  UserRoundCheck,
  type LucideIcon,
} from 'lucide-react'

interface GuardrailFeature {
  icon: LucideIcon
  title: string
  description: string
}

interface OrbitalTrack {
  radius: number
  speed: number
  direction: 1 | -1
  strokeAlpha: number
  dots: Array<{
    offset: number
    size: number
  }>
}

interface OrbitalParticle {
  radius: number
  speed: number
  direction: 1 | -1
  offset: number
  size: number
}

interface LockGlyph {
  top?: string
  right?: string
  left?: string
  bottom?: string
  size: string
  rotate: number
  delay: number
  fromX: number
  fromY: number
  driftX: number
  driftY: number
  driftRotate: number
  opacity: number
  blur: string
}

const features: GuardrailFeature[] = [
  {
    icon: ShieldCheck,
    title: 'Solo responde lo que vos definis',
    description:
      'La IA solo conoce lo que le ensenas: tus precios, tus productos y tus politicas. No puede inventar informacion que no existe en tu negocio.',
  },
  {
    icon: UserRoundCheck,
    title: 'Deriva automatica a humanos',
    description:
      'Si la consulta supera su conocimiento, transfiere la conversacion a tu equipo al instante. Sin que el cliente note la diferencia.',
  },
  {
    icon: FileText,
    title: 'Todo queda registrado',
    description:
      'Cada conversacion queda guardada. Podes revisar que dijo la IA en cualquier momento y corregir si algo no esta bien.',
  },
  {
    icon: Settings2,
    title: 'Control total en tus manos',
    description:
      'Actualizas los datos de tu negocio cuando quieras y la IA incorpora los cambios en minutos. Vos decidis que sabe y que no.',
  },
]

const labels = [
  { text: 'Tus reglas', top: '10%', left: '5%' },
  { text: 'Tus precios', top: '10%', right: '5%' },
  { text: 'Sin inventar', bottom: '21%', left: '5%' },
  { text: 'Deriva a humanos', bottom: '21%', right: '5%' },
]

const orbitalTracks: OrbitalTrack[] = [
  {
    radius: 140,
    speed: 18,
    direction: 1,
    strokeAlpha: 0.15,
    dots: [
      { offset: 18, size: 3.8 },
      { offset: 188, size: 3.2 },
    ],
  },
  {
    radius: 112,
    speed: 13.5,
    direction: -1,
    strokeAlpha: 0.12,
    dots: [
      { offset: 74, size: 4.1 },
      { offset: 248, size: 3.4 },
    ],
  },
  {
    radius: 84,
    speed: 9.5,
    direction: 1,
    strokeAlpha: 0.1,
    dots: [
      { offset: 132, size: 3.3 },
      { offset: 312, size: 2.9 },
    ],
  },
]

const orbitalParticles: OrbitalParticle[] = orbitalTracks.flatMap((track) =>
  track.dots.map((dot) => ({
    radius: track.radius,
    speed: track.speed,
    direction: track.direction,
    offset: dot.offset,
    size: dot.size,
  })),
)

const orbitalTrackStartIndex = orbitalTracks.reduce<number[]>((indexes, track, i) => {
  if (i === 0) {
    indexes.push(0)
    return indexes
  }

  indexes.push(indexes[i - 1] + orbitalTracks[i - 1].dots.length)
  return indexes
}, [])

const LOCK_GLYPHS: LockGlyph[] = [
  {
    top: '-16%',
    left: '-7%',
    size: 'clamp(16rem,24vw,26rem)',
    rotate: -12,
    delay: 0,
    fromX: 280,
    fromY: 190,
    driftX: 14,
    driftY: -14,
    driftRotate: 2,
    opacity: 0.06,
    blur: '2px',
  },
  {
    top: '12%',
    right: '-10%',
    size: 'clamp(14rem,20vw,22rem)',
    rotate: 16,
    delay: 0.35,
    fromX: -220,
    fromY: 130,
    driftX: -10,
    driftY: 12,
    driftRotate: -2,
    opacity: 0.065,
    blur: '2px',
  },
  {
    bottom: '-20%',
    left: '18%',
    size: 'clamp(18rem,26vw,30rem)',
    rotate: -7,
    delay: 0.18,
    fromX: 140,
    fromY: -190,
    driftX: 10,
    driftY: -14,
    driftRotate: 1.8,
    opacity: 0.055,
    blur: '2px',
  },
  {
    bottom: '-15%',
    right: '-6%',
    size: 'clamp(15rem,22vw,24rem)',
    rotate: 9,
    delay: 0.5,
    fromX: -180,
    fromY: -170,
    driftX: -12,
    driftY: 10,
    driftRotate: -1.7,
    opacity: 0.06,
    blur: '2px',
  },
  {
    top: '44%',
    left: '5%',
    size: 'clamp(9rem,13vw,14rem)',
    rotate: -8,
    delay: 0.12,
    fromX: 210,
    fromY: -20,
    driftX: 8,
    driftY: -10,
    driftRotate: 1.3,
    opacity: 0.09,
    blur: '1px',
  },
  {
    top: '6%',
    right: '6%',
    size: 'clamp(10rem,14vw,16rem)',
    rotate: 24,
    delay: 0.26,
    fromX: -250,
    fromY: 170,
    driftX: -9,
    driftY: 9,
    driftRotate: -1.4,
    opacity: 0.092,
    blur: '1px',
  },
  {
    top: '20%',
    left: '26%',
    size: 'clamp(6rem,9vw,10rem)',
    rotate: -14,
    delay: 0.42,
    fromX: 120,
    fromY: 70,
    driftX: 6,
    driftY: -8,
    driftRotate: 1.1,
    opacity: 0.045,
    blur: '1.5px',
  },
]

function AtmosphereGarantia() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background:
            'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, rgba(5,150,105,0.04) 40%, transparent 65%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%',
          right: '-5%',
          width: '350px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 60%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </>
  )
}

function LeftPanel({
  isInView,
  isMobileL,
  isTouchLike,
}: {
  isInView: boolean
  isMobileL: boolean
  isTouchLike: boolean
}) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [centerActiveFeatures, setCenterActiveFeatures] = useState<number[]>([])
  const featureRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    if (!isTouchLike) {
      return
    }

    let rafId = 0
    const centerBand = 58

    const updateActiveByCenter = () => {
      const viewportCenterY = window.innerHeight / 2
      const nextActiveIndexes: number[] = []

      featureRefs.current.forEach((node, index) => {
        if (!node) {
          return
        }

        const rect = node.getBoundingClientRect()
        const intersectsCenterBand =
          rect.top <= viewportCenterY + centerBand && rect.bottom >= viewportCenterY - centerBand

        if (intersectsCenterBand) {
          nextActiveIndexes.push(index)
        }
      })

      setCenterActiveFeatures((prev) => {
        if (
          prev.length === nextActiveIndexes.length &&
          prev.every((value, idx) => value === nextActiveIndexes[idx])
        ) {
          return prev
        }

        return nextActiveIndexes
      })
    }

    const requestUpdate = () => {
      if (rafId) {
        return
      }
      rafId = requestAnimationFrame(() => {
        rafId = 0
        updateActiveByCenter()
      })
    }

    updateActiveByCenter()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [isTouchLike])

  return (
    <motion.div
      initial={{ opacity: 0, x: -32 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '100px',
          padding: '6px 16px',
          marginBottom: '24px',
          background: 'rgba(16,185,129,0.08)',
          alignSelf: isMobileL ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 8px rgba(34,197,94,0.8)',
          }}
        />
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.25em',
            color: '#34d399',
            fontWeight: 600,
          }}
        >
          INTELIGENCIA CONTROLADA
        </span>
      </motion.div>

      <h2
        style={{
          fontSize: 'clamp(28px,4vw,52px)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 0 16px',
          textAlign: isMobileL ? 'center' : 'left',
        }}
      >
        <span style={{ color: 'white' }}>Cero alucinaciones.</span>
        <br />
        <span
          style={{
            color: '#34d399',
            textShadow: '0 0 16px rgba(52,211,153,0.22)',
          }}
        >
          Control total.
        </span>
      </h2>

      <p
        style={{
          fontSize: 'clamp(14px,1.6vw,17px)',
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.75,
          margin: '0 0 clamp(28px,4vh,40px)',
          maxWidth: '480px',
          width: '100%',
          textAlign: isMobileL ? 'center' : 'left',
          marginLeft: isMobileL ? 'auto' : 0,
          marginRight: isMobileL ? 'auto' : 0,
          boxSizing: 'border-box',
        }}
      >
        Nuestros agentes no inventan respuestas. Los encapsulamos con reglas estrictas para que solo hablen en base a{' '}
        <span style={{ color: 'white' }}>tus manuales, tus precios y tus politicas.</span> Nada mas.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {features.map((feature, i) => (
          (() => {
            const isCenterActive = isTouchLike && centerActiveFeatures.includes(i)
            const isFeatureActive = hoveredFeature === i || isCenterActive

            return (
          <motion.div
            key={feature.title}
            ref={(node) => {
              featureRefs.current[i] = node
            }}
            onHoverStart={() => {
              if (!isTouchLike) {
                setHoveredFeature(i)
              }
            }}
            onHoverEnd={() => {
              if (!isTouchLike) {
                setHoveredFeature((current) => (current === i ? null : current))
              }
            }}
            whileHover={{ x: 4, scale: 1.01 }}
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              delay: 0.35 + i * 0.09,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: isMobileL ? 'column' : 'row',
              gap: '14px',
              alignItems: isMobileL ? 'center' : 'flex-start',
              borderRadius: '14px',
              padding: isMobileL ? '14px 12px' : '12px 14px',
              border:
                isFeatureActive
                  ? '1px solid rgba(16,185,129,0.38)'
                  : '1px solid rgba(255,255,255,0.06)',
              background:
                isFeatureActive
                  ? 'linear-gradient(140deg, rgba(16,185,129,0.14), rgba(4,15,20,0.42) 45%, rgba(255,255,255,0.02))'
                  : 'rgba(255,255,255,0.01)',
              boxShadow:
                isFeatureActive
                  ? '0 0 0 1px rgba(16,185,129,0.2), 0 0 26px rgba(16,185,129,0.24), inset 0 1px 0 rgba(255,255,255,0.08)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.04)',
              transition: 'border-color 180ms ease, background 180ms ease, box-shadow 180ms ease',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '14px',
                opacity: isFeatureActive ? 1 : 0,
                pointerEvents: 'none',
                background:
                  'radial-gradient(90% 110% at 0% 0%, rgba(16,185,129,0.22) 0%, transparent 62%), radial-gradient(85% 100% at 100% 100%, rgba(52,211,153,0.18) 0%, transparent 65%)',
                transition: 'opacity 180ms ease',
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                top: 8,
                bottom: 8,
                width: '2px',
                borderRadius: '2px',
                background:
                  isFeatureActive
                    ? 'linear-gradient(180deg, rgba(16,185,129,0.9), rgba(16,185,129,0.2), transparent)'
                    : 'transparent',
                transition: 'background 180ms ease',
              }}
            />
            <div
            style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background:
                  isFeatureActive
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(4,15,20,0.5))'
                    : 'rgba(16,185,129,0.1)',
                border:
                  isFeatureActive
                    ? '1px solid rgba(16,185,129,0.42)'
                    : '1px solid rgba(16,185,129,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
                color:
                  isFeatureActive ? '#6ee7b7' : 'rgba(220,252,231,0.9)',
                boxShadow:
                  isFeatureActive
                    ? '0 0 16px rgba(16,185,129,0.36), inset 0 0 10px rgba(16,185,129,0.2)'
                    : 'none',
                transition: 'all 180ms ease',
              }}
            >
              <feature.icon size={18} strokeWidth={2.2} />
            </div>

            <div style={{ textAlign: isMobileL ? 'center' : 'left', width: '100%', maxWidth: '100%' }}>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isFeatureActive ? '#d1fae5' : 'white',
                  margin: '0 0 3px',
                  textShadow:
                    isFeatureActive ? '0 0 14px rgba(16,185,129,0.35)' : 'none',
                  transition: 'color 180ms ease, text-shadow 180ms ease',
                }}
              >
                {feature.title}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color:
                    isFeatureActive ? 'rgba(220,252,231,0.82)' : 'rgba(255,255,255,0.42)',
                  margin: 0,
                  lineHeight: 1.55,
                  transition: 'color 180ms ease',
                  overflowWrap: 'anywhere',
                }}
              >
                {feature.description}
              </p>
            </div>
          </motion.div>
            )
          })()
        ))}
      </div>
    </motion.div>
  )
}

function RightPanel({
  isInView,
  isMobileL,
  isTouchLike,
}: {
  isInView: boolean
  isMobileL: boolean
  isTouchLike: boolean
}) {
  const reduced = useReducedMotion()
  const [isHovered, setIsHovered] = useState(false)
  const [isCenterActive, setIsCenterActive] = useState(false)
  const hoverRef = useRef(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const particleRefs = useRef<Array<SVGCircleElement | null>>([])

  useEffect(() => {
    hoverRef.current = isHovered || isCenterActive
  }, [isHovered, isCenterActive])

  useEffect(() => {
    if (!isTouchLike) {
      return
    }

    let rafId = 0
    const centerBand = 62

    const updateCenterState = () => {
      const node = panelRef.current
      if (!node) {
        return
      }

      const rect = node.getBoundingClientRect()
      const viewportCenterY = window.innerHeight / 2
      const intersectsCenterBand =
        rect.top <= viewportCenterY + centerBand && rect.bottom >= viewportCenterY - centerBand

      setIsCenterActive(intersectsCenterBand)
    }

    const requestUpdate = () => {
      if (rafId) {
        return
      }
      rafId = requestAnimationFrame(() => {
        rafId = 0
        updateCenterState()
      })
    }

    updateCenterState()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [isTouchLike])

  useEffect(() => {
    if (reduced) {
      return
    }

    let rafId = 0
    let lastTime = performance.now()
    let speedMultiplier = 1
    const angles = orbitalParticles.map((p) => p.offset)

    const updateParticles = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now

      const targetMultiplier = hoverRef.current ? 2.1 : 1
      speedMultiplier += (targetMultiplier - speedMultiplier) * Math.min(1, dt * 9)

      orbitalParticles.forEach((particle, index) => {
        const velocityDegPerSec = (360 / particle.speed) * particle.direction
        angles[index] = (angles[index] + velocityDegPerSec * speedMultiplier * dt + 360) % 360

        const radians = (angles[index] * Math.PI) / 180
        const x = 160 + particle.radius * Math.cos(radians)
        const y = 160 + particle.radius * Math.sin(radians)
        const node = particleRefs.current[index]

        if (node) {
          node.setAttribute('cx', x.toFixed(2))
          node.setAttribute('cy', y.toFixed(2))
        }
      })

      rafId = requestAnimationFrame(updateParticles)
    }

    rafId = requestAnimationFrame(updateParticles)
    return () => cancelAnimationFrame(rafId)
  }, [reduced])

  const isActive = isHovered || (isTouchLike && isCenterActive)

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => {
        if (!isTouchLike) {
          setIsHovered(true)
        }
      }}
      onHoverEnd={() => {
        if (!isTouchLike) {
          setIsHovered(false)
        }
      }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isMobileL ? '420px' : '560px',
        width: '100%',
        gap: '14px',
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          height: '390px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(16,185,129,0.16) 0%, rgba(5,150,105,0.08) 48%, transparent 72%)',
            filter: 'blur(26px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
          animate={
            reduced
              ? undefined
              : {
                  opacity: isActive ? 1 : 0.72,
                  scale: isActive ? 1.08 : 1,
                }
          }
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />

        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          style={{
            position: 'relative',
            zIndex: 1,
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
        {orbitalTracks.map((track, i) => (
          <g key={`track-${track.radius}-${i}`}>
            <circle
              cx="160"
              cy="160"
              r={track.radius}
              fill="none"
              stroke={`rgba(16,185,129,${track.strokeAlpha})`}
              strokeWidth="1"
              strokeDasharray="4 9"
            />
            {track.dots.map((dot, dotIndex) => {
              const currentIndex = orbitalTrackStartIndex[i] + dotIndex
              const radians = (dot.offset * Math.PI) / 180
              const initialX = 160 + track.radius * Math.cos(radians)
              const initialY = 160 + track.radius * Math.sin(radians)

              return (
                <circle
                  key={`dot-${track.radius}-${dotIndex}`}
                  ref={(node) => {
                    particleRefs.current[currentIndex] = node
                  }}
                  cx={initialX}
                  cy={initialY}
                  r={dot.size}
                  fill="rgba(16,185,129,0.9)"
                  style={{
                    filter: isHovered
                      ? 'drop-shadow(0 0 10px rgba(16,185,129,0.95))'
                      : 'drop-shadow(0 0 5px rgba(16,185,129,0.75))',
                  }}
                />
              )
            })}
          </g>
        ))}

        <motion.circle
          cx="160"
          cy="160"
          r="64"
          fill="rgba(16,185,129,0.08)"
          stroke="rgba(16,185,129,0.44)"
          strokeWidth="1.5"
          style={{ transformOrigin: '160px 160px' }}
          animate={
            reduced
              ? undefined
              : {
                  scale: isActive ? [1, 1.035, 1] : [1, 1.015, 1],
                }
          }
          transition={{
            duration: isActive ? 1.2 : 2.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />

        <motion.circle
          cx="160"
          cy="160"
          r="68"
          fill="none"
          stroke="rgba(16,185,129,0.24)"
          strokeWidth="9"
          style={{ filter: 'blur(5px)' }}
          animate={reduced ? undefined : { opacity: isActive ? [0.25, 0.55, 0.25] : [0.2, 0.36, 0.2] }}
          transition={{
            duration: isActive ? 1 : 1.9,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />

        <motion.g
          style={{ transformOrigin: '160px 160px' }}
          animate={
            reduced
              ? undefined
              : {
                  y: isActive ? [0, -2, 0] : [0, -0.6, 0],
                  scale: isActive ? [1, 1.04, 1] : [1, 1.015, 1],
                }
          }
          transition={
            reduced
              ? undefined
              : {
                  y: {
                    duration: isActive ? 1.1 : 2.2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  },
                  scale: {
                    duration: isActive ? 1 : 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  },
                }
          }
        >
          <rect
            x="140"
            y="156"
            width="40"
            height="30"
            rx="4"
            fill="rgba(16,185,129,0.17)"
            stroke="rgba(16,185,129,0.8)"
            strokeWidth="2"
          />
          <path
            d="M148 156 V150 A12 12 0 0 1 172 150 V156"
            fill="none"
            stroke="rgba(16,185,129,0.8)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle
            cx="160"
            cy="167"
            r="5"
            fill="rgba(16,185,129,0.34)"
            stroke="rgba(16,185,129,0.95)"
            strokeWidth="1.5"
          />
          <line
            x1="160"
            y1="172"
            x2="160"
            y2="178"
            stroke="rgba(16,185,129,0.95)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>
        </svg>

        {labels.map((label, i) => (
          <motion.div
            key={label.text}
            initial={{ opacity: 0, scale: 0.84 }}
            style={{
              position: 'absolute',
              top: label.top,
              bottom: label.bottom,
              left: label.left,
              right: label.right,
              background: 'rgba(4,15,20,0.75)',
              border: '1px solid rgba(16,185,129,0.26)',
              borderRadius: '100px',
              padding: '5px 12px',
              fontSize: isMobileL ? '10px' : '11px',
              fontWeight: 600,
              color: 'rgba(52,211,153,0.95)',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'none',
            }}
            animate={
              reduced
                ? isInView
                  ? { opacity: 1, scale: 1 }
                  : {}
                : isInView
                  ? {
                      opacity: 1,
                      scale: 1,
                      y: isActive ? [0, -1.5, 0] : [0, -0.5, 0],
                    }
                  : {}
            }
            transition={
              reduced
                ? { delay: 0.6 + i * 0.1, duration: 0.4 }
                : {
                    opacity: { delay: 0.6 + i * 0.1, duration: 0.4 },
                    scale: { delay: 0.6 + i * 0.1, duration: 0.4 },
                    y: {
                      duration: isActive ? 1.2 + i * 0.08 : 2 + i * 0.1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeInOut',
                      delay: 0.35 + i * 0.05,
                    },
                  }
            }
          >
            {'\u2713'} {label.text}
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.95, duration: 0.45 }}
        style={{
          position: 'relative',
          maxWidth: '520px',
          margin: 0,
          textAlign: 'center',
          fontSize: '12px',
          lineHeight: 1.55,
          color: 'rgba(167,243,208,0.72)',
          letterSpacing: '0.01em',
          pointerEvents: 'none',
          padding: isMobileL ? '0 4px' : 0,
        }}
      >
        El candado representa a la IA operando bajo parametros y reglas definidas por el cliente; los puntos orbitando
        muestran que cada respuesta gira siempre alrededor de esas directrices.
      </motion.p>
    </motion.div>
  )
}

export default function GarantiaIA() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const reduced = useReducedMotion()
  const easing = [0.16, 1, 0.3, 1] as const
  const [isMobileL, setIsMobileL] = useState(false)
  const [isTouchLike, setIsTouchLike] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const updateViewportFlags = () => {
      setIsMobileL(window.innerWidth <= 425)
      setIsTouchLike(window.innerWidth <= 1024)
    }

    updateViewportFlags()
    window.addEventListener('resize', updateViewportFlags)

    return () => {
      window.removeEventListener('resize', updateViewportFlags)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        padding: isMobileL
          ? 'clamp(72px,10vh,96px) 12px clamp(84px,11vh,112px)'
          : 'clamp(80px,12vh,140px) clamp(16px,5vw,80px)',
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {LOCK_GLYPHS.map((glyph, index) => (
        <motion.div
          key={`lock-glyph-${index}`}
          aria-hidden="true"
          initial={
            reduced
              ? { opacity: glyph.opacity, x: 0, y: 0, rotate: glyph.rotate }
              : { opacity: 0, x: glyph.fromX, y: glyph.fromY, rotate: glyph.rotate - 4 }
          }
          animate={
            isInView
              ? { opacity: glyph.opacity, x: 0, y: 0, rotate: glyph.rotate }
              : {}
          }
          transition={{
            duration: reduced ? 0 : 1.7,
            delay: reduced ? 0 : glyph.delay,
            ease: easing,
          }}
          style={{
            position: 'absolute',
            top: glyph.top,
            right: glyph.right,
            left: glyph.left,
            bottom: glyph.bottom,
            pointerEvents: 'none',
            zIndex: 0,
            userSelect: 'none',
          }}
        >
          <motion.div
            animate={
              reduced
                ? undefined
                : {
                    x: [0, glyph.driftX, 0],
                    y: [0, glyph.driftY, 0],
                    rotate: [glyph.rotate, glyph.rotate + glyph.driftRotate, glyph.rotate],
                  }
            }
            transition={{
              duration: reduced ? 0 : 9.5 + index * 1.2,
              repeat: reduced ? 0 : Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: reduced ? 0 : glyph.delay + 0.18,
            }}
            style={{ display: 'inline-flex' }}
          >
            <Lock
              strokeWidth={1.7}
              style={{
                width: glyph.size,
                height: glyph.size,
                color: `rgba(110,231,183,${glyph.opacity})`,
                filter: `blur(${glyph.blur}) drop-shadow(0 0 34px rgba(16,185,129,0.2))`,
              }}
            />
          </motion.div>
        </motion.div>
      ))}

      <AtmosphereGarantia />
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
            gap: 'clamp(32px,6vw,80px)',
            alignItems: 'center',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <LeftPanel isInView={isInView} isMobileL={isMobileL} isTouchLike={isTouchLike} />
          <RightPanel isInView={isInView} isMobileL={isMobileL} isTouchLike={isTouchLike} />
        </div>
      </div>
    </section>
  )
}
