'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Card } from '@/components/ui'

const STORAGE_KEY = 'leados-onboarding-v1'

// Orientación, no un índice de pasos: la numeración real vive en el panel del
// lead (su stepper de etapas). Acá NO se numera ni se reenumera el flujo —
// eso duplicaría (y contradeciría) al stepper. Solo se explica cómo moverse.
const ORIENTACION = [
  {
    titulo: 'Trabajá tu cartera de arriba para abajo',
    detalle:
      'Cada grupo de abajo es una cola: arriba va lo más urgente. El marcador "De un vistazo" es solo lectura — para entrar a un lead, clickeá su card.',
  },
  {
    titulo: 'Abrí un lead y seguí el panel',
    detalle:
      'Adentro, el panel marca tu etapa y tu próximo paso. Andá de arriba para abajo: cada paso se abre cuando el anterior queda listo.',
  },
  {
    titulo: 'El estado del lead manda',
    detalle:
      'No salteás etapas ni elegís el orden: el flujo habilita cada cosa a su tiempo. Si un paso está apagado, todavía no es su momento.',
  },
] as const

/**
 * "Cómo funciona" descartable: estático, sin tour. Se persiste en
 * localStorage — se muestra solo hasta que el setter lo cierra.
 */
export function OnboardingHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== '1')
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // sin localStorage (modo privado): se oculta solo por esta sesión
    }
    setVisible(false)
  }

  return (
    <Card variant="default" padding="lg" className="relative overflow-hidden">
      {/* Guía, no promo: acento izquierdo en vez del gradiente que la hacía parecer un CTA. */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-cyan-400/60" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            Cómo funciona
          </p>
          <h2 className="mt-1 text-base font-semibold text-zinc-100">
            Cómo moverte en LeadOS
          </h2>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar la guía de inicio"
          className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ORIENTACION.map((item) => (
          <div
            key={item.titulo}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
          >
            <p className="text-xs font-semibold text-zinc-200">{item.titulo}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.detalle}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="mt-4 text-xs font-medium text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-200 hover:underline"
      >
        Entendido, no lo muestres más
      </button>
    </Card>
  )
}
