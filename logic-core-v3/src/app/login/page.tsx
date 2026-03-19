'use client'

import { useActionState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { loginAction } from './actions'

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
}: {
  id: string
  label: string
  type: string
  placeholder: string
  autoComplete: string
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

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, null)

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
        <form action={formAction} className="flex flex-col gap-5">
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="tu@empresa.com"
            autoComplete="email"
          />

          <Field
            id="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {/* Error */}
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

          {/* Submit */}
          <motion.div variants={itemVariants} className="mt-1">
            <motion.button
              type="submit"
              disabled={isPending}
              whileHover={!isPending ? { scale: 1.015, filter: 'brightness(1.1)' } : {}}
              whileTap={!isPending ? { scale: 0.985 } : {}}
              className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold tracking-wide text-zinc-950 transition-opacity disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
              }}
            >
              {/* Shimmer overlay */}
              {!isPending && (
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
                  style={{
                    background:
                      'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                  }}
                />
              )}

              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      className="opacity-75"
                    />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </motion.button>
          </motion.div>
        </form>
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
