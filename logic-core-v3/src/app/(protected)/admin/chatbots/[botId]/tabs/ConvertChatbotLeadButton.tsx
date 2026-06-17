'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { convertChatbotLeadToOsLead } from '../../_actions/convert-chatbot-lead.actions'

export function ConvertChatbotLeadButton({
  leadId,
  convertedToOsLeadId,
}: {
  leadId: string
  convertedToOsLeadId: string | null
}) {
  const [pending, startTransition] = useTransition()
  // Feedback instantáneo tras convertir en esta sesión; la persistencia real
  // (tras recargar / sin email) la da convertedToOsLeadId desde la DB.
  const [justConverted, setJustConverted] = useState(false)
  const isConverted = convertedToOsLeadId != null || justConverted

  if (isConverted) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
        <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
        Ya convertido
      </span>
    )
  }

  function handleConvert() {
    startTransition(async () => {
      const result = await convertChatbotLeadToOsLead(leadId)
      if (result.success) {
        setJustConverted(true)
        toast.success('Lead convertido a Lead CRM')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      loading={pending}
      icon={<Sparkles className="h-4 w-4" strokeWidth={1.5} />}
      onClick={handleConvert}
      className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15"
    >
      Convertir a Lead CRM
    </Button>
  )
}
