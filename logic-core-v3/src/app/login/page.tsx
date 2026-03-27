'use client'

import { useActionState, useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { loginAction, googleSignInAction, magicLinkAction } from './actions'

// Three.js canvas — no SSR (browser-only)
const DotMatrix = dynamic(
  () => import('@/components/canvas/DotMatrix').then((m) => m.DotMatrix),
  { ssr: false }
)

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

// ─── Floating label input ─────────────────────────────────────────────────────

function FloatingField({
  id,
  label,
  type,
  autoComplete,
  autoFocus,
}: {
  id: string
  label: string
  type: string
  autoComplete: string
  autoFocus?: boolean
}) {
  const [focused, setFocused] = useState(autoFocus ?? false)
  const [hasValue, setHasValue] = useState(false)
  const isFloated = focused || hasValue

  return (
    <motion.div variants={itemVariants} className="relative">
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required
        placeholder=""
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false)
          setHasValue(e.target.value.length > 0)
        }}
        onChange={(e) => setHasValue(e.target.value.length > 0)}
        className={`
          w-full rounded-xl border bg-white/[0.04] px-4 pb-2 pt-5
          text-sm text-zinc-100 outline-none transition-all duration-200
          ${isFloated
            ? 'border-cyan-500/60 ring-2 ring-cyan-500/20'
            : 'border-white/[0.07] focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20'
          }
        `}
      />
      <label
        htmlFor={id}
        className={`
          pointer-events-none absolute left-4 leading-none transition-all duration-200
          ${isFloated
            ? 'top-[7px] text-[9px] font-semibold tracking-[0.14em] uppercase text-cyan-400/80'
            : 'top-[14px] text-sm text-zinc-500'
          }
        `}
      >
        {label}
      </label>
    </motion.div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" className="opacity-75" />
    </svg>
  )
}

// ─── Submit button ────────────────────────────────────────────────────────────

function SubmitButton({ isPending, label, loadingLabel }: {
  isPending: boolean
  label: string
  loadingLabel: string
}) {
  return (
    <motion.button
      type="submit"
      disabled={isPending}
      whileHover={!isPending ? { scale: 1.015 } : {}}
      whileTap={!isPending ? { scale: 0.985 } : {}}
      className="group relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold tracking-wide text-zinc-950 transition-opacity disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
    >
      {/* Shimmer sweep */}
      {!isPending && (
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 ease-in-out group-hover:translate-x-full"
          style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)' }}
        />
      )}
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner />
          {loadingLabel}
        </span>
      ) : label}
    </motion.button>
  )
}

// ─── Magic Link form ──────────────────────────────────────────────────────────

