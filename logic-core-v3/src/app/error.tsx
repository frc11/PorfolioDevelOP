'use client'

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
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
