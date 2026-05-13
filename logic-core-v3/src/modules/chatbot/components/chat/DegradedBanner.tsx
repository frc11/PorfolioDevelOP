'use client'

import { AlertCircle } from 'lucide-react'

interface DegradedBannerProps {
  whatsappNumber: string | null
  onWhatsappClick: () => void
}

export function DegradedBanner({ whatsappNumber, onWhatsappClick }: DegradedBannerProps) {
  return (
    <div className="mx-4 my-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-2">
      <AlertCircle size={14} strokeWidth={1.5} className="text-amber-400 mt-0.5 shrink-0" />
      <div className="flex-1">
        <div className="text-xs text-amber-200/90 leading-relaxed">
          Estamos atendiendo muchas consultas este mes.
        </div>
        {whatsappNumber && (
          <button
            onClick={onWhatsappClick}
            className="mt-2 text-xs underline text-amber-200 hover:text-amber-100"
          >
            Continuar por WhatsApp →
          </button>
        )}
      </div>
    </div>
  )
}