function MagicLinkForm() {
  const [state, formAction, isPending] = useActionState(magicLinkAction, null)
  const isSuccess = state === 'SUCCESS'

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] px-5 py-6 text-center"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-cyan-400">
            <path
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-cyan-300">Link generado</p>
        <p className="text-xs leading-relaxed text-zinc-500">
          La URL de verificación fue impresa en la{' '}
          <span className="font-mono text-zinc-400">consola del servidor</span>.
          <br />
          Copiala y pegala en el navegador para ingresar.
        </p>
      </motion.div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FloatingField
        id="magic-email"
        label="Tu email"
        type="email"
        autoComplete="email"
        autoFocus
      />

      {state && state !== 'SUCCESS' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3"
        >
          <p className="text-xs text-red-400">{state}</p>
        </motion.div>
      )}

      <SubmitButton isPending={isPending} label="Enviar Magic Link" loadingLabel="Generando link..." />
    </form>
  )
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, null)
  const [tab, setTab] = useState<'password' | 'magic'>('password')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10 w-full max-w-[400px]"
    >
      {/* Logo + Brand */}
      <motion.div variants={itemVariants} className="mb-10 flex flex-col items-center text-center">
        <p className="mb-5 text-[10px] font-semibold tracking-[0.25em] uppercase text-cyan-500/70">
          Portal de clientes
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-28 w-28 items-center justify-center rounded-full border border-white/70 bg-white shadow-[0_0_40px_rgba(255,255,255,0.08)]"
        >
          <Image
            src="/logodevelOP.png"
            alt="develOP"
            width={96}
            height={96}
            className="h-16 w-auto object-contain"
            priority
          />
        </motion.div>

        <p className="mt-4 text-sm text-zinc-600">
          Acceso exclusivo para clientes develOP
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-white/[0.08] p-8"
        style={{
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          boxShadow: [
            '0 0 0 1px rgba(6,182,212,0.07)',
            '0 32px 64px rgba(0,0,0,0.6)',
            '0 8px 24px rgba(0,0,0,0.4)',
            'inset 0 1px 0 rgba(255,255,255,0.07)',
          ].join(', '),
        }}
      >
        {/* Google OAuth */}
        <form action={googleSignInAction} className="mb-5">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.09] bg-white/[0.05] px-4 py-3 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.10] hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar con Google
          </button>
        </form>

        {/* Divider */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-zinc-600">
            o continuá con
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Tab switcher with sliding indicator */}
        <div className="relative mb-5 flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
          <motion.div
            className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-lg bg-white/[0.09]"
            animate={{ left: tab === 'password' ? '4px' : 'calc(50%)' }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          />
          <button
            type="button"
            onClick={() => setTab('password')}
            className={`relative z-10 flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition-colors duration-200 ${
              tab === 'password' ? 'text-zinc-100' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            Contraseña
          </button>
          <button
            type="button"
            onClick={() => setTab('magic')}
            className={`relative z-10 flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition-colors duration-200 ${
              tab === 'magic' ? 'text-zinc-100' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === 'password' ? (
            <motion.div
              key="password-tab"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              <form action={formAction} className="flex flex-col gap-4">
                <FloatingField id="email" label="Email" type="email" autoComplete="email" autoFocus />
                <FloatingField id="password" label="Contraseña" type="password" autoComplete="current-password" />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3"
                  >
                    <p className="text-xs text-red-400">{error}</p>
                  </motion.div>
                )}

                <div className="mt-1 flex flex-col gap-3">
                  <SubmitButton isPending={isPending} label="Ingresar" loadingLabel="Ingresando..." />
                  <p className="text-center">
                    <a
                      href="/forgot-password"
                      className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </p>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="magic-tab"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
            >
              <p className="mb-4 text-xs leading-relaxed text-zinc-600">
                Ingresá tu email y te enviamos un link de acceso de un solo uso. No necesitás contraseña.
              </p>
              <MagicLinkForm />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.div
        variants={itemVariants}
        className="mt-8 flex flex-col items-center gap-2"
      >
        <Image
          src="/logodevelOP.png"
          alt="develOP"
          width={64}
          height={16}
          className="h-4 w-auto object-contain opacity-[0.18]"
        />
        <p className="text-[11px] text-zinc-700">Powered by develOP</p>
      </motion.div>
    </motion.div>
  )
}

// ─── Ambient animated particle blobs ─────────────────────────────────────────

function AmbientParticles() {
  return (
    <>
      <style>{`
        @keyframes pf1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(40px,-30px) scale(1.06)}66%{transform:translate(-25px,20px) scale(0.96)}}
        @keyframes pf2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-35px,28px) scale(1.04)}70%{transform:translate(20px,-18px) scale(0.97)}}
        @keyframes pf3{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(28px,38px) scale(0.95)}75%{transform:translate(-32px,-22px) scale(1.05)}}
        @keyframes pf4{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(16px,-28px) scale(1.03)}}
      `}</style>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(6,182,212,0.9) 0%, transparent 70%)',
            top: '-25%', left: '-12%',
            filter: 'blur(90px)',
            opacity: 0.15,
            animation: 'pf1 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(16,185,129,0.9) 0%, transparent 70%)',
            bottom: '-18%', right: '-8%',
            filter: 'blur(80px)',
            opacity: 0.11,
            animation: 'pf2 24s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 420, height: 420,
            background: 'radial-gradient(circle, rgba(139,92,246,0.9) 0%, transparent 70%)',
            top: '55%', left: '28%',
            filter: 'blur(70px)',
            opacity: 0.09,
            animation: 'pf3 28s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(6,182,212,0.9) 0%, transparent 70%)',
            top: '25%', right: '10%',
            filter: 'blur(65px)',
            opacity: 0.08,
            animation: 'pf4 32s ease-in-out infinite',
          }}
        />
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080a0c] px-4">

      {/* DotMatrix background */}
      <div className="pointer-events-none fixed inset-0 opacity-20">
        <DotMatrix />
      </div>

      {/* Static ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 90% 50% at 50% -5%, rgba(6,182,212,0.10) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 40% at 85% 80%, rgba(16,185,129,0.05) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Animated particle blobs */}
      <AmbientParticles />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <LoginForm />
    </main>
  )
}
