'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, MessageCircle, Mail, QrCode } from 'lucide-react'

interface AskReviewSectionProps {
  placeId: string | null
}

export function AskReviewSection({ placeId }: AskReviewSectionProps) {
  const [copied, setCopied] = useState(false)

  if (!placeId) {
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
        }}
        className="p-6 flex items-center gap-4"
      >
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <QrCode size={18} strokeWidth={1.5} className="text-zinc-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-300">Link para pedir reseña</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Tu equipo de develOP debe configurar tu placeId. Hablá con ellos.
          </p>
        </div>
      </div>
    )
  }

  const reviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`

  function handleCopy() {
    void navigator.clipboard.writeText(reviewUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappText = encodeURIComponent(
    `¿Podés dejarnos una reseña en Google? Solo te lleva un minuto y nos ayuda mucho. ${reviewUrl}`,
  )
  const emailBody = encodeURIComponent(
    `Hola,\n\n¿Podés dejarnos una reseña en Google? Solo te lleva un minuto y nos ayuda mucho.\n\n${reviewUrl}\n\n¡Muchas gracias!`,
  )
  const emailSubject = encodeURIComponent('¿Podés dejarnos una reseña en Google?')

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
      }}
      className="p-6"
    >
      <p className="text-sm font-bold text-zinc-200 mb-5">Pedile reseñas a tus clientes</p>

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start">
        {/* QR Code */}
        <div
          className="flex items-center justify-center rounded-xl p-3 mx-auto sm:mx-0"
          style={{ background: '#ffffff', width: 'fit-content' }}
        >
          <QRCodeSVG value={reviewUrl} size={160} level="M" />
        </div>

        {/* Link + Actions */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">Link directo</p>
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="flex-1 text-xs text-zinc-400 truncate font-mono">{reviewUrl}</span>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all active:scale-95"
                style={
                  copied
                    ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {copied ? <Check size={12} strokeWidth={1.5} /> : <Copy size={12} strokeWidth={1.5} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">Compartir por</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://wa.me/?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
                style={{
                  background: 'rgba(37,211,102,0.12)',
                  border: '1px solid rgba(37,211,102,0.25)',
                  color: '#4ade80',
                }}
              >
                <MessageCircle size={13} strokeWidth={1.5} />
                WhatsApp
              </a>
              <a
                href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
                className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#a1a1aa',
                }}
              >
                <Mail size={13} strokeWidth={1.5} />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
