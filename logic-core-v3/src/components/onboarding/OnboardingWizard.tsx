'use client'

import { useState, useRef, useEffect, useActionState, Fragment, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { saveOnboardingProfile } from '@/actions/onboarding-actions'
import { Handshake } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfettiParticle {
  x: number
  y: number
  size: number
  speedY: number
  drift: number
  angle: number
  spin: number
  color: string
}

// ─── Confetti canvas ──────────────────────────────────────────────────────────

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(true)

  // Stable callback so the effect doesn't re-run
  const startFade = useCallback(() => setVisible(false), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Track dimensions separately — reassigning canvas.width resets context state
    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const onResize = () => {
      const nw = window.innerWidth
      const nh = window.innerHeight
      if (nw !== w || nh !== h) {
        w = nw
        h = nh
        canvas.width = w
        canvas.height = h
      }
    }
    window.addEventListener('resize', onResize)

    const COLORS = [
      'rgba(6,182,212,0.65)',
      'rgba(16,185,129,0.65)',
      'rgba(139,92,246,0.55)',
      'rgba(245,158,11,0.55)',
      'rgba(255,255,255,0.45)',
    ]

    const particles: ConfettiParticle[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * 200,
      size: 3 + Math.random() * 5,
      speedY: 0.7 + Math.random() * 1.4,
      drift: (Math.random() - 0.5) * 1,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.06,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    let running = true
    let raf: number

    const tick = () => {
      if (!running) {
        // Clear on final frame so nothing is left painted
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.y += p.speedY
        p.x += p.drift
        p.angle += p.spin

        if (p.y > canvas.height + 20) {
          p.y = -10
          p.x = Math.random() * canvas.width
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      }

      raf = requestAnimationFrame(tick)
    }

    tick()

    // Fade out via CSS transition at 3.5s, stop drawing at 4.5s
    const fadeTimer = setTimeout(startFade, 3500)
    const stopTimer = setTimeout(() => { running = false }, 4500)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      clearTimeout(fadeTimer)
      clearTimeout(stopTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [startFade])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        opacity: visible ? 0.65 : 0,
        transition: 'opacity 1s ease-out',
      }}
    />
  )
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

const STEP_LABELS = ['Bienvenida', 'Tour', 'Tu perfil']

function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-10 flex items-start justify-center">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1
        const isActive = step === num
        const isDone = step > num

        return (
          <Fragment key={num}>
            {i > 0 && (
              <div
                className="mt-[13px] h-px w-10 transition-colors duration-500"
                style={{
                  backgroundColor: isDone
                    ? 'rgba(6,182,212,0.45)'
                    : 'rgba(255,255,255,0.07)',
                }}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  borderColor: isActive
                    ? 'rgba(6,182,212,1)'
                    : isDone
                      ? 'rgba(6,182,212,0.4)'
                      : 'rgba(255,255,255,0.1)',
                  backgroundColor: isActive
                    ? 'rgba(6,182,212,0.18)'
                    : isDone
                      ? 'rgba(6,182,212,0.09)'
                      : 'rgba(255,255,255,0.025)',
                  boxShadow: isActive
                    ? '0 0 14px rgba(6,182,212,0.45)'
                    : '0 0 0px rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.4 }}
                className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold"
              >
                <span
                  className={
                    isDone
                      ? 'text-cyan-400'
                      : isActive
                        ? 'text-cyan-300'
                        : 'text-zinc-600'
                  }
                >
                  {isDone ? '✓' : num}
                </span>
              </motion.div>
              <span
                className={`text-[10px] font-medium transition-colors duration-300 ${
                  isActive
                    ? 'text-cyan-400'
                    : isDone
                      ? 'text-zinc-500'
                      : 'text-zinc-700'
                }`}
              >
                {label}
              </span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

// ─── Slide variants ───────────────────────────────────────────────────────────

const slide = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: { opacity: 0, x: -24, transition: { duration: 0.25 } },
}

// ─── Step 1 — Bienvenida ──────────────────────────────────────────────────────

function Step1({ name, onNext }: { name: string; onNext: () => void }) {
  return (
    <motion.div
      key="step1"
      variants={slide}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center text-center"
    >
      <Confetti />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <div
          className="flex h-28 w-28 items-center justify-center rounded-full bg-white p-5"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.4), 0 0 48px rgba(255,255,255,0.08)' }}
        >
          <Image
            src="/logodevelOP.png"
            alt="develOP"
            width={80}
            height={80}
            className="h-full w-full object-contain"
            priority
          />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        className="mb-3 text-3xl font-bold tracking-tight text-white"
      >
        Bienvenido a tu portal,{' '}
        <span className="text-cyan-400">{name || 'cliente'}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.5 }}
        className="mb-10 max-w-sm text-sm leading-relaxed text-zinc-400"
      >
        Todo lo que necesitás para hacer crecer tu negocio, en un solo lugar.
      </motion.p>

      <motion.button
        onClick={onNext}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-8 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_rgba(6,182,212,0.3)] transition-shadow hover:shadow-[0_0_36px_rgba(6,182,212,0.45)]"
      >
        Empezar el tour
        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </motion.button>
    </motion.div>
  )
}

