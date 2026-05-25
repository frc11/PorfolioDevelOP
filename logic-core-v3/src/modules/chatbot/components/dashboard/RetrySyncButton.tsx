'use client'

import { useTransition } from 'react'
import { RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { retryCrmSync } from '@/modules/chatbot/server/dashboard/retryCrmSync'

interface RetrySyncButtonProps {
  leadId: string
}

/**
 * B5.8 — Botón "Reintentar" para un attempt FAILED. Dispara retryCrmSync,
 * que crea un CrmSyncAttempt nuevo. La UI se revalida sola via revalidatePath
 * de la action.
 */
export function RetrySyncButton({ leadId }: RetrySyncButtonProps) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await retryCrmSync({ leadId })
      if (result.ok) {
        toast.success('Reintento disparado. En unos segundos se actualiza el historial.')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={pending}
      icon={
        <RotateCw
          className={`h-3.5 w-3.5 ${pending ? 'animate-spin' : ''}`}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      }
    >
      {pending ? 'Reintentando…' : 'Reintentar'}
    </Button>
  )
}
