'use client'

import { useTransition } from 'react'
import { sendTaskForApprovalAction } from '@/lib/actions/projects'
import { Send, Loader2, Clock } from 'lucide-react'

interface Props {
  taskId: string
  projectId: string
  approvalStatus: string | null
}

export function SendForApprovalButton({ taskId, projectId, approvalStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  if (approvalStatus === 'PENDING_APPROVAL') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">
        <Clock size={10} className="animate-pulse" />
        Pendiente
      </span>
    )
  }

  const handleClick = () => {
    const formData = new FormData()
    formData.set('taskId', taskId)
    formData.set('projectId', projectId)
    startTransition(() => sendTaskForApprovalAction(formData))
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.09] bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-zinc-400 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-400 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 size={10} className="animate-spin" />
      ) : (
        <Send size={10} />
      )}
      {approvalStatus === 'APPROVED' ? 'Reenviar' : 'Enviar para aprobación'}
    </button>
  )
}