// ─── Step 2 — Tour de features ────────────────────────────────────────────────

const TOUR_CARDS = [
  {
    emoji: '📊',
    title: 'Medí tu crecimiento',
    desc: 'Analíticas, SEO y automatizaciones en tiempo real',
    border: 'border-cyan-500/20',
    glow: 'rgba(6,182,212,0.10)',
  },
  {
    emoji: '🤝',
    title: 'Comunicación directa',
    desc: 'Hablá con el equipo develOP cuando quieras',
    border: 'border-emerald-500/20',
    glow: 'rgba(16,185,129,0.10)',
  },
  {
    emoji: '🚀',
    title: 'Tu proyecto, en vivo',
    desc: 'Seguí cada etapa del desarrollo en tiempo real',
    border: 'border-violet-500/20',
    glow: 'rgba(139,92,246,0.10)',
  },
] as const

function Step2({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      key="step2"
      variants={slide}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full"
    >
      <h2 className="mb-6 text-center text-2xl font-bold text-white">
        ¿Qué encontrás en tu portal?
      </h2>

      <div className="mb-8 flex flex-col gap-3">
        {TOUR_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.13, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className={`flex items-start gap-4 rounded-xl border ${card.border} p-4`}
            style={{
              background: `radial-gradient(ellipse at 0% 50%, ${card.glow} 0%, rgba(255,255,255,0.02) 65%)`,
            }}
          >
            <span className="mt-0.5 text-2xl">{card.emoji}</span>
            <div>
              <p className="mb-0.5 font-semibold text-zinc-100">{card.title}</p>
              <p className="text-sm text-zinc-500">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        onClick={onNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.06] py-3 text-sm font-semibold text-zinc-200 transition-all hover:bg-white/[0.10] hover:text-white"
      >
        Continuar
        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </motion.button>
    </motion.div>
  )
}

// ─── Step 3 — Completar perfil ────────────────────────────────────────────────

function Step3({ companyName }: { companyName: string }) {
  const [error, formAction, isPending] = useActionState(saveOnboardingProfile, null)

  return (
    <motion.div
      key="step3"
      variants={slide}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full"
    >
      <h2 className="mb-2 text-2xl font-bold text-white">Completá tu perfil</h2>
      <p className="mb-6 text-sm text-zinc-500">
        Podés actualizar estos datos en cualquier momento desde el dashboard.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="companyName"
            className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500"
          >
            Nombre de empresa
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            defaultValue={companyName}
            placeholder="Mi empresa"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-all focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="logoUrl"
            className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500"
          >
            URL del logo{' '}
            <span className="font-normal normal-case tracking-normal text-zinc-700">
              (opcional)
            </span>
          </label>
          <input
            id="logoUrl"
            name="logoUrl"
            type="url"
            placeholder="https://tu-empresa.com/logo.png"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-all focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3"
          >
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={!isPending ? { scale: 1.015 } : {}}
          whileTap={!isPending ? { scale: 0.985 } : {}}
          className="group relative mt-2 w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
        >
          <span
            className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 ease-in-out group-hover:translate-x-full"
            style={{
              background:
                'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)',
            }}
          />
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  className="opacity-75"
                />
              </svg>
              Guardando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Ir a mi dashboard
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </span>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export function OnboardingWizard({ companyName }: { companyName: string }) {
  const [step, setStep] = useState(1)

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
      <Stepper step={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Step1 name={companyName} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step2 onNext={() => setStep(3)} />
        )}
        {step === 3 && (
          <Step3 companyName={companyName} />
        )}
      </AnimatePresence>
    </div>
  )
}
