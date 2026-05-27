'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // B12.1 — Logger oficial en vez de console.error pelado. Este es el
        // último fallback antes de que la app muera, así que conviene dejar
        // metadata explícita.
        logger.error(`[boundary:root] ${error.name}: ${error.message}`, {
            section: 'root',
            digest: error.digest,
            stack: error.stack,
        })

        // TODO(B14): cablear Sentry acá.
        //   Sentry.captureException(error, {
        //     tags: { boundary: 'root' },
        //     extra: { digest: error.digest },
        //   })
    }, [error])

    return (
        <main className="min-h-screen bg-[#070709] flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-500/60 mb-4">
                    Error del sistema
                </p>
                <h2 className="text-3xl font-black tracking-tight text-white mb-3">
                    Algo salió mal
                </h2>
                <p className="text-sm text-zinc-500 leading-relaxed mb-8">
                    Ocurrió un error inesperado. Podés intentar recargar la página o volver al inicio.
                </p>
                {error.digest && (
                    <p className="mb-6 font-mono text-[10px] text-zinc-700">
                        ref: {error.digest}
                    </p>
                )}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors"
                    >
                        Reintentar
                    </button>
                    <a
                        href="/"
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                        Volver al inicio
                    </a>
                </div>
            </div>
        </main>
    )
}
