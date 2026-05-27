'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// B14.5 — `global-error.tsx` se renderiza cuando el root layout mismo tira
// (errores tan tempranos que no hay layout que muestre). Sentry recomienda
// este archivo para capturar render errors del App Router que no caen en
// los otros boundaries. Resuelve el warning del build:
//   "It seems like you don't have a global error handler set up"
//
// Por convención de Next, debe renderizar <html> y <body> enteros porque
// REEMPLAZA al root layout cuando hay error en root.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Scrub-pii está en el beforeSend del init client — el error pasa por ahí.
    Sentry.captureException(error, {
      tags: { boundary: 'global-root' },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <html lang="es">
      <body className="bg-[#070709] text-white antialiased">
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-500/60 mb-4">
              Error crítico
            </p>
            <h2 className="text-3xl font-black tracking-tight mb-3">
              La aplicación no pudo cargar
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed mb-8">
              Algo falló al iniciar. Probá recargar; si persiste, contactanos
              y mencioná el código de referencia.
            </p>
            {error.digest && (
              <p className="mb-6 font-mono text-[10px] text-zinc-700">
                ref: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
