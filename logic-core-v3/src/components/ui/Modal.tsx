'use client'

import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={closeOnBackdrop ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'flex max-h-[85vh] w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950',
              sizeClasses[size],
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
                <div>
                  {title && <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 transition-colors hover:bg-white/[0.05]"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">{children}</div>

            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-white/10 p-6">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
