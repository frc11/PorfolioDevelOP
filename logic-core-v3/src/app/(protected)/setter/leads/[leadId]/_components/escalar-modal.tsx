'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { LifeBuoy } from 'lucide-react'
import { Button, Field, Modal } from '@/components/ui'
import { escalarConstruccion } from '@/app/(protected)/setter/_actions/dossier.actions'
import { EscalamientoInputSchema } from '@/app/(protected)/setter/_actions/dossier.schemas'
import { TextArea } from '@/app/(protected)/setter/_components/text-area'

/**
 * B4 — Capa "si se traba": botón + modal de escalamiento a Franco. Manda un
 * Telegram con el contexto del lead (negocio, etapa, draft si hay) y lo que
 * el setter describe. Si Telegram falla, el flujo sigue: el mensaje le dice
 * al setter qué hacer (escribir directo), nunca un error crudo.
 */
export function EscalarModal({ leadId }: { leadId: string }) {
  const [open, setOpen] = useState(false)
  const [descripcion, setDescripcion] = useState('')
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
      if (result.data.enviado) {
        toast.success('Le avisamos a Franco por Telegram. Seguí con otro lead mientras te responde.')
      } else {
        toast.warning(
          'No salió el aviso automático — escribile directo a Franco por WhatsApp con lo que contaste acá.',
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
        Me trabé — avisar a Franco
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
