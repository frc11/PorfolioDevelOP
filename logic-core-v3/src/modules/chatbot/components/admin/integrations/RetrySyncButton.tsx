'use client'

import { useTransition } from 'react'
import { RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { retryCrmSync } from '@/modules/chatbot/server/admin/integrations/retryCrmSync'

interface RetrySyncButtonProps {
  organizationId: string
  leadId: string
}

export function RetrySyncButton({ organizationId, leadId }: RetrySyncButtonProps) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await retryCrmSync({ organizationId, leadId })
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
