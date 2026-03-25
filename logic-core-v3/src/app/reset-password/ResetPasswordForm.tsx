'use client'

import { useActionState } from 'react'
import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { resetPasswordAction } from './actions'

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

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  id,
  label,
  placeholder,
  autoComplete,
}: {
  id: string
  label: string
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
        type="password"
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

// ─── Form ─────────────────────────────────────────────────────────────────────

export function ResetPasswordForm({ token }: { token?: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null)

  const isSuccess = state?.type === 'success'
  const isInvalidToken = !token

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
          Creá una nueva contraseña
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
        {isInvalidToken ? (
          // ── Token ausente ──
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20"
              style={{ background: 'rgba(239,68,68,0.08)' }}
            >
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Enlace inválido</p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                Este enlace no es válido o ya expiró.
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="mt-1 text-xs text-cyan-500/70 transition-colors hover:text-cyan-400"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        ) : isSuccess ? (
          // ── Estado de éxito ──
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-5 py-2 text-center"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/20"
              style={{ background: 'rgba(6,182,212,0.1)' }}
            >
              <svg
                className="h-5 w-5 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-200">Contraseña actualizada</p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                Tu contraseña fue restablecida correctamente.
              </p>
            </div>

            <Link
              href="/login"
              className="mt-1 inline-block w-full rounded-xl py-3 text-center text-sm font-semibold tracking-wide text-zinc-950 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
            >
              Iniciar sesión
            </Link>
          </motion.div>
        ) : (
          // ── Formulario ──
          <form action={formAction} className="flex flex-col gap-5">
            {/* Token oculto */}
            <input type="hidden" name="token" value={token} />

            <Field
              id="password"
              label="Nueva contraseña"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />

            <Field
              id="confirm"
              label="Confirmar contraseña"
              placeholder="Repetí tu contraseña"
              autoComplete="new-password"
            />

            {/* Error */}
            {state?.type === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3"
              >
                <p className="text-xs text-red-400">{state.message}</p>
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
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
                    Actualizando...
                  </span>
                ) : (
                  'Restablecer contraseña'
                )}
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <Link
                href="/login"
                className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
              >
                Volver al inicio de sesión
              </Link>
            </motion.div>
          </form>
        )}
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
