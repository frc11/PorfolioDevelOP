'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { ConfirmDialog } from '@/app/(protected)/admin/_components/confirm-dialog'
import { startImpersonationAction } from '../../_actions/client.actions'

interface ImpersonateButtonProps {
  clientId: string
  clientName: string
}

export function ImpersonateButton({
  clientId,
  clientName,
}: ImpersonateButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)

    try {
      await startImpersonationAction(clientId)
    } catch (error) {
      console.error('Impersonation failed', error)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/[0.06] px-3 py-2 text-sm text-amber-300 transition-colors hover:bg-amber-500/[0.12]"
      >
        <Eye className="h-4 w-4" strokeWidth={1.5} />
        Impersonar
      </button>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={`Impersonar a ${clientName}?`}
        description="Vas a entrar al dashboard como este cliente y ver lo que ve. Para salir, usa el boton de salida de impersonation arriba."
        confirmLabel="Impersonar"
        isPending={loading}
        variant="warning"
      />
    </>
  )
}
