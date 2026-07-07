'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LifeBuoy } from 'lucide-react'
import { Button, Field, Modal, TextArea } from '@/components/ui'
import { escalarConstruccion } from '@/app/(protected)/setter/_actions/dossier.actions'
import { EscalamientoInputSchema } from '@/app/(protected)/setter/_actions/dossier.schemas'

/**
 * B4 — Capa "si se traba": botón + modal de escalamiento a Franco. La action
 * persiste la marca en el dossier (Franco la ve en el panel) y además manda un
 * Telegram con el contexto del lead (negocio, etapa, draft si hay) + lo que el
 * setter describe. Si Telegram falla, el flujo sigue: el pedido ya quedó
 * registrado y el toast le dice al setter que escriba directo, nunca un error
 * crudo. `reescalar` solo cambia el rótulo cuando ya hay un escalamiento vigente.
 */
export function EscalarModal({
  leadId,
  reescalar = false,
  notaPrevia = null,
}: {
  leadId: string
  reescalar?: boolean
  /** A-23: la última nota de escalado. Al re-escalar prefillea el modal, así el
   * setter edita/completa sobre lo que ya avisó en vez de arrancar en blanco. */
  notaPrevia?: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [descripcion, setDescripcion] = useState(reescalar ? (notaPrevia ?? '') : '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const escalar = () => {
    const parsed = EscalamientoInputSchema.safeParse({ descripcion })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Contá qué te trabó')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await escalarConstruccion(leadId, parsed.data)
      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      setOpen(false)
      setDescripcion('')
      // La marca de escalado (`escaladoAt`) vive en las props que baja el server
      // component; sin refresh el banner "Ya avisaste a Franco" recién aparecía
      // tras un reload manual (hallazgo 5.5). Refrescamos para reflejar el estado
      // al instante — la action no revalida el path, el refresh cierra ese hueco.
      router.refresh()
      if (result.data.enviado) {
        toast.success(
          'Le avisamos a Franco por Telegram y quedó registrado en el panel. Seguí con otro lead mientras te responde.',
        )
      } else {
        toast.warning(
          'Guardamos tu pedido — Franco lo ve en el panel. El aviso por Telegram no salió: si es urgente, escribile directo.',
        )
      }
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<LifeBuoy size={13} strokeWidth={1.5} />}
        onClick={() => setOpen(true)}
      >
        {reescalar ? 'Avisar de nuevo' : 'Me trabé — avisar a Franco'}
      </Button>

      <Modal
        open={open}
        onClose={() => !isPending && setOpen(false)}
        title="Avisar a Franco que te trabaste"
        description="Va por Telegram con el contexto del lead (negocio, etapa y draft si hay). Vos solo contá el problema."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={escalar} loading={isPending}>
              Enviar aviso
            </Button>
          </>
        }
      >
        <Field
          label="¿Qué intentaste y dónde te trabaste?"
          required
          error={error ?? undefined}
          hint="Ej: 'Claude Design no me deja reemplazar las fotos del hero, probé subirlas dos veces'."
        >
          <TextArea
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            invalid={Boolean(error)}
            rows={4}
            autoFocus
          />
        </Field>
      </Modal>
    </>
  )
}
