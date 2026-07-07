'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MessageCircle, Send } from 'lucide-react'
import { Badge, Button, Card, Field, TextArea } from '@/components/ui'
import { CANAL_INSTAGRAM, contieneLink, formatFechaCorta } from '@/lib/leados/flow'
import { GUIA_OPENER } from '@/lib/leados/guidance-content'
import { registrarOpener } from '@/app/(protected)/setter/_actions/outreach.actions'
import { OpenerInputSchema } from '@/app/(protected)/setter/_actions/outreach.schemas'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { GuardrailRol } from '@/app/(protected)/setter/_components/guardrail-rol'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'

/**
 * El REGISTRO del opener (5.2, patrón 4.2/5.1): armar → copiar → mandar a mano
 * en Instagram → registrar, con el hard-block de link EN VIVO (el schema rebota
 * cualquier link, acá y server-side). Extraído SIN cambio de comportamiento del
 * `OpenerStep` para que el wizard y el manual (M4) sean dos presentaciones del
 * MISMO camino de escritura: misma action (`registrarOpener` — ownership, stage
 * y "un solo primer contacto" adentro), mismo schema (`OpenerInputSchema`,
 * A-25: el link deshabilita el botón Y muestra el motivo). El chrome (intro,
 * TeachPanel, canal, el bloque del Gem) vive afuera; acá solo el núcleo de
 * escritura con su guardrail de rol y la instrucción de envío por DM.
 */
export function OpenerForm({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const largo = mensaje.trim().length
  const pasadoDeLargo = largo > CANAL_INSTAGRAM.openerMaxCaracteres
  const tieneLink = contieneLink(mensaje)
  const listoParaCopiar = largo >= 10 && !tieneLink

  const registrar = () => {
    setError(null)
    const parsed = OpenerInputSchema.safeParse({ mensaje })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisá el texto del opener')
      return
    }
    startTransition(async () => {
      const result = await registrarOpener(leadId, parsed.data)
      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      toast.success(
        result.data.proximoToque
          ? `Opener registrado — próximo toque el ${formatFechaCorta(result.data.proximoToque)}.`
          : 'Opener registrado — quedó en seguimiento.',
      )
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <Field
        label="Tu opener (el texto que vas a pegar en Instagram)"
        required
        error={error ?? undefined}
        hint={
          pasadoDeLargo
            ? `Llevás ${largo} caracteres — el recomendado es menos de ${CANAL_INSTAGRAM.openerMaxCaracteres}. Podés seguir, pero corto convierte mejor.`
            : `Menos de ${CANAL_INSTAGRAM.openerMaxCaracteres} caracteres. Que nombre algo real del negocio.`
        }
      >
        <TextArea
          value={mensaje}
          onChange={(event) => setMensaje(event.target.value)}
          invalid={Boolean(error) || tieneLink}
          rows={4}
        />
      </Field>

      {tieneLink && (
        <div className="rounded-xl border border-rose-400/25 bg-rose-500/[0.06] p-3" role="alert">
          <p className="text-xs font-semibold text-rose-300">{GUIA_OPENER.gate.titulo}</p>
          <p className="mt-1 text-xs leading-relaxed text-rose-200/90">
            <LineaRicaText linea={GUIA_OPENER.gate.detalle} emphasisClassName="font-semibold text-rose-100" />
          </p>
        </div>
      )}

      {listoParaCopiar && (
        <CopyBlock
          titulo="Tu opener, listo para pegar"
          instruccion="Copialo, mandalo por DM en Instagram, y volvé a marcarlo acá."
          texto={mensaje.trim()}
        />
      )}

      <GuardrailRol compacto />

      <Button
        onClick={registrar}
        loading={isPending}
        disabled={tieneLink}
        icon={<Send size={14} strokeWidth={1.5} />}
      >
        Ya lo mandé en Instagram — registrar
      </Button>
    </div>
  )
}

/**
 * El opener ya registrado (el «Enviado») — la MISMA pieza para el wizard
 * (`contactos > 0`) y para M4 (consulta al volver desde el estado de espera).
 * Solo lectura: el primer contacto se registra una sola vez (la action rebota
 * un segundo).
 */
export function OpenerResumen({
  ultimoContacto,
  proximoToque,
}: {
  ultimoContacto: string | null
  proximoToque: string | null
}) {
  return (
    <Card variant="subtle" padding="lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <MessageCircle size={15} strokeWidth={1.5} className="text-zinc-500" />
          <h2 className="text-base font-semibold text-zinc-300">Primer contacto (opener)</h2>
        </div>
        <Badge tone="emerald" variant="soft">
          Enviado
        </Badge>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        Primer contacto registrado{ultimoContacto ? ` el ${formatFechaCorta(ultimoContacto)}` : ''}.
        {proximoToque ? ` Próximo toque: ${formatFechaCorta(proximoToque)}.` : ''}{' '}
        La conversación sigue en «Seguimiento».
      </p>
    </Card>
  )
}
