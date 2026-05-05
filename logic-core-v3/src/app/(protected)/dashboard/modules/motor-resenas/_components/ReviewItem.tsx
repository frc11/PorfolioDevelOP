'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Sparkles, Send, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { generateDraft, replyAction } from '@/components/dashboard/modules/motor-resenas/_actions'
import type { GBPReview } from '@/lib/integrations/google-business-profile'

interface ReviewItemProps {
  review: GBPReview
  organizationId: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={1.5}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}
        />
      ))}
    </div>
  )
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function ReviewItem({ review, organizationId }: ReviewItemProps) {
  const [draft, setDraft] = useState<string>('')
  const [showEditor, setShowEditor] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState(false)

  const [isGenerating, startGenerating] = useTransition()
  const [isPublishing, startPublishing] = useTransition()

  function handleGenerate() {
    setError(null)
    startGenerating(async () => {
      const result = await generateDraft({
        organizationId,
        rating: review.rating,
        reviewerName: review.reviewerName,
        reviewComment: review.comment,
      })
      if (result.ok) {
        setDraft(result.draft)
        setShowEditor(true)
      } else {
        setError(result.error)
      }
    })
  }

  function handlePublish() {
    if (!draft.trim()) return
    setError(null)
    startPublishing(async () => {
      const result = await replyAction({
        organizationId,
        reviewName: review.reviewName,
        comment: draft.trim(),
      })
      if (result.ok) {
        setPublished(true)
      } else {
        setError(result.error)
      }
    })
  }

  const initials = review.reviewerName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
      }}
      className="p-4 sm:p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-black tracking-wider text-zinc-300"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {initials || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-200 truncate">{review.reviewerName}</p>
            <p className="text-xs text-zinc-600">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 pl-12">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}

      {/* Existing reply */}
      {review.reply && (
        <div
          className="mt-4 ml-12 rounded-lg p-3"
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)',
          }}
        >
          <p className="text-xs font-semibold text-emerald-500 mb-1">Tu respuesta</p>
          <p className="text-xs text-zinc-400 leading-relaxed">{review.reply.comment}</p>
        </div>
      )}

      {/* Interactive section (only for unreplied) */}
      {!review.reply && (
        <div className="mt-4 pl-12">
          <AnimatePresence mode="wait">
            {published ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-sm text-emerald-400"
              >
                <CheckCircle2 size={15} strokeWidth={1.5} />
                Respuesta publicada en Google
              </motion.div>
            ) : (
              <motion.div key="editor" layout>
                {/* Generate button */}
                {!showEditor && (
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: 'rgba(139,92,246,0.12)',
                      border: '1px solid rgba(139,92,246,0.25)',
                      color: '#a78bfa',
                    }}
                  >
                    <Sparkles size={13} strokeWidth={1.5} className={isGenerating ? 'animate-pulse' : ''} />
                    {isGenerating ? 'Generando...' : 'Generar respuesta con IA'}
                  </button>
                )}

                {/* Draft editor */}
                {showEditor && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3"
                  >
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
                      placeholder="Escribí tu respuesta..."
                    />

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handlePublish}
                        disabled={isPublishing || !draft.trim()}
                        className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all disabled:opacity-50 active:scale-95"
                        style={{
                          background: 'rgba(6,182,212,0.15)',
                          border: '1px solid rgba(6,182,212,0.3)',
                          color: '#22d3ee',
                        }}
                      >
                        <Send size={12} strokeWidth={1.5} />
                        {isPublishing ? 'Publicando...' : 'Publicar respuesta'}
                      </button>

                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-400 transition-all hover:text-zinc-200 disabled:opacity-50"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <RefreshCw size={12} strokeWidth={1.5} className={isGenerating ? 'animate-spin' : ''} />
                        {isGenerating ? 'Regenerando...' : 'Regenerar'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 flex items-center gap-2 text-xs text-red-400"
                  >
                    <AlertCircle size={13} strokeWidth={1.5} />
                    {error}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
