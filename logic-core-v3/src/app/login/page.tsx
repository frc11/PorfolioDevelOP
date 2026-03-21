'use client'

import { useActionState, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { loginAction, googleSignInAction, magicLinkAction } from './actions'

// Three.js canvas — no SSR (browser-only)
const DotMatrix = dynamic(
  () => import('@/components/canvas/DotMatrix').then((m) => m.DotMatrix),
  { ssr: false }
)

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

// ─── Input component ──────────────────────────────────────────────────────────

function Field({
  id,
  label,
  type,
  placeholder,
  autoComplete,
  autoFocus,
}: {
  id: string
  label: string
  type: string
  placeholder: string
  autoComplete: string
  autoFocus?: boolean
}) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required
        placeholder={placeholder}
        className="
          w-full rounded-xl border border-white/[0.07] bg-white/[0.04]
          px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700
          outline-none transition-all duration-200
          focus:border-cyan-500/60 focus:bg-white/[0.06]
          focus:ring-2 focus:ring-cyan-500/20
        "
      />
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

function SubmitButton({ isPending, label, loadingLabel }: { isPending: boolean; label: string; loadingLabel: string }) {
  return (
    <motion.button
      type="submit"
      disabled={isPending}
      whileHover={!isPending ? { scale: 1.015, filter: 'brightness(1.1)' } : {}}
      whileTap={!isPending ? { scale: 0.985 } : {}}
      className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold tracking-wide text-zinc-950 transition-opacity disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
    >
      {!isPending && (
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)' }}
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
        {/* Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-cyan-400">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
      <Field
        id="magic-email"
        label="Tu email"
        type="email"
        placeholder="tu@empresa.com"
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
      {/* Brand */}
      <motion.div variants={itemVariants} className="mb-10 text-center">
        <p className="mb-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-cyan-500/70">
          Portal de clientes
        </p>

        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-white">devel</span>
          <span
            className="text-cyan-400"
            style={{ textShadow: '0 0 24px rgba(6,182,212,0.7)' }}
          >
            OP
          </span>
        </h1>

        <p className="mt-3 text-sm text-zinc-600">
          Acceso exclusivo para clientes develOP
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-white/[0.07] p-8"
        style={{
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow:
            '0 0 0 1px rgba(6,182,212,0.08), 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Google OAuth */}
        <form action={googleSignInAction} className="mb-5">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
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
            o ingresá con email
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Tab switcher */}
        <div className="mb-5 flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => setTab('password')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
              tab === 'password'
                ? 'bg-white/[0.08] text-zinc-100 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            Contraseña
          </button>
          <button
            type="button"
            onClick={() => setTab('magic')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
              tab === 'magic'
                ? 'bg-white/[0.08] text-zinc-100 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-400'
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
              <form action={formAction} className="flex flex-col gap-5">
                <Field id="email" label="Email" type="email" placeholder="tu@empresa.com" autoComplete="email" autoFocus />
                <Field id="password" label="Contraseña" type="password" placeholder="••••••••" autoComplete="current-password" />

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

                <div className="mt-1">
                  <SubmitButton isPending={isPending} label="Ingresar" loadingLabel="Ingresando..." />
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
      <motion.p
        variants={itemVariants}
        className="mt-8 text-center text-[11px] text-zinc-700"
      >
        develop.com.ar
      </motion.p>
    </motion.div>
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

      {/* Ambient glows */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 90% 50% at 50% -5%, rgba(6,182,212,0.12) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 40% at 85% 80%, rgba(16,185,129,0.06) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
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
