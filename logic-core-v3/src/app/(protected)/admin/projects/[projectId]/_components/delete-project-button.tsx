'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { AlertTriangle, LoaderCircle, Trash2 } from 'lucide-react'
import { deleteProjectAction } from '@/lib/actions/projects'
import { OverlayModal } from '../../_components/overlay-modal'

/**
 * S6 — Eliminar proyecto desde el detalle admin.
 *
 * Consume la action EXISTENTE `deleteProjectAction` (lib/actions/projects.ts):
 * guard `requireSuperAdmin()` + `redirect('/admin/projects')` server-side. No se
 * crea ni se edita ninguna action; acá solo va el botón + confirm. El submit del
 * `<form action={deleteProjectAction}>` dispara la action y su redirect (sin
 * router.push). El motivo de mantenerlo en un form nativo es justamente que el
 * redirect server-side de la action funcione con progressive enhancement.
 */
function ConfirmDeleteSubmit() {
  // Vive DENTRO del <form>, así `pending` refleja el submit de esta action.
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/15 px-4 py-2.5 text-sm font-medium text-rose-100 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
      )}
      Eliminar proyecto
    </button>
  )
}

type DeleteProjectButtonProps = {
  projectId: string
  projectName: string
}

export function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-500/15"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        Eliminar proyecto
      </button>

      <OverlayModal
        open={open}
        onClose={() => setOpen(false)}
        title="Eliminar proyecto"
        eyebrow="develOP / Proyectos"
        panelClassName="max-w-md"
      >
        <div className="mt-5 space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" strokeWidth={1.5} />
            <p>
              Se eliminará <span className="font-semibold">{projectName}</span> junto con sus
              tareas, hitos de pago, mantenimiento y registros de tiempo. El lead original no se
              modifica. Esta acción no se puede deshacer.
            </p>
          </div>

          <form action={deleteProjectAction} className="flex justify-end gap-3">
            <input type="hidden" name="projectId" value={projectId} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
            >
              Cancelar
            </button>
            <ConfirmDeleteSubmit />
          </form>
        </div>
      </OverlayModal>
    </>
  )
}
